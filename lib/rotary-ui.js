/*
 * Rotary CAM - ncSender plugin dialog.
 * Loaded by config.html into the ncSender page (classic script, defines window.RotaryCam).
 * Heavy work runs in Web Workers: lib/cam-worker.js (OpenCAMLib WASM drop-cutter) and a
 * small STEP worker (occt-import-js). Toolpaths + G-code come from lib/cam-core.js.
 */
(function () {
  'use strict';
  var RC = window.RotaryCam = window.RotaryCam || {};
  var BUILD = '0.11.1-mvyhhyin';
  RC.build = BUILD;
  var PLUGIN_ID = 'com.cncdocs.rotary-cam';
  var MANUAL_URL = 'https://github.com/stmoha/ncsender-plugin-rotary-cam/blob/main/MANUAL.md';
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

  // Indexed drops (A locked, ball at machine X, Y), spread over the workers. groups: [{ a, xy }].
  // A big batch is cut into one piece per worker (runs of neighbouring points, so each
  // looks at its own part of the mesh) and put back together in order.
  // onFrac(f): how much of the batch is back (a big one is cut into more pieces than there are
  // workers, so it keeps every worker busy to the end and says how far it's got)
  WorkerPool.prototype.drop = function (groups, isCancelled, onFrac) {
    var nw = this.workers.length, parts = [], whole = groups, all = 0;
    groups.forEach(function (g, gi) {
      var n = g.xy.length / 2, k = n >= 800 ? Math.max(nw > 1 ? Math.min(nw, Math.ceil(n / 400)) : 1, Math.ceil(n / 1500)) : 1, per = Math.ceil(n / k);
      all += n;
      for (var c = 0; c < k; c++) { var a0 = c * per, a1 = Math.min(n, a0 + per); if (a1 > a0) parts.push({ a: g.a, xy: g.xy.slice(2 * a0, 2 * a1), gi: gi, at: a0, ball: g.ball }); }
    });
    var got = 0, tick = onFrac ? function (i, list) { got += list[i].xy.length / 2; onFrac(got / Math.max(1, all)); } : null;
    if (parts.length === groups.length) return this.dropParts(groups, isCancelled, tick);
    return this.dropParts(parts, isCancelled, tick).then(function (res) {
      if (!res) return null;
      var out = whole.map(function (g) { return new Float64Array(g.xy.length / 2); });
      parts.forEach(function (p, i) { out[p.gi].set(res[i], p.at); });
      return out;
    });
  };
  WorkerPool.prototype.dropParts = function (groups, isCancelled, tick) {
    var ws = this.workers, out = new Array(groups.length), next = 0, active = 0, failed = null;
    return new Promise(function (resolve, reject) {
      function feed(w) {
        if (failed || isCancelled() || next >= groups.length) {
          if (active === 0) { if (failed) reject(failed); else if (isCancelled()) resolve(null); else resolve(out); }
          return;
        }
        var id = next++;
        active++;
        w.postMessage({ type: 'drop', id: id, a: groups[id].a, xy: groups[id].xy, ball: groups[id].ball || 0 });
      }
      ws.forEach(function (w) {
        w.onmessage = function (ev) {
          var m = ev.data;
          active--;
          if (m.type === 'error') failed = new Error(m.message);
          else if (m.type === 'drop') { out[m.id] = m.z; if (tick) try { tick(m.id, groups); } catch (e) { /* progress only */ } }
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
  // the tailstock tenon's own sizes: Tailstock end only, or both ends not the same
  var ownTailstock = function (j) { return j.tenons.ends === 'tailstock' || (j.tenons.ends === 'both' && !j.tenons.same); };
  var TENON_COLOR = '#4ade80';
  // what Parting cuts: the tenons, to their diameter over their whole length
  var partingNote = function (j, L) {
    var T = j.tenons, core = window.RotaryCamCore;
    if (!T || !T.enabled) return 'Parting cuts the tenons down to size, so it needs them: turn on Tenons.';
    var ends = T.ends === 'chuck' ? ['chuck'] : T.ends === 'tailstock' ? ['tailstock'] : ['chuck', 'tailstock'];
    var bits = ends.map(function (side) {
      var t = (T.same && T.ends !== 'tailstock' ? T.chuck : T[side]) || {}, len = core && core.tenonExt ? core.tenonExt(j, side) : 0;
      return 'the ' + side + ' end tenon to \u00d8' + L(Number(t.dia) || 0) + (len > 0 ? ' over ' + L(len) : '');
    });
    return 'After finishing, Parting cuts ' + bits.join(' and ') + '. Set them under Tenons. Until then the tenons stay thick past the room the tools need, so the part is held firmly while it\u2019s carved.';
  };
  var isShape = function (s) { return function (j) { return (j.stock && j.stock.shape || 'round') === s; }; };
  var FIELDS = {
    part: [
      { k: 'model.axis', label: 'Turning axis in the model', type: 'select', opts: [['x', 'Model X'], ['y', 'Model Y'], ['z', 'Model Z']], remesh: true, tip: 'Which axis of the model lies along the rotary. A new file starts on its longest side.' },
      { k: 'model.flip', label: 'Turn end for end', type: 'check', remesh: true, tip: 'Swap which end of the part goes in the chuck.' },
      { k: 'model.centre', label: 'On the rotary axis', type: 'select', opts: CENTRES, remesh: true, tip: 'What sits on the rotary centreline. Centre of the chuck end suits a part with a round base, like a chess piece. Model origin keeps the model where it was drawn.' },
      { k: 'model.roll', label: 'Turn about the axis', q: 'deg', remesh: true, tip: 'Turns the part about the rotary axis, which sets what faces up at A0. You can also click the part in the 3D view to bring that side to the top.' },
      { k: 'model.part_start_x', label: 'Part starts at X', q: 'len', remesh: true, tip: 'Distance from the chuck jaw face (X0) to where the work starts: the chuck end tenon (or the parting neck) when there is one, then the part. The part moves along when the tenon gets longer, so you only set this once. Keep it at least the keep-away from the jaws.' },
      { k: 'model.scale', label: 'Scale', q: 'pct', remesh: true, tip: 'Size of the part compared with the model as drawn. 100% is as drawn; a model drawn in inches but read as millimetres needs 2540%.' },
      { type: 'button', act: 'fitscale', label: 'Scale to fit the stock', tip: 'The largest size that fits the stock with 1 mm to spare all round, and leaves the operations room before the tailstock. To keep the part’s size and make the stock fit it instead, use Size the stock to fit the part under Stock & rotary.' }
    ],
    stock: [
      { k: 'stock.shape', label: 'Stock shape', type: 'select', opts: SHAPES, tip: 'Round bar, or square / rectangular blanks. The first roughing layers start at the corners and take them off. The part turns red in 3D if it doesn’t fit.' },
      { k: 'stock.dia', label: 'Stock diameter', q: 'len', show: isShape('round'), tip: 'Diameter of the round bar.' },
      { k: 'stock.width', label: 'Stock width', q: 'len', show: isShape('square'), tip: 'Width of the square blank, across any side.' },
      { k: 'stock.width', label: 'Width (Y at A0)', q: 'len', show: isShape('rect'), tip: 'Size across the machine (Y) with A at 0.' },
      { k: 'stock.height', label: 'Height (Z at A0)', q: 'len', show: isShape('rect'), tip: 'Size up and down (Z) with A at 0.' },
      { k: 'tailstock_x', label: 'Stock length', q: 'len', plus: 'stock.clamp', tip: 'The whole length of the stock, the part held in the jaws included. The live centre goes in its far end: clamping distance + jaw face to the tailstock centre.' },
      { k: 'stock.clamp', label: 'Clamping distance', q: 'len', tip: 'How far the stock goes into the chuck jaws, past the jaw face (X0). Changing it keeps the stock length, so the tailstock centre moves.' },
      { k: 'chuck_clearance', label: 'Keep away from the jaws', q: 'len', tip: 'The cutter edge never comes closer than this to the jaw face.' },
      { k: 'tailstock_clearance', label: 'Keep away from the tailstock', q: 'len', tip: 'The cutter edge never comes closer than this to the live centre.' },
      { k: 'safe_clearance', label: 'Retract above the stock', q: 'len', tip: 'Rapid height above the largest stock radius.' },
      { k: 'angle_step_deg', label: 'Angle step', q: 'deg', tip: 'How often around the part the surface is sampled. Smaller is finer and slower to calculate; sharp features get extra points automatically.' },
      { k: 'below_axis', label: 'Deepest below the axis', q: 'len', auto: true, tip: 'How far roughing and finishing may take the tool tip past the rotary axis. Some spots can only be reached that way: the middle of a slot or hole through the part, the bottom of a hole that goes past the axis, the inside of a curl. Empty (auto): only there, and only as deep as each spot needs; everywhere else the tool stays above the axis. Type a number to set the most it may go, or 0 to keep the tool above the axis everywhere (Indexed can clean up those spots instead).' },
      { type: 'button', act: 'fitstock', label: 'Size the stock to fit the part', tip: 'Sets the stock size and the Stock length for the part as it is now: 1 mm to spare all round, and long enough for the part, the tailstock end tenon (or room for the tools past the end) and the keep-away from the tailstock. The part, its scale and the clamping distance stay. To make the part fit the stock instead, use Scale to fit the stock under Part placement.' }
    ],
    tenons: [
      { k: 'tenons.ends', label: 'Ends', type: 'select', opts: [['both', 'Both ends'], ['chuck', 'Chuck end only'], ['tailstock', 'Tailstock end only']], tip: 'Which ends of the part get a tenon.' },
      { k: 'tenons.same', label: 'Same at both ends', type: 'check', show: function (j) { return j.tenons.ends === 'both'; }, tip: 'One size for both tenons. Untick to give the chuck and tailstock ends their own diameter, depth and length.' },
      { k: 'tenons.chuck.dia', label: function (j) { return sameTenons(j) || j.tenons.ends === 'chuck' ? 'Diameter' : 'Chuck end: diameter'; }, q: 'len', show: function (j) { return j.tenons.ends !== 'tailstock'; }, tip: 'Diameter of the tenon. Bigger is stiffer, but it\u2019s more to trim off the part afterwards. 1/2 in is a good start.' },
      { k: 'tenons.chuck.depth', label: function (j) { return sameTenons(j) || j.tenons.ends === 'chuck' ? 'Into the part' : 'Chuck end: into the part'; }, q: 'len', show: function (j) { return j.tenons.ends !== 'tailstock'; }, tip: 'How far the tenon reaches into the part from its end. Reach past any thin or off-centre spot near the end, so solid material holds the part.' },
      { k: 'tenons.chuck.len', label: function (j) { return sameTenons(j) || j.tenons.ends === 'chuck' ? 'Length out of the part' : 'Chuck end: length out'; }, q: 'len', auto: true, show: function (j) { return j.tenons.ends !== 'tailstock'; }, tip: 'How long the tenon is between the end of the part and the rest of the stock, which stays full size. Leave it empty (auto) for just the room the tools need to reach the end of the part (with Parting on, at least one parting cutter). With Parting on, roughing leaves this thick until Parting cuts it down to the tenon\u2019s diameter at the end, so the part is held firmly while it\u2019s carved. Scale to fit leaves this much at each end (at the chuck end the part starts no closer than this plus the keep-away from the jaws).' },
      { k: 'tenons.tailstock.dia', label: function (j) { return j.tenons.ends === 'tailstock' ? 'Diameter' : 'Tailstock end: diameter'; }, q: 'len', show: ownTailstock, tip: 'Diameter of the tailstock end tenon. Bigger is stiffer, but it\u2019s more to trim off the part afterwards.' },
      { k: 'tenons.tailstock.depth', label: function (j) { return j.tenons.ends === 'tailstock' ? 'Into the part' : 'Tailstock end: into the part'; }, q: 'len', show: ownTailstock, tip: 'How far the tailstock end tenon reaches into the part from its end.' },
      { k: 'tenons.tailstock.len', label: function (j) { return j.tenons.ends === 'tailstock' ? 'Length out of the part' : 'Tailstock end: length out'; }, q: 'len', auto: true, show: ownTailstock, tip: 'How long the tailstock end tenon is between the part and the rest of the stock. Empty (auto): just the room the tools need (with Parting on, at least one parting cutter). Scale to fit leaves this much, plus the keep-away, before the tailstock.' }
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
      { k: 'corners.stepover', label: 'Stepover', q: 'len', pct: true, tip: 'Sideways step between facing passes. About 60% of the cutter diameter. Type it as a length, or as a % of the tool diameter in the box below.' },
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
      { k: 'rough.pitch', label: 'Stepover per turn', q: 'len', pct: true, tip: 'How far the spiral moves along X for each turn of A (its stepover, also called advance per turn). Type it as a length, or as a % of the tool diameter in the box below. Keep it under the cutter diameter.' },
      { k: 'rough.leave', label: 'Leave for finishing', q: 'len', tip: 'Material left on the part for the finishing pass, measured square to the surface.' }
    ],
    finish: [
      { k: 'finish.tool', label: 'Tool', type: 'tool', kind: 'ball', flat: true, taper: true, tip: 'Pick any end mill: a ball (smooth curves), a flat end mill (crisp flat faces and square shoulders, but it leaves small steps on curves), or a tapered ball (in the Tool Library as a V-bit). Or type one in below.' },
      { k: 'finish.shape', label: 'Shape', type: 'select', opts: [['ball', 'Ball'], ['flat', 'Flat end mill'], ['taper', 'Tapered ball']], tip: 'Ball for smooth curves; a flat end mill for flat faces and square shoulders (on curves it leaves small steps, so use a fine stepover). A tapered ball has a small ball tip on a cone that widens to the shank: fine detail, but the cone reaches out sideways. Its taper and tip are set here; ncSender\u2019s Tool Library doesn\u2019t store them yet (a V-bit there is fine).' },
      { k: 'finish.tool_dia', label: function (j) { return j.finish.shape === 'taper' ? 'Tip diameter' : 'Diameter'; }, q: 'len', tip: 'Cutter diameter. For a tapered ball, the diameter of the ball at its tip.' },
      { k: 'finish.taper_deg', label: 'Taper (per side)', q: 'deg', show: function (j) { return j.finish.shape === 'taper'; }, tip: 'Angle of the cone from the tool\u2019s axis, one side. Makers often quote it per side (a 3.6\u00b0 taper); if yours gives the included angle, halve it.' },
      { k: 'finish.shank_dia', label: 'Shank diameter', q: 'len', show: function (j) { return j.finish.shape === 'taper'; }, tip: 'Where the cone stops widening. The whole cone and shank are kept off the part and out of the uncut stock, and the keep-away distances are measured from the shank.' },
      { k: 'finish.tool_length', label: 'Flute length', q: 'len', tip: 'Cutting length of the flutes.' },
      { k: 'finish.stickout', label: 'Stickout', q: 'len', tip: 'How far the tool sticks out of the collet nut, to its tip. The nut and spindle above it are kept off the part, the uncut stock and the rotary; too short and the operation has to stay up off the part where the nut would hit (it says where).' },
      { k: 'finish.tool_number', label: 'Tool number', q: 'n', tip: 'The T number for M6.' },
      { k: 'finish.rpm', label: 'Spindle', q: 'rpm', tip: 'Spindle speed.' },
      { k: 'finish.feed', label: 'Feed', q: 'feed', tip: 'Cutting speed along the surface (inverse-time feeds in the program).' },
      { k: 'finish.plunge_feed', label: 'Plunge', q: 'feed', tip: 'Feed for the move down to start the spiral.' },
      { k: 'finish.pitch', label: 'Stepover per turn', q: 'len', pct: true, tip: 'How far the finishing spiral moves along X for each turn of A (also called advance per turn). Type it as a length, or as a % of the tool diameter in the box below. Smaller leaves smaller scallops.' },
      { k: 'finish.tolerance', label: 'Tolerance', q: 'len', tip: 'How far a straight move may stray from the surface before a point is added. Matters on sharp features.' }
    ],
    index: [
      { k: 'index.what', label: 'Clean up', type: 'select', opts: [['all', 'Overhangs and creases'], ['overhangs', 'Overhangs only']], tip: 'What to go after. Overhangs: material hidden under the part from every line through the axis, like under a chin or a jaw. Creases: corners the finishing ball was too big for (a smaller ball here reaches them).' },
      { k: 'index.auto', label: 'Pick the angles for me', type: 'check', tip: 'Tries A every 15\u00b0 and picks the fewest angles that reach the most. Much slower than listing your own: all 24 are tried before any is planned. Leave it off and list the angles, as in Fusion, for speed.' },
      { type: 'note', warn: true, show: function (j) { return j.index.auto !== false; }, text: 'Picking the angles takes much longer: every 15\u00b0 is tried first, so a detailed part can take minutes instead of seconds. List your own angles for speed.' },
      { k: 'index.max_angles', label: 'Most angles', q: 'n', show: function (j) { return j.index.auto !== false; }, tip: 'At most this many A angles. Each one is a separate patch of 3-axis passes with A locked.' },
      { k: 'index.angle_list', label: 'A angles', type: 'text', show: function (j) { return j.index.auto === false; }, tip: 'A angles to lock at, in degrees, like 90, 270. Each one runs passes over whatever it can reach.' },
      { type: 'angles' },
      { k: 'index.min_left', label: 'Ignore less than', q: 'len', tip: 'Material thinner than this is left alone, so the passes go where they count.' },
      { k: 'index.side_finish', label: 'Finish the whole side it faces', type: 'check', tip: 'After cleaning up what the rotary passes left, each angle runs one even finishing pass over the whole side of the part it faces: line by line along the part, a stepover apart, the tool riding the surface (up to 55\u00b0 steep; the next angle round does the steeper parts). A smooth, even surface instead of cleaning up spot by spot. Takes longer to calculate and to cut.' },
      { k: 'index.tool', label: 'Tool', type: 'tool', kind: 'ball', flat: true, taper: true, tip: 'Any end mill. Usually a ball smaller than the finishing tool, so it gets into tighter spots. A flat end mill gets into square corners and leaves flat floors flat; tapered balls (V-bits in the Tool Library) work too.' },
      { k: 'index.shape', label: 'Shape', type: 'select', opts: [['ball', 'Ball'], ['flat', 'Flat end mill'], ['taper', 'Tapered ball']], tip: 'Ball for smooth curves; a flat end mill for flat faces and square shoulders (on curves it leaves small steps, so use a fine stepover). A tapered ball has a small ball tip on a cone that widens to the shank: fine detail, but the cone reaches out sideways. Its taper and tip are set here; ncSender\u2019s Tool Library doesn\u2019t store them yet (a V-bit there is fine).' },
      { k: 'index.tool_dia', label: function (j) { return j.index.shape === 'taper' ? 'Tip diameter' : 'Diameter'; }, q: 'len', tip: 'Cutter diameter. For a tapered ball, the diameter of the ball at its tip.' },
      { k: 'index.taper_deg', label: 'Taper (per side)', q: 'deg', show: function (j) { return j.index.shape === 'taper'; }, tip: 'Angle of the cone from the tool\u2019s axis, one side. Makers often quote it per side (a 3.6\u00b0 taper); if yours gives the included angle, halve it.' },
      { k: 'index.shank_dia', label: 'Shank diameter', q: 'len', show: function (j) { return j.index.shape === 'taper'; }, tip: 'Where the cone stops widening. The whole cone and shank are kept off the part and out of the uncut stock, and the keep-away distances are measured from the shank.' },
      { k: 'index.tool_length', label: 'Flute length', q: 'len', tip: 'Cutting length of the flutes. The passes never take the tool deeper than the part lets the shank go.' },
      { k: 'index.stickout', label: 'Stickout', q: 'len', tip: 'How far the tool sticks out of the collet nut, to its tip. The nut and spindle above it are kept off the part, the uncut stock and the rotary; too short and the operation has to stay up off the part where the nut would hit (it says where).' },
      { k: 'index.tool_number', label: 'Tool number', q: 'n', tip: 'The T number for M6.' },
      { k: 'index.rpm', label: 'Spindle', q: 'rpm', tip: 'Spindle speed.' },
      { k: 'index.feed', label: 'Feed', q: 'feed', tip: 'Feed along the passes (ordinary units per minute).' },
      { k: 'index.plunge_feed', label: 'Plunge', q: 'feed', tip: 'Feed for the last bit down into each pass.' },
      { k: 'index.stepover', label: 'Stepover', q: 'len', pct: true, tip: 'Distance between passes. Smaller leaves a smoother surface. Type it as a length, or as a % of the tool diameter in the box below.' },
      { k: 'index.stepdown', label: 'Stepdown', q: 'len', tip: 'Where a lot was left, the passes go down in layers this deep.' }
    ],
    parting: [
      { type: 'note', id: 'parting', text: partingNote },
      { type: 'button', act: 'opentenons', label: 'Tenon settings', always: true, tip: 'Parting cuts the tenons: their ends, diameter and length are set under Tenons.' },
      { k: 'parting.tool', label: 'Tool', type: 'tool', kind: 'flat', tip: 'A flat end mill. The roughing tool works.' },
      { k: 'parting.tool_dia', label: 'Diameter', q: 'len', tip: 'Cutter diameter.' },
      { k: 'parting.tool_length', label: 'Flute length', q: 'len', tip: 'Cutting length of the flutes. Must reach from the stock surface down to the tenon.' },
      { k: 'parting.stickout', label: 'Stickout', q: 'len', tip: 'How far the tool sticks out of the collet nut, to its tip. The nut and spindle above it are kept off the part, the uncut stock and the rotary; too short and the operation has to stay up off the part where the nut would hit (it says where).' },
      { k: 'parting.tool_number', label: 'Tool number', q: 'n', tip: 'The T number for M6.' },
      { k: 'parting.rpm', label: 'Spindle', q: 'rpm', tip: 'Spindle speed.' },
      { k: 'parting.feed', label: 'Feed', q: 'feed', tip: 'Cutting speed along the surface (inverse-time feeds in the program). The cut is a full-width slot, so go slower than roughing.' },
      { k: 'parting.plunge_feed', label: 'Plunge', q: 'feed', tip: 'Feed for the move down to the stock.' },
      { k: 'parting.stepdown', label: 'Depth per turn', q: 'len', tip: 'How much deeper the neck gets on each turn of A as it spirals in.' }
    ],
    rig: [
      { type: 'sub', label: 'Chuck' },
      { k: 'rig.chuck.dia', label: 'Diameter, jaws included', q: 'len', tip: 'Across the chuck at its widest, jaws and all, as it turns.' },
      { k: 'rig.chuck.len', label: 'Length, back from the jaw face', q: 'len', tip: 'From the jaw face (X0) back to where the headstock starts.' },
      { k: 'rig.chuck.jaws', label: 'Jaws', type: 'select', opts: [['4', '4 jaws'], ['3', '3 jaws']], tip: 'How the chuck is drawn in 3D: 4 jaws (independent, holds square stock on its flats) or 3 (self-centring). (Collisions use the chuck\u2019s diameter either way.)' },
      { type: 'sub', label: 'Headstock: housing, motor and drive behind the chuck' },
      { k: 'rig.head.len', label: 'Length along X', q: 'len', tip: 'The headstock is kept out as one box from these four numbers: make it just big enough to take in the housing, motor and belt drive, no need to model each. Length: from the back of the chuck to the far end (belt cover and all).' },
      { k: 'rig.head.front', label: 'Reach to the front (\u2212Y)', q: 'len', tip: 'From the rotary axis to the furthest point of the headstock toward the front of the machine (\u2212Y).' },
      { k: 'rig.head.back', label: 'Reach to the back (+Y)', q: 'len', tip: 'From the rotary axis to the furthest point toward the back (+Y): a motor or pulley mounted behind counts. Set the front and back separately so the box only grows on the side that needs it.' },
      { k: 'rig.head.top', label: 'Top, above the axis', q: 'len', tip: 'How high the highest point of the headstock (a motor on top included) stands above the rotary axis.' },
      { type: 'sub', label: 'Live centre' },
      { k: 'rig.centre.dia', label: 'Diameter', q: 'len', tip: 'Across the back of its cone, and the round body behind it. Its point goes in the end of the stock.' },
      { k: 'rig.centre.len', label: 'Cone length', q: 'len', tip: 'From its point back to where the taper ends.' },
      { k: 'rig.centre.total', label: 'Total length', q: 'len', auto: true, ph: function (j, core, u) { return 'auto ' + toDisp(j.rig.centre.len, 'len', u); }, tip: 'From its point back to the tailstock body: the cone, then the round body (bearing housing, quill) at its diameter. The tailstock\u2019s box starts there. Empty: the cone goes straight into the body.' },
      { type: 'sub', label: 'Tailstock: body, lock lever and handwheel' },
      { k: 'rig.tail.len', label: 'Length along X', q: 'len', tip: 'The tailstock is kept out as one box from these four numbers: make it just big enough to take in the body, lock lever and handwheel, no need to model each. Length: from the face of the tailstock body to the end of its handwheel.' },
      { k: 'rig.tail.front', label: 'Reach to the front (\u2212Y)', q: 'len', tip: 'From the rotary axis to the furthest point of the tailstock toward the front (\u2212Y): base, lever, handwheel.' },
      { k: 'rig.tail.back', label: 'Reach to the back (+Y)', q: 'len', tip: 'From the rotary axis to the furthest point toward the back (+Y): a lock lever sticking out the back counts. Set the front and back separately so the box only grows on the side that needs it.' },
      { k: 'rig.tail.top', label: 'Top, above the axis', q: 'len', tip: 'How high the highest point of the tailstock (lever included) stands above the rotary axis.' },
      { type: 'sub', label: 'Collet nut and spindle' },
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
      { k: 'rig.tc.zsafe', label: 'Safe Z (machine)', q: 'len', machine: true, tip: 'ncSender\u2019s Safe Z (Settings), in machine coordinates: where tool changes travel.' },
      { k: 'rig.tc.ztop', label: 'Top of Z above the axis', q: 'len', machine: true, tip: 'How far above the rotary axis the tool tip is with Z at the top of its travel (machine Z0), for the tool in the spindle: read from the work offset when ncSender is connected. Nothing in the program goes higher (ncSender flags a program that does), and a tool that sticks out further than this one has that much less room.' },
      { k: 'rig.tc.zso', label: 'Stickout of the tool in the spindle', q: 'len', machine: true, auto: true, ph: function (j, core, u) { var r = core.zRefInfo(j); return r.so > 0 && r.how !== 'typed' ? 'auto ' + toDisp(r.so, 'len', u) : 'auto'; }, tip: 'How far the tool in the spindle now sticks out: the one whose length is in ncSender\u2019s work offset, so the top of Z above the axis is for it. Left empty, it\u2019s the stickout set here (or in the Tool Library) for the tool ncSender says is in, or else the first operation\u2019s tool. Set it when that guess is wrong.' }
    ],
    zero: [
      { type: 'zeroinfo' },
      { type: 'sub', label: 'From the corner to the work zero (measured once)' },
      { k: 'rig.corner.dx', label: 'X, corner to the jaw face', q: 'len', signed: true, tip: 'The work zero\u2019s X minus the corner\u2019s X (measure both in machine coordinates). Positive when the corner is behind the jaw face, on the headstock. Measure it exactly: this is not the headstock\u2019s keep-out box, which can stay as generous as you like.' },
      { k: 'rig.corner.dy', label: 'Y, corner to the axis', q: 'len', signed: true, tip: 'The rotary axis\u2019s Y minus the corner\u2019s Y. Positive for a corner on the front (\u2212Y side) of the headstock.' },
      { k: 'rig.corner.dz', label: 'Z, corner to the axis', q: 'len', signed: true, tip: 'The rotary axis\u2019s Z minus the corner\u2019s Z. Negative for a corner above the axis, as on top of the headstock housing.' },
      { type: 'zeromeasure' }
    ],
    machine: [
      { type: 'sub', label: 'Which way A turns' },
      { k: 'a_sign', label: 'A+90 turns the top of the stock', type: 'select', opts: [['1', 'to you (\u2212Y)'], ['-1', 'away (+Y)']], tip: 'Which way the top of the stock goes when A turns +90\u00b0 (Turn A +90\u00b0 below shows you). Getting this wrong mirrors the part, and Indexed cuts the wrong side: 180\u00b0 off at A90 and A270.' },
      { type: 'adir' },
      { type: 'sub', label: 'Axis rates and tool change' },
      { k: 'machine.a_max_deg_min', label: 'A max rate', q: 'degmin', fw: '113', tip: 'Fastest the A axis can turn ($113). Read from the controller when connected.' },
      { k: 'machine.x_max_mm_min', label: 'X max rate', q: 'feed', fw: '110', tip: 'Fastest X can move ($110). Read from the controller when connected.' },
      { k: 'machine.y_max_mm_min', label: 'Y max rate', q: 'feed', fw: '111', tip: 'Fastest Y can move ($111). Only the corners operation moves Y.' },
      { k: 'machine.z_max_mm_min', label: 'Z max rate', q: 'feed', fw: '112', tip: 'Fastest Z can move ($112). Read from the controller when connected.' },
      { k: 'dust', label: 'Dust collection / dust boot', type: 'select', opts: [['off', 'Off'], ['m8', 'M8 (flood)'], ['m7', 'M7 (mist)'], ['m7m8', 'M7 + M8']], tip: 'Off: the program doesn\u2019t switch it. Otherwise it\u2019s switched on after the spindle starts in each operation, and off (M9, a dust boot goes up) before every tool change and at the end. A lowered dust boot isn\u2019t in the collision checks: make sure it clears the chuck, jaws, tailstock and stock.' },
      { k: 'tool_change', label: 'Tool change', type: 'select', opts: [['m6', 'M6 (ncSender tool change)'], ['m0', 'M0 pause']], tip: 'M6 runs ncSender’s tool change routine. M0 just pauses so you can swap the tool and re-touch Z.' }
    ]
  };
  var ALL_FIELDS = [].concat(FIELDS.part, FIELDS.stock, FIELDS.tenons, FIELDS.corners, FIELDS.rough, FIELDS.finish, FIELDS.index, FIELDS.parting, FIELDS.zero, FIELDS.rig, FIELDS.toolchange, FIELDS.machine);
  var OPS = ['corners', 'rough', 'finish', 'index', 'parting'];
  var OP_NAMES = { corners: 'Corners', rough: 'Roughing', finish: 'Finishing', index: 'Indexed', parting: 'Parting' };
  var SECTIONS = [['part', 'Part placement'], ['stock', 'Stock & rotary'], ['tenons', 'Tenons — hold the part'], ['corners', 'Corners — square stock'], ['rough', 'Roughing — flat end mill'], ['finish', 'Finishing — ball end mill'], ['index', 'Indexed — what finishing missed'], ['parting', 'Parting — cut the tenons'], ['zero', 'Work zero — from a corner of the rotary'], ['rig', 'Rotary & spindle — collisions'], ['toolchange', 'Tool changes'], ['machine', 'Machine']];

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
    '#rcam-root button.rc-beta{border:0;background:none;padding:0;font-family:inherit;line-height:1;cursor:pointer}',
    '#rcam-root button.rc-beta:hover{text-decoration:underline}',
    '#rcam-root .rc-fp{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(10,14,18,.55)}',
    '#rcam-root .rc-fpcard{width:100%;max-width:640px;max-height:100%;overflow:auto;padding:22px 26px;border-radius:14px;background:var(--rc-surface);color:var(--rc-text);border:1px solid var(--rc-line);box-shadow:0 18px 50px rgba(0,0,0,.35);font-size:14px;line-height:1.5}',
    '#rcam-root .rc-fpcard h2{margin:0 0 10px;font-size:19px;line-height:1.25}',
    '#rcam-root .rc-fpcard p{margin:8px 0}',
    '#rcam-root .rc-fpcard ul{margin:10px 0;padding-left:20px}',
    '#rcam-root .rc-fpcard li{margin:7px 0}',
    '#rcam-root .rc-fpbtns{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:18px}',
    '#rcam-root .rc-filebox{display:flex;align-items:center;gap:12px;margin-left:18px;min-width:0;flex:1;padding:6px 10px;border:1.5px dashed transparent;border-radius:10px}',
    '#rcam-root .rc-filebox.rc-drag{border-color:var(--rc-accent)}',
    '#rcam-root .rc-name{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#rcam-root .rc-meta{color:var(--rc-muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#rcam-root .rc-units{font-size:12px;color:var(--rc-muted);padding:5px 10px;border-radius:20px;background:var(--rc-surface);white-space:nowrap}',
    // the version under the name and its update tag, like ncSender's own
    '#rcam-root .rc-brand{position:relative}',
    '#rcam-root .rc-verrow{display:flex;align-items:center;gap:6px;margin-top:1px}',
    '#rcam-root .rc-version{font-size:12px;font-weight:500;color:var(--rc-muted);opacity:.6}',
    '#rcam-root .rc-manual{font-size:12px;font-weight:600;color:var(--rc-accent);text-decoration:none}',
    '#rcam-root .rc-manual:hover{text-decoration:underline}',
    '#rcam-root .rc-fpman{color:var(--rc-muted);font-size:13px}',
    '#rcam-root .rc-fpman a{color:var(--rc-accent);font-weight:600}',
    '#rcam-root .rc-update{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;padding:0;border:none;border-radius:50%;background:var(--rc-accent);color:#fff;cursor:pointer;animation:rcUpdPulse 2.4s ease-in-out infinite}',
    '#rcam-root .rc-update[hidden]{display:none}',
    '@keyframes rcUpdPulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--rc-accent) 55%,transparent)}50%{box-shadow:0 0 0 5px transparent}}',
    '#rcam-root .rc-updpop{position:absolute;top:calc(100% + 8px);left:0;z-index:40;width:300px;padding:12px 14px;border-radius:10px;background:var(--rc-surface);border:1px solid var(--rc-line);box-shadow:0 8px 24px rgba(0,0,0,.18);font-size:12.5px;line-height:1.45}',
    '#rcam-root .rc-updpop .rc-updbtns{display:flex;flex-direction:column;gap:6px;margin-top:9px}',
    '#rcam-root .rc-updpop .rc-btn{padding:6px 10px;font-size:12.5px;text-align:center}',
    '#rcam-root .rc-updpop a{color:var(--rc-accent)}',
    // the stock at a glance
    '#rcam-root .rc-stockbox{display:flex;flex-direction:column;align-items:flex-start;gap:1px;min-width:0;max-width:44%;padding:5px 11px;border:1px solid var(--rc-line);border-radius:9px;background:var(--rc-surface);color:var(--rc-text);font:inherit;font-size:12px;text-align:left;cursor:pointer}',
    '#rcam-root .rc-stockbox:hover{border-color:var(--rc-accent)}',
    '#rcam-root .rc-stockbox span{display:block;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#rcam-root .rc-sb1{font-weight:600}',
    '#rcam-root .rc-sb2{color:var(--rc-muted)}',
    '#rcam-root .rc-stockbox .rc-short{color:#d64545;font-weight:600}',
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
    '#rcam-root .rc-zero-btns{display:flex!important;gap:8px;flex-wrap:wrap}',
    '#rcam-root .rc-hint.rc-warn{color:color-mix(in srgb,#b45309 85%,var(--rc-text));background:color-mix(in srgb,#f59e0b 12%,transparent);border-radius:6px;padding:6px 8px}',
    '#rcam-root .rc-in{display:flex;align-items:center;gap:4px}',
    '#rcam-root .rc-in input,#rcam-root select{width:100%;min-width:0;padding:6px 8px;border:1px solid var(--rc-line);border-radius:7px;background:var(--rc-surface);color:var(--rc-text);font:inherit}',
    '#rcam-root select option{background:var(--rc-surface);color:var(--rc-text)}',
    '#rcam-root .rc-in input[type=number]{text-align:right}',
    '#rcam-root .rc-in input:focus,#rcam-root select:focus{outline:none;border-color:var(--rc-accent)}',
    '#rcam-root .rc-unit{color:var(--rc-muted);font-size:11.5px;min-width:42px}',
    '#rcam-root .rc-fw{color:var(--rc-accent);font-size:11px}',
    '#rcam-root input[type=checkbox]{width:17px;height:17px;accent-color:var(--rc-accent)}',
    '#rcam-root .rc-chips{display:flex;flex-wrap:wrap;gap:6px;padding:4px 0 2px}',
    '#rcam-root .rc-sub{font-size:11.5px;font-weight:650;color:var(--rc-muted);margin:10px 0 2px;letter-spacing:.01em}',
    '#rcam-root .rc-row.rc-hl{box-shadow:inset 3px 0 0 var(--rc-accent);background:color-mix(in srgb,var(--rc-accent) 11%,transparent);border-radius:6px;margin:0 -6px;padding:3px 6px}',
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
    '#rcam-root .rc-prog{flex:1;min-width:120px;max-width:340px;height:8px;gap:3px;display:none}',
    '#rcam-root .rc-prog i{display:block;flex:1;height:100%;background:var(--rc-surface);border-radius:4px;overflow:hidden}',
    '#rcam-root .rc-prog i b{display:block;height:100%;width:0;background:var(--rc-accent);opacity:.75;transition:width .15s}',
    '#rcam-root .rc-prog i.rc-now b{opacity:1}',
    '#rcam-root .rc-status{color:var(--rc-muted);font-size:12.5px}',
    // the checks: below the view (portrait, narrow windows); a column right of it on wide
    // landscape screens, which shuts to a strip; notices float over the view there
    '#rcam-root .rc-notes{display:contents}',
    '#rcam-root .rc-noteshead{display:none}',
    '#rcam-root .rc-toasts{position:absolute;top:58px;right:12px;width:min(380px,calc(100% - 24px));z-index:3;pointer-events:none}',
    '#rcam-root .rc-toasts:empty{display:none}',
    '#rcam-root .rc-toasts .rc-msg{margin:0;box-shadow:0 6px 18px rgba(0,0,0,.22)}',
    '#rcam-root .rc-toasts .rc-ok{background:color-mix(in srgb,var(--rc-accent) 16%,var(--rc-surface))}',
    '#rcam-root .rc-toasts .rc-warn{background:color-mix(in srgb,#e6a01e 18%,var(--rc-surface))}',
    '#rcam-root .rc-toasts .rc-err{background:color-mix(in srgb,#dc3c3c 16%,var(--rc-surface))}',
    '#rcam-root .rc-nb{font-style:normal;font-size:11.5px;font-weight:700;min-width:20px;padding:1px 6px;border-radius:10px;text-align:center;line-height:16px}',
    '#rcam-root .rc-nb-err{background:#d64545;color:#fff}#rcam-root .rc-nb-warn{background:#d99a1e;color:#1e1406}#rcam-root .rc-nb-ok{background:color-mix(in srgb,var(--rc-accent) 30%,transparent);color:var(--rc-text)}',
    '@media (orientation:landscape) and (min-width:1200px){' +
      '#rcam-root .rc-main{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:minmax(0,1fr) auto;column-gap:12px;row-gap:10px}' +
      '#rcam-root .rc-view{grid-column:1;grid-row:1}#rcam-root .rc-stats{grid-column:1;grid-row:2}' +
      '#rcam-root .rc-notes{display:flex;flex-direction:column;grid-column:2;grid-row:1/span 2;width:clamp(260px,22vw,360px);min-height:0;border:1px solid var(--rc-border);border-radius:12px;background:var(--rc-surface2);overflow:hidden}' +
      '#rcam-root .rc-notes.rc-none{display:none}#rcam-root .rc-main.rc-nonotes{grid-template-columns:minmax(0,1fr)}' +
      '#rcam-root .rc-noteshead{display:flex;align-items:center;gap:6px;flex:none;width:100%;padding:9px 12px;border:0;border-bottom:1px solid var(--rc-border);background:none;color:var(--rc-text);font:inherit;font-weight:650;text-align:left;cursor:pointer}' +
      '#rcam-root .rc-noteshead:hover{background:color-mix(in srgb,var(--rc-text) 5%,transparent)}' +
      '#rcam-root .rc-notestitle{margin-right:auto}#rcam-root .rc-nchev{color:var(--rc-muted);font-size:15px;line-height:1;margin-left:4px}' +
      '#rcam-root .rc-notes .rc-msgs{max-height:none;flex:1;min-height:0;overflow-y:auto;padding:8px}' +
      '#rcam-root .rc-notes .rc-msg{flex-wrap:wrap;align-items:flex-start;row-gap:6px}' +
      '#rcam-root .rc-notes .rc-msg>span{flex:1 1 170px;min-width:0}' +
      '#rcam-root .rc-notes .rc-msg .rc-btn{margin-left:0}' +
      '#rcam-root .rc-notes.rc-shut{width:44px}' +
      '#rcam-root .rc-notes.rc-shut .rc-noteshead{flex-direction:column;justify-content:flex-start;height:100%;padding:10px 0;gap:8px;border-bottom:0}' +
      '#rcam-root .rc-notes.rc-shut .rc-notestitle{writing-mode:vertical-rl;transform:rotate(180deg);margin:0}' +
      '#rcam-root .rc-notes.rc-shut .rc-nchev{order:-1;margin:0}' +
      '#rcam-root .rc-notes.rc-shut .rc-msgs{display:none}' +
    '}',
    '@media (max-width:1100px){#rcam-root .rc-side{width:290px}#rcam-root .rc-filebox .rc-meta{display:none}#rcam-root .rc-filebox{margin-left:6px}}',
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
    if (!(S.busy && RC.pool)) S.busy = '';
    // the checks column (wide landscape): open or shut, remembered in this browser
    if (!S.ui.notes) { try { S.ui.notes = localStorage.getItem('rcam.notes') === 'shut' ? 'shut' : 'open'; } catch (e) { S.ui.notes = 'open'; } }
    var LAND = window.matchMedia ? window.matchMedia('(orientation: landscape) and (min-width: 1200px)') : null;   // a calculation started before closing carries on
    function migrate(job, saved, project) {
      // settings saved before stock shapes existed only had a radius
      if (saved && !saved.stock && saved.stock_radius) job.stock = { shape: 'round', dia: 2 * saved.stock_radius, width: 2 * saved.stock_radius, height: 2 * saved.stock_radius };
      if (core.migrateRig) core.migrateRig(job, saved);
      // Part starts at X now includes the chuck end tenon: older settings keep the part where it was
      if (core.migrateStart) core.migrateStart(core.prepareJob(job), saved);
      // a project keeps what it was made with; this machine's settings get the new default
      if (!project && core.migrateIndex) core.migrateIndex(job, saved);
      return job;
    }
    var U = function () { return S.units; };
    function L(vmm, d) { var q = qd('len', U()); return fmt(vmm / q[1], d === undefined ? (U() === 'in' ? 3 : 2) : d) + ' ' + q[0]; }
    function Ls(vmm) { return (vmm < 0 ? '\u2212' : '+') + L(Math.abs(vmm), U() === 'in' ? 4 : 3); }

    root.innerHTML = '<style>' + CSS + '</style>' +
      '<header class="rc-head">' +
      '  <img class="rc-logo" alt="" src="' + esc(host.file('icon.png')) + '">' +
      '  <div class="rc-brand"><div class="rc-eyebrow">Plugin</div><div class="rc-title">Rotary CAM<button class="rc-beta" type="button" title="Beta software: read the fine print">beta</button></div>' +
      '    <div class="rc-verrow"><span class="rc-version" title="Rotary CAM version">v' + esc(core.VERSION) + '</span>' +
      '      <button class="rc-update" type="button" hidden title="A newer Rotary CAM is out"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"/></svg></button>' +
      '      <a class="rc-manual" href="' + MANUAL_URL + '" target="_blank" rel="noopener" title="The manual: setting up the controller and the rotary, and what to check before the first carve (opens in a new tab)">Manual</a></div>' +
      '    <div class="rc-updpop" hidden></div></div>' +
      '  <div class="rc-filebox" title="Drop a .stl, .step, .stp or .rcam file here">' +
      '    <button class="rc-btn rc-open" type="button" title="Open an STL or STEP part, or a Rotary CAM project (.rcam). You can also drop the file here.">Open…</button>' +
      '    <button class="rc-btn rc-saveproj" type="button" disabled title="Save a Rotary CAM project (.rcam): the part, every setting, the tools, and the G-code and toolpaths if they\u2019re generated. Open it again with Open\u2026">Save project…</button>' +
      '    <div style="min-width:0"><div class="rc-name">No part loaded</div><div class="rc-meta">Drop a .stl, .step, .stp or .rcam file here.</div></div>' +
      '    <input type="file" accept=".stl,.step,.stp,.rcam" hidden>' +
      '  </div>' +
      '  <button class="rc-stockbox" type="button" title="Stock & rotary: the stock you\u2019ve set, the least the part needs, and how much room Z has above the rotary axis. Click to open its settings."><span class="rc-sb1"></span><span class="rc-sb2"></span></button>' +
      '  <span class="rc-units" title="Rotary CAM uses ncSender’s units (Settings). The program is posted in them too."></span>' +
      '  <button class="rc-btn rc-close" type="button" title="Close Rotary CAM. Your part, settings and toolpaths are kept for next time."><span style="font-size:15px;line-height:1">✕</span> Close</button>' +
      '</header>' +
      '<div class="rc-body">' +
      '  <aside class="rc-side"></aside>' +
      '  <main class="rc-main">' +
      '    <div class="rc-view">' +
      '      <div class="rc-3d"></div><canvas class="rc-2d" hidden></canvas><div class="rc-toasts" aria-live="polite"></div>' +
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
      '    <aside class="rc-notes"><button class="rc-noteshead" type="button"></button><div class="rc-msgs"></div></aside>' +
      '    <div class="rc-stats"></div>' +
      '  </main>' +
      '</div>' +
      '<footer class="rc-foot">' +
      '  <button class="rc-btn rc-primary rc-gen" type="button" disabled title="Calculate roughing and finishing toolpaths for this part">Generate toolpaths</button>' +
      '  <button class="rc-btn rc-cancel" type="button" hidden>Cancel</button>' +
      '  <div class="rc-prog"></div><span class="rc-status"></span><span style="flex:1"></span>' +
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
    function closeDialog() { saveUi(); if (saveTimer || saving) flushSave(); window.postMessage({ type: 'close-plugin-dialog' }, '*'); }
    $('.rc-close').addEventListener('click', closeDialog);

    // ---------- the fine print: on opening until it's accepted (saved with the settings, so once
    // per ncSender), and any time from the beta badge. Same words as README.md and MANUAL.md.
    var FINEPRINT = 1;                     // raise when the words change enough to ask again
    var FP = {
      title: '\u26a0\ufe0f The fine print (worth the 30 seconds)',
      intro: 'Rotary CAM is <b>beta software</b>. A hobbyist wrote it for his own machine and shares it in case it helps with yours. It writes G-code that swings a spinning cutter around a spinning part. When everything\u2019s right, that\u2019s magic. When something\u2019s wrong, it\u2019s a broken bit, a ruined part, a crashed rotary, or worse.',
      items: [
        ['You\u2019re the machinist.', 'Rotary CAM is a tool, not a supervisor. Check every program before you run it: simulate it, read the warnings, and air-cut the first one on any new setup. Check that zero is on the axis, A turns the way the plugin thinks, and nothing is in the cutter\u2019s way.'],
        ['Safety is on you.', 'Use solid workholding and eye and hearing protection, keep a hand near the E-stop, and don\u2019t leave a running machine alone.'],
        ['No warranty, none at all.', 'It\u2019s provided \u201cas is\u201d under the MIT License, without warranty of any kind, including that it works or suits your purpose. It has bugs; some have been found the exciting way, and some are surely still waiting.'],
        ['No liability.', 'The author and contributors aren\u2019t liable for any damage, loss or injury from using it: to your machine, tooling, stock, shop, wallet or self. Whoever presses Cycle Start owns what happens next.'],
        ['Not official.', 'It\u2019s an independent plugin, not made, endorsed or supported by ncSender, Sienci Labs or your machine\u2019s maker.']
      ],
      outro: 'By installing or using Rotary CAM, you accept all of the above. Now go make chips, carefully. \ud83d\ude42'
    };
    function finePrintDue() { return !(Number(S.job.fineprint) >= FINEPRINT); }
    function finePrint(review) {
      var old = root.querySelector('.rc-fp');
      if (old) old.remove();
      var d = document.createElement('div');
      d.className = 'rc-fp'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'rc-fp-title');
      d.innerHTML = '<div class="rc-fpcard"><h2 id="rc-fp-title">' + FP.title + '</h2><p>' + FP.intro + '</p><ul>' +
        FP.items.map(function (it) { return '<li><b>' + it[0] + '</b> ' + it[1] + '</li>'; }).join('') + '</ul><p>' + FP.outro + '</p>' +
        '<p class="rc-fpman">New to Rotary CAM? <a href="' + MANUAL_URL + '" target="_blank" rel="noopener">Read the manual</a>: setting up, and what to check before the first carve.</p>' +
        '<div class="rc-fpbtns">' + (review
          ? '<button class="rc-btn rc-primary" type="button" data-fp="ok">Close</button>'
          : '<button class="rc-btn" type="button" data-fp="no" title="Close Rotary CAM without accepting. This shows again next time.">Close Rotary CAM</button>' +
            '<button class="rc-btn rc-primary" type="button" data-fp="yes">I understand \u2014 let\u2019s make chips</button>') + '</div></div>';
      root.appendChild(d);
      d.addEventListener('click', function (e) {
        var b = e.target.closest('[data-fp]');
        if (!b) { if (review && e.target === d) d.remove(); return; }
        var a = b.getAttribute('data-fp');
        d.remove();
        if (a === 'yes') { S.job.fineprint = FINEPRINT; persist(0); }
        else if (a === 'no') closeDialog();
      });
      if (review) d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); d.remove(); } });
      var f = d.querySelector('.rc-primary');
      if (f) f.focus();
    }
    $('.rc-beta').addEventListener('click', function () { finePrint(true); });

    // ---------- settings persistence (shared by every browser on this ncSender)
    var saveTimer = null;
    // Every change is saved to ncSender as it's made (a moment's pause for typing) and when the
    // dialog closes. Other computers can have Rotary CAM open on the same ncSender, so a save
    // doesn't write this window's whole copy over theirs: it reads what's there, keeps their
    // changes to anything this window hasn't changed since it last saw it, and adds this
    // window's changes on top (three-way, setting by setting). Their changes come in here too.
    var saving = null, saveAgain = false, saveRetry = null;
    if (!S.saveBase) S.saveBase = JSON.parse(JSON.stringify((host.initial && host.initial.job) || {}));
    var same = function (a, b) { return JSON.stringify(a) === JSON.stringify(b); };
    var plain = function (v) { return v && typeof v === 'object' && !Array.isArray(v); };
    function merge3(base, mine, theirs) {
      if (same(mine, base)) return theirs === undefined ? mine : theirs;
      if (same(theirs, base) || theirs === undefined) return mine;
      if (plain(mine) && plain(theirs)) {
        var out = {}, b = plain(base) ? base : {};
        Object.keys(mine).concat(Object.keys(theirs)).forEach(function (k) {
          if (k in out) return;
          var v = merge3(b[k], mine[k], theirs[k]);
          if (v !== undefined) out[k] = v;
        });
        return out;
      }
      return mine;           // both changed the same setting: this window's is the newer
    }
    // changes made on another computer, now in this window: say what, and drop toolpaths
    // that no longer match the settings
    function takeIn(mine, merged) {
      var what = changedLabels(mine, merged), placed = what.model;
      S.job = core.prepareJob(merge3(mine, S.job, merged));
      if (!document.body.contains(root)) return;
      var typing = side.contains(document.activeElement) && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName);
      if (typing) S.formStale = true; else renderForm();
      var had = !!S.program;
      if (placed && S.raw) { placeModel(); S.partDirty = true; }
      if (S.program && S.resultKey !== jobKey()) { invalidate(false); showPaths(); }
      syncViewer(!!placed);
      var list = what.labels.length ? what.labels.slice(0, 4).join(', ') + (what.labels.length > 4 ? ' and ' + (what.labels.length - 4) + ' more' : '') : 'settings';
      if (had && !S.program) S.toast = S.dropNote = { kind: 'warn', text: 'Settings were changed on another computer (' + list + '), so the toolpaths no longer matched them and were dropped: generate again.' };
      else if (what.labels.length) S.toast = { kind: 'ok', text: 'Picked up changes made on another computer: ' + list + '.' };
      refresh();
    }
    // the settings that differ, by their names in the side panel
    function changedLabels(a, b) {
      var labels = [], model = false;
      (function walk(x, y, path) {
        if (same(x, y)) return;
        if (plain(x) && plain(y)) { Object.keys(x).concat(Object.keys(y)).forEach(function (k, i, all) { if (all.indexOf(k) === i) walk(x[k], y[k], path ? path + '.' + k : k); }); return; }
        if (/^model\./.test(path)) model = true;
        var f = ALL_FIELDS.filter(function (q) { return q.k === path; })[0];
        if (!f) return;                                     // something kept behind the scenes
        var lab = typeof f.label === 'function' ? f.label(S.job) : f.label, op = path.split('.')[0];
        labels.push((OP_NAMES[op] ? OP_NAMES[op] + ' ' + lab.charAt(0).toLowerCase() + lab.slice(1) : lab));
      })(a, b, '');
      return { labels: labels, model: model };
    }
    function persist(delay) {
      S.savePending = true;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(flushSave, delay === undefined ? 300 : delay);
    }
    function putSettings(job, keepalive) {
      return fetch(host.base + '/api/plugins/' + PLUGIN_ID + '/settings', { method: 'PUT', keepalive: !!keepalive, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job: job }) })
        .then(function (r) { if (!r.ok) throw new Error('ncSender said ' + r.status); });
    }
    // Sync with ncSender: read its copy, merge, and write back only when this window has
    // changed something. Run after every change, before every command, every few seconds
    // while the dialog is open and when the window comes back to the front, so a change made
    // on another computer is here before anything is generated, loaded or saved.
    function flushSave() { return syncSettings(); }
    function syncSettings() {
      clearTimeout(saveTimer); saveTimer = null;
      if (saving) { saveAgain = true; return saving; }
      clearTimeout(saveRetry);
      var mine = JSON.parse(JSON.stringify(S.job)), pulled = false;
      saving = api.get('/api/plugins/' + PLUGIN_ID + '/settings').then(function (srv) { pulled = true; return srv; }, function () { return null; }).then(function (srv) {
        var theirs = srv && srv.job ? srv.job : null;
        var merged = theirs ? merge3(S.saveBase, mine, theirs) : mine;
        var write = !theirs || !same(merged, theirs) ? putSettings(merged) : (pulled ? Promise.resolve() : Promise.reject(new Error('no answer')));
        return write.then(function () {
          S.saveBase = JSON.parse(JSON.stringify(merged));
          S.saveFailed = false;
          if (!saveTimer && !saveAgain) S.savePending = false;
          // someone else's changes: take them in (anything changed here meanwhile stays)
          if (!same(merged, mine)) takeIn(mine, merged);
        });
      }).catch(function () {
        // ncSender didn't take it: keep trying, and say so if it goes on
        S.saveFailed = true;
        saveRetry = setTimeout(flushSave, 4000);
        if (document.body.contains(root)) refresh();
      }).then(function () {
        saving = null;
        if (saveAgain) { saveAgain = false; flushSave(); }
      });
      return saving;
    }
    var pollTimer = setInterval(function () {
      if (!document.body.contains(root)) { clearInterval(pollTimer); return; }
      if (S.busy || saving || RC.__noPoll || document.visibilityState === 'hidden') return;
      syncSettings();
    }, 4000);
    var lastFront = 0, onFront = function () {
      if (!document.body.contains(root) || S.busy || document.visibilityState === 'hidden' || Date.now() - lastFront < 1000) return;
      lastFront = Date.now(); syncSettings();
    };
    window.addEventListener('focus', onFront);
    document.addEventListener('visibilitychange', onFront);
    // the page going away (closed, reloaded) with a save still waiting: send it as it is
    window.addEventListener('pagehide', function () { if (saveTimer || S.saveFailed) putSettings(S.job, true).catch(function () {}); });
    // what the toolpaths depend on: everything but the corner zero (setting up the machine)
    function jobJson(job) { return JSON.stringify(job, function (k, v) { return (k === 'corner' && this && this.tc !== undefined) || k === 'a_checked' || k === 'fineprint' ? undefined : v; }); }
    function jobKey() { return JSON.stringify({ j: JSON.parse(jobJson(S.job)), f: S.fileName, n: S.raw ? S.raw.length : 0 }); }
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
    // Deepest below the axis for the 3D view: the most it may go (null: auto), and how deep
    // the last program went
    function belowShown() {
      var cap = core.belowCap(S.job), b = S.maps && S.maps.below, used = 0;
      if (b) ['rough', 'finish'].forEach(function (op) { if (b[op] && b[op].depth > used) used = b[op].depth; });
      return { cap: isFinite(cap) ? cap : null, used: used };
    }
    function syncViewer(partChanged) {
      if (!viewer) return;
      var j = S.job;
      viewer.setSetup({
        chuckX: j.chuck_face_x, tailX: j.tailstock_x, stockR: j.stock_radius, clamp: Number(j.stock && j.stock.clamp) || 0,
        stockShape: (j.stock && j.stock.shape) || 'round', stockHalf: core.stockHalf(j),
        chuckClear: j.chuck_clearance, tailClear: j.tailstock_clearance, aSign: j.a_sign, clear: j.safe_clearance, lead: S.lead || 0,
        tools: {
          corners: { dia: j.corners.tool_dia, len: j.corners.tool_length, ball: false },
          rough: { dia: j.rough.tool_dia, len: j.rough.tool_length, ball: false },
          finish: { dia: j.finish.tool_dia, len: j.finish.tool_length, ball: j.finish.shape !== 'flat', taper: j.finish.shape === 'taper' ? j.finish.taper_deg * Math.PI / 180 : 0, shank: j.finish.shank_dia },
          index: { dia: j.index.tool_dia, len: j.index.tool_length, ball: j.index.shape !== 'flat', taper: j.index.shape === 'taper' ? j.index.taper_deg * Math.PI / 180 : 0, shank: j.index.shank_dia },
          parting: { dia: j.parting.tool_dia, len: j.parting.tool_length, ball: false }
        },
        toolX: S.mesh ? (S.mesh.min[0] + S.mesh.max[0]) / 2 : null,
        rig: j.rig, fixtures: core.fixtures(j), tc: core.tcInfo(j),
        stickout: { corners: j.corners.stickout, rough: j.rough.stickout, finish: j.finish.stickout, index: j.index.stickout, parting: j.parting.stickout },
        // what the pass settings measure, drawn at the tool while one is edited
        steps: {
          corners: { stepdown: j.corners.stepdown, stepover: j.corners.stepover, leave: j.corners.leave },
          rough: { stepdown: j.rough.stepdown, pitch: j.rough.pitch, leave: j.rough.leave },
          finish: { pitch: j.finish.pitch },
          index: { stepdown: j.index.stepdown, stepover: j.index.stepover },
          parting: { stepdown: j.parting.stepdown }
        },
        angleStep: j.angle_step_deg,
        below: belowShown()
      });
      if (partChanged || (S.mesh && !viewer.hasPart())) viewer.setPart(S.mesh ? S.mesh.tris : null);
      if (viewer.setTenons) viewer.setTenons(S.mesh ? core.tenonList(j, S.mesh) : []);
      viewer.setPartBad(!!(S.mesh && S.problems.some(function (p) { return /^The part (is|needs)/.test(p); })));
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
        tool: { dia: j.index.tool_dia, len: j.index.tool_length, ball: j.index.shape !== 'flat', taper: j.index.shape === 'taper' ? j.index.taper_deg * Math.PI / 180 : 0, shank: j.index.shank_dia },
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
      if (b.hasAttribute('data-tab')) {
        var tab = b.getAttribute('data-tab');
        // simulating a program: with the latest settings, or not at all
        if (tab === 'sim' && S.ui.tab !== 'sim') { syncSettings().then(function () { setTab(S.program ? 'sim' : '3d'); }); return; }
        setTab(tab); return;
      }
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
      if (saveTimer) flushSave();          // closed some other way with a save waiting
      clearInterval(pollTimer); window.removeEventListener('focus', onFront); document.removeEventListener('visibilitychange', onFront);
      if (viewer) { try { viewer.dispose(); } catch (e) {} if (RC.viewer === viewer) RC.viewer = null; viewer = null; }
      if (RC.pool && !S.busy) { RC.pool.stop(); RC.pool = null; }
    }, 1000);

    // ---------- form
    function fieldValue(f) {
      var v = get(S.job, f.k);
      if (f.k === 'rig.tc.zso' && !(S.job.rig.tc.typed || {}).zso) v = null;   // auto: shown as the placeholder
      if (f.plus && v !== null && v !== undefined && v !== '') v = Number(v) + (Number(get(S.job, f.plus)) || 0);   // stock length: clamp + to the centre
      if (f.q) return toDisp(v, f.q, U());
      return v === null || v === undefined ? '' : v;
    }
    function info(f) { return f.tip ? '<span class="rc-info" title="' + esc(f.tip) + '">?</span>' : ''; }
    function rowHtml(f) {
      if (f.show && !f.show(S.job)) return '';
      if (f.type === 'sub') return '<div class="rc-sub">' + esc(f.label) + '</div>';
      if (f.type === 'angles') return anglesHtml();
      if (f.type === 'tcinfo') return tcInfoHtml();
      if (f.type === 'zeroinfo') return zeroInfoHtml();
      if (f.type === 'adir') return adirHtml();
      if (f.type === 'note') return '<div class="rc-row rc-wide"><div class="rc-hint' + (f.warn ? ' rc-warn' : '') + '"' + (f.id ? ' data-note="' + f.id + '"' : '') + ' style="margin:0">' + esc(typeof f.text === 'function' ? f.text(S.job, L) : f.text) + '</div></div>';
      if (f.type === 'zeromeasure') return zeroMeasureHtml();
      if (f.type === 'button') return '<div class="rc-row rc-wide"' + (f.tip ? ' title="' + esc(f.tip) + '"' : '') + '><button class="rc-btn rc-act" type="button" data-act="' + f.act + '"' + ((S.mesh || f.always) && !S.busy ? '' : ' disabled') + '>' + esc(f.label) + '</button></div>';
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
        var rank = function (t) { return t.kind === f.kind ? 0 : f.flat && t.kind === 'flat' ? 1 : 2; };
        var list = S.tools.filter(function (t) { return t.kind === f.kind || (f.flat && t.kind === 'flat') || (f.taper && t.kind === 'v bit'); })
          .sort(function (a, b) { return rank(a) - rank(b); });
        var cur = get(S.job, op + '.library_id');
        h = '<div class="rc-row rc-wide"' + tip + '><div class="rc-in"><select id="rc-' + op + '-tool" data-tool="' + op + '">' +
          '<option value="">Custom tool (type it in below)</option>' +
          list.map(function (t) { return '<option value="' + esc(t.id) + '"' + (String(cur) === String(t.id) ? ' selected' : '') + '>' + esc('T' + t.number + ' · ' + t.name + ' · Ø' + toDisp(t.diameter, 'len', U()) + ' ' + unitLabel('len', U()) + (t.kind === 'v bit' ? ' (as a tapered ball)' : f.flat && t.kind === 'flat' ? ' (flat end)' : '')) + '</option>'; }).join('') +
          '</select></div>' + (list.length ? '' : '<div class="rc-hint">No ' + (f.flat ? '' : f.kind === 'ball' ? 'ball ' : 'flat ') + 'end mills in the Tool Library yet.</div>');
      } else {
        h = '<div class="rc-row"' + tip + '><label for="' + id + '">' + esc(label) + info(f) + (f.fw && S.fwFields[f.fw] ? ' <span class="rc-fw" title="Read from the controller">$' + f.fw + '</span>' : '') + '</label>' +
          '<div class="rc-in"><input id="' + id + '" data-k="' + f.k + '" data-q="' + f.q + '" type="number" step="' + qd(f.q, U())[3] + '" value="' + esc(v) + '"' + (f.auto ? ' placeholder="' + esc(f.ph ? f.ph(S.job, core, U()) : 'auto') + '"' : '') + '><span class="rc-unit">' + esc(unitLabel(f.q, U())) + '</span></div>';
      }
      if (f.pct) h += '</div><div class="rc-row" data-hl="' + f.k + '" title="' + esc('The same, as a share of the tool\u2019s diameter. Type either one and the other follows. Typed as a %, it stays that % when you change the tool.') + '">' +
        '<label for="' + id + '-pct">As % of the tool diameter</label><div class="rc-in"><input id="' + id + '-pct" data-pct="' + f.k + '" type="number" step="1" value="' + esc(pctShown(f.k)) + '"><span class="rc-unit">%</span></div>';
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
    // a stepover as a % of its tool's diameter: as typed, or worked out from the length
    function pctShown(k) {
      var o = k.split('.')[0], key = k.split('.')[1], p = core.pctOf(S.job, o, key), d = Number(S.job[o].tool_dia);
      if (p !== null) return p;
      return d > 0 ? Math.round(Number(S.job[o][key]) / d * 1000) / 10 : '';
    }
    // after a tool size changes: lengths typed as a % follow it, and every % box shows the
    // share it is now (the box being typed in is left alone)
    function syncPctInputs() {
      core.syncPct(S.job);
      core.PCT_FIELDS.forEach(function (pf) {
        var k = pf[0] + '.' + pf[1], li = side.querySelector('[data-k="' + k + '"]'), pi = side.querySelector('[data-pct="' + k + '"]');
        if (li && li !== document.activeElement) li.value = toDisp(S.job[pf[0]][pf[1]], 'len', U());
        if (pi && pi !== document.activeElement) pi.value = pctShown(k);
      });
    }
    function renderForm() {
      core.syncPct(S.job);
      var sc = side.scrollTop;
      side.querySelectorAll('details').forEach(function (d) { S.ui.open[d.getAttribute('data-sec')] = d.open; });
      side.innerHTML = SECTIONS.map(function (s) { return section(s[0], s[1], OPS.indexOf(s[0]) >= 0 || s[0] === 'tenons'); }).join('');
      side.scrollTop = sc;
    }
    side.addEventListener('click', function (e) {
      if (e.target.matches('summary input')) { e.stopPropagation(); return; }
      var b = e.target.closest('.rc-act');
      if (b && b.getAttribute('data-act') === 'fitscale') { scaleToFit(); return; }
      if (b && b.getAttribute('data-act') === 'fitstock') { stockToFit(); return; }
      if (b && b.getAttribute('data-act') === 'opentenons') { openTenons(); return; }
      if (b && b.getAttribute('data-act') === 'readmachine') { readMachine(true).then(function () { renderForm(); refresh(); }); return; }
      if (b && /^zero-/.test(b.getAttribute('data-act') || '')) { zeroAct(b.getAttribute('data-act')); return; }
      if (b && /^adir-/.test(b.getAttribute('data-act') || '')) { adirAct(b.getAttribute('data-act'), b.getAttribute('data-v')); return; }
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
    // the other way round: the stock is sized for the part (thickness and length)
    function stockToFit() {
      if (!S.mesh || S.busy) return;
      var f = core.fitStockToPart(S.job, S.mesh, fitStep());
      renderForm(); persist(); invalidate(false);
      var across = f.shape === 'square' ? L(f.width) + ' square' : f.shape === 'rect' ? L(f.width).replace(/ \S+$/, '') + ' × ' + L(f.height) : 'Ø' + L(f.dia);
      flash('ok', 'Stock set to ' + across + ', ' + L(f.length) + ' long (the end in the jaws included): 1 mm to spare all round, and room past the part for the ' +
        (core.tenonLen(S.job, 'tailstock') > 0 ? 'tailstock end tenon' : 'tools') + ' and the keep-away from the tailstock. The part and the clamping distance stay.');
    }
    function fitStep() { return S.units === 'in' ? 2.54 : 1; }
    function scaleToFit() {
      if (!S.raw || S.busy) return;
      var f = core.fitScale(S.job, S.raw);
      S.job.model.scale = f.scale;
      if (f.startMoved) S.job.model.part_start_x = Math.ceil(f.start * 100) / 100;
      renderForm(); persist(); invalidate(true);
      var ends = 'from X' + L(S.mesh.min[0]) + (f.startMoved ? ' (Part starts at X moved out of the keep-away from the jaws)' : S.lead > 0 ? ' (after the chuck end tenon)' : ' (Part starts at X)') + ' to X' + L(f.end) + ' (' +
        (f.endBy === 'tenon' ? 'the tailstock end tenon\u2019s length' : 'room for the tools past the end; set a tenon length to leave more') + ', then the keep-away before the tailstock)';
      flash('ok', 'Scaled the part to ' + fmt(100 * f.scale, 1) + '%: ' + L(S.mesh.max[0] - S.mesh.min[0], 1) + ' long, \u00d8' + L(2 * S.mesh.rmax) + ' max. ' +
        (f.by === 'stock' ? 'The stock sets the size (1 mm to spare all round).' : 'The length sets the size: it fits ' + ends + '.'));
    }
    // editing a tool's settings shows that tool in 3D
    side.addEventListener('focusin', function (e) {
      var d = e.target.closest('details');
      var sec = d && d.getAttribute('data-sec');
      if (OPS.indexOf(sec) >= 0 && S.ui.op !== sec) setOp(sec);
      hlFocus = keyOf(e.target); showHl();
    });

    // ---------- the part of the 3D view a setting is about: highlighted, with a dimension
    // line showing what the number measures, while the setting is hovered or edited
    var hlFocus = null, hlHover = null, hlShown = null;
    function keyOf(el) {
      var row = el && el.closest && el.closest('.rc-row');
      if (row && row.getAttribute('data-hl')) return row.getAttribute('data-hl');
      var inp = row && row.querySelector('[data-k],[data-tool]');
      if (!inp) return null;
      return inp.getAttribute('data-k') || (inp.getAttribute('data-tool') + '.tool');
    }
    function hlText(k) {
      // the corner zero: all three offsets at once, as typed (they're signed)
      if (/^rig\.corner/.test(k)) {
        var c = S.job.rig.corner || {}, one = function (v) { return v === null || v === undefined || v === '' ? '' : fmt(toDisp(v, 'len', U()), qd('len', U())[2]) + ' ' + unitLabel('len', U()); };
        return { x: one(c.dx), y: one(c.dy), z: one(c.dz), key: k };
      }
      var tl = k.match(/^tenons\.(chuck|tailstock)\.len$/);
      if (tl && (S.job.tenons[tl[1]].len === null || S.job.tenons[tl[1]].len === '' || S.job.tenons[tl[1]].len === undefined)) {
        var side = sameTenons(S.job) ? null : tl[1], ts = S.mesh ? core.tenonList(S.job, S.mesh) : [];
        var t = ts.filter(function (q) { return !side || q.side === side; })[0];
        return t ? 'auto: ' + L(t.side === 'chuck' ? t.in0 - t.x0 : t.x1 - t.in1, 1) : 'auto';
      }
      if (k === 'below_axis') {
        var bs = belowShown(), lenTxt = function (v) { return L(v, 1); };
        if (bs.cap === null) return bs.used > 0 ? 'auto: ' + lenTxt(bs.used) + ' in the last program' : 'auto: only where nothing else reaches';
        return bs.cap > 0 ? 'at most ' + lenTxt(bs.cap) : 'stays above the axis';
      }
      var tc = k.match(/^rig\.tc\.(change|setter|zero)\.[xy]$/);
      if (tc) { var q = S.job.rig.tc[tc[1]]; return q ? 'X' + L(q.x, 1) + ' Y' + L(q.y, 1) + ' (machine)' : ''; }
      var f = ALL_FIELDS.filter(function (x) { return x.k === k; })[0], v = get(S.job, k);
      if (f && f.ph && (v === null || v === undefined || v === '' || (k === 'rig.tc.zso' && !(S.job.rig.tc.typed || {}).zso))) return f.ph(S.job, core, U()) + ' ' + unitLabel('len', U());
      if (!f || !f.q || v === null || v === undefined || v === '') return '';
      if (f.plus) v = Number(v) + (Number(get(S.job, f.plus)) || 0);
      return fmt(toDisp(v, f.q, U()), qd(f.q, U())[2]) + (unitLabel(f.q, U()) ? ' ' + unitLabel(f.q, U()) : '') + (f.pct && pctShown(k) !== '' ? ' (' + fmt(pctShown(k), 1) + '% of \u00d8)' : '');
    }
    var hlTimer = null;
    function showHl() {
      var k = hlHover || hlFocus;
      // the view swings round to it when it's off screen: at once for the setting being
      // edited, after a moment for one the pointer rests on
      var now = k && k === hlFocus;
      var any = !!(viewer && viewer.highlight && k && S.ui.tab !== '2d' && viewer.highlight(k, hlText(k), now, now));
      clearTimeout(hlTimer);
      if (any && !now) hlTimer = setTimeout(function () { if (hlHover === k && viewer) viewer.highlight(k, hlText(k), true); }, 600);
      if (viewer && viewer.highlight && !k && hlShown) viewer.highlight(null);
      hlShown = any ? k : null;
      side.querySelectorAll('.rc-row.rc-hl').forEach(function (r) { r.classList.remove('rc-hl'); });
      if (any) { var el = side.querySelector('[data-k="' + k + '"],[data-tool="' + k.replace(/\.tool$/, '') + '"]'); var row = el && el.closest('.rc-row'); if (row) row.classList.add('rc-hl'); }
    }
    side.addEventListener('focusout', function () {
      setTimeout(function () {
        if (side.contains(document.activeElement)) return;
        hlFocus = null; showHl();
        if (S.formStale) { S.formStale = false; renderForm(); }     // changes from elsewhere came in while typing
      }, 0);
    });
    side.addEventListener('mouseover', function (e) {
      var k = keyOf(e.target);
      if (k !== hlHover) { hlHover = k; showHl(); }
    });
    side.addEventListener('mouseleave', function () { if (hlHover) { hlHover = null; showHl(); } });
    var liveTimer = null;
    function applyField(el, live) {
      var k = el.getAttribute('data-k'), op = el.getAttribute('data-tool'), pk = el.getAttribute('data-pct');
      if (op) { pickTool(op, el.value); return; }
      if (pk) {
        // the stepover as a % of the tool: the length follows, and keeps following it
        if (el.value === '' || !isFinite(Number(el.value)) || !(Number(el.value) > 0)) return;
        var po = pk.split('.')[0], pkey = pk.split('.')[1];
        S.job[po][pkey + '_pct'] = Number(el.value);
        syncPctInputs(); persist(); showHl();
        if (live) { clearTimeout(liveTimer); liveTimer = setTimeout(function () { invalidate(false); }, 120); } else invalidate(false);
        return;
      }
      if (!k) return;
      var f = ALL_FIELDS.filter(function (x) { return x.k === k; })[0];
      var v;
      if (el.type === 'checkbox') v = el.checked;
      else if (el.type === 'text') v = el.value;
      else if (el.tagName === 'SELECT') v = (k === 'a_sign') ? Number(el.value) : el.value;
      else {
        if (el.value === '' && f && f.auto && !live) v = null;
        else if (el.value === '' || !isFinite(Number(el.value))) return;
        else v = f && f.q ? fromDisp(el.value, f.q, U()) : Number(el.value);
      }
      // stock length: what's left of it past the jaw face reaches to the tailstock centre
      if (f && f.plus && v !== null) v = v - (Number(get(S.job, f.plus)) || 0);
      // more or less in the jaws, same stock: the tailstock centre moves
      if (k === 'stock.clamp' && v !== null) S.job.tailstock_x = Number(S.job.tailstock_x) + (Number(S.job.stock.clamp) || 0) - v;
      set(S.job, k, v);
      // a stepover typed as a length: the length it is, whatever the tool
      if (f && f.pct) { var pp = k.split('.'); S.job[pp[0]][pp[1] + '_pct'] = null; syncPctInputs(); }
      if (/\.tool_dia$/.test(k)) syncPctInputs();
      if (k === 'stock.clamp') { var tx = side.querySelector('[data-k="tailstock_x"]'); if (tx && tx !== el) tx.value = toDisp(Number(S.job.tailstock_x) + v, 'len', U()); }
      // a machine position typed in stays until Read from ncSender is pressed
      var tk = k.match(/^rig\.tc\.(zero|change|setter|zsafe|ztop|zso)/);
      if (tk) { var tcx = S.job.rig.tc; tcx.typed = tcx.typed || {}; tcx.typed[tk[1]] = true; }
      // the spindle tool's stickout cleared: back to working it out from the tool that's in
      if (k === 'rig.tc.zso' && v === null) { delete S.job.rig.tc.typed.zso; S.job.rig.tc.zso = spindleStickout(S.job.rig.tc.ztool); }
      // the top of Z typed in: it's for the tool in there now, as the settings describe it
      if (k === 'rig.tc.ztop' && v !== null) { S.job.rig.tc.zref = core.zRefLive(S.job); S.job.rig.tc.zread = { ztop: v, tool: S.job.rig.tc.ztool }; }
      // one size for both tenons: the chuck end's fields drive both
      if (/^tenons\.chuck\./.test(k) && sameTenons(S.job)) set(S.job, k.replace('.chuck.', '.tailstock.'), v);
      if (k === 'tenons.same' && v) { S.job.tenons.tailstock.dia = S.job.tenons.chuck.dia; S.job.tenons.tailstock.depth = S.job.tenons.chuck.depth; S.job.tenons.tailstock.len = S.job.tenons.chuck.len; }
      // the corner offsets are about setting up the machine, not the toolpaths
      if (/^rig\.corner\./.test(k)) { S.zeroAsk = null; persist(); syncViewer(false); if (!live) renderZeroRows(); showHl(); return; }
      core.prepareJob(S.job);
      var ownK = k.match(/^(corners|rough|finish|index|parting)\.(stickout|tool_length)$/);
      if (ownK) {
        var oj = S.job[ownK[1]]; oj.own = Object.assign({}, oj.own); oj.own[ownK[2]] = true;
        // one tool number is one tool: the other operations with it follow
        if (v !== null) core.sameTool(S.job, ownK[1]).forEach(function (o) {
          S.job[o][ownK[2]] = v; S.job[o].own = Object.assign({}, S.job[o].own); S.job[o].own[ownK[2]] = true;
          var oel = side.querySelector('[data-k="' + o + '.' + ownK[2] + '"]');
          if (oel && oel !== el) oel.value = toDisp(v, 'len', U());
        });
      }
      if (/\.(tool_(dia|number)|taper_deg|shank_dia)$/.test(k)) {
        var o = k.split('.')[0];
        S.job[o].library_id = null;
        S.job[o].tool_desc = fmt(S.job[o].tool_dia, 3) + 'mm ' + core.toolKind(S.job, o) + ' end mill';
        var sel = side.querySelector('[data-tool=' + o + ']');
        if (sel) sel.value = '';
      }
      if (k === 'index.auto') S.job.index.auto_chosen = !!v;
      if (k === 'a_sign') S.job.a_checked = true;
      if (/\.enabled$/.test(k) && OPS.indexOf(k.split('.')[0]) >= 0) setOp(k.split('.')[0]);
      persist();
      if ((k === 'finish.shape' || k === 'index.shape') && v === 'taper') {
        var oj = S.job[k.split('.')[0]];
        if (!(oj.tool_dia < oj.shank_dia)) oj.tool_dia = Math.min(1.0, oj.shank_dia / 2);
      }
      if ((k === 'finish.shape' || k === 'index.shape') && /\.shape$/.test(k)) {
        var o2 = k.split('.')[0];
        S.job[o2].tool_desc = fmt(S.job[o2].tool_dia, 3) + 'mm ' + core.toolKind(S.job, o2) + ' end mill';
        S.job[o2].library_id = null;
      }
      if (k === 'finish.shape' || k === 'index.shape' || k === 'stock.shape' || k === 'parting.enabled' || k === 'index.enabled' || k === 'index.auto' || k === 'tenons.ends' || k === 'tenons.same' || k === 'rig.tc.route') { renderForm(); invalidate(false); return; }
      if (k === 'rig.chuck.jaws') { syncViewer(false); showHl(); return; }
      if (live) {
        clearTimeout(liveTimer);
        liveTimer = setTimeout(function () { invalidate(f && f.remesh); }, 120);
      } else invalidate(f && f.remesh);
    }
    side.addEventListener('change', function (e) { applyField(e.target, false); });
    side.addEventListener('input', function (e) { if (e.target.type === 'number') applyField(e.target, true); });
    // keep: re-syncing a linked tool when Rotary CAM opens: what you set here yourself (its
    // stickout, its flute length) stays yours; picking the tool again takes the library's
    function applyLibraryTool(op, t, keep) {
      var j = S.job[op], own = keep && j.own || {};
      if (!keep) delete j.own;
      if (t.kind === 'v bit' && j.taper_deg !== undefined) {
        // ncSender keeps tapered balls as V-bits: its diameter is the shank; the tip and taper
        // come from the library when it has them, otherwise they stay as set here
        j.shape = 'taper'; j.shank_dia = t.diameter;
        if (t.taperAngle) j.taper_deg = t.taperAngle;
        if (t.tipRadius) j.tool_dia = 2 * t.tipRadius;
        else if (!(j.tool_dia < t.diameter)) j.tool_dia = Math.min(1.0, t.diameter / 2);
      } else {
        if (j.shape !== undefined) j.shape = t.kind === 'flat' ? 'flat' : 'ball';
        j.tool_dia = t.diameter;
      }
      if (t.fluteLength && !own.tool_length) j.tool_length = t.fluteLength;
      // how far it sticks out: the library's when it has one; at least its flutes plus a little
      if (own.stickout) { /* yours */ }
      else if (t.stickout) j.stickout = t.stickout;
      else if (j.tool_length && !(Number(j.stickout) >= j.tool_length + 2)) j.stickout = Math.round((j.tool_length + 6) * 100) / 100;
      j.tool_number = t.number;
      j.tool_desc = t.name;
    }
    function pickTool(op, id) {
      var t = S.tools.filter(function (x) { return String(x.id) === String(id); })[0];
      S.job[op].library_id = t ? t.id : null;
      if (t) {
        applyLibraryTool(op, t);
        var sib = core.sameTool(S.job, op, true)[0];
        if (sib) ['stickout', 'tool_length'].forEach(function (q) {
          if (!(Number(S.job[sib][q]) > 0)) return;
          S.job[op][q] = S.job[sib][q];
          if (S.job[sib].own && S.job[sib].own[q]) { S.job[op].own = Object.assign({}, S.job[op].own); S.job[op].own[q] = true; }
        });
      }
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
        if (!ms || ms.connected === false) S.wo = null;
        if (ms && ms.connected !== false) {
          var ws = String(ms.workspace || 'G54').toLowerCase(), off = nums(ms[ws] || ms.g54);
          S.wo = off.length >= 3 && isFinite(off[0]) && isFinite(off[1]) && isFinite(off[2]) ? { ws: ws.toUpperCase(), x: off[0] * inch, y: off[1] * inch, z: off[2] * inch, status: String(ms.status || '') } : null;
          if (off.length >= 2 && isFinite(off[0]) && isFinite(off[1]) && !typed.zero) { tc.zero = { x: off[0] * inch, y: off[1] * inch, z: isFinite(off[2]) ? off[2] * inch : null }; got.zero = ws.toUpperCase(); }
          var mp = nums(ms.MPos || ms.mPos), tx = Number(ms.maxTravelX), ty = Number(ms.maxTravelY);
          // Z: ncSender checks a program against machine Z0 (the top) and the bottom of the
          // travel using the work offset as it is now, the tool in the spindle's length included
          var wco = nums(ms.WCO || ms.wco), tz = Number(ms.maxTravelZ), wz = isFinite(wco[2]) ? wco[2] : off[2];
          // an unhomed machine's coordinates start wherever it was switched on: no Z travel then
          if (ms.homed === false && !typed.ztop) { tc.ztop = tc.zbot = null; got.zNotHomed = true; }
          else if (isFinite(wz) && !typed.ztop) {
            var topM = mp[2] > 0.5 && tz > 0 ? tz : 0;
            tc.ztop = topM - wz * inch;
            tc.zbot = tz > 0 ? topM - tz - wz * inch : null;
            var tn = Number(ms.tool);
            tc.ztool = tn > 0 ? tn : null;
            if (!typed.zso) tc.zso = spindleStickout(tc.ztool);
            // what's in the spindle, worked out once per reading of the machine: kept while
            // the stickouts are edited here, taken again when Z or the tool changes
            var zr0 = tc.zread || {};
            if (!(tc.zref && Number(tc.zref.so) > 0) || !(Math.abs(Number(zr0.ztop) - tc.ztop) < 0.01) || String(zr0.tool || '') !== String(tc.ztool || '')) {
              tc.zref = core.zRefLive(S.job); tc.zread = { ztop: tc.ztop, tool: tc.ztool };
            }
            got.ztop = true;
          }
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
    // the stickout of tool tn: from this job's operations, or from the Tool Library
    function spindleStickout(tn) {
      var so = null;
      if (!(Number(tn) > 0)) return null;
      core.opsInOrder(S.job).forEach(function (op) { if (so === null && String(S.job[op].tool_number) === String(tn) && Number(S.job[op].stickout) > 0) so = Number(S.job[op].stickout); });
      if (so === null) S.tools.forEach(function (t) { if (so === null && String(t.number) === String(tn) && Number(t.stickout) > 0) so = Number(t.stickout); });
      return so;
    }
    function tcInfoHtml() {
      return '<div class="rc-row rc-wide"><div class="rc-hint rc-tcinfo" style="margin:0">' + tcInfoLines() + '</div></div>' +
        '<div class="rc-row rc-wide"><button class="rc-btn rc-act" type="button" data-act="readmachine" title="Read the rotary zero (G54), the tool change position and tool setter (Manual Tool Changer) and Safe Z from ncSender again">Read from ncSender</button></div>';
    }
    function tcInfoLines() {
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
        if (g.ztop) src.push('the Z travel from the work offset' + (tc.ztool ? ' (T' + tc.ztool + ' in the spindle' + (tc.zso ? ', ' + L(tc.zso, 1) + ' stickout' : '') + ')' : ''));
        if (g.zNotHomed) lines.push('The machine isn\u2019t homed, so its Z travel isn\u2019t known: home it and press Read from ncSender.');
        else if (core.zNotOnAxis(S.job)) lines.push('Z isn\u2019t zeroed on the rotary axis yet (ncSender has Z0 at the top of the Z travel), so the Z travel can\u2019t be checked. Zero Z on the rotary centreline, then press Read from ncSender.');
        var zf = core.zFit(S.job);
        if (zf) lines.push('With Z at the top, the tip of ' + (zf.ref.how === 'first' ? 'T' + zf.ref.tool + ' (taken to be the tool in the spindle)' : zf.ref.how === 'tool' ? 'T' + zf.ref.tool : 'the tool in the spindle') + ', ' + L(zf.ref.so) + ' stickout, is ' + L(zf.ztop) + ' above the axis: with this stock, tools can stick out up to ' + L(zf.soMax) + '.');
        lines.push(src.length ? 'Read ' + new Date(g.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + ': ' + src.join(', ') + '.' : 'ncSender didn\u2019t say where things are (not connected?). Type them in below.');
        if (g.mtc === 'none' || g.mtc === 'off') lines.push('The Manual Tool Changer isn\u2019t ' + (g.mtc === 'off' ? 'on' : 'installed') + ': type the tool change position in.');
      }
      var typed = Object.keys(tc.typed || {});
      if (typed.length) lines.push('Typed in: ' + typed.map(function (k) { return { zero: 'rotary zero', change: 'tool change', setter: 'tool setter', zsafe: 'safe Z', ztop: 'top of Z', zso: 'stickout of the tool in the spindle' }[k]; }).join(', ') + ' (kept until you read from ncSender again).');
      return lines.map(esc).join('<br>');
    }

    // ---------- work zero from a corner of the rotary
    // Zero X, Y and Z on a corner of the rotary (touch block, 3D probe), then move the work
    // offset by the measured corner-to-axis offsets so X0 is the jaw face and Y0 Z0 the axis.
    // Sent like ncSender's own probe routines: in mm (G21) for the one line, then back to
    // whichever units the controller was in.
    var WS_P = { G54: 1, G55: 2, G56: 3, G57: 4, G58: 5, G59: 6 };
    function P3(q) { return 'X' + L(q.x, U() === 'in' ? 4 : 3).replace(/ \S+$/, '') + ' Y' + L(q.y, U() === 'in' ? 4 : 3).replace(/ \S+$/, '') + ' Z' + L(q.z, U() === 'in' ? 4 : 3); }
    function near(a, b, tol) { return a && b && Math.abs(a.x - b.x) <= tol && Math.abs(a.y - b.y) <= tol && Math.abs(a.z - b.z) <= tol; }
    function zeroInfoHtml() {
      var cz = core.cornerZero(S.job, null), a = S.zeroAsk, wo = S.wo, rows = [];
      var hint = function (h) { rows.push('<div class="rc-row rc-wide" data-hl="rig.corner"><div class="rc-hint" style="margin:0">' + h + '</div></div>'); };
      hint(esc('Once the rotary is on the table: zero X, Y and Z on the corner shown in 3D (touch block or 3D probe), then press Move zero to the rotary axis. It adds the offsets below to the work offset, so X0 is the jaw face and Y0 Z0 the rotary axis.'));
      if (!cz) hint(esc('Set the three offsets below first, or work them out with Remember axis and Remember corner.'));
      else if (wo) hint(esc('Work offset now (' + wo.ws + '): ' + P3(wo) + ', machine.'));
      else hint(esc('ncSender isn’t connected to the controller: the button needs it.'));
      if (S.zeroMsg) hint('<b>' + esc(S.zeroMsg) + '</b>');
      if (a) {
        hint('<b>' + esc('Move ' + a.ws + ' from ' + P3(a.from) + ' to ' + P3(a.to) + ' (machine)?') + '</b> ' + esc('Only right after zeroing on the corner: it adds the offsets to wherever the zero is now.'));
        rows.push('<div class="rc-row rc-wide rc-zero-btns" data-hl="rig.corner"><button class="rc-btn rc-primary rc-act" type="button" data-act="zero-go">Move it</button><button class="rc-btn rc-act" type="button" data-act="zero-cancel">Cancel</button></div>');
      } else {
        rows.push('<div class="rc-row rc-wide" data-hl="rig.corner"><button class="rc-btn rc-primary rc-act" type="button" data-act="zero-move"' + (cz && !S.zeroBusy ? '' : ' disabled') + ' title="Add the corner-to-zero offsets to the active work offset (G10 L2), after you’ve zeroed on the corner">' + (S.zeroBusy ? 'Moving the zero…' : 'Move zero to the rotary axis') + '</button></div>');
      }
      return '<div data-zero="info">' + rows.join('') + '</div>';
    }
    function zeroMeasureHtml() {
      var c = S.job.rig.corner || {}, rows = [];
      rows.push('<div class="rc-row rc-wide" data-hl="rig.corner"><div class="rc-hint" style="margin:0">' + esc('To measure the offsets: zero on the axis at the jaw face the usual way and press Remember axis; then zero on the corner and press Remember corner. The offsets fill in from the two.') +
        (c.axisAt || c.cornerAt ? '<br>' + esc((c.axisAt ? 'Axis: ' + P3(c.axisAt) : 'Axis: not yet') + ' · ' + (c.cornerAt ? 'Corner: ' + P3(c.cornerAt) : 'Corner: not yet') + ' (machine)') : '') + '</div></div>');
      rows.push('<div class="rc-row rc-wide rc-zero-btns" data-hl="rig.corner"><button class="rc-btn rc-act" type="button" data-act="zero-axis" title="The work zero is on the axis at the jaw face now: remember where">Remember axis</button><button class="rc-btn rc-act" type="button" data-act="zero-corner" title="The work zero is on the corner now: remember where">Remember corner</button></div>');
      return '<div data-zero="measure">' + rows.join('') + '</div>';
    }
    function renderZeroRows() {
      var i = side.querySelector('[data-zero=info]'), m = side.querySelector('[data-zero=measure]');
      if (i) i.outerHTML = zeroInfoHtml();
      if (m) m.outerHTML = zeroMeasureHtml();
    }
    function zeroNote(msg) { S.zeroMsg = msg; renderZeroRows(); }
    // the active work offset now, fresh from ncSender (mm, machine)
    function readWo() {
      return readMachine(false).then(function () {
        if (!S.wo) throw new Error('ncSender isn’t connected to the controller');
        return S.wo;
      });
    }
    // ---------- which way A turns: turn it +90 and say where the top of the stock went
    // S.adir: { busy, asked (turned +90, waiting for the answer), out (net turn not undone), msg }
    function adirHtml() {
      var d = S.adir || {}, j = S.job, way = j.a_sign < 0 ? 'away from you (+Y)' : 'toward you (\u2212Y)';
      var hint = d.msg || (d.busy ? 'Turning A\u2026' : d.asked ? 'A turned +90\u00b0. Which way did the top of the stock go?'
        : j.a_checked ? 'Checked: A+90 turns the top of the stock ' + way + '.'
        : 'Not checked yet. Raise Z clear of the stock, press Turn A +90\u00b0 and watch which way the top of the stock goes. (Indexed cuts the wrong side if this is wrong.)');
      var B = function (act, label, v, title) { return '<button class="rc-btn rc-act" type="button" data-act="' + act + '"' + (v !== undefined ? ' data-v="' + v + '"' : '') + (d.busy ? ' disabled' : '') + (title ? ' title="' + esc(title) + '"' : '') + ' style="margin:0 6px 6px 0">' + esc(label) + '</button>'; };
      var btns = d.asked ? B('adir-set', 'Toward me (\u2212Y)', '1') + B('adir-set', 'Away from me (+Y)', '-1') : B('adir-turn', j.a_checked ? 'Turn A +90\u00b0 to check again' : 'Turn A +90\u00b0', undefined, 'Sends a jog of A +90\u00b0 (degrees, whatever the units)');
      if (d.out) btns += B('adir-back', 'Turn it back (A \u221290\u00b0)');
      return '<div class="rc-row rc-wide" data-adir="1"><div class="rc-hint' + (!j.a_checked && !d.asked ? ' rc-warn' : '') + '" style="margin:0">' + esc(hint) + '</div></div><div class="rc-row rc-wide" data-adir="2" style="display:block">' + btns + '</div>';
    }
    function renderAdir() {
      var a = side.querySelector('[data-adir="1"]'), b = side.querySelector('[data-adir="2"]');
      if (a && b) { b.remove(); a.outerHTML = adirHtml(); }
    }
    function adirAct(act, v) {
      var d = S.adir = S.adir || {};
      if (act === 'adir-set') {
        var sg = Number(v), turned = S.job.a_sign !== sg;
        S.job.a_sign = sg; S.job.a_checked = true; d.asked = false; d.msg = '';
        S.warnings = S.warnings.filter(function (w) { return w.indexOf(A_DIR) !== 0; });
        persist();
        renderForm(); syncViewer(false);
        if (turned && S.program) { invalidate(false); flash('warn', 'A turns the other way to what the toolpaths were made for: generate them again.'); } else refresh();
        return;
      }
      // a jog: G21 for this line only, so A is in degrees even if A isn't set as rotary
      var deg = act === 'adir-back' ? -90 : 90, rate = Math.min(1800, Number(S.job.machine && S.job.machine.a_max_deg_min) || 1800);
      d.busy = true; d.msg = ''; renderAdir();
      readWo().then(function (wo) {
        if (wo.status && !/^idle$/i.test(wo.status)) throw new Error('the machine is ' + wo.status + ': wait until it\u2019s idle');
        return sendLine('$J=G91 G21 A' + deg + ' F' + Math.round(rate));
      }).then(function () {
        d.busy = false;
        if (deg > 0) { d.asked = true; d.out = true; } else { d.out = false; d.asked = false; d.msg = 'Turned back to where it was.'; }
        renderAdir();
      }).catch(function (e) { d.busy = false; d.msg = 'Didn\u2019t turn A: ' + e.message + '.'; renderAdir(); });
    }
    function sendLine(cmd) {
      return api.post('/api/send-command', { command: cmd, meta: { sourceId: 'rotary-cam' } }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          var st = j && (j.status || j.Status);
          if (!r.ok || st === 'error' || st === 'skipped') throw new Error(cmd + ': ' + ((j && (j.errorMessage || j.error || j.reason)) || ('ncSender said ' + r.status)));
          return j;
        });
      });
    }
    function f4(v) { return (Math.round(v * 1000) / 1000).toFixed(3); }
    function zeroAct(act) {
      var c = S.job.rig.corner;
      if (act === 'zero-cancel') { S.zeroAsk = null; zeroNote(''); return; }
      if (act === 'zero-axis' || act === 'zero-corner') {
        readWo().then(function (wo) {
          var q = { x: wo.x, y: wo.y, z: wo.z };
          if (act === 'zero-axis') c.axisAt = q; else c.cornerAt = q;
          var msg = 'Remembered the ' + (act === 'zero-axis' ? 'axis' : 'corner') + ' (' + wo.ws + ' ' + P3(q) + ').';
          if (c.axisAt && c.cornerAt) {
            c.dx = c.axisAt.x - c.cornerAt.x; c.dy = c.axisAt.y - c.cornerAt.y; c.dz = c.axisAt.z - c.cornerAt.z;
            msg += ' Offsets from the corner: X' + Ls(c.dx) + ' Y' + Ls(c.dy) + ' Z' + Ls(c.dz) + '.';
          } else msg += act === 'zero-axis' ? ' Now zero on the corner and press Remember corner.' : ' Now zero on the axis and press Remember axis.';
          // the zero is where it is now: the move guard no longer applies
          c.moved = null;
          persist(); S.zeroMsg = msg; renderForm(); syncViewer(false); showHl();
        }).catch(function (e) { zeroNote('Couldn’t read the work offset: ' + e.message + '.'); });
        return;
      }
      if (act === 'zero-move' || act === 'zero-go') {
        var go = act === 'zero-go';
        S.zeroBusy = go; renderZeroRows();
        readWo().then(function (wo) {
          var p = WS_P[wo.ws];
          if (!p) throw new Error('the active work offset is ' + wo.ws + '; use G54 to G59');
          if (wo.status && !/^idle$/i.test(wo.status)) throw new Error('the machine is ' + wo.status + ': wait until it’s idle');
          var cz = core.cornerZero(S.job, wo);
          if (!cz) throw new Error('set the three offsets first');
          // pressed twice, or the zero is already on the axis: adding again would move it off
          if (c.moved && c.moved.ws === wo.ws && near(wo, c.moved.to, 0.005)) throw new Error('the zero is already on the axis (moved there ' + new Date(c.moved.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '). Zero on the corner again first, or it would move twice');
          if (c.axisAt && near(wo, c.axisAt, 0.02)) throw new Error('the zero is where you remembered the axis. Zero on the corner first');
          if (!go) { S.zeroAsk = { ws: wo.ws, p: p, from: { x: wo.x, y: wo.y, z: wo.z }, to: cz.to }; S.zeroMsg = ''; return null; }
          var ask = S.zeroAsk;
          if (!ask || ask.ws !== wo.ws || !near(wo, ask.from, 0.005)) { S.zeroAsk = { ws: wo.ws, p: p, from: { x: wo.x, y: wo.y, z: wo.z }, to: cz.to }; throw new Error('the work offset changed since you pressed the button: check the new numbers'); }
          var line = 'G21 G10 L2 P' + p + ' X' + f4(cz.to.x) + ' Y' + f4(cz.to.y) + ' Z' + f4(cz.to.z), fallback = false;
          return sendLine('#<_rcam_units> = [20 + #<_metric>]').then(function () {
            return sendLine(line).then(function () { return sendLine('G[#<_rcam_units>]'); });
          }, function () {
            // no expressions on this controller: set it in mm and go back to the units ncSender shows
            fallback = true;
            return sendLine(line).then(function () { return S.units === 'in' ? sendLine('G20') : null; });
          }).then(function () { return confirmMoved(ask, fallback); });
        }).then(function () { S.zeroBusy = false; renderZeroRows(); })
          .catch(function (e) { S.zeroBusy = false; if (go) S.zeroAsk = S.zeroAsk && S.zeroAsk.from && e.message.indexOf('changed since') >= 0 ? S.zeroAsk : null; zeroNote('Didn’t move the zero: ' + e.message + '.'); });
      }
    }
    // ncSender re-reads the offsets after G10: check it landed, then update the rotary zero
    function confirmMoved(ask, fallback) {
      var c = S.job.rig.corner, tries = 0;
      return new Promise(function (res) {
        (function poll() {
          setTimeout(function () {
            readMachine(false).then(function () {
              var wo = S.wo, ok = wo && wo.ws === ask.ws && near(wo, ask.to, 0.01);
              if (!ok && ++tries < 8) return poll();
              S.zeroAsk = null;
              if (ok) {
                c.moved = { ws: ask.ws, from: ask.from, to: ask.to, at: Date.now() };
                // the rotary zero for tool changes is this work offset now, typed or not
                var tc = S.job.rig.tc; tc.zero = { x: wo.x, y: wo.y, z: wo.z }; if (tc.typed) delete tc.typed.zero;
                S.zeroMsg = 'Moved ' + ask.ws + ' to the rotary axis: ' + P3(ask.to) + ' (machine). X0 is the jaw face, Y0 Z0 the axis.' + (fallback ? ' (The controller is in ' + (S.units === 'in' ? 'inches (G20)' : 'mm (G21)') + '.)' : '');
              } else S.zeroMsg = 'Sent the move, but ncSender still shows ' + ask.ws + ' at ' + (wo ? P3(wo) : 'nothing') + ': check the work offset before running anything.';
              persist(); renderForm(); refresh(); res();
            });
          }, tries ? 400 : 250);
        })();
      });
    }

    // ---------- model
    function placeModel() {
      if (!S.raw) return;
      S.lead = core.chuckLead(core.prepareJob(S.job));
      S.mesh = core.placeMesh(S.raw, S.job.model, S.lead);
      S.sil = core.silhouette(S.mesh, 0.5);
    }
    function invalidate(remesh) {
      // a longer chuck end tenon (or neck) moves the part along: Part starts at X includes it
      if (!remesh && S.raw && Math.abs(core.chuckLead(core.prepareJob(S.job)) - (S.lead || 0)) > 1e-9) remesh = true;
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
        var job = core.prepareJob(migrate(core.deepMerge(core.DEFAULTS, pr.job || {}), pr.job, true));
        var before = jobJson(job);
        // the rotary, spindle and tool change belong to this machine, not the project
        job.rig = JSON.parse(JSON.stringify(S.job.rig));
        job.fineprint = S.job.fineprint;   // and so does reading the fine print
        // this ncSender's units and machine rates
        job.units = S.units;
        FIELDS.machine.forEach(function (f) {
          if (!f.fw) return;
          var e = S.fw[f.fw], v = e && parseFloat(e.value !== undefined ? e.value : e.Value);
          if (isFinite(v) && v > 0) set(job, f.k, v);
        });
        core.prepareJob(job);
        var same = jobJson(job) === before;   // the saved G-code still fits this machine
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
    $('.rc-saveproj').addEventListener('click', function () { if (S.raw && !S.busy) syncSettings().then(saveProject); });
    $('.rc-open').addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () { openFile(fileInput.files[0]); fileInput.value = ''; });
    var drop = $('.rc-filebox');
    ['dragenter', 'dragover'].forEach(function (t) { root.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('rc-drag'); }); });
    ['dragleave', 'drop'].forEach(function (t) { root.addEventListener(t, function () { drop.classList.remove('rc-drag'); }); });
    root.addEventListener('drop', function (e) { e.preventDefault(); if (e.dataTransfer && e.dataTransfer.files[0]) openFile(e.dataTransfer.files[0]); });

    // ---------- generate
    var A_DIR = 'Indexed depends on which way A turns.';
    function poolSize() {
      // all the cores but one, up to 8 (4 on a machine with little memory)
      var n = (navigator.hardwareConcurrency || 2) - 1, mem = Number(navigator.deviceMemory) || 8;
      return Math.max(1, Math.min(mem <= 4 ? 4 : 8, n));
    }
    function generate() {
      if (!S.mesh || S.busy) return;
      // where the rotary and the tool change are right now (a moment, then on regardless)
      if (!S.tcFresh) {
        S.busy = 'Reading where the rotary and the tool change are\u2026'; refresh();
        var go = function () { S.busy = ''; S.tcFresh = true; generate(); S.tcFresh = false; };
        // and the latest settings, in case another computer changed them
        Promise.race([Promise.all([syncSettings(), readMachine(false)]), new Promise(function (r) { setTimeout(r, 4000); })]).then(go, go);
        return;
      }
      core.prepareJob(S.job);
      S.job.units = S.units;
      // an inch program only where the controller has A as a rotary axis: grblHAL scales A by
      // 25.4 in G20 otherwise (2286 degrees for 90), which carves the features at the wrong angles
      S.job.program_mm = S.units === 'in' && aRotary() !== true;
      S.problems = core.check(S.job, S.mesh, L);
      if (S.problems.length) { refresh(true); return; }
      var plan, wm = core.workMesh(S.job, S.mesh);
      try { plan = core.plan(S.job, wm); } catch (e) { S.problems = [e.message]; refresh(true); return; }
      S.cancel = false; S.busy = 'Starting the CAM engine…'; S.program = null;
      // the steps, each with its share of the bar (a guess at how long each takes)
      var G = S.gen = { t0: performance.now(), stages: [] };
      G.stages.push({ key: 'angles', label: 'Toolpaths round the part', w: 1 });
      if (S.job.finish.enabled) G.stages.push({ key: 'sharp', label: 'Sharp features', w: 0.12 });
      if (core.indexActive(S.job) && window.RotaryCamSim) { G.stages.push({ key: 'missed', label: 'What the rotary passes missed', w: 0.2 }); G.stages.push({ key: 'index', label: 'Indexed', w: 1.4 }); }
      G.stages.push({ key: 'write', label: 'Writing the program', w: 0.08 });
      G.stages.forEach(function (s) { s.f = 0; s.t0 = null; });
      refresh();
      var t0 = performance.now(), key = jobKey();
      var ui = function () { return RC.session.hooks; };
      var mark = function (k, f, text) { if (ui().progress) ui().progress(G, k, f, text); else ui().setBusy(text); };
      var cancelled = function () { return S.cancel; };
      RC.pool = RC.pool || new WorkerPool(host, poolSize());
      RC.pool.start().then(function (pool) {
        mark('angles', 0, 'Calculating\u2026');
        return pool.run(wm.tris, S.job, plan, function (done, total) {
          mark('angles', done / total, 'Calculating ' + done + ' / ' + total + ' angles\u2026');
        }, cancelled);
      }).then(function (maps) {
        if (maps) core.applyBelowAxis(S.job, plan, maps);   // how far past the axis each spot may go
        if (!maps || !S.job.finish.enabled) return maps;
        return core.refineFinish(S.job, core.finishPoints(S.job, plan, maps), function (groups) {
          return RC.pool.probe(groups, cancelled).then(function (z) { if (!z) throw { cancelled: true }; return z; });
        }, function (round, segs) {
          mark('sharp', Math.min(0.95, (round - 1) / 4), 'Checking sharp features, pass ' + round + ' (' + fmt(segs, 0) + ' spots)\u2026');
        }, function (a, x, z) { return core.belowClamp(S.job, plan, maps, a, x, z); }).then(function (r) { maps.finPts = r.pts; maps.finRefined = r.added; return maps; });
      }).then(function (maps) {
        if (!maps || !core.indexActive(S.job) || !window.RotaryCamSim) return maps;
        // play the program up to the end of finishing to see what it leaves, then plan the indexed passes
        var Sm = window.RotaryCamSim, pre = core.buildProgram(S.job, plan, maps, S.fileName, function () {}, function () {}, { stopAfterFinish: true });
        var sim = new Sm.Sim(S.job, S.mesh, Sm.parseProgram(pre.gcode, S.job));
        return new Promise(function (resolve, reject) {
          (function step() {
            if (cancelled()) { reject({ cancelled: true }); return; }
            var done = sim.runToBudget(sim.prog.count, 80);
            mark('missed', sim.k / Math.max(1, sim.prog.count), 'Finding what the rotary passes missed\u2026');
            if (done) resolve(); else setTimeout(step, 0);
          })();
        }).then(function () {
          var left = Sm.indexLeftover(sim, S.job, S.mesh), tn = 0;
          while (tn < left.n && left.target[tn]) tn++;
          S.indexLeft = { n: tn, x: left.x.slice(0, tn), y: left.y.slice(0, tn), z: left.z.slice(0, tn), s: left.s };
          return core.planIndexed(S.job, left, function (groups, onFrac) {
            return RC.pool.drop(groups, cancelled, onFrac).then(function (z) { if (!z) throw { cancelled: true }; return z; });
          }, function (x, y, a) { return sim.hullTop(x, y, a); }, function (t, f) { mark('index', f || 0, 'Indexed: ' + t); }, plan.indexLimits);
        }).then(function (ix) { delete ix.alive; maps.indexed = ix; return maps; });
      }).then(function (maps) {
        // writing the program: say so, and let the page show it before the work starts
        if (G.dead) throw { cancelled: true };
        if (!maps) return maps;
        mark('write', 0.1, 'Writing the program');
        return new Promise(function (res) { setTimeout(function () { res(maps); }, 30); });
      }).then(function (maps) {
        if (G.dead) throw { cancelled: true };
        if (!maps) { S.busy = ''; S.gen = null; ui().refresh(); return; }
        var warns = [];
        var prog = core.buildProgram(S.job, plan, maps, S.fileName, function () {}, function (s) { warns.push(s); }, { paths: true });
        delete maps.finPts;
        S.plan = plan; S.maps = maps; S.program = prog; S.resultKey = key;
        if (RC.sim) { RC.sim = null; S.simReport = null; }
        S.seconds = (performance.now() - t0) / 1000;
        S.warnings = warns.concat(machineWarnings(prog));
        S.busy = ''; S.gen = null;
        if (!core.indexActive(S.job)) S.indexLeft = null;
        store.save('result', { key: key, plan: plan, maps: maps, program: prog, seconds: S.seconds, warnings: S.warnings, left: S.indexLeft });
        ui().showPaths();
        ui().renderForm();
        ui().refresh();
      }).catch(function (e) {
        if (G.dead) return;          // cancelled: already put back as it was
        S.gen = null;
        if (e && e.cancelled) { S.busy = ''; ui().refresh(); return; }
        S.busy = ''; S.problems = ['Toolpath calculation failed: ' + (e.message || e)];
        if (RC.pool) { RC.pool.stop(); RC.pool = null; }
        ui().refresh(true);
      });
    }
    function clock(ms) { var s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
    function progress(G, k, f, text) {
      var now = performance.now(), idx = -1;
      G.stages.forEach(function (s, i) { if (s.key === k) idx = i; });
      if (idx < 0) { setBusy(text); return; }
      G.stages.forEach(function (s, i) { if (i < idx) s.f = 1; });
      var s = G.stages[idx];
      if (!s.t0) s.t0 = now;
      s.f = Math.max(0, Math.min(1, f));
      G.at = { k: k, f: s.f, text: text, t: now };
      // the clock keeps going between reports (if it stops, the page itself is stuck)
      if (!G.timer) G.timer = setInterval(function () {
        if (S.gen !== G || G.dead) { clearInterval(G.timer); return; }
        if (G.at) showStatus(G);
      }, 1000);
      showStatus(G);
    }
    function showStatus(G) {
      var now = performance.now(), idx = -1, k = G.at.k, text = G.at.text;
      G.stages.forEach(function (s, i) { if (s.key === k) idx = i; });
      var s = G.stages[idx];
      // how long this step has left, from how fast it's gone so far (once there's enough to go on)
      var el = now - s.t0, left = s.f >= 0.04 && el > 3000 && s.f < 0.995 ? el * (1 - s.f) / s.f : null;
      var tail = [Math.round(100 * s.f) + '%'];
      if (left !== null) tail.push(left < 60000 ? 'about ' + Math.max(5, Math.round(left / 5000) * 5) + ' s left' : 'about ' + Math.round(left / 60000) + ' min left');
      tail.push(clock(now - G.t0) + ' so far');
      if (G.stages.length > 1) tail.push('step ' + (idx + 1) + ' of ' + G.stages.length);
      setBusy(text.replace(/\u2026$/, '') + '\u2026 ' + tail.join(' \u00b7 '));
      if (!document.body.contains(root)) return;
      var bar = $('.rc-prog');
      if (bar.getAttribute('data-for') !== String(G.t0)) {
        bar.setAttribute('data-for', String(G.t0));
        bar.innerHTML = G.stages.map(function (q) { return '<i style="flex:' + q.w + '" title="' + esc(q.label) + '"><b></b></i>'; }).join('');
      }
      bar.style.display = 'flex';
      var segs = bar.querySelectorAll('i');
      G.stages.forEach(function (q, i) { var b = segs[i] && segs[i].querySelector('b'); if (b) b.style.width = (100 * q.f).toFixed(1) + '%'; if (segs[i]) segs[i].classList.toggle('rc-now', i === idx); });
    }
    function setBusy(text, frac) {
      S.busy = text;
      if (!document.body.contains(root)) return;
      $('.rc-status').textContent = text;
      if (frac !== undefined) { var bar = $('.rc-prog'); bar.removeAttribute('data-for'); bar.innerHTML = '<i><b style="width:' + (100 * frac).toFixed(1) + '%"></b></i>'; bar.style.display = 'flex'; }
    }
    // $376 (grblHAL's rotary axes; bit 0 is A): true, false, or null if the controller didn't say
    function aRotary() {
      var e = S.fw && S.fw['376'], v = e && parseInt(e.value !== undefined ? e.value : e.Value, 10);
      return isFinite(v) ? (v & 1) === 1 : null;
    }
    function machineWarnings(prog) {
      var w = [], fw = S.fw;
      var dm = { m8: 'M8', m7: 'M7', m7m8: 'M7 and M8' }[S.job.dust];
      if (dm) w.push('Dust collection is on (' + dm + ' while cutting, M9 before each tool change and at the end). A dust boot that goes down with it isn\u2019t in the collision checks: make sure it clears the chuck, jaws, tailstock and stock, or turn it off under Machine.');
      // Indexed cuts from the side: A turning the other way puts it on the opposite side
      if (prog.info && prog.info.index && prog.info.index.angles && prog.info.index.angles.length && !S.job.a_checked) w.push(A_DIR + ' This program has A+90 turning the top of the stock ' + (S.job.a_sign < 0 ? 'away from you (+Y)' : 'toward you (\u2212Y)') + '. If yours turns the other way, the rest of the part only comes out mirrored, but Indexed cuts the wrong side: 180\u00b0 off at A90 and A270. Mark the top of the stock, jog A+90 (or use Turn A +90\u00b0 under Machine) and say which way the mark went:');
      if (S.job.program_mm) w.push(aRotary() === false
        ? 'This program is in millimetres (G21), though ncSender is set to inches. The controller doesn\u2019t have A set as a rotary axis ($376=0), and in an inch program (G20) grblHAL would turn A 25.4 times too far, carving the features at the wrong angles. It runs the same in mm. To get inch programs, set $376=1 and reopen Rotary CAM.'
        : 'This program is in millimetres (G21), though ncSender is set to inches: the controller didn\u2019t say whether A is set as a rotary axis ($376), and if it isn\u2019t, grblHAL turns A 25.4 times too far in an inch program. It runs the same in mm.');
      var num = function (k) { var v = fw[k] && parseFloat(fw[k].value !== undefined ? fw[k].value : fw[k].Value); return isFinite(v) ? v : null; };
      var soft = num('20'), aTravel = num('133');
      if (soft === 1 && aTravel && prog.maxA > aTravel) w.push('Soft limits are on ($20=1) and A travel ($133) is ' + fmt(aTravel) + '°, but this program turns A to ' + fmt(prog.maxA, 0) + '°. grblHAL will alarm. Turn soft limits off for this job or raise $133.');
      else if (!aTravel) w.push('This program turns A continuously to ' + fmt(prog.maxA, 0) + '° (' + fmt(prog.maxA / 360, 0) + ' turns). If A has soft limits, check $133 first.');
      // turning that far, a small error in A's steps per degree adds up to a big one
      if (prog.maxA >= 1800) w.push('Over ' + fmt(prog.maxA / 360, 0) + ' turns A has to be calibrated closely: steps per degree ($103) off by 0.1% puts the last passes ' + fmt(prog.maxA * 0.001, 0) + '\u00b0 from where they should be, out of line with the earlier ones. To check: zero A at a mark, G0 A3600 (10 turns), jog until the mark lines up and read A; $103 \u00d7 that reading \u00f7 3600 is the right value.');
      if (S.maps && S.maps.finZ && S.maps.finZ.length) {
        var thin = Infinity, thinX = 0;
        S.maps.finZ.forEach(function (row) { for (var c = 1; c < row.length - 1; c++) if (isFinite(row[c]) && row[c] < thin) { thin = row[c]; thinX = S.plan.finLo + (c - 1) * S.job.finish.pitch; } });
        if (thin <= 0.05) w.push('Near X' + L(thinX, 1) + ' the part doesn\u2019t go round the rotary axis (it\u2019s open in the middle there), so the cutter goes down to or past the axis, and only the part itself holds the two ends together while it\u2019s carved. Fine if it\u2019s meant to be open there (a coil, a slot, a hole through it); if not, check On the rotary axis and Turn about the axis (Part placement). Simulate can\u2019t show the inside of an open part: it draws the stock as solid from the axis out, so between the axis and the part it shows stock that\u2019s really been cut away.');
        else if (thin < Math.max(3, S.job.finish.tool_dia)) w.push('Near X' + L(thinX, 1) + ' the part comes within ' + L(thin) + ' of the rotary axis, so the stock will be very thin there. Check the centring, or reach a tenon past it if it\u2019s near an end.');
      }
      var maxRpm = num('30');
      ['rough', 'finish'].forEach(function (op) {
        if (S.job[op].enabled && maxRpm && S.job[op].rpm > maxRpm) w.push((op === 'rough' ? 'Roughing' : 'Finishing') + ' spindle speed ' + fmt(S.job[op].rpm, 0) + ' rpm is above the controller maximum ($30=' + fmt(maxRpm, 0) + ').');
      });
      return w;
    }
    $('.rc-gen').addEventListener('click', generate);
    $('.rc-cancel').addEventListener('click', function () {
      S.cancel = true;
      // stop it here and now, whatever it's doing or waiting for: the workers go (new ones
      // start next time), and anything that comes back from this calculation is ignored
      if (S.gen) {
        S.gen.dead = true; if (S.gen.timer) clearInterval(S.gen.timer);
        S.gen = null;
        if (RC.pool) { RC.pool.stop(); RC.pool = null; }
        S.busy = '';
        flash('warn', 'Cancelled.');
      }
    });
    $('.rc-noteshead').addEventListener('click', function () {
      S.ui.notes = S.ui.notes === 'shut' ? 'open' : 'shut';
      try { localStorage.setItem('rcam.notes', S.ui.notes); } catch (e) {}
      refresh(true);
    });
    if (LAND) {
      var onLand = function () { if (document.body.contains(root)) refresh(true); };
      if (LAND.addEventListener) LAND.addEventListener('change', onLand); else if (LAND.addListener) LAND.addListener(onLand);
    }
    $('.rc-msgs').addEventListener('click', function (e) {
      if (e.target.closest('.rc-fitpart')) { scaleToFit(); return; }
      // which way A+90 turned the mark: confirmed, or the other way (then the toolpaths go)
      var ad = e.target.closest('.rc-adir');
      if (ad) {
        var sg = Number(ad.getAttribute('data-asign')), turned = S.job.a_sign !== sg;
        S.job.a_sign = sg; S.job.a_checked = true;
        S.warnings = S.warnings.filter(function (w) { return w.indexOf(A_DIR) !== 0; });
        persist();
        if (turned) { renderForm(); invalidate(false); flash('warn', 'A turns the other way: generate the toolpaths again.'); } else refresh();
        return;
      }
      // one stickout (or flute length) for every operation with that tool
      var st = e.target.closest('.rc-sametool');
      if (st) {
        var n = st.getAttribute('data-num'), key = st.getAttribute('data-key'), v = Number(st.getAttribute('data-v'));
        core.opsInOrder(S.job).concat(['corners', 'rough', 'finish', 'index', 'parting']).forEach(function (o) {
          var t = S.job[o];
          if (!t || String(t.tool_number) !== n) return;
          t[key] = v; t.own = Object.assign({}, t.own); t.own[key] = true;
        });
        renderForm(); persist(); invalidate(false);
        return;
      }
      if (e.target.closest('.rc-zspindle')) {
        var d = side.querySelector('details[data-sec=toolchange]');
        if (d) { d.open = true; S.ui.open.toolchange = true; }
        var zi = side.querySelector('#rc-rig-tc-zso');
        if (zi) { zi.scrollIntoView({ block: 'center' }); zi.focus(); }
        return;
      }
      if (e.target.closest('.rc-tenonson')) {
        S.job.tenons.enabled = true;
        if (!(Number(S.job.tenons.chuck.dia) > 0)) S.job.tenons.chuck.dia = core.DEFAULTS.tenons.chuck.dia;
        if (!(Number(S.job.tenons.tailstock.dia) > 0)) S.job.tenons.tailstock.dia = core.DEFAULTS.tenons.tailstock.dia;
        renderForm(); persist(); invalidate(false); openTenons();
        return;
      }
      if (e.target.closest('.rc-fitstart')) {
        S.job.model.part_start_x = S.job.chuck_face_x + S.job.chuck_clearance;
        renderForm(); persist(); invalidate(true);
        return;
      }
      if (e.target.closest('.rc-fitlength') && S.mesh) {
        core.fitStockLength(S.job, S.mesh, fitStep());
        renderForm(); persist(); invalidate(false);
        return;
      }
      var b = e.target.closest('.rc-fitstock');
      if (!b || !S.mesh) return;
      core.fitStock(S.job, S.mesh, fitStep());
      renderForm(); persist(); invalidate(false);
    });

    // ---------- output
    function programName() {
      var stem = (S.fileName || 'part').replace(/\.[^.]+$/, '').replace(/[^\w.\- ]+/g, '_');
      return stem + '_rotary.nc';
    }
    function flash(kind, text) { S.toast = { kind: kind, text: text }; refresh(); }
    // a command that uses the program: the latest settings first; if another computer changed
    // them since it was made, it's dropped (and said so) instead of used
    function withLatest(btn, act) {
      if (btn) btn.disabled = true;
      syncSettings().then(function () {
        if (btn) btn.disabled = false;
        if (!S.program) { var why = S.dropNote; S.dropNote = null; flash('warn', why ? why.text : 'The settings have changed since this program was made: generate again.'); return; }
        S.dropNote = null;
        act();
      });
    }
    $('.rc-load').addEventListener('click', function (e) {
      var btn = e.currentTarget;
      withLatest(btn, function () { loadProgram(btn); });
    });
    function loadProgram(btn) {
      btn.disabled = true;
      api.post('/api/gcode-files/load-temp', { filename: programName(), content: S.program.gcode }).then(function (r) {
        if (!r.ok) throw new Error('ncSender said ' + r.status);
        closeDialog();
      }).catch(function (err) { btn.disabled = false; flash('err', 'Couldn’t load the program: ' + err.message); });
    }
    $('.rc-save').addEventListener('click', function (e) {
      var btn = e.currentTarget;
      withLatest(btn, function () { saveToFm(btn); });
    });
    function saveToFm(btn) {
      btn.disabled = true;
      freePath(programName()).then(function (path) {
        return api.post('/api/gcode-files/file/save', { path: path, content: S.program.gcode }).then(function (r) {
          if (!r.ok) throw new Error('save failed (' + r.status + ')');
          flash('ok', 'Saved to File Manager: ' + path);
        });
      }).catch(function (err) { flash('err', 'Couldn’t save: ' + err.message); }).then(function () { btn.disabled = false; });
    }
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
    $('.rc-dl').addEventListener('click', function (e) { withLatest(e.currentTarget, downloadProgram); });
    function downloadProgram() {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([S.program.gcode], { type: 'text/plain' }));
      a.download = programName();
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
    }

    // ---------- the stock at a glance: what's set, the least the part needs, and the room Z has
    function stockOverview() {
      var j = S.job, st = j.stock || {}, sb1 = $('.rc-sb1'), sb2 = $('.rc-sb2');
      if (!sb1) return;
      var short = function (txt, bad) { return bad ? '<span class="rc-short" style="display:inline">' + esc(txt) + '</span>' : esc(txt); };
      var size = function (q) { return q.shape === 'square' ? L(q.width) + ' square' : q.shape === 'rect' ? L(q.width).replace(/ \S+$/, '') + ' \u00d7 ' + L(q.height) : '\u00d8' + L(q.dia); };
      var ms = S.mesh ? core.minStock(j, S.mesh) : null;
      // short only when it reads smaller than the need as shown: a 32 mm stock against a need of 32.003 mm (shown "32 mm") is fine
      var under = function (have, need) { have = Number(have); return have < need - 1e-6 && L(have) !== L(need); };
      var thin = ms && (ms.shape === 'square' ? under(st.width, ms.width) : ms.shape === 'rect' ? under(st.width, ms.width) || under(st.height, ms.height) : under(2 * j.stock_radius, ms.dia));
      var clamp = Number(st.clamp) || 0, shortL = ms && under(Number(j.tailstock_x) - Number(j.chuck_face_x) + clamp, ms.length + clamp);
      sb1.innerHTML = 'Stock ' + short(size({ shape: st.shape || 'round', width: st.width, height: st.height, dia: 2 * j.stock_radius }), thin) + ' \u00d7 ' + short(L(Number(j.tailstock_x) - Number(j.chuck_face_x) + clamp), shortL) + ' long, ' + L(clamp) + ' in the jaws';
      var bits = [];
      if (ms) bits.push('Part needs at least ' + short(size(ms), thin) + ' \u00d7 ' + short(L(ms.length + clamp), shortL));
      // Z: the least room any operation's tool has above the axis, against what the stock needs
      var zf = core.zFit(j), zbad = zf && core.opsInOrder(j).some(function (op) { var zr = core.zRoom(j, op); return zr && zr.top < zf.need; });
      if (zf) bits.push('<span style="display:inline" title="With Z at the top of its travel and this stock, from the tool in the spindle (T' + esc(String(zf.ref.tool || '?')) + ', ' + esc(L(zf.ref.so)) + ' stickout) and its tip ' + esc(L(zf.ztop)) + ' above the axis">' + short('Z allows ' + L(zf.soMax) + ' stickout', zbad) + '</span>');
      else if (core.zNotOnAxis(j)) bits.push('<span style="display:inline;color:#b45309;font-weight:600">Z room: zero Z on the rotary axis first</span>');
      else if (S.tcRead && S.tcRead.zNotHomed) bits.push('<span style="display:inline;color:#b45309;font-weight:600">Z room: home the machine first</span>');
      else bits.push('Z room: not known yet (ncSender not connected?)');
      sb2.innerHTML = bits.join(' \u00b7 ');
      $('.rc-stockbox').classList.toggle('rc-bad', !!(thin || shortL));
    }
    function openTenons() {
      var d = side.querySelector('details[data-sec=tenons]');
      if (d) { d.open = true; S.ui.open.tenons = true; d.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
    }
    $('.rc-stockbox').addEventListener('click', function () {
      var d = side.querySelector('details[data-sec=stock]');
      if (d) { d.open = true; S.ui.open.stock = true; d.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
    });

    // ---------- version and updates (ncSender looks for a newer release of the plugin)
    var upd = { info: null };
    function checkUpdate() {
      var c = RC.updateCheck;
      if (c && Date.now() - c.at < 6 * 3600e3) { showUpdate(c.info); return; }
      api.get('/api/plugins/' + PLUGIN_ID + '/check-update').then(function (info) {
        RC.updateCheck = { at: Date.now(), info: info };
        showUpdate(info);
      }).catch(function () {});
    }
    function showUpdate(info) {
      upd.info = info && (info.updateAvailable || info.UpdateAvailable) ? info : null;
      var b = $('.rc-update');
      if (!b) return;
      b.hidden = !upd.info;
      if (upd.info) b.title = 'Rotary CAM ' + 'v' + (upd.info.latestVersion || upd.info.LatestVersion) + ' is out: click for how to update';
    }
    function updPop(html) { var pop = $('.rc-updpop'); pop.innerHTML = html; pop.hidden = !html; }
    $('.rc-update').addEventListener('click', function (e) {
      e.stopPropagation();
      var pop = $('.rc-updpop');
      if (!pop.hidden) { pop.hidden = true; return; }
      var i = upd.info || {}, latest = i.latestVersion || i.LatestVersion || '', url = i.releaseUrl || i.ReleaseUrl || '';
      updPop('<b>Rotary CAM v' + esc(latest) + ' is out</b> (this is v' + esc(core.VERSION) + ').' + (url ? ' <a href="' + esc(url) + '" target="_blank" rel="noopener">What\u2019s new</a>' : '') +
        '<div class="rc-updbtns"><button class="rc-btn rc-primary" type="button" data-upd="settings">Open ncSender\u2019s plugin settings</button>' +
        '<button class="rc-btn" type="button" data-upd="now"' + (S.busy ? ' disabled' : '') + '>Update now</button></div>');
    });
    $('.rc-updpop').addEventListener('click', function (e) {
      e.stopPropagation();
      var b = e.target.closest('[data-upd]');
      if (!b) return;
      if (b.getAttribute('data-upd') === 'settings') {
        // ncSender has no link to its settings: close this, press its Settings button, pick Plugins
        var gear = document.querySelector('button.theme-toggle[title="Settings"]');
        if (!gear) { updPop($('.rc-updpop').innerHTML + '<div style="margin-top:8px">Open ncSender\u2019s <b>Settings \u203a Plugins</b> to update Rotary CAM.</div>'); return; }
        closeDialog();
        setTimeout(function () {
          gear.click();
          var tries = 0;
          (function pick() {
            var tab = Array.prototype.filter.call(document.querySelectorAll('.tab-button'), function (t) { return /plugins/i.test(t.textContent); })[0];
            if (tab) tab.click(); else if (++tries < 30) setTimeout(pick, 100);
          })();
        }, 250);
      } else {
        b.disabled = true; b.textContent = 'Updating\u2026';
        api.post('/api/plugins/' + PLUGIN_ID + '/update', {}).then(function (r) {
          if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) { throw new Error(j.error || j.message || ('ncSender said ' + r.status)); });
          RC.updateCheck = null;
          updPop('<b>Updated.</b> Close Rotary CAM and open it again to use the new version.');
          $('.rc-update').hidden = true;
        }).catch(function (err) { b.disabled = false; b.textContent = 'Update now'; updPop($('.rc-updpop').innerHTML + '<div style="margin-top:8px;color:#d64545">Couldn\u2019t update: ' + esc(err.message) + '</div>'); });
      }
    });
    root.addEventListener('click', function () { var pop = $('.rc-updpop'); if (pop && !pop.hidden) pop.hidden = true; });

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
      stockOverview();
      var pn = side.querySelector('[data-note=parting]');
      if (pn) { var pt = partingNote(S.job, L); if (pn.textContent !== pt) pn.textContent = pt; }
      var tci = side.querySelector('.rc-tcinfo');
      if (tci) { var tch = tcInfoLines(); if (tci.innerHTML !== tch) tci.innerHTML = tch; }
      var msgs = [];
      if (S.saveFailed) msgs.push('<div class="rc-msg rc-warn"><b>Settings</b><span>Couldn\u2019t save the settings to ncSender. Still trying; keep this window open until this goes away.</span></div>');
      var clashes = core.toolClashes(S.job);
      S.problems.forEach(function (p) {
        // each fix names the field it changes and the value it sets
        var fix = '';
        if (/^The part (is|needs)/.test(p) && S.mesh) {
          var fj = JSON.parse(JSON.stringify(S.job)), fs = core.fitStock(fj, S.mesh, fitStep());
          var fset = fs.shape === 'square' ? 'Stock width to ' + L(fs.width) : fs.shape === 'rect' ? 'Width × Height to ' + L(fs.width).replace(/ \S+$/, '') + ' × ' + L(fs.height) : 'Stock diameter to ' + L(fs.dia);
          fix = '<button class="rc-btn rc-fitstock" type="button" title="Make the stock thick enough for the part, with 1 mm to spare all round. The length stays.">Set ' + esc(fset) + '</button><button class="rc-btn rc-fitpart" type="button" style="margin-left:0" title="Shrink the part to fit the stock with 1 mm to spare all round">Scale the part to fit</button>';
        }
        if (/^Parting cuts the tenons down to size/.test(p)) fix = '<button class="rc-btn rc-tenonson" type="button">Turn on Tenons</button>';
        if (/^Part starts at X is inside the keep-away/.test(p)) fix = '<button class="rc-btn rc-fitstart" type="button" title="Start the work (the chuck end tenon, then the part) at the keep-away from the jaws">Set Part starts at X to ' + esc(L(S.job.chuck_clearance)) + '</button>';
        if (/^The Stock length is too short/.test(p) && S.mesh) {
          var lj = JSON.parse(JSON.stringify(S.job)), clampL = Number(lj.stock && lj.stock.clamp) || 0;
          fix = '<button class="rc-btn rc-fitlength" type="button" title="Long enough for the part, the tailstock end tenon or room for the tools past the end, and the keep-away from the tailstock. The clamping distance stays.">Set Stock length to ' + esc(L(core.fitStockLength(lj, S.mesh, fitStep()) - lj.chuck_face_x + clampL)) + '</button><button class="rc-btn rc-fitpart" type="button" style="margin-left:0" title="Shrink the part to fit the stock">Scale the part to fit</button>';
        }
        // one stickout (or flute length) for a tool: pick which
        var cm = p.match(/^T(\d+)(?: sticks out|\u2019s flutes)/);
        if (cm) clashes.forEach(function (c) {
          if (String(c.num) !== cm[1] || c.key !== (/sticks out/.test(p) ? 'stickout' : 'tool_length')) return;
          fix += c.vals.map(function (q) { return '<button class="rc-btn rc-sametool" type="button" style="margin-left:0;margin-right:6px" data-num="' + c.num + '" data-key="' + c.key + '" data-v="' + q.v + '">' + esc(L(q.v)) + ' for all T' + c.num + '</button>'; }).join('');
        });
        if (/^Z travel:/.test(p)) { var zri = core.zRefInfo(S.job); fix += '<button class="rc-btn rc-zspindle" type="button" style="margin-left:0" title="Under Tool changes: how far the tool in the spindle sticks out">' + (zri.how === 'first' && zri.said ? 'Set T' + esc(String(zri.said)) + '\u2019s stickout' : 'Set the tool in the spindle') + '</button>'; }
        // a message of several lines: its first line is the gist
        var ph = esc(p).split('\n');
        if (ph.length > 1) ph[0] = '<span style="display:inline;font-weight:600">' + ph[0] + '</span>';
        msgs.push('<div class="rc-msg rc-err"><b>Fix</b><span>' + ph.join('<br>') + '</span>' + fix + '</div>');
      });
      S.warnings.forEach(function (p) {
        var bad = /^!!/.test(p), btn = p.indexOf(A_DIR) === 0 ? [['1', 'Toward me (\u2212Y)'], ['-1', 'Away from me (+Y)']].map(function (o) { return '<button class="rc-btn rc-adir" type="button" style="margin-left:0;margin-right:6px" data-asign="' + o[0] + '">' + o[1] + '</button>'; }).join('') : '';
        msgs.push('<div class="rc-msg ' + (bad ? 'rc-err' : 'rc-warn') + '"><b>' + (bad ? 'Danger' : 'Check') + '</b><span>' + esc(p.replace(/^!!/, '')) + '</span>' + btn + '</div>');
      });
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
      // a notice (what just happened): first in the list, or floating over the view when the
      // checks have a column of their own (open, shut or not there)
      var land = !!(LAND && LAND.matches);
      var toast = S.toast ? '<div class="rc-msg rc-' + S.toast.kind + ' rc-toastmsg"><span>' + esc(S.toast.text) + '</span></div>' : '';
      S.toast = null;
      var nk = { err: 0, warn: 0, ok: 0 };
      msgs.forEach(function (m) { var k = m.match(/class="rc-msg rc-(err|warn|ok)/); if (k) nk[k[1]]++; });
      // only when they change: a field's change on blur (clicking a message's button) would
      // otherwise rebuild the button under the pointer and lose the click
      var mh = (land ? '' : toast) + msgs.join('');
      if (RC.msgHtml !== mh || !$('.rc-msgs').childElementCount !== !mh) { $('.rc-msgs').innerHTML = mh; RC.msgHtml = mh; }
      var th = land ? toast : '';
      if ($('.rc-toasts').innerHTML !== th) $('.rc-toasts').innerHTML = th;
      var notes = $('.rc-notes'), shut = S.ui.notes === 'shut';
      notes.classList.toggle('rc-none', !msgs.length);
      $('.rc-main').classList.toggle('rc-nonotes', !msgs.length);
      notes.classList.toggle('rc-shut', shut);
      var hh = '<span class="rc-notestitle">Checks</span>' +
        (nk.err ? '<i class="rc-nb rc-nb-err" title="' + nk.err + ' to fix">' + nk.err + '</i>' : '') +
        (nk.warn ? '<i class="rc-nb rc-nb-warn" title="' + nk.warn + ' to check">' + nk.warn + '</i>' : '') +
        (nk.ok ? '<i class="rc-nb rc-nb-ok" title="' + nk.ok + ' for your information">' + nk.ok + '</i>' : '') +
        '<span class="rc-nchev" aria-hidden="true">' + (shut ? '\u00ab' : '\u00bb') + '</span>';
      var head = $('.rc-noteshead');
      if (head.innerHTML !== hh) head.innerHTML = hh;
      head.title = shut ? 'Show the checks' : 'Hide the checks: more room for the view';
      head.setAttribute('aria-expanded', shut ? 'false' : 'true');
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
      // the form's part buttons (Scale to fit, Size the stock) follow a part being opened
      root.querySelectorAll('.rc-act[data-act=fitscale], .rc-act[data-act=fitstock]').forEach(function (b) { b.disabled = busy || !S.mesh; });
      $('.rc-open').disabled = busy;
      $('.rc-saveproj').disabled = busy || !S.raw || !PJ;
      $('.rc-cancel').hidden = !busy || !/Calculating|Starting|Checking|Finding|Indexed|Writing/.test(S.busy);
      $('.rc-prog').style.display = busy && S.gen ? 'flex' : 'none';
      $('.rc-status').textContent = S.busy || (S.program ? 'Ready: ' + programName() : '');
      ['.rc-load', '.rc-save', '.rc-dl'].forEach(function (s) { $(s).disabled = busy || !S.program; });
      $('.rc-load').classList.toggle('rc-primary', !!S.program && !busy);
      $('.rc-gen').classList.toggle('rc-primary', !S.program || busy);
      syncToolbar();
      syncViewer(S.partDirty); S.partDirty = false;
      syncIndex();
      syncToolChanges();
      if (hlShown && viewer && viewer.highlight) viewer.highlight(hlShown, hlText(hlShown), false);
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
      if (!resumed && r[1] && r[1].job) { S.job = core.prepareJob(migrate(core.deepMerge(core.DEFAULTS, r[1].job), r[1].job)); S.saveBase = JSON.parse(JSON.stringify(r[1].job)); }
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
        if (t) applyLibraryTool(op, t, true);
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
      checkUpdate();
      if (finePrintDue()) finePrint(false);
      if (resumed) flushSave();
      // where the rotary and the tool change are (quietly; nothing changes under saved toolpaths)
      if (!resumed) readMachine(false).then(function () {
        if (!document.body.contains(root)) return;
        if (S.program && S.resultKey !== jobKey()) { S.program = null; S.plan = null; S.maps = null; S.warnings = []; store.drop('result'); showPaths(); }
        renderForm(); refresh();
      });
    });

    RC.session.hooks = { setBusy: setBusy, progress: progress, refresh: refresh, showPaths: showPaths, simReady: simReady, renderForm: renderForm };

    // test hook
    RC.__state = S;
  };
})();
