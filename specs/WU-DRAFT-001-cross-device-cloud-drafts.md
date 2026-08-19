# WU-DRAFT-001 — My Documents: Cross-device Account-backed Writing

**Status:** Planned — founder-approved 2026-08-13; reconciled 2026-08-19  
**Area:** Writing persistence / retention  
**Routes:** core writers, `/my-documents`, `/api/documents*`  
**Depends on:** `WU-AUTH-001`  
**Storage:** browser-local first; optional D1 persistence in the existing `METRICS_DB` database when signed in

## 1. Purpose

Let a signed-in user explicitly save selected Urdu writing to an account, reopen it later or on another device, and continue editing without weakening WriteUrdu's local-first behavior.

User-facing name: **My Documents**.

The stable governance ID remains `WU-DRAFT-001` so existing references do not fragment.

## 2. Existing baseline to preserve

WriteUrdu already provides local autosave/history through `js/editor-tools.js`, including editor adapters for the basic writer, Urdu keyboard and rich editor.

Important baseline contracts must be re-read from current `main` before implementation. At the original spec baseline they included:

```text
SAVE_DELAY ≈ 650 ms
DRAFT_PREFIX
HISTORY_PREFIX
recent local history
getText()/getContent()/setContent()/hasContent()/onChange() adapter behavior
```

Do not replace or bypass this local persistence system.

## 3. Core architecture

```text
Editor
  |
  +--> local autosave/history
  |      immediate, offline-safe, unchanged
  |
  +--> optional account persistence
          signed-in + user explicitly opted document in
              |
              v
        /api/documents*
              |
        session.user.id
              |
              v
    existing D1 / env.METRICS_DB
              |
        writing_documents
```

No new D1 database or binding is introduced for documents.

## 4. Shared-database boundary

`METRICS_DB` is the existing WriteUrdu D1 binding and already backs product telemetry/share-artifact data. `WU-AUTH-001` also adds Auth.js tables to this same physical database.

My Documents adds only product-owned document tables.

Expected domain separation:

```text
METRICS_DB
├── existing telemetry tables
├── existing share-artifact tables
├── Auth.js tables
│   ├── users
│   ├── accounts
│   ├── sessions
│   └── verification_tokens
└── writing_documents
```

Rules:

- document code accesses `writing_documents`, not telemetry/share internals;
- authorization identity comes from `getSession()` / `session.user.id`, not direct Auth.js table queries;
- telemetry code never reads document content;
- document content is never written to telemetry or auth tables;
- document migration is additive and cannot alter existing tables;
- no generic “database repository” should expose all tables to all modules.

At the current migration baseline, expected sequencing is conceptually:

```text
0005_authjs_d1_foundation.sql
0006_writing_documents.sql
```

Reconcile exact numbering with current `main` when implementing.

## 5. Privacy boundary

Signing in does **not** automatically upload existing local drafts/history.

After sign-in:

- old local drafts remain on-device;
- current writing remains local until the user chooses **Save to my account**;
- once account-backed, later edits may sync according to this spec;
- deleting an account-backed document does not silently clear unrelated local history;
- document text is never sent to product telemetry/logs merely because it is account-backed.

## 6. Data model

Create a product-owned table:

```sql
writing_documents
- id TEXT PRIMARY KEY
- user_id TEXT NOT NULL
- editor_kind TEXT NOT NULL
- title TEXT
- content TEXT NOT NULL
- plain_text TEXT
- format_version INTEGER NOT NULL
- revision INTEGER NOT NULL
- created_at TEXT NOT NULL
- updated_at TEXT NOT NULL
```

Recommended indexes:

```text
(user_id, updated_at DESC)
(user_id, id)
```

Do not customize Auth.js `users` or `accounts` tables with document fields.

`user_id` stores the stable Auth.js user ID as the ownership subject. Even though identity/documents share the same physical D1 database, product authorization must still come through the auth/session boundary rather than arbitrary joins to provider/account rows.

