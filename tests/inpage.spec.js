const { test, expect } = require('@playwright/test');

test('InPage converter runs both directions in the browser', async ({ page }) => {
  const response = await page.goto('/tools/inpage-unicode-converter');
  expect(response && response.status()).toBe(200);

  const heading = page.locator('h1');
  const headingCount = await heading.count();
  const bodyText = await page.locator('body').innerText();
  expect(headingCount, `Expected the converter H1. URL=${page.url()} BODY=${bodyText.slice(0, 800)}`).toBe(1);
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText('InPage to Unicode Urdu Converter');

  await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByRole('button', { name: 'Convert to Unicode' }).click();
  await expect(page.locator('#inpageResult')).toHaveValue('یہ ایک اردو متن ہے۔ ۱۲۳');
  await expect(page.getByText('No unsupported characters', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Unicode → InPage' }).click();
  await page.locator('#inpageSource').fill('یہ اردو ہے۔');
  await page.getByRole('button', { name: 'Convert to InPage text' }).click();
  const legacy = await page.locator('#inpageResult').inputValue();
  expect(legacy).toContain('\u0004');
  const decoded = await page.evaluate(value => window.WriteUrduInPageCore.decodeLegacyText(value).text, legacy);
  expect(decoded).toBe('یہ اردو ہے۔');
});

test('nested Urdu tools preserve their own shared-shell page identity', async ({ page }) => {
  const response = await page.goto('/tools/urdu-voice-typing');
  expect(response && response.status()).toBe(200);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('h1')).toHaveText('Urdu Voice Typing');
  await expect(page).toHaveTitle('Urdu Voice Typing — Speak Urdu to Text Online | WriteUrdu');
  await expect(page.locator('.urdu-voice-hero-demo')).toBeVisible();
  await expect(page.getByText('السلام علیکم، آج میں آواز سے اردو لکھ رہا ہوں۔')).toBeVisible();
  await expect(page.locator('a[href="/write-urdu-privacy#voice-typing"]')).toBeVisible();
});
