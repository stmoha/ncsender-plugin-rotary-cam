// 0.15.2: the rotary drawn with ncSender's own model of it (Settings › 4th axis fixture), read
// from ncSender's page: the jaws open on the step that keeps them in closest to the chuck,
// the tailstock goes where the stock ends and the base stretches to reach it; Rotary &
// spindle › 3D view of the rotary switches between the model and the simple shapes; on Pro
// the keep-out zones are see-through boxes over it. The harness stands in a K12-like model.
// node test/e2e-v36.cjs test/horn.stl <outdir> [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const UH = require('./ui-helpers.cjs');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8836));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const H = (p, b) => fetch(`http://localhost:${PORT}${p}`, b === undefined ? {} : { method: 'POST', body: JSON.stringify(b) }).then((r) => r.json());
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errors = [];
  let fails = 0;
  const t0 = Date.now(), ms = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';
  const ok = (cond, what) => { if (!cond) fails++; console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what); };
  const until = async (fn, secs = 12) => { for (let i = 0; i < secs * 5; i++) { const v = await fn(); if (v) return v; await sleep(200); } return null; };
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 } });
  const page = await ctx.newPage();
  const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const info = () => page.evaluate(() => window.RotaryCam.viewer.modelInfo());
  const typeIn = async (sel, v) => { await page.fill(sel, String(v)); await page.dispatchEvent(sel, 'change'); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(400); };
  const openSec = (k) => page.evaluate((k) => { const d = document.querySelector(`#rcam-root details[data-sec=${k}]`); if (d) d.open = true; }, k);
  try {
    // ncSender set to the K12, on Pro with a zone of its own (an ATC rack) and the rotary's zero
    await H('/__test/fixture', { id: 'k12' });
    const ATC = { id: 'atc:test', name: 'ATC Zone', kind: 'atc', enabled: true, minX: -760, minY: -260, maxX: -700, maxY: -140, source: 'test' };
    await H('/__test/pro', { pro: true, zones: [ATC] });
    await H('/__test/machine', { machine: { g54: '-300.000,-200.000,-80.000,0.000', WCO: '-300.000,-200.000,-80.000' } });
    await page.goto(`http://localhost:${PORT}/`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh && !window.RotaryCam.__state.busy, null, { timeout: 120000 });
    const got = await until(async () => (await info()).model, 15);
    let m = await info();
    ok(got && /K12/.test(m.name), `ncSender's model of the rotary is drawn: ${m.name}`);
    const S = () => page.evaluate(() => { const j = window.RotaryCam.__state.job; return { R: j.stock_radius, tail: j.tailstock_x, look: j.rig.look }; });
    let s = await S();
    // round stock: every jaw holds the radius, on the step furthest out that still reaches it
    const pick = (R) => (R >= 26 ? 26 : R >= 10 ? 10 : 0.4);
    ok(m.jaws.length === 4 && m.jaws.every((q) => Math.abs(q.step - pick(s.R)) < 0.3 && Math.abs(q.open - (s.R - q.step)) < 0.05),
      `the jaws hold ${(2 * s.R).toFixed(1)} mm round stock on their ${pick(s.R)} mm step, opened ${m.jaws[0] && m.jaws[0].open.toFixed(1)} mm`);
    ok(Math.abs(m.tailAt - s.tail) < 1e-6, `the tailstock's centre is at the end of the stock (X${s.tail.toFixed(1)})`);
    await page.click('[data-view=whole]'); await page.waitForTimeout(700);
    await shot('1-model-round');

    // 2.7" square: the outer step, so they stay inside the chuck instead of out past it
    await UH.openGroups(page); await openSec('stock');
    await page.selectOption('#rc-stock-shape', 'square'); await page.waitForTimeout(400);
    await typeIn('#rc-stock-width-square', 68.58);
    m = await info();
    ok(m.jaws.every((q) => Math.abs(q.step - 26) < 0.3 && Math.abs(q.open - 8.29) < 0.05), `2.7" square stock: every jaw on its 26 mm step, opened ${m.jaws[0].open.toFixed(2)} mm`);
    ok(m.jaws.every((q) => q.outer <= m.chuckR + 0.5), `so the jaws reach ${Math.max(...m.jaws.map((q) => q.outer)).toFixed(1)} mm from the axis, inside the ${m.chuckR.toFixed(0)} mm chuck (not out into the base)`);
    await page.click('[data-view=end]'); await page.waitForTimeout(700);
    await shot('2-square-jaws-end');

    // a long stock: the tailstock goes with it and the base stretches to reach
    await typeIn('#rc-tailstock_x', 1000);
    s = await S(); m = await info();
    ok(Math.abs(m.tailAt - s.tail) < 1e-6 && m.ext > 100, `stock ${s.tail.toFixed(0)} mm long: the tailstock follows and the base stretches ${m.ext.toFixed(0)} mm`);
    await typeIn('#rc-tailstock_x', 250);
    m = await info();
    ok(m.ext < 1e-6, 'shorter again: the base as modelled');

    // Pro: the keep-out zones over it, see-through
    ok(await until(async () => (await info()).zones >= 3), `the keep-out zones as see-through boxes: ${(await info()).zones} (headstock, tailstock, the ATC's)`);
    await page.click('[data-view=whole]'); await page.waitForTimeout(700);
    await shot('3-model-zones');

    // the legend's toggles: the rotary and the zones, each on its own
    const shown = () => page.evaluate(() => window.RotaryCam.viewer.shown());
    const btnOn = (k) => page.$eval(`#rcam-root [data-show=${k}]`, (b) => !b.hidden && b.classList.contains('on'));
    ok(await btnOn('rotary') && await btnOn('zones'), 'the legend has Rotary and Zones, both on');
    await page.click('#rcam-root [data-show=rotary]'); await page.waitForTimeout(300);
    let sh = await shown();
    ok(sh.rotary > 5 && sh.rotaryOn === 0 && sh.zonesOn === sh.zones && !(await btnOn('rotary')), `Rotary off: the ${sh.rotary} pieces of the rotary hide, the zones stay`);
    await shot('3b-rotary-hidden');
    await page.click('#rcam-root [data-show=zones]'); await page.waitForTimeout(300);
    sh = await shown();
    ok(sh.zones > 0 && sh.zonesOn === 0, `Zones off: the ${sh.zones} pieces of the zones hide`);
    await typeIn('#rc-tailstock_x', 260);
    sh = await shown();
    ok(sh.rotaryOn === 0 && sh.zonesOn === 0, 'a setting changed (the rotary drawn again): still hidden');
    await page.click('#rcam-root [data-show=rotary]'); await page.click('#rcam-root [data-show=zones]'); await page.waitForTimeout(300);
    sh = await shown();
    ok(sh.rotaryOn === sh.rotary && sh.zonesOn === sh.zones && await btnOn('rotary') && await btnOn('zones'), 'both on again');
    await page.click('#rcam-root [data-show=zones]'); await page.waitForTimeout(200);
    ok(await page.evaluate(() => JSON.parse(localStorage.getItem('rcam.show')).zones === false), 'remembered in this browser (Zones left off)');

    // the choice under Rotary & spindle
    await UH.openGroups(page); await openSec('rig');
    const field = await page.$('#rc-rig-look');
    ok(!!field && await field.isVisible(), 'Rotary & spindle › 3D view of the rotary shows, with ncSender set to a rotary');
    await page.selectOption('#rc-rig-look', 'simple'); await page.waitForTimeout(500);
    m = await info();
    const keyBefore = await page.evaluate(() => window.RotaryCam.__state.resultKey);
    ok(!m.model && (await S()).look === 'simple', 'Simple shapes: the model goes, the simple rotary is back');
    await shot('4-simple');
    await page.selectOption('#rc-rig-look', 'model'); await page.waitForTimeout(500);
    ok((await info()).model, 'and back to the model');
    // it's only the drawing: generated toolpaths stay
    const jk = await page.evaluate(() => { const S = window.RotaryCam.__state, a = S.job.rig.look; return a; });
    ok(jk === 'model', 'the choice is kept in the settings');

    // dark theme
    await page.goto('about:blank');
    await page.goto(`http://localhost:${PORT}/#dark`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.viewer && window.RotaryCam.__state.mesh, null, { timeout: 60000 }).catch(() => null);
    await until(async () => (await info()).model, 15);
    await page.click('[data-view=iso]'); await page.waitForTimeout(800);
    ok((await info()).model, 'opened again (dark): drawn with the model straight away');
    sh = await shown();
    ok(sh.zonesOn === 0 && sh.rotaryOn === sh.rotary && !(await btnOn('zones')), 'with the zones still off, as left');
    await page.click('#rcam-root [data-show=zones]'); await page.waitForTimeout(300);
    await shot('5-model-dark');

    // ncSender with no fixture set: the simple shapes, and no choice to make
    await H('/__test/fixture', { id: null });
    await H('/__test/pro', { pro: false });
    await page.goto('about:blank');
    await page.goto(`http://localhost:${PORT}/`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.viewer, null, { timeout: 60000 });
    await page.waitForTimeout(1500);
    ok(!(await info()).model, 'ncSender with no 4th axis fixture set: the simple shapes');
    ok(await page.$eval('#rcam-root [data-show=zones]', (b) => b.hidden) && await btnOn('rotary'), 'no keep-out zones (not Pro): no Zones button; Rotary still there');
  } catch (e) {
    fails++; console.log(ms(), 'FAIL threw: ' + (e && e.stack || e));
  }
  ok(!errors.length, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' / ') : ''));
  await browser.close(); srv.kill();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
