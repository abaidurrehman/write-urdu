const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const feedback = fs.readFileSync(path.join(root, 'write-urdu-feedback.html'), 'utf8');
const search = fs.readFileSync(path.join(root, 'write-urdu-search.html'), 'utf8');
const utilityCss = fs.readFileSync(path.join(root, 'css', 'v3-utility.css'), 'utf8');
const ads = require(path.join(root, 'js', 'ads.js'));
const registry = fs.readFileSync(path.join(root, 'docs', 'WU-PUBLIC-PAGE-REGISTRY.csv'), 'utf8');

for (const [name, source] of [['Feedback', feedback], ['Search', search]]) {
  assert.match(source, /class=\"content-page v3-utility-page/, `${name} must use the shared V3 utility hook`);
  assert.match(source, /css\/v3-utility\.css/, `${name} must load the shared V3 utility stylesheet`);
  assert.match(source, /seo\.config\.js/, `${name} must retain SEO registry behavior`);
  assert.match(source, /js\/seo\.js/, `${name} must retain resolved canonical/robots behavior`);
  assert.match(source, /site-header\.js/, `${name} must use the shared product shell`);
  assert.match(source, /noindex,follow/, `${name} utility must remain noindex,follow`);
  assert.doesNotMatch(source, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i, `${name} utility must not contain AdSense units`);
  assert.doesNotMatch(source, /bootstrap|jquery|w3\.css|font-awesome|facebook|twitter-wjs|fb-comments/i, `${name} must not restore legacy framework/social dependencies`);
}

assert.match(feedback, /<h1 id=\"feedback-title\">Write Urdu feedback<\/h1>/, 'Feedback H1 must match SEO registry ownership');
assert.match(feedback, /admin@write-urdu\.com/, 'Feedback page must expose the public correction email');
assert.match(feedback, /Remove private writing from reports/, 'Feedback page must warn users not to send private writing');
assert.match(feedback, /Device and browser/, 'Feedback page must request useful reproduction context');

assert.match(search, /<h1 id=\"search-title\">Search Write Urdu<\/h1>/, 'Search H1 must match SEO registry ownership');
assert.match(search, /partner-pub-4727847909946286:e8ay8o1zxjh/, 'Google Custom Search engine ID must be preserved');
assert.match(search, /id=\"cse-search-results\"/, 'Google Custom Search result mount must be preserved');
assert.match(search, /googleSearchIframeName/, 'Google Custom Search result configuration must be preserved');
assert.match(search, /Search queries are sent to Google/, 'Search page must disclose third-party query processing');
assert.match(search, /\/roman-urdu-transliteration/, 'Search page should offer a direct non-query route to the Roman Urdu guide');

assert.strictEqual(ads.resolvePageType('/write-urdu-feedback'), 'trust', 'Feedback must remain in the ad-free trust group');
assert.strictEqual(ads.resolvePageType('/write-urdu-search'), 'trust', 'Search must remain in the ad-free trust group');
assert.match(utilityCss, /\.v3-utility-page \.wu-header-ad[\s\S]*display:\s*none\s*!important/, 'Utility CSS needs a second visual no-ad guard');
assert.match(utilityCss, /@media \(max-width: 680px\)/, 'Utility pages need a narrow responsive breakpoint');
assert.match(registry, /write-urdu-feedback\.html,\/write-urdu-feedback,About,[^\n]*,migrated,P2,/, 'Feedback registry status must be migrated');
assert.match(registry, /write-urdu-search\.html,\/write-urdu-search,Utility,[^\n]*,migrated,P2,/, 'Search registry status must be migrated');

console.log('V3 utility-page migration contracts passed.');
