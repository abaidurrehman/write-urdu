const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function open(page, route) {
  await blockExternalServices(page);
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached' });
}

test('core writing surfaces expose a compact next-step journey below the task', async ({ page }) => {
  for (const route of ['/', '/urdu-editor.html', '/urdu-keyboard.html']) {
    await open(page, route);
    const panel = page.locator('[data-wu-journey-panel]');
    await expect(panel).toBeVisible({ timeout: 10000 });
    await expect(panel.locator('[data-create-card]')).toHaveCount(1);
    await expect(panel.locator('[data-create-stylish]')).toHaveCount(1);
    await expect(panel.locator('[data-create-name-art]')).toHaveCount(1);
    await expect(panel.locator('[data-wu-journey="write-to-templates"]')).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test('homepage text is carried locally into Stylish Urdu and consumed once', async ({ page }) => {
  await open(page, '/');
  await page.locator('#transliterateTextarea').fill('میرا خوب صورت نام');
  await page.locator('[data-wu-journey-panel] [data-create-stylish]').click();
  await page.waitForURL(/stylish-urdu-text-generator/, { timeout: 10000 });
  await expect(page.locator('#stylishText')).toHaveValue('میرا خوب صورت نام', { timeout: 10000 });
  await expect(page.locator('[data-stylish-status]')).toContainText('ready to style');
  expect(await page.evaluate(() => sessionStorage.getItem('writeUrdu.stylishText.incoming.v1'))).toBeNull();
  expect(page.url()).not.toContain('میرا');
});

test('keyboard text is carried locally into Name Art without entering the URL', async ({ page }) => {
  await open(page, '/urdu-keyboard.html');
  await page.locator('#write').fill('میرا نام');
  await page.locator('[data-wu-journey-panel] [data-create-name-art]').click();
  await page.waitForURL(/urdu-name-art-maker/, { timeout: 10000 });
  await expect(page.locator('[data-name-art-status]')).toContainText('ready', { timeout: 10000 });
  const studio = page.frameLocator('[data-name-art-frame]');
  await expect(studio.locator('#cardText')).toHaveValue('میرا نام', { timeout: 10000 });
  expect(await page.evaluate(() => sessionStorage.getItem('writeUrdu.nameArt.handoff.v1'))).toBeNull();
  expect(page.url()).not.toContain('میرا');
});
