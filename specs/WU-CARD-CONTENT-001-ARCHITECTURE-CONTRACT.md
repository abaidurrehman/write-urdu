# WU-CARD-CONTENT-001 — Architecture Contract

**Parent:** `WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md`  
**Status:** Implementation-ready architecture contract  
**Primary proposed route:** `/urdu-cards`

---

## 1. Architecture objective

Implement a ready-made Urdu cards gallery without creating a parallel card platform.

The new experience must reuse the current Card Studio ecosystem:

- shared background definitions;
- safe-area/contrast metadata;
- existing card rendering/export behavior;
- existing Card Studio handoff conventions;
- current privacy boundary;
- current shell/SEO/runtime governance.

The new capability is primarily:

> curated text + curated background pairing + gallery UX + source/rights integrity

not a new renderer.

---

## 2. Required ownership boundaries

### 2.1 Background registry

`WU-CARD-GALLERY-001` already defines the direction toward one shared background registry.

`WU-CARD-CONTENT-001` must consume that registry.

Do not create another independent array containing duplicate background source paths/colors/categories.

If the shared registry has not yet been extracted when this epic starts, coordinate the extraction with `WU-CARD-GALLERY-001` and make the smallest safe shared module possible.

Recommended responsibility:

```text
js/card-background-registry.js
```

or the current repository-equivalent discovered during implementation.

The exact filename is not mandatory. One authoritative registry is.

### 2.2 Curated card registry

Ready-made content belongs in a separate versioned content registry.

Recommended responsibility:

```text
js/urdu-card-content-registry.js
```

This registry references `backgroundId`; it does not copy background implementation details.

### 2.3 Gallery runtime

Recommended route/runtime separation:

```text
urdu-cards.html
css/urdu-cards.css
js/urdu-cards-core.js
js/urdu-cards.js
```

Reconcile names with current repo conventions before coding.

### 2.4 Renderer

Do not implement a new independent high-resolution card renderer unless current Card Studio renderer code is genuinely impossible to reuse safely.

Preferred hierarchy:

```text
Card definition
   ↓
shared/card-studio-compatible state adapter
   ↓
existing authoritative render/export path
```

A small pure adapter is preferred over duplicating canvas drawing logic.

---

## 3. Conceptual system

```text
                       +---------------------------+
                       | Shared Background Registry|
                       +-------------+-------------+
                                     |
              +----------------------+----------------------+
              |                      |                      |
              v                      v                      v
      Card Studio             Card Gallery          Ready-made Cards
   advanced editor        own text / compare       curated text/design
              |                      |                      |
              +----------------------+----------------------+
                                     |
                                     v
                       shared card state / renderer
                                     |
                    +----------------+----------------+
                    |                                 |
                    v                                 v
              local download                   native file share
                    |
                    v
             optional Card Studio edit handoff
```

---

## 4. Curated card schema

Use a versioned schema.

A recommended shape is:

```js
{
  schemaVersion: 1,
  id: 'faith-sabr-001',
  status: 'approved',
  textUr: '...',
  category: 'faith',
  subcategory: 'reflection',
  backgroundId: 'moonlit-lanterns',
  tags: ['sabr', 'reflection'],
  mood: ['calm', 'hopeful'],
  textLength: 'short',
  featured: false,
  source: {
    type: 'hadith',
    attribution: '...',
    reference: '...',
    originalLanguage: 'ar',
    translationProvenance: '...',
    verified: true,
    verificationNote: '...'
  },
  rights: {
    status: 'public-domain-verified',
    note: '...'
  },
  layout: {
    alignment: 'center',
    safeAreaOverride: null,
    fontScale: 1,
    lineHeight: 1.7,
    sourcePlacement: 'bottom'
  }
}
```

Not every source field is required for every content type, but every public item must have explicit source and rights states.

---

## 5. Stable IDs

Card IDs are product/content identifiers.

Requirements:

- stable after public release;
- ASCII kebab-case;
- not derived from the full Urdu text;
- do not embed mutable source wording in the ID;
- unique across the registry;
- safe to emit as content-free analytics dimensions.

Examples:

```text
faith-sabr-001
pakistan-ajrak-pride-001
poetry-ghalib-001
love-original-003
deep-hope-004
```

If a card is retired, prefer `status: 'retired'` or corpus removal with a migration note rather than silently reusing its ID for unrelated content.

---

## 6. Content status state machine

Every curated item should have a content state.

Recommended values:

```text
candidate
review
approved
hold
retired
```

Only `approved` items may render in the public gallery.

Meaning:

- `candidate` — draft content or pairing;
- `review` — source/rights/visual QA in progress;
- `approved` — may ship;
- `hold` — blocked by source, rights, visual or editorial uncertainty;
- `retired` — previously approved but intentionally removed from browse surfaces.

