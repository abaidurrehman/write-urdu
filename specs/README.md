# Write Urdu feature specifications

Feature work uses stable `WU-<AREA>-<NUMBER>` IDs. The **runtime code and regression tests are the source of truth for shipped behaviour**; this directory owns only living product contracts and forward-looking acceptance work.

**Priority and sequence live in [`BACKLOG.md`](BACKLOG.md).** Historical implementation contracts live in [`archive/`](archive/README.md) and must not be treated as backlog work.

## Active / forward-looking contracts

| ID | Feature | Status / remaining reason to stay active |
| --- | --- | --- |
| `WU-GROWTH-001` | Search Console + AdSense Growth System | **Active** — commercial control plane; current AdSense baseline/exclusions and authority/revenue map remain open |
| `WU-GROWTH-002` | Account Save + Share Entry Points | **Active** — account/save/share behavior now uses value-triggered, single-growth-request arbitration governed by `WU-PLAT-002H` |
| `WU-GROWTH-003` | Urdu Voice Typing Growth & SEO | **Active** — A/B/C/E shipped; evidence-gated Slice D expansion remains open; activation discovery is governed by `WU-PLAT-002H` |
| `WU-HERITAGE-001` | Ten Years of Write Urdu: Heritage, Impact & User Stories | **Active** — founder-approved trust/authority programme; Slice A is implementation-active, About/home integration follows visual acceptance, dedicated moderated story collection remains separately gated |
| `WU-HERITAGE-001A` | Ten-Year Heritage & Impact Page | **Active implementation slice** — `/10-years-of-write-urdu` + evidence methodology + SEO/ad-free/claim-safety acceptance are in progress without touching core writer UI |
| `WU-COMMUNITY-001` | Moderated Urdu Writing Publishing / Urdu Writers | **Implemented core / acceptance pending** — A–F shipped; staged public/terms/ad-density/rollback acceptance remains |
| `WU-VOICE-PLAT-001` | Unified Urdu Input Platform | **Implemented core / acceptance pending** — functional platform shipped; activation now treats Voice as a governed input choice rather than a separate duplicated engine |
| `WU-VOICE-PLAT-001D` | Voice growth & measurement closure | **Active acceptance slice** — functional telemetry/reporting shipped; demonstration/acceptance work remains |
| `WU-I18N-001` | Crawlable Urdu Locale | **Implemented core** — Phase 1 A/B/C shipped; full-product expansion remains gated |
| `WU-I18N-001D` | Full Urdu Product Expansion | **Planned / evidence-gated** — intentionally unbuilt and behind the activation phase |
| `WU-SHARE-001` | Public Share Pages & Viral Publishing Loop | **Active** — core loop shipped; parent storage/API/privacy/distribution contract remains authoritative |
| `WU-SHARE-001R` | Recipient Start Continuity | **Active / P0 acceptance repair** — trace CTA → destination ready → referred meaningful start; current evidence is 8 CTA clicks → 0 starts |
| `WU-ACCOUNT-001` | Account, Documents & Collaboration Platform Boundary | **Active boundary** — auth/drafts core shipped; collaboration/teams/social remain separately gated |
| `WU-AUTH-001` | Optional social authentication foundation | **Implemented core / acceptance pending** — provider code exists; Facebook production registration/secrets remain external acceptance work |
| `WU-DRAFT-001` | My Documents / cross-device account-backed writing | **Implemented core / acceptance pending** — shipped; acceptance checklist remains open |
| `WU-DOC-001` | English to Urdu Document Translator | **Planned** — current TXT preview is not the approved Slice A contract; execution is behind core activation unless reprioritized by stronger evidence |
| `WU-DOC-001A` | Document ingestion + translation foundation | **Planned** |
| `WU-DOC-001B` | Document workspace + handoffs | **Planned** |
| `WU-DOC-001C` | Document growth/SEO/measurement | **Planned** |
| `WU-DOC-001D` | Scanned/image/layout R&D | **Hold / gated R&D** |
| `WU-AI-001` | Urdu AI Writing Assistant Platform | **Implemented core / acceptance pending** — A–C built/tested; provider-terms gate blocks production enablement; later expansion remains evidence-gated |
| `WU-INPUT-001` | Multimodal Urdu Input & Conversion Platform | **Planned / evidence-gated** — founder-approved coordination epic for Roman/direct/translation/voice/audio/OCR/document inputs; reuses existing owners, starts with benchmarks, and remains behind `WU-PLAT-002H` for core-UI/public breadth |
| `WU-BILL-001` | Pakistan Everyday Billing Toolkit | **Planned / founder-approved** — separate `/urdu-bill-generator` sibling for Bill/Cash Memo/Receipt/Udhaar; implementation package ready, current professional `/urdu-invoice-generator` protected, production work remains behind `WU-PLAT-002H` unless reprioritized |
| `WU-CARD-GALLERY-001` | Live Urdu Card Gallery / Background-First Rich Studio | **Planned / founder-approved specification** — new `/urdu-card-gallery` visual chooser where one Urdu text is previewed across the shared background collection; Slice 0 registry/fixtures are implementation-ready, public launch remains gated by `WU-PLAT-002H` Card Studio completion unless explicitly reprioritized |
| `WU-ANALYTICS-003` | Acquisition and Returning Signal | **Implemented core** — acquisition signal shipped; `WU-PLAT-002H` adds first-value/continuation acceptance requirements using the approved telemetry boundary |
| `WU-JOURNEY-001` | Pakistan Urdu Intent & Destination Journey Programme | **Planned / evidence-gated** — feedback-reconciled programme connecting existing input, messaging/social, document, practice and print capabilities around real user destination intent; core UI remains behind `WU-PLAT-002H` |
| `WU-JOURNEY-001A` | Destination Intent Measurement | **Planned evidence foundation** — privacy-safe bounded destination categories + Product Pulse reporting; visible prompt only after first value and P0 gate approval |
| `WU-JOURNEY-001B` | Roman Urdu Resilience & Code-Switching Benchmark | **Planned benchmark** — fixture corpus covers spelling variants, names/numbers, mixed Latin tokens, passage formatting and recovery before any production transliteration change |
| `WU-JOURNEY-001C` | Messaging, Social, Copy & Card Outcome Continuity | **Planned / Card-gated** — distinguishes WhatsApp message text from Status/image; reuses existing Voice/Copy/social/Card paths; dedicated message route requires evidence |
| `WU-JOURNEY-001D` | School, Formal & Everyday Writing Jobs | **Planned / evidence-gated** — extends the shipped 12-template/document journey around missing essay/speech/story/summary/assignment jobs; no thin template-page expansion |
| `WU-JOURNEY-001E` | Typing Practice Career & Test Pathway | **Planned evidence experiment** — positions the already-shipped WPM/practice product around credible job/test intent without rebuilding a second typing-test engine or claiming official affiliation |
| `WU-JOURNEY-001F` | Professional Print, Word, PDF & InPage Journey | **Planned / evidence-gated** — starts with current Nastaliq/raster-PDF fidelity benchmark, then connects Rich Editor, exports, Cleaner and existing InPage conversion into a specialist workflow |
| `WU-JOURNEY-001G` | Dual-Script Confidence Companion | **Hold / evidence-gated experiment** — optional `Show what I typed` Roman-source companion for less-confident Urdu-script readers; actual source only, no reverse-transliteration guess |
| `WU-RW-001` | Role-owned direct workspaces | **Active** — product architecture boundary |
| `WU-PLAT-002` | V2 Product Journey & Workspace Handoffs | **Implemented core / acceptance pending** — A–G shipped; H is now the evidence-backed core activation/usability closeout |
| `WU-PLAT-002H` | Core Activation & Feature Discovery Acceptance | **Active / P0 roadmap gate** — first value, adaptive Basic Writer, **reopened mobile editor visibility/keyboard acceptance**, contextual continuation, growth CTA arbitration, referral continuity and Card completion; the 2026-09-06 conversion-repair child now sequences measurement → transport → arbitration → experiments |
| `WU-PLAT-003` | Core Workspace Convergence | **Active** |
| `WU-PLAT-004` | Basic Writer Adaptive Command Surface | **Active / revised** — persistent pre-value command wall superseded; implementation follows `WU-PLAT-002H` state model; mobile first-screen acceptance is reopened under the 2026-09-03 repair contract |
| `WU-PLAT-004A` | Basic Writer Public Share Short Link | **Active** — public-share command behavior remains, but prompt timing/discovery is governed by `WU-PLAT-002H` |
| `WU-SEO-CTR-001` | SERP CTR and intent optimization | **Active** — evidence-gated metadata/CTR work; coordinates with mobile/first-screen activation without destabilizing query ownership |
| `WU-TOOLS-EXPANSION-001` | Browser-first Urdu Tools Program | **Active umbrella** — implemented children are archived; new breadth is paused behind core activation evidence |
| `WU-TOOLS-EXPANSION-006` | Urdu/Hindi Script Converter R&D | **Hold** — correctly unbuilt |
| `WU-API-001` | InPage↔Unicode Developer API & npm Package | **Planned — founder-directed exception to the P0.1 freeze** — isolated, additive-only wrapper around the already-shipped `WU-TOOLS-EXPANSION-005` engine; Phase A (npm package) has no compute/infra cost and ships first, Phase B (beta API) follows |

