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
const BIT = { what: 'xyz', tool: 'bit', bit_dia: 6.35, bit_shape: 'flat', flutes: 2, bit_reach: 30, body: 80, ahead: 30, half: false };
const PIN = { what: 'xyz', tool: 'pin', pin_dia: 6.35, pin_reach: 38, body: 80, ahead: 30, half: false };

// start above the body, 15 mm behind its face, off the middle, a few mm above the top
function machine(w, start) {
  const M = makeMachine(w);
  const c = M.w;
  M.S.m = Object.assign({ x: c.bodyX1 - 15, y: c.axisY + 2.5, z: c.axisZ + c.bodyR + 6, a: 0 }, start || {});
  M.S.wco = { x: -290, y: -190, z: -70, a: 0 };     // somewhere else to start with
  return M;
}
function io(M) {
  const steps = [], asked = [];
  return {
    steps, asked,
    ask(t) { asked.push(t); return Promise.resolve(); },
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
async function go(name, w, p, start, job) {
  console.log(name);
  const M = machine(w, start), o = P.resolve(job || JOB, p), I = io(M);
  if (o.err.length) { console.log('  settings: ' + o.err.map((e) => e.t).join(' / ')); return { M, o, err: new Error('settings') }; }
  try { const res = await P.run(o, I); return { M, o, res, I }; } catch (e) { return { M, o, err: e, I }; }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;

(async () => {
  let r, o;
  r = await go('3D probe, XYZ, a chuck that runs true', { tip: 'ball', tr: 1, holderR: 12.5, reach: 30, conductive: 'all', axisY: -200.37, axisZ: -78.9 }, PROBE3D);
  ok(!r.err, 'runs' + (r.err ? ': ' + r.err.message : ''));
  if (!r.err) {
    ok(near(r.M.S.wco.y, -200.37, 0.002), 'Y0 on the axis (' + r.M.S.wco.y.toFixed(4) + ')');
    ok(near(r.M.S.wco.z, -78.9, 0.002), 'Z0 on the axis (' + r.M.S.wco.z.toFixed(4) + ')');
    ok(near(r.M.S.wco.x, r.M.jawFace(), 0.002), 'X0 at the jaw face (' + r.M.S.wco.x.toFixed(4) + ' / ' + r.M.jawFace() + ')');
    ok(r.res.set.x && r.res.set.y && r.res.set.z, 'says X, Y and Z were set');
  }
  // 0.14.0: X0 5/16" in front of the jaw face (the rotary's x0_ahead)
  r = await go('3D probe, XYZ, X0 5/16" in front of the jaw face', { tip: 'ball', tr: 1, holderR: 12.5, reach: 30, conductive: 'all', axisY: -200.37, axisZ: -78.9 }, PROBE3D, null,
    { rig: { chuck: { dia: 100 }, nut: { dia: 35 }, x0_ahead: 7.9375 }, stock: { shape: 'round', dia: 40 } });
  ok(!r.err, 'runs' + (r.err ? ': ' + r.err.message : ''));
  if (!r.err) {
    ok(near(r.M.S.wco.x, r.M.jawFace() + 7.9375, 0.002), 'X0 7.9375 mm in front of the jaw face (' + r.M.S.wco.x.toFixed(4) + ' / ' + r.M.jawFace() + ')');
    ok(near(r.M.S.wco.y, -200.37, 0.002) && near(r.M.S.wco.z, -78.9, 0.002), 'Y0 Z0 still on the axis');
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

  // a pin, 1.5" out of the nut: deep enough to touch the sides at the axis
  const NUT = { tip: 'flat', tr: 3.175, holderR: 17.5, reach: 38, conductive: 'chuck', axisY: -200.2, axisZ: -79.7 };
  r = await go('pin, sides touched at the axis', NUT, Object.assign({}, PIN, { depth: 40 }));
  ok(!r.err && near(r.M.S.wco.x, r.M.jawFace(), 0.002) && near(r.M.S.wco.y, -200.2, 0.002) && near(r.M.S.wco.z, -79.7, 0.002), 'pin: X0 Y0 Z0 right' + (r.err ? ': ' + r.err.message : ''));
  ok(r.o.dmax >= 40 && r.o.d === 40, 'with 38 out of a 35 nut it may go down to the axis (most ' + r.o.dmax + ')');
  ok(!r.err && near(r.res.dia, 80, 0.01), 'touched at the axis it measures the diameter itself (' + (r.res && r.res.dia.toFixed(3)) + ')');
  ok(!r.I.asked.length, 'a pin needs no turning by hand');
  r = await go('pin, auto depth', NUT, PIN);
  ok(!r.err && r.o.d === 20, 'left empty, half way down to the axis (' + r.o.d + ')');
  // a fluted bit: it stops to be turned, front-back for the sides, left-right for the top and X
  r = await go('fluted bit, XYZ with the half turn', { tip: 'flat', tr: 3.175, holderR: 17.5, reach: 30, conductive: 'chuck', runout: 0.1, runPhase: 10 }, Object.assign({}, BIT, { half: true }));
  ok(!r.err && near(r.M.S.wco.y, -200, 0.002) && near(r.M.S.wco.z, -80, 0.002), 'right' + (r.err ? ': ' + r.err.message : ''));
  const kinds = (r.I.asked || []).map((t) => (/front and back/.test(t) ? 'FB' : 'LR')).join(' ');
  ok(kinds === 'FB LR FB LR', 'asks to turn it before each kind of touch: ' + kinds);
  {
    const M = machine({ tip: 'flat', tr: 3.175, holderR: 17.5, reach: 30, conductive: 'chuck' }); M.S.wco.y = -200; M.S.wco.z = -80;
    const I = io(M); await P.run(P.resolve(JOB, Object.assign({}, BIT, { what: 'x' })), I);
    ok(I.asked.length === 1 && /left and right/.test(I.asked[0]) && near(M.S.wco.x, M.jawFace(), 0.002), 'X alone: one turn (edges left and right), X0 right');
  }

  // settings checks
  o = P.resolve(JOB, Object.assign({}, PIN, { depth: 45 }));
  ok(o.err.some((e) => e.k === 'depth' && /axis/.test(e.t)), 'no lower than the axis: ' + (o.err[0] && o.err[0].t));
  o = P.resolve(JOB, Object.assign({}, PIN, { pin_reach: 15, depth: 30 }));
  ok(o.err.some((e) => e.k === 'depth' && /most/.test(e.t)), 'deeper than the nut allows: ' + (o.err[0] && o.err[0].t));
  o = P.resolve(JOB, Object.assign({}, BIT, { flutes: 3 }));
  ok(o.err.some((e) => e.k === 'flutes'), 'a 3-flute bit can\u2019t do the sides');
  o = P.resolve(JOB, Object.assign({}, BIT, { flutes: 3, what: 'x' }));
  ok(!o.err.length, 'but it can do X');
  // the stock: the tip comes down in front of the jaw, over it
  o = P.resolve(JOB, PIN);
  ok(o.stockIn && near(o.xz, 23, 1e-9) && near(o.stockGap, 3, 1e-9) && P.steps(o).some((t) => /3\.0 mm above the stock/.test(t.t)), 'the stock is taken to be in the chuck: the jaw is touched 3 above it');
  o = P.resolve(JOB, Object.assign({}, PIN, { x_below: 20 }));
  ok(o.err.some((e) => e.k === 'x_below' && /come down on the stock/.test(e.t) && /18\.0 mm or less/.test(e.t) && /Stock in the chuck off/.test(e.t)), 'touching the jaw at the height of the stock’s top: refused (' + (o.err[0] && o.err[0].t) + ')');
  o = P.resolve(JOB, Object.assign({}, PIN, { x_below: 19 }));
  ok(o.err.some((e) => e.k === 'x_below' && /within 2\.0 mm of the stock/.test(e.t)), 'and 1 mm above it: too close, refused');
  o = P.resolve(JOB, Object.assign({}, PIN, { x_below: 18 }));
  ok(!o.err.length, '2 mm above it is allowed');
  o = P.resolve(JOB, Object.assign({}, PIN, { x_below: 22, stock_in: false }));
  ok(!o.err.length && !o.stockIn, 'Stock in the chuck off: lower is allowed');
  o = P.resolve({ rig: JOB.rig, stock: { shape: 'round', dia: 94 } }, PIN);
  ok(o.err.some((e) => e.k === 'stock_in' && /before the stock goes in/.test(e.t)), 'stock nearly as big as the jaws: says to set X0 before it goes in (' + (o.err[0] && o.err[0].t.slice(0, 60)) + '…)');
  {
    // told the stock isn't in when it is: it stops on the way down and says what it found
    const M = machine({ tip: 'flat', tr: 3.175, holderR: 17.5, reach: 38, conductive: 'all' }, { z: -80 + 40 + 6 });
    const oo = P.resolve(JOB, Object.assign({}, PIN, { what: 'x', x_below: 25, stock_in: false }));
    M.S.wco = { x: -290, y: -200, z: -80, a: 0 };
    let er = null;
    try { await P.run(oo, io(M)); } catch (e) { er = e; }
    ok(er && /the stock, if it’s in the chuck/.test(er.message) && !M.S.crash, 'stock in the way after all: stops at it, no crash, says so (' + (er && er.message.slice(0, 70)) + '…)');
  }
  o = P.resolve(JOB, PIN);
  ok(near(o.xMove, 30 + 3.175 + 10, 1e-9) && o.xUp === 55 && P.steps(o).some((t) => /Move X\+ 43\.2 mm/.test(t.t) && t.ph === 'x') && P.steps(o)[0].ph === 'yz', 'says how far it moves in X: ' + P.steps(o).find((t) => /Move X/.test(t.t)).t);
  o = P.resolve(JOB, Object.assign({}, BIT, { bit_reach: 2 }));
  ok(o.err.some((e) => e.k === 'bit_reach'), 'a bit too short for the nut to clear: says stick it out further (' + (o.err[0] && o.err[0].t.slice(-40)) + ')');
  o = P.resolve(JOB, Object.assign({}, PROBE3D, { body: null }));
  ok(o.err.some((e) => e.k === 'body'), 'asks for the chuck diameter');
  o = P.resolve(JOB, Object.assign({}, PROBE3D, { body: 120 }));
  ok(o.err.some((e) => e.k === 'body'), 'a body wider than the chuck with its jaws');
  o = P.resolve(JOB, Object.assign({}, PROBE3D, { what: 'x', body: null }));
  ok(!o.err.length, 'X alone needs no chuck diameter');
  // the X touch: the gap left to the jaw face is a setting; the nut mustn't come down on the jaw
  o = P.resolve(JOB, Object.assign({}, PIN, { past: 16 }));
  ok(near(o.xMove, 30 + 3.175 + 16, 1e-9) && o.xSearch === 36 && !o.err.length, 'Clear of the jaw face by 16: X moves ' + o.xMove.toFixed(3) + ', feels back up to ' + o.xSearch);
  o = P.resolve(JOB, Object.assign({}, PIN, { past: 1 }));
  ok(o.err.some((e) => e.k === 'past'), 'a gap under 2 mm is refused');
  o = P.resolve(JOB, Object.assign({}, PIN, { pin_reach: 20 }));
  ok(!o.err.some((e) => e.k === 'x_below') && o.xz === 32 && near(o.jawGap, 2, 1e-9), 'a pin 20 out of the nut: the jaw is touched 32 above the axis (auto), so the nut clears jaws that reach 50 by 2');
  o = P.resolve(JOB, Object.assign({}, PIN, { pin_reach: 20, x_below: 17 }));
  ok(o.err.some((e) => e.k === 'x_below' && /come down on the jaw/.test(e.t)), 'typed lower than that: refused, says why (' + (o.err.find((e) => e.k === 'x_below') || {}).t + ')');
  o = P.resolve(JOB, Object.assign({}, PIN, { pin_reach: 3 }));
  ok(o.err.some((e) => /doesn’t stick out far enough to touch the front of a jaw/.test(e.t)), 'a pin too short to reach the jaw at all');
  o = P.resolve(JOB, Object.assign({}, PIN, { what: 'x', pin_reach: null }));
  ok(o.err.some((e) => e.k === 'pin_reach'), 'X alone needs the stickout too');
  {
    // jaws that really reach 50, a nut 35 across, the pin 20 out: it comes down clear and finds the face
    const M = machine({ tip: 'flat', tr: 3.175, holderR: 17.5, reach: 20, conductive: 'chuck', jawOut: 50 }); M.S.wco.y = -200; M.S.wco.z = -80;
    let e = null; try { await P.run(P.resolve(JOB, Object.assign({}, PIN, { what: 'x', pin_reach: 20, past: 6 })), io(M)); } catch (x) { e = x; }
    ok(!e && !M.S.crash && near(M.S.wco.x, M.jawFace(), 0.002), 'run on a machine with those jaws: no crash, X0 on the jaw face' + (e ? ': ' + e.message : ''));
  }
  // the holder: every touch with the nut clear in the bit case was checked by the machine (crashes throw)
  console.log(fails ? fails + ' failed' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
