# WU-SEO-CRAWL-001 — Public Copy & Static Crawlability

**Status:** Planned — founder-approved P0 cleanup  
**Priority:** P0.9  
**Owner:** SEO + Product + Web Platform  
**Scope:** All public indexable WriteUrdu pages, shared shell, structured data, collection pages and crawl-critical internal links  
**Primary goal:** Make every important WriteUrdu search/LLM signal understandable from the initial HTML response while removing implementation/engineering language that leaked into public product copy.

---

## 1. Why this epic exists

A 2026-08-26 audit of the current public site, XML sitemap, human sitemap, SEO runtime and source HTML found two different classes of risk:

1. **Public-copy leakage** — implementation, prompt, SEO-strategy or engineering terminology appears in user-facing/indexable content even when the user does not need that information.
2. **Render dependence** — important internal links, structured data or long-tail collection content exist only after browser JavaScript runs.

The second issue is not equivalent to saying that Google cannot render JavaScript. Google can render JavaScript. The product requirement is broader and stricter:

> Important search and LLM understanding must not require a browser runtime when the same information can be emitted safely in static HTML at build time.

WriteUrdu is an established organic-search product. This epic therefore optimizes for **crawl determinism and product-language quality without URL churn, keyword-owner churn or risky rewrites of pages already performing in search**.

---

## 2. Non-goals

This epic does **not**:

- rename established canonical URLs;
- create a new blog or bulk SEO landing pages;
- change the homepage owner for `english to urdu typing` / `urdu typing`;
- reintroduce specialist terms such as `transliteration` or `Roman Urdu` into primary homepage copy merely for schema consistency;
- remove legitimate domain terms where users actually need/search them, e.g. `Unicode`, `InPage`, `Nastaliq`, `Naskh`, `OCR`, `QR`, `PDF`;
- redesign the visual shell;
- move interactive canvases/editor state server-side;
- SSR user-entered private text;
- make Search or Feedback indexable;
- chase deprecated FAQ rich-result appearance as a standalone project;
- add or increase ad density.

---

## 3. Core product rules

### 3.1 User language first

Public copy should describe:

- what the user can do;
- what result they get;
- what they need to know before using it;
- meaningful limitations or safety/privacy facts.

Do not expose implementation rationale such as:

- why multiple routes were consolidated;
- which service/CDN/runtime is used unless disclosure is legally/product-essential;
- internal mapping/version/config identifiers;
- SEO query ownership strategy;
- internal architecture boundaries;
- telemetry field concepts;
- server-rendering implementation details.

### 3.2 Crawl-critical content is static-first

The initial HTML response should contain, when applicable:

- canonical title and meta description;
- canonical URL;
- hreflang links;
- H1 and core explanatory copy;
- crawl-important contextual links;
- meaningful header/footer navigation links;
- JSON-LD graph required by the route;
- collection item names/categories/descriptions used for search understanding;
- breadcrumb semantics where useful.

JavaScript may enhance, filter, sort, translate, personalize or interact with this content. It must not be the sole creator of crawl-critical information when build-time emission is feasible.

### 3.3 Do not destabilize ranking owners

Before changing a page's search-facing title, H1, canonical, main query wording or route relationship, verify whether this epic actually requires it. Most copy fixes should be below-title/body wording cleanup.

Frozen unless a slice explicitly proves otherwise:

- `/` search title/description/H1 and simple `English letters → Urdu` framing;
- `/urdu-keyboard` ownership of direct Urdu keyboard intent;
- `/roman-urdu-transliteration` ownership of the specialist language-mechanics guide;
- `/urdu-card-studio` + `/how-to-write-urdu-on-photo` ownership of Urdu-on-photo/card intent;
- existing canonical and hreflang relationships;
- current `noindex,follow` behavior for `/write-urdu-search` and `/feedback`.

---

## 4. Audit findings captured by this epic

### 4.1 P0 public-copy leakage

#### `/how-to-write-urdu-on-photo`
Remove the public SEO-strategy sentence equivalent to:

> the same workflow can be reused ... without creating a different tool for every phrase people search

Replace with a user-purpose statement describing poetry, quotes, greetings, announcements and social posts.

#### `/urdu-name-art-maker`
Remove implementation framing such as:

