const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const core = require('../js/typing-practice-core.js');

assert.equal(core.mapKey('a'), 'ا', 'A key should map to alif');
assert.equal(core.mapKey('s'), 'س', 'S key should map to seen');
assert.equal(core.mapKey('q'), 'ق', 'Q key should map to qaaf');
assert.equal(core.mapKey('R'), 'ڑ', 'Shift+R should map to rray');
assert.equal(core.mapKey('T'), 'ٹ', 'Shift+T should map to ttay');
assert.equal(core.mapKey('N'), 'ں', 'Shift+N should map to noon ghunna');
assert.equal(core.mapKey('?'), '؟', 'Shift+/ should map to Urdu question mark');
assert.equal(core.mapKey(' '), ' ', 'Space should remain a space');

assert.equal(
  core.normalizeText('ا\u200fردو\u00a0ٹائپنگ'),
  'اردو ٹائپنگ',
  'Scoring should ignore bidi controls and normalize NBSP'
);
assert.deepEqual(core.graphemes('آج'), ['آ', 'ج'], 'Urdu text should segment into graphemes');

{
  const exact = core.measure('ا'.repeat(25), 'ا'.repeat(25), 60);
  assert.equal(exact.wpm, 5, '25 correct characters in one minute should equal 5 WPM');
  assert.equal(exact.accuracy, 100);
  assert.equal(exact.progress, 100);
}

{
  const partial = core.measure('اردو', 'اردا', 60);
  assert.equal(partial.correct, 3);
  assert.equal(partial.errors, 1);
  assert.equal(partial.accuracy, 75);
  assert.equal(partial.progress, 100);
}

{
  const target = core.buildTimedTarget(['اردو کی مشق مفید ہے۔'], 300);
  assert.ok(target.length >= 3000, 'Five-minute target should be long enough for fast typists');
  assert.match(target, /اردو/, 'Timed target should preserve Urdu source text');
}

const page = fs.readFileSync(path.join(root, 'urdu-typing-practice.html'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'js/typing-practice.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/typing-practice.css'), 'utf8');

assert.match(page, /<link rel="canonical" href="https:\/\/write-urdu\.com\/urdu-typing-practice">/);
assert.match(page, /data-practice-mode="lesson"/);
assert.match(page, /data-practice-mode="test"/);
assert.match(page, /data-test-duration="60"/);
assert.match(page, /data-test-duration="120"/);
assert.match(page, /data-test-duration="300"/);
assert.match(page, /data-input-mode="phonetic"/);
assert.match(page, /data-input-mode="native"/);
assert.match(page, /data-practice-target/);
assert.match(page, /data-practice-entry/);
assert.match(page, /data-phonetic-keyboard/);
assert.match(page, /data-progress-sessions/);
assert.match(page, /data-write-urdu-schema/);
assert.match(page, /CRULP Urdu phonetic keyboard pattern/);

const lessonIds = [...ui.matchAll(/\bid:\s*'([^']+)'/g)].map(match => match[1]);
assert.ok(lessonIds.length >= 12, 'Practice course should ship with at least 12 lessons');
assert.match(ui, /writeUrdu\.typingPractice\.v1/, 'Progress should use a versioned local key');
assert.match(ui, /typing_practice_started/);
assert.match(ui, /typing_practice_completed/);
assert.match(ui, /event\.preventDefault\(\);\s*notify\('Paste is disabled/, 'Paste must not count as typing practice');
assert.match(css, /@media \(max-width:620px\)/, 'Practice UI must include a narrow mobile layout');
assert.match(css, /\.practice-glyph\.is-wrong/, 'Wrong characters need a visible error state');
assert.match(css, /\.practice-glyph\.is-current/, 'Current character needs a visible focus state');

console.log('Urdu typing practice core and page contract passed.');
