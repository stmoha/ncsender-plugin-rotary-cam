// node test/below-test.js: roughing and finishing past the rotary axis (Deepest below the axis).
// The rule on its own, then test/slot_test.step (a slot right through the bar and a blind hole
// to 6 mm past the axis; test/make_slot_step.py) on auto, capped at 2 mm, and at 0.
globalThis.importScripts = () => {}; globalThis.self = globalThis;
const fs = require('fs'), path = require('path');
const core = require('../lib/cam-core.js'), worker = require('../lib/cam-worker.js'), OCL = require('../lib/ocl.js');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const near = (a, b, t) => Math.abs(a - b) <= t;
(async () => {
  // ---- the rule: u how far past the axis the tool can go here, v the same 180 deg round
  const N = core.belowNeed, I = Infinity;
  ok(N(-5, -7, 3) === 0, 'both stop above the axis: stays above it');
  ok(N(I, I, 3) === 3, 'a gap right through: the ball goes one radius past, its centre on the axis');
  ok(N(I, I, 0) === 0, 'a gap right through with a flat end mill: to the axis is enough');
  ok(N(6, -14, 3) === 6, 'the bottom of a hole past the axis (the other side is solid): all the way down');
  ok(N(1, I, 3) === 5, 'a shallow spot here, open the other side: 2R - u');
  ok(core.belowCap({ below_axis: null }) === I && core.belowCap({ below_axis: '' }) === I && core.belowCap({ below_axis: 0 }) === 0 && core.belowCap({ below_axis: 2 }) === 2 && core.belowCap({ below_axis: -1 }) === 0, 'empty is auto, numbers cap it, never negative');

  // ---- the slot part
  const ocl = await OCL(), occt = await require('../lib/occt-import-js.js')();
  const buf = fs.readFileSync(path.join(__dirname, 'slot_test.step'));
  const raw = core.trisFromOcct(occt.ReadStepFile(new Uint8Array(buf), { linearUnit: 'millimeter', linearDeflectionType: 'absolute_value', linearDeflection: 0.01, angularDeflection: 0.05 })).tris;
  async function run(below) {
    const job = core.prepareJob(core.deepMerge(core.DEFAULTS, { stock: { shape: 'round', dia: 30 }, tailstock_x: 150, tenons: { enabled: false }, corners: { enabled: false }, angle_step_deg: 4, finish: { pitch: 1 }, below_axis: below }));
    const mb = core.placeMesh(raw, job.model, core.chuckLead(job)), wm = core.workMesh(job, mb), p = core.plan(job, wm);
    const cut = worker.makeCutters(ocl, job), rot = new Float32Array(wm.tris.length), maps = { roughZ: [], finZ: [] };
    for (let j = 0; j < p.nAng; j++) { const r = worker.computeAngle(ocl, wm.tris, rot, job, p, j, cut); maps.roughZ[j] = r.rough; maps.finZ[j] = r.fin; }
    core.applyBelowAxis(job, p, maps);
    const x0 = mb.min[0], R = job.finish.tool_dia / 2;
    // lowest finishing / roughing tip in the slot (X+20..40), at the hole (X+54..66) and elsewhere
    const lo = { fs: I, fh: I, fo: I, rs: I, rh: I, ro: I };
    const where = (x) => (x > x0 + 20 && x < x0 + 40 ? 's' : x > x0 + 54 && x < x0 + 66 ? 'h' : 'o');
    maps.finZ.forEach((row, j) => row.forEach((z, c) => {
      const x = c === 0 ? p.finLo : c === row.length - 1 ? p.finHi : p.finLo + (c - 1) * job.finish.pitch + job.finish.pitch * p.angles[j] / 360;
      if (isFinite(z)) lo['f' + where(x)] = Math.min(lo['f' + where(x)], z);
    }));
    maps.roughZ.forEach((row) => row.forEach((z, i) => { if (isFinite(z)) lo['r' + where(p.roughX[i])] = Math.min(lo['r' + where(p.roughX[i])], z); }));
    const warns = [], prog = core.buildProgram(job, p, maps, 'slot', () => {}, (w) => warns.push(w));
    let zmin = I;
    prog.gcode.split('\n').forEach((l) => { const m = l.match(/^G[0-3]\b.*Z(-?[\d.]+)/) || l.match(/^[XYZA].*Z(-?[\d.]+)/); if (m) zmin = Math.min(zmin, Number(m[1])); });
    return { job, p, maps, lo, R, warns, zmin, x0, wm, rot, cut };
  }

  const A = await run(null);
  ok(near(A.lo.fs, -A.R, 0.02), `auto: finishing in the slot goes one ball radius past the axis (${A.lo.fs.toFixed(3)}, R ${A.R.toFixed(3)})`);
  ok(near(A.lo.fh, -6, 0.15), `auto: finishing reaches the bottom of the hole, 6 mm past the axis (${A.lo.fh.toFixed(3)})`);
  ok(A.lo.fo >= -1e-9, `auto: finishing stays above the axis everywhere else (${A.lo.fo.toFixed(3)})`);
  ok(A.lo.rh < -4 && A.lo.rs >= -1e-9 && A.lo.ro >= -1e-9, `auto: roughing goes into the hole past the axis (${A.lo.rh.toFixed(2)}), to the axis in the slot (${A.lo.rs.toFixed(2)}), no further`);
  ok(A.warns.some((w) => /past the rotary axis/.test(w) && /set Deepest below the axis \(Stock & rotary\) to 0/.test(w)), 'auto: the program says where it goes past the axis and how to stop it');
  ok(A.zmin < -5.5, `auto: the program itself goes past the axis (lowest Z ${A.zmin.toFixed(3)})`);
  // a sharp-feature probe in the middle of the slot (open along Z at A0) is clamped like its samples
  const zp = worker.probe(ocl, A.wm.tris, A.rot, A.job, A.p, 0, [A.x0 + 30], A.cut)[0];
  ok(!isFinite(zp) && near(core.belowClamp(A.job, A.p, A.maps, 0, A.x0 + 30, zp), -A.R, 1e-6), `auto: a probe through the slot finds nothing, and is clamped to one radius past the axis`);

  const B = await run(2);
  ok(near(B.lo.fs, -2, 1e-6) && near(B.lo.fh, -2, 1e-6) && near(B.lo.rh, -2, 1e-6), `capped at 2 mm: the slot and the hole stop 2 mm past the axis (${B.lo.fs.toFixed(3)}, ${B.lo.fh.toFixed(3)}, rough ${B.lo.rh.toFixed(3)})`);
  ok(B.zmin >= -2 - 1e-3 && B.warns.some((w) => /Deepest below the axis \(Stock & rotary\) lets it go 2\.0 mm/.test(w)), `capped at 2 mm: the program never goes lower (${B.zmin.toFixed(3)}) and says why`);

  const Z = await run(0);
  ok(Z.lo.fs >= 0 && Z.lo.fh >= 0 && Z.lo.rh >= 0 && Z.lo.fo >= 0, 'at 0: nothing past the axis');
  ok(near(Z.lo.fs, 0, 1e-6), 'at 0: through the slot the ball still goes down to the axis (not left at the stock)');
  ok(Z.zmin >= -1e-3 && !Z.warns.some((w) => /past the rotary axis/.test(w)), `at 0: the program stays above the axis (lowest Z ${Z.zmin.toFixed(3)}), no notice`);

  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
