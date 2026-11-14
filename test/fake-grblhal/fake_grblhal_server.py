#!/usr/bin/env python3
"""
fake_grblhal_server.py

A minimal grblHAL-ish TCP responder so ncSender can be driven into a fully
"idle/connected" state with no real CNC controller attached. Point ncSender's
connection settings at this (Ethernet / Telnet, host=127.0.0.1, port=<PORT>)
instead of a real machine.

Implements just enough of the wire protocol for ncSender's CncController to:
  - detect a valid controller (greeting line containing "Grbl" + "for help")
  - complete its verification handshake (first <...> status report)
  - keep polling happy (`?` -> status report every ~100ms from ncSender)
  - accept jogs / homing / G-code lines and ack with "ok"
  - track a simple simulated machine position so jogs/moves visibly update

This is NOT a G-code interpreter. It fakes acknowledgements and position
tracking well enough for UI/plugin testing (dialogs, tool tables, G-code
Navigator style tooling, etc.) — it will not run a real toolpath faithfully.

Usage:
    python fake_grblhal_server.py --port 8000
    python fake_grblhal_server.py --port 23 --verbose
    python fake_grblhal_server.py --axes 3     (no A axis, plain XYZ machine)

By default it reports a 4th axis (A, rotary, in degrees) so 4th-axis work can be
tested: jog A and the 3D view's spindle marker swings round the part.

Then in ncSender: Settings -> (Setup or Connection) -> Ethernet -> Telnet,
IP = 127.0.0.1, Port = <same port>, Connect.
"""

import argparse
import asyncio
import re
import time

GREETING = "Grbl 1.1h ['$' for help]\r\n"

AXIS_RE = re.compile(r"([XYZA])(-?\d*\.?\d+)", re.IGNORECASE)
FEED_RE = re.compile(r"F(-?\d*\.?\d+)", re.IGNORECASE)


class MachineState:
    """Simple shared simulated machine state."""

    def __init__(self, axes: int = 4):
        self.axes = axes
        self.x = 0.0
        self.y = 0.0
        self.z = 0.0
        self.a = 0.0
        self.status = "Idle"
        self.homed = True
        self.feed = 0.0
        self.spindle_target = 0.0
        self.spindle_actual = 0.0

    def status_line(self) -> str:
        mpos = f"{self.x:.3f},{self.y:.3f},{self.z:.3f}"
        wco = "0.000,0.000,0.000"
        if self.axes >= 4:
            mpos += f",{self.a:.3f}"
            wco += ",0.000"
        return (
            f"<{self.status}|"
            f"MPos:{mpos}|"
            f"FS:{self.feed:.0f},{self.spindle_target:.0f},{self.spindle_actual:.0f}|"
            f"WCO:{wco}|"
            f"Pn:>\r\n"
        )


def apply_axis_move(state: MachineState, line: str, relative: bool):
    """Very small parser: pulls X/Y/Z/F out of a jog or G0/G1 line and
    updates simulated position immediately (no real motion timing)."""
    feed_match = FEED_RE.search(line)
    if feed_match:
        state.feed = float(feed_match.group(1))

    for axis, val in AXIS_RE.findall(line):
        try:
            v = float(val)
        except ValueError:
            continue
        axis = axis.upper()
        if relative:
            if axis == "X":
                state.x += v
            elif axis == "Y":
                state.y += v
            elif axis == "Z":
                state.z += v
            elif axis == "A" and state.axes >= 4:
                state.a += v
        else:
            if axis == "X":
                state.x = v
            elif axis == "Y":
                state.y = v
            elif axis == "Z":
                state.z = v
            elif axis == "A" and state.axes >= 4:
                state.a = v


