const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const registry = require('../js/card-background-registry.js');
const journey = require('../js/workspace-journey-registry.js');
const core = require('../js/card-gallery-core.js');

const html = read('urdu-card-gallery.html');
const gallery = read('js/card-gallery.js');
const adapter = read('js/card-studio-handoff-adapter.js');
const backgroundLibrary = read('js/card-studio-background-library.js');
const telemetry = read('js/product-telemetry.js');
const endpoint = read('functions/api/events.js');
const migration = read('migrations/0022_card_gallery_funnel.sql');

assert.strictEqual(core.preserveText('  دعا\r\nCODE-27  '), '  دعا\nCODE-27  ', 'handoff text must preserve whitespace and line breaks');
assert.ok(journey.get('card-gallery').next.some(edge => edge.id === 'gallery-to-card' && edge.target === 'card-studio' && edge.payloadKind === 'visual-project-seed'));
assert.ok(html.indexOf('/js/workspace-journey-registry.js') < html.indexOf('/js/workspace-handoff.js'));
assert.ok(html.indexOf('/js/workspace-handoff.js') < html.indexOf('/js/card-gallery.js'));
assert.match(gallery, /payload: \{ text: state\.text, backgroundId: background\.id \}/);
assert.match(gallery, /sourceWorkspace: 'card-gallery'/);
assert.match(gallery, /kind: 'visual-project-seed'/);
assert.match(gallery, /trackContinuationPath\('selected', pathDetail\)/);
assert.match(gallery, /trackContinuationPath\('handoff_created', pathDetail\)/);
assert.doesNotMatch(gallery, /[?&](?:text|content|payload)=/i, 'Gallery must not put writing in URL transport');
assert.match(backgroundLibrary, /function applyById\(backgroundId\)/);
assert.match(backgroundLibrary, /return applyBackground\(background, button\)/, 'Gallery handoff must reuse the existing background application path');
assert.match(adapter, /kind === 'visual-project-seed'/);
assert.match(adapter, /app\.updateObjectText\('text', text, \{ save: false \}\)/);
assert.match(adapter, /data-wu-card-seed-applied', result && result\.ok \? 'live' : 'text-only'/, 'invalid backgrounds must not claim live application');

[
  'card_gallery_previews_visible', 'card_gallery_first_input', 'card_gallery_category_used',
  'card_gallery_design_selected', 'card_gallery_handoff_started', 'card_gallery_destination_ready'
].forEach(event => assert.ok(endpoint.includes(`'${event}'`), `missing bounded event ${event}`));
registry.getAllBackgrounds().forEach(background => assert.ok(endpoint.includes(`'${background.id}'`), `telemetry allowlist missing ${background.id}`));
assert.match(telemetry, /background_id: detail\.background_id \|\| null/);
assert.match(endpoint, /CARD_GALLERY_CATEGORIES = new Set/);
assert.match(endpoint, /card_gallery_hourly_funnel/);
assert.match(migration, /card_gallery_hourly_funnel/);
assert.doesNotMatch(migration, /^\s*(?:text|content|transcript|roman_source|image_bytes)\s+/im, 'Gallery rollup must never store writing or rendered content');

console.log('Card Gallery Slice 2 handoff and telemetry contract passed.');
