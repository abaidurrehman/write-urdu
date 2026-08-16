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

test('homepage keeps English to Urdu typing metadata and writing schema after shared shell initialization', async ({ page }) => {
  await open(page, '/');
  await expect(page.locator('h1')).toHaveText('Type Roman Urdu and convert it to Urdu script');
  await expect.poll(() => page.title()).toBe('English to Urdu Typing Online – Type Roman Urdu | WriteUrdu');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://write-urdu.com/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Roman Urdu with English letters.*Urdu script.*transliteration/i);
  const types = await schemaTypes(page);
  expect(types).toContain('WebSite');
  expect(types).toContain('WebPage');
  expect(types).toContain('WebApplication');
  expect(types).toContain('Organization');
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
