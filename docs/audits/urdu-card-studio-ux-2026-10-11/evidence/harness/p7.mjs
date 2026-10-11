import { chromium } from 'playwright';
import { DEVICES, shot, step, summarize, BASE, EVID, LAUNCH } from './lib.mjs';
import fs from 'node:fs';
const dir = EVID + '/profile-p7'; fs.rmSync(dir, { recursive: true, force: true });
const R = { persona: 'P7 returning user', device: 'android 393x852 (persistent profile)' }; const trace = { steps: [], console: [], pageErrors: [], failed: [] };
const open = async () => { const c = await chromium.launchPersistentContext(dir, { ...LAUNCH, ...DEVICES.android, acceptDownloads: true }); const p = c.pages()[0] || await c.newPage(); p.on('dialog', async d => { trace.steps.push({ dialog: d.message() }); await d.accept(); }); p.on('pageerror', e => trace.pageErrors.push(String(e))); return [c, p]; };
const S = (p) => p.evaluate(() => { const s = WriteUrduCardStudioApp.getState(); return { id: s.id, text: s.text.value.slice(0, 40), bg: s.background.type, img: s.background.imageAssetId, preset: s.presetId }; });
// Week 0: make and publish a card
let [c, p] = await open();
await p.goto(BASE + '/urdu-card-studio'); await p.waitForTimeout(2500);
await p.locator('#cardText').scrollIntoViewIfNeeded(); await p.locator('[data-input-mode-option="direct"]').tap();
await p.locator('#cardText').fill('[TEST] پچھلے ہفتے کا کارڈ — امی کے لیے دعا'); await p.waitForTimeout(400);
await p.locator('[data-card-built-in-background="emerald-mughal"]').scrollIntoViewIfNeeded(); await p.locator('[data-card-built-in-background="emerald-mughal"]').tap(); await p.waitForTimeout(2000);
R.week0 = await S(p); step(trace, 'Week 0: created card with designer background', R.week0);
await p.locator('[data-card-action="publish"]').scrollIntoViewIfNeeded(); await p.locator('[data-card-action="publish"]').tap(); await p.waitForTimeout(500);
await p.locator('[data-wu-share-confirm]').tap(); await p.locator('[data-wu-share-url]').waitFor();
R.publishedUrl = await p.locator('[data-wu-share-url]').inputValue(); step(trace, 'Week 0: published', { url: R.publishedUrl });
await c.close();
// Week 1: returns directly
[c, p] = await open();
await p.goto(BASE + '/urdu-card-studio'); await p.waitForTimeout(3000);
R.week1Direct = await S(p);
R.resumeCue = await p.evaluate(() => [...document.querySelectorAll('[data-card-studio] *')].filter(e => e.children.length === 0 && /continue|resume|previous|saved|draft|recent|my cards|پچھل/i.test(e.textContent) && e.offsetParent).map(e => e.textContent.trim().slice(0, 80)).slice(0, 6));
R.manageLinksVisible = await p.locator('.wu-share-manage-trigger').isVisible();
await shot(p, 'P7-return-first-viewport');
step(trace, 'Week 1: opened Card Studio directly', { state: R.week1Direct, resumeCues: R.resumeCue, manageLinksVisible: R.manageLinksVisible });
await p.locator('.wu-share-manage-trigger').scrollIntoViewIfNeeded().catch(() => {}); await p.locator('.wu-share-manage-trigger').tap().catch(() => {}); await p.waitForTimeout(500);
R.manageDialog = await p.evaluate(() => { const d = document.querySelector('dialog[open]'); return d && d.innerText.replace(/\s+/g, ' ').slice(0, 300); });
await shot(p, 'P7-manage-published-links'); await p.keyboard.press('Escape');
step(trace, 'Opened "Manage published links"', { dialog: R.manageDialog });
// Goes via /urdu-cards and personalises another card (common re-entry), then back to Card Studio
await p.goto(BASE + '/urdu-cards'); await p.waitForTimeout(2000);
R.cardsReturnCue = await p.evaluate(() => [...document.querySelectorAll('main *')].filter(e => e.children.length === 0 && /continue|recent|last|again|favou?rite|پچھل/i.test(e.textContent) && e.offsetParent).map(e => e.textContent.trim().slice(0, 80)).slice(0, 6));
step(trace, '/urdu-cards: any return cue?', { cues: R.cardsReturnCue });
const card = p.locator('[data-category="dua"]').first(); await card.scrollIntoViewIfNeeded(); await card.locator('[data-urdu-cards-edit]').tap(); await p.waitForTimeout(800);
await p.locator('[data-urdu-cards-personalizer-advanced]').scrollIntoViewIfNeeded(); await p.locator('[data-urdu-cards-personalizer-advanced]').tap(); await p.waitForLoadState('load'); await p.waitForTimeout(3000);
R.afterHandoff = await S(p); step(trace, 'Opened a different ready-made card in Card Studio', R.afterHandoff);
await p.locator('#cardText').scrollIntoViewIfNeeded(); await p.locator('[data-input-mode-option="direct"]').tap(); await p.locator('#cardText').fill('[TEST] نیا کارڈ'); await p.waitForTimeout(1500);
await p.goto(BASE + '/urdu-card-studio'); await p.waitForTimeout(3000);
R.week0Recoverable = await S(p); step(trace, 'Reopened Card Studio: which project loads? Is week-0 card reachable?', R.week0Recoverable);
R.idbProjects = await p.evaluate(() => new Promise(res => { const r = indexedDB.open('writeUrduCardStudio'); r.onsuccess = () => { const tx = r.result.transaction('projects'); const q = tx.objectStore('projects').getAll(); q.onsuccess = () => res(q.result.map(x => ({ id: x.id, scope: x.scope, text: (x.text && x.text.value || '').slice(0, 30), updatedAt: x.updatedAt }))); }; r.onerror = () => res('err'); }));
step(trace, 'Projects stored in IndexedDB (invisible to user)', { projects: R.idbProjects });
// Edit this design from the published link
await p.goto(R.publishedUrl); await p.waitForTimeout(1500); await shot(p, "P7-own-published-page");
R.editDesignBtn = await p.locator('[data-share-edit]').count();
if (R.editDesignBtn) { await p.locator('[data-share-edit]').tap(); await p.waitForLoadState('load'); await p.waitForTimeout(3500); R.afterEditDesign = { url: p.url(), state: await S(p).catch(() => null) }; await p.locator('#cardCanvas').scrollIntoViewIfNeeded().catch(() => {}); await shot(p, 'P7-edit-this-design-result'); }
step(trace, 'From own published link: "Edit this design"', R.afterEditDesign);
R.urlNow = p.url(); await p.goto(BASE + '/urdu-card-studio'); await p.waitForTimeout(2500);
// Reset behaviour
await p.locator('[data-card-action="reset"]').scrollIntoViewIfNeeded(); await p.locator('[data-card-action="reset"]').tap(); await p.waitForTimeout(800);
R.afterReset = await S(p); R.undoAfterReset = await p.locator('[data-card-ui-action="undo"]').isEnabled();
step(trace, 'Reset (confirm accepted)', { state: R.afterReset, undoAvailable: R.undoAfterReset });
R.trace = trace.steps; R.pageErrors = trace.pageErrors;
fs.writeFileSync(EVID + '/p7.json', JSON.stringify(R, null, 1)); await c.close();
