# Dense finish check: every finish move, at 1/4, 1/2, 3/4 of the move (ball centre distance)
import sys, json, numpy as np, trimesh
sys.path.insert(0, '.')
import verify_rotary as V
nc, stl, cfgp = sys.argv[1:4]
m = trimesh.load_mesh(stl, force='mesh'); cfg = json.load(open(cfgp))
moves, _ = V.parse(nc)
fin = [mv for mv in moves if mv[0] == 'G1' and mv[1] == 'finish' and mv[4] is not None]
R = cfg['finish']['tool_dia'] / 2
pts = []
for mv in fin:
    _, _, _, _, x0, z0, a0, x1, z1, a1, *_ = mv
    for f in (0.25, 0.5, 0.75):
        x, z, a = x0 + f * (x1 - x0), z0 + f * (z1 - z0), a0 + f * (a1 - a0)
        pts.append(V.to_model(np.array([[x, 0.0, z + R]]), a, cfg['a_sign'])[0])
pts = np.array(pts)
d = np.empty(len(pts))
for k in range(0, len(pts), 4000): d[k:k + 4000] = trimesh.proximity.closest_point(m, pts[k:k + 4000])[1]
pen = R - d
print(f'{len(fin)} finish moves, {len(pts)} points: deepest {pen.max():.4f} mm, over 0.01: {(pen > 0.01).sum()}, over 0.02: {(pen > 0.02).sum()}')
