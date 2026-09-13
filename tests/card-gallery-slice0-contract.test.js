const assert = require('node:assert');
const registry = require('../js/card-background-registry.js');
const core = require('../js/card-gallery-core.js');
const fixtures = require('./fixtures/card-gallery-text-fixtures.js');

const previousIds = [
  'emerald-mughal', 'moonlit-lanterns', 'vintage-floral', 'burgundy-arch',
  'emerald-jasmine-lanterns', 'midnight-crescent-city', 'emerald-eid-lanterns',
  'blush-rose-lanterns', 'rose-garden-frame', 'heritage-mughal-garden',
  'teal-gold-botanical', 'ivory-arabesque'
];
const allowedCategories = new Set(['classic', 'pakistan', 'truck-art', 'poetry', 'nature', 'modern', 'wedding', 'luxury']);
const allowedGoodFor = new Set(['dua', 'greeting', 'heritage', 'modern', 'nature', 'poetry', 'quote', 'wedding']);
const backgrounds = registry.getAllBackgrounds();

assert.notStrictEqual(backgrounds, registry.backgrounds, 'registry reads must return a collection copy');
assert.strictEqual(backgrounds.length, 24, 'Slice 0 inventory must retain all 24 backgrounds');
assert.strictEqual(new Set(backgrounds.map((item) => item.id)).size, backgrounds.length, 'background IDs must be unique');
previousIds.forEach((id) => assert.ok(registry.getBackgroundById(id), `existing background removed: ${id}`));

const categoryIds = registry.getBackgroundCategories().map((item) => item.id);
assert.strictEqual(new Set(categoryIds).size, categoryIds.length, 'category IDs must be unique');
assert.strictEqual(categoryIds[0], 'all', 'All must remain the first category');
assert.deepStrictEqual(registry.filterBackgrounds('all'), backgrounds, 'All must return every background deterministically');
assert.deepStrictEqual(registry.filterBackgrounds('missing-category'), [], 'unknown categories must fail closed');

backgrounds.forEach((background) => {
  assert.ok(background.name && background.nameUr, `${background.id} needs bilingual labels`);
  assert.ok(allowedCategories.has(background.category), `${background.id} has undeclared category`);
  assert.ok(core.TEXT_CAPACITIES.includes(background.textCapacity), `${background.id} has invalid text capacity`);
  assert.ok(['start', 'center', 'end'].includes(background.preferredAlign), `${background.id} has invalid preferred alignment`);
  assert.ok(core.normalizeSafeArea(background.safeArea), `${background.id} has invalid safe area`);
  assert.ok(background.goodFor.length > 0 && background.goodFor.every((tag) => allowedGoodFor.has(tag)), `${background.id} has uncontrolled suitability tags`);
  assert.ok(registry.filterBackgrounds(background.category).includes(background), `${background.id} missing from its category`);
});

assert.strictEqual(core.classifyText(fixtures.short), 'short');
assert.strictEqual(core.classifyText(fixtures.medium), 'medium');
assert.strictEqual(core.classifyText(fixtures.long), 'long');
assert.strictEqual(core.classifyText(fixtures.mixed), 'short');
assert.strictEqual(core.classifyText(fixtures.explicitNewlines), 'medium');
assert.strictEqual(core.classifyText(fixtures.whitespaceOnly), 'empty');
assert.strictEqual(core.classifyText(fixtures.unbrokenToken), 'long');
assert.strictEqual(core.isTextWithinPreviewLimit(fixtures.unbrokenToken), false, 'extreme text must exceed the explicit preview limit');
assert.deepStrictEqual(core.safeAreaStyle({ top: 0.1, right: 0.2, bottom: 0.3, left: 0.4 }), {
  top: '10%', right: '20%', bottom: '30%', left: '40%'
});
assert.strictEqual(core.normalizeSafeArea({ top: 0.6, right: 0.1, bottom: 0.4, left: 0.1 }), null, 'collapsed safe area must fail');
assert.strictEqual(core.isSuitable('long', 'medium'), false);
assert.strictEqual(core.isSuitable('medium', 'long'), true);

console.log(`Card Gallery Slice 0 contract passed: ${backgrounds.length} backgrounds and 7 Urdu/bidi fixtures.`);
