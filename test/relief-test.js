// The relief beside an end of the part: roughing turns a band of the stock past the part down
// to what the collet nut needs, so finishing isn't held up there by stock that stays full size
// (stiff) up to the tailstock. node test/relief-test.js
const core = require('../lib/cam-core.js');
let fails = 0;
const ok = (c, what) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + what); };
const near = (a, b, t = 1e-6) => Math.abs(a - b) <= t;

// a plain round part, R8 from X30 to X150, in 40 mm square stock (corners 28.3 from the axis)
const part = (() => {
  const tris = core.cylinderTris(30, 150, 8, 64), mb = { min: [30, -8, -8], max: [150, 8, 8], rmax: 8, ends: { lo: true, hi: true }, tris, solid: tris };
  return mb;
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
    ok(near(b.r, 22 - clr - lv), `turned to R${b.r.toFixed(2)}: the nut (22 mm up) clears it with the tip at the axis, the roughing leave allowed for`);
    ok(b.r < R && b.r > 19, `little more than the corners comes off: R${b.r.toFixed(2)} against R${R.toFixed(2)} at the corners and 20 at the flats`);
    const reach = j.rig.nut.dia / 2 + clr;
    ok(near(b.x1 - b.x0, reach, 0.01) && near(b.xc - b.x1, R - b.r, 0.01), `as wide as the nut reaches (${(b.x1 - b.x0).toFixed(1)} mm), then a 45° chamfer back up to the full stock`);
    const p = core.plan(j, wm), rR = j.rough.tool_dia / 2;
    ok(p.roughX[p.roughX.length - 1] + rR >= b.xc - j.rough.x_grid - 1e-6, `roughing reaches over the band and its chamfer (to X${(p.roughX[p.roughX.length - 1] + rR).toFixed(1)})`);
    // the finishing nut's floor at the end of the part: before (no band), the full stock
    const jOff = job({ rough: { relief: false } }), pOff = core.plan(jOff, core.workMesh(jOff, part));
    const at = (pp, x) => core.holdAt(pp.hold.finish, x);
    ok(at(pOff, 150) > 4 && at(p, 150) <= 0.01, `the finishing nut at the end of the part: kept ${at(pOff, 150).toFixed(2)} mm above the axis without the band, free with it (${at(p, 150).toFixed(2)})`);
    ok(!core.workMesh(jOff, part).bands.length, 'Relief off: no band');
    ok(core.workMesh(j, part).count > core.workMesh(jOff, part).count, 'the band and chamfer are a surface roughing drops onto');
  }
}
{
  const j = job({ rough: { stickout: 45 }, finish: { stickout: 45 }, parting: { stickout: 45 }, corners: { stickout: 45 } });
  ok(!core.workMesh(j, part).bands.length, 'long enough stickouts: no band, the job is as before');
}
{
  const j = job({ tenons: { same: false, tailstock: { dia: 34, depth: 0 } }, rough: { stickout: 15 }, finish: { stickout: 15 }, parting: { stickout: 15 } });
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
console.log(fails ? fails + ' FAILED' : 'ALL PASS');
process.exitCode = fails ? 1 : 0;
