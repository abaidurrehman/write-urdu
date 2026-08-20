# WU-DRAFT-001 DOC-C — My Documents + Share Link implementation record

**Date:** 2026-08-20  
**Branch:** `agent/my-documents-doc-c`  
**Depends on:** merged DOC-A API/schema, merged DOC-B Basic Writer account saving, production `0006_writing_documents.sql`

## Delivered

- `/my-documents` is a noindex, no-store Pages Function shell rather than an indexable acquisition page.
- Signed-in users can list, open, rename, make a private copy, delete, and explicitly create a public Share link from account-saved Basic Writer documents.
- Document list responses remain metadata-only; full writing is fetched only for an explicit open/copy/share action.
- Opening a Basic Writer document uses a short-lived, consume-once `sessionStorage` handoff. Document text never enters a query string.
- If different writing is already open, Write Urdu flushes the existing local save/history first and asks before replacing the editor.
- The account association is cleared before incoming text is applied, preventing the incoming editor event from accidentally updating the previously associated remote document.
- Rename remains revision-protected; a 409 conflict refreshes rather than silently overwriting a newer remote version.
- Delete removes only the account copy and explicitly does not delete browser-local draft/history.

## Share boundary

`Share link` reuses `WU-SHARE-001` rather than exposing `writing_documents` publicly.

The flow is:

`private account document -> explicit confirmation -> generated PNG preview + bounded public text -> /api/shares -> /s/:id snapshot`

Rules:

- the account document remains private;
- publication is explicit, never automatic;
- the public URL is an immutable snapshot for this phase;
- later account-document edits do not silently update the public share;
- publication uses existing `source_tool=basic_editor` because DOC-C only has Basic Writer account documents;
- the existing 8,000-character share-text ceiling is preserved;
- share management token stays browser-local in the existing share-management store;
- no collaboration, ACL, comments, followers, teams, or public profiles are introduced.

## Homepage/account entry points

Once the document feature is available:

- the homepage account card can truthfully say **Save for later · Continue on another device · Share with a link**;
- signed-in users get a **My Documents** action on that card;
- the signed-in account menu gets a **My Documents** entry.

The old planned `My drafts` / `/my-drafts` workspace registry entry is retired and replaced by the current `My Documents` / `/my-documents` workspace.

## Privacy, caching and monetization

- `/my-documents` sends `Cache-Control: private, no-store, max-age=0`.
- It sends `X-Robots-Tag: noindex, follow, noarchive` and matching HTML robots metadata.
- The service worker bypasses the `/my-documents` shell and all `/api/*` calls.
- Static JS/CSS assets may be refreshed in the app shell; private/account HTML and API responses are never put in Cache API.
- `/my-documents` is classified with account/trust routes and contains no AdSense markup.

## Deferred to later slices

- Rich Editor account save/open integration.
- Urdu Keyboard account save/open integration.
- richer conflict recovery UI (open account version / keep device as copy / explicit replace) beyond current safe pause/refresh/copy primitives.
- collaboration, teams, followers, comments or public profiles.

## Verification expectations

The DOC-C contract locks:

- My Documents terminology and current workspace registry status;
- noindex/no-store account shell;
- owner-scoped document client actions;
- short-lived private open handoff;
- local-save-before-replace behavior;
- explicit public snapshot confirmation;
- reuse of `/api/shares` rather than public document access;
- ad-free/private cache boundaries;
- unchanged 650 ms local autosave contract.