## Current P0 product/UX programme

`WU-PLAT-002H` is the current roadmap gate before another major unrelated feature. Its supporting execution set is:

- [`WU-PLAT-002H-core-activation-feature-discovery.md`](WU-PLAT-002H-core-activation-feature-discovery.md) — canonical contract;
- [`WU-PLAT-002H-IMPLEMENTATION-CHECKLIST.md`](WU-PLAT-002H-IMPLEMENTATION-CHECKLIST.md) — ordered execution gates;
- [`WU-PLAT-002H-METRICS-CONTRACT.md`](WU-PLAT-002H-METRICS-CONTRACT.md) — privacy-safe funnels/denominators, tightened on 2026-09-06 after Product Pulse exposed mixed repeatable/unique-path ratios;
- [`WU-PLAT-002H-UX-STATE-MATRIX.md`](WU-PLAT-002H-UX-STATE-MATRIX.md) — E0–E5 visibility/arbitration model;
- [`WU-PLAT-002H-ACCEPTANCE-SCENARIOS.md`](WU-PLAT-002H-ACCEPTANCE-SCENARIOS.md) — browser/manual outcomes;
- [`WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md`](WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md) — **P0 reopened mobile editor-visibility, viewport and software-keyboard repair contract**;
- [`WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md`](WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md) — hard viewport/device/focus/keyboard acceptance for the repair;
- [`WU-PLAT-002H-CONVERSION-REPAIR.md`](WU-PLAT-002H-CONVERSION-REPAIR.md) — **2026-09-06 post-value execution child** sequencing denominator repair, continuation diagnosis, growth-request arbitration, Voice→Keep/account testing, long-form continuation, output prioritization and evidence review;
- [`WU-PLAT-002H-CONVERSION-ACCEPTANCE.md`](WU-PLAT-002H-CONVERSION-ACCEPTANCE.md) — browser/telemetry/state acceptance matrix for that conversion child;
- [`WU-PLAT-002H-DECISION-LOG.md`](WU-PLAT-002H-DECISION-LOG.md) — durable product decisions;
- [`WU-PLAT-002H-SCOPE-FREEZE.md`](WU-PLAT-002H-SCOPE-FREEZE.md) — what waits while activation is open;
- [`WU-SHARE-001R-recipient-start-continuity.md`](WU-SHARE-001R-recipient-start-continuity.md) — focused referral-loop acceptance child;
- [`../docs/WU-CORE-ACTIVATION-EVIDENCE-2026-08-30.md`](../docs/WU-CORE-ACTIVATION-EVIDENCE-2026-08-30.md) — original dated evidence baseline;
- [`../docs/WU-MOBILE-ACTIVATION-EVIDENCE-2026-09-03.md`](../docs/WU-MOBILE-ACTIVATION-EVIDENCE-2026-09-03.md) — fresh Search Console + direct user-feedback evidence reopening mobile acceptance;
- [`../docs/WU-CORE-ACTIVATION-EVIDENCE-2026-09-06.md`](../docs/WU-CORE-ACTIVATION-EVIDENCE-2026-09-06.md) — latest Product Pulse evidence identifying strong in-tool engagement, weak continuation, Voice/account test signal, long-form cohort and denominator-quality blockers;
- [`../skills/core-activation-conversion/SKILL.md`](../skills/core-activation-conversion/SKILL.md) — Claude/Codex-ready ordered execution skill for the conversion child.

