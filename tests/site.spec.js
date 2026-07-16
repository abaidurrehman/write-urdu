const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');
const open = async (page, route) => {
  await page.goto(route, { waitUntil: 'commit', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached', timeout: 10000 });
};
const openFile = (page, route) => page.goto(
  pathToFileURL(path.resolve(__dirname, '..', route.replace(/^\/+/, ''))).href,
  { waitUntil: 'domcontentloaded', timeout: 15000 }
);
const blockNonVisualServices = page => Promise.all([
  page.route(/google_jsapi\.js/, route => route.abort()),
  page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort())
]);

test('homepage renders without duplicate controls or horizontal overflow', async ({ page }) => {
  await blockNonVisualServices(page);
  await open(page, '/index.html');
  await expect(page.locator('.wu-site-header')).toBeVisible();
  await expect(page.locator('#exportImage')).toHaveCount(1);
  await expect(page.locator('#transliterateTextarea')).toBeVisible();
  const editorBox = await page.locator('#transliterateTextarea').boundingBox();
  expect(editorBox.y).toBeLessThan(320);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('basic Google transliteration remains connected', async ({ page }) => {
  test.skip(process.env.LIVE_TRANSLITERATION !== '1', 'Set LIVE_TRANSLITERATION=1 to test the external Google service');
  await open(page, '/index.html');
  await expect(page.locator('#spinner')).toBeHidden({ timeout: 20000 });
  const editor = page.locator('#transliterateTextarea');
  await editor.pressSequentially('mera');
  await editor.press('Space');
  await expect(editor).toHaveValue(/میرا/);
});

test('Urdu keyboard inserts characters and clears text', async ({ page }) => {
  await blockNonVisualServices(page);
  await open(page, '/urdu-keyboard.html');
  await page.locator('input[value="ا"]').click();
  await expect(page.locator('#write')).toHaveValue('ا');
  await expect(page.locator('[data-word-count]')).toHaveText('1 word');
  await expect(page.locator('[data-character-count]')).toHaveText('1 character');
  await page.locator('#clear').click();
  await expect(page.locator('#write')).toHaveValue('');
});

test('template library filters, favorites, and renders starter designs', async ({ page }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/urdu-templates.html');
  await expect(page.locator('[data-template-grid] .template-card')).toHaveCount(46);
  await page.locator('[data-template-search]').fill('eid');
  await expect(page.locator('[data-template-grid] .template-card')).not.toHaveCount(0);
  const favorite = page.locator('[data-template-favorite]').first();
  await favorite.click();
  await expect(favorite).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-template-clear]').first().click();
  await expect(page.locator('[data-template-grid] .template-card')).toHaveCount(46);
});

test('Card Studio consumes a validated template query without losing its editor state', async ({ page }) => {
  await blockNonVisualServices(page);
  const studioUrl = pathToFileURL(path.resolve(__dirname, '..', 'urdu-card-studio.html')).href + '?template=quiet-morning-verse';
  await page.goto(studioUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect.poll(() => page.evaluate(() => window.WriteUrduCardStudioApp && window.WriteUrduCardStudioApp.getState().libraryTemplateId)).toBe('urdu-template-poetry-01');
  await expect(page.locator('#cardText')).toHaveValue('یہاں اپنا اردو متن لکھیں۔');
});

test('Card Studio identifies the selected library template from the query string', async ({ page }) => {
  await blockNonVisualServices(page);
  const studioUrl = pathToFileURL(path.resolve(__dirname, '..', 'urdu-card-studio.html')).href + '?template=daily-reminder';
  await page.goto(studioUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect.poll(() => page.evaluate(() => window.WriteUrduCardStudioApp && window.WriteUrduCardStudioApp.getState().libraryTemplateId)).toBe('urdu-template-social-01');
  await expect(page.locator('[data-card-library-template]')).toBeVisible();
  await expect(page.locator('[data-card-library-template]')).toContainText('Daily Reminder');
});

test('Card Studio applies the library template visual style instead of only its label', async ({ page }) => {
  await blockNonVisualServices(page);
  const studioUrl = pathToFileURL(path.resolve(__dirname, '..', 'urdu-card-studio.html')).href + '?template=classroom-note';
  await page.goto(studioUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect.poll(() => page.evaluate(() => {
    const state = window.WriteUrduCardStudioApp && window.WriteUrduCardStudioApp.getState();
    return state && [state.libraryTemplateId, state.templateId, state.presetId, state.background.color].join('|');
  })).toBe('urdu-template-education-02|paper|landscape|#f5ead7');
  await expect(page.locator('[data-card-template="paper"]')).toHaveAttribute('aria-pressed', 'true');
});

test('copy control uses the native clipboard and reports success', async ({ page, context }) => {
  await blockNonVisualServices(page);
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:8765' });
  await open(page, '/index.html');
  await page.locator('#transliterateTextarea').fill('اردو متن');
  await page.getByRole('button', { name: 'Copy text' }).click();
  await expect(page.locator('#appNotifications')).toContainText('copied to the clipboard');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('اردو متن');
});

test('frontend writing tools save, restore, edit and share a local draft', async ({ page, isMobile }) => {
  test.skip(isMobile, 'One desktop check covers shared local writing tools');
  await blockNonVisualServices(page);
  await open(page, '/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });

  const editor = page.locator('#transliterateTextarea');
  await editor.fill('میرا اردو متن 123');
  await expect(page.locator('[data-word-count]')).toHaveText('4 words');
  await page.getByRole('button', { name: 'Insert Urdu comma' }).click();
  await expect(editor).toHaveValue(/،$/);
  await page.getByRole('button', { name: '123 → ۱۲۳' }).click();
  await expect(editor).toHaveValue(/۱۲۳،$/);
  await expect(page.locator('[data-save-status]')).toContainText('Saved on this device', { timeout: 5000 });
  expect(await page.evaluate(() => Boolean(localStorage.getItem('write-urdu:draft:v1:basic')))).toBe(true);
  await page.getByRole('button', { name: 'Recent drafts' }).click();
  await expect(page.locator('[data-history-list] [data-history-index]')).toHaveCount(1);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-draft-recovery]')).toBeVisible();
  await page.getByRole('button', { name: 'Restore' }).click();
  await expect(editor).toHaveValue(/میرا اردو متن ۱۲۳،/);

  await page.getByRole('button', { name: 'Find & replace' }).click();
  await page.getByLabel('Find').fill('اردو');
  await page.getByLabel('Replace with').fill('زبان');
  await page.getByRole('button', { name: 'Replace all' }).click();
  await expect(editor).toHaveValue(/میرا زبان متن/);

  await page.getByRole('button', { name: 'Focus mode' }).click();
  await expect(page.locator('body')).toHaveClass(/write-urdu-focus/);
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).not.toHaveClass(/write-urdu-focus/);

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: payload => { window.__sharedUrdu = payload; return Promise.resolve(); }
    });
  });
  await page.locator('[data-write-urdu-share]').click();
  await expect.poll(() => page.evaluate(() => window.__sharedUrdu && window.__sharedUrdu.text)).toContain('میرا زبان متن');

  await page.locator('[data-import-file]').setInputFiles({
    name: 'import.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('درآمد شدہ متن', 'utf8')
  });
  await expect(editor).toHaveValue('درآمد شدہ متن');
});

