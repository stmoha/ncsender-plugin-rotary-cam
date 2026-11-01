## Rotary CAM 0.9.2 (beta)

**New in 0.9.2**
- **Changes made on another computer reach every open window before it does anything.** Each Rotary CAM window checks ncSender:
  - before every command: Generate, Load into ncSender, Save to File Manager, Download, Save project, Simulate
  - every few seconds while it's open, and whenever it comes back to the front
- **Programs that no longer match aren't used.** If a change from elsewhere means the toolpaths no longer match the settings, they're dropped instead of loaded or saved, and the message names the settings that changed (*Settings were changed on another computer (Roughing stickout)…: generate again*). A field you're typing in isn't touched until you leave it

**Since 0.2.0**
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
