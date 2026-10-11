const { test, expect } = require('@playwright/test');

const TEXT = 'اردو لکھنا آسان ہے\nدوسری سطر';

async function open(page, path) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());
  await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => Boolean(window.WriteUrduExport && window.WriteUrduExport.printDocument), null, { timeout: 15000 });
}

// Headless print is a no-op, so inspect the frame the print route builds.
const printFrame = page => page.evaluate(() => {
  const frame = document.querySelector('[data-wu-print-frame]');
  if (!frame) return null;
  const doc = frame.contentDocument;
  const body = doc.querySelector('.wu-print-body');
  return { dir: doc.documentElement.dir, lang: doc.documentElement.lang, text: body.innerText, font: getComputedStyle(doc.body).fontFamily, credit: Boolean(doc.querySelector('footer')), images: doc.images.length };
});

test('the Basic Writer offers a print-quality PDF next to the direct PDF download', async ({ page }) => {
  await open(page, '/');
  const editor = page.locator('#transliterateTextarea');
  await editor.fill(TEXT);
  await editor.dispatchEvent('input');
  await page.locator('[data-wu-basic-download-toggle]').first().click();
  const direct = page.locator('#exportPdf');
  const printed = page.locator('#exportPdfPrint');
  await expect(direct).toBeVisible();
  await expect(printed).toBeVisible();
  await printed.click();
  await expect.poll(() => printFrame(page), { timeout: 10000 }).not.toBeNull();
  const frame = await printFrame(page);
  expect(frame.dir).toBe('rtl');
  expect(frame.lang).toBe('ur');
  expect(frame.text).toContain('اردو لکھنا آسان ہے');
  expect(frame.text).toContain('دوسری سطر');
  expect(frame.font).toContain('Noto Nastaliq Urdu');
  expect(frame.images, 'the print route lays out real text, not a picture of it').toBe(0);
  expect(frame.credit).toBe(true);
});

test('the Rich Editor print-quality PDF keeps formatting as real text', async ({ page }) => {
  await open(page, '/urdu-editor');
  await expect(page.locator('#exportPdfPrint')).toHaveCount(1);
  const html = await page.evaluate(async () => {
    const host = document.createElement('div');
    host.innerHTML = '<p>سلام <strong>دنیا</strong></p>';
    await window.WriteUrduExport.printDocument(host, { richText: true });
    const frame = document.querySelector('[data-wu-print-frame]');
    return frame.contentDocument.querySelector('.wu-print-body').innerHTML;
  });
  expect(html).toContain('<strong>دنیا</strong>');
});
