# WU-COMMUNITY-001D — Public Reader + SEO + Reporting

**Parent:** `WU-COMMUNITY-001`  
**Status:** Implemented core / acceptance pending — `functions/lib/community-publications.mjs`, SSR routes `functions/urdu-writers/index.js`, `functions/urdu-writers/[slug].js`, `functions/urdu-writers/category/[category].js`, dynamic `functions/sitemap-community.xml.js`, public JSON API under `functions/api/community/publications/`, `css/community-writers.css`, `js/community-writers.js`; `tests/community-public-reader-contract.test.js` green (2026-08-29). Gated end-to-end on `COMMUNITY_PUBLIC_ENABLED` (default off — entire surface 404s until explicitly enabled, matching the Slice A/C kill-switch convention); category-page indexing stays conservatively `noindex,follow` pending Slice F's corpus-size threshold decision; main static `sitemap.xml`/robots registry not yet wired to include the community sitemap (Slice F). Verified via contract tests, governance/SEO checks and a static-asset smoke check only — no live Cloudflare Pages preview deploy exercised yet  
**Date:** 2026-08-25  
**Scope:** public SSR hub/detail routes, public read API, stable metadata/schema, report flow, published-only sitemap, withdrawn/unpublished handling  
**Depends on:** `WU-COMMUNITY-001C` moderation boundary proven green

---

## 1. Goal

Expose only human-approved publication snapshots as durable public Urdu reading pages.

Owned flow:

```text
approved community_writing_publications row
→ public hub/detail route
→ crawlable Urdu content
→ reader discovers writing
→ reader can report or start writing
```

This slice must never read a private My Documents row or a pending/rejected submission for anonymous output.

---

## 2. Release prerequisite

Do not enable `COMMUNITY_PUBLIC_ENABLED=true` until Slice C proves:

- public host cannot approve/reject;
- only exact pending revision can be approved;
- approval is idempotent/atomic;
- rejected content creates no publication;
- approved revisions replace only after moderation.

If the moderation boundary is not green, public routes stay unavailable/noindex.

---

## 3. Public data source rule

Anonymous/public routes may read only:

```text
community_writing_publications
```

and community-owned report aggregates where needed.

Every public query includes:

```text
status = 'published'
```

Never expose data from:

```text
writing_documents
community_writing_submissions
Auth.js tables
provider/account tables
telemetry/share-artifact private fields
```

---

## 4. Public routes

### Hub

```text
/urdu-writers
```

### Detail

```text
/urdu-writers/:slug
```

### Category discovery

```text
/urdu-writers/category/:category
```

Category indexability is finalized in Slice F; this slice can serve functional category views with conservative robots behavior.

### Sitemap

```text
/sitemap-community.xml
```

### Public APIs

```text
GET  /api/community/publications
GET  /api/community/publications/:slug
POST /api/community/publications/:id/report
```

The SSR page may query D1 directly instead of calling its own HTTP API.

---

## 5. Hub contract

Minimum hub content:

- unique title/H1;
- short product-language intro;
- newest approved writing;
- category chips;
- cards with title, public writer name, category, selected tags, publish date and bounded excerpt;
- `Write and submit your own` CTA;
- pagination/cursor or bounded page count once content grows.

Suggested initial ordering:

```text
published_at DESC
```

Do not invent popularity ranking before reliable readership data exists.

Hub must never show pending/rejected/unpublished rows.

---

## 6. Detail contract

Server-rendered HTML must contain the writing without requiring JavaScript.

Required content:

```text
title
public author/pen name
primary category
tags
published date
full approved writing
WriteUrdu provenance
Write your own Urdu CTA
More writing links
Report action
```

Urdu body:

```html
lang="ur" dir="rtl"
```

Use existing Nastaliq/Naskh typography system without requiring a heavy client renderer.

Never render:

```text
user_id
source_document_id
source_submission_id
email
provider name/account identifiers
moderation identity/rejection data
internal report rows
```

---

## 7. Safe rendering

### Plain content

HTML-escape all text and preserve paragraphs/line breaks deterministically.

