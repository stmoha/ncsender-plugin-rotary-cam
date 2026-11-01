// 0.9.0: faster Indexed. Listing the angles is the default (settings saved with the old
// default move to it; ticking auto again sticks); four workers give the same program as one.
// node test/e2e-v12.cjs <part> <outdir> [--dark] [--viewport WxH] [--metric] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8800));
const metric = process.argv.includes('--metric');
const U = metric ? 1 : 25.4;
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const H = (p, b) => fetch(`http://localhost:${PORT}${p}`, b !== undefined ? { method: b === 'PUT' ? 'PUT' : 'POST', body: typeof b === 'string' ? b : JSON.stringify(b) } : undefined).then((r) => r.json());
  if (!metric) await H('/__test/units', 'imperial');
  // settings saved by 0.8.0: Indexed on, its angles picked automatically (the old default)
  await fetch(`http://localhost:${PORT}/api/plugins/com.cncdocs.rotary-cam/settings`, { method: 'PUT', body: JSON.stringify({ job: { stock: { shape: 'round', dia: 44 }, index: { enabled: true, auto: true, angle_list: '90, 270', stickout: 40, tool_number: 3, tool_dia: 3.175, tool_length: 12 }, finish: { pitch: 0.4 } } }) });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const vp = arg('--viewport', '1500x950').split('x').map(Number);
  const errors = [];
  let fails = 0;
  const t = Date.now(), ms = () => ((Date.now() - t) / 1000).toFixed(1) + 's';
  const ok = (cond, what) => { if (!cond) fails++; console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what); };
  // a page whose browser says it has `cores` cores (the plugin uses one fewer workers, up to 4)
  async function session(cores) {
    const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] } });
    await ctx.addInitScript((c) => { Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => c }); }, cores);
    const page = await ctx.newPage();
    page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    return { ctx, page };
  }
  async function generate(page) {
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.selectOption('#rcam-root .rc-centre', 'origin'); await page.waitForTimeout(300);
    const t0 = Date.now();
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 1500000, polling: 500 });
    const r = await page.evaluate(() => { const S = window.RotaryCam.__state; return { probs: S.problems, gcode: S.program && S.program.gcode, info: S.program && S.program.info.index, workers: window.RotaryCam.pool ? window.RotaryCam.pool.workers.length : null }; });
    r.seconds = (Date.now() - t0) / 1000;
    return r;
  }
  const motion = (g) => (g || '').split('\n').filter((l) => l && l[0] !== '(' && l[0] !== ';').join('\n');
  let a, b;
  try {
    // ---- one worker; the old saved default moves to listed angles
    a = await session(2);
    let ix = await a.page.evaluate(() => window.RotaryCam.__state.job.index);
    ok(ix.enabled && ix.auto === false && ix.angle_list === '90, 270', 'settings saved with Pick the angles on (the old default) now list the angles: ' + ix.angle_list);
    await a.page.evaluate(() => { const d = document.querySelector('#rcam-root details[data-sec=index]'); d.open = true; });
    ok(await a.page.$eval('#rc-index-auto', (el) => !el.checked) && !!(await a.page.$('#rc-index-angle_list')), 'the A angles field shows, Pick the angles for me is unticked');
    const r1 = await generate(a.page);
    ok(r1.gcode && r1.info && r1.info.angles.length === 2 && r1.workers === 1, `generated with 1 worker in ${r1.seconds.toFixed(1)} s: Indexed at A${r1.info && r1.info.angles.join(', A')}`);
    // ticking it again sticks
    await a.page.check('#rc-index-auto'); await a.page.waitForTimeout(900);
    const saved = (await H('/__test/settings')).job;
    const kept = await a.page.evaluate((sv) => window.RotaryCamCore.migrateIndex(window.RotaryCamCore.deepMerge(window.RotaryCamCore.DEFAULTS, sv), sv).index.auto, saved);
    ok(saved.index.auto === true && saved.index.auto_chosen === true && kept === true, 'ticking Pick the angles for me again is kept next time');
    await a.page.uncheck('#rc-index-auto'); await a.page.waitForTimeout(900);
    await a.page.screenshot({ path: path.join(outDir, 'index-settings.png') });
    await a.ctx.close(); a = null;

    // ---- four workers: the drops are shared out; the program is the same
    b = await session(5);
    const r4 = await generate(b.page);
    ok(r4.workers === 4, 'the second session runs 4 workers');
    const same = motion(r1.gcode) === motion(r4.gcode);
    ok(same && r4.info.angles.join() === r1.info.angles.join(), `4 workers give the same program, move for move (${motion(r4.gcode).split('\n').length} lines; ${r4.seconds.toFixed(1)} s here, a 2-core machine)`);
    if (!same) { const A = motion(r1.gcode).split('\n'), B = motion(r4.gcode).split('\n'); const i = A.findIndex((l, k) => l !== B[k]); console.log('   first difference at line', i, ':', A[i], '|', B[i]); }
    // auto, with 4 workers: it still runs and says how it went
    await b.page.evaluate(() => { const d = document.querySelector('#rcam-root details[data-sec=index]'); d.open = true; });
    await b.page.check('#rc-index-auto'); await b.page.waitForTimeout(400);
    await b.page.screenshot({ path: path.join(outDir, 'auto-warning.png') });
    const t0 = Date.now();
    await b.page.click('#rcam-root .rc-gen');
    await b.page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 1500000, polling: 500 });
    const ra = await b.page.evaluate(() => { const S = window.RotaryCam.__state; return S.program && S.program.info.index; });
    ok(ra && ra.angles.length >= 1, `Pick the angles for me: A${ra && ra.angles.join(', A')} in ${((Date.now() - t0) / 1000).toFixed(1)} s, reaching ${ra && ra.removed.toFixed(0)} of ${ra && ra.target.toFixed(0)} mm3`);
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
