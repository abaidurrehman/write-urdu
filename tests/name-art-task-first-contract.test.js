const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'urdu-name-art-maker.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js', 'name-art.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'name-art-task-first.css'), 'utf8');

assert.match(page, /id="nameArtText"[^>]+data-name-art-text/, 'Name Art must start with a direct name/text field');
assert.match(page, /data-name-art-convert/, 'Roman Urdu conversion must be available before the design workspace');
assert.match(page, /data-name-art-purpose="square"/, 'DP/profile purpose is missing');
assert.match(page, /data-name-art-purpose="name-transparent"/, 'transparent-name purpose is missing');
assert.match(page, /data-name-art-purpose="story"/, 'story/status purpose is missing');
assert.match(page, /data-name-art-purpose="facebook"/, 'wide-social purpose is missing');
assert.match(page, /js\/batch-transliteration\.js/, 'Name Art must reuse the shared Roman Urdu bulk conversion engine');
assert.match(page, /class="name-art-style-picker"/, 'Name Art styles must be separated from the quick-start task controls');
assert.match(page, /data-name-art-workspace[^>]+data-card-studio/, 'Name Art route must own the shared engine root directly');
assert.match(page, /<canvas[^>]+id="cardCanvas"/, 'Name Art must contain the actual export canvas on the top-level page');
assert.doesNotMatch(page, /<iframe\b/i, 'Name Art must not embed another WriteUrdu application');
assert.doesNotMatch(page, /data-name-art-frame/, 'legacy iframe contract must be removed');

const startIndex = page.indexOf('class="name-art-shortcuts"');
const workspaceIndex = page.indexOf('class="name-art-workspace"');
const stylesIndex = page.indexOf('class="name-art-style-picker"');
assert(startIndex >= 0 && workspaceIndex > startIndex, 'Name Art quick start must precede the live workspace in source order');
assert(stylesIndex > startIndex, 'Name Art style picker must remain available after quick start');

assert.match(app, /css\/name-art-task-first\.css/, 'task-first Name Art CSS must load after the shared creation layers');
assert.match(app, /updateObjectText\('text'/, 'outer name input must update the shared canvas text object');
assert.match(app, /WriteUrduBatchTransliteration/, 'Name Art must use the shared transliteration engine');
assert.match(app, /Add your name or short Urdu text first\./, 'outer export must reject an empty/default Name Art project');
assert.match(app, /cardCore\.createDefaultCardProject/, 'direct Name Art must start from a clean shared-engine state');
assert.match(app, /nameArt\.TEMPLATES\[0\]\.id/, 'direct Name Art should use a real Name Art template rather than an unrelated saved card');
assert.match(app, /name-art-template-preview/, 'template choices need a visual preview');
assert.match(app, /getWorkspaceApp/, 'Name Art must expose its direct workspace app rather than a frame app');
assert.doesNotMatch(app, /frame(?:App|Core|\.contentWindow|\.contentDocument)|data-name-art-frame|urdu-card-studio\.html\?nameArt=1/, 'Name Art controller must not depend on iframe internals');
assert.doesNotMatch(app, /[?&](?:text|name)=/, 'Name Art must never put user text into the URL');

assert.match(css, /\.name-art-rail\{[\s\S]*position:sticky/, 'desktop Name Art task controls/styles should remain in a compact rail');
assert.match(css, /\.name-art-direct-shell/, 'direct Name Art workspace needs its own task surface styling');
assert.match(css, /\.name-art-engine-support\{display:none!important\}/, 'generic shared-engine support controls must stay internal');
assert.match(css, /@media\(max-width:900px\)[\s\S]*\.name-art-shortcuts\{order:2/, 'mobile Name Art must put quick start immediately after the hero');
assert.match(css, /@media\(max-width:900px\)[\s\S]*\.name-art-workspace\{order:3/, 'mobile Name Art must show the live canvas before the full style list');
assert.match(css, /@media\(max-width:900px\)[\s\S]*\.name-art-style-picker\{order:4/, 'mobile styles should follow the live result');

console.log('Task-first direct Name Art contract passed.');
