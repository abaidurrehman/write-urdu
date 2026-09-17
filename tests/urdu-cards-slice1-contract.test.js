const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const journey = require('../js/workspace-journey-registry.js');
const cards = require('../js/urdu-cards-data.js').getAllCards();

const html = read('urdu-cards.html');
const script = read('js/urdu-cards.js');
const returningScript = read('js/urdu-cards-returning-state.js');
const ownWordsScript = read('js/urdu-cards-own-words.js');
const ownWordsVoiceScript = read('js/urdu-cards-own-words-voice.js');
const publicShareEntry = read('js/urdu-cards-public-share-entry.js');
const transliterationAdapter = read('js/card-gallery-transliteration.js');
const endpoint = read('functions/api/events.js');
const discoveryGuide = (html.match(/<section class="card-discovery-guide"[^]*?<\/section>/) || [''])[0];

assert.match(html, /<meta name="robots" content="index,follow">/, 'WU-CARD-GALLERY-001 P0.9 founder exception (2026-09-13) made this route indexable');
assert.match(html, /data-wu-static-nav-group="create"[^]*?<a href="\/urdu-cards">/, 'urdu-cards must be promoted in the primary nav per the P0.9 exception');
assert.match(html, new RegExp(`data-urdu-cards-count[^>]*>${cards.length} cards<`), 'source count must match the curated-card registry');
assert.match(html, /<h2[^>]*>Find an Urdu card for the moment<\/h2>/, 'indexed route needs useful source-visible guidance');
['/urdu-card-gallery', '/urdu-whatsapp-status-maker', '/urdu-instagram-post-maker'].forEach(route => {
    assert.ok(discoveryGuide.includes(`href="${route}"`), `card guidance must link contextually to ${route}`);
});
assert.ok(html.indexOf('/js/workspace-journey-registry.js') < html.indexOf('/js/workspace-handoff.js'));
assert.ok(html.indexOf('/js/workspace-handoff.js') < html.indexOf('/js/urdu-cards.js'));
assert.ok(html.indexOf('/js/card-background-registry.js') < html.indexOf('/js/urdu-cards.js'));
assert.ok(html.indexOf('/js/urdu-cards-data.js') < html.indexOf('/js/urdu-cards.js'));
assert.ok(html.indexOf('/js/curated-card-share.js') < html.indexOf('/js/urdu-cards.js'));

