# WU-COMMUNITY-001C — Product OS Moderation + Approval Boundary

**Parent:** `WU-COMMUNITY-001`  
**Status:** Planned  
**Date:** 2026-08-25  
**Scope:** moderation queue, secure internal APIs, approve/reject, publication snapshot creation, revision-safe replacement, emergency unpublish  
**Depends on:** `WU-COMMUNITY-001A`, current Product OS host + Cloudflare Access protection

---

## 1. Goal

Establish the human moderation boundary that is the **only** path from a private submission to an approved publication snapshot.

Owned flow:

```text
pending submission
→ Product OS reviewer
→ approve OR reject
→ approved immutable publication row OR rejected private submission
```

This slice can create approved `community_writing_publications` rows, but public reader routes remain Slice D.

---

## 2. Non-negotiable rule

There must be no public/client writer API capable of setting:

```text
approved
published
reviewed_by
reviewed_at
publication slug
```

Only the fail-closed Product OS moderation path may perform approval/rejection/unpublish transitions.

---

## 3. Read before implementation

Inspect current `main` for:

1. Product OS deployment/host architecture;
2. existing `/api/internal/*` host guards;
3. Cloudflare Access boundary/identity handling;
4. current `PRODUCT_OS_HOST` usage;
5. current D1 helpers and response headers;
6. `WU-COMMUNITY-001A` schema/state contracts;
7. current OS UI shell/design patterns.

Do not invent a weaker moderation-auth scheme just for this feature.

---

## 4. Moderation authorization

All moderation endpoints must fail closed.

Minimum production boundary:

```text
request hostname == configured PRODUCT_OS_HOST
AND Product OS hostname is protected by Cloudflare Access
AND authenticated Access identity is available through the project's verified/current pattern
```

For write operations, prefer validation of the existing Access assertion/JWT boundary if the repo already implements it or if current platform guidance requires it. Do not trust a user-supplied email header without the Access boundary.

Optional environment allowlist:

```text
COMMUNITY_MODERATOR_EMAILS=moderator1@example.com,moderator2@example.com
```

If configured, normalized Access identity must match the allowlist.

Never authorize moderation from:

```text
query string
localStorage flag
client-supplied role
public session email alone
hidden form field
```

Record only a bounded moderator audit identity, not tokens or assertion bodies.

---

## 5. Internal APIs

### Queue

```text
GET /api/internal/community/moderation?status=pending
```

Return bounded metadata, newest first:

```text
id
title
publicAuthorName
primaryCategory
tags
editorKind
contentFormat
plainTextPreview
submissionRevision
publicationId?
submittedAt
updatedAt
report/revision indicators when relevant
```

Keep preview short. Full body comes from detail endpoint.

Support bounded pagination/cursor; do not fetch the entire historical queue.

### Detail

```text
GET /api/internal/community/moderation/:id
```

Return exact submission snapshot needed for review plus state/revision metadata.

Do not display account email by default.

### Approve

```text
POST /api/internal/community/moderation/:id/approve
```

Request must include the reviewer’s expected submission revision and optionally adjusted controlled taxonomy:

```json
{
  "submissionRevision": 2,
  "primaryCategory": "poetry",
  "tags": ["ghazal"]
}
```

Moderator may adjust only category/tags.

Do not silently edit:

```text
title
body
public author name
```

If those need change, reject with resubmission guidance.

### Reject

```text
POST /api/internal/community/moderation/:id/reject
```

Request:

```json
{
  "submissionRevision": 2,
  "rejectionCode": "spam_or_promotion",
  "rejectionNote": "optional writer-safe note"
}
```

### Emergency unpublish

```text
POST /api/internal/community/publications/:id/unpublish
```

Used for reports, legal/privacy issues or post-publication review.

Unpublish must not delete the writer’s My Documents source.

---

## 6. Rejection codes

Controlled internal values:

```text
incomplete_or_low_quality
spam_or_promotion
abusive_or_hateful
sexual_or_unsafe
personal_information
copyright_or_ownership
plagiarism_concern
off_topic
needs_writer_revision
other
```

`rejection_note` must be treated as potentially writer-visible. Do not put internal security/legal speculation into it.

---

## 7. Approval transaction

Approval must be state- and revision-safe.

Required preconditions:

```text
submission.id matches
status == pending
submission_revision == moderator expected revision
```

### First approval

Generate server-side:

```text
publication ID
stable public slug
published_at
```

Copy the approved snapshot from submission to `community_writing_publications`.

Then mark submission approved with:

```text
reviewed_at
reviewed_by
publication_id
```

Use one atomic D1 transaction/batch mechanism supported by the current runtime so a partial failure cannot leave a published row without matching approved state or vice versa.

Verify current D1 transaction/batch semantics at implementation time.

### Idempotency

Repeating the exact approval request after successful approval must not create a second publication.

Return the existing approved result when safe.

### Stale review

If writer replaced the pending snapshot after the moderator opened it:

```text
submission_revision changed
→ approval returns 409/stale_review
→ moderator reloads exact current snapshot
```

Never approve an unseen newer revision.

---

## 8. Slug generation

Generate only on first approval.

Recommended shape:

```text
<short-stable-prefix>-<readable-title-fragment>
```

Example:

```text
a8k2-meri-pehli-ghazal
```

Rules:

- unique server-side;
- opaque stable prefix is identity anchor;
- readable fragment is presentation only;
- routing must not depend on perfect Urdu transliteration;
- later title revisions do not automatically change canonical slug.

