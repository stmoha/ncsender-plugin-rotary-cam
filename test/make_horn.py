#!/usr/bin/env python3
"""Test part with an end like a chess knight's nose: a round body that tapers into a thin
horn curling off the rotary axis, so near that end nothing goes round the axis.
Single watertight solid, binary STL.  python3.12 test/make_horn.py test/horn.stl"""
import math, sys
import numpy as np, trimesh

def rho(x):
    if x < 2: return 13 + x
    if x < 40: return 15
    if x < 50: return 7 + 8 * (1 + math.cos(math.pi * (x - 40) / 10)) / 2
    return 7 - 4.5 * (x - 50) / 30

def yoff(x):
    return 0 if x < 50 else 10 * ((x - 50) / 30) ** 2

xs = np.linspace(0, 80, 321)
seg = 96
verts, faces = [], []
for x in xs:
    for k in range(seg):
        t = 2 * math.pi * k / seg
        verts.append((x, yoff(x) + rho(x) * math.cos(t), rho(x) * math.sin(t)))
for i in range(len(xs) - 1):
    for k in range(seg):
        a, b = i * seg + k, i * seg + (k + 1) % seg
        c, d = a + seg, b + seg
        faces += [(a, b, c), (c, b, d)]
c0 = len(verts); verts.append((0, yoff(0), 0))
c1 = len(verts); verts.append((80, yoff(80), 0))
last = (len(xs) - 1) * seg
for k in range(seg):
    faces.append((c0, (k + 1) % seg, k))
    faces.append((c1, last + k, last + (k + 1) % seg))
m = trimesh.Trimesh(np.array(verts), np.array(faces))
if m.volume < 0: m.invert()
print('watertight', m.is_watertight, 'volume', round(m.volume, 1), 'faces', len(m.faces))
m.export(sys.argv[1] if len(sys.argv) > 1 else 'horn.stl')
