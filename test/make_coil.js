// Test part: a coil, open down the middle. A 12.7 mm tube coiled once round the rotary axis
// (its centre 17.45 mm out, so its inside is 11.1 mm from the axis) between two end discs
// (D50.8 x 6). Rotary passes have to go past the axis to clear the core, and the coil's
// edges are walls between two angles. Axis on X, centred on Y0 Z0. Binary STL.
//   node test/make_coil.js test/coil.stl
const fs = require('fs');
const out = process.argv[2] || 'coil.stl';
const tris = [];
// a triangle facing away from `inner` (a point inside the solid it bounds): STL faces point out
const tri = (a, b, c, inner) => {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const m = [(a[0] + b[0] + c[0]) / 3 - inner[0], (a[1] + b[1] + c[1]) / 3 - inner[1], (a[2] + b[2] + c[2]) / 3 - inner[2]];
  if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] < 0) tris.push(a, c, b); else tris.push(a, b, c);
};
// the tube: circles round the helix, joined up; closed at both ends inside the discs
const L = 89, Rc = 17.45, rt = 6.35, NS = 160, NC = 20, X0 = 6;
const ring = [];
for (let s = 0; s <= NS; s++) {
  const x = X0 + L * s / NS, th = 2 * Math.PI * s / NS;
  // centre, the helix's tangent and a frame round it
  const c = [x, Rc * Math.sin(th), Rc * Math.cos(th)];
  const t = [L / NS, Rc * Math.cos(th) * 2 * Math.PI / NS, -Rc * Math.sin(th) * 2 * Math.PI / NS];
  const tl = Math.hypot(...t); t[0] /= tl; t[1] /= tl; t[2] /= tl;
  const n = [0, Math.sin(th), Math.cos(th)];                    // out from the axis
  const d = n[0] * t[0] + n[1] * t[1] + n[2] * t[2];
  n[0] -= d * t[0]; n[1] -= d * t[1]; n[2] -= d * t[2];
  const nl = Math.hypot(...n); n[0] /= nl; n[1] /= nl; n[2] /= nl;
  const b = [t[1] * n[2] - t[2] * n[1], t[2] * n[0] - t[0] * n[2], t[0] * n[1] - t[1] * n[0]];
  const r = [];
  for (let k = 0; k < NC; k++) { const a = 2 * Math.PI * k / NC, ca = Math.cos(a) * rt, sa = Math.sin(a) * rt; r.push([c[0] + ca * n[0] + sa * b[0], c[1] + ca * n[1] + sa * b[1], c[2] + ca * n[2] + sa * b[2]]); }
  ring.push({ c, r });
}
for (let s = 0; s < NS; s++) for (let k = 0; k < NC; k++) {
  const a = ring[s].r[k], b = ring[s].r[(k + 1) % NC], c = ring[s + 1].r[k], d = ring[s + 1].r[(k + 1) % NC];
  const mid = ring[s].c.map((q, w) => (q + ring[s + 1].c[w]) / 2);
  tri(a, c, b, mid); tri(b, c, d, mid);
}
for (const s of [0, NS]) for (let k = 0; k < NC; k++) {
  const a = ring[s].c, b = ring[s].r[k], c = ring[s].r[(k + 1) % NC], inner = ring[s === 0 ? 1 : NS - 1].c;
  tri(a, b, c, inner);
}
// the end discs
const disc = (x0, x1) => {
  const R = 25.4, N = 72, p = (x, k) => [x, R * Math.sin(2 * Math.PI * k / N), R * Math.cos(2 * Math.PI * k / N)];
  const mid = [(x0 + x1) / 2, 0, 0];
  for (let k = 0; k < N; k++) {
    tri(p(x0, k), p(x0, k + 1), p(x1, k), mid); tri(p(x0, k + 1), p(x1, k + 1), p(x1, k), mid);
    tri([x0, 0, 0], p(x0, k + 1), p(x0, k), mid); tri([x1, 0, 0], p(x1, k), p(x1, k + 1), mid);
  }
};
disc(0, X0 + 3); disc(X0 + L - 3, X0 + L + 6);
const n = tris.length / 3, buf = Buffer.alloc(84 + n * 50);
buf.writeUInt32LE(n, 80);
for (let i = 0; i < n; i++) for (let v = 0; v < 3; v++) for (let q = 0; q < 3; q++) buf.writeFloatLE(tris[i * 3 + v][q], 84 + i * 50 + 12 + 12 * v + 4 * q);
fs.writeFileSync(out, buf);
console.log('wrote', out, n, 'triangles');
