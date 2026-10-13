const { test, expect } = require('@playwright/test');

// The wedding maker draws every card (hero, thumbnails, preview, export) with one canvas
// renderer and needs no third-party script; web fonts are blocked like everywhere else in
// this suite, so cards render with fallback fonts here.
const blockExternal = (page) => page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, (route) => route.abort());

const DRAFT_KEY = 'writeUrdu.weddingProject.draft.v1';

async function open(page, viewport) {
  if (viewport) await page.setViewportSize(viewport);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.locator('[data-wm-event-tile], [data-wm-event-type]').first()).toBeVisible();
  return errors;
}

async function canvasHasInk(page, selector) {
  return page.locator(selector).first().evaluate((canvas) => {
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let painted = 0;
    for (let i = 3; i < data.length; i += 4 * 97) if (data[i] > 0) painted += 1;
    return painted > 50;
  });
}

async function draft(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), DRAFT_KEY);
}

async function goToStep(page, step) {
  await page.locator(`[data-wm-progress] [data-wm-goto="${step}"]`).click();
  await expect(page.locator(`[data-wm-step="${step}"]`)).toBeVisible();
}

test('WU-SHAADI-001 maker: first visit shows real invitations before any typing', async ({ page }) => {
  const errors = await open(page, { width: 1366, height: 900 });
  await expect(page.locator('h1')).toHaveText('Urdu Wedding Invitation Maker');
  await expect(page.locator('[data-wm-start]')).toBeVisible();
  await expect.poll(() => canvasHasInk(page, '[data-wm-hero-card="1"]')).toBe(true);
  await expect.poll(() => canvasHasInk(page, '[data-wm-preview-canvas]')).toBe(true);
  // Nikah, Mehndi, Baraat and Walima are first-class, visual choices.
  for (const type of ['nikah', 'mehndi', 'baraat', 'walima']) {
    await expect(page.locator(`.wm-event-tile[data-wm-event-type="${type}"]`)).toBeVisible();
  }
  await expect(page.locator('.wm-event-tile[aria-checked="true"]')).toHaveCount(1);
  // Empty fields are shown with flagged sample text, never an empty rectangle.
  await expect(page.locator('[data-wm-sample-note]')).toBeVisible();
  expect(errors).toEqual([]);
});

test('WU-SHAADI-001 maker: picking an event re-orders designs and the picker uses large previews', async ({ page }) => {
  await open(page, { width: 1366, height: 900 });
  await page.locator('.wm-event-tile[data-wm-event-type="mehndi"]').click();
  await goToStep(page, 'design');
  const tiles = page.locator('[data-wm-design-grid] .wm-design-tile');
  await expect(tiles).toHaveCount(6);
  await expect(tiles.first()).toHaveAttribute('data-wm-design', 'mehndi-marigold');
  const box = await tiles.first().locator('canvas').boundingBox();
  expect(box.width).toBeGreaterThan(150);
  await expect.poll(() => canvasHasInk(page, '[data-wm-design-grid] canvas')).toBe(true);
  await page.locator('[data-wm-see-all]').click();
  await expect(tiles).toHaveCount(16);
  await page.locator('[data-wm-filter="modern"]').click();
  const modern = await tiles.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-wm-design')));
  expect(modern).toContain('minimal-modern');
  expect(modern).not.toContain('royal-maroon');
});

