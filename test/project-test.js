// Round trip a .rcam project: zip writer/reader, typed-array packing, STL, and a check
// that a stock unzip tool reads the archive too.
// node test/project-test.js [part.step|part.stl]
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process'), os = require('os');
const core = require('../lib/cam-core.js'), P = require('../lib/rcam-project.js');
let fails = 0;
const ok = (c, what) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + what); };
(async () => {
  const part = process.argv[2] || path.join(__dirname, 'horn.stl');
  const buf = fs.readFileSync(part);
  const raw = core.parseSTL(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
  const job = core.prepareJob(core.deepMerge(core.DEFAULTS, { model: { scale: 0.9 }, index: { enabled: true, auto: false, angle_list: '90, 270' } }));
  const roughZ = [Float64Array.from([1, 2, NaN, 4]), Float64Array.from([5, NaN, 7, 8])];
  const paths = { rough: Float32Array.from([0, 0, 1, 0, NaN, NaN, NaN, NaN, 2, 0, 1, 5]), finish: new Float32Array(0) };
  const result = {
    plan: { nAng: 2, angles: Float64Array.from([0, 180]), roughX: Float64Array.from([1, 1.5]), finLo: 3, finHi: Infinity, tenons: [{ side: 'chuck', r: 6.35 }] },
    maps: { roughZ, finZ: roughZ.map((r) => r.map((v) => v * 2)), finRefined: 12, indexed: { angles: [{ a: 90, passes: [[[1, 2, 3]]] }] } },
    program: { gcode: 'G21\nG0 Z5\nM30\n', lines: 3, minutes: 1.5, limitedMoves: 0, maxA: 720, info: { rough: { layers: [20, 17.5] } }, paths },
    seconds: 4.2, warnings: ['a warning']
  };
  const source = { name: path.basename(part), bytes: new Uint8Array(buf) };
  const t0 = Date.now();
  const bytes = await P.save({ name: path.basename(part), tris: raw, source, job, tools: [{ id: 13, number: 3, name: '1/8" Ball End Mill' }], result, app: 'Rotary CAM ' + core.VERSION, units: 'in', programName: 'horn_rotary.nc' });
  console.log(`saved ${(bytes.length / 1e6).toFixed(2)} MB in ${Date.now() - t0} ms (part ${raw.length / 9} triangles, STL ${(84 + raw.length / 9 * 50) / 1e6} MB + source ${(buf.length / 1e6).toFixed(2)} MB)`);
  ok(P.looksLikeProject(bytes), 'looks like a project');
  // a stock unzip reads it and its CRCs check out
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rcam-'));
  fs.writeFileSync(path.join(tmp, 'p.rcam'), bytes);
  const t = execFileSync('unzip', ['-t', path.join(tmp, 'p.rcam')]).toString();
  ok(/No errors detected/.test(t), 'unzip -t: ' + t.trim().split('\n').pop());
  const listing = execFileSync('unzip', ['-l', path.join(tmp, 'p.rcam')]).toString();
  ok(['project.json', 'part.stl', 'source/' + path.basename(part), 'program.nc', 'result.json', 'result.bin'].every((n) => listing.includes(n)), 'archive holds project.json, part.stl, the source file, program.nc, result.json/.bin');
  execFileSync('unzip', ['-q', '-o', path.join(tmp, 'p.rcam'), 'part.stl', '-d', tmp]);
  const stl = fs.readFileSync(path.join(tmp, 'part.stl'));
  const raw2 = core.parseSTL(stl.buffer.slice(stl.byteOffset, stl.byteOffset + stl.length));
  ok(raw2.length === raw.length && raw2.every((v, i) => v === raw[i]), 'part.stl (extracted with unzip) is the same mesh');
  const back = await P.load(bytes);
  ok(back.tris.length === raw.length && back.tris.every((v, i) => v === raw[i]), 'part comes back exactly');
  ok(JSON.stringify(back.job) === JSON.stringify(job), 'settings come back exactly');
  ok(back.source && back.source.name === path.basename(part) && Buffer.from(back.source.bytes).equals(buf), 'source file comes back byte for byte');
  const r = back.result;
  ok(r && r.program.gcode === result.program.gcode, 'G-code comes back');
  ok(r.plan.angles instanceof Float64Array && r.plan.angles[1] === 180 && r.plan.finHi === Infinity, 'plan typed arrays and Infinity come back');
  ok(r.maps.roughZ[0] instanceof Float64Array && Number.isNaN(r.maps.roughZ[0][2]) && r.maps.roughZ[1][3] === 8 && r.maps.finZ[1][0] === 10, 'maps rows (with NaN) come back');
  ok(r.program.paths.rough instanceof Float32Array && r.program.paths.rough.length === 12 && Number.isNaN(r.program.paths.rough[4]) && r.program.paths.rough[11] === 5 && r.program.paths.finish.length === 0, 'toolpaths come back');
  ok(r.program.info.rough.layers[1] === 17.5 && r.seconds === 4.2 && r.warnings[0] === 'a warning', 'info, time and warnings come back');
  ok(back.meta.units === 'in' && back.meta.program.name === 'horn_rotary.nc' && back.tools[0].number === 3, 'meta: units, program name, tools');
  // without a result or source
  const b2 = await P.save({ name: 'x.stl', tris: raw, job, tools: [] });
  const back2 = await P.load(b2);
  ok(back2.result === null && back2.source === null && back2.tris.length === raw.length, 'a project without G-code or source opens');
  // a damaged / foreign file says so
  try { await P.load(new Uint8Array([1, 2, 3, 4, 5])); ok(false, 'junk rejected'); } catch (e) { ok(/not a Rotary CAM project/.test(e.message), 'junk is rejected: ' + e.message); }
  const zipOnly = await P.zipWrite([{ name: 'readme.txt', data: 'hi' }]);
  try { await P.load(zipOnly); ok(false, 'foreign zip rejected'); } catch (e) { ok(/no project.json/.test(e.message), 'a ZIP that isn’t a project is rejected: ' + e.message); }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exitCode = fails ? 1 : 0;
})();
