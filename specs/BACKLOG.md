# WriteUrdu — Canonical Product & Spec Backlog

**Status:** Active  
**Last updated:** 2026-08-11  
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

The best growth work therefore increases one or more of:

- qualified organic entrances,
- CTR on existing impressions,
- repeat usage,
- useful second-page navigation,
- page depth into creation/tools,
- performance and ad viewability without harming the task,
- durable query ownership around Urdu writing jobs.

Search Console and AdSense are the control plane for prioritization, but **missing perfect data must not freeze low-risk authority-compounding work**.

The active detailed execution plan is `docs/WU-SEO-ADSENSE-AUTHORITY-PLAN-2026-08-11.md`. It supports this backlog; it does not replace it.

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
10. Consolidate duplicate roadmap/spec documents instead of creating new competing sources of truth.
11. Every implementation slice needs tests and a Cloudflare preview.

---

# NOW — P0

## P0.1 — Mature-domain growth baseline and authority/revenue map

**Type:** Growth control plane  
**Spec:** `specs/WU-GROWTH-001-search-adsense-growth-system.md`  
**Execution plan:** `docs/WU-SEO-ADSENSE-AUTHORITY-PLAN-2026-08-11.md`

Complete the evidence baseline, but use it to **rank authority-harvesting work**, not as a stop-ship gate for all development.

### P0.1A — Growth Slice A: page-type AdSense architecture + measurement baseline

Repository inspection found a universal shared ad immediately after the header on most content pages while some legacy pages still contain their own manual units. Normalize this before adding inventory.

- [ ] Classify public routes into Write / Learn / Create / Trust monetization groups.
- [ ] Replace the universal content-page post-header ad rule with page-type-aware placement hooks.
- [ ] Protect editor/canvas/action regions from in-page ad insertion.
- [ ] Remove duplicate legacy manual units as pages migrate, beginning with the typing tutorial during its V2-S3 decision.
- [ ] Preserve the existing AdSense client and single-loader behaviour.
- [ ] Define URL-channel and custom-channel naming for strategic routes/placements.
- [ ] Capture a pre-change AdSense baseline by top pages, page RPM, country, platform/device, ad format and placement method where available.
- [ ] Add regression coverage for prohibited ad adjacency around primary editor/export/template actions where feasible.

**Why this is first:** current placement inconsistency makes RPM harder to interpret and can create unnecessary UX/page-experience risk. Cleaning it improves both measurement quality and monetization safety.

### P0.1B — Authority Opportunity Map

- [ ] Analyze full Search Console Queries export.
- [ ] Analyze Pages export.
- [ ] Analyze Countries, Devices and trend/comparison data.
- [ ] Map important query clusters to ranking URLs.
- [ ] Identify positions 4–10 with material impressions.
- [ ] Identify positions 11–20 where relevance is already strong.
- [ ] Identify high-impression / weak-CTR pages.
- [ ] Identify cannibalization and duplicate-intent routes.
- [ ] Review comparable AdSense aggregate data: earnings, page RPM, pageviews/ad impressions, country, device, top page/page group and ad format where available.
- [ ] Join query → route → page type → observed/proxy RPM.
- [ ] Produce an **Authority Opportunity Map** with buckets: defend, near-win, CTR opportunity, expand, consolidate, observe, reject.
- [ ] Re-rank P0/P1 using organic upside × monetization potential × product usefulness × implementation risk.

**Decision rule:** lack of AdSense granularity does not block obvious SEO safety, status reconciliation, internal linking, useful tool completion or v2 consistency work.

## P0.2 — Close SEO-A1 production follow-up

**Type:** Growth / operational verification  
**Code status:** merged in PR #9 (`f9bce99ddd501bf294ca2f58766e69c307e59527`)

- [ ] Smoke-test homepage transliteration in production.
- [ ] Validate homepage and authority JSON-LD with Google Rich Results Test and Schema.org Validator.
- [ ] Request recrawl for `/`, `/urdu-editor`, `/urdu-keyboard`, `/write-urdu-documentation`, `/urdu-faq`, `/roman-urdu-transliteration`, `/urdu-alphabet` and `/why-write-urdu`.
- [ ] Confirm `/llms.txt`, `/robots.txt`, `/sitemap.xml` and `/.well-known/security.txt` are publicly reachable.
- [ ] Start weekly tracking for `urdu typing` and `urdu writing` from the recorded baseline.

**Why P0:** this verifies that the authority improvements already shipped are crawlable and measurable.

