// ncSender Pro's keep-out zones: the two Rotary CAM keeps there, the program check against
// every zone, and tool change routes that go round other zones. node test/zones-test.js
const core = require('../lib/cam-core.js');
let fails = 0;
const ok = (c, what) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + what); };
const near = (a, b) => Math.abs(a - b) < 1e-6;
// X0 on the jaw face for the first checks; X0 in front of it (the default since 0.14.0) below
const job = (over = {}) => core.prepareJob(core.deepMerge(core.deepMerge(core.DEFAULTS, { rig: { x0_ahead: 0 } }), over));
const jobAhead = (over = {}) => core.prepareJob(core.deepMerge(core.DEFAULTS, over));

// the boxes, from the setup (defaults: chuck D100 x 45, headstock 110 long, 55 each side;
// live centre D30 x 28, tailstock 90 long, 35 each side; stock end at X245; margin 10)
{
  const j = job();
  const [h, t] = core.zoneBoxes(j);
  ok(h.id === 'rotary-cam:headstock' && near(h.x0, -45 - 110 - 10) && near(h.x1, -0.1) && near(h.y0, -65) && near(h.y1, 65),
    `headstock and chuck: X${h.x0}..${h.x1} Y${h.y0}..${h.y1} (to 0.1 mm short of the jaw face, no margin on the part's side)`);
  ok(t.id === 'rotary-cam:tailstock' && near(t.x0, 245.1) && near(t.x1, 245 + 28 + 90 + 10) && near(t.y0, -45) && near(t.y1, 45),
    `live centre and tailstock: X${t.x0}..${t.x1} Y${t.y0}..${t.y1} (from 0.1 mm past the end of the stock)`);
  const j2 = job({ tailstock_x: 300, keepout: { margin: 0 }, rig: { chuck: { dia: 160 }, head: { front: 40, back: 120 } } });
  const [h2, t2] = core.zoneBoxes(j2);
  ok(near(h2.y0, -80) && near(h2.y1, 120) && near(h2.x0, -155) && near(t2.x0, 300.1), 'a chuck wider than the headstock and a longer stock: the zones follow');
  const zs = core.zonesFor(j, { x: -300, y: -200 }, 'com.cncdocs.rotary-cam');
  ok(zs.length === 2 && zs[0].kind === 'keepout' && zs[0].enabled === true && near(zs[0].minX, -465) && near(zs[0].maxX, -300.1) && near(zs[0].minY, -265) && near(zs[0].maxY, -135) && zs[0].source === 'com.cncdocs.rotary-cam',
    `in ncSender's terms, machine coordinates: ${JSON.stringify(zs[0])}`);
}

// the program check: the tool's centre in XY, work coordinates through the zero, G53 in machine
{
  const at = { x: -300, y: -200 };
  const zones = [
    { id: 'a', name: 'ATC Zone', enabled: true, minX: -600, minY: -600, maxX: -500, maxY: -400 },
    { id: 'b', name: 'Clamp', enabled: false, minX: -300, minY: -210, maxX: -200, maxY: -190 }
  ];
  const g = ['G21 G90', 'G0 X50 Y0', 'G1 X100 Y0 F1000', 'G0 X-250 Y-300', 'G0 X50 Y0'].join('\n');
  const h = core.programZoneHits(g, zones, at);
  ok(h.length === 1 && h[0].name === 'ATC Zone' && h[0].line === 4, `a move through a zone: ${JSON.stringify(h)} (a zone that's off doesn't count)`);
  ok(core.programZoneHits('G21\nG0 X50 Y0\nG0 X-150 Y0', zones, at).length === 0, 'moves that miss every zone: nothing');
  const gi = ['G20 G90', 'G0 X2 Y0', 'G0 X-10 Y-6'].join('\n');   // -10in, -6in: X-554 Y-352.4 machine
  ok(core.programZoneHits(gi, zones, at).length === 0, 'inches: X-10 Y-6 stays out (Y -352 is outside -600..-400)');
  ok(core.programZoneHits(['G20', 'G0 X2 Y0', 'G0 X-10 Y-10'].join('\n'), zones, at).length === 1, 'inches: X-10 Y-10 goes in');
  ok(core.programZoneHits(['G21', 'G0 X50 Y0', 'G53 G0 X-550 Y-500'].join('\n'), zones, at).length === 1, 'G53 X Y are machine coordinates');
  ok(core.programZoneHits(['G21', 'G0 X50 Y0', 'G53 G0 Z-5', 'G0 X60'].join('\n'), zones, at).length === 0, 'G53 Z alone moves nothing in XY');
}

