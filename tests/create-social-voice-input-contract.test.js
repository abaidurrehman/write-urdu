const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const cardStudio = read('urdu-card-studio.html');
const urduCardStudio = read('urdu', 'urdu-card-studio.html');
const whatsapp = read('urdu-whatsapp-status-maker.html');
const instagram = read('urdu-instagram-post-maker.html');
const stylish = read('stylish-urdu-text-generator.html');
const nameArt = read('urdu-name-art-maker.html');
const writerVoice = read('js', 'writer-voice-input.js');

const pages = {
  'urdu-card-studio.html': cardStudio,
  'urdu/urdu-card-studio.html': urduCardStudio,
  'urdu-whatsapp-status-maker.html': whatsapp,
  'urdu-instagram-post-maker.html': instagram,
  'stylish-urdu-text-generator.html': stylish,
  'urdu-name-art-maker.html': nameArt
};

for (const [name, page] of Object.entries(pages)) {
  assert.match(page, /js\/voice-input-core\.js/, `${name} must load the shared voice core`);
  assert.match(page, /js\/unified-urdu-input\.js/, `${name} must load the shared target/orchestration layer`);
  assert.match(page, /js\/writer-voice-input\.js/, `${name} must load the shared workspace voice mount`);
  assert.ok(
    page.indexOf('voice-input-core.js') < page.indexOf('unified-urdu-input.js') &&
      page.indexOf('unified-urdu-input.js') < page.indexOf('writer-voice-input.js'),
    `${name} must load voice core, then unified orchestration, then the workspace mount, in order`
  );
}

// Card Studio, WhatsApp Status and Instagram share the #cardText/.input-mode-control-card
// pipeline; voice must reuse it rather than inventing a per-route adapter.
assert.match(cardStudio, /id="cardText"/, 'Card Studio must keep the shared #cardText field voice targets');
assert.match(whatsapp, /data-social-direct-workspace="whatsapp"/, 'WhatsApp Status must keep its direct workspace container');
assert.match(instagram, /data-social-direct-workspace="instagram"/, 'Instagram must keep its direct workspace container');

assert.match(nameArt, /css\/input-mode\.css/, 'Name Art must load input-mode styling so the voice control renders correctly');

assert.match(writerVoice, /function mountInputModeTextTargets/, 'A generic input-mode-control voice mount is required for Card Studio/social/Stylish reuse');
assert.match(writerVoice, /function mountNameArt/, 'Name Art needs its own voice mount since it has no input-mode chooser');
assert.match(writerVoice, /mountInputModeTextTargets\(\)/, 'Boot must call the generic creation-tool voice mount');
assert.match(writerVoice, /mountNameArt\(\)/, 'Boot must call the Name Art voice mount');

assert.match(writerVoice, /createTextControlAdapter\(target\)/, 'Creation-tool voice must reuse the shared textarea adapter, not a bespoke Card Studio adapter');
assert.match(writerVoice, /data-input-mode-targets/, 'Creation-tool voice must resolve its target from the existing input-mode contract, not a hardcoded selector');
assert.doesNotMatch(writerVoice, /getElementById\(['"]cardText['"]\)/, 'Card Studio/social voice must not hardcode #cardText outside the shared adapter path');

assert.match(writerVoice, /card:\s*'card_studio'/, 'Card Studio workspace telemetry id is missing');
assert.match(writerVoice, /'whatsapp-status':\s*'whatsapp_status'/, 'WhatsApp Status workspace telemetry id is missing');
assert.match(writerVoice, /'instagram-post':\s*'instagram'/, 'Instagram workspace telemetry id is missing');
assert.match(writerVoice, /'stylish-text':\s*'stylish'/, 'Stylish Text workspace telemetry id is missing');
assert.match(writerVoice, /'name_art'/, 'Name Art workspace telemetry id is missing');

assert.match(writerVoice, /input-mode-control-rich/, 'Rich Editor must stay excluded from the generic mount so it keeps its TinyMCE-specific adapter');
assert.doesNotMatch(writerVoice, /SpeechRecognition|webkitSpeechRecognition|getUserMedia/, 'Creation-tool voice must not own a route-specific speech engine');

console.log('Create/Social voice rollout (WU-VOICE-PLAT-001C) contract passed.');
