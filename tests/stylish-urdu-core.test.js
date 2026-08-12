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

assert.strictEqual(core.STYLE_DEFINITIONS.length, 80, 'style catalog must contain the launch minimum');
assert.strictEqual(new Set(core.STYLE_DEFINITIONS.map(style => style.id)).size, 80, 'style IDs must be unique');
const expectedCategories = ['minimal','royal','hearts','islamic','gaming','social','decorative','urdu-english','kashida','popular'];
assert.deepStrictEqual([...new Set(core.STYLE_DEFINITIONS.map(style => style.category))].sort(), expectedCategories.sort(), 'style catalog categories changed unexpectedly');

const styles = core.generateStyles('Abaid سلام', { limit: 200 });
assert.strictEqual(styles.total, 80, 'styles should be deterministic and unique for mixed text');
assert.strictEqual(new Set(styles.items.map(item => item.output)).size, styles.items.length, 'generated outputs must not duplicate');
const urduStyles = core.generateStyles('سلام', { limit: 200 });
assert.strictEqual(urduStyles.total, 80, 'pure Urdu should retain the complete style catalog');
assert.strictEqual(new Set(urduStyles.items.map(item => item.output)).size, 80, 'pure Urdu outputs must remain unique');

const popular = core.generateStyles('سلام', { category: 'popular', limit: 200 });
assert.strictEqual(popular.total, 31, 'Popular filter must return only featured styles');
assert.strictEqual(popular.items.every(item => item.featured), true, 'Popular filter leaked a non-featured style');
assert.ok(popular.total < styles.total, 'Popular filter must not return the whole catalog');
assert.strictEqual(core.generateStyles('سلام', { category: 'kashida', limit: 200 }).total, 8);
assert.strictEqual(core.generateStyles('سلام', { intensity: 'strong', limit: 200 }).items.every(item => item.intensity === 'strong'), true);
assert.strictEqual(core.generateStyles('سلام', { category: 'royal', intensity: 'light', limit: 200 }).items.every(item => item.category === 'royal' && item.intensity === 'light'), true);

const handoff = core.createHandoff('سلام');
assert.strictEqual(handoff.version, 1);
assert.strictEqual(handoff.source, 'stylish-urdu-text-generator');
assert.strictEqual(handoff.text, 'سلام');
console.log('Stylish Urdu core tests passed.');
