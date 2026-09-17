const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const registry = require('../js/workspace-journey-registry.js');

const cards = read('js/urdu-cards.js');
const returning = read('js/urdu-cards-returning-state.js');
const source = read('js/urdu-cards-social-formats.js');
const destination = read('js/social-format-handoff-adapter.js');
const cardDestination = read('js/card-studio-handoff-adapter.js');
const socialWorkspace = read('js/social-direct-workspace.js');
const continuity = read('js/create-format-continuity.js');

assert.ok(registry.accepts('whatsapp-status', 'plain-text'), 'WhatsApp Status must keep accepting the shared plain-text handoff');
assert.ok(registry.accepts('instagram-post', 'plain-text'), 'Instagram Post must keep accepting the shared plain-text handoff');
assert.match(returning, /urdu-cards-social-formats\.js/, 'Urdu Cards progressive enhancement must load social format presets');
assert.match(source, /dataset\.urduCardsFormatPresets/, 'each card should expose a social-format preset group');
assert.match(source, /targetWorkspace: targetWorkspace/, 'format choices must reuse the shared workspace handoff');
assert.match(source, /kind: 'plain-text'/, 'social makers should receive their already-supported plain-text payload');
assert.match(source, /backgroundId: card\.backgroundId/, 'selected design background must travel as bounded handoff context');
assert.match(source, /transfer\(cardData\(id\), 'whatsapp-status'/, 'WhatsApp format must target the dedicated maker');
assert.match(source, /transfer\(cardData\(id\), 'instagram-post'/, 'Instagram format must target the dedicated maker');
assert.doesNotMatch(source, /[?&](?:text|content|payload)=/i, 'card text must never be transported in the URL');
assert.doesNotMatch(source, /localStorage\.setItem/, 'format selection must not persist card text to localStorage');
assert.doesNotMatch(source, /fetch\(/, 'source format selection must not introduce a server call');
assert.match(cards, /dataset\.urduCardsWhatsappStatus = card\.id/, 'the existing one-tap WhatsApp Status export must remain available');

assert.match(socialWorkspace, /social-format-handoff-adapter\.js/, 'both social maker shells must load the shared format handoff adapter');
assert.ok(destination.indexOf('/js/card-background-registry.js') < destination.indexOf('/js/card-studio-background-library.js'), 'background registry must load before the background library');
assert.match(destination, /preview\.source\.workspace !== 'urdu-cards'/, 'original Cards import must remain explicitly scoped to Urdu Cards');
assert.match(destination, /app\.updateObjectText\('text', text/, 'original Cards import must restore text into the existing Card Studio engine');
assert.match(destination, /library\.applyById\(backgroundId\)/, 'original Cards import must reuse the existing background library');
assert.match(destination, /core\.normalizeCardProject\(JSON\.parse\(JSON\.stringify\(project\)\)\)/, 'social destinations must restore the shared Card Studio project model');
assert.match(destination, /core\.applyPreset\(next, config\.defaultPreset\)/, 'social destinations must adapt only the output preset for their format');
assert.match(destination, /creationFormatContinuity/, 'social destination restoration must require the bounded continuity context');
assert.match(destination, /'text-only'/, 'invalid or unavailable original backgrounds must degrade to editable text rather than block the journey');
assert.doesNotMatch(destination, /localStorage\.setItem/, 'destination adapter must not create a second persistence layer');
assert.doesNotMatch(destination, /[?&](?:text|content|payload)=/i, 'destination adapter must not read or write card text through the URL');

assert.match(cardDestination, /PROJECT_CONTINUITY_SOURCES/, 'Card Studio must explicitly bound social workspaces allowed to restore a shared project');
assert.match(cardDestination, /core\.normalizeCardProject\(JSON\.parse\(JSON\.stringify\(project\)\)\)/, 'Card Studio must restore the compatible project model without a second renderer');
assert.match(cardDestination, /restored\.socialMode = null/, 'returning to Card Studio must leave social role mode');
assert.match(cardDestination, /create-format-continuity\.js/, 'Card Studio must load the shared creation shell');
assert.match(destination, /create-format-continuity\.js/, 'social makers must load the same creation shell');

assert.match(continuity, /data-create-format-continuity/, 'shared creation shell must expose one stable UI marker');
assert.match(continuity, /'card-studio'/, 'shared creation shell must include Card Studio');
assert.match(continuity, /'whatsapp-status'/, 'shared creation shell must include WhatsApp Status');
assert.match(continuity, /'instagram-post'/, 'shared creation shell must include Instagram Post');
assert.match(continuity, /project: project/, 'format switches must carry the current shared project snapshot');
assert.match(continuity, /continuityVersion: 1/, 'project continuity payload must be versioned');
assert.match(continuity, /kind: 'plain-text'/, 'continuity must stay inside the already accepted bounded handoff kind');
assert.match(continuity, /creationFormatContinuity: true/, 'continuity handoffs must be explicitly marked');
assert.doesNotMatch(continuity, /localStorage\.setItem|sessionStorage\.setItem/, 'shared shell must rely on workspace handoff rather than create another persistence layer');
assert.doesNotMatch(continuity, /fetch\(/, 'shared shell must not introduce a server call');
assert.doesNotMatch(continuity, /[?&](?:text|content|payload|project)=/i, 'shared shell must never place project content in the URL');

console.log('Urdu Cards social-format handoff and shared creation continuity contract passed.');
