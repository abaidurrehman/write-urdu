const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function open(page, route) {
  await blockExternalServices(page);
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached' });
}

test('Basic writing can continue through Templates into Card Studio without putting Urdu in the URL', async ({ page }) => {
  await open(page, '/');
  await page.waitForFunction(() => Boolean(
    window.WriteUrduWorkspaceNextStep &&
    window.WriteUrduCoreContinuity &&
    window.WriteUrduCreatePublishBoundariesRegistry
  ), null, { timeout: 10000 });

  const text = 'ٹیمپلیٹ کے ساتھ محفوظ اردو متن';
  await page.locator('#transliterateTextarea').fill(text);
  const panel = page.locator('[data-wu-next-step-version="2"]');
  await expect(panel).toBeVisible();
  await expect(panel.locator('[data-wu-next-step-action]')).toHaveCount(4);
  await expect(panel.locator('.wu-continue-actions [data-wu-next-step-action]')).toHaveCount(3);
  await panel.locator('.wu-continue-more > summary').click();
  const templates = panel.locator('[data-wu-next-step-action="basic-to-templates"]');
  await expect(templates).toContainText('Start from a template');
  await templates.click();

  await page.waitForURL(/urdu-templates/, { timeout: 10000 });
  await page.waitForFunction(() => Boolean(window.WriteUrduTemplateLibraryBoundary), null, { timeout: 10000 });
  await expect(page.locator('[data-template-staged-text]')).toContainText('current Urdu');
  const firstTemplate = page.locator('[data-template-grid] [data-template-open]').first();
  await expect(firstTemplate).toHaveText('Use this template');
  await firstTemplate.click();

  await page.waitForURL(/urdu-card-studio/, { timeout: 10000 });
  await expect(page.locator('#cardText')).toHaveValue(text, { timeout: 10000 });
  await expect.poll(() => page.evaluate(() => {
    const app = window.WriteUrduCardStudioApp;
    const state = app && app.getState && app.getState();
    return state && state.libraryTemplateId;
  })).toBeTruthy();
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-wu-card-seed-kind'))).toBe('template-seed');
  expect(page.url()).not.toContain(encodeURIComponent(text));
});

test('QR Generator consumes a v2 public-share URL handoff before its mature engine initializes', async ({ page }) => {
  await open(page, '/');
  await page.waitForFunction(() => Boolean(window.WriteUrduWorkspaceHandoff), null, { timeout: 10000 });
  const shareUrl = 'https://write-urdu.com/s/Abc12345';
  const stored = await page.evaluate(value => window.WriteUrduWorkspaceHandoff.store({
    sourceWorkspace: 'public-share',
    sourceRoute: '/s/Abc12345',
    targetWorkspace: 'qr-generator',
    targetRoute: '/qr-code-generator',
    actionId: 'share-to-qr',
    kind: 'plain-text',
    payload: { text: value }
  }).ok, shareUrl);
  expect(stored).toBe(true);

  await page.goto('/qr-code-generator', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-wu-qr-v2-imported'))).toBe('true');
  await expect(page.locator('[data-qr-type]')).toHaveValue('text');
  await expect(page.locator('[data-qr-field="text"]')).toHaveValue(shareUrl);
  await expect(page.locator('[data-qr-payload]')).toContainText(shareUrl);
  expect(page.url()).not.toContain('Abc12345');
});
