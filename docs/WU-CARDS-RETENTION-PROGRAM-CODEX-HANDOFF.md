# Write Urdu Cards Retention Programme — Codex Handoff

Repository: `https://github.com/abaidurrehman/write-urdu/`

Programme:
- `WU-CARD-CONTENT-001A` — Recurring Social Content Library
- `WU-CARD-GALLERY-001A` — Social Background Collection Expansion
- `WU-CARD-RETENTION-001A` — Homepage Contextual Featured Card

## Goal

Create a repeat-use Urdu social-sharing loop:

`homepage → one timely card → Share OR Open in Card Studio`

The homepage remains primarily an Urdu-writing product. It must show **one contextual card only** with exactly two primary actions. No carousel, card grid, category/mood/relationship chips, shuffle, favorites, background picker or mini editor on the homepage.

## Read first

Read repository agent instructions, then the canonical existing card contracts plus these files:

- `specs/WU-CARD-CONTENT-001A-recurring-social-content-library.md`
- `specs/WU-CARD-CONTENT-001A-IMPLEMENTATION-CHECKLIST.md`
- `specs/WU-CARD-CONTENT-001A-ACCEPTANCE-MATRIX.md`
- `skills/wu-card-content-001a/SKILL.md`
- `specs/WU-CARD-GALLERY-001A-social-background-collection-expansion.md`
- `specs/WU-CARD-GALLERY-001A-IMPLEMENTATION-CHECKLIST.md`
- `specs/WU-CARD-GALLERY-001A-ACCEPTANCE-MATRIX.md`
- `skills/wu-card-gallery-001a/SKILL.md`
- `specs/WU-CARD-RETENTION-001-card-retention-sharing-engine.md`
- `specs/WU-CARD-RETENTION-001A-homepage-contextual-featured-card.md`
- `specs/WU-CARD-RETENTION-001-IMPLEMENTATION-CHECKLIST.md`
- `specs/WU-CARD-RETENTION-001-ACCEPTANCE-MATRIX.md`
- `skills/wu-card-retention-001/SKILL.md`

Inspect current runtime/tests before coding. Preserve shipped behavior and IDs.

## Execution order

### Phase 0 — Reconcile

- sync with current `main`;
- inventory current ready-made card IDs and background IDs;
- confirm shared background registry consumers;
- confirm `/urdu-cards` real share-link path through `/api/shares`;
- confirm `WriteUrduWorkspaceHandoff` and Card Studio visual-seed restore path;
- run card-focused baseline tests.

### Phase 1 — Content foundation

Implement `WU-CARD-CONTENT-001A` schema/taxonomy foundation first:

- recurring context metadata;
- bounded categories/tags;
- source/rights metadata;
- `featuredEligible`/homepage eligibility;
- validation that blocks held/unverified content;
- backward compatibility for current cards.

Do not bulk-add the full target library yet.

### Phase 2 — Daily/Jumma background pack

Implement `WU-CARD-GALLERY-001A` Slice 0 + Slice 1 only:

- audit current visual coverage;
- add 6–8 original designs for morning, night, Jumma and dua/reflection;
- use the shared registry;
- preserve all existing IDs;
- validate safe areas, Urdu contrast and text capacity;
- optimize assets/thumbnails;
- test Card Gallery preview and Card Studio export.

Never copy/scrape/trace social, Canva, stock or competitor art. Never bake message text into backgrounds. Prefer fewer excellent designs over filler.

### Phase 3 — First prepared-text batch

Implement `WU-CARD-CONTENT-001A.1` with about 20–40 approved messages prioritizing:

1. morning / Subah Bakhair;
2. night / Shab Bakhair;
3. Jumma;
4. dua / gratitude / reflection.

Prefer original Write Urdu copy for generic social messages. Quran/Hadith/poet/person attribution requires verified sourcing/rights. Do not scrape social-media quote corpora.

Pair messages intentionally with approved backgrounds. Do not create every possible text/background combination.

### Phase 4 — Homepage contextual card

Implement `WU-CARD-RETENTION-001A` only after the context/eligibility contract exists.

Placement:
- after the main writing/editor experience and actions;
- before lower-priority instructional/tool-directory content;
- never before the primary writer on mobile.

Render:
- one context label;
- one card;
- **Share**;
- **Open in Card Studio**.

Selection:
- browser-local time/date;
- morning/daytime/evening/night;
- Friday/Jumma overrides normal daily context;
- stable deterministic selection from approved `featuredEligible` cards;
- never inspect private editor text.

Share:
- extract/reuse the existing working `/urdu-cards` card publication path instead of copying it;
- keep real `/s/<id>` share links and safe fallback behavior.

Card Studio:
- use `WriteUrduWorkspaceHandoff` visual-project seed;
- allow bounded source `home-featured-card` in the Card Studio source allowlist;
- transfer text/background without putting Urdu in the URL.

### Phase 5 — End-to-end acceptance

Prove:

- homepage card → Share;
- homepage card → Card Studio → text/background restored → edit/export;
- morning, night and Friday contexts;
- 360–430px mobile and desktop;
- share success/fallback;
- module failure never blocks the Urdu writer;
- no private text in URL/telemetry.

### Phase 6 — Later evidence-gated expansion

Only after the first integrated release is healthy:

- content: motivation, family/friendship, life/self-respect, original emotional/poetry-like lines, love;
- backgrounds: minimal poetry, ink/literary, affection, reflective distance, self-respect, friendship/family;
- later cultural/seasonal: original Ajrak-inspired, Pakistani folk/truck-art-inspired, Ramadan, Eid, Pakistan heritage.

Do not implement every later slice in one giant change without acceptance between batches.

## Shared architecture rules

There must remain:
- one background registry;
- one curated content/card owner;
- one Card Studio export engine;
- one reusable share-publication path;
- one workspace-handoff system.

Do not create new thin SEO routes for every message, time period, mood or background family.

## Suggested commits

1. `refactor(cards): normalize recurring content metadata`
2. `feat(card-backgrounds): add daily and Jumma visual pack`
3. `feat(urdu-cards): add recurring social message pack`
4. `refactor(cards): reuse ready-made card share publisher`
5. `feat(home): add contextual featured Urdu card`
6. `test(cards): cover contextual share and studio handoff`

## Final report

Report slices completed, files changed, new message/context counts, new background IDs, share/handoff changes, homepage placement/context logic, tests/CI, mobile/export/share QA, deferred later batches and any unrelated pre-existing failures.