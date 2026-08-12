const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function open(page, route) {
  await blockExternalServices(page);
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached' });
}

test('homepage keeps English to Urdu typing search title after shared shell initialization', async ({ page }) => {
  await open(page, '/');
  await expect(page.locator('h1')).toHaveText('Type Roman Urdu and convert it to Urdu script');
  await expect.poll(() => page.title()).toBe('English to Urdu Typing Online – Type Roman Urdu | WriteUrdu');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.write-urdu.com/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Roman Urdu with English letters.*Urdu script.*transliteration/i);
});

test('Card Studio keeps its acquisition title after shared shell initialization', async ({ page }) => {
  await open(page, '/urdu-card-studio');
  await expect(page.locator('h1')).toHaveText('Urdu Card Studio');
  await expect.poll(() => page.title()).toBe('Urdu Text on Photo & Poetry Post Maker Online | WriteUrdu');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.write-urdu.com/urdu-card-studio');
});
