# WriteUrdu — Canonical Product & Spec Backlog

**Status:** Active  
**Last updated:** 2026-08-12  
**Purpose:** One source of truth for priority, sequence and product state.

This file owns **priority and sequence**. Individual feature specs own detailed behaviour and acceptance criteria. `specs/README.md` is the feature registry. `docs/WU-I001-IMPLEMENTATION-TRACKER.md` records v2 migration execution. Supporting SEO/audit documents provide evidence but do not own roadmap priority.

## Product reality

WriteUrdu is not a new-domain validation project. It is a 10+ year-old organic-search product with established credibility, existing query ownership and daily utility usage. The strategic problem is therefore **authority capture**, not basic trust creation.

The roadmap should answer:

1. How do we defend the Urdu typing/writing demand already earned?
2. How do we turn that authority into more useful search entry points without creating thin pages?
3. How do we create natural second-page/tool journeys that increase useful pageviews and AdSense value?
4. Which existing tools deserve deeper investment because they can become search destinations in their own right?
5. Which old or overlapping surfaces should be consolidated so authority is not diluted?

## Commercial objective

WriteUrdu remains an organic-search-led, Google AdSense-funded product.

`AdSense revenue ≈ monetizable pageviews × page RPM / 1000`

The best growth work therefore increases qualified organic entrances, CTR on existing impressions, repeat usage, useful second-page navigation, page depth into tools, and ad viewability without harming the task or Core Web Vitals.

Search Console and AdSense are the control plane for prioritization, but **missing perfect data must not freeze low-risk authority-compounding work**.

The detailed commercial execution plan is `docs/WU-SEO-ADSENSE-AUTHORITY-PLAN-2026-08-11.md`. The runtime/account monetization contract is `docs/WU-ADSENSE-OPERATING-CONTRACT.md`.

## Priority rules

1. Protect transliteration, existing ranking URLs, mobile usability and Core Web Vitals.
2. Treat existing domain authority as a scarce asset to compound, not merely defend.
3. Prefer expanding around proven Urdu-writing jobs over unrelated utility expansion.
4. Use Search Console + AdSense evidence to reorder opportunities whenever data is available.
5. Prefer strong destination pages/tools over many thin keyword variants.
6. Prefer improvements that create a useful second action: write → edit → create → export → learn.
7. Finish partially implemented feature contracts before inventing competing versions of the same job.
8. Keep active writing/creation surfaces ad-light; monetize around the task, not inside it.
9. Normalize and measure current ad placement before increasing site-wide ad load.
10. Preserve mature-domain URLs unless evidence supports consolidation.
11. Every implementation slice needs tests and a Cloudflare preview.

---

# NOW — P0

## P0.1 — Mature-domain growth baseline and authority/revenue map

**Type:** Growth control plane  
**Spec:** `specs/WU-GROWTH-001-search-adsense-growth-system.md`  
**Execution plan:** `docs/WU-SEO-ADSENSE-AUTHORITY-PLAN-2026-08-11.md`

### P0.1A — Growth Slice A: page-type AdSense architecture + measurement baseline

**Runtime status:** implemented and merged in PR #13 (`4c96615409a9463b4e85b40c749f7f1bb6e7eb32`), with the core Write-route monetization regression repaired in PR #15 (`2971a7e7c10a77ebac56128a0fa9c93c82305e95`).

- [x] Classify public routes into Write / Learn / Create / Trust monetization groups.
- [x] Replace one-size-fits-all serving with page-type-aware placement behavior.
- [x] Keep core Write pages ad-free unless an explicit post-workspace boundary exists.
- [x] Protect active tool/editor regions from guessed placement.
- [x] Preserve the existing AdSense client, shared slot and single-loader behavior.
- [x] Define stable internal placement names and document future custom-channel names.
- [x] Add a regression contract covering route classification and monetization invariants.
- [x] Remove the typing tutorial's legacy manual ad stack as part of V2-S3 source cleanup.
- [x] Restore one safe post-workspace unit to `/`, `/urdu-editor` and `/urdu-keyboard` after the July 11 cleanup regression.
- [ ] Create the documented custom/URL channels in the AdSense account and then add only real IDs where useful.
- [ ] Configure the documented Auto-ads page exclusions/excluded areas in AdSense.
- [ ] Capture a comparable post-restoration AdSense baseline by top pages, page RPM, country, platform/device and format/placement where available.

**Decision rule:** do not increase site-wide ad density until the account-side baseline/exclusions exist and the normalized placement has been observed. Do not interpret the July 12 discontinuity in AdSense pageviews as a traffic collapse without reconciling it against Search Console/site traffic evidence.

