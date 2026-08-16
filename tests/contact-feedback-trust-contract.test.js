const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const config = require(path.join(root, 'seo.config.js'));
const ads = require(path.join(root, 'js', 'ads.js'));

const contact = read('contact.html');
const feedback = read('feedback.html');
const client = read('js/contact-forms.js');
const endpoint = read('functions/api/messages.js');
const formConfig = read('functions/api/form-config.js');
const mailer = read('workers/form-mailer/src/index.js');
const privacy = read('write-urdu-privacy.html');
const redirects = read('_redirects');
const sitemap = read('sitemap.xml');
const humanSitemap = read('write-urdu-sitemap.html');
const shell = read('js/v2-shell.js');
const registry = read('docs/WU-PUBLIC-PAGE-REGISTRY.csv');

assert.match(contact, /rel="canonical" href="https:\/\/write-urdu\.com\/contact"/, 'Contact canonical route is missing');
assert.match(contact, /name="robots" content="index,follow,max-image-preview:large"/, 'Contact should be indexable');
assert.match(contact, /<h1 id="contact-title">A direct way to reach Write Urdu\.<\/h1>/, 'Contact H1 changed unexpectedly');
assert.match(contact, /action="\/api\/messages"/, 'Contact form must submit to the first-party endpoint');
assert.match(contact, /data-form-type="contact"/, 'Contact form type marker is missing');
for (const field of ['name', 'email', 'topic', 'subject', 'message']) {
  assert.match(contact, new RegExp(`name="${field}"`), `Contact form is missing ${field}`);
}
assert.match(contact, /Keep private writing out of support messages/, 'Contact page must warn against sensitive submissions');
assert.match(contact, /admin@write-urdu\.com/, 'Contact page must preserve the public email fallback');
assert.doesNotMatch(contact, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i, 'Contact must not contain an ad unit');

assert.match(feedback, /rel="canonical" href="https:\/\/write-urdu\.com\/feedback"/, 'Feedback canonical route is missing');
assert.match(feedback, /name="robots" content="noindex,follow"/, 'Feedback must remain noindex');
assert.match(feedback, /data-form-type="feedback"/, 'Feedback form type marker is missing');
assert.match(feedback, /name="rating" value="5"/, 'Optional feedback rating is missing');
assert.match(feedback, /Reply email <em>Optional<\/em>/, 'Feedback reply email must remain optional');
assert.match(feedback, /Keep private writing private/, 'Feedback page must warn against sensitive submissions');
assert.match(feedback, /href="\/contact"/, 'Feedback must route support questions to Contact');
assert.doesNotMatch(feedback, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i, 'Feedback must not contain an ad unit');

