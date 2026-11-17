const { test, expect } = require('@playwright/test');

// WU-UXR-002 Slice K (CARD-UX-033, 035, 028): a visible focus ring, readable notes on phones, no uncaught
// error when the browser blocks storage, long links stay on the card, and an honest fit warning.

async function openStudio(page, options = {}) {
  const errors = [];
  page.on('pageerror', error => errors.push(String(error && error.stack || error).split(/\r?\n/).slice(0, 3).join(' | ')));
  await page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, route => route.abort());
  if (options.blockStorage) {
    // Same simulation as the audit harness (resilience.mjs): strict privacy settings.
    await page.addInitScript(() => {
      const thrower = { get() { throw new DOMException('blocked', 'SecurityError'); } };
      Object.defineProperty(window, 'localStorage', thrower);
      Object.defineProperty(window, 'sessionStorage', thrower);
      Object.defineProperty(window, 'indexedDB', { get() { return undefined; } });
    });
  }
  await page.goto('/urdu-card-studio', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.WriteUrduCardStudioApp && window.WriteUrduCardStudioUi), null, { timeout: 15000 });
  await page.waitForTimeout(1200);
  return errors;
}

test('a focused button shows a solid, fully opaque focus ring', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard focus');
  await openStudio(page);
  await page.locator('[data-card-content-action="sample"]').focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  const ring = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement);
    const alpha = /rgba\([^)]*,\s*([\d.]+)\)/.exec(style.outlineColor);
    return { width: parseFloat(style.outlineWidth), style: style.outlineStyle, alpha: alpha ? Number(alpha[1]) : 1 };
  });
  expect(ring.style).toBe('solid');
  expect(ring.width).toBeGreaterThanOrEqual(3);
  expect(ring.alpha).toBe(1);
});

test('guidance notes are at least 14 px on phones', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openStudio(page);
  await page.evaluate(() => window.WriteUrduCardStudioUi.setStep('export'));
  const sizes = await page.evaluate(() => [...document.querySelectorAll('.wu-share-publish-note, .card-studio-help')]
    .filter(node => node.getClientRects().length)
    .map(node => parseFloat(getComputedStyle(node).fontSize)));
  expect(sizes.length).toBeGreaterThan(0);
  for (const size of sizes) expect(size).toBeGreaterThanOrEqual(14);
});

test('blocked storage raises no uncaught error and the card still downloads', async ({ page }) => {
  const errors = await openStudio(page, { blockStorage: true });
  await page.locator('[data-card-content-action="sample"]').click();
  const download = page.waitForEvent('download', { timeout: 15000 });
  await page.locator('.card-studio-top-actions [data-card-action="download"]').click();
  await download;
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test('a long link is broken to fit and never runs off the card', async ({ page }) => {
  await openStudio(page);
  const url = 'https://www.example.com/urdu/cards/' + 'a'.repeat(40) + '?ref=whatsapp-status_share';
  await page.locator('#cardText').fill('ملاحظہ کریں ' + url);
  await page.waitForTimeout(800);
  const result = await page.evaluate(() => {
    const app = window.WriteUrduCardStudioApp;
    const canvas = app.getCanvas();
    const layout = app.getLayouts().text;
    const rect = app.getObjectRect('text');
    const ctx = canvas.getContext('2d');
    // The widest drawn line must fit the text box.
    ctx.font = layout.font || ctx.font;
    const widest = Math.max(...layout.lines.filter(line => !line.isBlank).map(line => line.width || ctx.measureText(line.text).width));
    return { widest, box: rect.width, lines: layout.lines.filter(line => !line.isBlank).length };
  });
  expect(result.widest).toBeLessThanOrEqual(result.box + 1);
  expect(result.lines).toBeGreaterThan(1);
});

test('the fit warning tells the truth when auto-fit is on', async ({ page }) => {
  await openStudio(page);
  await page.locator('#cardText').fill(('یہ ایک بہت لمبی تحریر ہے جو کارڈ پر پوری نہیں آئے گی۔ ').repeat(40));
  await page.waitForTimeout(900);
  const auto = await page.evaluate(() => window.WriteUrduCardStudioApp.getState().text.fontMode === 'auto');
  expect(auto).toBe(true);
  const warning = page.locator('[data-card-text-warning]');
  await expect(warning).toBeVisible();
  await expect(warning).toContainText('even at the smallest readable size');
  await expect(warning).not.toContainText('switch on auto-fit');
});
