const { test, expect } = require('@playwright/test');

// WU-UXR-002 Slice G (CARD-UX-018, 019, 020): every edit can be undone, Reset can be undone, a template
// keeps the person's own photo, and text on an uploaded photo starts readable.

async function openStudio(page) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, route => route.abort());
  page.on('dialog', dialog => { page.__sawDialog = dialog.message(); dialog.dismiss(); });
  await page.goto('/urdu-card-studio', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.WriteUrduCardStudioApp && window.WriteUrduCardStudioInteractionApi && window.WriteUrduCardStudioUi && window.WriteUrduCardStudioBackgroundLibrary), null, { timeout: 15000 });
  await page.waitForTimeout(300);
}

const state = page => page.evaluate(() => window.WriteUrduCardStudioApp.getState());
const historySize = page => page.evaluate(() => window.WriteUrduCardStudioInteractionApi.getHistoryState().size);
const undo = page => page.evaluate(() => window.WriteUrduCardStudioInteractionApi.undo());

// A flat-colour PNG made in the page, so no fixture file is needed.
async function solidPng(page, colour) {
  const base64 = await page.evaluate(fill => {
    const canvas = document.createElement('canvas');
    canvas.width = 120; canvas.height = 150;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = fill; ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png').split(',')[1];
  }, colour);
  return { name: 'photo.png', mimeType: 'image/png', buffer: Buffer.from(base64, 'base64') };
}

async function upload(page, colour) {
  await page.locator('#cardImage').setInputFiles(await solidPng(page, colour));
  await page.waitForFunction(() => window.WriteUrduCardStudioApp.getState().background.type === 'image', null, { timeout: 10000 });
  await page.waitForTimeout(400);
}

function luminance(hex) {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map(i => parseInt(value.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
function mix(hexA, hexB, amountOfB) {
  const a = hexA.replace('#', ''); const b = hexB.replace('#', '');
  return '#' + [0, 2, 4].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - amountOfB) + parseInt(b.slice(i, i + 2), 16) * amountOfB).toString(16).padStart(2, '0')).join('');
}
const contrast = (x, y) => { const [l1, l2] = [luminance(x), luminance(y)].sort((p, q) => q - p); return (l1 + 0.05) / (l2 + 0.05); };

test('typing is one undo step, not one per key', async ({ page }) => {
  await openStudio(page);
  await page.locator('[data-card-ui-mode="advanced"]').first().click().catch(() => {});
  await page.evaluate(() => window.WriteUrduCardStudioUi.setStep('content'));
  const before = (await state(page)).text.value;
  await page.locator('[data-input-mode-option="direct"]').first().click().catch(() => {});
  await page.locator('#cardText').fill('');
  await page.locator('#cardText').pressSequentially('سلام دوست', { delay: 30 });
  await page.locator('#cardText').blur();
  await expect.poll(() => historySize(page)).toBeGreaterThan(0);
  const size = await historySize(page);
  expect(size, 'one entry for the whole typed phrase (plus at most one for clearing)').toBeLessThanOrEqual(2);
  await expect(page.locator('[data-card-ui-action="undo"]').first()).toBeEnabled();
  while (await historySize(page)) await undo(page);
  expect((await state(page)).text.value).toBe(before);
});

test('a font change and a designer background are each one undo step', async ({ page }) => {
  await openStudio(page);
  await page.locator('#cardText').fill('محبت');
  await page.locator('#cardText').blur();
  await page.evaluate(() => window.WriteUrduCardStudioUi.setMode('advanced'));
  await page.evaluate(() => window.WriteUrduCardStudioUi.setStep('style'));
  const fontBefore = (await state(page)).text.fontFamily;
  const other = await page.locator('#cardFont option').evaluateAll((options, current) => options.map(o => o.value).find(v => v && v !== current), fontBefore);
  await page.locator('#cardFont').selectOption(other);
  await expect.poll(async () => (await state(page)).text.fontFamily).toBe(other);
  await undo(page);
  expect((await state(page)).text.fontFamily).toBe(fontBefore);

  const before = await state(page);
  const sizeBefore = await historySize(page);
  const result = await page.evaluate(() => window.WriteUrduCardStudioBackgroundLibrary.applyById('black-gold-classic'));
  expect(result.ok).toBe(true);
  await page.waitForFunction(() => window.WriteUrduCardStudioApp.getState().background.type === 'image');
  await page.waitForTimeout(400);
  expect(await historySize(page), 'the whole background apply is one entry').toBe(sizeBefore + 1);
  await undo(page);
  const after = await state(page);
  expect(after.background.type).toBe(before.background.type);
  expect(after.text.color).toBe(before.text.color);
  expect(after.background.overlayOpacity).toBe(before.background.overlayOpacity);
});