assert.match(script, /payload: \{ text: card\.textUr, backgroundId: card\.backgroundId \}/);
assert.match(script, /sourceWorkspace: 'urdu-cards'/);
assert.match(script, /kind: 'visual-project-seed'/);
assert.match(script, /trackContinuationPath\('selected', pathDetail\)/);
assert.match(script, /trackContinuationPath\('handoff_created', pathDetail\)/);
assert.doesNotMatch(script, /fetch\('\/api\/shares'/, 'route runtime must not duplicate shared publishing code');
assert.doesNotMatch(script, /createElement\('canvas'\)/, 'route runtime must not duplicate shared card rendering');
assert.doesNotMatch(script, /[?&](?:text|content|payload)=/i, 'urdu-cards must not put card text in URL transport');
assert.doesNotMatch(script, /WriteUrduTelemetry\.track\(['"][^'"]*(?:text|content)[^'"]*['"],\s*\{[^}]*card\.textUr/, 'card text must never be sent as a telemetry payload value');

assert.match(returningScript, /urdu-cards-own-words\.js/, 'the existing cards progressive-enhancement bootstrap must load own-words mode');
assert.match(ownWordsScript, /data-input-mode-targets', '#urduCardsOwnText'/, 'own-words mode must reuse the shared input-mode controller');
assert.match(ownWordsScript, /card-gallery-transliteration\.js/, 'own-words mode must reuse the existing card transliteration adapter');
assert.match(transliterationAdapter, /'cardGalleryText', 'urduCardsOwnText'/, 'the shared card transliteration adapter must support both gallery surfaces');
assert.match(ownWordsScript, /originals\[card\.id\] = card\.textUr/, 'own-words mode must preserve canonical ready-made text for restoration');
assert.match(ownWordsScript, /card\.textUr = normalized/, 'own-words mode must feed existing card actions through the canonical in-memory card object');
assert.match(ownWordsScript, /importText:/, 'own-words mode must expose its existing state for bounded public-share imports');
assert.doesNotMatch(ownWordsScript, /localStorage\.setItem[^\n]*(?:text|message|value)/i, 'own-words text must not be persisted to localStorage');
assert.doesNotMatch(ownWordsScript, /sessionStorage\.setItem[^\n]*(?:text|message|value)/i, 'own-words text must not be persisted by the inline composer');
assert.doesNotMatch(ownWordsScript, /fetch\(/, 'own-words mode must remain browser-local until an existing explicit share action is chosen');

assert.match(ownWordsScript, /urdu-cards-own-words-voice\.js/, 'own-words mode should lazy-load its voice enhancement only after the composer is opened');
assert.match(ownWordsVoiceScript, /voice-input-core\.js/, 'Slice 5B must reuse the shared speech-recognition core');
assert.match(ownWordsVoiceScript, /unified-urdu-input\.js/, 'Slice 5B must reuse the shared text-target adapter');
assert.match(ownWordsVoiceScript, /writer-voice-input\.js/, 'Slice 5B must reuse the established voice UI and permission/error handling');
assert.match(ownWordsVoiceScript, /mountInputModeTextTargets/, 'voice must bind through the generic input-mode target path rather than a cards-specific adapter');
assert.doesNotMatch(ownWordsVoiceScript, /SpeechRecognition|webkitSpeechRecognition/, 'the cards voice layer must not implement a second recognition engine');
assert.doesNotMatch(ownWordsVoiceScript, /getUserMedia|mediaDevices/, 'the cards voice layer must not add a separate microphone API path');
assert.doesNotMatch(ownWordsVoiceScript, /localStorage|sessionStorage/, 'voice transcript must remain in the existing in-memory textarea flow');
assert.doesNotMatch(ownWordsVoiceScript, /fetch\(/, 'voice recognition itself must not send transcript text to the server');

assert.match(html, /\/js\/urdu-cards-public-share-entry\.js/, 'Urdu Cards must load its isolated public-share entry adapter');
assert.match(publicShareEntry, /Handoff\.take\('urdu-cards'\)/, 'public-share entry must consume and clear the Urdu Cards handoff');
assert.match(publicShareEntry, /source\.workspace !== 'public-share'/, 'destination must reject unrelated handoff sources');
assert.match(publicShareEntry, /share-to-urdu-cards-create-own/, 'destination must recognize only the bounded fresh-start intent');
assert.match(publicShareEntry, /share-to-urdu-cards-use-public-text/, 'destination must recognize only the bounded public-text intent');
assert.match(publicShareEntry, /WriteUrduTelemetry\.shareReferralReady/, 'destination-ready measurement must wait for successful own-words activation');
assert.doesNotMatch(publicShareEntry, /localStorage/, 'public-share text must never be persisted to localStorage');
assert.doesNotMatch(publicShareEntry, /location\.(?:search|hash)|URLSearchParams/, 'public-share entry must not read content or identity from the URL');

const edge = journey.get('urdu-cards');
assert.ok(edge, 'journey registry must know about urdu-cards');
assert.ok(edge.accepts.includes('plain-text'), 'urdu-cards must accept the bounded public-share plain-text handoff');
assert.ok(edge.next.some(e => e.id === 'urdu-cards-to-card' && e.target === 'card-studio' && e.payloadKind === 'visual-project-seed'));
assert.ok(edge.next.some(e => e.id === 'urdu-cards-share' && e.target === null && e.type === 'embedded'));

['urdu-cards'].forEach(id => assert.ok(endpoint.includes(`'${id}'`), `continuation workspace allowlist missing ${id}`));
assert.ok(endpoint.includes(`'urdu-cards-to-card'`), 'continuation recommendation allowlist missing urdu-cards-to-card');
assert.ok(endpoint.includes(`'urdu-cards-v1'`), 'continuation path version allowlist missing urdu-cards-v1');
assert.ok(endpoint.includes(`'wu-urdu-cards-s1-2026-09-13-v1'`), 'continuation release marker allowlist missing urdu-cards marker');

assert.equal(require('../js/ads.js').resolvePageType('/urdu-cards'), 'create', 'urdu-cards must use the protected Create-page ad placement');

console.log('Urdu Cards Slice 1 handoff/wiring contract passed.');
