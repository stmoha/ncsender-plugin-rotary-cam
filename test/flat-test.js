// node test/flat-test.js: finishing and Indexed with a flat end mill (Shape: Flat end mill).
// The chin with both on flat end mills: the program says so, nothing cuts into the part
// (simulated), Indexed never goes below a fresh drop, and a finishing flat end mill with
// the roughing tool's number and size is the same tool (no tool change).
globalThis.importScripts = () => {}; globalThis.self = globalThis;
const fs = require('fs'), path = require('path');
const core = require('../lib/cam-core.js'), worker = require('../lib/cam-worker.js'), OCL = require('../lib/ocl.js');
const { parseProgram, Sim, indexLeftover } = require('../lib/cam-sim.js');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  // ---- the tool's shape
  const j0 = core.deepMerge(core.DEFAULTS, { finish: { shape: 'flat' }, index: { shape: 'flat' } });
  ok(core.cutterOf(j0, 'finish').shape === 'flat' && core.cutterOf(j0, 'index').shape === 'flat' && core.cutterOf(core.DEFAULTS, 'finish').shape === 'ball', 'Shape: Flat end mill makes finishing and Indexed flat; ball stays the default');
  ok(core.profileZ(core.cutterOf(j0, 'finish'), 1) === 0 && core.profileZ(core.cutterOf(core.DEFAULTS, 'finish'), 1) > 0, 'a flat end is flat across');
  ok(core.toolKind(j0, 'finish') === 'flat' && core.toolKind(core.DEFAULTS, 'finish') === 'ball', 'it is a flat end mill for the tool-number checks');
  const same = core.deepMerge(core.DEFAULTS, { finish: { shape: 'flat', tool_number: 1, tool_dia: 6.35, tool_length: 25, stickout: 31 } });
  ok(core.sameTool(same, 'finish').indexOf('rough') >= 0 && !core.toolClashes(same).length, 'finishing with the roughing end mill (same number and size) is the same tool: no tool change, no clash');

  // ---- the chin, both on flat end mills
  const ocl = await OCL(), occt = await require('../lib/occt-import-js.js')();
  const saved = Object.assign(JSON.parse(fs.readFileSync(path.join(__dirname, 'job-chin-index.json'), 'utf8')));
  saved.finish = Object.assign({}, saved.finish, { shape: 'flat', pitch: 0.6 }); saved.index = Object.assign({}, saved.index, { shape: 'flat' });
  const job = core.prepareJob(core.deepMerge(core.DEFAULTS, saved));
  core.migrateStart(job, saved);
  const buf = fs.readFileSync(path.join(__dirname, 'chin_test.step'));
  const raw = core.trisFromOcct(occt.ReadStepFile(new Uint8Array(buf), { linearUnit: 'millimeter', linearDeflectionType: 'absolute_value', linearDeflection: 0.01, angularDeflection: 0.05 })).tris;
  const mb = core.placeMesh(raw, job.model, core.chuckLead(job)), wm = core.workMesh(job, mb), p = core.plan(job, wm);
  const cut = worker.makeCutters(ocl, job), rot = new Float32Array(wm.tris.length), maps = { roughZ: [], finZ: [] };
  for (let j = 0; j < p.nAng; j++) { const r = worker.computeAngle(ocl, wm.tris, rot, job, p, j, cut); maps.roughZ[j] = r.rough; maps.finZ[j] = r.fin; }
  core.applyBelowAxis(job, p, maps);
  const rf = await core.refineFinish(job, core.finishPoints(job, p, maps), (groups) => Promise.resolve(groups.map((g) => worker.probe(ocl, wm.tris, rot, job, p, g.a, g.xs, cut))), null, (a, x, z) => core.belowClamp(job, p, maps, a, x, z));
  maps.finPts = rf.pts; maps.finRefined = rf.added;
  const pre = core.buildProgram(job, p, maps, 'chin', () => {}, () => {}, { stopAfterFinish: true });
  const sim0 = new Sim(job, mb, parseProgram(pre.gcode, job)); sim0.runTo(sim0.prog.count);
  const left = indexLeftover(sim0, job, mb);
  maps.indexed = await core.planIndexed(job, left, (groups) => Promise.resolve(groups.map((g) => (g.ball > 0 ? worker.dropBallXY(wm.tris, job, g.a, g.xy, g.ball) : worker.dropXY(ocl, wm.tris, rot, job, g.a, g.xy, cut.index, core.cutterOf(job, 'index').maxR)))), (x, y, a) => sim0.hullTop(x, y, a), null, p.indexLimits);
  const prog = core.buildProgram(job, p, maps, 'chin', () => {}, () => {});
  const ops = prog.gcode.split('\n').filter((l) => /^\(OP (finish|index) /.test(l));
  ok(ops.length === 2 && ops.every((l) => /\[flat end\]/.test(l)), 'the program says finishing and Indexed are flat end mills: ' + ops.map((l) => l.slice(0, 40)).join(' | '));
  const parsed = parseProgram(prog.gcode, job);
  ok(parsed.ops.filter((o) => o.name === 'finish' || o.name === 'index').every((o) => o.kind === 'flat'), 'Simulate reads them as flat end mills');
  ok(maps.indexed.angles.length > 0 && maps.indexed.angles.some((g) => g.passes.length), `Indexed plans passes with the flat end mill (A ${maps.indexed.angles.map((g) => g.a).join(', ')})`);
  // every indexed point at or above a fresh drop of the flat end mill there
  let low = 0;
  for (const g of maps.indexed.angles) {
    const all = []; g.passes.forEach((pts) => pts.forEach((q) => all.push(q)));
    const z = worker.dropXY(ocl, wm.tris, rot, job, g.a, Float64Array.from(all.flatMap((q) => [q[0], q[1]])), cut.index, core.cutterOf(job, 'index').maxR);
    all.forEach((q, k) => { if (isFinite(z[k]) && z[k] - q[2] > 0.005) low++; });
  }
  ok(low === 0, `Indexed never goes below where the flat end mill rests on the part (${low} points low)`);
  const sim = new Sim(job, mb, parsed);
  sim.runTo(sim.prog.count);
  const g = sim.gouges();
  ok(g.count === 0, `Simulate: nothing cut into the part (${g.count} cells more than 0.1 mm below it)`);

  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
