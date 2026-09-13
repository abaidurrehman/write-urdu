const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const journey = require('../js/workspace-journey-registry.js');

const html = read('urdu-cards.html');
const script = read('js/urdu-cards.js');
const endpoint = read('functions/api/events.js');
const ads = read('js/ads.js');

assert.match(html, /<meta name="robots" content="noindex,follow">/, 'urdu-cards must stay noindex until an SEO exception is recorded');
assert.doesNotMatch(html, /wu-static-nav-group[^>]*>[^<]*<a href="\/urdu-cards"/, 'urdu-cards must not be promoted in the primary nav yet');
assert.ok(html.indexOf('/js/workspace-journey-registry.js') < html.indexOf('/js/workspace-handoff.js'));
assert.ok(html.indexOf('/js/workspace-handoff.js') < html.indexOf('/js/urdu-cards.js'));
assert.ok(html.indexOf('/js/card-background-registry.js') < html.indexOf('/js/urdu-cards.js'));
assert.ok(html.indexOf('/js/urdu-cards-data.js') < html.indexOf('/js/urdu-cards.js'));

assert.match(script, /payload: \{ text: card\.textUr, backgroundId: card\.backgroundId \}/);
assert.match(script, /sourceWorkspace: 'urdu-cards'/);
assert.match(script, /kind: 'visual-project-seed'/);
assert.match(script, /trackContinuationPath\('selected', pathDetail\)/);
assert.match(script, /trackContinuationPath\('handoff_created', pathDetail\)/);
assert.doesNotMatch(script, /[?&](?:text|content|payload)=/i, 'urdu-cards must not put card text in URL transport');
assert.doesNotMatch(script, /WriteUrduTelemetry\.track\(['"][^'"]*(?:text|content)[^'"]*['"],\s*\{[^}]*card\.textUr/, 'card text must never be sent as a telemetry payload value');

const edge = journey.get('urdu-cards');
assert.ok(edge, 'journey registry must know about urdu-cards');
assert.ok(edge.next.some(e => e.id === 'urdu-cards-to-card' && e.target === 'card-studio' && e.payloadKind === 'visual-project-seed'));
assert.ok(edge.next.some(e => e.id === 'urdu-cards-share' && e.target === null && e.type === 'embedded'));

['urdu-cards'].forEach(id => assert.ok(endpoint.includes(`'${id}'`), `continuation workspace allowlist missing ${id}`));
assert.ok(endpoint.includes(`'urdu-cards-to-card'`), 'continuation recommendation allowlist missing urdu-cards-to-card');
assert.ok(endpoint.includes(`'urdu-cards-v1'`), 'continuation path version allowlist missing urdu-cards-v1');
assert.ok(endpoint.includes(`'wu-urdu-cards-s1-2026-09-13-v1'`), 'continuation release marker allowlist missing urdu-cards marker');

assert.match(ads, /'\/urdu-cards'/, 'urdu-cards must stay ad-light like other active creation surfaces');

console.log('Urdu Cards Slice 1 handoff/wiring contract passed.');
