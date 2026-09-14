# WU-FONT-001 Slice 1B — Existing Tool Convergence

Date: 2026-09-14
Status: implementation branch
Parent: WU-FONT-001

## Goal

Make Card Studio, Name Art and Rich Editor consume the Slice 1 governed Urdu font registry without adding a new font, changing product defaults, or launching the future `/urdu-fonts` acquisition route.

## Preserved product surface

Card Studio and Name Art keep the same six web-rendered choices:

1. Noto Nastaliq Urdu
2. Noto Naskh Arabic
3. Amiri
4. Lateef
5. Scheherazade New
6. Tajawal

Rich Editor keeps the same eight Urdu/Arabic web families, with the historic `Scheherazade` label normalized to the governed `Scheherazade New` family:

1. Noto Nastaliq Urdu
2. Noto Naskh Arabic
3. Amiri
4. Lateef
5. Scheherazade New
6. Tajawal
7. Harmattan
8. Katibeh

The existing Latin/system choices in TinyMCE remain available.

## Runtime architecture

### Creation surfaces

`js/card-studio-core.js` remains the common Card Studio/Name Art foundation. In browser contexts it bootstraps:

- `js/urdu-font-registry.js`
- `js/urdu-font-card-convergence.js`

The convergence adapter owns the runtime `#cardFont` options. It asks the registry for the capability of the current workspace and exposes only approved web fonts.

Old saved projects remain family-string compatible. `Scheherazade` continues to normalize to `Scheherazade New`; unknown or unapproved families fall back to the established creation default rather than becoming new product choices.

### Strict canvas/export boundary

The creation adapter verifies the active text and attribution fonts through the shared loader before:

- revealing the initial governed canvas;
- applying a user-selected font;
- Download PNG;
- Share image;
- Name Art transparent-PNG export.

A failed or unapproved load stops the action and surfaces an error. The legacy Card Studio loader remains underneath for compatibility, but it is no longer the trust boundary for governed user choices or exports.

### Rich Editor

`js/urdu-font-tinymce-adapter.js` derives Urdu families from the registry's `editor` capability and keeps the existing Latin/system choices.

The adapter creates the shared font loader against `editor.getDoc()`, so approved web-font styles are available inside TinyMCE's iframe instead of only in the parent document.

The visible legacy `Qadreeregular` sample is removed at runtime because the repository has no governed webfont for it. The old `Scheherazade` sample is normalized to `Scheherazade New`.

### Journey-runtime compatibility

Rich Editor already loads `js/card-studio-entry.js` for handoff/journey behavior. Slice 1B preserves that mature runtime byte-for-byte as `js/card-studio-entry-legacy.js` and turns `js/card-studio-entry.js` into a small compatibility bootstrap:

1. on `/urdu-editor`, load the font registry;
2. load the TinyMCE font adapter;
3. load the unchanged journey runtime;
4. on other authoring routes, load the unchanged journey runtime directly.

This keeps font convergence separate from the workspace-handoff implementation.

## Licensing boundary

Slice 1B does not add or embed Mehr Nastaliq Web, Jameel Noori variants, Nafees Nastaleeq, AlQalam Taj, AA Sameer Sagar, Gandhara Suls or any other reviewed candidate.

`license-review` records still cannot expose a stylesheet or bundled asset through the shared registry. The convergence adapters use only `approved-web` records.

## Performance boundary

The font registry is not added to Basic Writer or the global shell.

Creation surfaces load the registry only because they already load Card Studio core. Rich Editor loads it through its existing authoring entry point. The registry loader remains one-font-at-a-time and reuses already available faces.

## Deliberately unchanged

- no `/urdu-fonts` route;
- no sitemap/SEO release;
- no new font binaries;
- no change to default creation font;
- no template redesign;
- no background changes;
- no Card Studio project schema break;
- no public font-download functionality.

## Validation

Slice 1B must pass:

- Slice 0 audit contracts;
- Slice 1 registry/loader contracts;
- new Slice 1B convergence contract;
- creation-core contracts;
- Rich Editor/Keyboard contracts;
- Card Studio/Name Art browser acceptance;
- existing workspace-handoff/share-loop/browser suites.

Manual/browser acceptance should confirm that the TinyMCE font-family menu presents the governed Urdu choices after editor initialization and that a font selected for Card Studio or Name Art is the font measured/exported by canvas.

## Rollback

The convergence layer is intentionally separable. Rollback can remove the two adapters and restore the previous `card-studio-entry.js` blob without changing saved Card Studio documents, font family strings, templates or public routes.
