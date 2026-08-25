# WriteUrdu — Canonical Product & Spec Backlog

**Status:** Active  
**Last updated:** 2026-08-24  
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
- [x] Card Studio and QR Generator ad enablement (2026-08-20): removed the `card-studio-page`/`qr-generator-page` header-ad exclusion in `js/site-header-core.js`. Both routes already had valid `create`-type `CREATE_ANCHORS` boundaries in `js/ads.js` (Card Studio: after `.card-studio-shell`; QR: the existing `data-wu-ad-boundary="post-workspace"` attribute, previously dead code) — placement verified in-browser to land after the workspace/canvas, never inside `CREATE_PROTECTED_AREAS`. **This was a deliberate, founder-approved exception shipped ahead of the account-side baseline/exclusion checklist below**, not an oversight — do not treat it as governance drift.

**Decision rule:** do not increase site-wide ad density until the account-side baseline/exclusions exist and the normalized placement has been observed. Do not interpret the July 12 discontinuity in AdSense pageviews as a traffic collapse without reconciling it against Search Console/site traffic evidence. (Card Studio/QR enablement above is a scoped, explicitly approved exception to this rule, not a precedent for further pre-baseline density increases.)

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

## P0.6 — `WU-SHARE-001` public share pages & viral publishing loop

**Type:** Product-led growth / distribution  
**Spec:** `specs/WU-SHARE-001-public-share-pages-viral-publishing-loop.md`  
**Guide source:** `docs/WU-SHARE-001-USER-GUIDE.md`  
**Status:** Planned — founder-approved; Card Studio is the Phase 1 proving ground.

Turn finished Urdu creations into short branded public links such as `write-urdu.com/s/:id`, with a polished social preview, restrained Write-Urdu.com provenance and a strong path for recipients to create and publish their own version.

- [ ] Build generic Share Artifact storage/API using D1 metadata + R2 image storage; do not hard-code the backend to Card Studio.
- [ ] Add explicit Card Studio `Publish & Share` while preserving local Download and image-only sharing semantics.
- [ ] Serve dynamic `/s/:id` pages with server-rendered OG/Twitter preview metadata, selectable RTL Urdu text and `noindex,follow`.
- [ ] Add `Create your own` / `Use this text` continuation without putting Urdu text into URLs.
- [ ] Add author-side delete token, public report flow, bounded anonymous publishing controls and no public gallery.
- [ ] Keep UGC share pages out of sitemap/feed/llms discovery and ad-free in Phase 1.
- [ ] Instrument publish → public view → CTA → referred creation → republish from the first release using `WU-ANALYTICS-001`.
- [ ] Add Share Loop reporting to Product Pulse, including parent/child reproduction metrics.
- [ ] Ship the public `/how-to-share-urdu-writing-online` guide and update privacy copy as part of the feature release.
- [ ] After Phase 1 proves the loop, integrate the same service into the main/basic editor, where mature adoption is highest.

**Release gate:** do not mark the feature released if production publishing works but share-loop telemetry/Product Pulse reporting does not. Measurement is part of the feature, not a later analytics task.

## P0.7 — `WU-PLAT-002` V2 Product Journey & Workspace Handoffs

**Type:** Product architecture / information architecture / continuity  
**Spec:** `specs/WU-PLAT-002-v2-product-journey-workspace-handoffs.md`  
**Research:** `docs/WU-V2-PRODUCT-JOURNEY-UX-RESEARCH-2026-08-18.md`  
**Status:** Active — Slices A–G implemented and green (all 57 contract test files pass); Slice H (measurement + usability closure) is the remaining open work. This checklist was found stale on 2026-08-23 — most items below were already shipped in code (`js/workspace-journey-registry.js`, `js/workspace-handoff.js`, `js/workspace-next-step.js`, `js/outcome-navigation.js`, `js/core-continuity.js`, `js/capture-continuity.js`, `js/create-publish-boundaries-registry.js`) with no matching backlog update.

