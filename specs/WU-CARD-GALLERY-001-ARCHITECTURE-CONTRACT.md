# WU-CARD-GALLERY-001 — Architecture Contract

**Parent:** `WU-CARD-GALLERY-001-live-urdu-card-gallery.md`  
**Status:** Planned / implementation-ready after Slice 0 audit  
**Scope:** shared registry, lightweight live preview, Card Studio handoff, privacy/performance boundaries

## 1. Architecture principle

The Gallery is a lightweight chooser layered on top of existing Card Studio capabilities.

It must not fork the Card Studio renderer, background metadata, transliteration engine, Voice engine or export pipeline.

The authoritative flow is:

```text
shared background registry
        ↓
Gallery DOM preview ── selection/handoff ──> Card Studio
        ↓                                      ↓
lightweight visual choice                 authoritative edit/export
```

## 2. Shared registry boundary

Today background metadata is owned inside `js/card-studio-background-library.js`. Before the Gallery duplicates that array, extract a neutral registry module.

Recommended shape:

```text
js/card-background-registry.js
```

or an equivalent repo-conventional path discovered during Slice 0.

The registry should be usable without Card Studio DOM being present.

It should expose pure data and small pure helpers only.

Example API:

```js
getAllBackgrounds()
getBackgroundById(id)
getBackgroundCategories()
getBackgroundsByCategory(category)
```

Optional pure helpers may classify text length or suitability, but UI rendering belongs elsewhere.

## 3. Registry schema

Minimum record:

```js
{
  id: 'emerald-mughal',
  name: 'Emerald Mughal',
  nameUr: 'زمردی مغلیہ',
  category: 'classic',
  src: '/assets/card-studio/backgrounds/emerald-mughal.svg',
  thumbnailSrc: null,
  textColor: '#fff7df',
  overlayColor: '#10291f',
  overlayOpacity: 0.08,
  safeArea: { top: 0.18, right: 0.12, bottom: 0.18, left: 0.12 },
  textCapacity: 'medium',
  preferredAlign: 'center',
  goodFor: ['poetry', 'dua', 'quote']
}
```

Rules:

- preserve existing IDs;
- do not rename assets merely to make the new page tidy;
- `safeArea` values are normalized 0–1 fractions of the preview/card bounds;
- `textCapacity` must be a bounded enum;
- `goodFor` values must come from a controlled set;
- `thumbnailSrc` is optional for lightweight SVGs and recommended for large raster backgrounds;
- data must not include arbitrary executable callbacks.

## 4. Existing Card Studio integration

After extraction, `js/card-studio-background-library.js` should consume the shared registry rather than own a duplicate background array.

Behavior that must not regress:

- category filtering;
- background apply;
- local fetch/rasterization where required;
- recommended text colour;
- recommended overlay;
- editable text;
- browser-local state/history;
- export output;
- English/Urdu labels.

The refactor should be independently testable before the new route is launched.

## 5. Gallery modules

Recommended separation, subject to current repo conventions:

```text
urdu-card-gallery.html
css/card-gallery.css
js/card-gallery-core.js
js/card-gallery.js
```

Responsibilities:

### `card-gallery-core.js`

Pure logic:

- normalize text;
- classify empty/short/medium/long;
- choose preview font-size tier;
- determine suitability from `textCapacity`;
- deterministic category/intent ranking;
- build safe-area style values;
- no DOM, network or telemetry side effects.

### `card-gallery.js`

DOM behavior:

- bind text input;
- render gallery cards once;
- update preview text/styles efficiently;
- filter/reorder cards;
- selection/handoff;
- accessibility state;
- bounded telemetry calls through existing integration.

### `card-gallery.css`

Presentation:

- responsive preview grid;
- preview aspect ratio;
- overlay and safe-area text positioning;
- Nastaliq-friendly typography;
- mobile controls;
- selected/filter states;
- no global style leakage.

## 6. Preview DOM

Each preview should conceptually resemble:

```html
<article class="card-gallery-preview">
  <div class="card-gallery-art" aria-hidden="true"></div>
  <div class="card-gallery-overlay" aria-hidden="true"></div>
  <div class="card-gallery-safe-area">
    <p lang="ur" dir="rtl">…user text…</p>
  </div>
  <button type="button">Use this design</button>
</article>
```

Backgrounds may use `<img loading="lazy">` or CSS background images according to performance/crop needs.

The preview's user text must remain DOM text for accessibility and fast updates.

## 7. Input-update performance

Do not rebuild preview cards on each `input` event.

Preferred algorithm:

1. input event updates one in-memory string;
2. schedule at most one preview refresh for the next animation frame;
3. refresh existing visible text nodes and length classes;
4. avoid layout reads inside the per-card write loop;
5. do not refetch images;
6. do not instantiate canvases.

If actual testing proves frame batching insufficient, benchmark before adding more complexity.

