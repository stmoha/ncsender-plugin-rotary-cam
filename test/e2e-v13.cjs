// 0.9.1: the version under the name and an update badge (ncSender's check-update); the stock
// at a glance in the header; programs that stay inside the Z travel, and a tool that can't
// clear the stock stopping Generate.
// node test/e2e-v13.cjs <part> <outdir> [--dark] [--viewport WxH] [--metric] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8801));
const metric = process.argv.includes('--metric');
const U = metric ? 1 : 25.4;
fs.mkdirSync(outDir, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest.json'), 'utf8'));

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const H = (p, b) => fetch(`http://localhost:${PORT}${p}`, b !== undefined ? { method: 'POST', body: typeof b === 'string' ? b : JSON.stringify(b) } : undefined).then((r) => r.json());
  if (!metric) await H('/__test/units', 'imperial');
  await H('/__test/update', { latestVersion: '9.9.9', updateAvailable: true, releaseUrl: 'https://github.com/stmoha/ncsender-plugin-rotary-cam/releases/tag/v9.9.9' });
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
  const box = () => page.$eval('#rcam-root .rc-stockbox', (b) => ({ l1: b.querySelector('.rc-sb1').textContent, l2: b.querySelector('.rc-sb2').textContent, red: b.querySelectorAll('.rc-short').length }));
  const generate = async () => {
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 900000, polling: 500 });
    return page.evaluate(() => { const S = window.RotaryCam.__state; return { probs: S.problems, warns: S.warnings, gcode: S.program && S.program.gcode }; });
  };
  // every Z the program commands, in mm (G53 lines are skipped, as ncSender does)
  const zs = (g) => { let inch = false; const out = []; g.split('\n').forEach((l) => { const c = l.replace(/\(.*?\)/g, '').trim(); if (!c || /G53/.test(c)) return; if (/\bG20\b/.test(c)) inch = true; const m = c.match(/\bZ(-?[\d.]+)/); if (m && /^G[01]\b/.test(c)) out.push(Number(m[1]) * (inch ? 25.4 : 1)); }); return out; };
  try {
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    // a stand-in for ncSender's Settings button and its Plugins tab
    await page.evaluate(() => {
      const gear = document.createElement('button'); gear.className = 'theme-toggle'; gear.title = 'Settings'; gear.textContent = 'gear';
      gear.onclick = () => { const tab = document.createElement('button'); tab.className = 'tab-button'; tab.innerHTML = '<span class="tab-label">Plugins</span>'; tab.onclick = () => { window.__pluginsTab = true; }; document.body.appendChild(tab); window.__settingsOpened = true; };
      document.body.appendChild(gear);
    });
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });

    // ---- version and update
    const ver = await page.$eval('#rcam-root .rc-version', (e) => e.textContent);
    ok(ver === 'v' + manifest.version, 'the version shows under the name: ' + ver);
    await page.waitForSelector('#rcam-root .rc-update:not([hidden])', { timeout: 10000 });
    ok(true, 'ncSender says v9.9.9 is out: the update badge shows');
    await page.click('#rcam-root .rc-update'); await page.waitForTimeout(300);
    const pop = await page.$eval('#rcam-root .rc-updpop', (e) => e.textContent);
    ok(/v9\.9\.9 is out/.test(pop) && /What.s new/.test(pop) && /plugin settings/.test(pop) && /Update now/.test(pop), 'its card: what’s new, open ncSender’s plugin settings, update now');
    await shot('update-card');
    await page.click('#rcam-root [data-upd=now]'); await page.waitForTimeout(600);
    ok((await H('/__test/updated')).UPDATED === 1 && /Updated\./.test(await page.$eval('#rcam-root .rc-updpop', (e) => e.textContent)) && await page.$eval('#rcam-root .rc-update', (b) => b.hidden), 'Update now asks ncSender to update it, then says to reopen');

    // ---- the stock at a glance
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.selectOption('#rcam-root .rc-centre', 'origin'); await page.waitForTimeout(300);
    await openSec('stock'); await typeIn('#rc-stock-dia-round', D(44));
    let b = await box();
    ok(/^Stock Ø/.test(b.l1) && /jaws to centre/.test(b.l1) && /Part needs at least Ø/.test(b.l2) && /Z room/.test(b.l2) && b.red === 0, `the header shows the stock, the least the part needs and the Z room: "${b.l1}" / "${b.l2}"`);
    await shot('stock-overview');
    await typeIn('#rc-stock-dia-round', D(30));
    b = await box();
    ok(b.red >= 2, `stock too thin: shown in red (${b.l1} / ${b.l2})`);
    await typeIn('#rc-stock-dia-round', D(44));
    await openSec('part'); await page.evaluate(() => { document.querySelector('#rcam-root details[data-sec=stock]').open = false; });
    await page.click('#rcam-root .rc-stockbox'); await page.waitForTimeout(500);
    ok(await page.$eval('#rcam-root details[data-sec=stock]', (d) => d.open), 'clicking it opens Stock & rotary');

    // ---- Z travel: the work offset 20 mm under machine Z0: a 44 mm stock can't be cleared
    await H('/__test/machine', { machine: { WCO: '-300.000,-200.000,-20.000', g54: '-300.000,-200.000,-20.000,0.000' } });
    await openSec('toolchange'); await page.click('#rcam-root [data-act=readmachine]'); await page.waitForTimeout(800);
    const ztop = await page.evaluate(() => window.RotaryCam.__state.job.rig.tc.ztop);
    ok(Math.abs(ztop - 20) < 1e-6, 'Read from ncSender: the top of Z is 20 mm above the axis (work offset Z-20, T1 in)');
    b = await box();
    ok(b.red >= 1 && /Z room/.test(b.l2), 'the header shows the Z room in red: ' + b.l2);
    for (const [s, id] of [['rough', '11'], ['finish', '12']]) { await openSec(s); await page.selectOption(`#rc-${s}-tool`, id); }
    const blocked = await page.evaluate(() => ({ probs: window.RotaryCam.__state.problems, off: document.querySelector('#rcam-root .rc-gen').disabled, shown: [...document.querySelectorAll('#rcam-root .rc-msg.rc-err')].map((e) => e.textContent).join(' ') }));
    ok(blocked.off && blocked.probs.some((p) => /^Z travel: Roughing/.test(p) && /can.t clear the stock/.test(p)) && /Z travel/.test(blocked.shown), 'Generate is off, and it says why: ' + (blocked.probs.find((p) => /Z travel/.test(p)) || '(none)').slice(0, 170));
    let r;
    await page.mouse.move(vp[0] - 30, vp[1] / 2);     // (a setting under the pointer would show instead)
    await page.focus('#rc-rig-tc-ztop'); await page.waitForTimeout(300);
    const h = await page.evaluate(() => window.RotaryCam.viewer.highlighted());
    ok(h && h.key === 'rig.tc.ztop' && h.dims > 0, 'Top of Z above the axis shows in 3D as a dimension up to a ceiling ' + JSON.stringify(h));
    await shot('z-blocked');
    // 26.5 mm of room: the rapids are kept under machine Z0, and that's said
    await H('/__test/machine', { machine: { WCO: '-300.000,-200.000,-26.500', g54: '-300.000,-200.000,-26.500,0.000' } });
    await page.click('#rcam-root [data-act=readmachine]'); await page.waitForTimeout(800);
    r = await generate();
    const z = zs(r.gcode || ''), top = Math.max(...z);
    ok(r.gcode && top - 26.5 <= 1e-6, `generated: highest Z ${top.toFixed(3)} mm, so nothing above machine Z0 with the work offset at Z-26.5 (what ncSender checks)`);
    ok(r.warns.some((w) => /^To stay inside the Z travel/.test(w)), 'and it says the rapids were kept lower: ' + (r.warns.find((w) => /Z travel/.test(w)) || '(none)').slice(0, 140));
    await page.waitForTimeout(400); await shot('z-capped');
    // ---- open ncSender's plugin settings from the card
    await H('/__test/update', { updateAvailable: true }); await page.evaluate(() => { window.RotaryCam.updateCheck = null; });
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
