// 0.7.1 walkthrough: the setting being edited (or hovered) lights up its part of the 3D
// setup with a dimension line; the headstock and tailstock reach the front and back of the
// axis separately; settings from 0.7.0 (one width) carry over.
// node test/e2e-v10.cjs <part> <outdir> [--dark] [--viewport WxH] [--metric] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const core = require('../lib/cam-core.js');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8796));
const metric = process.argv.includes('--metric');
const U = metric ? 1 : 25.4;
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  if (!metric) await fetch(`http://localhost:${PORT}/__test/units`, { method: 'POST', body: 'imperial' });
  // settings saved by 0.7.0: one width for the headstock and tailstock
  await fetch(`http://localhost:${PORT}/api/plugins/com.cncdocs.rotary-cam/settings`, { method: 'PUT', body: JSON.stringify({ job: { rig: { head: { len: 120, width: 130, top: 70 }, tail: { len: 80, width: 64, top: 40 } } } }) });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const vp = arg('--viewport', '1500x950').split('x').map(Number);
  const page = await (await browser.newContext({ viewport: { width: vp[0], height: vp[1] } })).newPage();
  const errors = [];
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
  const t = Date.now(), ms = () => ((Date.now() - t) / 1000).toFixed(1) + 's';
  let fails = 0;
  const ok = (cond, what) => { if (!cond) fails++; console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what); };
  const openSec = (sec) => page.evaluate((s) => { const d = document.querySelector('#rcam-root details[data-sec=' + s + ']'); if (d) { d.open = true; d.scrollIntoView(); } }, sec);
  const typeIn = async (sel, v) => { await page.fill(sel, String(v)); await page.dispatchEvent(sel, 'change'); await page.waitForTimeout(300); };
  const D = (mm) => (mm / U).toFixed(metric ? 2 : 4);
  const hl = () => page.evaluate(() => window.RotaryCam.viewer.highlighted());
  const rowLit = (id) => page.$eval('#' + id, (el) => el.closest('.rc-row').classList.contains('rc-hl'));
  try {
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.selectOption('#rcam-root .rc-centre', 'origin');
    await page.waitForTimeout(300);
    await typeIn('#rc-stock-dia-round', D(44));

    // ---- 0.7.0's single widths become front and back
    let j = await page.evaluate(() => window.RotaryCam.__state.job.rig);
    ok(j.head.front === 65 && j.head.back === 65 && j.tail.front === 32 && j.tail.back === 32 && j.head.width === undefined, `0.7.0 widths carry over: headstock 130 -> ${j.head.front} front / ${j.head.back} back, tailstock 64 -> ${j.tail.front} / ${j.tail.back}`);
    await openSec('rig');
    const subs = await page.$$eval('#rcam-root details[data-sec=rig] .rc-sub', (els) => els.map((e) => e.textContent));
    ok(subs.length === 5 && /Headstock/.test(subs[1]) && /Tailstock/.test(subs[3]), 'Rotary & spindle is grouped: ' + subs.map((x) => x.split(':')[0]).join(', '));

    // ---- every setting there lights up its part, with a dimension
    const keys = ['rig.chuck.dia', 'rig.chuck.len', 'rig.head.len', 'rig.head.front', 'rig.head.back', 'rig.head.top', 'rig.centre.dia', 'rig.centre.len', 'rig.tail.len', 'rig.tail.front', 'rig.tail.back', 'rig.tail.top', 'rig.nut.dia', 'rig.nut.len', 'rig.spindle.dia', 'rig.clear'];
    const bad = [];
    for (const k of keys) {
      const id = 'rc-' + k.replace(/\./g, '-');
      await page.focus('#' + id); await page.waitForTimeout(250);
      const h = await hl();
      if (!h || h.key !== k || !(h.parts > 0) || !(h.dims > 0) || !(await rowLit(id))) bad.push(k + ' ' + JSON.stringify(h));
      if (['rig.chuck.dia', 'rig.head.back', 'rig.tail.top', 'rig.nut.len'].includes(k)) await shot('hl-' + k.replace(/^rig\./, '').replace('.', '-'));
    }
    ok(!bad.length, `focusing each of the ${keys.length} Rotary & spindle settings lights its part with a dimension, and its row` + (bad.length ? ': ' + bad.join('; ') : ''));
    // the value on the dimension follows the field
    await page.focus('#rc-rig-head-back');
    await typeIn('#rc-rig-head-back', D(110));
    await page.focus('#rc-rig-head-front');
    await typeIn('#rc-rig-head-front', D(40));
    await typeIn('#rc-rig-head-top', D(95));
    const fx = await page.evaluate(() => window.RotaryCam.viewer.fixtures());
    const hd = fx.find((f) => f.name === 'headstock');
    ok(Math.abs(hd.y0 + 40) < 0.01 && Math.abs(hd.y1 - 110) < 0.01 && Math.abs(hd.top - 95) < 0.01, `headstock 40 mm to the front, 110 mm to the back, 95 mm up: the 3D box reaches Y${hd.y0.toFixed(1)} to Y${hd.y1.toFixed(1)}`);
    await page.focus('#rc-rig-head-back'); await page.waitForTimeout(300);
    await shot('asym-headstock-back');
    // hovering: lights up too, and goes back to the field being edited when the pointer leaves
    const row = await page.$('#rc-rig-tail-top');
    await (await row.evaluateHandle((el) => el.closest('.rc-row'))).hover(); await page.waitForTimeout(300);
    let h = await hl();
    ok(h && h.key === 'rig.tail.top', 'hovering a setting lights it up');
    await page.mouse.move(vp[0] - 40, vp[1] / 2); await page.waitForTimeout(300);
    h = await hl();
    ok(h && h.key === 'rig.head.back', 'moving off goes back to the one being edited');
    // other settings with a part to show
    await openSec('stock');
    const more = [['rc-tailstock_x', 'tailstock_x'], ['rc-chuck_clearance', 'chuck_clearance'], ['rc-tailstock_clearance', 'tailstock_clearance'], ['rc-safe_clearance', 'safe_clearance'], ['rc-stock-dia-round', 'stock.dia']];
    await openSec('finish'); more.push(['rc-finish-stickout', 'finish.stickout']);
    await openSec('toolchange'); more.push(['rc-rig-tc-change-x', 'rig.tc.change.x'], ['rc-rig-tc-setter-y', 'rig.tc.setter.y'], ['rc-rig-tc-zero-x', 'rig.tc.zero.x']);
    await openSec('part'); more.push(['rc-model-part_start_x', 'model.part_start_x']);
    const bad2 = [];
    for (const [id, k] of more) {
      await page.focus('#' + id); await page.waitForTimeout(250);
      const h2 = await hl();
      if (!h2 || h2.key !== k || !(h2.parts > 0 || h2.dims > 0)) bad2.push(k + ' ' + JSON.stringify(h2));
      if (['finish.stickout', 'rig.tc.change.x', 'tailstock_x'].includes(k)) await shot('hl-' + k.replace(/\./g, '-'));
    }
    ok(!bad2.length, 'stock, keep-aways, retract, stickout, tool change, tool setter, rotary zero and part start light up too' + (bad2.length ? ': ' + bad2.join('; ') : ''));
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(300);
    ok(!(await hl()), 'leaving the settings clears it');

    // ---- the way round to the tool change goes round the bigger back of the headstock
    for (const [s, id] of [['rough', '11'], ['finish', '13']]) { await openSec(s); await page.selectOption(`#rc-${s}-tool`, id); }
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 900000, polling: 500 });
    const res = await page.evaluate(() => { const S = window.RotaryCam.__state; return { tc: S.program && S.program.toolChanges, job: S.job }; });
    const rects = core.tcObstacles(res.job), hdR = rects.find((r) => r.name === 'headstock');
    const crosses = res.tc.paths.some((p) => p.some((q, i) => i && rects.some((r) => core.segHitsRect(p[i - 1][0], p[i - 1][1], q[0], q[1], r))));
    ok(res.tc && res.tc.count === 2 && !crosses && hdR.y1 > 150 && hdR.y0 > -100, `tool changes go round the headstock as it now is (its footprint Y${hdR.y0.toFixed(0)} to Y${hdR.y1.toFixed(0)} with the spindle's room)`);
    await page.click('[data-view=whole]'); await page.waitForTimeout(500);
    await shot('routes-asym');
  } catch (e) {
    fails++;
    console.log('FAILED:', e.message);
    await shot('failure').catch(() => {});
  } finally {
    console.log('console errors/warnings:', errors.length ? errors : 'none');
    console.log(fails ? `${fails} FAILED` : 'ALL PASS');
    process.exitCode = fails || errors.length ? 1 : 0;
    await browser.close();
    srv.kill();
  }
})();
