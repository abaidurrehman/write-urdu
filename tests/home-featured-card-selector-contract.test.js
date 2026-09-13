const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const selector = require('../js/home-featured-card-selector.js');
const data = require('../js/urdu-cards-data.js');
const backgrounds = require('../js/card-background-registry.js');
const journey = require('../js/workspace-journey-registry.js');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function localDate(year, month, day, hour, minute) {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

[
  [localDate(2026, 9, 17, 4, 59), 'night'],
  [localDate(2026, 9, 17, 5, 0), 'morning'],
  [localDate(2026, 9, 17, 11, 59), 'morning'],
  [localDate(2026, 9, 17, 12, 0), 'daytime'],
  [localDate(2026, 9, 17, 17, 59), 'daytime'],
  [localDate(2026, 9, 17, 18, 0), 'evening'],
  [localDate(2026, 9, 17, 21, 59), 'evening'],
  [localDate(2026, 9, 17, 22, 0), 'night'],
  [localDate(2026, 9, 18, 0, 0), 'friday'],
  [localDate(2026, 9, 18, 20, 0), 'friday'],
  [localDate(2026, 9, 19, 0, 0), 'night']
].forEach(([date, expected]) => assert.strictEqual(selector.contextForDate(date), expected));

const cards = data.getAllCards();
data.CONTEXTS.forEach((context) => {
  const candidates = selector.featuredCandidates(cards, context, backgrounds);
  assert.ok(candidates.length >= 4, `${context} must have multiple eligible cards`);
  candidates.forEach(card => {
    assert.strictEqual(card.featuredEligible, true);
    assert.ok(card.contexts.includes(context));
    assert.ok(backgrounds.getBackgroundById(card.backgroundId));
  });
});

const date = localDate(2026, 9, 17, 8, 30);
assert.strictEqual(selector.selectFeaturedCard(cards, date, backgrounds), selector.selectFeaturedCard(cards, date, backgrounds), 'same date/context must select same object');
assert.strictEqual(selector.selectFeaturedCard(cards, new Date('invalid'), backgrounds), null);
assert.deepStrictEqual(selector.featuredCandidates([{ id: 'bad', status: 'approved', featuredEligible: true, contexts: ['morning'], textUr: 'اردو', backgroundId: 'missing', source: { verified: true }, rights: { status: 'original' } }], 'morning', backgrounds), []);

const home = read('index.html');
const runtime = read('js/home-featured-card.js');
const adapter = read('js/card-studio-handoff-adapter.js');
const share = read('js/curated-card-share.js');

assert.strictEqual((home.match(/data-home-featured-card-share/g) || []).length, 1);
assert.strictEqual((home.match(/data-home-featured-card-edit/g) || []).length, 1);
assert.ok(home.indexOf('data-home-featured-card') > home.indexOf('id="transliterateTextarea"'));
assert.ok(home.indexOf('data-home-featured-card') < home.indexOf('home-new-tools'));
assert.doesNotMatch(home, /data-home-featured-card-(?:carousel|filter|shuffle|favorite)/);
assert.match(runtime, /sourceWorkspace: 'home-featured-card'/);
assert.match(runtime, /kind: 'visual-project-seed'/);
assert.match(runtime, /payload: \{ text: card\.textUr, backgroundId: card\.backgroundId \}/);
assert.doesNotMatch(runtime, /[?&#](?:text|urdu)=/i);
assert.match(adapter, /'home-featured-card': true/);
assert.ok(journey.get('home-featured-card'));
assert.ok(journey.action('home-featured-card', 'home-featured-card-to-studio'));
assert.match(share, /fetch\('\/api\/shares'/);
assert.doesNotMatch(runtime, /fetch\('\/api\/shares'/);
assert.doesNotMatch(runtime, /createElement\('canvas'\)/);

console.log('Homepage featured-card selector, scope, sharing and handoff contracts passed.');
