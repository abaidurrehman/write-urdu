# WU-CARD-GALLERY-001A — Codex Handoff

Repository:

`https://github.com/abaidurrehman/write-urdu/`

Feature:

`WU-CARD-GALLERY-001A — Social Background Collection Expansion`

## Start here

Read in this order before changing code or assets:

1. `AGENTS.md` / repository-local agent instructions if present.
2. `specs/WU-CARD-GALLERY-001-live-urdu-card-gallery.md`
3. `specs/WU-CARD-GALLERY-001A-social-background-collection-expansion.md`
4. `specs/WU-CARD-GALLERY-001A-IMPLEMENTATION-CHECKLIST.md`
5. `specs/WU-CARD-GALLERY-001A-ACCEPTANCE-MATRIX.md`
6. `specs/WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md`
7. `specs/WU-CARD-CONTENT-001A-recurring-social-content-library.md`
8. `specs/WU-CARD-RETENTION-001A-homepage-contextual-featured-card.md`
9. `skills/wu-card-gallery-001a/SKILL.md`

Then inspect the **current** repository implementation. Runtime code and tests are the source of truth for shipped behavior.

## Objective

Expand the shared Card Studio/Card Gallery/Ready-Made Cards background system with original designs that deliberately serve the highest-frequency recurring social-sharing contexts:

- morning;
- night;
- Jumma;
- dua/reflection;
- poetry;
- love/affection;
- family/friendship;
- self-respect/life;
- Pakistan/cultural;
- Ramadan/Eid.

Do not create random variants merely to increase count.

## Hard invariants

- Preserve every existing background ID.
- Use one canonical shared background registry.
- Do not create a second renderer.
- Card Studio remains the authoritative export editor.
- Card Gallery previews stay lightweight DOM composition, not a canvas per tile.
- Do not copy, trace, scrape or hotlink Pinterest/Instagram/Reddit/Canva/stock designs.
- Do not bake Urdu/Arabic/English message text into background artwork.
- Every new design needs a measured text-safe area and honest text-capacity rating.
- Protect mobile typing/performance.
- Do not create new SEO routes for background categories.
- Do not add a background selector/carousel to the homepage.
- If a rich raster concept cannot be produced at real production quality with available tools, ship fewer strong original designs rather than placeholders.

## Execution order

### Step 0 — Reconcile current state

Before producing assets:

- enumerate current registry IDs/assets;
- identify current category/goodFor coverage;
- record asset sizes/formats/thumbnails;
- verify all three card surfaces reuse the registry;
- identify exact gaps against the spec's recurring contexts;
- prepare short/medium/long Urdu fixtures.

Commit this as a small audit/test foundation if it materially improves traceability.

### Step 1 — Daily/Jumma pack

Build the highest-priority 6–8 original designs first:

- sunrise/morning;
- warm morning/domestic;
- calm night/moon;
- reflective/rainy night;
- light Jumma geometry;
- dark Jumma mosque silhouette;
- emerald dua/reflection;
- warm paper reflection.

Use original SVG/vector compositions when practical. Use optimized local WebP only when richer raster art is genuinely needed and available at production quality.

For each background:

- create optimized source;
- create thumbnail where useful;
- add stable ID;
- add registry metadata;
- validate safe area;
- validate short/medium/claimed-long Urdu;
- validate Card Gallery preview;
- validate Card Studio export;
- validate at least one prepared-message pairing.

Do not start Batch B until Batch A passes acceptance.

### Step 2 — Poetry/emotional/family pack

Add 5–7 distinct designs for:

- minimal editorial poetry;
- ink/literary poetry;
- affection/love;
- reflective distance/longing;
- self-respect/life;
- friendship;
- family warmth.

Avoid colour-swap abundance.

### Step 3 — Cultural/seasonal pack

Add up to 4–5 original designs for:

- modern Ajrak-inspired frame;
- modern Pakistani folk/truck-art-inspired bloom;
- Ramadan;
- Eid;
- Pakistan heritage.

Cultural references must be original interpretations, not copied patterns/artwork.

### Step 4 — Pairing and evidence

Once assets are approved:

- reconcile bounded `goodFor` tags with `WU-CARD-CONTENT-001A`;
- add only intentional default/alternate pairings;
- run regression/performance checks;
- document evidence and remaining design gaps.

## Expected implementation areas

Find current equivalents rather than assuming these exact paths are still canonical:

- shared background registry;
- background asset/thumbnail directories;
- Card Gallery preview runtime;
- Card Studio background loader;
- ready-made card content registry;
- contract/browser tests.

Do not duplicate background definitions in `urdu-cards.js` or homepage code.

## Testing expectations

At minimum, add/extend tests for:

- unique IDs;
- asset existence;
- thumbnail existence when declared;
- safe-area validity;
- bounded capacity/tags;
- legacy ID preservation;
- Card Studio lookup/load;
- Card Gallery preview compatibility;
- ready-made-card background references;
- no remote production art URLs.

Run focused tests while iterating, then repository contract/browser gates appropriate to the changes. If full suite has unrelated pre-existing failures, report them with evidence; do not mask them.

## Manual QA

Verify:

- 360–430px mobile gallery;
- desktop gallery;
- representative short/medium/long Urdu;
- Card Studio export for each new design;
- receiver-sized output;
- representative prepared text from the recurring-content library;
- no visual collision, clipping or illegible contrast.

## Completion report

When done, report:

1. exact backgrounds added;
2. registry IDs and `goodFor` coverage;
3. asset formats/sizes;
4. tests run and results;
5. manual/mobile/export QA completed;
6. any concepts deliberately not shipped because quality was insufficient;
7. remaining gaps for later evidence-gated work.

Do not claim success based on asset count alone. The definition of success is a stronger receiver-quality Urdu card collection with no regression to the shared architecture or homepage simplicity.