- `One direct workspace`;
- `There is no second WriteUrdu tool embedded inside Name Art`;
- `Loading the direct Name Art canvas`;
- `Live Urdu Name Art canvas and design controls`.

Replace with outcome language: create a name design, choose style/background/font, download the result.

#### `/how-to-share-urdu-writing-online`
Rewrite implementation-heavy concepts into user behavior, including phrases around:

- server-rendered social metadata;
- provenance;
- browser-first workflow;
- public snapshot boundary;
- operational metadata;
- management token;
- immutable snapshot;
- discovery feeds.

Keep truthful explanations of public publishing, deletion, privacy and the fact that a published version does not silently mutate.

#### `/tools/inpage-unicode-converter`
Keep legitimate `InPage` and `Unicode` terminology but remove implementation/config identifiers and byte/mapping language users do not need, including internal-looking version identifiers.

#### `/urdu-ocr`
Replace CDN/runtime/benchmark implementation phrasing with user-level expectations: first-use download may occur; clear printed Urdu works best; user should review extracted text.

#### `/write-urdu-sitemap`
Rewrite tool descriptions from architecture language to tasks/outcomes. Keep legitimate names such as Unicode/InPage where they identify the job.

#### `/english-urdu-typing-tutorial`
Remove migration/continuity notes such as `Existing tutorial URL retained for continuity` from public content.

### 4.2 P1/P2 copy cleanup

#### `/write-urdu-privacy`
Keep disclosures required to explain collection, processing, third parties, retention and controls. Remove internal observability/data-model wording where the same disclosure can be made plainly. Do not reduce legal/product truthfulness merely to sound simpler.

#### `/changelog`
Current customer-facing rule is good. Preserve it. Technical terms are acceptable only when they explain the actual user-visible feature.

#### `/roman-urdu-transliteration`, `/urdu-fonts-nastaliq-vs-naskh`, `/urdu-text-cleaner`
Specialist words are allowed when they are the user's actual topic. This epic must not blindly ban technical vocabulary.

---

## 5. Crawlability findings captured by this epic

### 5.1 Shared navigation/footer depends on JavaScript

The shared v2 shell currently constructs major navigation/footer link sets through JavaScript. Individual HTML files often contain only a minimal home link and empty footer before the shell runs.

**Risk:** simple HTML fetchers and some LLM/citation crawlers may not see the intended internal-link graph.

**Requirement:** emit a meaningful crawlable navigation/footer link skeleton at build/source time, then enhance it with JavaScript for dropdowns, localization, active-state and responsive behavior.

### 5.2 English structured-data graph depends heavily on `js/seo.js`

The runtime currently creates combinations of:

- `Organization`;
- `WebSite`;
- `WebPage` / `AboutPage`;
- `BreadcrumbList`;
- `WebApplication`;
- `CollectionPage`;
- `ItemList`;
- `FAQPage`;
- `Article`;
- `HowTo`.

The `/urdu/*` build already demonstrates a static JSON-LD pattern. Generalize this pattern to English/indexable routes rather than inventing a parallel SEO framework.

### 5.3 Visual Template Library catalogue is JS-only

`/urdu-templates` initially exposes a loading state and an empty template grid while useful template names/categories are injected at runtime.

**Requirement:** render useful catalogue cards or a crawlable catalogue representation into the initial HTML. JavaScript remains responsible for filtering, sorting, favorites and opening/editing designs.

### 5.4 Writing Templates visible grid is JS-only

`/urdu-writing-templates` already has strong static ItemList JSON-LD, but the visible template cards are runtime-created.

**Requirement:** render at least title, Urdu title, category/job, short description/sample and editor handoff for each catalogue item in static HTML. Interactive editing can remain runtime-driven.

### 5.5 Stylish Urdu catalogue/examples are runtime-heavy

Do not pre-render combinatorial user output. Do provide representative static examples and category/use-case text so a plain crawler understands what the tool produces.

### 5.6 Social maker canvases

Interactive canvas/editor controls may remain JavaScript-generated. They are not crawl-critical prose. Supporting explanations, links, dimensions/use cases and relevant structured data should remain static.

---

## 6. Page audit matrix and treatment

