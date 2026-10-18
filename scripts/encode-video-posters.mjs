// Encodes each published assets/videos/*-poster.png as a lighter *-poster.webp.
// Browsers download a <video> poster eagerly even with preload="none", so the
// 316–468 KB PNG posters competed with first paint on slow connections.
// The PNGs stay published for existing links; pages reference the WebP.
//
// Usage: node scripts/encode-video-posters.mjs [--check]
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'assets', 'videos');
const WIDTH = 1280;
const HEIGHT = 720;
const QUALITY = 0.8;
const check = process.argv.includes('--check');

const posters = readdirSync(directory).filter((name) => name.endsWith('-poster.png'));
if (check) {
  const missing = posters.filter((name) => !existsSync(path.join(directory, name.replace(/\.png$/, '.webp'))));
  if (missing.length) {
    console.error('Missing WebP posters for: ' + missing.join(', ') + '. Run node scripts/encode-video-posters.mjs');
    process.exit(1);
  }
  console.log(`All ${posters.length} video posters have WebP versions.`);
  process.exit(0);
}

const browser = await chromium.launch();
const page = await browser.newPage();
for (const name of posters) {
  const source = 'data:image/png;base64,' + readFileSync(path.join(directory, name)).toString('base64');
  const encoded = await page.evaluate(async ({ source, width, height, quality }) => {
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/webp', quality);
  }, { source, width: WIDTH, height: HEIGHT, quality: QUALITY });
  if (!encoded.startsWith('data:image/webp;base64,')) throw new Error('This browser could not encode WebP for ' + name);
  const output = name.replace(/\.png$/, '.webp');
  const bytes = Buffer.from(encoded.slice(encoded.indexOf(',') + 1), 'base64');
  writeFileSync(path.join(directory, output), bytes);
  console.log(`${output}: ${Math.round(bytes.length / 1024)} KB (from ${Math.round(readFileSync(path.join(directory, name)).length / 1024)} KB PNG)`);
}
await browser.close();
