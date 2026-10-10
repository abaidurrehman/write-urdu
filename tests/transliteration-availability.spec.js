const { test, expect } = require('@playwright/test');

// Word-by-word conversion loads one JSONP script per word from Google Input
// Tools. The Google control reports itself ready even when those requests fail,
// so the input-mode alert must make a failed conversion visible and clear it
// once a later request succeeds, without moving the editor the writer is in.
async function openWriter(page, provider) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());
  await page.route(/www\.google\.com\/inputtools\/request/, route => {
    if (!provider.available) return route.abort();
    const url = route.request().url();
    const callback = decodeURIComponent((url.match(/[?&]cb=([^&]+)/) || [])[1] || '');
    const word = decodeURIComponent((url.match(/[?&]text=([^&]+)/) || [])[1] || '');
    return route.fulfill({
      contentType: 'application/javascript',
      body: `${callback}(["SUCCESS",[[${JSON.stringify(word)},["اردو"]]]])`
    });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => Boolean(window.writeUrduTransliterationReady), null, { timeout: 15000 });
  const editor = page.locator('#transliterateTextarea');
  await editor.click();
  return editor;
}

const editorTop = editor => editor.evaluate(element => element.getBoundingClientRect().top);
const alertFor = page => page.locator('[data-input-mode-control] [data-input-mode-alert]').first();

test('a failed word conversion is announced, then cleared when conversion recovers, without moving the editor', async ({ page }) => {
  const provider = { available: false };
  const editor = await openWriter(page, provider);
  const alert = alertFor(page);

  await page.keyboard.type('m');
  const beforeFailure = await editorTop(editor);
  await page.keyboard.type('era ');
  await expect(alert).toBeVisible();
  await expect(alert).toHaveAttribute('data-input-mode-alert-state', 'unavailable');
  await expect(alert).toContainText('Urdu conversion is not responding');
  await expect(alert.locator('[data-input-mode-alert-action]')).toHaveText('Type Urdu directly');
  expect(Math.abs((await editorTop(editor)) - beforeFailure)).toBeLessThanOrEqual(1);
  await expect(editor).toHaveValue('mera ');

  provider.available = true;
  // The Google control backs off briefly after a failed request.
  await page.waitForTimeout(5000);
  await editor.focus();
  await page.keyboard.type('khayal');
  const beforeRecovery = await editorTop(editor);
  await page.keyboard.type(' ');
  await expect(alert).toBeHidden();
  await expect(editor).toHaveValue(/اردو/);
  expect(Math.abs((await editorTop(editor)) - beforeRecovery)).toBeLessThanOrEqual(1);
});

test('the unavailable notice offers direct Urdu typing', async ({ page }) => {
  const editor = await openWriter(page, { available: false });
  const alert = alertFor(page);
  await page.keyboard.type('mera ');
  await expect(alert).toHaveAttribute('data-input-mode-alert-state', 'unavailable');
  await alert.locator('[data-input-mode-alert-action]').click();
  await expect(page.locator('[data-input-mode-control]').first()).toHaveAttribute('data-input-mode', 'direct');
  await expect(alert).toHaveAttribute('data-input-mode-alert-state', 'direct');
  await expect(alert).toContainText('English-letter conversion is off');
  await expect(editor).toHaveValue('mera ');
});

test('passage conversion shares provider health with the word-by-word notice', async ({ page }) => {
  await openWriter(page, { available: true });
  const alert = alertFor(page);
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('write-urdu:transliteration-status', { detail: { available: false } })));
  await expect(alert).toHaveAttribute('data-input-mode-alert-state', 'unavailable');
  await expect(alert).toBeVisible();
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('write-urdu:transliteration-status', { detail: { available: true } })));
  await expect(alert).toBeHidden();
});
