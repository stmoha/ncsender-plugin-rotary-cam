#!/usr/bin/env python3
"""Does the Indexed operation in a program really take away what finishing left?
Reads the G-code (not the planner's data) and the left-after-finishing points the runner
saved (<out.nc>.left.json, part frame). For every indexed move, stepped finely, a point is
gone when it is within the ball, or above it inside the shank, at that A angle. Also
reports where the indexed time goes.
  python3.12 test/index_check.py out.nc out.nc.left.json job.json"""
import json, math, re, sys
import numpy as np
from scipy.spatial import cKDTree

nc, leftf, jobf = sys.argv[1:4]
job = json.load(open(jobf)); left = json.load(open(leftf))
X, Y, Z = (np.array(left[k]) for k in "xyz"); W = np.array(left["w"]); T = np.array(left["target"]) == 1
sgn = job.get("a_sign", 1)
word = re.compile(r"([A-Z])(-?\d+\.?\d*)")
st = {"X": 0.0, "Y": 0.0, "Z": 0.0, "A": 0.0}; op = None; R = None; scale = 1.0
segs = {}; RI = None; feed_len = 0.0; rapid_len = 0.0; plunges = 0; t_feed = 0.0
for line in open(nc):
    line = line.strip()
    if line.startswith("(OP "):
        parts = line[1:-1].split(); op = parts[1]; R = float(parts[3][1:]) * scale / 2
        continue
    if not line or line.startswith("("):
        continue
    if "G20" in line: scale = 25.4
    w = dict(word.findall(line.split("(")[0]))
    prev = dict(st)
    for ax in "XYZA":
        if ax in w: st[ax] = float(w[ax]) * (1.0 if ax == "A" else scale)
    if op != "index":
        continue
    RI = R                     # the indexed tool's radius (R changes with each operation)
    L = math.dist((prev["X"], prev["Y"], prev["Z"]), (st["X"], st["Y"], st["Z"]))
    if line.startswith("G1"):
        feed_len += L
        if "F" in w: t_feed += L / (float(w["F"]) * scale)
        if abs(st["Z"] - prev["Z"]) > 1e-9 and prev["X"] == st["X"] and prev["Y"] == st["Y"]: plunges += 1
        a = round(st["A"] % 360, 3)
        n = max(1, int(L / 0.1))
        f = np.linspace(0, 1, n + 1)
        segs.setdefault(a, []).append(np.stack([prev["X"] + f * (st["X"] - prev["X"]), prev["Y"] + f * (st["Y"] - prev["Y"]), prev["Z"] + f * (st["Z"] - prev["Z"])], 1))
    elif line.startswith("G0"):
        rapid_len += L
gone = np.zeros(len(X), bool)
for a, lst in segs.items():
    S = np.concatenate(lst)
    t = math.radians(a * sgn); c, s = math.cos(t), math.sin(t)
    my, mz = Y * c - Z * s, Y * s + Z * c                     # points in the machine frame at this A
    tree = cKDTree(np.stack([X, my], 1)); R = RI
    for b in range(0, len(S), 20000):
        Sb = S[b:b + 20000]
        res = tree.query_ball_point(Sb[:, :2], R)
        cnt = np.fromiter((len(r) for r in res), int, len(res))
        if not cnt.sum(): continue
        si = np.repeat(np.arange(len(Sb)), cnt); pi = np.fromiter((k for r in res for k in r), int, cnt.sum())
        d2 = (X[pi] - Sb[si, 0]) ** 2 + (my[pi] - Sb[si, 1]) ** 2
        hit = mz[pi] >= Sb[si, 2] + R - np.sqrt(np.maximum(0, R * R - d2)) - 1e-6
        gone[pi[hit]] = True
tv = W[T].sum(); rv = W[T & gone].sum()
print(f"indexed: {sum(len(v) for v in segs.values())} feed moves at A {sorted(segs)}; target left after finishing {tv:.0f} mm3, "
      f"taken away by the G-code {rv:.0f} mm3 ({100 * rv / max(tv, 1e-9):.0f}%); other material cut {W[~T & gone].sum():.0f} mm3")
print(f"indexed time: feed {feed_len:.0f} mm in {t_feed:.1f} min (+ rapids {rapid_len:.0f} mm), {plunges} plunges")
