// node test/ztravel-test.js: programs stay inside the Z travel. Nothing above machine Z0 (or
// below the bottom) with the work offset ncSender loads them against; a tool that can't clear
// the stock stops Generate; what the travel cost is reported.
globalThis.importScripts = () => {}; globalThis.self = globalThis;
const core = require('../lib/cam-core.js'), worker = require('../lib/cam-worker.js'), OCL = require('../lib/ocl.js');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const fresh = (o) => core.prepareJob(core.deepMerge(core.DEFAULTS, o || {}));
// every Z the program commands (G53 lines are machine coordinates: ncSender skips them too)
function zs(gcode) {
  let inch = false, z = null; const out = [];
  gcode.split('\n').forEach((l) => {
    const c = l.replace(/\(.*?\)/g, '').trim();
    if (!c || /G53/.test(c)) return;
    if (/\bG20\b/.test(c)) inch = true;
    const m = c.match(/\bZ(-?[\d.]+)/);
    if (m && /^G[01]\b/.test(c)) { z = Number(m[1]) * (inch ? 25.4 : 1); out.push(z); }
  });
  return out;
}
(async () => {
  // ---- the room each operation has
  let job = fresh({ stock: { dia: 44 }, index: { enabled: true, stickout: 40 }, rig: { tc: { ztop: 30, zbot: -60, zso: null } } });
  let zr = core.zRoom(job, 'rough');
  ok(Math.abs(zr.top - 29.5) < 1e-9 && zr.d === 0, 'the first tool (roughing, 31 mm) has the top of Z less 0.5 mm: 29.5 above the axis');
  zr = core.zRoom(job, 'index');
  ok(Math.abs(zr.top - (30 - 9 - 0.5)) < 1e-9 && Math.abs(zr.d - 9) < 1e-9, 'Indexed sticks out 9 mm more: its tip can only reach 20.5');
  zr = core.zRoom(job, 'finish');
  ok(Math.abs(zr.top - 29.5) < 1e-9 && Math.abs(zr.bottom - (-60 + 3 + 0.5)) < 1e-9, 'finishing sticks out 3 mm less: same top, 3 mm less reach down');
  job.rig.tc.zso = 40;
  ok(Math.abs(core.zRoom(job, 'index').top - 29.5) < 1e-9, 'with the 40 mm tool in the spindle, that one gets the full room');
  ok(core.zRoom(fresh(), 'rough') === null, 'nothing known about the machine: no limit');

  // ---- a tool that can't clear the stock stops Generate
  const raw = core.cylinderTris(0, 60, 15, 48);
  job = fresh({ stock: { dia: 44 }, index: { enabled: true, stickout: 40 }, rig: { tc: { ztop: 30, zbot: -60 } } });
  let mb = core.placeMesh(raw, job.model);
  let probs = core.check(job, mb);
  let zp = probs.filter((p) => /Z travel/.test(p));
  ok(zp.length === 1 && /^Z travel: .*stick out at most 37\.50 mm/.test(zp[0]) && /stock, which reaches 22\.00 mm/.test(zp[0]) && /\nToo long: Indexed T3 \(40\.00 mm\) by 2\.50 mm\./.test(zp[0]) && !/Roughing T/.test(zp[0]), 'Indexed with 40 mm stickout can’t clear 44 mm stock under a 30 mm top; up to 37.5 mm would (the 31 mm roughing tool in, its nose 61 mm up): ' + (zp[0] || '(none)').split('\n').slice(0, 2).join(' / '));
  ok(/taken to be the tool in the spindle because ncSender didn.t say which tool is in/.test(zp[0]) && /tip 30\.00 mm above the rotary axis/.test(zp[0]) && /spindle nose is 61\.00 mm above/.test(zp[0]), 'it says what it took to be in the spindle, and where that puts the spindle');
  ok(/ncSender.s Z should read about 30\.00 mm, and the tool tip should be about 8\.00 mm above the top of the stock/.test(zp[0]), 'and how to check that on the machine');
  job.index.stickout = 18;
  ok(!core.check(job, mb).some((p) => /Z travel/.test(p)), 'with 18 mm stickout it fits');
  // ncSender names a tool that isn't here: still the first tool, said so
  job.index.stickout = 40; job.rig.tc.ztool = 9;
  ok(/ncSender says T9 is in but its stickout isn.t known/.test(core.check(job, mb).find((p) => /Z travel/.test(p))), 'ncSender names a tool with no stickout known: it says so');
  // typed in: that tool, that stickout
  job.rig.tc.zso = 20; job.rig.tc.typed = { zso: true };
  zp = core.check(job, mb).filter((p) => /Z travel/.test(p));
  ok(zp.length === 1 && /at most 26\.50 mm/.test(zp[0]) && /The tool in the spindle when the program is loaded has to be short enough too/.test(zp[0]) === false && /as typed under Tool changes/.test(zp[0]) && /Too long: Roughing T1 \(31\.00 mm\) by 4\.50 mm, Finishing T2 \(28\.00 mm\) by 1\.50 mm, Indexed T3 \(40\.00 mm\) by 13\.50 mm\./.test(zp[0]), 'a 20 mm tool typed in as the one in the spindle: everything longer than 26.5 mm is too long: ' + (zp[0] || '').split('\n')[1]);
  delete job.rig.tc.typed; job.rig.tc.zso = null; job.rig.tc.ztool = null;

  // ---- the user's setup: 1.5 in square, T4 1.75 in (and 3 in for roughing), the tip 1.037 in up
  const IN = 25.4, Lin = (v) => (v / IN).toFixed(3) + ' in';
  const u = fresh({ units: 'in', stock: { shape: 'square', width: 1.5 * IN }, corners: { enabled: true, tool_number: 4, tool_dia: 6.35, stickout: 1.75 * IN },
    rough: { tool_number: 4, tool_dia: 6.35, stickout: 3 * IN }, finish: { tool_number: 13, stickout: 1.5 * IN }, index: { enabled: true, tool_number: 12, stickout: 1.75 * IN },
    parting: { enabled: true, tool_number: 4, tool_dia: 6.35, stickout: 1.75 * IN }, rig: { tc: { ztop: 1.037 * IN, zbot: -3 * IN } } });
  const up = core.check(u, mb, Lin);
  zp = up.filter((p) => /Z travel/.test(p));
  ok(zp.length === 1, 'one Z travel message, not one per operation (' + zp.length + ')');
  ok(/at most 1\.667 in/.test(zp[0]) && /Too long: Corners T4 \(1\.750 in\) by 0\.083 in, Roughing T4 \(3\.000 in\) by 1\.333 in, Indexed T12 \(1\.750 in\) by 0\.083 in, Parting T4 \(1\.750 in\) by 0\.083 in\./.test(zp[0]) && /has to be short enough too/.test(zp[0]), 'tools up to 1.667 in fit; the 1.75 in ones are 0.083 in too long, and so is the one in the spindle: ' + zp[0].split('\n')[1]);
  ok(/about 0\.287 in above the top of the stock \(a flat face up\)/.test(zp[0]), 'check: with Z at the top the tip is 0.287 in over the 1.5 in square');
  ok(up.indexOf(up.find((p) => /^T4 sticks out/.test(p))) < up.indexOf(zp[0]) && /^T4 sticks out 1\.750 in for Corners and Parting but 3\.000 in for Roughing\. One tool number is one tool/.test(up.find((p) => /^T4 sticks/.test(p)) || ''), 'and T4 sticking out two lengths comes first: ' + up.find((p) => /^T4/.test(p)));
  // ---- the limit holds still while stickouts are edited (it used to follow them down)
  const m = fresh({ units: 'in', stock: { shape: 'square', width: 1.5 * IN }, corners: { enabled: true, tool_number: 4, tool_dia: 6.35, stickout: 1.5 * IN },
    rough: { tool_number: 4, tool_dia: 6.35, stickout: 1.5 * IN }, finish: { tool_number: 13, stickout: 1.5 * IN }, index: { enabled: true, tool_number: 12, stickout: 1.75 * IN },
    parting: { enabled: true, tool_number: 4, tool_dia: 6.35, stickout: 1.5 * IN }, rig: { tc: { ztop: 1.037 * IN, zbot: -3 * IN, ztool: 5 } } });
  m.rig.tc.zref = core.zRefLive(m);          // what reading the machine does: T5 is in, stickout unknown, so T4 at 1.5 in
  const lim0 = core.zFit(m).soMax;
  ['corners', 'rough', 'finish', 'index', 'parting'].forEach((o) => { m[o].stickout = 1.4 * IN; });
  const lim1 = core.zFit(m).soMax, mm = core.check(m, mb, Lin).find((p) => /^Z travel/.test(p)) || '';
  ok(Math.abs(lim0 - lim1) < 1e-9 && Math.abs(lim0 / IN - 1.417) < 0.002, `every stickout cut to 1.4 in: the limit stays at ${Lin(lim1)} (it was ${Lin(lim0)}), it doesn't follow them down`);
  ok(!/Too long/.test(mm) && /Every operation.s tool fits now\. What.s left is the tool in the spindle/.test(mm) && /Put in T4 \(Corners, 1\.400 in\), zero Z on the rotary axis with it/.test(mm), 'all the tools fit: what\u2019s left is the tool in the spindle, and what to do: ' + mm.split('\n')[1]);
  ok(/T4 \(Corners, 1\.500 in stickout when Z was read\), taken to be the tool in the spindle because ncSender says T5 is in/.test(mm) && /Changing stickouts here doesn.t move that/.test(mm) && /Set T5.s stickout under Tool changes/.test(mm), 'it says what it took to be in the spindle, from when, and that editing stickouts doesn\u2019t move it');
  // T4 put in at 1.4 in and Z zeroed on the axis with it: read again, and it fits
  m.rig.tc.ztop = 1.137 * IN; m.rig.tc.zref = core.zRefLive(m);
  ok(!core.check(m, mb, Lin).some((p) => /^Z travel/.test(p)) && Math.abs(core.zFit(m).soMax / IN - 1.417) < 0.002, 'T4 put in at 1.4 in and Z zeroed with it: everything fits, under the same ' + Lin(core.zFit(m).soMax));
  // typed in, it wins; cleared, the reading is back
  m.rig.tc.zso = 1.6 * IN; m.rig.tc.typed = { zso: true };
  ok(core.zRefInfo(m).how === 'typed' && Math.abs(core.zFit(m).nose / IN - 2.737) < 0.001, 'the spindle tool\u2019s stickout typed in wins');
  delete m.rig.tc.typed; m.rig.tc.zso = null;
  ok(core.zRefInfo(m).how === 'first' && core.zRefInfo(m).held && Math.abs(core.zRefInfo(m).so / IN - 1.4) < 1e-9, 'cleared: back to what the reading took');

  const cl = core.toolClashes(u);
  ok(cl.length === 1 && cl[0].num === 4 && cl[0].key === 'stickout' && cl[0].vals.length === 2 && cl[0].vals[0].ops.join() === 'corners,parting', 'toolClashes: T4, stickout, two lengths');
  ok(core.sameTool(u, 'rough').join() === 'corners,parting' && core.sameTool(u, 'finish').length === 0, 'the operations that share roughing\u2019s T4');
  u.rough.tool_dia = 3.175;
  ok(core.toolClashes(u).map((c) => c.key).join() === 'tool_dia' && /^T4 is 0\.250 in across for Corners and Parting but 0\.125 in across for Roughing\. One tool number can.t be two different tools/.test(core.check(u, mb, Lin).find((p) => /^T4/.test(p))), 'a different size with the same number: a different tool');
  u.rough.tool_dia = 6.35; u.finish.tool_number = 4;
  ok(core.toolClashes(u).some((c) => c.key === 'kind') && /^T4 is a flat end mill for Corners, Roughing and Parting but a ball end mill for Finishing\. One tool number can.t be two different tools/.test(core.check(u, mb, Lin).find((p) => /^T4 is a/.test(p)) || ''), 'a ball and a flat with the same number: ' + core.check(u, mb, Lin).find((p) => /^T4 is a/.test(p)));

  // ---- a real program: capped at the top, and told
  const ocl = await OCL();
  async function program(over) {
    const j = fresh(Object.assign({ stock: { dia: 44 }, corners: { enabled: false } }, over));
    const m = core.placeMesh(raw, j.model), wm = core.workMesh(j, m), p = core.plan(j, wm), cut = worker.makeCutters(ocl, j), rot = new Float32Array(wm.tris.length), maps = { roughZ: [], finZ: [] };
    for (let k = 0; k < p.nAng; k++) { const r = worker.computeAngle(ocl, wm.tris, rot, j, p, k, cut); if (r.rough) maps.roughZ[k] = r.rough; if (r.fin) maps.finZ[k] = r.fin; }
    if (over && over._hold) { p.holdNeed = Object.assign(p.holdNeed || {}, over._hold); p.travel = Object.assign(p.travel || {}, over._hold); }
    const warns = [];
    const prog = core.buildProgram(j, p, maps, 'cyl', () => {}, (w) => warns.push(w));
    return { j, prog, warns, z: zs(prog.gcode) };
  }
  let r = await program({});
  const free = Math.max(...r.z);
  // inches, but the controller would scale A in G20: the program is in mm, A in degrees as ever
  const aw = (g) => (g.match(/\bA-?[\d.]+/g) || []).slice(0, 400).join(' ');
  const rIn = await program({ units: 'in' }), rMm = await program({ units: 'in', program_mm: true });
  ok(/\nG20 /.test(rIn.prog.gcode) && /\nG21 /.test(rMm.prog.gcode) && !/\nG20 /.test(rMm.prog.gcode) && /\$376/.test(rMm.prog.gcode), 'inches with A not set as rotary: written in mm (G21), and says why');
  ok(aw(rMm.prog.gcode) === aw(r.prog.gcode) && aw(rIn.prog.gcode) === aw(r.prog.gcode) && Math.abs(Math.max(...rMm.z) - Math.max(...r.z)) < 1e-6, 'its A words are the same degrees, its moves the same in mm');
  ok(free > 26.9, `no limit known: the program goes up to its retract height (Z${free.toFixed(2)})`);
  r = await program({ rig: { tc: { ztop: 26, zbot: -80 } } });
  const top = Math.max(...r.z);
  ok(top <= 25.5 + 1e-6, `top of Z 26 mm above the axis: nothing above Z${top.toFixed(3)} (so nothing above machine Z0 with the work offset 26 mm down)`);
  ok(r.warns.some((w) => /^To stay inside the Z travel, \d+ rapids? in Roughing/.test(w)) && !r.warns.some((w) => /^!!/.test(w)), 'it says the rapids were kept lower, still clear of the stock: ' + r.warns.find((w) => /Z travel/.test(w)));
  // the holder needing more than there is: danger
  r = await program({ rig: { tc: { ztop: 26, zbot: -80 } }, _hold: { rough: 32 } });
  ok(r.warns.some((w) => /^!!Roughing \(T1, 31\.0 mm stickout\) can only rise 25\.5 mm above the rotary axis/.test(w) && /collet nut and spindle/.test(w)), 'when the collet nut needs more room than Z has, it’s marked as a danger');
  // below the bottom
  r = await program({ rig: { tc: { ztop: 60, zbot: 12 } } });
  ok(r.warns.some((w) => /^!!Finishing .* below the bottom of Z travel/.test(w)), 'cutting below the bottom of the travel is marked as a danger: ' + (r.warns.find((w) => /bottom/.test(w)) || '').slice(0, 120));
  // Z0 at the top of the travel (not zeroed on the axis yet): nothing is limited or blocked, it's said
  job = fresh({ stock: { dia: 44 }, rig: { tc: { ztop: 0, zbot: -130 } } });
  ok(core.zRoom(job, 'rough') === null && core.zNotOnAxis(job) && !core.check(job, mb).some((p) => /Z travel/.test(p)), 'Z0 at the top of the travel: not taken as the room, Generate isn\u2019t stopped');
  r = await program({ rig: { tc: { ztop: 0, zbot: -130 } } });
  ok(Math.max(...r.z) > 26.9 && r.warns.some((w) => /^Z travel not checked: .*isn.t on the rotary axis yet/.test(w)), 'its program keeps its heights, with a note to zero Z on the axis first');
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
