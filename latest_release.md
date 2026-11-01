## Rotary CAM 0.9.4 (beta)

**New in 0.9.4**
- **Stock length and clamping distance.** *Tailstock centre at X* is now **Stock length**: the whole piece, including the end in the jaws. **Clamping distance** (1/2" to start) is how far it goes into the jaws. The live centre sits at the stock length less the clamping distance. Changing the clamping distance keeps the stock length, so the centre moves. Settings from earlier versions keep the centre where it was, so their stock length now reads 1/2" longer: check it.
- **One Z travel message instead of one per operation.** It says:
  - how far a tool can stick out and still clear the stock with Z at the top of its travel, also shown in the header (*Z allows 1.667 in stickout*);
  - which tools are too long, and by how much;
  - which tool it took to be in the spindle, and why;
  - how to check it on the machine: jog Z to the top, ncSender's Z reads the top of Z, and the tip is that far above the axis.
- **Stickout of the tool in the spindle** (Tool changes): the tool whose length is in ncSender's work offset. Left empty, it's worked out from the tool ncSender says is in, or else the first operation's tool. Set it when that's wrong.
- **One tool number, one tool.**
  - A stickout or flute length set for one operation goes to every operation with that tool number.
  - A library tool another operation already uses comes in as set there.
  - Two stickouts for one tool number stop Generate, with a button for each length.
  - The same number for a different size or kind of tool also stops Generate.
- **Live centre total length.** The live centre now draws, and is kept clear of, as its cone and then a round body back to the tailstock. The tailstock's box starts where the body ends. Left empty, the cone goes straight into the tailstock, as before.
- **The chuck end and the tailstock end fade when they're in the way.** Orbit round to look down the axis and whichever end is between you and the part turns see-through, as the collet nut and spindle already did.
- **Colours:** the chuck body, headstock, tailstock, live centre body and spindle are one silver. The jaws, the live centre's cone and the collet nut are dark gray.
- The *Fit the stock* buttons only show on stock-size messages.

**Since 0.2.0**
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
