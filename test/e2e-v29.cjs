// 0.13.0: setups. The side panel's three groups; a setup's strategies as cards to add, open,
// set to rest, copy, remove and drag into order; the slot part cut with roughing, a tapered
// ball finish, a second finishing set to rest (a 1/8" flat end mill) and Indexed; Generate
// writes them in that order, each its own toolpath and button on the view; Simulate finds
// nothing cut into the part; a second setup; and it all comes back after closing.
// node test/e2e-v29.cjs test/slot_test.step <outdir> [--dark] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const H = require('./ui-helpers.cjs');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8818));

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
  const notes = () => page.evaluate(() => Array.from(document.querySelectorAll('#rcam-root .rc-msgs .rc-msg, #rcam-root .rc-toasts .rc-msg')).map((m) => m.textContent));
  const order = async () => (await H.strats(page)).map((s) => s.type + (s.mode === 'rest' ? '/rest' : '')).join();
  const open = async () => {
    await page.goto('about:blank');
    await page.goto(`http://localhost:${PORT}/${dark}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.waitForTimeout(500);
  };
  try {
    await open();
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(400);

    // ---- the side panel: three groups; a setup of roughing and finishing to start
    const grps = await page.$$eval('#rcam-root .rc-grp', (gs) => gs.map((g) => g.getAttribute('data-grp') + (g.classList.contains('open') ? '' : ' (shut)')));
    ok(grps.join() === 'part,setups,settings (shut)', 'groups: ' + grps.join(', '));
    ok(await order() === 'rough,finish', 'a new part starts with roughing and finishing: ' + await order());
    ok(!(await page.$('#rcam-root details[data-sec=zero]')), 'no Work zero section: Probe the chuck is beside Generate');
    ok(await page.$eval('#rcam-root .rc-probechuck', (b) => /Probe the chuck/.test(b.textContent)), 'the Probe the chuck button is at the bottom');
    await H.openGroups(page);
    const secs = await page.$$eval('#rcam-root details[data-sec]', (ds) => ds.map((d) => d.getAttribute('data-sec')));
    ok(secs.join() === 'part,stock,tenons,rig,toolchange,machine', 'Part and Settings hold their sections: ' + secs.join(', '));

    // ---- the part: through the form (Generate reads the saved settings back first)
    const U = await page.evaluate(() => window.RotaryCam.__state.units === 'in' ? 25.4 : 1);
    const openSec = (s) => page.evaluate((k) => { const d = document.querySelector('#rcam-root details[data-sec=' + k + ']'); if (d) d.open = true; }, s);
    const setField = async (id, mm) => { await page.fill('#' + id, String(mm / U)); await page.press('#' + id, 'Tab'); await page.waitForTimeout(300); };
    await openSec('stock'); await openSec('part');
    await setField('rc-stock-dia-round', 30);
    await setField('rc-model-part_start_x', 60);

    // ---- finishing with a tapered ball
    await H.openStrat(page, 'finish');
    await page.selectOption('#rc-finish-shape', 'taper'); await page.waitForTimeout(400);
    await setField('rc-finish-tool_dia', 1.0);
    // ---- a second finishing: rest, its own smaller tool
    const f2 = await H.addStrat(page, 'finish');
    const s2 = await page.evaluate((id) => { const S = window.RotaryCam.__state; const x = window.RotaryCamCore.curSetup(S.job).list.find((s) => s.id === id); return { mode: x.mode, t: x.tool_number, d: x.tool_dia, shape: x.shape, open: S.ui.strat === id }; }, f2);
    ok(s2.mode === 'rest' && s2.t === 3 && Math.abs(s2.d - 3.175) < 1e-6 && s2.shape === 'flat' && s2.open, `a second finishing starts as rest: T${s2.t} ${s2.d} mm ${s2.shape}, open`);
    const card = await page.$eval(`#rcam-root [data-strat="${f2}"]`, (c) => ({ name: c.querySelector('.rc-sname b').textContent, tag: c.querySelector('.rc-mode').textContent, fields: Array.from(c.querySelectorAll('.rc-row label')).map((l) => l.textContent.trim()) }));
    ok(card.name === 'Finishing 2' && card.tag === 'Rest' && card.fields.some((f) => /^Only where at least/.test(f)), `its card: ${card.name}, ${card.tag}, rest settings shown`);
    // ---- Indexed, on tool 5 (T3 is the rest finishing's)
    await H.addStrat(page, 'index');
    await page.selectOption('#rc-index-shape', 'flat'); await page.waitForTimeout(400);
    await setField('rc-index-tool_dia', 3.175);
    await page.fill('#rc-index-tool_number', '5'); await page.press('#rc-index-tool_number', 'Tab'); await page.waitForTimeout(300);
    ok(await order() === 'rough,finish,finish/rest,index', 'the setup: ' + await order());

    // ---- dragging: Indexed above Finishing 2, then back; the arrow keys too
    const ids = (await H.strats(page)).map((s) => s.id);
    const drag = async (from, to, below) => {
      const opened = await page.evaluate(() => window.RotaryCam.__state.ui.strat);
      if (opened) { await page.click(`#rcam-root [data-strat-open="${opened}"]`); await page.waitForTimeout(250); }
      const a = await page.$(`#rcam-root [data-strat="${from}"] .rc-sh`), b = await page.$(`#rcam-root [data-strat="${to}"]`);
      await b.scrollIntoViewIfNeeded(); await a.scrollIntoViewIfNeeded();
      const ba = await a.boundingBox(), bb = await b.boundingBox();
      await page.mouse.move(ba.x + 120, ba.y + ba.height / 2); await page.mouse.down();
      await page.mouse.move(bb.x + 120, below ? bb.y + bb.height - 4 : bb.y + 4, { steps: 8 }); await page.mouse.up();
      await page.waitForTimeout(400);
    };
    await drag(ids[3], ids[2], false);
    ok(await order() === 'rough,finish,index,finish/rest', 'dragged Indexed above Finishing 2: ' + await order());
    await page.focus(`#rcam-root [data-strat-grip="${ids[3]}"]`);
    await page.keyboard.press('ArrowDown'); await page.waitForTimeout(400);
    ok(await order() === 'rough,finish,finish/rest,index', 'and back down with the arrow key: ' + await order());
    await drag(ids[0], ids[1], true);
    const n1 = await page.$$eval('#rcam-root .rc-ordernote', (ns) => ns.map((n) => n.textContent));
    ok(await order() === 'finish,rough,finish/rest,index' && n1.some((n) => /Finishing comes before Roughing/.test(n)), 'Roughing dragged below Finishing gets a note: ' + n1.join(' | '));
    await drag(ids[0], ids[1], false);
    ok(await order() === 'rough,finish,finish/rest,index' && !(await page.$('#rcam-root .rc-ordernote')), 'back in order, no note');

    // ---- Generate
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 900000, polling: 500 });
    const r = await page.evaluate(() => { const S = window.RotaryCam.__state; return { probs: S.problems, ops: S.program ? S.program.gcode.split('\n').filter((l) => /^\(OP /.test(l)).map((l) => l.split(' ')[1]) : [], paths: S.program ? S.program.paths.map((p) => p.title + ':' + (p.data.length / 4)) : [] }; });
    ok(!r.probs.length && /^rough,finish,finish2(,index)?$/.test(r.ops.join()), 'Generate: ' + (r.probs[0] || r.ops.join(', ')));
    ok(r.paths.length === 4 && /^Finishing 2:[1-9]/.test(r.paths[2]), 'each strategy its own toolpath: ' + r.paths.join(', '));
    const btns = await page.$$eval('#rcam-root .rc-ops .rc-op', (bs) => bs.map((b) => b.textContent));
    ok(btns.join() === 'Roughing,Finishing 1,Finishing 2,Indexed', 'a button on the view for each: ' + btns.join(', '));
    const said = (await notes()).find((m) => /^Finishing 2/.test(m));
    ok(!!said && /stretch/.test(said), 'a message says where Finishing 2 cuts: ' + (said || '').slice(0, 120));
    await page.click('#rcam-root .rc-op:nth-child(3)'); await page.waitForTimeout(400);
    ok(await page.evaluate((id) => window.RotaryCam.__state.ui.strat === id && window.RotaryCam.__state.ui.op === 'finish2', f2), 'its button shows it and opens its settings');
    await page.screenshot({ path: path.join(outDir, 'setups-generated.png') });
    // Simulate: nothing below the part
    const sim = await page.evaluate(() => {
      const S = window.RotaryCam.__state, Sm = window.RotaryCamSim, sm = new Sm.Sim(S.job, S.mesh, Sm.parseProgram(S.program.gcode, S.job));
      sm.runTo(sm.prog.count); return { g: sm.gouges(), steps: sm.prog.ops.map((o) => o.step) };
    });
    ok(sim.g.count === 0 && sim.steps.slice(0, 3).join() === '1,2,3', `Simulate: nothing cut into the part (${sim.g.count} cells), steps ${sim.steps.join(',')}`);
    await page.click('#rcam-root [data-tab=sim]'); await page.waitForTimeout(1500);
    await page.evaluate(() => { const p = document.querySelector('#rcam-root .rc-simpos'); p.value = '7000'; p.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForSelector('#rcam-root .rc-simline b', { timeout: 60000 });
    const line = await page.$eval('#rcam-root .rc-simline b', (b) => b.textContent);
    ok(/^(Roughing|Finishing [12]|Indexed)$/.test(line), 'Simulate names the strategy: ' + line);
    await page.click('#rcam-root [data-tab="3d"]'); await page.waitForTimeout(500);

    // ---- a second setup: a copy, renamed, with Finishing 2 removed
    await page.click('#rcam-root [data-setup-act=copy]'); await page.waitForTimeout(400);
    await page.fill('#rcam-root [data-setup-name]', 'Quick'); await page.press('#rcam-root [data-setup-name]', 'Tab'); await page.waitForTimeout(300);
    const q = await H.strats(page);
    await page.click(`#rcam-root [data-strat-del="${q[2].id}"]`); await page.waitForTimeout(400);
    const su = await page.evaluate(() => { const S = window.RotaryCam.__state; return { names: S.job.setups.map((u) => u.name), cur: S.job.setup, prog: !!S.program }; });
    ok(su.names.join() === 'Setup 1,Quick' && su.cur === 1 && !su.prog, 'a second setup, Quick, on show (the toolpaths were for the first): ' + su.names.join(', '));
    ok(await order() === 'rough,finish,index', 'Quick has its own strategies: ' + await order());
    await page.click('#rcam-root [data-setup-pick="0"]'); await page.waitForTimeout(400);
    ok(await order() === 'rough,finish,finish/rest,index', 'Setup 1 is as it was: ' + await order());

    // ---- closed and opened again: the setups are kept
    await page.waitForTimeout(1500);
    await open();
    const back = await page.evaluate(() => { const S = window.RotaryCam.__state, c = window.RotaryCamCore; return { names: S.job.setups.map((u) => u.name + ':' + u.list.length), cur: S.job.setup }; });
    ok(back.names.join() === 'Setup 1:4,Quick:3' && back.cur === 0, 'opened again: ' + back.names.join(', '));
  } catch (e) { ok(false, 'threw: ' + (e && e.stack || e)); }
  ok(!errors.length, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  await browser.close(); srv.kill();
  process.exit(fails ? 1 : 0);
})();
