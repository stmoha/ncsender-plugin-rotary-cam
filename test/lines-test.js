// node test/lines-test.js: Finishing along the part (Pattern: Along the part). One pass along X
// at each angle, there and back, A turning a stepover between the lines: the cut runs along
// the grain, and A goes round once. The turn between lines follows how wide the part is, so
// the lines are a stepover apart on the surface at the widest spot whatever the diameter.
globalThis.importScripts = () => {}; globalThis.self = globalThis;
const fs = require('fs'), path = require('path');
const core = require('../lib/cam-core.js'), worker = require('../lib/cam-worker.js'), OCL = require('../lib/ocl.js');
const { parseProgram, Sim } = require('../lib/cam-sim.js');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const near = (a, b, e) => Math.abs(a - b) <= (e === undefined ? 1e-6 : e);

// ---- the angles of the lines, from a map of how wide the part is at each calculated angle
{
  const job = core.prepareJob(core.deepMerge(core.DEFAULTS, { finish: { pattern: 'lines', pitch: 0.5 } }));
  const p = { nAng: 180, step: 2 }, flat = (r) => ({ finZ: Array.from({ length: 180 }, () => Float64Array.from([r, r - 1, NaN, r])) });
  const a20 = core.lineAngles(job, p, flat(20)), a10 = core.lineAngles(job, p, flat(10));
  const steps = (a) => a.map((v, i) => (i + 1 < a.length ? a[i + 1] : 360) - v);
  ok(near(a20.length, 2 * Math.PI * 20 / 0.5, 1.01) && near(a10.length, 2 * Math.PI * 10 / 0.5, 1.01), `a round part 40 across: ${a20.length} lines; 20 across: ${a10.length} (half as many: the same 0.5 mm apart on the surface)`);
  ok(steps(a20).every((d) => d > 0 && d * Math.PI / 180 * 20 <= 0.5 + 1e-9) && near(Math.max(...steps(a20)), Math.min(...steps(a20)), 1e-9), 'the lines are never further apart on the surface than the stepover, and the last gap back to the first is like the others');
  // wide one way, thin the other (a board 40 x 8): more lines across the wide faces' edges
  const board = { finZ: Array.from({ length: 180 }, (_, j) => { const t = j * 2 * Math.PI / 180, r = Math.min(20 / Math.abs(Math.cos(t) || 1e-9), 4 / Math.abs(Math.sin(t) || 1e-9)); return Float64Array.from([r, r]); }) };
  const ab = core.lineAngles(job, p, board), sb = steps(ab);
  const at = (deg) => sb[ab.findIndex((v) => v >= deg)];
  ok(at(90) > 3 * at(2) && ab.length < a20.length, `a board 40 x 8: A turns ${at(90).toFixed(2)}° between lines over its thin middle and ${at(2).toFixed(2)}° at its wide edges (${ab.length} lines, not the ${a20.length} of a round 40)`);
  ok(Math.max(...sb) <= 6 + 1e-9, 'never more than 6° between two lines, however thin the part');
  // there and back, and the turn at the ends no lower than either line
  const pts = core.linePoints([0, 1, 2], [0, 10, 20], [Float64Array.from([5, 6, 7]), Float64Array.from([4, 6, 9]), Float64Array.from([3, 3, 3])]);
  const want = [[0, 5, 0], [1, 6, 0], [2, 7, 0], [2, 9, 0], [2, 9, 10], [1, 6, 10], [0, 4, 10], [0, 4, 20], [0, 3, 20], [1, 3, 20], [2, 3, 20]];
  ok(JSON.stringify(pts) === JSON.stringify(want), 'there along one line and back along the next; at the end it lifts first, turns, then goes down: ' + JSON.stringify(pts.slice(2, 5)) + ' … ' + JSON.stringify(pts.slice(6, 9)));
}

