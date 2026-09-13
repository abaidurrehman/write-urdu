import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';

const [sourceDir, outputDir] = process.argv.slice(2);
if (!sourceDir || !outputDir) {
  throw new Error('Usage: node scripts/optimize-card-studio-backgrounds.mjs <source-dir> <output-dir>');
}

const files = (await fs.readdir(sourceDir)).filter((file) => /\.(png|jpe?g|webp)$/i.test(file));
if (!files.length) throw new Error(`No source images found in ${sourceDir}`);

await fs.mkdir(path.join(outputDir, 'thumbs'), { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

async function renderWebp(source, width, height, quality) {
  const data = await fs.readFile(source);
  const mime = path.extname(source).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
  const encoded = data.toString('base64');
  const result = await page.evaluate(async ({ encoded, mime, width, height, quality }) => {
    const image = new Image();
    image.src = `data:${mime};base64,${encoded}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    if (!blob) throw new Error('WebP encoding failed');
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  }, { encoded, mime, width, height, quality });
  return Buffer.from(result);
}

try {
  for (const file of files) {
    const id = path.basename(file, path.extname(file));
    const source = path.join(sourceDir, file);
    await fs.writeFile(path.join(outputDir, `${id}.webp`), await renderWebp(source, 1080, 1350, 0.86));
    await fs.writeFile(path.join(outputDir, 'thumbs', `${id}.webp`), await renderWebp(source, 320, 400, 0.74));
  }
} finally {
  await browser.close();
}

console.log(`Optimized ${files.length} Card Studio backgrounds and thumbnails.`);
