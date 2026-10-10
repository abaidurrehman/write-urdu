const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function adFollowsTools(page) {
  return page.evaluate(() => {
    const tools = document.querySelector('.editor-productivity');
    const ad = document.querySelector('[data-wu-write-ad], .wu-header-ad');
    return {
      hasTools: Boolean(tools),
      hasAd: Boolean(ad),
      adAfterTools: Boolean(tools && ad && (tools.compareDocumentPosition(ad) & Node.DOCUMENT_POSITION_FOLLOWING)),
      boundaryIsTools: Boolean(tools && tools.getAttribute('data-wu-ad-boundary') === 'post-workspace')
    };
  });
}

test('the Basic Writer ad never separates the editor from its status, punctuation and recovery tools', async ({ page }) => {
  await blockExternalServices(page);
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect.poll(async () => { const order = await adFollowsTools(page); return order.hasAd && order.hasTools; }, { timeout: 10000 }).toBe(true);
  const order = await adFollowsTools(page);
  expect(order.hasTools).toBe(true);
  expect(order.adAfterTools).toBe(true);
  expect(order.boundaryIsTools).toBe(true);
  expect(await page.locator('#demo').getAttribute('data-wu-ad-boundary')).toBeNull();
});

test('the Rich Editor keeps its ad after the editor tools', async ({ page }) => {
  await blockExternalServices(page);
  await page.goto('/urdu-editor', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect.poll(async () => { const order = await adFollowsTools(page); return order.hasAd && order.hasTools; }, { timeout: 15000 }).toBe(true);
  expect((await adFollowsTools(page)).adAfterTools).toBe(true);
});

test('passage conversion confirms once and retires its button until new English-letter text needs it', async ({ page }) => {
  await blockExternalServices(page);
  await page.route('https://inputtools.google.com/**', route => {
    const text = decodeURIComponent((route.request().url().match(/[?&]text=([^&]+)/) || [])[1] || '');
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(['SUCCESS', [[text, ['مجھے کل سکول جانا ہے']]]]) });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  const editor = page.locator('#transliterateTextarea');
  const panel = page.locator('[data-batch-transliteration]').first();
  const action = panel.locator('[data-batch-action]');

  await editor.fill('mujhe kal school jana hai aur ammi ko batana hai');
  await editor.dispatchEvent('input');
  await expect(action).toBeVisible();
  await action.click();

  await expect(editor).toHaveValue('مجھے کل سکول جانا ہے');
  await expect(action).toBeHidden();
  await expect(panel.locator('[data-batch-prompt]')).toBeHidden();
  await expect(panel.locator('[data-batch-status]')).toHaveText('The passage was converted to Urdu script.');
  await expect(panel.getByText('The passage was converted to Urdu script.', { exact: true })).toHaveCount(1);

  await editor.fill('مجھے کل سکول جانا ہے aur phir hum bazaar jayenge shaam ko');
  await editor.dispatchEvent('input');
  await expect(action).toBeVisible();
  await expect(panel.locator('[data-batch-status]')).toHaveText('');
});
