# Rotary CAM manual: setting up, and checking before the first carve

Rotary CAM turns a part (STL or STEP) into a simultaneous 4th-axis program for ncSender on
a grblHAL machine. The rotary sits parallel to X: chuck at −X, tailstock at +X.

Almost everything that goes wrong on a first carve is set up once and then stays right: the
controller's A settings, which way A turns, the size of the rotary and spindle, and where
zero is. This manual walks through those in order. Then comes a checklist for the first
carve, and a list of symptoms and what causes them.

**The one rule:** air-cut the first program on a new setup, and keep a hand near feed hold
for the first few turns of every new job.

## ⚠️ The fine print (worth the 30 seconds)

Rotary CAM is **beta software**. A hobbyist wrote it for his own machine and shares it in case it helps with yours. It writes G-code that swings a spinning cutter around a spinning part. When everything's right, that's magic. When something's wrong, it's a broken bit, a ruined part, a crashed rotary, or worse.

- **You're the machinist.** Rotary CAM is a tool, not a supervisor. Check every program before you run it: simulate it, read the warnings, and air-cut the first one on any new setup. Check that zero is on the axis, A turns the way the plugin thinks, and nothing is in the cutter's way.
- **Safety is on you.** Use solid workholding and eye and hearing protection, keep a hand near the E-stop, and don't leave a running machine alone.
- **No warranty, none at all.** It's provided "as is" under the MIT License, without warranty of any kind, including that it works or suits your purpose. It has bugs; some have been found the exciting way, and some are surely still waiting.
- **No liability.** The author and contributors aren't liable for any damage, loss or injury from using it: to your machine, tooling, stock, shop, wallet or self. Whoever presses Cycle Start owns what happens next.
- **Not official.** It's an independent plugin, not made, endorsed or supported by ncSender, Sienci Labs or your machine's maker.

By installing or using Rotary CAM, you accept all of the above. Now go make chips, carefully. 🙂

---

## 1. How the program sees the machine

- **Work zero:** X0 is the chuck's jaw face. Y0 Z0 is the rotary axis, the centreline of
  the chuck. Every move in the program is relative to that, so Z is "how far above the
  axis".
- **A:** degrees, turning continuously. A roughing or finishing pass turns A many times
  (the stats show *A turns*: often hundreds), so A has to be accurate over hundreds of
  turns, not just one.
- **Units:** the program follows ncSender's units (inches or millimetres). Inch programs
  are only written when the controller has A set as a rotary axis (see `$376` below).