Do not use runtime code comments as the approval mechanism.

---

## 7. Source types

Recommended bounded values:

```text
original
quran
hadith
dua-sourced
dua-original
poetry
quote
proverb
greeting
editorial
```

Avoid generic free-text source-type strings.

---

## 8. Rights states

Recommended values:

```text
original
public-domain-verified
licensed
permission-granted
rights-not-applicable
hold-rights-unclear
```

Public-card inclusion rule:

```text
original                 → allowed
public-domain-verified   → allowed
licensed                 → allowed when license note exists
permission-granted       → allowed when permission note exists
rights-not-applicable    → allowed only for genuinely non-copyrightable/general content
hold-rights-unclear      → blocked
```

Do not convert uncertainty into `public-domain-verified` based on author age or fame without actual review.

---

## 9. Religious source integrity

### 9.1 Hadith

A Hadith card must have enough source metadata for editorial review.

Recommended fields:

```js
source: {
  type: 'hadith',
  attribution: '...',
  reference: 'collection/book/number or canonical reference',
  originalLanguage: 'ar',
  translationProvenance: 'editorial/verified source',
  verified: true,
  verificationNote: 'review date/source note'
}
```

The product must not infer authenticity from popularity.

### 9.2 Quran

If Quranic text is used:

- Arabic must be verified if rendered;
- verse reference must be stored;
- Urdu translation provenance/rights must be known;
- no generated paraphrase may be presented as Quranic translation.

### 9.3 General religious reminders

Original reminders are allowed but must not use labels that imply Quran/Hadith source.

---

## 10. Attribution rendering model

Source attribution is part of content integrity, not decorative text.

Each card should support an attribution mode:

```text
none
inline-small
footer
source-panel-only
```

The gallery preview may keep attribution visually small, but it must be available before share/download for sourced content.

The high-resolution renderer should support a concise source footer where appropriate without harming the design.

Do not embed lengthy bibliographic text in the art if it makes the card unreadable.

---

## 11. Edited-source state

A curated card can become user-edited.

Define an explicit state object rather than guessing from UI.

Recommended:

```js
{
  curatedCardId,
  originalTextUr,
  currentTextUr,
  isEdited,
  sourceAppliesToOriginalOnly
}
```

`isEdited` should be based on normalized content comparison, not only whether an input event fired.

If a user edits then restores the exact original wording, the state may return to pristine.

### Export rule

For sourced content:

- pristine exact text → source attribution may render normally;
- materially edited text → do not present the source as though it authenticates the edited wording.

Recommended UI copy:

> You changed the original wording. The source applies to the original text.

The implementation may:

- hide source footer from the edited export; or
- mark the output as edited/personalized while keeping source details only in the UI.

Choose the clearest, least misleading behavior and test it.

---

## 12. Background pairing model

A card definition references one primary background.

Optionally it may define approved alternates later, but v1 should favor intentional pairing.

Do not implement a Cartesian product of:

```text
all texts × all backgrounds
```

That is the responsibility of the separate `/urdu-card-gallery` user-text comparison experience.

Ready-made cards are curated compositions.

---

## 13. Safe-area model

Use background safe-area metadata from the shared background registry where available.

A curated card may provide a bounded override if the specific text requires it.

Recommended normalized coordinates:

```js
safeArea: {
  x: 0.14,
  y: 0.18,
  width: 0.72,
  height: 0.64
}
```

Coordinate space is 0–1 relative to the rendered card.

Rules:

- overrides cannot extend outside the card;
- use safe-area clamping;
- source/footer areas must not collide with main text;
- long-text cards should prefer backgrounds with larger calm regions instead of forcing tiny type.

---

## 14. Text length classes

Use bounded content-length metadata only for layout/ranking, not linguistic meaning.

Recommended values:

```text
micro
short
medium
long
```

Example intent:

- `micro` — 1–3 words;
- `short` — one/two short lines;
- `medium` — roughly 3–5 lines at default treatment;
- `long` — roughly 6–8 lines.

Do not use raw private user text length in analytics.

For curated public content, card ID already identifies the known content, so telemetry does not need text length at all unless useful as a bounded public-card dimension.

---

## 15. Gallery rendering architecture

The browse experience must not instantiate a full canvas per card.

Use lightweight DOM composition:

```text
<article>
  background image/thumbnail
  optional overlay
  DOM Urdu text
  optional source line
  actions
</article>
```

This gives:

- immediate text readability;
- cheap updates for any local personalization preview;
- accessible text in the DOM;
- lower CPU/memory pressure than dozens of canvases.

High-resolution canvas/rendering begins only when needed for:

- download;
- native share file generation;
- Card Studio handoff if the current pipeline needs materialization.

