// 0.11.6: Deepest below the axis (Stock & rotary). Empty (auto): the rotary passes go past the
// axis only where nothing else reaches, and a message says how deep and where; 0 keeps them
// above it. node test/e2e-v22.cjs test/slot_test.step <outdir> [--dark] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8815));

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
  const notices = () => page.$$eval('#rcam-root .rc-toasts .rc-msg, #rcam-root .rc-msgs .rc-msg', (els) => els.map((m) => m.textContent));
  const F = '#rc-below_axis';
  const setField = async (v) => {
    await page.fill(F, String(v)); await page.dispatchEvent(F, 'change');
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(400);
  };
  const generate = async () => {
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 600000, polling: 500 });
    await page.waitForTimeout(500);
    return page.evaluate(() => {
      const S = window.RotaryCam.__state; let zmin = Infinity;
      if (S.program) S.program.gcode.split('\n').forEach((l) => { const m = !/G53/.test(l) && l.match(/^[GXYZA].*Z(-?[\d.]+)/); if (m) zmin = Math.min(zmin, Number(m[1])); });
      return { probs: S.problems, zmin, below: S.maps && S.maps.below, warns: S.warnings };
    });
  };
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
    await page.click('#rcam-root [data-act=fitstock]'); await page.waitForTimeout(600);
    await page.evaluate(() => { const S = window.RotaryCam.__state; S.job.index.enabled = false; S.job.corners.enabled = false; });

    ok(await page.$(F) && await page.getAttribute(F, 'placeholder') === 'auto' && await page.inputValue(F) === '', 'Stock & rotary has Deepest below the axis, empty (auto) to start');
    const lab = await page.evaluate((f) => { const el = document.querySelector(f).closest('.rc-row'); return el && el.textContent; }, F);
    ok(/Deepest below the axis/.test(lab || ''), 'labelled Deepest below the axis');
    await page.screenshot({ path: path.join(outDir, 'below-field.png') });

    let r = await generate();
    ok(!r.probs.length && r.zmin < -5.5, `auto: the program goes past the axis at the hole's bottom and in the slot (lowest Z ${r.zmin.toFixed(3)})`);
    let n = (await notices()).find((s) => /past the rotary axis/.test(s));
    ok(n && /air-cut it first/.test(n) && /set Deepest below the axis \(Stock & rotary\) to 0/.test(n), 'auto: a message says how deep and where, and how to keep it above the axis: ' + (n || '').slice(0, 120));
    await page.screenshot({ path: path.join(outDir, 'below-auto.png') });

    await setField(0);
    ok(await page.evaluate(() => window.RotaryCam.__state.job.below_axis) === 0 && !(await page.evaluate(() => window.RotaryCam.__state.program)), '0 is kept, and the toolpaths are out of date');
    r = await generate();
    ok(!r.probs.length && r.zmin >= -1e-3, `at 0: nothing past the axis (lowest Z ${r.zmin.toFixed(3)})`);
    ok(!(await notices()).some((s) => /past the rotary axis/.test(s)), 'at 0: no message');

    await setField('');
    ok(await page.evaluate(() => window.RotaryCam.__state.job.below_axis) === null, 'emptied: back to auto');
  } catch (e) { ok(false, 'threw: ' + (e && e.stack || e)); }
  ok(!errors.length, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  await browser.close(); srv.kill();
  process.exit(fails ? 1 : 0);
})();