## 8. Text fitting

The Gallery preview is deterministic and bounded.

Suggested initial buckets should be fixture-driven, not guessed forever. A starting model may use normalized character count plus explicit newline count.

Example concept:

```text
empty   = no meaningful text
short   = <= 80 normalized characters and <= 2 explicit lines
medium  = <= 220 normalized characters and <= 4 explicit lines
long    = everything above medium up to the preview input limit
```

These numbers are illustrative until Slice 0 fixture review.

The renderer should combine:

- text-length bucket;
- background `textCapacity`;
- safe-area size;
- font family/line-height.

It must never use CSS ellipsis to pretend long text fits.

A poor-fit design may show a restrained `Better for shorter text` marker or rank lower.

## 9. Safe-area rendering

Convert normalized bounds to inset values:

```text
top    = safeArea.top * 100%
right  = safeArea.right * 100%
bottom = safeArea.bottom * 100%
left   = safeArea.left * 100%
```

Text is laid out only inside that inset rectangle.

The safe area is metadata about visual composition, not a crop mask for the source image.

## 10. Asset strategy

### SVG backgrounds

For lightweight existing SVGs:

- direct lazy thumbnail usage is acceptable;
- do not rasterize every asset merely for gallery browsing.

### Rich WebP/raster backgrounds

For future premium raster assets:

- provide a lightweight thumbnail when full source weight is material;
- lazy-load full source only when required by Card Studio selection/export;
- do not preload the entire full-resolution collection.

The registry may point `thumbnailSrc` and `src` at different assets.

## 11. Handoff architecture

Reuse the current Card Studio handoff architecture after auditing:

```text
js/card-studio-handoff-adapter.js
js/card-studio-entry.js
```

Do not invent a query-string transport carrying user text.

Preferred payload concept:

```js
{
  version: 1,
  source: 'card-gallery',
  text: '…',
  backgroundId: '…',
  presetId: '…optional…'
}
```

Storage/transport should reuse current local/session handoff patterns and existing expiry/validation conventions.

On Card Studio arrival:

- validate payload version/source;
- resolve background by ID from shared registry;
- populate text;
- apply selected background defaults;
- keep normal user editing behavior.

## 12. Failure behavior

Gallery must degrade safely.

- background thumbnail failure → show neutral preview placeholder + name; other cards still work;
- unsupported handoff/storage → do not lose text; allow copy/manual continue fallback if necessary;
- Card Studio destination missing selected background → preserve text and open Card Studio without pretending the background was applied;
- unsupported optional Voice → direct/Roman text entry remains usable;
- JS failure should not expose private text through URL or server fallback.

## 13. Telemetry boundary

No event property may contain user text.

Potential events, subject to existing naming/governance:

```text
card_gallery_visit
card_gallery_first_input
card_gallery_filter_used
card_gallery_design_selected
card_gallery_handoff_started
card_gallery_destination_ready
```

Potential bounded properties:

```text
device_class
background_id
category
text_length_bucket
source
```

Never send:

```text
text
roman_text
transcript
rendered_html
canvas/image bytes
user-defined card title
```

## 14. SEO architecture

During validation, the route may exist with:

```html
<meta name="robots" content="noindex,follow">
```

or the repository's current equivalent source-of-truth configuration.

Do not add it to public discovery registries/sitemap before the SEO release gate.

When indexability is approved, use one canonical route and the shared SEO graph conventions.

## 15. Service worker / PWA

Do not change the service-worker cache generation casually.

Slice implementation must first inspect current PWA cache contracts and tests.

The Gallery HTML/JS/CSS can be added to the app shell only if current product policy says creation routes belong there and cache-size impact is acceptable.

Do not eagerly precache every full-resolution premium background.

## 16. Security

- registry IDs/categories are controlled application data;
- set user text using `textContent`, never raw `innerHTML`;
- validate handoff payload shape/version;
- cap input length for rendering resilience;
- no remote HTML/templates;
- no runtime third-party image-generation service;
- no external script dependency needed for the MVP.

## 17. Regression boundary

Protected behavior includes:

```text
/urdu-card-studio
/urdu-name-art-maker
/urdu-whatsapp-status-maker
/urdu-instagram-post-maker
```

The shared registry refactor must not accidentally expose Gallery controls on shared social/Name Art surfaces.

Current route guards and shared-engine relationships must be audited before moving code.

## 18. Stop conditions

Stop and report instead of improvising if:

- registry extraction changes Card Studio rendering behavior;
- the only way to preview is to create many canvases;
- handoff would put private text in URL;
- production route launch conflicts with the active P0/Card completion gate;
- adding Voice requires a duplicate speech engine;
- public SEO route ownership conflicts with Card Studio;
- mobile input becomes observably laggy;
- premium asset loading requires eager multi-megabyte downloads.
