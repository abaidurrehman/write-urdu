# WU-CARD-CONTENT-001A — Implementation Checklist

**Parent:** `WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md`  
**Child:** `WU-CARD-CONTENT-001A-recurring-social-content-library.md`  
**Related consumer:** `WU-CARD-RETENTION-001A-homepage-contextual-featured-card.md`

Execute in order. The goal is a trustworthy recurring content library, not a large raw count.

---

## Gate 0 — Reconcile current implementation

- [ ] Read `AGENTS.md` if present.
- [ ] Read `specs/BACKLOG.md` and `specs/README.md`.
- [ ] Read `WU-CARD-CONTENT-001` parent, architecture and acceptance matrix.
- [ ] Read `WU-CARD-CONTENT-001A` child in full.
- [ ] Read `WU-CARD-RETENTION-001/001A` to understand homepage-consumer constraints.
- [ ] Inspect current `js/urdu-cards-data.js` (or current canonical owner).
- [ ] Inventory all current public card IDs, categories and background IDs.
- [ ] Inspect current card-data tests and visual/browser tests.
- [ ] Inspect current source/rights metadata implementation; do not assume the planned parent schema has already shipped.
- [ ] Inspect shared background registry and Card Studio handoff consumers.

---

## Gate 1 — Inventory and gap audit

Create a dated implementation note or PR summary containing:

- [ ] current total card count;
- [ ] counts by current category;
- [ ] recurring-context coverage: morning/daytime/evening/night/friday;
- [ ] source/rights metadata coverage;
- [ ] cards with unclear attribution/rights;
- [ ] duplicate or near-duplicate wording;
- [ ] background repetition hotspots;
- [ ] short/medium/long distribution;
- [ ] homepage-featured candidate count by context.

Do not expand content until unsafe/unclear existing records are understood.

---

## Gate 2 — Minimal schema extension

- [ ] Reuse the canonical card/content registry.
- [ ] Preserve existing public card IDs.
- [ ] Add only metadata required by the current slice.
- [ ] Use bounded categories/tags/contexts.
- [ ] Reconcile naming with the parent architecture contract.
- [ ] Add `featuredEligible` (or canonical equivalent) only where editorially approved.
- [ ] Do not normalize into messages/presets unless real duplication pressure justifies it.
- [ ] If normalization is required, provide a compatibility API for existing consumers.

---

## Gate 3 — Registry validation

Add/extend automated validation for:

- [ ] duplicate IDs;
- [ ] unknown category IDs;
- [ ] unknown context IDs;
- [ ] empty/non-string Urdu text;
- [ ] invalid/unknown background IDs;
- [ ] invalid featured eligibility/context combination;
- [ ] public item with `hold-rights-unclear` or equivalent blocked status;
- [ ] sourced public item without verified source metadata;
- [ ] unexpectedly long text beyond the card product limit;
- [ ] malformed optional Roman Urdu / English meaning metadata;
- [ ] exact duplicate public text warning or rejection according to current conventions.

Validation must run in the normal test/check workflow.

---

## Gate 4 — Editorial rules before drafting

- [ ] Define/confirm canonical category IDs.
- [ ] Define/confirm approved context IDs.
- [ ] Define/confirm source types.
- [ ] Define/confirm rights statuses.
- [ ] Record the rule that original general prayer is not Quran/Hadith.
- [ ] Record the rule that social-media popularity is not attribution evidence.
- [ ] Record the rule that modern poetry/song/ghazal text requires rights.
- [ ] Prefer original Write Urdu copy for general messages.
- [ ] Ban manipulative chain-message wording.
- [ ] Ban filler variants written only to increase count.

---

## Gate 5 — Slice 001A.1: recurring essentials

Target roughly 30–40 **approved**, not merely drafted, additions.

### Morning

- [ ] multiple short cards;
- [ ] multiple medium cards;
- [ ] at least several broad homepage-safe candidates;
- [ ] mix of wish / gratitude / gentle dua without fake sourcing.

### Night

- [ ] calm, concise night wishes;
- [ ] multiple homepage-safe candidates;
- [ ] avoid fear/manipulation language.

### Jumma

- [ ] multiple Friday greetings/general prayers;
- [ ] sourced material only when verified;
- [ ] general original Jumma prayer clearly treated as original/general;
- [ ] multiple homepage-safe candidates.

### Dua/reflection

- [ ] general original prayers and reflections;
- [ ] verified source metadata for any sourced religious text;
- [ ] no unsupported grading/attribution.

