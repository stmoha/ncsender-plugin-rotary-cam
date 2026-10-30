// Simulates a program in Node: node test/sim-node.js program.nc placed.stl job.json
const fs = require('fs');
const core = require('../lib/cam-core.js');
const { parseProgram, Sim } = require('../lib/cam-sim.js');
const [nc, stl, jobf] = process.argv.slice(2);
const job = core.prepareJob(core.deepMerge(core.DEFAULTS, JSON.parse(fs.readFileSync(jobf, 'utf8'))));
const b = fs.readFileSync(stl), n = b.readUInt32LE(80), tris = new Float32Array(n * 9);
for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) tris[i * 9 + k] = b.readFloatLE(84 + i * 50 + 12 + 4 * k);
const mesh = { tris, count: n, min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
for (let i = 0; i < tris.length; i += 3) for (let k = 0; k < 3; k++) { mesh.min[k] = Math.min(mesh.min[k], tris[i + k]); mesh.max[k] = Math.max(mesh.max[k], tris[i + k]); }
let t0 = Date.now();
const prog = parseProgram(fs.readFileSync(nc, 'utf8'), job);
console.log(`parsed ${prog.count} moves, ${prog.ops.length} ops (${prog.ops.map((o) => o.name + ' ' + o.kind + ' D' + o.dia.toFixed(3)).join(', ')}), ${prog.total.toFixed(1)} min, ${Date.now() - t0} ms`);
t0 = Date.now();
const sim = new Sim(job, mesh, prog);
console.log(`grid ${sim.nx} x ${sim.nth} (dx ${sim.dx.toFixed(2)} mm), envelope ${Date.now() - t0} ms`);
t0 = Date.now();
const rapids = [];
const perOp = {};
let k = 0;
for (let o = 0; o < prog.ops.length; o++) {
  let end = k; while (end < prog.count && prog.op[end] <= o) end++;
  sim.runTo(end, (i, rm) => rapids.push([prog.line[i] + 1, rm]));
  const g = sim.gouges();
  perOp[prog.ops[o].name] = g;
  console.log(`  after ${prog.ops[o].name}: ${Date.now() - t0} ms, cells below part >0.1 mm: ${g.count} (deepest ${g.worst.toFixed(3)} at X${g.x === null ? '-' : g.x.toFixed(1)})`);
  k = end;
}
let left = 0, cells = 0, sum = 0;
for (let i = 0; i < sim.r.length; i++) if (sim.pr[i] > 0) { cells++; const d = sim.r[i] - sim.pr[i]; if (d > 0.5) left++; sum += Math.max(0, d); }
const tc = sim.tenonCheck(0.1);
console.log(`tenons ${tc.sides.join(' + ') || 'none'}: cells cut into >0.1 mm: ${tc.count}${tc.count ? ' (deepest ' + tc.worst.toFixed(3) + ' at X' + tc.x.toFixed(1) + ', ' + tc.side + ')' : ''}`);
const hc = sim.holderCheck();
console.log(`holder hits: ${hc.count}${hc.count ? ' worst ' + hc.worst.toFixed(2) + ' mm (' + hc.comp + ' into the ' + hc.what + ', ' + hc.op + ', line ' + hc.line + ', X' + hc.x.toFixed(1) + '), first at line ' + hc.first : ''}`);
console.log(`rapids that cut stock: ${rapids.length}${rapids.length ? ' first at line ' + rapids[0][0] + ' (' + rapids[0][1].toFixed(2) + ' mm)' : ''}`);
console.log(`over the part: ${cells} cells, ${(100 * left / cells).toFixed(1)}% with more than 0.5 mm left, mean left ${(sum / cells).toFixed(3)} mm`);
// scrub back and forth
t0 = Date.now(); sim.runTo(Math.floor(prog.count / 3)); sim.runTo(Math.floor(prog.count / 2)); sim.runTo(10);
console.log(`scrub back/forth: ${Date.now() - t0} ms; checkpoints ${sim.checkpoints.length}`);
