# WriteUrdu — Canonical Active Backlog

**Status:** Active  
**Last reconciled against code + Product Pulse/GSC evidence:** 2026-09-13
**Purpose:** One source of truth for work that is still genuinely open.

The previous long-form backlog is preserved at [`archive/snapshots/BACKLOG-2026-08-30-pre-reconciliation.md`](archive/snapshots/BACKLOG-2026-08-30-pre-reconciliation.md). Completed implementation contracts remain in [`archive/`](archive/README.md).

## Governance

1. Runtime code + regression tests are authoritative for shipped behaviour.
2. This backlog contains only work with a real remaining decision, acceptance gate or implementation slice.
3. `specs/README.md` is the current contract registry.
4. Protect established English-letter → Urdu behavior, ranking URLs, mobile usability and Core Web Vitals.
5. Search Console + AdSense + Product Pulse evidence may reorder growth work; feature enthusiasm does not outrank measured user behavior.
6. Keep active writing/creation surfaces ad-light; monetize around the task, not inside it.
7. **`WU-PLAT-002H` is the current P0 product/UX roadmap gate. Do not start another major unrelated feature until its first-value, reopened mobile-editor acceptance, continuation, CTA-arbitration and referral-continuity gates are materially underway and the backlog is re-reviewed from post-change evidence.**
8. Security, legal, production reliability and external acceptance work are not blocked by that scope freeze.

---

# NOW — P0

## P0.1 — Core Activation & Feature Discovery

**Spec:** [`WU-PLAT-002H`](WU-PLAT-002H-core-activation-feature-discovery.md)  
**State:** Active — founder-priority roadmap gate.  
**Evidence:** [`docs/WU-CORE-ACTIVATION-EVIDENCE-2026-08-30.md`](../docs/WU-CORE-ACTIVATION-EVIDENCE-2026-08-30.md) + [`docs/WU-MOBILE-ACTIVATION-EVIDENCE-2026-09-03.md`](../docs/WU-MOBILE-ACTIVATION-EVIDENCE-2026-09-03.md)

Why it is first:

- 1,000 measured zero-character writing-summary sessions require first-value diagnosis rather than assumption;
- Basic/Rich/Voice/Stylish represent about 92.7% of measured product visits;
- Rich Editor engagement is 85.1% and should be the natural substantial-writing escalation;
- Voice adoption is strong in Rich (20.5%) but extremely low in Basic (~0.2%), suggesting discovery/input-choice friction;
- PDF + Word are 82.9% of exports and should be promoted after value rather than as a pre-value command wall;
- Share loop currently shows 8 reader CTA clicks → 0 referred starts, pointing to post-click continuity/telemetry;
- Card Studio activates users (40 canvas edits) but only 3 exports, so acquisition expansion must wait for completion diagnosis;
- direct user feedback on 2026-09-03 says mobile visitors can struggle to spot the editing area;
- the 2026-09-04 GSC export shows mobile is **67.3% of search impressions (148,783 impressions)**, mobile average position is stronger than desktop (6.43 vs 8.66), and the export predates the Gate B2 implementation;
- latest-14-day impressions are **+60.0%** vs the preceding 14 days, increasing the value of fixing activation before broadening acquisition.

Execution gates:

### P0.1A — First-value measurement

- [x] Validate `writer eligible/visible → focus → first input → first successful Urdu → depth → first outcome`.
- [x] Split at minimum by mobile/desktop, workspace and input mode.
- [x] Distinguish true pre-input loss from non-writing intent/telemetry classification; do not call every zero-char visit abandonment.
- [x] Add continuation and Share-referral destination-ready/meaningful-start measurement.
- [x] Add/validate Card Studio completion funnel.
- [x] Fix misleading dashboard `rate` labels that can exceed 100% because repeated events are used as numerators.

### P0.1B — Basic Writer E0/E1 simplification

**Owner:** revised [`WU-PLAT-004`](WU-PLAT-004-basic-writer-command-toolbar.md)

