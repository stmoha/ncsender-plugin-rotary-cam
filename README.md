# Rotary CAM (ncSender plugin)

Simultaneous 4th-axis rotary CAM inside ncSender. Open an STL or STEP part, rough it
with a flat end mill in spiral layers, finish it with one continuous spiral (ball, flat or tapered ball end mill), follow it with a
second tool only where the first couldn't reach,
clean up under overhangs with indexed (3+1) passes, and simulate the program against
the stock, then load the G-code straight into ncSender. This is the X/Z/A
wrapping-around kind of rotary work that Fusion keeps behind the Machining Extension.

![Rotary CAM in ncSender: a knight placed in square stock between the chuck and the tailstock, wrapped in the orange roughing spiral, with the settings on the left and the program checks on the right](docs/images/knight-roughing.png)

*A knight in 1½ in square stock: the roughing spiral (orange) wraps the part, the chuck,
tailstock and spindle are drawn to scale, and beside them are the checks Rotary CAM runs
on every program before you cut.*

<p align="center"><img src="docs/images/helix-finishing.png" width="49%" alt="A helix open down the middle, its finishing spiral (blue) going through the middle of the coil, past the rotary axis"> <img src="docs/images/helix-simulated.png" width="49%" alt="The same helix simulated: the coil comes out clean, open down the middle"></p>

*Parts open down the middle: on this helix, roughing and finishing go past the rotary axis
to clear the inside of the coil (left), and Simulate shows it carved, open all the way
through (right).*

**New to it? Start with [MANUAL.md](MANUAL.md):** setting up the controller and the rotary, and what to check before the first carve.

## ⚠️ The fine print (worth the 30 seconds)

Rotary CAM is **beta software**. A hobbyist wrote it for his own machine and shares it in case it helps with yours. It writes G-code that swings a spinning cutter around a spinning part. When everything's right, that's magic. When something's wrong, it's a broken bit, a ruined part, a crashed rotary, or worse.

- **You're the machinist.** Rotary CAM is a tool, not a supervisor. Check every program before you run it: simulate it, read the warnings, and air-cut the first one on any new setup. Check that zero is on the axis, A turns the way the plugin thinks, and nothing is in the cutter's way.
- **Safety is on you.** Use solid workholding and eye and hearing protection, keep a hand near the E-stop, and don't leave a running machine alone.
- **No warranty, none at all.** It's provided "as is" under the GNU General Public License v3 (GPL-3.0), without warranty of any kind, including that it works or suits your purpose. It has bugs; some have been found the exciting way, and some are surely still waiting.
- **No liability.** The author and contributors aren't liable for any damage, loss or injury from using it: to your machine, tooling, stock, shop, wallet or self. Whoever presses Cycle Start owns what happens next.
- **Not official.** It's an independent plugin, not made, endorsed or supported by ncSender, Sienci Labs or your machine's maker.

By installing or using Rotary CAM, you accept all of the above. Now go make chips, carefully. 🙂

## Install

- **ncSender › Settings › Plugins**: find **Rotary CAM** in the plugin list and install it.
- Or download `com.cncdocs.rotary-cam_vX.Y.Z.zip` from
  [Releases](https://github.com/stmoha/ncsender-plugin-rotary-cam/releases/latest) and use
  **Install Plugin** in the same place.
- Then open it from **Tools › Rotary CAM**. Updates show as **Update available** on the
  plugin's card in Settings › Plugins (and as a badge in Rotary CAM's header).

Needs ncSender 2.0.88 or later (Pro 2.0.149), grblHAL, and a rotary A axis parallel to X.

## Setup it assumes

- A rotates about X. Chuck on the left (−X), tailstock on the right (+X).
- **Work zero: X0 = 5/16″ (7.94 mm) in front of the chuck jaw face, Y0 and Z0 = rotary
  centreline.** Z in the program is the tool-tip radius, so Z0 must be the axis, not the
  top of the stock. The 3D view marks it (*G-code zero: X0 Y0 Z0*), drawn through the stock
  since it's inside it. **Probe the chuck** (beside Generate toolpaths) finds it by touching
  off the chuck (below). Why X0 isn't on the jaw face: ncSender stops a jog at a keep-out
  zone by the bit's centre, not its edge, and starts drawing every program at X0. With X0
  out in front, the headstock zone can reach to 0.1 mm short of it, programs still start,
  and a jog toward the chuck stops a bit up to 5/8″ across before it touches the jaws. No
  cutter's centre goes past X0 toward the jaws, and no cutter's edge comes closer to them
  than **Keep away from the jaws** (Stock & rotary, 1/8″ by default): with X0 5/16″ out, a
  1/4″ bit's edge stops 3/16″ from the jaws. **Work zero (X0) in front of the jaws**
  (Rotary & spindle, Chuck) sets the distance: more for bigger bits, 0 for X0 on the jaw
  face. Every setting still measures from the jaw face; only the program's X numbers move.
  Change it and Rotary CAM asks you to zero X again (Probe the chuck, or **X0 is already
  there**). The program header says where X0 is (*X0 = 7.938 mm in front of the chuck jaw
  face*).
- Y stays at 0 for the rotary passes (Corners and Indexed move in Y with A locked).
- The rotary passes keep the tool tip above the axis, except where a spot can only be
  reached by going past it (see **Deepest below the axis** under Stock & rotary).
- With **Tool changes › Go round the rotary** on (the default once ncSender says where things
  are), start the job with the spindle over the rotary, where you set X0 Y0: the program
  goes up to ncSender's Safe Z and over the part before its first tool change.

Check the A direction once: mark the top of the stock and jog A+90. Set
*A+90 moves the top of the stock to* to wherever the mark went (−Y or +Y). Getting this
wrong mirrors anything asymmetric.

## Using it