### Rich content

Render only the already server-sanitized approved representation from Slice A/C.

Do not run arbitrary stored HTML through `innerHTML` in a client script and assume it is safe.

Set a restrictive CSP compatible with the existing site architecture.

No third-party embed supplied by writer content in v1.

---

## 8. SEO metadata

Detail page:

- unique `<title>` based on work title + WriteUrdu;
- useful meta description derived from a safely bounded plain-text excerpt;
- self canonical;
- `og:type=article` or appropriate creative-work representation;
- `og:title`, description, URL;
- Twitter summary metadata;
- `og:locale=ur_PK` where consistent with current site conventions;
- `max-image-preview` only if a real eligible image exists; do not fabricate one.

Hub metadata targets the community-reading concept rather than `urdu typing` head intent.

Do not stuff tags/keywords into metadata.

---

## 9. Structured data

Use one truthful schema owner.

Detail page may use `Article`, `CreativeWork` or a subtype based on what current schema vocabulary supports and what the product can substantiate.

Minimum useful fields where applicable:

```text
headline/name
author.name = chosen public author name
datePublished
dateModified
mainEntityOfPage
inLanguage = ur
articleSection/genre from controlled category
publisher/site identity only where current site Organization data is verified
```

Do not claim:

```text
Person profile URL that does not exist
awards/ratings/reviews
professional credentials
editorial endorsement beyond approval to publish
```

Validate generated JSON-LD in focused tests.

---

## 10. Canonical and slug behavior

Canonical detail URL is the stable first-approved slug from Slice C.

Title/revision updates do not generate a new slug automatically.

If a malformed readable suffix is requested but the stable identifier can be resolved safely, either:

- redirect to canonical slug; or
- return not found according to the final route parser.

Do not create duplicate canonical URLs for the same publication.

---

## 11. Robots states

### Published

```text
index,follow
```

only when `COMMUNITY_PUBLIC_ENABLED=true` and the launch/indexing gate is satisfied.

### Unpublished/withdrawn

Return:

```text
410 Gone
X-Robots-Tag or meta robots: noindex,nofollow
```

with a small user-safe unavailable page.

### Pending/rejected/nonexistent

Do not reveal whether a private submission exists.

Return public not-found behavior.

No public route resolves a submission ID.

---

## 12. Community sitemap

`/sitemap-community.xml` contains only:

```text
status='published'
```

public detail canonical URLs.

Requirements:

- valid XML;
- canonical origin from configured/current public origin;
- `lastmod` from publication `updated_at` where reliable;
- no pending/rejected/unpublished rows;
- no private IDs except the public slug already in URL;
- bounded query/pagination if corpus grows;
- included from the main sitemap index/list only when feature launch is ready.

Withdrawal/unpublish removes URL from sitemap immediately on next request.

V1 should prefer dynamic correctness over aggressive caching.

---

## 13. Public report flow

Every published detail page exposes:

```text
Report this writing
```

Controlled reasons:

```text
spam
abuse
privacy
copyright
other
```

Endpoint:

```text
POST /api/community/publications/:id/report
```

Rules:

- publication must currently be published;
- origin/CSRF-style safeguards consistent with current public report patterns;
- bounded rate protection;
- no free-form report text in v1;
- create a row in `community_writing_reports`;
- increment publication report count/update last-report timestamp safely;
- do not auto-unpublish solely because a threshold is crossed;
- do not store reporter email/user ID/raw IP/user-agent in community report table.

Return generic accepted response; do not expose moderator workflow.

---

## 14. More-writing links

Use deterministic, safe relevance before introducing recommendations infrastructure.

Initial logic can prefer:

1. same primary category, excluding current publication;
2. then newest other published writing.

Maximum small set, for example 3–4 links.

No personalization/profile tracking required.

---

## 15. Reader-to-writer continuation

Primary continuation:

```text
Write your own Urdu
```

Route to the correct existing writing workspace, not a duplicate editor.

Secondary CTA may be:

```text
Publish your writing
```

If signed out, normal writing still begins without sign-in; authentication is requested only when user chooses submission.

