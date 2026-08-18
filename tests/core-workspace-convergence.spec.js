const { test, expect } = require('@playwright/test');

async function waitForConvergence(page) {
  await page.waitForFunction(() => Boolean(window.WriteUrduCoreWorkspaceConvergence));
}

async function waitForBasicToolbar(page) {
  await page.waitForFunction(() => Boolean(
    window.WriteUrduBasicCommandToolbar &&
    document.querySelector('[data-wu-basic-command-surface]')
  ));
}

test('Basic Writer exposes one share-first command toolbar directly above the canvas', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async payload => { window.__writeUrduSharedPayload = payload; }
    });
  });
  await page.goto('/');
  await waitForConvergence(page);
  await waitForBasicToolbar(page);

  const editor = page.locator('#transliterateTextarea');
  const surface = page.locator('[data-wu-basic-command-surface]');
  const toolbar = page.locator('[data-wu-basic-command-toolbar]');
  const share = toolbar.locator('[data-wu-command-action="share"]');
  const copy = toolbar.locator('[data-wu-command-action="copy"]');
  const clear = toolbar.locator('[data-wu-command-action="clear"]');
  const mode = toolbar.locator('[data-input-mode-control]');

  await expect(editor).toBeVisible();
  await expect(surface).toBeVisible();
  await expect(toolbar).toBeVisible();
  await expect(toolbar).toHaveAttribute('data-wu-core-actionbar', 'pre-editor');
  await expect(page.locator('.home-actions-group-create')).toHaveCount(0);
  await expect(page.locator('[data-wu-authoring-share-primary]')).toHaveCount(0);
  await expect(toolbar.getByText('Export', { exact: true })).toHaveCount(0);
  await expect(toolbar.getByText('Share text only', { exact: true })).toHaveCount(0);

  const commandOrder = await toolbar.locator('[data-wu-command-action]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-wu-command-action')));
  expect(commandOrder.slice(0, 2)).toEqual(['share', 'copy']);

  const toolbarBeforeCanvas = await page.evaluate(() => {
    const surface = document.querySelector('[data-wu-basic-command-surface]');
    const canvas = document.querySelector('#demo');
    return Boolean(surface && canvas && (surface.compareDocumentPosition(canvas) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  expect(toolbarBeforeCanvas).toBe(true);

  await expect(share).toBeDisabled();
  await expect(copy).toBeDisabled();
  await expect(clear).toBeDisabled();
  await expect(mode.locator('[data-input-mode-option="roman"]')).toBeEnabled();
  await expect(toolbar.locator('[data-wu-basic-more-toggle]')).toBeEnabled();
  await expect(page.locator('[data-wu-basic-mode-helper]')).toContainText('Type Roman Urdu');

  await editor.fill('میرا خیال ہے');
  await expect(share).toBeEnabled();
  await expect(copy).toBeEnabled();
  await expect(clear).toBeEnabled();

  const compact = await page.evaluate(() => window.matchMedia('(max-width: 767px)').matches);
  const outputs = ['pdf', 'word', 'png', 'preview', 'print'];
  if (compact) {
    await expect(toolbar.locator('[data-wu-basic-output-group]')).toBeHidden();
    const toggle = toolbar.locator('[data-wu-basic-more-toggle]');
    await toggle.click();
    const panel = toolbar.locator('[data-wu-basic-more-panel]');
    await expect(panel).toBeVisible();
    for (const action of outputs) {
      await expect(panel.locator(`[data-wu-command-action="${action}"]`)).toBeVisible();
    }
  } else {
    await expect(toolbar.locator('[data-wu-basic-output-group]')).toBeVisible();
    for (const action of outputs) {
      await expect(toolbar.locator(`[data-wu-command-action="${action}"]`)).toBeVisible();
    }
  }

  const moreToggle = toolbar.locator('[data-wu-basic-more-toggle]');
  if (await moreToggle.getAttribute('aria-expanded') !== 'true') await moreToggle.click();
  const morePanel = toolbar.locator('[data-wu-basic-more-panel]');
  await expect(morePanel).toBeVisible();
  await expect(morePanel.locator('#inputFileNameToSaveAs')).toBeVisible();
  await expect(morePanel.getByText('Text file', { exact: true })).toBeVisible();

  await share.click();
  await page.waitForFunction(() => Boolean(window.__writeUrduSharedPayload));
  const payload = await page.evaluate(() => window.__writeUrduSharedPayload);
  expect(payload.text).toBe('میرا خیال ہے');
  expect(payload.url).toBeUndefined();

  await clear.click();
  await expect(editor).toHaveValue('');
  await expect(share).toBeDisabled();
  await expect(copy).toBeDisabled();
  await expect(clear).toBeDisabled();

  const nextStep = page.locator('[data-wu-next-step-version="2"]');
  await editor.fill('ایک نئی تحریر');
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
  await expect(page.locator('main')).toContainText('Urdu & English Invoice Generator');
});

test('documentation includes all current ways to start with Urdu text', async ({ page }) => {
  await page.goto('/write-urdu-documentation');
  await expect(page.locator('main')).toContainText('Choose how your Urdu starts');
  await expect(page.locator('main')).toContainText('Speak Urdu');
  await expect(page.locator('main')).toContainText('Image to Urdu Text');
  await expect(page.locator('main')).toContainText('Convert older InPage text');
});
