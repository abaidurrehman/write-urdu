import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const baseURL = process.env.CARD_STUDIO_QA_URL || 'http://127.0.0.1:8765';
const outputDir = path.resolve(process.argv[2] || '.qa-card-studio-backgrounds');
const backgrounds = [
  ['ajrak-heritage', 'Ajrak Heritage', 'اجرک ورثہ'],
  ['truck-art-bloom', 'Truck Art Bloom', 'ٹرک آرٹ بہار'],
  ['peacock-festival', 'Peacock Festival', 'مور رنگ میلہ'],
  ['ink-wash-poetry', 'Ink Wash Poetry', 'روشنائی کی شاعری'],
  ['moon-paper', 'Moon Paper', 'مہتابی ورق'],
  ['old-lahore-journal', 'Old Lahore Journal', 'پرانا لاہور'],
  ['moonlit-lakeside', 'Moonlit Lakeside', 'چاندنی جھیل'],
  ['lantern-sunrise', 'Lantern Sunrise', 'چراغوں کی صبح'],
  ['pastel-glass', 'Pastel Glass', 'نرم شفاف رنگ'],
  ['black-gold-classic', 'Black Gold Classic', 'سیاہ و سنہری وقار'],
  ['maroon-wedding', 'Maroon Wedding', 'عنابی شادی'],
  ['regal-gold-arabesque', 'Regal Gold Arabesque', 'شاہانہ سنہری نقش']
];
const samples = [
  ['Short · 1 line', 'الحمدللہ'],
  ['Medium · 4 lines', 'لفظ دل سے نکلیں\nتو اثر رکھتے ہیں\nخاموش لمحے بھی\nایک خبر رکھتے ہیں'],
  ['Long · 8 lines', 'دل کی دنیا میں\nروشنی باقی رہے\nہر نئی صبح میں\nتازگی باقی رہے\nدوریاں کم ہوں\nدوستی باقی رہے\nزندگی کے سفر میں\nسادگی باقی رہے']
];
const presets = [
  ['square', 'Square · 1080×1080'],
  ['landscape', 'Landscape · 1280×720'],
  ['facebook', 'Wide · 1200×630'],
  ['portrait', 'Portrait · 1080×1350'],
  ['story', 'Story · 1080×1920']
];

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());
const matrixFiles = [];

async function captureAt(viewport) {
  await page.setViewportSize(viewport);
  const captures = [];
  for (const [label, text] of samples) {
    await page.evaluate((value) => window.WriteUrduCardStudioApp.updateObjectText('text', value, { save: false }), text);
    await page.waitForTimeout(120);
    const image = await page.locator('#cardCanvas').screenshot({ type: 'png' });
    captures.push({ label, image: image.toString('base64') });
  }
  return captures;
}

async function capturePresets() {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const captures = [];
  for (const [presetId, label] of presets) {
    await page.evaluate(({ presetId, text }) => {
      const app = window.WriteUrduCardStudioApp;
      const next = window.WriteUrduCardStudio.applyPreset(app.getState(), presetId);
      next.text.value = text;
      app.replaceState(next, { save: false });
    }, { presetId, text: samples[1][1] });
    await page.waitForTimeout(120);
    const image = await page.locator('#cardCanvas').screenshot({ type: 'png' });
    captures.push({ mode: 'Crop safety', label, image: image.toString('base64') });
  }
  return captures;
}

try {
  for (const [id, name, nameUr] of backgrounds) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${baseURL}/urdu-card-studio.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-card-built-in-library]').waitFor();
    await page.locator('.card-studio-step[data-card-step="format"]').click();
    const option = page.locator(`[data-card-built-in-background="${id}"]`);
    await option.click();
    await page.waitForFunction((backgroundId) => document.querySelector(`[data-card-built-in-background="${backgroundId}"]`)?.getAttribute('aria-pressed') === 'true', id);

    const desktop = await captureAt({ width: 1440, height: 1000 });
    const mobile = await captureAt({ width: 390, height: 844 });
    const cropSafety = await capturePresets();
    const panels = [...desktop.map((item) => ({ ...item, mode: 'Desktop' })), ...mobile.map((item) => ({ ...item, mode: 'Mobile' })), ...cropSafety];
    await page.setViewportSize({ width: 1320, height: 1120 });
    await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
      *{box-sizing:border-box}body{margin:0;padding:28px;background:#e8eee9;color:#173e31;font:16px/1.4 "Segoe UI",sans-serif}
      header{display:flex;justify-content:space-between;align-items:end;margin-bottom:18px}h1{font-size:25px;margin:0}.urdu{font-family:serif;direction:rtl}
      .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.panel{background:white;padding:12px;border-radius:14px;box-shadow:0 4px 18px #173e3120}
      .meta{display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;font-weight:700;color:#526b60}.card{display:block;width:100%;height:260px;object-fit:contain;background:#d9e0dc}
    </style></head><body><header><div><h1>${name}</h1><div class="urdu">${nameUr}</div></div><strong>Urdu length · desktop/mobile · all export crops</strong></header><div class="grid">${panels.map((panel) => `<section class="panel"><div class="meta"><span>${panel.mode}</span><span>${panel.label}</span></div><img class="card" src="data:image/png;base64,${panel.image}" alt=""></section>`).join('')}</div></body></html>`);
    const filename = `${id}-qa-matrix.png`;
    await page.screenshot({ path: path.join(outputDir, filename), fullPage: true });
    matrixFiles.push([id, name, nameUr, filename]);
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;padding:28px;background:#edf2ef;color:#173e31;font:16px "Segoe UI",sans-serif}h1{margin:0 0 18px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    a{display:block;padding:12px;background:white;color:inherit;text-decoration:none;border-radius:14px;box-shadow:0 4px 16px #173e311c}img{width:100%;display:block;border-radius:8px}.name{display:flex;justify-content:space-between;gap:8px;margin-top:9px;font-weight:700}.urdu{direction:rtl}
  </style></head><body><h1>Urdu Background Collection QA</h1><div class="grid">${matrixFiles.map(([, name, nameUr, filename]) => `<a href="${filename}"><img src="${filename}" alt=""><span class="name"><span>${name}</span><span class="urdu">${nameUr}</span></span></a>`).join('')}</div></body></html>`);
  const indexPath = path.join(outputDir, 'index.html');
  await fs.writeFile(indexPath, await page.content());
  await page.goto(pathToFileURL(indexPath).href, { waitUntil: 'load' });
  await page.screenshot({ path: path.join(outputDir, 'overview.png'), fullPage: true });
} finally {
  await browser.close();
}

console.log(`Created ${matrixFiles.length} QA matrices in ${outputDir}`);
