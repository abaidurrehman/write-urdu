# WU-I18N-001 — Crawlable Urdu Locale

**Product:** Write Urdu  
**Feature ID:** `WU-I18N-001`  
**Status:** Planned — founder-approved  
**Locale route:** `/urdu/`  
**Default locale:** English (`en`) on existing canonical routes  
**Urdu locale:** Urdu (`ur`) on `/urdu/*`  
**Commercial parent:** `WU-GROWTH-001`  
**Architecture:** static-first, one product codebase, build-generated locale output

## 1. Objective

Make the existing Urdu product experience available at stable, crawlable Urdu URLs without creating a second application or weakening the established English search owners.

The initiative converts the current browser-only Urdu language switch into a real search-visible locale:

```text
/                         English homepage
/urdu/                    Urdu homepage
/urdu-keyboard            English keyboard
/urdu/urdu-keyboard       Urdu keyboard
/tools/urdu-voice-typing  English voice workspace
/urdu/tools/urdu-voice-typing
                          Urdu voice workspace
```

The Urdu URL must return meaningful Urdu HTML in the initial response. Search engines must not need localStorage, a click on the language toggle, or post-load DOM replacement to discover the Urdu title, heading, description and body copy.

## 2. Product and SEO decision

Use `/urdu/`, not `/pk/`.

`/urdu/` is a language boundary. `/pk/` would imply a country/market boundary and would incorrectly couple the product to Pakistan even though Urdu users exist globally and Pakistan itself is multilingual.

Locale identifiers:

- English: `en`
- Urdu: `ur`
- Do not use `ur-PK` globally unless a future page is genuinely Pakistan-specific.

Do not auto-redirect by IP, country, browser language or inferred user identity. The user chooses language through a visible locale switch and each locale remains independently crawlable.

## 3. Strategic rationale

WriteUrdu already has substantial Urdu localization in `js/site-header-core.js`, `js/content-locale.js` and shell/runtime copy. The missing asset is a stable Urdu URL layer.

This initiative has three jobs:

1. **Search expansion:** allow Urdu-script queries to resolve to genuinely Urdu pages.
2. **Product access:** let users bookmark/share a durable Urdu interface rather than relying only on browser-local language preference.
3. **Revenue support:** create useful Urdu acquisition/content inventory that can contribute to the `WU-GROWTH-001` organic + AdSense growth model without increasing ad pressure inside active writing workspaces.

Commercial goal is directional, not a promise: `/urdu/` should contribute measurable qualified organic entrances, useful second-page journeys and monetizable pageviews toward the broader `$5/day` AdSense target.

## 4. Non-negotiable invariants

### 4.1 Existing English URLs remain canonical owners

Do not move, rename or redirect established English pages merely because an Urdu equivalent is added.

Examples:

```text
/                         stays English canonical
/urdu-keyboard            stays English canonical
/urdu-alphabet             stays English canonical
```

### 4.2 Urdu pages are independent canonical pages

An Urdu page canonicalizes to itself, never to the English counterpart.

Example:

```html
<link rel="canonical" href="https://write-urdu.com/urdu/urdu-keyboard">
```

### 4.3 One implementation, not two products

Urdu output is generated from the same source pages, shared JS/CSS, route registry and feature implementations. Do not create manually maintained Urdu forks of editor logic, Card Studio, keyboard behavior, export code, auth, analytics or sharing.

### 4.4 Static-first

Prefer deterministic build-time Urdu HTML generation. Do not require a Worker/Function request path merely to translate normal public pages.

### 4.5 Functional behavior remains locale-independent

Changing locale may change visible copy, document direction and locale-aware links. It must not change:

- transliteration behavior;
- input mode;
- editor state;
- local/cloud draft ownership;
- share-artifact semantics;
- Card Studio rendering;
- export output contracts;
- analytics privacy rules;
- authentication/session authorization.

### 4.6 User text is never localized

Do not translate, rewrite or send user-authored text through localization infrastructure.

## 5. Phase 1 launch corpus

Launch the smallest useful Urdu search corpus first. Phase 1 contains eight high-intent routes:

| English route | Urdu route | Job | Page type |
| --- | --- | --- | --- |
| `/` | `/urdu/` | English letters → Urdu typing | Write |
| `/urdu-keyboard` | `/urdu/urdu-keyboard` | direct Urdu keyboard | Write |
| `/urdu-editor` | `/urdu/urdu-editor` | rich Urdu editing | Write |
| `/tools/urdu-voice-typing` | `/urdu/tools/urdu-voice-typing` | speak → Urdu text | Write |
| `/urdu-alphabet` | `/urdu/urdu-alphabet` | alphabet/reference | Learn |
| `/urdu-faq` | `/urdu/urdu-faq` | Urdu/product questions | Learn |
| `/urdu-card-studio` | `/urdu/urdu-card-studio` | Urdu visual creation | Create |
| `/how-to-write-urdu-on-photo` | `/urdu/how-to-write-urdu-on-photo` | photo-writing guide | Learn |

