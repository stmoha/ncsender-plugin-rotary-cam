// The relief beside an end of the part: roughing turns a band of the stock past the part down
// to what the collet nut needs, so finishing isn't held up there by stock that stays full size
// (stiff) up to the tailstock. node test/relief-test.js
const core = require('../lib/cam-core.js');
let fails = 0;
const ok = (c, what) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + what); };
const near = (a, b, t = 1e-6) => Math.abs(a - b) <= t;

// a round part from X30 to X150 in 40 mm square stock (corners 28.3 from the axis): R8 all the
// way, or thick (R16) with a thin (R4) last 20 mm at the tailstock end
const cyl = (r) => { const tris = core.cylinderTris(30, 150, r, 64); return { min: [30, -r, -r], max: [150, r, r], rmax: r, ends: { lo: true, hi: true }, tris, solid: tris }; };
const part = cyl(8);
const thinEnd = (() => {
  const a = core.cylinderTris(30, 130, 16, 64), b = core.cylinderTris(130, 150, 4, 64), tris = new Float32Array(a.length + b.length);
  tris.set(a, 0); tris.set(b, a.length);
  return { min: [30, -16, -16], max: [150, 16, 16], rmax: 16, ends: { lo: true, hi: true }, tris, solid: tris };
})();
const job = (over = {}) => core.prepareJob(core.deepMerge(core.deepMerge(core.DEFAULTS, {
  stock: { shape: 'square', width: 40, height: 40, clamp: 12 }, tailstock_x: 230, chuck_clearance: 5, tailstock_clearance: 8,
  model: { part_start_x: 30 }, tenons: { enabled: true, ends: 'both', same: true, chuck: { dia: 10, depth: 0, len: null } },
  rig: { x0_ahead: 0 }, corners: { enabled: false }, parting: { enabled: true },
  rough: { stickout: 22 }, finish: { stickout: 22, shape: 'ball', tool_dia: 3.175 }
}), over));

