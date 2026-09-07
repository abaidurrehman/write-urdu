import { createServer } from 'node:http';
import { createWriteStream, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

import { normalizeVideoStory, resolveVideoFormat } from './video-runtime.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const storyId = normalizeVideoStory(process.argv[2]);
const format = process.argv[3] || 'website-16x9';
const posterMode = process.argv.includes('--poster');
const [width, height] = resolveVideoFormat(format);
const storyPath = path.join(root, 'marketing', 'video', 'stories', `${storyId}.json`);
if (!existsSync(storyPath)) throw new Error(`Video story not found: ${path.relative(root, storyPath)}`);
const compositionPath = path.join(root, 'marketing', 'video', 'compositions', 'product-film.html');
if (!existsSync(compositionPath)) throw new Error('Video composition is missing.');

const generatedDirectory = path.join(root, 'marketing', 'video', 'generated');
mkdirSync(generatedDirectory, { recursive: true });
const outputPath = path.join(generatedDirectory, `${storyId}-${format}${posterMode ? '-poster.png' : '.webm'}`);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webp': 'image/webp'
};
let resolveOutput;
let rejectOutput;
const outputReady = new Promise((resolve, reject) => { resolveOutput = resolve; rejectOutput = reject; });

const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  if (request.method === 'POST' && url.pathname === '/render-output') {
    const output = createWriteStream(outputPath);
    let bytes = 0;
    request.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > 100 * 1024 * 1024) request.destroy(new Error('Video output exceeds 100 MB.'));
    });
    request.pipe(output);
    output.on('finish', () => { response.writeHead(204).end(); resolveOutput(bytes); });
    output.on('error', rejectOutput);
    request.on('error', rejectOutput);
    return;
  }

  const relativeUrl = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
  const target = path.resolve(root, relativeUrl);
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return response.writeHead(403).end('Forbidden');
  try {
    if (!statSync(target).isFile()) throw new Error();
    response.setHeader('content-type', mimeTypes[path.extname(target).toLowerCase()] || 'application/octet-stream');
    response.end(readFileSync(target));
  } catch {
    response.writeHead(404).end('Not found');
  }
});
server.listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const port = server.address().port;
const query = new URLSearchParams({ story: storyId, format, ...(posterMode ? { time: '1.5' } : { render: '1' }) });
const url = `http://127.0.0.1:${port}/marketing/video/compositions/product-film.html?${query}`;

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(url, { waitUntil: 'networkidle' });
  if (posterMode) {
    await page.waitForFunction(() => document.documentElement.dataset.videoReady === 'true');
    await page.screenshot({ path: outputPath });
    process.stdout.write(`Rendered poster: ${path.relative(root, outputPath)}\n`);
  } else {
    const timeout = setTimeout(() => rejectOutput(new Error('Video render timed out after 90 seconds.')), 90000);
    try {
      const bytes = await outputReady;
      process.stdout.write(`Rendered video (${bytes} bytes): ${path.relative(root, outputPath)}\n`);
    } finally {
      clearTimeout(timeout);
    }
  }
} finally {
  await browser.close();
  server.close();
}
