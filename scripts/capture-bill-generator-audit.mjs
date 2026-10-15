import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'docs', 'audits', 'urdu-bill-generator-2');
const pdfOutput = path.join(root, 'output', 'pdf');
const baseURL = process.env.BILL_AUDIT_URL || 'http://127.0.0.1:8765';
const browser = await chromium.launch();

async function fillBill(page) {
  await page.goto(`${baseURL}/urdu-bill-generator`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-field="business.name"]').fill('رحمان کریانہ اسٹور');
  await page.locator('[data-field="customer.name"]').fill('احمد خان');
  await page.locator('[data-item-field="description"]').fill('چینی');
  await page.locator('[data-item-field="quantity"]').fill('2');
  await page.locator('[data-item-field="unit"]').selectOption('kg');
  await page.locator('[data-item-field="rate"]').fill('250');
  await page.locator('[data-bill-add-item]').click();
  await page.locator('[data-item-field="description"]').nth(1).fill('چاول');
  await page.locator('[data-item-field="quantity"]').nth(1).fill('3');
  await page.locator('[data-item-field="unit"]').nth(1).selectOption('kg');
  await page.locator('[data-item-field="rate"]').nth(1).fill('100');
  await page.locator('[data-field="discount"]').fill('50');
  await page.locator('[data-field="amountPaid"]').fill('400');
}

const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await fillBill(desktop);
await desktop.locator('.bill-design-panel > summary').click();
await desktop.locator('[data-template-option="modern"]').click();
await desktop.screenshot({ path: path.join(output, 'after-desktop.png'), fullPage: true });
fs.mkdirSync(pdfOutput, { recursive: true });
await desktop.emulateMedia({ media: 'print' });
await desktop.pdf({
  path: path.join(pdfOutput, 'urdu-bill-generator-a4.pdf'),
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true
});
await desktop.emulateMedia({ media: 'screen' });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await fillBill(mobile);
await mobile.locator('[data-bill-mobile-preview]').click();
await mobile.screenshot({ path: path.join(output, 'after-mobile-preview.png') });

await browser.close();
