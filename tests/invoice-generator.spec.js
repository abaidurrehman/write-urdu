const { test, expect } = require('@playwright/test');
const fs = require('fs');
const zlib = require('zlib');

// Export libraries and fonts come from public CDNs; everything else external
// (ads, analytics, transliteration) is blocked to keep runs deterministic.
const ALLOWED = /^https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
const blockExternal = (page) => page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, (route) => (ALLOWED.test(route.request().url()) ? route.continue() : route.abort()));
const isMobile = (page) => (page.viewportSize()?.width || 0) <= 900;

async function openClean(page) {
  await blockExternal(page);
  await page.goto('/urdu-invoice-generator', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-invoice-preview] .inv-page')).toHaveCount(1);
}

async function fillItems(page, rows) {
  for (let i = 0; i < rows.length; i += 1) {
    if (i) await page.locator('[data-invoice-add-item]').click();
    const row = page.locator('[data-invoice-items] .inv-item').nth(i);
    await row.locator('[data-item-field="description"]').fill(rows[i][0]);
    await row.locator('[data-item-field="quantity"]').fill(rows[i][1]);
    await row.locator('[data-item-field="unitPrice"]').fill(rows[i][2]);
  }
}

async function showPreview(page) {
  if (isMobile(page)) await page.locator('[data-view-tab="preview"]').click();
}

async function pdfButton(page) {
  return isMobile(page) ? page.locator('.inv-finish [data-invoice-pdf]') : page.locator('.inv-toolbar [data-invoice-pdf]');
}

function pdfPageCount(file) {
  return (fs.readFileSync(file, 'latin1').match(/\/Type \/Page[^s]/g) || []).length;
}

// Concatenates every decompressed content stream so tests can look for the
// invisible text layer drawn over the page images.
function pdfContent(file) {
  const raw = fs.readFileSync(file);
  const text = raw.toString('latin1');
  const out = [];
  const pattern = /stream\r?\n/g;
  let match;
  while ((match = pattern.exec(text))) {
    const start = match.index + match[0].length;
    const end = text.indexOf('endstream', start);
    if (end < 0) break;
    try { out.push(zlib.inflateSync(raw.subarray(start, end)).toString('latin1')); } catch (error) { /* images and other binary streams */ }
    pattern.lastIndex = end + 'endstream'.length;
  }
  return out.join('\n');
}

test('first visit shows a marked sample that cannot be exported as the user’s invoice', async ({ page }) => {
  await openClean(page);
  await expect(page.locator('[data-invoice-start]')).toBeVisible();
  await showPreview(page);
  await expect(page.locator('[data-invoice-preview]')).toContainText('Ayesha Khan Design Studio');
  if (!isMobile(page)) await expect(page.locator('[data-invoice-sample-badge]')).toBeVisible();
  if (isMobile(page)) await page.locator('[data-view-tab="edit"]').click();
  await (await pdfButton(page)).click();
  await expect(page.locator('[data-invoice-fit-status]')).toContainText('only a sample');
  await expect(page.locator('[data-invoice-start]')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('writeUrdu.invoiceGenerator.draft.v1'))).toBeNull();
});

test('English invoice with three items updates the preview and keeps data across templates', async ({ page }) => {
  await openClean(page);
  await page.locator('[data-invoice-start-own]').click();
  await page.locator('[data-field="seller.name"]').fill('Ayesha Khan Design');
  await page.locator('[data-field="buyer.name"]').fill('Bright Future Academy');
  await fillItems(page, [['Logo design', '1', '45000'], ['Landing page', '1', '60000'], ['Post templates', '6', '2500']]);
  await expect(page.locator('[data-invoice-summary]')).toContainText('PKR 120,000');
  await showPreview(page);
  const preview = page.locator('[data-invoice-preview]');
  await expect(preview).toContainText('Bright Future Academy');
  await expect(preview).toContainText('PKR 120,000');
  for (const template of ['classic-urdu', 'contemporary', 'modern']) {
    await page.locator(`.inv-template-quick [data-template-option="${template}"]`).click();
    await expect(preview.locator('.inv-page')).toHaveClass(new RegExp(`inv-tpl-${template}`));
    await expect(preview).toContainText('Post templates');
  }
});

