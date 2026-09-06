const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, '10-years-of-write-urdu.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'heritage-impact.css'), 'utf8');
const evidence = fs.readFileSync(path.join(root, 'docs', 'WU-HERITAGE-001-EVIDENCE-2026-09-06.md'), 'utf8');
const registry = fs.readFileSync(path.join(root, 'docs', 'WU-PUBLIC-PAGE-REGISTRY.csv'), 'utf8');
const redirects = fs.readFileSync(path.join(root, '_redirects'), 'utf8');
const humanSitemap = fs.readFileSync(path.join(root, 'write-urdu-sitemap.html'), 'utf8');
const seo = require(path.join(root, 'seo.config.js'));
const ads = require(path.join(root, 'js', 'ads.js'));

assert.match(page, /<h1 id="heritage-title">10 years of writing Urdu together<\/h1>/, 'Heritage H1 must stay aligned with the approved anniversary narrative');
assert.match(page, /online since <strong>July 2016<\/strong>/, 'Founder-confirmed July 2016 launch month must remain visible');
assert.match(page, /lang="ur" dir="rtl">دس سال، لاکھوں الفاظ، بے شمار کہانیاں/, 'Heritage hero must include meaningful Urdu copy with language/direction semantics');

assert.match(page, /Measured · recent week[\s\S]*4,408/, 'Broader weekly engaged-visits count must be visible and labelled as measured');
assert.match(page, /Derived · recent week[\s\S]*1,132/, 'Derived recent non-zero writing-session count must be visible and labelled as a weekly sample');
assert.match(page, /Measured · recent week[\s\S]*140/, 'Measured 2500+ writing-session count must be visible and labelled as a weekly sample');
assert.match(page, /Estimated · lifetime scale[\s\S]*Tens of millions/, 'Lifetime scale must be visibly labelled as estimated');
assert.match(page, /0\.65–1\.0 million characters/, 'Public methodology must disclose the bounded recent character estimate');
assert.match(page, /57–87 million word-equivalents/, 'Public methodology must show the disclosed lifetime scale rather than a hidden magic number');
assert.doesNotMatch(page, /100 million words (?:written|were written)/i, 'Heritage page must not hard-claim an unsupported exact 100 million words');
assert.doesNotMatch(page, /thousands of books were written/i, 'Illustrative book equivalents must not become false observed use cases');

assert.match(page, /not a tracked breakdown of people's private text/i, 'Human-purpose section must state that private writing purposes are not tracked');
assert.match(page, /We can estimate how much was written\. We cannot tell you what was written\./, 'Privacy/impact principle must remain explicit');
assert.match(page, /<details class="heritage-methodology">/, 'Methodology must use an accessible disclosure element');
assert.match(page, /href="\/feedback\?topic=write-urdu-story"/, 'Slice A story invitation must use the existing feedback route only');
assert.match(page, /We review stories before anything is published/i, 'Story CTA must set human-review expectations');
assert.match(page, /Please do not paste the private document, message, application or letter you wrote/i, 'Story CTA needs a privacy reminder');
assert.doesNotMatch(page, /<blockquote[^>]*class="[^"]*testimonial|data-testimonial|aggregateRating/i, 'Heritage A must not seed fake testimonials or review schema');

assert.match(page, /css\/v3-trust\.css/, 'Heritage page must reuse the V3 trust foundation');
assert.match(page, /css\/heritage-impact\.css/, 'Heritage page must load its scoped editorial extension');
assert.doesNotMatch(page, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i, 'Heritage page source must remain ad-free');
assert.doesNotMatch(page, /bootstrap|jquery|connect\.facebook\.net|fb-root|xfbml|twitter-wjs|fb-comments/i, 'Heritage page must not restore legacy framework/social embeds');

assert.match(css, /\.heritage-page \.heritage-impact-grid/, 'Heritage stylesheet must own the impact layout');
assert.match(css, /@media \(max-width: 760px\)/, 'Heritage page must have an explicit mobile layout pass');
assert.match(css, /prefers-reduced-motion/, 'Heritage page must respect reduced-motion preference');

const route = seo.byPath['/10-years-of-write-urdu'];
assert.ok(route, 'Heritage route must exist in SEO config');
assert.strictEqual(route.indexable, true, 'Heritage route must be indexable');
assert.strictEqual(route.section, 'about', 'Heritage route belongs to the About/trust cluster');
assert.deepStrictEqual(route.schema, ['Article'], 'Heritage route must use the shared Article graph, not review schema');
assert.strictEqual(route.datePublished, '2026-09-06', 'Heritage page publication date must be explicit');
assert.strictEqual(route.lastmod, '2026-09-06', 'Heritage page lastmod must match the first release');

assert.strictEqual(ads.resolvePageType('/10-years-of-write-urdu'), 'trust', 'Heritage route must remain an ad-free trust surface');
assert.match(registry, /10-years-of-write-urdu\.html,\/10-years-of-write-urdu,About,[^\n]*,index,yes,keep,migrated,P1,/, 'Public page registry must contain the heritage route');
assert.match(redirects, /^\/10-years-of-write-urdu\.html \/10-years-of-write-urdu 301$/m, 'Legacy heritage HTML route must redirect to the canonical route');
assert.match(redirects, /^\/10-years-of-write-urdu\/ \/10-years-of-write-urdu 301$/m, 'Trailing-slash heritage route must redirect to the canonical route');
assert.match(humanSitemap, /href="\/10-years-of-write-urdu"/, 'Human sitemap must expose the heritage route');
assert.match(evidence, /1,132/, 'Evidence ledger must retain the derived session basis');
assert.match(evidence, /653,081/, 'Evidence ledger must retain the low character calculation');
assert.match(evidence, /1,003,081/, 'Evidence ledger must retain the high bounded character calculation');
assert.match(evidence, /Tens of millions of Urdu words — estimated, not counted/, 'Evidence ledger must retain the approved public headline');

console.log('Write Urdu heritage and impact contracts passed.');
