const assert = require('node:assert/strict');
const selector = require('../js/wedding-template-selector.js');
const wording = require('../js/wedding-wording-registry.js');

function project(language) {
  return { invitationLanguage: language };
}

// One fixture per existing template id, proving deterministic (eventType, language, tone) selection.
assert.equal(selector.selectTemplate(project('urdu'), { type: 'nikah', wordingTone: 'formal' }), 'formal-nikah-ur');
assert.equal(selector.selectTemplate(project('urdu'), { type: 'mehndi', wordingTone: 'informal' }), 'warm-mehndi-ur');
assert.equal(selector.selectTemplate(project('bilingual'), { type: 'baraat', wordingTone: 'formal' }), 'traditional-baraat-bilingual');
assert.equal(selector.selectTemplate(project('english'), { type: 'walima', wordingTone: 'formal' }), 'groom-family-walima-en');

// Ambiguous/unmatched combination must fall back to the single documented default, never guess.
assert.equal(
  selector.selectTemplate(project('english'), { type: 'nikah', wordingTone: 'formal' }),
  'concise-whatsapp',
  'No formal english nikah template exists; must fall back to concise-whatsapp'
);
assert.equal(selector.FALLBACK_TEMPLATE_ID, 'concise-whatsapp');

// Determinism: same input twice must give the same result.
const first = selector.selectTemplate(project('urdu'), { type: 'nikah', wordingTone: 'formal' });
const second = selector.selectTemplate(project('urdu'), { type: 'nikah', wordingTone: 'formal' });
assert.equal(first, second);

// Default tone is 'formal' when wordingTone is missing/invalid, matching wedding-project-core's default.
assert.equal(selector.selectTemplate(project('urdu'), { type: 'nikah' }), 'formal-nikah-ur');
assert.equal(selector.DEFAULT_WORDING_TONE, 'formal');

// --- Design-palette suggestion (data mapping, not new art) ---
assert.deepEqual(Object.keys(selector.EVENT_DESIGN_PALETTES).sort(), ['baraat', 'mehndi', 'nikah', 'walima']);
assert.equal(selector.getDesignPalette('custom'), null, 'Custom events get no default palette, never a guessed one');

const nikahSuggestions = selector.suggestBackgroundCategory(project('urdu'), { type: 'nikah' });
assert.ok(Array.isArray(nikahSuggestions));
assert.deepEqual(nikahSuggestions, ['blush-rose-lanterns', 'maroon-wedding', 'rose-garden-frame'], 'Must cross-reference the existing wedding-tagged backgrounds, sorted for determinism');

const customSuggestions = selector.suggestBackgroundCategory(project('urdu'), { type: 'custom' });
assert.deepEqual(customSuggestions, [], 'An event type with no palette entry must return an empty suggestion, never a guessed one');

// The tone vocabulary must not silently drift across the three places it's duplicated
// (core.js's schema default, this file's own filter, and the registry's per-template
// formality tags) — if it does, selectTemplate would silently fall back to
// concise-whatsapp for everything with no test failing.
const core = require('../js/wedding-project-core.js');
assert.deepEqual(selector.WORDING_TONES, core.WORDING_TONES, 'wedding-template-selector.js tone vocabulary must match wedding-project-core.js exactly');
const registryFormalities = wording.TEMPLATES.map((t) => t.formality).filter((v, i, a) => a.indexOf(v) === i).sort();
assert.deepEqual(registryFormalities, ['concise', 'formal', 'informal'], 'every formality value used by the wording registry must be one of the three known tones');
