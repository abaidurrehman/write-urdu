# WU-INPUT-001A — Standalone Language & Voice Capability Benchmark

**Parent:** `WU-INPUT-001` — Multimodal Urdu Input & Conversion Platform  
**Status:** Active Slice 0 — benchmark/research only; no production UI changes  
**Priority:** Founder-directed Slice 0  
**Date:** 2026-09-11  
**Scope:** net-new standalone language/voice capabilities that do not change the current Write Urdu editor

---

## 1. Founder decision / non-negotiable boundary

Slice 0 will **not change the current client-side writer/editor behavior**.

In particular, this slice does not authorize changes to:

- the homepage Roman Urdu → Urdu interaction;
- current Google Input Tools/transliteration behavior;
- current Basic/Rich Editor layout or toolbar;
- current editor input-mode presentation;
- current live Voice behavior inside existing writing surfaces;
- established query ownership for `english to urdu typing`;
- current mobile activation work owned by `WU-PLAT-002H`.

The existing writer is a protected dependency for this slice.

Slice 0 instead answers:

> **Which useful capabilities does Write Urdu not yet provide, can be built free-first, and naturally extend the existing Urdu-writing/voice journey without modifying the current editor?**

No new public route is required to complete Slice 0.

---

## 2. Prioritized candidate capabilities

### P0-A — Urdu ↔ English Voice Translator

User jobs:

- “I speak Urdu; show me what I said and translate it into English.”
- “I speak English; show me what I said and translate it into Urdu.”
- “Let me copy the transcript or translation.”
- Later: “Read the translated Urdu/English aloud.”

Proposed future standalone journey:

```text
choose Urdu → English or English → Urdu
                    ↓
             tap microphone
                    ↓
             source transcript
                    ↓
               translation
                    ↓
       copy source / copy translation
                    ↓
          optional listen / continue
```

Slice 0 architecture hypothesis:

1. Reuse the browser speech-recognition approach on a future **standalone** surface where supported.
2. Do not upload live microphone audio merely to obtain translation.
3. Send only the recognized text to a provider-neutral text translation service.
4. Benchmark Microsoft Translator against Cloudflare translation models before selecting a production provider.
5. If browser speech recognition is unsupported, provide an explicit fallback to uploaded-audio transcription rather than silently changing privacy behavior.

This must not modify the current editor or mount new controls into it.

### P0-B — Urdu/English Audio or Voice Note → Text + Optional Translation

User jobs:

- “I have a WhatsApp/phone voice note in Urdu; turn it into editable Urdu.”
- “Translate this Urdu recording to English.”
- “I have English audio; transcribe it and optionally translate it to Urdu.”
- “Give me text I can copy or continue using.”

Proposed future standalone journey:

```text
upload audio
    ↓
choose/detect Urdu or English
    ↓
transcribe in source language
    ↓
source transcript
    ↓
optional translate
    ↓
copy / download text / continue
```

Provider candidates:

- Cloudflare `@cf/openai/whisper-large-v3-turbo` for transcription;
- direct Whisper speech translation as an Urdu→English challenger where its output contract is appropriate;
- transcription + text translation as the canonical bidirectional pipeline.

The two-stage pipeline is important because English→Urdu requires a target-language translation step rather than assuming Whisper can emit arbitrary target languages.

### P0-C — Shared Urdu ↔ English Text Translation Foundation

This is primarily a **service capability** required by P0-A and P0-B.

User-visible standalone text translation may be released later, but Slice 0 does not create a route merely because the backend exists.

Required directions:

- Urdu → English;
- English → Urdu.

Benchmark candidates:

- Microsoft Translator — bidirectional NMT baseline;
- Cloudflare `@cf/meta/m2m100-1.2b` — many-to-many challenger;
- Cloudflare `@cf/ai4bharat/indictrans2-en-indic-1B` — English→Urdu challenger only;
- the existing `POST /api/document-translate` path is implementation evidence, not a contract for a new public translator.

Invariant:

> Semantic translation must remain distinct from Roman Urdu transliteration and must never be marketed as a replacement for the existing typing experience.

### P1-D — Urdu Word Meaning / Dictionary / Synonyms Companion

User jobs:

- “What does this Urdu word mean in English?”
- “What is the Urdu word for this English word?”
- “Show alternative meanings.”
- “Show synonyms when a reliable source has them.”
- “Show part of speech / romanization / pronunciation when reliable data exists.”
- “Let me copy the word or meaning.”

This should be **reference-backed**, not a generic LLM answer box.

Candidate data/services:

