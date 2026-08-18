const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function open(page, route) {
  await blockExternalServices(page);
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached' });
}

test('core writing surfaces expose Create & Share as a primary toolbar and next-step action', async ({ page }) => {
  for (const route of ['/', '/urdu-editor.html', '/urdu-keyboard.html']) {
    await open(page, route);

    const toolbarShare = page.locator('.wu-authoring-share-primary').first();
    await expect(toolbarShare).toBeVisible({ timeout: 10000 });
    await expect(toolbarShare).toContainText('Create & Share');
    await expect(page.locator('[data-write-urdu-share]').first()).toContainText('Share text only');

    const panel = page.locator('[data-wu-journey-panel]');
    await expect(panel).toBeVisible({ timeout: 10000 });
    await expect(panel.locator('[data-continue-rich]')).toHaveCount(route.includes('urdu-editor') ? 0 : 1);
    const shareAction = panel.locator('[data-create-card]');
    await expect(shareAction).toHaveCount(1);
    await expect(shareAction).toContainText('Create & share this Urdu');
    await expect(shareAction).toHaveClass(/is-primary/);
    await expect(shareAction).toHaveClass(/is-share/);
    const qrAction = panel.locator('[data-create-qr]');
    await expect(qrAction).toHaveCount(1, { timeout: 10000 });
    await expect(qrAction).toContainText('Make a QR code');
    await expect(panel.locator('[data-create-stylish]')).toHaveCount(1);
    await expect(panel.locator('[data-create-name-art]')).toHaveCount(1);
    await expect(panel.locator('[data-wu-journey="write-to-templates"]')).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test('Create & Share carries current Urdu into Card Studio and exposes Publish & Share in Step 4', async ({ page }) => {
  await open(page, '/');
  await page.locator('#transliterateTextarea').fill('یہ میرا شیئر کرنے والا اردو متن ہے');
  await page.locator('.wu-authoring-share-primary').first().click();
  await page.waitForURL(/urdu-card-studio/, { timeout: 10000 });
  await expect(page.locator('#cardText')).toHaveValue('یہ میرا شیئر کرنے والا اردو متن ہے', { timeout: 10000 });
  await page.locator('button[data-card-step="export"]').first().click();
  const publish = page.locator('[data-wu-share-step-publish]');
  await expect(publish).toBeVisible({ timeout: 10000 });
  await expect(publish).toContainText('Publish & Share');
  await expect(publish).toContainText('Create a public Write-Urdu.com link');
  await expect(page.locator('.card-studio-export-section [data-card-action="download"]')).toContainText('Download PNG');
  await expect(page.locator('.card-studio-export-section [data-card-action="share"]')).toContainText('Share image only');
});

test('homepage assignment continues into Rich Editor without losing an older rich draft', async ({ page }) => {
  await open(page, '/');
  await page.evaluate(() => {
    localStorage.setItem('write-urdu:draft:v1:rich', JSON.stringify({
      content: '<p>پرانا محفوظ مسودہ</p>',
      text: 'پرانا محفوظ مسودہ',
      savedAt: Date.now() - 10000
    }));
  });
  await page.locator('#transliterateTextarea').fill('میرا اردو اسائنمنٹ تیار ہے');
  await page.waitForFunction(() => Boolean(window.WriteUrduCoreContinuity));
  await page.locator('.home-actions-group-create a[href="/urdu-editor"]').first().click();
  await page.waitForURL(/urdu-editor/, { timeout: 10000 });

  const richBody = page.frameLocator('#basic-example_ifr').locator('body');
  await expect(richBody).toContainText('میرا اردو اسائنمنٹ تیار ہے', { timeout: 10000 });
  await expect(page.locator('body')).toHaveAttribute('data-rich-handoff-imported', 'true');
  expect(await page.evaluate(() => sessionStorage.getItem('writeUrdu.richEditor.incoming.v1'))).toBeNull();

  const storage = await page.evaluate(() => ({
    current: JSON.parse(localStorage.getItem('write-urdu:draft:v1:rich') || 'null'),
    history: JSON.parse(localStorage.getItem('write-urdu:history:v1:rich') || '[]')
  }));
  expect(storage.current.text).toBe('میرا اردو اسائنمنٹ تیار ہے');
  expect(storage.history.some(item => item.text === 'پرانا محفوظ مسودہ')).toBe(true);
  expect(page.url()).not.toContain('اسائنمنٹ');
});

test('selected homepage text becomes a QR while the full Basic draft remains saved', async ({ page }) => {
  await open(page, '/');
  const fullText = 'پہلا حصہ اور دوسرا حصہ';
  const selectedText = 'دوسرا حصہ';
  await page.locator('#transliterateTextarea').fill(fullText);
  await page.waitForFunction(() => Boolean(window.WriteUrduCoreContinuity));
  await page.locator('#transliterateTextarea').evaluate((element, selected) => {
    const start = element.value.indexOf(selected);
    element.focus();
    element.setSelectionRange(start, start + selected.length);
  }, selectedText);
  const qrAction = page.locator('[data-wu-journey-panel] [data-create-qr]');
  await expect(qrAction).toBeVisible({ timeout: 10000 });
  await qrAction.click();
  await page.waitForURL(/qr-code-generator/, { timeout: 10000 });
  await expect(page.locator('[data-qr-field="text"]')).toHaveValue(selectedText, { timeout: 10000 });
  const basicDraft = await page.evaluate(() => JSON.parse(localStorage.getItem('write-urdu:draft:v1:basic') || 'null'));
  expect(basicDraft.text).toBe(fullText);
  expect(page.url()).not.toContain(encodeURIComponent(selectedText));
});

test('Urdu Keyboard can continue directly to a QR code without copy and paste', async ({ page }) => {
  await open(page, '/urdu-keyboard.html');
  await page.waitForFunction(() => Boolean(window.WriteUrduCoreContinuity));
  await page.locator('#write').fill('کی بورڈ سے لکھا ہوا متن');
  const qrAction = page.locator('.keyboard-actions [data-create-qr]');
  await expect(qrAction).toBeVisible({ timeout: 10000 });
  await qrAction.click();
  await page.waitForURL(/qr-code-generator/, { timeout: 10000 });
  await expect(page.locator('[data-qr-field="text"]')).toHaveValue('کی بورڈ سے لکھا ہوا متن', { timeout: 10000 });
  expect(page.url()).not.toContain('کی');
});

test('Cleaner can continue writing without destroying an older Basic draft', async ({ page }) => {
  await open(page, '/urdu-text-cleaner.html');
  await page.evaluate(() => {
    localStorage.setItem('write-urdu:draft:v1:basic', JSON.stringify({
      content: 'پرانا بنیادی مسودہ',
      text: 'پرانا بنیادی مسودہ',
      savedAt: Date.now() - 10000
    }));
  });
  await page.locator('#cleanerSource').fill('یہ صاف اردو متن ہے');
  await page.locator('[data-cleaner-analyze]').click();
  await page.waitForFunction(() => Boolean(window.WriteUrduCoreContinuity));
  await expect(page.locator('[data-cleaner-continuity-actions]')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('[data-cleaner-continuity-actions] [data-wu-continuity-target="rich-editor"]')).toContainText('Format as a document');
  await expect(page.locator('[data-cleaner-continuity-actions] [data-wu-continuity-target="card-studio"]')).toContainText('Create a card');
  await expect(page.locator('[data-cleaner-continuity-actions] [data-wu-continuity-target="qr-generator"]')).toContainText('Make a QR code');
  await page.locator('[data-cleaner-handoff]').click();
  await page.waitForURL(url => url.pathname === '/', { timeout: 10000 });
  await expect(page.locator('#transliterateTextarea')).toHaveValue('یہ صاف اردو متن ہے', { timeout: 10000 });
  const history = await page.evaluate(() => JSON.parse(localStorage.getItem('write-urdu:history:v1:basic') || '[]'));
  expect(history.some(item => item.text === 'پرانا بنیادی مسودہ')).toBe(true);
});

test('homepage text is carried locally into Stylish Urdu and consumed once', async ({ page }) => {
  await open(page, '/');
  await page.locator('#transliterateTextarea').fill('میرا خوب صورت نام');
  await page.locator('[data-wu-journey-panel] [data-create-stylish]').click();
  await page.waitForURL(/stylish-urdu-text-generator/, { timeout: 10000 });
  await expect(page.locator('#stylishText')).toHaveValue('میرا خوب صورت نام', { timeout: 10000 });
  await expect(page.locator('[data-stylish-status]')).toContainText('ready to style');
  expect(await page.evaluate(() => sessionStorage.getItem('writeUrdu.stylishText.incoming.v1'))).toBeNull();
  expect(page.url()).not.toContain('میرا');
});

test('keyboard text is carried locally into direct Name Art without entering the URL', async ({ page }) => {
  await open(page, '/urdu-keyboard.html');
  await page.locator('#write').fill('میرا نام');
  await page.locator('[data-wu-journey-panel] [data-create-name-art]').click();
  await page.waitForURL(/urdu-name-art-maker/, { timeout: 10000 });
  await expect(page.locator('[data-name-art-status]')).toContainText('ready', { timeout: 10000 });
  await expect(page.locator('#nameArtText')).toHaveValue('میرا نام', { timeout: 10000 });
  await expect(page.locator('.name-art-workspace iframe')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => {
    const app = window.WriteUrduNameArtApp && window.WriteUrduNameArtApp.getWorkspaceApp();
    return app && app.getState().text.value;
  })).toBe('میرا نام');
  expect(await page.evaluate(() => sessionStorage.getItem('writeUrdu.nameArt.handoff.v1'))).toBeNull();
  expect(page.url()).not.toContain('میرا');
});