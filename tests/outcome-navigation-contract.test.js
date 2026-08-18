const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const bootstrap = fs.readFileSync(path.join(root, 'site-header.js'), 'utf8');
const core = fs.readFileSync(path.join(root, 'js', 'site-header-core.js'), 'utf8');
const navigation = fs.readFileSync(path.join(root, 'js', 'outcome-navigation.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'outcome-navigation.css'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

assert.match(bootstrap, /\/js\/site-header-core\.js/, 'Header bootstrap must preserve the mature shared-shell core');
assert.match(bootstrap, /\/js\/outcome-navigation\.js/, 'Header bootstrap must load Slice D outcome navigation');
assert.doesNotMatch(bootstrap, /Rich Text Editor.*Urdu Keyboard.*Card Studio/s, 'Public header bootstrap must not reintroduce implementation-led primary navigation');
assert.match(core, /function renderFooter\(\)/, 'Preserved shared-shell core lost footer behavior');
assert.match(core, /WriteUrduLocale/, 'Preserved shared-shell core lost locale behavior');

['write', 'create', 'work', 'learn'].forEach((group) => {
  assert.match(navigation, new RegExp("id: '" + group + "'"), `Missing ${group} outcome group`);
});
assert.strictEqual((navigation.match(/\bid: '(?:write|create|work|learn)'/g) || []).length, 4, 'Top-level product IA must contain exactly Write / Create / Work / Learn');
assert.doesNotMatch(navigation, /id: ['"](?:drafts|my-drafts)['"]/, 'My drafts must not become a fifth product category');
assert.match(navigation, /data-wu-drafts-utility-slot/, 'My drafts utility/account position must remain reserved outside product categories');

assert.match(navigation, /Start writing in Urdu/, 'Write menu must lead with the user outcome, not Basic Writer');
assert.match(navigation, /Format an assignment or document/, 'Write menu must expose document intent');
assert.match(navigation, /Speak and turn it into Urdu text/, 'Voice Typing must be integrated as a current Write outcome');
assert.match(navigation, /\/tools\/urdu-voice-typing/, 'Voice Typing route missing from outcome navigation');
assert.match(navigation, /Convert legacy InPage text/, 'InPage conversion must be integrated as a current Write outcome');
assert.match(navigation, /\/tools\/inpage-unicode-converter/, 'InPage route missing from outcome navigation');
assert.match(navigation, /Make a poetry, quote or announcement image/, 'Create menu must lead with a recognizable creation job');
assert.match(navigation, /Create an Urdu or English invoice/, 'Work menu must expose the invoice outcome');
assert.match(navigation, /Prepare a formal Urdu document/, 'Work menu must expose formal-document intent without owning the Rich Editor route twice');
assert.match(navigation, /activeOwner: false/, 'Cross-category task link needs explicit non-owner active-state handling');
assert.match(navigation, /Learn the Urdu alphabet/, 'Learn menu must use task language');
assert.match(navigation, /Get answers to common questions/, 'FAQ must be exposed through a user question outcome');
assert.match(navigation, /<strong>.*<\/strong><small>/, 'Outcome label must be visually primary with tool name secondary');
assert.match(navigation, /FOOTER_ABOUT/, 'Footer utility links must remain separate from the four product categories');

assert.match(css, /@media\(min-width:1367px\)/, 'Expanded outcome navigation must only appear above the proven laptop safety breakpoint');
assert.match(css, /@media\(max-width:1366px\)/, 'Outcome navigation must collapse safely at common 1366px laptop widths');
assert.match(css, /repeat\(5,minmax\(0,1fr\)\)/, 'Footer must support Write/Create/Work/Learn plus a separate About utility group');
assert.match(css, /body\.wu-v2-shell footer\.wu-footer\{color:#b9ccc1!important;background:#10281c!important/, 'Shared footer must retain a dark readable surface with shell-level specificity');
assert.match(css, /body\.wu-v2-shell footer\.wu-footer a,body\.wu-v2-shell footer\.wu-footer \.wu-footer-group a\{color:#dce9e1!important\}/, 'Footer links must retain explicit light contrast');
assert.match(css, /body\.wu-v2-shell footer\.wu-footer \.wu-footer-brand,body\.wu-v2-shell footer\.wu-footer \.wu-footer-group h2,body\.wu-v2-shell footer\.wu-footer strong\{color:#f4faf6!important\}/, 'Footer headings/brand must retain explicit high contrast');
assert.match(css, /prefers-reduced-motion:reduce/, 'Outcome navigation must respect reduced-motion preferences');
assert.match(sw, /write-urdu-shell-v22/, 'PWA cache version must include the Basic Writer command toolbar while retaining prior journey assets');
assert.match(sw, /js\/site-header-core\.js/, 'Preserved shell core must be cached for offline use');
assert.match(sw, /js\/outcome-navigation\.js/, 'Outcome navigation runtime must be cached for offline use');
assert.match(sw, /js\/core-workspace-convergence\.js/, 'Core workspace convergence runtime must be cached for offline use');
assert.match(sw, /css\/outcome-navigation\.css/, 'Outcome navigation styles must be cached for offline use');
assert.match(sw, /css\/core-workspace-convergence\.css/, 'Core workspace convergence styles must be cached for offline use');

console.log('Outcome-led navigation contract passed.');