1. **Microsoft Translator Dictionary Lookup / Dictionary Examples**
   - bilingual Urdu↔English alternatives;
   - part-of-speech;
   - back-translations/context;
   - bounded API limits suitable for word lookup.

2. **Wiktionary/Kaikki structured Urdu data**
   - candidate for same-language synonyms, senses, IPA/romanization and lexical metadata;
   - benchmark/research only until attribution, ShareAlike and redistribution obligations are explicitly satisfied;
   - isolate any derived dictionary dataset from application code so its license can be handled truthfully.

Do not generate a synonym with an LLM when the lexical source has no synonym. “No verified synonym found” is preferable to invented lexical data.

Do not create separate thin pages for “Urdu dictionary”, “Urdu synonym finder”, “Urdu meaning finder”, etc. One capable lookup experience is the intended product shape.

### P2-E — Listen to Translation

Not a standalone Slice 0 priority.

Potential future enhancement:

- browser `speechSynthesis` first where suitable;
- Azure Speech TTS as a quality/fallback benchmark, including Pakistani Urdu neural voices.

The translation/text result must be valuable before spoken output is added.

---

## 3. Why this order

The order is based on product adjacency rather than keyword novelty.

### Voice has first-party validation

Write Urdu already has:

- a shipped shared voice core;
- a dedicated Voice Typing surface;
- measured voice visitors/tries/success;
- strong downstream writing outcomes once usable Urdu exists.

Voice translation therefore extends an already-understood behavior.

### Audio upload fills a real product gap

Live browser recognition and saved audio are different jobs.

A user may already possess:

- a WhatsApp voice note;
- lecture recording;
- interview;
- phone memo;
- meeting excerpt.

Write Urdu currently has no first-class upload → Urdu transcript path.

### Translation is infrastructure before acquisition

The September 2026 GSC export contains substantial ambiguous `english to urdu` and `english to urdu text` exposure, but explicit `translate` / `translation` wording is still small in the top-1,000 query export.

Therefore:

- build and benchmark semantic translation because Voice/Audio need it;
- do not immediately retitle/reposition the homepage around “translator”;
- a public translator route requires its own search/quality/cannibalization gate.

### Dictionary/synonyms is cheap and useful but not yet search-led

The current top-1,000 GSC query export shows no meaningful `dictionary` or `synonym` cluster.

This does **not** reject the feature. It means the first release case is:

- useful writing companion;
- repeat utility;
- low compute;
- internal continuation opportunity;

rather than “large proven acquisition page.”

---

## 4. Protected implementation boundary

During Slice 0, do not modify production behavior in:

```text
index.html
js/voice-input-core.js
js/writer-voice-input.js
js/transliteration.js (or current transliteration owners)
urdu-editor.html / editor runtime
urdu-keyboard.html / keyboard runtime
```

Exact filenames must be re-verified before any future implementation.

Allowed Slice 0 changes:

```text
specs/
docs/
benchmarks/wu-input-001a/
skills/wu-input-001a/
non-production benchmark scripts
```

A future implementation slice may add **new** API adapters or standalone routes only after its benchmark gate is approved.

---

## 5. Shared service architecture hypothesis

Future remote capabilities should use one provider-neutral server boundary.

Conceptually:

```text
standalone feature
      ↓
bounded first-party API
      ↓
capability adapter
      ├── translate(text, from, to)
      ├── dictionaryLookup(term, from, to)
      └── transcribe(audio, language, task)
      ↓
provider adapter
```

Do not expose provider keys in browser code.

Do not let UI code depend on Microsoft/Cloudflare response shapes.

### Candidate logical contracts

```ts
type TranslationRequest = {
  version: 1;
  text: string;
  from: "ur" | "en";
  to: "ur" | "en";
};

type TranslationResult = {
  ok: true;
  translation: string;
  detectedLanguage?: "ur" | "en";
  providerAlias: string;
};
```

```ts
type DictionaryLookupRequest = {
  version: 1;
  term: string;
  from: "ur" | "en";
  to: "ur" | "en";
};

type DictionarySense = {
  partOfSpeech?: string;
  translations: string[];
  synonyms?: string[];
  examples?: Array<{ source: string; translation?: string }>;
  romanization?: string;
  pronunciation?: string;
  provenance: string[];
};
```

```ts
type AudioTranscriptResult = {
  ok: true;
  language: "ur" | "en";
  transcript: string;
  translatedText?: string;
  segments?: Array<{ startMs: number; endMs: number; text: string }>;
  providerAlias: string;
};
```

These are logical benchmark contracts, not production API commitments.

---

## 6. Benchmark workstreams