### P0.1B — Authority Opportunity Map

The repository and File Library currently contain only two detailed Search Console baselines (`urdu typing`, `urdu writing`) and no comparable URL-level AdSense earnings/RPM export. Do not fabricate the missing map.

When the exports are available:

- [ ] Analyze full Search Console Queries and Pages exports.
- [ ] Analyze Countries, Devices and trend/comparison data.
- [ ] Map important query clusters to ranking URLs.
- [ ] Identify positions 4–10, positions 11–20 and high-impression/weak-CTR opportunities.
- [ ] Identify cannibalization and duplicate-intent routes.
- [ ] Review comparable AdSense aggregate data: earnings, page RPM, pageviews/ad impressions, country, device, top page/page group and ad format.
- [ ] Join query → route → page type → observed/proxy RPM.
- [ ] Produce buckets: defend, near-win, CTR opportunity, expand, consolidate, observe, reject.
- [ ] Re-rank P0/P1 using organic upside × monetization potential × product usefulness × implementation risk.

Missing commercial exports do not block safe SEO/UX cleanup, intent ownership, internal linking or feature acceptance work.

## P0.2 — Close SEO-A1 production follow-up

**Type:** Growth / operational verification  
**Code status:** merged in PR #9 (`f9bce99ddd501bf294ca2f58766e69c307e59527`)

- [ ] Smoke-test homepage transliteration in production.
- [ ] Validate homepage and authority JSON-LD with Google Rich Results Test and Schema.org Validator.
- [ ] Request recrawl for `/`, `/urdu-editor`, `/urdu-keyboard`, `/write-urdu-documentation`, `/urdu-faq`, `/roman-urdu-transliteration`, `/urdu-alphabet`, `/urdu-fonts-nastaliq-vs-naskh`, `/english-urdu-typing-tutorial` and `/why-write-urdu`.
- [ ] Confirm `/llms.txt`, `/robots.txt`, `/sitemap.xml` and `/.well-known/security.txt` are publicly reachable.
- [ ] Start weekly tracking for `urdu typing` and `urdu writing` from the recorded baseline.

## P0.3 — V2-S3 authority migration and overlap decisions

**Status:** completed and merged in PR #14 (`dcea81d318a3c714767d91e2dfd30577074a0aa4`).

- [x] Migrate `/urdu-fonts-nastaliq-vs-naskh` to the shared v2 authority system.
- [x] Keep `/english-urdu-typing-tutorial` and narrow it to video/product walkthrough intent.
- [x] Keep broad Roman Urdu language mechanics on `/roman-urdu-transliteration` and broad typing intent on `/`.
- [x] Remove tutorial legacy frameworks, obsolete analytics/social SDKs, unused editor/export code and manual ad stack.
- [x] Keep `write-urdu-features` as the drafts/import/export/share operations reference.
- [x] Keep `urdu-editor-features` as the formatting reference.
- [x] Preserve all established canonical URLs; no redirect is justified by current evidence.
- [x] Update route registry, metadata ownership, sitemap freshness and authority tests.

## P0.4 — `WU-SUA-001` acceptance closure

**Type:** Product completion  
**Spec:** `WU-SUA-001`  
**Status:** completed in PR #17 acceptance slice; feature state is Implemented.

The feature was audited rather than redesigned. Acceptance found and closed real gaps while retaining the existing architecture.

- [x] Verify the 80-style catalogue is unique and behaves correctly across category/intensity filters; fix the Popular filter regression.
- [x] Verify favourites, collections and recent-input persistence/recovery and add the missing per-result Share action.
- [x] Verify Name Art template/preset coverage: 24 original templates across 12 packs and six exact output contracts.
- [x] Verify exact-size PNG/transparent PNG waits for fonts/assets; transparent-name output is 1600×900 and reuses the Card Studio renderer.
- [x] Verify accessibility, mobile layout, privacy copy and recoverable failures.
- [x] Add focused static/unit plus desktop/mobile browser acceptance coverage.
- [x] Change feature status to Implemented when the checklist is green.

**Guardrail:** later v2 shell migration for Stylish Text and Name Art is presentation/product-shell work; it does not reopen `WU-SUA-001` unless behaviour regresses.

## P0.5 — Authority distribution through internal product journeys

**Type:** Growth + product navigation  
**Status:** completed in PR #18.

Create deliberate, contextually useful paths between established writing demand and deeper tools.

