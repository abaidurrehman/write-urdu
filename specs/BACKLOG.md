# WriteUrdu — Canonical Active Backlog

**Status:** Active  
**Last reconciled against code:** 2026-08-30  
**Purpose:** One source of truth for work that is still genuinely open.

The previous long-form backlog is preserved verbatim at [`archive/snapshots/BACKLOG-2026-08-30-pre-reconciliation.md`](archive/snapshots/BACKLOG-2026-08-30-pre-reconciliation.md). Completed implementation checklists no longer live here; their detailed contracts are in [`archive/`](archive/README.md).

## Governance

1. Runtime code + regression tests are authoritative for shipped behaviour.
2. This backlog contains only work with a real remaining decision, acceptance gate or implementation slice.
3. `specs/README.md` is the current contract registry.
4. Implemented contracts move to `specs/archive/implemented/` once their durable summary is retained.
5. Superseded contracts move to `specs/archive/superseded/`.
6. Protect established transliteration, ranking URLs, mobile usability and Core Web Vitals.
7. Search Console + AdSense evidence should reorder growth work when available; missing perfect data must not freeze low-risk maintenance.
8. Keep active writing/creation surfaces ad-light; monetize around the task, not inside it.

---

# NOW — P0

## P0.1 — Mature-domain growth baseline and authority/revenue map

**Spec:** [`WU-GROWTH-001`](WU-GROWTH-001-search-adsense-growth-system.md)  
**State:** Active control plane; runtime placement architecture is already shipped.

Remaining:

- [ ] Create the documented AdSense custom/URL channels where useful.
- [ ] Configure Auto-ads page exclusions/excluded areas.
- [ ] Capture a comparable post-restoration AdSense baseline by top pages, RPM, country, device and format/placement.
- [ ] Analyze full Search Console Queries/Pages/Countries/Devices exports when available.
- [ ] Build the query → route → page type → observed/proxy RPM authority map.
- [ ] Re-rank growth work into defend / near-win / CTR / expand / consolidate / observe / reject buckets.

## P0.2 — Production SEO verification

Already-shipped SEO foundations still need operational verification:

- [ ] Smoke-test homepage English-letter-to-Urdu typing in production.
- [ ] Validate important JSON-LD with Google/Schema.org validators.
- [ ] Confirm `/llms.txt`, `/robots.txt`, `/sitemap.xml` and `/.well-known/security.txt` are reachable.
- [ ] Request recrawl for the established authority routes after meaningful changes.
- [ ] Complete the production source-view spot check for the archived `WU-SEO-CRAWL-001` implementation.

## P0.3 — V2 journey acceptance closure

**Spec:** [`WU-PLAT-002`](WU-PLAT-002-v2-product-journey-workspace-handoffs.md)  
**State:** A–G shipped; only genuine usability acceptance remains.

- [ ] Run task-finding / IA validation with real users.
- [ ] Run end-to-end continuity checks on representative Write → Create / Work journeys.
- [ ] Record findings and close or create evidence-backed follow-up work; do not invent new handoff architecture without evidence.

## P0.4 — Community staged-launch acceptance

**Spec:** [`WU-COMMUNITY-001`](WU-COMMUNITY-001-moderated-urdu-writing-publishing.md)  
**State:** Slices A–F are shipped and test-covered. Submission/moderation/read/revise/withdraw code exists; public discovery remains deliberately staged.

Human/product gates still open:

- [ ] Review Community Guidelines / Terms wording before broad promotion.
- [ ] Decide when `COMMUNITY_PUBLIC_ENABLED` should be enabled and when `/urdu-writers` should enter normal navigation/discovery.
- [ ] Decide the eventual ad-density policy for community reading pages.
- [ ] Verify production rollback flags/toggles as part of the launch decision.

Do not rebuild the archived A–F slices. Their implementation history is in [`archive/implemented/`](archive/implemented/).

## P0.5 — Voice platform non-code closeout

