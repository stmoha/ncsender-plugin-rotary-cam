// node test/coil-test.js: a part open down the middle (test/coil.stl, test/make_coil.js).
// Roughing and finishing clear its core from past the axis; Simulate keeps that as a gap in
// each ray's stock, draws it, checks it for gouges and leaves it out of what's left, and
// keeps it through a rewind. The coil's edges are walls: finishing lifts before it turns
// up one (and turns before it goes down one) instead of clipping its corner.
globalThis.importScripts = () => {}; globalThis.self = globalThis;
const fs = require('fs'), path = require('path');
const core = require('../lib/cam-core.js'), worker = require('../lib/cam-worker.js'), OCL = require('../lib/ocl.js');
const { parseProgram, Sim } = require('../lib/cam-sim.js');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const saved = JSON.parse(fs.readFileSync(path.join(__dirname, 'job-coil.json'), 'utf8'));
  saved.angle_step_deg = 4; saved.finish = Object.assign({}, saved.finish, { pitch: 1.5 }); saved.rough = { pitch: 5 };
  const job = core.prepareJob(core.deepMerge(core.DEFAULTS, saved));
  core.migrateStart(job, saved);
  const buf = fs.readFileSync(path.join(__dirname, 'coil.stl'));
  const raw = core.parseSTL(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
  const mb = core.placeMesh(raw, job.model, core.chuckLead(job)), wm = core.workMesh(job, mb), p = core.plan(job, wm);
  const ocl = await OCL(), cut = worker.makeCutters(ocl, job), rot = new Float32Array(wm.tris.length), maps = { roughZ: [], finZ: [] };
  for (let j = 0; j < p.nAng; j++) { const r = worker.computeAngle(ocl, wm.tris, rot, job, p, j, cut); maps.roughZ[j] = r.rough; maps.finZ[j] = r.fin; }
  core.applyBelowAxis(job, p, maps);
  const rf = await core.refineFinish(job, core.finishPoints(job, p, maps), (groups) => Promise.resolve(groups.map((g) => worker.probe(ocl, wm.tris, rot, job, p, g.a, g.xs, cut))), null, (a, x, z) => core.belowClamp(job, p, maps, a, x, z));
  maps.finPts = rf.pts; maps.finRefined = rf.added;
  ok(rf.walls > 0, `finishing found walls it couldn't close by halving, and split them (${rf.walls}: up first, or along first)`);
  // every split: one of the two moves changes only Z (straight along the tool), the other only X and A
  let bad = 0;
  for (let k = 1; k + 1 < rf.pts.length; k++) {
    const a = rf.pts[k - 1], b = rf.pts[k], c = rf.pts[k + 1];
    const upFirst = a[0] === b[0] && a[2] === b[2] && b[1] === c[1] && c[1] > a[1] + 0.1;
    const alongFirst = a[1] === b[1] && b[0] === c[0] && b[2] === c[2] && c[1] < a[1] - 0.1;
    if ((upFirst || alongFirst) && !(Math.abs(c[2] - a[2]) < 1)) bad++;
  }
  ok(bad === 0, 'the splits are only at steps a hair of A wide');

  const prog = core.buildProgram(job, p, maps, 'coil', () => {}, () => {});
  const P = parseProgram(prog.gcode, job), sim = new Sim(job, mb, P);
  const t0 = Date.now();
  sim.runTo(P.count);
  const gaps = () => { let n = 0; for (let i = 0; i < sim.r.length; i++) if (sim.hasGap(i)) n++; return n; };
  const G = gaps();
  ok(G > 1000, `the core cut from past the axis is kept: ${G} rays with a gap under their stock (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  // the part's solid stretches along each ray, from which way each surface is crossed (a
  // gouge inside the stock is judged by them): they add up on nearly every ray
  let crossing = 0, known = 0;
  for (let i = 0; i < sim.r.length; i++) if (sim.hStart[i + 1] > sim.hStart[i]) { crossing++; if (sim.sStart[i + 1] > sim.sStart[i]) known++; }
  ok(known > 0.9 * crossing, `the part's solid stretches are worked out for ${(100 * known / crossing).toFixed(1)}% of the rays that cross it`);
  const g = sim.gouges(0.1);
  ok(g.count === 0, `nothing cut into the part, gaps included (${g.count} cells, deepest ${g.worst.toFixed(3)} mm)`);
  // what's left, with the gaps and as if every ray were solid from the axis out (the old model)
  const o = { minLeft: 0.25, xLo: mb.min[0], xHi: mb.max[0], cls: 3 };
  const now = sim.leftover(o).volume;
  const keep = [Float32Array.from(sim.pa), Float32Array.from(sim.pb)];
  sim.pa.fill(Infinity); sim.pb.fill(-Infinity);
  const solid = sim.leftover(o).volume;
  sim.pa.set(keep[0]); sim.pb.set(keep[1]);
  // in the core (inside 11 mm) next to nothing; what's left is against the coil's sides, where
  // a tool pointing at the axis only grazes (Indexed's job)
  const Lp = sim.leftover(o);
  let core0 = 0;
  for (let q = 0; q < Lp.n; q++) if (Math.hypot(Lp.y[q], Lp.z[q]) < 11) core0 += Lp.w[q];
  ok(now < 0.3 * solid && core0 < 0.05 * solid, `what's left leaves out the cleared core: ${now.toFixed(0)} mm3 (${core0.toFixed(0)} in the core), not ${solid.toFixed(0)} mm3 as if every ray were solid`);
  // drawn: the outside, then each gap's roof and floor; the roof at the coil's inside shows as the part
  const s = sim.surface(), N = sim.nx * sim.nth;
  ok(s.pos.length === (3 * N + sim.nx + 2) * 3 && s.count > 0 && s.count % 3 === 0, 'Simulate draws the outside, and each gap’s roof and floor (' + s.count / 3 + ' faces)');
  // no face from the axis out to the coil: every face of the outside joins rays that all have stock
  let fin = 0;
  for (let q = 0; q < s.count; q += 3) {
    const v = [s.index[q], s.index[q + 1], s.index[q + 2]];
    if (v.every((w) => w < N)) { const rs = v.map((w) => Math.hypot(s.pos[w * 3 + 1], s.pos[w * 3 + 2])); if (Math.min(...rs) < 0.06 && Math.max(...rs) > 15) fin++; }
  }
  ok(fin === 0, 'no sheet drawn from the axis out to the coil between a cleared ray and one with stock (' + fin + ')');
  let roofPart = 0;
  for (let i = 0; i < N; i++) {
    if (!sim.hasGap(i)) continue;
    const o3 = (N + i) * 3, rr = Math.hypot(s.pos[o3 + 1], s.pos[o3 + 2]);
    if (rr > 10 && rr < 13 && s.col[o3 + 2] > 0.8 && s.col[o3] < 0.6) roofPart++;
  }
  ok(roofPart > 200, `the coil's inside, seen from the core, shows as the part (${roofPart} roof points, blue, 11 mm out)`);
  // a rewind brings the gaps back from the checkpoints
  sim.runTo(Math.floor(P.count / 2)); sim.runTo(P.count);
  ok(Math.abs(gaps() - G) <= G * 0.01, `rewound to half way and played on: ${gaps()} rays with a gap (${G} before)`);

  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
