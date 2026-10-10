const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const headerCore = read('js/site-header-core.js');
const applyPageCopy = headerCore.match(/function applyPageCopy\(\) \{[\s\S]*?\n    \}/);
assert.ok(applyPageCopy, 'site header core must keep applyPageCopy');
assert.doesNotMatch(applyPageCopy[0], /\|\|\s*pageCopy\['\/index\.html'\]/, 'Pages without explicit copy must not inherit the homepage heading');
assert.match(applyPageCopy[0], /if \(!copy\) return;/, 'applyPageCopy must leave unmapped pages untouched');

['urdu-keyboard.html', 'urdu/urdu-keyboard.html'].forEach(file => {
  assert.doesNotMatch(read(file), /new Clipboard\(/, `${file} must not construct clipboard.js, which is never loaded`);
});

assert.doesNotMatch(read('tools/inpage-unicode-converter.html'), /<a href="\/">Open the Urdu editor<\/a>/, 'InPage editor shortcut must not point to the homepage');
assert.match(read('tools/inpage-unicode-converter.html'), /<a href="\/urdu-editor">Open the Urdu editor<\/a>/, 'InPage editor shortcut must open the Rich Text Editor');

const voice = read('js/writer-voice-input.js');
const placeFeatured = voice.match(/function placeFeaturedMethod\([\s\S]*?\n    \}/);
assert.ok(placeFeatured, 'writer voice input must keep placeFeaturedMethod');
assert.doesNotMatch(placeFeatured[0], /control\.insertBefore\(/, 'Featured voice method must insert relative to the anchor parent, which may be nested');

const cards = read('js/urdu-cards.js');
assert.doesNotMatch(cards, /Label', \{ id: card\.id \}/, 'Card action labels must not expose internal card ids');
assert.match(cards, /copyText\('imageLabel', \{ name: cardName \}\)/, 'Card image action must use the visible card name');

console.log('Page integrity contract passed.');
