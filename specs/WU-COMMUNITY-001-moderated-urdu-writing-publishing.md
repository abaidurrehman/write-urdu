# WU-COMMUNITY-001 — Moderated Urdu Writing Publishing

**Status:** Implemented core / acceptance pending  
**Reconciled:** 2026-08-30 against shipped code and commits `b720ee2` + `8f8ddcd`  
**Area:** Community publishing / writer identity / moderated UGC / organic growth  
**Primary public route:** `/urdu-writers`  
**Public detail route:** `/urdu-writers/:slug`  
**Private route:** `/my-publications` plus editor submission entry points  
**Internal surface:** Product OS moderation  
**Depends on:** `WU-AUTH-001`, `WU-DRAFT-001`

## Current product contract

WriteUrdu can accept signed-in writers' Urdu work, place it in a human moderation queue, publish approved writing to public server-rendered reader pages, let readers report concerns, and let writers revise or withdraw their own publications.

This is no longer a Planned build. The implementation slices A–F are shipped and test-covered. What remains is staged-launch acceptance and human/product decisions.

## Shipped

- owner-only submission data/API and moderation state model;
- editor prompt + explicit manual publish flow;
- Product OS moderation queue with approve/reject/unpublish operations;
- public SSR hub/detail/category reading surfaces and report flow;
- `/my-publications` dashboard, revision submission and writer withdrawal;
- bounded taxonomy/category indexing rules;
- `/community-guidelines` and privacy/terms reconciliation;
- community route ad classification;
- privacy-safe event allowlist + reading-pulse rollups;
- Product OS operational pulse for queue/reports/approval/read/CTA signals;
- robots/sitemap discovery rules for the staged community surface.

Representative implementation evidence includes:

- `functions/lib/community-submissions.mjs`
- `functions/lib/community-moderation.mjs`
- `functions/lib/community-publications.mjs`
- `functions/lib/community-my-publications.mjs`
- `migrations/0013_community_publication_withdrawal.sql`
- `migrations/0014_community_telemetry_rollups.sql`
- `tests/community-submission-api-contract.test.js`
- `tests/community-my-publications-contract.test.js`
- `tests/community-taxonomy-launch-contract.test.js`

## Runtime / rollout state

- `COMMUNITY_SUBMISSIONS_ENABLED=true` supports the writer-facing end-to-end path in production.
- `COMMUNITY_PUBLIC_ENABLED` remains off by deliberate staged-rollout choice; broad `/urdu-writers` navigation/discovery is therefore not treated as launched yet.
- This staged state is not missing implementation and must not trigger a rebuild of Slices A–F.

## Remaining acceptance gates

1. Human/legal review of Community Guidelines / Terms wording before broad promotion.
2. Product decision on when to enable `COMMUNITY_PUBLIC_ENABLED` and normal navigation/discovery.
3. Product decision on eventual reading-page ad density.
4. Production verification/toggling of rollback flags as part of launch operations.
5. Account deletion remains a separate account-platform capability; community withdrawal already provides the documented feature-level fallback and does not require inventing account deletion here.

## Non-negotiable invariants

- Writing is private until a human moderation decision publishes it.
- A writer may manage only their own submissions/publications.
- Writer withdrawal must remove public readability promptly.
- Readers can report published content for review.
- The writer retains their copyright; WriteUrdu receives only the permission needed to display/distribute the approved publication under the service terms.
- Do not expose private drafts/submission data through public reader or SEO surfaces.
- Do not put user writing into telemetry.
- Do not turn category pages into thin indexable surfaces before the documented content threshold is met.

## Historical slice contracts

The implemented child specifications are archived for traceability and are **not** current backlog work:

- [`archive/implemented/WU-COMMUNITY-001A-submission-data-api.md`](archive/implemented/WU-COMMUNITY-001A-submission-data-api.md)
- [`archive/implemented/WU-COMMUNITY-001B-editor-prompt-submission-ux.md`](archive/implemented/WU-COMMUNITY-001B-editor-prompt-submission-ux.md)
- [`archive/implemented/WU-COMMUNITY-001C-os-moderation-publishing.md`](archive/implemented/WU-COMMUNITY-001C-os-moderation-publishing.md)
- [`archive/implemented/WU-COMMUNITY-001D-public-reader-seo-reporting.md`](archive/implemented/WU-COMMUNITY-001D-public-reader-seo-reporting.md)
- [`archive/implemented/WU-COMMUNITY-001E-my-publications-revisions-withdrawal.md`](archive/implemented/WU-COMMUNITY-001E-my-publications-revisions-withdrawal.md)
- [`archive/implemented/WU-COMMUNITY-001F-taxonomy-guidelines-launch-closure.md`](archive/implemented/WU-COMMUNITY-001F-taxonomy-guidelines-launch-closure.md)

The pre-reconciliation parent is preserved at [`archive/snapshots/WU-COMMUNITY-001-2026-08-30-pre-reconciliation.md`](archive/snapshots/WU-COMMUNITY-001-2026-08-30-pre-reconciliation.md).

## Closure rule

Move this parent itself to `archive/implemented/` only after the staged public-launch/legal/operational acceptance gates above are resolved and there is no ongoing community platform decision left here.
