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
const socialWorkspace = read('js/social-direct-workspace.js');

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
assert.match(cards, /data\.urduCardsWhatsappStatus = card\.id/, 'the existing one-tap WhatsApp Status export must remain available');

assert.match(socialWorkspace, /social-format-handoff-adapter\.js/, 'both social maker shells must load the shared format handoff adapter');
assert.ok(destination.indexOf('/js/card-background-registry.js') < destination.indexOf('/js/card-studio-background-library.js'), 'background registry must load before the background library');
assert.match(destination, /preview\.source\.workspace !== 'urdu-cards'/, 'destination import must be scoped to Urdu Cards');
assert.match(destination, /app\.updateObjectText\('text', text/, 'destination must restore text into the existing Card Studio engine');
assert.match(destination, /library\.applyById\(backgroundId\)/, 'destination must reuse the existing background library');
assert.match(destination, /'text-only'/, 'invalid or unavailable backgrounds must degrade to editable text rather than block the journey');
assert.doesNotMatch(destination, /localStorage\.setItem/, 'destination adapter must not create a second persistence layer');
assert.doesNotMatch(destination, /[?&](?:text|content|payload)=/i, 'destination adapter must not read or write card text through the URL');

console.log('Urdu Cards social-format handoff contract passed.');
