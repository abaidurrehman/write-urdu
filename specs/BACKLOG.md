# WriteUrdu — Canonical Product & Spec Backlog

**Status:** Active  
**Last updated:** 2026-08-09  
**Purpose:** One source of truth for what gets built next.

This file owns **priority and sequence**. Individual feature specs own detailed behaviour and acceptance criteria. `docs/WU-I001-IMPLEMENTATION-TRACKER.md` records migration execution; SEO/content documents provide supporting evidence and checklists.

## Commercial objective

WriteUrdu is an organic-search-led, Google AdSense-funded product. The roadmap should maximize **durable useful organic traffic and monetizable pageviews** while protecting transliteration, search quality, user trust, mobile usability and Core Web Vitals.

The governing commercial model is documented in `specs/WU-GROWTH-001-search-adsense-growth-system.md`:

`AdSense revenue ≈ monetizable pageviews × page RPM / 1000`

Search Console tells us where traffic can grow. AdSense tells us which traffic/page groups create commercial value. Product work should be ranked from both datasets rather than from aesthetic migration order alone.

## Priority rules

1. Protect the production transliteration workflow and existing search equity.
2. Protect and expand proven organic traffic before inventing new surface area.
3. Use Search Console + AdSense evidence to order P0/P1 work whenever data is available.
4. Prefer useful product improvements that increase successful sessions, repeat use or natural second-page navigation over documentation-only work.
5. Finish and verify partially implemented product specs before creating unsupported new tools, unless measured search/revenue opportunity clearly outranks them.
6. Keep active writing surfaces ad-light; never trade task usability, CLS or accidental-click risk for additional inventory.
7. Each implementation slice must include tests and a Cloudflare preview.
8. Do not create thin keyword pages or new tools without a clear user job, route ownership and commercial rationale.
9. New feature specs use `WU-<AREA>-<NUMBER>` and must define route, scope, state/data contract, acceptance criteria, implementation map and verification commands.

---

## NOW — P0

### P0.1 — Build the Search Console + AdSense commercial baseline

**Type:** Commercial strategy / growth control plane  
**Spec:** `specs/WU-GROWTH-001-search-adsense-growth-system.md`  
**Current evidence:** only two Search Console query rows are recorded in-repo, so the roadmap is not yet commercially evidence-complete.

Required first review:

- [ ] Analyze full Search Console Queries export.
- [ ] Analyze Pages export.
- [ ] Analyze Countries and Devices.
- [ ] Analyze date trend / comparison period.
- [ ] Map important query clusters to ranking URLs.
- [ ] Review a comparable AdSense aggregate export: earnings, page RPM, pageviews/ad impressions, country, device, placement/page group where available.
- [ ] Produce top traffic-defence opportunities, near-win queries, CTR opportunities, cannibalization risks and commercially promising new clusters.
- [ ] Estimate directional incremental revenue for the strongest opportunities using observed/proxy RPM.
- [ ] Reorder P0/P1 below using measured commercial opportunity.

**Commercial rationale:** this determines which work can actually grow AdSense revenue rather than assuming every v2 page deserves equal effort.

**Strategic gate:** until this review is complete, avoid major speculative feature expansion. Low-risk completion work may continue in parallel.

### P0.2 — Close SEO-A1 production follow-up

**Type:** Growth / operational verification  
**Source:** `docs/WU-SEO-AUTHORITY-001.md`, `docs/SEO-POST-DEPLOYMENT.md`  
**Code status:** Merged in PR #9 (`f9bce99ddd501bf294ca2f58766e69c307e59527`)

- [ ] Verify production deployment after cache purge.
- [ ] Smoke-test homepage transliteration in production.
- [ ] Validate homepage and authority JSON-LD with Google Rich Results Test and Schema.org Validator.
- [ ] Request recrawl for `/`, `/urdu-editor`, `/urdu-keyboard`, `/write-urdu-documentation`, `/urdu-faq`, `/roman-urdu-transliteration`, `/urdu-alphabet` and `/why-write-urdu`.
- [ ] Confirm `/llms.txt`, `/robots.txt`, `/sitemap.xml` and `/.well-known/security.txt` are publicly reachable without Cloudflare challenges.
- [ ] Start weekly tracking for `urdu typing` and `urdu writing` from the recorded Search Console baseline.

**Commercial rationale:** protects the two proven high-impression query opportunities and validates that the SEO changes can be crawled and measured.

### P0.3 — V2-S3 completion: authority pages + overlap decision

**Type:** Product/UX + SEO safety  
**Source:** `docs/WU-V2-EXECUTION.md`, `docs/WU-I001-IMPLEMENTATION-TRACKER.md`