test('productivity actions sit above the editor and recent drafts opens as a list', async ({ page }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });

  const editor = page.locator('#transliterateTextarea');
  const historyButton = page.locator('[data-action="history"]');
  await expect(historyButton).toBeVisible();
  const editorBox = await editor.boundingBox();
  const actionBox = await historyButton.boundingBox();
  expect(actionBox.y, 'Recent drafts should be above the editor').toBeLessThan(editorBox.y);
  const productivityBox = await page.locator('.editor-productivity').boundingBox();
  expect(productivityBox.y, 'Draft status and quick tools should remain below the editor').toBeGreaterThan(editorBox.y);

  await historyButton.click();
  await expect(page.locator('[data-history-panel]')).toBeVisible();
  await expect(page.locator('[data-history-list]')).toContainText('No saved drafts yet.');

  await editor.fill('میرا محفوظ متن');
  await expect(page.locator('[data-save-status]')).toContainText('Saved on this device', { timeout: 5000 });
  await historyButton.click();
  await expect(page.locator('[data-history-list] [data-history-index]')).toHaveCount(1);
});

test('onboarding, draft actions and command palette are discoverable', async ({ page }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });

  const onboarding = page.locator('[data-editor-onboarding]');
  await expect(onboarding).toBeVisible();
  await onboarding.getByRole('button', { name: 'Got it' }).click();
  await expect(onboarding).toBeHidden();

  const shortcuts = page.locator('[data-action="shortcuts"]');
  await shortcuts.click();
  const palette = page.locator('[data-command-palette]');
  await expect(palette).toBeVisible();
  await palette.locator('[data-command-search]').fill('draft');
  await expect(palette.locator('[data-command="save"]')).toBeVisible();
  await expect(palette.locator('[data-command="find"]')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(palette).toBeHidden();

  const editor = page.locator('#transliterateTextarea');
  await editor.fill('میرا مقامی مسودہ');
  await expect(page.locator('[data-save-status]')).toContainText('Saved on this device', { timeout: 5000 });
  await page.locator('[data-action="history"]').click();
  await expect(page.locator('[data-history-index]')).toHaveCount(1);
  page.once('dialog', dialog => dialog.accept('My local draft'));
  await page.locator('[data-history-rename-index="0"]').click();
  await expect(page.locator('[data-history-index]')).toContainText('My local draft');
  await page.locator('[data-history-delete-index="0"]').click();
  await expect(page.locator('[data-history-index]')).toHaveCount(0);
});

