const { test, expect } = require('@playwright/test');

const block = page => Promise.all([
  page.route(/google_jsapi\.js/, route => route.continue()),
  page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort())
]);
async function open(page, route) {
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached', timeout: 10000 });
}

test('Card Studio keeps dominant preview and guided editing behavior', async ({ page, isMobile }) => {
  await block(page); await open(page, '/urdu-card-studio.html');
  await expect(page.locator('link[href$="css/v2-creation.css"]')).toHaveCount(1);
  await expect(page.locator('.seo-content')).toBeVisible();
  const metrics = await page.evaluate(() => {
    const preview = document.querySelector('.card-studio-preview').getBoundingClientRect();
    const panel = document.querySelector('.card-studio-panel').getBoundingClientRect();
    const supporting = document.querySelector('.seo-content').getBoundingClientRect();
    return { previewTop:preview.top, previewWidth:preview.width, panelTop:panel.top, panelWidth:panel.width, supportingTop:supporting.top };
  });
  expect(metrics.previewTop).toBeLessThan(metrics.supportingTop);
  if (isMobile) expect(metrics.previewTop).toBeLessThan(metrics.panelTop);
  else {
    expect(metrics.previewWidth).toBeGreaterThan(metrics.panelWidth * 1.5);
    expect(Math.abs(metrics.previewTop - metrics.panelTop)).toBeLessThan(90);
  }
  await page.locator('#cardText').fill('سلام دنیا');
  await page.locator('.card-studio-step[data-card-step="format"]').click();
  await page.locator('[data-card-use-case="story"]').click();
  await expect.poll(() => page.evaluate(() => {
    const s = window.WriteUrduCardStudioApp && window.WriteUrduCardStudioApp.getState();
    return s && `${s.presetId}|${s.templateId}|${s.text.value}`;
  })).toContain('story|midnight|سلام دنیا');
});

test('Template Library still hands a selected design into Card Studio', async ({ page }) => {
  await block(page); await open(page, '/urdu-templates.html');
  await expect(page.locator('[data-template-grid] .template-card')).toHaveCount(46);
  await expect(page.locator('[data-template-hero-actions] .template-hero-action.primary')).toHaveText('Start a blank card');
  const first = page.locator('[data-template-grid] [data-template-open]').first();
  await expect(first).toHaveText('Use this template');
  const slug = await first.getAttribute('data-template-open');
  await first.click();
  await expect(page).toHaveURL(new RegExp('/urdu-card-studio\\?template=' + slug));
  await expect.poll(() => page.evaluate(() => window.WriteUrduCardStudioApp && window.WriteUrduCardStudioApp.getState().libraryTemplateId)).not.toBeFalsy();
  await expect(page.locator('[data-card-library-template]')).toBeVisible();
});

test('Stylish Urdu filtering and result actions remain intact', async ({ page }) => {
  await block(page); await open(page, '/stylish-urdu-text-generator.html');
  await expect(page.locator('[data-stylish-results] .stylish-card')).toHaveCount(24);
  await page.locator('[data-stylish-category]').selectOption('popular');
  await expect(page.locator('[data-stylish-count]')).toHaveText('31 styles ready');
  const first = page.locator('[data-stylish-results] .stylish-card').first();
  await expect(first.getByRole('button', { name:'Copy' })).toBeVisible();
  await expect(first.getByRole('button', { name:'Share' })).toBeVisible();
  await expect(first.getByRole('button', { name:'Name Art' })).toBeVisible();
});

test('Instagram direct mode keeps its adaptive safe-area contract', async ({ page }) => {
  await block(page); await open(page, '/urdu-instagram-post-maker.html');
  await expect(page.locator('.social-maker-workspace iframe')).toHaveCount(0);
  await expect(page.locator('#cardCanvas')).toBeVisible();
  expect(await page.evaluate(() => window.WriteUrduSocialMaker.getSafeArea('instagram', { id:'square', width:1080, height:1080 }))).toEqual({ top:90, right:90, bottom:90, left:90 });
  expect(await page.evaluate(() => window.WriteUrduSocialMaker.getSafeArea('instagram', { id:'portrait', width:1080, height:1350 }))).toEqual({ top:120, right:90, bottom:150, left:90 });
  expect(await page.evaluate(() => window.WriteUrduSocialMaker.getSafeArea('instagram', { id:'story', width:1080, height:1920 }))).toEqual({ top:230, right:100, bottom:290, left:100 });
});

test('QR Generator still rejects invalid URLs and accepts Urdu text', async ({ page }) => {
  await block(page); await open(page, '/qr-code-generator.html');
  await page.locator('[data-qr-type]').selectOption('url');
  await page.locator('[data-qr-field="url"]').fill('not a url');
  await expect(page.locator('[data-qr-download-png]')).toBeDisabled();
  await expect(page.locator('.qr-field-error')).toBeVisible();
  await page.locator('[data-qr-type]').selectOption('text');
  await page.locator('[data-qr-field="text"]').fill('سلام دنیا');
  await expect(page.locator('[data-qr-download-png]')).toBeEnabled();
  await expect(page.locator('[data-qr-download-svg]')).toBeEnabled();
  await expect(page.locator('[data-qr-payload]')).toContainText('سلام دنیا');
});