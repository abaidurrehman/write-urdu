const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function captureEvents(page) {
  const events = [];
  await page.route('**/api/events', async route => {
    const body = route.request().postDataJSON();
    for (const event of (body && body.events) || []) events.push(event);
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  return events;
}

async function open(page, route) {
  await blockExternalServices(page);
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached' });
  await page.waitForFunction(() => Boolean(window.WriteUrduTelemetry && window.WriteUrduWorkspaceNextStep), null, { timeout: 10000 });
}

// flush() sends at most ten queued events per call, so drain it repeatedly.
async function flush(page) {
  for (let i = 0; i < 5; i += 1) await page.evaluate(() => window.WriteUrduTelemetry.flush(false));
  await page.waitForTimeout(300);
}

// Network delivery is asynchronous: keep draining the queue until the count is observed.
const countAfterFlush = (page, events, stage, recommendation) => async () => {
  await flush(page);
  return pathEvents(events, stage, recommendation).length;
};

const pathEvents = (events, stage, recommendation) => events.filter(event =>
  event.event_name === 'continuation_path_' + stage && (!recommendation || event.recommendation_id === recommendation));

test.describe('continuation `shown` means the recommendation was actually in the viewport', () => {
  test.use({ viewport: { width: 390, height: 700 } });

  test('below-the-fold recommendations are eligible on render but only shown once scrolled into view', async ({ page }) => {
    const events = await captureEvents(page);
    await open(page, '/');
    await page.locator('#transliterateTextarea').fill('میرا اردو اسائنمنٹ تیار ہے اور مکمل ہے');
    const richAction = page.locator('[data-wu-next-step-version="2"] [data-wu-next-step-action="basic-to-rich"]');
    await expect(richAction).toBeVisible({ timeout: 10000 });

    await page.evaluate(() => window.scrollTo(0, 0));
    const belowFold = await richAction.evaluate(node => node.getBoundingClientRect().top > window.innerHeight);
    expect(belowFold, 'premise: the recommendation must start below the fold at this viewport').toBe(true);

    await page.waitForTimeout(600);
    await flush(page);
    expect(pathEvents(events, 'eligible', 'basic-to-rich').length, 'eligible still records DOM presence').toBe(1);
    expect(pathEvents(events, 'shown'), 'nothing below the fold may count as shown').toHaveLength(0);

    await richAction.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await flush(page);
    for (const id of ['basic-to-rich', 'basic-to-card']) {
      expect(pathEvents(events, 'shown', id).length, id + ' becomes shown once visible').toBe(1);
    }
    expect(pathEvents(events, 'shown', 'basic-to-templates'), 'closed "More options" actions are never shown').toHaveLength(0);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await richAction.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await flush(page);
    expect(pathEvents(events, 'shown', 'basic-to-rich'), 'scrolling away and back must not double count').toHaveLength(1);
  });

  test('actions inside "More options" become shown only after the disclosure is opened and visible', async ({ page }) => {
    const events = await captureEvents(page);
    await open(page, '/');
    await page.locator('#transliterateTextarea').fill('مزید اختیارات دیکھنے کے لیے مکمل اردو متن');
    const more = page.locator('[data-wu-next-step-version="2"] details.wu-continue-more');
    await expect(more).toBeVisible({ timeout: 10000 });
    await more.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect.poll(countAfterFlush(page, events, 'eligible', 'basic-to-templates'), { message: 'closed action is still eligible', timeout: 8000 }).toBe(1);
    expect(pathEvents(events, 'shown', 'basic-to-templates'), 'closed disclosure must not count as shown').toHaveLength(0);

    await more.locator('summary').click();
    await more.locator('[data-wu-next-step-action="basic-to-templates"]').scrollIntoViewIfNeeded();
    await expect.poll(countAfterFlush(page, events, 'shown', 'basic-to-templates'), { message: 'opened action becomes shown', timeout: 8000 }).toBe(1);
  });

  test('recommendations that render long after page load are still observed', async ({ page }) => {
    await page.clock.install();
    const events = await captureEvents(page);
    await open(page, '/');
    // Past the original 20-second discovery window.
    await page.clock.runFor(25000);
    await page.locator('#transliterateTextarea').fill('دیر سے لکھا ہوا مکمل اردو متن');
    const richAction = page.locator('[data-wu-next-step-version="2"] [data-wu-next-step-action="basic-to-rich"]');
    await expect(richAction).toBeVisible({ timeout: 10000 });
    await richAction.scrollIntoViewIfNeeded();
    await page.clock.runFor(1000);
    await page.waitForTimeout(600);
    await flush(page);
    expect(pathEvents(events, 'eligible', 'basic-to-rich').length, 'late panel is eligible').toBe(1);
    expect(pathEvents(events, 'shown', 'basic-to-rich').length, 'late panel is shown once in view').toBe(1);
  });
});

test.describe('destination-side continuation events exist for Basic Writer and Text Cleaner', () => {
  test('Voice to Basic Writer reports destination ready, payload restored and a real-edit meaningful start', async ({ page }) => {
    const events = await captureEvents(page);
    await open(page, '/tools/urdu-voice-typing');
    await page.locator('#voiceTranscript').fill('آواز سے تیار کیا ہوا اردو متن');
    const action = page.locator('[data-wu-next-step-version="2"] [data-wu-next-step-action="voice-to-basic"]');
    await expect(action).toBeVisible({ timeout: 10000 });
    await action.click();
    await page.waitForURL(/\/$|\/\?/, { timeout: 10000 });
    await page.waitForFunction(() => Boolean(window.WriteUrduTelemetry), null, { timeout: 10000 });
    await expect(page.locator('#transliterateTextarea')).toHaveValue('آواز سے تیار کیا ہوا اردو متن', { timeout: 10000 });
    await flush(page);

    await expect.poll(countAfterFlush(page, events, 'destination_ready', 'voice-to-basic'), { message: 'destination_ready', timeout: 8000 }).toBe(1);
    await expect.poll(countAfterFlush(page, events, 'payload_restored', 'voice-to-basic'), { message: 'payload_restored', timeout: 8000 }).toBe(1);
    expect(pathEvents(events, 'meaningful_start', 'voice-to-basic'), 'the import itself is not a meaningful start').toHaveLength(0);

    const destination = pathEvents(events, 'payload_restored', 'voice-to-basic')[0];
    expect(destination.source_workspace).toBe('voice-typing');
    expect(destination.destination_workspace).toBe('basic-writer');

    await page.locator('#transliterateTextarea').pressSequentially(' مزید');
    await expect.poll(countAfterFlush(page, events, 'meaningful_start', 'voice-to-basic'), { message: 'first real edit counts', timeout: 8000 }).toBe(1);
  });

  test('Image text to Text Cleaner reports destination ready, payload restored and a real interaction meaningful start', async ({ page }) => {
    const events = await captureEvents(page);
    await open(page, '/urdu-ocr');
    await page.locator('[data-ocr-start]').evaluate(button => { button.disabled = false; });
    await page.locator('[data-ocr-start]').click();
    await page.evaluate(() => {
      setTimeout(() => { document.querySelector('#ocrResult').value = 'تصویر سے نکالا ہوا اردو متن'; }, 300);
    });
    const action = page.locator('[data-wu-next-step-version="2"] [data-wu-next-step-action="image-text-to-cleaner"]');
    await expect(action).toBeVisible({ timeout: 10000 });
    await action.click();
    await page.waitForURL(/urdu-text-cleaner/, { timeout: 10000 });
    await page.waitForFunction(() => Boolean(window.WriteUrduTelemetry), null, { timeout: 10000 });
    await expect(page.locator('#cleanerSource')).toHaveValue('تصویر سے نکالا ہوا اردو متن', { timeout: 10000 });
    await flush(page);

    await expect.poll(countAfterFlush(page, events, 'destination_ready', 'image-text-to-cleaner'), { message: 'destination_ready', timeout: 8000 }).toBe(1);
    await expect.poll(countAfterFlush(page, events, 'payload_restored', 'image-text-to-cleaner'), { message: 'payload_restored', timeout: 8000 }).toBe(1);
    expect(pathEvents(events, 'meaningful_start', 'image-text-to-cleaner'), 'the automatic analyze after import is not a meaningful start').toHaveLength(0);

    await page.locator('#cleanerSource').pressSequentially(' اضافی');
    await expect.poll(countAfterFlush(page, events, 'meaningful_start', 'image-text-to-cleaner'), { message: 'first real edit counts', timeout: 8000 }).toBe(1);
  });
});
