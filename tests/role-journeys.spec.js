const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function open(page, route) {
  await blockExternalServices(page);
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached', timeout: 10000 });
}

test('direct Name Art journey starts with the name and reaches a useful export', async ({ page, isMobile }) => {
  await page.addInitScript(() => {
    window.fetch = async url => {
      const value = new URL(url).searchParams.get('text');
      return { ok: true, json: async () => ['SUCCESS', [[value, ['عائشہ']]]] };
    };
  });
  await open(page, '/urdu-name-art-maker.html');

  const name = page.locator('#nameArtText');
  const status = page.locator('[data-name-art-status]');
  const workspace = page.locator('.name-art-workspace');
  const styles = page.locator('.name-art-style-picker');
  const canvas = page.locator('.name-art-workspace #cardCanvas');
  await expect(name).toBeVisible();
  await expect(page.locator('[data-name-art-purpose]')).toHaveCount(4);
  await expect(page.locator('.name-art-template-preview')).toHaveCount(24);
  await expect(page.locator('.name-art-workspace iframe')).toHaveCount(0);
  await expect(canvas).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => Boolean(
    window.WriteUrduNameArtApp && window.WriteUrduNameArtApp.getWorkspaceApp && window.WriteUrduNameArtApp.getWorkspaceApp()
  )), { timeout: 20000 }).toBe(true);

  const initialText = await page.evaluate(() => window.WriteUrduNameArtApp.getWorkspaceApp().getState().text.value);
  expect(initialText).toBe('');
  await page.locator('[data-name-art-download]').click();
  await expect(status).toContainText('Add your name or short Urdu text first');
  await expect(name).toBeFocused();

  await name.fill('Ayesha');
  await page.locator('[data-name-art-convert]').click();
  await expect(name).toHaveValue('عائشہ');
  await expect(status).toContainText('Converted to Urdu script');
  await expect.poll(() => page.evaluate(() => window.WriteUrduNameArtApp.getWorkspaceApp().getState().text.value)).toBe('عائشہ');

  await page.locator('[data-name-art-purpose="story"]').click();
  await expect(page.locator('[data-name-art-purpose="story"]')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => {
    const app = window.WriteUrduNameArtApp && window.WriteUrduNameArtApp.getWorkspaceApp();
    const directCanvas = app && app.getCanvas();
    return app && directCanvas ? [app.getState().presetId, directCanvas.width, directCanvas.height] : null;
  })).toEqual(['story', 1080, 1920]);

  const positions = await page.evaluate(() => {
    const quick = document.querySelector('.name-art-shortcuts').getBoundingClientRect();
    const work = document.querySelector('.name-art-workspace').getBoundingClientRect();
    const style = document.querySelector('.name-art-style-picker').getBoundingClientRect();
    return { quickTop: quick.top, workTop: work.top, styleTop: style.top, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  expect(positions.overflow).toBeLessThanOrEqual(1);
  if (isMobile) {
    expect(positions.quickTop).toBeLessThan(positions.workTop);
    expect(positions.workTop).toBeLessThan(positions.styleTop);
  }

  const firstTemplate = page.locator('[data-name-art-template]').first();
  await firstTemplate.click();
  await expect(firstTemplate).toHaveAttribute('aria-pressed', 'true');
  const download = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.locator('[data-name-art-download]').click()
  ]);
  expect(download[0].suggestedFilename()).toMatch(/\.png$/i);
  expect(page.url()).not.toContain('عائشہ');
  await expect(workspace).toBeVisible();
  await expect(canvas).toBeVisible();
  await expect(styles).toBeVisible();
});

test('direct WhatsApp Status journey reaches a status-safe JPEG export', async ({ page, isMobile }) => {
  await open(page, '/urdu-whatsapp-status-maker.html');

  const workspace = page.locator('[data-social-direct-workspace="whatsapp"]');
  const canvas = page.locator('#cardCanvas');
  const text = page.locator('#cardText');
  await expect(workspace).toBeVisible();
  await expect(page.locator('.social-maker-workspace iframe')).toHaveCount(0);
  await expect(canvas).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(
    window.WriteUrduSocialDirectApp && window.WriteUrduSocialDirectApp.getWorkspaceApp()
  )), { timeout: 20000 }).toBe(true);

  await expect.poll(() => page.evaluate(() => {
    const app = window.WriteUrduSocialDirectApp.getWorkspaceApp();
    const c = app.getCanvas(); const state = app.getState();
    return [state.socialMode, state.presetId, c.width, c.height];
  })).toEqual(['whatsapp', 'story', 1080, 1920]);
  expect(await page.evaluate(() => window.WriteUrduSocialMaker.getSafeArea('whatsapp', { id:'story', width:1080, height:1920 }))).toEqual({ top:230, right:100, bottom:290, left:100 });
  await expect(page.locator('[data-card-safe-area]')).toBeVisible();

  const statusText = 'آج خوشی کا دن ہے';
  await text.fill(statusText);
  await expect.poll(() => page.evaluate(() => window.WriteUrduSocialDirectApp.getState().text.value)).toBe(statusText);
  expect(page.url()).not.toContain(encodeURIComponent(statusText));

  await page.locator('[data-social-export-format]').selectOption('jpeg');
  await page.locator('[data-social-jpeg-quality]').fill('0.82');
  await expect(page.locator('[data-social-quality-wrap]')).toBeVisible();
  await expect(page.locator('[data-social-quality-value]')).toHaveText('82%');
  await expect(page.locator('[data-card-action="download"]')).toHaveText('Download JPEG');

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

  const download = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.locator('[data-card-action="download"]').click()
  ]);
  expect(download[0].suggestedFilename()).toMatch(/^urdu-whatsapp-status-.*\.jpg$/i);
  await expect(canvas).toBeVisible();
});
