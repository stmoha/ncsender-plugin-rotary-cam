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
- **Install each test ZIP for him, but ask first.** The CNC may be busy with another
  job, so ask him whether it's clear and wait for his yes every time. Then install it
  into his ncSender at `http://ncsender:8090` (the shop machine, 192.168.1.35), the
  same way Install Plugin does:
  `curl -F "plugin=@dist/com.cncdocs.rotary-cam_vX.Y.Z-test.zip" http://ncsender:8090/api/plugins/install`,
  then check the build tag it serves:
  `curl -s "http://ncsender:8090/api/plugins/com.cncdocs.rotary-cam/icon?file=lib/rotary-ui.js" | grep -o "var BUILD = '[^']*'"`.
  He still presses Ctrl+F5 in ncSender to load it. (`localhost:8090` on his PC is a
  different ncSender, a debug build from another session: not the one he tests on.)
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
- `lib/chuck-probe.js`: Probe the chuck (the touches and the maths; the dialog is in
  rotary-ui.js). Tested against `test/harness/probe-machine.cjs`, a pretend rotary that
  also answers the harness's `/api/probe/start`.
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
- Some old browser tests fail on `main` too and aren't from new work: `e2e-3d`, `e2e-v10`,
  `e2e-v16`, `e2e-v18` (and one check in `e2e-v11`). Compare with the last commit before
  chasing them.
- The probe dialog's picture (`probePic` in rotary-ui.js): every dimension and part has
  `data-h` (the setting it goes to on a click); the tools have `data-t` and a `ph-` class
  for the part of the run. `test/e2e-v26.cjs` reads sizes back from it.
- The part and its toolpaths are shared between computers through ncSender: a project
  file at `.rotary-cam/last-job.rcam.b64` in its G-code folder (hidden: the File Manager
  skips names that start with a dot) and `session` beside `job` in the plugin settings
  (`touchSession`, `publishSession`, `noteSession` in rotary-ui.js; `test/e2e-v28.cjs`).
  Anything that writes the settings must send `session` along, or it's lost.
- Finishing has two patterns (`finish.pattern`): the map's columns are `plan.finDx` apart
  for lines, one per turn for the spiral. Read them with `core.finColX` / `finColAt`.
- The CI tests are in `.github/workflows/tests.yml`. Before a test ZIP, run them
  plus the e2e tests that touch what changed.