---

## Gate 6 — Visual pairing

For every public addition:

- [ ] background exists in shared registry;
- [ ] safe area accommodates real Urdu text;
- [ ] contrast passes visual review;
- [ ] text length fits without clipping;
- [ ] Nastaliq/Naskh rendering is appropriate;
- [ ] no important artwork is obscured;
- [ ] mobile card remains legible;
- [ ] rendered share image remains legible;
- [ ] visual family fits the emotional/religious tone.

Do not approve text independently of its actual card preset.

---

## Gate 7 — Homepage eligibility

For every `featuredEligible` item:

- [ ] broad/general relevance;
- [ ] short or medium length;
- [ ] explicit valid context(s);
- [ ] manually reviewed background pairing;
- [ ] mobile readability confirmed;
- [ ] source/rights fully clear;
- [ ] no intense grief/heartbreak/confrontational attitude/political content;
- [ ] no highly intimate default romance;
- [ ] compatible with deterministic selector tests.

The full `/urdu-cards` corpus can be broader than the homepage subset.

---

## Gate 8 — Urdu language QA

- [ ] natural Pakistani/standard Urdu wording;
- [ ] no awkward literal English syntax;
- [ ] spelling reviewed;
- [ ] punctuation reviewed;
- [ ] respectful religious phrasing;
- [ ] no accidental Arabic/Urdu mix errors where not intended;
- [ ] no engineering/product copy leaked into card text;
- [ ] no excessive emoji/hashtags in canonical text.

Prefer two-person/editorial review for religious/attributed text when practical.

---

## Gate 9 — Optional Roman Urdu / English meaning

Only add when useful and reviewed.

- [ ] Urdu remains canonical.
- [ ] Roman Urdu is faithful transliteration, not rewritten copy.
- [ ] English meaning is faithful and concise.
- [ ] Neither is forced into homepage card UI.
- [ ] Optional fields pass validation.
- [ ] No additional copyright/translation-right ambiguity is introduced.

This gate may be skipped in initial batches.

---

## Gate 10 — Regression tests

Run focused tests for:

- [ ] curated card data;
- [ ] card registry/background resolution;
- [ ] `/urdu-cards` rendering/filter behavior;
- [ ] `/urdu-cards` Share;
- [ ] Card Studio handoff;
- [ ] homepage featured selector if context metadata changes;
- [ ] locale/collection checks where generated/public content changes.

Then run the repository's standard contract/check suite.

---

## Gate 11 — Manual QA sample

For each batch, manually inspect a representative sample covering:

- [ ] each new family;
- [ ] short, medium and longest additions;
- [ ] light and dark backgrounds;
- [ ] at least 320/360/390/430px mobile widths;
- [ ] direct gallery preview;
- [ ] published/share render;
- [ ] Card Studio edit handoff.

If one visual family repeatedly fails, fix the pairing/metadata rather than accepting poor cards to preserve count.

---

## Gate 12 — PR discipline

Each content PR reports:

- [ ] count added by family;
- [ ] original vs sourced counts;
- [ ] source/rights holds/exclusions;
- [ ] homepage-featured eligible count by context;
- [ ] exact validation/tests run;
- [ ] representative visual QA performed;
- [ ] any schema/compatibility changes;
- [ ] next recommended batch.

Do not combine a large schema migration, 100+ new lines, major `/urdu-cards` UI redesign and homepage UI changes into one PR.

---

## Later gates — only after evidence

### 001A.2 — Emotional everyday

- [ ] hope/motivation/gratitude;
- [ ] family/parents/friendship;
- [ ] life/self-respect.

### 001A.3 — Original expression

- [ ] original short poetry-like lines;
- [ ] reflective emotional messages;
- [ ] tasteful love/affection.

### 001A.4 — Optional normalization

- [ ] prove direct text/background coupling is now a real maintenance problem;
- [ ] separate messages/presets only with compatibility layer and tests.

### 001A.5 — Evidence review

- [ ] share/edit rates by controlled content family;
- [ ] homepage context performance;
- [ ] repeat-visit signal;
- [ ] search discovery signal;
- [ ] editorial maintenance burden;
- [ ] decision on collection routes/Roman presentation/favorites/etc.

---

## Definition of done for the first batch

The first batch is done when the recurring morning/night/Jumma/dua library is materially richer, every new public item is source/rights-safe and visually reviewed, homepage selection has multiple high-quality options, existing card/share/handoff behavior remains green, and the change still feels curated rather than mass-generated.