- [x] Homepage/basic writing → Rich Editor / Keyboard when formatting or direct input is needed; existing source-visible paths remain under contract.
- [x] Core writing surfaces → Card Studio / Stylish Text / Name Art with a compact below-task panel and local current/selected-text handoff.
- [x] Roman Urdu guide → actual Roman Urdu typing action.
- [x] Urdu Alphabet / font guide / FAQ → relevant writing tools, not generic homepage-only links.
- [x] Creation tools → templates and adjacent creation tools, with source-visible links covered by regression tests.
- [x] Add lightweight privacy-safe measurement hooks: stable `data-wu-journey` IDs plus a local `write-urdu:journey` event containing source, destination and text-presence only. No network analytics sink is added until one is explicitly approved.

**Guardrail:** internal links must answer the user’s next likely task, not exist only to circulate pageviews. User text remains in short-lived `sessionStorage`, never the journey event or URL.

---

# NEXT — P1

## P1.1 — Defend and expand proven search demand

- [ ] Improve CTR on high-impression queries without destabilizing proven ranking URLs.
- [ ] Prioritize positions 4–10 first, then strong-relevance 11–20 queries.
- [ ] Resolve cannibalization from measured query/page evidence.
- [ ] Address device-specific CTR/UX gaps.
- [ ] Strengthen examples, FAQs and supporting links from actual query language.
- [ ] Protect high-traffic/high-RPM pages from unnecessary redesign churn.

Initial route owners to score first: homepage, Urdu Keyboard, Roman Urdu guide, Urdu Alphabet and Urdu font guide.

## P1.2 — Build topic clusters around real Urdu-writing jobs

Priority candidate clusters:

- Urdu typing online / Roman Urdu to Urdu / English-keyboard Urdu input.
- Urdu keyboard and alphabet/reference needs.
- Urdu fonts, Nastaliq vs Naskh and display guidance.
- Urdu writing in WhatsApp, Word and Google Docs.
- Urdu status/card/name creation.
- Urdu punctuation, numerals and RTL writing direction.

Each cluster must have one clear query owner and useful internal paths into the product. Choose one evidence-backed cluster and build 1–3 strong pages; do not launch a bulk blog/content program.

## P1.3 — Page-type AdSense experiments

Run controlled experiments only after the P0.1A account-side baseline and exclusions are configured.

Initial queue:

1. Learn pages — current `guide_after_answer` baseline versus a controlled alternative.
2. Learn pages — control versus desktop side rail where reading layout supports it.
3. Long Learn pages — control versus Multiplex at true content end.
4. Learn pages — control versus mobile bottom anchor.
5. Homepage — current safe post-workspace unit is the restored baseline; test alternatives only after post-restoration economics are measured.

**Hold initially:** vignettes and Ad intents.  
**Do not build around:** Related search for Auto ads; the format is discontinued.

Evaluate revenue together with task/navigation behavior and Core Web Vitals; do not auto-apply experiment winners until reviewed.

## P1.4 — V2 creation-workspace migration

### Card Studio + Templates
- [ ] Move Card Studio onto the v2 application hierarchy without changing renderer/export contracts.
- [ ] Make the workspace dominant and education/promo secondary.
- [ ] Migrate Templates into the same creation journey and strengthen handoff into Card Studio.

### Stylish Urdu Text + Name Art
- [ ] Apply the v2 creation shell now that `WU-SUA-001` acceptance is closed.
- [ ] Preserve copy/favourite/collection/share/handoff/template/preset/export behavior and the focused acceptance suite.

### Social makers + QR
- [ ] Migrate WhatsApp Status Maker and Instagram Post Maker.
- [ ] Migrate QR Generator.
- [ ] Preserve local processing, safe-area logic, payload validation and export contracts.

For all Create routes, ads stay outside the active workspace/result/action region.

## P1.5 — Decide which creation tools deserve search investment

Score each by existing impressions/clicks, realistic search demand, usefulness/differentiation, repeat-use/session-depth potential, contextual handoffs, maintenance cost and observed/proxy RPM.

Winners get stronger landing content, examples, valid schema and supporting content. Losers remain useful tools without forced SEO expansion.

## P1.6 — Evaluate Urdu typing practice/test as a distinct product candidate

- [ ] Check Search Console for typing practice/test/WPM/exam-related impressions.
- [ ] Do external query research before writing a spec.
- [ ] If justified, create a distinct typing-practice feature contract rather than adding test mechanics to the core editor.
- [ ] Keep in HOLD if demand or product fit is weak.

## P1.7 — Invoice strategy decision

**Specs:** `WU-IG-001/002/003`

- [ ] Preserve the existing invoice generator while evidence is gathered.
- [ ] Measure whether it contributes organic entrances, useful second-page activity or cross-product value.
- [ ] Keep WriteUrdu-specific Urdu invoice value distinct from InvoiceCraftly rather than duplicating a generic invoice product.
- [ ] Migrate to v2 only if the route remains strategically justified.