assert.match(client, /\/api\/form-config/, 'Form client must retrieve server configuration');
assert.match(client, /\/api\/messages/, 'Form client must use the first-party submission endpoint');
assert.match(client, /challenges\.cloudflare\.com\/turnstile/, 'Form client must use Cloudflare Turnstile');
assert.match(client, /data-form-fallback/, 'Form client must preserve an email fallback when the service is unavailable');
assert.doesNotMatch(client, /localStorage|getItem\(['"][^'"]*(draft|card|invoice|qr)/i, 'Contact forms must not read local product content');

assert.match(formConfig, /TURNSTILE_SITE_KEY/, 'Form config must expose the public Turnstile site key');
assert.match(formConfig, /TURNSTILE_SECRET_KEY/, 'Form config must require the Turnstile secret');
assert.match(formConfig, /FORM_MAILER/, 'Form config must require the private mailer binding');
assert.doesNotMatch(formConfig, /TURNSTILE_SECRET_KEY[^\n]*JSON\.stringify|secretKey/i, 'Form config must never expose the Turnstile secret');

assert.match(endpoint, /MAX_BODY_BYTES = 16_384/, 'Submission endpoint must cap request bodies');
assert.match(endpoint, /MIN_COMPLETION_MS = 1_500/, 'Submission endpoint must keep the secondary fast-submit spam signal');
assert.match(endpoint, /TOPIC_LABELS/, 'Submission endpoint needs server-owned topic allowlists');
assert.match(endpoint, /requestIsSameOrigin/, 'Submission endpoint must enforce same-origin browser submissions');
assert.match(endpoint, /cf-turnstile-response/, 'Submission endpoint must require a Turnstile token');
assert.match(endpoint, /siteverify/, 'Submission endpoint must verify Turnstile server-side');
assert.match(endpoint, /FORM_MAILER\.fetch/, 'Submission endpoint must deliver through the private Service binding');
assert.match(endpoint, /\[Write Urdu \$\{formLabel\}\]/, 'Email subject must be constructed from a server-owned prefix');
assert.doesNotMatch(endpoint, /INSERT|METRICS_DB|product_events/i, 'Contact submissions must not be stored in product telemetry');
assert.doesNotMatch(endpoint, /filename|attachment/i, 'Contact endpoint must not accept file attachments');

assert.match(mailer, /\[Write Urdu Feedback\]/, 'Mailer must restrict feedback subject prefixes');
assert.match(mailer, /\[Write Urdu Contact\]/, 'Mailer must restrict contact subject prefixes');
assert.match(mailer, /FORM_EMAIL\.send/, 'Mailer must use the destination-restricted send_email binding');
assert.match(mailer, /FORM_TO_EMAIL/, 'Mailer destination must come from deployment configuration');
assert.doesNotMatch(mailer, /payload\?\.to|payload\?\.from/, 'Visitor payload must not choose mail sender or destination');

assert.match(privacy, /id="contact-feedback-data"/, 'Privacy policy must expose a contact/feedback processing section');
assert.match(privacy, /Cloudflare Turnstile/, 'Privacy policy must identify spam verification processing');
assert.match(privacy, /does not store a separate copy of the form submission in the product-telemetry database/, 'Privacy policy must separate messages from product telemetry');
assert.match(privacy, /Editor drafts, local images and browser-stored projects are not attached automatically/, 'Privacy policy must preserve the local-content boundary');

assert.strictEqual(config.PUBLISHER.contactPath, '/contact', 'Organization contactPoint should use the dedicated contact route');
assert.strictEqual(config.pages.find(page => page.path === '/contact').indexable, true, 'Contact must remain indexable');
assert.strictEqual(config.pages.find(page => page.path === '/feedback').indexable, false, 'Feedback must remain noindex');
assert.strictEqual(ads.resolvePageType('/contact'), 'trust', 'Contact must be ad-free');
assert.strictEqual(ads.resolvePageType('/feedback'), 'trust', 'Feedback must be ad-free');

assert.match(redirects, /^\/write-urdu-feedback \/feedback 301$/m, 'Legacy feedback route must permanently redirect to /feedback');
assert.match(redirects, /^\/write-urdu-feedback\.html \/feedback 301$/m, 'Legacy feedback HTML route must permanently redirect to /feedback');
assert.match(sitemap, /<loc>https:\/\/write-urdu\.com\/contact<\/loc>/, 'Indexable Contact must be in the XML sitemap');
assert.doesNotMatch(sitemap, /<loc>https:\/\/write-urdu\.com\/feedback<\/loc>/, 'Noindex Feedback must not be in the XML sitemap');
assert.match(humanSitemap, /href="\/contact"/, 'Human sitemap must expose Contact');
assert.match(humanSitemap, /href="\/feedback"/, 'Human sitemap must expose Feedback');
assert.match(shell, /link\('\/contact'/, 'Shared footer must expose Contact');
assert.match(shell, /link\('\/feedback'/, 'Shared footer must expose Feedback');
assert.match(registry, /contact\.html,\/contact,About,[^\n]*,index,yes,keep,migrated,P1,/, 'Contact registry entry is missing');
assert.match(registry, /feedback\.html,\/feedback,About,[^\n]*,noindex,no,keep,migrated,P2,/, 'Feedback registry entry is missing');

console.log('Contact and feedback trust contracts passed.');
