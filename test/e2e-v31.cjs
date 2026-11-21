// 0.15.0: lengths and feeds take a unit or a sum (t0n3's ncsender-unit-input): 1/4", 6.35mm,
// 1-1/2 in, 100ipm, 8mm*2. A plain number is in the units shown; it shows as the number it is
// once it's in; Up and Down step it; text that can't be read turns the field red and says why.
// The same in the Probe the chuck dialog, and on an inch machine. node test/e2e-v31.cjs <outdir> [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const UH = require('./ui-helpers.cjs');
const [outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8831));
const sel = (s) => '#rcam-root ' + s;
const D = '#rcam-root .rc-pover';

fs.mkdirSync(outDir || 'out', { recursive: true });
(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const H = (p, b) => fetch(`http://localhost:${PORT}${p}`, b === undefined ? {} : { method: 'POST', body: b }).then((r) => r.json());
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errors = [];
  let fails = 0;
  const t0 = Date.now(), ms = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';
  const ok = (cond, what) => { if (!cond) fails++; console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what); };
  let page;
  const open = async () => {
    if (page) await page.context().close();
    const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 } });
    page = await ctx.newPage();
    page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    await page.goto(`http://localhost:${PORT}/`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0 && document.querySelector('#rcam-root .rc-side .rc-grp'), null, { timeout: 30000 });
    await page.waitForTimeout(800);
    await UH.openGroups(page);
    await page.evaluate(() => { const d = document.querySelector('#rcam-root details[data-sec=stock]'); if (d) d.open = true; });
  };
  const F = (k) => sel(`[data-k="${k}"]`);
  const job = (k) => page.evaluate((k) => k.split('.').reduce((o, p) => o && o[p], window.RotaryCam.__state.job), k);
  const shown = (k) => page.$eval(F(k), (e) => e.value);
  const type = async (k, text, key = 'Tab') => { await page.fill(F(k), text); await page.press(F(k), key); await page.waitForTimeout(300); };
  const near = (a, b) => Math.abs(Number(a) - b) < 1e-6;
  try {
    // ---------------- metric
    await open();
    const attrs = await page.$eval(F('stock.dia'), (e) => ({ type: e.type, unit: e.getAttribute('data-unit'), align: getComputedStyle(e).textAlign }));
    ok(attrs.type === 'text' && attrs.unit === 'length' && attrs.align === 'right', 'a length is a text field that takes units, right-aligned like a number: ' + JSON.stringify(attrs));
    await type('stock.dia', '1-1/2"');
    ok(near(await job('stock.dia'), 38.1) && await shown('stock.dia') === '38.1', `1-1/2" is 38.1 mm, and shows as 38.1 (${await job('stock.dia')}, "${await shown('stock.dia')}")`);
    await type('stock.dia', '8mm*2+1in');
    ok(near(await job('stock.dia'), 41.4) && await shown('stock.dia') === '41.4', `a sum: 8mm*2+1in is 41.4 mm (${await job('stock.dia')})`);
    await type('stock.dia', '1/4"', 'Enter');
    ok(near(await job('stock.dia'), 6.35) && await shown('stock.dia') === '6.35', `Enter takes it too: 1/4" is 6.35 (${await job('stock.dia')}, "${await shown('stock.dia')}")`);
    await page.press(F('stock.dia'), 'ArrowUp'); await page.waitForTimeout(300);
    ok(near(await job('stock.dia'), 7.35) && await shown('stock.dia') === '7.35', `Up steps it by 1 (${await job('stock.dia')})`);
    await page.press(F('stock.dia'), 'Shift+ArrowDown'); await page.waitForTimeout(300);
    await page.press(F('stock.dia'), 'Tab'); await page.waitForTimeout(300);
    ok(near(await job('stock.dia'), -2.65), `Shift+Down steps by 10 (${await job('stock.dia')})`);
    await type('stock.dia', '30');
    ok(near(await job('stock.dia'), 30), 'a plain number is in the units shown (30 mm)');
    await type('stock.dia', 'abc');
    const bad = await page.$eval(F('stock.dia'), (e) => ({ red: e.classList.contains('rc-unread'), title: e.title }));
    ok(bad.red && /Can.t read .abc.. Type a number/.test(bad.title) && near(await job('stock.dia'), 30), 'text that can’t be read: the field turns red, says why, and the setting stays: ' + bad.title);
    await type('stock.dia', '1,000');
    const comma = await page.$eval(F('stock.dia'), (e) => e.title);
    ok(/1,000 could be 1000 or 1\.000/.test(comma) && near(await job('stock.dia'), 30), 'a comma that may be a thousands separator says so: ' + comma);
    await type('stock.dia', '32,5');
    const fixed = await page.$eval(F('stock.dia'), (e) => ({ red: e.classList.contains('rc-unread'), title: e.title }));
    ok(!fixed.red && near(await job('stock.dia'), 32.5) && !/Can.t read|could be/.test(fixed.title), `a decimal comma reads as a point, and the field is itself again (32,5 -> ${await job('stock.dia')})`);
    // a field emptied that can be left on auto still goes back to auto
    await UH.openStrat(page, 'rough');
    await page.waitForTimeout(300);
    const feedAttr = await page.$eval(F('rough.feed'), (e) => e.getAttribute('data-unit'));
    await type('rough.feed', '100ipm');
    ok(feedAttr === 'feed' && near(await job('rough.feed'), 2540) && await shown('rough.feed') === '2540', `a feed takes 100ipm: 2540 mm/min (${await job('rough.feed')})`);
    await type('rough.feed', '25mm/s');
    ok(near(await job('rough.feed'), 1500), `25mm/s is 1500 mm/min (${await job('rough.feed')})`);
    const pct = await page.$eval(sel('[data-pct="rough.pitch"]'), (e) => e.type).catch(() => null);
    ok(pct === 'number', 'a % stays a number field (' + pct + ')');
    // the Probe the chuck dialog
    await page.click(sel('.rc-probechuck'));
    await page.waitForSelector(D + ' .rc-pcard');
    await page.fill('#rc-p-pin_dia', '1/4"'); await page.press('#rc-p-pin_dia', 'Tab'); await page.waitForTimeout(300);
    const pin = await page.evaluate(() => window.RotaryCam.__state.job.rig.probe.pin_dia);
    ok(near(pin, 6.35) && await page.$eval('#rc-p-pin_dia', (e) => e.value) === '6.35', `Probe the chuck: a 1/4" pin is 6.35 mm (${pin})`);
    await page.fill('#rc-p-pin_dia', '6..'); await page.press('#rc-p-pin_dia', 'Tab'); await page.waitForTimeout(300);
    ok(await page.$eval('#rc-p-pin_dia', (e) => e.classList.contains('rc-unread')) && near(await page.evaluate(() => window.RotaryCam.__state.job.rig.probe.pin_dia), 6.35), 'Probe the chuck: text that can’t be read turns red, and the pin stays 6.35');
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);

    // ---------------- inches
    await H('/__test/units', 'imperial');
    await open();
    ok(await shown('stock.dia') === String(+(32.5 / 25.4).toFixed(4)), 'on an inch machine it shows in inches (' + await shown('stock.dia') + ')');
    await type('stock.dia', '25.4mm');
    ok(near(await job('stock.dia'), 25.4) && await shown('stock.dia') === '1', `25.4mm on an inch machine: 25.4 mm, shown as 1 (${await job('stock.dia')}, "${await shown('stock.dia')}")`);
    await type('stock.dia', '0.2362');
    ok(near(await job('stock.dia'), 6), `0.2362 in comes back as the 6 mm it showed, not 5.99948 (${await job('stock.dia')})`);
    await type('stock.dia', '1 1/2');
    ok(near(await job('stock.dia'), 38.1), `1 1/2 with no unit is inches here: 38.1 mm (${await job('stock.dia')})`);
    await page.press(F('stock.dia'), 'Alt+ArrowUp'); await page.waitForTimeout(300);
    ok(await shown('stock.dia') === '1.6' && near(await job('stock.dia'), 40.64), `Alt+Up steps 0.1 in (${await shown('stock.dia')})`);
    await page.screenshot({ path: path.join(outDir || 'out', 'v31-inch.png') });
  } catch (e) {
    fails++; console.log('ERROR', e && e.stack || e);
  } finally {
    ok(errors.length === 0, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 5).join(' | ') : ''));
    await browser.close(); srv.kill();
    console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
    process.exit(fails ? 1 : 0);
  }
})();
