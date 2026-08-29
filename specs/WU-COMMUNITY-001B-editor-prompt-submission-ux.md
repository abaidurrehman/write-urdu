# WU-COMMUNITY-001B — Editor Prompt + Submission Experience

**Parent:** `WU-COMMUNITY-001`  
**Status:** Implemented core / acceptance pending — `js/community-publishing.mjs`, `js/community-publishing-ui.mjs`, `css/community-publishing.css`, wired via `site-header.js` `installCommunityPublishing()` across Basic/Rich/Keyboard/Voice; `tests/community-publishing-editor-contract.test.js` green (2026-08-29). Verified via contract tests and a static-asset smoke check only — no live browser/Functions verification yet (this repo's local dev server has no D1/Functions runtime; needs a Cloudflare Pages preview deploy)  
**Date:** 2026-08-25  
**Scope:** meaningful-writing detection, manual publish action, auth continuity, metadata form, exact preview, submission states across Basic/Rich/Keyboard/Voice  
**Depends on:** `WU-COMMUNITY-001A`, `WU-AUTH-001`, existing workspace handoff/account continuity

---

## 1. Goal

Make publishing discoverable at the moment a user has created meaningful Urdu writing, without interrupting the writing task or making sign-in mandatory for normal writing.

Owned flow:

```text
write normally
→ meaningful-writing prompt OR manual Publish action
→ preserve current snapshot
→ sign in if needed
→ enter publishing metadata
→ preview exact public snapshot
→ submit
→ see In review state
```

This slice submits only to the private moderation queue. It does not create public pages.

---

## 2. Product rules

1. Typing remains anonymous and local-first until the user explicitly chooses publishing.
2. Automatic prompting is discovery, never submission.
3. Manual publishing remains available for short poems/ghazals/nazms.
4. Prompt/UI never covers the active editor or steals focus while the user is typing.
5. Account creation/sign-in is required only after explicit publishing intent.
6. Current writing survives OAuth navigation.
7. No writing is placed in query strings, auth state, telemetry or URLs.
8. The user previews exactly what will be submitted.
9. Failure to submit never harms local autosave/My Documents.

---

## 3. Shared client owner

Prefer one community publishing controller, for example:

```text
js/community-publishing.mjs
```

Responsibilities:

- read the current workspace snapshot through existing editor adapters;
- compute prompt eligibility;
- manage once-per-session/content-signature prompt suppression;
- launch manual/automatic submission flow;
- preserve snapshot through sign-in;
- call authenticated community submission API;
- show truthful pending/success/failure state;
- emit bounded telemetry without content.

Do not put community logic inside transliteration, speech recognition or rich-editor formatting internals.

---

## 4. Eligible surfaces

Initial automatic + manual publishing integration:

```text
/                  Basic Writer
/urdu-editor       Rich Editor
/urdu-keyboard     Urdu Keyboard
/tools/urdu-voice-typing   Voice transcript/result
```

Automatic prompt is excluded from:

```text
Invoice
QR Generator
Card Studio
Name Art
Social makers
utility/reference pages
```

The shared workspace registry may own eligibility if that is cleaner than route string checks.

---

## 5. Meaningful-writing predicate

Implement one shared pure/testable function.

Initial rule:

```text
nonWhitespaceCharacters >= 600
OR
whitespaceDelimitedWords >= 90
```

Normalization for the heuristic:

- strip HTML to text through existing safe adapter;
- normalize line endings;
- do not transliterate/rewrite;
- count Unicode content, not ASCII-only words;
- ignore all-whitespace content.

The heuristic must not infer category, quality or authorship.

---

## 6. Prompt frequency

The automatic prompt should be useful rather than repetitive.

Initial contract:

- show at most once for the same content signature in the browser session;
- dismissing `Not now` suppresses that exact/near-identical snapshot for the session;
- substantial new writing may become eligible again later;
- manual `Publish to Urdu Writers` always remains available;
- do not persist a permanent “never ask again” setting in v1.

Suggested signature input client-side:

```text
workspace kind + normalized plain-text length bucket + lightweight digest
```

The signature is local-only and must not be sent to product telemetry.

---

## 7. Prompt placement and copy

Use a compact below-task or post-workspace surface consistent with current WU journey patterns.

Equivalent copy:

**Share your writing with more readers**  
Publish this poem, essay or idea in Urdu Writers and show your creativity to the WriteUrdu community.

Actions:

```text
Submit for publishing
Not now
```

Requirements:

- not sticky over the editor;
- no modal while the user is actively typing;
- accessible keyboard focus order;
- mobile-safe;
- no large marketing block above the editor;
- no technical words such as D1, snapshot, moderation workflow or UGC.

---

## 8. Manual publish action

Every eligible editor exposes a compact explicit action:

```text
Publish to Urdu Writers
```

This action must work below the automatic threshold.

Manual body minimum remains the server contract from Slice A; client can guide but server decides validity.

Do not hide the action simply because a document is already saved to My Documents.

---

## 9. Snapshot contract per editor

### Basic Writer

Submit current plain text exactly as visible through the existing adapter.

### Urdu Keyboard

Submit current plain text exactly as visible.

### Voice

Submit current editable transcript/result, not raw recognition events.

### Rich Editor

Preferred contract:

- capture `plain_text` always;
- include rich content only if Slice A established a proven server-side sanitizer;
- otherwise publish plain text in v1 and communicate no misleading formatting promise.

No editor may bypass the shared server validator.

---

## 10. Signed-out continuity

When a signed-out user clicks publishing:

1. capture current snapshot in a short-lived same-origin handoff;
2. flush the existing local editor save first;
3. store only what is needed to resume publishing;
4. navigate to existing `/sign-in` flow with a safe same-origin return target;
5. after successful auth, restore the publishing flow;
6. expire/consume the handoff.

Recommended expiry:

```text
30 minutes
```

Use existing `sessionStorage`/workspace handoff conventions where possible.

Never put title/body/HTML in:

```text
query string
OAuth state
referrer-visible URL
analytics payload
```

If handoff expires, return the user safely to their editor/local draft and explain that publishing can be started again.

---

## 11. Submission form

Keep it focused.

Required fields:

```text
Title
Public name / pen name
Category
Tags (1–5 curated choices)
Writing preview
```

Required confirmations:

```text
I wrote this, or I have permission to publish it.
I understand approved writing will be publicly readable on WriteUrdu.
I agree to the Community Publishing Guidelines.
```

Category/tag options come from the same controlled taxonomy contract as the backend; do not hard-code divergent values without a shared source/build contract.

---

## 12. Public author name UX

Rules:

- account name may be offered as a convenience only;
- field remains editable;
- user explicitly confirms it;
- email is never proposed as public name;
- provider image is not part of v1;
- explain briefly that this is the name readers will see.

Useful copy:

```text
Name shown with your writing
Use your name or a pen name.
```

---

## 13. Exact preview

Before final submission, render the snapshot through the same presentation primitives intended for the public detail page where practical.

Preview must show:

- title;
- public author name;
- category/tags;
- exact plain/rich sanitized representation to be submitted;
- RTL direction;
- clear note that publication happens only after review.

Do not show a preview from one body while submitting another hidden editor state. Freeze the reviewed snapshot at the confirmation step or detect change and ask user to refresh preview.

---

## 14. Submit state

Primary action:

```text
Submit for review
```

Truthful states:

```text
Submitting…
Submitted for review
Could not submit — your writing is still safe
You already have this version in review
You have reached the current pending-submission limit
```

Do not say `Published` after POST success. POST only means `pending`.

After success, offer:

```text
View My Publications
Keep writing
```

`My Publications` may initially be a placeholder/route shell until Slice E, but do not create a broken CTA.

---

## 15. Editing during the flow

If the source editor changes after the submission sheet opens:

- never silently replace the frozen preview;
- either keep the snapshot the user chose or show `Your writing changed — refresh preview`;
- final submit payload must match the explicit preview/confirmation state.

Submission never turns on continuous server sync for an otherwise local-only draft.

---

## 16. Telemetry

Allowed bounded events:

```text
community_publish_prompt_shown
community_publish_prompt_clicked
community_publish_manual_clicked
community_submission_started
community_submission_completed
community_submission_failed
```

Allowed properties may include:

```text
route/workspace
editor_kind
entry_point = prompt|manual
signed_in = boolean
size_bucket
outcome/error_category
```

Never include:

```text
title/body/excerpt
public name
email/user ID
source document ID
submission ID
content signature
```

---

## 17. Accessibility/mobile

Required acceptance:

- all controls keyboard reachable;
- dialog/sheet, if used, has correct accessible name and focus return;
- Urdu preview uses `lang="ur"` and `dir="rtl"`;
- category/tag controls are usable with screen reader and touch;
- prompt does not obscure mobile editor toolbar/canvas;
- submit error uses live region without moving user unexpectedly;
- no horizontal overflow on Pixel 5 class viewport.

---

## 18. Likely implementation owners

Inspect current code first. Possible owners:

```text
js/community-publishing.mjs
css/community-publishing.css
community-submit.html or an in-shell shared sheet
site-header/shared route loader if needed
workspace registry entry/metadata
```

Prefer a shared runtime over four independently implemented forms.

---

## 19. Tests

### Predicate

- 599 non-whitespace chars and <90 words => no automatic prompt;
- 600+ chars => eligible;
- 90+ words => eligible;
- whitespace-only => not eligible;
- Urdu text counts correctly;
- HTML-rich text uses plain semantic text.

### Frequency

- prompt once per same signature/session;
- dismissal suppresses repeat;
- manual action remains available;
- significant changed content can qualify again.

### Auth continuity

- signed-out Basic/Rich/Keyboard/Voice snapshot survives sign-in round trip;
- no writing appears in URL/state/telemetry;
- expired handoff fails safely without losing local work.

### Submission UX

- title/name/category/tags/confirmations required;
- exact preview matches submitted snapshot;
- short poetry can submit manually;
- pending quota/duplicate/API failure messages are truthful;
- success says review/pending, never published.

### Regression

- transliteration unaffected;
- local autosave/history unaffected;
- My Documents sync unaffected;
- Voice recognition unaffected;
- share-link flow unaffected.

---

## 20. Acceptance criteria

- [ ] One shared meaningful-writing predicate exists and is tested.
- [ ] Automatic prompt ships on Basic/Rich/Keyboard/Voice only.
- [ ] Prompt is dismissible, once-per-signature/session and non-blocking.
- [ ] Manual Publish action works for short poetry.
- [ ] Signed-out publishing resumes safely after existing auth flow.
- [ ] No writing enters URL/OAuth state/telemetry.
- [ ] Form requires title, public name, category, 1–5 tags and confirmations.
- [ ] User previews the exact frozen snapshot before submit.
- [ ] POST success is shown as `Submitted for review`, not `Published`.
- [ ] API failure never harms typing/local save/My Documents.
- [ ] Desktop/mobile/accessibility focused tests pass.
- [ ] Existing editor/product regressions pass.

---

## 21. Stop conditions

Stop and fix if:

- automatic prompt submits content;
- sign-in becomes required for normal writing;
- editor text is serialized into URL/auth state;
- four editors implement four incompatible publishing flows;
- prompt interrupts typing or covers the editor;
- short poetry cannot use manual publishing;
- rich HTML bypasses Slice A sanitizer contract;
- success copy implies publication before moderation.
