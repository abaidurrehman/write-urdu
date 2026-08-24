const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const writerVoice = read('js', 'writer-voice-input.js');
const writerVoiceCss = read('css', 'writer-voice-input.css');
const instagram = read('urdu-instagram-post-maker.html');
const whatsapp = read('urdu-whatsapp-status-maker.html');
const voiceOwner = read('tools', 'urdu-voice-typing.html');

assert.match(writerVoice, /Type, paste or speak Urdu\./, 'Embedded voice discovery must use plain task language.');
assert.match(writerVoice, /data-wu-voice-promoted/, 'Eligible input-mode controls must be marked for promoted Voice layout.');
assert.match(writerVoice, /function promoteControlBeforeTarget/, 'Creation workspaces must be able to move the input chooser before the writing field.');
assert.match(writerVoice, /insertBefore\(control, target\)/, 'Promoted input chooser must render before the text target when they share a parent.');
assert.match(writerVoice, /data-input-mode-option="direct"/, 'Speak Urdu must be positioned deliberately beside the existing typing methods.');
assert.match(writerVoice, /voice-exposed/, 'Voice exposure must be measurable without collecting content.');
assert.match(writerVoice, /voice-selected/, 'Voice method selection must be measurable without collecting content.');

assert.match(writerVoiceCss, /\.wu-voice-discovery-copy/, 'The first-view Voice helper needs dedicated visual styling.');
assert.match(writerVoiceCss, /\.wu-voice-method\s*\{[\s\S]*min-height:\s*38px/, 'Desktop Speak Urdu must be visually stronger than the old compact pill.');
assert.match(writerVoiceCss, /@media \(max-width: 767px\)[\s\S]*\.wu-voice-method[\s\S]*min-height:\s*48px/, 'Mobile Speak Urdu must become a large touch target.');
assert.match(writerVoiceCss, /flex:\s*1 1 100%/, 'Mobile Speak Urdu must be allowed to own a full row.');

for (const [name, page] of Object.entries({ instagram, whatsapp })) {
  assert.match(page, /speak Urdu/i, `${name} must expose voice capability in crawlable initial HTML.`);
  assert.match(page, /href="\/tools\/urdu-voice-typing"[^>]*>Urdu Voice Typing</, `${name} must link descriptively to the canonical Voice owner.`);
  assert.match(page, /js\/writer-voice-input\.js/, `${name} must keep the shared embedded Voice implementation.`);
}

assert.match(voiceOwner, /<title>Urdu Voice Typing — Speak Urdu to Text Online \| WriteUrdu<\/title>/, 'Voice owner title must remain stable during discovery rollout.');
assert.match(voiceOwner, /<h1[^>]*>Urdu Voice Typing<\/h1>/, 'Voice owner H1 must remain the canonical category owner.');
assert.match(voiceOwner, /rel="canonical" href="https:\/\/write-urdu\.com\/tools\/urdu-voice-typing"/, 'Voice owner canonical must remain unchanged.');

console.log('Voice Discovery Launch (WU-GROWTH-003A) contract passed.');
