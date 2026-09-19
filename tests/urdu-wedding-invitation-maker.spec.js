const { test, expect } = require('@playwright/test');

// html2canvas is loaded eagerly from cdnjs by urdu-wedding-invitation-maker.html (a real,
// reviewed part of the page's export flow, not something this test suite should rewrite);
// the image-download test needs it to actually load, so it is allow-listed through the
// otherwise-total external block used by every other spec in this suite.
const blockExternal = (page) => Promise.all([
  page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, (route) => route.abort()),
  page.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/html2canvas/, (route) => route.continue())
]);

test('WU-SHAADI-001 composer: full 6-step happy path reaches a rendered preview', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await page.click('[data-wedding-add-event]');
  await page.selectOption('[data-wedding-events-list] select', 'nikah');
  await page.click('[data-wedding-next]');

  await page.fill('[data-wedding-couple-person-a]', 'Ayesha');
  await page.fill('[data-wedding-couple-person-b]', 'Bilal');
  await page.click('[data-wedding-add-family]');
  await page.fill('[data-wedding-families-list] input', 'The Khan Family');
  await page.click('[data-wedding-next]');

  await page.fill('[data-wedding-schedule-list] input[type="date"]', '2026-12-05');
  await page.click('[data-wedding-next]');

  await page.selectOption('[data-wedding-invitation-language]', 'urdu');
  await page.click('[data-wedding-next]');

  await page.click('[data-wedding-next]'); // design step: accept whatever default/suggestion exists

  await expect(page.locator('.wedding-preview-card')).toBeVisible();
  await expect(page.locator('.wedding-preview-text')).not.toHaveText('');
});

test('WU-SHAADI-001 composer: blocked steps cannot be jumped to', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await page.click('[data-wedding-step-tab="preview_export"]');
  await expect(page.locator('[data-wedding-step-panel="events"]')).toBeVisible();
  await expect(page.locator('[data-wedding-step-panel="preview_export"]')).toBeHidden();
});

test('WU-SHAADI-001 composer: wording override survives and image export produces a file', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await page.click('[data-wedding-add-event]');
  await page.selectOption('[data-wedding-events-list] select', 'nikah');
  await page.click('[data-wedding-next]');
  await page.fill('[data-wedding-couple-person-a]', 'Ayesha');
  await page.fill('[data-wedding-couple-person-b]', 'Bilal');
  await page.click('[data-wedding-add-family]');
  await page.fill('[data-wedding-families-list] input', 'The Khan Family');
  await page.click('[data-wedding-next]');
  await page.fill('[data-wedding-schedule-list] input[type="date"]', '2026-12-05');
  await page.click('[data-wedding-next]');

  await page.fill('[data-wedding-wording-list] textarea', 'My own hand-edited wording');
  await page.click('[data-wedding-wording-list] button:has-text("Save wording")');
  await page.click('[data-wedding-next]');
  await page.click('[data-wedding-next]');

  await expect(page.locator('.wedding-preview-text')).toHaveText('My own hand-edited wording');

  const downloadPromise = page.waitForEvent('download');
  await page.click('[data-wedding-preview-list] button:has-text("Download image")');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.png$/);
});

test('WU-SHAADI-001 composer: reload restores the in-progress draft', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await page.click('[data-wedding-add-event]');
  await page.selectOption('[data-wedding-events-list] select', 'mehndi');
  await page.waitForTimeout(200); // allow the save() debounce-free write to localStorage

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-wedding-events-list] select')).toHaveValue('mehndi');
});
