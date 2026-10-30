#!/usr/bin/env python3
"""Knight-like STEP test part, modelled Z-up like a chess piece: a turned round base
and an off-centre head, so the bounding-box centre is NOT on the base's axis.
About 38 x 31 x 73 mm. The base axis is the model Z axis through X0 Y0."""
import math
import sys

import gmsh

out = sys.argv[1] if len(sys.argv) > 1 else "knight_test.step"
gmsh.initialize()
gmsh.option.setNumber("General.Terminal", 0)
occ = gmsh.model.occ

# turned base: profile in the XZ plane (x = radius), revolved about Z
prof = [(0, 0), (15.5, 0), (15.5, 3), (13, 6), (14.5, 12), (11, 20), (8.5, 26), (9.5, 30), (0, 30)]
pts = [occ.addPoint(r, 0, z) for r, z in prof]
lines = [occ.addLine(pts[0], pts[1]), occ.addLine(pts[1], pts[2])]
lines.append(occ.addBSpline(pts[2:-1]))
lines += [occ.addLine(pts[-2], pts[-1]), occ.addLine(pts[-1], pts[0])]
face = occ.addPlaneSurface([occ.addCurveLoop(lines)])
base = [e for e in occ.revolve([(2, face)], 0, 0, 0, 0, 0, 1, 2 * math.pi) if e[0] == 3]
occ.remove([(2, face)])

# neck: a leaning ellipsoid-ish body (scaled sphere) set forward in +X
neck = occ.addSphere(0, 0, 0, 10)
occ.dilate([(3, neck)], 0, 0, 0, 0.9, 0.75, 1.9)
occ.rotate([(3, neck)], 0, 0, 0, 0, 1, 0, math.radians(-18))
occ.translate([(3, neck)], 1.5, 0, 44)
# head: a box with rounded edges reaching forward (+X), the "muzzle"
head = occ.addBox(-6, -7, 56, 28, 14, 13)
occ.fillet([head], occ.getEntities(1) and [c for c in range(1, 1)] or [], [2.0]) if False else None
occ.rotate([(3, head)], 0, 0, 56, 0, 1, 0, math.radians(14))
# mane: a thin fin on the back (-X side)
mane = occ.addBox(-13, -2.5, 34, 6, 5, 34)
occ.rotate([(3, mane)], -10, 0, 50, 0, 1, 0, math.radians(-10))
body, _ = occ.fuse(base, [(3, neck), (3, head), (3, mane)])
occ.synchronize()
gmsh.write(out)
gmsh.finalize()
print("wrote", out)
