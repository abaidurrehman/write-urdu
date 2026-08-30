# Write Urdu specs archive

**Created:** 2026-08-30  
**Purpose:** Preserve implementation history without letting finished work compete with the live roadmap.

## How to use this archive

Use this order when resolving a question about current product behaviour:

1. **Runtime code and regression tests** — authoritative for what is shipped.
2. **Active specs in `specs/`** — authoritative for open contracts, gates and future work.
3. **`specs/README.md`** — concise current status registry.
4. **This archive** — historical implementation intent and decisions.

An archived spec is not deleted and is not automatically obsolete. It is simply no longer an active implementation contract. Reopen work only through a new/current active contract if the shipped behaviour needs to change.

## Why these files moved

The 2026-08-30 reconciliation found a recurring pattern: parent registries correctly described features as implemented, while the detailed child/implementation specs still sat in the active root and looked like pending work. The long backlog also retained many completed P0/P1 checklists. This archive separates **history** from **work still to do**.

## Implemented contracts

### Community publishing — shipped slices A–F

Owned going forward by active [`../WU-COMMUNITY-001-moderated-urdu-writing-publishing.md`](../WU-COMMUNITY-001-moderated-urdu-writing-publishing.md). Code shipped in commits `b720ee2` (A–E) and `8f8ddcd` (F).

- [`WU-COMMUNITY-001A-submission-data-api.md`](implemented/WU-COMMUNITY-001A-submission-data-api.md)
- [`WU-COMMUNITY-001B-editor-prompt-submission-ux.md`](implemented/WU-COMMUNITY-001B-editor-prompt-submission-ux.md)
- [`WU-COMMUNITY-001C-os-moderation-publishing.md`](implemented/WU-COMMUNITY-001C-os-moderation-publishing.md)
- [`WU-COMMUNITY-001D-public-reader-seo-reporting.md`](implemented/WU-COMMUNITY-001D-public-reader-seo-reporting.md)
- [`WU-COMMUNITY-001E-my-publications-revisions-withdrawal.md`](implemented/WU-COMMUNITY-001E-my-publications-revisions-withdrawal.md)
- [`WU-COMMUNITY-001F-taxonomy-guidelines-launch-closure.md`](implemented/WU-COMMUNITY-001F-taxonomy-guidelines-launch-closure.md)

### Unified Urdu input — shipped slices A–C

Owned by active [`../WU-VOICE-PLAT-001-unified-urdu-input-platform.md`](../WU-VOICE-PLAT-001-unified-urdu-input-platform.md); remaining non-code closeout stays in `WU-VOICE-PLAT-001D`.

- [`WU-VOICE-PLAT-001A-shared-input-engine.md`](implemented/WU-VOICE-PLAT-001A-shared-input-engine.md)
- [`WU-VOICE-PLAT-001B-core-writing-rollout.md`](implemented/WU-VOICE-PLAT-001B-core-writing-rollout.md)
- [`WU-VOICE-PLAT-001C-create-social-rollout.md`](implemented/WU-VOICE-PLAT-001C-create-social-rollout.md)

### Urdu locale — Phase 1 shipped slices A–C

Owned by active [`../WU-I18N-001-crawlable-urdu-locale.md`](../WU-I18N-001-crawlable-urdu-locale.md); expansion remains in `WU-I18N-001D`.

- [`WU-I18N-001A-locale-routing-static-generation.md`](implemented/WU-I18N-001A-locale-routing-static-generation.md)
- [`WU-I18N-001B-urdu-seo-hreflang-sitemaps.md`](implemented/WU-I18N-001B-urdu-seo-hreflang-sitemaps.md)
- [`WU-I18N-001C-phase1-urdu-content-qa-measurement.md`](implemented/WU-I18N-001C-phase1-urdu-content-qa-measurement.md)

### Voice acquisition — shipped launch slices

Owned by active [`../WU-GROWTH-003-urdu-voice-typing-growth-seo.md`](../WU-GROWTH-003-urdu-voice-typing-growth-seo.md).

- [`WU-GROWTH-003A-voice-discovery-launch.md`](implemented/WU-GROWTH-003A-voice-discovery-launch.md)
- [`WU-GROWTH-003B1-homepage-voice-discovery.md`](implemented/WU-GROWTH-003B1-homepage-voice-discovery.md)

### Public copy / crawlability — completed family

The parent and A–D implementation slices are complete. Production source-view verification remains an operational backlog item, not a reason to keep the implementation specs active.

- [`WU-SEO-CRAWL-001-public-copy-static-crawlability.md`](implemented/WU-SEO-CRAWL-001-public-copy-static-crawlability.md)
- [`WU-SEO-CRAWL-001A-public-language-cleanup.md`](implemented/WU-SEO-CRAWL-001A-public-language-cleanup.md)
- [`WU-SEO-CRAWL-001B-static-internal-link-shell.md`](implemented/WU-SEO-CRAWL-001B-static-internal-link-shell.md)
- [`WU-SEO-CRAWL-001C-static-seo-graph.md`](implemented/WU-SEO-CRAWL-001C-static-seo-graph.md)
- [`WU-SEO-CRAWL-001D-static-collection-content.md`](implemented/WU-SEO-CRAWL-001D-static-collection-content.md)

