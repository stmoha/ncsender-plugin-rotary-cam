#!/usr/bin/env python3
"""python3 test/fake-grblhal/fake-test.py [program.nc]

Drives fake_grblhal_server.py the way ncSender does (status polls, N-numbered
lines, ok-paced streaming, real-time bytes) and checks it behaves like a machine:
homing, work offsets, jobs that take time with the line number moving, arcs,
G93, feed hold / resume, overrides, jog cancel, probing, reset into Alarm 3, unlock.
"""
import os
import re
import socket
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
PORT = 18765
fails = 0


def ok(cond, msg):
    global fails
    print(("PASS " if cond else "FAIL ") + msg)
    if not cond:
        fails += 1


class Client:
    def __init__(self):
        for _ in range(100):
            try:
                self.s = socket.create_connection(("127.0.0.1", PORT))
                break
            except OSError:
                time.sleep(0.05)
        self.s.settimeout(0.02)
        self.buf = ""
        self.oks = 0
        self.msgs = []
        self.last_status = ""
        self.read_until(lambda: "Grbl" in "".join(self.msgs), 2)

    def pump(self):
        try:
            data = self.s.recv(65536).decode()
        except socket.timeout:
            return
        self.buf += data
        while "\n" in self.buf:
            line, self.buf = self.buf.split("\n", 1)
            line = line.strip()
            if line == "ok":
                self.oks += 1
            elif line.startswith("<"):
                self.last_status = line
            elif line:
                self.msgs.append(line)

    def read_until(self, cond, timeout):
        end = time.time() + timeout
        while time.time() < end:
            self.pump()
            if cond():
                return True
        return False

    def raw(self, b):
        self.s.sendall(b)

    def cmd(self, line, timeout=5):
        want = self.oks + 1
        self.msgs = []
        self.raw((line + "\n").encode())
        return self.read_until(lambda: self.oks >= want or any(m.startswith("error") for m in self.msgs), timeout)

    def status(self):
        self.last_status = ""
        self.raw(b"?")
        self.read_until(lambda: self.last_status, 1)
        st = self.last_status
        f = dict(p.split(":", 1) for p in st.strip("<>").split("|")[1:] if ":" in p)
        f["state"] = st.strip("<>").split("|")[0]
        if "MPos" in f:
            f["mpos"] = [float(v) for v in f["MPos"].split(",")]
        if "WCO" in f:
            f["wco"] = [float(v) for v in f["WCO"].split(",")]
        return f


