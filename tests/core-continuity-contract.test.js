const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const Registry = require('../js/workspace-journey-registry.js');

const continuity = read('js/core-continuity.js');
const main = read('main.js');
const journey = read('js/card-studio-entry.js');
const cleaner = read('js/urdu-text-cleaner.js');
const textHandoff = read('js/text-handoff.js');

assert.deepEqual(Registry.validate(), [], 'workspace registry must remain internally valid');
const cleanerDescriptor = Registry.get('text-cleaner');
assert.ok(cleanerDescriptor.next.some(edge => edge.id === 'cleaner-to-qr' && edge.target === 'qr-generator' && edge.type === 'transformation'), 'Cleaner → QR must be governed by the workspace registry');

assert.match(continuity, /CORE_SOURCES = \['basic-writer', 'urdu-keyboard', 'rich-editor', 'text-cleaner'\]/, 'Slice C must be limited to the approved core sources');
assert.match(continuity, /function fullPlainText\(/, 'continuity needs a whole-document reader for source preservation');
assert.match(continuity, /function currentPlainText\(/, 'continuity needs a selection-aware handoff reader');
assert.match(continuity, /preserveSourceDraft\(sourceWorkspace\)/, 'source drafts must be preserved before navigation');
assert.match(continuity, /var text = fullPlainText\(\);/, 'draft preservation must use the whole document, not the selected handoff text');
assert.match(continuity, /editor\.selection\.getContent\(\{ format: 'text' \}\)/, 'Rich Editor handoff should prefer selected text');
assert.match(continuity, /Handoff\.transfer\(\{/, 'core paths must use the shared v2 handoff runtime');
assert.match(continuity, /actionId: actionId\(sourceWorkspace, targetWorkspace\)/, 'v2 handoffs must retain registry action ownership');
assert.match(continuity, /LEGACY_QR_KEY = 'writeUrdu\.qrGenerator\.incoming'/, 'QR compatibility bridge must target the proven QR consumer key');
assert.match(continuity, /targetWorkspace === 'qr-generator' && !mirrorQrLegacy/, 'QR transfer must fail closed if its compatibility mirror cannot be written');
assert.match(continuity, /document\.addEventListener\('click', onClick, true\)/, 'core continuity must capture approved actions before legacy bubble handlers');
assert.match(continuity, /event\.stopImmediatePropagation\(\)/, 'captured v2 actions must not also run a legacy producer');
assert.match(continuity, /data-wu-continuity-target="rich-editor"/, 'Cleaner must expose a document-formatting continuation');
assert.match(continuity, /data-wu-continuity-target="card-studio"/, 'Cleaner must expose a Card continuation');
assert.match(continuity, /data-wu-continuity-target="qr-generator"/, 'Cleaner and Keyboard must expose QR continuity');
assert.match(continuity, /Continue writing/, 'Cleaner’s primary continuation must use outcome language');
assert.doesNotMatch(continuity, /[?&](?:text|content|payload)=/, 'user text must never be serialized into a URL');
assert.doesNotMatch(continuity, /CustomEvent|dispatchEvent\([^)]*text/s, 'Slice C must not create telemetry events containing user text');

const registryIndex = main.indexOf("loadScript('js/workspace-journey-registry.js'");
const handoffIndex = main.indexOf("loadScript('js/workspace-handoff.js'");
const continuityIndex = main.indexOf("loadScript('js/core-continuity.js'");
assert.ok(registryIndex >= 0 && handoffIndex > registryIndex && continuityIndex > handoffIndex, 'Basic/Keyboard loader order must be registry → handoff → continuity');
assert.match(main, /path === '\/'/, 'Basic Writer must load the continuity runtime');
assert.match(main, /'\/urdu-keyboard'/, 'Urdu Keyboard must load the continuity runtime');
assert.match(main, /loadScript\('js\/card-studio-entry\.js'/, 'Keyboard must retain existing Card journey behavior after the continuity runtime loads');
assert.match(main, /loadScript\('js\/qr-generator-entry\.js'/, 'Keyboard must retain the QR entry fallback after the continuity runtime loads');

assert.match(journey, /ensureCoreContinuityForRich/, 'Rich Editor must load Slice C without changing its legacy HTML shell');
assert.match(journey, /workspace-journey-registry\.js/, 'Rich loader must include the registry');
assert.match(journey, /workspace-handoff\.js/, 'Rich loader must include the v2 handoff runtime');
assert.match(journey, /core-continuity\.js/, 'Rich loader must include the continuity layer');

assert.match(cleaner, /ensureCoreContinuity/, 'Cleaner must load Slice C without changing its existing page contract');
assert.match(cleaner, /workspace-journey-registry\.js/, 'Cleaner loader must include the registry');
assert.match(cleaner, /workspace-handoff\.js/, 'Cleaner loader must include the v2 handoff runtime');
assert.match(cleaner, /core-continuity\.js/, 'Cleaner loader must include the continuity layer');

assert.match(textHandoff, /BASIC_HISTORY_KEY = 'write-urdu:history:v1:basic'/, 'Basic destination recovery must use the existing local-history key');
assert.match(textHandoff, /preserveBasicBeforeImport\(target\)/, 'Basic Writer must preserve prior work before imported text replaces the editor');
assert.match(textHandoff, /discardV2\('basic-writer'\)/, 'successful Basic import must clear the consumed v2 envelope');

console.log('Core Write/Fix continuity contract passed.');
