// 0.7.0 walkthrough: the rotary, spindle and holder; tool changes round the rotary.
// Reads where the rotary zero, tool change and tool setter are from ncSender (the
// harness plays the controller and the Manual Tool Changer), sizes the rotary, picks a
// tool whose stickout is in the library, puts the part close to the chuck so the collet
// nut would hit it, generates (warnings with the stickout that fixes it, routed tool
// changes), simulates (holder clear), fixes it, then the tool changer missing / typed in,
// and routing off. Dumps the program for the verifier.
// node test/e2e-v9.cjs <part> <outdir> [--dark] [--viewport WxH] [--metric] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8788));
const metric = process.argv.includes('--metric');
const U = metric ? 1 : 25.4;
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const H = (p, b) => fetch(`http://localhost:${PORT}${p}`, { method: 'POST', body: typeof b === 'string' ? b : JSON.stringify(b) });
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
  const openSec = (sec) => page.evaluate((s) => { const d = document.querySelector('#rcam-root details[data-sec=' + s + ']'); if (d) { d.open = true; d.scrollIntoView(); } }, sec);
  const typeIn = async (sel, v) => { await page.fill(sel, String(v)); await page.dispatchEvent(sel, 'change'); await page.waitForTimeout(300); };
  const D = (mm) => (mm / U).toFixed(metric ? 2 : 4);
  const msgs = () => page.evaluate(() => ['.rc-toasts', '.rc-msgs'].map((s) => document.querySelector('#rcam-root ' + s).innerText).join(' ').replace(/\n/g, ' '));
  const job = () => page.evaluate(() => window.RotaryCam.__state.job);
  const generate = async () => {
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 1500000, polling: 500 });
    await page.waitForTimeout(400);
    return page.evaluate(() => { const S = window.RotaryCam.__state; return { gcode: S.program && S.program.gcode, warnings: S.warnings, problems: S.problems, tc: S.program && S.program.toolChanges }; });
  };
  try {
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.waitForFunction(() => window.RotaryCam.__state.job.rig.tc.zero, null, { timeout: 10000 });
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.selectOption('#rcam-root .rc-centre', 'origin');
    await page.waitForTimeout(300);
    await typeIn('#rc-stock-dia-round', D(44));

    // ---- read from ncSender
    let j = await job();
    ok(j.rig.tc.zero.x === -300 && j.rig.tc.zero.y === -200 && j.rig.tc.change.x === -560 && j.rig.tc.change.y === -380 && j.rig.tc.setter.x === -400 && j.rig.tc.zsafe === -5,
      'on opening it read the rotary zero (G54 X-300 Y-200), the tool change (X-560 Y-380) and tool setter (Manual Tool Changer) and Safe Z -5');
    await openSec('toolchange');
    const st0 = await page.$eval('#rcam-root details[data-sec=toolchange]', (el) => el.innerText.replace(/\n/g, ' '));
    ok(/Read .*rotary zero from the controller.s G54.*Manual Tool Changer.*Safe Z from Settings/.test(st0) && /On: round the rotary/.test(st0), 'Tool changes says where each came from');
    ok(Math.abs(Number(await page.$eval('#rc-rig-tc-change-x', (el) => el.value)) * U - -560) < 0.01, 'and shows them in the fields (machine coordinates)');
    await page.click('[data-view=whole]'); await page.waitForTimeout(500);
    ok(await page.evaluate(() => window.RotaryCam.viewer.toolChangeShown()), '3D shows the tool change and tool setter');
    await shot('1-setup-and-toolchange');

    // ---- the rotary's sizes drive the 3D view
    await openSec('rig');
    await typeIn('#rc-rig-chuck-dia', D(80));
    let fx = await page.evaluate(() => window.RotaryCam.viewer.fixtures());
    ok(Math.abs(fx.find((f) => f.name === 'chuck').r - 40) < 0.01, 'Chuck diameter 80 mm: the 3D chuck is 80 mm');
    await typeIn('#rc-rig-chuck-dia', D(100));
    await typeIn('#rc-rig-tail-top', D(50));
    fx = await page.evaluate(() => window.RotaryCam.viewer.fixtures());
    ok(Math.abs(fx.find((f) => f.name === 'chuck').r - 50) < 0.01 && Math.abs(fx.find((f) => f.name === 'tailstock').top - 50) < 0.01, 'back to 100 mm; tailstock top 50 mm above the axis');

    // ---- a library tool with its stickout
    for (const s of ['rough', 'finish']) await openSec(s);
    await page.selectOption('#rc-rough-tool', '11'); await page.waitForTimeout(200);
    await page.selectOption('#rc-finish-tool', '13'); await page.waitForTimeout(300);
    j = await job();
    ok(j.finish.stickout === 22 && Math.abs(Number(await page.$eval('#rc-finish-stickout', (el) => el.value)) * U - 22) < 0.01, 'T3 from the library brings its stickout (22 mm) into Finishing');
    ok(j.rough.stickout >= j.rough.tool_length + 2, `T1 has no stickout in the library: at least its flutes plus a little (${j.rough.stickout} mm)`);
    const holder = await page.evaluate(() => window.RotaryCam.viewer.toolHolder());
    ok(holder && holder.stickout === 22 && holder.parts >= 4, 'the 3D tool has its collet nut and spindle, 22 mm up');

    // ---- the part close to the chuck: the nut would hit it
    await openSec('part');
    // the part itself at X15: Part starts at X is where the chuck end tenon starts (0.11.5)
    const lead = await page.evaluate(() => window.RotaryCam.__state.lead || 0);
    await typeIn('#rc-model-part_start_x', D(15 - lead));
    await openSec('finish'); await typeIn('#rc-finish-pitch', D(0.5));
    let g = await generate();
    console.log(ms(), '   warnings:', JSON.stringify(g.warnings).slice(0, 600));
    const fw = g.warnings.find((w) => /^Finishing stays up to .* collet nut( or spindle)? would hit the chuck/.test(w));
    ok(!!fw && g.warnings.some((w) => /^Roughing stays up to .* collet nut( or spindle)? would hit the chuck/.test(w)), 'roughing and finishing stay up off the part near the chuck, and say the collet nut would hit it');
    const need = Number((fw || '').match(/at least ([\d.]+) (mm|in) stickout/)[1]);
    ok(need > 22 / U, `and how much stickout fixes it (${need} ${metric ? 'mm' : 'in'})`);
    const L = g.gcode.split('\n'), m6 = L.findIndex((l) => /^M6 T3/.test(l));
    ok(/^G53 G0 Z-?\d/.test(L.slice(0, m6).reverse().find((l) => /^G53|^G0 .*Z/.test(l))) && /X-260\.000 Y-180\.000|X-10\.2362 Y-7\.0866/.test(L.slice(0, m6).reverse().find((l) => /^G0 X|^G0 Y/.test(l))), 'before M6 T3: up with G53 to safe Z, round the rotary to the change position');
    ok(g.tc && g.tc.count === 2 && await page.evaluate(() => window.RotaryCam.viewer.toolChangeRoutes()) === 2, 'both tool changes routed, and the route shows in 3D');
    ok(g.warnings.some((w) => /tool setter passes over the headstock/.test(w)), 'ncSender’s own change -> setter move over the headstock is flagged');
    await page.click('[data-view=whole]'); await page.waitForTimeout(500);
    await shot('2-generated-routes');
    // simulate: the holder stays clear (the operations stayed up where it had to)
    await page.click('[data-tab=sim]');
    await page.waitForFunction(() => window.RotaryCam.sim && window.RotaryCam.sim.checked, null, { timeout: 900000, polling: 500 });
    let rep = await page.evaluate(() => window.RotaryCam.__state.simReport);
    console.log(ms(), '   simulation:', JSON.stringify(rep.holder), 'rapids', rep.rapids, 'gouges', rep.gouges);
    ok(rep.holder && rep.holder.count === 0 && rep.rapids === 0 && rep.gouges === 0 && /collet nut and spindle clear/.test(await msgs()), 'simulation: the collet nut and spindle stay clear of the stock and the rotary');
    await page.$eval('#rcam-root .rc-simpos', (el) => { el.value = 30; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForTimeout(700);
    await page.click('[data-view=front]'); await page.waitForTimeout(500);
    await shot('3-sim-holder');
    await page.click('[data-tab="3d"]'); await page.waitForTimeout(300);

    // ---- fix it the way the warning says
    await openSec('finish');
    await typeIn('#rc-finish-stickout', (need + 0.01).toFixed(metric ? 2 : 4));
    await openSec('rough');
    const rw = g.warnings.find((w) => /^Roughing stays up/.test(w)), rneed = Number(rw.match(/at least ([\d.]+) (mm|in) stickout/)[1]);
    await typeIn('#rc-rough-stickout', (rneed + 0.01).toFixed(metric ? 2 : 4));
    g = await generate();
    ok(!g.warnings.some((w) => /stays up/.test(w)), 'with the stickouts the warnings asked for, nothing stays up');

    // ---- no Manual Tool Changer: type the change position in
    await H('/__test/machine', { mtc: { installed: false } });
    await openSec('toolchange');
    await page.click('#rcam-root .rc-act[data-act=readmachine]'); await page.waitForTimeout(800);
    const st1 = await page.$eval('#rcam-root details[data-sec=toolchange]', (el) => el.innerText.replace(/\n/g, ' '));
    ok(/Manual Tool Changer isn.t installed: type the tool change position in/.test(st1), 'without the Manual Tool Changer it asks for the tool change position');
    await typeIn('#rc-rig-tc-change-x', D(-100));
    await typeIn('#rc-rig-tc-change-y', D(-450));
    j = await job();
    ok(Math.abs(j.rig.tc.change.x - -100) < 0.01 && Math.abs(j.rig.tc.change.y - -450) < 0.01 && j.rig.tc.typed.change, 'typed in: X-100 Y-450 (kept until read again)');
    g = await generate();
    const L2 = g.gcode.split('\n'), m6b = L2.findIndex((l) => /^M6 T3/.test(l)), at = L2.slice(0, m6b).reverse().find((l) => /^G0 X|^G0 Y/.test(l));
    ok(/X200\.000 Y-250\.000|X7\.8740 Y-9\.8425/.test(at), `tool changes now go to it (work X200 Y-250): ${at}`);
    const st2 = await page.$eval('#rcam-root details[data-sec=toolchange]', (el) => el.innerText.replace(/\n/g, ' '));
    ok(/Typed in: tool change/.test(st2), 'and it says the tool change position was typed in');

    // ---- routing off
    await page.uncheck('#rc-rig-tc-route'); await page.waitForTimeout(400);
    g = await generate();
    ok(!/G53/.test(g.gcode) && /M6 T3/.test(g.gcode) && !(await page.evaluate(() => window.RotaryCam.viewer.toolChangeShown())), 'Go round the rotary off: plain M6, no route in 3D');
    await page.check('#rc-rig-tc-route'); await page.waitForTimeout(400);
    await H('/__test/machine', { mtc: { installed: true } });
    await openSec('toolchange');
    await page.click('#rcam-root .rc-act[data-act=readmachine]'); await page.waitForTimeout(800);
    j = await job();
    ok(j.rig.tc.change.x === -560 && !Object.keys(j.rig.tc.typed || {}).length, 'Read from ncSender again replaces the typed position');

    // ---- dump for the verifier (route on again)
    g = await generate();
    const dump = await page.evaluate(() => { const s = window.RotaryCam.__state; return { tris: Array.from(s.mesh.tris), job: s.job, gcode: s.program.gcode, tenons: window.RotaryCamCore.tenonList(s.job, s.mesh) }; });
    const n = dump.tris.length / 9, buf = Buffer.alloc(84 + n * 50);
    buf.writeUInt32LE(n, 80);
    for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) buf.writeFloatLE(dump.tris[i * 9 + k], 84 + i * 50 + 12 + 4 * k);
    fs.writeFileSync(path.join(outDir, 'placed.stl'), buf);
    fs.writeFileSync(path.join(outDir, 'job.json'), JSON.stringify(dump.job, null, 2));
    fs.writeFileSync(path.join(outDir, 'tenons.json'), JSON.stringify(dump.tenons));
    fs.writeFileSync(path.join(outDir, 'program.nc'), dump.gcode);
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
