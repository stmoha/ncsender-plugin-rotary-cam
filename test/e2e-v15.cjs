// 0.9.2: two computers with Rotary CAM open on the same ncSender. A change made on one is
// in the other before it generates, loads, saves or simulates, without closing anything, and
// shows up there on its own within a few seconds; toolpaths that no longer match are dropped.
// node test/e2e-v15.cjs <part> <outdir> [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8805));
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const H = (p) => fetch(`http://localhost:${PORT}${p}`).then((r) => r.json());
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errors = [];
  let fails = 0;
  const t = Date.now(), ms = () => ((Date.now() - t) / 1000).toFixed(1) + 's';
  const ok = (cond, what) => { if (!cond) fails++; console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what); };
  async function computer(name) {
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();
    page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(name + ' ' + m.type() + ': ' + m.text()); });
    page.on('pageerror', (e) => errors.push(name + ' pageerror: ' + e.message));
    await page.goto(`http://localhost:${PORT}/`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0 && document.querySelector('#rcam-root .rc-side details'), null, { timeout: 30000 });
    await page.waitForTimeout(400);
    return page;
  }
  const openSec = (page, sec) => page.evaluate((s) => { const d = document.querySelector('#rcam-root details[data-sec=' + s + ']'); if (d) { d.open = true; d.scrollIntoView(); } }, sec);
  const settle = (page) => page.waitForFunction(() => !window.RotaryCam.__state.savePending, null, { timeout: 10000 });
  const typeIn = async (page, sel, v) => { await page.fill(sel, String(v)); await page.dispatchEvent(sel, 'change'); await page.waitForTimeout(50); await settle(page); };
  const shown = (page) => page.$$eval('#rcam-root .rc-msg', (els) => els.map((e) => e.textContent).join(' | '));
  const generate = async (page) => {
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 900000, polling: 500 });
  };
  const opStickout = (g, op) => { const m = (g || '').match(new RegExp('\\(OP ' + op + ' [^\\n]*\\[stickout ([\\d.]+)\\]')); return m ? Number(m[1]) : null; };
  try {
    const A = await computer('A');
    await A.evaluate(() => { window.RotaryCam.__noPoll = true; });          // A doesn't look on its own (yet)
    await A.setInputFiles('#rcam-root input[type=file]', part);
    await A.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await A.selectOption('#rcam-root .rc-centre', 'origin'); await A.waitForTimeout(300);
    await openSec(A, 'stock'); await typeIn(A, '#rc-stock-dia-round', 44);
    await generate(A);
    ok(await A.evaluate(() => !!window.RotaryCam.__state.program), 'A generated a program (roughing stickout 31)');
    const B = await computer('B');
    await openSec(B, 'rough'); await typeIn(B, '#rc-rough-stickout', 36);
    ok((await H('/__test/settings')).job.rough.stickout === 36, 'B changes the roughing stickout to 36 (saved)');

    // A, without closing or reopening: Load into ncSender looks first, and won't send the old program
    await A.click('#rcam-root .rc-load');
    await A.waitForFunction(() => !window.RotaryCam.__state.program, null, { timeout: 10000 });
    await A.waitForTimeout(400);
    const loaded = await H('/__test/loaded');
    const msg = await shown(A);
    ok(!loaded.content && /changed on another computer/.test(msg) && /Roughing stickout/.test(msg) && /generate again/.test(msg), 'A’s Load into ncSender: not sent, the old program dropped, and it says why: ' + (msg.match(/Settings were changed[^|]*/) || [msg])[0]);
    ok(await A.evaluate(() => window.RotaryCam.__state.job.rough.stickout) === 36 && await A.$eval('#rc-rough-stickout', (e) => Number(e.value)) === 36, 'A now has 36, in the field too');
    // Generate on A uses B's change
    await openSec(B, 'finish'); await typeIn(B, '#rc-finish-stickout', 30);          // another change, A not told
    await generate(A);
    const g = await A.evaluate(() => window.RotaryCam.__state.program && window.RotaryCam.__state.program.gcode);
    ok(opStickout(g, 'rough') === 36 && opStickout(g, 'finish') === 30, `A's Generate uses both of B's changes: roughing stickout ${opStickout(g, 'rough')}, finishing ${opStickout(g, 'finish')}`);
    // left alone, A picks up a change within a few seconds
    await A.evaluate(() => { window.RotaryCam.__noPoll = false; });
    await openSec(B, 'finish'); await typeIn(B, '#rc-finish-feed', 1350);
    const t0 = Date.now();
    await A.waitForFunction(() => window.RotaryCam.__state.job.finish.feed === 1350, null, { timeout: 15000 });
    await A.waitForTimeout(300);
    const msg2 = await shown(A);
    ok(!(await A.evaluate(() => !!window.RotaryCam.__state.program)) && /Finishing feed/.test(msg2), `left alone, A has B's finishing feed in ${((Date.now() - t0) / 1000).toFixed(1)} s, and dropped the toolpaths that no longer match`);
    await A.screenshot({ path: path.join(outDir, 'changed-elsewhere.png') });
    // typing on A while B changes something else: A's field isn't pulled out from under it
    await openSec(A, 'rough'); await A.focus('#rc-rough-feed'); await A.fill('#rc-rough-feed', '18');
    await openSec(B, 'rough'); await typeIn(B, '#rc-rough-plunge_feed', 444);
    await A.waitForFunction(() => window.RotaryCam.__state.job.rough.plunge_feed === 444, null, { timeout: 15000 });
    ok(await A.evaluate(() => document.activeElement && document.activeElement.id) === 'rc-rough-feed' && await A.$eval('#rc-rough-feed', (e) => e.value) === '18', 'while A types, B’s change comes in without taking A’s field away');
    await A.fill('#rc-rough-feed', '1800'); await A.dispatchEvent('#rc-rough-feed', 'change'); await A.evaluate(() => document.activeElement.blur()); await A.waitForTimeout(50); await settle(A);
    const sv = (await H('/__test/settings')).job;
    ok(sv.rough.feed === 1800 && sv.rough.plunge_feed === 444 && await A.$eval('#rc-rough-plunge_feed', (e) => Number(e.value)) === 444, 'and once A leaves the field, both are saved and A shows B’s value');
  } catch (e) {
    fails++;
    console.log('FAILED:', e.message);
  } finally {
    console.log('console errors/warnings:', errors.length ? errors : 'none');
    console.log(fails ? `${fails} FAILED` : 'ALL PASS');
    process.exitCode = fails || errors.length ? 1 : 0;
    await browser.close();
    srv.kill();
  }
})();
