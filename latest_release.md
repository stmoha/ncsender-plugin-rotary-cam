## Rotary CAM 0.11.1 (beta)

**New in 0.11.1**
- **Fixed: with a tapered ball, "Finish the whole side it faces" could plunge far below the part** (an inch under the axis on the knight). Beside the part, the tool's widening cone can rest on the part's side with the tip far below. The whole-side pass took those spots as surface to finish. It now only goes where the ball itself touches the part, never where the cone is holding the tool up, and never below the part's outline. A new test checks exactly this. **Generate again** any program made with 0.11.0 and the whole side ticked.
- **Cancel always stops it.** It used to only stop at the next point where the calculation checked in, so a calculation stuck waiting (for example on a worker that never answered) ignored it. Now it stops at once, whatever the calculation is doing or waiting for: the workers are shut down (new ones start next time), anything that comes back from that calculation is ignored, and Generate is ready again.
- **The status clock keeps ticking** every second while it works, so you can tell a slow step from a stuck page. If the clock stops, the page itself is stuck: reload it, and your settings and the part come back.
- **Writing the program is a step of its own** on the bar. Before, it ran with the bar showing Indexed at 100%.

**Since 0.2.0**
- 0.11.0: Indexed can finish the whole side it faces (one even pass instead of spots)
- 0.10.0: dust collection / dust boot switch (off by default); a manual (MANUAL.md)
- 0.9.9: the A+ arrow in 3D follows the A direction setting
- 0.9.8: which way A turns is a Machine setting, with a Turn A +90° test
- 0.9.7: a program with Indexed asks which way A turns (wrong, Indexed cuts the opposite side)
- 0.9.6: progress you can follow, more cores, inch programs only with A set as rotary ($376), a note on calibrating A
- 0.9.5: the Z travel limit holds still while you shorten stickouts; what's left once every tool fits
- 0.9.4: one Z travel message with the most a tool may stick out and how to check it, stickout of the tool in the spindle, one stickout per tool number, stock length + clamping distance, live centre total length, the chuck end and tailstock end fade when they're in the way, silver / dark gray setup
- 0.9.3: Z not zeroed on the axis yet (or not homed) no longer blocks Generate
- 0.9.2: open windows pick up changes made on another computer before generating, loading or saving
- 0.9.1: programs stay inside the Z travel, stock at a glance in the header, version and update badge, settings that survive reopening and two computers
- 0.9.0: Indexed planning around 7× faster (own exact ball drop-cutter, drops on every worker), listed angles by default
- 0.8.0: work zero from a corner of the rotary (Move zero to the rotary axis), G-code zero marked in 3D, 4-jaw chuck, see-through spindle, tenon length
- 0.7.1: settings light up their part of the 3D setup with a dimension; headstock and tailstock reach front and back separately
- 0.7.0: collet nut, spindle and the rotary checked in every operation, per-tool stickout, tool changes routed round the rotary using ncSender's G54 / Manual Tool Changer / Safe Z, Simulate checks the holder, holder-aware Indexed angles
- 0.6.0: project files (.rcam), Indexed angles in 3D (see what each can reach, drag to change), scale / scale to fit the stock
- 0.5.0: Indexed (3+1) cleanup of what the rotary passes miss, tapered ball bits, tenons, what's left to clean shown in the simulation
- 0.4.0: Corners operation for square stock, Parting, Simulate, toolpaths that reach the ends of the part, no tool change for the same tool number
- 0.3.0: full-window layout, ncSender's units (inch fields and G20 programs), reopens where you left off, square / rectangular stock, colour-matched operation buttons, live 3D updates, tooltips, new icon
- 0.2.0: 3D view for placing the part, toolpaths drawn on the part, extra points on sharp features
