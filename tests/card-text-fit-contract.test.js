const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const core = require('../js/card-studio-core.js');

// Character-count measurement keeps the fitting rule deterministic in Node.
// 0.38 em per character is close to measured Noto Naskh/Nastaliq Urdu widths.
function createMockContext() {
  const state = { fontSize: 64 };
  const ctx = {
    textBaseline: 'alphabetic',
    direction: 'ltr',
    measureText(value) { return { width: Array.from(String(value)).length * state.fontSize * 0.38 }; }
  };
  Object.defineProperty(ctx, 'font', {
    get() { return state.fontSize + 'px sans-serif'; },
    set(value) { const match = /^(\d+(?:\.\d+)?)px/.exec(String(value)); if (match) state.fontSize = Number(match[1]); }
  });
  return ctx;
}

const box = { x: 0, y: 0, width: 860, height: 700 };
const writtenLines = value => value.split('\n').filter(line => line.trim()).length;
const fit = value => core.findBestFontSize(createMockContext(), core.normalizeCardProject({ text: { value } }), box);

// A couplet keeps each written line whole instead of growing until lines wrap.
const couplet = 'ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے\nبہت نکلے مرے ارمان لیکن پھر بھی کم نکلے';
const coupletFit = fit(couplet);
assert.equal(coupletFit.lines.filter(line => !line.isBlank).length, writtenLines(couplet), 'each line of a couplet must stay on one row');
assert.equal(coupletFit.overflow, false, 'the couplet must fit its box');
assert.ok(coupletFit.fontSize >= Math.ceil(box.width * 0.05), 'whole lines must stay at a readable size');

// The previous, height-only rule: the largest size whose total height fits.
function heightOnlySize(value) {
  const ctx = createMockContext();
  const project = core.normalizeCardProject({ text: { value } });
  let low = project.text.minFontSize, high = project.text.maxFontSize, best = low;
  while (low <= high) {
    const size = Math.floor((low + high) / 2);
    const layout = core.layoutCardText(ctx, Object.assign({}, project, { text: Object.assign({}, project.text, { fontSize: size }) }), box);
    if (layout.height <= box.height) { best = size; low = size + 1; } else high = size - 1;
  }
  return best;
}

// Single-line text keeps the height-based fit (no change in behaviour).
const single = 'السلام علیکم! آپ کا دن خوشگوار گزرے';
assert.equal(fit(single).fontSize, heightOnlySize(single), 'single-line text must keep the height-based size');

// Long paragraphs cannot stay whole at a readable size; keep the height-based fit.
const paragraph = Array(6).fill('یہ ایک طویل پیراگراف ہے جو کارڈ کی چوڑائی سے کہیں زیادہ لمبا ہے').join(' ');
const longText = paragraph + '\n' + paragraph;
const longFit = fit(longText);
assert.ok(longFit.lines.length > 2, 'long paragraphs still wrap');
assert.equal(longFit.fontSize, heightOnlySize(longText), 'long paragraphs keep the height-based size instead of shrinking to avoid wrapping');
assert.equal(longFit.overflow, false, 'long paragraphs still fit the box');

// The couplet's whole-line size is never larger than the height-only size.
assert.ok(coupletFit.fontSize <= heightOnlySize(couplet), 'keeping lines whole only ever reduces the size');

// Renderer and background-library guards.
const studio = read('js/card-studio.js');
assert.match(studio, /ctx\.fillStyle = template\.decoration\.accent; var accentWidth = minSide \* \.12;/, 'The non-centred accent bar must use the accent colour');
assert.match(studio, /preset\.width - preset\.marginX - accentWidth/, 'A right-aligned accent bar must end at the right margin, not run off the canvas');
assert.match(studio, /if \(!safe \|\| transform\.positionCustomized \|\| transform\.widthCustomized\) return transform;/, 'Only untouched text follows the designer background safe area');
assert.match(studio, /delete event\.target\.dataset\.wuBackgroundSafeArea;/, 'A safe area applies to one designer background and is cleared for uploaded images');

const library = read('js/card-studio-background-library.js');
assert.match(library, /background\.category === 'poetry' && !fontChosenByWriter\(\)/, 'Poetry backgrounds switch to Nastaliq only when the writer has not chosen a font');
assert.match(library, /if \(event\.isTrusted\) select\.dataset\.wuWriterChosen = 'true';/, 'Only a real writer font choice is protected');
assert.match(library, /input\.dataset\.wuBackgroundSafeArea = JSON\.stringify\(background\.safeArea \|\| \{\}\);/, 'Designer backgrounds hand their safe area to Card Studio');

console.log('Card text fit contract passed.');
