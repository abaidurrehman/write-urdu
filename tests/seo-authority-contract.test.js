const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const config = require(path.join(root, 'seo.config.js'));

const home = config.pages.find(page => page.id === 'home');
assert.ok(home, 'homepage SEO registry entry is missing');
assert.match(home.title || '', /^Urdu Typing Online\b/i, 'homepage title must lead with the existing Urdu typing opportunity');
assert.match(home.title || '', /English Letters/i, 'homepage title must explain the English-letter Urdu input method');
assert.match(home.description || '', /English letters/i, 'homepage description must describe English-letter Urdu input');
assert.match(home.description || '', /Urdu script/i, 'homepage description must describe Urdu-script output');
assert.match(home.description || '', /no account/i, 'homepage description must preserve the accurate no-account benefit');
assert.ok(home.description.length <= 165, 'homepage description should stay concise enough for a useful mobile snippet');
assert.strictEqual(home.h1, 'English to Urdu Typing Online', 'homepage H1 must preserve the Search Console language contract');
const homeHtml = read('index.html');
const resolvedHomeTitle = home.searchTitle || home.title;
const resolvedHomeDescription = home.searchDescription || home.description;
assert.match(homeHtml, new RegExp(`<title>${resolvedHomeTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/title>`), 'static homepage title must match the resolved SEO registry title');
assert.match(homeHtml, new RegExp(`<meta name="description" content="${resolvedHomeDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`), 'static homepage description must match the resolved SEO registry description');

const publisher = config.PUBLISHER;
assert.strictEqual(publisher.type, 'Organization', 'publisher must remain an Organization while no public individual byline is used');
assert.strictEqual(publisher.publicMaintainerName, null, 'private maintainer identity must not be published through SEO config');
assert.strictEqual(publisher.contactEmail, 'admin@write-urdu.com', 'public contact email changed unexpectedly');
assert.strictEqual(publisher.contactPath, '/contact', 'Organization contactPoint must resolve to the dedicated public contact route');
assert.strictEqual(publisher.aboutPath, '/why-write-urdu', 'About authority route changed unexpectedly');
assert.strictEqual(publisher.privacyPath, '/write-urdu-privacy', 'Privacy authority route changed unexpectedly');
assert.strictEqual(publisher.publishingPrinciplesPath, '/why-write-urdu', 'publishing principles must resolve to a real public page');
assert.ok(Array.isArray(publisher.alternateName) && publisher.alternateName.includes('WriteUrdu'), 'stable alternate brand name is missing');
assert.strictEqual(Object.prototype.hasOwnProperty.call(publisher, 'sameAs'), false, 'unverified sameAs profiles must not be added');

const aboutConfig = config.pages.find(page => page.id === 'why-write-urdu');
const privacyConfig = config.pages.find(page => page.id === 'write-urdu-privacy');
const contactConfig = config.pages.find(page => page.id === 'contact');
const feedbackConfig = config.pages.find(page => page.id === 'feedback');
assert.deepStrictEqual(aboutConfig.schema, [], 'About must use AboutPage semantics rather than pretending to be an Article');
assert.deepStrictEqual(privacyConfig.schema, [], 'Privacy policy must remain a WebPage rather than pretending to be an Article');
assert.ok(contactConfig && contactConfig.indexable === true && contactConfig.path === '/contact', 'Contact must be a durable indexable trust page');
assert.ok(feedbackConfig && feedbackConfig.indexable === false && feedbackConfig.path === '/feedback', 'Feedback must remain a noindex product utility');
const romanConfig = config.pages.find(page => page.id === 'roman-urdu-transliteration');
assert.strictEqual(romanConfig.datePublished, '2026-07-16', 'Roman Urdu publication date must match the visible published date');
assert.strictEqual(romanConfig.lastmod, '2026-08-19', 'Roman Urdu revision date must reflect the plain-language update');

const seo = read('js/seo.js');
assert.match(seo, /page\.searchTitle \|\| page\.title/, 'runtime SEO must support a search-facing title override when explicitly needed');
assert.match(seo, /page\.searchDescription \|\| page\.description/, 'runtime SEO must support a search-facing description override when explicitly needed');
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
assert.doesNotMatch(seo, /SearchAction|query-input|search_term_string/, 'retired sitelinks search action markup should not remain in the entity graph');

