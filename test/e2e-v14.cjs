// 0.9.1: settings survive. A stickout and flute length typed for a Tool Library tool stay
// when Rotary CAM opens again (the library re-sync leaves them alone); every change is saved
// as it's made and on Close; two computers with Rotary CAM open on the same ncSender don't
// write over each other's changes, and each sees the other's.
// node test/e2e-v14.cjs <part> <outdir> [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8802));
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
  // one "computer": its own browser, Rotary CAM open
  async function computer() {
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();
    page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    await page.goto(`http://localhost:${PORT}/`);
    await openRc(page);
    return { ctx, page };
  }
  async function openRc(page) {
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0 && document.querySelector('#rcam-root .rc-side details'), null, { timeout: 30000 });
    await page.waitForTimeout(400);
  }
  const openSec = (page, sec) => page.evaluate((s) => { const d = document.querySelector('#rcam-root details[data-sec=' + s + ']'); if (d) { d.open = true; d.scrollIntoView(); } }, sec);
  // type a value and wait until it's saved to ncSender
  const settle = (page) => page.waitForFunction(() => !window.RotaryCam.__state.savePending, null, { timeout: 10000 });
  const typeIn = async (page, sel, v) => { await page.fill(sel, String(v)); await page.dispatchEvent(sel, 'change'); await page.waitForTimeout(50); await settle(page); };
  const saved = async () => (await H('/__test/settings')).job || {};
  const job = (page) => page.evaluate(() => window.RotaryCam.__state.job);
  const closeRc = (page) => page.click('#rcam-root .rc-close');
  try {
    // ---- a library tool with your own stickout and flute length
    const A = await computer();
    await openSec(A.page, 'finish');
    await A.page.selectOption('#rc-finish-tool', '12');          // T2 1/4" ball, flutes 22 in the library
    await A.page.waitForTimeout(100); await settle(A.page);
    await typeIn(A.page, '#rc-finish-stickout', 33);
    await typeIn(A.page, '#rc-finish-tool_length', 20);
    await A.page.waitForTimeout(800);
    let s = await saved();
    ok(s.finish && s.finish.stickout === 33 && s.finish.tool_length === 20 && String(s.finish.library_id) === '12', 'saved as typed, still the library’s T2: stickout 33, flutes 20');
    // open again in a fresh page (as after an update): the library re-sync leaves them alone
    await A.ctx.close();
    const A2 = await computer();
    let j = await job(A2.page);
    ok(j.finish.stickout === 33 && j.finish.tool_length === 20 && String(j.finish.library_id) === '12' && j.finish.tool_number === 2, 'opened again: stickout 33 and flutes 20 kept, still linked to T2');
    // picking the tool again takes the library's values
    await openSec(A2.page, 'finish');
    await A2.page.selectOption('#rc-finish-tool', ''); await A2.page.waitForTimeout(300);
    await A2.page.selectOption('#rc-finish-tool', '12'); await A2.page.waitForTimeout(500);
    j = await job(A2.page);
    ok(j.finish.tool_length === 22, 'picking T2 again takes the library’s flutes (22)');
    await typeIn(A2.page, '#rc-finish-stickout', 33); await typeIn(A2.page, '#rc-finish-tool_length', 20);
    // a change saved even when Close comes right after it
    await openSec(A2.page, 'rough');
    await typeIn(A2.page, '#rc-rough-stickout', 37);
    await closeRc(A2.page);
    await A2.page.waitForTimeout(800);
    s = await saved();
    ok(s.rough && s.rough.stickout === 37, 'typed and closed at once: still saved (roughing stickout 37)');

    // ---- two computers on the same ncSender
    await openRc(A2.page);
    const B = await computer();              // B opens now: it sees roughing 37
    await openSec(A2.page, 'rough'); await typeIn(A2.page, '#rc-rough-stickout', 41);    // A changes roughing's stickout
    await A2.page.waitForTimeout(800);
    await openSec(B.page, 'rough'); await typeIn(B.page, '#rc-rough-tool_length', 30);   // B, which still shows 37, changes its flutes
    await B.page.waitForTimeout(1000);
    s = await saved();
    ok(s.rough.stickout === 41 && s.rough.tool_length === 30, `B's save keeps A's stickout: roughing stickout ${s.rough.stickout} (A), flutes ${s.rough.tool_length} (B)`);
    j = await job(B.page);
    ok(j.rough.stickout === 41, 'and B now shows A’s stickout (41)');
    // A, opened again in the same page (resumed from memory), catches up with B
    await closeRc(A2.page); await A2.page.waitForTimeout(300);
    await openRc(A2.page); await A2.page.waitForTimeout(1000);
    j = await job(A2.page);
    ok(j.rough.tool_length === 30 && j.rough.stickout === 41 && j.finish.stickout === 33 && j.finish.tool_length === 20, 'A, opened again, has B’s flutes and its own stickouts');
    // both change the same setting: the later one wins, nothing else is lost
    await openSec(A2.page, 'finish'); await typeIn(A2.page, '#rc-finish-feed', 1200); await A2.page.waitForTimeout(800);
    await openSec(B.page, 'finish'); await typeIn(B.page, '#rc-finish-feed', 1300); await B.page.waitForTimeout(1000);
    s = await saved();
    ok(s.finish.feed === 1300 && s.finish.stickout === 33 && s.rough.stickout === 41 && s.rough.tool_length === 30, 'both change the finishing feed: the later (1300) stands, the rest is kept');
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
