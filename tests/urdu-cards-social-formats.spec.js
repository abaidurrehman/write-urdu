const { test, expect } = require('@playwright/test');
const cards = require('../js/urdu-cards-data.js').getAllCards();

const cardCount = cards.length;
const cardsById = Object.fromEntries(cards.map(card => [card.id, card]));
const blockExternal = page => page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, route => route.abort());

async function openCards(page) {
  await blockExternal(page);
  await page.goto('/urdu-cards', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.locator('.card-gallery-card')).toHaveCount(cardCount);
  await expect.poll(() => page.evaluate(() => Boolean(window.WriteUrduCardsSocialFormats))).toBe(true);
  await expect(page.locator('[data-urdu-cards-format-presets]')).toHaveCount(cardCount);
}

async function expectSocialSeed(page, target, text, presetId, socialMode, backgroundId) {
  await expect(page.locator('html')).toHaveAttribute('data-wu-social-seed-target', target, { timeout: 15000 });
  await expect(page.locator('html')).toHaveAttribute('data-wu-social-seed-applied', 'live', { timeout: 15000 });
  await expect(page.locator('#cardText')).toHaveValue(text);
  await expect(page.locator(`[data-card-built-in-background="${backgroundId}"]`)).toHaveAttribute('aria-pressed', 'true');
  const state = await page.evaluate(() => window.WriteUrduSocialDirectApp && window.WriteUrduSocialDirectApp.getState());
  expect(state).toMatchObject({ presetId, socialMode });
}

async function waitForContinuity(page, workspace) {
  await expect(page.locator(`[data-create-format-continuity="${workspace}"]`)).toBeVisible({ timeout: 15000 });
  await expect(page.locator(`[data-create-format-target="${workspace}"]`)).toHaveAttribute('aria-current', 'page');
}

test('each ready-made card offers editable Card, WhatsApp and Instagram destinations without replacing fast sharing', async ({ page }) => {
  await openCards(page);
  const card = page.locator('#card-dua-1');
  const formats = card.locator('[data-urdu-cards-format-presets]');
  await expect(formats).toContainText('Use this design for');
  await expect(formats.locator('[data-urdu-cards-format]')).toHaveCount(3);
  await expect(formats.locator('[data-urdu-cards-format="card"]')).toHaveText('Card');
  await expect(formats.locator('[data-urdu-cards-format="whatsapp"]')).toHaveText('WhatsApp Status');
  await expect(formats.locator('[data-urdu-cards-format="instagram"]')).toHaveText('Instagram Post');
  await expect(card.locator('[data-urdu-cards-whatsapp-status="dua-1"]')).toBeVisible();
  await expect(card.locator('[data-urdu-cards-image-share="dua-1"]')).toBeVisible();

  await formats.locator('[data-urdu-cards-format="card"]').click();
  await expect(page.locator('[data-urdu-cards-personalizer="dua-1"]')).toBeVisible();
  await expect(page).toHaveURL(/\/urdu-cards$/);
});

test('ready-made card continues into the WhatsApp Status Maker with its text, background and story preset', async ({ page }) => {
  await openCards(page);
  const card = cardsById['dua-1'];
  await page.locator('#card-dua-1 [data-urdu-cards-format="whatsapp"]').click();
  await expect(page).toHaveURL(/\/urdu-whatsapp-status-maker$/);
  expect(new URL(page.url()).search).toBe('');

  await expectSocialSeed(page, 'whatsapp-status', card.textUr, 'story', 'whatsapp', card.backgroundId);
  await expect.poll(() => page.evaluate(() => {
    const api = window.WriteUrduWorkspaceHandoff;
    return api && typeof api.peek === 'function' ? api.peek('whatsapp-status') : undefined;
  })).toBeNull();
});

test('custom own-words text continues into Instagram while keeping the chosen design and square preset', async ({ page }) => {
  await openCards(page);
  await page.locator('[data-urdu-cards-start-choice="own-words"]').click();
  const custom = 'اللہ آپ کے ہر نئے دن کو خوشیوں، آسانیوں اور محبت سے بھر دے۔';
  await page.locator('[data-urdu-cards-own-input]').fill(custom);

  const visibleCard = page.locator('.card-gallery-card:visible').first();
  const articleId = await visibleCard.getAttribute('id');
  const cardId = articleId.replace(/^card-/, '');
  const sourceCard = cardsById[cardId];
  expect(sourceCard).toBeTruthy();

  await visibleCard.locator('[data-urdu-cards-format="instagram"]').click();
  await expect(page).toHaveURL(/\/urdu-instagram-post-maker$/);
  expect(new URL(page.url()).search).toBe('');
  expect(page.url()).not.toContain(encodeURIComponent(custom));

  await expectSocialSeed(page, 'instagram-post', custom, 'square', 'instagram', sourceCard.backgroundId);
  await expect.poll(() => page.evaluate(() => {
    const api = window.WriteUrduWorkspaceHandoff;
    return api && typeof api.peek === 'function' ? api.peek('instagram-post') : undefined;
  })).toBeNull();
});

