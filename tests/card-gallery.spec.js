const { test, expect } = require('@playwright/test');

const blockExternal = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function openGallery(page) {
  await blockExternal(page);
  await page.goto('/urdu-card-gallery', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('See your Urdu on every card');
  await expect(page.locator('[data-card-gallery-preview]')).toHaveCount(24);
}

test('live Urdu updates reuse 24 DOM previews without canvas or image refetch', async ({ page }) => {
  const requests = [];
  page.on('request', request => {
    requests.push({ url: request.url(), body: request.postData() || '' });
  });
  await openGallery(page);
  await page.evaluate(() => {
    window.__galleryLongTasks = [];
    if (window.PerformanceObserver && PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      const observer = new PerformanceObserver(list => {
        window.__galleryLongTasks.push(...list.getEntries().map(entry => entry.duration));
      });
      observer.observe({ type: 'longtask', buffered: false });
    }
  });
  const firstPreview = page.locator('[data-card-gallery-preview]').first();
  const firstHandle = await firstPreview.elementHandle();
  const sentinel = 'محبت روشنی ہے\nWU-GALLERY-PRIVATE-7419';
  await page.locator('[data-card-gallery-input]').fill(sentinel);
  await expect(firstPreview.locator('.card-gallery-preview-text')).toHaveText(sentinel);
  await expect(firstPreview).toHaveAttribute('data-text-tier', 'short');
  expect(await firstHandle.evaluate((node, selector) => node === document.querySelector(selector), '[data-card-gallery-preview]')).toBe(true);
  expect(await page.locator('canvas').count()).toBe(0);
  expect(page.url()).not.toContain('WU-GALLERY-PRIVATE-7419');
  expect(requests.every(request => !request.url.includes('WU-GALLERY-PRIVATE-7419') && !request.body.includes('WU-GALLERY-PRIVATE-7419'))).toBe(true);
  const requestsAfterFirstFill = requests.filter(request => request.url.includes('/assets/card-studio/backgrounds/')).length;
  await page.locator('[data-card-gallery-input]').fill('زندگی کے سفر میں حوصلہ قائم رکھیں\nمشکل راستے بھی آسان ہو جاتے ہیں\nاپنے لفظوں میں محبت کی خوشبو بسائیں\nہر دل تک نرمی کا پیغام پہنچائیں\nوقت بدلتا ہے تو منظر بھی بدلتے ہیں\nمگر سچی امید ہمیشہ ساتھ رہتی ہے');
  await expect(firstPreview).toHaveAttribute('data-text-tier', 'long');
  await page.waitForTimeout(100);
  expect(requests.filter(request => request.url.includes('/assets/card-studio/backgrounds/')).length).toBe(requestsAfterFirstFill);
  expect(requests.filter(request => /\/backgrounds\/[^/]+\.webp(?:\?|$)/.test(request.url))).toHaveLength(0);
  expect(await page.evaluate(() => window.WriteUrduCardGalleryApp.getDiagnostics())).toMatchObject({ shells: 24, renders: 1, bucket: 'long' });
  expect(await page.evaluate(() => Math.max(0, ...window.__galleryLongTasks))).toBeLessThan(50);
});

test('filters remain accessible and preserve text', async ({ page }) => {
  await openGallery(page);
  const input = page.locator('[data-card-gallery-input]');
  await input.fill('امید کا چراغ جلائے رکھیں');
  const filter = page.getByRole('button', { name: 'Truck Art · ٹرک آرٹ', exact: true });
  await filter.focus();
  await page.keyboard.press('Enter');
  await expect(filter).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-card-gallery-preview]:visible')).toHaveCount(2);
  await expect(page.locator('[data-card-gallery-preview]:visible .card-gallery-preview-text').first()).toHaveText('امید کا چراغ جلائے رکھیں');
});

test('mobile page has no horizontal overflow and input stays obvious', async ({ page }) => {
  await openGallery(page);
  const viewports = [
    { width: 360, height: 800 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 412, height: 915 },
    { width: 768, height: 1024 }
  ];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await expect(page.locator('[data-card-gallery-input]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() => document.querySelector('[data-card-gallery-filters]').scrollWidth > document.querySelector('[data-card-gallery-filters]').clientWidth)).toBe(true);
});

test('chosen design reaches Card Studio with exact editable text and remains exportable', async ({ page }) => {
  const telemetryBodies = [];
  await page.route('**/api/events', async route => {
    telemetryBodies.push(route.request().postData() || '');
    await route.fulfill({ status: 202, contentType: 'application/json', body: '{"accepted":1}' });
  });
  await openGallery(page);
  const sentinel = '  امید روشن ہے\nWU-GALLERY-HANDOFF-9274  ';
  await page.locator('[data-card-gallery-input]').fill(sentinel);
  await page.locator('[data-card-gallery-choose="black-gold-classic"]').click();
  await expect(page).toHaveURL(/\/urdu-card-studio$/);
  expect(page.url()).not.toContain('WU-GALLERY-HANDOFF-9274');
  await expect(page.locator('html')).toHaveAttribute('data-wu-card-seed-applied', 'live', { timeout: 20000 });
  await expect(page.locator('#cardText')).toHaveValue(sentinel);
  await expect(page.locator('[data-card-built-in-background="black-gold-classic"]')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => {
    const state = window.WriteUrduCardStudioApp && window.WriteUrduCardStudioApp.getState();
    return state && [state.background.type, state.text.color, state.text.value];
  }), { timeout: 20000 }).toEqual(['image', '#f3dfac', sentinel]);

  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-card-action="download"]:visible').first().click();
  expect((await downloadPromise).suggestedFilename()).toMatch(/\.png$/);
  await page.evaluate(() => window.WriteUrduTelemetry && window.WriteUrduTelemetry.flush(true));
  await page.waitForTimeout(200);
  expect(telemetryBodies.every(body => !body.includes('WU-GALLERY-HANDOFF-9274'))).toBe(true);
  const eventNames = telemetryBodies.flatMap(body => {
    try { return JSON.parse(body).events.map(event => event.event_name); } catch { return []; }
  });
  expect(eventNames).toEqual(expect.arrayContaining([
    'card_gallery_previews_visible', 'card_gallery_first_input',
    'card_gallery_design_selected', 'card_gallery_handoff_started',
    'card_gallery_destination_ready'
  ]));
});

test('invalid background preserves text without claiming design success', async ({ page }) => {
  await openGallery(page);
  const text = 'متن محفوظ رہے\nINVALID-BACKGROUND-51';
  await page.evaluate(value => {
    window.WriteUrduWorkspaceHandoff.transfer({
      sourceWorkspace: 'card-gallery', sourceRoute: '/urdu-card-gallery',
      targetWorkspace: 'card-studio', targetRoute: '/urdu-card-studio',
      actionId: 'gallery-to-card', kind: 'visual-project-seed',
      payload: { text: value, backgroundId: 'missing-background' },
      context: { recommendationId: 'gallery-to-card', pathVersion: 'card-gallery-v1', releaseMarker: 'wu-card-gallery-s2-2026-09-13-v1', textLengthBucket: 'short' }
    });
  }, text);
  await page.goto('/urdu-card-studio', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-wu-card-seed-applied', 'text-only', { timeout: 20000 });
  await expect(page.locator('html')).toHaveAttribute('data-wu-card-seed-fallback', 'invalid-background');
  await expect(page.locator('#cardText')).toHaveValue(text);
  await expect(page.locator('[data-card-built-in-background][aria-pressed="true"]')).toHaveCount(0);
  expect(page.url()).not.toContain('INVALID-BACKGROUND-51');
});
