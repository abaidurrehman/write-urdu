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
  await expect(page.locator('.home-actions-group-create')).toHaveCount(0);
  await expect(page.locator('[data-wu-authoring-share-primary]')).toHaveCount(0);

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
  await expect(actions.getByText('Export', { exact: true })).toBeVisible();
  await expect(actions.getByText('Invoice', { exact: true })).toHaveCount(0);
  await expect(actions.getByText('Templates', { exact: true })).toHaveCount(0);
  await expect(actions.getByText('Create Urdu Card', { exact: true })).toHaveCount(0);
  await expect(actions.getByText('Create QR Code', { exact: true })).toHaveCount(0);
  await expect(actions.locator('[data-write-urdu-share]')).toHaveCount(0);

  const more = actions.locator('[data-wu-basic-more]');
  const toggle = more.locator('[data-wu-basic-more-toggle]');
  const panel = more.locator('[data-wu-basic-more-panel]');
  const share = panel.locator('[data-wu-basic-share-action]');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();
  await expect(share).toContainText('Share text only');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
  await expect(share).toBeVisible();
  expect(await page.evaluate(() => Boolean(window.WriteUrduTools && typeof window.WriteUrduTools.share === 'function'))).toBe(true);

  const nextStep = page.locator('[data-wu-next-step-version="2"]');
  await expect(nextStep).toBeVisible();
  await expect(nextStep.locator('.wu-continue-actions > [data-wu-next-step-action]')).toHaveCount(3);
  await expect(nextStep.locator('[data-wu-next-step-action]')).toHaveCount(4);
  await expect(nextStep.locator('[data-wu-next-step-action="basic-to-templates"]')).toBeAttached();
});

test('legacy follow/comment chrome and premature header creation are retired from core workspaces', async ({ page }) => {
  for (const route of ['/', '/urdu-keyboard', '/urdu-editor']) {
    await page.goto(route);
    await waitForConvergence(page);
    await expect(page.locator('.fb-like')).toHaveCount(0);
    await expect(page.locator('.twitter-follow-button')).toHaveCount(0);
    await expect(page.locator('.fb-comments')).toHaveCount(0);
    await expect(page.locator('[data-wu-authoring-share-primary]')).toHaveCount(0);
    await expect(page.locator('body')).toHaveAttribute('data-wu-legacy-social-retired', 'true');
    await expect(page.locator('body')).toHaveAttribute('data-wu-premature-header-action-retired', 'true');
  }
});

test('global navigation uses user-first language for cleaner and image capture', async ({ page }) => {
  await page.goto('/');
  await waitForConvergence(page);
  await expect(page.locator('[data-wu-outcome-nav="v2"]')).toContainText('Fix broken or badly formatted Urdu text');
  await expect(page.locator('[data-wu-outcome-nav="v2"]')).toContainText('Turn an Urdu screenshot or photo into editable text');
});

test('human sitemap follows Write Create Work Learn taxonomy', async ({ page }) => {
  await page.goto('/write-urdu-sitemap');
  await expect(page.locator('main')).toContainText('Write');
  await expect(page.locator('main')).toContainText('Create');
  await expect(page.locator('main')).toContainText('Work');
  await expect(page.locator('main')).toContainText('Learn');
  await expect(page.locator('main')).toContainText('Urdu Text Cleaner');
  await expect(page.locator('main')).toContainText('Urdu Invoice');
});

test('documentation includes all current ways to start with Urdu text', async ({ page }) => {
  await page.goto('/write-urdu-documentation');
  await expect(page.locator('main')).toContainText('Choose how your Urdu starts');
  await expect(page.locator('main')).toContainText('Speak Urdu');
  await expect(page.locator('main')).toContainText('Start from an image');
  await expect(page.locator('main')).toContainText('Convert old InPage text');
});
