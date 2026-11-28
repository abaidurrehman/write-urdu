const { test, expect } = require('@playwright/test');

// WU-UXR-002 Slice F (CARD-UX-012, 013): a ready-made card's "Shareable link" asks once before it
// creates a public page, reuses the link it already made, can be deleted from this browser, carries no
// invented credit, and the personaliser can make a link for the edited words. D-UX2-3 (2026-11-16):
// the same one-time question applies to the homepage featured card.

const blockExternal = page => page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, route => route.abort());
const ACK_KEY = 'writeUrdu.sharePublishAcknowledged.v1';
const MANAGEMENT_KEY = 'writeUrdu.shareManagement.v1';

async function mockShares(page, options = {}) {
  const posts = [];
  const deletes = [];
  let next = 0;
  await page.route('**/api/shares', async route => {
    if (route.request().method() !== 'POST') return route.fallback();
    posts.push(route.request().postDataBuffer().toString('latin1'));
    next += 1;
    const id = 'card' + String(next).padStart(4, '0');
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, id, url: 'https://write-urdu.com/s/' + id, manageToken: 'token-' + id }) });
  });
  await page.route(/\/api\/shares\/[A-Za-z0-9]+$/, async route => {
    if (route.request().method() !== 'DELETE') return route.fallback();
    deletes.push(route.request().url());
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.route(/\/s\/[A-Za-z0-9]+$/, route => route.fulfill({ status: options.linkStatus || 200, contentType: 'text/html', body: '<!doctype html><title>card</title>' }));
  return { posts, deletes };
}

async function stubSharing(page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    window.__copied = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: value => { window.__copied = value; return Promise.resolve(); } } });
  });
}

async function openCards(page) {
  await blockExternal(page);
  await stubSharing(page);
  await page.goto('/urdu-cards', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.locator('[data-urdu-cards-share="dua-1"]')).toBeVisible();
}

const consent = page => page.locator('dialog[data-wu-share-consent]');

test('the first Shareable link tap asks first; Cancel creates nothing', async ({ page }) => {
  const shares = await mockShares(page);
  await openCards(page);
  await page.locator('[data-urdu-cards-share="dua-1"]').click();
  await expect(consent(page)).toBeVisible();
  await expect(consent(page)).toContainText('Public to anyone with the link');
  await consent(page).locator('[data-wu-share-cancel]').click();
  await expect(consent(page)).toBeHidden();
  await expect(page.locator('[data-urdu-cards-status]')).toHaveText('No link was created.');
  expect(shares.posts).toHaveLength(0);
  expect(await page.evaluate(key => localStorage.getItem(key), ACK_KEY)).toBeNull();
});

test('accepting publishes once, remembers the link for deletion, and a second tap reuses it', async ({ page }) => {
  const shares = await mockShares(page);
  await openCards(page);
  await page.locator('[data-urdu-cards-share="dua-1"]').click();
  await consent(page).locator('[data-wu-share-confirm]').click();
  await expect(page.locator('[data-urdu-cards-status]')).toContainText('Link copied.');
  await expect.poll(() => page.evaluate(() => window.__copied)).toBe('https://write-urdu.com/s/card0001');
  expect(shares.posts).toHaveLength(1);
  // No invented credit: ready-made Write Urdu copy has no author, so nothing is sent.
  expect(shares.posts[0]).not.toContain('name="attribution"');
  expect(shares.posts[0]).not.toContain('Write Urdu Card');

  const managed = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), MANAGEMENT_KEY);
  expect(managed.items.card0001).toMatchObject({ token: 'token-card0001', url: 'https://write-urdu.com/s/card0001' });
  expect(await page.evaluate(key => localStorage.getItem(key), ACK_KEY)).toBe('1');
  // The link cache keeps only ids and a hash of the words, never the words.
  const cache = await page.evaluate(() => localStorage.getItem('writeUrdu.curatedShareLinks.v1') || '');
  expect(cache).toContain('card0001');
  expect(cache).not.toMatch(/[؀-ۿ]/);

  await page.evaluate(() => { window.__copied = ''; });
  await page.locator('[data-urdu-cards-share="dua-1"]').click();
  await expect(consent(page)).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.__copied)).toBe('https://write-urdu.com/s/card0001');
  expect(shares.posts).toHaveLength(1);
});

test('a link that was deleted elsewhere is published again', async ({ page }) => {
  const shares = await mockShares(page, { linkStatus: 410 });
  await openCards(page);
  await page.evaluate(key => localStorage.setItem(key, '1'), ACK_KEY);
  await page.locator('[data-urdu-cards-share="dua-1"]').click();
  await expect.poll(() => shares.posts.length).toBe(1);
  await page.locator('[data-urdu-cards-share="dua-1"]').click();
  await expect.poll(() => shares.posts.length).toBe(2);
});