**Specs:** [`WU-VOICE-PLAT-001`](WU-VOICE-PLAT-001-unified-urdu-input-platform.md), [`WU-VOICE-PLAT-001D`](WU-VOICE-PLAT-001D-growth-measurement.md)  
**State:** A/B/C and the functional D telemetry/reporting/WhatsApp outcome are shipped.

- [ ] Produce the short-form demonstration assets/storyboards required by the growth plan when channel/creative work is scheduled.
- [ ] Keep further dedicated voice keyword expansion under [`WU-GROWTH-003`](WU-GROWTH-003-urdu-voice-typing-growth-seo.md)'s Search Console evidence gate.

## P0.6 — AI production gate

**Spec:** [`WU-AI-001`](WU-AI-001-urdu-ai-writing-assistant-platform.md)  
**State:** Slices A–C built and tested; feature intentionally remains behind `AI_WRITING_ENABLED`.

- [ ] Close the provider retention/ZDR/terms gate for the production provider, or choose an acceptable fallback.
- [ ] Only after that gate closes, enable the feature and collect bounded usage evidence.

This is currently a provider/product decision, not a request to rebuild Slices A–C.

---

# NEXT — P1

## P1.1 — Defend and expand proven search demand

**Spec:** [`WU-SEO-CTR-001`](WU-SEO-CTR-001-serp-intent-optimization.md)

- [ ] Prioritize high-impression queries in positions 4–10, then strong-relevance 11–20 opportunities.
- [ ] Improve CTR using actual query language without destabilizing proven ranking URLs.
- [ ] Resolve cannibalization from query/page evidence.
- [ ] Address device-specific CTR/UX gaps.

## P1.2 — Build one evidence-backed Urdu-writing topic cluster

Candidate themes remain English-to-Urdu typing, Urdu keyboard/reference, fonts, Urdu in WhatsApp/Word/Google Docs, creation/status jobs, punctuation/numerals/RTL.

- [ ] Select one cluster from Search Console/external demand evidence.
- [ ] Build only 1–3 strong owner/support pages.
- [ ] Preserve one clear query owner; no thin doorway variants.

## P1.3 — Page-type AdSense experiments

Blocked until P0.1 baseline/exclusions exist.

- [ ] Test Learn-page placement variants one at a time.
- [ ] Consider desktop side rail / true-content-end Multiplex / mobile bottom anchor only where UX supports it.
- [ ] Evaluate revenue together with task completion and Core Web Vitals.

## P1.4 — Decide which existing creation tools deserve further search investment

Implemented creation specs are archived; the product routes remain live.

- [ ] Score Card Studio, Stylish Text, Name Art, social makers, QR and invoice by impressions/clicks, usefulness, repeat/session-depth potential, maintenance cost and observed/proxy RPM.
- [ ] Invest only in evidence-backed winners.

## P1.5 — Evaluate Urdu typing practice/test

- [ ] Check Search Console and external demand for typing practice/test/WPM/exam intent.
- [ ] Write a feature contract only if demand and product fit are strong.
- [ ] Otherwise keep it on Hold.

## P1.6 — Invoice strategy decision

Historical implementation: [`archive/implemented/WU-IG-001-urdu-invoice-generator.md`](archive/implemented/WU-IG-001-urdu-invoice-generator.md) plus `WU-IG-002/003` in the same archive.

- [ ] Measure whether the route contributes organic entrances, useful second-page activity or cross-product value.
- [ ] Keep WriteUrdu-specific Urdu invoice value distinct from InvoiceCraftly.
- [ ] Do not reopen old implementation specs unless behaviour regresses.

## P1.7 — English to Urdu Document Translator

**Specs:** [`WU-DOC-001`](WU-DOC-001-english-to-urdu-document-translator.md), [`001A`](WU-DOC-001A-ingestion-translation-foundation.md), [`001B`](WU-DOC-001B-document-workspace-handoffs.md), [`001C`](WU-DOC-001C-growth-seo-measurement.md), [`001D`](WU-DOC-001D-scanned-images-layout-rnd.md)  
**State:** Planned. The existing TXT-only preview is not the approved Slice A contract.

