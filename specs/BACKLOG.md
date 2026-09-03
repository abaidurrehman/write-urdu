# WriteUrdu — Canonical Active Backlog

**Status:** Active  
**Last reconciled against code + Product Pulse/GSC evidence:** 2026-09-03  
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
- fresh direct user feedback on 2026-09-03 says mobile visitors can struggle to spot the editing area;
- the 2026-09-02 GSC export shows mobile is about 68% of search impressions, so unresolved first-screen mobile friction is now a P0 activation issue rather than cosmetic polish.

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

**Historical note:** this broad simplification shipped. Its mobile acceptance is no longer considered sufficient because fresh direct user feedback reports that the editor remains hard to spot on mobile. The new P0.1B2 gate below reopens mobile acceptance without undoing the shipped command-surface work.

### P0.1B2 — Mobile editor visibility & keyboard repair

**Owner:** [`WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md`](WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md)  
**Acceptance:** [`WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md`](WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md)  
**Evidence:** [`docs/WU-MOBILE-ACTIVATION-EVIDENCE-2026-09-03.md`](../docs/WU-MOBILE-ACTIVATION-EVIDENCE-2026-09-03.md)

- [ ] Capture comparable mobile first-value baseline before layout changes.
- [ ] Audit actual DOM/runtime-injected content before the editable surface on `/`, `/urdu-editor`, `/urdu-keyboard`.
- [ ] Capture baseline screenshots at 360x800, 375x667, 390x844 and 412x915.
- [ ] On `/`, expose the real writer in the initial visual viewport without requiring scroll or panel discovery.
- [ ] Meet the mobile acceptance floors: >=160 CSS px usable editor at 375x667 and >=220 CSS px on required >=800px-tall viewports.
- [ ] Demote/move promotional, directory, account/community, export/help or ad UI that displaces first value.
- [ ] Keep English-letter, direct-Urdu and Voice choices compact; Voice must reuse the unified Voice platform.
- [ ] Do not autofocus on load merely to improve activation metrics.
- [ ] Verify iOS Safari / Android Chrome keyboard focus keeps the active line/caret usable and avoids forced-scroll loops.
- [ ] Make the editor visually unmistakable without a broad rebrand.
- [ ] Apply equivalent first-action hierarchy to `/urdu-editor` while preserving TinyMCE, exports, handoff and draft protection.
- [ ] Audit `/urdu-keyboard`; fix only reproduced violations.
- [ ] Verify `eligible → visible → focus → first input → first Urdu → first outcome` by route/device/release marker with no content leakage.
- [ ] Hold a stable post-change measurement window and record Keep / Iterate / Rollback.

**Gate rule:** do not intensify major homepage/SERP acquisition experiments until the mobile writer entry experience is no longer demonstrably confusing. It is wasteful to buy/earn more arrivals into an unresolved first-action defect.

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
