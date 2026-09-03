# Write Urdu feature specifications

Feature work uses stable `WU-<AREA>-<NUMBER>` IDs. The **runtime code and regression tests are the source of truth for shipped behaviour**; this directory owns only living product contracts and forward-looking acceptance work.

**Priority and sequence live in [`BACKLOG.md`](BACKLOG.md).** Historical implementation contracts live in [`archive/`](archive/README.md) and must not be treated as backlog work.

## Active / forward-looking contracts

| ID | Feature | Status / remaining reason to stay active |
| --- | --- | --- |
| `WU-GROWTH-001` | Search Console + AdSense Growth System | **Active** — commercial control plane; current AdSense baseline/exclusions and authority/revenue map remain open |
| `WU-GROWTH-002` | Account Save + Share Entry Points | **Active** — account/save/share behavior now uses value-triggered, single-growth-request arbitration governed by `WU-PLAT-002H` |
| `WU-GROWTH-003` | Urdu Voice Typing Growth & SEO | **Active** — A/B/C/E shipped; evidence-gated Slice D expansion remains open; activation discovery is governed by `WU-PLAT-002H` |
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
| `WU-ANALYTICS-003` | Acquisition and Returning Signal | **Implemented core** — acquisition signal shipped; `WU-PLAT-002H` adds first-value/continuation acceptance requirements using the approved telemetry boundary |
| `WU-RW-001` | Role-owned direct workspaces | **Active** — product architecture boundary |
| `WU-PLAT-002` | V2 Product Journey & Workspace Handoffs | **Implemented core / acceptance pending** — A–G shipped; H is now the evidence-backed core activation/usability closeout |
| `WU-PLAT-002H` | Core Activation & Feature Discovery Acceptance | **Active / P0 roadmap gate** — first value, adaptive Basic Writer, **reopened mobile editor visibility/keyboard acceptance**, contextual continuation, growth CTA arbitration, referral continuity and Card completion |
| `WU-PLAT-003` | Core Workspace Convergence | **Active** |
| `WU-PLAT-004` | Basic Writer Adaptive Command Surface | **Active / revised** — persistent pre-value command wall superseded; implementation follows `WU-PLAT-002H` state model; mobile first-screen acceptance is reopened under the 2026-09-03 repair contract |
| `WU-PLAT-004A` | Basic Writer Public Share Short Link | **Active** — public-share command behavior remains, but prompt timing/discovery is governed by `WU-PLAT-002H` |
| `WU-SEO-CTR-001` | SERP CTR and intent optimization | **Active** — evidence-gated metadata/CTR work; coordinates with mobile/first-screen activation without destabilizing query ownership |
| `WU-TOOLS-EXPANSION-001` | Browser-first Urdu Tools Program | **Active umbrella** — implemented children are archived; new breadth is paused behind core activation evidence |
| `WU-TOOLS-EXPANSION-006` | Urdu/Hindi Script Converter R&D | **Hold** — correctly unbuilt |

## Current P0 product/UX programme

`WU-PLAT-002H` is the current roadmap gate before another major unrelated feature. Its supporting execution set is:

- [`WU-PLAT-002H-core-activation-feature-discovery.md`](WU-PLAT-002H-core-activation-feature-discovery.md) — canonical contract;
- [`WU-PLAT-002H-IMPLEMENTATION-CHECKLIST.md`](WU-PLAT-002H-IMPLEMENTATION-CHECKLIST.md) — ordered execution gates;
- [`WU-PLAT-002H-METRICS-CONTRACT.md`](WU-PLAT-002H-METRICS-CONTRACT.md) — privacy-safe funnels/denominators;
- [`WU-PLAT-002H-UX-STATE-MATRIX.md`](WU-PLAT-002H-UX-STATE-MATRIX.md) — E0–E5 visibility/arbitration model;
- [`WU-PLAT-002H-ACCEPTANCE-SCENARIOS.md`](WU-PLAT-002H-ACCEPTANCE-SCENARIOS.md) — browser/manual outcomes;
- [`WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md`](WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md) — **P0 reopened mobile editor-visibility, viewport and software-keyboard repair contract**;
- [`WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md`](WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md) — hard viewport/device/focus/keyboard acceptance for the repair;
- [`WU-PLAT-002H-DECISION-LOG.md`](WU-PLAT-002H-DECISION-LOG.md) — durable product decisions;
- [`WU-PLAT-002H-SCOPE-FREEZE.md`](WU-PLAT-002H-SCOPE-FREEZE.md) — what waits while activation is open;
- [`WU-SHARE-001R-recipient-start-continuity.md`](WU-SHARE-001R-recipient-start-continuity.md) — focused referral-loop acceptance child;
- [`../docs/WU-CORE-ACTIVATION-EVIDENCE-2026-08-30.md`](../docs/WU-CORE-ACTIVATION-EVIDENCE-2026-08-30.md) — original dated evidence baseline;
- [`../docs/WU-MOBILE-ACTIVATION-EVIDENCE-2026-09-03.md`](../docs/WU-MOBILE-ACTIVATION-EVIDENCE-2026-09-03.md) — fresh Search Console + direct user-feedback evidence reopening mobile acceptance.

These are one programme, not separate feature initiatives. The commercial target remains governed by `WU-GROWTH-001`; `WU-PLAT-002H` must not fabricate an RPM or direct revenue promise.

The 2026-09-03 mobile repair intentionally **does not erase the earlier Gate B implementation history**. The command-wall simplification shipped; the harder mobile discoverability/viewport/keyboard acceptance is a new Gate B2 because direct user feedback demonstrates that the prior broad mobile acceptance was insufficient.

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