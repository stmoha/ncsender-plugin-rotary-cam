/*
 * Rotary CAM project files (.rcam): one file with everything needed to pick a job up
 * again - the part, every setting, the tools it uses, and the G-code and toolpaths when
 * they've been generated.
 *
 * A .rcam is an ordinary ZIP archive (rename it .zip to look inside):
 *   project.json      what this is, the settings (job), the tools, what else is inside
 *   part.stl          the part as Rotary CAM uses it (binary STL, as drawn: before it's
 *                     placed on the rotary), so it opens fast and in any other program
 *   source/<name>     the file that was opened (STEP or STL), when it's at hand
 *   program.nc        the G-code, when it's been generated
 *   result.json/.bin  the toolpaths and previews behind that G-code (typed arrays go in
 *                     the .bin), so it shows and simulates without calculating again
 *
 * Works in the browser and in Node (tests). No dependencies: ZIP deflate through the
 * standard CompressionStream when it's there, stored otherwise.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RotaryCamProject = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var FORMAT = 'rotary-cam-project', FORMAT_VERSION = 1;
  var enc = new TextEncoder(), dec = new TextDecoder();

  // ---------------------------------------------------------------- zip
  var CRC = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(b) {
    var c = 0xffffffff;
    for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function canDeflate() { try { return typeof CompressionStream === 'function' && !!new CompressionStream('deflate-raw'); } catch (e) { return false; } }
  function pipe(bytes, stream) {
    var out = new Blob([bytes]).stream().pipeThrough(stream);
    return new Response(out).arrayBuffer().then(function (b) { return new Uint8Array(b); });
  }
  function deflate(bytes) { return pipe(bytes, new CompressionStream('deflate-raw')); }
  function inflate(bytes) { return pipe(bytes, new DecompressionStream('deflate-raw')); }

  // files: [{ name, data: Uint8Array | string }] -> Promise<Uint8Array>
  function zipWrite(files) {
    var useDeflate = canDeflate();
    return Promise.all(files.map(function (f) {
      var data = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
      var crc = crc32(data);
      if (!useDeflate || data.length < 64) return { name: f.name, data: data, comp: data, method: 0, crc: crc };
      return deflate(data).then(function (c) {
        return c.length < data.length ? { name: f.name, data: data, comp: c, method: 8, crc: crc } : { name: f.name, data: data, comp: data, method: 0, crc: crc };
      });
    })).then(function (ents) {
      var parts = [], central = [], off = 0;
      var d = new Date(), dt = ((d.getFullYear() - 1980) << 9 | (d.getMonth() + 1) << 5 | d.getDate()) & 0xffff, tm = (d.getHours() << 11 | d.getMinutes() << 5 | (d.getSeconds() >> 1)) & 0xffff;
      ents.forEach(function (e) {
        var nm = enc.encode(e.name), h = new DataView(new ArrayBuffer(30));
        h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, e.method, true);
        h.setUint16(10, tm, true); h.setUint16(12, dt, true); h.setUint32(14, e.crc, true);
        h.setUint32(18, e.comp.length, true); h.setUint32(22, e.data.length, true); h.setUint16(26, nm.length, true); h.setUint16(28, 0, true);
        parts.push(new Uint8Array(h.buffer), nm, e.comp);
        var c = new DataView(new ArrayBuffer(46));
        c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, e.method, true);
        c.setUint16(12, tm, true); c.setUint16(14, dt, true); c.setUint32(16, e.crc, true); c.setUint32(20, e.comp.length, true); c.setUint32(24, e.data.length, true);
        c.setUint16(28, nm.length, true); c.setUint32(42, off, true);
        central.push(new Uint8Array(c.buffer), nm);
        off += 30 + nm.length + e.comp.length;
      });
      var cdSize = central.reduce(function (a, p) { return a + p.length; }, 0);
      var end = new DataView(new ArrayBuffer(22));
      end.setUint32(0, 0x06054b50, true); end.setUint16(8, ents.length, true); end.setUint16(10, ents.length, true);
      end.setUint32(12, cdSize, true); end.setUint32(16, off, true);
      var all = parts.concat(central, [new Uint8Array(end.buffer)]), total = all.reduce(function (a, p) { return a + p.length; }, 0);
      var out = new Uint8Array(total), o = 0;
      all.forEach(function (p) { out.set(p, o); o += p.length; });
      return out;
    });
  }

  // Uint8Array -> Promise<{ name: Uint8Array }>
  function zipRead(bytes) {
    var dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), eocd = -1;
    for (var i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) return Promise.reject(new Error('not a Rotary CAM project (no ZIP directory)'));
    var n = dv.getUint16(eocd + 10, true), p = dv.getUint32(eocd + 16, true), jobs = [];
    for (var k = 0; k < n; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) return Promise.reject(new Error('damaged project file'));
      var method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), usize = dv.getUint32(p + 24, true);
      var nlen = dv.getUint16(p + 28, true), elen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), loc = dv.getUint32(p + 42, true);
      var name = dec.decode(bytes.subarray(p + 46, p + 46 + nlen));
      var start = loc + 30 + dv.getUint16(loc + 26, true) + dv.getUint16(loc + 28, true);
      jobs.push({ name: name, method: method, data: bytes.subarray(start, start + csize), usize: usize });
      p += 46 + nlen + elen + clen;
    }
    var out = {};
    return Promise.all(jobs.map(function (j) {
      if (/\/$/.test(j.name)) return null;
      if (j.method === 0) { out[j.name] = j.data; return null; }
      if (j.method !== 8) throw new Error(j.name + ': unsupported compression');
      return inflate(j.data).then(function (u) { out[j.name] = u; });
    })).then(function () { return out; });
  }

  // ---------------------------------------------------------------- typed arrays
  // JSON with every typed array moved into one binary blob (8-byte aligned)
  var TYPES = { Float32Array: Float32Array, Float64Array: Float64Array, Int32Array: Int32Array, Uint32Array: Uint32Array, Uint8Array: Uint8Array, Int16Array: Int16Array, Uint16Array: Uint16Array, Int8Array: Int8Array };
  function packTyped(obj) {
    var chunks = [], size = 0;
    var json = JSON.stringify(obj, function (k, v) {
      if (v && ArrayBuffer.isView(v) && !(v instanceof DataView)) {
        var t = v.constructor.name, o = size;
        var b = new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
        chunks.push({ o: o, b: b });
        size += Math.ceil(b.length / 8) * 8;
        return { $typed: t, o: o, n: v.length };
      }
      if (typeof v === 'number' && !isFinite(v)) return { $num: String(v) };
      return v;
    });
    var bin = new Uint8Array(size);
    chunks.forEach(function (c) { bin.set(c.b, c.o); });
    return { json: json, bin: bin };
  }
  function unpackTyped(json, bin) {
    var buf = bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength);
    return JSON.parse(json, function (k, v) {
      if (v && typeof v === 'object' && v.$typed && TYPES[v.$typed]) { var T = TYPES[v.$typed]; return new T(buf.slice(v.o, v.o + v.n * T.BYTES_PER_ELEMENT)); }
      if (v && typeof v === 'object' && v.$num !== undefined && Object.keys(v).length === 1) return Number(v.$num);
      return v;
    });
  }

  // ---------------------------------------------------------------- STL
  function stlFromTris(tris, header) {
    var n = tris.length / 9, buf = new ArrayBuffer(84 + n * 50), dv = new DataView(buf), u8 = new Uint8Array(buf);
    u8.set(enc.encode(String(header || 'Rotary CAM part').slice(0, 79)), 0);
    dv.setUint32(80, n, true);
    for (var i = 0; i < n; i++) {
      var o = 84 + i * 50, t = i * 9;
      var ax = tris[t + 3] - tris[t], ay = tris[t + 4] - tris[t + 1], az = tris[t + 5] - tris[t + 2];
      var bx = tris[t + 6] - tris[t], by = tris[t + 7] - tris[t + 1], bz = tris[t + 8] - tris[t + 2];
      var nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx, l = Math.hypot(nx, ny, nz) || 1;
      dv.setFloat32(o, nx / l, true); dv.setFloat32(o + 4, ny / l, true); dv.setFloat32(o + 8, nz / l, true);
      for (var k = 0; k < 9; k++) dv.setFloat32(o + 12 + 4 * k, tris[t + k], true);
    }
    return u8;
  }

  // ---------------------------------------------------------------- project
  // p: { name, tris (raw, as drawn), source: { name, bytes } | null, job, tools: [...],
  //      program: { gcode, ... } | null, result: { plan, maps, program, seconds, warnings } | null,
  //      app: 'Rotary CAM x.y.z', units }
  function save(p) {
    var files = [], meta = {
      format: FORMAT, version: FORMAT_VERSION, app: p.app || 'Rotary CAM', saved: new Date().toISOString(),
      units: p.units || 'mm',
      part: { name: p.name || 'part', file: 'part.stl', triangles: p.tris.length / 9, solids: p.solids || 1, skipped: p.skipped || 0 },
      job: p.job, tools: p.tools || []
    };
    files.push({ name: 'part.stl', data: stlFromTris(p.tris, 'Rotary CAM: ' + (p.name || 'part')) });
    if (p.source && p.source.bytes && p.source.bytes.length) {
      meta.part.source = 'source/' + String(p.source.name || p.name || 'part').replace(/[\\/]/g, '_');
      files.push({ name: meta.part.source, data: p.source.bytes });
    }
    if (p.result && p.result.program) {
      var r = p.result, prog = r.program;
      meta.program = { file: 'program.nc', name: p.programName || 'program.nc', lines: prog.lines, minutes: prog.minutes, seconds: r.seconds };
      files.push({ name: 'program.nc', data: prog.gcode });
      var slim = { plan: r.plan, maps: r.maps ? { roughZ: r.maps.roughZ, finZ: r.maps.finZ, finRefined: r.maps.finRefined } : null, program: Object.assign({}, prog, { gcode: undefined }), seconds: r.seconds, warnings: r.warnings || [], left: r.left || null };
      var pk = packTyped(slim);
      files.push({ name: 'result.json', data: pk.json }, { name: 'result.bin', data: pk.bin });
      meta.result = { json: 'result.json', bin: 'result.bin' };
    }
    files.unshift({ name: 'project.json', data: JSON.stringify(meta, null, 2) });
    return zipWrite(files);
  }

  function parseStl(u8) {
    var buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength), dv = new DataView(buf), n = dv.getUint32(80, true);
    if (84 + n * 50 !== u8.length) throw new Error('part.stl is damaged');
    var t = new Float32Array(n * 9);
    for (var i = 0; i < n; i++) for (var k = 0; k < 9; k++) t[i * 9 + k] = dv.getFloat32(84 + i * 50 + 12 + 4 * k, true);
    return t;
  }

  // bytes -> Promise<{ meta, name, tris, source, job, tools, result | null }>
  function load(bytes) {
    return zipRead(bytes).then(function (f) {
      if (!f['project.json']) throw new Error('not a Rotary CAM project (no project.json inside)');
      var meta = JSON.parse(dec.decode(f['project.json']));
      if (meta.format !== FORMAT) throw new Error('not a Rotary CAM project');
      if (meta.version > FORMAT_VERSION) throw new Error('this project was saved by a newer Rotary CAM (' + (meta.app || 'format ' + meta.version) + '); update the plugin to open it');
      var part = f[meta.part && meta.part.file || 'part.stl'];
      if (!part) throw new Error('the project has no part in it');
      var out = { meta: meta, name: meta.part.name, tris: parseStl(part), solids: meta.part.solids || 1, skipped: meta.part.skipped || 0, job: meta.job, tools: meta.tools || [], result: null, source: null };
      if (meta.part.source && f[meta.part.source]) out.source = { name: meta.part.source.replace(/^source\//, ''), bytes: f[meta.part.source] };
      if (meta.result && f[meta.result.json] && f[meta.result.bin]) {
        out.result = unpackTyped(dec.decode(f[meta.result.json]), f[meta.result.bin]);
        if (f['program.nc'] && out.result.program) out.result.program.gcode = dec.decode(f['program.nc']);
      }
      return out;
    });
  }

  // a ZIP whose first entry is project.json (cheap check on the first bytes)
  function looksLikeProject(bytes) {
    return bytes.length > 30 && bytes[0] === 0x50 && bytes[1] === 0x4b && dec.decode(bytes.subarray(30, 42)) === 'project.json';
  }

  return { FORMAT: FORMAT, FORMAT_VERSION: FORMAT_VERSION, save: save, load: load, looksLikeProject: looksLikeProject,
    zipWrite: zipWrite, zipRead: zipRead, packTyped: packTyped, unpackTyped: unpackTyped, stlFromTris: stlFromTris, crc32: crc32 };
});