If robust Urdu transliteration is not already available, use a safe generated prefix plus conservative normalized fragment rather than introduce an AI dependency.

---

## 9. Approved revision replacement

When a submission references an existing `publication_id`, approval represents a revision.

Required behavior:

```text
current publication remains published while revision pending
→ moderator approves exact revision
→ publication snapshot fields replaced atomically
→ slug remains stable
→ updated_at changes
→ new submission marked approved
```

Publication fields eligible for replacement after approval:

```text
public_author_name
title
content
plain_text
content_format
primary_category
tags_json
source_submission_id
updated_at
```

`published_at` and canonical slug remain original unless a future explicit editorial migration says otherwise.

A rejected revision must leave current publication untouched.

---

## 10. OS queue UX

Add a dedicated Product OS area:

```text
Community Writing
```

Queue cards/rows show:

- pending count;
- title;
- chosen public writer name;
- category/tags;
- submitted time;
- editor kind;
- short safe preview;
- `New publication` vs `Revision` badge.

Optional filters:

```text
pending
recently approved
recently rejected
reported publications
```

Do not overbuild a generic CMS.

---

## 11. Review UX

Review view renders the exact candidate snapshot safely with Urdu/RTL behavior.

Show:

```text
title
public author name
category/tags
full writing
source editor kind
submitted/revision timestamps
whether first publication or revision
```

Actions:

```text
Approve & publish
Reject
```

Before approval:

- allow controlled category/tag correction;
- show confirmation for publication/revision replacement;
- disable duplicate clicks while request in flight;
- stale conflict asks reviewer to reload.

Never make body text editable in moderator UI in v1.

---

## 12. Reporting visibility

Slice D will create report records. Moderation UI should be ready to surface:

```text
publication title
report count
recent reason counts
last report time
```

Reports do not auto-unpublish by count alone in v1.

Moderator may inspect and explicitly unpublish.

---

## 13. Audit/privacy

Persist only bounded audit data needed to understand moderation decisions:

```text
reviewed_at
reviewed_by
rejection_code
rejection_note
```

Do not persist:

```text
Access JWT/token
moderator session cookies
full request headers
writer email in moderation row
```

Writing content already exists in the submission/publication domain and must not be duplicated into logs or a second audit blob.

---

## 14. Failure behavior

- OS unavailable => public/private writing remains intact;
- D1 write failure => no partial approval state;
- stale revision => 409, no publication change;
- invalid taxonomy correction => 400;
- unauthorized public-host request => 404/403 fail closed;
- duplicate approval => idempotent existing result;
- reject on non-pending row => deterministic conflict.

---

## 15. Likely implementation owners

Inspect first. Possible owners:

```text
functions/lib/community-moderation.mjs
functions/api/internal/community/moderation/index.js
functions/api/internal/community/moderation/[id].js
functions/api/internal/community/moderation/[id]/approve.js
functions/api/internal/community/moderation/[id]/reject.js
functions/api/internal/community/publications/[id]/unpublish.js
Product OS community-writing UI module/page
```

Reuse current internal API/security shell where present.

---

## 16. Tests

### Security

- public WriteUrdu hostname cannot call moderation write;
- missing/invalid OS Access boundary fails closed;
- optional moderator allowlist enforced when configured;
- browser/client flag cannot grant moderator rights.

### Approval

- pending exact revision approves;
- first approval creates exactly one publication;
- duplicate approval creates no duplicate;
- stale revision => 409 and no public snapshot change;
- adjusted category/tags validated;
- title/body/public name cannot be rewritten by approval request.

### Rejection

- pending exact revision rejects;
- rejection creates no publication;
- structured code required/validated;
- rejected revision leaves existing publication live.

### Revision

- pending revision does not change current publication;
- approved revision replaces snapshot atomically;
- slug/published_at stable;
- source_submission_id/updated_at advance.

### Unpublish

- moderator can mark published row unpublished;
- operation is idempotent;
- source private document untouched.

### Privacy

- OS list does not return writer email by default;
- tokens/assertions not logged;
- writing not duplicated into telemetry/audit logs.

---

## 17. Acceptance criteria

- [ ] Dedicated OS Community Writing queue exists.
- [ ] Internal moderation APIs are host/Access protected and fail closed.
- [ ] Approval/rejection require expected submission revision.
- [ ] First approval atomically creates one approved publication snapshot.
- [ ] Duplicate approval is idempotent.
- [ ] Stale moderator view cannot approve unseen writer changes.
- [ ] Moderator can adjust only controlled category/tags.
- [ ] Rejection produces no public snapshot.
- [ ] Approved revision replaces only after human approval and keeps slug stable.
- [ ] Emergency moderator unpublish exists.
- [ ] Writer email/provider data are not routine moderation UI.
- [ ] Audit identity is bounded; Access secrets/assertions are not stored.
- [ ] Focused tests and repository regression suite pass.

---

## 18. Release gate

**Do not start/enable Slice D public reader routes until the approval/rejection security and state-transition tests in this slice are green.**

---

## 19. Stop conditions

Stop and fix if:

- writer/public API can approve content;
- OS mutation relies only on a client role/email flag;
- stale submission can be approved;
- approval can create duplicate public rows;
- moderation can rewrite writer body silently;
- rejected revision changes existing publication;
- approval is multi-step without atomic failure safety;
- public routes are enabled before this boundary is proven.
