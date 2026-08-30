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

function withLocale(path, locale) {
  if (locale !== 'ur') return path;
  return path === '/' ? '/urdu/' : '/urdu' + path;
}

export function detailCanonicalUrl(origin, slug, locale) {
  return `${origin}${withLocale(`/urdu-writers/${encodeURIComponent(slug)}`, locale)}`;
}

const CATEGORY_LABELS_UR = Object.freeze({ poetry: 'شاعری', essay: 'مضمون', prose: 'نثر', thought: 'خیال', story: 'کہانی' });

export function categoryLabel(category, locale) {
  if (locale === 'ur') return CATEGORY_LABELS_UR[category] || category;
  return category.charAt(0).toUpperCase() + category.slice(1);
}

const UI_STRINGS = Object.freeze({
  en: {
    brandLabel: 'Urdu Writers',
    writeCta: 'Write your own Urdu',
    footerPublishedWith: 'Published with',
    footerSiteName: 'Write Urdu',
    footerGuidelines: 'Guidelines',
    footerPrivacy: 'Privacy',
    footerContact: 'Contact',
    backToHub: 'Back to Urdu Writers',
    hubKicker: 'Community reading',
    hubTitle: 'Read Urdu writing from the Write Urdu community',
    hubDescription: 'Read poetry, essays, prose and reflections written in Urdu and published by the Write Urdu community.',
    hubWriteCta: 'Write and submit your own',
    hubEmpty: 'No writing has been published yet.',
    beFirst: 'Be the first to write and submit',
    moreLink: 'More writing',
    categoryDescription: (label) => `Read ${label.toLowerCase()} written in Urdu and published by the Write Urdu community.`,
    categoryEmpty: (label) => `No ${label.toLowerCase()} has been published yet.`,
    moreWritingHeading: 'More writing',
    detailWriteCta: 'Write your own Urdu',
    reportSummary: 'Report this writing',
    reportChoose: 'Choose reason',
    reportReasons: { spam: 'Spam', abuse: 'Abuse', privacy: 'Privacy', copyright: 'Copyright', other: 'Other' },
    reportButton: 'Report',
    detailDescriptionFallback: 'Urdu writing published on Write Urdu.',
    unavailable: {
      disabled: { title: 'Urdu Writers is not available', message: 'This page is not available right now.' },
      unavailable: { title: 'Urdu Writers temporarily unavailable', message: 'Please try again later.' },
      writing_not_found: { title: 'Writing not found', message: 'This Urdu Writers page is not available.' },
      writing_removed: { title: 'This writing is no longer available', message: 'The writer or a moderator removed this publication.' },
      category_not_found: { title: 'Category not found', message: 'This Urdu Writers category is not available.' }
    }
  },
  ur: {
    brandLabel: 'اردو رائٹرز',
    writeCta: 'لکھنا شروع کریں',
    footerPublishedWith: 'ناشر',
    footerSiteName: 'رائٹ اردو',
    footerGuidelines: 'رہنما اصول',
    footerPrivacy: 'رازداری کی پالیسی',
    footerContact: 'رابطہ',
    backToHub: 'اردو رائٹرز پر واپس جائیں',
    hubKicker: 'کمیونٹی کی تحریریں',
    hubTitle: 'رائٹ اردو کمیونٹی کی اردو تحریریں پڑھیں',
    hubDescription: 'رائٹ اردو کمیونٹی کی شائع کردہ شاعری، مضامین، نثر اور خیالات اردو میں پڑھیں۔',
    hubWriteCta: 'اپنی تحریر لکھیں اور شائع کریں',
    hubEmpty: 'ابھی تک کوئی تحریر شائع نہیں ہوئی۔',
    beFirst: 'سب سے پہلے لکھیں اور شائع کریں',
    moreLink: 'مزید تحریریں',
    categoryDescription: (label) => `رائٹ اردو کمیونٹی کی شائع کردہ ${label} اردو میں پڑھیں۔`,
    categoryEmpty: (label) => `ابھی تک کوئی ${label} شائع نہیں ہوئی۔`,
    moreWritingHeading: 'مزید تحریریں',
    detailWriteCta: 'اپنی اردو تحریر لکھیں',
    reportSummary: 'اس تحریر کی شکایت کریں',
    reportChoose: 'وجہ منتخب کریں',
    reportReasons: { spam: 'اسپیم', abuse: 'ناروا سلوک', privacy: 'رازداری', copyright: 'کاپی رائٹ', other: 'دیگر' },
    reportButton: 'شکایت کریں',
    detailDescriptionFallback: 'رائٹ اردو پر شائع شدہ اردو تحریر۔',
    unavailable: {
      disabled: { title: 'اردو رائٹرز دستیاب نہیں', message: 'یہ صفحہ فی الحال دستیاب نہیں۔' },
      unavailable: { title: 'اردو رائٹرز عارضی طور پر دستیاب نہیں', message: 'براہ کرم کچھ دیر بعد دوبارہ کوشش کریں۔' },
      writing_not_found: { title: 'تحریر نہیں ملی', message: 'اردو رائٹرز کا یہ صفحہ دستیاب نہیں۔' },
      writing_removed: { title: 'یہ تحریر اب دستیاب نہیں', message: 'مصنف یا ماڈریٹر نے یہ تحریر ہٹا دی ہے۔' },
      category_not_found: { title: 'قسم نہیں ملی', message: 'اردو رائٹرز کی یہ قسم دستیاب نہیں۔' }
    }
  }
});

