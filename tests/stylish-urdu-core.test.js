const assert = require('assert');
const core = require('../js/stylish-urdu-core.js');

const normalized = core.normalizeText('  سلام\r\n\u202Eدنیا  ');
assert.strictEqual(normalized.value, 'سلام\nدنیا', 'normalization should remove bidi controls and preserve paragraphs');
assert.strictEqual(core.detectScript('سلام'), 'urdu');
assert.strictEqual(core.detectScript('Abaid سلام'), 'mixed');
assert.strictEqual(core.detectScript('2026'), 'numeric');
assert.deepStrictEqual(core.segmentRuns('سلام 2026 Abaid').map(run => run.kind), ['urdu', 'other', 'numeric', 'other', 'latin']);

assert.strictEqual(core.graphemes('بِ').length, 1, 'Urdu combining marks must remain inside one grapheme');
const long = core.normalizeText('ا'.repeat(150), 100);
assert.strictEqual(core.graphemes(long.value).length, 100, 'normalization must be grapheme-safe');
assert.strictEqual(long.truncated, true);

assert.ok(core.kashida('سلام').indexOf('ـ') >= 0, 'kashida style should add only joining elongation marks');
assert.ok(!/[\u202A-\u202E\u2066-\u2069]/.test(core.kashida('سلام')), 'kashida output must not contain bidi controls');
assert.strictEqual(core.kashida('راز').includes('ـ'), false, 'kashida must not be inserted after non-joining letters');

const definitions = core.STYLE_DEFINITIONS;
assert.ok(definitions.length >= 80, 'style catalog must retain at least the launch inventory');
assert.strictEqual(new Set(definitions.map(style => style.id)).size, definitions.length, 'style IDs must be unique');
const requiredCategories = ['minimal','royal','hearts','islamic','gaming','social','decorative','urdu-english','kashida','popular'];
const actualCategories = new Set(definitions.map(style => style.category));
for (const category of requiredCategories) assert.ok(actualCategories.has(category), `style catalog is missing ${category}`);

const styles = core.generateStyles('Abaid سلام', { limit: 500 });
assert.strictEqual(styles.total, definitions.length, 'mixed text should expose the complete style catalog');
assert.strictEqual(new Set(styles.items.map(item => item.output)).size, styles.items.length, 'generated outputs must not duplicate');
const urduStyles = core.generateStyles('سلام', { limit: 500 });
assert.strictEqual(urduStyles.total, definitions.length, 'pure Urdu should retain the complete style catalog');
assert.strictEqual(new Set(urduStyles.items.map(item => item.output)).size, urduStyles.items.length, 'pure Urdu outputs must remain unique');

const popular = core.generateStyles('سلام', { category: 'popular', limit: 500 });
assert.strictEqual(popular.total, definitions.filter(style => style.featured).length, 'Popular filter must reflect the current featured catalog');
assert.strictEqual(popular.items.every(item => item.featured), true, 'Popular filter leaked a non-featured style');
assert.ok(popular.total < styles.total, 'Popular filter must not return the whole catalog');
assert.strictEqual(
  core.generateStyles('سلام', { category: 'kashida', limit: 500 }).total,
  definitions.filter(style => style.category === 'kashida').length,
  'Kashida filter must reflect the current category inventory'
);
assert.strictEqual(core.generateStyles('سلام', { intensity: 'strong', limit: 500 }).items.every(item => item.intensity === 'strong'), true);
assert.strictEqual(core.generateStyles('سلام', { category: 'royal', intensity: 'light', limit: 500 }).items.every(item => item.category === 'royal' && item.intensity === 'light'), true);

const handoff = core.createHandoff('سلام');
assert.strictEqual(handoff.version, 1);
assert.strictEqual(handoff.source, 'stylish-urdu-text-generator');
assert.strictEqual(handoff.text, 'سلام');
console.log('Stylish Urdu core tests passed.');
