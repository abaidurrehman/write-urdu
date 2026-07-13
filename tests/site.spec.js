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
  for (const route of ['/write-urdu-features.html', '/write-urdu-documentation.html', '/urdu-alphabet.html', '/urdu-faq.html', '/write-urdu-privacy.html']) {
    await openFile(page, route);
    await expect(page.locator('body')).toHaveClass(/content-page/);
    await expect(page.locator('.wu-footer-links a')).toHaveCount(11);
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
    WriteUrduExport.downloadPdf(canvas, 'My:Urdu/File');
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
