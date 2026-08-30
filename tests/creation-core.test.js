const assert = require('node:assert/strict');
const cardCore = require('../js/card-studio-core.js');
const interaction = require('../js/card-studio-interaction-core.js');
const socialCore = require('../js/social-maker-core.js');
const templates = require('../js/template-library-core.js');

assert.ok(cardCore.PRESETS.length >= 4, 'Card Studio must retain its required output presets');
assert.ok(cardCore.TEMPLATES.length >= 9, 'Card Studio must retain its core design templates');
assert.ok(
  cardCore.calculateImagePlacement({ width: 1600, height: 800 }, { width: 1080, height: 1080 }, 'cover', 0.5, 0.5).width >= 1080,
  'Cover image placement must fill the target canvas'
);
assert.equal(cardCore.safeFilename('a/b:c', 'fallback'), 'a-b-c');
assert.equal(cardCore.createDefaultCardProject('').version, 2, 'Card projects must use the current direct-editing schema');
assert.ok(cardCore.normalizeCardProject({ version: 1, text: { value: 'old' } }).text.transform, 'Old card projects must migrate text transforms');

const transform = interaction.getPreviewTransform(
  { width: 1080, height: 1080 },
  { left: 20, top: 30, width: 540, height: 540 }
);
assert.deepEqual(
  interaction.clientPointToCardPoint({ x: 290, y: 300 }, transform),
  { x: 540, y: 540 },
  'Preview-to-canvas pointer conversion changed'
);
assert.deepEqual(
  interaction.resizeRect(
    { x: 100, y: 80, width: 300, height: 200 },
    'left',
    { x: 250, y: 0 },
    { minWidth: 120, maxWidth: 500 }
  ),
  { x: 280, y: 80, width: 120, height: 200 },
  'Card resize constraints changed'
);

assert.ok(templates.TEMPLATES.length >= 46, 'Template Library must retain at least the launch inventory');
const categoryMinimums = { poetry: 12, social: 8, religious: 8, education: 6, business: 6, events: 6 };
for (const [category, minimum] of Object.entries(categoryMinimums)) {
  assert.ok((templates.CATEGORY_COUNTS[category] || 0) >= minimum, `${category} template inventory fell below the launch minimum`);
}
assert.equal(
  Object.values(templates.CATEGORY_COUNTS).reduce((sum, count) => sum + count, 0),
  templates.TEMPLATES.length,
  'Template category counts must describe the current registry'
);
assert.deepEqual(templates.validateRegistry(templates.TEMPLATES), [], 'Template registry must remain internally valid');
const poetryTemplate = templates.getTemplateBySlug('quiet-morning-verse');
assert.ok(poetryTemplate, 'Template lookup by slug must keep working');

const withIncomingText = templates.applyToCardProject(
  cardCore,
  cardCore.createDefaultCardProject('سلام'),
  poetryTemplate
);
assert.equal(withIncomingText.libraryTemplateId, 'urdu-template-poetry-01');
assert.equal(withIncomingText.text.value, 'سلام', 'Applying a template must not overwrite incoming text');

const standalone = templates.applyToCardProject(
  cardCore,
  cardCore.createDefaultCardProject(''),
  poetryTemplate,
  { useSampleText: true }
);
assert.equal(standalone.text.value, 'آج کا دن ایک نئی شروعات ہے۔', 'Standalone template starts must provide sample Urdu text');

assert.equal(socialCore.getMode('whatsapp').defaultPreset, 'story', 'WhatsApp Status must default to Story');
assert.equal(socialCore.getMode('instagram').defaultPreset, 'square', 'Instagram Post must default to Square');
assert.equal(
  socialCore.getSafeArea('instagram', { id: 'portrait', width: 1080, height: 1350 }).top,
  120,
  'Instagram portrait safe area changed'
);
assert.equal(
  socialCore.evaluateSafeArea(
    { text: { x: 0, y: 0, width: 100, height: 100 } },
    { width: 1080, height: 1920 },
    { top: 100, right: 100, bottom: 100, left: 100 }
  ).valid,
  false,
  'Unsafe social content must be detected'
);

console.log('Creation core tests passed.');
