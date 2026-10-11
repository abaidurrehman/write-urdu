import { launch, newSession, shot, box, step, summarize, BASE } from './lib.mjs';
import fs from 'node:fs';
const FX = process.cwd() + '/fixtures/';
const browser = await launch();
const { context, page, trace } = await newSession(browser, 'desktop');
const R = { persona: 'P6 advanced creator', device: 'desktop 1440x900' }; const t0 = Date.now();
const S = () => page.evaluate(() => { const s = WriteUrduCardStudioApp.getState(); return { text: s.text.value.slice(0, 30), tx: s.text.transform && [+s.text.transform.x.toFixed(3), +s.text.transform.y.toFixed(3), +s.text.transform.width.toFixed(3)], font: s.text.fontFamily, bg: s.background.type, ov: s.background.overlayOpacity, tpl: s.templateId, preset: s.presetId, img: s.background.imageAssetId }; });
await page.goto(BASE + '/urdu-card-studio'); await page.waitForTimeout(2500);
// panel scroll container?
R.panelScroll = await page.evaluate(() => { const p = document.querySelector('.card-studio-panel'); return { scrollH: p.scrollHeight, clientH: p.clientHeight, overflowY: getComputedStyle(p).overflowY }; });
step(trace, 'Desktop panel', R.panelScroll);
await page.locator('#cardText').scrollIntoViewIfNeeded();
await page.locator('[data-input-mode-option="direct"]').click();
await page.locator('#cardText').fill('اپنی پہچان خود بنائیں'); await page.waitForTimeout(500);
R.s1 = await S(); step(trace, 'Typed headline', R.s1);
// Undo text edit
await page.locator('[data-card-ui-action="undo"]').scrollIntoViewIfNeeded();
R.undoEnabledAfterTyping = await page.locator('[data-card-ui-action="undo"]').isEnabled();
step(trace, 'Undo enabled after typing in the text box?', { enabled: R.undoEnabledAfterTyping });
// Style step, upload
await page.locator('.card-studio-stepper [data-card-step="style"]').click(); await page.waitForTimeout(400);
R.quickStyleControls = await page.$$eval('.card-studio-panel [data-card-step-panel]:not([hidden]) label, .card-studio-panel [data-card-step-panel]:not([hidden]) h2', l => l.filter(x => x.offsetParent).map(x => x.innerText.trim().replace(/\s+/g, ' ').slice(0, 40)));
step(trace, 'Style step (Quick) visible labels', { labels: R.quickStyleControls });
await page.locator('#cardBackgroundType').selectOption('image'); await page.waitForTimeout(300);
await page.locator('#cardImage').setInputFiles(FX + 'broken.png'); await page.waitForTimeout(1200);
R.brokenUpload = await page.locator('[data-card-status]').innerText();
step(trace, 'Uploaded a broken .png', { status: R.brokenUpload });
await page.locator('#cardImage').setInputFiles(FX + 'synthetic-photo.jpg'); await page.waitForTimeout(1500);
R.s2 = await S(); step(trace, 'Uploaded photo', R.s2);
R.overlayVisibleQuick = await page.locator('#cardOverlay').isVisible();
await page.locator('[data-card-ui-mode="advanced"]').click(); await page.waitForTimeout(300);
R.advancedVisible = await page.$$eval('[data-card-advanced]', e => e.filter(x => !x.hidden).length);
await page.locator('#cardOverlay').fill('0.45'); await page.locator('#cardOverlay').dispatchEvent('change'); await page.waitForTimeout(300);
step(trace, 'Advanced mode: overlay set', { overlayVisibleInQuick: R.overlayVisibleQuick, advancedBlocks: R.advancedVisible });
// Drag text on canvas
const layer = page.locator('[data-card-interaction-layer]'); const lb = await layer.boundingBox();
const tr = await page.evaluate(() => WriteUrduCardStudioApp.getObjectRect('text')); const pre = await page.evaluate(() => WriteUrduCardStudioApp.getPreset());
const cx = lb.x + (tr.x + tr.width / 2) / pre.width * lb.width, cy = lb.y + (tr.y + tr.height / 2) / pre.height * lb.height;
await page.mouse.click(cx, cy); await page.waitForTimeout(300);
R.selection = await page.evaluate(() => WriteUrduCardStudioApp.getInteractionState());
await shot(page, 'P6-text-selected');
await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx, cy - 150, { steps: 12 }); await page.mouse.up(); await page.waitForTimeout(400);
R.s3 = await S(); step(trace, 'Selected and dragged text up 150px', { selection: R.selection, state: R.s3 });
await shot(page, 'P6-text-dragged');
await page.locator('[data-card-ui-action="undo"]').click(); await page.waitForTimeout(300); R.s4 = await S();
await page.locator('[data-card-ui-action="redo"]').click(); await page.waitForTimeout(300); R.s5 = await S();
step(trace, 'Undo then Redo', { afterUndo: R.s4.tx, afterRedo: R.s5.tx });
// Double click to edit on canvas
await page.mouse.dblclick(cx, cy - 150); await page.waitForTimeout(400);
R.canvasEditor = await page.locator('#cardCanvasEditor').isVisible();
await shot(page, 'P6-canvas-edit-mode');
await page.keyboard.press('Escape'); await page.waitForTimeout(200);
step(trace, 'Double-click opens on-canvas editor?', { visible: R.canvasEditor });
// Numeric controls
R.layoutX = await page.locator('#cardLayoutX').inputValue().catch(() => null);
// Change template mid-way
await page.locator('.card-studio-stepper [data-card-step="format"]').click(); await page.waitForTimeout(300);
R.templates = await page.$$eval('[data-card-template]', b => b.map(x => x.innerText.trim()));
await page.locator('[data-card-template="midnight"]').click(); await page.waitForTimeout(800);
R.s6 = await S(); step(trace, 'Changed template to Midnight after upload/drag', { templates: R.templates, state: R.s6 });
await shot(page, 'P6-after-template-change');
await page.locator('[data-card-ui-action="undo"]').click(); await page.waitForTimeout(500); R.s7 = await S();
step(trace, 'Undo template change', R.s7);
// mode switch back to quick preserves?
await page.locator('[data-card-ui-mode="quick"]').click(); R.s8 = await S();
// Large image
await page.locator('.card-studio-stepper [data-card-step="style"]').click();
const tl = Date.now(); await page.locator('#cardImage').setInputFiles(FX + 'synthetic-large.jpg'); await page.waitForTimeout(2500); R.largeMs = Date.now() - tl;
R.s9 = await S(); step(trace, 'Uploaded 6000x4500 JPG', { state: R.s9 });
await page.locator('.card-studio-stepper [data-card-step="export"]').click(); await page.waitForTimeout(300);
let dl = null; page.once('download', d => dl = d);
await page.locator('.card-studio-export-section [data-card-action="download"]').click(); await page.waitForTimeout(3000);
if (dl) { const p = '/home/user/write-urdu/docs/audits/urdu-card-studio-ux-2026-10-11/evidence/P6-photo-export.png'; await dl.saveAs(p); R.download = { name: dl.suggestedFilename(), bytes: fs.statSync(p).size }; }
step(trace, 'Exported', R.download);
await shot(page, 'P6-export-step-desktop');
// Reload: is uploaded image restored?
await page.reload(); await page.waitForTimeout(3000); R.afterReload = await S();
await shot(page, 'P6-after-reload');
step(trace, 'Reloaded page', R.afterReload);
R.elapsedMs = Date.now() - t0; R.trace = trace.steps; R.errors = summarize(trace);
fs.writeFileSync('p6.json', JSON.stringify(R, null, 1));
await browser.close();
