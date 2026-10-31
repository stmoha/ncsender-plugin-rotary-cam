## Rotary CAM 0.8.0 (beta)

**New in 0.8.0**
- **Work zero from a corner of the rotary:** measure once how far the work zero (jaw face, on the axis) is from a corner you can touch off, such as the top front corner of the headstock. After that, zero X, Y and Z on the corner with a touch block or 3D probe and press **Move zero to the rotary axis**. It shows where the work offset will go, then adds the offsets with `G10 L2`, switching to mm for that one line and back afterwards, the same way ncSender's probe routines do. It won't add them twice or move the zero while the machine is running. **Remember axis** and **Remember corner** can work the offsets out for you. The offsets are measured, separate from the headstock's keep-out box
- Editing the corner offsets shows the corner in 3D, with arrows for which way to probe each face and the X, Y and Z legs to the zero dimensioned
- **G-code zero marked in 3D:** X0 Y0 Z0 at the jaw face on the rotary axis, drawn through the stock
- **4-jaw chuck** (3 is still an option) whose jaws sit on the flats of square stock and turn with A
- The headstock and tailstock housings are drawn silver
- **The collet nut and spindle go see-through** when they would hide the part, such as looking down from the top
- **Tenon length:** set how far each tenon runs out of the part (empty means just the room the tools need). Roughing takes the whole length down to size, and **Scale to fit** leaves it at each end; its message now says where each end lands and what set the size

**Since 0.2.0**
- 0.7.1: settings light up their part of the 3D setup with a dimension; headstock and tailstock reach front and back separately
- 0.7.0: collet nut, spindle and the rotary checked in every operation, per-tool stickout, tool changes routed round the rotary using ncSender's G54 / Manual Tool Changer / Safe Z, Simulate checks the holder, holder-aware Indexed angles
- 0.6.0: project files (.rcam), Indexed angles in 3D (see what each can reach, drag to change), scale / scale to fit the stock
- 0.5.0: Indexed (3+1) cleanup of what the rotary passes miss, tapered ball bits, tenons, what's left to clean shown in the simulation
- 0.4.0: Corners operation for square stock, Parting, Simulate, toolpaths that reach the ends of the part, no tool change for the same tool number
- 0.3.0: full-window layout, ncSender's units (inch fields and G20 programs), reopens where you left off, square / rectangular stock, colour-matched operation buttons, live 3D updates, tooltips, new icon
- 0.2.0: 3D view for placing the part, toolpaths drawn on the part, extra points on sharp features
