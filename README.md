# Rotary CAM (ncSender plugin)

Simultaneous 4th-axis rotary CAM inside ncSender. Open an STL or STEP part, rough it
with a flat end mill in spiral layers and finish it with one continuous ball-mill
spiral, then load the G-code straight into ncSender. This is the X/Z/A wrapping-around
kind of rotary work that Fusion keeps behind the Machining Extension.

**Prototype (0.5.0).** Air-cut the first program on a new setup.

## Setup it assumes

- A rotates about X. Chuck on the left (−X), tailstock on the right (+X).
- **Work zero: X0 = chuck jaw face, Y0 and Z0 = rotary centreline.** Z in the program is
  the tool-tip radius, so Z0 must be the axis, not the top of the stock.
- Y stays at 0 the whole job.

Check the A direction once: mark the top of the stock and jog A+90. Set
*A+90 moves the top of the stock to* to wherever the mark went (−Y or +Y). Getting this
wrong mirrors anything asymmetric.

## Using it

1. **Tools › Rotary CAM** opens a full-window view of the rotary setup: chuck, jaws,
   stock, tailstock and the rotary axis. Open or drop a `.stl`, `.step` or `.stp` file.
2. **Place the part** with the buttons on the 3D view:
   - **Turning axis X / Y / Z:** which model axis lies along the rotary. A new file starts
     on its longest side.
   - **Flip ends:** which end goes in the chuck.
   - **Turn ↺ / ↻ 90°**, or **click the part**: turns it about the rotary axis so the side
     you clicked faces up at A0.
   - **On axis:** what sits on the rotary centreline: the centre of the part, the centre
     of its chuck end (a chess piece's round base), the tailstock end, or the model origin.
   - **A slider:** turns the part and its stock the way the rotary will.
   - Settings in the side panel update the 3D view as you type or use the arrow keys.
3. **Stock & rotary:** round, square or rectangular stock, tailstock position, keep-away
   distances. If the part doesn't fit, it turns red and **Fit the stock to the part** sizes it.
4. **Tenons** (on by default): a solid round stub on the rotary axis at each end of the
   part, so it stays joined to the stock while it's carved. Each one reaches a set depth
   into the part and runs out to the uncut stock past the end. Nothing cuts into a tenon
   except Parting's neck, beside the part. Trim the stubs off the part afterwards.
   - **Ends:** both, chuck end only, or tailstock end only.
   - **Same at both ends** (default, Ø1/2" × 1/4" deep): untick it to give each end its own
     diameter and depth, for example a thin tenon into a small nose and a bigger one into
     the base.
   - Reach the tenon past any thin or off-centre spot near the end (a chess knight's nose);
     otherwise only that spot holds the part. The tenons show green in the 3D view, the
     side profile and the simulation.
5. **Operations**, in the order they run (each can be ticked off):
   - **Corners** (square and rectangular stock only): locks A with each corner up and faces
     it flat with straight X passes, stepping in Y (3+1), turning the square into an
     octagon. Roughing then starts from the octagon, so it spends far less time in air.
     It can use a bigger end mill than roughing; the same tool number means no tool change.
   - **Roughing:** flat end mill, spiral layers, leaving an allowance for finishing.
   - **Finishing:** one continuous ball-mill spiral, with extra points on sharp features.
     Finishing and Indexed take a **ball** or a **tapered ball** (Shape): a small ball tip on
     a cone that widens to the shank, for fine detail. Set its tip diameter, taper per side
     and shank diameter here; ncSender's Tool Library doesn't store those yet, so a tapered
     ball kept there as a V-bit can be picked and its diameter is taken as the shank. The
     tool's whole shape is kept off the part (a vertical face lifts the cone before the tip
     can reach it), the stock past what roughing cut is treated as a wall the cone can't run
     into, roughing clears a little further past the ends to make room, and the keep-away
     distances from the chuck and tailstock are measured from the shank.
   - **Indexed** (off until you tick it): finishes what the rotary passes couldn't reach.
     It plays the program to the end of finishing to see what's left on the part:
     material hidden under the part from every line through the axis (under a chin or a
     jaw), and, if you want, creases the finishing ball was too big for. It then tries A
     every 15° and picks the fewest angles that reach the most of it (or uses your own
     list), locks A at each one and runs 3-axis passes over just those patches: the tool
     offset in Y so it comes in beside the overhang, in layers where a lot is left, each
     patch run its long way with linked passes. The tool always points across the rotary
     axis on this machine, so a pocket that only opens toward the chuck or tailstock can't
     be reached; the message after Generate says how much was reached and where the rest is.
   - **Parting:** necks the stock down beside one or both ends of the part to a set
     diameter (spiralling in), ready to cut it free. Off until you tick it.
   Toolpaths reach the ends of the part: the cutter runs past an end until its contact
   point gets there, as long as that end goes all the way round the rotary axis (a tenon
   does). An end that sits off to one side with no tenon keeps the whole cutter over the
   part, so the tool never drops down beside the part and cuts through the stock holding it.
6. **Generate toolpaths.** The **Corners / Roughing / Finishing / Parting** buttons on the
   view pick which tool and toolpath to show, each in its own colour.
7. **Simulate** plays the program itself, line by line, against a model of the stock: play,
   pause, drag to any point, and 1× to 1000× speed, with the current line and operation
   shown. The whole program is checked first: rapids that cut into the stock, and anywhere
   the stock ends up below the part (red), and any cut into a tenon. The result shows
   under the view. From the start of Indexed the view shows the part inside a see-through
   stock, with what the rotary passes left as yellow blocks that disappear as Indexed
   cuts them; anything still yellow at the end is what nothing reached.
8. **Load into ncSender**, **Save to File Manager** (in `Rotary CAM/`) or **Download .nc**.

Every setting has a tooltip (hover it, or the **?** beside it).

**Units:** Rotary CAM follows ncSender's units setting. In inches every field is in
inches (in, in/min) and the program is posted in G20; in millimetres, G21.

**Picking up where you left off:** closing and reopening keeps the part, settings,
toolpaths and view. The part and its toolpaths are also kept in this browser, so they
come back after a page reload. A calculation keeps running if you close the dialog.

The dialog only closes from **Close**, Escape, or a full click on the dark area around
it; a drag that starts in the 3D view and ends outside doesn't close it.

Machine max rates are read from the controller (`$110` X, `$112` Z, `$113` A). Every
move is posted with **G93 inverse-time feed**, worked out from the true tool-tip path at
the current radius, and never asks an axis for more than its max rate. Settings are saved
in ncSender, so the shop computer and your desktop share them.

## Where the work happens

All calculation runs in the browser that has the dialog open, in Web Workers, so a
desktop browser connected to ncSender is much faster than a Raspberry Pi kiosk screen.

- Drop-cutter: [OpenCAMLib](https://github.com/aewallin/opencamlib) compiled to
  WebAssembly (LGPL-2.1). For each A angle the part is rotated as the rotary would turn
  it and the tools are dropped straight down at Y0.
- Sharp features: the controller moves A and Z in straight lines between points, so the
  finishing pass checks the middle of every move where the path bends and adds points
  until it is within the **Tolerance** (default 0.01 mm).
- 3D view: [three.js](https://threejs.org) (MIT).
- Simulation: the stock is kept as a radius for every X and every degree around the axis;
  each move is stepped through finely and the cutter (flat or ball, anywhere in Y) trims
  every radius it reaches.
- STEP reading: [occt-import-js](https://github.com/kovacsv/occt-import-js) (Open
  CASCADE, LGPL-2.1).

These are included unmodified; their licences are in `licenses/`.

## Known gaps

- A turns continuously (hundreds of turns). If A has soft limits, check `$133`.
- No holder collision check (the tool always points at the axis, so it rarely matters on
  convex-ish parts, but deep narrow coves can still catch the holder). Indexed keeps the
  shank (taken as the cutter's diameter) clear of the part, not the holder.
- The simulation keeps the stock as one radius per X and angle, so a pocket under an
  overhang only shows through Indexed's yellow blocks.
- Tapered balls take about three times as long to calculate as plain balls: OpenCAMLib's
  ball+cone cutter now and then misses a contact at one exact spot, so every tapered drop
  is checked against the tool's own ball tip and a 1 micron shifted drop.
- Roughing plunges straight in from the safe height.

## Development

```
cd viewer && npm install && cd ..       # three.js + esbuild for the 3D view bundle
node build.mjs                          # bundles the 3D view, stamps the build tag, writes dist/rotary-cam-<version>.zip
node dev/logo.cjs                       # renders dev/logo.svg to icon.png
node test/run-node.js part.step - out.nc   # same engine in Node
node test/harness/serve.mjs             # stand-in for ncSender's plugin APIs on :8777
python3 test/verify_rotary.py out.nc part.stl job.json [tenons.json]   # independent gouge / rate / keep-out / tenon check
node test/e2e-v3.cjs test/knight_test.step out/          # browser walkthrough (units, stock, restore, close guard)
node test/e2e-v4.cjs test/knight_test.step out/          # corners, parting, simulation
python3 test/make_horn.py test/horn.stl                  # test part whose end curls off the axis
node test/e2e-v5.cjs test/horn.stl out/                  # tenons
python3 test/make_chin_step.py test/chin_test.step        # test part with a jaw over a gap
node test/e2e-v6.cjs test/chin_test.step out/            # Indexed
node test/e2e-v7.cjs test/knight_test.step out/          # tapered ball bits
python3 test/index_check.py out.nc out.nc.left.json job.json   # how much of what finishing left the indexed G-code cuts
node test/sim-node.js out.nc placed.stl job.json         # the simulator's checks in Node
python3 test/dense_check.py out.nc part.stl job.json     # every finishing move, at three points along it
```
