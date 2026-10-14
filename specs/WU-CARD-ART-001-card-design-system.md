# WU-CARD-ART-001 — Card Design System (Creative Design Renaissance)

**Status:** Implemented on `claude/creative-design-renaissance` (2026-10-13/14); acceptance pending founder visual review.
**Owns:** the artwork, design families and art metadata used by Card Gallery, Ready-made Urdu Cards, the Template Library, Card Studio backgrounds and the Royal Mughal wedding suite.
**Builds on:** `WU-CARD-GALLERY-001A` (shared background registry), `WU-SHAADI-001` (wedding design library), `WU-UXR-002` (safe-area and credit rules).

## 1. Architecture

One artwork source, three consumers:

```text
js/card-art-kit.js            shared drawing primitives (UMD: build scripts + browser)
js/card-art-royal-mughal.js   size-adaptive Royal Mughal composition (UMD)
scripts/card-art/designs/*.js one module per design family (palettes + layouts)
scripts/card-art/design-specs.js  build manifest: registry id -> module, palette, layout
scripts/card-art/build.js     renders each design to WebP 1080x1350 + 320x400 thumbnail
scripts/card-art/preview.js   art-direction preview with real Urdu in the safe area
js/card-background-registry.js    the one registry every product reads
```

- **Card Gallery, Ready-made Cards, homepage featured card, Card Studio** read `js/card-background-registry.js`.
- **Template Library** templates carry a `backgroundId`; the card preview and Card Studio both resolve it through the registry (no art metadata is duplicated in the template catalogue).
- **Wedding maker** draws Royal Mughal live from `js/card-art-royal-mughal.js` at portrait, Status and print sizes, so thumbnail, preview and download come from the same drawing code.

Thumbnail, full preview and export always start from the same pixels: the build rasterises each SVG once; Card Studio loads the full WebP into its editable image layer and exports from it.

## 2. Registry metadata

Generated designs use `flagship()` (new family) or `refined()` (earlier ID, redrawn) in the registry:

| Field | Meaning |
|---|---|
| `id` | stable, never renamed (ready-made cards, saved projects and share pages depend on it) |
| `family` | artistic identity; colourways and layout variants share a family |
| `flagship` / `refined` | flagship = one per family; refined = legacy ID redrawn under the same ID |
| `category`, `goodFor` | bounded taxonomies from WU-CARD-GALLERY-001A |
| `textColor`, optional `attributionColor` | message colour; credit colour when the default (text colour at 85%) is under 4.5:1 |
| `safeArea` | measured artwork-free text field (fractions of the 4:5 card) |
| `textCapacity` | `medium` or `long`, from preview testing with the long fixture |

`tests/card-art-collection-contract.test.js` keeps registry and build manifest in step and forbids text, embedded images or remote references in artwork.

## 3. Artwork conventions

- Original work only, composed from the kit. No traced, scraped or stock artwork; no script, letters or pseudo-calligraphy in art.
- Deterministic (seeded) so rebuilds reproduce the same image.
- Compose at 1080x1350. Keep the text field calm: no busy pattern, no high-contrast detail behind words.
- Different families must differ in **composition**, not colour. Colourways belong to the same family.
- Budgets: full WebP < 350 KB, thumbnail < 50 KB, not precached by the service worker.

## 4. Typography rules

- Nastaliq (Noto Nastaliq Urdu) is the default voice for every family; Naskh was tested for the editorial family and rejected (it reads as Arabic, not Urdu, at display sizes).
- Previews size text against the safe area (container query units), then `fitPreviewText` in `js/card-gallery-core.js` steps the size down until it fits. If it still cannot fit, the tile shows "Better for shorter text" rather than clipping.
- Card Studio's own auto-fit sizes exported text inside the same safe area.
- Gallery, Ready-made Cards and homepage seeds open Card Studio in the 4:5 Portrait preset so the square default never crops the artwork.

## 5. Adding a design

1. Write or extend a module in `scripts/card-art/designs/` (add a palette or `layout` for a colourway/variant).
2. Add the spec to `design-specs.js` and preview: `node scripts/card-art/preview.js <out-dir> <id>`.
3. Measure the safe area against short, medium and long Urdu; add the registry record with `flagship()`/`refined()`.
4. Build: `node scripts/card-art/build.js <id>`; add the ID to the telemetry allowlist in `functions/api/events.js`.
5. Run `node tests/card-art-collection-contract.test.js`, the background collection contract and `card-attribution-quality.spec.js`.

## 6. Collection inventory (55 backgrounds)

**Flagship families (11):** Royal Mughal (wedding suite: emerald / ruby / saffron / champagne), Garden of Roses (blush; mist cascade), Mehndi Marigolds, Moonlit Poetry, Geometry & Light (teal; ivory; emerald), Phulkari Bagh, Manuscript Paper & Ink, Rain & Memory (slate; plum), Dawn Meadow (peach; mint garden), Celebration Balloons, Editorial Terracotta.

**Refined under existing IDs (20):** ajrak-modern-frame (Ajrak), ink-moon-poetry / quiet-blue-distance / quiet-moon-sky (Ink Wash), minimal-cream-poetry / warm-paper-reflection (Stationery), window-light-tea / family-warm-interior (Home Window), friendship-bright-modern / self-respect-black-sand (Modern Shapes), eid-morning-gold / ramadan-lantern-night / pakistan-green-heritage / jumma-midnight-silhouette (Crescent), jumma-ivory-geometry / emerald-prayer-light (Geometry & Light), rose-mist-affection, soft-sunrise-garden, rainy-window-reflection, truck-art-modern-bloom (Truck Art).

**Kept as-is (24):** the 12 painterly WebP designs (strong) and the 12 earlier "swag arch" SVGs. The swag-arch set (emerald-mughal, ivory-arabesque, blush-rose-lanterns, burgundy-arch, emerald-jasmine-lanterns, emerald-eid-lanterns, teal-gold-botanical, rose-garden-frame, vintage-floral, heritage-mughal-garden, moonlit-lanterns, midnight-crescent-city) shares one frame recipe; they are the next refinement candidates. Skyline designs received measured safe areas.

## 7. Product changes

- **Ready-made cards:** 28 cards re-paired with designs that match their wording (IDs and text unchanged); wording is fitted to each design's safe area.
- **Template Library:** 34 poetry/social/religious/event templates open with a matching design at 1080x1350 and preview the real artwork with sample Urdu; education and business templates keep flat landscape layouts.
- **Wedding maker:** Royal Mughal leads recommendations for Nikah, Baraat, Walima and Mehndi with a ceremony palette each. Event defaults are unchanged.

## 8. Not done / next

- Redraw the 12 swag-arch legacy SVGs.
- Larger "inspect" view and side-by-side comparison in Card Gallery; family-level gallery filters once each family has three or more members.
- Ready-made card action buttons truncate at 390 px ("WhatsAp…") — pre-existing layout issue.
- Consider Royal Mughal as the default Nikah/Baraat design (founder decision).
