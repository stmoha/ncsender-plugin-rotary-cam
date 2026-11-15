// node test/finish2-test.js: the rest finishing (rest machining with a second tool).
// The slot part finished with a tapered ball, whose cone can't get into the square corners
// at the ends of the slot; then a 1/8" flat end mill as the rest finishing. It only cuts where
// finishing left something, takes most of that away, and nothing cuts into the part
// (simulated). With nothing left for it (a ball finish on a plain bar), it adds nothing.
globalThis.importScripts = () => {}; globalThis.self = globalThis;
const fs = require('fs'), path = require('path');
const core = require('../lib/cam-core.js'), worker = require('../lib/cam-worker.js'), OCL = require('../lib/ocl.js');
const { parseProgram, Sim, indexLeftover } = require('../lib/cam-sim.js');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

// rough, finish, the rest finishing (and Indexed, if on), as Generate does it
async function run(ocl, raw, saved) {
  const job = core.prepareJob(core.deepMerge(core.DEFAULTS, saved));
  core.migrateStart(job, saved);
  const mb = core.placeMesh(raw, job.model, core.chuckLead(job)), wm = core.workMesh(job, mb), p = core.plan(job, wm);
  const cut = worker.makeCutters(ocl, job), rot = new Float32Array(wm.tris.length), maps = { roughZ: [], finZ: [] };
  for (let j = 0; j < p.nAng; j++) { const r = worker.computeAngle(ocl, wm.tris, rot, job, p, j, cut); maps.roughZ[j] = r.rough; maps.finZ[j] = r.fin; }
  core.applyBelowAxis(job, p, maps);
  const probe = (op) => (groups) => Promise.resolve(groups.map((g) => worker.probe(ocl, wm.tris, rot, job, p, g.a, g.xs, cut, op)));
  const clamp = (a, x, z) => core.belowClamp(job, p, maps, a, x, z);
  const rf = await core.refineFinish(job, core.finishPoints(job, p, maps), probe('finish'), null, clamp);
  maps.finPts = rf.pts; maps.finRefined = rf.added;
  const pre = core.buildProgram(job, p, maps, 'part', () => {}, () => {}, { stopAfter: 'finish' });
  const sim = new Sim(job, mb, parseProgram(pre.gcode, job)); sim.runTo(sim.prog.count);
  const before = sim.leftover({ minLeft: job.finish2.min_left, xLo: mb.min[0], xHi: mb.max[0], cls: 5 }).volume;
  const t0 = Date.now();
  maps.finish2 = await core.planFinish2(job, p, maps, sim, probe('finish2'));
  const ms = Date.now() - t0;
  let afterSim = null;
  if (core.indexActive(job)) {
    if (maps.finish2.runs.length) { sim.continueWith(parseProgram(core.buildProgram(job, p, maps, 'part', () => {}, () => {}, { stopAfter: 'finish2' }).gcode, job)); sim.runTo(sim.prog.count); }
    afterSim = sim;
    const left = indexLeftover(sim, job, mb);
    maps.indexed = await core.planIndexed(job, left, (groups) => Promise.resolve(groups.map((g) => (g.ball > 0 ? worker.dropBallXY(wm.tris, job, g.a, g.xy, g.ball) : worker.dropXY(ocl, wm.tris, rot, job, g.a, g.xy, cut.index, core.cutterOf(job, 'index').maxR)))), (x, y, a) => sim.hullTop(x, y, a), null, p.indexLimits);
  }
  const prog = core.buildProgram(job, p, maps, 'part', () => {}, () => {}, { paths: true });
  return { job, mb, p, maps, prog, before, ms, afterSim, wm, rot, cut };
}

