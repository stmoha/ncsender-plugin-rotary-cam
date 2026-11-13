// Stamps a build tag into config.html and lib/rotary-ui.js and zips the plugin.
// node build.mjs            -> dist/rotary-cam-<version>.zip
// node build.mjs --release  -> dist/com.cncdocs.rotary-cam_v<version>.zip (what the release workflow attaches)
// node build.mjs --test     -> dist/com.cncdocs.rotary-cam_v<version>-test.zip (to try before publishing)
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
// --release: the name the GitHub release carries (<id>_v<version>.zip); --test: the same with -test
const release = process.argv.includes('--release'), test = process.argv.includes('--test');
const zip = release || test ? `dist/${manifest.id}_v${manifest.version}${test ? '-test' : ''}.zip` : `dist/rotary-cam-${manifest.version}.zip`;
rmSync(zip, { force: true });
const files = ['manifest.json', 'config.html', 'icon.png', 'README.md', 'MANUAL.md', 'LICENSE',
  'lib/cam-core.js', 'lib/cam-sim.js', 'lib/cam-worker.js', 'lib/rcam-project.js', 'lib/rotary-ui.js', 'lib/rotary-viewer.js', 'lib/ocl.js',
  'lib/occt-import-js.js', 'lib/occt-import-js.wasm',
  'licenses/OpenCAMLib-COPYING.txt', 'licenses/three.js-LICENSE.txt', 'licenses/OpenCascade-LICENSE.txt', 'licenses/occt-import-js-LICENSE.txt'];
try { execFileSync('zip', ['-q', '-9', zip, ...files]); }
catch (e) {
  if (e.code !== 'ENOENT') throw e;
  // no zip (Windows): its own tar (bsdtar, not Git's GNU tar) writes a .zip from the name
  const tar = process.platform === 'win32' ? (process.env.SystemRoot || 'C:\\Windows') + '\\System32\\tar.exe' : 'bsdtar';
  execFileSync(tar, ['-a', '-c', '-f', zip, ...files]);
}
console.log(`${zip} (build ${tag})`);
