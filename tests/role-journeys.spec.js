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
  await expect(name).toBeVisible();
  await expect(page.locator('[data-name-art-purpose]')).toHaveCount(4);
  await expect(page.locator('.name-art-template-preview')).toHaveCount(24);
  await expect.poll(() => page.evaluate(() => Boolean(
    window.WriteUrduNameArtApp && window.WriteUrduNameArtApp.getFrameApp && window.WriteUrduNameArtApp.getFrameApp()
  )), { timeout: 20000 }).toBe(true);

  const initialText = await page.locator('[data-name-art-frame]').evaluate(frame => {
    const app = frame.contentWindow && frame.contentWindow.WriteUrduCardStudioApp;
    return app && app.getState().text.value;
  });
  expect(initialText).toBe('');

  await page.locator('[data-name-art-download]').click();
  await expect(status).toContainText('Add your name or short Urdu text first');
  await expect(name).toBeFocused();

  await name.fill('Ayesha');
  await page.locator('[data-name-art-convert]').click();
  await expect(name).toHaveValue('عائشہ');
  await expect(status).toContainText('Converted to Urdu script');
  await expect.poll(() => page.locator('[data-name-art-frame]').evaluate(frame => {
    const app = frame.contentWindow && frame.contentWindow.WriteUrduCardStudioApp;
    return app && app.getState().text.value;
  })).toBe('عائشہ');

  await page.locator('[data-name-art-purpose="story"]').click();
  await expect(page.locator('[data-name-art-purpose="story"]')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.locator('[data-name-art-frame]').evaluate(frame => {
    const app = frame.contentWindow && frame.contentWindow.WriteUrduCardStudioApp;
    const canvas = app && app.getCanvas();
    return app && canvas ? [app.getState().presetId, canvas.width, canvas.height] : null;
  })).toEqual(['story', 1080, 1920]);

  const positions = await page.evaluate(() => {
    const quick = document.querySelector('.name-art-shortcuts').getBoundingClientRect();
    const work = document.querySelector('.name-art-workspace').getBoundingClientRect();
    const style = document.querySelector('.name-art-style-picker').getBoundingClientRect();
    return {
      quickTop: quick.top,
      workTop: work.top,
      styleTop: style.top,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
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
  await expect(styles).toBeVisible();
});
