/*
 * Rotary CAM simulator: plays the posted G-code against a model of the stock.
 *
 * The stock is kept as radial "dexels" in the part's own frame: for every X and every
 * angle around the axis, the radius out to which material is still there. Each move is
 * sampled finely; at each sample the cutter (flat or ball end mill, pointing straight
 * down in machine Z, anywhere in Y) is intersected with every dexel ray it can reach.
 * Material only ever gets removed, so r only goes down.
 *
 * Checks: rapids (G0) that would cut stock, places where the stock ends up below the
 * part's surface (gouges), and cuts into the tenons where they run into the part. Works in Node too (tests): require('./cam-sim.js').
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./cam-core.js'));
  else root.RotaryCamSim = factory(root.RotaryCamCore);
})(typeof self !== 'undefined' ? self : this, function (core) {
  'use strict';
  var DEG = Math.PI / 180;

  // ---------------------------------------------------------------- G-code
  function parseProgram(gcode, job) {
    var lines = gcode.split('\n');
    var m = job.machine || {};
    var rate = { x: m.x_max_mm_min || 5000, y: m.y_max_mm_min || m.x_max_mm_min || 5000, z: m.z_max_mm_min || 2500, a: m.a_max_deg_min || 5400 };
    var scale = 1, mode = 'G94', F = 0, op = -1, ops = [];
    var X = null, Y = 0, Z = null, A = 0;
    var mx = [], my = [], mz = [], ma = [], mt = [], mtype = [], mline = [], mop = [];
    var t = 0, word = /([A-Z])\s*(-?\d*\.?\d+)/g;
    // the tool's end: said in the OP line since 0.11.6 ([ball end] / [flat end]); before, by its name
    var shapeOf = function (d) { var m = d.match(/\[(ball|flat) end\]/); return m ? m[1] : /ball/i.test(d) ? 'ball' : 'flat'; };
    for (var n = 0; n < lines.length; n++) {
      var raw = lines[n], s = raw.trim();
      if (!s) continue;
      var opm = s.match(/^\(OP (\w+) T(\S+) D([\d.]+) (.*)\)$/);
      if (opm) {
        var tp = opm[4].match(/taper ([\d.]+)deg shank D([\d.]+)/);
        var so = opm[4].match(/\[stickout ([\d.]+)\]/);
        ops.push({ name: opm[1], tool: opm[2], dia: Number(opm[3]) * scale, kind: shapeOf(opm[4]), desc: opm[4],
          taper: tp ? Number(tp[1]) * DEG : 0, shank: tp ? Number(tp[2]) * scale : 0, stickout: so ? Number(so[1]) * scale : null });
        op = ops.length - 1;
        continue;
      }
      var code = s.replace(/\([^)]*\)/g, '').replace(/;.*$/, '').toUpperCase();
      if (!code) continue;
      var w = {}, g = [], mm;
      word.lastIndex = 0;
      while ((mm = word.exec(code))) {
        if (mm[1] === 'G') g.push(Number(mm[2])); else w[mm[1]] = Number(mm[2]);
      }
      g.forEach(function (c) {
        if (c === 20) scale = 25.4; else if (c === 21) scale = 1;
        else if (c === 93) mode = 'G93'; else if (c === 94) mode = 'G94';
      });
      if (w.F !== undefined) F = w.F;
      var motion = g.indexOf(0) >= 0 ? 0 : g.indexOf(1) >= 0 ? 1 : -1;
      var nx = w.X !== undefined ? w.X * scale : X, ny = w.Y !== undefined ? w.Y * scale : Y;
      var nz = w.Z !== undefined ? w.Z * scale : Z, na = w.A !== undefined ? w.A : A;
      // G53 (machine coordinates): the program only uses it to go up to ncSender's safe Z
      // before a tool change; here that's well above the stock
      if (g.indexOf(53) >= 0) { nx = X; ny = Y; nz = Math.max(Z === null ? 0 : Z, (job.stock_radius || 20) + 60); }
      if (motion < 0) { X = nx; Y = ny; Z = nz; A = na; continue; }
      if (X === null) X = nx === null ? 0 : nx;
      if (Z === null) Z = nz === null ? 0 : nz;
      if (nx === null) nx = X;
      if (nz === null) nz = Z;
      var dx = Math.abs(nx - X), dy = Math.abs(ny - Y), dz = Math.abs(nz - Z), da = Math.abs(na - A), dt;
      if (motion === 0) dt = Math.max(dx / rate.x, dy / rate.y, dz / rate.z, da / rate.a);
      else if (mode === 'G93') dt = F > 0 ? 1 / F : 0;
      else dt = F > 0 ? Math.sqrt(dx * dx + dy * dy + dz * dz) / (F * scale) : 0;
      t += dt;
      mx.push(nx); my.push(ny); mz.push(nz); ma.push(na); mt.push(t); mtype.push(motion); mline.push(n); mop.push(op);
      X = nx; Y = ny; Z = nz; A = na;
    }
    return {
      lines: lines, ops: ops, count: mx.length, total: t,
      x: Float64Array.from(mx), y: Float64Array.from(my), z: Float64Array.from(mz), a: Float64Array.from(ma),
      t: Float64Array.from(mt), type: Uint8Array.from(mtype), line: Int32Array.from(mline), op: Int16Array.from(mop),
      start: { x: mx.length ? mx[0] : 0, y: 0, z: mz.length ? Math.max.apply(null, mz.slice(0, 3)) : 0, a: 0 }
    };
  }

  // ---------------------------------------------------------------- stock model
  function Sim(job, mesh, prog, opts) {
    opts = opts || {};
    this.job = job; this.prog = prog; this.mesh = mesh;
    var rmaxTool = 0;
    prog.ops.forEach(function (o) { rmaxTool = Math.max(rmaxTool, o.dia / 2); });
    var xa = mesh.min[0], xb = mesh.max[0];
    for (var q0 = 0; q0 < prog.count; q0++) { var xv = prog.x[q0]; if (isFinite(xv)) { if (xv < xa) xa = xv; if (xv > xb) xb = xv; } }
    var lo = xa - rmaxTool - 2, hi = xb + rmaxTool + 2;
    lo = Math.max(lo, job.chuck_face_x);
    hi = Math.min(hi, job.tailstock_x);
    this.dx = opts.dx || Math.max(0.4, (hi - lo) / 700);
    this.nth = opts.nth || 360;
    this.dth = 2 * Math.PI / this.nth;
    this.x0 = lo;
    this.nx = Math.max(2, Math.ceil((hi - lo) / this.dx) + 1);
    var N = this.nx * this.nth;
    this.r = new Float32Array(N);
    this.pa = new Float32Array(N); this.pb = new Float32Array(N);
    this.stock0 = new Float32Array(this.nth);
    for (var j = 0; j < this.nth; j++) this.stock0[j] = core.stockRadiusAt(job, j * this.dth / DEG * job.a_sign);
    this.rStockMax = job.stock_radius + 1;
    this.sinT = new Float64Array(this.nth); this.cosT = new Float64Array(this.nth);
    for (j = 0; j < this.nth; j++) { this.sinT[j] = Math.sin(j * this.dth); this.cosT[j] = Math.cos(j * this.dth); }
    var env = partEnvelope(mesh, this);
    this.pr = env.pr; this.hits = env.hits; this.hStart = env.hStart; this.hD = env.hD;
    // tenons: radius per X column (whole protected length), and which one runs into the part there
    this.tenons = core.tenonList ? core.tenonList(job, mesh) : [];
    this.tr = new Float32Array(this.nx); this.tin = new Uint8Array(this.nx);
    for (var q = 0; q < this.tenons.length; q++) {
      var tn = this.tenons[q];
      for (var i = 0; i < this.nx; i++) {
        var x = this.x0 + i * this.dx;
        if (x >= tn.x0 - 1e-6 && x <= tn.x1 + 1e-6) this.tr[i] = Math.max(this.tr[i], tn.r);
        if (x >= tn.in0 - 1e-6 && x <= tn.in1 + 1e-6) this.tin[i] = q + 1;
      }
    }
    // the holder (collet nut and spindle) of each operation's tool, and the rotary itself
    var rig = job.rig || (core.DEFAULTS && core.DEFAULTS.rig) || {};
    this.fx = core.fixtures ? core.fixtures(job) : [];
    var nut = rig.nut || {}, sp = rig.spindle || {};
    prog.ops.forEach(function (o) {
      var so = o.stickout !== null && o.stickout !== undefined ? o.stickout : Number(job[o.name] && job[o.name].stickout) || 0;
      o.holder = [{ name: 'collet nut', r: (Number(nut.dia) || 0) / 2, h0: so }, { name: 'spindle', r: (Number(sp.dia) || 0) / 2, h0: so + (Number(nut.len) || 0) }]
        .filter(function (c) { return c.r > 0 && so > 0; });
    });
    this.rx = new Float32Array(this.nx); this.rxDirty = new Uint8Array(this.nx);
    this.rS = 0;
    for (j = 0; j < this.nth; j++) this.rS = Math.max(this.rS, this.stock0[j]);
    this.holderHits = [];
    this.checkEvery = Math.max(200, Math.ceil(prog.count / 30));
    this.reset();
  }
  Sim.prototype.reset = function () {
    for (var i = 0; i < this.nx; i++) this.r.set(this.stock0, i * this.nth);
    this.rx.fill(this.rS); this.rxDirty.fill(0); this.holderHits = [];
    this.pa.fill(Infinity); this.pb.fill(-Infinity);
    this.k = 0;
    var s = this.prog.start;
    this.pos = { x: s.x, y: 0, z: s.z, a: 0 };
    this.version = (this.version || 0) + 1;
    if (!this.checkpoints) this.checkpoints = [{ k: 0, r: Float32Array.from(this.r), pos: { x: s.x, y: 0, z: s.z, a: 0 } }];
  };

  // A cutter above its tip: a ball (when it has one) and rings [radius, height above the tip],
  // each the tool's width from that height up. A plain tool has one ring; a tapered ball
  // has a stack of them just inside its cone, so the model never cuts more than the tool.
  function toolRings(tool) {
    if (tool._rings) return tool._rings;
    var R = tool.dia / 2, out;
    if (tool.taper > 0 && tool.shank / 2 > R + 1e-6) {
      var c = { shape: 'taper', tipR: R, maxR: tool.shank / 2, taper: tool.taper }, rc = R * Math.cos(tool.taper), N = 16;
      out = [];
      for (var k = 0; k <= N; k++) { var rho = rc + (c.maxR - rc) * k / N; out.push([rho, core.profileZ(c, rho)]); }
    } else out = [[R, tool.kind === 'ball' ? R : 0]];
    tool._rings = out; tool._rmax = out[out.length - 1][0];
    return out;
  }
  // Radius of the tool at height h above its tip (0 below the tip)
  function toolRadiusAt(tool, h) {
    var R = tool.dia / 2;
    if (h < 0) return 0;
    if (tool.kind === 'ball' || tool.taper > 0) {
      var rc = R * Math.cos(tool.taper || 0), zt = R - Math.sqrt(Math.max(0, R * R - rc * rc));
      if (h <= zt || !(tool.taper > 0)) return h >= R ? R : Math.sqrt(Math.max(0, R * R - (R - h) * (R - h)));
      return Math.min(tool.shank / 2, rc + (h - zt) * Math.tan(tool.taper));
    }
    return R;
  }

  // One cutter position: tool tip at machine (x, y, z) with the part turned to A (deg)
  Sim.prototype.cutAt = function (x, y, z, aDeg, tool) {
    var R = tool.dia / 2, ball = tool.kind === 'ball', rings = toolRings(tool), Rw = tool._rmax;
    var t = aDeg * this.job.a_sign * DEG;
    var zc = ball ? z + R : z;
    // which dexel angles the cutter can reach (machine angle psi = theta - t)
    var zTop = this.rStockMax, ylo = y - Rw, yhi = y + Rw, pmin, pmax;
    if (z <= 0.2) { pmin = -Math.PI; pmax = Math.PI; }
    else {
      var c1 = Math.atan2(ylo, z), c2 = Math.atan2(yhi, z), c3 = Math.atan2(ylo, zTop), c4 = Math.atan2(yhi, zTop);
      pmin = Math.min(c1, c2, c3, c4); pmax = Math.max(c1, c2, c3, c4);
    }
    var j0 = Math.floor((pmin + t) / this.dth) - 1, j1 = Math.ceil((pmax + t) / this.dth) + 1;
    if (j1 - j0 >= this.nth) { j0 = 0; j1 = this.nth - 1; }
    var i0 = Math.max(0, Math.ceil((x - Rw - this.x0) / this.dx)), i1 = Math.min(this.nx - 1, Math.floor((x + Rw - this.x0) / this.dx));
    var removed = 0, nth = this.nth, r = this.r, pa = this.pa, pb = this.pb, EPS = 0.05;
    var ct = Math.cos(t), st = Math.sin(t), rw = this._rw || (this._rw = new Float64Array(64)), rz = this._rz || (this._rz = new Float64Array(64));
    for (var i = i0; i <= i1; i++) {
      var dxc = this.x0 + i * this.dx - x, dx2 = dxc * dxc, w2 = ball ? R * R - dx2 : -1, nr0 = 0;
      for (var q = 0; q < rings.length; q++) {
        var wq = rings[q][0] * rings[q][0] - dx2;
        if (wq > 0) { rw[nr0] = Math.sqrt(wq); rz[nr0] = z + rings[q][1]; nr0++; }
      }
      if (w2 <= 0 && !nr0) continue;
      var base = i * nth;
      for (var jj = j0; jj <= j1; jj++) {
        var j = ((jj % nth) + nth) % nth;
        // ray direction in machine frame: theta rotated by A
        var s = this.sinT[j] * ct - this.cosT[j] * st, c = this.cosT[j] * ct + this.sinT[j] * st;
        var lo = Infinity, hi = -Infinity;
        // each ring: everything above its height with |Y - y| <= its width. A ray pointing
        // down meets it too when the tool works below the axis's height (indexed passes do)
        for (q = 0; q < nr0; q++) {
          var w = rw[q], zs = rz[q], a0 = 0, b0 = Infinity;
          if (c > 1e-9) a0 = Math.max(a0, zs / c);
          else if (c < -1e-9) b0 = Math.min(b0, zs / c);
          else if (zs > 0) b0 = -1;
          if (Math.abs(s) < 1e-9) { if (Math.abs(y) > w) b0 = -1; }
          else {
            var q1 = (y - w) / s, q2 = (y + w) / s;
            a0 = Math.max(a0, Math.min(q1, q2)); b0 = Math.min(b0, Math.max(q1, q2));
          }
          if (a0 < b0) { if (a0 < lo) lo = a0; if (b0 > hi) hi = b0; }
        }
        // ball: the sphere's slice is a disc at (y, zc) of radius sqrt(w2)
        if (w2 > 0) {
          var bb = s * y + c * zc, D = bb * bb - (y * y + zc * zc) + w2;
          if (D >= 0) {
            var sd = Math.sqrt(D), d0 = Math.max(0, bb - sd), d1 = bb + sd;
            if (d1 > d0) { lo = Math.min(lo, d0); hi = Math.max(hi, d1); }
          }
        }
        if (!(lo < hi)) continue;
        var idx = base + j, cur = r[idx];
        if (lo >= cur) continue;
        if (hi >= cur - EPS) {
          var nr = lo;
          if (cur - lo > removed) removed = cur - lo;
          if (pb[idx] >= nr - EPS) { nr = Math.min(nr, pa[idx]); }
          pa[idx] = Infinity; pb[idx] = -Infinity;
          r[idx] = nr;
          this.rxDirty[i] = 1;
        } else if (pa[idx] === Infinity) { pa[idx] = lo; pb[idx] = hi; }
        else if (lo <= pb[idx] + EPS && hi >= pa[idx] - EPS) { pa[idx] = Math.min(pa[idx], lo); pb[idx] = Math.max(pb[idx], hi); }
        else if (hi > pb[idx]) { pa[idx] = lo; pb[idx] = hi; }
      }
    }
    return removed;
  };

  // ---- the holder: how far the collet nut or spindle, with the tool tip at machine
  // (x, y, z) and A at aDeg, runs into the stock or into the chuck / tailstock. The stock
  // past the simulated stretch is uncut. Returns { pen, comp, what } (pen 0: clear).
  Sim.prototype.holderAt = function (x, y, z, aDeg, tool) {
    var out = { pen: 0, comp: null, what: null }, hs = tool.holder || [];
    if (!hs.length) return out;
    var t = aDeg * this.job.a_sign * DEG, ct = Math.cos(t), st = Math.sin(t), nth = this.nth, r = this.r;
    var xEnd = this.x0 + (this.nx - 1) * this.dx, cf = this.job.chuck_face_x, T = this.job.tailstock_x;
    for (var c = 0; c < hs.length; c++) {
      var H = hs[c], zb = z + H.h0, rc = H.r;
      for (var q = 0; q < this.fx.length; q++) {
        var top = core.fixtureTop(this.fx[q], x, y, rc);
        if (top - zb > out.pen) { out.pen = top - zb; out.comp = H.name; out.what = this.fx[q].name; }
      }
      // uncut stock either side of the simulated stretch, its real shape (a square stays
      // square): the slice nearest the holder's axis is the widest it gets there
      var segs = [[Math.max(cf, x - rc), Math.min(this.x0 - this.dx / 2, x + rc)], [Math.max(xEnd + this.dx / 2, x - rc), Math.min(T, x + rc)]];
      for (var e = 0; e < 2; e++) {
        var a0 = segs[e][0], b0 = segs[e][1];
        if (a0 > b0) continue;
        var xp = Math.min(Math.max(x, a0), b0), w = Math.sqrt(Math.max(0, rc * rc - (xp - x) * (xp - x)));
        var pe = this.raysPen(this.stock0, 0, zb, y, w, ct, st);
        if (pe > out.pen) { out.pen = pe; out.comp = H.name; out.what = 'stock'; }
      }
      var i0 = Math.max(0, Math.ceil((x - rc - this.x0) / this.dx)), i1 = Math.min(this.nx - 1, Math.floor((x + rc - this.x0) / this.dx));
      for (var i = i0; i <= i1; i++) {
        var xs = this.x0 + i * this.dx, wi = Math.sqrt(Math.max(0, rc * rc - (xs - x) * (xs - x))), yci = Math.min(Math.max(0, y - wi), y + wi);
        // quick bound from the slice's largest radius (kept high until it's needed)
        if (Math.abs(yci) >= this.rx[i] || Math.sqrt(this.rx[i] * this.rx[i] - yci * yci) <= zb + out.pen) continue;
        if (this.rxDirty[i]) {
          var m = 0, base0 = i * nth;
          for (var jj = 0; jj < nth; jj++) if (r[base0 + jj] > m) m = r[base0 + jj];
          this.rx[i] = m; this.rxDirty[i] = 0;
          if (Math.abs(yci) >= m || Math.sqrt(m * m - yci * yci) <= zb + out.pen) continue;
        }
        var pen = this.raysPen(r, i * nth, zb, y, wi, ct, st);
        if (pen > out.pen) { out.pen = pen; out.comp = H.name; out.what = 'stock'; }
      }
    }
    return out;
  };
  // Every ray of one slice (radii rr[base..base+nth)): material from the axis out to r.
  // How far it reaches up into everything above zb with |Y - y| <= w (0: not at all).
  Sim.prototype.raysPen = function (rr, base, zb, y, w, ct, st) {
    var best = 0;
    for (var j = 0; j < this.nth; j++) {
      var sj = this.sinT[j] * ct - this.cosT[j] * st, cj = this.cosT[j] * ct + this.sinT[j] * st;
      if (cj <= 1e-6) continue;
      var r = rr[base + j], ra = zb / cj;
      if (ra >= r) continue;
      var ya = ra * sj, yb = r * sj, ylo = Math.min(ya, yb), yhi = Math.max(ya, yb);
      if (yhi < y - w || ylo > y + w) continue;
      if (r * cj - zb > best) best = r * cj - zb;
    }
    return best;
  };

  // ---- Indexed: the radial stock model can't hold a pocket under an overhang, so from the
  // start of the Indexed operation, what finishing left is also kept as points that the
  // indexed tool (ball and shank) takes away.
  Sim.prototype.startOverlay = function () {
    var ix = this.job.index || {}, all = ix.what !== 'overhangs';
    var L = this.leftover({ minLeft: Math.max(0.05, Number(ix.min_left) || 0.25), xLo: this.mesh.min[0], xHi: this.mesh.max[0], cls: all ? 3 : 2, max: 40000 });
    var cell = 2, hash = {};
    for (var i = 0; i < L.n; i++) {
      var key = Math.floor(L.x[i] / cell) + ',' + Math.floor(L.y[i] / cell) + ',' + Math.floor(L.z[i] / cell);
      (hash[key] = hash[key] || []).push(i);
    }
    L.alive = new Uint8Array(L.n).fill(1); L.hash = hash; L.cell = cell; L.version = 0;
    var v = 0;
    for (i = 0; i < L.n; i++) v += L.w[i];
    L.total = v;
    this.ovBase = L;
  };
  Sim.prototype.ovCut = function (x, y, z, aDeg, tool) {
    var L = this.ov, t = aDeg * this.job.a_sign * DEG, c = Math.cos(t), s = Math.sin(t);
    toolRings(tool);
    var Rw = tool._rmax;
    // the tip and the tool's axis (machine +Z) in the part frame
    var tx = x, ty = y * c + z * s, tz = -y * s + z * c, uy = s, uz = c, len = 25 + tool.dia;
    var lo = [tx - Rw, Math.min(ty, ty + uy * len) - Rw, Math.min(tz, tz + uz * len) - Rw], hi = [tx + Rw, Math.max(ty, ty + uy * len) + Rw, Math.max(tz, tz + uz * len) + Rw];
    var cs = L.cell, any = false;
    for (var a = Math.floor(lo[0] / cs); a <= Math.floor(hi[0] / cs); a++)
      for (var b = Math.floor(lo[1] / cs); b <= Math.floor(hi[1] / cs); b++)
        for (var d = Math.floor(lo[2] / cs); d <= Math.floor(hi[2] / cs); d++) {
          var list = L.hash[a + ',' + b + ',' + d];
          if (!list) continue;
          for (var q = 0; q < list.length; q++) {
            var i = list[q];
            if (!L.alive[i]) continue;
            var dx = L.x[i] - tx, dy = L.y[i] - ty, dz = L.z[i] - tz, h = dy * uy + dz * uz;
            if (h < 0) continue;
            var rad2 = dx * dx + dy * dy + dz * dz - h * h, rr = toolRadiusAt(tool, h);
            if (rad2 <= rr * rr + 1e-9) { L.alive[i] = 0; any = true; }
          }
        }
    if (any) L.version++;
  };
  Sim.prototype.overlayLeft = function () {
    var L = this.ov;
    if (!L) return null;
    var v = 0;
    for (var i = 0; i < L.n; i++) if (L.alive[i]) v += L.w[i];
    return { total: L.total, left: v };
  };

  // Apply move k (from the current position to its end); returns stock removed (mm)
  Sim.prototype.apply = function (k) {
    var P = this.prog, op = P.op[k], tool = op >= 0 ? P.ops[op] : null;
    if (tool && tool.name === 'index' && !this.ov) {
      if (!this.ovBase) { this.startOverlay(); this.ovStart = k; }
      this.ov = this.ovBase; this.ov.alive.fill(1); this.ov.version++;
    }
    var ovOn = !!(this.ov && tool && tool.name === 'index');
    var p = this.pos, x1 = P.x[k], y1 = P.y[k], z1 = P.z[k], a1 = P.a[k];
    var removed = 0;
    if (tool) {
      var d = this.dx * 0.6;
      var n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - p.x) / d, Math.abs(y1 - p.y) / d, Math.abs(z1 - p.z) / d, Math.abs(a1 - p.a) / (this.dth / DEG * 0.75))));
      if (n > 4000) n = 4000;
      // the holder is checked about every 2 mm (and 3 deg) of the move, and at its end
      var hEvery = Math.max(1, Math.floor(n / Math.max(1, Math.ceil(Math.max(Math.hypot(x1 - p.x, y1 - p.y, z1 - p.z) / 2, Math.abs(a1 - p.a) / 3)))));
      var worst = null;
      for (var q = 1; q <= n; q++) {
        var f = q / n, xq = p.x + (x1 - p.x) * f, yq = p.y + (y1 - p.y) * f, zq = p.z + (z1 - p.z) * f, aq = p.a + (a1 - p.a) * f;
        var rm = this.cutAt(xq, yq, zq, aq, tool);
        if (ovOn) this.ovCut(xq, yq, zq, aq, tool);
        if (rm > removed) removed = rm;
        if (tool.holder && tool.holder.length && (q % hEvery === 0 || q === n)) {
          var h = this.holderAt(xq, yq, zq, aq, tool);
          if (h.pen > 0.05 && (!worst || h.pen > worst.pen)) { worst = h; worst.x = xq; }
        }
      }
      if (worst) this.holderHits.push({ k: k, line: P.line[k] + 1, op: tool.name, pen: worst.pen, comp: worst.comp, what: worst.what, x: worst.x });
    }
    this.pos = { x: x1, y: y1, z: z1, a: a1 };
    return removed;
  };

  // Run forward to move index k (exclusive end: moves 0..k-1 applied)
  Sim.prototype.runTo = function (k, onRapidCut) {
    k = Math.max(0, Math.min(this.prog.count, k));
    if (k < this.k) {
      var cp = this.checkpoints[0];
      for (var c = 0; c < this.checkpoints.length; c++) if (this.checkpoints[c].k <= k) cp = this.checkpoints[c];
      this.r.set(cp.r);
      this.pa.fill(Infinity); this.pb.fill(-Infinity);
      this.rx.fill(this.rS); this.rxDirty.fill(1);
      var hk = cp.k; this.holderHits = this.holderHits.filter(function (h) { return h.k < hk; });
      this.k = cp.k; this.pos = { x: cp.pos.x, y: cp.pos.y, z: cp.pos.z, a: cp.pos.a };
      if (cp.ov && this.ovBase) { this.ov = this.ovBase; this.ov.alive.set(cp.ov); this.ov.version++; }
      else this.ov = null;
    }
    while (this.k < k) {
      var rm = this.apply(this.k);
      if (rm > 0.05 && this.prog.type[this.k] === 0 && onRapidCut) onRapidCut(this.k, rm);
      this.k++;
      if (this.k % this.checkEvery === 0 && (!this.checkpoints.length || this.checkpoints[this.checkpoints.length - 1].k < this.k)) {
        this.checkpoints.push({ k: this.k, r: Float32Array.from(this.r), pos: { x: this.pos.x, y: this.pos.y, z: this.pos.z, a: this.pos.a }, ov: this.ov ? Uint8Array.from(this.ov.alive) : null });
      }
    }
    this.version++;
    return this.k;
  };
  // like runTo, but stops after `ms` milliseconds; returns true when it got there
  Sim.prototype.runToBudget = function (k, ms, onRapidCut) {
    if (k < this.k) { this.runTo(k, onRapidCut); return true; }
    var end = Date.now() + ms;
    while (this.k < k && Date.now() < end) this.runTo(Math.min(k, this.k + 200), onRapidCut);
    return this.k >= k;
  };
  // index of the move that is running at time t (min)
  Sim.prototype.indexAt = function (t) {
    var T = this.prog.t, lo = 0, hi = this.prog.count;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (T[mid] <= t) lo = mid + 1; else hi = mid; }
    return lo;
  };
  // tool position at time t, interpolating inside the current move
  Sim.prototype.poseAt = function (t) {
    var P = this.prog, k = this.indexAt(t);
    if (k >= P.count) return { x: P.x[P.count - 1], y: P.y[P.count - 1], z: P.z[P.count - 1], a: P.a[P.count - 1], k: P.count - 1, op: P.op[P.count - 1] };
    var t0 = k ? P.t[k - 1] : 0, t1 = P.t[k], f = t1 > t0 ? (t - t0) / (t1 - t0) : 1;
    var px = k ? P.x[k - 1] : P.start.x, py = k ? P.y[k - 1] : 0, pz = k ? P.z[k - 1] : P.start.z, pa = k ? P.a[k - 1] : 0;
    return { x: px + (P.x[k] - px) * f, y: py + (P.y[k] - py) * f, z: pz + (P.z[k] - pz) * f, a: pa + (P.a[k] - pa) * f, k: k, op: P.op[k] };
  };

  // Gouges: dexels that ended up below the part surface
  Sim.prototype.gouges = function (tol) {
    tol = tol === undefined ? 0.1 : tol;
    var n = 0, worst = 0, at = null, r = this.r, pr = this.pr, hits = this.hits;
    for (var i = 0; i < r.length; i++) {
      if (pr[i] <= 0 || hits[i] !== 1) continue;
      var d = pr[i] - r[i];
      if (d > tol) { n++; if (d > worst) { worst = d; at = i; } }
    }
    return { count: n, worst: worst, x: at === null ? null : this.x0 + Math.floor(at / this.nth) * this.dx };
  };

  // The holder: moves where the collet nut or spindle ran into the stock or the rotary
  Sim.prototype.holderCheck = function () {
    var H = this.holderHits, out = { count: H.length, worst: 0, line: null, op: null, comp: null, what: null, x: null, first: null };
    H.forEach(function (h) { if (h.pen > out.worst) { out.worst = h.pen; out.line = h.line; out.op = h.op; out.comp = h.comp; out.what = h.what; out.x = h.x; } });
    if (H.length) out.first = H[0].line;
    return out;
  };
  // Tenons: inside the part, every angle should still be out at the tenon's radius
  // (or at the stock, where the stock is smaller)
  Sim.prototype.tenonCheck = function (tol) {
    tol = tol === undefined ? 0.1 : tol;
    var out = { count: 0, worst: 0, x: null, side: null, sides: this.tenons.map(function (t) { return t.side; }) };
    for (var i = 0; i < this.nx; i++) {
      var q = this.tin[i];
      if (!q) continue;
      var t = this.tenons[q - 1], base = i * this.nth;
      for (var j = 0; j < this.nth; j++) {
        var d = Math.min(t.r, this.stock0[j]) - this.r[base + j];
        if (d > tol) { out.count++; if (d > out.worst) { out.worst = d; out.x = this.x0 + i * this.dx; out.side = t.side; } }
      }
    }
    return out;
  };

  // ---------------------------------------------------------------- what's left
  // Material still there that isn't part, along each ray (part frame). Cuts so far only
  // came in from outside, so a ray keeps everything from the axis out to r. Taking the
  // part's surfaces along the ray from the outside in:
  //   above the outermost surface      -> 'surface' (cls 1): a crease the ball was too big for
  //   between two stretches of part    -> 'overhang' (cls 2): hidden under the part from
  //   or between the axis and the part     every line through the axis
  // Returns sample points with their volume, thicker than o.minLeft, inside the part's
  // X range, outside the tenons. o: { minLeft, xLo, xHi, cls: 1 | 2 | 3 (both), max }
  Sim.prototype.leftover = function (o) {
    o = o || {};
    var minLeft = o.minLeft || 0.25, want = o.cls || 2, nth = this.nth, dth = this.dth, dx = this.dx;
    var i0 = Math.max(0, Math.ceil((o.xLo - this.x0) / dx)), i1 = Math.min(this.nx - 1, Math.floor((o.xHi - this.x0) / dx));
    var rays = [], V = 0;
    for (var i = i0; i <= i1; i++) {
      var tr = this.tin[i] || (this.tr[i] > 0) ? this.tr[i] : 0;
      for (var j = 0; j < nth; j++) {
        var idx = i * nth + j, r = this.r[idx], a = this.hStart[idx], n = this.hStart[idx + 1] - a, h = this.hD;
        if (!n) {
          if ((want & 4) && r - tr >= minLeft) { V += (r * r - tr * tr) / 2 * dth * dx; rays.push(i, j, [tr, r, 4]); }
          continue;
        }
        var L = null, top = h[a + n - 1];
        if ((want & 1) && r - Math.max(top, tr) >= minLeft) (L = L || []).push(Math.max(top, tr), r, 1);
        if (want & 2) for (var k = n - 2; k >= 0; k -= 2) {
          var lo = Math.max(k >= 1 ? h[a + k - 1] : 0, tr), hi = Math.min(h[a + k], r);
          if (hi - lo >= minLeft) (L = L || []).push(lo, hi, 2);
        }
        if (!L) continue;
        for (var q = 0; q < L.length; q += 3) V += (L[q + 1] * L[q + 1] - L[q] * L[q]) / 2 * dth * dx;
        rays.push(i, j, L);
      }
    }
    var s = Math.max(o.minStep || 0.3, Math.cbrt(V / (o.max || 40000)));
    var kx = Math.max(1, Math.round(s / dx)), xs = [], ys = [], zs = [], ws = [], cs = [];
    for (var p = 0; p < rays.length; p += 3) {
      var ii = rays[p], jj = rays[p + 1], LL = rays[p + 2];
      if ((ii - i0) % kx) continue;
      var x = this.x0 + ii * dx, sn = this.sinT[jj], cn = this.cosT[jj];
      for (var t = 0; t < LL.length; t += 3) {
        var n2 = Math.max(1, Math.round((LL[t + 1] - LL[t]) / s)), step = (LL[t + 1] - LL[t]) / n2;
        for (var m = 0; m < n2; m++) {
          var rho = LL[t] + (m + 0.5) * step, mj = Math.max(1, Math.round(s / Math.max(1e-6, rho * dth)));
          if (jj % mj) continue;
          xs.push(x); ys.push(rho * sn); zs.push(rho * cn);
          ws.push(rho * dth * mj * dx * kx * step); cs.push(LL[t + 2]);
        }
      }
    }
    return { n: xs.length, x: Float32Array.from(xs), y: Float32Array.from(ys), z: Float32Array.from(zs), w: Float32Array.from(ws), cls: Uint8Array.from(cs), s: s, volume: V };
  };
  // Top of everything still there (part and leftovers) along a vertical line at machine
  // (x, y) with A at aDeg; -Infinity if the line misses it all
  Sim.prototype.hullTop = function (x, y, aDeg) {
    var i = Math.round((x - this.x0) / this.dx), rr = this.r, base, rmax = this.rStockMax;
    if (i < 0 || i >= this.nx) {
      // past the simulated stretch, between the chuck and the tailstock: uncut stock
      if (x < this.job.chuck_face_x || x > this.job.tailstock_x) return -Infinity;
      rr = this.stock0; base = 0;
    } else {
      base = i * this.nth;
      // the furthest any material in this slice reaches from the axis (worked out again once
      // the simulation moves on): a line further out misses, and one closer only needs looking
      // at from where it enters that circle (same 0.2 mm steps from the top, same answer)
      if (!this._rmax || this._rmaxK !== this.k || this._rmaxR !== this.r) {
        this._rmax = new Float32Array(this.nx); this._rmaxK = this.k; this._rmaxR = this.r;
        for (var q = 0; q < this.nx; q++) { var mx = 0; for (var jj = 0; jj < this.nth; jj++) if (this.r[q * this.nth + jj] > mx) mx = this.r[q * this.nth + jj]; this._rmax[q] = mx; }
      }
      rmax = Math.min(rmax, this._rmax[i]);
    }
    if (Math.abs(y) > rmax) return -Infinity;
    var t = aDeg * this.job.a_sign * DEG, c = Math.cos(t), sn = Math.sin(t), zs = this.rStockMax;
    if (rmax < this.rStockMax) zs = this.rStockMax - Math.floor((this.rStockMax - Math.sqrt(rmax * rmax - y * y)) / 0.2) * 0.2;
    for (var z = zs; z > -this.rStockMax; z -= 0.2) {
      var rho = Math.hypot(y, z);
      if (rho > this.rStockMax) continue;
      // machine -> part: undo the turn
      var py = y * c + z * sn, pz = -y * sn + z * c;
      var j = ((Math.round(Math.atan2(py, pz) / this.dth) % this.nth) + this.nth) % this.nth;
      if (rho <= rr[base + j]) return z;
    }
    return -Infinity;
  };

  // ---------------------------------------------------------------- display
  var C_STOCK = [0.78, 0.62, 0.42], C_CUT = [0.89, 0.79, 0.62], C_PART = [0.50, 0.65, 0.86], C_GOUGE = [0.86, 0.27, 0.27], C_TENON = [0.29, 0.87, 0.50];
  // positions (part frame) for an nx x nth grid + 2 end-cap centres, and colours
  Sim.prototype.surface = function (pos, col) {
    var nx = this.nx, nth = this.nth, r = this.r, pr = this.pr, s0 = this.stock0;
    var N = nx * nth;
    pos = pos || new Float32Array((N + 2) * 3);
    col = col || new Float32Array((N + 2) * 3);
    for (var i = 0; i < nx; i++) {
      var x = this.x0 + i * this.dx;
      for (var j = 0; j < nth; j++) {
        var idx = i * nth + j, rr = r[idx], o = idx * 3;
        pos[o] = x; pos[o + 1] = rr * this.sinT[j]; pos[o + 2] = rr * this.cosT[j];
        var cc;
        if (rr >= s0[j] - 0.01) cc = C_STOCK;
        else if (pr[idx] > 0 && this.hits[idx] === 1 && pr[idx] - rr > 0.1) cc = C_GOUGE;
        else if (pr[idx] > 0 && rr - pr[idx] < 0.12) cc = C_PART;
        else if (this.tr[i] > 0 && Math.abs(rr - Math.min(this.tr[i], s0[j])) < 0.15) cc = C_TENON;
        else cc = C_CUT;
        col[o] = cc[0]; col[o + 1] = cc[1]; col[o + 2] = cc[2];
      }
    }
    var e = N * 3;
    pos[e] = this.x0; pos[e + 1] = 0; pos[e + 2] = 0;
    pos[e + 3] = this.x0 + (nx - 1) * this.dx; pos[e + 4] = 0; pos[e + 5] = 0;
    for (var q = 0; q < 6; q++) col[e + q] = C_STOCK[q % 3];
    return { pos: pos, col: col };
  };
  Sim.prototype.indices = function () {
    var nx = this.nx, nth = this.nth, N = nx * nth, out = new Uint32Array(((nx - 1) * nth * 2 + nth * 2) * 3), o = 0;
    for (var i = 0; i < nx - 1; i++) {
      for (var j = 0; j < nth; j++) {
        var a = i * nth + j, b = i * nth + (j + 1) % nth, c = a + nth, d = b + nth;
        out[o++] = a; out[o++] = c; out[o++] = b;
        out[o++] = b; out[o++] = c; out[o++] = d;
      }
    }
    for (j = 0; j < nth; j++) {
      out[o++] = N; out[o++] = (j + 1) % nth; out[o++] = j;
      var l = (nx - 1) * nth;
      out[o++] = N + 1; out[o++] = l + j; out[o++] = l + (j + 1) % nth;
    }
    return out;
  };

  // ---------------------------------------------------------------- part envelope
  // Largest radius of the part along each dexel ray (0 = no part there)
  function partEnvelope(mesh, sim) {
    var nx = sim.nx, nth = sim.nth, pr = new Float32Array(nx * nth), hits = new Uint8Array(nx * nth), t = mesh.tris, hI = [], hDl = [];
    for (var k = 0; k < t.length; k += 9) {
      var ax = t[k], ay = t[k + 1], az = t[k + 2], bx = t[k + 3], by = t[k + 4], bz = t[k + 5], cx = t[k + 6], cy = t[k + 7], cz = t[k + 8];
      var i0 = Math.max(0, Math.ceil((Math.min(ax, bx, cx) - sim.x0) / sim.dx)), i1 = Math.min(nx - 1, Math.floor((Math.max(ax, bx, cx) - sim.x0) / sim.dx));
      if (i1 < i0) continue;
      var th = [Math.atan2(ay, az), Math.atan2(by, bz), Math.atan2(cy, cz)], ra = Math.hypot(ay, az), rb = Math.hypot(by, bz), rc = Math.hypot(cy, cz);
      var j0, j1;
      // angular span (shortest way round); near the axis, all of it
      var tmin = Math.min.apply(null, th), tmax = Math.max.apply(null, th);
      if (Math.min(ra, rb, rc) < 0.5) { j0 = 0; j1 = nth - 1; }
      else if (tmax - tmin > Math.PI) {
        var w = th.map(function (v) { return v < 0 ? v + 2 * Math.PI : v; });
        j0 = Math.floor(Math.min.apply(null, w) / sim.dth) - 1; j1 = Math.ceil(Math.max.apply(null, w) / sim.dth) + 1;
      } else { j0 = Math.floor(tmin / sim.dth) - 1; j1 = Math.ceil(tmax / sim.dth) + 1; }
      // edges for the ray-triangle test
      var e1x = bx - ax, e1y = by - ay, e1z = bz - az, e2x = cx - ax, e2y = cy - ay, e2z = cz - az;
      for (var i = i0; i <= i1; i++) {
        var ox = sim.x0 + i * sim.dx;
        for (var jj = j0; jj <= j1; jj++) {
          var j = ((jj % nth) + nth) % nth, dy = sim.sinT[j], dz = sim.cosT[j];
          // Moller-Trumbore with ray origin (ox, 0, 0), direction (0, dy, dz)
          var px = dy * e2z - dz * e2y, py = dz * e2x, pz = -dy * e2x;
          var det = e1x * px + e1y * py + e1z * pz;
          if (Math.abs(det) < 1e-12) continue;
          var inv = 1 / det, tx = ox - ax, ty = -ay, tz = -az;
          var u = (tx * px + ty * py + tz * pz) * inv;
          if (u < -1e-7 || u > 1 + 1e-7) continue;
          var qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
          var v = (dy * qy + dz * qz) * inv;
          if (v < -1e-7 || u + v > 1 + 1e-7) continue;
          var d = (e2x * qx + e2y * qy + e2z * qz) * inv;
          if (d > 0) { var idx = i * nth + j; if (d > pr[idx]) pr[idx] = d; if (hits[idx] < 255) hits[idx]++; hI.push(idx); hDl.push(d); }
        }
      }
    }
    // every hit along each ray, sorted, a hit on a shared edge counted once (CSR by ray)
    var N = nx * nth, cnt = new Int32Array(N + 1);
    for (var q = 0; q < hI.length; q++) cnt[hI[q] + 1]++;
    for (q = 0; q < N; q++) cnt[q + 1] += cnt[q];
    var fill = Int32Array.from(cnt.subarray(0, N)), D = new Float32Array(hI.length);
    for (q = 0; q < hI.length; q++) D[fill[hI[q]]++] = hDl[q];
    var hStart = new Int32Array(N + 1), hD = new Float32Array(hI.length), o = 0;
    for (var r = 0; r < N; r++) {
      hStart[r] = o;
      var a = cnt[r], b = cnt[r + 1];
      if (b - a > 1) Array.prototype.sort.call(D.subarray(a, b), function (u, v) { return u - v; });
      for (var m = a; m < b; m++) if (o === hStart[r] || D[m] - hD[o - 1] > 1e-3) hD[o++] = D[m];
    }
    hStart[N] = o;
    return { pr: pr, hits: hits, hStart: hStart, hD: hD.subarray(0, o) };
  }

  // What the Indexed operation works on, from a simulation run to the end of finishing:
  // the target (overhangs, or creases too) at full detail, and everything else still
  // there, coarser, so the passes cut through it in layers instead of plunging into it.
  function indexLeftover(sim, job, mesh) {
    var ix = job.index, all = ix.what === 'all', minLeft = Math.max(0.05, Number(ix.min_left) || 0.25);
    var o = { minLeft: minLeft, xLo: mesh.min[0], xHi: mesh.max[0] };
    var t = sim.leftover(Object.assign({}, o, { cls: all ? 3 : 2, max: 30000 }));
    var b = sim.leftover(Object.assign({}, o, { cls: all ? 4 : 5, max: 15000, minStep: Math.max(0.5, t.s) }));
    var n = t.n + b.n, cat = function (p, q) { var r = new Float32Array(n); r.set(p, 0); r.set(q, t.n); return r; };
    var target = new Uint8Array(n);
    target.fill(1, 0, t.n);
    return { n: n, x: cat(t.x, b.x), y: cat(t.y, b.y), z: cat(t.z, b.z), w: cat(t.w, b.w), target: target, s: t.s, volume: t.volume, other: b.volume, xLo: mesh.min[0], xHi: mesh.max[0], rmax: mesh.rmax };
  }

  return { parseProgram: parseProgram, Sim: Sim, indexLeftover: indexLeftover };
});
