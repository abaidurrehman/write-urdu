# WU-COMMUNITY-001E — My Publications + Revisions + Withdrawal

**Parent:** `WU-COMMUNITY-001`  
**Status:** Implemented core / acceptance pending — `functions/lib/community-my-publications.mjs` (writer-owned repository + `/my-publications`, `/submissions/:id/revise`, `/publications/:id/withdraw` handlers, reusing `requireCommunityContext`/`normalizeCreateInput` exported from Slice A's module), routes `functions/my-publications.js` (SSR shell), `functions/api/community/my-publications.js`, `functions/api/community/submissions/[id]/revise.js`, `functions/api/community/publications/[id]/withdraw.js`, `js/community-my-publications-state.mjs` (pure state-grouping/labels), `js/my-publications.mjs`, `js/my-publications-ui.mjs`, `css/my-publications.css`; `migrations/0013_community_publication_withdrawal.sql` adds nullable `unpublished_by` (`author`/`moderator`) to `community_writing_publications` so the writer UI can distinguish self-withdrawal from moderator removal (Slice C's `unpublish()` now tags `moderator`); `tests/community-my-publications-contract.test.js` green (2026-08-29). Republish-after-withdrawal choice (§13): no lineage revival — withdrawal is terminal for that publication row, a new submission always creates a new publication on next approval. Revision UX is deliberately v1-minimal: the inline "Submit a revision" dialog edits title/author name/body only (category/tags carry over unchanged from the live snapshot; rights/public/guidelines confirmation is implicit on resubmit since the guidelines version is a single unversioned constant today) — no live Cloudflare Pages preview deploy exercised yet, same gap as Slice D.  
**Date:** 2026-08-25  
**Scope:** authenticated publication dashboard, writer-visible moderation states, revision submission, author withdrawal/unpublish, source-document return paths  
**Depends on:** `WU-COMMUNITY-001A` through `WU-COMMUNITY-001D`

---

## 1. Goal

Give writers a clear private place to understand what happened to their submitted work and safely manage published writing without bypassing moderation.

Owned lifecycle:

```text
submitted
→ in review
→ published OR not approved
→ revise/resubmit if needed
→ revision in review
→ approved revision replaces public snapshot
→ writer may withdraw publication at any time
```

This is a writer-control surface, not a public social profile.

---

## 2. Route

Create a noindex authenticated route:

```text
/my-publications
```

Requirements:

- authenticated only;
- `Cache-Control: no-store`;
- route excluded from public sitemap/llms discovery;
- shared WU account shell/navigation;
- useful empty state back to writing.

Do not merge this into the public `/urdu-writers` hub.

---

## 3. User-facing states

Use product language rather than database states.

Map internal state to:

```text
pending first submission        → In review
approved + published            → Published
rejected                        → Not approved
pending revision on publication → Revision in review
publication unpublished by user → Withdrawn
publication unpublished by moderator → Unpublished / removed
```

Do not expose `reviewed_by`, internal moderation IDs or security notes.

If there is a writer-safe rejection note, show it beneath the structured reason.

---

## 4. My Publications list

Each item should show:

```text
title
public name / pen name
category/tags
state
submitted/published/updated date as applicable
short own-content preview
```

Actions depend on state.

### In review

```text
View submission
Update pending submission
```

### Published

```text
View public page
Submit a revision
Withdraw publication
```

### Not approved

```text
View reason
Revise and resubmit
Return to writing
```

### Revision in review

```text
View current public page
View pending revision
```

Current approved version stays public.

### Withdrawn/unpublished

```text
View status
Create a new submission
Return to source writing if available
```

No one-click republish without moderation.

---

## 5. Writer list/read API

Slice A list API may be extended or a dedicated aggregate owner may be added if needed.

Preferred logical writer view combines own submissions/publication states server-side without exposing unrelated users.

Possible endpoint:

```text
GET /api/community/my-publications
```

Return only caller-owned records using `session.user.id`.

Suggested shape:

```text
submissionId
publicationId?
title
publicAuthorName
primaryCategory
tags
submissionStatus
publicationStatus?
submissionRevision
isRevision
submittedAt
reviewedAt?
publishedAt?
updatedAt
rejectionCode?
rejectionNote?
publicSlug?
sourceDocumentId?   # private owner-only field
```

