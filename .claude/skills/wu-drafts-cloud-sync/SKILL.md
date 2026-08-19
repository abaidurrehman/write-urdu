---
name: wu-drafts-cloud-sync
description: Implement or review WU-DRAFT-001 My Documents and cross-device account-backed Urdu writing. Load when adding WRITE_URDU_DB document persistence, /api/documents CRUD, Save to my account, My Documents, cross-device restore, throttled sync or revision conflict handling. Preserve existing browser-local autosave/history and keep identity in ACCOUNT_DB.
---

# WriteUrdu My Documents — Local-first Account Persistence

Use this skill only after `WU-AUTH-001` AUTH-B has proven real Google sign-in and preservation of in-progress local writing.

## Read before implementation

1. `specs/WU-ACCOUNT-001-account-document-platform-boundary.md`
2. `specs/WU-DRAFT-001-cross-device-cloud-drafts.md`
3. `specs/WU-AUTH-001-social-authentication-foundation.md`
4. `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`
5. `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md`
6. full current `js/editor-tools.js`
7. current basic, rich and keyboard bootstrap paths
8. current `functions/lib/auth.mjs` / `getSession()` contract
9. current D1/Pages Functions docs and bindings.

## Core rule

**Account documents extend browser-local writing; they never replace it.**

Local persistence stays on the editor's critical path and remains immediate/offline-capable.

Account sync is optional, user-initiated for the first save, throttled afterward, and independently disableable.

## Data-plane rule

Identity/session data lives in:

`ACCOUNT_DB`

User writing lives in:

`WRITE_URDU_DB`

Never create Auth.js adapter tables in `WRITE_URDU_DB` and never put writing content in `ACCOUNT_DB`.

All document ownership is derived from:

`session.user.id`

Do not use email or a client-supplied user ID.

## Entry gate

Before writing document code, confirm:

- Auth.js backend foundation is stable;
- Google account shell works on the intended environment;
- `/api/me` returns stable user ID;
- local writing survives OAuth/sign-out;
- auth failure does not block the writers;
- `DOCUMENTS_ENABLED` is available or will be introduced default-off.

If those are not true, return to the auth skills rather than compensating in document code.

## Step 0 — inspect current local contract

Re-read `js/editor-tools.js` and identify:

- local save scheduling/debounce;
- current draft/history storage keys/shape;
- adapter methods for get/set content;
- current signature/dedup behavior;
- how basic/rich/keyboard bootstrap restores content;
- how current work is protected before replacing/opening another document.

Do not preserve old constants blindly if current main changed.

## Step 1 — WRITE_URDU_DB and migration

Create a product-owned D1 binding:

`WRITE_URDU_DB`

Create a writing-specific table equivalent to:

```text
writing_documents
- id
- owner_user_id
- editor_kind
- title
- content
- plain_text
- format_version
- revision
- created_at
- updated_at
```

Recommended owned lookup/index behavior:

```text
(owner_user_id, updated_at DESC)
(owner_user_id, id)
```

Do not create a generic file table or speculative collaboration/team ACLs.

No cross-D1 foreign key is required; store the stable Auth.js user ID as an opaque owner subject.

## Step 2 — server validation/limits

Initial contract from the spec:

- title <= 160 Unicode characters;
- content <= 750 KB UTF-8;
- allowed editor kinds: `basic`, `rich`, `keyboard`;
- max 100 active account-backed writing documents/user;
- IDs generated server-side with secure Web Crypto/platform API.

Validate before writing.

Do not truncate oversized content silently.

## Step 3 — implement document API before editor integration

Logical routes:

```text
GET    /api/documents
POST   /api/documents
GET    /api/documents/:id
PATCH  /api/documents/:id
DELETE /api/documents/:id
```

Every handler must:

- require `getSession()` from the project auth wrapper;
- derive owner from `session.user.id`;
- check `DOCUMENTS_ENABLED`;
- use parameterized D1 statements;
- scope every read/write/delete by owner;
- validate body/title/kind/quota;
- return `Cache-Control: no-store`;
- never log document content;
- normalize errors without SQL/auth leakage.

Knowing a document UUID is never authorization.

## Step 4 — list response stays metadata-only

`GET /api/documents` must not send all full document bodies.

Return metadata such as:

```text
id
title
editorKind
preview
revision
createdAt
updatedAt
```

Fetch full content only for a specifically owned document.

## Step 5 — optimistic concurrency is mandatory

Updates include the client's last known `revision`.

Use an owned conditional update equivalent to:

```sql
UPDATE writing_documents
SET
  title = ?,
  content = ?,
  plain_text = ?,
  revision = revision + 1,
  updated_at = ?
WHERE id = ?
  AND owner_user_id = ?
  AND revision = ?
```

No matching row due to stale revision => `409 Conflict`.

Do not silently retry into last-write-wins.

Do not implement automatic text/HTML merging.

## Step 6 — hard delete v1

Delete only with both owned ID + stable owner subject.

V1 hard-delete means the remote row is actually removed.

Do not introduce a hidden recycle bin/retention history unless a later spec explicitly requires it.

## Step 7 — basic writer pilot first

Do not integrate all writers at once.

Start with homepage/basic writer and create one shared account-document client module.

Do not place API/fetch logic inside transliteration code.

First remote action is explicit:

**Save to my account**

Signing in alone must not create a remote row or upload previous local history.

