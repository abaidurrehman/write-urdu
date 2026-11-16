const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// WU-UXR-002 Slice E: reachability (CARD-UX-001 step bar, 009, 024, 025, 038),
// plus a guard for the single-count export attempt (Product Pulse M-3).
const ui = read('js/card-studio-ui.js');
const library = read('js/card-studio-background-library.js');
const studio = read('js/card-studio.js');
const css = read('css/card-studio.css');
const page = read('urdu-card-studio.html');
const urduPage = read('urdu/urdu-card-studio.html');
const telemetry = read('js/product-telemetry.js');

// CARD-UX-009: panels mounted after start-up are re-synced, so the collection never shows on Content.
assert.match(ui, /refresh:\s*syncSteps/, 'WriteUrduCardStudioUi.refresh re-syncs the steps');
assert.match(ui, /write-urdu:card-studio-panel-mounted/, 'the UI listens for late panel mounts');
assert.match(library, /write-urdu:card-studio-panel-mounted/, 'the background library announces its mount');
assert.match(library, /WriteUrduCardStudioUi\.refresh\(\)/, 'the background library refreshes the UI when it is already running');

// CARD-UX-001: a step tap takes the person to that step and focuses its first control.
const setStep = ui.slice(ui.indexOf('function setStep'), ui.indexOf('function setMode'));
assert.match(setStep, /revealStep\(/, 'setStep reveals the chosen step');
const reveal = ui.slice(ui.indexOf('function revealStep'), ui.indexOf('function setStep'));
assert.match(reveal, /scrollIntoView\(/, 'the step panel is scrolled into view');
assert.match(reveal, /prefers-reduced-motion: reduce/, 'scrolling respects reduced motion');
assert.match(reveal, /preventScroll:\s*true/, 'focus does not scroll a second time');
assert.match(page, /id="cardText"[^>]*data-card-step-focus|data-card-step-focus[^>]*id="cardText"/, 'the Content step focuses the card text');
assert.match(css, /\[data-card-step-panel\]\{[^}]*scroll-margin-top/, 'panels keep a little room above them when scrolled to');

// CARD-UX-024: the preview figure no longer carries the browser's 40 px figure margin on phones.
assert.match(css, /\.card-studio-preview\{[^}]*margin:0[^}]*max-width:100%/, 'the preview fits the phone width');

// CARD-UX-025: a skip link is the first thing in the workspace, in both languages.
for (const [name, source] of [['urdu-card-studio.html', page], ['urdu/urdu-card-studio.html', urduPage]]) {
  const shell = source.slice(source.indexOf('<main class="card-studio-shell"'));
  const firstChild = shell.slice(shell.indexOf('>') + 1).trim();
  assert.match(firstChild, /^<a class="card-studio-skip" href="#cardText"/, name + ': skip link is the first child of the workspace');
}
assert.match(studio, /skipToText:'Skip to card text'/, 'English skip label');
assert.match(studio, /skipToText:'کارڈ کے متن پر جائیں'/, 'Urdu skip label');
assert.match(css, /\.card-studio-skip:focus/, 'skip link becomes visible on focus');

// CARD-UX-038: "Back to your writing" only when the text came from a writer, and it returns there.
assert.match(studio, /back:'Back to your writing'/, 'English back label');
assert.match(studio, /back:'اپنی تحریر پر واپس جائیں'/, 'Urdu back label');
assert.doesNotMatch(studio, /data-card-action="back"\]'\)\.addEventListener\('click', function \(\) \{ window\.location\.href = '\/'; \}\)/, 'back no longer always goes to the homepage');
assert.match(studio, /WRITER_ROUTES/, 'back uses the writer the text came from');
for (const writer of ['basic-writer', 'rich-editor', 'urdu-keyboard']) assert.match(studio, new RegExp("'" + writer + "'"), writer + ' is a writer source');

// Pulse rider (fixed on main by fedfe38, guarded here): only the person's own click counts as an export
// attempt, so the font guard's replayed click is not a second one.
const exportCapture = telemetry.slice(telemetry.indexOf("closest('[data-card-action=\"download\"]"), telemetry.indexOf("closest('[data-card-action=\"download\"]") + 400);
assert.match(exportCapture, /event\.isTrusted/, 'telemetry ignores the replayed click');

console.log('card studio reachability contract ok');