---

## 16. Preview asset loading

A rich gallery needs explicit asset discipline.

Preferred order:

1. render first viewport with lightweight preview assets;
2. `loading="lazy"` for offscreen images;
3. use responsive thumbnails if the asset pipeline supports them;
4. full-resolution background only when selected for high-quality render.

Do not automatically download every full-resolution rich background on initial page load.

If current backgrounds are lightweight SVGs, browser caching may make a separate thumbnail unnecessary; measure before adding a second asset set.

---

## 17. High-resolution card state adapter

Create a pure adapter that turns a curated card into Card Studio-compatible state.

Conceptual API:

```js
buildCardStudioState(curatedCard, background, overrides)
```

Inputs:

- curated card definition;
- shared background definition;
- optional user text override;
- optional output preset.

Output should contain only fields needed by the existing Card Studio state/render system.

Do not make Card Studio import the ready-made gallery UI.

Dependency direction should be:

```text
shared registry/core ← gallery
shared registry/core ← card studio
```

not:

```text
card studio UI ←→ gallery UI
```

---

## 18. Local download architecture

Preferred sequence:

```text
selected curated card
→ build normalized card state
→ existing renderer
→ Blob/File
→ local download
```

Requirements:

- crisp Urdu text;
- correct image crop;
- correct overlay;
- source footer behavior follows edited-state rules;
- no server round-trip required.

---

## 19. Native share architecture

Preferred sequence:

```text
selected curated card
→ render local image File
→ feature-detect navigator.share / navigator.canShare
→ share file through OS
→ fallback to download
```

Do not:

- auto-open a target app;
- upload the image merely to make native sharing possible;
- claim WhatsApp-specific success when the OS chooses the destination.

UI copy can say `Share` or `Share to apps`.

Marketing copy may explain that users can choose WhatsApp from the share sheet where supported.

---

## 20. Card Studio handoff

The handoff must preserve:

- curated card ID as provenance metadata where useful;
- current text;
- background ID;
- text color/layout defaults;
- edited-source state;
- output preset where applicable.

Do not place text in query parameters or fragment identifiers.

Reuse current local handoff/state-transfer patterns, including `card-studio-entry.js` / handoff adapter architecture where compatible.

The destination should be ready to edit without forcing the user to reselect the background.

---

## 21. Public share pages

Public share pages are **not required for v1**.

The primary promise is local image sharing.

If later integrated with `WU-SHARE-001`:

- publishing must be explicit;
- user-edited text becomes public only with clear user action;
- curated source metadata must remain truthful;
- do not silently turn `Share` into `Publish publicly`.

Keep:

```text
native private-ish file share
```

conceptually separate from:

```text
public URL publication
```

---

## 22. Filtering architecture

Use a bounded category registry, for example:

```js
[
  { id: 'all', ... },
  { id: 'faith', ... },
  { id: 'pakistan', ... },
  { id: 'poetry', ... },
  { id: 'love', ... },
  { id: 'deep', ... },
  { id: 'greetings', ... },
  { id: 'family', ... }
]
```

Filters operate locally over approved public definitions.

No backend search is required for the initial corpus.

If later corpus size justifies local text/tag search, add it without indexing user-entered edits.

---

## 23. Featured and seasonal collections

Featured status is editorial metadata, not an algorithmic social ranking.

Initial fields can support:

```js
featured: true|false
seasonal: ['ramadan-2027']
```

Do not build a remote personalization/recommendation service for v1.

Aggregate usage may later inform editorial ordering using public card IDs only.

---

## 24. Accessibility architecture

Gallery cards must remain usable without relying on the image alone.

Requirements:

- Urdu text remains real DOM text in browse mode;
- correct `lang="ur" dir="rtl"`;
- buttons are semantic buttons/links;
- focus styles visible;
- selected/filter state exposed with `aria-pressed` or appropriate semantics;
- source details accessible to screen readers;
- card background image is decorative when the meaningful content is represented in DOM;
- actions do not rely on hover.

Do not use background image alt text as a substitute for the actual Urdu content.

---

## 25. Privacy architecture

The public curated corpus may be bundled/static.

User personalization remains local unless the user explicitly publishes through another product flow.

Never log:

- user-edited Urdu text;
- clipboard content;
- rendered output bytes;
- Card Studio state payload;
- user notes.

Allowed public-content identifiers:

- category ID;
- curated card ID;
- background ID;
- action type;
- route/device class according to existing telemetry contracts.

Follow existing content-free telemetry infrastructure; do not invent a second analytics pipeline.

---

## 26. SEO architecture

Initial route:

```text
/urdu-cards
```

The page may server/static-render enough approved content metadata and representative cards to be useful without JavaScript, but do not dump the entire future corpus as hidden keyword content.

