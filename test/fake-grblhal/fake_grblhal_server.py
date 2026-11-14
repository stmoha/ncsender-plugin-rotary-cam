#!/usr/bin/env python3
"""
fake_grblhal_server.py

A stand-in Grbl controller on TCP, so ncSender connects and runs jobs with no
machine attached. Point ncSender's connection at it: Ethernet / Telnet,
IP 127.0.0.1, port <PORT>.

It simulates a machine well enough to test with:
  - homing ($H): shows "Home" for a moment, then Idle and homed at machine 0
  - jobs that take time: moves are planned in a 16-move buffer like Grbl, each
    takes as long as its feed says (G94 mm/min or G93 inverse time, rapids at
    the $110-$113 max rates), and the position in the status reports moves
    along lines and arcs, with the line number (Ln) ncSender tracks progress by
  - feed hold (!), resume (~), reset (Ctrl-X: Alarm 3 if it was moving),
    unlock ($X), jog and jog cancel, feed / rapid / spindle overrides
  - work offsets: G10 L2 / L20, G92, G43.1 / G49, G54-G59, $# and $G reports
  - probing (G38.2-G38.5): touches halfway to the target and reports [PRB:...]
  - spindle and coolant (M3/M4/M5, M7/M8/M9), dwell (G4), M0 pause, M2/M30
  - a rotary A axis in degrees (on by default; --axes 3 for XYZ)

It is a test stand-in, not a real Grbl: no acceleration, no soft limits, no
checking that G-code is valid beyond what a test needs.

Usage:
    python fake_grblhal_server.py                 port 8000, XYZA, real time
    python fake_grblhal_server.py --speed 10      jobs run 10x faster
    python fake_grblhal_server.py --axes 3        plain XYZ machine
    python fake_grblhal_server.py --verbose       print all traffic
"""

import argparse
import asyncio
import math
import re
from collections import deque

GREETING = "Grbl 1.1h ['$' for help]\r\n"
VERSION_LINES = ["[VER:1.1h.20260101:]", "[OPT:V,15,128]"]
PLANNER_SIZE = 16
RX_SIZE = 128
WORD_RE = re.compile(r"([A-Z])\s*([-+]?(?:\d+\.?\d*|\.\d+))")

DEFAULT_SETTINGS = {
    0: 10, 1: 25, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 10: 1, 11: 0.010, 12: 0.002,
    13: 0, 20: 0, 21: 0, 22: 1, 23: 0, 24: 25, 25: 500, 26: 250, 27: 1,
    30: 1000, 31: 0, 32: 0,
    100: 80, 101: 80, 102: 400, 103: 44.444,
    110: 5000, 111: 5000, 112: 2000, 113: 10800,
    120: 200, 121: 200, 122: 100, 123: 1000,
    130: 800, 131: 800, 132: 150, 133: 0,
}


class Block:
    """One planned move. Positions are machine coordinates (mm, A in degrees)."""

    def __init__(self, start, end, duration, n=0, kind="feed", feed=0.0, arc=None, jog=False):
        self.start = start
        self.end = end
        self.duration = max(duration, 1e-6)   # seconds at 100 %
        self.n = n
        self.kind = kind                      # "rapid" or "feed"
        self.feed = feed                      # mm/min shown in FS
        self.arc = arc                        # (plane axes, center, radius, a0, sweep)
        self.jog = jog
        self.done = 0.0                       # seconds of this move already run

    def position(self, t):
        f = min(max(t / self.duration, 0.0), 1.0)
        p = {k: self.start[k] + (self.end[k] - self.start[k]) * f for k in self.start}
        if self.arc:
            (u, v), (cu, cv), r, a0, sweep = self.arc
            ang = a0 + sweep * f
            p[u] = cu + r * math.cos(ang)
            p[v] = cv + r * math.sin(ang)
        return p