Turn the expanded WriteUrdu product into one continuous user journey instead of exposing a growing directory of implementation-named tools. This is the successor layer above the completed P0.5 tactical links/handoffs; it does not reopen completed renderer or role-workspace work.

- [x] Replace tool-first global navigation with stable outcome groups: **Write / Create / Work / Learn** (`js/outcome-navigation.js`), preserving established URLs and SEO owners.
- [x] Keep `My drafts` (`My Documents`) in the account/continuity utility area, not a fifth content category (`js/workspace-journey-registry.js` — `my-documents` workspace, `category: 'Utility'`).
- [x] Register every current interactive workspace with input/output, persistence, natural-next-step and conflict/recovery contracts (`js/workspace-journey-registry.js`).
- [x] Register approved new tools (Cleaner, OCR, Voice, InPage and Hindi R&D) in the same journey architecture — Hindi converter registered `status: 'research'` with no shipped UI, per contract.
- [x] Consolidate cross-workspace transfers behind one shared handoff API/registry (`js/workspace-handoff.js`) preserving the 30-minute browser-session/privacy contract and legacy-key compatibility adapters.
- [x] Core continuity: Basic/Keyboard/Rich/Cleaner → relevant Rich/Card/QR destinations without manual copy/paste (`tests/core-continuity-contract.test.js`, `tests/capture-continuity-contract.test.js` passing).
- [x] `Continue with…` contextual, capped at three visible actions, positioned after the active task/result boundary (`js/workspace-next-step.js`).
- [x] Preserve target work before compatible imports; consistent accessible acknowledgement/recovery feedback (`js/workspace-handoff.js` conflict/consume handling).
- [x] Transformations and embedded capabilities kept distinct from navigation handoffs — Invoice payment QR and Card/social completion actions remain embedded (`tests/create-publish-boundaries-contract.test.js`).
- [x] Templates and public-share seeds integrated through the same workspace-ownership model (`js/template-library-boundary.js`, `js/share-page.js`); My Drafts uses the same model via `document-reference` payload kind.
- [x] Desktop + Pixel 5 role-flow, accessibility, SEO and AdSense-boundary contracts are green (`playwright.config.js` `mobile-chromium` project + existing contract suites).
- [x] Privacy-safe journey handoff telemetry now reaches the existing product-telemetry pipeline: the shared `Continue with…` panel's `data-wu-next-step-action` links feed the existing `tool_handoff` event end-to-end (2026-08-23 fix, `js/product-telemetry.js`), closing the one real telemetry gap found on audit (the v2 panel was previously invisible to telemetry; `copy_completed`/`export_completed`/`session_summary` already covered the rest of spec §19's event surface under different, pre-existing names). `next_step_impression` (panel-seen, not just panel-clicked) and `handoff_recovery_used` (prior-work-preserved acknowledgement) remain unbuilt — deliberately deferred, not silently dropped; revisit only if impression-level data is actually needed.
- [ ] Run task-finding/IA validation and end-to-end continuity usability checks before closing P0 — no tree-test or moderated usability pass recorded anywhere in `docs/`. This is the one item genuinely not done; it requires real user sessions, not more code.

**Decision rule:** do not add a new tool to primary navigation or another destination-specific handoff key merely because the capability exists. Every new surface must first answer which user job it owns, which stage it participates in, what it accepts/produces and what the next natural action is.

---

## P0.8 — `WU-VOICE-PLAT-001` Unified Urdu Input Platform