test('Reset asks nothing and can be undone, photo included', async ({ page }) => {
  await openStudio(page);
  await page.locator('#cardText').fill('یہ میرا کارڈ ہے');
  await page.locator('#cardText').blur();
  await upload(page, '#224466');
  const before = await state(page);
  await page.locator('[data-card-action="reset"]').first().click();
  expect(page.__sawDialog, 'no confirm() dialog').toBeUndefined();
  await expect.poll(async () => (await state(page)).text.value).not.toBe('یہ میرا کارڈ ہے');
  expect((await state(page)).background.type).not.toBe('image');
  await expect(page.locator('[data-card-status]')).toContainText('Card reset.');
  const undoReset = page.locator('[data-card-reset-undo]');
  await expect(undoReset).toBeVisible();
  await undoReset.click();
  const restored = await state(page);
  expect(restored.text.value).toBe('یہ میرا کارڈ ہے');
  expect(restored.background.type).toBe('image');
  expect(restored.background.imageAssetId).toBe(before.background.imageAssetId);
  // The photo itself is back on the canvas, not just its id.
  await expect.poll(() => page.evaluate(() => {
    const canvas = window.WriteUrduCardStudioApp.getCanvas();
    const [r, g, b] = canvas.getContext('2d').getImageData(4, 4, 1, 1).data;
    return b > r + 20;
  })).toBe(true);
});

test('undoing a second photo brings back the first one', async ({ page }) => {
  await openStudio(page);
  await page.locator('#cardText').fill('تصویر');
  await page.locator('#cardText').blur();
  await upload(page, '#1d6b2f');
  const first = (await state(page)).background.imageAssetId;
  await page.locator('#cardImage').setInputFiles(await solidPng(page, '#8a1f1f'));
  await expect.poll(async () => (await state(page)).background.imageAssetId).not.toBe(first);
  await page.waitForTimeout(400);
  await undo(page);
  expect((await state(page)).background.imageAssetId).toBe(first);
  await expect.poll(() => page.evaluate(() => {
    const [r, g] = window.WriteUrduCardStudioApp.getCanvas().getContext('2d').getImageData(4, 4, 1, 1).data;
    return g > r;
  })).toBe(true);
});

test('choosing a template keeps the uploaded photo, with a way to use the template background', async ({ page }) => {
  await openStudio(page);
  await page.locator('#cardText').fill('میری تصویر');
  await page.locator('#cardText').blur();
  await upload(page, '#335577');
  const assetId = (await state(page)).background.imageAssetId;
  await page.evaluate(() => document.querySelector('[data-card-template="midnight"]').click());
  const kept = await state(page);
  expect(kept.templateId).toBe('midnight');
  expect(kept.background.type).toBe('image');
  expect(kept.background.imageAssetId).toBe(assetId);
  await expect(page.locator('[data-card-status]')).toContainText('Your photo was kept.');
  const useTemplate = page.locator('[data-card-template-background]');
  await expect(useTemplate).toBeVisible();
  await useTemplate.click();
  expect((await state(page)).background.type).not.toBe('image');
  // And that, too, can be undone back to the photo.
  await undo(page);
  expect((await state(page)).background.type).toBe('image');
});

for (const [name, colour] of [['dark', '#141414'], ['bright', '#f2f2f2'], ['mid', '#7a7a7a']]) {
  test(`text on a ${name} photo starts readable`, async ({ page }) => {
    await openStudio(page);
    await page.locator('#cardText').fill('خوش آمدید');
    await page.locator('#cardText').blur();
    await upload(page, colour);
    const current = await state(page);
    const behind = mix(colour, current.background.overlayColor, current.background.overlayOpacity);
    expect(contrast(current.text.color, behind), `${current.text.color} on ${behind}`).toBeGreaterThanOrEqual(4.5);
  });
}

test('a text colour the person chose is kept when they upload a photo', async ({ page }) => {
  await openStudio(page);
  await page.locator('#cardText').fill('رنگ');
  await page.locator('#cardText').blur();
  await page.evaluate(() => window.WriteUrduCardStudioUi.setMode('advanced'));
  await page.evaluate(() => window.WriteUrduCardStudioUi.setStep('style'));
  await page.locator('#cardTextColor').fill('#ff8800');
  await expect.poll(async () => (await state(page)).text.color).toBe('#ff8800');
  await upload(page, '#141414');
  expect((await state(page)).text.color).toBe('#ff8800');
});

test('Quick mode shows one Text readability slider once a photo is in', async ({ page }) => {
  await openStudio(page);
  await page.locator('#cardText').fill('آسان');
  await page.locator('#cardText').blur();
  await page.evaluate(() => window.WriteUrduCardStudioUi.setMode('quick'));
  await upload(page, '#141414');
  await page.evaluate(() => window.WriteUrduCardStudioUi.setStep('style'));
  await expect(page.locator('#cardOverlay')).toBeVisible();
  await expect(page.locator('label[for="cardOverlay"]')).toContainText('Text readability');
  await expect(page.locator('#cardImageFit')).toBeHidden();
});
