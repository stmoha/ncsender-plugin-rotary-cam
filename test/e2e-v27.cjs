// 0.12.0: Finishing along the part (Pattern), Parting's One cut only, and Simulate drawing the
// part's own mesh where the stock is cut down to it.
// node test/e2e-v27.cjs test/coil.stl <outdir> [--dark] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const H = require('./ui-helpers.cjs');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8827));

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
  const openSec = async (s) => { if (['corners', 'rough', 'finish', 'finish2', 'index', 'parting'].includes(s)) return H.openStrat(page, s); await H.openGroups(page); await page.evaluate((s) => { document.querySelector(`#rcam-root details[data-sec=${s}]`).open = true; }, s); };
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
      S.job.finish.stickout = 70; S.job.finish.pitch = 1.2; S.job.angle_step_deg = 4; S.job.rough.pitch = 5;
    });
    await openSec('stock');
    await page.click('#rcam-root [data-act=fitstock]'); await page.waitForTimeout(500);

    // ---- the button's name
    await openSec('part');
    ok(await page.$eval('#rcam-root [data-act=fitscale]', (b) => b.textContent.trim()) === 'Scale model to fit the stock', 'the button reads "Scale model to fit the stock"');

    // ---- Finishing: Pattern
    await openSec('finish');
    const lab = () => page.$eval('#rcam-root [data-k="finish.pitch"]', (i) => i.closest('.rc-row').querySelector('label, .rc-label, span').textContent.trim());
    ok(/Stepover per turn/.test(await lab()), 'Round the part (as it was): Stepover per turn');
    await page.selectOption('#rcam-root [data-k="finish.pattern"]', 'lines');
    await page.waitForTimeout(300);
    ok(/Stepover between lines/.test(await lab()) && await page.evaluate(() => window.RotaryCam.__state.job.finish.pattern) === 'lines', 'Pattern: Along the part; the stepover is now between lines');

    // ---- Parting: One cut only, and the tailstock end first
    await openSec('parting');
    await H.openStrat(page, 'parting');
    await page.waitForTimeout(300);
    const note0 = await page.$eval('#rcam-root [data-note=parting]', (n) => n.textContent);
    ok(/tailstock end tenon.*, then the chuck end tenon/.test(note0) && /chuck end last/.test(note0) && / over /.test(note0), 'Parting says the tailstock end is cut first, the chuck end last: ' + note0.slice(0, 110));
    await page.check('#rcam-root [data-k="parting.single"]');
    await page.waitForTimeout(300);
    const note1 = await page.$eval('#rcam-root [data-note=parting]', (n) => n.textContent);
    ok(/each with one cut a cutter wide beside the part/.test(note1) && !/ over /.test(note1), 'One cut only: ' + note1.slice(0, 150));

    await page.click('#rcam-root .rc-gen');
    let sawLines = '';
    for (let i = 0; i < 600 && !sawLines; i++) {
      sawLines = await page.evaluate(() => { const b = document.querySelector('#rcam-root .rc-status'); const s = window.RotaryCam.__state; return /Finishing lines|lines along the part/.test((b && b.textContent) || s.busy || '') ? ((b && b.textContent) || s.busy) : (s.program || s.problems.length ? 'done' : ''); });
      if (!sawLines) await page.waitForTimeout(100);
    }
    ok(/Finishing lines|lines along the part/.test(sawLines), 'Generate shows the lines being calculated (0.13.0: Finishing: lines along the part): ' + sawLines.replace(/\s+/g, ' ').slice(0, 80));
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 900000, polling: 1000 });
    const probs = await page.evaluate(() => window.RotaryCam.__state.problems);
    ok(!probs.length, 'generated' + (probs.length ? ': ' + probs[0] : ''));
    const info = await page.evaluate(() => {
      const S = window.RotaryCam.__state, g = S.program.gcode.split('\n');
      const at = (re) => g.findIndex((l) => re.test(l));
      const fin = at(/^\(OP finish /), par = at(/^\(OP parting /);
      // parting's columns: the X of each plunge, in order
      const cols = [];
      for (let k = par; k < g.length; k++) { const m = /^G0 X(-?[\d.]+)/.exec(g[k]); if (m && cols[cols.length - 1] !== Number(m[1])) cols.push(Number(m[1])); }
      let aMin = Infinity, aMax = -Infinity;
      for (let k = fin; k < par; k++) { const m = /^G1 .*A(-?[\d.]+)/.exec(g[k]); if (m) { aMin = Math.min(aMin, Number(m[1])); aMax = Math.max(aMax, Number(m[1])); } }
      return { lines: S.program.info.finish.lines, turns: S.program.info.finish.turns, aSpan: aMax - aMin, cols, lo: S.mesh.min[0], hi: S.mesh.max[0], finDx: S.plan.finDx, key: S.maps.finLines };
    });
    ok(info.lines > 90 && info.turns === 0 && info.finDx > 0 && info.aSpan < 360, `finishing: ${info.lines} lines along the part, A turns ${info.aSpan.toFixed(0)}° in all`);
    const pc = info.cols.filter((x) => x < info.lo || x > info.hi);
    ok(pc.length === 2 && pc[0] > info.hi && pc[1] < info.lo, `parting: one cut at each end, the tailstock end (X${pc[0]}) before the chuck end (X${pc[1]})`);

    // ---- the unrolled view reads the lines' map
    await page.click('[data-tab="2d"]'); await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, 'v27-unrolled.png') });

    // ---- Simulate: the part's own mesh where the stock is cut down to it
    await page.click('[data-tab=sim]');
    await page.waitForFunction(() => window.RotaryCam.sim && window.RotaryCam.sim.checked, null, { timeout: 600000, polling: 500 });
    await page.waitForTimeout(800);
    const rep = await page.evaluate(() => window.RotaryCam.__state.simReport);
    ok(rep && rep.gouges === 0 && rep.rapids === 0, 'simulated: nothing cut into the part, no rapids into the stock ' + JSON.stringify({ gouges: rep && rep.gouges, rapids: rep && rep.rapids }));
    const sm = await page.evaluate(() => { const R = window.RotaryCam.sim, all = (() => { R.sim.smooth = false; const c = R.sim.surface().count; R.sim.smooth = true; return c; })(); const s = R.sim.surface(R.pos, R.col); return { smooth: s.smooth, drawn: s.count / 3, all: all / 3, flag: R.smooth }; });
    ok(sm.flag === true && sm.smooth === true && sm.drawn < 0.7 * sm.all, `Simulate leaves the faces at the part to the part's own mesh (${sm.drawn} of ${sm.all} faces drawn from the stock)`);
    for (const v of ['top', 'iso']) { await page.click(`#rcam-root [data-view=${v}]`); await page.waitForTimeout(700); await page.screenshot({ path: path.join(outDir, 'v27-sim-' + v + '.png') }); }
  } catch (e) { ok(false, 'threw: ' + (e && e.stack || e)); }
  ok(!errors.length, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  await browser.close(); srv.kill();
  process.exit(fails ? 1 : 0);
})();
