const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

// Explicit shell overrides are allowed to replace a page heading; every other
// page must keep the heading it ships with.
const headerCore = read('js/site-header-core.js');
const overriddenTitles = {};
for (const match of headerCore.matchAll(/'(\/[^']*)': \{ title: \['([^']*)'/g)) {
  overriddenTitles[match[1].replace(/\.html$/i, '')] = match[2];
}

const registryRows = read('docs/WU-PUBLIC-PAGE-REGISTRY.csv').trim().split('\n').slice(1)
  .map(line => line.split(','))
  .map(([sourceFile, route]) => ({ sourceFile, route }))
  .filter(row => /\.html$/.test(row.sourceFile) && row.route && fs.existsSync(path.join(root, row.sourceFile)));

// Pages that previously fell back to the homepage heading.
const formerlyOverwritten = [
  { sourceFile: 'sign-in.html', route: '/sign-in' },
  { sourceFile: 'tools/audio-to-text-translator.html', route: '/tools/audio-to-text-translator' },
  { sourceFile: 'tools/english-to-urdu-document-translator.html', route: '/tools/english-to-urdu-document-translator' },
  { sourceFile: 'tools/urdu-english-dictionary.html', route: '/tools/urdu-english-dictionary' },
  { sourceFile: 'tools/urdu-english-voice-translator.html', route: '/tools/urdu-english-voice-translator' },
  { sourceFile: 'tools/urdu-text-to-speech.html', route: '/tools/urdu-text-to-speech' }
];

const pages = [...registryRows, ...formerlyOverwritten.filter(extra => !registryRows.some(row => row.route === extra.route))];

function sourceHeading(sourceFile) {
  const match = read(sourceFile).match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? match[1] : null;
}

test('pages keep their own H1 unless the shell explicitly owns it', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Heading ownership does not depend on viewport.');
  test.setTimeout(240000);
  await blockExternalServices(page);

  for (const { sourceFile, route } of pages) {
    const rawHeading = sourceHeading(sourceFile);
    if (rawHeading === null) continue;
    await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForFunction(() => Boolean(window.WriteUrduLocale), null, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(300);
    const [expected, actual] = await page.evaluate(raw => {
      const holder = document.createElement('div');
      holder.innerHTML = raw;
      const normalize = value => String(value || '').replace(/\s+/g, ' ').trim();
      const heading = document.querySelector('h1');
      return [normalize(holder.textContent), normalize(heading && heading.textContent)];
    }, rawHeading);
    const allowed = [expected];
    const override = overriddenTitles[route];
    if (override) allowed.push(override);
    // Later shell copy passes may adjust the case of an explicit override.
    expect(allowed.map(value => value.toLowerCase()), `${route} rendered H1 "${actual}"`).toContain(actual.toLowerCase());
  }
});

test('keyboard and stylish text pages load without the known runtime errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await blockExternalServices(page);
  for (const route of ['/urdu-keyboard', '/stylish-urdu-text-generator']) {
    await page.goto(route, { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(800);
  }
  expect(errors.filter(message => /Clipboard|insertBefore/.test(message))).toEqual([]);
});

test('ready-made card actions announce the visible card name, not an internal id', async ({ page }) => {
  await blockExternalServices(page);
  await page.goto('/urdu-cards', { waitUntil: 'domcontentloaded', timeout: 15000 });
  const button = page.locator('[data-urdu-cards-image-share]').first();
  await expect(button).toBeAttached();
  const cardId = await button.getAttribute('data-urdu-cards-image-share');
  const label = await button.getAttribute('aria-label');
  const heading = await button.locator('xpath=ancestor::article[1]').locator('h2').first().textContent();
  expect(label).not.toContain(cardId);
  expect(label).toContain(heading.trim());
});

test('InPage converter links its editor shortcut to the Rich Text Editor', async ({ page }) => {
  await blockExternalServices(page);
  await page.goto('/tools/inpage-unicode-converter', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.getByRole('link', { name: 'Open the Urdu editor' })).toHaveAttribute('href', '/urdu-editor');
});
