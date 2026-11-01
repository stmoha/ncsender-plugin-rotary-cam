## Rotary CAM 0.11.0 (beta)

**New in 0.11.0**
- **Indexed: Finish the whole side it faces** (off by default). Clean-up alone only goes where material is left. On a detailed part that's many small spots, each with its own plunge and hop, which looks stippled. With this ticked, each angle also runs one even finishing pass over the whole side it faces, line by line along the part a stepover apart, with the tool riding the surface like a 3-axis parallel finish.
  - It only covers surface up to 55° steep across the passes; the next angle round does the steeper parts.
  - The collet nut and spindle stay clear, and it stays inside the keep-aways.
  - Anything thick still left under it is taken down in layers first.
  - It's smoother and more even, but slower: on the test parts it roughly doubles the cutting time.
  - Checked: no point of the passes goes below a fresh drop onto the part, and the simulation shows nothing cut below the part.

**Since 0.2.0**
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
