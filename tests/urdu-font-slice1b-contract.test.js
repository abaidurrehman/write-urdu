const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const registry = require('../js/urdu-font-registry.js');
const core = require('../js/card-studio-core.js');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

const cardAdapter = read('js/urdu-font-card-convergence.js');
const tinyAdapter = read('js/urdu-font-tinymce-adapter.js');
const cardCoreSource = read('js/card-studio-core.js');
const entry = read('js/card-studio-entry.js');
const legacyEntry = read('js/card-studio-entry-legacy.js');
const home = read('index.html');
const editorFeatures = read('urdu-editor-features.html');

const creation = ['noto-nastaliq-urdu', 'noto-naskh-arabic', 'amiri', 'lateef', 'scheherazade-new', 'tajawal'];
assert.deepStrictEqual(registry.getForCapability('card-studio', { webOnly: true, excludeCandidates: true }).map(item => item.id), creation);
assert.deepStrictEqual(registry.getForCapability('name-art', { webOnly: true, excludeCandidates: true }).map(item => item.id), creation);
assert.deepStrictEqual(registry.getForCapability('editor', { webOnly: true, excludeCandidates: true }).map(item => item.id), [
  'noto-nastaliq-urdu', 'noto-naskh-arabic', 'amiri', 'lateef', 'scheherazade-new', 'tajawal', 'harmattan', 'katibeh'
]);
assert.strictEqual(registry.resolveId('Scheherazade'), 'scheherazade-new');
assert.strictEqual(core.normalizeFontFamily('Scheherazade'), 'Scheherazade New', 'legacy Card Studio projects must still normalize Scheherazade');

assert.match(cardCoreSource, /\/js\/urdu-font-registry\.js/, 'creation core must bootstrap shared font registry');
assert.match(cardCoreSource, /\/js\/urdu-font-card-convergence\.js/, 'creation core must bootstrap convergence adapter');
assert.match(cardCoreSource, /window\.WriteUrduFontRegistry/, 'Card Studio normalizer should prefer governed registry when available');

assert.match(cardAdapter, /getForCapability\(capability\(\), \{ webOnly: true, excludeCandidates: true \}\)/, 'creation selector must come from registry capability');
assert.match(cardAdapter, /value\.createLoader\(\{ document: root\.document \}\)/, 'creation surfaces must use strict shared loader');
assert.match(cardAdapter, /data-card-action=\\"download\\"/, 'download must be guarded by strict font preflight');
assert.match(cardAdapter, /data-name-art-transparent/, 'transparent Name Art export must be guarded by strict font preflight');
assert.match(cardAdapter, /event\.stopImmediatePropagation\(\)/, 'font selection guard must prevent permissive legacy handler from racing the verified load');
assert.doesNotMatch(cardAdapter, /Jameel|Mehr Nastaliq|AlQalam|Sameer|Gandhara/, 'convergence adapter must not special-case license-review candidates');

assert.match(tinyAdapter, /getForCapability\('editor', \{ webOnly: true, excludeCandidates: true \}\)/, 'TinyMCE Urdu families must come from editor capability');
assert.match(tinyAdapter, /editor\.getDoc\(\)/, 'TinyMCE web fonts must load into the editor iframe document');
for (const systemFont of ['Arial', 'Courier New', 'Georgia', 'Tahoma', 'Times New Roman', 'Verdana']) assert.match(tinyAdapter, new RegExp(systemFont.replace(/ /g, '\\s*')));
assert.match(tinyAdapter, /Qadreeregular/, 'adapter must explicitly remove the stale Qadreeregular sample');
assert.match(tinyAdapter, /Scheherazade New/, 'adapter must normalize the visible Scheherazade sample');

assert.match(entry, /\/js\/urdu-font-registry\.js/, 'Rich Editor entry must load shared font registry');
assert.match(entry, /\/js\/urdu-font-tinymce-adapter\.js/, 'Rich Editor entry must load TinyMCE font adapter');
assert.match(entry, /\/js\/card-studio-entry-legacy\.js/, 'font convergence wrapper must delegate to unchanged journey runtime');
assert.match(legacyEntry, /WriteUrduJourneyHandoffs/, 'legacy authoring journey runtime must remain intact');
assert.match(legacyEntry, /consumeRichHandoff/, 'Rich Editor handoff behavior must remain intact');
assert.match(legacyEntry, /renderJourneyPanel/, 'authoring journey UI behavior must remain intact');

assert.doesNotMatch(home, /urdu-font-registry\.js|urdu-font-card-convergence\.js|urdu-font-tinymce-adapter\.js/, 'Basic Writer must not pay font-registry runtime cost globally');
assert.match(editorFeatures, /Available Urdu-friendly fonts/, 'public formatting guide remains the documentation owner for editor font choices');
assert.doesNotMatch(read('sitemap.xml'), /\/urdu-fonts(?:<|\s)/, 'Slice 1B must not launch the future /urdu-fonts route');

console.log('WU-FONT-001 Slice 1B contract passed: Card Studio, Name Art and Rich Editor converge on the shared registry without launching new fonts or routes.');
