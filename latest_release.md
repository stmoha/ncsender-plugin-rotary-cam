## Rotary CAM 0.7.1 (beta)

**New in 0.7.1**
- **See what each setting is:** click into or hover over a Rotary & spindle setting and the 3D view lights up that part of the setup in the accent colour, with a dimension line and the value showing what the number measures (chuck diameter across the jaws, headstock reach to the back from the axis, stickout from the nut to the tip, and so on). If it's off the screen the view swings round to it. It works the same for the stock, keep-aways, retract height, each tool's stickout and diameter, the part's start and placement, and the tool change, tool setter and rotary zero
- **Headstock and tailstock off-centre:** each now has a reach to the front (−Y) and to the back (+Y) from the axis, plus its top above the axis, so the one box at each end grows only on the side that needs it: a stepper and belt drive behind and above the chuck, or a tailstock lock lever out the back, are covered without doubling the keep-out on the other side. Collision checks, Simulate and the way round for tool changes all use it
- The Rotary & spindle settings are grouped: Chuck, Headstock, Live centre, Tailstock, Collet nut and spindle
- 0.7.0 settings carry over (a width becomes half to the front, half to the back)

**Since 0.2.0**
- 0.7.0: collet nut, spindle and the rotary checked in every operation, per-tool stickout, tool changes routed round the rotary using ncSender's G54 / Manual Tool Changer / Safe Z, Simulate checks the holder, holder-aware Indexed angles
- 0.6.0: project files (.rcam), Indexed angles in 3D (see what each can reach, drag to change), scale / scale to fit the stock
- 0.5.0: Indexed (3+1) cleanup of what the rotary passes miss, tapered ball bits, tenons, what's left to clean shown in the simulation
- 0.4.0: Corners operation for square stock, Parting, Simulate, toolpaths that reach the ends of the part, no tool change for the same tool number
- 0.3.0: full-window layout, ncSender's units (inch fields and G20 programs), reopens where you left off, square / rectangular stock, colour-matched operation buttons, live 3D updates, tooltips, new icon
- 0.2.0: 3D view for placing the part, toolpaths drawn on the part, extra points on sharp features
