# WU-DRAFT-001 — My Documents: Cross-device Account-backed Writing

**Status:** Planned — founder-approved 2026-08-13; implementation contract reconciled 2026-08-19  
**Area:** Writing persistence / retention  
**User-facing name:** **My Documents**  
**Routes:** core writing editors, `/my-documents`, `/api/documents*`  
**Depends on:** `WU-AUTH-001`  
**Parent boundary:** `WU-ACCOUNT-001`  
**Storage:** existing browser-local persistence remains primary; optional `WRITE_URDU_DB` persistence for explicitly account-saved writing

## 1. Purpose

Let a signed-in user explicitly save selected Urdu writing to their account, see it in **My Documents**, reopen it later or on another device, and continue editing without weakening WriteUrdu's current local-first behavior.

The stable feature ID remains `WU-DRAFT-001` for governance/history, but the user-facing product concept is **Documents**, not “cloud drafts”. Users should not need to understand backend storage terminology.

The first valuable authenticated loop is:

```text
write
→ local save continues automatically
→ Save to my account
→ My Documents
→ open on another session/device
→ continue writing
```

This feature extends the current local draft/editor adapter system. It does **not** replace it.

## 2. Existing local baseline to preserve

At reconciliation time WriteUrdu already has local writing persistence through `js/editor-tools.js`, including:

- automatic local save after a short debounce;
- separate persistence per editor kind;
- recent local history;
- restore/rename/delete/clear-history behavior;
- adapters for basic, keyboard and TinyMCE rich editors;
- content/signature logic used to avoid redundant saves;
- user-visible local status such as `Saved on this device`.

Earlier known constants included:

```text
SAVE_DELAY = 650
DRAFT_PREFIX = write-urdu:draft:v1:
HISTORY_PREFIX = write-urdu:history:v1:
MAX_HISTORY_ITEMS = 5
```

These are implementation evidence, not permanent values. Re-read current `js/editor-tools.js` before coding.

The important invariant is the adapter boundary: cloud/account persistence must not be implemented three separate times inside transliteration, keyboard and TinyMCE code.

## 3. Core product rule

```text
Editor
  |
  +--> browser-local save/history
  |       immediate / existing / offline-safe
  |
  +--> optional account persistence
          only after explicit Save to my account
                 |
                 v
           /api/documents
                 |
          session.user.id
                 |
                 v
          WRITE_URDU_DB
```

Local save remains the fastest and most reliable safety layer.

Account persistence provides continuity, not keystroke-level durability and not real-time collaboration.

## 4. Identity/content separation

`WU-AUTH-001` uses a dedicated:

```text
ACCOUNT_DB
```

for Auth.js identity/session tables.

This feature uses a separate:

```text
WRITE_URDU_DB
```

for user writing.

Never store writing content in Auth.js `users`, `accounts`, `sessions` or `verification_tokens` records.

Because the two D1 databases are separate, store the stable Auth.js `session.user.id` as an opaque owner ID in product tables. Do not require a cross-database foreign key.

Do not use email as document ownership.

## 5. Privacy boundary

Signing in must **not automatically upload existing local writing or local history**.

After sign-in:

- existing local documents/history stay on the device;
- the current editor still saves locally as before;
- the user explicitly chooses **Save to my account** for a document;
- only then is an account-backed document created;
- after opt-in, later edits to that document may sync according to the throttling contract;
- deleting an account-backed document must not silently delete unrelated local history;
- sign-out must not erase local or remote documents.

This prevents an account action from becoming a hidden content-upload action.

## 6. Product-owned data model

Use a writing-specific table rather than a generic arbitrary file drive.

Recommended logical shape:

```sql
writing_documents
- id TEXT PRIMARY KEY
- owner_user_id TEXT NOT NULL
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
(owner_user_id, updated_at DESC)
(owner_user_id, id)
```

If current D1 query-planner/index behavior makes one index redundant, implementation may simplify it while preserving owned recent-list and owned-ID lookup performance.

### 6.1 `id`

Generate server-side using Web Crypto/platform-supported secure random IDs such as `crypto.randomUUID()`.

IDs are unguessable convenience identifiers, **not authorization**.

### 6.2 `owner_user_id`

Always derive from authenticated `session.user.id` server-side.

Never accept `owner_user_id` from client input.

### 6.3 `editor_kind`

Initial allowed values:

```text
basic
rich
keyboard
```

Do not silently add Card Studio, invoice, QR, image/project or arbitrary uploaded files to this table. Those need separate content/storage decisions.

### 6.4 `content`

- `basic` / `keyboard`: canonical text content;
- `rich`: canonical sanitized/accepted rich-editor HTML according to the current editor contract.

