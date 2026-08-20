# WU-DRAFT-001 DOC-D — Rich Editor + Urdu Keyboard account documents

Status: implementation in progress
Date: 2026-08-20

## Scope

DOC-D extends the already-merged My Documents account persistence loop from the Basic Writer to the existing Rich Editor and Urdu Keyboard adapters.

It does **not** change the document schema, authentication model, local autosave cadence, collaboration scope, or conflict-resolution UX.

## Reuse boundary

Current `js/editor-tools.js` already exposes a common adapter contract for:

- `basic` — plain text
- `rich` — TinyMCE HTML through `getContent()` and plain text through `getText()`
- `keyboard` — plain text

All three expose `getText()`, `getContent()`, `setContent()`, `hasContent()` and `onChange()` through `window.WriteUrduTools.adapter`.

DOC-D must use that boundary rather than reading TinyMCE internals or keyboard DOM state directly.

## Deliverables

1. Extend `js/account-documents.mjs` so document creation is parameterized by the current editor kind while remaining backward-compatible with Basic Writer.
2. Add Rich Editor + Urdu Keyboard account-save UI with the same explicit first action: **Save to my account**.
3. Keep local save/history immediate and independent; account sync remains throttled at 25 seconds after opt-in.
4. Extend `/my-documents` Open routing:
   - `basic` -> `/`
   - `rich` -> `/urdu-editor`
   - `keyboard` -> `/urdu-keyboard`
5. Use the existing short-lived, consume-once session handoff for full private document content; never place content in URLs.
6. Before replacing different non-empty local work, force the existing local draft/history save and require confirmation.
7. Preserve the fetched account revision and editor kind after restore so subsequent account sync updates the correct row.
8. Verify exact Rich Editor HTML and Urdu/RTL text round-trips.
9. Keep `DOCUMENTS_ENABLED=false` as the rollback switch.

## Sharing compatibility

My Documents already exposes **Share link**. DOC-D must not make that action misleading for Rich Editor or Urdu Keyboard documents.

The public artifact remains a plain-text snapshot at `/s/:id`; rich private HTML is not published. The share service may record the originating editor kind for telemetry/presentation, but this must not expose private HTML or create public document ACLs.

## Explicit non-goals

- conflict recovery choices (DOC-E)
- real-time collaboration
- comments or teams
- public live documents
- rich public HTML publishing
- automatic upload of old local drafts/history
- schema or migration changes

## Acceptance

- signed-out Rich Editor and Urdu Keyboard continue using local save only;
- sign-in alone uploads nothing;
- explicit Save to my account creates the correct `editor_kind`;
- later account sync stays throttled;
- Rich Editor HTML survives save -> API -> My Documents -> open exactly as HTML;
- Urdu/RTL text survives unchanged;
- different local work is preserved/confirmed before restore;
- My Documents opens every current editor kind in its owning route;
- document share remains an explicit plain-text snapshot;
- existing Basic Writer behavior does not regress;
- full Write Urdu quality pipeline remains green.
