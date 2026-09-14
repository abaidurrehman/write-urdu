const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const registry = require('../js/urdu-font-registry.js');
const core = require('../js/card-studio-core.js');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

const cardAdapter = read('js/urdu-font-card-convergence.js');
const tinyAdapter = read('js/urdu-font-tinymce-adapter.js');
const interactionCore = read('js/card-studio-interaction-core.js');
const entry = read('js/card-studio-entry.js');
const home = read('index.html');
const editorFeatures = read('urdu-editor-features.html');

const creation = ['noto-nastaliq-urdu', 'noto-naskh-arabic', 'amiri', 'lateef', 'scheherazade-new', 'tajawal'];
assert.deepStrictEqual(registry.getForCapability('card-studio', { webOnly: true, excludeCandidates: true }).map(item => item.id), creation);
assert.deepStrictEqual(registry.getForCapability('name-art', { webOnly: true, excludeCandidates: true }).map(item => item.id), creation);
assert.deepStrictEqual(registry.getForCapability('editor', { webOnly: true, excludeCandidates: true }).map(item => item.id), [
  'noto-nastaliq-urdu', 'noto-naskh-arabic', 'amiri', 'lateef', 'tajawal', 'harmattan', 'katibeh'
], 'Slice 1 registry remains byte-stable; the historic Scheherazade editor bridge belongs to the adapter');
assert.strictEqual(registry.resolveId('Scheherazade'), 'scheherazade-new');
assert.strictEqual(core.normalizeFontFamily('Scheherazade'), 'Scheherazade New', 'legacy Card Studio projects must still normalize Scheherazade');

assert.match(interactionCore, /\/js\/urdu-font-registry\.js/, 'shared creation interaction core must bootstrap font registry');
assert.match(interactionCore, /\/js\/urdu-font-card-convergence\.js/, 'shared creation interaction core must bootstrap convergence adapter');

assert.match(cardAdapter, /getForCapability\(currentCapability, \{ webOnly: true, excludeCandidates: true \}\)/, 'creation selector must come from the resolved registry capability');
assert.match(cardAdapter, /classList\.contains\('name-art-page'\)/, 'font convergence must recognize Name Art explicitly');
assert.match(cardAdapter, /classList\.contains\('card-studio-page'\)/, 'font convergence must recognize Card Studio explicitly');
assert.doesNotMatch(cardAdapter, /social-maker-page/, 'social makers must not be pulled into Slice 1B font convergence');
assert.match(cardAdapter, /value\.createLoader\(\{ document: root\.document \}\)/, 'creation surfaces must use the shared font loader');
assert.match(cardAdapter, /record\.licenseStatus !== 'approved-web'/, 'unknown or unapproved fonts must still fail closed');
assert.match(cardAdapter, /DELIVERY_FAILURE_CODES/, 'approved font delivery failures must be classified separately from approval failures');
assert.match(cardAdapter, /data-wu-font-delivery/, 'degraded approved-font delivery must be surfaced explicitly');
assert.match(cardAdapter, /browser may use a fallback font/, 'degraded delivery must not pretend the named font rendered successfully');
assert.match(cardAdapter, /LOAD_DEADLINE_MS = 3000/, 'font delivery verification must be bounded instead of hanging export');
assert.match(cardAdapter, /\[data-card-action="download"\]/, 'download must be guarded by font preflight');
assert.match(cardAdapter, /data-name-art-transparent/, 'transparent Name Art export must be guarded by font preflight');
assert.match(cardAdapter, /event\.stopImmediatePropagation\(\)/, 'font selection guard must prevent permissive legacy handler from racing the verified load');
assert.doesNotMatch(cardAdapter, /Jameel|Mehr Nastaliq|AlQalam|Sameer|Gandhara/, 'convergence adapter must not special-case license-review candidates');

assert.match(tinyAdapter, /getForCapability\('editor', \{ webOnly: true, excludeCandidates: true \}\)/, 'TinyMCE starts from registry editor capability');
assert.match(tinyAdapter, /value\.get\('scheherazade-new'\)/, 'historic Rich Editor Scheherazade choice must resolve through the governed registry');
assert.match(tinyAdapter, /record\.id === 'scheherazade-new'/, 'Scheherazade New is the bounded compatibility bridge, not a second font definition');
assert.match(tinyAdapter, /editor\.getDoc\(\)/, 'TinyMCE web fonts must load into the editor iframe document');
for (const systemFont of ['Arial', 'Courier New', 'Georgia', 'Tahoma', 'Times New Roman', 'Verdana']) assert.match(tinyAdapter, new RegExp(systemFont.replace(/ /g, '\\s*')));
assert.match(tinyAdapter, /Qadreeregular/, 'adapter must explicitly remove the stale Qadreeregular sample');
assert.match(tinyAdapter, /Scheherazade New/, 'adapter must normalize the visible Scheherazade sample');

assert.match(entry, /function ensureRichFontConvergence\(\)/, 'Rich Editor journey entry must own the narrow font-runtime bootstrap');
assert.match(entry, /\/js\/urdu-font-registry\.js/, 'Rich Editor entry must load shared font registry only for the rich route');
assert.match(entry, /\/js\/urdu-font-tinymce-adapter\.js/, 'Rich Editor entry must load TinyMCE font adapter');
assert.match(entry, /handoff && typeof handoff\.peek === 'function' \? handoff\.peek\('rich-editor'\) : null/, 'Rich destination must still inspect v2 state before legacy fallback');
assert.match(entry, /incoming = readOneTimeHandoff\('rich'\)/, 'Rich destination must retain legacy fallback after the v2 check');
assert.match(entry, /WriteUrduJourneyHandoffs/, 'authoring journey runtime must remain in its historical entry file');
assert.match(entry, /consumeRichHandoff/, 'Rich Editor handoff behavior must remain intact');
assert.match(entry, /renderJourneyPanel/, 'authoring journey UI behavior must remain intact');

assert.doesNotMatch(home, /urdu-font-registry\.js|urdu-font-card-convergence\.js|urdu-font-tinymce-adapter\.js/, 'Basic Writer HTML must not directly pay font-registry runtime cost');
assert.match(editorFeatures, /Available Urdu-friendly fonts/, 'public formatting guide remains the documentation owner for editor font choices');
assert.doesNotMatch(read('sitemap.xml'), /\/urdu-fonts(?:<|\s)/, 'Slice 1B must not launch the future /urdu-fonts route');

console.log('WU-FONT-001 Slice 1B contract passed: governed fonts converge without making approved-font delivery outages break browser-local creation.');
