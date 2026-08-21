# WU-I18N-001D — Full Urdu Product Expansion

**Parent:** `WU-I18N-001`  
**Depends on:** Phase 1 (`WU-I18N-001A/B/C`) production gates  
**Status:** Planned follow-up — execute after Phase 1 is technically stable  
**Goal:** make the complete user-facing WriteUrdu product available in Urdu while keeping search indexability intentional

## 1. Objective

Expand the proven `/urdu/` locale architecture from the eight-page Phase 1 corpus to the complete user-facing product without creating a second product implementation or a mass of thin search pages.

“Fully available in Urdu” has two distinct meanings and this spec keeps them separate:

1. **Searchable Urdu public pages** — useful public routes that deserve independent indexing.
2. **Functional Urdu product/utility pages** — account, documents, feedback and other user flows that should support Urdu but may remain `noindex` and outside sitemaps.

Do not equate “localized” with “indexable.”

## 2. Preconditions

Do not start bulk expansion until all are true:

- Phase 1 generated route/asset architecture is stable in production;
- Google can crawl the Phase 1 Urdu pages without systematic canonical selection back to English;
- English owner routes have no material technical regression attributable to locale support;
- locale generator drift checks are green;
- shared route normalization is used by current product modules;
- RTL/product QA pattern is proven on Write, Learn and Create page types.

Search traffic volume is not required to be large before improving functional language completeness, but technical correctness is mandatory.

## 3. Expansion source of truth

At implementation time derive the route inventory from:

- `seo.config.js`;
- `docs/WU-PUBLIC-PAGE-REGISTRY.csv`;
- current account/document route registry;
- current workspace/journey registries.

Do not hard-code the August 2026 route count into the generator forever.

Every public route must be classified:

```text
A = Urdu indexable
B = Urdu functional noindex
C = locale-neutral / no duplicate URL
D = excluded / unsupported with explicit reason
```

Record the classification in the locale registry.

## 4. Likely indexable expansion cohort

Subject to the current registry and content quality at implementation time, likely Phase 2 indexable routes include:

- `/urdu/urdu-text-cleaner`
- `/urdu/urdu-ocr`
- `/urdu/tools/inpage-unicode-converter`
- `/urdu/urdu-templates`
- `/urdu/stylish-urdu-text-generator`
- `/urdu/urdu-name-art-maker`
- `/urdu/urdu-whatsapp-status-maker`
- `/urdu/urdu-instagram-post-maker`
- `/urdu/qr-code-generator`
- `/urdu/urdu-invoice-generator`
- `/urdu/write-urdu-features`
- `/urdu/urdu-editor-features`
- `/urdu/write-urdu-documentation`
- `/urdu/english-urdu-typing-tutorial` only if the localized route still owns a distinct useful tutorial job
- `/urdu/why-write-urdu`
- `/urdu/contact`
- `/urdu/changelog` when enough Urdu release content exists to justify it
- `/urdu/write-urdu-sitemap`
- `/urdu/roman-urdu-transliteration` only after re-evaluating the user-facing terminology and intent
- `/urdu/urdu-fonts-nastaliq-vs-naskh`
- `/urdu/how-to-share-urdu-writing-online`

This list is planning input, not permission to publish every route automatically.

Each route still needs reviewed Urdu body content and a clear user job.

## 5. Functional noindex cohort

Likely functional Urdu pages include, as applicable at implementation time:

- `/urdu/sign-in`
- `/urdu/my-documents`
- `/urdu/feedback`
- `/urdu/write-urdu-search`
- account/preferences utilities
- document-management utility routes

Rules:

- preserve the English API endpoints;
- no locale-specific database tables;
- localized route changes only presentation/navigation;
- maintain `noindex` where the English route is noindex unless a separate SEO decision changes ownership;
- keep these pages out of Urdu sitemap generation;
- do not create hreflang/indexing machinery that contradicts their noindex purpose.

## 6. Locale-neutral routes

Not every endpoint needs `/urdu/` duplication.

Examples that should normally remain locale-neutral:

- `/api/*`;
- authentication callback endpoints;
- static assets;
- service worker;
- manifest;
- robots/sitemaps;
- telemetry ingestion;
- document/share APIs.

Public share artifact URLs such as `/s/:id` should not automatically gain a duplicate `/urdu/s/:id`. The shared artifact content already carries its own language/direction and remains governed by `WU-SHARE-001` indexability rules.

If the public share shell later needs localized chrome, resolve it through UI locale without duplicating the share identifier namespace unless separately justified.

## 7. Content expansion strategy

Do not translate all remaining pages in one unreviewable commit.

Expand in coherent page-type batches:

### Batch 1 — Learn/reference

Examples:

- Documentation
- Fonts
- Features
- Formatting
- share guide
- About/contact

Why first: strong crawlable content, lower functional risk, useful AdSense-safe inventory.

### Batch 2 — browser-local utilities

Examples:

- Text Cleaner
- OCR
- InPage converter
- QR

Why second: clear task vocabulary but more dynamic error/state translation.

### Batch 3 — creation/business

Examples:

- Templates
- Stylish Text
- Name Art
- WhatsApp/Instagram makers
- Invoice

Why third: larger dynamic control/state catalogues and RTL canvas/control QA.

### Batch 4 — noindex/account utilities

Examples:

- sign in
- My Documents
- feedback/search utilities

Why fourth: important for full product language consistency but not required to validate SEO acquisition first.

The exact order can change with product state, but preserve reviewable cohorts.

## 8. Search-intent review per route

Before making an Urdu version indexable, answer:

1. What is the user job in natural Urdu?
2. Is the page substantially useful in Urdu beyond metadata?
3. Does this route have a distinct owner, or would it compete with another Urdu page?
4. Does the English route already have proven intent that should be mirrored rather than reinvented?
5. Is the Urdu phrasing understandable without technical vocabulary?

