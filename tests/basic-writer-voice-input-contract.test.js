const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const home = read('index.html');
const urduHome = read('urdu', 'index.html');
const toolbar = read('js', 'basic-writer-command-toolbar.js');
const unified = read('js', 'unified-urdu-input.js');
const core = read('js', 'voice-input-core.js');
const css = read('css', 'basic-writer-command-toolbar.css');
const mobileCss = read('css', 'mobile-home-task-first.css');
const serviceWorker = read('sw.js');

for (const page of [home, urduHome]) {
  assert.match(page, /js\/voice-input-core\.js/, 'Basic Writer must load the shared voice core');
  assert.match(page, /js\/unified-urdu-input\.js/, 'Basic Writer must load the shared target/orchestration layer');
  assert.ok(page.indexOf('voice-input-core.js') < page.indexOf('unified-urdu-input.js'), 'Voice core must load before unified orchestration');
}

assert.match(toolbar, /createVoiceInputController\(/, 'Basic Writer must mount shared voice orchestration');
assert.match(toolbar, /WriteUrduLocaleRoute[\s\S]*productPath/, 'Basic Writer voice must mount on both English and Urdu locale routes');
assert.match(toolbar, /createTextControlAdapter\(editor\)/, 'Voice must target the real Basic Writer textarea adapter');
assert.match(toolbar, /data-wu-basic-voice-method/, 'Compact Speak Urdu method control is missing');
assert.match(toolbar, /data-wu-basic-voice-start/, 'Explicit Start voice action is missing');
assert.match(toolbar, /data-wu-basic-voice-stop/, 'Explicit Stop voice action is missing');
assert.doesNotMatch(toolbar, /data-wu-voice-entry="home"/, 'Compact toggle must not remove the homepage voice discovery banner; both stay');
assert.doesNotMatch(toolbar, /SpeechRecognition|webkitSpeechRecognition|getUserMedia/, 'Basic Writer must not own a route-specific speech engine');
assert.doesNotMatch(toolbar, /createElement\(['"]textarea['"]\)|voiceTranscript/, 'Basic Writer must not create a separate voice transcript field');
assert.match(toolbar, /'voice-error':\s*'voice_error'/, 'Basic Writer voice must map failure to the bounded voice_error event (WU-VOICE-PLAT-001D §7)');
assert.match(toolbar, /onError:\s*function\s*\(category\)\s*\{\s*if\s*\(category === 'aborted'\) return;\s*telemetry\('voice-error', category\);/, 'Basic Writer voice must report non-abort recognition failures for the Product Pulse failure-category breakdown');

assert.match(toolbar, /AUTO_VOICE_PARAM = 'wu-voice'/, 'My Documents "Start with voice" handoff must use the shared auto-open flag');
assert.match(toolbar, /function openVoicePanelIfRequested/, 'Incoming voice handoff must only open the panel, never auto-start listening');
assert.match(toolbar, /history\.replaceState\(/, 'Auto-open flag must be consumed once and stripped from the URL');
assert.doesNotMatch(toolbar, /openVoicePanelIfRequested[\s\S]{0,400}voiceController\.start\(\)/, 'Auto-open must never call voiceController.start() itself, so no microphone permission is requested on load');

assert.match(unified, /function createVoiceInputController/, 'Shared unified layer must own embedded voice orchestration');
assert.match(unified, /adapter\.insertText\(value\)/, 'Final speech must commit through the workspace adapter');
assert.match(unified, /elements\.startButton\.addEventListener\('click', startClick\)/, 'Recognition must start only from explicit Start action');
assert.doesNotMatch(unified, /fetch\s*\(|XMLHttpRequest|sendBeacon|\/api\//, 'Shared embedded voice must not send writing content to a network sink');
assert.match(core, /if \(!recognition\) recognition = configureRecognition\(\)/, 'Recognition construction must remain lazy until Start');

assert.match(css, /\.wu-basic-voice-method/, 'Compact voice method styling is missing');
assert.match(css, /\.wu-basic-voice-panel/, 'Bounded voice state styling is missing');
assert.match(css, /min-height:\s*44px/, 'Embedded mic controls need mobile-sized targets');
assert.match(css, /@media \(max-width: 767px\)/, 'Embedded voice needs Pixel/mobile layout rules');
assert.match(mobileCss, /grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/, 'Phone input chooser must fit all three methods without overlap');
assert.match(mobileCss, /flex:\s*0 0 100% !important/, 'Phone input chooser must own a full toolbar row');
assert.match(mobileCss, /min-height:\s*44px !important/, 'Phone input methods need full touch targets');

assert.match(serviceWorker, /write-urdu-shell-v34/, 'PWA cache must refresh for embedded voice assets');
assert.match(serviceWorker, /\.\/js\/voice-input-core\.js/, 'Shared voice core must be cached');
assert.match(serviceWorker, /\.\/js\/unified-urdu-input\.js/, 'Unified input layer must be cached');

console.log('Basic Writer shared voice input contract passed.');