// ncSender draws a program from work X0 Y0 (the jaw face on the axis) before its first move.
// 0.14.0's first test build ended the headstock zone at the jaw face, and with the work offset
// rounded it reached a hair past X0: ncSender said the program crossed it (it starts
// G0 Z / G0 Y0 / M6, no X until later). The zone now stops short, and the check starts at X0 Y0.
{
  const at = { x: -870.3586, y: -847.4818 };    // a work offset that came from inches
  const g = ['G20 G90 G17 G94', 'G0 Z1.3107', 'G0 Y0.0000', 'M6 T1', 'G0 A-45.000', 'G0 X1.1669', 'G0 Y0.2628', 'G1 X4.8699 F78.7'].join('\n');
  const old = [{ id: 'rotary-cam:headstock', name: 'Rotary headstock', enabled: true, minX: at.x - 165, minY: at.y - 65, maxX: Math.round(at.x * 1000 + 0.6) / 1000, maxY: at.y + 65 }];
  const hOld = core.programZoneHits(g, old, at);
  ok(hOld.length === 1 && hOld[0].line === 3, `a zone reaching just past X0: flagged from the start, as ncSender does (line ${hOld[0] && hOld[0].line})`);
  const now = core.zonesFor(job(), at, 'x');
  ok(core.programZoneHits(g, now, at).length === 0, `Rotary CAM's zones now (headstock to X${(now[0].maxX - at.x).toFixed(3)}): not crossed`);
}

// tool change routes go round other zones too, unless the change position or setter is in one
{
  const zero = { x: -300, y: -200, z: -80 };
  const tc = { route: true, zero, change: { x: -560, y: -200 }, setter: null, zsafe: -5 };
  const plain = core.tcPlan(job({ rig: { tc } }));
  const fence = { id: 'f', name: 'Vise', enabled: true, minX: -520, minY: -300, maxX: -480, maxY: -100 };   // straight across the way in
  const pl = core.tcPlan(job({ rig: { tc: Object.assign({}, tc, { zones: [fence] }) } }));
  const r = pl.rects.find((x) => x.zone);
  const path = core.routeXY({ x: 120, y: 0 }, pl.info.change, pl.rects, pl.info.lim);
  const crosses = (p, rr) => p.some((q, i) => i && rr.some((x) => core.segHitsRect(p[i - 1].x, p[i - 1].y, q.x, q.y, x)));
  ok(r && r.name === 'Vise' && near(r.x0, -220) && !plain.rects.some((x) => x.zone), 'another zone is in the route’s way (work coordinates)');
  ok(path && !path.blocked && !crosses(path, pl.rects), `the route goes round it (${path.length - 2} waypoints)`);
  const atc = { id: 'atc', name: 'ATC Zone', enabled: true, minX: -600, minY: -250, maxX: -540, maxY: -150 };   // round the change position
  const pa = core.tcPlan(job({ rig: { tc: Object.assign({}, tc, { zones: [atc] }) } }));
  ok(!pa.rects.some((x) => x.zone) && !pa.notes.some((n) => /ATC/.test(n)), 'a zone round the tool change position (an ATC) is left to its owner');
  const pz = core.routeXY({ x: 120, y: 0 }, { x: -260, y: 0 }, [{ name: 'Rotary', zone: true, x0: 100, x1: 200, y0: -50, y1: 50 }], null);
  ok(pz && !pz.blocked, 'a zone the move starts in is skipped, not reported as blocking');
}

