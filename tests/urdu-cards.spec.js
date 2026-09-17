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

test('ready-made cards load the protected Create-page ad placement', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-cards', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.locator('body')).toHaveAttribute('data-wu-monetization-type', 'create');
  await expect(page.locator('.wu-header-ad[data-wu-ad-placement="tool_post_workspace"] ins.adsbygoogle')).toHaveCount(1);
});

test('ready-made cards render fixed text without any canvas', async ({ page }) => {
  await openCards(page);
  expect(await page.locator('canvas').count()).toBe(0);
  await expect(page.locator('#card-dua-1 .card-gallery-preview-text')).toHaveText('اللہ آپ کی حفاظت فرمائے اور ہر مشکل میں آسانی عطا کرے۔');
  expect(await page.evaluate(() => window.WriteUrduCardsApp.getDiagnostics())).toMatchObject({ shells: cardCount });
});

test('start choices separate ready-made browsing from using your own words', async ({ page }) => {
  await openCards(page);
  const chooser = page.locator('[data-urdu-cards-start]');
  await expect(chooser).toBeVisible();
  await expect(chooser.getByRole('heading', { level: 2 })).toHaveText('How do you want to start?');
  await expect(chooser.locator('[data-urdu-cards-start-choice="ready-made"]')).toContainText('Find a ready-made message');
  await expect(chooser.locator('[data-urdu-cards-start-choice="ready-made"]')).toHaveAttribute('href', '#urdu-cards-browser');
  await expect(chooser.locator('[data-urdu-cards-start-choice="own-words"]')).toContainText('Use my own words');
  await expect(chooser.locator('[data-urdu-cards-start-choice="own-words"]')).toHaveAttribute('href', '/urdu-card-gallery');
});

test('card actions prioritize image sharing and personalization over secondary destinations', async ({ page }) => {
  await openCards(page);
  await expect(page.locator('[data-urdu-cards-image-share="dua-1"]')).toContainText('Share image');
  await expect(page.locator('[data-urdu-cards-edit="dua-1"]')).toContainText('Make it mine');
  await expect(page.locator('[data-urdu-cards-whatsapp-status="dua-1"]')).toContainText('WhatsApp Status');
  await expect(page.locator('[data-urdu-cards-share="dua-1"]')).toContainText('Shareable link');
});

test('generic image sharing is lazy, branded and uses a 4:5 PNG file', async ({ page }) => {
  await openCards(page);
  await expect(page.locator('script[src*="whatsapp-status-share.js"]')).toHaveCount(0);
  await page.evaluate(() => {
    window.__imageShare = null;
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: data => Boolean(data && data.files && data.files[0] && data.files[0].type === 'image/png')
    });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async data => {
        const file = data.files[0];
        window.__imageShare = { name: file.name, type: file.type, size: file.size, text: data.text };
      }
    });
  });

  await page.locator('[data-urdu-cards-image-share="dua-1"]').click();
  await expect(page.locator('[data-urdu-cards-status]')).toHaveText('Image share sheet opened.');
  await expect(page.locator('script[src*="whatsapp-status-share.js"]')).toHaveCount(1);

  const result = await page.evaluate(() => ({
    share: window.__imageShare,
    diagnostics: window.WriteUrduWhatsAppStatusShare.getDiagnostics(),
    canvasCount: document.querySelectorAll('canvas').length
  }));
  expect(result.share).toMatchObject({
    type: 'image/png',
    text: 'Create your own Urdu card at write-urdu.com/urdu-cards'
  });
  expect(result.share.name).toBe('write-urdu-dua-1.png');
  expect(result.share.size).toBeGreaterThan(1000);
  expect(result.diagnostics).toMatchObject({ cardWidth: 720, cardHeight: 900 });
  expect(result.diagnostics.watermark).toContain('write-urdu.com');
  expect(result.canvasCount).toBe(0);
});

