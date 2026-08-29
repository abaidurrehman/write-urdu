import { validPrimaryCategory, COMMUNITY_TAXONOMY } from './community-taxonomy.mjs';
import { escapeHtml, excerpt, publicOrigin, cleanReportReason, allowReport, originAllowed } from '../_lib/share-artifacts.js';

const SLUG_PATTERN = /^[a-z0-9]{2,8}-[a-z0-9-]{1,60}$/;
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HUB_LIMIT = 24;
const MORE_WRITING_LIMIT = 4;

function hasD1Binding(database) {
  return Boolean(database && typeof database.prepare === 'function');
}

function stringValue(value) {
  return typeof value === 'string' ? value : '';
}

function trimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseTags(value) {
  try {
    const parsed = JSON.parse(stringValue(value) || '[]');
    return Array.isArray(parsed) ? parsed.map(stringValue) : [];
  } catch {
    return [];
  }
}

export const HUB_PAGE_LIMIT = HUB_LIMIT;
// Slice F §4: below this, a category page is an operational thin-content guard,
// not a ranking decision -- crossing it only makes the page index-eligible.
export const CATEGORY_INDEX_THRESHOLD = 5;

export function communityPublicFeatureState(env = {}) {
  if (env.COMMUNITY_PUBLIC_ENABLED !== 'true') return 'disabled';
  if (!hasD1Binding(env.METRICS_DB)) return 'unavailable';
  return 'ready';
}

export function cleanSlug(value) {
  const slug = trimmedString(value).toLowerCase();
  return SLUG_PATTERN.test(slug) ? slug : null;
}

export function cleanPublicationId(value) {
  const id = trimmedString(value);
  return ID_PATTERN.test(id) ? id : null;
}

// Public rows never carry user_id/source_submission_id -- those columns are
// intentionally absent from every SELECT in this module, not just stripped
// after the fact, so a future column typo can't leak them.
function mapCard(row) {
  return {
    id: stringValue(row.id),
    slug: stringValue(row.slug),
    title: stringValue(row.title),
    publicAuthorName: stringValue(row.publicAuthorName ?? row.public_author_name),
    primaryCategory: stringValue(row.primaryCategory ?? row.primary_category),
    tags: parseTags(row.tagsJson ?? row.tags_json),
    excerpt: excerpt(row.plainText ?? row.plain_text, 220),
    publishedAt: stringValue(row.publishedAt ?? row.published_at)
  };
}

function mapDetail(row) {
  return {
    id: stringValue(row.id),
    slug: stringValue(row.slug),
    title: stringValue(row.title),
    publicAuthorName: stringValue(row.publicAuthorName ?? row.public_author_name),
    primaryCategory: stringValue(row.primaryCategory ?? row.primary_category),
    tags: parseTags(row.tagsJson ?? row.tags_json),
    content: stringValue(row.content),
    plainText: stringValue(row.plainText ?? row.plain_text),
    contentFormat: stringValue(row.contentFormat ?? row.content_format),
    publishedAt: stringValue(row.publishedAt ?? row.published_at),
    updatedAt: stringValue(row.updatedAt ?? row.updated_at)
  };
}

