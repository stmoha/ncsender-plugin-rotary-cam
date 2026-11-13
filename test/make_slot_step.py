#!/usr/bin/env python3
"""Test part that needs the tool past the rotary axis: a round bar (R14, X0..90) with
- a slot right through it, X20..40, 10 mm wide (Y -5..5 at A0), through along Z, and
- a blind hole, D12 at X60, from the top (Z+ at A0) down to 6 mm past the axis.
From above the axis neither can be finished: the slot's middle and the hole's bottom
face the axis. Axis on X, centred on Y0 Z0.  python test/make_slot_step.py test/slot_test.step"""
import sys

import gmsh

out = sys.argv[1] if len(sys.argv) > 1 else "slot_test.step"
gmsh.initialize()
gmsh.option.setNumber("General.Terminal", 0)
gmsh.model.add("slot")
occ = gmsh.model.occ
bar = occ.addCylinder(0, 0, 0, 90, 0, 0, 14)
slot = occ.addBox(20, -5, -20, 20, 10, 40)
hole = occ.addCylinder(60, 0, -6, 0, 0, 30, 6)
occ.cut([(3, bar)], [(3, slot), (3, hole)])
occ.synchronize()
gmsh.write(out)
gmsh.finalize()
print("wrote", out)
