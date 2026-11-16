// Helpers for the browser tests since 0.13.0: the side panel's groups (Setups, Part,
// Settings) and the setup's strategies, driven through the page as a person would.
const sel = (s) => '#rcam-root ' + s;

// open every group, so any section or field can be reached
async function openGroups(page) {
  for (const g of ['setups', 'part', 'settings']) {
    const shut = await page.$eval(sel(`.rc-grp[data-grp=${g}]`), (el) => !el.classList.contains('open')).catch(() => false);
    if (shut) { await page.click(sel(`[data-grp-toggle=${g}]`)); await page.waitForTimeout(150); }
  }
}
// the strategies of the setup on show: [{ id, type, mode, slot }]
function strats(page) {
  return page.evaluate(() => { const S = window.RotaryCam.__state, c = window.RotaryCamCore; return c.curSetup(S.job).list.map((s) => ({ id: s.id, type: s.type, mode: s.mode, slot: c.slotOf(s) })); });
}
// adds a strategy from the menu (and opens it); returns its id
async function addStrat(page, type) {
  await openGroups(page);
  const before = (await strats(page)).map((s) => s.id);
  await page.click(sel('[data-strat-addmenu]'));
  await page.waitForTimeout(150);
  await page.click(sel(`[data-strat-add=${type}]`));
  await page.waitForTimeout(400);
  return (await strats(page)).map((s) => s.id).find((id) => before.indexOf(id) < 0);
}
// opens the first strategy of a kind (corners, rough, finish, index, parting, or finish2: the
// first finishing set to rest), adding one if there's none; returns its id
async function openStrat(page, kind) {
  await openGroups(page);
  let st = (await strats(page)).find((s) => (kind === 'finish2' ? s.slot === 'finish2' : s.type === kind && s.slot === kind));
  if (!st) {
    const id = await addStrat(page, kind === 'finish2' ? 'finish' : kind);
    st = (await strats(page)).find((s) => s.id === id);
    if (kind === 'finish2' && st.mode !== 'rest') { await openById(page, id); await page.click(sel('[data-strat-mode=rest]')); await page.waitForTimeout(300); }
  }
  await openById(page, st.id);
  return st.id;
}
async function openById(page, id) {
  const open = await page.evaluate(() => window.RotaryCam.__state.ui.strat);
  if (open !== id) { await page.click(sel(`[data-strat-open="${id}"]`)); await page.waitForTimeout(250); }
}
// removes every strategy of a kind
async function dropStrat(page, type) {
  await openGroups(page);
  for (const s of await strats(page)) if (s.type === type) { await page.click(sel(`[data-strat-del="${s.id}"]`)); await page.waitForTimeout(250); }
}
module.exports = { openGroups, strats, addStrat, openStrat, openById, dropStrat };
