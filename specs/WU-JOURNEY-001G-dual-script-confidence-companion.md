# WU-JOURNEY-001G — Dual-Script Confidence Companion

**Status:** Hold / evidence-gated experiment  
**Priority:** P1/P2 candidate after destination + activation evidence  
**Parent:** `WU-JOURNEY-001`  
**Related:** `WU-JOURNEY-001B`, `WU-JOURNEY-001C`  
**Primary hypothesis:** some users can comfortably speak/type Roman Urdu but are less confident verifying the resulting Urdu script

---

## 1. Objective

Evaluate whether showing the user **what they originally typed in English letters alongside the converted Urdu** improves confidence and successful completion for selected journeys such as messaging or learning.

This is a confidence aid, not a translation feature and not a new transliteration engine.

---

## 2. Why this is gated

External research provides directional evidence that some frequent Roman Urdu users report weaker confidence in Urdu-script reading/spelling, but the available studies are not large enough to justify a site-wide UI change.

WriteUrdu also has many confident Urdu readers for whom a second script line would add clutter.

Therefore:

- off by default;
- test in one bounded journey first;
- never push the core editor lower before first value;
- do not ship site-wide from research alone.

---

## 3. User job

> “I typed what I meant in English letters, but I’m not fully confident that I can read/check the Urdu result. Let me compare it with what I typed.”

Potential high-fit contexts:

- WhatsApp/message preview;
- beginner typing/learning context;
- short-form Basic Writer completion.

Lower-fit contexts:

- long formal documents;
- direct Urdu input;
- voice input with no Roman source;
- pasted Urdu;
- professional publishing.

---

## 4. Critical source-of-truth rule

The companion must display the **actual Roman source the user typed in the current session**, not a reverse-transliteration guess generated from the Urdu result.

Why:

- reverse transliteration is ambiguous;
- it can falsely imply the system knows the user’s original spelling;
- it may change names/English tokens;
- it can hide conversion mistakes instead of helping verify them.

If the original source is unavailable, the companion is unavailable.

---

## 5. Synchronization problem

Once the user edits the converted Urdu directly, the Roman source may no longer describe the final Urdu accurately.

The product must not silently show stale Roman text as if it were synchronized.

Candidate v1 approaches:

### Option A — message/session source panel

Show a compact `What you typed` source block for the current short message/passage.

If the Urdu is edited directly after conversion, mark the source as:

- `Original English-letter input`

rather than claiming it is an exact transliteration of the current final Urdu.

### Option B — conversion-segment companion

Track source only for individual conversion segments while they remain structurally intact.

More accurate, but much higher implementation complexity.

### Option C — no persistent companion

Offer a temporary `Show original input` review affordance immediately after conversion only.

This may provide most confidence value with less synchronization risk.

Choose from evidence/prototype testing, not preference.

---

## 6. Product copy

Preferred concept:

- `Show what I typed`
- `Original English-letter input`

Avoid:

- `English translation`
- `Roman translation`
- `Correct pronunciation`

because the source is the user’s own informal Roman Urdu, not a standardized linguistic representation.

Urdu copy requires fluent review before release.

---

## 7. Copy behaviour

Default Copy remains **Urdu only**.

If the experiment supports copying both:

- expose a clearly separate `Copy Urdu + original input` action;
- never change the existing Copy result silently;
- maintain sensible RTL/LTR separators/line breaks.

A bilingual/dual-script copy action is optional and should not ship in the first experiment unless the user job requires it.

---

## 8. Privacy / persistence

The Roman source is user content.

Rules:

- keep it in current in-memory/session-local state unless the existing draft model explicitly stores source provenance under a separately approved contract;
- never send the source text to product telemetry;
- do not put it in URLs;
- do not add it to public shares unless the user explicitly chooses a future `copy/publish both` action;
- do not claim it is browser-only if the underlying transliteration action itself uses a provider; follow the current privacy wording.

A localStorage preference may remember only the **toggle preference** (`show source = on/off`), not the source text itself unless existing draft storage already owns that content.

---

## 9. Relationship to Roman Urdu benchmark

`WU-JOURNEY-001B` owns conversion quality and suggestion/recovery.

This spec must not become a workaround for poor transliteration quality.

If users frequently need the companion because the first Urdu candidate is wrong, fix quality/recovery under `001B` rather than normalizing permanent uncertainty.

---

## 10. First experiment recommendation

After P0.1 allows it and destination evidence supports a messaging cohort:

1. choose a short-message surface or bounded Basic Writer cohort;
2. expose a small `Show what I typed` toggle after first successful Urdu;
3. show source under/near preview—not above the primary writer;
4. measure content-free events only:
   - eligible;
   - toggle shown;
   - toggle enabled;
   - Copy outcome;
   - conversion correction/undo counts where already approved;
5. compare successful outcome rate and qualitative user feedback;
6. remove if it adds clutter without measurable value.

---

## 11. Accessibility / RTL

- Urdu result remains `dir=rtl`;
- Roman source is explicitly `dir=ltr`;
- do not rely on visual alignment alone to indicate which line is which;
- screen readers need labels such as `Urdu result` and `Original English-letter input`;
- mixed numbers/links should preserve bidi isolation where appropriate;
- toggle must be keyboard accessible.

---

## 12. Acceptance

1. Feature is off by default in the first experiment.
2. Core editor remains the dominant first-value surface.
3. Companion shows actual current-session source, not reverse transliteration.
4. Stale/original source is labeled honestly after direct Urdu edits.
5. Default Copy remains Urdu only.
6. Direct Urdu/voice/imported-Urdu flows are not given fake Roman source.
7. Roman source is not sent to analytics or URLs.
8. Urdu and Roman lines have correct RTL/LTR semantics.
9. Feature can be disabled without affecting transliteration or drafts.
10. Rollout beyond the bounded cohort requires evidence that it improves confidence/completion rather than simply increasing UI density.