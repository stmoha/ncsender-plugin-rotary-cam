// 0.9.4 walkthrough: one Z travel message that says what it assumed, how far each tool may
// stick out and how to check it on the machine; the stickout of the tool in the spindle as a
// setting; one stickout and flute length per tool number; stock length and clamping
// distance; the colours of the setup.
// node test/e2e-v16.cjs <part> <outdir> [--dark] [--viewport WxH] [--metric] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8806));
const metric = process.argv.includes('--metric');
const U = metric ? 1 : 25.4;
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const H = (p, b) => fetch(`http://localhost:${PORT}${p}`, b !== undefined ? { method: 'POST', body: typeof b === 'string' ? b : JSON.stringify(b) } : undefined).then((r) => r.json());
  if (!metric) await H('/__test/units', 'imperial');
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
  const typeIn = async (sel, v) => { await page.fill(sel, String(v)); await page.dispatchEvent(sel, 'change'); await page.waitForTimeout(300); };
  const openSec = (sec) => page.evaluate((s) => { const d = document.querySelector('#rcam-root details[data-sec=' + s + ']'); if (d) { d.open = true; d.scrollIntoView(); } }, sec);
  const D = (mm) => (mm / U).toFixed(metric ? 2 : 4);
  const near = (a, b, e) => Math.abs(a - b) < (e || 0.01);
  const job = () => page.evaluate(() => JSON.parse(JSON.stringify(window.RotaryCam.__state.job)));
  const probs = () => page.evaluate(() => window.RotaryCam.__state.problems.slice());
  const box = () => page.$eval('#rcam-root .rc-stockbox', (b) => ({ l1: b.querySelector('.rc-sb1').textContent, l2: b.querySelector('.rc-sb2').textContent, red: b.querySelectorAll('.rc-short').length, zred: [...b.querySelectorAll('.rc-short')].some((e) => /Z allows/.test(e.textContent)) }));
  const hl = () => page.evaluate(() => window.RotaryCam.viewer.highlighted());
  const away = () => page.mouse.move(vp[0] - 30, vp[1] / 2);
  // something changed elsewhere (another computer, older settings): any edit checks again
  const nudge = async () => { await openSec('stock'); const v = await page.$eval('#rc-angle_step_deg', (e) => e.value); await typeIn('#rc-angle_step_deg', v); };
  try {
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.selectOption('#rcam-root .rc-centre', 'origin'); await page.waitForTimeout(300);
    await openSec('stock'); await page.selectOption('#rc-stock-shape', 'square'); await page.waitForTimeout(300);
    const need = await page.evaluate(() => window.RotaryCam.__state.mesh.rmax);
    await typeIn('#rc-stock-width-square', D(Math.ceil(2 * need + 4)));
    await away();

    // ---- colours: silver chuck, headstock, tailstock and spindle; dark jaws, live centre, nut
    const c = await page.evaluate(() => window.RotaryCam.viewer.colors());
    let h;
    ok(c.chuck && c.chuck === c.head && c.head === c.tail && c.tail === c.spindle, `chuck, headstock, tailstock and spindle are one silver (${c.chuck} ${c.head} ${c.tail} ${c.spindle})`);
    ok(c.nut && c.nut === c.jaw && c.jaw === c.centre && c.nut !== c.chuck, `jaws, live centre and collet nut are the darker metal (${c.jaw} ${c.centre} ${c.nut})`);
    await page.click('[data-view=whole]').catch(() => {}); await page.waitForTimeout(500);
    await shot('colours');

    // ---- the chuck end and the tailstock end fade when they hide the part
    let eo = await page.evaluate(() => window.RotaryCam.viewer.endsOpacity());
    ok(eo && eo.head > 0.99 && eo.tail > 0.99, 'from the usual view the chuck end and the tailstock end are solid ' + JSON.stringify(eo));
    await page.evaluate(() => window.RotaryCam.viewer.lookFrom([1, -0.04, 0.1], true)); await page.waitForTimeout(700);
    eo = await page.evaluate(() => window.RotaryCam.viewer.endsOpacity());
    ok(eo.tail < 0.5 && eo.head > 0.99, 'orbited round to look down the axis past the tailstock, the tailstock end goes see-through ' + JSON.stringify(eo));
    await shot('fade-tailstock');
    await page.evaluate(() => window.RotaryCam.viewer.lookFrom([-1, -0.04, 0.1], true)); await page.waitForTimeout(700);
    eo = await page.evaluate(() => window.RotaryCam.viewer.endsOpacity());
    ok(eo.head < 0.5 && eo.tail > 0.99, 'and past the headstock, the chuck end does ' + JSON.stringify(eo));
    await shot('fade-chuck');
    await page.click('[data-view=iso]'); await page.waitForTimeout(700);
    eo = await page.evaluate(() => window.RotaryCam.viewer.endsOpacity());
    ok(eo.tail > 0.99 && eo.head > 0.99, 'and solid again when it isn\u2019t in the way ' + JSON.stringify(eo));

    // ---- the live centre: a cone, then its round body back to the tailstock
    await openSec('rig');
    let fx = await page.evaluate(() => window.RotaryCam.viewer.fixtures());
    const cone = fx.find((f) => f.name === 'live centre' && f.kind === 'cone');
    ok(!fx.some((f) => f.part === 'body') && near(fx.find((f) => f.name === 'tailstock').x0, cone.x1), 'Total length empty: the cone goes straight into the tailstock, as before');
    await page.focus('#rc-rig-centre-total'); await typeIn('#rc-rig-centre-total', D(70));
    fx = await page.evaluate(() => window.RotaryCam.viewer.fixtures());
    const body = fx.find((f) => f.name === 'live centre' && f.part === 'body'), tbox = fx.find((f) => f.name === 'tailstock');
    ok(body && near(body.x0, cone.x1) && near(body.x1 - cone.x0, 70, 0.05) && near(body.r, cone.r) && near(tbox.x0, cone.x0 + 70, 0.05), `Total length 70 mm: the cone, a round body to ${(body.x1 - cone.x0).toFixed(1)} mm, then the tailstock box`);
    h = await hl();
    ok(h && h.key === 'rig.centre.total' && h.dims > 0, 'it lights up with its dimension ' + JSON.stringify(h));
    await page.click('[data-view=whole]'); await page.waitForTimeout(500);
    await shot('live-centre');
    await page.evaluate(() => document.activeElement && document.activeElement.blur());

    // ---- stock length and clamping distance
    let j = await job();
    const len0 = j.tailstock_x + j.stock.clamp;
    ok(near(j.stock.clamp, 12.7), 'clamping distance starts at 12.7 mm (0.5 in)');
    const lab = await page.$eval('#rc-tailstock_x', (e) => e.closest('.rc-row').querySelector('label').textContent);
    const shown = Number(await page.$eval('#rc-tailstock_x', (e) => e.value));
    ok(/^Stock length/.test(lab) && near(shown * U, len0, 0.02), `"${lab.replace('?', '')}" shows the whole stock: ${shown} = clamping + jaw face to the centre`);
    let b = await box();
    ok(new RegExp('long, ' + (metric ? '12\\.7 mm' : '0\\.5(00)? in') + ' in the jaws').test(b.l1), 'the header gives the stock length and how much is in the jaws: ' + b.l1);
    await page.focus('#rc-stock-clamp'); await typeIn('#rc-stock-clamp', D(25.4));
    j = await job();
    ok(near(j.stock.clamp, 25.4, 0.02) && near(j.tailstock_x + j.stock.clamp, len0, 0.02) && near(Number(await page.$eval('#rc-tailstock_x', (e) => e.value)) * U, len0, 0.03), `more in the jaws, same stock: the tailstock centre comes in to X${j.tailstock_x.toFixed(2)} mm, the length stays ${len0.toFixed(2)} mm`);
    h = await hl();
    ok(h && h.key === 'stock.clamp' && h.parts === 0 && h.onPart > 0 && h.dims > 0, 'Clamping distance lights up just the end in the jaws (not the whole stock), with a dimension ' + JSON.stringify(h));
    let span = await page.evaluate(() => window.RotaryCam.viewer.stockSpan());
    ok(near(span.x0, -25.4, 0.05) && near(span.x1, j.tailstock_x, 0.05), `the 3D stock starts ${(-span.x0).toFixed(1)} mm inside the jaws and ends at the centre (X${span.x1.toFixed(1)})`);
    await shot('clamp');
    await page.focus('#rc-tailstock_x'); await typeIn('#rc-tailstock_x', D(127));
    j = await job();
    ok(near(j.tailstock_x, 127 - 25.4, 0.03), `Stock length 127 mm with 25.4 in the jaws: the tailstock centre at X${j.tailstock_x.toFixed(2)}`);
    h = await hl();
    ok(h && h.key === 'tailstock_x' && h.dims > 0, 'Stock length lights up the whole stock ' + JSON.stringify(h));
    await shot('stock-length');
    await page.evaluate(() => document.activeElement && document.activeElement.blur());

    // ---- one tool number, one stickout and flute length
    await openSec('rough');
    await page.focus('#rc-rough-stickout'); await typeIn('#rc-rough-stickout', D(50.8));
    j = await job();
    ok(j.corners.tool_number === j.rough.tool_number && near(j.corners.stickout, 50.8, 0.03) && near(j.parting.stickout, 50.8, 0.03) && j.corners.own.stickout, `roughing's T${j.rough.tool_number} set to 50.8 mm: corners and parting (also T${j.corners.tool_number}) follow`);
    await typeIn('#rc-rough-tool_length', D(20));
    j = await job();
    ok(near(j.corners.tool_length, 20, 0.03) && near(j.parting.tool_length, 20, 0.03), 'and its flute length');
    // older settings, or another computer, with two stickouts for one tool
    await page.evaluate(() => { window.RotaryCam.__state.job.corners.stickout = 40; });
    await nudge();
    let p = await probs();
    const tn = j.rough.tool_number;
    ok(p.some((q) => new RegExp('^T' + tn + ' sticks out .* for Corners but .* for Roughing\\. One tool number is one tool').test(q)), 'two stickouts for one tool: ' + p.find((q) => /sticks out/.test(q)));
    const btns = await page.$$eval('#rcam-root .rc-sametool', (els) => els.map((e) => e.textContent));
    ok(btns.length === 2 && btns.every((x) => new RegExp('for all T' + tn + '$').test(x)), 'with a button for each: ' + btns.join(' | '));
    await shot('same-tool');
    await page.click('#rcam-root .rc-sametool:nth-of-type(2)').catch(async () => { const all = await page.$$('#rcam-root .rc-sametool'); await all[1].click(); });
    await page.waitForTimeout(400);
    j = await job(); p = await probs();
    ok(near(j.corners.stickout, 50.8, 0.03) && near(j.rough.stickout, 50.8, 0.03) && !p.some((q) => /sticks out/.test(q)), `picking ${btns[1]} sets all of T${tn} and the message goes`);
    // a library tool another operation already uses comes in as that one is set
    await openSec('index');
    await page.evaluate(() => { const c = document.querySelector('#rcam-root [data-k="index.enabled"]'); if (!c.checked) c.click(); });
    await page.waitForTimeout(300); await openSec('index');
    await page.selectOption('#rc-index-tool', '13'); await page.waitForTimeout(300);
    await typeIn('#rc-index-stickout', D(30));
    await openSec('finish'); await page.selectOption('#rc-finish-tool', '13'); await page.waitForTimeout(300);
    j = await job();
    ok(j.finish.tool_number === 3 && near(j.finish.stickout, 30, 0.03), `finishing picks T3 from the Tool Library, which Indexed already uses at 30 mm: it takes 30 mm, not the library's 22 (${j.finish.stickout.toFixed(2)})`);
    await openSec('index'); await page.evaluate(() => { const c = document.querySelector('#rcam-root [data-k="index.enabled"]'); if (c.checked) c.click(); }); await page.waitForTimeout(300);

    // ---- Z travel: one message, what it took to be in the spindle, how to check it
    await H('/__test/machine', { machine: { tool: 0, WCO: '-300.000,-200.000,-20.000', g54: '-300.000,-200.000,-20.000,0.000' } });
    await openSec('toolchange'); await page.click('#rcam-root [data-act=readmachine]'); await page.waitForTimeout(800);
    p = await probs();
    const zp = p.filter((q) => /^Z travel/.test(q));
    ok(zp.length === 1, 'one Z travel message (' + zp.length + ')');
    ok(/stick out at most/.test(zp[0]) && /\nToo long: /.test(zp[0]) && /didn.t say which tool is in/.test(zp[0]) && /jog Z all the way up/.test(zp[0]), 'it says how far tools may stick out, which are too long, what it took to be in the spindle and how to check:\n    ' + (zp[0] || '').split('\n').join('\n    '));
    const zmsg = await page.$$eval('#rcam-root .rc-msg.rc-err', (els) => { const m = els.find((e) => /Z travel/.test(e.textContent)); return m ? { br: m.querySelectorAll('br').length, fit: !!m.querySelector('.rc-fitstock'), btn: !!m.querySelector('.rc-zspindle') } : null; });
    ok(zmsg && zmsg.br >= 4 && !zmsg.fit && zmsg.btn, 'shown a line at a time, without the stock-fitting buttons, with "Set the tool in the spindle" ' + JSON.stringify(zmsg));
    b = await box();
    ok(/Z allows .* stickout/.test(b.l2) && b.zred, 'the header, in red: ' + b.l2.split(' · ').pop());
    await shot('z-message');
    // shortening the tools as it asks doesn't move the limit (it used to follow them down)
    const lim = (txt) => (txt.match(/Z allows ([\d.]+)/) || [])[1];
    const before = lim(b.l2);
    await openSec('rough'); await page.focus('#rc-rough-stickout'); await typeIn('#rc-rough-stickout', D(25));
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await away();
    let b2 = await box();
    await openSec('toolchange'); await page.click('#rcam-root [data-act=readmachine]'); await page.waitForTimeout(800);      // the machine hasn't changed
    let b3 = await box();
    ok(before && lim(b2.l2) === before && lim(b3.l2) === before, `roughing's T${tn} shortened to 25 mm: the limit stays ${before} (${lim(b2.l2)}, and ${lim(b3.l2)} after reading the machine again)`);
    p = await probs();
    ok(/Changing stickouts here doesn.t move that/.test(p.find((q) => /^Z travel/.test(q)) || ''), 'and the message says so');
    await openSec('rough'); await typeIn('#rc-rough-stickout', D(50.8));
    await page.click('#rcam-root .rc-zspindle'); await page.waitForTimeout(500);
    const foc = await page.evaluate(() => ({ id: document.activeElement && document.activeElement.id, ph: document.activeElement && document.activeElement.placeholder, open: document.querySelector('#rcam-root details[data-sec=toolchange]').open }));
    ok(foc.id === 'rc-rig-tc-zso' && foc.open && /^auto [\d.]+$/.test(foc.ph), 'it opens Tool changes at "Stickout of the tool in the spindle": ' + JSON.stringify(foc));
    await shot('zso-field');
    await typeIn('#rc-rig-tc-zso', D(12));
    j = await job(); p = await probs();
    const typedMsg = p.find((q) => /^Z travel/.test(q)) || '';
    ok(near(j.rig.tc.zso, 12, 0.03) && j.rig.tc.typed.zso && /as typed under Tool changes/.test(typedMsg) && /even the spindle nose is only [\d.]+ (in|mm) above/.test(typedMsg) && !/Too long/.test(typedMsg), 'a 12 mm tool typed in: then even the spindle nose can\u2019t clear the stock: ' + typedMsg.split('\n')[0]);
    await typeIn('#rc-rig-tc-zso', D(70));
    p = await probs();
    const z70 = p.find((q) => /^Z travel/.test(q)) || '';
    ok(/at most/.test(z70) && !/Too long/.test(z70) && /What.s left is the tool in the spindle/.test(z70), 'a 70 mm tool typed in: every operation\u2019s tool fits, but not the one in the spindle: ' + z70.split('\n').slice(0, 2).join(' / '));
    const info = await page.$eval('#rcam-root details[data-sec=toolchange]', (d) => d.textContent);
    ok(/Typed in: .*stickout of the tool in the spindle/.test(info) && /tools can stick out up to/.test(info), 'Tool changes says it’s typed in, and how far tools may stick out');
    await page.fill('#rc-rig-tc-zso', ''); await page.dispatchEvent('#rc-rig-tc-zso', 'change'); await page.waitForTimeout(300);
    j = await job(); p = await probs();
    ok(!(j.rig.tc.typed || {}).zso && /didn.t say which tool is in/.test(p.find((q) => /^Z travel/.test(q)) || ''), 'cleared: back to working it out');
    // ncSender says which tool: that one
    await H('/__test/machine', { machine: { tool: 3 } });
    await page.click('#rcam-root [data-act=readmachine]'); await page.waitForTimeout(800);
    p = await probs();
    ok(/T3 in the spindle \(ncSender says so\) with/.test(p.find((q) => /^Z travel/.test(q)) || ''), 'ncSender says T3 is in: worked out from T3 at its stickout here');
    // room enough
    await H('/__test/machine', { machine: { tool: 1, WCO: '-300.000,-200.000,-80.000', g54: '-300.000,-200.000,-80.000,0.000' } });
    await page.click('#rcam-root [data-act=readmachine]'); await page.waitForTimeout(800);
    p = await probs(); b = await box();
    ok(!p.some((q) => /^Z travel/.test(q)) && /Z allows/.test(b.l2) && !b.zred, 'with the top of Z 80 mm up there’s room: ' + b.l2.split(' · ').pop());
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
