const assert = require('node:assert/strict');
const fixtures = require('../benchmarks/roman-urdu/fixtures');
const core = require('../scripts/roman-urdu-benchmark/core');
const protectedTokens = require('../scripts/roman-urdu-benchmark/protected-tokens');

assert.ok(fixtures.length >= 100, 'Roman Urdu benchmark seed must contain at least 100 curated fixtures.');

const ids = new Set();
const categoryCounts = new Map();
for (const fixture of fixtures) {
  assert.deepEqual(core.validateFixture(fixture), [], `Fixture ${fixture.id} must satisfy the benchmark schema.`);
  assert.ok(!ids.has(fixture.id), `Fixture id ${fixture.id} must be unique.`);
  ids.add(fixture.id);
  categoryCounts.set(fixture.category, (categoryCounts.get(fixture.category) || 0) + 1);
}

for (const category of core.VALID_CATEGORIES) {
  assert.ok((categoryCounts.get(category) || 0) >= 5, `Category ${category} must have at least five fixtures.`);
}

const parsed = core.parseGoogleResponse(['SUCCESS', [['kese', ['کیسے', 'کسی']]]]);
assert.equal(parsed.primary, 'کیسے');
assert.deepEqual(parsed.suggestions, ['کیسے', 'کسی']);

assert.equal(
  core.scoreFixture(
    { id: 'test-suggestion', category: 'spelling_variant', input: 'kese', assertion: 'suggestion_contains', accepted: ['کیسے'] },
    { primary: 'کسی', suggestions: ['کسی', 'کیسے'] }
  ).pass,
  true,
  'An accepted alternate should pass suggestion_contains even when it is not the first candidate.'
);

assert.equal(
  core.scoreFixture(
    { id: 'test-preserve', category: 'code_switching', input: 'WhatsApp par bhejo', assertion: 'preserve_token', tokens: ['WhatsApp'] },
    { primary: 'WhatsApp پر بھیجو', suggestions: ['WhatsApp پر بھیجو'] }
  ).pass,
  true,
  'Code-switching fixtures must be able to assert preserved Latin tokens.'
);

assert.equal(
  core.scoreFixture(
    { id: 'test-manual', category: 'long_paste', input: 'line one\nline two', assertion: 'manual_review' },
    { primary: 'لائن ون\nلائن ٹو', suggestions: [] }
  ).status,
  'manual',
  'Genuinely ambiguous fixtures must stay outside automatic pass/fail.'
);

const summary = core.summarize([
  { fixture: { category: 'spelling_variant' }, score: { status: 'pass' } },
  { fixture: { category: 'spelling_variant' }, score: { status: 'fail' } },
  { fixture: { category: 'long_paste' }, score: { status: 'manual' } }
]);
assert.equal(summary.total, 3);
assert.equal(summary.pass_rate, 0.5);
assert.equal(summary.by_category.spelling_variant.total, 2);

const protectedCases = [
  ['https://write-urdu.com', 'url'],
  ['admin@example.com', 'email'],
  ['@ali', 'handle'],
  ['PDF', 'acronym'],
  ['PKR', 'acronym'],
  ['PM', 'acronym'],
  ['WhatsApp', 'mixed_case'],
  ['iPhone', 'mixed_case'],
  ['0300-1234567', 'numeric_shape'],
  ['12/09/2026', 'numeric_shape'],
  ['3:30', 'numeric_shape'],
  ['2500', 'numeric_shape']
];
for (const [value, expectedType] of protectedCases) {
  const part = protectedTokens.splitProtectedTokens(value).find(item => item.protected);
  assert.ok(part, `${value} must be protected by the B3 structural candidate.`);
  assert.equal(part.type, expectedType, `${value} must use the expected protected-token type.`);
  assert.equal(part.value, value, `${value} must be preserved byte-for-byte.`);
}

for (const value of ['Facebook', 'Instagram', 'Word', 'Ali', 'Rs', 'kg', 'plz', 'thx', 'ok', 'bohat', 'mujhe']) {
  assert.equal(
    protectedTokens.hasProtectedToken(value),
    false,
    `${value} must remain outside the first B3 protected-token candidate.`
  );
}

const segmented = protectedTokens.splitProtectedTokens('price PKR 2500 hai');
assert.deepEqual(
  segmented.map(part => [part.protected, part.type || null, part.value]),
  [
    [false, null, 'price '],
    [true, 'acronym', 'PKR'],
    [false, null, ' '],
    [true, 'numeric_shape', '2500'],
    [false, null, ' hai']
  ],
  'The B3 segmenter must preserve exact surrounding text while isolating structural tokens.'
);

assert.deepEqual(
  protectedTokens.edgeWhitespace('  bhej do  '),
  { leading: '  ', trailing: '  ', core: 'bhej do' },
  'Segment conversion must preserve boundary whitespace around provider calls.'
);

console.log(`Roman Urdu benchmark contract checks passed (${fixtures.length} fixtures).`);
