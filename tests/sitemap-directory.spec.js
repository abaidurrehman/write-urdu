const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function open(page) {
  await blockExternalServices(page);
  await page.goto('/write-urdu-sitemap.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached', timeout: 10000 });
}

test('professional sitemap is a task-first responsive directory', async ({ page, isMobile }) => {
  await open(page);

  await expect(page.locator('.wu-site-header')).toBeVisible();
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toBeVisible();
  await expect(heading).toContainText('Write Urdu');

  for (const section of ['write', 'create', 'learn', 'about']) {
    await expect(page.locator(`#${section}.sitemap-directory-section`)).toBeVisible();
  }

  const inventory = await page.evaluate(() => ({
    sections: document.querySelectorAll('.sitemap-directory-section').length,
    cards: document.querySelectorAll('.sitemap-directory-card').length
  }));
  expect(inventory.sections).toBeGreaterThanOrEqual(4);
  expect(inventory.cards).toBeGreaterThanOrEqual(25);
  await expect(page.locator('table')).toHaveCount(0);
  await expect(page.locator('footer.wu-footer')).toBeVisible();

  const metrics = await page.evaluate(() => {
    const hero = document.querySelector('.sitemap-directory-hero').getBoundingClientRect();
    const summary = document.querySelector('.sitemap-directory-summary').getBoundingClientRect();
    const firstGrid = document.querySelector('#write .sitemap-directory-grid');
    const gridStyle = getComputedStyle(firstGrid);
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      heroTop: hero.top,
      summaryTop: summary.top,
      columns: gridStyle.gridTemplateColumns.split(' ').filter(Boolean).length
    };
  });

  expect(metrics.overflow).toBeLessThanOrEqual(1);
  if (isMobile) {
    expect(metrics.summaryTop).toBeGreaterThan(metrics.heroTop);
    expect(metrics.columns).toBe(1);
  } else {
    expect(Math.abs(metrics.summaryTop - metrics.heroTop)).toBeLessThan(180);
    expect(metrics.columns).toBe(3);
  }

  await page.locator('.sitemap-directory-jump a[href="#create"]').click();
  await expect(page.locator('#create')).toBeInViewport();
  await expect(page.locator('#create a[href="/urdu-card-studio"]')).toBeVisible();
});
