const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const shell = read('site-header.js');
const growth = read('js', 'account-growth-entry.mjs');
const serviceWorker = read('sw.js');
const registry = read('specs', 'README.md');
const spec = read('specs', 'WU-GROWTH-002-account-save-share-entry-points.md');

assert.match(shell, /function installAccountGrowthEntryPoints\(\)/, 'Shared shell must own account/share growth entry loading');
assert.match(shell, /\['\/', '\/urdu-editor', '\/urdu-keyboard', '\/tools\/urdu-voice-typing'\]/, 'Growth entry points must stay bounded to the approved writing surfaces');
assert.match(shell, /\/js\/account-growth-entry\.mjs/, 'Shared shell must load the growth entry controller');
assert.match(shell, /installAccountGrowthEntryPoints\(\)/, 'Growth entry installation must run with the shared shell');

assert.match(growth, /Create free account/, 'Signed-out entry points must use account-creation language');
assert.match(growth, /Save in My Documents/, 'Visible benefit copy must lead with the saved-writing outcome');
assert.match(growth, /Share with a link/, 'Visible benefit copy must expose the share loop');
assert.match(growth, /data-account-growth-share/, 'Core writer panels must expose an account-independent share action');
assert.match(growth, /WriteUrduBasicPublish/, 'Basic Writer must reuse its shipped public short-link publisher');
assert.match(growth, /publishDocumentShare/, 'Rich, Keyboard and Voice sharing must reuse the existing share artifact client');
assert.match(growth, /Create a public Write Urdu link\? Anyone with the link can view this snapshot\./, 'Core editor publishing must require explicit public-snapshot confirmation');
assert.match(growth, /Anyone with the link can view this transcript snapshot\./, 'Voice publishing must require explicit public-snapshot confirmation');
assert.match(growth, /share_publish_started/, 'Growth shares must use existing privacy-safe publish telemetry');
assert.match(growth, /tool_handoff[\s\S]*target_route: '\/sign-in'/, 'Account entry must reuse route-only handoff telemetry');
assert.doesNotMatch(growth, /target_route:[^\n]*(?:text|content)|[?&](?:text|content)=/i, 'Writing content must not be placed in navigation telemetry or URLs');

assert.match(growth, /data-voice-account-growth/, 'Voice Typing must receive a compact account/share panel');
assert.match(growth, /panel\.hidden = !hasText/, 'Voice prompt must stay out of the way until transcript text exists');
assert.match(growth, /writeUrdu\.accountGrowth\.voiceDraft\.v1/, 'Voice account navigation must use a bounded session handoff key');
assert.match(growth, /30 \* 60 \* 1000/, 'Voice transcript handoff must expire after 30 minutes');
assert.match(growth, /sessionStorage\.setItem\(VOICE_DRAFT_KEY/, 'Voice transcript must be preserved before account navigation');
assert.match(growth, /sessionStorage\.removeItem\(VOICE_DRAFT_KEY\)/, 'Voice transcript handoff must be consume-once');
assert.match(growth, /documentsClient\.create\(\{ content: text, text \}, \{ editorKind: 'basic' \}\)/, 'Voice save must reuse the existing basic document contract rather than add a new DB/editor kind');
assert.match(growth, /Save to My Documents/, 'Signed-in Voice users must have an explicit save action');
assert.match(growth, /href="\/my-documents"/, 'Signed-in Voice users must be able to open My Documents');

assert.match(serviceWorker, /write-urdu-shell-v29/, 'PWA generation must remain compatible with the current account-document shell');
assert.match(serviceWorker, /\.\/js\/account-growth-entry\.mjs/, 'PWA shell must cache the new account/share growth controller');
assert.match(registry, /`WU-GROWTH-002` \| Account Save \+ Share Entry Points/, 'Feature registry must include the growth entry-point contract');
assert.match(spec, /Sharing remains available without an account\./, 'Spec must prohibit account-gating the viral share loop');
assert.match(spec, /No new database or storage binding is introduced\./, 'Spec must retain the existing database constraint');
assert.match(spec, /\$5\/day/, 'Spec must record the commercial target as a measured outcome rather than a guaranteed feature result');

console.log('Account save + share growth entry contracts passed.');
