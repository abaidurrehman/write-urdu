'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const pages = {
  home: read('index.html'),
  voice: read('tools', 'urdu-voice-typing.html'),
  cardStudio: read('urdu-card-studio.html'),
  cardStudioUrdu: read('urdu', 'urdu-card-studio.html'),
  templates: read('urdu-templates.html'),
  romanGuide: read('roman-urdu-transliteration.html'),
  tutorial: read('english-urdu-typing-tutorial.html')
};

assert.match(pages.home, /src="\/assets\/videos\/english-to-urdu-typing\.webm"/);
assert.match(pages.voice, /src="\/assets\/videos\/urdu-voice-typing\.webm"/);
assert.match(pages.cardStudio, /src="\/assets\/videos\/urdu-card-studio\.webm"/);
assert.match(pages.cardStudioUrdu, /src="\/assets\/videos\/urdu-card-studio\.webm"/);
assert.match(pages.templates, /src="\/assets\/videos\/urdu-templates\.webm"/);
assert.match(pages.romanGuide, /src="\/assets\/videos\/english-to-urdu-typing\.webm"/);
assert.match(pages.tutorial, /src="\/assets\/videos\/english-to-urdu-typing\.webm"/);

Object.values(pages).forEach((html) => {
  assert.match(html, /<video\b[^>]*\bcontrols\b[^>]*\bplaysinline\b[^>]*\bpreload="none"/);
  assert.doesNotMatch(html, /<video\b[^>]*\bautoplay\b/);
  assert.match(html, /<link[^>]+href="\/css\/product-video\.css"/);
  // Browsers fetch a poster eagerly even with preload="none"; the PNG posters
  // (316-468 KB) competed with first paint on slow connections.
  const posters = html.match(/<video\b[^>]*\bposter="[^"]*"/g) || [];
  assert.ok(posters.length > 0, 'Product video must declare a poster');
  posters.forEach((tag) => assert.match(tag, /poster="\/assets\/videos\/[a-z-]+-poster\.webp"/, 'Product video posters must use the lightweight WebP version'));
});

[
  'english-to-urdu-typing.webm',
  'english-to-urdu-typing-poster.png',
  'urdu-voice-typing.webm',
  'urdu-voice-typing-poster.png',
  'urdu-card-studio.webm',
  'urdu-card-studio-poster.png',
  'urdu-templates.webm',
  'urdu-templates-poster.png',
  'english-to-urdu-typing-poster.webp',
  'urdu-voice-typing-poster.webp',
  'urdu-card-studio-poster.webp',
  'urdu-templates-poster.webp'
].forEach((file) => assert.ok(fs.existsSync(path.join(root, 'assets', 'videos', file)), `Missing published video asset: ${file}`));

fs.readdirSync(path.join(root, 'assets', 'videos')).filter((file) => file.endsWith('-poster.webp')).forEach((file) => {
  const size = fs.statSync(path.join(root, 'assets', 'videos', file)).size;
  assert.ok(size < 80 * 1024, `${file} is ${Math.round(size / 1024)} KB; re-encode with node scripts/encode-video-posters.mjs`);
});

console.log('Product video embed contracts passed.');
