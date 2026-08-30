# WU-COMMUNITY-001A — Submission Data + Authenticated Writer API

**Parent:** `WU-COMMUNITY-001`  
**Status:** Implemented core / acceptance pending — `migrations/0012_community_writing.sql`, `functions/lib/community-taxonomy.mjs`, `functions/lib/community-content.mjs`, `functions/lib/community-submissions.mjs`, `functions/api/community/submissions*.js`; `tests/community-submission-api-contract.test.js` green (2026-08-28)  
**Date:** 2026-08-25  
**Scope:** D1 schema, shared validation/sanitization, authenticated submission APIs, ownership, quotas, revision-safe pending updates  
**Depends on:** `WU-AUTH-001`, stable `getSession()`, existing `METRICS_DB`

---

## 1. Goal

Create the private submission foundation without making any community writing public.

The only flow owned by this slice is:

```text
signed-in writer
→ explicit writing snapshot
→ validated community submission
→ pending moderation row
```

This slice **must not** create public routes, publish content, approve content or expose pending content to anonymous readers.

---

## 2. Read before implementation

Read current `main`, not only this spec:

1. `specs/WU-COMMUNITY-001-moderated-urdu-writing-publishing.md`
2. `specs/WU-AUTH-001-social-authentication-foundation.md`
3. `specs/WU-DRAFT-001-cross-device-cloud-drafts.md`
4. `.claude/skills/wu-community-publishing/SKILL.md`
5. `functions/lib/auth.mjs`
6. current `/api/documents*` handlers and ownership patterns
7. current migration inventory
8. current shared response/security helpers
9. existing share-report validation/rate-bound patterns
10. product telemetry serializers to ensure writing cannot leak into analytics.

Do not copy stale migration numbers or duplicate an existing helper that current `main` already owns.

---

## 3. Database decision

Use the existing application D1 binding:

```text
env.METRICS_DB
```

Never introduce a new D1 database or binding.

At the 2026-08-25 baseline the next migration is expected to be approximately:

```text
0009_community_writing.sql
```

Reconcile against current `main` immediately before coding.

Migration rules:

- additive only;
- never edit an applied migration;
- never rename/drop existing telemetry, share, Auth.js or `writing_documents` tables;
- capture table inventory before/after in tests or implementation proof;
- community code accesses community-owned tables only, except an optional ownership check against `writing_documents` through the document-domain boundary.

---

## 4. Tables

### 4.1 `community_writing_submissions`

Required logical fields:

```text
id                       TEXT PRIMARY KEY
user_id                  TEXT NOT NULL
source_document_id       TEXT NULL
publication_id           TEXT NULL
submission_revision      INTEGER NOT NULL
status                   TEXT NOT NULL
content_format           TEXT NOT NULL
editor_kind              TEXT NOT NULL
public_author_name       TEXT NOT NULL
title                    TEXT NOT NULL
content                  TEXT NOT NULL
plain_text               TEXT NOT NULL
primary_category         TEXT NOT NULL
tags_json                TEXT NOT NULL
rights_confirmed         INTEGER NOT NULL
public_confirmed         INTEGER NOT NULL
guidelines_version       TEXT NOT NULL
content_signature        TEXT NOT NULL
submitted_at             TEXT NOT NULL
updated_at               TEXT NOT NULL
reviewed_at              TEXT NULL
reviewed_by              TEXT NULL
rejection_code           TEXT NULL
rejection_note           TEXT NULL
```

Allowed `status` values in this slice:

```text
pending
rejected
approved
withdrawn
```

`approved` exists for the later moderation contract, but this slice exposes no writer/public operation that can set it.

Recommended indexes:

```text
(status, submitted_at)
(user_id, submitted_at DESC)
(user_id, status, submitted_at DESC)
(publication_id, submission_revision DESC)
(content_signature, submitted_at DESC)
```

### 4.2 `community_writing_publications`

Create the table now so the schema boundary is fixed, but **do not write public rows in Slice A**.

Required logical fields:

```text
id                       TEXT PRIMARY KEY
source_submission_id     TEXT NOT NULL
user_id                  TEXT NOT NULL
slug                     TEXT NOT NULL UNIQUE
status                   TEXT NOT NULL
public_author_name       TEXT NOT NULL
title                    TEXT NOT NULL
content                  TEXT NOT NULL
plain_text               TEXT NOT NULL
content_format           TEXT NOT NULL
primary_category         TEXT NOT NULL
tags_json                TEXT NOT NULL
published_at             TEXT NOT NULL
updated_at               TEXT NOT NULL
report_count             INTEGER NOT NULL DEFAULT 0
last_report_at           TEXT NULL
```

Allowed publication states:

```text
published
unpublished
```

Indexes:

```text
(status, published_at DESC)
(status, primary_category, published_at DESC)
(user_id, status, published_at DESC)
```

