/*
 * Rotary CAM - ncSender plugin dialog.
 * Loaded by config.html into the ncSender page (classic script, defines window.RotaryCam).
 * Heavy work runs in Web Workers: lib/cam-worker.js (OpenCAMLib WASM drop-cutter) and a
 * small STEP worker (occt-import-js). Toolpaths + G-code come from lib/cam-core.js.
 */
(function () {
  'use strict';
  var RC = window.RotaryCam = window.RotaryCam || {};
  var BUILD = '0.7.0-mvvj86xu';
  RC.build = BUILD;
  var PLUGIN_ID = 'com.cncdocs.rotary-cam';
  var STEP_OPTS = { linearUnit: 'millimeter', linearDeflectionType: 'absolute_value', linearDeflection: 0.01, angularDeflection: 0.05 };

  // ---------------------------------------------------------------- assets
  // Plugin files come from /api/plugins/<id>/icon?file=... as octet-stream, so scripts
  // are fetched as text and re-wrapped as text/javascript blobs (workers need that).
  var cache = RC.cache = RC.cache || {};
  function fetchText(host, name) {
    if (!cache['t:' + name]) cache['t:' + name] = fetch(host.file(name)).then(function (r) {
      if (!r.ok) throw new Error(name + ': ' + r.status);
      return r.text();
    });
    return cache['t:' + name];
  }
  function fetchBuffer(host, name) {
    if (!cache['b:' + name]) cache['b:' + name] = fetch(host.file(name)).then(function (r) {
      if (!r.ok) throw new Error(name + ': ' + r.status);
      return r.arrayBuffer();
    });
    return cache['b:' + name];
  }
  function blobUrl(host, name) {
    if (!cache['u:' + name]) cache['u:' + name] = fetchText(host, name).then(function (code) {
      return URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    });
    return cache['u:' + name];
  }

  // ---------------------------------------------------------------- workers
  function WorkerPool(host, size) {
    this.host = host; this.size = size; this.workers = []; this.ready = null;
  }
  WorkerPool.prototype.start = function () {
    var self = this;
    if (this.ready) return this.ready;
    this.ready = Promise.all([blobUrl(this.host, 'lib/ocl.js'), blobUrl(this.host, 'lib/cam-worker.js')]).then(function (urls) {
      var made = [];
      for (var i = 0; i < self.size; i++) {
        made.push(new Promise(function (resolve, reject) {
          var w = new Worker(urls[1]);
          var timer = setTimeout(function () { reject(new Error('the CAM engine took too long to start')); }, 60000);
          w.onmessage = function (ev) {
            if (ev.data.type === 'ready') { clearTimeout(timer); resolve(w); }
            else if (ev.data.type === 'error') { clearTimeout(timer); reject(new Error(ev.data.message)); }
          };
          w.onerror = function (e) { clearTimeout(timer); reject(new Error(e.message || 'worker error')); };
          w.postMessage({ type: 'init', oclUrl: urls[0] });
        }));
      }
      return Promise.all(made).then(function (ws) { self.workers = ws; return self; });
    });
    this.ready.catch(function () { self.ready = null; });
    return this.ready;
  };
  WorkerPool.prototype.stop = function () {
    this.workers.forEach(function (w) { try { w.terminate(); } catch (e) {} });
    this.workers = []; this.ready = null;
  };
  // Runs every angle; resolves { roughZ, finZ } or null if cancelled
  WorkerPool.prototype.run = function (tris, job, plan, onProgress, isCancelled) {
    var ws = this.workers, nAng = plan.nAng;
    var maps = { roughZ: new Array(nAng), finZ: new Array(nAng) };
    var next = 0, done = 0, failed = null;
    var plain = { nAng: plan.nAng, angles: Array.from(plan.angles), halfW: plan.halfW, finLo: plan.finLo, finHi: plan.finHi, finNrev: plan.finNrev, roughX: plan.roughX ? Array.from(plan.roughX) : null, wallTri: plan.wallTri };
    return new Promise(function (resolve, reject) {
      var active = 0;
      function finish() {
        if (failed) reject(failed);
        else if (isCancelled()) resolve(null);
        else resolve(maps);
      }
      function feed(w) {
        if (failed || isCancelled() || next >= nAng) {
          if (active === 0) finish();
          return;
        }
        active++;
        w.postMessage({ type: 'angle', j: next++ });
      }
      ws.forEach(function (w) {
        w.onmessage = function (ev) {
          var m = ev.data;
          if (m.type === 'job-ready') { feed(w); return; }
          if (m.type === 'error') { failed = new Error(m.message); active--; feed(w); return; }
          if (m.type === 'angle') {
            active--;
            if (m.rough) maps.roughZ[m.j] = m.rough;
            if (m.fin) maps.finZ[m.j] = m.fin;
            done++;
            onProgress(done, nAng);
            feed(w);
          }
        };
        w.postMessage({ type: 'job', tris: tris, job: job, plan: plain });
      });
    });
  };

  // Finish-tool drops at arbitrary angles, spread over the workers. groups: [{ a, xs }]
  WorkerPool.prototype.probe = function (groups, isCancelled) {
    var ws = this.workers, out = new Array(groups.length), next = 0, active = 0, failed = null;
    return new Promise(function (resolve, reject) {
      function feed(w) {
        if (failed || isCancelled() || next >= groups.length) {
          if (active === 0) { if (failed) reject(failed); else if (isCancelled()) resolve(null); else resolve(out); }
          return;
        }
        var id = next++;
        active++;
        w.postMessage({ type: 'probe', id: id, a: groups[id].a, xs: groups[id].xs });
      }
      ws.forEach(function (w) {
        w.onmessage = function (ev) {
          var m = ev.data;
          active--;
          if (m.type === 'error') failed = new Error(m.message);
          else if (m.type === 'probe') out[m.id] = m.z;
          feed(w);
        };
        feed(w);
      });
    });
  };

  // Indexed drops (A locked, ball at machine X, Y), spread over the workers. groups: [{ a, xy }]
  WorkerPool.prototype.drop = function (groups, isCancelled) {
    var ws = this.workers, out = new Array(groups.length), next = 0, active = 0, failed = null;
    return new Promise(function (resolve, reject) {
      function feed(w) {
        if (failed || isCancelled() || next >= groups.length) {
          if (active === 0) { if (failed) reject(failed); else if (isCancelled()) resolve(null); else resolve(out); }
          return;
        }
        var id = next++;
        active++;
        w.postMessage({ type: 'drop', id: id, a: groups[id].a, xy: groups[id].xy });
      }
      ws.forEach(function (w) {
        w.onmessage = function (ev) {
          var m = ev.data;
          active--;
          if (m.type === 'error') failed = new Error(m.message);
          else if (m.type === 'drop') out[m.id] = m.z;
          feed(w);
        };
        feed(w);
      });
    });
  };

  function readStep(host, bytes) {
    return Promise.all([blobUrl(host, 'lib/cam-core.js'), blobUrl(host, 'lib/occt-import-js.js'), fetchBuffer(host, 'lib/occt-import-js.wasm')]).then(function (r) {
      var src = [
        'self.onmessage = function (e) {',
        '  var d = e.data;',
        '  try {',
        '    importScripts(d.coreUrl, d.occtUrl);',
        '    occtimportjs({ wasmBinary: d.wasm }).then(function (occt) {',
        '      try {',
        '        var res = occt.ReadStepFile(new Uint8Array(d.bytes), d.opts);',
        '        var r = RotaryCamCore.trisFromOcct(res);',
        '        self.postMessage({ ok: true, tris: r.tris, solids: r.solids, skipped: r.skipped }, [r.tris.buffer]);',
        '      } catch (err) { self.postMessage({ ok: false, error: String(err && err.message || err) }); }',
        '    }, function (err) { self.postMessage({ ok: false, error: "STEP reader failed to start: " + err }); });',
        '  } catch (err) { self.postMessage({ ok: false, error: String(err && err.message || err) }); }',
        '};'
      ].join('\n');
      return new Promise(function (resolve, reject) {
        var w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
        w.onmessage = function (ev) {
          w.terminate();
          if (ev.data.ok) resolve(ev.data); else reject(new Error(ev.data.error));
        };
        w.onerror = function (e) { w.terminate(); reject(new Error(e.message || 'STEP worker error')); };
        w.postMessage({ coreUrl: r[0], occtUrl: r[1], wasm: r[2].slice(0), bytes: bytes, opts: STEP_OPTS }, [bytes]);
      });
    });
  }

  // ---------------------------------------------------------------- browser storage
  // The last part and its toolpaths, kept in this browser so Rotary CAM reopens where
  // it was left even after a page reload. Fails quietly.
  var DB = 'rotary-cam', STORE = 'kv';
  function idb(mode, fn) {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore(STORE); };
      req.onerror = function () { reject(req.error); };
      req.onsuccess = function () {
        var db = req.result, tx = db.transaction(STORE, mode), r = fn(tx.objectStore(STORE));
        tx.oncomplete = function () { db.close(); resolve(r && r.result); };
        tx.onerror = tx.onabort = function () { db.close(); reject(tx.error); };
      };
    });
  }
  var store = {
    load: function (k) { try { return idb('readonly', function (s) { return s.get(k); }).catch(function () { return null; }); } catch (e) { return Promise.resolve(null); } },
    save: function (k, v) { try { return idb('readwrite', function (s) { return s.put(v, k); }).catch(function () {}); } catch (e) { return Promise.resolve(); } },
    drop: function (k) { try { return idb('readwrite', function (s) { return s.delete(k); }).catch(function () {}); } catch (e) { return Promise.resolve(); } }
  };

  // ---------------------------------------------------------------- helpers
  function get(o, path) { return path.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function set(o, path, v) {
    var ks = path.split('.'), last = ks.pop();
    ks.reduce(function (a, k) { return a[k] = a[k] || {}; }, o)[last] = v;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(v, d) { return Number(v).toLocaleString(undefined, { maximumFractionDigits: d === undefined ? 1 : d }); }
  function cssVar(el, name, fallback) {
    var v = getComputedStyle(el).getPropertyValue(name);
    return (v && v.trim()) || fallback;
  }
  function normColor(c, fallback) {
    try { var g = document.createElement('canvas').getContext('2d'); g.fillStyle = fallback; g.fillStyle = c; return g.fillStyle; } catch (e) { return fallback; }
  }
  function toolKind(t) {
    var s = String(t.type || '').toLowerCase().replace(/[-_]/g, ' ');
    if (s.indexOf('ball') === 0) return 'ball';
    if (s.indexOf('flat') === 0 || s === 'endmill' || s === 'end mill') return 'flat';
    if (s.indexOf('bull') === 0) return 'bull';
    return s || 'flat';
  }

  // ---------------------------------------------------------------- units
  // Everything is stored and calculated in mm; the dialog shows and takes values in
  // ncSender's units, and the program is posted in them (G20 / G21).
  var Q = {
    len: { mm: ['mm', 1, 3, 0.1], in: ['in', 25.4, 4, 0.01] },
    feed: { mm: ['mm/min', 1, 0, 10], in: ['in/min', 25.4, 1, 1] },
    deg: { mm: ['°', 1, 2, 1], in: ['°', 1, 2, 1] },
    degmin: { mm: ['°/min', 1, 0, 100], in: ['°/min', 1, 0, 100] },
    rpm: { mm: ['rpm', 1, 0, 100], in: ['rpm', 1, 0, 100] },
    pct: { mm: ['%', 0.01, 2, 1], in: ['%', 0.01, 2, 1] },
    n: { mm: ['', 1, 0, 1], in: ['', 1, 0, 1] }
  };
  function qd(q, u) { return (Q[q] || Q.n)[u === 'in' ? 'in' : 'mm']; }
  function toDisp(v, q, u) { var d = qd(q, u); return v === null || v === undefined || v === '' ? '' : +(Number(v) / d[1]).toFixed(d[2]); }
  function fromDisp(v, q, u) { return Number(v) * qd(q, u)[1]; }
  function unitLabel(q, u) { return qd(q, u)[0]; }

  // ---------------------------------------------------------------- form schema
  var CENTRES = [['bbox', 'Centre of the part'], ['chuck_end', 'Centre of the chuck end'], ['tail_end', 'Centre of the tailstock end'], ['origin', 'Model origin']];
  var SHAPES = [['round', 'Round'], ['square', 'Square'], ['rect', 'Rectangular']];
  var sameTenons = function (j) { return j.tenons.ends === 'both' && !!j.tenons.same; };
  var TENON_COLOR = '#4ade80';
  var isShape = function (s) { return function (j) { return (j.stock && j.stock.shape || 'round') === s; }; };
  var FIELDS = {
    part: [
      { k: 'model.axis', label: 'Turning axis in the model', type: 'select', opts: [['x', 'Model X'], ['y', 'Model Y'], ['z', 'Model Z']], remesh: true, tip: 'Which axis of the model lies along the rotary. A new file starts on its longest side.' },
      { k: 'model.flip', label: 'Turn end for end', type: 'check', remesh: true, tip: 'Swap which end of the part goes in the chuck.' },
      { k: 'model.centre', label: 'On the rotary axis', type: 'select', opts: CENTRES, remesh: true, tip: 'What sits on the rotary centreline. Centre of the chuck end suits a part with a round base, like a chess piece. Model origin keeps the model where it was drawn.' },
      { k: 'model.roll', label: 'Turn about the axis', q: 'deg', remesh: true, tip: 'Turns the part about the rotary axis, which sets what faces up at A0. You can also click the part in the 3D view to bring that side to the top.' },
      { k: 'model.part_start_x', label: 'Part starts at X', q: 'len', remesh: true, tip: 'Distance from the chuck jaw face (X0) to the chuck end of the part. Leave room for the jaws and the keep-away distance.' },
      { k: 'model.scale', label: 'Scale', q: 'pct', remesh: true, tip: 'Size of the part compared with the model as drawn. 100% is as drawn; a model drawn in inches but read as millimetres needs 2540%.' },
      { type: 'button', act: 'fitscale', label: 'Scale to fit the stock', tip: 'The largest size that fits the stock with 1 mm to spare all round, and leaves the operations room before the tailstock.' }
    ],
    stock: [
      { k: 'stock.shape', label: 'Stock shape', type: 'select', opts: SHAPES, tip: 'Round bar, or square / rectangular blanks. The first roughing layers start at the corners and take them off. The part turns red in 3D if it doesn’t fit.' },
      { k: 'stock.dia', label: 'Stock diameter', q: 'len', show: isShape('round'), tip: 'Diameter of the round bar.' },
      { k: 'stock.width', label: 'Side', q: 'len', show: isShape('square'), tip: 'Width of the square blank.' },
      { k: 'stock.width', label: 'Width (Y at A0)', q: 'len', show: isShape('rect'), tip: 'Size across the machine (Y) with A at 0.' },
      { k: 'stock.height', label: 'Height (Z at A0)', q: 'len', show: isShape('rect'), tip: 'Size up and down (Z) with A at 0.' },
      { k: 'tailstock_x', label: 'Tailstock centre at X', q: 'len', tip: 'Where the live centre touches the stock, measured from the chuck jaw face.' },
      { k: 'chuck_clearance', label: 'Keep away from the jaws', q: 'len', tip: 'The cutter edge never comes closer than this to the jaw face.' },
      { k: 'tailstock_clearance', label: 'Keep away from the tailstock', q: 'len', tip: 'The cutter edge never comes closer than this to the live centre.' },
      { k: 'a_sign', label: 'A+90 moves the top of the stock to', type: 'select', opts: [['1', '−Y (toward you)'], ['-1', '+Y (away)']], tip: 'Mark the top of the stock, jog A+90, and see which way the mark went. Getting this wrong mirrors anything that isn’t symmetrical.' },
      { k: 'safe_clearance', label: 'Retract above the stock', q: 'len', tip: 'Rapid height above the largest stock radius.' },
      { k: 'angle_step_deg', label: 'Angle step', q: 'deg', tip: 'How often around the part the surface is sampled. Smaller is finer and slower to calculate; sharp features get extra points automatically.' }
    ],
    tenons: [
      { k: 'tenons.ends', label: 'Ends', type: 'select', opts: [['both', 'Both ends'], ['chuck', 'Chuck end only'], ['tailstock', 'Tailstock end only']], tip: 'Which ends of the part get a tenon.' },
      { k: 'tenons.same', label: 'Same at both ends', type: 'check', show: function (j) { return j.tenons.ends === 'both'; }, tip: 'One size for both tenons. Untick to give the chuck and tailstock ends their own diameter and depth.' },
      { k: 'tenons.chuck.dia', label: function (j) { return sameTenons(j) || j.tenons.ends === 'chuck' ? 'Diameter' : 'Chuck end diameter'; }, q: 'len', show: function (j) { return j.tenons.ends !== 'tailstock'; }, tip: 'Diameter of the tenon. Bigger is stiffer, but it\u2019s more to trim off the part afterwards. 1/2 in is a good start.' },
      { k: 'tenons.chuck.depth', label: function (j) { return sameTenons(j) || j.tenons.ends === 'chuck' ? 'Into the part' : 'Chuck end: into the part'; }, q: 'len', show: function (j) { return j.tenons.ends !== 'tailstock'; }, tip: 'How far the tenon reaches into the part from its end. Reach past any thin or off-centre spot near the end, so solid material holds the part.' },
      { k: 'tenons.tailstock.dia', label: function (j) { return j.tenons.ends === 'tailstock' ? 'Diameter' : 'Tailstock end diameter'; }, q: 'len', show: function (j) { return j.tenons.ends === 'tailstock' || !sameTenons(j); }, tip: 'Diameter of the tailstock end tenon. Bigger is stiffer, but it\u2019s more to trim off the part afterwards.' },
      { k: 'tenons.tailstock.depth', label: function (j) { return j.tenons.ends === 'tailstock' ? 'Into the part' : 'Tailstock end: into the part'; }, q: 'len', show: function (j) { return j.tenons.ends === 'tailstock' || !sameTenons(j); }, tip: 'How far the tailstock end tenon reaches into the part from its end.' }
    ],
    corners: [
      { k: 'corners.tool', label: 'Tool', type: 'tool', kind: 'flat', tip: 'A flat end mill. A bigger one than the roughing tool makes this faster.' },
      { k: 'corners.tool_dia', label: 'Diameter', q: 'len', tip: 'Cutter diameter.' },
      { k: 'corners.tool_length', label: 'Flute length', q: 'len', tip: 'Cutting length of the flutes.' },
      { k: 'corners.stickout', label: 'Stickout', q: 'len', tip: 'How far the tool sticks out of the collet nut, to its tip. The nut and spindle above it are kept off the part, the uncut stock and the rotary; too short and the operation has to stay up off the part where the nut would hit (it says where).' },
      { k: 'corners.tool_number', label: 'Tool number', q: 'n', tip: 'The T number for M6. The same number as the next operation means no tool change.' },
      { k: 'corners.rpm', label: 'Spindle', q: 'rpm', tip: 'Spindle speed.' },
      { k: 'corners.feed', label: 'Feed', q: 'feed', tip: 'Feed along the facing passes (ordinary units per minute, not inverse time).' },
      { k: 'corners.plunge_feed', label: 'Plunge', q: 'feed', tip: 'Feed for stepping down, beside the stock.' },
      { k: 'corners.stepdown', label: 'Stepdown', q: 'len', tip: 'Depth of each facing level.' },
      { k: 'corners.stepover', label: 'Stepover', q: 'len', tip: 'Sideways step between facing passes. About 60% of the cutter diameter.' },
      { k: 'corners.leave', label: 'Keep away from the part', q: 'len', tip: 'The flats never come closer than this to the part. Otherwise each corner is faced down to where its flat just touches the largest round that fits the stock.' }
    ],
    rough: [
      { k: 'rough.tool', label: 'Tool', type: 'tool', kind: 'flat', tip: 'Pick a flat end mill from the Tool Library, or type one in below.' },
      { k: 'rough.tool_dia', label: 'Diameter', q: 'len', tip: 'Cutter diameter.' },
      { k: 'rough.tool_length', label: 'Flute length', q: 'len', tip: 'Cutting length of the flutes.' },
      { k: 'rough.stickout', label: 'Stickout', q: 'len', tip: 'How far the tool sticks out of the collet nut, to its tip. The nut and spindle above it are kept off the part, the uncut stock and the rotary; too short and the operation has to stay up off the part where the nut would hit (it says where).' },
      { k: 'rough.tool_number', label: 'Tool number', q: 'n', tip: 'The T number for M6.' },
      { k: 'rough.rpm', label: 'Spindle', q: 'rpm', tip: 'Spindle speed.' },
      { k: 'rough.feed', label: 'Feed', q: 'feed', tip: 'Cutting speed along the surface. The program turns it into inverse-time (G93) feeds so it holds at every diameter.' },
      { k: 'rough.plunge_feed', label: 'Plunge', q: 'feed', tip: 'Feed for the move down into each pass.' },
      { k: 'rough.stepdown', label: 'Stepdown', q: 'len', tip: 'Radial depth of each roughing layer.' },
      { k: 'rough.pitch', label: 'Advance per turn', q: 'len', tip: 'How far the spiral moves along X for each turn of A. Keep it under the cutter diameter.' },
      { k: 'rough.leave', label: 'Leave for finishing', q: 'len', tip: 'Material left on the part for the finishing pass, measured square to the surface.' }
    ],
    finish: [
      { k: 'finish.tool', label: 'Tool', type: 'tool', kind: 'ball', taper: true, tip: 'Pick a ball end mill, or a tapered ball (in the Tool Library as a V-bit), or type one in below.' },
      { k: 'finish.shape', label: 'Shape', type: 'select', opts: [['ball', 'Ball'], ['taper', 'Tapered ball']], tip: 'A tapered ball has a small ball tip on a cone that widens to the shank: fine detail, but the cone reaches out sideways. Its taper and tip are set here; ncSender\u2019s Tool Library doesn\u2019t store them yet (a V-bit there is fine).' },
      { k: 'finish.tool_dia', label: function (j) { return j.finish.shape === 'taper' ? 'Tip diameter' : 'Diameter'; }, q: 'len', tip: 'Cutter diameter. For a tapered ball, the diameter of the ball at its tip.' },
      { k: 'finish.taper_deg', label: 'Taper (per side)', q: 'deg', show: function (j) { return j.finish.shape === 'taper'; }, tip: 'Angle of the cone from the tool\u2019s axis, one side. Makers often quote it per side (a 3.6\u00b0 taper); if yours gives the included angle, halve it.' },
      { k: 'finish.shank_dia', label: 'Shank diameter', q: 'len', show: function (j) { return j.finish.shape === 'taper'; }, tip: 'Where the cone stops widening. The whole cone and shank are kept off the part and out of the uncut stock, and the keep-away distances are measured from the shank.' },
      { k: 'finish.tool_length', label: 'Flute length', q: 'len', tip: 'Cutting length of the flutes.' },
      { k: 'finish.stickout', label: 'Stickout', q: 'len', tip: 'How far the tool sticks out of the collet nut, to its tip. The nut and spindle above it are kept off the part, the uncut stock and the rotary; too short and the operation has to stay up off the part where the nut would hit (it says where).' },
      { k: 'finish.tool_number', label: 'Tool number', q: 'n', tip: 'The T number for M6.' },
      { k: 'finish.rpm', label: 'Spindle', q: 'rpm', tip: 'Spindle speed.' },
      { k: 'finish.feed', label: 'Feed', q: 'feed', tip: 'Cutting speed along the surface (inverse-time feeds in the program).' },
      { k: 'finish.plunge_feed', label: 'Plunge', q: 'feed', tip: 'Feed for the move down to start the spiral.' },
      { k: 'finish.pitch', label: 'Stepover per turn', q: 'len', tip: 'How far the finishing spiral moves along X for each turn of A. Smaller leaves smaller scallops.' },
      { k: 'finish.tolerance', label: 'Tolerance', q: 'len', tip: 'How far a straight move may stray from the surface before a point is added. Matters on sharp features.' }
    ],
    index: [
      { k: 'index.what', label: 'Clean up', type: 'select', opts: [['all', 'Overhangs and creases'], ['overhangs', 'Overhangs only']], tip: 'What to go after. Overhangs: material hidden under the part from every line through the axis, like under a chin or a jaw. Creases: corners the finishing ball was too big for (a smaller ball here reaches them).' },
      { k: 'index.auto', label: 'Pick the angles', type: 'check', tip: 'Tries A every 15\u00b0 and picks the fewest angles that reach the most. Untick to give your own.' },
      { k: 'index.max_angles', label: 'Most angles', q: 'n', show: function (j) { return j.index.auto !== false; }, tip: 'At most this many A angles. Each one is a separate patch of 3-axis passes with A locked.' },
      { k: 'index.angle_list', label: 'A angles', type: 'text', show: function (j) { return j.index.auto === false; }, tip: 'A angles to lock at, in degrees, like 90, 270. Each one runs passes over whatever it can reach.' },
      { type: 'angles' },
      { k: 'index.min_left', label: 'Ignore less than', q: 'len', tip: 'Material thinner than this is left alone, so the passes go where they count.' },
      { k: 'index.tool', label: 'Tool', type: 'tool', kind: 'ball', taper: true, tip: 'A ball end mill, usually smaller than the finishing ball so it gets into tighter spots. Tapered balls (V-bits in the Tool Library) work too.' },
      { k: 'index.shape', label: 'Shape', type: 'select', opts: [['ball', 'Ball'], ['taper', 'Tapered ball']], tip: 'A tapered ball has a small ball tip on a cone that widens to the shank: fine detail, but the cone reaches out sideways. Its taper and tip are set here; ncSender\u2019s Tool Library doesn\u2019t store them yet (a V-bit there is fine).' },
      { k: 'index.tool_dia', label: function (j) { return j.index.shape === 'taper' ? 'Tip diameter' : 'Diameter'; }, q: 'len', tip: 'Cutter diameter. For a tapered ball, the diameter of the ball at its tip.' },
      { k: 'index.taper_deg', label: 'Taper (per side)', q: 'deg', show: function (j) { return j.index.shape === 'taper'; }, tip: 'Angle of the cone from the tool\u2019s axis, one side. Makers often quote it per side (a 3.6\u00b0 taper); if yours gives the included angle, halve it.' },
      { k: 'index.shank_dia', label: 'Shank diameter', q: 'len', show: function (j) { return j.index.shape === 'taper'; }, tip: 'Where the cone stops widening. The whole cone and shank are kept off the part and out of the uncut stock, and the keep-away distances are measured from the shank.' },
      { k: 'index.tool_length', label: 'Flute length', q: 'len', tip: 'Cutting length of the flutes. The passes never take the tool deeper than the part lets the shank go.' },
      { k: 'index.stickout', label: 'Stickout', q: 'len', tip: 'How far the tool sticks out of the collet nut, to its tip. The nut and spindle above it are kept off the part, the uncut stock and the rotary; too short and the operation has to stay up off the part where the nut would hit (it says where).' },
      { k: 'index.tool_number', label: 'Tool number', q: 'n', tip: 'The T number for M6.' },
      { k: 'index.rpm', label: 'Spindle', q: 'rpm', tip: 'Spindle speed.' },
      { k: 'index.feed', label: 'Feed', q: 'feed', tip: 'Feed along the passes (ordinary units per minute).' },
      { k: 'index.plunge_feed', label: 'Plunge', q: 'feed', tip: 'Feed for the last bit down into each pass.' },
      { k: 'index.stepover', label: 'Stepover', q: 'len', tip: 'Distance between passes. Smaller leaves a smoother surface.' },
      { k: 'index.stepdown', label: 'Stepdown', q: 'len', tip: 'Where a lot was left, the passes go down in layers this deep.' }
    ],
    parting: [
      { k: 'parting.ends', label: 'Neck', type: 'select', opts: [['both', 'Both ends'], ['chuck', 'Chuck end'], ['tailstock', 'Tailstock end']], tip: 'Which ends of the part get a neck.' },
      { k: 'parting.neck_dia', label: 'Neck diameter', q: 'len', tip: 'What\u2019s left holding the part. Too thin and a long part can chatter or snap.' },
      { k: 'parting.gap', label: 'Gap from the part', q: 'len', tip: 'Space between the end of the part and the neck, to sand off after cutting it free.' },
      { k: 'parting.width', label: 'Neck width', q: 'len', tip: 'Width of each neck. 0 means one cutter width.' },
      { k: 'parting.tool', label: 'Tool', type: 'tool', kind: 'flat', tip: 'A flat end mill. The roughing tool works.' },
      { k: 'parting.tool_dia', label: 'Diameter', q: 'len', tip: 'Cutter diameter.' },
      { k: 'parting.tool_length', label: 'Flute length', q: 'len', tip: 'Cutting length of the flutes. Must reach from the stock surface down to the neck.' },
      { k: 'parting.stickout', label: 'Stickout', q: 'len', tip: 'How far the tool sticks out of the collet nut, to its tip. The nut and spindle above it are kept off the part, the uncut stock and the rotary; too short and the operation has to stay up off the part where the nut would hit (it says where).' },
      { k: 'parting.tool_number', label: 'Tool number', q: 'n', tip: 'The T number for M6.' },
      { k: 'parting.rpm', label: 'Spindle', q: 'rpm', tip: 'Spindle speed.' },
      { k: 'parting.feed', label: 'Feed', q: 'feed', tip: 'Cutting speed along the surface (inverse-time feeds in the program). The cut is a full-width slot, so go slower than roughing.' },
      { k: 'parting.plunge_feed', label: 'Plunge', q: 'feed', tip: 'Feed for the move down to the stock.' },
      { k: 'parting.stepdown', label: 'Depth per turn', q: 'len', tip: 'How much deeper the neck gets on each turn of A as it spirals in.' }
    ],
    rig: [
      { k: 'rig.chuck.dia', label: 'Chuck diameter', q: 'len', tip: 'Across the chuck, jaws and all (the widest it gets as it turns).' },
      { k: 'rig.chuck.len', label: 'Chuck length', q: 'len', tip: 'From the jaw face (X0) back to the headstock.' },
      { k: 'rig.head.len', label: 'Headstock length', q: 'len', tip: 'The motor / gearbox housing behind the chuck, along X.' },
      { k: 'rig.head.width', label: 'Headstock width', q: 'len', tip: 'Across the machine (Y), centred on the axis.' },
      { k: 'rig.head.top', label: 'Headstock top above the axis', q: 'len', tip: 'How high the headstock stands above the rotary axis.' },
      { k: 'rig.centre.dia', label: 'Live centre diameter', q: 'len', tip: 'Where its cone meets the tailstock quill. Its point is at the tailstock X.' },
      { k: 'rig.centre.len', label: 'Live centre length', q: 'len', tip: 'From its point back to the tailstock body.' },
      { k: 'rig.tail.len', label: 'Tailstock length', q: 'len', tip: 'The tailstock body behind the live centre, along X.' },
      { k: 'rig.tail.width', label: 'Tailstock width', q: 'len', tip: 'Across the machine (Y), centred on the axis.' },
      { k: 'rig.tail.top', label: 'Tailstock top above the axis', q: 'len', tip: 'How high the tailstock stands above the rotary axis.' },
      { k: 'rig.nut.dia', label: 'Collet nut diameter', q: 'len', tip: 'Across the collet nut (ER20 is about 35 mm, ER11 about 19 mm).' },
      { k: 'rig.nut.len', label: 'Collet nut length', q: 'len', tip: 'From the face of the nut up to the spindle body.' },
      { k: 'rig.spindle.dia', label: 'Spindle diameter', q: 'len', tip: 'The spindle body above the nut (an 80 mm 2.2 kW spindle is 80).' },
      { k: 'rig.clear', label: 'Keep the holder clear by', q: 'len', tip: 'The nut and spindle never come closer than this to the part, the stock or the rotary.' }
    ],
    toolchange: [
      { k: 'rig.tc.route', label: 'Go round the rotary', type: 'check', tip: 'Before each tool change the program goes up to ncSender\u2019s safe Z and round the chuck, headstock and tailstock to the tool change position, and back the same way after. ncSender\u2019s straight moves could pass over a rotary taller than a long tool clears.' },
      { type: 'tcinfo' },
      { k: 'rig.tc.zero.x', label: 'Rotary zero (G54) X', q: 'len', machine: true, tip: 'Machine X of the work zero: the jaw face. Read from the controller\u2019s G54 when ncSender is connected.' },
      { k: 'rig.tc.zero.y', label: 'Rotary zero (G54) Y', q: 'len', machine: true, tip: 'Machine Y of the work zero: the rotary axis.' },
      { k: 'rig.tc.change.x', label: 'Tool change X', q: 'len', machine: true, tip: 'Machine X of the tool change position. Read from the Manual Tool Changer when it\u2019s installed.' },
      { k: 'rig.tc.change.y', label: 'Tool change Y', q: 'len', machine: true, tip: 'Machine Y of the tool change position.' },
      { k: 'rig.tc.setter.x', label: 'Tool setter X', q: 'len', machine: true, tip: 'Machine X of the tool setter, to check ncSender\u2019s own move to it.' },
      { k: 'rig.tc.setter.y', label: 'Tool setter Y', q: 'len', machine: true, tip: 'Machine Y of the tool setter.' },
      { k: 'rig.tc.zsafe', label: 'Safe Z (machine)', q: 'len', machine: true, tip: 'ncSender\u2019s Safe Z (Settings), in machine coordinates: where tool changes travel.' }
    ],
    machine: [
      { k: 'machine.a_max_deg_min', label: 'A max rate', q: 'degmin', fw: '113', tip: 'Fastest the A axis can turn ($113). Read from the controller when connected.' },
      { k: 'machine.x_max_mm_min', label: 'X max rate', q: 'feed', fw: '110', tip: 'Fastest X can move ($110). Read from the controller when connected.' },
      { k: 'machine.y_max_mm_min', label: 'Y max rate', q: 'feed', fw: '111', tip: 'Fastest Y can move ($111). Only the corners operation moves Y.' },
      { k: 'machine.z_max_mm_min', label: 'Z max rate', q: 'feed', fw: '112', tip: 'Fastest Z can move ($112). Read from the controller when connected.' },
      { k: 'tool_change', label: 'Tool change', type: 'select', opts: [['m6', 'M6 (ncSender tool change)'], ['m0', 'M0 pause']], tip: 'M6 runs ncSender’s tool change routine. M0 just pauses so you can swap the tool and re-touch Z.' }
    ]
  };
  var ALL_FIELDS = [].concat(FIELDS.part, FIELDS.stock, FIELDS.tenons, FIELDS.corners, FIELDS.rough, FIELDS.finish, FIELDS.index, FIELDS.parting, FIELDS.rig, FIELDS.toolchange, FIELDS.machine);
  var OPS = ['corners', 'rough', 'finish', 'index', 'parting'];
  var OP_NAMES = { corners: 'Corners', rough: 'Roughing', finish: 'Finishing', index: 'Indexed', parting: 'Parting' };
  var SECTIONS = [['part', 'Part placement'], ['stock', 'Stock & rotary'], ['tenons', 'Tenons — hold the part'], ['corners', 'Corners — square stock'], ['rough', 'Roughing — flat end mill'], ['finish', 'Finishing — ball end mill'], ['index', 'Indexed — what finishing missed'], ['parting', 'Parting — neck the ends'], ['rig', 'Rotary & spindle — collisions'], ['toolchange', 'Tool changes'], ['machine', 'Machine']];

  var CSS = [
    // own the whole dialog, like ncCAM: no ncSender title bar, nearly full screen
    '.plugin-dialog:has(#rcam-root) .plugin-dialog-header{display:none!important}',
    '.plugin-dialog-content:has(#rcam-root){padding:0!important;overflow:hidden!important}',
    '.plugin-dialog-container:has(#rcam-root){max-height:none!important;max-width:none!important}',
    '#rcam-root{--rc-accent:var(--color-accent,#1abc9c);--rc-text:var(--color-text-primary,#1e2a32);--rc-muted:var(--color-text-secondary,#5e6b75);--rc-surface:var(--color-surface,#fff);--rc-surface2:var(--color-surface-muted,#eef2f6);--rc-border:var(--color-border,rgba(20,20,20,.08));--rc-line:color-mix(in srgb,var(--rc-text) 22%,transparent);--rc-rough:#f59e0b;--rc-finish:#38bdf8;' +
      'width:calc(100vw - 48px);height:calc(100vh - 48px);display:flex;flex-direction:column;color:var(--rc-text);background:var(--rc-surface);font:13.5px/1.4 system-ui,-apple-system,sans-serif;text-align:left;overflow:hidden}',
    '#rcam-root *{box-sizing:border-box}',
    // header
    '#rcam-root .rc-head{display:flex;align-items:center;gap:14px;padding:12px 18px;border-bottom:1px solid var(--rc-border);background:var(--rc-surface2)}',
    '#rcam-root .rc-logo{width:38px;height:38px;border-radius:10px;flex:none}',
    '#rcam-root .rc-eyebrow{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--rc-accent)}',
    '#rcam-root .rc-title{font-size:17px;font-weight:650;line-height:1.1}',
    '#rcam-root .rc-beta{margin-left:4px;font-size:.55em;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--rc-accent);vertical-align:super}',
    '#rcam-root .rc-filebox{display:flex;align-items:center;gap:12px;margin-left:18px;min-width:0;flex:1;padding:6px 10px;border:1.5px dashed transparent;border-radius:10px}',
    '#rcam-root .rc-filebox.rc-drag{border-color:var(--rc-accent)}',
    '#rcam-root .rc-name{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#rcam-root .rc-meta{color:var(--rc-muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#rcam-root .rc-units{font-size:12px;color:var(--rc-muted);padding:5px 10px;border-radius:20px;background:var(--rc-surface);white-space:nowrap}',
    // buttons: high contrast everywhere (ncSender styles every dialog button, so be specific)
    '#rcam-root .rc-btn{border:1px solid var(--rc-line);background:var(--rc-surface2);color:var(--rc-text);border-radius:9px;padding:9px 16px;font:inherit;font-weight:600;cursor:pointer;white-space:nowrap;opacity:1;transition:border-color .12s,background .12s}',
    '#rcam-root .rc-btn:hover:not(:disabled){border-color:var(--rc-accent);background:color-mix(in srgb,var(--rc-accent) 10%,var(--rc-surface2))}',
    '#rcam-root .rc-btn.rc-primary{background:var(--rc-accent);border-color:var(--rc-accent);color:#fff}',
    '#rcam-root .rc-btn.rc-primary:hover:not(:disabled){background:color-mix(in srgb,var(--rc-accent) 85%,#000)}',
    '#rcam-root .rc-btn:disabled{opacity:.4;cursor:default}',
    '#rcam-root .rc-close{display:flex;align-items:center;gap:8px}',
    // body
    '#rcam-root .rc-body{flex:1;display:flex;gap:16px;padding:14px 18px;min-height:0}',
    '#rcam-root .rc-side{width:340px;flex:none;overflow-y:auto;padding-right:6px}',
    '#rcam-root .rc-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px;min-height:0}',
    '#rcam-root details{background:var(--rc-surface2);border-radius:10px;margin:0 0 8px;padding:0 12px}',
    '#rcam-root summary{cursor:pointer;font-weight:600;padding:10px 0;display:flex;align-items:center;gap:8px;list-style:none}',
    '#rcam-root summary::-webkit-details-marker{display:none}',
    '#rcam-root summary .rc-chev{margin-left:auto;color:var(--rc-muted);font-size:10px}',
    '#rcam-root details[open] summary .rc-chev{transform:rotate(90deg)}',
    '#rcam-root summary .rc-swatch{width:10px;height:10px;border-radius:50%;flex:none}',
    '#rcam-root .rc-row{display:grid;grid-template-columns:1fr 132px;align-items:center;gap:8px;padding:3px 0}',
    '#rcam-root .rc-row.rc-wide{grid-template-columns:1fr}',
    '#rcam-root .rc-row label{color:var(--rc-text);display:flex;align-items:center;gap:5px}',
    '#rcam-root .rc-info{color:var(--rc-muted);font-size:11px;cursor:help;border:1px solid var(--rc-line);border-radius:50%;width:15px;height:15px;display:inline-flex;align-items:center;justify-content:center;flex:none;font-weight:600}',
    '#rcam-root .rc-hint{grid-column:1/-1;color:var(--rc-muted);font-size:11.5px;margin-top:-2px}',
    '#rcam-root .rc-in{display:flex;align-items:center;gap:4px}',
    '#rcam-root .rc-in input,#rcam-root select{width:100%;min-width:0;padding:6px 8px;border:1px solid var(--rc-line);border-radius:7px;background:var(--rc-surface);color:var(--rc-text);font:inherit}',
    '#rcam-root select option{background:var(--rc-surface);color:var(--rc-text)}',
    '#rcam-root .rc-in input[type=number]{text-align:right}',
    '#rcam-root .rc-in input:focus,#rcam-root select:focus{outline:none;border-color:var(--rc-accent)}',
    '#rcam-root .rc-unit{color:var(--rc-muted);font-size:11.5px;min-width:42px}',
    '#rcam-root .rc-fw{color:var(--rc-accent);font-size:11px}',
    '#rcam-root input[type=checkbox]{width:17px;height:17px;accent-color:var(--rc-accent)}',
    '#rcam-root .rc-chips{display:flex;flex-wrap:wrap;gap:6px;padding:4px 0 2px}',
    '#rcam-root .rc-chip{display:inline-flex;align-items:stretch;border:1px solid color-mix(in srgb,#facc15 60%,var(--rc-line));border-radius:16px;overflow:hidden;background:var(--rc-surface)}',
    '#rcam-root .rc-chip button{border:0;background:none;color:var(--rc-text);font:inherit;font-weight:600;padding:4px 9px;cursor:pointer;opacity:1}',
    '#rcam-root .rc-chip button+button{border-left:1px solid var(--rc-line);padding:4px 8px;color:var(--rc-muted);font-weight:500}',
    '#rcam-root .rc-chip.on{background:color-mix(in srgb,#facc15 30%,var(--rc-surface));border-color:#d9a90a}',
    '#rcam-root .rc-chip button:hover{background:color-mix(in srgb,#facc15 18%,transparent)}',
    '#rcam-root .rc-chip.rc-add{border-style:dashed}',
    // 3D view + overlays
    '#rcam-root .rc-view{flex:1;min-height:260px;position:relative;border-radius:12px;background:var(--rc-surface2);overflow:hidden;container-type:inline-size}',
    '#rcam-root canvas{position:absolute;inset:0;width:100%;height:100%}',
    '#rcam-root .rc-3d{position:absolute;inset:0}',
    '#rcam-root .rc-tb,#rcam-root .rc-bb{position:absolute;left:10px;right:10px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;pointer-events:none;z-index:2}',
    '#rcam-root .rc-tb{top:10px}#rcam-root .rc-bb{bottom:10px}',
    '#rcam-root .rc-tb>*,#rcam-root .rc-bb>*{pointer-events:auto}',
    '#rcam-root .rc-spacer{flex:1;pointer-events:none!important}',
    '#rcam-root .rc-seg{display:inline-flex;align-items:stretch;background:var(--rc-surface);border:1px solid var(--rc-line);border-radius:9px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.14)}',
    '#rcam-root .rc-seg button{border:0;border-radius:0;background:none;color:var(--rc-text);font:inherit;font-weight:600;padding:6px 11px;cursor:pointer;white-space:nowrap;opacity:1}',
    '#rcam-root .rc-seg button+button{border-left:1px solid var(--rc-line)}',
    '#rcam-root .rc-seg button:hover:not(:disabled){background:var(--rc-surface2)}',
    '#rcam-root .rc-seg button.on{background:var(--rc-accent);color:#fff}',
    '#rcam-root .rc-seg button:disabled{opacity:.4;cursor:default}',
    '#rcam-root .rc-seg .rc-lab{padding:6px 4px 6px 11px;color:var(--rc-muted);font-size:12px;align-self:center;white-space:nowrap}',
    '#rcam-root .rc-seg select{border:0;border-radius:0;width:auto;font-weight:600;padding:5px 8px}',
    '#rcam-root .rc-seg input[type=range]{width:150px;margin:0 8px;accent-color:var(--rc-accent);align-self:center}',
    // operation pills, styled like G-code Explorer's categories
    '#rcam-root .rc-ops{display:inline-flex;gap:6px;background:var(--rc-surface);border:1px solid var(--rc-line);border-radius:10px;padding:4px;box-shadow:0 1px 4px rgba(0,0,0,.14)}',
    '#rcam-root .rc-op{display:flex;align-items:center;gap:7px;padding:5px 9px;border-radius:7px;border:1px solid transparent;background:transparent;color:var(--rc-muted);font:inherit;font-weight:500;cursor:pointer;opacity:1}',
    '#rcam-root .rc-op:hover{background:var(--rc-surface2);color:var(--rc-text)}',
    '#rcam-root .rc-op .rc-dot{width:9px;height:9px;border-radius:50%}',
    '#rcam-root .rc-op.on{background:color-mix(in srgb,var(--opc) 16%,transparent);border-color:color-mix(in srgb,var(--opc) 55%,transparent);color:var(--rc-text);font-weight:650}',
    // simulation
    '#rcam-root .rc-simbar{display:flex;align-items:center;gap:8px;background:var(--rc-surface);border:1px solid var(--rc-line);border-radius:10px;padding:4px 8px;box-shadow:0 1px 4px rgba(0,0,0,.14);flex:1;min-width:280px}',
    '#rcam-root .rc-simbar button{border:1px solid var(--rc-line);border-radius:7px;background:var(--rc-surface2);color:var(--rc-text);font:inherit;font-weight:700;padding:4px 10px;cursor:pointer;opacity:1;min-width:34px}',
    '#rcam-root .rc-simbar button:hover{border-color:var(--rc-accent)}',
    '#rcam-root .rc-simbar input[type=range]{flex:1;min-width:80px;accent-color:var(--rc-accent)}',
    '#rcam-root .rc-simbar select{width:auto;min-width:70px;flex:none;padding:3px 6px}',
    '#rcam-root .rc-simtime{font-variant-numeric:tabular-nums;color:var(--rc-muted);font-size:12px;white-space:nowrap}',
    '#rcam-root .rc-simline{background:var(--rc-surface);border:1px solid var(--rc-line);border-radius:8px;padding:5px 10px;font:12px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--rc-text);box-shadow:0 1px 4px rgba(0,0,0,.14);max-width:min(640px,70%);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#rcam-root .rc-simline b{font-family:system-ui,sans-serif;margin-right:6px}',
    '#rcam-root .rc-legend{display:flex;gap:10px;background:var(--rc-surface);border:1px solid var(--rc-line);border-radius:8px;padding:5px 10px;font-size:12px;color:var(--rc-muted);box-shadow:0 1px 4px rgba(0,0,0,.14)}',
    '#rcam-root .rc-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}',
    '#rcam-root .rc-simmsg{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:var(--rc-surface);border:1px solid var(--rc-line);border-radius:10px;padding:12px 18px;box-shadow:0 2px 10px rgba(0,0,0,.2);z-index:3}',
    '#rcam-root .rc-op .rc-off{font-size:11px;color:var(--rc-muted);font-weight:500}',
    '@container (max-width: 780px){#rcam-root .rc-seg .rc-lab{display:none}#rcam-root .rc-seg button{padding:5px 8px}#rcam-root .rc-seg input[type=range]{width:90px}#rcam-root .rc-seg .rc-aval{display:inline!important}#rcam-root .rc-tb,#rcam-root .rc-bb{gap:5px;left:6px;right:6px}#rcam-root .rc-tb{top:6px}#rcam-root .rc-bb{bottom:6px}}',
    // messages, stats, footer
    '#rcam-root .rc-msgs:empty{display:none}',
    '#rcam-root .rc-msgs{max-height:30%;overflow-y:auto;flex:none}',
    '#rcam-root .rc-msg{padding:8px 11px;border-radius:9px;margin-bottom:6px;font-size:12.5px;display:flex;gap:8px;align-items:center}',
    '#rcam-root .rc-msg b{flex:none}',
    '#rcam-root .rc-err{background:rgba(220,60,60,.14);border-left:3px solid #d64545}',
    '#rcam-root .rc-warn{background:rgba(230,160,30,.15);border-left:3px solid #d99a1e}',
    '#rcam-root .rc-ok{background:color-mix(in srgb,var(--rc-accent) 14%,transparent);border-left:3px solid var(--rc-accent)}',
    '#rcam-root .rc-msg .rc-btn{padding:4px 11px;margin-left:auto;flex:none}',
    '#rcam-root .rc-stats{display:flex;gap:22px;flex-wrap:wrap;color:var(--rc-muted);font-size:12px;flex:none}',
    '#rcam-root .rc-stats:empty{display:none}',
    '#rcam-root .rc-stats b{color:var(--rc-text);font-size:14px;display:block}',
    '#rcam-root .rc-foot{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:12px 18px;border-top:1px solid var(--rc-border);background:var(--rc-surface2)}',
    '#rcam-root .rc-prog{flex:1;min-width:120px;max-width:340px;height:8px;background:var(--rc-surface);border-radius:4px;overflow:hidden;display:none}',
    '#rcam-root .rc-prog i{display:block;height:100%;width:0;background:var(--rc-accent);transition:width .15s}',
    '#rcam-root .rc-status{color:var(--rc-muted);font-size:12.5px}',
    '@media (max-width:1100px){#rcam-root .rc-side{width:290px}#rcam-root .rc-filebox .rc-meta{display:none}}',
    '@media (max-height:640px){#rcam-root .rc-head{padding:8px 14px}#rcam-root .rc-body{padding:8px 12px}#rcam-root .rc-foot{padding:8px 14px}#rcam-root .rc-logo{width:30px;height:30px}}'
  ].join('\n');

  // A press that starts inside the dialog and ends outside fires its click on the
  // backdrop, and ncSender closes the dialog on any backdrop click. Only let a click
  // through when the press also started on the backdrop.
  if (!RC.guarded) {
    RC.guarded = true;
    var downOnBackdrop = false;
    var isBackdrop = function (el) { return !!(el && el.classList && el.classList.contains('plugin-dialog-backdrop')); };
    window.addEventListener('pointerdown', function (e) { downOnBackdrop = isBackdrop(e.target); }, true);
    window.addEventListener('mousedown', function (e) { downOnBackdrop = isBackdrop(e.target); }, true);
    window.addEventListener('click', function (e) {
      if (isBackdrop(e.target) && document.getElementById('rcam-root') && !downOnBackdrop) { e.stopPropagation(); e.preventDefault(); }
    }, true);
  }

  // ---------------------------------------------------------------- app
  RC.mount = function (root, host) {
    var core = window.RotaryCamCore;
    var OPC = (window.RotaryCamViewer && window.RotaryCamViewer.OP_COLORS) || { corners: '#a78bfa', rough: '#f59e0b', finish: '#38bdf8', index: '#facc15', parting: '#f472b6' };
    // Same page, dialog opened again: carry on exactly where we were
    var S = RC.session && RC.session.build === BUILD ? RC.session.S : null;
    var resumed = !!S;
    if (!S) {
      var saved = (host.initial && host.initial.job) || null;
      S = {
        job: core.prepareJob(migrate(core.deepMerge(core.DEFAULTS, saved || {}), saved)),
        units: 'mm', tools: [], numbering: 'slot', fw: {}, fwFields: {},
        fileName: '', raw: null, mesh: null, sil: null, plan: null, maps: null, program: null, resultKey: null,
        problems: [], warnings: [], toast: null, busy: '', cancel: false,
        indexLeft: null,
        ui: { tab: '3d', op: 'finish', a: 0, idxSel: -1, cam: null, open: { part: true, stock: true, tenons: true, corners: false, rough: false, finish: false, index: false, parting: false, machine: false }, scroll: 0 }
      };
      RC.session = { build: BUILD, S: S };
    }
    if (!(S.busy && RC.pool)) S.busy = '';   // a calculation started before closing carries on
    function migrate(job, saved) {
      // settings saved before stock shapes existed only had a radius
      if (saved && !saved.stock && saved.stock_radius) job.stock = { shape: 'round', dia: 2 * saved.stock_radius, width: 2 * saved.stock_radius, height: 2 * saved.stock_radius };
      return job;
    }
    var U = function () { return S.units; };
    function L(vmm, d) { var q = qd('len', U()); return fmt(vmm / q[1], d === undefined ? (U() === 'in' ? 3 : 2) : d) + ' ' + q[0]; }

    root.innerHTML = '<style>' + CSS + '</style>' +
      '<header class="rc-head">' +
      '  <img class="rc-logo" alt="" src="' + esc(host.file('icon.png')) + '">' +
      '  <div><div class="rc-eyebrow">Plugin</div><div class="rc-title">Rotary CAM<span class="rc-beta">beta</span></div></div>' +
      '  <div class="rc-filebox" title="Drop a .stl, .step, .stp or .rcam file here">' +
      '    <button class="rc-btn rc-open" type="button" title="Open an STL or STEP part, or a Rotary CAM project (.rcam). You can also drop the file here.">Open…</button>' +
      '    <button class="rc-btn rc-saveproj" type="button" disabled title="Save a Rotary CAM project (.rcam): the part, every setting, the tools, and the G-code and toolpaths if they\u2019re generated. Open it again with Open\u2026">Save project…</button>' +
      '    <div style="min-width:0"><div class="rc-name">No part loaded</div><div class="rc-meta">Drop a .stl, .step, .stp or .rcam file here.</div></div>' +
      '    <input type="file" accept=".stl,.step,.stp,.rcam" hidden>' +
      '  </div>' +
      '  <span class="rc-units" title="Rotary CAM uses ncSender’s units (Settings). The program is posted in them too."></span>' +
      '  <button class="rc-btn rc-close" type="button" title="Close Rotary CAM. Your part, settings and toolpaths are kept for next time."><span style="font-size:15px;line-height:1">✕</span> Close</button>' +
      '</header>' +
      '<div class="rc-body">' +
      '  <aside class="rc-side"></aside>' +
      '  <main class="rc-main">' +
      '    <div class="rc-view">' +
      '      <div class="rc-3d"></div><canvas class="rc-2d" hidden></canvas>' +
      '      <div class="rc-tb rc-3donly rc-placing">' +
      '        <div class="rc-seg rc-axis rc-orient" title="Which model axis lies along the rotary"><span class="rc-lab">Turning axis</span><button type="button" data-axis="x" title="Model X along the rotary">X</button><button type="button" data-axis="y" title="Model Y along the rotary">Y</button><button type="button" data-axis="z" title="Model Z along the rotary">Z</button></div>' +
      '        <div class="rc-seg rc-orient"><button type="button" data-act="flip" title="Swap which end goes in the chuck">⇄ Flip ends</button></div>' +
      '        <div class="rc-seg rc-orient" title="Turn the part about the rotary axis: sets what faces up at A0"><span class="rc-lab">Turn</span><button type="button" data-act="roll-" title="Turn the part 90° one way">↺ 90°</button><button type="button" data-act="roll+" title="Turn the part 90° the other way">↻ 90°</button></div>' +
      '        <div class="rc-seg rc-orient" title="What sits on the rotary centreline"><span class="rc-lab">On axis</span><select class="rc-centre">' + CENTRES.map(function (c) { return '<option value="' + c[0] + '">' + c[1] + '</option>'; }).join('') + '</select></div>' +
      '      </div>' +
      '      <div class="rc-tb rc-simonly"><div class="rc-simline">Line —</div><span class="rc-spacer"></span>' +
      '        <div class="rc-legend"><span><i style="background:#c79e6b"></i>Stock</span><span><i style="background:#e3c99e"></i>Cut</span><span><i style="background:#80a6db"></i>At the part</span><span><i style="background:#db4545"></i>Below the part</span><span class="rc-tenonkey"><i style="background:' + TENON_COLOR + '"></i>Tenon</span><span class="rc-ovkey" style="display:none"><i style="background:#facc15"></i>Left to clean</span></div></div>' +
      '      <div class="rc-simmsg rc-simonly" hidden></div>' +
      '      <div class="rc-bb">' +
      '        <div class="rc-seg rc-views rc-viewonly"><button type="button" data-view="iso" title="Fit the part, with the chuck beside it">Fit part</button><button type="button" data-view="front" title="Look from the front (along +Y)">Front</button><button type="button" data-view="top" title="Look down from above">Top</button><button type="button" data-view="end" title="Look along the axis from the tailstock end">End</button><button type="button" data-view="whole" title="Fit the whole rotary setup, chuck to tailstock">Fit setup</button></div>' +
      '        <div class="rc-seg rc-3donly" title="Turns the part the way the rotary will. Click the part to bring that side to the top at A0."><span class="rc-lab">A</span><input class="rc-a" type="range" min="0" max="360" step="1" value="0"><span class="rc-lab rc-aval" style="min-width:40px;padding-right:11px">0°</span></div>' +
      '        <div class="rc-ops rc-3donly" title="Pick which operation’s tool and toolpath to show">' + OPS.map(function (o) { return '<button type="button" class="rc-op" data-op="' + o + '" style="--opc:' + OPC[o] + '"><span class="rc-dot" style="background:' + OPC[o] + '"></span>' + OP_NAMES[o] + '<span class="rc-off"></span></button>'; }).join('') + '</div>' +
      '        <div class="rc-simbar rc-simonly"><button type="button" class="rc-play" title="Play / pause">▶</button><button type="button" class="rc-rewind" title="Back to the start">⏮</button>' +
      '          <input type="range" class="rc-simpos" min="0" max="1000" step="1" value="0" title="Drag to any point in the program">' +
      '          <span class="rc-simtime">0:00 / 0:00</span>' +
      '          <select class="rc-simspeed" title="Playback speed">' + [1, 5, 20, 50, 100, 250, 1000].map(function (v) { return '<option value="' + v + '">' + v + '×</option>'; }).join('') + '</select></div>' +
      '        <span class="rc-spacer"></span>' +
      '        <div class="rc-seg rc-tabs"><button type="button" data-tab="3d" class="on" title="3D view of the setup">3D</button><button type="button" data-tab="sim" title="Play the G-code against a model of the stock">Simulate</button><button type="button" data-tab="2d" title="The finish surface unrolled flat, and the side profile">Unrolled</button></div>' +
      '      </div>' +
      '    </div>' +
      '    <div class="rc-msgs"></div>' +
      '    <div class="rc-stats"></div>' +
      '  </main>' +
      '</div>' +
      '<footer class="rc-foot">' +
      '  <button class="rc-btn rc-primary rc-gen" type="button" disabled title="Calculate roughing and finishing toolpaths for this part">Generate toolpaths</button>' +
      '  <button class="rc-btn rc-cancel" type="button" hidden>Cancel</button>' +
      '  <div class="rc-prog"><i></i></div><span class="rc-status"></span><span style="flex:1"></span>' +
      '  <button class="rc-btn rc-dl" type="button" disabled title="Save the program to this computer">Download .nc</button>' +
      '  <button class="rc-btn rc-save" type="button" disabled title="Save the program to ncSender’s File Manager, in the Rotary CAM folder">Save to File Manager</button>' +
      '  <button class="rc-btn rc-load" type="button" disabled title="Load the program into ncSender and close Rotary CAM">Load into ncSender</button>' +
      '</footer>';
    var $ = function (sel) { return root.querySelector(sel); };
    var side = $('.rc-side'), canvas = $('canvas.rc-2d'), fileInput = $('input[type=file]');
    var viewer = null;

    var api = {
      get: function (p) { return fetch(host.base + p).then(function (r) { if (!r.ok) throw new Error(p + ': ' + r.status); return r.json(); }); },
      post: function (p, body) { return fetch(host.base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }
    };
    function closeDialog() { saveUi(); window.postMessage({ type: 'close-plugin-dialog' }, '*'); }
    $('.rc-close').addEventListener('click', closeDialog);

    // ---------- settings persistence (shared by every browser on this ncSender)
    var saveTimer = null;
    function persist() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        fetch(host.base + '/api/plugins/' + PLUGIN_ID + '/settings', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job: S.job })
        }).catch(function () {});
      }, 600);
    }
    function jobKey() { return JSON.stringify({ j: S.job, f: S.fileName, n: S.raw ? S.raw.length : 0 }); }
    function saveUi() {
      if (viewer && S.ui.camUser) S.ui.cam = viewer.getCamera();
      S.ui.scroll = side.scrollTop;
      side.querySelectorAll('details').forEach(function (d) { S.ui.open[d.getAttribute('data-sec')] = d.open; });
    }

    // ---------- theme
    function themeInfo() {
      var surf = normColor(cssVar(root, '--color-surface', '#ffffff'), '#ffffff');
      var n = parseInt(surf.slice(1), 16), lum = ((n >> 16 & 255) * 0.299 + (n >> 8 & 255) * 0.587 + (n & 255) * 0.114) / 255;
      return { dark: lum < 0.45, accent: normColor(cssVar(root, '--color-accent', '#1abc9c'), '#1abc9c'), ink: normColor(cssVar(root, '--color-text-primary', '#1e2a32'), '#1e2a32'), muted: normColor(cssVar(root, '--color-text-secondary', '#5e6b75'), '#5e6b75') };
    }
    var TH = themeInfo();
    root.style.colorScheme = TH.dark ? 'dark' : 'light';   // native dropdown lists follow the theme

    // ---------- 3D view
    if (RC.viewer) { try { RC.viewer.dispose(); } catch (e) {} RC.viewer = null; }
    try {
      if (window.RotaryCamViewer) {
        viewer = RC.viewer = window.RotaryCamViewer.create($('.rc-3d'), { onPick: pickTop, preserveDrawingBuffer: !!host.test, onUserCamera: function () { S.ui.camUser = true; },
          onIndexPick: function (i) { pickAngle(i); }, onIndexDrag: function (i, a, done) { dragAngle(i, a, done); } });
        viewer.setTheme(TH);
      }
    } catch (e) { viewer = null; }
    if (!viewer) {
      S.ui.tab = '2d';
      $('.rc-tabs').hidden = true;
    }
    function syncViewer(partChanged) {
      if (!viewer) return;
      var j = S.job;
      viewer.setSetup({
        chuckX: j.chuck_face_x, tailX: j.tailstock_x, stockR: j.stock_radius,
        stockShape: (j.stock && j.stock.shape) || 'round', stockHalf: core.stockHalf(j),
        chuckClear: j.chuck_clearance, tailClear: j.tailstock_clearance, aSign: j.a_sign, clear: j.safe_clearance,
        tools: {
          corners: { dia: j.corners.tool_dia, len: j.corners.tool_length, ball: false },
          rough: { dia: j.rough.tool_dia, len: j.rough.tool_length, ball: false },
          finish: { dia: j.finish.tool_dia, len: j.finish.tool_length, ball: true, taper: j.finish.shape === 'taper' ? j.finish.taper_deg * Math.PI / 180 : 0, shank: j.finish.shank_dia },
          index: { dia: j.index.tool_dia, len: j.index.tool_length, ball: true, taper: j.index.shape === 'taper' ? j.index.taper_deg * Math.PI / 180 : 0, shank: j.index.shank_dia },
          parting: { dia: j.parting.tool_dia, len: j.parting.tool_length, ball: false }
        },
        toolX: S.mesh ? (S.mesh.min[0] + S.mesh.max[0]) / 2 : null,
        rig: j.rig, fixtures: core.fixtures(j), tc: core.tcInfo(j),
        stickout: { corners: j.corners.stickout, rough: j.rough.stickout, finish: j.finish.stickout, index: j.index.stickout, parting: j.parting.stickout }
      });
      if (partChanged || (S.mesh && !viewer.hasPart())) viewer.setPart(S.mesh ? S.mesh.tris : null);
      if (viewer.setTenons) viewer.setTenons(S.mesh ? core.tenonList(j, S.mesh) : []);
      viewer.setPartBad(!!(S.mesh && S.problems.some(function (p) { return /stock/.test(p); })));
    }
    function showPaths() {
      if (!viewer) return;
      var p = S.program && S.program.paths;
      OPS.forEach(function (o) { viewer.setToolpath(o, p && p[o] && p[o].length ? p[o] : null); });
      viewer.setOp(S.ui.op);
      syncIndex();
    }
    function setOp(op) {
      S.ui.op = op;
      root.querySelectorAll('.rc-op').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-op') === op); });
      if (viewer) viewer.setOp(op);
      syncIndex();
    }

    // ---------- Indexed angles: shown in 3D while Indexed is the operation on show
    // The angles on show: your own, or the ones the last calculation picked
    function shownAngles() {
      var ix = S.job.index;
      if (!ix.enabled) return [];
      if (ix.auto === false) return core.indexAngles(S.job);
      var ii = S.program && S.program.info && S.program.info.index;
      return ii && ii.angles ? ii.angles.slice() : [];
    }
    function syncIndex() {
      if (!viewer || !viewer.setIndexAngles) return;
      var on = S.ui.op === 'index' && !!S.mesh && !!S.job.index.enabled;
      var list = on ? shownAngles() : [];
      if (!(S.ui.idxSel < list.length)) S.ui.idxSel = -1;
      var j = S.job, L0 = S.indexLeft, x = null;
      if (L0 && L0.n) { var sx = 0; for (var i = 0; i < L0.n; i++) sx += L0.x[i]; x = sx / L0.n; }
      else if (S.mesh) x = (S.mesh.min[0] + S.mesh.max[0]) / 2;
      viewer.setIndexAngles(list.map(function (a) { return { a: a }; }), {
        tool: { dia: j.index.tool_dia, len: j.index.tool_length, ball: true, taper: j.index.shape === 'taper' ? j.index.taper_deg * Math.PI / 180 : 0, shank: j.index.shank_dia },
        x: x, rTip: j.stock_radius + j.safe_clearance, pick: S.ui.idxSel, editable: true
      });
      if (viewer.setLeftover) viewer.setLeftover(on && L0 ? L0 : null);
    }
    // where the tool change and tool setter are, and the way round to them (once generated)
    function syncToolChanges() {
      if (!viewer || !viewer.setToolChanges) return;
      var info = core.tcInfo(S.job), tcp = S.program && S.program.toolChanges;
      if (!info) { viewer.setToolChanges(null); return; }
      var plan = core.tcPlan(S.job, null);
      viewer.setToolChanges({ change: info.change, setter: info.setter, paths: tcp ? tcp.paths : [], setterHits: plan.setterHits && plan.setterHits.length });
    }
    function setAngleList(list, keepSel) {
      S.job.index.auto = false;
      S.job.index.angle_list = list.map(function (a) { return String(Math.round(a * 100) / 100); }).join(', ');
      if (!keepSel) S.ui.idxSel = -1;
      renderForm(); persist(); invalidate(false);
    }
    function turnTo(a) {
      S.ui.a = Math.round(((a % 360) + 360) % 360);
      $('.rc-a').value = S.ui.a; $('.rc-aval').textContent = S.ui.a + '°';
      if (viewer) viewer.setA(S.ui.a);
      var add = side.querySelector('[data-idx-add]');
      if (add) add.textContent = '+ A' + S.ui.a + '°';
    }
    // pick an angle: turn the part to it (its tool straight down) and shade what it can't see
    function pickAngle(i) {
      var list = shownAngles();
      if (i < 0 || i >= list.length) return;
      S.ui.idxSel = S.ui.idxSel === i ? -1 : i;
      if (S.ui.idxSel >= 0) turnTo(list[i]);
      if (S.ui.op !== 'index') setOp('index'); else syncIndex();
      side.querySelectorAll('.rc-chip[data-i]').forEach(function (c) { c.classList.toggle('on', Number(c.getAttribute('data-i')) === S.ui.idxSel); });
    }
    function dragAngle(i, a, done) {
      var chip = side.querySelector('.rc-chip[data-i="' + i + '"] [data-idx-pick]');
      if (chip) chip.textContent = 'A' + fmt(a, 1) + '°';
      if (!done) return;
      var list = shownAngles();
      list[i] = a;
      // the same angle twice is one angle
      var uniq = []; list.forEach(function (v) { if (uniq.indexOf(v) < 0) uniq.push(v); });
      S.ui.idxSel = S.ui.idxSel === i ? uniq.indexOf(a) : -1;
      setAngleList(uniq, true);
      if (S.ui.idxSel >= 0) turnTo(a);
    }
    function anglesHtml() {
      var ix = S.job.index, list = shownAngles(), own = ix.auto === false;
      var chips = list.map(function (a, i) {
        return '<span class="rc-chip' + (i === S.ui.idxSel ? ' on' : '') + '" data-i="' + i + '"><button type="button" data-idx-pick="' + i + '" title="Turn the part to A' + fmt(a, 1) + '° and shade what this angle\u2019s tool can\u2019t see">A' + fmt(a, 1) + '°</button>' +
          '<button type="button" data-idx-del="' + i + '" title="Remove this angle">\u2715</button></span>';
      }).join('');
      var add = '<span class="rc-chip rc-add"><button type="button" data-idx-add title="Add the angle the A slider (under the 3D view) is at: turn the part until the spot you want faces straight up, then add it">+ A' + S.ui.a + '°</button></span>';
      var hint = own || list.length
        ? 'Click an angle to turn the part to it: its tool points straight down and the part shows dark where that tool can\u2019t see. Drag a tool in the 3D view to change its angle (5° steps, Shift for 1°).' + (own ? '' : ' These are the angles the last calculation picked; changing them makes them your own.')
        : 'Generate to see the angles it picks, or add your own: turn the part with the A slider until the spot faces up, then press + A.';
      if (S.indexLeft && S.indexLeft.n && ix.enabled) hint += ' Yellow: what the rotary passes leave for Indexed.';
      return '<div class="rc-row rc-wide"><div class="rc-chips">' + chips + add + '</div><div class="rc-hint">' + hint + '</div></div>';
    }
    function syncToolbar() {
      var m = S.job.model;
      root.querySelectorAll('.rc-axis button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-axis') === m.axis); });
      root.querySelector('[data-act=flip]').classList.toggle('on', !!m.flip);
      $('.rc-centre').value = core.centreMode(m);
      root.querySelectorAll('.rc-orient button, .rc-orient select').forEach(function (b) { b.disabled = !S.mesh || !!S.busy; });
      var vis = visibleOps();
      if (vis.indexOf(S.ui.op) < 0) setOp(vis.indexOf('finish') >= 0 ? 'finish' : vis[0] || 'finish');
      root.querySelectorAll('.rc-op').forEach(function (b) {
        var op = b.getAttribute('data-op');
        b.hidden = vis.indexOf(op) < 0;
        b.classList.toggle('on', S.ui.op === op);
        b.querySelector('.rc-off').textContent = S.job[op].enabled ? '' : '(off)';
      });
      var simTab = root.querySelector('[data-tab=sim]');
      simTab.disabled = !S.program || !!S.busy || !window.RotaryCamSim;
      simTab.title = S.program ? 'Play the G-code against a model of the stock' : 'Generate toolpaths first, then play them here';
    }
    // corners only matter for square / rectangular stock; parting only when it's on
    function visibleOps() {
      return OPS.filter(function (o) {
        if (o === 'corners') return !!core.stockHalf(S.job);
        if (o === 'parting') return !!S.job.parting.enabled;
        if (o === 'index') return !!S.job.index.enabled;
        return true;
      });
    }
    function setModel(k, v) {
      S.job.model[k] = v;
      renderForm(); persist(); invalidate(true);
    }
    function pickTop(p) {
      if (S.busy) return;
      var phi = Math.atan2(p.z, p.y) * 180 / Math.PI;
      var roll = (Number(S.job.model.roll) || 0) + (90 - phi);
      roll = ((roll + 180) % 360 + 360) % 360 - 180;
      S.toast = { kind: 'ok', text: 'Turned the part ' + fmt(90 - phi, 1) + '° so the side you clicked faces up at A0.' };
      setModel('roll', Math.round(roll * 10) / 10);
    }
    var roll90 = function (d) { return Math.round((((Number(S.job.model.roll) || 0) + d + 540) % 360 - 180) * 10) / 10; };
    $('.rc-tb').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-axis')) setModel('axis', b.getAttribute('data-axis'));
      else if (b.getAttribute('data-act') === 'flip') setModel('flip', !S.job.model.flip);
      else if (b.getAttribute('data-act') === 'roll-') setModel('roll', roll90(-90));
      else if (b.getAttribute('data-act') === 'roll+') setModel('roll', roll90(90));
    });
    $('.rc-centre').addEventListener('change', function (e) { setModel('centre', e.target.value); });
    function setTab(t) {
      if (t === 'sim' && (!S.program || !viewer || !window.RotaryCamSim)) t = '3d';
      var was = S.ui.tab;
      S.ui.tab = t;
      root.querySelectorAll('.rc-tabs button').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-tab') === t); });
      $('.rc-3d').hidden = t === '2d'; canvas.hidden = t !== '2d';
      root.querySelectorAll('.rc-3donly').forEach(function (el) { el.style.display = t === '3d' ? '' : 'none'; });
      root.querySelectorAll('.rc-viewonly').forEach(function (el) { el.style.display = t === '2d' ? 'none' : ''; });
      root.querySelectorAll('.rc-simonly').forEach(function (el) { el.style.display = t === 'sim' ? '' : 'none'; });
      if (t === 'sim') enterSim();
      else if (was === 'sim') leaveSim();
      draw();
    }
    $('.rc-bb').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-tab')) { setTab(b.getAttribute('data-tab')); return; }
      if (b.classList.contains('rc-play')) { simPlay(); return; }
      if (b.classList.contains('rc-rewind')) { simSeek(0); return; }
      if (b.hasAttribute('data-op')) {
        var op = b.getAttribute('data-op');
        setOp(op);
        var d = side.querySelector('details[data-sec=' + op + ']');
        if (d) { d.open = true; S.ui.open[op] = true; d.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
        return;
      }
      if (viewer && b.hasAttribute('data-view')) { viewer.view(b.getAttribute('data-view')); S.ui.camUser = true; }
    });
    $('.rc-a').addEventListener('input', function (e) {
      S.ui.a = Number(e.target.value);
      $('.rc-aval').textContent = S.ui.a + '°';
      if (viewer) viewer.setA(S.ui.a);
      var add = side.querySelector('[data-idx-add]');
      if (add) add.textContent = '+ A' + S.ui.a + '°';
    });
    // ---------- simulation: play the posted G-code against a model of the stock
    var SIMSPEED = RC.simSpeed || 50, simRaf = 0, lastFrame = 0, lastMesh = 0;
    $('.rc-simspeed').value = String(SIMSPEED);
    $('.rc-simspeed').addEventListener('change', function (e) { SIMSPEED = RC.simSpeed = Number(e.target.value); });
    function fmtT(min) {
      var s = Math.max(0, Math.round(min * 60)), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = s % 60;
      return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(ss).padStart(2, '0');
    }
    function simMsg(text) {
      var el = $('.rc-simmsg');
      el.hidden = !text; el.textContent = text || '';
    }
    function dropSim() {
      if (RC.sim) { RC.sim.playing = false; RC.sim = null; }
      S.simReport = null;
      if (viewer) { viewer.simSet(null); viewer.simOverlay(null); viewer.simGhost(false); }
    }
    function enterSim() {
      if (!viewer) return;
      viewer.simMode(true);
      var R = RC.sim;
      var tk = $('.rc-tenonkey');
      if (tk) tk.style.display = S.mesh && core.tenonList(S.job, S.mesh).length ? '' : 'none';
      if (R && R.program === S.program) {
        if (R.viewer !== viewer) { viewer.simSet({ index: R.index, pos: R.pos, col: R.col }); R.viewer = viewer; R.ovRef = null; }
        if (R.checked) { simMsg(''); simShow(true); } else simMsg('Simulating the whole program\u2026');
        return;
      }
      dropSim();
      simMsg('Preparing the simulation\u2026');
      var program = S.program;
      setTimeout(function () {
        if (S.program !== program) return;
        try {
          var prog = window.RotaryCamSim.parseProgram(program.gcode, S.job);
          var sim = new window.RotaryCamSim.Sim(S.job, S.mesh, prog);
          var surf = sim.surface();
          R = RC.sim = { program: program, sim: sim, prog: prog, t: prog.total, playing: false, rapids: [], checked: false, index: sim.indices(), pos: surf.pos, col: surf.col, viewer: null };
        } catch (e) { simMsg('Couldn\u2019t simulate this program: ' + (e.message || e)); return; }
        // run the whole program once, in slices, to check it; then show the finished result
        var step = function () {
          if (RC.sim !== R) return;
          var done = R.sim.runToBudget(R.prog.count, 60, function (k, mm) { R.rapids.push({ line: R.prog.line[k] + 1, mm: mm }); });
          if (!done) {
            simMsg('Simulating the whole program\u2026 ' + Math.round(100 * R.sim.k / R.prog.count) + '%');
            setTimeout(step, 0);
            return;
          }
          R.checked = true;
          var g = R.sim.gouges(0.1), tc = R.sim.tenonCheck ? R.sim.tenonCheck(0.1) : { count: 0, sides: [] }, hc = R.sim.holderCheck ? R.sim.holderCheck() : { count: 0 };
          S.simReport = { holder: hc, tenon: tc, index: R.sim.overlayLeft ? R.sim.overlayLeft() : null, rapids: R.rapids.length, rapidLine: R.rapids.length ? R.rapids[0].line : null, rapidMm: R.rapids.length ? Math.max.apply(null, R.rapids.map(function (r) { return r.mm; })) : 0, gouges: g.count, worst: g.worst, gx: g.x, minutes: R.prog.total };
          // the dialog may have been closed and opened again meanwhile: tell the one showing now
          if (RC.session.hooks.simReady) RC.session.hooks.simReady();
        };
        step();
      }, 30);
    }
    function simReady() {
      var R = RC.sim;
      if (!R || !document.body.contains(root)) return;
      simMsg('');
      if (viewer && S.ui.tab === 'sim') { viewer.simSet({ index: R.index, pos: R.pos, col: R.col }); R.viewer = viewer; R.ovRef = null; simShow(true); }
      refresh();
    }
    function leaveSim() {
      if (RC.sim) RC.sim.playing = false;
      if (simRaf) { cancelAnimationFrame(simRaf); simRaf = 0; }
      simMsg('');
      if (viewer) { viewer.simMode(false); viewer.setA(S.ui.a); }
    }
    // bring the stock model, tool and readouts up to RC.sim.t
    function simShow(force, budget) {
      var R = RC.sim;
      if (!R || !R.checked || !viewer) return;
      var sim = R.sim, k = sim.indexAt(R.t);
      var done = sim.runToBudget(k, budget || 1e9);
      if (!done) R.t = sim.k ? R.prog.t[sim.k - 1] : 0;   // the model fell behind: let playback wait for it
      var now = performance.now();
      if (force || now - lastMesh > 70) {
        sim.surface(R.pos, R.col); viewer.simUpdate(); lastMesh = now;
        // from the start of Indexed: the part, a ghost of the stock, and what's left to clean
        var ov = sim.ov, ok = $('.rc-ovkey');
        if (ov) {
          if (R.ovRef !== ov || R.ovVersion !== ov.version) { viewer.simOverlay(ov); R.ovRef = ov; R.ovVersion = ov.version; }
          viewer.simGhost(true);
        } else if (R.ovRef) { viewer.simOverlay(null); R.ovRef = null; viewer.simGhost(false); }
        if (ok) ok.style.display = ov ? '' : 'none';
      }
      var pose = sim.poseAt(R.t), op = pose.op >= 0 ? R.prog.ops[pose.op] : null;
      if (op) {
        var len = (S.job[op.name] && S.job[op.name].tool_length) || 20;
        viewer.simToolAt({ dia: op.dia, len: len, ball: op.kind === 'ball', taper: op.taper || 0, shank: op.shank || 0, stickout: op.stickout || (S.job[op.name] && S.job[op.name].stickout) }, op.name, pose.x, pose.y, pose.z);
      } else viewer.simToolAt(null);
      viewer.setA(pose.a);
      $('.rc-simpos').value = String(Math.round(1000 * R.t / Math.max(1e-9, R.prog.total)));
      $('.rc-simtime').textContent = fmtT(R.t) + ' / ' + fmtT(R.prog.total);
      var ln = R.prog.line[Math.min(pose.k, R.prog.count - 1)];
      $('.rc-simline').innerHTML = '<b style="color:' + (op ? OPC[op.name] : 'inherit') + '">' + esc(op ? OP_NAMES[op.name] || op.name : 'Start') + '</b>Line ' + (ln + 1) + ': ' + esc((R.prog.lines[ln] || '').trim());
      $('.rc-play').textContent = R.playing ? '\u275a\u275a' : '\u25b6';
    }
    function simFrame(now) {
      var R = RC.sim;
      if (!R || S.ui.tab !== 'sim' || !document.body.contains(root)) { simRaf = 0; return; }
      if (R.playing) {
        R.t = Math.min(R.prog.total, R.t + (lastFrame ? (now - lastFrame) / 60000 * SIMSPEED : 0));
        if (R.t >= R.prog.total) R.playing = false;
      }
      lastFrame = now;
      simShow(!R.playing, 30);
      simRaf = R.playing ? requestAnimationFrame(simFrame) : 0;
    }
    function simPlay() {
      var R = RC.sim;
      if (!R || !R.checked) return;
      R.playing = !R.playing;
      if (R.playing && R.t >= R.prog.total - 1e-9) R.t = 0;
      lastFrame = 0;
      if (R.playing && !simRaf) simRaf = requestAnimationFrame(simFrame);
      simShow(true, 30);
    }
    function simSeek(t) {
      var R = RC.sim;
      if (!R || !R.checked) return;
      R.t = Math.max(0, Math.min(R.prog.total, t));
      simShow(true);
    }
    $('.rc-simpos').addEventListener('input', function (e) {
      var R = RC.sim;
      if (R) simSeek(Number(e.target.value) / 1000 * R.prog.total);
    });

    // stop the 3D view and the workers once the dialog is gone
    var watch = setInterval(function () {
      if (document.body.contains(root)) { saveUi(); return; }
      clearInterval(watch);
      if (viewer) { try { viewer.dispose(); } catch (e) {} if (RC.viewer === viewer) RC.viewer = null; viewer = null; }
      if (RC.pool && !S.busy) { RC.pool.stop(); RC.pool = null; }
    }, 1000);

    // ---------- form
    function fieldValue(f) {
      var v = get(S.job, f.k);
      if (f.q) return toDisp(v, f.q, U());
      return v === null || v === undefined ? '' : v;
    }
    function info(f) { return f.tip ? '<span class="rc-info" title="' + esc(f.tip) + '">?</span>' : ''; }
    function rowHtml(f) {
      if (f.show && !f.show(S.job)) return '';
      if (f.type === 'angles') return anglesHtml();
      if (f.type === 'tcinfo') return tcInfoHtml();
      if (f.type === 'button') return '<div class="rc-row rc-wide"' + (f.tip ? ' title="' + esc(f.tip) + '"' : '') + '><button class="rc-btn rc-act" type="button" data-act="' + f.act + '"' + (S.mesh && !S.busy ? '' : ' disabled') + '>' + esc(f.label) + '</button></div>';
      var id = 'rc-' + f.k.replace(/\./g, '-') + (f.show && /^stock\./.test(f.k) ? '-' + (S.job.stock.shape) : '');
      var v = fieldValue(f), h, tip = f.tip ? ' title="' + esc(f.tip) + '"' : '';
      var label = typeof f.label === 'function' ? f.label(S.job) : f.label;
      if (f.type === 'check') {
        h = '<div class="rc-row"' + tip + '><label for="' + id + '">' + esc(label) + info(f) + '</label><div class="rc-in"><input id="' + id + '" data-k="' + f.k + '" type="checkbox"' + (v ? ' checked' : '') + '></div>';
      } else if (f.type === 'select') {
        h = '<div class="rc-row"' + tip + '><label for="' + id + '">' + esc(label) + info(f) + '</label><div class="rc-in"><select id="' + id + '" data-k="' + f.k + '">' +
          f.opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(v) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></div>';
      } else if (f.type === 'text') {
        h = '<div class="rc-row"' + tip + '><label for="' + id + '">' + esc(label) + info(f) + '</label><div class="rc-in"><input id="' + id + '" data-k="' + f.k + '" type="text" value="' + esc(v) + '"></div>';
      } else if (f.type === 'tool') {
        var op = f.k.split('.')[0];
        var list = S.tools.filter(function (t) { return t.kind === f.kind || (f.taper && t.kind === 'v bit'); });
        var cur = get(S.job, op + '.library_id');
        h = '<div class="rc-row rc-wide"' + tip + '><div class="rc-in"><select id="rc-' + op + '-tool" data-tool="' + op + '">' +
          '<option value="">Custom tool (type it in below)</option>' +
          list.map(function (t) { return '<option value="' + esc(t.id) + '"' + (String(cur) === String(t.id) ? ' selected' : '') + '>' + esc('T' + t.number + ' · ' + t.name + ' · Ø' + toDisp(t.diameter, 'len', U()) + ' ' + unitLabel('len', U()) + (t.kind === 'v bit' ? ' (as a tapered ball)' : '')) + '</option>'; }).join('') +
          '</select></div>' + (list.length ? '' : '<div class="rc-hint">No ' + (f.kind === 'ball' ? 'ball' : 'flat') + ' end mills in the Tool Library yet.</div>');
      } else {
        h = '<div class="rc-row"' + tip + '><label for="' + id + '">' + esc(label) + info(f) + (f.fw && S.fwFields[f.fw] ? ' <span class="rc-fw" title="Read from the controller">$' + f.fw + '</span>' : '') + '</label>' +
          '<div class="rc-in"><input id="' + id + '" data-k="' + f.k + '" data-q="' + f.q + '" type="number" step="' + qd(f.q, U())[3] + '" value="' + esc(v) + '"><span class="rc-unit">' + esc(unitLabel(f.q, U())) + '</span></div>';
      }
      return h + '</div>';
    }
    function section(key, title, toggle) {
      if (key === 'corners' && !core.stockHalf(S.job)) return '';
      var open = S.ui.open[key] !== undefined ? S.ui.open[key] : key === 'tenons';
      var what = key === 'tenons' ? 'the tenons' : 'this operation';
      var head = toggle
        ? '<summary title="Click to show or hide. The tick includes or skips ' + what + '."><input type="checkbox" data-k="' + key + '.enabled"' + (S.job[key].enabled ? ' checked' : '') + ' title="Include ' + what + '"><span class="rc-swatch" style="background:' + (OPC[key] || TENON_COLOR) + '"></span>' + esc(title) + '<span class="rc-chev">▶</span></summary>'
        : '<summary>' + esc(title) + '<span class="rc-chev">▶</span></summary>';
      return '<details' + (open ? ' open' : '') + ' data-sec="' + key + '">' + head + FIELDS[key].map(rowHtml).join('') + '</details>';
    }
    function renderForm() {
      var sc = side.scrollTop;
      side.querySelectorAll('details').forEach(function (d) { S.ui.open[d.getAttribute('data-sec')] = d.open; });
      side.innerHTML = SECTIONS.map(function (s) { return section(s[0], s[1], OPS.indexOf(s[0]) >= 0 || s[0] === 'tenons'); }).join('');
      side.scrollTop = sc;
    }
    side.addEventListener('click', function (e) {
      if (e.target.matches('summary input')) { e.stopPropagation(); return; }
      var b = e.target.closest('.rc-act');
      if (b && b.getAttribute('data-act') === 'fitscale') { scaleToFit(); return; }
      if (b && b.getAttribute('data-act') === 'readmachine') { readMachine(true).then(function () { renderForm(); refresh(); }); return; }
      var c = e.target.closest('[data-idx-pick],[data-idx-del],[data-idx-add]');
      if (!c || S.busy) return;
      var list = shownAngles();
      if (c.hasAttribute('data-idx-pick')) pickAngle(Number(c.getAttribute('data-idx-pick')));
      else if (c.hasAttribute('data-idx-del')) { list.splice(Number(c.getAttribute('data-idx-del')), 1); setAngleList(list); }
      else if (c.hasAttribute('data-idx-add')) {
        if (list.indexOf(S.ui.a) < 0) list.push(S.ui.a);
        S.ui.idxSel = list.indexOf(S.ui.a);
        setAngleList(list, true);
        if (S.ui.op !== 'index') setOp('index');
      }
    });
    function scaleToFit() {
      if (!S.raw || S.busy) return;
      var f = core.fitScale(S.job, S.raw);
      S.job.model.scale = f.scale;
      renderForm(); persist(); invalidate(true);
      flash('ok', 'Scaled the part to ' + fmt(100 * f.scale, 1) + '%: ' + L(S.mesh.max[0] - S.mesh.min[0], 1) + ' long, \u00d8' + L(2 * S.mesh.rmax) + ' max. ' +
        (f.by === 'stock' ? 'The stock sets the size (1 mm to spare all round).' : 'The room before the tailstock sets the size; a longer stock or moving the tailstock out would allow more.'));
    }
    // editing a tool's settings shows that tool in 3D
    side.addEventListener('focusin', function (e) {
      var d = e.target.closest('details');
      var sec = d && d.getAttribute('data-sec');
      if (OPS.indexOf(sec) >= 0 && S.ui.op !== sec) setOp(sec);
    });
    var liveTimer = null;
    function applyField(el, live) {
      var k = el.getAttribute('data-k'), op = el.getAttribute('data-tool');
      if (op) { pickTool(op, el.value); return; }
      if (!k) return;
      var f = ALL_FIELDS.filter(function (x) { return x.k === k; })[0];
      var v;
      if (el.type === 'checkbox') v = el.checked;
      else if (el.type === 'text') v = el.value;
      else if (el.tagName === 'SELECT') v = (k === 'a_sign') ? Number(el.value) : el.value;
      else {
        if (el.value === '' || !isFinite(Number(el.value))) return;
        v = f && f.q ? fromDisp(el.value, f.q, U()) : Number(el.value);
      }
      set(S.job, k, v);
      // a machine position typed in stays until Read from ncSender is pressed
      var tk = k.match(/^rig\.tc\.(zero|change|setter|zsafe)/);
      if (tk) { var tcx = S.job.rig.tc; tcx.typed = tcx.typed || {}; tcx.typed[tk[1]] = true; }
      // one size for both tenons: the chuck end's fields drive both
      if (/^tenons\.chuck\./.test(k) && sameTenons(S.job)) set(S.job, k.replace('.chuck.', '.tailstock.'), v);
      if (k === 'tenons.same' && v) { S.job.tenons.tailstock.dia = S.job.tenons.chuck.dia; S.job.tenons.tailstock.depth = S.job.tenons.chuck.depth; }
      core.prepareJob(S.job);
      if (/\.(tool_(dia|length|number)|taper_deg|shank_dia)$/.test(k)) {
        var o = k.split('.')[0];
        S.job[o].library_id = null;
        S.job[o].tool_desc = fmt(S.job[o].tool_dia, 3) + 'mm ' + (o === 'finish' || o === 'index' ? (S.job[o].shape === 'taper' ? 'tapered ball' : 'ball') : 'flat') + ' end mill';
        var sel = side.querySelector('[data-tool=' + o + ']');
        if (sel) sel.value = '';
      }
      if (/\.enabled$/.test(k) && OPS.indexOf(k.split('.')[0]) >= 0) setOp(k.split('.')[0]);
      persist();
      if ((k === 'finish.shape' || k === 'index.shape') && v === 'taper') {
        var oj = S.job[k.split('.')[0]];
        if (!(oj.tool_dia < oj.shank_dia)) oj.tool_dia = Math.min(1.0, oj.shank_dia / 2);
      }
      if ((k === 'finish.shape' || k === 'index.shape') && /\.shape$/.test(k)) {
        var o2 = k.split('.')[0];
        S.job[o2].tool_desc = fmt(S.job[o2].tool_dia, 3) + 'mm ' + (v === 'taper' ? 'tapered ball' : 'ball') + ' end mill';
        S.job[o2].library_id = null;
      }
      if (k === 'finish.shape' || k === 'index.shape' || k === 'stock.shape' || k === 'parting.enabled' || k === 'index.enabled' || k === 'index.auto' || k === 'tenons.ends' || k === 'tenons.same' || k === 'rig.tc.route') { renderForm(); invalidate(false); return; }
      if (live) {
        clearTimeout(liveTimer);
        liveTimer = setTimeout(function () { invalidate(f && f.remesh); }, 120);
      } else invalidate(f && f.remesh);
    }
    side.addEventListener('change', function (e) { applyField(e.target, false); });
    side.addEventListener('input', function (e) { if (e.target.type === 'number') applyField(e.target, true); });
    function applyLibraryTool(op, t) {
      var j = S.job[op];
      if (t.kind === 'v bit' && j.taper_deg !== undefined) {
        // ncSender keeps tapered balls as V-bits: its diameter is the shank; the tip and taper
        // come from the library when it has them, otherwise they stay as set here
        j.shape = 'taper'; j.shank_dia = t.diameter;
        if (t.taperAngle) j.taper_deg = t.taperAngle;
        if (t.tipRadius) j.tool_dia = 2 * t.tipRadius;
        else if (!(j.tool_dia < t.diameter)) j.tool_dia = Math.min(1.0, t.diameter / 2);
      } else {
        if (j.shape !== undefined) j.shape = 'ball';
        j.tool_dia = t.diameter;
      }
      if (t.fluteLength) j.tool_length = t.fluteLength;
      // how far it sticks out: the library's when it has one; at least its flutes plus a little
      if (t.stickout) j.stickout = t.stickout;
      else if (j.tool_length && !(Number(j.stickout) >= j.tool_length + 2)) j.stickout = Math.round((j.tool_length + 6) * 100) / 100;
      j.tool_number = t.number;
      j.tool_desc = t.name;
    }
    function pickTool(op, id) {
      var t = S.tools.filter(function (x) { return String(x.id) === String(id); })[0];
      S.job[op].library_id = t ? t.id : null;
      if (t) applyLibraryTool(op, t);
      setOp(op);
      renderForm(); persist(); invalidate(false);
    }

    // ---------- where the rotary and the tool change are on the machine (from ncSender)
    // The rotary's zero is the active work offset (X0 at the jaw face, Y0 Z0 on the axis);
    // the tool change position and the tool setter come from the Manual Tool Changer, and
    // the travel height from ncSender's Safe Z. A position typed in stays until `force`.
    var MTC = 'com.ncsender.manualtoolchange';
    function readMachine(force) {
      var tc = S.job.rig.tc, typed = force ? {} : (tc.typed || {}), got = { at: Date.now() };
      var nums = function (str) { return String(str || '').split(',').map(function (v) { return parseFloat(v); }); };
      var inch = S.fw && S.fw['13'] && String(S.fw['13'].value !== undefined ? S.fw['13'].value : S.fw['13'].Value) === '1' ? 25.4 : 1;
      var quiet = function (pr) { return pr.catch(function () { return null; }); };
      return Promise.all([quiet(api.get('/api/server-state')), quiet(api.get('/api/plugins')), quiet(api.get('/api/settings'))]).then(function (r) {
        var ms = r[0] && (r[0].machineState || r[0].MachineState) || null;
        if (ms && ms.connected !== false) {
          var ws = String(ms.workspace || 'G54').toLowerCase(), off = nums(ms[ws] || ms.g54);
          if (off.length >= 2 && isFinite(off[0]) && isFinite(off[1]) && !typed.zero) { tc.zero = { x: off[0] * inch, y: off[1] * inch, z: isFinite(off[2]) ? off[2] * inch : null }; got.zero = ws.toUpperCase(); }
          var mp = nums(ms.MPos || ms.mPos), tx = Number(ms.maxTravelX), ty = Number(ms.maxTravelY);
          if (tx > 0 && ty > 0) {
            var neg = !(mp[0] > 0.5) && !(mp[1] > 0.5);
            tc.limits = { x: neg ? [-tx, 0] : [0, tx], y: neg ? [-ty, 0] : [0, ty] };
          }
        }
        var app = r[2] || {};
        if (isFinite(Number(app.safeZHeight)) && app.safeZHeight !== null && !typed.zsafe) { tc.zsafe = Number(app.safeZHeight); got.zsafe = true; }
        var plugins = Array.isArray(r[1]) ? r[1] : (r[1] && r[1].plugins) || [];
        var mtc = plugins.filter(function (p) { return p && (p.id === MTC || p.Id === MTC); })[0];
        if (!mtc || mtc.enabled === false) { got.mtc = mtc ? 'off' : 'none'; return got; }
        return quiet(api.get('/api/plugins/' + MTC + '/settings')).then(function (st) {
          var ok = function (q) { return q && isFinite(Number(q.x)) && isFinite(Number(q.y)); };
          if (st && ok(st.parking) && !typed.change) { tc.change = { x: Number(st.parking.x), y: Number(st.parking.y) }; got.change = true; }
          if (st && ok(st.toolSetter) && !typed.setter) { tc.setter = { x: Number(st.toolSetter.x), y: Number(st.toolSetter.y) }; got.setter = true; }
          got.mtc = 'on';
          return got;
        });
      }).then(function (g) {
        if (force) tc.typed = {};
        S.tcRead = g;           // (not in the job: it would change the toolpaths' key every time)
        persist();
        return g;
      });
    }
    function tcInfoHtml() {
      var tc = S.job.rig.tc || {}, g = S.tcRead || null, info = core.tcInfo(S.job), P = function (q) { return q ? 'X' + L(q.x, 1) + ' Y' + L(q.y, 1) : '\u2014'; };
      var lines = [];
      if (!tc.route) lines.push('Off: tool changes go wherever ncSender takes them.');
      else if (info) lines.push('On: round the rotary to the tool change position at ' + P(tc.change) + ', rotary zero at ' + P(tc.zero) + ' (machine).');
      else lines.push('Waiting for ' + (!tc.zero ? 'the rotary zero (G54)' : 'the tool change position') + ': tool changes go straight until it\u2019s known.');
      if (g) {
        var src = [];
        if (g.zero) src.push('the rotary zero from the controller\u2019s ' + g.zero);
        if (g.change) src.push('the tool change position' + (g.setter ? ' and tool setter' : '') + ' from the Manual Tool Changer');
        if (g.zsafe) src.push('Safe Z from Settings');
        lines.push(src.length ? 'Read ' + new Date(g.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + ': ' + src.join(', ') + '.' : 'ncSender didn\u2019t say where things are (not connected?). Type them in below.');
        if (g.mtc === 'none' || g.mtc === 'off') lines.push('The Manual Tool Changer isn\u2019t ' + (g.mtc === 'off' ? 'on' : 'installed') + ': type the tool change position in.');
      }
      var typed = Object.keys(tc.typed || {});
      if (typed.length) lines.push('Typed in: ' + typed.map(function (k) { return { zero: 'rotary zero', change: 'tool change', setter: 'tool setter', zsafe: 'safe Z' }[k]; }).join(', ') + ' (kept until you read from ncSender again).');
      return '<div class="rc-row rc-wide"><div class="rc-hint" style="margin:0">' + lines.map(esc).join('<br>') + '</div></div>' +
        '<div class="rc-row rc-wide"><button class="rc-btn rc-act" type="button" data-act="readmachine" title="Read the rotary zero (G54), the tool change position and tool setter (Manual Tool Changer) and Safe Z from ncSender again">Read from ncSender</button></div>';
    }

    // ---------- model
    function placeModel() {
      if (!S.raw) return;
      S.mesh = core.placeMesh(S.raw, S.job.model);
      S.sil = core.silhouette(S.mesh, 0.5);
    }
    function invalidate(remesh) {
      if (remesh) { placeModel(); S.partDirty = true; }
      if (S.program) { S.program = null; S.plan = null; S.maps = null; S.resultKey = null; store.drop('result'); }
      if (RC.sim) dropSim();
      if (S.ui.tab === 'sim') setTab('3d');
      S.warnings = [];
      refresh();
    }
    function openFile(file) {
      if (!file || S.busy) return;
      settleFocus();
      var isStep = /\.ste?p$/i.test(file.name), isStl = /\.stl$/i.test(file.name), isProj = /\.rcam$/i.test(file.name);
      if (isProj) { openProject(file); return; }
      if (!isStep && !isStl) { S.problems = ['Open a .stl, .step or .stp part, or a .rcam project.']; refresh(true); return; }
      S.fileName = file.name; S.raw = null; S.mesh = null; S.source = null; S.indexLeft = null; S.ui.idxSel = -1; S.busy = 'Reading ' + file.name + '…';
      invalidate(false);
      file.arrayBuffer().then(function (buf) {
        if (window.RotaryCamProject && window.RotaryCamProject.looksLikeProject(new Uint8Array(buf, 0, Math.min(64, buf.byteLength)))) return { project: buf };
        if (isStl) return { tris: core.parseSTL(buf) };
        S.source = { name: file.name, bytes: new Uint8Array(buf.slice(0)) };   // the worker takes the buffer
        S.busy = 'Reading STEP (Open CASCADE)…'; refresh();
        return readStep(host, buf);
      }).then(function (r) {
        if (r.project) { S.busy = ''; openProject(new Blob([r.project]), file.name); return; }
        S.raw = r.tris; S.busy = ''; S.solids = r.solids || 1; S.skipped = r.skipped || 0;
        var ax = core.longestAxis(S.raw);
        S.job.model.axis = ax; S.job.model.roll = 0; S.job.model.flip = false; S.job.model.scale = 1;
        S.toast = { kind: 'ok', text: 'Turning axis set to the model’s ' + ax.toUpperCase() + ', its longest side. Use the buttons on the view if that’s wrong, and Flip ends to change which end goes in the chuck.' };
        store.save('last', { name: S.fileName, tris: S.raw, solids: S.solids, skipped: S.skipped, source: S.source });
        renderForm(); persist();
        invalidate(true);
        S.ui.camUser = false; S.ui.cam = null;
        if (viewer) viewer.view('iso');
      }).catch(function (e) {
        S.busy = ''; S.fileName = ''; S.problems = ['Could not read ' + file.name + ': ' + (e.message || e)];
        refresh(true);
      });
    }
    // ---------- projects (.rcam): part, settings, tools, G-code and toolpaths in one file
    var PJ = window.RotaryCamProject;
    function projectName() { return (S.fileName || 'part').replace(/\.[^.]+$/, '').replace(/[^\w.\- ]+/g, '_') + '.rcam'; }
    function usedTools() {
      var out = [];
      OPS.forEach(function (op) {
        var j = S.job[op];
        if (!j || (!j.enabled && !(op === 'corners' && core.cornersActive(S.job)))) return;
        var t = S.tools.filter(function (x) { return String(x.id) === String(j.library_id); })[0];
        out.push({ op: op, number: j.tool_number, desc: j.tool_desc, dia: j.tool_dia, library: t ? { id: t.id, number: t.number, name: t.name, kind: t.kind, diameter: t.diameter } : null });
      });
      return out;
    }
    function saveProject() {
      if (!S.raw || S.busy || !PJ) return;
      var btn = $('.rc-saveproj'); btn.disabled = true;
      S.busy = 'Saving the project…'; refresh();
      var name = projectName();
      PJ.save({
        name: S.fileName, tris: S.raw, solids: S.solids, skipped: S.skipped,
        source: S.source && /\.ste?p$/i.test(S.source.name) ? S.source : null,
        job: S.job, tools: usedTools(), units: S.units, app: 'Rotary CAM ' + core.VERSION, programName: programName(),
        result: S.program ? { plan: S.plan, maps: S.maps, program: S.program, seconds: S.seconds, warnings: S.warnings, left: S.indexLeft } : null
      }).then(function (bytes) {
        S.busy = '';
        var blob = new Blob([bytes], { type: 'application/zip' });
        RC.lastProject = { name: name, size: bytes.length };
        // a real Save As where the browser has one (ncSender on this computer); a download otherwise
        if (window.showSaveFilePicker && !host.test && !RC.noPicker) {
          return window.showSaveFilePicker({ suggestedName: name, types: [{ description: 'Rotary CAM project', accept: { 'application/zip': ['.rcam'] } }] }).then(function (h) {
            return h.createWritable().then(function (w) { return w.write(blob).then(function () { return w.close(); }); }).then(function () { flash('ok', 'Saved ' + h.name + ' (' + fmt(bytes.length / 1e6, 1) + ' MB).'); });
          }, function (e) { if (e && e.name === 'AbortError') { refresh(); return; } download(blob, name); });
        }
        download(blob, name);
      }).catch(function (e) { S.busy = ''; flash('err', 'Couldn\u2019t save the project: ' + (e.message || e)); }).then(function () { btn.disabled = !S.raw; });
      function download(blob, nm) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = nm;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 10000);
        flash('ok', 'Saved ' + nm + ' (' + fmt(blob.size / 1e6, 1) + ' MB) to your downloads. Open it again with Open\u2026');
      }
    }
    // a field still being edited applies its change now, to the job it belongs to
    function settleFocus() { var a = document.activeElement; if (a && root.contains(a) && a.blur) a.blur(); }
    function openProject(file, shownName) {
      settleFocus();
      if (!PJ) { S.problems = ['This copy of Rotary CAM can\u2019t open projects.']; refresh(true); return; }
      var label = shownName || file.name;
      S.busy = 'Opening ' + label + '…'; refresh();
      file.arrayBuffer().then(function (buf) { return PJ.load(new Uint8Array(buf)); }).then(function (pr) {
        var notes = [];
        S.fileName = pr.name; S.raw = pr.tris; S.solids = pr.solids; S.skipped = pr.skipped; S.source = pr.source;
        var job = core.prepareJob(migrate(core.deepMerge(core.DEFAULTS, pr.job || {}), pr.job));
        var before = JSON.stringify(job);
        // the rotary, spindle and tool change belong to this machine, not the project
        job.rig = JSON.parse(JSON.stringify(S.job.rig));
        // this ncSender's units and machine rates
        job.units = S.units;
        FIELDS.machine.forEach(function (f) {
          if (!f.fw) return;
          var e = S.fw[f.fw], v = e && parseFloat(e.value !== undefined ? e.value : e.Value);
          if (isFinite(v) && v > 0) set(job, f.k, v);
        });
        core.prepareJob(job);
        var same = JSON.stringify(job) === before;   // the saved G-code still fits this machine
        // tools: keep the project's own; only stay linked to a library tool that still matches
        OPS.forEach(function (op) {
          var j = job[op];
          if (!j || j.library_id == null) return;
          var t = S.tools.filter(function (x) { return String(x.id) === String(j.library_id); })[0];
          if (t && Math.abs(t.diameter - (j.shape === 'taper' ? j.shank_dia : j.tool_dia)) < 1e-3 && String(t.number) === String(j.tool_number)) return;
          j.library_id = null;
          if (j.enabled) notes.push(OP_NAMES[op] + ' T' + j.tool_number + ' (' + j.tool_desc + ')');
        });
        S.job = job;
        if (S.program || RC.sim) { S.program = null; S.plan = null; S.maps = null; S.resultKey = null; if (RC.sim) dropSim(); }
        S.warnings = [];
        var r = pr.result, msg = 'Opened the project ' + label + '.';
        if (r && r.program && same) {
          S.plan = r.plan; S.maps = r.maps; S.program = r.program; S.seconds = r.seconds; S.warnings = r.warnings || []; S.indexLeft = r.left || null;
          S.resultKey = jobKey();
          store.save('result', { key: S.resultKey, plan: S.plan, maps: S.maps, program: S.program, seconds: S.seconds, warnings: S.warnings, left: S.indexLeft });
          msg += ' Its G-code and toolpaths are ready to simulate or load.';
        } else {
          store.drop('result'); S.indexLeft = r && r.left || null;
          if (r && r.program) msg += ' Its G-code was made for ' + (pr.meta.units !== S.units ? (pr.meta.units === 'in' ? 'inches' : 'millimetres') : 'another setup (axis rates, rotary, spindle or tool change position)') + ', so generate the toolpaths again.';
        }
        if (notes.length) msg += ' Not in your Tool Library as saved, so the project\u2019s own settings are used: ' + notes.join(', ') + '.';
        store.save('last', { name: S.fileName, tris: S.raw, solids: S.solids, skipped: S.skipped, source: S.source });
        S.busy = ''; S.partDirty = true;
        placeModel();
        renderForm(); persist();
        S.ui.camUser = false; S.ui.cam = null;
        if (S.ui.tab === 'sim') setTab('3d');
        S.toast = { kind: 'ok', text: msg };
        refresh(); showPaths();
        if (viewer) viewer.view('iso');
      }).catch(function (e) {
        S.busy = ''; S.problems = ['Couldn\u2019t open ' + label + ': ' + (e.message || e)];
        refresh(true);
      });
    }
    $('.rc-saveproj').addEventListener('click', saveProject);
    $('.rc-open').addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () { openFile(fileInput.files[0]); fileInput.value = ''; });
    var drop = $('.rc-filebox');
    ['dragenter', 'dragover'].forEach(function (t) { root.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('rc-drag'); }); });
    ['dragleave', 'drop'].forEach(function (t) { root.addEventListener(t, function () { drop.classList.remove('rc-drag'); }); });
    root.addEventListener('drop', function (e) { e.preventDefault(); if (e.dataTransfer && e.dataTransfer.files[0]) openFile(e.dataTransfer.files[0]); });

    // ---------- generate
    function poolSize() {
      var n = (navigator.hardwareConcurrency || 2) - 1;
      return Math.max(1, Math.min(4, n));
    }
    function generate() {
      if (!S.mesh || S.busy) return;
      // where the rotary and the tool change are right now (a moment, then on regardless)
      if (!S.tcFresh) {
        S.busy = 'Reading where the rotary and the tool change are\u2026'; refresh();
        var go = function () { S.busy = ''; S.tcFresh = true; generate(); S.tcFresh = false; };
        Promise.race([readMachine(false), new Promise(function (r) { setTimeout(r, 2500); })]).then(go, go);
        return;
      }
      core.prepareJob(S.job);
      S.job.units = S.units;
      S.problems = core.check(S.job, S.mesh, L);
      if (S.problems.length) { refresh(true); return; }
      var plan, wm = core.workMesh(S.job, S.mesh);
      try { plan = core.plan(S.job, wm); } catch (e) { S.problems = [e.message]; refresh(true); return; }
      S.cancel = false; S.busy = 'Starting the CAM engine…'; S.program = null; refresh();
      var t0 = performance.now(), key = jobKey();
      var ui = function () { return RC.session.hooks; };
      var cancelled = function () { return S.cancel; };
      RC.pool = RC.pool || new WorkerPool(host, poolSize());
      RC.pool.start().then(function (pool) {
        ui().setBusy('Calculating…');
        return pool.run(wm.tris, S.job, plan, function (done, total) {
          ui().setBusy('Calculating ' + done + ' / ' + total + ' angles…', done / total);
        }, cancelled);
      }).then(function (maps) {
        if (!maps || !S.job.finish.enabled) return maps;
        return core.refineFinish(S.job, core.finishPoints(S.job, plan, maps), function (groups) {
          return RC.pool.probe(groups, cancelled).then(function (z) { if (!z) throw { cancelled: true }; return z; });
        }, function (round, segs) {
          ui().setBusy('Checking sharp features, pass ' + round + ' (' + fmt(segs, 0) + ' spots)…');
        }).then(function (r) { maps.finPts = r.pts; maps.finRefined = r.added; return maps; });
      }).then(function (maps) {
        if (!maps || !core.indexActive(S.job) || !window.RotaryCamSim) return maps;
        // play the program up to the end of finishing to see what it leaves, then plan the indexed passes
        var Sm = window.RotaryCamSim, pre = core.buildProgram(S.job, plan, maps, S.fileName, function () {}, function () {}, { stopAfterFinish: true });
        var sim = new Sm.Sim(S.job, S.mesh, Sm.parseProgram(pre.gcode, S.job));
        return new Promise(function (resolve, reject) {
          (function step() {
            if (cancelled()) { reject({ cancelled: true }); return; }
            var done = sim.runToBudget(sim.prog.count, 80);
            ui().setBusy('Finding what the rotary passes missed\u2026 ' + Math.round(100 * sim.k / Math.max(1, sim.prog.count)) + '%');
            if (done) resolve(); else setTimeout(step, 0);
          })();
        }).then(function () {
          var left = Sm.indexLeftover(sim, S.job, S.mesh), tn = 0;
          while (tn < left.n && left.target[tn]) tn++;
          S.indexLeft = { n: tn, x: left.x.slice(0, tn), y: left.y.slice(0, tn), z: left.z.slice(0, tn), s: left.s };
          return core.planIndexed(S.job, left, function (groups) {
            return RC.pool.drop(groups, cancelled).then(function (z) { if (!z) throw { cancelled: true }; return z; });
          }, function (x, y, a) { return sim.hullTop(x, y, a); }, function (t) { ui().setBusy('Indexed: ' + t + '\u2026'); }, plan.indexLimits);
        }).then(function (ix) { delete ix.alive; maps.indexed = ix; return maps; });
      }).then(function (maps) {
        if (!maps) { S.busy = ''; ui().refresh(); return; }
        var warns = [];
        var prog = core.buildProgram(S.job, plan, maps, S.fileName, function () {}, function (s) { warns.push(s); }, { paths: true });
        delete maps.finPts;
        S.plan = plan; S.maps = maps; S.program = prog; S.resultKey = key;
        if (RC.sim) { RC.sim = null; S.simReport = null; }
        S.seconds = (performance.now() - t0) / 1000;
        S.warnings = warns.concat(machineWarnings(prog));
        S.busy = '';
        if (!core.indexActive(S.job)) S.indexLeft = null;
        store.save('result', { key: key, plan: plan, maps: maps, program: prog, seconds: S.seconds, warnings: S.warnings, left: S.indexLeft });
        ui().showPaths();
        ui().renderForm();
        ui().refresh();
      }).catch(function (e) {
        if (e && e.cancelled) { S.busy = ''; ui().refresh(); return; }
        S.busy = ''; S.problems = ['Toolpath calculation failed: ' + (e.message || e)];
        if (RC.pool) { RC.pool.stop(); RC.pool = null; }
        ui().refresh(true);
      });
    }
    function setBusy(text, frac) {
      S.busy = text;
      if (!document.body.contains(root)) return;
      $('.rc-status').textContent = text;
      if (frac !== undefined) { $('.rc-prog').style.display = 'block'; $('.rc-prog i').style.width = (100 * frac).toFixed(1) + '%'; }
    }
    function machineWarnings(prog) {
      var w = [], fw = S.fw;
      var num = function (k) { var v = fw[k] && parseFloat(fw[k].value !== undefined ? fw[k].value : fw[k].Value); return isFinite(v) ? v : null; };
      var soft = num('20'), aTravel = num('133');
      if (soft === 1 && aTravel && prog.maxA > aTravel) w.push('Soft limits are on ($20=1) and A travel ($133) is ' + fmt(aTravel) + '°, but this program turns A to ' + fmt(prog.maxA, 0) + '°. grblHAL will alarm. Turn soft limits off for this job or raise $133.');
      else if (!aTravel) w.push('This program turns A continuously to ' + fmt(prog.maxA, 0) + '° (' + fmt(prog.maxA / 360, 0) + ' turns). If A has soft limits, check $133 first.');
      if (S.maps && S.maps.finZ && S.maps.finZ.length) {
        var thin = Infinity, thinX = 0;
        S.maps.finZ.forEach(function (row) { for (var c = 1; c < row.length - 1; c++) if (isFinite(row[c]) && row[c] < thin) { thin = row[c]; thinX = S.plan.finLo + (c - 1) * S.job.finish.pitch; } });
        if (thin <= 0.05) w.push('Near X' + L(thinX, 1) + ' the part doesn\u2019t go round the rotary axis, so the cutter goes past the axis and only the part itself holds the two ends together there. Check the centring, or reach a tenon past it if it\u2019s near an end.');
        else if (thin < Math.max(3, S.job.finish.tool_dia)) w.push('Near X' + L(thinX, 1) + ' the part comes within ' + L(thin) + ' of the rotary axis, so the stock will be very thin there. Check the centring, or reach a tenon past it if it\u2019s near an end.');
      }
      var maxRpm = num('30');
      ['rough', 'finish'].forEach(function (op) {
        if (S.job[op].enabled && maxRpm && S.job[op].rpm > maxRpm) w.push((op === 'rough' ? 'Roughing' : 'Finishing') + ' spindle speed ' + fmt(S.job[op].rpm, 0) + ' rpm is above the controller maximum ($30=' + fmt(maxRpm, 0) + ').');
      });
      return w;
    }
    $('.rc-gen').addEventListener('click', generate);
    $('.rc-cancel').addEventListener('click', function () { S.cancel = true; });
    $('.rc-msgs').addEventListener('click', function (e) {
      if (e.target.closest('.rc-fitpart')) { scaleToFit(); return; }
      var b = e.target.closest('.rc-fitstock');
      if (!b || !S.mesh) return;
      core.fitStock(S.job, S.mesh);
      renderForm(); persist(); invalidate(false);
    });

    // ---------- output
    function programName() {
      var stem = (S.fileName || 'part').replace(/\.[^.]+$/, '').replace(/[^\w.\- ]+/g, '_');
      return stem + '_rotary.nc';
    }
    function flash(kind, text) { S.toast = { kind: kind, text: text }; refresh(); }
    $('.rc-load').addEventListener('click', function (e) {
      var btn = e.currentTarget; btn.disabled = true;
      api.post('/api/gcode-files/load-temp', { filename: programName(), content: S.program.gcode }).then(function (r) {
        if (!r.ok) throw new Error('ncSender said ' + r.status);
        closeDialog();
      }).catch(function (err) { btn.disabled = false; flash('err', 'Couldn’t load the program: ' + err.message); });
    });
    $('.rc-save').addEventListener('click', function (e) {
      var btn = e.currentTarget; btn.disabled = true;
      freePath(programName()).then(function (path) {
        return api.post('/api/gcode-files/file/save', { path: path, content: S.program.gcode }).then(function (r) {
          if (!r.ok) throw new Error('save failed (' + r.status + ')');
          flash('ok', 'Saved to File Manager: ' + path);
        });
      }).catch(function (err) { flash('err', 'Couldn’t save: ' + err.message); }).then(function () { btn.disabled = false; });
    });
    function freePath(name) {
      var stem = name.replace(/\.nc$/, '');
      var tryN = function (n) {
        var path = 'Rotary CAM/' + (n < 2 ? name : stem + ' (' + n + ').nc');
        return fetch(host.base + '/api/gcode-files/file?path=' + encodeURIComponent(path)).then(function (r) {
          if (r.status === 404) return path;
          if (!r.ok) throw new Error('could not check File Manager (' + r.status + ')');
          if (n > 500) throw new Error('too many saved copies');
          return tryN(n + 1);
        });
      };
      return tryN(1);
    }
    $('.rc-dl').addEventListener('click', function () {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([S.program.gcode], { type: 'text/plain' }));
      a.download = programName();
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
    });

    // ---------- status, messages, stats
    function refresh(keepProblems) {
      if (!document.body.contains(root)) return;
      core.prepareJob(S.job);
      if (!keepProblems && S.mesh && !S.busy) S.problems = core.check(S.job, S.mesh, L);
      var name = $('.rc-name'), meta = $('.rc-meta');
      if (S.mesh) {
        name.textContent = S.fileName;
        meta.textContent = (Math.abs(core.scaleOf(S.job.model) - 1) > 1e-9 ? 'scaled ' + fmt(100 * core.scaleOf(S.job.model), 1) + '% · ' : '') + (S.solids > 1 ? S.solids + ' bodies · ' : '') + (S.skipped ? S.skipped + ' surface bod' + (S.skipped > 1 ? 'ies' : 'y') + ' ignored · ' : '') + fmt(S.mesh.count, 0) + ' triangles · ' + L(S.mesh.max[0] - S.mesh.min[0], 1) + ' long · Ø' + L(S.mesh.rmax * 2) + ' max';
      } else if (S.busy && S.fileName) { name.textContent = S.fileName; meta.textContent = S.busy; }
      else { name.textContent = 'No part loaded'; meta.textContent = 'Drop a .stl, .step, .stp or .rcam file here.'; }
      $('.rc-units').textContent = S.units === 'in' ? 'Inches' : 'Millimetres';
      var msgs = [];
      S.problems.forEach(function (p) {
        var fix = /stock/.test(p) && S.mesh ? '<button class="rc-btn rc-fitstock" type="button" title="Size the stock to the part with 1 mm to spare all round">Fit the stock to the part</button><button class="rc-btn rc-fitpart" type="button" style="margin-left:0" title="Shrink the part to fit the stock with 1 mm to spare all round">Scale the part to fit</button>' : '';
        msgs.push('<div class="rc-msg rc-err"><b>Fix</b><span>' + esc(p) + '</span>' + fix + '</div>');
      });
      S.warnings.forEach(function (p) { msgs.push('<div class="rc-msg rc-warn"><b>Check</b><span>' + esc(p) + '</span></div>'); });
      var ii = S.program && S.program.info && S.program.info.index;
      if (ii) {
        if (!(ii.target > 0.5)) msgs.push('<div class="rc-msg rc-ok"><b>Indexed</b><span>The rotary passes left nothing thicker than ' + esc(L(S.job.index.min_left)) + ' to clean up, so there are no indexed passes.</span></div>');
        else {
          var pct = Math.round(100 * ii.removed / ii.target), where = (ii.missed || []).map(function (mm) { return 'X' + L(mm.x0, 1) + '\u2013' + L(mm.x1, 1); });
          var at = ii.angles.length ? 'At A' + ii.angles.map(function (a) { return fmt(a, 1) + '\u00b0'; }).join(', A') + ' it reaches ' + pct + '%' : 'No A angle reaches any of it with this tool';
          msgs.push('<div class="rc-msg ' + (pct >= 95 ? 'rc-ok' : 'rc-warn') + '"><b>Indexed</b><span>' + at + ' of what the rotary passes left' +
            (where.length && pct < 100 ? '. The rest, near ' + esc(where.join(' and ')) + ', can\u2019t be reached from any angle with this tool; a smaller ball may get some of it.' : '.') +
            (ii.holder && ii.holder.volume >= 1 ? ' The collet nut keeps it off ' + fmt(ii.holder.volume, 0) + ' mm\u00b3 of that; about ' + esc(L(ii.holder.need)) + ' more stickout would reach most of it.' : '') + '</span></div>');
        }
      }
      var sr = S.program && S.simReport;
      if (sr) {
        if (sr.rapids) msgs.push('<div class="rc-msg rc-err"><b>Simulation</b><span>' + sr.rapids + ' rapid move' + (sr.rapids > 1 ? 's cut' : ' cuts') + ' into the stock (up to ' + esc(L(sr.rapidMm)) + '), first at line ' + sr.rapidLine + '.</span></div>');
        if (sr.gouges) msgs.push('<div class="rc-msg rc-err"><b>Simulation</b><span>The cutter goes below the part surface in ' + sr.gouges + ' spot' + (sr.gouges > 1 ? 's' : '') + ', up to ' + esc(L(sr.worst)) + ' deep, near X' + esc(L(sr.gx, 1)) + '. They show red in the simulation.</span></div>');
        var tc = sr.tenon || { count: 0, sides: [] };
        if (tc.count) msgs.push('<div class="rc-msg rc-err"><b>Simulation</b><span>The cutter goes into the ' + esc(tc.side) + ' end tenon, up to ' + esc(L(tc.worst)) + ' deep, near X' + esc(L(tc.x, 1)) + '.</span></div>');
        if (sr.index && sr.index.total > 0.5) msgs.push('<div class="rc-msg rc-ok"><b>Simulation</b><span>Indexed cuts away ' + Math.round(100 * (1 - sr.index.left / sr.index.total)) + '% of what the rotary passes left. What\u2019s still there shows yellow.</span></div>');
        var hc = sr.holder || { count: 0 };
        if (hc.count) msgs.push('<div class="rc-msg rc-err"><b>Simulation</b><span>The ' + esc(hc.comp) + ' runs into the ' + esc(hc.what) + ' in ' + esc(OP_NAMES[hc.op] || hc.op) + ', up to ' + esc(L(hc.worst)) + ', near X' + esc(L(hc.x, 1)) + ' (line ' + hc.line + '; ' + hc.count + ' move' + (hc.count > 1 ? 's' : '') + ', the first at line ' + hc.first + ').</span></div>');
        if (!sr.rapids && !sr.gouges && !tc.count && !hc.count) msgs.push('<div class="rc-msg rc-ok"><b>Simulation</b><span>Whole program simulated (' + fmtT(sr.minutes) + '): no rapids into the stock, nothing cut below the part' + (tc.sides && tc.sides.length ? ', ' + (tc.sides.length > 1 ? 'both tenons' : 'the ' + tc.sides[0] + ' end tenon') + ' left whole' : '') + ', the collet nut and spindle clear of the stock and the rotary.</span></div>');
      }
      if (S.toast) msgs.push('<div class="rc-msg rc-' + S.toast.kind + '"><span>' + esc(S.toast.text) + '</span></div>');
      S.toast = null;
      // only when they change: a field's change on blur (clicking a message's button) would
      // otherwise rebuild the button under the pointer and lose the click
      var mh = msgs.join('');
      if (RC.msgHtml !== mh || !$('.rc-msgs').childElementCount !== !mh) { $('.rc-msgs').innerHTML = mh; RC.msgHtml = mh; }
      var st = $('.rc-stats');
      if (S.program) {
        var p = S.program, mins = p.minutes, h = Math.floor(mins / 60), m = Math.round(mins % 60);
        st.innerHTML = [
          ['Cutting time', (h ? h + ' h ' : '') + m + ' min', 'Estimated from the feeds and the axis speed limits'],
          ['G-code', fmt(p.lines, 0) + ' lines', ''],
          ['A turns', fmt(p.maxA / 360, 0), 'A turns continuously; this is how many turns in total'],
          ['Limited by axis speed', fmt(100 * p.limitedMoves / Math.max(1, p.lines), 0) + '% of moves', 'Moves where an axis max rate, not the feed, sets the speed (often A on small diameters)'],
          ['Calculated in', fmt(S.seconds, 1) + ' s', '']
        ].map(function (x) { return '<div title="' + esc(x[2]) + '">' + esc(x[0]) + '<b>' + esc(x[1]) + '</b></div>'; }).join('');
      } else st.innerHTML = '';
      var busy = !!S.busy;
      $('.rc-gen').disabled = busy || !S.mesh || S.problems.length > 0;
      $('.rc-open').disabled = busy;
      $('.rc-saveproj').disabled = busy || !S.raw || !PJ;
      $('.rc-cancel').hidden = !busy || !/Calculating|Starting|Checking|Finding|Indexed/.test(S.busy);
      $('.rc-prog').style.display = busy && /Calculating/.test(S.busy) ? 'block' : 'none';
      if (!busy) $('.rc-prog i').style.width = '0';
      $('.rc-status').textContent = S.busy || (S.program ? 'Ready: ' + programName() : '');
      ['.rc-load', '.rc-save', '.rc-dl'].forEach(function (s) { $(s).disabled = busy || !S.program; });
      $('.rc-load').classList.toggle('rc-primary', !!S.program && !busy);
      $('.rc-gen').classList.toggle('rc-primary', !S.program || busy);
      syncToolbar();
      syncViewer(S.partDirty); S.partDirty = false;
      syncIndex();
      syncToolChanges();
      if (!S.program && viewer) { viewer.setToolpath('rough', null); viewer.setToolpath('finish', null); }
      draw();
    }

    // ---------- unrolled preview (2D)
    var RAMP = ['#cde2fb', '#b7d3f6', '#9ec5f4', '#86b6ef', '#6da7ec', '#5598e7', '#3987e5', '#2a78d6', '#256abf', '#1c5cab', '#184f95', '#104281', '#0d366b'];
    var RAMP_RGB = RAMP.map(function (h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; });
    function rampAt(t) {
      t = Math.max(0, Math.min(1, t)) * (RAMP_RGB.length - 1);
      var i = Math.min(RAMP_RGB.length - 2, Math.floor(t)), f = t - i, a = RAMP_RGB[i], b = RAMP_RGB[i + 1];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
    }
    function draw() {
      if (canvas.hidden) return;
      var dpr = window.devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
      if (!W || !H) return;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      var g = canvas.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      var ink = TH.ink, muted = TH.muted, grid = 'rgba(128,128,128,.22)';
      var u = U(), lq = qd('len', u), D = function (v) { return v / lq[1]; };
      g.font = '12px system-ui,sans-serif';
      if (!S.mesh) {
        g.fillStyle = muted; g.textAlign = 'center';
        g.fillText(S.busy || 'Open a part to see it here', W / 2, H / 2);
        return;
      }
      var job = S.job, stock = job.stock_radius;
      var xMin = Math.min(job.chuck_face_x, S.mesh.min[0]) - 5;
      var xMax = job.tailstock_x - S.mesh.max[0] < 60 ? Math.max(job.tailstock_x, S.mesh.max[0]) + 5 : S.mesh.max[0] + 20;
      var Lm = 58, R = 18, top = 26, bottomPad = 56;
      var hTop = S.program ? Math.round((H - top - bottomPad - 40) * 0.48) : 0;
      var pTop = S.program ? top + hTop + 46 : top + 6, pH = H - pTop - bottomPad;
      var sx = function (x) { return Lm + (x - xMin) / (xMax - xMin) * (W - Lm - R); };
      if (S.program && S.maps && S.maps.finZ.length && S.plan.finNrev !== undefined) {
        var fz = S.maps.finZ, nA = fz.length, nC = fz[0].length, zmin = Infinity, zmax = -Infinity, j, c;
        for (j = 0; j < nA; j++) for (c = 0; c < nC; c++) { var v = fz[j][c]; if (isFinite(v)) { if (v < zmin) zmin = v; if (v > zmax) zmax = v; } }
        var x0 = sx(S.plan.finLo), x1 = sx(S.plan.finHi), iw = Math.max(1, Math.round(x1 - x0)), ih = Math.max(1, hTop);
        var img = g.createImageData(Math.round(iw * dpr), Math.round(ih * dpr)), d = img.data, IW = img.width, IH = img.height;
        var pitch = job.finish.pitch;
        for (var py = 0; py < IH; py++) {
          var ang = (1 - (py + 0.5) / IH) * 360, jj = Math.min(nA - 1, Math.floor(ang / S.plan.step));
          for (var px = 0; px < IW; px++) {
            var x = S.plan.finLo + (px + 0.5) / IW * (S.plan.finHi - S.plan.finLo);
            var k = Math.round((x - S.plan.finLo - pitch * (S.plan.angles[jj] / 360)) / pitch) + 1;
            k = Math.max(0, Math.min(nC - 1, k));
            var z = fz[jj][k], col = isFinite(z) ? rampAt((z - zmin) / Math.max(1e-9, zmax - zmin)) : [200, 200, 200];
            var o = (py * IW + px) * 4;
            d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
          }
        }
        g.putImageData(img, Math.round(x0 * dpr), Math.round(top * dpr));
        g.fillStyle = ink; g.textAlign = 'left'; g.font = '600 12px system-ui,sans-serif';
        g.fillText('Finish surface, unrolled (X along, A around; darker = larger radius)', Lm, top - 9);
        g.font = '11px system-ui,sans-serif'; g.fillStyle = muted; g.textAlign = 'right';
        (ih < 110 ? [0, 180, 360] : [0, 90, 180, 270, 360]).forEach(function (a) { var y = top + ih * (1 - a / 360); g.fillText(a + '°', Lm - 6, y + 4); });
        var lgX = W - R - 150, lgY = top + ih + 8;
        for (var q = 0; q < 120; q++) { var cc = rampAt(q / 119); g.fillStyle = 'rgb(' + cc.map(Math.round).join(',') + ')'; g.fillRect(lgX + q, lgY, 1, 8); }
        g.fillStyle = muted; g.textAlign = 'left'; g.fillText('R' + fmt(D(zmin), u === 'in' ? 3 : 1), lgX - 2, lgY + 21); g.textAlign = 'right'; g.fillText('R' + fmt(D(zmax), u === 'in' ? 3 : 1) + ' ' + lq[0], lgX + 120, lgY + 21);
      }
      var sy = function (r) { return pTop + pH - r / (stock * 1.06) * pH; };
      g.strokeStyle = grid; g.lineWidth = 1; g.fillStyle = muted; g.textAlign = 'right'; g.font = '11px system-ui,sans-serif';
      var stepR = u === 'in' ? (stock > 25 ? 12.7 : 6.35) : (stock > 30 ? 10 : 5);
      for (var rr = 0; rr <= stock + 0.01; rr += stepR) { g.beginPath(); g.moveTo(Lm, sy(rr) + .5); g.lineTo(W - R, sy(rr) + .5); g.stroke(); g.fillText('R' + fmt(D(rr), 2), Lm - 6, sy(rr) + 4); }
      g.textAlign = 'center';
      var span = D(xMax - xMin), xs0 = u === 'in' ? (span > 12 ? 2 : 1) : (span > 300 ? 50 : 25);
      for (var xx = Math.ceil(D(xMin) / xs0) * xs0; xx <= D(xMax); xx += xs0) g.fillText('X' + fmt(xx, 2), sx(xx * lq[1]), pTop + pH + 16);
      g.fillStyle = 'rgba(214,69,69,.10)';
      g.fillRect(sx(xMin), pTop, sx(job.chuck_face_x + job.chuck_clearance) - sx(xMin), pH);
      if (job.tailstock_x - job.tailstock_clearance < xMax) g.fillRect(sx(job.tailstock_x - job.tailstock_clearance), pTop, sx(xMax) - sx(job.tailstock_x - job.tailstock_clearance), pH);
      g.fillStyle = muted; g.textAlign = 'left'; g.fillText('chuck', sx(xMin) + 4, pTop + pH - 6);
      if (job.tailstock_x < xMax) { g.textAlign = 'right'; g.fillText('tailstock', sx(xMax) - 4, pTop + pH - 6); }
      g.strokeStyle = muted; g.lineWidth = 1.5; g.beginPath(); g.moveTo(sx(job.chuck_face_x), sy(stock)); g.lineTo(sx(Math.min(job.tailstock_x, xMax)), sy(stock)); g.stroke();
      g.fillStyle = muted; g.textAlign = 'right'; g.fillText('stock, largest radius', sx(Math.min(job.tailstock_x - job.tailstock_clearance, xMax)) - 6, sy(stock) - 5);
      if (S.program && S.program.info.rough) {
        g.setLineDash([3, 4]); g.strokeStyle = OPC.rough; g.lineWidth = 1;
        S.program.info.rough.layers.forEach(function (Lr) { g.beginPath(); g.moveTo(sx(S.plan.roughX[0]), sy(Lr) + .5); g.lineTo(sx(S.plan.roughX[S.plan.roughX.length - 1]), sy(Lr) + .5); g.stroke(); });
        g.setLineDash([]);
      }
      if (S.program && S.maps.finZ.length) {
        var fz2 = S.maps.finZ, n2 = fz2[0].length, lo = [], hi = [], xs = [];
        for (var c2 = 0; c2 < n2; c2++) {
          var mn = Infinity, mx = -Infinity;
          for (var j2 = 0; j2 < fz2.length; j2++) { var v2 = fz2[j2][c2]; if (isFinite(v2)) { if (v2 < mn) mn = v2; if (v2 > mx) mx = v2; } }
          if (!isFinite(mn)) continue;
          var xc = c2 === 0 ? S.plan.finLo : c2 === n2 - 1 ? S.plan.finHi : S.plan.finLo + (c2 - 1) * job.finish.pitch;
          xs.push(xc); lo.push(mn); hi.push(mx);
        }
        g.beginPath();
        xs.forEach(function (x, i) { if (i) g.lineTo(sx(x), sy(hi[i])); else g.moveTo(sx(x), sy(hi[i])); });
        for (var i3 = xs.length - 1; i3 >= 0; i3--) g.lineTo(sx(xs[i3]), sy(lo[i3]));
        g.closePath(); g.fillStyle = '#86b6ef'; g.fill();
        g.strokeStyle = '#1c5cab'; g.lineWidth = 2;
        [hi, lo].forEach(function (arr) { g.beginPath(); xs.forEach(function (x, i) { if (i) g.lineTo(sx(x), sy(arr[i])); else g.moveTo(sx(x), sy(arr[i])); }); g.stroke(); });
        g.fillStyle = ink; g.textAlign = 'left'; g.font = '600 12px system-ui,sans-serif';
        g.fillText('Side profile: finished part (max / min radius), roughing layers dashed', Lm, pTop - 9);
      } else if (S.sil) {
        var sil = S.sil;
        g.beginPath(); g.moveTo(sx(sil.x0), sy(0));
        for (var b = 0; b < sil.r.length; b++) g.lineTo(sx(sil.x0 + b * sil.binW), sy(sil.r[b]));
        g.lineTo(sx(sil.x0 + (sil.r.length - 1) * sil.binW), sy(0)); g.closePath();
        g.fillStyle = 'rgba(134,182,239,.55)'; g.fill(); g.strokeStyle = '#1c5cab'; g.lineWidth = 2; g.stroke();
        g.fillStyle = ink; g.textAlign = 'left'; g.font = '600 12px system-ui,sans-serif';
        g.fillText('Side profile: part as placed (largest radius at each X)', Lm, pTop - 9);
      }
      // tenons on top, so they show inside the part's outline too
      g.font = '11px system-ui,sans-serif';
      core.tenonList(job, S.mesh).forEach(function (t) {
        g.fillStyle = 'rgba(74,222,128,.32)'; g.strokeStyle = TENON_COLOR; g.lineWidth = 1.5;
        g.fillRect(sx(t.x0), sy(t.r), sx(t.x1) - sx(t.x0), sy(0) - sy(t.r));
        g.strokeRect(sx(t.x0) + .5, sy(t.r) + .5, sx(t.x1) - sx(t.x0), sy(0) - sy(t.r));
        g.fillStyle = TENON_COLOR; g.textAlign = 'center'; g.fillText('tenon', sx((t.x0 + t.x1) / 2), sy(t.r / 2) + 4);
      });
    }
    if (window.ResizeObserver) new ResizeObserver(function () { draw(); }).observe(canvas);

    // ---------- start: restore the view, then settings, units, tools, firmware
    renderForm();
    setOp(S.ui.op);
    setTab(S.ui.tab);
    $('.rc-a').value = S.ui.a; $('.rc-aval').textContent = S.ui.a + '°';
    side.scrollTop = S.ui.scroll || 0;
    if (S.mesh) S.partDirty = true;
    refresh();
    showPaths();
    if (viewer) {
      viewer.setA(S.ui.a);
      if (S.ui.camUser && S.ui.cam) viewer.setCamera(S.ui.cam); else viewer.view(S.mesh ? 'iso' : 'whole');
    }

    var restored = resumed ? Promise.resolve() : store.load('last').then(function (last) {
      if (!last || !last.tris || S.raw) return;
      S.fileName = last.name; S.raw = last.tris; S.solids = last.solids; S.skipped = last.skipped; S.source = last.source || null;
      placeModel(); S.partDirty = true;
      return store.load('result').then(function (r) {
        if (r && r.program) { S.plan = r.plan; S.maps = r.maps; S.program = r.program; S.resultKey = r.key; S.seconds = r.seconds; S.warnings = r.warnings || []; S.indexLeft = r.left || null; }
      });
    });
    Promise.all([
      restored,
      host.initial && host.initial.job ? Promise.resolve(null) : api.get('/api/plugins/' + PLUGIN_ID + '/settings').catch(function () { return null; }),
      api.get('/api/settings').catch(function () { return {}; }),
      api.get('/api/tools').catch(function () { return []; }),
      api.get('/api/firmware').catch(function () { return null; })
    ]).then(function (r) {
      if (!resumed && r[1] && r[1].job) S.job = core.prepareJob(migrate(core.deepMerge(core.DEFAULTS, r[1].job), r[1].job));
      var appSettings = r[2] || {};
      S.units = appSettings.unitsPreference === 'imperial' ? 'in' : 'mm';
      S.job.units = S.units;
      S.numbering = appSettings.tool && appSettings.tool.numbering === 'toolId' ? 'toolId' : 'slot';
      var list = Array.isArray(r[3]) ? r[3] : (r[3] && r[3].tools) || [];
      S.tools = list.filter(function (t) { return t && Number(t.diameter) > 0; }).map(function (t) {
        var num = S.numbering === 'toolId' ? (t.toolId != null ? t.toolId : t.id) : (t.toolNumber != null ? t.toolNumber : (t.toolId != null ? t.toolId : t.id));
        var dm = t.dimensions || {};
        return { id: t.id, number: num, name: t.name || (t.diameter + ' mm'), kind: toolKind(t), diameter: Number(t.diameter), fluteLength: Number(dm.flute_length) || null, stickout: Number(dm.stickout) > 0 ? Number(dm.stickout) : null,
          taperAngle: Number(dm.taper_angle) > 0 ? Number(dm.taper_angle) : null, tipRadius: Number(dm.radius) > 0 ? Number(dm.radius) : null };
      });
      S.fw = (r[4] && (r[4].settings || r[4].Settings)) || {};
      S.fwFields = {};
      FIELDS.machine.forEach(function (f) {
        if (!f.fw) return;
        var e = S.fw[f.fw], v = e && parseFloat(e.value !== undefined ? e.value : e.Value);
        if (isFinite(v) && v > 0) { set(S.job, f.k, v); S.fwFields[f.fw] = true; }
      });
      OPS.forEach(function (op) {
        var id = S.job[op].library_id;
        if (id == null) return;
        var t = S.tools.filter(function (x) { return String(x.id) === String(id); })[0];
        if (t) applyLibraryTool(op, t);
        else S.job[op].library_id = null;
      });
      core.prepareJob(S.job);
      // anything that changed under the saved toolpaths (units, rates, tools) means regenerate
      if (S.program && S.resultKey !== jobKey()) { S.program = null; S.plan = null; S.maps = null; S.warnings = []; store.drop('result'); }
      if (!document.body.contains(root)) return;
      renderForm();
      refresh();
      showPaths();
      if (viewer && !S.ui.camUser) viewer.view(S.mesh ? 'iso' : 'whole');
      // where the rotary and the tool change are (quietly; nothing changes under saved toolpaths)
      if (!resumed) readMachine(false).then(function () {
        if (!document.body.contains(root)) return;
        if (S.program && S.resultKey !== jobKey()) { S.program = null; S.plan = null; S.maps = null; S.warnings = []; store.drop('result'); showPaths(); }
        renderForm(); refresh();
      });
    });

    RC.session.hooks = { setBusy: setBusy, refresh: refresh, showPaths: showPaths, simReady: simReady, renderForm: renderForm };

    // test hook
    RC.__state = S;
  };
})();
