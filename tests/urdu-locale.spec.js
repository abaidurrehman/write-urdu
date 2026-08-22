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

test('Phase 1 Urdu command surfaces are localized in initial product UI', async ({ page }) => {
  await blockExternal(page);

  await page.goto('/urdu/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.home-actions')).not.toHaveAttribute('aria-label', 'Editor actions');
  await expect(page.locator('.home-actions')).toHaveAttribute('aria-label', /[\u0600-\u06FF]/);
  await expect(page.locator('[data-copy-target="#transliterateTextarea"]')).toContainText('متن کاپی کریں');
  await expect(page.locator('.home-actions details.action-menu').first()).toContainText('برآمد کریں');

  await page.goto('/urdu/urdu-keyboard', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.keyboard-actions')).not.toHaveAttribute('aria-label', 'Editor actions');
  await expect(page.locator('.keyboard-actions')).toHaveAttribute('aria-label', /[\u0600-\u06FF]/);
  await expect(page.locator('[data-copy-target="#write"]')).toContainText('متن کاپی کریں');
  await page.locator('input.bt[value="ا"]').click();
  await expect(page.locator('#write')).toHaveValue(/ا/);
  await expect(page.getByText('اردو کی بورڈ کیسے استعمال کریں')).toBeVisible();

  await page.goto('/urdu/urdu-editor', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.home-actions-group-create')).toHaveAttribute('aria-label', 'اپنی دستاویز سے تخلیق کریں');
  await expect(page.locator('.home-actions-group-create [data-create-card]')).toContainText('اردو کارڈ بنائیں');
  await expect(page.locator('[data-wu-journey="write-to-card"]')).toContainText('اس اردو کو کارڈ بنا کر شیئر کریں');
  await expect(page.locator('[data-wu-authoring-share-primary]')).toHaveAttribute('aria-label', /[\u0600-\u06FF]/);
  await expect(page.locator('[data-wu-journey-panel]')).not.toContainText('Create & share this Urdu');
  await expect(page.locator('[data-input-mode-control]')).toHaveAttribute('aria-label', 'لکھنے کا طریقہ');
  await expect(page.locator('[data-batch-title]')).toContainText('اردو لکھنے کے دو طریقے');
});

test('locale telemetry keeps normalized route while distinguishing Urdu and English', async ({ page }) => {
  const acquisition = [];
  await page.route('**/api/acquisition', async route => {
    const request = route.request();
    acquisition.push(request.postDataJSON());
    await route.fulfill({ status: 202, contentType: 'application/json', body: '{"accepted":1}' });
  });
  await blockExternal(page);

  await page.goto('/urdu/', { waitUntil: 'domcontentloaded' });
  await expect.poll(() => acquisition.length).toBeGreaterThan(0);
  expect(acquisition.at(-1)).toMatchObject({ route: '/', locale: 'ur' });

  acquisition.length = 0;
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect.poll(() => acquisition.length).toBeGreaterThan(0);
  expect(acquisition.at(-1)).toMatchObject({ route: '/', locale: 'en' });
});
