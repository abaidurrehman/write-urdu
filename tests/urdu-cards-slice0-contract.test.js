const assert = require('node:assert/strict');
const registry = require('../js/card-background-registry.js');
const core = require('../js/card-gallery-core.js');
const data = require('../js/urdu-cards-data.js');

const cards = data.getAllCards();

assert.notStrictEqual(cards, data.cards, 'getAllCards must return a collection copy');
assert.ok(cards.length >= 60 && cards.length <= 72, `expected first recurring batch beside original corpus, got ${cards.length}`);
assert.strictEqual(new Set(cards.map((card) => card.id)).size, cards.length, 'card IDs must be unique');

const categoryIds = data.getCardCategories().map((item) => item.id);
assert.strictEqual(categoryIds[0], 'all', 'All must remain the first category');
assert.strictEqual(new Set(categoryIds).size, categoryIds.length, 'category IDs must be unique');
const realCategoryIds = new Set(categoryIds.filter((id) => id !== 'all'));

assert.deepStrictEqual(data.filterCards('all'), cards, 'All must return every card deterministically');
assert.deepStrictEqual(data.filterCards('missing-category'), [], 'unknown categories must fail closed');

realCategoryIds.forEach((id) => {
    assert.ok(cards.some((card) => card.category === id), `category ${id} has no cards`);
});

cards.forEach((card) => {
    assert.ok(realCategoryIds.has(card.category), `${card.id} has undeclared category`);
    assert.ok(data.filterCards(card.category).includes(card), `${card.id} missing from its category filter`);
    assert.ok(data.getCardById(card.id) === card, `getCardById must resolve ${card.id}`);

    const background = registry.getBackgroundById(card.backgroundId);
    assert.ok(background, `${card.id} references unknown backgroundId ${card.backgroundId}`);

    assert.ok(card.textUr && card.textUr.trim(), `${card.id} must have non-empty Urdu text`);
    assert.ok(core.isTextWithinPreviewLimit(card.textUr), `${card.id} text exceeds preview limit`);
    const bucket = core.classifyText(card.textUr);
    assert.notStrictEqual(bucket, 'empty', `${card.id} text must not classify as empty`);
    assert.notStrictEqual(bucket, 'long', `${card.id} curated card text should stay short/medium for receiver quality`);
    assert.ok(core.isSuitable(bucket, background.textCapacity), `${card.id} text bucket exceeds ${card.backgroundId} capacity`);
});

assert.deepStrictEqual(data.validateCards(registry), [], 'curated-card registry validation must pass');
data.CONTEXTS.forEach((context) => {
    assert.ok(data.getFeaturedCandidates(context).length >= 4, `${context} needs multiple approved homepage candidates`);
});

console.log(`Urdu Cards Slice 0 contract passed: ${cards.length} curated cards across ${realCategoryIds.size} categories.`);
