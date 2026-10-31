#!/usr/bin/env python3
"""Independent checker for rotary_cam.py G-code.

Re-reads the G-code (not the CAM's internal data) and checks:
  * G93 discipline: every G1 in inverse-time mode carries its own F
  * Y stays on the centreline
  * axis rates (A deg/min, X and Z mm/min) never exceed the machine limits
  * X keep-outs: cutter never closer than the clearances to chuck or tailstock
  * gouges: the tool, placed back into the model's frame at each sampled
    position (and segment midpoints), never cuts into the part
      - ball: centre must be >= R from the surface (and outside the part)
      - flat: points on the end face and lower flank must be outside the part
              by at least the roughing 'leave'
  * finishing contact: how much of the finish pass actually touches the part
  * tapered ball tools: points all over the cone, up to the shank, stay outside the part
  * uncut stock: past the X range roughing cut, the finishing and indexed tools (cone and
    shank included) never enter the stock
  * the holder (0.7.0): the collet nut and spindle above each tool (stickout from the OP
    comment, sizes from the job's rig) never enter the part, the uncut stock, or the
    chuck / headstock / live centre / tailstock body - its own geometry code, not the CAM's
  * tool changes: moves made at ncSender's safe Z (after a G53 Z) are left out of the
    Y / keep-out checks; they're the route round the rotary
  * tenons (optional 4th argument, the CAM's tenon list as JSON): every move near a tenon
    is checked against that cylinder - ball centre >= R from it, flat cutter points no
    closer than the op's leave. Parting only has to stay out of the part of the tenon
    inside the part (its neck is cut through the tenon beside the part on purpose).
"""
import json
import math
import re
import sys

import numpy as np
import trimesh

TOL = 0.02  # mm


def rot_matrix(a_deg, a_sign):
    # a_sign=+1: A+90 carries the top of the stock (+Z) to -Y.
    t = math.radians(a_deg * a_sign)
    c, s = math.cos(t), math.sin(t)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def to_model(pts_machine, a_deg, a_sign):
    return pts_machine @ rot_matrix(a_deg, a_sign)  # = R^T p for row vectors


def query(mesh, pts, chunk=2000):
    """Distance to the surface and an inside flag for each point.

    Inside is first decided by which side of the nearest face the point is on
    (outward normals; the mesh must be closed and consistently wound). That is
    unreliable when the nearest point is on an edge or a vertex (sharp corners),
    so those points, and every point the face test calls inside, are settled
    with a ray-parity test. Done in chunks to keep memory flat.
    """
    dist = np.empty(len(pts))
    inside = np.zeros(len(pts), dtype=bool)
    recheck = np.zeros(len(pts), dtype=bool)
    for i in range(0, len(pts), chunk):
        p = pts[i:i + chunk]
        cp, d, tid = trimesh.proximity.closest_point(mesh, p)
        n = mesh.face_normals[tid]
        dist[i:i + chunk] = d
        side = np.einsum("ij,ij->i", p - cp, n)
        bary = trimesh.triangles.points_to_barycentric(mesh.triangles[tid], cp)
        on_edge = bary.min(axis=1) < 1e-3
        inside[i:i + chunk] = side < -1e-9
        recheck[i:i + chunk] = (side < -1e-9) | (on_edge & (d < 5.0))
    idx = np.nonzero(recheck)[0]
    for k in range(0, len(idx), 40):
        sel = idx[k:k + 40]
        inside[sel] = mesh.contains(pts[sel])
    return dist, inside