- **Tool changes:** M6 (ncSender's tool change) by default. With *Go round the rotary* on,
  the program lifts to Safe Z and goes round the chuck, headstock and tailstock to the tool
  change position first.

---

## 2. The controller (once)

Check these in ncSender's console (`$$` lists them all) before anything else.

### `$376`: A is a rotary axis

`$376=1` (bit 0 is A). If A isn't marked rotary, grblHAL treats it as a length and, in an
inch program (G20), multiplies every A value by 25.4: *A90* turns 2,286°. The features come
out at the wrong angles. Rotary CAM won't write an inch program unless the controller says
A is rotary (it writes millimetres instead, which grblHAL never rescales, and says why),
but set it anyway.

### `$103`: A steps per degree (calibrate it)

This has to be **exact**. A 0.1% error is invisible over one turn but puts the last passes
of a 300-turn program about 100° away from the first ones: roughing and finishing stop
lining up and the detail gets cut away.

1. **Work it out:** motor steps per turn × microsteps × gear ratio ÷ 360. A 200-step
   motor at 16 microsteps through 12:1 is 106.6667. If your ratio is exact (gears, a
   belt with known teeth), this is the number. Don't round it (107 is 0.3% out).
2. **Check it over 10 turns:** mark the chuck and something fixed next to it. Zero A at
   the mark. Send `G0 A3600`. Jog A until the mark lines up again and read A. The right
   value is `$103` × that reading ÷ 3600. Always come up to the mark from the same
   direction.
3. **Check it over 100 turns:** zero A at the mark, `G0 A36000`, then `G0 A0`. The mark
   should line up within a degree or two.
4. **Check it at speed:** run the same test at the rates the program uses (the roughing
   feed turns A fast). If it's fine slowly but off at speed, the motor is skipping steps:
   lower `$113` (A max rate) or `$123` (A acceleration), don't change `$103`.

Don't calibrate over hundreds of turns without counting them: a whole turn gained or lost
looks the same as none.

### `$113`, `$123`: A max rate and acceleration

Rotary CAM reads `$113` and plans around it (the *Limited by axis speed* stat says how
often A is the limit). Set them to what the rotary can actually do without losing steps
(see the speed check above).

### `$20`, `$133`: soft limits and A travel

The program turns A continuously, often to tens of thousands of degrees. With soft limits
on (`$20=1`) and an A travel (`$133`) smaller than that, grblHAL alarms partway through.
Rotary CAM warns when that would happen.

---

## 3. Rotary CAM's Machine section (once)

### Which way A turns

**A+90 turns the top of the stock:** *to you (−Y)* or *away (+Y)*. This has to match the
machine. Wrong, roughing and finishing still look right (the part comes out as a mirror
image of the model, which is hard to spot), but **Indexed cuts the opposite side**: 180°
off at A90 and A270.

1. Raise Z clear of the stock.
2. Press **Turn A +90°** and watch the top of the stock.
3. Press **Toward me (−Y)** or **Away from me (+Y)**.
4. **Turn it back (A −90°)** returns it.

The A+ arrow in the 3D view points the way you've set. Until you've checked, the Machine
section says so, and a program with Indexed asks.

### Axis rates

Read from the controller (`$110`, `$111`, `$112`, `$113`) when ncSender is connected.

### Dust collection / dust boot

**Off** unless you turn it on. *M8*, *M7* or *M7 + M8* switches it on after the spindle
starts in each operation, and off (M9) before every tool change and at the end, so a dust
boot is up while the tool changes and travels round the rotary.

**A lowered dust boot isn't in the collision checks.** On a rotary the boot is close to the
chuck, jaws, tailstock and the stock's corners. Check the clearance at the ends of the part
with the boot down before turning it on, and leave it off if in doubt.

### Tool change

*M6* runs ncSender's tool change (with the Manual Tool Changer: tool change position, tool
setter). *M0 pause* just stops so you can swap the tool and touch Z off again yourself.

---

## 4. The rotary and spindle: Rotary & spindle — collisions (once)

Every operation keeps the tool, the collet nut and the spindle off these, so measure them.
The 3D view draws them at size, and clicking into or hovering over a setting lights its
part up with a dimension.

- **Chuck:** diameter with the jaws, length back from the jaw face, 3 or 4 jaws.
- **Headstock:** the housing, motor and drive behind the chuck, as one box: length along
  X, reach to the front (−Y) and back (+Y) from the axis, top above the axis. Make it big
  enough to take in the motor and pulley; generous is fine.
- **Live centre:** diameter, cone length, and **Total length** from its point back to the
  tailstock body (the cone, then its round body). Empty: the cone goes straight into the
  body.
- **Tailstock:** body, lock lever and handwheel, as one box, like the headstock.
- **Collet nut and spindle:** nut diameter and length, spindle diameter.
- **Keep the holder clear by:** how close the nut and spindle may come to anything.

---

## 5. Tool changes and Z travel (once, then checked every Generate)

**Tool changes** reads, each time the dialog opens and before every Generate:

- the rotary zero (the active work offset, G54 to G59);
- the tool change position and tool setter (Manual Tool Changer);
- Safe Z (ncSender's settings);
- **Top of Z above the axis:** how far above the rotary axis the tool tip gets with Z at the
  top of its travel, from the work offset with the tool in the spindle.

Anything typed in instead is kept until **Read from ncSender**.

### Z travel: how far tools can stick out

ncSender checks a program against the Z travel when you load it, using the work offset as
it is then. Nothing may go above machine Z0. On a rotary that's tight: the spindle nose is
only so far above the axis, and the stock has to clear the tool as it turns.

The header shows it: **Z allows 1.418 in stickout**. Any tool that sticks out further, or a
tool in the spindle at load that does, stops Generate with one message:

- the most a tool can stick out, and which tools are too long and by how much;
- which tool it took to be in the spindle, and why;
- how to check: jog Z all the way up. ncSender's Z should read the top of Z, and the tool tip
  should be that far above the axis.

**Stickout of the tool in the spindle:** the plugin knows which tool ncSender says is in,
and takes its stickout from your settings. If ncSender names a tool it doesn't know (or
none), it takes the first operation's tool. Set it here when that's wrong.

The limit only changes when the machine does (Z zeroed again, another tool in), not while
you edit stickouts: shortening a tool in the settings is a plan for the next time it goes
in.

**Zero Z on the rotary axis with the program's first tool in the spindle, then Generate,
then load.** If you change the tool or zero again, generate again before loading.

---

## 6. Zero: Work zero — probe the chuck or a corner

X0 Y0 Z0 has to be the jaw face on the axis. You can touch it off by hand the usual way,
or let Rotary CAM find it.

### Probe the chuck

