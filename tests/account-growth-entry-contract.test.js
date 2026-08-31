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

// Runtime assertions describe the currently shipped growth entry implementation. WU-PLAT-002H/WU-GROWTH-002
// now define the next value-triggered arbitration change; its implementation PR will update these runtime checks.
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
assert.match(growth, /panel\.hidden = !hasText/, 'Current Voice prompt remains text-gated until shared arbitration replaces it');
assert.match(growth, /writeUrdu\.accountGrowth\.voiceDraft\.v1/, 'Voice account navigation must use a bounded session handoff key');
assert.match(growth, /30 \* 60 \* 1000/, 'Voice transcript handoff must expire after 30 minutes');
assert.match(growth, /sessionStorage\.setItem\(VOICE_DRAFT_KEY/, 'Voice transcript must be preserved before account navigation');
assert.match(growth, /sessionStorage\.removeItem\(VOICE_DRAFT_KEY\)/, 'Voice transcript handoff must be consume-once');
assert.match(growth, /documentsClient\.create\(\{ content: text, text \}, \{ editorKind: 'basic' \}\)/, 'Voice save must reuse the existing basic document contract rather than add a new DB/editor kind');
assert.match(growth, /Save to My Documents/, 'Signed-in Voice users must have an explicit save action');
assert.match(growth, /href="\/my-documents"/, 'Signed-in Voice users must be able to open My Documents');

assert.match(serviceWorker, /write-urdu-shell-v41/, 'PWA generation must remain compatible with the current account-document shell');
assert.match(serviceWorker, /\.\/js\/account-growth-entry\.mjs/, 'PWA shell must cache the account/share growth controller');
assert.match(registry, /`WU-GROWTH-002` \| Account Save \+ Share Entry Points/, 'Feature registry must include the growth entry-point contract');

// Spec assertions intentionally guard the next evidence-backed behavior rather than freezing the old `hasText` UI forever.
assert.match(spec, /one growth request at a time/i, 'Growth spec must arbitrate Keep, Share and Community Publish');
assert.match(spec, /Public sharing remains account-independent/i, 'Growth spec must prohibit account-gating the public share loop');
assert.match(spec, /No new database is introduced by prompt arbitration/i, 'Growth arbitration must reuse existing storage/services');
assert.match(spec, /E0 — empty/, 'Growth spec must keep acquisition prompts out of the empty writer');
assert.match(spec, /E3 — substantial writing/, 'Growth spec must make Keep eligible after meaningful value rather than any text');
assert.match(spec, /Signed-in UX/, 'Growth spec must define authenticated behavior separately');
assert.match(spec, /Never advertise account creation to an authenticated user/, 'Authenticated users must not be re-acquired');
assert.match(spec, /suppressed_due_to_arbitration/, 'Product measurement must explain why competing prompts were suppressed');

console.log('Account save + share growth entry contracts passed.');