test('rich editor writing tools preserve rich content while transforming text', async ({ page, isMobile }) => {
  test.skip(isMobile, 'One desktop check covers the rich editor adapter');
  await blockNonVisualServices(page);
  await open(page, '/urdu-editor.html');
  const body = page.frameLocator('#basic-example_ifr').locator('body');
  await expect(body).toBeVisible();
  await body.fill('اردو متن 123');
  await expect(page.locator('[data-word-count]')).toHaveText('3 words');
  await page.getByRole('button', { name: '123 → ۱۲۳' }).click();
  await expect(body).toContainText('اردو متن ۱۲۳');
  await page.getByRole('button', { name: 'Find & replace' }).click();
  await page.getByLabel('Find').fill('متن');
  await page.getByLabel('Replace with').fill('تحریر');
  await page.getByRole('button', { name: 'Replace all' }).click();
  await expect(body).toContainText('اردو تحریر ۱۲۳');
});

test('dependency failure presents a retry message', async ({ page, isMobile }) => {
  test.skip(isMobile, 'One desktop check covers the shared dependency UI');
  await page.route(/google_jsapi\.js|google\.com\/uds/, route => route.abort());
  await open(page, '/index.html');
  await expect(page.locator('#dependencyAlert')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#dependencyAlert')).toContainText('could not be loaded');
  await expect(page.locator('#dependencyAlert button')).toHaveText('Retry');
});

test('rich editor initializes and transliterates', async ({ page }) => {
  test.skip(process.env.LIVE_TRANSLITERATION !== '1', 'Set LIVE_TRANSLITERATION=1 to test the external Google service');
  await open(page, '/urdu-editor.html');
  await expect(page.locator('#spinner')).toBeHidden({ timeout: 20000 });
  const frame = page.frameLocator('#basic-example_ifr');
  const body = frame.locator('body');
  await expect(body).toBeVisible();
  await body.pressSequentially('mera');
  await body.press('Space');
  await expect(body).toContainText('میرا');
  await expect(page.locator('#exportPdf')).toHaveCount(1);
  await expect(page.locator('#exportImage')).toHaveCount(1);
});

test('mobile menu and primary tools remain inside the viewport', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-only regression');
  await blockNonVisualServices(page);
  for (const route of ['/index.html', '/urdu-editor.html', '/urdu-keyboard.html']) {
    await open(page, route);
    const menu = page.locator('.wu-menu-toggle');
    await expect(menu).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${route} has horizontal overflow`).toBeLessThanOrEqual(1);
    const primarySelector = route.includes('urdu-editor') ? '#basic-example_ifr' : route.includes('keyboard') ? '#key1' : '#transliterateTextarea';
    const boxes = await Promise.all([menu.boundingBox(), page.locator(primarySelector).boundingBox()]);
    const viewportWidth = page.viewportSize().width;
    for (const box of boxes) {
      expect(box).not.toBeNull();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth + 1);
    }
    expect(boxes[1].y, `${route} primary tool starts too far below the fold`).toBeLessThan(360);
    await expect(page.locator('.editor-productivity')).toBeVisible();
    const toolsBox = await page.locator('.editor-productivity').boundingBox();
    expect(toolsBox.x, `${route} writing tools start outside the viewport`).toBeGreaterThanOrEqual(0);
    expect(toolsBox.x + toolsBox.width, `${route} writing tools exceed the viewport`).toBeLessThanOrEqual(viewportWidth + 1);
  }
});

test('content pages retain readable typography and responsive embeds', async ({ page }) => {
  await blockNonVisualServices(page);
  for (const route of ['/write-urdu-features.html', '/write-urdu-documentation.html', '/urdu-alphabet.html', '/urdu-faq.html', '/write-urdu-search.html', '/write-urdu-privacy.html', '/why-write-urdu.html']) {
    await openFile(page, route);
    await expect(page.locator('body')).toHaveClass(/content-page/);
    await expect(page.locator('.wu-header-ad')).toHaveCount(1);
    await expect(page.locator('.wu-footer-links a')).toHaveCount(17);
    const metrics = await page.evaluate(() => {
      const paragraph = document.querySelector('p');
      const style = paragraph ? getComputedStyle(paragraph) : null;
      const heading = document.querySelector('h1');
      const table = document.querySelector('table');
      const footer = document.querySelector('footer');
      const headingBox = heading ? heading.getBoundingClientRect() : null;
      const tableBox = table ? table.getBoundingClientRect() : null;
      const footerBox = footer ? footer.getBoundingClientRect() : null;
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        fontSize: style ? parseFloat(style.fontSize) : 0,
        lineHeight: style ? parseFloat(style.lineHeight) : 0,
        headingBottom: headingBox ? headingBox.bottom : 0,
        tableRight: tableBox ? tableBox.right : 0,
        footerTop: footerBox ? footerBox.top : 0
      };
    });
    expect(metrics.overflow, `${route} has horizontal overflow`).toBeLessThanOrEqual(1);
    expect(metrics.fontSize).toBeGreaterThanOrEqual(14);
    expect(metrics.lineHeight).toBeGreaterThan(metrics.fontSize * 1.45);
    if (route === '/urdu-alphabet.html') {
      expect(metrics.footerTop, 'Urdu alphabet footer overlaps the heading').toBeGreaterThan(metrics.headingBottom);
      expect(metrics.tableRight, 'Urdu alphabet table exceeds the viewport').toBeLessThanOrEqual(page.viewportSize().width + 1);
    }
    if (route === '/write-urdu-documentation.html') {
      await expect(page.locator('.docs-hero')).toBeVisible();
      await expect(page.locator('.docs-card')).toHaveCount(6);
      await expect(page.locator('.docs-faq details')).toHaveCount(4);
    }
  }
});

test('Card Studio opens with editor text and renders the selected preset', async ({ page }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/index.html');
  const editor = page.locator('#transliterateTextarea');
  await editor.fill('یہ ایک خوب صورت اردو کارڈ ہے۔');
  await page.getByRole('button', { name: 'Create Urdu Card' }).click();
  await page.locator('[data-card-studio]').waitFor();
  await expect(page.locator('#cardText')).toHaveValue('یہ ایک خوب صورت اردو کارڈ ہے۔');
  await expect(page.locator('#cardCanvas')).toHaveAttribute('width', '1080');
  await page.locator('#cardPreset').selectOption('story');
  await expect(page.locator('#cardCanvas')).toHaveAttribute('width', '1080');
  await expect(page.locator('#cardCanvas')).toHaveAttribute('height', '1920');
  await page.locator('[data-card-template="midnight"]').click();
  await expect(page.locator('[data-card-template="midnight"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-card-template="sunflower-bloom"]').click();
  await expect(page.locator('[data-card-template="sunflower-bloom"]')).toHaveAttribute('aria-pressed', 'true');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('Card Studio supports local draft state and Urdu localization', async ({ page }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/urdu-card-studio.html');
  await expect(page.locator('#cardCanvas')).toBeVisible();
  await page.locator('#cardText').fill('مقامی طور پر محفوظ کارڈ');
  await expect(page.locator('[data-card-status]')).toContainText('Saved on this device', { timeout: 5000 });
  await page.locator('[data-wu-language-toggle]').click();
  await expect(page.locator('[data-card-i18n="title"]')).toHaveText('اردو کارڈ اسٹوڈیو');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('Card Studio downloads a PNG without leaving the browser', async ({ page }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/urdu-card-studio.html');
  await page.locator('#cardText').fill('یہ تصویر میرے براؤزر میں تیار ہوئی۔');
  const download = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download PNG' }).first().click()
  ]);
  expect(download[0].suggestedFilename()).toMatch(/\.png$/i);
  await expect(page.locator('[data-card-status]')).toContainText('PNG downloaded');
});

test('Card Studio connects its text field to the transliteration control', async ({ page }) => {
  await page.addInitScript(() => {
    window.google = {
      elements: { transliteration: {
        LanguageCode: { ENGLISH: 'en', URDU: 'ur' },
        TransliterationControl: function () {
          this.makeTransliteratable = ids => { window.__cardTransliterationTarget = ids[0]; };
        }
      } },
      load: () => {},
      setOnLoadCallback: callback => window.setTimeout(callback, 0)
    };
  });
  await blockNonVisualServices(page);
  await openFile(page, '/urdu-card-studio.html');
  await expect(page.locator('[data-card-transliteration-status]')).toContainText('Roman Urdu input is ready');
  await expect.poll(() => page.evaluate(() => window.__cardTransliterationTarget)).toBe('cardText');
});

test('Card Studio supports direct Urdu selection, movement, resizing and edit commit', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Desktop pointer geometry is covered here; mobile touch behavior is verified manually.');
  await blockNonVisualServices(page);
  await openFile(page, '/urdu-card-studio.html');
  await page.waitForFunction(() => Boolean(window.WriteUrduCardStudioApp));
  const layer = page.locator('[data-card-interaction-layer]');
  await layer.click({ position: { x: 300, y: 300 } });
  const box = await layer.boundingBox();
  const before = await page.evaluate(() => window.WriteUrduCardStudioApp.getObjectRect('text'));
  await page.mouse.move(box.x + 300, box.y + 300);
  await page.mouse.down();
  await page.mouse.move(box.x + 340, box.y + 330);
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => window.WriteUrduCardStudioApp.getObjectRect('text').x)).toBeGreaterThan(before.x);
  await page.evaluate(() => document.querySelector('[data-card-interaction-layer]').focus());
  const xBeforeArrow = await page.evaluate(() => window.WriteUrduCardStudioApp.getObjectRect('text').x);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => page.evaluate(() => window.WriteUrduCardStudioApp.getObjectRect('text').x)).toBeLessThan(xBeforeArrow);
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  const editor = page.locator('[data-card-canvas-editor]');
  await expect(editor).toBeVisible();
  await editor.fill('براہ راست اردو تدوین');
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.WriteUrduCardStudioApp.getState().text.value)).toBe('براہ راست اردو تدوین');
  const leftHandle = page.locator('[data-card-resize="left"]');
  const handleBox = await leftHandle.boundingBox();
  const widthBefore = await page.evaluate(() => window.WriteUrduCardStudioApp.getObjectRect('text').width);
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(handleBox.x + 45, handleBox.y + handleBox.height / 2);
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => window.WriteUrduCardStudioApp.getObjectRect('text').width)).toBeLessThan(widthBefore);
});

test('QR generator accepts Urdu editor text and renders a local preview', async ({ page }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/index.html');
  await page.locator('#transliterateTextarea').fill('ہمیں اردو سے محبت ہے۔');
  await page.locator('[data-create-qr]').click();
  await page.locator('[data-qr-generator]').waitFor();
  await expect(page.locator('[data-qr-field="text"]')).toHaveValue('ہمیں اردو سے محبت ہے۔');
  await expect(page.locator('#qrCanvas')).toBeVisible();
  await expect(page.locator('[data-qr-download-png]')).toBeEnabled();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('QR generator validates types and downloads PNG and SVG locally', async ({ page }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/qr-code-generator.html');
  await expect(page.locator('[data-qr-type]')).toHaveValue('url');
  await page.locator('[data-qr-field="url"]').fill('not a url');
  await expect(page.locator('[data-qr-download-png]')).toBeDisabled();
  await expect(page.locator('[data-qr-health]')).toContainText('complete website address');
  await page.locator('[data-qr-field="url"]').fill('https://write-urdu.com/');
  await expect(page.locator('[data-qr-download-png]')).toBeEnabled();
  const png = await Promise.all([page.waitForEvent('download'), page.locator('[data-qr-download-png]').click()]);
  expect(png[0].suggestedFilename()).toMatch(/\.png$/i);
  const svg = await Promise.all([page.waitForEvent('download'), page.locator('[data-qr-download-svg]').click()]);
  expect(svg[0].suggestedFilename()).toMatch(/\.svg$/i);
  await page.locator('[data-qr-type]').selectOption('wifi');
  await page.locator('[data-qr-field="ssid"]').fill('Urdu Wi-Fi');
  await page.locator('[data-qr-field="password"]').fill('secret');
  await expect(page.locator('[data-qr-payload]')).toContainText('WIFI:T:WPA');
});

test('QR generator localizes its title and privacy promise', async ({ page }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/qr-code-generator.html');
  await page.locator('[data-wu-language-toggle]').click();
  await expect(page.locator('h1.wu-page-title')).toHaveText('مفت QR کوڈ جنریٹر');
  await expect(page.locator('[data-qr-privacy]')).toContainText('آپ کا متن اور لوگو');
  await expect(page.locator('[data-qr-download-png]')).toHaveText('PNG ڈاؤن لوڈ کریں');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('QR generator keeps local logos contained and raises correction level', async ({ page }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/qr-code-generator.html');
  await page.locator('[data-qr-logo]').setInputFiles(path.resolve(__dirname, '..', 'sample.png'));
  await expect(page.locator('[data-qr-logo-options]')).toBeVisible();
  await expect(page.locator('[data-qr-design="errorCorrectionLevel"]')).toHaveValue('H');
  await expect(page.locator('[data-qr-download-svg]')).toBeEnabled();
  const svg = await Promise.all([page.waitForEvent('download'), page.locator('[data-qr-download-svg]').click()]);
  expect(svg[0].suggestedFilename()).toMatch(/\.svg$/i);
});

test('QR generator restores a local design after refresh', async ({ page }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/qr-code-generator.html');
  await page.evaluate(() => { localStorage.clear(); indexedDB.deleteDatabase('writeUrduQrGenerator'); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-qr-type]').selectOption('text');
  await page.locator('[data-qr-field="text"]').fill('یہ ڈیزائن اسی آلے پر محفوظ ہے۔');
  await expect(page.locator('[data-qr-status]')).toContainText('Saved on this device', { timeout: 5000 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-qr-field="text"]')).toHaveValue('یہ ڈیزائن اسی آلے پر محفوظ ہے۔');
});

test('purpose page presents clear editor paths and localizes its content', async ({ page, isMobile }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/why-write-urdu.html');
  await expect(page.locator('.why-hero h1')).toHaveText('Why write Urdu online?');
  await expect(page.locator('.why-path-card')).toHaveCount(3);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.evaluate(() => localStorage.setItem('write-urdu:locale:v1', 'ur'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.why-hero h1')).toHaveText('آن لائن اردو کیوں لکھیں؟');
  await expect(page.locator('.why-value-card h3').first()).toHaveText('اپنے مانوس الفاظ سے آغاز کریں');
  if (isMobile) await page.locator('.wu-menu-toggle').click();
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.locator('.why-hero h1')).toHaveText('Why write Urdu online?');
});

test('primary page titles share the same visual scale', async ({ page }) => {
  await blockNonVisualServices(page);
  const titleMetrics = [];
  for (const route of ['/index.html', '/urdu-editor.html', '/urdu-keyboard.html', '/urdu-alphabet.html', '/write-urdu-features.html']) {
    await openFile(page, route);
    const title = page.locator('h1.wu-page-title');
    await expect(title).toHaveCount(1);
    const metrics = await title.evaluate(element => {
      const style = getComputedStyle(element);
      return { fontSize: style.fontSize, weight: style.fontWeight };
    });
    titleMetrics.push(metrics);
  }
  expect(new Set(titleMetrics.map(metrics => metrics.fontSize)).size).toBe(1);
  expect(new Set(titleMetrics.map(metrics => metrics.weight)).size).toBe(1);
});

test('language toggle switches the shared shell to Urdu and persists', async ({ page, isMobile }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/index.html');
  await page.evaluate(() => localStorage.removeItem('write-urdu:locale:v1'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  if (isMobile) {
    await expect(page.locator('.wu-primary-nav')).not.toHaveClass(/is-open/);
    await expect(page.locator('[data-wu-language-toggle]')).toBeVisible();
    await expect(page.locator('.wu-primary-nav [data-wu-language-toggle]')).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
  await page.getByRole('button', { name: 'Switch to Urdu' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ur');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.wu-brand strong')).toHaveText('رائٹ اردو');
  await expect(page.locator('.wu-primary-nav a').first()).toHaveText('رائٹ اردو');
  await expect(page.locator('h1')).toHaveText('آن لائن اردو لکھیں');
  await expect(page.getByRole('button', { name: 'متن کاپی کریں' })).toBeVisible();
  await expect(page.locator('#UsageAlert')).toContainText('رومن اردو لکھیں');
  await expect(page.locator('.editor-quick-label')).toHaveText('شامل کریں');
  await expect(page.getByRole('button', { name: 'Switch to English' })).toBeVisible();

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('lang', 'ur');
  await expect(page.locator('h1')).toHaveText('آن لائن اردو لکھیں');
  if (isMobile) await page.locator('.wu-menu-toggle').click();
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('h1')).toHaveText('Write Urdu online');
});

test('documentation and help copy switch back to English cleanly', async ({ page, isMobile }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/index.html');
  await page.evaluate(() => localStorage.setItem('write-urdu:locale:v1', 'ur'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#UsageAlert')).toContainText('رومن اردو لکھیں');

  await openFile(page, '/write-urdu-documentation.html');
  await expect(page.locator('#paths-title')).toHaveText('اپنا لکھنے کا طریقہ منتخب کریں');
  await expect(page.locator('.docs-faq summary').first()).toHaveText('سب سے پہلے کون سا ایڈیٹر استعمال کروں؟');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.locator('#paths-title')).toHaveText('Choose your writing path');
  await expect(page.locator('.docs-faq summary').first()).toHaveText('Which editor should I use first?');
});

test('localized formatting guidance preserves screenshots and links', async ({ page, isMobile }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/urdu-editor-features.html');
  await page.evaluate(() => localStorage.setItem('write-urdu:locale:v1', 'ur'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.content-article h2').first()).toHaveText('۱۔ متن کا رنگ تبدیل کریں');
  const imageCount = await page.locator('.content-article img').count();
  expect(imageCount).toBeGreaterThan(0);
  await expect(page.locator('.content-article img').first()).toHaveAttribute('alt', 'رائٹ اردو کے موجودہ رچ ٹیکسٹ ایڈیٹر کا ٹول بار');
  if (isMobile) await page.locator('.wu-menu-toggle').click();
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.locator('.content-article h2').first()).toHaveText('1. Change the text colour');
  await expect(page.locator('.content-article img')).toHaveCount(imageCount);
});

test('privacy copy is available in Urdu without changing the legal structure', async ({ page, isMobile }) => {
  await blockNonVisualServices(page);
  await openFile(page, '/write-urdu-privacy.html');
  await page.evaluate(() => localStorage.setItem('write-urdu:locale:v1', 'ur'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.legal-copy h3').first()).toHaveText('۱۔ شرائط');
  await expect(page.locator('.legal-copy h2')).toHaveText('رازداری کی پالیسی');
  await expect(page.locator('.legal-copy > ul > li').first()).toContainText('قانونی اور منصفانہ');
  if (isMobile) await page.locator('.wu-menu-toggle').click();
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.locator('.legal-copy h3').first()).toHaveText('1. Terms');
});

test('export rendering adds Urdu-safe margins and paginates long PDFs', async ({ page, isMobile }) => {
  test.skip(isMobile, 'One desktop check covers the shared export pipeline');
  await blockNonVisualServices(page);
  await openFile(page, '/index.html');
  const result = await page.evaluate(async () => {
    const source = document.getElementById('transliterateTextarea');
    source.value = 'یہ پہلی سطر ہے\nیہ دوسری سطر ہے <محفوظ>';
    const originalStyle = source.getAttribute('style');
    window.html2canvas = async (surface, options) => {
      const content = surface.firstElementChild;
      const credit = surface.lastElementChild;
      window.__exportCapture = {
        paddingTop: parseFloat(getComputedStyle(surface).paddingTop),
        direction: content.dir,
        language: content.lang,
        text: content.textContent,
        credit: credit.textContent,
        creditLogo: credit.querySelector('img')?.getAttribute('src') || '',
        background: getComputedStyle(surface).backgroundColor,
        color: getComputedStyle(surface).color,
        fontSize: parseFloat(getComputedStyle(surface).fontSize),
        captureHeight: options.height,
        surfaceHeight: surface.scrollHeight
      };
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 3200;
      return canvas;
    };

    const canvas = await WriteUrduExport.renderCanvas(source);
    const basicCapture = { ...window.__exportCapture };
    const richSource = document.createElement('div');
    richSource.style.cssText = 'color:white;background:black;font-size:12px';
    richSource.innerHTML = '<p>رچ ٹیکسٹ برآمد</p>';
    document.body.appendChild(richSource);
    await WriteUrduExport.renderCanvas(richSource, { richText: true });
    const richCapture = { ...window.__exportCapture };
    richSource.remove();
    let wordBlob;
    let wordFilename = '';
    URL.createObjectURL = blob => { wordBlob = blob; return 'blob:word-test'; };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = function () { wordFilename = this.download; };
    WriteUrduExport.downloadWord(source, 'My:Urdu/File', false);
    const wordMarkup = await wordBlob.text();
    const pdfCalls = { images: 0, pages: 1, savedAs: '' };
    window.jspdf = {
      jsPDF: function () {
        return {
          internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
          addPage: () => { pdfCalls.pages += 1; },
          addImage: () => { pdfCalls.images += 1; },
          setFontSize: () => {},
          setTextColor: () => {},
          text: () => {},
          save: name => { pdfCalls.savedAs = name; }
        };
      }
    };
    await WriteUrduExport.downloadPdf(canvas, 'My:Urdu/File');
    return {
      capture: basicCapture,
      richCapture,
      word: {
        filename: wordFilename,
        hasRtlMetadata: wordMarkup.includes('lang="ur" dir="rtl"'),
        escapedPlainText: wordMarkup.includes('&lt;محفوظ&gt;'),
        hasUtf8Metadata: wordMarkup.includes('charset="utf-8"')
      },
      pdfCalls,
      sourceStyleUnchanged: source.getAttribute('style') === originalStyle,
      surfacesRemaining: document.querySelectorAll('.wu-export-surface').length
    };
  });

  expect(result.capture.paddingTop).toBeGreaterThanOrEqual(48);
  expect(result.capture.direction).toBe('rtl');
  expect(result.capture.language).toBe('ur');
  expect(result.capture.text).toContain('یہ پہلی سطر ہے');
  expect(result.capture.credit).toContain('Write-Urdu.com');
  expect(result.capture.creditLogo).toContain('/image/logo10.png');
  expect(result.capture.captureHeight).toBe(result.capture.surfaceHeight);
  expect(result.richCapture.background).toBe('rgb(255, 255, 255)');
  expect(result.richCapture.color).toBe('rgb(22, 37, 30)');
  expect(result.richCapture.fontSize).toBeGreaterThanOrEqual(22);
  expect(result.word.filename).toBe('My-Urdu-File.doc');
  expect(result.word.hasRtlMetadata).toBe(true);
  expect(result.word.escapedPlainText).toBe(true);
  expect(result.word.hasUtf8Metadata).toBe(true);
  expect(result.pdfCalls.pages).toBeGreaterThan(1);
  expect(result.pdfCalls.images).toBe(result.pdfCalls.pages);
  expect(result.pdfCalls.savedAs).toBe('My-Urdu-File.pdf');
  expect(result.sourceStyleUnchanged).toBe(true);
  expect(result.surfacesRemaining).toBe(0);
});

test('editor workspaces remain horizontally centered', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Desktop centering regression');
  await blockNonVisualServices(page);
  for (const route of ['/index.html', '/urdu-editor.html', '/urdu-keyboard.html']) {
    await openFile(page, route);
    const workspace = page.locator('body > .container-fluid > .row:nth-of-type(2)');
    const box = await workspace.boundingBox();
    const viewport = page.viewportSize();
    expect(box, `${route} workspace was not rendered`).not.toBeNull();
    const expectedX = (viewport.width - box.width) / 2;
    expect(Math.abs(box.x - expectedX), `${route} workspace is not centered`).toBeLessThanOrEqual(2);
  }
});