(async () => {
  // ---- the coil (open down the middle), finished along the part
  const saved = JSON.parse(fs.readFileSync(path.join(__dirname, 'job-coil.json'), 'utf8'));
  saved.angle_step_deg = 4; saved.finish = Object.assign({}, saved.finish, { pattern: 'lines', pitch: 1.2 }); saved.rough = { pitch: 5 };
  const job = core.prepareJob(core.deepMerge(core.DEFAULTS, saved));
  core.migrateStart(job, saved);
  const buf = fs.readFileSync(path.join(__dirname, 'coil.stl'));
  const raw = core.parseSTL(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
  const mb = core.placeMesh(raw, job.model, core.chuckLead(job)), wm = core.workMesh(job, mb), p = core.plan(job, wm);
  ok(p.finDx > 0 && p.finDx <= 0.5 + 1e-9 && near(p.finLo + (p.finNrev + 1) * p.finDx, p.finHi, 1e-6), `the map's columns are an even ${p.finDx.toFixed(3)} mm apart along the part (${p.finNrev + 2} of them), the same at every angle`);
  const pSpiral = core.plan(core.prepareJob(core.deepMerge(job, { finish: { pattern: 'spiral' } })), wm);
  ok(pSpiral.finDx === undefined && pSpiral.finNrev === Math.floor((pSpiral.finHi - pSpiral.finLo) / 1.2 + 1e-9), 'Round the part is as it was: one column per turn');
  const ocl = await OCL(), cut = worker.makeCutters(ocl, job), rot = new Float32Array(wm.tris.length), maps = { roughZ: [], finZ: [] };
  for (let j = 0; j < p.nAng; j++) { const r = worker.computeAngle(ocl, wm.tris, rot, job, p, j, cut); maps.roughZ[j] = r.rough; maps.finZ[j] = r.fin; }
  ok(maps.finZ[3].length === p.finNrev + 2, 'each calculated angle has a height for every column');
  core.applyBelowAxis(job, p, maps);
  let groups0 = null;
  const probe = (groups) => { if (!groups0) groups0 = groups; return Promise.resolve(groups.map((g) => worker.probe(ocl, wm.tris, rot, job, p, g.a, g.xs, cut))); };
  const pts0 = await core.finishPath(job, p, maps, probe);
  const angs = groups0.map((g) => g.a);
  ok(maps.finLines === angs.length && angs.length > p.nAng && angs[0] === 0 && angs.every((a, i) => !i || a > angs[i - 1]) && angs[angs.length - 1] < 360, `${angs.length} lines, each dropped at its own angle (the ${p.nAng} calculated angles only bracket them), once round`);
  // every line: the same A from one end of the part to the other, alternately there and back
  const byA = new Map();
  pts0.forEach((q) => { if (!byA.has(q[2])) byA.set(q[2], []); byA.get(q[2]).push(q[0]); });
  let dirOk = true, i = 0;
  byA.forEach((xs) => { const lo = Math.min(...xs), hi = Math.max(...xs); if (!near(lo, p.finLo, 1e-6) || !near(hi, p.finHi, 1e-6)) dirOk = false; const inner = xs.filter((x, k) => !k || x !== xs[k - 1]); const fwd = inner[inner.length - 1] > inner[0]; if (fwd !== (i % 2 === 0)) dirOk = false; i++; });
  ok(byA.size === angs.length && dirOk, 'every line runs the whole length at one angle, there and back in turn');
  const rf = await core.refineFinish(job, pts0, probe, null, (a, x, z) => core.belowClamp(job, p, maps, a, x, z));
  maps.finPts = rf.pts; maps.finRefined = rf.added;
  ok(rf.added > 0 && rf.walls > 0, `sharp features are checked as for the spiral (${rf.added} points added; ${rf.walls} walls: up first, or along first)`);
  const logs = [], warns = [];
  const prog = core.buildProgram(job, p, maps, 'coil.stl', (s) => logs.push(s), (s) => warns.push(s), { paths: true });
  ok(logs.some((l) => new RegExp('finish: \\d+ points, ' + angs.length + ' lines along the part').test(l)) && prog.info.finish.lines === angs.length && prog.info.finish.turns === 0, 'the program says so: ' + (logs.find((l) => /^finish/.test(l)) || '').slice(0, 70));
  // in the program: finishing turns A once round, not once per stepover
  const pp = parseProgram(prog.gcode, job), fo = pp.ops.findIndex((o) => o.name === 'finish');
  let a0 = Infinity, a1 = -Infinity, alongX = 0, cuts = 0;
  for (let k = 1; k < pp.count; k++) {
    if (pp.op[k] !== fo || pp.type[k] === 0) continue;
    a0 = Math.min(a0, pp.a[k]); a1 = Math.max(a1, pp.a[k]); cuts++;
    if (pp.a[k] === pp.a[k - 1]) alongX++;
  }
  ok(a1 - a0 < 360 && a1 - a0 > 350 && alongX > 0.9 * cuts, `finishing turns A ${(a1 - a0).toFixed(1)}° in all, and ${(100 * alongX / cuts).toFixed(0)}% of its moves hold A still (along the grain)`);
  // and it cuts the part: nothing below the surface, no more left than the spiral leaves
  const sim = new Sim(job, mb, pp);
  sim.runTo(pp.count);
  const g = sim.gouges(0.1), hc = sim.holderCheck();
  let cells = 0, sum = 0;
  for (let q = 0; q < sim.r.length; q++) if (sim.pr[q] > 0) { cells++; sum += Math.max(0, sim.r[q] - sim.pr[q]); }
  ok(g.count === 0 && hc.count === 0, `simulated: nothing cut into the part (${g.count} cells, deepest ${g.worst.toFixed(3)} mm), the holder clear`);
  ok(sum / cells < 0.12, `what's left on the part: ${(sum / cells).toFixed(3)} mm on average`);
  // without its own drops (a caller that only has the map): a line along each calculated angle
  const m2 = { roughZ: maps.roughZ, finZ: maps.finZ, finFloor: maps.finFloor };
  const coarse = core.finishPoints(job, p, m2);
  ok(m2.finLines === p.nAng && coarse.length >= p.nAng * (p.finNrev + 2), 'finishPoints alone still gives a path: a line along each calculated angle');
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})();
