# WU-TOOLS-EXPANSION-006 — Urdu ↔ Hindi Script Converter R&D

Status: Research / do not block P0-P1 tools
Parent: WU-TOOLS-EXPANSION-001
Date: 2026-08-17

## 1. Opportunity

A useful adjacent tool would let users render the same Hindustani-language content across Urdu Perso-Arabic script and Hindi Devanagari script without presenting the operation as translation.

This could expand WriteUrdu into cross-script text utility while remaining close to the existing transliteration domain.

## 2. Important distinction

The product is script conversion/transliteration, not semantic translation.

Example concept:
- Urdu script → Devanagari representation of the same spoken wording;
- Devanagari → Urdu-script representation of the same spoken wording.

Because Urdu normally omits many short vowels that Devanagari often represents, Urdu → Hindi is inherently more ambiguous than Hindi → Urdu. A high-quality engine may require lexical/contextual inference rather than simple character substitution.

## 3. Why this is R&D

The existing WriteUrdu Google Input Tools integration is designed for Latin/Roman input → target script. It is not a supported direct Urdu-script ↔ Devanagari conversion contract.

Therefore this feature must not be implemented by assuming that changing the Google `itc` target solves both directions.

## 4. Research questions

Before implementation, answer:
- can a high-quality converter run completely in browser JavaScript/WASM?
- what open linguistic datasets/rule sets can legally be used?
- can we use a permissive-licensed engine or data set compatible with WriteUrdu distribution?
- what quality is achievable with deterministic rules alone?
- where is a dictionary required?
- how should ambiguous Urdu vowel recovery be represented to the user?
- can likely alternatives be generated locally without a server model?
- how should Sanskritized Hindi vocabulary and Persian/Arabic Urdu vocabulary be handled when the task is script conversion rather than translation?
- what happens to English words, numbers, punctuation and named entities?

## 5. Licensing gate

Do not incorporate copyleft or unclear-licence implementation code/data into WriteUrdu without an explicit compatibility review.

Open-source projects may be used as research references, but source reuse requires a documented licence decision.

Hosted third-party transliteration APIs with request limits or “non-high-volume” terms must not become a production dependency for a free public tool.

## 6. Prototype plan

Build an isolated local spike before any public route:

1. Define normalized phonetic/intermediate representation.
2. Implement Devanagari → intermediate → Urdu for a controlled core alphabet.
3. Implement Urdu → intermediate → Devanagari with explicit ambiguity markers.
4. Add lexical dictionary layer only if a legally reusable dataset is identified.
5. Benchmark against a manually reviewed corpus.
6. Decide ship / narrow scope / defer.

## 7. Evaluation corpus

Include:
- common conversational Hindustani;
- Urdu-origin vocabulary;
- Hindi/Sanskrit-origin vocabulary;
- proper names;
- numerals;
- punctuation;
- English code-switching;
- aspirated consonants;
- short/long vowels;
- nasalization;
- izafat and Urdu-specific orthographic patterns;
- words where omitted Urdu short vowels create multiple plausible Devanagari outputs.

## 8. Quality UX if shipped

The public tool must:
- label itself “script converter” or “transliterator”, not translator;
- preserve source separately from output;
- visually mark ambiguous words when confidence is not high;
- offer alternatives where practical;
- invite user review;
- never claim perfect/lossless conversion;
- allow copy and editor handoff.

## 9. Success gate

Ship only if:
- common conversational examples are consistently useful;
- Devanagari → Urdu is high-quality on the benchmark;
- Urdu → Devanagari ambiguity is handled transparently;
- no paid/high-volume hosted API dependency is required;
- licences for code/data are compatible and documented;
- browser payload/performance is acceptable.

Otherwise keep this item in R&D and prioritize the OCR/Cleaner/Voice/InPage program.

## 10. Out of scope for R&D V1

- machine translation between Hindi and Urdu vocabulary/registers;
- server-hosted LLM inference;
- paid transliteration APIs;
- promises of linguistic equivalence;
- automatic correction of the user's vocabulary/register.