// 0.11.2: the fine print. Shown on opening until it's accepted (saved with the settings), from
// the beta badge any time, and in the same words as README.md and MANUAL.md.
// node test/e2e-v18.cjs <outdir> [--dark] [--viewport WxH] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8809));

fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const H = (p, b) => fetch(`http://localhost:${PORT}${p}`, b !== undefined ? { method: 'POST', body: typeof b === 'string' ? b : JSON.stringify(b) } : undefined).then((r) => r.json());
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const vp = arg('--viewport', '1500x950').split('x').map(Number);
  const page = await (await browser.newContext({ viewport: { width: vp[0], height: vp[1] } })).newPage();
  const errors = [];
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const t = Date.now(), ms = () => ((Date.now() - t) / 1000).toFixed(1) + 's';
  let fails = 0;
  const ok = (cond, what) => { if (!cond) fails++; console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what); };
  const open = async () => {
    await page.goto('about:blank');      // (the same URL with #dark would only change the hash)
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.waitForTimeout(400);
  };
  const shown = () => page.evaluate(() => {
    const d = document.querySelector('#rcam-root .rc-fp');
    if (!d) return null;
    const g = document.querySelector('#rcam-root .rc-gen').getBoundingClientRect(), card = d.querySelector('.rc-fpcard'), cr = card.getBoundingClientRect();
    const hit = document.elementFromPoint(g.x + g.width / 2, g.y + g.height / 2);
    return {
      title: d.querySelector('h2').textContent, labels: Array.from(d.querySelectorAll('li > b')).map((b) => b.textContent),
      buttons: Array.from(d.querySelectorAll('[data-fp]')).map((b) => b.textContent), focus: document.activeElement && document.activeElement.getAttribute('data-fp'),
      covers: d.contains(hit), inView: cr.top >= 0 && cr.bottom <= innerHeight + 1 && cr.left >= 0 && cr.right <= innerWidth + 1,
      text: card.textContent, manual: (card.querySelector('.rc-fpman a') || {}).href || ''
    };
  });
  // the five points, as the docs have them
  const docLabels = (file) => (fs.readFileSync(path.join(__dirname, '..', file), 'utf8').split('## ⚠️ The fine print')[1] || '').split('\n## ')[0]
    .split('\n').filter((l) => /^- \*\*/.test(l)).map((l) => l.match(/^- \*\*(.+?)\*\*/)[1].replace(/'/g, '’'));
  try {
    // ---- first open: nothing accepted yet
    await H('/__test/settings', {});
    await open();
    let s = await shown();
    ok(s && /fine print/.test(s.title), 'first open: the fine print is up' + (s ? ' (' + s.title + ')' : ''));
    ok(s && s.covers && s.inView, 'it covers Rotary CAM (Generate can’t be clicked) and fits the window');
    ok(s && s.buttons.join('|') === 'Close Rotary CAM|I understand — let’s make chips' && s.focus === 'yes', 'two choices, "I understand" focused: ' + (s && s.buttons.join(' | ')));
    const readme = docLabels('README.md'), manual = docLabels('MANUAL.md');
    ok(readme.length === 5 && JSON.stringify(readme) === JSON.stringify(s && s.labels) && JSON.stringify(manual) === JSON.stringify(readme), 'the same five points as README.md and MANUAL.md: ' + (s && s.labels.join(' / ')));
    ok(s && /\/blob\/main\/MANUAL\.md$/.test(s.manual), 'and a link to the manual for anyone new: ' + (s && s.manual));
    ok(s && /Whoever presses Cycle Start owns what happens next/.test(s.text) && /MIT License/.test(s.text) && /Sienci Labs/.test(s.text), 'the words are all there');
    await page.screenshot({ path: path.join(outDir, 'fineprint-first-open.png') });
    // ---- Close Rotary CAM: closes without accepting
    const closed0 = await page.evaluate(() => window.__closed);
    await page.click('#rcam-root .rc-fp [data-fp=no]');
    await page.waitForTimeout(600);
    ok(await page.evaluate((c) => window.__closed === c + 1 && document.getElementById('dlg').hidden, closed0), '"Close Rotary CAM" closes it');
    ok(!((await H('/__test/settings')).job || {}).fineprint, 'and nothing is accepted');
    // ---- open again: still there; accept
    await page.click('#open');
    await page.waitForFunction(() => document.querySelector('#rcam-root .rc-fp'), null, { timeout: 30000 });
    ok(!!(await shown()), 'opening again: shown again');
    await page.click('#rcam-root .rc-fp [data-fp=yes]');
    await page.waitForTimeout(800);
    ok(!(await shown()), '"I understand" puts it away');
    ok(((await H('/__test/settings')).job || {}).fineprint === 1, 'and it’s saved with the settings (fineprint: 1)');
    // ---- opening after that: not shown
    await open();
    ok(!(await shown()), 'accepted: opening doesn’t show it');
    const man = await page.evaluate(() => { const a = document.querySelector('#rcam-root .rc-verrow a.rc-manual'), v = document.querySelector('#rcam-root .rc-version').getBoundingClientRect(), r = a && a.getBoundingClientRect();
      return a && { href: a.href, target: a.target, rel: a.rel, text: a.textContent, row: Math.abs(r.top + r.height / 2 - (v.top + v.height / 2)) < 4 && r.left > v.right }; });
    ok(man && /\/blob\/main\/MANUAL\.md$/.test(man.href) && man.target === '_blank' && /noopener/.test(man.rel) && man.text === 'Manual' && man.row, 'a Manual link beside the version opens the manual in a new tab');
    await page.screenshot({ path: path.join(outDir, 'header-manual.png'), clip: { x: 0, y: 0, width: 700, height: 130 } });
    // ---- the beta badge shows it again, to read
    await page.click('#rcam-root .rc-beta');
    s = await shown();
    ok(s && s.buttons.join('|') === 'Close' && s.labels.length === 5, 'the beta badge shows it, with just Close');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    ok(!(await shown()) && await page.evaluate(() => !document.getElementById('dlg').hidden), 'Esc puts it away and leaves Rotary CAM open');
    await page.click('#rcam-root .rc-beta');
    await page.mouse.click(5, 5);
    await page.waitForTimeout(300);
    ok(!(await shown()) && await page.evaluate(() => !document.getElementById('dlg').hidden), 'so does clicking outside it');
    await page.click('#rcam-root .rc-beta');
    await page.click('#rcam-root .rc-fp [data-fp=ok]');
    ok(!(await shown()), 'and Close');
    ok(((await H('/__test/settings')).job || {}).fineprint === 1, 'still accepted');
    // ---- portrait kiosk
    await page.setViewportSize({ width: 1080, height: 1920 });
    await page.click('#rcam-root .rc-beta');
    s = await shown();
    ok(s && s.inView, 'portrait 1080x1920: fits');
    await page.screenshot({ path: path.join(outDir, 'fineprint-portrait.png') });
    ok(errors.length === 0, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  } catch (e) { fails++; console.log('ERROR', e); }
  await browser.close(); srv.kill();
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})();