- [ ] Migrate `/urdu-fonts-nastaliq-vs-naskh` to the shared v2 authority system.
- [ ] Review `/english-urdu-typing-tutorial` against the homepage, Documentation and Roman Urdu guide.
- [ ] Decide: keep, narrow, merge or redirect the tutorial using route/Search Console evidence.
- [ ] If consolidation is justified, preserve a one-hop redirect and update sitemap, structured data and internal links in the same PR.

**Commercial rationale:** consolidation can protect search equity and concentrate pageviews, but this item may move up/down after the full GSC review.

### P0.4 — Close `WU-SUA-001` as real product work

**Type:** Product completion  
**Spec:** `specs/WU-SUA-001-stylish-urdu-text-name-art.md`  
**Current spec status:** Implementing

Before treating Stylish Urdu Text and Name Art as finished, audit the implementation against the spec acceptance checklist rather than assuming the routes are complete because they exist.

- [ ] Verify 80+ unique styles and category/intensity behaviour.
- [ ] Verify favourites/collections/recent-input local persistence and recovery.
- [ ] Verify grapheme safety, Urdu-specific character preservation and conservative Kashida handling.
- [ ] Verify Name Art has the required template/preset coverage and local handoff.
- [ ] Verify exact-size PNG/transparent PNG export waits for fonts/assets.
- [ ] Verify accessibility, mobile layout, privacy copy and failure recovery.
- [ ] Add any missing browser/integration coverage.
- [ ] Change spec status to Implemented only after the acceptance checklist is actually green.

**Commercial rationale:** incomplete product quality can reduce repeat use/session depth; priority should be confirmed against GSC/AdSense opportunity before substantial extra polish.

---

## NEXT — P1

**Important:** the order below is provisional until P0.1 completes. Re-rank using measured organic click upside, RPM, useful page depth, effort and risk.

### P1.1 — Defend and expand proven search demand

This is a permanent growth lane rather than a one-off page.

- [ ] Strengthen pages/queries with high impressions and weak CTR.
- [ ] Prioritize positions 4–10 with material impressions.
- [ ] Evaluate strong relevance at positions 11–20.
- [ ] Resolve query cannibalization.
- [ ] Address device-specific CTR or UX gaps.
- [ ] Improve natural supporting links into high-value landing pages.
- [ ] Protect high-RPM/high-traffic page groups from risky redesigns.

**Commercial rationale:** direct path from proven impressions to incremental AdSense-funded visits.

### P1.2 — V2-S4A: Card Studio + Templates

**Type:** Product UX migration  
**Specs:** `WU-CS-UX-001`, `WU-CS-UX-002`

- [ ] Move Card Studio onto the v2 application hierarchy without changing rendering/export contracts.
- [ ] Make the canvas/workspace dominant and move educational/promo content below it.
- [ ] Migrate Template Library into the same creation workflow and strengthen handoff into Card Studio.
- [ ] Preserve template IDs, local state, transliteration and export behaviour.
- [ ] Validate ad placement around the workspace against `WU-GROWTH-001` guardrails.

**Commercial rationale:** potential to create longer useful sessions and natural second-page/tool handoffs; confirm acquisition and RPM evidence before large investment.

### P1.3 — V2-S4B: Stylish Urdu Text + Name Art

**Type:** Product UX migration after `WU-SUA-001` acceptance closure

- [ ] Apply v2 creation shell to both routes.
- [ ] Make Copy/Favourite/Open in Name Art actions clear and contextual.
- [ ] Keep Unicode-style versus rendered-image distinction explicit.
- [ ] Preserve ad-light active creation surfaces.

**Commercial rationale:** session-depth/repeat-use candidate; promote only if GSC/AdSense or engagement evidence supports it.

### P1.4 — V2-S4C: Social makers + QR Generator

**Type:** Product UX migration  
**Spec:** `WU-SM-001` plus existing QR implementation contracts

- [ ] Migrate WhatsApp Status Maker and Instagram Post Maker.
- [ ] Migrate QR Generator.
- [ ] Preserve local processing, safe-area logic, QR payload validation and export contracts.

**Commercial rationale:** query clusters such as Urdu WhatsApp/status/QR may be acquisition opportunities, but ranking depends on actual Search Console evidence.

### P1.5 — V2-S5: Invoice Generator

**Type:** Business workflow migration  
**Specs:** `WU-IG-001`, `WU-IG-002`, `WU-IG-003`

- [ ] Move the invoice workflow onto the v2 shell without weakening the invoice-first workspace.
- [ ] Preserve totals, schema migration, language modes, adaptive density, QR and export behaviour.
- [ ] Review whether the WriteUrdu invoice remains strategically useful versus the dedicated InvoiceCraftly product; do not remove or redirect without traffic/product evidence.

