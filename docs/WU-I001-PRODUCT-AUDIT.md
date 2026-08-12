# WU-I001 — WriteUrdu Product Audit and Unification Plan

**Status:** Active source of truth  
**Audit baseline:** `main` at `d72d37f62e57ea15f5f88f818cc594e48b56a234`  
**Last reviewed:** 2026-08-12  
**Primary goals:** protect transliteration, improve `urdu typing` and `urdu writing` traffic, and make every public page feel like one professionally directed product.

## 1. Executive verdict

WriteUrdu is already a useful product with real search demand, a broad tool suite, and a strong homepage/editor core. The product is not missing utility; it is missing a consistently governed product system.

The repository currently combines:

- a modern homepage presentation layer;
- newer product tools such as Card Studio, Templates, QR, invoice, name art, WhatsApp and Instagram makers;
- older informational and feature pages;
- several page-specific CSS systems;
- legacy deployment and workstation files;
- both public `.html` source files and extensionless Cloudflare routes.

The immediate opportunity is to convert this collection into a coherent Urdu writing platform without risking the transliteration path used by hundreds of people daily.

## 2. Non-negotiable release rules

1. The homepage transliteration contract must pass before merge.
2. Roman Urdu conversion after Space, Backspace suggestions, Ctrl+G, copy, clear and export must be checked on a Cloudflare Pages preview for changes affecting shared presentation or scripts.
3. No public page may be deleted until redirects, sitemap, internal links and Search Console evidence are reviewed.
4. Every public indexable page must have one canonical URL, one unique title, one meta description and one H1.
5. New page-specific visual systems are prohibited. Pages must consume the shared tokens and approved product patterns.
6. The repository documentation must be updated in the same PR whenever page status, canonical ownership, navigation or roadmap priority changes.

## 3. Current product architecture

### 3.1 Core writing

| Source page | Canonical route | Product role | Decision | Priority |
|---|---|---|---|---|
| `index.html` | `/` | Roman Urdu transliteration and primary acquisition page | Keep and protect | P0 |
| `urdu-editor.html` | `/urdu-editor` | Rich Urdu document editor | Keep; migrate first | P0 |
| `urdu-keyboard.html` | `/urdu-keyboard` | Direct Urdu keyboard | Keep; migrate first | P0 |

### 3.2 Creation tools

| Source page | Canonical route | Product role | Decision | Priority |
|---|---|---|---|---|
| `urdu-card-studio.html` | `/urdu-card-studio` | Urdu cards and downloadable images | Keep; strategic | P1 |
| `urdu-templates.html` | `/urdu-templates` | Entry point into Card Studio templates | Keep; strategic | P1 |
| `stylish-urdu-text-generator.html` | `/stylish-urdu-text-generator` | Styled Unicode/text output | Keep; validate distinct intent | P1 |
| `urdu-name-art-maker.html` | `/urdu-name-art-maker` | Name art | Keep; validate conversion and differentiation | P2 |
| `urdu-whatsapp-status-maker.html` | `/urdu-whatsapp-status-maker` | WhatsApp status design | Keep; validate distinct landing intent | P2 |
| `urdu-instagram-post-maker.html` | `/urdu-instagram-post-maker` | Instagram design | Keep; validate distinct landing intent | P2 |
| `qr-code-generator.html` | `/qr-code-generator` | Static QR generation | Keep; supporting tool | P2 |
| `urdu-invoice-generator.html` | `/urdu-invoice-generator` | Urdu/English invoice generator | Keep; business tool | P1 |

### 3.3 Learning and support

