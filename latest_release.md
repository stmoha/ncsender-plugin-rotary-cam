## Rotary CAM 0.9.6 (beta)

**New in 0.9.6**
- **Inch programs only where A is set up as rotary.** In an inch program (G20), grblHAL multiplies every axis value by 25.4, A included, unless the axis is marked rotary in `$376` (`$376=1` for A). Otherwise A90 turns about 2,286° and the features come out at the wrong angles. Now, unless the controller reports A as rotary, the program is written in millimetres (G21), which runs the same and is never rescaled, and a note says why. Set `$376=1` to get inch programs again.
- **Progress you can follow.** The bar is split into the steps of a Generate: toolpaths round the part, sharp features, what the rotary passes missed, and Indexed. Each part of the bar fills as its step runs, including within each Indexed angle. The status line shows how far the step has got, about how long it has left, the time so far, and which step it is (for example *Indexed: Planning A90° (1 of 4)… 38% · about 2 min left · 1:12 so far · step 4 of 4*).
- **More of your cores.** Up to 8 workers (all the cores but one) instead of 4, and big batches are split finer so every worker stays busy to the end.
- Indexed reuses each angle's collet nut and spindle map for that angle's passes instead of working it out three times.
- **A calibration note.** These programs turn A continuously through many turns, so a small error in A's steps per degree (`$103`) adds up. A note gives how far off the last passes would be if `$103` were 0.1% out, and how to check it over 10 turns.

**Since 0.2.0**
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
