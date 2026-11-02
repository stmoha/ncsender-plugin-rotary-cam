// Test harness: a stand-in for the parts of ncSender Pro v2 that Rotary CAM uses,
// copied from ncSender's source (PluginEndpoints.cs, GcodeFileEndpoints.cs,
// PluginDialog.vue). node test/harness/serve.mjs [port]
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, normalize } from 'node:path';

const PORT = Number(process.argv[2] || 8777);
const PLUGIN_DIR = resolve(new URL('../..', import.meta.url).pathname);
const ID = 'com.cncdocs.rotary-cam';
// starts as someone who has accepted the fine print (POST /__test/settings {} for a first open)
let pluginSettings = { job: { fineprint: 1 } };
const saved = new Map();
let loaded = null;
let UNITS = 'metric';
const log = [];

const LIBRARY = [
  { id: 11, toolId: 11, toolNumber: 1, name: '1/4" Flat End Mill', type: 'flat', diameter: 6.35, dimensions: { flute_length: 25 } },
  { id: 12, toolId: 12, toolNumber: 2, name: '1/4" Ball End Mill', type: 'ball', diameter: 6.35, dimensions: { flute_length: 22 } },
  { id: 13, toolId: 13, toolNumber: 3, name: '1/8" Ball End Mill', type: 'ball', diameter: 3.175, dimensions: { flute_length: 12, stickout: 22 } },
  { id: 14, toolId: 14, toolNumber: null, name: '60° V-bit', type: 'v-bit', diameter: 12.7 },
  // a tapered ball the way it has to be entered today: as a V-bit, diameter = shank
  { id: 15, toolId: 15, toolNumber: 5, name: '1mm Tapered Ball 3.6° 1/8" shank', type: 'v-bit', diameter: 3.175, dimensions: { flute_length: 25 } }
];
const FIRMWARE = { protocol: 'grblhal', settings: { 20: { value: '0' }, 30: { value: '24000' }, 110: { value: '5000' }, 112: { value: '2500' }, 113: { value: '5400' }, 133: { value: '0' }, 376: { value: '1' } } };

