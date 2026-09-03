const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const shell = read('css', 'v2-shell.css');
const css = read('css', 'mobile-authoring-focus.css');
const rich = read('urdu-editor.html');
const urduRich = read('urdu', 'urdu-editor.html');
const sw = read('sw.js');

assert.match(shell, /@import url\("\.\/mobile-authoring-focus\.css"\);/, 'V2 shell must load the Gate B2 M3/M4 mobile authoring layer after existing production corrections');

assert.match(css, /#transliterateTextarea:focus[\s\S]*?48dvh/, 'Focused Basic Writer must respond to dynamic viewport height');
assert.match(css, /@media \(max-width: 767px\) and \(max-height: 560px\)/, 'Keyboard-like small effective viewport needs a bounded fallback');
assert.match(css, /scroll-margin-block:/, 'Focused authoring surfaces need safe scroll margins around browser chrome');
assert.doesNotMatch(css, /position:\s*(?:fixed|sticky)/, 'Mobile authoring repair must not pin writing chrome over the caret');

assert.match(css, /div\[style\*="margin-top:15px"\][\s\S]*?order:\s*4 !important/, 'Rich Editor external completion toolbar must follow the document on phones');
assert.match(css, /\.input-mode-control-rich[\s\S]*?order:\s*2 !important/, 'Rich input chooser must remain directly before the document');
assert.match(css, /grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/, 'Rich Editor must keep Roman, Voice and Direct input methods in one compact row');
assert.match(css, /\.wu-voice-discovery-copy[\s\S]*?display:\s*none !important/, 'Rich Editor mobile input chooser must suppress redundant pre-editor Voice explanatory copy');
assert.match(css, /label\.sr-only\[for="basic-example"\][\s\S]*?position:\s*static !important/, 'Rich Editor must make its existing semantic label visible on phones');
assert.match(css, /\.tox\.tox-tinymce[\s\S]*?height:\s*clamp\(320px, 58dvh, 460px\) !important/, 'TinyMCE must use a dynamic mobile height instead of a fixed 500px canvas');
assert.match(css, /\.tox\.tox-tinymce:focus-within/, 'Rich document surface must expose a visible focus state');

for (const page of [rich, urduRich]) {
  assert.match(page, /label class="sr-only" for="basic-example"/, 'Rich Editor must retain the semantic label that the mobile layer reveals');
  assert.match(page, /id="basic-example"/, 'Rich Editor must keep the source-owned TinyMCE target');
}

assert.match(sw, /write-urdu-shell-v42/, 'M3/M4 must stay on the current shell generation while changing the worker manifest itself');
assert.match(sw, /\.\/css\/v2-shell\.css/, 'PWA shell must explicitly refresh the stylesheet that imports mobile authoring focus');
assert.match(sw, /\.\/css\/mobile-authoring-focus\.css/, 'PWA shell must cache the M3/M4 mobile authoring layer');

console.log('Mobile authoring focus contract passed.');