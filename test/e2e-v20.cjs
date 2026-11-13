// 0.11.5: the checks for stock that's too thin or too short name the field to change, and
// each has a button that sets it: Set Stock width / Stock diameter to..., Set Stock length to...
// node test/e2e-v20.cjs <part> <outdir> [--dark] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8813));

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
  const fixes = () => page.$$eval('#rcam-root .rc-msgs .rc-msg.rc-err', (els) => els.filter((m) => /^Fix/.test(m.textContent)).map((m) => ({
    text: m.querySelector('span').textContent, buttons: Array.from(m.querySelectorAll('button')).map((b) => b.textContent)
  })));
  const setField = async (sel, v) => {
    await page.fill(sel, String(v)); await page.dispatchEvent(sel, 'change');
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(400);
  };
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
    // ---- too short: the check says Stock length, and its button sets it
    await setField('#rc-tailstock_x', 20);
    let F = await fixes();
    if (process.env.DBG) console.log(JSON.stringify(F));
    const lf = F.find((f) => /Stock length is too short/.test(f.text));
    ok(lf && !/runs past the tailstock/.test(lf.text), 'too short: the check talks about the Stock length: ' + (lf && lf.text));
    ok(lf && /^Set Stock length to [\d.]+ mm$/.test(lf.buttons[0]), 'and its button says what it sets: ' + (lf && lf.buttons.join(' / ')));
    await page.screenshot({ path: path.join(outDir, 'short.png') });
    await page.click('#rcam-root .rc-fitlength');
    await page.waitForTimeout(500);
    F = await fixes();
    let H = await header();
    const want = lf && lf.buttons[0].replace('Set Stock length to ', '');
    ok(!F.some((f) => /Stock length/.test(f.text)) && !H.bad, 'the button fixes it: no check, the header isn’t red (' + H.l1 + ')');
    ok(want && H.l1.indexOf(want + ' long') > 0 && await page.inputValue('#rc-tailstock_x') === want.replace(' mm', ''), 'the Stock length field and the header show the length the button said: ' + want);
    // ---- too thin, round: Stock diameter
    await setField('#rc-stock-dia-round', 5);
    F = await fixes();
    const rf = F.find((f) => /^The part is/.test(f.text));
    ok(rf && /Stock diameter is only/.test(rf.text) && /^Set Stock diameter to [\d.]+ mm$/.test(rf.buttons[0]), 'too thin (round): names the Stock diameter, button: ' + (rf && rf.buttons[0]));
    await page.click('#rcam-root .rc-fitstock'); await page.waitForTimeout(500);
    ok(!(await fixes()).length && rf && await page.inputValue('#rc-stock-dia-round') === rf.buttons[0].replace(/^Set Stock diameter to | mm$/g, ''), 'the button sets the Stock diameter it said');
    // ---- too thin, square: Stock width; the length stays
    const before = await page.inputValue('#rc-tailstock_x');
    await page.selectOption('#rc-stock-shape', 'square'); await page.waitForTimeout(400);
    await setField('#rc-stock-width-square', 5);
    F = await fixes();
    const sf = F.find((f) => /^The part needs/.test(f.text));
    ok(sf && /the Stock width is only/.test(sf.text) && /^Set Stock width to [\d.]+ mm$/.test(sf.buttons[0]), 'too thin (square): names the Stock width, button: ' + (sf && sf.buttons[0]));
    await page.click('#rcam-root .rc-fitstock'); await page.waitForTimeout(500);
    ok(!(await fixes()).length && await page.inputValue('#rc-tailstock_x') === before, 'the Stock width is set and the Stock length stays ' + before);
    ok(errors.length === 0, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  } catch (e) { fails++; console.log('ERROR', e); }
  await browser.close(); srv.kill();
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})();
