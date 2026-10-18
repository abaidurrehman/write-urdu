const { test, expect } = require('@playwright/test');

// Homepage first-paint stability (2026-10-18): the editor must not jump while
// the shell and command toolbar initialise. Lab CLS was 1.4 on phones and 0.46
// on desktop before; the budget here is the Core Web Vitals "good" threshold.

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:\d+)/, route => route.abort());

async function observeShifts(page) {
  await page.addInitScript(() => {
    window.__wuShift = { cls: 0, sources: [] };
    new PerformanceObserver(list => list.getEntries().forEach(entry => {
      if (entry.hadRecentInput) return;
      window.__wuShift.cls += entry.value;
      window.__wuShift.sources.push(entry.value.toFixed(3) + ' ' + (entry.sources || []).map(source => source.node && source.node.nodeType === 1 ? source.node.tagName + '.' + source.node.className : '?').join(','));
    })).observe({ type: 'layout-shift', buffered: true });
  });
}

async function clsUntilToolbar(page) {
  await page.waitForFunction(() => document.body.getAttribute('data-wu-basic-command-toolbar') === 'true', null, { timeout: 15000 });
  await page.waitForTimeout(600);
  return page.evaluate(() => window.__wuShift);
}

for (const route of ['/', '/urdu/']) {
  test.describe(`first paint stability ${route}`, () => {
    test.describe('phone', () => {
      test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      test('the editor does not jump while the toolbar initialises', async ({ page }) => {
        await blockExternalServices(page);
        await observeShifts(page);
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        const shift = await clsUntilToolbar(page);
        expect(shift.cls, shift.sources.join(' | ')).toBeLessThan(0.1);
      });
    });

    test.describe('laptop', () => {
      test.use({ viewport: { width: 1366, height: 768 } });
      test('the editor does not jump while the toolbar initialises', async ({ page }) => {
        await blockExternalServices(page);
        await observeShifts(page);
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        const shift = await clsUntilToolbar(page);
        expect(shift.cls, shift.sources.join(' | ')).toBeLessThan(0.1);
        const counts = await page.evaluate(() => ['v2-shell.css', 'core-workspace-convergence.css', 'basic-writer-command-toolbar.css', 'basic-writer-export-priority.css']
          .map(name => document.querySelectorAll(`link[href$="${name}"]`).length));
        expect(counts, 'each statically linked stylesheet is loaded once').toEqual([1, 1, 1, 1]);
      });
    });
  });
}

test.describe('desktop first viewport', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test('the editor fills most of a 1366x768 first screen and long-passage conversion still appears', async ({ page }) => {
    await blockExternalServices(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.body.getAttribute('data-wu-basic-command-toolbar') === 'true', null, { timeout: 15000 });
    const editor = page.locator('#transliterateTextarea');
    const gap = await editor.evaluate(node => node.getBoundingClientRect().top - document.querySelector('.editor-page-intro').getBoundingClientRect().bottom);
    expect(gap, 'only the command surface sits between the hero and the editor (was ~261px)').toBeLessThanOrEqual(180);
    await expect(page.locator('.batch-transliteration-panel [data-batch-title]'), 'the idle explainer repeats the lede').toBeHidden();
    await expect(page.locator('.wu-basic-command-helper'), 'the example strip repeats the lede').toBeHidden();
    await expect(page.locator('.page-intro')).toContainText(/mera khayal hai\s*→\s*میرا خیال ہے/);

    await editor.fill('mera naam abaid hai aur main lahore mein rehta hoon');
    await expect(page.locator('.batch-transliteration-panel [data-batch-action]'), 'the Convert action still appears for a long passage').toBeVisible();
  });
});

test.describe('production account state', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  // In production the documents API answers, so basic-account-documents.mjs
  // mounts the account card and its two-column hero ~2s after load. Static
  // test servers have no API, which is how a 0.22 desktop shift went unseen.
  test('the account hero layout does not move the page when the account module mounts', async ({ page }) => {
    await blockExternalServices(page);
    await page.route('**/api/documents', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":{"code":"unauthenticated"}}' }));
    await page.route('**/api/me', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"available":true,"authenticated":false}' }));
    await observeShifts(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-home-account-continuity]')).toHaveCount(1, { timeout: 15000 });
    const shift = await clsUntilToolbar(page);
    await page.waitForTimeout(800);
    const total = await page.evaluate(() => window.__wuShift);
    expect(total.cls, total.sources.join(' | ')).toBeLessThan(0.1);
    expect(shift.cls).toBeLessThan(0.1);
  });
});

test.describe('fallback when the toolbar runtime fails', () => {
  test.use({ viewport: { width: 1366, height: 768 } });
  test('legacy input-mode controls return shortly after load', async ({ page }) => {
    await blockExternalServices(page);
    await page.route('**/js/basic-writer-command-toolbar.js', route => route.abort());
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.locator('html')).toHaveClass(/wu-basic-toolbar-pending/);
    await expect(page.locator('.editor-chrome [data-input-mode-option="roman"]')).toBeHidden();
    await expect(page.locator('html')).not.toHaveClass(/wu-basic-toolbar-pending/, { timeout: 6000 });
    await expect(page.locator('.editor-chrome [data-input-mode-option="roman"]')).toBeVisible();
    await expect(page.locator('#transliterateTextarea')).toBeVisible();
  });
});
