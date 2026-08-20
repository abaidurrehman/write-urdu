# WriteUrdu — My Documents continuity and sharing UX decision

**Date:** 2026-08-20  
**Status:** Founder-approved product direction  
**Applies to:** `WU-DRAFT-001` DOC-B/DOC-C and `WU-SHARE-001`

## Decision

Accounts should be introduced through a concrete writing-continuity benefit, not as a generic account feature.

The core message is:

> Save your writing for later, open it on another device, and share it with a link when you are ready.

This message belongs close to the main writing experience without competing with the primary English-to-Urdu typing intent.

## Homepage continuity card

Use the available secondary area beside the homepage hero for a compact account-value card.

### Signed-out state

Suggested hierarchy:

**Keep your writing**

- Save writing for later.
- Continue on another device.
- Share a link when you choose.

Primary action: **Sign in to save**  
Secondary action: **Keep writing without an account** or no secondary CTA when the main Start typing action is already visible.

The card must remain visually secondary to:

1. the `English to Urdu Typing Online` H1;
2. the search-intent explanation;
3. `Start typing`.

Do not turn the homepage into an account landing page and do not require sign-in before typing.

### Signed-in state

Do not keep advertising sign-in after a session exists. Replace the card with useful continuity actions such as:

- **My Documents**;
- a short statement that current writing can be saved to the account;
- later, the current document's account-save state when DOC-B is implemented.

## My Documents share action

Each account-backed document may expose a **Share link** action.

This does **not** introduce a second sharing backend and does **not** make `writing_documents` public.

The action must reuse the existing `WU-SHARE-001` public share-artifact service (`/api/shares*` -> `/s/:id`).

### Publication model

Sharing is an explicit snapshot publication:

```text
private account document
  -> user clicks Share link
  -> explicit publish confirmation
  -> selected document snapshot is sent to WU-SHARE-001
  -> public /s/:id URL is created
```

Rules:

- a private `writing_documents` row never becomes directly public;
- document IDs never become public share URLs;
- document content is sent to the share service only after explicit publication confirmation;
- a published share is a snapshot;
- later edits to the private document do not silently mutate an existing public URL;
- creating a new share after edits is acceptable until an explicit update-published-version feature is approved;
- the existing share delete/report/privacy rules continue to apply;
- no document ownership/session data is embedded in the public URL or public artifact.

## Not collaboration

This decision does not approve:

- live shared documents;
- edit permissions or ACLs;
- colleague invitations;
- comments;
- presence indicators;
- team workspaces;
- followers, feeds or public profiles.

Those remain separate future product slices.

## Slice mapping

- **DOC-A:** schema + private authenticated API only. No homepage or sharing UI.
- **DOC-B:** Basic Writer `Save to my account` pilot; introduce the homepage continuity card when the account-save path is usable.
- **DOC-C:** My Documents list/open/rename/delete plus **Share link** snapshot publishing through `WU-SHARE-001`.
- **DOC-D+:** expand the same persistence/share model to Rich Editor and Urdu Keyboard without creating parallel storage or sharing systems.
