// 0.6.0 walkthrough: scale / fit to the stock, Indexed angles in 3D (add from the A slider,
// pick one to see what it can't reach, drag one to a new angle, remove one), Indexed with
// your own angles (no up-front trying), then save the project, change things, and open the
// project again: part, settings and G-code back without calculating.
// node test/e2e-v8.cjs <part> <outdir> [--dark] [--viewport WxH] [--metric] [--port N]
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const [part, outDir] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', 8786));
const metric = process.argv.includes('--metric');
const U = metric ? 1 : 25.4;
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  if (!metric) await fetch(`http://localhost:${PORT}/__test/units`, { method: 'POST', body: 'imperial' });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const vp = arg('--viewport', '1500x950').split('x').map(Number);
  const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels|status of 404|GPU stall/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
  const open = async () => { await page.click('#open'); await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0 && document.querySelector('#rcam-root .rc-side details'), null, { timeout: 30000 }); await page.waitForTimeout(700); };
  const t = Date.now(), ms = () => ((Date.now() - t) / 1000).toFixed(1) + 's';
  let fails = 0;
  const ok = (cond, what) => { if (!cond) fails++; console.log(ms(), (cond ? 'PASS ' : 'FAIL ') + what); };
  const openSec = (sec) => page.evaluate((s) => { const d = document.querySelector('#rcam-root details[data-sec=' + s + ']'); if (d) d.open = true; }, sec);
  const typeIn = async (sel, v) => { await page.fill(sel, String(v)); await page.dispatchEvent(sel, 'change'); await page.waitForTimeout(300); };
  const st = () => page.evaluate(() => { const S = window.RotaryCam.__state; return { scale: S.job.model.scale, len: S.mesh && S.mesh.max[0] - S.mesh.min[0], rmax: S.mesh && S.mesh.rmax, stockR: S.job.stock_radius, auto: S.job.index.auto, list: S.job.index.angle_list, prog: !!S.program, a: S.ui.a, sel: S.ui.idxSel, ghosts: window.RotaryCam.viewer.indexAngleCount(), reach: window.RotaryCam.viewer.indexReach(), left: window.RotaryCam.viewer.leftoverCount(), problems: S.problems, busy: S.busy }; });
  const msgs = () => page.$eval('#rcam-root .rc-msgs', (el) => el.innerText.replace(/\n/g, ' '));
  const setA = async (a) => { await page.$eval('#rcam-root .rc-a', (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, a); await page.waitForTimeout(250); };
  try {
    await page.goto(`http://localhost:${PORT}/${process.argv.includes('--dark') ? '#dark' : ''}`);
    await open();
    await page.evaluate(() => { window.RotaryCam.noPicker = true; });
    await page.setInputFiles('#rcam-root input[type=file]', part);
    await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
    await page.waitForTimeout(500);
    await page.selectOption('#rcam-root .rc-centre', 'origin');
    await page.waitForTimeout(300);
    await typeIn('#rc-stock-dia-round', (44 / U).toFixed(metric ? 1 : 4));

    // ---- scale
    let s0 = await st();
    ok(Math.abs(s0.scale - 1) < 1e-9 && await page.$eval('#rc-model-scale', (el) => el.value) === '100', `Scale field shows 100% (part ${s0.len.toFixed(2)} mm long)`);
    await typeIn('#rc-model-scale', 50);
    let s1 = await st();
    ok(Math.abs(s1.len - s0.len / 2) < 0.01 && Math.abs(s1.rmax - s0.rmax / 2) < 0.01, `50% halves the part (${s1.len.toFixed(2)} mm long, R${s1.rmax.toFixed(2)})`);
    ok(/scaled 50%/.test(await page.$eval('#rcam-root .rc-meta', (el) => el.textContent)), 'the file line says it is scaled 50%');
    await page.click('#rcam-root .rc-act[data-act=fitscale]');
    await page.waitForTimeout(500);
    let s2 = await st(); let m = await msgs();
    console.log(ms(), '   fit:', s2.scale, 'R', s2.rmax.toFixed(3), 'stock R', s2.stockR, '|', m.slice(0, 200));
    ok(s2.scale > 0.5 && Math.abs(s2.rmax - (s2.stockR - 1)) < 0.05 && !s2.problems.length && /Scaled the part to/.test(m), `Scale to fit the stock: ${(100 * s2.scale).toFixed(1)}%, largest radius ${s2.rmax.toFixed(2)} of ${s2.stockR} mm, no problems`);
    await shot('1-scaled-to-fit');
    // too big for the stock: the Fix message offers to scale it
    await typeIn('#rc-model-scale', 200);
    m = await msgs();
    ok(/Scale the part to fit/.test(m), 'a part too big for the stock offers Scale the part to fit');
    await page.click('#rcam-root .rc-fitpart'); await page.waitForTimeout(500);
    ok(Math.abs((await st()).scale - s2.scale) < 1e-9, 'which scales it to fit');
    await typeIn('#rc-model-scale', 100);

    // ---- Indexed angles in 3D
    await openSec('index');
    await page.check('#rcam-root details[data-sec=index] summary input[type=checkbox]');
    await page.waitForTimeout(300);
    // (listing the angles is the default from 0.9.0: this part is about picking them)
    await page.check('#rc-index-auto'); await page.waitForTimeout(300);
    await page.click('#rcam-root .rc-op[data-op=index]'); await page.waitForTimeout(300);
    let s3 = await st();
    ok(s3.ghosts === 0 && await page.$('[data-idx-add]'), 'Pick the angles, nothing generated yet: no angles shown, + A offered');
    await setA(90);
    ok(await page.$eval('[data-idx-add]', (b) => b.textContent) === '+ A90°', 'the + A chip follows the A slider (+ A90°)');
    await page.click('[data-idx-add]'); await page.waitForTimeout(400);
    await setA(270);
    await page.click('[data-idx-add]'); await page.waitForTimeout(400);
    s3 = await st();
    ok(s3.auto === false && s3.list === '90, 270' && s3.ghosts === 2, `adding from the slider makes own angles: "${s3.list}", 2 tools in 3D`);
    ok(await page.$eval('#rc-index-angle_list', (el) => el.value) === '90, 270', 'the A angles field shows them');
    await page.click('[data-idx-pick="0"]'); await page.waitForTimeout(500);
    s3 = await st();
    ok(s3.sel === 0 && s3.a === 90 && s3.reach, 'clicking A90° turns the part to A90 and shades what that tool can’t see');
    await page.click('[data-view=front]'); await page.waitForTimeout(400);
    await shot('2-angle-picked-front');
    await page.click('[data-view=end]'); await page.waitForTimeout(400);
    await shot('3-angle-picked-end');
    // drag the A270 tool round by ~-40 deg in the end view
    const j = await page.evaluate(() => window.RotaryCam.__state.job);
    const rTip = j.stock_radius + j.safe_clearance;
    const g = await page.evaluate(([r]) => ({ tool: window.RotaryCam.viewer.indexScreen(1, 0.4), axis: window.RotaryCam.viewer.indexScreen(1, 0, 0) }), [rTip]);
    const rot = (p, c, deg) => { const t2 = deg * Math.PI / 180, dx = p.x - c.x, dy = p.y - c.y; return { x: c.x + dx * Math.cos(t2) - dy * Math.sin(t2), y: c.y + dx * Math.sin(t2) + dy * Math.cos(t2) }; };
    await page.mouse.move(g.tool.x, g.tool.y);
    await page.mouse.down();
    for (let k = 1; k <= 8; k++) { const q = rot(g.tool, g.axis, -40 * k / 8); await page.mouse.move(q.x, q.y); await page.waitForTimeout(40); }
    await shot('4-dragging');
    await page.mouse.up();
    await page.waitForTimeout(600);
    s3 = await st();
    const moved = s3.list.split(',').map(Number);
    console.log(ms(), '   after drag:', s3.list);
    ok(moved[0] === 90 && moved.length === 2 && moved[1] !== 270 && moved[1] % 5 === 0 && Math.abs(((moved[1] - 270 + 540) % 360) - 180) >= 25 && Math.abs(((moved[1] - 270 + 540) % 360) - 180) <= 55, `dragging the A270 tool in 3D turned it to A${moved[1]} (5° steps), A90 kept`);
    await page.click('[data-idx-del="1"]'); await page.waitForTimeout(400);
    s3 = await st();
    ok(s3.list === '90' && s3.ghosts === 1, 'removing an angle with its ✕');
    await typeIn('#rc-index-angle_list', '90, 270');
    ok((await st()).ghosts === 2, 'typing angles shows them in 3D too');
    await page.click('[data-view=iso]'); await page.waitForTimeout(300);

    // ---- generate with own angles: no trying stage
    for (const [sec, id] of [['rough', '11'], ['finish', '13'], ['index', '13']]) { await openSec(sec); await page.selectOption(`#rc-${sec}-tool`, id); }
    await openSec('finish'); await typeIn('#rc-finish-pitch', (0.4 / U).toFixed(metric ? 2 : 4));
    await page.click('#rcam-root .rc-gen');
    const stages = new Set(), t0 = Date.now();
    while (Date.now() - t0 < 1500000) {
      const x = await page.evaluate(() => ({ busy: window.RotaryCam.__state.busy, done: !!window.RotaryCam.__state.program, probs: window.RotaryCam.__state.problems.length }));
      if (x.busy) stages.add(x.busy.replace(/[\d,]+.*$/, '').trim());
      if (x.done || (!x.busy && x.probs)) break;
      await page.waitForTimeout(250);
    }
    console.log(ms(), '   stages:', JSON.stringify([...stages]));
    ok([...stages].some((x) => /^Indexed: Planning A/.test(x)) && ![...stages].some((x) => /Trying/.test(x)), 'own angles: Indexed plans each angle, no up-front Trying');
    const info = await page.evaluate(() => window.RotaryCam.__state.program.info.index);
    ok(info && info.angles.join(',') === '90,270' && info.removed > 0, `Indexed ran at A${info.angles.join(', A')}, reaching ${Math.round(100 * info.removed / info.target)}%`);
    await page.click('#rcam-root .rc-op[data-op=index]'); await page.waitForTimeout(500);
    s3 = await st();
    ok(s3.left > 0 && s3.ghosts === 2, `after generating, what the rotary passes leave shows yellow (${s3.left} blocks) with the angles`);
    await page.click('[data-idx-pick="1"]'); await page.waitForTimeout(500);
    await shot('5-generated-angle-picked');
    await page.click('[data-idx-pick="1"]'); await page.waitForTimeout(300);
    ok(!(await st()).reach, 'clicking the picked angle again turns the shading off');

    // ---- save the project
    const before = await page.evaluate(() => { const S = window.RotaryCam.__state; return { job: JSON.stringify(S.job), gcode: S.program.gcode, tris: S.raw.length, name: S.fileName }; });
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.click('#rcam-root .rc-saveproj')]);
    const proj = path.join(outDir, dl.suggestedFilename());
    await dl.saveAs(proj);
    const size = fs.statSync(proj).size;
    const listing = execFileSync('unzip', ['-l', proj]).toString();
    console.log(ms(), '   project:', path.basename(proj), (size / 1e6).toFixed(2), 'MB');
    ok(/\.rcam$/.test(proj) && ['project.json', 'part.stl', 'program.nc', 'result.json', 'result.bin'].every((n) => listing.includes(n)) && /source\/.*\.step/i.test(listing), 'Save project downloads a .rcam with the part, the STEP it came from, settings, G-code and toolpaths');
    ok(/Saved .*\.rcam/.test(await msgs()), 'the message says where it went');
    const pj = JSON.parse(execFileSync('unzip', ['-p', proj, 'project.json'], { maxBuffer: 1 << 26 }).toString());
    ok(pj.format === 'rotary-cam-project' && pj.job.index.angle_list === '90, 270' && pj.tools.some((x) => x.op === 'index' && x.library && x.library.id === 13), 'project.json: format, settings, tools with their library entries');
    ok(execFileSync('unzip', ['-p', proj, 'program.nc'], { maxBuffer: 1 << 30 }).toString() === before.gcode, 'program.nc is the G-code');

    // ---- change things, then open the project again
    await typeIn('#rc-stock-dia-round', (50 / U).toFixed(metric ? 1 : 4));
    await typeIn('#rc-index-angle_list', '45');
    ok(!(await st()).prog, 'changing settings drops the toolpaths');
    await page.setInputFiles('#rcam-root input[type=file]', proj);
    await page.waitForFunction(() => !window.RotaryCam.__state.busy && /Opened the project/.test(document.querySelector('#rcam-root .rc-msgs').innerText), null, { timeout: 120000 });
    await page.waitForTimeout(600);
    const after = await page.evaluate(() => { const S = window.RotaryCam.__state; return { job: JSON.stringify(S.job), gcode: S.program && S.program.gcode, tris: S.raw.length, name: S.fileName, sim: !document.querySelector('[data-tab=sim]').disabled, paths: S.program && S.program.paths.finish.length }; });
    m = await msgs();
    console.log(ms(), '   opened:', m.slice(0, 220));
    const diff = (a, b, pre = '') => { const out = []; const ka = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]); ka.forEach((k) => { const x = a && a[k], y = b && b[k]; if (x && y && typeof x === 'object' && typeof y === 'object') out.push(...diff(x, y, pre + k + '.')); else if (JSON.stringify(x) !== JSON.stringify(y)) out.push(pre + k + ': ' + JSON.stringify(x) + ' -> ' + JSON.stringify(y)); }); return out; };
    if (after.job !== before.job) console.log(ms(), '   settings that differ:', diff(JSON.parse(before.job), JSON.parse(after.job)));
    ok(after.job === before.job && after.tris === before.tris && after.name === before.name, 'opening the .rcam brings back the part and every setting');
    ok(after.gcode === before.gcode && after.paths > 0 && after.sim && /ready to simulate or load/.test(m), 'and the G-code and toolpaths, ready to simulate without calculating again');
    ok(!(await page.$eval('#rcam-root .rc-load', (b) => b.disabled)), 'Load into ncSender is ready');
    await page.click('#rcam-root .rc-op[data-op=finish]'); await page.waitForTimeout(400);
    await shot('6-project-opened');
    // the reopened program simulates
    await page.click('[data-tab=sim]');
    await page.waitForFunction(() => window.RotaryCam.sim && window.RotaryCam.sim.checked, null, { timeout: 900000, polling: 1000 });
    const rep = await page.evaluate(() => window.RotaryCam.__state.simReport);
    console.log(ms(), '   simulation report:', JSON.stringify(rep));
    ok(rep && rep.rapids === 0 && rep.gouges === 0, 'the reopened program simulates clean');
    await shot('7-project-simulated');
    // a .rcam renamed .zip? an STL renamed .rcam? the file itself decides
    const bad = path.join(outDir, 'not-a-project.rcam');
    fs.writeFileSync(bad, 'solid x\nendsolid x\n');
    await page.click('[data-tab="3d"]'); await page.waitForTimeout(300);
    await page.setInputFiles('#rcam-root input[type=file]', bad);
    await page.waitForFunction(() => !window.RotaryCam.__state.busy && window.RotaryCam.__state.problems.length, null, { timeout: 30000 });
    m = await msgs();
    ok(/Couldn.t open not-a-project.rcam: not a Rotary CAM project/.test(m) && (await st()).prog, 'a file that isn’t a project says so and leaves the open job alone');
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