class Machine:
    def __init__(self, axes, speed):
        self.axes = "XYZA"[:axes]
        self.speed = speed
        self.settings = dict(DEFAULT_SETTINGS)
        self.mpos = {k: 0.0 for k in self.axes}
        self.status = "Idle"
        self.alarm = None
        self.homed = False
        self.planner = deque()
        self.hold = False
        self.ln = 0
        # parser (modal) state
        self.absolute = True
        self.inches = False
        self.inverse_time = False
        self.motion = 0
        self.plane = 17
        self.wcs = 54
        self.feed = 0.0
        self.spindle = 0.0
        self.spindle_dir = 5
        self.coolant = set()
        self.tool = 0
        # offsets
        self.offsets = {p: {k: 0.0 for k in self.axes} for p in range(54, 60)}
        self.g92 = {k: 0.0 for k in self.axes}
        self.g28 = {k: 0.0 for k in self.axes}
        self.g30 = {k: 0.0 for k in self.axes}
        self.tlo = 0.0
        self.prb = ({k: 0.0 for k in self.axes}, 0)
        # overrides (%)
        self.ov_feed, self.ov_rapid, self.ov_spindle = 100, 100, 100
        # end of the last planned move (parser position, machine coords)
        self.planned = dict(self.mpos)

    # ---------- coordinates
    def wco(self):
        w = {k: self.offsets[self.wcs][k] + self.g92[k] for k in self.axes}
        w["Z"] += self.tlo
        return w

    def fmt(self, d):
        return ",".join(f"{d[k]:.3f}" for k in self.axes)

    def current_block(self):
        return self.planner[0] if self.planner else None

    def busy(self):
        return bool(self.planner)

    # ---------- status
    def status_line(self, rx_free):
        state = self.status
        if self.alarm is not None:
            state = f"Alarm:{self.alarm}"   # grblHAL style: ncSender reads the code from here
        elif self.status == "Home":
            state = "Home"
        elif self.hold:
            state = "Hold:0"
        elif self.planner:
            state = "Jog" if self.planner[0].jog else "Run"
        else:
            state = "Idle"
        b = self.current_block()
        fr = 0.0
        if b and not self.hold and self.status != "Home":
            fr = b.feed * (self.ov_rapid if b.kind == "rapid" else self.ov_feed) / 100
        spin = self.spindle * self.ov_spindle / 100 if self.spindle_dir in (3, 4) else 0
        acc = ""
        if self.spindle_dir == 3:
            acc += "S"
        elif self.spindle_dir == 4:
            acc += "C"
        if 8 in self.coolant:
            acc += "F"
        if 7 in self.coolant:
            acc += "M"
        parts = [
            state,
            f"MPos:{self.fmt(self.mpos)}",
            f"Bf:{PLANNER_SIZE - len(self.planner)},{rx_free}",
            f"Ln:{(b.n or self.ln) if b else self.ln}",
            f"FS:{fr:.0f},{spin:.0f}",
            f"WCO:{self.fmt(self.wco())}",
            f"Ov:{self.ov_feed},{self.ov_rapid},{self.ov_spindle}",
        ]
        if acc:
            parts.append(f"A:{acc}")
        return "<" + "|".join(parts) + ">\r\n"

    # ---------- motion clock
    def tick(self, dt):
        if self.hold or self.status == "Home" or not self.planner:
            return
        dt *= self.speed
        while self.planner and dt > 0:
            b = self.planner[0]
            ov = (self.ov_rapid if b.kind == "rapid" else self.ov_feed) / 100
            left = (b.duration - b.done) / ov
            if dt < left:
                b.done += dt * ov
                self.mpos = b.position(b.done)
                self.ln = b.n or self.ln
                return
            dt -= left
            self.mpos = dict(b.end)
            self.ln = b.n or self.ln
            self.planner.popleft()

    def stop_motion(self):
        """Feed hold then flush, or reset: stop where it is."""
        self.planner.clear()
        self.planned = dict(self.mpos)

    # ---------- planning
    def rapid_time(self, start, end):
        t = 0.0
        for i, k in enumerate(self.axes):
            rate = float(self.settings.get(110 + i, 1000)) or 1000
            t = max(t, abs(end[k] - start[k]) / rate * 60)
        return t

    def rapid_rate(self, start, end, t):
        d = math.sqrt(sum((end[k] - start[k]) ** 2 for k in self.axes))
        return d / t * 60 if t > 0 else 0

    def plan_line(self, end, n, kind, feed_value=None, jog=False):
        start = dict(self.planned)
        if all(abs(end[k] - start[k]) < 1e-9 for k in self.axes):
            return
        if kind == "rapid":
            t = self.rapid_time(start, end)
            self.planner.append(Block(start, end, t, n, "rapid", self.rapid_rate(start, end, t), jog=jog))
        else:
            d = math.sqrt(sum((end[k] - start[k]) ** 2 for k in self.axes))
            t = self.feed_time(d, feed_value)
            self.planner.append(Block(start, end, t, n, "feed", d / t * 60 if t else 0, jog=jog))
        self.planned = dict(end)

    def feed_time(self, length, feed_value=None):
        f = self.feed if feed_value is None else feed_value
        if self.inverse_time and feed_value is None:
            return 60.0 / f if f > 0 else 0.0
        return length / f * 60 if f > 0 else 0.0


