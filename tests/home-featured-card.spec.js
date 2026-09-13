const { test, expect } = require('@playwright/test');

const blockExternal = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function openHome(page) {
  await blockExternal(page);
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.locator('[data-home-featured-card]')).toBeVisible();
}

test('homepage keeps one contextual card after writer with exactly two actions', async ({ page }) => {
  const artwork = [];
  page.on('request', request => {
    if (request.url().includes('/assets/card-studio/backgrounds/')) artwork.push(request.url());
  });
  await openHome(page);
  const section = page.locator('[data-home-featured-card]');
  await expect(section).toHaveCount(1);
  await expect(section.locator('[data-home-featured-card-art]')).toHaveCount(1);
  await expect(section.locator('button')).toHaveCount(2);
  await expect(section.locator('canvas')).toHaveCount(0);
  await expect(section.locator('[data-home-featured-card-text]')).toHaveAttribute('lang', 'ur');
  await expect(section.locator('[data-home-featured-card-text]')).toHaveAttribute('dir', 'rtl');
  const order = await page.evaluate(() => {
    const writer = document.getElementById('transliterateTextarea');
    const card = document.querySelector('[data-home-featured-card]');
    const discovery = document.getElementById('home-new-tools');
    return {
      afterWriter: Boolean(writer.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING),
      beforeDiscovery: Boolean(card.compareDocumentPosition(discovery) & Node.DOCUMENT_POSITION_FOLLOWING)
    };
  });
  expect(order).toEqual({ afterWriter: true, beforeDiscovery: true });
  expect(new Set(artwork).size).toBeLessThanOrEqual(1);
});

test('desktop places a compact featured card beside the typing instructions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openHome(page);
  const layout = await page.evaluate(() => {
    const card = document.querySelector('[data-home-featured-card]');
    const body = card.parentElement;
    const instructions = body.querySelector('.card-text').getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const artRect = card.querySelector('[data-home-featured-card-art]').getBoundingClientRect();
    return {
      nested: body.classList.contains('home-instructions-with-card'),
      instructionsLeft: instructions.left,
      cardLeft: cardRect.left,
      artWidth: artRect.width
    };
  });
  expect(layout.nested).toBe(true);
  expect(layout.cardLeft).toBeGreaterThan(layout.instructionsLeft);
  expect(layout.artWidth).toBeLessThanOrEqual(210);
});

test('Friday local time selects Jumma content', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeDate = Date;
    const fixed = new NativeDate(2026, 8, 18, 8, 0, 0, 0).getTime();
    class FixedDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : [fixed])); }
      static now() { return fixed; }
    }
    window.Date = FixedDate;
  });
  await openHome(page);
  await expect(page.locator('[data-home-featured-card]')).toHaveAttribute('data-featured-context', 'friday');
  await expect(page.locator('[data-home-featured-card-context]')).toHaveText('جمعہ مبارک');
  await expect(page.locator('[data-home-featured-card]')).toHaveAttribute('data-featured-card-id', /^jumma-/);
});

for (const fixture of [
  { name: 'morning', hour: 8, context: 'morning', card: /^morning-/ },
  { name: 'night', hour: 23, context: 'night', card: /^night-/ }
]) {
  test(fixture.name + ' local time selects its approved card family', async ({ page }) => {
    await page.addInitScript(hour => {
      const NativeDate = Date;
      const fixed = new NativeDate(2026, 8, 17, hour, 0, 0, 0).getTime();
      class FixedDate extends NativeDate {
        constructor(...args) { super(...(args.length ? args : [fixed])); }
        static now() { return fixed; }
      }
      window.Date = FixedDate;
    }, fixture.hour);
    await openHome(page);
    await expect(page.locator('[data-home-featured-card]')).toHaveAttribute('data-featured-context', fixture.context);
    await expect(page.locator('[data-home-featured-card]')).toHaveAttribute('data-featured-card-id', fixture.card);
  });
}

test('Urdu locale mirror renders the same compact localized feature', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  const section = page.locator('[data-home-featured-card]');
  await expect(section).toBeVisible();
  await expect(section.locator('button')).toHaveCount(2);
  await expect(section.locator('[data-home-featured-card-title]')).toHaveText('آج کا منتخب اردو کارڈ');
  await expect(section.locator('[data-home-featured-card-share]')).toHaveText('شیئر کریں');
  await expect(section.locator('xpath=..')).toHaveClass(/home-instructions-with-card/);
});

