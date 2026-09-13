# WU-CARD-GALLERY-001A — Implementation Checklist

**Parent:** `WU-CARD-GALLERY-001A-social-background-collection-expansion.md`

Use this checklist in order. Do not jump directly to creating twenty assets.

## Gate 0 — Read before coding

- [ ] Read `specs/WU-CARD-GALLERY-001-live-urdu-card-gallery.md`.
- [ ] Read `specs/WU-CARD-GALLERY-001A-social-background-collection-expansion.md`.
- [ ] Read `specs/WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md`.
- [ ] Read `specs/WU-CARD-CONTENT-001A-recurring-social-content-library.md`.
- [ ] Read `specs/WU-CARD-RETENTION-001A-homepage-contextual-featured-card.md`.
- [ ] Read `skills/wu-card-gallery-001a/SKILL.md`.
- [ ] Inspect current registry/runtime/tests before trusting spec-era filenames.
- [ ] Confirm branch starts from current `main` and is not behind recent card work.

## Slice 0 — Inventory and design-gap map

- [ ] Enumerate every current background ID and asset path.
- [ ] Record asset format, dimensions, approximate bytes and thumbnail availability.
- [ ] Record current `category`, `safeArea`, `textCapacity`, `preferredAlign`, `goodFor` metadata.
- [ ] Identify missing coverage for `morning`, `night`, `jumma`, `dua`, `reflection`, `family`, `friendship`, `love`, `poetry`, `self-respect`, `pakistan`, `ramadan`, `eid`.
- [ ] Build three canonical Urdu fixtures: short, medium, long.
- [ ] Confirm existing Card Studio, Card Gallery and `/urdu-cards` all consume the same registry.
- [ ] Confirm no existing ID will be renamed.
- [ ] Write a small machine-readable or documented batch manifest before asset production.

**Slice 0 exit:** implementation team knows exactly which designs are gaps, how they will be registered, and what quality/size baseline must not regress.

## Slice 1 — Daily/Jumma visual pack

Target 6–8 original backgrounds. Prioritize:

- [ ] Soft Sunrise Garden.
- [ ] Window Light & Tea or equivalent warm morning composition.
- [ ] Moon & Quiet Sky.
- [ ] Rainy Window Reflection or another original night/reflection composition.
- [ ] Jumma Ivory Geometry.
- [ ] Jumma Midnight Mosque Silhouette.
- [ ] Emerald Prayer Light.
- [ ] Warm Paper Reflection.

For each approved asset:

- [ ] Use an original design; no traced/copied social or stock composition.
- [ ] Do not bake Urdu/Arabic/English words into art.
- [ ] Add optimized source asset.
- [ ] Add lightweight thumbnail where needed.
- [ ] Add stable registry ID/name/nameUr/category.
- [ ] Add tested safe area.
- [ ] Add honest text capacity.
- [ ] Add default text/overlay colours.
- [ ] Add preferred alignment.
- [ ] Add bounded `goodFor` tags.
- [ ] Test direct registry lookup.
- [ ] Test Card Gallery preview.
- [ ] Test Card Studio load/export.
- [ ] Test at least one prepared card pairing.

**Slice 1 exit:** daily/Jumma recurring contexts have genuinely stronger visual coverage without performance or compatibility regressions.

## Slice 2 — Poetry/emotional/family pack

After Slice 1 passes:

- [ ] Minimal Cream Poetry.
- [ ] Ink & Moon Poetry.
- [ ] Rose Mist Affection.
- [ ] Quiet Blue Distance.
- [ ] Self-Respect Black & Sand.
- [ ] Friendship Bright Modern.
- [ ] Family Warm Interior Abstract.

Repeat all asset, registry, text-fit, export and mobile QA from Slice 1.

**Slice 2 exit:** poetry/love/family/emotional content no longer relies on generic greeting/wedding backgrounds.

## Slice 3 — Cultural/seasonal pack

After Slice 2:

