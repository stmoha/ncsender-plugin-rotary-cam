## Rotary CAM 0.15.2 (beta)

Simultaneous 4th-axis CAM inside ncSender: open an STL or STEP part, rough and finish it around the A axis, clean up what the rotary passes can't reach with indexed passes, simulate it against the stock, and load the G-code straight into ncSender. Install it from ncSender › Settings › Plugins, or with the ZIP below (Install Plugin); updates show there as *Update available*. New to it? Read the [manual](https://github.com/stmoha/ncsender-plugin-rotary-cam/blob/main/MANUAL.md) before the first carve, and air-cut the first program on a new setup.

**New in 0.15.2**
- **Flat elevations in the 3D view.** **Front**, **Top** and **End** now look straight along Y, Z and X and switch to **Ortho**: a flat view with no perspective, where things that line up look lined up and nothing shrinks with distance. Use it to check where the moves go against the work zero and the machine. Orbiting and zooming stay flat; the **Ortho** button goes back to perspective, and the choice is remembered.
- **The keep-out Danger says why.** Rotary CAM's zones in ncSender Pro stay where the rotary was when they were placed, so a work zero set in the wrong place gets caught. When the program hits one because the work zero has moved since, the red *Keep-out* check now says by how much and which way, and where X0 sits against the jaws if the rotary hasn't moved. **Move the zones to the rotary** and **Probe the chuck** are right there. Zeroing again within 1 mm (probing again, say) now moves the zones by itself.
- **Save project asks where to save.** It opens your computer's Save As box, so you choose the folder and the name, and it starts in the folder you used last. (Before, the box came up only after the project was packed, by which time the browser no longer counted the click, so it was nearly always a download.) Browsers show that box only to a page on the same computer or at an https address, and only Chrome and Edge do: with ncSender opened from another computer at a plain address like `http://192.168.1.50:8090`, it's still a download. To choose the folder and name there too, turn on *Ask where to save each file* in the browser's download settings; the first download says so.

**Since 0.2.0**
- 0.15.1: roughing and Corners within 1/8″ of the jaws and to the end of the stock; room for the collet nut beside the ends; checks say where, what and how to fix it; Simulate marks each pass and stops at problems; probing with fewer pauses
- 0.15.0: lengths and feeds in any unit (1/4", 100ipm, sums), Up and Down step them, red for text that can't be read; Rotary CAM is GPL-3.0
- 0.14.1: relief beside an end of the part, so the collet nut can reach; a finishing pass that can't reach the part is a red Danger; no air cuts over corners Corners already took off

- 0.14.0: stickout and flute length kept in ncSender's Tool Library; Rotary CAM's own keep-out zones in ncSender Pro; X0 5/16″ in front of the jaws; headstock and tailstock edges taken from the spindle; the program checked against every keep-out zone; setups, Full or Rest and more than one setup per part (from 0.13.0, which didn't come out on its own)
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
