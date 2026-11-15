const { test, expect } = require('@playwright/test');

// Finish-the-task fixes from the 2026-11-14 Product Pulse refresh
// (docs/audits/product-pulse-7d-2026-11-14, F-1, M-11, M-3).
// - F-1: Copy must still work when the async Clipboard API rejects, and its
//   failure message must not tell touch users to press Ctrl+C.
// - M-11: a native copy (Ctrl+C, context menu, long-press) of writer text is a
//   completion and must be counted, once, without sending any text.
// - M-3: one trusted Card Studio Download click is one export attempt, even
//   though the font guard replays it as a synthetic click.

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:\d+)/, route => route.abort());

async function captureEvents(page) {
  const events = [];
  await page.route('**/api/events', async route => {
    const body = route.request().postDataJSON();
    for (const event of (body && body.events) || []) events.push(event);
    await route.fulfill({ status: 202, contentType: 'application/json', body: '{"accepted":1}' });
  });
  return events;
}

async function flush(page) {
  for (let i = 0; i < 5; i += 1) await page.evaluate(() => window.WriteUrduTelemetry.flush(false));
  await page.waitForTimeout(300);
}

async function openHome(page) {
  await blockExternalServices(page);
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => Boolean(window.WriteUrduTelemetry && document.querySelector('[data-wu-basic-command-toolbar]')), null, { timeout: 10000 });
  await page.waitForTimeout(400);
}

async function fillEditor(page, text) {
  await page.locator('#transliterateTextarea').evaluate((node, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, text);
}

const rejectClipboardApi = () => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: () => Promise.reject(new DOMException('denied', 'NotAllowedError')) }
  });
};

const named = (events, name) => events.filter(event => event.event_name === name);
const toast = page => page.locator('#appNotifications');

test.describe('desktop copy', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test('Copy falls back to the selection copy when the Clipboard API rejects', async ({ page }) => {
    await page.addInitScript(rejectClipboardApi);
    const events = await captureEvents(page);
    await openHome(page);
    await fillEditor(page, 'سلام دنیا');
    await page.locator('[data-wu-command-action="copy"]').first().click();
    await expect(toast(page)).toHaveText(/copied to the clipboard/i);
    await expect.poll(async () => { await flush(page); return named(events, 'copy_completed').length; }, { timeout: 6000 }).toBe(1);
    const formats = named(events, 'copy_completed').map(event => event.format);
    expect(formats, 'the fallback copy is one button copy, not also a native copy').toEqual(['clipboard']);
  });

  test('a keyboard copy of writer text counts once as a native copy, with no text sent', async ({ page }) => {
    const events = await captureEvents(page);
    await openHome(page);
    await fillEditor(page, 'سلام دنیا');
    const editor = page.locator('#transliterateTextarea');
    await editor.focus();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+c');
    await flush(page);
    const copies = named(events, 'copy_completed');
    expect(copies, 'repeated Ctrl+C within seconds is one completion').toHaveLength(1);
    expect(copies[0].format).toBe('native');
    expect(JSON.stringify(copies[0])).not.toContain('سلام');
  });
});

test.describe('touch copy', () => {
  test.use({ viewport: { width: 390, height: 760 }, hasTouch: true, isMobile: true });

  test('a failed copy on a touch device explains long-press, not Ctrl+C', async ({ page }) => {
    await page.addInitScript(rejectClipboardApi);
    await page.addInitScript(() => { document.execCommand = () => false; });
    await captureEvents(page);
    await openHome(page);
    await fillEditor(page, 'سلام دنیا');
    await page.locator('[data-wu-command-action="copy"]').first().click();
    await expect(toast(page)).toHaveText(/copy failed/i);
    await expect(toast(page)).not.toHaveText(/ctrl\+c/i);
    await expect(toast(page)).toHaveText(/press and hold/i);
  });
});

test.describe('card studio export attempts', () => {
  test.use({ viewport: { width: 1366, height: 768 }, acceptDownloads: true });

  test('one Download click is one export attempt', async ({ page }) => {
    const events = await captureEvents(page);
    await blockExternalServices(page);
    await page.goto('/urdu-card-studio', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForFunction(() => Boolean(window.WriteUrduTelemetry && document.querySelector('[data-card-studio]')), null, { timeout: 10000 });
    await page.waitForTimeout(600);
    await page.locator('[data-card-studio] [data-card-action="download"]').first().click();
    await page.waitForTimeout(2500);
    await flush(page);
    expect(named(events, 'card_studio_export_attempted')).toHaveLength(1);
  });
});
