# WU-DRAFT-001 — Cross-device Cloud Drafts

**Status:** Planned — founder-approved 2026-08-13  
**Area:** Writing persistence / retention  
**Routes:** core writing editors, `/my-drafts`, `/api/drafts*`  
**Depends on:** `WU-AUTH-001`  
**Storage:** existing localStorage first; optional Cloudflare D1 sync when signed in

## Purpose

Let a signed-in user save selected Urdu writing drafts to an account, see them later, and restore/edit them from another device without weakening WriteUrdu's current local-first behavior.

This feature extends the draft system already present in `js/editor-tools.js`. It does **not** replace it.

## Existing baseline to preserve

WriteUrdu already provides:

- automatic local save after a short debounce;
- separate draft keys per editor kind;
- recent local history;
- restore, rename, delete and clear-history actions;
- adapters for basic, keyboard and TinyMCE rich editors;
- a current-draft signature used to avoid duplicate saves;
- user-facing status such as “Saved on this device”.

At approval time the important constants/contracts include:

- `SAVE_DELAY = 650`;
- `DRAFT_PREFIX = 'write-urdu:draft:v1:'`;
- `HISTORY_PREFIX = 'write-urdu:history:v1:'`;
- `MAX_HISTORY_ITEMS = 5`;
- adapter methods including `getText()`, `getContent()`, `setContent()`, `hasContent()` and `onChange()`.

Implementation must build on this adapter boundary instead of adding editor-specific cloud code to each writing page.

## Core product rule

```text
Editor
  |
  +--> local autosave (existing, immediate, offline-safe)
  |
  +--> optional account sync (signed-in + user opted this draft into cloud saving)
             |
             v
          /api/drafts
             |
        session.user.id
             |
             v
       WRITE_URDU_DB
```

Local save remains the fastest and most reliable safety layer. Cloud sync provides cross-device continuity, not keystroke-level persistence.

## Privacy boundary

Signing in must **not automatically upload existing local drafts or local history**.

After sign-in:

- historical local drafts stay on the device;
- the user explicitly chooses **Save to my account** for a draft;
- once a draft is cloud-enabled, later edits may sync automatically according to the throttling contract below;
- deleting a cloud draft must not silently delete unrelated local history unless the UI explicitly says so.

This preserves the trust promise that writing is local by default.

## Data model

Create a product-owned table separate from Auth.js tables. Suggested logical shape:

