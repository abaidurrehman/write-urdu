const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!(?:127\.0\.0\.1|localhost)(?::\d+)?(?:\/|$))/, route => route.abort());

async function open(page, route) {
  await blockExternalServices(page);
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached' });
}

function publicShareHtml({ editable = true } = {}) {
  const edit = editable ? '<button class="share-button quiet" type="button" data-share-edit>Edit this design</button>' : '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/css/share-page.css"></head><body><main class="share-shell"><div class="share-layout"><article class="share-card"><img class="share-visual" alt="Shared Urdu card" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='900'/%3E"><h2 data-share-public-text>محفوظ عوامی ڈیزائن</h2></article><aside class="share-panel"><a class="share-hero-cta" href="/urdu-cards" data-share-create>Make your own Urdu card</a><div class="share-actions"><button class="share-button secondary" data-share-use-text>Use these words</button>${edit}</div><p data-share-status aria-live="polite"></p></aside></div></main><script src="/js/workspace-journey-registry.js"></script><script src="/js/create-publish-boundaries-registry.js"></script><script src="/js/workspace-handoff.js"></script><script src="/js/share-loop-telemetry.js"></script><script src="/js/share-page.js"></script></body></html>`;
}

test('Basic writing can continue through Templates into Card Studio without putting Urdu in the URL', async ({ page }) => {
  await open(page, '/');
  await page.waitForFunction(() => Boolean(
    window.WriteUrduWorkspaceNextStep &&
    window.WriteUrduCoreContinuity &&
    window.WriteUrduCreatePublishBoundariesRegistry
  ), null, { timeout: 10000 });

  const text = 'ٹیمپلیٹ کے ساتھ محفوظ اردو متن';
  await page.locator('#transliterateTextarea').fill(text);
  const panel = page.locator('[data-wu-next-step-version="2"]');
  await expect(panel).toBeVisible();
  await expect(panel.locator('[data-wu-next-step-action]')).toHaveCount(4);
  await expect(panel.locator('.wu-continue-actions [data-wu-next-step-action]')).toHaveCount(3);
  await panel.locator('.wu-continue-more > summary').click();
  const templates = panel.locator('[data-wu-next-step-action="basic-to-templates"]');
  await expect(templates).toContainText('Start from a template');
  await templates.click();

  await page.waitForURL(/urdu-templates/, { timeout: 10000 });
  await page.waitForFunction(() => Boolean(window.WriteUrduTemplateLibraryBoundary), null, { timeout: 10000 });
  await expect(page.locator('[data-template-staged-text]')).toContainText('current Urdu');
  const firstTemplate = page.locator('[data-template-grid] [data-template-open]').first();
  await expect(firstTemplate).toHaveText('Use this template');
  await firstTemplate.click();

  await page.waitForURL(/urdu-card-studio/, { timeout: 10000 });
  await expect(page.locator('#cardText')).toHaveValue(text, { timeout: 10000 });
  await expect.poll(() => page.evaluate(() => {
    const app = window.WriteUrduCardStudioApp;
    const state = app && app.getState && app.getState();
    return state && state.libraryTemplateId;
  })).toBeTruthy();
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-wu-card-seed-kind'))).toBe('template-seed');
  expect(page.url()).not.toContain(encodeURIComponent(text));
});