class Controller:
    """Parses lines and real-time bytes, feeds the planner, answers ok/error."""

    def __init__(self, m: Machine, send, log):
        self.m = m
        self.send = send
        self.log = log
        self.lines = deque()
        self.rx_used = 0
        self.wake = asyncio.Event()
        self.generation = 0   # bumped by a reset: replies to lines from before it are dropped

    # ---------- real-time bytes
    async def realtime(self, ch):
        m = self.m
        o = ord(ch)
        if ch == "?":
            await self.send(m.status_line(RX_SIZE - self.rx_used))
        elif ch == "!":
            if m.planner:
                m.hold = True
        elif ch == "~":
            m.hold = False
        elif o == 0x18:
            self.generation += 1
            was_moving = bool(m.planner) and not m.hold
            m.stop_motion()
            m.hold = False
            self.lines.clear()
            self.rx_used = 0
            m.spindle_dir, m.coolant = 5, set()
            m.motion, m.inverse_time, m.absolute = 0, False, True
            if was_moving or m.status == "Home":
                m.alarm, m.homed = 3, False
                m.status = "Idle"
                await self.send("ALARM:3\r\n")
            await self.send(GREETING)
            if m.alarm == 3:
                await self.send("[MSG:'$H'|'$X' to unlock]\r\n")
        elif o == 0x85:   # jog cancel
            if m.planner and m.planner[0].jog:
                m.stop_motion()
        elif o == 0x90:
            m.ov_feed = 100
        elif o == 0x91:
            m.ov_feed = min(200, m.ov_feed + 10)
        elif o == 0x92:
            m.ov_feed = max(10, m.ov_feed - 10)
        elif o == 0x93:
            m.ov_feed = min(200, m.ov_feed + 1)
        elif o == 0x94:
            m.ov_feed = max(10, m.ov_feed - 1)
        elif o == 0x95:
            m.ov_rapid = 100
        elif o == 0x96:
            m.ov_rapid = 50
        elif o == 0x97:
            m.ov_rapid = 25
        elif o == 0x99:
            m.ov_spindle = 100
        elif o == 0x9A:
            m.ov_spindle = min(200, m.ov_spindle + 10)
        elif o == 0x9B:
            m.ov_spindle = max(10, m.ov_spindle - 10)
        elif o == 0x9C:
            m.ov_spindle = min(200, m.ov_spindle + 1)
        elif o == 0x9D:
            m.ov_spindle = max(10, m.ov_spindle - 1)
        else:
            return False
        return True

    def queue_line(self, line):
        self.lines.append(line)
        self.rx_used += len(line) + 1
        self.wake.set()

    # ---------- line runner
    async def run(self):
        while True:
            while not self.lines:
                self.wake.clear()
                await self.wake.wait()
            line = self.lines[0]
            gen = self.generation
            reply = await self.execute(line)
            if gen != self.generation:
                continue
            if self.lines and self.lines[0] is line:
                self.lines.popleft()
                self.rx_used = max(0, self.rx_used - len(line) - 1)
            if reply:
                await self.send(reply)

    async def wait_planner(self, empty=False):
        m = self.m
        while (m.planner if empty else len(m.planner) >= PLANNER_SIZE) or (empty and m.hold):
            await asyncio.sleep(0.005)

    async def execute(self, line):
        m = self.m
        self.log(f"[sim] <- {line!r}")
        text = re.sub(r"\(.*?\)", "", line).split(";")[0].strip().upper()
        if not text:
            return "ok\r\n"
        if text.startswith("$"):
            return await self.system(text)
        if m.alarm is not None:
            return "error:9\r\n"
        return await self.gcode(text)

    # ---------- $ commands
    async def system(self, text):
        m = self.m
        if text.startswith("$J="):
            if m.alarm is not None:
                return "error:9\r\n"
            await self.wait_planner()
            return self.jog(text[3:])
        await self.wait_planner(empty=True)
        if text == "$$":
            out = "".join(f"${k}={v}\r\n" for k, v in sorted(m.settings.items()))
            return out + "ok\r\n"
        if text == "$X":
            m.alarm = None
            await self.send("[MSG:Caution: Unlocked]\r\n")
            return "ok\r\n"
        if text.startswith("$H"):
            if m.settings.get(22, 0) & 1 == 0:
                return "error:5\r\n"
            m.alarm = None
            m.status = "Home"
            await asyncio.sleep(max(0.3, 3.0 / m.speed))
            for k in "XYZ":
                if k in m.mpos:
                    m.mpos[k] = 0.0
            m.planned = dict(m.mpos)
            m.status = "Idle"
            m.homed = True
            return "ok\r\n"
        if text == "$G":
            return self.gc_line() + "ok\r\n"
        if text == "$#":
            out = [f"[G{p}:{m.fmt(m.offsets[p])}]" for p in range(54, 60)]
            out += [f"[G28:{m.fmt(m.g28)}]", f"[G30:{m.fmt(m.g30)}]", f"[G92:{m.fmt(m.g92)}]",
                    f"[TLO:{m.tlo:.3f}]", f"[PRB:{m.fmt(m.prb[0])}:{m.prb[1]}]"]
            return "".join(s + "\r\n" for s in out) + "ok\r\n"
        if text.startswith("$I"):
            return "".join(s + "\r\n" for s in VERSION_LINES) + "ok\r\n"
        mset = re.match(r"\$(\d+)=([-+]?[\d.]+)$", text)
        if mset:
            k, v = int(mset.group(1)), float(mset.group(2))
            m.settings[k] = int(v) if v.is_integer() else v
            return "ok\r\n"
        return "ok\r\n"

    def gc_line(self):
        m = self.m
        g = [f"G{m.motion}", f"G{m.wcs}", f"G{m.plane}", "G20" if m.inches else "G21",
             "G90" if m.absolute else "G91", "G93" if m.inverse_time else "G94",
             f"M{m.spindle_dir}", "M8" if 8 in m.coolant else ("M7" if 7 in m.coolant else "M9"),
             f"T{m.tool}", f"F{m.feed:g}", f"S{m.spindle:g}"]
        return f"[GC:{' '.join(g)}]\r\n"

    def jog(self, text):
        m = self.m
        words = WORD_RE.findall(text)
        absolute, inches, machine = True, m.inches, False
        target = {}
        feed = None
        for letter, value in words:
            v = float(value)
            if letter == "G":
                if v == 90:
                    absolute = True
                elif v == 91:
                    absolute = False
                elif v == 20:
                    inches = True
                elif v == 21:
                    inches = False
                elif v == 53:
                    machine = True
            elif letter == "F":
                feed = v * (25.4 if inches else 1)
            elif letter in m.axes:
                target[letter] = v
        if feed is None:
            return "error:22\r\n"
        start = dict(m.planned)
        end = dict(start)
        wco = m.wco()
        for k, v in target.items():
            scale = 25.4 if inches and k != "A" else 1
            if not absolute:
                end[k] = start[k] + v * scale
            elif machine:
                end[k] = v * scale
            else:
                end[k] = v * scale + wco[k]
        save = m.inverse_time
        m.inverse_time = False
        m.plan_line(end, 0, "feed", feed, jog=True)
        m.inverse_time = save
        return "ok\r\n"

    # ---------- G-code
    async def gcode(self, text):
        m = self.m
        words = WORD_RE.findall(text)
        n = 0
        gs, ms = [], []
        vals = {}
        for letter, value in words:
            if letter == "N":
                n = int(float(value))
            elif letter == "G":
                gs.append(float(value))
            elif letter == "M":
                ms.append(int(float(value)))
            else:
                vals[letter] = float(value)

        non_modal = None
        motion = None
        for g in gs:
            gi = int(round(g * 10))
            if gi in (0, 10, 20, 30):
                motion = gi // 10
            elif gi in (382, 383, 384, 385):
                motion = gi / 10
            elif gi == 800:
                m.motion = 80
            elif gi in (170, 180, 190):
                m.plane = gi // 10
            elif gi == 200:
                m.inches = True
            elif gi == 210:
                m.inches = False
            elif gi == 900:
                m.absolute = True
            elif gi == 910:
                m.absolute = False
            elif gi == 930:
                m.inverse_time = True
            elif gi == 940:
                m.inverse_time = False
            elif 540 <= gi <= 590 and gi % 10 == 0:
                m.wcs = gi // 10
            elif gi in (40, 100, 280, 281, 300, 301, 530, 920, 921, 922, 923, 431, 490):
                non_modal = gi
            # anything else (G40, G49 handled, G17 etc.) is accepted and ignored

        if "F" in vals:
            m.feed = vals["F"] * (25.4 if m.inches and not m.inverse_time else 1)
        if "S" in vals:
            m.spindle = vals["S"]
        if "T" in vals:
            m.tool = int(vals["T"])

        # Program flow, spindle and coolant wait for the moves before them, as in Grbl.
        sync_m = [x for x in ms if x in (0, 1, 2, 3, 4, 5, 7, 8, 9, 30)]
        if sync_m or non_modal in (40, 100, 280, 281, 300, 301, 920, 921, 922, 923, 431, 490):
            await self.wait_planner(empty=True)

        for code in ms:
            if code in (3, 4, 5):
                m.spindle_dir = code
            elif code in (7, 8):
                m.coolant.add(code)
            elif code == 9:
                m.coolant = set()
            elif code in (2, 30):
                m.spindle_dir, m.coolant = 5, set()
                m.motion, m.absolute, m.inverse_time, m.plane, m.wcs = 1, True, False, 17, 54
                m.g92 = {k: 0.0 for k in m.axes}
            elif code == 0:
                m.hold = True

        axis_words = {k: vals[k] for k in m.axes if k in vals}

        if non_modal == 40:
            await asyncio.sleep(vals.get("P", 0) / m.speed)
            return "ok\r\n"
        if non_modal == 100:
            return self.g10(vals, axis_words)
        if non_modal in (920,):
            for k, v in axis_words.items():
                m.g92[k] = m.mpos[k] - m.offsets[m.wcs][k] - (m.tlo if k == "Z" else 0) - self.to_mm(k, v)
            return "ok\r\n"
        if non_modal in (921, 922):
            m.g92 = {k: 0.0 for k in m.axes}
            return "ok\r\n"
        if non_modal == 431:
            m.tlo = self.to_mm("Z", vals.get("Z", 0.0))
            return "ok\r\n"
        if non_modal == 490:
            m.tlo = 0.0
            return "ok\r\n"
        if non_modal in (281, 301):
            store = m.g28 if non_modal == 281 else m.g30
            store.update(m.mpos)
            return "ok\r\n"
        if non_modal in (280, 300):
            store = m.g28 if non_modal == 280 else m.g30
            if axis_words:
                mid = self.target(axis_words, machine=False)
                m.plan_line(mid, n, "rapid")
                end = dict(mid)
                for k in axis_words:
                    end[k] = store[k]
            else:
                end = dict(store)
            m.plan_line(end, n, "rapid")
            return "ok\r\n"

        if motion is not None:
            m.motion = motion
        if not axis_words:
            m.ln = n or m.ln
            return "ok\r\n"
        if m.motion == 80:
            return "error:31\r\n"

        await self.wait_planner()
        machine = non_modal == 530
        end = self.target(axis_words, machine)
        mo = m.motion
        if mo == 0:
            m.plan_line(end, n, "rapid")
        elif mo == 1:
            if m.feed <= 0:
                return "error:22\r\n"
            m.plan_line(end, n, "feed")
        elif mo in (2, 3):
            if m.feed <= 0:
                return "error:22\r\n"
            self.plan_arc(end, vals, n, clockwise=(mo == 2))
        elif isinstance(mo, float):   # G38.x probe
            return await self.probe(end, n, mo)
        return "ok\r\n"

    def to_mm(self, k, v):
        return v * (25.4 if self.m.inches and k != "A" else 1)

    def target(self, axis_words, machine=False):
        m = self.m
        end = dict(m.planned)
        wco = m.wco()
        for k, v in axis_words.items():
            v = self.to_mm(k, v)
            if machine:
                end[k] = v
            elif m.absolute:
                end[k] = v + wco[k]
            else:
                end[k] = end[k] + v
        return end

    def g10(self, vals, axis_words):
        m = self.m
        L = int(vals.get("L", 0))
        p = int(vals.get("P", 0))
        wcs = m.wcs if p == 0 else 53 + p
        if wcs not in m.offsets:
            return "error:29\r\n"
        for k, v in axis_words.items():
            v = self.to_mm(k, v)
            if L == 2:
                m.offsets[wcs][k] = v
            elif L == 20:
                m.offsets[wcs][k] = m.mpos[k] - v - m.g92[k] - (m.tlo if k == "Z" else 0)
        return "ok\r\n"

    def plan_arc(self, end, vals, n, clockwise):
        m = self.m
        u, v, w = {17: ("X", "Y", "Z"), 18: ("Z", "X", "Y"), 19: ("Y", "Z", "X")}[m.plane]
        off = {17: ("I", "J"), 18: ("K", "I"), 19: ("J", "K")}[m.plane]
        start = dict(m.planned)
        su, sv, eu, ev = start[u], start[v], end[u], end[v]
        if "R" in vals:
            r = self.to_mm(u, vals["R"])
            dx, dy = eu - su, ev - sv
            chord = math.hypot(dx, dy)
            if chord < 1e-9:
                return m.plan_line(end, n, "feed")
            h = math.sqrt(max(0.0, r * r - chord * chord / 4))
            sign = -1 if clockwise != (r < 0) else 1
            cu = (su + eu) / 2 - sign * h * dy / chord
            cv = (sv + ev) / 2 + sign * h * dx / chord
            radius = abs(r)
        else:
            cu = su + self.to_mm(u, vals.get(off[0], 0.0))
            cv = sv + self.to_mm(v, vals.get(off[1], 0.0))
            radius = math.hypot(su - cu, sv - cv)
        a0 = math.atan2(sv - cv, su - cu)
        a1 = math.atan2(ev - cv, eu - cu)
        sweep = a1 - a0
        if clockwise and sweep >= -1e-9:
            sweep -= 2 * math.pi
        elif not clockwise and sweep <= 1e-9:
            sweep += 2 * math.pi
        arc_len = abs(sweep) * radius
        other = sum((end[k] - start[k]) ** 2 for k in m.axes if k not in (u, v))
        length = math.sqrt(arc_len ** 2 + other)
        t = m.feed_time(length)
        if radius < 1e-9 or t <= 0:
            return m.plan_line(end, n, "feed")
        m.planner.append(Block(start, end, t, n, "feed", length / t * 60, arc=((u, v), (cu, cv), radius, a0, sweep)))
        m.planned = dict(end)

    async def probe(self, end, n, kind):
        m = self.m
        await self.wait_planner(empty=True)
        start = dict(m.planned)
        touch = {k: start[k] + (end[k] - start[k]) * 0.5 for k in m.axes}
        towards = kind in (38.2, 38.3)
        stop = touch if towards else end
        m.plan_line(stop, n, "feed")
        await self.wait_planner(empty=True)
        m.prb = (dict(m.mpos), 1)
        await self.send(f"[PRB:{m.fmt(m.mpos)}:1]\r\n")
        return "ok\r\n"


