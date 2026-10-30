// screenshots of the Indexed reach shading (dev aid): node test/shot-reach.cjs <part> <out.png> [angle] [view]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const path = require('path');
(async () => {
  const [part, out, ang = '90', view = 'iso'] = process.argv.slice(2), PORT = Number(process.env.PORT || 8791);
  const srv = spawn('node', [path.join(__dirname, 'harness/serve.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => srv.stdout.once('data', r));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await (await browser.newContext({ viewport: { width: 1500, height: 950 } })).newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.goto(`http://localhost:${PORT}/`);
  await page.click('#open'); await page.waitForFunction(() => window.RotaryCam && window.RotaryCam.__state && window.RotaryCam.__state.tools.length > 0, null, { timeout: 30000 });
  await page.setInputFiles('#rcam-root input[type=file]', part);
  await page.waitForFunction(() => window.RotaryCam.__state.mesh, null, { timeout: 120000 });
  await page.selectOption('#rcam-root .rc-centre', 'origin'); await page.waitForTimeout(300);
  await page.fill('#rc-stock-dia-round', '44'); await page.dispatchEvent('#rc-stock-dia-round', 'change');
  await page.evaluate(() => { const d = document.querySelector('#rcam-root details[data-sec=index]'); d.open = true; });
  await page.check('#rcam-root details[data-sec=index] summary input[type=checkbox]'); await page.waitForTimeout(300);
  await page.uncheck('#rc-index-auto'); await page.waitForTimeout(300);
  await page.fill('#rc-index-angle_list', ang); await page.dispatchEvent('#rc-index-angle_list', 'change'); await page.waitForTimeout(300);
  await page.click('[data-idx-pick="0"]'); await page.waitForTimeout(400);
  await page.click(`[data-view=${view}]`); await page.waitForTimeout(600);
  await page.locator('#rcam-root .rc-view').screenshot({ path: out });
  await browser.close(); srv.kill();
})();
