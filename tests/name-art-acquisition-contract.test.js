const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'urdu-name-art-maker.html'), 'utf8');
const seo = require(path.join(root, 'seo.config.js'));
const core = require(path.join(root, 'js/name-art-core.js'));

const page = seo.pages.find(item => item.id === 'urdu-name-art-maker');
assert(page, 'Name Art must remain registered in SEO config');
assert.strictEqual(page.path, '/urdu-name-art-maker');
assert.strictEqual(page.h1, 'Urdu Name Art Studio');
assert.strictEqual(page.searchTitle, 'Urdu Name Art Maker – Urdu Name Image & DP Maker | WriteUrdu');
assert(/24 original templates/i.test(page.searchDescription), 'search description should expose shipped template depth');
assert.strictEqual(page.lastmod, '2026-08-13');

assert(html.includes('<title>Urdu Name Art Maker – Urdu Name Image & DP Maker | WriteUrdu</title>'), 'initial HTML title must expose acquisition title');
assert(html.includes('rel="canonical" href="https://www.write-urdu.com/urdu-name-art-maker"'), 'Name Art must remain self-canonical');
assert(html.includes('<h1>Urdu Name Art Studio</h1>'), 'product H1 must remain stable');
assert(/Urdu name image or DP/i.test(html), 'source-visible guidance should cover name-image/DP intent');
assert(/24 original templates in 12 packs/i.test(html), 'source-visible guidance should expose template depth');
assert(/Transparent Urdu name layer/i.test(html), 'transparent output should be discoverable');
assert(/Does this generate a new Urdu name for me\?/i.test(html), 'page must distinguish design from random-name generation');
assert(/Stylish Urdu Text/.test(html), 'page must explain the copyable-text handoff boundary');

const workspaceIndex = html.indexOf('class="name-art-workspace"');
const adBoundaryIndex = html.indexOf('data-wu-ad-boundary="post-workspace"');
assert(workspaceIndex >= 0 && adBoundaryIndex > workspaceIndex, 'post-workspace ad boundary must remain after the embedded design workspace');

assert.strictEqual(core.PACKS.length, 12, 'Name Art must retain 12 template packs');
assert.strictEqual(core.TEMPLATES.length, 24, 'Name Art must retain 24 original templates');
assert.strictEqual(core.PRESETS.length, 6, 'Name Art must retain six focused output presets');
assert(core.PRESETS.some(preset => preset.id === 'name-transparent' && preset.width === 1600 && preset.height === 900 && preset.transparent === true), 'transparent-name preset must remain 1600x900');

console.log('Urdu Name Art acquisition contract passed.');