function alternateLinksHtml(origin, productPath) {
  const en = `${origin}${productPath}`;
  const ur = `${origin}${withLocale(productPath, 'ur')}`;
  return `<link rel="alternate" hreflang="en" href="${escapeHtml(en)}">
  <link rel="alternate" hreflang="ur" href="${escapeHtml(ur)}">
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(en)}">`;
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

function chrome(inner, locale) {
  locale = locale === 'ur' ? 'ur' : 'en';
  const strings = UI_STRINGS[locale];
  const htmlLang = locale === 'ur' ? '<html lang="ur" dir="rtl">' : '<html lang="en">';
  const hubHref = withLocale('/urdu-writers', locale);
  const editorHref = withLocale('/urdu-editor', locale);
  return `<!doctype html>
${htmlLang}
<head>
${inner.head}
  <link rel="icon" href="/favicon.ico">
  <link rel="stylesheet" href="/css/community-writers.css">
</head>
<body>
  <main class="cw-shell">
    <header class="cw-topbar">
      <a class="cw-brand" href="${escapeHtml(hubHref)}" aria-label="${escapeHtml(strings.brandLabel)}"><span class="cw-brand-mark" aria-hidden="true">اردو</span><span>${escapeHtml(strings.brandLabel)}</span></a>
      <a class="cw-write-link" href="${escapeHtml(editorHref)}" data-cw-write-cta>${escapeHtml(strings.writeCta)}</a>
    </header>
    ${inner.body}
    <footer class="cw-footer"><span>${escapeHtml(strings.footerPublishedWith)} <a href="/">${escapeHtml(strings.footerSiteName)}</a></span><span><a href="/community-guidelines">${escapeHtml(strings.footerGuidelines)}</a> &middot; <a href="/write-urdu-privacy">${escapeHtml(strings.footerPrivacy)}</a> &middot; <a href="/contact">${escapeHtml(strings.footerContact)}</a></span></footer>
  </main>
  <script src="/js/community-writers.js"></script>
</body>
</html>`;
}

export function renderUnavailablePage(status, reasonKey, robots, locale) {
  locale = locale === 'ur' ? 'ur' : 'en';
  const strings = UI_STRINGS[locale];
  const reason = strings.unavailable[reasonKey] || strings.unavailable.disabled;
  const head = `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="${robots || 'noindex,nofollow'}">
  <title>${escapeHtml(reason.title)} | ${escapeHtml(strings.footerSiteName)}</title>`;
  const body = `<section class="cw-panel cw-empty-panel"><h1>${escapeHtml(reason.title)}</h1><p>${escapeHtml(reason.message)}</p><a class="cw-button primary" href="${escapeHtml(withLocale('/urdu-writers', locale))}">${escapeHtml(strings.backToHub)}</a></section>`;
  return pageResponse(chrome({ head, body }, locale), status, robots);
}

function categoryChipsHtml(activeCategory, locale) {
  return COMMUNITY_TAXONOMY.primaryCategories
    .map((category) => {
      const active = category === activeCategory ? ' is-active' : '';
      const href = withLocale(`/urdu-writers/category/${encodeURIComponent(category)}`, locale);
      return `<a class="cw-chip${active}" href="${escapeHtml(href)}">${escapeHtml(categoryLabel(category, locale))}</a>`;
    })
    .join('');
}

function cardHtml(item, locale) {
  const href = withLocale(`/urdu-writers/${encodeURIComponent(item.slug)}`, locale);
  const tags = item.tags.slice(0, 3).map((tag) => `<span class="cw-tag">${escapeHtml(tag)}</span>`).join('');
  const date = item.publishedAt ? item.publishedAt.slice(0, 10) : '';
  return `<article class="cw-card">
    <a class="cw-card-link" href="${escapeHtml(href)}">
      <p class="cw-card-category">${escapeHtml(categoryLabel(item.primaryCategory, locale))}</p>
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

export function renderHubPage({ origin, items, nextCursor, robots, locale }) {
  locale = locale === 'ur' ? 'ur' : 'en';
  const strings = UI_STRINGS[locale];
  const canonical = `${origin}${withLocale('/urdu-writers', locale)}`;
  const title = locale === 'ur' ? `${strings.hubTitle} — ${strings.brandLabel}` : `Urdu Writers — ${strings.hubTitle}`;
  const description = strings.hubDescription;
  const head = `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="${robots}">
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  ${alternateLinksHtml(origin, '/urdu-writers')}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Write Urdu">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <title>${escapeHtml(title)}</title>`;
  const cards = items.length
    ? items.map((item) => cardHtml(item, locale)).join('\n')
    : `<p class="cw-empty">${escapeHtml(strings.hubEmpty)} <a href="${escapeHtml(withLocale('/urdu-editor', locale))}">${escapeHtml(strings.beFirst)}</a>.</p>`;
  const nextLink = nextCursor
    ? `<a class="cw-button" href="${escapeHtml(withLocale('/urdu-writers', locale))}?cursor=${encodeURIComponent(nextCursor)}">${escapeHtml(strings.moreLink)}</a>`
    : '';
  const body = `<section class="cw-hero">
      <p class="cw-kicker">${escapeHtml(strings.hubKicker)}</p>
      <h1>${escapeHtml(strings.hubTitle)}</h1>
      <p>${escapeHtml(description)}</p>
      <a class="cw-button primary" href="${escapeHtml(withLocale('/urdu-editor', locale))}" data-cw-write-cta>${escapeHtml(strings.hubWriteCta)}</a>
    </section>
    <nav class="cw-chips" aria-label="Categories">${categoryChipsHtml(null, locale)}</nav>
    <section class="cw-grid" aria-label="Published writing">${cards}</section>
    ${nextLink ? `<div class="cw-load-more">${nextLink}</div>` : ''}`;
  return pageResponse(chrome({ head, body }, locale), 200, robots);
}

export function renderCategoryPage({ origin, category, items, nextCursor, robots, locale }) {
  locale = locale === 'ur' ? 'ur' : 'en';
  const strings = UI_STRINGS[locale];
  const productPath = `/urdu-writers/category/${category}`;
  const canonical = `${origin}${withLocale(`/urdu-writers/category/${encodeURIComponent(category)}`, locale)}`;
  const label = categoryLabel(category, locale);
  const title = locale === 'ur' ? `${label} — ${strings.brandLabel}` : `${label} — Urdu Writers`;
  const description = strings.categoryDescription(label);
  const head = `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="${robots}">
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  ${alternateLinksHtml(origin, productPath)}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Write Urdu">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <title>${escapeHtml(title)}</title>`;
  const cards = items.length
    ? items.map((item) => cardHtml(item, locale)).join('\n')
    : `<p class="cw-empty">${escapeHtml(strings.categoryEmpty(label))} <a href="${escapeHtml(withLocale('/urdu-editor', locale))}">${escapeHtml(strings.beFirst)}</a>.</p>`;
  const nextLink = nextCursor
    ? `<a class="cw-button" href="${escapeHtml(withLocale(`/urdu-writers/category/${encodeURIComponent(category)}`, locale))}?cursor=${encodeURIComponent(nextCursor)}">${escapeHtml(strings.moreLink)}</a>`
    : '';
  const body = `<section class="cw-hero cw-hero-compact">
      <p class="cw-kicker">${escapeHtml(strings.hubKicker)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
    </section>
    <nav class="cw-chips" aria-label="Categories">${categoryChipsHtml(category, locale)}</nav>
    <section class="cw-grid" aria-label="Published writing">${cards}</section>
    ${nextLink ? `<div class="cw-load-more">${nextLink}</div>` : ''}`;
  return pageResponse(chrome({ head, body }, locale), 200, robots);
}

export function renderDetailPage({ origin, publication, moreWriting, robots, locale }) {
  locale = locale === 'ur' ? 'ur' : 'en';
  const strings = UI_STRINGS[locale];
  const productPath = `/urdu-writers/${publication.slug}`;
  const canonical = detailCanonicalUrl(origin, publication.slug, locale);
  const title = locale === 'ur' ? `${publication.title} — ${strings.brandLabel}` : `${publication.title} — Urdu Writers`;
  const description = excerptForDescription(publication.plainText) || strings.detailDescriptionFallback;
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
    articleSection: categoryLabel(publication.primaryCategory, locale),
    mainEntityOfPage: canonical,
    publisher: { '@type': 'Organization', name: 'Write Urdu', url: origin }
  });
  const head = `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="${robots}">
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  ${alternateLinksHtml(origin, productPath)}
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
    ? `<section class="cw-more" aria-label="More writing"><h2>${escapeHtml(strings.moreWritingHeading)}</h2><div class="cw-grid cw-grid-compact">${moreWriting.map((item) => cardHtml(item, locale)).join('\n')}</div></section>`
    : '';
  const reportReasonOptions = Object.entries(strings.reportReasons)
    .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
    .join('\n            ');
  const body = `<article class="cw-detail">
      <p class="cw-kicker"><a href="${escapeHtml(withLocale(`/urdu-writers/category/${encodeURIComponent(publication.primaryCategory)}`, locale))}">${escapeHtml(categoryLabel(publication.primaryCategory, locale))}</a></p>
      <h1 lang="ur" dir="rtl">${escapeHtml(publication.title)}</h1>
      <p class="cw-detail-meta">
        <span class="cw-detail-author" lang="ur" dir="rtl">${escapeHtml(publication.publicAuthorName)}</span>
        ${publishedDate ? `<time datetime="${escapeHtml(publishedDate)}">${escapeHtml(publishedDate)}</time>` : ''}
      </p>
      <div class="cw-detail-tags">${tags}</div>
      <div class="cw-detail-body" lang="ur" dir="rtl" data-cw-body>${renderPlainBody(publication.plainText)}</div>
      <div class="cw-detail-actions">
        <a class="cw-button primary" href="${escapeHtml(withLocale('/urdu-editor', locale))}" data-cw-write-cta>${escapeHtml(strings.detailWriteCta)}</a>
      </div>
      <details class="cw-report" data-cw-publication-id="${escapeHtml(publication.id)}">
        <summary>${escapeHtml(strings.reportSummary)}</summary>
        <div class="cw-report-form">
          <select data-cw-report-reason aria-label="${escapeHtml(strings.reportChoose)}">
            <option value="">${escapeHtml(strings.reportChoose)}</option>
            ${reportReasonOptions}
          </select>
          <button type="button" data-cw-report>${escapeHtml(strings.reportButton)}</button>
        </div>
        <p class="cw-report-status" data-cw-report-status aria-live="polite"></p>
      </details>
    </article>
    ${more}`;
  return pageResponse(chrome({ head, body }, locale), 200, robots);
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
