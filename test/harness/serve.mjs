// Test harness: a stand-in for the parts of ncSender Pro v2 that Rotary CAM uses,
// copied from ncSender's source (PluginEndpoints.cs, GcodeFileEndpoints.cs,
// PluginDialog.vue). node test/harness/serve.mjs [port]
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, normalize } from 'node:path';

const PORT = Number(process.argv[2] || 8777);
const PLUGIN_DIR = resolve(new URL('../..', import.meta.url).pathname);
const ID = 'com.cncdocs.rotary-cam';
let pluginSettings = {};
const saved = new Map();
let loaded = null;
let UNITS = 'metric';
const log = [];

const LIBRARY = [
  { id: 11, toolId: 11, toolNumber: 1, name: '1/4" Flat End Mill', type: 'flat', diameter: 6.35, dimensions: { flute_length: 25 } },
  { id: 12, toolId: 12, toolNumber: 2, name: '1/4" Ball End Mill', type: 'ball', diameter: 6.35, dimensions: { flute_length: 22 } },
  { id: 13, toolId: 13, toolNumber: 3, name: '1/8" Ball End Mill', type: 'ball', diameter: 3.175, dimensions: { flute_length: 12 } },
  { id: 14, toolId: 14, toolNumber: null, name: '60° V-bit', type: 'v-bit', diameter: 12.7 },
  // a tapered ball the way it has to be entered today: as a V-bit, diameter = shank
  { id: 15, toolId: 15, toolNumber: 5, name: '1mm Tapered Ball 3.6° 1/8" shank', type: 'v-bit', diameter: 3.175, dimensions: { flute_length: 25 } }
];
const FIRMWARE = { protocol: 'grblhal', settings: { 20: { value: '0' }, 30: { value: '24000' }, 110: { value: '5000' }, 112: { value: '2500' }, 113: { value: '5400' }, 133: { value: '0' } } };

const json = (res, obj, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
const body = (req) => new Promise((r) => { const c = []; req.on('data', (d) => c.push(d)); req.on('end', () => r(Buffer.concat(c).toString('utf8'))); });

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;
  log.push(`${req.method} ${p}${url.search}`);
  if (p === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(readFileSync(new URL('./host.html', import.meta.url))); }
  // PluginEndpoints.cs: /api/plugins/{id}/icon?file=  (svg / png typed, everything else octet-stream)
  if (p === `/api/plugins/${ID}/icon`) {
    const f = url.searchParams.get('file') || 'icon.png';
    const full = normalize(join(PLUGIN_DIR, f));
    if (!full.startsWith(PLUGIN_DIR) || !existsSync(full)) { res.writeHead(404); return res.end(); }
    const type = full.endsWith('.svg') ? 'image/svg+xml' : full.endsWith('.png') ? 'image/png' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    return res.end(readFileSync(full));
  }
  if (p === `/api/plugins/${ID}/settings`) {
    if (req.method === 'PUT') { pluginSettings = JSON.parse(await body(req)); return json(res, { success: true }); }
    return json(res, pluginSettings);
  }
  // Tool-menu execute: the server fills the tokens; here we hand the HTML back instead of broadcasting it
  if (p === '/api/plugins/tool-menu-items/execute' && req.method === 'POST') {
    const b = JSON.parse(await body(req));
    const html = readFileSync(join(PLUGIN_DIR, 'config.html'), 'utf8')
      .replaceAll('__SERVER_PORT__', String(PORT))
      .replaceAll('__INITIAL_CONFIG__', JSON.stringify(pluginSettings))
      .replaceAll('__TOOL_MENU_LABEL__', b.label);
    return json(res, { title: b.label, content: html, options: { size: 'large' } });
  }
  if (p === `/api/plugins/${ID}/config-ui`) return json(res, { configUI: readFileSync(join(PLUGIN_DIR, 'config.html'), 'utf8') });
  if (p === '/api/settings') return json(res, { unitsPreference: UNITS, safeZHeight: -5, tool: { numbering: 'slot' } });
  if (p === '/__test/units' && req.method === 'POST') { UNITS = (await body(req)).trim(); return json(res, { units: UNITS }); }
  if (p === '/api/tools') return json(res, LIBRARY);
  if (p === '/api/firmware') return json(res, FIRMWARE);
  if (p === '/api/server-state') return json(res, { machineState: { connected: true } });
  if (p === '/api/gcode-files/file') {
    const path = url.searchParams.get('path');
    if (saved.has(path)) return json(res, { path, content: saved.get(path) });
    res.writeHead(404); return res.end();
  }
  if (p === '/api/gcode-files/file/save' && req.method === 'POST') { const b = JSON.parse(await body(req)); saved.set(b.path, b.content); return json(res, { success: true }); }
  if (p === '/api/gcode-files/load-temp' && req.method === 'POST') { const b = JSON.parse(await body(req)); loaded = b; return json(res, { success: true }); }
  // test hooks
  if (p === '/__test/loaded') return json(res, loaded || {});
  if (p === '/__test/saved') return json(res, Object.fromEntries(saved));
  if (p === '/__test/settings') return json(res, pluginSettings);
  if (p === '/__test/log') return json(res, log);
  if (p === '/__test/firmware' && req.method === 'POST') { Object.assign(FIRMWARE.settings, JSON.parse(await body(req))); return json(res, FIRMWARE); }
  res.writeHead(404); res.end();
}).listen(PORT, () => console.log(`harness on http://localhost:${PORT}`));