1. **Tools › Rotary CAM** opens a full-window view of the rotary setup: chuck (4 jaws, or
   3), stock, tailstock, the rotary axis and the G-code zero. The version shows under the
   name, beside a **Manual** link (opens [MANUAL.md](MANUAL.md) in a new tab), with a pulsing badge when ncSender finds a newer release (its card links to what's
   new, opens ncSender's plugin settings, or updates it there and then). The header always
   shows the stock: what's set, the least the part needs (across and from the jaws to the
   centre), and the room Z has above the axis, in red when something's short; click it for
   Stock & rotary. The collet nut and spindle go
   see-through when they'd hide the part (looking down from the top, say). The first time
   it opens it shows the fine print (above) until you click **I understand**; click **beta**
   next to the name to read it again. **Open…** (or drop) a `.stl`, `.step` or `.stp`
   part, or a Rotary CAM project (`.rcam`, below).

   Settings show in ncSender's units. A length or feed can be typed in either unit, or
   as a sum: `1/4"`, `6.35mm`, `1-1/2 in`, `100ipm`, `8mm*2`. A plain number is
   in the units shown. Up and Down step it by 1 (Shift 10, Alt 0.1, Ctrl 0.001). A field
   that can't be read turns red and says why when you point at it.
2. **Place the part** with the buttons on the 3D view:
   - **Turning axis X / Y / Z:** which model axis lies along the rotary. A new file starts
     on its longest side.
   - **Flip ends:** which end goes in the chuck.
   - **Turn ↺ / ↻ 90°**, or **click the part**: turns it about the rotary axis so the side
     you clicked faces up at A0.
   - **On axis:** what sits on the rotary centreline: the centre of the part, the centre
     of its chuck end (a chess piece's round base), the tailstock end, or the model origin.
   - **A slider:** turns the part and its stock the way the rotary will.
   - **Part starts at X** (Part placement): from the jaw face to where the work
     starts: the chuck end tenon first, then the part. A longer tenon
     moves the part along, so you set this once. Keep it at least **Keep away from the
     jaws**, or the tools can't cut all of the tenon; the check that says so has a
     **Set Part starts at X to …** button. Settings from before 0.11.5 are converted so the
     part stays where it was.
   - **Scale** (Part placement): the part's size against the model as drawn (100%). A model
     drawn in inches but read as millimetres needs 2540%. **Scale model to fit the stock** picks
     the largest size that fits the stock with 1 mm to spare all round and fits between
     where the part starts and the tailstock, leaving the tailstock end tenon's length (or
     the tools' room) and the keep-away; the message says what set the size and where each
     end is. If Part starts at X is inside the keep-away from the jaws, it moves out to it.
     A part too big for the stock offers **Set Stock width / Stock diameter to …** and
     **Scale the part to fit**; stock too short offers **Set Stock length to …**.
   - Settings in the side panel update the 3D view as you type or use the arrow keys.
3. **Stock & rotary:** round, square or rectangular stock, its **Stock length** (the whole
   piece, the end in the jaws included) and **Clamping distance** (how far it goes into the
   jaws past the jaw face, 1/2" to start), keep-away distances. The live centre is at the
   stock length less the clamping distance from the jaw face; changing the clamping
   distance keeps the stock length, so the centre moves. The 3D stock goes into the jaws by
   the clamping distance. If the part doesn't fit, it turns red. **Size the stock to fit the
   part** (bottom of the section) is the other way round from Scale model to fit the stock: the
   part keeps its size and the stock is set for it, 1 mm to spare all round (rounded up to
   a whole mm, or a tenth of an inch) and long enough for the part, the tailstock end tenon
   (or the tools' room) and the keep-away from the tailstock. The clamping distance stays.
   **Deepest below the axis:** how far roughing and finishing may take the tool tip past the
   rotary axis. Most of the part is reached from above the axis, half a turn round, so the
   tool only goes past it where nothing else gets there: the middle of a slot or hole right
   through the part (a ball goes one radius past, so no thin web is left on the axis), the
   bottom of a hole that goes past the axis, the inside of a curl. Empty (auto) goes there,
   only as deep as each spot needs; a number is the most it may go; 0 keeps the tool above
   the axis everywhere (Indexed can clean up those spots instead). After Generate a message
   says how deep and where. Where nothing of the part is under the tool at all (looking
   straight through a slot), roughing and finishing now cut down to the axis instead of
   leaving the stock there.
4. **Tenons** (on by default): a solid round stub on the rotary axis at each end of the
   part, so it stays joined to the stock while it's carved. Each one reaches a set depth
   into the part and runs out to the uncut stock past the end. Nothing cuts into a tenon;
   **Parting** cuts each one down to its diameter at the end, ready to cut the part free.
   Trim the stubs off the part afterwards.
   - **Ends:** both, chuck end only, or tailstock end only.
   - **Same at both ends** (default, Ø1/2" × 1/4" deep): untick it to give each end its own
     diameter and depth, for example a thin tenon into a small nose and a bigger one into
     the base.
   - **Length out of the part:** how long each tenon is between the part and the rest of
     the stock, which stays full size. Empty (*auto*) is just the room the tools need to
     reach the end of the part (with Parting on, at least one parting cutter); set it for a
     longer stub to saw through. Without Parting, roughing takes the whole length down to
     the tenon's diameter; with Parting on, roughing leaves it thick past the tools' room
     (the part stays held firmly while it's carved) and Parting cuts it down last. A long
     one at the chuck end brings the
     collet nut near the chuck: it stays up there and says so if it would hit.
   - Reach the tenon past any thin or off-centre spot near the end (a chess knight's nose);
     otherwise only that spot holds the part. The tenons show green in the 3D view, the
     side profile and the simulation.
5. **Setups and strategies.** The side panel has three groups that open and close as a
   whole: **Part** (Part placement, Stock & rotary, Tenons), **CAM setups** (how the part
   is cut) and **Settings** (Rotary & spindle, Tool changes, Machine).
   - A **setup** is one way of cutting the part: a list of **strategies** that run top to
     bottom. A part can have several (a quick one, a detailed one) and they share
     everything under Part and Settings. **New**, **Copy** (to try a variation) and
     **Delete** are beside its name; click a setup's button to show it. **Generate** makes
     the program for the setup on show.
   - **+ Add a strategy** picks Corners, Roughing, Finishing, Indexed or Parting. New ones
     go in above Parting (Corners at the top). The same kind can come more than once: a
     second Finishing with a smaller tool, say. Repeats are numbered (*Finishing 2*) and
     draw in a lighter or darker shade of the kind's colour.
   - **Drag** a strategy by its header to change the order (or focus its grip and press
     ↑ ↓). The copy button puts the same again right after it; the bin removes it. Each
     card shows its tool (*T2 · 1/8″ tapered ball*); hover over it for what it does and
     which tools suit it, and click it for its settings. One is open at a time.
   - **Full or Rest** (Roughing and Finishing): Full cuts the whole part as if nothing ran
     before it. Rest plays the program up to it to see what the strategies above left, and
     cuts only there, lifting over the rest: a second roughing with a smaller tool goes
     into what the big one couldn't reach, a second finishing (the old Rest finishing) into
     the corners and creases the first tool couldn't. A new second Roughing or Finishing
     starts as Rest with a 1/8″ flat end mill on the next free tool number.
   - Odd orders get a note in plain words under the list: Finishing before Roughing,
     Corners after Roughing, Parting not last, Rest with nothing before it.
   - Jobs from before 0.13.0 open as one setup of the operations they had on, in their
     old order; Rest finishing becomes a second Finishing set to Rest.

   The strategies:
   - **Corners** (square and rectangular stock only): locks A with each corner up and faces
     it flat with straight X passes, stepping in Y (3+1), turning the square into an
     octagon. Roughing then starts from the octagon, so it spends far less time in air.
     It can use a bigger end mill than roughing; the same tool number means no tool change.
   - **Roughing:** flat end mill, spiral layers, leaving an allowance for finishing.
   - **Finishing:** one continuous spiral, with extra points on sharp features.
     **Pattern** picks which way it cuts:
     - *Round the part (spiral)*: A turns all the time while the tool creeps along X, one
       **Stepover per turn**. The stepover is a distance along the part, so it's the same at
       any diameter; on a surface that slopes along X the turns are further apart on the
       surface (1.4 times at 45°). On a blank whose grain runs along the rotary, the cut
       runs across the grain.
     - *Along the part (lines)*: the tool runs the length of the part and back, and A turns a
       **Stepover between lines** each time, so the cut runs along the grain (cleaner on
       wood) and A only goes round once. How far A turns between two lines follows how wide
       the part is along them: a stepover on the surface at the widest spot, so the lines are
       never further apart than the stepover whatever the diameter, and a thin part gets
       fewer lines than a thick one. Each line is dropped at its own angle. Air-cut it first,
       like any new toolpath.
     Finishing and Indexed take any end mill (Shape): a **ball** for smooth curves, a
     **flat end mill** for flat faces, square shoulders and corners (on curves it leaves
     small steps, so use a fine stepover; the Tool list has the library's flat end mills too,
     and finishing with the roughing tool's number and size needs no tool change), or a
     **tapered ball**: a small ball tip on
     a cone that widens to the shank, for fine detail. Set its tip diameter, taper per side
     and shank diameter here; ncSender's Tool Library doesn't store those yet, so a tapered
     ball kept there as a V-bit can be picked and its diameter is taken as the shank. The
     tool's whole shape is kept off the part (a vertical face lifts the cone before the tip
     can reach it), the stock past what roughing cut is treated as a wall the cone can't run
     into, roughing clears a little further past the ends to make room, and the keep-away
     distances from the chuck and tailstock are measured from the shank.
   - **Finishing set to Rest** (the old Rest finishing): a second tool on a spiral of its
     own, cutting only where the strategies above left something this tool can reach (rest
     machining). The usual pair: a tapered ball finish for the detail, then a small flat end
     mill for the square shoulders, flat floors and corners its cone keeps out of; or a big
     ball, then a smaller one for the creases. It plays the program to the end of finishing
     to see what's left, drops the tool only near that, and cuts where it would take off at
     least **Only where at least** (0.2 mm to start). Gaps shorter than two tool widths it
     rides over, staying down on the surface (no stippling), and where a lot is left it goes
     down in layers a **Stepdown** apart, each one the last pass lifted, so no layer goes
     lower than the last pass. Any shape: flat end mill (to start), ball or tapered ball. Its
     own tool number, stickout and feeds; a short stickout near the chuck keeps it up off the
     part there (it says where). Indexed, when it's on, comes after it and works on what both
     left. After Generate a message says where it cuts and the most it takes off in one spot.
   - **Indexed** (off until you tick it): finishes what the rotary passes couldn't reach.
     It plays the program to the end of finishing to see what's left on the part:
     material hidden under the part from every line through the axis (under a chin or a
     jaw), and, if you want, creases the finishing ball was too big for. It locks A at each
     of the **A angles** you list (90, 270 to start with) and runs 3-axis passes over just
     those patches: the tool
     offset in Y so it comes in beside the overhang, in layers where a lot is left, each
     patch run its long way with linked passes. The tool always points across the rotary
     axis on this machine, so a pocket that only opens toward the chuck or tailstock can't
     be reached; the message after Generate says how much was reached and where the rest is.
     Each angle is checked just before it's planned, against what the angles before it left.
     **Finish the whole side it faces** (off by default): after that clean-up, each angle
     also runs one even finishing pass over the whole side of the part it faces, line by
     line along the part a stepover apart, the tool riding the surface like a 3-axis
     parallel finish, wherever the surface is no steeper across the passes than 55° (the
     next angle round does the steeper parts), the collet nut and spindle clear, inside
     the keep-aways. Clean-up alone goes only where material is left, which on a detailed
     part is many small spots, each its own plunge and hop: a stippled look. The whole side
     gives one even surface, at the cost of time (roughly doubling the cutting time on the
     chess knight). Anything thick still there under the side pass is taken down in layers
     first. It only goes where the ball itself touches the part: beside the part a tapered
     ball's cone can rest on the part's side with the tip far below it, and those spots are
     left out (as is anything below the part's own outline).
     **Pick the angles for me** (off by default) tries A every 15° first and picks the fewest
     angles that reach the most, at most *Most angles* of them. It takes much longer, since
     all 24 are tried before any is planned (on a detailed part, minutes rather than seconds),
     and says so when you tick it. It tries them on a coarser grid (0.6 mm, or half the
     ball's radius) to rank them, then looks at the ones it picks as finely as listed angles.
     **Speed:** a plain ball is dropped onto the part by Rotary CAM's own exact drop-cutter,
     the same contact maths as OpenCAMLib (it agrees with it to well under a micron) with the
     part kept in a grid for each angle, 8 to 15 times faster; a flat end mill or a tapered
     ball still goes through OpenCAMLib. The drops are shared out over all the workers (all the cores but
     one, up to 8), and the checks for
     the collet nut and spindle only look where they're needed. On the chess knight that
     took Indexed from over two minutes to around 20 seconds on one core.
     **Angles in 3D:** with Indexed showing (its button on the view, or any of its settings),
     each angle shows as a see-through Indexed tool coming straight down onto the part the
     way it will with A locked there; once generated, what the rotary passes leave shows as
     yellow blocks. Click an angle's chip (A90°, under *A angles*) to turn the part to it:
     its tool points straight down and the part goes light where that tool can see and dark
     slate where it can't (the dark faces are out of its reach). Drag a tool around the axis
     in the 3D view to change its angle (5° steps, Shift for 1°), ✕ removes one, and **+ A**
     adds the angle the A slider is at: turn the part until the spot you want faces straight
     up, then press it. Changing the angles the calculation picked makes them your own.
   - **Parting:** after finishing, cuts each tenon down to its diameter along its whole
     length (spiralling in), ready to cut the part free. The tenons set where and how thin
     (Tenons: ends, diameter, length), so Parting only has its tool, feeds and depth per
     turn, and needs Tenons on. Off until you tick it. The tailstock end is cut first: the
     chuck end drives the part, so it stays whole until the other end is done. **One cut
     only** cuts a single slot, a cutter wide, right beside the part and leaves the rest of
     the tenon thick: quicker, and enough to saw the part off.
   Toolpaths reach the ends of the part: the cutter runs past an end until its contact
   point gets there, as long as that end goes all the way round the rotary axis (a tenon
   does). An end that sits off to one side with no tenon keeps the whole cutter over the
   part, so the tool never drops down beside the part and cuts through the stock holding it.
6. **Generate toolpaths** for the setup on show. The bar shows each strategy as it's
   worked out. The buttons on the view, one per strategy in its colour, pick which tool and
   toolpath to show (and open its settings); Simulate names the strategy each line belongs
   to. **Checks** (what to
   fix in red, what to check in amber, how Indexed did in green) show under the view on a
   portrait screen or a narrow window. On a wide landscape screen (1200 px or more) they get
   a column of their own right of the view, so the view keeps its height; click its header
   to shut it to a strip that still counts them (remembered in that browser). Notices of
   what just happened (saved, picked up a change) float over the view there.
7. **Simulate** plays the program itself, line by line, against a model of the stock: play,
   pause, drag to any point, and 1× to 1000× speed, with the current line and operation
   shown. The whole program is checked first: rapids that cut into the stock, anywhere
   the stock ends up below the part (red), any cut into a tenon, and the collet nut or
   spindle running into the stock or the chuck, headstock, live centre or tailstock. The
   tool shows with its nut and spindle. The result shows
   with the checks. Where the stock is cut down to the part, the part itself is drawn, so a
   finished surface looks finished; what's still drawn in the stock's colours is material
   that is left. (The stock is modelled as rays out from the axis, which can't draw a face
   they run along, such as the flank of a coil or an end face: those used to show as steps
   and teeth though the cut part is smooth.) If anything is cut below the part, the whole
   stock is drawn the old way so the red can't hide. From the start of Indexed the view shows the part inside a see-through
   stock, with what the rotary passes left as yellow blocks that disappear as Indexed
   cuts them; anything still yellow at the end is what nothing reached.
8. **Load into ncSender**, **Save to File Manager** (in `Rotary CAM/`) or **Download .nc**.
9. **Probe the chuck** (beside Generate toolpaths) finds the work zero for
   you in a dialog laid out like ncSender's own probe dialog (jog pad with the red stop in
   the middle, the connection test beside Start Probe). Touch with a round **pin** and a clip (a dowel
   pin or drill blank), a **3D probe**, or a **fluted bit** and a clip: a bit standing
   still isn't round, so it stops for you to turn it by hand (edges front and back for the
   sides, left and right for the top and the jaw face; 2 or 4 flutes for the sides).
   **Probing** picks X, Y and Z, Y and Z, or any one. It touches both sides of the chuck
   body and goes to the middle (Y0), touches the top there (Z0 is half the **Chuck body
   diameter** below it: measure the round body behind the jaws with calipers), then turns
   A to 0 and touches the front of the jaw that's up (X0; turn a jaw straight up and press
   **Zero A** first). **Touch the sides** sets how far below the top the sides are touched
   (move it to miss a key hole); the dialog says the most the collet nut (or the probe's
   body) allows, down to the axis. For X: **Jaw face in front by** (from where you start),
   **Clear of the jaw face by** (the gap left before it comes down) and **Touch the jaw
   at** (how far below the top of the chuck; raised by itself if the collet nut would
   otherwise come down on the jaw). The tip comes down over the stock, so with **Stock in
   the chuck** on it has to stop 2 mm or more above it: lower is refused. An
   **End view** and a **Side view**, at one scale with the axis at the same height, drawn
   from the chuck, stock, collet nut and these settings, show where the tip touches and
   the way to the jaw face; every setting has its dimension, the one being typed in lights
   up, and the picture follows as you type. A click on a dimension or a part goes to its
   setting. The tool is drawn in a colour for each part of the run (the start, the chuck
   body, the jaw face), the steps have the same colours, and pointing at a step makes its
   part stand out. It also says in plain numbers how far it moves
   in X before it comes down to the jaw. **Speed between touches** sets how fast it moves
   between touches (ncSender's own probe speed when empty), and moves that don't need
   looking at in between go together, so it doesn't stop between them. A has its own jog
   step in degrees, with where A is now beside Zero A. On ncSender Pro each keep-out zone
   has a switch in the dialog, so you can jog over the chuck; the ones switched off there
   go back on when it closes. In portrait the picture comes first. Each touch goes through ncSender's probe
   runner (fast, back off, slow, at ncSender's own feeds), and the work offset is set with
   `G10 L20` where it touched, in mm and back to the units the controller was in. **Half
   turn** (on by default) does the sides and the top again with A turned 180° and averages
   them, so a chuck that doesn't run true still gives the true axis, and it says how far
   off true it runs. Moves to and from the chuck stop if they touch anything; it says what
   the chuck measured across (and warns if that's well off what you typed), and updates
   the rotary zero for tool changes. Details in the [manual](MANUAL.md).

10. **Rotary & spindle — collisions:** the chuck (diameter with the jaws, length), the
   headstock behind it (housing, motor and drive), the live centre (its diameter, the
   length of its cone, and its **Total length** back to the tailstock body: the cone, then
   a round body at its diameter; empty, the cone goes straight into the body), the
   tailstock (body, lock lever and handwheel), the collet nut (diameter, length) and the
   spindle's diameter. In 3D the chuck, headstock, tailstock, live centre body and spindle
   are silver, the jaws, the live centre's cone and the collet nut dark gray. The chuck end
   or the tailstock end turns see-through when it's between you and the part (looking
   down the axis from either end, say), the way the collet nut and spindle do from the top.
   The headstock and tailstock needn't be centred on the axis: each has a length along X,
   a **Reach to the front (−Y)** and a **Reach to the back (+Y)** from the axis, and a
   **Top** above the axis. Each end is kept out as one box, so make it just big enough to
   take in the motor and pulley, or the lever and handwheel, without modelling each piece;
   setting the front and back separately means a motor behind the chuck or a lever out the
   back grows the box only on that side, not both. (0.7.0's single width carries over
   as half to each side.) The box edges can also be taken from the machine: jog the spindle
   to that side, to where the edge of the keep-out zone should be (a pendant, a phone or
   another computer lets you jog while you watch it up close), and press the target button beside **Length along X**, **Reach to the
   front** or **Reach to the back**. It takes where the spindle is now, from the work zero,
   so probe the chuck first; it says so if the spindle is on the wrong side of that edge.
   **Keep-out zones in ncSender** (ncSender Pro): Rotary CAM keeps two keep-out zones of its
   own in ncSender's settings, *Rotary headstock* (chuck and headstock) and *Rotary
   tailstock* (live centre and tailstock), so ncSender won't jog into them or start a program
   that goes through them. They're these boxes plus **Extra room round them** on every side
   but the one facing the part (the headstock zone stops 0.1 mm short of X0, which is 5/16″ in front of the jaw face, and the tailstock zone 0.1 mm past the end of the stock: ncSender draws a program from X0 before its first move), placed
   from the rotary's work zero (G54), and they follow the sizes and the stock length as you
   change them. If the work zero moves away (a job on the table, say) they stay put and the
   panel asks before moving them to it. One switched off in ncSender's settings stays off;
   deleting both there turns **Keep zones round the rotary** off. Every other zone (an ATC's,
   ones you drew) is left as it is: tool change routes go round them, and the program is
   checked against all of them, so a program ncSender would refuse to start is flagged here
   first. Click into or hover over any setting and the 3D view lights up
   the part of the setup it's about, with a dimension line showing what the number
   measures; if that part is off the screen the view swings round to it. The same goes for
   the stock, the keep-aways, retract height, each tool's stickout, the part's start and
   placement, and the tool change, tool setter and rotary zero. Each tool's own sizes are
   dimensioned on it (diameter, flute length, a tapered ball's shank and taper), and the
   pass settings show at the tool with a see-through outline of where the next one goes:
   **Stepdown** (and Parting's depth per turn) as a slab one layer deep, **Stepover per
   turn** one turn along X, Indexed and Corners **Stepover** one pass across, and the
   **Leave** against the part. Those are a few mm across, so clicking into one closes the
   view in on the tool, and leaving the field puts it back (unless you've moved it).
   **Deepest below the axis** shows from the axis down at the tool (on auto, how deep the
   last program went), **Angle step** a spoke round the stock every step, and Stock shape
   and the tenon Ends light up what they change. **Stepovers** (Stepover per turn for
   roughing and finishing, Stepover for Corners and Indexed) can be typed as a length or as
   a % of the tool diameter in the box under each; the other follows. Typed as a %, it stays
   that % when you change the tool. Each operation's tool has a **Stickout**: how far it sticks out of the nut
   (from the Tool Library's stickout when it has one, otherwise its flutes plus a little).
   For a tool picked from the Tool Library, the **Stickout** and **Flute length** live in the
   library: typing them here saves them there, and a change made there (in another plugin,
   or on another computer) comes in here within a few seconds, dropping toolpaths that no
   longer match. ncSender's Tool Library tab doesn't show these two yet; they're kept with
   the tool all the same. A tool typed in here keeps its own. Nothing else of the tool is
   written: not its diameter, type, number or tool length offset (TLO, which sets Z zero for it).
   The 3D view draws all of it at size, the tool with its nut and spindle.
   Every operation keeps the whole tool, the nut and the spindle off the chuck, headstock,
   live centre and tailstock, and keeps the nut and spindle off the part, its tenons and
   the stock past what roughing cut, by **Keep the holder clear by** (2 mm). Where an
   operation would have to go lower than that allows, it stays up instead and says so,
   with the stickout that would let it reach. For a finishing pass (Finishing, Indexed)
   that means the part won't come out as drawn there, so it's a red **Danger** (*The part
   won't come out as drawn between X14 and X20: Finishing can't get down to it there and
   leaves up to 10 mm uncut, because any lower and the collet nut would hit the chuck… give
   the tool at least 38 mm stickout, or move the part further from the jaws*), and **Load
   into ncSender**, **Save to File Manager** and **Download** ask again before going ahead;
   roughing staying up is a yellow check, since finishing follows it.
   **Relief beside an end of the part:** past roughing the stock stays full size up to the
   chuck or the tailstock, so the part is held stiffly while it's carved. When the part is
   thin near one end and the stock is thick, the nut of a tool working on that end can reach
   over that stock and hit its corners. Then roughing turns a band of it, as wide as the
   nut reaches and right beside the part, down to just what the nut needs (with a 45°
   chamfer back up to the full stock), so the tools reach the end of the part. On square
   stock **Corners** faces the corners off over the band too, no deeper than the band:
   often that alone gives the nut its room, and roughing has less to turn. It's only
   cut where a nut would otherwise be held up, and never thinner than the tenon; the rest
   stays full size. If that would leave a ring of full stock narrower than the nut reaches,
   the band runs on instead: at the chuck to **Keep away from the jaws** (1/8″ from the jaws
   to the cutter's edge), at the tailstock to the end of the stock, past **Keep away from the
   tailstock**, when the tip stays well above the live centre (the holder's clearance over a
   quarter of its cone): the holder checks still keep the tool and nut off the centre and the
   tailstock body; a pass that runs off the end of the stock goes 0.5 mm past it. The room
   counts every tool working at that end, Parting all along the tenon. When Parting still
   has to stay up off a tenon, its check suggests what would let it get down (a thicker or
   shorter tenon, or Part starts at X), each tried by planning again with it first.
   Roughing › **Make room for the collet nut at the ends** turns it all off.
   When a cut comes within 1/4″ of the jaw face, a check says to make sure the jaws don't
   stick out past the face X was set from (on many chucks they stand proud of the body). If
   they do, put how far in **Jaws stick out past X's face** (Rotary & spindle, Chuck): the
   keep-away and the collision checks then count from the jaws themselves. Rapids
   travel high enough for the holder too. Indexed checks every pass against what's
   actually left (and the uncut stock past it), picks its angles where the nut and spindle
   fit, and says how much only a longer stickout would reach.
11. **Tool changes:** ncSender's Manual Tool Changer lifts to Safe Z and goes in straight
   lines to the tool change position and the tool setter, and back to where the M6 was.
   A straight line can pass over the rotary, and a long tool at Safe Z may not clear the
   chuck or tailstock. With **Go round the rotary** on, before each M6 the program goes up
   to Safe Z (`G53 G0 Z`) and round the rotary's footprint (grown by the spindle's radius;
   it never assumes the tool clears it) to the tool change position, issues the M6 there,
   and comes back the same way. ncSender's own moves are then only between the change
   position and the tool setter; if that line passes over the rotary it says so, since it
   can't steer that one. It needs to know where things are, in machine coordinates, and
   reads them from ncSender each time the dialog opens and before each Generate:
   - **Rotary zero:** the active work offset (G54) from the controller. The work zero is the
     jaw face on the axis, so that is where the rotary is.
   - **Tool change position and tool setter:** the Manual Tool Changer's settings.
   - **Safe Z:** ncSender's Settings.
   - **Top of Z above the axis:** how far above the rotary axis the tool tip is with Z at
     the top of its travel (machine Z0), from the work offset with the tool in the spindle,
     and the bottom of the travel from $132.
   - **Stickout of the tool in the spindle:** the tool whose length is in that work offset.
     Empty (*auto*), it's the stickout set here (or in the Tool Library) for the tool
     ncSender says is in, or else the first operation's tool; set it when that's wrong.
   - Type any of them in instead (another tool changer, ncSender not connected); a typed
     value is kept until **Read from ncSender**. The machine's travel limits keep the way
     round inside the machine.
   The 3D view (Fit setup) shows the tool change and tool setter, and the way round once
   generated.
   **Z travel:** ncSender checks a program against the machine's Z travel using the work
   offset when it's loaded, and flags anything above machine Z0. Rotary CAM keeps every
   move inside it: a tool that sticks out further than the one in the spindle has that much
   less room (its tip sits lower at the top of Z), so each operation gets its own limit.
   - The spindle nose sits the top of Z plus the spindle tool's stickout above the axis, so
     with this stock a tool can stick out so far and no further: the header shows it (*Z
     allows 1.667 in stickout*). If any tool sticks out more, Generate is off and one
     message says how far tools may stick out, which are too long and by how much, which
     tool it took to be in the spindle (and why), and how to check it on the machine: jog
     Z to the top, ncSender's Z reads the top of Z and the tip is that far above the axis.
     The tool in the spindle when the program is loaded has to be short enough too, since
     ncSender checks the whole program with it. A shorter stickout (zero Z again with it
     in), or smaller stock, fixes it.
   - Which tool is in the spindle, and so where the spindle nose is, is worked out when Z is
     read from the machine and kept until the machine changes (Z zeroed again, another
     tool): shortening stickouts in the settings is a plan for the next time a tool goes
     in, so the limit holds still while you do it. Once every operation fits, the message
     says what's left: put in the first tool, zero Z with it, and Generate again.
   - One tool number is one tool in one holder: a stickout or flute length set for one
     operation goes to every operation with that tool, and a tool picked from the Tool
     Library that another operation already uses comes in as set there. Two stickouts for
     one number (from older settings) stop Generate with a button for each; the same
     number for a different size or kind of tool does too.
   - It needs Z zeroed on the rotary axis and the machine homed. With Z0 still at the top of
     the travel (not zeroed on the axis yet), or the machine not homed, it isn't checked:
     the header says *zero Z on the rotary axis first* or *home the machine first*, Generate
     stays on, and the program carries a note. Zero Z on the axis, then generate (or press
     Read from ncSender) before loading.
   - Rapids that wanted to go higher than the travel allows are kept at the top of Z; if
     that still clears the stock, the message just says so. If the collet nut and spindle
     needed more room than that, or a cut would go below the bottom of the travel, it's a
     red *Danger* message. It's about how far Z can travel, not about hitting something,
     so the simulation looks fine. It says to check Z0 first: Z zeroed with a probe or a
     bit the tool setter never measured is off by the difference in length once the next
     tool is measured, and that looks just like too little travel.
12. **Save project…** keeps the whole job in one `.rcam` file; **Open…** brings it back:
   the part, every setting, the tools, and the G-code and toolpaths if they were generated,
   ready to simulate or load without calculating again. The rotary, spindle and tool change
   settings stay this machine's. (If ncSender's units, the axis rates, or the rotary,
   spindle or tool change differ from when it was saved, it says so and you generate again.
   A tool that's no longer in your Tool Library as saved keeps the project's own settings.)

### Project files (`.rcam`)

A `.rcam` is an ordinary ZIP archive; rename it `.zip` to look inside:

| File | What it is |
| --- | --- |
| `project.json` | format and version, the Rotary CAM version that saved it, units, the part's name, every setting (the same job settings ncSender stores for the plugin), the tools each operation uses with their Tool Library entries |
| `part.stl` | the part as Rotary CAM uses it, as drawn (before it's placed on the rotary), binary STL: opens in any CAD or slicer |
| `source/<name>.step` | the STEP file it came from, when the part was opened from one |
| `program.nc` | the G-code, when it's been generated |
| `result.json`, `result.bin` | the toolpaths, previews and Indexed leftovers behind that G-code (typed arrays in the `.bin`) |

Save project uses the browser's Save dialog where it has one (ncSender on this computer),
otherwise it downloads the file.

Every setting has a tooltip (hover it, or the **?** beside it).

**Which way A turns** (Machine): *A+90 turns the top of the stock* toward you (−Y) or away
(+Y) has to match the machine. Wrong, the rest of the part only comes out mirrored, but
Indexed cuts from the side and lands on the opposite one (180° off at A90 and A270). **Turn
A +90°** jogs A a quarter turn (`$J=G91 G21 A90`, in degrees whatever the units; not while
the machine is running): raise Z clear first, watch which way the top of the stock goes and
press *Toward me* or *Away from me*; **Turn it back** jogs it −90°. Until it's been checked
the Machine section says so, and a program with Indexed asks too. Picking the other way
from what the toolpaths were made with drops them to generate again.

**Dust collection / dust boot** (Machine): off unless you turn it on. *M8*, *M7* or *M7 + M8*
switches it on after the spindle starts in each operation and off (M9) before every tool
change and at the end, so a dust boot is up while the tool changes and travels round the
rotary. A lowered dust boot isn't in the collision checks: check it clears the chuck, jaws,
tailstock and stock.

**Units:** Rotary CAM follows ncSender's units setting. In inches every field is in
inches (in, in/min) and the program is posted in G20; in millimetres, G21. **But:** in an
inch program grblHAL multiplies every axis word by 25.4, A included, unless that axis is
set as rotary (`$376`, bit 0 for A: `$376=1`). With A not set as rotary, A90 turns 2286°
and the carving comes out at the wrong angles. So an inch program is only posted when the
controller reports `$376` with A set; otherwise the program is posted in millimetres (it
runs the same) and says why. Set `$376=1` to get inch programs (check `$103`, `$113` and
`$123` then: they're read per degree for a rotary axis).

**Picking up where you left off:** closing and reopening keeps the part, settings,
toolpaths and view. The part and its toolpaths are also kept in this browser, so they
come back after a page reload. A calculation keeps running if you close the dialog.

**On another computer:** the settings are kept in ncSender, and so are the part and its
toolpaths: each time a part or a project is opened or toolpaths are generated, they're put
in ncSender (one project file, in a folder its File Manager doesn't list), and any other
computer that opens Rotary CAM on that ncSender gets them, with a note saying so. One
that's already open takes them in within a few seconds. Open the part and generate at the
machine, then simulate on the laptop, or the other way round. A part opened before this
was added (0.12.0) isn't shared until something changes: open it or press Generate once.

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
  until it is within the **Tolerance** (default 0.01 mm). Where the surface steps like a
  wall between two angles a hair apart (the edge of a coil the tool reaches past the axis
  on one side and rides on top of on the other), adding points can't close it: there the
  move is split so the tool lifts before it turns up the wall, or turns before it goes
  down one, instead of clipping the wall's corner.
- 3D view: [three.js](https://threejs.org) (MIT).
- Simulation: the stock is kept as a radius for every X and every degree around the axis,
  plus up to three gaps under it where a cut went through the inside without reaching the
  top (a tool past the axis clearing the middle of a coil, or one beside the part reaching
  under an overhang); gaps join up as they meet, and a cut from the top takes those it
  reaches with it. Each move is stepped through finely and the cutter (flat or ball,
  anywhere in Y) trims every ray it reaches. The view draws the outside and each ray's
  outermost gap, with faces only between rays that both have stock and walls where it ends,
  so a part open down the middle shows open. The gouge check and what's left for Indexed
  count the gaps too.
- Fields that take units (`1/4"`, `6mm`, `100ipm`):
  [ncsender-unit-input](https://github.com/tmuka/ncsender-unit-input) by Tony Muka
  (t0n3), GPL-3.0, in `lib/unit-input.js`.
- STEP reading: [occt-import-js](https://github.com/kovacsv/occt-import-js) (Open
  CASCADE, LGPL-2.1).

These are included unmodified; their licences are in `licenses/`.

## Settings

Every change is saved to ncSender as you make it (a moment's pause while typing) and when
Rotary CAM closes, so it's there on every computer that opens Rotary CAM on that ncSender,
and after updates. Several computers can have it open at once: a save only writes what that
window changed and keeps everyone else's changes (if two change the same setting, the later
one stands). Each window also checks ncSender every few seconds, whenever it comes back to
the front, and before every command (Generate, Load into ncSender, Save to File Manager,
Download, Save project, Simulate), so a change made on another computer is in before
anything is made or sent. If it means the toolpaths no longer match the settings, they're
dropped rather than loaded, and the message says which settings changed; a field you're
typing in is left alone until you leave it. If ncSender can't be reached it keeps trying
and says so. A stickout or flute length you type for a Tool
Library tool is saved in the library (since 0.14.0; one typed before that goes there the
first time Rotary CAM opens), so every computer and plugin sees the same.

## Known gaps

- A turns continuously (hundreds of turns). If A has soft limits, check `$133`.
- The holder is the collet nut and the spindle as two plain cylinders, the rotary as a
  cylinder (chuck), a cone (live centre) and two boxes (headstock, tailstock body). The
  rotary passes check the holder against the part turned all the way round (it does turn
  under it), which is right for spirals and on the safe side elsewhere.
- Tool change routes never pass over the rotary, however high Safe Z is: on a machine
  where the tool clears it they're a little longer than they need to be. ncSender's own
  move between the tool change position and the tool setter can't be steered (it's
  flagged when it crosses the rotary). The program's first move, from wherever the spindle
  is to over the part, is a straight line at Safe Z.
- ncSender Pro's keep-out zones are rectangles in X and Y, and nothing may pass over them
  at any height. Rotary CAM's own two (see Rotary & spindle) are updated while it's open:
  change the setup with Rotary CAM closed and they catch up when you next open it. The
  collision checks don't rely on them. ncSender's own move between the tool change
  position and the tool setter isn't checked against zones.
- The simulation keeps up to three gaps per X and angle and draws the outermost, so a
  pocket hidden behind another one only shows through Indexed's yellow blocks.
- Tapered balls take about three times as long to calculate as plain balls: OpenCAMLib's
  ball+cone cutter now and then misses a contact at one exact spot, so every tapered drop
  is checked against the tool's own ball tip and a 1 micron shifted drop.
- Roughing plunges straight in from the safe height.

## Development

Releases: see [RELEASING.md](RELEASING.md).

```
cd viewer && npm install && cd ..       # three.js + esbuild for the 3D view bundle
node build.mjs                          # bundles the 3D view, stamps the build tag, writes dist/rotary-cam-<version>.zip
node build.mjs --test                   # the same as dist/com.cncdocs.rotary-cam_v<version>-test.zip (--release: the release name)
node dev/logo.cjs                       # renders dev/logo.svg to icon.png
node test/run-node.js part.step - out.nc   # same engine in Node
node test/harness/serve.mjs             # stand-in for ncSender's plugin APIs on :8777
python3 test/verify_rotary.py out.nc part.stl job.json [tenons.json]   # independent gouge / rate / keep-out / tenon check
node test/e2e-v3.cjs test/knight_test.step out/          # browser walkthrough (units, stock, restore, close guard)
node test/e2e-v4.cjs test/knight_test.step out/          # corners, parting, simulation
python3 test/make_horn.py test/horn.stl                  # test part whose end curls off the axis
node test/e2e-v5.cjs test/horn.stl out/                  # tenons
node test/e2e-v11.cjs test/chin_test.step out/            # corner zero, G-code zero, jaws, see-through spindle, tenon length
node test/tenon-test.js                                    # tenon length, scale to fit, corner zero maths
node test/drop-test.js                                     # Indexed's own ball drop against OpenCAMLib (must agree)
node test/below-test.js                                    # past the axis only where needed (slot_test.step: make_slot_step.py)
node test/flat-test.js                                     # finishing and Indexed with flat end mills: simulated, never below a fresh drop
node test/make_coil.js test/coil.stl                       # test part: a coil open down the middle
node test/coil-test.js                                     # the core cleared from past the axis: kept, drawn, checked; walls split
node test/probe-test.js                                    # Probe the chuck against a pretend machine (test/harness/probe-machine.cjs)
node test/e2e-v26.cjs out/                                 # the Probe the chuck dialog end to end, through the harness's /api/probe/start
node test/setups-test.js                                   # setups: old jobs become one, any order gives the same moves, rest roughing, two setups
node test/zones-test.js                                    # keep-out zones: Rotary CAM's two, the program check, routes round other zones
node test/relief-test.js                                   # relief beside an end of the part: when, how deep, roughing and corners over it, 1/8" from the jaws, to the end of the stock
node test/e2e-v32.cjs out/                                 # Make room for the collet nut at the ends, Jaws stick out past X's face, the check about the jaws
node test/finish2-test.js                                  # rest finishing: a flat end mill after a tapered ball takes most of what it left, nothing cut into the part
node test/e2e-v12.cjs test/chin_test.step out/            # listed angles by default; 4 workers = 1 worker, move for move
node test/ztravel-test.js                                  # programs kept inside the Z travel; Generate off when the stock can't be cleared; dust collection on/off
node test/lines-test.js                                    # Finishing along the part: the lines' angles follow the part's width, there and back, no gouges
node test/indexside-test.js                                # Indexed's whole side never rides a tapered ball's cone below the part
node test/e2e-v13.cjs test/chin_test.step out/            # version + update badge, stock at a glance, Z travel in the UI
node test/e2e-v14.cjs test/chin_test.step out/            # settings survive reopening and two computers at once
node test/e2e-v15.cjs test/chin_test.step out/            # a change on one computer is in the other before it generates or loads
node test/e2e-v17.cjs test/chin_test.step out/            # inch programs only with A set as rotary ($376), otherwise mm
node test/e2e-v19.cjs test/chin_test.step out/            # the checks: a column on wide landscape screens (shuts to a strip), below the view on portrait
node test/e2e-v20.cjs test/horn.stl out/                   # stock too thin or too short: the checks name the field and set it
node test/e2e-v21.cjs test/horn.stl out/                   # Size the stock to fit the part: across and long, in mm and inches
python test/make_slot_step.py test/slot_test.step          # test part with a slot through it and a hole past the axis
node test/e2e-v22.cjs test/slot_test.step out/             # Deepest below the axis: auto goes past it and says so, 0 stays above
node test/e2e-v23.cjs test/chin_test.step out/             # flat end mills for finishing and Indexed: Shape, the Tool list, Generate
node test/e2e-v24.cjs test/chin_test.step out/             # tool sizes and pass settings dimensioned in 3D; the view closes in and goes back
node test/e2e-v25.cjs test/coil.stl out/                   # Simulate shows the inside of a part open down the middle
node test/e2e-v27.cjs test/coil.stl out/                   # Finishing along the part, Parting's One cut only (tailstock end first), Simulate draws the part where it's cut to size
node test/e2e-v28.cjs test/horn.stl test/coil.stl out/     # the same job on another computer: the part and toolpaths follow through ncSender
node test/e2e-v29.cjs test/slot_test.step out/             # setups: groups, strategies to add, drag and set to rest, Generate, Simulate, a second setup, kept on reopening
node test/e2e-v31.cjs out/                                 # lengths and feeds take units and sums (1/4", 6mm, 100ipm, 8mm*2), metric and inch, and in Probe the chuck
node test/e2e-v30.cjs out/                                 # Tool Library stickout and flute length both ways; Pro keep-out zones kept, followed, left off, moved, checked
node test/e2e-v18.cjs out/                                # the fine print: on first open until accepted, from the beta badge, same words as the docs
node test/e2e-v16.cjs test/chin_test.step out/            # one Z travel message, the spindle tool's stickout, one stickout per tool, stock length + clamping, live centre length, fading ends, colours
python3 test/make_chin_step.py test/chin_test.step        # test part with a jaw over a gap
node test/e2e-v6.cjs test/chin_test.step out/            # Indexed
node test/e2e-v7.cjs test/knight_test.step out/          # tapered ball bits
node test/e2e-v8.cjs test/chin_test.step out/            # scale, Indexed angles in 3D, projects
node test/e2e-v9.cjs test/chin_test.step out/            # rotary, spindle, stickout, tool changes round the rotary
node test/route-test.js                                  # the tool change router
node test/project-test.js test/horn.stl                  # .rcam round trip (and a stock unzip reads it)
node test/shot-reach.cjs part.step out.png 90 iso        # screenshot of an Indexed angle's reach shading
python3 test/index_check.py out.nc out.nc.left.json job.json   # how much of what finishing left the indexed G-code cuts
node test/sim-node.js out.nc placed.stl job.json         # the simulator's checks in Node
python3 test/dense_check.py out.nc part.stl job.json     # every finishing move, at three points along it
```

## License

Copyright (c) 2026 Stefan (cast architecture), plugin authored with Claude (Anthropic).

Rotary CAM is free software under the [GNU General Public License v3](LICENSE)
(GPL-3.0): you can use, change and share it, and what you share built on it has to be
GPL-3.0 too, with its source. Releases up to 0.14.1 came out under the MIT License and
stay under it. The parts it includes keep their own licences (in `licenses/`, and
ncsender-unit-input's GPL-3.0).
