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

test('Gate B2 M3 keeps focused Basic Writer usable when the effective viewport shrinks like a software keyboard', async ({ page }) => {
  await openMobileHome(page, { width: 390, height: 844 });
  const editor = page.locator('#transliterateTextarea');

  await editor.focus();
  await editor.fill('میرا اردو متن');
  await page.setViewportSize({ width: 390, height: 480 });
  await page.waitForTimeout(80);

  const focused = await editor.evaluate(node => {
    const rect = node.getBoundingClientRect();
    const viewportHeight = document.documentElement.clientHeight;
    const style = getComputedStyle(node);
    return {
      top: rect.top,
      bottom: rect.bottom,
      height: rect.height,
      visible: Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)),
      maxHeight: style.maxHeight,
      active: document.activeElement === node,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });

  expect(focused.active).toBe(true);
  expect(focused.visible).toBeGreaterThanOrEqual(150);
  expect(focused.height).toBeLessThanOrEqual(320);
  expect(focused.maxHeight).not.toBe('none');
  expect(focused.overflow).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(80);
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue('میرا اردو متن');
});

test('phone input-method chips show their full labels instead of truncating them', async ({ page }) => {
  for (const viewport of VIEWPORTS) {
    await openMobileHome(page, viewport);
    const chips = page.locator('[data-wu-basic-command-surface] .input-mode-option');
    await expect(chips).toHaveCount(3);
    for (let i = 0; i < 3; i += 1) {
      const fit = await chips.nth(i).evaluate(node => ({
        label: node.textContent.trim(),
        clippedX: node.scrollWidth - node.clientWidth,
        clippedY: node.scrollHeight - node.clientHeight,
        ellipsis: getComputedStyle(node).textOverflow === 'ellipsis' && getComputedStyle(node).whiteSpace === 'nowrap' && node.scrollWidth > node.clientWidth
      }));
      expect(fit.clippedX, `${viewport.width}px "${fit.label}" is clipped horizontally`).toBeLessThanOrEqual(1);
      expect(fit.clippedY, `${viewport.width}px "${fit.label}" is clipped vertically`).toBeLessThanOrEqual(1);
      expect(fit.ellipsis, `${viewport.width}px "${fit.label}" shows an ellipsis`).toBe(false);
    }
  }
});

test('the empty Basic Writer shows no disabled export buttons and reveals them once there is text', async ({ page }) => {
  for (const viewport of VIEWPORTS.slice(0, 3)) {
    await openMobileHome(page, viewport);
    const surface = page.locator('[data-wu-basic-command-surface]');
    const direct = surface.locator('[data-wu-command-action="pdf"], [data-wu-command-action="word"], [data-wu-command-action="png"], [data-wu-command-action="download-menu"]');

    for (const action of ['pdf', 'word', 'png', 'download-menu']) {
      await expect(surface.locator(`[data-wu-command-action="${action}"]`), `${viewport.width}px empty state must not show a disabled ${action}`).toBeHidden();
    }
    const visibleDisabled = await surface.evaluate(node => Array.from(node.querySelectorAll('button')).filter(button => {
      const box = button.getBoundingClientRect();
      return button.disabled && box.width > 0 && box.height > 0 && getComputedStyle(button).visibility !== 'hidden';
    }).map(button => button.textContent.trim()));
    expect(visibleDisabled, `${viewport.width}px: no visible disabled command at the empty state`).toEqual([]);
    await expect(surface.locator('[data-wu-basic-more-toggle]'), 'More stays available').toBeVisible();

    await page.locator('#transliterateTextarea').fill('میرا اردو متن مکمل ہے');
    await expect(surface).toHaveAttribute('data-wu-has-content', 'true');
    for (const action of ['pdf', 'word', 'png', 'download-menu']) {
      const control = surface.locator(`[data-wu-command-action="${action}"]`);
      await expect(control, `${viewport.width}px ${action} appears with text`).toBeVisible();
      await expect(control, `${viewport.width}px ${action} is enabled with text`).toBeEnabled();
    }
    await expect(direct.first()).toBeVisible();
  }
});
