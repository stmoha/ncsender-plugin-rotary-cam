## Rotary CAM 0.6.0 (beta)

**New in 0.6.0**
- **Project files (.rcam):** Save project keeps the whole job in one file: the part (and the STEP it came from), every setting, the tools, and the G-code and toolpaths when they're generated. Open it again and it's all back, ready to simulate or load without calculating. It's a plain ZIP inside (project.json, part.stl, program.nc), so other programs can read it too
- **Indexed angles in 3D:** each A angle shows as a see-through tool coming down onto the part the way it will with A locked there. Click an angle to turn the part to it and see what that tool can and can't see (light / dark), drag a tool round the axis to change its angle, or turn the part with the A slider and press + A to add that angle. After generating, what the rotary passes leave shows yellow, so you can aim at it
- **Indexed with your own angles** no longer tries every angle first: each one is checked just before it's planned, against what the angles before it left (same program, nothing to pick)
- **Scale** the part, or **Scale to fit the stock**: the largest size that fits with 1 mm to spare and leaves the operations room before the tailstock. A part too big for the stock offers it beside Fit the stock to the part
- Fixed: a button in a message (Fit the stock to the part) could miss the click if a setting was still being edited

**Since 0.2.0**
- 0.5.0: Indexed (3+1) cleanup of what the rotary passes miss, tapered ball bits, tenons, what's left to clean shown in the simulation
- 0.4.0: Corners operation for square stock, Parting, Simulate, toolpaths that reach the ends of the part, no tool change for the same tool number
- 0.3.0: full-window layout, ncSender's units (inch fields and G20 programs), reopens where you left off, square / rectangular stock, colour-matched operation buttons, live 3D updates, tooltips, new icon
- 0.2.0: 3D view for placing the part, toolpaths drawn on the part, extra points on sharp features
