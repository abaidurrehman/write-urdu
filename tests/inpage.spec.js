const { test, expect } = require('@playwright/test');

test('InPage converter runs both directions in the browser', async ({ page }) => {
  const response = await page.goto('/tools/inpage-unicode-converter/');
  expect(response && response.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'InPage to Unicode Urdu Converter', level: 1 })).toBeVisible();

  await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByRole('button', { name: 'Convert to Unicode' }).click();
  await expect(page.locator('#inpageResult')).toHaveValue('یہ ایک اردو متن ہے۔ ۱۲۳');
  await expect(page.getByText('No unsupported characters')).toBeVisible();

  await page.getByRole('button', { name: 'Unicode → InPage' }).click();
  await page.locator('#inpageSource').fill('یہ اردو ہے۔');
  await page.getByRole('button', { name: 'Convert to InPage text' }).click();
  const legacy = await page.locator('#inpageResult').inputValue();
  expect(legacy).toContain('\u0004');
  const decoded = await page.evaluate(value => window.WriteUrduInPageCore.decodeLegacyText(value).text, legacy);
  expect(decoded).toBe('یہ اردو ہے۔');
});
