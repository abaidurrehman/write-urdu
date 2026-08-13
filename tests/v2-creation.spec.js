const { test, expect } = require('@playwright/test');
require('./v2-creation-regression-cases.js');

const block = page => Promise.all([
  page.route(/google_jsapi\.js/, route => route.continue()),
  page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort())
]);
async function open(page, route) {
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached', timeout: 10000 });
}
function directSocialState(page) {
  return page.evaluate(() => {
    const app = window.WriteUrduSocialDirectApp && window.WriteUrduSocialDirectApp.getWorkspaceApp();
    const canvas = app && app.getCanvas(); const state = app && app.getState();
    return state && canvas ? [state.socialMode, state.presetId, canvas.width, canvas.height] : null;
  });
}

test('v2 creation surfaces keep their role-owned hierarchy', async ({ page }) => {
  await block(page);
  const cases = [
    ['/urdu-card-studio.html', '[data-card-studio]', 'card-studio', '.card-studio-preview'],
    ['/urdu-templates.html', '[data-template-library]', 'templates', '[data-template-grid]'],
    ['/stylish-urdu-text-generator.html', '[data-stylish-generator]', 'stylish-text', '[data-stylish-results]'],
    ['/urdu-name-art-maker.html', '[data-name-art]', 'name-art', '.name-art-workspace #cardCanvas'],
    ['/qr-code-generator.html', '[data-qr-generator]', 'qr-generator', '.qr-preview']
  ];
  for (const [route, root, marker, result] of cases) {
    await open(page, route);
    await expect(page.locator(root)).toHaveAttribute('data-v2-creation-workspace', marker);
    await expect(page.locator(result)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
});

test('Name Art remains a direct canvas with its creation inventory', async ({ page }) => {
  await block(page); await open(page, '/urdu-name-art-maker.html');
  await expect(page.locator('.name-art-workspace iframe')).toHaveCount(0);
  await expect(page.locator('[data-name-art-template]')).toHaveCount(24);
  await expect(page.locator('[data-name-art-preset] option')).toHaveCount(6);
  await expect.poll(() => page.evaluate(() => Boolean(window.WriteUrduNameArtApp && window.WriteUrduNameArtApp.getWorkspaceApp()))).toBe(true);
});

test('WhatsApp Status owns a direct 1080x1920 workspace', async ({ page, isMobile }) => {
  await block(page); await open(page, '/urdu-whatsapp-status-maker.html');
  await expect(page.locator('[data-social-direct-workspace="whatsapp"]')).toBeVisible();
  await expect(page.locator('.social-maker-workspace iframe')).toHaveCount(0);
  await expect(page.locator('#cardCanvas')).toBeVisible();
  await expect.poll(() => directSocialState(page), { timeout: 20000 }).toEqual(['whatsapp','story',1080,1920]);
  expect(await page.evaluate(() => window.WriteUrduSocialMaker.getSafeArea('whatsapp', { id:'story', width:1080, height:1920 }))).toEqual({ top:230, right:100, bottom:290, left:100 });
  await expect(page.locator('[data-card-safe-area]')).toBeVisible();
  const positions = await page.evaluate(() => {
    const a = document.querySelector('.social-maker-direct-task').getBoundingClientRect();
    const b = document.querySelector('.social-maker-direct-preview').getBoundingClientRect();
    const c = document.querySelector('.social-maker-direct-refine').getBoundingClientRect();
    return [a.top,a.width,b.top,b.width,c.top,document.documentElement.scrollWidth-document.documentElement.clientWidth];
  });
  expect(positions[5]).toBeLessThanOrEqual(1);
  if (isMobile) { expect(positions[0]).toBeLessThan(positions[2]); expect(positions[2]).toBeLessThan(positions[4]); }
  else expect(positions[3]).toBeGreaterThan(positions[1] * 1.5);
});

test('Instagram owns direct Square, Portrait and Story workspaces', async ({ page, isMobile }) => {
  await block(page); await open(page, '/urdu-instagram-post-maker.html');
  await expect(page.locator('[data-v2-creation-workspace]')).toHaveAttribute('data-v2-creation-workspace', 'social-instagram');
  await expect(page.locator('[data-social-direct-workspace="instagram"]')).toBeVisible();
  await expect(page.locator('.social-maker-workspace iframe')).toHaveCount(0);
  await expect(page.locator('#cardCanvas')).toBeVisible();
  await expect(page.locator('[data-instagram-preset]')).toHaveCount(3);
  await expect.poll(() => directSocialState(page), { timeout: 20000 }).toEqual(['instagram','square',1080,1080]);

  await page.locator('[data-instagram-preset="portrait"]').click();
  await expect(page.locator('[data-instagram-preset="portrait"]')).toHaveAttribute('aria-pressed','true');
  await expect.poll(() => directSocialState(page)).toEqual(['instagram','portrait',1080,1350]);
  expect(await page.evaluate(() => window.WriteUrduSocialMaker.getSafeArea('instagram', { id:'portrait', width:1080, height:1350 }))).toEqual({ top:120, right:90, bottom:150, left:90 });

  await page.locator('[data-instagram-preset="story"]').click();
  await expect.poll(() => directSocialState(page)).toEqual(['instagram','story',1080,1920]);
  expect(await page.evaluate(() => window.WriteUrduSocialMaker.getSafeArea('instagram', { id:'story', width:1080, height:1920 }))).toEqual({ top:230, right:100, bottom:290, left:100 });
  await expect(page.locator('[data-card-safe-area]')).toBeVisible();

  const positions = await page.evaluate(() => {
    const task = document.querySelector('.social-maker-direct-task').getBoundingClientRect();
    const preview = document.querySelector('.social-maker-direct-preview').getBoundingClientRect();
    const refine = document.querySelector('.social-maker-direct-refine').getBoundingClientRect();
    return [task.top,task.width,preview.top,preview.width,refine.top,document.documentElement.scrollWidth-document.documentElement.clientWidth];
  });
  expect(positions[5]).toBeLessThanOrEqual(1);
  if (isMobile) { expect(positions[0]).toBeLessThan(positions[2]); expect(positions[2]).toBeLessThan(positions[4]); }
  else expect(positions[3]).toBeGreaterThan(positions[1] * 1.5);
});
