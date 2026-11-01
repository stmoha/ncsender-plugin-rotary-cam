## Rotary CAM 0.9.0 (beta)

**New in 0.9.0**
- **Indexed is much faster.** On the chess knight, planning went from over two minutes to around 20 seconds on one core, and the drops are now shared across all the workers. Nothing it cuts got worse:
  - Rotary CAM drops a plain ball with its own exact drop-cutter. It does the same contact maths as OpenCAMLib and agrees with it to well under a micron, but runs 8 to 15 times faster. Tapered balls still use OpenCAMLib
  - Every Indexed drop is split across all the workers, not just one, and the program comes out the same move for move
  - The collet nut and spindle clearance is only worked out where it's used, and the "what's still above here" lookup only searches where material can be. Both give exactly the same answers as before
  - **Pick the angles for me** tries the 24 angles on a coarser grid to rank them, then looks finely at the ones it picks. The angles chosen can differ slightly; on the test parts it reached as much or slightly more
- **You list the Indexed angles by default** (90, 270 to start), like in Fusion. **Pick the angles for me** is still there; when you tick it, it warns that it takes much longer. Settings that had it on only because it was the old default switch to listed angles; tick it again and it stays on

**Since 0.2.0**
- 0.8.0: work zero from a corner of the rotary (Move zero to the rotary axis), G-code zero marked in 3D, 4-jaw chuck, see-through spindle, tenon length
- 0.7.1: settings light up their part of the 3D setup with a dimension; headstock and tailstock reach front and back separately
- 0.7.0: collet nut, spindle and the rotary checked in every operation, per-tool stickout, tool changes routed round the rotary using ncSender's G54 / Manual Tool Changer / Safe Z, Simulate checks the holder, holder-aware Indexed angles
- 0.6.0: project files (.rcam), Indexed angles in 3D (see what each can reach, drag to change), scale / scale to fit the stock
- 0.5.0: Indexed (3+1) cleanup of what the rotary passes miss, tapered ball bits, tenons, what's left to clean shown in the simulation
- 0.4.0: Corners operation for square stock, Parting, Simulate, toolpaths that reach the ends of the part, no tool change for the same tool number
- 0.3.0: full-window layout, ncSender's units (inch fields and G20 programs), reopens where you left off, square / rectangular stock, colour-matched operation buttons, live 3D updates, tooltips, new icon
- 0.2.0: 3D view for placing the part, toolpaths drawn on the part, extra points on sharp features