- [x] Empty state is dominated by simple input choices + writer, not a disabled Share/export command wall.
- [x] Preserve intent language: `English to Urdu Typing`, simple conversion example, no technical acquisition jargon.
- [x] Present `English letters → Urdu`, `Type Urdu directly`, and `Speak Urdu` coherently.
- [x] Reveal Copy/Continue after useful text without interrupting first success.
- [x] Retire duplicate/superseded Basic action UI rather than layering another toolbar.
- [x] Mobile first screen keeps input choice + writer primary.

**Historical note:** this broad simplification shipped. Its mobile acceptance is no longer considered sufficient because fresh direct user feedback reports that the editor remains hard to spot on mobile. The P0.1B2 gate below reopened mobile acceptance without undoing the shipped command-surface work.

### P0.1B2 — Mobile editor visibility & keyboard repair

**Owner:** [`WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md`](WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md)  
**Acceptance:** [`WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md`](WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md)  
**Evidence:** [`docs/WU-MOBILE-ACTIVATION-EVIDENCE-2026-09-03.md`](../docs/WU-MOBILE-ACTIVATION-EVIDENCE-2026-09-03.md)

**State:** M2 Basic Writer first-viewport implementation shipped 2026-09-03; M3 focus/keyboard + M4 Rich Editor hierarchy shipped 2026-09-04. Remaining work is evidence closeout, real-device/manual validation and `/urdu-keyboard` audit — not another speculative redesign.

- [ ] Reconcile a comparable mobile **Product Pulse first-value** baseline around the release. The 2026-09-04 GSC export is a pre-repair acquisition baseline, not an activation substitute. Blocking gap fixed 2026-09-04 (`9c50e85`): `product_hourly_device_metrics` rollup ships mobile-tagged `writer_first_input`/`writer_eligible` counters; deployed same day, data collection started at deploy. Item stays open until post-deploy mobile volume is enough to reconcile (see P0.1G 7-day window).
- [x] Audit actual DOM/runtime-injected content before the editable surface on `/` and `/urdu-editor` during M2–M4 implementation.
- [ ] Reconcile retained baseline screenshots at 360x800, 375x667, 390x844 and 412x915 where evidence is incomplete.
- [x] On `/`, expose the real writer in the initial visual viewport without requiring scroll or panel discovery.
- [x] Enforce the mobile acceptance floors: >=160 CSS px usable editor at 375x667 and >=220 CSS px on required >=800px-tall viewports.
- [x] Demote/move promotional, duplicate hero/action, export/help or other UI that displaced first value on the repaired routes.
- [x] Keep English-letter, direct-Urdu and Voice choices compact; Voice reuses the unified Voice platform.
- [x] Do not autofocus on load merely to improve activation metrics.
- [x] Ship mobile focus/visual-viewport resilience without forced-scroll loops.
- [x] Make the editor visually unmistakable without a broad rebrand.
- [x] Apply equivalent first-action hierarchy to `/urdu-editor` while preserving TinyMCE, exports, handoff and draft protection.
- [x] Audit `/urdu-keyboard`; fix only reproduced violations.
- [x] Preserve `eligible → visible → focus → first input → first Urdu → first outcome` instrumentation by route/device; verify release-marker comparability for closeout.
- [ ] Verify bounded time-to-first-input measurement or add it if no equivalent aggregate exists.
- [ ] Complete real-device/manual iOS Safari and Android Chrome closeout where available.
- [ ] Hold a stable post-change measurement window after 2026-09-04 and record Keep / Iterate / Rollback.

**Measurement discipline:** mobile Search CTR (2.66% in the pre-repair export) and the `english to urdu typing` CTR opportunity are acquisition evidence owned with `WU-SEO-CTR-001`. They do not prove landing-page UX causality. Gate B2 closes on Product Pulse first-value activation + viewport/manual acceptance + guardrails.

**Gate rule:** do not intensify major homepage/SERP acquisition experiments until the shipped mobile writer entry experience has a stable post-change review. Do not churn M2–M4 from pre-release GSC numbers.

### P0.1C — Contextual continuation

