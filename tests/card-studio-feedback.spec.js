const { test, expect } = require('@playwright/test');

// WU-UXR-002 Slice B: truthful feedback and copy (CARD-UX-004, 015, 021, 022, 030, 031).
const topDownload = '.card-studio-top-actions [data-card-action="download"]';

async function openStudio(page, viewport) {
  if (viewport) await page.setViewportSize(viewport);
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.goto('/urdu-card-studio', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.WriteUrduCardStudioApp && document.querySelector('[data-card-content-action="sample"]')), null, { timeout: 15000 });
}

const inViewport = locator => locator.evaluate(node => {
  const rect = node.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight;
});

test('sample text downloads a picture with a readable file name', async ({ page }) => {
  await openStudio(page);
  await page.locator('[data-card-content-action="sample"]').click();
  const value = await page.locator('#cardText').inputValue();
  expect(value.trim().length).toBeGreaterThan(10);
  expect(value).not.toBe(await page.evaluate(() => window.WriteUrduCardStudio.DEFAULT_TEXT));
  const download = page.waitForEvent('download', { timeout: 10000 });
  await page.locator(topDownload).click();
  const name = (await download).suggestedFilename();
  expect(name).not.toMatch(/Untitled|\s/);
  expect(name).toMatch(/^urdu-[a-z]+-\d{4}-\d{2}-\d{2}\.png$/);
});

test('a refused download stays visible on a small phone after autosave', async ({ page }) => {
  await openStudio(page, { width: 360, height: 780 });
  await page.locator('[data-card-content-action="clear"]').click();
  await page.locator(topDownload).click();
  await page.waitForTimeout(2000);
  const status = page.locator('[data-card-status]');
  await expect(status).toHaveText('Add some Urdu text before exporting.');
  const toast = page.locator('[data-card-toast]');
  await expect(toast).toHaveText('Add some Urdu text before exporting.');
  expect(await inViewport(toast), 'the refusal is on screen').toBe(true);
  await expect(page.locator('[data-card-save-indicator]')).toHaveText(/Saved|محفوظ/);
});

test('a broken image upload keeps its error', async ({ page }) => {
  await openStudio(page);
  // As in the audit (P6): choosing "Uploaded image" schedules an autosave that used to overwrite the error.
  await page.locator('#cardBackgroundType').evaluate(select => { select.value = 'image'; select.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.waitForTimeout(300);
  await page.locator('#cardImage').setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not an image!') });
  await page.waitForTimeout(2000);
  await expect(page.locator('[data-card-status]')).toHaveText(/This image could not be opened/);
});

test('the remove-image button says what it does', async ({ page }) => {
  await openStudio(page);
  await expect(page.locator('[data-card-action="remove-image"]')).toHaveText('Remove image');
});

test('when links cannot be created, the dialog offers the picture instead', async ({ page }) => {
  await page.route('**/api/shares', route => route.request().method() === 'POST'
    ? route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'share_storage_unavailable' }) })
    : route.continue());
  await openStudio(page);
  await page.locator('[data-card-content-action="sample"]').click();
  await page.locator('[data-card-action="publish"]:visible').first().click();
  const confirm = page.locator('[data-wu-share-confirm]');
  if (await confirm.count()) await confirm.click();
  const offer = page.locator('[data-wu-share-download]');
  await expect(offer).toBeVisible();
  await expect(page.locator('[data-wu-share-error]')).not.toContainText(/deployment|storage/i);
  const download = page.waitForEvent('download', { timeout: 10000 });
  await offer.click();
  expect((await download).suggestedFilename()).toMatch(/\.png$/);
});

test('during a Roman Urdu outage only one status is shown', async ({ page }) => {
  await openStudio(page);
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('write-urdu:transliteration-status', { detail: { available: false } })));
  const alert = page.locator('[data-input-mode-alert][data-input-mode-alert-state="unavailable"]');
  await expect(alert).toBeVisible();
  await expect(page.locator('[data-card-transliteration-status]')).toBeHidden();
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('write-urdu:transliteration-status', { detail: { available: true } })));
  await expect(alert).toBeHidden();
  await expect(page.locator('[data-card-transliteration-status]')).toBeVisible();
});

test('the convert-passage button sits just below the text field on a small phone', async ({ page }) => {
  await openStudio(page, { width: 360, height: 780 });
  await page.locator('#cardText').fill('aap kaise hain mere dost bohat din ho gaye');
  const action = page.locator('[data-batch-action]');
  await expect(action).toBeVisible();
  const gap = await page.evaluate(() => document.querySelector('[data-batch-action]').getBoundingClientRect().top - document.querySelector('#cardText').getBoundingClientRect().bottom);
  expect(gap).toBeGreaterThanOrEqual(0);
  expect(gap).toBeLessThanOrEqual(200);
});