### Editor kinds

Initial allowed values:

```text
basic
rich
keyboard
```

Do not silently add Card Studio, QR, invoice, images or arbitrary files.

### Format version

Start at `1` and persist it so future rich-editor markup changes can be migrated deliberately.

### Initial limits

Server-side guards:

- title <= 160 characters;
- content <= 750 KB UTF-8 per document;
- max 100 active account-backed documents/user unless product evidence changes the limit.

These are cost/abuse guards, not marketing promises.

## 7. API contract

All routes require a valid `WU-AUTH-001` session and `DOCUMENTS_ENABLED=true`.

All responses are `Cache-Control: no-store`.

### `GET /api/documents`

Returns metadata for the authenticated user's documents ordered by recent activity.

Do not return every full body in the list response.

Suggested fields:

```text
id
title
editorKind
preview
revision
createdAt
updatedAt
```

### `POST /api/documents`

Creates an account-backed document from a validated editor snapshot.

Server generates ID using Web Crypto and assigns `user_id` from `session.user.id`.

Never trust a client-supplied owner ID.

### `GET /api/documents/:id`

Returns a full document only where both `id` and authenticated `user_id` match.

Knowing a UUID is not authorization.

### `PATCH /api/documents/:id`

Requires the caller's last known `revision`.

Equivalent conditional update:

```sql
UPDATE writing_documents
SET title = ?, content = ?, plain_text = ?, revision = revision + 1, updated_at = ?
WHERE id = ? AND user_id = ? AND revision = ?
```

If the stored revision has moved, return `409 Conflict`. Never silently last-write-wins over a newer remote version.

### `DELETE /api/documents/:id`

Hard-delete only the authenticated owner's row in v1.

## 8. Sync behavior

### Local save stays unchanged

Do not map the existing ~650 ms local debounce to D1 writes.

### Remote cadence

For a document already opted into account storage:

- local save remains immediate;
- changed local signature marks remote state dirty;
- sync approximately 20–30 seconds after dirty activity;
- explicit **Save to my account** may write immediately;
- safe best-effort page-hidden sync is acceptable;
- remote failure changes cloud/account status only and never blocks local saving.

## 9. Client state

Keep account-persistence metadata separate from the existing local draft payload.

A locally open account-backed document needs at least:

```text
documentId
lastSyncedRevision
lastSyncedSignature
syncState/error
```

Do not store provider tokens, session cookies, email or provider account IDs in localStorage.

## 10. Conflict handling

V1 detects conflicts; it does not implement collaborative merging.

On `409` show:

**This document changed on another device.**

Recovery choices:

1. **Open account version** — after warning about unsynced local work.
2. **Keep this device as a copy** — create a new account-backed document.
3. **Replace account version** — optional only after explicit confirmation and a fresh revision read.

Default behavior preserves data rather than choosing a winner silently.

## 11. Truthful save status

Local and account persistence are separate truths.

Examples:

```text
Saved on this device
Saved to your account
Saving to your account…
Account save paused — your local draft is safe
This document changed on another device
```

Never display “Saved to your account” when only localStorage succeeded.

## 12. My Documents

Create a noindex `/my-documents` route.

Minimum behavior:

- recent document list;
- title/preview/editor type/modified time;
- open in correct editor;
- rename;
- delete with confirmation;
- copy for conflict recovery;
- useful empty state linking to writing.

Do not build a generic dashboard.

## 13. Safe open/restore

Opening an account document must use the existing editor adapter/handoff model.

Rules:

- never put document text in query strings/public URLs;
- rich content restores as rich content;
- existing non-empty local work is not silently replaced;
- preserve current local work/history or ask before replacement;
- loaded remote revision updates local account metadata correctly.

## 14. Authorization and abuse controls

Every query is scoped by `session.user.id`.

Required rules:

