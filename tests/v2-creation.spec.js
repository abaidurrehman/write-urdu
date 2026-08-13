const { test, expect } = require('@playwright/test');

const blockNonVisualServices = page => Promise.all([
  page.route(/google_jsapi\.js/, route => route.continue()),
  page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort())
]);

async function open(page, route) {
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached', timeout: 10000 });
}

test('Card Studio uses the v2 creation hierarchy without changing its editing contract', async ({ page, isMobile }) => {
  await blockNonVisualServices(page);
  await open(page, '/urdu-card-studio.html');

  const root = page.locator('[data-card-studio]');
  await expect(root).toHaveAttribute('data-v2-creation-workspace', 'card-studio');
  await expect(page.locator('body')).toHaveClass(/wu-v2-shell/);
  await expect(page.locator('link[href$="css/v2-creation.css"]')).toHaveCount(1);
  await expect(page.locator('.card-studio-preview')).toBeVisible();
  await expect(page.locator('.card-studio-panel')).toBeVisible();
  await expect(page.locator('.seo-content')).toBeVisible();

  const metrics = await page.evaluate(() => {
    const preview = document.querySelector('.card-studio-preview').getBoundingClientRect();
    const panel = document.querySelector('.card-studio-panel').getBoundingClientRect();
    const supporting = document.querySelector('.seo-content').getBoundingClientRect();
    return {
      previewTop: preview.top,
      previewWidth: preview.width,
      panelTop: panel.top,
      panelWidth: panel.width,
      supportingTop: supporting.top,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  expect(metrics.overflow).toBeLessThanOrEqual(1);
  expect(metrics.previewTop).toBeLessThan(metrics.supportingTop);
  if (isMobile) {
    expect(metrics.previewTop).toBeLessThan(metrics.panelTop);
  } else {
    expect(metrics.previewWidth).toBeGreaterThan(metrics.panelWidth * 1.5);
    expect(Math.abs(metrics.previewTop - metrics.panelTop)).toBeLessThan(90);
  }

  await page.locator('#cardText').fill('سلام دنیا');
  await page.locator('.card-studio-step[data-card-step="format"]').click();
  await page.locator('[data-card-use-case="story"]').click();
  await expect.poll(() => page.evaluate(() => {
    const state = window.WriteUrduCardStudioApp && window.WriteUrduCardStudioApp.getState();
    return state && [state.presetId, state.templateId, state.text.value].join('|');
  })).toContain('story|midnight|سلام دنیا');
  await expect(page.locator('[data-card-action="download"]').first()).toBeVisible();
});

test('Template Library is a v2 browse-to-edit journey into Card Studio', async ({ page }) => {
  await blockNonVisualServices(page);
  await open(page, '/urdu-templates.html');

  const root = page.locator('[data-template-library]');
  await expect(root).toHaveAttribute('data-v2-creation-workspace', 'templates');
  await expect(page.locator('body')).toHaveClass(/wu-v2-shell/);
  await expect(page.locator('link[href$="css/v2-creation.css"]')).toHaveCount(1);
  await expect(page.locator('[data-template-grid] .template-card')).toHaveCount(46);
  await expect(page.locator('[data-template-hero-actions] .template-hero-action.primary')).toHaveText('Start a blank card');

  const firstOpen = page.locator('[data-template-grid] [data-template-open]').first();
  await expect(firstOpen).toHaveText('Edit in Card Studio');
  const slug = await firstOpen.getAttribute('data-template-open');
  expect(slug).toBeTruthy();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await firstOpen.click();
  await expect(page).toHaveURL(new RegExp('/urdu-card-studio\\?template=' + slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  await expect.poll(() => page.evaluate(() => {
    const state = window.WriteUrduCardStudioApp && window.WriteUrduCardStudioApp.getState();
    return state && state.libraryTemplateId;
  })).not.toBeFalsy();
  await expect(page.locator('[data-card-library-template]')).toBeVisible();
});

test('Stylish Urdu Text uses a results-first v2 creation hierarchy', async ({ page, isMobile }) => {
  await blockNonVisualServices(page);
  await open(page, '/stylish-urdu-text-generator.html');

  const root = page.locator('[data-stylish-generator]');
  await expect(root).toHaveAttribute('data-v2-creation-workspace', 'stylish-text');
  await expect(page.locator('body')).toHaveClass(/wu-v2-shell/);
  await expect(page.locator('link[href$="css/v2-creation.css"]')).toHaveCount(1);
  await expect(page.locator('link[href$="css/v2-creation-tools.css"]')).toHaveCount(1);
  await expect(page.locator('[data-stylish-results] .stylish-card')).toHaveCount(24);

  const metrics = await page.evaluate(() => {
    const panel = document.querySelector('.stylish-panel').getBoundingClientRect();
    const filters = document.querySelector('.stylish-filterbar').getBoundingClientRect();
    const results = document.querySelector('.stylish-main > section[aria-labelledby="stylish-results-title"]').getBoundingClientRect();
    const supporting = document.querySelector('.stylish-seo').getBoundingClientRect();
    return {
      panelTop: panel.top,
      panelWidth: panel.width,
      filterTop: filters.top,
      resultTop: results.top,
      resultWidth: results.width,
      supportingTop: supporting.top,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  expect(metrics.overflow).toBeLessThanOrEqual(1);
  expect(metrics.resultTop).toBeLessThan(metrics.supportingTop);
  if (isMobile) {
    expect(metrics.resultTop).toBeGreaterThan(metrics.panelTop);
  } else {
    expect(metrics.resultWidth).toBeGreaterThan(metrics.panelWidth * 1.5);
    expect(Math.abs(metrics.filterTop - metrics.panelTop)).toBeLessThan(90);
  }

  await page.locator('[data-stylish-category]').selectOption('popular');
  await expect(page.locator('[data-stylish-count]')).toHaveText('31 styles ready');
  await expect(page.locator('[data-stylish-results] .stylish-card')).toHaveCount(24);
  const firstCard = page.locator('[data-stylish-results] .stylish-card').first();
  await expect(firstCard.getByRole('button', { name: 'Copy' })).toBeVisible();
  await expect(firstCard.getByRole('button', { name: 'Share' })).toBeVisible();
  await expect(firstCard.getByRole('button', { name: 'Name Art' })).toBeVisible();
});

test('Urdu Name Art uses a compact rail beside its direct live canvas', async ({ page, isMobile }) => {
  await blockNonVisualServices(page);
  await open(page, '/urdu-name-art-maker.html');

  const root = page.locator('[data-name-art]');
  await expect(root).toHaveAttribute('data-v2-creation-workspace', 'name-art');
  await expect(page.locator('body')).toHaveClass(/wu-v2-shell/);
  await expect(page.locator('link[href$="css/v2-creation.css"]')).toHaveCount(1);
  await expect(page.locator('link[href$="css/v2-creation-tools.css"]')).toHaveCount(1);
  await expect(page.locator('[data-name-art-templates] [data-name-art-template]')).toHaveCount(24);
  await expect(page.locator('[data-name-art-preset] option')).toHaveCount(6);
  await expect(page.locator('[data-name-art-status]')).toContainText('ready', { timeout: 20000 });
  await expect(page.locator('.name-art-workspace iframe')).toHaveCount(0);
  await expect(page.locator('.name-art-workspace #cardCanvas')).toBeVisible();

  const metrics = await page.evaluate(() => {
    const shortcuts = document.querySelector('.name-art-shortcuts').getBoundingClientRect();
    const workspace = document.querySelector('.name-art-workspace').getBoundingClientRect();
    const guidance = document.querySelector('.name-art-guidance').getBoundingClientRect();
    return {
      railTop: shortcuts.top,
      railWidth: shortcuts.width,
      workspaceTop: workspace.top,
      workspaceWidth: workspace.width,
      guidanceTop: guidance.top,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  expect(metrics.overflow).toBeLessThanOrEqual(1);
  expect(metrics.workspaceTop).toBeLessThan(metrics.guidanceTop);
  if (isMobile) {
    expect(metrics.workspaceTop).toBeGreaterThan(metrics.railTop);
  } else {
    expect(metrics.workspaceWidth).toBeGreaterThan(metrics.railWidth * 1.5);
    expect(Math.abs(metrics.workspaceTop - metrics.railTop)).toBeLessThan(90);
  }

  const template = page.locator('[data-name-art-template]').nth(1);
  const templateId = await template.getAttribute('data-name-art-template');
  expect(templateId).toBeTruthy();
  await template.click();
  await expect.poll(() => page.evaluate(() => {
    const app = window.WriteUrduNameArtApp && window.WriteUrduNameArtApp.getWorkspaceApp();
    const state = app && app.getState && app.getState();
    return state && state.templateId;
  }), { timeout: 10000 }).toBe(templateId);
  await expect(page.locator('[data-name-art-transparent]')).toBeVisible();
});

test('Social makers use the v2 shell while preserving Card Studio social-mode state', async ({ page, isMobile }) => {
  await blockNonVisualServices(page);
  const cases = [
    { route: '/urdu-whatsapp-status-maker.html', marker: 'social-whatsapp', mode: 'whatsapp', preset: 'story' },
    { route: '/urdu-instagram-post-maker.html', marker: 'social-instagram', mode: 'instagram', preset: 'square' }
  ];

  for (const item of cases) {
    await open(page, item.route);
    await expect(page.locator('body')).toHaveClass(/wu-v2-shell/);
    await expect(page.locator('[data-v2-creation-workspace]')).toHaveAttribute('data-v2-creation-workspace', item.marker);
    await expect(page.locator('link[href$="css/v2-publish-tools.css"]')).toHaveCount(1);
    await expect(page.locator('.wu-footer')).toBeVisible();
    await expect(page.locator('.social-maker-workspace')).toBeVisible();
    await expect(page.locator('[data-wu-ad-boundary="post-workspace"]')).toBeVisible();

    await expect.poll(() => page.locator('.social-maker-frame').evaluate(frame => {
      const app = frame.contentWindow && frame.contentWindow.WriteUrduCardStudioApp;
      const state = app && app.getState && app.getState();
      return state && `${state.socialMode}|${state.presetId}`;
    }), { timeout: 20000 }).toBe(`${item.mode}|${item.preset}`);

    const metrics = await page.evaluate(() => {
      const workspace = document.querySelector('.social-maker-workspace').getBoundingClientRect();
      const guidance = document.querySelector('.social-maker-guidance').getBoundingClientRect();
      return {
        workspaceTop: workspace.top,
        workspaceHeight: workspace.height,
        guidanceTop: guidance.top,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(metrics.overflow).toBeLessThanOrEqual(1);
    expect(metrics.workspaceTop).toBeLessThan(metrics.guidanceTop);
    if (!isMobile) expect(metrics.workspaceHeight).toBeGreaterThan(500);

    if (item.mode === 'whatsapp') {
      const safe = await page.locator('.social-maker-frame').evaluate(frame => frame.contentWindow.WriteUrduSocialMaker.getSafeArea('whatsapp', { id: 'story', width: 1080, height: 1920 }));
      expect(safe).toEqual({ top: 230, right: 100, bottom: 290, left: 100 });
    } else {
      const safe = await page.locator('.social-maker-frame').evaluate(frame => frame.contentWindow.WriteUrduSocialMaker.getSafeArea('instagram', { id: 'portrait', width: 1080, height: 1350 }));
      expect(safe).toEqual({ top: 120, right: 90, bottom: 150, left: 90 });
    }
  }
});

test('QR Generator uses a preview-first v2 hierarchy and keeps payload validation intact', async ({ page, isMobile }) => {
  await blockNonVisualServices(page);
  await open(page, '/qr-code-generator.html');

  await expect(page.locator('body')).toHaveClass(/wu-v2-shell/);
  await expect(page.locator('[data-qr-generator]')).toHaveAttribute('data-v2-creation-workspace', 'qr-generator');
  await expect(page.locator('link[href$="css/v2-publish-tools.css"]')).toHaveCount(1);
  await expect(page.locator('.qr-preview')).toBeVisible();
  await expect(page.locator('.qr-panel')).toBeVisible();
  await expect(page.locator('[data-wu-ad-boundary="post-workspace"]')).toBeVisible();

  const metrics = await page.evaluate(() => {
    const preview = document.querySelector('.qr-preview').getBoundingClientRect();
    const panel = document.querySelector('.qr-panel').getBoundingClientRect();
    const supporting = document.querySelector('.seo-content').getBoundingClientRect();
    return {
      previewTop: preview.top,
      previewWidth: preview.width,
      panelTop: panel.top,
      panelWidth: panel.width,
      supportingTop: supporting.top,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  expect(metrics.overflow).toBeLessThanOrEqual(1);
  expect(metrics.previewTop).toBeLessThan(metrics.supportingTop);
  if (isMobile) {
    expect(metrics.previewTop).toBeLessThan(metrics.panelTop);
  } else {
    expect(metrics.previewWidth).toBeGreaterThan(metrics.panelWidth * 1.5);
    expect(Math.abs(metrics.previewTop - metrics.panelTop)).toBeLessThan(90);
  }

  await page.locator('[data-qr-type]').selectOption('url');
  const urlField = page.locator('[data-qr-field="url"]');
  await urlField.fill('not a url');
  await expect(page.locator('[data-qr-download-png]')).toBeDisabled();
  await expect(page.locator('.qr-field-error')).toBeVisible();

  await page.locator('[data-qr-type]').selectOption('text');
  const textField = page.locator('[data-qr-field="text"]');
  await textField.fill('سلام دنیا');
  await expect(page.locator('[data-qr-download-png]')).toBeEnabled();
  await expect(page.locator('[data-qr-download-svg]')).toBeEnabled();
  await expect(page.locator('[data-qr-payload]')).toContainText('سلام دنیا');
});