---

# LATER — P2

## P2.1 — V2 release closure

- [ ] Complete extensionless internal-link migration across remaining public pages.
- [ ] Migrate About, Privacy, Feedback, Search and human sitemap where needed.
- [ ] Validate all registered canonicals, sitemap entries and redirects.
- [ ] Publish v2 release notes.
- [ ] Capture post-release Search Console and AdSense baselines.

## P2.2 — Asset/code/performance cleanup

- [ ] Build HTML/CSS/JS asset-reference report.
- [ ] Identify zero-reference images/documents.
- [ ] Identify obsolete CSS and JavaScript.
- [ ] Remove only confirmed unused assets/dependencies.
- [ ] Audit legacy Bootstrap/jQuery/social dependencies after v2 migration.
- [ ] Measure whether ads/scripts contribute to LCP/CLS/INP regressions on high-traffic pages.
- [ ] Confirm production artifact contains only required files.

## P2.3 — Answer-ready content backlog

Evidence-gated candidates from `docs/SEO-CONTENT-BACKLOG.md`:

- [ ] Common Roman Urdu phrases with reviewed Urdu examples.
- [ ] Urdu in WhatsApp, Microsoft Word and Google Docs.
- [ ] Urdu WhatsApp Status / poetry-card creation.
- [ ] Static QR mechanics and quiet-zone guidance.
- [ ] Browser compatibility for writing/creation tools.
- [ ] Local-draft/image-upload/QR-logo privacy guidance.
- [ ] Urdu punctuation, numerals and RTL direction.

---

# HOLD / do not distract the roadmap

- Separate doorway pages for near-identical `urdu typing` / `urdu writing` variants.
- Generic new tools unrelated to Urdu writing/creation without strong evidence.
- Ads inside the active writing/editor/control/result region.
- Site-wide maximum Auto ads load without page-type rules and experiments.
- Vignette ads as a default core-editor transition.
- Ad intents on core writing pages before page-level economics and UX are understood.
- Related search for Auto ads.
- Changing the transliteration provider or initialization contract without a compelling reason.
- Accounts/cloud documents/server-side storage for the core writing workflow without demonstrated user demand.
- AI translation/calligraphy features as a novelty project.
- Removing established URLs because they look visually old or redundant without query/route evidence.
- Publishing founder identity, reviews, ratings, usage counts or `sameAs` profiles without verified public evidence.

---

# Feature-spec reconciliation

| ID | Groomed state | Roadmap treatment |
| --- | --- | --- |
| `WU-GROWTH-001` | Active | P0 commercial control plane; runtime AdSense normalization/restoration shipped, Authority Map awaits detailed exports |
| `WU-PLAT-001` | Implemented | Foundation complete; maintain contracts |
| `WU-CS-UX-001` | Implemented core | v2 migration P1 |
| `WU-CS-UX-002` | Implemented core | v2 migration P1 |
| `WU-SM-001` | Implemented core | v2 migration P1 |
| `WU-SUA-001` | Implemented | Acceptance closed; v2 creation-shell migration is later presentation work |
| `WU-IG-001` | Implemented | Strategic evidence review before v2 migration |
| `WU-IG-002` | Implemented | Same invoice decision |
| `WU-IG-003` | Implemented | Same invoice decision |
| `WU-SEO-001` | Superseded | Requirements absorbed by `WU-PLAT-001`, SEO-A1 and `WU-GROWTH-001` |

## Grooming rules going forward

- A spec may be **Implemented**, **Implemented core / acceptance pending**, **Active**, **Planned**, **Hold** or **Superseded**.
- “Implemented but v2 migration pending” is a migration state, not an unfinished feature state.
- When work is absorbed by a later umbrella spec, mark it Superseded instead of leaving it Planned forever.
- Every merged implementation PR updates its spec status, `specs/README.md`, and this backlog when priority/state changes.
- New ideas enter HOLD first unless they displace an existing item using evidence.

## Current queue

**Current branch/PR lane:** merge PR #18 after final quality gates; this closes the remaining P0 product-navigation slice.  
**Next product implementation:** P1.4 creation-workspace v2 migration, beginning with Card Studio + Templates while preserving their renderer/export contracts.  
**Parallel operational follow-up:** P0.2 production SEO validation/recrawl and post-restoration AdSense observation.  
**Evidence-gated growth work:** P1.1/P1.2 and the full Authority Opportunity Map move as soon as detailed Search Console + AdSense exports are available.
