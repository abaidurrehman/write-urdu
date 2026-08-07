const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const config = require(path.join(root, 'seo.config.js'));

const home = config.pages.find(page => page.id === 'home');
assert.ok(home, 'homepage SEO registry entry is missing');
assert.match(home.searchTitle || '', /^Urdu Typing Online\b/i, 'search-facing homepage title must lead with the existing Urdu typing opportunity');
assert.match(home.searchTitle || '', /English Letters/i, 'homepage search title must explain the real Roman Urdu input method');
assert.match(home.searchDescription || '', /Roman Urdu/i, 'homepage search description must describe Roman Urdu input');
assert.match(home.searchDescription || '', /Urdu script/i, 'homepage search description must describe Urdu-script output');
assert.match(home.searchDescription || '', /no account/i, 'homepage search description must preserve the accurate no-account benefit');
assert.ok(home.searchDescription.length <= 165, 'homepage search description should stay concise enough for a useful mobile snippet');
assert.strictEqual(home.h1, 'Type Roman Urdu and convert it to Urdu script', 'homepage H1 ownership contract changed');

const publisher = config.PUBLISHER;
assert.strictEqual(publisher.type, 'Organization', 'publisher must remain an Organization while no public individual byline is used');
assert.strictEqual(publisher.publicMaintainerName, null, 'private maintainer identity must not be published through SEO config');
assert.strictEqual(publisher.contactEmail, 'admin@write-urdu.com', 'public correction email changed unexpectedly');
assert.strictEqual(publisher.contactPath, '/write-urdu-feedback', 'public correction route changed unexpectedly');
assert.strictEqual(publisher.aboutPath, '/why-write-urdu', 'About authority route changed unexpectedly');
assert.strictEqual(publisher.privacyPath, '/write-urdu-privacy', 'Privacy authority route changed unexpectedly');
assert.strictEqual(publisher.publishingPrinciplesPath, '/why-write-urdu', 'publishing principles must resolve to a real public page');
assert.ok(Array.isArray(publisher.alternateName) && publisher.alternateName.includes('WriteUrdu'), 'stable alternate brand name is missing');
assert.strictEqual(Object.prototype.hasOwnProperty.call(publisher, 'sameAs'), false, 'unverified sameAs profiles must not be added');

const aboutConfig = config.pages.find(page => page.id === 'why-write-urdu');
const privacyConfig = config.pages.find(page => page.id === 'write-urdu-privacy');
assert.deepStrictEqual(aboutConfig.schema, [], 'About must use AboutPage semantics rather than pretending to be an Article');
assert.deepStrictEqual(privacyConfig.schema, [], 'Privacy policy must remain a WebPage rather than pretending to be an Article');
const romanConfig = config.pages.find(page => page.id === 'roman-urdu-transliteration');
assert.strictEqual(romanConfig.datePublished, '2026-07-16', 'Roman Urdu publication date must match the visible published date');
assert.strictEqual(romanConfig.lastmod, '2026-08-07', 'Roman Urdu revision date must remain distinct from its publication date');