export function createPublicationRepository(db) {
  if (!hasD1Binding(db)) throw new TypeError('Community publications require a D1 binding.');

  return Object.freeze({
    async listPublished(cursor) {
      const conditions = ["status = 'published'"];
      const binds = [];
      let bindIndex = 1;
      if (cursor && cursor.publishedAt && cursor.id) {
        conditions.push(`(published_at < ?${bindIndex} OR (published_at = ?${bindIndex} AND id < ?${bindIndex + 1}))`);
        binds.push(cursor.publishedAt, cursor.id);
        bindIndex += 2;
      }
      const result = await db.prepare(`SELECT
          id, slug, title, public_author_name AS publicAuthorName, primary_category AS primaryCategory,
          tags_json AS tagsJson, plain_text AS plainText, published_at AS publishedAt
        FROM community_writing_publications
        WHERE ${conditions.join(' AND ')}
        ORDER BY published_at DESC, id DESC
        LIMIT ${HUB_LIMIT}`).bind(...binds).all();
      const rows = Array.isArray(result?.results) ? result.results : [];
      return rows.map(mapCard);
    },

    async listPublishedByCategory(category, cursor) {
      const conditions = ["status = 'published'", 'primary_category = ?1'];
      const binds = [category];
      let bindIndex = 2;
      if (cursor && cursor.publishedAt && cursor.id) {
        conditions.push(`(published_at < ?${bindIndex} OR (published_at = ?${bindIndex} AND id < ?${bindIndex + 1}))`);
        binds.push(cursor.publishedAt, cursor.id);
        bindIndex += 2;
      }
      const result = await db.prepare(`SELECT
          id, slug, title, public_author_name AS publicAuthorName, primary_category AS primaryCategory,
          tags_json AS tagsJson, plain_text AS plainText, published_at AS publishedAt
        FROM community_writing_publications
        WHERE ${conditions.join(' AND ')}
        ORDER BY published_at DESC, id DESC
        LIMIT ${HUB_LIMIT}`).bind(...binds).all();
      const rows = Array.isArray(result?.results) ? result.results : [];
      return rows.map(mapCard);
    },

    async countPublishedByCategory(category) {
      const row = await db.prepare(`SELECT COUNT(*) AS total FROM community_writing_publications
        WHERE status = 'published' AND primary_category = ?1`).bind(category).first();
      return Number(row?.total) || 0;
    },

    async getPublishedBySlug(slug) {
      const row = await db.prepare(`SELECT
          id, slug, title, public_author_name AS publicAuthorName, primary_category AS primaryCategory,
          tags_json AS tagsJson, content, plain_text AS plainText, content_format AS contentFormat,
          published_at AS publishedAt, updated_at AS updatedAt
        FROM community_writing_publications WHERE slug = ?1 AND status = 'published'`)
        .bind(slug)
        .first();
      return row ? mapDetail(row) : null;
    },

    async slugStatus(slug) {
      const row = await db.prepare('SELECT status FROM community_writing_publications WHERE slug = ?1')
        .bind(slug)
        .first();
      return row ? stringValue(row.status) : null;
    },

    async moreWriting(category, excludeId) {
      const sameCategory = await db.prepare(`SELECT
          id, slug, title, public_author_name AS publicAuthorName, primary_category AS primaryCategory,
          tags_json AS tagsJson, plain_text AS plainText, published_at AS publishedAt
        FROM community_writing_publications
        WHERE status = 'published' AND primary_category = ?1 AND id != ?2
        ORDER BY published_at DESC LIMIT ${MORE_WRITING_LIMIT}`)
        .bind(category, excludeId)
        .all();
      const rows = Array.isArray(sameCategory?.results) ? sameCategory.results.map(mapCard) : [];
      if (rows.length >= MORE_WRITING_LIMIT) return rows;

      const remaining = MORE_WRITING_LIMIT - rows.length;
      const excludeIds = [excludeId, ...rows.map((item) => item.id)];
      const placeholders = excludeIds.map((_, index) => `?${index + 1}`).join(', ');
      const rest = await db.prepare(`SELECT
          id, slug, title, public_author_name AS publicAuthorName, primary_category AS primaryCategory,
          tags_json AS tagsJson, plain_text AS plainText, published_at AS publishedAt
        FROM community_writing_publications
        WHERE status = 'published' AND id NOT IN (${placeholders})
        ORDER BY published_at DESC LIMIT ${remaining}`)
        .bind(...excludeIds)
        .all();
      const restRows = Array.isArray(rest?.results) ? rest.results.map(mapCard) : [];
      return [...rows, ...restRows];
    },

    async listPublishedForSitemap() {
      const result = await db.prepare(`SELECT slug, updated_at AS updatedAt
        FROM community_writing_publications WHERE status = 'published'
        ORDER BY updated_at DESC LIMIT 5000`).all();
      const rows = Array.isArray(result?.results) ? result.results : [];
      return rows.map((row) => ({ slug: stringValue(row.slug), updatedAt: stringValue(row.updatedAt) }));
    },

    async createReport(publicationId, reason, now, reportId) {
      const active = await db.prepare("SELECT id FROM community_writing_publications WHERE id = ?1 AND status = 'published'")
        .bind(publicationId)
        .first();
      if (!active) return false;

      await db.prepare('INSERT INTO community_writing_reports (id, publication_id, reason, created_at) VALUES (?1, ?2, ?3, ?4)')
        .bind(reportId, publicationId, reason, now)
        .run();
      await db.prepare(`UPDATE community_writing_publications
        SET report_count = MIN(report_count + 1, 100000), last_report_at = ?1 WHERE id = ?2`)
        .bind(now, publicationId)
        .run();
      return true;
    }
  });
}

export function excerptForDescription(plainText) {
  return excerpt(plainText, 170);
}

export function renderPlainBody(plainText) {
  const paragraphs = String(plainText || '').split(/\n{2,}/);
  return paragraphs
    .map((paragraph) => escapeHtml(paragraph).replace(/\n/g, '<br>'))
    .filter((paragraph) => paragraph.trim().length > 0)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join('\n');
}

export function detailCanonicalUrl(origin, slug) {
  return `${origin}/urdu-writers/${encodeURIComponent(slug)}`;
}

