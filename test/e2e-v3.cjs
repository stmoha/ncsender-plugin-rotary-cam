// 0.3.0 walkthrough: full-window dialog, startup view, inch units, square stock,
// live edits, off-click guard, op pills, reopen + reload restore, inch G-code.
// node test/e2e-v3.cjs <part> <outdir> [--dark] [--viewport WxH] [--metric]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = 8779;
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  if (!process.argv.includes('--metric')) await fetch(`http://localhost:${PORT}/__test/units`, { method: 'POST', body: 'imperial' });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const vp = arg('--viewport', '1500x950').split('x').map(Number);
  const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const S = () => page.evaluate(() => { const s = window.RotaryCam.__state; return { units: s.units, model: s.job.model, stock: s.job.stock, problems: s.problems, file: s.fileName, mesh: !!s.mesh, min: s.mesh && s.mesh.min, program: !!s.program, op: s.ui.op, busy: s.busy }; });
  const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
  const open = async () => { await page.click('#open'); await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0 && document.querySelector('#rcam-root .rc-side details'), null, { timeout: 30000 }); await page.waitForTimeout(700); };
  const t = Date.now(), ms = () => ((Date.now() - t) / 1000).toFixed(1) + 's';
  const ok = (cond, what) => console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what);
  try {
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    await open();
    await shot('1-startup');
    const size = await page.$eval('#rcam-root', (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
    ok(size[0] >= vp[0] - 60 && size[1] >= vp[1] - 60, `dialog fills the window (${size.join('x')} of ${vp.join('x')})`);
    const headerHidden = await page.$eval('.plugin-dialog-header', (el) => getComputedStyle(el).display === 'none');
    ok(headerHidden, 'ncSender title bar hidden, own header shown');
    const st0 = await S();
    ok(st0.units === (process.argv.includes('--metric') ? 'mm' : 'in'), `units from ncSender: ${st0.units}`);
    const unitLabel = await page.$eval('#rc-stock-dia-round', (el) => el.parentElement.querySelector('.rc-unit').textContent + ' value ' + el.value);
    console.log(ms(), '   stock diameter field shows:', unitLabel);
    const tips = await page.$$eval('#rcam-root .rc-side [title]', (els) => els.length);
    ok(tips > 30, `tooltips on the settings (${tips})`);

    // load the part
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(800);
    let st = await S();
    console.log(ms(), '   loaded', st.file, 'axis', st.model.axis, 'problems:', st.problems.map((p) => p.slice(0, 70)));
    await shot('2-loaded');

    // square stock, then fit
    await page.selectOption('#rc-stock-shape', 'square');
    await page.waitForTimeout(400);
    st = await S();
    console.log(ms(), '   square stock', JSON.stringify(st.stock), 'problems:', st.problems.map((p) => p.slice(0, 80)));
    const fit = await page.$('#rcam-root .rc-fitstock');
    if (fit) { await fit.click(); await page.waitForTimeout(400); }
    st = await S();
    ok(st.problems.length === 0 && st.stock.shape === 'square', 'square stock fitted: side ' + st.stock.width + ' mm');
    await shot('3-square-stock');

    // live edit with the keyboard: no blur, mesh moves
    const before = (await S()).min[0];
    await page.click('#rc-model-part_start_x');
    await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(500);
    const after = (await S()).min[0];
    ok(after > before, `arrow keys move the part live (X start ${before.toFixed(2)} -> ${after.toFixed(2)} mm)`);

    // off-click guard: press in the 3D view, release on the backdrop
    const view = await page.$eval('#rcam-root .rc-3d', (el) => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    await page.mouse.move(view.x, view.y); await page.mouse.down();
    await page.mouse.move(5, 5, { steps: 8 }); await page.mouse.up();
    await page.waitForTimeout(300);
    ok(await page.evaluate(() => window.__closed === 0), 'drag from the view out to the backdrop does not close the dialog');

    // op pills
    await page.click('#rcam-root .rc-op[data-op=rough]');
    ok((await S()).op === 'rough', 'Roughing pill selects roughing');
    ok(await page.$eval('#rcam-root details[data-sec=rough]', (d) => d.open), 'Roughing pill opens the roughing settings');
    await page.selectOption('#rc-rough-tool', '11');
    await page.evaluate(() => { document.querySelector('#rcam-root details[data-sec=finish]').open = true; });
    await page.selectOption('#rc-finish-tool', '13');
    await page.click('#rcam-root .rc-op[data-op=rough]');
    await shot('4-rough-tool');

    // generate
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 1500000, polling: 1000 });
    const stats = await page.$eval('#rcam-root .rc-stats', (el) => el.innerText.replace(/\n/g, ' '));
    console.log(ms(), '   generated:', stats);
    await page.waitForTimeout(600); await shot('5-rough-paths');
    await page.click('#rcam-root .rc-op[data-op=finish]');
    await page.waitForTimeout(500); await shot('6-finish-paths');
    await page.click('#rcam-root [data-tab="2d"]'); await page.waitForTimeout(300); await shot('7-unrolled');
    await page.click('#rcam-root [data-tab="3d"]');
    await page.$eval('#rcam-root .rc-a', (el) => { el.value = 37; el.dispatchEvent(new Event('input', { bubbles: true })); });

    const dump = await page.evaluate(() => { const s = window.RotaryCam.__state; return { tris: Array.from(s.mesh.tris), job: s.job, gcode: s.program.gcode }; });
    const n = dump.tris.length / 9, buf = Buffer.alloc(84 + n * 50);
    buf.writeUInt32LE(n, 80);
    for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) buf.writeFloatLE(dump.tris[i * 9 + k], 84 + i * 50 + 12 + 4 * k);
    fs.writeFileSync(path.join(outDir, 'placed.stl'), buf);
    fs.writeFileSync(path.join(outDir, 'job.json'), JSON.stringify(dump.job, null, 2));
    fs.writeFileSync(path.join(outDir, 'program.nc'), dump.gcode);
    console.log(ms(), '   program header:', dump.gcode.split('\n').slice(4, 9).join(' | '));

    // full click on the backdrop closes; reopen keeps everything
    await page.mouse.click(5, 5);
    await page.waitForTimeout(300);
    ok(await page.evaluate(() => window.__closed === 1), 'a full click on the backdrop still closes it');
    await open();
    st = await S();
    const a = await page.$eval('#rcam-root .rc-a', (el) => el.value);
    ok(st.mesh && st.program && st.file && st.op === 'finish' && a === '37', `reopen keeps part, toolpaths, op and A (${st.file}, op ${st.op}, A ${a})`);
    await shot('8-reopened');

    // page reload: part and toolpaths come back from browser storage
    await page.reload();
    await open();
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 30000 });
    await page.waitForTimeout(800);
    st = await S();
    ok(st.mesh && st.program, `after a page reload: part ${st.mesh ? 'restored' : 'missing'}, toolpaths ${st.program ? 'restored' : 'missing'}`);
    await shot('9-after-reload');
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
