// A stand-in for one of ncSender's rotary models (.ncfx, the format its visualizer reads):
// boxes the size of the K12-100 4-jaw rotary. The headstock, the chuck body, four stepped
// jaws (gripping faces 0.4, 10 and 26 mm from the axis, front step furthest out), the
// tailstock with its centre's point at X0, and the base. Chuck body face at X0, jaws reaching
// 19.5 in front of it, axis on Y0 Z0. Used by test/harness/serve.mjs.
const JAW_DIRS = { jaw0: [0, 1], jaw1: [1, 0], jaw2: [0, -1], jaw3: [-1, 0] };

// a box's 24 corners (4 per face, flat normals) and 12 triangles
function box(x0, x1, y0, y1, z0, z1) {
  const P = [], N = [], I = [];
  const faces = [
    [[1, 0, 0], [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]],
    [[-1, 0, 0], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]]],
    [[0, 1, 0], [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]]],
    [[0, -1, 0], [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]]],
    [[0, 0, 1], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]],
    [[0, 0, -1], [[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]]]
  ];
  for (const [n, q] of faces) {
    const b = P.length / 3;
    for (const p of q) { P.push(...p); N.push(...n); }
    I.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  return { P, N, I };
}
function merge(parts) {
  const out = { P: [], N: [], I: [] };
  for (const p of parts) { const b = out.P.length / 3; out.P.push(...p.P); out.N.push(...p.N); out.I.push(...p.I.map((i) => i + b)); }
  return out;
}
// a jaw opening along (dy, dz): its steps, then its back in the chuck's slot
function jaw([dy, dz]) {
  const seg = (x0, x1, r0, r1) => {
    // along the jaw r0..r1, across it -7..7
    const ys = dy ? [dy * r0, dy * r1] : [-7, 7], zs = dz ? [dz * r0, dz * r1] : [-7, 7];
    return box(x0, x1, Math.min(...ys), Math.max(...ys), Math.min(...zs), Math.max(...zs));
  };
  return merge([seg(-9, 6.5, 0.4, 41.1), seg(6.5, 13, 10, 41.1), seg(13, 19.5, 26, 41.1)]);
}

export function makeFixtureModel() {
  const groups = [
    ['fixed', 'gun', box(-190.5, -65, -54.8, 112.3, -65, 50)],
    ['spin', 'steel', box(-65, 0, -50, 50, -50, 50)],
    ...Object.entries(JAW_DIRS).map(([k, d]) => [k, 'steel', jaw(d)]),
    ['tail', 'gun', merge([box(0.3, 44, -21, 21, -21, 21), box(44, 243.5, -49.2, 57, -65, 40)])],
    ['track', 'gun', box(-200.5, 1018.7, -68.3, 68.3, -85, -62)]
  ];
  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const [, , g] of groups) for (let i = 0; i < g.P.length; i++) { lo[i % 3] = Math.min(lo[i % 3], g.P[i]); hi[i % 3] = Math.max(hi[i % 3], g.P[i]); }
  const scale = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 65535;
  // data blocks, each 4-byte aligned
  const blocks = [], meta = [];
  let off = 0;
  const put = (bytes) => { const at = off; blocks.push(bytes); off += bytes.length; const pad = (4 - (off % 4)) % 4; if (pad) { blocks.push(Buffer.alloc(pad)); off += pad; } return at; };
  for (const [role, mat, g] of groups) {
    const verts = g.P.length / 3, tris = g.I.length / 3;
    const q = new Uint16Array(g.P.length);
    for (let i = 0; i < g.P.length; i++) q[i] = Math.round((g.P[i] - lo[i % 3]) / scale);
    const n = new Int8Array(g.N.length);
    for (let i = 0; i < g.N.length; i++) n[i] = Math.round(g.N[i] * 127);
    const ix = new Uint16Array(g.I);
    meta.push({ role, mat, verts, tris, index: 'u16', pos: put(Buffer.from(q.buffer)), nrm: put(Buffer.from(n.buffer)), idx: put(Buffer.from(ix.buffer)) });
  }
  const header = { version: 1, name: 'K12-100 4-jaw rotary (test)', origin: lo, scale, axisHeight: 85, track: [-200.5, 1018.7], trackHalfWidth: 68.3, jawReach: 19.5, jawDirs: JAW_DIRS, tailMax: 813.2, trackSplit: 409.1, tailBack: 243.5, groups: meta };
  let json = JSON.stringify(header);
  while ((8 + Buffer.byteLength(json)) % 4) json += ' ';
  const head = Buffer.alloc(8);
  head.writeUInt32LE(0x5846434e, 0);
  head.writeUInt32LE(Buffer.byteLength(json), 4);
  return Buffer.concat([head, Buffer.from(json), ...blocks]);
}
