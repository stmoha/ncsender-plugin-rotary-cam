// 0.11.6: more settings show what they measure in 3D. The tools' own sizes (diameter, flute
// length, shank, taper) get a dimension; the pass settings (stepdown, advance / stepover per
// turn, stepover, leave) show at the tool with where the next layer or pass goes; Deepest
// below the axis, the angle step, stock shape and tenon ends light up too.
// node test/e2e-v24.cjs test/chin_test.step <outdir> [--dark] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8817));

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
  // focus a setting; it lights up (its row too) with what the view drew
  const focus = async (sec, id) => {
    await page.evaluate((s) => { const d = document.querySelector('#rcam-root details[data-sec=' + s + ']'); if (d) d.open = true; }, sec);
    await page.focus(id); await page.waitForTimeout(500);
    return page.evaluate((i) => {
      const el = document.querySelector(i), row = el && el.closest('.rc-row');
      return { lit: !!(row && row.classList.contains('rc-hl')) };
    }, id);
  };
  const blur = () => page.evaluate(() => document.activeElement && document.activeElement.blur());
  try {
    await page.goto('about:blank');
    await page.goto(`http://localhost:${PORT}/${dark}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.waitForTimeout(500);
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(400);
    await page.evaluate(() => { const S = window.RotaryCam.__state; S.job.index.enabled = true; S.job.parting.enabled = true; });
    await page.evaluate(() => { const h = window.RotaryCam.session.hooks; if (h.renderForm) h.renderForm(); });
    const list = [
      ['rough', '#rc-rough-tool_dia', 'roughing tool diameter'], ['rough', '#rc-rough-tool_length', 'roughing flute length'],
      ['rough', '#rc-rough-stepdown', 'roughing stepdown'], ['rough', '#rc-rough-pitch', 'roughing advance per turn'], ['rough', '#rc-rough-leave', 'leave for finishing'],
      ['finish', '#rc-finish-tool_dia', 'finishing ball diameter'], ['finish', '#rc-finish-tool_length', 'finishing flute length'], ['finish', '#rc-finish-pitch', 'finishing stepover per turn'],
      ['index', '#rc-index-tool_dia', 'Indexed tool diameter'], ['index', '#rc-index-stepover', 'Indexed stepover'], ['index', '#rc-index-stepdown', 'Indexed stepdown'],
      ['parting', '#rc-parting-tool_dia', 'parting tool diameter'], ['parting', '#rc-parting-stepdown', 'parting depth per turn'],
      ['stock', '#rc-below_axis', 'Deepest below the axis'], ['stock', '#rc-angle_step_deg', 'angle step'], ['stock', '#rc-stock-shape', 'stock shape'], ['stock', '#rc-stock-clamp', 'clamping distance'], ['stock', '#rc-tailstock_x', 'stock length']
    ];
    for (const [sec, id, what] of list) {
      if (!(await page.$(id))) { ok(false, what + ': no field ' + id); continue; }
      const r = await focus(sec, id);
      ok(r.lit, what + ' lights up in 3D');
      await page.screenshot({ path: path.join(outDir, 'hl-' + id.slice(4) + '.png') });
      await blur(); await page.waitForTimeout(200);
    }
    // a tapered ball: its shank and taper too
    await page.evaluate(() => { const d = document.querySelector('#rcam-root details[data-sec=finish]'); d.open = true; });
    await page.selectOption('#rc-finish-shape', 'taper'); await page.waitForTimeout(500);
    for (const [id, what] of [['#rc-finish-shank_dia', 'tapered ball shank diameter'], ['#rc-finish-taper_deg', 'tapered ball taper'], ['#rc-finish-tool_dia', 'tapered ball tip diameter']]) {
      const r = await focus('finish', id);
      ok(r.lit, what + ' lights up in 3D');
      await page.screenshot({ path: path.join(outDir, 'hl-' + id.slice(4) + '.png') });
      await blur(); await page.waitForTimeout(200);
    }
    // stepovers as a length or a % of the tool's diameter: type either, the other follows
    const typeIn = async (sel, v) => { await page.fill(sel, String(v)); await page.dispatchEvent(sel, 'change'); await blur(); await page.waitForTimeout(300); };
    const rp = () => page.evaluate(() => { const j = window.RotaryCam.__state.job.rough; return { len: j.pitch, pct: j.pitch_pct, dia: j.tool_dia, lenBox: document.querySelector('#rc-rough-pitch').value, pctBox: document.querySelector('#rc-rough-pitch-pct').value }; });
    await page.evaluate(() => { document.querySelector('#rcam-root details[data-sec=rough]').open = true; });
    let q = await rp();
    ok(q.pctBox === String(Math.round(q.len / q.dia * 1000) / 10), `Roughing Stepover per turn shows as a % too: ${q.lenBox} mm = ${q.pctBox}% of D${q.dia}`);
    for (const k of ['corners', 'finish', 'index']) {
      const key = k === 'finish' ? 'pitch' : 'stepover';
      ok(await page.evaluate((s) => !!document.querySelector(s), `#rc-${k}-${key}-pct`) || k === 'corners', `${k}: a % box under its stepover`);
    }
    await typeIn('#rc-rough-pitch-pct', 50);
    q = await rp();
    ok(Math.abs(q.len - 3.175) < 1e-6 && q.pct === 50 && Number(q.lenBox) === 3.175, `50% of the 6.35 mm tool: ${q.lenBox} mm`);
    await typeIn('#rc-rough-tool_dia', 10);
    q = await rp();
    ok(Math.abs(q.len - 5) < 1e-6 && Number(q.lenBox) === 5 && q.pctBox === '50', `typed as a %, it stays 50% of a 10 mm tool: ${q.lenBox} mm`);
    await typeIn('#rc-rough-pitch', 2);
    q = await rp();
    ok(q.len === 2 && (q.pct === null || q.pct === undefined) && q.pctBox === '20', `typed as a length: 2 mm, shown as ${q.pctBox}%`);
    await typeIn('#rc-rough-tool_dia', 4);
    q = await rp();
    ok(q.len === 2 && q.pctBox === '50', `and it stays 2 mm with a 4 mm tool, now ${q.pctBox}%`);
    await typeIn('#rc-rough-tool_dia', 6.35); await typeIn('#rc-rough-pitch', 3.5);
    // editing a tool size closes in on the tool; leaving the field puts the view back
    const cam = () => page.evaluate(() => window.RotaryCam.viewer.getCamera());
    const near = (a, b) => a.p.every((v, i) => Math.abs(v - b.p[i]) < 1e-3) && a.t.every((v, i) => Math.abs(v - b.t[i]) < 1e-3);
    const c0 = await cam();
    await focus('rough', '#rc-rough-stepdown');
    const c1 = await cam();
    await blur(); await page.waitForTimeout(300);
    const c2 = await cam();
    ok(!near(c0, c1) && Math.hypot(c1.p[0] - c1.t[0], c1.p[1] - c1.t[1], c1.p[2] - c1.t[2]) < Math.hypot(c0.p[0] - c0.t[0], c0.p[1] - c0.t[1], c0.p[2] - c0.t[2]), 'editing Stepdown closes in on the tool');
    ok(near(c0, c2), 'leaving the field puts the view back where it was');
    // hovering another operation's setting doesn't draw on the tool on show
    await page.focus('#rc-finish-tool_dia'); await page.waitForTimeout(300); await blur();
    await page.evaluate(() => { const d = document.querySelector('#rcam-root details[data-sec=rough]'); d.open = true; });
    await page.hover('#rc-rough-stepdown'); await page.waitForTimeout(900);
    ok(!(await page.evaluate(() => document.querySelector('#rc-rough-stepdown').closest('.rc-row').classList.contains('rc-hl'))), 'hovering Roughing stepdown with the finishing tool on show: nothing drawn on it');
  } catch (e) { ok(false, 'threw: ' + (e && e.stack || e)); }
  ok(!errors.length, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  await browser.close(); srv.kill();
  process.exit(fails ? 1 : 0);
})();
