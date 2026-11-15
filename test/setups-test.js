// node test/setups-test.js: setups, each a list of strategies run top to bottom (0.13.0).
// Old jobs become one setup made of the operations they had on. The engine that runs any
// list gives the same program as the fixed order did for the same operations. A strategy can
// come twice (a second roughing with a smaller tool, set to rest, only cuts where the first
// left something), and each setup of a part makes its own program.
globalThis.importScripts = () => {}; globalThis.self = globalThis;
const fs = require('fs'), path = require('path');
const core = require('../lib/cam-core.js'), worker = require('../lib/cam-worker.js'), OCL = require('../lib/ocl.js');
const Sm = require('../lib/cam-sim.js');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

// what Generate's worker pool does, here in one thread
function nodeDeps(ocl, wm) {
  const rot = new Float32Array(wm.tris.length), cuts = new Map();
  const cutsOf = (ctx) => { const k = JSON.stringify([ctx.rough, ctx.finish, ctx.finish2, ctx.index]); if (!cuts.has(k)) cuts.set(k, worker.makeCutters(ocl, ctx)); return cuts.get(k); };
  return {
    rot,
    maps(ctx, p) {
      const cut = worker.makeCutters(ocl, ctx), out = { roughZ: [], finZ: [] };
      for (let j = 0; j < p.nAng; j++) { const r = worker.computeAngle(ocl, wm.tris, rot, ctx, p, j, cut); out.roughZ[j] = r.rough; out.finZ[j] = r.fin; }
      return Promise.resolve(out);
    },
    probe: (ctx, p, groups, op) => Promise.resolve(groups.map((g) => worker.probe(ocl, wm.tris, rot, ctx, p, g.a, g.xs, cutsOf(ctx), op))),
    drop: (ctx, p, groups) => Promise.resolve(groups.map((g) => (g.ball > 0 ? worker.dropBallXY(wm.tris, ctx, g.a, g.xy, g.ball) : worker.dropXY(ocl, wm.tris, rot, ctx, g.a, g.xy, cutsOf(ctx).index, core.cutterOf(ctx, 'index').maxR)))),
    Sim: Sm,
    play: (sim) => { sim.runTo(sim.prog.count); return Promise.resolve(); }
  };
}
function setupJob(saved) {
  const job = core.prepareJob(core.deepMerge(core.DEFAULTS, saved));
  core.migrateStart(job, saved);
  core.migrateSetups(job, saved);
  return job;
}
async function runNew(ocl, raw, job) {
  const mb = core.placeMesh(raw, job.model, core.chuckLead(job)), wm = core.workMesh(job, mb);
  const res = await core.runSetup(job, mb, wm, 'part', nodeDeps(ocl, wm));
  const warns = [];
  const prog = core.buildSteps(job, res.steps, 'part', null, (w) => warns.push(w), { paths: true });
  return { job, mb, steps: res.steps, prog, warns };
}
// the fixed order, as 0.12.0 made it
async function runOld(ocl, raw, saved) {
  const job = core.prepareJob(core.deepMerge(core.DEFAULTS, saved));
  core.migrateStart(job, saved);
  const mb = core.placeMesh(raw, job.model, core.chuckLead(job)), wm = core.workMesh(job, mb), p = core.plan(job, wm);
  const cut = worker.makeCutters(ocl, job), rot = new Float32Array(wm.tris.length), maps = { roughZ: [], finZ: [] };
  for (let j = 0; j < p.nAng; j++) { const r = worker.computeAngle(ocl, wm.tris, rot, job, p, j, cut); maps.roughZ[j] = r.rough; maps.finZ[j] = r.fin; }
  core.applyBelowAxis(job, p, maps);
  const probe = (op) => (groups) => Promise.resolve(groups.map((g) => worker.probe(ocl, wm.tris, rot, job, p, g.a, g.xs, cut, op)));
  const rf = await core.refineFinish(job, core.finishPoints(job, p, maps), probe('finish'), null, (a, x, z) => core.belowClamp(job, p, maps, a, x, z));
  maps.finPts = rf.pts; maps.finRefined = rf.added;
  if (core.finish2Active(job)) {
    const pre = core.buildProgram(job, p, maps, 'part', () => {}, () => {}, { stopAfter: 'finish' });
    const sim = new Sm.Sim(job, mb, Sm.parseProgram(pre.gcode, job)); sim.runTo(sim.prog.count);
    maps.finish2 = await core.planFinish2(job, p, maps, sim, probe('finish2'));
  }
  return core.buildProgram(job, p, maps, 'part', () => {}, () => {}, {});
}
const moves = (g) => g.split('\n').filter((l) => /^G[01] /.test(l) || /^[XYZAF]/.test(l));
const opsOf = (g) => g.split('\n').filter((l) => /^\(OP /.test(l)).map((l) => l.split(' ')[1]);

(async () => {
  // ---- old jobs: one setup from what was on
  const j1 = setupJob({ finish2: { enabled: true, tool_number: 4 }, index: { enabled: true } });
  const l1 = j1.setups[0].list;
  ok(j1.setups.length === 1 && l1.map((s) => s.type + (s.mode === 'rest' ? '/rest' : '')).join() === 'rough,finish,finish/rest,index', 'an old job becomes one setup in its old order: ' + l1.map((s) => s.type + (s.mode === 'rest' ? '/rest' : '')).join());
  ok(l1[2].tool_number === 4 && l1[2].min_left === core.DEFAULTS.finish2.min_left, 'Rest finishing keeps its tool, as a finishing set to rest');
  ok(core.stratTitles(l1).join() === 'Roughing,Finishing 1,Finishing 2,Indexed', 'repeats are numbered: ' + core.stratTitles(l1).join());
  const sq = setupJob({ stock: { shape: 'square', width: 30 }, parting: { enabled: true } });
  ok(sq.setups[0].list.map((s) => s.type).join() === 'corners,rough,finish,parting', 'square stock keeps Corners first, Parting last: ' + sq.setups[0].list.map((s) => s.type).join());
  ok(setupJob({}).setups[0].list.every((s) => s.type !== 'corners'), 'round stock gets no Corners');
  const again = setupJob(JSON.parse(JSON.stringify(j1)));
  ok(again.setups[0].list.map((s) => s.id).join() === l1.map((s) => s.id).join(), 'a saved setup comes back as it was');
  // the context a strategy runs in
  const c2 = core.stepCtx(j1, l1, 2);
  ok(c2.finish2.enabled && c2.finish2.tool_number === 4 && c2.finish.enabled && c2.finish.tool_number === l1[1].tool_number && c2._slot === 'finish2', 'a rest finishing runs with the finishing above it');
  const c0 = core.stepCtx(j1, l1, 0);
  ok(c0.rough.enabled && c0.finish.enabled && c0.finish.tool_number === l1[1].tool_number, 'roughing sees the finishing that comes after it (a tapered tool needs room past the part)');

  const ocl = await OCL(), occt = await require('../lib/occt-import-js.js')();
  const raw = core.trisFromOcct(occt.ReadStepFile(new Uint8Array(fs.readFileSync(path.join(__dirname, 'slot_test.step'))), { linearUnit: 'millimeter', linearDeflectionType: 'absolute_value', linearDeflection: 0.01, angularDeflection: 0.05 })).tris;
  const slot = JSON.parse(fs.readFileSync(path.join(__dirname, 'job-slot.json'), 'utf8'));
  slot.model = Object.assign({}, slot.model, { part_start_x: 60 }); slot.tailstock_x = 200;

  // ---- the same operations, the same program
  const saved = Object.assign({}, slot, { finish: { shape: 'taper', tool_dia: 1.0, taper_deg: 3.6, shank_dia: 3.175, pitch: 0.5 }, finish2: { enabled: true, pitch: 0.4 } });
  const old = await runOld(ocl, raw, saved);
  const nw = await runNew(ocl, raw, setupJob(saved));
  const a = moves(old.gcode), b = moves(nw.prog.gcode);
  let diff = -1;
  for (let i = 0; i < Math.max(a.length, b.length) && diff < 0; i++) if (a[i] !== b[i]) diff = i;
  ok(diff < 0, `the list engine writes the same moves as the fixed order (${b.length} moves${diff >= 0 ? ', first difference at ' + diff + ': ' + a[diff] + ' | ' + b[diff] : ''})`);
  ok(opsOf(nw.prog.gcode).join() === 'rough,finish,finish2', 'in the same order: ' + opsOf(nw.prog.gcode).join());
  ok(/\[step 3\]/.test(nw.prog.gcode) && nw.prog.paths.length === 3 && nw.prog.paths[2].slot === 'finish2' && nw.prog.paths[2].data.length > 0, 'each strategy says which step it is, and has its own toolpath');
  const simA = new Sm.Sim(nw.job, nw.mb, Sm.parseProgram(nw.prog.gcode, nw.job));
  ok(simA.prog.ops.map((o) => o.step).join() === '1,2,3', 'Simulate knows each step: ' + simA.prog.ops.map((o) => o.step).join());

  // ---- a second roughing with a smaller tool, set to rest
  const twoR = setupJob(Object.assign({}, slot, { x_start: 62, x_end: 98 }));
  const L = twoR.setups[0].list, fin = L.pop();
  L.push(core.newStrategy('rough', { tool_number: 5, tool_dia: 3.175, stepdown: 1.5, pitch: 1.5, leave: 0.5, mode: 'rest', tool_desc: '1/8in flat end mill' }));
  L.push(fin);
  const r2 = await runNew(ocl, raw, twoR);
  ok(opsOf(r2.prog.gcode).join() === 'rough,rough,finish', 'two roughings, then finishing: ' + opsOf(r2.prog.gcode).join());
  const full = setupJob(Object.assign({}, slot, { x_start: 62, x_end: 98 }));
  full.setups[0].list = [core.newStrategy('rough', Object.assign({}, L[1], { mode: 'full', id: undefined }))];
  const rf = await runNew(ocl, raw, full);
  const n2 = r2.prog.paths[1].data.length / 4, nf = rf.prog.paths[0].data.length / 4;
  ok(n2 > 0 && n2 < nf * 0.6, `the rest roughing only goes where the first left something (${n2} points; ${nf} on its own)`);
  ok(r2.steps[1].title === 'Roughing 2', 'it is called Roughing 2');
  const sim2 = new Sm.Sim(r2.job, r2.mb, Sm.parseProgram(r2.prog.gcode, r2.job)); sim2.runTo(sim2.prog.count);
  const g2 = sim2.gouges();
  ok(g2.count === 0, `Simulate: nothing cut into the part (${g2.count} cells)`);

  // ---- two setups: each makes its own program
  const two = setupJob(saved);
  two.setups.push({ id: 'b', name: 'Ball only', list: [core.newStrategy('rough'), core.newStrategy('finish', { tool_number: 2, shape: 'ball', tool_dia: 3.175 })] });
  two.setup = 1;
  const r3 = await runNew(ocl, raw, two);
  ok(opsOf(r3.prog.gcode).join() === 'rough,finish' && /T2 D3\.175/.test(r3.prog.gcode), 'the second setup makes its own program: ' + opsOf(r3.prog.gcode).join());
  // no strategies: says so
  const none = setupJob(saved); none.setups[0].list = [];
  let msg = '';
  try { await core.runSetup(none, null, null, 'part', {}); } catch (e) { msg = e.message; }
  ok(/no strategies/.test(msg), 'an empty setup says to add a strategy');

  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