**Commercial rationale:** retain if it contributes organic traffic, useful page depth or cross-product value; otherwise it should not outrank proven Urdu search opportunities.

### P1.6 — Content/canonical consolidation

**Type:** SEO safety / information architecture

- [ ] Review `write-urdu-features` against Documentation and About.
- [ ] Review `urdu-editor-features` against Rich Editor and Documentation.
- [ ] Finish the typing-tutorial decision if not completed in V2-S3.
- [ ] Remove genuine duplication only with one-hop redirect, canonical, sitemap and internal-link updates.

**Commercial rationale:** concentrate search signals and avoid wasting impressions across overlapping pages.

---

## LATER — P2

### P2.1 — V2-S6 release closure

- [ ] Complete extensionless internal-link migration across all remaining public pages.
- [ ] Migrate About, Privacy, Feedback, Search and human sitemap to the final shared shell where needed.
- [ ] Validate every registered canonical, sitemap entry and redirect.
- [ ] Publish v2 release notes.
- [ ] Capture post-release Search Console and AdSense baselines.

### P2.2 — Asset/code/performance cleanup

**Source:** implementation tracker Phase 2D

- [ ] Build HTML/CSS/JS asset-reference report.
- [ ] Identify zero-reference images/documents.
- [ ] Identify obsolete CSS and JavaScript.
- [ ] Remove only confirmed unused assets/dependencies.
- [ ] Audit homepage legacy Bootstrap/jQuery/social dependencies after v2 migration, with transliteration protected.
- [ ] Measure whether ad/script loading contributes to LCP/CLS/INP regressions on high-traffic pages.
- [ ] Confirm Cloudflare production artifact contains only required product files.

**Commercial rationale:** faster pages can protect rankings, mobile usage and ad viewability; prioritize by traffic impact.

### P2.3 — Existing-demand SEO growth iteration

Do not change the homepage title repeatedly while the current experiment is unmeasured.

- [ ] Improve descriptive supporting links into `/` where natural.
- [ ] Refine examples/FAQ based on actual queries, not keyword density.
- [ ] Compare CTR, average position and ranking URL after recrawl.
- [ ] Compare corresponding organic pageviews and AdSense revenue/RPM trend.
- [ ] Evaluate after an 8–12 week window unless a material regression appears sooner.

### P2.4 — Answer-ready content backlog

**Source:** `docs/SEO-CONTENT-BACKLOG.md`

Candidates are **not automatically approved**. Promote only when Search Console evidence or adjacent query research shows a meaningful acquisition opportunity and the page can stand on its own as useful content.

- [ ] 100 common Roman Urdu phrases with reviewed Urdu examples.
- [ ] How to type Urdu in WhatsApp, Microsoft Word and Google Docs.
- [ ] How to create Urdu WhatsApp Status / poetry cards.
- [ ] Static QR code mechanics and quiet-zone guidance.
- [ ] Browser compatibility notes for writing/creation tools.
- [ ] Local-draft, image-upload and QR-logo privacy guide.
- [ ] Urdu punctuation, numerals and RTL writing direction.

---

## HOLD / evidence required

These require evidence or a separate approved spec before implementation:

- Separate doorway pages for `urdu typing` / `urdu writing` keyword variants.
- New content/tool families without Search Console, query-research or strong product evidence.
- Changes whose only purpose is to increase ad impressions rather than user value.
- Additional ads inside the active writing/editor control region.
- Changing the transliteration provider or its initialization contract.
- Accounts, cloud documents or server-side storage for the core writing workflow.
- AI translation/calligraphy features.
- Removing established routes because they appear visually redundant.
- Publishing founder identity, reviews, ratings, usage counts or `sameAs` profiles without verified public evidence.

---

## Feature-spec status

The detailed registry remains in `specs/README.md`. At backlog level:

- `WU-GROWTH-001` — **ready for evidence baseline; controls commercial prioritization.**
- `WU-CS-UX-001` — implemented; v2 migration pending.
- `WU-CS-UX-002` — implemented; v2 migration pending.
- `WU-SM-001` — implemented; v2 migration pending.
- `WU-IG-001` — implemented; v2 migration pending.
- `WU-IG-002` — implemented; v2 migration pending.
- `WU-IG-003` — implemented; v2 migration pending.
- `WU-PLAT-001` — implemented.
- `WU-SUA-001` — implementing; acceptance closure P0.

## Queue rule

When a PR merges, update this file in the next implementation branch or the same merge if the next priority is already known. There should always be exactly one clear evidence-backed **next implementation PR**.

**Current next strategic action:** complete `WU-GROWTH-001` by reviewing the full Search Console and comparable AdSense datasets.  
**Current low-risk implementation action while data is gathered:** finish V2-S3 authority migration/consolidation without creating new speculative routes.