test('Urdu invoice renders right to left with Urdu labels and LTR numbers', async ({ page }) => {
  await openClean(page);
  await page.locator('[data-lang-option="urdu"]').click();
  await page.locator('[data-invoice-sample]').click();
  await showPreview(page);
  const pageNode = page.locator('[data-invoice-preview] .inv-page').first();
  await expect(pageNode).toHaveAttribute('dir', 'rtl');
  await expect(pageNode).toContainText('کل رقم');
  await expect(pageNode).toContainText('نور ٹیکسٹائل ہاؤس');
  await expect(pageNode.locator('bdi.inv-ltr', { hasText: 'INV-' }).first()).toHaveAttribute('dir', 'ltr');
});

test('English letters turn into Urdu on the device without contacting Google', async ({ page }) => {
  const providerRequests = [];
  page.on('request', (request) => { if (/inputtools|google\.com\/(jsapi|uds|inputtools|transliterate)/.test(request.url())) providerRequests.push(request.url()); });
  await openClean(page);
  await page.locator('[data-lang-option="urdu"]').click();
  await page.locator('[data-invoice-start-own]').click();
  const seller = page.locator('[data-field="seller.name"]');
  await seller.click();
  await page.keyboard.type('noor kapra house ');
  await expect(seller).toHaveValue('نور کپڑا ہاؤس ');
  await page.keyboard.type('Malik ');
  await page.keyboard.press('Backspace');
  await expect(seller).toHaveValue('نور کپڑا ہاؤس Malik', { timeout: 2000 });
  const buyer = page.locator('[data-field="buyer.name"]');
  await buyer.click();
  await page.keyboard.type('ahmed garments');
  await page.locator('[data-field="seller.phone"]').click();
  await expect(buyer).toHaveValue('احمد گارمنٹس');
  await showPreview(page);
  await expect(page.locator('[data-invoice-preview]')).toContainText('احمد گارمنٹس');
  expect(providerRequests).toEqual([]);
});

test('the editor can be shown in Urdu and switched back to English', async ({ page }) => {
  await openClean(page);
  await page.locator('[data-invoice-ui-lang]').click();
  const root = page.locator('[data-invoice-generator]');
  await expect(root).toHaveAttribute('data-ui-lang', 'ur');
  await expect(root).toHaveAttribute('dir', 'rtl');
  await page.locator('[data-invoice-start-own]').click();
  await expect(page.locator('[data-section-card="items"] .inv-section-title')).toContainText('اشیاء اور قیمتیں');
  await expect(page.locator('[data-invoice-add-item]')).toContainText('ایک اور چیز شامل کریں');
  // Every visible editor string has Urdu wording; only names, codes and amounts stay in English letters.
  const leftovers = await page.evaluate(() => {
    const scope = document.querySelector('[data-invoice-generator]'), found = new Set();
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const element = node.parentElement;
      if (element.closest('.inv-page, .inv-thumb-pages, .invoice-about, [data-ui-keep], [data-wu-twin], [hidden], script, style')) continue;
      const value = node.nodeValue.trim();
      if (/[A-Za-z]{3,}/.test(value) && !/[\u0600-ۿ]/.test(value)) found.add(value);
    }
    return [...found];
  });
  expect(leftovers.filter((value) => !/^(PKR [\d,.]+|IBAN|JazzCash|Easypaisa|SadaPay|NayaPay|Document)$/.test(value))).toEqual([]);
  await (await pdfButton(page)).click();
  await expect(page.locator('[data-error-for="buyer.name"]')).toHaveText('گاہک کا نام ضروری ہے۔');
  await page.locator('[data-invoice-ui-lang]').click();
  await expect(root).toHaveAttribute('data-ui-lang', 'en');
  await expect(page.locator('[data-invoice-add-item]')).toContainText('Add another item');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(root).toHaveAttribute('data-ui-lang', 'en');
});

test('discount, tax and partial payment produce the documented totals', async ({ page }) => {
  await openClean(page);
  await page.locator('[data-invoice-start-own]').click();
  await page.locator('[data-field="seller.name"]').fill('Tutor Sana');
  await page.locator('[data-field="buyer.name"]').fill('Ali Parent');
  await fillItems(page, [['Tuition, October', '2', '1000']]);
  await page.locator('[data-more="adjustments"] > summary').click();
  await page.locator('[data-field="discount.mode"]').selectOption('percentage');
  await page.locator('[data-field="discount.value"]').fill('10');
  await page.locator('[data-field="tax.mode"]').selectOption('percentage');
  await page.locator('[data-field="tax.value"]').fill('16');
  await page.locator('[data-field="additionalCharge"]').fill('200');
  await page.locator('[data-field="amountPaid"]').fill('1000');
  await expect(page.locator('[data-field="status"]')).toHaveValue('Partially paid');
  await expect(page.locator('[data-invoice-finish-total]')).toContainText('PKR 1,288');
  await showPreview(page);
  const preview = page.locator('[data-invoice-preview]');
  await expect(preview).toContainText('PKR 2,288');
  await expect(preview).toContainText('Balance due');
});