- [x] Maximum three visible continuation actions.
- [x] Promote Basic → Rich for substantial writing with safe state transfer.
- [x] Promote PDF/Word for substantial writing based on observed output usage.
- [x] Measure recommendation → click → destination ready → meaningful start, not click alone.
- [x] No private text inspection for recommendation logic.

### P0.1D — Growth CTA arbitration

**Related:** `WU-GROWTH-002`, `WU-COMMUNITY-001`, `WU-SHARE-001`

- [ ] One growth request at a time: Keep vs Share vs Publish.
- [ ] Substantial unsaved writing normally prioritizes `Keep this writing`.
- [ ] Normal task commands remain available without signup.
- [ ] Signed-in users never see account-acquisition copy.
- [ ] Distinguish `Share link` from `Publish to Urdu Writers`.
- [ ] Community publishing appears only when eligible/appropriate and not stacked with a higher-priority request.

### P0.1E — Share/referral continuity

- [ ] Trace reader CTA → destination response → referral/handoff recognized → workspace ready → first creation input → meaningful start.
- [ ] Verify `Use this text` restores public text where promised without putting content in URL.
- [ ] Verify `Create your own` opens the correct ready workspace.
- [ ] Do not increase CTA prominence merely because referred starts are zero; current tiny sample already shows high CTA click-through.

### P0.1F — Card Studio completion

- [ ] Instrument visit → role/preset → content → canvas edit → export attempt → export complete.
- [ ] Diagnose the drop before redesigning.
- [ ] If complexity is implicated, test an outcome-first Quick path (`what are you making? → text → preset → preview → Download`).
- [ ] Keep Advanced capability available.
- [ ] **No major Card Studio acquisition expansion before this gate.**

### P0.1G — Post-change review

- [ ] Capture at least a 7-day comparison where volume supports it; use longer windows for low-volume Card/community flows.
- [ ] Include the reopened mobile first-value/viewport release marker in the review.
- [ ] Record keep / iterate / rollback decisions.
- [ ] Reorder this backlog from Product Pulse + GSC + current AdSense evidence before ending the feature-breadth freeze.

Supporting contracts:

- [`WU-PLAT-002H-IMPLEMENTATION-CHECKLIST.md`](WU-PLAT-002H-IMPLEMENTATION-CHECKLIST.md)
- [`WU-PLAT-002H-METRICS-CONTRACT.md`](WU-PLAT-002H-METRICS-CONTRACT.md)
- [`WU-PLAT-002H-UX-STATE-MATRIX.md`](WU-PLAT-002H-UX-STATE-MATRIX.md)
- [`WU-PLAT-002H-ACCEPTANCE-SCENARIOS.md`](WU-PLAT-002H-ACCEPTANCE-SCENARIOS.md)
- [`WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md`](WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md)
- [`WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md`](WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md)
- [`WU-PLAT-002H-SCOPE-FREEZE.md`](WU-PLAT-002H-SCOPE-FREEZE.md)

## P0.2 — Mature-domain growth baseline and authority/revenue map

**Spec:** [`WU-GROWTH-001`](WU-GROWTH-001-search-adsense-growth-system.md)  
**State:** Active commercial control plane; runs in parallel with P0.1 because the founder target is $5/day AdSense.

- [ ] Create useful AdSense URL/custom channels.
- [ ] Configure Auto-ads page exclusions/excluded areas around active workspaces.
- [ ] Capture a comparable current post-restoration baseline by earnings/page RPM/pageviews/country/device/format where available.
- [ ] Finish the full GSC query/page/country/device opportunity map using the current exports.
- [ ] Join query → route → page type → observed/proxy RPM.
- [ ] Calculate required monetizable pageviews/day for $5/day from **observed** RPM, not an assumed RPM.
- [ ] Re-rank defend / near-win / CTR / expand / consolidate / observe / reject opportunities.

Commercial guardrail: an ad experiment is not a win if task completion, accidental-click safety, mobile UX or CWV materially worsens.

## P0.3 — Production SEO verification

