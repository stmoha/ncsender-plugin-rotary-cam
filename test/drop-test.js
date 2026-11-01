// node test/drop-test.js: the plain-JS ball drop (Indexed) against OpenCAMLib, same points.
// They must agree to a micron everywhere, and find the part at the same points.
globalThis.importScripts = () => {}; globalThis.self = globalThis;
const fs = require('fs'), path = require('path');
const core = require('../lib/cam-core.js'), worker = require('../lib/cam-worker.js'), OCL = require('../lib/ocl.js');
const now = () => Number(process.hrtime.bigint()) / 1e6;
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const ocl = await OCL(), occt = await require('../lib/occt-import-js.js')();
  for (const [file, dia, angles] of [['chin_test.step', 3.175, [0, 90, 225]], ['knight_test.step', 3.175, [90, 300]], ['horn.stl', 1.5875, [45]]]) {
    const job = core.prepareJob(core.deepMerge(core.DEFAULTS, { stock: { dia: 80 }, index: { enabled: true, tool_dia: dia } }));
    const buf = fs.readFileSync(path.join(__dirname, file));
    const raw = /\.step$/.test(file) ? core.trisFromOcct(occt.ReadStepFile(new Uint8Array(buf), { linearUnit: 'millimeter', linearDeflectionType: 'absolute_value', linearDeflection: 0.01, angularDeflection: 0.05 })).tris : core.parseSTL(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
    const mb = core.placeMesh(raw, job.model), wm = core.workMesh(job, mb), cut = worker.makeCutters(ocl, job).index, R = dia / 2;
    for (const a of angles) {
      // a grid over the part plus random points
      const xs = [], ry = mb.rmax + R;
      for (let y = -ry; y <= ry; y += 0.37) for (let x = mb.min[0] - 2; x <= mb.max[0] + 2; x += 0.29) xs.push(x, y);
      for (let k = 0; k < 4000; k++) xs.push(mb.min[0] - 2 + Math.random() * (mb.max[0] - mb.min[0] + 4), -ry + Math.random() * 2 * ry);
      const xy = Float64Array.from(xs), n = xy.length / 2, rot = new Float32Array(wm.tris.length);
      let t0 = now();
      const zO = worker.dropXY(ocl, wm.tris, rot, Object.assign({}, job, { _ocl_drop: true }), a, xy, cut, R);
      const tO = now() - t0; t0 = now();
      const zJ = worker.dropXY(ocl, wm.tris, rot, job, a, xy, cut, R);
      const tJ = now() - t0; t0 = now();
      worker.dropXY(ocl, wm.tris, rot, job, a, xy, cut, R);    // again: the grid is kept
      const tJ2 = now() - t0;
      let worst = 0, miss = 0, cnt = 0;
      for (let q = 0; q < n; q++) {
        if (isFinite(zO[q]) !== isFinite(zJ[q])) { miss++; continue; }
        if (isFinite(zO[q])) { cnt++; worst = Math.max(worst, Math.abs(zO[q] - zJ[q])); }
      }
      ok(worst < 1e-3 && miss === 0, `${file} A${a}: ${cnt} contacts agree within ${worst.toExponential(1)} mm, ${miss} disagree on finding the part; ${(1000 * tO / n).toFixed(0)} us/point -> ${(1000 * tJ / n).toFixed(0)} (${(1000 * tJ2 / n).toFixed(0)} with the grid kept): ${(tO / tJ2).toFixed(1)}x`);
    }
  }
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
