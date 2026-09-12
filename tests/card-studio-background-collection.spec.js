const { test, expect } = require('@playwright/test');

const blockExternal = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function openStudio(page, route = '/urdu-card-studio.html') {
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.locator('[data-card-built-in-library]')).toBeVisible();
}

test('collection filters all 24 bilingual background choices', async ({ page }) => {
  await blockExternal(page);
  await openStudio(page);
  const choices = page.locator('[data-card-built-in-background]');
  await expect(choices).toHaveCount(24);
  await expect(page.locator('[data-card-background-filter]')).toHaveCount(9);
  await page.getByRole('button', { name: 'Truck Art', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Truck Art', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-card-built-in-background]:visible')).toHaveCount(2);
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(page.locator('[data-card-built-in-background]:visible')).toHaveCount(24);

  await openStudio(page, '/urdu/urdu-card-studio.html');
  await expect(page.getByRole('button', { name: 'ٹرک آرٹ', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /اجرک ورثہ پس منظر استعمال کریں/ })).toBeVisible();
});

test('background applies through editable local image pipeline and remains exportable', async ({ page }) => {
  await blockExternal(page);
  await openStudio(page);
  await page.locator('#cardText').fill('محبت روشنی ہے');
  await page.locator('[data-card-built-in-background="black-gold-classic"]').click();
  await expect(page.locator('[data-card-built-in-background="black-gold-classic"]')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => {
    const state = window.WriteUrduCardStudioApp && window.WriteUrduCardStudioApp.getState();
    return state && [state.background.type, state.text.color, state.text.value];
  })).toEqual(['image', '#f3dfac', 'محبت روشنی ہے']);
  await page.locator('#cardText').fill('محبت روشنی ہے\nاور امید زندگی');
  await expect.poll(() => page.evaluate(() => window.WriteUrduCardStudioApp.getState().text.value)).toContain('امید');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-card-action="download"]:visible').first().click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.png$/);
});

test('mobile collection scrolls internally without page overflow and stays route-scoped', async ({ page, isMobile }) => {
  await blockExternal(page);
  await openStudio(page);
  const dimensions = await page.evaluate(() => {
    const grid = document.querySelector('.card-studio-background-library-grid');
    return {
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      gridScrollable: grid.scrollWidth > grid.clientWidth
    };
  });
  expect(dimensions.pageOverflow).toBeLessThanOrEqual(1);
  if (isMobile) expect(dimensions.gridScrollable).toBe(true);
  await page.goto('/urdu-editor.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-card-built-in-library]')).toHaveCount(0);
  await expect(page.locator('script[data-card-background-registry]')).toHaveCount(0);
  await expect(page.locator('script[data-card-background-library]')).toHaveCount(0);
});
