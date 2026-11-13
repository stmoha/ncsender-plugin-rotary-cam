## Rotary CAM 0.11.6 (beta)

Simultaneous 4th-axis CAM inside ncSender: open an STL or STEP part, rough and finish it around the A axis, clean up what the rotary passes can't reach with indexed passes, simulate it against the stock, and load the G-code straight into ncSender. Install it from ncSender › Settings › Plugins, or with the ZIP below (Install Plugin); updates show there as *Update available*. New to it? Read the [manual](https://github.com/stmoha/ncsender-plugin-rotary-cam/blob/main/MANUAL.md) before the first carve, and air-cut the first program on a new setup.

**New in 0.11.6**
- **Cutting past the rotary axis where it's needed.** Roughing and finishing used to keep the tool tip above the axis everywhere, so some spots were never cut: the middle of a slot or hole right through the part (a thin web was left on the axis), the bottom of a hole that goes past the axis, the inside of a curl. Now the tool goes past the axis there, and only there, only as deep as each spot needs; everywhere else nothing changes. **Deepest below the axis** (bottom of *Stock & rotary*) is empty (auto) to start: type a number to limit how deep it goes, or 0 to keep the tool above the axis everywhere. After Generate a message says how deep it goes and where. **Air-cut a program that goes past the axis first**: the tool reaches deep into the part there.
- **Finishing and Indexed take any end mill.** *Shape* now has **Flat end mill** beside Ball and Tapered ball, and the *Tool* list shows the Tool Library's flat end mills too (picking one sets the shape). A flat end mill leaves flat faces flat and gets into square shoulders and corners; on curves it leaves small steps, so use a fine *Stepover per turn*. Finishing with the roughing end mill (same tool number and size) needs no tool change. Air-cut the first program with a flat finishing tool.
- Where nothing of the part is under the tool at all (looking straight through a slot), roughing and finishing cut down to the axis instead of leaving the stock there.
- **Size the stock to fit the part.** A new button at the bottom of *Stock & rotary*, the other way round from *Scale to fit the stock*: the part keeps its size, and the stock is set for it in one click, 1 mm to spare all round and long enough for the part, the tailstock end tenon (or the room the tools need) and the keep-away from the tailstock. Sizes round up to a whole mm, or a tenth of an inch. Handy when you’re about to cut a blank. The part doesn’t move, so your toolpaths only change if the stock did.
- The *Scale to fit the stock* button is ready as soon as a part opens (it could stay greyed out until you changed a setting).

**Since 0.2.0**
- 0.11.5: checks for stock that’s too thin or too short name the field and set it; Part starts at X includes the chuck end tenon; Parting cuts the tenons
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