### Browser-first tools — implemented children

Owned by active umbrella [`../WU-TOOLS-EXPANSION-001-browser-first-urdu-tools-program.md`](../WU-TOOLS-EXPANSION-001-browser-first-urdu-tools-program.md). The Hindi converter (`006`) remains active-root Hold/R&D.

- [`WU-TOOLS-EXPANSION-002-urdu-text-cleaner-rtl-fixer.md`](implemented/WU-TOOLS-EXPANSION-002-urdu-text-cleaner-rtl-fixer.md)
- [`WU-TOOLS-EXPANSION-003-urdu-ocr.md`](implemented/WU-TOOLS-EXPANSION-003-urdu-ocr.md)
- [`WU-TOOLS-EXPANSION-004-urdu-voice-typing.md`](implemented/WU-TOOLS-EXPANSION-004-urdu-voice-typing.md) — historical speech-behaviour contract; active voice parents still rely on the shipped code/tests it produced.
- [`WU-TOOLS-EXPANSION-005-inpage-unicode-converter.md`](implemented/WU-TOOLS-EXPANSION-005-inpage-unicode-converter.md)

### Completed standalone product / acquisition contracts

- [`WU-ANALYTICS-001-privacy-safe-product-telemetry.md`](implemented/WU-ANALYTICS-001-privacy-safe-product-telemetry.md)
- [`WU-ANALYTICS-002-rollups-and-creation-tool-coverage.md`](implemented/WU-ANALYTICS-002-rollups-and-creation-tool-coverage.md)
- [`WU-CHANGELOG-001-customer-facing-product-updates.md`](implemented/WU-CHANGELOG-001-customer-facing-product-updates.md)
- [`WU-CS-UX-001-card-studio-guided-workflow.md`](implemented/WU-CS-UX-001-card-studio-guided-workflow.md)
- [`WU-CS-UX-002-card-studio-empty-state-guidance.md`](implemented/WU-CS-UX-002-card-studio-empty-state-guidance.md)
- [`WU-IG-001-urdu-invoice-generator.md`](implemented/WU-IG-001-urdu-invoice-generator.md)
- [`WU-IG-002-invoice-visual-polish-adaptive-layout.md`](implemented/WU-IG-002-invoice-visual-polish-adaptive-layout.md)
- [`WU-IG-003-invoice-refinement-v12.md`](implemented/WU-IG-003-invoice-refinement-v12.md)
- [`WU-PLAT-001-unified-product-journey.md`](implemented/WU-PLAT-001-unified-product-journey.md)
- [`WU-SEO-CS-001-card-studio-acquisition.md`](implemented/WU-SEO-CS-001-card-studio-acquisition.md)
- [`WU-SEO-ETU-001-english-to-urdu-typing-acquisition.md`](implemented/WU-SEO-ETU-001-english-to-urdu-typing-acquisition.md)
- [`WU-SEO-NAMEART-001-name-art-acquisition.md`](implemented/WU-SEO-NAMEART-001-name-art-acquisition.md)
- [`WU-SEO-STYLISH-001-stylish-urdu-acquisition.md`](implemented/WU-SEO-STYLISH-001-stylish-urdu-acquisition.md)
- [`WU-SM-001-social-status-and-instagram-makers.md`](implemented/WU-SM-001-social-status-and-instagram-makers.md)
- [`WU-SUA-001-stylish-urdu-text-name-art.md`](implemented/WU-SUA-001-stylish-urdu-text-name-art.md)
- [`WU-TPL-001-urdu-writing-templates.md`](implemented/WU-TPL-001-urdu-writing-templates.md)
- [`WU-TRUST-002-contact-feedback.md`](implemented/WU-TRUST-002-contact-feedback.md)

## Superseded contracts

- [`WU-SEO-001-new-tool-marketing-and-seo.md`](superseded/WU-SEO-001-new-tool-marketing-and-seo.md) — absorbed by `WU-PLAT-001`, the later SEO acquisition owners and `WU-GROWTH-001`.

## Governance snapshots

These are intentionally frozen copies, not active specifications:

- [`BACKLOG-2026-08-30-pre-reconciliation.md`](snapshots/BACKLOG-2026-08-30-pre-reconciliation.md) — the 47KB backlog before completed work was removed from the active queue.
- `WU-COMMUNITY-001-2026-08-30-pre-reconciliation.md` — original parent before its stale Planned header was reconciled.
- `WU-VOICE-PLAT-001-2026-08-30-pre-reconciliation.md` — original parent before shipped slices were reconciled.
- `WU-TOOLS-EXPANSION-001-2026-08-30-pre-reconciliation.md` — original umbrella before child implementation states were reconciled.

## Future archive rule

Archive a detailed spec when all of the following are true:

- its implementation contract is shipped;
- code/tests contain the enduring behaviour;
- no real product/acceptance/evidence gate remains in that file;
- the durable status and any remaining follow-up are represented by an active parent, `specs/README.md`, or `BACKLOG.md`.

Do **not** archive merely because a file is old. Planned, Hold and genuine acceptance contracts remain active even when most code already exists.