Phase 1 is an SEO/product experiment, not a temporary technical architecture. It uses the same production locale system required for full rollout.

## 6. Phase 2 expansion

After Phase 1 crawlability, indexing and product behavior are healthy, extend the locale to the remaining eligible indexable routes in `seo.config.js` / `docs/WU-PUBLIC-PAGE-REGISTRY.csv`.

Do not mechanically localize every utility route. `noindex` account/search/feedback/transactional pages may support the Urdu UI for users without being added to the Urdu search corpus.

## 7. Locale routing contract

Introduce one shared route/locale helper. Conceptually:

```js
parseLocalePath('/urdu/urdu-editor')
// => { locale: 'ur', productPath: '/urdu-editor' }

parseLocalePath('/urdu/')
// => { locale: 'ur', productPath: '/' }

parseLocalePath('/urdu-editor')
// => { locale: 'en', productPath: '/urdu-editor' }
```

Required helper capabilities:

- detect locale from URL;
- strip `/urdu` before product-route comparisons;
- produce the locale URL for a product path;
- produce the English counterpart;
- normalize `.html`, `/index`, trailing slashes and root consistently;
- never treat `/urdu` as a product route segment after parsing.

All route-based feature detection should consume the normalized product path rather than duplicating `/urdu/...` conditions throughout the codebase.

## 8. Asset-path contract

Locale-prefixed pages expose an important static-site risk: relative assets resolve under `/urdu/`.

Therefore shared assets must be root-absolute or resolved through a shared asset helper.

Audit at minimum:

- `site-header.js`;
- `js/site-header-core.js`;
- `js/v2-shell.js`;
- product telemetry loaders;
- journey/handoff loaders;
- account/document loaders;
- Card Studio and export assets;
- fonts/images/favicon;
- manifest;
- service worker registration;
- dynamically inserted CSS/JS.

Examples of unsafe locale-prefixed references:

```text
js/foo.js
css/foo.css
image/logo10.png
manifest.webmanifest
sw.js
```

Preferred public references:

```text
/js/foo.js
/css/foo.css
/image/logo10.png
/manifest.webmanifest
/sw.js
```

The service worker remains a site-level worker. `/urdu/` must not accidentally attempt to register a separate `/urdu/sw.js` or shrink the scope to the Urdu subtree.

## 9. Locale switch contract

The language toggle becomes URL-aware.

English page:

```text
/urdu-keyboard  →  /urdu/urdu-keyboard
```

Urdu page:

```text
/urdu/urdu-keyboard  →  /urdu-keyboard
```

Rules:

- use a normal crawlable `<a>` destination or equivalent progressive-enhancement link;
- localStorage may remember preference for future UX but is not the source of truth for the current URL;
- never erase editor text simply because the user switches locale;
- for active workspaces, preserve text/state using the existing browser-local state/handoff contracts before navigation where necessary;
- no automatic redirect from `/` to `/urdu/` solely because localStorage says Urdu.

## 10. Urdu HTML contract

A Phase 1 Urdu page must ship initial HTML with:

- `<html lang="ur" dir="rtl">`;
- Urdu `<title>`;
- Urdu meta description;
- Urdu H1 and meaningful visible Urdu body copy;
- self canonical;
- reciprocal `hreflang` links;
- locale-correct OG/Twitter title/description/URL;
- schema whose human-readable fields match the Urdu page where applicable;
- locale-aware internal navigation.

JavaScript may enhance the page but must not be responsible for creating the entire Urdu search document.

## 11. Search metadata contract

For each English/Urdu pair:

### English

```text
canonical        English URL
hreflang=en      English URL
hreflang=ur      Urdu URL
hreflang=x-default English URL
```

### Urdu

```text
canonical        Urdu URL
hreflang=en      English URL
hreflang=ur      Urdu URL
hreflang=x-default English URL
```

Every hreflang pair is reciprocal.

Do not canonicalize Urdu pages to English pages and do not rely on JavaScript-only hreflang injection.

## 12. Sitemap contract

The SEO generator must be locale-aware.

Phase 1 may either:

- emit English + Urdu URLs in the existing sitemap with hreflang annotations; or
- use a sitemap index with a dedicated Urdu sitemap.

Preferred operational shape:

