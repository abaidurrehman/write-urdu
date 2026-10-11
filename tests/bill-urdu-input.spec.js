const { test, expect } = require('@playwright/test');

const blockExternal = page => page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, route => route.abort());

test('bill shop, customer and item fields share the English letters / direct Urdu toggle', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-bill-generator', { waitUntil: 'domcontentloaded', timeout: 15000 });
  const control = page.locator('[data-input-mode-control][data-input-mode-storage="bill"]');
  await expect(control).toBeVisible();
  await expect(control.locator('[data-input-mode-option="roman"]')).toHaveText('English letters → Urdu');
  await expect(control.locator('[data-input-mode-option="direct"]')).toHaveText('Type Urdu directly');
  await expect(control).toHaveAttribute('data-input-mode', 'roman');

  await page.locator('[data-bill-add-item]').click();
  await control.locator('[data-input-mode-option="direct"]').click();
  for (const selector of ['[data-field="business.name"]', '[data-field="customer.name"]', '[data-item-field="description"]']) {
    await expect(page.locator(selector).first()).toHaveAttribute('data-input-mode', 'direct');
  }
  await page.locator('[data-field="business.name"]').fill('کریانہ سٹور');
  await expect(page.locator('[data-field="business.name"]')).toHaveValue('کریانہ سٹور');
  // Numeric and phone fields are never part of the Urdu input mode.
  await expect(page.locator('[data-item-field="rate"]').first()).not.toHaveAttribute('data-input-mode', /.+/);
});
