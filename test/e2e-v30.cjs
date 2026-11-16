// 0.14.0: the Tool Library and ncSender Pro's keep-out zones, both ways. A library tool's
// stickout and flute length typed here are saved in the library, and a change made there
// comes in here; a stickout typed for a library tool before 0.14.0 goes to the library once.
// On Pro, Rotary CAM keeps two keep-out zones of its own (headstock, tailstock), placed from
// the work zero and following the setup; a zone switched off in Settings stays off, deleting
// both turns them off, a moved work zero asks first, and the program is checked against
// every zone. node test/e2e-v30.cjs <outdir> [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const UH = require('./ui-helpers.cjs');
const [outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8830));
const sel = (s) => '#rcam-root ' + s;
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
  let page;
  const open = async () => {
    if (page) await page.context().close();
    const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 } });
    page = await ctx.newPage();
    page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    await page.goto(`http://localhost:${PORT}/`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0 && document.querySelector('#rcam-root .rc-side .rc-grp'), null, { timeout: 30000 });
    await page.waitForTimeout(800);
  };
  const notes = () => page.evaluate(() => Array.from(document.querySelectorAll('#rcam-root .rc-msgs .rc-msg, #rcam-root .rc-toasts .rc-msg')).map((m) => m.textContent).join(' | '));
  const tool = async (id) => (await H('/api/tools')).find((x) => x.id === id);
  const type = async (k, v) => { await page.fill(sel(`[data-k="${k}"]`), String(v)); await page.press(sel(`[data-k="${k}"]`), 'Tab'); await page.waitForTimeout(300); };
  const openSec = (k) => page.evaluate((k) => { const d = document.querySelector(`#rcam-root details[data-sec=${k}]`); d.open = true; }, k);
  const zones = async () => (await H('/__test/pro')).KEEPOUT.zones;
  const ours = async () => (await zones()).filter((z) => /^rotary-cam:/.test(z.id));
  try {
    // ---------------- the Tool Library (Community)
    await open();
    // X0 5/16" in front of the jaws (the default since 0.14.0): asks for X to be zeroed again
    const zx = await notes();
    ok(/Zero X again/.test(zx) && /7\.94 mm in front of the chuck jaw face/.test(zx), 'X0 now 5/16" in front of the jaws: it asks for X to be zeroed again, and says why');
    await page.click(sel('.rc-x0done'));
    await page.waitForTimeout(300);
    ok(!/Zero X again/.test(await notes()) && Math.abs((await page.evaluate(() => window.RotaryCam.__state.job.rig.x0_set)) - 7.9375) < 1e-9, '"X0 is already there" puts it away');
    await UH.openStrat(page, 'rough');
    await page.selectOption(sel('[data-tool=rough]'), '11');     // T1, 1/4" flat: flute 25, no stickout in the library
    await page.waitForTimeout(400);
    const so0 = await page.$eval(sel('[data-k="rough.stickout"]'), (e) => e.value);
    ok(so0 === '31', `T1 picked for roughing: the library has no stickout, so it's the flutes + 6 (${so0})`);
    await type('rough.stickout', 33.5);
    const t1 = await until(async () => { const x = await tool(11); return x.dimensions.stickout === 33.5 && x; });
    ok(t1 && t1.dimensions.flute_length === 25 && t1.name === '1/4" Flat End Mill' && t1.toolNumber === 1, 'typing its stickout saves it in the Tool Library (and leaves the rest of the tool as it was)');
    const own = await page.evaluate(() => { const S = window.RotaryCam.__state; return S.job.rough.own || null; });
    ok(!own || !own.stickout, 'it isn’t kept as Rotary CAM’s own: the library has the say');
    await type('rough.tool_length', 22);
    ok(await until(async () => (await tool(11)).dimensions.flute_length === 22), 'the flute length goes there too');
    // changed in the library (the Tool Library tab, another plugin, another computer)
    await H('/__test/tool', { id: 11, dimensions: { stickout: 40 } });
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    const took = await until(async () => (await page.$eval(sel('[data-k="rough.stickout"]'), (e) => e.value)) === '40', 10);
    ok(took, 'the library changes it to 40: the open window takes it in within a few seconds');
    ok(/Tool Library/.test(await notes()), 'and says so: ' + (await notes()).slice(0, 140));
    ok((await page.$$(sel('[data-k^="keepout."]'))).length === 0, 'Community: no keep-out zone settings');
    ok(!(await H('/__test/log')).some((l) => /PATCH \/api\/settings/.test(l)), 'Community: nothing written to ncSender’s settings');

    // a stickout typed for a library tool before 0.14.0 (kept as "own"): to the library, once
    await page.waitForTimeout(1500);
    const st = await H('/__test/settings');
    let found = null;
    st.job.setups.forEach((u) => u.list.forEach((s) => { if (s.type === 'rough' && !found) found = s; }));
    found.library_id = 13; found.stickout = 27; found.own = { stickout: true };
    await H('/__test/settings', st);
    await open();
    const t3 = await until(async () => (await tool(13)).dimensions.stickout === 27);
    ok(t3, 'an older job’s own stickout for T3 (the library said 22) is saved to the library on opening');
    const own2 = await page.evaluate(() => { const S = window.RotaryCam.__state, c = window.RotaryCamCore; let o = null; c.curSetup(S.job).list.forEach((s) => { if (s.library_id === 13) o = s.own || null; }); return o; });
    ok(!own2 || !own2.stickout, 'and isn’t its own any more');

    // ---------------- keep-out zones (Pro)
    const ATC = { id: 'atc:com.ncsender.rapidchangeatc', name: 'ATC Zone', kind: 'atc', enabled: true, minX: -800, minY: -600, maxX: -700, maxY: -400, source: 'com.ncsender.rapidchangeatc' };
    await H('/__test/pro', { pro: true, zones: [ATC] });
    await open();
    await UH.openGroups(page);
    await openSec('rig');
    ok((await page.$$(sel('[data-k="keepout.on"]'))).length === 1, 'Pro: the keep-out zone settings show under Rotary & spindle');
    const z1 = await until(async () => { const o = await ours(); return o.length === 2 && o; });
    const all1 = await zones();
    const job1 = await page.evaluate(() => JSON.parse(JSON.stringify(window.RotaryCam.__state.job)));
    const core = require('../lib/cam-core.js');
    const exp = core.zonesFor(core.prepareJob(core.deepMerge(core.DEFAULTS, job1)), { x: -300, y: -200 }, 'com.cncdocs.rotary-cam');
    ok(z1 && JSON.stringify(z1) === JSON.stringify(exp), 'two zones of its own, placed from the work zero (G54 X-300 Y-200): ' + (z1 || []).map((z) => `${z.name} X${z.minX}..${z.maxX} Y${z.minY}..${z.maxY}`).join('; '));
    ok(all1.some((z) => z.id === ATC.id && JSON.stringify(z) === JSON.stringify(ATC)), 'the ATC’s zone is left exactly as it was');
    const info = await page.$eval(sel('.rc-zoneinfo'), (e) => e.textContent);
    ok(/Rotary headstock/.test(info) && /Other zones in ncSender: ATC Zone/.test(info), 'the panel says what’s there: ' + info.slice(0, 160));
    const tcz = await page.evaluate(() => window.RotaryCam.__state.job.rig.tc.zones);
    ok(tcz && tcz.length === 1 && tcz[0].name === 'ATC Zone', 'the other zones are kept for the tool change routes');

    // follows the setup: a longer stock moves the tailstock zone; the margin grows both
    await openSec('stock');
    const T0 = (await ours()).find((z) => /tailstock/.test(z.id)).minX;
    const len = Number(await page.$eval(sel('[data-k="tailstock_x"]'), (e) => e.value));
    await type('tailstock_x', len + 50);
    ok(await until(async () => Math.abs((await ours()).find((z) => /tailstock/.test(z.id)).minX - (T0 + 50)) < 0.002), 'stock 50 mm longer: the tailstock zone moves 50 mm');
    const H0 = (await ours()).find((z) => /headstock/.test(z.id));
    await type('keepout.margin', 25);
    const H1 = await until(async () => { const h = (await ours()).find((z) => /headstock/.test(z.id)); return Math.abs(h.minX - (H0.minX - 15)) < 1e-6 && h; });
    ok(H1 && Math.abs(H1.maxX - H0.maxX) < 1e-6 && Math.abs(H1.minY - (H0.minY - 15)) < 1e-6, 'margin 10 → 25: bigger all round, except toward the part (still the jaw face)');

    // switched off in ncSender's settings: stays off
    await H('/__test/pro', { zones: (await zones()).map((z) => (/tailstock/.test(z.id) ? Object.assign({}, z, { enabled: false }) : z)) });
    await sleep(5000);
    await type('keepout.margin', 20);
    const off = await until(async () => { const o = await ours(); const h = o.find((z) => /headstock/.test(z.id)); return Math.abs(h.minX - (H0.minX - 10)) < 1e-6 && o; });
    ok(off && off.find((z) => /tailstock/.test(z.id)).enabled === false, 'the tailstock zone switched off in Settings stays off when Rotary CAM updates them');

    // Here: a headstock / tailstock edge from where the spindle is now (G54 at X-300 Y-200)
    await openSec('rig');
    await H('/__test/machine', { machine: { MPos: '-450.000,-120.000,-10.000' } });   // work X-150 Y80
    await page.click(sel('[data-grab="rig.head.len"]')); await page.waitForTimeout(800);
    await page.click(sel('[data-grab="rig.head.back"]')); await page.waitForTimeout(800);
    const gr = await page.evaluate(() => window.RotaryCam.__state.job.rig.head);
    ok(Math.abs(gr.len - (150 - 7.9375 - 45)) < 0.002 && Math.abs(gr.back - 80) < 0.002, `Here: the spindle at X-150 Y80 makes the headstock ${gr.len} long (back of the chuck to it, X0 being 5/16" in front of the jaws) and reach ${gr.back} to the back`);
    await page.click(sel('[data-grab="rig.tail.front"]')); await page.waitForTimeout(800);
    ok(/has to be in front of the axis/.test(await notes()) && (await page.evaluate(() => window.RotaryCam.__state.job.rig.tail.front)) === 35, 'Here for the tailstock front with the spindle behind the axis: says so, changes nothing');
    await H('/__test/machine', { machine: { MPos: '-150.000,-200.000,-10.000' } });

    // the work zero moves (a job on the table): the zones stay and it asks
    const before = await ours();
    await H('/__test/machine', { machine: { g54: '-100.000,-50.000,-80.000,0.000', WCO: '-100.000,-50.000,-80.000' } });
    await openSec('toolchange');
    await page.click(sel('[data-act=readmachine]'));
    await page.waitForTimeout(1500);
    ok(JSON.stringify(await ours()) === JSON.stringify(before), 'G54 moved 250 mm: the zones stay where they were');
    const mv = await page.$(sel('.rc-zonemove:not([hidden]) [data-act=movezones]'));
    ok(!!mv && /has moved/.test(await page.$eval(sel('.rc-zoneinfo'), (e) => e.textContent)), 'and the panel asks whether to move them');
    await mv.click();
    ok(await until(async () => Math.abs((await ours()).find((z) => /headstock/.test(z.id)).maxX - (-100.1)) < 1e-6), 'Move the zones to the rotary: they’re placed from the new work zero');

    // the program is checked against every zone
    await H('/__test/pro', { zones: (await zones()).concat([{ id: 'clamp', name: 'Clamp', kind: 'keepout', enabled: true, minX: -60, minY: -60, maxX: -40, maxY: -40 }]) });
    await sleep(5000);
    await page.evaluate(() => { const S = window.RotaryCam.__state; S.program = { gcode: 'G21 G90\nG0 X10 Y0\nG1 X80 Y0 F1000\nG0 X10 Y0' }; });
    await type('keepout.margin', 21);
    const hit = await until(async () => /keep-out zone “Clamp” \(line 3/.test(await notes()));
    ok(hit, 'a program through another zone: flagged before ncSender refuses to start it');
    await fetch(`http://localhost:${PORT}/api/keepout/session`, { method: 'POST', body: JSON.stringify({ id: 'clamp', off: true }) });
    ok(await until(async () => !/\u201cClamp\u201d/.test(await notes())), 'switched off for this session in ncSender: no longer flagged');

    // deleting both of ours in ncSender's settings turns them off
    await H('/__test/pro', { zones: (await zones()).filter((z) => !/^rotary-cam:/.test(z.id)) });
    const offNow = await until(async () => page.evaluate(() => window.RotaryCam.__state.job.keepout.on === false));
    if (!offNow) console.log('DEBUG', JSON.stringify(await page.evaluate(() => ({ ko: window.RotaryCam.__state.job.keepout, all: window.RotaryCam.zones.all, busy: !!window.RotaryCam.zones.busy, sbusy: window.RotaryCam.__state.busy }))), JSON.stringify(await zones()));
    await page.waitForTimeout(600);
    const nn = (await notes()) + ' ' + (await page.$eval(sel('.rc-zoneinfo'), (e) => e.textContent));
    if (!/deleted in ncSender/.test(nn)) console.log('NOTES', nn.slice(0, 600));
    ok(offNow && /deleted in ncSender/.test(nn), 'both deleted in Settings: Rotary CAM stops keeping them, and says so');
    await sleep(5000);
    ok((await ours()).length === 0, 'and doesn’t put them back');
    await page.check(sel('[data-k="keepout.on"]'));
    ok(await until(async () => (await ours()).length === 2), 'turned on again: they’re back');
    await page.uncheck(sel('[data-k="keepout.on"]'));
    ok(await until(async () => (await ours()).length === 0 && (await zones()).some((z) => z.id === ATC.id)), 'turned off: ours go, the others stay');
    await page.screenshot({ path: path.join(outDir, 'v30-zones.png') });
  } catch (e) {
    fails++; console.log('ERROR', e);
  }
  ok(!errors.length, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 5).join(' / ') : ''));
  await browser.close(); srv.kill();
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})();
