const { test, expect } = require('@playwright/test');
const open = (page, route) => page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
const blockNonVisualServices = page => page.route(/google_jsapi\.js|google-analytics|googletagmanager|googlesyndication|facebook\.net|twitter\.com|google\.com\/uds|fonts\.googleapis|fonts\.gstatic/, route => route.abort());

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
  }
});