def main():
    prog = sys.argv[1] if len(sys.argv) > 1 else None
    srv = subprocess.Popen([sys.executable, os.path.join(HERE, "fake_grblhal_server.py"),
                            "--port", str(PORT), "--speed", "20"],
                           stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
    try:
        c = Client()
        st = c.status()
        ok(st["state"] == "Idle" and len(st["mpos"]) == 4, "connects Idle with 4 axes: " + c.last_status)
        c.cmd("$$")
        ok("$22=1" in c.msgs and "$130=800" in c.msgs, "$$ lists settings ($22 homing on, $130 travel)")

        # homing: the status shows Home while it runs, then Idle at machine 0
        c.cmd("G53 G0 X-10 Z-5")
        c.read_until(lambda: c.status()["state"] == "Idle", 3)
        c.raw(b"$H\n")
        seen_home = c.read_until(lambda: c.status()["state"] == "Home", 1)
        ok(seen_home, "status shows Home during homing (ncSender marks the machine homed on Home -> Idle)")
        c.read_until(lambda: c.status()["state"] == "Idle", 3)
        ok(c.status()["mpos"][:3] == [0, 0, 0], "homed at machine 0")

        # work zero with G10 L20, as ncSender's zero buttons do
        c.cmd("G53 G0 X-400 Y-300 Z-80")
        c.read_until(lambda: c.status()["state"] == "Idle", 3)
        c.cmd("G10 L20 P1 X0 Y0 Z0 A0")
        st = c.status()
        ok(st["wco"][:3] == [-400, -300, -80], "G10 L20 sets the work offset: WCO " + st["WCO"])
        c.cmd("$#")
        ok(any(m.startswith("[G54:-400.000,-300.000,-80.000") for m in c.msgs), "$# reports G54")

        # a move takes time and the position goes along it
        t0 = time.time()
        c.cmd("N10 G1 X100 F600")    # 100 mm at 600 mm/min = 10 s, /20 = 0.5 s
        mid = c.status()
        ok(mid["state"] == "Run" and mid["Ln"] == "10", "a feed move runs, Ln = 10: " + c.last_status)
        c.read_until(lambda: c.status()["state"] == "Idle", 3)
        took = time.time() - t0
        ok(0.35 < took < 1.0, f"100 mm at F600 took {took:.2f} s at x20 (expected ~0.5)")
        ok(abs(c.status()["mpos"][0] - (-300)) < 1e-6, "ended at work X100 (machine X-300)")

        # arc: halfway through a half circle the position is on the circle
        c.cmd("G0 X0 Y0")
        c.read_until(lambda: c.status()["state"] == "Idle", 3)
        c.cmd("N20 G2 X20 Y0 I10 J0 F300")   # pi*10 = 31.4 mm, 6.3 s, /20 = 0.31 s
        time.sleep(0.12)
        st = c.status()
        x, y = st["mpos"][0] + 400, st["mpos"][1] + 300
        ok(abs(((x - 10) ** 2 + y ** 2) ** 0.5 - 10) < 0.05 and y > 0.5, f"arc point on the circle above the axis: X{x:.2f} Y{y:.2f}")
        c.read_until(lambda: c.status()["state"] == "Idle", 3)

        # G93 inverse time with A
        t0 = time.time()
        c.cmd("G93 N30 G1 A90 F6")    # 1/6 min = 10 s, /20 = 0.5 s
        c.read_until(lambda: c.status()["state"] == "Idle", 3)
        took = time.time() - t0
        ok(0.35 < took < 1.0 and abs(c.status()["mpos"][3] - 90) < 1e-6, f"G93 F6 A90 took {took:.2f} s (expected ~0.5), A=90")
        c.cmd("G94")

        # feed hold and resume
        c.cmd("N40 G1 X200 F600")
        time.sleep(0.1)
        c.raw(b"!")
        time.sleep(0.05)
        p1 = c.status()
        time.sleep(0.2)
        p2 = c.status()
        ok(p1["state"].startswith("Hold") and p1["mpos"] == p2["mpos"], "feed hold stops it: " + p2["state"])
        c.raw(b"~")
        c.read_until(lambda: c.status()["state"] == "Idle", 5)
        ok(abs(c.status()["mpos"][0] - (-200)) < 1e-6, "resume finishes the move")

        # feed override changes the time
        c.raw(bytes([0x92]) * 5)    # -50 %
        st = c.status()
        ok(st["Ov"].startswith("50,"), "feed override reported: Ov " + st["Ov"])
        t0 = time.time()
        c.cmd("G1 X100 F600")
        c.read_until(lambda: c.status()["state"] == "Idle", 5)
        took = time.time() - t0
        ok(0.8 < took < 1.6, f"at 50 % feed the same move took {took:.2f} s (expected ~1.0)")
        c.raw(bytes([0x90]))

        # jog and jog cancel
        c.cmd("$J=G91 G21 X50 F600")
        time.sleep(0.1)
        ok(c.status()["state"] == "Jog", "jog shows Jog")
        c.raw(bytes([0x85]))
        time.sleep(0.05)
        st = c.status()
        ok(st["state"] == "Idle" and -300 < st["mpos"][0] < -250, "jog cancel stops it part way: X " + str(st["mpos"][0]))

        # probe
        c.cmd("G38.2 Z-20 F100")
        ok(any(m.startswith("[PRB:") and m.endswith(":1]") for m in c.msgs), "G38.2 touches and reports [PRB]")

        # streaming a real program: ok-paced, planner keeps at most 16 moves, Ln moves
        if prog and os.path.exists(prog):
            lines = [l.strip() for l in open(prog) if l.strip()][:400]
            c.cmd("G10 L20 P1 X0 Y0 Z0 A0")
            sent, acked0 = 0, c.oks
            lns, bf_min = [], 99
            t0 = time.time()
            while sent < len(lines) or c.status()["state"] != "Idle":
                # keep up to 5 lines in flight, like a sender
                while sent < len(lines) and sent - (c.oks - acked0) < 5:
                    c.raw(f"N{sent + 1} {lines[sent]}\n".encode())
                    sent += 1
                st = c.status()
                if "Ln" in st:
                    lns.append(int(st["Ln"]))
                if "Bf" in st:
                    bf_min = min(bf_min, int(st["Bf"].split(",")[0]))
                if time.time() - t0 > 60:
                    break
            took = time.time() - t0
            ok(c.oks - acked0 == len(lines), f"{len(lines)} program lines all acknowledged in {took:.1f} s")
            ok(lns == sorted(lns) and len(set(lns)) > 20, f"Ln climbs through the job ({len(set(lns))} different lines seen)")
            ok(bf_min == 0, "the planner buffer fills (Bf reaches 0): moves really queue up")

        # reset while moving: Alarm 3, unlock with $X
        c.cmd("G94 G1 X300 F600")
        time.sleep(0.05)
        c.msgs = []
        c.raw(b"\x18")
        c.read_until(lambda: any("Grbl" in m for m in c.msgs), 2)
        st = c.status()
        ok(st["state"].startswith("Alarm"), "reset while moving -> Alarm: " + st["state"])
        ok(any(m == "ALARM:3" for m in c.msgs), "it says ALARM:3 (ncSender reads the alarm number from it)")
        c.cmd("G0 X0")
        ok(any(m == "error:9" for m in c.msgs), "moves are refused in Alarm (error:9)")
        c.cmd("$X")
        ok(c.status()["state"] == "Idle", "$X unlocks")
    finally:
        srv.terminate()
    print("\nFAILS:", fails)
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
