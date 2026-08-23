const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const richEditor = read('urdu-editor.html');
const urduRichEditor = read('urdu', 'urdu-editor.html');
const keyboard = read('urdu-keyboard.html');
const urduKeyboard = read('urdu', 'urdu-keyboard.html');
const writerVoice = read('js', 'writer-voice-input.js');
const css = read('css', 'writer-voice-input.css');
const serviceWorker = read('sw.js');

for (const page of [richEditor, urduRichEditor, keyboard, urduKeyboard]) {
  assert.match(page, /js\/voice-input-core\.js/, 'Page must load the shared voice core');
  assert.match(page, /js\/unified-urdu-input\.js/, 'Page must load the shared target/orchestration layer');
  assert.match(page, /js\/writer-voice-input\.js/, 'Page must load the Rich Editor/Keyboard voice mount');
  assert.ok(page.indexOf('voice-input-core.js') < page.indexOf('unified-urdu-input.js'), 'Voice core must load before unified orchestration');
  assert.ok(page.indexOf('unified-urdu-input.js') < page.indexOf('writer-voice-input.js'), 'Unified orchestration must load before the writer voice mount');
}

assert.match(writerVoice, /createVoiceInputController\(/, 'Writer voice mount must use shared voice orchestration');
assert.match(writerVoice, /createTextControlAdapter\(/, 'Urdu Keyboard voice must target the shared textarea adapter');
assert.match(writerVoice, /editor\.insertContent\(/, 'Rich Editor voice must insert through the TinyMCE selection-aware API');
assert.match(writerVoice, /tinymce\.get\(['"]basic-example['"]\)/, 'Rich Editor voice must bind to the real document editor, not a side transcript');
assert.match(writerVoice, /input-mode-control-rich/, 'Rich Editor voice must mount into the existing input-mode chooser, not a new one');
assert.match(writerVoice, /\.keyboard-actions/, 'Urdu Keyboard voice must mount near the existing keyboard toolbar');
assert.doesNotMatch(writerVoice, /SpeechRecognition|webkitSpeechRecognition|getUserMedia/, 'Writer voice mount must not own a route-specific speech engine');
assert.doesNotMatch(writerVoice, /createElement\(['"]textarea['"]\)|voiceTranscript/, 'Writer voice mount must not create a separate transcript field');

assert.match(css, /\.wu-voice-panel/, 'Voice panel styling is missing');
assert.match(css, /\.wu-voice-action/, 'Voice start/stop action styling is missing');
assert.match(css, /min-height:\s*44px/, 'Voice controls need mobile-sized touch targets');

assert.match(serviceWorker, /write-urdu-shell-v31/, 'PWA cache must refresh for the Rich Editor/Keyboard voice assets');
assert.match(serviceWorker, /\.\/js\/writer-voice-input\.js/, 'Writer voice mount must be cached');
assert.match(serviceWorker, /\.\/css\/writer-voice-input\.css/, 'Writer voice styling must be cached');

console.log('Rich Editor/Urdu Keyboard shared voice input contract passed.');
