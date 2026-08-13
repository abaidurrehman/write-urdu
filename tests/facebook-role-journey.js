const { test, expect } = require('@playwright/test');

async function open(page) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());
  await page.goto('/urdu-card-studio.html?role=facebook', { waitUntil:'domcontentloaded', timeout:15000 });
}

test('Facebook role exports a direct 1200x630 JPEG', async ({ page, isMobile }) => {
  await open(page);
  const root = page.locator('[data-card-studio]');
  const canvas = page.locator('#cardCanvas');
  await expect(root).toHaveAttribute('data-card-role-mode', 'facebook');
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(canvas).toBeVisible();
  await expect(page.locator('[data-card-role-entry="facebook"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#cardPreset')).toBeDisabled();
  await expect(page.locator('body')).not.toHaveClass(/social-maker-embedded/);

  await expect.poll(() => page.evaluate(() => {
    const app = window.WriteUrduCardStudioApp;
    const c = app && app.getCanvas(); const s = app && app.getState();
    return s && c ? [s.socialMode, s.presetId, c.width, c.height] : null;
  }), { timeout:20000 }).toEqual(['facebook','facebook',1200,630]);
  expect(await page.evaluate(() => window.WriteUrduSocialMaker.getSafeArea('facebook', { id:'facebook', width:1200, height:630 }))).toEqual({ top:70, right:96, bottom:70, left:96 });
  await expect(page.locator('[data-card-safe-area]')).toBeVisible();

  const postText = 'آج ہماری نئی پیشکش دیکھیں';
  await page.locator('#cardText').fill(postText);
  await expect.poll(() => page.evaluate(() => window.WriteUrduCardStudioApp.getState().text.value)).toBe(postText);
  expect(page.url()).not.toContain(encodeURIComponent(postText));

  await expect(page.locator('[data-social-export-format]')).toBeHidden();
  await page.locator('.card-studio-stepper [data-card-step="export"]').click();
  await expect(page.locator('[data-social-export-format]')).toBeVisible();
  await page.locator('[data-social-export-format]').selectOption('jpeg');
  await page.locator('[data-social-jpeg-quality]').fill('0.86');
  await expect(page.locator('[data-social-quality-value]')).toHaveText('86%');
  const downloadButton = page.locator('.card-studio-export-section [data-card-action="download"]');
  await expect(downloadButton).toHaveText('Download JPEG');

  const metrics = await page.evaluate(() => {
    const p = document.querySelector('.card-studio-preview').getBoundingClientRect();
    const c = document.querySelector('.card-studio-panel').getBoundingClientRect();
    return [p.top,p.width,c.top,c.width,document.documentElement.scrollWidth-document.documentElement.clientWidth];
  });
  expect(metrics[4]).toBeLessThanOrEqual(1);
  if (isMobile) expect(metrics[0]).toBeLessThan(metrics[2]);
  else expect(metrics[1]).toBeGreaterThan(metrics[3] * 1.5);

  const [download] = await Promise.all([page.waitForEvent('download'), downloadButton.click()]);
  expect(download.suggestedFilename()).toMatch(/^urdu-facebook-post-.*\.jpg$/i);
});
