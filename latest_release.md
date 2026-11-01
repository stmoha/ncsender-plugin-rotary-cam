## Rotary CAM 0.9.3 (beta)

**New in 0.9.3**
- **Z not zeroed yet no longer blocks Generate.** If ncSender's Z zero is still at the top of the Z travel (not zeroed on the rotary axis yet), or the machine isn't homed, the Z travel check is skipped instead of reading as negative room. The header says *zero Z on the rotary axis first* or *home the machine first*, and the program carries a note. Zero Z on the axis, then generate before loading: ncSender checks the program against the zero as it is when you load it

**Since 0.2.0**
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
