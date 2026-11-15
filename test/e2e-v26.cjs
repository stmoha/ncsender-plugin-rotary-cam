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
  // a pin (6.35, 25 out of a 35 nut, the defaults) and the clip, the chuck wired to the probe
  const WORLD = { axisY: -200.3, axisZ: -79.6, bodyR: 40, bodyX1: -300, jawFront: 18, runout: 0.12, runPhase: 40, tip: 'flat', tr: 3.175, holderR: 17.5, reach: 25, conductive: 'chuck' };
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
    const types = await page.$$eval(D + ' [data-pk=tool] option', (o) => o.map((e) => e.textContent));
    ok(types.join('|') === 'Pin (with a clip)|3D probe|Fluted bit (with a clip)' && await page.$eval(D + ' [data-pk=tool]', (e) => e.value) === 'pin', 'probe types, a pin to start with: ' + types.join(', '));
    const a0 = await page.$eval(D + ' [data-pact=a0]', (b) => [b.textContent, b.title, b.nextElementSibling && b.nextElementSibling.textContent]);
    ok(a0[0] === 'Zero A' && /jaw points straight up/.test(a0[2]) && /G10 L20 P0 A0/.test(a0[1]), 'Zero A, with what it\u2019s for under it: ' + a0[2]);
    const whats = await page.$$eval(D + ' [data-pk=what] option', (o) => o.map((e) => e.textContent));
    ok(whats.join('|') === 'X, Y and Z|Y and Z (centre)|X (jaw face)|Y|Z', 'Probing: all three or any one: ' + whats.join(', '));
    ok(/measure the round body/.test(await page.$eval(D + ' .rc-perr', (e) => e.textContent).catch(() => '')), 'asks for the chuck body diameter first');
    ok(!(await startOn()), 'Start Probe off until it’s set and tested');

    await setField('body', 80);
    await setField('ahead', 30);
    ok(!(await page.$(D + ' .rc-perr')), 'no settings problems once the diameter is in');
    // ---- the picture: one scale for both views, the axis at one height, and it follows every
    // setting as it's typed (no blur). Sizes are read back from the drawing and compared with
    // the settings: pin 6.35, 25 out of a 35 nut; chuck 80 (100 with its jaws); stock 40.
    const typeIn = async (k, v) => { await page.fill(D + ` [data-pk=${k}]`, String(v)); await page.waitForTimeout(120); };
    const geo = () => page.$eval(D + ' .rc-ppic', (svg) => {
      const num = (el, a) => +el.getAttribute(a), k = +svg.dataset.k, ay = +svg.dataset.ay, ex0 = +svg.dataset.ex0, sx0 = +svg.dataset.sx0;
      const tool = (name) => { const g = svg.querySelector(`[data-t=${name}]`); if (!g) return null; const pin = g.querySelector('rect.pin'), nut = g.querySelector('rect.hold'); return { cx: num(pin, 'x') + num(pin, 'width') / 2, tip: num(pin, 'y') + num(pin, 'height'), len: num(pin, 'height'), w: num(pin, 'width'), nutW: num(nut, 'width'), nutBottom: num(nut, 'y') + num(nut, 'height') }; };
      const dim = (key) => { const g = svg.querySelector(`.rc-pd[data-h=${key}]`); if (!g) return null; const l = g.querySelector('line:not(.w)'), tips = [...g.querySelectorAll('polygon')].map((pg) => pg.getAttribute('points').split(' ')[0].split(',').map(Number)); return { x1: num(l, 'x1'), y1: num(l, 'y1'), x2: num(l, 'x2'), y2: num(l, 'y2'), tips, on: g.classList.contains('on'), label: g.querySelector('text') ? g.querySelector('text').textContent : '' }; };
      const circ = svg.querySelector('circle.rc-pchuck'), side = svg.querySelector('rect.rc-pchuck');
      return { k, ay, ex0, sx0, endR: num(circ, 'r'), endCy: num(circ, 'cy'), sideTop: num(side, 'y'), sideH: num(side, 'height'),
        front: tool('front'), back: tool('back'), start: tool('start'), touch: tool('touch'),
        dims: Object.fromEntries(['depth', 'reach', 'body', 'ahead', 'past', 'xz', 'room'].map((q) => [q, dim(q)])),
        lit: [...svg.querySelectorAll('.rc-pd.on[data-h], .rc-ppath.on')].map((g) => g.getAttribute('data-h')),
        titles: [...svg.querySelectorAll('.rc-ptitle')].map((t) => t.textContent) };
    });
    const eq = (a, b, tol = 0.2) => Math.abs(a - b) <= tol;
    let g = await geo();
    ok(g.titles.join('|') === 'End view|Side view', 'the views are called End view and Side view');
    ok(eq(g.endR, 40 * g.k) && eq(g.sideH, 80 * g.k) && eq(g.endCy, g.ay) && eq(g.sideTop + g.sideH / 2, g.ay), 'both views at one scale, the chuck at the same height in both (' + g.k.toFixed(2) + ' px per mm)');
    ok(eq(g.front.len, 25 * g.k) && eq(g.front.w, 6.35 * g.k) && eq(g.front.nutW, 35 * g.k), 'the pin, its stickout and the collet nut to scale');
    // auto: 20 mm below the top; the tip's edge on the chuck there
    ok(eq(g.front.tip, g.ay - 20 * g.k) && eq(g.front.cx, g.ex0 - (Math.sqrt(40 * 40 - 20 * 20) + 3.175) * g.k) && eq(g.back.cx - g.ex0, g.ex0 - g.front.cx), 'the tips touch the front and the back of the chuck 20 mm below the top');
    // each setting, typed (not blurred): the drawing moves to match
    await typeIn('body', 60); g = await geo();
    ok(eq(g.endR, 30 * g.k) && eq(g.sideH, 60 * g.k) && /60 mm/.test(g.dims.body.label), 'Chuck body diameter 60: both views follow as it’s typed');
    await typeIn('body', 80);
    await typeIn('depth', 30); g = await geo();
    ok(eq(g.front.tip, g.ay - 10 * g.k) && eq(g.back.tip, g.front.tip) && eq(g.front.cx, g.ex0 - (Math.sqrt(40 * 40 - 10 * 10) + 3.175) * g.k), 'Touch the sides 30: both tips 30 below the top, still on the chuck');
    ok(eq(g.dims.depth.y1, g.ay - 40 * g.k) && eq(g.dims.depth.y2, g.front.tip) && g.dims.depth.tips.every((t, i) => eq(t[1], i ? g.front.tip : g.ay - 40 * g.k)) && /30 mm/.test(g.dims.depth.label), 'its dimension runs from the top of the chuck to the tip, arrowheads ending exactly there');
    ok(g.dims.depth.on && g.lit.join() === 'depth,room', 'that dimension lights, and the room it leaves under the nut (' + g.lit.join() + ')');
    await typeIn('depth', 36); g = await geo();
    ok(g.dims.room === null || /hits|clears/.test(await page.$eval(D + ' .rc-ppic', (e) => e.textContent)), 'deeper than the nut allows still draws');
    ok(/would come within 2 mm/.test(await page.$eval(D + ' .rc-perr', (e) => e.textContent)) && await page.$eval(D + ' .rc-ppic .rc-pd.bad', (e) => !!e), 'and the room under the nut shows red, with why');
    await typeIn('depth', '');
    await typeIn('pin_reach', 38); g = await geo();
    ok(eq(g.back.len, 38 * g.k) && eq(g.dims.reach.y1, g.back.tip) && eq(g.dims.reach.y2, g.back.nutBottom) && /38 mm/.test(g.dims.reach.label), 'Stickout 38: the pin grows; its dimension runs from the tip to the nut');
    ok(/most 40 mm/.test(await page.$eval(D + ' [data-pk=depth]', (e) => e.closest('.rc-pgroup').textContent)), 'and the sides may then be touched down to the axis (most 40 mm)');
    await typeIn('pin_reach', 25);
    await typeIn('ahead', 45); g = await geo();
    ok(eq(g.start.cx, g.sx0 - 45 * g.k) && eq(g.dims.ahead.x1, g.start.cx) && eq(g.dims.ahead.x2, g.sx0) && g.dims.ahead.tips.every((t, i) => eq(t[0], i ? g.sx0 : g.start.cx)), 'Jaw face in front by 45: the start moves back; its dimension runs from the start to the jaw face exactly');
    ok(g.lit.join() === 'ahead', 'only that dimension lights (' + g.lit.join() + ')');
    await typeIn('ahead', 30);
    await typeIn('past', 16); g = await geo();
    ok(eq(g.touch.cx, g.sx0 + (3.175 + 16) * g.k) && eq(g.dims.past.x1, g.sx0) && eq(g.dims.past.x2, g.touch.cx - 3.175 * g.k) && g.lit.join() === 'past', 'Clear of the jaw face by 16: it comes down 16 from the jaw face; that gap is dimensioned and lit');
    ok(/moves X\+ 49\.2 mm/.test(await page.$eval(D + ' .rc-pxmove', (e) => e.textContent)), 'and the X move grows with it (49.2 mm)');
    await typeIn('past', '');
    g = await geo();
    ok(eq(g.touch.tip, g.ay - 27 * g.k) && await page.$eval(D + ' [data-pk=x_height]', (e) => e.placeholder) === 'auto 27', 'Touch the jaw at, auto: 27 above the axis, so a nut 25 above the tip clears jaws that reach 50');
    await typeIn('x_height', 35); g = await geo();
    ok(eq(g.touch.tip, g.ay - 35 * g.k) && eq(g.dims.xz.y1, g.ay) && eq(g.dims.xz.y2, g.touch.tip) && g.dims.xz.tips.every((t, i) => eq(t[1], i ? g.touch.tip : g.ay)), 'Touch the jaw at 35: the tip moves; its dimension runs from the axis to the tip exactly');
    ok(g.lit.join() === 'xz', 'editing it lights only its own dimension, not the X move (' + g.lit.join() + ')');
    await typeIn('x_height', 23);
    ok(/would come down on the jaw/.test(await page.$eval(D + ' .rc-perr', (e) => e.textContent).catch(() => '')), 'touching the jaw too low for the nut to clear it: stopped, with why');
    await typeIn('x_height', '');
    await page.press(D + ' [data-pk=x_height]', 'Tab'); await page.waitForTimeout(150);
    ok(!(await page.$(D + ' .rc-perr')), 'back to the settings as they were: nothing wrong');
    await page.focus(D + ' [data-pk=depth]'); await page.waitForTimeout(150);
    ok(await page.$eval(D + ' [data-pk=depth]', (e) => e.closest('.rc-pgroup').classList.contains('rc-plit') && e.placeholder === 'auto 20'), 'the field being edited is marked too; Touch the sides is auto 20 again');
    await shot('depth');
    await page.hover(D + ' .rc-pxmove'); await page.click(D + ' .rc-phead'); await page.hover(D + ' .rc-pxmove'); await page.waitForTimeout(150);
    ok((await geo()).lit.join() === 'xmove', 'pointing at the X move note lights the way it goes');
    await shot('xmove');
    await page.hover(D + ' .rc-phead'); await page.waitForTimeout(150);
    const xm = await page.$eval(D + ' .rc-pxmove', (e) => e.textContent);
    ok(/moves X\+ 43\.2 mm from where you start/.test(xm) && /lifts to 55 mm above the axis/.test(xm) && /10 mm gap/.test(xm), 'says how far it moves in X before coming down: ' + xm);
    ok(/collet nut \(Ø35 mm × 20 mm\)/i.test(await page.$eval(D + ' .rc-pnut', (e) => e.textContent)), 'the collet nut from Rotary & spindle');
    // the jog controls: one centred stack
    const mids = await page.$$eval(D + ' .rc-pjogsteps, ' + D + ' .rc-pjogpad', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return r.left + r.width / 2; }));
    ok(mids.length === 2 && Math.abs(mids[0] - mids[1]) < 1.5, 'the jog step sits centred over the jog pad (' + mids.map((v) => v.toFixed(1)).join(', ') + ')');
    ok(await page.$eval(D + ' [data-pact=a0]', (b) => { const r = b.getBoundingClientRect(), f = document.querySelector('#rcam-root .rc-pfoot').getBoundingClientRect(); return r.bottom < f.top; }), 'Zero A is in view without scrolling');
    ok(/Touch the probe/.test(await page.$eval(D + ' .rc-pconnmsg', (e) => e.textContent)) && !(await startOn()), 'connection test on: waits for a touch');
    await H('/__test/probe', { touch: true }); await page.waitForTimeout(700);
    ok(await page.$eval(D + ' .rc-plight', (e) => e.classList.contains('on')), 'the light goes green while the probe touches');
    await shot('touching');
    await H('/__test/probe', { touch: false }); await page.waitForTimeout(700);
    ok(await startOn() && /Tested/.test(await page.$eval(D + ' .rc-pconnmsg', (e) => e.textContent)), 'tested: Start Probe wakes up');
    const steps = await page.$$eval(D + ' .rc-psteps li', (l) => l.map((e) => e.textContent));
    ok(steps.length === 7 && /20 mm below the top/.test(steps[0]) && /180/.test(steps[2]) && /Move X\+ 43\.2 mm/.test(steps[5]) && /27 mm above the axis/.test(steps[6]), 'the steps listed: ' + steps.join(' / '));

    // XYZ with the half turn
    await page.click(D + ' [data-pact=start]');
    await page.waitForSelector(D + ' [data-pact=stop]', { timeout: 5000 });
    ok(true, 'Stop shows while it runs');
    ok(await page.$eval(D + ' [data-pact=halt]', (b) => !b.disabled && getComputedStyle(b).backgroundColor === 'rgb(220, 38, 38)'), 'the red stop in the middle of the jog pad stays live while it runs');
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

    // a fluted bit: it stops to be turned by hand, with Continue
    await pick('tool', 'bit'); await pick('what', 'yz');
    await setField('bit_dia', 6.35); await setField('bit_reach', 25);
    await page.click(D + ' [data-pk=half]'); await page.waitForTimeout(150);
    await H('/__test/probe', { at: { x: -315, y: -199, z: -79.6 + 40 + 6 } });
    await page.click(D + ' [data-pact=start]');
    await page.waitForSelector(D + ' [data-pact=continue]', { timeout: 30000 });
    ok(/front and back/.test(await msg()), 'stops: turn the cutting edges front and back: ' + (await msg()).slice(0, 80));
    await shot('turn');
    await page.click(D + ' [data-pact=continue]');
    await page.waitForFunction((d) => { const m = document.querySelector(d + ' .rc-pmsg'); return m && /left and right/.test(m.textContent); }, D, { timeout: 60000, polling: 200 });
    ok(true, 'then left and right for the top');
    await page.click(D + ' [data-pact=continue]');
    await page.waitForFunction((d) => { const m = document.querySelector(d + ' .rc-pmsg'); return m && /Done|Stopped|alarm/.test(m.textContent); }, D, { timeout: 60000, polling: 300 });
    sim = await H('/__test/probe');
    ok(/^Done: Y0 and Z0 set/.test(await msg()) && near(sim.wco.y, -200.3, 0.2) && near(sim.wco.z, -79.6, 0.2), 'done with the bit: ' + (await msg()).slice(0, 60));
    await page.click(D + ' [data-pk=half]'); await pick('tool', 'pin');

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
    await page.click(D + ' [data-pact=halt]'); await page.waitForTimeout(300);
    ok((await H('/__test/log')).some((l) => /POST \/api\/probe\/stop/.test(l)), 'the stop in the jog pad sends the soft reset (as ncSender’s does)');
    await page.click(D + ' [data-pact=a0]'); await page.waitForTimeout(400);
    ok(/A is zeroed/.test(await msg()), 'Zero A zeroes A');
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    ok(!(await page.$(D)), 'Escape closes it');
    await page.evaluate(() => { document.querySelector('#rcam-root details[data-sec=zero]').open = true; });
    const zm = await page.$eval('#rcam-root [data-zero=info]', (e) => e.textContent);
    ok(/Probed the chuck/.test(zm), 'the Work zero section says it was probed');
    // portrait: one column, the picture first, nothing wider than the window
    await page.click('#rcam-root [data-act=probe-open]'); await page.waitForSelector(D + ' .rc-pcard');
    for (const [vw, vh] of [[1080, 1920], [820, 1180]]) {
      await page.setViewportSize({ width: vw, height: vh }); await page.waitForTimeout(300);
      const pr = await page.evaluate((d) => {
        const q = (s2) => document.querySelector(d + ' ' + s2).getBoundingClientRect(), card = document.querySelector(d + ' .rc-pcard'), c = card.getBoundingClientRect();
        const pic = q('[data-part=pic]'), form = q('[data-part=form]'), jog = q('[data-part=jog]'), notes = q('[data-part=derived]'), foot = q('.rc-pfoot');
        return { order: pic.top < form.top && form.top < jog.top && jog.top < notes.top, fits: card.scrollWidth <= card.clientWidth + 1 && pic.left >= c.left && pic.right <= c.right + 1 && form.right <= c.right + 1, picW: pic.width, cardW: c.width, footIn: foot.bottom <= window.innerHeight + 1 };
      }, D);
      ok(pr.order && pr.fits && pr.footIn && pr.picW > pr.cardW * 0.85, `portrait ${vw}×${vh}: the picture, then the settings, the jog controls, the notes; nothing off the side; the buttons in view ` + JSON.stringify(pr));
      await shot('portrait-' + vw);
    }
    await page.setViewportSize({ width: 1500, height: 950 }); await page.waitForTimeout(200);
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
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
