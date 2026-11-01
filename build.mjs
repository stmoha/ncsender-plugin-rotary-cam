// Stamps a build tag into config.html and lib/rotary-ui.js and zips the plugin.
// node build.mjs            -> dist/rotary-cam-<version>.zip
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// 3D view bundle (three.js) - rebuild when viewer/node_modules is present
import { existsSync } from 'node:fs';
if (existsSync('viewer/node_modules/three')) execFileSync('node', ['build.mjs'], { cwd: 'viewer', stdio: 'inherit' });

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const tag = `${manifest.version}-${Date.now().toString(36)}`;
const stamp = (file, re, value) => writeFileSync(file, readFileSync(file, 'utf8').replace(re, value));
stamp('config.html', /var BUILD = '[^']*';/, `var BUILD = '${tag}';`);
stamp('lib/rotary-ui.js', /var BUILD = '[^']*';/, `var BUILD = '${tag}';`);
const core = readFileSync('lib/cam-core.js', 'utf8');
if (!core.includes(`VERSION = '${manifest.version}'`)) throw new Error('lib/cam-core.js VERSION does not match manifest.json');

mkdirSync('dist', { recursive: true });
const zip = `dist/rotary-cam-${manifest.version}.zip`;
rmSync(zip, { force: true });
const files = ['manifest.json', 'config.html', 'icon.png', 'README.md', 'MANUAL.md', 'LICENSE',
  'lib/cam-core.js', 'lib/cam-sim.js', 'lib/cam-worker.js', 'lib/rcam-project.js', 'lib/rotary-ui.js', 'lib/rotary-viewer.js', 'lib/ocl.js',
  'lib/occt-import-js.js', 'lib/occt-import-js.wasm',
  'licenses/OpenCAMLib-COPYING.txt', 'licenses/three.js-LICENSE.txt', 'licenses/OpenCascade-LICENSE.txt', 'licenses/occt-import-js-LICENSE.txt'];
execFileSync('zip', ['-q', '-9', zip, ...files]);
console.log(`${zip} (build ${tag})`);
