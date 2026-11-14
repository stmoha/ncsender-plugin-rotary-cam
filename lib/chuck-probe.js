/*
 * Rotary CAM - probe the chuck for the work zero. Shared by the plugin dialog and the Node tests.
 * No DOM. Touches both sides of the chuck body, goes to the middle and touches the top: the
 * middle is Y0, and the top less half the chuck's diameter is Z0. Then, with a jaw up (A0),
 * it touches the front of that jaw for X0. "Half turn" does the sides and top again with the
 * chuck turned 180 degrees and averages the two, so a chuck that doesn't run true still gives
 * the true axis (and says by how much it's out).
 *
 * Each touch is a small job of its own (sent through ncSender's probe runner); the machine
 * position is read after each one, and the moves that follow are worked out from it. All of
 * it in mm and relative moves (G21 G91), the way ncSender's own probe routines are; the work
 * offset is set with G10 L20 at the point that was touched, so a tool length offset in force
 * is allowed for.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RotaryCamProbe = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ncSender's feeds for its own probe routines (ThreeDProbeStrategy.cs)
  var FAST = 150, SLOW = 75, BOUNCE = 2;
  var HOP = 2;          // above the top while crossing over it
  var CLEAR = 5;        // beside the chuck before going down
  var XAIR = 10;        // in front of where the jaw face should be before going down
  var XSEARCH = 30;     // how far to look for the jaw face (it can be 20 mm nearer than set, 10 further)

  var MODES = ['xyz', 'yz', 'x', 'y', 'z'];

  function num(v) { v = Number(v); return isFinite(v) ? v : NaN; }
  function f3(v) { var s = (Math.round(v * 1000) / 1000).toFixed(3); return s === '-0.000' ? '0.000' : s; }

  // what's touched where: the settings as numbers (mm), and what's wrong with them
  // p: job.rig.probe; job: the whole job (the chuck and the stock come from it)
  // len: how to write a length in messages (the dialog passes its units); mm by default
  function resolve(job, p, len) {
    var F = len || function (v) { return f1(v) + ' mm'; };
    var rig = job.rig || {}, st = job.stock || {}, err = [];
    var o = {
      what: MODES.indexOf(p.what) >= 0 ? p.what : 'xyz',
      tool: p.tool === 'bit' ? 'bit' : '3d',
      half: !!p.half,
      body: num(p.body),
      jaws: num(rig.chuck && rig.chuck.dia),
      ahead: num(p.ahead),
      rapid: num(p.rapid) > 0 ? num(p.rapid) : 1500
    };
    o.ball = o.tool === '3d' || p.bit_shape === 'ball';
    o.tipDia = o.tool === '3d' ? num(p.ball) : num(p.bit_dia);
    o.tr = o.tipDia / 2;
    // what's wider than the tip above it: the collet nut, or the 3D probe's body
    o.holder = o.tool === '3d' ? num(p.probe_dia) : num(rig.nut && rig.nut.dia);
    o.reach = o.tool === '3d' ? num(p.probe_reach) : num(p.bit_reach);
    var needYZ = o.what !== 'x', needX = o.what === 'xyz' || o.what === 'x', sides = needYZ && o.what !== 'z';
    if (!(o.tipDia > 0)) err.push({ k: o.tool === '3d' ? 'ball' : 'bit_dia', t: o.tool === '3d' ? 'Set the probe’s ball diameter.' : 'Set the bit’s diameter.' });
    if (needYZ) {
      if (!(o.body > 0)) err.push({ k: 'body', t: 'Set the chuck’s diameter: measure the round body behind the jaws with calipers.' });
      else if (o.jaws > 0 && o.body > o.jaws + 0.01) err.push({ k: 'body', t: 'The chuck body can’t be wider than the chuck with its jaws (Rotary & spindle › Chuck). Measure the round body behind the jaws, without them.' });
    }
    if (sides) {
      if (!(o.holder > 0)) err.push({ k: o.tool === '3d' ? 'probe_dia' : 'nut', t: o.tool === '3d' ? 'Set the diameter of the probe’s body.' : 'Set the collet nut’s diameter (Rotary & spindle).' });
      if (!(o.reach > 0)) err.push({ k: o.tool === '3d' ? 'probe_reach' : 'bit_reach', t: o.tool === '3d' ? 'Set how far the ball is below the probe’s body.' : 'Set how far the bit sticks out of the collet nut.' });
    }
    if (needX) {
      if (!(o.jaws > 0)) err.push({ k: 'jaws', t: 'Set the chuck’s diameter with its jaws (Rotary & spindle › Chuck).' });
      if (!(o.ahead > 0)) err.push({ k: 'ahead', t: 'Set roughly how far in front of the tool the jaw face is when you start.' });
      // the top of the stock at A0: the jaw is touched just above it
      var top = st.shape === 'square' ? num(st.width) / 2 : st.shape === 'rect' ? num(st.height) / 2 : num(st.dia) / 2;
      o.stockTop = top > 0 ? top : 0;
      o.xz = num(p.x_height) > 0 ? num(p.x_height) : o.stockTop + 3;
      if (o.jaws > 0 && o.xz > o.jaws / 2 - 2) err.push({ k: 'x_height', t: 'The jaw is touched ' + F(o.xz) + ' above the axis, too near the top of the jaws (' + F(o.jaws / 2) + '): set Touch the jaw at lower.' });
    }
    if (sides && !err.length) {
      var dd = depth(o);
      o.dmax = dd.max; o.d = dd.d;
      if (!(o.d >= 1.5)) err.push({ k: o.tool === '3d' ? 'probe_reach' : 'bit_reach', t: 'The ' + (o.tool === '3d' ? 'ball doesn’t reach far enough below the probe’s body' : 'bit doesn’t stick out far enough below the collet nut') + ' to touch the sides of a chuck this size without the ' + (o.tool === '3d' ? 'body' : 'nut') + ' hitting it. ' + (o.tool === '3d' ? 'Use a longer stylus.' : 'Stick it out further (about ' + F(dd.need) + ').') });
    }
    o.err = err; o.F = F;
    return o;
  }
  function f1(v) { return (Math.round(v * 10) / 10).toFixed(1); }

  // How far below the top the sides can be touched: the holder (collet nut or probe body)
  // must stay 2 mm above the chuck while the tip touches its side. Deeper is steadier, but
  // there's no need to go past a third of the radius.
  function depth(o) {
    var R = o.body / 2, rh = o.holder / 2, want = Math.min(15, Math.max(3, R / 3));
    var ok = function (d) {
      var zt = R - d, yc = chord(o, R, d) + o.tr, yin = yc - rh;
      var s = Math.abs(yin) < R ? Math.sqrt(R * R - yin * yin) : 0;
      if (yin < 0) s = R;
      return zt + o.reach >= s + 2;
    };
    var d = 0;
    for (var t = 0.25; t <= R; t += 0.25) { if (ok(t)) d = t; else break; }
    // the stickout that would allow the depth wanted
    var zt = R - want, yin = chord(o, R, want) + o.tr - rh, s = yin < 0 ? R : Math.abs(yin) < R ? Math.sqrt(R * R - yin * yin) : 0;
    return { max: d, d: Math.min(d, want), need: Math.ceil(s + 2 - zt) };
  }
  // where the tip's centre is from the axis when it touches the side, the tip `d` below the top
  function chord(o, R, d) {
    if (o.ball) { var zb = R - d + o.tr; return Math.sqrt(Math.max(0, (R + o.tr) * (R + o.tr) - zb * zb)) - o.tr; }
    var z = R - d;
    return z <= 0 ? R : Math.sqrt(Math.max(0, R * R - z * z));
  }
  // the chuck's radius from the two side touches: h is half the distance between the tip's
  // centres, d how far below the top the tip was
  function radiusFrom(o, h, d) {
    if (o.ball) return (h * h + d * d - 2 * o.tr * d) / (2 * d);
    var a = h - o.tr;
    if (d >= a) return a;              // touched at or below the axis: the full width
    return (a * a + d * d) / (2 * d);
  }

  // the steps that'll run, for the dialog to list
  function steps(o) {
    var s = [];
    if (o.what === 'z') s.push('Go to Y0 and touch the top');
    if (o.what !== 'x' && o.what !== 'z') s.push('Touch the top, then both sides of the chuck', 'Go to the middle' + (o.what === 'y' ? '' : ' and touch the top'));
    if (o.half && o.what !== 'x') s.push('Turn A 180° and do it again, then turn back');
    if (o.what !== 'x') s.push('Set ' + (o.what === 'y' ? 'Y0' : o.what === 'z' ? 'Z0' : 'Y0 and Z0') + (o.what === 'y' ? ' in the middle' : o.what === 'z' ? ' half the chuck’s diameter below the top' : ''));
    if (o.what === 'xyz' || o.what === 'x') s.push('Turn A to 0 (a jaw up), touch the front of that jaw and set X0');
    return s;
  }

  // ---- the run
  // io.job(lines) runs lines as one probe job and resolves when the controller has done them;
  // io.pos() resolves to the machine position {x, y, z} (mm) once it's idle; io.step(text)
  // says what's happening; io.stopped() is true once Stop was pressed.
  function run(o, io) {
    if (!o.F) o.F = function (v) { return f1(v) + ' mm'; };
    var R = o.body / 2, tr = o.tr, d = o.d, res = { set: {}, notes: [] };
    var J = function (lines) { if (io.stopped && io.stopped()) return Promise.reject(new Error('stopped')); return io.job(['G21 G91'].concat(lines)); };
    var at = function () { return io.pos(); };
    // a touch: fast, back off, slow; resolves to the position touched
    var touch = function (ax, dir, dist) {
      return J(['G38.2 ' + ax + f3(dir * dist) + ' F' + FAST, 'G0 ' + ax + f3(-dir * BOUNCE), 'G38.2 ' + ax + f3(dir * (BOUNCE + 1)) + ' F' + SLOW]).then(at);
    };
    // a move that stops if it touches anything; it must not
    var guarded = function (ax, dist, what) {
      var from;
      return at().then(function (p) { from = p; return J(['G38.3 ' + ax + f3(dist) + ' F' + Math.round(o.rapid)]); }).then(at).then(function (p) {
        var k = ax.toLowerCase(), moved = p[k] - from[k];
        if (Math.abs(moved - dist) > 0.05) throw new Error(what);
        return p;
      });
    };
    var say = function (t) { if (io.step) io.step(t); };
    var LANDED = 'The tool touched something on the way down beside the chuck: start closer to the middle of the chuck (in Y), and check its diameter.';
    var ACROSS = 'The tool touched something going out to the side of the chuck: start it a few mm above the top of the chuck, over the middle.';

    // one pass over the chuck as it is: the sides at depth d, the middle, the top there
    function pass(first) {
      var r = {}, c = chord(o, R, d), out = R + tr + CLEAR;
      say(first ? 'Touching the top of the chuck' : 'Touching the top again');
      return touch('Z', -1, first ? 25 : HOP + 8).then(function (p) {
        r.top0 = p.z;
        return J(['G0 Z' + f3(HOP)]);
      }).then(function () { say('Touching the front (−Y) side'); return guarded('Y', -out, ACROSS); })
        .then(function () { return guarded('Z', -(HOP + d), LANDED); })
        .then(function () { return touch('Y', 1, R - c + CLEAR + 10); })
        .then(function (p) {
          r.y1 = p.y;
          return J(['G0 Y' + f3(-BOUNCE), 'G0 Z' + f3(HOP + d)]);
        }).then(function () { say('Touching the back (+Y) side'); return guarded('Y', out + c + tr + BOUNCE, ACROSS); })
        .then(function () { return guarded('Z', -(HOP + d), LANDED); })
        .then(function () { return touch('Y', -1, R - c + CLEAR + 10); })
        .then(function (p) {
          r.y2 = p.y; r.mid = (r.y1 + r.y2) / 2;
          if (!(r.y2 > r.y1)) throw new Error('The two sides came out the wrong way round: check the probe and start again.');
          say('Going to the middle');
          return J(['G0 Y' + f3(BOUNCE), 'G0 Z' + f3(HOP + d), 'G0 Y' + f3(r.mid - (r.y2 + BOUNCE))]);
        }).then(function () {
          if (o.what === 'y') return at();
          say('Touching the top in the middle');
          return touch('Z', -1, HOP + 8);
        }).then(function (p) {
          r.at = p;
          if (o.what !== 'y') {
            r.top = p.z;
            // the chuck's diameter from where the sides were touched (a check on the one typed)
            var dAct = d + (r.top - r.top0);
            r.dia = 2 * radiusFrom(o, (r.y2 - r.y1) / 2, dAct);
          }
          return r;
        });
    }
    // the top alone, at Y0 (Y is set already)
    function topOnly(first) {
      say(first ? 'Going to Y0 and touching the top' : 'Touching the top again');
      var go = first ? io.job(['G21 G90', 'G0 Y0']) : Promise.resolve();
      return go.then(function () { return touch('Z', -1, first ? 25 : HOP + 8); }).then(function (p) { return { at: p, top: p.z, mid: p.y }; });
    }
    // up clear of the jaws, A by `deg`, and back down above the top
    function turn(deg, down) {
      var up = o.jaws / 2 - R + CLEAR;
      say(deg > 0 ? 'Turning A 180°' : 'Turning A back');
      return J(['G0 Z' + f3(Math.max(up, HOP + 3)), 'G0 A' + f3(deg)]).then(function () {
        return down ? guarded('Z', -(Math.max(up, HOP + 3) - HOP - 1), 'The tool touched the chuck coming back down after turning it: it runs too far off true for this, or its diameter is wrong.') : null;
      });
    }

    var chain = Promise.resolve(), a, b;
    if (o.what !== 'x') {
      var one = o.what === 'z' ? topOnly : pass;
      chain = one(true).then(function (r) {
        a = r;
        if (!o.half) return null;
        return turn(180, true).then(function () { return one(false); }).then(function (r2) { b = r2; });
      }).then(function () {
        // set it where the last touch was (the tip is on the top, or above the middle)
        var last = b || a, cur = last.at, mid = b ? (a.mid + b.mid) / 2 : a.mid, top = b ? (a.top + b.top) / 2 : a.top;
        var words = [];
        if (o.what !== 'z') { words.push('Y' + f3(cur.y - mid)); res.set.y = true; }
        if (o.what !== 'y') { words.push('Z' + f3(R + cur.z - top)); res.set.z = true; }
        if (b) res.runout = { y: (a.mid - b.mid) / 2, z: o.what === 'y' ? null : (a.top - b.top) / 2 };
        if (a.dia) res.dia = b && b.dia ? (a.dia + b.dia) / 2 : a.dia;
        say('Setting ' + (o.what === 'y' ? 'Y0' : o.what === 'z' ? 'Z0' : 'Y0 and Z0'));
        return J(['G10 L20 P0 ' + words.join(' ')]);
      }).then(function () {
        if (!o.half) return J(['G0 Z' + f3(HOP + 3)]);
        return turn(-180, false);
      });
    }
    if (o.what === 'xyz' || o.what === 'x') {
      chain = chain.then(function () {
        say('Turning A to 0, a jaw up');
        // clear of the jaws (Y0 Z0 on the axis now), then the jaw up
        return io.job(['G21 G90', 'G0 Z' + f3(o.jaws / 2 + CLEAR), 'G0 Y0', 'G0 A0']);
      }).then(function () { say('Going round to the front of the jaw'); return guarded('X', o.ahead + tr + XAIR, 'The tool touched something moving out in front of the chuck: raise it, or check the chuck’s diameter with its jaws.'); })
        .then(function () {
          return guarded('Z', -(o.jaws / 2 + CLEAR - o.xz), 'The tool came down on the jaw, not in front of it: the jaw face is further in front of where you started than ' + o.F(o.ahead) + '. Set it bigger.');
        }).then(function () { say('Touching the front of the jaw'); return touch('X', -1, XSEARCH); })
        .then(function () { say('Setting X0'); return J(['G10 L20 P0 X' + f3(tr)]); })
        .then(function () { res.set.x = true; return J(['G0 X' + f3(BOUNCE)]); })
        .then(function () { return io.job(['G21 G90', 'G0 Z' + f3(o.jaws / 2 + CLEAR)]); });
    }
    return chain.then(function () { return io.job(['G90']); }).then(function () {
      if (res.dia && o.body > 0 && Math.abs(res.dia - o.body) > Math.max(1, 0.02 * o.body))
        res.notes.push('The chuck measured about ' + o.F(res.dia) + ' across where it was touched, and you set ' + o.F(o.body) + '. Z0 is half the diameter below the top, so if that’s wrong, so is Z0: measure the round body behind the jaws with calipers (not the jaws), and check the ' + (o.tool === '3d' ? 'ball' : 'bit') + ' diameter.');
      return res;
    });
  }

  return { MODES: MODES, resolve: resolve, steps: steps, run: run, depth: depth, chord: chord, radiusFrom: radiusFrom, FAST: FAST, SLOW: SLOW };
});
