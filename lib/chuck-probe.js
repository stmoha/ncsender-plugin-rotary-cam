/*
 * Rotary CAM - probe the chuck for the work zero. Shared by the plugin dialog and the Node tests.
 * No DOM. Touches both sides of the chuck body, goes to the middle and touches the top: the
 * middle is Y0, and the top less half the chuck's diameter is Z0. Then, with a jaw up (A0),
 * it touches the front of that jaw for X0. "Half turn" does the sides and top again with the
 * chuck turned 180 degrees and averages the two, so a chuck that doesn't run true still gives
 * the true axis (and says by how much it's out).
 *
 * Touch with a round pin (a dowel pin or drill blank, the clip on it), a 3D probe, or a
 * fluted bit. A fluted bit isn't round standing still: what touches is whichever part of
 * it sticks out furthest, so it stops for you to turn it by hand, cutting edges front and
 * back for the sides and left and right for the top and the jaw face.
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
  var CLEAR = 5;        // clear of the jaws
  var SIDE = 14;        // beside the chuck before going down (room for starting up to 10 mm off the middle)
  var XAIR = 10;        // the gap left to where the jaw face should be before going down (the `past` setting)
  var XFEEL = 20;       // it feels back for the jaw face this much further than that gap
  var KEEP = 2;         // the collet nut (or the probe's body) stays this far off the chuck
  var TYPES = ['pin', '3d', 'bit'];

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
      tool: TYPES.indexOf(p.tool) >= 0 ? p.tool : 'pin',
      half: !!p.half,
      body: num(p.body),
      jaws: num(rig.chuck && rig.chuck.dia),
      ahead: num(p.ahead),
      // X0 this far in front of the jaw face (the rotary's x0_ahead), toward the part
      x0: num(rig.x0_ahead) > 0 ? num(rig.x0_ahead) : 0,
      rapid: num(p.rapid) > 0 ? num(p.rapid) : 2000
    };
    if (p.rapid !== null && p.rapid !== undefined && p.rapid !== '' && !(num(p.rapid) >= 100)) err.push({ k: 'rapid', t: 'Set Speed between touches to at least 100 mm/min (4 in/min), or leave it empty for ncSender’s own probe speed.' });
    var T = o.tool, K = { pin: ['pin_dia', 'pin_reach'], '3d': ['ball', 'probe_reach'], bit: ['bit_dia', 'bit_reach'] }[T];
    o.ball = T === '3d' || (T === 'bit' && p.bit_shape === 'ball');
    o.tipDia = num(p[K[0]]);
    o.tr = o.tipDia / 2;
    o.flutes = T === 'bit' ? (Number(p.flutes) > 0 ? Number(p.flutes) : 2) : 0;
    // what's wider than the tip above it: the collet nut, or the 3D probe's body
    o.holder = T === '3d' ? num(p.probe_dia) : num(rig.nut && rig.nut.dia);
    o.holderLen = T === '3d' ? 21 : num(rig.nut && rig.nut.len);
    o.reach = num(p[K[1]]);
    o.kTip = K[0]; o.kReach = K[1];
    var tipName = T === '3d' ? 'the probe\u2019s ball' : T === 'pin' ? 'the pin' : 'the bit';
    var needYZ = o.what !== 'x', needX = o.what === 'xyz' || o.what === 'x', sides = needYZ && o.what !== 'z';
    o.sides = sides; o.needX = needX;
    if (!(o.tipDia > 0)) err.push({ k: K[0], t: 'Set the diameter of ' + tipName + '.' });
    if (sides && T === 'bit' && o.flutes % 2) err.push({ k: 'flutes', t: 'A ' + o.flutes + '-flute bit can\u2019t find the middle of the chuck: standing still, its two sides aren\u2019t the same. Use a pin or the 3D probe for Y, or pick Probing \u203a X or Z.' });
    if (needYZ) {
      if (!(o.body > 0)) err.push({ k: 'body', t: 'Set the chuck’s diameter: measure the round body behind the jaws with calipers.' });
      else if (o.jaws > 0 && o.body > o.jaws + 0.01) err.push({ k: 'body', t: 'The chuck body can’t be wider than the chuck with its jaws (Rotary & spindle › Chuck). Measure the round body behind the jaws, without them.' });
    }
    if (sides || needX) {
      if (!(o.holder > 0)) err.push({ k: o.tool === '3d' ? 'probe_dia' : 'nut', t: o.tool === '3d' ? 'Set the diameter of the probe’s body.' : 'Set the collet nut’s diameter (Rotary & spindle).' });
      if (!(o.reach > 0)) err.push({ k: K[1], t: T === '3d' ? 'Set how far the ball is below the probe\u2019s body.' : 'Set how far ' + tipName + ' sticks out of the collet nut.' });
    }
    if (needX) {
      if (!(o.jaws > 0)) err.push({ k: 'jaws', t: 'Set the chuck\u2019s diameter with its jaws (Rotary & spindle \u203a Chuck).' });
      if (!(o.ahead > 0)) err.push({ k: 'ahead', t: 'Set roughly how far in front of the tool the jaw face is when you start.' });
      // the top of the stock at A0: the jaw is touched just above it, or higher if the collet
      // nut (or the probe's body) would otherwise come down on the jaw
      var top = st.shape === 'square' ? num(st.width) / 2 : st.shape === 'rect' ? num(st.height) / 2 : num(st.dia) / 2;
      var Rj = o.jaws / 2, over = o.holder / 2 > o.tr;       // the holder hangs over the jaw at the touch
      o.stockTop = top > 0 ? top : 0;
      // the stock is taken to be in the chuck unless told it isn't: the tip comes down in
      // front of the jaw, over the stock, and must stop above it
      o.stockIn = p.stock_in !== false && o.stockTop > 0;
      o.xzMin = over && o.reach > 0 ? Rj + KEEP - o.reach : 0;
      o.xzAuto = Math.max(o.stockTop + 3, o.xzMin);
      // "Touch the jaw at" is measured down from the top of the chuck body, the way the sides are
      var R0 = o.body > 0 ? o.body / 2 : NaN, typed = p.x_below !== null && p.x_below !== undefined && p.x_below !== '' && isFinite(num(p.x_below));
      if (typed && !(R0 > 0)) { typed = false; if (!needYZ) err.push({ k: 'body', t: 'Set the chuck body\u2019s diameter: Touch the jaw at is measured down from its top.' }); }
      o.xz = typed ? R0 - num(p.x_below) : o.xzAuto;
      o.xBelow = R0 - o.xz; o.xBelowAuto = R0 - o.xzAuto;
      var W = function (z) { return R0 > 0 ? F(R0 - z) + ' below the top of the chuck' : F(z) + ' above the axis'; };
      o.xzText = W(o.xz);
      o.stockGap = o.stockIn ? o.xz - o.stockTop : NaN;      // the tip above the stock at the touch
      // the X touch: up clear of the jaws, along X until the tip's edge is `past` beyond where
      // the jaw face should be, down, then back toward the jaw
      o.past = num(p.past) > 0 ? num(p.past) : XAIR;
      o.xUp = Rj + CLEAR; o.xMove = o.ahead + o.tr + o.past; o.xAir = o.past; o.xSearch = o.past + XFEEL;
      o.jawGap = o.reach > 0 ? o.xz + o.reach - Rj : NaN;    // the holder above the top of the jaw
      if (num(p.past) > 0 && num(p.past) < 2) err.push({ k: 'past', t: 'Leave at least 2 mm between the tip and where the jaw face should be.' });
      var OFF = ' If the stock isn\u2019t in the chuck yet, turn Stock in the chuck off.';
      if (o.stockIn && o.jaws > 0 && o.stockTop + KEEP > Rj - 2) err.push({ k: 'stock_in', t: 'The stock comes up to ' + F(o.stockTop) + ' above the axis, too near the top of the jaws (' + F(Rj) + ') to touch the front of a jaw above it. Set X0 before the stock goes in: take it out and turn Stock in the chuck off.' });
      else if (o.stockIn && o.xz < o.stockTop + KEEP - 1e-9) err.push({ k: 'x_below', t: 'Touching the jaw ' + W(o.xz) + ', the tip would come down ' + (o.xz <= o.stockTop ? 'on' : 'within ' + F(KEEP) + ' of') + ' the stock (its top is ' + W(o.stockTop) + '). Set Touch the jaw at to ' + F(R0 - o.stockTop - KEEP) + ' or less, or leave it empty.' + OFF });
      else if (o.jaws > 0 && o.xz > Rj - 2) err.push({ k: typed ? 'x_below' : K[1], t: typed
        ? 'The jaw is touched ' + W(o.xz) + ', too near the top of the jaws: set Touch the jaw at to ' + F(R0 - Rj + 2) + ' or more.'
        : 'The ' + (T === '3d' ? 'ball doesn\u2019t reach far enough below the probe\u2019s body' : 'tip doesn\u2019t stick out far enough') + ' to touch the front of a jaw without the ' + (T === '3d' ? 'body' : 'collet nut') + ' coming down on it. It needs at least ' + F(KEEP + 2) + '.' });
      else if (over && o.reach > 0 && o.jawGap < KEEP - 1e-9) err.push({ k: 'x_below', t: 'Touching the jaw ' + W(o.xz) + ', the ' + (T === '3d' ? 'probe\u2019s body' : 'collet nut') + ' would come down on the jaw (the tip sticks out ' + F(o.reach) + '). Set Touch the jaw at to ' + F(R0 - o.xzMin) + ' or less, or leave it empty.' });
      else if (typed && o.xz < 2) err.push({ k: 'x_below', t: 'The jaw is touched above the axis: set Touch the jaw at to ' + F(R0 - 2) + ' or less.' });
    }
    if (sides && o.body > 0 && o.holder > 0 && o.reach > 0 && o.tr > 0) {
      var dd = depth(o), want = num(p.depth);
      o.dmax = dd.max; o.dAuto = dd.d; o.d = want > 0 ? want : dd.d;
      if (!(dd.max >= 1.5)) err.push({ k: K[1], t: 'The ' + (T === '3d' ? 'ball doesn\u2019t reach far enough below the probe\u2019s body' : (T === 'pin' ? 'pin' : 'bit') + ' doesn\u2019t stick out far enough below the collet nut') + ' to touch the sides of a chuck this size without the ' + (T === '3d' ? 'body' : 'nut') + ' hitting it. ' + (T === '3d' ? 'Use a longer stylus.' : 'Stick it out further (about ' + F(dd.need) + ').') });
      else if (want > 0 && want > o.body / 2 + 1e-9) err.push({ k: 'depth', t: 'The sides are touched at most at the height of the axis, ' + F(o.body / 2) + ' below the top.' });
      else if (want > 0 && want > dd.max + 1e-9) err.push({ k: 'depth', t: 'At ' + F(want) + ' below the top the ' + (T === '3d' ? 'probe\u2019s body' : 'collet nut') + ' would come within 2 mm of the chuck. The most with this ' + (T === '3d' ? 'stylus' : 'stickout') + ' is ' + F(dd.max) + '.' });
      else if (want > 0 && want < 1.5) err.push({ k: 'depth', t: 'Touch the sides at least 1.5 mm below the top.' });
      // how far the holder is above the chuck while the tip touches its side
      o.sideGap = holderGap(o, Math.min(Math.max(o.d, 0.01), o.body / 2));
    }
    o.err = err; o.F = F;
    return o;
  }
  function f1(v) { return (Math.round(v * 10) / 10).toFixed(1); }

  // How far the holder (collet nut or probe body) is above the chuck while the tip touches
  // its side `d` below the top
  function holderGap(o, d) {
    var R = o.body / 2, zt = R - d, yin = chord(o, R, d) + o.tr - o.holder / 2;
    var top = yin < 0 ? R : Math.abs(yin) < R ? Math.sqrt(R * R - yin * yin) : 0;
    return zt + o.reach - top;
  }
  // How far below the top the sides can be touched: the holder must stay 2 mm above the chuck
  // while the tip touches its side; no lower than the axis. Left to itself it goes half way
  // down to the axis (or as far as the holder allows).
  function depth(o) {
    var R = o.body / 2, want = Math.max(3, R / 2), d = 0;
    for (var t = 0.25; t <= R + 1e-9; t += 0.25) { if (holderGap(o, t) >= KEEP) d = t; else break; }
    return { max: d, d: Math.min(d, want), need: Math.ceil(o.reach + KEEP - holderGap(o, want)) };
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

  // what to turn the fluted bit to before each kind of touch
  var TURN_FB = 'Turn the bit by hand so its cutting edges point to the front and back (\u00b1Y), then press Continue. (The spindle is off.)';
  var TURN_LR = 'Turn the bit by hand so its cutting edges point left and right (along X), then press Continue. (The spindle is off.)';

  // the steps that'll run, with the distances, for the dialog to list
  function steps(o) {
    var s = [], F = o.F || function (v) { return f1(v) + ' mm'; }, bit = o.tool === 'bit', list = s;
    // each step with the part of the run it belongs to: 'yz' (the chuck body) or 'x' (the jaw face)
    s = { push: function (t) { list.push({ t: t, ph: /^(Pause: cutting edges left and right$|Lift to|Move X|Go down to)/.test(t) ? 'x' : 'yz' }); } };
    if (o.what === 'z') s.push((bit ? 'Pause: cutting edges left and right. ' : '') + 'Go to Y0 and touch the top');
    if (o.sides) {
      s.push('Touch the top' + (bit ? '; pause: cutting edges front and back' : '') + '; touch the front and back of the chuck' + (o.d > 0 ? ' ' + F(o.d) + ' below the top' : ''));
      s.push(o.what !== 'y' ? 'Go to the middle' + (bit ? '; pause: cutting edges left and right' : '') + '; touch the top' : 'Go to the middle');
    }
    if (o.half && o.what !== 'x') s.push('Lift clear of the jaws, turn A 180\u00b0, do it again, then turn back');
    if (o.what !== 'x') s.push('Set ' + (o.what === 'y' ? 'Y0 in the middle' : o.what === 'z' ? 'Z0 half the chuck\u2019s diameter below the top' : 'Y0 in the middle, Z0 half the chuck\u2019s diameter below the top'));
    if (o.needX) {
      if (o.what === 'x' && bit) s.push('Pause: cutting edges left and right');
      s.push('Lift to ' + F(o.xUp - o.jaws / 2) + ' above the jaws and turn A to 0 (a jaw up)');
      s.push('Move X+ ' + F(o.xMove) + ' from where you started: ' + F(o.xAir) + ' past where the jaw face should be');
      s.push('Go down to ' + o.xzText + (o.stockIn ? ' (' + F(o.stockGap) + ' above the stock)' : '') + ', then feel back toward the jaw (X\u2212, up to ' + F(o.xSearch) + ') and set X0 there');
    }
    return list;
  }

  // ---- the run
  // io.job(lines) runs lines as one probe job and resolves when the controller has done them,
  // to the machine position {x, y, z} (mm) it ended at (or nothing: io.pos() is asked then);
  // io.pos() resolves to the machine position once it's idle; io.step(text) says what's
  // happening; io.stopped() is true once Stop was pressed.
  // Each job waits for the machine to stop and report where it is, so moves that don't need
  // looking at in between go in the same job: no pause between them.
  function run(o, io) {
    if (!o.F) o.F = function (v) { return f1(v) + ' mm'; };
    var R = o.body / 2, tr = o.tr, d = o.d, res = { set: {}, notes: [] }, cur = null;
    var job = function (mode, lines) {
      if (io.stopped && io.stopped()) return Promise.reject(new Error('stopped'));
      return io.job(['G21 ' + mode].concat(lines)).then(function (p) { return p || io.pos(); }).then(function (p) { cur = p; return p; });
    };
    var J = function (lines) { return job('G91', lines); };      // relative moves
    var Ja = function (lines) { return job('G90', lines); };     // to work coordinates
    var at = function () { return cur ? Promise.resolve(cur) : io.pos().then(function (p) { cur = p; return p; }); };
    // rapid moves by [axis, distance], and how far they go along one axis
    var g0 = function (moves) { return (moves || []).map(function (m) { return 'G0 ' + m[0] + f3(m[1]); }); };
    var shift = function (moves, k) { var s = 0; (moves || []).forEach(function (m) { if (m[0].toLowerCase() === k) s += m[1]; }); return s; };
    // a touch: fast, back off, slow; resolves to the position touched. `pre`: rapid moves
    // before it, `after`: rapid moves after it, in the same job (where it touched is where it
    // ended up less those)
    var touch = function (ax, dir, dist, pre, after) {
      return J(g0(pre).concat(['G38.2 ' + ax + f3(dir * dist) + ' F' + FAST, 'G0 ' + ax + f3(-dir * BOUNCE), 'G38.2 ' + ax + f3(dir * (BOUNCE + 1)) + ' F' + SLOW], g0(after))).then(function (p) {
        return { x: p.x - shift(after, 'x'), y: p.y - shift(after, 'y'), z: p.z - shift(after, 'z') };
      });
    };
    // a move that stops if it touches anything; it must not. `pre`: rapid moves before it, in
    // the same job
    var guarded = function (ax, dist, what, pre) {
      var k = ax.toLowerCase();
      return at().then(function (from) {
        var start = from[k] + shift(pre, k);
        return J(g0(pre).concat(['G38.3 ' + ax + f3(dist) + ' F' + Math.round(o.rapid)])).then(function (p) {
          var moved = p[k] - start;
          if (Math.abs(moved - dist) > 0.05) throw new Error(typeof what === 'function' ? what(moved) : what);
          return p;
        });
      });
    };
    var say = function (t) { if (io.step) io.step(t); };
    // a fluted bit: stop for it to be turned by hand (anything could be moved meanwhile: ask
    // where it is again after)
    var turnBit = function (t) { return o.tool === 'bit' && io.ask ? io.ask(t).then(function () { cur = null; }) : Promise.resolve(); };
    var LANDED = 'The tool touched something on the way down beside the chuck: start closer to the middle of the chuck (in Y), and check its diameter.';
    var ACROSS = 'The tool touched something going out to the side of the chuck: start it a few mm above the top of the chuck, over the middle.';

    // one pass over the chuck as it is: the sides at depth d, the middle, the top there
    function pass(first) {
      var r = {}, c = chord(o, R, d), out = R + tr + SIDE;
      say(first ? 'Touching the top of the chuck' : 'Touching the top again');
      return touch('Z', -1, first ? 25 : HOP + 8, null, [['Z', HOP]]).then(function (p) {
        r.top0 = p.z;
        return turnBit(TURN_FB);
      }).then(function () { say('Touching the front (−Y) side'); return guarded('Y', -out, ACROSS); })
        .then(function () { return guarded('Z', -(HOP + d), LANDED); })
        .then(function () { return touch('Y', 1, R - c + SIDE + 12, null, [['Y', -BOUNCE], ['Z', HOP + d]]); })
        .then(function (p) {
          r.y1 = p.y;
          say('Touching the back (+Y) side');
          return guarded('Y', out + c + tr + BOUNCE, ACROSS);
        })
        .then(function () { return guarded('Z', -(HOP + d), LANDED); })
        .then(function () { return touch('Y', -1, R - c + SIDE + 12, null, [['Y', BOUNCE], ['Z', HOP + d]]); })
        .then(function (p) {
          r.y2 = p.y; r.mid = (r.y1 + r.y2) / 2;
          if (!(r.y2 > r.y1)) throw new Error('The two sides came out the wrong way round: check the probe and start again.');
          say('Going to the middle');
          var toMid = [['Y', r.mid - (r.y2 + BOUNCE)]];
          if (o.what === 'y') return J(g0(toMid));
          if (o.tool === 'bit') return J(g0(toMid)).then(function () { return turnBit(TURN_LR); }).then(function () { say('Touching the top in the middle'); return touch('Z', -1, HOP + 8); });
          say('Touching the top in the middle');
          return touch('Z', -1, HOP + 8, toMid);
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
      var go = turnBit(TURN_LR).then(function () { return first ? Ja(['G0 Y0']) : null; });
      return go.then(function () { return touch('Z', -1, first ? 25 : HOP + 8); }).then(function (p) { return { at: p, top: p.z, mid: p.y }; });
    }
    // up clear of the jaws and A by `deg`: the moves
    var upBy = Math.max(o.jaws > 0 ? o.jaws / 2 - R + CLEAR : 0, HOP + 3);
    function turnMoves(deg) { return [['Z', upBy], ['A', deg]]; }
    // turn A 180° and come back down above the top
    function turnDown() {
      say('Turning A 180°');
      return guarded('Z', -(upBy - HOP - 1), 'The tool touched the chuck coming back down after turning it: it runs too far off true for this, or its diameter is wrong.', turnMoves(180));
    }

    var chain = Promise.resolve(), a, b;
    if (o.what !== 'x') {
      var one = o.what === 'z' ? topOnly : pass;
      chain = one(true).then(function (r) {
        a = r;
        if (!o.half) return null;
        return turnDown().then(function () { return one(false); }).then(function (r2) { b = r2; });
      }).then(function () {
        // set it where the last touch was (the tip is on the top, or above the middle)
        var last = b || a, here = last.at, mid = b ? (a.mid + b.mid) / 2 : a.mid, top = b ? (a.top + b.top) / 2 : a.top;
        var words = [];
        if (o.what !== 'z') { words.push('Y' + f3(here.y - mid)); res.set.y = true; }
        if (o.what !== 'y') { words.push('Z' + f3(R + here.z - top)); res.set.z = true; }
        if (b) res.runout = { y: (a.mid - b.mid) / 2, z: o.what === 'y' ? null : (a.top - b.top) / 2 };
        if (a.dia) res.dia = b && b.dia ? (a.dia + b.dia) / 2 : a.dia;
        say('Setting ' + (o.what === 'y' ? 'Y0' : o.what === 'z' ? 'Z0' : 'Y0 and Z0') + (o.half ? ', and turning A back' : ''));
        // then lift clear (and turn A back after a half turn), in the same job
        return J(['G10 L20 P0 ' + words.join(' ')].concat(g0(o.half ? turnMoves(-180) : [['Z', HOP + 3]])));
      });
    }
    if (o.what === 'xyz' || o.what === 'x') {
      chain = chain.then(function () {
        return o.what === 'x' ? turnBit(TURN_LR) : null;
      }).then(function () {
        say('Turning A to 0, a jaw up');
        // clear of the jaws (Y0 Z0 on the axis now), then the jaw up
        return Ja(['G0 Z' + f3(o.jaws / 2 + CLEAR), 'G0 Y0', 'G0 A0']);
      }).then(function () { say('Going round to the front of the jaw'); return guarded('X', o.xMove, 'The tool touched something moving out in front of the chuck: raise it, or check the chuck’s diameter with its jaws.'); })
        .then(function () {
          return guarded('Z', -(o.jaws / 2 + CLEAR - o.xz), function (moved) {
            // how high it was stopped: at the top of the jaws it's a jaw; lower down, in front of
            // the jaw, it's the stock (or something else held in the chuck)
            var h = o.jaws / 2 + CLEAR + moved;
            return h > Math.max(o.stockTop + 4, o.jaws / 2 - 6)
              ? 'The tool came down on the jaw, not in front of it: the jaw face is further in front of where you started than ' + o.F(o.ahead) + '. Set it bigger.'
              : 'The tool touched something ' + o.F(h) + ' above the axis on its way down in front of the jaw: the stock, if it’s in the chuck. Check the stock’s size (Stock), or set Touch the jaw at higher.';
          });
        }).then(function () { say('Touching the front of the jaw'); return touch('X', -1, o.xSearch); })
        .then(function () {
          say(o.x0 > 0 ? 'Setting X0, ' + o.F(o.x0) + ' in front of the jaw face' : 'Setting X0');
          // set it where the touch stopped, then back off and up clear of the jaws
          return J(['G10 L20 P0 X' + f3(tr - o.x0), 'G0 X' + f3(BOUNCE), 'G90', 'G0 Z' + f3(o.jaws / 2 + CLEAR)]);
        })
        .then(function () { res.set.x = true; });
    }
    return chain.then(function () { return io.job(['G90']); }).then(function () {
      if (res.dia && o.body > 0 && Math.abs(res.dia - o.body) > Math.max(1, 0.02 * o.body))
        res.notes.push('The chuck measured about ' + o.F(res.dia) + ' across where it was touched, and you set ' + o.F(o.body) + '. Z0 is half the diameter below the top, so if that’s wrong, so is Z0: measure the round body behind the jaws with calipers (not the jaws), and check the ' + (o.tool === '3d' ? 'ball' : o.tool) + ' diameter.');
      return res;
    });
  }

  return { holderGap: holderGap, KEEP: KEEP, MODES: MODES, TYPES: TYPES, TURN_FB: TURN_FB, TURN_LR: TURN_LR, resolve: resolve, steps: steps, run: run, depth: depth, chord: chord, radiusFrom: radiusFrom, FAST: FAST, SLOW: SLOW };
});
