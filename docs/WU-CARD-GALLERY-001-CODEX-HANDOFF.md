# WU-CARD-GALLERY-001 — Codex Implementation Handoff

Paste the prompt below into Codex from the Write-Urdu repository.

---

## Prompt

You are working in:

```text
Repository: https://github.com/abaidurrehman/write-urdu/
Product: Write-Urdu.com
Epic: WU-CARD-GALLERY-001
Proposed route: /urdu-card-gallery
```

Build the **Live Urdu Card Gallery / Background-First Rich Studio** progressively and safely.

### Product job

The experience should let a user:

```text
write Urdu once
→ instantly see the same text across all current backgrounds
→ compare designs visually
→ select the design they like
→ continue into /urdu-card-studio with text + selected background preserved
→ edit/export through the existing Card Studio
```

This is a new background-first chooser. It is **not** a replacement Card Studio and not a new export engine.

### Mandatory read order

Read these in full before changing code:

```text
specs/BACKLOG.md
specs/WU-CARD-GALLERY-001-live-urdu-card-gallery.md
specs/WU-CARD-GALLERY-001-ARCHITECTURE-CONTRACT.md
specs/WU-CARD-GALLERY-001-IMPLEMENTATION-CHECKLIST.md
specs/WU-CARD-GALLERY-001-ACCEPTANCE-MATRIX.md
skills/wu-card-gallery-001/SKILL.md
specs/WU-PLAT-002H-core-activation-feature-discovery.md
specs/WU-PLAT-002H-SCOPE-FREEZE.md
```

Then inspect current implementation/tests for:

```text
js/card-studio-background-library.js
js/card-studio-handoff-adapter.js
js/card-studio-entry.js
js/card-studio-core.js
js/card-studio.js
urdu-card-studio.html
Card Studio/social maker tests
telemetry allowlists
SEO route config/registry
service-worker/PWA contracts
package.json
```

Search the repository before coding. Runtime code and current regression tests are authoritative.

### First task: execute Slice 0 unless the canonical backlog clearly permits more

The current product governance includes a Card Studio completion gate under `WU-PLAT-002H` P0.1F.

Do **not** assume this prompt overrides that gate.

If the backlog does not explicitly permit the new production route, do Slice 0 only:

1. inventory every currently live background ID/category/asset/default;
2. design and implement the shared background registry foundation if it can be done without changing shipped behavior;
3. add registry invariants/tests;
4. add short/medium/long/mixed Urdu fixtures;
5. document the exact Gallery → Card Studio handoff mapping;
6. establish preview performance/asset-loading baseline;
7. confirm the proposed Gallery route should remain noindex/not promoted until the release gate;
8. run all relevant tests;
9. open a PR and stop before launching the new public route if the gate is still closed.

If the canonical backlog explicitly permits the Gallery route, continue with the next approved slice only; do not jump across all slices automatically.

### Critical architecture rule

Do **not** render Card Studio canvases for every gallery card on each keystroke.

Gallery previews must be lightweight DOM previews:

```text
background art
+ optional overlay
+ real DOM Urdu text
+ metadata-defined safe area
```

The Card Studio canvas/export pipeline remains authoritative after selection/handoff.

If your design requires 20–60 canvases updating while the user types, stop and redesign.

### Shared background registry

Today background data lives in/around Card Studio. Extract one neutral reusable registry before building the Gallery.

Preserve every existing live background ID.

The registry should support data equivalent to:

```js
{
  id,
  name,
  nameUr,
  category,
  src,
  thumbnailSrc,
  textColor,
  overlayColor,
  overlayOpacity,
  safeArea,
  textCapacity,
  preferredAlign,
  goodFor
}
```

Do not over-engineer.

Requirements:

- existing Card Studio consumes the same registry;
- no duplicate background arrays;
- existing apply/filter/export behavior stays identical;
- source-level tests prove old IDs remain present and IDs are unique;
- categories and lookup are deterministic.

### Preview behavior

When the Gallery slice is approved:

- create one clear Urdu text input;
- show live previews from the shared registry;
- update preview text on every input without rebuilding the gallery;
- use `requestAnimationFrame` or measured small debounce to batch rapid updates;
- lazy-load art assets;
- use `lang="ur" dir="rtl"` for Urdu preview text;
- use Nastaliq-friendly line height;
- apply registry text colour/overlay defaults;
- position text within metadata `safeArea`;
- no hidden ellipsis/truncation that falsely suggests long text fits.

### Mandatory text QA

Create stable fixtures for:

```text
SHORT: 1–2 lines
MEDIUM: 3–4 lines
LONG: 6–8 lines
MIXED: Urdu + Latin + numbers
```

Every Gallery-enabled background must satisfy the four quality rules:

1. clear text-safe center area;
2. strong Urdu contrast;
3. truthful behavior for short and long Urdu;
4. receiver-quality final result, not merely creator-side attractiveness.