test('WU-SHAADI-001 maker: Urdu Nikah details survive design changes and reload', async ({ page }) => {
  await open(page, { width: 1366, height: 900 });
  await goToStep(page, 'details');
  await page.locator('[data-wm-language="urdu"]').click();
  await page.fill('[data-wm-field="bride"]', 'عائشہ');
  await page.fill('[data-wm-field="groom"]', 'احمد');
  await page.fill('[data-wm-field="date"]', '2026-11-22');
  await page.fill('[data-wm-field="time"]', '19:00');
  await page.fill('[data-wm-field="venue"]', 'پرل گارڈن');
  await expect(page.locator('[data-wm-field="bride"]')).toHaveAttribute('dir', 'rtl');
  await page.locator('details.wm-more > summary').click();
  await page.locator('[data-wm-host="bride_side"]').click();
  await page.fill('[data-wm-field="brideFamily"]', 'جناب و بیگم طارق خان');
  await page.fill('[data-wm-field="brideParents"]', 'بنتِ جناب طارق خان');
  await page.fill('[data-wm-field="rsvp"]', '0300 1234567');

  await goToStep(page, 'design');
  await page.locator('[data-wm-filter="all"]').click();
  await page.locator('[data-wm-design="jaali"]').click();
  await expect(page.locator('[data-wm-design="jaali"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-wm-colorway="sandstone"]').click();

  await goToStep(page, 'details');
  await expect(page.locator('[data-wm-field="bride"]')).toHaveValue('عائشہ');
  await expect(page.locator('[data-wm-field="venue"]')).toHaveValue('پرل گارڈن');

  await page.waitForTimeout(400);
  const saved = await draft(page);
  expect(saved.couple.personA.displayName).toBe('عائشہ');
  expect(saved.events[0].selectedBackgroundId).toBe('jaali');
  expect(saved.events[0].designColorway).toBe('sandstone');
  expect(saved.events[0].rsvpText).toBe('0300 1234567');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await goToStep(page, 'details');
  await expect(page.locator('[data-wm-field="groom"]')).toHaveValue('احمد');
  await expect(page.locator('[data-wm-field="date"]')).toHaveValue('2026-11-22');
});

test('WU-SHAADI-001 maker: a wedding suite keeps each event’s details separate', async ({ page }) => {
  await open(page, { width: 1366, height: 900 });
  await page.locator('.wm-event-tile[data-wm-event-type="mehndi"]').click();
  for (let i = 0; i < 3; i += 1) await page.locator('[data-wm-add-event]').first().click();
  const chips = page.locator('[data-wm-events-bar] [data-wm-event-id]');
  await expect(chips).toHaveCount(4);
  await expect(chips).toContainText(['Mehndi', 'Nikah', 'Baraat', 'Walima']);

  // One design for the suite; every event gets its own colourway.
  await goToStep(page, 'design');
  await page.locator('[data-wm-filter="all"]').click();
  await page.locator('[data-wm-design="mughal-garden"]').click();

  const dates = ['2026-12-17', '2026-12-18', '2026-12-19', '2026-12-20'];
  await goToStep(page, 'details');
  for (let i = 0; i < 4; i += 1) {
    await chips.nth(i).click();
    await page.fill('[data-wm-field="date"]', dates[i]);
    await page.fill('[data-wm-field="venue"]', `Venue ${i + 1}`);
  }
  for (let i = 0; i < 4; i += 1) {
    await chips.nth(i).click();
    await expect(page.locator('[data-wm-field="date"]')).toHaveValue(dates[i]);
    await expect(page.locator('[data-wm-field="venue"]')).toHaveValue(`Venue ${i + 1}`);
  }
  await page.waitForTimeout(400);
  const saved = await draft(page);
  expect(saved.events.map((event) => event.type)).toEqual(['mehndi', 'nikah', 'baraat', 'walima']);
  expect(new Set(saved.events.map((event) => event.selectedBackgroundId))).toEqual(new Set(['mughal-garden']));
  expect(saved.events.map((event) => event.date)).toEqual(dates);

  await goToStep(page, 'share');
  await expect(page.locator('[data-wm-download-all]')).toBeVisible();
  await chips.nth(3).locator('xpath=following-sibling::button').click();
  await expect(chips).toHaveCount(3);
});

test('WU-SHAADI-001 maker: share step exports a PNG and never invents missing details', async ({ page }) => {
  await open(page, { width: 1366, height: 900 });
  await goToStep(page, 'details');
  await page.locator('[data-wm-language="english"]').click();
  await page.fill('[data-wm-field="bride"]', 'Ayesha');
  await goToStep(page, 'share');
  await expect(page.locator('[data-wm-missing]')).toContainText('groom’s name');
  await expect(page.locator('[data-wm-missing]')).toContainText('date');

  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-wm-download]').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('nikah-invitation.png');

  await page.locator('[data-wm-size="print"]').click();
  await expect(page.locator('[data-wm-size="print"]')).toHaveAttribute('aria-checked', 'true');
  const printPromise = page.waitForEvent('download');
  await page.locator('[data-wm-download]').click();
  expect((await printPromise).suggestedFilename()).toBe('nikah-invitation-print.png');

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.locator('[data-wm-copy]').click();
  await expect(page.locator('[data-wm-share-status]')).toContainText('copied');
});

test('WU-SHAADI-001 maker: complete flow at 360px without horizontal overflow', async ({ page }) => {
  const errors = await open(page, { width: 360, height: 760 });
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(await overflow()).toBeLessThanOrEqual(0);
  await expect(page.locator('[data-wm-mobile-bar]')).toBeVisible();
  await page.locator('.wm-event-tile[data-wm-event-type="walima"]').click();
  await page.locator('[data-wm-mobile-next]').click();
  await expect(page.locator('[data-wm-step="design"]')).toBeVisible();
  expect(await overflow()).toBeLessThanOrEqual(0);
  await page.locator('[data-wm-mobile-next]').click();
  await expect(page.locator('[data-wm-step="details"]')).toBeVisible();
  await page.locator('[data-wm-language="bilingual"]').click();
  await page.fill('[data-wm-field="bride"]', 'Ayesha Khan');
  await page.fill('[data-wm-field="groom"]', 'Muhammad Abdul Rehman Yousafzai');
  await page.fill('[data-wm-field="date"]', '2026-12-20');
  await page.fill('[data-wm-field="venue"]', 'The Grand Marquee & Banquet Hall, Main Boulevard, DHA Phase 6');
  expect(await overflow()).toBeLessThanOrEqual(0);
  await page.locator('.wm-mobile-preview').click();
  await expect(page.locator('[data-wm-lightbox]')).toBeVisible();
  await page.locator('[data-wm-lightbox] [data-wm-close-full]').first().click();
  await page.locator('[data-wm-mobile-next]').click();
  await expect(page.locator('[data-wm-step="share"]')).toBeVisible();
  await expect(page.locator('[data-wm-share-card] canvas')).toBeVisible();
  await expect.poll(() => canvasHasInk(page, '[data-wm-share-card] canvas')).toBe(true);
  const whatsapp = page.locator('[data-wm-whatsapp]');
  await expect(whatsapp).toBeVisible();
  const box = await whatsapp.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-wm-download]').click();
  expect((await downloadPromise).suggestedFilename()).toBe('walima-invitation.png');
  expect(await overflow()).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test('WU-SHAADI-001 maker: keyboard users can choose events and designs', async ({ page }) => {
  await open(page, { width: 1366, height: 900 });
  await page.locator('.wm-event-tile[data-wm-event-type="nikah"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.wm-event-tile[data-wm-event-type="mehndi"]')).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('.wm-event-tile[data-wm-event-type="mehndi"]')).toBeFocused();
  await goToStep(page, 'design');
  const second = page.locator('[data-wm-design-grid] .wm-design-tile').nth(1);
  await second.focus();
  await page.keyboard.press('Enter');
  await expect(second).toHaveAttribute('aria-pressed', 'true');
});
