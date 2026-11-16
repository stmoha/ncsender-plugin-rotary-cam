// Screenshots for 0.14.0 (docs/images): the helix in two setups, rest finishing, the keep-out
// zones kept in ncSender Pro, and a Tool Library change coming in. Uses the test stand-in.
// node dev/shots-0.14.cjs <helix.step> <outdir> [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const UH = require('../test/ui-helpers.cjs');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8890));
const sel = (s) => '#rcam-root ' + s;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const srv = spawn('node', [path.join(__dirname, '../test/harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const H = (p, b) => fetch(`http://localhost:${PORT}${p}`, b === undefined ? {} : { method: 'POST', body: JSON.stringify(b) }).then((r) => r.json());
  // ncSender Pro, with an ATC's zone at the back left (G54 is at machine X-300 Y-200)
  await H('/__test/pro', { pro: true, zones: [{ id: 'atc:com.ncsender.rapidchangeatc', name: 'ATC Zone', kind: 'atc', enabled: true, minX: -720, minY: -120, maxX: -620, maxY: -20, source: 'com.ncsender.rapidchangeatc' }] });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await (await browser.newContext({ viewport: { width: 1500, height: 950 }, deviceScaleFactor: 2 })).newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  const t0 = Date.now(), log = (...a) => console.log(((Date.now() - t0) / 1000).toFixed(0) + 's', ...a);
  const shot = async (name) => { await sleep(800); await page.screenshot({ path: path.join(outDir, name) }); log('shot', name); };
  const setField = async (k, v) => { await page.fill(sel(`[data-k="${k}"]`), String(v)); await page.press(sel(`[data-k="${k}"]`), 'Tab'); await sleep(300); };
  const openSec = (k, open = true) => page.evaluate(([k, o]) => { const d = document.querySelector(`#rcam-root details[data-sec=${k}]`); if (d) d.open = o; }, [k, open]);
  const grp = async (g, open) => { const is = await page.$eval(sel(`.rc-grp[data-grp=${g}]`), (el) => el.classList.contains('open')); if (is !== open) { await page.click(sel(`[data-grp-toggle=${g}]`)); await sleep(250); } };

  await page.goto(`http://localhost:${PORT}/#dark`);
  await page.click('#open');
  await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
  await sleep(1500);
  const x0 = await page.$(sel('.rc-x0done')); if (x0) { await x0.click(); await sleep(300); }
  await page.setInputFiles(sel('input[type=file]'), part);
  await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 180000 });
  await sleep(500);
  await UH.openGroups(page);
  await openSec('stock');
  await page.click(sel('[data-act=fitstock]')); await sleep(500);

  // setup 1, "Detailed": roughing T1 1/4" flat, finishing T2 1/4" ball, Finishing 2 (rest) T3 1/8" ball
  await UH.openStrat(page, 'rough');
  await page.selectOption(sel('[data-tool=rough]'), '11'); await sleep(300);
  await UH.openStrat(page, 'finish');
  await page.selectOption(sel('[data-tool=finish]'), '12'); await sleep(300);
  const f2 = await UH.addStrat(page, 'finish');
  await page.selectOption(sel('[data-tool=finish2]'), '13'); await sleep(300);
  await page.fill(sel('[data-setup-name]'), 'Detailed'); await page.press(sel('[data-setup-name]'), 'Tab'); await sleep(300);
  // setup 2, "Quick": a copy without the rest pass
  await page.click(sel('[data-setup-act=copy]')); await sleep(400);
  await page.fill(sel('[data-setup-name]'), 'Quick'); await page.press(sel('[data-setup-name]'), 'Tab'); await sleep(300);
  const q = await UH.strats(page);
  await page.click(sel(`[data-strat-del="${q[2].id}"]`)); await sleep(400);
  await page.click(sel('[data-setup-pick="0"]')); await sleep(400);

  log('generating');
  await page.click(sel('.rc-gen'));
  await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 3600000, polling: 1000 });
  log('generated', await page.evaluate(() => window.RotaryCam.__state.problems.join(' | ')));
  await sleep(1500);

  // 1: setups and strategies, every toolpath
  const opened = await page.evaluate(() => window.RotaryCam.__state.ui.strat);
  if (opened) { await page.click(sel(`[data-strat-open="${opened}"]`)); await sleep(300); }
  await grp('part', false); await grp('settings', false); await grp('setups', true);
  await page.click(sel('[data-view=iso]')); await sleep(600);
  await shot('setups.png');

  // 2: rest finishing: only where Finishing 1 couldn't reach
  await page.click(sel('.rc-op:nth-child(3)')); await sleep(800);
  await shot('rest-finishing.png');

  // 3: the keep-out zones in ncSender
  const op2 = await page.evaluate(() => window.RotaryCam.__state.ui.strat);
  if (op2) { await page.click(sel(`[data-strat-open="${op2}"]`)); await sleep(300); }
  await grp('setups', false); await grp('settings', true);
  await openSec('toolchange', false); await openSec('machine', false); await openSec('rig', true);
  await page.click(sel('[data-view=whole]')); await sleep(400);
  await page.$eval(sel('.rc-zoneinfo'), (e) => e.scrollIntoView({ block: 'center' }));
  await page.hover(sel('[data-k="keepout.margin"]'));
  await shot('keepout-zones.png');

  // 4: the Tool Library: roughing's T1, and a change made there coming in
  await openSec('rig', false); await grp('settings', false); await grp('setups', true);
  await UH.openStrat(page, 'rough');
  await page.$eval(sel('[data-k="rough.stickout"]'), (e) => e.scrollIntoView({ block: 'center' }));
  await H('/__test/tool', { id: 11, dimensions: { stickout: 34.925 } });    // 1 3/8"
  await page.waitForFunction(() => /Tool Library/.test(Array.from(document.querySelectorAll('#rcam-root .rc-toasts .rc-msg, #rcam-root .rc-msgs .rc-msg')).map((m) => m.textContent).join(' ')), null, { timeout: 15000 });
  await page.$eval(sel('[data-k="rough.stickout"]'), (e) => e.closest('.rc-row').style.outline = '');
  await shot('tool-library.png');

  await browser.close(); srv.kill();
})().catch((e) => { console.log(e); process.exit(1); });
