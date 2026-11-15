// 0.11.7: Rest finishing. A section of its own after Finishing, off to start; ticked, it
// shows its settings and a button on the view, and Generate plans it from what finishing
// left (here a tapered ball finish of the slot part, then a 1/8" flat end mill), writes it
// before Indexed, says where it cuts, and Simulate finds nothing cut into the part.
// node test/e2e-v26.cjs test/slot_test.step <outdir> [--dark] [--port N]
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
  const notes = () => page.evaluate(() => Array.from(document.querySelectorAll('#rcam-root .rc-msgs .rc-msg, #rcam-root .rc-toasts .rc-msg')).map((m) => m.textContent));
  try {
    await page.goto('about:blank');
    await page.goto(`http://localhost:${PORT}/${dark}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.waitForTimeout(500);
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(400);

    // off to start: no button on the view, its section there to tick
    const sec = await page.evaluate(() => { const d = document.querySelector('#rcam-root details[data-sec=finish2]'); return d ? { title: d.querySelector('summary').textContent, on: d.querySelector('[data-k="finish2.enabled"]').checked } : null; });
    ok(sec && /Rest finishing/.test(sec.title) && !sec.on, 'a Rest finishing section after Finishing, off to start: ' + (sec && sec.title));
    const order = await page.$$eval('#rcam-root details[data-sec]', (ds) => ds.map((d) => d.getAttribute('data-sec')));
    ok(order.indexOf('finish2') === order.indexOf('finish') + 1 && order.indexOf('index') === order.indexOf('finish2') + 1, 'it sits between Finishing and Indexed: ' + order.join(', '));
    ok(await page.$eval('#rcam-root .rc-op[data-op=finish2]', (b) => b.hidden), 'no Rest finishing button on the view while it’s off');

    // the slot part away from the chuck, finished with a tapered ball, Indexed after it: all
    // through the form, so the settings are saved (Generate reads them back first)
    const U = await page.evaluate(() => window.RotaryCam.__state.units === 'in' ? 25.4 : 1);
    const openSec = (s) => page.evaluate((k) => { const d = document.querySelector('#rcam-root details[data-sec=' + k + ']'); if (d) d.open = true; }, s);
    const setField = async (id, mm) => { await page.fill('#' + id, String(mm / U)); await page.press('#' + id, 'Tab'); await page.waitForTimeout(300); };
    await openSec('stock'); await openSec('part'); await openSec('finish'); await openSec('index');
    await setField('rc-stock-dia-round', 30);
    await setField('rc-model-part_start_x', 60);
    await page.selectOption('#rc-finish-shape', 'taper'); await page.waitForTimeout(400);
    await openSec('finish');
    await setField('rc-finish-tool_dia', 1.0);
    if (!(await page.$eval('#rcam-root [data-k="index.enabled"]', (c) => c.checked))) await page.click('#rcam-root [data-k="index.enabled"]');
    await page.waitForTimeout(400);
    await openSec('index');
    await page.selectOption('#rc-index-shape', 'flat'); await page.waitForTimeout(400);
    await openSec('index');
    await setField('rc-index-tool_dia', 3.175);
    await page.fill('#rc-index-tool_number', '5'); await page.press('#rc-index-tool_number', 'Tab'); await page.waitForTimeout(300);
    const jf = await page.evaluate(() => { const j = window.RotaryCam.__state.job; return { f: j.finish.shape + ' ' + j.finish.tool_dia, i: j.index.enabled + ' ' + j.index.shape + ' ' + j.index.tool_dia, start: j.model.part_start_x }; });
    ok(jf.f === 'taper 1' && /^true flat 3.175/.test(jf.i) && Math.abs(jf.start - 60) < 0.01, 'set up: finishing ' + jf.f + ', Indexed ' + jf.i + ', part at X' + jf.start);
    await openSec('finish2');
    await page.click('#rcam-root [data-k="finish2.enabled"]');
    await page.waitForTimeout(500);
    const j2 = await page.evaluate(() => Object.assign({}, window.RotaryCam.__state.job.finish2));
    ok(j2.enabled && j2.shape === 'flat' && Math.abs(j2.tool_dia - 3.175) < 1e-6, `ticked: on, a ${j2.tool_dia} mm flat end mill to start`);
    const fields = await page.$$eval('#rcam-root details[data-sec=finish2] .rc-row', (rs) => rs.filter((r) => r.offsetParent).map((r) => (r.querySelector('label') || r).textContent.trim().split('\n')[0]));
    ok(['Only where at least', 'Shape', 'Stepover per turn', 'Stepdown', 'Stickout'].every((f) => fields.some((x) => x.indexOf(f) === 0)), 'its settings show: ' + fields.join(' | '));
    const shapes = await page.$$eval('#rc-finish2-shape option', (os) => os.map((o) => o.value));
    ok(shapes.join() === 'flat,ball,taper', 'Shape: flat end mill first, then ball and tapered ball');
    ok(!(await page.$eval('#rcam-root .rc-op[data-op=finish2]', (b) => b.hidden)), 'and its button shows on the view');
    await page.screenshot({ path: path.join(outDir, 'finish2-section.png') });

    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 900000, polling: 500 });
    const r = await page.evaluate(() => { const S = window.RotaryCam.__state; return { probs: S.problems, ops: S.program ? S.program.gcode.split('\n').filter((l) => /^\(OP /.test(l)).map((l) => l.split(' ')[1]) : [], info: S.program && S.program.info.finish2, ix: S.program && S.program.info.index, path: S.program && S.program.paths.finish2 && S.program.paths.finish2.length }; });
    // Indexed runs after it, on what both left (here little or nothing: then no passes of its own)
    ok(!r.probs.length && /^rough,finish,finish2(,index)?$/.test(r.ops.join()) && !!r.ix, 'Generate: ' + (r.probs[0] || r.ops.join(', ')) + (r.ix ? '; Indexed had ' + (r.ix.target || 0).toFixed(1) + ' mm³ left to clean up' : ''));
    ok(r.info && r.info.runs > 0 && r.path > 0, `the rest finishing cuts (${r.info && r.info.runs} stretches, ${r.info && r.info.points} points) and shows in 3D`);
    const n1 = await notes();
    const say = n1.find((m) => /^Rest finishing/.test(m));
    ok(!!say && /stretch/.test(say) && /Air-cut it first/.test(say), 'a message says where it cuts: ' + (say || n1.join(' | ')).slice(0, 200));
    await page.click('#rcam-root .rc-op[data-op=finish2]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, 'finish2-generated.png') });

    // Simulate the whole program: nothing below the part
    await page.click('#rcam-root [data-tab=sim]');
    await page.waitForFunction(() => window.RotaryCam.__state.program && window.RotaryCam.__state.program.gcode && document.querySelector('#rcam-root .rc-simplay'), null, { timeout: 60000 }).catch(() => {});
    const sim = await page.evaluate(() => {
      const S = window.RotaryCam.__state, Sm = window.RotaryCamSim, sm = new Sm.Sim(S.job, S.mesh, Sm.parseProgram(S.program.gcode, S.job));
      sm.runTo(sm.prog.count); return { g: sm.gouges(), ops: sm.prog.ops.map((o) => o.name + ':' + o.kind) };
    });
    ok(sim.g.count === 0 && sim.ops.indexOf('finish2:flat') >= 0, `Simulate: nothing cut into the part (${sim.g.count} cells), ops ${sim.ops.join(', ')}`);
  } catch (e) { ok(false, 'threw: ' + (e && e.stack || e)); }
  ok(!errors.length, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  await browser.close(); srv.kill();
  process.exit(fails ? 1 : 0);
})();