// a whole program with tool changes routed round the rotary stays out of its own zones
{
  const zero = { x: -300, y: -200, z: -80 };
  const tc = { route: true, zero, change: { x: -560, y: -380 }, setter: { x: -400, y: -100 }, zsafe: -5 };
  const j = job({ rig: { tc }, units: 'mm' });
  const mb = { min: [15, -10, -10], max: [85, 10, 10], rmax: 14, ends: { lo: true, hi: true }, tris: new Float32Array(0), solid: new Float32Array(0) };
  const p = core.plan(j, core.workMesh(j, mb));
  const maps = { roughZ: Array.from({ length: p.nAng }, () => new Float64Array(p.roughX.length).fill(10)), finZ: Array.from({ length: p.nAng }, () => new Float64Array(p.finNrev + 2).fill(10)) };
  const prog = core.buildProgram(j, p, maps, 'cyl', () => {}, () => {});
  const hits = core.programZoneHits(prog.gcode, core.zonesFor(j, zero, 'x'), zero);
  ok(/M6 T/.test(prog.gcode) && hits.length === 0, `roughing, finishing and two routed tool changes: no crossing of Rotary CAM's own zones ${JSON.stringify(hits)}`);
}
// X0 5/16" in front of the jaw face (the default): the headstock zone reaches to 0.1 mm short
// of X0, programs and tool change positions are in X0's terms, no cut comes closer to the
// jaws than X0 + 0.1 mm, the simulator reads the program back to the jaw face, and the
// probe and a corner set X0 out there
{
  const A = 7.9375, zero = { x: -300, y: -200, z: -80 };
  const j = jobAhead({ rig: { tc: { route: true, zero, change: { x: -560, y: -380 }, setter: null, zsafe: -5 } }, units: 'mm' });
  ok(near(core.x0Ahead(j), A) && near(core.DEFAULTS.rig.x0_ahead, A), 'the default: X0 is 5/16" (7.9375 mm) in front of the jaw face');
  const [h] = core.zoneBoxes(j);
  ok(near(h.x1, A - 0.1), `the headstock zone reaches to 0.1 mm short of X0 (${h.x1.toFixed(4)} mm from the jaw face): a jog stops a 1/2" bit's edge ${(h.x1 - 6.35).toFixed(2)} mm off the jaws`);
  const zs = core.zonesFor(j, zero, 'x');
  ok(near(zs[0].maxX, -300.1), `in machine terms it ends 0.1 mm short of G54 X (${zs[0].maxX})`);
  ok(near(core.chuckKeep(j), A + 0.1) && near(core.chuckKeep(jobAhead({ chuck_clearance: 12 })), 12), 'Keep away from the jaws is at least X0 + 0.1 mm (more stays more)');
  const mb = { min: [15, -10, -10], max: [85, 10, 10], rmax: 14, ends: { lo: true, hi: true }, tris: new Float32Array(0), solid: new Float32Array(0) };
  const p = core.plan(j, core.workMesh(j, mb));
  const maps = { roughZ: Array.from({ length: p.nAng }, () => new Float64Array(p.roughX.length).fill(10)), finZ: Array.from({ length: p.nAng }, () => new Float64Array(p.finNrev + 2).fill(10)) };
  const prog = core.buildProgram(j, p, maps, 'cyl', () => {}, () => {});
  const g = prog.gcode, L = g.split('\n');
  const xs = L.filter((l) => /^G1 /.test(l)).map((l) => l.match(/X(-?[\d.]+)/)).filter(Boolean).map((m) => Number(m[1]));
  ok(/\(Work zero: X0 = 7\.938 mm in front of the chuck jaw face \[x0 ahead 7\.9375 mm\]/.test(g), 'the header says where X0 is');
  ok(Math.min(...xs) >= 0.1 - 1e-9, `no X in the program below X0.1 (lowest X${Math.min(...xs)})`);
  const m6 = L.findIndex((l) => /^M6 /.test(l)), lastXY = L.slice(0, m6).reverse().find((x) => /^G0 X/.test(x));
  ok(/X-260\.000 Y-180\.000/.test(lastXY), `the tool change position is still G54 X-260 Y-180 (machine -560, -380): ${lastXY}`);
  ok(core.programZoneHits(g, zs, zero).length === 0, 'and the program, from X0 Y0, stays out of both zones');
  const sim = require('../lib/cam-sim.js'), pr = sim.parseProgram(g, j), p0 = sim.parseProgram(g.replace(/\[x0 ahead [\d.]+ mm\]/, ''), j);
  let mn = Infinity; for (let i = 0; i < pr.count; i++) if (pr.type[i] === 1) mn = Math.min(mn, pr.x[i]);
  if (!near(pr.x[pr.count - 1] - p0.x[p0.count - 1], A, 1e-6)) console.log('  sim', pr.count, p0.count, pr.x[pr.count - 1], p0.x[p0.count - 1]);
  ok(near(pr.x[pr.count - 1] - p0.x[p0.count - 1], A, 1e-6) && mn >= A + 0.1 - 1e-6, `the simulator reads it back to the jaw face (cuts no closer than ${mn.toFixed(3)} mm from it)`);
  const IN = 25.4, corner = { x: -43.0984 * IN, y: -43.7339 * IN, z: -0.9649 * IN };
  const cz = core.cornerZero(jobAhead({ rig: { corner: { dx: 4.6023 * IN, dy: 1.4142 * IN, dz: -1.3826 * IN } } }), corner);
  ok(near(cz.to.x, -38.4961 * IN + A, 1e-6), 'zeroed from a corner: X0 goes 5/16" in front of the jaw face');
}
console.log(fails ? fails + ' FAILED' : 'ALL PASS');
process.exitCode = fails ? 1 : 0;