- unauthenticated => 401;
- disabled document feature => safe unavailable response;
- parameterized D1 statements only;
- validate size/title/editor kind server-side;
- no content in logs/telemetry;
- not-found/forbidden responses do not make ownership enumerable;
- add rate protection only when evidence justifies it.

### Shared D1 safety

Document handlers must not mutate existing telemetry/share/Auth.js tables.

The `0006_writing_documents.sql` migration must be additive. Verification must capture the table list before/after and prove existing product endpoints still work.

## 15. Implementation slices

### DOC-A — schema + API

- add `writing_documents` migration to existing migration sequence;
- implement authenticated CRUD against `env.METRICS_DB`;
- enforce owner/validation/quota rules;
- implement revision conflict contract;
- verify existing telemetry/share/Auth.js tables remain intact.

**Exit:** user A cannot read/mutate user B; stale revision deterministically returns 409.

### DOC-B — basic writer pilot

Integrate one common adapter path first.

Deliver:

- explicit **Save to my account**;
- independent local/account status;
- throttled account sync;
- no automatic historical upload;
- local save survives database/API failure.

**Exit:** Google-authenticated user saves on browser A and reopens on browser B.

### DOC-C — My Documents

Ship list/open/rename/delete/copy on `/my-documents`.

### DOC-D — rich + keyboard

Extend the same client persistence module through existing adapters.

Verify exact Urdu/RTL/rich HTML round-trip.

### DOC-E — conflict UX

Ship user-visible 409 recovery choices.

### DOC-F — privacy/deletion/launch closure

- privacy copy matches actual storage;
- document deletion works;
- account deletion policy covers owned documents;
- full regression and production proof completed.

## 16. Tests

Server contract:

- unauthenticated CRUD rejected;
- user isolation on list/get/update/delete;
- invalid editor kind rejected;
- oversized document rejected;
- quota enforced;
- list omits full bodies;
- stale revision => 409;
- hard delete removes row;
- no API logs document content;
- existing telemetry/share/Auth.js tables survive migration.

Browser/product:

- signed-out local autosave works;
- sign-in does not upload existing local history;
- explicit save creates one account document;
- local save remains immediate while D1/API is unavailable;
- remote sync is throttled;
- second browser/device can restore;
- rich formatting survives;
- Urdu/RTL survives exactly;
- conflict is surfaced;
- remote open never silently destroys different local work.

## 17. Rollback

`DOCUMENTS_ENABLED=false` disables account-backed document UI/API behavior while:

- local autosave/history continues;
- existing remote rows remain retained;
- shared `METRICS_DB` and its telemetry/share/Auth.js tables are untouched.

Do not drop `writing_documents` as normal rollback.

## 18. Out of scope

- real-time collaboration;
- automatic merging;
- remote revision history beyond conflict revision;
- public/shared documents;
- comments;
- teams;
- profiles/followers;
- arbitrary file/image storage;
- historical local-draft bulk upload.

## 19. Acceptance criteria

- [ ] No new D1 database is created for My Documents.
- [ ] `writing_documents` is added to existing `METRICS_DB` through an additive migration.
- [ ] Existing telemetry/share/Auth.js tables remain intact.
- [ ] Local autosave/history remains default and works signed out.
- [ ] Sign-in alone uploads nothing.
- [ ] Explicit Save to my account works.
- [ ] All document authorization uses `session.user.id`.
- [ ] Remote writes are throttled, not tied to local debounce.
- [ ] Cross-device restore works for basic/rich/keyboard.
- [ ] Rich HTML and Urdu/RTL survive round-trip.
- [ ] Revision conflict returns 409 and gets recovery UX.
- [ ] Network/D1 failure never blocks local writing.
- [ ] `/my-documents` supports open/rename/delete.
- [ ] Privacy copy explains account-backed writing and deletion.

## Related

- `specs/WU-AUTH-001-social-authentication-foundation.md`
- `specs/WU-ACCOUNT-001-account-document-platform-boundary.md`
- `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`
