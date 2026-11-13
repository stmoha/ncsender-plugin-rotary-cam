// 0.11.5: Size the stock to fit the part (bottom of Stock & rotary) sizes the stock for the part as it is:
// across and long, the part and its scale stay. The other way to Scale to fit the stock.
// node test/e2e-v21.cjs <part> <outdir> [--dark] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8814));

fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await (await browser.newContext({ viewport: { width: 1500, height: 950 } })).newPage();
  const errors = [];
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const t = Date.now(), ms = () => ((Date.now() - t) / 1000).toFixed(1) + 's';
  let fails = 0;
  const ok = (cond, what) => { if (!cond) fails++; console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what); };
  const dark = process.argv.includes('--dark') ? '#dark' : '';
  const stockErrs = () => page.$$eval('#rcam-root .rc-msgs .rc-msg.rc-err', (els) => els.map((m) => m.textContent).filter((s) => /The part (is|needs)|Stock length/.test(s)));
  const notices = () => page.$$eval('#rcam-root .rc-toasts .rc-msg, #rcam-root .rc-msgs .rc-msg', (els) => els.map((m) => m.textContent));
  const setField = async (sel, v) => {
    await page.fill(sel, String(v)); await page.dispatchEvent(sel, 'change');
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(400);
  };
  const st = () => page.evaluate(() => { const s = window.RotaryCam.__state; return { min: s.mesh.min[0], max: s.mesh.max[0], scale: s.job.model.scale, clamp: s.job.stock.clamp }; });
  const header = () => page.evaluate(() => ({ l1: document.querySelector('#rcam-root .rc-sb1').textContent, bad: document.querySelector('#rcam-root .rc-stockbox').classList.contains('rc-bad') }));
  try {
    await page.goto('about:blank');
    await page.goto(`http://localhost:${PORT}/${dark}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.waitForTimeout(500);
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(400);
    await page.evaluate(() => { const d = document.querySelector('#rcam-root details[data-sec=stock]'); d.open = true; });
    const btn = '#rcam-root .rc-act[data-act=fitstock]';
    ok(await page.$(btn) && await page.textContent(btn) === 'Size the stock to fit the part' && await page.evaluate((b) => { const rows = document.querySelectorAll('#rcam-root details[data-sec=stock] .rc-row'); return rows[rows.length - 1].contains(document.querySelector(b)); }, btn), 'Stock & rotary has a Size the stock to fit the part button, last in the section');
    // ---- too thin and too short: one click fixes both, the part stays put
    for (const shape of ['round', 'square', 'rect']) {
      await page.selectOption('#rc-stock-shape', shape); await page.waitForTimeout(400);
      if (shape === 'round') await setField('#rc-stock-dia-round', 5);
      else if (shape === 'square') await setField('#rc-stock-width-square', 5);
      else { await setField('#rc-stock-width-rect', 5); await setField('#rc-stock-height-rect', 5); }
      await setField('#rc-tailstock_x', 20);
      const before = await st();
      ok((await stockErrs()).length >= 2, shape + ': too thin and too short, flagged');
      await page.click(btn); await page.waitForTimeout(600);
      const after = await st(), H = await header(), N = await notices();
      ok(!(await stockErrs()).length && !H.bad, shape + ': one click and both are fixed (' + H.l1 + ')');
      ok(Math.abs(after.min - before.min) < 1e-6 && Math.abs(after.max - before.max) < 1e-6 && after.scale === before.scale && after.clamp === before.clamp, shape + ': the part, its scale and the clamping distance stay');
      ok(N.some((s) => /^Stock set to .* long/.test(s)), shape + ': says what it set: ' + (N.find((s) => /Stock set to/.test(s)) || N.join(' | ')));
      if (shape === 'round') await page.screenshot({ path: path.join(outDir, 'fitstock.png') });
    }
    // ---- a stock much too big comes down to size too
    await page.selectOption('#rc-stock-shape', 'round'); await page.waitForTimeout(400);
    await setField('#rc-stock-dia-round', 300);
    await setField('#rc-tailstock_x', 900);
    await page.click(btn); await page.waitForTimeout(600);
    const s = await page.evaluate(() => { const S = window.RotaryCam.__state; return { d: S.job.stock.dia, r: S.mesh.rmax, ts: S.job.tailstock_x, max: S.mesh.max[0] }; });
    ok(s.d < 300 && s.d >= 2 * s.r + 2 - 1e-3 && s.d < 2 * s.r + 3 + 1e-3 && s.ts < 900 && s.ts > s.max, 'too-big stock shrinks to the part: Ø' + s.d + ', live centre at X' + s.ts);
    // ---- inch units (ncSender set to imperial): rounded up to a tenth of an inch
    await fetch(`http://localhost:${PORT}/__test/units`, { method: 'POST', body: 'imperial' });
    await page.goto('about:blank');
    await page.goto(`http://localhost:${PORT}/${dark}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.units === 'in' && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(400);
    await page.evaluate(() => { const d = document.querySelector('#rcam-root details[data-sec=stock]'); d.open = true; });
    await page.waitForSelector(btn + ':not([disabled])', { timeout: 5000 });   // enabled once the part is open, no edit needed
    await page.click(btn); await page.waitForTimeout(600);
    const iv = await page.evaluate(() => { const S = window.RotaryCam.__state; return { d: S.job.stock.dia, len: S.job.tailstock_x - S.job.chuck_face_x + Number(S.job.stock.clamp) }; });
    const tenth = (v) => Math.abs(v / 2.54 - Math.round(v / 2.54)) < 1e-6;
    ok(tenth(iv.d) && tenth(iv.len) && !(await stockErrs()).length, 'in inches the diameter and length are whole tenths: Ø' + (iv.d / 25.4).toFixed(3) + ' in × ' + (iv.len / 25.4).toFixed(3) + ' in, field shows ' + await page.inputValue('#rc-stock-dia-round'));
    ok(errors.length === 0, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  } catch (e) { fails++; console.log('ERROR', e); }
  await browser.close(); srv.kill();
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})();
