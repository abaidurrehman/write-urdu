# WU-CARD-GALLERY-001 — Live Urdu Card Gallery Skill

Use this skill when planning, implementing, reviewing or testing `WU-CARD-GALLERY-001`.

This feature is a **background-first chooser** that complements Card Studio. It is not a replacement Card Studio, not a new export engine, and not permission to bypass the active product roadmap gate.

---

## Mandatory read order

1. `specs/BACKLOG.md`
2. `specs/WU-CARD-GALLERY-001-live-urdu-card-gallery.md`
3. `specs/WU-CARD-GALLERY-001-ARCHITECTURE-CONTRACT.md`
4. `specs/WU-CARD-GALLERY-001-IMPLEMENTATION-CHECKLIST.md`
5. `specs/WU-CARD-GALLERY-001-ACCEPTANCE-MATRIX.md`
6. `specs/WU-PLAT-002H-core-activation-feature-discovery.md`
7. `specs/WU-PLAT-002H-SCOPE-FREEZE.md`
8. current `js/card-studio-background-library.js`
9. current `js/card-studio-handoff-adapter.js`
10. current `js/card-studio-entry.js`
11. current `js/card-studio-core.js`, `js/card-studio.js`, Card Studio HTML/CSS only as needed to preserve behavior
12. current Card Studio/social maker/background tests
13. current telemetry allowlists and route/SEO/service-worker governance
14. `package.json`

Search the current repository before coding. Runtime code + regression tests are authoritative for shipped behavior.

---

## Core product job

The user should be able to:

```text
write once
→ see the same Urdu text immediately across many backgrounds
→ choose the design that feels best
→ continue to Card Studio with text + background preserved
→ edit/export normally
```

The Gallery is about **visual discovery speed**.

Card Studio remains the authoritative advanced editor and export destination.

---

## Roadmap gate

The canonical backlog currently includes a Card Studio completion gate under `WU-PLAT-002H` P0.1F.

Therefore:

- planning, fixtures, shared-registry extraction and isolated prototype work may proceed;
- do not launch/promote/index a new public Gallery route unless the backlog permits it or the founder explicitly records an exception;
- do not silently treat this skill as an exception.

If permission is unclear, execute Slice 0 only and report the gate.

---

## Slice order

```text
Slice 0  current-state audit + shared background registry + fixtures/perf baseline
Slice 1  /urdu-card-gallery lightweight live-preview MVP
Slice 2  Card Studio handoff + bounded funnel telemetry
Slice 3  intent chips + deterministic ranking
Slice 4  evidence-gated direct export/share experiment
Slice 5  evidence-gated public discovery / SEO release
```

Do not skip the registry foundation and do not create the Gallery with a copied background array.

---

## Hard architecture invariant

**Never render every gallery preview through Card Studio canvas on each keystroke.**

Gallery previews must be lightweight DOM composition:

```text
background image
+ optional overlay
+ DOM Urdu text positioned inside metadata safe area
```

The authoritative Card Studio canvas/export path runs only after selection/handoff (or a later carefully reviewed direct-export slice).

Stop if the proposed architecture requires 20–60 canvases updating per input event.

---

## Shared registry discipline

Extract background metadata into a neutral module before duplicating it.

Preserve all shipped background IDs.

Minimum useful metadata:

```text
id
name
nameUr
category
src
thumbnailSrc (optional)
textColor
overlayColor
overlayOpacity
safeArea
textCapacity
preferredAlign
goodFor
```

Do not over-engineer generic theme objects.

Existing Card Studio must consume the same registry after extraction.

---

## Text-safe design discipline

Every Gallery-enabled background must support a truthful preview.

Mandatory quality rules:

1. **Clear text-safe area** — central usable region stays calm.
2. **Strong Urdu contrast** — registry default text/overlay remains readable on a phone.
3. **Short and long text** — test short, medium and long fixtures.
4. **Receiver quality** — final selected/exported card must remain beautiful when viewed/shared, not only in the creator UI.

Do not silently clip long text with ellipsis.

If a design is poor for long text, rank/demote/mark it honestly.

---

## Preview update discipline

Render card shells once.

On input:

1. update one shared text state;
2. batch refresh with `requestAnimationFrame` or measured small debounce;
3. update text nodes/classes only;
4. do not refetch backgrounds;
5. do not rebuild the full gallery;
6. do not read layout repeatedly inside the card loop.

Benchmark before adding virtualization. A 12–40 item collection should normally remain simple.

---

## Urdu and bidi discipline

Use real Urdu fixtures.

Test:

```text
short phrase / dua
3–4 line quotation
6–8 line message
Urdu + Latin name/code + numbers
explicit line breaks
```

Preview text uses:

```html
lang="ur" dir="rtl"
```

Use Nastaliq-friendly line-height and do not visually reverse Latin identifiers/numbers.

---

## Handoff discipline

Reuse current Card Studio handoff/local state architecture.

Transfer only what is needed:

```text
version
source = card-gallery
text
backgroundId
optional presetId / intent
```

Never put user text into query string/hash.

Resolve selected background by controlled ID from shared registry on the Card Studio side.

Do not serialize image bytes or duplicate the whole background object in the payload.

---

## Input-mode discipline

The Gallery may reuse existing direct Urdu, Roman transliteration and unified Voice capabilities when they fit the page cleanly.

Never:

- fork transliteration logic;
- create a second speech-recognition engine;
- make input-mode controls visually more important than the card previews;
- send Voice/transliteration content to analytics.

The MVP can ship with the simplest existing input path if reuse creates scope risk.

---

## Privacy discipline

No user content in Product Pulse/analytics.

Never emit:

```text
Urdu text
Roman source
voice transcript
rendered card content
screenshots/canvas bytes
user-defined arbitrary labels
```

Potential bounded telemetry only after governance review:

```text
background_id
category
text_length_bucket
intent_id
device_class
handoff state
```

Use a sentinel string and inspect requests.

---

## Asset/performance discipline

For SVG backgrounds, direct lazy preview may be sufficient.

For rich raster/WebP assets:

- use lightweight thumbnails if material;
- lazy-load;
- do not eagerly fetch all full-resolution files;
- do not use a runtime third-party image service.

Do not casually modify service-worker cache generation. Read tests/contracts first.

---

## SEO discipline

Proposed one canonical product route:

```text
/urdu-card-gallery
```

Do not create near-duplicate acquisition routes.

During validation, keep the route noindex/not broadly promoted unless SEO ownership is explicitly approved.

Before public indexable release:

- compare intent against `/urdu-card-studio`;
- decide canonical query ownership;
- add unique metadata;
- then update sitemap/nav/llms/public registry only as justified.

---

## Mobile discipline

Primary QA viewports:

```text
360x800
375x667
390x844
412x915
768x1024
```

Must pass:

- input obvious;
- preview gallery starts quickly;
- no page-level horizontal overflow;
- filters work by touch;
- no hover-only essential controls;
- card actions are comfortably tappable;
- software keyboard does not trigger forced-scroll loops;
- typing remains smooth;
- Urdu preview is large enough to judge.

---

## Accessibility discipline

- native editable control + visible label;
- real DOM preview text;
- decorative background art does not spam screen readers;
- native buttons for filters/selection;
- selected state programmatic;
- visible focus;
- Urdu language/direction correct;
- reduced motion retains all information.

---

## Regression boundary

Protect existing behavior on:

```text
/urdu-card-studio
/urdu-name-art-maker
/urdu-whatsapp-status-maker
/urdu-instagram-post-maker
```

Also protect Basic/Rich Writer and any shared input engines reused.

A shared-registry refactor is not permission to change renderer/export/storage behavior.

---

## Testing discipline

Add focused pure tests first:

- registry unique IDs;
- old IDs preserved;
- category filtering;
- text-length classification;
- safe-area normalization;
- deterministic suitability/ranking;
- handoff payload validation.

Then browser/mobile tests:

- live preview update;
- short/medium/long fixtures;
- filters;
- mobile overflow;
- handoff to Card Studio;
- export regression;
- privacy sentinel.

Run current repo commands discovered from `package.json`. Prefer full existing quality/SEO/governance/browser suites before merge.

Do not weaken an old test merely because implementation ownership moved into a registry.

---

## Agent reporting format

For each slice report:

1. **Slice** — exact number/name.
2. **Roadmap permission** — why this slice is allowed now.
3. **User job** — what became possible.
4. **Files changed** — exact paths.
5. **Existing background IDs preserved?** — expected yes.
6. **Preview architecture** — explicitly confirm no per-card canvas loop.
7. **Text QA** — short/medium/long/mixed results.
8. **Performance** — measured evidence.
9. **Mobile** — viewport/device evidence.
10. **Privacy** — sentinel/network result.
11. **Handoff** — Gallery → Card Studio result.
12. **SEO** — indexability/canonical state.
13. **Tests** — commands/results.
14. **Remaining gates** — manual/P0/SEO/public release.
15. **Rollback** — simplest safe rollback.

---

## Stop conditions

Stop and report if:

- public route launch violates current backlog gate;
- registry extraction changes shipped Card Studio behavior;
- user text would enter URL or analytics;
- the implementation needs many live canvases;
- mobile typing visibly lags;
- Voice/transliteration requires duplicate engines;
- Gallery SEO would cannibalize Card Studio without an ownership decision;
- premium images require eager multi-megabyte loading;
- a background clips long text while the UI falsely presents it as suitable.

---

## Definition of a good implementation

The Gallery succeeds when a mobile user can type real Urdu once, instantly compare many genuinely different designs, confidently choose one, arrive in Card Studio with the exact text/background preserved, and export a receiver-quality card — while Card Studio remains stable, the page stays browser-local, and preview browsing feels lightweight rather than like running dozens of editors at once.