| Source page | Canonical route | Product role | Decision | Priority |
|---|---|---|---|---|
| `roman-urdu-transliteration.html` | `/roman-urdu-transliteration` | Roman Urdu explanation and support content | Keep; reinforce homepage | P1 |
| `english-urdu-typing-tutorial.html` | `/english-urdu-typing-tutorial` | Task tutorial | Keep provisionally; check overlap | P1 |
| `urdu-faq.html` | `/urdu-faq` | Language and product FAQ | Keep; migrate | P1 |
| `write-urdu-documentation.html` | `/write-urdu-documentation` | Full product documentation | Keep; migrate | P1 |
| `urdu-fonts-nastaliq-vs-naskh.html` | `/urdu-fonts-nastaliq-vs-naskh` | Educational comparison | Keep; supporting authority | P2 |
| `urdu-alphabet.html` | `/urdu-alphabet` | Urdu alphabet learning page | Keep; existing search asset | P1 |
| `write-urdu-features.html` | `/write-urdu-features` | General product features | Merge/reframe candidate | P2 |
| `urdu-editor-features.html` | `/urdu-editor-features` | Rich editor features | Merge/reframe candidate | P2 |

### 3.4 Company and utility pages

| Source page | Canonical route | Product role | Decision | Priority |
|---|---|---|---|---|
| `why-write-urdu.html` | `/why-write-urdu` | Product/about positioning | Keep; become About page | P1 |
| `write-urdu-feedback.html` | `/write-urdu-feedback` | Feedback/contact | Keep; simplify | P2 |
| `write-urdu-privacy.html` | `/write-urdu-privacy` | Privacy policy | Keep; legal | P1 |
| `write-urdu-search.html` | `/write-urdu-search` | Site search | Review indexability and usefulness | P2 |
| `write-urdu-sitemap.html` | `/write-urdu-sitemap` | Human-readable sitemap | Keep only if maintained automatically | P2 |

## 4. Information architecture decision

The target product navigation is:

- **Write** — homepage, Rich Editor, Urdu Keyboard
- **Create** — Card Studio, Templates, Stylish Text, Name Art, WhatsApp, Instagram, QR
- **Business** — Invoice Generator
- **Learn** — Documentation, FAQ, Tutorials, Transliteration, Alphabet, Font guide
- **About** — Why WriteUrdu, Feedback, Privacy, Sitemap

Primary navigation should remain intentionally small:

1. Write Urdu
2. Tools
3. Learn
4. Templates
5. Start typing / current-tool action

The full taxonomy belongs in a structured dropdown and footer, not as a flat navigation list.

## 5. UX audit

### 5.1 What is working

- The homepage now establishes a recognizable green visual identity.
- The writing surface is prominent and task-first.
- The product breadth is discoverable through tool cards and the footer.
- Mobile actions have larger targets and clearer grouping.
- The editor remains usable without account creation.

### 5.2 Systemic UX problems

1. **Page-specific visual dialects.** Multiple CSS files such as `documentation.css`, `faq.css`, `editor-features.css`, `card-studio.css`, invoice styles, keyboard styles and newer homepage styles indicate separately evolved experiences.
2. **Inconsistent hierarchy.** Page heroes, section headings, cards, notices, forms, toolbar controls and footers are not governed by one component contract.
3. **Navigation density.** Older pages expose long flat navigation structures while newer areas use a broader product taxonomy.
4. **Dead-end risk.** Supporting pages do not consistently provide a clear next action, related tool and related learning resource.
5. **Typography fatigue.** The homepage has now been normalized, but other page-specific styles may still use arbitrary weights, sizes and dense content blocks.
6. **Mobile variation.** Each complex tool has its own responsive assumptions; the same control hierarchy and sheet/menu behavior are not guaranteed across tools.
7. **Legacy chrome.** Bootstrap-era markup and old header/footer structures remain in source pages and are often visually overridden rather than structurally unified.

### 5.3 Required shared patterns

The static site does not require a framework migration. Shared patterns can be supplied through stable CSS classes and progressive JavaScript enhancement:

