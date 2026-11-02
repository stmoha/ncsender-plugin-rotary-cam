// End-to-end: open the dialog in the ncSender stand-in, load a part, generate, load into
// ncSender, save to File Manager; dump the G-code, placed mesh and job for the verifier.
// node test/e2e.cjs <part.(stl|step)> <outdir> [--dark] [--rough-tool 11] [--finish-tool 12]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');

const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const dark = process.argv.includes('--dark');
const PORT = 8777;
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const browser = await chromium.launch();
  const vp = arg('--viewport', '1400x920').split('x').map(Number);
  const page = await browser.newPage({ viewport: { width: vp[0], height: vp[1] } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const t = Date.now(), ms = () => ((Date.now() - t) / 1000).toFixed(1) + 's';
  if (process.argv.includes('--softlimits')) await fetch(`http://localhost:${PORT}/__test/firmware`, { method: 'POST', body: JSON.stringify({ 20: { value: '1' }, 133: { value: '36000' } }) });
  try {
    await page.goto(`http://localhost:${PORT}/${dark ? '#dark' : ''}`);
    await page.click('#open');
    await page.waitForSelector('#rcam-root .rc-gen', { timeout: 20000 });
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 20000 });
    console.log(ms(), 'dialog up; tools:', await page.evaluate(() => window.RotaryCam.__state.tools.map((x) => x.kind + ' T' + x.number).join(', ')));
    await page.screenshot({ path: path.join(outDir, '1-empty.png') });

    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh || (window.RotaryCam.__state.problems || []).length, null, { timeout: 120000 });
    const info = await page.evaluate(() => { const S = window.RotaryCam.__state; return { meta: document.querySelector('#rcam-root .rc-meta').textContent, problems: S.problems }; });
    console.log(ms(), 'loaded:', info.meta, info.problems.length ? info.problems : '');
    await page.evaluate(() => document.querySelectorAll('#rcam-root details').forEach((d) => { d.open = d.dataset.sec !== 'machine'; }));
    await page.selectOption('#rc-rough-tool', arg('--rough-tool', '11'));
    await page.selectOption('#rc-finish-tool', arg('--finish-tool', '12'));
    // stock that fits the part (the default 40 mm is smaller than the knight)
    const across = await page.evaluate(() => 2 * window.RotaryCam.__state.mesh.rmax);
    if (across > 39) { await page.fill('#rc-stock-dia-round', String(Math.ceil(across + 3))); await page.dispatchEvent('#rc-stock-dia-round', 'change'); await page.waitForTimeout(400); }
    await page.screenshot({ path: path.join(outDir, '2-loaded.png') });

    await page.click('#rcam-root .rc-gen');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(outDir, '3-calculating.png') });
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 1500000, polling: 1000 });
    const res = await page.evaluate(() => { const S = window.RotaryCam.__state; return { problems: S.problems, warnings: S.warnings, stats: document.querySelector('#rcam-root .rc-stats').innerText.replace(/\n/g, ' | '), status: document.querySelector('#rcam-root .rc-status').textContent, seconds: S.seconds }; });
    console.log(ms(), 'generated:', JSON.stringify(res));
    await page.evaluate(() => document.querySelectorAll('#rcam-root details').forEach((d) => { d.open = d.dataset.sec === 'part'; }));
    await page.screenshot({ path: path.join(outDir, '4-generated.png') });

    // placed mesh + job for the independent verifier
    const dump = await page.evaluate(() => { const S = window.RotaryCam.__state; return { tris: Array.from(S.mesh.tris), job: S.job, gcode: S.program.gcode }; });
    const n = dump.tris.length / 9, buf = Buffer.alloc(84 + n * 50);
    buf.writeUInt32LE(n, 80);
    for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) buf.writeFloatLE(dump.tris[i * 9 + k], 84 + i * 50 + 12 + 4 * k);
    fs.writeFileSync(path.join(outDir, 'placed.stl'), buf);
    fs.writeFileSync(path.join(outDir, 'job.json'), JSON.stringify(dump.job, null, 2));

    await page.click('#rcam-root .rc-save');
    await page.waitForFunction(() => /Saved to File Manager/.test(document.querySelector('#rcam-root .rc-msgs').textContent), null, { timeout: 30000 });
    const saved = await (await fetch(`http://localhost:${PORT}/__test/saved`)).json();
    console.log(ms(), 'saved to File Manager:', Object.keys(saved));

    await page.click('#rcam-root .rc-load');
    await page.waitForFunction(() => window.__closed > 0, null, { timeout: 30000 });
    const loaded = await (await fetch(`http://localhost:${PORT}/__test/loaded`)).json();
    fs.writeFileSync(path.join(outDir, 'program.nc'), loaded.content);
    console.log(ms(), 'loaded into ncSender:', loaded.filename, loaded.content.length, 'bytes; identical to preview:', loaded.content === dump.gcode);
    const settings = await (await fetch(`http://localhost:${PORT}/__test/settings`)).json();
    console.log(ms(), 'settings persisted:', !!settings.job, settings.job && ('rough tool ' + settings.job.rough.library_id + ', finish tool ' + settings.job.finish.library_id));

    // reopen: settings come back, cached build is reused
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam.__state && !window.RotaryCam.__state.mesh && window.RotaryCam.__state.tools.length > 0 && document.querySelector('#rc-rough-tool option[value="11"]'), null, { timeout: 20000 });
    const back = await page.evaluate(() => ({ rough: document.querySelector('#rc-rough-tool').value, finish: document.querySelector('#rc-finish-tool').value }));
    console.log(ms(), 'reopened; tool picks restored:', JSON.stringify(back));
  } catch (e) {
    console.log('FAILED:', e.message);
    await page.screenshot({ path: path.join(outDir, 'failure.png') }).catch(() => {});
    process.exitCode = 1;
  } finally {
    console.log('console errors/warnings:', errors.length ? errors : 'none');
    await browser.close();
    srv.kill();
  }
})();
