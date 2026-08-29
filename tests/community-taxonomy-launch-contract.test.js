const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

// --- Category indexing threshold (spec §4): a starting operational guard, not a ranking guarantee ---
const publicationsSource = read('functions', 'lib', 'community-publications.mjs');
const categoryRoute = read('functions', 'urdu-writers', 'category', '[category].js');
assert.match(publicationsSource, /CATEGORY_INDEX_THRESHOLD\s*=\s*5/, 'Category index threshold must stay an explicit, named constant');
assert.match(publicationsSource, /countPublishedByCategory/, 'Repository must expose a real published-count query for the threshold decision');
assert.match(categoryRoute, /CATEGORY_INDEX_THRESHOLD/, 'Category route must compute robots from the real threshold, not a hardcoded string');
assert.match(categoryRoute, /countPublishedByCategory/, 'Category route must query the real published count before deciding robots');
assert.doesNotMatch(categoryRoute, /robots:\s*'noindex,follow'\s*\}\);?\s*$/m, 'Category route must not fall back to a hardcoded noindex regardless of corpus size');

// --- Community Guidelines page (spec §5) ---
const guidelines = read('community-guidelines.html');
assert.match(guidelines, /class="content-page v3-trust-page/, 'Guidelines must use the shared V3 trust page hook');
assert.match(guidelines, /css\/v3-trust\.css/, 'Guidelines must load the shared trust stylesheet');
assert.doesNotMatch(guidelines, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i, 'Guidelines page must not contain advertising markup');
for (const anchor of ['#authorship', '#privacy', '#safety', '#quality', '#moderation', '#rights-statement']) {
  assert.ok(guidelines.includes(`href="${anchor}"`) && guidelines.includes(`id="${anchor.slice(1)}"`), `Guidelines page missing required section ${anchor}`);
}
assert.match(guidelines, /You keep the copyright/, 'Guidelines must state the writer keeps copyright, not WriteUrdu');

const publishingUi = read('js', 'community-publishing-ui.mjs');
assert.match(publishingUi, /href="\/community-guidelines"/, 'Submission dialog must link the guidelines it asks the writer to agree to');

const communityFooterChrome = publicationsSource;
assert.match(communityFooterChrome, /href="\/community-guidelines"/, 'Public reading-page chrome must link Community Guidelines');

// --- Ads: guidelines/my-publications/urdu-writers routes are registered ad-free ---
const ads = require(path.join(root, 'js', 'ads.js'));
assert.strictEqual(ads.resolvePageType('/community-guidelines'), 'trust', 'Guidelines must be ad-free');
assert.strictEqual(ads.resolvePageType('/my-publications'), 'trust', 'My Publications must be ad-free');
assert.strictEqual(ads.resolvePageType('/urdu-writers'), 'trust', 'Urdu Writers hub must default ad-free pending a deliberate future promotion');
assert.strictEqual(ads.resolvePageType('/urdu-writers/abcd-a-slug'), 'trust', 'Urdu Writers detail must default ad-free pending a deliberate future promotion');

// --- Privacy/terms reconciliation (spec §6/§7) ---
const privacy = read('write-urdu-privacy.html');
assert.match(privacy, /id="community-writing"/, 'Privacy must have a dedicated Urdu Writers/community-submission section');
assert.match(privacy, /Community submission under review/, 'Privacy must distinguish the community-submission-under-review state');
assert.match(privacy, /Approved public community publication/, 'Privacy must distinguish the approved-public-publication state');
assert.match(privacy, /Rejected submission/, 'Privacy must distinguish the rejected-submission state');
assert.match(privacy, /Urdu Writers community publishing/, 'Privacy data-processing table must carry a community publishing row');
assert.match(privacy, /Community publishing \(Urdu Writers\)/, 'Terms must carry a dedicated community publishing clause');
assert.match(privacy, /limited, non-exclusive permission to host, render, distribute/, 'Terms must state a limited license, not a copyright transfer');
assert.doesNotMatch(privacy, /Write Urdu owns|WriteUrdu owns the (?:writer|copyright)/i, 'Terms/Privacy must never claim WriteUrdu owns the writer\'s copyright');

// --- Sitemap/robots reconciliation (spec §9) ---
const robots = read('robots.txt');
assert.match(robots, /Sitemap:\s*https:\/\/write-urdu\.com\/sitemap-community\.xml/, 'robots.txt must advertise the dynamic community sitemap');
const staticSitemap = read('sitemap.xml');
assert.match(staticSitemap, /https:\/\/write-urdu\.com\/community-guidelines/, 'Static sitemap must include the live Community Guidelines page');
assert.doesNotMatch(staticSitemap, /\/my-publications|\/api\/community|\/api\/internal\/community/, 'Sitemap must never list private writer/moderation routes');

// --- Telemetry contract (spec §11) ---
const eventsSource = read('functions', 'api', 'events.js');
for (const eventName of [
  'community_my_publications_viewed',
  'community_revision_started',
  'community_revision_submitted',
  'community_publication_withdrawn'
]) {
  assert.match(eventsSource, new RegExp(`'${eventName}'`), `functions/api/events.js must allow the ${eventName} event`);
}
// Structural forbidden-field guarantee: the accepted event payload is a fixed
// enum/id shape (cleanEvent), so title/body/name/document/publication content
// can never reach telemetry storage even if a caller tried to send it.
assert.doesNotMatch(eventsSource, /input\.(title|body|plainText|plain_text|publicAuthorName|public_author_name|email|documentId|document_id|submissionId|submission_id|publicationId|publication_id|slug)\b/,
  'Telemetry ingestion must never read a free-text/identity field off the incoming event payload');

// --- OS operational pulse (spec §12/§13): counts only, same auth boundary as moderation ---
const moderationSource = read('functions', 'lib', 'community-moderation.mjs');
const pulseRoute = read('functions', 'api', 'internal', 'community', 'pulse.js');
assert.match(pulseRoute, /handleCommunityPulse/, 'Pulse route must delegate to the moderation domain module');
assert.match(moderationSource, /requireModerationContext\)\(request, env\)/, 'Pulse handler must reuse the same fail-closed moderation auth boundary, not invent a new one');
assert.doesNotMatch(
  moderationSource.slice(moderationSource.indexOf('handleCommunityPulse')),
  /\btitle\b|plain_text|plainText|public_author_name|writerEmail/i,
  'Operational pulse must never select raw writing/identity columns'
);

