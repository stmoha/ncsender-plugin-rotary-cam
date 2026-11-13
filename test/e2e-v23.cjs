// 0.11.6: finishing and Indexed take any end mill. Shape has Flat end mill; the Tool list has
// the flat end mills too, and picking one makes the shape flat; Generate cuts with it.
// node test/e2e-v23.cjs test/chin_test.step <outdir> [--dark] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8816));

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
  const job = () => page.evaluate(() => { const j = window.RotaryCam.__state.job; return { f: Object.assign({}, j.finish), i: Object.assign({}, j.index) }; });
  const openSec = (sec) => page.evaluate((s) => { const d = document.querySelector('#rcam-root details[data-sec=' + s + ']'); if (d) d.open = true; }, sec);
  try {
    await page.goto('about:blank');
    await page.goto(`http://localhost:${PORT}/${dark}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.waitForTimeout(500);
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(400);
    await page.evaluate(() => { const S = window.RotaryCam.__state; S.job.index.enabled = true; });
    for (const op of ['finish', 'index']) {
      await page.evaluate((o) => window.RotaryCam.__state.ui && 0, op);
      await page.evaluate(() => window.RotaryCam.session && window.RotaryCam.session.hooks && window.RotaryCam.session.hooks.renderForm && window.RotaryCam.session.hooks.renderForm());
      await openSec(op);
      const shapes = await page.$$eval(`#rc-${op}-shape option`, (os) => os.map((o) => o.value + ':' + o.textContent));
      ok(shapes.join() === 'ball:Ball,flat:Flat end mill,taper:Tapered ball', `${op}: Shape offers Ball, Flat end mill, Tapered ball (${shapes.join(', ')})`);
      const tools = await page.$$eval(`#rc-${op}-tool option`, (os) => os.map((o) => o.textContent));
      ok(tools.some((s) => /Flat End Mill.*\(flat end\)/.test(s)) && tools.some((s) => /Ball End Mill/.test(s)) && tools.some((s) => /as a tapered ball/.test(s)), `${op}: the Tool list has the flat end mills as well as balls and tapered balls`);
      // pick the library's 1/4" flat end mill
      const id = await page.$$eval(`#rc-${op}-tool option`, (os) => (os.find((o) => /Flat End Mill/.test(o.textContent)) || {}).value);
      await page.selectOption(`#rc-${op}-tool`, id); await page.waitForTimeout(500);
      const j = (await job())[op === 'finish' ? 'f' : 'i'];
      ok(j.shape === 'flat' && Math.abs(j.tool_dia - 6.35) < 1e-6 && await page.inputValue(`#rc-${op}-shape`) === 'flat', `${op}: picking the flat end mill sets Shape to Flat end mill, D${j.tool_dia}`);
    }
    // finishing on T1, the roughing end mill: no tool change between them
    await page.screenshot({ path: path.join(outDir, 'flat-tools.png') });
    // a smaller flat end mill for Indexed, typed in: back to the shape menu
    await page.selectOption('#rc-index-shape', 'ball'); await page.waitForTimeout(400);
    ok((await job()).i.shape === 'ball' && /ball end mill$/.test((await job()).i.tool_desc), 'Indexed back to Ball: its description follows');
    await page.selectOption('#rc-index-shape', 'flat'); await page.waitForTimeout(400);
    ok((await job()).i.shape === 'flat' && /flat end mill$/.test((await job()).i.tool_desc), 'Indexed to Flat end mill by hand: ' + (await job()).i.tool_desc);
    await page.evaluate(() => { const S = window.RotaryCam.__state; S.job.index.tool_dia = 3.175; S.job.index.tool_number = 3; S.job.index.stickout = 22; S.job.index.tool_length = 12; });

    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 900000, polling: 500 });
    const r = await page.evaluate(() => { const S = window.RotaryCam.__state; return { probs: S.problems, ops: S.program ? S.program.gcode.split('\n').filter((l) => /^\(OP /.test(l)) : [], m6: S.program ? (S.program.gcode.match(/M6 T\d+/g) || []) : [] }; });
    ok(!r.probs.length && r.ops.some((l) => /^\(OP finish .*\[flat end\]/.test(l)) && r.ops.some((l) => /^\(OP index .*\[flat end\]/.test(l)), 'Generate: finishing and Indexed cut with flat end mills: ' + (r.probs[0] || r.ops.join(' | ')));
    ok(!r.m6.some((s, i) => i > 0 && s === r.m6[i - 1]), 'roughing and finishing share T1: no tool change between them (' + r.m6.join(', ') + ')');
    await page.screenshot({ path: path.join(outDir, 'flat-generated.png') });
    // Simulate reads them as flat
    const kinds = await page.evaluate(() => { const S = window.RotaryCam.__state, Sm = window.RotaryCamSim; return Sm.parseProgram(S.program.gcode, S.job).ops.map((o) => o.name + ':' + o.kind); });
    ok(kinds.indexOf('finish:flat') >= 0 && kinds.indexOf('index:flat') >= 0, 'Simulate sees flat end mills: ' + kinds.join(', '));
  } catch (e) { ok(false, 'threw: ' + (e && e.stack || e)); }
  ok(!errors.length, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  await browser.close(); srv.kill();
  process.exit(fails ? 1 : 0);
})();
