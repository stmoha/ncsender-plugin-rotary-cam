// Tool changes round the rotary: the router and what the program does with it.
// node test/route-test.js
const core = require('../lib/cam-core.js');
let fails = 0;
const ok = (c, what) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + what); };
const job = (tc, over = {}) => core.prepareJob(core.deepMerge(core.DEFAULTS, Object.assign({ rig: { tc } }, over)));
const crosses = (path, rects) => path.some((p, i) => i && rects.some((r) => core.segHitsRect(path[i - 1].x, path[i - 1].y, p.x, p.y, r)));
const len = (path) => path.reduce((a, p, i) => a + (i ? Math.hypot(p.x - path[i - 1].x, p.y - path[i - 1].y) : 0), 0);

// rotary zero (chuck jaw face on the axis) at machine X-300 Y-200
const zero = { x: -300, y: -200, z: -80 };
const from = { x: 120, y: 0 };      // over the part
const cases = [
  ['change in front, left of the headstock', { x: -560, y: -380 }],
  ['change straight left, in line with the rotary', { x: -560, y: -200 }],
  ['change straight right, past the tailstock', { x: 200, y: -200 }],
  ['change behind the rotary', { x: -100, y: 0 }],
  ['change in front, over the part', { x: -180, y: -380 }]
];
cases.forEach(([what, ch]) => {
  const j = job({ route: true, zero, change: ch, setter: null, zsafe: -5 });
  const info = core.tcInfo(j), rects = core.tcObstacles(j);
  const path = core.routeXY(from, info.change, rects, info.lim);
  const straight = !rects.some((r) => core.segHitsRect(from.x, from.y, info.change.x, info.change.y, r));
  ok(path && !path.blocked && !crosses(path, rects) && Math.abs(path[path.length - 1].x - info.change.x) < 1e-9, `${what}: ${path.length - 2} waypoint(s), ${len(path).toFixed(0)} mm, clear of ${rects.map((r) => r.name).join(', ')}${straight ? ' (straight line was clear too)' : ' (the straight line would cross)'}`);
});
// inside the footprint
{
  const j = job({ route: true, zero, change: { x: -330, y: -200 } });
  const r = core.routeXY(from, core.tcInfo(j).change, core.tcObstacles(j), null);
  ok(r && r.blocked === 'chuck' && r.at === 'to', 'a change position over the chuck is reported, not routed through');
}
// machine travel that leaves no room in front: it has to go round the back
{
  const lim = { x: [-800, 0], y: [-260, 0] };    // the rotary sits near the front of the travel
  const j = job({ route: true, zero, change: { x: -560, y: -250 }, limits: lim });
  const info = core.tcInfo(j), rects = core.tcObstacles(j), path = core.routeXY(from, info.change, rects, info.lim);
  const inLim = path && !path.blocked && path.every((p) => p.x + zero.x >= -800 - 1e-6 && p.x + zero.x <= 1e-6 && p.y + zero.y >= -260 - 1e-6 && p.y + zero.y <= 1e-6);
  ok(path && !path.blocked && !crosses(path, rects) && inLim && path.some((p) => p.y > 0), `machine travel too tight in front: it goes round the back (${path && path.length - 2} waypoints), inside the travel`);
}
{
  const lim = { x: [-800, 0], y: [-260, -140] };   // no room either side of the rotary at all
  const j = job({ route: true, zero, change: { x: -560, y: -250 }, limits: lim });
  const info = core.tcInfo(j), path = core.routeXY(from, info.change, core.tcObstacles(j), info.lim);
  ok(path === null, 'no way round inside the travel: says so (null)');
}
// the program: up to safe Z, round, M6 at the change position, back the same way
{
  const tc = { route: true, zero, change: { x: -560, y: -380 }, setter: { x: -400, y: -100 }, zsafe: -5 };
  const j = job(tc, { units: 'mm' });
  const mb = { min: [15, -10, -10], max: [85, 10, 10], rmax: 14, ends: { lo: true, hi: true }, tris: new Float32Array(0), solid: new Float32Array(0) };
  const p = core.plan(j, core.workMesh(j, mb));
  // fake drop maps: a plain cylinder of radius 10
  const maps = { roughZ: Array.from({ length: p.nAng }, () => new Float64Array(p.roughX.length).fill(10)), finZ: Array.from({ length: p.nAng }, () => new Float64Array(p.finNrev + 2).fill(10)) };
  const warns = [];
  const prog = core.buildProgram(j, p, maps, 'cyl', () => {}, (w) => warns.push(w), { paths: true });
  const L = prog.gcode.split('\n');
  const m6 = L.map((l, i) => [l, i]).filter(([l]) => /^M6 /.test(l));
  ok(m6.length === 2, `two M6 (roughing, finishing): ${m6.map(([l]) => l).join(', ')}`);
  m6.forEach(([l, i]) => {
    const before = L.slice(Math.max(0, i - 8), i).join(' | '), after = L.slice(i + 1, i + 8).join(' | ');
    const up = L.slice(0, i).reverse().find((x) => /^G53 G0 Z/.test(x) || /^G0 .*Z/.test(x));
    ok(/^G53 G0 Z-5\.000/.test(up), `${l}: goes up with G53 G0 Z-5 first`);
    const lastXY = L.slice(0, i).reverse().find((x) => /^G0 X.*Y|^G0 Y|^G0 X/.test(x));
    ok(/X-260\.000 Y-180\.000/.test(lastXY), `${l}: the M6 is at the change position (work X-260 Y-180): ${lastXY}`);
  });
  ok(/G53 G0 Z-5\.000\n\(Start: up to safe Z, then over the part\)\nG0 X50\.000 Y0\.000/.test(prog.gcode), 'the job starts by going up and over the part, X and Y both said');
  ok(prog.toolChanges && prog.toolChanges.count === 2 && prog.toolChanges.paths.every((pt) => !crosses(pt.map(([x, y]) => ({ x, y })), core.tcObstacles(j))), 'both routes go round the rotary');
  ok(/Tool changes go round the rotary: rotary zero \[G54\] was at machine X-300\.000 Y-200\.000, tool change at X-560\.000 Y-380\.000/.test(prog.gcode), 'the header says where it assumed the rotary and change position were');
  ok(warns.some((w) => /tool setter passes over the headstock/.test(w)), 'ncSender’s own change -> setter move over the headstock is flagged: ' + (warns.find((w) => /setter/.test(w)) || '').slice(0, 90));
  // the simulator and parser take the G53 lines
  const sim = require('../lib/cam-sim.js');
  const pr = sim.parseProgram(prog.gcode, j);
  ok(pr.count > 0 && Number.isFinite(pr.total), `the simulator reads it (${pr.count} moves)`);
  // inch program: G53 Z in inches
  const ji = job(tc, { units: 'in' });
  const pi = core.plan(ji, core.workMesh(ji, mb));
  const gi = core.buildProgram(ji, pi, maps, 'cyl', () => {}, () => {}).gcode;
  ok(/G53 G0 Z-0\.1969/.test(gi), 'inch program: G53 G0 Z-0.1969 (5 mm)');
  // M0 tool changes and route off: plain behaviour
  const j0 = job(Object.assign({}, tc, { route: false }));
  const g0 = core.buildProgram(j0, core.plan(j0, core.workMesh(j0, mb)), maps, 'cyl', () => {}, () => {}).gcode;
  ok(!/G53/.test(g0) && /M6 T/.test(g0), 'route off: no G53, plain M6');
}
console.log(fails ? fails + ' FAILED' : 'ALL PASS');
process.exitCode = fails ? 1 : 0;
