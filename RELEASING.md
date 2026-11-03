# Releasing Rotary CAM

Releases are nearly hands-off: Claude does the editing and testing and
hands you a test ZIP; once you've tried it in ncSender, Claude commits and
pushes, and you click one prefilled **Publish release** link. GitHub tests,
builds and attaches the release ZIP. Nothing to copy or paste.

Repo: https://github.com/stmoha/ncsender-plugin-rotary-cam

---

## 1. Ask for the change
In a Claude session with this repo attached (push access), describe the
bug or feature. Claude:
- works on a fresh clone of this repo — GitHub is always the source of truth
- edits `lib/*` (and `viewer/src` for the 3D view, rebuilt with
  `cd viewer && npm ci && node build.mjs`)
- runs the Node tests (the same ones the workflows run), the browser
  walkthroughs that touch the change (`test/e2e-*.cjs` against the stand-in
  ncSender in `test/harness`), and for toolpath changes the independent
  checks (`test/verify_rotary.py`, `test/run-node.js --check-index`,
  `test/sim-node.js`)
- bumps the version in `manifest.json` **and** `lib/cam-core.js`
  (`VERSION`) and rewrites `latest_release.md`: `## Rotary CAM X.Y.Z (beta)`,
  **New in X.Y.Z** first, then a **Since …** tally of the recent releases,
  since most people won't have installed every one

## 2. You test the ZIP first
- Claude runs `node build.mjs --test` and sends you
  `com.cncdocs.rotary-cam_vX.Y.Z-test.zip`
- ncSender → Settings → Plugins → Install Plugin → upload the ZIP, then
  hard-refresh (Ctrl+F5) and try the change. Air-cut anything that changes
  toolpaths.
- nothing is on GitHub yet; ask for fixes and you get a new test ZIP

## 3. Claude commits, you publish (after you say the ZIP is good)
- Claude commits to `main` and pushes; the **Tests** workflow runs on it
- Claude can't create tags or releases from its session (GitHub refuses
  them by policy), so it hands you a link to the **new release** page with
  the tag (`vX.Y.Z`) and title filled in — click **Publish release**
  (leave the notes box empty)
- publishing creates the tag, and the **Build and Release Plugin**
  workflow:
  - stops if the tag isn't `v` + the version in `manifest.json` (ncSender
    compares the two; a mismatch would show *Update available* for ever)
  - rebuilds the 3D view bundle and runs the Node tests
  - packages `com.cncdocs.rotary-cam_vX.Y.Z.zip` and attaches it to the
    release, and since the notes were left empty fills them in from
    `latest_release.md` (notes you type on the website are kept)
  - posts the release to Discord, if the webhook is set (see **Discord**)
- for the few minutes the build takes, the release page shows the latest
  commit message in place of the notes and has no ZIP yet; refresh once
  it's done
- Claude checks that the workflow went green and the ZIP is attached

## 4. You
- ncSender → Settings → Plugins shows **Update available** for Rotary CAM
  (it reads this repo's latest release through the manifest's `repository`
  field), and so does the badge in Rotary CAM's header. Update,
  hard-refresh (Ctrl+F5), check the version under the name.

## Beta releases
A release published with **Set as a pre-release** ticked only reaches
people on ncSender's beta update channel; GitHub's "latest" release (what
everyone else gets) skips it.

## Discord
The workflow can post every release to a Discord channel through a webhook.
- **The webhook lives only in the repository secret `DISCORD_WEBHOOK_URL_ROTARY_CAM`**
  (`DISCORD_WEBHOOK_URL` works too)
  (Settings → Secrets and variables → Actions). It is a password for posting
  in the channel, so it never goes in the repo, which is public. Whoever
  runs the server (siganberg) makes it: the channel's settings →
  Integrations → Webhooks.
- With no secret the post is skipped, and a failed post shows as a warning
  without failing the release.
- **Post a release by hand** (a re-post, or one from before the webhook):
  Actions → **Announce on Discord** → Run workflow; leave the tag empty for
  the latest release.
- The post carries the release's **New in** part, up to four `<img>`
  screenshots from the notes, and how to update. The script is
  `.github/scripts/announce-discord.sh`; `DRY_RUN=1` prints the message
  instead of sending it.

## Registry listing
Updates reach users straight from GitHub releases, so no registry change
is needed per release. The listing in `siganberg/ncSender.plugins-registry`
(name, description, version text) is cosmetic once it's there; when it's
worth refreshing, Claude pushes a branch to the `stmoha` fork and gives you
a prefilled "Create pull request" link.

---

## Doing it by hand (fallback)
1. Edit; `cd viewer && npm ci && node build.mjs` if you changed `viewer/src`
2. Bump the version in `manifest.json` and `lib/cam-core.js`, update
   `latest_release.md`
3. Commit and push to `main`
4. On github.com: Releases → Draft a new release → new tag `vX.Y.Z` →
   leave the notes empty → Publish. The workflow attaches the ZIP and the
   notes.

## If something looks wrong
- **No ZIP on the release:** Actions tab → the red run → its log. A tag
  that doesn't match `manifest.json` stops it at *Get plugin info*: delete
  the release and its tag, and publish again with the right tag.
- **Update installed but looks unchanged:** hard-refresh (Ctrl+F5) and
  check the version under the name — usually a cached page.
