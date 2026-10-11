import { launch, newSession, shot, box, step, summarize, BASE } from './lib.mjs';
import fs from 'node:fs';
const EV='/home/user/write-urdu/docs/audits/urdu-card-studio-ux-2026-10-11/evidence/';
const browser = await launch();
const { context, page, trace } = await newSession(browser, 'iphone');
const R = { persona: 'P2 Poetry → Instagram', device: 'iphone 390x844' };
const t0 = Date.now();
await page.goto(BASE + '/urdu-instagram-post-maker'); await page.waitForTimeout(3000);
R.url = page.url();
R.h1 = await page.locator('h1').first().innerText();
R.preset = await page.evaluate(() => { const s = WriteUrduCardStudioApp.getState(); return { preset: s.presetId, font: s.text.fontFamily, value: s.text.value, social: s.socialMode }; });
R.textareaTop = (await box(page, '#cardText')).top; R.canvasTop = (await box(page, '#cardCanvas')).top;
step(trace, 'Opened Instagram maker', { url: R.url, h1: R.h1, preset: R.preset, textareaTop: R.textareaTop, canvasTop: R.canvasTop });
await shot(page, 'P2-instagram-maker-first-viewport');
await page.locator('[data-input-mode-option="direct"]').scrollIntoViewIfNeeded();
await page.locator('[data-input-mode-option="direct"]').tap();
await page.locator('#cardText').fill('');
await page.locator('#cardText').tap();
await page.keyboard.insertText('دل ناامید تو نہیں ناکام ہی تو ہے\nلمبی ہے غم کی شام مگر شام ہی تو ہے');
await page.waitForTimeout(800);
// author field: type, then check if it renders without ticking the box
R.igAttributionVisible = await page.locator('#cardAttribution').isVisible();
R.igPublishButton = await page.locator('[data-card-action="publish"], [data-wu-share-step-publish]').count();
R.igFontVisible = await page.locator('#cardFont').isVisible().catch(()=>false);
R.igControls = await page.evaluate(() => [...document.querySelectorAll('[data-card-studio] button, [data-card-studio] select, [data-card-studio] input')].filter(e => e.offsetParent).map(e => (e.innerText||e.id||e.type).trim().slice(0,30)));
step(trace, 'Instagram maker: looks for poet-name field / publish / font', { attributionVisible: R.igAttributionVisible, publishButtons: R.igPublishButton, fontVisible: R.igFontVisible });
await page.locator('#cardCanvas').scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
await shot(page, 'P2-instagram-maker-couplet-default');
R.igState = await page.evaluate(() => { const s = WriteUrduCardStudioApp.getState(); return { font: s.text.fontFamily, preset: s.presetId, size: s.text.fontSize }; });
let dl0=null; page.once('download', d => dl0 = d);
await page.locator('[data-card-action="download"]').first().scrollIntoViewIfNeeded();
await page.locator('[data-card-action="download"]').first().tap(); await page.waitForTimeout(3000);
if (dl0) { await dl0.saveAs(EV+'P2-instagram-maker-download.png'); R.igDownload = { name: dl0.suggestedFilename(), bytes: fs.statSync(EV+'P2-instagram-maker-download.png').size }; }
step(trace, 'Downloaded from Instagram maker', { state: R.igState, dl: R.igDownload });
// Move to full Card Studio for the poet name (via the page's own link)
await page.locator('a[href="/urdu-card-studio"]').last().scrollIntoViewIfNeeded();
await page.locator('a[href="/urdu-card-studio"]').last().tap(); await page.waitForTimeout(3000);
R.studioCarriedText = await page.evaluate(() => WriteUrduCardStudioApp.getState().text.value);
step(trace, 'Followed "Open the full Urdu Card Studio" link; was the couplet carried over?', { value: R.studioCarriedText });
await page.locator('#cardText').scrollIntoViewIfNeeded();
await page.locator('[data-input-mode-option="direct"]').tap();
await page.locator('#cardText').fill('دل ناامید تو نہیں ناکام ہی تو ہے\nلمبی ہے غم کی شام مگر شام ہی تو ہے');
await page.locator('#cardAttribution').fill('فیض احمد فیض');
await page.waitForTimeout(600);
R.attrEnabledAfterTyping = await page.evaluate(() => WriteUrduCardStudioApp.getState().attribution.enabled);
step(trace, 'Typed poet name in Card Studio', { attributionShownWithoutCheckbox: R.attrEnabledAfterTyping });
await page.locator('[data-card-mobile-stepbar] [data-card-step="format"]').tap(); await page.waitForTimeout(400);
await page.locator('#cardPreset').scrollIntoViewIfNeeded();
R.presetOptions = await page.$$eval('#cardPreset option', o => o.map(x => x.value + ':' + x.textContent));
await page.locator('#cardPreset').selectOption('portrait'); await page.waitForTimeout(500);
// Font discoverability: in Quick mode where is the font control?
R.fontVisibleOnContentStep = (await box(page, '#cardFont')).visible;
step(trace, 'Font control visible on Content step?', { visible: R.fontVisibleOnContentStep });
await page.locator('[data-card-mobile-stepbar] [data-card-step="style"]').tap();
await page.waitForTimeout(600);
R.afterStyleTap = { scrollY: await page.evaluate(() => scrollY), font: await box(page, '#cardFont') };
step(trace, 'Tapped Style step', R.afterStyleTap);
R.fontOptions = await page.$$eval('#cardFont option', o => o.map(x => x.textContent));
await shot(page, 'P2-style-step');
await page.locator('[data-card-built-in-library] [data-card-background-filter="poetry"]').scrollIntoViewIfNeeded().catch(()=>{});
const poetryChip = page.locator('[data-card-background-filter="poetry"]');
R.poetryChipVisible = await poetryChip.isVisible();
if (R.poetryChipVisible) { await poetryChip.tap(); await page.waitForTimeout(400); }
R.poetryTiles = await page.$$eval('[data-card-built-in-background]', b => b.filter(x => !x.hidden).map(x => x.dataset.cardBuiltInBackground));
step(trace, 'Poetry filter', { chipVisible: R.poetryChipVisible, tiles: R.poetryTiles });
if (R.poetryTiles.length) { const id = R.poetryTiles[0]; await page.locator(`[data-card-built-in-background="${id}"]`).tap(); await page.waitForTimeout(2200); }
await page.locator('[data-card-field="attribution.enabled"]').scrollIntoViewIfNeeded().catch(()=>{});
const cb = page.locator('[data-card-field="attribution.enabled"]');
if (!(await cb.isVisible())) { await page.locator('[data-card-mobile-stepbar] [data-card-step="content"]').tap(); await page.waitForTimeout(300); }
await cb.scrollIntoViewIfNeeded(); await cb.check(); await page.waitForTimeout(800);
R.state = await page.evaluate(() => { const s = WriteUrduCardStudioApp.getState(); return { font: s.text.fontFamily, size: s.text.fontSize, lh: s.text.lineHeight, align: s.text.align, preset: s.presetId, bg: s.background.type, attr: s.attribution }; });
R.layouts = await page.evaluate(() => { const l = WriteUrduCardStudioApp.getLayouts(); return JSON.stringify(l).slice(0, 600); });
step(trace, 'After poetry background + attribution', R.state);
R.safeWarning = await page.locator('[data-social-safe-warning]').evaluate(e => ({ hidden: e.hidden, text: e.textContent }));
await page.locator('#cardCanvas').scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
await shot(page, 'P2-poetry-preview');
// Export
await page.locator('[data-card-mobile-stepbar] [data-card-step="export"]').tap(); await page.waitForTimeout(500);
R.exportStep = { scrollY: await page.evaluate(() => scrollY), social: await box(page, '.social-maker-controls'), stepPublish: await box(page, '[data-wu-share-step-publish]') };
await page.locator('.card-studio-export-section').scrollIntoViewIfNeeded();
await shot(page, 'P2-export-step');
R.exportCopy = (await page.locator('.card-studio-export-section').innerText()).replace(/\s+/g, ' ').slice(0, 900);
step(trace, 'Export step', { exportStep: R.exportStep });
let dl=null; page.once('download', d => dl = d);
await page.locator('.card-studio-export-section [data-card-action="download"]').scrollIntoViewIfNeeded(); await page.locator('.card-studio-export-section [data-card-action="download"]').tap(); await page.waitForTimeout(3000);
if (dl) { await dl.saveAs(EV+'P2-instagram-poetry.png'); R.download = { name: dl.suggestedFilename(), bytes: fs.statSync(EV+'P2-instagram-poetry.png').size }; }
step(trace, 'Downloaded', R.download);
// copy caption
await context.grantPermissions(['clipboard-read','clipboard-write']);
await page.locator('[data-social-caption]').tap().catch(()=>{}); await page.waitForTimeout(400);
R.captionStatus = await page.locator('[data-card-status]').innerText();
R.caption = await page.evaluate(() => navigator.clipboard.readText()).catch(e => String(e));
step(trace, 'Copy caption', { status: R.captionStatus, caption: R.caption });
R.elapsedMs = Date.now() - t0; R.trace = trace.steps; R.errors = summarize(trace);
fs.writeFileSync('p2.json', JSON.stringify(R, null, 1));
await browser.close();
