const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function open(page, route) {
  await blockExternalServices(page);
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('[data-wu-outcome-nav="v2"]').waitFor({ state: 'attached', timeout: 10000 });
}

async function openMobileMenuIfNeeded(page) {
  const toggle = page.locator('.wu-menu-toggle');
  if (await toggle.isVisible()) await toggle.click();
}

test('global navigation is organized by Write / Create / Work / Learn outcomes', async ({ page }) => {
  await open(page, '/');
  await openMobileMenuIfNeeded(page);

  const nav = page.locator('[data-wu-outcome-nav="v2"]');
  const groups = nav.locator(':scope > [data-wu-nav-group]');
  await expect(groups).toHaveCount(4);
  await expect(groups.nth(0).locator('summary')).toContainText('Write');
  await expect(groups.nth(1).locator('summary')).toContainText('Create');
  await expect(groups.nth(2).locator('summary')).toContainText('Work');
  await expect(groups.nth(3).locator('summary')).toContainText('Learn');

  await groups.nth(0).locator('summary').click();
  const firstWrite = groups.nth(0).locator('.wu-outcome-link').first();
  await expect(firstWrite.locator('strong')).toHaveText('Start writing in Urdu');
  await expect(firstWrite.locator('small')).toHaveText('English to Urdu typing');
  await expect(groups.nth(0).locator('a[href="/tools/urdu-voice-typing"]')).toContainText('Speak and turn it into Urdu text');
  await expect(groups.nth(0).locator('a[href="/tools/inpage-unicode-converter"]')).toContainText('Convert older InPage Urdu');

  await groups.nth(1).locator('summary').click();
  await expect(groups.nth(1).locator('a[href="/urdu-card-studio"] strong')).toContainText('Make a poetry, quote or announcement image');
  await expect(groups.nth(1).locator('a[href="/urdu-card-studio?role=facebook"]')).toContainText('Create a Facebook post');

  await groups.nth(2).locator('summary').click();
  await expect(groups.nth(2).locator('a[href="/urdu-invoice-generator"] strong')).toHaveText('Create an Urdu or English invoice');
  await expect(groups.nth(2).locator('a[href="/urdu-editor"] strong')).toHaveText('Prepare a formal Urdu document');

  await groups.nth(3).locator('summary').click();
  await expect(groups.nth(3).locator('a[href="/urdu-alphabet"] strong')).toHaveText('Learn the Urdu alphabet');
  await expect(groups.nth(3).locator('a[href="/roman-urdu-transliteration"] strong')).toHaveText('How English to Urdu typing works');
  await expect(groups.nth(3).locator('a[href="/urdu-faq"] strong')).toHaveText('Get answers to common questions');

  await expect(nav).not.toContainText('transliteration');
  await expect(nav).not.toContainText('Convert legacy InPage text');
  await expect(page.locator('[data-wu-drafts-utility-slot]')).toHaveCount(1);
  await expect(nav.locator('[data-wu-nav-group="my-drafts"], [data-wu-nav-group="drafts"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('outcome navigation keeps established route owners and active category state', async ({ page }) => {
  const cases = [
    ['/urdu-editor.html', 'write'],
    ['/urdu-card-studio.html', 'create'],
    ['/urdu-invoice-generator.html', 'work'],
    ['/roman-urdu-transliteration.html', 'learn'],
    ['/tools/urdu-voice-typing', 'write'],
    ['/tools/inpage-unicode-converter', 'write']
  ];

  for (const [route, group] of cases) {
    await open(page, route);
    await openMobileMenuIfNeeded(page);
    await expect(page.locator(`[data-wu-nav-group="${group}"] > summary`)).toHaveClass(/is-active/);
    expect(page.url()).not.toMatch(/\/(write|create|work|learn)(?:\/|$)/);
  }
});

test('footer is compact and organized around Write Urdu / Create / Help', async ({ page }) => {
  await open(page, '/');
  const footer = page.locator('[data-wu-outcome-footer="v2"]');
  await expect(footer.locator(':scope > [data-wu-footer-group]')).toHaveCount(3);
  await expect(footer.locator('[data-wu-footer-group="write-urdu"] h2')).toHaveText('Write Urdu');
  await expect(footer.locator('[data-wu-footer-group="create"] h2')).toHaveText('Create');
  await expect(footer.locator('[data-wu-footer-group="help"] h2')).toHaveText('Help');
  await expect(footer.locator('[data-wu-footer-group="write-urdu"] a').first()).toHaveText('English to Urdu typing');
  await expect(footer.locator('a[href="/urdu-editor"]')).toHaveCount(1);
  await expect(footer.locator('a[href="/urdu-card-studio"]')).toHaveCount(1);
  await expect(footer).not.toContainText('Roman Urdu');
  await expect(footer).not.toContainText('transliteration');

  await expect(page.locator('.wu-footer-privacy-note')).toHaveText('Your writing is yours. See Privacy for details.');
  await expect(page.locator('.wu-footer-privacy-note')).not.toContainText('stays in this browser');
  const utility = page.locator('.wu-footer-utility-links');
  await expect(utility.locator('a')).toHaveCount(4);
  await expect(utility).toContainText('Feedback');
  await expect(utility).toContainText('What’s new');
  await expect(utility).toContainText('Sitemap');
  await expect(utility).toContainText('Terms');
});

test('shared footer keeps a dark readable surface on desktop and mobile', async ({ page }) => {
  await open(page, '/');
  const contrast = await page.locator('footer.wu-footer').evaluate(footer => {
    function rgb(value) {
      const match = String(value || '').match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/);
      return match ? match.slice(1, 4).map(Number) : [255, 255, 255];
    }
    function luminance(value) {
      const channels = rgb(value).map(channel => {
        const normalized = channel / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    }
    function ratio(foreground, background) {
      const a = luminance(foreground);
      const b = luminance(background);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    }
    const background = getComputedStyle(footer).backgroundColor;
    const heading = footer.querySelector('.wu-footer-group h2');
    const link = footer.querySelector('.wu-footer-group a');
    const muted = footer.querySelector('.wu-v2-footer-brand p, .wu-v2-footer-status, p, span');
    return {
      backgroundLuminance: luminance(background),
      headingContrast: heading ? ratio(getComputedStyle(heading).color, background) : 0,
      linkContrast: link ? ratio(getComputedStyle(link).color, background) : 0,
      mutedContrast: muted ? ratio(getComputedStyle(muted).color, background) : 0
    };
  });
  expect(contrast.backgroundLuminance, 'Footer background must remain dark').toBeLessThan(0.08);
  expect(contrast.headingContrast, 'Footer headings must meet readable contrast').toBeGreaterThanOrEqual(4.5);
  expect(contrast.linkContrast, 'Footer links must meet readable contrast').toBeGreaterThanOrEqual(4.5);
  expect(contrast.mutedContrast, 'Footer supporting text must meet readable contrast').toBeGreaterThanOrEqual(4.5);
});

test('language switch re-renders the outcome categories and compact footer in Urdu', async ({ page }) => {
  await open(page, '/');
  await page.locator('[data-wu-language-toggle]').click();
  await expect(page.locator('[data-wu-nav-group="write"] > summary')).toContainText('لکھیں');
  await expect(page.locator('[data-wu-nav-group="create"] > summary')).toContainText('بنائیں');
  await expect(page.locator('[data-wu-nav-group="work"] > summary')).toContainText('کام');
  await expect(page.locator('[data-wu-nav-group="learn"] > summary')).toContainText('سیکھیں');
  await expect(page.locator('[data-wu-footer-group="write-urdu"] h2')).toHaveText('اردو لکھیں');
  await expect(page.locator('[data-wu-footer-group="help"] h2')).toHaveText('مدد');
  await expect(page.locator('.wu-footer-utility-links')).toContainText('نیا کیا ہے');
  await expect(page.locator('.wu-footer-utility-links')).toContainText('شرائط');
});