// --- Reading pulse (spec §18): community_publication_viewed/community_write_cta_clicked
// were already allowlisted event names and already sent by js/community-writers.js, but
// applyEvent() had no branch to roll them into a metric column -- accepted, then discarded.
assert.match(eventsSource, /'community_views', 'community_cta_clicks'/, 'Hourly rollup schema must carry bounded community reading counters');
assert.match(eventsSource, /delta\.community_views \+= 1/, 'applyEvent must roll community_publication_viewed into a metric column');
assert.match(eventsSource, /delta\.community_cta_clicks \+= 1/, 'applyEvent must roll community_write_cta_clicked into a metric column');

const telemetryMigration = read('migrations', '0014_community_telemetry_rollups.sql');
for (const table of ['product_hourly_metrics', 'product_hourly_locale_metrics']) {
  for (const column of ['community_views', 'community_cta_clicks']) {
    assert.match(telemetryMigration, new RegExp(`ALTER TABLE ${table} ADD COLUMN ${column} INTEGER NOT NULL DEFAULT 0`),
      `Migration must additively add ${column} to ${table}`);
  }
}
assert.doesNotMatch(telemetryMigration, /DROP\s+TABLE/i, 'Telemetry rollup migration must never drop a table');

assert.match(moderationSource, /readingPulse/, 'Pulse handler must source reading views/CTA clicks from the bounded rollups');
assert.match(moderationSource, /FROM product_hourly_metrics/, 'Reading pulse must read the existing bounded hourly rollups');
assert.doesNotMatch(moderationSource, /FROM product_events\b/, 'Reading pulse must never scan the raw event table');
assert.match(moderationSource, /reading$/m, 'Pulse response must expose the reading views/CTA aggregate');

const communityClient = read('js', 'community-writers.js');
assert.match(communityClient, /querySelectorAll\('\[data-cw-write-cta\]'\)/, 'Client must track every write CTA on the page, not just the first');
assert.match(publicationsSource, /cw-write-link" href="\/urdu-editor" data-cw-write-cta/, 'Topbar write link must be tracked as a CTA');
assert.match(publicationsSource, /cw-button primary" href="\/urdu-editor" data-cw-write-cta/, 'Hub hero write button must be tracked as a CTA');

// --- Rollback (spec §15): normal rollback never drops shared tables ---
const migrationsDir = path.join(root, 'migrations');
for (const file of fs.readdirSync(migrationsDir).filter((name) => name.startsWith('00') && name.endsWith('.sql'))) {
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  assert.doesNotMatch(sql, /DROP\s+TABLE/i, `${file} must never drop a table as part of normal migration`);
}
assert.match(read('functions', 'lib', 'community-submissions.mjs'), /COMMUNITY_SUBMISSIONS_ENABLED/, 'Submission flag must remain the single rollback switch for writer-facing surfaces');
assert.match(read('functions', 'lib', 'community-publications.mjs'), /COMMUNITY_PUBLIC_ENABLED/, 'Public flag must remain the single rollback switch for the public corpus');

console.log('Community taxonomy/guidelines/launch-closure (COMMUNITY-F) contracts passed.');