// the controller and the Manual Tool Changer (MachineState.cs: g54 from $#, MPos, max travel;
// ncsender-plugin-manualtoolchanger settings: parking = tool change position, toolSetter)
let MACHINE = { connected: true, status: 'Idle', tool: 1, workspace: 'G54', g54: '-300.000,-200.000,-80.000,0.000', g55: '0.000,0.000,0.000,0.000', MPos: '-150.000,-200.000,-10.000', WCO: '-300.000,-200.000,-80.000', maxTravelX: 800, maxTravelY: 600, maxTravelZ: 130, homed: true };
let MTC = { installed: true, enabled: true, settings: { parking: { x: -560, y: -380, z: 0 }, toolSetter: { x: -400, y: -100, z: -50 } } };
let SAFEZ = -5;
// PluginManager.CheckUpdateAsync: the newest GitHub release of the manifest's repository
const MANIFEST = JSON.parse(readFileSync(join(PLUGIN_DIR, 'manifest.json'), 'utf8'));
let UPDATE = { currentVersion: MANIFEST.version, latestVersion: MANIFEST.version, updateAvailable: false, releaseUrl: '', downloadUrl: '' };
let UPDATED = 0;
// the controller's side of /api/send-command (ServerBuilder.cs): modal units, grblHAL named
// parameters and expressions (as ncSender's own probe routines use them), G10 L2 work offsets
// (kept in mm, the way $# reports them). noExpr: a controller without expressions.
let CTRL = { metric: true, params: {}, noExpr: false };
const COMMANDS = [];
function runLine(line) {
  const l = String(line).trim(), err = (e) => ({ status: 'error', errorMessage: e });
  let m = l.match(/^#<(_?\w+)>\s*=\s*\[(.*)\]$/);
  if (m) {
    if (CTRL.noExpr) return err('error:3');
    const expr = m[2].replace(/#<_metric>/g, CTRL.metric ? '1' : '0').replace(/#<(_?\w+)>/g, (q, n) => String(CTRL.params[n] ?? 0));
    if (!/^[\d\s+\-*/.()]+$/.test(expr)) return err('error:bad expression');
    CTRL.params[m[1]] = Function('return (' + expr + ')')();
    return { status: 'success' };
  }
  m = l.match(/^G\[#<(_?\w+)>\]$/i);
  if (m) {
    if (CTRL.noExpr) return err('error:3');
    const g = CTRL.params[m[1]];
    if (g === 20) CTRL.metric = false; else if (g === 21) CTRL.metric = true; else return err('error:20');
    return { status: 'success' };
  }
  const words = [...l.toUpperCase().matchAll(/([A-Z])\s*(-?[\d.]+)/g)].map((w) => [w[1], parseFloat(w[2])]);
  const gs = words.filter((w) => w[0] === 'G').map((w) => w[1]), val = (c) => { const w = words.find((q) => q[0] === c); return w ? w[1] : undefined; };
  if (gs.includes(21)) CTRL.metric = true;
  if (gs.includes(20)) CTRL.metric = false;
  if (gs.includes(10)) {
    if (val('L') !== 2) return err('error:only L2 here');
    const P = val('P') || 1, ws = 'g5' + (3 + P), f = CTRL.metric ? 1 : 25.4;
    const cur = String(MACHINE[ws] || '0,0,0,0').split(',').map(Number);
    ['X', 'Y', 'Z', 'A'].forEach((c, i) => { const v = val(c); if (v !== undefined) cur[i] = v * (c === 'A' ? 1 : f); });
    MACHINE[ws] = cur.map((v) => v.toFixed(3)).join(',');
  }
  return { status: 'success' };
}
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
  if (p === '/api/settings') return json(res, { unitsPreference: UNITS, safeZHeight: SAFEZ, tool: { numbering: 'slot' } });
  if (p === '/api/plugins') return json(res, [{ id: ID, name: 'Rotary CAM', enabled: true }].concat(MTC.installed ? [{ id: 'com.ncsender.manualtoolchange', name: 'Manual Tool Changer', enabled: MTC.enabled }] : []));
  if (p === '/api/plugins/com.ncsender.manualtoolchange/settings') { if (!MTC.installed) { res.writeHead(404); return res.end(); } return json(res, MTC.settings); }
  if (p === `/api/plugins/${ID}/check-update`) return json(res, UPDATE);
  if (p === `/api/plugins/${ID}/update` && req.method === 'POST') { UPDATED++; return json(res, { success: true }); }
  if (p === '/__test/update' && req.method === 'POST') { UPDATE = Object.assign(UPDATE, JSON.parse(await body(req))); return json(res, { UPDATE, UPDATED }); }
  if (p === '/__test/updated') return json(res, { UPDATED });
  if (p === '/api/send-command' && req.method === 'POST') { const b = JSON.parse(await body(req)); COMMANDS.push(b.command); return json(res, Object.assign({ id: String(COMMANDS.length), command: b.command }, runLine(b.command))); }
  if (p === '/__test/commands') return json(res, { commands: COMMANDS, metric: CTRL.metric, machine: MACHINE });
  if (p === '/__test/machine' && req.method === 'POST') { const b = JSON.parse(await body(req)); if (b.ctrl) CTRL = Object.assign(CTRL, b.ctrl); if (b.machine) MACHINE = Object.assign(MACHINE, b.machine); if (b.mtc) MTC = Object.assign(MTC, b.mtc); if (b.safeZ !== undefined) SAFEZ = b.safeZ; return json(res, { MACHINE, MTC, SAFEZ }); }
  if (p === '/__test/units' && req.method === 'POST') { UNITS = (await body(req)).trim(); return json(res, { units: UNITS }); }
  if (p === '/api/tools') return json(res, LIBRARY);
  if (p === '/api/firmware') return json(res, FIRMWARE);
  if (p === '/api/server-state') return json(res, { machineState: MACHINE, senderStatus: 'idle' });
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
  if (p === '/__test/settings' && req.method === 'POST') { pluginSettings = JSON.parse(await body(req)); return json(res, pluginSettings); }
  if (p === '/__test/settings') return json(res, pluginSettings);
  if (p === '/__test/log') return json(res, log);
  if (p === '/__test/firmware' && req.method === 'POST') { Object.assign(FIRMWARE.settings, JSON.parse(await body(req))); return json(res, FIRMWARE); }
  res.writeHead(404); res.end();
}).listen(PORT, () => console.log(`harness on http://localhost:${PORT}`));