When public release is approved:

- register in `seo.config.js` according to current conventions;
- add canonical metadata;
- update sitemap/public-page registry/human sitemap/llms if current governance requires;
- add one clear internal-link owner from relevant Card surfaces;
- do not create tag pages automatically.

---

## 27. Repository/source layout guidance

Reconcile with current code before implementing, but a clean first shape could be:

```text
urdu-cards.html
css/urdu-cards.css
js/card-background-registry.js              # shared if not already extracted
js/urdu-card-content-registry.js            # curated public content
js/urdu-card-content-core.js                # pure validation/filter/state adapter
js/urdu-cards.js                            # DOM/runtime
```

Tests might include:

```text
tests/urdu-card-content-registry-contract.test.js
tests/urdu-card-content-source-integrity.test.js
tests/urdu-card-content-edit-attribution.test.js
tests/urdu-cards-route-contract.test.js
```

Do not treat filenames as mandatory if repository conventions have evolved.

---

## 28. Validation API

Prefer a pure validator for the content corpus.

Conceptual:

```js
validateCuratedCard(card, backgroundRegistry)
```

It should catch at least:

- missing/duplicate ID;
- unsupported status/category/source/rights state;
- unapproved content accidentally entering public export;
- missing background;
- invalid safe area;
- sourced content without verified source where required;
- `hold-rights-unclear` exposed as approved;
- attribution-required content with no attribution strategy.

Run this in tests/build tooling, not only runtime.

---

## 29. Corpus storage format

For the initial small/medium corpus, static JS or JSON is acceptable.

Prefer a format that is:

- diffable;
- reviewable;
- testable;
- easy to search;
- stable in source control.

Do not introduce D1/CMS/backend storage merely because content exists.

If editorial scale later makes source-controlled content painful, file a separate CMS/content-pipeline decision based on actual operational evidence.

---

## 30. Translation/source provenance

Do not store only a final Urdu string for sourced translated content.

At minimum preserve enough metadata to answer:

- what is this text?
- where did the attribution come from?
- who/what supplied the Urdu translation?
- may we publish it?
- when/how was it verified?

This can live in registry metadata or a linked evidence file.

The public UI need not expose every internal review note.

---

## 31. Content review evidence

For religious and literary cards, maintain durable evidence notes in `docs/` if the source metadata becomes too verbose for the registry.

Suggested pattern:

```text
docs/WU-CARD-CONTENT-001-CORPUS-EVIDENCE-YYYY-MM-DD.md
```

The evidence file should record:

- card ID;
- source URL/book/reference or editorial origin;
- rights basis;
- verification date;
- reviewer note;
- unresolved caveats.

Do not paste large copyrighted passages into evidence files.

---

## 32. Error/fallback behavior

If a background cannot load:

- show a graceful placeholder/card-unavailable state;
- preserve card text/source details;
- do not render a misleading broken share image.

If Web Share is unsupported:

- keep Download available.

If high-resolution render fails:

- show a clear retry/fallback message;
- do not navigate away and lose the user's edit.

If Card Studio handoff fails:

- keep the current gallery card state in memory/local handoff storage long enough for retry according to current patterns.

---

## 33. Performance budgets and measurement

Do not hard-code speculative numeric budgets without measuring the current site, but acceptance must include:

- no canvas-per-card gallery loop;
- lazy offscreen assets;
- bounded initial card count if necessary;
- no unbounded service-worker pre-cache;
- mobile first viewport remains responsive while scrolling/filtering;
- high-res rendering is user-triggered.

If the launch corpus creates too much DOM or image memory pressure, use incremental rendering/windowed batches while preserving accessibility and discoverability.

---

## 34. Security

The initial gallery should not require HTML injection of arbitrary content.

Render curated/user text via `textContent` or equivalent safe text APIs.

Do not use `innerHTML` with card text.

Do not execute embedded markup from content registry fields.

Treat all handoff text as data.

---

## 35. Roadmap boundary

This architecture contract does not authorize a public route by itself.

While `WU-PLAT-002H` Card completion gating remains active:

- schema/registry/content validation/foundation work is safe to prepare in isolation;
- public `/urdu-cards` release requires a recorded backlog permission/exception;
- no homepage/core-editor redesign is part of this architecture.

---

## 36. Definition of architectural success

The implementation is architecturally successful when:

- there is one authoritative background registry;
- there is one reviewable curated-card registry;
- ready-made browsing is lightweight DOM composition;
- high-quality export uses the established rendering path;
- edit handoff is lossless and private;
- source/rights metadata is enforceable by tests;
- attribution cannot become misleading after edits;
- adding the 50th or 100th curated card does not require duplicating rendering logic.