## Rotary CAM 0.9.1 (beta)

**New in 0.9.1**
- **Programs stay inside the Z travel.** ncSender flags a program that goes above machine Z0, using the work offset it's loaded with. Rotary CAM now reads that offset, the Z travel and the tool in the spindle when it opens and before each Generate, and keeps every move inside the travel for each tool's stickout (a tool that sticks out further has less room).
  - If a tool can't get above the stock without going past the top of Z, Generate is off and the message says how much shorter the stickout needs to be.
  - Rapids kept lower than planned are noted. They show in red if the collet nut and spindle needed more room than that, or if a cut would go below the bottom of the travel.
  - **Top of Z above the axis** is under Tool changes, and shows in 3D as a ceiling
- **Stock at a glance** in the header: the stock you've set, the least the part needs (across, and from the jaws to the centre), and the Z room above the axis. Anything short shows in red; click it to open Stock & rotary
- **Version under the name**, and an **update badge** when ncSender finds a newer release. Its card has what's new, a button that opens ncSender's plugin settings, and Update now
- **Settings survive:**
  - A stickout or flute length you type for a Tool Library tool is no longer replaced by the library's values each time Rotary CAM opens
  - Every change is saved as you make it, and again on Close
  - Two computers with Rotary CAM open on the same ncSender no longer write over each other's changes; each save adds only what that window changed, and a window opened again catches up

**Since 0.2.0**
- 0.9.0: Indexed planning around 7× faster (own exact ball drop-cutter, drops on every worker), listed angles by default
- 0.8.0: work zero from a corner of the rotary (Move zero to the rotary axis), G-code zero marked in 3D, 4-jaw chuck, see-through spindle, tenon length
- 0.7.1: settings light up their part of the 3D setup with a dimension; headstock and tailstock reach front and back separately
- 0.7.0: collet nut, spindle and the rotary checked in every operation, per-tool stickout, tool changes routed round the rotary using ncSender's G54 / Manual Tool Changer / Safe Z, Simulate checks the holder, holder-aware Indexed angles
- 0.6.0: project files (.rcam), Indexed angles in 3D (see what each can reach, drag to change), scale / scale to fit the stock
- 0.5.0: Indexed (3+1) cleanup of what the rotary passes miss, tapered ball bits, tenons, what's left to clean shown in the simulation
- 0.4.0: Corners operation for square stock, Parting, Simulate, toolpaths that reach the ends of the part, no tool change for the same tool number
- 0.3.0: full-window layout, ncSender's units (inch fields and G20 programs), reopens where you left off, square / rectangular stock, colour-matched operation buttons, live 3D updates, tooltips, new icon
- 0.2.0: 3D view for placing the part, toolpaths drawn on the part, extra points on sharp features
