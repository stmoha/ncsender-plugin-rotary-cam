## Rotary CAM 0.14.0 (beta)

Simultaneous 4th-axis CAM inside ncSender: open an STL or STEP part, rough and finish it around the A axis, clean up what the rotary passes can't reach with indexed passes, simulate it against the stock, and load the G-code straight into ncSender. Install it from ncSender › Settings › Plugins, or with the ZIP below (Install Plugin); updates show there as *Update available*. New to it? Read the [manual](https://github.com/stmoha/ncsender-plugin-rotary-cam/blob/main/MANUAL.md) before the first carve, and air-cut the first program on a new setup.

**New in 0.14.0**
- **Stickout and flute length live in ncSender's Tool Library.** For a tool picked from the library, the stickout and flute length you type in Rotary CAM are saved with the tool there, so you set them once per tool, on every computer. Change them in the library (another plugin, another computer) and an open Rotary CAM takes the change within a few seconds; toolpaths that no longer match are dropped. A stickout you typed for a library tool before 0.14.0 goes to the library the first time you open it. Nothing else of the tool is touched: not its size, number, or tool length offset (TLO), which sets Z zero.
- **Keep-out zones round the rotary (ncSender Pro).** Rotary CAM keeps two keep-out zones of its own in ncSender: one round the chuck and headstock, one round the live centre and tailstock. ncSender then won't jog into them or start a program that goes through them. They're sized from Rotary & spindle (plus a margin you set), placed from the rotary's work zero, and they move when you change the sizes or the stock length. If the work zero moves away from the rotary they stay put and ask first. Switch one off in ncSender's settings and it stays off; delete both and Rotary CAM stops keeping them. If you drew a zone round your rotary yourself, delete it once these look right.
- **X0 is now 5/16″ in front of the chuck jaw face.** ncSender stops a jog at a keep-out zone by the centre of the bit, not its edge, and it starts every program at X0. With X0 out in front, the headstock zone reaches to just short of X0: programs still start, and a jog toward the chuck stops a bit up to 5/8″ across before it touches the jaws. No cut comes closer to the jaws than X0. Settings still measure from the jaw face. **Zero X again after updating:** Probe the chuck sets X0 in the new place (or zero X on the jaw face and move it 5/16″ toward the part). Rotary CAM reminds you until you do. Change the distance under Rotary & spindle › *Work zero (X0) in front of the jaws*: more for bigger bits, 0 to keep X0 on the jaw face.
- **The program is checked against every keep-out zone** before you load it, the ATC's and your own included, so one ncSender would refuse to start is flagged in Rotary CAM, with the line. Tool change routes round the rotary go round the other zones too.
- Air-cut the first program after updating and zeroing X again: X0 has moved, and the tool change routes can be different.

**Since 0.2.0**
- 0.13.0: setups, strategies in any order and set to Rest; more than one setup per part; a tidier side panel; each strategy in its own colour
- 0.12.0: Probe the chuck for the work zero; finishing along the grain; the same job on another computer; Simulate shows a finished part as finished; Parting does the tailstock end first, or one cut only
- 0.11.6: cutting past the rotary axis only where it’s needed; finishing and Indexed take any end mill; stepovers as a length or a %; Simulate shows parts open down the middle; Size the stock to fit the part
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
