#!/usr/bin/env python3
"""Test part with a chin: a round body along X, a head post standing up from it and a jaw
that juts out over the body toward +X, leaving a 4 mm gap under the jaw. From any line
through the rotary axis the jaw hides the gap; a tool coming in from the side (A locked,
offset in Y) can reach it.  python3.12 test/make_chin_step.py test/chin_test.step"""
import sys
import gmsh

out = sys.argv[1] if len(sys.argv) > 1 else "chin_test.step"
gmsh.initialize()
gmsh.option.setNumber("General.Terminal", 0)
occ = gmsh.model.occ
base = occ.addCylinder(0, 0, 0, 10, 0, 0, 14)        # flange at the chuck end
body = occ.addCylinder(10, 0, 0, 60, 0, 0, 9)        # round body, r 9
post = occ.addBox(44, -4, 0, 8, 8, 20)               # head post, up to z 20
jaw = occ.addBox(52, -4, 13, 14, 8, 7)               # jaw over the body: z 13..20, gap 9..13 under it
out_dimtags, _ = occ.fuse([(3, base)], [(3, body), (3, post), (3, jaw)])
occ.synchronize()
# soften the jaw's outer edges a little so it isn't all sharp corners
gmsh.write(out)
gmsh.finalize()
print("wrote", out)