```text
/sitemap.xml               sitemap index
/sitemap-main.xml          established English corpus
/sitemap-urdu.xml          Urdu locale corpus
```

The exact filename structure is less important than deterministic generation, Search Console observability and no duplicate/canonical errors.

Urdu noindex utility pages do not enter the sitemap.

## 13. Translation/content contract

Reuse the existing Urdu copy wherever it remains natural and accurate, but do not ship machine-literal or technical translations only because they already exist.

User-facing language should prefer actual task phrasing such as:

- `انگریزی حروف میں اردو لکھیں`
- `آن لائن اردو لکھیں`
- `اردو کی بورڈ`
- `بولیں اور اردو میں لکھیں`

Avoid making `transliteration`, `Roman`, implementation terminology or English product jargon the primary acquisition language when simpler Urdu explains the job.

Translation review must cover:

- heading hierarchy;
- hero/lede;
- common controls;
- error/loading/empty states;
- aria labels;
- navigation/footer;
- instructional content;
- FAQs;
- workflow continuation copy;
- account/share prompts present on Phase 1 workspaces.

## 14. AdSense contract

`/urdu/` inherits the same page-type monetization rules as the corresponding product route.

Locale does not create a new ad-placement class.

Examples:

```text
/ + /urdu/                               Write rules
/urdu-card-studio + /urdu/urdu-card-studio  Create rules
/urdu-alphabet + /urdu/urdu-alphabet     Learn rules
```

Never increase ad density simply because the Urdu page is new.

Measure Urdu revenue contribution through aggregate page/URL reporting and `WU-GROWTH-001` conventions. Protect active editors/workspaces exactly as on English routes.

## 15. Measurement contract

Track the Urdu locale as a distinct acquisition cohort without collecting document content.

Required observability:

- Search Console impressions/clicks/CTR/position for `/urdu/` pages;
- indexed Urdu URL count;
- top Urdu-script queries;
- landing route / page type;
- useful second-page journey rate where existing telemetry supports it;
- AdSense pageviews and RPM for Urdu page groups where reporting allows;
- revenue/day contribution from `/urdu/` as an aggregate, not a user-level metric;
- performance/Core Web Vitals regressions.

Recommended phase-1 search query watchlist includes natural variants around:

```text
اردو ٹائپنگ
اردو لکھیں
اردو کی بورڈ
آن لائن اردو لکھیں
انگریزی سے اردو ٹائپنگ
اردو وائس ٹائپنگ
اردو حروف تہجی
تصویر پر اردو لکھیں
```

Watchlist terms are measurement aids, not a keyword-stuffing content template.

## 16. Rollout gates

### Gate A — locale foundation

- route parser works for English and Urdu URLs;
- shared assets load from `/urdu/*`;
- route-based features still recognize the underlying product path;
- service worker/manifest behavior remains valid;
- no duplicate product implementation.

### Gate B — search contract

- initial Urdu HTML is meaningful without running locale-switch JavaScript;
- canonical/hreflang are reciprocal and correct;
- Urdu sitemap output is deterministic;
- noindex/sitemap ownership remains aligned.

### Gate C — Phase 1 content

- all eight routes have reviewed Urdu title/H1/lede/content/control coverage;
- RTL desktop + mobile layouts are usable;
- language switch preserves task continuity;
- internal Urdu links remain in `/urdu/` where an Urdu counterpart exists.

### Gate D — production launch

- `npm test` passes;
- `npm run seo:check` passes with locale assertions;
- browser tests cover English ↔ Urdu counterpart navigation;
- production smoke verifies all eight routes;
- sitemap and hreflang are live;
- Search Console monitoring is started.

## 17. Non-goals

Do not include in `WU-I18N-001`:

- `/pk/` country localization;
- Hindi or other language expansion;
- automatic geo redirects;
- translation of user-authored text;
- a framework rewrite;
- duplicate locale-specific databases;
- separate authentication systems;
- locale-specific ad density;
- bulk publication of thin Urdu keyword pages;
- changing established English route ownership.

## 18. Implementation slices

Execute in order:

1. `WU-I18N-001A` — locale routing, asset safety and static generation foundation.
2. `WU-I18N-001B` — canonical/hreflang/schema/sitemap SEO contract.
3. `WU-I18N-001C` — Phase 1 Urdu content, product UX, QA and measurement launch.

Do not begin Phase 2 full-corpus expansion before Gate D is green and the Phase 1 implementation has had a chance to produce crawl/indexing evidence.

## 19. Verification baseline

```text
npm test
npm run seo:check
npm run governance:check
npm run test:browser
```

Add focused locale tests rather than weakening existing English-route assertions.