## Rotary CAM 0.5.0 (beta)

**New in 0.5.0**
- **Indexed:** a new operation after Finishing for what the rotary passes couldn't reach. It works out what finishing left on the part (material hidden under an overhang like a chin or a jaw, and optionally creases the finishing ball was too big for), tries A every 15 degrees, picks the fewest angles that reach the most, and runs 3-axis passes with A locked and the tool offset in Y, only over those patches, in layers where needed. Or give your own A angles. After Generate it says how much it reaches and where the rest is
- The simulation shows what's left to clean as yellow blocks from the start of Indexed, disappearing as it cuts
- **Tapered ball bits** for Finishing and Indexed: tip diameter, taper per side and shank diameter set in the plugin (a tapered ball kept in ncSender's Tool Library as a V-bit can be picked; its diameter is the shank). The whole cone and shank are kept off the part and out of the stock roughing didn't cut, keep-aways are measured from the shank, and roughing clears further past the ends to give the cone room
- **Tenons:** a solid round stub on the rotary axis at each end of the part, left uncut so the part stays joined to the stock while it's carved. Set how far each reaches into the part and its diameter: the same at both ends (default 1/2 in, 1/4 in deep) or different at the chuck and tailstock ends, or just one end. Every operation works around them; Parting necks through them beside the part, ready to cut it free
- Tenons show green in the 3D view (live as you type), the side profile and the simulation, and the simulation checks that nothing cut into them
- An end with a tenon counts as going round the axis, so the tools reach right to that end of the part
- A warning if a parting neck is no thinner than the tenon beside it

**Since 0.2.0**
- 0.4.0: Corners operation for square stock, Parting, Simulate, toolpaths that reach the ends of the part, no tool change for the same tool number
- 0.3.0: full-window layout, ncSender's units (inch fields and G20 programs), reopens where you left off, square / rectangular stock, colour-matched operation buttons, live 3D updates, tooltips, new icon
- 0.2.0: 3D view for placing the part, toolpaths drawn on the part, extra points on sharp features