const llms = read('llms.txt');
assert.match(llms, /^# Write Urdu\r?\n\r?\n> /, 'llms.txt must begin with the proposed H1 and summary structure');
assert.match(llms, /Canonical site: https:\/\/write-urdu\.com\//, 'llms.txt canonical site statement is missing');
assert.match(llms, /does not translate an English sentence into Urdu/i, 'llms.txt must preserve the English-letter typing versus translation distinction in plain language');
assert.match(llms, /Last reviewed: 2026-08-28/, 'llms.txt review date is stale');
assert.match(llms, /AI writing help inside the Urdu editor/, 'llms.txt must describe the shipped AI writing workflow without creating a thin AI route');
assert.match(llms, /## Start writing/, 'llms.txt must prioritize core writing workflows');
assert.match(llms, /## Trust, policies and corrections/, 'llms.txt trust resource section is missing');
assert.match(llms, /https:\/\/write-urdu\.com\/why-write-urdu/, 'llms.txt must link to About');
assert.match(llms, /https:\/\/write-urdu\.com\/contact/, 'llms.txt must link to Contact');
assert.match(llms, /https:\/\/write-urdu\.com\/feedback/, 'llms.txt must link to the public product-feedback channel');
assert.match(llms, /https:\/\/write-urdu\.com\/write-urdu-privacy/, 'llms.txt must link to Privacy');
assert.match(llms, /https:\/\/write-urdu\.com\/\.well-known\/security\.txt/, 'llms.txt must link to the standard security contact file');
assert.match(llms, /## Optional/, 'llms.txt should keep secondary resources skippable');
assert.doesNotMatch(llms, /https:\/\/write-urdu\.com\/[\w-]+\.html/, 'llms.txt must use canonical extensionless routes');
assert.doesNotMatch(llms, /being reviewed|internal|dogfood|guarantee|guaranteed ranking|guaranteed citation/i, 'llms.txt must remain public-facing and avoid internal or outcome-guarantee language');

const robots = read('robots.txt');
assert.match(robots, /User-agent:\s*OAI-SearchBot[\s\S]*?Allow:\s*\//i, 'OAI-SearchBot must remain allowed for search discovery');
assert.match(robots, /User-agent:\s*GPTBot[\s\S]*?Disallow:\s*\//i, 'GPTBot training policy must remain explicitly blocked');

const sitemap = read('sitemap.xml');
const revisionDates = {
  '/': '2026-08-19',
  '/urdu-editor': '2026-08-07',
  '/urdu-keyboard': '2026-08-07',
  '/urdu-alphabet': '2026-08-07',
  '/write-urdu-documentation': '2026-08-07',
  '/urdu-faq': '2026-08-22',
  '/roman-urdu-transliteration': '2026-08-19',
  '/urdu-name-art-maker': '2026-08-13',
  '/urdu-card-studio': '2026-08-17',
  '/how-to-share-urdu-writing-online': '2026-08-17',
  '/write-urdu-privacy': '2026-08-22',
  '/contact': '2026-08-22',
  '/write-urdu-sitemap': '2026-08-15'
};
for (const [route, revisionDate] of Object.entries(revisionDates)) {
  const page = config.pages.find(candidate => candidate.path === route);
  assert.ok(page && page.lastmod === revisionDate, `${route} must carry its current material revision date in config`);
  const escaped = route === '/' ? 'https://write-urdu.com/' : `https://write-urdu.com${route}`;
  const block = sitemap.match(new RegExp(`<url>[\\s\\S]*?<loc>${escaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/loc>[\\s\\S]*?<\\/url>`));
  assert.ok(block, `sitemap is missing ${route}`);
  assert.match(block[0], new RegExp(`<lastmod>${revisionDate}<\\/lastmod>`), `${route} sitemap lastmod is stale`);
}
assert.doesNotMatch(sitemap, /<loc>https:\/\/write-urdu\.com\/feedback<\/loc>/, 'noindex Feedback must stay out of the XML sitemap');
assert.doesNotMatch(sitemap, /<loc>https:\/\/write-urdu\.com\/s\//, 'user-generated share pages must stay out of the XML sitemap');

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
