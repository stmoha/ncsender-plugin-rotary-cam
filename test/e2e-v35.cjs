// 0.15.2: Ortho, a flat (orthographic) 3D view. Front, Top and End turn it on and look straight
// along an axis, so points one behind the other land on the same spot and moves can be lined up
// against the work zero and the machine; the Ortho button goes back to perspective at about the
// same size. It stays on while orbiting and zooming, the value labels keep their size, the
// spindle and the tailstock still fade when they hide the part, and it's remembered.
// node test/e2e-v35.cjs test/horn.stl <outdir> [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8835));

fs.mkdirSync(outDir, { recursive: true });
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
  const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const V = (fn, a) => page.evaluate(fn, a);
  const scr = (p) => V((q) => window.RotaryCam.viewer.toScreen(q), p);
  const gap = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const ortho = () => V(() => ({ viewer: window.RotaryCam.viewer.isOrtho(), btn: document.querySelector('#rcam-root .rc-ortho').classList.contains('on') }));
  const openPlugin = async () => {
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0 && window.RotaryCam.viewer, null, { timeout: 30000 });
  };
  try {
    await page.goto(`http://localhost:${PORT}/`);
    await V(() => { try { localStorage.removeItem('rcam.ortho'); } catch (e) {} });
    await openPlugin();
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh && !window.RotaryCam.__state.busy, null, { timeout: 120000 });
    await page.waitForTimeout(800);

    let o = await ortho();
    ok(!o.viewer && !o.btn, 'a first open is in perspective, Ortho off');
    // perspective: a point further back shows nearer the middle
    await page.click('[data-view=iso]'); await page.waitForTimeout(500);
    await page.click('[data-view=front]'); await page.waitForTimeout(500);
    o = await ortho();
    ok(o.viewer && o.btn, 'Front turns Ortho on');
    // Front: along Y. Points one behind the other (same X and Z) land on the same pixel
    let a = await scr({ x: 60, y: -40, z: 15 }), b = await scr({ x: 60, y: 40, z: 15 });
    ok(gap(a, b) < 0.5, `Front: a point 80 mm behind another lands on the same spot (${gap(a, b).toFixed(2)} px apart)`);
    let c = await scr({ x: 0, y: 0, z: 0 }), d = await scr({ x: 0, y: 0, z: 40 });
    ok(Math.abs(c.x - d.x) < 0.5 && d.y < c.y - 20, 'and up is straight up the screen: X0 above X0 stays X0');
    await shot('1-front-ortho');

    await page.click('[data-view=top]'); await page.waitForTimeout(500);
    a = await scr({ x: 60, y: 10, z: -40 }); b = await scr({ x: 60, y: 10, z: 40 });
    ok(gap(a, b) < 0.5, `Top: straight down, 80 mm apart in Z on the same spot (${gap(a, b).toFixed(2)} px)`);
    c = await scr({ x: 0, y: 0, z: 0 }); d = await scr({ x: 100, y: 0, z: 0 });
    ok(Math.abs(c.y - d.y) < 0.5 && d.x > c.x + 20, 'X runs straight across, to the right');
    const topOp = (await V(() => window.RotaryCam.viewer.holderOpacity())).tool;
    await shot('2-top-ortho');

    await page.click('[data-view=end]'); await page.waitForTimeout(600);
    a = await scr({ x: 0, y: 12, z: 8 }); b = await scr({ x: 150, y: 12, z: 8 });
    ok(gap(a, b) < 0.5, `End: along the axis, 150 mm apart in X on the same spot (${gap(a, b).toFixed(2)} px)`);
    const ends = await V(() => window.RotaryCam.viewer.endsOpacity());
    ok(ends && ends.tail < 0.6 && ends.head > 0.95, `the tailstock fades when it hides the part (tail ${ends && ends.tail.toFixed(2)}, chuck ${ends && ends.head.toFixed(2)})`);
    await shot('3-end-ortho');
    await page.click('[data-view=front]'); await page.waitForTimeout(500);
    const frontOp = (await V(() => window.RotaryCam.viewer.holderOpacity())).tool;
    ok(topOp != null && topOp < 0.4 && frontOp > 0.95, `the spindle is see-through from the top (${topOp && topOp.toFixed(2)}), solid from the front (${frontOp && frontOp.toFixed(2)})`);

    // the value labels keep their size on screen: the same pill, perspective and flat
    const pill = () => V(() => { const R = window.RotaryCam.viewer; return R.highlight('rig.chuck.dia', '100 mm', false) ? R.highlighted() : null; });
    ok(await pill(), 'a setting’s dimension shows in the flat view');
    await shot('4-dimension-ortho');
    await V(() => window.RotaryCam.viewer.highlight(null));

    // orbit and zoom: still flat
    const box = await page.$eval('#rcam-root .rc-3d', (el) => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    await page.mouse.move(box.x + 200, box.y + 150); await page.mouse.down(); await page.mouse.move(box.x + 120, box.y + 100, { steps: 8 }); await page.mouse.up();
    await page.mouse.move(box.x, box.y); await page.mouse.wheel(0, -300); await page.waitForTimeout(2500);   // till the turn has settled
    o = await ortho();
    // all four in one go (the view mustn't move in between)
    const many = (ps) => V((qs) => qs.map((q) => window.RotaryCam.viewer.toScreen(q)), ps);
    [a, b] = await many([{ x: 0, y: 0, z: 0 }, { x: 100, y: 0, z: 0 }]);
    const [s0, s1] = await many([{ x: 0, y: 50, z: 0 }, { x: 100, y: 50, z: 0 }]);
    ok(o.viewer && Math.abs(gap(a, b) - gap(s0, s1)) < 0.05, `turned and zoomed, it stays flat: 100 mm reads the same near and far (${gap(a, b).toFixed(2)} / ${gap(s0, s1).toFixed(2)} px)`);
    await shot('5-orbited-ortho');

    // Ortho off: perspective again, about the same size at the middle of the view
    const before = gap(a, b);
    await page.click('#rcam-root .rc-ortho'); await page.waitForTimeout(600);
    o = await ortho();
    a = await scr({ x: 0, y: 0, z: 0 }); b = await scr({ x: 100, y: 0, z: 0 });
    // 100 mm across the screen at the middle of the view (square to the way it looks)
    const across = await V(() => {
      const c = window.RotaryCam.viewer.getCamera(), t = c.t, d = c.p.map((v, i) => v - t[i]);
      const r = [d[1], -d[0], 0], l = Math.hypot(r[0], r[1]);
      return [-1, 1].map((s) => ({ x: t[0] + s * 50 * r[0] / l, y: t[1] + s * 50 * r[1] / l, z: t[2] }));
    });
    const [n0, n1] = await many(across);
    ok(!o.viewer && !o.btn, 'the Ortho button goes back to perspective');
    ok(Math.abs(gap(a, b) - before) / before < 0.2, `at about the same size (100 mm: ${before.toFixed(0)} px flat, ${gap(a, b).toFixed(0)} px now)`);
    await shot('6-back-to-perspective');
    await page.click('#rcam-root .rc-ortho'); await page.waitForTimeout(400);
    ok((await ortho()).viewer, 'and on again from the button');
    const [n2, n3] = await many(across);
    ok(Math.abs(gap(n2, n3) - gap(n0, n1)) < 0.5, `switching keeps what's at the middle the same size (${gap(n0, n1).toFixed(1)} / ${gap(n2, n3).toFixed(1)} px)`);

    // Fit part keeps the choice; remembered on the next open
    await page.click('[data-view=iso]'); await page.waitForTimeout(500);
    ok((await ortho()).viewer, 'Fit part keeps Ortho as it is');
    await page.goto('about:blank');
    await page.goto(`http://localhost:${PORT}/`);
    await openPlugin(); await page.waitForTimeout(500);
    o = await ortho();
    ok(o.viewer && o.btn, 'remembered in this browser: Ortho on when it opens again');
  } catch (e) {
    fails++; console.log(ms(), 'FAIL threw: ' + (e && e.stack || e));
  }
  ok(!errors.length, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' / ') : ''));
  await browser.close(); srv.kill();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
