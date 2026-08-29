const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const libSource = read('functions', 'lib', 'community-publications.mjs');
const hubRoute = read('functions', 'urdu-writers', 'index.js');
const detailRoute = read('functions', 'urdu-writers', '[slug].js');
const categoryRoute = read('functions', 'urdu-writers', 'category', '[category].js');
const sitemapRoute = read('functions', 'sitemap-community.xml.js');
const apiListRoute = read('functions', 'api', 'community', 'publications', 'index.js');
const apiDetailRoute = read('functions', 'api', 'community', 'publications', '[slug].js');
const apiReportRoute = read('functions', 'api', 'community', 'publications', '[id]', 'report.js');

// --- Static: public surface never reads private tables or private columns ---
assert.doesNotMatch(libSource, /writing_documents|community_writing_submissions/,
  'Public reader must never reference private/document/submission tables');
const libSourceWithoutComments = libSource.split('\n').filter((line) => !line.trim().startsWith('//')).join('\n');
assert.doesNotMatch(libSourceWithoutComments, /\buser_id\b|\bsource_submission_id\b/,
  'Public reader SELECTs must never request user_id or source_submission_id columns');
assert.doesNotMatch(libSource, /console\.(?:log|info|warn|error)/, 'Public reader must not log');
assert.match(libSource, /status = 'published'/, 'Every public listing query must filter on status = published');