These are one programme, not separate feature initiatives. The commercial target remains governed by `WU-GROWTH-001`; `WU-PLAT-002H` must not fabricate an RPM or direct revenue promise.

The 2026-09-03 mobile repair intentionally **does not erase the earlier Gate B implementation history**. The command-wall simplification shipped; the harder mobile discoverability/viewport/keyboard acceptance is a new Gate B2 because direct user feedback demonstrates that the prior broad mobile acceptance was insufficient.

The 2026-09-06 conversion child also **does not restart the mobile redesign**. The current Product Pulse window is too close to the 2026-09-04 B2 release for another broad layout conclusion. Mobile remains under the existing post-release evidence/real-device closeout while conversion work starts with telemetry denominator normalization.

**Heritage exception:** `WU-HERITAGE-001A` is an isolated, ad-free trust/content surface approved on 2026-09-06. It does not modify Basic/Rich/Keyboard first-value UI and therefore does not relax the `WU-PLAT-002H` core-UI freeze. About/home promotion and the dedicated moderated story backend remain separate gated slices.

## Planned Pakistan usage journey programme

The 2026-09-08 Pakistan Urdu usage research and feedback reconciliation are captured in [`../docs/WU-PAKISTAN-URDU-USAGE-GAP-ANALYSIS-2026-09-08.md`](../docs/WU-PAKISTAN-URDU-USAGE-GAP-ANALYSIS-2026-09-08.md). `WU-JOURNEY-001` and children are intentionally **planned behind the active P0 gate**, not permission to restart homepage/core-workspace redesign.