Do not copy someone else’s full text into the editor automatically from the reading page in v1. That creates plagiarism/confusion risk.

---

## 16. Caching

V1 should prioritize withdrawal correctness.

Safe initial behavior:

```text
Cache-Control: no-store
```

for dynamic publication detail/hub if that matches current Pages Function patterns.

A later short edge cache can be introduced only with a reliable purge/invalidation path for withdrawal/unpublish.

Do not let CDN caching keep removed writing publicly readable after author/moderator withdrawal.

---

## 17. Ads

Do not add ad placement inside the writing body in Slice D.

Public community pages should be registered with the site's page-type/ad governance, but actual monetization treatment is finalized in Slice F after UX/indexing boundaries are proven.

No Auto ads should be allowed to cover the title/body/report/author controls.

---

## 18. Telemetry

Allowed public events:

```text
community_publication_viewed
community_write_cta_clicked
community_report_submitted
```

Allowed properties:

```text
route_type = hub|detail|category
category
referrer_class if current privacy model supports it
outcome
```

Never emit:

```text
title/excerpt/body
public author name
publication ID/slug
writer user ID
report details beyond controlled reason if policy allows
```

SEO pages must work if telemetry fails.

---

## 19. Likely implementation owners

Inspect current routing patterns first. Possible owners:

```text
functions/urdu-writers/index.js
functions/urdu-writers/[slug].js
functions/urdu-writers/category/[category].js
functions/sitemap-community.xml.js
functions/api/community/publications/index.js
functions/api/community/publications/[slug].js
functions/api/community/publications/[id]/report.js
css/community-writers.css
```

Names must fit current Cloudflare Pages Functions routing; do not force this exact layout if the repo has a better owner.

---

## 20. Tests

### Public isolation

- pending submission inaccessible;
- rejected submission inaccessible;
- publication `unpublished` inaccessible/410;
- only `published` row returned/listed;
- no public path can query by submission/private document ID.

### SSR

- full approved Urdu text present in raw HTML;
- correct `lang=ur`/`dir=rtl`;
- title/author/category/date render safely;
- scripts/unsafe stored HTML cannot execute;
- no private IDs/email/provider/moderation data in HTML.

### SEO

- unique canonical/title/description;
- valid JSON-LD contract;
- published detail indexable only when public feature/indexing enabled;
- withdrawn returns 410/noindex;
- sitemap contains only published canonicals;
- sitemap removes withdrawn row.

### Report

- invalid reason rejected;
- unpublished/nonexistent publication cannot be reported;
- bounded rate/origin rules enforced;
- report row contains no reporter identity;
- report count increments without auto-unpublish.

### Regression

- existing `/s/:id` remains noindex direct-share surface;
- existing main sitemap remains valid;
- writing/editor routes unaffected.

---

## 21. Acceptance criteria

- [ ] `/urdu-writers` SSR hub lists only published writing.
- [ ] `/urdu-writers/:slug` renders full approved Urdu server-side.
- [ ] Public detail exposes no private/auth/moderation identifiers.
- [ ] Canonical/metadata/JSON-LD are truthful and tested.
- [ ] Pending/rejected rows are indistinguishable from not-found publicly.
- [ ] Unpublished/withdrawn detail returns 410 + noindex.
- [ ] Dynamic community sitemap contains published canonicals only.
- [ ] Report flow writes community-owned report rows without reporter identity.
- [ ] More-writing and writer CTA are bounded and useful.
- [ ] No ads are inserted inside the writing body in this slice.
- [ ] Existing `/s/:id` semantics are unchanged.
- [ ] Focused tests and repository suite pass.

---

## 22. Stop conditions

Stop and fix if:

- public route reads `writing_documents` or submissions;
- pending/rejected content leaks through API/HTML/sitemap;
- writer email/user ID/source IDs render publicly;
- unsafe HTML can execute;
- sitemap contains non-published content;
- removed writing remains cached publicly;
- reader page auto-copies another writer’s full work into editor;
- report system stores unnecessary reporter identity;
- public indexing is enabled before moderation boundary is green.
