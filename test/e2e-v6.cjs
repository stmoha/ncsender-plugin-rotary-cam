// 0.5.0 walkthrough: Indexed. Settings (auto / own angles), generate on a part with an
// overhang, the result message, its toolpath, and the simulation showing what's left to
// clean before, during and after it. Dumps the program for the verifier.
// node test/e2e-v6.cjs <part> <outdir> [--dark] [--viewport WxH] [--metric]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(process.argv.includes('--port') ? process.argv[process.argv.indexOf('--port') + 1] : 8782);
const metric = process.argv.includes('--metric');
const U = metric ? 1 : 25.4;
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  if (!metric) await fetch(`http://localhost:${PORT}/__test/units`, { method: 'POST', body: 'imperial' });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const vp = arg('--viewport', '1500x950').split('x').map(Number);
  const page = await (await browser.newContext({ viewport: { width: vp[0], height: vp[1] } })).newPage();
  const errors = [];
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
  const open = async () => { await page.click('#open'); await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0 && document.querySelector('#rcam-root .rc-side details'), null, { timeout: 30000 }); await page.waitForTimeout(700); };
  const t = Date.now(), ms = () => ((Date.now() - t) / 1000).toFixed(1) + 's';
  let fails = 0;
  const ok = (cond, what) => { if (!cond) fails++; console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what); };
  const openSec = (sec) => page.evaluate((s) => { const d = document.querySelector('#rcam-root details[data-sec=' + s + ']'); if (d) d.open = true; }, sec);
  const rows = (sec) => page.$$eval(`#rcam-root details[data-sec=${sec}] .rc-row label`, (els) => els.map((e) => e.textContent.replace('?', '').trim()));
  const typeIn = async (sel, v) => { await page.fill(sel, String(v)); await page.dispatchEvent(sel, 'change'); await page.waitForTimeout(250); };
  const seek = async (frac) => { await page.$eval('#rcam-root .rc-simpos', (el, f) => { el.value = Math.round(f * 1000); el.dispatchEvent(new Event('input', { bubbles: true })); }, frac); await page.waitForTimeout(900); };
  try {
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    await open();
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(500);
    await page.selectOption('#rcam-root .rc-centre', 'origin');
    await page.waitForTimeout(300);
    await typeIn('#rc-stock-dia-round', (44 / U).toFixed(metric ? 1 : 4));

    ok(await page.$eval('#rcam-root .rc-op[data-op=index]', (b) => b.hidden), 'Indexed pill hidden while Indexed is off');
    await openSec('index');
    await page.check('#rcam-root details[data-sec=index] summary input[type=checkbox]');
    await page.waitForTimeout(300);
    ok(!(await page.$eval('#rcam-root .rc-op[data-op=index]', (b) => b.hidden)), 'Indexed pill shows when it is ticked');
    let r = await rows('index');
    ok(r.includes('A angles') && !r.includes('Most angles') && !(await page.$eval('#rc-index-auto', (b) => b.checked)), 'listing your own angles is the default: an A angles field');
    await page.check('#rc-index-auto'); await page.waitForTimeout(300);
    r = await rows('index');
    const warn = await page.$$eval('#rcam-root details[data-sec=index] .rc-warn', (els) => els.map((e) => e.textContent).join(' '));
    ok(r.includes('Most angles') && !r.includes('A angles') && /much longer/.test(warn), 'picking them automatically shows Most angles, and warns it takes much longer');
    await page.uncheck('#rc-index-auto'); await page.waitForTimeout(300);
    r = await rows('index');
    ok(r.includes('A angles') && !r.includes('Most angles') && !(await page.$('#rcam-root details[data-sec=index] .rc-warn')), 'own angles show an A angles field, no warning');
    await typeIn('#rc-index-angle_list', '90, 270');
    ok(await page.evaluate(() => window.RotaryCamCore.indexAngles(window.RotaryCam.__state.job).join(',')) === '90,270', 'the A angles field is read as 90, 270');
    await page.check('#rc-index-auto'); await page.waitForTimeout(300);

    for (const [s, id] of [['rough', '11'], ['finish', '13'], ['index', '13']]) { await openSec(s); await page.selectOption(`#rc-${s}-tool`, id); }
    // a long-reach 1/8 ball: this walkthrough is about Indexed, not about the collet nut
    // (with the library's 22 mm stickout the nut keeps it off much of the jaw's underside)
    await openSec('index'); await typeIn('#rc-index-stickout', (40 / U).toFixed(metric ? 2 : 4));
    await openSec('finish'); await typeIn('#rc-finish-pitch', (0.4 / U).toFixed(metric ? 2 : 4));
    // ---- Cancel stops it whatever it's waiting for: here a drop that never comes back
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.pool && window.RotaryCam.pool.workers && window.RotaryCam.pool.workers.length, null, { timeout: 120000 });
    await page.evaluate(() => { const p = window.RotaryCam.pool; p.drop = () => new Promise(() => {}); });
    await page.waitForFunction(() => /^Indexed:/.test(window.RotaryCam.__state.busy || ''), null, { timeout: 600000, polling: 250 });
    await page.waitForTimeout(2500);
    const tick1 = await page.$eval('#rcam-root .rc-status', (e) => e.textContent);
    await page.waitForTimeout(1500);
    const tick2 = await page.$eval('#rcam-root .rc-status', (e) => e.textContent);
    ok(tick1 !== tick2 && /so far/.test(tick2), 'stuck waiting, the clock still ticks: "' + tick1.replace(/.*· (\d+:\d+) so far.*/, '$1') + '" then "' + tick2.replace(/.*· (\d+:\d+) so far.*/, '$1') + '"');
    await page.click('#rcam-root .rc-cancel'); await page.waitForTimeout(600);
    const cx = await page.evaluate(() => ({ busy: window.RotaryCam.__state.busy, gen: window.RotaryCam.__state.gen, prog: !!window.RotaryCam.__state.program, off: document.querySelector('#rcam-root .rc-gen').disabled, pool: !!window.RotaryCam.pool, bar: document.querySelector('#rcam-root .rc-prog').style.display }));
    ok(!cx.busy && !cx.gen && !cx.prog && !cx.off && !cx.pool && cx.bar === 'none', 'Cancel while it waits on a drop that never comes: stopped at once, Generate back on ' + JSON.stringify(cx));

    // every progress report, as it's made (sampling the screen misses them on a busy machine)
    await page.evaluate(() => { const h = window.RotaryCam.session.hooks, p = h.progress; window.__prog = []; h.progress = function (G, k, f, t) { window.__prog.push([k, f]); return p.apply(this, arguments); }; });
    await page.click('#rcam-root .rc-gen');
    const stages = new Set(), bars = [];
    let shot1 = false;
    const t0 = Date.now();
    while (Date.now() - t0 < 1500000) {
      const st = await page.evaluate(() => {
        const segs = [...document.querySelectorAll('#rcam-root .rc-prog i')].map((i) => ({ w: parseFloat((i.querySelector('b') || { style: {} }).style.width) || 0, now: i.classList.contains('rc-now'), t: i.title }));
        return { busy: window.RotaryCam.__state.busy, done: !!window.RotaryCam.__state.program, probs: window.RotaryCam.__state.problems.length, segs, shown: document.querySelector('#rcam-root .rc-prog').style.display };
      });
      if (st.busy) stages.add(st.busy.replace(/[\d,]+.*$/, '').trim());
      if (/^Indexed: Planning/.test(st.busy || '')) { bars.push(st); if (!shot1 && st.segs.length === 5 && st.segs[3].w > 5) { shot1 = true; await shot('progress-indexed'); } }
      if (st.done || (!st.busy && st.probs)) break;
      await page.waitForTimeout(250);
    }
    console.log(ms(), '   stages:', JSON.stringify([...stages]));
    ok([...stages].some((s) => /Finding what the rotary passes missed/.test(s)) && [...stages].some((s) => /^Indexed:/.test(s)), 'progress shows the Indexed stages');
    // the bar: a piece per step; during Indexed the earlier ones are full and Indexed's own moves
    const ixf = (await page.evaluate(() => window.__prog)).filter((q) => q[0] === 'index').map((q) => q[1]);
    const rising = ixf.every((f, i) => !i || f >= ixf[i - 1] - 1e-9), distinct = new Set(ixf.map((f) => Math.round(f * 100))).size;
    ok(bars.length && bars.every((b) => b.shown === 'flex' && b.segs.length === 5 && b.segs.slice(0, 3).every((q) => q.w === 100) && b.segs[3].now && /Indexed/.test(b.segs[3].t) && /Writing the program/.test(b.segs[4].t)), `during Indexed the bar shows its 5 steps (the last writing the program), the first 3 done and Indexed's the one going (${bars.length} looks)`);
    ok(ixf.length > 10 && rising && distinct >= 10 && ixf[ixf.length - 1] === 1, `Indexed reports its progress ${ixf.length} times, rising through ${distinct} different values to 100%, not pegged`);
    const lastBusy = bars.length ? bars[bars.length - 1].busy : '';
    ok(/^Indexed: Planning A.*\(\d of \d\)\u2026 \d+% \u00b7 .*so far \u00b7 step 4 of 5$/.test(lastBusy), 'with how far it is, how long so far (and left, once it can tell), and which step: "' + lastBusy + '"');
    const st = await page.evaluate(() => { const s = window.RotaryCam.__state; return { problems: s.problems, info: s.program && s.program.info.index && { angles: s.program.info.index.angles, target: s.program.info.index.target, removed: s.program.info.index.removed }, n: s.program && s.program.paths.index.length / 4 }; });
    console.log(ms(), '   generated:', JSON.stringify(st));
    ok(st.info && st.info.angles.length > 0 && st.info.removed / st.info.target > 0.8, `Indexed reaches ${st.info ? Math.round(100 * st.info.removed / st.info.target) : 0}% at A ${st.info && st.info.angles.join(', ')}`);
    const msg = await page.$eval('#rcam-root .rc-msgs', (el) => el.innerText.replace(/\n/g, ' '));
    console.log(ms(), '   messages:', msg.slice(0, 400));
    ok(/Indexed.*At A/.test(msg), 'message says which angles and how much they reach');
    await page.click('#rcam-root .rc-op[data-op=index]'); await page.waitForTimeout(500);
    await shot('1-indexed-toolpath');

    // simulate
    await page.click('[data-tab=sim]');
    await page.waitForFunction(() => window.RotaryCam.sim && window.RotaryCam.sim.checked, null, { timeout: 600000, polling: 500 });
    await page.waitForTimeout(800);
    const rep = await page.evaluate(() => window.RotaryCam.__state.simReport);
    console.log(ms(), '   simulation report:', JSON.stringify(rep));
    ok(rep && rep.rapids === 0 && rep.gouges === 0 && rep.index && rep.index.left < 0.2 * rep.index.total, 'simulation: no rapids, nothing below the part, Indexed cuts away most of what was left');
    const msg2 = await page.$eval('#rcam-root .rc-msgs', (el) => el.innerText.replace(/\n/g, ' '));
    ok(/Indexed cuts away \d+%/.test(msg2), 'simulation message gives what Indexed cut away');
    const tIdx = await page.evaluate(() => { const R = window.RotaryCam.sim, P = R.prog; for (let k = 0; k < P.count; k++) if (P.ops[P.op[k]] && P.ops[P.op[k]].name === 'index') return { start: (k ? P.t[k - 1] : 0) / P.total, end: P.t[P.count - 1] / P.total }; return null; });
    let k2 = await page.evaluate(() => { const P = window.RotaryCam.sim.prog; let last = 0; for (let k = 0; k < P.count; k++) if (P.ops[P.op[k]] && P.ops[P.op[k]].name === 'index') last = P.t[k] / P.total; return last; });
    await seek(tIdx.start - 0.01);
    const before = await page.evaluate(() => window.RotaryCam.viewer.overlayCount());
    await seek(tIdx.start + 0.002);
    const atStart = await page.evaluate(() => window.RotaryCam.viewer.overlayCount());
    await shot('2-sim-indexed-start');
    await seek((tIdx.start + k2) / 2);
    const mid = await page.evaluate(() => window.RotaryCam.viewer.overlayCount());
    await shot('3-sim-indexed-middle');
    await seek(k2 + 0.0005);
    const after = await page.evaluate(() => window.RotaryCam.viewer.overlayCount());
    await shot('4-sim-indexed-end');
    console.log(ms(), `   yellow blocks: before Indexed ${before}, at its start ${atStart}, half way ${mid}, at its end ${after}`);
    ok(before === 0 && atStart > 0 && mid < atStart && after < mid, 'what is left to clean shows from the start of Indexed and shrinks as it cuts');
    ok(await page.$eval('#rcam-root .rc-ovkey', (el) => getComputedStyle(el).display !== 'none'), 'legend shows Left to clean during Indexed');
    await seek(0.2);
    ok(await page.evaluate(() => window.RotaryCam.viewer.overlayCount()) === 0, 'scrubbing back before Indexed hides it again');

    const dump = await page.evaluate(() => { const s = window.RotaryCam.__state; return { tris: Array.from(s.mesh.tris), job: s.job, gcode: s.program.gcode, tenons: window.RotaryCamCore.tenonList(s.job, s.mesh) }; });
    const n = dump.tris.length / 9, buf = Buffer.alloc(84 + n * 50);
    buf.writeUInt32LE(n, 80);
    for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) buf.writeFloatLE(dump.tris[i * 9 + k], 84 + i * 50 + 12 + 4 * k);
    fs.writeFileSync(path.join(outDir, 'placed.stl'), buf);
    fs.writeFileSync(path.join(outDir, 'job.json'), JSON.stringify(dump.job, null, 2));
    fs.writeFileSync(path.join(outDir, 'tenons.json'), JSON.stringify(dump.tenons));
    fs.writeFileSync(path.join(outDir, 'program.nc'), dump.gcode);

    // ---- which way A turns: Indexed asks, since it cuts the opposite side if it's wrong
    await page.click('[data-tab=3d]').catch(() => {}); await page.waitForTimeout(300);
    let adir = await page.$$eval('#rcam-root .rc-msg', (els) => { const m = els.find((e) => /Indexed depends on which way A turns/.test(e.textContent)); return m ? { text: m.textContent, btns: [...m.querySelectorAll('.rc-adir')].map((b) => b.textContent) } : null; });
    ok(adir && /toward you \(.Y\)/.test(adir.text) && /180. off at A90 and A270/.test(adir.text) && adir.btns.length === 2, 'Indexed asks which way A+90 turned the top of the stock: ' + (adir && adir.btns.join(' | ')));
    await shot('5-a-direction');
    // it turned away: the setting flips, the toolpaths go
    await page.click('#rcam-root .rc-adir[data-asign="-1"]'); await page.waitForTimeout(500);
    let sj = await page.evaluate(() => ({ s: window.RotaryCam.__state.job.a_sign, c: window.RotaryCam.__state.job.a_checked, p: !!window.RotaryCam.__state.program, sel: document.querySelector('#rcam-root [data-k=a_sign]') && document.querySelector('#rcam-root [data-k=a_sign]').value }));
    ok(sj.s === -1 && sj.c === true && !sj.p && sj.sel === '-1', 'Away from me: A+90 now turns it to +Y, and the toolpaths are dropped to generate again ' + JSON.stringify(sj));
    // turning the other way, Indexed still cuts what it should (the program and the plan agree);
    // and this time each angle finishes the whole side it faces as well
    const before6 = st.n;
    await openSec('index'); await page.check('#rc-index-side_finish'); await page.waitForTimeout(300);
    await page.evaluate(() => { window.RotaryCam.__state.program = null; });
    await page.click('#rcam-root .rc-gen');
    await page.waitForFunction(() => window.RotaryCam.__state.program || (!window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length), null, { timeout: 1500000, polling: 500 });
    const g2 = await page.evaluate(() => ({ head: window.RotaryCam.__state.program.gcode.slice(0, 400), ask: window.RotaryCam.__state.warnings.some((w) => /which way A turns/.test(w)) }));
    ok(/a_sign=-1/.test(g2.head) && !g2.ask, 'generated with a_sign=-1, and it doesn\u2019t ask again');
    const n6 = await page.evaluate(() => window.RotaryCam.__state.program.paths.index.length / 4);
    ok(n6 > 2 * before6, `the whole side: Indexed runs ${n6} points instead of ${before6}, line by line over each side`);
    await page.click('[data-tab=3d]').catch(() => {}); await page.click('#rcam-root .rc-op[data-op=index]'); await page.waitForTimeout(600);
    await page.click('[data-view=iso]'); await page.waitForTimeout(800);
    await shot('6-indexed-whole-side');
    await page.click('[data-tab=sim]');
    await page.waitForFunction(() => window.RotaryCam.sim && window.RotaryCam.sim.checked, null, { timeout: 600000, polling: 500 });
    await page.waitForTimeout(800);
    const rep2 = await page.evaluate(() => window.RotaryCam.__state.simReport);
    ok(rep2 && rep2.rapids === 0 && rep2.gouges === 0 && rep2.index && rep2.index.left < 0.2 * rep2.index.total, 'turning the other way, with the whole side: still no rapids into the stock, nothing below the part, Indexed cuts away most of what was left ' + JSON.stringify(rep2 && rep2.index));
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