**Probe the chuck…** opens a dialog laid out like ncSender's own probe dialog: the
settings on the left, a picture and a jog pad (with ncSender's red stop in the middle) on
the right, and the connection test at the bottom beside the **Start Probe** button it holds
back. It touches both sides of the chuck body and goes to the
middle (Y0), touches the top there (Z0 is half the chuck's diameter below it), then turns A
to 0 and touches the front of the jaw that's up (X0). **Probing** sets all three, Y and Z,
or any one on its own.

The picture shows an **End view** and a **Side view** of the chuck, both at one scale with
the rotary axis at the same height, drawn from your chuck, stock and collet nut (Rotary &
spindle) and the settings here. The end view (looking along the axis, the front of the
machine on the left) shows the tip touching the front and the back of the chuck, how far
below the top, and how much room the nut has above the chuck. The side view shows the way
to the jaw face (up, X+, down) and the touch on the jaw. Both show where you start. Every
setting has its dimension, standing clear of the parts, and the one you're typing in lights
up; the picture follows as you type. **Click a dimension or a part in the picture** (the
pin, the chuck, the stock) and you're in its setting.

The tool is drawn once for each part of the run, each in its own colour: grey where you
start, blue for the touches on the chuck body, violet for the touch on the jaw face. The
numbered steps under the settings have the same coloured dots; point at a step and its part
of the picture stands out.

On a portrait screen the picture comes first, then the settings, the jog controls and the
notes. If the settings are taller than the window they scroll on their own, so the picture,
the jog controls and the buttons stay put.

The same goes for the main 3D view: pointing at a setting lights its part of the setup, and
**clicking a part of the setup** (the chuck, the tailstock, the stock, the tool, the collet
nut, a tenon) opens its section and puts you in its setting.

1. **Pick what to touch with.**
   - **Pin (with a clip)**, the simplest: a round pin in the collet (a dowel pin or a drill
     blank), the probe lead clipped to it, the chuck wired to the probe input. Round, it
     touches the same whichever way it's turned. Set its diameter (calipers) and its
     **Stickout** from the collet nut.
   - **3D probe**: its ball diameter, its body diameter, and how far the ball is below the
     body. They start as the common "V6 anti-roll" probe's (a 2 mm ball 26 mm below a body
     33 mm across); measure yours if it's another.
   - **Fluted bit (with a clip)**: the cutter itself. Standing still, a bit isn't round: what
     touches is whichever part sticks out furthest, and a flute facing the chuck lets it
     get closer before it touches. So it stops before each kind of touch for you to turn it
     by hand, cutting edges **front and back** for the sides, **left and right** for the
     top and the jaw face, then **Continue**. With 2 or 4 flutes the two sides are the
     same; a 1- or 3-flute bit can't find the middle (use a pin), but it can do X or Z.
   With a pin or a 3D probe, Z0 is for the pin or the probe: measure the cutter on the tool
   setter afterwards, or zero Z with the first tool. With the bit, Z0 is right for that bit.
2. **Measure the chuck body with calipers**: the round body behind the jaws, not the jaws.
   Type it in as **Chuck body diameter**. Z0 depends on it: 0.2 mm wrong puts Z0 0.1 mm off.
3. **Touch the sides**: how far below the top of the chuck the sides are touched. Empty, it
   goes half way down to the axis, or as far as the collet nut (or probe body) allows. Under
   it the dialog says the most it can be: the nut has to stay 2 mm clear of the chuck, so
   the further the tip sticks out, the lower it can go, down to the axis. Change it to miss
   a key hole.
4. **Turn A so a jaw points straight up and press Zero A.** That zeroes A where it is now.
   The X touch turns A back to 0 to touch the front of that jaw.
5. Jog the tip over the middle of the chuck body (within about 10 mm), a few mm (up to 20)
   above it, at a smooth spot along the body, clear of the key holes: the top and the sides
   are touched there.
6. The three X settings, all dimensioned in the side view:
   - **Jaw face in front by**: measure with a rule how far the front of the jaws is in
     front of (to the right of, +X) the tool where you started it.
   - **Clear of the jaw face by**: the gap left between the tip and where the jaw face
     should be when it comes down (10 mm unless you set it). Make it bigger if the first
     distance is a rough guess.
   - **Touch the jaw at**: how far below the top of the chuck body the tip touches the
     front of the jaw (measured the same way as **Touch the sides**). Empty, it's 3 mm
     above the stock, or higher if the collet nut would otherwise come down on the jaw.
     Under it the dialog says how far above the stock that is.
   - **Stock in the chuck** (on unless you turn it off): the tip comes down in front of
     the jaw, right over the stock. With this on it has to stop at least 2 mm above the
     stock: a touch that's lower is refused, and the stock and that dimension turn red in
     the picture. Turn it off only when the stock isn't in the chuck yet. If it finds
     something on the way down anyway, it stops there and says so.
   The dialog says exactly what X does: it lifts above the jaws, turns A to 0, moves X+ the
   first distance plus half the tip plus the gap, comes down, then feels back toward the
   jaw (up to the gap plus 20 mm). If it comes down on the jaw instead, it stops and says
   to set the distance bigger.
7. With **Connection test** on, touch the probe (or the clip to the chuck): the light goes
   green and **Start Probe** wakes up.
8. **Start Probe.** Each step shows as it runs; **Stop** (or the red stop in the jog pad)
   stops the machine (a soft reset).

**Half turn** (on by default) does the sides and the top again with the chuck turned 180°,
and averages the two. If the chuck doesn't run true, one pass is off one way and the other
pass the other way, so the average is the true axis. It also says how far off true the
chuck runs. It adds about 20 seconds.

When it's done it says what was set and what the chuck measured across. If that's well
off what you typed (you measured the jaws, say), it says so: check the diameter and probe
again. The rotary zero used for tool changes is updated too.

If it stops: it moves carefully, and stops rather than hits anything. Coming down on the
jaw means the jaw face is further away than you set. Touching something on the way down
beside the chuck means it didn't start over the middle. An **alarm** usually means it
didn't touch anything within reach (started too high, or the diameter is wrong), or the
probe was already touching when a move started. **Unlock**, raise Z, and go again.

### From a corner of the rotary

If the rotary comes off the table and goes back, measure once how far a corner you can
touch off is from the zero (**X, corner to the jaw face**; **Y, corner to the axis**;
**Z, corner to the axis**), then each time:

1. Zero X, Y and Z on that corner (touch block or 3D probe).
2. Press **Move zero to the rotary axis**. It shows where the work offset goes; **Move it**
   adds the offsets with `G10 L2`.

**Remember axis** and **Remember corner** measure the offsets for you. These are measured
numbers, separate from the headstock's keep-out box.

Then zero (or measure) Z with the first tool, as above.

---

## 7. Every job

1. **Open** a .stl, .step or .rcam. Check the **turning axis** (X, Y, Z buttons on the view),
   **Flip ends** (which end goes in the chuck), **Turn** (what faces up at A0) and **On axis**
   (what's centred on the axis).
2. **Stock & rotary:** shape and size; **Stock length** (the whole piece, the part in the
   jaws included) and **Clamping distance** (how far it goes into the jaws). The header
   shows the stock against what the part needs; red is too small. Either keep the part's
   size and click **Size the stock to fit the part** (bottom of Stock & rotary), then cut a
   blank that size, or keep your blank and click **Scale to fit the stock** (Part placement).
   **Deepest below the axis** is empty (auto) to start: the tool goes past the rotary axis
   only where a spot can't be reached any other way (a slot or hole through the part, the
   inside of a curl). Set it to 0 to keep the tool above the axis everywhere.
3. **Tenons:** a stub at each end that holds the part to the rest of the stock.
4. **Operations:** Corners (square stock), Roughing, Finishing, Indexed, Parting. Pick
   each tool from ncSender's Tool Library where you can. Indexed cleans up what the rotary
   passes couldn't reach; **Finish the whole side it faces** adds one even finishing pass
   over each side instead of only the spots, for a smoother result.
   - **One tool number is one tool.** A stickout or flute length changed for one operation
     goes to every operation with the same number. Two different stickouts for one number
     stop Generate with a button for each.
   - **Stickout** is how far the tool sticks out of the collet nut. Measure it: it decides
     what the nut and spindle can reach, and how far Z can go.
5. **Generate toolpaths.** Read every message:
   - **Fix** (red): Generate is off until it's sorted.
   - **Danger** (red): the program can hit something.
   - **Check** (amber): worth knowing before you run it.
6. **Simulate** plays the program against the stock and checks it: rapids into the stock,
   cuts below the part, the collet nut and spindle against the rotary.
7. **Load into ncSender** (or Save to File Manager, Download .nc).

---

## 8. Before the first carve: checklist

- [ ] `$376=1` (A is rotary).
- [ ] `$103` calibrated over 10 and 100 turns, and checked at the program's speed.
- [ ] `$113`/`$123` low enough that A doesn't skip.
- [ ] Soft limits off for A, or `$133` bigger than the program's A.
- [ ] **Which way A turns** checked with **Turn A +90°**; the A+ arrow in 3D points the
      same way the chuck turned.
- [ ] Rotary & spindle sizes measured; the 3D view looks like the machine.
- [ ] Zero: X0 at the jaw face, Y0 Z0 on the axis. Jog to X0 Y0 and lower Z near the
      stock's top to check by eye.
- [ ] If you probed the chuck: its body diameter measured with calipers (not the jaws), A
      zeroed with a jaw straight up, a pin (or a bit turned when it asked), and the first run
      watched with a hand on Stop.
- [ ] Z zeroed with the first tool in; generated after that; the header's *Z allows ...
      stickout* covers every tool.
- [ ] Stickouts measured on the actual tools; one stickout per tool number.
- [ ] Dust boot off, or its clearance checked with it down.
- [ ] Simulate shows no red.
- [ ] If a message says the tool goes past the rotary axis, look at those toolpaths in 3D
      and air-cut them: the tool reaches deep into the part there.
- [ ] **Air cut:** take the stock out of the chuck and run the program with the real zero:
      at least the start, the first tool change and the start of Indexed. The tool goes
      exactly where it will when cutting, only in air, and the chuck, jaws and tailstock
      are where they'll be. Watch A turn the right way and the tool go where the 3D view
      said. (Raising the Z zero instead pushes the program toward the top of the Z travel,
      and ncSender may refuse to load it.)
- [ ] Mark the chuck at A0. When the program finishes (or you stop it), send `G0 A0`
      (or the nearest whole turn) and check the mark lines up.
- [ ] Hand near feed hold for the first turns.

---

## 9. When something goes wrong

| What you see | Likely cause | What to do |
| --- | --- | --- |
| The outline along the part is right but the detail is smeared; roughing and finishing out of line; Indexed cuts in the wrong place late in the program | A steps per degree (`$103`) not exact, or A skipping steps at speed | Calibrate `$103` over 10 and 100 turns; check at speed; lower `$113`/`$123` if it skips |
| Everything at the wrong angles from the start, in an inch program | `$376` doesn't mark A as rotary, so grblHAL scales A by 25.4 | `$376=1`, or let Rotary CAM write the program in mm |
| Indexed cuts the opposite side (the neck instead of under the chin), 180° off | **A+90 turns the top of the stock** set the wrong way | Machine → **Turn A +90°**, answer which way it went, generate again |
| The part is a mirror image of the model | Same: A direction setting | As above |
| ncSender says the program goes out of Z bounds when loading | Z not zeroed on the axis with the tool that's in, or a tool longer than the Z travel allows | Zero Z on the axis with the first tool in, generate again; shorter stickouts |
| Generate is off with a Z travel message | A tool (or the tool in the spindle) sticks out more than the Z travel allows | Shorter stickouts; set **Stickout of the tool in the spindle** if the guess is wrong; check on the machine as the message says |
| Grbl alarm partway through, on A | Soft limits with A travel (`$133`) smaller than the program's A | Soft limits off for the job, or raise `$133` |
| Collet nut or spindle near the chuck or tailstock | Stickout too short for where it has to reach | The message says how much stickout would reach; or move the part further from the jaws |
| The dust boot hits the rotary | The lowered boot isn't in the collision checks | Turn dust collection off (Machine), or make room |
| Generate seems stuck | Indexed with a tapered ball is slow (it goes through OpenCAMLib): minutes per angle on a detailed part | The status clock keeps ticking every second while it works; **Cancel** stops it at once. If the clock stops, the page itself is stuck: reload it (settings and the part come back) |
| Generate takes a long time | Indexed with *Pick the angles for me* tries every 15° first | List your own angles; the progress bar shows which step and how long is left |
| Indexed looks stippled: lots of little spots, the tool jumping between them | Clean-up only goes where material is left, which on a detailed part is many small spots | Tick **Finish the whole side it faces** (Indexed): one even pass over each side, line by line; or raise **Ignore less than** to skip the thinnest spots |
| Probe the chuck stops with an alarm | It didn't touch anything within reach (started more than 20 mm above the chuck, or the diameter is wrong), or the probe was already touching when a move started | **Unlock**, raise Z, start a few mm above the middle of the chuck; check the wiring with the connection test |
| Probe the chuck says the chuck measured a different diameter | The diameter typed is the jaws, or the pin / ball / bit diameter is wrong, or a fluted bit wasn't turned when it asked | Measure the round body behind the jaws with calipers, check the tip's diameter, probe again (a pin is simplest) |

---

## 10. Where things are kept

- Settings are saved in ncSender as you go, so they're the same on every computer that
  opens it, and changes made on one computer are picked up by the others.
- **Save project** keeps the part, settings and toolpaths in one `.rcam` file.
- `README.md` describes every setting in detail; the
  [Releases page](https://github.com/stmoha/ncsender-plugin-rotary-cam/releases) lists what
  changed in each version and has every version's ZIP.
