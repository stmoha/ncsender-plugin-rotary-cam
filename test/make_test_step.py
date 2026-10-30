#!/usr/bin/env python3
"""Make a STEP test part for the rotary plugin with gmsh's OpenCascade kernel:
a turned handle (revolved B-spline profile) with a hex section, a flat, and a
cross hole. Axis on X, centred on Y0 Z0, X0 = chuck jaw face. Fits 40 mm stock."""
import math
import sys

import gmsh

out = sys.argv[1] if len(sys.argv) > 1 else "test_handle.step"
gmsh.initialize()
gmsh.option.setNumber("General.Terminal", 0)
gmsh.model.add("handle")
occ = gmsh.model.occ

# profile in the XY plane (y = radius), revolved about X
prof = [(15, 0), (15, 16), (30, 16), (38, 17.5), (48, 13), (70, 14.5), (110, 12),
        (150, 14.5), (172, 13), (182, 17.5), (190, 16), (225, 16), (225, 0)]
pts = [occ.addPoint(x, y, 0) for x, y in prof]
lines = [occ.addLine(pts[0], pts[1])]
spl = occ.addBSpline(pts[1:-1])          # smooth curve through the shaped part
lines += [spl, occ.addLine(pts[-2], pts[-1]), occ.addLine(pts[-1], pts[0])]
loop = occ.addCurveLoop(lines)
face = occ.addPlaneSurface([loop])
rev = occ.revolve([(2, face)], 0, 0, 0, 1, 0, 0, 2 * math.pi)
body = [e for e in rev if e[0] == 3]
occ.remove([(2, face)])   # the profile face would otherwise be exported as a stray sheet

# hex section from X80 to X100, 22 mm across flats, replacing the turned shape there
hex_rc = 11.0 / math.cos(math.radians(30))           # corner radius = 12.70
hp = [occ.addPoint(80, hex_rc * math.cos(math.radians(60 * k + 30)),
                   hex_rc * math.sin(math.radians(60 * k + 30))) for k in range(6)]
hl = [occ.addLine(hp[k], hp[(k + 1) % 6]) for k in range(6)]
hface = occ.addPlaneSurface([occ.addCurveLoop(hl)])
hvol = [e for e in occ.extrude([(2, hface)], 20, 0, 0) if e[0] == 3]
slab = occ.addBox(80, -30, -30, 20, 60, 60)
cut_slab, _ = occ.cut(body, [(3, slab)])
merged, _ = occ.fuse(cut_slab, hvol)

# a flat on top between 120 and 140 (depth 2.5 mm below the surface there)
flat = occ.addBox(120, -30, 10.0, 20, 60, 20)
merged, _ = occ.cut(merged, [(3, flat)])
# a 5 mm cross hole through at x = 200
hole = occ.addCylinder(200, -30, 0, 0, 60, 0, 2.5)
merged, _ = occ.cut(merged, [(3, hole)])
occ.synchronize()
gmsh.write(out)
gmsh.finalize()
print("wrote", out)
