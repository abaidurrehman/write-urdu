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
  let publishBody = '';
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async payload => { window.__writeUrduSharedPayload = payload; }
    });
  });
  await page.route('**/api/shares', async route => {
    const request = route.request();
    if (request.method() !== 'POST') return route.continue();
    publishBody = request.postDataBuffer() ? request.postDataBuffer().toString('utf8') : '';
    const origin = new URL(request.url()).origin;
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        id: 'Ab12Cd34',
        url: `${origin}/s/Ab12Cd34`,
        manageToken: 'test-management-token'
      })
    });
  });

  await page.goto('/');
  await waitForConvergence(page);
  await waitForBasicToolbar(page);

  const editor = page.locator('#transliterateTextarea');
  const surface = page.locator('[data-wu-basic-command-surface]');
  const toolbar = page.locator('.home-actions[data-wu-basic-command-toolbar]');
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
  await expect(share).toHaveText('Share');
  await expect(copy).toHaveText('Copy');

  const compact = await page.evaluate(() => window.matchMedia('(max-width: 767px)').matches);
  const outputs = ['pdf', 'word', 'png', 'preview', 'print'];
  const outputLabels = { pdf: 'PDF', word: 'Word', png: 'PNG', preview: 'Preview', print: 'Print' };
  if (compact) {
    await expect(toolbar.locator('[data-wu-basic-output-group]')).toBeHidden();
    const toggle = toolbar.locator('[data-wu-basic-more-toggle]');
    await toggle.click();
    const panel = toolbar.locator('[data-wu-basic-more-panel]');
    await expect(panel).toBeVisible();
    for (const action of outputs) {
      const control = panel.locator(`[data-wu-command-action="${action}"]`);
      await expect(control).toBeVisible();
      await expect(control).toHaveText(outputLabels[action]);
    }
  } else {
    await expect(toolbar.locator('[data-wu-basic-output-group]')).toBeVisible();
    for (const action of outputs) {
      const control = toolbar.locator(`[data-wu-command-action="${action}"]`);
      await expect(control).toBeVisible();
      await expect(control).toHaveText(outputLabels[action]);
    }
  }

  const moreToggle = toolbar.locator('[data-wu-basic-more-toggle]');
  if (await moreToggle.getAttribute('aria-expanded') !== 'true') await moreToggle.click();
  const morePanel = toolbar.locator('[data-wu-basic-more-panel]');
  await expect(morePanel).toBeVisible();
  await expect(morePanel.locator('#inputFileNameToSaveAs')).toBeVisible();
  await expect(morePanel.getByText('Text file', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(morePanel).toBeHidden();

  await share.click();
  const publishDialog = page.locator('.wu-share-dialog');
  await expect(publishDialog).toBeVisible();
  await expect(publishDialog).toContainText('write-urdu.com/s/');
  await expect(publishDialog).toContainText('Publish & get short link');
  expect(publishBody).toBe('');
  expect(await page.evaluate(() => window.__writeUrduSharedPayload || null)).toBeNull();

  await publishDialog.locator('[data-wu-basic-publish-confirm]').click();
  const shortUrl = `${new URL(page.url()).origin}/s/Ab12Cd34`;
  await expect(publishDialog.locator('[data-wu-share-url]')).toHaveValue(shortUrl, { timeout: 10000 });
  expect(publishBody).toContain('name="source_tool"');
  expect(publishBody).toContain('basic_editor');
  expect(publishBody).toContain('name="public_text"');
  expect(publishBody).toContain('name="image"');

  await publishDialog.locator('[data-wu-share-native]').click();
  await page.waitForFunction(() => Boolean(window.__writeUrduSharedPayload));
  const payload = await page.evaluate(() => window.__writeUrduSharedPayload);
  expect(payload.url).toBe(shortUrl);
  expect(payload.text).toBe('Open this Urdu writing on Write Urdu.');
  expect(payload.text).not.toContain('میرا خیال ہے');

  await publishDialog.locator('[data-wu-share-close]').click();
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

test('phone outcome navigation and Basic Writer toolbar stay inside the viewport', async ({ page }) => {
  await page.goto('/');
  await waitForConvergence(page);
  await waitForBasicToolbar(page);

  const phone = await page.evaluate(() => window.matchMedia('(max-width: 560px)').matches);
  if (!phone) return;

  const menuToggle = page.locator('.wu-menu-toggle');
  const nav = page.locator('[data-wu-outcome-nav="v2"]');
  await menuToggle.click();
  await expect(nav).toBeVisible();

  const create = nav.locator('[data-wu-nav-group="create"]');
  const createSummary = create.locator('summary');
  const createPanel = create.locator('.wu-outcome-menu-panel');
  const workSummary = nav.locator('[data-wu-nav-group="work"] > summary');
  await createSummary.click();
  await expect(create).toHaveAttribute('open', '');
  await expect(createPanel).toBeVisible();

  const geometry = await page.evaluate(() => {
    const navNode = document.querySelector('[data-wu-outcome-nav="v2"]');
    const createNode = document.querySelector('[data-wu-nav-group="create"]');
    const summary = createNode && createNode.querySelector('summary');
    const panel = createNode && createNode.querySelector('.wu-outcome-menu-panel');
    const work = document.querySelector('[data-wu-nav-group="work"] > summary');
    const navRect = navNode.getBoundingClientRect();
    const summaryRect = summary.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const workRect = work.getBoundingClientRect();
    const navStyle = getComputedStyle(navNode);
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pageScrollWidth: document.documentElement.scrollWidth,
      navLeft: navRect.left,
      navRight: navRect.right,
      navHeight: navRect.height,
      navClientHeight: navNode.clientHeight,
      navScrollHeight: navNode.scrollHeight,
      navOverflowY: navStyle.overflowY,
      summaryHeight: summaryRect.height,
      summaryBottom: summaryRect.bottom,
      panelTop: panelRect.top,
      panelBottom: panelRect.bottom,
      workTop: workRect.top
    };
  });

  expect(geometry.pageScrollWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(geometry.navLeft).toBeGreaterThanOrEqual(-1);
  expect(geometry.navRight).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(geometry.navHeight).toBeLessThanOrEqual(geometry.viewportHeight);
  expect(geometry.navOverflowY).toBe('auto');
  expect(geometry.summaryHeight).toBeLessThan(70);
  expect(geometry.panelTop).toBeGreaterThanOrEqual(geometry.summaryBottom - 1);
  expect(geometry.workTop).toBeGreaterThanOrEqual(geometry.panelBottom - 1);
  expect(geometry.navScrollHeight).toBeGreaterThanOrEqual(geometry.navClientHeight);

  await menuToggle.click();
  await expect(nav).toBeHidden();

  const editor = page.locator('#transliterateTextarea');
  await editor.fill('ایک موبائل تحریر');
  const toolbarGeometry = await page.evaluate(() => {
    const surface = document.querySelector('[data-wu-basic-command-surface]');
    const share = document.querySelector('[data-wu-command-action="share"]');
    const copy = document.querySelector('[data-wu-command-action="copy"]');
    const surfaceRect = surface.getBoundingClientRect();
    const shareRect = share.getBoundingClientRect();
    const copyRect = copy.getBoundingClientRect();
    return {
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      surfaceLeft: surfaceRect.left,
      surfaceRight: surfaceRect.right,
      shareLeft: shareRect.left,
      copyRight: copyRect.right
    };
  });
  expect(toolbarGeometry.scrollWidth).toBeLessThanOrEqual(toolbarGeometry.width + 1);
  expect(toolbarGeometry.surfaceLeft).toBeGreaterThanOrEqual(-1);
  expect(toolbarGeometry.surfaceRight).toBeLessThanOrEqual(toolbarGeometry.width + 1);
  expect(toolbarGeometry.shareLeft).toBeGreaterThanOrEqual(-1);
  expect(toolbarGeometry.copyRight).toBeLessThanOrEqual(toolbarGeometry.width + 1);
  await expect(page.locator('[data-wu-command-action="share"]')).toBeVisible();
  await expect(page.locator('[data-wu-command-action="copy"]')).toBeVisible();
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