If a design is poor for long text, rank/demote/mark it as such. Never silently clip.

### Filters and later ranking

Categories come from registry metadata, not duplicated page constants.

Expected categories may include:

```text
All
Classic
Pakistan
Truck Art
Poetry
Nature
Modern
Wedding
Luxury
```

Later deterministic intent chips may include:

```text
Poetry
Dua
Quote
Greeting
Wedding
Social
```

No server-side semantic analysis is required.

Long text should prefer `textCapacity: long` designs.

### Handoff

Reuse the existing Card Studio handoff/state architecture.

Never put user text in the URL.

Transfer only a bounded payload similar to:

```text
version
source = card-gallery
text
backgroundId
optional presetId / intent
```

Resolve the selected background by ID from the shared registry on Card Studio arrival.

The destination must open with:

- the same text;
- the selected background;
- recommended text colour/overlay;
- editable normal Card Studio state;
- working existing export flow.

If the selected background cannot resolve, preserve the text and fail safely.

### Privacy

Never send user content to Product Pulse/analytics.

Forbidden telemetry/network content:

```text
Urdu text
Roman source text
voice transcript
rendered card text
screenshots/canvas/image bytes
arbitrary user strings
```

Potential bounded properties only after checking current governance:

```text
background_id
category
text_length_bucket
intent_id
device_class
handoff state
```

Use a unique sentinel string and inspect network/analytics requests.

### Input modes

Do not rebuild input engines.

If approved and easy to reuse, the Gallery may use existing:

- direct Urdu input;
- Roman Urdu transliteration;
- unified Voice input.

These controls must stay visually secondary to the cards.

If reuse creates regression/scope risk, keep the first Gallery slice simpler rather than forking an engine.

### Performance

Do not eagerly fetch all full-resolution rich raster backgrounds.

- lightweight SVGs can be lazy previewed directly;
- rich WebP/raster art should use `thumbnailSrc` where useful;
- full asset should load only when needed;
- no background request per keystroke;
- do not add virtualization until measured collection size/performance requires it.

Record measured performance evidence; do not merely say `fast`.

### Mobile QA

Test at minimum:

```text
360x800
375x667
390x844
412x915
768x1024
```

Pass conditions:

- input immediately understandable;
- previews appear quickly after it;
- no page-level horizontal overflow;
- chips work by touch;
- no hover-only action;
- card action comfortably tappable;
- software keyboard causes no forced-scroll loop;
- continuous typing remains smooth;
- preview Urdu is large enough to judge.

### Accessibility

Require:

- semantic label for input;
- actual DOM preview text;
- decorative background art not repeated as screen-reader noise;
- native filter/selection buttons;
- programmatic selected state;
- visible focus;
- correct English/Urdu labels and RTL behavior;
- reduced motion without loss of function.

### SEO / release

One proposed canonical route only:

```text
/urdu-card-gallery
```

Do not create keyword variants/doorways.

During validation keep it noindex/not broadly promoted unless the SEO/release gate explicitly approves otherwise.

Before making it indexable, compare query ownership with `/urdu-card-studio` and update canonical metadata/sitemap/nav/llms/public registry only after that decision.

### Regression boundary

Protect:

```text
/urdu-card-studio
/urdu-name-art-maker
/urdu-whatsapp-status-maker
/urdu-instagram-post-maker
Basic/Rich Writer
shared Voice/transliteration engines
PWA/service-worker contracts
SEO/shared shell
```

Do not weaken existing tests because background ownership moves to a shared registry.

### Testing

Add focused tests for:

```text
registry IDs unique
all old IDs preserved
lookup/categories
safe-area validation
text-length buckets
filtering/ranking determinism
handoff payload validation
live preview update
short/medium/long text
mobile overflow
privacy sentinel
Card Studio handoff/export regression
```

Inspect `package.json` and run the current repository equivalents of:

```bash
npm test
npm run seo:check
npm run governance:check
npm run shell:check
npm run seo:graph:check
npm run test:browser
```

Prefer `npm run test:all` if available/practical.

### PR discipline

Use a feature branch.

Do not merge automatically.

PR description must state:

- exact slice;
- why roadmap permission exists or why work stopped at Slice 0;
- old background count/IDs preserved;
- shared registry design;
- confirmation that preview is DOM-based, not many canvases;
- text fixture results;
- measured performance/mobile results;
- privacy sentinel result;
- handoff result if implemented;
- SEO/indexability state;
- tests run/results;
- remaining release/manual gates;
- rollback path.

### Final quality bar

The feature is not done because a grid renders.

It is done when a mobile user can type real Urdu once, immediately compare genuinely attractive cards, judge which background suits their actual text, choose one without friction, and continue into Card Studio with everything preserved — while the page remains fast, browser-local and visually good enough that the recipient would enjoy receiving the final card.
