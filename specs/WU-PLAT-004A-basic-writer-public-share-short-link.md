# WU-PLAT-004A — Basic Writer Public Share Short Link

**Priority:** P0 hotfix  
**Status:** Active — implementation in `hotfix/basic-writer-short-share-link`  
**Route owner:** `/`  
**Parent:** `WU-PLAT-004` Basic Writer Command Toolbar  
**Share dependency:** `WU-SHARE-001` Public Share Pages & Viral Publishing Loop  
**Decision date:** 2026-08-18

---

## 1. Decision

This contract **supersedes WU-PLAT-004 §9.1 wherever it describes the primary Basic Writer toolbar Share action as native text-only sharing**.

The first-class green **Share** command on the Basic Writer toolbar means:

> Create or reuse an explicit Write-Urdu public snapshot and share its short `write-urdu.com/s/{id}` URL.

It does **not** mean “send the raw textarea through `navigator.share()`”.

The toolbar label remains the simple, self-explanatory **Share**. The confirmation surface explains the public-link boundary before any publishing occurs.

---

## 2. User flow

Given meaningful Basic Writer text:

1. User chooses **Share**.
2. Write Urdu opens a confirmation dialog. No network publication has occurred yet.
3. The dialog explains that a short public `write-urdu.com/s/…` link and visual preview will be created.
4. User explicitly chooses **Publish & get short link**.
5. Browser creates a controlled 1200×630 PNG preview from the current writing.
6. Browser sends the preview + bounded plain text to the existing `/api/shares` service with `source_tool=basic_editor`.
7. The existing share service returns an opaque short URL such as `https://write-urdu.com/s/Ab12Cd34` plus a management token.
8. Success UI exposes:
   - **Copy link**;
   - **Open public page**;
   - **Share link**;
   - **Delete link**.
9. **Share link** invokes the device/browser share sheet with the short Write-Urdu URL. Raw Urdu text is not used as the primary native-share payload.

If the exact unchanged Basic Writer text already has a locally managed public link from this browser, the product may reuse that link rather than create duplicate share artifacts.

---

## 3. Public snapshot contract

The Basic Writer uses the same infrastructure as Card Studio rather than introducing a second sharing system:

- `POST /api/shares`;
- `METRICS_DB` `share_artifacts` records;
- `CONTENT_STORE` objects under the existing `shares/` namespace;
- opaque Base62 share IDs;
- public `/s/:id` recipient page;
- `/share-media/:id` social preview delivery;
- shared management-token store `writeUrdu.shareManagement.v1`;
- existing delete/report/moderation lifecycle;
- existing public-share telemetry and Product Pulse rollups.

`basic_editor` is added to the existing server-side share source allowlist. No database migration is required because `source_tool` is already stored as bounded text.

---

## 4. Preview image contract

Basic Writer has no designed card canvas, so its publisher creates a restrained share preview specifically for social metadata.

Required preview properties:

- PNG only;
- 1200×630;
- light Write-Urdu visual language;
- clear RTL Urdu rendering;
- responsive font sizing/wrapping for different writing lengths;
- restrained Write-Urdu provenance such as `Shared from Write-Urdu.com`;
- no ads;
- no unrelated local draft/history content;
- preview may truncate very long writing visually, while the public page retains the full bounded plain text.

The server continues to validate PNG type, byte size and dimensions before accepting the artifact.

---

## 5. Privacy and safety boundary

Publishing is **always explicit**.

The first click on Share MUST NOT:

- create a public URL;
- upload the text;
- upload a preview;
- invoke native sharing automatically.

Only the explicit **Publish & get short link** confirmation performs publication.

Never put any of the following in the URL or anonymous telemetry:

- Urdu text;
- selected text;
- filenames;
- preview bytes;
- management token;
- share management identity.

The public page remains:

- unlisted;
- `noindex`;
- ad-free;
- immutable for that published snapshot;
- deletable only with the locally retained management token.

---

## 6. Toolbar ownership fix

The WU-PLAT-004 toolbar reuses several mature legacy buttons for their proven export/copy handlers. Before convergence, the shared locale runtime may have attached `data-wu-i18n-control` markers using legacy labels such as `Copy text`, `PDF document`, `Word document` and `PNG image`.

When the new toolbar takes ownership of a command, it MUST clear inherited legacy localization markers before writing the compact toolbar label. Otherwise the locale MutationObserver can append both labels and create visible strings such as `Copy Copy text` or `PDF PDF document`.

The toolbar-owned visible labels are exactly:

- Share
- Copy
- PDF
- Word
- PNG
- Preview
- Print
- More
- Clear

Localized toolbar labels can be added later through an explicit toolbar dictionary; they must not be inferred from stale legacy button text.

---

## 7. Acceptance criteria

1. Share is first and visually primary in the Basic Writer toolbar.
2. Clicking Share with content opens an explicit public-share confirmation dialog.
3. No POST to `/api/shares` occurs before **Publish & get short link** is chosen.
4. Confirmed publication uses `source_tool=basic_editor` and bounded `public_text`.
5. A 1200×630 PNG preview is included in the multipart request.
6. Successful publication produces `/s/{8-char opaque id}` through the existing share service.
7. Success UI offers Copy link, Open public page, Share link and Delete link.
8. Native Share receives the Write-Urdu short URL, not the raw Urdu document as the main payload.
9. The public page keeps its existing recipient continuation actions: Use this text, Create your own Urdu design and Make QR for this link.
10. User text is absent from destination URLs and telemetry.
11. The existing management-token deletion model is preserved.
12. Basic Writer may reuse the locally managed link for identical unchanged text.
13. Toolbar labels do not duplicate legacy labels after the locale runtime re-runs.
14. Desktop and Pixel 5 acceptance cover the Share confirmation → publish → short-link → native-share path.
15. Existing transliteration, Copy, export, Clear, Continue with…, SEO/canonical and AdSense boundaries remain unchanged.

---

## 8. Implementation map

- `js/basic-writer-command-toolbar.js`
  - stable first-class Share entry point;
  - lazy-loads/delegates to Basic public-share publisher;
  - clears stale legacy i18n ownership on toolbar commands.
- `js/basic-writer-publish.js`
  - confirmation/success/error UX;
  - controlled preview rendering;
  - `/api/shares` publication;
  - copy/native-share/delete actions;
  - local unchanged-link reuse.
- `functions/_lib/share-artifacts.js`
  - accepts `basic_editor` in the bounded source-tool allowlist.
- `sw.js`
  - caches the Basic publisher and shared dialog assets;
  - advances shell cache version.
- `tests/core-workspace-convergence-contract.test.js`
- `tests/core-workspace-convergence.spec.js`
- `tests/share-loop-contract.test.js`

No new route, database schema, backend storage system or analytics sink is introduced by this hotfix.