The programme's first principle is reuse: WriteUrdu already ships Roman/direct/Voice input, Rich Editor exports, Card/social makers, writing templates, typing practice and InPage conversion. New work connects these capabilities around destination intent and adds new mechanics only where evidence proves an unmet job.

The feedback review also records two important truth constraints:

- trust copy must remain feature-specific because transliteration, voice, local tools, account storage and public publishing have different processing boundaries;
- professional print work begins with a benchmark of the current browser/Nastaliq/raster-PDF path rather than an assumed HarfBuzz/font rewrite or an unsupported “replace InPage” claim.

## Planned multimodal Urdu input programme

`WU-INPUT-001` records the 2026-09-11 API/traffic research as a single coordination epic rather than five competing tools. Its first principle is **one editable Urdu destination, multiple bounded input modes**.

It intentionally reuses existing ownership:

- Roman resilience: `WU-JOURNEY-001B`;
- typing CTR/query ownership: `WU-SEO-CTR-001`;
- live Voice: `WU-VOICE-PLAT-001`;
- existing OCR route: `/urdu-ocr` / historical `WU-TOOLS-EXPANSION-003`;
- AI correction: `WU-AI-001`;
- document/PDF translation: `WU-DOC-001`.

New gaps such as uploaded audio → Urdu and server-assisted OCR are benchmark-first. Core-UI/public breadth remains behind `WU-PLAT-002H`; planning fixtures/provider research may proceed without relaxing that gate.

## Planned Pakistan everyday billing programme

`WU-BILL-001` records the 2026-09-12 Pakistan small-business billing research as a separate sibling to the shipped professional Invoice Generator. Its canonical MVP route is `/urdu-bill-generator`, with Bill, Cash Memo and Receipt modes plus paid/balance/udhaar and Pakistan-facing payment labels.

The implementation package is:

- [`WU-BILL-001-pakistan-everyday-billing-toolkit.md`](WU-BILL-001-pakistan-everyday-billing-toolkit.md) — parent product/roadmap contract;
- [`WU-BILL-001-ARCHITECTURE-CONTRACT.md`](WU-BILL-001-ARCHITECTURE-CONTRACT.md) — browser-local document/state/rendering boundary;
- [`WU-BILL-001-IMPLEMENTATION-CHECKLIST.md`](WU-BILL-001-IMPLEMENTATION-CHECKLIST.md) — ordered Slice 0–8 execution plan;
- [`WU-BILL-001-ACCEPTANCE-MATRIX.md`](WU-BILL-001-ACCEPTANCE-MATRIX.md) — calculation, RTL/LTR, mobile, privacy, output, SEO and regression acceptance;
- [`../docs/WU-BILL-001-PAKISTAN-BILLING-EVIDENCE-2026-09-12.md`](../docs/WU-BILL-001-PAKISTAN-BILLING-EVIDENCE-2026-09-12.md) — dated evidence ledger;
- [`../skills/wu-bill-001/SKILL.md`](../skills/wu-bill-001/SKILL.md) — canonical Codex/Claude execution skill;
- [`../docs/WU-BILL-001-CODEX-HANDOFF.md`](../docs/WU-BILL-001-CODEX-HANDOFF.md) — ready-to-paste implementation handoff.