test('QR Generator consumes a v2 public-share URL handoff before its mature engine initializes', async ({ page }) => {
  await open(page, '/');
  await page.waitForFunction(() => Boolean(window.WriteUrduWorkspaceHandoff), null, { timeout: 10000 });
  const shareUrl = 'https://write-urdu.com/s/Abc12345';
  const stored = await page.evaluate(value => window.WriteUrduWorkspaceHandoff.store({
    sourceWorkspace: 'public-share',
    sourceRoute: '/s/Abc12345',
    targetWorkspace: 'qr-generator',
    targetRoute: '/qr-code-generator',
    actionId: 'share-to-qr',
    kind: 'plain-text',
    payload: { text: value }
  }).ok, shareUrl);
  expect(stored).toBe(true);

  await page.goto('/qr-code-generator', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-wu-qr-v2-imported'))).toBe('true');
  await expect(page.locator('[data-qr-type]')).toHaveValue('text');
  await expect(page.locator('[data-qr-field="text"]')).toHaveValue(shareUrl);
  await expect(page.locator('[data-qr-payload]')).toContainText(shareUrl);
  expect(page.url()).not.toContain('Abc12345');
});

test('reconstructible public share restores Card Studio style and keeps 6B format continuity', async ({ page }) => {
  const publicText = 'محفوظ عوامی ڈیزائن';
  const project = {
    version: 2,
    presetId: 'portrait',
    templateId: 'emerald',
    text: {
      value: publicText,
      fontFamily: 'Noto Nastaliq Urdu',
      fontMode: 'manual',
      fontSize: 82,
      minFontSize: 28,
      maxFontSize: 160,
      color: '#fffdf2',
      align: 'center',
      verticalAlign: 'center',
      lineHeight: 1.8,
      shadow: 'soft'
    },
    attribution: { enabled: false, value: '', fontFamily: 'Noto Naskh Arabic', fontSizeRatio: 0.44, color: '#d7f7e4' },
    background: { type: 'gradient', color: '#ffffff', gradientId: 'emerald-night', fit: 'cover', positionX: 0.5, positionY: 0.5, overlayColor: '#000000', overlayOpacity: 0, blur: 0 },
    watermark: { enabled: true, position: 'bottom-left' }
  };

  await blockExternalServices(page);
  await page.route('**/s/AbCd1234', route => route.fulfill({ contentType: 'text/html', body: publicShareHtml() }));
  await page.route('**/api/shares/AbCd1234', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, share: { remix_mode: 'design', remix_payload: { version: 1, project } } })
  }));
  await page.goto('/s/AbCd1234', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.locator('[data-share-edit]')).toHaveText('Edit this design');
  await page.locator('[data-share-edit]').click();

  await page.waitForURL(/urdu-card-studio/, { timeout: 10000 });
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-wu-public-share-remix-restored'))).toBe('true');
  await expect(page.locator('#cardText')).toHaveValue(publicText);
  await expect.poll(() => page.evaluate(() => {
    const state = window.WriteUrduCardStudioApp && window.WriteUrduCardStudioApp.getState();
    return state && [state.presetId, state.templateId, state.text.color, state.text.shadow, state.background.type, state.background.gradientId];
  })).toEqual(['portrait', 'emerald', '#fffdf2', 'soft', 'gradient', 'emerald-night']);
  expect(page.url()).not.toContain('AbCd1234');
  expect(page.url()).not.toContain(encodeURIComponent(publicText));
  expect(await page.evaluate(() => sessionStorage.getItem('write-urdu:workspace-handoff:v2:card-studio'))).toBeNull();

  const whatsapp = page.locator('[data-create-format-target="whatsapp-status"]');
  await expect(whatsapp).toBeVisible();
  await whatsapp.click();
  await page.waitForURL(/urdu-whatsapp-status-maker/, { timeout: 10000 });
  await expect.poll(() => page.evaluate(() => {
    const state = window.WriteUrduCardStudioApp && window.WriteUrduCardStudioApp.getState();
    return state && [state.text.value, state.text.color, state.background.type, state.background.gradientId];
  })).toEqual([publicText, '#fffdf2', 'gradient', 'emerald-night']);
});

test('text-only public share does not promise exact design editing at 360px', async ({ page }) => {
  await blockExternalServices(page);
  await page.setViewportSize({ width: 360, height: 740 });
  await page.route('**/s/AbCd1234', route => route.fulfill({ contentType: 'text/html', body: publicShareHtml({ editable: false }) }));
  await page.goto('/s/AbCd1234', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.locator('[data-share-edit]')).toHaveCount(0);
  await expect(page.locator('[data-share-create]')).toBeVisible();
  await expect(page.locator('[data-share-use-text]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