## P0.3 — Finish V2-S3 authority migration and overlap decisions

**Type:** Product/UX + SEO safety

- [ ] Migrate `/urdu-fonts-nastaliq-vs-naskh` to the shared v2 authority system.
- [ ] Review `/english-urdu-typing-tutorial` against `/`, Documentation and the Roman Urdu guide.
- [ ] Decide keep, narrow, merge or redirect using route/query evidence.
- [ ] Review `write-urdu-features` and `urdu-editor-features` for the same duplication problem.
- [ ] For consolidation, preserve one-hop redirects and update sitemap, structured data and internal links in the same PR.
- [ ] Apply the new Learn-page monetization placement rules during migration rather than preserving legacy duplicate ad units.

**Why P0:** old-domain authority is harmed more by scattered overlapping intent than by a shortage of pages. This work also removes legacy monetization inconsistency from high-content surfaces.

## P0.4 — Close `WU-SUA-001` acceptance, do not re-build it

**Type:** Product completion  
**Spec:** `WU-SUA-001`

Repository inspection shows substantial implementation already exists: both routes, an 80-style deterministic catalogue, Urdu-safe normalization/grapheme handling, conservative Kashida logic, local storage contracts and Name Art handoff code are present. The remaining task is **acceptance closure**, not another redesign.

- [ ] Verify the 80-style catalogue is unique and behaves correctly across category/intensity filters.
- [ ] Verify favourites, collections and recent-input persistence/recovery.
- [ ] Verify Name Art template/preset coverage against the spec.
- [ ] Verify exact-size PNG/transparent PNG waits for fonts/assets.
- [ ] Verify accessibility, mobile layout, privacy copy and recoverable failures.
- [ ] Add only missing browser/integration coverage.
- [ ] Change feature status to Implemented when the checklist is green.

## P0.5 — Authority distribution through internal product journeys

**Type:** Growth + product navigation

Create deliberate, contextually useful paths between established writing demand and deeper tools.

- [ ] Homepage/basic writing → Rich Editor / Keyboard when formatting or direct input is needed.
- [ ] Writing surfaces → Card Studio / Stylish Text / Name Art when visual output is the next job.
- [ ] Roman Urdu guide → actual Roman Urdu typing action.
- [ ] Urdu Alphabet / font guide / FAQ → relevant writing tools, not generic homepage-only links.
- [ ] Creation tools → templates and adjacent creation tools.
- [ ] Add lightweight measurement for high-value handoffs where existing analytics supports it.

**Guardrail:** internal links must answer the user’s next likely task, not exist only to circulate pageviews.

---

# NEXT — P1

## P1.1 — Defend and expand proven search demand

Permanent growth lane:

- [ ] Improve CTR on high-impression queries without destabilizing proven ranking URLs.
- [ ] Prioritize positions 4–10 first, then strong-relevance 11–20 queries.
- [ ] Resolve cannibalization.
- [ ] Address device-specific CTR/UX gaps.
- [ ] Strengthen examples, FAQs and supporting links from actual query language.
- [ ] Protect high-traffic/high-RPM pages from unnecessary redesign churn.

Initial route owners to score first: homepage, Urdu Keyboard, Roman Urdu guide, Urdu Alphabet and Urdu font guide.

## P1.2 — Build topic clusters around real Urdu-writing jobs

Promote candidates only when they can be strong standalone resources or tools.

Priority candidate clusters:

- Urdu typing online / Roman Urdu to Urdu / English-keyboard Urdu input.
- Urdu keyboard and alphabet/reference needs.
- Urdu fonts, Nastaliq vs Naskh and display guidance.
- Urdu writing in WhatsApp, Word and Google Docs.
- Urdu status/card/name creation.
- Urdu punctuation, numerals and RTL writing direction.

Each cluster must have one clear query owner and useful internal paths into the product.

**First new-content rule:** choose one evidence-backed cluster and build 1–3 strong pages; do not launch a bulk blog/content program.

## P1.3 — Page-type AdSense experiments

Run controlled experiments only after P0.1A normalizes placement.

Initial queue:

1. Learn pages — shared post-header unit vs first unit after answer/first useful section.
2. Learn pages — control vs desktop side rail.
3. Long Learn pages — control vs Multiplex at true content end.
4. Learn pages — control vs mobile bottom anchor.
5. Homepage — no in-task ad; test one responsive unit after the primary workspace/support boundary.

**Hold initially:** vignettes and Ad intents.  
**Do not build around:** Related search for Auto ads; Google discontinued the format on 2026-08-06.

