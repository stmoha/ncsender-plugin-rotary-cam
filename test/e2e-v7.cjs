// 0.5.0 walkthrough: tapered ball bits. Shape select, picking a tapered ball that the Tool
// Library holds as a V-bit, the cone in 3D, generate, the program's tool comment, simulate.
// node test/e2e-v7.cjs <part> <outdir> [--dark] [--viewport WxH] [--metric] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8784));
const metric = process.argv.includes('--metric');
const U = metric ? 1 : 25.4;
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  if (!metric) await fetch(`http://localhost:${PORT}/__test/units`, { method: 'POST', body: 'imperial' });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const vp = arg('--viewport', '1500x950').split('x').map(Number);
  const page = await (await browser.newContext({ viewport: { width: vp[0], height: vp[1] } })).newPage();
  const errors = [];
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
  const open = async () => { await page.click('#open'); await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0 && document.querySelector('#rcam-root .rc-side details'), null, { timeout: 30000 }); await page.waitForTimeout(700); };
  const t = Date.now(), ms = () => ((Date.now() - t) / 1000).toFixed(1) + 's';
  let fails = 0;
  const ok = (cond, what) => { if (!cond) fails++; console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what); };
  const openSec = (sec) => page.evaluate((s) => { const d = document.querySelector('#rcam-root details[data-sec=' + s + ']'); if (d) d.open = true; }, sec);
  const rows = (sec) => page.$$eval(`#rcam-root details[data-sec=${sec}] .rc-row label`, (els) => els.map((e) => e.textContent.replace('?', '').trim()));
  const job = () => page.evaluate(() => window.RotaryCam.__state.job.finish);
  try {
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    await open();
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(500);
    const fit = await page.$('#rcam-root .rc-fitstock'); if (fit) { await fit.click(); await page.waitForTimeout(300); }

    await openSec('finish');
    let r = await rows('finish');
    ok(r.includes('Shape') && r.includes('Diameter') && !r.includes('Taper (per side)'), 'Finishing has a Shape setting; a ball shows Diameter only');
    const opts = await page.$$eval('#rc-finish-tool option', (o) => o.map((x) => x.textContent));
    console.log(ms(), '   finishing tools:', JSON.stringify(opts));
    ok(opts.some((o) => /Tapered Ball.*\(as a tapered ball\)/.test(o)) && !opts.some((o) => /60° V-bit/.test(o) && !/tapered/.test(o)), 'library V-bits are offered for finishing as tapered balls');
    await page.selectOption('#rc-finish-tool', '15'); await page.waitForTimeout(400);
    let f = await job();
    ok(f.shape === 'taper' && Math.abs(f.shank_dia - 3.175) < 1e-6 && f.tool_dia < f.shank_dia && Math.abs(f.taper_deg - 3.6) < 1e-6, `picking it: tapered ball, shank ${f.shank_dia} mm, tip ${f.tool_dia} mm, ${f.taper_deg}° per side`);
    r = await rows('finish');
    ok(r.includes('Tip diameter') && r.includes('Taper (per side)') && r.includes('Shank diameter'), 'tapered ball shows Tip diameter, Taper and Shank diameter');
    await page.click('#rcam-root .rc-op[data-op=finish]'); await page.waitForTimeout(400);
    await shot('1-tapered-tool');
    await page.selectOption('#rc-finish-shape', 'ball'); await page.waitForTimeout(300);
    ok(!(await rows('finish')).includes('Taper (per side)'), 'switching back to Ball hides the taper');
    await page.selectOption('#rc-finish-tool', '15'); await page.waitForTimeout(300);
    await openSec('finish');
    await page.fill('#rc-finish-pitch', (0.3 / U).toFixed(metric ? 2 : 4)); await page.dispatchEvent('#rc-finish-pitch', 'change');
    await openSec('rough'); await page.selectOption('#rc-rough-tool', '11');

    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 1500000, polling: 1000 });
    const st = await page.evaluate(() => { const s = window.RotaryCam.__state; return { problems: s.problems, warnings: s.warnings, op: (s.program.gcode.match(/\(OP finish[^\n]*\)/) || [''])[0] }; });
    console.log(ms(), '   generated:', JSON.stringify(st));
    ok(/tapered ball: taper 3\.60deg shank D/.test(st.op), 'the program says which tapered ball finishing uses');
    await page.click('#rcam-root .rc-op[data-op=finish]'); await page.waitForTimeout(400);
    await shot('2-tapered-toolpath');

    await page.click('[data-tab=sim]');
    await page.waitForFunction(() => window.RotaryCam.sim && window.RotaryCam.sim.checked, null, { timeout: 600000, polling: 500 });
    await page.waitForTimeout(800);
    const rep = await page.evaluate(() => window.RotaryCam.__state.simReport);
    console.log(ms(), '   simulation report:', JSON.stringify(rep));
    ok(rep && rep.rapids === 0 && rep.gouges === 0 && rep.tenon.count === 0, 'simulation: no rapids into stock, nothing below the part, tenons whole');
    const tf = await page.evaluate(() => { const P = window.RotaryCam.sim.prog; let a = 0, b = 0; for (let k = 0; k < P.count; k++) if (P.ops[P.op[k]] && P.ops[P.op[k]].name === 'finish') { if (!a) a = (k ? P.t[k - 1] : 0) / P.total; b = P.t[k] / P.total; } return [a, b]; });
    await page.$eval('#rcam-root .rc-simpos', (el, v) => { el.value = Math.round(v * 1000); el.dispatchEvent(new Event('input', { bubbles: true })); }, (tf[0] + tf[1]) / 2);
    await page.waitForTimeout(900);
    await shot('3-sim-tapered-finishing');
    const dump = await page.evaluate(() => { const s = window.RotaryCam.__state; return { tris: Array.from(s.mesh.tris), job: s.job, gcode: s.program.gcode, tenons: window.RotaryCamCore.tenonList(s.job, s.mesh) }; });
    const n = dump.tris.length / 9, buf = Buffer.alloc(84 + n * 50);
    buf.writeUInt32LE(n, 80);
    for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) buf.writeFloatLE(dump.tris[i * 9 + k], 84 + i * 50 + 12 + 4 * k);
    fs.writeFileSync(path.join(outDir, 'placed.stl'), buf);
    fs.writeFileSync(path.join(outDir, 'job.json'), JSON.stringify(dump.job, null, 2));
    fs.writeFileSync(path.join(outDir, 'tenons.json'), JSON.stringify(dump.tenons));
    fs.writeFileSync(path.join(outDir, 'program.nc'), dump.gcode);
  } catch (e) {
    fails++;
    console.log('FAILED:', e.message);
    await shot('failure').catch(() => {});
  } finally {
    console.log('console errors/warnings:', errors.length ? errors : 'none');
    console.log(fails ? `${fails} FAILED` : 'ALL PASS');
    process.exitCode = fails || errors.length ? 1 : 0;
    await browser.close();
    srv.kill();
  }
})();
