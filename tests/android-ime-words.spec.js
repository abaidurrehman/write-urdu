const { test, expect } = require('@playwright/test');

// F-0 (docs/audits/product-pulse-7d-2026-11-14): Android keyboards (Gboard,
// Samsung, SwiftKey) send words as composition text with keyCode 229, so the
// Google word converter, which listens for a real Space key, never fires and
// Roman Urdu stays in English letters. A committed word followed by a space or
// punctuation must become Urdu without pressing "Convert passage", and real
// key presses must still be converted only once, by the Google control.

const PROVIDER = {
  mera: 'میرا', naam: 'نام', ali: 'علی', hai: 'ہے',
  assalam: 'اسسلام', o: 'و', alaikum: 'علیکم'
};

async function openWriter(page, counts) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:\d+)/, route => route.abort());
  // Word-by-word conversion by the Google control (JSONP script per word).
  await page.route(/www\.google\.com\/inputtools\/request/, route => {
    const url = route.request().url();
    const callback = decodeURIComponent((url.match(/[?&]cb=([^&]+)/) || [])[1] || '');
    const word = decodeURIComponent((url.match(/[?&]text=([^&]+)/) || [])[1] || '');
    counts.control += 1;
    return route.fulfill({
      contentType: 'application/javascript',
      body: `${callback}(["SUCCESS",[[${JSON.stringify(word)},[${JSON.stringify(PROVIDER[word] || word)}]]]])`
    });
  });
  // The same provider's JSON endpoint, used for committed keyboard words.
  await page.route(/inputtools\.google\.com\/request/, route => {
    const text = new URL(route.request().url()).searchParams.get('text');
    counts.committed += 1;
    return route.fulfill({
      status: 200,
      headers: { 'access-control-allow-origin': '*' },
      contentType: 'application/json',
      body: JSON.stringify(['SUCCESS', [[text, [PROVIDER[text] || text]]]])
    });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => Boolean(window.writeUrduTransliterationReady), null, { timeout: 15000 });
  const editor = page.locator('#transliterateTextarea');
  await editor.click();
  return editor;
}

// The keyboard sequence an Android IME produces for each word and the space after it.
async function imeType(page, words) {
  const cdp = await page.context().newCDPSession(page);
  const unidentified = { type: 'rawKeyDown', windowsVirtualKeyCode: 229, key: 'Unidentified', code: '' };
  for (const word of words) {
    for (let i = 1; i <= word.length; i += 1) {
      await cdp.send('Input.dispatchKeyEvent', unidentified);
      await cdp.send('Input.imeSetComposition', { text: word.slice(0, i), selectionStart: i, selectionEnd: i });
    }
    await cdp.send('Input.insertText', { text: word });
    await cdp.send('Input.dispatchKeyEvent', unidentified);
    await cdp.send('Input.insertText', { text: ' ' });
  }
}

const caretAtEnd = editor => editor.evaluate(node => node.selectionStart === node.value.length && node.selectionEnd === node.value.length);

