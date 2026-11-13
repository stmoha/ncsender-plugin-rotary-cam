// 0.11.6: Simulate shows the inside of a part that's open down the middle. The coil's core,
// cleared from past the axis, shows as cleared, the coil's inside face as the part; the
// check about the part not going round the axis no longer sends you to the centring.
// node test/e2e-v25.cjs test/coil.stl <outdir> [--dark] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8818));

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
  try {
    await page.goto('about:blank');
    await page.goto(`http://localhost:${PORT}/${dark}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.waitForTimeout(500);
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      const S = window.RotaryCam.__state;
      S.job.stock = Object.assign(S.job.stock, { shape: 'round', dia: 54 });
      S.job.corners.enabled = false; S.job.index.enabled = false;
      S.job.finish.stickout = 70; S.job.finish.pitch = 0.8; S.job.angle_step_deg = 3;
    });
    await page.evaluate(() => { document.querySelector('#rcam-root details[data-sec=stock]').open = true; });
    await page.click('#rcam-root [data-act=fitstock]'); await page.waitForTimeout(500);
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 900000, polling: 1000 });
    const probs = await page.evaluate(() => window.RotaryCam.__state.problems);
    ok(!probs.length, 'generated' + (probs.length ? ': ' + probs[0] : ''));
    const n = (await notices()).find((s) => /doesn.t go round the rotary axis/.test(s)) || '';
    ok(/open in the middle/.test(n) && /Fine if it.s meant to be open/.test(n) && !/Simulate can/.test(n), 'the check says a part open down the middle is fine, and nothing about Simulate: ' + n.slice(0, 120));

    await page.click('[data-tab=sim]');
    await page.waitForFunction(() => window.RotaryCam.sim && window.RotaryCam.sim.checked, null, { timeout: 600000, polling: 500 });
    await page.waitForTimeout(800);
    const rep = await page.evaluate(() => window.RotaryCam.__state.simReport);
    ok(rep && rep.gouges === 0 && rep.rapids === 0, 'simulated: nothing cut into the part, no rapids into the stock ' + JSON.stringify({ gouges: rep && rep.gouges, worst: rep && rep.worst, rapids: rep && rep.rapids }));
    const info = await page.evaluate(() => {
      const R = window.RotaryCam.sim, sim = R.sim, N = sim.nx * sim.nth;
      let gaps = 0, roofPart = 0;
      for (let i = 0; i < N; i++) {
        if (!sim.hasGap(i)) continue; gaps++;
        const o = (N + i) * 3, rr = Math.hypot(R.pos[o + 1], R.pos[o + 2]);
        if (rr > 10 && rr < 13 && R.col[o + 2] > 0.8 && R.col[o] < 0.6) roofPart++;
      }
      return { gaps, roofPart, verts: R.pos.length / 3, N, nx: sim.nx };
    });
    ok(info.gaps > 1000 && info.verts === 3 * info.N + info.nx + 2, `the cleared core is kept as a gap in ${info.gaps} rays, and drawn (${info.verts} points: the outside, and each gap's roof and floor)`);
    ok(info.roofPart > 200, `the coil's inside face shows as the part (${info.roofPart} points)`);
    for (const v of ['top', 'front', 'iso']) { await page.click(`#rcam-root [data-view=${v}]`); await page.waitForTimeout(700); await page.screenshot({ path: path.join(outDir, 'coil-sim-' + v + '.png') }); }
  } catch (e) { ok(false, 'threw: ' + (e && e.stack || e)); }
  ok(!errors.length, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  await browser.close(); srv.kill();
  process.exit(fails ? 1 : 0);
})();
