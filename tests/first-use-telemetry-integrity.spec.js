const { test, expect } = require('@playwright/test');

// First-use funnel integrity on the Basic Writer (2026-10-18 investigation).
// writer_first_input must mean the writer put text in the editor, and
// writer_outcome_first must mean a real outcome (copy/export/print/share).
// Before this fix a lone Shift/Alt press in the autofocused desktop editor, a
// mode-button tap or any toolbar click recorded first input and engagement
// with an empty editor, which filled the "0 characters" bucket of Product
// Pulse and inflated the mobile first-input gate metric.

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

async function open(page) {
  await blockExternalServices(page);
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => Boolean(window.WriteUrduTelemetry && document.querySelector('[data-wu-basic-command-toolbar]')), null, { timeout: 10000 });
  await page.waitForTimeout(400);
}

async function flush(page) {
  for (let i = 0; i < 5; i += 1) await page.evaluate(() => window.WriteUrduTelemetry.flush(false));
  await page.waitForTimeout(300);
}

const named = (events, name) => events.filter(event => event.event_name === name);

test.describe('desktop first-use telemetry', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test('modifier keys in the empty autofocused editor are not input or engagement', async ({ page }) => {
    const events = await captureEvents(page);
    await open(page);
    await page.locator('#transliterateTextarea').focus();
    await page.keyboard.press('Shift');
    await page.keyboard.press('Alt');
    await page.keyboard.press('Control+a');
    await flush(page);
    expect(named(events, 'writer_first_input'), 'no text was entered').toHaveLength(0);
    expect(named(events, 'editor_engaged'), 'modifier keys alone are not engagement').toHaveLength(0);
  });

  test('a non-outcome toolbar click is not a writer outcome; Copy is', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const events = await captureEvents(page);
    await open(page);
    await page.locator('#transliterateTextarea').click();
    await page.keyboard.type('salam dunya', { delay: 20 });
    await flush(page);
    expect(named(events, 'writer_first_input'), 'typing is first input').toHaveLength(1);

    await page.locator('[data-wu-command-action="download-menu"]').first().click();
    await flush(page);
    expect(named(events, 'writer_outcome_first'), 'opening a menu is not an outcome').toHaveLength(0);
    await page.keyboard.press('Escape');

    await page.locator('[data-wu-command-action="copy"]').first().click();
    await expect.poll(async () => { await flush(page); return named(events, 'copy_completed').length; }, { timeout: 6000 }).toBe(1);
    expect(named(events, 'writer_outcome_first'), 'Copy is the first outcome').toHaveLength(1);
  });
});

test.describe('mobile first-use telemetry', () => {
  test.use({ viewport: { width: 390, height: 760 }, hasTouch: true, isMobile: true });

  test('tapping an input-mode button with an empty editor is not first input', async ({ page }) => {
    const events = await captureEvents(page);
    await open(page);
    await page.locator('[data-input-mode-option="direct"]').first().click();
    await flush(page);
    expect(named(events, 'writer_first_input'), 'mode choice is not text input').toHaveLength(0);

    await page.locator('#transliterateTextarea').click();
    await page.keyboard.type('abc', { delay: 20 });
    await flush(page);
    expect(named(events, 'writer_first_input'), 'typing after the mode choice is first input').toHaveLength(1);
  });
});
