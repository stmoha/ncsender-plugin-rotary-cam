// node test/tenon-test.js: tenon length (tenonList, roughRange, fitScale) and the corner zero
const core = require('../lib/cam-core.js');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const near = (a, b, t = 1e-6) => Math.abs(a - b) <= t;
const fresh = (o) => core.prepareJob(core.deepMerge(core.DEFAULTS, o || {}));
const raw = core.cylinderTris(0, 100, 10, 32);               // a 100 mm long, 20 mm bar along X

let job = fresh();
let mb = core.placeMesh(raw, job.model);
ok(near(mb.min[0], 25) && near(mb.max[0], 125), 'part placed from X25 to X125');
let ts = core.tenonList(job, mb), reach = 25 - ts[0].x0;
ok(ts.length === 2 && reach > 6 && reach < 8, 'auto tenons reach just the tools’ room past the part (' + reach.toFixed(2) + ' mm)');
ok(core.tenonLen(job, 'chuck') === 0 && core.tenonLen(job, 'tailstock') === 0, 'empty length is auto (0)');
const autoRR = core.roughRange(job, { min: mb.min, max: mb.max, ends: { lo: true, hi: true } });

job = fresh({ tenons: { chuck: { len: 15 }, tailstock: { len: 15 } } });
ts = core.tenonList(job, mb);
ok(near(ts[0].x0, 10) && near(ts[1].x1, 140), 'a 15 mm tenon runs X10..X25 and X125..X140');
let rr = core.roughRange(job, { min: mb.min, max: mb.max, ends: { lo: true, hi: true } });
ok(near(rr[0], 25 - 15 + 3.175) && near(rr[1], 125 + 15 - 3.175), 'roughing reaches the whole tenon (' + rr.map((v) => v.toFixed(3)).join('..') + ', auto was ' + autoRR.map((v) => v.toFixed(3)).join('..') + ')');

job = fresh({ tenons: { same: true, chuck: { len: 15 } } });
ok(core.tenonLen(job, 'tailstock') === 15, 'Same at both ends: the chuck end’s length is used at the tailstock too');
job = fresh({ tenons: { ends: 'chuck', chuck: { len: 15 } } });
ok(core.tenonLen(job, 'tailstock') === 0, 'no tailstock tenon: no length there');
job = fresh({ tenons: { chuck: { len: 40 } } });
rr = core.roughRange(job, { min: mb.min, max: mb.max, ends: { lo: true, hi: true } });
ok(near(rr[0], 0 + 5 + 3.175), 'a tenon longer than the room stops at the jaws’ keep-away');

// scale to fit leaves the tenon lengths
job = fresh({ stock: { dia: 80 } });
let f = core.fitScale(job, raw);
ok(f.by === 'length' && f.endBy === 'tools' && !f.startMoved, 'auto: fits to the tools’ room before the tailstock (scale ' + f.scale + ')');
job = fresh({ stock: { dia: 60 }, tenons: { same: false, chuck: { len: 30 }, tailstock: { len: 30 } } });
f = core.fitScale(job, raw);
ok(f.endBy === 'tenon' && near(f.end, 245 - 8 - 30) && !f.startMoved && near(f.start, 25), 'tenons 30 mm: the work starts at X25 (Part starts at X), the tenon then the part, to X207');
ok(near(f.scale, Math.floor((207 - 25 - 30) / 100 * 1000) / 1000), 'scale ' + f.scale + ' = (207 - 25 - 30) / 100');
job = fresh({ stock: { dia: 60 }, model: { part_start_x: 2 }, tenons: { same: false, chuck: { len: 30 }, tailstock: { len: 30 } } });
f = core.fitScale(job, raw);
ok(f.startMoved && near(f.start, 5), 'Part starts at X inside the keep-away (2 of 5 mm): moved out to X5');
job = fresh({ stock: { dia: 60 }, model: { part_start_x: 50 }, tenons: { same: false, chuck: { len: 30 }, tailstock: { len: 30 } } });
f = core.fitScale(job, raw);
ok(!f.startMoved && near(f.start, 50), 'a part already further out stays where it is');
ok(core.check(fresh({ tenons: { chuck: { len: -2 } } }), mb).some((p) => /length out of the part/.test(p)), 'a negative tenon length is flagged');