Do not return another user's data even if a public slug is known.

---

## 6. Pending submission update

Reuse Slice A optimistic `PATCH` contract.

UX must make clear:

```text
Updating this submission sends the new version for review.
```

When a pending snapshot is replaced:

- revision increments;
- it remains pending;
- stale tab gets 409 and reload guidance;
- exact preview shown again before saving.

Do not let a pending-update path mutate an already approved publication.

---

## 7. Create revision from published writing

Endpoint:

```text
POST /api/community/submissions/:id/revise
```

or an equivalent publication-owned route after repo inspection.

Authenticated owner only.

A revision submission:

- references the existing `publication_id`;
- copies the proposed new snapshot into a new pending submission row;
- gets next `submission_revision` for that publication lineage;
- does not change `community_writing_publications` yet;
- counts against pending quota/rate guards;
- requires the same rights/public/guidelines confirmations when materially needed by current terms version.

Do not reopen the current public row for direct editing.

---

## 8. Revision source

A writer may revise from:

1. the current public snapshot;
2. the current private My Documents source if it still exists and belongs to them;
3. current eligible editor content through the same explicit snapshot UX.

If a source document changed after publication, make it explicit that the submitted revision is a new version for review.

Never assume the current private document is identical to the public version.

---

## 9. Approved revision behavior

This slice consumes Slice C moderation contract:

```text
current publication remains live
→ new revision pending
→ moderator approves
→ approved snapshot atomically replaces current public fields
→ stable slug/published_at retained
```

Writer UI should show:

```text
Revision in review
Your current published version is still visible.
```

After approval:

```text
Published — updated <date>
```

---

## 10. Rejected revision behavior

If a revision is rejected:

- existing published version remains untouched;
- writer sees `Revision not approved` and safe reason/note;
- may create another revision;
- public page remains available.

Do not map rejected revision to `Not approved` in a way that implies the whole publication disappeared.

---

## 11. Writer withdrawal

Endpoint:

```text
POST /api/community/publications/:id/withdraw
```

Requirements:

- authenticated owner only;
- publication must belong to `session.user.id`;
- operation is idempotent;
- set publication status `unpublished` with owner-withdrawal reason/state as needed by the community domain;
- public hub/category/API/sitemap stop returning it immediately;
- detail route returns 410/noindex per Slice D;
- source My Documents content is untouched;
- writer sees `Withdrawn`.

Use a confirmation step:

```text
Withdraw this writing?
It will no longer be publicly readable on WriteUrdu. Your private writing will not be deleted.
```

---

## 12. Moderator unpublish vs writer withdrawal

Writer UI must distinguish enough to guide next action without leaking internal detail.

### Writer withdrawal

```text
Withdrawn by you
```

### Moderator removal

```text
This publication is no longer public.
```

If a safe removal reason can be shown, use a controlled writer-facing message.

Do not expose moderator identity.

---

## 13. Republish after withdrawal/removal

No direct status toggle back to `published`.

Writer must create a new submission/revision and receive a new moderation decision.

Canonical behavior:

- if product chooses to revive the same publication lineage after author withdrawal, slug may remain stable only after moderation approval;
- if implementation complexity is high, create a new publication on new approval and document that outcome;
- never make the user-visible `Republish` action bypass review.

The implementation must choose one deterministic behavior and test it before launch.

---

## 14. Source-document return

Where `source_document_id` exists and still belongs to user:

```text
Open source writing
```

should reopen through the existing My Documents/editor restore contract.

Rules:

- never put source document text in URL;
- never expose source ID publicly;
- if source was deleted, degrade to a useful `Start a new revision` path from the approved/submitted snapshot;
- do not silently overwrite current local editor work.

---

## 15. Rejection copy

Structured internal rejection codes map to concise writer-facing copy.

Examples:

```text
needs_writer_revision → Please revise this writing and submit it again.
copyright_or_ownership → We could not publish this because of an authorship or copyright concern.
personal_information → Please remove private information before submitting again.
spam_or_promotion → This submission appears mainly promotional and was not published.
```

