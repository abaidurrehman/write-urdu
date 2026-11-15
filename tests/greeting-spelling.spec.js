const { test, expect } = require('@playwright/test');

// F-6 (docs/audits/product-pulse-7d-2026-11-14): word-by-word conversion in the
// Basic Writer must show common greetings with their correct spelling, keep the
// caret where the writer is typing, and leave directly typed Urdu alone.

// Real per-word provider outputs recorded on 2026-11-15.
const PROVIDER = {
  assalam: 'اسسلام', o: 'و', alaikum: 'علیکم', inshallah: 'انشاللہ',
  jumma: 'جمّ', mubarak: 'مبارک', kal: 'کل', milenge: 'ملینگے'
};

async function openWriter(page) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:\d+)/, route => route.abort());
  await page.route(/www\.google\.com\/inputtools\/request/, route => {
    const url = route.request().url();
    const callback = decodeURIComponent((url.match(/[?&]cb=([^&]+)/) || [])[1] || '');
    const word = decodeURIComponent((url.match(/[?&]text=([^&]+)/) || [])[1] || '');
    return route.fulfill({
      contentType: 'application/javascript',
      body: `${callback}(["SUCCESS",[[${JSON.stringify(word)},[${JSON.stringify(PROVIDER[word] || word)}]]]])`
    });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => Boolean(window.writeUrduTransliterationReady), null, { timeout: 15000 });
  const editor = page.locator('#transliterateTextarea');
  await editor.click();
  return editor;
}

async function typeWords(page, editor, words) {
  for (const word of words) {
    const before = await editor.inputValue();
    await page.keyboard.type(word + ' ');
    // Wait for this word's conversion before typing the next one.
    await expect.poll(() => editor.inputValue()).not.toBe(before + word + ' ');
  }
}

test('typed greetings come out correctly spelled and the caret stays at the end', async ({ page }) => {
  const editor = await openWriter(page);
  await typeWords(page, editor, ['assalam', 'o', 'alaikum']);
  await expect(editor).toHaveValue('السلام علیکم ');
  await typeWords(page, editor, ['inshallah', 'kal', 'milenge']);
  await expect(editor).toHaveValue('السلام علیکم انشاءاللہ کل ملینگے ');
  await typeWords(page, editor, ['jumma', 'mubarak']);
  await expect(editor).toHaveValue('السلام علیکم انشاءاللہ کل ملینگے جمعہ مبارک ');
  const caret = await editor.evaluate(node => [node.selectionStart, node.selectionEnd, node.value.length]);
  expect(caret[0]).toBe(caret[2]);
  expect(caret[1]).toBe(caret[2]);
});

test('directly typed Urdu is never rewritten', async ({ page }) => {
  const editor = await openWriter(page);
  await page.locator('[data-input-mode-option="direct"]').first().click();
  await editor.click();
  await page.keyboard.insertText('اسسلام و علیکم ');
  await page.waitForTimeout(400);
  await expect(editor).toHaveValue('اسسلام و علیکم ');
});
