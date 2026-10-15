const { test, expect } = require('@playwright/test');

const blockExternal = page => page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, route => route.abort());

async function openClean(page) {
  await blockExternal(page);
  await page.goto('/urdu-bill-generator', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-item-field="description"]')).toHaveCount(1);
}

async function visibleShare(page) {
  return page.locator('[data-bill-share]:visible, [data-bill-mobile-share]:visible').first();
}

async function openMobilePreview(page) {
  if ((page.viewportSize()?.width || 0) <= 900) {
    await page.locator('[data-bill-mobile-preview]').click();
  }
}

async function closeMobilePreview(page) {
  if ((page.viewportSize()?.width || 0) <= 900) {
    await page.locator('[data-bill-preview-close]').click();
  }
}

test('quick retail bill calculates subtotal, discount, paid and balance', async ({ page }) => {
  await openClean(page);
  await page.locator('[data-field="business.name"]').fill('Rehman Kiryana');
  await page.locator('[data-item-field="description"]').fill('Sugar');
  await page.locator('[data-item-field="quantity"]').fill('2');
  await page.locator('[data-item-field="unit"]').selectOption('kg');
  await page.locator('[data-item-field="rate"]').fill('250');
  await page.locator('[data-bill-add-item]').click();
  await page.locator('[data-item-field="description"]').nth(1).fill('Rice');
  await page.locator('[data-item-field="quantity"]').nth(1).fill('3');
  await page.locator('[data-item-field="unit"]').nth(1).selectOption('kg');
  await page.locator('[data-item-field="rate"]').nth(1).fill('100');
  await page.locator('[data-field="discount"]').fill('50');
  await page.locator('[data-field="amountPaid"]').fill('400');

  const totals = page.locator('[data-bill-preview] .bill-totals');
  await expect(totals).toContainText('PKR 800.00');
  await expect(totals).toContainText('PKR 750.00');
  await expect(totals).toContainText('PKR 400.00');
  await expect(totals).toContainText('PKR 350.00');
  await expect(page.locator('[data-bill-preview]')).toContainText('2 kg');
});

test('Cash Memo and Payment Receipt have distinct state and previews', async ({ page }) => {
  await openClean(page);
  await page.locator('[data-field="business.name"]').fill('City Store');
  await page.locator('[data-item-field="description"]').fill('Notebook');
  await page.locator('[data-item-field="rate"]').fill('450');
  await page.locator('[data-document-type="cash-memo"]').click();
  await expect(page.locator('[data-bill-preview]')).toContainText('Cash Memo');
  await expect(page.locator('[data-field="amountPaid"]')).toHaveValue('450.00');
  await openMobilePreview(page);
  await expect(page.locator('[data-bill-preview] .bill-state-paid')).toBeVisible();
  await closeMobilePreview(page);

  await page.locator('[data-document-type="receipt"]').click();
  await expect(page.locator('[data-billlike-fields]')).toBeHidden();
  await expect(page.locator('[data-receipt-fields]')).toBeVisible();
  await page.locator('[data-field="receivedFrom.name"]').fill('Ahmed');
  await page.locator('[data-field="amountReceived"]').fill('500');
  await page.locator('[data-field="purpose"]').fill('Stitching advance');
  await expect(page.locator('[data-bill-preview]')).toContainText('Payment Receipt');
  await expect(page.locator('[data-bill-preview]')).toContainText('Stitching advance');
  await expect(page.locator('[data-bill-preview] .bill-items-table')).toHaveCount(0);
});

test('design choice and print size update the same live preview', async ({ page }) => {
  await openClean(page);
  await page.locator('.bill-design-panel > summary').click();
  await page.locator('[data-template-option="modern"]').click();
  await expect(page.locator('[data-bill-preview]')).toHaveAttribute('data-template', 'modern');
  await expect(page.locator('[data-bill-preview-name]')).toContainText('Modern Retail');
  await page.locator('[data-template-option="thermal"]').click();
  await expect(page.locator('[data-bill-preview]')).toHaveAttribute('data-template', 'thermal');
  await expect(page.locator('[data-bill-preview]')).toHaveAttribute('data-print-size', '80mm');
  await expect(page.locator('[data-preference="printSize"]')).toHaveValue('80mm');
});

test('invalid input blocks export and keeps the document editable', async ({ page }) => {
  await openClean(page);
  await page.locator('[data-item-field="quantity"]').fill('0');
  await page.locator('[data-item-field="rate"]').fill('-1');
  await (await visibleShare(page)).click();
  await expect(page.locator('[data-bill-validation]')).toBeVisible();
  await expect(page.locator('[data-bill-validation]')).toContainText('shop or business name');
  await expect(page.locator('[data-bill-validation]')).toContainText('Quantity must be greater than zero');
  await expect(page.locator('[data-field="business.name"]')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('[data-item-field="description"]')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('[data-item-field="rate"]')).toHaveValue('-1');
});

test('share downloads a local PDF fallback without putting bill content in a URL', async ({ page }) => {
  await openClean(page);
  await page.locator('[data-field="business.name"]').fill('Private Shop');
  await page.locator('[data-item-field="description"]').fill('Private item');
  await page.locator('[data-item-field="rate"]').fill('100');
  await page.evaluate(() => {
    navigator.share = undefined;
    navigator.canShare = undefined;
    window.html2canvas = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400; canvas.height = 600;
      canvas.getContext('2d').fillRect(0, 0, 400, 600);
      return canvas;
    };
    window.jspdf = { jsPDF: function () {
      this.addImage = () => {};
      this.addPage = () => {};
      this.output = () => new Blob(['local-pdf'], { type: 'application/pdf' });
    } };
  });
  const download = page.waitForEvent('download');
  await (await visibleShare(page)).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^bill-.*\.pdf$/i);
  await expect(page.locator('[data-bill-share-fallback]')).toBeVisible();
  expect(page.url()).not.toContain('Private');
});

test('new document keeps profile and clears customer-specific data', async ({ page }) => {
  await openClean(page);
  await page.locator('[data-field="business.name"]').fill('Daily Shop');
  await page.locator('[data-field="customer.name"]').fill('Customer One');
  await page.locator('[data-item-field="description"]').fill('First sale');
  page.once('dialog', dialog => dialog.accept());
  await page.locator('[data-bill-new]').click();
  await expect(page.locator('[data-field="business.name"]')).toHaveValue('Daily Shop');
  await expect(page.locator('[data-field="customer.name"]')).toHaveValue('');
  await expect(page.locator('[data-item-field="description"]')).toHaveValue('');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-field="business.name"]')).toHaveValue('Daily Shop');
  await expect(page.locator('[data-field="customer.name"]')).toHaveValue('');
});

test('320, 360 and 390px layouts keep actions usable without horizontal overflow', async ({ page }) => {
  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: 760 });
    await openClean(page);
    const metrics = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth
    }));
    expect(metrics.document, `${width}px document width`).toBeLessThanOrEqual(metrics.viewport);
    for (const selector of ['[data-bill-mobile-preview]', '[data-bill-mobile-share]']) {
      const box = await page.locator(selector).boundingBox();
      expect(box?.height, `${selector} at ${width}px`).toBeGreaterThanOrEqual(44);
    }
    await page.locator('[data-bill-mobile-preview]').click();
    await expect(page.locator('[data-bill-preview-workspace]')).toBeVisible();
    await page.locator('[data-bill-preview-close]').click();
  }
});
