# WU-CARD-CONTENT-001A — Recurring Social Content Library

**Parent:** `WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md`
**Related retention owner:** `WU-CARD-RETENTION-001`
**Status:** Slices 001A.0–001A.3 implemented 2026-09-14 (157 cards: 88 original + 69 hope/family/friendship/self-respect/poetry/love additions); 001A.4 (normalization) and 001A.5 (evidence review) remain evidence-gated
**Area:** Prepared Urdu text / editorial card corpus / recurring social sharing
**Primary surfaces:** `/urdu-cards`, homepage featured-card candidate pool, Card Studio handoff
**Core goal:** build a large enough, trustworthy prepared-text library that users can repeatedly find something worth sharing without lowering editorial quality.

---

## 1. Why this child exists

The ready-made cards route already proves the basic product shape: curated Urdu text + a compatible visual background + Share/Edit actions.

The next constraint is **content depth and recurrence**, not another editor.

Social/discovery research consistently points to repeatable sharing needs around:

- morning wishes;
- night wishes;
- Jumma/Friday messages;
- dua and gentle faith/reflection;
- short poetry and emotional lines;
- hope/motivation/patience/gratitude;
- family and friendship;
- love/affection;
- life/self-respect/quiet reflection.

The product opportunity is to make Write Urdu feel like:

> “Whenever I need something meaningful in Urdu to share, I can find it here.”

This child expands the editorial asset base while keeping the homepage restrained and keeping Card Studio as the editor.

---

## 2. Ownership

`WU-CARD-CONTENT-001A` owns:

- prepared-message taxonomy;
- editorial corpus growth;
- source/rights metadata completeness;
- recurring-context metadata;
- message-to-design pairing quality;
- optional Roman Urdu / English meaning metadata where useful;
- content QA tooling/fixtures;
- staged expansion of `/urdu-cards` inventory.

It does **not** own:

- homepage placement/selection UI (`WU-CARD-RETENTION-001A`);
- background design system (`WU-CARD-GALLERY-001` / Card Studio registry);
- public-share infrastructure (`WU-SHARE-001`);
- Card Studio editing/export;
- thin SEO route multiplication.

---

## 3. Content strategy

### 3.1 Prioritize repeat use over one-off occasions

The existing corpus includes useful occasion content such as Eid, wedding and congratulations. Keep it.

Expansion priority should favor needs that can occur daily or weekly:

1. morning;
2. dua/reflection;
3. Jumma;
4. night;
5. hope/motivation/gratitude;
6. family/friendship;
7. short original poetry/emotional lines;
8. love/affection;
9. self-respect/life reflection;
10. one-off celebrations/seasonal expansion.

### 3.2 Original Write Urdu copy is a strategic asset

For general social messages, prefer high-quality original Urdu written for Write Urdu rather than copying viral posts.

Benefits:

- rights clarity;
- consistent tone;
- unique indexable content;
- easier attribution;
- fewer fake-quote problems;
- ability to tune length for card design.

### 3.3 Do not optimize for fake abundance

A target number is a planning aid, not a release requirement.

Do not publish filler merely to reach a count.

---

## 4. Initial expansion target

Recommended first substantial expansion: **120–160 approved prepared messages**, released in reviewable batches.

Suggested distribution after existing cards are reconciled:

| Family | Initial target range |
| --- | ---: |
| Morning / Subah Bakhair | 16–20 |
| Night / Shab Bakhair | 12–16 |
| Jumma / Friday | 16–20 |
| Dua / Faith / Reflection | 20–24 |
| Hope / Motivation / Gratitude | 16–20 |
| Family / Parents / Friendship | 16–20 |
| Original short poetry / emotional lines | 20–24 |
| Love / Affection | 12–16 |
| Life / Self-respect / quiet reflection | 12–16 |

These ranges overlap conceptually; the final corpus should use one canonical category and multiple bounded tags rather than duplicating the same line in several arrays.

### Batch discipline

Ship in editorial batches of roughly 20–40 messages.

Each batch must pass source/rights/Urdu/visual tests before being public.

---

## 5. Taxonomy

Use a stable, bounded taxonomy rather than arbitrary strings.

### Primary families

Suggested IDs:

```text
dua
jumma
morning
night
hope
life
family
friendship
love
poetry
greeting
celebration
condolence
seasonal
```

The exact migration from current categories must preserve existing public behavior and tests.

### Tags

Bounded tags can include:

```text
sabr
shukr
kindness
parents
mother
father
siblings
friend
romantic
quiet
healing
courage
success
morning-prayer
night-prayer
friday-prayer
short
medium
```

Do not allow uncontrolled user-generated taxonomy into the runtime registry.

