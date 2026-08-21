const { test, expect } = require('@playwright/test');

async function blockExternal(page) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());
}

test('homepage language counterpart is crawlable and preserves Basic Writer text', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const editor = page.locator('#transliterateTextarea');
  await editor.fill('mera urdu matn');
  const switcher = page.locator('[data-wu-language-toggle]');
  await expect(switcher).toHaveAttribute('href', '/urdu/');
  await switcher.click();
  await expect(page).toHaveURL(/\/urdu\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ur');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('h1')).toContainText('انگریزی حروف');
  await expect(page.locator('#transliterateTextarea')).toHaveValue('mera urdu matn');
  await expect(page.locator('[data-wu-language-toggle]')).toHaveAttribute('href', '/');
});

test('keyboard counterpart keeps product route and locale', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-keyboard', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-wu-language-toggle]')).toHaveAttribute('href', '/urdu/urdu-keyboard');
  await page.locator('[data-wu-language-toggle]').click();
  await expect(page).toHaveURL(/\/urdu\/urdu-keyboard$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ur');
  await expect(page.locator('h1')).toContainText('اردو کی بورڈ');
  await expect(page.locator('[data-wu-language-toggle]')).toHaveAttribute('href', '/urdu-keyboard');
});

test('nested Urdu voice route loads shared root assets without local 404s', async ({ page }) => {
  const local404s = [];
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.origin === 'http://127.0.0.1:8765' && response.status() === 404) local404s.push(url.pathname);
  });
  await blockExternal(page);
  await page.goto('/urdu/tools/urdu-voice-typing', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('lang', 'ur');
  await expect(page.locator('#voiceTranscript')).toBeVisible();
  expect(local404s.filter(path => /^\/urdu\/(?:js|css|image)\//.test(path))).toEqual([]);
});
