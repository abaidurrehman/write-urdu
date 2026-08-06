const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');

const root = path.resolve(__dirname, '..');
const shell = fs.readFileSync(path.join(root, 'css', 'product-shell.css'), 'utf8');
const v2Workspace = fs.readFileSync(path.join(root, 'css', 'v2-workspace.css'), 'utf8');
const main = fs.readFileSync(path.join(root, 'css', 'main.css'), 'utf8');
const editor = fs.readFileSync(path.join(root, 'urdu-editor.html'), 'utf8');
const keyboard = fs.readFileSync(path.join(root, 'urdu-keyboard.html'), 'utf8');

function assertApprovedWeights(source, label) {
    const weights = Array.from(source.matchAll(/font-weight\s*:\s*(\d+)\b/g), (match) => Number(match[1]));
    weights.forEach((weight) => {
        assert.ok([400, 500, 600, 700].includes(weight), `${label} uses disallowed font weight ${weight}`);
    });
}

assert.match(main, /@import\s+url\(["']\.\/product-shell\.css["']\)/, 'main.css must load the shared product shell');
assert.match(main, /@import\s+url\(["']\.\/v2-workspace\.css["']\)/, 'main.css must load the WriteUrdu v2 workspace layer');
assert.match(shell, /\.rich-editor-page/, 'product shell must target the Rich Editor contract');
assert.match(shell, /\.keyboard-page/, 'product shell must target the Urdu Keyboard contract');
assert.match(v2Workspace, /Editor is the page/, 'v2 workspace must preserve the editor-first product principle');
assert.match(v2Workspace, /\.rich-editor-page/, 'v2 workspace must target the Rich Editor contract');
assert.match(v2Workspace, /\.keyboard-page/, 'v2 workspace must target the Urdu Keyboard contract');
assert.match(shell, /:focus-visible/, 'product shell must preserve visible keyboard focus');
assert.match(shell, /prefers-reduced-motion/, 'product shell must respect reduced-motion preferences');
assert.match(editor, /<body class="tool-page rich-editor-page">/, 'Rich Editor body contract changed');
assert.match(keyboard, /<body class="tool-page keyboard-page">/, 'Urdu Keyboard body contract changed');
assert.match(editor, /id="basic-example"/, 'Rich Editor textarea binding changed');
assert.match(keyboard, /id="write"/, 'Urdu Keyboard textarea binding changed');
assertApprovedWeights(shell, 'product shell');
assertApprovedWeights(v2Workspace, 'v2 workspace');

console.log('Shared product shell and WriteUrdu v2 workspace contract checks passed.');
