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

`js/card-studio-core.js` remains the common Card Studio/Name Art foundation and stays byte-stable from Slice 1.

`js/card-studio-interaction-core.js`, which is already shared by Card Studio and Name Art, owns the narrow browser bootstrap for:

- `js/urdu-font-registry.js`
- `js/urdu-font-card-convergence.js`

The convergence adapter owns the runtime `#cardFont` options. It asks the registry for the capability of the current workspace and exposes only approved web fonts.

The adapter activates only when the page identifies itself as Card Studio (`card-studio-page`) or Name Art (`name-art-page`). Social makers reuse parts of the Card Studio runtime but remain outside Slice 1B font convergence, so WhatsApp, Instagram and Facebook creation/export behavior is not intercepted by this adapter.

Old saved projects remain family-string compatible. `Scheherazade` continues to normalize to `Scheherazade New`; unknown or unapproved families fall back to the established creation default rather than becoming new product choices.

### Approval boundary and resilient delivery

Slice 1B separates two different failure classes that must not be treated the same way.

**Font approval remains fail-closed.** Before a selected font is applied or an export is replayed, the adapter resolves it through the shared registry and requires:

- a known stable registry record;
- `licenseStatus: approved-web`;
- the current tool capability (`card-studio` or `name-art`).

Unknown, license-review, system-reference-only or wrong-capability fonts stop the action and surface an error.

**Approved font delivery is resilient.** The browser may be offline, a font CDN may be blocked, or an acceptance environment may deliberately block external services. Those conditions must not turn Write Urdu's browser-local creation tools into a dead end.

For approved fonts the adapter therefore:

- reuses one shared loader instance instead of recreating a loader for every export;
- bounds verification with a 3-second delivery deadline;
- classifies stylesheet/network/font-loading failures separately from approval failures;
- marks the document with `data-wu-font-delivery="degraded"` and a concrete `data-wu-font-degraded` value when delivery cannot be verified;
- tells the user that the browser may use a fallback font;
- keeps preview/export available rather than silently hanging or disabling the creation flow.

This is intentionally not presented as successful named-font rendering. The degraded state is explicit so the product does not claim that Noto, Amiri, Lateef or another named family rendered when the browser could not verify it.

The preflight applies before:

- revealing the initial governed canvas;
- applying a user-selected font;
- Download PNG;
- Share image;
- Name Art transparent-PNG export.

The existing Card Studio/Name Art rendering paths remain underneath for browser-local continuity.

### Rich Editor

`js/urdu-font-tinymce-adapter.js` derives Urdu families from the registry's `editor` capability and keeps the existing Latin/system choices.

The adapter creates the shared font loader against `editor.getDoc()`, so approved web-font styles are available inside TinyMCE's iframe instead of only in the parent document.

The visible legacy `Qadreeregular` sample is removed at runtime because the repository has no governed webfont for it. The old `Scheherazade` sample is normalized to `Scheherazade New`.

### Journey-runtime compatibility

`js/card-studio-entry.js` remains the real authoring journey/handoff runtime and keeps the existing v2-before-legacy Rich Editor restore logic in the same source owner expected by the Product Pulse, continuity and share-loop contracts.

Slice 1B adds only a narrow `ensureRichFontConvergence()` bootstrap to that file. On `/urdu-editor` it:

1. loads the shared font registry;
2. loads the TinyMCE font adapter;
3. leaves all existing journey, v2 handoff, legacy fallback, telemetry and sharing logic in place.

On Basic Writer and Urdu Keyboard routes the font bootstrap exits before loading the registry. There is no duplicate or delegated legacy journey file.

## Licensing boundary

Slice 1B does not add or embed Mehr Nastaliq Web, Jameel Noori variants, Nafees Nastaleeq, AlQalam Taj, AA Sameer Sagar, Gandhara Suls or any other reviewed candidate.

`license-review` records still cannot expose a stylesheet or bundled asset through the shared registry. The convergence adapters use only `approved-web` records.

## Performance boundary

The font registry is not added to Basic Writer or the global shell.

Creation surfaces load the registry through the shared Card Studio interaction runtime, but the convergence adapter exits immediately outside Card Studio and Name Art. Rich Editor loads the registry through the route-guarded authoring entry bootstrap. The creation adapter reuses its loader instance so repeated export actions do not restart font delivery work.

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
- Product Pulse Slice 1 continuation contracts;
- creation-core contracts;
- Rich Editor/Keyboard contracts;
- Card Studio/Name Art browser acceptance;
- existing workspace-handoff/share-loop/browser suites;
- focused creation/export browser tests while external services are deliberately blocked.

Manual/browser acceptance should confirm that the TinyMCE font-family menu presents the governed Urdu choices after editor initialization; that a successfully loaded selected font is the font measured/exported by canvas; and that a font-service outage produces an explicit degraded/fallback state without destroying the user's ability to finish and export their browser-local design.

## Rollback

The convergence layer is intentionally separable. Rollback can remove the two adapters, remove the small Rich Editor font bootstrap from `js/card-studio-entry.js`, and restore the Slice 1 interaction-core blob without changing saved Card Studio documents, font family strings, templates or public routes.
