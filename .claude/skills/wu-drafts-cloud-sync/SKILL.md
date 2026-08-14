---
name: wu-drafts-cloud-sync
description: Implement or review WU-DRAFT-001 cross-device cloud drafts for WriteUrdu. Load when adding authenticated draft CRUD, D1 draft persistence, Save to my account, My Drafts, restore across devices, sync throttling, or revision conflict handling. Preserve the existing localStorage autosave/history and use the existing editor adapter boundary.
---

# WriteUrdu local-first cloud draft sync

Read before implementation:

1. `specs/WU-DRAFT-001-cross-device-cloud-drafts.md`
2. `specs/WU-AUTH-001-social-authentication-foundation.md`
3. `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`
4. full current `js/editor-tools.js`
5. editor bootstrap code for basic, rich and keyboard routes
6. current D1/Pages Functions documentation and project bindings.

## Core rule

**Cloud drafts extend local drafts; they never replace them.**

The existing local autosave is on the editor's critical path and must remain immediate/offline-capable. Cloud sync is optional and secondary.

Do not map the existing ~650 ms local save debounce to D1 writes.

## Existing contract to preserve

At spec time `js/editor-tools.js` already has:

- `DRAFT_PREFIX` / `HISTORY_PREFIX`;
- recent local history;
- restore/rename/delete;
- draft signatures/deduplication;
- basic/keyboard/rich adapters exposing common content methods.

Re-read the file before coding because these details may evolve.

Do not bypass the adapter abstraction by writing three independent cloud implementations.

## Step 1 — add server data contract first

Create product-owned draft migration separately from Auth.js tables.

Required logical fields:

- `id`;
- `user_id`;
- `editor_kind`;
- `title`;
- `content`;
- `plain_text`;
- `format_version`;
- `revision`;
- timestamps.

Indexes must support user-owned recent-list and owned-ID lookup.

Initial product guards from the spec:

- title <= 160 chars;
- content <= 750 KB UTF-8;
- allowed kinds: `basic`, `rich`, `keyboard`;
- max 100 active cloud drafts/user unless the spec is revised.

## Step 2 — implement user-scoped API before editor integration

Expected routes:

- `GET /api/drafts` — metadata/list only;
- `POST /api/drafts` — create;
- `GET /api/drafts/:id` — full owned draft;
- `PATCH /api/drafts/:id` — update/rename with revision;
- `DELETE /api/drafts/:id` — hard delete.

Every handler:

- requires `getSession()` from the project auth wrapper;
- uses `session.user.id` as owner;
- uses parameterized SQL;
- returns `Cache-Control: no-store`;
- validates limits server-side;
- never logs content;
- never trusts a client-supplied `user_id`.

Knowing a draft UUID is never authorization.

## Step 3 — optimistic concurrency is required

Updates include the client's last known `revision`.

Use an owned conditional update equivalent to:

```sql
UPDATE cloud_drafts
SET content = ?, plain_text = ?, title = ?, revision = revision + 1, updated_at = ?
WHERE id = ? AND user_id = ? AND revision = ?
```

No rows changed because the stored revision moved => `409 Conflict`.

Do not implement silent last-write-wins and do not implement automatic text/HTML merging.

## Step 4 — pilot through one editor adapter

Start with the basic/homepage editor.

Add a separate client module for account persistence; do not bury D1/fetch behavior inside transliteration code.

The first cloud action is explicit:

**Save to my account**

Signing in alone does not upload existing local current/history entries.

Keep cloud metadata separate from the existing local draft payload, including:

- cloud draft ID;
- last synced revision;
- last synced signature;
- sync state/error.

Never store OAuth/session tokens or provider identity in localStorage.

## Step 5 — sync cadence

For a draft already opted into cloud saving:

- local save continues on its existing debounce;
- a local signature change marks cloud state dirty;
- schedule remote write roughly 20–30 seconds later while dirty;
- explicit account save can sync immediately;
- best-effort visibility-change sync is acceptable if safe;
- remote failure only changes cloud status — it must not block/local-save or clear local data.

Do not add per-keystroke network calls.

## Step 6 — truthful UI status

Never collapse local and cloud save into one ambiguous “Saved”.

Represent independently, e.g.:

- `Saved on this device`;
- `Saved to your account`;
- `Saving to your account…`;
- `Cloud save paused — your local draft is safe`;
- `Cloud version changed on another device`.

A failed cloud write must not imply local data is at risk if local save succeeded.

## Step 7 — My Drafts

Build a focused, noindex account route, not a generic dashboard.

Required:

- recent list;
- title/preview/editor kind/modified time;
- open in correct editor;
- rename;
- delete with confirmation;
- empty state linking to writing.

List endpoint should not transfer every full document body.

## Step 8 — safe restore/handoff

Use the existing adapter's content methods or established session/local handoff patterns.

Rules:

- no draft text in query strings;
- rich content restores as rich content, not flattened text;
- if another local current draft exists, do not silently overwrite it;
- preserve local work in history or ask before replacing;
- opening from cloud updates cloud metadata/revision correctly.

## Step 9 — extend basic pilot to rich + keyboard

Use the same module and API.

Verify:

- TinyMCE formatting survives exact round-trip;
- Urdu characters/RTL content survive unchanged;
- keyboard editor survives unchanged;
- local history still works independently;
- one editor kind cannot restore through an incompatible path accidentally.

## Step 10 — conflict UX

On 409 offer recovery instead of retry-overwriting:

1. Open cloud version.
2. Keep this device as a new copy.
3. Optional explicit Replace cloud version only after fetching fresh revision and confirming.

Default must preserve data, not pick a winner silently.

## Tests

Server contract:

- unauthenticated CRUD rejected;
- user A cannot list/get/update/delete user B's draft;
- invalid kind/oversize/quota rejected;
- list omits full content body;
- stale revision => 409;
- hard delete actually removes row.

Browser/product:

- signed-out local autosave still works;
- sign-in does not upload prior local history;
- explicit save creates one remote draft;
- local save remains immediate during network failure;
- remote sync is throttled;
- cross-browser/device restore works;
- rich formatting survives;
- Urdu text survives;
- conflict is surfaced;
- remote open does not silently destroy different local work.

Run the full existing WriteUrdu tests after focused tests.

## Cost/privacy review

Before launch re-check current D1 limits. Inspect projected writes using the actual sync cadence and likely active users. Do not solve hypothetical scale with complex queues/DOs unless evidence requires it.

Update Privacy before cloud storage is enabled. User content must not be sent to analytics/logging merely because it is cloud-saved.

## Stop conditions

Stop and fix if:

- cloud API becomes required for typing;
- historical local drafts upload on login without explicit action;
- any query is not scoped by user ID;
- cloud writes occur on the 650 ms local debounce;
- rich formatting is lost;
- conflict resolution overwrites unseen remote changes;
- remote restore destroys a different local draft without warning.

## After implementation

Update `WU-DRAFT-001`, the registry, canonical backlog and implementation plan with shipped evidence. Keep cloud features independently disableable so local drafts remain the fallback.
