const { test, expect } = require('@playwright/test');
const cards = require('../js/urdu-cards-data.js').getAllCards();
const cardCount = cards.length;
const weddingCount = cards.filter(card => card.category === 'wedding').length;

const blockExternal = page => page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, route => route.abort());

async function openCards(page) {
  await blockExternal(page);
  await page.goto('/urdu-cards', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ready-made Urdu cards');
  await expect(page.locator('.card-gallery-card')).toHaveCount(cardCount);
}

test('ready-made cards render fixed text without any canvas', async ({ page }) => {
  await openCards(page);
  expect(await page.locator('canvas').count()).toBe(0);
  await expect(page.locator('#card-dua-1 .card-gallery-preview-text')).toHaveText('اللہ آپ کی حفاظت فرمائے اور ہر مشکل میں آسانی عطا کرے۔');
  expect(await page.evaluate(() => window.WriteUrduCardsApp.getDiagnostics())).toMatchObject({ shells: cardCount });
});

test('category filter narrows visible cards', async ({ page }) => {
  await openCards(page);
  const filter = page.getByRole('button', { name: 'Wedding · شادی', exact: true });
  await filter.focus();
  await page.keyboard.press('Enter');
  await expect(filter).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.card-gallery-card:visible')).toHaveCount(weddingCount);
});

test('mobile page has no horizontal overflow', async ({ page }) => {
  await openCards(page);
  const viewports = [
    { width: 360, height: 800 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 412, height: 915 },
    { width: 768, height: 1024 }
  ];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
});

test('editing a card reaches Card Studio with its exact text and background', async ({ page }) => {
  const telemetryBodies = [];
  await page.route('**/api/events', async route => {
    telemetryBodies.push(route.request().postData() || '');
    await route.fulfill({ status: 202, contentType: 'application/json', body: '{"accepted":1}' });
  });
  await openCards(page);
  await page.locator('[data-urdu-cards-edit="dua-1"]').click();
  await expect(page).toHaveURL(/\/urdu-card-studio$/);
  await expect(page.locator('html')).toHaveAttribute('data-wu-card-seed-applied', 'live', { timeout: 20000 });
  await expect(page.locator('#cardText')).toHaveValue('اللہ آپ کی حفاظت فرمائے اور ہر مشکل میں آسانی عطا کرے۔');
  await expect(page.locator('[data-card-built-in-background="emerald-mughal"]')).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => window.WriteUrduTelemetry && window.WriteUrduTelemetry.flush(true));
  await page.waitForTimeout(200);
  const eventNames = telemetryBodies.flatMap(body => {
    try { return JSON.parse(body).events.map(event => event.event_name); } catch { return []; }
  });
  expect(eventNames).toEqual(expect.arrayContaining(['continuation_path_selected', 'continuation_path_handoff_created']));
});

test('share publishes a real shareable link back to write-urdu.com', async ({ page }) => {
  await openCards(page);
  let publishedForm = null;
  await page.route('**/api/shares', async route => {
    publishedForm = route.request().postData() || '';
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, id: 'abc123', url: 'https://write-urdu.com/s/abc123' }) });
  });
  await page.evaluate(() => { navigator.share = () => Promise.reject(new Error('share unavailable')); });
  await page.evaluate(() => {
    window.__copied = null;
    navigator.clipboard.writeText = text => { window.__copied = text; return Promise.resolve(); };
  });
  await page.locator('[data-urdu-cards-share="dua-1"]').click();
  await expect(page.locator('[data-urdu-cards-status]')).toHaveText('Link copied.');
  const copied = await page.evaluate(() => window.__copied);
  expect(copied).toBe('https://write-urdu.com/s/abc123');
  expect(publishedForm).not.toBeNull();
});

test('share falls back to the card deep link when publishing fails', async ({ page }) => {
  await openCards(page);
  await page.route('**/api/shares', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'publish_failed' }) }));
  await page.evaluate(() => { navigator.share = () => Promise.reject(new Error('share unavailable')); });
  await page.evaluate(() => {
    window.__copied = null;
    navigator.clipboard.writeText = text => { window.__copied = text; return Promise.resolve(); };
  });
  await page.locator('[data-urdu-cards-share="dua-1"]').click();
  await expect(page.locator('[data-urdu-cards-status]')).toHaveText('Link copied.');
  const copied = await page.evaluate(() => window.__copied);
  expect(copied).toBe('https://write-urdu.com/urdu-cards#card-dua-1');
});
