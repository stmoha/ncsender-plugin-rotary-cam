const fs = require('fs');
const core = require('../lib/cam-core.js');
const { parseProgram, Sim } = require('../lib/cam-sim.js');
const [nc, stl, jobf] = process.argv.slice(2);
const job = core.prepareJob(core.deepMerge(core.DEFAULTS, JSON.parse(fs.readFileSync(jobf, 'utf8'))));
const b = fs.readFileSync(stl), n = b.readUInt32LE(80), tris = new Float32Array(n * 9);
for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) tris[i * 9 + k] = b.readFloatLE(84 + i * 50 + 12 + 4 * k);
const mesh = { tris, count: n, min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
for (let i = 0; i < tris.length; i += 3) for (let k = 0; k < 3; k++) { mesh.min[k] = Math.min(mesh.min[k], tris[i + k]); mesh.max[k] = Math.max(mesh.max[k], tris[i + k]); }
const prog = parseProgram(fs.readFileSync(nc, 'utf8'), job);
const sim = new Sim(job, mesh, prog);
// find the bad cells at the end, then replay and record which move took each below the part
sim.runTo(prog.count);
const bad = [];
for (let i = 0; i < sim.r.length; i++) if (sim.pr[i] > 0 && sim.pr[i] - sim.r[i] > 0.05) bad.push(i);
const out = [];
for (const idx of bad) {
  const ii = Math.floor(idx / sim.nth), j = idx % sim.nth;
  out.push({ idx, x: +(sim.x0 + ii * sim.dx).toFixed(2), thetaDeg: j * 360 / sim.nth, r: +sim.r[idx].toFixed(3), pr: +sim.pr[idx].toFixed(3) });
}
sim.reset();
const first = {};
for (let k = 0; k < prog.count; k++) {
  sim.runTo(k + 1);
  for (const o of out) if (!first[o.idx] && sim.r[o.idx] < sim.pr[o.idx] - 0.05) first[o.idx] = { k, line: prog.line[k] + 1, text: prog.lines[prog.line[k]], op: prog.ops[prog.op[k]].name, prev: prog.lines[prog.line[k - 1]] };
  if (Object.keys(first).length === out.length) break;
}
out.forEach((o) => console.log(JSON.stringify(o), JSON.stringify(first[o.idx])));
fs.writeFileSync('/tmp/claude-0/-home-claude/ea883aa1-4adb-5cfb-8ab9-8660bae84f4e/scratchpad/badcells.json', JSON.stringify(out));
