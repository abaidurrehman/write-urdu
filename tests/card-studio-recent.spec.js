const { test, expect } = require('@playwright/test');

// WU-UXR-002 Slice C: a hand-off or template never overwrites a saved card, and Recent cards lists every card on
// this device (CARD-UX-002, CARD-UX-034).
const cardA = 'پچھلے ہفتے کا کارڈ امی کے لیے دعا';
const cardB = 'یہ نیا کارڈ ہے';

async function openStudio(page, path) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, route => route.abort());
  await page.goto(path || '/urdu-card-studio', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.WriteUrduCardStudioApp && document.querySelector('[data-card-content-action="sample"]')), null, { timeout: 15000 });
}

async function writeCard(page, text) {
  await page.locator('#cardText').fill(text);
  await expect(page.locator('[data-card-save-indicator]')).toHaveText(/Saved on this device/, { timeout: 5000 });
}

const storedProjects = page => page.evaluate(() => new Promise(resolve => {
  const request = indexedDB.open('writeUrduCardStudio');
  request.onsuccess = () => {
    const query = request.result.transaction('projects').objectStore('projects').getAll();
    query.onsuccess = () => resolve(query.result.filter(item => (item.scope || 'card-studio') === 'card-studio').map(item => item.text && item.text.value));
  };
  request.onerror = () => resolve([]);
}));

test('a ready-made card from /urdu-cards does not overwrite the saved card', async ({ page }) => {
  await openStudio(page);
  await writeCard(page, cardA);

  await page.goto('/urdu-cards', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-urdu-cards-edit="dua-1"]').click();
  await Promise.all([
    page.waitForURL(/urdu-card-studio/),
    page.locator('[data-urdu-cards-personalizer-advanced]').first().click()
  ]);
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-wu-card-seed-applied'), null, { timeout: 15000 });
  await page.waitForTimeout(800);
  expect(await page.locator('#cardText').inputValue()).not.toBe(cardA);
  await writeCard(page, cardB);

  await openStudio(page);
  const texts = await storedProjects(page);
  expect(texts).toEqual(expect.arrayContaining([cardA, cardB]));
  expect(texts).toHaveLength(2);

  const recent = page.locator('[data-card-recent]');
  await expect(recent).toBeVisible();
  await expect(recent.locator('[data-card-recent-list] li')).toHaveCount(2);
  await recent.locator('[data-card-recent-open]', { hasText: cardA.slice(0, 12) }).click();
  await expect(page.locator('#cardText')).toHaveValue(cardA);
});

test('the hand-off says where the previous card went', async ({ page }) => {
  await openStudio(page);
  await writeCard(page, cardA);
  await page.goto('/urdu-cards', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-urdu-cards-edit="dua-1"]').click();
  await Promise.all([
    page.waitForURL(/urdu-card-studio/),
    page.locator('[data-urdu-cards-personalizer-advanced]').first().click()
  ]);
  await expect(page.locator('[data-card-status]')).toHaveText('Started a new card. Your previous card is in Recent cards.', { timeout: 15000 });
});

test('two tabs keep two cards', async ({ context }) => {
  const first = await context.newPage();
  const second = await context.newPage();
  await openStudio(first);
  await openStudio(second);
  await writeCard(first, cardA);
  await writeCard(second, cardB);
  await first.reload({ waitUntil: 'domcontentloaded' });
  await first.waitForFunction(() => Boolean(window.WriteUrduCardStudioApp));
  const list = first.locator('[data-card-recent-list] li');
  await expect(list).toHaveCount(2);
  await expect(list.filter({ hasText: cardA.slice(0, 12) })).toHaveCount(1);
  await expect(list.filter({ hasText: cardB.slice(0, 10) })).toHaveCount(1);
});

test('a template link on top of saved work starts a new card and keeps the old one', async ({ page }) => {
  await openStudio(page);
  await writeCard(page, cardA);
  await openStudio(page, '/urdu-card-studio?template=quiet-morning-verse');
  expect(await page.locator('#cardText').inputValue()).not.toBe(cardA);
  const list = page.locator('[data-card-recent-list] li');
  await expect(list).toHaveCount(2);
  await page.locator('[data-card-recent-open]', { hasText: cardA.slice(0, 12) }).click();
  await expect(page.locator('#cardText')).toHaveValue(cardA);
});

test('Recent cards is hidden with only one card and says it is local', async ({ page }) => {
  await openStudio(page);
  await writeCard(page, cardA);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.WriteUrduCardStudioApp));
  await expect(page.locator('#cardText')).toHaveValue(cardA);
  await expect(page.locator('[data-card-recent]')).toBeHidden();
  await expect(page.locator('[data-card-recent] .card-studio-help')).toHaveText("Saved only in this browser. Other phones and cleared browsers won't have them.");
});

test('a hand-off applied to an open card with work saves that card first', async ({ page }) => {
  await openStudio(page);
  await writeCard(page, cardA);
  await page.waitForFunction(() => Boolean(window.WriteUrduCardStudioHandoffAdapter), null, { timeout: 15000 });
  const before = await page.evaluate(() => window.WriteUrduCardStudioApp.getState().id);
  const envelope = { id: 'test-envelope', payload: { kind: 'plain-text', text: cardB } };
  await page.evaluate(value => {
    window.WriteUrduCardStudioHandoffAdapter.applyToRunningApp(value, null);
    window.WriteUrduCardStudioHandoffAdapter.applyToRunningApp(value, null);
  }, envelope);
  await expect(page.locator('#cardText')).toHaveValue(cardB);
  expect(await page.evaluate(() => window.WriteUrduCardStudioApp.getState().id)).not.toBe(before);
  await expect(page.locator('[data-card-status]')).toHaveText('Started a new card. Your previous card is in Recent cards.');
  await expect(page.locator('[data-card-save-indicator]')).toHaveText(/Saved on this device/, { timeout: 5000 });
  const texts = await storedProjects(page);
  expect(texts.sort()).toEqual([cardA, cardB].sort());
});
