import { launch, newSession, shot, box, step, summarize, BASE, EVID } from './lib.mjs';
import fs from 'node:fs';
const browser = await launch();
const { context, page, trace } = await newSession(browser, 'android');
await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
const R = { persona: 'P4 ready-made birthday/congrats', device: 'android 393x852' }; const t0 = Date.now();
await page.goto(BASE + '/urdu-cards'); await page.waitForTimeout(2500);
await shot(page, 'P4-urdu-cards-first-viewport');
R.firstViewport = await page.evaluate(() => [...document.querySelectorAll('main h1, main h2, main button, main a')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.top < innerHeight && b.bottom > 0; }).map(e => e.innerText.trim().replace(/\s+/g, ' ').slice(0, 50)));
R.filters = await page.$$eval('[data-urdu-cards-filter]', b => b.map(x => x.innerText.trim().replace(/\s+/g, ' ')));
R.search = await page.locator('main input[type="search"]').count();
R.cardCount = await page.locator('[data-category]').count();
step(trace, 'Opened /urdu-cards', { filters: R.filters, search: R.search, cards: R.cardCount });
R.birthdayFound = R.filters.some(f => /birthday|سالگرہ/i.test(f));
step(trace, 'Looks for Birthday filter', { found: R.birthdayFound });
const congrats = page.locator('[data-urdu-cards-filter="congratulations"]');
await congrats.scrollIntoViewIfNeeded(); R.congratsChip = await box(page, '[data-urdu-cards-filter="congratulations"]'); await congrats.tap(); await page.waitForTimeout(800);
R.visibleCards = await page.$$eval('[data-category]', c => c.filter(x => x.offsetParent).length);
await shot(page, 'P4-congratulations-filter');
const card = page.locator('[data-category="congratulations"]').first();
await card.scrollIntoViewIfNeeded();
R.cardActions = await card.evaluate(c => [...c.querySelectorAll('button, a')].map(b => `${(b.innerText || b.getAttribute('aria-label')).trim().replace(/\s+/g, ' ')} [${Object.keys(b.dataset).join(',')}]`));
R.cardText = await card.innerText();
step(trace, 'First Congratulations card', { actions: R.cardActions, text: R.cardText.slice(0, 120) });
await shot(page, 'P4-card-actions');
// Personalise: look for "Make this card yours"/Edit
const personal = card.locator('[data-urdu-cards-edit], [data-urdu-cards-start]').first();
R.personalLabel = await personal.innerText().catch(() => null);
await personal.tap(); await page.waitForTimeout(1200);
R.afterPersonalUrl = page.url();
R.dialog = await page.evaluate(() => { const d = document.querySelector('[data-urdu-cards-personalizer]'); return d ? { open: d.open ?? !d.hidden, text: d.innerText.replace(/\s+/g, ' ').slice(0, 700) } : null; });
await shot(page, 'P4-personalizer');
step(trace, 'Tapped ' + R.personalLabel, { url: R.afterPersonalUrl, dialog: R.dialog });
const ta = page.locator('[data-urdu-cards-personalizer-text]');
if (await ta.count()) {
  R.prefill = await ta.inputValue();
  await page.locator('[data-urdu-cards-personalizer] [data-input-mode-option="direct"]').tap().catch(() => {});
  await ta.fill('احمد بھائی، ' + R.prefill); await page.waitForTimeout(800);
  R.previewUpdates = await page.evaluate(() => { const d = document.querySelector('[data-urdu-cards-personalizer]'); return d.innerText.includes('احمد بھائی'); });
  await shot(page, 'P4-personalized-with-name');
  step(trace, 'Added recipient name', { prefill: R.prefill, previewShowsName: R.previewUpdates });
  R.personalizerButtons = await page.$$eval('[data-urdu-cards-personalizer] button, [data-urdu-cards-personalizer] a', b => b.filter(x => x.offsetParent).map(x => `${x.innerText.trim().replace(/\s+/g, ' ')} [${Object.keys(x.dataset).join(',')}]`));
  step(trace, 'Personalizer actions', { buttons: R.personalizerButtons });
  // Share from personalizer
  const share = page.locator('[data-urdu-cards-personalizer-share]');
  if (await share.count()) {
    R.shareLabel = await share.innerText();
    let dl = null; page.once('download', d => dl = d);
    await share.tap(); await page.waitForTimeout(2500);
    R.afterShare = { url: page.url(), dialog: await page.evaluate(() => [...document.querySelectorAll('dialog[open]')].map(d => d.innerText.replace(/\s+/g, ' ').slice(0, 500))), status: await page.locator('[data-urdu-cards-personalizer-status]').innerText().catch(() => ''), downloaded: !!dl, clip: await page.evaluate(() => navigator.clipboard.readText()).catch(() => '') };
    await shot(page, 'P4-after-share');
    step(trace, 'Tapped ' + R.shareLabel, R.afterShare);
  }
  // Advanced → Card Studio: does it carry design+text?
  const adv = page.locator('[data-urdu-cards-personalizer-advanced]');
  if (await adv.count() && await adv.isVisible()) {
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    if (!(await adv.isVisible())) { await personal.tap(); await page.waitForTimeout(800); await ta.fill('احمد بھائی، ' + R.prefill); }
    R.advLabel = await adv.innerText();
    await adv.tap(); await page.waitForLoadState('load'); await page.waitForTimeout(3500);
    R.studio = { url: page.url(), state: await page.evaluate(() => { const a = window.WriteUrduCardStudioApp; if (!a) return null; const s = a.getState(); return { text: s.text.value, bg: s.background.type, preset: s.presetId }; }) };
    await page.locator('#cardCanvas').scrollIntoViewIfNeeded().catch(() => {}); await shot(page, 'P4-opened-in-card-studio');
    step(trace, 'Tapped ' + R.advLabel, R.studio);
  }
}
R.elapsedMs = Date.now() - t0; R.trace = trace.steps; R.errors = summarize(trace);
fs.writeFileSync(EVID + '/p4.json', JSON.stringify(R, null, 1));
await browser.close();