**Type:** Product input platform  
**Specs:** `specs/WU-VOICE-PLAT-001-unified-urdu-input-platform.md`, `specs/WU-VOICE-PLAT-001A-shared-input-engine.md`, `specs/WU-VOICE-PLAT-001B-core-writing-rollout.md`, `specs/WU-VOICE-PLAT-001C-create-social-rollout.md`, `specs/WU-VOICE-PLAT-001D-growth-measurement.md`  
**Status:** Active — this whole family was missing from the backlog until 2026-08-23 despite Slices A and B already being shipped and tested. Slice C (Create/Social rollout) implemented and green on 2026-08-23. Slice D (growth/measurement) is partially complete (2026-08-25): adoption/final-speech telemetry, the correction-switch proxy and completion-outcome linkage are now wired end-to-end (client events + `functions/api/events.js` allowlist/aggregation + `migrations/0009_voice_input_mode.sql`); cross-workspace Product Pulse reporting and the WhatsApp voice-to-message outcome remain unbuilt.

Give every workspace with a typing input a real third option — Speak Urdu — feeding the same editable model Roman/direct input already uses, not a separate transcript flow.

- [x] Slice A — shared speech core + generic textarea/input insertion adapter (`js/voice-input-core.js`, `js/unified-urdu-input.js`); dedicated `/tools/urdu-voice-typing` migrated onto it.
- [x] Slice B — Basic Writer, Rich Editor, Urdu Keyboard and My Documents "Start with voice" shortcut (`js/writer-voice-input.js`, `js/basic-writer-command-toolbar.js`).
- [x] Slice C — Create/Social rollout (2026-08-23): Card Studio, WhatsApp Status Maker, Instagram Post Maker, Stylish Urdu Text and Name Art all mount the shared voice widget onto their real text field (`#cardText`, `#stylishText`, `#nameArtText`) via a new generic `mountInputModeTextTargets()`/`mountNameArt()` in `js/writer-voice-input.js`, reusing the exact `[data-input-mode-control]` chooser Roman/direct already use — no per-route adapter, no duplicate speech engine. Verified live in headless Chromium on all five routes (mic renders, panel opens, no console errors) and via `tests/create-social-voice-input-contract.test.js`. Known simplification: voice always targets the workspace's primary text field, not a canvas-selected layer (e.g. Card Studio's attribution field) — acceptable per spec §10's documented-primary-field fallback, not revisited unless evidence says otherwise.
- [~] Slice D — growth/measurement. Partially complete (audited 2026-08-25 against `specs/WU-VOICE-PLAT-001D-growth-measurement.md` §13):
  - [x] Voice adoption measurable per workspace without text content — corrected 2026-08-25: the old `writer_voice_action`/`basic_toolbar_action` calls were a silent no-op end-to-end (`functions/api/events.js`'s `onRequestPost` never wrote a raw event log; it only aggregates via `applyEvent()`, which had no case for these names, and they weren't in `EVENT_NAMES` so `cleanEvent()` rejected the whole batch). Replaced with 5 distinct, allowlisted events (`voice_exposed`/`voice_selected`/`voice_started`/`voice_final`/`voice_switch_continued`) fired from `js/writer-voice-input.js` and `js/basic-writer-command-toolbar.js`, each aggregated per-workspace via the existing route-derived `tool` column into new `product_hourly_metrics`/`product_hourly_locale_metrics` counters (`migrations/0009_voice_input_mode.sql`). Basic Writer previously had no `voice-exposed`/`voice-selected` calls at all — added for parity with Rich Editor/Keyboard/creation workspaces.
  - [x] Final-speech success measurable — `voice_final` event, same fix as above.
  - [x] Method-switch correction/continuation proxy (voice final → switch to roman/direct) — new `voice_switch_continued` event, fired once per completed voice session when the user next clicks an existing `[data-input-mode-option]` button, wired in both `writer-voice-input.js` (Rich Editor + creation-tool mounts) and `basic-writer-command-toolbar.js`.
  - [x] Completion tied back to a prior voice session via existing outcome taxonomy — `js/product-telemetry.js`'s `trackOutcome()` now sets `currentInputMode = 'voice'` whenever a voice event fires, so the existing `session_summary` → `input_mode` mechanism (already had `input_roman`/`input_direct`/`input_unknown` columns) now also produces `input_voice`, added in the same migration. Reuses the pre-existing taxonomy per spec, no new event shape.
  - [x] Owner-page copy stays truthful/task-language only — `DISCOVERY_COPY` in `js/writer-voice-input.js` already matches spec §3 approved language.
  - [x] No bulk voice+outcome keyword pages created — confirmed via `specs/WU-GROWTH-003-urdu-voice-typing-growth-seo.md` decision log (2026-08-22), correctly held behind its own evidence gate.
  - [ ] Cross-workspace Product Pulse section answering §7's 8 adoption/completion questions — not built yet; the new counters above are the data source it would read. (`functions/api/internal/voice-account-pulse.js` + `voice_account_hourly_metrics` is a separate, route-scoped signup-attribution system for `/tools/urdu-voice-typing` only, from a different epic — do not conflate with this cross-workspace ask.)
  - [ ] WhatsApp voice-to-message outcome (§4) and Status-vs-message distinction (§13 items 9-10) — not built.
  - [ ] Short-form demonstration assets (§9) — not built, outside this session's tooling (no channel/creative access).
  - **Deploy note:** `migrations/0009_voice_input_mode.sql` applied to production D1 (`writeurdu-db`, 2026-08-25, via `wrangler d1 execute --remote --file`; no root `wrangler.jsonc` exists for `d1 migrations apply` to target, so applied directly — 12/12 ALTER TABLE statements ran clean, verified via `PRAGMA table_info` on both tables). Counters now live. Verified locally via `npm test` (63/63 contract files) and live Playwright network interception confirming `voice_exposed`/`voice_selected`/`voice_final` post with `input_mode: 'voice'` and no console errors.

