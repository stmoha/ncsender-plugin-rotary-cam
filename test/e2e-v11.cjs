// 0.8.0 walkthrough (the corner zero part is gone since 0.13.0): work zero from a corner of the rotary (offsets, the 3D corner and its
// dimensions, Move zero to the rotary axis through ncSender, Remember axis / corner); the
// G-code zero marker; a 4-jaw chuck on square stock that turns with A; the silver headstock;
// the spindle going see-through from the top; tenon length and scale to fit.
// node test/e2e-v11.cjs <part> <outdir> [--dark] [--viewport WxH] [--metric] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const UH = require('./ui-helpers.cjs');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8798));
const metric = process.argv.includes('--metric');
const U = metric ? 1 : 25.4, IN = 25.4;
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const H = (p, b) => fetch(`http://localhost:${PORT}${p}`, b ? { method: 'POST', body: typeof b === 'string' ? b : JSON.stringify(b) } : undefined).then((r) => r.json());
  if (!metric) await H('/__test/units', 'imperial');
  // the controller is in inches (G20), the way Stefan runs it
  await H('/__test/machine', { ctrl: { metric: false } });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const vp = arg('--viewport', '1500x950').split('x').map(Number);
  const page = await (await browser.newContext({ viewport: { width: vp[0], height: vp[1] } })).newPage();
  const errors = [];
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
  const t = Date.now(), ms = () => ((Date.now() - t) / 1000).toFixed(1) + 's';
  let fails = 0;
  const ok = (cond, what) => { if (!cond) fails++; console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what); };
  const openSec = async (sec) => { if (['corners', 'rough', 'finish', 'finish2', 'index', 'parting'].includes(sec)) return UH.openStrat(page, sec); await UH.openGroups(page); await page.evaluate((s) => { const d = document.querySelector('#rcam-root details[data-sec=' + s + ']'); if (d) { d.open = true; d.scrollIntoView(); } }, sec); };
  const typeIn = async (sel, v) => { await page.fill(sel, String(v)); await page.dispatchEvent(sel, 'change'); await page.waitForTimeout(300); };
  const D = (mm) => (mm / U).toFixed(metric ? 3 : 4);
  const V = () => page.evaluate(() => window.RotaryCam.viewer);
  const st = (f) => page.evaluate(f);
  const hl = () => st(() => window.RotaryCam.viewer.highlighted());
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const g54 = async () => (await H('/__test/commands')).machine.g54.split(',').map(Number);
  const setG54 = (q) => H('/__test/machine', { machine: { g54: [q.x, q.y, q.z, 0].map((v) => v.toFixed(3)).join(',') } });
  const act = async (a) => { await page.click(`#rcam-root [data-act=${a}]`); };
  const zeroMsg = () => st(() => window.RotaryCam.__state.zeroMsg || '');
  try {
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.selectOption('#rcam-root .rc-centre', 'origin');
    await page.waitForTimeout(300);
    await openSec('stock');
    await page.selectOption('#rc-stock-shape', 'square'); await page.waitForTimeout(300);
    await typeIn('#rc-stock-width-square', D(44));

    // ---- the G-code zero, the 4-jaw chuck, the silver headstock
    const o = await st(() => window.RotaryCam.viewer.origin());
    ok(o && near(o.x, 0, 1e-6) && near(o.y, 0, 1e-6) && near(o.z, 0, 1e-6) && o.onTop && o.label, `the G-code zero is marked at the jaw face on the axis (X${o && o.x} Y${o && o.y} Z${o && o.z}), drawn through the stock, labelled`);
    let jaws = await st(() => window.RotaryCam.viewer.jaws());
    const onFlats = jaws.length === 4 && jaws.every((p) => near(Math.min(Math.abs(p.y), Math.abs(p.z)), 0, 1e-6));
    ok(onFlats, `the chuck has 4 jaws, square to the stock's flats at A0 (${jaws.map((p) => 'Y' + p.y.toFixed(0) + ' Z' + p.z.toFixed(0)).join(', ')})`);
    await page.$eval('#rcam-root .rc-a', (el) => { el.value = 45; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForTimeout(300);
    jaws = await st(() => window.RotaryCam.viewer.jaws());
    ok(jaws.every((p) => near(Math.abs(p.y), Math.abs(p.z), 0.01)), 'turning A to 45° turns the jaws with the stock');
    await shot('jaws-a45');
    await page.$eval('#rcam-root .rc-a', (el) => { el.value = 0; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await openSec('rig');
    await page.selectOption('#rc-rig-chuck-jaws', '3'); await page.waitForTimeout(300);
    ok((await st(() => window.RotaryCam.viewer.jaws())).length === 3, 'Jaws: 3 draws a 3-jaw chuck');
    await page.selectOption('#rc-rig-chuck-jaws', '4'); await page.waitForTimeout(300);
    await page.click('[data-view=whole]'); await page.waitForTimeout(500);
    const shade = await st(() => window.RotaryCam.viewer.headShade());
    ok(shade > 0.55, `the headstock comes out silver, not dark (lightness ${shade && shade.toFixed(2)})`);
    await shot('silver-headstock');
    await page.click('[data-view=iso]'); await page.waitForTimeout(300);

    // ---- the collet nut and spindle go see-through when they hide the part
    await page.click('[data-view=top]'); await page.waitForTimeout(600);
    const topOp = (await st(() => window.RotaryCam.viewer.holderOpacity())).tool;
    await shot('top-view-spindle');
    await page.click('[data-view=front]'); await page.waitForTimeout(600);
    const frontOp = (await st(() => window.RotaryCam.viewer.holderOpacity())).tool;
    ok(topOp < 0.4 && frontOp > 0.95, `the spindle is see-through from the top (opacity ${topOp.toFixed(2)}), solid from the front (${frontOp.toFixed(2)})`);
    await page.click('[data-view=iso]'); await page.waitForTimeout(400);

    // ---- generate, so we can see the corner offsets don't touch the toolpaths
    for (const [s, id] of [['rough', '11'], ['finish', '13']]) { await openSec(s); await page.selectOption(`#rc-${s}-tool`, id); }
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 900000, polling: 500 });
    ok(await st(() => !!window.RotaryCam.__state.program), 'toolpaths generated');

    // ---- work zero: 0.13.0 dropped the corner method (Move zero to the rotary axis, Remember
    // axis / corner); the work zero is the Probe the chuck button beside Generate (e2e-v26)
    ok(!(await page.$('#rcam-root details[data-sec=zero]')) && !!(await page.$('#rcam-root .rc-probechuck')), 'no Work zero section: Probe the chuck is a button beside Generate');

    // ---- tenon length, and scale to fit leaving it
    await openSec('tenons');
    await page.mouse.move(vp[0] - 40, vp[1] / 2);
    await page.focus('#rc-tenons-chuck-len'); await page.waitForTimeout(300);
    let h = await hl();
    ok(h && h.key === 'tenons.chuck.len' && h.parts > 0 && h.dims > 0, 'Length out of the part shows the tenon and its length ' + JSON.stringify(h));
    ok(await page.$eval('#rc-tenons-chuck-len', (e) => e.placeholder === 'auto' && e.value === ''), 'empty means auto');
    await typeIn('#rc-tenons-chuck-len', D(20));
    const tl = await st(() => window.RotaryCam.__state.job.tenons);
    ok(near(tl.chuck.len, 20, 0.003) && near(tl.tailstock.len, 20, 0.003), 'with Same at both ends it sets both: ' + tl.chuck.len.toFixed(3) + ' mm');
    await shot('tenon-len');
    // a short setup, so the length (not the stock) sets the size
    await openSec('stock'); await typeIn('#rc-tailstock_x', D(120));
    await openSec('part');
    await page.click('#rcam-root .rc-act[data-act=fitscale]'); await page.waitForTimeout(800);
    const toast = await page.$$eval('#rcam-root .rc-msg.rc-ok', (els) => els.map((e) => e.textContent).join(' '));
    const mesh = await st(() => { const m = window.RotaryCam.__state.mesh, j = window.RotaryCam.__state.job; return { lo: m.min[0], hi: m.max[0], tail: j.tailstock_x, tc: j.tailstock_clearance }; });
    ok(/tenon/.test(toast) && mesh.hi <= mesh.tail - mesh.tc - 20 + 0.05, `scale to fit leaves the tenon: part ends at X${mesh.hi.toFixed(1)}, tailstock ${mesh.tail} - keep-away ${mesh.tc} - tenon 20. "${toast}"`);
    await openSec('tenons');
    await page.fill('#rc-tenons-chuck-len', ''); await page.dispatchEvent('#rc-tenons-chuck-len', 'change'); await page.waitForTimeout(300);
    ok(await st(() => window.RotaryCam.__state.job.tenons.chuck.len === null), 'clearing it goes back to auto');
    await page.focus('#rc-tenons-chuck-len'); await page.waitForTimeout(300);
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