- [ ] Smoke-test homepage English-letter-to-Urdu typing in production.
- [ ] Validate important JSON-LD.
- [ ] Confirm `/llms.txt`, `/robots.txt`, `/sitemap.xml` and `/.well-known/security.txt` are reachable.
- [ ] Request recrawl for established authority routes after meaningful changes.
- [ ] Complete production source-view spot checks.
- [ ] Coordinate mobile first-screen changes with `WU-SEO-CTR-001`; do not repeatedly rewrite metadata while experiments are unmeasured.

## P0.4 — Community staged-launch acceptance

**Spec:** [`WU-COMMUNITY-001`](WU-COMMUNITY-001-moderated-urdu-writing-publishing.md)  
**State:** A–F shipped; public discovery is live as of 2026-08-30.

Human/product gates:

- [ ] Review Community Guidelines / Terms wording before broad promotion.
- [ ] Decide eventual ad-density policy for community reading pages.
- [ ] Verify production rollback flags/toggles.
- [ ] Coordinate writer-prompt timing with P0.1D; do not add independent competing publish banners.

## P0.5 — Voice platform acceptance closeout

**Specs:** `WU-VOICE-PLAT-001`, `WU-VOICE-PLAT-001D`, `WU-GROWTH-003`

- [ ] Preserve the shipped unified Voice engine; Basic Writer activation must reuse it.
- [ ] Complete short-form demonstration assets only when scheduled.
- [ ] Keep dedicated keyword expansion under Search Console evidence gates.
- [ ] Under P0.1, improve discovery/measurement and understand Voice failures before broad promotion.

## P0.7 — InPage↔Unicode Developer API & npm package (founder-directed P0.1-freeze exception)

**Specs:** [`WU-API-001`](WU-API-001-inpage-unicode-developer-api.md), [`WU-API-001A`](../docs/WU-API-001A-INPAGE-UNICODE-NPM-BETA-IMPLEMENTATION-PLAN-2026-09-06.md)
**Skill:** `.claude/skills/wu-inpage-unicode-api/SKILL.md`
**State:** Planned; explicitly approved 2026-09-06 as an exception to rule 7 because it is additive-only against the already-shipped `WU-TOOLS-EXPANSION-005` engine, has negligible compute cost, and does not touch any `WU-PLAT-002H`-owned file or surface.

- [ ] Phase A — publish `@write-urdu/inpage-unicode` npm package (no server, no cost).
- [ ] Phase B — ship beta API route (`/api/v1/inpage-unicode/convert`) behind a single shared secret.
- [ ] Add cross-sell link on the existing `/tools/inpage-unicode-converter/` page only.
- [ ] Hold real API keys/quota/billing/docs-portal work until Phase A/B show real external usage.

**Guardrail:** if implementation ever requires touching a Basic/Rich Editor, mobile-activation, or telemetry file, stop — the isolation assumption behind this exception has broken and the work must be re-filed under normal backlog review.

## P0.8 — Pakistan Everyday Billing Toolkit Slice 1 (founder-directed P0.1-freeze exception)

