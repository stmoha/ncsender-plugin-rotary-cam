// 0.12.0: the same job on another computer. The settings were already shared through
// ncSender; now the part and its toolpaths are too, so another computer opens where this
// one left off (and one that's already open takes the change in).
// node test/e2e-v28.cjs test/horn.stl test/coil.stl <outdir> [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const UH = require('./ui-helpers.cjs');
const [partA, partB, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8828));
const FILE = '.rotary-cam/last-job.rcam.b64';

fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const H = (p) => fetch(`http://localhost:${PORT}${p}`).then((r) => r.json());
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errors = [];
  let fails = 0;
  const t = Date.now(), ms = () => ((Date.now() - t) / 1000).toFixed(1) + 's';
  const ok = (cond, what) => { if (!cond) fails++; console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what); };
  const ready = async (page) => {
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0 && document.querySelector('#rcam-root .rc-side .rc-grp'), null, { timeout: 30000 });
  };
  async function computer(name) {
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();
    page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(name + ' ' + m.type() + ': ' + m.text()); });
    page.on('pageerror', (e) => errors.push(name + ' pageerror: ' + e.message));
    await page.goto(`http://localhost:${PORT}/`);
    await ready(page);
    return page;
  }
  const state = (page) => page.evaluate(() => { const S = window.RotaryCam.__state, Y = window.RotaryCam.sync; return { name: S.fileName, tris: S.raw ? S.raw.length : 0, mesh: !!S.mesh, lines: S.program ? S.program.gcode.split('\n').length : 0, gcode: S.program ? S.program.gcode.length : 0, id: Y.id, dirty: Y.dirty, toast: S.toast && S.toast.text }; });
  const notices = (page) => page.$$eval('#rcam-root .rc-toasts .rc-msg, #rcam-root .rc-msgs .rc-msg', (els) => els.map((m) => m.textContent).join(' | '));
  const published = async (id0) => { for (let i = 0; i < 150; i++) { const s = (await H('/__test/settings')).session; if (s && s.id && s.id !== id0) return s; await new Promise((r) => setTimeout(r, 200)); } return null; };
  try {
    // ---- A opens a part and generates
    const A = await computer('A');
    ok(!(await H('/__test/settings')).session && !(FILE in await H('/__test/saved')), 'to start with, ncSender has no job');
    await A.setInputFiles('#rcam-root input[type=file]', partA);
    await A.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await A.evaluate(() => { const S = window.RotaryCam.__state; S.job.angle_step_deg = 6; S.job.finish.pitch = 2; S.job.rough.pitch = 5; S.job.index.enabled = false; });
    await A.evaluate(() => { document.querySelector('#rcam-root details[data-sec=stock]').open = true; });
    await A.click('#rcam-root [data-act=fitstock]'); await A.waitForTimeout(400);
    const s1 = await published(null);
    ok(s1 && s1.name === path.basename(partA) && s1.size > 1000 && !s1.key, `A opened ${path.basename(partA)}: it's put in ncSender (${s1 && (s1.size / 1e6).toFixed(2)} MB), no toolpaths yet`);
    await A.click('#rcam-root .rc-gen');
    await A.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 900000, polling: 500 });
    const s2 = await published(s1 && s1.id), a = await state(A);
    ok(a.lines > 100 && s2 && s2.key && s2.id === a.id && !a.dirty, `A generated (${a.lines} lines): the toolpaths are put there too`);
    const saved = await H('/__test/saved');
    ok(typeof saved[FILE] === 'string' && saved[FILE].length > 1000 && Object.keys(saved).every((k) => k === FILE), 'as one file, in a folder whose name starts with a dot (ncSender’s File Manager doesn’t list those): ' + Object.keys(saved).join(', '));

    // ---- B, a computer that has never seen the part, opens Rotary CAM
    await A.waitForTimeout(1500);
    const jobBefore = (await H('/__test/settings')).job;
    const B = await computer('B');
    await B.waitForFunction(() => window.RotaryCam.__state.program, null, { timeout: 60000 });
    await B.waitForTimeout(300);
    const b = await state(B), nb = await notices(B);
    ok(b.name === a.name && b.tris === a.tris && b.mesh && b.gcode === a.gcode && b.id === a.id, `B opens where A left off: ${b.name}, the same ${b.lines} lines of G-code`);
    ok(/Picked up .* and its toolpaths from another computer/.test(nb), 'and says so: ' + (nb.match(/Picked up[^|]*/) || [''])[0]);
    ok(await B.evaluate(() => !document.querySelector('#rcam-root [data-tab=sim]').disabled), 'ready to simulate or load there');
    await B.screenshot({ path: path.join(outDir, 'v28-B.png') });
    // picking it up changes nothing for A: the settings are as they were, its toolpaths still there
    await B.waitForTimeout(5000);
    const sAfter = await H('/__test/settings');
    ok(JSON.stringify(sAfter.job) === JSON.stringify(jobBefore) && sAfter.session.id === s2.id && (await state(A)).lines === a.lines, 'B picking it up leaves the settings alone, and A keeps its toolpaths');

    // ---- B opens another part; A, still open, takes it in at its next look (every few seconds)
    await B.setInputFiles('#rcam-root input[type=file]', partB);
    await B.waitForFunction((n) => window.RotaryCam.__state.fileName === n && window.RotaryCam.__state.mesh, path.basename(partB), { timeout: 120000 });
    const s3 = await published(s2.id);
    ok(s3 && s3.name === path.basename(partB), 'B opens ' + path.basename(partB) + ': put in ncSender');
    await A.waitForFunction((n) => window.RotaryCam.__state.fileName === n, path.basename(partB), { timeout: 30000 });
    await A.waitForTimeout(400);
    const a2 = await state(A), na = await notices(A);
    ok(a2.name === path.basename(partB) && a2.mesh && !a2.lines && a2.id === s3.id && /Picked up .* from another computer/.test(na), 'A, left open, now has it too (no toolpaths: none were made): ' + (na.match(/Picked up[^|]*/) || [''])[0]);

    // ---- A closes the page and comes back: what it has is what ncSender has, nothing is fetched again
    let fetched = 0;
    A.on('request', (rq) => { if (/gcode-files\/file\?/.test(rq.url())) fetched++; });
    await A.goto('about:blank'); await A.goto(`http://localhost:${PORT}/`); await ready(A);
    await A.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 60000 });
    await A.waitForTimeout(6000);
    const a3 = await state(A);
    ok(a3.name === path.basename(partB) && a3.id === s3.id && fetched === 0 && (await H('/__test/settings')).session.id === s3.id, 'A reopened: the same part from its own browser, the job in ncSender untouched');

    // ---- a change here that hasn't reached ncSender yet wins over ncSender's copy
    await A.evaluate(() => { window.RotaryCam.__noSession = true; });
    await A.setInputFiles('#rcam-root input[type=file]', partA);
    await A.waitForFunction((n) => window.RotaryCam.__state.fileName === n && window.RotaryCam.__state.mesh, path.basename(partA), { timeout: 120000 });
    await A.waitForTimeout(6500);
    ok((await state(A)).dirty && (await state(A)).name === path.basename(partA) && (await H('/__test/settings')).session.id === s3.id, 'a part opened while ncSender can’t be reached stays (it isn’t replaced by ncSender’s older one)');
    await A.evaluate(() => { window.RotaryCam.__noSession = false; });
    const s4 = await published(s3.id);
    ok(s4 && s4.name === path.basename(partA), 'and is put there as soon as it can be');
  } catch (e) { ok(false, 'threw: ' + (e && e.stack || e)); }
  ok(!errors.length, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  await browser.close(); srv.kill();
  process.exit(fails ? 1 : 0);
})();
