import { launch, newSession, shot, box, step, summarize, BASE } from './lib.mjs';
import fs from 'node:fs';
const browser = await launch(); const R = {};
{ // J04 Gallery
  const { context, page, trace } = await newSession(browser, 'android');
  await page.goto(BASE + '/urdu-card-gallery'); await page.waitForTimeout(2500);
  await shot(page, 'J04-gallery-first-viewport');
  R.g_input = await box(page, '[data-card-gallery-input]'); R.g_count = await page.locator('[data-card-gallery-count]').innerText().catch(() => '');
  R.g_inputTag = await page.$eval('[data-card-gallery-input]', e => e.tagName + ' ' + (e.getAttribute('dir') || ''));
  await page.locator('[data-card-gallery-input]').fill('صبح بخیر، آپ کا دن اچھا گزرے'); await page.waitForTimeout(1200);
  R.g_tiles = await page.$$eval('[data-card-gallery-grid] > *', t => t.length);
  R.g_tileActions = await page.$$eval('[data-card-gallery-grid] > *:first-child a, [data-card-gallery-grid] > *:first-child button', b => b.map(x => x.innerText.trim().replace(/\s+/g, ' ')));
  R.g_tileBox = await page.evaluate(() => { const r = document.querySelector('[data-card-gallery-grid] > *').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  R.g_previewShowsText = await page.evaluate(() => document.querySelector('[data-card-gallery-grid]').innerText.includes('صبح بخیر'));
  await page.locator('[data-card-gallery-grid]').scrollIntoViewIfNeeded(); await shot(page, 'J04-gallery-with-text');
  step(trace, 'Gallery: typed once, compared designs', { input: R.g_input, count: R.g_count, tiles: R.g_tiles, tile: R.g_tileBox, actions: R.g_tileActions, previewShowsText: R.g_previewShowsText });
  const first = page.locator('[data-card-gallery-grid] > *').first().locator('a, button').first();
  await first.tap(); await page.waitForLoadState('load'); await page.waitForTimeout(3000);
  R.g_open = { url: page.url(), state: await page.evaluate(() => window.WriteUrduCardStudioApp && (s => ({ text: s.text.value, bg: s.background.type }))(WriteUrduCardStudioApp.getState())) };
  step(trace, 'Chose first design', R.g_open);
  R.g_trace = trace.steps; R.g_errors = summarize(trace); await context.close();
}
{ // J07 WhatsApp Status
  const { context, page, trace } = await newSession(browser, 'android-small');
  await page.goto(BASE + '/urdu-whatsapp-status-maker'); await page.waitForTimeout(2500);
  await shot(page, 'J07-status-maker-first-viewport');
  R.w_h1 = await page.locator('h1').first().innerText();
  R.w_layout = { textarea: await box(page, '#cardText'), canvas: await box(page, '#cardCanvas'), discovery: await box(page, '[data-whatsapp-status-discovery]'), download: await box(page, '[data-card-action="download"]') , publish: await page.locator('[data-card-action="publish"]').count() };
  R.w_state = await page.evaluate(() => { const s = WriteUrduCardStudioApp.getState(); return { preset: s.presetId, font: s.text.fontFamily, text: s.text.value }; });
  step(trace, 'Opened WhatsApp Status maker', { h1: R.w_h1, layout: R.w_layout, state: R.w_state });
  await page.locator('#cardText').scrollIntoViewIfNeeded(); await page.locator('[data-input-mode-option="direct"]').tap().catch(() => {});
  await page.locator('#cardText').fill('صبح بخیر\nاللہ آپ کو ہمیشہ خوش رکھے'); await page.waitForTimeout(600);
  R.w_guide = await page.locator('[data-social-safe-warning]').evaluate(e => ({ hidden: e.hidden, text: e.textContent })).catch(() => null);
  let dl = null; page.once('download', d => dl = d);
  await page.locator('[data-card-action="download"]').first().scrollIntoViewIfNeeded(); await page.locator('[data-card-action="download"]').first().tap(); await page.waitForTimeout(3000);
  if (dl) { const p = '/home/user/write-urdu/docs/audits/urdu-card-studio-ux-2026-10-11/evidence/J07-whatsapp-status.png'; await dl.saveAs(p); R.w_download = { name: dl.suggestedFilename(), bytes: fs.statSync(p).size }; }
  R.w_guideInExport = await page.evaluate(() => 'checked by pixel later');
  step(trace, 'Downloaded status image', R.w_download);
  R.w_trace = trace.steps; R.w_errors = summarize(trace); await context.close();
}
fs.writeFileSync('j04j07.json', JSON.stringify(R, null, 1)); await browser.close();