| Route / family | Public copy | Initial HTML | Required action |
| --- | --- | --- | --- |
| `/` | Good/simple | Core copy/meta static | Preserve query-owner copy; static shell/schema follow-up only |
| `/urdu-editor` | Good | Core copy/meta static | Static shell/schema |
| `/urdu-keyboard` | Good | FAQ text static | Static shell/schema; preserve FAQ content |
| `/urdu-text-cleaner` | Technical terms mostly legitimate | Core content static | Small language QA + static shell/schema |
| `/urdu-ocr` | Some implementation wording | Core content static | Copy cleanup + static shell/schema |
| `/tools/urdu-voice-typing` | Product language mostly good | Main content static | Preserve; static shell/schema |
| `/tools/inpage-unicode-converter` | Engineering leakage | Main content static | P0 copy cleanup + static shell/schema |
| `/urdu-card-studio` | Mostly good | Supporting content static | Static shell/schema |
| `/urdu-invoice-generator` | Good | Main content static | Static shell/schema |
| `/stylish-urdu-text-generator` | Runtime-heavy catalogue | Thin initial catalogue | Static representative examples/categories |
| `/urdu-name-art-maker` | Architecture leakage | Workspace runtime-heavy | P0 copy cleanup + static support/schema |
| `/urdu-whatsapp-status-maker` | Mostly good | Supporting steps + static WebApplication schema present | Preserve; strengthen static support only if useful |
| `/urdu-instagram-post-maker` | Mostly good | Supporting content thin | Static support copy; remove jargon such as safe-area when unnecessary |
| `/urdu-templates` | Good framing | Actual catalogue JS-only | P0 static catalogue |
| `/urdu-writing-templates` | Good | Static ItemList schema, visible cards JS-only | Static cards/previews |
| `/qr-code-generator` | Good | Core content static | Static shell/schema |
| `/urdu-alphabet` | Strong guide | Static | Static shell/schema |
| `/write-urdu-features` | Mostly good | Static | Minor QA only |
| `/urdu-editor-features` | Good | Static | Static shell/schema |
| `/write-urdu-documentation` | Good | Static; HowTo runtime schema | Static schema |
| `/english-urdu-typing-tutorial` | Internal continuity note | Static | Remove internal note |
| `/urdu-faq` | FAQ content static | FAQ JSON-LD runtime | Move schema with general build; no separate rich-result project |
| `/why-write-urdu` | Mostly good | Static | Minor QA + static shell |
| `/write-urdu-privacy` | Overly implementation-heavy in areas | Static | Careful plain-language cleanup |
| `/contact` | Good | Static | No material change |
| `/changelog` | Good customer-facing rule | Static | Preserve |
| `/write-urdu-sitemap` | Technical descriptions | Static | P0 product-language rewrite |
| `/roman-urdu-transliteration` | Specialist terms appropriate | Static | Preserve intent owner |
| `/urdu-fonts-nastaliq-vs-naskh` | Specialist terms appropriate | Static | Preserve |
| `/how-to-write-urdu-on-photo` | SEO strategy leak | Static | P0 copy cleanup |
| `/how-to-share-urdu-writing-online` | Architecture-heavy | Static | P0/P1 rewrite |
| `/urdu/*` launched locale | Generally static SEO | Static JSON-LD pattern exists | Treat as reference pattern; do not regress |
| `/write-urdu-search` | Appropriate | `noindex,follow` | Keep out of XML sitemap |
| `/feedback` | Appropriate | `noindex,follow` | Keep out of XML sitemap |

---

## 7. Slice plan

### Slice A — Public-language cleanup

Spec: `WU-SEO-CRAWL-001A-public-language-cleanup.md`

Goal: remove implementation/SEO/prompt leakage from public/indexable content without route or keyword-owner changes.

### Slice B — Static internal-link shell

Spec: `WU-SEO-CRAWL-001B-static-internal-link-shell.md`

Goal: make important navigation/footer links visible in initial HTML across public routes while retaining the existing interactive v2 shell.

### Slice C — Static SEO graph

Spec: `WU-SEO-CRAWL-001C-static-seo-graph.md`

Goal: generate route JSON-LD/breadcrumb semantics at build time from the existing SEO registry, using the Urdu locale generator as the reference pattern.