## Step 8 — separate remote metadata from local content

Keep remote state outside the canonical local body, including at least:

```text
remoteDocumentId
lastSyncedRevision
lastSyncedSignature
syncState
lastSyncErrorCategory
```

Never store provider tokens/session tokens/provider account IDs/email as ownership identity in localStorage.

## Step 9 — sync cadence

For a document already opted into account storage:

- current local save remains unchanged;
- local signature change marks remote state dirty;
- coalesce dirty changes;
- remote sync roughly 20–30 seconds later while dirty;
- explicit manual account save may sync immediately;
- best-effort page-hide/visibility flush is optional only when safe;
- failed account sync never blocks or rolls back local save;
- avoid aggressive retry loops.

Never map the local ~650ms save debounce directly to D1.

## Step 10 — truthful status UI

Local and account persistence are separate truths.

Use product language equivalent to:

```text
Saved on this device
Saved to your account
Saving to your account…
Account save paused — your writing is safe on this device
This document changed on another device
```

Do not expose `cloud_drafts`, D1, revision numbers or backend jargon in normal UI.

## Step 11 — My Documents

Build noindex `/my-documents` using the current v2 shell.

Required:

- recent list;
- title;
- short preview;
- modified time;
- editor kind only when useful;
- open in correct writer;
- rename;
- delete with confirmation;
- duplicate/copy path where needed for conflict recovery;
- empty state into writing.

Do not build a generic account dashboard or team/profile UI.

## Step 12 — safe open/restore

Use the existing editor adapter/handoff path.

Rules:

- never put content in query strings/public URLs;
- open the correct editor kind;
- restore rich content as rich content;
- preserve Urdu/RTL exactly;
- if a different current local document exists, do not silently overwrite it;
- protect it into local history or present a safe choice;
- set remote ID/revision metadata only after successful open/import.

## Step 13 — extend to rich + keyboard

After basic cross-device proof, reuse the same module/API through adapters.

Verify:

- TinyMCE formatting survives exact round-trip;
- Urdu letters/punctuation/RTL survive unchanged;
- keyboard writer survives unchanged;
- local history remains independent;
- one editor kind cannot accidentally restore through an incompatible path.

Do not create separate persistence backends per writer.

## Step 14 — conflict UX

On `409` offer:

1. **Open account version** — protect local unsynced work first.
2. **Keep this device as a copy** — create a new remote document.
3. **Replace account version** — optional only after fresh revision fetch + explicit confirmation.

Default behavior preserves both sides rather than choosing a silent winner.

## Step 15 — auth/database/network failure

### Session expired/auth unavailable

- local writing stays usable;
- local saves continue;
- account sync pauses/prompts re-auth when useful;
- do not clear local content or remote metadata blindly.

### `WRITE_URDU_DB` or network unavailable

- local save continues;
- dirty account state remains pending;
- show truthful paused/unavailable status;
- do not spam retries.

### Oversize/quota

- reject remote save clearly;
- never truncate local content;
- keep local writing safe.

## Step 16 — focused server tests

Cover:

- documents flag disabled;
- unauthenticated CRUD rejected;
- owner is derived from session;
- user A cannot list/get/update/delete user B;
- invalid editor kind rejected;
- title/content size rejected;
- quota enforced;
- list omits full content;
- successful update increments revision;
- stale revision => 409;
- hard delete removes owned row;
- foreign/unknown ID does not leak ownership;
- no-store responses;
- no content logging.

## Step 17 — browser/product tests

Cover:

- signed-out local autosave/history unchanged;
- sign-in does not upload previous history;
- explicit save creates exactly one remote document;
- continued typing updates local immediately and remote only on throttled cadence;
- network/D1/auth failure leaves local save safe;
- second browser/device opens and edits;
- conflict is detected rather than overwritten;
- opening remote content does not destroy a different local current document;
- rich formatting round-trip;
- Urdu/RTL exact round-trip;
- keyboard exact round-trip;
- sign-out leaves local content;
- My Documents mobile layout remains secondary to the writing product.

## Step 18 — privacy/account deletion gate

Before broad promotion:

- update Privacy for account-backed writing storage;
- define individual remote deletion behavior;
- reconcile account deletion with all `owner_user_id` documents;
- do not orphan inaccessible writing by deleting identity rows with no content policy;
- remember local browser drafts are a separate lifecycle.

## Feature gate / rollback

`DOCUMENTS_ENABLED=false` must:

- disable remote document API/UI safely;
- leave local autosave/history working;
- retain remote rows;
- leave auth separately controllable;
- not alter static SEO/public routes.

Do not use rollback to delete user data.

## Stop conditions

Stop and fix if:

- account API becomes required for typing;
- sign-in uploads local history automatically;
- writing is stored in `ACCOUNT_DB`;
- any product query is not owner-scoped;
- D1 writes mirror local debounce;
- rich/Urdu content loses fidelity;
- conflict handling overwrites unseen changes;
- remote open destroys different local content;
- content appears in logs/analytics/query strings;
- implementation starts adding collaboration/team/profile/follower behavior.

## After each slice

Record:

- migration/binding changes;
- API contract actually shipped;
- test counts/results;
- cross-device/browser evidence;
- production proof where applicable;
- branch/PR/commit;
- any divergence from the spec and rationale.

Update `WU-DRAFT-001` status only for behavior actually proven.