- [ ] Ajrak Modern Frame — original interpretation only.
- [ ] Truck Art Modern Bloom — original interpretation only.
- [ ] Ramadan Lantern Night.
- [ ] Eid Morning Gold.
- [ ] Pakistan Green Heritage.

For culturally inspired designs:

- [ ] Avoid directly copying a known textile/pattern/artwork.
- [ ] Keep cultural motifs respectful and recognisable without becoming a busy wallpaper.
- [ ] Keep a deliberate central or defined text-safe region.

## Asset engineering

- [ ] Prefer SVG for original vector/geometry designs when quality/export compatibility is good.
- [ ] Use optimized WebP for richer raster art.
- [ ] Do not commit large uncompressed production PNGs without reason.
- [ ] Do not hotlink remote assets.
- [ ] Do not use watermarked assets.
- [ ] Do not add third-party runtime image services.
- [ ] Verify thumbnails are materially lighter than full sources when provided.
- [ ] Verify gallery first viewport does not eagerly fetch every full-resolution asset.
- [ ] Verify service-worker/precache changes do not create an unbounded payload.

## Urdu text-fit QA

For every new background:

- [ ] Render short Urdu fixture.
- [ ] Render medium Urdu fixture.
- [ ] Render long Urdu fixture if the asset claims long capacity.
- [ ] Verify Nastaliq shaping.
- [ ] Verify line-height.
- [ ] Verify no art/text collision.
- [ ] Verify no clipping.
- [ ] Verify mixed Urdu/Latin/numbers remains usable.
- [ ] Verify thumbnail/DOM preview is directionally faithful to final export.

## Receiver-quality QA

- [ ] Export representative 1080x1350 output.
- [ ] Inspect at phone-sized display.
- [ ] Inspect after representative image compression if practical.
- [ ] Verify text is the primary focal element.
- [ ] Verify ornament remains secondary.
- [ ] Verify branding/watermark behavior is consistent with current product policy.

## Pairing metadata

Only after assets pass quality:

- [ ] Reconcile `goodFor` tags with `WU-CARD-CONTENT-001A` contexts.
- [ ] Add default/alternate pairings only where editorially useful.
- [ ] Do not automatically combine every message with every background.
- [ ] Ensure homepage featured-card eligibility remains controlled by content/card definitions, not background alone.

## Tests

Add focused tests for:

- [ ] unique background IDs;
- [ ] valid asset paths;
- [ ] valid thumbnail paths where declared;
- [ ] safe-area shape/ranges;
- [ ] bounded `textCapacity`;
- [ ] bounded `goodFor` tags;
- [ ] existing legacy IDs still present;
- [ ] registry Card Studio compatibility;
- [ ] gallery DOM preview compatibility;
- [ ] no external production asset URLs;
- [ ] no accidental text baked into metadata/asset labels used as user content;
- [ ] content/card registry references resolve to real backgrounds.

Run the repository's relevant contract tests and browser tests, then `npm test` and broader gates where practical for the changed surface.

## Manual acceptance

- [ ] 360px mobile Card Gallery.
- [ ] 390/430px mobile Card Gallery.
- [ ] desktop Card Gallery.
- [ ] Card Studio load + edit + export for each new batch.
- [ ] `/urdu-cards` representative ready-made cards with new backgrounds.
- [ ] homepage contextual card with at least morning, night and Jumma eligible designs once that child is implemented.

## Evidence review

After rollout:

- [ ] Compare selection/share/edit behavior of new vs existing backgrounds.
- [ ] Review asset-performance impact.
- [ ] Review which recurring contexts still lack strong designs.
- [ ] Do not start another background batch automatically; require evidence/editorial need.

## Hard stop conditions

Stop and fix before continuing if:

- a change renames/removes an existing background ID;
- a design requires user text to be sent to a server;
- gallery typing becomes visibly slower;
- assets substantially bloat first-load transfer;
- design art was copied/traced from a third party;
- Urdu text becomes secondary to decoration;
- new art only differs by colour from an existing design;
- a painterly/raster concept cannot be produced at production quality — ship fewer strong designs instead of placeholders.