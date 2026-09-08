# WU-JOURNEY-001B — Roman Urdu Resilience & Code-Switching Benchmark

**Status:** Planned benchmark / production changes gated  
**Priority:** P1 research; benchmark work may start earlier if isolated  
**Parent:** `WU-JOURNEY-001`  
**Depends on:** mature English-letter → Urdu behaviour on `/` and Rich Editor  
**Related:** `WU-JOURNEY-001G` Dual-Script Confidence Companion  
**Risk class:** High regression risk if production input behaviour changes

---

## 1. Objective

Create a reproducible quality benchmark for the way Pakistanis actually write Urdu with English letters, including spelling variation, shorthand, names, numbers, punctuation and English code-switching.

The purpose is **not** to replace the current transliteration provider or rewrite a mature input path. The first deliverable is evidence.

The benchmark should tell us whether the real problem is:

- candidate quality;
- suggestion discovery/recovery;
- long-paste handling;
- mixed-language token damage;
- mobile interaction friction;
- or an actual provider-level limitation.

---

## 2. Problem

Roman Urdu is inherently variable. The same intended Urdu may be typed through multiple English-letter spellings, for example different vowel choices, omitted vowels, shorthand or informal phonetic forms.

Pakistani digital writing also commonly includes:

- English product/work terms;
- names;
- phone numbers and dates;
- prices/units;
- punctuation and emoji;
- links and @handles;
- abbreviations;
- mixed Urdu + English inside one sentence.

WriteUrdu currently protects a mature English-letter → Urdu flow, but there is no explicit regression suite representing this messy real-world usage.

Without a benchmark, any attempt to “improve Roman Urdu” is unsafe.

---

## 3. Important current-product boundary

The current Basic/Rich transliteration path relies on the existing Google transliteration integration and established suggestion/keyboard behaviour.

This means proposals such as:

- “ship a static fuzzy matcher”;
- “change Space conversion”;
- “make first Backspace undo conversion”;
- “preserve every Latin token automatically”;

are **candidate hypotheses**, not implementation instructions.

They may conflict with existing suggestion/backspace semantics, provider behaviour, direct-input mode or long-standing user muscle memory.

Benchmark first.

---

## 4. Non-goals

Do not:

- replace the transliteration provider as the first step;
- collect real production user text for the benchmark;
- log accepted/rejected words or suggestion pairs containing private text;
- send private drafts to an LLM for scoring;
- claim there is one standard Roman Urdu spelling;
- force English words into Urdu script when the user may intentionally want them preserved;
- auto-translate English meaning into Urdu;
- change Ctrl+G/direct-input semantics;
- introduce AI dependency into basic typing without a separate approved contract;
- load a large fuzzy-matching dictionary/Web Worker on the critical path before evidence shows it is needed.

---

## 5. Benchmark corpus

Build a versioned fixture corpus from manually authored/public-safe examples. No production user content.

### 5.1 Canonical phonetic

Ordinary common words/phrases already expected to work.

Purpose:

- detect regressions in the mature core job.

### 5.2 Spelling variants

Examples of variation classes:

- `kese / kaise / kaisy`-style vowel/ending variation;
- doubled vs single consonants;
- omitted vowels;
- informal phonetic spellings.

Do not assume every variant has one uniquely correct Urdu candidate.

### 5.3 Shorthand / texting

- compressed conversational forms;
- common particles;
- casual Roman punctuation.

### 5.4 Religious/common phrases

Include ambiguous commonly typed phrases where multiple orthographic forms may be seen.

Scoring should permit an accepted set and/or verify that a reasonable alternate is available in suggestions rather than silently enforcing one spelling ideology.

### 5.5 Code-switching

Examples should include:

- Urdu sentence with intended English words left as English;
- product/office terms embedded in Urdu;
- mixed punctuation and numbers;
- common Latin abbreviations.

### 5.6 Names / entities

- Pakistani personal names;
- city/place names;
- ambiguous transliteration where suggestions matter.

Names are especially important because an incorrect auto-conversion can be more harmful than leaving a token unchanged.

### 5.7 Numbers, units and contact data

Synthetic/public-safe examples such as:

- dates;
- phone-number shapes;
- prices (`Rs`, `PKR`);
- weights/units;
- order numbers.

The benchmark should test preservation and RTL/LTR visual stability without containing real personal data.

### 5.8 URLs / handles / email-shaped strings

Synthetic fixtures only.

Expected behaviour should normally preserve these tokens rather than transliterate them.

### 5.9 Long-paste conversion

- multi-sentence Roman Urdu passage;
- 3–8 line message-style text;
- line breaks;
- punctuation;
- emoji;
- mixed English tokens;
- numbers/names.

The benchmark must detect when passage conversion collapses line breaks or damages non-Urdu tokens.

### 5.10 Suggestion / Backspace recovery

Capture the existing recovery interaction explicitly.

Measure:

- how quickly an alternate candidate can be selected;
- current Backspace behaviour;
- whether mobile suggestions remain usable;
- whether an incorrect conversion can be reversed without destroying adjacent text.

A proposed `first Backspace restores Roman` behaviour may be evaluated only after the current interaction is documented and regression-tested.

### 5.11 Direct Urdu protection

Ensure native/direct Urdu and mode switching remain unchanged.

### 5.12 Mixed RTL visual fixtures

Include browser/manual fixtures for lines such as:

- Urdu + English name;
- Urdu + phone-number-shaped string;
- Urdu + URL;
- Urdu + price/quantity.

This is partly a rendering/continuity test, not only transliteration quality.

