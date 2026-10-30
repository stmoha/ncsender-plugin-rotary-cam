// Renders dev/logo.svg to icon.png (512 px) with the pre-installed Chromium
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 512 } });
  await p.setContent(`<body style="margin:0;background:transparent">${fs.readFileSync(__dirname + '/logo.svg', 'utf8')}</body>`);
  await p.screenshot({ path: __dirname + '/../icon.png', omitBackground: true });
  await b.close();
})();