---

# NEXT — P1

## P1.1 — Defend and expand proven search demand

**Current slice:** `WU-SEO-CTR-001` Phase 1 intent and measurement foundations are active. Homepage title/description experiments remain blocked on dated Search Console query-to-page, URL Inspection and recrawl evidence.

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
**Status:** completed in PR #20.

- [x] Move Card Studio onto the v2 application hierarchy without changing renderer/export contracts.
- [x] Make the workspace dominant and education/promo secondary.
- [x] Migrate Templates into the same creation journey and strengthen handoff into Card Studio.

### Stylish Urdu Text + Name Art
**Status:** already shipped — found implemented in `css/v2-creation-tools.css` + `css/name-art-task-first.css` and verified live on 2026-08-20 (this checklist was stale, not the actual code state).

- [x] Apply the v2 creation shell now that `WU-SUA-001` acceptance is closed.
- [x] Preserve copy/favourite/collection/share/handoff/template/preset/export behavior and the focused acceptance suite.

### Social makers + QR
**Status:** already shipped — found implemented in `css/v2-publish-tools.css` and verified live on 2026-08-20 (this checklist was stale, not the actual code state).

- [x] Migrate WhatsApp Status Maker and Instagram Post Maker.
- [x] Migrate QR Generator.
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

## P1.8 — `WU-DOC-001` English to Urdu Document Translator

**Type:** Product + acquisition / Work workflow  
**Specs:** `specs/WU-DOC-001-english-to-urdu-document-translator.md`, `specs/WU-DOC-001A-ingestion-translation-foundation.md`, `specs/WU-DOC-001B-document-workspace-handoffs.md`, `specs/WU-DOC-001C-growth-seo-measurement.md`, `specs/WU-DOC-001D-scanned-images-layout-rnd.md`  
**Feasibility:** `docs/WU-DOC-001-CLOUDFLARE-FEASIBILITY-2026-08-24.md`  
**Status:** Planned — founder-approved 2026-08-24.

Turn English PDF/DOCX/TXT documents into clean, editable Urdu and continue into the existing Write Urdu editing/export journey. The Phase 1 promise is semantic structure and editable Urdu, not pixel-perfect source-layout replacement.

