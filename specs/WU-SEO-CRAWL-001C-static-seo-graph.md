# WU-SEO-CRAWL-001C — Static SEO Graph

**Parent:** `WU-SEO-CRAWL-001`  
**Status:** In progress

## Goal

Move crawl-important structured data and breadcrumb semantics from browser-only generation to build/source-time HTML generation, using the existing SEO registry and Urdu locale generation pattern as the reference architecture.

## Current state

`seo.config.js` owns route metadata and schema declarations, while `js/seo.js` creates a large JSON-LD graph after page load. The Urdu locale generator already emits route-specific static JSON-LD into generated `/urdu/*` HTML.

This slice generalizes the static approach for English/indexable pages.

## Structured data in scope

Depending on the route declaration:

- `Organization`
- `WebSite`
- `WebPage`
- `AboutPage`
- `BreadcrumbList`
- `WebApplication`
- `CollectionPage`
- `ItemList`
- `Article`
- `FAQPage`
- `HowTo`

Only emit schema that is truthful for the visible page.

## Target architecture

```text
seo.config.js + route/page source
            ↓
build/generation helper
            ↓
static title/meta/canonical/hreflang/schema/breadcrumb semantics
            ↓
optional runtime enhancement that detects existing schema and does not duplicate it
```

The shared generator should become the source of truth for schema construction where practical. Avoid maintaining materially different English runtime and Urdu build-time schema logic.

## Metadata rules

Existing static metadata is generally healthy and must remain stable:

- title;
- description;
- canonical;
- robots/googlebot;
- OG/Twitter metadata;
- hreflang where launched.

Do not rework these merely because the schema generator is changing.

## Runtime compatibility

`js/seo.js` currently also handles runtime concerns such as restoring English page identity after locale events. This slice does not require deleting the file.

Instead:

- separate runtime-only concerns from build-owned schema concerns;
- detect static `data-write-urdu-schema` before creating another graph;
- do not produce duplicate Organization/WebSite/WebPage entities;
- preserve locale switch behavior.

## FAQ treatment

Visible FAQ questions/answers are the primary content. FAQ JSON-LD should be generated statically where the route declares it, but this slice must not introduce a separate FAQ-rich-results optimization project.

Schema answers must match visible answers.

## Collection treatment

Collection/ItemList schema should be generated from the same catalogue source used by the page rather than relying on browser-populated globals.

Slice D owns visible static catalogue rendering. Coordinate ownership so C and D do not create separate catalogue registries.

## Breadcrumb treatment

Prefer semantic source-visible breadcrumb markup for indexable content/tool pages when it does not clutter the product. Schema breadcrumb items must match the route hierarchy and canonical URLs.

Do not create misleading hierarchy merely to add schema.

## Implementation progress

- [x] Build-time graph helper uses `seo.config.js` for route/page identity.
- [x] FAQ schema is derived from visible `<details>` question/answer content.
- [x] Design-template ItemList data comes from `js/template-library-core.js`.
- [x] Writing-template ItemList data comes from `js/writing-template-catalog.js`.
- [x] Representative source-level graph contract covers application, FAQ, Article, HowTo, collection and AboutPage families.
- [x] Runtime `js/seo.js` already detects an existing `data-write-urdu-schema` graph and does not append a duplicate.
- [x] Urdu locale generation strips inherited English static schema before emitting the locale-owned `data-wu-urdu-schema` graph.
- [x] `seo:graph:sync` and `seo:graph:check` commands are registered.
- [x] Static SEO graph contract is wired into the normal `npm test` suite.
- [ ] Pass the first CI foundation gate without rewriting public HTML.
- [ ] Emit the deterministic static graph across registered indexable English source pages.
- [ ] Add `seo:graph:check` to read-only CI after generated HTML is committed.
- [ ] Confirm rendered browser DOM contains exactly one English owned graph on representative routes.

## Acceptance criteria

- [ ] Representative English indexable pages contain their declared JSON-LD in initial HTML.
- [ ] Organization/WebSite/WebPage identities are stable and not duplicated after JS execution.
- [ ] `WebApplication` routes expose truthful application schema statically.
- [ ] Article routes expose truthful Article schema statically.
- [ ] FAQ routes expose schema generated from visible/source FAQ content.
- [ ] Documentation HowTo schema is present statically and matches visible workflow.
- [ ] Collection/ItemList schema comes from a shared catalogue source.
- [ ] Urdu locale generated schema remains green.
- [ ] canonical/hreflang/title/H1 ownership is unchanged.
- [ ] runtime locale switching remains functional.

## Tests

Add source-level schema tests that do not execute browser JavaScript.

At minimum cover:

- `/` → WebApplication + site/page graph;
- `/urdu-keyboard` → WebApplication + FAQ where declared;
- `/write-urdu-documentation` → Article/HowTo;
- `/how-to-write-urdu-on-photo` → Article;
- `/urdu-templates` → CollectionPage/ItemList;
- `/why-write-urdu` → AboutPage/WebPage;
- `/urdu/` → existing Urdu static schema remains valid.

Also add a rendered-DOM/browser assertion that exactly one owned schema graph exists after page scripts run.

## Verification

```bash
npm test
npm run seo:graph:check
node scripts/check-seo.js
node scripts/check-urdu-locale-seo.js
node scripts/generate-seo-files.js
```

Validate a representative sample with a schema validator after production deploy, but repository source tests remain the deterministic release gate.
