// 0.15.1: a place along the part named in a check (X0.63″, X1.50″ and X1.66″) lights up on the
// stock in the 3D view when hovered; the probe dialog's own speed between touches, its A step
// in degrees and where A is now, and (Pro) a switch for each keep-out zone, the ones switched
// off there back on when it closes. node test/e2e-v33.cjs test/knight_test.step <outdir> [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const UH = require('./ui-helpers.cjs');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8833));
const D = '#rcam-root .rc-pover';
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
  const zones = async () => (await H('/__test/pro')).KEEPOUT.zones;
  try {
    const ATC = { id: 'atc:com.ncsender.rapidchangeatc', name: 'ATC Zone', kind: 'atc', enabled: true, minX: -800, minY: -600, maxX: -700, maxY: -400, source: 'com.ncsender.rapidchangeatc' };
    await H('/__test/pro', { pro: true, zones: [ATC] });
    await H('/__test/probe', { world: { axisY: -200.3, axisZ: -79.6, bodyR: 40, bodyX1: -300, jawFront: 18, runout: 0, runPhase: 0, tip: 'flat', tr: 3.175, holderR: 17.5, reach: 25, conductive: 'chuck' }, start: { x: -315, y: -198, z: -33.6, a: 0 }, wco: { x: -300, y: -200.3, z: -79.6, a: 0 } });
    await page.goto(`http://localhost:${PORT}/`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(500);
    const fit = await page.$('#rcam-root .rc-fitstock'); if (fit) { await fit.click(); await page.waitForTimeout(400); }
    await UH.openStrat(page, 'rough'); await page.selectOption('#rc-rough-tool', '11');
    await UH.openStrat(page, 'finish'); await page.selectOption('#rc-finish-tool', '13');
    await page.waitForFunction(() => !document.querySelector('#rcam-root .rc-gen').disabled, null, { timeout: 20000 }).catch(async () => console.log('   problems:', JSON.stringify(await page.evaluate(() => window.RotaryCam.__state.problems))));
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 600000, polling: 1000 });

    // ---- places along the part in the checks
    const xs = await page.$$eval('#rcam-root .rc-msgs .rc-xat, #rcam-root .rc-toasts .rc-xat', (els) => els.map((e) => ({ t: e.textContent, at: e.getAttribute('data-xat'), lab: e.getAttribute('data-xlab'), msg: e.closest('.rc-msg').textContent.slice(0, 60) })));
    console.log('   ', JSON.stringify(xs.slice(0, 4)));
    ok(xs.length > 0, xs.length + ' places along the part marked in the checks');
    const range = xs.find((x) => /\|/.test(x.lab));
    if (range) {
      const [a, b] = range.at.split(',').map(Number), m = range.t.match(/X([\d.]+) ?(″|mm).*X([\d.]+) ?(″|mm)/), f = (v, u) => v * (u === 'mm' ? 1 : 25.4);
      ok(m && Math.abs(a - f(m[1], m[2])) < 0.01 && Math.abs(b - f(m[3], m[4])) < 0.01, 'a stretch keeps both ends, in mm: ' + range.t + ' → ' + range.at);
    }
    ok(!(await page.$$eval('#rcam-root .rc-msg button .rc-xat, #rcam-root .rc-msg [title*="rc-xat"]', (e) => e.length)), 'nothing marked inside a button or a tooltip');
    const one = await page.$('#rcam-root .rc-msgs .rc-xat, #rcam-root .rc-toasts .rc-xat');
    await one.scrollIntoViewIfNeeded();
    await one.hover(); await page.waitForTimeout(900);
    await shot('1-hover-place');
    await page.mouse.move(5, 5); await page.waitForTimeout(300);
    await shot('2-off');

    // ---- Simulate: a strip of passes under the slider, red marks where something went wrong
    await page.click('#rcam-root [data-tab=sim]');
    await page.waitForFunction(() => window.RotaryCam.sim && window.RotaryCam.sim.checked, null, { timeout: 300000, polling: 500 });
    await page.waitForTimeout(800);
    const sim = await page.evaluate(() => { const R = window.RotaryCam.sim, r = window.RotaryCam.__state.simReport; return { passes: document.querySelectorAll('#rcam-root .rc-simpass').length, marks: document.querySelectorAll('#rcam-root .rc-simmark').length, data: (R.marks || []).length, problems: (r.rapids || 0) + (r.gouges || 0) + (r.tenon.count || 0) + (r.holder.count || 0), stop: !!document.querySelector('#rcam-root .rc-simstopbox') }; });
    console.log('   ', JSON.stringify(sim));
    ok(sim.passes >= 2, sim.passes + ' passes on the strip');
    ok(sim.problems ? sim.marks > 0 && sim.marks === sim.data : sim.marks === 0, 'a red mark for what the simulation found (' + sim.problems + ' problems, ' + sim.marks + ' marks)');
    ok(sim.stop, 'a Stop at problems switch');
    if (sim.marks) {
      await page.click('#rcam-root .rc-simmark');
      await page.waitForTimeout(600);
      const at = await page.evaluate(() => { const R = window.RotaryCam.sim; return { t: R.t, go: R.marks[0].go }; });
      ok(Math.abs(at.t - at.go) < 1e-6, 'a click on a mark goes there');
      await page.click('#rcam-root .rc-rewind'); await page.waitForTimeout(300);
      await page.selectOption('#rcam-root .rc-simspeed', '1000');
      await page.click('#rcam-root .rc-play');
      const stopped = await until(() => page.evaluate(() => { const R = window.RotaryCam.sim; return !R.playing && R.t > 0 && R.t; }), 60);
      const first = await page.evaluate(() => window.RotaryCam.sim.marks[0].go);
      ok(stopped && Math.abs(stopped - first) < 1e-6, 'playing stops at the first problem (' + (stopped && stopped.toFixed(2)) + ' / ' + first.toFixed(2) + ' min)');
    }
    await shot('2b-sim');
    await page.click('#rcam-root [data-tab="3d"]'); await page.waitForTimeout(400);

    // ---- the probe dialog
    await page.click('#rcam-root .rc-probechuck');
    await page.waitForSelector(D + ' .rc-pcard');
    await page.waitForTimeout(600);
    const sp = await page.$eval(D + ' [data-pk=rapid]', (e) => ({ ph: e.placeholder, label: e.closest('.rc-pgroup').querySelector('label').textContent })).catch(() => null);
    ok(sp && /Speed between touches/.test(sp.label) && /auto/.test(sp.ph), 'Speed between touches, empty: ncSender’s probe speed (' + (sp && sp.ph) + ')');
    const steps = await page.$$eval(D + ' [data-pajogstep]', (b) => b.map((e) => e.textContent));
    ok(steps.join(',') === '1,15,45,90', 'A has its own steps, in degrees: ' + steps.join(', '));
    const apos = await until(() => page.$eval(D + ' .rc-papos', (e) => e.textContent).catch(() => ''), 5);
    ok(/A\s*[\d.]+°/.test(apos || ''), 'where A is now: ' + apos);
    await page.click(D + ' [data-pajogstep="90"]');
    const before = (await H('/__test/commands')).commands.length;
    const aBtn = await page.$(D + ' [data-pjog="A+"]');
    await aBtn.click();
    const sent = await until(async () => (await H('/__test/commands')).commands.slice(before).find((c) => /^\$J=.*A90/.test(c)), 5);
    ok(sent, 'A+ jogs A by 90°: ' + sent);
    ok(await page.evaluate((b) => b.isConnected, aBtn), 'the A+ button is still the same one after A moved (not redrawn under the pointer)');

    // ---- keep-out zones (Pro)
    const sw = await until(() => page.$$eval(D + ' [data-pzone]', (e) => e.map((x) => ({ id: x.getAttribute('data-pzone'), on: x.checked, name: x.closest('label').textContent }))).then((l) => l.length >= 3 && l), 10);
    ok(sw && sw.some((z) => /rotary-cam/.test(z.id)) && sw.some((z) => z.id === ATC.id), 'a switch for each keep-out zone: ' + (sw || []).map((z) => z.name + (z.on ? ' on' : ' off')).join(', '));
    const head = sw && sw.find((z) => /head/.test(z.id));
    await page.click(D + ` label:has([data-pzone="${head.id}"]) .rc-pslider`);
    const off = await until(async () => (await zones()).find((z) => z.id === head.id && z.enabled === false), 6);
    ok(off, 'switched off: ncSender has it off');
    ok(/is off/.test(await page.$eval(D + ' .rc-pmsg', (e) => e.textContent).catch(() => '')), 'and the dialog says it goes back on when it closes');
    await page.waitForTimeout(4500);    // a look at ncSender meanwhile mustn't put it back on
    ok((await zones()).find((z) => z.id === head.id).enabled === false, 'it stays off while the dialog is open');
    await shot('3-probe-dialog');
    await page.click(D + ' [data-pact=close]');
    const back = await until(async () => (await zones()).find((z) => z.id === head.id && z.enabled !== false), 6);
    ok(back, 'closing the dialog puts it back on');
    ok((await zones()).find((z) => z.id === ATC.id).enabled !== false, 'the other zones as they were');
  } catch (e) {
    fails++; console.log(ms(), 'FAIL threw: ' + (e && e.stack || e));
  }
  ok(!errors.length, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' / ') : ''));
  await browser.close(); srv.kill();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
