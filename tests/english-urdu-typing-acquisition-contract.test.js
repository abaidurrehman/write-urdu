const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const seo = require(path.join(root, 'seo.config.js'));

const home = seo.byPath['/'];
const tutorial = seo.byPath['/english-urdu-typing-tutorial'];
const richEditor = seo.byPath['/urdu-editor'];
const keyboard = seo.byPath['/urdu-keyboard'];
const romanGuide = seo.byPath['/roman-urdu-transliteration'];
const formattingGuide = seo.byPath['/urdu-editor-features'];
const homeHtml = read('index.html');
const runtimeSeo = read('js/seo.js');
const llms = read('llms.txt');
const sitemap = read('sitemap.xml');
const redirects = read('_redirects');
const spec = read('specs/WU-SEO-ETU-001-english-to-urdu-typing-acquisition.md');

assert.ok(home && home.indexable, 'Homepage must remain the indexable typing product owner');
assert.strictEqual(home.path, '/', 'English-to-Urdu typing owner must remain the homepage canonical');
assert.strictEqual(home.h1, 'Type Roman Urdu and convert it to Urdu script', 'Established homepage H1 must remain unchanged');
assert.match(home.searchTitle || '', /^English to Urdu Typing Online\b/i, 'Homepage search title must lead with the prime acquisition phrase');
assert.match(home.searchTitle || '', /Urdu Typing Online/i, 'Homepage search title must preserve Urdu Typing Online relevance');
assert.ok((home.searchTitle || '').length <= 65, 'Homepage search title should remain concise');
assert.match(home.searchDescription || '', /Roman Urdu/i, 'Homepage search description must explain Roman Urdu input');
assert.match(home.searchDescription || '', /English letters/i, 'Homepage search description must explain English-letter input');
assert.match(home.searchDescription || '', /Urdu script/i, 'Homepage search description must explain Urdu-script output');
assert.match(home.searchDescription || '', /transliteration/i, 'Homepage search description must name transliteration');
assert.match(home.searchDescription || '', /not English translation/i, 'Homepage search description must reject translation semantics');
assert.ok((home.searchDescription || '').length <= 165, 'Homepage search description should remain concise');
assert.strictEqual(home.lastmod, '2026-08-12', 'Homepage acquisition revision date must be current');

assert.ok(homeHtml.includes(`<title>${home.searchTitle}</title>`), 'Initial homepage HTML must expose the acquisition title without waiting for JavaScript');
assert.ok(homeHtml.includes(`<meta name="description" content="${home.searchDescription}">`), 'Initial homepage HTML must expose the acquisition description without waiting for JavaScript');
assert.ok(homeHtml.includes(`<meta property="og:title" content="${home.searchTitle}"`), 'Initial homepage Open Graph title must match acquisition ownership');
assert.ok(homeHtml.includes(`<meta name="twitter:title" content="${home.searchTitle}"`), 'Initial homepage Twitter title must match acquisition ownership');
assert.match(homeHtml, /<h1>Type Roman Urdu and convert it to Urdu script<\/h1>/, 'Static homepage task heading changed');
assert.match(homeHtml, /How to type Urdu with English letters/i, 'Homepage must visibly explain the English-letter workflow');
assert.match(homeHtml, /Type Roman Urdu[\s\S]*Press Space[\s\S]*Urdu script/i, 'Homepage must expose the real conversion workflow');
assert.match(homeHtml, /transliteration:[\s\S]*not English meaning/i, 'Homepage must keep transliteration-not-translation wording');
assert.doesNotMatch(homeHtml, /<ins[^>]+adsbygoogle/i, 'Homepage must not hard-code an ad inside the active writing markup');

assert.match(tutorial.title, /Video Tutorial/i, 'Tutorial must remain a walkthrough owner, not the product owner');
assert.doesNotMatch(tutorial.title, /^English to Urdu Typing Online/i, 'Tutorial must not compete for the prime product title');
assert.match(richEditor.title, /Rich Text Editor/i, 'Rich Editor must retain formatting ownership');
assert.doesNotMatch(richEditor.title, /^English to Urdu Typing Online/i, 'Rich Editor must not compete for the prime product title');
assert.match(keyboard.title, /Urdu Keyboard/i, 'Keyboard must retain direct-input ownership');
assert.doesNotMatch(keyboard.title, /^English to Urdu Typing Online/i, 'Keyboard must not compete for the prime product title');
assert.match(romanGuide.title, /Transliteration, Not Translation/i, 'Roman Urdu guide must retain language-mechanics ownership');
assert.match(formattingGuide.title, /Formatting Guide/i, 'Formatting guide must retain formatting-reference ownership');

assert.match(runtimeSeo, /home: \['English to Urdu typing'/, 'Homepage entity topics must include the prime typing phrase');
assert.match(runtimeSeo, /function applyResolvedSearchMetadata\(\)/, 'Runtime SEO must centralize resolved search metadata');
assert.match(runtimeSeo, /function applyResolvedEnglishHeading\(\)/, 'Runtime SEO must centralize canonical English H1 restoration');
assert.match(runtimeSeo, /write-urdu:locale-change[\s\S]*restoreResolvedPageIdentityAfterLocale/, 'Runtime SEO must restore registry page identity from the shared-shell locale lifecycle');
assert.match(runtimeSeo, /locale !== ['"]ur['"][\s\S]*applyResolvedSearchMetadata\(\)[\s\S]*applyResolvedEnglishHeading\(\)/, 'English shell applications must restore acquisition metadata and registered H1 without overriding Urdu localization');

assert.match(llms, /homepage is the main English to Urdu typing/i, 'llms.txt must name the homepage as the English-to-Urdu typing owner');
assert.match(llms, /English to Urdu typing \/ Urdu typing online/, 'llms.txt start-writing section must expose the prime acquisition job');
assert.match(sitemap, /<loc>https:\/\/www\.write-urdu\.com\/<\/loc>[\s\S]*?<lastmod>2026-08-12<\/lastmod>/, 'Homepage sitemap freshness must reflect the acquisition revision');
assert.match(redirects, /^\/index\.html \/ 301$/m, 'Legacy homepage URL must continue consolidating to the canonical root');

for (const forbidden of ['/english-to-urdu-typing', '/english-urdu-typing', '/type-urdu-in-english', '/urdu-typing-in-english']) {
  assert.strictEqual(Boolean(seo.byPath[forbidden]), false, `Doorway route must not exist: ${forbidden}`);
}
assert.match(spec, /Do \*\*not\*\* create keyword-clone routes/i, 'Acquisition spec must retain the doorway-page guardrail');
assert.match(spec, /transliteration, not translation/i, 'Acquisition spec must preserve product semantics');

console.log('English to Urdu typing acquisition contract passed.');
