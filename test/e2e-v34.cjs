// 0.15.2: Save project opens the computer's Save As box right at the click (before the settings
// and the zip, which take long enough that the browser would no longer count the click), writes
// the project where it was put, and does nothing more when the box is closed. Where the browser
// won't show the box, it's a download, and the first one says how to get a Save As anyway.
// The Save As box is stood in for (RotaryCam.picker): a real one can't be clicked in a test.
// node test/e2e-v34.cjs test/horn.stl <outdir> [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8834));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errors = [];
  let fails = 0;
  const t0 = Date.now(), ms = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';
  const ok = (cond, what) => { if (!cond) fails++; console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what); };
  const until = async (fn, secs = 12) => { for (let i = 0; i < secs * 5; i++) { const v = await fn(); if (v) return v; await sleep(200); } return null; };
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const msgs = () => page.evaluate(() => ['.rc-toasts', '.rc-msgs'].map((s) => { const e = document.querySelector('#rcam-root ' + s); return e ? e.innerText : ''; }).join(' ').replace(/\n/g, ' '));
  const idle = () => until(() => page.evaluate(() => !window.RotaryCam.__state.busy && !document.querySelector('#rcam-root .rc-saveproj').disabled), 60);
  let downloads = [];
  page.on('download', (d) => downloads.push(d));
  try {
    await page.goto(`http://localhost:${PORT}/`);
    await page.evaluate(() => { try { localStorage.removeItem('rcam.saveTip'); } catch (e) {} });
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh && !window.RotaryCam.__state.busy, null, { timeout: 120000 });
    await page.waitForTimeout(800);

    // the stand-in Save As box: what it was asked, whether that was still inside the click, and
    // what was written to the file it hands back
    await page.evaluate(() => {
      const W = window.__save = { asked: [], written: null, closed: false, inClick: false, mode: 'pick', requests: [] };
      document.addEventListener('click', () => { W.clicking = true; }, true);
      document.addEventListener('click', () => { W.clicking = false; });
      const of = window.fetch;
      window.fetch = function (u) { W.requests.push({ u: String(u), asked: W.asked.length }); return of.apply(this, arguments); };
      window.RotaryCam.picker = (o) => {
        W.asked.push({ o: JSON.parse(JSON.stringify(o)), inClick: !!W.clicking, btnOff: document.querySelector('#rcam-root .rc-saveproj').disabled });
        if (W.mode === 'cancel') return Promise.reject(new DOMException('The user aborted a request.', 'AbortError'));
        if (W.mode === 'refuse') return Promise.reject(new DOMException('Must be handling a user gesture to show a file picker.', 'SecurityError'));
        return Promise.resolve({ name: 'Chosen name.rcam', createWritable: async () => ({
          write: async (b) => { const u = new Uint8Array(await new Response(b).arrayBuffer()); W.written = { size: u.length, head: Array.from(u.slice(0, 4)) }; },
          close: async () => { W.closed = true; } }) });
      };
    });

    // ---- Save As: picked, written
    await page.click('#rcam-root .rc-saveproj');
    await idle();
    let W = await page.evaluate(() => window.__save);
    const a0 = W.asked[0];
    ok(W.asked.length === 1 && a0.inClick, 'the Save As box opens inside the click itself (the browser allows it only then)');
    ok(a0 && a0.o.suggestedName === 'horn.rcam' && a0.o.id === 'rotary-cam-project' && JSON.stringify(a0.o.types[0].accept) === '{"application/zip":[".rcam"]}', `it suggests ${a0 && a0.o.suggestedName}, as a Rotary CAM project (.rcam), in the folder used last time`);
    ok(a0 && a0.btnOff, 'Save project is greyed out while the box is open');
    ok(!W.requests.some((r) => r.asked === 0 && /\/settings/.test(r.u)), 'the settings are sent after the box, not before');
    const last = await page.evaluate(() => window.RotaryCam.lastProject);
    ok(W.written && W.closed && W.written.size === last.size && W.written.head.join() === '80,75,3,4', `the project (a ZIP, ${(last.size / 1e6).toFixed(2)} MB) is written to the file chosen and closed`);
    let m = await msgs();
    ok(/Saved Chosen name\.rcam \([\d.]+ MB\)/.test(m) && !/download/i.test(m), 'the message names the file as it was saved: ' + m.slice(0, 120));
    ok(downloads.length === 0, 'and nothing went to the downloads');
    await shot('1-saved');

    // ---- the box closed without saving: nothing more
    await page.evaluate(() => { const W = window.__save; W.mode = 'cancel'; W.written = null; W.closed = false; window.RotaryCam.__state.toast = null; });
    await page.click('#rcam-root .rc-saveproj');
    await idle();
    W = await page.evaluate(() => window.__save);
    const toast = await page.evaluate(() => window.RotaryCam.__state.toast);
    ok(W.asked.length === 2 && !W.written && downloads.length === 0 && !toast, 'closing the box saves nothing, downloads nothing and says nothing' + (toast ? ': ' + toast.text : ''));
    ok(!(await page.$eval('#rcam-root .rc-saveproj', (b) => b.disabled)), 'Save project is ready again');

    // ---- the browser refuses the box: a download, and the first time how to get a Save As
    await page.evaluate(() => { window.__save.mode = 'refuse'; });
    await page.click('#rcam-root .rc-saveproj');
    const dl = await until(() => downloads[0], 60);
    await idle();
    m = await msgs();
    ok(dl && dl.suggestedFilename() === 'horn.rcam', 'refused: it downloads horn.rcam instead');
    if (dl) { const p = path.join(outDir, 'horn.rcam'); await dl.saveAs(p); const b = fs.readFileSync(p); ok(b.length > 1000 && b.slice(0, 4).toString('hex') === '504b0304', `the download is the project (${(b.length / 1e6).toFixed(2)} MB ZIP)`); }
    ok(/Your browser saved horn\.rcam \([\d.]+ MB\) as a download/.test(m) && /Ask where to save each file/.test(m), 'the first download says how to choose the folder and name: ' + m.slice(0, 220));
    await shot('2-download-tip');
    await page.evaluate(() => { window.RotaryCam.__state.toast = null; });
    await page.click('#rcam-root .rc-saveproj');
    await until(() => downloads[1], 60); await idle();
    m = await msgs();
    ok(downloads.length === 2 && /as a download/.test(m) && !/Ask where/.test(m), 'the next one just says it was saved');

    // ---- no Save As in this browser (ncSender at a plain http address from another computer): says why
    await page.evaluate(() => { const R = window.RotaryCam; R.noPicker = true; R.saveTip = 'http'; R.__state.toast = null; });
    await page.click('#rcam-root .rc-saveproj');
    await until(() => downloads[2], 60); await idle();
    m = await msgs();
    W = await page.evaluate(() => window.__save);
    ok(downloads.length === 3 && W.asked.length === 4, 'without a Save As box it goes straight to a download');
    ok(/ncSender on this computer or an https address/.test(m) && /Ask where to save each file/.test(m), 'and on a plain http address the tip says why: ' + m.slice(0, 260));
    await shot('3-http-tip');
  } catch (e) {
    fails++; console.log(ms(), 'FAIL threw: ' + (e && e.stack || e));
  }
  ok(!errors.length, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' / ') : ''));
  await browser.close(); srv.kill();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
