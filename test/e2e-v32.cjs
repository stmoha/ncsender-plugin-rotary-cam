// 0.15.1: closer to the ends. Roughing › Make room for the collet nut at the ends (on by
// default) turns the switch on and off; Rotary & spindle › Jaws stick out past X's face keeps
// the cuts off jaws that stand proud; a Check says to look at the jaws when a cut comes within
// 1/4" of the jaw face. node test/e2e-v32.cjs <outdir> [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const UH = require('./ui-helpers.cjs');
const [outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8832));
const sel = (s) => '#rcam-root ' + s;

fs.mkdirSync(outDir || 'out', { recursive: true });
(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errors = [];
  let fails = 0;
  const t0 = Date.now(), ms = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';
  const ok = (cond, what) => { if (!cond) fails++; console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what); };
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const F = (k) => sel(`[data-k="${k}"]`);
  const job = (k) => page.evaluate((k) => k.split('.').reduce((o, p) => o && o[p], window.RotaryCam.__state.job), k);
  const type = async (k, text) => { await page.fill(F(k), text); await page.press(F(k), 'Tab'); await page.waitForTimeout(300); };
  const notices = () => page.$$eval('#rcam-root .rc-toasts .rc-msg, #rcam-root .rc-msgs .rc-msg', (els) => els.map((m) => m.textContent).join(' | '));
  const openAll = () => page.evaluate(() => document.querySelectorAll('#rcam-root details[data-sec]').forEach((d) => { d.open = true; }));
  const generate = async () => {
    await page.evaluate(() => { window.RotaryCam.__state.program = null; });
    await page.click(sel('.rc-gen'));
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 900000, polling: 500 });
    await page.waitForTimeout(500);
  };
  try {
    await page.goto(`http://localhost:${PORT}/`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0 && document.querySelector('#rcam-root .rc-side .rc-grp'), null, { timeout: 30000 });
    await page.waitForTimeout(800);
    await UH.openGroups(page);
    await openAll();

    // the switch, in Roughing
    await UH.openStrat(page, 'rough');
    await page.waitForTimeout(300);
    const box = await page.$(F('rough.relief'));
    const lbl = box && await page.evaluate((e) => (e.closest('label, .rc-row') || e.parentElement).textContent, box);
    ok(box && await box.isChecked() && /Make room for the collet nut at the ends/.test(lbl || ''), 'Roughing has Make room for the collet nut at the ends, ticked: ' + (lbl || '').trim().slice(0, 60));
    await box.click(); await page.waitForTimeout(300);
    ok(await job('rough.relief') === false, 'unticking it turns it off');
    await (await page.$(F('rough.relief'))).click(); await page.waitForTimeout(300);
    ok(await job('rough.relief') === true, 'and ticking it turns it back on');

    // the jaws, in Rotary & spindle
    await openAll();
    ok(!!(await page.$(F('rig.chuck.jaws_out'))), 'Rotary & spindle has Jaws stick out past X’s face');
    const tip = await page.$eval(F('chuck_clearance'), (e) => (e.closest('.rc-row') || e.parentElement).getAttribute('title') || e.title || '');
    ok(/1\/8/.test(tip),'Keep away from the jaws says what it keeps (' + tip.slice(0, 60) + ')');

    // a part, roughing started 1/8" off the jaws: the Check about the jaws
    await page.setInputFiles('#rcam-root input[type=file]', path.join(__dirname, 'horn.stl'));
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.evaluate(() => { const S = window.RotaryCam.__state; S.job.angle_step_deg = 6; S.job.finish.enabled = false; S.job.index.enabled = false; S.job.rig.x0_ahead = 0; S.job.chuck_clearance = 3.175; S.job.x_start = 6.35; });
    await generate();
    let n = await notices();
    ok(/The cutter comes within 3\.\d mm of the jaw face .*jaws don’t stick out past the face X was set from/.test(n), 'roughing 1/8" off the jaws: a Check says to look at the jaws: ' + (n.match(/The cutter comes within[^|]*/) || ['(none)'])[0].slice(0, 160));
    await openAll();
    await type('rig.chuck.jaws_out', '1/16"');
    const jo = await job('rig.chuck.jaws_out');
    ok(Math.abs(jo - 1.5875) < 1e-3, `jaws sticking out 1/16" (${jo} mm)`);
    await generate();
    n = await notices();
    ok(/from the jaws themselves, which stick out 1\.6 mm/.test(n), 'then the Check counts from the jaws themselves: ' + (n.match(/The cutter comes within[^|]*/) || ['(none)'])[0].slice(0, 160));
    const minX = await page.evaluate(() => Math.min(...window.RotaryCam.__state.program.gcode.split('\n').filter((l) => /^G1 /.test(l)).map((l) => l.match(/X(-?[\d.]+)/)).filter(Boolean).map((m) => Number(m[1]))));
    ok(minX >= 3.175 + 1.5875 + 3.175 - 0.01, `and no cut comes closer: the 1/4" cutter’s centre stays at X${minX} or more`);
    await page.screenshot({ path: path.join(outDir || 'out', 'v32.png') });
  } catch (e) {
    fails++; console.log('ERROR', e && e.stack || e);
  } finally {
    ok(errors.length === 0, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 5).join(' | ') : ''));
    await browser.close(); srv.kill();
    console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
    process.exit(fails ? 1 : 0);
  }
})();