(async () => {
  // ---- the settings
  const j0 = core.prepareJob(core.deepMerge(core.DEFAULTS, { finish2: { enabled: true } }));
  ok(!core.finish2Active(core.DEFAULTS) && core.finish2Active(j0), 'the rest finishing is off unless ticked');
  ok(core.cutterOf(j0, 'finish2').shape === 'flat' && core.toolKind(j0, 'finish2') === 'flat', 'it starts as a flat end mill');
  ok(core.opsInOrder(j0).join() === 'rough,finish,finish2', 'it runs after finishing, before Indexed: ' + core.opsInOrder(j0).join());
  const bad = core.prepareJob(core.deepMerge(core.DEFAULTS, { finish2: { enabled: true, min_left: 0, stepdown: 0 } }));
  const probs = core.check(bad, { min: [30, -10, -10], max: [90, 10, 10], rmax: 10 });
  ok(probs.some((m) => /Rest finishing only where at least must be more than 0/.test(m)) && probs.some((m) => /Rest finishing stepdown/.test(m)), 'its settings are checked, in its own words');
  const clash = core.prepareJob(core.deepMerge(core.DEFAULTS, { finish2: { enabled: true, tool_number: 2 } }));
  ok(core.toolClashes(clash).some((c) => c.num === 2 && c.key === 'kind'), 'the same tool number as the finishing ball is a clash (a ball and a flat end mill)');

  const ocl = await OCL(), occt = await require('../lib/occt-import-js.js')();
  const buf = fs.readFileSync(path.join(__dirname, 'slot_test.step'));
  const raw = core.trisFromOcct(occt.ReadStepFile(new Uint8Array(buf), { linearUnit: 'millimeter', linearDeflectionType: 'absolute_value', linearDeflection: 0.01, angularDeflection: 0.05 })).tris;
  const slot = JSON.parse(fs.readFileSync(path.join(__dirname, 'job-slot.json'), 'utf8'));
  // well clear of the chuck, so the collet nut never holds finishing up off the slot
  slot.model = Object.assign({}, slot.model, { part_start_x: 60 }); slot.tailstock_x = 200;

  // ---- the slot: a tapered ball finish, then a flat end mill
  const saved = Object.assign({}, slot, {
    finish: { shape: 'taper', tool_dia: 1.0, taper_deg: 3.6, shank_dia: 3.175, pitch: 0.5 },
    finish2: { enabled: true, pitch: 0.4 }
  });
  const r = await run(ocl, raw, saved);
  const f2 = r.maps.finish2, info = r.prog.info.finish2;
  console.log(`  finishing left ${r.before.toFixed(1)} mm3; rest finishing: ${f2.runs.length} stretches (${info.layers} layers), ${f2.need} of ${f2.samples} samples, ${f2.probed} dropped, deepest ${f2.deepest.toFixed(2)} mm, X ${f2.x0.toFixed(1)}..${f2.x1.toFixed(1)}, ${r.ms} ms`);
  ok(r.before > 2, 'the tapered ball leaves something in the slot\'s corners');
  ok(!r.p.limits.finish && !r.p.limits.finish2, 'the collet nut holds neither finish up');
  ok(f2.runs.length > 0 && info.points > 0, 'the rest finishing cuts');
  ok(f2.probed < f2.samples * 0.6, `it only drops the tool near what's left (${f2.probed} of ${f2.samples})`);
  ok(f2.need > 0 && f2.x0 >= r.mb.min[0] - 2 && f2.x1 <= r.mb.max[0] + 2, `it cuts on the part (X ${f2.x0.toFixed(1)}..${f2.x1.toFixed(1)}; the slot is X${r.mb.min[0] + 20}..${r.mb.min[0] + 40})`);
  const lines = r.prog.gcode.split('\n'), opLine = lines.filter((l) => /^\(OP finish2 /.test(l));
  ok(opLine.length === 1 && /\[flat end\]/.test(opLine[0]) && /T4 /.test(opLine[0]), 'the program has the rest finishing with its own tool: ' + (opLine[0] || '').slice(0, 60));
  const order = lines.filter((l) => /^\(OP /.test(l)).map((l) => l.split(' ')[1]);
  ok(order.join() === 'rough,finish,finish2', 'in order: ' + order.join());
  ok(r.prog.paths.finish2 && r.prog.paths.finish2.length > 0, 'its toolpath shows in 3D');
  // from one stretch to the next, A goes the short way (never round and round at rapid)
  const pr = parseProgram(r.prog.gcode, r.job), oi = pr.ops.findIndex((o) => o.name === 'finish2');
  let spin = 0;
  for (let k = 1; k < pr.count; k++) if (pr.op[k] === oi && pr.type[k] === 0) spin = Math.max(spin, Math.abs(pr.a[k] - pr.a[k - 1]));
  ok(spin <= 360, `between stretches A turns at most one turn at rapid (${spin.toFixed(0)}°)`);

  const sim = new Sim(r.job, r.mb, parseProgram(r.prog.gcode, r.job));
  sim.runTo(sim.prog.count);
  const after = sim.leftover({ minLeft: r.job.finish2.min_left, xLo: r.mb.min[0], xHi: r.mb.max[0], cls: 5 }).volume;
  ok(after < r.before * 0.5, `it takes away most of what finishing left (${r.before.toFixed(1)} -> ${after.toFixed(1)} mm3)`);
  const g = sim.gouges();
  ok(g.count === 0, `Simulate: nothing cut into the part (${g.count} cells more than 0.1 mm below it)`);
  const hc = sim.holderCheck();
  ok(!hc.count, 'the collet nut and spindle stay clear');
  // never below where the tool rests on the part
  let low = 0, n = 0;
  for (const run of r.maps.finish2.runs) {
    const groups = {};
    run.pts.forEach((q) => { const a = ((q[2] % 360) + 360) % 360, k = a.toFixed(6); (groups[k] = groups[k] || { a, xs: [], z: [] }).xs.push(q[0]); groups[k].z.push(q[1]); });
    for (const k in groups) {
      const gq = groups[k], z = worker.probe(ocl, r.wm.tris, r.rot, r.job, r.p, gq.a, gq.xs, r.cut, 'finish2');
      gq.xs.forEach((x, i) => { n++; const zf = core.belowClamp(r.job, r.p, r.maps, gq.a, x, z[i]); if (isFinite(zf) && zf - gq.z[i] > 0.005) low++; });
    }
  }
  ok(low === 0, `every point is at or above where the flat end mill rests on the part (${low} of ${n} low)`);

  // ---- the same with Indexed after it: Indexed sees what both left
  const r2 = await run(ocl, raw, Object.assign({}, saved, { index: { enabled: true, angle_list: '90, 270', shape: 'flat', tool_dia: 3.175 } }));
  const order2 = r2.prog.gcode.split('\n').filter((l) => /^\(OP /.test(l)).map((l) => l.split(' ')[1]);
  ok(order2.indexOf('finish2') >= 0 && order2.indexOf('finish2') < Math.max(order2.indexOf('index'), order2.length), 'with Indexed on, the rest finishing still runs before it: ' + order2.join());
  ok(r2.afterSim && r2.afterSim.prog.ops.some((o) => o.name === 'finish2'), 'the simulation for Indexed carries on through the rest finishing');

  // ---- a ball finish on the plain part ends: nothing for it to do
  const r3 = await run(ocl, raw, Object.assign({}, slot, { x_start: 64, x_end: 76, finish2: { enabled: true, shape: 'ball', tool_dia: 6.35, min_left: 0.5 } }));
  ok(r3.maps.finish2.runs.length === 0 && r3.prog.info.finish2 && r3.prog.info.finish2.runs === 0 && !/\(OP finish2 /.test(r3.prog.gcode), 'with nothing left it can reach, no rest finishing in the program (and it says so)');

  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
