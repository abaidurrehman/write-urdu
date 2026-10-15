const { test, expect } = require('@playwright/test');

const blockExternal = page => page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, route => route.abort());

async function open(page) {
  await blockExternal(page);
  await page.goto('/urdu-bill-generator', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.locator('[data-bill-preview] .bill-totals')).toHaveCount(1);
  if (page.viewportSize().width <= 900) {
    await page.locator('[data-bill-mobile-preview]').click();
    await expect(page.locator('[data-bill-preview] .bill-totals')).toBeVisible();
    await page.locator('[data-bill-preview-close]').click();
  } else {
    await expect(page.locator('[data-bill-preview] .bill-totals')).toBeVisible();
  }
}

test('bill and shop details survive a reload; New bill keeps the shop and bumps the number', async ({ page }) => {
  await open(page);
  await page.locator('[data-field="business.name"]').fill('Noor Store');
  await page.locator('.bill-advanced > summary').click();
  await page.locator('[data-field="business.phone"]').fill('+92 300 1234567');
  await page.locator('[data-item-field="description"]').first().fill('Rice');
  await page.locator('[data-item-field="rate"]').first().fill('250');
  const number = await page.locator('[data-field="documentNumber"]').inputValue();

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-field="business.name"]')).toHaveValue('Noor Store');
  await expect(page.locator('[data-item-field="description"]').first()).toHaveValue('Rice');
  await expect(page.locator('[data-bill-status]')).toContainText('Restored your unfinished document');

  page.once('dialog', dialog => dialog.accept());
  await page.locator('[data-bill-new]').click();
  await expect(page.locator('[data-field="business.name"]')).toHaveValue('Noor Store');
  await expect(page.locator('[data-field="business.phone"]')).toHaveValue('+92 300 1234567');
  await expect(page.locator('[data-item-field="description"]').first()).toHaveValue('');
  const next = await page.locator('[data-field="documentNumber"]').inputValue();
  expect(next).not.toBe(number);
  expect(next).toMatch(/-002$/);
});

test('Urdu mode uses روپے and Urdu-only payment labels; total dominates subtotal', async ({ page }) => {
  await open(page);
  await page.locator('[data-item-field="rate"]').first().fill('100');
  await page.locator('[data-field="languageMode"]').selectOption('urdu');
  await page.locator('.bill-advanced > summary').click();
  await page.locator('[data-field="paymentMethod"]').selectOption('udhaar');
  const preview = page.locator('[data-bill-preview]');
  await expect(preview.locator('.bill-grand-total')).toContainText('روپے');
  await expect(preview.locator('.bill-grand-total')).not.toContainText('PKR');
  await expect(preview.locator('.bill-payment-line')).toContainText('ادھار');
  await expect(preview.locator('.bill-payment-line')).not.toContainText('Udhaar');
  const sizes = await page.evaluate(() => {
    const size = selector => parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
    return { total: size('.bill-grand-total td'), sub: size('.bill-totals tr:first-child td') };
  });
  expect(sizes.total).toBeGreaterThan(sizes.sub * 1.25);
});

test('mobile shows a sticky total + preview/share bar; desktop hides it', async ({ page, isMobile }) => {
  await open(page);
  const bar = page.locator('[data-bill-mobile-bar]');
  if (!isMobile) { await expect(bar).toBeHidden(); return; }
  await page.locator('[data-item-field="rate"]').first().fill('100');
  await expect(bar).toBeVisible();
  await expect(bar.locator('[data-bill-mobile-total]')).toContainText('100.00');
  const box = await bar.boundingBox();
  const viewport = page.viewportSize();
  expect(box.y + box.height).toBeGreaterThanOrEqual(viewport.height - 1);
  await expect(bar.locator('[data-bill-mobile-preview]')).toBeVisible();
  await expect(bar.locator('[data-bill-mobile-share]')).toBeVisible();
});
