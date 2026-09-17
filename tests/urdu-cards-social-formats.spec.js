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
