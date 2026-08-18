const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function open(page, route) {
  await blockExternalServices(page);
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached' });
  await page.waitForFunction(() => Boolean(window.WriteUrduWorkspaceNextStep && window.WriteUrduCoreContinuity), null, { timeout: 10000 });
}

test('Image to Urdu Text reveals governed next steps after an asynchronous result and can continue to Cleaner', async ({ page }) => {
  await open(page, '/urdu-ocr');

  const panel = page.locator('[data-wu-next-step-version="2"]');
  await expect(panel).toBeAttached();
  await expect(panel).toBeHidden();
  await expect(page.locator('[data-ocr-clean]')).toBeHidden();
  await expect(page.locator('[data-ocr-editor]')).toBeHidden();

  // Start the shared OCR watcher without invoking the heavy recognition engine,
  // then simulate the same asynchronous result assignment the OCR runtime makes.
  await page.locator('[data-ocr-start]').evaluate(button => { button.disabled = false; });
  await page.locator('[data-ocr-start]').click();
  await page.evaluate(() => {
    setTimeout(() => {
      document.querySelector('#ocrResult').value = 'تصویر سے نکالا ہوا اردو متن';
    }, 300);
  });

  await expect(panel).toBeVisible({ timeout: 10000 });
  await expect(panel.locator('[data-wu-next-step-action]')).toHaveCount(3);
  await expect(panel.locator('[data-wu-next-step-action="image-text-to-cleaner"]')).toContainText('Fix this Urdu text');
  await expect(panel.locator('[data-wu-next-step-action="image-text-to-basic"]')).toContainText('Continue writing');
  await expect(panel.locator('[data-wu-next-step-action="image-text-to-rich"]')).toContainText('Format this as a document');

  await panel.locator('[data-wu-next-step-action="image-text-to-cleaner"]').click();
  await page.waitForURL(/urdu-text-cleaner/, { timeout: 10000 });
  await expect(page.locator('#cleanerSource')).toHaveValue('تصویر سے نکالا ہوا اردو متن', { timeout: 10000 });
  expect(page.url()).not.toContain(encodeURIComponent('تصویر'));
});

test('Voice transcript uses the shared continuation panel and can transform into Card Studio', async ({ page }) => {
  await open(page, '/tools/urdu-voice-typing');

  const transcript = page.locator('#voiceTranscript');
  const panel = page.locator('[data-wu-next-step-version="2"]');
  await expect(panel).toBeHidden();
  await expect(page.locator('[data-voice-clean]')).toBeHidden();
  await expect(page.locator('[data-voice-editor]')).toBeHidden();

  await transcript.fill('آواز سے تیار کیا ہوا اردو متن');
  await expect(panel).toBeVisible();
  await expect(panel.locator('[data-wu-next-step-action]')).toHaveCount(3);
  await expect(panel.locator('[data-wu-next-step-action="voice-to-basic"]')).toContainText('Continue writing');
  await expect(panel.locator('[data-wu-next-step-action="voice-to-rich"]')).toContainText('Format this as a document');
  await expect(panel.locator('[data-wu-next-step-action="voice-to-card"]')).toContainText('Create a card');

  await panel.locator('[data-wu-next-step-action="voice-to-card"]').click();
  await page.waitForURL(/urdu-card-studio/, { timeout: 10000 });
  await expect(page.locator('#cardText')).toHaveValue('آواز سے تیار کیا ہوا اردو متن', { timeout: 10000 });
  expect(page.url()).not.toContain(encodeURIComponent('آواز'));
});

test('InPage continuation appears only for Unicode output and disappears for legacy output', async ({ page }) => {
  await open(page, '/tools/inpage-unicode-converter');

  const panel = page.locator('[data-wu-next-step-version="2"]');
  await expect(panel).toBeHidden();
  await expect(page.locator('[data-inpage-clean]')).toBeHidden();
  await expect(page.locator('[data-inpage-editor]')).toBeHidden();

  await page.locator('[data-inpage-sample]').click();
  await page.locator('[data-inpage-convert]').click();
  await expect(page.locator('#inpageResult')).not.toHaveValue('');
  await expect(panel).toBeVisible();
  await expect(panel.locator('[data-wu-next-step-action]')).toHaveCount(3);
  await expect(panel.locator('[data-wu-next-step-action="inpage-to-cleaner"]')).toContainText('Fix this Urdu text');
  await expect(panel.locator('[data-wu-next-step-action="inpage-to-basic"]')).toContainText('Continue writing');
  await expect(panel.locator('[data-wu-next-step-action="inpage-to-rich"]')).toContainText('Format this as a document');

  await page.locator('[data-inpage-mode="unicode-to-legacy"]').click();
  await page.locator('#inpageSource').fill('یہ Unicode اردو متن ہے');
  await page.locator('[data-inpage-convert]').click();
  await expect(page.locator('#inpageResult')).not.toHaveValue('');
  await expect(panel).toBeHidden();
});