class ClientHandler:
    def __init__(self, reader, writer, state: MachineState, verbose: bool):
        self.reader = reader
        self.writer = writer
        self.state = state
        self.verbose = verbose
        self.line_buf = ""
        self.status_task = None

    def log(self, msg: str):
        if self.verbose:
            print(msg)

    async def send(self, data: str):
        self.writer.write(data.encode("ascii", errors="replace"))
        await self.writer.drain()

    async def send_status_burst(self):
        """ncSender polls with '?' every ~100ms; we just answer every poll
        we see, but this task also nudges a status out periodically in case
        a poll is missed while other traffic is being handled."""
        try:
            while True:
                await asyncio.sleep(5)
                await self.send(self.state.status_line())
        except asyncio.CancelledError:
            pass

    async def handle_greeting(self):
        self.log("[sim] client connected -> sending greeting")
        await self.send(GREETING)

    async def run(self):
        await self.handle_greeting()
        self.status_task = asyncio.create_task(self.send_status_burst())

        try:
            while True:
                chunk = await self.reader.read(1024)
                if not chunk:
                    break
                text = chunk.decode("ascii", errors="replace")

                for ch in text:
                    if ch == "\x18":  # Ctrl-X soft reset
                        self.log("[sim] soft-reset received -> re-sending greeting")
                        await self.send(GREETING)
                        continue

                    if ch == "?":
                        await self.send(self.state.status_line())
                        continue

                    if ch in ("\n",):
                        line = self.line_buf.strip("\r")
                        self.line_buf = ""
                        if line:
                            await self.handle_line(line)
                        continue

                    self.line_buf += ch

        except (ConnectionResetError, asyncio.IncompleteReadError):
            pass
        finally:
            if self.status_task:
                self.status_task.cancel()
            self.writer.close()

    async def handle_line(self, line: str):
        self.log(f"[sim] <- {line!r}")
        upper = line.upper().strip()

        if upper.startswith("$J="):
            apply_axis_move(self.state, upper, relative="G91" in upper)
            await self.send("ok\r\n")
            return

        if upper.startswith("$H"):
            self.log("[sim] homing...")
            self.state.status = "Home"
            await asyncio.sleep(0.5)
            self.state.x = self.state.y = self.state.z = 0.0
            self.state.homed = True
            self.state.status = "Idle"
            await self.send("ok\r\n")
            return

        if upper.startswith("G0") or upper.startswith("G1"):
            apply_axis_move(self.state, upper, relative=False)
            await self.send("ok\r\n")
            return

        if upper == "$$":
            # ncSender queries this right after connecting to read firmware
            # settings. $22 is the homing-cycle bitmask:
            #   bit0 (1) = homing enabled, bit2 (4) = required at startup.
            # We report "enabled but not required" so the Home button lights
            # up (homingCycle != 0) without forcing the blocking
            # "Homing Required" gate (bit2 unset). Change to "5" instead of
            # "1" if you specifically want to test the homing-required flow.
            await self.send("$22=1\r\n")
            await self.send("ok\r\n")
            return

        if upper.startswith("$I"):
            # Build info query - gives ncSender a stable firmware version
            # string so it doesn't think the version changed every reconnect.
            await self.send("[VER:1.1h.20260101:]\r\n")
            await self.send("ok\r\n")
            return

        if upper.startswith("$"):
            # Other settings / init queries ($G, $#, $pinstate, $#=_tool_offset,
            # $EG, $ES, $ESH, etc.) - real values aren't needed for the app to
            # reach "idle"; just ack. (ncSender falls back to its cached
            # firmware metadata if these come back empty.)
            await self.send("ok\r\n")
            return

        # Anything else (plain G-code, M-codes, etc.) - just ack.
        await self.send("ok\r\n")


async def handle_client(reader, writer, state, verbose):
    peer = writer.get_extra_info("peername")
    print(f"Client connected: {peer}")
    handler = ClientHandler(reader, writer, state, verbose)
    try:
        await handler.run()
    finally:
        print(f"Client disconnected: {peer}")


async def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind (default: 8000)")
    parser.add_argument("--verbose", action="store_true", help="Print all traffic")
    parser.add_argument("--axes", type=int, choices=(3, 4), default=4,
                        help="3 = XYZ, 4 = XYZ + rotary A (default: 4)")
    args = parser.parse_args()

    state = MachineState(args.axes)

    server = await asyncio.start_server(
        lambda r, w: handle_client(r, w, state, args.verbose), args.host, args.port
    )

    addrs = ", ".join(str(s.getsockname()) for s in server.sockets)
    print(f"Fake grblHAL server listening on {addrs} ({'XYZA' if args.axes >= 4 else 'XYZ'})")
    print("Point ncSender at this: Connection Type = Ethernet, Protocol = Telnet, "
          f"IP = 127.0.0.1, Port = {args.port}")

    async with server:
        await server.serve_forever()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
