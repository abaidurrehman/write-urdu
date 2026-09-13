# WU-CARD-CONTENT-001A — Recurring Social Content Library

Use this skill when expanding the prepared Urdu card corpus under `WU-CARD-CONTENT-001A`.

## Mission

Build a trustworthy recurring Urdu social-content library that supports daily/weekly sharing and feeds the homepage featured-card selector without creating a low-quality quote dump.

## Mandatory read order

```text
AGENTS.md                                      # if present
specs/BACKLOG.md
specs/README.md
specs/WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md
specs/WU-CARD-CONTENT-001-ARCHITECTURE-CONTRACT.md
specs/WU-CARD-CONTENT-001-ACCEPTANCE-MATRIX.md
specs/WU-CARD-CONTENT-001A-recurring-social-content-library.md
docs/WU-CARD-CONTENT-001A-CODEX-HANDOFF.md
specs/WU-CARD-RETENTION-001-card-retention-sharing-engine.md
specs/WU-CARD-RETENTION-001A-homepage-contextual-featured-card.md
```

Then search current repository implementation and tests before editing.

## Priority content families

Work in this order unless current evidence changes priority:

```text
morning
night
Jumma
Dua/reflection
hope/motivation/gratitude
family/friendship
life/self-respect
original short poetry/emotional lines
love/affection
seasonal/occasion expansion
```

## Editorial rules

- Prefer original Write Urdu wording for general social messages.
- Never copy social-media captions into production merely because they are popular.
- Never invent attribution.
- Quran/Hadith must be verified and carry proper source metadata.
- General original prayer must not be labeled Quran/Hadith.
- Modern copyrighted poetry/song/ghazal text requires rights/permission.
- `hold-rights-unclear` items stay non-public.
- Natural Urdu beats literal English-style translation.
- Avoid manipulative chain-message language.
- Avoid excessive emoji/hashtags in canonical text.
- Do not inflate the library with trivial wording variants.

## Architecture rules

### One canonical owner

Use the existing ready-made-card content architecture.

Do not create a second independent message registry for homepage or another tool.

### Preserve consumers

Existing `/urdu-cards`, homepage featured-card selection and Card Studio handoffs must keep working.

Preserve existing public card IDs unless migration is explicitly planned/tested.

### Normalize only when justified

A future `messages` + `presets` split is allowed when scale makes it valuable, but do not force that refactor in the first batch.

If normalized later, preserve a compatibility API returning the existing flattened card shape.

## Batch discipline

Do not add 120–160 items in one PR.

Recommended batches:

```text
001A.0: schema/source/rights/validation reconciliation
001A.1: 30–40 morning/night/Jumma/dua items
001A.2: 30–40 hope/family/friendship/life items
001A.3: 30–40 original poetry/emotional/love items
```

Every batch must be reviewable and visually sampled.

## Homepage featured eligibility

Only mark a narrow subset `featuredEligible` (or the canonical equivalent).

Homepage candidates should be:

- broad;
- warm;
- source-safe;
- short/medium;
- mobile-readable;
- explicitly tagged for one or more approved contexts.

Do not default-feature heartbreak, intense grief, confrontational attitude, divisive content or highly intimate romance.

## Validation requirements

Reject/warn on:

```text
duplicate IDs
unknown categories
unknown contexts
missing Urdu text
missing/unknown background
public blocked-rights content
public sourced-but-unverified content
featured item without valid context
unexpectedly huge text
duplicate public text
```

Follow current repo test conventions.

## Visual QA

Content is not complete until paired output is checked.

For each batch sample:

- multiple backgrounds;
- short/medium/long text;
- 320–430px mobile preview;
- exported/share image;
- Urdu shaping/line height;
- safe area/contrast;
- receiver-facing quality.

## Privacy/telemetry

Public card/message IDs and controlled categories are measurable.

Never log user edits or private text.

Do not create a behavioral interest profile from browsing categories.

## Required regressions

Run current repository tests relevant to:

```text
urdu-cards data/gallery
background registry
homepage featured selector
Card Studio handoff
share rendering/publishing
locale/SEO collection checks when public content changes
```

Then run the repository's normal contract/check suites required by current `package.json` and parent skills.

## Completion report

Report:

- added count by family;
- original vs sourced content counts;
- source/rights exceptions/holds;
- featured-eligible count;
- schema/validation changes;
- test results;
- visual QA sample results;
- next recommended batch.

Do not measure success by raw content count alone.