test('shared creation shell carries one edited project Card Studio → WhatsApp → Instagram → Card Studio', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-card-studio', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await waitForContinuity(page, 'card-studio');

  const firstText = 'یہ ایک ہی ڈیزائن مختلف سوشل فارمیٹس میں جاری رہتا ہے۔';
  await page.evaluate((text) => {
    const app = window.WriteUrduCardStudioApp;
    const core = window.WriteUrduCardStudio;
    let state = app.getState();
    state.text.value = text;
    state.text.fontFamily = 'Amiri';
    state.text.color = '#234567';
    state.text.align = 'right';
    state.background.type = 'solid';
    state.background.color = '#f1e9d8';
    state.watermark.enabled = true;
    state = core.applyPreset(state, 'portrait');
    app.replaceState(core.normalizeCardProject(state), { save: false });
    app.syncControls();
    app.requestRender();
  }, firstText);

  await page.locator('[data-create-format-target="whatsapp-status"]').click();
  await expect(page).toHaveURL(/\/urdu-whatsapp-status-maker$/);
  expect(new URL(page.url()).search).toBe('');
  await waitForContinuity(page, 'whatsapp-status');
  await expect(page.locator('html')).toHaveAttribute('data-wu-create-continuity-restored', 'true', { timeout: 15000 });

  let state = await page.evaluate(() => window.WriteUrduCardStudioApp && window.WriteUrduCardStudioApp.getState());
  expect(state).toMatchObject({
    presetId: 'story',
    socialMode: 'whatsapp',
    text: { value: firstText, fontFamily: 'Amiri', color: '#234567', align: 'right' },
    background: { type: 'solid', color: '#f1e9d8' },
    watermark: { enabled: true }
  });

  const secondText = 'واٹس ایپ میں ترمیم کے بعد یہی متن انسٹاگرام پر بھی جاتا ہے۔';
  await page.evaluate((text) => {
    const app = window.WriteUrduCardStudioApp;
    const core = window.WriteUrduCardStudio;
    const state = app.getState();
    state.text.value = text;
    state.text.color = '#654321';
    app.replaceState(core.normalizeCardProject(state), { save: false });
    app.syncControls();
    app.requestRender();
  }, secondText);

  await page.locator('[data-create-format-target="instagram-post"]').click();
  await expect(page).toHaveURL(/\/urdu-instagram-post-maker$/);
  expect(new URL(page.url()).search).toBe('');
  await waitForContinuity(page, 'instagram-post');
  await expect(page.locator('html')).toHaveAttribute('data-wu-create-continuity-restored', 'true', { timeout: 15000 });

  state = await page.evaluate(() => window.WriteUrduCardStudioApp && window.WriteUrduCardStudioApp.getState());
  expect(state).toMatchObject({
    presetId: 'square',
    socialMode: 'instagram',
    text: { value: secondText, fontFamily: 'Amiri', color: '#654321', align: 'right' },
    background: { type: 'solid', color: '#f1e9d8' },
    watermark: { enabled: true }
  });

  await page.locator('[data-create-format-target="card-studio"]').click();
  await expect(page).toHaveURL(/\/urdu-card-studio$/);
  expect(new URL(page.url()).search).toBe('');
  await waitForContinuity(page, 'card-studio');
  await expect(page.locator('html')).toHaveAttribute('data-wu-create-continuity-restored', 'true', { timeout: 15000 });

  state = await page.evaluate(() => window.WriteUrduCardStudioApp && window.WriteUrduCardStudioApp.getState());
  expect(state.presetId).toBe('square');
  expect(state.socialMode).toBeNull();
  expect(state.text).toMatchObject({ value: secondText, fontFamily: 'Amiri', color: '#654321', align: 'right' });
  expect(state.background).toMatchObject({ type: 'solid', color: '#f1e9d8' });
  expect(state.watermark.enabled).toBe(true);

  await expect.poll(() => page.evaluate(() => {
    const api = window.WriteUrduWorkspaceHandoff;
    return api && typeof api.peek === 'function' ? api.peek('card-studio') : undefined;
  })).toBeNull();
});

test('social format preset row stays inside a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await openCards(page);
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
    row: document.querySelector('[data-urdu-cards-format-presets]').getBoundingClientRect().width
  }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(dimensions.row).toBeLessThanOrEqual(dimensions.viewport);
});

test('shared creation shell stays inside a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await blockExternal(page);
  await page.goto('/urdu-whatsapp-status-maker', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await waitForContinuity(page, 'whatsapp-status');
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
    shell: document.querySelector('[data-create-format-continuity]').getBoundingClientRect().width,
    widestButton: Math.max(...Array.from(document.querySelectorAll('[data-create-format-target]')).map(node => node.getBoundingClientRect().width))
  }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(dimensions.shell).toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.widestButton).toBeLessThanOrEqual(dimensions.shell);
});