### Corpus size

Start with enough fixtures to represent each family meaningfully; prefer a curated **250–500 case corpus** over thousands of weak synthetic examples.

The corpus must be versioned and reviewed before it becomes a release gate.

---

## 6. Fixture/scoring model

Not every Roman input has a single valid Urdu output.

Each fixture should support one of:

- `exact_expected` — one accepted result;
- `accepted_set` — multiple acceptable Urdu outputs;
- `preserve_token` — a Latin/code-switched token should remain unchanged;
- `suggestion_contains` — intended form may appear in suggestions rather than first result;
- `format_preserved` — line breaks/punctuation/emoji structure must survive;
- `visual_review` — mixed-direction rendering requires browser/manual validation;
- `manual_review` — genuinely ambiguous cases excluded from automated pass/fail until resolved.

Report quality by fixture family, not one opaque global score.

---

## 7. Baseline first

Before changing production behaviour:

1. run the complete benchmark against the current implementation/provider where technically reproducible;
2. document browser-dependent/provider-dependent cases that cannot run deterministically in CI;
3. record baseline by category;
4. identify the highest-frequency/impact failure classes;
5. decide whether failures belong to WriteUrdu pre/post-processing, provider behaviour, UI/suggestion discovery, rendering, or inherent ambiguity.

A benchmark finding is not automatically permission to modify transliteration.

---

## 8. Candidate improvement classes

Only evaluate after baseline.

### B1 — UI/suggestion recovery

Lowest risk candidate family.

Examples:

- clearer alternate selection;
- bounded mobile suggestion count;
- more discoverable correction affordance;
- faster reversible conversion.

Do not change the current Backspace contract until tested against existing users/behaviour.

### B2 — Conservative token preservation

Potentially preserve obvious URLs, handles, email-shaped tokens, numeric patterns and clearly non-Urdu technical tokens in long-paste flows.

For ordinary Latin words, use caution: a token such as `order` may be intended as an English word or as the Roman spelling of a borrowed Urdu usage.

Do not rely on a simplistic “all Latin words stay Latin” rule because the entire Roman Urdu input is Latin.

### B3 — Bounded normalization

Evaluate only for clearly proven shorthand/spelling classes.

Normalization must be:

- deterministic;
- reversible/testable;
- small in scope;
- isolated from direct Urdu mode.

### B4 — Mixed-direction rendering repair

If the benchmark shows that phone numbers/names/URLs display incorrectly after conversion/copy/continuation, solve that at the rendering or destination layer rather than forcing transliteration rules to compensate.

### B5 — Provider evaluation

Only if the benchmark demonstrates material provider-level limitations that cannot reasonably be solved through UX or bounded preprocessing.

Any provider change requires a separate migration decision, latency/privacy review, search-risk review and production rollout plan.

---

## 9. Privacy rule for quality learning

Do not log the actual Roman token, Urdu candidate or accepted/rejected suggestion from production users merely to improve the dictionary.

If future quality telemetry is desired, it must be content-free, for example bounded counters such as:

- suggestion opened;
- alternate selected;
- conversion undone;
- passage conversion used;
- conversion error category.

Even these require alignment with the existing telemetry/privacy contract.

---

## 10. Metrics / release gates

A production candidate must:

- preserve or improve the canonical fixture family;
- demonstrate measurable improvement on the targeted challenge family;
- not reduce direct-input correctness;
- preserve suggestion/backspace recovery;
- preserve multi-word handoff state;
- preserve line breaks and non-text structure where promised;
- avoid meaningful input latency regression;
- preserve mobile keyboard/focus behaviour;
- pass existing transliteration regression tests;
- preserve privacy disclosures where provider behaviour remains the same.

Do not choose an arbitrary “95% accuracy” target before the benchmark defines what can be scored deterministically.

---

## 11. Implementation slices

### B0 — Fixture format

- define JSON/JS fixture schema;
- include category, input, expected mode and accepted outputs/properties;
- mark provider/browser-dependent fixtures separately;
- no production user content.

### B1 — Harness

- run deterministic WriteUrdu pre/post-processing locally;
- exercise current transliteration path where testability permits;
- add browser/manual protocol for provider-dependent suggestions;
- produce category report.

### B2 — Baseline report

- commit dated benchmark results;
- rank failure classes;
- recommend `no change`, `UX fix`, `bounded transform`, `rendering fix` or `provider investigation`.

### B3 — One candidate experiment

- implement only one targeted improvement at a time behind a bounded flag/test path;
- rerun full corpus;
- document regressions as well as wins.

### B4 — Production decision

- merge only if targeted improvement is real and protected behaviours do not regress;
- otherwise retain benchmark as durable quality infrastructure.

---

## 12. Acceptance

1. Corpus contains no production/private user text.
2. Mixed-language fixtures distinguish translation from transliteration.
3. Benchmark supports multiple acceptable outputs where linguistically appropriate.
4. Current baseline is recorded before candidate changes.
5. No production provider/input-path change is bundled with benchmark creation.
6. Direct Urdu behaviour remains protected.
7. Long-paste and single-word paths are both covered.
8. URLs/numbers/names/code-switching have dedicated fixtures.
9. Line-break/punctuation preservation is tested.
10. Current Backspace/suggestion interaction is documented before any undo redesign.
11. Candidate changes report category-level deltas, not only a global score.
12. Mobile input/focus regression tests remain green.
13. No actual user word/suggestion text is added to telemetry.
14. If no safe improvement is found, the correct outcome may be **keep current production behaviour**.