### 4.3 `community_writing_reports`

Create a small community-owned report table so public reports can later be reviewed without storing reporter identity.

```text
id                       TEXT PRIMARY KEY
publication_id           TEXT NOT NULL
reason                   TEXT NOT NULL
created_at               TEXT NOT NULL
```

Recommended index:

```text
(publication_id, created_at DESC)
```

Do not store reporter email, user ID, raw IP address, user-agent or free-form report text in v1.

---

## 5. Feature flags

Add fail-closed runtime gates without making them public marketing promises:

```text
COMMUNITY_SUBMISSIONS_ENABLED=true|false
COMMUNITY_PUBLIC_ENABLED=true|false   # consumed by later slices
```

Slice A requires `COMMUNITY_SUBMISSIONS_ENABLED=true` for writer mutations.

When disabled:

- private/local writing continues normally;
- My Documents continues normally;
- submission APIs return a deterministic unavailable response;
- no migration rollback/drop occurs.

---

## 6. Controlled taxonomy owner

Create one shared server-owned taxonomy module rather than copying string arrays across APIs/UI.

Initial primary categories:

```text
poetry
essay
prose
thought
story
```

Initial curated tags:

```text
ghazal
nazm
shayari
essay
prose
critical-thinking
personal-reflection
society
culture
education
story
other
```

Contract:

- exactly one valid primary category;
- 1–5 unique valid tags;
- reject arbitrary public tag strings;
- normalize tag order deterministically before persistence/signature generation;
- later moderation may change category/tags without changing title/body/public name.

Suggested owner after repository inspection:

```text
functions/lib/community-taxonomy.mjs
```

---

## 7. Content normalization and sanitization

Create one shared server-side normalizer/validator.

Suggested owner:

```text
functions/lib/community-content.mjs
```

### Plain submissions

Store:

```text
content_format = plain
content = normalized plain text
plain_text = same semantic text
```

Preserve Urdu code points, punctuation and meaningful newlines. Do not aggressively normalize Urdu spelling or rewrite user content.

### Rich submissions

If Rich Editor publishes rich content in v1:

- sanitize server-side with a strict allowlist;
- derive `plain_text` after sanitization;
- never trust client-supplied sanitized HTML;
- remove scripts, styles, forms, iframes, object/embed, event handlers, unsafe URLs and unknown attributes;
- preserve only formatting needed for writing such as paragraphs, headings, emphasis, lists, blockquotes and safe line breaks.

If current repo/runtime lacks a proven sanitizer that can be used safely in Cloudflare Pages Functions, Slice A may deliberately store **plain text only for community publishing** and document that decision. Do not hand-roll a regex HTML sanitizer.

### Initial limits

Server-side constants:

```text
MAX_TITLE_CHARS = 180
MAX_PUBLIC_AUTHOR_CHARS = 80
MIN_PLAIN_TEXT_CHARS = 80
MAX_PLAIN_TEXT_UTF8_BYTES = 500 * 1024
MAX_PENDING_PER_USER = 5
MAX_SUBMISSIONS_PER_24H = 10
MAX_TAGS = 5
```

The 80-character minimum applies to manual submissions and stays low enough for short poetry.

Count real UTF-8 bytes for the body cap where practical; do not confuse JavaScript string length with storage bytes.

---

## 8. Content signature

Generate a server-side content signature used only for duplicate/queue protection.

Input should be deterministic normalized fields such as:

```text
title
public_author_name
plain_text
primary_category
sorted tags
```

Use Web Crypto SHA-256 or another platform-supported cryptographic digest.

Rules:

- signature is internal, never a public identifier;
- do not log it alongside user identity;
- exact duplicate pending submissions from the same user should return/reuse the existing pending result rather than create queue spam;
- do not use fuzzy plagiarism detection in this slice.

---

## 9. Source document reference

`source_document_id` is optional.

When supplied:

- verify it belongs to `session.user.id` before storing the reference;
- never copy the document owner from client input;
- publication still stores a full immutable snapshot;
- later changes/deletion of the source document do not alter the submission body;
- a source document reference never appears in public HTML/API.

A submission can also originate from unsaved local writing, in which case `source_document_id = NULL`.

---

## 10. Writer API

### `POST /api/community/submissions`

Requires authenticated `getSession()` and submissions feature enabled.

Request logical shape:

```json
{
  "sourceDocumentId": "optional",
  "editorKind": "basic|rich|keyboard|voice",
  "contentFormat": "plain|rich",
  "title": "...",
  "publicAuthorName": "...",
  "content": "...",
  "plainText": "...",
  "primaryCategory": "poetry",
  "tags": ["ghazal"],
  "rightsConfirmed": true,
  "publicConfirmed": true,
  "guidelinesVersion": "2026-08-25"
}
```

Server owns:

```text
id
user_id
status=pending
submission_revision=1
content_signature
submitted_at
updated_at
```

