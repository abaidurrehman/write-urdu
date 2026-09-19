# WU-SHAADI-001 Slice 1 UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Release `/urdu-wedding-invitation-maker` — a step-gated composer wizard that wires the already-built Slice 1 logic layer and the Riwaayat SVG art pack into a working, indexable public page.

**Architecture:** Flat static HTML page (`urdu-wedding-invitation-maker.html`) following the `urdu-bill-generator` precedent exactly: page-scoped CSS layered on the shared shell, a DOM-wiring JS file that reads pure logic modules already built in prior slices (`wedding-project-core.js`, `wedding-template-selector.js`, `wedding-project-storage.js`, `wedding-wording-registry.js`) and renders one step at a time. Rendering is plain DOM/CSS (a Riwaayat SVG as a CSS background, or a neutral fallback), exported per-event to PNG via html2canvas — no Card Studio, no canvas renderer, no PDF (see spec Amendments 1 and 2 for why).

**Tech Stack:** Vanilla JS (UMD/IIFE modules, no bundler), static HTML/CSS, html2canvas 1.4.1 (CDN), Playwright for the browser spec, Node's built-in `assert` for contract tests.

**Spec:** docs/superpowers/specs/2026-09-19-wu-shaadi-001-slice-1-ui-design.md (read both amendments at the top before starting — they correct the original design and are binding)

## Global Constraints

- No account requirement (per specs/WU-SHAADI-001-IMPLEMENTATION-CHECKLIST.md Slice 1).
- No network call anywhere on this page; all project data lives in `localStorage` only.
- No name/couple/guest data ever appears in a URL, telemetry event, or generated markup.
- Never mutate verified Quranic/Arabic religious text (`RELIGIOUS_LIBRARY`/`religiousOpening` in `js/wedding-project-core.js`) — this slice does not touch that code path at all.
- `event.invitedEventIds` / guest scoping do not exist yet in this slice (no guest list) — nothing here should assume otherwise.
- `wordingTone` and `EVENT_TYPES` enums must be read from `js/wedding-project-core.js`'s exports, never redeclared with different values.
- Card Studio (`js/card-studio-core.js`, `js/card-background-registry.js`) and `js/wedding-invitation-render-adapter.js` are **not used anywhere in this slice** (spec Amendment 1).
- After this slice, `node scripts/check-product-governance.js` must report exactly **46 registered pages, 50 sitemap routes, 103 redirect rules** (up from 45/49/102) — not "unchanged".
- `npm test` (Node contract tests) and `npm run test:browser` (Playwright) must both stay green.

---

### Task 1: Schema additions in `js/wedding-project-core.js`

