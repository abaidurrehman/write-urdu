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
