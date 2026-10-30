/*
 * Rotary CAM worker - drop-cutter around the rotary axis with OpenCAMLib (WebAssembly).
 *
 * For each A angle: rotate the part the way the rotary would, keep the triangles
 * under the cutter's footprint, and drop the tools straight down at Y=0. The tool-tip
 * Z that comes back is exactly the Z for that A in the G-code.
 *
 * Runs as a Web Worker in the plugin dialog. Also loadable in Node for tests:
 *   require('./cam-worker.js').computeAngle(ocl, tris, job, plan, j)
 */
(function () {
  'use strict';
  var NO_CONTACT = -1.0e6;
  var sliceBuf = null;

  function writeSliceSTL(ocl, rot, keep, count) {
    var size = 84 + count * 50;
    if (!sliceBuf || sliceBuf.byteLength < size) sliceBuf = new ArrayBuffer(Math.ceil(size * 1.25));
    var dv = new DataView(sliceBuf, 0, size);
    dv.setUint32(80, count, true);
    var o = 84;
    for (var t = 0; t < keep.length; t++) {
      var i = keep[t] * 9;
      dv.setFloat32(o, 0, true); dv.setFloat32(o + 4, 0, true); dv.setFloat32(o + 8, 0, true);
      for (var k = 0; k < 9; k++) dv.setFloat32(o + 12 + 4 * k, rot[i + k], true);
      dv.setUint16(o + 48, 0, true);
      o += 50;
    }
    try { ocl.FS_unlink('/slice.stl'); } catch (e) {}
    ocl.FS_createDataFile('/', 'slice.stl', new Uint8Array(sliceBuf, 0, size), true, true, true);
  }

  // one batch drop at (x, y) pairs, x shifted by dx
  function dropBatch(ocl, surf, cutter, xy, dx) {
    var n = xy.length / 2, bdc = new ocl.BatchDropCutter();
    bdc.setSTL(surf);
    bdc.setCutter(cutter);
    for (var i = 0; i < n; i++) {
      var cp = new ocl.CLPoint(xy[2 * i] + dx, xy[2 * i + 1], NO_CONTACT);
      bdc.appendPoint(cp);
      cp.delete();
    }
    bdc.run();
    var res = bdc.getCLPoints();
    var z = new Float64Array(n);
    for (var q = 0; q < n; q++) {
      var p = res.get(q);
      z[q] = p.z <= NO_CONTACT + 1 ? NaN : p.z;
      p.delete();
    }
    res.delete();
    bdc.delete();
    return z;
  }
  // A cutter is { c: OpenCAMLib cutter, tip?: plain ball of the tip }. OpenCAMLib's
  // ball+cone cutter now and then misses a contact at one exact spot (seen at the join of
  // ball and cone), so a tapered tool takes the highest of: itself, itself 1 micron over,
  // and its own ball tip on its own (the tool contains its tip, so that's a floor).
  function dropXYs(ocl, surf, cutter, xy) {
    var z = dropBatch(ocl, surf, cutter.c, xy, 0);
    if (!cutter.tip) return z;
    [dropBatch(ocl, surf, cutter.c, xy, 1e-3), dropBatch(ocl, surf, cutter.tip, xy, 0)].forEach(function (o) {
      for (var i = 0; i < z.length; i++) if (isFinite(o[i]) && !(z[i] >= o[i])) z[i] = o[i];
    });
    return z;
  }
  // The rotary passes: at Y0, tip never below the axis. Only the part above the axis's
  // height is loaded (see computeAngle), so past the axis the tool couldn't see what's
  // there; anything beyond the axis at this angle is cut from the other side, 180 deg round.
  function dropAll(ocl, surf, cutter, xs) {
    var xy = new Float64Array(2 * xs.length);
    for (var i = 0; i < xs.length; i++) xy[2 * i] = xs[i];
    var z = dropXYs(ocl, surf, cutter, xy);
    for (i = 0; i < z.length; i++) if (z[i] < 0) z[i] = 0;
    return z;
  }

  // The surface the tool sees with the part turned to angle a (null if nothing is there)
  function surfaceAt(ocl, tris, rot, job, halfW, a) {
    var t = a * job.a_sign * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
    var n = tris.length / 9, w = halfW + 0.05, keep = [];
    for (var i = 0; i < n; i++) {
      var ymin = Infinity, ymax = -Infinity, zmax = -Infinity;
      for (var v = 0; v < 3; v++) {
        var b = i * 9 + v * 3, y = tris[b + 1], z = tris[b + 2];
        var yr = y * c - z * s, zr = y * s + z * c;
        rot[b] = tris[b]; rot[b + 1] = yr; rot[b + 2] = zr;
        if (yr < ymin) ymin = yr;
        if (yr > ymax) ymax = yr;
        if (zr > zmax) zmax = zr;
      }
      if (ymax >= -w && ymin <= w && zmax > 0) keep.push(i);
    }
    if (!keep.length) return null;
    writeSliceSTL(ocl, rot, keep, keep.length);
    var surf = new ocl.STLSurf();
    var reader = new ocl.STLReader('/slice.stl', surf);
    reader.delete();
    return surf;
  }

  // Finish-tool drops at one arbitrary angle (refinement)
  function probe(ocl, tris, rot, job, plan, a, xs, cutters) {
    var surf = surfaceAt(ocl, tris, rot, job, plan.halfW, a);
    if (!surf) return new Float64Array(xs.length).fill(NaN);
    var z = dropAll(ocl, surf, cutters.finish, xs);
    surf.delete();
    return z;
  }

  // Indexed (3+1): A locked at a, the ball dropped at machine (x, y) pairs. Only the
  // triangles under the patch are kept; nothing is dropped below the axis on purpose,
  // so every triangle counts whatever its height.
  function dropXY(ocl, tris, rot, job, a, xy, cutter, R) {
    var t = a * job.a_sign * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
    var xa = Infinity, xb = -Infinity, ya = Infinity, yb = -Infinity, q;
    for (q = 0; q < xy.length; q += 2) { if (xy[q] < xa) xa = xy[q]; if (xy[q] > xb) xb = xy[q]; if (xy[q + 1] < ya) ya = xy[q + 1]; if (xy[q + 1] > yb) yb = xy[q + 1]; }
    var w = R + 0.05, n = tris.length / 9, keep = [];
    for (var i = 0; i < n; i++) {
      var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (var v = 0; v < 3; v++) {
        var b = i * 9 + v * 3, y = tris[b + 1], z = tris[b + 2], yr = y * c - z * s;
        rot[b] = tris[b]; rot[b + 1] = yr; rot[b + 2] = y * s + z * c;
        if (tris[b] < x0) x0 = tris[b]; if (tris[b] > x1) x1 = tris[b];
        if (yr < y0) y0 = yr; if (yr > y1) y1 = yr;
      }
      if (x1 >= xa - w && x0 <= xb + w && y1 >= ya - w && y0 <= yb + w) keep.push(i);
    }
    var out = new Float64Array(xy.length / 2).fill(NaN);
    if (!keep.length) return out;
    writeSliceSTL(ocl, rot, keep, keep.length);
    var surf = new ocl.STLSurf();
    var reader = new ocl.STLReader('/slice.stl', surf);
    reader.delete();
    out = dropXYs(ocl, surf, cutter, xy);
    surf.delete();
    return out;
  }

  // rot: scratch Float32Array same size as tris
  function computeAngle(ocl, tris, rot, job, plan, j, cutters) {
    var a = plan.angles[j];
    var t = a * job.a_sign * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
    var n = tris.length / 9, w = plan.halfW + 0.05;
    var keep = [];
    for (var i = 0; i < n; i++) {
      var ymin = Infinity, ymax = -Infinity, zmax = -Infinity;
      for (var v = 0; v < 3; v++) {
        var b = i * 9 + v * 3;
        var y = tris[b + 1], z = tris[b + 2];
        var yr = y * c - z * s, zr = y * s + z * c;
        rot[b] = tris[b]; rot[b + 1] = yr; rot[b + 2] = zr;
        if (yr < ymin) ymin = yr;
        if (yr > ymax) ymax = yr;
        if (zr > zmax) zmax = zr;
      }
      if (ymax >= -w && ymin <= w && zmax > 0) keep.push(i);
    }
    var out = { j: j, kept: keep.length };
    if (!keep.length) {
      if (plan.roughX) out.rough = new Float64Array(plan.roughX.length).fill(NaN);
      if (plan.finNrev !== undefined) out.fin = new Float64Array(plan.finNrev + 2).fill(NaN);
      return out;
    }
    // roughing works against the part and tenons only; the uncut-stock walls (triangles from
    // plan.wallTri on, there for a tapered tool) are for finishing
    var wallTri = plan.wallTri || n, keepR = keep;
    if (wallTri < n) keepR = keep.filter(function (i) { return i < wallTri; });
    var surf = null;
    if (cutters.rough && keepR !== keep) {
      if (keepR.length) {
        writeSliceSTL(ocl, rot, keepR, keepR.length);
        var surfR = new ocl.STLSurf(), readerR = new ocl.STLReader('/slice.stl', surfR);
        readerR.delete();
        out.rough = dropAll(ocl, surfR, cutters.rough, plan.roughX);
        surfR.delete();
      } else out.rough = new Float64Array(plan.roughX.length).fill(NaN);
    }
    writeSliceSTL(ocl, rot, keep, keep.length);
    surf = new ocl.STLSurf();
    var reader = new ocl.STLReader('/slice.stl', surf);
    reader.delete();
    if (cutters.rough && keepR === keep) out.rough = dropAll(ocl, surf, cutters.rough, plan.roughX);
    if (cutters.finish) {
      var xs = new Float64Array(plan.finNrev + 2);
      xs[0] = plan.finLo;
      for (var k = 0; k < plan.finNrev; k++) xs[k + 1] = plan.finLo + k * job.finish.pitch + job.finish.pitch * (a / 360);
      xs[plan.finNrev + 1] = plan.finHi;
      out.fin = dropAll(ocl, surf, cutters.finish, xs);
    }
    surf.delete();
    return out;
  }

  function makeCutters(ocl, job) {
    var c = {};
    if (job.rough.enabled) {
      // Leave measured normal to the surface: a flat end mill grown by `leave` all round
      // is a bull-nose of D+2L with corner radius L whose tip sits L below the real
      // cutter's end face. The core adds L back.
      c.rough = { c: new ocl.BullCutter(job.rough.tool_dia + 2 * job.rough.leave, job.rough.leave, job.rough.tool_length) };
    }
    // ball, or tapered ball: ball tip on a cone out to the shank (OpenCAMLib's BallConeCutter),
    // with its tip as a plain ball beside it (see dropXYs)
    var ballOrTaper = function (t) {
      if (t.shape === 'taper' && Number(t.taper_deg) > 0 && Number(t.shank_dia) > Number(t.tool_dia) + 1e-6) {
        return { c: new ocl.BallConeCutter(Number(t.tool_dia), Number(t.shank_dia), Number(t.taper_deg) * Math.PI / 180), tip: new ocl.BallCutter(Number(t.tool_dia), t.tool_length) };
      }
      return { c: new ocl.BallCutter(t.tool_dia, t.tool_length) };
    };
    if (job.finish.enabled) c.finish = ballOrTaper(job.finish);
    if (job.index && job.index.enabled) c.index = ballOrTaper(job.index);
    return c;
  }

  var api = { computeAngle: computeAngle, makeCutters: makeCutters, probe: probe, dropXY: dropXY };

  if (typeof module === 'object' && module.exports) { module.exports = api; return; }

  // ---------------- Web Worker side ----------------
  var ocl = null, tris = null, rot = null, job = null, plan = null, cutters = null;
  self.onmessage = function (ev) {
    var m = ev.data;
    if (m.type === 'init') {
      try {
        importScripts(m.oclUrl);           // defines global `ocl` factory
        self.ocl({}).then(function (mod) {
          ocl = mod;
          self.postMessage({ type: 'ready' });
        }, function (e) { self.postMessage({ type: 'error', message: 'OpenCAMLib failed to start: ' + e }); });
      } catch (e) {
        self.postMessage({ type: 'error', message: 'OpenCAMLib failed to load: ' + (e && e.message || e) });
      }
    } else if (m.type === 'job') {
      tris = m.tris; rot = new Float32Array(tris.length); job = m.job; plan = m.plan;
      if (cutters) Object.keys(cutters).forEach(function (k) { cutters[k].c.delete(); if (cutters[k].tip) cutters[k].tip.delete(); });
      cutters = makeCutters(ocl, job);
      self.postMessage({ type: 'job-ready' });
    } else if (m.type === 'probe') {
      try {
        var zp = probe(ocl, tris, rot, job, plan, m.a, m.xs, cutters);
        self.postMessage({ type: 'probe', id: m.id, z: zp }, [zp.buffer]);
      } catch (e) {
        self.postMessage({ type: 'error', message: 'Probe at A' + m.a + ': ' + (e && e.message || e) });
      }
    } else if (m.type === 'drop') {
      try {
        var ti = job.index, Rw = (ti.shape === 'taper' ? Math.max(Number(ti.shank_dia), Number(ti.tool_dia)) : Number(ti.tool_dia)) / 2;
        var zd = dropXY(ocl, tris, rot, job, m.a, m.xy, cutters.index, Rw);
        self.postMessage({ type: 'drop', id: m.id, z: zd }, [zd.buffer]);
      } catch (e) {
        self.postMessage({ type: 'error', message: 'Indexed drop at A' + m.a + ': ' + (e && e.message || e) });
      }
    } else if (m.type === 'angle') {
      try {
        var r = computeAngle(ocl, tris, rot, job, plan, m.j, cutters);
        var transfer = [];
        if (r.rough) transfer.push(r.rough.buffer);
        if (r.fin) transfer.push(r.fin.buffer);
        self.postMessage({ type: 'angle', j: r.j, kept: r.kept, rough: r.rough, fin: r.fin }, transfer);
      } catch (e) {
        self.postMessage({ type: 'error', message: 'Angle ' + m.j + ': ' + (e && e.message || e) });
      }
    }
  };
})();
