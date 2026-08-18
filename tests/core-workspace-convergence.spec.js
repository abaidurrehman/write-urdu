const { test, expect } = require('@playwright/test');

async function waitForConvergence(page) {
  await page.waitForFunction(() => Boolean(window.WriteUrduCoreWorkspaceConvergence));
}

test('Basic Writer is canvas-first and defers generic actions until text exists', async ({ page }) => {
  await page.goto('/');
  await waitForConvergence(page);

  const editor = page.locator('#transliterateTextarea');
  const actions = page.locator('.home-actions');
  await expect(editor).toBeVisible();
  await expect(actions).toBeHidden();
  await expect(page.locator('.home-actions-group-create')).toBeHidden();

  const order = await page.evaluate(() => {
    const editor = document.querySelector('#transliterateTextarea');
    const actions = document.querySelector('.home-actions');
    return Boolean(editor && actions && (editor.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  expect(order).toBe(true);

  await editor.fill('میرا خیال ہے');
  await expect(actions).toBeVisible();
  await expect(actions).toHaveAttribute('data-wu-core-actionbar', 'post-editor');
  await expect(actions.getByText('Copy text')).toBeVisible();
  await expect(actions.getByText('Share', { exact: true })).toBeVisible();
  await expect(actions.getByText('Invoice', { exact: true })).toHaveCount(0);
  await expect(actions.getByText('Templates', { exact: true })).toHaveCount(0);
  await expect(actions.getByText('Create Urdu Card', { exact: true })).toHaveCount(0);
  await expect(actions.getByText('Create QR Code', { exact: true })).toHaveCount(0);

  const nextStep = page.locator('[data-wu-next-step-version="2"]');
  await expect(nextStep).toBeVisible();
  await expect(nextStep.locator('[data-wu-next-step-action]')).toHaveCount(3);
});

test('legacy follow and comment chrome is retired from core workspaces', async ({ page }) => {
  for (const route of ['/', '/urdu-keyboard', '/urdu-editor']) {
    await page.goto(route);
    await waitForConvergence(page);
    await expect(page.locator('.fb-like')).toHaveCount(0);
    await expect(page.locator('.twitter-follow-button')).toHaveCount(0);
    await expect(page.locator('.fb-comments')).toHaveCount(0);
    await expect(page.locator('body')).toHaveAttribute('data-wu-legacy-social-retired', 'true');
  }
});

test('global navigation uses user-first language for cleaner and image capture', async ({ page }) => {
  await page.goto('/');
  await waitForConvergence(page);
  await page.waitForFunction(() => document.querySelector('.wu-primary-nav[data-wu-outcome-nav="v2"]'));
  await page.evaluate(() => window.WriteUrduCoreWorkspaceConvergence.enhanceGlobalLabels());

  const cleaner = page.locator('.wu-outcome-menu a[href="/urdu-text-cleaner"]');
  await expect(cleaner.locator('strong')).toHaveText('Fix broken or badly formatted Urdu text');
  await expect(cleaner.locator('small')).toHaveText('Urdu Text Cleaner');

  const image = page.locator('.wu-outcome-menu a[href="/urdu-ocr"]');
  await expect(image.locator('strong')).toHaveText('Turn an Urdu screenshot or photo into editable text');
  await expect(image.locator('small')).toHaveText('Image to Urdu Text');
});

test('human sitemap follows Write Create Work Learn taxonomy', async ({ page }) => {
  await page.goto('/write-urdu-sitemap');
  await waitForConvergence(page);
  await expect(page.locator('body')).toHaveAttribute('data-wu-taxonomy-synced', 'true');
  await expect(page.locator('.sitemap-directory-jump a[href="#work"]')).toHaveText('Work');
  await expect(page.locator('#write a.sitemap-directory-card[href="/urdu-text-cleaner"]')).toHaveCount(1);
  await expect(page.locator('#create a.sitemap-directory-card[href="/urdu-text-cleaner"]')).toHaveCount(0);
  await expect(page.locator('#work a.sitemap-directory-card[href="/urdu-invoice-generator"]')).toHaveCount(1);
  await expect(page.locator('#create a.sitemap-directory-card[href="/urdu-invoice-generator"]')).toHaveCount(0);
});

test('documentation includes all current ways to start with Urdu text', async ({ page }) => {
  await page.goto('/write-urdu-documentation');
  await waitForConvergence(page);
  await expect(page.locator('#paths-title')).toHaveText('Choose how your Urdu starts');
  await expect(page.locator('[data-wu-capture-path]')).toHaveCount(3);
  await expect(page.locator('a[href="/tools/urdu-voice-typing"]')).toBeVisible();
  await expect(page.locator('a[href="/urdu-ocr"]')).toBeVisible();
  await expect(page.locator('a[href="/tools/inpage-unicode-converter"]')).toBeVisible();
});