- `wu-page-shell`
- `wu-site-header`
- `wu-page-hero`
- `wu-tool-shell`
- `wu-toolbar`
- `wu-button` variants
- `wu-field` and `wu-field-group`
- `wu-card` and `wu-tool-card`
- `wu-section-heading`
- `wu-notice`
- `wu-badge`
- `wu-related-tools`
- `wu-related-learning`
- `wu-breadcrumbs`
- `wu-site-footer`

Approved font weights remain `400`, `500`, `600` and `700` only.

## 6. SEO and canonical audit

### 6.1 Existing strengths

- Cloudflare Pages `_redirects` normalizes legacy path variants; hostname canonicalization is handled separately at the Cloudflare zone edge.
- `.html` URLs redirect to extensionless routes.
- trailing-slash variants redirect to non-trailing routes.
- the XML sitemap uses extensionless canonical URLs.

### 6.2 Gaps and risks

1. **Sitemap incompleteness.** The XML sitemap includes most strategic pages but omits at least the feedback and search pages. This may be intentional, but indexability must be explicitly recorded rather than accidental.
2. **Manual dates and priorities.** Sitemap `lastmod` values are manually maintained and already lag current product changes. `priority` values are not a substitute for internal-link hierarchy.
3. **Canonical coverage needs verification.** Each source page must be checked for a matching self-referencing canonical. Runtime injection alone is not sufficient for critical pages unless tests verify the rendered source contract.
4. **Feature-page overlap.** `write-urdu-features`, `urdu-editor-features`, documentation and tutorials may overlap in intent and wording. They require a content ownership decision.
5. **Keyword cannibalization risk.** The homepage should remain the owner of broad `urdu typing` and `urdu writing` intent. Supporting pages should target narrower jobs rather than repeat the homepage proposition.
6. **Human sitemap maintenance.** The HTML sitemap can become misleading if not generated from the same route registry as `sitemap.xml`.
7. **Search-result page.** Internal search pages should usually be `noindex,follow` unless they contain intentionally curated standalone content.

### 6.3 Canonical route policy

- Preferred origin: `https://www.write-urdu.com`
- Preferred route style: extensionless, no trailing slash except `/`
- Source `.html` files remain implementation details for Cloudflare Pages.
- All internal links must use canonical extensionless routes.
- Redirects must remain one hop.
- No canonical should point to a URL that redirects.
- Retired pages receive a 301 to the closest intent-equivalent page; unrelated redirects to the homepage are prohibited.

## 7. Repository hygiene audit

### 7.1 Confirmed cleanup candidates

These items do not belong in the deployable product root unless a documented runtime reference proves otherwise:

- `.vs/` and Visual Studio workspace state
- `editor-current-desktop.png`
- `editor-current-font-menu.png` and other review screenshots stored at root
- `Online Kids madrasa.jpg`
- `Online Kids madrasa small.jpg`
- `Write-urdu.doc`
- temporary verification or ownership files after confirming they are no longer required

Screenshots useful for product history should move to `docs/assets/`. Local workstation state should be deleted and ignored.

### 7.2 Asset cleanup method

Do not delete assets by filename guess. The cleanup PR must:

1. build a reference graph from HTML, CSS, JS, sitemap, manifest and documentation;
2. mark generated, external and runtime-composed references separately;
3. remove only zero-reference assets confirmed absent from production network requests;
4. retain a redirect or replacement when a public asset URL has backlinks or search visibility.

### 7.3 CSS consolidation direction

The repository contains many feature-specific CSS files. They should not be collapsed blindly into one large file. The target is:

- `design-tokens.css` — primitives only
- `product-shell.css` — global header, footer, layout, typography and shared components
- `editor-tools.css` — shared editor interaction patterns
- tool-specific files — only unique workspace/layout rules
- page-specific marketing CSS — removed after migration

## 8. Engineering quality gaps

The repository now has baseline quality checks, but product governance requires additional tests:

1. Public route registry and duplicate route detection
2. Canonical tag verification for every indexable page
3. Redirect target and redirect-chain validation
4. Sitemap-to-registry reconciliation
5. Missing title, description and H1 checks
6. Duplicate title and description checks
7. Broken internal-link validation
8. Orphan-page detection
9. Shared header/footer presence checks
10. Disallowed font-weight detection
11. Legacy hostname and `.html` internal-link detection
12. Transliteration regression contract and browser smoke tests

## 9. Phased implementation roadmap

### Phase 2A — Governance and route safety

**Goal:** create the single source of truth before mass migration.

Deliverables:

- machine-readable public page registry;
- canonical/indexability decision for every page;
- sitemap and redirect reconciliation tests;
- orphan and broken-link report;
- explicit keep/merge/redirect/noindex/remove status;
- repository root cleanup for unquestionably non-product workstation files.

### Phase 2B — Product shell

**Goal:** make shared chrome consistent without changing tool internals.

Deliverables:

- shared product shell CSS;
- one header/navigation model;
- one footer taxonomy;
- breadcrumbs for non-home pages;
- standard page hero, section heading, card, notice and CTA patterns;
- migration checklist and visual acceptance criteria.

Migration order:

1. Rich Editor
2. Urdu Keyboard
3. Documentation
4. FAQ
5. Card Studio
6. Templates
7. Invoice Generator
8. Remaining creation tools
9. About/legal/support pages

### Phase 2C — Content and canonical consolidation

**Goal:** remove overlapping intent and strengthen search ownership.

Deliverables:

- decide whether feature pages merge into documentation or become focused landing pages;
- keep homepage as broad Urdu typing/writing owner;
- narrow supporting pages to Roman Urdu, keyboard, rich editing, formatting and learning jobs;
- redirect retired pages;
- update sitemap, internal links and schema;
- request recrawl only after redirects and canonicals are stable.

### Phase 2D — Repository and asset cleanup

**Goal:** ensure Cloudflare deploys only current product material.

Deliverables:

- delete `.vs/` and ignore it;
- move documentation screenshots to `docs/assets/` or remove them;
- remove confirmed unreferenced images, documents, CSS and JS;
- document retained legacy files and their purpose;
- establish an automated asset/reference report.

### Phase 2E — SEO growth for existing demand

**Goal:** improve `urdu typing` and `urdu writing` without destabilizing the editor.

Deliverables:

- homepage snippet and visible-content refinement;
- stronger internal links from keyboard, editor, FAQ, tutorial and transliteration pages;
- unique examples and FAQs mapped to search intent;
- Search Console scorecard updated every release cycle;
- 8–12 week measurement window before major URL or intent changes.

## 10. Acceptance criteria for “UX-director quality”

A page is not considered migrated until:

- it uses the shared header and footer;
- it has one clear primary task;
- the first viewport explains what the page does and how to begin;
- typography uses the approved scale and weights;
- buttons, cards, fields, notices and links use shared patterns;
- desktop and 320px mobile layouts are reviewed;
- keyboard focus is visible and logical;
- empty, success, loading and error states are intentional where applicable;
- related tools and related learning links prevent dead ends;
- title, description, H1, canonical and indexability match the registry;
- internal links use canonical routes;
- automated checks pass;
- Cloudflare preview is reviewed before merge.

## 11. Documentation governance

This file is the strategic audit. The detailed page-by-page status lives in `docs/WU-PUBLIC-PAGE-REGISTRY.csv`.

Every PR that changes a public page must update the registry when it changes:

- canonical route;
- indexability;
- page owner/intent;
- lifecycle status;
- design-system migration state;
- sitemap inclusion;
- redirect behavior.

Roadmap progress must be recorded in `docs/WU-I001-IMPLEMENTATION-TRACKER.md` in the same PR as implementation.

## 12. Immediate next work

The next implementation PR should be **Phase 2A: route registry, canonical checks and cleanup tooling**. It should avoid broad visual changes. Once governance is executable, start **Phase 2B** with the Rich Editor and Urdu Keyboard because they are closest to the highest-value writing intent and user journey.