### Contexts

For retention selection, cards/messages may declare:

```text
morning
daytime
evening
night
friday
```

Context metadata is editorial, not inferred from private user behavior.

---

## 6. Message vs design model

The current ready-made card registry directly couples `textUr` and `backgroundId`. That is acceptable for a small corpus, but large-scale prepared text introduces duplication pressure.

### Scale goal

We want to support future behaviors such as:

- same words, another design;
- another message in the same category;
- homepage card selection from approved messages/presets;
- multiple curated visual treatments for a strong line;
- optional Roman Urdu/English meaning attached once to the message.

### Preferred normalized direction

If/when the existing architecture contract permits it, evolve toward:

```js
messages = [{
  id,
  textUr,
  category,
  tags,
  mood,
  contexts,
  featuredEligible,
  romanUrdu,
  englishMeaning,
  source,
  rights
}]

presets = [{
  id,
  messageId,
  backgroundId,
  layout,
  featuredEligible,
  schedulePriority
}]
```

`/urdu-cards` can still expose a flattened card record to existing consumers through a compatibility function.

### Migration rule

Do **not** perform a large schema migration just because the normalized model is cleaner.

First:

1. inspect `WU-CARD-CONTENT-001-ARCHITECTURE-CONTRACT.md`;
2. preserve current public card IDs;
3. preserve existing tests/handoffs;
4. add compatibility APIs;
5. migrate incrementally only when corpus scale or “same text/new design” actually needs it.

A simple metadata extension is acceptable for the first content batch.

---

## 7. Content integrity

This child inherits and strengthens the parent integrity contract.

### 7.1 General original messages

Store metadata such as:

```text
source.type = original
source.attribution = Write Urdu
rights.status = original
```

Do not imply an original prayer/line is Quran, Hadith or a famous quote.

### 7.2 Quran/Hadith

Only include when:

- exact source is verified;
- translation provenance/rights are known;
- reference is stored;
- wording displayed on card is verified;
- editorial reviewer approves it.

If any part is uncertain, keep it out of public corpus.

### 7.3 General dua

Original/general prayers are encouraged but should be represented as general prayer text, not prophetic source material.

### 7.4 Poetry/literature

Allowed states:

```text
original
public-domain-verified
licensed
permission-granted
```

`hold-rights-unclear` must never be public.

### 7.5 Famous-person quotes

Do not publish attributed cards unless attribution is verified from a credible source.

If a line is simply a common saying, either present it without false attribution or exclude it.

---

## 8. Writing quality rules

Prepared Urdu should sound natural, contemporary and shareable, not machine-generated or overly formal by default.

### Preferred characteristics

- concise enough for mobile card reading;
- emotionally clear within 1–2 seconds;
- grammatically sound Urdu;
- natural punctuation;
- no awkward translated-English syntax;
- no excessive emojis in canonical text;
- no hashtags in canonical text;
- no product promotion inside the message;
- no manipulative chain-message language;
- no “share this to receive blessings” coercion.

### Length bands

Maintain a balanced corpus:

```text
short: roughly 3–10 Urdu words
medium: roughly 11–25 Urdu words
long: roughly 26–45 Urdu words
```

Homepage-featured candidates should usually be short/medium.

---

## 9. Roman Urdu / English meaning

Research indicates some users understand spoken Urdu but read Urdu script less confidently.

Optional metadata may therefore include:

```js
romanUrdu: '...'
englishMeaning: '...'
```

Rules:

- Urdu script remains canonical card text;
- Roman Urdu is a faithful transliteration, not a separate rewritten quote;
- English meaning is concise and semantically faithful;
- do not force either onto every visible card;
- do not clutter the homepage featured card with these variants;
- use them later on detail/browse surfaces only if product evidence supports it.

---

## 10. Visual pairing workflow

A prepared text is not public merely because its wording is approved.

Workflow:

```text
message drafted
→ language/editorial review
→ source/rights review
→ candidate background shortlist
→ safe-area/contrast check
→ mobile preview
→ share-image render
→ receiver-quality review
→ approve preset
```

### Pairing rules

- morning: light/nature/soft visual families generally preferred;
- night: moon/night/quiet dark families;
- Jumma/dua: restrained, respectful, high-legibility religious/general visual treatment;
- poetry/life: minimal/paper/nature/atmospheric backgrounds;
- family/friendship: warm, approachable visuals;
- love: tasteful, not garish;
- condolence: restrained and respectful.

These are editorial heuristics, not automatic hard rules.

---

## 11. Homepage featured eligibility

Only a subset of the full content library should be eligible for homepage rotation.

A candidate must be:

