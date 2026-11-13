// Node test runner: same core + worker code the plugin uses, OpenCAMLib WASM in-process.
// usage: node test/run-node.js <part.stl|part.step> <job.json|-> <out.nc> [maps.json]
globalThis.importScripts = () => {}; globalThis.self = globalThis;
const fs = require('fs'), path = require('path');
const core = require('../lib/cam-core.js');
const worker = require('../lib/cam-worker.js');
const OCL = require('../lib/ocl.js');
(async () => {
  const [inFile, jobFile, outFile, mapsFile] = process.argv.slice(2);
  const saved = jobFile && jobFile !== '-' ? JSON.parse(fs.readFileSync(jobFile, 'utf8')) : {};
  const job = core.deepMerge(core.DEFAULTS, saved);
  if (!saved.stock && saved.stock_radius) job.stock = { shape: 'round', dia: 2 * saved.stock_radius, width: 2 * saved.stock_radius, height: 2 * saved.stock_radius };
  core.prepareJob(job);
  let raw;
  const buf = fs.readFileSync(inFile);
  if (/\.ste?p$/i.test(inFile)) {
    const occt = await require('../lib/occt-import-js.js')();
    const rr = core.trisFromOcct(occt.ReadStepFile(new Uint8Array(buf), { linearUnit: 'millimeter', linearDeflectionType: 'absolute_value', linearDeflection: 0.01, angularDeflection: 0.05 }));
    raw = rr.tris; console.log(`STEP: ${rr.solids} solid(s), ${rr.skipped} surface bodies skipped`);
  } else raw = core.parseSTL(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
  core.migrateStart(job, saved);   // Part starts at X includes the chuck end tenon (as in the plugin)
  const mb = core.placeMesh(raw, job.model, core.chuckLead(job));
  const stlOut = process.argv[6];
  if (stlOut) {
    const n = mb.tris.length / 9, b = Buffer.alloc(84 + n * 50);
    b.writeUInt32LE(n, 80);
    for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) b.writeFloatLE(mb.tris[i * 9 + k], 84 + i * 50 + 12 + 4 * k);
    fs.writeFileSync(stlOut, b);
  }
  console.log(`model: ${mb.count} tris, X ${mb.min[0].toFixed(2)}..${mb.max[0].toFixed(2)}, max radius ${mb.rmax.toFixed(2)}`);
  const probs = core.check(job, mb); if (probs.length) { console.log('PROBLEMS:', probs); process.exit(1); }
  const wm = core.workMesh(job, mb);
  if (wm.walls.length) console.log('uncut stock walls for the tapered tool: ' + wm.walls.map((w) => 'X' + w[0].toFixed(1) + '..' + w[1].toFixed(1)).join(', '));
  wm.tenons.forEach((t) => console.log(`tenon ${t.side}: D${(2 * t.r).toFixed(2)}, X ${t.x0.toFixed(2)}..${t.x1.toFixed(2)} (in the part ${t.in0.toFixed(2)}..${t.in1.toFixed(2)})`));
  fs.writeFileSync(outFile + '.tenons.json', JSON.stringify(wm.tenons));
  const p = core.plan(job, wm);
  const ocl = await OCL();
  const cutters = worker.makeCutters(ocl, job);
  const rot = new Float32Array(wm.tris.length);
  const maps = { roughZ: [], finZ: [] };
  const t0 = Date.now();
  for (let j = 0; j < p.nAng; j++) {
    const r = worker.computeAngle(ocl, wm.tris, rot, job, p, j, cutters);
    if (r.rough) maps.roughZ[j] = r.rough;
    if (r.fin) maps.finZ[j] = r.fin;
  }
  console.log(`drop-cutter: ${p.nAng} angles in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  if (job.finish.enabled && !process.argv.includes('--no-refine')) {
    const t1 = Date.now();
    const r = await core.refineFinish(job, core.finishPoints(job, p, maps), (groups) => Promise.resolve(groups.map((g) => worker.probe(ocl, wm.tris, rot, job, p, g.a, g.xs, cutters))),
      (round, segs, angles) => console.log(`  refine round ${round}: ${segs} segments at ${angles} angles`));
    maps.finPts = r.pts; maps.finRefined = r.added;
    console.log(`refined: +${r.added} points in ${r.rounds} rounds, worst deviation found ${r.worst.toFixed(4)} mm, ${((Date.now() - t1) / 1000).toFixed(1)} s`);
  }
  if (core.indexActive(job)) {
    const t2 = Date.now(), { parseProgram, Sim, indexLeftover } = require('../lib/cam-sim.js');
    const pre = core.buildProgram(job, p, maps, path.basename(inFile), () => {}, () => {}, { stopAfterFinish: true });
    const sim = new Sim(job, mb, parseProgram(pre.gcode, job));
    sim.runTo(sim.prog.count);
    const left = indexLeftover(sim, job, mb);
    console.log(`indexed: left after finishing ${left.volume.toFixed(0)} mm3 to clean, ${left.other.toFixed(0)} mm3 other, ${left.n} points (step ${left.s.toFixed(2)})`);
    const tPlan = Date.now();
    maps.indexed = await core.planIndexed(job, left,
      (groups) => Promise.resolve(groups.map((g) => (g.ball > 0 ? worker.dropBallXY(wm.tris, job, g.a, g.xy, g.ball) : worker.dropXY(ocl, wm.tris, rot, job, g.a, g.xy, cutters.index, core.cutterOf(job, 'index').maxR)))),
      (x, y, a) => sim.hullTop(x, y, a), (st) => { if (process.env.STEPS) console.log(`  ${((Date.now() - tPlan) / 1000).toFixed(1)} s ${st}`); }, p.indexLimits);
    console.log(`indexed planning: ${((Date.now() - tPlan) / 1000).toFixed(1)} s`);
    const ix = maps.indexed;
    if (process.argv.includes('--check-index')) {
      // every indexed point must be at or above a fresh drop at its X, Y
      let bad = 0, worst = 0, srcs = {};
      for (const g of ix.angles) {
        const all = []; g.passes.forEach((pts) => pts.forEach((q) => all.push(q)));
        const z = worker.dropXY(ocl, wm.tris, rot, job, g.a, Float64Array.from(all.flatMap((q) => [q[0], q[1]])), cutters.index, core.cutterOf(job, 'index').maxR);
        all.forEach((q, k) => { if (isFinite(z[k]) && z[k] - q[2] > 0.005) { bad++; worst = Math.max(worst, z[k] - q[2]); srcs[q.src] = (srcs[q.src] || 0) + 1; if (bad <= 5) console.log(`  low point A${g.a} X${q[0].toFixed(3)} Y${q[1].toFixed(3)} Z${q[2].toFixed(3)} drop ${z[k].toFixed(3)} from ${q.src}`); } });
      }
      // and none below the part's own outline at its Y (a tapered ball's cone resting on the
      // part's side lets the tip down far below the part: never cut there)
      let deep = 0, deepest = 0;
      const rm = left.rmax;
      ix.angles.forEach((g) => g.passes.forEach((pts) => pts.forEach((q) => {
        const lo = Math.abs(q[1]) < rm ? -Math.sqrt(rm * rm - q[1] * q[1]) - 0.06 : -Infinity;
        if (Math.abs(q[1]) < rm && q[2] < lo) { deep++; deepest = Math.min(deepest, q[2]); if (deep <= 5) console.log(`  under the part: A${g.a} X${q[0].toFixed(3)} Y${q[1].toFixed(3)} Z${q[2].toFixed(3)} (${q.src})`); }
        if (Math.abs(q[1]) >= rm && q[2] < -0.06) { deep++; deepest = Math.min(deepest, q[2]); if (deep <= 5) console.log(`  beside the part, below the axis: A${g.a} X${q[0].toFixed(3)} Y${q[1].toFixed(3)} Z${q[2].toFixed(3)} (${q.src})`); }
      })));
      console.log(`outline check: ${deep} points below the part's outline${deep ? ', deepest Z' + deepest.toFixed(2) : ''}`);
      if (process.env.NEAR) { const [nx, ny] = process.env.NEAR.split(',').map(Number); ix.angles.forEach((g) => g.passes.forEach((pts, pi) => pts.forEach((q, qi) => { if (Math.abs(q[0] - nx) < 0.004 && Math.abs(q[1] - ny) < 0.004) {
        console.log(`  near: A${g.a} pass ${pi} #${qi}/${pts.length} X${q[0].toFixed(4)} Y${q[1].toFixed(4)} Z${q[2].toFixed(4)} ${q.src} L=${pts.L}`);
        const ixj = job.index, cb = new ocl.BallCutter(ixj.tool_dia, 25), jit = [[0, 0], [1e-3, 0], [-1e-3, 0], [0, 1e-3], [0, -1e-3]];
        const xy = Float64Array.from(jit.flatMap((d) => [q[0] + d[0], q[1] + d[1]]));
        const zc = worker.dropXY(ocl, wm.tris, rot, job, g.a, xy, cutters.index, 1.6), zb = worker.dropXY(ocl, wm.tris, rot, job, g.a, xy, { c: cb }, 1.6);
        console.log('     tapered here and 1 um around: ' + Array.from(zc).map((v) => v.toFixed(3)).join(' ') + ' | plain ball: ' + Array.from(zb).map((v) => v.toFixed(3)).join(' '));
      } }))); }
      console.log(`index check: ${bad} points below a fresh drop, worst ${worst.toFixed(3)} mm, from ${JSON.stringify(srcs)}`);
    }
    if (ix.holder) console.log(`indexed: holder keeps it off ${ix.holder.volume.toFixed(0)} mm3 (needs up to ${ix.holder.need.toFixed(1)} mm more stickout)`);
    console.log(`indexed: A ${ix.angles.map((g) => g.a).join(', ') || '-'}; reaches ${ix.removed.toFixed(0)} of ${ix.target.toFixed(0)} mm3; missed ${JSON.stringify(ix.missed.map((m) => [m.x0, m.x1, +m.volume.toFixed(1)]))}; ${((Date.now() - t2) / 1000).toFixed(1)} s`);
    fs.writeFileSync(outFile + '.left.json', JSON.stringify({ n: left.n, x: Array.from(left.x), y: Array.from(left.y), z: Array.from(left.z), w: Array.from(left.w), target: Array.from(left.target), alive: Array.from(ix.alive) }));
    delete ix.alive;
  }
  const prog = core.buildProgram(job, p, maps, path.basename(inFile), s => console.log('  ' + s), s => console.log('  WARNING ' + s));
  fs.writeFileSync(outFile, prog.gcode);
  if (mapsFile) fs.writeFileSync(mapsFile, JSON.stringify({ angles: Array.from(p.angles), finLo: p.finLo, finHi: p.finHi, pitch: job.finish.pitch, finZ: maps.finZ.map(a => Array.from(a)) }));
  console.log(`wrote ${outFile}: ${prog.lines} lines, ~${prog.minutes.toFixed(1)} min, ${prog.limitedMoves} rate-limited, max A ${prog.maxA.toFixed(1)}`);
})().catch(e => { console.error(e); process.exit(1); });