**Files:**
- Modify: `js/wedding-project-core.js:115-132` (the `normalizeEvent` function)
- Test: `tests/wedding-project-core.test.js` (append at end, after line 204's `console.log`)

**Interfaces:**
- Consumes: nothing new.
- Produces: `normalizeEvent(...)`'s return object gains two new keys used by every later task —
  `selectedBackgroundId: string | null` and `wordingOverride: { text: string, isOverridden: boolean, generatedFrom: { templateId: string, sourceFieldsSnapshot: object } } | null`.

- [ ] **Step 1: Write the failing test**

Append to `tests/wedding-project-core.test.js` (before the final `console.log` line):

```js
// --- Slice 1 UI: selectedBackgroundId and wordingOverride, both nullable, never inferred ---
const freshEventProject = core.normalizeWeddingProject({
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  events: [{ id: 'evt-nikah', type: 'nikah', date: '2026-12-05' }]
});
assert.equal(freshEventProject.events[0].selectedBackgroundId, null, 'selectedBackgroundId must default to null, never guessed');
assert.equal(freshEventProject.events[0].wordingOverride, null, 'wordingOverride must default to null until the user overrides');

const explicitBackgroundProject = core.normalizeWeddingProject({
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  events: [{ id: 'evt-nikah', type: 'nikah', date: '2026-12-05', selectedBackgroundId: 'riwaayat-nikah-ivory' }]
});
assert.equal(explicitBackgroundProject.events[0].selectedBackgroundId, 'riwaayat-nikah-ivory', 'an explicit selectedBackgroundId must be preserved verbatim');

const overrideOnEventProject = core.normalizeWeddingProject({
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  events: [{
    id: 'evt-nikah', type: 'nikah', date: '2026-12-05',
    wordingOverride: { text: 'Hand-written wording', isOverridden: true, generatedFrom: { templateId: 'formal-nikah-ur', sourceFieldsSnapshot: { personA: 'Ali', personB: 'Sara', eventDate: '2026-12-05', venueName: '' } } }
  }]
});
assert.deepEqual(
  overrideOnEventProject.events[0].wordingOverride,
  { text: 'Hand-written wording', isOverridden: true, generatedFrom: { templateId: 'formal-nikah-ur', sourceFieldsSnapshot: { personA: 'Ali', personB: 'Sara', eventDate: '2026-12-05', venueName: '' } } },
  'a valid wordingOverride object must round-trip through normalizeEvent unchanged'
);

// A malformed/garbage wordingOverride must fail closed to null, never throw and never pass through partially.
const malformedOverrideProject = core.normalizeWeddingProject({
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  events: [{ id: 'evt-nikah', type: 'nikah', date: '2026-12-05', wordingOverride: 'not-an-object' }]
});
assert.equal(malformedOverrideProject.events[0].wordingOverride, null, 'a malformed wordingOverride must fail closed to null');

// Both fields must survive a save/load round-trip through wedding-project-storage.js unchanged.
const storage = require('../js/wedding-project-storage.js');
storage.resetDraft();
storage.saveDraft(explicitBackgroundProject);
const reloaded = storage.loadDraft();
assert.equal(reloaded.events[0].selectedBackgroundId, 'riwaayat-nikah-ivory', 'selectedBackgroundId must round-trip through storage');
storage.resetDraft();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/wedding-project-core.test.js`
Expected: FAIL — `AssertionError` because `selectedBackgroundId`/`wordingOverride` are `undefined`, not `null` (they don't exist on the object yet).

- [ ] **Step 3: Write the implementation**

In `js/wedding-project-core.js`, replace the `normalizeEvent` function (lines 115-132) with:

```js
    function isValidWordingOverride(value) {
        return value && typeof value === 'object' &&
            typeof value.text === 'string' &&
            typeof value.isOverridden === 'boolean' &&
            value.generatedFrom && typeof value.generatedFrom === 'object' &&
            typeof value.generatedFrom.templateId === 'string' &&
            value.generatedFrom.sourceFieldsSnapshot && typeof value.generatedFrom.sourceFieldsSnapshot === 'object';
    }

    function normalizeWordingOverride(value) {
        return isValidWordingOverride(value) ? {
            text: text(value.text),
            isOverridden: Boolean(value.isOverridden),
            generatedFrom: {
                templateId: trimmed(value.generatedFrom.templateId, 80),
                sourceFieldsSnapshot: Object.assign({}, value.generatedFrom.sourceFieldsSnapshot)
            }
        } : null;
    }

    function normalizeEvent(value, index) {
        var source = value && typeof value === 'object' ? value : {};
        var type = enumOrFallback(source.type, EVENT_TYPES, 'custom');
        return {
            id: trimmed(source.id, 80) || randomId('event-' + index),
            type: type,
            customTypeLabel: type === 'custom' ? trimmed(source.customTypeLabel, 80) : '',
            hostMode: enumOrFallback(source.hostMode, HOST_MODES, 'custom'),
            date: /^\d{4}-\d{2}-\d{2}$/.test(text(source.date)) ? source.date : '',
            timezone: trimmed(source.timezone, 60),
            programme: boundedArray(source.programme, normalizeProgrammeItem, 12),
            venueId: trimmed(source.venueId, 80),
            wordingTemplateId: trimmed(source.wordingTemplateId, 80),
            wordingTone: enumOrFallback(source.wordingTone, WORDING_TONES, 'formal'),
            customWording: trimmed(source.customWording, 2000),
            notes: trimmed(source.notes, 500),
            selectedBackgroundId: trimmed(source.selectedBackgroundId, 80) || null,
            wordingOverride: normalizeWordingOverride(source.wordingOverride)
        };
    }
```

Place the two new helper functions (`isValidWordingOverride`, `normalizeWordingOverride`) immediately before `normalizeEvent`, after the existing `normalizeVenue` function (which ends at line 113).

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/wedding-project-core.test.js`
Expected: PASS, ending with `Wedding project core tests passed (20 fixtures).`

- [ ] **Step 5: Run the full contract suite to check for regressions**

Run: `npm test`
Expected: `All 130 contract test files passed.` (no count change yet — this task only touches `wedding-project-core.test.js`, already registered)

- [ ] **Step 6: Commit**

```bash
git add js/wedding-project-core.js tests/wedding-project-core.test.js
git commit -m "WU-SHAADI-001 Slice 1 UI: add selectedBackgroundId and wordingOverride to event schema"
```

---

### Task 2: `js/riwaayat-manifest.js` browser bridge + sync-contract test

**Files:**
- Create: `js/riwaayat-manifest.js`
- Create: `tests/riwaayat-manifest-sync-contract.test.js`
- Modify: `scripts/run-contract-tests.js` (register the new test)

**Interfaces:**
- Consumes: `assets/wedding-invitations/riwaayat/manifest.json` (existing, from PR #231).
- Produces: `window.WriteUrduRiwaayatManifest` (browser) / `module.exports` (Node) — an object identical to the manifest JSON's top-level shape (`{ id, name, nameUr, version, canvas, description, designRules, variants: [...] }`). Task 3 requires this module to exist and be loadable via `require('./riwaayat-manifest.js')`.

- [ ] **Step 1: Write the failing test**

Create `tests/riwaayat-manifest-sync-contract.test.js`:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.join(__dirname, '..', 'assets', 'wedding-invitations', 'riwaayat', 'manifest.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const embedded = require('../js/riwaayat-manifest.js');

assert.deepEqual(embedded, source, 'js/riwaayat-manifest.js must stay byte-identical to assets/wedding-invitations/riwaayat/manifest.json (this is the sole browser bridge for that data)');

console.log('Riwaayat manifest sync contract passed.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/riwaayat-manifest-sync-contract.test.js`
Expected: FAIL — `Cannot find module '../js/riwaayat-manifest.js'`

- [ ] **Step 3: Write the implementation**

First read the current content of `assets/wedding-invitations/riwaayat/manifest.json` (it has 6 variants: `riwaayat-nikah-ivory`, `riwaayat-mehndi-marigold`, `riwaayat-baraat-emerald`, `riwaayat-walima-sage`, `riwaayat-mayun-saffron`, `riwaayat-dholki-fuchsia`). Create `js/riwaayat-manifest.js` with the exact same JSON content assigned as a JS object literal, wrapped in the repo's standard UMD pattern:

```js
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduRiwaayatManifest = api;
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';
    // Kept byte-identical to assets/wedding-invitations/riwaayat/manifest.json by
    // tests/riwaayat-manifest-sync-contract.test.js — this file exists only because
    // browsers have no synchronous way to require() a JSON asset; Node code should
    // still prefer requiring this file (not the raw JSON) so there is one bridge point.
    return {
        "id": "riwaayat",
        "name": "Riwaayat",
        "nameUr": "روایت",
        "version": 1,
        "canvas": { "width": 1080, "height": 1350, "aspectRatio": "4:5" },
        "description": "A coordinated-but-not-identical Pakistani wedding invitation suite. Event-specific motifs change while border rhythm, spacing and print character stay related.",
        "designRules": {
            "textIsSeparateFromArtwork": true,
            "externalAssets": false,
            "safeCenterTarget": "60–70%",
            "supportsUrduEnglishBilingual": true
        },
        "variants": [
            {
                "id": "riwaayat-nikah-ivory",
                "eventTypes": ["nikah"],
                "src": "/assets/wedding-invitations/riwaayat/riwaayat-nikah-ivory.svg",
                "textColor": "#3f493d",
                "overlayColor": "#fffdf7",
                "overlayOpacity": 0,
                "safeArea": { "top": 0.17, "right": 0.16, "bottom": 0.18, "left": 0.16 },
                "mood": ["sacred", "elegant", "minimal"],
                "motifs": ["mughal-arch", "jasmine", "islamic-geometry"]
            },
            {
                "id": "riwaayat-mehndi-marigold",
                "eventTypes": ["mehndi"],
                "src": "/assets/wedding-invitations/riwaayat/riwaayat-mehndi-marigold.svg",
                "textColor": "#60333a",
                "overlayColor": "#fff8de",
                "overlayOpacity": 0,
                "safeArea": { "top": 0.20, "right": 0.16, "bottom": 0.18, "left": 0.16 },
                "mood": ["festive", "bright", "playful"],
                "motifs": ["marigold", "dholki", "gota", "garland"]
            },
            {
                "id": "riwaayat-baraat-emerald",
                "eventTypes": ["baraat"],
                "src": "/assets/wedding-invitations/riwaayat/riwaayat-baraat-emerald.svg",
                "textColor": "#fff2d0",
                "overlayColor": "#082d2b",
                "overlayOpacity": 0.02,
                "safeArea": { "top": 0.22, "right": 0.15, "bottom": 0.18, "left": 0.15 },
                "mood": ["grand", "formal", "regal"],
                "motifs": ["mughal-arch", "jali", "rose", "gold-border"]
            },
            {
                "id": "riwaayat-walima-sage",
                "eventTypes": ["walima"],
                "src": "/assets/wedding-invitations/riwaayat/riwaayat-walima-sage.svg",
                "textColor": "#4d5548",
                "overlayColor": "#fcfbf6",
                "overlayOpacity": 0,
                "safeArea": { "top": 0.20, "right": 0.16, "bottom": 0.18, "left": 0.16 },
                "mood": ["gracious", "soft", "refined"],
                "motifs": ["botanical", "blush-floral", "champagne-frame"]
            },
            {
                "id": "riwaayat-mayun-saffron",
                "eventTypes": ["mayun"],
                "src": "/assets/wedding-invitations/riwaayat/riwaayat-mayun-saffron.svg",
                "textColor": "#62402e",
                "overlayColor": "#fff7d7",
                "overlayOpacity": 0,
                "safeArea": { "top": 0.20, "right": 0.16, "bottom": 0.18, "left": 0.16 },
                "mood": ["warm", "traditional", "joyful"],
                "motifs": ["genda", "gota-mirror", "saffron"]
            },
            {
                "id": "riwaayat-dholki-fuchsia",
                "eventTypes": ["dholki"],
                "src": "/assets/wedding-invitations/riwaayat/riwaayat-dholki-fuchsia.svg",
                "textColor": "#5a3150",
                "overlayColor": "#fff8df",
                "overlayOpacity": 0,
                "safeArea": { "top": 0.20, "right": 0.16, "bottom": 0.18, "left": 0.16 },
                "mood": ["musical", "energetic", "festive"],
                "motifs": ["dholki", "string-lights", "phulkari-geometry"]
            }
        ]
    };
}));
```

**Before running the test**, diff this literal against the actual `assets/wedding-invitations/riwaayat/manifest.json` on disk (`git diff --no-index js/riwaayat-manifest.js assets/wedding-invitations/riwaayat/manifest.json` will show only syntax differences, not content, if done correctly) — if the repo's manifest.json has since changed, copy its exact current content instead of the snapshot above.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/riwaayat-manifest-sync-contract.test.js`
Expected: PASS — `Riwaayat manifest sync contract passed.`

- [ ] **Step 5: Register the test in the contract runner**

In `scripts/run-contract-tests.js`, add `'tests/riwaayat-manifest-sync-contract.test.js',` immediately after the line `'tests/wu-shaadi-riwaayat-svg-pack.test.js',`.

- [ ] **Step 6: Run the full suite**

Run: `npm test`
Expected: `All 131 contract test files passed.`

- [ ] **Step 7: Commit**

```bash
git add js/riwaayat-manifest.js tests/riwaayat-manifest-sync-contract.test.js scripts/run-contract-tests.js
git commit -m "WU-SHAADI-001 Slice 1 UI: add browser-visible Riwaayat manifest bridge"
```

---

### Task 3: `resolveEventBackground` and `getBackgroundVariant` in `js/wedding-template-selector.js`

**Files:**
- Modify: `js/wedding-template-selector.js` (update the Node require fallback on line 6, add two new functions, extend the return object)
- Test: `tests/wedding-template-selector.test.js` (append)

**Interfaces:**
- Consumes: Task 2's `js/riwaayat-manifest.js` (via `require('./riwaayat-manifest.js')`); Task 1's `event.selectedBackgroundId`; the existing `suggestBackgroundCategory(project, event)`.
- Produces: `resolveEventBackground(project, event) -> string | null` and `getBackgroundVariant(variantId) -> object | null`. Task 6 (the DOM-wiring script) is the consumer of both.

- [ ] **Step 1: Write the failing test**

Append to `tests/wedding-template-selector.test.js` (before the final line, after the existing `registryFormalities` assertion):

```js
// --- resolveEventBackground: explicit choice > first suggestion > null (never fabricated) ---
assert.equal(
  selector.resolveEventBackground(project('urdu'), { type: 'nikah', selectedBackgroundId: 'riwaayat-nikah-ivory' }),
  'riwaayat-nikah-ivory',
  'an explicit selectedBackgroundId must always win'
);
assert.equal(
  selector.resolveEventBackground(project('urdu'), { type: 'nikah' }),
  'riwaayat-nikah-ivory',
  'with no explicit choice, the first suggestBackgroundCategory match is used'
);
assert.equal(
  selector.resolveEventBackground(project('urdu'), { type: 'custom' }),
  null,
  'an event type with no matching Riwaayat variant and no explicit choice resolves to null, never a guess'
);
// An explicit choice for an event type Riwaayat doesn't cover is still honored verbatim.
assert.equal(
  selector.resolveEventBackground(project('urdu'), { type: 'custom', selectedBackgroundId: 'some-future-id' }),
  'some-future-id'
);

// --- getBackgroundVariant: full manifest entry lookup, null for unknown ids ---
const nikahVariant = selector.getBackgroundVariant('riwaayat-nikah-ivory');
assert.equal(nikahVariant.id, 'riwaayat-nikah-ivory');
assert.equal(nikahVariant.src, '/assets/wedding-invitations/riwaayat/riwaayat-nikah-ivory.svg');
assert.ok(nikahVariant.safeArea && typeof nikahVariant.safeArea.top === 'number');
assert.equal(selector.getBackgroundVariant('does-not-exist'), null);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/wedding-template-selector.test.js`
Expected: FAIL — `selector.resolveEventBackground is not a function`

- [ ] **Step 3: Write the implementation**

In `js/wedding-template-selector.js`, change line 6 from:

```js
    if (!riwaayatManifest && typeof require === 'function') riwaayatManifest = require('../assets/wedding-invitations/riwaayat/manifest.json');
```

to:

```js
    if (!riwaayatManifest && typeof require === 'function') riwaayatManifest = require('./riwaayat-manifest.js');
```

Then add these two functions immediately after `suggestBackgroundCategory` (after its closing `}`, before the final `return { ... }` block):

```js
    function resolveEventBackground(project, event) {
        var explicit = event && event.selectedBackgroundId;
        if (explicit) return explicit;
        var suggestions = suggestBackgroundCategory(project, event);
        return suggestions.length ? suggestions[0] : null;
    }

    function getBackgroundVariant(variantId) {
        if (!variantId) return null;
        for (var i = 0; i < riwaayatManifest.variants.length; i += 1) {
            if (riwaayatManifest.variants[i].id === variantId) return riwaayatManifest.variants[i];
        }
        return null;
    }
```

Then update the final `return { ... }` block to add both new functions:

```js
    return {
        WORDING_TONES: WORDING_TONES,
        DEFAULT_WORDING_TONE: DEFAULT_WORDING_TONE,
        FALLBACK_TEMPLATE_ID: FALLBACK_TEMPLATE_ID,
        EVENT_DESIGN_PALETTES: EVENT_DESIGN_PALETTES,
        selectTemplate: selectTemplate,
        getDesignPalette: getDesignPalette,
        suggestBackgroundCategory: suggestBackgroundCategory,
        resolveEventBackground: resolveEventBackground,
        getBackgroundVariant: getBackgroundVariant
    };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/wedding-template-selector.test.js`
Expected: PASS (no output on success is fine — check exit code 0)

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: `All 131 contract test files passed.`

- [ ] **Step 6: Commit**

```bash
git add js/wedding-template-selector.js tests/wedding-template-selector.test.js
git commit -m "WU-SHAADI-001 Slice 1 UI: add resolveEventBackground and getBackgroundVariant"
```

---

### Task 4: Page shell — `urdu-wedding-invitation-maker.html` and `css/urdu-wedding-invitation-maker.css`

**Files:**
- Create: `urdu-wedding-invitation-maker.html`
- Create: `css/urdu-wedding-invitation-maker.css`

**Interfaces:**
- Consumes: nothing (static markup only; no behavior in this task).
- Produces: the DOM structure and `data-*` hooks Task 6's JS will bind to — exact contract below. Every `data-*` attribute name listed here is load-bearing: Task 6 queries these selectors verbatim.

DOM contract (for Task 6):
- `<body class="wedding-maker-page">`
- Step rail: `<ol class="wedding-step-rail" data-wedding-step-rail>` containing 6 `<li data-wedding-step-tab="events|hosts|schedule_venue|language_wording|design|preview_export">` items.
- One `<section data-wedding-step-panel="events">` (and five siblings for the other step ids), only one visible at a time (`hidden` attribute toggled by JS).
- Step 1 (`events`) panel contains: `<div data-wedding-events-list>` (JS renders one row per event here) and `<button type="button" data-wedding-add-event>Add event</button>`.
- Step 2 (`hosts`) panel contains: `<div data-wedding-families-list>` and `<button type="button" data-wedding-add-family>Add family</button>`.
- Step 3 (`schedule_venue`) panel contains: `<div data-wedding-schedule-list>` (per-event date/venue fields, JS-rendered).
- Step 4 (`language_wording`) panel contains: `<select data-wedding-invitation-language>`, `<div data-wedding-wording-list>` (per-event tone + wording preview + override controls, JS-rendered).
- Step 5 (`design`) panel contains: `<div data-wedding-design-list>` (per-event background picker, JS-rendered).
- Step 6 (`preview_export`) panel contains: `<div data-wedding-preview-list>` (per-event rendered preview + download button, JS-rendered).
- Nav buttons, present once outside the step panels: `<button type="button" data-wedding-back>Back</button>` and `<button type="button" data-wedding-next>Next</button>`.
- A status line for save feedback: `<p data-wedding-save-status aria-live="polite"></p>`.

- [ ] **Step 1: Write `urdu-wedding-invitation-maker.html`**

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Free Urdu Wedding Invitation Maker — Nikah, Mehndi, Baraat &amp; Walima Cards | WriteUrdu</title>
    <meta name="description" content="Build a Pakistani wedding invitation for Nikah, Mehndi, Baraat and Walima with Urdu, English or bilingual wording, a matching design and downloadable images — all kept private in your browser.">
    <meta name="robots" content="index,follow,max-image-preview:large">
    <link rel="canonical" href="https://write-urdu.com/urdu-wedding-invitation-maker">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Write Urdu">
    <meta property="og:title" content="Free Urdu Wedding Invitation Maker — Nikah, Mehndi, Baraat &amp; Walima Cards">
    <meta property="og:description" content="Build a Pakistani wedding invitation for Nikah, Mehndi, Baraat and Walima with Urdu, English or bilingual wording, a matching design and downloadable images.">
    <meta property="og:url" content="https://write-urdu.com/urdu-wedding-invitation-maker">
    <meta property="og:image" content="https://write-urdu.com/image/logo10.png">
    <link rel="icon" href="/image/logo10.png" type="image/png">
    <link rel="stylesheet" href="/css/site-header.css">
    <link rel="stylesheet" href="/css/urdu-wedding-invitation-maker.css">
    <script src="/seo.config.js" defer></script>
    <script src="/js/seo.js" defer></script>
    <script src="/site-header.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" defer></script>
    <script src="/js/wedding-wording-registry.js" defer></script>
    <script src="/js/riwaayat-manifest.js" defer></script>
    <script src="/js/wedding-project-core.js" defer></script>
    <script src="/js/wedding-template-selector.js" defer></script>
    <script src="/js/wedding-project-storage.js" defer></script>
    <script src="/js/urdu-wedding-invitation-maker.js" defer></script>
</head>
<body class="wedding-maker-page">
    <main class="wedding-maker-main">
        <h1>Urdu Wedding Invitation Maker</h1>
        <p class="wedding-maker-intro">Build your Nikah, Mehndi, Baraat or Walima invitation. Everything stays in your browser until you download it.</p>

        <ol class="wedding-step-rail" data-wedding-step-rail>
            <li data-wedding-step-tab="events">Events</li>
            <li data-wedding-step-tab="hosts">Hosts</li>
            <li data-wedding-step-tab="schedule_venue">Schedule &amp; venue</li>
            <li data-wedding-step-tab="language_wording">Language &amp; wording</li>
            <li data-wedding-step-tab="design">Design</li>
            <li data-wedding-step-tab="preview_export">Preview &amp; export</li>
        </ol>

        <section data-wedding-step-panel="events" hidden>
            <h2>Which events are you inviting guests to?</h2>
            <div data-wedding-events-list></div>
            <button type="button" data-wedding-add-event>Add event</button>
        </section>

        <section data-wedding-step-panel="hosts" hidden>
            <h2>Who is hosting?</h2>
            <div data-wedding-families-list></div>
            <button type="button" data-wedding-add-family>Add family</button>
        </section>

        <section data-wedding-step-panel="schedule_venue" hidden>
            <h2>Date, programme and venue</h2>
            <div data-wedding-schedule-list></div>
        </section>

        <section data-wedding-step-panel="language_wording" hidden>
            <h2>Language and wording</h2>
            <label>Invitation language
                <select data-wedding-invitation-language>
                    <option value="urdu">اردو</option>
                    <option value="english">English</option>
                    <option value="bilingual">Bilingual</option>
                </select>
            </label>
            <div data-wedding-wording-list></div>
        </section>

        <section data-wedding-step-panel="design" hidden>
            <h2>Choose a design</h2>
            <div data-wedding-design-list></div>
        </section>

        <section data-wedding-step-panel="preview_export" hidden>
            <h2>Preview and download</h2>
            <div data-wedding-preview-list></div>
        </section>

        <div class="wedding-maker-nav">
            <button type="button" data-wedding-back>Back</button>
            <button type="button" data-wedding-next>Next</button>
        </div>
        <p data-wedding-save-status aria-live="polite"></p>
    </main>

    <script type="application/ld+json" data-write-urdu-schema>{"@context":"https://schema.org","@graph":[{"@type":"WebSite","@id":"https://write-urdu.com/#website","url":"https://write-urdu.com/","name":"Write Urdu","alternateName":["WriteUrdu","Write-Urdu.com"],"description":"Tools for typing, formatting, designing and sharing Urdu.","inLanguage":["en","ur"],"publisher":{"@id":"https://write-urdu.com/#publisher"}},{"@type":"Organization","@id":"https://write-urdu.com/#publisher","name":"Write Urdu","url":"https://write-urdu.com/","description":"Write Urdu helps people type Urdu with English letters, type Urdu directly, format documents and create shareable Urdu designs.","logo":{"@type":"ImageObject","@id":"https://write-urdu.com/#logo","url":"https://write-urdu.com/image/logo10.png","contentUrl":"https://write-urdu.com/image/logo10.png"},"knowsLanguage":["en","ur"],"alternateName":["WriteUrdu","Write-Urdu.com"],"email":"admin@write-urdu.com","publishingPrinciples":"https://write-urdu.com/why-write-urdu","contactPoint":{"@type":"ContactPoint","contactType":"customer support","availableLanguage":["English","Urdu"],"email":"admin@write-urdu.com","url":"https://write-urdu.com/contact"}},{"@type":"WebPage","@id":"https://write-urdu.com/urdu-wedding-invitation-maker#webpage","url":"https://write-urdu.com/urdu-wedding-invitation-maker","name":"Free Urdu Wedding Invitation Maker — Nikah, Mehndi, Baraat & Walima Cards | WriteUrdu","description":"Build a Pakistani wedding invitation for Nikah, Mehndi, Baraat and Walima with Urdu, English or bilingual wording, a matching design and downloadable images — all kept private in your browser.","inLanguage":["en","ur"],"isPartOf":{"@id":"https://write-urdu.com/#website"},"publisher":{"@id":"https://write-urdu.com/#publisher"},"dateModified":"2026-09-19","breadcrumb":{"@id":"https://write-urdu.com/urdu-wedding-invitation-maker#breadcrumbs"},"mainEntity":{"@id":"https://write-urdu.com/urdu-wedding-invitation-maker#application"}},{"@type":"BreadcrumbList","@id":"https://write-urdu.com/urdu-wedding-invitation-maker#breadcrumbs","itemListElement":[{"@type":"ListItem","position":1,"name":"Write Urdu","item":"https://write-urdu.com/"},{"@type":"ListItem","position":2,"name":"Tools","item":"https://write-urdu.com/write-urdu-sitemap"},{"@type":"ListItem","position":3,"name":"Urdu Wedding Invitation Maker","item":"https://write-urdu.com/urdu-wedding-invitation-maker"}]},{"@type":"WebApplication","@id":"https://write-urdu.com/urdu-wedding-invitation-maker#application","name":"Free Urdu Wedding Invitation Maker","url":"https://write-urdu.com/urdu-wedding-invitation-maker","mainEntityOfPage":{"@id":"https://write-urdu.com/urdu-wedding-invitation-maker#webpage"},"applicationCategory":"LifestyleApplication","operatingSystem":"Any","browserRequirements":"Works in a modern web browser","isAccessibleForFree":true,"description":"Build a Pakistani wedding invitation for Nikah, Mehndi, Baraat and Walima with Urdu, English or bilingual wording, a matching design and downloadable images — all kept private in your browser.","inLanguage":"en","featureList":["Six-step guided wedding invitation composer","Urdu, English and bilingual wording templates","Event-specific Nikah, Mehndi, Baraat and Walima designs","Editable wording that survives regeneration","Downloadable invitation images per event","Keeps wedding data in the browser"],"publisher":{"@id":"https://write-urdu.com/#publisher"}}]}</script>
</body>
</html>
```

Note: the shared `<nav>`/`<footer>` shell markup is generated by `npm run shell:sync` (Task 8), not hand-authored — leave it out of this file for now; Task 8's sync step inserts it automatically the same way it exists on every other page.

- [ ] **Step 2: Write `css/urdu-wedding-invitation-maker.css`**

```css
.wedding-maker-page {
    background: var(--wu-color-page, #f6f8f7);
    color: var(--wu-color-ink, #17221c);
    font-family: var(--wu-font-ui, system-ui, sans-serif);
}

.wedding-maker-main {
    max-width: var(--wu-content-width, 78rem);
    margin: 0 auto;
    padding: var(--wu-space-6, 2rem) var(--wu-space-4, 1rem);
}

.wedding-maker-intro {
    color: var(--wu-color-muted, #68766e);
    margin-bottom: var(--wu-space-5, 1.5rem);
}

.wedding-step-rail {
    display: flex;
    flex-wrap: wrap;
    gap: var(--wu-space-2, 0.5rem);
    list-style: none;
    margin: 0 0 var(--wu-space-6, 2rem);
    padding: 0;
}

.wedding-step-rail li {
    padding: var(--wu-space-2, 0.5rem) var(--wu-space-4, 1rem);
    border: 1px solid var(--wu-color-border, #dfe7e2);
    border-radius: var(--wu-radius-pill, 999px);
    font-size: var(--wu-text-sm, 0.875rem);
    color: var(--wu-color-muted, #68766e);
    background: var(--wu-color-surface, #fff);
}

.wedding-step-rail li[data-wedding-step-status="complete"] {
    border-color: var(--wu-color-brand, #15934d);
    color: var(--wu-color-brand-strong, #0d783e);
}

.wedding-step-rail li[data-wedding-step-status="current"] {
    border-color: var(--wu-color-brand, #15934d);
    background: var(--wu-color-brand-soft, #eaf8ef);
    color: var(--wu-color-brand-deep, #0a5d31);
    font-weight: var(--wu-weight-semibold, 600);
}

.wedding-step-rail li[data-wedding-step-status="blocked"] {
    opacity: 0.55;
    cursor: not-allowed;
}

[data-wedding-step-panel] {
    background: var(--wu-color-surface, #fff);
    border: 1px solid var(--wu-color-border, #dfe7e2);
    border-radius: var(--wu-radius-md, 0.8rem);
    padding: var(--wu-space-5, 1.5rem);
    margin-bottom: var(--wu-space-5, 1.5rem);
}

.wedding-maker-nav {
    display: flex;
    justify-content: space-between;
    gap: var(--wu-space-3, 0.75rem);
}

.wedding-maker-nav button {
    min-height: var(--wu-control-height, 2.75rem);
    padding: 0 var(--wu-space-5, 1.5rem);
    border-radius: var(--wu-radius-sm, 0.6rem);
    border: 1px solid var(--wu-color-border-strong, #cbd9d1);
    background: var(--wu-color-surface, #fff);
    cursor: pointer;
}

[data-wedding-next] {
    background: var(--wu-color-brand, #15934d);
    color: #fff;
    border-color: var(--wu-color-brand-strong, #0d783e);
}

.wedding-design-option {
    display: inline-block;
    width: 120px;
    margin: 0 var(--wu-space-2, 0.5rem) var(--wu-space-2, 0.5rem) 0;
    border: 2px solid var(--wu-color-border, #dfe7e2);
    border-radius: var(--wu-radius-sm, 0.6rem);
    cursor: pointer;
    overflow: hidden;
    background-size: cover;
    background-position: center;
    aspect-ratio: 4 / 5;
}

.wedding-design-option[aria-pressed="true"] {
    border-color: var(--wu-color-brand, #15934d);
}

.wedding-design-fallback {
    background: #fffdf7;
    border: 1px solid #c9a75a;
}

.wedding-preview-card {
    position: relative;
    width: 100%;
    max-width: 360px;
    aspect-ratio: 4 / 5;
    background-size: cover;
    background-position: center;
    margin-bottom: var(--wu-space-4, 1rem);
    overflow: hidden;
}

.wedding-preview-card.wedding-design-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
}

.wedding-preview-text {
    position: absolute;
    white-space: pre-line;
    text-align: center;
    font-family: var(--wu-font-urdu, serif);
}
```

- [ ] **Step 3: Verify the page loads with no JS errors (visual smoke check)**

Run: `npm start` (starts `scripts/dev-server.js`), then open `http://localhost:<port>/urdu-wedding-invitation-maker.html` in a browser. Since `js/urdu-wedding-invitation-maker.js` doesn't exist yet, the browser console will show a 404 for that one script — expected at this point. Confirm the step rail and all 6 (hidden) panels are present in the DOM inspector, and no other errors appear.

- [ ] **Step 4: Commit**

```bash
git add urdu-wedding-invitation-maker.html css/urdu-wedding-invitation-maker.css
git commit -m "WU-SHAADI-001 Slice 1 UI: add composer page shell and stylesheet"
```

---

### Task 5: `js/urdu-wedding-invitation-maker.js` — DOM wiring

**Files:**
- Create: `js/urdu-wedding-invitation-maker.js`

**Interfaces:**
- Consumes: `window.WriteUrduWeddingCore` (Task 1's `createDefaultWeddingProject`, `normalizeWeddingProject`, `evaluateComposerSteps`, `wrapWordingResult`, `applyWordingOverride`, `isWordingStale`), `window.WriteUrduWeddingWording` (`renderWording`, `TEMPLATES`), `window.WriteUrduWeddingTemplateSelector` (Task 3's `selectTemplate`, `resolveEventBackground`, `getBackgroundVariant`, `WORDING_TONES`), `window.WriteUrduWeddingProjectStorage` (`saveDraft`, `loadDraft`), `window.html2canvas`. Task 4's DOM contract (all `data-wedding-*` selectors).
- Produces: nothing consumed by a later task — this is the final application layer for this slice.

- [ ] **Step 1: Write the implementation**

Create `js/urdu-wedding-invitation-maker.js`:

```js
(function () {
    'use strict';

    var core = window.WriteUrduWeddingCore;
    var wording = window.WriteUrduWeddingWording;
    var templateSelector = window.WriteUrduWeddingTemplateSelector;
    var storage = window.WriteUrduWeddingProjectStorage;
    if (!core || !wording || !templateSelector || !storage) return;

    var STEP_IDS = ['events', 'hosts', 'schedule_venue', 'language_wording', 'design', 'preview_export'];
    var EVENT_LABELS = { nikah: 'Nikah', mehndi: 'Mehndi', mayun: 'Mayun', dholki: 'Dholki', baraat: 'Baraat', rukhsati: 'Rukhsati', walima: 'Walima', engagement: 'Engagement', custom: 'Custom' };

    var project = storage.loadDraft() || core.createDefaultWeddingProject();
    var currentStepIndex = 0;

    function save() {
        project = core.normalizeWeddingProject(project);
        var result = storage.saveDraft(project);
        var statusEl = document.querySelector('[data-wedding-save-status]');
        if (statusEl) statusEl.textContent = result.ok ? 'Saved to this browser.' : 'Could not save (private browsing?).';
    }

    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        Object.keys(attrs || {}).forEach(function (key) {
            if (key === 'text') node.textContent = attrs[key];
            else node.setAttribute(key, attrs[key]);
        });
        (children || []).forEach(function (child) { node.appendChild(child); });
        return node;
    }

    function renderStepRail(steps) {
        var rail = document.querySelector('[data-wedding-step-rail]');
        if (!rail) return;
        STEP_IDS.forEach(function (stepId, index) {
            var tab = rail.querySelector('[data-wedding-step-tab="' + stepId + '"]');
            if (!tab) return;
            tab.setAttribute('data-wedding-step-status', steps[index].status);
            tab.onclick = function () {
                if (steps[index].status === 'blocked') return;
                currentStepIndex = index;
                renderCurrentStep();
            };
        });
    }

    function showPanel(stepId) {
        STEP_IDS.forEach(function (id) {
            var panel = document.querySelector('[data-wedding-step-panel="' + id + '"]');
            if (panel) panel.hidden = id !== stepId;
        });
    }

    function renderEventsStep() {
        var list = document.querySelector('[data-wedding-events-list]');
        if (!list) return;
        list.innerHTML = '';
        project.events.forEach(function (event, index) {
            var select = el('select', {});
            core.EVENT_TYPES.forEach(function (type) {
                var option = el('option', { value: type, text: EVENT_LABELS[type] || type });
                if (event.type === type) option.setAttribute('selected', 'selected');
                select.appendChild(option);
            });
            select.onchange = function () {
                project.events[index].type = select.value;
                save();
                refreshAll();
            };
            list.appendChild(el('div', {}, [select]));
        });
    }

    function addEvent() {
        project.events.push(core.normalizeWeddingProject({ events: [{ type: 'nikah' }] }).events[0]);
        save();
        refreshAll();
    }

    function renderFamiliesStep() {
        var list = document.querySelector('[data-wedding-families-list]');
        if (!list) return;
        list.innerHTML = '';
        project.families.forEach(function (family, index) {
            var input = el('input', { value: family.displayName, placeholder: 'Family name' });
            input.oninput = function () {
                project.families[index].displayName = input.value;
                save();
                renderStepRail(core.evaluateComposerSteps(project));
            };
            list.appendChild(el('div', {}, [input]));
        });
    }

    function addFamily() {
        project.families.push(core.normalizeWeddingProject({ families: [{ role: 'both' }] }).families[0]);
        save();
        refreshAll();
    }

    function renderScheduleStep() {
        var list = document.querySelector('[data-wedding-schedule-list]');
        if (!list) return;
        list.innerHTML = '';
        project.events.forEach(function (event, index) {
            var dateInput = el('input', { type: 'date', value: event.date || '' });
            dateInput.onchange = function () {
                project.events[index].date = dateInput.value;
                save();
                renderStepRail(core.evaluateComposerSteps(project));
            };
            list.appendChild(el('div', {}, [el('label', { text: EVENT_LABELS[event.type] || event.type }), dateInput]));
        });
    }

    function renderWordingStep() {
        var languageSelect = document.querySelector('[data-wedding-invitation-language]');
        if (languageSelect) {
            languageSelect.value = project.invitationLanguage;
            languageSelect.onchange = function () {
                project.invitationLanguage = languageSelect.value;
                save();
                refreshAll();
            };
        }
        var list = document.querySelector('[data-wedding-wording-list]');
        if (!list) return;
        list.innerHTML = '';
        project.events.forEach(function (event, index) {
            var container = el('div', {});
            container.appendChild(el('h3', { text: EVENT_LABELS[event.type] || event.type }));

            var toneSelect = el('select', {});
            templateSelector.WORDING_TONES.forEach(function (tone) {
                var option = el('option', { value: tone, text: tone });
                if (event.wordingTone === tone) option.setAttribute('selected', 'selected');
                toneSelect.appendChild(option);
            });
            toneSelect.onchange = function () {
                project.events[index].wordingTone = toneSelect.value;
                save();
                renderWordingStep();
            };
            container.appendChild(toneSelect);

            var templateId = templateSelector.selectTemplate(project, event);
            var rendered = wording.renderWording(templateId, project, event);
            var textArea = el('textarea', {});
            textArea.value = event.wordingOverride ? event.wordingOverride.text : (rendered.complete ? rendered.text : '');
            container.appendChild(textArea);

            if (event.wordingOverride && core.isWordingStale(event.wordingOverride, project, event)) {
                container.appendChild(el('p', { text: 'Wording may be outdated — regenerate?' }));
                var regenerateButton = el('button', { type: 'button', text: 'Regenerate' });
                regenerateButton.onclick = function () {
                    project.events[index].wordingOverride = null;
                    save();
                    renderWordingStep();
                };
                container.appendChild(regenerateButton);
            }

            var saveOverrideButton = el('button', { type: 'button', text: 'Save wording' });
            saveOverrideButton.onclick = function () {
                var wrapped = event.wordingOverride || core.wrapWordingResult(rendered, templateId, project, event);
                if (!wrapped) return;
                project.events[index].wordingOverride = core.applyWordingOverride(wrapped, textArea.value);
                save();
                renderWordingStep();
            };
            container.appendChild(saveOverrideButton);

            list.appendChild(container);
        });
    }

    function renderDesignStep() {
        var list = document.querySelector('[data-wedding-design-list]');
        if (!list) return;
        list.innerHTML = '';
        project.events.forEach(function (event, index) {
            var container = el('div', {});
            container.appendChild(el('h3', { text: EVENT_LABELS[event.type] || event.type }));

            var suggestions = templateSelector.suggestBackgroundCategory(project, event);
            if (!suggestions.length) {
                container.appendChild(el('div', { 'class': 'wedding-design-option wedding-design-fallback' }));
                container.appendChild(el('p', { text: 'No matching design yet for this event type.' }));
            } else {
                suggestions.forEach(function (variantId) {
                    var variant = templateSelector.getBackgroundVariant(variantId);
                    var option = el('button', { type: 'button', 'class': 'wedding-design-option', style: 'background-image:url(' + variant.src + ')' });
                    option.setAttribute('aria-pressed', String(event.selectedBackgroundId === variantId));
                    option.onclick = function () {
                        project.events[index].selectedBackgroundId = variantId;
                        save();
                        renderDesignStep();
                    };
                    container.appendChild(option);
                });
            }
            list.appendChild(container);
        });
    }

    function applyPreviewCardStyle(cardEl, textEl, variant) {
        if (variant) {
            cardEl.classList.remove('wedding-design-fallback');
            cardEl.style.backgroundImage = 'url(' + variant.src + ')';
            textEl.style.color = variant.textColor;
            textEl.style.top = (variant.safeArea.top * 100) + '%';
            textEl.style.left = (variant.safeArea.left * 100) + '%';
            textEl.style.right = (variant.safeArea.right * 100) + '%';
            textEl.style.bottom = (variant.safeArea.bottom * 100) + '%';
        } else {
            cardEl.classList.add('wedding-design-fallback');
            cardEl.style.backgroundImage = 'none';
            textEl.style.color = '#3c3324';
            textEl.style.top = '18%';
            textEl.style.left = '16%';
            textEl.style.right = '16%';
            textEl.style.bottom = '18%';
        }
    }

    function renderPreviewStep() {
        var list = document.querySelector('[data-wedding-preview-list]');
        if (!list) return;
        list.innerHTML = '';
        project.events.forEach(function (event, index) {
            var templateId = templateSelector.selectTemplate(project, event);
            var rendered = wording.renderWording(templateId, project, event);
            var text = event.wordingOverride ? event.wordingOverride.text : (rendered.complete ? rendered.text : '');

            var backgroundId = templateSelector.resolveEventBackground(project, event);
            var variant = backgroundId ? templateSelector.getBackgroundVariant(backgroundId) : null;

            var textEl = el('div', { 'class': 'wedding-preview-text', text: text });
            var cardEl = el('div', { 'class': 'wedding-preview-card' }, [textEl]);
            applyPreviewCardStyle(cardEl, textEl, variant);

            var downloadButton = el('button', { type: 'button', text: 'Download image' });
            downloadButton.onclick = function () {
                window.html2canvas(cardEl, { backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false }).then(function (canvas) {
                    var link = document.createElement('a');
                    link.download = (event.type || 'event') + '-invitation.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                });
            };

            list.appendChild(el('div', {}, [cardEl, downloadButton]));
        });
    }

    var STEP_RENDERERS = {
        events: renderEventsStep,
        hosts: renderFamiliesStep,
        schedule_venue: renderScheduleStep,
        language_wording: renderWordingStep,
        design: renderDesignStep,
        preview_export: renderPreviewStep
    };

    function renderCurrentStep() {
        var stepId = STEP_IDS[currentStepIndex];
        showPanel(stepId);
        STEP_RENDERERS[stepId]();
        renderStepRail(core.evaluateComposerSteps(project));
    }

    function refreshAll() {
        renderCurrentStep();
    }

    function bindNav() {
        var backButton = document.querySelector('[data-wedding-back]');
        var nextButton = document.querySelector('[data-wedding-next]');
        if (backButton) backButton.onclick = function () {
            if (currentStepIndex > 0) currentStepIndex -= 1;
            renderCurrentStep();
        };
        if (nextButton) nextButton.onclick = function () {
            if (currentStepIndex < STEP_IDS.length - 1) currentStepIndex += 1;
            renderCurrentStep();
        };
    }

    function bindAddButtons() {
        var addEventButton = document.querySelector('[data-wedding-add-event]');
        if (addEventButton) addEventButton.onclick = addEvent;
        var addFamilyButton = document.querySelector('[data-wedding-add-family]');
        if (addFamilyButton) addFamilyButton.onclick = addFamily;
    }

    function init() {
        bindNav();
        bindAddButtons();
        renderCurrentStep();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
```

- [ ] **Step 2: Manual smoke test in a browser**

Run: `npm start`, open `http://localhost:<port>/urdu-wedding-invitation-maker.html`. Click "Add event", confirm a select appears; change its type; click Next through all 6 steps; confirm the step rail updates statuses; go to Design step, confirm clicking a thumbnail toggles `aria-pressed`; go to Preview step, confirm text renders inside the card; reload the page and confirm the event you added is still there (persistence via `loadDraft`).

- [ ] **Step 3: Commit**

```bash
git add js/urdu-wedding-invitation-maker.js
git commit -m "WU-SHAADI-001 Slice 1 UI: wire the composer wizard DOM behavior"
```

---

### Task 6: Playwright spec `tests/urdu-wedding-invitation-maker.spec.js`

**Files:**
- Create: `tests/urdu-wedding-invitation-maker.spec.js`
- Modify: `playwright.config.js` (register the new spec in `testMatch`)

**Interfaces:**
- Consumes: the live page from Tasks 4-5, served by `tests/server.js` per `playwright.config.js`'s `webServer` config.
- Produces: nothing consumed by a later task.

- [ ] **Step 1: Write the spec**

Create `tests/urdu-wedding-invitation-maker.spec.js`:

```js
const { test, expect } = require('@playwright/test');

const blockExternal = (page) => page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, (route) => route.abort());

test('WU-SHAADI-001 composer: full 6-step happy path reaches a rendered preview', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await page.click('[data-wedding-add-event]');
  await page.selectOption('[data-wedding-events-list] select', 'nikah');
  await page.click('[data-wedding-next]');

  await page.click('[data-wedding-add-family]');
  await page.fill('[data-wedding-families-list] input', 'The Khan Family');
  await page.click('[data-wedding-next]');

  await page.fill('[data-wedding-schedule-list] input[type="date"]', '2026-12-05');
  await page.click('[data-wedding-next]');

  await page.selectOption('[data-wedding-invitation-language]', 'urdu');
  await page.click('[data-wedding-next]');

  await page.click('[data-wedding-next]'); // design step: accept whatever default/suggestion exists

  await expect(page.locator('.wedding-preview-card')).toBeVisible();
  await expect(page.locator('.wedding-preview-text')).not.toHaveText('');
});

test('WU-SHAADI-001 composer: blocked steps cannot be jumped to', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await page.click('[data-wedding-step-tab="preview_export"]');
  await expect(page.locator('[data-wedding-step-panel="events"]')).toBeVisible();
  await expect(page.locator('[data-wedding-step-panel="preview_export"]')).toBeHidden();
});

test('WU-SHAADI-001 composer: wording override survives and image export produces a file', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await page.click('[data-wedding-add-event]');
  await page.selectOption('[data-wedding-events-list] select', 'nikah');
  await page.click('[data-wedding-next]');
  await page.click('[data-wedding-add-family]');
  await page.fill('[data-wedding-families-list] input', 'The Khan Family');
  await page.click('[data-wedding-next]');
  await page.fill('[data-wedding-schedule-list] input[type="date"]', '2026-12-05');
  await page.click('[data-wedding-next]');

  await page.fill('[data-wedding-wording-list] textarea', 'My own hand-edited wording');
  await page.click('[data-wedding-wording-list] button:has-text("Save wording")');
  await page.click('[data-wedding-next]');
  await page.click('[data-wedding-next]');

  await expect(page.locator('.wedding-preview-text')).toHaveText('My own hand-edited wording');

  const downloadPromise = page.waitForEvent('download');
  await page.click('[data-wedding-preview-list] button:has-text("Download image")');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.png$/);
});

test('WU-SHAADI-001 composer: reload restores the in-progress draft', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await page.click('[data-wedding-add-event]');
  await page.selectOption('[data-wedding-events-list] select', 'mehndi');
  await page.waitForTimeout(200); // allow the save() debounce-free write to localStorage

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-wedding-events-list] select')).toHaveValue('mehndi');
});
```

- [ ] **Step 2: Register the spec**

In `playwright.config.js`, add `'urdu-wedding-invitation-maker.spec.js'` as the last entry in the `testMatch` array (after `'wedding-invitation-render-adapter.spec.js'`).

- [ ] **Step 3: Run the spec to verify it fails first (TDD honesty check), then passes**

Run: `npm run test:browser -- urdu-wedding-invitation-maker.spec.js`
Expected first run (before Task 4/5 exist, if run out of order): FAIL with a navigation/404 error. Since Tasks 4-5 are already done by the time this task runs in sequence, run it now and expect: PASS, 4 tests.

If any test fails because a selector doesn't match Task 5's actual DOM output, fix the mismatch in `js/urdu-wedding-invitation-maker.js` (not the test) only if Task 5's code deviates from its own documented DOM contract in Task 4; otherwise fix the test's selector.

- [ ] **Step 4: Commit**

```bash
git add tests/urdu-wedding-invitation-maker.spec.js playwright.config.js
git commit -m "WU-SHAADI-001 Slice 1 UI: add Playwright spec for the composer wizard"
```

---

### Task 7: Route registration

**Files:**
- Modify: `docs/WU-PUBLIC-PAGE-REGISTRY.csv`
- Modify: `seo.config.js`
- Modify: `_redirects`
- Modify: `write-urdu-sitemap.html`
- Modify: `js/outcome-navigation.js`
- Generated (do not hand-edit): `sitemap.xml`, `robots.txt`
- Synced (do not hand-edit): shared nav/footer markup on every static HTML page (including this new one)

**Interfaces:**
- Consumes: everything from Tasks 1-6 (the page must exist and work before it's registered).
- Produces: the final governance counts this whole plan is scoped around (46/50/103).

- [ ] **Step 1: Add the registry row**

In `docs/WU-PUBLIC-PAGE-REGISTRY.csv`, append (matching the existing 10-column header `source_file,canonical_route,area,primary_intent,indexability,sitemap,status,design_migration,priority,notes` exactly):

```
urdu-wedding-invitation-maker.html,/urdu-wedding-invitation-maker,Wedding,step-by-step Pakistani wedding invitation composer for Nikah Mehndi Baraat and Walima,index,yes,keep,migrated,P1,WU-SHAADI-001 Slice 1 UI; roadmap/release permission granted 2026-09-19; uses the Riwaayat SVG pack (PR #231) for event-specific designs; no guest data leaves the browser
```

- [ ] **Step 2: Add the `seo.config.js` entry**

In `seo.config.js`, add to the `config.pages` array (after the `urdu-bill-generator` entry):

```js
{ id: 'urdu-wedding-invitation-maker', path: '/urdu-wedding-invitation-maker', legacyPaths: [], indexable: true, title: 'Free Urdu Wedding Invitation Maker — Nikah, Mehndi, Baraat & Walima Cards | WriteUrdu', description: 'Build a Pakistani wedding invitation for Nikah, Mehndi, Baraat and Walima with Urdu, English or bilingual wording, a matching design and downloadable images — all kept private in your browser.', h1: 'Urdu Wedding Invitation Maker', section: 'tools', priority: .8, changefreq: 'monthly', lastmod: '2026-09-19', schema: ['WebApplication'] },
```

- [ ] **Step 3: Regenerate SEO files and sync head metadata**

Run:

```bash
npm run seo:generate
npm run seo:sync-heads
```

Expected: `sitemap.xml` and `robots.txt` are rewritten to include the new route; `urdu-wedding-invitation-maker.html`'s `<head>` metadata is overwritten in place to be byte-consistent with every other page (this may adjust exact JSON-LD field ordering/formatting from Task 4's hand-written version — that's expected and correct, not a regression).

- [ ] **Step 4: Add the `_redirects` line**

In `_redirects`, append (after the `/urdu-bill-generator/ /urdu-bill-generator 301` line, matching the existing convention of appending each new tool's line after the most recently added one):

```
/urdu-wedding-invitation-maker/ /urdu-wedding-invitation-maker 301
```

- [ ] **Step 5: Add the nav entry**

In `js/outcome-navigation.js`, in the `id: 'work'` group's `items` array (currently ending with the `urdu-editor` entry), add a new item:

```js
{ href: '/urdu-wedding-invitation-maker', icon: 'wedding', label: { en: 'Build a wedding invitation', ur: 'شادی کا دعوت نامہ بنائیں' }, tool: { en: 'Wedding Invitation Maker', ur: 'شادی دعوت نامہ میکر' } },
```

- [ ] **Step 6: Sync the shared shell (nav/footer) across every static page**

Run:

```bash
npm run shell:sync
```

Expected: every static HTML page (including the new one) has its nav updated to include the new "Build a wedding invitation" link under "Tools"; `git status` will show many modified `.html` files (the shared nav/footer block) — this is expected and correct, not scope creep, since the shell is generated centrally.

- [ ] **Step 7: Add the sitemap directory card**

In `write-urdu-sitemap.html`, inside the `id="create"` section's card grid, add a new card immediately after the `urdu-bill-generator` card (before that grid's closing `</div></section>`):

```html
<a class="sitemap-directory-card" href="/urdu-wedding-invitation-maker"><span class="sitemap-directory-card-icon" aria-hidden="true">💍</span><span class="sitemap-directory-card-kicker">Pakistani wedding invitations</span><h3>Urdu Wedding Invitation Maker</h3><p>Build a Nikah, Mehndi, Baraat or Walima invitation with matching wording and design, then download it as an image.</p><span class="sitemap-directory-card-link">Build an invitation <span aria-hidden="true">→</span></span></a>
```

- [ ] **Step 8: Run the full local checks**

Run, in order:

```bash
npm run shell:check
npm run seo:graph:check
npm test
npm run seo:check
node scripts/check-product-governance.js
```

Expected: all pass; the governance script's final line reads `Product governance checks passed for 46 registered public pages, 50 sitemap routes, and 103 redirect rules.` If it reports different numbers, find and fix the discrepancy (a missed file from Steps 1-7) before continuing — do not adjust the governance script's expectations to match a wrong actual count.

- [ ] **Step 9: Run the browser test suite**

Run: `npm run test:browser`
Expected: all specs pass, including the new one from Task 6.

- [ ] **Step 10: Commit**

```bash
git add docs/WU-PUBLIC-PAGE-REGISTRY.csv seo.config.js sitemap.xml robots.txt _redirects js/outcome-navigation.js write-urdu-sitemap.html urdu-wedding-invitation-maker.html
git add -A  # picks up every shell-synced HTML file's nav/footer update
git commit -m "WU-SHAADI-001 Slice 1 UI: register /urdu-wedding-invitation-maker route"
```

---

## Final verification checklist

- [ ] `npm test` — all Node contract tests pass (131 files).
- [ ] `npm run test:browser` — all Playwright specs pass, including the new composer spec.
- [ ] `node scripts/check-product-governance.js` reports exactly 46 registered pages / 50 sitemap routes / 103 redirect rules.
- [ ] `npm run shell:check` and `npm run seo:check` both pass.
- [ ] Manual check: visiting `/urdu-wedding-invitation-maker` in a browser, completing all 6 steps, and downloading a PNG works end-to-end.
- [ ] No code in this plan touches `js/card-studio-core.js`, `js/card-background-registry.js`, or `js/wedding-invitation-render-adapter.js` (per spec Amendment 1).
- [ ] No code in this plan touches `RELIGIOUS_LIBRARY` or `religiousOpening` handling in `js/wedding-project-core.js`.