class Session:
    def __init__(self, reader, writer, machine, verbose):
        self.reader, self.writer = reader, writer
        self.verbose = verbose
        self.ctl = Controller(machine, self.send, self.log)
        self.buf = ""

    def log(self, msg):
        if self.verbose:
            print(msg)

    async def send(self, data):
        self.writer.write(data.encode("ascii", errors="replace"))
        await self.writer.drain()

    async def run(self):
        await self.send(GREETING)
        runner = asyncio.create_task(self.ctl.run())
        try:
            while True:
                chunk = await self.reader.read(4096)
                if not chunk:
                    break
                for ch in chunk.decode("latin-1"):
                    if await self.ctl.realtime(ch):
                        if ord(ch) == 0x18:
                            self.buf = ""
                        continue
                    if ch == "\n":
                        line = self.buf.strip("\r")
                        self.buf = ""
                        if line.strip():
                            self.ctl.queue_line(line)
                    elif ch != "\r":
                        self.buf += ch
        except (ConnectionResetError, asyncio.IncompleteReadError):
            pass
        finally:
            runner.cancel()
            self.writer.close()


async def clock(machine):
    loop = asyncio.get_running_loop()
    last = loop.time()
    while True:
        await asyncio.sleep(0.01)
        now = loop.time()
        machine.tick(now - last)
        last = now


async def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind (default: 8000)")
    parser.add_argument("--axes", type=int, choices=(3, 4), default=4,
                        help="3 = XYZ, 4 = XYZ + rotary A (default: 4)")
    parser.add_argument("--speed", type=float, default=1.0,
                        help="How much faster than real time moves run (default: 1)")
    parser.add_argument("--verbose", action="store_true", help="Print all traffic")
    args = parser.parse_args()

    machine = Machine(args.axes, max(args.speed, 0.01))
    asyncio.create_task(clock(machine))

    async def handle(reader, writer):
        peer = writer.get_extra_info("peername")
        print(f"Client connected: {peer}")
        try:
            await Session(reader, writer, machine, args.verbose).run()
        finally:
            print(f"Client disconnected: {peer}")

    server = await asyncio.start_server(handle, args.host, args.port)
    addrs = ", ".join(str(s.getsockname()) for s in server.sockets)
    print(f"Fake grblHAL server listening on {addrs} ({machine.axes}, speed x{args.speed:g})")
    print("Point ncSender at it: Ethernet / Telnet, IP 127.0.0.1, "
          f"port {args.port}. Ctrl+C to stop.")
    async with server:
        await server.serve_forever()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