Evaluate revenue together with task/navigation behaviour and Core Web Vitals; do not auto-apply experiment winners until reviewed.

## P1.4 — V2 creation-workspace migration

### Card Studio + Templates
- [ ] Move Card Studio onto the v2 application hierarchy without changing renderer/export contracts.
- [ ] Make the workspace dominant and education/promo secondary.
- [ ] Migrate Templates into the same creation journey and strengthen handoff into Card Studio.

### Stylish Urdu Text + Name Art
- [ ] Apply the v2 creation shell **after** `WU-SUA-001` acceptance closure.
- [ ] Preserve copy/favourite/handoff/export behaviour.

### Social makers + QR
- [ ] Migrate WhatsApp Status Maker and Instagram Post Maker.
- [ ] Migrate QR Generator.
- [ ] Preserve local processing, safe-area logic, payload validation and export contracts.

For all Create routes, ads stay outside the active workspace/result/action region.

## P1.5 — Decide which creation tools deserve search investment

Do not give every tool equal SEO effort. Score each by:

- existing impressions/clicks,
- realistic search demand,
- usefulness and differentiation,
- repeat-use/session-depth potential,
- ability to support contextual internal journeys,
- maintenance cost,
- observed/proxy RPM and page-type monetization fit.

Winners get stronger landing content, examples, schema where valid, and supporting content. Losers remain useful tools without forced SEO expansion.

## P1.6 — Evaluate Urdu typing practice/test as a distinct product candidate

Current qualitative SERP research shows typing-practice/test products targeting a different job from transliteration/editor use.

- [ ] Check Search Console for typing practice/test/WPM/exam-related impressions.
- [ ] Do external query research before writing a spec.
- [ ] If justified, create a distinct typing-practice feature contract rather than adding test mechanics to the core editor.
- [ ] Keep in HOLD if demand is weak or product fit is unclear.

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

Candidates from `docs/SEO-CONTENT-BACKLOG.md` remain evidence-gated:

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
- Related search for Auto ads; the format has been discontinued.
- Changing the transliteration provider or initialization contract without a compelling reason.
- Accounts/cloud documents/server-side storage for the core writing workflow without demonstrated user demand.
- AI translation/calligraphy features as a novelty project.
- Removing established URLs because they look visually old or redundant without query/route evidence.
- Publishing founder identity, reviews, ratings, usage counts or `sameAs` profiles without verified public evidence.

---

# Feature-spec reconciliation

| ID | Groomed state | Roadmap treatment |
| --- | --- | --- |
| `WU-GROWTH-001` | Active | P0 commercial control plane; Growth Slice A + Authority Map now executing |
| `WU-PLAT-001` | Implemented | Foundation complete; maintain contracts |
| `WU-CS-UX-001` | Implemented core | v2 migration P1 |
| `WU-CS-UX-002` | Implemented core | v2 migration P1 |
| `WU-SM-001` | Implemented core | v2 migration P1 |
| `WU-SUA-001` | Implemented core / acceptance pending | P0 acceptance closure, then v2 migration |
| `WU-IG-001` | Implemented | Strategic evidence review before v2 migration |
| `WU-IG-002` | Implemented | Same invoice decision |
| `WU-IG-003` | Implemented | Same invoice decision |
| `WU-SEO-001` | Superseded | Requirements absorbed by `WU-PLAT-001`, SEO-A1 and the canonical growth backlog; no standalone implementation lane |

## Grooming rules going forward

- A spec may be **Implemented**, **Implemented core / acceptance pending**, **Active**, **Planned**, **Hold** or **Superseded**.
- “Implemented but v2 migration pending” is a migration state, not an unfinished feature state.
- When work is absorbed by a later umbrella spec, mark it Superseded instead of leaving it Planned forever.
- Every merged implementation PR updates its spec status, `specs/README.md`, and this backlog when priority/state changes.
- New ideas enter HOLD first unless they displace an existing item using evidence.

## Current queue

**Next implementation PR:** `GROWTH-A1` — page-type AdSense architecture + measurement baseline.  
**Parallel SEO/product PR:** finish V2-S3 authority migration + overlap decisions, applying the new Learn-page monetization rules instead of preserving legacy ad stacks.  
**Parallel product-quality lane:** close `WU-SUA-001` acceptance gaps without redesigning the feature.  
**Next strategic analysis:** complete the Search Console + AdSense Authority Opportunity Map and use it to select the first existing-route SEO wins and first evidence-backed content cluster.
