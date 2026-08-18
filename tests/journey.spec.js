const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function open(page, route) {
  await blockExternalServices(page);
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached' });
}

test('core writing surfaces retire premature header creation and reveal contextual next steps after work exists', async ({ page }) => {
  for (const route of ['/', '/urdu-editor.html', '/urdu-keyboard.html']) {
    await open(page, route);
    await page.waitForFunction(() => Boolean(window.WriteUrduCoreWorkspaceConvergence), null, { timeout: 10000 });

    await expect(page.locator('[data-wu-authoring-share-primary]')).toHaveCount(0);
    if (route === '/') {
      await expect(page.locator('[data-write-urdu-share]')).toHaveCount(0);
      await expect(page.locator('[data-wu-basic-share-action]')).toContainText('Share text only');
    } else {
      await expect(page.locator('[data-write-urdu-share]').first()).toContainText('Share text only');
    }

    await page.waitForFunction(() => Boolean(window.WriteUrduWorkspaceNextStep), null, { timeout: 10000 });
    const panel = page.locator('[data-wu-next-step-version="2"]');
    await expect(panel).toBeAttached();
    await expect(panel).toBeHidden();

    if (route === '/') await page.locator('#transliterateTextarea').fill('یہ تیار اردو متن ہے');
    else if (route.includes('urdu-keyboard')) await page.locator('#write').fill('یہ تیار اردو متن ہے');
    else await page.frameLocator('#basic-example_ifr').locator('body').fill('یہ تیار اردو متن ہے');

    await expect(panel).toBeVisible({ timeout: 10000 });
    const visibleActions = panel.locator('.wu-continue-actions > .wu-continue-action');
    expect(await visibleActions.count()).toBeLessThanOrEqual(3);
    await expect(panel.locator('[data-wu-continuity-target="card-studio"]')).toHaveCount(1);
    await expect(panel.locator('[data-wu-continuity-target="qr-generator"]')).toHaveCount(1);
    await expect(panel.locator('[data-wu-continuity-target="rich-editor"]')).toHaveCount(route.includes('urdu-editor') ? 0 : 1);
    await expect(panel.locator('[data-create-stylish],[data-create-name-art],[data-wu-journey="write-to-templates"]')).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test('contextual Card Studio continuation carries current Urdu and exposes Publish & Share in Step 4', async ({ page }) => {
  await open(page, '/');
  await page.locator('#transliterateTextarea').fill('یہ میرا شیئر کرنے والا اردو متن ہے');
  const cardAction = page.locator('[data-wu-next-step-version="2"] [data-wu-next-step-action="basic-to-card"]');
  await expect(cardAction).toBeVisible({ timeout: 10000 });
  await cardAction.click();
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
  const richAction = page.locator('[data-wu-next-step-version="2"] [data-wu-next-step-action="basic-to-rich"]');
  await expect(richAction).toBeVisible({ timeout: 10000 });
  await richAction.click();
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
  const qrAction = page.locator('[data-wu-next-step-version="2"] [data-wu-next-step-action="basic-to-qr"]');
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

test('Cleaner uses the shared continuation panel and can continue writing without destroying an older Basic draft', async ({ page }) => {
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
  const panel = page.locator('[data-wu-next-step-version="2"]');
  await expect(panel).toBeVisible({ timeout: 10000 });
  await expect(panel.locator('[data-wu-next-step-action="cleaner-to-rich"]')).toContainText('Format this as a document');
  await expect(panel.locator('[data-wu-next-step-action="cleaner-to-card"]')).toContainText('Create a card');
  await expect(page.locator('[data-cleaner-continuity-actions]')).toHaveCount(0);
  await page.locator('[data-cleaner-handoff]').click();
  await page.waitForURL(url => url.pathname === '/', { timeout: 10000 });
  await expect(page.locator('#transliterateTextarea')).toHaveValue('یہ صاف اردو متن ہے', { timeout: 10000 });
  const history = await page.evaluate(() => JSON.parse(localStorage.getItem('write-urdu:history:v1:basic') || '[]'));
  expect(history.some(item => item.text === 'پرانا بنیادی مسودہ')).toBe(true);
});