Do not flatten rich content into plain text for storage.

### 6.5 `plain_text`

Optional normalized text used for safe list previews/search later. It is not the canonical rich document body.

### 6.6 `format_version`

Start at `1` unless implementation evidence requires another value.

Persist a version with every row so future editor markup/schema changes can be migrated deliberately.

### 6.7 `revision`

Start at `1` and increment on every successful content/title update.

Revision is the v1 conflict-detection mechanism. It is not full version history.

## 7. Initial limits and abuse/cost guards

Enforce server-side limits below platform maxima.

Initial contract:

- maximum title length: 160 Unicode characters;
- maximum content payload: 750 KB UTF-8 per document;
- maximum active account-backed writing documents: 100 per user;
- allowed editor kinds only;
- bounded request body size before parsing/writing where practical.

These are operational guards, not marketing promises. They may be tuned later with product evidence.

Do not introduce Queues, Durable Objects or complex rate infrastructure preemptively. Add bounded per-user/IP write protection only when evidence/abuse requires it.

## 8. API contract

All account-document routes require `WU-AUTH-001` session authorization and return `Cache-Control: no-store`.

Use product-facing route names:

```text
GET    /api/documents
POST   /api/documents
GET    /api/documents/:id
PATCH  /api/documents/:id
DELETE /api/documents/:id
```

If Pages Functions routing requires another physical file layout, preserve these logical HTTP contracts.

### 8.1 `GET /api/documents`

Returns only documents owned by `session.user.id`, most-recently-updated first.

List payload should contain metadata/preview, not every full document body.

Suggested response item:

