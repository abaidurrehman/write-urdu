'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const pages = {
  home: read('index.html'),
  voice: read('tools', 'urdu-voice-typing.html'),
  romanGuide: read('roman-urdu-transliteration.html'),
  tutorial: read('english-urdu-typing-tutorial.html')
};

assert.match(pages.home, /src="\/assets\/videos\/english-to-urdu-typing\.webm"/);
assert.match(pages.voice, /src="\/assets\/videos\/urdu-voice-typing\.webm"/);
assert.match(pages.romanGuide, /src="\/assets\/videos\/english-to-urdu-typing\.webm"/);
assert.match(pages.tutorial, /src="\/assets\/videos\/english-to-urdu-typing\.webm"/);

Object.values(pages).forEach((html) => {
  assert.match(html, /<video\b[^>]*\bcontrols\b[^>]*\bplaysinline\b[^>]*\bpreload="none"/);
  assert.doesNotMatch(html, /<video\b[^>]*\bautoplay\b/);
  assert.match(html, /<link[^>]+href="\/css\/product-video\.css"/);
});

[
  'english-to-urdu-typing.webm',
  'english-to-urdu-typing-poster.png',
  'urdu-voice-typing.webm',
  'urdu-voice-typing-poster.png'
].forEach((file) => assert.ok(fs.existsSync(path.join(root, 'assets', 'videos', file)), `Missing published video asset: ${file}`));

console.log('Product video embed contracts passed.');