The core invariant is that `/urdu-invoice-generator` and archived `WU-IG-001/002/003` behavior remain protected. This is planning/implementation readiness, not an exception to the current `WU-PLAT-002H` roadmap gate.

## Planned Live Urdu Card Gallery programme

`WU-CARD-GALLERY-001` records the founder-approved 2026-09-12 concept for a separate background-first card chooser: the user writes Urdu once, sees that same text live across the background collection, selects the best-looking card, then continues to the existing Card Studio for refinement/export.

The implementation package is:

- [`WU-CARD-GALLERY-001-live-urdu-card-gallery.md`](WU-CARD-GALLERY-001-live-urdu-card-gallery.md) — parent product/roadmap contract;
- [`WU-CARD-GALLERY-001-ARCHITECTURE-CONTRACT.md`](WU-CARD-GALLERY-001-ARCHITECTURE-CONTRACT.md) — shared registry, lightweight DOM preview and handoff boundaries;
- [`WU-CARD-GALLERY-001-IMPLEMENTATION-CHECKLIST.md`](WU-CARD-GALLERY-001-IMPLEMENTATION-CHECKLIST.md) — ordered Slice 0–5 execution plan;
- [`WU-CARD-GALLERY-001-ACCEPTANCE-MATRIX.md`](WU-CARD-GALLERY-001-ACCEPTANCE-MATRIX.md) — text-safety, contrast, mobile, performance, privacy, handoff and receiver-quality acceptance;
- [`../skills/wu-card-gallery-001/SKILL.md`](../skills/wu-card-gallery-001/SKILL.md) — canonical Codex/Claude execution skill;
- [`../docs/WU-CARD-GALLERY-001-CODEX-HANDOFF.md`](../docs/WU-CARD-GALLERY-001-CODEX-HANDOFF.md) — ready-to-paste Codex prompt.

The hard architecture rule is that live browsing uses lightweight DOM previews rather than one Card Studio canvas per design. Existing background IDs remain intact, background metadata becomes a shared registry, and `/urdu-card-studio` remains the authoritative advanced editor/export path. Slice 0 planning/registry work is ready; public route rollout remains behind the current Card Studio completion/P0 gate unless the canonical backlog records an explicit exception.

## Archived contracts

Completed implementation slices and superseded contracts were moved on **2026-08-30** to keep the active directory honest and navigable.

- [`archive/implemented/`](archive/implemented/) — fully implemented feature/slice contracts whose shipped state is already summarized above or in the owning parent spec.
- [`archive/superseded/`](archive/superseded/) — contracts absorbed by later product/SEO architecture.
- [`archive/snapshots/`](archive/snapshots/) — pre-reconciliation governance snapshots retained for historical traceability.
- [`archive/README.md`](archive/README.md) — archive policy and manifest.

Archiving is **not deletion**. Archived specs remain useful when investigating why code was built a certain way, but they do not compete with current roadmap work. For current behaviour, inspect the implementation and tests first.

## Status vocabulary

Use only these states for active feature governance:

- **Active** — an ongoing control plane or currently executed feature.
- **Implemented** — complete; normally archive the detailed implementation contract once its summary is retained.
- **Implemented core / acceptance pending** — substantial implementation exists but a real acceptance, external or rollout gate remains.
- **Planned** — approved work with a real roadmap slot.
- **Hold** — valid idea requiring evidence or a dependency before scheduling.
- **Superseded** — absorbed by a later contract; archive it.

## Grooming rule

A merged implementation must update code/tests **and** its owning status summary. When a contract reaches `Implemented` and no live acceptance/growth decision remains, move the detailed spec to `archive/implemented/` in the same or next grooming pass. Do not keep completed slice files in the active root merely as historical evidence.

While `WU-PLAT-002H` is active, any major core-UI PR must cite the relevant hypothesis/state/metric and identify what existing UI is removed or demoted; a proposal that only adds another control/promo layer should not pass review.