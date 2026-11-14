// Probe the chuck (lib/chuck-probe.js) against a pretend machine (test/harness/probe-machine.cjs):
// the work zero it sets is the true axis and jaw face, with a 3D probe or a bit, with and
// without a chuck that runs off true, every mode on its own, and the ways it should stop.
// node test/probe-test.js
'use strict';
const P = require('../lib/chuck-probe.js');
const { makeMachine } = require('./harness/probe-machine.cjs');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };

const JOB = { rig: { chuck: { dia: 100 }, nut: { dia: 35 } }, stock: { shape: 'round', dia: 40 } };
const PROBE3D = { what: 'xyz', tool: '3d', ball: 2, probe_dia: 25, probe_reach: 30, body: 80, ahead: 30, half: false };
const BIT = { what: 'xyz', tool: 'bit', bit_dia: 6.35, bit_shape: 'flat', bit_reach: 30, body: 80, ahead: 30, half: false };

// start above the body, 15 mm behind its face, off the middle, a few mm above the top
function machine(w, start) {
  const M = makeMachine(w);
  const c = M.w;
  M.S.m = Object.assign({ x: c.bodyX1 - 15, y: c.axisY + 2.5, z: c.axisZ + c.bodyR + 6, a: 0 }, start || {});
  M.S.wco = { x: -290, y: -190, z: -70, a: 0 };     // somewhere else to start with
  return M;
}
function io(M) {
  const steps = [];
  return {
    steps,
    job(lines) {
      for (const l of lines) {
        const r = M.exec(l);
        if (r.alarm) return Promise.reject(new Error('ALARM:' + r.alarm));
        if (r.error) return Promise.reject(new Error(r.error));
      }
      return Promise.resolve();
    },
    pos() { return Promise.resolve(M.pos()); },
    step(t) { steps.push(t); }
  };
}
async function go(name, w, p, start) {
  console.log(name);
  const M = machine(w, start), o = P.resolve(JOB, p);
  if (o.err.length) { console.log('  settings: ' + o.err.map((e) => e.t).join(' / ')); return { M, o, err: new Error('settings') }; }
  try { const res = await P.run(o, io(M)); return { M, o, res }; } catch (e) { return { M, o, err: e }; }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;

(async () => {
  let r;
  r = await go('3D probe, XYZ, a chuck that runs true', { tip: 'ball', tr: 1, holderR: 12.5, reach: 30, conductive: 'all', axisY: -200.37, axisZ: -78.9 }, PROBE3D);
  ok(!r.err, 'runs' + (r.err ? ': ' + r.err.message : ''));
  if (!r.err) {
    ok(near(r.M.S.wco.y, -200.37, 0.002), 'Y0 on the axis (' + r.M.S.wco.y.toFixed(4) + ')');
    ok(near(r.M.S.wco.z, -78.9, 0.002), 'Z0 on the axis (' + r.M.S.wco.z.toFixed(4) + ')');
    ok(near(r.M.S.wco.x, r.M.jawFace(), 0.002), 'X0 at the jaw face (' + r.M.S.wco.x.toFixed(4) + ' / ' + r.M.jawFace() + ')');
    ok(r.res.set.x && r.res.set.y && r.res.set.z, 'says X, Y and Z were set');
    ok(near(r.res.dia, 80, 0.05), 'measures the chuck about 80 across (' + r.res.dia.toFixed(3) + ')');
    ok(!r.res.notes.length, 'no notes');
    ok(r.M.S.abs && r.M.S.metric, 'leaves the controller in G90 (absolute)');
    ok(r.M.S.m.z > r.M.S.wco.z + 50, 'ends up clear of the jaws');
  }

  r = await go('bit and clip, flat 6.35, XYZ', { tip: 'flat', tr: 3.175, holderR: 17.5, reach: 30, conductive: 'chuck', axisY: -199.8, axisZ: -81.2 }, BIT);
  ok(!r.err, 'runs' + (r.err ? ': ' + r.err.message : ''));
  if (!r.err) {
    ok(near(r.M.S.wco.y, -199.8, 0.002) && near(r.M.S.wco.z, -81.2, 0.002) && near(r.M.S.wco.x, r.M.jawFace(), 0.002), 'X0 Y0 Z0 right (' + [r.M.S.wco.x, r.M.S.wco.y, r.M.S.wco.z].map((v) => v.toFixed(4)).join(' ') + ')');
    ok(near(r.res.dia, 80, 0.05), 'measures about 80 (' + r.res.dia.toFixed(3) + ')');
  }

  const RUN = { tip: 'ball', tr: 1, holderR: 12.5, reach: 30, conductive: 'all', runout: 0.15, runPhase: 30 };
  r = await go('chuck 0.15 off true, no half turn', RUN, Object.assign({}, PROBE3D, { what: 'yz' }));
  ok(!r.err, 'runs');
  const offNo = r.err ? 0 : Math.hypot(r.M.S.wco.y + 200, r.M.S.wco.z + 80);
  ok(offNo > 0.1, 'is off by the runout without the half turn (' + offNo.toFixed(3) + ')');
  r = await go('chuck 0.15 off true, half turn', RUN, Object.assign({}, PROBE3D, { what: 'yz', half: true }));
  ok(!r.err, 'runs' + (r.err ? ': ' + r.err.message : ''));
  if (!r.err) {
    ok(near(r.M.S.wco.y, -200, 0.002) && near(r.M.S.wco.z, -80, 0.002), 'the half turn finds the true axis (' + r.M.S.wco.y.toFixed(4) + ', ' + r.M.S.wco.z.toFixed(4) + ')');
    ok(near(Math.hypot(r.res.runout.y, r.res.runout.z), 0.15, 0.003), 'says it runs 0.15 off true (' + Math.hypot(r.res.runout.y, r.res.runout.z).toFixed(4) + ')');
    ok(near(r.M.S.m.a, 0, 1e-9), 'turns A back');
    ok(r.M.S.wco.x === -290, 'leaves X alone');
  }
  r = await go('half turn, then X off the jaw', RUN, Object.assign({}, PROBE3D, { half: true }));
  ok(!r.err && near(r.M.S.wco.x, r.M.jawFace(), 0.002) && near(r.M.S.wco.y, -200, 0.002), 'XYZ with the half turn' + (r.err ? ': ' + r.err.message : ''));

  r = await go('Y only', { tip: 'ball', tr: 1, conductive: 'all' }, Object.assign({}, PROBE3D, { what: 'y' }));
  ok(!r.err && near(r.M.S.wco.y, -200, 0.002) && r.M.S.wco.z === -70 && r.M.S.wco.x === -290, 'sets Y only' + (r.err ? ': ' + r.err.message : ''));
  r = await go('Y only, half turn', RUN, Object.assign({}, PROBE3D, { what: 'y', half: true }));
  ok(!r.err && near(r.M.S.wco.y, -200, 0.002), 'Y only with the half turn' + (r.err ? ': ' + r.err.message : ''));

  // Z alone: Y0 is set already (on the axis), start anywhere over the body
  r = await go('Z only (Y set)', { tip: 'ball', tr: 1, conductive: 'all' }, Object.assign({}, PROBE3D, { what: 'z' }));
  if (r.M) { /* (set Y first, the way it would be) */ }
  {
    const M = machine({ tip: 'ball', tr: 1, conductive: 'all' }); M.S.wco.y = -200;
    const o = P.resolve(JOB, Object.assign({}, PROBE3D, { what: 'z' }));
    let e = null; try { await P.run(o, io(M)); } catch (x) { e = x; }
    ok(!e && near(M.S.wco.z, -80, 0.002) && M.S.wco.y === -200 && M.S.wco.x === -290, 'Z only sets Z0' + (e ? ': ' + e.message : ''));
  }
  {
    const M = machine({ tip: 'ball', tr: 1, conductive: 'all' }); M.S.wco.y = -200; M.S.wco.z = -80;
    const o = P.resolve(JOB, Object.assign({}, PROBE3D, { what: 'x' }));
    let e = null; try { await P.run(o, io(M)); } catch (x) { e = x; }
    ok(!e && near(M.S.wco.x, M.jawFace(), 0.002), 'X only sets X0 at the jaw face' + (e ? ': ' + e.message : ''));
  }

  // what should stop it
  r = await go('the diameter typed is the chuck with its jaws', { tip: 'ball', tr: 1, conductive: 'all', bodyR: 40 }, Object.assign({}, PROBE3D, { what: 'yz', body: 84 }));
  ok(!r.err && r.res.notes.length === 1 && /measured about 80/.test(r.res.notes[0]), 'says the chuck measured about 80' + (r.err ? ': ' + r.err.message : r.res.notes[0] ? '' : ''));
  r = await go('started too high', { tip: 'ball', tr: 1, conductive: 'all' }, PROBE3D, { z: -80 + 40 + 30 });
  ok(r.err && /ALARM:5/.test(r.err.message), 'nothing to touch: alarm 5 (' + (r.err && r.err.message) + ')');
  r = await go('the jaw face is further than set', { tip: 'ball', tr: 1, conductive: 'all' }, Object.assign({}, PROBE3D, { ahead: 15 }));
  ok(r.err && /came down on the jaw/.test(r.err.message), 'stops on the jaw, says so (' + (r.err && r.err.message.slice(0, 60)) + ')');
  ok(r.M && !r.M.S.crash, 'no crash');
  r = await go('the jaw face nearer than set (by 15)', { tip: 'ball', tr: 1, conductive: 'all' }, Object.assign({}, PROBE3D, { ahead: 48 }));
  ok(!r.err && near(r.M.S.wco.x, r.M.jawFace(), 0.002), 'still finds it' + (r.err ? ': ' + r.err.message : ''));
  r = await go('start 12 off the middle', { tip: 'ball', tr: 1, conductive: 'all' }, Object.assign({}, PROBE3D, { what: 'yz' }), { y: -188 });
  ok(!r.err && near(r.M.S.wco.y, -200, 0.002) && near(r.M.S.wco.z, -80, 0.002), 'still right' + (r.err ? ': ' + r.err.message : ''));
  r = await go('start 25 off the middle', { tip: 'ball', tr: 1, conductive: 'all' }, Object.assign({}, PROBE3D, { what: 'yz' }), { y: -175 });
  ok(r.err && /middle/.test(r.err.message) && !r.M.S.crash, 'stops before it hits anything, says start nearer the middle (' + (r.err ? r.err.message.slice(0, 70) : 'ran') + ')');

  // settings checks
  let o = P.resolve(JOB, Object.assign({}, BIT, { bit_reach: 2 }));
  ok(o.err.some((e) => e.k === 'bit_reach'), 'a bit too short for the nut to clear: says stick it out further (' + (o.err[0] && o.err[0].t.slice(-40)) + ')');
  o = P.resolve(JOB, Object.assign({}, PROBE3D, { body: null }));
  ok(o.err.some((e) => e.k === 'body'), 'asks for the chuck diameter');
  o = P.resolve(JOB, Object.assign({}, PROBE3D, { body: 120 }));
  ok(o.err.some((e) => e.k === 'body'), 'a body wider than the chuck with its jaws');
  o = P.resolve(JOB, Object.assign({}, PROBE3D, { what: 'x', body: null }));
  ok(!o.err.length, 'X alone needs no chuck diameter');
  // the holder: every touch with the nut clear in the bit case was checked by the machine (crashes throw)
  console.log(fails ? fails + ' failed' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