{
  const j = job(), wm = core.workMesh(j, part), b = wm.bands.find((q) => q.side === 'tailstock');
  const R = core.stockMaxRadius(j), clr = core.clearOf(j), lv = j.rough.leave;
  ok(!!b, 'a 22 mm stickout and 40 mm square stock: a band beside the tailstock end of the part');
  if (b) {
    ok(near(b.r, 5 + 22 - clr - lv - 0.5, 0.05), `turned to R${b.r.toFixed(2)}: the nut (22 mm up) clears it with the tip down on the tenon (R5, lower than the part's end, R8), the roughing leave and 0.5 mm allowed for`);
    ok(b.r < R && b.r > 20, `only the corners come off: R${b.r.toFixed(2)} against R${R.toFixed(2)} at the corners and 20 at the flats`);
    const reach = j.rig.nut.dia / 2 + clr;
    const te = core.tenonList(j, part).find((q) => q.side === 'tailstock');
    ok(near(b.x1 - Math.max(b.x0, te.x1), reach, 0.01) && near(b.xc - b.x1, R - b.r, 0.01), `as far as the nut reaches past where Parting works, the far end of the tenon (X${te.x1.toFixed(1)}): to X${b.x1.toFixed(1)}, then a 45° chamfer back up to the full stock`);
    const p = core.plan(j, wm), rR = j.rough.tool_dia / 2;
    ok(p.roughX[p.roughX.length - 1] + rR >= b.xc - j.rough.x_grid - 1e-6, `roughing reaches over the band and its chamfer (to X${(p.roughX[p.roughX.length - 1] + rR).toFixed(1)})`);
    // the finishing nut's floor at the end of the part: before (no band), the full stock
    const jOff = job({ rough: { relief: false } }), pOff = core.plan(jOff, core.workMesh(jOff, part));
    const at = (pp, x) => core.holdAt(pp.hold.finish, x);
    ok(at(pOff, 150) > 8 && at(p, 150) < 8, `the finishing nut at the end of the part (R8): keeps the tip ${at(pOff, 150).toFixed(2)} mm above the axis without the band, so off the part; with it ${at(p, 150).toFixed(2)}, below the part`);
    ok(!core.workMesh(jOff, part).bands.length, 'Relief off: no band');
    ok(core.workMesh(j, part).count > core.workMesh(jOff, part).count, 'the band and chamfer are a surface roughing drops onto');
  }
}
{
  const j = job({ rough: { stickout: 45 }, finish: { stickout: 45 }, parting: { stickout: 45 }, corners: { stickout: 45 } });
  ok(!core.workMesh(j, part).bands.length, 'long enough stickouts: no band, the job is as before');
  ok(!core.workMesh(job({ tenons: { chuck: { dia: 36 } } }), cyl(18)).bands.length, 'a part that stays thick (R18) to its ends, on fat tenons (R18): the nut never gets near the stock, no band');
  ok(core.workMesh(job(), cyl(18)).bands.length > 0, 'the same part on thin tenons (R5): the tools work down onto them at the ends, so it gets a band');
  const t = core.workMesh(job({ tenons: { ends: 'tailstock', same: false, tailstock: { dia: 10, depth: 0 } } }), thinEnd).bands, tb = t.find((q) => q.side === 'tailstock');
  ok(tb && !t.find((q) => q.side === 'chuck') && near(tb.r, 4 + 22 - 2 - 0.5 - 0.5, 0.05), `thick with a thin tailstock end: a band at that end only, sized for the thin end (R${tb && tb.r.toFixed(2)}), none at the thick chuck end`);
}
{
  const j = job({ tenons: { same: false, tailstock: { dia: 34, depth: 0 } }, rough: { stickout: 10 }, finish: { stickout: 10 }, parting: { stickout: 10 } });
  const b = core.workMesh(j, part).bands.find((q) => q.side === 'tailstock');
  ok(b && near(b.r, 17), `never thinner than the tenon: a 34 mm tenon keeps the band at R${b && b.r.toFixed(2)}`);
}
{
  // the roughing layers: the faced part keeps its layers, the band's corners step down to them
  const j = job({ corners: { enabled: true, stickout: 22 } }), wm = core.workMesh(j, part), p = core.plan(j, wm);
  const maps = { roughZ: Array.from({ length: p.nAng }, () => new Float64Array(p.roughX.length).fill(10)), finZ: Array.from({ length: p.nAng }, () => new Float64Array(p.finNrev + 2).fill(10)) };
  const logs = [];
  core.buildProgram(j, p, maps, 'cyl', (m) => logs.push(m), () => {});
  const lv = logs.filter((m) => /^rough layer R/.test(m)).map((m) => Number(m.match(/R([\d.]+)/)[1]));
  const cs = p.corners.startR;
  ok(lv.some((v) => near(v, cs, 0.002)) && lv.filter((v) => v > cs + 0.01).length >= 1, `roughing steps the band's corners down to the faced stock (R${cs.toFixed(2)}), then on as before: ${lv.map((v) => v.toFixed(1)).join(', ')}`);
}
// ---- closer to the ends (0.15.1): 1/8" from the jaws to the cutter's edge, on to the end of
// the stock at the tailstock when the tip stays well above the live centre, and the corners
// faced beside the part as far as the band runs, no deeper than it
{
  const j = job({ chuck_clearance: 3.175, corners: { enabled: true, stickout: 22 } });
  const rR = j.rough.tool_dia / 2;
  ok(near(core.chuckLo(j, rR) - rR, 3.175), 'X0 on the jaw face: roughing’s cutter edge may come to 1/8" from the jaws');
  const ja = job({ chuck_clearance: 3.175, rig: { x0_ahead: 7.9375 } });
  ok(near(core.chuckLo(ja, rR), 7.9375), `X0 5/16" in front of the jaws: the centre stops at X0 (the keep-out zone checks the centre), so a 1/4" cutter’s edge comes ${(core.chuckLo(ja, rR) - rR).toFixed(2)} mm from the jaws`);
  const jo = job({ chuck_clearance: 3.175, rig: { chuck: { jaws_out: 2 } } });
  ok(near(core.chuckLo(jo, rR) - rR, 5.175), 'jaws sticking out 2 mm past the face: the cutter stays 1/8" off them');
  ok(core.fixtures(jo).find((f) => f.name === 'chuck').x1 === 2, 'and the chuck’s collision shape reaches out to them');

  // both ends thin (R4) on thin tenons, short tools: bands at both ends
  const thinBoth = (() => {
    const a = core.cylinderTris(30, 50, 4, 64), m = core.cylinderTris(50, 130, 16, 64), b = core.cylinderTris(130, 150, 4, 64), tris = new Float32Array(a.length + m.length + b.length);
    tris.set(a, 0); tris.set(m, a.length); tris.set(b, a.length + m.length);
    return { min: [30, -16, -16], max: [150, 16, 16], rmax: 16, ends: { lo: true, hi: true }, tris, solid: tris };
  })();
  const wm = core.workMesh(j, thinBoth), tb = wm.bands.find((q) => q.side === 'tailstock'), cb = wm.bands.find((q) => q.side === 'chuck');
  ok(tb && cb, 'thin at both ends: a band at each');
  if (tb) ok(tb.xc < j.tailstock_x - 30, `plenty of stock past it (to X${j.tailstock_x}): the band stops where the nut stops reaching, with a chamfer (X${tb.xc.toFixed(1)}), the rest stays full size`);
  {
    const js = job({ chuck_clearance: 3.175, tailstock_x: 190, corners: { enabled: true, stickout: 22 } }), ts = core.workMesh(js, thinBoth).bands.find((q) => q.side === 'tailstock');
    ok(ts && ts.r >= core.tailTipClear(js) && near(ts.x1, 190) && near(ts.xc, 190), `stock ending 40 mm past the part: the band (R${ts && ts.r.toFixed(1)}, well above the live centre) runs on to the end of the stock, no ring of full stock left for the nut to catch`);
    const pS = core.plan(js, core.workMesh(js, thinBoth)), rS = js.rough.tool_dia / 2;
    ok(near(pS.roughX[pS.roughX.length - 1] + rS, 190.5, 0.01), 'roughing’s last pass runs 0.5 mm past the end of the stock: not even a sliver left there for a nut to catch');
    const wS = core.workMesh(js, thinBoth), cS = core.plan(js, wS).corners, cpS = js.corners.tool_dia / 2;
    ok(near(cS.hi + cpS, 190.5, 0.01), 'and so does Corners');
    let ring = 0;
    for (let k = 0; k < wS.tris.length; k += 3) if (wS.tris[k] > 189.9 && Math.hypot(wS.tris[k + 1], wS.tris[k + 2]) > ts.r + 0.01) ring++;
    ok(ring === 0, 'a band run to the end of the stock has no flat ring standing up at its end for roughing’s last pass to catch on (0.15.0 left the outer 3 mm full size there)');
    const jlow = job({ chuck_clearance: 3.175, tailstock_x: 190, rig: { centre: { dia: 200 } } }), tl = core.workMesh(jlow, thinBoth).bands.find((q) => q.side === 'tailstock');
    ok(tl && tl.xc <= 190 - jlow.tailstock_clearance + 1e-6, `a band too low to stay clear of a (huge) live centre keeps the keep-away from the tailstock (to X${tl && tl.xc.toFixed(1)})`);
  }
  if (cb) ok(cb.x0 >= 3.175 - 1e-6, `the chuck band stays 1/8" off the jaws (from X${Math.min(cb.x0, cb.xc).toFixed(2)})`);
  const p = core.plan(j, wm), cp = p.corners, cr = j.corners.tool_dia / 2;
  ok(cp && cp.hi + cr > 150 + 20 && cp.lo - cr < 30 - 10, `the corners come off beside the part too (cutter from X${(cp.lo - cr).toFixed(1)} to X${(cp.hi + cr).toFixed(1)}; the part is X30 to X150)`);
  ok(cp.lo - cr >= core.chuckLo(j, cr) - cr - 1e-6, 'never closer to the jaws than the keep-away');
  if (tb) {
    const f = core.cornerFloor(cp, tb.x0 + 10, cr, j.corners.leave);
    ok(near(f, tb.r + j.corners.leave), `over the band the corners go no deeper than it (R${f.toFixed(2)})`);
    ok(core.cornerFloor(cp, 90, cr, j.corners.leave) === -Infinity, 'over the part the corner’s own depth decides');
  }
  // the program: no corners or roughing move closer than 1/8" to the jaws, a word about the jaws
  const maps = { roughZ: Array.from({ length: p.nAng }, () => new Float64Array(p.roughX.length).fill(4)), finZ: Array.from({ length: p.nAng }, () => new Float64Array(p.finNrev + 2).fill(4)) };
  const warns = [];
  const prog = core.buildProgram(j, p, maps, 'cyl', () => {}, (m) => warns.push(m));
  const xs = prog.gcode.split('\n').filter((l) => /^G[01] /.test(l)).map((l) => l.match(/X(-?[\d.]+)/)).filter(Boolean).map((m) => Number(m[1]));
  const minX = Math.min(...xs);
  ok(minX - Math.max(cr, rR) >= 3.175 - 0.01, `no cut closer than 1/8" to the jaws (closest centre X${minX.toFixed(3)})`);
  ok(warns.some((m) => /^The cutter comes within .*jaws don’t stick out/.test(m)), 'a Check says to make sure the jaws don’t stick out past the face X was set from');
  const jOff = job({ chuck_clearance: 3.175, corners: { enabled: true, stickout: 22 }, rough: { relief: false } }), pOff = core.plan(jOff, core.workMesh(jOff, thinBoth));
  ok(!pOff.bands.length && pOff.corners.hi < cp.hi - 10, 'Make room for the nut off: no band, and the corners stay over the part');
}
// ---- Parting held up where more room can't help (0.15.1): the check says which tenon sizes
// would let it cut the tenon to size, each one checked by planning again with it
{
  const pj = (so, over = {}) => core.prepareJob(core.deepMerge(core.deepMerge(core.DEFAULTS, {
    stock: { shape: 'square', width: 40, height: 40, clamp: 12 }, tailstock_x: 200, chuck_clearance: 3.175, tailstock_clearance: 8,
    model: { part_start_x: 30 }, tenons: { enabled: true, ends: 'both', same: false, chuck: { dia: 10, depth: 0, len: null }, tailstock: { dia: 10, depth: 0, len: null } },
    rig: { x0_ahead: 7.9375 }, corners: { enabled: false }, parting: { enabled: true, stickout: so },
    rough: { stickout: 22 }, finish: { stickout: 22, shape: 'ball', tool_dia: 3.175 }
  }), over));
  const lifts = (j) => { const p = core.plan(j, core.workMesh(j, cyl(16))); return { p, L: Object.fromEntries(p.parting.ends.map((e) => [e.side, Math.max(...e.cols.map((x) => core.holdAt(p.hold.parting, x) - e.r))])) }; };
  const j = pj(20), { p, L } = lifts(j);
  const f = (p.partingFix || []).find((q) => q.side === 'chuck' && q.k === 'dia');
  ok(L.chuck > 1 && f, `a 20 mm parting stickout is held up ${L.chuck.toFixed(1)} mm at the chuck end tenon: it suggests a Ø${f && f.v} mm tenon`);
  if (f) {
    const L2 = lifts(pj(20, { tenons: { chuck: { dia: f.v } } })).L;
    ok(L2.chuck <= 0.02, `planned again with that tenon, Parting gets down to it (${L2.chuck.toFixed(2)} mm)`);
    const L3 = lifts(pj(20, { tenons: { chuck: { dia: f.v - 1 } } })).L;
    ok(L3.chuck > 0.02, 'and 1 mm thinner doesn’t: it’s the nearest that does');
  }
  const warns = [];
  const maps = { roughZ: Array.from({ length: p.nAng }, () => new Float64Array(p.roughX.length).fill(16)), finZ: Array.from({ length: p.nAng }, () => new Float64Array(p.finNrev + 2).fill(16)) };
  core.buildProgram(j, p, maps, 'cyl', () => {}, (m) => warns.push(m));
  const w = warns.find((m) => /^Parting can’t cut the tenon/.test(m));
  ok(w && /Or change the tenons: .*make the chuck end tenon Ø24\.0 mm/.test(w), 'the Parting check says so: ' + (w || '').replace(/^.*Or change/, 'Or change'));
  ok(!lifts(pj(40)).p.partingFix, 'a long enough stickout: nothing to suggest');
}
console.log(fails ? fails + ' FAILED' : 'ALL PASS');
process.exitCode = fails ? 1 : 0;
