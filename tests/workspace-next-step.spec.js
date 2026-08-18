const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function open(page, route) {
  await blockExternalServices(page);
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached' });
  await page.waitForFunction(() => Boolean(window.WriteUrduWorkspaceNextStep), null, { timeout: 10000 });
}

test('Basic Writer reveals three primary continuations and keeps Templates in More options', async ({ page }) => {
  await open(page, '/');
  const panel = page.locator('[data-wu-next-step-version="2"]');
  await expect(panel).toBeAttached();
  await expect(panel).toBeHidden();

  await page.locator('#transliterateTextarea').fill('یہ میرا تیار اردو متن ہے');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.wu-continue-actions > .wu-continue-action')).toHaveCount(3);
  await expect(panel.locator('[data-wu-next-step-action="basic-to-rich"] strong')).toHaveText('Format this as a document');
  await expect(panel.locator('[data-wu-next-step-action="basic-to-card"] strong')).toHaveText('Create a card with this text');
  await expect(panel.locator('[data-wu-next-step-action="basic-to-qr"] strong')).toHaveText('Make a QR code from this text');
  await expect(panel.locator('[data-wu-next-step-action="basic-to-rich"]')).toHaveAttribute('href', '/urdu-editor');

  const more = panel.locator('.wu-continue-more');
  await expect(more).toHaveCount(1);
  await expect(more.locator('summary')).toHaveText('More options');
  await expect(panel.locator('[data-wu-next-step-action="basic-to-templates"]')).toBeHidden();
  await more.locator('summary').click();
  await expect(panel.locator('[data-wu-next-step-action="basic-to-templates"] strong')).toHaveText('Start from a template');
  await expect(panel.locator('[data-wu-next-step-action="basic-to-templates"]')).toBeVisible();
  await expect(panel.locator('[data-create-stylish],[data-create-name-art]')).toHaveCount(0);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('[data-wu-next-step-version="2"]')).position)).not.toMatch(/fixed|sticky/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('Cleaner uses three visible recommendations and an accessible More options overflow', async ({ page }) => {
  await open(page, '/urdu-text-cleaner.html');
  const panel = page.locator('[data-wu-next-step-version="2"]');
  await expect(panel).toBeAttached();
  await expect(panel).toBeHidden();

  await page.locator('#cleanerSource').fill('یہ صاف اردو متن ہے');
  await page.locator('[data-cleaner-analyze]').click();
  await expect(page.locator('#cleanerResult')).not.toHaveValue('');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.wu-continue-actions > .wu-continue-action')).toHaveCount(3);
  await expect(panel.locator('[data-wu-next-step-action="cleaner-to-basic"]')).toBeVisible();
  await expect(panel.locator('[data-wu-next-step-action="cleaner-to-rich"]')).toBeVisible();
  await expect(panel.locator('[data-wu-next-step-action="cleaner-to-card"]')).toBeVisible();

  const more = panel.locator('.wu-continue-more');
  await expect(more).toHaveCount(1);
  await expect(more.locator('summary')).toHaveText('More options');
  await expect(panel.locator('[data-wu-next-step-action="cleaner-to-qr"]')).toBeHidden();
  await more.locator('summary').click();
  await expect(panel.locator('[data-wu-next-step-action="cleaner-to-qr"]')).toBeVisible();
  await expect(page.locator('[data-cleaner-continuity-actions]')).toHaveCount(0);
});

test('Rich Editor recommends only cross-workspace continuation and leaves export embedded', async ({ page }) => {
  await open(page, '/urdu-editor.html');
  const panel = page.locator('[data-wu-next-step-version="2"]');
  await expect(panel).toBeAttached();
  await expect(panel).toBeHidden();

  const richBody = page.frameLocator('#basic-example_ifr').locator('body');
  await richBody.fill('یہ ایک رسمی اردو دستاویز ہے');
  await expect(panel).toBeVisible({ timeout: 10000 });
  await expect(panel.locator('.wu-continue-actions > .wu-continue-action')).toHaveCount(2);
  await expect(panel.locator('[data-wu-next-step-action="rich-to-card"]')).toBeVisible();
  await expect(panel.locator('[data-wu-next-step-action="rich-to-qr"]')).toBeVisible();
  await expect(panel.locator('[data-wu-next-step-action="rich-export"]')).toHaveCount(0);
  await expect(panel.locator('.wu-continue-more')).toHaveCount(0);
});

test('contextual action preserves the existing browser-local handoff behavior', async ({ page }) => {
  await open(page, '/');
  await page.locator('#transliterateTextarea').fill('یہ متن اگلے ورک اسپیس میں جائے گا');
  const action = page.locator('[data-wu-next-step-action="basic-to-rich"]');
  await expect(action).toBeVisible();
  await page.waitForFunction(() => Boolean(window.WriteUrduCoreContinuity));
  await action.click();
  await page.waitForURL(/urdu-editor/, { timeout: 10000 });
  const richBody = page.frameLocator('#basic-example_ifr').locator('body');
  await expect(richBody).toContainText('یہ متن اگلے ورک اسپیس میں جائے گا', { timeout: 10000 });
  expect(page.url()).not.toContain(encodeURIComponent('یہ متن'));
});