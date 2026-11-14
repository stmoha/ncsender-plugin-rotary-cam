// A pretend grblHAL machine with a rotary on the table, for testing the chuck probe:
// G0 / G38.2 / G38.3 moves (G90 / G91, G20 / G21), A turns, G10 L20 / L2 work offsets and
// the probe input. The chuck body is a cylinder along X that can run off true (it turns with
// A), with 4 jaws in front of it and stock in the jaws. Anything other than the probe tip
// touching the chuck, or anything touching the stock, counts as a crash.
// Positions are machine mm; the tip is at the machine position (no tool length offset).
'use strict';

function makeMachine(w) {
  w = Object.assign({
    axisY: -200, axisZ: -80,         // the true rotary axis (machine)
    bodyR: 40, bodyX0: -345, bodyX1: -300, // chuck body: radius, from the headstock to its face
    jawFront: 18, jawW: 14, jawIn: 20, jawOut: 46, jawA0: 0, // jaws: how far past the body face, wide, radial from / to; A (work) with a jaw up
    stockR: 20, stockLen: 80,        // round stock in the jaws
    runout: 0, runPhase: 0,          // the body's centre is this far off the axis (turns with A)
    tip: 'ball', tr: 1,              // 'ball' | 'flat', tip radius
    holderR: 12.5, reach: 30,        // probe body / collet nut, and how far the tip is below it
    conductive: 'chuck'              // what the probe input sees: 'chuck' (a bit and a clip) | 'all' (a 3D probe)
  }, w);
  const S = { m: { x: -320, y: -197.5, z: -30, a: 0 }, wco: { x: -300, y: -200, z: -80, a: 0 }, abs: true, metric: true, alarm: 0, crash: null, log: [] };
  const rad = (d) => d * Math.PI / 180;
  // the body's centre at A (it turns with the chuck)
  const bodyC = (a) => ({ y: w.axisY + w.runout * Math.cos(rad(a + w.runPhase)), z: w.axisZ + w.runout * Math.sin(rad(a + w.runPhase)) });
  const jawFace = () => w.bodyX1 + w.jawFront;
  // boxes for the jaws, only square to the axes (A a multiple of 90 from a jaw up)
  function jawBoxes(a) {
    const k = (((a - w.jawA0) % 90) + 90) % 90;
    if (Math.min(k, 90 - k) > 0.5) return null;
    const out = [], hw = w.jawW / 2;
    for (const [dy, dz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const r0 = w.jawIn, r1 = w.jawOut;
      const y0 = dy ? w.axisY + dy * (dy > 0 ? r0 : r1) : w.axisY - hw, y1 = dy ? w.axisY + dy * (dy > 0 ? r1 : r0) : w.axisY + hw;
      const z0 = dz ? w.axisZ + dz * (dz > 0 ? r0 : r1) : w.axisZ - hw, z1 = dz ? w.axisZ + dz * (dz > 0 ? r1 : r0) : w.axisZ + hw;
      out.push({ x0: w.bodyX1, x1: jawFace(), y0: Math.min(y0, y1), y1: Math.max(y0, y1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) });
    }
    return out;
  }
  // a vertical cylinder (radius r, from z0 up) against a cylinder along X
  function cylVsRod(p, r, z0, rod) {
    if (p.x + r < rod.x0 || p.x - r > rod.x1) return false;
    const cx = Math.min(Math.max(p.x, rod.x0), rod.x1), wy = Math.sqrt(Math.max(0, r * r - (cx - p.x) ** 2));
    const ny = Math.min(Math.max(rod.cy, p.y - wy), p.y + wy), dy = ny - rod.cy;
    if (Math.abs(dy) > rod.r) return false;
    return rod.cz + Math.sqrt(rod.r * rod.r - dy * dy) >= z0 - 1e-9;
  }
  function sphVsRod(c, r, rod) {
    // distance from the ball's centre to the solid cylinder (flat ends)
    const dx = Math.max(rod.x0 - c.x, 0, c.x - rod.x1), dr = Math.max(0, Math.hypot(c.y - rod.cy, c.z - rod.cz) - rod.r);
    return Math.hypot(dx, dr) <= r + 1e-9;
  }
  function cylVsBox(p, r, z0, b) {
    if (b.z1 < z0) return false;
    const dx = Math.max(b.x0 - p.x, 0, p.x - b.x1), dy = Math.max(b.y0 - p.y, 0, p.y - b.y1);
    return Math.hypot(dx, dy) <= r + 1e-9;
  }
  function sphVsBox(c, r, b) {
    const dx = Math.max(b.x0 - c.x, 0, c.x - b.x1), dy = Math.max(b.y0 - c.y, 0, c.y - b.y1), dz = Math.max(b.z0 - c.z, 0, c.z - b.z1);
    return Math.hypot(dx, dy, dz) <= r + 1e-9;
  }
  // what the tool touches at p: { tip: 'chuck'|'stock'|null, holder: name|null }
  function hits(p) {
    const c = bodyC(p.a), body = { x0: w.bodyX0, x1: w.bodyX1, cy: c.y, cz: c.z, r: w.bodyR };
    const stock = { x0: jawFace() - 5, x1: jawFace() + w.stockLen, cy: w.axisY, cz: w.axisZ, r: w.stockR };
    const jaws = jawBoxes(p.a) || [];
    const tipHits = (o, kind) => kind === 'rod'
      ? (w.tip === 'ball' ? sphVsRod({ x: p.x, y: p.y, z: p.z + w.tr }, w.tr, o) || cylVsRod(p, w.tr, p.z + w.tr, o) : cylVsRod(p, w.tr, p.z, o))
      : (w.tip === 'ball' ? sphVsBox({ x: p.x, y: p.y, z: p.z + w.tr }, w.tr, o) || cylVsBox(p, w.tr, p.z + w.tr, o) : cylVsBox(p, w.tr, p.z, o));
    let tip = null;
    if (tipHits(body, 'rod') || jaws.some((b) => tipHits(b, 'box'))) tip = 'chuck';
    else if (tipHits(stock, 'rod')) tip = 'stock';
    let holder = null;
    const hz = p.z + w.reach;
    if (cylVsRod(p, w.holderR, hz, body) || jaws.some((b) => cylVsBox(p, w.holderR, hz, b))) holder = 'chuck';
    else if (cylVsRod(p, w.holderR, hz, stock)) holder = 'stock';
    return { tip, holder };
  }
  const triggered = (p) => { const h = hits(p); return h.tip === 'chuck' || (w.conductive === 'all' && h.tip === 'stock'); };
  function crashAt(p) {
    const h = hits(p);
    if (h.holder) return 'the ' + (w.conductive === 'all' ? 'probe body' : 'collet nut') + ' hit the ' + h.holder;
    if (h.tip === 'stock' && w.conductive !== 'all') return 'the bit hit the stock';
    return null;
  }

  const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t, a: a.a + (b.a - a.a) * t });
  function moveTo(to, probe) {
    const from = Object.assign({}, S.m), len = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
    if (probe) {
      if (triggered(from)) { S.alarm = 4; return { alarm: 4 }; }
      const n = Math.max(1, Math.ceil(len / 0.01));
      for (let i = 1; i <= n; i++) {
        const p = lerp(from, to, i / n);
        const cr = crashAt(p);
        if (cr) { S.m = p; S.crash = cr; return { error: 'crash: ' + cr }; }
        if (triggered(p)) {
          let lo = (i - 1) / n, hi = i / n;
          for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (triggered(lerp(from, to, mid))) hi = mid; else lo = mid; }
          S.m = lerp(from, to, hi);
          return { touched: true };
        }
      }
      S.m = to;
      if (probe === 2) { S.alarm = 5; return { alarm: 5 }; }
      return {};
    }
    const steps = Math.max(1, Math.ceil(len / 0.05), Math.ceil(Math.abs(to.a - from.a) / 2));
    for (let i = 1; i <= steps; i++) {
      const p = lerp(from, to, i / steps);
      const h = hits(p);
      if (h.tip || h.holder) { S.m = p; S.crash = 'a rapid move ran into the ' + (h.holder || h.tip) + ' at X' + p.x.toFixed(2) + ' Y' + p.y.toFixed(2) + ' Z' + p.z.toFixed(2) + ' A' + p.a.toFixed(1); return { error: 'crash: ' + S.crash }; }
    }
    S.m = to;
    return {};
  }
  function exec(line) {
    const l = String(line).trim().toUpperCase();
    S.log.push(l);
    if (!l) return {};
    if (l === '$X') { S.alarm = 0; return {}; }
    if (S.alarm) return { error: 'error:9 (alarm)' };
    const jog = l.startsWith('$J=');
    const words = [...(jog ? l.slice(3) : l).matchAll(/([A-Z])\s*(-?[\d.]+)/g)].map((m) => [m[1], parseFloat(m[2])]);
    const gs = words.filter((q) => q[0] === 'G').map((q) => q[1]), val = (c) => { const q = words.find((v) => v[0] === c); return q ? q[1] : undefined; };
    let abs = S.abs, metric = S.metric;
    for (const g of gs) { if (g === 90) abs = true; if (g === 91) abs = false; if (g === 21) metric = true; if (g === 20) metric = false; }
    if (!jog) { S.abs = abs; S.metric = metric; }
    const f = metric ? 1 : 25.4;
    if (gs.includes(10)) {
      const L = val('L');
      for (const c of ['X', 'Y', 'Z', 'A']) {
        const v = val(c); if (v === undefined) continue;
        const k = c.toLowerCase(), vv = v * (c === 'A' ? 1 : f);
        if (L === 20) S.wco[k] = S.m[k] - vv; else if (L === 2) S.wco[k] = vv;
      }
      return {};
    }
    const probe = gs.some((g) => Math.abs(g - 38.2) < 1e-6) ? 2 : gs.some((g) => Math.abs(g - 38.3) < 1e-6) ? 3 : 0;
    const moving = ['X', 'Y', 'Z', 'A'].some((c) => val(c) !== undefined);
    if (!moving) return {};
    const to = Object.assign({}, S.m);
    for (const c of ['X', 'Y', 'Z', 'A']) {
      const v = val(c); if (v === undefined) continue;
      const k = c.toLowerCase(), vv = v * (c === 'A' ? 1 : f);
      to[k] = abs ? S.wco[k] + vv : S.m[k] + vv;
    }
    if (probe && to.a !== S.m.a) return { error: 'error: G38 with A' };
    return moveTo(to, probe ? (probe === 2 ? 2 : 1) : 0);
  }
  const fmt = (v) => v.toFixed(3);
  return {
    S, w, exec, hits, triggered: () => triggered(S.m), jawFace,
    pos: () => ({ x: S.m.x, y: S.m.y, z: S.m.z, a: S.m.a }),
    // the part of ncSender's machine state that comes from the controller
    state: () => ({ MPos: [S.m.x, S.m.y, S.m.z, S.m.a].map(fmt).join(','), g54: [S.wco.x, S.wco.y, S.wco.z, S.wco.a].map(fmt).join(','), WCO: [S.wco.x, S.wco.y, S.wco.z].map(fmt).join(','), status: S.alarm ? 'Alarm' : 'Idle', Pn: triggered(S.m) ? 'P' : '' })
  };
}
module.exports = { makeMachine };
