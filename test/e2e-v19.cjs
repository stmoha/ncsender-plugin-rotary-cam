// 0.11.2: on wide landscape screens the checks sit in a column right of the view, which shuts
// to a strip (remembered in the browser); portrait and narrow windows keep them below the view.
// node test/e2e-v19.cjs <part> <outdir> [--dark] [--port N]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8812));

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
  const open = async () => {
    await page.goto('about:blank');
    await page.goto(`http://localhost:${PORT}/${dark}`);
    await page.click('#open');
    await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
    await page.waitForTimeout(500);
  };
  const refresh = () => page.evaluate(() => window.RotaryCam.session.hooks.refresh());
  const warn = (list) => page.evaluate((l) => { window.RotaryCam.__state.warnings = l; window.RotaryCam.session.hooks.refresh(); }, list);
  const toast = (kind, text) => page.evaluate(([k, x]) => { window.RotaryCam.__state.toast = { kind: k, text: x }; window.RotaryCam.session.hooks.refresh(); }, [kind, text]);
  const layout = () => page.evaluate(() => {
    const q = (s) => document.querySelector('#rcam-root ' + s), R = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; };
    const notes = q('.rc-notes'), head = q('.rc-noteshead');
    return {
      view: R(q('.rc-view')), main: R(q('.rc-main')), msgs: R(q('.rc-msgs')), notes: getComputedStyle(notes).display === 'contents' ? null : R(notes),
      notesShown: getComputedStyle(notes).display !== 'none', head: getComputedStyle(head).display !== 'none' ? R(head) : null, headText: head.textContent, expanded: head.getAttribute('aria-expanded'),
      badges: Array.from(head.querySelectorAll('.rc-nb')).map((b) => b.className.replace('rc-nb rc-nb-', '') + ':' + b.textContent),
      list: Array.from(document.querySelectorAll('#rcam-root .rc-msgs .rc-msg')).map((m) => m.className.replace('rc-msg ', '') + '|' + m.textContent.slice(0, 40)),
      floating: Array.from(document.querySelectorAll('#rcam-root .rc-toasts .rc-msg')).map((m) => m.textContent), toastBox: R(q('.rc-toasts .rc-msg')),
      stored: (() => { try { return localStorage.getItem('rcam.notes'); } catch (e) { return 'n/a'; } })()
    };
  });
  try {
    await open();
    await page.evaluate(() => { try { localStorage.removeItem('rcam.notes'); } catch (e) {} });
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(400);
    // ---- nothing to say: no column, the view has the whole width
    await warn([]);
    let L = await layout();
    const fullW = L.view.w;
    if (process.env.DBG) console.log(JSON.stringify(L));
    ok(!L.notesShown && Math.abs(L.view.r - L.main.r) < 2, `landscape, no checks: no column, the view is the full width (${fullW.toFixed(0)} px)`);
    // ---- a problem and some checks: a column right of the view, top to bottom
    await page.evaluate(() => { const d = document.querySelector('#rcam-root details[data-sec=stock]'); d.open = true; });
    await page.fill('#rc-stock-dia-round', '10'); await page.dispatchEvent('#rc-stock-dia-round', 'change');
    await page.evaluate(() => document.activeElement.blur()); await page.waitForTimeout(400);   // (done typing)
    await warn(['First check: something to look at before cutting.', 'Second check, a longer one that has to wrap onto a few lines in a narrow column so we can see how it reads.', '!!A danger.']);
    L = await layout();
    ok(L.notesShown && L.notes && L.notes.x > L.view.r && Math.abs(L.notes.y - L.view.y) < 2 && Math.abs(L.notes.b - L.main.b) < 2, `landscape: the checks are a column right of the view, top to bottom (${L.notes && L.notes.w.toFixed(0)} px wide)`);
    ok(Math.abs(L.view.h - (L.main.h - (L.main.b - L.view.b))) < 1 && L.view.b > L.main.b - 70, `the view keeps its height (${L.view.h.toFixed(0)} of ${L.main.h.toFixed(0)} px; only the stats line below it)`);
    ok(L.badges.join() === 'err:2,warn:2', 'the header counts them: ' + L.badges.join(', ') + ' (' + L.headText + ')');
    ok(L.list.length === 4 && L.expanded === 'true', 'all four are in it: ' + L.list.map((x) => x.split('|')[0]).join(', '));
    await page.screenshot({ path: path.join(outDir, 'landscape-open.png') });
    // ---- a fix button works in the column
    await page.click('#rcam-root .rc-notes .rc-fitstock');
    await page.waitForTimeout(500);
    L = await layout();
    ok(!L.list.some((x) => /^rc-err\|Fix/.test(x)) && !L.notesShown, '"Fit the stock to the part" works from the column: the problem is gone (and with the settings changed, the program\u2019s checks too, so the column goes)');
    await warn(['First check: something to look at before cutting.', 'Second check, a longer one.', '!!A danger.']);
    // ---- shut: a strip, the view gets the room; remembered
    await page.click('#rcam-root .rc-noteshead');
    await page.waitForTimeout(400);
    L = await layout();
    ok(L.notes && L.notes.w <= 46 && L.expanded === 'false' && L.stored === 'shut', `shut: a ${L.notes && L.notes.w.toFixed(0)} px strip, remembered in the browser (${L.stored})`);
    ok(L.view.w > fullW - 70 && L.badges.join() === 'err:1,warn:2', `the view gets the room back (${L.view.w.toFixed(0)} px) and the strip still shows the counts`);
    // a notice floats over the view
    await toast('ok', 'Saved to File Manager: Rotary CAM/test.nc');
    L = await layout();
    ok(L.floating.length === 1 && /Saved to File Manager/.test(L.floating[0]) && L.toastBox && L.toastBox.x > L.view.x && L.toastBox.r <= L.view.r + 1 && L.toastBox.y > L.view.y, 'a notice floats over the view while the checks are shut');
    ok(!L.list.some((x) => /Saved to File/.test(x)), 'and isn’t in the list');
    await page.screenshot({ path: path.join(outDir, 'landscape-shut.png') });
    await refresh();
    ok((await layout()).floating.length === 0, 'and goes at the next refresh, as before');
    // ---- opening again: still shut
    await open();
    await page.waitForTimeout(300);
    await warn(['A check after reopening.']);
    L = await layout();
    ok(L.notes && L.notes.w <= 46, 'opening again: still shut');
    await page.click('#rcam-root .rc-noteshead');
    await page.waitForTimeout(300);
    L = await layout();
    ok(L.notes && L.notes.w > 200 && L.stored === 'open', 'open it again (remembered too)');
    await toast('warn', 'A notice with the column open.');
    L = await layout();
    ok(L.floating.length === 1 && L.toastBox.r < L.notes.x, 'with the column open, a notice still floats over the view');
    // ---- portrait (ncSender's kiosk): below the view, as before
    await page.setViewportSize({ width: 1080, height: 1920 });
    await page.waitForTimeout(500);
    await warn(['Portrait check one.', 'Portrait check two.']);
    await toast('ok', 'A portrait notice.');
    L = await layout();
    ok(!L.notes && !L.head && L.msgs.y > L.view.b && Math.abs(L.msgs.x - L.view.x) < 2, 'portrait: the checks are below the view, full width, no header');
    if (process.env.DBG) console.log(JSON.stringify(L.list));
    ok(L.list.length === 3 && /^rc-ok rc-toastmsg\|A portrait notice/.test(L.list[0]) && L.floating.length === 0, 'and a notice is first in the list, not floating');
    await page.screenshot({ path: path.join(outDir, 'portrait.png') });
    // ---- a narrow landscape window: below the view too
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.waitForTimeout(500);
    await warn(['Narrow check.']);
    L = await layout();
    ok(!L.notes && L.msgs.y > L.view.b, 'landscape under 1200 px wide: below the view, as before');
    ok(errors.length === 0, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  } catch (e) { fails++; console.log('ERROR', e); }
  await browser.close(); srv.kill();
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})();
