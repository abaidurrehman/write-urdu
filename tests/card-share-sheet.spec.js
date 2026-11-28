const { test, expect } = require('@playwright/test');

// WU-UXR-002 Slice H (CARD-UX-014, 015): after publishing, people can send the link straight
// to WhatsApp or Facebook; "Send picture" is clearly the no-link choice; the recipient page
// offers the same routes when the phone has no share sheet.
const SHARE_ID = 'Ab12Cd34';

async function withoutNativeShare(page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: undefined });
  });
}

async function withNativeShare(page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: async payload => { window.__sharedPayload = payload; } });
  });
}

async function publishFromStudio(page) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.route('**/api/shares', async route => {
    if (route.request().method() !== 'POST') return route.continue();
    const origin = new URL(route.request().url()).origin;
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, id: SHARE_ID, url: `${origin}/s/${SHARE_ID}`, manageToken: 'test-token' }) });
  });
  await page.goto('/urdu-card-studio', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.WriteUrduCardStudioApp && document.querySelector('[data-card-content-action="sample"]')), null, { timeout: 15000 });
  await page.locator('[data-card-content-action="sample"]').click();
  await page.locator('[data-card-action="publish"]:visible').first().click();
  const confirm = page.locator('[data-wu-share-confirm]');
  if (await confirm.count()) await confirm.click();
  const shortUrl = `${new URL(page.url()).origin}/s/${SHARE_ID}`;
  await expect(page.locator('[data-wu-share-url]')).toHaveValue(shortUrl, { timeout: 10000 });
  return shortUrl;
}

test('without a share sheet the success dialog offers WhatsApp, Facebook and Copy link', async ({ page }) => {
  await withoutNativeShare(page);
  const url = await publishFromStudio(page);
  const dialog = page.locator('.wu-share-dialog');
  await expect(dialog).toContainText('Your link is ready. Send it on WhatsApp or Facebook.');
  await expect(dialog).toContainText('This link always shows this version. To change it, publish a new version.');
  const whatsapp = dialog.locator('[data-wu-share-whatsapp]');
  await expect(whatsapp).toBeVisible();
  await expect(whatsapp).toHaveAttribute('href', 'https://wa.me/?text=' + encodeURIComponent('Urdu card for you ' + url));
  await expect(whatsapp).toHaveAttribute('target', '_blank');
  await expect(whatsapp).toHaveAttribute('rel', /noopener/);
  const facebook = dialog.locator('[data-wu-share-facebook]');
  await expect(facebook).toHaveAttribute('href', 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url));
  await expect(facebook).toHaveAttribute('rel', /noopener/);
  await expect(dialog.locator('[data-wu-share-social-copy]')).toBeVisible();
  await expect(dialog.locator('[data-wu-share-native]'), 'no share sheet, so no dead Share link button').toBeHidden();
});

test('with a share sheet, Share link stays primary and receives the URL', async ({ page }) => {
  await withNativeShare(page);
  const url = await publishFromStudio(page);
  const dialog = page.locator('.wu-share-dialog');
  const native = dialog.locator('[data-wu-share-native]');
  await expect(native).toBeVisible();
  await expect(native).toHaveClass(/primary/);
  await expect(dialog.locator('[data-wu-share-whatsapp]')).toBeVisible();
  await native.click();
  await page.waitForFunction(() => Boolean(window.__sharedPayload));
  expect((await page.evaluate(() => window.__sharedPayload)).url).toBe(url);
});

test('the picture choice is called Send picture and the Export step explains Picture vs Link', async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.goto('/urdu-card-studio', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(document.querySelector('[data-wu-share-step-publish]')), null, { timeout: 15000 });
  const send = page.locator('.card-studio-export-section [data-card-action="share"]');
  await expect(send).toHaveText('Send picture');
  await expect(send).toHaveAttribute('title', 'Send the picture file — no link is created');
  await expect(page.locator('[data-wu-share-chooser]')).toContainText('Picture — best for family groups, Status and Instagram');
  await expect(page.locator('[data-wu-share-chooser]')).toContainText('Link — opens a page where they can make their own');
});

test('the Urdu Card Studio shows the same choices in Urdu', async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.goto('/urdu/urdu-card-studio', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(document.querySelector('[data-wu-share-step-publish]')), null, { timeout: 15000 });
  await expect(page.locator('.card-studio-export-section [data-card-action="share"]')).toHaveText('تصویر بھیجیں');
  await expect(page.locator('[data-wu-share-chooser]')).toContainText('تصویر');
  await expect(page.locator('[data-wu-share-chooser]')).toContainText('لنک');
});

function recipientFixture() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/css/share-page.css"></head>
  <body><main class="share-shell"><div class="share-media-actions"><button class="share-button share-media-action" type="button" data-share-native><span>Share</span></button></div>
  <p data-share-public-text>عید مبارک</p><p data-share-status role="status"></p></main>
  <script src="/js/share-publish-core.js"></script><script src="/js/share-page.js"></script></body></html>`;
}

test('the recipient page opens a WhatsApp, Facebook and Copy link menu when there is no share sheet', async ({ page }) => {
  await withoutNativeShare(page);
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.route(`**/s/${SHARE_ID}`, route => route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: recipientFixture() }));
  await page.goto(`/s/${SHARE_ID}`);
  const url = `${new URL(page.url()).origin}/s/${SHARE_ID}`;
  const menu = page.locator('[data-share-menu]');
  await expect(menu).toBeHidden();
  await page.locator('[data-share-native]').click();
  await expect(menu).toBeVisible();
  await expect(page.locator('[data-share-native]')).toHaveAttribute('aria-expanded', 'true');
  await expect(menu.locator('[data-share-menu-whatsapp]')).toHaveAttribute('href', 'https://wa.me/?text=' + encodeURIComponent('Urdu card for you ' + url));
  await expect(menu.locator('[data-share-menu-facebook]')).toHaveAttribute('href', 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url));
  await expect(menu.locator('[data-share-menu-copy]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
});

test('the recipient page still uses the share sheet when there is one', async ({ page }) => {
  await withNativeShare(page);
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.route(`**/s/${SHARE_ID}`, route => route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: recipientFixture() }));
  await page.goto(`/s/${SHARE_ID}`);
  await page.locator('[data-share-native]').click();
  await page.waitForFunction(() => Boolean(window.__sharedPayload));
  expect((await page.evaluate(() => window.__sharedPayload)).url).toBe(`${new URL(page.url()).origin}/s/${SHARE_ID}`);
  await expect(page.locator('[data-share-menu]')).toHaveCount(0);
});