### Slice D — Crawlable collection content

Spec: `WU-SEO-CRAWL-001D-static-collection-content.md`

Goal: make Templates, Writing Templates and representative Stylish Urdu catalogue content understandable without JavaScript while retaining interactive behavior.

---

## 8. Ordering

Implementation order is deliberately:

1. **A — copy cleanup**: lowest behavior risk and directly removes public leakage.
2. **B — static links**: improves discovery and provides the base static shell contract.
3. **C — static schema**: consolidate structured-data generation only after source-visible navigation is stable.
4. **D — collections**: larger page-generation change; do after build/static ownership is proven.

Do not combine B–D into one large refactor.

---

## 9. Verification contract

Every slice must run the current repository test suite relevant to its owners and add focused regression coverage.

The completed epic must prove at least:

- initial HTML for every indexable registry route contains canonical/title/description/H1;
- important sitewide navigation/footer destinations are discoverable without executing JavaScript;
- English route JSON-LD required by `seo.config.js` exists in source HTML after generation/build;
- runtime SEO code does not duplicate/conflict with pre-rendered schema;
- `/urdu-templates` contains named catalogue items without JavaScript;
- `/urdu-writing-templates` contains named visible catalogue items without JavaScript;
- representative Stylish Urdu examples/categories exist without JavaScript;
- Search and Feedback remain `noindex,follow` and absent from the XML sitemap;
- Urdu locale static SEO remains intact;
- no canonical URL changes;
- no homepage search-title/H1/description regression;
- no private/local editor content is pre-rendered or serialized into public HTML;
- no new analytics payload includes user text.

Recommended verification commands (reconcile to current scripts before implementation):

```bash
npm test
node scripts/check-seo.js
node scripts/check-urdu-locale-seo.js
node scripts/generate-seo-files.js
```

Add a dedicated source-HTML crawlability contract rather than relying only on browser-rendered Playwright assertions.

---

## 10. Release / recrawl strategy

After each safe slice:

- deploy through the normal Cloudflare path;
- spot-check source HTML, not only rendered DOM;
- validate canonical and hreflang stability;
- ensure page output remains useful with JavaScript disabled where the page is expected to expose prose/catalogue links;
- avoid mass Search Console recrawl requests for pure body-copy cleanup unless an important acquisition page changed materially.

After Slice C/D closure, request recrawl for priority acquisition/collection routes and compare Search Console indexing/queries over time. Do not infer causation from a short-term ranking fluctuation.

---

## 11. Definition of done

`WU-SEO-CRAWL-001` is complete when:

- [ ] Slice A public-language leakage sweep is complete and guarded by tests.
- [ ] Slice B source-visible navigation/footer link graph is complete.
- [ ] Slice C route schema/breadcrumb generation is static-first and runtime-safe.
- [ ] Slice D major catalogue pages expose meaningful item content without JavaScript.
- [ ] all canonical/hreflang/query-owner invariants are green;
- [ ] the human sitemap reads like a user task directory rather than a product spec;
- [ ] privacy/legal content remains truthful after simplification;
- [ ] no indexability change occurs for Search/Feedback;
- [ ] no existing Urdu static-SEO behavior regresses;
- [ ] production source-view spot checks are recorded for representative Write / Create / Learn / Trust pages.

---

## 12. Decision log

### 2026-08-26 — Static-first means deterministic, not anti-JavaScript

JavaScript remains appropriate for editors, canvas rendering, filters, personalization and runtime interaction. The epic only moves **crawl-critical public information** to initial HTML.

### 2026-08-26 — FAQ schema is not a standalone priority

FAQ answer text should stay crawlable. FAQ JSON-LD moves static as part of Slice C, but no separate engineering project is justified solely for FAQ rich-result appearance.

### 2026-08-26 — Legitimate technical words stay when they name the user job

`InPage`, `Unicode`, `Nastaliq`, `Naskh`, `OCR`, `PDF`, `QR` are not automatically “engineering leakage.” Internal mappings, runtime/vendor details and SEO/product implementation rationale are.

### 2026-08-26 — Preserve mature-domain intent ownership

This is a quality/crawlability cleanup, not an excuse to rename established acquisition routes or rewrite successful simple homepage language.