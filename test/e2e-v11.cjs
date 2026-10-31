// 0.8.0 walkthrough: work zero from a corner of the rotary (offsets, the 3D corner and its
// dimensions, Move zero to the rotary axis through ncSender, Remember axis / corner); the
// G-code zero marker; a 4-jaw chuck on square stock that turns with A; the silver headstock;
// the spindle going see-through from the top; tenon length and scale to fit.
// node test/e2e-v11.cjs <part> <outdir> [--dark] [--viewport WxH] [--metric] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8798));
const metric = process.argv.includes('--metric');
const U = metric ? 1 : 25.4, IN = 25.4;
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const H = (p, b) => fetch(`http://localhost:${PORT}${p}`, b ? { method: 'POST', body: typeof b === 'string' ? b : JSON.stringify(b) } : undefined).then((r) => r.json());
  if (!metric) await H('/__test/units', 'imperial');
  // the controller is in inches (G20), the way Stefan runs it
  await H('/__test/machine', { ctrl: { metric: false } });
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
  const D = (mm) => (mm / U).toFixed(metric ? 3 : 4);
  const V = () => page.evaluate(() => window.RotaryCam.viewer);
  const st = (f) => page.evaluate(f);
  const hl = () => st(() => window.RotaryCam.viewer.highlighted());
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const g54 = async () => (await H('/__test/commands')).machine.g54.split(',').map(Number);
  const setG54 = (q) => H('/__test/machine', { machine: { g54: [q.x, q.y, q.z, 0].map((v) => v.toFixed(3)).join(',') } });
  const act = async (a) => { await page.click(`#rcam-root [data-act=${a}]`); };
  const zeroMsg = () => st(() => window.RotaryCam.__state.zeroMsg || '');
  try {
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.selectOption('#rcam-root .rc-centre', 'origin');
    await page.waitForTimeout(300);
    await openSec('stock');
    await page.selectOption('#rc-stock-shape', 'square'); await page.waitForTimeout(300);
    await typeIn('#rc-stock-width-square', D(44));

    // ---- the G-code zero, the 4-jaw chuck, the silver headstock
    const o = await st(() => window.RotaryCam.viewer.origin());
    ok(o && near(o.x, 0, 1e-6) && near(o.y, 0, 1e-6) && near(o.z, 0, 1e-6) && o.onTop && o.label, `the G-code zero is marked at the jaw face on the axis (X${o && o.x} Y${o && o.y} Z${o && o.z}), drawn through the stock, labelled`);
    let jaws = await st(() => window.RotaryCam.viewer.jaws());
    const onFlats = jaws.length === 4 && jaws.every((p) => near(Math.min(Math.abs(p.y), Math.abs(p.z)), 0, 1e-6));
    ok(onFlats, `the chuck has 4 jaws, square to the stock's flats at A0 (${jaws.map((p) => 'Y' + p.y.toFixed(0) + ' Z' + p.z.toFixed(0)).join(', ')})`);
    await page.$eval('#rcam-root .rc-a', (el) => { el.value = 45; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForTimeout(300);
    jaws = await st(() => window.RotaryCam.viewer.jaws());
    ok(jaws.every((p) => near(Math.abs(p.y), Math.abs(p.z), 0.01)), 'turning A to 45° turns the jaws with the stock');
    await shot('jaws-a45');
    await page.$eval('#rcam-root .rc-a', (el) => { el.value = 0; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await openSec('rig');
    await page.selectOption('#rc-rig-chuck-jaws', '3'); await page.waitForTimeout(300);
    ok((await st(() => window.RotaryCam.viewer.jaws())).length === 3, 'Jaws: 3 draws a 3-jaw chuck');
    await page.selectOption('#rc-rig-chuck-jaws', '4'); await page.waitForTimeout(300);
    await page.click('[data-view=whole]'); await page.waitForTimeout(500);
    const shade = await st(() => window.RotaryCam.viewer.headShade());
    ok(shade > 0.55, `the headstock comes out silver, not dark (lightness ${shade && shade.toFixed(2)})`);
    await shot('silver-headstock');
    await page.click('[data-view=iso]'); await page.waitForTimeout(300);

    // ---- the collet nut and spindle go see-through when they hide the part
    await page.click('[data-view=top]'); await page.waitForTimeout(600);
    const topOp = (await st(() => window.RotaryCam.viewer.holderOpacity())).tool;
    await shot('top-view-spindle');
    await page.click('[data-view=front]'); await page.waitForTimeout(600);
    const frontOp = (await st(() => window.RotaryCam.viewer.holderOpacity())).tool;
    ok(topOp < 0.4 && frontOp > 0.95, `the spindle is see-through from the top (opacity ${topOp.toFixed(2)}), solid from the front (${frontOp.toFixed(2)})`);
    await page.click('[data-view=iso]'); await page.waitForTimeout(400);

    // ---- generate, so we can see the corner offsets don't touch the toolpaths
    for (const [s, id] of [['rough', '11'], ['finish', '13']]) { await openSec(s); await page.selectOption(`#rc-${s}-tool`, id); }
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 900000, polling: 500 });
    ok(await st(() => !!window.RotaryCam.__state.program), 'toolpaths generated');

    // ---- work zero from a corner: Stefan's offsets, in inches
    await openSec('zero');
    const sec = await page.$eval('#rcam-root details[data-sec=zero] summary', (e) => e.textContent);
    ok(/Work zero/.test(sec), 'there is a Work zero section: ' + sec.replace('▶', '').trim());
    ok(await page.$eval('#rcam-root [data-act=zero-move]', (b) => b.disabled), 'Move zero is off until the offsets are set');
    const off = { x: 4.6023 * IN, y: 1.4142 * IN, z: -1.3826 * IN };
    await typeIn('#rc-rig-corner-dx', D(off.x));
    await typeIn('#rc-rig-corner-dy', D(off.y));
    await typeIn('#rc-rig-corner-dz', D(off.z));
    const c = await st(() => window.RotaryCam.__state.job.rig.corner);
    ok(near(c.dx, off.x, 0.003) && near(c.dy, off.y, 0.003) && near(c.dz, off.z, 0.003), `offsets stored (mm): X${c.dx.toFixed(3)} Y${c.dy.toFixed(3)} Z${c.dz.toFixed(3)}`);
    ok(await st(() => !!window.RotaryCam.__state.program), 'setting the corner offsets keeps the toolpaths');
    const fxBefore = JSON.stringify(await st(() => window.RotaryCam.viewer.fixtures()));
    for (const k of ['dx', 'dy', 'dz']) {
      await page.focus('#rc-rig-corner-' + k); await page.waitForTimeout(300);
      const h = await hl();
      ok(h && h.key === 'rig.corner.' + k && h.dims >= 8, `editing ${k}: the corner, its legs to the zero and their sizes show in 3D (${h && h.dims} pieces)`);
      if (k === 'dx') await shot('corner-dx');
    }
    ok(JSON.stringify(await st(() => window.RotaryCam.viewer.fixtures())) === fxBefore, 'the keep-out boxes don’t change with the corner offsets');

    // zeroed on the corner (his sheet's machine coordinates); Move zero to the rotary axis
    const corner = { x: -43.0984 * IN, y: -43.7339 * IN, z: -0.9649 * IN }, axis = { x: -38.4961 * IN, y: -42.3197 * IN, z: -2.3475 * IN };
    await setG54(corner);
    const n0 = (await H('/__test/commands')).commands.length;
    await act('zero-move'); await page.waitForTimeout(500);
    const ask = await page.$eval('#rcam-root [data-zero=info]', (e) => e.textContent);
    ok(/Move G54 from/.test(ask) && (await page.$('#rcam-root [data-act=zero-go]')) && (await H('/__test/commands')).commands.length === n0, 'it asks first, with the numbers, and sends nothing yet');
    await shot('zero-confirm');
    await act('zero-go');
    await page.waitForFunction(() => !window.RotaryCam.__state.zeroBusy && /Moved|Didn/.test(window.RotaryCam.__state.zeroMsg || ''), null, { timeout: 15000 });
    let cm = await H('/__test/commands'), sent = cm.commands.slice(n0), g = await g54();
    ok(sent.length === 3 && /^#<_rcam_units> = \[20 \+ #<_metric>\]$/.test(sent[0]) && /^G21 G10 L2 P1 X-?[\d.]+ Y-?[\d.]+ Z-?[\d.]+$/.test(sent[1]) && sent[2] === 'G[#<_rcam_units>]', 'sent like ncSender’s probe routines: ' + sent.join(' | '));
    ok(near(g[0], axis.x, 0.002) && near(g[1], axis.y, 0.002) && near(g[2], axis.z, 0.002), `G54 is now on his axis point: X${(g[0] / IN).toFixed(4)} Y${(g[1] / IN).toFixed(4)} Z${(g[2] / IN).toFixed(4)} in`);
    ok(cm.metric === false, 'the controller is back in inches (G20) afterwards');
    const tz = await st(() => window.RotaryCam.__state.job.rig.tc.zero);
    ok(near(tz.x, axis.x, 0.002) && near(tz.y, axis.y, 0.002), 'the rotary zero for tool changes follows');
    ok(/Moved G54 to the rotary axis/.test(await zeroMsg()), 'it says so: ' + (await zeroMsg()));
    await shot('zero-moved');
    // pressing it again would add the offsets twice
    await act('zero-move'); await page.waitForTimeout(600);
    ok(/already on the axis/.test(await zeroMsg()) && (await H('/__test/commands')).commands.length === n0 + 3 && !(await page.$('#rcam-root [data-act=zero-go]')), 'pressing it again is refused: ' + (await zeroMsg()));
    // not while the machine is running
    await setG54(corner); await H('/__test/machine', { machine: { status: 'Run' } });
    await act('zero-move'); await page.waitForTimeout(600);
    ok(/machine is Run/.test(await zeroMsg()) && !(await page.$('#rcam-root [data-act=zero-go]')), 'not while the machine is running: ' + (await zeroMsg()));
    await H('/__test/machine', { machine: { status: 'Idle' } });

    // a controller without expressions: set in mm, then back to the units ncSender shows
    await H('/__test/machine', { ctrl: { noExpr: true, metric: !metric ? false : true } });
    const n1 = (await H('/__test/commands')).commands.length;
    await act('zero-move'); await page.waitForTimeout(500); await act('zero-go');
    await page.waitForFunction(() => !window.RotaryCam.__state.zeroBusy && /Moved|Didn/.test(window.RotaryCam.__state.zeroMsg || ''), null, { timeout: 15000 });
    cm = await H('/__test/commands'); sent = cm.commands.slice(n1); g = await g54();
    ok(near(g[0], axis.x, 0.002) && near(g[2], axis.z, 0.002) && /^G21 G10 L2/.test(sent[1]) && sent[2] === (metric ? undefined : 'G20') && cm.metric === metric, 'no expressions on the controller: still lands, units put back (' + sent.join(' | ') + ')');
    await H('/__test/machine', { ctrl: { noExpr: false } });

    // working the offsets out: Remember axis, then Remember corner
    await setG54(axis);
    await act('zero-axis'); await page.waitForTimeout(500);
    const other = { x: corner.x - 10, y: corner.y + 3, z: corner.z + 7 };
    await setG54(other);
    await act('zero-corner'); await page.waitForTimeout(500);
    const c2 = await st(() => window.RotaryCam.__state.job.rig.corner);
    ok(near(c2.dx, axis.x - other.x, 0.002) && near(c2.dy, axis.y - other.y, 0.002) && near(c2.dz, axis.z - other.z, 0.002), `Remember axis then Remember corner fills the offsets: X${c2.dx.toFixed(3)} Y${c2.dy.toFixed(3)} Z${c2.dz.toFixed(3)} mm`);
    await page.focus('#rc-rig-corner-dy'); await page.waitForTimeout(300);
    await shot('corner-measured');

    // ---- tenon length, and scale to fit leaving it
    await openSec('tenons');
    await page.mouse.move(vp[0] - 40, vp[1] / 2);
    await page.focus('#rc-tenons-chuck-len'); await page.waitForTimeout(300);
    let h = await hl();
    ok(h && h.key === 'tenons.chuck.len' && h.parts > 0 && h.dims > 0, 'Length out of the part shows the tenon and its length ' + JSON.stringify(h));
    ok(await page.$eval('#rc-tenons-chuck-len', (e) => e.placeholder === 'auto' && e.value === ''), 'empty means auto');
    await typeIn('#rc-tenons-chuck-len', D(20));
    const tl = await st(() => window.RotaryCam.__state.job.tenons);
    ok(near(tl.chuck.len, 20, 0.003) && near(tl.tailstock.len, 20, 0.003), 'with Same at both ends it sets both: ' + tl.chuck.len.toFixed(3) + ' mm');
    await shot('tenon-len');
    // a short setup, so the length (not the stock) sets the size
    await openSec('stock'); await typeIn('#rc-tailstock_x', D(120));
    await openSec('part');
    await page.click('#rcam-root .rc-act[data-act=fitscale]'); await page.waitForTimeout(800);
    const toast = await page.$$eval('#rcam-root .rc-msg.rc-ok', (els) => els.map((e) => e.textContent).join(' '));
    const mesh = await st(() => { const m = window.RotaryCam.__state.mesh, j = window.RotaryCam.__state.job; return { lo: m.min[0], hi: m.max[0], tail: j.tailstock_x, tc: j.tailstock_clearance }; });
    ok(/tenon/.test(toast) && mesh.hi <= mesh.tail - mesh.tc - 20 + 0.05, `scale to fit leaves the tenon: part ends at X${mesh.hi.toFixed(1)}, tailstock ${mesh.tail} - keep-away ${mesh.tc} - tenon 20. "${toast}"`);
    await openSec('tenons');
    await page.fill('#rc-tenons-chuck-len', ''); await page.dispatchEvent('#rc-tenons-chuck-len', 'change'); await page.waitForTimeout(300);
    ok(await st(() => window.RotaryCam.__state.job.tenons.chuck.len === null), 'clearing it goes back to auto');
    await page.focus('#rc-tenons-chuck-len'); await page.waitForTimeout(300);
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