// Part starts at X includes the chuck end tenon (or parting neck): 0.11.5
job = fresh({ tenons: { chuck: { len: 30 } } });
ok(near(core.chuckLead(job), 30), 'a 30 mm chuck tenon: the lead is 30 mm');
mb = core.placeMesh(raw, job.model, core.chuckLead(job));
ts = core.tenonList(job, mb);
ok(near(mb.min[0], 55) && near(ts[0].x0, 25), 'the tenon starts at Part starts at X (X25), the part after it (X55)');
job = fresh({ tenons: { enabled: false } });
ok(core.chuckLead(job) === 0, 'no tenon, no parting: no lead, the part starts at Part starts at X');

// Parting cuts each tenon down to its diameter, over its whole length (0.11.5)
job = fresh({ parting: { enabled: true }, tenons: { same: false, chuck: { len: 30, dia: 10 }, tailstock: { dia: 8 } }, tailstock_x: 300 });
mb = core.placeMesh(raw, job.model, core.chuckLead(job));
ts = core.tenonList(job, mb);
let pp;
const r6 = job.parting.tool_dia / 2;
const P = (j, m) => { const W = core.workMesh(j, m); return core.plan(j, Object.assign({}, m, { tris: W.tris, solid: W.solid, tenons: W.tenons, walls: W.walls, ends: W.ends })).parting; };
pp = P(job, mb);
const ce = pp.ends.find((e) => e.side === 'chuck'), te = pp.ends.find((e) => e.side === 'tailstock');
ok(ce && near(ce.r, 5) && ce.cols.every((x) => x - r6 >= ts[0].x0 - 1e-6 && x + r6 <= mb.min[0] + 1e-6) && Math.min(...ce.cols) - r6 < ts[0].x0 + 1e-6 && Math.max(...ce.cols) + r6 > mb.min[0] - 0.1, 'chuck end: cut to the tenon (Ø10) from beside the part to the end of its 30 mm (' + ce.cols.length + ' columns)');
const tt = ts.find((t) => t.side === 'tailstock');
ok(te && near(te.r, 4) && te.cols.length >= 1 && te.cols.every((x) => x - r6 >= mb.max[0] && x + r6 <= tt.x1 + 1e-6), 'tailstock end, auto length: cut inside the tenon, to Ø8 (tenon ' + (tt.x1 - mb.max[0]).toFixed(2) + ' mm)');
ok(core.tenonExt(job, 'tailstock') >= job.parting.tool_dia + 1, 'with Parting on, an auto tenon is at least a parting cutter long');
rr = core.roughRange(job, { min: mb.min, max: mb.max, ends: { lo: true, hi: true } });
ok(rr[0] > mb.min[0] - 15, 'with Parting on, roughing leaves the 30 mm tenon thick past the tools’ room (from X' + rr[0].toFixed(2) + ', part at X' + mb.min[0] + ')');
job = fresh({ parting: { enabled: true }, tenons: { enabled: false } });
mb = core.placeMesh(raw, job.model, core.chuckLead(job));
ok(core.check(job, mb).some((p) => /^Parting cuts the tenons down to size/.test(p)), 'Parting without tenons: flagged');
job = fresh({ tenons: { chuck: { len: 30 } }, model: { part_start_x: 2 } });
mb = core.placeMesh(raw, job.model, core.chuckLead(job));
ok(core.check(job, mb).some((p) => /^Part starts at X is inside the keep-away/.test(p)), 'Part starts at X inside the keep-away with a tenon: flagged');
job = fresh({ tenons: { chuck: { len: 30 } } });
mb = core.placeMesh(raw, job.model, core.chuckLead(job));
ok(!core.check(job, mb).some((p) => /keep-away/.test(p)), 'outside it: not flagged');
// older settings: the part stays where it was
let saved = { model: { part_start_x: 60 }, tenons: { chuck: { len: 30 } } };
job = core.migrateStart(fresh(saved), saved);
ok(near(job.model.part_start_x, 30) && job.model.start_incl === true, 'settings from before 0.11.5 (part at X60, 30 mm tenon): Part starts at X becomes X30');
ok(near(core.placeMesh(raw, job.model, core.chuckLead(job)).min[0], 60), 'and the part is still at X60');
saved = { model: { part_start_x: 30, start_incl: true }, tenons: { chuck: { len: 30 } } };
job = core.migrateStart(fresh(saved), saved);
ok(near(job.model.part_start_x, 30), 'newer settings are left as they are');

