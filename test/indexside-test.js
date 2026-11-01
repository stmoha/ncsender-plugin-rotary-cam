// node test/indexside-test.js: Indexed's whole-side pass with a tapered ball never goes below
// the part. Beside a part, the cone can rest on the part's side with the tip far below it
// (the drop-cutter's answer there is the lowest the tool can go, not a surface to finish).
globalThis.importScripts = () => {}; globalThis.self = globalThis;
const core = require('../lib/cam-core.js'), worker = require('../lib/cam-worker.js'), OCL = require('../lib/ocl.js');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const ocl = await OCL();
  // a round bar, radius 8, with a collar (radius 11): the cone rests on the collar's side
  const raw = new Float32Array([...core.cylinderTris(10, 30, 8, 48), ...core.cylinderTris(30, 40, 11, 48), ...core.cylinderTris(40, 60, 8, 48)]);
  for (const shape of ['taper', 'ball']) {
    const job = core.prepareJob(core.deepMerge(core.DEFAULTS, { stock: { dia: 26 }, tailstock_x: 80, corners: { enabled: false },
      index: { enabled: true, auto: false, angle_list: '90', side_finish: true, shape, tool_dia: 1.6, taper_deg: 5, shank_dia: 6.35, stickout: 40, tool_length: 20, stepover: 0.6 } }));
    const mb = core.placeMesh(raw, job.model), wm = core.workMesh(job, mb), cut = worker.makeCutters(ocl, job), rot = new Float32Array(wm.tris.length);
    const rmax = mb.rmax, R = job.index.tool_dia / 2;
    // something left to clean on top, so the angle is planned
    const pts = []; for (let x = 15; x <= 55; x += 2) pts.push([x, 0, 8.4]);
    const left = { n: pts.length, x: Float32Array.from(pts.map((q) => q[0])), y: Float32Array.from(pts.map((q) => q[1])), z: Float32Array.from(pts.map((q) => q[2])),
      w: new Float32Array(pts.length).fill(1), target: new Uint8Array(pts.length).fill(1), s: 0.5, xLo: mb.min[0], xHi: mb.max[0], rmax };
    const hull = (x, y) => { const r = x >= 30 && x <= 40 ? 11 : x >= 10 && x <= 60 ? 8.4 : 0; return Math.abs(y) < r ? Math.sqrt(r * r - y * y) : -Infinity; };
    const drop = (groups) => Promise.resolve(groups.map((g) => (g.ball > 0 ? worker.dropBallXY(wm.tris, job, g.a, g.xy, g.ball) : worker.dropXY(ocl, wm.tris, rot, job, g.a, g.xy, cut.index, core.cutterOf(job, 'index').maxR))));
    const ix = await core.planIndexed(job, left, drop, hull, null, null);
    let n = 0, below = 0, deepest = 0;
    ix.angles.forEach((g) => g.passes.forEach((ps) => ps.forEach((q) => {
      n++;
      const lo = Math.abs(q[1]) < rmax ? -Math.sqrt(rmax * rmax - q[1] * q[1]) - 0.06 : -0.06;
      if (q[2] < lo) { below++; deepest = Math.min(deepest, q[2]); }
    })));
    ok(n > 1000 && below === 0, `${shape === 'taper' ? 'tapered ball' : 'plain ball'}: the whole side runs ${n} points, none below the part (${below}, deepest ${deepest.toFixed(2)})`);
    // where it rides the surface (at the tool's own drop height), it's the ball touching,
    // not the cone resting on the part's side
    const all = []; ix.angles.forEach((g) => g.passes.forEach((ps) => ps.forEach((q) => all.push(q))));
    const xy = Float64Array.from(all.flatMap((q) => [q[0], q[1]]));
    const zt = worker.dropXY(ocl, wm.tris, rot, job, 90, xy, cut.index, core.cutterOf(job, 'index').maxR), zb = worker.dropBallXY(wm.tris, job, 90, xy, R);
    let riding = 0, cone = 0, low = 0;
    all.forEach((q, k) => {
      if (isFinite(zt[k]) && q[2] < zt[k] - 0.005) low++;
      if (q.src === 'side' && Math.abs(q[2] - zt[k]) < 0.005) { riding++; if (!(isFinite(zb[k]) && zt[k] - zb[k] <= 0.03)) cone++; }
    });
    ok(low === 0 && riding > 500 && cone === 0, `the whole side: ${riding} grid points ride the surface, none held up by the cone instead of the ball (${cone}); nothing below the tool's drop (${low})`);
  }
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  process.exitCode = fails ? 1 : 0;
})();
