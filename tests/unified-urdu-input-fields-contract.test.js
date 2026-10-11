const assert = require('assert');
const fs = require('fs');
const read = file => fs.readFileSync(file, 'utf8');

const cards = read('js/urdu-cards.js');
assert.match(cards, /data-input-mode-targets', '#urdu-cards-personalizer-text'/, 'The card personalizer must mount the shared input-mode control');
assert.match(read('js/card-gallery-transliteration.js'), /urdu-cards-personalizer-text/, 'The shared Google control must register the personalizer field');

const bill = read('urdu-bill-generator.html');
assert.match(bill, /data-input-mode-storage="bill"/, 'The bill generator must expose the shared input-mode toggle');
assert.match(bill, /js\/bill-generator-urdu-input\.js/, 'The bill generator must load the field adapter');
assert.ok(!/TransliterationControl/.test(read('js/bill-generator.js')), 'bill-generator.js must not contain transliteration code');
assert.match(read('js/bill-generator-urdu-input.js'), /data-item-field="description"/, 'The adapter must cover item descriptions');
console.log('unified Urdu input fields contract passed');
