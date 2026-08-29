# Write Urdu feature specifications

Feature work is tracked with stable IDs so implementation, tests and future product feedback can refer to the same contract.

**Priority and build order live in [`specs/BACKLOG.md`](BACKLOG.md).** This file is the feature-spec registry; it is not the roadmap.

| ID | Feature | Route | Status |
| --- | --- | --- | --- |
| `WU-GROWTH-001` | Search Console + AdSense Growth System | Sitewide | Active — mature-domain authority/growth control plane |
| `WU-GROWTH-002` | Account Save + Share Entry Points | `/`, `/urdu-editor`, `/urdu-keyboard`, `/tools/urdu-voice-typing` | Active — compact account conversion + ungated share loop implementation |
| `WU-GROWTH-003` | Urdu Voice Typing Growth & SEO | `/tools/urdu-voice-typing`, `/urdu/tools/urdu-voice-typing` | Active — Slices A/B/C/E shipped (PR #114); Slice D correctly held on Search Console evidence gate |
| `WU-COMMUNITY-001` | Moderated Urdu Writing Publishing / Urdu Writers | `/urdu-writers`, `/urdu-writers/:slug`, `/my-publications`, `/community-guidelines`, Product OS moderation | Implemented core / acceptance pending — Slices A-E (submission API, editor prompt/manual publish UX, Product OS moderation, public SSR reader, `/my-publications` dashboard/revisions/withdrawal) and F (category indexing threshold, `/community-guidelines`, privacy/terms reconciliation, ad classification, telemetry allowlist + reading-pulse rollup, OS operational pulse, robots/sitemap discovery) shipped and test-covered; production live behind `COMMUNITY_SUBMISSIONS_ENABLED=true`; `COMMUNITY_PUBLIC_ENABLED` stays off by product choice (staged rollout, spec §14 Stage 3), so `/urdu-writers` itself is still not in site nav/robots discovery; legal review of guidelines/terms wording and production toggling of the rollback flags remain open, human steps |
| `WU-VOICE-PLAT-001` | Unified Urdu Input Platform | Eligible Write/Create workspaces sitewide | Implemented core / acceptance pending — Slices A (shared engine), B (core writing) and C (Card Studio/WhatsApp/Instagram/Stylish/Name Art) shipped and green; Slice D (growth/measurement) still planned |
| `WU-I18N-001` | Crawlable Urdu Locale | `/urdu/*` with eight-route Phase 1 corpus | Implemented core — Phase 1 (Slices A hreflang/canonical, B/C content-QA) shipped and live at `/urdu/*` (PR #101/#102); 001D full-product expansion remains Planned, gated on Phase 1 evidence |
| `WU-SHARE-001` | Public Share Pages & Viral Publishing Loop | `/urdu-card-studio`, `/`, `/s/:id`, `/api/shares*` | Active — first-party short-link loop proven in Card Studio and extending to Basic Writer |
| `WU-ACCOUNT-001` | Account, Documents & Collaboration Platform Boundary | Account/document platform | Active boundary — child specs `WU-AUTH-001` and `WU-DRAFT-001` are implemented core; collaboration/teams/social remain separately gated, not started |
| `WU-AUTH-001` | Optional social authentication foundation | `/sign-in`, `/api/auth/*`, `/api/me`, shared header | Implemented core / acceptance pending — Google + Facebook providers live in code (`functions/lib/auth.mjs`, reusing `METRICS_DB`); Facebook pending production app registration + secrets |
| `WU-DRAFT-001` | My Documents: cross-device account-backed writing | Core writing editors, `/my-documents`, `/api/documents*` | Implemented core / acceptance pending — browser-local first, explicit account save shipped in `METRICS_DB` (PR #83: `functions/lib/documents.mjs`, `js/my-documents-ui.mjs`, conflict handling, 5 contract test files) |
| `WU-DOC-001` | English to Urdu Document Translator | `/tools/english-to-urdu-document-translator` | Planned — founder-approved; PDF/DOCX/TXT → clean editable Urdu, Cloudflare-native foundation, scanned/layout expansion gated. Note: `functions/api/document-translate.js` ships a small TXT-only preview slice, not the Slice A contract |
| `WU-AI-001` | Urdu AI Writing Assistant Platform | `/`, `/urdu-editor`, `/urdu-keyboard`; no dedicated SEO route in Phase 1 | Implemented core / acceptance pending — Slices A-C built and test-covered (`functions/api/ai-writing.js`, `js/ai-writing-assistant.js`); kept behind `AI_WRITING_ENABLED` kill switch in production pending Gate A/B provider-terms/ZDR closure (Mistral only, still Free plan); Slices D-G not started |
| `WU-TPL-001` | Urdu Writing Templates | `/urdu-writing-templates`, `/urdu/urdu-writing-templates` | Implemented — 12 reviewed AI-free writing starters, bilingual search launch, locale-preserving editor handoffs and bounded usage measurement |
| `WU-RW-001` | Role-owned direct workspaces | Writing + creation role routes | Active — one top-level editor/canvas per role; remove nested WriteUrdu app/iframe architecture |
| `WU-PLAT-001` | Unified product journey and acquisition-first homepage | `/` and related tools | Implemented — foundation complete |
| `WU-PLAT-002` | V2 Product Journey & Workspace Handoffs | Sitewide interactive journeys | Implemented core / acceptance pending — Slices A–G (registry, handoff runtime, outcome-led IA, core/capture continuity, create/publish boundaries) shipped and green; Slice H task-finding/usability validation pass is the open item |
| `WU-PLAT-003` | Core Workspace Convergence | `/`, `/urdu-keyboard`, `/urdu-editor` plus shared taxonomy/help surfaces | Active — P0 canvas-first convergence of legacy core workspaces into the task-first V2 product model |
| `WU-PLAT-004` | Basic Writer Command Toolbar | `/` | Active — share-first command surface implemented; production convergence follow-up active |
| `WU-PLAT-004A` | Basic Writer Public Share Short Link | `/`, `/s/:id`, `/api/shares*` | Active — P0 hotfix; primary toolbar Share publishes explicit Write-Urdu short links |
| `WU-SEO-ETU-001` | English to Urdu Typing acquisition | `/` | Implemented — homepage owns English-letter / Roman Urdu to Urdu-script typing intent |
| `WU-SEO-CTR-001` | SERP CTR and intent optimization | `/`, `/urdu-keyboard` | Active — Phase 1 intent/measurement foundation; metadata experiment evidence-gated |
| `WU-SEO-CRAWL-001` | Public Copy & Static Crawlability | Sitewide public/indexable routes | Implemented — Slices A-D (public language cleanup, static internal-link shell, static SEO graph, static collection content) complete and merged (PR #124-128, closeout PR #135/#136); 70/70 contract tests pass; production source-view spot check outstanding |
| `WU-CS-UX-001` | Urdu Card Studio guided workflow | `/urdu-card-studio` | Implemented — v2 creation hierarchy migrated in PR #20 |
| `WU-CS-UX-002` | Urdu Card Studio empty-state guidance | `/urdu-card-studio` | Implemented — retained through v2 creation migration |
| `WU-SEO-CS-001` | Card Studio SEO acquisition | `/urdu-card-studio`, `/how-to-write-urdu-on-photo` | Implemented — Card Studio owns Urdu text/poetry-on-photo acquisition cluster |
| `WU-SEO-STYLISH-001` | Stylish Urdu Text acquisition | `/stylish-urdu-text-generator` | Implemented — owner route strengthened for copyable Urdu name/text style intent |
| `WU-SEO-NAMEART-001` | Urdu Name Art acquisition | `/urdu-name-art-maker` | Implemented — focused owner for Urdu name image, DP/profile and exact-font image intent |
| `WU-SM-001` | WhatsApp Status and Instagram Makers | `/urdu-whatsapp-status-maker`, `/urdu-instagram-post-maker` | Implemented — v2 creation hierarchy migrated in PR #26 |
| `WU-SUA-001` | Stylish Urdu Text and Name Art Studio | `/stylish-urdu-text-generator`, `/urdu-name-art-maker` | Implemented — acceptance closed and v2 creation hierarchy migrated in PR #25 |
| `WU-IG-001` | Urdu / English Invoice Generator | `/urdu-invoice-generator` | Implemented — strategy review before v2 migration |
| `WU-IG-002` | Invoice visual polish and adaptive layout | `/urdu-invoice-generator` | Implemented — follows invoice strategy decision |
| `WU-IG-003` | Invoice refinement v1.2 | `/urdu-invoice-generator` | Implemented — follows invoice strategy decision |
| `WU-SEO-001` | New-tool marketing and SEO launch | Sitewide | Superseded — absorbed by `WU-PLAT-001`, SEO-A1 and `WU-GROWTH-001` |
| `WU-TOOLS-EXPANSION-001` | Browser-first Urdu Tools Program (umbrella) | Sitewide tools | Active — umbrella contract; see child specs 002-006 below |
| `WU-TOOLS-EXPANSION-002` | Urdu Text Cleaner / RTL Fixer | `/urdu-text-cleaner` | Implemented — `urdu-text-cleaner.html`, `tests/urdu-text-cleaner-core.test.js` |
| `WU-TOOLS-EXPANSION-003` | Urdu OCR | `/urdu-ocr` | Implemented — MVP shipped, `js/urdu-ocr.js`, `tests/urdu-ocr-contract.test.js` |
| `WU-TOOLS-EXPANSION-004` | Urdu Voice Typing (engine/quality contract) | `/tools/urdu-voice-typing` | Implemented — see `WU-GROWTH-003`/`WU-VOICE-PLAT-001` for acquisition and cross-workspace layers |
| `WU-TOOLS-EXPANSION-005` | In-page Unicode Converter | `/tools/inpage-unicode-converter` | Implemented |
| `WU-TOOLS-EXPANSION-006` | Urdu/Hindi Script Converter R&D | Not yet routed | Hold — R&D only, correctly unbuilt |
| `WU-TRUST-002` | Contact & Feedback | `/contact` | Implemented — `contact.html`, `functions/api/messages.js` |
| `WU-CHANGELOG-001` | Customer-facing Product Updates | `/changelog` | Implemented — `changelog.html`, `tests/changelog-contract.test.js` |
| `WU-ANALYTICS-001` | Privacy-safe Product Telemetry | Sitewide | Implemented — `functions/api/events.js`, `migrations/0002_product_telemetry_rollups.sql` |
| `WU-ANALYTICS-002` | Rollups and Creation-tool Coverage | Sitewide | Implemented |
| `WU-ANALYTICS-003` | Acquisition and Returning Signal | Sitewide | Implemented core — acquisition signal (Phase A) live, `js/acquisition-telemetry.js`; returning-visitor Phase B correctly still gated/unbuilt |

## Status vocabulary

Use only these states for feature governance:

- **Active** — an ongoing control plane or currently executed feature.
- **Implemented** — feature contract is complete; later visual migration does not reopen the feature.
- **Implemented core — acceptance pending** — substantial implementation exists but the spec checklist has not been fully closed.
- **Planned** — approved work with a real roadmap slot.
- **Hold** — valid idea requiring evidence or a dependency before scheduling.
- **Superseded** — requirements were absorbed by a later implementation/spec and should not compete for roadmap priority.

New specifications should use the `WU-<AREA>-<NUMBER>` format and include route, scope, state/data contract, acceptance criteria, implementation map and verification commands. A new spec is not automatically a priority: it enters `specs/BACKLOG.md` only after its user value, route ownership, commercial rationale and dependencies are clear.