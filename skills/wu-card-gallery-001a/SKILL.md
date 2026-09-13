# WU-CARD-GALLERY-001A — Social Background Collection Expansion

Use this skill for implementation of `WU-CARD-GALLERY-001A`.

## Mission

Expand Write Urdu's shared card-background collection with original, receiver-quality designs intentionally serving recurring social-sharing jobs. Preserve the existing shared registry, Card Gallery preview architecture, Card Studio export path and ready-made-card ecosystem.

This is **not** a generic design-generation task and **not** permission to redesign Card Studio or the homepage.

## Required read order

1. Repository agent instructions (`AGENTS.md` or equivalent) if present.
2. `specs/WU-CARD-GALLERY-001-live-urdu-card-gallery.md`
3. `specs/WU-CARD-GALLERY-001A-social-background-collection-expansion.md`
4. `specs/WU-CARD-GALLERY-001A-IMPLEMENTATION-CHECKLIST.md`
5. `specs/WU-CARD-GALLERY-001A-ACCEPTANCE-MATRIX.md`
6. `specs/WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md`
7. `specs/WU-CARD-CONTENT-001A-recurring-social-content-library.md`
8. `specs/WU-CARD-RETENTION-001A-homepage-contextual-featured-card.md`
9. `docs/WU-CARD-GALLERY-001A-CODEX-HANDOFF.md`

Then search the current repository. Do not trust stale implementation-map paths when runtime/tests say otherwise.

## Non-negotiable architecture rules

- One shared background registry.
- Preserve all existing background IDs.
- New IDs are unique, semantic and stable.
- Card Studio stays authoritative for editing/export.
- Card Gallery stays lightweight; never instantiate a full export canvas for every tile/keystroke.
- Ready-made cards reference background IDs; they do not duplicate art definitions.
- Homepage featured card consumes an approved ready-made card; it does not own a separate design collection.
- User-entered Urdu stays browser-local and never enters asset-selection telemetry.

## Asset integrity rules

Never:

- scrape or copy Pinterest/Instagram/Reddit/Canva/stock card art;
- trace a third-party layout/pattern;
- hotlink production imagery;
- commit watermarked assets;
- bake message wording into the background;
- use pseudo-Arabic/Urdu glyph decoration that can be mistaken for actual text;
- ship placeholders merely to hit a target count.

Prefer original SVG/vector art for maintainable geometric, paper, botanical, folk and Islamic framing. Use optimized local raster/WebP only when a richer atmospheric design can be produced at real production quality.

If the available toolchain cannot produce a painterly/raster concept well enough, skip that concept and ship fewer strong designs.

## Slice discipline

### Slice 0 — inventory only

Before visual work:

- inventory IDs/assets/bytes/formats;
- map current `goodFor` coverage;
- establish short/medium/long Urdu fixtures;
- confirm current shared registry and consumers;
- select exact Batch A designs.

Do not alter existing art in this slice unless fixing a proven registry/test defect required for the child.

### Slice 1 — daily/Jumma

Create and fully validate 6–8 distinct original backgrounds serving morning, night, Jumma and dua/reflection.

Do not proceed until:

- registry tests pass;
- asset-size review passes;
- mobile gallery is healthy;
- Card Studio load/export passes;
- receiver screenshots look intentional.

### Slice 2 — poetry/emotional/family

Add 5–7 distinct original backgrounds only after Slice 1 passes.

### Slice 3 — cultural/seasonal

Add up to 4–5 original backgrounds only after prior batches pass. Cultural designs must be respectful original interpretations.

### Slice 4 — pairing metadata

Reconcile bounded `goodFor` tags and optional approved message/background alternates. Do not create Cartesian-product combinations.

### Slice 5 — evidence review

Use real product evidence before proposing another design expansion.

## Visual QA rubric

Every background must pass:

1. **Text-safe area** — actual calm region, not guessed percentages.
2. **Urdu contrast** — readable defaults before manual editing.
3. **Short/medium fit** — both must look intentional.
4. **Long fit** — only when the metadata claims it.
5. **Receiver hierarchy** — the Urdu message is the hero.
6. **Mobile view** — readable on phone-sized output.
7. **Export parity** — Card Gallery preview does not materially mislead relative to Card Studio export.
8. **Distinctness** — more than a recolour.

## Registry metadata

New records must follow the canonical registry and normally include:

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

Use bounded `goodFor` values from the spec. Do not invent uncontrolled per-design taxonomies.

## Performance rules

- Lazy-load offscreen rich assets.
- Use lightweight thumbnails where useful.
- Do not eager-load every full-resolution background.
- Do not create an unbounded service-worker precache.
- Optimize WebP/raster assets deliberately.
- Keep Gallery input responsive on mid-range mobile.
- Avoid runtime third-party image services.

## Testing

Add source-level tests for:

- unique/stable IDs;
- asset references;
- safe-area ranges;
- bounded text capacity and tags;
- preservation of legacy IDs;
- Card Studio lookup;
- Card Gallery compatibility;
- ready-made-card background resolution;
- no remote production art URLs.

Add/extend browser checks for:

- representative mobile Gallery;
- background selection;
- Card Studio handoff/load;
- export;
- representative prepared-card rendering.

Run focused tests first, then repo-level gates appropriate to the touched code/assets.

## Do not expand scope

Do not add:

- a homepage design carousel;
- homepage category chips;
- runtime AI image generation;
- a user background marketplace;
- stock-search integration;
- new SEO background routes;
- account requirements;
- semantic server-side matching;
- a second share/export engine.

## Definition of done

The child is done when Write Urdu has a genuinely stronger original visual collection for recurring social content, every approved background works through the same registry across Card Gallery, ready-made cards and Card Studio, mobile/export quality is proven, and no existing ID, privacy boundary, performance contract or homepage simplicity has regressed.