- [ ] A — bounded extraction/translation foundation and benchmark.
- [ ] B — focused upload/review/edit/handoff workspace.
- [ ] C — one canonical acquisition owner + truthful SEO/telemetry.
- [ ] D — separately benchmark scanned/image/layout support before promising it.

## P1.8 — AI expansion after production evidence

**Spec:** [`WU-AI-001`](WU-AI-001-urdu-ai-writing-assistant-platform.md)

- [ ] D — optional polish after English-letter/Roman Urdu conversion.
- [ ] E — work/life continuations only if core usage supports them.
- [ ] F — voice/OCR/document integrations by reusing existing outputs.
- [ ] G — dedicated acquisition routes only with Search Console + usage evidence.

## P1.9 — Full Urdu product expansion

**Specs:** [`WU-I18N-001`](WU-I18N-001-crawlable-urdu-locale.md), [`WU-I18N-001D`](WU-I18N-001D-full-urdu-product-expansion.md)  
**State:** Phase 1 is shipped; 001D remains intentionally unbuilt.

- [ ] Use Phase 1 Search Console/product evidence to decide whether to expand `/urdu/*` beyond the current corpus.
- [ ] Do not bulk-generate locale pages merely for coverage.

---

# LATER — P2

## P2.1 — V2 release closure

- [ ] Complete remaining extensionless internal-link migration where still needed.
- [ ] Validate registered canonicals, sitemap entries and redirects.
- [ ] Publish release notes and capture post-release Search Console/AdSense baselines.

## P2.2 — Asset/code/performance cleanup

- [ ] Build an HTML/CSS/JS asset-reference report.
- [ ] Identify zero-reference assets and obsolete dependencies.
- [ ] Remove only confirmed-unused code/assets.
- [ ] Measure ad/script contribution to LCP/CLS/INP on high-traffic pages.

## P2.3 — Answer-ready content backlog

Evidence-gated candidates: common Roman Urdu phrases, Urdu in WhatsApp/Word/Docs, status/card creation, QR mechanics, browser compatibility, privacy guidance, punctuation/numerals/RTL.

---

# HOLD

- `WU-TOOLS-EXPANSION-006` Urdu/Hindi Script Converter until evidence justifies it.
- Separate doorway pages for near-identical Urdu typing/writing variants.
- Generic tools unrelated to Urdu writing/creation without strong evidence.
- Ads inside active editor/control/result regions.
- Site-wide maximum Auto ads load without page-type evidence.
- Transliteration provider/initialization changes without a compelling reason.
- Generic AI novelty/calligraphy routes; `WU-DOC-001` is the bounded approved document exception.
- Removing established URLs because they look visually old without query/route evidence.
- Publishing identity/review/rating/usage claims without verified evidence.

---

# Revenue-order view toward $5/day AdSense

The repository still does not establish the current daily AdSense baseline. Until that is measured, treat this as ordering, not a revenue forecast:

1. P0.1 account channels/exclusions + baseline.
2. P0.2 production SEO verification/recrawl.
3. P0.6 AI provider gate if terms can be closed safely.
4. Authority Opportunity Map from Search Console + AdSense exports.
5. P1.1 CTR gains on already-earned rankings.
6. P1.3 controlled Learn-page ad experiments.
7. P1.2 one evidence-backed content cluster.
8. P0.3 real journey/usability validation.
9. P1.7 document translator only after the cheaper evidence/optimization work above.

Do not chase the target by increasing ad density inside core writing tasks or by creating thin pages.

## Grooming rule going forward

Every merged implementation should update its owning active contract and this backlog when state/priority changes. If no real work remains, archive the detailed spec rather than leaving a completed checklist in the active queue.
