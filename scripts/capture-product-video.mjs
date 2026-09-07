import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

import { normalizeVideoStory } from './video-runtime.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const storyId = normalizeVideoStory(process.argv[2]);
const storyPath = path.join(root, 'marketing', 'video', 'stories', `${storyId}.json`);
if (!existsSync(storyPath)) throw new Error(`Video story not found: ${path.relative(root, storyPath)}`);
const story = JSON.parse(readFileSync(storyPath, 'utf8'));
const captureDirectory = path.join(root, 'marketing', 'video', 'captures', storyId);
mkdirSync(captureDirectory, { recursive: true });

const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2'
};

function resolveFile(urlPath) {
  const pathname = decodeURIComponent(new URL(urlPath, 'http://127.0.0.1').pathname);
  let target = path.resolve(root, `.${pathname}`);
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  if (existsSync(target) && statSync(target).isFile()) return target;
  if (!path.extname(target) && existsSync(`${target}.html`)) return `${target}.html`;
  if (existsSync(target) && statSync(target).isDirectory() && existsSync(path.join(target, 'index.html'))) return path.join(target, 'index.html');
  return null;
}

const server = createServer((request, response) => {
  const target = resolveFile(request.url || '/');
  if (!target) return response.writeHead(404).end('Not found');
  response.setHeader('content-type', mimeTypes[path.extname(target).toLowerCase()] || 'application/octet-stream');
  response.end(readFileSync(target));
});
server.listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const port = server.address().port;

const browser = await chromium.launch({ headless: true });
try {
  for (const scene of story.scenes) {
    const viewport = scene.viewport || story.captureViewport || { width: 1440, height: 1000 };
    const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${port}${scene.route}`, { waitUntil: 'networkidle' });

    for (const selector of story.hide || []) {
      await page.locator(selector).evaluate((element) => { element.hidden = true; });
    }

    if (scene.setValues) {
      for (const [selector, value] of Object.entries(scene.setValues)) {
        await page.locator(selector).evaluate((element, nextValue) => {
          element.value = nextValue;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }, value);
      }
    }
    if (scene.highlight) {
      await page.locator(scene.highlight).evaluate((element) => {
        element.style.outline = '4px solid #7b2f3b';
        element.style.outlineOffset = '5px';
        element.scrollIntoView({ block: 'center', inline: 'nearest' });
      });
    }
    if (scene.scrollTo) await page.locator(scene.scrollTo).scrollIntoViewIfNeeded();
    await page.waitForTimeout(scene.settleMs || 450);

    const outputPath = path.join(captureDirectory, `${scene.id}.png`);
    await page.screenshot({ path: outputPath, fullPage: false });
    process.stdout.write(`Captured ${scene.id}: ${path.relative(root, outputPath)}\n`);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
