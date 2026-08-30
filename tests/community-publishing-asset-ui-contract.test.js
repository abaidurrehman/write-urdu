const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const cardPublish = read('js', 'card-studio-publish.js');
const assetUi = read('js', 'community-publishing-asset-ui.mjs');
const assetEntry = read('js', 'community-publishing-asset-entry.js');
const socialDirect = read('js', 'social-direct-workspace.js');
const nameArt = read('js', 'name-art.js');
const submissions = read('functions', 'lib', 'community-submissions.mjs');
const client = read('js', 'community-publishing.mjs');
const css = read('css', 'community-publishing.css');
const qrEntry = read('js', 'qr-generator-entry.js');
const qrCore = read('js', 'qr-generator-core.js');
const qrPage = read('qr-code-generator.html');

// --- Card Studio's full wizard uses a distinct export-group container from the
// three "direct" task-first tools (WhatsApp Status, Instagram Post use
// social-direct-workspace.js's `.social-maker-direct-actions`; Name Art uses its own
// static `.name-art-export-actions`, wired in name-art.js) — verified live, not
// assumed from a single shared "card-studio-publish.js reaches every tool" claim,
// which does not hold: card-studio-publish.js's setupUi() only finds
// `.card-studio-action-group-export`, absent on all three direct-mode pages. ---
assert.match(assetEntry, /function mountButton/, 'A shared asset-entry helper must exist for the non-wizard tool surfaces');
assert.match(socialDirect, /mountCommunityButton/, 'WhatsApp Status / Instagram (social-direct-workspace.js) must mount the community action into `.social-maker-direct-actions`');
assert.match(socialDirect, /\.social-maker-direct-actions/, 'Community action must target the actual direct-mode action row, not the wizard export group');
assert.match(nameArt, /mountCommunityButton/, 'Name Art must mount the community action into `.name-art-export-actions`');
assert.match(nameArt, /\.name-art-export-actions/, "Name Art's community action must target its own static export-actions row");

// --- Per-page CSS (e.g. `.name-art-export-actions button`) is a class+type selector
// that outranks a bare single-class rule on specificity regardless of load order —
// confirmed live (Name Art rendered the community button solid green, not amber,
// before this fix). The shared button style must be qualified enough to win. ---
assert.match(css, /\.wu-community-toolbar-button\[data-community-publish-manual\]/, 'Community button CSS must be qualified to outrank per-tool `container button` rules');
assert.match(css, /\.wu-community-toolbar-button\[data-card-action\]/, 'Community button CSS must cover the data-card-action variant used by every asset-tool surface');

// --- Card Studio (shared across Card Studio, Name Art, Instagram Post, WhatsApp Status)
// must expose a distinct community submission action alongside the existing
// download/share-image/publish-link actions, not replace or hijack them. ---
assert.match(cardPublish, /data-card-action=(["'])publish-community\1/, 'Card Studio must expose a dedicated community submission action');
assert.match(cardPublish, /wu-community-toolbar-button/, 'Card Studio community button must use the shared disambiguated style');
assert.match(cardPublish, /function bindCommunityPublishButton/, 'Card Studio must bind the community submission action independently of the existing publish/share bindings');
assert.match(cardPublish, /Add your own Urdu text before submitting/, 'Card Studio must block submission of placeholder/default text, same as the existing publish flow');
assert.match(cardPublish, /\/js\/community-publishing-asset-ui\.mjs/, 'Card Studio must lazy-load the asset submission UI on demand, not eagerly');

// --- No new backend/taxonomy — the asset UI must reuse the same submission client and
// taxonomy as the text-editor flow, not invent a parallel system. ---
assert.match(assetUi, /from '\.\/community-publishing\.mjs'/, 'Asset UI must reuse the shared community publishing client/taxonomy module');
assert.match(assetUi, /from '\.\/community-publishing-taxonomy-ui\.mjs'/, 'Asset UI must reuse the shared taxonomy form markup, not duplicate it');
assert.match(assetUi, /const EDITOR_KIND = 'card'/, 'Asset submissions must be tagged with a distinct editor kind');
assert.doesNotMatch(assetUi, /console\.(?:log|info|warn|error)/, 'Asset submission UI must not log private content');

// --- The card's own caption is pre-filled but stays editable, and is validated with the
// same content-limit rules as the text editors (no separate, looser bar for images). ---
assert.match(assetUi, /textarea name="plainText"/, 'Asset UI must collect a caption/writing field, since community taxonomy is text-only');
assert.match(assetUi, /validateSubmissionForm/, 'Asset submissions must go through the same validation as editor submissions');

// --- Server must accept the new editor kind ---
assert.match(submissions, /ALLOWED_EDITOR_KINDS = Object\.freeze\(\[[^\]]*'card'[^\]]*\]\)/, 'Server must allow the card editor kind for asset-tool submissions');
assert.match(client, /COMMUNITY_EDITOR_KINDS = Object\.freeze\(\[[^\]]*'card'[^\]]*\]\)/, 'Client contract must match the server-allowed editor kinds');

// --- QR generator has no narrative content and must stay excluded from community submission ---
assert.doesNotMatch(qrEntry, /community-publishing/, 'QR generator must never be wired to community submission (no narrative content)');
assert.doesNotMatch(qrCore, /community-publishing/, 'QR generator core must never be wired to community submission');
assert.doesNotMatch(qrPage, /publish-community|community-publishing/, 'QR generator page must never reference community submission');

// --- Pure logic: editor kind round-trips through the shared payload builder ---
(async () => {
  const community = await import(pathToFileURL(path.join(root, 'js', 'community-publishing.mjs')).href);
  const payload = community.buildSubmissionPayload({
    title: 'A card caption',
    publicAuthorName: 'Test Writer',
    plainText: 'x'.repeat(120),
    primaryCategory: 'thought',
    tags: ['other'],
    rightsConfirmed: true,
    publicConfirmed: true,
    editorKind: 'card'
  });
  assert.strictEqual(payload.editorKind, 'card', 'Card submissions must carry the card editor kind through to the payload');

  console.log('Community publishing asset UI contracts passed.');
})();
