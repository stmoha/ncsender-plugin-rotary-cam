## Rotary CAM 0.7.0 (beta)

**New in 0.7.0**
- **Collet nut, spindle and the rotary in every operation:** set the chuck, headstock, live centre and tailstock sizes and the collet nut and spindle (Rotary & spindle), and each tool's **Stickout** (from the Tool Library when it has one). Every operation keeps the tool, nut and spindle off the chuck and tailstock and the nut and spindle off the part and the uncut stock. Where it can't go lower without a collision it stays up and says where, why, and the stickout that would reach (or to move the part off the jaws)
- **Tool changes go round the rotary:** before each M6 the program goes up to ncSender's Safe Z and round the chuck, headstock and tailstock to the tool change position, changes the tool there, and comes back the same way. It reads where everything is from ncSender: the rotary from the controller's G54 (the work zero is the jaw face on the axis), the tool change position and tool setter from the Manual Tool Changer, Safe Z from Settings (or type them in). It flags ncSender's own move to the tool setter if that crosses the rotary
- The 3D view draws the rotary at its real size, the tool with its nut and spindle, and the tool change, tool setter and the way round to them
- **Simulate** checks the collet nut and spindle against the stock and the rotary for every move
- Indexed checks its holder against what's actually left, picks angles where the nut and spindle fit, and says how much only a longer stickout would reach
- New parts start 25 mm from the jaws (was 15), so a 35 mm collet nut clears a 100 mm chuck

**Since 0.2.0**
- 0.6.0: project files (.rcam), Indexed angles in 3D (see what each can reach, drag to change), scale / scale to fit the stock
- 0.5.0: Indexed (3+1) cleanup of what the rotary passes miss, tapered ball bits, tenons, what's left to clean shown in the simulation
- 0.4.0: Corners operation for square stock, Parting, Simulate, toolpaths that reach the ends of the part, no tool change for the same tool number
- 0.3.0: full-window layout, ncSender's units (inch fields and G20 programs), reopens where you left off, square / rectangular stock, colour-matched operation buttons, live 3D updates, tooltips, new icon
- 0.2.0: 3D view for placing the part, toolpaths drawn on the part, extra points on sharp features
