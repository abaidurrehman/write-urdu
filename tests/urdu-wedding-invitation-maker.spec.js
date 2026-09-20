const { test, expect } = require('@playwright/test');

// html2canvas is loaded eagerly from cdnjs by urdu-wedding-invitation-maker.html (a real,
// reviewed part of the page's export flow, not something this test suite should rewrite);
// the image-download test needs it to actually load, so it is allow-listed through the
// otherwise-total external block used by every other spec in this suite.
const blockExternal = (page) => Promise.all([
  page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, (route) => route.abort()),
  page.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/html2canvas/, (route) => route.continue())
]);

async function fillIntro(page, eventType) {
  await page.fill('[data-wedding-couple-person-a]', 'Ayesha');
  await page.fill('[data-wedding-couple-person-b]', 'Bilal');
  await page.click('[data-wedding-add-family]');
  await page.fill('[data-wedding-families-list] input', 'The Khan Family');
  await page.selectOption('[data-wedding-invitation-language]', 'urdu');
  await page.click('[data-wedding-add-event]');
  await page.selectOption('[data-wedding-events-list] select', eventType);
}

test('WU-SHAADI-001 composer: design-first happy path picks a card before typing details', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await fillIntro(page, 'mehndi');
  await page.click('[data-wedding-next]');

  // Design step for Mehndi: a card gallery must be visible before any date/wording field.
  await expect(page.locator('[data-wedding-step-panel="design"]')).toBeVisible();
  await expect(page.locator('[data-wedding-design-list] .wedding-design-option').first()).toBeVisible();
  await page.locator('[data-wedding-design-list] .wedding-design-option').first().click();
  await page.click('[data-wedding-next]');

  // Edit step: fields plus a live preview pane, still scoped to Mehndi.
  await expect(page.locator('[data-wedding-step-panel="edit"]')).toBeVisible();
  await expect(page.locator('[data-wedding-edit-preview] .wedding-preview-card')).toBeVisible();
  await page.fill('[data-wedding-edit-fields] input[type="date"]', '2026-12-01');
  await page.click('[data-wedding-next]');

  await expect(page.locator('[data-wedding-step-panel="review_export"]')).toBeVisible();
  await expect(page.locator('.wedding-preview-card')).toBeVisible();
  await expect(page.locator('.wedding-preview-text')).not.toHaveText('');
});

test('WU-SHAADI-001 composer: live preview updates as the user types wording', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await fillIntro(page, 'nikah');
  await page.click('[data-wedding-next]');
  await page.locator('[data-wedding-design-list] .wedding-design-option').first().click();
  await page.click('[data-wedding-next]');

  await page.fill('[data-wedding-edit-fields] input[type="date"]', '2026-12-05');
  await page.fill('[data-wedding-edit-fields] textarea', 'My own hand-typed wording');
  await expect(page.locator('[data-wedding-edit-preview] .wedding-preview-text')).toHaveText('My own hand-typed wording', { timeout: 2000 });
});

test('WU-SHAADI-001 composer: blocked steps cannot be jumped to', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await fillIntro(page, 'walima');
  // Do not fill the date - the edit step (and review_export after it) must stay blocked.
  await page.click('[data-wedding-next]');
  await page.locator('[data-wedding-design-list] .wedding-design-option').first().click();
  await page.click('[data-wedding-next]');

  await expect(page.locator('[data-wedding-step-panel="edit"]')).toBeVisible();
  await expect(page.locator('[data-wedding-next]')).toBeDisabled();
  await page.click('[data-wedding-step-tab="review_export"]');
  await expect(page.locator('[data-wedding-step-panel="edit"]')).toBeVisible();
  await expect(page.locator('[data-wedding-step-panel="review_export"]')).toBeHidden();
});

test('WU-SHAADI-001 composer: wording override survives and image export produces a file', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await fillIntro(page, 'nikah');
  await page.click('[data-wedding-next]');
  await page.locator('[data-wedding-design-list] .wedding-design-option').first().click();
  await page.click('[data-wedding-next]');
  await page.fill('[data-wedding-edit-fields] input[type="date"]', '2026-12-05');
  await page.fill('[data-wedding-edit-fields] textarea', 'My own hand-edited wording');
  await page.click('[data-wedding-edit-fields] button:has-text("Save wording")');
  await page.click('[data-wedding-next]');

  await expect(page.locator('.wedding-preview-text')).toHaveText('My own hand-edited wording');

  const downloadPromise = page.waitForEvent('download');
  await page.click('[data-wedding-preview-list] button:has-text("Download image")');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.png$/);
});

test('WU-SHAADI-001 composer: two events each get their own design and edit steps', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await fillIntro(page, 'mehndi');
  await page.click('[data-wedding-add-event]');
  await page.selectOption('[data-wedding-events-list] select >> nth=1', 'baraat');
  await page.click('[data-wedding-next]');

  // Mehndi design -> Mehndi edit -> Baraat design -> Baraat edit -> review_export
  await expect(page.locator('[data-wedding-design-heading]')).toContainText('Mehndi');
  await page.locator('[data-wedding-design-list] .wedding-design-option').first().click();
  await page.click('[data-wedding-next]');
  await page.fill('[data-wedding-edit-fields] input[type="date"]', '2026-12-01');
  await page.click('[data-wedding-next]');

  await expect(page.locator('[data-wedding-design-heading]')).toContainText('Baraat');
  await page.locator('[data-wedding-design-list] .wedding-design-option').first().click();
  await page.click('[data-wedding-next]');
  await page.fill('[data-wedding-edit-fields] input[type="date"]', '2026-12-05');
  await page.click('[data-wedding-next]');

  await expect(page.locator('[data-wedding-step-panel="review_export"]')).toBeVisible();
  await expect(page.locator('[data-wedding-preview-list] .wedding-preview-card')).toHaveCount(2);
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
