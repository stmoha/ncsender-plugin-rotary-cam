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
  ok(probs.some((p) => /^Z travel: Indexed \(T3, 40\.00 mm stickout\) can only bring its tip 21\.00 mm above/.test(p) && /stock reaches 22\.00 mm/.test(p)), 'Indexed with 40 mm stickout can’t clear 44 mm stock under a 30 mm top: ' + (probs.find((p) => /Z travel/.test(p)) || '(none)'));
  job.index.stickout = 18;
  ok(!core.check(job, mb).some((p) => /Z travel/.test(p)), 'with 18 mm stickout it fits');

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
