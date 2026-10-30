// Bundles viewer/src/viewer.js (three.js + OrbitControls) into lib/rotary-viewer.js
import { build } from 'esbuild';
await build({
  stdin: { contents: "import { create, OP_COLORS } from './src/viewer.js'; window.RotaryCamViewer = { create, OP_COLORS };", resolveDir: '.', loader: 'js' },
  bundle: true, format: 'iife', platform: 'browser', target: ['chrome110'], minify: true,
  legalComments: 'eof', outfile: '../lib/rotary-viewer.js'
});
console.log('lib/rotary-viewer.js built');
