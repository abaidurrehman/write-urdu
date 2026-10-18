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
