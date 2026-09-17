const { test, expect } = require('@playwright/test');

test('WhatsApp Status page exposes ready-made Urdu statuses and loads one into the maker', async ({ page }) => {
  const response = await page.goto('/urdu-whatsapp-status-maker');
  expect(response && response.status()).toBe(200);

  await expect(page).toHaveTitle('Urdu WhatsApp Status – Ready-Made Text & Image Maker');
  await expect(page.locator('h1')).toHaveText('Urdu WhatsApp Status');

  const discovery = page.locator('[data-whatsapp-status-discovery]');
  await expect(discovery).toBeVisible();
  await expect(discovery.locator('[data-status-card-id]')).toHaveCount(7);

  const firstCard = discovery.locator('[data-status-card-id]').first();
  const readyText = (await firstCard.locator('.whatsapp-status-card-text').textContent()).trim();
  expect(readyText.length).toBeGreaterThan(5);

  await firstCard.getByRole('button', { name: 'Use this status' }).click();
  await expect(page.locator('#cardText')).toHaveValue(readyText);
  await expect(discovery.locator('[data-whatsapp-status-status]')).toContainText('Loaded into the Status Maker');
});

test('WhatsApp ready-made status categories filter the canonical card registry', async ({ page }) => {
  await page.goto('/urdu-whatsapp-status-maker');
  const discovery = page.locator('[data-whatsapp-status-discovery]');

  await discovery.getByRole('button', { name: /Jumma/ }).click();
  const cards = discovery.locator('[data-status-card-id]');
  await expect(cards.first()).toBeVisible();
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(8);

  for (let index = 0; index < count; index += 1) {
    await expect(cards.nth(index)).toHaveAttribute('data-status-category', 'jumma');
  }
});