test.describe('Android keyboard', () => {
  test.use({ viewport: { width: 393, height: 727 }, hasTouch: true, isMobile: true });

  test('committed keyboard words become Urdu without pressing convert', async ({ page }) => {
    const counts = { control: 0, committed: 0 };
    const editor = await openWriter(page, counts);
    await imeType(page, ['mera', 'naam', 'ali', 'hai']);
    await expect(editor).toHaveValue('میرا نام علی ہے ');
    expect(await caretAtEnd(editor)).toBe(true);
    await expect(page.locator('[data-batch-action]')).toBeHidden();
  });

  test('keyboard greetings get the corrected spelling', async ({ page }) => {
    const editor = await openWriter(page, { control: 0, committed: 0 });
    await imeType(page, ['assalam', 'o', 'alaikum']);
    await expect(editor).toHaveValue('السلام علیکم ');
  });

  test('words typed quickly before the first reply are all converted in place', async ({ page }) => {
    const editor = await openWriter(page, { control: 0, committed: 0 });
    await page.route(/inputtools\.google\.com\/request/, async route => {
      const text = new URL(route.request().url()).searchParams.get('text');
      await new Promise(resolve => setTimeout(resolve, 300));
      return route.fulfill({
        status: 200,
        headers: { 'access-control-allow-origin': '*' },
        contentType: 'application/json',
        body: JSON.stringify(['SUCCESS', [[text, [PROVIDER[text] || text]]]])
      });
    });
    await imeType(page, ['mera', 'naam', 'ali']);
    await expect(editor).toHaveValue('میرا نام علی ');
    expect(await caretAtEnd(editor)).toBe(true);
  });

  test('replies that arrive together while the next word is composing all land in place', async ({ page }) => {
    const editor = await openWriter(page, { control: 0, committed: 0 });
    const held = [];
    await page.route(/inputtools\.google\.com\/request/, route => { held.push(route); });
    await imeType(page, ['assalam', 'o']);
    await expect.poll(() => held.length).toBe(2);
    // The keyboard is now building the next word when both replies arrive.
    const cdp = await page.context().newCDPSession(page);
    const unidentified = { type: 'rawKeyDown', windowsVirtualKeyCode: 229, key: 'Unidentified', code: '' };
    await cdp.send('Input.dispatchKeyEvent', unidentified);
    await cdp.send('Input.imeSetComposition', { text: 'ala', selectionStart: 3, selectionEnd: 3 });
    for (const route of held.splice(0)) {
      const text = new URL(route.request().url()).searchParams.get('text');
      await route.fulfill({
        status: 200,
        headers: { 'access-control-allow-origin': '*' },
        contentType: 'application/json',
        body: JSON.stringify(['SUCCESS', [[text, [PROVIDER[text] || text]]]])
      });
    }
    await page.waitForTimeout(300);
    await expect(editor).toHaveValue('assalam o ala', { timeout: 1000 });
    await page.unroute(/inputtools\.google\.com\/request/);
    await page.route(/inputtools\.google\.com\/request/, route => {
      const text = new URL(route.request().url()).searchParams.get('text');
      return route.fulfill({
        status: 200,
        headers: { 'access-control-allow-origin': '*' },
        contentType: 'application/json',
        body: JSON.stringify(['SUCCESS', [[text, [PROVIDER[text] || text]]]])
      });
    });
    await cdp.send('Input.insertText', { text: 'alaikum' });
    await cdp.send('Input.dispatchKeyEvent', unidentified);
    await cdp.send('Input.insertText', { text: ' ' });
    await expect(editor).toHaveValue('السلام علیکم ');
    expect(await caretAtEnd(editor)).toBe(true);
  });

  test('direct mode keeps keyboard words exactly as typed', async ({ page }) => {
    const counts = { control: 0, committed: 0 };
    const editor = await openWriter(page, counts);
    await page.locator('[data-input-mode-option="direct"]').first().click();
    await editor.click();
    await imeType(page, ['mera', 'naam']);
    await page.waitForTimeout(500);
    await expect(editor).toHaveValue('mera naam ');
    expect(counts.committed).toBe(0);
  });

  test('English-letter mode turns off autocorrect and capitals; direct mode restores them', async ({ page }) => {
    const editor = await openWriter(page, { control: 0, committed: 0 });
    await expect(editor).toHaveAttribute('autocorrect', 'off');
    await expect(editor).toHaveAttribute('autocapitalize', 'off');
    await expect(editor).toHaveAttribute('spellcheck', 'false');
    await page.locator('[data-input-mode-option="direct"]').first().click();
    await expect(editor).not.toHaveAttribute('autocorrect', 'off');
    await expect(editor).not.toHaveAttribute('autocapitalize', 'off');
    await expect(editor).not.toHaveAttribute('spellcheck', 'false');
  });
});

test.describe('physical keyboard', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test('real key presses are converted once, by the Google control only', async ({ page }) => {
    const counts = { control: 0, committed: 0 };
    const editor = await openWriter(page, counts);
    for (const word of ['mera', 'naam', 'ali', 'hai']) {
      const before = await editor.inputValue();
      await page.keyboard.type(word + ' ');
      await expect.poll(() => editor.inputValue()).not.toBe(before + word + ' ');
    }
    await expect(editor).toHaveValue('میرا نام علی ہے ');
    expect(counts.committed, 'no second conversion path for real keys').toBe(0);
    expect(counts.control).toBeGreaterThanOrEqual(4);
  });
});