```json
{
  "id": "...",
  "title": "...",
  "editorKind": "basic",
  "preview": "...",
  "revision": 4,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### 8.2 `POST /api/documents`

Creates one account-backed document from the current editor snapshot.

Server must:

- authenticate;
- derive owner from session;
- validate kind/title/content/size/quota;
- generate ID server-side;
- set format version/revision/timestamps;
- return the created metadata including revision.

Do not upload all local history in a batch during sign-in.

### 8.3 `GET /api/documents/:id`

Returns the full owned document.

Every lookup is scoped by both:

```text
id + owner_user_id
```

A caller who knows another user's ID receives no content. Prefer generic not-found semantics that do not make ownership enumerable.

### 8.4 `PATCH /api/documents/:id`

Updates owned title/content using optimistic concurrency.

The request includes the client's last known `revision`.

Equivalent SQL contract:

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

If no row is updated because the stored revision changed, return:

```text
409 Conflict
```

with safe current metadata/revision needed for recovery.

Never silently last-write-wins over a newer remote edit.

### 8.5 `DELETE /api/documents/:id`

Hard-delete only the authenticated owner's row in v1.

A later recycle-bin/version-retention feature requires its own spec. Do not keep deleted user content indefinitely by default.

## 9. Cloud/account sync behavior

### 9.1 Existing local save remains unchanged

Do not map the existing ~650ms local-save debounce to D1 writes.

Typing must not become backend traffic on every pause/keystroke.

### 9.2 First account save is explicit

A local document becomes account-backed only after an explicit action such as:

**Save to my account**

That action may create the remote row immediately.

### 9.3 Continued account sync cadence

For a document already opted into account storage:

- local save continues on the existing cadence;
- a local content signature change marks remote state dirty;
- sync after roughly 20–30 seconds of dirty activity;
- manual save may sync immediately;
- a best-effort visibility/page-hide flush may be used only if it can complete safely;
- remote failure never blocks or rolls back local save;
- multiple dirty changes should coalesce rather than enqueue one request per local save.

Exact timing can be tuned, but the contract is **seconds/tens of seconds, not hundreds of milliseconds**.

## 10. Client metadata

Keep account-sync metadata separate from the existing canonical local draft body.

A locally open account-backed document needs at least:

```text
remoteDocumentId
lastSyncedRevision
lastSyncedSignature
syncState
lastSyncErrorCategory nullable
```

Do not store:

- provider access/refresh tokens;
- Auth.js session tokens/cookies;
- provider account IDs;
- user email as ownership identity.

## 11. Truthful save-status UX

Never collapse local and account persistence into one ambiguous `Saved` state.

Show independent truths, for example:

```text
Saved on this device
Saved to your account
Saving to your account…
Account save paused — your writing is safe on this device
This document changed on another device
```

If local save succeeds and account sync fails, the UI must reassure accurately without claiming remote success.

## 12. My Documents

Create a focused, noindex `/my-documents` account surface using the v2 shell.

Minimum behavior:

- recent documents ordered by updated time;
- title;
- short safe preview;
- editor type only when useful for orientation;
- modified time;
- open in the correct existing writer;
- rename;
- delete with confirmation;
- duplicate/create-copy where needed for conflict recovery;
- useful empty state leading into writing.

Do not build a generic dashboard full of unrelated account, team or analytics widgets.

Do not expose the internal term `cloud_drafts` or `writing_documents` in user-facing UI.

## 13. Safe open/restore behavior

Opening a remote document must use the existing editor adapter/handoff model.

Rules:

- never put document content in query strings/public URLs;
- resolve the owning editor kind from server metadata;
- restore through the current safe `setContent()`/initialization adapter path;
- rich content remains rich;
- Urdu/RTL text must round-trip exactly;
- opening one remote document must not silently destroy a different unsaved/current local document;
- preserve the current local document into history or ask/offer a safe choice before replacement;
- update local remote-document metadata only after the open/import succeeds.

## 14. Cross-device conflict handling

V1 is not collaborative editing, but it must detect concurrent edits.

When an update returns `409`, show a recovery surface such as:

**This document changed on another device.**

Actions:

1. **Open account version** — fetch/open the newer remote version after protecting unsynced local work.
2. **Keep this device as a copy** — create a new account document from local content.
3. **Replace account version** — optional only after fetching a fresh revision and explicit confirmation; never the default.

Do not implement automatic text/HTML merging in this feature.

## 15. Authorization and security

Every handler must:

- authenticate through `getSession()` from the project auth wrapper;
- derive owner from `session.user.id`;
- scope every SQL statement by owner;
- use parameterized D1 statements;
- validate payload limits server-side;
- return non-cacheable private responses;
- never log document content;
- avoid returning another user's existence/metadata;
- use secure generated IDs;
- normalize operational errors without leaking SQL/auth internals.

A UUID is not authorization. Email is not authorization. Editor kind from the client is not trusted until validated.

## 16. Failure behavior

### Auth unavailable/expired

- local writing remains fully usable;
- local save/history continues;
- account-save controls prompt safe re-authentication when appropriate;
- do not clear remote metadata blindly;
- do not replace local content.

### `WRITE_URDU_DB` unavailable

- local save continues;
- show account-sync unavailable/paused state;
- retain dirty status for a later explicit/scheduled retry;
- avoid aggressive retry loops.

### Network failure

Same as database failure: protect local work first.

### Oversize/quota

Return a clear bounded error without truncating content silently. Local copy remains intact.

## 17. Account deletion interaction

Before account-backed documents are broadly promoted, account deletion behavior must be defined with `WU-AUTH-001`.

Deletion design must explicitly decide what happens to all rows whose:

```text
owner_user_id = deleted account user ID
```

Do not orphan indefinitely retained writing by deleting identity rows while leaving product content inaccessible with no policy.

Local browser drafts are separate and cannot be assumed deleted by remote account deletion.

## 18. Implementation slices

### DOC-A — schema + authenticated API

Use `.claude/skills/wu-drafts-cloud-sync/SKILL.md`.

Deliver:

- `WRITE_URDU_DB` binding/config contract;
- `writing_documents` migration/indexes;
- authenticated CRUD;
- server validation/limits;
- optimistic revision conflict behavior;
- user-isolation tests;
- disabled/unavailable behavior behind `DOCUMENTS_ENABLED`.

**Exit:** no editor depends on the API yet; user A cannot read or mutate user B; stale revision deterministically returns 409.

### DOC-B — basic writer pilot

Integrate through one shared account-persistence client module and the existing basic/homepage adapter.

Deliver:

- explicit `Save to my account`;
- separate local/account status;
- remote metadata;
- throttled sync;
- safe restore/reload;
- no automatic import of historical local history.

**Exit:** signed-in user can write → save → reopen the same document from a second browser/device.

### DOC-C — My Documents

Build `/my-documents` list/open/rename/delete/copy and safe empty state.

**Exit:** product has a coherent return journey, not just a hidden API.

### DOC-D — rich + keyboard

Extend the same module through the existing adapters.

**Exit:** all three writing modes use one account-document persistence boundary and preserve their formats exactly.

### DOC-E — conflict recovery UX

Wire the 409 contract into the three recovery actions.

### DOC-F — launch/privacy/deletion closure

Prove privacy copy, deletion semantics, production storage, regressions and rollout/rollback behavior before broad promotion.

## 19. Feature gates

Use independent rollout flags:

```text
AUTH_ENABLED
DOCUMENTS_ENABLED
```

If `DOCUMENTS_ENABLED=false`:

- `/api/documents*` fails closed/unavailable safely;
- My Documents/account-save UI is hidden/safe-disabled;
- local drafts/history continue exactly as before;
- existing remote rows remain retained until normal deletion policy/action.

Do not couple the flag to transliteration/editor initialization.

## 20. Tests

### 20.1 Server contract

- unauthenticated document CRUD => 401/safe auth-required response;
- disabled documents feature => safe disabled behavior;
- user A cannot list/get/update/delete user B content;
- create derives owner from session, not request body;
- invalid editor kind rejected;
- oversize title/content rejected;
- quota enforced;
- list omits full bodies;
- stale revision => 409;
- successful update increments revision exactly once;
- hard delete removes the owned row;
- unknown/foreign ID does not leak ownership/existence;
- responses are `no-store`;
- no API logs content.

### 20.2 Browser/product

- signed-out local autosave/history still works;
- sign-in does not upload previous local history;
- explicit save creates one remote document;
- continued typing saves locally immediately and remotely only on throttled cadence;
- auth/network/D1 failure never blocks local save;
- second browser/device opens and edits the document;
- a stale second-device update is detected rather than overwritten;
- remote open does not silently destroy a different local document;
- TinyMCE formatting survives exact round trip;
- Urdu characters, punctuation and RTL direction survive round trip;
- keyboard editor content survives round trip;
- sign-out leaves local work intact;
- My Documents works on narrow/mobile layouts without becoming the primary writing UI.

## 21. Production proof

Before declaring account-backed documents ready:

1. authenticate with real production Google account;
2. create meaningful Urdu document on device/browser A;
3. confirm local save;
4. explicitly save to account;
5. verify owned row in `WRITE_URDU_DB` without logging/document exposure;
6. open My Documents on device/browser B;
7. open and edit the document;
8. verify revision increments;
9. force a two-device stale revision and verify 409/recovery;
10. simulate network/API failure and verify local safety/status;
11. delete a test document and verify hard deletion;
12. confirm anonymous homepage/rich/keyboard behavior remains unchanged;
13. confirm static SEO/canonical routes are unaffected by Functions routing.

## 22. Rollback

Disabling `DOCUMENTS_ENABLED` must leave:

- browser-local save/history working;
- editors usable;
- remote stored rows intact;
- account identity/session behavior independently controllable;
- SEO/static routes unchanged.

Do not implement rollback by deleting data or clearing local storage.

## 23. Stop conditions

Stop and fix if:

- account API becomes required for typing;
- sign-in uploads historical local writing without explicit action;
- content is written into `ACCOUNT_DB` Auth.js tables;
- any SQL query is not scoped by stable owner ID;
- cloud/account writes occur on the local ~650ms debounce;
- rich formatting/Urdu text is lost;
- conflict handling retries into last-write-wins;
- remote open destroys different local work without recovery;
- document content appears in logs/analytics/query strings;
- implementation starts adding collaboration/team/social behavior not authorized here.

## 24. Out of scope

- real-time collaborative editing;
- comments/suggestions;
- per-document collaborator ACLs;
- team workspaces;
- public profiles/following;
- public document URLs;
- generic arbitrary file storage;
- Google Drive/Dropbox/OneDrive sync;
- Card Studio image/project storage;
- unlimited storage;
- automatic merge algorithms;
- full remote revision history/recycle bin;
- automatically uploading historical local drafts.

Public sharing already has its own `WU-SHARE-001` product path and must not be conflated with private account-document storage.

## 25. Acceptance criteria

- [ ] Existing browser-local save/history remains the default and works signed out.
- [ ] Auth identity lives in `ACCOUNT_DB`; writing lives in `WRITE_URDU_DB`.
- [ ] No historical local writing uploads merely because the user signs in.
- [ ] User can explicitly save the current writing document to the account.
- [ ] Account writes are throttled and never mirror the local autosave debounce.
- [ ] CRUD authorization is strictly scoped by `session.user.id`.
- [ ] Cross-device reopen/edit works for basic, rich and keyboard writing.
- [ ] Rich HTML and Urdu/RTL text survive round trip exactly.
- [ ] Revision conflict returns 409 and has user-visible recovery choices.
- [ ] Network/auth/database failure never blocks local saving.
- [ ] `/my-documents` supports open, rename, delete and safe copy/recovery behavior.
- [ ] UI distinguishes local save from account save truthfully.
- [ ] Deletion/privacy behavior matches actual remote storage.
- [ ] Collaboration/teams/social graph are not introduced by this implementation.

## Related

- `specs/WU-ACCOUNT-001-account-document-platform-boundary.md`
- `specs/WU-AUTH-001-social-authentication-foundation.md`
- `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md`
- `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`
- `js/editor-tools.js`
- `.claude/skills/wu-drafts-cloud-sync/SKILL.md`
