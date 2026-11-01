// 0.9.6: an inch program only where the controller has A as a rotary axis ($376). grblHAL
// scales every axis word by 25.4 in G20 otherwise, A included (A90 turns 2286 degrees).
// node test/e2e-v17.cjs <part> <outdir> [--dark] [--viewport WxH] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8808));
fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const H = (p, b) => fetch(`http://localhost:${PORT}${p}`, b !== undefined ? { method: 'POST', body: typeof b === 'string' ? b : JSON.stringify(b) } : undefined).then((r) => r.json());
  await H('/__test/units', 'imperial');
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const vp = arg('--viewport', '1500x950').split('x').map(Number);
  const page = await (await browser.newContext({ viewport: { width: vp[0], height: vp[1] } })).newPage();
  const errors = [];
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const t = Date.now(), ms = () => ((Date.now() - t) / 1000).toFixed(1) + 's';
  let fails = 0;
  const ok = (cond, what) => { if (!cond) fails++; console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what); };
  const open = async () => {
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
  };
  const generate = async () => {
    await page.evaluate(() => { window.RotaryCam.__state.program = null; });     // (the last one is restored on opening)
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 900000, polling: 500 });
    return page.evaluate(() => { const S = window.RotaryCam.__state; return { probs: S.problems, warns: S.warnings, gcode: S.program && S.program.gcode }; });
  };
  try {
    // ---- $376=0: A is a linear axis to the controller
    await H('/__test/firmware', { 376: { value: '0' } });
    await open();
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.selectOption('#rcam-root .rc-centre', 'origin'); await page.waitForTimeout(300);
    await page.evaluate(() => { const d = document.querySelector('#rcam-root details[data-sec=stock]'); d.open = true; });
    await page.fill('#rc-stock-dia-round', (44 / 25.4).toFixed(4)); await page.dispatchEvent('#rc-stock-dia-round', 'change'); await page.waitForTimeout(400);
    const pr = await page.evaluate(() => window.RotaryCam.__state.problems);
    if (pr.length) console.log('   problems:', JSON.stringify(pr).slice(0, 300));
    let r = await generate();
    const a0 = (r.gcode || '').match(/\bA-?[\d.]+/g) || [];
    ok(r.gcode && /\nG21 G90/.test(r.gcode) && !/\nG20/.test(r.gcode), 'ncSender in inches, $376=0: the program is in millimetres (G21)');
    ok(r.warns.some((w) => /^This program is in millimetres \(G21\).*\$376=0.*25\.4 times too far.*set \$376=1/.test(w)), 'and it says why: ' + (r.warns.find((w) => /millimetres/.test(w)) || '(none)').slice(0, 160));
    await page.screenshot({ path: path.join(outDir, 'program-mm.png') });
    // ---- $376=1: A is rotary, an inch program is fine
    await H('/__test/firmware', { 376: { value: '1' } });
    await open();
    r = await page.evaluate(() => !!window.RotaryCam.__state.mesh) ? await generate() : null;
    if (!r) { await page.setInputFiles('#rcam-root input[type=file]', part); await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 }); r = await generate(); }
    const a1 = (r.gcode || '').match(/\bA-?[\d.]+/g) || [];
    ok(r.gcode && /\nG20 G90/.test(r.gcode) && !r.warns.some((w) => /millimetres/.test(w)), '$376=1: an inch program (G20), nothing to say');
    ok(a0.length > 100 && a0.slice(0, 500).join() === a1.slice(0, 500).join(), `A is in degrees either way (${a0.length} A words, the same)`);
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
