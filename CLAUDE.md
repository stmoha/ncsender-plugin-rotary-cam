# Rotary CAM: notes for Claude

Simultaneous 4th-axis CAM as an ncSender plugin (`com.cncdocs.rotary-cam`), made with
Stefan (GitHub `stmoha`). What it does and every setting: `README.md`. Setup and
first-carve checks: `MANUAL.md`. How to release: `RELEASING.md`. Build and test
commands: README › Development.

## How Stefan likes to work
- **A test ZIP before anything reaches `main`.** Work on a branch, run the tests,
  `node build.mjs --test`, send him `dist/com.cncdocs.rotary-cam_vX.Y.Z-test.zip`.
  He installs it in ncSender (Settings › Plugins › Install Plugin, then Ctrl+F5).
  Merge to `main` (fast-forward) only after he says it's good.
- **Automate everything you can.** He clicks only what this session can't do:
  Publish release (prefilled link), registry pull requests (prefilled link), repo
  settings and secrets.
- **Release notes tally.** `latest_release.md`: `## Rotary CAM X.Y.Z (beta)`, the
  short intro paragraph, **New in X.Y.Z**, then **Since 0.2.0** with one line per
  release. Most people skip versions, so they need the roll-up.
- **Plain words** in the UI, warnings, docs and notes: say what to do and why, no
  jargon a hobbyist wouldn't use.
- He tests on his own machine (an "Altfinity", grblHAL, rotary A along X). Toolpath
  changes get an air cut first; say so when a change touches toolpaths.
- **Running ncSender on his laptop** (Desktop Commander device `CAST-stefan_L24`, Windows):
  always start a stand-in controller with it, so ncSender connects and plugins and settings
  open. Both live in `stmoha/fake-grblhal`. Default is **`grblhal-sim/`**: the real grblHAL
  firmware (grblHAL/Simulator + `virtual-machine.patch`) built as a copy of his Altfinity
  from its Web Builder `job.ini` (`machines/stefan-altfinity.flags`): his settings, planner,
  rotary A, homing on virtual switches, a probe that touches 3 mm in. It keeps settings in
  `EEPROM.DAT` next to it, loaded with his live `$$` (`machines/stefan-altfinity.settings`,
  via `load_settings.py`; load, then restart the simulator before ncSender connects). The Python `fake_grblhal_server.py` is the quick alternative.
  After changing either, run its test (`grblhal-sim/test_sim.py`, `test_fake_grblhal.py`).
  `test/fake-grblhal/start-ncsender-test.ps1` here fetches the latest and starts it on
  127.0.0.1:8000 plus the patched ncSender source build and the browser; `-FakeOnly` for
  his installed ncSender, `-Controller fake` for the Python one, `-Speed 10` for 10x.
  His machine: home back-right, `a_sign = -1`, imperial UI, RapidChange ATC (8 tools), TLS,
  AutoZero touch probe. On the laptop the scripts live in `C:\Users\stefa\ncsender-a-preview\`.
  Installed and source ncSender share `%APPDATA%\ncSender`: back it up before running a
  source build, and only one can run at a time (both use port 8090).

## Releasing (details in RELEASING.md)
- Bump `manifest.json` `version` **and** `lib/cam-core.js` `VERSION` (the Tests
  workflow checks they agree), and rewrite `latest_release.md`.
- This session can't create tags, releases, repos or Actions secrets, and can't
  force-push. GitHub's GraphQL API is blocked too: use `gh api repos/...` (REST),
  not `gh release view` or `gh workflow run`.
- Publish link: `https://github.com/stmoha/ncsender-plugin-rotary-cam/releases/new?tag=vX.Y.Z&target=main&title=Rotary%20CAM%20vX.Y.Z`.
  Tell him to leave the notes empty and click once. The workflow checks the tag,
  runs the tests, attaches the ZIP, fills the notes and posts to Discord. Then
  check the run: `gh run list -R stmoha/ncsender-plugin-rotary-cam --workflow release-build.yml`.
- Discord: the webhook is the Actions secret `DISCORD_WEBHOOK_URL_ROTARY_CAM`.
  Never write it into the repo, which is public. To post again:
  `gh api -X POST repos/stmoha/ncsender-plugin-rotary-cam/actions/workflows/announce-discord.yml/dispatches -f ref=main -f 'inputs[tag]=vX.Y.Z'`.
- Registry (`siganberg/ncSender.plugins-registry`): listed since 0.11.1. Updates
  come from GitHub releases, so the listing's version text is cosmetic: refresh it
  now and then on a branch of the `stmoha` fork, with a prefilled
  compare link.
- Commit as `Claude <noreply@anthropic.com>` (`git config user.name/user.email`),
  not as Stefan: other identities show as Unverified on GitHub.

## Code map
- `lib/cam-core.js`: job defaults, checks, planning, indexed passes, the post.
  Runs in the browser and in Node.
- `lib/cam-worker.js`: drop-cutter work in workers (OpenCAMLib WASM `lib/ocl.js`).
- `lib/cam-sim.js`: stock simulation and what indexed passes should clean up.
- `lib/rotary-ui.js`: the whole plugin UI (fields, form, checks, generate, save).
- `viewer/src/viewer.js`: the 3D view. `cd viewer && npm ci && node build.mjs`
  writes `lib/rotary-viewer.js`, which is committed.
- `config.html` + `manifest.json`: the plugin entry. `build.mjs` packages it.

## Machine model
Rotary axis along X with the chuck at −X. X0 is at the jaw face; Y0 Z0 are on the
axis. grblHAL: `$376` bit 0 makes A rotary (if A isn't rotary, inch programs scale
A by 25.4, so those are posted in mm), and `$103` is A's steps per degree. Which way
A turns is the job's `a_sign`, set under Machine › Which way A turns.

## Gotchas
- `node build.mjs` stamps the build tag into `config.html`, `lib/rotary-ui.js` and
  `lib/rotary-viewer.js`. Afterwards run `git checkout -- config.html lib/rotary-ui.js lib/rotary-viewer.js`.
  **Commit first**: that checkout also throws away uncommitted edits to those files.
- Browser tests (`test/e2e-*.cjs`) use the stand-in ncSender in `test/harness`. It
  starts as someone who has accepted the fine print; `POST /__test/settings {}`
  makes it a first open. When reloading a `#dark` URL, go to `about:blank` first.
- On landscape windows 1200 px or wider, the checks sit in a column right of the
  view and notices float in `.rc-toasts`. Tests that look for a notice read both
  `.rc-toasts` and `.rc-msgs`.
- A field's change fires on blur. A click on a message's button right after typing
  can be lost if the list rebuilds, so blur the field first in tests.
- The CI tests are in `.github/workflows/tests.yml`. Before a test ZIP, run them
  plus the e2e tests that touch what changed.