def parse(path):
    word = re.compile(r"([A-Z])(-?\d+\.?\d*)")
    st = {"X": None, "Y": None, "Z": None, "A": 0.0, "mode": "G94", "op": None, "dia": None, "kind": None, "scale": 1.0, "tc": False}
    tapers = {}
    stickouts = {}
    moves = []  # (type, op, kind, dia, x0,z0,a0, x1,z1,a1, F or None, y)
    errors = []
    for n, raw in enumerate(open(path), 1):
        line = raw.strip()
        m = re.match(r"\(OP (\w+) T\d+ D([\d.]+) (.*)\)", line)
        if m:
            st["op"], st["dia"] = m.group(1), float(m.group(2)) * st["scale"]
            st["kind"] = "ball" if "ball" in m.group(3).lower() else "flat"
            so = re.search(r"\[stickout ([\d.]+)\]", m.group(3))
            if so:
                stickouts[st["op"]] = float(so.group(1)) * st["scale"]
            tp = re.search(r"taper ([\d.]+)deg shank D([\d.]+)", m.group(3))
            if tp:
                st["kind"] = "taper"
                tapers[st["op"]] = (math.radians(float(tp.group(1))), float(tp.group(2)) * st["scale"] / 2)
            continue
        if line.startswith("(") or not line:
            continue
        w = dict(word.findall(line.split("(")[0]))
        codes = re.findall(r"G(\d+)", line)
        for g in codes:
            if g in ("93", "94"):
                st["mode"] = "G" + g
            elif g == "20":
                st["scale"] = 25.4   # inches: everything below is checked in mm
            elif g == "21":
                st["scale"] = 1.0
        motion = "G0" if "0" in codes else ("G1" if "1" in codes else None)
        if "53" in codes:
            # up to ncSender's safe Z (machine coordinates): what follows, until the program
            # comes back down, is the route round the rotary to a tool change
            st["tc"] = True
            continue
        if st["tc"] and "Z" in w:
            st["tc"] = False
        prev = (st["X"], st["Z"], st["A"])
        y_prev = st["Y"]
        for ax in "XYZA":
            if ax in w:
                st[ax] = float(w[ax]) * (1.0 if ax == "A" else st["scale"])
        if motion == "G1":
            if st["mode"] == "G93" and "F" not in w:
                errors.append(f"line {n}: G1 in G93 without F")
            f = float(w["F"]) if "F" in w else None
            if f is not None and st["mode"] == "G94":
                f *= st["scale"]           # units/min -> mm/min
            moves.append(("G1", st["op"], st["kind"], st["dia"], *prev, st["X"], st["Z"], st["A"],
                          f, st["Y"], n, y_prev, st["mode"]))
        elif motion == "G0":
            moves.append(("G0", "tc" if st["tc"] else st["op"], st["kind"], st["dia"], *prev, st["X"], st["Z"], st["A"],
                          None, st["Y"], n, y_prev, st["mode"]))
    parse.tapers = tapers
    parse.stickouts = stickouts
    return moves, errors


def tool_points(kind, R, taper=None, top=2.0):
    """Points on the tool's surface, relative to the tip, tool along +Z."""
    ang = np.linspace(0, 2 * np.pi, 24, endpoint=False)
    pts = [(0.0, 0.0, 0.0)]
    if kind == "flat":
        for rr in (R * 0.5, R):
            pts += [(rr * math.cos(t), rr * math.sin(t), 0.0) for t in ang]
        pts += [(R * math.cos(t), R * math.sin(t), 1.0) for t in ang]
        return np.array(pts)
    # ball tip: rings on the sphere below its equator
    for el in np.linspace(0.15, 1.0, 5) * (math.pi / 2):
        rr, h = R * math.sin(el), R - R * math.cos(el)
        pts += [(rr * math.cos(t), rr * math.sin(t), h) for t in ang]
    if kind == "taper":
        a, Rs = taper
        rc, zt = R * math.cos(a), R - R * math.sin(a)
        ztop = zt + (Rs - rc) / math.tan(a)
        for f in np.linspace(0, 1, 10):
            rr, h = rc + (Rs - rc) * f, zt + (ztop - zt) * f
            pts += [(rr * math.cos(t), rr * math.sin(t), h) for t in ang]
        pts += [(Rs * math.cos(t), Rs * math.sin(t), ztop + top) for t in ang]
    else:
        pts += [(R * math.cos(t), R * math.sin(t), R + top) for t in ang]
    return np.array(pts)


def cyl_dist(px, py, pz, t, use_in):
    """Distance from points (machine frame; the tenon is round so A doesn't matter) to a
    solid tenon cylinder; 0 inside."""
    a, b = (t["in0"], t["in1"]) if use_in else (t["x0"], t["x1"])
    dr = np.maximum(0.0, np.hypot(py, pz) - t["r"])
    dx = np.maximum(0.0, np.maximum(a - px, px - b))
    return np.hypot(dr, dx)