test('WhatsApp Status sharing is lazy, branded and uses a 9:16 PNG file', async ({ page }) => {
  await openCards(page);
  await expect(page.locator('script[src*="whatsapp-status-share.js"]')).toHaveCount(0);
  await page.evaluate(() => {
    window.__statusShare = null;
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: data => Boolean(data && data.files && data.files[0] && data.files[0].type === 'image/png')
    });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async data => {
        const file = data.files[0];
        window.__statusShare = { name: file.name, type: file.type, size: file.size, text: data.text };
      }
    });
  });

  await page.locator('[data-urdu-cards-whatsapp-status="dua-1"]').click();
  await expect(page.locator('[data-urdu-cards-status]')).toContainText('Shared');
  await expect(page.locator('script[src*="whatsapp-status-share.js"]')).toHaveCount(1);

  const result = await page.evaluate(() => ({
    share: window.__statusShare,
    diagnostics: window.WriteUrduWhatsAppStatusShare.getDiagnostics(),
    canvasCount: document.querySelectorAll('canvas').length
  }));
  expect(result.share).toMatchObject({
    type: 'image/png',
    text: 'Create your own Urdu card at write-urdu.com/urdu-cards'
  });
  expect(result.share.name).toContain('whatsapp-status.png');
  expect(result.share.size).toBeGreaterThan(1000);
  expect(result.diagnostics).toMatchObject({ width: 720, height: 1280 });
  expect(result.diagnostics.watermark).toContain('write-urdu.com');
  expect(result.canvasCount).toBe(0);
});

test('Make it mine opens a local personalization sheet with live preview and Escape close', async ({ page }) => {
  await openCards(page);
  const trigger = page.locator('[data-urdu-cards-edit="dua-1"]');
  await trigger.click();

  const dialog = page.locator('[data-urdu-cards-personalizer="dua-1"]');
  const textarea = dialog.locator('[data-urdu-cards-personalizer-text="dua-1"]');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('role', 'dialog');
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(textarea).toBeFocused();
  await expect(textarea).toHaveValue('اللہ آپ کی حفاظت فرمائے اور ہر مشکل میں آسانی عطا کرے۔');

  const personalized = 'اللہ آپ کو ہمیشہ خوش رکھے، عائشہ۔';
  await textarea.fill(personalized);
  await expect(dialog.locator('.urdu-cards-personalizer-preview .card-gallery-preview-text')).toHaveText(personalized);
  await expect(page).toHaveURL(/\/urdu-cards$/);

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('personalized card can be shared as an image without opening Card Studio', async ({ page }) => {
  await openCards(page);
  await page.evaluate(() => {
    window.__personalizedCardText = null;
    window.WriteUrduWhatsAppStatusShare = {
      shareCard: async () => ({ result: 'shared' }),
      shareImage: async card => {
        window.__personalizedCardText = card.textUr;
        return { result: 'shared', width: 720, height: 900 };
      }
    };
  });

  await page.locator('[data-urdu-cards-edit="dua-1"]').click();
  const dialog = page.locator('[data-urdu-cards-personalizer="dua-1"]');
  const personalized = 'میری پیاری امی، اللہ آپ کو ہمیشہ سلامت رکھے۔';
  await dialog.locator('[data-urdu-cards-personalizer-text="dua-1"]').fill(personalized);
  await dialog.locator('[data-urdu-cards-personalizer-share="dua-1"]').click();

  await expect(dialog.locator('[data-urdu-cards-personalizer-status="dua-1"]')).toHaveText('Image share sheet opened.');
  await expect.poll(() => page.evaluate(() => window.__personalizedCardText)).toBe(personalized);
  await expect(page).toHaveURL(/\/urdu-cards$/);
});

test('favorites persist locally and stay filtered when a favorite is removed', async ({ page }) => {
  await openCards(page);
  await expect(page.locator('[data-urdu-cards-returning]')).toBeHidden();
  await expect(page.locator('[data-urdu-cards-favorite]')).toHaveCount(cardCount);

  const secondId = cards.find(card => card.id !== 'dua-1').id;
  await page.locator('[data-urdu-cards-favorite="dua-1"]').click();
  await page.locator(`[data-urdu-cards-favorite="${secondId}"]`).click();
  await expect(page.locator('[data-urdu-cards-returning]')).toBeVisible();
  await expect(page.locator('[data-urdu-cards-returning-filter="favorites"]')).toHaveText('Favorites · 2');

  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('writeUrdu.urduCardsFavorites.v1')))).toEqual([secondId, 'dua-1']);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.card-gallery-card')).toHaveCount(cardCount);
  await expect(page.locator('[data-urdu-cards-favorite="dua-1"]')).toHaveAttribute('aria-pressed', 'true');

  const favorites = page.locator('[data-urdu-cards-returning-filter="favorites"]');
  await favorites.click();
  await expect(favorites).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.card-gallery-card:visible')).toHaveCount(2);

  await page.locator('[data-urdu-cards-favorite="dua-1"]').click();
  await expect(favorites).toHaveAttribute('aria-pressed', 'true');
  await expect(favorites).toHaveText('Favorites · 1');
  await expect(page.locator('.card-gallery-card:visible')).toHaveCount(1);
  await expect(page.locator(`#card-${secondId}`)).toBeVisible();
});

