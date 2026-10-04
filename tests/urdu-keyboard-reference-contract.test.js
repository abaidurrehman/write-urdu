const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const page = read('urdu-keyboard.html');
const runtime = read('js/urdu-keyboard-reference.js');
const siteRuntime = read('js/site-runtime.js');
const css = read('css/keyboard.css');

assert.match(page, /data-physical-key-reference/, 'Keyboard page should expose a physical-key reference');
assert.match(page, /data-key-reference-mode="base"[^>]+aria-pressed="true"/, 'Base layer should be selected by default');
assert.match(page, /data-key-reference-mode="shift"/, 'Keyboard page should expose its Shift layer');
assert.match(page, /punctuation and the number row/i, 'Reference guidance should cover punctuation and numerals');
assert.match(page, /On a phone or tablet/, 'Reference should include mobile guidance');
assert.match(page, /<textarea[^>]+dir="rtl"[^>]+lang="ur"[^>]+id="write"/s, 'Primary input must remain a direct RTL Urdu textarea');
assert.doesNotMatch(page, /google_jsapi|TransliterationControl|data-batch-transliteration/, 'Direct keyboard route must not initialize English-letter transliteration');
assert.ok((page.match(/<a href="\/">English to Urdu typing<\/a>/g) || []).length >= 3, 'English-letter users should be routed to the homepage owner');

assert.match(runtime, /WriteUrduTypingPracticeCore/, 'Reference must reuse the typing-practice mapping source');
assert.match(runtime, /Core\.KEYBOARD_ROWS/, 'Reference must reuse shared physical rows');
assert.match(runtime, /Core\.BASE_MAP/, 'Reference must reuse base mappings');
assert.match(runtime, /Core\.SHIFT_MAP/, 'Reference must reuse Shift mappings');
assert.doesNotMatch(runtime, /addEventListener\(['"]keydown/, 'Reference must not intercept physical input');
assert.match(siteRuntime, /transliterationRequired\(\) &&/, 'Shared runtime should only monitor transliteration on routes that load it');
assert.match(css, /\.physical-key-reference-scroll[^}]+overflow-x:auto/s, 'Reference should scroll within narrow mobile viewports');
assert.match(css, /@media \(max-width:620px\)/, 'Reference should have a narrow mobile layout');

console.log('Urdu keyboard physical reference contract passed.');