def tenon_report(feeds, tenons, cfg):
    """Worst clearance from each op's cutter to the tenons, checked on every move near one."""
    out, ok = [], True
    ang = np.linspace(0, 2 * np.pi, 24, endpoint=False)
    for op in ("corners", "rough", "finish", "index", "parting"):
        ms = [m for m in feeds if m[1] == op]
        if not ms:
            continue
        kind, R = ms[0][2], ms[0][3] / 2
        leave = 0.0 if op in ("finish", "index", "parting") else cfg[op].get("leave", 0.0)
        use_in = op == "parting"
        # endpoints and midpoints of every move, y included (corners move in Y)
        P = []
        for (_, _, _, _, x0, z0, a0, x1, z1, a1, F, y1, n, y0, mode) in ms:
            y0 = y0 or 0.0; y1 = y1 or 0.0
            P.append((x1, y1, z1)); P.append(((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))
        P = np.array(P)
        worst, worst_at = np.inf, None
        for t in tenons:
            a, b = (t["in0"], t["in1"]) if use_in else (t["x0"], t["x1"])
            near = (P[:, 0] > a - R - 1) & (P[:, 0] < b + R + 1)
            Q = P[near]
            if not len(Q):
                continue
            if kind in ("ball", "taper"):
                d = cyl_dist(Q[:, 0], Q[:, 1], Q[:, 2] + R, t, use_in) - R
                if kind == "taper":                    # and the cone (the tenon is round, so A doesn't matter)
                    tp = tool_points("taper", R, parse.tapers[op], 0.0)
                    for ox, oy, oz in tp[tp[:, 2] > R * 0.9]:
                        d = np.minimum(d, cyl_dist(Q[:, 0] + ox, Q[:, 1] + oy, Q[:, 2] + oz, t, use_in))
            else:
                pts = [(0.0, 0.0, 0.0)] + [(rr * math.cos(u), rr * math.sin(u), h) for rr, h in ((R * 0.5, 0.0), (R, 0.0), (R, 1.0)) for u in ang]
                d = np.full(len(Q), np.inf)
                for ox, oy, oz in pts:
                    d = np.minimum(d, cyl_dist(Q[:, 0] + ox, Q[:, 1] + oy, Q[:, 2] + oz, t, use_in))
            k = int(np.argmin(d))
            if d[k] < worst:
                worst, worst_at = float(d[k]), (t["side"], float(Q[k, 0]))
        if worst_at is None:
            continue
        bad = worst < leave - TOL
        ok &= not bad
        out.append(f"  {op}: closest to a tenon {worst:.3f} mm ({worst_at[0]} end, X{worst_at[1]:.2f}), needs >= {leave:.2f}: {'FAIL' if bad else 'ok'}")
    return ok, out


def fixture_list(cfg):
    """The rotary from the job's rig, worked out here (not the CAM's code)."""
    g = cfg.get("rig") or {}
    cf, T = cfg["chuck_face_x"], cfg["tailstock_x"]
    ch, hd, ce, tl = g.get("chuck", {}), g.get("head", {}), g.get("centre", {}), g.get("tail", {})
    out = []
    if ch.get("dia", 0) > 0 and ch.get("len", 0) > 0:
        out.append(("chuck", "round", cf - ch["len"], cf, lambda x, r=ch["dia"] / 2: r))
    def sides(b):
        # front: toward you (-Y), back: away (+Y); before 0.7.1 one width, centred
        if "front" in b or "back" in b:
            return -b.get("front", 0), b.get("back", 0)
        return -b.get("width", 0) / 2, b.get("width", 0) / 2
    if hd.get("len", 0) > 0:
        x1 = cf - ch.get("len", 0)
        y0, y1 = sides(hd)
        if y1 > y0:
            out.append(("headstock", "box", x1 - hd["len"], x1, (y0, y1), hd.get("top", 0)))
    if ce.get("dia", 0) > 0 and ce.get("len", 0) > 0:
        out.append(("live centre", "round", T, T + ce["len"], lambda x, r=ce["dia"] / 2, L=ce["len"]: r * (x - T) / L))
    if tl.get("len", 0) > 0:
        x0 = T + ce.get("len", 0)
        y0, y1 = sides(tl)
        if y1 > y0:
            out.append(("tailstock", "box", x0, x0 + tl["len"], (y0, y1), tl.get("top", 0)))
    return out


def stock_contains(cfg, p):
    """Inside the stock as it was before any cutting (its real shape), part frame."""
    st_ = cfg.get("stock", {}) or {}
    if st_.get("shape") == "square":
        return (np.abs(p[:, 1]) < st_["width"] / 2 - 0.05) & (np.abs(p[:, 2]) < st_["width"] / 2 - 0.05)
    if st_.get("shape") == "rect":
        return (np.abs(p[:, 1]) < st_["width"] / 2 - 0.05) & (np.abs(p[:, 2]) < st_["height"] / 2 - 0.05)
    return np.hypot(p[:, 1], p[:, 2]) < cfg["stock_radius"] - 0.05


def holder_report(moves, mesh, cfg, sw):
    """Collet nut and spindle (vertical cylinders above the tool) against the rotary, the
    part and the stock left uncut past what roughing cut. Points over each holder part's
    bottom face and up its side, at sampled tool positions, must be outside all of them."""
    g = cfg.get("rig") or {}
    nut, sp = g.get("nut", {}), g.get("spindle", {})
    s = cfg["a_sign"]
    fx = fixture_list(cfg)
    R_st = cfg["stock_radius"]
    lines, bad_total = [], 0
    rng = np.random.default_rng(7)
    ang = np.linspace(0, 2 * np.pi, 20, endpoint=False)
    for op in ("corners", "rough", "finish", "index", "parting"):
        so = parse.stickouts.get(op)
        ms = [m for m in moves if m[1] == op and m[4] is not None]
        if not ms or not so:
            continue
        parts = [("collet nut", nut.get("dia", 0) / 2, so, so + nut.get("len", 0))]
        if sp.get("dia", 0) > 0:
            parts.append(("spindle", sp["dia"] / 2, so + nut.get("len", 0), so + nut.get("len", 0) + 60))
        pick = rng.choice(len(ms), size=min(2500, len(ms)), replace=False)
        hits, worst, where = 0, 0.0, None
        for name, rc, h0, h1 in parts:
            if rc <= 0:
                continue
            # bottom face (polar grid) and side (rings) of the cylinder, relative to the tip
            pts = [(0.0, 0.0, h0)] + [(rr * math.cos(t), rr * math.sin(t), h0) for rr in (rc / 3, 2 * rc / 3, rc) for t in ang]
            pts += [(rc * math.cos(t), rc * math.sin(t), h) for h in np.linspace(h0, h1, 5)[1:] for t in ang]
            pts = np.array(pts)
            P = []
            for i in pick:
                _, _, _, _, x0, z0, a0, x1, z1, a1, F, y1, n, y0, mode = ms[i]
                P.append((x1, y1 or 0.0, z1, a1, n))
            for (x, y, z, a, n) in P:
                q = pts + np.array([x, y, z])
                # the rotary: machine frame, doesn't turn
                for f in fx:
                    if f[1] == "box":
                        _, _, xa, xb, (ya, yb), top = f
                        inside = (q[:, 0] > xa) & (q[:, 0] < xb) & (q[:, 1] > ya) & (q[:, 1] < yb) & (q[:, 2] < top)
                        pen = (top - q[inside, 2]).max() if inside.any() else 0.0
                    else:
                        _, _, xa, xb, rf = f
                        sel = (q[:, 0] > xa) & (q[:, 0] < xb)
                        if not sel.any():
                            continue
                        rad = np.hypot(q[sel, 1], q[sel, 2])
                        lim = np.array([rf(xx) for xx in q[sel, 0]])
                        inside = rad < lim
                        pen = (lim - rad)[inside].max() if inside.any() else 0.0
                    if pen > TOL:
                        hits += 1
                        if pen > worst:
                            worst, where = pen, f"{name} into the {f[0]}, line {n}, X{x:.1f}"
                # the part and the uncut stock: the part's frame
                qm = to_model(q, a, s)
                rad = np.hypot(qm[:, 1], qm[:, 2])
                if sw is not None:
                    st_in = ((qm[:, 0] < sw[0] - 0.05) | (qm[:, 0] > sw[1] + 0.05)) & (qm[:, 0] > cfg["chuck_face_x"]) & (qm[:, 0] < cfg["tailstock_x"]) & stock_contains(cfg, qm)
                    if st_in.any():
                        hits += 1
                        # how deep: the most the stock's outline reaches above the holder's bottom, roughly
                        pen = float((R_st - rad[st_in]).max())
                        if pen > worst:
                            worst, where = pen, f"{name} into the uncut stock, line {n}, X{x:.1f}"
                near = rad < mesh_rmax(mesh) + 0.5
                if near.any():
                    d, ins = query(mesh, qm[near])
                    deep = ins & (d > TOL)
                    if deep.any():
                        hits += 1
                        pen = float(d[deep].max())
                        if pen > worst:
                            worst, where = pen, f"{name} into the part, line {n}, X{x:.1f}"
        bad_total += hits
        lines.append(f"holder {op}: {len(pick)} tool positions (stickout {so:.2f}), collisions: {hits}" + (f", worst {worst:.3f} mm ({where})" if hits else ""))
    return bad_total == 0, lines


def mesh_rmax(mesh):
    if not hasattr(mesh_rmax, "v"):
        mesh_rmax.v = float(np.hypot(mesh.vertices[:, 1], mesh.vertices[:, 2]).max())
    return mesh_rmax.v


def main():
    nc, stl, cfg_path = sys.argv[1], sys.argv[2], sys.argv[3]
    cfg = json.load(open(cfg_path))
    mesh = trimesh.load_mesh(stl, force="mesh")
    s = cfg["a_sign"]
    mach = cfg["machine"]
    moves, errors = parse(nc)
    feeds = [m for m in moves if m[0] == "G1" and m[4] is not None]
    print(f"{len(moves)} motion lines, {len(feeds)} feed moves")

    # --- G93 / Y / rates / keep-outs -------------------------------------------------
    # only the corners and indexed ops (A locked, tool offset in Y) may leave the centreline
    y_bad = sum(1 for m in moves if m[1] not in ("corners", "index", "tc") and m[11] not in (None, 0.0))
    rate_bad = {"A": 0, "X": 0, "Z": 0}
    worst = {"A": 0.0, "X": 0.0, "Z": 0.0}
    t_total = 0.0
    keep_bad = 0
    for (_, op, kind, dia, x0, z0, a0, x1, z1, a1, F, y, n, y0, mode) in feeds:
        if mode == "G94":
            dy = (y or 0) - (y0 or 0)
            t = max(math.sqrt((x1 - x0) ** 2 + dy ** 2 + (z1 - z0) ** 2) / F, 1e-9)
        else:
            t = 1.0 / F
        t_total += t
        for ax, d, lim in (("A", abs(a1 - a0), mach["a_max_deg_min"]),
                           ("X", abs(x1 - x0), mach["x_max_mm_min"]),
                           ("Z", abs(z1 - z0), mach["z_max_mm_min"])):
            rate = d / t
            worst[ax] = max(worst[ax], rate)
            if rate > lim * 1.01:
                rate_bad[ax] += 1
        r = dia / 2
        lo = cfg["chuck_face_x"] + cfg["chuck_clearance"] + r
        hi = cfg["tailstock_x"] - cfg["tailstock_clearance"] - r
        if x1 < lo - 1e-6 or x1 > hi + 1e-6:
            keep_bad += 1
    print(f"G93 lines missing F: {len(errors)}")
    print(f"Y off centreline: {y_bad}")
    print("Peak axis rates: " + ", ".join(
        f"{ax} {worst[ax]:.0f} (limit {mach[k]:.0f}, over: {rate_bad[ax]})"
        for ax, k in (("A", "a_max_deg_min"), ("X", "x_max_mm_min"), ("Z", "z_max_mm_min"))))
    print(f"Keep-out violations: {keep_bad}")
    print(f"Cutting time from F words: {t_total:.1f} min")

    # --- gouge checks ------------------------------------------------------------
    rng = np.random.default_rng(1)
    report = {}
    # corners: flat cutter anywhere in Y with A locked; every move sampled along its length
    cm = [m for m in feeds if m[1] == "corners"]
    if cm:
        R = cm[0][3] / 2
        leave = cfg["corners"]["leave"]
        ang = np.linspace(0, 2 * np.pi, 16, endpoint=False)
        disk = [(0.0, 0.0, 0.0)] + [(rr * math.cos(t), rr * math.sin(t), 0.0) for rr in (R * 0.5, R) for t in ang]
        disk += [(R * math.cos(t), R * math.sin(t), 2.0) for t in ang]
        disk = np.array(disk)
        pts = []
        for m in cm:
            _, _, _, _, x0, z0, a0, x1, z1, a1, F, y1, n, y0, mode = m
            nseg = max(2, int(abs(x1 - x0) / 2.0) + 1)
            for f in np.linspace(0, 1, nseg):
                c = np.array([x0 + f * (x1 - x0), (y0 or 0) + f * ((y1 or 0) - (y0 or 0)), z0 + f * (z1 - z0)])
                pts.append(to_model(disk + c, a0 + f * (a1 - a0), s))
        pts = np.vstack(pts)
        dist, inside = query(mesh, pts)
        eats = (~inside) & (dist < leave - TOL)
        report["corners"] = (len(pts), int(inside.sum()), int(eats.sum()))
        print(f"corners (flat D{cm[0][3]}): {len(pts)} cutter points checked, inside part: {int(inside.sum())}, "
              f"closer than leave {leave}: {int(eats.sum())}, min clearance {dist[~inside].min():.3f} mm")

    for op in ("rough", "finish", "index", "parting"):
        ms = [m for m in feeds if m[1] == op]
        if op == "index":
            # its rapids hop low between passes: check them against the part too
            ms = ms + [m for m in moves if m[0] == "G0" and m[1] == op and m[4] is not None]
        if not ms:
            continue
        kind, dia = ms[0][2], ms[0][3]
        R = dia / 2
        n_pick = 3000 if kind in ("ball", "taper") else 800
        if op == "index":
            n_pick = 20000 if kind != "taper" else 8000
        pick = rng.choice(len(ms), size=min(n_pick, len(ms)), replace=False)
        samples = []
        for i in pick:
            _, _, _, _, x0, z0, a0, x1, z1, a1, F, y1, n, y0, mode = ms[i]
            y0 = y0 or 0.0; y1 = y1 or 0.0
            samples.append((x1, y1, z1, a1))
            samples.append(((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, (a0 + a1) / 2))  # machine interpolates linearly
        samples = np.array(samples)
        if kind == "taper":
            # the tip ball's centre at least R from the part, and no point of the cone inside it
            centres = np.array([to_model(np.array([[x, y, z + R]]), a, s)[0] for x, y, z, a in samples])
            dist, inside = query(mesh, centres)
            gouge = (dist < R - TOL) | inside
            tp = tool_points("taper", R, parse.tapers[op], 0.0)
            cone = tp[tp[:, 2] > R * 0.9]
            cpts = np.vstack([to_model(cone + np.array([x, y, z]), a, s) for x, y, z, a in samples])
            # the cone can only get into the part by crossing its surface, so only the cone
            # points near the surface need the (slow) inside test
            if not hasattr(main, "surf_tree"):
                from scipy.spatial import cKDTree
                main.surf_tree = cKDTree(trimesh.sample.sample_surface_even(mesh, int(mesh.area / 0.09))[0])
            dn, _ = main.surf_tree.query(cpts, distance_upper_bound=1.0)
            nearp = np.isfinite(dn)
            cone_in = 0
            if nearp.any():
                cd, cin = query(mesh, cpts[nearp])
                deep = cin & (cd > TOL)               # into the part by more than the tolerance
                cone_in = int(deep.sum())
                cone_max = float(cd[cin].max()) if cin.any() else 0.0
            else:
                cone_max = 0.0
            report[op] = (len(samples), int(gouge.sum()) + cone_in, float((R - dist).max()), 0.0)
            print(f"{op} (tapered ball tip D{dia}, {math.degrees(parse.tapers[op][0]):.1f} deg, shank D{2 * parse.tapers[op][1]:.3f}): {len(samples)} tool positions checked, "
                  f"tip gouges: {int(gouge.sum())}, deepest: {max(0.0, (R - dist).max()):.4f} mm; cone points more than {TOL} mm into the part: {cone_in}, deepest {cone_max:.4f} mm ({int(nearp.sum())} of {len(cpts)} near the surface checked)")
        elif kind == "ball":
            centres = np.array([to_model(np.array([[x, y, z + R]]), a, s)[0] for x, y, z, a in samples])
            dist, inside = query(mesh, centres)
            gouge = (dist < R - TOL) | inside
            touching = dist < R + 0.05
            report[op] = (len(samples), int(gouge.sum()), float((R - dist).max()), float(touching.mean()))
            print(f"{op} (ball D{dia}): {len(samples)} tool positions checked, gouges: {int(gouge.sum())}, "
                  f"deepest: {max(0.0, (R - dist).max()):.4f} mm, touching part: {touching.mean() * 100:.1f}%")
        else:
            leave = cfg[op].get("leave", 0.0) if op != "parting" else 0.0
            # points on the cutter end face + a ring a little way up the flank
            ang = np.linspace(0, 2 * np.pi, 16, endpoint=False)
            disk = [(0.0, 0.0, 0.0)]
            for rr in (R * 0.5, R):
                disk += [(rr * math.cos(t), rr * math.sin(t), 0.0) for t in ang]
            disk += [(R * math.cos(t), R * math.sin(t), 1.0) for t in ang]
            disk = np.array(disk)
            pts = []
            for x, y, z, a in samples:
                p = disk + np.array([x, y, z])
                pts.append(to_model(p, a, s))
            pts = np.vstack(pts)
            dist, inside = query(mesh, pts)
            eats_leave = (~inside) & (dist < leave - TOL)
            report[op] = (len(samples), int(inside.sum()), int(eats_leave.sum()))
            print(f"{op} (flat D{dia}): {len(pts)} cutter points checked, inside part: {int(inside.sum())}, "
                  f"closer than leave {leave}: {int(eats_leave.sum())}, min clearance {dist[~inside].min():.3f} mm")

    # ---- uncut stock: past what roughing cut, no finishing / indexed tool point inside the stock
    stock_ok = True
    rm = [m for m in feeds if m[1] == "rough"]
    if rm:
        rR = rm[0][3] / 2
        xs = [m[7] for m in rm] + [m[4] for m in rm if m[4] is not None]
        sw_lo, sw_hi = min(xs) - rR, max(xs) + rR
        st_ = cfg.get("stock", {}) or {}
        def in_stock(p):
            if st_.get("shape") == "square":
                return (np.abs(p[:, 1]) < st_["width"] / 2 - 0.05) & (np.abs(p[:, 2]) < st_["width"] / 2 - 0.05)
            if st_.get("shape") == "rect":
                return (np.abs(p[:, 1]) < st_["width"] / 2 - 0.05) & (np.abs(p[:, 2]) < st_["height"] / 2 - 0.05)
            return np.hypot(p[:, 1], p[:, 2]) < cfg["stock_radius"] - 0.05
        for op in ("finish", "index"):
            ms = [m for m in moves if m[1] == op and m[4] is not None]
            if not ms:
                continue
            kind, R = ms[0][2], ms[0][3] / 2
            tp = tool_points(kind, R, parse.tapers.get(op), 2.0)
            reach = max(np.hypot(tp[:, 0], tp[:, 1]))
            near = [m for m in ms if m[7] - reach < sw_lo or m[7] + reach > sw_hi or m[4] - reach < sw_lo or m[4] + reach > sw_hi]
            hits = 0
            for m in near:
                _, _, _, _, x0, z0, a0, x1, z1, a1, F, y1, n, y0, mode = m
                y0 = y0 or 0.0; y1 = y1 or 0.0
                for f in (0.0, 0.5, 1.0):
                    p = to_model(tp + np.array([x0 + f * (x1 - x0), y0 + f * (y1 - y0), z0 + f * (z1 - z0)]), a0 + f * (a1 - a0), s)
                    out = (p[:, 0] < sw_lo - 0.05) | (p[:, 0] > sw_hi + 0.05)
                    if (out & in_stock(p)).any():
                        hits += 1
                        break
            stock_ok &= hits == 0
            print(f"{op}: moves near the uncut stock (roughing cut X{sw_lo:.2f}..{sw_hi:.2f}): {len(near)}, running into it: {hits}")
    sw = None
    if rm:
        sw = (sw_lo, sw_hi)
    holder_ok, hlines = holder_report(moves, mesh, cfg, sw)
    print("\n".join(hlines))
    tenon_ok = True
    if len(sys.argv) > 4:
        tenons = json.load(open(sys.argv[4]))
        if tenons:
            print("tenons: " + ", ".join(f"{t['side']} D{2 * t['r']:.2f} X{t['x0']:.2f}..{t['x1']:.2f} (in the part to X{t['in1'] if t['side'] == 'chuck' else t['in0']:.2f})" for t in tenons))
            tenon_ok, lines = tenon_report(feeds, tenons, cfg)
            print("\n".join(lines))
    ok = (tenon_ok and stock_ok and holder_ok and not errors and y_bad == 0 and sum(rate_bad.values()) == 0 and keep_bad == 0
          and all(v[1] == 0 for v in report.values())
          and report.get("rough", (0, 0, 0))[2] == 0 and report.get("corners", (0, 0, 0))[2] == 0)
    print("RESULT:", "PASS" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