test('Manage links lists the ready-made link and deletes it', async ({ page }) => {
  const shares = await mockShares(page);
  await openCards(page);
  await page.evaluate(key => localStorage.setItem(key, '1'), ACK_KEY);
  await page.locator('[data-urdu-cards-share="dua-1"]').click();
  await expect(page.locator('[data-urdu-cards-status]')).toContainText('Link copied.');
  page.on('dialog', dialog => dialog.accept());
  await page.locator('[data-urdu-cards-manage-links]').click();
  const manage = page.locator('dialog[data-wu-share-manage]');
  await expect(manage).toBeVisible();
  await expect(manage).toContainText('https://write-urdu.com/s/card0001');
  await manage.locator('[data-wu-share-delete="card0001"]').click();
  await expect.poll(() => shares.deletes.length).toBe(1);
  expect(shares.deletes[0]).toMatch(/\/api\/shares\/card0001$/);
  // The token is forgotten when the DELETE response arrives, a moment after the request is sent.
  await expect.poll(() => page.evaluate(key => {
    const managed = JSON.parse(localStorage.getItem(key) || '{}');
    return Boolean(managed.items && managed.items.card0001);
  }, MANAGEMENT_KEY)).toBe(false);
  // A deleted link is never handed out again.
  await page.keyboard.press('Escape');
  await page.locator('[data-urdu-cards-share="dua-1"]').click();
  await expect.poll(() => shares.posts.length).toBe(2);
});

test('the personaliser makes a link for the edited words', async ({ page }) => {
  const shares = await mockShares(page);
  await openCards(page);
  await page.locator('[data-urdu-cards-edit="dua-1"]').click();
  const dialog = page.locator('[data-urdu-cards-personalizer="dua-1"]');
  const edited = 'اللہ آپ کو ہمیشہ خوش رکھے';
  await dialog.locator('[data-urdu-cards-personalizer-text="dua-1"]').fill(edited);
  const link = dialog.locator('[data-urdu-cards-personalizer-link="dua-1"]');
  await expect(link).toHaveText('Get link');
  await link.click();
  await consent(page).locator('[data-wu-share-confirm]').click();
  await expect.poll(() => shares.posts.length).toBe(1);
  expect(Buffer.from(shares.posts[0], 'latin1').toString('utf8')).toContain(edited);
  await expect(dialog.locator('[data-urdu-cards-personalizer-status="dua-1"]')).toContainText('Link copied.');
  await expect(dialog.locator('[data-urdu-cards-personalizer-url]')).toHaveValue('https://write-urdu.com/s/card0001');
});

test('the Urdu page asks in Urdu', async ({ page }) => {
  await mockShares(page);
  await blockExternal(page);
  await stubSharing(page);
  await page.goto('/urdu/urdu-cards', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('[data-urdu-cards-share="dua-1"]').click();
  await expect(consent(page)).toBeVisible();
  await expect(consent(page)).toContainText('لنک رکھنے والا ہر شخص');
  await expect(consent(page).locator('[data-wu-share-confirm]')).toHaveText('لنک بنائیں');
});

test('homepage Share asks once too, and one answer covers every tool (D-UX2-3)', async ({ page }) => {
  const shares = await mockShares(page);
  await blockExternal(page);
  await stubSharing(page);
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.locator('[data-home-featured-card]')).toBeVisible();
  await expect(page.locator('[data-home-featured-card] button')).toHaveCount(2);
  await page.locator('[data-home-featured-card-share]').click();
  await expect(consent(page)).toBeVisible();
  await consent(page).locator('[data-wu-share-confirm]').click();
  await expect(page.locator('[data-home-featured-card-status]')).toHaveText('Link copied.');
  expect(shares.posts).toHaveLength(1);
  await expect(page.locator('[data-home-featured-card] button')).toHaveCount(2);
  const featured = await page.locator('[data-home-featured-card]').getAttribute('data-featured-card-id');

  // Already answered (here or in Card Studio): no second question on /urdu-cards.
  await page.goto('/urdu-cards', { waitUntil: 'domcontentloaded', timeout: 15000 });
  const other = await page.locator('[data-urdu-cards-share]').evaluateAll((nodes, skip) => nodes.map(node => node.dataset.urduCardsShare).find(id => id !== skip), featured);
  await page.locator(`[data-urdu-cards-share="${other}"]`).click();
  await expect.poll(() => shares.posts.length).toBe(2);
  await expect(consent(page)).toBeHidden();
});