for (const [name, source] of [
  ['hub', hubRoute], ['detail', detailRoute], ['category', categoryRoute],
  ['sitemap', sitemapRoute], ['api list', apiListRoute], ['api detail', apiDetailRoute], ['api report', apiReportRoute]
]) {
  assert.match(source, /from ['"].*community-publications\.mjs['"]/, `${name} route must delegate to the shared public-reader module`);
}
assert.match(hubRoute, /communityPublicFeatureState/, 'Hub route must fail closed on the public feature flag');
assert.match(detailRoute, /communityPublicFeatureState/, 'Detail route must fail closed on the public feature flag');
assert.match(categoryRoute, /communityPublicFeatureState/, 'Category route must fail closed on the public feature flag');
assert.match(apiReportRoute, /originAllowed/, 'Report route must reuse the share-loop origin check');
assert.match(apiReportRoute, /allowReport/, 'Report route must reuse the share-loop rate limiter');

// --- Fake D1 tailored to the exact statements community-publications.mjs issues ---
function normalize(sql) {
  return sql.replace(/\s+/g, ' ').trim();
}

function createFakeDb(state) {
  return {
    prepare(rawSql) {
      const sql = normalize(rawSql);
      let boundArgs = [];
      const api = {
        bind(...args) {
          boundArgs = args;
          return api;
        },
        async first() {
          const rows = runSelect(sql, boundArgs, state);
          return rows[0] || null;
        },
        async all() {
          return { results: runSelect(sql, boundArgs, state) };
        },
        async run() {
          return runWrite(sql, boundArgs, state);
        }
      };
      return api;
    }
  };
}

function toCardRow(row) {
  return {
    id: row.id, slug: row.slug, title: row.title,
    publicAuthorName: row.public_author_name, primaryCategory: row.primary_category,
    tagsJson: row.tags_json, plainText: row.plain_text, publishedAt: row.published_at
  };
}

function toDetailRow(row) {
  return {
    id: row.id, slug: row.slug, title: row.title,
    publicAuthorName: row.public_author_name, primaryCategory: row.primary_category,
    tagsJson: row.tags_json, content: row.content, plainText: row.plain_text,
    contentFormat: row.content_format, publishedAt: row.published_at, updatedAt: row.updated_at
  };
}

function runSelect(sql, args, state) {
  if (sql.startsWith('SELECT id, slug, title, public_author_name AS publicAuthorName') && sql.includes('ORDER BY published_at DESC, id DESC')) {
    let rows = state.publications.filter((row) => row.status === 'published');
    if (sql.includes('primary_category = ?1')) {
      const category = args[0];
      rows = rows.filter((row) => row.primary_category === category);
    }
    rows = rows.sort((a, b) => (a.published_at < b.published_at ? 1 : a.published_at > b.published_at ? -1 : (a.id < b.id ? 1 : -1)));
    return rows.map(toCardRow);
  }
  if (sql.includes('WHERE slug = ?1 AND status = ') && sql.includes('content,')) {
    const slug = args[0];
    const row = state.publications.find((entry) => entry.slug === slug && entry.status === 'published');
    return row ? [toDetailRow(row)] : [];
  }
  if (sql === "SELECT status FROM community_writing_publications WHERE slug = ?1") {
    const row = state.publications.find((entry) => entry.slug === args[0]);
    return row ? [{ status: row.status }] : [];
  }
  if (sql.includes('SELECT COUNT(*) AS total FROM community_writing_publications') && sql.includes('primary_category = ?1')) {
    const category = args[0];
    const total = state.publications.filter((row) => row.status === 'published' && row.primary_category === category).length;
    return [{ total }];
  }
  if (sql.includes('primary_category = ?1 AND id !=')) {
    const [category, excludeId] = args;
    const rows = state.publications
      .filter((row) => row.status === 'published' && row.primary_category === category && row.id !== excludeId)
      .sort((a, b) => (a.published_at < b.published_at ? 1 : -1));
    return rows.map(toCardRow);
  }
  if (sql.includes('id NOT IN')) {
    const excludeIds = new Set(args);
    const rows = state.publications
      .filter((row) => row.status === 'published' && !excludeIds.has(row.id))
      .sort((a, b) => (a.published_at < b.published_at ? 1 : -1));
    return rows.map(toCardRow);
  }
  if (sql.includes('SELECT slug, updated_at AS updatedAt')) {
    const rows = state.publications.filter((row) => row.status === 'published');
    return rows.map((row) => ({ slug: row.slug, updatedAt: row.updated_at }));
  }
  if (sql === "SELECT id FROM community_writing_publications WHERE id = ?1 AND status = 'published'") {
    const row = state.publications.find((entry) => entry.id === args[0] && entry.status === 'published');
    return row ? [{ id: row.id }] : [];
  }
  throw new Error(`Unhandled fake-D1 SELECT: ${sql}`);
}

function runWrite(sql, args, state) {
  if (sql.startsWith('INSERT INTO community_writing_reports')) {
    const [id, publicationId, reason, createdAt] = args;
    state.reports.push({ id, publication_id: publicationId, reason, created_at: createdAt });
    return { meta: { changes: 1 } };
  }
  if (sql.startsWith('UPDATE community_writing_publications')) {
    const [now, publicationId] = args;
    const row = state.publications.find((entry) => entry.id === publicationId);
    if (!row) return { meta: { changes: 0 } };
    row.report_count = Math.min(row.report_count + 1, 100000);
    row.last_report_at = now;
    return { meta: { changes: 1 } };
  }
  throw new Error(`Unhandled fake-D1 write: ${sql}`);
}

function makeRow(overrides) {
  return {
    id: 'id-0000', slug: 'ab12-sample', status: 'published',
    public_author_name: 'قلم کار', title: 'نمونہ تحریر',
    content: 'پہلا پیراگراف۔\n\nدوسرا پیراگراف۔', plain_text: 'پہلا پیراگراف۔\n\nدوسرا پیراگراف۔',
    content_format: 'plain', primary_category: 'poetry', tags_json: '["ghazal"]',
    published_at: '2026-08-20T10:00:00.000Z', updated_at: '2026-08-20T10:00:00.000Z',
    report_count: 0, last_report_at: null,
    source_submission_id: 'sub-should-never-leak', user_id: 'user-should-never-leak',
    ...overrides
  };
}

(async () => {
  const lib = await import(pathToFileURL(path.join(root, 'functions', 'lib', 'community-publications.mjs')).href);

  const published1 = makeRow({ id: 'pub-1', slug: 'ab12-poetry-one', primary_category: 'poetry', published_at: '2026-08-22T10:00:00.000Z' });
  const published2 = makeRow({ id: 'pub-2', slug: 'cd34-poetry-two', primary_category: 'poetry', published_at: '2026-08-21T10:00:00.000Z' });
  const publishedEssay = makeRow({ id: 'pub-3', slug: 'ef56-essay-one', primary_category: 'essay', published_at: '2026-08-20T10:00:00.000Z' });
  const unpublished = makeRow({ id: 'pub-4', slug: 'gh78-withdrawn', status: 'unpublished', primary_category: 'poetry', published_at: '2026-08-19T10:00:00.000Z' });

  const state = { publications: [published1, published2, publishedEssay, unpublished], reports: [] };
  const repository = lib.createPublicationRepository(createFakeDb(state));

  // listPublished: published only, newest first, no private columns leak through the mapped shape
  const hubItems = await repository.listPublished(null);
  assert.deepStrictEqual(hubItems.map((item) => item.slug), ['ab12-poetry-one', 'cd34-poetry-two', 'ef56-essay-one']);
  for (const item of hubItems) {
    assert.strictEqual(item.userId, undefined);
    assert.strictEqual(item.sourceSubmissionId, undefined);
  }

  // listPublishedByCategory: filtered
  const poetryItems = await repository.listPublishedByCategory('poetry', null);
  assert.deepStrictEqual(poetryItems.map((item) => item.slug), ['ab12-poetry-one', 'cd34-poetry-two']);

  // getPublishedBySlug: only published resolves; unpublished/nonexistent do not
  const detail = await repository.getPublishedBySlug('ab12-poetry-one');
  assert.strictEqual(detail.title, published1.title);
  assert.strictEqual(detail.userId, undefined);
  assert.strictEqual(detail.sourceSubmissionId, undefined);
  assert.strictEqual(await repository.getPublishedBySlug('gh78-withdrawn'), null);
  assert.strictEqual(await repository.getPublishedBySlug('does-not-exist'), null);

  // slugStatus: distinguishes withdrawn (410-worthy) from truly nonexistent (404-worthy)
  assert.strictEqual(await repository.slugStatus('gh78-withdrawn'), 'unpublished');
  assert.strictEqual(await repository.slugStatus('does-not-exist'), null);

  // moreWriting: same category first, backfilled by newest-other, excludes self, never duplicates
  const more = await repository.moreWriting('poetry', 'pub-1');
  assert.deepStrictEqual(more.map((item) => item.id), ['pub-2', 'pub-3']);
  assert.ok(!more.some((item) => item.id === 'pub-1'), 'moreWriting must exclude the current publication');

  // listPublishedForSitemap: published only
  const sitemapRows = await repository.listPublishedForSitemap();
  assert.deepStrictEqual(sitemapRows.map((row) => row.slug).sort(), ['ab12-poetry-one', 'cd34-poetry-two', 'ef56-essay-one']);

  // createReport: false for unpublished/nonexistent; true + no reporter identity for published
  assert.strictEqual(await repository.createReport('pub-4', 'spam', '2026-08-23T00:00:00.000Z', 'report-1'), false);
  assert.strictEqual(await repository.createReport('missing-id', 'spam', '2026-08-23T00:00:00.000Z', 'report-2'), false);
  assert.strictEqual(state.reports.length, 0);
  assert.strictEqual(await repository.createReport('pub-1', 'spam', '2026-08-23T00:00:00.000Z', 'report-3'), true);
  assert.strictEqual(state.reports.length, 1);
  assert.deepStrictEqual(Object.keys(state.reports[0]).sort(), ['created_at', 'id', 'publication_id', 'reason']);
  assert.strictEqual(published1.report_count, 1);
  assert.strictEqual(published1.last_report_at, '2026-08-23T00:00:00.000Z');

  console.log('Community public repository (COMMUNITY-D repository) contracts passed.');

  // --- Route-level: real Request objects against the exported onRequest handlers ---
  const hub = await import(pathToFileURL(path.join(root, 'functions', 'urdu-writers', 'index.js')).href);
  const detailModule = await import(pathToFileURL(path.join(root, 'functions', 'urdu-writers', '[slug].js')).href);
  const category = await import(pathToFileURL(path.join(root, 'functions', 'urdu-writers', 'category', '[category].js')).href);
  const sitemap = await import(pathToFileURL(path.join(root, 'functions', 'sitemap-community.xml.js')).href);
  const apiList = await import(pathToFileURL(path.join(root, 'functions', 'api', 'community', 'publications', 'index.js')).href);
  const apiDetail = await import(pathToFileURL(path.join(root, 'functions', 'api', 'community', 'publications', '[slug].js')).href);
  const apiReport = await import(pathToFileURL(path.join(root, 'functions', 'api', 'community', 'publications', '[id]', 'report.js')).href);

  const routePublished = makeRowForRoutes();
  const routeUnpublished = makeRowForRoutes({ id: '44444444-4444-4444-8444-444444444444', slug: 'ij90-withdrawn', status: 'unpublished' });
  const routeState = { publications: [routePublished, routeUnpublished], reports: [] };

  function makeRowForRoutes(overrides) {
    return {
      id: '22222222-2222-4222-8222-222222222222', slug: 'kl12-published-piece', status: 'published',
      public_author_name: 'مصنف', title: 'شائع شدہ تحریر',
      content: 'پہلا حصہ۔\n\nدوسرا حصہ۔', plain_text: 'پہلا حصہ۔\n\nدوسرا حصہ۔',
      content_format: 'plain', primary_category: 'poetry', tags_json: '["ghazal"]',
      published_at: '2026-08-22T10:00:00.000Z', updated_at: '2026-08-22T10:00:00.000Z',
      report_count: 0, last_report_at: null,
      source_submission_id: 'sub-x', user_id: 'user-x',
      ...overrides
    };
  }

  function envFor(featureEnabled, hasDb) {
    return {
      COMMUNITY_PUBLIC_ENABLED: featureEnabled ? 'true' : 'false',
      METRICS_DB: hasDb ? createFakeDb(routeState) : undefined
    };
  }

  const get = (url) => new Request(url);

  // Disabled feature: whole public surface fails closed as not-found/empty, never 200 with content.
  let response = await hub.onRequest({ request: get('https://write-urdu.com/urdu-writers'), env: envFor(false, true), params: {} });
  assert.strictEqual(response.status, 404);
  assert.strictEqual(response.headers.get('x-robots-tag'), 'noindex,nofollow');

  response = await detailModule.onRequest({ request: get('https://write-urdu.com/urdu-writers/kl12-published-piece'), env: envFor(false, true), params: { slug: 'kl12-published-piece' } });
  assert.strictEqual(response.status, 404);

  response = await category.onRequest({ request: get('https://write-urdu.com/urdu-writers/category/poetry'), env: envFor(false, true), params: { category: 'poetry' } });
  assert.strictEqual(response.status, 404);

  response = await apiList.onRequest({ request: get('https://write-urdu.com/api/community/publications'), env: envFor(false, true) });
  assert.strictEqual(response.status, 404);

  response = await apiDetail.onRequest({ request: get('https://write-urdu.com/api/community/publications/kl12-published-piece'), env: envFor(false, true), params: { slug: 'kl12-published-piece' } });
  assert.strictEqual(response.status, 404);

  response = await apiReport.onRequest({
    request: new Request('https://write-urdu.com/api/community/publications/22222222-2222-4222-8222-222222222222/report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reason: 'spam' }) }),
    env: envFor(false, true), params: { id: '22222222-2222-4222-8222-222222222222' }
  });
  assert.strictEqual(response.status, 404);

  response = await sitemap.onRequest({ request: get('https://write-urdu.com/sitemap-community.xml'), env: envFor(false, true) });
  assert.strictEqual(response.status, 200);
  const disabledXml = await response.text();
  assert.doesNotMatch(disabledXml, /<loc>/, 'Sitemap must stay empty while the public feature is disabled');

  // Missing D1 binding: unavailable, not silently empty/broken.
  response = await hub.onRequest({ request: get('https://write-urdu.com/urdu-writers'), env: envFor(true, false), params: {} });
  assert.strictEqual(response.status, 503);

  // Enabled + real data: hub lists the published item and renders safely.
  response = await hub.onRequest({ request: get('https://write-urdu.com/urdu-writers'), env: envFor(true, true), params: {} });
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.headers.get('x-robots-tag'), 'index,follow');
  let html = await response.text();
  assert.match(html, /kl12-published-piece/);
  assert.doesNotMatch(html, /44444444-4444-4444-8444-444444444444|ij90-withdrawn/, 'Hub must never render an unpublished row');

  // Detail: full Urdu text server-rendered, correct lang/dir, no private identifiers.
  response = await detailModule.onRequest({ request: get('https://write-urdu.com/urdu-writers/kl12-published-piece'), env: envFor(true, true), params: { slug: 'kl12-published-piece' } });
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.headers.get('x-robots-tag'), 'index,follow');
  html = await response.text();
  assert.match(html, /پہلا حصہ/, 'Full approved Urdu body must be present in raw SSR HTML');
  assert.match(html, /lang="ur" dir="rtl"/);
  assert.doesNotMatch(html, /user-x|sub-x/, 'Detail page must never render internal user/source identifiers');
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
  assert.ok(jsonLdMatch, 'Detail page must carry JSON-LD');
  const jsonLd = JSON.parse(jsonLdMatch[1]);
  assert.strictEqual(jsonLd.inLanguage, 'ur');
  assert.strictEqual(jsonLd['@type'], 'CreativeWork');
  assert.strictEqual(jsonLd.author.name, routePublished.public_author_name);

  // Withdrawn slug: 410 + noindex, not a silent 404 that hides moderator action.
  response = await detailModule.onRequest({ request: get('https://write-urdu.com/urdu-writers/ij90-withdrawn'), env: envFor(true, true), params: { slug: 'ij90-withdrawn' } });
  assert.strictEqual(response.status, 410);
  assert.strictEqual(response.headers.get('x-robots-tag'), 'noindex,nofollow');

  // Nonexistent/malformed slug: indistinguishable not-found, never reveals private state.
  response = await detailModule.onRequest({ request: get('https://write-urdu.com/urdu-writers/does-not-exist-xx'), env: envFor(true, true), params: { slug: 'does-not-exist-xx' } });
  assert.strictEqual(response.status, 404);
  response = await detailModule.onRequest({ request: get('https://write-urdu.com/urdu-writers/%3Cscript%3E'), env: envFor(true, true), params: { slug: '<script>' } });
  assert.strictEqual(response.status, 404);

  // Category: unknown category 404s; known category renders conservatively noindexed per Slice F gate.
  response = await category.onRequest({ request: get('https://write-urdu.com/urdu-writers/category/not-a-real-category'), env: envFor(true, true), params: { category: 'not-a-real-category' } });
  assert.strictEqual(response.status, 404);
  response = await category.onRequest({ request: get('https://write-urdu.com/urdu-writers/category/poetry'), env: envFor(true, true), params: { category: 'poetry' } });
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.headers.get('x-robots-tag'), 'noindex,follow');
  html = await response.text();
  assert.match(html, /kl12-published-piece/);

  // Sitemap: published-only canonicals, valid XML, withdrawn absent.
  response = await sitemap.onRequest({ request: get('https://write-urdu.com/sitemap-community.xml'), env: envFor(true, true) });
  assert.strictEqual(response.status, 200);
  const xml = await response.text();
  assert.match(xml, /<loc>https:\/\/write-urdu\.com\/urdu-writers\/kl12-published-piece<\/loc>/);
  assert.doesNotMatch(xml, /ij90-withdrawn/);
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);

  // Public JSON APIs mirror the same isolation.
  response = await apiDetail.onRequest({ request: get('https://write-urdu.com/api/community/publications/kl12-published-piece'), env: envFor(true, true), params: { slug: 'kl12-published-piece' } });
  assert.strictEqual(response.status, 200);
  let body = await response.json();
  assert.strictEqual(body.publication.slug, 'kl12-published-piece');
  assert.strictEqual(body.publication.userId, undefined);

  response = await apiDetail.onRequest({ request: get('https://write-urdu.com/api/community/publications/ij90-withdrawn'), env: envFor(true, true), params: { slug: 'ij90-withdrawn' } });
  assert.strictEqual(response.status, 404);

  // Report flow: reason validation, origin check, published-only, no reporter identity persisted.
  const reportUrl = 'https://write-urdu.com/api/community/publications/22222222-2222-4222-8222-222222222222/report';
  response = await apiReport.onRequest({
    request: new Request(reportUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reason: 'not-a-real-reason' }) }),
    env: envFor(true, true), params: { id: '22222222-2222-4222-8222-222222222222' }
  });
  assert.strictEqual(response.status, 400);

  response = await apiReport.onRequest({
    request: new Request(reportUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reason: 'spam' }) }),
    env: envFor(true, true), params: { id: '44444444-4444-4444-8444-444444444444' }
  });
  assert.strictEqual(response.status, 404, 'Unpublished publications must not be reportable');

  response = await apiReport.onRequest({
    request: new Request(reportUrl, { method: 'POST', headers: { origin: 'https://evil.example', 'content-type': 'application/json' }, body: JSON.stringify({ reason: 'spam' }) }),
    env: envFor(true, true), params: { id: '22222222-2222-4222-8222-222222222222' }
  });
  assert.strictEqual(response.status, 403);

  response = await apiReport.onRequest({
    request: new Request(reportUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reason: 'spam' }) }),
    env: envFor(true, true), params: { id: '22222222-2222-4222-8222-222222222222' }
  });
  assert.strictEqual(response.status, 202);
  body = await response.json();
  assert.strictEqual(body.reason, 'spam');
  assert.strictEqual(routeState.reports.length, 1);
  assert.deepStrictEqual(Object.keys(routeState.reports[0]).sort(), ['created_at', 'id', 'publication_id', 'reason']);

  console.log('Community public reader (COMMUNITY-D public) contracts passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
