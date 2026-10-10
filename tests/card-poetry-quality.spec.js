const { test, expect } = require('@playwright/test');

const COUPLET = 'ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے\nبہت نکلے مرے ارمان لیکن پھر بھی کم نکلے';
// 1x1 transparent PNG for the "upload my own image" path.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

async function openMaker(page) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());
  await page.goto('/urdu-instagram-post-maker', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => Boolean(window.WriteUrduCardStudioApp && window.WriteUrduCardStudioBackgroundLibrary && window.WriteUrduCardStudioBackgroundLibrary.applyById), null, { timeout: 15000 });
  await page.locator('#cardText').fill(COUPLET);
  await page.locator('#cardText').dispatchEvent('input');
}

async function applyBackground(page, id) {
  const result = await page.evaluate(id => window.WriteUrduCardStudioBackgroundLibrary.applyById(id), id);
  expect(result && result.ok).toBe(true);
  await page.waitForFunction(() => window.WriteUrduCardStudioApp.getState().background.type === 'image', null, { timeout: 10000 });
  await page.waitForTimeout(400);
}

const studio = page => page.evaluate(() => {
  const app = window.WriteUrduCardStudioApp;
  const state = app.getState();
  const preset = app.getPreset();
  const rect = app.getObjectRect('text');
  const layout = app.getLayouts().text;
  return {
    font: state.text.fontFamily,
    lineHeight: state.text.lineHeight,
    safeArea: state.background.safeArea || null,
    rect: { left: rect.x / preset.width, top: rect.y / preset.height, right: 1 - (rect.x + rect.width) / preset.width, bottom: 1 - (rect.y + rect.height) / preset.height },
    lines: layout ? layout.lines.filter(line => !line.isBlank).length : null
  };
});

test('a poetry background keeps the couplet whole, in Nastaliq, inside the artwork-free area', async ({ page }) => {
  await openMaker(page);
  await applyBackground(page, 'ink-wash-poetry');
  await expect.poll(async () => (await studio(page)).lines, { timeout: 10000 }).toBe(2);
  const result = await studio(page);
  expect(result.font).toBe('Noto Nastaliq Urdu');
  expect(result.lineHeight).toBeGreaterThanOrEqual(1.8);
  expect(result.safeArea).toEqual({ top: 0.15, right: 0.14, bottom: 0.22, left: 0.14 });
  for (const side of ['top', 'right', 'bottom', 'left']) {
    expect(result.rect[side], side + ' edge of the text box').toBeGreaterThanOrEqual(result.safeArea[side] - 0.001);
  }
});

test('a font the writer picked is kept when a poetry background is applied', async ({ page }) => {
  await openMaker(page);
  const font = page.locator('[data-card-field="text.fontFamily"]');
  await font.focus();
  await page.keyboard.press('ArrowDown');
  const chosen = await font.inputValue();
  expect(chosen).not.toBe('Noto Nastaliq Urdu');
  await applyBackground(page, 'ink-wash-poetry');
  expect((await studio(page)).font).toBe(chosen);
});

test('uploading your own image drops the designer safe area', async ({ page }) => {
  await openMaker(page);
  await applyBackground(page, 'ink-wash-poetry');
  expect((await studio(page)).safeArea).not.toBeNull();
  await page.locator('#cardImage').setInputFiles({ name: 'mine.png', mimeType: 'image/png', buffer: PNG });
  await expect.poll(async () => (await studio(page)).safeArea, { timeout: 10000 }).toBeNull();
});

test('a right-aligned accent bar stays inside the canvas in the accent colour', async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());
  await page.goto('/urdu-instagram-post-maker', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => Boolean(window.WriteUrduCardStudioApp && window.WriteUrduCardStudio), null, { timeout: 15000 });
  const pixels = await page.evaluate(async () => {
    const app = window.WriteUrduCardStudioApp;
    const template = window.WriteUrduCardStudio.TEMPLATES.find(item => item.textAlign === 'right' && item.background.type === 'solid');
    app.replaceState(window.WriteUrduCardStudio.applyTemplate(app.getState(), template.id));
    app.updateTextStyle({ align: 'right' });
    await new Promise(resolve => setTimeout(resolve, 400));
    const preset = app.getPreset();
    const ctx = app.getCanvas().getContext('2d');
    const y = Math.round(preset.marginY * 0.82 + 1);
    const at = x => Array.from(ctx.getImageData(Math.round(x), y, 1, 1).data.slice(0, 3));
    const hex = value => [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16));
    return { accent: hex(template.decoration.accent), inside: at(preset.width - preset.marginX - 4), outside: at(preset.width - preset.marginX / 2) };
  });
  const close = (a, b) => a.every((value, index) => Math.abs(value - b[index]) <= 12);
  expect(close(pixels.inside, pixels.accent), `inside ${pixels.inside} vs accent ${pixels.accent}`).toBe(true);
  expect(close(pixels.outside, pixels.accent), 'no accent beyond the right margin').toBe(false);
});
