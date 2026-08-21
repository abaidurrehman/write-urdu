const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const about = fs.readFileSync(path.join(root, 'why-write-urdu.html'), 'utf8');
const privacy = fs.readFileSync(path.join(root, 'write-urdu-privacy.html'), 'utf8');
const trustCss = fs.readFileSync(path.join(root, 'css', 'v3-trust.css'), 'utf8');
const ads = require(path.join(root, 'js', 'ads.js'));
const registry = fs.readFileSync(path.join(root, 'docs', 'WU-PUBLIC-PAGE-REGISTRY.csv'), 'utf8');

for (const [name, source] of [['About', about], ['Privacy', privacy]]) {
  assert.match(source, /class=\"content-page v3-trust-page/, `${name} must use the shared V3 trust page hook`);
  assert.match(source, /css\/v3-trust\.css/, `${name} must load the shared trust stylesheet`);
  assert.match(source, /seo\.config\.js/, `${name} must retain the shared SEO registry runtime`);
  assert.match(source, /js\/seo\.js/, `${name} must retain resolved canonical/schema behavior`);
  assert.match(source, /site-header\.js/, `${name} must retain the shared product shell`);
  assert.doesNotMatch(source, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i, `${name} must not contain advertising markup`);
  assert.doesNotMatch(source, /bootstrap|jquery|w3\.css|connect\.facebook\.net|fb-root|xfbml|twitter-wjs|fb-comments/i, `${name} must not restore legacy framework/social widget embeds`);
}

assert.match(about, /<h1 id=\"about-title\">About Write Urdu<\/h1>/, 'About page must statically match SEO-owned H1');
assert.match(about, /How the project is maintained/, 'About page must retain maintenance/evidence information');
assert.match(about, /What Write Urdu does not promise/, 'About page must state product limitations clearly');
assert.match(about, /admin@write-urdu\.com/, 'About page must retain a correction contact channel');

assert.match(privacy, /<h1 id=\"privacy-title\">Write Urdu privacy policy and terms<\/h1>/, 'Privacy page must statically match SEO-owned H1');
assert.match(privacy, /Write Urdu data processing summary/, 'Privacy page must retain the feature processing table');
assert.match(privacy, /Governing Law/, 'Privacy page must retain the existing terms sections');
assert.match(privacy, /laws of Pakistan/, 'Existing governing-law statement must not be silently removed by the visual migration');
assert.match(privacy, /Google transliteration service/, 'Privacy page must disclose transliteration provider behavior');

assert.strictEqual(ads.resolvePageType('/why-write-urdu'), 'trust', 'About must stay in the ad-free trust group');
assert.strictEqual(ads.resolvePageType('/write-urdu-privacy'), 'trust', 'Privacy must stay in the ad-free trust group');
assert.match(trustCss, /\.v3-trust-page \.wu-header-ad[\s\S]*display:\s*none\s*!important/, 'Trust CSS needs a second visual no-ad guard');
assert.match(trustCss, /@media \(max-width: 700px\)/, 'Trust pages need a mobile layout breakpoint');

assert.match(registry, /why-write-urdu\.html,\/why-write-urdu,About,[^\n]*,migrated,P1,/, 'About registry status must be migrated');
assert.match(registry, /write-urdu-privacy\.html,\/write-urdu-privacy,About,[^\n]*,migrated,P1,/, 'Privacy registry status must be migrated');

console.log('V3 trust-page migration contracts passed.');
