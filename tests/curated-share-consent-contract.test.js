const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// WU-UXR-002 Slice F (CARD-UX-012, 013) and the /urdu-cards measurement rider.
const core = read('js/share-publish-core.js');
const curated = read('js/curated-card-share.js');
const cards = read('js/urdu-cards.js');
const studioPublish = read('js/card-studio-publish.js');
const sw = read('sw.js');

// One consent and one management store for every publisher, so tokens made anywhere stay deletable.
for (const key of ['writeUrdu.sharePublishAcknowledged.v1', 'writeUrdu.shareManagement.v1']) {
  assert.ok(core.includes(key), 'core uses ' + key);
  assert.ok(studioPublish.includes(key), 'Card Studio keeps using ' + key);
}
for (const name of ['hasAcknowledged', 'acknowledge', 'managementState', 'rememberShare', 'forgetShare', 'requestConsent', 'manageDialog', 'deleteShare', 'publish']) {
  assert.match(core, new RegExp(name + '\\s*:'), 'core exports ' + name);
}
assert.match(core, /lang === 'ur'|locale\(\) === 'ur'/, 'core dialogs follow the page language');

// Curated share: consent before any POST, remembered for deletion, deduped, no invented credit.
const shareCard = curated.slice(curated.indexOf('function shareCard'));
assert.ok(shareCard.indexOf('requestConsent') > -1 && shareCard.indexOf('requestConsent') < shareCard.indexOf('publishCardShare('), 'consent is asked before publishing');
assert.match(curated, /\.publish\(form\)/, 'ready-made links publish through the core');
const corePublish = core.slice(core.indexOf('function publish('), core.indexOf('function deleteShare('));
assert.match(corePublish, /rememberShare\(result\)/, 'every published link is remembered for deletion');
assert.match(curated, /writeUrdu\.curatedShareLinks\.v1/, 'links are cached for reuse');
assert.match(curated, /method:\s*'HEAD'/, 'a cached link is checked before it is reused');
assert.doesNotMatch(curated, /Write Urdu Card'\)|' · Write Urdu Card'/, 'no design name is sent as the author');
assert.doesNotMatch(curated, /cache[^\n]*textUr\s*[,}]/, 'the cache never stores the words themselves');
assert.match(curated, /result:\s*'cancelled'/, 'declining is reported to the caller');

// Personaliser "Get link".
assert.match(cards, /urduCardsPersonalizerLink/, 'the personaliser has a Get link action');
assert.match(cards, /personalizeLink:\s*'Get link'/, 'English label');
assert.match(cards, /personalizeLink:\s*'لنک بنائیں'/, 'Urdu label');
assert.match(cards, /urduCardsManageLinks/, 'Urdu Cards offers Manage links once a link exists');

// Measurement rider: outcomes use event names the server already counts (no card text, no new schema).
assert.match(cards, /track\('share_publish_completed'/, 'link creation is counted');
assert.match(cards, /track\('share_completed'/, 'native shares are counted');
assert.match(cards, /track\('export_completed',\s*\{\s*format:\s*'png'/, 'downloads are counted as PNG exports');
assert.match(cards, /track\('tool_handoff',\s*\{\s*target_route:\s*'\/urdu-card-studio'/, 'Card Studio hand-offs are counted');

assert.ok(sw.includes("'./js/share-publish-core.js'"), 'the core is in the offline shell');

console.log('curated share consent contract ok');