- [ ] Slice A — configure the current Workers AI binding; implement bounded `toMarkdown` extraction, `DocumentDraft`, translation adapter, IndicTrans2 Urdu baseline benchmark, safe limits and `/api/document-translate`.
- [ ] Slice B — ship the focused upload/review workspace, editable RTL result, Copy, Rich Editor handoff, clean Print/Save-as-PDF path, accessibility/mobile acceptance and `WU-PLAT-002` registry integration.
- [ ] Slice C — launch one canonical acquisition owner at `/tools/english-to-urdu-document-translator`, add truthful metadata/schema/internal discovery, bounded funnel telemetry, Urdu locale when generated under `WU-I18N-001`, and protect the active workspace from ads.
- [ ] Slice D — benchmark photo/scanned/image-only inputs separately; expose image/OCR support only when extraction fidelity passes. Keep exact layout preservation as separately gated R&D.

**Guardrails:** no automatic file/content persistence, no new D1/R2 store for transient translation, no document content/filename in telemetry/logs, no near-identical `/pdf-to-urdu` doorway pages at launch, and no claim that generated Urdu preserves the exact source layout.

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
- Generic AI translation/calligraphy novelty features. `WU-DOC-001` is the approved bounded document-workflow exception; expansion beyond its explicit contract requires its own evidence/spec.
- Removing established URLs because they look visually old or redundant without query/route evidence.
- Publishing founder identity, reviews, ratings, usage counts or `sameAs` profiles without verified public evidence.

---

# Feature-spec reconciliation

| ID | Groomed state | Roadmap treatment |
| --- | --- | --- |
| `WU-GROWTH-001` | Active | P0 commercial control plane; runtime AdSense normalization/restoration shipped, Authority Map awaits detailed exports |
| `WU-SHARE-001` | Planned | P0.6 product-led distribution; Card Studio Phase 1 with release-blocking telemetry, then main editor expansion |
| `WU-PLAT-001` | Implemented | Foundation complete; maintain contracts |
| `WU-PLAT-002` | Active | P0.7 outcome-led IA + shared workspace continuity; governs new-tool journey integration |
| `WU-DOC-001` | Planned | P1.8 founder-approved document-to-Urdu Work workflow; text PDF/DOCX/TXT Phase 1, scanned/layout expansion separately gated |
| `WU-CS-UX-001` | Implemented | Card Studio behavior complete; v2 creation hierarchy migrated in PR #20 |
| `WU-CS-UX-002` | Implemented | Card Studio empty-state behavior retained through v2 migration |
| `WU-SM-001` | Implemented core | v2 migration P1 |
| `WU-SUA-001` | Implemented | Acceptance closed; Stylish Text + Name Art v2 presentation migration is next |
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

**Completed product implementation:** P1.4 V2 creation-workspace migration is fully shipped — Card Studio + Templates (PR #20), and Stylish Urdu Text + Name Art + Social makers + QR (implemented in `css/v2-creation-tools.css`, `css/name-art-task-first.css` and `css/v2-publish-tools.css`; confirmed live 2026-08-20 after this checklist was found stale).  
**Next product-architecture implementation:** P0.7 `WU-PLAT-002` Slice A/B — workspace registry + shared handoff runtime before adding more destination-specific seams.  
**Parallel P0 distribution work:** P0.6 `WU-SHARE-001` remains approved; its public-to-local continuation should integrate with the new workspace-ownership contract rather than invent a separate journey model.  
**Parallel operational follow-up:** P0.2 production SEO validation/recrawl and post-restoration AdSense observation.  
**Approved P1 product expansion:** P1.8 `WU-DOC-001` is fully groomed and can start with Slice A when P1 capacity is available; it must reuse `WU-PLAT-002` rather than create an isolated document product.  
**Evidence-gated growth work:** P1.1/P1.2 and the full Authority Opportunity Map move as soon as detailed Search Console + AdSense exports are available.