```sql
cloud_drafts
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

- `(user_id, updated_at DESC)` for My Drafts;
- `(user_id, id)` or equivalent ownership lookup where useful.

Use hard delete in v1 unless a later retention requirement justifies soft delete. A deleted cloud draft should be actually removed from the product table rather than hidden indefinitely.

### `editor_kind`

Initial allowed values:

- `basic`;
- `rich`;
- `keyboard`.

Do not silently add Card Studio, QR, invoice or image/project data to this table. Those require separate format/storage decisions.

### `format_version`

Start at `1` and persist it with every cloud draft. The field exists so future editor markup changes can be migrated deliberately rather than assuming today's rich-editor HTML is permanent.

### Limits

The API must impose product-level limits below platform maxima. Initial contract:

- maximum title length: 160 characters;
- maximum content payload: 750 KB UTF-8 per draft;
- maximum active cloud drafts per user: 100 unless product evidence supports a different number.

These limits are abuse/cost guards, not marketing promises. They may be tuned later without changing the local-draft contract.

## API contract

All routes require `WU-AUTH-001` session authorization and `Cache-Control: no-store`.

### `GET /api/drafts`

Returns only drafts owned by `session.user.id`, ordered by most recently updated. The list response should use metadata/preview rather than sending every full document body.

Suggested fields:

- `id`;
- `title`;
- `editorKind`;
- short plain-text preview;
- `revision`;
- `createdAt`;
- `updatedAt`.

### `POST /api/drafts`

Creates a cloud draft from the current editor snapshot. Validate kind, size and quota server-side. Generate ID server-side with Web Crypto.

### `GET /api/drafts/:id`

Returns the full owned draft. A caller knowing another user's draft ID must receive no data.

### `PATCH /api/drafts/:id`

Updates title/content only for the authenticated owner. Require the caller's last known `revision` and perform optimistic concurrency.

Example behavior:

`UPDATE ... SET ..., revision = revision + 1 WHERE id = ? AND user_id = ? AND revision = ?`

If no row is updated because the revision changed, return `409 Conflict` with enough metadata for the client to offer recovery choices. Never silently overwrite a newer remote revision.

### `DELETE /api/drafts/:id`

Hard-deletes only the authenticated user's draft.

## Sync behavior

### Local autosave remains unchanged

Do not send a D1 write on every existing 650 ms local autosave. That would convert typing into backend traffic and make cloud availability part of the editor's critical path.

### Cloud sync cadence

For a cloud-enabled draft:

- local autosave still happens normally;
- mark cloud state dirty when the local draft signature changes;
- sync after approximately 20–30 seconds of dirty activity, not every keystroke;
- explicit `Save to my account` / manual save may sync immediately;
- a best-effort sync may run when the page becomes hidden if a request can safely complete;
- failed cloud sync never prevents local save.

Exact timing can be tuned, but the contract is **seconds/tens of seconds, not the 650 ms local debounce**.

## Client state

Keep cloud metadata separate from the existing draft payload. A cloud-enabled local document needs at least:

- `cloudDraftId`;
- `lastSyncedRevision`;
- `lastSyncedSignature`;
- latest cloud sync status/error.

Do not put provider identity, email or OAuth tokens in localStorage.

## Conflict handling

Cross-device editing makes last-write-wins unsafe. V1 does not need collaborative merging, but it must detect conflicts.

On `409` show a clear recovery surface such as:

**This draft changed on another device.**

Actions:

1. **Open cloud version** — load the newer remote revision after warning about unsynced local changes.
2. **Keep this device as a copy** — create a new cloud draft from local content.
3. **Replace cloud version** — optional only after explicit confirmation and a fresh revision read; never the default.

Do not attempt automatic HTML/text merging in v1.

## Editor UX

Existing status:

`Saved on this device`

Signed-in cloud-enabled state can show two independent truths:

- `✓ Saved on this device`
- `☁ Saved to your account`

Other states:

- `Saving to your account…`
- `Cloud save paused — your local draft is safe`
- `Sign in to save across devices`
- `Cloud version changed on another device`

Never imply cloud success when only localStorage succeeded.

## My Drafts

Create a noindex `/my-drafts` account page or equivalent v2-shell route.

Minimum behavior:

- list cloud drafts by recent activity;
- title + preview + editor type + modified time;
- open in the correct existing editor;
- rename;
- delete with confirmation;
- create a copy where needed for conflict recovery;
- useful empty state that sends the user to a writing editor.

Do not build a generic dashboard with unrelated widgets.

## Restore/open behavior

Opening a cloud draft must use the existing editor adapter/handoff model. The route should know which editor kind owns the draft and restore through `setContent()` or the existing safe initialization path.

Never place draft text in query strings or public URLs.

If a local unsaved/current draft already exists in the target editor, do not silently replace it. Offer a choice or preserve it as local history before opening the cloud draft.

## Authorization and abuse controls

- Every query is scoped by `session.user.id`.
- Never authorize by email.
- Validate body size before D1 write.
- Enforce allowed editor kinds.
- Use parameterized statements only.
- Do not expose full document content in logs or error telemetry.
- Return generic not-found/forbidden behavior that does not make user-owned IDs enumerable.
- Add basic write-rate protection if production usage shows abuse; do not add complex infrastructure preemptively.

## Implementation slices

### A — schema + draft API

- create migration and indexes;
- implement authenticated CRUD;
- implement revision conflict contract;
- add unit/contract tests with fake/local D1.

**Exit:** API cannot read or mutate another user's draft and 409 conflict behavior is deterministic.

### B — basic editor pilot

Integrate cloud save with one existing adapter path first, preferably the homepage/basic editor, while keeping local save untouched.

- explicit Save to my account;
- cloud status;
- throttled sync;
- restore after reload;
- no automatic migration of older local history.

**Exit:** a Google-authenticated user can write, save to account, open on a second browser/device and continue.

### C — rich + keyboard editors

Extend the same cloud client through the adapter abstraction. Do not fork independent persistence implementations.

**Exit:** all three writing editor kinds use one cloud persistence module and existing local behavior is unchanged.

### D — My Drafts + conflict UX

Ship list/rename/delete/open/copy and 409 recovery.

### E — Facebook regression

Once `WU-AUTH-001` Facebook support is added, prove that drafts created under either independently authenticated account remain correctly isolated. Do not merge identities automatically.

## Testing

### Contract

- unauthenticated CRUD => 401;
- create/list/get/update/delete only affect session user;
- oversized draft rejected;
- invalid editor kind rejected;
- quota enforced;
- stale revision update => 409;
- list does not return full bodies unnecessarily;
- delete is hard delete;
- no API logs content.

### Browser

- local autosave still works while signed out;
- sign-in does not upload existing local history;
- explicit Save to my account creates one remote draft;
- continued typing updates local immediately and cloud on throttled cadence;
- network/D1 failure leaves local draft safe;
- second browser/device can open and edit the draft;
- conflict is detected, not overwritten;
- opening remote content does not silently destroy a different local draft;
- rich formatting survives cloud round-trip;
- Urdu text and RTL content survive round-trip exactly.

## Rollback

Cloud draft UI must be disableable independently from core local drafts. If cloud sync is disabled or the API is unavailable:

- local autosave/history continues;
- editors remain usable;
- existing cloud data is retained;
- the UI states that account sync is unavailable rather than pretending success.

## Out of scope

- real-time collaborative editing;
- automatic merge algorithms;
- unlimited document storage;
- cloud image/blob/project storage;
- document sharing/public links;
- teams;
- comments;
- versioned remote history beyond the current revision/conflict mechanism;
- automatically uploading all historical local drafts.

## Acceptance criteria

- [ ] Existing local autosave/history remains the default and works signed out.
- [ ] No historical local draft is uploaded merely because the user signs in.
- [ ] User can explicitly save a current writing draft to the account.
- [ ] Cloud writes are throttled and never mirror the 650 ms local debounce.
- [ ] Draft CRUD is authorized strictly by `session.user.id`.
- [ ] Cross-device restore works for basic, rich and keyboard editor kinds.
- [ ] Rich HTML/Urdu text survives round-trip.
- [ ] Revision conflict returns 409 and receives user-visible recovery choices.
- [ ] Network/cloud failure never blocks local saving.
- [ ] `/my-drafts` supports open, rename and delete.
- [ ] Cloud status distinguishes local save from account save.
- [ ] Privacy policy explains what is stored and how to delete it.

## Related

- `WU-AUTH-001` — authentication/session dependency.
- `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md` — execution plan.
- `js/editor-tools.js` — existing local draft/editor adapter implementation to preserve.
