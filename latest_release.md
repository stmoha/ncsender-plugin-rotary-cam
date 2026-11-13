## Rotary CAM 0.11.5 (beta)

Simultaneous 4th-axis CAM inside ncSender: open an STL or STEP part, rough and finish it around the A axis, clean up what the rotary passes can't reach with indexed passes, simulate it against the stock, and load the G-code straight into ncSender. Install it from ncSender › Settings › Plugins, or with the ZIP below (Install Plugin); updates show there as *Update available*. New to it? Read the [manual](https://github.com/stmoha/ncsender-plugin-rotary-cam/blob/main/MANUAL.md) before the first carve, and air-cut the first program on a new setup.

**New in 0.11.5**
- **Clearer checks when the stock is too small.** A stock that’s too thin now names the field to change (*Stock width*, *Width x Height* or *Stock diameter*), and its button says what it sets, for example **Set Stock width to 56 mm**. It never touched the length, and now it says so. Square stock’s *Side* field is now called *Stock width*, to match.
- **A stock that’s too short says so.** It used to say the part *runs past the tailstock*; now it says the *Stock length* is too short, how long it needs to be, and has a **Set Stock length to …** button. The length it sets leaves room for the tools past the end of the part (or the tailstock tenon) and the keep-away from the tailstock. Your toolpaths don’t change.
- **Part starts at X now includes the chuck end tenon.** It’s where the work starts: the tenon first, then the part. Make the tenon longer and the part moves along, so you no longer have to change Part starts at X to match. If it’s inside *Keep away from the jaws*, the tools can’t cut all of the tenon: a check says so, with a **Set Part starts at X to …** button. Your saved settings and projects are converted so the part stays exactly where it was (the number in Part starts at X goes down by the tenon’s length). **This moves parts in new setups: air-cut the first program.**
- **Parting cuts the tenons.** The tenons now set where and how thin Parting cuts: it cuts each tenon down to its diameter along its whole length, from the end of the part out to the stock. Before, it cut a separate neck a gap away from the part, which could land past the tenon or in the keep-away (and then didn’t cut at all). With Parting on, roughing leaves the tenons thick past the room the tools need, so the part is held firmly while it’s carved, and Parting thins them last. Parting’s own Neck, Neck diameter, Gap from the part and Neck width are gone: set the tenons under Tenons (Parting shows what it will cut). **Parting toolpaths change: air-cut the first one.**

**Since 0.2.0**
- 0.11.4: a stock exactly as thick as *Part needs at least* no longer shows in red
- 0.11.3: with Tenons › *Chuck end only*, only the chuck tenon’s sizes show
- 0.11.2: the fine print on first open (and from the **beta** badge); a **Manual** link beside the version; on wide landscape screens the checks get a column right of the view that shuts to a strip
- 0.11.1: with a tapered ball, the whole-side pass never plunges below the part; Cancel always stops; the status clock keeps ticking; writing the program is a step of its own
- 0.11.0: Indexed can finish the whole side it faces (one even pass instead of spots)
- 0.10.0: dust collection / dust boot switch (off by default); a manual (MANUAL.md)
- 0.9.9: the A+ arrow in 3D follows the A direction setting
- 0.9.8: which way A turns is a Machine setting, with a Turn A +90° test
- 0.9.7: a program with Indexed asks which way A turns (wrong, Indexed cuts the opposite side)
- 0.9.6: progress you can follow, more cores, inch programs only with A set as rotary ($376), a note on calibrating A
- 0.9.5: the Z travel limit holds still while you shorten stickouts; what's left once every tool fits
- 0.9.4: one Z travel message with the most a tool may stick out and how to check it, stickout of the tool in the spindle, one stickout per tool number, stock length + clamping distance, live centre total length, the chuck end and tailstock end fade when they're in the way, silver / dark gray setup
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
