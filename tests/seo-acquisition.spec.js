const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function open(page, route) {
  await blockExternalServices(page);
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached' });
}

async function schemaTypes(page) {
  await expect(page.locator('script[data-write-urdu-schema]')).toHaveCount(1);
  return page.locator('script[data-write-urdu-schema]').evaluate(node => {
    const schema = JSON.parse(node.textContent);
    const graph = Array.isArray(schema['@graph']) ? schema['@graph'] : [];
    return graph.flatMap(item => Array.isArray(item['@type']) ? item['@type'] : [item['@type']]).filter(Boolean);
  });
}

test('homepage keeps plain-language English to Urdu typing metadata and writing schema after shared shell initialization', async ({ page }) => {
  await open(page, '/');
  await expect(page.locator('h1')).toHaveText('English to Urdu Typing Online');
  await expect.poll(() => page.title()).toBe('English to Urdu Typing Online | WriteUrdu');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://write-urdu.com/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /English to Urdu typing online.*English letters.*Urdu script/i);
  await expect(page.locator('.page-intro')).toContainText('Type Urdu using English letters');
  await expect(page.locator('.input-mode-option').first()).toHaveText('English letters → Urdu');
  const compact = await page.evaluate(() => window.matchMedia('(max-width: 767px)').matches);
  const proof = compact ? page.locator('.page-intro') : page.locator('[data-wu-basic-mode-helper]');
  await expect(proof).toBeVisible();
  await expect(proof).toHaveText(/mera khayal hai\s*→\s*میرا خیال ہے/);
  await expect(proof).toContainText(/press Space after each word/i);
  await expect(page.locator('body')).not.toContainText('This is transliteration');
  const types = await schemaTypes(page);
  expect(types).toContain('WebSite');
  expect(types).toContain('WebPage');
  expect(types).toContain('WebApplication');
  expect(types).toContain('Organization');
});

test('Urdu Keyboard keeps direct input dominant and sends English-letter writers to the homepage', async ({ page }) => {
  await open(page, '/urdu-keyboard');
  await expect(page.locator('h1')).toHaveText('Urdu Keyboard');
  await expect(page.locator('mark.sm')).toHaveText('Type Urdu directly—no installation required');
  await expect(page.locator('#write')).toBeVisible();
  await expect(page.locator('#key1')).toBeVisible();
  await expect(page.getByText('Roman Urdu words convert when you press Space')).toHaveCount(0);
  const homepageLinks = page.locator('.keyboard-supporting-content a[href="/"]');
  const labels = await homepageLinks.allTextContents();
  expect(labels.length).toBeGreaterThanOrEqual(3);
  expect(labels.every(label => label.trim() === 'English to Urdu typing')).toBe(true);
});

test('secondary English-to-Urdu typing guide keeps its canonical route without technical search-facing language', async ({ page }) => {
  await open(page, '/roman-urdu-transliteration');
  await expect(page.locator('h1')).toHaveText('English to Urdu Typing with English Letters');
  await expect.poll(() => page.title()).toBe('English to Urdu Typing with English Letters | WriteUrdu');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://write-urdu.com/roman-urdu-transliteration');
  await expect(page.locator('h1')).not.toContainText('Roman Urdu');
  expect(await page.title()).not.toMatch(/Roman Urdu|transliteration/i);
});

test('Card Studio keeps its acquisition metadata and application schema after shared shell initialization', async ({ page }) => {
  await open(page, '/urdu-card-studio');
  await expect(page.locator('h1')).toHaveText('Urdu Card Studio');
  await expect.poll(() => page.title()).toBe('Urdu Text on Photo & Poetry Post Maker Online | WriteUrdu');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://write-urdu.com/urdu-card-studio');
  const types = await schemaTypes(page);
  expect(types).toContain('WebApplication');
  expect(types).toContain('WebPage');
});

test('Urdu Name Art keeps its focused image/DP acquisition metadata after shared shell initialization', async ({ page }) => {
  await open(page, '/urdu-name-art-maker');
  await expect(page.locator('h1')).toHaveText('Urdu Name Art Studio');
  await expect.poll(() => page.title()).toBe('Urdu Name Art Maker – Urdu Name Image & DP Maker | WriteUrdu');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://write-urdu.com/urdu-name-art-maker');
  await expect(page.locator('.name-art-guidance')).toContainText('24 original templates in 12 packs');
  const types = await schemaTypes(page);
  expect(types).toContain('WebApplication');
  expect(types).toContain('WebPage');
});

test('Urdu-on-photo guide exposes its canonical Article schema', async ({ page }) => {
  await open(page, '/how-to-write-urdu-on-photo');
  await expect(page.locator('h1')).toHaveText('How to write Urdu text or poetry on a photo online');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://write-urdu.com/how-to-write-urdu-on-photo');
  const types = await schemaTypes(page);
  expect(types).toContain('Article');
  expect(types).toContain('WebPage');
  expect(types).toContain('BreadcrumbList');
});