**Spec:** [`WU-BILL-001`](WU-BILL-001-pakistan-everyday-billing-toolkit.md)
**Architecture:** [`WU-BILL-001-ARCHITECTURE-CONTRACT.md`](WU-BILL-001-ARCHITECTURE-CONTRACT.md)
**Execution:** [`WU-BILL-001-IMPLEMENTATION-CHECKLIST.md`](WU-BILL-001-IMPLEMENTATION-CHECKLIST.md)
**State:** Slice 0 shipped 2026-09-12 (`fa248a9`, #180). Slice 1 explicitly approved 2026-09-12 as an exception to rule 7: it builds an isolated `/urdu-bill-generator` route reusing no `WU-PLAT-002H`-owned file and does not touch `/urdu-invoice-generator` or any protected invoice file. Founder-directed release-gate exception recorded 2026-09-12: nav-link and public promotion approved ahead of P0.1 gate close, on the same isolation basis as the rest of this exception (no `WU-PLAT-002H`-owned file touched to add the link; Tools nav group item and sitemap/registry entries only).

- [x] Slice 1 — standalone `/urdu-bill-generator` route, Bill mode only, local preview, print/PDF output, content-free telemetry (see implementation checklist Slice 1).
- [x] Public promotion/nav link approved 2026-09-12 as a separate release-gate exception (see State above): added to the Tools nav group (`js/outcome-navigation.js`), `sitemap.xml`, `write-urdu-sitemap.html`, `llms.txt`, `docs/WU-PUBLIC-PAGE-REGISTRY.csv` and `changelog.html`; `seo.config.js` flipped to `indexable: true`.
- [ ] Invoice regression tests must remain green; no protected invoice file may change.

**Guardrail:** if implementation ever requires touching a Basic/Rich Editor, mobile-activation, invoice-protected, or telemetry-allowlist file beyond an additive route registration, stop — the isolation assumption behind this exception has broken and the work must be re-filed under normal backlog review.

## P0.9 — Card design family indexing and cross-linking (founder-directed P0.1-freeze exception)

**Specs:** [`WU-CARD-GALLERY-001`](WU-CARD-GALLERY-001-live-urdu-card-gallery.md), [`WU-CARD-GALLERY-001-ARCHITECTURE-CONTRACT.md`](WU-CARD-GALLERY-001-ARCHITECTURE-CONTRACT.md)
**Skill:** `skills/wu-card-gallery-001/SKILL.md`
**State:** Founder-directed exception recorded 2026-09-13 to the P0.1F Card Studio completion gate: `/urdu-card-studio`, `/urdu-card-gallery` and `/urdu-cards` become indexable and cross-linked ahead of the P0.1F diagnosis, on the basis that each page owns a distinct, non-cannibalizing intent:

- `/urdu-card-studio` — full editor / primary creation acquisition owner (unchanged, already indexed, `priority: .92`).
- `/urdu-card-gallery` — "compare your own Urdu text live across many designs" (distinct from the editor; no text input exists on Card Studio's landing intent).
- `/urdu-cards` — "browse ready-made/pre-written Urdu cards" (distinct from both; no live typing, curated content).

- [x] `seo.config.js` flipped `urdu-card-gallery` and `urdu-cards` to `indexable: true` with the distinct titles/descriptions above.
- [x] `docs/WU-PUBLIC-PAGE-REGISTRY.csv` updated to `index`/`yes`/`keep` for both rows.
- [x] `js/outcome-navigation.js` Create group/footer group gained `urdu-card-gallery` and `urdu-cards` entries (single nav source of truth; propagates via `npm run shell:sync`).
- [x] Reciprocal on-page links added between all three routes (not nav-only).
- [x] `js/workspace-journey-registry.js` status flipped from `planned` to `current` for `card-gallery` and `urdu-cards`.
- [ ] Post-change Search Console/Product Pulse review of whether the split intent actually avoids cannibalizing `/urdu-card-studio` query ownership (owned by `WU-SEO-CTR-001`/P0.1G once volume supports it).

**Guardrail:** this exception covers indexing/nav/cross-linking only. It is not permission to change Card Studio's canvas/export/renderer, to duplicate the background registry, or to add live-canvas-per-preview architecture to the Gallery/Cards pages. If evidence later shows cannibalization, retitle/re-scope rather than de-index without a decision.

## P0.10 — Cards retention programme first release (founder-directed P0.1/P0.1F exception)

**Specs:** [`WU-CARD-RETENTION-001`](WU-CARD-RETENTION-001-card-retention-sharing-engine.md), [`WU-CARD-CONTENT-001A`](WU-CARD-CONTENT-001A-recurring-social-content-library.md), [`WU-CARD-GALLERY-001A`](WU-CARD-GALLERY-001A-social-background-collection-expansion.md)
**State:** Founder-directed implementation exception recorded 2026-09-13. This permits one compact homepage card after the writer, the first recurring-content batch, eight original daily/Jumma backgrounds, shared public-card publishing and the exact Card Studio handoff. It does not close or erase P0.1F.

- [x] Preserve one shared background registry, one ready-made-card registry, one share publisher and one Card Studio renderer.
- [x] Add only one homepage card with exactly Share and Open in Card Studio; keep it after the core writer.
- [x] Add deterministic browser-local morning/daytime/evening/night selection with Friday override.
- [x] Add first source/rights-validated morning/night/Jumma/reflection content batch.
- [x] Add and validate eight original lightweight daily/Jumma backgrounds without removing shipped IDs.
- [ ] Review at least seven days of writer activation, featured-card engagement, Card Studio continuation/export, share reliability and homepage performance before expanding another batch.

**Guardrail:** this exception permits the defined first integrated release only. Favorites, shuffle, homepage filters/carousels, another content/background batch, new card SEO routes or broader Card Studio acquisition still require acceptance evidence and a fresh backlog decision. Writer first-value and Card Studio completion remain guardrail metrics.

## P0.6 — AI production external gate

**Spec:** [`WU-AI-001`](WU-AI-001-urdu-ai-writing-assistant-platform.md)  
**State:** Slices A–C built/tested; production remains behind provider terms/retention gate.

- [ ] Close provider terms/ZDR/retention decision or choose acceptable fallback.
- [ ] Enabling already-built code may proceed after the external gate closes.
- [ ] **Do not pull later AI expansion ahead of P0.1 merely because the provider gate closes.**

---

# NEXT — P1 (after activation evidence review)

## P1.1 — Defend and expand proven search demand

**Spec:** [`WU-SEO-CTR-001`](WU-SEO-CTR-001-serp-intent-optimization.md)

- [ ] Prioritize high-impression queries in positions 4–10 and strong-relevance 11–20 opportunities.
- [ ] Protect simple query language such as `english to urdu typing` / `urdu typing`.
- [ ] Improve CTR without destabilizing established query owners.
- [ ] Resolve cannibalization from query/page evidence.
- [ ] Address device-specific CTR gaps.

## P1.2 — Page-type AdSense experiments

Blocked until P0.2 baseline/exclusions exist.

- [ ] Test Learn-page placement variants one at a time.
- [ ] Consider desktop side rail / true-content-end Multiplex / mobile anchor only where UX supports it.
- [ ] Evaluate revenue together with task completion and CWV.
- [ ] Keep active editors/controls/results excluded.

## P1.3 — One evidence-backed Urdu-writing topic cluster

- [ ] Select one cluster from GSC/external demand after current-route wins are prioritized.
- [ ] Build only 1–3 strong owner/support pages.
- [ ] Preserve one clear query owner; no thin doorway variants.

Candidate themes: English-to-Urdu typing support, Urdu keyboard/reference, fonts, Urdu in WhatsApp/Word/Google Docs, creation/status jobs, punctuation/numerals/RTL.

## P1.4 — Creation-tool investment decision

- [ ] Re-score Stylish Text, Name Art, Card Studio, social makers, QR and Invoice using current impressions/clicks, product completion, repeat/session-depth value, maintenance cost and RPM/proxy RPM.
- [ ] Stylish/Name may receive investment if evidence remains strong.
- [ ] Card Studio acquisition remains gated by P0.1F.
- [ ] Invoice/QR remain maintenance/observe unless new evidence emerges.

## P1.5 — English to Urdu Document Translator

**Specs:** `WU-DOC-001` + A/B/C/D  
**State:** Planned, but **not the next major feature while P0.1 is open**.

After the activation review:

- [ ] Re-evaluate its commercial/search opportunity against proven-route CTR and retention work.
- [ ] If still justified, execute bounded ingestion/translation foundation, workspace/handoffs, truthful growth page and separately gated scanned/image R&D.

## P1.6 — AI expansion after production evidence

**Spec:** `WU-AI-001`

- [ ] Later polish/continuations/integrations only if core usage and provider evidence support them.
- [ ] No novelty acquisition routes without query + usage evidence.

## P1.7 — Full Urdu product expansion

**Specs:** `WU-I18N-001`, `WU-I18N-001D`

- [ ] Use Phase 1 search/product evidence to decide expansion.
- [ ] Do not bulk-generate locale pages merely for coverage.

## P1.8 — Urdu typing practice/test evaluation

- [ ] Check GSC/external demand.
- [ ] Write a feature contract only if demand/product fit are strong.
- [ ] Otherwise remain Hold.

## P1.9 — Multimodal Urdu Input & Conversion Platform

**Spec:** [`WU-INPUT-001`](WU-INPUT-001-multimodal-urdu-input-conversion-platform.md)  
**Evidence:** [`docs/WU-INPUT-001-API-EVIDENCE-2026-09-11.md`](../docs/WU-INPUT-001-API-EVIDENCE-2026-09-11.md)  
**State:** Founder-approved / planned behind the activation evidence review. Planning and benchmarks may proceed without relaxing the core-UI freeze.

- [ ] Slice 0 — reconcile ownership and build benchmark fixtures/harnesses without changing production UI.
- [ ] Extend `WU-JOURNEY-001B` rather than duplicating the Roman Urdu resilience corpus.
- [ ] Benchmark the current Roman Urdu engine against Microsoft transliteration before any provider change.
- [ ] Benchmark true English→Urdu translation using Cloudflare IndicTrans2, Microsoft Translator and any approved incumbent path; preserve the translation/transliteration distinction.
- [ ] Benchmark current local Urdu OCR against Gemma 4 and Google Vision on real Nastaliq, screenshot, photo, mixed-script and handwriting fixtures.
- [ ] Prototype bounded uploaded-audio/voice-note → Urdu with Whisper only after cost/privacy/quality gates are defined; do not replace live browser Voice.
- [ ] Keep `WU-AI-001` as the owner of Fix/Improve Urdu and `WU-DOC-001` as the owner of file/document translation.
- [ ] Require provider-neutral server adapters, feature quotas, kill switches, content-free telemetry and local/manual fallbacks.
- [ ] Do not add new acquisition routes until product quality passes and `WU-SEO-CTR-001` confirms canonical ownership/no cannibalization.

**Guardrail:** this epic coordinates proven/missing input modes around one editable Urdu destination. It is not permission for a new homepage command wall, generic chatbot, multiple converter doorway pages, or silent paid compute.


## P1.10 — Pakistan Wedding Invitation Platform

**Spec:** [WU-SHAADI-001](WU-SHAADI-001-pakistan-wedding-invitation-platform.md)  
**Architecture:** [WU-SHAADI-001-ARCHITECTURE-CONTRACT.md](WU-SHAADI-001-ARCHITECTURE-CONTRACT.md)  
**Execution:** [WU-SHAADI-001-IMPLEMENTATION-CHECKLIST.md](WU-SHAADI-001-IMPLEMENTATION-CHECKLIST.md)  
**Acceptance:** [WU-SHAADI-001-ACCEPTANCE-MATRIX.md](WU-SHAADI-001-ACCEPTANCE-MATRIX.md)  
**Evidence:** [docs/WU-SHAADI-001-EVIDENCE-2026-09-18.md](../docs/WU-SHAADI-001-EVIDENCE-2026-09-18.md)  
**Skill:** skills/wu-shaadi-001/SKILL.md  
**State:** Founder-approved specification / planned behind the activation evidence review. Slice 0 research, domain-schema work, fixtures and architectural proof may proceed without shipping a new public route.

- [ ] Slice 0 — lock WeddingProject, event/host/programme/guest-household contracts; validate local-first privacy and renderer reuse.
- [ ] Slice 1 — local structured invitation composer for Urdu/English/bilingual Pakistani wedding events.
- [ ] Slice 2 — receiver-quality PNG/PDF/print output with optional Card Studio fine-tuning.
- [ ] Slice 3 — household personalization, Roman/Latin-name → Urdu review, event assignment and bounded bulk generation.
- [ ] Slice 4 — explicit private personalized links using opaque noindex guest URLs and WU-SHARE-001 security patterns.
- [ ] Slice 5 — maps/calendar and optional culturally natural RSVP.
- [ ] Slice 6+ — print system, lifecycle/retention and animated invitations only from evidence.
- [ ] Never make a canvas or rendered card the canonical wedding record; one structured wedding must regenerate every dependent output.
- [ ] Keep guest lists/browser-local projects off the server until explicit publication and never put names, phone numbers, addresses or private wording in telemetry.
- [ ] Preserve one product route; do not pre-create Nikah/Baraat/Walima SEO doorway makers.
- [ ] Slice 2 asset/wording backlog — commission event-specific (Nikah/Mehndi/Baraat/Walima) SVG backgrounds and expand wording-registry content per the palette/motif research in `docs/superpowers/specs/2026-09-18-wu-shaadi-001-slice-1-logic-design.md` §5; art/copy production, not engineering, and not required before Slice 1 logic work.

**Guardrail:** this programme is not a generic wedding planner, vendor marketplace or second Card Studio. It digitizes the Pakistani invitation/envelope workflow around structured wedding data, guest households and WhatsApp/print outputs. If implementation permission is unclear, Slice 0 only.

---

# LATER — P2

## P2.1 — V2 release closure

- [ ] Finish remaining extensionless internal-link migration where needed.
- [ ] Validate canonicals/sitemap/redirects.
- [ ] Publish release notes and capture post-release GSC/AdSense baselines.

## P2.2 — Asset/code/performance cleanup

- [ ] Build asset-reference report.
- [ ] Remove only confirmed-unused code/assets.
- [ ] Measure ad/script contribution to LCP/CLS/INP on high-traffic pages.

## P2.3 — Answer-ready content backlog

Evidence-gated candidates: common English-letter/Roman Urdu phrases, Urdu in WhatsApp/Word/Docs, status/card creation, QR mechanics, browser compatibility, privacy guidance, punctuation/numerals/RTL.

---

# HOLD / CURRENT FREEZE

While P0.1 is open, keep these behind it unless new evidence materially changes priority:

- `WU-TOOLS-EXPANSION-006` Urdu/Hindi Script Converter.
- New unrelated mini-tools.
- Broad Invoice/QR expansion.
- New export formats.
- Bulk Urdu-locale expansion.
- Generic AI novelty/calligraphy routes.
- New community social mechanics (likes/follows/comments) before the reader → writer loop works.
- Card Studio acquisition expansion before completion diagnosis.
- Another homepage/global tools directory.
- Another toolbar layered over legacy toolbars/actions.
- Site-wide maximum Auto Ads load.
- Ads inside active editor/control/result/share/download areas.
- Transliteration provider/initialization changes without compelling reason.
- Separate doorway pages for near-identical typing/writing variants.
- Removing established URLs merely because they look visually old.

---

# Revenue-order view toward $5/day AdSense

The commercial sequence is now:

1. **P0.1 first-value/mobile visibility/continuation/referral activation** — improve the traffic already arriving and prove useful session depth.
2. **P0.2 current AdSense RPM/earnings baseline + exclusions** — know the real denominator for $5/day.
3. **P1.1 CTR wins on already-earned high-impression demand** — especially English-to-Urdu typing/mobile opportunities, after the first mobile action is stable.
4. **P1.2 page-type AdSense experiments** — primarily non-active content surfaces, measured against UX/CWV.
5. **P1.3 one evidence-backed content cluster** — only after current-route wins.
6. **P1.4 invest in proven creation winners** — not the whole tool catalog.
7. Reconsider major new features only from the combined Product Pulse + GSC + AdSense opportunity map.

Do not chase the target through intrusive editor ads, artificial pageview friction or thin pages.

## Grooming rule going forward

Every merged implementation should update its owning active contract and this backlog when state/priority changes. If no real work remains, archive the detailed spec rather than leaving a completed checklist in the active queue.

Every core-UI PR during P0.1 must state the hypothesis, governed state, removed/demoted UI, primary metric, guardrails, release marker and rollback path.