- broadly appropriate;
- source/rights safe;
- short/medium enough for fast comprehension;
- paired with a proven mobile-readable background;
- context-tagged;
- free of highly personal or divisive tone;
- manually approved for `featuredEligible`.

The full `/urdu-cards` library may contain more specific emotional content that never appears on homepage.

---

## 12. `/urdu-cards` browse improvements enabled by this corpus

Later content-surface work may use the expanded library for:

- stronger category filters;
- “another message” within category;
- same message on another curated design;
- optional copy-text action;
- optional Roman Urdu/meaning disclosure;
- editorially featured collections.

Do not add all of these in the first content PR.

---

## 13. SEO boundaries

The corpus itself can improve page quality without route multiplication.

Initial strategy:

- strengthen `/urdu-cards` with genuine visible content depth;
- preserve one strong canonical gallery;
- keep card text crawlable where appropriate;
- use descriptive category labels;
- add collection routes only when they have enough unique inventory and search evidence.

Do not auto-create a route for every message/tag/mood.

Potential later evidence-backed collection candidates include:

```text
/urdu-cards/jumma-mubarak
/urdu-cards/subah-bakhair
/urdu-cards/dua
/urdu-cards/urdu-poetry
```

but these are not approved merely by appearing in this spec.

---

## 14. Data validation

Add a validation layer/test that rejects at least:

- duplicate IDs;
- unknown category/context IDs;
- missing Urdu text;
- missing/unknown background for public preset;
- `featuredEligible` without valid context;
- public sourced content with unverified source state;
- rights status `hold-rights-unclear` on public card;
- unexpectedly huge text;
- invalid Roman/English metadata types;
- duplicate public preset IDs.

Where practical, also warn on exact duplicate text to prevent accidental corpus inflation.

---

## 15. Telemetry/privacy

Prepared card content is public editorial content, so a controlled message/card/preset ID can be measured.

Allowed bounded fields may include:

```text
card/preset ID
category
context
background ID
share/edit selection
```

Do not log user edits or copied private text.

Do not turn content interaction telemetry into a user-interest profile.

---

## 16. Slices

### 001A.0 — Reconcile schema + editorial workflow

Deliver:

- current 32-card inventory audit;
- category normalization plan;
- featured/context metadata contract;
- source/rights completeness audit;
- validation tests;
- decision whether normalization is needed now or deferred.

### 001A.1 — Recurring essentials batch

Target roughly 30–40 approved additions emphasizing:

- morning;
- night;
- Jumma;
- dua/reflection.

This batch directly improves homepage rotation quality.

### 001A.2 — Emotional everyday batch

Target roughly 30–40 additions emphasizing:

- hope/motivation/gratitude;
- family/friendship;
- life/self-respect.

### 001A.3 — Poetry/love/original expression batch

Target roughly 30–40 additions emphasizing:

- original short poetry-like lines;
- reflective emotional lines;
- tasteful love/affection.

Modern copyrighted poetry remains excluded without rights.

### 001A.4 — Optional message/preset normalization

Only if corpus growth makes direct text/background coupling materially awkward.

Deliver compatibility-preserving message/preset separation and tests.

### 001A.5 — Evidence review

Review:

- category engagement;
- share/edit rates;
- homepage context performance;
- repeat visits;
- editorial maintenance burden;
- search impressions/clicks for card intents.

Use evidence to decide whether to build category routes, Roman Urdu presentation, favorites or other deeper retention features.

---

## 17. Test and review requirements

For every content batch:

- registry/data validation green;
- background references green;
- no duplicate IDs;
- source/rights review recorded;
- Urdu proofreading complete;
- short/medium/long visual sampling complete;
- mobile preview sampling complete;
- share-render sampling complete;
- existing `/urdu-cards` tests green;
- homepage featured-card selector tests green if metadata changed;
- Card Studio handoff regression green.

Content-only additions still require visual QA because text length changes the product output.

---

## 18. Non-goals

- scraping captions/quotes from social platforms;
- AI-generating hundreds of unreviewed lines;
- publishing copied Pinterest/Instagram/Reddit content;
- fake attribution;
- modern copyrighted poetry without rights;
- turning homepage into a library;
- per-message SEO pages;
- social profiles/comments/likes;
- account requirement;
- uncontrolled taxonomy growth;
- shipping 150 mediocre cards in one PR.

---

## 19. Definition of done

The ready-made card ecosystem has enough carefully reviewed, original/source-safe, visually paired Urdu content to support daily and weekly return behavior—especially morning, night, Jumma, dua and everyday emotional sharing—without becoming a low-quality quote dump. The corpus remains maintainable, testable and compatible with the existing Card Studio/share architecture.