### 6.1 Translation corpus

Target: minimum 200 human-reviewed fixtures before provider selection.

Coverage:

- 75 Urdu→English;
- 75 English→Urdu;
- 50 mixed/proper-name/edge cases.

Families:

- everyday messaging;
- family/social;
- formal requests;
- work/business;
- school/learning;
- names and Pakistani place names;
- dates/currency/numbers;
- English words embedded in Urdu;
- idioms;
- honorifics/formality;
- gender/pronoun ambiguity;
- punctuation;
- multi-sentence passages.

Score each provider on:

- meaning preservation;
- naturalness;
- grammar;
- proper-name preservation;
- unwanted additions/omissions;
- script correctness;
- latency;
- quota/cost units.

No exact-string score is sufficient for translation quality.

### 6.2 Dictionary corpus

Target: 100 lookup cases.

Coverage:

- common Urdu words;
- common English words;
- nouns/verbs/adjectives/adverbs;
- polysemous words;
- spelling variants;
- Urdu compounds;
- words with and without known synonyms;
- words with Romanization/pronunciation data;
- not-found behavior.

Score:

- correct sense coverage;
- usefulness of alternatives;
- POS accuracy;
- synonym precision;
- no invented lexical relation;
- example usefulness;
- latency;
- source attribution completeness.

### 6.3 Audio corpus

Target: 100 consented/test clips before production selection.

Coverage:

- Urdu;
- English;
- Urdu-English code switching;
- male/female speakers;
- Pakistani accents where available;
- quiet/noisy;
- close/far microphone;
- names/numbers;
- 10–30 second voice notes;
- 1–3 minute notes;
- longer-file chunking cases.

Score:

- word error rate where a gold transcript exists;
- meaning/intelligibility score;
- code-switch preservation;
- proper-name/number handling;
- segment/timestamp quality;
- latency;
- neurons/audio minute;
- failure recovery.

Do not store real user production audio as benchmark material.

---

## 7. Provider hypotheses to test

### Microsoft Translator

Current official evidence indicates:

- Urdu text translation is supported;
- Urdu is supported by Dictionary Lookup;
- F0 currently includes 2 million characters/month for standard translation-related operations including bilingual dictionary;
- Dictionary Lookup is bounded to short terms/phrases, which is desirable for this product.

Use as the initial deterministic baseline for bidirectional text translation and bilingual dictionary.

### Cloudflare Workers AI

Current official evidence indicates:

- Workers AI has 10,000 free neurons/day shared across the account;
- Whisper Large V3 Turbo is 46.63 neurons/audio-minute;
- `m2m100-1.2b` and IndicTrans2 are low-neuron translation candidates;
- Whisper supports transcription and a speech-translation task;
- Cloudflare documents a chunked large-audio pattern.

This makes Workers AI the preferred uploaded-audio experiment environment, subject to actual account headroom.

### Wiktionary / Kaikki

Current evidence indicates structured Urdu lexical entries can include senses, synonyms, pronunciation/IPA and romanization.

However, the data inherits Wiktionary licensing (including CC BY-SA/GFDL obligations). This source is **benchmark/research approved, not production-data approved** until a release review defines:

- attribution;
- source links;
- license notice;
- update mechanism;
- treatment of transformed/subset data;
- ShareAlike implications for the derived lexical dataset;
- handling of third-party media/example material.

---

## 8. Free-first budget hypotheses

These values are planning inputs and must be revalidated at release.

### Microsoft Translator

Current F0 headline allowance: 2 million characters/month.

Use:

- text translation;
- dictionary lookup/examples.

Add:

- per-IP/session abuse control;
- server-side monthly budget;
- no automatic calls on every keystroke.

### Cloudflare Whisper

Current planning rate: 46.63 neurons/audio-minute.

At 10,000 free neurons/day, theoretical maximum if **nothing else** used Workers AI:

```text
~214 audio minutes/day
```

Production allocation must be lower because this is shared account capacity.

Initial product guardrail candidate:

- max 5-minute upload;
- max bounded file bytes;
- user-triggered processing only;
- daily feature cap below shared free pool;
- graceful “temporarily unavailable” state before paid overage.

### Dictionary local data

If a legally approved static subset is used:

- request-time compute can be effectively zero;
- build/update costs are negligible;
- lexical provenance must survive preprocessing.

---

## 9. Privacy model by feature

### Live Voice Translator

Preferred first architecture:

```text
microphone
  ↓
browser speech recognition
  ↓
recognized text
  ↓
first-party translation endpoint
```

Do not upload microphone audio to Write Urdu merely for semantic translation.

