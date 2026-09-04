const { test, expect } = require('@playwright/test');

const VIEWPORTS = [
  { width: 360, height: 800, minimumVisibleEditor: 220 },
  { width: 375, height: 667, minimumVisibleEditor: 180 },
  { width: 390, height: 844, minimumVisibleEditor: 220 },
  { width: 412, height: 915, minimumVisibleEditor: 220 }
];

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function openRichEditor(page, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await blockExternalServices(page);
  await page.goto('/urdu-editor.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => (
    document.body.classList.contains('wu-v2-shell') &&
    document.querySelector('.tox.tox-tinymce') &&
    document.querySelector('#basic-example_ifr')
  ), null, { timeout: 12000 });
  await page.waitForFunction(() => document.querySelectorAll('.input-mode-control-rich .input-mode-option').length >= 3, null, { timeout: 12000 });
}

test('Gate B2 M4 puts the Rich Editor before export/share chrome on required phone viewports', async ({ page }) => {
  for (const viewport of VIEWPORTS) {
    await openRichEditor(page, viewport);

    const editor = page.locator('.tox.tox-tinymce');
    const label = page.locator('label[for="basic-example"]');
    const inputMode = page.locator('.input-mode-control-rich');
    const completionActions = page.locator('.tool-actions');

    await expect(label).toBeVisible();
    await expect(editor).toBeVisible();
    await expect(inputMode).toBeVisible();
    await expect(completionActions).toBeVisible();

    const methods = inputMode.locator('.input-mode-option');
    expect(await methods.count()).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < 3; i += 1) await expect(methods.nth(i)).toBeVisible();
    await expect(inputMode.locator('.input-mode-title')).toBeHidden();
    await expect(inputMode.locator('.input-mode-note')).toBeHidden();
    await expect(inputMode.locator('.wu-voice-discovery-copy')).toBeHidden();

    const geometry = await page.evaluate(viewportHeight => {
      const editor = document.querySelector('.tox.tox-tinymce');
      const label = document.querySelector('label[for="basic-example"]');
      const input = document.querySelector('.input-mode-control-rich');
      const actions = document.querySelector('.tool-actions');
      const editorRect = editor.getBoundingClientRect();
      const labelRect = label.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      const actionRect = actions.getBoundingClientRect();
      return {
        editorTop: editorRect.top,
        editorBottom: editorRect.bottom,
        editorHeight: editorRect.height,
        visible: Math.max(0, Math.min(editorRect.bottom, viewportHeight) - Math.max(editorRect.top, 0)),
        labelTop: labelRect.top,
        inputBottom: inputRect.bottom,
        actionTop: actionRect.top,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    }, viewport.height);

    expect(geometry.editorTop, `${viewport.width}x${viewport.height}: Rich Editor must begin in initial viewport`).toBeLessThan(viewport.height);
    expect(geometry.visible, `${viewport.width}x${viewport.height}: visible Rich Editor floor`).toBeGreaterThanOrEqual(viewport.minimumVisibleEditor);
    expect(geometry.labelTop).toBeLessThan(geometry.editorTop);
    expect(geometry.inputBottom).toBeLessThanOrEqual(geometry.editorTop + 2);
    expect(geometry.actionTop, 'Export/share toolbar must follow the editor on mobile').toBeGreaterThanOrEqual(geometry.editorBottom - 2);
    expect(geometry.overflow).toBeLessThanOrEqual(1);
  }
});

test('Gate B2 M4 lets TinyMCE contract safely when the effective viewport shrinks', async ({ page }) => {
  await openRichEditor(page, { width: 390, height: 844 });
  const editor = page.locator('.tox.tox-tinymce');
  const body = page.frameLocator('#basic-example_ifr').locator('body');

  await body.click();
  await body.fill('یہ میرا اردو دستاویز ہے');
  await page.setViewportSize({ width: 390, height: 480 });
  await page.waitForTimeout(100);

  const geometry = await editor.evaluate(node => {
    const rect = node.getBoundingClientRect();
    return {
      height: rect.height,
      visible: Math.max(0, Math.min(rect.bottom, document.documentElement.clientHeight) - Math.max(rect.top, 0)),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });

  expect(geometry.height).toBeGreaterThanOrEqual(220);
  expect(geometry.height).toBeLessThanOrEqual(300);
  expect(geometry.visible).toBeGreaterThan(100);
  expect(geometry.overflow).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(100);
  await expect(body).toContainText('یہ میرا اردو دستاویز ہے');
});