Never accept a client owner/status/reviewer/publication slug.

Responses:

```text
201 created
200 existing exact pending duplicate, if dedupe contract is used
400 invalid input
401 unauthenticated
409 invalid state/quota conflict
429 bounded submission-rate limit
503 feature unavailable
```

Return no full body unless the client actually needs it for confirmation.

### `GET /api/community/submissions`

Authenticated owner-only status list.

Return metadata only by default:

```text
id
title
publicAuthorName
primaryCategory
tags
status
submissionRevision
publicationId?       # private writer context only
submittedAt
updatedAt
reviewedAt
rejectionCode
rejectionNote        # only writer-safe note
```

Order newest activity first.

### `GET /api/community/submissions/:id`

Owner-only full submission retrieval.

Knowing an ID is never authorization.

### `PATCH /api/community/submissions/:id`

Allowed only while the row is `pending` and owned by caller.

Require `submissionRevision` from client and update equivalent to optimistic concurrency:

```text
WHERE id = ? AND user_id = ? AND status = 'pending' AND submission_revision = ?
```

On success:

- replace validated snapshot/metadata;
- increment revision;
- recompute signature;
- refresh `updated_at`;
- keep status pending.

Stale revision or non-pending state => `409`.

Do not allow PATCH to set approval/rejection/publication state.

---

## 11. Quota and abuse guards

Before creating a new row:

1. authenticated user required;
2. count current pending rows for user;
3. reject when `MAX_PENDING_PER_USER` reached;
4. count new submissions in rolling 24 hours and enforce initial bounded rate;
5. exact duplicate signature guard;
6. server-side content/taxonomy validation.

Do not add IP-address persistence merely for this feature.

A future account-level publishing suspension must use a community-owned table/flag, not edits to Auth.js user/account tables.

---

## 12. Response and logging rules

All authenticated writer endpoints:

```text
Cache-Control: no-store
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff
```

Logs/telemetry may record only bounded outcome metadata such as:

```text
route/action
editor_kind
content_format
size_bucket
category
outcome/error_category
safe timing
```

Never log or emit:

```text
title
body/excerpt
public author name
email
user ID
document ID
submission ID
content signature
rich HTML
```

---

## 13. Likely implementation owners

Inspect current owners first. Possible additions:

```text
migrations/0009_community_writing.sql
functions/lib/community-taxonomy.mjs
functions/lib/community-content.mjs
functions/lib/community-submissions.mjs
functions/api/community/submissions/index.js
functions/api/community/submissions/[id].js
```

Do not create parallel generic DB/auth helpers if current modules already own those responsibilities.

---

## 14. Tests

### Migration

- community tables created additively;
- existing telemetry/share/Auth.js/document tables unchanged;
- expected indexes exist.

### Auth/ownership

- signed-out POST/GET/PATCH rejected;
- user A cannot list/get/update user B;
- source document reference accepted only for owner;
- client-supplied owner/status ignored/rejected.

### Validation

- category allowlist;
- tag allowlist, uniqueness and 1–5 cardinality;
- title/name/body limits;
- rights/public/guidelines confirmation required;
- unsafe rich markup removed/rejected according chosen content contract;
- exact Urdu/RTL plain text survives round-trip.

### State/concurrency

- create => pending revision 1;
- pending PATCH increments revision;
- stale revision => 409;
- rejected/approved row cannot be changed with pending PATCH;
- duplicate exact pending submission does not create queue spam;
- max pending quota and rolling rate enforced.

### Privacy

- test logger/telemetry serializer cannot accept title/body/name/IDs;
- list response omits full body;
- no public route is added by this slice.

---

## 15. Acceptance criteria

- [ ] Existing `METRICS_DB` reused; no new database/binding.
- [ ] Additive community migration exists and preserves existing tables.
- [ ] Submission, publication and report domain tables exist.
- [ ] Shared controlled taxonomy owner exists.
- [ ] Server content validation/sanitization policy is deterministic and tested.
- [ ] Authenticated owner-only create/list/get/pending-update APIs work.
- [ ] `session.user.id` is the only ownership subject.
- [ ] Source document ownership is verified when referenced.
- [ ] Pending revision concurrency is enforced.
- [ ] Pending quota/rate/duplicate guards are enforced.
- [ ] Writing text/public name/IDs never enter telemetry/logs.
- [ ] No approval/public-read capability ships in Slice A.
- [ ] Focused tests and repository regression suite pass.

---

## 16. Stop conditions

Stop and fix if implementation requires any of the following:

- another D1 database;
- public reads from submission/private document tables;
- account email used as authorization;
- free-form public tags;
- client-controlled status/owner/reviewer/slug;
- rich HTML accepted without a real server sanitizer;
- content in logs/telemetry;
- update without revision/state/owner predicates;
- publishing capability before moderation slice exists.