export function categoryLabel(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

const BASE_CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";

export function pageResponse(html, status, robots) {
  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'x-robots-tag': robots || 'noindex, nofollow',
      'content-security-policy': BASE_CSP,
      'permissions-policy': 'camera=(), microphone=(), geolocation=()'
    }
  });
}

function chrome(inner) {
  return `<!doctype html>
<html lang="en">
<head>
${inner.head}
  <link rel="icon" href="/favicon.ico">
  <link rel="stylesheet" href="/css/community-writers.css">
</head>
<body>
  <main class="cw-shell">
    <header class="cw-topbar">
      <a class="cw-brand" href="/urdu-writers" aria-label="Urdu Writers home"><span class="cw-brand-mark" aria-hidden="true">اردو</span><span>Urdu Writers</span></a>
      <a class="cw-write-link" href="/urdu-editor" data-cw-write-cta>Write your own Urdu</a>
    </header>
    ${inner.body}
    <footer class="cw-footer"><span>Published with <a href="/">Write Urdu</a></span><span><a href="/community-guidelines">Guidelines</a> &middot; <a href="/write-urdu-privacy">Privacy</a> &middot; <a href="/contact">Contact</a></span></footer>
  </main>
  <script src="/js/community-writers.js"></script>
</body>
</html>`;
}

export function renderUnavailablePage(status, title, message, robots) {
  const head = `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="${robots || 'noindex,nofollow'}">
  <title>${escapeHtml(title)} | Write Urdu</title>`;
  const body = `<section class="cw-panel cw-empty-panel"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><a class="cw-button primary" href="/urdu-writers">Back to Urdu Writers</a></section>`;
  return pageResponse(chrome({ head, body }), status, robots);
}

function categoryChipsHtml(activeCategory) {
  return COMMUNITY_TAXONOMY.primaryCategories
    .map((category) => {
      const active = category === activeCategory ? ' is-active' : '';
      return `<a class="cw-chip${active}" href="/urdu-writers/category/${encodeURIComponent(category)}">${escapeHtml(categoryLabel(category))}</a>`;
    })
    .join('');
}

function cardHtml(item) {
  const href = `/urdu-writers/${encodeURIComponent(item.slug)}`;
  const tags = item.tags.slice(0, 3).map((tag) => `<span class="cw-tag">${escapeHtml(tag)}</span>`).join('');
  const date = item.publishedAt ? item.publishedAt.slice(0, 10) : '';
  return `<article class="cw-card">
    <a class="cw-card-link" href="${escapeHtml(href)}">
      <p class="cw-card-category">${escapeHtml(categoryLabel(item.primaryCategory))}</p>
      <h2 class="cw-card-title">${escapeHtml(item.title)}</h2>
      <p class="cw-card-excerpt" lang="ur" dir="rtl">${escapeHtml(item.excerpt)}</p>
    </a>
    <div class="cw-card-meta">
      <span class="cw-card-author">${escapeHtml(item.publicAuthorName)}</span>
      ${date ? `<time datetime="${escapeHtml(date)}">${escapeHtml(date)}</time>` : ''}
    </div>
    <div class="cw-card-tags">${tags}</div>
  </article>`;
}

export function renderHubPage({ origin, items, nextCursor, robots }) {
  const canonical = `${origin}/urdu-writers`;
  const title = 'Urdu Writers — Read Urdu writing from the community';
  const description = 'Read poetry, essays, prose and reflections written in Urdu and published by the Write Urdu community.';
  const head = `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="${robots}">
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Write Urdu">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <title>${escapeHtml(title)}</title>`;
  const cards = items.length
    ? items.map(cardHtml).join('\n')
    : `<p class="cw-empty">No writing has been published yet. <a href="/urdu-editor">Be the first to write and submit</a>.</p>`;
  const nextLink = nextCursor
    ? `<a class="cw-button" href="/urdu-writers?cursor=${encodeURIComponent(nextCursor)}">More writing</a>`
    : '';
  const body = `<section class="cw-hero">
      <p class="cw-kicker">Community reading</p>
      <h1>Read Urdu writing from the Write Urdu community</h1>
      <p>${escapeHtml(description)}</p>
      <a class="cw-button primary" href="/urdu-editor" data-cw-write-cta>Write and submit your own</a>
    </section>
    <nav class="cw-chips" aria-label="Categories">${categoryChipsHtml(null)}</nav>
    <section class="cw-grid" aria-label="Published writing">${cards}</section>
    ${nextLink ? `<div class="cw-load-more">${nextLink}</div>` : ''}`;
  return pageResponse(chrome({ head, body }), 200, robots);
}

