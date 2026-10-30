// 3D-view walkthrough: load a Z-up STEP part, check auto axis, centring, stock fit,
// click-to-top, generate, toolpaths in 3D, A preview, unrolled tab, load.
// node test/e2e-3d.cjs <part> <outdir> [--dark] [--viewport WxH]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = 8778;
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const vp = arg('--viewport', '1400x920').split('x').map(Number);
  const page = await browser.newPage({ viewport: { width: vp[0], height: vp[1] } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const S = () => page.evaluate(() => { const s = window.RotaryCam.__state; return { model: s.job.model, stock: s.job.stock_radius * 2, problems: s.problems, rmax: s.mesh && s.mesh.rmax, toast: document.querySelector('#rcam-root .rc-msgs').innerText }; });
  const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
  const t = Date.now(), ms = () => ((Date.now() - t) / 1000).toFixed(1) + 's';
  try {
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    const has3d = await page.evaluate(() => !!document.querySelector('#rcam-root .rc-3d canvas') && !document.querySelector('#rcam-root .rc-tabs').hidden);
    console.log(ms(), '3D view up:', has3d);
    await page.waitForTimeout(500); await shot('1-empty');

    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(600);
    let st = await S();
    console.log(ms(), 'loaded; auto axis:', st.model.axis, 'centre:', st.model.centre, 'Ø' + (st.rmax * 2).toFixed(2), 'stock Ø' + st.stock, '| msg:', st.toast.slice(0, 90));
    await shot('2-loaded');

    await page.selectOption('#rcam-root .rc-centre', 'chuck_end');
    await page.waitForTimeout(500);
    st = await S();
    console.log(ms(), 'centre -> chuck end: Ø' + (st.rmax * 2).toFixed(2), 'problems:', st.problems.map((p) => p.slice(0, 60)));
    await shot('3-chuck-end');
    const fit = await page.$('#rcam-root .rc-fitstock');
    if (fit) { await fit.click(); await page.waitForTimeout(400); st = await S(); console.log(ms(), 'fit stock ->', 'Ø' + st.stock, 'problems:', st.problems.length); }

    // click the middle of the view: should land on the part and turn that side up
    const box = await page.$eval('#rcam-root .rc-3d', (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    const before = (await S()).model.roll;
    await page.click('#rcam-root [data-view=front]');
    await page.waitForTimeout(400);
    await page.mouse.click(box.x + box.w * 0.5, box.y + box.h * 0.5);
    await page.waitForTimeout(500);
    st = await S();
    console.log(ms(), 'click-to-top: roll', before, '->', st.model.roll, '|', st.toast.slice(0, 80));
    await shot('4-picked');
    await page.click('#rcam-root [data-act=roll-]');
    await page.click('#rcam-root [data-act=flip]');
    st = await S();
    console.log(ms(), 'after Turn -90 and Flip: roll', st.model.roll, 'flip', st.model.flip);
    await page.click('#rcam-root [data-act=flip]');

    await page.selectOption('#rc-rough-tool', '11');
    await page.selectOption('#rc-finish-tool', '13');
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 1500000, polling: 1000 });
    const res = await page.evaluate(() => { const s = window.RotaryCam.__state; return { problems: s.problems, warnings: s.warnings.map((w) => w.slice(0, 70)), stats: document.querySelector('#rcam-root .rc-stats').innerText.replace(/\n/g, ' '), paths: s.program && s.program.paths && [s.program.paths.rough.length / 3, s.program.paths.finish.length / 3] }; });
    console.log(ms(), 'generated:', JSON.stringify(res));
    await page.waitForTimeout(600); await shot('5-toolpaths-iso');
    await page.click('#rcam-root [data-view=front]');
    await page.$eval('#rcam-root .rc-a', (el) => { el.value = 90; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.click('#rcam-root [data-path=rough]');
    await page.waitForTimeout(600); await shot('6-front-A90-finish-only');
    await page.click('#rcam-root [data-tab="2d"]');
    await page.waitForTimeout(300); await shot('7-unrolled');
    await page.click('#rcam-root [data-tab="3d"]');

    const dump = await page.evaluate(() => { const s = window.RotaryCam.__state; return { tris: Array.from(s.mesh.tris), job: s.job, gcode: s.program.gcode }; });
    const n = dump.tris.length / 9, buf = Buffer.alloc(84 + n * 50);
    buf.writeUInt32LE(n, 80);
    for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) buf.writeFloatLE(dump.tris[i * 9 + k], 84 + i * 50 + 12 + 4 * k);
    fs.writeFileSync(path.join(outDir, 'placed.stl'), buf);
    fs.writeFileSync(path.join(outDir, 'job.json'), JSON.stringify(dump.job, null, 2));
    await page.click('#rcam-root .rc-load');
    await page.waitForFunction(() => window.__closed > 0, null, { timeout: 30000 });
    const loaded = await (await fetch(`http://localhost:${PORT}/__test/loaded`)).json();
    fs.writeFileSync(path.join(outDir, 'program.nc'), loaded.content);
    console.log(ms(), 'loaded into ncSender:', loaded.filename, 'identical:', loaded.content === dump.gcode);
    await page.waitForTimeout(2000);
    const gone = await page.evaluate(() => !window.RotaryCam.viewer);
    console.log(ms(), '3D view released after close:', gone);
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