test('drafts restore after reload and New keeps the business while saving the old invoice', async ({ page }) => {
  await openClean(page);
  await page.locator('[data-invoice-start-own]').click();
  await page.locator('[data-field="seller.name"]').fill('Noor Textile House');
  await page.locator('[data-field="buyer.name"]').fill('Ahmed Garments');
  await fillItems(page, [['Lawn fabric', '4', '6500']]);
  await page.waitForTimeout(700);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-field="buyer.name"]')).toHaveValue('Ahmed Garments');
  await expect(page.locator('[data-invoice-banner]')).toContainText('restored');
  await page.locator('.inv-toolbar [data-invoice-new]').click();
  await page.locator('[data-invoice-confirm-dialog] [data-confirm-ok]').click();
  await expect(page.locator('[data-field="seller.name"]')).toHaveValue('Noor Textile House');
  await expect(page.locator('[data-field="buyer.name"]')).toHaveValue('');
  await expect(page.locator('[data-field="invoiceNumber"]')).toHaveValue(/0002$/);
  await page.locator('[data-invoice-history]').click();
  await expect(page.locator('.inv-history-item')).toHaveCount(2);
});

test('missing customer name blocks export and focuses the field', async ({ page }) => {
  await openClean(page);
  await page.locator('[data-invoice-start-own]').click();
  await page.locator('[data-field="seller.name"]').fill('Shop');
  await fillItems(page, [['Item', '1', '100']]);
  await (await pdfButton(page)).click();
  await expect(page.locator('[data-error-for="buyer.name"]')).toHaveText('Customer name is required.');
  await expect(page.locator('[data-field="buyer.name"]')).toBeFocused();
});

test('long invoices continue onto extra A4 pages and the PDF matches', async ({ page }) => {
  test.setTimeout(120000);
  await openClean(page);
  await page.locator('[data-invoice-start-own]').click();
  await page.locator('[data-field="seller.name"]').fill('Bulk Supplier');
  await page.locator('[data-field="buyer.name"]').fill('Wholesale Customer');
  const rows = Array.from({ length: 24 }, (_, i) => [`Product line ${i + 1} with a longer description that wraps`, '1', String(1000 + i)]);
  await fillItems(page, rows);
  await expect.poll(async () => Number(await page.locator('[data-invoice-generator]').getAttribute('data-page-count'))).toBeGreaterThan(1);
  const pages = Number(await page.locator('[data-invoice-generator]').getAttribute('data-page-count'));
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), (await pdfButton(page)).click()]);
  const file = test.info().outputPath('long.pdf');
  await download.saveAs(file);
  expect(pdfPageCount(file)).toBe(pages);
  const content = pdfContent(file);
  expect(content).toContain('(Wholesale Customer)');
  expect(content).toMatch(/\(INV-\d{4}-\d{4}\)/);
  expect(content).toMatch(/\(Product line 24 with/);
  expect(content).toMatch(/3 Tr/);
  await expect(page.locator('[data-invoice-fit-status]')).toHaveText('PDF downloaded.');
});

test('mobile workspace switches between Edit and Preview without horizontal scrolling', async ({ page }) => {
  test.skip(!isMobile(page), 'mobile layout only');
  await openClean(page);
  await expect(page.locator('[data-invoice-mobile-bar]')).toBeVisible();
  await expect(page.locator('.inv-preview')).toBeHidden();
  await page.locator('[data-mobile-action="preview"]').click();
  await expect(page.locator('.inv-editor')).toBeHidden();
  await expect(page.locator('[data-mobile-pdf]')).toBeVisible();
  const widths = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, view: innerWidth, page: document.querySelector('[data-invoice-preview] .inv-page').getBoundingClientRect().width }));
  expect(widths.doc).toBeLessThanOrEqual(widths.view);
  expect(widths.page).toBeLessThanOrEqual(widths.view);
  expect(widths.page).toBeGreaterThan(widths.view * 0.85);
});
