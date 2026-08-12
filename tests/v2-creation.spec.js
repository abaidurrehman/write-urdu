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

test('Urdu Name Art uses a compact rail beside the live Card Studio workspace', async ({ page, isMobile }) => {
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
    const app = window.WriteUrduNameArtApp && window.WriteUrduNameArtApp.getFrameApp();
    const state = app && app.getState && app.getState();
    return state && state.templateId;
  }), { timeout: 10000 }).toBe(templateId);
  await expect(page.locator('[data-name-art-transparent]')).toBeVisible();
});
