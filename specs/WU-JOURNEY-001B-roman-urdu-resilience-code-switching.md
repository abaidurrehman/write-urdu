# WU-JOURNEY-001B — Roman Urdu Resilience & Code-Switching Benchmark

**Status:** Planned benchmark / production changes gated  
**Priority:** P1 research; production transliteration changes only after evidence review  
**Parent:** `WU-JOURNEY-001`  
**Depends on:** mature English-letter → Urdu behaviour on `/` and Rich Editor  
**Risk class:** High regression risk if production input behaviour changes

---

## 1. Objective

Create a reproducible quality benchmark for the way Pakistanis actually write Urdu with English letters, including spelling variation, shorthand and English code-switching.

The purpose is **not** to replace the current transliteration provider or rewrite a mature input path. The first deliverable is evidence.

---

## 2. Problem

Roman Urdu is inherently variable. The same intended Urdu may be typed through multiple English-letter spellings, for example different vowel choices, omitted vowels, shorthand or informal phonetic forms.

Pakistani digital writing also commonly includes:

- English product/work terms;
- names;
- numbers/dates;
- punctuation;
- abbreviations;
- mixed Urdu + English inside one sentence.

WriteUrdu currently protects a mature English-letter → Urdu flow, but there is no explicit regression suite representing this messy real-world usage.

Without a benchmark, any attempt to “improve Roman Urdu” is unsafe.

---

## 3. Non-goals

Do not:

- replace the transliteration provider as the first step;
- collect real user text for the benchmark;
- send private drafts to an LLM for scoring;
- claim there is one standard Roman Urdu spelling;
- force English words into Urdu script when the user may intentionally want them preserved;
- auto-translate English meaning into Urdu;
- change Ctrl+G/direct-input semantics;
- introduce AI dependency into basic typing without a separate approved contract.

---

## 4. Benchmark corpus

Build a versioned fixture corpus from manually authored/public-safe examples. No production user content.

### Required fixture families

1. **Canonical phonetic**
   - ordinary common words/phrases already expected to work.

2. **Spelling variants**
   - vowel variation;
   - doubled/omitted consonants;
   - informal alternate spellings.

3. **Shorthand / texting**
   - common compressed Roman forms;
   - conversational particles.

4. **Code-switching**
   - Urdu sentence with intended English words left as English;
   - English product/office terms embedded in Urdu;
   - mixed punctuation/numbers.

5. **Names / entities**
   - Pakistani personal/place names;
   - ambiguous transliteration where suggestions matter.

6. **Long-paste conversion**
   - multi-sentence Roman Urdu passage;
   - line breaks;
   - punctuation;
   - mixed English tokens.

7. **Backspace/suggestion recovery**
   - ambiguous words where the first choice may be wrong but suggestions should permit recovery.

8. **Direct Urdu protection**
   - ensure native Urdu and English/direct mode remain unchanged.

### Corpus size

Start with enough fixtures to represent each family meaningfully; prefer a curated 250–500 case corpus over thousands of weak synthetic examples.

The corpus must be versioned and reviewed before it becomes a release gate.

---

## 5. Scoring model

Not every Roman input has a single valid Urdu output.

Each fixture should support one of:

- `exact_expected` — one accepted result;
- `accepted_set` — multiple acceptable Urdu outputs;
- `preserve_token` — an English/code-switched token should remain unchanged;
- `suggestion_contains` — intended form may appear in suggestions rather than first result;
- `manual_review` — genuinely ambiguous cases excluded from automated pass/fail until resolved.

Report quality by fixture family, not one opaque global score.

---

## 6. Baseline first

Before changing production behaviour:

1. run the complete benchmark against the current implementation/provider;
2. record baseline by category;
3. identify the highest-frequency/impact failure classes;
4. decide whether failures belong to WriteUrdu pre/post-processing, provider behaviour, UI/suggestion discovery, or inherently ambiguous Roman Urdu.

A benchmark finding is not automatically permission to modify transliteration.

---

## 7. Candidate improvement classes

Only evaluate after baseline.

### B1 — UI/suggestion recovery

Lowest risk. Improve the user’s ability to recover from an ambiguous first candidate without changing core transliteration.

### B2 — Conservative token preservation

Potentially preserve obvious English/code-switched tokens in long-paste flows where current conversion damages them.

This requires strong tests; do not rely on a simplistic ASCII dictionary heuristic that could break Roman Urdu words.

### B3 — Bounded normalization

Evaluate only for clearly proven shorthand/spelling classes. Normalization must be reversible/testable and must not alter direct Urdu mode.

### B4 — Provider evaluation

Only if the benchmark demonstrates material provider-level limitations that cannot reasonably be solved through UX or bounded preprocessing.

Any provider change requires a separate migration decision, latency/privacy review and production rollout plan.

---

## 8. Metrics / release gates

A production candidate must:

- preserve or improve the canonical fixture family;
- demonstrate measurable improvement on the targeted challenge family;
- not reduce direct-input correctness;
- preserve suggestion/backspace recovery;
- preserve multi-word handoff state;
- avoid meaningful input latency regression;
- preserve mobile keyboard/focus behaviour;
- pass existing transliteration regression tests.

Do not choose an arbitrary “95% accuracy” target before the benchmark defines what can be scored deterministically.

---

## 9. Implementation slices

### B0 — Fixture format

- define JSON/JS fixture schema;
- include category, input, expected mode and accepted outputs;
- no user content.

### B1 — Harness

- run current transliteration path where testable;
- separately test deterministic WriteUrdu preprocessing/postprocessing;
- produce category report.

### B2 — Baseline report

- commit dated benchmark results;
- rank failure classes;
- recommend `no change`, `UX fix`, `bounded transform` or `provider investigation`.

### B3 — Candidate experiment

- implement only one targeted improvement at a time behind a bounded flag/test path;
- rerun full corpus.

### B4 — Production decision

- merge only if targeted improvement is real and protected behaviours do not regress;
- otherwise retain benchmark as durable quality infrastructure.

---

## 10. Acceptance

1. Corpus contains no production/private user text.
2. Mixed-language fixtures distinguish translation from transliteration.
3. Benchmark supports multiple acceptable outputs where linguistically appropriate.
4. Current baseline is recorded before candidate changes.
5. No production provider/input-path change is bundled with benchmark creation.
6. Direct Urdu behaviour remains protected.
7. Long-paste and single-word paths are both covered.
8. Candidate changes report category-level deltas, not only a global score.
9. Mobile input/focus regression tests remain green.
10. If no safe improvement is found, the correct outcome may be **keep current production behaviour**.