const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// WU-UXR-002 Slice K (CARD-UX-023, 033, 035, 028).
const ui = read('js/card-studio-ui.js');
const publish = read('js/card-studio-publish.js');
const studio = read('js/card-studio.js');
const core = require(path.join(root, 'js/card-studio-core.js'));
const css = read('css/card-studio.css');
const handoff = read('js/workspace-handoff.js');

// Urdu labels through copy tables, re-applied on a language switch.
assert.match(ui, /var UI_COPY = \{/, 'workflow labels live in a copy table');
assert.match(ui, /undo: 'واپس', redo: 'دوبارہ'/, 'Undo/Redo in Urdu');
assert.match(ui, /content: \['متن'/, 'steps in Urdu');
assert.match(ui, /quick: 'آسان', advanced: 'مزید اختیارات'/, 'modes in Urdu');
assert.match(ui, /write-urdu:locale-change[^\n]*localizeWorkspace\(\)/, 'labels follow a language switch');
assert.match(publish, /var P_COPY = \{/, 'publishing copy lives in a copy table');
assert.match(publish, /publish: 'شائع کریں اور شیئر کریں'/, 'Publish & Share in Urdu');
assert.match(publish, /addEventListener\('write-urdu:locale-change', relabel\)/, 'publish labels follow a language switch');
assert.doesNotMatch(publish, /<h2>Publish this card as a public link\?<\/h2>/, 'the publish dialog is no longer English-only markup');

// Focus ring and readable notes.
assert.match(css, /:focus-visible\{outline:3px solid #0b6fc2!important;outline-offset:2px\}/, 'solid focus ring');
assert.match(css, /\.card-studio-help\{font-size:14px/, 'guidance is 14 px on phones');

// Storage blocked by privacy settings never throws out of the hand-off layer.
const storage = handoff.slice(handoff.indexOf('function storage('), handoff.indexOf('function randomId('));
assert.ok(storage.indexOf('try {') < storage.indexOf('root.sessionStorage'), 'sessionStorage is first read inside try');

// Long tokens break at link punctuation, wherever they fall in a line.
const ctx = { measureText: value => ({ width: String(value).length * 10 }) };
const lines = core.wrapRtlText(ctx, 'دیکھیں https://example.com/urdu/cards/abcdefghij?x=1', 120).filter(line => !line.isBlank);
assert.ok(lines.length > 2, 'the link wraps');
for (const line of lines) assert.ok(line.width <= 120, 'no line wider than the box: ' + line.text);
assert.ok(lines.some(line => /\/$/.test(line.text)), 'a break falls after a slash');

// An honest fit warning.
assert.match(studio, /fitWarningAuto:'This text is too long for this size even at the smallest readable size\. Shorten it or choose a taller format\.'/);
assert.match(studio, /t\(state\.text\.fontMode === 'auto' \? 'fitWarningAuto' : 'fitWarning'\)/, 'the warning depends on auto-fit');

console.log('card studio urdu/a11y contract ok');
