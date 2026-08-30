# Write Urdu feature specifications

Feature work uses stable `WU-<AREA>-<NUMBER>` IDs. The **runtime code and regression tests are the source of truth for shipped behaviour**; this directory owns only living product contracts and forward-looking acceptance work.

**Priority and sequence live in [`BACKLOG.md`](BACKLOG.md).** Historical implementation contracts live in [`archive/`](archive/README.md) and must not be treated as backlog work.

## Active / forward-looking contracts

| ID | Feature | Status / remaining reason to stay active |
| --- | --- | --- |
| `WU-GROWTH-001` | Search Console + AdSense Growth System | **Active** — commercial control plane; AdSense account baseline/exclusions and authority map remain open |
| `WU-GROWTH-002` | Account Save + Share Entry Points | **Active** — account conversion/share loop remains an ongoing growth surface |
| `WU-GROWTH-003` | Urdu Voice Typing Growth & SEO | **Active** — A/B/C/E shipped; evidence-gated Slice D growth expansion remains open |
| `WU-COMMUNITY-001` | Moderated Urdu Writing Publishing / Urdu Writers | **Implemented core / acceptance pending** — A–F shipped; staged public rollout, legal wording review and production flag decisions remain human/product gates |
| `WU-VOICE-PLAT-001` | Unified Urdu Input Platform | **Implemented core / acceptance pending** — A/B/C and functional D code shipped; only non-code demonstration/acceptance work remains |
| `WU-VOICE-PLAT-001D` | Voice growth & measurement closure | **Active acceptance slice** — functional telemetry/reporting shipped; short-form demonstration assets remain open |
| `WU-I18N-001` | Crawlable Urdu Locale | **Implemented core** — Phase 1 A/B/C shipped; full-product expansion remains gated |
| `WU-I18N-001D` | Full Urdu Product Expansion | **Planned / evidence-gated** — intentionally unbuilt |
| `WU-SHARE-001` | Public Share Pages & Viral Publishing Loop | **Active** — core loop is shipped; remains an ongoing distribution/growth contract |
| `WU-ACCOUNT-001` | Account, Documents & Collaboration Platform Boundary | **Active boundary** — auth/drafts core shipped; collaboration/teams/social remain separately gated |
| `WU-AUTH-001` | Optional social authentication foundation | **Implemented core / acceptance pending** — provider code exists; Facebook production registration/secrets remain external acceptance work |
| `WU-DRAFT-001` | My Documents / cross-device account-backed writing | **Implemented core / acceptance pending** — shipped; acceptance checklist remains open |
| `WU-DOC-001` | English to Urdu Document Translator | **Planned** — current TXT preview is not the approved Slice A contract |
| `WU-DOC-001A` | Document ingestion + translation foundation | **Planned** |
| `WU-DOC-001B` | Document workspace + handoffs | **Planned** |
| `WU-DOC-001C` | Document growth/SEO/measurement | **Planned** |
| `WU-DOC-001D` | Scanned/image/layout R&D | **Hold / gated R&D** |
| `WU-AI-001` | Urdu AI Writing Assistant Platform | **Implemented core / acceptance pending** — A–C built/tested; provider-terms gate blocks production enablement; D–G are evidence-gated |
| `WU-ANALYTICS-003` | Acquisition and Returning Signal | **Implemented core** — acquisition signal shipped; returning-visitor phase remains intentionally gated |
| `WU-RW-001` | Role-owned direct workspaces | **Active** — product architecture boundary |
| `WU-PLAT-002` | V2 Product Journey & Workspace Handoffs | **Implemented core / acceptance pending** — A–G shipped; real task-finding/usability validation is the remaining closeout |
| `WU-PLAT-003` | Core Workspace Convergence | **Active** |
| `WU-PLAT-004` | Basic Writer Command Toolbar | **Active** — production convergence follow-up |
| `WU-PLAT-004A` | Basic Writer Public Share Short Link | **Active** — share-first toolbar contract |
| `WU-SEO-CTR-001` | SERP CTR and intent optimization | **Active** — evidence-gated metadata/CTR work |
| `WU-TOOLS-EXPANSION-001` | Browser-first Urdu Tools Program | **Active umbrella** — implemented children are archived; Hindi converter remains Hold |
| `WU-TOOLS-EXPANSION-006` | Urdu/Hindi Script Converter R&D | **Hold** — correctly unbuilt |

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
