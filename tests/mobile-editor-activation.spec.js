const { test, expect } = require('@playwright/test');

const VIEWPORTS = [
  { width: 360, height: 800, minimumVisibleEditor: 220 },
  { width: 375, height: 667, minimumVisibleEditor: 160 },
  { width: 390, height: 844, minimumVisibleEditor: 220 },
  { width: 412, height: 915, minimumVisibleEditor: 220 }
];

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function openMobileHome(page, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await blockExternalServices(page);
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => (
    document.body.classList.contains('wu-v2-shell') &&
    document.body.getAttribute('data-wu-core-workspace') === 'basic' &&
    document.body.getAttribute('data-wu-basic-command-toolbar') === 'true' &&
    document.querySelector('[data-wu-basic-command-surface]')
  ), null, { timeout: 10000 });
}

test('Gate B2 keeps the real Basic Writer visible and obvious across required phone viewports', async ({ page }) => {
  for (const viewport of VIEWPORTS) {
    await openMobileHome(page, viewport);

    const editor = page.locator('#transliterateTextarea');
    const editorLabel = page.locator('#demo > label[for="transliterateTextarea"]');
    await expect(editor).toBeVisible();
    await expect(editorLabel).toBeVisible();

    await expect(page.locator('.home-hero-actions')).toBeHidden();
    await expect(page.locator('.home-hero-meta')).toBeHidden();
    await expect(page.locator('.wu-voice-entry-home')).toBeHidden();

    const inputChoices = page.locator('[data-wu-basic-command-surface] .input-mode-option');
    await expect(inputChoices).toHaveCount(3);
    for (let i = 0; i < 3; i += 1) await expect(inputChoices.nth(i)).toBeVisible();

    const geometry = await editor.evaluate((node, viewportHeight) => {
      const rect = node.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        visible: Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)),
        activeOnLoad: document.activeElement === node,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    }, viewport.height);

    expect(geometry.top, `${viewport.width}x${viewport.height}: editor must begin in the first viewport`).toBeLessThan(viewport.height);
    expect(geometry.visible, `${viewport.width}x${viewport.height}: visible editor floor`).toBeGreaterThanOrEqual(viewport.minimumVisibleEditor);
    expect(geometry.activeOnLoad, `${viewport.width}x${viewport.height}: page load must not autofocus the writer`).toBe(false);
    expect(geometry.overflow, `${viewport.width}x${viewport.height}: no horizontal overflow`).toBeLessThanOrEqual(1);

    await editor.focus();
    await expect(editor).toBeFocused();
    await expect(page.locator('#demo')).toHaveCSS('border-top-color', 'rgb(21, 147, 77)');
  }
});