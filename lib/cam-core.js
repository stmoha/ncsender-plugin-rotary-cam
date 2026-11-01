/*
 * Rotary CAM core - shared by the ncSender plugin dialog and the Node test runner.
 * No DOM, no OpenCAMLib: mesh placement, job planning, toolpaths and the grblHAL post.
 *
 * Machine convention: A rotates about X, chuck on -X, tailstock on +X.
 * Work zero: X0 = chuck jaw face, Y0 Z0 = rotary centreline, so Z = tool-tip radius.
 *
 * Port of rotary_cam.py (same job keys, same algorithms).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RotaryCamCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = '0.9.6';

  var DEFAULTS = {
    stock_radius: 20.0,          // largest stock radius (set from `stock` by prepareJob)
    stock: { shape: 'round', dia: 40.0, width: 40.0, height: 40.0, clamp: 12.7 },  // round | square (width) | rect (width x height at A0); clamp: how far it goes into the jaws
    units: 'mm',                 // program units: 'mm' (G21) or 'in' (G20)
    program_mm: false,           // write it in mm even though units is 'in' (the controller would scale A in G20)
    x_start: null,               // leftmost tool-centre X to machine (null = part start)
    x_end: null,                 // rightmost tool-centre X (null = part end)
    chuck_face_x: 0.0,
    chuck_clearance: 5.0,
    tailstock_x: 245.0,          // the live centre: the stock's far end (stock length = clamp + this)
    tailstock_clearance: 8.0,
    a_sign: 1,                   // +1: A+ turns the top of the stock toward -Y
    safe_clearance: 5.0,
    angle_step_deg: 2.0,
    tool_change: 'm6',           // 'm6': M6 Tn (ncSender's tool change) | 'm0': pause
    model: {
      axis: 'x',                 // which model axis is the turning axis
      flip: false,               // turn the part end for end
      centre: 'bbox',            // what goes on the rotary axis: bbox | chuck_end | tail_end | origin
      roll: 0,                   // turn the part about the rotary axis (deg): what faces up at A0
      part_start_x: 25.0,        // where the part's chuck end sits (mm from jaw face): room for the collet nut beside the chuck
      scale: 1                   // size factor on the model as drawn
    },
    machine: { a_max_deg_min: 5400.0, x_max_mm_min: 5000.0, y_max_mm_min: 5000.0, z_max_mm_min: 2500.0 },
    // The rotary and the spindle, for collisions. Lengths in mm from the work zero (X0 at
    // the jaw face, Y0 Z0 on the axis); heights are above the axis. Every tool's holder is
    // its collet nut and the spindle above it; how far each tool sticks out of the nut is
    // the operation's `stickout`.
    rig: {
      chuck: { dia: 100, len: 45, jaws: 4 },        // jaws included, from the jaw face back; 4 (independent) or 3 jaws, for the 3D view
      head: { len: 110, front: 55, back: 55, top: 60 },   // motor / gearbox housing behind the chuck: how far it reaches toward you (-Y) and away (+Y) from the axis
      centre: { dia: 30, len: 28, total: null },    // live centre: its cone (point at tailstock_x), then a cylinder to `total` (null: no cylinder)
      tail: { len: 90, front: 35, back: 35, top: 45 },    // tailstock body behind the live centre (lock lever, handwheel and all)
      nut: { dia: 35, len: 20 },                    // collet nut (ER20 ~ 35 x 20)
      spindle: { dia: 80 },
      clear: 2.0,                                   // kept between the holder and anything
      // tool changes: where the rotary and the tool change are on the machine (machine
      // coordinates, mm), read from ncSender when it's connected
      // ztop / zbot: how far the top (machine Z0) and the bottom of Z travel are above the rotary
      // axis for the tool in the spindle (zso: its stickout, if known), read from ncSender
      tc: { route: true, zero: null, change: null, setter: null, zsafe: null, limits: null, from: '', ztop: null, zbot: null, zso: null, ztool: null },
      // Work zero from a corner of the rotary: zero X, Y and Z on a corner you can touch off
      // (headstock housing, say), then add these to the work offset to put X0 at the jaw face
      // and Y0 Z0 on the axis. Measured (the axis point minus the corner), not the keep-out
      // boxes above, which can be as generous as you like. `axisAt` / `cornerAt`: G54 values
      // remembered to work them out; `moved`: the last move, so it isn't added twice.
      corner: { dx: null, dy: null, dz: null, axisAt: null, cornerAt: null, moved: null }
    },
    // round stubs on the rotary axis at the part's ends, left uncut so the part stays
    // joined to the stock; `same` uses the chuck end's size at both ends
    tenons: {
      enabled: true, ends: 'both', same: true,
      chuck: { dia: 12.7, depth: 6.35, len: null },       // len: how far it runs out of the part (null: the room the tools need)
      tailstock: { dia: 12.7, depth: 6.35, len: null }
    },
    // square / rectangular stock only: lock A with each corner up and face it flat (3+1)
    corners: {
      enabled: true, tool_number: 1, tool_desc: '6.35mm (1/4in) 2-flute flat end mill',
      tool_dia: 6.35, tool_length: 25.0, stickout: 31.0, rpm: 18000, feed: 2000.0, plunge_feed: 600.0,
      stepdown: 2.5, stepover: 3.8, leave: 0.5
    },
    // after finishing: neck the stock down beside the part's ends, ready to cut it free
    parting: {
      enabled: false, ends: 'both', neck_dia: 6.0, width: 0, gap: 0.5,
      tool_number: 1, tool_desc: '6.35mm (1/4in) 2-flute flat end mill',
      tool_dia: 6.35, tool_length: 25.0, stickout: 31.0, rpm: 18000, feed: 1200.0, plunge_feed: 400.0, stepdown: 1.5
    },
    rough: {
      enabled: true, tool_number: 1, tool_desc: '6.35mm (1/4in) 2-flute flat end mill',
      tool_dia: 6.35, tool_length: 25.0, stickout: 31.0, rpm: 18000, feed: 2000.0, plunge_feed: 600.0,
      stepdown: 2.5, pitch: 3.5, leave: 0.5, x_grid: 0.5
    },
    finish: {
      enabled: true, tool_number: 2, tool_desc: '6.35mm (1/4in) ball end mill',
      tool_dia: 6.35, tool_length: 25.0, stickout: 28.0, rpm: 18000, feed: 1500.0, plunge_feed: 600.0,
      pitch: 0.5, tolerance: 0.01,
      shape: 'ball', taper_deg: 3.6, shank_dia: 3.175     // 'taper': tool_dia is the tip, the cone widens to the shank
    },
    // after finishing: lock A at a few angles and raster the spots no line through the
    // axis could reach (under a jaw, a chin), with the tool offset in Y (3+1)
    index: {
      enabled: false, what: 'all', auto: false, max_angles: 4, angle_list: '90, 270', min_left: 0.25,   // auto: try every 15 deg and pick (slower)
      tool_number: 3, tool_desc: '3.175mm (1/8in) ball end mill',
      tool_dia: 3.175, tool_length: 12.0, stickout: 18.0, rpm: 18000, feed: 1000.0, plunge_feed: 300.0,
      stepover: 0.3, stepdown: 1.0,
      shape: 'ball', taper_deg: 3.6, shank_dia: 3.175
    }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function deepMerge(base, over) {
    var out = clone(base);
    if (!over || typeof over !== 'object') return out;
    Object.keys(over).forEach(function (k) {
      var v = over[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object') {
        out[k] = deepMerge(out[k], v);
      } else if (v !== undefined) {
        out[k] = v;
      }
    });
    return out;
  }

  // ---------------------------------------------------------------- stock
  // Square / rectangular stock half-sizes along the part's Y and Z at A0 (null = round)
  function stockHalf(job) {
    var s = job.stock || {};
    if (s.shape === 'square') return [s.width / 2, s.width / 2];
    if (s.shape === 'rect') return [s.width / 2, s.height / 2];
    return null;
  }
  function stockMaxRadius(job) {
    var h = stockHalf(job);
    if (h) return Math.hypot(h[0], h[1]);
    return job.stock && Number(job.stock.dia) > 0 ? job.stock.dia / 2 : job.stock_radius;
  }
  // Distance from the axis to the stock surface straight under the tool at angle A
  function stockRadiusAt(job, aDeg) {
    var h = stockHalf(job);
    if (!h) return stockMaxRadius(job);
    var t = aDeg * job.a_sign * Math.PI / 180, sy = Math.abs(Math.sin(t)), cz = Math.abs(Math.cos(t));
    return Math.min(sy > 1e-9 ? h[0] / sy : Infinity, cz > 1e-9 ? h[1] / cz : Infinity);
  }
  // Fills in derived values; call before planning
  function prepareJob(job) {
    if (!job.stock) job.stock = { shape: 'round', dia: 2 * job.stock_radius, width: 2 * job.stock_radius, height: 2 * job.stock_radius };
    job.stock_radius = stockMaxRadius(job);
    return job;
  }

  // ---------------------------------------------------------------- mesh
  // tris: Float32Array of n*9 (x0,y0,z0, x1,y1,z1, x2,y2,z2 per triangle)

  // Which centring a model uses (older settings had a boolean `center`)
  function centreMode(model) {
    if (model && typeof model.centre === 'string') return model.centre;
    if (model && model.center === true) return 'bbox';
    if (model && model.center === false) return 'origin';
    return 'bbox';
  }

  // Settings saved before 0.7.1 gave the headstock and tailstock one width, centred on the
  // axis; now each has its own reach toward you (front, -Y) and away (back, +Y)
  function migrateRig(job, saved) {
    var sr = saved && saved.rig;
    if (!sr || !job.rig) return job;
    ['head', 'tail'].forEach(function (k) {
      var o = sr[k];
      if (o && o.width !== undefined && o.front === undefined && o.back === undefined) {
        job.rig[k].front = job.rig[k].back = num(o.width) / 2;
      }
      if (job.rig[k]) delete job.rig[k].width;
    });
    return job;
  }

  // Settings saved before 0.9.0 had Indexed picking its own angles by default: listing them
  // is the default now (much faster). Someone who ticks it again keeps it (auto_chosen).
  function migrateIndex(job, saved) {
    var si = saved && saved.index;
    if (si && si.auto === true && !si.auto_chosen && job.index) job.index.auto = false;
    return job;
  }

  // the part's scale factor (1 = as drawn)
  function scaleOf(model) {
    var s = model && Number(model.scale);
    return isFinite(s) && s > 0 ? s : 1;
  }

  // Longest side of the raw model: the usual turning axis
  function longestAxis(t) {
    var b = bounds(t), d = [b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]];
    return d[0] >= d[1] && d[0] >= d[2] ? 'x' : d[1] >= d[2] ? 'y' : 'z';
  }

  // Raw model -> machine frame at A0: turning axis on X, centred on Y0 Z0 by the chosen
  // rule, turned by `roll` about the rotary axis, chuck end at part_start_x.
  function placeMesh(src, model) {
    model = model || {};
    var n = src.length / 9;
    var out = new Float32Array(src.length);
    var axis = model.axis || 'x', sc = scaleOf(model);
    var i, k, x, y, z, nx, ny, nz;
    // cyclic permutation keeps the mesh right-handed; scaled about the model's origin
    for (i = 0; i < n * 3; i++) {
      x = src[i * 3] * sc; y = src[i * 3 + 1] * sc; z = src[i * 3 + 2] * sc;
      if (axis === 'y') { nx = y; ny = z; nz = x; }
      else if (axis === 'z') { nx = z; ny = x; nz = y; }
      else { nx = x; ny = y; nz = z; }
      if (model.flip) { nx = -nx; ny = -ny; }   // 180 deg about Z
      out[i * 3] = nx; out[i * 3 + 1] = ny; out[i * 3 + 2] = nz;
    }
    var b = bounds(out);
    var dy = 0, dz = 0, mode = centreMode(model);
    if (mode === 'bbox') { dy = -(b.min[1] + b.max[1]) / 2; dz = -(b.min[2] + b.max[2]) / 2; }
    else if (mode === 'chuck_end' || mode === 'tail_end') {
      // centre of the cross-section within a short slice at that end
      var len = b.max[0] - b.min[0], slice = Math.max(1.0, len * 0.03);
      var lo = mode === 'chuck_end' ? b.min[0] : b.max[0] - slice, hi = mode === 'chuck_end' ? b.min[0] + slice : b.max[0];
      var ylo = Infinity, yhi = -Infinity, zlo = Infinity, zhi = -Infinity;
      for (i = 0; i < n * 3; i++) {
        x = out[i * 3];
        if (x < lo || x > hi) continue;
        y = out[i * 3 + 1]; z = out[i * 3 + 2];
        if (y < ylo) ylo = y; if (y > yhi) yhi = y; if (z < zlo) zlo = z; if (z > zhi) zhi = z;
      }
      if (isFinite(ylo)) { dy = -(ylo + yhi) / 2; dz = -(zlo + zhi) / 2; }
      else { dy = -(b.min[1] + b.max[1]) / 2; dz = -(b.min[2] + b.max[2]) / 2; }
    }
    var start = isFinite(model.part_start_x) && model.part_start_x !== null && model.part_start_x !== '' ? Number(model.part_start_x) : b.min[0];
    var dx = start - b.min[0];
    var roll = (Number(model.roll) || 0) * Math.PI / 180, c = Math.cos(roll), s = Math.sin(roll);
    var min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity], rmax = 0;
    for (i = 0; i < n * 3; i++) {
      x = out[i * 3] + dx; y = out[i * 3 + 1] + dy; z = out[i * 3 + 2] + dz;
      // roll about the rotary axis, the same sense as the A axis with a_sign = +1 (+Z toward -Y)
      ny = y * c - z * s; nz = y * s + z * c;
      out[i * 3] = x; out[i * 3 + 1] = ny; out[i * 3 + 2] = nz;
      var v = [x, ny, nz];
      for (k = 0; k < 3; k++) { if (v[k] < min[k]) min[k] = v[k]; if (v[k] > max[k]) max[k] = v[k]; }
      var r = Math.hypot(ny, nz);
      if (r > rmax) rmax = r;
    }
    return { tris: out, count: n, min: min, max: max, rmax: rmax, ends: endsSurround(out, min[0], max[0]) };
  }

  // Does the part's end go all the way round the rotary axis? Only then may the tools run
  // past that end: if the end sits off to one side, a tool past it would drop down beside
  // the part and cut through the stock that holds it.
  function endsSurround(t, lo, hi) {
    var slab = Math.max(0.5, (hi - lo) * 0.01);
    function surrounds(a, b) {
      var ang = [], centre = false;
      for (var i = 0; i < t.length; i += 3) {
        var x = t[i];
        if (x < a || x > b) continue;
        var r = Math.hypot(t[i + 1], t[i + 2]);
        if (r < 0.05) { centre = true; continue; }
        ang.push(Math.atan2(t[i + 1], t[i + 2]));
      }
      if (ang.length < 3) return false;
      ang.sort(function (p, q) { return p - q; });
      var gap = ang[0] + 2 * Math.PI - ang[ang.length - 1];
      for (var k = 1; k < ang.length; k++) gap = Math.max(gap, ang[k] - ang[k - 1]);
      return gap < 170 * Math.PI / 180 || (centre && gap < Math.PI);
    }
    return { lo: surrounds(lo, lo + slab), hi: surrounds(hi - slab, hi) };
  }

  function bounds(t) {
    var min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (var i = 0; i < t.length; i += 3) {
      for (var k = 0; k < 3; k++) {
        var v = t[i + k];
        if (v < min[k]) min[k] = v;
        if (v > max[k]) max[k] = v;
      }
    }
    return { min: min, max: max };
  }

  // Parse binary or ASCII STL into Float32Array n*9
  function parseSTL(buffer) {
    var bytes = new Uint8Array(buffer);
    var dv = new DataView(buffer);
    if (bytes.length >= 84) {
      var n = dv.getUint32(80, true);
      if (84 + n * 50 === bytes.length) {
        var t = new Float32Array(n * 9);
        for (var i = 0; i < n; i++) {
          var o = 84 + i * 50 + 12;
          for (var k = 0; k < 9; k++) t[i * 9 + k] = dv.getFloat32(o + 4 * k, true);
        }
        return t;
      }
    }
    var text = new TextDecoder().decode(bytes);
    var re = /vertex\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)/g, m, vals = [];
    while ((m = re.exec(text))) vals.push(+m[1], +m[2], +m[3]);
    if (!vals.length || vals.length % 9) throw new Error('Not a readable STL file');
    return new Float32Array(vals);
  }

  // occt-import-js result -> { tris: Float32Array n*9, solids, skipped }
  // Bodies that enclose no volume (construction surfaces, stray sheets) are left out:
  // the cutter would otherwise ride over them.
  function trisFromOcct(result) {
    if (!result || !result.success) throw new Error('STEP import failed');
    var keep = [], skipped = 0, total = 0;
    result.meshes.forEach(function (m) {
      var p = m.attributes.position.array, idx = m.index.array, vol = 0;
      var lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
      for (var i = 0; i < idx.length; i += 3) {
        var a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
        vol += (p[a] * (p[b + 1] * p[c + 2] - p[b + 2] * p[c + 1]) - p[a + 1] * (p[b] * p[c + 2] - p[b + 2] * p[c]) + p[a + 2] * (p[b] * p[c + 1] - p[b + 1] * p[c])) / 6;
      }
      for (var v = 0; v < p.length; v += 3) for (var k = 0; k < 3; k++) { if (p[v + k] < lo[k]) lo[k] = p[v + k]; if (p[v + k] > hi[k]) hi[k] = p[v + k]; }
      var box = Math.max(1e-9, (hi[0] - lo[0]) * (hi[1] - lo[1]) * (hi[2] - lo[2]), (hi[0] - lo[0]) * (hi[1] - lo[1]), (hi[1] - lo[1]) * (hi[2] - lo[2]), (hi[0] - lo[0]) * (hi[2] - lo[2]));
      if (idx.length && Math.abs(vol) > 1e-4 * box) { keep.push(m); total += idx.length / 3; } else skipped++;
    });
    if (!total) throw new Error('This STEP file has no solid body. Export the part as a solid (AP214 or AP242).');
    var out = new Float32Array(total * 9), o = 0;
    keep.forEach(function (m) {
      var p = m.attributes.position.array, idx = m.index.array;
      for (var i = 0; i < idx.length; i++) {
        var v = idx[i] * 3;
        out[o++] = p[v]; out[o++] = p[v + 1]; out[o++] = p[v + 2];
      }
    });
    return { tris: out, solids: keep.length, skipped: skipped };
  }

  // ---------------------------------------------------------------- tenons
  // A tenon is a solid cylinder on the rotary axis. It runs from `depth` inside the part's
  // end out past the end as far as any cutter reaches, so nothing cuts it (Parting's neck
  // aside, which is cut through it beside the part on purpose). It is added to the part
  // the drop-cutter sees, so every operation treats it like part of the model.
  function tenonReach(job) {
    var r = 0, ext = 5;
    if (cornersActive(job)) r = Math.max(r, job.corners.tool_dia / 2);
    if (job.rough && job.rough.enabled) r = Math.max(r, job.rough.tool_dia / 2);
    ['finish', 'index'].forEach(function (op) {
      if (!job[op] || !job[op].enabled) return;
      var c = cutterOf(job, op);
      r = Math.max(r, c.maxR);
      if (c.shape === 'taper') ext = Math.max(ext, taperReach(c) + 1);   // roughing clears this far past the end for the cone
    });
    return Math.max(ext, 2 * r + 1);
  }

  // ---------------------------------------------------------------- cutter shapes
  // Finishing and Indexed take a ball or a tapered ball: a ball tip (tool_dia) on a cone
  // that widens at taper_deg per side up to the shank. maxR is how far the tool reaches
  // sideways anywhere up its length: what keep-outs and clearances use.
  function cutterOf(job, op) {
    var t = job[op] || {}, tip = Number(t.tool_dia) / 2;
    var ballish = op === 'finish' || op === 'index';
    if (ballish && t.shape === 'taper' && Number(t.taper_deg) > 0 && Number(t.shank_dia) / 2 > tip + 1e-6) {
      return { shape: 'taper', tipR: tip, maxR: Number(t.shank_dia) / 2, taper: Number(t.taper_deg) * Math.PI / 180 };
    }
    return { shape: ballish ? 'ball' : 'flat', tipR: tip, maxR: tip, taper: 0 };
  }
  // how far past the end of the part a tapered tool can reach: the tip runs half its radius
  // past the end, the cone can stick out to the shank's radius beyond that
  function taperReach(c) { return 0.5 * c.tipR + c.maxR; }
  function taperOps(job) {
    return ['finish', 'index'].filter(function (op) { return job[op] && job[op].enabled && cutterOf(job, op).shape === 'taper'; });
  }
  // Height of the tool's surface above its tip at a given distance from its axis (Infinity past the shank)
  function profileZ(c, rad) {
    if (rad > c.maxR + 1e-9) return Infinity;
    if (c.shape !== 'taper') return rad > c.tipR + 1e-9 ? Infinity : c.tipR - Math.sqrt(Math.max(0, c.tipR * c.tipR - rad * rad));
    var rc = c.tipR * Math.cos(c.taper), zc = c.tipR - Math.sqrt(Math.max(0, c.tipR * c.tipR - rc * rc));
    return rad <= rc ? c.tipR - Math.sqrt(Math.max(0, c.tipR * c.tipR - rad * rad)) : zc + (rad - rc) / Math.tan(c.taper);
  }
  // ---------------------------------------------------------------- holder and rotary
  // Collisions with what holds the tool and what holds the part. The tool, from its tip up:
  // the cutter at its widest, up to where it goes into the collet nut (`stickout`), then
  // the nut, then the spindle. [{ name, r, h0, h1 }], heights above the tip.
  function num(v) { v = Number(v); return isFinite(v) && v > 0 ? v : 0; }
  function rigOf(job) { return job.rig || DEFAULTS.rig; }
  function clearOf(job) { var c = Number(rigOf(job).clear); return isFinite(c) && c >= 0 ? c : 2; }
  function stackOf(job, op) {
    var g = rigOf(job), so = num((job[op] || {}).stickout), nl = num(g.nut && g.nut.len);
    return [
      { name: 'tool', r: cutterOf(job, op).maxR, h0: 0, h1: so },
      { name: 'collet nut', r: num(g.nut && g.nut.dia) / 2, h0: so, h1: so + nl },
      { name: 'spindle', r: num(g.spindle && g.spindle.dia) / 2, h0: so + nl, h1: Infinity }
    ].filter(function (c) { return c.r > 0; });
  }
  // The chuck, headstock, live centre and tailstock body, in work coordinates. Round ones
  // (kind cyl / cone) are on the rotary axis; boxes stand on the table, `top` above the axis.
  function fixtures(job) {
    var g = rigOf(job), cf = Number(job.chuck_face_x) || 0, T = Number(job.tailstock_x) || 0;
    var cl = num(g.chuck && g.chuck.len), hl = num(g.head && g.head.len), ccl = num(g.centre && g.centre.len), tl = num(g.tail && g.tail.len);
    // the live centre: its cone, then a cylinder (bearing housing, quill) back to the body
    var ctot = Math.max(ccl, num(g.centre && g.centre.total)), cr = num(g.centre && g.centre.dia) / 2;
    return [
      { name: 'chuck', kind: 'cyl', x0: cf - cl, x1: cf, r: num(g.chuck && g.chuck.dia) / 2 },
      { name: 'headstock', kind: 'box', x0: cf - cl - hl, x1: cf - cl, y0: -sideOf(g.head, 'front'), y1: sideOf(g.head, 'back'), top: Number(g.head && g.head.top) || 0 },
      { name: 'live centre', kind: 'cone', x0: T, x1: T + ccl, r: cr },
      { name: 'live centre', kind: 'cyl', part: 'body', x0: T + ccl, x1: T + ctot, r: cr },
      { name: 'tailstock', kind: 'box', x0: T + ctot, x1: T + ctot + tl, y0: -sideOf(g.tail, 'front'), y1: sideOf(g.tail, 'back'), top: Number(g.tail && g.tail.top) || 0 }
    ].filter(function (f) { return f.x1 > f.x0 && (f.kind === 'box' ? f.y1 > f.y0 : f.r > 0); });
  }
  // how far a box reaches to one side of the axis (settings from before 0.7.1 had one width)
  function sideOf(b, side) {
    if (!b) return 0;
    if (b[side] !== undefined && b[side] !== null && b[side] !== '') return Math.max(0, Number(b[side]) || 0);
    return num(b.width) / 2;
  }
  // Highest point of a fixture over the disc at (x, y) of radius rc (-Infinity: not under it)
  function fixtureTop(f, x, y, rc) {
    if (f.kind === 'box') {
      var ddx = Math.max(f.x0 - x, 0, x - f.x1), ddy = Math.max(f.y0 - y, 0, y - f.y1);
      return ddx * ddx + ddy * ddy < rc * rc ? f.top : -Infinity;
    }
    var a = Math.max(f.x0, x - rc), b = Math.min(f.x1, x + rc);
    if (a > b) return -Infinity;
    var cone = f.kind === 'cone', n = cone ? Math.max(1, Math.ceil((b - a) / 0.5)) : 0, best = -Infinity;
    for (var k = 0; k <= n; k++) {
      var xp = cone ? a + (b - a) * k / n : Math.min(Math.max(x, f.x0), f.x1);
      var R = cone ? f.r * (xp - f.x0) / (f.x1 - f.x0) : f.r;
      var w = Math.sqrt(Math.max(0, rc * rc - (xp - x) * (xp - x)));
      var yc = Math.min(Math.max(0, y - w), y + w);     // the nearest the slice gets to the axis
      if (Math.abs(yc) < R) best = Math.max(best, Math.sqrt(R * R - yc * yc));
    }
    return best;
  }
  // Lowest tool-tip height at (x, y) that keeps the whole tool, nut and spindle off the
  // chuck, headstock, live centre and tailstock (by `clear`). { z, comp, fix }
  function fixtureFloor(job, stack, fx, x, y) {
    var clr = clearOf(job), out = { z: -Infinity, comp: null, fix: null };
    for (var c = 0; c < stack.length; c++) for (var q = 0; q < fx.length; q++) {
      var top = fixtureTop(fx[q], x, y, stack[c].r + clr);
      if (top > -Infinity && top + clr - stack[c].h0 > out.z) { out.z = top + clr - stack[c].h0; out.comp = stack[c].name; out.fix = fx[q].name; }
    }
    return out;
  }
  // The material as a solid of revolution: the largest radius at each X of the part and
  // tenons, and of the stock left uncut past what roughing (or facing) cut. { x0, dx, n, r }
  function envelope(job, mb, walls) {
    var dx = 0.25, x0 = Math.min(Number(job.chuck_face_x) || 0, mb.min[0]) - 1, x1 = Math.max(Number(job.tailstock_x) || 0, mb.max[0]) + 1;
    var n = Math.ceil((x1 - x0) / dx) + 1, r = new Float64Array(n), t = mb.solid || mb.tris;
    for (var k = 0; k < t.length; k += 9) {
      var xa = Math.min(t[k], t[k + 3], t[k + 6]), xb = Math.max(t[k], t[k + 3], t[k + 6]);
      var rr = Math.max(Math.hypot(t[k + 1], t[k + 2]), Math.hypot(t[k + 4], t[k + 5]), Math.hypot(t[k + 7], t[k + 8]));
      for (var i = Math.max(0, Math.floor((xa - x0) / dx)); i <= Math.min(n - 1, Math.ceil((xb - x0) / dx)); i++) if (rr > r[i]) r[i] = rr;
    }
    var R = stockMaxRadius(job);
    (walls || []).forEach(function (w) {
      for (var i = Math.max(0, Math.floor((w[0] - x0) / dx)); i <= Math.min(n - 1, Math.ceil((w[1] - x0) / dx)); i++) r[i] = Math.max(r[i], R);
    });
    return { x0: x0, dx: dx, n: n, r: r };
  }
  // Highest point of the envelope over the disc at (x, y) of radius rc
  function envelopeTop(env, x, y, rc) {
    var best = -Infinity, i0 = Math.max(0, Math.ceil((x - rc - env.x0) / env.dx)), i1 = Math.min(env.n - 1, Math.floor((x + rc - env.x0) / env.dx));
    for (var i = i0; i <= i1; i++) {
      var R = env.r[i];
      if (!(R > 0)) continue;
      var xp = env.x0 + i * env.dx, w = Math.sqrt(Math.max(0, rc * rc - (xp - x) * (xp - x)));
      var yc = Math.min(Math.max(0, y - w), y + w);
      if (Math.abs(yc) < R) { var h = Math.sqrt(R * R - yc * yc); if (h > best) best = h; }
    }
    return best;
  }
  // Lowest tip height at (x, y) that keeps the nut and spindle off the material envelope.
  // (The cutter itself is the drop-cutter's job.)
  function materialFloor(job, stack, env, x, y) {
    var clr = clearOf(job), out = { z: -Infinity, comp: null };
    for (var c = 1; c < stack.length; c++) {
      var top = envelopeTop(env, x, y, stack[c].r + clr);
      if (top > -Infinity && top + clr - stack[c].h0 > out.z) { out.z = top + clr - stack[c].h0; out.comp = stack[c].name; }
    }
    return out;
  }
  // For an operation that runs along the axis at Y0: the lowest tip height at each X that
  // keeps its holder clear of the rotary and of the material. { x0, dx, n, z, fix, mat, why }
  function holderFloors(job, op, env, fx) {
    var st = stackOf(job, op), n = env.n, z = new Float64Array(n), fz = new Float64Array(n), mz = new Float64Array(n), why = new Array(n);
    for (var i = 0; i < n; i++) {
      var x = env.x0 + i * env.dx, f = fixtureFloor(job, st, fx, x, 0), m = materialFloor(job, st, env, x, 0);
      fz[i] = f.z; mz[i] = m.z; z[i] = Math.max(f.z, m.z);
      why[i] = f.z >= m.z ? (f.comp ? f.comp + ':' + f.fix : null) : m.comp + ':part';
    }
    return { x0: env.x0, dx: env.dx, n: n, z: z, fix: fz, mat: mz, why: why, stickout: num((job[op] || {}).stickout) };
  }
  // the floor at x (the higher of the two samples either side)
  function holdAt(h, x) {
    if (!h) return -Infinity;
    var f = (x - h.x0) / h.dx, i = Math.floor(f);
    if (i < 0) return h.z[0];
    if (i >= h.n - 1) return h.z[h.n - 1];
    return Math.max(h.z[i], h.z[i + 1]);
  }

  // Where an operation had to stay up off what it would cut, for the holder: the most it
  // stayed off, over what X, and why (the floor's cause where it bit hardest)
  function noteLimit(p, op, x, lift, zHold) {
    if (!(lift > 0.01) || !p.hold || !p.hold[op]) return;
    var L = p.limits[op] || (p.limits[op] = { lift: 0, x0: x, x1: x, why: null, zHold: -Infinity, whys: {} });
    L.x0 = Math.min(L.x0, x); L.x1 = Math.max(L.x1, x);
    var h = p.hold[op], i = Math.max(0, Math.min(h.n - 1, Math.round((x - h.x0) / h.dx)));
    if (h.why[i]) L.whys[h.why[i]] = true;
    if (lift > L.lift) { L.lift = lift; L.zHold = zHold; L.x = x; L.why = h.why[i]; L.byFix = h.fix[i] >= h.mat[i]; }
  }
  var OPN = { corners: 'Corners', rough: 'Roughing', finish: 'Finishing', index: 'Indexed', parting: 'Parting' };
  function holderWarnings(job, p, warn) {
    var fmt = function (v) { return job.units === 'in' ? (v / 25.4).toFixed(3) + ' in' : v.toFixed(1) + ' mm'; };
    var fx = function (v) { return job.units === 'in' ? (v / 25.4).toFixed(2) + ' in' : v.toFixed(0) + ' mm'; };
    Object.keys(p.limits || {}).forEach(function (op) {
      var L = p.limits[op];
      if (!L || !(L.lift > 0.05)) return;
      // every cause along the stretch: the nut and/or the spindle, against what
      var ws = Object.keys(L.whys || {}).length ? Object.keys(L.whys) : [L.why || 'collet nut:part'];
      var comps = [], hits = [], parts = String(L.why || 'collet nut:part').split(':');
      ws.forEach(function (w) {
        var q = w.split(':'), tgt = q[1] === 'part' ? 'the part or the uncut stock' : 'the ' + q[1];
        if (comps.indexOf(q[0]) < 0) comps.push(q[0]);
        if (hits.indexOf(tgt) < 0) hits.push(tgt);
      });
      var comp = comps.join(' or '), what = hits.join(' or ');
      var so = num(job[op] && job[op].stickout), need = so + L.lift;
      var where = Math.abs(L.x1 - L.x0) < 0.5 ? 'near X' + fx(L.x0) : 'between X' + fx(L.x0) + ' and X' + fx(L.x1);
      var fix = 'Give the tool at least ' + fmt(need) + ' stickout (it has ' + fmt(so) + ')';
      if (ws.some(function (w) { return /:(chuck|headstock)$/.test(w); })) fix += ', or move the part further from the jaws';
      if (ws.some(function (w) { return /:(live centre|tailstock)$/.test(w); })) fix += ', or give it more room before the tailstock';
      warn(OPN[op] + ' stays up to ' + fmt(L.lift) + ' off what it would cut ' + where + ': any lower and the ' + comp + ' would hit ' + what + '. ' + fix + '.');
    });
  }

  // [{ side, r, x0, x1 (whole protected length), in0, in1 (the part inside the part) }]
  // How long a tenon is set to run out of the part at that end (0: just the room the tools need)
  function tenonLen(job, side) {
    var T = job.tenons;
    if (!T || !T.enabled) return 0;
    if ((T.ends === 'chuck' && side !== 'chuck') || (T.ends === 'tailstock' && side !== 'tailstock')) return 0;
    var t = (T.same && T.ends !== 'tailstock' ? T.chuck : T[side]) || {}, v = Number(t.len);
    return t.len !== null && t.len !== '' && isFinite(v) && v > 0 ? v : 0;
  }
  function tenonList(job, mb) {
    var T = job.tenons, out = [];
    if (!T || !T.enabled || !mb) return out;
    var reach = tenonReach(job), ends = T.ends === 'chuck' ? ['chuck'] : T.ends === 'tailstock' ? ['tailstock'] : ['chuck', 'tailstock'];
    ends.forEach(function (side) {
      var t = (T.same && T.ends !== 'tailstock' ? T.chuck : T[side]) || {}, ext = Math.max(reach, tenonLen(job, side));
      var r = Number(t.dia) / 2, d = Math.max(0, Number(t.depth) || 0);
      if (!(r > 0)) return;
      if (side === 'chuck') out.push({ side: side, r: r, depth: d, x0: Math.max(job.chuck_face_x, mb.min[0] - ext), x1: mb.min[0] + d, in0: mb.min[0], in1: mb.min[0] + d });
      else out.push({ side: side, r: r, depth: d, x0: mb.max[0] - d, x1: Math.min(job.tailstock_x, mb.max[0] + ext), in0: mb.max[0] - d, in1: mb.max[0] });
    });
    return out;
  }
  // closed cylinder along X, outward-facing triangles
  function cylinderTris(x0, x1, r, seg) {
    var out = new Float32Array(seg * 4 * 9), o = 0;
    function put(x, y, z) { out[o++] = x; out[o++] = y; out[o++] = z; }
    for (var k = 0; k < seg; k++) {
      var a0 = 2 * Math.PI * k / seg, a1 = 2 * Math.PI * (k + 1) / seg;
      var y0 = r * Math.cos(a0), z0 = r * Math.sin(a0), y1 = r * Math.cos(a1), z1 = r * Math.sin(a1);
      put(x0, y0, z0); put(x0, y1, z1); put(x1, y0, z0);
      put(x1, y0, z0); put(x0, y1, z1); put(x1, y1, z1);
      put(x0, 0, 0); put(x0, y1, z1); put(x0, y0, z0);
      put(x1, 0, 0); put(x1, y0, z0); put(x1, y1, z1);
    }
    return out;
  }
  // What the cutters work against: the part plus its tenons. Bounds stay the part's; an
  // end with a tenon goes all the way round the axis, so the tools may run past it.
  function workMesh(job, mb) {
    var ts = tenonList(job, mb), ends = { lo: !mb.ends || mb.ends.lo, hi: !mb.ends || mb.ends.hi };
    var tris = mb.tris;
    if (ts.length) {
      var parts = ts.map(function (t) { return cylinderTris(t.x0, t.x1, t.r, 128); });
      var n = mb.tris.length + parts.reduce(function (a, p) { return a + p.length; }, 0);
      tris = new Float32Array(n);
      tris.set(mb.tris, 0);
      var o = mb.tris.length;
      parts.forEach(function (p) { tris.set(p, o); o += p.length; });
      ts.forEach(function (t) { if (t.side === 'chuck') ends.lo = true; else ends.hi = true; });
    }
    // A tapered tool's cone reaches well out from its tip: the stock past what roughing cut
    // is a wall it must not run into. (A plain ball never gets near it.)
    var walls = [], solid = tris;              // part + tenons, without the walls
    if (taperOps(job).length && job.rough && job.rough.enabled && !job._test_no_walls) {
      var rr = roughRange(job, { min: mb.min, max: mb.max, ends: ends }), rR = job.rough.tool_dia / 2, R = stockMaxRadius(job);
      // roughing's passes sit on its X grid from the low end: the last one can stop short of rr[1]
      rr[1] = rr[0] + Math.floor((rr[1] - rr[0]) / job.rough.x_grid + 1e-9) * job.rough.x_grid;
      if (rr[0] - rR > job.chuck_face_x + 0.01) walls.push([job.chuck_face_x, rr[0] - rR]);
      if (rr[1] + rR < job.tailstock_x - 0.01) walls.push([rr[1] + rR, job.tailstock_x]);
      if (walls.length) {
        var wt = walls.map(function (w) { return cylinderTris(w[0], w[1], R, 128); }), add = wt.reduce(function (a, p) { return a + p.length; }, 0);
        var t2 = new Float32Array(tris.length + add);
        t2.set(tris, 0);
        var o2 = tris.length;
        wt.forEach(function (p) { t2.set(p, o2); o2 += p.length; });
        tris = t2;
      }
    }
    return { tris: tris, solid: solid, wallTri: solid.length / 9, count: tris.length / 9, min: mb.min, max: mb.max, rmax: mb.rmax, ends: ends, tenons: ts, walls: walls };
  }

  // ---------------------------------------------------------------- planning

  // Tool-centre X range. The contact point, not the cutter, has to reach the ends of the
  // part, so the centre runs past each end: a flat end mill by nearly its radius (its
  // bottom still sits on the end edge), a ball by half its radius (it rolls just over the
  // edge, at most 0.13 x radius below it). Never into the chuck or tailstock keep-outs.
  function xLimits(job, mb, toolDia, over, keepR) {
    var r = toolDia / 2, e = (over === undefined ? 0.98 : over) * r, k = keepR || r;
    var ends = mb.ends || { lo: true, hi: true };
    var lo = job.chuck_face_x + job.chuck_clearance + k;
    var hi = job.tailstock_x - job.tailstock_clearance - k;
    // an end that doesn't surround the axis keeps the whole cutter over the part
    var wantLo = (job.x_start !== null && job.x_start !== '' && isFinite(job.x_start)) ? Number(job.x_start) : ends.lo ? mb.min[0] - e : mb.min[0] + r;
    var wantHi = (job.x_end !== null && job.x_end !== '' && isFinite(job.x_end)) ? Number(job.x_end) : ends.hi ? mb.max[0] + e : mb.max[0] - r;
    return [Math.max(lo, wantLo), Math.min(hi, wantHi)];
  }

  // Roughing's tool-centre range. With a tapered tool to follow, roughing clears further
  // past each end that goes round the axis, so the cone has room beside the part's end.
  function roughRange(job, mb) {
    var rr = xLimits(job, mb, job.rough.tool_dia), r = job.rough.tool_dia / 2, ends = mb.ends || { lo: true, hi: true };
    var keepLo = job.chuck_face_x + job.chuck_clearance + r, keepHi = job.tailstock_x - job.tailstock_clearance - r;
    var setLo = job.x_start !== null && job.x_start !== '' && isFinite(job.x_start), setHi = job.x_end !== null && job.x_end !== '' && isFinite(job.x_end);
    taperOps(job).forEach(function (op) {
      var reach = taperReach(cutterOf(job, op));
      if (ends.lo && !setLo) rr[0] = Math.max(keepLo, Math.min(rr[0], mb.min[0] - reach + r));
      if (ends.hi && !setHi) rr[1] = Math.min(keepHi, Math.max(rr[1], mb.max[0] + reach - r));
    });
    // a tenon set longer than that: roughing takes it down to size all the way out
    var Lc = tenonLen(job, 'chuck'), Lt = tenonLen(job, 'tailstock');
    if (Lc > 0 && ends.lo && !setLo) rr[0] = Math.max(keepLo, Math.min(rr[0], mb.min[0] - Lc + r));
    if (Lt > 0 && ends.hi && !setHi) rr[1] = Math.min(keepHi, Math.max(rr[1], mb.max[0] + Lt - r));
    return rr;
  }

  // The X range a tapered tool's axis can be in without its cone reaching the uncut stock
  // past what roughing cut ([-Inf, Inf] when there are no walls)
  function wallLimits(mb, c) {
    var lo = -Infinity, hi = Infinity;
    var mid = (mb.min[0] + mb.max[0]) / 2;   // the chuck end's wall ends left of the part's middle, the tailstock's starts right of it
    (mb.walls || []).forEach(function (w) {
      if (w[1] <= mid) lo = Math.max(lo, w[1] + c.maxR + 0.05);
      else if (w[0] >= mid) hi = Math.min(hi, w[0] - c.maxR - 0.05);
    });
    return [lo, hi];
  }

  // ---- corners (square / rectangular stock)
  function cornersActive(job) {
    return !!(job.corners && job.corners.enabled && stockHalf(job));
  }
  // Stock rectangle at A where the corner at part angle phi points up (machine Y, Z)
  function stockPolyAt(job, phi) {
    var h = stockHalf(job), c = Math.cos(phi), s = Math.sin(phi);
    return [[h[0], h[1]], [h[0], -h[1]], [-h[0], -h[1]], [-h[0], h[1]]].map(function (v) {
      return [v[0] * c - v[1] * s, v[0] * s + v[1] * c];
    });
  }
  function sliceY(poly, z) {
    var lo = Infinity, hi = -Infinity;
    for (var i = 0; i < poly.length; i++) {
      var a = poly[i], b = poly[(i + 1) % poly.length];
      if ((a[1] - z) * (b[1] - z) <= 0 && a[1] !== b[1]) {
        var y = a[0] + (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]);
        if (y < lo) lo = y;
        if (y > hi) hi = y;
      }
    }
    return [lo, hi];
  }
  // Each corner is faced flat at the depth where the facet just touches the largest round
  // that fits the stock, but never closer to the part than `leave`.
  function cornerPlan(job, mb) {
    if (!cornersActive(job)) return null;
    var c = job.corners, h = stockHalf(job), R = Math.hypot(h[0], h[1]);
    var lim = xLimits(job, mb, c.tool_dia);
    if (!(lim[1] > lim[0])) return null;
    var target = Math.min(h[0], h[1]), t = mb.solid || mb.tris, out = [], skipped = 0;
    [[1, 1], [1, -1], [-1, -1], [-1, 1]].forEach(function (sg) {
      var phi = Math.atan2(sg[0] * h[0], sg[1] * h[1]);            // from +Z toward +Y
      if (phi < 0) phi += 2 * Math.PI;
      var sp = Math.sin(phi), cp = Math.cos(phi), maxDot = -Infinity;
      for (var i = 0; i < t.length; i += 3) {
        var d = t[i + 1] * sp + t[i + 2] * cp;
        if (d > maxDot) maxDot = d;
      }
      var depth = Math.max(target, maxDot + c.leave);
      if (depth > R - 0.05) { skipped++; return; }
      var poly = stockPolyAt(job, phi), levels = [], z = R;
      while (z > depth + 1e-6) {
        z = Math.max(depth, z - c.stepdown);
        var sl = sliceY(poly, z);
        levels.push({ z: z, y0: sl[0], y1: sl[1] });
      }
      out.push({ phi: phi, depth: depth, levels: levels });
    });
    out.sort(function (a, b) { return a.phi - b.phi; });
    // largest radius left once the corners are off (what roughing starts from)
    var startR = 0;
    for (var k = 0; k < 720; k++) {
      var th = k * Math.PI / 360, r = stockRadiusAt(job, th * 180 / Math.PI * job.a_sign);
      out.forEach(function (cn) {
        var cd = Math.cos(th - cn.phi);
        if (cd > 1e-9) r = Math.min(r, cn.depth / cd);
      });
      if (r > startR) startR = r;
    }
    return { corners: out, lo: lim[0], hi: lim[1], startR: startR, skipped: skipped };
  }

  // ---- parting: a neck beside each chosen end of the part, its part-side wall `gap` away
  function partingPlan(job, mb) {
    var c = job.parting;
    if (!c || !c.enabled) return null;
    var r = c.tool_dia / 2, W = Math.max(c.tool_dia, Number(c.width) || 0), out = [], skipped = [];
    var lo = job.chuck_face_x + job.chuck_clearance + r, hi = job.tailstock_x - job.tailstock_clearance - r;
    var n = Math.max(1, Math.ceil((W - c.tool_dia) / (0.8 * c.tool_dia) - 1e-9) + 1);
    var sides = c.ends === 'chuck' ? ['chuck'] : c.ends === 'tailstock' ? ['tailstock'] : ['chuck', 'tailstock'];
    sides.forEach(function (side) {
      var cols = [];
      for (var k = 0; k < n; k++) {
        var off = c.gap + r + (n > 1 ? k * (W - c.tool_dia) / (n - 1) : 0);
        var x = side === 'chuck' ? mb.min[0] - off : mb.max[0] + off;
        if (x >= lo - 1e-6 && x <= hi + 1e-6) cols.push(x);
      }
      if (cols.length) out.push({ side: side, cols: cols, full: cols.length === n });
      else skipped.push(side);
    });
    return out.length || skipped.length ? { ends: out, skipped: skipped, neckR: c.neck_dia / 2 } : null;
  }

  function plan(job, mb) {
    var step = job.angle_step_deg;
    var nAng = Math.round(360 / step);
    var angles = new Float64Array(nAng);
    for (var j = 0; j < nAng; j++) angles[j] = j * step;
    var p = { nAng: nAng, angles: angles, step: step, halfW: 0, partLo: mb.min[0], partHi: mb.max[0], tenons: mb.tenons || [] };
    var widths = [];
    if (job.rough.enabled) {
      var rl = roughRange(job, mb);
      if (!(rl[1] > rl[0])) throw new Error('Roughing X range is empty - check part position, chuck and tailstock clearances');
      var nx = Math.floor((rl[1] - rl[0]) / job.rough.x_grid + 1e-9) + 1;
      p.roughX = new Float64Array(nx);
      for (var i = 0; i < nx; i++) p.roughX[i] = rl[0] + i * job.rough.x_grid;
      widths.push(job.rough.tool_dia / 2 + job.rough.leave);
    }
    if (job.finish.enabled) {
      var cf = cutterOf(job, 'finish'), fl = xLimits(job, mb, job.finish.tool_dia, 0.5, cf.maxR);
      if (cf.shape === 'taper') {
        var wl = wallLimits(mb, cf), want = fl.slice();
        fl = [Math.max(fl[0], wl[0]), Math.min(fl[1], wl[1])];
        p.finShort = { lo: fl[0] - want[0], hi: want[1] - fl[1] };
      }
      if (!(fl[1] > fl[0])) throw new Error('Finishing X range is empty - check part position, chuck and tailstock clearances');
      p.finLo = fl[0]; p.finHi = fl[1];
      p.finNrev = Math.floor((fl[1] - fl[0]) / job.finish.pitch + 1e-9);
      widths.push(cf.maxR);
    }
    p.wallTri = mb.walls && mb.walls.length ? mb.wallTri : undefined;
    p.indexLimits = indexActive(job) && cutterOf(job, 'index').shape === 'taper' ? wallLimits(mb, cutterOf(job, 'index')) : [-Infinity, Infinity];
    p.corners = cornerPlan(job, mb);
    p.parting = partingPlan(job, mb);
    // the holder: lowest tip heights along X that keep the nut and spindle off the rotary
    // and off the material (the part, its tenons, and the stock past what roughing cut)
    var fx = fixtures(job), cf = Number(job.chuck_face_x) || 0, T = Number(job.tailstock_x) || 0, walls = [];
    if (job.rough.enabled && p.roughX) {
      var rR0 = job.rough.tool_dia / 2;
      if (p.roughX[0] - rR0 > cf) walls.push([cf, p.roughX[0] - rR0]);
      if (p.roughX[p.roughX.length - 1] + rR0 < T) walls.push([p.roughX[p.roughX.length - 1] + rR0, T]);
    }
    var env = envelope(job, mb, walls);
    p.fixtures = fx; p.hold = {}; p.limits = {};
    if (job.rough.enabled) p.hold.rough = holderFloors(job, 'rough', env, fx);
    if (job.finish.enabled) p.hold.finish = holderFloors(job, 'finish', env, fx);
    if (p.parting) p.hold.parting = holderFloors(job, 'parting', env, fx);
    if (p.corners) {
      var cr0 = job.corners.tool_dia / 2, cw = [];
      if (p.corners.lo - cr0 > cf) cw.push([cf, p.corners.lo - cr0]);
      if (p.corners.hi + cr0 < T) cw.push([p.corners.hi + cr0, T]);
      p.envCorners = envelope(job, { min: mb.min, max: mb.max, solid: new Float32Array(0) }, cw);
    }
    if (indexActive(job)) p.hold.index = holderFloors(job, 'index', env, fx);   // its travel heights (the passes use the real leftovers)
    // travel heights: the job's safe height, or higher where the holder needs it
    var safe0 = job.stock_radius + job.safe_clearance;
    p.travel = {};
    var spanMax = function (h, a, b) { var m = -Infinity; if (!h) return m; for (var q = Math.max(0, Math.floor((a - h.x0) / h.dx)); q <= Math.min(h.n - 1, Math.ceil((b - h.x0) / h.dx)); q++) m = Math.max(m, h.z[q]); return m; };
    // (holdNeed: what the collet nut and spindle need alone, without the retract height)
    p.holdNeed = {};
    if (p.hold.rough) p.travel.rough = Math.max(safe0, p.holdNeed.rough = spanMax(p.hold.rough, p.roughX[0], p.roughX[p.roughX.length - 1]));
    if (p.hold.finish) p.travel.finish = Math.max(safe0, p.holdNeed.finish = spanMax(p.hold.finish, p.finLo, p.finHi));
    if (p.hold.parting && p.parting.ends.length) {
      var cols = [].concat.apply([], p.parting.ends.map(function (e) { return e.cols; }));
      p.travel.parting = Math.max(safe0, p.holdNeed.parting = spanMax(p.hold.parting, Math.min.apply(null, cols), Math.max.apply(null, cols)));
    }
    if (p.hold.index) p.travel.index = Math.max(safe0, p.holdNeed.index = spanMax(p.hold.index, mb.min[0], mb.max[0]));
    if (p.corners) {
      var stc = stackOf(job, 'corners'), tc0 = -Infinity;
      p.corners.corners.forEach(function (cn) {
        cn.levels.forEach(function (lv) {
          [lv.y0, lv.y1, (lv.y0 + lv.y1) / 2].forEach(function (yy) {
            for (var xx = p.corners.lo; xx <= p.corners.hi + 1e-9; xx += 1) tc0 = Math.max(tc0, fixtureFloor(job, stc, fx, xx, yy).z);
          });
        });
      });
      p.holdNeed.corners = tc0;
      p.travel.corners = Math.max(safe0, tc0);
    }
    if (!widths.length && !p.corners && !p.parting) throw new Error('All the operations are turned off');
    p.halfW = widths.length ? Math.max.apply(null, widths) : 1;
    return p;
  }

  // X positions the finish pass samples at angle a: start ring, helix turns, end ring
  function finishXs(p, pitch, a) {
    var xs = new Float64Array(p.finNrev + 2);
    xs[0] = p.finLo;
    for (var k = 0; k < p.finNrev; k++) xs[k + 1] = p.finLo + k * pitch + pitch * (a / 360);
    xs[p.finNrev + 1] = p.finHi;
    return xs;
  }

  // ---------------------------------------------------------------- indexed (3+1)
  function indexActive(job) { return !!(job.index && job.index.enabled); }
  // A angles to try: every 15 deg, or the ones the user listed
  function indexAngles(job) {
    var ix = job.index, out = [];
    if (ix.auto === false) {
      String(ix.angle_list || '').split(/[\s,;]+/).forEach(function (v) {
        if (v === '' || !isFinite(Number(v))) return;
        var a = ((Number(v) % 360) + 360) % 360;
        if (out.indexOf(a) < 0) out.push(a);
      });
      return out;
    }
    for (var a = 0; a < 360; a += 15) out.push(a);
    return out;
  }

  // Plans the indexed passes.
  //   left: { n, x, y, z (part frame), w (mm3), target (Uint8Array) } - what's still there
  //         after finishing; target points are what this op is for, the rest is only
  //         material to cut through safely
  //   drop(groups) -> Promise of z arrays: ball drop-cutter (part + tenons) at machine
  //         (x, y) with A locked; groups [{ a, xy: Float64Array x0,y0,x1,y1,... }]
  //   hullTop(x, y, a): top of everything still there along that vertical line
  // Resolves { angles: [{ a, zLocal, passes: [[[x, y, z], ...], ...], removed }], target, removed, missed }
  function planIndexed(job, left, drop, hullTop, onStep, xLim) {
    var ix = job.index, R = ix.tool_dia / 2, n = left.n, EPS = 0.02, R2 = R * R, Rw = cutterOf(job, 'index').maxR;
    var xMin = job.chuck_face_x + job.chuck_clearance + Rw, xMax = job.tailstock_x - job.tailstock_clearance - Rw;
    if (xLim) { xMin = Math.max(xMin, xLim[0]); xMax = Math.min(xMax, xLim[1]); }   // a tapered tool's cone off the uncut stock
    var sign = job.a_sign, alive = new Uint8Array(n).fill(1), cands = indexAngles(job);
    var total = 0;
    for (var i = 0; i < n; i++) if (left.target[i]) total += left.w[i];
    // progress: onStep(text, how much of the Indexed planning is done, 0..1). Each step
    // gets a share; the drops in it report as they come back, so it moves within an angle
    var sayText = '', span = { lo: 0, hi: 0 };
    var say = function (t, f) { if (t !== undefined) sayText = t; if (onStep) onStep(sayText, Math.max(0, Math.min(1, f))); };
    var phase = function (lo, hi, t) { span.lo = lo; span.hi = hi; say(t, lo); };
    var dropTick = function (f) { say(undefined, span.lo + (span.hi - span.lo) * 0.8 * f); };
    if (!n || total <= 0 || !cands.length) return Promise.resolve({ angles: [], target: total, removed: 0, missed: [] });

    function machine(a) {
      var t = a * sign * Math.PI / 180, c = Math.cos(t), s = Math.sin(t), my = new Float32Array(n), mz = new Float32Array(n);
      for (var k = 0; k < n; k++) { my[k] = left.y[k] * c - left.z[k] * s; mz[k] = left.y[k] * s + left.z[k] * c; }
      return { my: my, mz: mz };
    }
    // a grid in machine X, Y around the given points (dilated by R + pad)
    function gridAround(m, pick, ddx, ddy, pad, sx, sy) {
      var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (var k = 0; k < n; k++) if (pick(k)) {
        if (left.x[k] < x0) x0 = left.x[k]; if (left.x[k] > x1) x1 = left.x[k];
        if (m.my[k] < y0) y0 = m.my[k]; if (m.my[k] > y1) y1 = m.my[k];
      }
      if (!isFinite(x0)) return null;
      var e = R + pad;
      x0 -= e; x1 += e; y0 -= e; y1 += e;
      x0 -= sx || 0; y0 -= sy || 0;
      var gnx = Math.max(1, Math.ceil((x1 - x0) / ddx) + 1), gny = Math.max(1, Math.ceil((y1 - y0) / ddy) + 1);
      return { x0: x0, y0: y0, dx: ddx, dy: ddy, nx: gnx, ny: gny, H: new Float32Array(gnx * gny).fill(NaN), want: new Uint8Array(gnx * gny) };
    }
    // every grid node within R (horizontally) of point k: fn(node, d2)
    function near(g, px, py, fn) {
      var ia = Math.max(0, Math.ceil((px - R - g.x0) / g.dx)), ib = Math.min(g.nx - 1, Math.floor((px + R - g.x0) / g.dx));
      var ja = Math.max(0, Math.ceil((py - R - g.y0) / g.dy)), jb = Math.min(g.ny - 1, Math.floor((py + R - g.y0) / g.dy));
      for (var jj = ja; jj <= jb; jj++) {
        var ddy = g.y0 + jj * g.dy - py;
        for (var ii = ia; ii <= ib; ii++) {
          var ddx = g.x0 + ii * g.dx - px, d2 = ddx * ddx + ddy * ddy;
          if (d2 <= R2) fn(jj * g.nx + ii, d2);
        }
      }
    }
    // drop the tool at the wanted nodes; nodes with nothing under them get a floor below
    // the lowest material near them (nothing of the part is there to stop it)
    function dropGrid(a, g, m, pick) {
      var idx = [], xy = [];
      for (var q = 0; q < g.want.length; q++) if (g.want[q]) { idx.push(q); xy.push(g.x0 + (q % g.nx) * g.dx, g.y0 + Math.floor(q / g.nx) * g.dy); }
      if (!idx.length) return Promise.resolve(g);
      return drop([{ a: a, xy: Float64Array.from(xy) }], dropTick).then(function (res) {
        var z = res[0], floor = new Float32Array(g.H.length).fill(Infinity);
        for (var k = 0; k < n; k++) if (pick(k)) near(g, left.x[k], m.my[k], function (node) { if (m.mz[k] - R < floor[node]) floor[node] = m.mz[k] - R; });
        idx.forEach(function (q, t) { g.H[q] = isFinite(z[t]) ? z[t] : floor[q]; });
        return g;
      });
    }
    // can the tool, tip at height zt over node, reach point k (ball or shank)?
    function reaches(zt, mzk, d2) { return isFinite(zt) && mzk >= zt + R - Math.sqrt(Math.max(0, R2 - d2)) - EPS; }
    function inRange(g, node) { var x = g.x0 + (node % g.nx) * g.dx; return x >= xMin - 1e-6 && x <= xMax + 1e-6; }

    // ---- the holder: lowest tip height at each spot that keeps the collet nut and spindle
    // off everything still there (and the whole tool off the chuck and tailstock). Worked
    // out on a 1 mm map of what's there round the patch, each holder part's footprint
    // taken as the most of the map under it.
    var st = stackOf(job, 'index'), fxs = fixtures(job), clr = clearOf(job);
    var needK = new Float32Array(n), heldAny = new Uint8Array(n);   // how much more stickout would reach each point; whether any angle reaches it with the holder clear
    var noteNeed = function (k, v) { needK[k] = needK[k] > 0 ? Math.min(needK[k], v) : v; };
    // ext: work the floor out that much further round the patch, so the passes at this angle
    // (a little wider than where it can reach) can use the same map: hmCache[a]
    var hmCache = {};
    function holderFor(a, g) {
      var c = hmCache[a];
      if (c && g.x0 >= c.px0 - 1e-9 && g.y0 >= c.py0 - 1e-9 && g.x0 + g.dx * (g.nx - 1) <= c.px1 + 1e-9 && g.y0 + g.dy * (g.ny - 1) <= c.py1 + 1e-9) return c;
      return holderMap(a, g);
    }
    function holderMap(a, g, ext) {
      var hs = st.slice(1), Rm = 0;
      hs.forEach(function (c) { Rm = Math.max(Rm, c.r + clr); });
      ext = ext || 0;
      var d = 1, x0 = g.x0 - Rm - 1 - ext, y0 = g.y0 - Rm - 1 - ext, nx = Math.ceil((g.dx * (g.nx - 1) + 2 * Rm + 2 + 2 * ext) / d) + 1, ny = Math.ceil((g.dy * (g.ny - 1) + 2 * Rm + 2 + 2 * ext) / d) + 1;
      var T = new Float32Array(nx * ny), i, j;
      for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) { var tp = hullTop(x0 + i * d, y0 + j * d, a); T[j * nx + i] = tp > -Infinity ? tp + 0.2 : -Infinity; }
      // each row as a sparse table, so the most along any stretch of it is two lookups
      var LV = Math.ceil(Math.log2(nx)) + 1, sp = [T];
      for (var l = 1; l < LV; l++) {
        var prev = sp[l - 1], cur = new Float32Array(nx * ny), h = 1 << (l - 1);
        for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) { var o = j * nx + i; cur[o] = i + h < nx ? Math.max(prev[o], prev[o + h]) : prev[o]; }
        sp.push(cur);
      }
      var rowMax = function (j, ia, ib) {
        ia = Math.max(0, ia); ib = Math.min(nx - 1, ib);
        if (j < 0 || j >= ny || ia > ib) return -Infinity;
        var l = Math.floor(Math.log2(ib - ia + 1)), t = sp[l];
        return Math.max(t[j * nx + ia], t[j * nx + ib - (1 << l) + 1]);
      };
      var F = new Float32Array(nx * ny).fill(-Infinity);
      // the floor is only read over the patch (its nodes, the moves between them): work it out
      // there, not across the whole margin the spindle's footprint needs in the material map
      var fi0 = Math.max(0, Math.floor(Rm / d)), fi1 = Math.min(nx - 1, Math.ceil((Rm + 2 + 2 * ext + g.dx * (g.nx - 1)) / d) + 1);
      var fj0 = Math.max(0, Math.floor(Rm / d)), fj1 = Math.min(ny - 1, Math.ceil((Rm + 2 + 2 * ext + g.dy * (g.ny - 1)) / d) + 1);
      for (j = fj0; j <= fj1; j++) for (i = fi0; i <= fi1; i++) {
        var x = x0 + i * d, y = y0 + j * d, f = fixtureFloor(job, st, fxs, x, y).z;
        hs.forEach(function (c) {
          var rr = c.r + clr, kr = Math.ceil(rr / d), top = -Infinity;
          for (var dj = -kr; dj <= kr; dj++) {
            var w = Math.sqrt(Math.max(0, rr * rr - (dj * d) * (dj * d)));
            top = Math.max(top, rowMax(j + dj, i - Math.ceil(w / d), i + Math.ceil(w / d)));
          }
          if (top > -Infinity) f = Math.max(f, top + clr - c.h0);
        });
        F[j * nx + i] = f;
      }
      // the patch this map's floor covers (where floorAt can be read)
      return { x0: x0, y0: y0, d: d, nx: nx, ny: ny, F: F, px0: g.x0 - ext, py0: g.y0 - ext, px1: g.x0 + g.dx * (g.nx - 1) + ext, py1: g.y0 + g.dy * (g.ny - 1) + ext };
    }
    // the floor at (x, y): the most of the map cells round it
    function floorAt(hm, x, y) {
      if (!hm) return -Infinity;
      var fi = (x - hm.x0) / hm.d, fj = (y - hm.y0) / hm.d, i = Math.floor(fi), j = Math.floor(fj), m = -Infinity;
      for (var dj = 0; dj <= 1; dj++) for (var di = 0; di <= 1; di++) {
        var ii = Math.min(hm.nx - 1, Math.max(0, i + di)), jj = Math.min(hm.ny - 1, Math.max(0, j + dj));
        m = Math.max(m, hm.F[jj * hm.nx + ii]);
      }
      return m;
    }

    // ---- 1. which target material an angle can reach (a coarse drop over it: bounds the
    // fine passes to what that angle can get at)
    var cover = {}, ci = 0, auto = ix.auto !== false, TRY = auto ? 0.35 : 0;   // TRY: the share for trying every angle first
    // trial: picking the angles only needs to rank them, so it looks on a coarser grid (each
    // one picked is looked at again finely before it's planned)
    function reachAt(a, pick, trial) {
      var m = machine(a), cv = new Uint8Array(n), any = false;
      for (var k = 0; k < n && !any; k++) if (pick(k)) any = true;
      if (!any) { cover[a] = cv; return Promise.resolve(); }
      var cell = trial ? Math.max(0.15, Math.min(0.6, R / 2)) : Math.max(0.15, Math.min(0.6, R / 2, Number(ix.stepover) || 0.3)), g = gridAround(m, pick, cell, cell, 0.5);
      for (k = 0; k < n; k++) if (pick(k)) near(g, left.x[k], m.my[k], function (node) { g.want[node] = 1; });
      return dropGrid(a, g, m, pick).then(function () {
        // only where the holder lets the tool down too, so the angles picked are ones the
        // collet nut and spindle allow
        var hm = trial ? holderMap(a, g) : (hmCache[a] = holderMap(a, g, 2 + Math.max(0.05, Number(ix.stepover) || 0.3)));
        for (var k = 0; k < n; k++) if (pick(k)) near(g, left.x[k], m.my[k], function (node, d2) {
          if (cv[k] || !inRange(g, node) || !reaches(g.H[node], m.mz[k], d2)) return;
          var f = floorAt(hm, g.x0 + (node % g.nx) * g.dx, g.y0 + Math.floor(node / g.nx) * g.dy);
          if (!(g.H[node] < f - 1e-6)) { cv[k] = 1; heldAny[k] = 1; } else noteNeed(k, f - g.H[node]);
        });
        cover[a] = cv;
      });
    }
    // picking the angles: try every candidate against all of the target up front.
    // With the user's own angles there's nothing to pick, so each one is only checked
    // just before it's planned, against what the angles before it left.
    function evalNext() {
      if (!auto || ci >= cands.length) return Promise.resolve();
      var a = cands[ci++];
      phase(TRY * (ci - 1) / cands.length, TRY * ci / cands.length, 'Trying A' + a + '\u00b0 (' + ci + ' of ' + cands.length + ')');
      return reachAt(a, function (k) { return left.target[k] === 1; }, true).then(evalNext);
    }

    // ---- 2. fewest angles that reach the most (or the user's list)
    function choose() {
      var chosen = [];
      if (ix.auto === false) return cands.slice();
      var gone = new Uint8Array(n), maxA = Math.max(1, Math.round(Number(ix.max_angles) || 4));
      while (chosen.length < maxA) {
        var best = null, bestV = 0;
        cands.forEach(function (a) {
          if (chosen.indexOf(a) >= 0) return;
          var v = 0, cv = cover[a];
          for (var k = 0; k < n; k++) if (cv[k] && !gone[k]) v += left.w[k];
          if (v > bestV + 1e-9) { bestV = v; best = a; }
        });
        if (best === null || bestV < Math.max(0.5, 0.01 * total)) break;
        chosen.push(best);
        for (var k = 0; k < n; k++) if (cover[best][k]) gone[k] = 1;
      }
      return chosen.sort(function (p, q) { return p - q; });
    }

    // ---- 3. passes at one angle: layers stepdown apart, raster along X, stepping in Y
    // half: shift the passes half a stepover across, to catch what the first set missed
    function passesAt(a, half) {
      var m = machine(a), cv = cover[a];
      var pickT = function (k) { return alive[k] && left.target[k] && cv[k]; };
      var vol = 0, xa = Infinity, xb = -Infinity, ya = Infinity, yb = -Infinity;
      for (var k = 0; k < n; k++) if (pickT(k)) {
        vol += left.w[k];
        xa = Math.min(xa, left.x[k]); xb = Math.max(xb, left.x[k]); ya = Math.min(ya, m.my[k]); yb = Math.max(yb, m.my[k]);
      }
      if (vol < (half ? 0.2 : 1e-6)) return Promise.resolve(null);
      // passes run the long way of the patch: fewer, longer passes
      var alongX = xb - xa >= yb - ya, so = Math.max(0.05, Number(ix.stepover) || 0.3), fine = Math.min(0.25, so);
      var g = alongX ? gridAround(m, pickT, fine, so, 1.0, 0, half ? so / 2 : 0) : gridAround(m, pickT, so, fine, 1.0, half ? so / 2 : 0, 0);
      var lines = alongX ? g.ny : g.nx, len = alongX ? g.nx : g.ny;
      var nodeAt = alongX ? function (ln, t) { return ln * g.nx + t; } : function (ln, t) { return t * g.nx + ln; };
      for (k = 0; k < n; k++) if (alive[k]) near(g, left.x[k], m.my[k], function (node) { g.want[node] = 1; });
      // one more node either end along each pass, for the lead in and out
      var w2 = Uint8Array.from(g.want);
      for (var ln0 = 0; ln0 < lines; ln0++) for (var t0 = 0; t0 < len; t0++) if (g.want[nodeAt(ln0, t0)]) {
        if (t0 > 0) w2[nodeAt(ln0, t0 - 1)] = 1;
        if (t0 < len - 1) w2[nodeAt(ln0, t0 + 1)] = 1;
      }
      g.want = w2;
      return dropGrid(a, g, m, function (q) { return alive[q]; }).then(function () {
        var hm = holderFor(a, g), Fn = new Float32Array(g.H.length);
        for (var q0 = 0; q0 < Fn.length; q0++) Fn[q0] = floorAt(hm, g.x0 + (q0 % g.nx) * g.dx, g.y0 + Math.floor(q0 / g.nx) * g.dy);
        var held = function (node) { return !(g.H[node] < Fn[node] - 1e-6); };
        // nodes worth cutting: they reach target material at full depth, with the holder clear
        var mask = new Uint8Array(g.H.length), need = {};
        for (var k = 0; k < n; k++) if (pickT(k)) {
          var ok = false, best = Infinity;
          near(g, left.x[k], m.my[k], function (node, d2) {
            if (!inRange(g, node) || !reaches(g.H[node], m.mz[k], d2)) return;
            if (held(node)) { mask[node] = 1; ok = true; } else best = Math.min(best, Fn[node] - g.H[node]);
          });
          if (ok) heldAny[k] = 1;
          else if (isFinite(best)) need[k] = best;    // only a longer stickout would reach it
        }
        Object.keys(need).forEach(function (k) { noteNeed(k, need[k]); });
        var zTop = -Infinity, zMin = Infinity, zLocal = -Infinity, q;
        for (k = 0; k < n; k++) if (alive[k]) near(g, left.x[k], m.my[k], function (node) { if (mask[node] && m.mz[k] > zTop) zTop = m.mz[k]; });
        for (q = 0; q < mask.length; q++) if (mask[q]) zMin = Math.min(zMin, g.H[q]);
        // a height to move at inside this patch: above every height the tool is dropped to,
        // and above everything still there under it and as far round it as the tool reaches
        for (q = 0; q < g.H.length; q++) { if (isFinite(g.H[q])) zLocal = Math.max(zLocal, g.H[q]); if (isFinite(Fn[q])) zLocal = Math.max(zLocal, Fn[q] - 1.0); }
        var hs = Math.min(0.5, Rw), hx0 = g.x0 - Rw, hy0 = g.y0 - Rw, hx1 = g.x0 + (g.nx - 1) * g.dx + Rw, hy1 = g.y0 + (g.ny - 1) * g.dy + Rw;
        for (var yy = hy0; yy <= hy1 + 1e-9; yy += hs) for (var xx = hx0; xx <= hx1 + 1e-9; xx += hs) zLocal = Math.max(zLocal, hullTop(xx, yy, a));
        zLocal = Math.max(zLocal, zTop) + 1.0;
        var sd = Math.max(0.1, Number(ix.stepdown) || 1), levels = [];
        for (var L = zTop - sd; L > zMin + 1e-6; L -= sd) levels.push(L);
        levels.push(-Infinity);
        var passes = [], removed = 0;
        levels.forEach(function (L, li) {
          var cut = new Uint8Array(mask.length), zAt = function (node) { return Math.max(g.H[node], L); };
          var top = new Float32Array(mask.length).fill(-Infinity), last = null;   // material over each node before this layer
          for (var k = 0; k < n; k++) {
            if (!alive[k]) continue;
            var hit = false;
            near(g, left.x[k], m.my[k], function (node, d2) {
              if (m.mz[k] > top[node]) top[node] = m.mz[k];
              if (mask[node] && reaches(zAt(node), m.mz[k], d2)) { cut[node] = 1; hit = true; }
            });
            if (hit) { alive[k] = 0; if (left.target[k]) removed += left.w[k]; }
          }
          // runs of cut nodes along each line (gaps of one bridged), one node of lead in and out
          var runs = [];
          for (var jr = 0; jr < lines; jr++) {
            var row = [], i2, st = -1;
            for (i2 = 0; i2 < len; i2++) row.push(cut[nodeAt(jr, i2)] || (i2 > 0 && i2 < len - 1 && cut[nodeAt(jr, i2 - 1)] && cut[nodeAt(jr, i2 + 1)]));
            for (i2 = 0; i2 <= len; i2++) {
              if (i2 < len && row[i2]) { if (st < 0) st = i2; }
              else if (st >= 0) { runs.push({ line: jr, a: Math.max(0, st - 1), b: Math.min(len - 1, i2), id: runs.length }); st = -1; }
            }
          }
          // patches: runs on neighbouring lines that overlap belong together
          var parent = runs.map(function (r) { return r.id; });
          var find = function (q) { while (parent[q] !== q) q = parent[q] = parent[parent[q]]; return q; };
          var byLine = {};
          runs.forEach(function (r) { (byLine[r.line] = byLine[r.line] || []).push(r); });
          runs.forEach(function (r) {
            (byLine[r.line + 1] || []).forEach(function (o) { if (o.a <= r.b + 1 && r.a <= o.b + 1) parent[find(o.id)] = find(r.id); });
          });
          var groups = {};
          runs.forEach(function (r) { var k = find(r.id); (groups[k] = groups[k] || []).push(r); });
          var patches = Object.keys(groups).map(function (k) { return groups[k].sort(function (p, q) { return p.line - q.line || p.a - q.a; }); });
          // one patch at a time, nearest next, each zigzagged line by line
          var at = null;
          while (patches.length) {
            var bi = 0, bd = Infinity;
            patches.forEach(function (pt, i3) {
              var r0 = pt[0], q = nodeAt(r0.line, r0.a), px = g.x0 + (q % g.nx) * g.dx, py = g.y0 + Math.floor(q / g.nx) * g.dy;
              var dd = at ? Math.hypot(px - at[0], py - at[1]) : r0.line * 1e6 + r0.a;
              if (dd < bd) { bd = dd; bi = i3; }
            });
            var patch = patches.splice(bi, 1)[0], flip = false, lastLine = null;
            last = null;
            patch.forEach(function (rn) {
              if (lastLine !== null && rn.line !== lastLine) flip = !flip;
              lastLine = rn.line;
              var pts = [];
              for (var t2 = rn.a; t2 <= rn.b; t2++) {
                var node = nodeAt(rn.line, t2), z = zAt(node), src = 'node';
                if (!isFinite(z)) { z = zLocal - 1; src = 'unknown'; }
                if (Fn[node] > z) { z = Fn[node]; src = 'holder'; }     // lead in / out nodes
                var pt = [g.x0 + (node % g.nx) * g.dx, g.y0 + Math.floor(node / g.nx) * g.dy, z];
                pt.src = src;
                pts.push(pt);
              }
              if (flip) pts.reverse();
              if (!pts.length) return;
              var n0 = nodeAt(rn.line, flip ? rn.b : rn.a);
              // the next pass one stepover across starts near where this one ended: carry on
              // instead of lifting out (the link is checked like any other move)
              if (last && last.line === rn.line - 1 && Math.hypot(pts[0][0] - last[last.length - 1][0], pts[0][1] - last[last.length - 1][1]) <= 1.5 * so + fine) {
                last.links.push(last.length - 1);
                for (var q2 = 0; q2 < pts.length; q2++) last.push(pts[q2]);
                last.line = rn.line;
              } else {
                pts.L = L; pts.links = []; pts.line = rn.line;
                // rapid to just above the material where the pass starts, then plunge: above the
                // leftovers there, and above anything at all still there under the tool
                // (thin skins the leftovers don't count included)
                var p0 = pts[0], foot = -Infinity;
                [[0, 0], [Rw, 0], [-Rw, 0], [0, Rw], [0, -Rw]].forEach(function (o) { foot = Math.max(foot, hullTop(p0[0] + o[0], p0[1] + o[1], a)); });
                pts.approach = Math.min(zLocal, Math.max(top[n0] + 1.0, p0[2] + 1.0, foot + 0.5, Fn[n0]));
                passes.push(pts); last = pts;
              }
              at = last[last.length - 1];
            });
          }
        });
        return refinePasses(a, passes, zLocal, hm).then(function () { hops(a, passes, zLocal, hm); return { a: a, zLocal: zLocal, passes: passes, removed: removed }; });
      });
    }
    // From the end of one pass to the start of the next, lift only as high as whatever is
    // still there along the way (the tool's width either side), plus 1 mm
    function hops(a, passes, zLocal, hm) {
      for (var i = 1; i < passes.length; i++) {
        var e = passes[i - 1][passes[i - 1].length - 1], b = passes[i][0];
        var dx = b[0] - e[0], dy = b[1] - e[1], d = Math.hypot(dx, dy), nx = d > 1e-9 ? -dy / d : 0, ny = d > 1e-9 ? dx / d : 1;
        var top = Math.max(e[2], passes[i].approach !== undefined ? passes[i].approach : b[2]);
        var steps = Math.max(1, Math.ceil(d / 0.5));
        for (var k = 0; k <= steps && top < zLocal; k++) {
          var x = e[0] + dx * k / steps, y = e[1] + dy * k / steps;
          for (var o = -1; o <= 1; o++) top = Math.max(top, hullTop(x + nx * Rw * o, y + ny * Rw * o, a));
          top = Math.max(top, floorAt(hm, x, y) - 1.0);
        }
        passes[i].hop = Math.min(zLocal, top + 1.0);
      }
    }
    // A straight move between two correct points can clip an edge (running off the end of
    // a jaw). Check the middle of every move where the path bends, add the true point
    // where it's off by more than the tolerance, and repeat on the halves.
    function refinePasses(a, passes, zLocal, hm) {
      var tol = Math.max(0.002, Number(job.finish.tolerance) || 0.01), round = 0, cand = [];
      passes.forEach(function (pts, pi) {
        var link = {};
        (pts.links || []).forEach(function (k) { link[k] = 1; });
        for (var k = 0; k + 1 < pts.length; k++) {
          var d2a = k > 0 ? Math.abs(pts[k - 1][2] - 2 * pts[k][2] + pts[k + 1][2]) : 0;
          var d2b = k + 2 < pts.length ? Math.abs(pts[k][2] - 2 * pts[k + 1][2] + pts[k + 2][2]) : 0;
          if (link[k] || Math.max(d2a, d2b) > 2 * tol || Math.abs(pts[k + 1][2] - pts[k][2]) > 4 * tol) cand.push([pi, k]);
        }
      });
      function step() {
        if (!cand.length || round >= 8) return Promise.resolve();
        round++;
        // the middle and both quarter points of each move
        var xy = [];
        cand.forEach(function (c) {
          var p0 = passes[c[0]][c[1]], p1 = passes[c[0]][c[1] + 1];
          [0.5, 0.25, 0.75].forEach(function (f) { xy.push(p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f); });
        });
        return drop([{ a: a, xy: Float64Array.from(xy) }]).then(function (res) {
          var zz = res[0], add = {}, z = [];
          for (var q = 0; q < zz.length; q += 3) z.push(zz[q]);
          cand.forEach(function (c, t) {
            var pts = passes[c[0]], p0 = pts[c[1]], p1 = pts[c[1] + 1], lin = (p0[2] + p1[2]) / 2;
            // a quarter point off the line counts too: the surface can bend between the middle and an end
            var qOff = [[zz[3 * t + 1], 0.25], [zz[3 * t + 2], 0.75]].some(function (e) {
              return isFinite(e[0]) && Math.min(Math.max(e[0], pts.L), zLocal) - (p0[2] + (p1[2] - p0[2]) * e[1]) > tol * 0.75;
            });
            // nothing under the middle: the part's edge is between the middle and the higher
            // end, where the straight move would graze it. Go over at the higher end's height
            // instead (nothing is under the middle, so any height is free there)
            if (!isFinite(z[t])) {
              if (Math.abs(p1[2] - p0[2]) > tol) { var mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, Math.max(p0[2], p1[2])]; mid.over = true; mid.src = 'over'; (add[c[0]] = add[c[0]] || {})[c[1]] = mid; }
              return;
            }
            // off either way: below the line means the surface steps up somewhere in the other
            // half (a cliff), so split and look at both halves
            var zt = Math.max(z[t], pts.L, floorAt(hm, (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2));
            if (qOff || Math.abs(zt - lin) > tol * 0.75) { var mp = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, zt]; mp.src = 'mid' + round; (add[c[0]] = add[c[0]] || {})[c[1]] = mp; }
          });
          var next = [];
          Object.keys(add).forEach(function (pi) {
            var pts = passes[pi], ins = add[pi], out = [], L = pts.L;
            for (var k = 0; k < pts.length; k++) {
              out.push(pts[k]);
              if (ins[k]) { out.push(ins[k]); if (!ins[k].over) next.push([Number(pi), out.length - 2], [Number(pi), out.length - 1]); }
            }
            out.L = L; out.approach = pts.approach; out.hop = pts.hop;
            passes[pi] = out;
          });
          cand = next;
          return step();
        });
      }
      return step();
    }

    return evalNext().then(function () {
      var chosen = choose(), out = [];
      var next = function (t) {
        if (t >= chosen.length) { say(undefined, 1); return Promise.resolve(); }
        // this angle's share: where it can reach (a quarter), its passes, the half-step passes
        var base = TRY + (1 - TRY) * t / chosen.length, sp = (1 - TRY) / chosen.length, txt = 'Planning A' + chosen[t] + '\u00b0 (' + (t + 1) + ' of ' + chosen.length + ')';
        phase(base, base + 0.25 * sp, txt);
        var ready = reachAt(chosen[t], function (k) { return alive[k] && left.target[k] === 1; });
        return ready.then(function () { phase(base + 0.25 * sp, base + 0.65 * sp); return passesAt(chosen[t], false); }).then(function (r) {
          phase(base + 0.65 * sp, base + sp);
          return passesAt(chosen[t], true).then(function (r2) {
            if (r2 && r2.passes.length) {
              if (r) { r.passes = r.passes.concat(r2.passes); r.zLocal = Math.max(r.zLocal, r2.zLocal); r.removed += r2.removed; } else r = r2;
            }
            if (r && r.passes.length) out.push(r);
            return next(t + 1);
          });
        });
      };
      return next(0).then(function () {
        var removed = out.reduce(function (v, r) { return v + r.removed; }, 0);
        // what's left of the target, gathered along X for the report
        var miss = {}, missed = [];
        for (var k = 0; k < n; k++) if (alive[k] && left.target[k]) { var b = Math.floor(left.x[k] / 5); miss[b] = (miss[b] || 0) + left.w[k]; }
        Object.keys(miss).sort(function (p, q) { return p - q; }).forEach(function (b) {
          var last = missed[missed.length - 1], x = Number(b) * 5;
          if (last && x - last.x1 < 0.1) { last.x1 = x + 5; last.volume += miss[b]; } else missed.push({ x0: x, x1: x + 5, volume: miss[b] });
        });
        // what only a longer stickout would have reached: how much, and how much longer for most of it
        var hv = [], hvol = 0;
        for (k = 0; k < n; k++) if (alive[k] && left.target[k] && needK[k] > 0 && !heldAny[k]) { hv.push([needK[k], left.w[k]]); hvol += left.w[k]; }
        hv.sort(function (p, q) { return p[0] - q[0]; });
        var acc = 0, most = 0;
        for (var hi = 0; hi < hv.length; hi++) { acc += hv[hi][1]; most = hv[hi][0]; if (acc >= 0.9 * hvol) break; }
        return { angles: out, target: total, removed: removed, missed: missed.filter(function (mm) { return mm.volume >= 1; }), alive: alive, holder: { volume: hvol, need: most, needAll: hv.length ? hv[hv.length - 1][0] : 0 } };
      });
    });
  }

  // ---------------------------------------------------------------- tool changes
  // ncSender's Manual Tool Changer lifts to its safe Z, goes straight to the tool change
  // position, then to the tool setter, and back to where the M6 was. Straight lines can
  // cross the rotary, and a long tool at safe Z may not clear the chuck or tailstock. So
  // before each M6 the program goes up to safe Z and round the rotary itself, to the
  // change position, and comes back the same way after. Nothing is assumed about how tall
  // the rotary is: no line in XY crosses its footprint, grown by the spindle's radius.
  // Work coordinates throughout; machine positions go through the rotary's zero (G54).
  function tcInfo(job) {
    var tc = rigOf(job).tc || {};
    if (!tc.route || job.tool_change === 'm0') return null;
    var z = tc.zero, ok = function (q) { return q && isFinite(q.x) && isFinite(q.y); };
    if (!ok(z) || !ok(tc.change)) return null;
    var w = function (q) { return ok(q) ? { x: q.x - z.x, y: q.y - z.y } : null; };
    var L = tc.limits, lim = L && L.x && L.y ? { x0: L.x[0] - z.x, x1: L.x[1] - z.x, y0: L.y[0] - z.y, y1: L.y[1] - z.y } : null;
    return { change: w(tc.change), setter: w(tc.setter), zsafe: isFinite(tc.zsafe) && tc.zsafe !== null ? Number(tc.zsafe) : null, lim: lim };
  }
  function tcObstacles(job) {
    var g = rigOf(job), grow = num(g.spindle && g.spindle.dia) / 2 + clearOf(job) + 3;
    return fixtures(job).map(function (f) {
      var lo = f.kind === 'box' ? f.y0 : -f.r, hi = f.kind === 'box' ? f.y1 : f.r;
      return { name: f.name, x0: f.x0 - grow, x1: f.x1 + grow, y0: lo - grow, y1: hi + grow };
    });
  }
  // does the segment pass through the inside of the rectangle?
  function segHitsRect(ax, ay, bx, by, r) {
    var t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, P = [-dx, dx, -dy, dy], Q = [ax - r.x0, r.x1 - ax, ay - r.y0, r.y1 - ay];
    for (var i = 0; i < 4; i++) {
      if (Math.abs(P[i]) < 1e-12) { if (Q[i] <= 1e-9) return false; }
      else { var t = Q[i] / P[i]; if (P[i] < 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t); }
    }
    return t1 - t0 > 1e-6;
  }
  function inRect(pt, r) { return pt.x > r.x0 + 1e-9 && pt.x < r.x1 - 1e-9 && pt.y > r.y0 + 1e-9 && pt.y < r.y1 - 1e-9; }
  // Shortest way from a to b in XY that crosses none of the rectangles (and stays inside
  // the machine's travel when that's known): [a, ..., b], or { blocked: name } when a or b
  // is inside one, or null when there's no way round.
  function routeXY(a, b, rects, lim) {
    for (var i = 0; i < rects.length; i++) { if (inRect(a, rects[i])) return { blocked: rects[i].name, at: 'from' }; if (inRect(b, rects[i])) return { blocked: rects[i].name, at: 'to' }; }
    var inLim = function (q) { return !lim || (q.x >= lim.x0 - 1e-6 && q.x <= lim.x1 + 1e-6 && q.y >= lim.y0 - 1e-6 && q.y <= lim.y1 + 1e-6); };
    var nodes = [a, b];
    rects.forEach(function (r) {
      [[r.x0 - 0.5, r.y0 - 0.5], [r.x0 - 0.5, r.y1 + 0.5], [r.x1 + 0.5, r.y0 - 0.5], [r.x1 + 0.5, r.y1 + 0.5]].forEach(function (c) {
        var q = { x: c[0], y: c[1] };
        if (inLim(q) && !rects.some(function (o) { return inRect(q, o); })) nodes.push(q);
      });
    });
    var clear = function (p0, p1) { return !rects.some(function (r) { return segHitsRect(p0.x, p0.y, p1.x, p1.y, r); }); };
    var n = nodes.length, dist = [], prev = [], done = [];
    for (i = 0; i < n; i++) { dist.push(Infinity); prev.push(-1); done.push(false); }
    dist[0] = 0;
    for (;;) {
      var u = -1;
      for (i = 0; i < n; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
      if (u < 0 || !isFinite(dist[u]) || u === 1) break;
      done[u] = true;
      for (var v = 0; v < n; v++) {
        if (done[v]) continue;
        var d = dist[u] + Math.hypot(nodes[v].x - nodes[u].x, nodes[v].y - nodes[u].y);
        if (d < dist[v] - 1e-9 && clear(nodes[u], nodes[v])) { dist[v] = d; prev[v] = u; }
      }
    }
    if (!isFinite(dist[1])) return null;
    var path = [];
    for (v = 1; v !== -1; v = prev[v]) path.unshift(nodes[v]);
    return path;
  }
  // what the program will do about tool changes, and anything to say about it
  function tcPlan(job, p) {
    var info = tcInfo(job), out = { on: !!info, info: info, notes: [] };
    if (!info) return out;
    var rects = tcObstacles(job);
    out.rects = rects;
    var tc = rigOf(job).tc;
    // ncSender's own move between the change position and the tool setter
    if (info.setter) {
      var hit = rects.filter(function (r) { return segHitsRect(info.change.x, info.change.y, info.setter.x, info.setter.y, r); }).map(function (r) { return r.name; });
      if (hit.length) out.notes.push('ncSender\u2019s own move from the tool change position to the tool setter passes over the ' + hit.join(' and ') + '. Rotary CAM can\u2019t steer that move; check a long tool clears it at safe Z, or move one of them.');
      out.setterHits = hit;
    }
    rects.forEach(function (r) { if (inRect(info.change, r)) out.notes.push('The tool change position is over the ' + r.name + ', so tool changes can\u2019t go round it.'); });
    return out;
  }

  // ---------------------------------------------------------------- Z travel
  // ncSender checks a program against the machine's Z travel using the work offset as it is
  // when the program is loaded (the length of the tool in the spindle included): nothing may
  // go above machine Z0, the top, or below the bottom. A tool that sticks out further than the
  // one in now sits that much higher up the spindle, so its tip can't rise as far; a shorter
  // one can't reach as low. zRoom(job, op): { top, bottom } for that operation's tool tip,
  // above the rotary axis (work Z), with a little to spare; null until the machine has said.
  var ZMARGIN = 0.5;
  function setNum(v) { return v !== null && v !== undefined && v !== '' && isFinite(Number(v)); }
  function opsInOrder(job) {
    return ['corners', 'rough', 'finish', 'index', 'parting'].filter(function (op) {
      if (op === 'corners') return cornersActive(job);
      if (op === 'index') return indexActive(job);
      return !!(job[op] && job[op].enabled);
    });
  }
  // The tool in the spindle, whose length is in ncSender's work offset, and how far it sticks
  // out: typed in under Tool changes ('typed'); or the one ncSender says is in, its stickout
  // from this job or the Tool Library ('tool'); or else the program's first tool, taken to be
  // the one Z was zeroed with ('first'; `said` is the tool ncSender named, if any).
  // The tool in the spindle stays what it is until the machine says otherwise, so what was
  // worked out when Z was read (tc.zref) holds while stickouts are changed here: shortening a
  // tool in the settings is a plan for the next time it goes in, not the one that's in now.
  // Only typing its stickout in, or a new reading (Z zeroed again, another tool), changes it.
  function zRefInfo(job) {
    var tc = rigOf(job).tc || {}, typed = tc.typed || {};
    if (typed.zso && setNum(tc.zso) && Number(tc.zso) > 0) return { so: Number(tc.zso), how: 'typed', tool: tc.ztool || null };
    var z = tc.zref;
    if (z && Number(z.so) > 0) return { so: Number(z.so), how: z.how, tool: z.tool, op: z.op, said: z.said || null, held: true };
    return zRefLive(job);
  }
  // the same, from the settings as they are now (taken when Z is read)
  function zRefLive(job) {
    var tc = rigOf(job).tc || {};
    if (setNum(tc.zso) && Number(tc.zso) > 0) return { so: Number(tc.zso), how: 'tool', tool: tc.ztool || null };
    var ops = opsInOrder(job);
    return ops.length ? { so: num(job[ops[0]].stickout), how: 'first', op: ops[0], tool: job[ops[0]].tool_number, said: tc.ztool || null } : { so: NaN, how: 'none' };
  }
  function zRefStickout(job) { return zRefInfo(job).so; }
  // Z0 at or above the top of the travel can't be the rotary axis: it isn't zeroed there yet
  function zNotOnAxis(job) { var tc = rigOf(job).tc || {}; return setNum(tc.ztop) && Number(tc.ztop) <= 0; }
  function zRoom(job, op) {
    var tc = rigOf(job).tc || {};
    if (!setNum(tc.ztop) || Number(tc.ztop) <= 0) return null;     // not known, or not zeroed on the axis yet
    var ref = zRefStickout(job), so = num(job[op] && job[op].stickout), d = isFinite(ref) && so > 0 ? so - ref : 0;
    return { top: Number(tc.ztop) - Math.max(0, d) - ZMARGIN, bottom: setNum(tc.zbot) ? Number(tc.zbot) + Math.max(0, -d) + ZMARGIN : -Infinity, d: d, ref: ref, so: so, inSpindle: setNum(tc.zso) && Number(tc.zso) > 0 };
  }
  // How far a tool may stick out and still clear the stock as A turns with Z at the top of its
  // travel. The spindle nose is ztop + the spindle tool's stickout above the axis, so
  // soMax = nose - (stock + 1 mm) - the margin. ncSender checks the whole program with the
  // tool in the spindle when it's loaded, so a shorter tool later gets no more room than that
  // one: if it's too long itself (refOver), every operation is out.
  function zFit(job) {
    var tc = rigOf(job).tc || {};
    if (!setNum(tc.ztop) || Number(tc.ztop) <= 0) return null;
    var ref = zRefInfo(job);
    if (!(ref.so > 0)) return null;
    var ztop = Number(tc.ztop), R = job.stock_radius, need = R + 1, soMax = ztop + ref.so - ZMARGIN - need;
    var over = opsInOrder(job).filter(function (op) { return num(job[op].stickout) > soMax + 1e-6; }).map(function (op) {
      var so = num(job[op].stickout);
      return { op: op, tool: job[op].tool_number, so: so, by: so - soMax };
    });
    var h = stockHalf(job);
    return { ztop: ztop, ref: ref, R: R, need: need, soMax: soMax, nose: ztop + ref.so, over: over, refOver: ref.so > soMax + 1e-6, stockTop: h ? h[1] : R };
  }

  // One tool number is one tool, in one holder: the same kind and size, and the same stickout
  // and flute length wherever it's used (ncSender doesn't even change tools between operations
  // with the same number). toolClashes(job): [{ num, key, vals: [{ v, ops }] }], key one of
  // 'kind' (flat / ball / tapered ball), 'tool_dia', 'stickout', 'tool_length'.
  function toolKind(job, op) {
    var t = job[op] || {};
    return op === 'finish' || op === 'index' ? (t.shape === 'taper' ? 'tapered ball' : 'ball') : 'flat';
  }
  function toolClashes(job) {
    var by = {}, out = [];
    opsInOrder(job).forEach(function (op) {
      var n = Number(job[op].tool_number);
      if (n > 0) (by[n] = by[n] || []).push(op);
    });
    Object.keys(by).forEach(function (n) {
      var ops = by[n];
      if (ops.length < 2) return;
      var group = function (key, val, same) {
        var vals = [];
        ops.forEach(function (op) {
          var v = val(op);
          if (v === null || v === undefined || v === '' || (typeof v === 'number' && !(v > 0))) return;
          var hit = vals.filter(function (q) { return same(q.v, v); })[0];
          if (hit) hit.ops.push(op); else vals.push({ v: v, ops: [op] });
        });
        if (vals.length > 1) out.push({ num: Number(n), key: key, vals: vals });
        return vals.length > 1;
      };
      var near = function (a, b) { return Math.abs(a - b) < 0.005; };
      // a different kind or size is a different tool: its stickout can't be compared
      if (group('kind', function (op) { return toolKind(job, op); }, function (a, b) { return a === b; })) return;
      if (group('tool_dia', function (op) { return num(job[op].tool_dia); }, near)) return;
      group('stickout', function (op) { return num(job[op].stickout); }, near);
      group('tool_length', function (op) { return num(job[op].tool_length); }, near);
    });
    return out;
  }
  // the operations that share op's tool (same number, kind and size), not op itself; `on`:
  // only those that are on
  function sameTool(job, op, on) {
    var t = job[op], n = Number(t && t.tool_number);
    if (!(n > 0)) return [];
    return (on ? opsInOrder(job) : ['corners', 'rough', 'finish', 'index', 'parting']).filter(function (o) {
      return o !== op && job[o] && Number(job[o].tool_number) === n && toolKind(job, o) === toolKind(job, op) && Math.abs(num(job[o].tool_dia) - num(t.tool_dia)) < 0.005;
    });
  }

  // ---------------------------------------------------------------- post

  function Post(job) {
    this.job = job; this.m = job.machine;
    this.lines = []; this.x = null; this.y = 0; this.z = null; this.a = 0; this.mode = null; this.toolNo = null;
    this.cutMin = 0; this.limited = 0;
    this.safeZ = this.safe0 = job.stock_radius + job.safe_clearance;
    // grblHAL scales every axis word by 25.4 in G20 unless that axis is set as rotary ($376):
    // where A isn't, the program is in mm, which nothing scales
    this.inch = job.units === 'in' && !job.program_mm;
    this.midX = 0; this.tc = null;
    this.zr = null; this.zop = null; this.zcap = {};
  }
  // never above the top of Z travel (machine Z0) or below the bottom: note what had to give
  Post.prototype.capZ = function (z, kind) {
    if (!this.zr || z === null || z === undefined) return z;
    var c = this.zcap[this.zop] = this.zcap[this.zop] || { op: this.zop, top: this.zr.top, bottom: this.zr.bottom, rapids: 0, feeds: 0, want: -Infinity, low: 0, lowest: Infinity };
    if (z > this.zr.top + 1e-9) { if (kind === 'feed') c.feeds++; else c.rapids++; if (z > c.want) c.want = z; return this.zr.top; }
    if (z < this.zr.bottom - 1e-9) { c.low++; if (z < c.lowest) c.lowest = z; }
    return z;
  };
  function f3(v) { return v.toFixed(3); }
  // lengths in the program's units (inputs are mm)
  Post.prototype.L = function (v) { return this.inch ? (v / 25.4).toFixed(4) : v.toFixed(3); };
  Post.prototype.unit = function () { return this.inch ? 'in' : 'mm'; };
  function r3(v) { return Math.round(v * 1000) / 1000; }
  Post.prototype.emit = function (s) { this.lines.push(s); };
  // A comment ends at the first ')' and can't nest; keep it ASCII for older controllers
  var ASCII = { '\u2033': 'in', '\u201d': 'in', '\u2032': "'", '\u00b0': 'deg', '\u00d8': 'D', '\u2013': '-', '\u2014': '-', '\u00bd': '1/2', '\u00bc': '1/4', '\u00be': '3/4' };
  function ascii(s) { return String(s).replace(/[^\x20-\x7e]/g, function (c) { return ASCII[c] || ''; }); }
  Post.prototype.comment = function (s) { this.emit('(' + ascii(s).replace(/\(/g, '[').replace(/\)/g, ']') + ')'); };
  Post.prototype.setMode = function (m) { if (this.mode !== m) { this.emit(m); this.mode = m; } };
  Post.prototype.rapidY = function (y) {
    y = this.rl(y);
    if (y !== this.y) { this.emit('G0 Y' + this.L(y)); this.y = y; }
  };
  // straight feed move in units per minute (G94), for the corners op
  Post.prototype.feedLin = function (x, y, z, feed) {
    x = this.rl(x); y = this.rl(y); z = this.rl(this.capZ(z, 'feed'));
    var dx = x - this.x, dy = y - this.y, dz = z - this.z;
    var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len < 1e-6) return;
    var t = len / feed;
    var tLim = Math.max(Math.abs(dx) / this.m.x_max_mm_min, Math.abs(dy) / (this.m.y_max_mm_min || this.m.x_max_mm_min), Math.abs(dz) / this.m.z_max_mm_min);
    var f = feed;
    if (tLim > t) { t = tLim; f = len / t; this.limited++; }
    this.setMode('G94');
    var w = [];
    if (Math.abs(dx) > 0) w.push('X' + this.L(x));
    if (Math.abs(dy) > 0) w.push('Y' + this.L(y));
    if (Math.abs(dz) > 0) w.push('Z' + this.L(z));
    this.emit('G1 ' + w.join(' ') + ' F' + (this.inch ? (f / 25.4).toFixed(1) : f.toFixed(0)));
    this.cutMin += t;
    this.x = x; this.y = y; this.z = z;
  };
  // one straight rapid in X and Y together (the path the indexed hops were checked along)
  Post.prototype.rapidXY = function (x, y) {
    x = this.rl(x); y = this.rl(y);
    var w = [];
    if (x !== this.x) { w.push('X' + this.L(x)); this.x = x; }
    if (y !== this.y) { w.push('Y' + this.L(y)); this.y = y; }
    if (w.length) this.emit('G0 ' + w.join(' '));
  };
  Post.prototype.rapid = function (x, z, a) {
    var w = [];
    if (z !== undefined && z !== null) z = this.capZ(z, 'rapid');
    if (z !== undefined && z !== null && z !== this.z) { w.push('Z' + this.L(z)); this.z = z; }
    if (x !== undefined && x !== null && x !== this.x) { w.push('X' + this.L(x)); this.x = x; }
    if (a !== undefined && a !== null && a !== this.a) { w.push('A' + f3(a)); this.a = a; }
    if (w.length) this.emit('G0 ' + w.join(' '));
  };
  Post.prototype.retract = function () { this.rapid(null, this.safeZ, null); };
  // round to what the program will say, so the timing matches the moves exactly
  Post.prototype.rl = function (v) { return this.inch ? Math.round(v / 25.4 * 1e4) / 1e4 * 25.4 : r3(v); };
  Post.prototype.feedTo = function (x, z, a, feed) {
    x = this.rl(x); z = this.rl(this.capZ(z, 'feed')); a = r3(a);
    var dx = x - this.x, dz = z - this.z, da = a - this.a;
    var rAvg = Math.max(0, 0.5 * (this.z + z));
    var arc = rAvg * Math.abs(da) * Math.PI / 180;
    var len = Math.sqrt(dx * dx + dz * dz + arc * arc);
    if (len < 1e-6 && Math.abs(da) < 1e-6) return;
    var t = len / feed;
    var tLim = Math.max(Math.abs(da) / this.m.a_max_deg_min, Math.abs(dx) / this.m.x_max_mm_min, Math.abs(dz) / this.m.z_max_mm_min);
    if (tLim > t) { t = tLim; this.limited++; }
    t = Math.max(t, 1e-6);
    this.setMode('G93');
    var w = [];
    if (Math.abs(dx) > 0) w.push('X' + this.L(x));
    if (Math.abs(dz) > 0) w.push('Z' + this.L(z));
    if (Math.abs(da) > 0) w.push('A' + f3(a));
    this.emit('G1 ' + w.join(' ') + ' F' + (1 / t).toFixed(2));
    this.cutMin += t;
    this.x = x; this.z = z; this.a = a;
  };
  Post.prototype.header = function (name) {
    var j = this.job;
    this.comment('Rotary CAM ' + VERSION + ' (ncSender plugin) - simultaneous 4th axis for grblHAL');
    this.comment('Part: ' + name);
    this.comment('Work zero: X0 = chuck jaw face, Y0 Z0 = rotary centreline');
    this.comment('A rotates about X, chuck -X, tailstock +X, a_sign=' + j.a_sign);
    var st = j.stock || {}, u = this.unit();
    var desc = st.shape === 'square' ? 'square ' + this.L(st.width) : st.shape === 'rect' ? this.L(st.width) + ' x ' + this.L(st.height) : 'round D' + this.L(2 * j.stock_radius);
    this.comment('Stock ' + desc + ' ' + u + ', largest radius ' + this.L(j.stock_radius) + '  safe Z ' + this.L(this.safeZ));
    this.comment('Feeds are G93 inverse time: F = 1 / minutes for that line');
    var tc = this.tc && this.tc.on ? this.tc.info : null, zero = rigOf(j).tc && rigOf(j).tc.zero;
    if (tc) {
      this.comment('Tool changes go round the rotary: rotary zero (G54) was at machine X' + this.L(zero.x) + ' Y' + this.L(zero.y) + ', tool change at X' + this.L(tc.change.x + zero.x) + ' Y' + this.L(tc.change.y + zero.y) + ' when this was made');
      this.comment('Start the job with the spindle over the rotary: it goes up to safe Z, then over the part');
    }
    if (this.job.units === 'in' && this.job.program_mm) this.comment('In millimetres: the controller does not have A set as a rotary axis ($376), so in inches (G20) it would turn A 25.4 times too far');
    this.emit((this.inch ? 'G20' : 'G21') + ' G90 G17 G94');
    this.mode = 'G94';
    if (tc) return;   // the first tool change goes up and over the part itself
    var ops = opsInOrder(j);
    if (ops.length) { this.zop = ops[0]; this.zr = zRoom(j, ops[0]); }
    var z0 = this.capZ(this.safeZ, 'rapid');
    this.emit('G0 Z' + this.L(z0));
    this.z = z0;
    this.emit('G0 Y' + this.L(0));
  };
  Post.prototype.tool = function (op, first) {
    var t = this.job[op], same = !first && String(t.tool_number) === String(this.toolNo);
    this.setMode('G94');
    if (!first) this.retract();
    if (same) {
      this.comment('Same tool T' + t.tool_number + ': no tool change');
    } else if (!first) this.emit('M5');
    if (same) {
      // keep going with the tool that's in
    } else if (this.job.tool_change === 'm0') {
      if (!first) {
        this.comment('TOOL CHANGE: load T' + t.tool_number + ' ' + t.tool_desc);
        this.comment('Re-touch Z so Z0 is still the rotary centreline, then resume');
        this.emit('M0');
      }
    } else if (this.tc && this.tc.on) {
      this.routedChange(t, first);
    } else {
      this.emit('M6 T' + t.tool_number);
    }
    // this operation's travel height (the holder may need more than the stock does), and how
    // high and low its tool can go
    this.zop = op; this.zr = zRoom(this.job, op);
    this.safeZ = Math.max(this.safe0, (this.travel && this.travel[op]) || -Infinity);
    var c = cutterOf(this.job, op);
    this.comment('OP ' + op + ' T' + t.tool_number + ' D' + this.L(Number(t.tool_dia)) + ' ' + t.tool_desc +
      (c.shape === 'taper' ? ' [tapered ball: taper ' + (c.taper * 180 / Math.PI).toFixed(2) + 'deg shank D' + this.L(2 * c.maxR) + ']' : '') +
      ' [stickout ' + this.L(num(t.stickout)) + ']');
    this.emit('M3 S' + Math.round(t.rpm));
    if (!same) this.emit('G4 P3');
    this.toolNo = t.tool_number;
  };
  // Up to ncSender's safe Z, round the rotary to the tool change position, M6 there, and
  // back the same way: ncSender's tool change then only moves between the change position
  // and the tool setter, and returns to the change position.
  Post.prototype.routedChange = function (t, first) {
    var tc = this.tc, info = tc.info, self = this, from;
    var zsafe = info.zsafe !== null ? info.zsafe : 0;
    var up = function () { self.emit('G53 G0 Z' + self.L(zsafe)); self.z = null; };
    if (first) {
      // start: up, then over the middle of the part (start the job with the spindle over the rotary)
      up();
      from = { x: this.midX, y: 0 };
      this.comment('Start: up to safe Z, then over the part');
      this.x = null; this.y = null;        // wherever it is now: say both
      this.rapidXY(from.x, 0);
    } else {
      up();
      from = { x: this.x === null ? this.midX : this.x, y: this.y || 0 };
    }
    var path = routeXY(from, info.change, tc.rects, info.lim);
    if (!path || path.blocked) {
      this.comment('Tool change: no clear way round the rotary from here; ncSender goes straight');
      if (!tc.failed) tc.failed = path && path.blocked ? 'The ' + (path.at === 'to' ? 'tool change position' : 'spindle') + ' is over the ' + path.blocked + ', so tool changes can\u2019t go round it' : 'There\u2019s no way round the rotary to the tool change position inside the machine\u2019s travel';
      this.emit('M6 T' + t.tool_number);
      return;
    }
    this.comment('Tool change: round the rotary to the change position (X' + this.L(info.change.x) + ' Y' + this.L(info.change.y) + ' from the rotary zero)');
    for (var i = 1; i < path.length; i++) this.rapidXY(path[i].x, path[i].y);
    this.emit('M6 T' + t.tool_number);
    this.comment('Back round the rotary');
    for (i = path.length - 2; i >= 0; i--) this.rapidXY(path[i].x, path[i].y);
    tc.count = (tc.count || 0) + 1;
    tc.paths = tc.paths || [];
    tc.paths.push(path.map(function (q) { return [q.x, q.y]; }));
  };
  Post.prototype.footer = function () {
    this.setMode('G94'); this.retract(); this.emit('M5'); this.emit('M30');
  };

  // ---------------------------------------------------------------- toolpaths
  // maps: { roughZ: Float64Array[nAng] (per angle, nx values, NaN = no contact),
  //         finZ:   Float64Array[nAng] (per angle, nrev+2 values) }

  function fillNoContact(rows, stock, label, warn, xOf, p) {
    var bad = 0;
    var out = rows.map(function (r) {
      var c = Float64Array.from(r);
      for (var i = 0; i < c.length; i++) if (!isFinite(c[i])) {
        c[i] = stock;
        var x = xOf ? xOf(i) : null;
        if (x === null || !p || (x > p.partLo + 1 && x < p.partHi - 1)) bad++;
      }
      return c;
    });
    if (bad) warn(label + ': ' + bad + ' samples had no model under the tool; holding them at stock radius (no cut). Check the model covers the X range.');
    return out;
  }

  function genCorners(post, job, p, log) {
    var c = job.corners, cp = p.corners, rad = c.tool_dia / 2, so = Math.max(0.05, c.stepover), stc = stackOf(job, 'corners');
    var aBase = Math.ceil(post.a / 360 - 1e-9) * 360, passes = 0, pts = [];
    cp.corners.forEach(function (cn) {
      var a = aBase + cn.phi * 180 / Math.PI * job.a_sign;
      post.retract();
      post.rapid(null, null, a);
      cn.levels.forEach(function (lv) {
        var w = lv.y1 - lv.y0, centres = [];
        if (w <= 2 * rad) centres.push((lv.y0 + lv.y1) / 2);
        else {
          var n = Math.ceil((w - 2 * rad) / so - 1e-9) + 1;
          for (var k = 0; k < n; k++) centres.push(lv.y1 - rad - k * (w - 2 * rad) / (n - 1));
        }
        var lead = lv.y1 + rad + 1, xs = [cp.lo, cp.hi], dir = 0;
        // never lower than the holder allows there
        var zAt = function (x, y) {
          var f = Math.max(fixtureFloor(job, stc, p.fixtures || [], x, y).z, p.envCorners ? materialFloor(job, stc, p.envCorners, x, y).z : -Infinity);
          if (f > lv.z) noteLimit(p, 'corners', x, f - lv.z, f);
          return Math.max(lv.z, f);
        };
        post.retract();
        post.rapid(xs[0], null, null); post.rapidY(lead);
        var z0 = zAt(xs[0], lead);
        post.rapid(null, z0 + 1, null);
        post.feedLin(xs[0], lead, z0, c.plunge_feed);
        var seg = [[xs[0], lead, z0, a]];
        centres.forEach(function (yc) {
          var zs = zAt(post.x, yc);
          if (zs > post.z) post.feedLin(post.x, post.y, zs, c.feed);
          post.feedLin(post.x, yc, zs, c.feed); seg.push([post.x, yc, zs, a]);
          var xe = xs[1 - dir], n = Math.max(1, Math.ceil(Math.abs(xe - post.x))), xb = post.x, lifted = false;
          var zz = [];
          for (var q = 1; q <= n; q++) { zz.push(zAt(xb + (xe - xb) * q / n, yc)); if (zz[q - 1] > lv.z + 1e-9) lifted = true; }
          if (!lifted && zs <= lv.z + 1e-9) { post.feedLin(xe, yc, lv.z, c.feed); seg.push([xe, yc, lv.z, a]); }
          else for (q = 1; q <= n; q++) {
            // where the floor rises go up first, where it falls go along first: never under it
            var xq = xb + (xe - xb) * q / n, zq = zz[q - 1];
            if (zq > post.z) post.feedLin(post.x, yc, zq, c.feed);
            post.feedLin(xq, yc, post.z, c.feed);
            if (zq < post.z) post.feedLin(xq, yc, zq, c.feed);
            seg.push([xq, yc, zq, a]);
          }
          dir = 1 - dir; passes++;
        });
        post.retract();
        if (post.paths) collect4(post.paths.corners, seg);
      });
    });
    post.retract();
    post.rapidY(0);
    log('corners: ' + cp.corners.length + ' faced, ' + passes + ' passes, roughing starts at R' + cp.startR.toFixed(2));
    return { corners: cp.corners.length, passes: passes, startR: cp.startR, skipped: cp.skipped };
  }

  function genParting(post, job, p, log, warn) {
    var c = job.parting, pp = p.parting, step = job.angle_step_deg, nAng = Math.round(360 / step);
    var startR = job.stock_radius, neckR = Math.max(0, pp.neckR), turns = Math.max(1, Math.ceil((startR - neckR) / c.stepdown - 1e-9));
    pp.skipped.forEach(function (side) { warn('No room to neck the ' + side + ' end of the part: move the part or reduce the keep-away distance.'); });
    pp.ends.forEach(function (e) {
      if (!e.full) warn('The ' + e.side + ' end neck is narrower than asked: it ran into the keep-away distance.');
      e.cols.forEach(function (x) {
        var aBase = Math.ceil(post.a / 360 - 1e-9) * 360, pts = [];
        // never lower than the holder allows: a short stickout can't neck deep
        var hz = holdAt(p.hold && p.hold.parting, x), z0 = Math.max(startR, hz);
        if (hz > neckR) noteLimit(p, 'parting', x, hz - neckR, hz);
        post.retract();
        post.rapid(x, null, aBase);
        post.rapid(null, z0 + 0.5, null);
        post.feedTo(x, z0, aBase, c.plunge_feed);
        pts.push([x, z0, aBase]);
        // spiral in, then one full turn at the neck
        for (var s = 1; s <= (turns + 1) * nAng; s++) {
          var z = s >= turns * nAng ? neckR : startR - (startR - neckR) * s / (turns * nAng);
          z = Math.max(z, hz);
          var a = aBase + s * step;
          post.feedTo(x, z, a, c.feed);
          pts.push([x, z, a]);
        }
        post.retract();
        if (post.paths) collect(post.paths.parting, pts);
      });
    });
    log('parting: necked ' + pp.ends.map(function (e) { return e.side; }).join(' and ') + ' end to D' + (2 * neckR).toFixed(2));
    return { ends: pp.ends.length, neckR: neckR };
  }

  function genIndexed(post, job, ip, log) {
    var aBase = Math.ceil(post.a / 360 - 1e-9) * 360, passes = 0, c = job.index;
    ip.angles.forEach(function (g) {
      var a = aBase + g.a;
      post.retract();
      post.rapid(null, null, a);
      g.passes.forEach(function (pts, i) {
        var p0 = pts[0];
        if (i === 0) { post.rapidY(p0[1]); post.rapid(p0[0], null, null); post.rapid(null, post.rl(g.zLocal), null); }
        else {
          // straight up out of the cut, across at the hop height, then down
          var hop = post.rl(Math.max(pts.hop !== undefined ? pts.hop : g.zLocal, post.z));
          post.rapid(null, hop, null);
          post.rapidXY(p0[0], p0[1]);
        }
        if (pts.approach !== undefined && pts.approach < post.z - 0.01) post.rapid(null, post.rl(pts.approach), null);
        post.feedLin(p0[0], p0[1], p0[2], c.plunge_feed);
        for (var k = 1; k < pts.length; k++) post.feedLin(pts[k][0], pts[k][1], pts[k][2], c.feed);
        if (post.paths) collect4(post.paths.index, pts.map(function (q) { return [q[0], q[1], q[2], a]; }));
        passes++;
      });
      post.rapid(null, post.rl(g.zLocal), null);
      post.retract();
    });
    post.rapidY(0);
    log('indexed: ' + ip.angles.length + ' angle(s), ' + passes + ' passes');
    return { angles: ip.angles.map(function (g) { return g.a; }), passes: passes, target: ip.target, removed: ip.removed, missed: ip.missed, holder: ip.holder || null };
  }

  function genRough(post, job, p, maps, log, warn) {
    var r = job.rough, stock = job.stock_radius, nAng = p.nAng, step = p.step;
    // with the corners off, roughing starts at what's left, unless the corners op
    // covered less of the part than roughing does
    if (p.corners && job.rough.enabled && p.cornersDone) {
      var rr = r.tool_dia / 2, cr = job.corners.tool_dia / 2;
      if (p.corners.lo - cr <= p.roughX[0] - rr + 1e-6 && p.corners.hi + cr >= p.roughX[p.roughX.length - 1] + rr - 1e-6) stock = Math.min(stock, p.corners.startR);
    }
    var xg = p.roughX, nx = xg.length;
    var zr0 = fillNoContact(maps.roughZ, stock, 'rough', warn, function (i) { return p.roughX[i]; }, p);
    // max of each angle and its neighbours: A moves linearly between samples
    var floor = [], j, i;
    for (j = 0; j < nAng; j++) {
      var a0 = zr0[(j - 1 + nAng) % nAng], a1 = zr0[j], a2 = zr0[(j + 1) % nAng];
      var f = new Float64Array(nx);
      for (i = 0; i < nx; i++) {
        f[i] = Math.max(a0[i], a1[i], a2[i]) + r.leave;
        // the holder: never lower than its nut and spindle allow (where the tool would cut)
        var hz = holdAt(p.hold && p.hold.rough, xg[i]);
        if (hz > f[i]) { if (f[i] < stock - 0.01) noteLimit(p, 'rough', xg[i], hz - f[i], hz); f[i] = hz; }
      }
      floor.push(f);
    }
    var lowest = Infinity;
    for (j = 0; j < nAng; j++) for (i = 0; i < nx; i++) if (floor[j][i] < lowest) lowest = floor[j][i];
    var layers = [], rl = stock - r.stepdown;
    while (rl > lowest) { layers.push(rl); rl -= r.stepdown; }
    layers.push(lowest);

    var prev = stock, passes = 0;
    var pad = Math.ceil(r.pitch / r.x_grid);
    layers.forEach(function (L) {
      var need = new Uint8Array(nx), any = false;
      for (i = 0; i < nx; i++) {
        for (j = 0; j < nAng; j++) {
          if (Math.max(L, floor[j][i]) < prev - 0.05) { need[i] = 1; any = true; break; }
        }
      }
      if (!any) { prev = L; return; }
      var needP = new Uint8Array(nx);
      for (i = 0; i < nx; i++) if (need[i]) for (var q = Math.max(0, i - pad); q <= Math.min(nx - 1, i + pad); q++) needP[q] = 1;
      var ranges = [], start = -1;
      for (i = 0; i <= nx; i++) {
        if (i < nx && needP[i]) { if (start < 0) start = i; }
        else if (start >= 0) { ranges.push([start, i - 1]); start = -1; }
      }
      ranges.forEach(function (rg) {
        var xa = xg[rg[0]], xb = xg[rg[1]], span = xb - xa;
        var nrev = Math.max(1, Math.ceil(span / r.pitch));
        var pitch = span > 0 ? span / nrev : 0;
        var aBase = Math.ceil(post.a / 360) * 360;
        var total = (nrev + 2) * nAng + 1;
        var pts = [];
        for (var s = 0; s < total; s++) {
          var turn = s / nAng;
          var helix = Math.min(Math.max(turn - 1, 0), nrev);
          var x = xa + helix * pitch;
          var jj = s % nAng;
          var fi = (x - xg[0]) / r.x_grid;
          var i0 = Math.min(Math.max(Math.floor(fi), 0), nx - 1);
          var i1 = Math.min(i0 + 1, nx - 1);
          var zz = Math.max(L, Math.max(floor[jj][i0], floor[jj][i1]));
          pts.push([x, zz, aBase + s * step]);
        }
        post.retract();
        post.rapid(pts[0][0], null, pts[0][2]);
        post.feedTo(pts[0][0], pts[0][1], pts[0][2], r.plunge_feed);
        for (var k = 1; k < pts.length; k++) post.feedTo(pts[k][0], pts[k][1], pts[k][2], r.feed);
        if (post.paths) collect(post.paths.rough, pts);
        passes++;
      });
      log('rough layer R' + L.toFixed(3) + ': ' + ranges.length + ' range(s)');
      prev = L;
    });
    post.retract();
    log('rough: ' + layers.length + ' layers, ' + passes + ' spiral passes, leave ' + r.leave);
    return { layers: layers, passes: passes };
  }

  // Finish spiral as [x, z, a] points, A from 0: start ring, helix, end ring
  function finishPoints(job, p, maps, warn) {
    var fin = job.finish, nAng = p.nAng, step = p.step, nrev = p.finNrev;
    var z = fillNoContact(maps.finZ, job.stock_radius, 'finish', warn || function () {}, function (c) {
      return c === 0 ? p.finLo : c === nrev + 1 ? p.finHi : p.finLo + (c - 1) * fin.pitch;
    }, p);
    var pts = [], j, k;
    for (j = 0; j < nAng; j++) pts.push([p.finLo, z[j][0], j * step]);
    for (k = 0; k < nrev; k++) {
      for (j = 0; j < nAng; j++) {
        var x = p.finLo + k * fin.pitch + fin.pitch * (p.angles[j] / 360);
        pts.push([x, z[j][k + 1], 360 * (k + 1) + j * step]);
      }
    }
    for (j = 0; j <= nAng; j++) {
      var jj = j % nAng;
      pts.push([p.finHi, z[jj][nrev + 1], 360 * (nrev + 1) + j * step]);
    }
    return pts;
  }

  // The machine moves A and Z in a straight line between points, so over a sharp
  // feature the tool can dip between two samples that are each correct. Check the
  // middle of every segment where the path bends, add the true point wherever the
  // straight move is off by more than the tolerance, and repeat on the halves.
  // probe(groups) -> Promise of z arrays; groups: [{ a, xs: [] }] (a in 0..360)
  function refineFinish(job, pts, probe, onRound) {
    var tol = Math.max(0.002, Number(job.finish.tolerance) || 0.01);
    var stock = job.stock_radius, maxRounds = 4, round = 0, added = 0, worst = 0;
    var cand = [], i;
    for (i = 0; i + 1 < pts.length; i++) {
      var d2a = i > 0 ? Math.abs(pts[i - 1][1] - 2 * pts[i][1] + pts[i + 1][1]) : 0;
      var d2b = i + 2 < pts.length ? Math.abs(pts[i][1] - 2 * pts[i + 1][1] + pts[i + 2][1]) : 0;
      if (Math.max(d2a, d2b) > 2 * tol) cand.push(i);
    }
    function step() {
      if (!cand.length || round >= maxRounds) return Promise.resolve({ pts: pts, added: added, rounds: round, worst: worst });
      round++;
      var groups = {}, order = [];
      cand.forEach(function (seg) {
        var a = (pts[seg][2] + pts[seg + 1][2]) / 2, key = (((a % 360) + 360) % 360).toFixed(6);
        if (!groups[key]) { groups[key] = { a: Number(key), xs: [], segs: [] }; order.push(key); }
        groups[key].xs.push((pts[seg][0] + pts[seg + 1][0]) / 2);
        groups[key].segs.push(seg);
      });
      var list = order.map(function (k) { return groups[k]; });
      if (onRound) onRound(round, cand.length, list.length);
      return probe(list.map(function (g) { return { a: g.a, xs: g.xs }; })).then(function (zs) {
        var mids = {};
        list.forEach(function (g, gi) {
          g.segs.forEach(function (seg, q) {
            var zt = zs[gi][q];
            if (!isFinite(zt)) zt = stock;
            var p0 = pts[seg], p1 = pts[seg + 1];
            var dev = zt - (p0[1] + p1[1]) / 2;
            if (dev > worst) worst = dev;
            if (Math.abs(dev) > tol * 0.75) mids[seg] = [(p0[0] + p1[0]) / 2, zt, (p0[2] + p1[2]) / 2];
          });
        });
        var out = [], next = [];
        for (var k = 0; k < pts.length; k++) {
          out.push(pts[k]);
          if (mids[k]) { out.push(mids[k]); added++; next.push(out.length - 2, out.length - 1); }
        }
        pts = out; cand = next;
        return step();
      });
    }
    return step();
  }

  function genFinish(post, job, p, maps, log, warn) {
    var fin = job.finish, k;
    var base = maps.finPts || finishPoints(job, p, maps, warn);
    var aBase = post.a, hf = p.hold && p.hold.finish;
    var pts = base.map(function (q) {
      var z = q[1], hz = holdAt(hf, q[0]);
      if (hz > z) { noteLimit(p, 'finish', q[0], hz - z, hz); z = hz; }
      return [q[0], z, aBase + q[2]];
    });
    post.retract();
    post.rapid(pts[0][0], null, pts[0][2]);
    post.feedTo(pts[0][0], pts[0][1], pts[0][2], fin.plunge_feed);
    for (k = 1; k < pts.length; k++) post.feedTo(pts[k][0], pts[k][1], pts[k][2], fin.feed);
    post.retract();
    if (post.paths) collect(post.paths.finish, pts);
    log('finish: ' + pts.length + ' points, ' + p.finNrev + ' turns, X ' + p.finLo.toFixed(2) + '..' + p.finHi.toFixed(2) + (maps.finRefined ? ', ' + maps.finRefined + ' points added on sharp features' : ''));
    return { points: pts.length, turns: p.finNrev, refined: maps.finRefined || 0 };
  }

  // paths for the 3D view: x, y, z, a per point; a NaN point separates passes
  function collect(list, pts) {
    if (list.length) list.push(NaN, NaN, NaN, NaN);
    for (var i = 0; i < pts.length; i++) list.push(pts[i][0], 0, pts[i][1], pts[i][2]);
  }
  function collect4(list, pts) {
    if (list.length) list.push(NaN, NaN, NaN, NaN);
    for (var i = 0; i < pts.length; i++) list.push(pts[i][0], pts[i][1], pts[i][2], pts[i][3]);
  }

  function buildProgram(job, p, maps, partName, log, warn, opts) {
    log = log || function () {}; warn = warn || function () {};
    p.limits = {};
    var post = new Post(job);
    post.travel = p.travel || {};
    post.midX = (p.partLo + p.partHi) / 2;
    post.tc = tcPlan(job, p);
    if (opts && opts.paths) post.paths = { corners: [], rough: [], finish: [], index: [], parting: [] };
    post.header(partName);
    var first = true, info = {};
    if (p.corners) { post.tool('corners', first); first = false; info.corners = genCorners(post, job, p, log); p.cornersDone = true; }
    else p.cornersDone = false;
    if (job.rough.enabled) { post.tool('rough', first); first = false; info.rough = genRough(post, job, p, maps, log, warn); }
    if (job.finish.enabled) {
      ['lo', 'hi'].forEach(function (e) {
        if (p.finShort && p.finShort[e] > 0.05) warn('Finishing with the tapered ball stops ' + (job.units === 'in' ? (p.finShort[e] / 25.4).toFixed(3) + ' in' : p.finShort[e].toFixed(2) + ' mm') + ' short of the ' + (e === 'lo' ? 'chuck' : 'tailstock') + ' end of the part: any closer and its cone would run into stock roughing didn\u2019t cut. A tenon at that end lets roughing clear further past it.');
      });
      post.tool('finish', first); first = false; info.finish = genFinish(post, job, p, maps, log, warn);
    }
    if (opts && opts.stopAfterFinish) { post.footer(); return { gcode: post.lines.join('\n') + '\n', lines: post.lines.length, minutes: post.cutMin, info: info, limits: p.limits }; }
    if (maps.indexed && maps.indexed.angles.length) { post.tool('index', first); first = false; info.index = genIndexed(post, job, maps.indexed, log); }
    else if (maps.indexed) info.index = { angles: [], passes: 0, target: maps.indexed.target, removed: 0, missed: maps.indexed.missed, holder: maps.indexed.holder || null };
    if (p.parting && p.parting.ends.length) (p.tenons || []).forEach(function (t) {
      var necked = p.parting.ends.some(function (e) { return e.side === t.side; });
      if (necked && p.parting.neckR >= t.r - 1e-6) warn('The parting neck at the ' + t.side + ' end is no thinner than the tenon there, so the tenon beside the part, not the neck, is the weakest point. Make the neck smaller than the tenon.');
    });
    if (p.parting && p.parting.ends.length) { post.tool('parting', first); first = false; info.parting = genParting(post, job, p, log, warn); }
    else if (p.parting) p.parting.skipped.forEach(function (side) { warn('No room to neck the ' + side + ' end of the part: move the part or reduce the keep-away distance.'); });
    post.footer();
    holderWarnings(job, p, warn);
    zWarnings(job, p, post, warn);
    if (post.tc.on) {
      post.tc.notes.forEach(function (n) { warn(n); });
      if (post.tc.failed) warn(post.tc.failed + '. Its moves from here to the tool change position go straight.');
    }
    return {
      gcode: post.lines.join('\n') + '\n',
      limits: p.limits,
      toolChanges: post.tc && post.tc.on ? { paths: post.tc.paths || [], change: post.tc.info.change, setter: post.tc.info.setter, count: post.tc.count || 0 } : null,
      lines: post.lines.length,
      minutes: post.cutMin,
      limitedMoves: post.limited,
      maxA: post.a,
      info: info,
      paths: post.paths ? { corners: Float32Array.from(post.paths.corners), rough: Float32Array.from(post.paths.rough), finish: Float32Array.from(post.paths.finish), index: Float32Array.from(post.paths.index), parting: Float32Array.from(post.paths.parting) } : null
    };
  }

  // What keeping inside the Z travel cost. A leading '!!' marks one that could hit something.
  function zWarnings(job, p, post, warn) {
    var mm = function (v) { return job.units === 'in' ? (v / 25.4).toFixed(3) + ' in' : v.toFixed(1) + ' mm'; };
    if (zNotOnAxis(job)) warn('Z travel not checked: ncSender\u2019s Z zero is at the top of the Z travel (or above it) right now, so it isn\u2019t on the rotary axis yet. Zero Z on the rotary centreline before you load and run this (Work zero \u2014 from a corner, or your usual way); generating again after that also keeps the program inside the travel.');
    Object.keys(post.zcap).forEach(function (op) {
      var c = post.zcap[op], t = job[op], who = OPN[op] + ' (T' + t.tool_number + ', ' + mm(num(t.stickout)) + ' stickout)';
      // what it can't do without: the tip clear of the stock, and the collet nut and spindle
      // clear of the rotary and what's still there (the retract height on top is a nicety)
      var hold = (p.holdNeed && p.holdNeed[op]) || -Infinity, need = Math.max(job.stock_radius + 1, hold);
      if (c.rapids || c.feeds) {
        if (c.top + 1e-6 < need || c.feeds) warn('!!' + who + ' can only rise ' + mm(c.top) + ' above the rotary axis before Z reaches the top of its travel, but it needs ' + mm(need) + ' to keep the ' + (hold > job.stock_radius + 1 ? 'collet nut and spindle off the rotary and the stock' : 'tool off the stock') + '. ' + (c.rapids + c.feeds) + ' move' + (c.rapids + c.feeds > 1 ? 's were' : ' was') + ' kept down at the top of Z instead: they may hit. Use a shorter stickout, or smaller stock.');
        else warn('To stay inside the Z travel, ' + c.rapids + ' rapid' + (c.rapids > 1 ? 's' : '') + ' in ' + who + ' only rise to ' + mm(c.top) + ' above the rotary axis instead of ' + mm(c.want) + '. That still clears the stock (' + mm(job.stock_radius) + ' from the axis), with less to spare than the retract height asks for.');
      }
      if (c.low) warn('!!' + who + ' goes down to ' + mm(c.lowest) + ', below the bottom of Z travel (' + mm(c.bottom) + ' from the axis with this tool). ' + c.low + ' move' + (c.low > 1 ? 's' : '') + '. Use a longer stickout or move the rotary up.');
    });
  }

  // Largest radius per X bin, for the side-profile preview before toolpaths exist
  function silhouette(mb, binW) {
    binW = binW || 0.5;
    var x0 = mb.min[0], n = Math.max(1, Math.ceil((mb.max[0] - x0) / binW) + 1);
    var r = new Float64Array(n), t = mb.tris;
    for (var i = 0; i < t.length; i += 3) {
      var b = Math.min(n - 1, Math.max(0, Math.round((t[i] - x0) / binW)));
      var rr = Math.hypot(t[i + 1], t[i + 2]);
      if (rr > r[b]) r[b] = rr;
    }
    // fill bins with no vertices (long flat spans) from their neighbours
    var last = 0;
    for (i = 0; i < n; i++) { if (r[i] > 0) last = r[i]; else r[i] = last; }
    return { x0: x0, binW: binW, r: r };
  }

  // Validate a job before running; returns list of problems (empty = ok)
  function check(job, mb, fmtLen) {
    fmtLen = fmtLen || function (v) { return v.toFixed(2) + ' mm'; };
    var probs = [], h = stockHalf(job);
    if (!h && mb.rmax > job.stock_radius + 1e-6) probs.push('The part is ' + fmtLen(2 * mb.rmax) + ' across but the stock is only ' + fmtLen(2 * job.stock_radius) + '. Check the turning axis, centring, or stock size.');
    if (h) {
      var ny = Math.max(-mb.min[1], mb.max[1]), nz = Math.max(-mb.min[2], mb.max[2]);
      if (ny > h[0] + 1e-6 || nz > h[1] + 1e-6) probs.push('The part needs ' + fmtLen(2 * ny) + ' x ' + fmtLen(2 * nz) + ' (Y x Z at A0) but the stock is ' + fmtLen(2 * h[0]) + ' x ' + fmtLen(2 * h[1]) + '. Check the turn about the axis, centring, or stock size.');
    }
    if (job.model && job.model.scale !== undefined && job.model.scale !== null && !(Number(job.model.scale) > 0)) probs.push('Scale must be more than 0%.');
    if (mb.min[0] < job.chuck_face_x) probs.push('The part reaches into the chuck (starts at X' + fmtLen(mb.min[0]) + ').');
    if (mb.max[0] > job.tailstock_x) probs.push('The part runs past the tailstock (ends at X' + fmtLen(mb.max[0]) + ', tailstock at X' + fmtLen(Number(job.tailstock_x)) + ').');
    ['rough', 'finish'].forEach(function (op) {
      var t = job[op];
      if (!t.enabled) return;
      ['tool_dia', 'feed', 'plunge_feed', 'pitch'].forEach(function (k) {
        if (!(Number(t[k]) > 0)) probs.push((op === 'rough' ? 'Roughing' : 'Finishing') + ' ' + k.replace('_', ' ') + ' must be more than 0');
      });
    });
    if (job.rough.enabled && !(job.rough.stepdown > 0)) probs.push('Roughing stepdown must be more than 0');
    if (cornersActive(job)) ['tool_dia', 'feed', 'plunge_feed', 'stepdown', 'stepover'].forEach(function (k) {
      if (!(Number(job.corners[k]) > 0)) probs.push('Corners ' + k.replace('_', ' ') + ' must be more than 0');
    });
    if (job.parting && job.parting.enabled) {
      ['tool_dia', 'feed', 'plunge_feed', 'stepdown'].forEach(function (k) {
        if (!(Number(job.parting[k]) > 0)) probs.push('Parting ' + k.replace('_', ' ') + ' must be more than 0');
      });
      if (!(Number(job.parting.neck_dia) >= 0)) probs.push('Parting neck diameter can\u2019t be negative');
      if (Number(job.parting.gap) < 0) probs.push('Parting gap from the part can\u2019t be negative');
    }
    ['finish', 'index'].forEach(function (op) {
      var t = job[op];
      if (!t || !t.enabled || t.shape !== 'taper') return;
      var who = op === 'finish' ? 'Finishing' : 'Indexed';
      if (!(Number(t.taper_deg) > 0 && Number(t.taper_deg) < 45)) probs.push(who + ' taper must be between 0 and 45\u00b0 per side');
      if (!(Number(t.shank_dia) > Number(t.tool_dia))) probs.push(who + ' shank diameter must be bigger than the tip diameter');
    });
    if (indexActive(job)) {
      ['tool_dia', 'feed', 'plunge_feed', 'stepover', 'stepdown'].forEach(function (k) {
        if (!(Number(job.index[k]) > 0)) probs.push('Indexed ' + k.replace('_', ' ') + ' must be more than 0');
      });
      if (job.index.auto === false && !indexAngles(job).length) probs.push('Indexed: list at least one A angle, like 90, 270');
    }
    var T = job.tenons;
    if (T && T.enabled) {
      var sides = T.ends === 'chuck' ? ['chuck'] : T.ends === 'tailstock' ? ['tailstock'] : T.same ? ['chuck'] : ['chuck', 'tailstock'];
      sides.forEach(function (side) {
        var t = T[side] || {}, who = T.same && T.ends === 'both' ? 'Tenon' : (side === 'chuck' ? 'Chuck end' : 'Tailstock end') + ' tenon';
        if (!(Number(t.dia) > 0)) probs.push(who + ' diameter must be more than 0');
        if (!(Number(t.depth) >= 0)) probs.push(who + ' depth into the part can\u2019t be negative');
        if (t.len !== null && t.len !== undefined && t.len !== '' && !(Number(t.len) >= 0)) probs.push(who + ' length out of the part can\u2019t be negative');
      });
    }
    // the holder: every tool that runs needs a stickout, and the rotary and spindle sizes
    var on = { corners: cornersActive(job), rough: job.rough.enabled, finish: job.finish.enabled, index: indexActive(job), parting: !!(job.parting && job.parting.enabled) };
    Object.keys(on).forEach(function (op) {
      if (!on[op]) return;
      var t = job[op], so = Number(t.stickout);
      if (!(so > 0)) probs.push(OPN[op] + ' stickout must be more than 0 (how far the tool sticks out of the collet nut)');
      else if (so < Number(t.tool_length) - 1e-6) probs.push(OPN[op] + ' stickout (' + fmtLen(so) + ') is shorter than its flutes (' + fmtLen(Number(t.tool_length)) + '): the flutes would be inside the collet');
    });
    var g = rigOf(job);
    [['nut', 'dia', 'Collet nut diameter'], ['spindle', 'dia', 'Spindle diameter']].forEach(function (q) {
      if (!(Number(g[q[0]] && g[q[0]][q[1]]) >= 0)) probs.push(q[2] + ' can\u2019t be negative');
    });
    if (!(Number(g.clear) >= 0)) probs.push('Keep the holder clear by: can\u2019t be negative');
    // the tool has to get above the stock, with A turning, without leaving the Z travel
    // one tool number, one tool
    toolClashes(job).forEach(function (c) {
      var who = function (q) { var n = q.ops.map(function (op) { return OPN[op]; }); return n.length > 1 ? n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1] : n[0]; };
      var each = function (f) { return c.vals.map(function (q) { return f(q.v) + ' for ' + who(q); }).join(' but '); };
      if (c.key === 'kind') probs.push('T' + c.num + ' is ' + each(function (v) { return 'a ' + v + ' end mill'; }) + '. One tool number can\u2019t be two different tools: give one of them its own number.');
      else if (c.key === 'tool_dia') probs.push('T' + c.num + ' is ' + each(function (v) { return fmtLen(v) + ' across'; }) + '. One tool number can\u2019t be two different tools: give one of them its own number, or pick the same tool for both.');
      else if (c.key === 'stickout') probs.push('T' + c.num + ' sticks out ' + each(fmtLen) + '. One tool number is one tool in one holder, so it sticks out one length: which is it?');
      else probs.push('T' + c.num + '\u2019s flutes are ' + each(fmtLen) + ' long. One tool number is one tool: which is it?');
    });
    // (one message for them all: what's assumed, how far each tool may stick out, how to check)
    var zf = zFit(job);
    if (zf && opsInOrder(job).some(function (op) { var zr = zRoom(job, op); return zr && zr.top < zf.need; })) {
      var r = zf.ref, zl = [];
      var tl = function (op) { return OPN[op] + ' T' + job[op].tool_number + ' (' + fmtLen(num(job[op].stickout)) + ')'; };
      if (zf.soMax > 0) zl.push('Z travel: with Z at the top of its travel (machine Z0), a tool can stick out at most ' + fmtLen(zf.soMax) + ' and still clear the stock, which reaches ' + fmtLen(zf.R) + ' from the axis as A turns.');
      else zl.push('Z travel: with Z at the top of its travel (machine Z0), even the spindle nose is only ' + fmtLen(zf.nose) + ' above the rotary axis, and the stock reaches ' + fmtLen(zf.R) + ' from it as A turns: no tool could clear it.');
      if (zf.over.length && zf.soMax > 0) zl.push('Too long: ' + zf.over.map(function (o) { return tl(o.op) + ' by ' + fmtLen(o.by); }).join(', ') + '.');
      var first = opsInOrder(job)[0], ft = first ? 'T' + job[first].tool_number + ' (' + OPN[first] + ', ' + fmtLen(num(job[first].stickout)) + ')' : 'the first tool';
      if (zf.refOver && zf.soMax > 0 && !zf.over.length) zl.push('Every operation\u2019s tool fits now. What\u2019s left is the tool in the spindle: its tip only gets ' + fmtLen(zf.ztop) + ' above the axis, and ncSender checks the whole program against the tool that\u2019s in when it\u2019s loaded. Put in ' + ft + ', zero Z on the rotary axis with it (or measure it on the tool setter), then Generate again.');
      else if (zf.refOver && zf.soMax > 0) zl.push('The tool in the spindle when the program is loaded has to be short enough too (ncSender checks the whole program against it): once the stickouts fit, put in ' + ft + ', zero Z with it and Generate again.');
      var who = r.how === 'typed' ? 'the tool in the spindle with ' + fmtLen(r.so) + ' stickout (as typed under Tool changes)'
        : r.how === 'tool' ? 'T' + r.tool + ' in the spindle (ncSender says so) with ' + fmtLen(r.so) + ' stickout'
        : 'T' + r.tool + ' (' + OPN[r.op] + ', ' + fmtLen(r.so) + ' stickout' + (r.held ? ' when Z was read' : '') + '), taken to be the tool in the spindle because ncSender ' + (r.said ? 'says T' + r.said + ' is in but its stickout isn\u2019t known' : 'didn\u2019t say which tool is in');
      zl.push('Worked out from ' + who + ': ncSender\u2019s work offset (its tool length included) puts its tip ' + fmtLen(zf.ztop) + ' above the rotary axis with Z at the top, so the spindle nose is ' + fmtLen(zf.nose) + ' above it. Changing stickouts here doesn\u2019t move that: the tool in the spindle is what it is until you change it and zero Z again.' + (r.how === 'typed' ? '' : r.said && r.how === 'first' ? ' Set T' + r.said + '\u2019s stickout under Tool changes (\u201cStickout of the tool in the spindle\u201d) to work it out exactly.' : ' If a different tool is in, set \u201cStickout of the tool in the spindle\u201d under Tool changes.'));
      var gap = zf.ztop - zf.stockTop;
      zl.push('To check on the machine: jog Z all the way up. ncSender\u2019s Z should read about ' + fmtLen(zf.ztop) + ', and the tool tip should be about ' + (gap >= 0 ? fmtLen(gap) + ' above' : fmtLen(-gap) + ' below') + ' the top of the stock' + (stockHalf(job) ? ' (a flat face up)' : '') + '. If it isn\u2019t, Z isn\u2019t zeroed on the rotary axis for this tool: zero it again and Generate.');
      zl.push('Otherwise: shorter stickouts (zero Z again with the shorter tool in), or smaller stock.');
      probs.push(zl.join('\n'));
    }
    [['head', 'Headstock'], ['tail', 'Tailstock']].forEach(function (q) {
      ['front', 'back'].forEach(function (sd) { var v = g[q[0]] && g[q[0]][sd]; if (v !== undefined && v !== null && v !== '' && !(Number(v) >= 0)) probs.push(q[1] + ' reach ' + (sd === 'front' ? 'toward you' : 'away from you') + ' can\u2019t be negative'); });
    });
    if (!job.rough.enabled && !job.finish.enabled && !cornersActive(job) && !(job.parting && job.parting.enabled)) probs.push('All the operations are turned off');
    if (!(job.angle_step_deg > 0 && job.angle_step_deg <= 10)) probs.push('Angle step must be between 0 and 10 degrees');
    return probs;
  }

  // Work zero from a corner: the offsets (axis point minus the corner, mm) and, from the
  // work offset now on the corner, where it goes. null when an offset isn't set.
  function cornerZero(job, cur) {
    var c = rigOf(job).corner || {}, n = function (v) { return v !== null && v !== undefined && v !== '' && isFinite(Number(v)) ? Number(v) : null; };
    var d = { x: n(c.dx), y: n(c.dy), z: n(c.dz) };
    if (d.x === null || d.y === null || d.z === null) return null;
    var out = { d: d };
    if (cur) out.to = { x: cur.x + d.x, y: cur.y + d.y, z: cur.z + d.z };
    return out;
  }

  // The largest size the part can be scaled to: inside the stock with 1 mm to spare all
  // round, and its tailstock end far enough from the tailstock for the operations that
  // run past it. { scale, by: 'stock' | 'length' }
  function fitScale(job, raw) {
    var m = clone(job.model || {}); m.scale = 1;
    var mb = placeMesh(raw, m), h = stockHalf(job), margin = 1.0, sR;
    if (h) {
      var ny = Math.max(-mb.min[1], mb.max[1]), nz = Math.max(-mb.min[2], mb.max[2]);
      sR = Math.min((h[0] - margin) / Math.max(1e-9, ny), (h[1] - margin) / Math.max(1e-9, nz));
    } else sR = (stockMaxRadius(job) - margin) / Math.max(1e-9, mb.rmax);
    var room = 0.5;
    if (cornersActive(job)) room = Math.max(room, job.corners.tool_dia + 0.5);
    if (job.rough && job.rough.enabled) room = Math.max(room, job.rough.tool_dia + 0.5);
    ['finish', 'index'].forEach(function (op) {
      if (job[op] && job[op].enabled) { var c = cutterOf(job, op); room = Math.max(room, 0.5 * c.tipR + c.maxR + 0.5); }
    });
    var pc = job.parting;
    if (pc && pc.enabled && pc.ends !== 'chuck') room = Math.max(room, (Number(pc.gap) || 0) + Math.max(Number(pc.tool_dia) || 0, Number(pc.width) || 0) + 0.5);
    // each end leaves its tenon's length (or the tools' room) and the keep-away distance
    var Lt = tenonLen(job, 'tailstock'), Lc = tenonLen(job, 'chuck');
    var limit = job.tailstock_x - job.tailstock_clearance - Math.max(room, Lt);
    var start = m.part_start_x, fixed = isFinite(start) && start !== null && start !== '', moved = false;
    if (fixed && Lc > 0 && Number(start) < job.chuck_face_x + job.chuck_clearance + Lc) { start = job.chuck_face_x + job.chuck_clearance + Lc; moved = true; }
    var sL = fixed ? (limit - Number(start)) / Math.max(1e-9, mb.max[0] - mb.min[0]) : limit / Math.max(1e-9, mb.max[0]);
    var s = Math.max(0.001, Math.min(sR, sL));
    return { scale: Math.floor(s * 1000) / 1000, by: sR <= sL ? 'stock' : 'length', start: fixed ? Number(start) : null, startMoved: moved, end: limit, endBy: Lt > room ? 'tenon' : 'tools' };
  }

  // The smallest stock that would do for the placed part: across, 1 mm to spare all round
  // (as Fit the stock does), and long enough from the jaw face for the part, the room the
  // tools need past its tailstock end (or that end's tenon) and the keep-away from the centre.
  function minStock(job, mb) {
    var s = job.stock || { shape: 'round' }, ny = Math.max(-mb.min[1], mb.max[1]), nz = Math.max(-mb.min[2], mb.max[2]);
    var out = { shape: s.shape || 'round' };
    if (out.shape === 'square') out.width = 2 * Math.max(ny, nz) + 2;
    else if (out.shape === 'rect') { out.width = 2 * ny + 2; out.height = 2 * nz + 2; }
    else out.dia = 2 * mb.rmax + 2;
    var room = 0.5;
    if (cornersActive(job)) room = Math.max(room, job.corners.tool_dia + 0.5);
    if (job.rough && job.rough.enabled) room = Math.max(room, job.rough.tool_dia + 0.5);
    ['finish', 'index'].forEach(function (op) { if (job[op] && job[op].enabled) { var c = cutterOf(job, op); room = Math.max(room, 0.5 * c.tipR + c.maxR + 0.5); } });
    out.length = mb.max[0] - job.chuck_face_x + Math.max(room, tenonLen(job, 'tailstock')) + Number(job.tailstock_clearance || 0);
    return out;
  }

  // Fits the stock to the placed part (+2 mm all round), keeping its shape
  function fitStock(job, mb) {
    var s = job.stock || (job.stock = { shape: 'round' });
    var ny = Math.max(-mb.min[1], mb.max[1]), nz = Math.max(-mb.min[2], mb.max[2]);
    if (s.shape === 'square') s.width = Math.ceil(2 * Math.max(ny, nz) + 2);
    else if (s.shape === 'rect') { s.width = Math.ceil(2 * ny + 2); s.height = Math.ceil(2 * nz + 2); }
    else s.dia = Math.ceil(2 * mb.rmax + 2);
    prepareJob(job);
    return s;
  }

  return {
    VERSION: VERSION, DEFAULTS: DEFAULTS, deepMerge: deepMerge,
    parseSTL: parseSTL, trisFromOcct: trisFromOcct, placeMesh: placeMesh, longestAxis: longestAxis, centreMode: centreMode,
    plan: plan, finishXs: finishXs, buildProgram: buildProgram, check: check, silhouette: silhouette,
    prepareJob: prepareJob, stockHalf: stockHalf, cornersActive: cornersActive, cornerPlan: cornerPlan, stockMaxRadius: stockMaxRadius, stockRadiusAt: stockRadiusAt, fitStock: fitStock,
    fitScale: fitScale, scaleOf: scaleOf, migrateRig: migrateRig, migrateIndex: migrateIndex, zRoom: zRoom, zFit: zFit, zRefInfo: zRefInfo, zRefLive: zRefLive, toolClashes: toolClashes, sameTool: sameTool, toolKind: toolKind, zNotOnAxis: zNotOnAxis, opsInOrder: opsInOrder, minStock: minStock, tenonLen: tenonLen, roughRange: roughRange, cornerZero: cornerZero,
    finishPoints: finishPoints, refineFinish: refineFinish,
    tenonList: tenonList, workMesh: workMesh, cylinderTris: cylinderTris,
    indexActive: indexActive, indexAngles: indexAngles, planIndexed: planIndexed,
    cutterOf: cutterOf, profileZ: profileZ, roughRange: roughRange,
    stackOf: stackOf, fixtures: fixtures, fixtureTop: fixtureTop, fixtureFloor: fixtureFloor, envelope: envelope, envelopeTop: envelopeTop,
    materialFloor: materialFloor, holderFloors: holderFloors, holdAt: holdAt, clearOf: clearOf,
    tcInfo: tcInfo, tcObstacles: tcObstacles, routeXY: routeXY, segHitsRect: segHitsRect, tcPlan: tcPlan
  };
});
