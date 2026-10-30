// 0.4.0 walkthrough: square stock with Corners + Parting, generate, simulate (checks,
// play, scrub), toolpaths per op, reopen in Simulate. Then dumps the program for the verifier.
// node test/e2e-v4.cjs <part> <outdir> [--dark] [--viewport WxH] [--metric]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = 8780;
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  if (!process.argv.includes('--metric')) await fetch(`http://localhost:${PORT}/__test/units`, { method: 'POST', body: 'imperial' });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const vp = arg('--viewport', '1500x950').split('x').map(Number);
  const page = await (await browser.newContext({ viewport: { width: vp[0], height: vp[1] } })).newPage();
  const errors = [];
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
  const open = async () => { await page.click('#open'); await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0 && document.querySelector('#rcam-root .rc-side details'), null, { timeout: 30000 }); await page.waitForTimeout(700); };
  const t = Date.now(), ms = () => ((Date.now() - t) / 1000).toFixed(1) + 's';
  const ok = (cond, what) => console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what);
  const openSec = (sec) => page.evaluate((s) => { const d = document.querySelector('#rcam-root details[data-sec=' + s + ']'); if (d) d.open = true; }, sec);
  try {
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    await open();
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(500);
    ok(await page.$eval('#rcam-root .rc-op[data-op=corners]', (b) => b.hidden), 'Corners pill hidden for round stock');
    ok(await page.$eval('[data-tab=sim]', (b) => b.disabled), 'Simulate is off until there are toolpaths');

    await page.selectOption('#rc-stock-shape', 'square');
    await page.waitForTimeout(300);
    const fit = await page.$('#rcam-root .rc-fitstock'); if (fit) { await fit.click(); await page.waitForTimeout(300); }
    ok(!(await page.$eval('#rcam-root .rc-op[data-op=corners]', (b) => b.hidden)), 'Corners pill shows for square stock');
    ok(!!(await page.$('#rcam-root details[data-sec=corners]')), 'Corners settings section shows for square stock');

    await openSec('parting');
    await page.check('#rcam-root details[data-sec=parting] summary input[type=checkbox]');
    await page.waitForTimeout(300);
    ok(!(await page.$eval('#rcam-root .rc-op[data-op=parting]', (b) => b.hidden)), 'Parting pill shows when Parting is ticked');
    for (const [sec, id] of [['corners', '11'], ['rough', '11'], ['parting', '11']]) { await openSec(sec); await page.selectOption(`#rc-${sec}-tool`, id); }
    await openSec('finish'); await page.selectOption('#rc-finish-tool', '13');

    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 1500000, polling: 1000 });
    const st = await page.evaluate(() => { const s = window.RotaryCam.__state; return { problems: s.problems, warnings: s.warnings, paths: s.program && Object.fromEntries(Object.entries(s.program.paths).map(([k, v]) => [k, v.length / 4])), stats: document.querySelector('#rcam-root .rc-stats').innerText.replace(/\n/g, ' ') }; });
    console.log(ms(), '   generated:', JSON.stringify(st));
    for (const op of ['corners', 'rough', 'finish', 'parting']) { await page.click(`#rcam-root .rc-op[data-op=${op}]`); await page.waitForTimeout(400); await shot('3-' + op); }

    // simulate
    await page.click('[data-tab=sim]');
    await page.waitForFunction(() => window.RotaryCam.sim && window.RotaryCam.sim.checked, null, { timeout: 300000, polling: 500 });
    await page.waitForTimeout(800);
    const rep = await page.evaluate(() => window.RotaryCam.__state.simReport);
    const msg = await page.$eval('#rcam-root .rc-msgs', (el) => el.innerText.replace(/\n/g, ' '));
    console.log(ms(), '   simulation report:', JSON.stringify(rep));
    ok(rep && rep.rapids === 0 && rep.gouges === 0, 'simulation: no rapids into stock, nothing below the part');
    ok(/Whole program simulated/.test(msg), 'simulation result shown in the messages');
    await shot('4-sim-end');
    await page.$eval('#rcam-root .rc-simpos', (el) => { el.value = 60; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForTimeout(600); await shot('5-sim-corners');
    await page.$eval('#rcam-root .rc-simpos', (el) => { el.value = 300; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForTimeout(600); await shot('6-sim-roughing');
    const line = await page.$eval('#rcam-root .rc-simline', (el) => el.innerText);
    console.log(ms(), '   line readout:', line.slice(0, 90));
    await page.selectOption('#rcam-root .rc-simspeed', '1000');
    const t0 = await page.evaluate(() => window.RotaryCam.sim.t);
    await page.click('#rcam-root .rc-play');
    await page.waitForTimeout(2500);
    const t1 = await page.evaluate(() => window.RotaryCam.sim.t);
    ok(t1 > t0, `playback advances (${t0.toFixed(2)} -> ${t1.toFixed(2)} min of program in 2.5 s)`);
    await page.click('#rcam-root .rc-play');
    await shot('7-sim-playing');

    // dump for the verifier
    const dump = await page.evaluate(() => { const s = window.RotaryCam.__state; return { tris: Array.from(s.mesh.tris), job: s.job, gcode: s.program.gcode }; });
    const n = dump.tris.length / 9, buf = Buffer.alloc(84 + n * 50);
    buf.writeUInt32LE(n, 80);
    for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) buf.writeFloatLE(dump.tris[i * 9 + k], 84 + i * 50 + 12 + 4 * k);
    fs.writeFileSync(path.join(outDir, 'placed.stl'), buf);
    fs.writeFileSync(path.join(outDir, 'job.json'), JSON.stringify(dump.job, null, 2));
    fs.writeFileSync(path.join(outDir, 'program.nc'), dump.gcode);

    // close and reopen: back in Simulate
    await page.click('#rcam-root .rc-close');
    await page.waitForTimeout(300);
    await open();
    await page.waitForTimeout(800);
    const back = await page.evaluate(() => ({ tab: window.RotaryCam.__state.ui.tab, sim: !!(window.RotaryCam.sim && window.RotaryCam.sim.checked) }));
    ok(back.tab === 'sim' && back.sim, 'reopens in Simulate with the simulation kept');
    await shot('8-reopened');
    await page.click('[data-tab="3d"]');
    await page.waitForTimeout(300);
    ok(await page.$eval('#rcam-root .rc-placing', (el) => getComputedStyle(el).display !== 'none'), 'back to 3D shows the placement tools');
  } catch (e) {
    console.log('FAILED:', e.message);
    await shot('failure').catch(() => {});
    process.exitCode = 1;
  } finally {
    console.log('console errors/warnings:', errors.length ? errors : 'none');
    await browser.close();
    srv.kill();
  }
})();
