// 0.5.0 walkthrough: tenons. Defaults (both ends, same size, 1/2 in), asymmetric sizes,
// one end only, off and on, live 3D, generate with parting, simulate (tenons left whole),
// unrolled profile, settings saved and restored. Then dumps the program for the verifier.
// node test/e2e-v5.cjs <part> <outdir> [--dark] [--viewport WxH] [--metric]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = 8781;
const metric = process.argv.includes('--metric');
const U = metric ? 1 : 25.4;   // display units -> mm
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
  const rows = () => page.$$eval('#rcam-root details[data-sec=tenons] .rc-row', (els) => els.map((e) => (e.querySelector('label') || {}).textContent || '').map((s) => s.replace('?', '').trim()));
  const tenons = () => page.evaluate(() => { const S = window.RotaryCam.__state; return { list: window.RotaryCamCore.tenonList(S.job, S.mesh), shown: window.RotaryCam.viewer.tenonCount(), job: S.job.tenons }; });
  const typeIn = async (sel, v) => { await page.fill(sel, String(v)); await page.dispatchEvent(sel, 'change'); await page.waitForTimeout(250); };
  try {
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    await open();
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(600);

    // defaults
    const sec = await page.$('#rcam-root details[data-sec=tenons]');
    ok(!!sec && await sec.evaluate((d) => d.open), 'Tenons section is there and open');
    ok(await page.$eval('#rcam-root details[data-sec=tenons] summary input', (b) => b.checked), 'tenons are on by default');
    ok(await page.$eval('#rc-tenons-same', (b) => b.checked), 'Same at both ends is ticked by default');
    let r = await rows();
    console.log(ms(), '   rows:', JSON.stringify(r));
    ok(r.join('|') === 'Ends|Same at both ends|Diameter|Into the part|Length out of the part', 'one Diameter / Into the part / Length set while the same');
    const dia = Number(await page.$eval('#rc-tenons-chuck-dia', (el) => el.value));
    ok(Math.abs(dia * U - 12.7) < 0.01, `default diameter is 1/2 in (shows ${dia} ${metric ? 'mm' : 'in'})`);
    let tn = await tenons();
    ok(tn.list.length === 2 && tn.shown === 2 && tn.list.every((x) => Math.abs(x.r - 6.35) < 1e-6), '3D view shows a 1/2 in tenon at each end');
    await shot('1-default-tenons');

    // asymmetric
    await page.uncheck('#rc-tenons-same');
    await page.waitForTimeout(300);
    r = await rows();
    ok(r.join('|') === 'Ends|Same at both ends|Chuck end diameter|Chuck end: into the part|Chuck end: length out|Tailstock end diameter|Tailstock end: into the part|Tailstock end: length out', 'unticking Same shows sizes for each end');
    await typeIn('#rc-tenons-tailstock-dia', (10 / U).toFixed(metric ? 2 : 4));
    await typeIn('#rc-tenons-tailstock-depth', (16 / U).toFixed(metric ? 2 : 4));
    tn = await tenons();
    const tail = tn.list.find((x) => x.side === 'tailstock'), chuck = tn.list.find((x) => x.side === 'chuck');
    ok(Math.abs(tail.r - 5) < 0.01 && Math.abs(tail.depth - 16) < 0.01 && Math.abs(chuck.r - 6.35) < 0.01, `tailstock tenon D${(2 * tail.r).toFixed(2)} x ${tail.depth.toFixed(2)} mm deep, chuck still D${(2 * chuck.r).toFixed(2)}`);
    // live: arrow key on the chuck depth
    const before = (await tenons()).list.find((x) => x.side === 'chuck').x1;
    await page.focus('#rc-tenons-chuck-depth');
    await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(400);
    const after = (await tenons()).list.find((x) => x.side === 'chuck').x1;
    ok(after > before + 0.1, `arrow keys lengthen the chuck tenon live (${before.toFixed(2)} -> ${after.toFixed(2)} mm)`);
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);
    await shot('2-asymmetric-tenons');

    // one end only, off, on
    await page.selectOption('#rc-tenons-ends', 'tailstock');
    await page.waitForTimeout(300);
    r = await rows(); tn = await tenons();
    ok(r.join('|') === 'Ends|Diameter|Into the part|Length out of the part' && tn.list.length === 1 && tn.list[0].side === 'tailstock' && tn.shown === 1 && Math.abs(tn.list[0].r - 5) < 0.01, 'Tailstock end only: one tenon, its own size kept');
    await page.selectOption('#rc-tenons-ends', 'both');
    await page.waitForTimeout(300);
    await page.uncheck('#rcam-root details[data-sec=tenons] summary input');
    await page.waitForTimeout(300);
    tn = await tenons();
    ok(tn.list.length === 0 && tn.shown === 0, 'unticking Tenons removes them');
    await page.check('#rcam-root details[data-sec=tenons] summary input');
    await page.waitForTimeout(300);
    tn = await tenons();
    ok(tn.list.length === 2 && tn.shown === 2 && !tn.job.same, 'ticking it again brings both back, sizes kept');

    // generate with parting
    await openSec('parting');
    await page.check('#rcam-root details[data-sec=parting] summary input[type=checkbox]');
    for (const [s, id] of [['rough', '11'], ['parting', '11']]) { await openSec(s); await page.selectOption(`#rc-${s}-tool`, id); }
    await openSec('finish'); await page.selectOption('#rc-finish-tool', '13');
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 1500000, polling: 1000 });
    const st = await page.evaluate(() => { const s = window.RotaryCam.__state; return { problems: s.problems, warnings: s.warnings, stats: document.querySelector('#rcam-root .rc-stats').innerText.replace(/\n/g, ' ') }; });
    console.log(ms(), '   generated:', JSON.stringify(st));
    ok(!st.warnings.some((w) => /rotary axis/.test(w)), 'no thin / through-the-axis warning with the tenons');
    for (const op of ['rough', 'finish']) { await page.click(`#rcam-root .rc-op[data-op=${op}]`); await page.waitForTimeout(400); await shot('3-' + op); }
    await page.click('[data-tab="2d"]'); await page.waitForTimeout(500); await shot('4-unrolled');
    await page.click('[data-tab="3d"]'); await page.waitForTimeout(300);

    // simulate
    await page.click('[data-tab=sim]');
    await page.waitForFunction(() => window.RotaryCam.sim && window.RotaryCam.sim.checked, null, { timeout: 300000, polling: 500 });
    await page.waitForTimeout(800);
    const rep = await page.evaluate(() => window.RotaryCam.__state.simReport);
    const msg = await page.$eval('#rcam-root .rc-msgs', (el) => el.innerText.replace(/\n/g, ' '));
    console.log(ms(), '   simulation report:', JSON.stringify(rep));
    ok(rep && rep.rapids === 0 && rep.gouges === 0 && rep.tenon.count === 0 && rep.tenon.sides.length === 2, 'simulation: no rapids, nothing below the part, tenons not cut');
    ok(/both tenons left whole/.test(msg), 'simulation message says both tenons are left whole');
    ok(await page.$eval('#rcam-root .rc-tenonkey', (el) => getComputedStyle(el).display !== 'none'), 'Tenon shows in the simulation legend');
    await shot('5-sim-end');
    await page.click('[data-view=end]'); await page.waitForTimeout(500); await shot('6-sim-end-view');

    // dump for the verifier
    const dump = await page.evaluate(() => { const s = window.RotaryCam.__state; return { tris: Array.from(s.mesh.tris), job: s.job, gcode: s.program.gcode, tenons: window.RotaryCamCore.tenonList(s.job, s.mesh) }; });
    const n = dump.tris.length / 9, buf = Buffer.alloc(84 + n * 50);
    buf.writeUInt32LE(n, 80);
    for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) buf.writeFloatLE(dump.tris[i * 9 + k], 84 + i * 50 + 12 + 4 * k);
    fs.writeFileSync(path.join(outDir, 'placed.stl'), buf);
    fs.writeFileSync(path.join(outDir, 'job.json'), JSON.stringify(dump.job, null, 2));
    fs.writeFileSync(path.join(outDir, 'tenons.json'), JSON.stringify(dump.tenons));
    fs.writeFileSync(path.join(outDir, 'program.nc'), dump.gcode);

    // saved in ncSender's plugin settings, and back after closing
    await page.waitForTimeout(900);
    const saved = await (await fetch(`http://localhost:${PORT}/__test/settings`)).json();
    const sj = saved && saved.job && saved.job.tenons;
    ok(sj && sj.enabled && sj.same === false && Math.abs(sj.tailstock.dia - 10) < 0.01, 'tenon settings saved to the plugin settings');
    await page.click('#rcam-root .rc-close');
    await page.waitForTimeout(300);
    await open();
    await page.click('[data-tab="3d"]'); await page.waitForTimeout(400);
    tn = await tenons();
    r = await rows();
    ok(tn.shown === 2 && r.length === 8, 'reopened: both tenons drawn, separate sizes still showing');
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