Reject or consolidate a locale page if these questions do not have good answers.

## 9. Internal-link completeness

As the locale expands, update the locale-aware route registry so Urdu users remain in Urdu whenever a counterpart exists.

Required eventual behavior:

```text
Urdu global navigation -> Urdu counterparts
Urdu footer -> Urdu counterparts
Urdu Learn links -> Urdu Learn pages
Urdu workspace next steps -> Urdu target workspace
Urdu account shell -> Urdu sign-in/documents pages
```

Do not hard-code `/urdu` into individual templates. Use the shared locale route helper.

If a target has no Urdu counterpart, fall back explicitly to the English target rather than generating an invalid route.

## 10. Dynamic state completeness

Full product localization must include more than static HTML.

Inventory and review dynamic WriteUrdu-owned strings in:

- toasts;
- validation errors;
- empty states;
- loading/busy states;
- permission/support states;
- save/restore states;
- account/session states;
- public share/publish controls where applicable;
- export dialogs;
- Card Studio result/state messages;
- QR validation;
- OCR progress/failure;
- Voice permission/browser support;
- document conflict/recovery flows.

Migrate scattered strings into the shared locale catalogue when touched.

Do not attempt a risky all-at-once refactor of vendor libraries solely for translation parity.

## 11. CSS/RTL cleanup

Phase 2 is the point to reduce temporary locale-specific fixes discovered in Phase 1.

Prefer shared logical layout properties:

```text
margin-inline-start/end
padding-inline-start/end
inset-inline-start/end
border-inline-start/end
text-align: start/end
```

Do not rewrite stable canvas coordinate systems or export renderers just because the UI is RTL.

Keep visual output semantics governed by each product feature.

## 12. SEO expansion rules

For every newly indexable Urdu route:

- initial Urdu source;
- self canonical;
- reciprocal `en`, `ur`, `x-default` alternates;
- Urdu metadata/H1/body;
- locale-correct structured data;
- sitemap membership;
- crawlable internal discovery;
- clean URL normalization;
- no keyword-stuffed duplication.

For functional noindex routes:

- preserve noindex;
- keep out of sitemaps;
- language counterpart links may still exist for users;
- do not count them as SEO corpus growth.

## 13. AdSense rules

Full locale expansion does not alter monetization classes.

Use normalized product path to inherit:

- Write;
- Learn;
- Create;
- Work/Business;
- Trust/Utility

behavior from the existing AdSense operating contract.

Do not add more units simply because the Urdu corpus becomes larger.

Revenue upside should come from qualified additional traffic and useful page depth, not locale-specific ad pressure.

## 14. Analytics/measurement

Continue the bounded locale dimension:

```text
en | ur
```

Add route/page-type aggregation where already allowed.

Track Phase 2 by cohort:

- indexable Urdu pages discovered/indexed;
- Urdu organic clicks/impressions;
- top Urdu query clusters;
- useful journey depth;
- Page RPM/revenue by available locale/page group;
- conversion into core writing/creation actions;
- errors/unsupported states by product route without content payloads.

Never log user document/transcript/image content.

## 15. Full-locale QA matrix

Every page-type batch must cover:

### Static/source

- lang/dir;
- canonical/indexability;
- localized title/H1/lede;
- internal locale links;
- safe assets.

### Desktop/mobile

- header/footer;
- primary task;
- dynamic states;
- RTL layout;
- focus order;
- mixed-language tokens;
- ads/protected areas.

### Functional

- primary action works;
- export/copy/save where applicable;
- handoff destination preserves locale;
- account/session behavior unchanged;
- no user content in URL/telemetry.

## 16. Generator performance/maintenance

As the corpus grows, keep locale generation deterministic and fast enough for normal repository workflows.

The generator should:

- generate only registered locale routes;
- support full generation;
- ideally support targeted route generation for development;
- fail loudly on missing localization keys required for indexable pages;
- distinguish warnings for optional untranslated secondary copy from errors for critical/indexable copy;
- avoid network dependencies.

Do not solve scale by copying pages manually.

## 17. Backward compatibility

Preserve:

- existing English bookmarks;
- `.html` legacy redirects;
- shared localStorage/draft formats;
- handoff storage keys;
- public share IDs;
- auth callback URLs;
- current database schema;
- current APIs.

Locale expansion is not a data migration.

## 18. Acceptance criteria

The full Urdu product expansion is complete when:

- [ ] every current user-facing route is classified A/B/C/D in the locale registry;
- [ ] every approved indexable public route has a reviewed Urdu counterpart;
- [ ] every approved functional noindex product route has usable Urdu chrome/content;
- [ ] APIs/assets/share identifiers remain locale-neutral unless explicitly justified;
- [ ] global navigation/footer/handoffs stay in Urdu whenever a counterpart exists;
- [ ] dynamic critical states are localized for WriteUrdu-owned UI;
- [ ] no route depends on browser-local language switching for its crawlable Urdu body;
- [ ] canonical/hreflang/sitemap checks cover the full indexable locale corpus;
- [ ] noindex utilities remain excluded from sitemaps;
- [ ] English route behavior/search metadata remain protected;
- [ ] RTL desktop/mobile regression suite covers each page-type cohort;
- [ ] no new database/backend exists solely for localization;
- [ ] Urdu locale contribution is measurable under `WU-GROWTH-001`.

## 19. Verification

```text
npm run locale:generate
npm run locale:check
npm run seo:generate
npm run seo:check
npm run governance:check
npm test
npm run test:browser
```

Execute expansion in reviewable batches. “All pages generated” is not equivalent to “the product is fully available in Urdu.”