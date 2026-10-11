import { launch, newSession, shot, box, step, summarize, BASE } from './lib.mjs';
import fs from 'node:fs';
const browser = await launch();
const { context, page, trace } = await newSession(browser, 'android');
const R = { persona: 'P1 WhatsApp greeting', device: 'android 393x852' };
const t0 = Date.now();
await page.goto(BASE + '/urdu-card-studio'); await page.waitForTimeout(2500);
R.horizontalOverflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth }));
step(trace, 'Lands on Card Studio', R.horizontalOverflow);
// Does the Content step show the background collection (step panel sync)?
R.bgLibraryStep = await page.evaluate(() => { const l = document.querySelector('[data-card-built-in-library]'); return l ? { step: l.dataset.cardStep, hidden: l.hidden, activeStep: document.querySelector('[data-card-studio]').dataset.cardActiveStep } : null; });
step(trace, 'Background library vs active step', R.bgLibraryStep);
// Persona taps "1 Content" in the bottom bar expecting to reach the text
await page.locator('[data-card-mobile-stepbar] [data-card-step="content"]').tap();
await page.waitForTimeout(600);
R.afterContentTapScrollY = await page.evaluate(() => scrollY);
R.textareaViewportTop = await page.evaluate(() => Math.round(document.querySelector('#cardText').getBoundingClientRect().top));
step(trace, 'Tapped bottom bar "Content"', { scrollY: R.afterContentTapScrollY, textareaViewportTop: R.textareaViewportTop });
await shot(page, 'P1-after-tap-content-stepbar');
// She scrolls until she finds the box
await page.locator('#cardText').scrollIntoViewIfNeeded();
R.scrollToTextarea = await page.evaluate(() => scrollY);
await shot(page, 'P1-text-field-reached');
step(trace, 'Scrolled to text field', { scrollY: R.scrollToTextarea });
R.defaultValue = await page.locator('#cardText').inputValue();
// Try "Use sample text" looking for ready-made text
await page.locator('[data-card-content-action="sample"]').tap();
await page.waitForTimeout(400);
R.sampleValue = await page.locator('#cardText').inputValue();
step(trace, 'Tapped Use sample text', { value: R.sampleValue });
// Try downloading with sample text
await page.locator('.card-studio-top-actions [data-card-action="download"]').scrollIntoViewIfNeeded();
let dl = null; page.once('download', d => dl = d);
await page.locator('.card-studio-top-actions [data-card-action="download"]').tap();
await page.waitForTimeout(1500);
R.downloadWithSample = { downloaded: !!dl, status: await page.locator('[data-card-status]').innerText() };
R.downloadWithSampleStatusBox = await box(page, '[data-card-status]');
step(trace, 'Download with sample text', R.downloadWithSample);
await shot(page, 'P1-download-sample-text-feedback');
// She types her greeting. Roman first (common habit) - provider blocked in this environment
await page.locator('#cardText').scrollIntoViewIfNeeded();
await page.locator('#cardText').fill('');
await page.locator('#cardText').tap();
await page.keyboard.type('subah bakhair ', { delay: 60 });
await page.waitForTimeout(2500);
R.romanResult = await page.locator('#cardText').inputValue();
R.romanAlert = await page.evaluate(() => { const a = document.querySelector('[data-input-mode-alert], .input-mode-alert'); return a ? { hidden: a.hidden, text: a.innerText.trim().slice(0, 200) } : null; });
R.translitStatus = await page.locator('[data-card-transliteration-status]').innerText();
step(trace, 'Typed Roman "subah bakhair " (Google blocked in env)', { value: R.romanResult, alert: R.romanAlert, status: R.translitStatus });
await shot(page, 'P1-roman-typing-provider-unreachable');
// Switch to direct Urdu and type with an Urdu keyboard
await page.locator('[data-input-mode-option="direct"]').tap();
await page.locator('#cardText').fill('');
await page.locator('#cardText').tap();
await page.keyboard.insertText('صبح بخیر\nاللہ آپ کا دن خوشیوں سے بھر دے');
await page.waitForTimeout(800);
step(trace, 'Direct Urdu greeting typed', { value: await page.locator('#cardText').inputValue() });
// Find floral background: where is it?
const lib = page.locator('[data-card-built-in-library]');
R.libBox = await box(page, '[data-card-built-in-library]');
R.chips = await page.$$eval('[data-card-background-filter]', b => b.map(x => x.innerText.trim()));
R.tiles = await page.$$eval('[data-card-built-in-background]', b => b.length);
R.firstTileSize = await page.evaluate(() => { const b = document.querySelector('[data-card-built-in-background]').getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; });
step(trace, 'Background library inspected', { box: R.libBox, chips: R.chips, tiles: R.tiles, tile: R.firstTileSize });
await page.locator('[data-card-built-in-background="vintage-floral"]').scrollIntoViewIfNeeded();
await page.locator('[data-card-built-in-background="vintage-floral"]').tap();
await page.waitForTimeout(2000);
R.canvasVisibleWhenTappingBg = await page.evaluate(() => { const r = document.querySelector('#cardCanvas').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), inViewport: r.bottom > 0 && r.top < innerHeight }; });
step(trace, 'Tapped Vintage Floral; is the preview visible at that moment?', R.canvasVisibleWhenTappingBg);
await shot(page, 'P1-after-floral-tap-viewport');
await page.locator('#cardCanvas').scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await shot(page, 'P1-floral-preview');
R.state = await page.evaluate(() => { const s = WriteUrduCardStudioApp.getState(); return { bg: s.background.type, font: s.text.fontFamily, size: s.text.fontSize, color: s.text.color, preset: s.presetId, wm: s.watermark.enabled }; });
step(trace, 'Card state', R.state);
// Download
page.once('download', d => dl = d); dl = null;
await page.locator('.card-studio-top-actions [data-card-action="download"]').scrollIntoViewIfNeeded();
await page.locator('.card-studio-top-actions [data-card-action="download"]').tap();
await page.waitForTimeout(3000);
if (dl) { const p = '/home/user/write-urdu/docs/audits/urdu-card-studio-ux-2026-10-11/evidence/P1-downloaded-card.png'; await dl.saveAs(p); R.download = { name: dl.suggestedFilename(), bytes: fs.statSync(p).size }; }
R.downloadStatus = await page.locator('[data-card-status]').innerText();
R.downloadStatusInViewport = await page.evaluate(() => { const r = document.querySelector('[data-card-status]').getBoundingClientRect(); return r.top > 0 && r.bottom < innerHeight; });
step(trace, 'Download PNG', { download: R.download, status: R.downloadStatus, statusVisible: R.downloadStatusInViewport });
// Share image only (no Web Share in headless chromium)
R.hasShare = await page.evaluate(() => ({ share: !!navigator.share, canShare: !!navigator.canShare }));
dl = null; page.once('download', d => dl = d);
await page.locator('.card-studio-top-actions [data-card-action="share"]').tap();
await page.waitForTimeout(2500);
R.shareImageOnly = { downloadedInstead: !!dl, status: await page.locator('[data-card-status]').innerText(), webShare: R.hasShare };
step(trace, 'Share image only', R.shareImageOnly);
R.elapsedMs = Date.now() - t0;
R.trace = trace.steps; R.errors = summarize(trace);
fs.writeFileSync('p1.json', JSON.stringify(R, null, 1));
await context.close(); await browser.close();
