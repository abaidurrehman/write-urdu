const { test, expect } = require('@playwright/test');

test('direct Urdu input and shared physical-key reference remain usable', async ({ page }) => {
  await page.goto('/urdu-keyboard', { waitUntil: 'domcontentloaded' });

  const editor = page.locator('#write');
  await expect(editor).toHaveAttribute('dir', 'rtl');
  await page.locator('input.bt[value="ا"]').click();
  await expect(editor).toHaveValue('ا');
  await page.locator('input.puncuation[value="؟"]').click();
  await expect(editor).toHaveValue('ا؟');

  const reference = page.locator('[data-physical-key-reference]');
  await expect(reference).toBeVisible();
  await expect(reference.locator('.physical-key-reference-key', { hasText: 'A' })).toContainText('ا');

  const shift = reference.locator('[data-key-reference-mode="shift"]');
  await shift.click();
  await expect(shift).toHaveAttribute('aria-pressed', 'true');
  await expect(reference.locator('.physical-key-reference-key', { hasText: 'Shift+A' })).toContainText('آ');
  await expect(reference.locator('.physical-key-reference-key', { hasText: 'Shift+?' })).toContainText('؟');

  await expect(page.getByRole('button', { name: 'Copy text' })).toBeVisible();
  await expect(page.locator('.save-menu summary')).toBeVisible();
  await expect(page.locator('#dependencyAlert')).toHaveCount(0);

  if ((page.viewportSize() || {}).width <= 620) {
    const box = await reference.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual((page.viewportSize() || {}).width + 1);
  }
});