// corner zero: the offsets from Stefan's sheet (inches), added to the work offset on the corner
const IN = 25.4, corner = { x: -43.0984 * IN, y: -43.7339 * IN, z: -0.9649 * IN };
job = fresh({ rig: { corner: { dx: 4.6023 * IN, dy: 1.4142 * IN, dz: -1.3826 * IN } } });
const cz = core.cornerZero(job, corner);
ok(near(cz.to.x, -38.4961 * IN, 1e-6) && near(cz.to.y, -42.3197 * IN, 1e-6) && near(cz.to.z, -2.3475 * IN, 1e-6), 'corner + offsets lands on his axis point (X-38.4961 Y-42.3197 Z-2.3475 in)');
ok(core.cornerZero(fresh(), corner) === null, 'no offsets set: nothing to move');
ok(fresh().rig.chuck.jaws === 4, 'chucks have 4 jaws unless set to 3');

// Fit the stock to the part: thickness and length for the part as placed; the part stays
{
  const big = core.cylinderTris(0, 300, 30, 32);              // 300 mm long, 60 mm across
  for (const [shape, step] of [['round', 1], ['square', 1], ['rect', 1], ['round', 2.54]]) {
    const j = fresh({ stock: { shape, dia: 20, width: 20, height: 20, clamp: 12.7 }, tenons: { same: false, chuck: { len: 10 }, tailstock: { len: 20 } } });
    const m = core.placeMesh(big, j.model, core.chuckLead(j));
    ok(core.check(j, m).some((p) => /^The part (is|needs)/.test(p)) && core.check(j, m).some((p) => /Stock length is too short/.test(p)), shape + ': too thin and too short before');
    const f = core.fitStockToPart(j, m, step);
    const m2 = core.placeMesh(big, j.model, core.chuckLead(j));
    const left = core.check(j, m2).filter((p) => /^The part (is|needs)|Stock length/.test(p));
    ok(!left.length && near(m2.min[0], m.min[0]) && near(m2.max[0], m.max[0]), shape + (step > 1 ? ' (inch steps)' : '') + ': fits after, the part hasn’t moved' + (left.length ? ': ' + left.join(' | ') : ''));
    const across = shape === 'round' ? f.dia : f.width;
    ok(across >= 62 - 1e-9 && across < 62 + step && near(across / step, Math.round(across / step)), shape + ': ' + across + ' across (1 mm to spare, rounded up to ' + step + ')');
    ok(near(f.length, j.tailstock_x - j.chuck_face_x + 12.7) && near(j.stock.clamp, 12.7) && f.length >= m.max[0] + 20 + Number(j.tailstock_clearance) + 12.7 - 1e-9, shape + ': ' + f.length.toFixed(2) + ' long with the tailstock tenon and keep-away, clamping distance stays');
  }
}

// ---- stepovers as a % of the tool's diameter (0.11.6)
{
  const j = fresh({ rough: { tool_dia: 10, pitch: 3.5, pitch_pct: 40 }, finish: { tool_dia: 6.35, pitch: 0.5 }, index: { tool_dia: 3.175, stepover_pct: 10 }, corners: { tool_dia: 8, stepover_pct: null, stepover: 4.8 } });
  ok(near(j.rough.pitch, 4) && near(j.index.stepover, 0.3175), 'typed as a %, the length is that % of the tool: 40% of 10 mm is ' + j.rough.pitch + ', 10% of 3.175 mm is ' + j.index.stepover);
  ok(near(j.finish.pitch, 0.5) && near(j.corners.stepover, 4.8), 'typed as a length, it stays that length');
  j.rough.tool_dia = 6; core.syncPct(j);
  ok(near(j.rough.pitch, 2.4), 'a new tool: the % holds, the length follows (40% of 6 mm is ' + j.rough.pitch + ')');
  ok(core.pctOf(j, 'finish', 'pitch') === null && core.pctOf(j, 'rough', 'pitch') === 40, 'pctOf: the % when one was typed, null otherwise');
}

console.log(fails ? fails + ' FAILED' : 'ALL PASS');
process.exit(fails ? 1 : 0);
