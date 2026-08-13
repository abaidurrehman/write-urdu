const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());
async function open(page) {
  await blockExternalServices(page);
  await page.goto('/urdu-instagram-post-maker.html', { waitUntil:'domcontentloaded', timeout:15000 });
  await page.locator('body').waitFor({ state:'attached', timeout:10000 });
}

test('direct Instagram journey reaches a portrait-safe JPEG export', async ({ page, isMobile }) => {
  await open(page);
  const workspace = page.locator('[data-social-direct-workspace="instagram"]');
  const canvas = page.locator('#cardCanvas');
  const text = page.locator('#cardText');

  await expect(workspace).toBeVisible();
  await expect(page.locator('.social-maker-workspace iframe')).toHaveCount(0);
  await expect(canvas).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(
    window.WriteUrduSocialDirectApp && window.WriteUrduSocialDirectApp.mode === 'instagram' && window.WriteUrduSocialDirectApp.getWorkspaceApp()
  )), { timeout:20000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => {
    const app = window.WriteUrduSocialDirectApp.getWorkspaceApp();
    const c = app.getCanvas(); const state = app.getState();
    return [state.socialMode, state.presetId, c.width, c.height];
  })).toEqual(['instagram','square',1080,1080]);

  const postText = 'خوشی بانٹیں اور مسکراتے رہیں';
  await text.fill(postText);
  await expect.poll(() => page.evaluate(() => window.WriteUrduSocialDirectApp.getState().text.value)).toBe(postText);
  expect(page.url()).not.toContain(encodeURIComponent(postText));

  await page.locator('[data-instagram-preset="portrait"]').click();
  await expect(page.locator('[data-instagram-preset="portrait"]')).toHaveAttribute('aria-pressed','true');
  await expect.poll(() => page.evaluate(() => {
    const app = window.WriteUrduSocialDirectApp.getWorkspaceApp();
    const c = app.getCanvas(); const state = app.getState();
    return [state.presetId, c.width, c.height];
  })).toEqual(['portrait',1080,1350]);
  expect(await page.evaluate(() => window.WriteUrduSocialMaker.getSafeArea('instagram', { id:'portrait', width:1080, height:1350 }))).toEqual({ top:120, right:90, bottom:150, left:90 });
  await expect(page.locator('[data-card-safe-area]')).toBeVisible();

  await page.locator('[data-social-export-format]').selectOption('jpeg');
  await page.locator('[data-social-jpeg-quality]').fill('0.88');
  await expect(page.locator('[data-social-quality-value]')).toHaveText('88%');
  await expect(page.locator('[data-card-action="download"]')).toHaveText('Download JPEG');
  await expect(page.locator('[data-social-caption]')).toHaveText('Copy caption text');

  const positions = await page.evaluate(() => {
    const task = document.querySelector('.social-maker-direct-task').getBoundingClientRect();
    const preview = document.querySelector('.social-maker-direct-preview').getBoundingClientRect();
    const refine = document.querySelector('.social-maker-direct-refine').getBoundingClientRect();
    return { taskTop:task.top, previewTop:preview.top, refineTop:refine.top, overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth };
  });
  expect(positions.overflow).toBeLessThanOrEqual(1);
  if (isMobile) {
    expect(positions.taskTop).toBeLessThan(positions.previewTop);
    expect(positions.previewTop).toBeLessThan(positions.refineTop);
  }

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout:15000 }),
    page.locator('[data-card-action="download"]').click()
  ]);
  expect(download.suggestedFilename()).toMatch(/^urdu-instagram-post-.*\.jpg$/i);
  await expect(canvas).toBeVisible();
});