The standalone page must accurately disclose that browser/platform speech recognition can involve the browser/platform provider.

### Uploaded audio

Remote audio processing is explicit.

Before upload:

- file type;
- size/duration limit;
- processing disclosure;
- no claim that audio stays on-device.

Application contract:

- process;
- return transcript;
- do not persist audio/transcript in application storage by default;
- no Product Pulse content capture;
- verify provider retention/training/logging controls before release.

### Dictionary

The lookup term is low-sensitivity relative to a whole document, but still:

- no query history tied to account by default;
- no term content in aggregate telemetry;
- store only bounded event categories/counts.

---

## 10. Telemetry

Allowed aggregate events:

- feature viewed;
- direction selected (`ur-en` / `en-ur`);
- mic requested/started/success/error category;
- audio selected/upload accepted/transcription success/error category;
- translation requested/success/error category;
- dictionary lookup/success/not-found/error;
- synonym section available;
- copy source/copy result;
- optional continuation destination;
- coarse duration/file-size bucket for audio;
- provider alias / model alias in server operational telemetry where appropriate;
- latency bucket;
- quota/budget rejection.

Never record:

- spoken transcript;
- uploaded audio;
- translated text;
- dictionary query term;
- example sentence entered by the user.

---

## 11. Release gates

### Gate 0 — Slice 0 complete

- [ ] child spec registered;
- [ ] current editor protected boundary documented;
- [ ] GSC/product evidence recorded;
- [ ] provider evidence revalidated from official sources;
- [ ] benchmark fixture schemas exist;
- [ ] fixture validator passes;
- [ ] no production routes/UI/runtime files changed.

### Gate 1 — Voice Translator implementation eligible

- [ ] translation benchmark has an approved provider/fallback;
- [ ] standalone voice architecture reuses existing patterns without changing current editor behavior;
- [ ] privacy copy approved;
- [ ] unsupported-browser fallback defined;
- [ ] mobile microphone flow tested.

### Gate 2 — Audio-to-Text implementation eligible

- [ ] Whisper Urdu/English benchmark passes quality floor;
- [ ] account neuron headroom measured;
- [ ] duration/file limits defined;
- [ ] no-retention/logging behavior validated;
- [ ] long-audio chunking behavior tested.

### Gate 3 — Dictionary implementation eligible

- [ ] Microsoft Dictionary quality sampled;
- [ ] same-language synonym source selected;
- [ ] lexical source licensing/attribution approved;
- [ ] not-found and ambiguity UX defined;
- [ ] no LLM synonym fallback in v1.

### Gate 4 — Public SEO route eligible

Separate for each product.

Requires:

- product quality proven;
- real utility beyond a thin form;
- canonical query owner;
- cannibalization review;
- truthful metadata;
- no homepage/editor displacement.

---

## 12. Slice 0 deliverables

This child slice should create:

```text
specs/WU-INPUT-001A-standalone-language-voice-capability-benchmark.md
docs/WU-INPUT-001A-CAPABILITY-RESEARCH-2026-09-11.md
benchmarks/wu-input-001a/README.md
benchmarks/wu-input-001a/translation-fixtures.json
benchmarks/wu-input-001a/dictionary-fixtures.json
benchmarks/wu-input-001a/audio-fixture-plan.json
benchmarks/wu-input-001a/validate.js
skills/wu-input-001a/SKILL.md
```

Slice 0 explicitly does **not** create:

- a public translator page;
- a public dictionary page;
- an audio upload page;
- a new homepage input chooser;
- editor buttons;
- provider secrets;
- automatic paid usage.

---

## 13. Recommended next implementation sequence after Slice 0

If benchmarks are satisfactory:

1. **`WU-INPUT-001B` — shared bidirectional text-translation service**
2. **`WU-INPUT-001C` — standalone Urdu↔English Voice Translator**
3. **`WU-INPUT-001D` — Audio/Voice Note → Text + Translate**
4. **`WU-INPUT-001E` — Word Meaning / Dictionary / Synonyms**
5. optional spoken-output enhancement

The service foundation comes first technically, but Voice Translator is the first intended user-facing product.

---

## 14. Stop conditions

Stop and re-review if:

- implementation requires rewriting the current editor;
- the current Voice editor behavior must change to make a standalone translator work;
- a provider requires silent paid overage;
- Urdu quality is materially weak;
- same-language synonym data cannot be used under acceptable licensing;
- content logging/retention cannot be bounded;
- a new route would cannibalize an established owner without a clear migration decision.

The success criterion is **new user value without destabilizing the product that already earns traffic**.
