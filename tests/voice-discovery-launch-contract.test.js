const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const writerVoice = read('js', 'writer-voice-input.js');
const writerVoiceCss = read('css', 'writer-voice-input.css');
const discoveryCss = read('css', 'voice-discovery.css');
const home = read('index.html');
const urduHome = read('urdu', 'index.html');
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

for (const [name, page] of Object.entries({ home, urduHome })) {
  assert.match(page, /css\/voice-discovery\.css/, `${name} must load the first-view Voice discovery styling without waiting for JavaScript.`);
  assert.match(page, /data-wu-voice-entry="home"/, `${name} must contain a source-visible homepage Voice entry.`);
}

assert.match(home, /href="\/tools\/urdu-voice-typing"/, 'English homepage must link directly to the canonical English Voice owner.');
assert.match(home, />Urdu Voice Typing<\/a>|>Urdu Voice Typing<\/h3>|>Urdu Voice Typing</, 'English homepage must expose the Urdu Voice Typing category in crawlable text.');
assert.match(home, /<title>English to Urdu Typing Online \| WriteUrdu<\/title>/, 'Homepage title ownership must remain English to Urdu Typing.');
assert.match(home, /<h1[^>]*>English to Urdu Typing Online<\/h1>/, 'Homepage H1 ownership must remain English to Urdu Typing.');

assert.match(urduHome, /href="\/urdu\/tools\/urdu-voice-typing"/, 'Urdu homepage must link to the Urdu Voice owner.');
assert.match(urduHome, /اردو وائس ٹائپنگ|آواز سے اردو لکھیں/, 'Urdu homepage must expose a natural Urdu Voice query phrase in initial HTML.');
assert.match(urduHome, /<h1[^>]*>انگریزی حروف سے اردو ٹائپ کریں<\/h1>/, 'Urdu homepage H1 ownership must remain English-letter Urdu typing.');

assert.match(discoveryCss, /\.wu-voice-entry-home/, 'Homepage Voice entry styling is missing.');
assert.match(discoveryCss, /\.wu-basic-input-mode \.wu-basic-voice-method/, 'Basic Writer embedded Voice must receive the promoted method treatment.');
assert.match(discoveryCss, /@media \(max-width: 760px\)[\s\S]*\.wu-basic-input-mode \.wu-basic-voice-method[\s\S]*min-height:\s*48px/, 'Basic Writer Voice must become a full mobile touch target.');

assert.match(voiceOwner, /<title>Urdu Voice Typing — Speak Urdu to Text Online \| WriteUrdu<\/title>/, 'Voice owner title must remain stable during discovery rollout.');
assert.match(voiceOwner, /<h1[^>]*>Urdu Voice Typing<\/h1>/, 'Voice owner H1 must remain the canonical category owner.');
assert.match(voiceOwner, /rel="canonical" href="https:\/\/write-urdu\.com\/tools\/urdu-voice-typing"/, 'Voice owner canonical must remain unchanged.');

console.log('Voice Discovery Launch (WU-GROWTH-003A/003B1) contract passed.');
