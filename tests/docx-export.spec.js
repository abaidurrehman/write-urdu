const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

const blockExternal = page => page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$)|localhost)/, route => route.abort());

async function exportWord(page, url) {
  await blockExternal(page);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => window.WriteUrduDocx && window.WriteUrduExport);
  const box = page.locator('#transliterateTextarea');
  if (await box.count()) await box.fill('سلام دنیا');
  const name = page.locator('#inputFileNameToSaveAs');
  if (await name.count()) await name.evaluate(el => { el.value = 'notes'; });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.evaluate(() => document.getElementById('exportWord').click())
  ]);
  return download;
}

for (const [label, url] of [['rich editor', '/urdu-editor'], ['Basic Writer', '/']]) {
  test(`${label} Word export is a real .docx package`, async ({ page }) => {
    const download = await exportWord(page, url);
    expect(download.suggestedFilename()).toMatch(/\.docx$/);
    const file = await download.path();
    const bytes = fs.readFileSync(file);
    expect(bytes.readUInt32LE(0)).toBe(0x04034b50);
    expect(bytes.includes(Buffer.from('word/document.xml'))).toBe(true);
    expect(bytes.includes(Buffer.from('Generated with Write Urdu'))).toBe(true);
  });
}