const seo = read('js/seo.js');
assert.match(seo, /page\.searchTitle \|\| page\.title/, 'runtime SEO must use the search-facing title when present');
assert.match(seo, /page\.searchDescription \|\| page\.description/, 'runtime SEO must use the search-facing description when present');
assert.match(seo, /alternateName:\s*publisher\.alternateName/, 'WebSite must expose factual alternate brand names');
assert.match(seo, /contactPoint\s*=\s*\{/, 'Organization must expose a public contact point');
assert.match(seo, /publishingPrinciples/, 'Organization and articles must expose the public publishing principles');
assert.match(seo, /knowsLanguage:\s*\['en', 'ur'\]/, 'Organization language knowledge must be explicit');
assert.match(seo, /page\.id === 'why-write-urdu' \? 'AboutPage' : 'WebPage'/, 'About page should have a specific AboutPage entity type');
assert.match(seo, /webpageNode\.dateModified = page\.lastmod/, 'page revision dates must be represented in the graph');
assert.match(seo, /mainEntityOfPage:\s*\{ '@id': webpageId \}/, 'primary content entities must connect back to the canonical WebPage');
assert.match(seo, /webpageNode\.mainEntity = \{ '@id': applicationId \}/, 'tool pages must connect WebPage to WebApplication');
assert.match(seo, /hasSchema\('Article'\) \? 'article' : 'website'/, 'Open Graph type must distinguish maintained articles from website pages');
assert.match(seo, /hasSchema\('Article'\) && page\.lastmod/, 'article modified-time metadata must be restricted to genuine Article pages');
assert.match(seo, /if \(page\.datePublished\) article\.datePublished = page\.datePublished;/, 'Article publication date must only come from explicit publication evidence');
assert.doesNotMatch(seo, /article\.datePublished = page\.datePublished \|\| page\.lastmod/, 'Article publication date must never be synthesized from lastmod');
assert.doesNotMatch(seo, /image:\s*config\.SITE_ORIGIN \+ \(publisher\.logoPath/, 'Article image must not reuse the publisher logo as editorial imagery');

const llms = read('llms.txt');
assert.match(llms, /^# Write Urdu\n\n> /, 'llms.txt must begin with the proposed H1 and summary structure');
assert.match(llms, /Canonical site: https:\/\/write-urdu\.com\//, 'llms.txt canonical site statement is missing');
assert.match(llms, /transliteration, not translation/i, 'llms.txt must preserve the central transliteration distinction');
assert.match(llms, /Last reviewed: 2026-08-07/, 'llms.txt review date is missing');
assert.match(llms, /## Start writing/, 'llms.txt must prioritize core writing workflows');
assert.match(llms, /## Trust, policies and corrections/, 'llms.txt trust resource section is missing');
assert.match(llms, /https:\/\/write-urdu\.com\/why-write-urdu/, 'llms.txt must link to About');
assert.match(llms, /https:\/\/write-urdu\.com\/write-urdu-privacy/, 'llms.txt must link to Privacy');
assert.match(llms, /https:\/\/write-urdu\.com\/write-urdu-feedback/, 'llms.txt must link to the public correction channel');
assert.match(llms, /https:\/\/write-urdu\.com\/\.well-known\/security\.txt/, 'llms.txt must link to the standard security contact file');
assert.match(llms, /## Optional/, 'llms.txt should keep secondary resources skippable');
assert.doesNotMatch(llms, /https:\/\/write-urdu\.com\/[\w-]+\.html/, 'llms.txt must use canonical extensionless routes');
assert.doesNotMatch(llms, /being reviewed|internal|dogfood|guarantee|guaranteed ranking|guaranteed citation/i, 'llms.txt must remain public-facing and avoid internal or outcome-guarantee language');

const robots = read('robots.txt');
assert.match(robots, /User-agent:\s*OAI-SearchBot[\s\S]*?Allow:\s*\//i, 'OAI-SearchBot must remain allowed for search discovery');
assert.match(robots, /User-agent:\s*GPTBot[\s\S]*?Disallow:\s*\//i, 'GPTBot training policy must remain explicitly blocked');

const sitemap = read('sitemap.xml');
for (const route of ['/', '/urdu-editor', '/urdu-keyboard', '/urdu-alphabet', '/write-urdu-documentation', '/urdu-faq', '/roman-urdu-transliteration']) {
  const page = config.pages.find(candidate => candidate.path === route);
  assert.ok(page && page.lastmod === '2026-08-07', `${route} must carry the current material revision date in config`);
  const escaped = route === '/' ? 'https://write-urdu.com/' : `https://write-urdu.com${route}`;
  const block = sitemap.match(new RegExp(`<url>[\\s\\S]*?<loc>${escaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/loc>[\\s\\S]*?<\\/url>`));
  assert.ok(block, `sitemap is missing ${route}`);
  assert.match(block[0], /<lastmod>2026-08-07<\/lastmod>/, `${route} sitemap lastmod is stale`);
}

const about = read('why-write-urdu.html');
assert.match(about, /Who maintains Write Urdu/, 'About page must identify the project maintainer model');
assert.match(about, /Editorial and correction policy/, 'About page must expose a visible correction policy');
assert.match(about, /admin@write-urdu\.com/, 'About page must expose the public correction email');

const security = read('.well-known/security.txt');
assert.match(security, /^Contact: mailto:admin@write-urdu\.com$/m, 'security.txt must use the public security contact');
assert.match(security, /^Canonical: https:\/\/write-urdu\.com\/\.well-known\/security\.txt$/m, 'security.txt canonical URL is missing');
assert.match(security, /^Expires: 2027-08-07T00:00:00Z$/m, 'security.txt must carry a future expiry date');

const ads = read('ads.txt');
assert.match(ads, /^google\.com, pub-4727847909946286, DIRECT, f08c47fec0942fa0\s*$/i, 'ads.txt must declare the configured Google publisher relationship');

const spec = read('docs/WU-SEO-AUTHORITY-001.md');
assert.match(spec, /7,162 impressions/, 'authority spec must preserve the Urdu typing Search Console baseline');
assert.match(spec, /3,705 impressions/, 'authority spec must preserve the Urdu writing Search Console baseline');
assert.match(spec, /Do not add unverified founder identity/, 'authority spec must forbid invented trust signals');

console.log('WriteUrdu SEO authority and citation-readiness contract checks passed.');