Avoid accusatory/legal conclusions when moderation is only uncertain.

Optional moderator note is escaped/rendered as text, never HTML.

---

## 16. Notifications

Out of scope for v1 unless an existing low-cost in-product notification pattern already exists.

Do not introduce email infrastructure solely for moderation results in this slice.

The source of truth is `/my-publications`.

A future email notification feature requires separate consent/deliverability design.

---

## 17. Account deletion interaction

Reconcile with account lifecycle before launch.

Minimum product decision required:

- private submissions owned by deleted account are removed/anonymized according documented retention;
- published writing must not remain attributed to a deleted identity without an explicit policy;
- writer withdrawal should be offered before deletion where practical;
- account deletion must not leave an authorization-orphaned public row that cannot be managed.

Do not solve account deletion by deleting unrelated telemetry/share tables.

If current account-deletion feature is not yet shipped, document the community cleanup contract as a launch dependency.

---

## 18. Telemetry

Allowed events:

```text
community_my_publications_viewed
community_revision_started
community_revision_submitted
community_publication_withdrawn
```

Allowed properties:

```text
state bucket
entry route
outcome/error category
```

Never include title/body/name/user IDs/document IDs/submission/publication IDs.

---

## 19. Accessibility/mobile

- status chips are not color-only;
- buttons have clear accessible labels;
- withdrawal confirmation returns focus correctly;
- Urdu previews use RTL/lang;
- rejection notes readable on mobile;
- no horizontal overflow;
- state/action hierarchy remains understandable in screen-reader order.

---

## 20. Likely implementation owners

Inspect first. Possible owners:

```text
my-publications.html
js/my-publications.mjs
css/my-publications.css
functions/api/community/my-publications.js
functions/api/community/submissions/[id]/revise.js
functions/api/community/publications/[id]/withdraw.js
```

Prefer existing account-page/document UI primitives where suitable.

---

## 21. Tests

### Ownership

- user A cannot see user B private publication dashboard;
- user A cannot revise/withdraw user B publication;
- source-document link is owner-only.

### State mapping

- pending first submission => In review;
- approved published => Published;
- rejected first submission => Not approved;
- pending revision + published row => Revision in review;
- rejected revision leaves publication Published with revision rejection surfaced separately;
- withdrawn => Withdrawn.

### Revision

- new revision creates pending row and leaves public snapshot unchanged;
- revision quota/rate applies;
- approval later updates public snapshot through Slice C only;
- stale pending update conflicts safely.

### Withdrawal

- owner can withdraw;
- repeat withdrawal idempotent;
- hub/API/sitemap remove row;
- detail becomes 410/noindex;
- source private document unchanged;
- no direct republish toggle.

### UX/regression

- empty state links to writing;
- source-document reopen preserves local-work conflict rules;
- rejection note escaped;
- no private route indexed.

---

## 22. Acceptance criteria

- [ ] Authenticated `/my-publications` route exists and is noindex.
- [ ] Writer sees accurate moderation/publication states.
- [ ] Rejected first submission and rejected revision are distinguished correctly.
- [ ] Pending submission update keeps optimistic revision safety.
- [ ] Published writer can submit a revision without changing current public snapshot.
- [ ] Current version remains live while revision is pending/rejected.
- [ ] Writer can withdraw own publication immediately.
- [ ] Withdrawal removes discovery/sitemap and yields 410/noindex detail.
- [ ] Withdrawal never deletes My Documents source.
- [ ] No direct republish bypass exists.
- [ ] Source document return is owner-only and conflict-safe.
- [ ] Account deletion/retention contract is documented before broad launch.
- [ ] Focused tests and full regression suite pass.

---

## 23. Stop conditions

Stop and fix if:

- My Publications leaks another user's private status;
- revision directly edits `community_writing_publications` before approval;
- rejected revision removes current public version;
- writer withdrawal deletes private source writing;
- unpublished row can be toggled back public without moderation;
- source document ID/text appears on public pages;
- rejection note renders unsanitized HTML;
- dashboard becomes a public author profile/social feed.
