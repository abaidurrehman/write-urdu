const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const bootstrap = fs.readFileSync(path.join(root, 'site-header.js'), 'utf8');
const core = fs.readFileSync(path.join(root, 'js', 'site-header-core.js'), 'utf8');
const navigation = fs.readFileSync(path.join(root, 'js', 'outcome-navigation.js'), 'utf8');
const primaryNavigation = navigation.split('var FOOTER_GROUPS = [')[0];
const css = fs.readFileSync(path.join(root, 'css', 'outcome-navigation.css'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

assert.match(bootstrap, /\/js\/site-header-core\.js/, 'Header bootstrap must preserve the mature shared-shell core');
assert.match(bootstrap, /\/js\/outcome-navigation\.js/, 'Header bootstrap must load Slice D outcome navigation');
assert.doesNotMatch(bootstrap, /Rich Text Editor.*Urdu Keyboard.*Card Studio/s, 'Public header bootstrap must not reintroduce implementation-led primary navigation');
assert.match(core, /function renderFooter\(\)/, 'Preserved shared-shell core lost footer behavior');
assert.match(core, /WriteUrduLocale/, 'Preserved shared-shell core lost locale behavior');

['write', 'create', 'work', 'learn'].forEach((group) => {
  assert.match(primaryNavigation, new RegExp("id: '" + group + "'"), `Missing ${group} outcome group`);
});
assert.strictEqual((primaryNavigation.match(/\bid: '(?:write|create|work|learn)'/g) || []).length, 4, 'Top-level product IA must contain exactly Write / Create / Work / Learn');
assert.doesNotMatch(primaryNavigation, /id: ['"](?:drafts|my-drafts)['"]/, 'My drafts must not become a fifth product category');
assert.match(navigation, /data-wu-drafts-utility-slot/, 'My drafts utility/account position must remain reserved outside product categories');

assert.match(primaryNavigation, /Start writing in Urdu/, 'Write menu must lead with the user outcome, not Basic Writer');
assert.match(primaryNavigation, /English to Urdu typing/, 'Primary typing language must match observed search intent');
assert.doesNotMatch(primaryNavigation, /Roman Urdu writer|Understand Roman Urdu transliteration/, 'User-facing navigation must avoid internal transliteration terminology');
assert.match(primaryNavigation, /Format an assignment or document/, 'Write menu must expose document intent');
assert.match(primaryNavigation, /Speak and turn it into Urdu text/, 'Voice Typing must be integrated as a current Write outcome');
assert.match(primaryNavigation, /\/tools\/urdu-voice-typing/, 'Voice Typing route missing from outcome navigation');
assert.match(primaryNavigation, /Convert legacy InPage text/, 'InPage conversion must be integrated as a current Write outcome');
assert.match(primaryNavigation, /\/tools\/inpage-unicode-converter/, 'InPage route missing from outcome navigation');
assert.match(primaryNavigation, /Make a poetry, quote or announcement image/, 'Create menu must lead with a recognizable creation job');
assert.match(primaryNavigation, /Create an Urdu or English invoice/, 'Work menu must expose the invoice outcome');
assert.match(primaryNavigation, /Prepare a formal Urdu document/, 'Work menu must expose formal-document intent without owning the Rich Editor route twice');
assert.match(primaryNavigation, /activeOwner: false/, 'Cross-category task link needs explicit non-owner active-state handling');
assert.match(primaryNavigation, /Learn the Urdu alphabet/, 'Learn menu must use task language');
assert.match(primaryNavigation, /Get answers to common questions/, 'FAQ must be exposed through a user question outcome');
assert.match(navigation, /<strong>.*<\/strong><small>/, 'Outcome label must be visually primary with tool name secondary');

assert.match(navigation, /var FOOTER_GROUPS = \[/, 'Footer must use a dedicated compact information architecture');
['write-urdu', 'create', 'help'].forEach((group) => {
  assert.match(navigation, new RegExp("id: '" + group + "'"), `Missing compact footer group ${group}`);
});
assert.match(navigation, /English to Urdu typing/, 'Footer must lead with the largest observed typing intent');
assert.match(navigation, /Urdu image maker/, 'Footer Create group must use plain user language');
assert.match(navigation, /How to type Urdu/, 'Footer Help group must expose a direct typing guide');
assert.match(navigation, /wu-footer-utility-links/, 'Feedback, sitemap and terms must be demoted to the compact utility row');

assert.match(css, /@media\(min-width:1367px\)/, 'Expanded outcome navigation must only appear above the proven laptop safety breakpoint');
assert.match(css, /@media\(max-width:1366px\)/, 'Outcome navigation must collapse safely at common 1366px laptop widths');
assert.match(css, /max-height:calc\(100dvh - 84px\)/, 'Compact navigation must be bounded to the visible viewport');
assert.match(css, /overflow-y:auto!important/, 'Compact navigation must scroll internally instead of stretching the page');
assert.match(css, /\.wu-outcome-menu>summary\{height:auto!important;min-height:48px/, 'Compact outcome summaries must keep intrinsic height');
assert.doesNotMatch(css, /\.wu-outcome-menu>summary\{height:100%/, 'Outcome summaries must never stretch across an expanded details panel');
assert.match(css, /@media\(max-width:560px\)[\s\S]*display:flex!important;flex-direction:column/, 'Phone navigation must use a single normal-flow column');
assert.match(css, /body\[data-wu-basic-command-toolbar="true"\] \.wu-basic-command-primary\{flex:1 1 100%!important;width:100%/, 'Phone toolbar must keep Share and Copy on a stable full-width row');
assert.match(css, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/, 'Footer must use exactly three compact link columns');
assert.match(css, /\.wu-v2-footer-top\{display:grid!important;grid-template-columns:minmax\(230px,.8fr\) minmax\(0,2fr\)/, 'Desktop footer must reserve a clear brand column beside the compact link grid');
assert.match(css, /body\.wu-v2-shell footer\.wu-footer\{color:#b9ccc1!important;background:#10281c!important/, 'Shared footer must retain a dark readable surface with shell-level specificity');
assert.match(css, /body\.wu-v2-shell footer\.wu-footer a,body\.wu-v2-shell footer\.wu-footer \.wu-footer-group a\{color:#dce9e1!important\}/, 'Footer links must retain explicit light contrast');
assert.match(css, /body\.wu-v2-shell footer\.wu-footer \.wu-footer-brand,body\.wu-v2-shell footer\.wu-footer \.wu-footer-group h2,body\.wu-v2-shell footer\.wu-footer strong\{color:#f4faf6!important\}/, 'Footer headings/brand must retain explicit high contrast');
assert.match(css, /prefers-reduced-motion:reduce/, 'Outcome navigation must respect reduced-motion preferences');
assert.match(sw, /write-urdu-shell-v29/, 'PWA cache version must include the compact footer and account-shell assets');
assert.match(sw, /js\/site-header-core\.js/, 'Preserved shell core must be cached for offline use');
assert.match(sw, /js\/outcome-navigation\.js/, 'Outcome navigation runtime must be cached for offline use');
assert.match(sw, /js\/core-workspace-convergence\.js/, 'Core workspace convergence runtime must be cached for offline use');
assert.match(sw, /css\/outcome-navigation\.css/, 'Outcome navigation styles must be cached for offline use');
assert.match(sw, /css\/core-workspace-convergence\.css/, 'Core workspace convergence styles must be cached for offline use');

console.log('Outcome-led navigation contract passed.');
