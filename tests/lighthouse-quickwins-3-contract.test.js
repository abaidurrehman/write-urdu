const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const inputMode = read('css', 'input-mode.css');
const voice = read('css', 'voice-discovery.css');
const home = read('index.html');
const urduHome = read('urdu', 'index.html');

assert.match(inputMode, /\.input-mode-option\.is-active,[\s\S]*\[aria-pressed="true"\][\s\S]*background:\s*#117a43/, 'Active input mode must use the measured accessible green');
assert.match(voice, /@media \(min-width: 900px\)[\s\S]*\.wu-voice-entry-home/, 'Voice discovery must reserve its desktop hero geometry before late CSS arrives');
assert.match(home, /<h2 class="card-title" data-wu-l10n="home\.howToTitle">How to type Urdu with English letters<\/h2>/, 'Homepage how-to heading must not skip from H1 to H3');
assert.match(urduHome, /<h2 class="card-title" data-wu-l10n="home\.howToTitle">/, 'Urdu homepage must keep the same semantic heading level');

console.log('Lighthouse quick-win batch 3 contract passed.');