test('recents remember only canonical card ids and never personalized Urdu text', async ({ page }) => {
  await openCards(page);
  await page.locator('[data-urdu-cards-edit="dua-1"]').click();
  const dialog = page.locator('[data-urdu-cards-personalizer="dua-1"]');
  const privateText = 'یہ صرف میری ذاتی عبارت ہے اور محفوظ نہیں ہونی چاہیے۔';
  await dialog.locator('[data-urdu-cards-personalizer-text="dua-1"]').fill(privateText);

  const stored = await page.evaluate(() => ({
    favorites: localStorage.getItem('writeUrdu.urduCardsFavorites.v1'),
    recents: localStorage.getItem('writeUrdu.urduCardsRecents.v1')
  }));
  expect(JSON.parse(stored.favorites)).toEqual([]);
  expect(JSON.parse(stored.recents)).toEqual(['dua-1']);
  expect(JSON.stringify(stored)).not.toContain(privateText);

  await page.keyboard.press('Escape');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.card-gallery-card')).toHaveCount(cardCount);
  const recent = page.locator('[data-urdu-cards-returning-filter="recent"]');
  await expect(recent).toHaveText('Recent · 1');
  await recent.click();
  await expect(page.locator('.card-gallery-card:visible')).toHaveCount(1);
  await page.locator('[data-urdu-cards-continue]').click();
  await expect(page.locator('[data-urdu-cards-image-share="dua-1"]')).toBeFocused();
});

test('returning state removes unknown ids and localizes its Urdu controls', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-cards', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.evaluate(() => {
    localStorage.setItem('writeUrdu.urduCardsFavorites.v1', JSON.stringify(['missing-card', 'dua-1', 'dua-1']));
    localStorage.setItem('writeUrdu.urduCardsRecents.v1', JSON.stringify(['missing-card', 'dua-1']));
  });
  await page.goto('/urdu/urdu-cards', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.locator('.card-gallery-card')).toHaveCount(cardCount);
  await expect(page.locator('[data-urdu-cards-returning]')).toContainText('آپ کے کارڈز');
  await expect(page.locator('[data-urdu-cards-returning-filter="favorites"]')).toHaveText('پسندیدہ · 1');
  await expect(page.locator('[data-urdu-cards-returning-filter="recent"]')).toHaveText('حالیہ · 1');
  await expect(page.locator('[data-urdu-cards-favorite="dua-1"]')).toHaveAttribute('aria-label', 'dua-1 کارڈ پسندیدہ سے نکالیں');

  const state = await page.evaluate(() => ({
    app: window.WriteUrduCardsReturningState.getState(),
    favorites: JSON.parse(localStorage.getItem('writeUrdu.urduCardsFavorites.v1')),
    recents: JSON.parse(localStorage.getItem('writeUrdu.urduCardsRecents.v1'))
  }));
  expect(state.app.favorites).toEqual(['dua-1']);
  expect(state.app.recents).toEqual(['dua-1']);
  expect(state.favorites).toEqual(['dua-1']);
  expect(state.recents).toEqual(['dua-1']);
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

test('personalized card continues to Card Studio with edited text and the selected background', async ({ page }) => {
  const telemetryBodies = [];
  await page.route('**/api/events', async route => {
    telemetryBodies.push(route.request().postData() || '');
    await route.fulfill({ status: 202, contentType: 'application/json', body: '{"accepted":1}' });
  });
  await openCards(page);
  await page.locator('[data-urdu-cards-edit="dua-1"]').click();
  const personalized = 'اللہ آپ کو نئی منزل پر بہت کامیابی عطا کرے۔';
  const dialog = page.locator('[data-urdu-cards-personalizer="dua-1"]');
  await dialog.locator('[data-urdu-cards-personalizer-text="dua-1"]').fill(personalized);
  await dialog.locator('[data-urdu-cards-personalizer-advanced="dua-1"]').click();

  await expect(page).toHaveURL(/\/urdu-card-studio$/);
  await expect(page.locator('html')).toHaveAttribute('data-wu-card-seed-applied', 'live', { timeout: 20000 });
  await expect(page.locator('#cardText')).toHaveValue(personalized);
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