export function renderCategoryPage({ origin, category, items, nextCursor, robots }) {
  const canonical = `${origin}/urdu-writers/category/${encodeURIComponent(category)}`;
  const label = categoryLabel(category);
  const title = `${label} — Urdu Writers`;
  const description = `Read ${label.toLowerCase()} written in Urdu and published by the Write Urdu community.`;
  const head = `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="${robots}">
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Write Urdu">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <title>${escapeHtml(title)}</title>`;
  const cards = items.length
    ? items.map(cardHtml).join('\n')
    : `<p class="cw-empty">No ${escapeHtml(label.toLowerCase())} has been published yet. <a href="/urdu-editor">Be the first to write and submit</a>.</p>`;
  const nextLink = nextCursor
    ? `<a class="cw-button" href="/urdu-writers/category/${encodeURIComponent(category)}?cursor=${encodeURIComponent(nextCursor)}">More writing</a>`
    : '';
  const body = `<section class="cw-hero cw-hero-compact">
      <p class="cw-kicker">Community reading</p>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
    </section>
    <nav class="cw-chips" aria-label="Categories">${categoryChipsHtml(category)}</nav>
    <section class="cw-grid" aria-label="Published writing">${cards}</section>
    ${nextLink ? `<div class="cw-load-more">${nextLink}</div>` : ''}`;
  return pageResponse(chrome({ head, body }), 200, robots);
}

export function renderDetailPage({ origin, publication, moreWriting, robots }) {
  const canonical = detailCanonicalUrl(origin, publication.slug);
  const title = `${publication.title} — Urdu Writers`;
  const description = excerptForDescription(publication.plainText) || 'Urdu writing published on Write Urdu.';
  const publishedDate = publication.publishedAt ? publication.publishedAt.slice(0, 10) : '';
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: publication.title,
    name: publication.title,
    author: { '@type': 'Person', name: publication.publicAuthorName },
    datePublished: publication.publishedAt || undefined,
    dateModified: publication.updatedAt || publication.publishedAt || undefined,
    inLanguage: 'ur',
    articleSection: categoryLabel(publication.primaryCategory),
    mainEntityOfPage: canonical,
    publisher: { '@type': 'Organization', name: 'Write Urdu', url: origin }
  });
  const head = `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="${robots}">
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Write Urdu">
  <meta property="og:locale" content="ur_PK">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)}</title>
  <script type="application/ld+json">${jsonLd}</script>`;
  const tags = publication.tags.map((tag) => `<span class="cw-tag">${escapeHtml(tag)}</span>`).join('');
  const more = moreWriting.length
    ? `<section class="cw-more" aria-label="More writing"><h2>More writing</h2><div class="cw-grid cw-grid-compact">${moreWriting.map(cardHtml).join('\n')}</div></section>`
    : '';
  const body = `<article class="cw-detail">
      <p class="cw-kicker"><a href="/urdu-writers/category/${encodeURIComponent(publication.primaryCategory)}">${escapeHtml(categoryLabel(publication.primaryCategory))}</a></p>
      <h1 lang="ur" dir="rtl">${escapeHtml(publication.title)}</h1>
      <p class="cw-detail-meta">
        <span class="cw-detail-author" lang="ur" dir="rtl">${escapeHtml(publication.publicAuthorName)}</span>
        ${publishedDate ? `<time datetime="${escapeHtml(publishedDate)}">${escapeHtml(publishedDate)}</time>` : ''}
      </p>
      <div class="cw-detail-tags">${tags}</div>
      <div class="cw-detail-body" lang="ur" dir="rtl" data-cw-body>${renderPlainBody(publication.plainText)}</div>
      <div class="cw-detail-actions">
        <a class="cw-button primary" href="/urdu-editor" data-cw-write-cta>Write your own Urdu</a>
      </div>
      <details class="cw-report" data-cw-publication-id="${escapeHtml(publication.id)}">
        <summary>Report this writing</summary>
        <div class="cw-report-form">
          <select data-cw-report-reason aria-label="Reason for report">
            <option value="">Choose reason</option>
            <option value="spam">Spam</option>
            <option value="abuse">Abuse</option>
            <option value="privacy">Privacy</option>
            <option value="copyright">Copyright</option>
            <option value="other">Other</option>
          </select>
          <button type="button" data-cw-report>Report</button>
        </div>
        <p class="cw-report-status" data-cw-report-status aria-live="polite"></p>
      </details>
    </article>
    ${more}`;
  return pageResponse(chrome({ head, body }), 200, robots);
}

export {
  COMMUNITY_TAXONOMY,
  validPrimaryCategory,
  escapeHtml,
  excerpt,
  publicOrigin,
  cleanReportReason,
  allowReport,
  originAllowed
};