test('homepage Share publishes a real link and preserves fallback', async ({ page }) => {
  await page.route('**/api/shares', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, url: 'https://write-urdu.com/s/home-card-proof' }) }));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    window.__copied = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: value => { window.__copied = value; return Promise.resolve(); } } });
  });
  await openHome(page);
  await page.locator('[data-home-featured-card-share]').click();
  await expect(page.locator('[data-home-featured-card-status]')).toHaveText('Link copied.');
  await expect.poll(() => page.evaluate(() => window.__copied)).toBe('https://write-urdu.com/s/home-card-proof');
});

test('homepage Share falls back to the canonical card link when publishing fails', async ({ page }) => {
  await page.route('**/api/shares', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"ok":false}' }));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    window.__copied = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: value => { window.__copied = value; return Promise.resolve(); } } });
  });
  await openHome(page);
  const cardId = await page.locator('[data-home-featured-card]').getAttribute('data-featured-card-id');
  await page.locator('[data-home-featured-card-share]').click();
  await expect(page.locator('[data-home-featured-card-status]')).toHaveText('Link copied.');
  await expect.poll(() => page.evaluate(() => window.__copied)).toBe('https://write-urdu.com/urdu-cards#card-' + cardId);
});

test('Open in Card Studio restores exact featured text and background without URL content', async ({ page }) => {
  await openHome(page);
  const expected = await page.locator('[data-home-featured-card]').evaluate(section => ({
    text: section.querySelector('[data-home-featured-card-text]').textContent,
    backgroundId: section.dataset.featuredCardId && window.WriteUrduCardsData.getCardById(section.dataset.featuredCardId).backgroundId
  }));
  await page.locator('[data-home-featured-card-edit]').click();
  await page.waitForURL(/\/urdu-card-studio(?:\.html)?$/, { timeout: 15000 });
  await expect(page.locator('html')).toHaveAttribute('data-wu-card-seed-applied', 'live');
  await expect(page.locator('[data-card-built-in-background="' + expected.backgroundId + '"]')).toHaveAttribute('aria-pressed', 'true');
  const restored = await page.evaluate(() => window.WriteUrduCardStudioApp.getState().text.value);
  expect(restored).toBe(expected.text);
  await page.locator('#cardText').fill(expected.text + ' مزید');
  await expect.poll(() => page.evaluate(() => window.WriteUrduCardStudioApp.getState().text.value)).toBe(expected.text + ' مزید');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-card-action="download"]:visible').first().click();
  expect((await downloadPromise).suggestedFilename()).toMatch(/\.png$/);
  expect(page.url()).not.toContain(encodeURIComponent(expected.text));
  expect(new URL(page.url()).search).toBe('');
  expect(new URL(page.url()).hash).toBe('');
});

test('mobile card follows instructions and does not overflow page', async ({ page }) => {
  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await openHome(page);
    const layout = await page.evaluate(() => {
      const writer = document.getElementById('transliterateTextarea').getBoundingClientRect();
      const card = document.querySelector('[data-home-featured-card]').getBoundingClientRect();
      const instructions = document.querySelector('.home-instructions-with-card .card-text').getBoundingClientRect();
      return {
        writerTop: writer.top,
        cardTop: card.top,
        instructionsBottom: instructions.bottom,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(layout.cardTop).toBeGreaterThan(layout.writerTop);
    expect(layout.cardTop).toBeGreaterThanOrEqual(layout.instructionsBottom - 1);
    expect(layout.overflow).toBeLessThanOrEqual(1);
  }
});

test('missing featured-card dependency fails closed while writer remains usable', async ({ page }) => {
  await blockExternal(page);
  await page.route('**/js/card-background-registry.js', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: 'window.WriteUrduCardBackgroundRegistry = null;' }));
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.locator('[data-home-featured-card]')).toBeHidden();
  await page.locator('#transliterateTextarea').fill('نجی تحریر');
  await expect(page.locator('#transliterateTextarea')).toHaveValue('نجی تحریر');
});
