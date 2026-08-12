const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function open(page, route) {
  await blockExternalServices(page);
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached' });
}

test('Stylish Urdu filters and local state work end to end', async ({ page }) => {
  await open(page, '/stylish-urdu-text-generator.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });

  const input = page.locator('#stylishText');
  const count = page.locator('[data-stylish-count]');
  await input.fill('سلام');
  await page.getByRole('button', { name: 'Generate styles' }).click();
  await expect(count).toHaveText('80 styles ready');
  await expect(page.locator('[data-stylish-results] .stylish-card')).toHaveCount(24);

  await page.selectOption('[data-stylish-category]', 'popular');
  await expect(count).toHaveText('31 styles ready');
  await page.selectOption('[data-stylish-category]', 'kashida');
  await expect(count).toHaveText('8 styles ready');
  await page.selectOption('[data-stylish-category]', 'all');

  const firstCard = page.locator('[data-stylish-results] .stylish-card').first();
  const styleId = await firstCard.getAttribute('data-style-id');
  await firstCard.getByRole('button', { name: /Favorite/ }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('writeUrdu.stylishText.favorites.v1') || '[]'))).toContain(styleId);

  page.once('dialog', dialog => dialog.accept('Saved styles'));
  await page.locator(`[data-style-id="${styleId}"]`).getByRole('button', { name: 'Collection' }).click();
  const collections = await page.evaluate(() => JSON.parse(localStorage.getItem('writeUrdu.stylishText.collections.v1') || '{}'));
  expect(collections['Saved styles']).toContain(styleId);

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: payload => { window.__sharedStylish = payload; return Promise.resolve(); }
    });
  });
  await page.locator(`[data-style-id="${styleId}"]`).getByRole('button', { name: 'Share' }).click();
  await expect.poll(() => page.evaluate(() => window.__sharedStylish && window.__sharedStylish.text)).not.toBeFalsy();

  await input.fill('میرا نام');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('writeUrdu.stylishText.recents.v1') || '[]')[0])).toBe('میرا نام');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator(`[data-style-id="${styleId}"]`).getByRole('button', { name: '★ Saved' })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('Stylish Urdu handoff opens Name Art with 24 templates and exact presets', async ({ page }) => {
  await open(page, '/stylish-urdu-text-generator.html');
  const input = page.locator('#stylishText');
  await input.fill('میرا نام');
  await page.getByRole('button', { name: 'Generate styles' }).click();
  const firstCard = page.locator('[data-stylish-results] .stylish-card').first();
  const expectedText = await firstCard.locator('.stylish-card-preview').innerText();
  await firstCard.getByRole('button', { name: 'Name Art' }).click();
  await page.waitForURL(/urdu-name-art-maker/, { timeout: 10000 });

  await expect(page.locator('[data-name-art-status]')).toContainText('ready', { timeout: 10000 });
  const studio = page.frameLocator('[data-name-art-frame]');
  await expect(studio.locator('#cardText')).toHaveValue(expectedText, { timeout: 10000 });
  expect(await page.evaluate(() => sessionStorage.getItem('writeUrdu.nameArt.handoff.v1'))).toBeNull();

  const contract = await page.evaluate(() => ({
    templates: window.WriteUrduNameArt.TEMPLATES.length,
    packs: window.WriteUrduNameArt.PACKS.length,
    presets: window.WriteUrduNameArt.PRESETS.map(item => [item.id, item.width, item.height])
  }));
  expect(contract.templates).toBe(24);
  expect(contract.packs).toBe(12);
  expect(contract.presets).toContainEqual(['name-transparent', 1600, 900]);

  await page.selectOption('[data-name-art-pack]', 'social-profile');
  await expect(page.locator('[data-name-art-template]')).toHaveCount(2);
  await page.locator('[data-name-art-template]').first().click();
  await expect.poll(() => page.evaluate(() => {
    const frame = document.querySelector('[data-name-art-frame]');
    return frame && frame.contentWindow.WriteUrduCardStudioApp && frame.contentWindow.WriteUrduCardStudioApp.getState().templateId;
  })).toMatch(/^name-social-profile-/);

  await page.selectOption('[data-name-art-preset]', 'portrait');
  await expect.poll(() => page.evaluate(() => {
    const frame = document.querySelector('[data-name-art-frame]');
    const app = frame && frame.contentWindow.WriteUrduCardStudioApp;
    const canvas = app && app.getCanvas();
    return app && canvas ? [app.getState().presetId, canvas.width, canvas.height] : null;
  })).toEqual(['portrait', 1080, 1350]);

  await page.selectOption('[data-name-art-preset]', 'name-transparent');
  await expect.poll(() => page.evaluate(() => {
    const frame = document.querySelector('[data-name-art-frame]');
    const app = frame && frame.contentWindow.WriteUrduCardStudioApp;
    const canvas = app && app.getCanvas();
    if (!app || !canvas || canvas.width !== 1600 || canvas.height !== 900) return null;
    return [app.getState().presetId, canvas.width, canvas.height, canvas.getContext('2d').getImageData(0, 0, 1, 1).data[3]];
  })).toEqual(['name-transparent', 1600, 900, 0]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
