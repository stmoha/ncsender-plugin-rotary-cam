// 0.12.0: Probe the chuck. The dialog (laid out like ncSender's own probe dialog) runs the
// touches through ncSender's probe runner against a pretend rotary on the table: X0 lands on
// the jaw face and Y0 Z0 on the axis, with the half turn finding the true axis of a chuck
// that doesn't run true; the connection test holds Start Probe back; a jaw face further than
// set stops it and says why; an alarm turns Start Probe into Unlock; and the units go back.
// node test/e2e-v26.cjs <outdir> [--dark] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8819));

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
  const H = (p, b) => fetch(`http://localhost:${PORT}${p}`, b === undefined ? {} : { method: 'POST', body: JSON.stringify(b) }).then((r) => r.json());
  const shot = (n) => page.screenshot({ path: path.join(outDir, 'v26-' + n + (dark ? '-dark' : '') + '.png') });
  const D = '#rcam-root .rc-pover';
  const msg = () => page.$eval(D + ' .rc-pmsg', (e) => e.textContent).catch(() => '');
  const setField = async (k, v) => { await page.fill(D + ` [data-pk=${k}]`, String(v)); await page.press(D + ` [data-pk=${k}]`, 'Tab'); await page.waitForTimeout(150); };
  const pick = async (k, v) => { await page.selectOption(D + ` [data-pk=${k}]`, v); await page.waitForTimeout(150); };
  const startOn = () => page.$eval(D + ' [data-pact=start]', (b) => !b.disabled).catch(() => false);
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const WORLD = { axisY: -200.3, axisZ: -79.6, bodyR: 40, bodyX1: -300, jawFront: 18, runout: 0.12, runPhase: 40, tip: 'ball', tr: 1, holderR: 12.5, reach: 30, conductive: 'all' };
  const START = { x: -315, y: -198, z: -79.6 + 40 + 6, a: 0 };
  try {
    await H('/__test/probe', { world: WORLD, start: START, wco: { x: -300, y: -200, z: -80, a: 0 } });
    await page.goto('about:blank');
    await page.goto(`http://localhost:${PORT}/${dark}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.waitForTimeout(500);
    await page.evaluate(() => { document.querySelector('#rcam-root details[data-sec=zero]').open = true; });
    const title = await page.$eval('#rcam-root details[data-sec=zero] summary', (e) => e.textContent);
    ok(/probe the chuck or a corner/.test(title), 'the Work zero section: ' + title.trim());
    await page.click('#rcam-root [data-act=probe-open]');
    await page.waitForSelector(D + ' .rc-pcard');
    ok(await page.$eval(D + ' .rc-phead p', (e) => getComputedStyle(e).fontStyle === 'italic'), 'italic instructions at the top, like ncSender’s');
    ok(await page.$(D + ' .rc-pleft [data-pk=tool]') && await page.$(D + ' .rc-pleft [data-pk=what]') && await page.$(D + ' .rc-pright [data-pk=test]') && await page.$(D + ' .rc-pright .rc-pjogpad') && await page.$(D + ' .rc-pright svg'), 'probe type and probing on the left; connection test, picture and jog pad on the right');
    const whats = await page.$$eval(D + ' [data-pk=what] option', (o) => o.map((e) => e.textContent));
    ok(whats.join('|') === 'X, Y and Z|Y and Z (centre)|X (jaw face)|Y|Z', 'Probing: all three or any one: ' + whats.join(', '));
    ok(/measure the round body/.test(await page.$eval(D + ' .rc-perr', (e) => e.textContent).catch(() => '')), 'asks for the chuck body diameter first');
    ok(!(await startOn()), 'Start Probe off until it’s set and tested');

    await setField('body', 80);
    await setField('ahead', 30);
    ok(!(await page.$(D + ' .rc-perr')), 'no settings problems once the diameter is in');
    ok(/Touch the probe/.test(await page.$eval(D + ' .rc-pconnmsg', (e) => e.textContent)) && !(await startOn()), 'connection test on: waits for a touch');
    await H('/__test/probe', { touch: true }); await page.waitForTimeout(700);
    ok(await page.$eval(D + ' .rc-plight', (e) => e.classList.contains('on')), 'the light goes green while the probe touches');
    await shot('touching');
    await H('/__test/probe', { touch: false }); await page.waitForTimeout(700);
    ok(await startOn() && /Tested/.test(await page.$eval(D + ' .rc-pconnmsg', (e) => e.textContent)), 'tested: Start Probe wakes up');
    const steps = await page.$$eval(D + ' .rc-psteps li', (l) => l.map((e) => e.textContent));
    ok(steps.length === 5 && /180/.test(steps[2]) && /jaw up/.test(steps[4]), 'the steps listed: ' + steps.join(' / '));

    // XYZ with the half turn
    await page.click(D + ' [data-pact=start]');
    await page.waitForSelector(D + ' [data-pact=stop]', { timeout: 5000 });
    ok(true, 'Stop shows while it runs');
    await page.waitForFunction((d) => { const m = document.querySelector(d + ' .rc-pmsg'); return m && /Done|Stopped|alarm/.test(m.textContent); }, D, { timeout: 180000, polling: 300 });
    let m = await msg(); console.log('   ' + m);
    let sim = await H('/__test/probe');
    ok(/^Done: X0, Y0 and Z0 set/.test(m), 'done');
    ok(!sim.crash, 'nothing hit');
    ok(near(sim.wco.x, sim.jawFace, 0.003) && near(sim.wco.y, -200.3, 0.003) && near(sim.wco.z, -79.6, 0.003), 'X0 on the jaw face, Y0 Z0 on the true axis: ' + [sim.wco.x, sim.wco.y, sim.wco.z].map((v) => v.toFixed(4)).join(' '));
    ok(/runs 0\.12\d? mm off true/.test(m), 'says how far off true the chuck runs');
    ok(/measured 80(\.0)? mm across/.test(m), 'says what the chuck measured');
    ok(sim.metric && sim.abs, 'the controller is back in mm, absolute');
    const z = await page.evaluate(() => window.RotaryCam.__state.job.rig.tc.zero);
    ok(z && near(z.x, sim.wco.x, 0.002) && near(z.y, sim.wco.y, 0.002), 'the rotary zero for tool changes follows: ' + JSON.stringify(z));
    ok(sim.jobs.every((j) => j[j.length - 1] === 'G4 P0'), 'every job waits for the moves to finish (G4 P0)');
    ok(sim.jobs.some((j) => j.includes('G0 A180.000')) && sim.jobs.some((j) => j.includes('G0 A0')), 'turns A 180 and back, then a jaw up');
    await shot('done');
    await page.locator(D + ' .rc-pcard').screenshot({ path: path.join(outDir, 'v26-card' + (dark ? '-dark' : '') + '.png') });

    // X only, the jaw face further than set: stops above the jaw and says why
    await pick('what', 'x');
    ok(!(await page.$(D + ' [data-pk=body]')) && await page.$(D + ' [data-pk=ahead]'), 'X only: no chuck diameter, the jaw face distance');
    await H('/__test/probe', { at: { x: -320, y: -200.3, z: -79.6 + 40 + 6 } });
    await setField('ahead', 20);
    await page.click(D + ' [data-pact=start]');
    await page.waitForFunction((d) => { const m = document.querySelector(d + ' .rc-pmsg'); return m && /Done|Stopped|alarm/.test(m.textContent); }, D, { timeout: 60000, polling: 300 });
    m = await msg(); sim = await H('/__test/probe');
    ok(/came down on the jaw/.test(m) && /Set it bigger/.test(m) && !sim.crash, 'stops on the jaw, not into it: ' + m.slice(0, 110));
    ok(await page.$eval(D + ' .rc-pmsg', (e) => e.classList.contains('rc-pwarn')), 'shown as a warning');
    await shot('jaw');

    // Z only from too high: an alarm, and Start Probe turns into Unlock
    await pick('what', 'z');
    await H('/__test/probe', { at: { x: -320, y: -200.3, z: -79.6 + 40 + 32 } });
    await page.click(D + ' [data-pact=start]');
    await page.waitForFunction((d) => { const m = document.querySelector(d + ' .rc-pmsg'); return m && /Done|Stopped|alarm/.test(m.textContent); }, D, { timeout: 60000, polling: 300 });
    await page.waitForTimeout(600);
    ok(/alarm/.test(await msg()) && await page.$(D + ' [data-pact=unlock]'), 'an alarm: says what usually causes it, Unlock instead of Start Probe');
    await shot('alarm');
    await page.click(D + ' [data-pact=unlock]'); await page.waitForTimeout(800);
    ok(!(await page.$(D + ' [data-pact=unlock]')) && await page.$(D + ' [data-pact=start]'), 'Unlock clears it');

    // jog and A0
    sim = await H('/__test/probe'); const x0 = sim.m.x;
    await page.click(D + ' [data-pjogstep="1"]');
    await page.click(D + ' [data-pjog="X+"]'); await page.waitForTimeout(400);
    sim = await H('/__test/probe');
    ok(sim.m.x > x0, 'the jog pad jogs (X+ ' + (sim.m.x - x0).toFixed(2) + ')');
    await page.click(D + ' [data-pact=a0]'); await page.waitForTimeout(400);
    ok(/A0 is where A is now/.test(await msg()), 'A0 here sets A0');
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    ok(!(await page.$(D)), 'Escape closes it');
    await page.evaluate(() => { document.querySelector('#rcam-root details[data-sec=zero]').open = true; });
    const zm = await page.$eval('#rcam-root [data-zero=info]', (e) => e.textContent);
    ok(/Probed the chuck/.test(zm), 'the Work zero section says it was probed');
    // in inches: the fields show inches, and what's typed is kept in mm
    await fetch(`http://localhost:${PORT}/__test/units`, { method: 'POST', body: 'imperial' });
    await page.goto('about:blank'); await page.goto(`http://localhost:${PORT}/${dark}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.waitForTimeout(500);
    await page.evaluate(() => { document.querySelector('#rcam-root details[data-sec=zero]').open = true; });
    await page.click('#rcam-root [data-act=probe-open]');
    await page.waitForSelector(D + ' .rc-pcard');
    await pick('what', 'xyz');
    const inch = await page.$eval(D + ' [data-pk=body]', (e) => [e.value, e.nextElementSibling.textContent]);
    ok(Math.abs(parseFloat(inch[0]) - 80 / 25.4) < 0.001 && inch[1] === 'in', 'in inches: the chuck shows ' + inch.join(' '));
    await setField('body', 3.5);
    ok(Math.abs(await page.evaluate(() => window.RotaryCam.__state.job.rig.probe.body) - 88.9) < 1e-6, 'typed in inches, kept in mm');
    await page.keyboard.press('Escape');
    ok(!errors.length, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  } catch (e) { fails++; console.log('ERROR', e); await shot('error').catch(() => {}); }
  await browser.close(); srv.kill();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
