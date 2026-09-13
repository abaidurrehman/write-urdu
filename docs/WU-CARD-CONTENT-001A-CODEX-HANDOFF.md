# WU-CARD-CONTENT-001A — Codex Handoff

Repository:

`https://github.com/abaidurrehman/write-urdu/`

Feature:

`WU-CARD-CONTENT-001A — Recurring Social Content Library`

Parent:

`WU-CARD-CONTENT-001 — Ready-made Urdu Cards Gallery`

Related retention consumer:

`WU-CARD-RETENTION-001 / 001A`

---

## Read first

```text
AGENTS.md                                      # if present
specs/BACKLOG.md
specs/README.md
specs/WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md
specs/WU-CARD-CONTENT-001-ARCHITECTURE-CONTRACT.md
specs/WU-CARD-CONTENT-001-ACCEPTANCE-MATRIX.md
specs/WU-CARD-CONTENT-001A-recurring-social-content-library.md
specs/WU-CARD-RETENTION-001-card-retention-sharing-engine.md
specs/WU-CARD-RETENTION-001A-homepage-contextual-featured-card.md
```

Canonical execution skill:

`skills/wu-card-content-001a/SKILL.md`

---

## Mission

Expand the ready-made Urdu card corpus into a strong recurring social-content library without turning the product into a scraped quote dump or shipping hundreds of weak lines.

Prioritize repeatable sharing needs:

```text
morning
night
Jumma
Dua/reflection
hope/motivation/gratitude
family/friendship
short original poetry/emotional lines
love/affection
life/self-respect
```

---

## Critical constraints

- Use `WU-CARD-CONTENT-001` as the canonical owner.
- Do not create a competing card/content registry.
- Prefer original Write Urdu copy for generic social messages.
- Do not copy Pinterest/Instagram/Reddit captions into the production corpus.
- Do not publish unverified Quran/Hadith/famous-person attribution.
- Do not publish modern copyrighted poetry without rights.
- Preserve existing public card IDs and handoffs.
- Every new message must be visually paired and mobile-reviewed before public release.
- Do not attempt to ship the full 120–160 target in one PR.
- Homepage eligibility is a narrow reviewed subset, not every new card.

---

## First implementation target

Start with `001A.0` then `001A.1` only:

### 001A.0 — Reconcile

1. inventory current ready-made cards;
2. map current category IDs;
3. identify source/rights metadata gaps;
4. decide the minimum metadata needed for `featuredEligible` + context;
5. add registry validation;
6. avoid a schema migration unless current scale genuinely requires one.

### 001A.1 — Recurring essentials

Add roughly 30–40 highly reviewed items across:

- morning;
- night;
- Jumma;
- dua/reflection.

Use a balanced set of short/medium lengths and existing proven backgrounds.

---

## Data architecture

Current code may still expose flat records shaped approximately as:

```js
{ id, category, backgroundId, textUr }
```

Do not break consumers.

Add metadata compatibly, or introduce an adapter if the parent architecture already supports richer definitions.

Only consider separate `messages` + `presets` registries when content scale or “same words, another design” makes that materially useful.

If normalization is introduced later, preserve a flattened compatibility API for existing `/urdu-cards`, homepage selection and handoff tests.

---

## Editorial workflow

Every candidate must follow:

```text
draft
→ Urdu language review
→ source/rights review
→ category/tags/context metadata
→ background shortlist
→ mobile preview
→ share-image render
→ receiver-quality review
→ approval
→ public registry
```

Do not bypass review because text is “only content”.

---

## Content-writing rules

Prefer:

- natural Urdu;
- emotionally clear wording;
- short/medium mobile-friendly length;
- warm, useful, human tone;
- original Write Urdu lines where possible.

Avoid:

- translated-English stiffness;
- chain-message manipulation;
- “share to receive blessings” claims;
- excessive emoji/hashtags;
- fake poet/scholar attribution;
- engineering/product language;
- repeated variants that exist only to inflate count.

---

## Validation expectations

Add/extend data tests for:

```text
duplicate IDs
unknown categories
unknown contexts
missing Urdu text
unknown background ID
invalid featured eligibility
public item with blocked rights state
public sourced item with unverified source
unexpectedly huge text
exact duplicate public text warning/check
```

The exact validation mechanism should fit current repository conventions.

---

## Homepage relationship

`WU-CARD-RETENTION-001A` consumes this corpus but does not own it.

For any homepage-eligible item:

- mark it deliberately;
- assign valid context(s);
- keep it broadly appropriate;
- confirm short/medium readability;
- confirm exact background pairing works on mobile;
- keep highly personal romance, grief, attitude and divisive themes out of default featured rotation.

Do not add homepage UI while doing a content-only batch unless that implementation slice explicitly requires it.

---

## Suggested PR sequence

### PR 1 — schema/validation + first 20–40 recurring cards

- reconcile metadata;
- add validation;
- add essential morning/night/Jumma/dua content;
- prove `/urdu-cards` + homepage selector + Card Studio regressions green.

### PR 2 — emotional everyday batch

- hope;
- gratitude;
- family;
- friendship;
- life/self-respect.

### PR 3 — original expression batch

- short original poetry-like lines;
- reflective emotional text;
- tasteful love/affection.

Do not normalize message/preset architecture unless real duplication pressure is visible by then.

---

## Completion report

Return:

1. added/changed content counts by family;
2. source/rights status summary;
3. any schema changes;
4. validation/test results;
5. background/mobile visual QA sample summary;
6. homepage-eligible subset count;
7. items deliberately held back and why;
8. next recommended batch.

Do not report “120 cards added” as success by itself. Quality, trust and repeat usefulness are the goal.