# WU-INPUT-001A — Capability Research & Slice 0 Decision Ledger

**Date:** 2026-09-11  
**Parent:** `WU-INPUT-001`  
**Child:** `WU-INPUT-001A`  
**Purpose:** evidence behind the standalone Voice Translator, Audio-to-Text, Translation and Dictionary/Synonym priorities.

## Executive decision

Do not use Slice 0 to alter or replace the current Write Urdu editor/transliteration experience.

Prioritize net-new capabilities:

1. **Urdu ↔ English Voice Translator**
2. **Uploaded Audio / Voice Note → Text + optional translation**
3. **Shared Urdu ↔ English semantic text translation**
4. **Word Meaning / Dictionary / Synonyms**
5. spoken translation output as a later enhancement

The current Roman Urdu engine remains protected and is not a Slice 0 provider-migration project.

## First-party search evidence

Source: `write-urdu.com-Performance-on-Search-2026-09-04.zip`, top 1,000 query export.

Relevant exact/substring evidence recomputed for this Slice 0 review:

| Cluster / query | Clicks | Impressions | Interpretation |
| --- | ---: | ---: | --- |
| `english to urdu` exact | 5 | 5,575 | large but ambiguous between typing/transliteration and semantic translation |
| `english to urdu text` exact | 1 | 3,722 | potentially semantic, still ambiguous |
| explicit `translate` wording | 1 | 9 | not yet an established acquisition cluster |
| explicit `translation` wording | 0 | 52 | not yet an established acquisition cluster |
| explicit `meaning` wording | 0 | 32 | tiny current footprint |
| explicit `dictionary` | 0 | 0 | no top-1,000 footprint |
| explicit `synonym`/`synonyms` | 0 | 0 | no top-1,000 footprint |
| explicit whole-word `voice` | 4 | 137 | small search cluster but backed by real product usage |
| explicit `audio` / `speech` | 0 | 0 | greenfield acquisition opportunity, not proven demand |

Important interpretation:

- translation is strategically useful because it unlocks new workflows, not because explicit translator keywords are already a major current cluster;
- Voice has both search and product evidence;
- dictionary/synonym should launch, if at all, as a low-cost writing utility rather than a traffic forecast;
- do not rewrite the high-impression `english to urdu typing` owner around semantic translation.

## First-party product evidence

The September Product Pulse evidence already establishes meaningful Voice usage and a large existing writing/outcome funnel. The standalone Voice Translator should therefore extend Voice rather than replace the live writer.

Existing repo architecture also already contains:

- `js/voice-input-core.js` using `SpeechRecognition` / `webkitSpeechRecognition`;
- a shared Urdu Voice platform;
- `functions/api/document-translate.js` using Workers AI IndicTrans2 for bounded English→Urdu document text;
- an Urdu AI writing platform with a future `translate_to_urdu` action that is not a standalone translator;
- Roman Urdu benchmark work that has improved resilience without replacing Google Input Tools.

This child must reuse those architectural lessons without changing their current production behavior.

## Provider evidence

### Microsoft Translator

Official language support says Urdu (`ur`) supports:

- cloud text translation;
- auto language detection;
- Dictionary Lookup;
- LLM translation availability.

The Dictionary API is specifically designed for short terms/phrases and returns alternative translations, part of speech and back-translations. Dictionary Examples can provide contextual examples.

Current F0 pricing states 2 million characters/month free across standard translation-related operations, including:

- Text Translation;
- Language Detection;
- Bilingual Dictionary;
- Transliteration.

Official sources:

- https://learn.microsoft.com/azure/ai-services/translator/language-support
- https://azure.microsoft.com/pricing/details/translator/
- https://learn.microsoft.com/azure/ai-services/translator/service-limits
- https://learn.microsoft.com/rest/api/translator/translator/dictionary-lookup

Decision:

- primary benchmark for bidirectional Urdu↔English text translation;
- primary benchmark for bilingual word lookup;
- not evidence by itself for same-language Urdu synonyms.

### Cloudflare Workers AI — audio

`@cf/openai/whisper-large-v3-turbo` supports:

- multilingual ASR;
- `transcribe`;
- `translate`;
- batch processing.

Current unit rate: 46.63 neurons/audio minute.

Workers AI current free pool: 10,000 neurons/day shared across the account.

Theoretical audio ceiling if no other Workers AI usage existed:

```text
10000 / 46.63 ≈ 214 audio minutes/day
```

That is not the production budget. Write Urdu must reserve capacity and fail closed before unexpected paid usage.

Cloudflare also documents a current large-audio chunking pattern.

Official sources:

- https://developers.cloudflare.com/workers-ai/models/whisper-large-v3-turbo/
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/workers-ai/guides/tutorials/build-a-workers-ai-whisper-with-chunking/

Decision:

- preferred uploaded-audio benchmark;
- evaluate Urdu transcription quality before release;
- Urdu→English direct speech translation can be a challenger;
- canonical bidirectional product architecture remains transcript first, then text translation.

### Cloudflare Workers AI — text translation

Current candidates:

- `@cf/meta/m2m100-1.2b` — many-to-many translation;
- `@cf/ai4bharat/indictrans2-en-indic-1B` — English→Indic, with Urdu target support and already used in the repo's document translation route.

Both currently map to approximately 31,050 neurons/M input tokens and 31,050 neurons/M output tokens.

Official sources:

- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/workers-ai/models/m2m100-1.2b/

Decision:

- Microsoft is the deterministic external baseline;
- M2M100 is the Cloudflare-native bidirectional challenger;
- IndicTrans2 is the English→Urdu quality challenger;
- no provider is production-selected before human Urdu review.

### Azure Speech

Current F0 pricing advertises:

- 5 audio hours/month real-time Speech-to-Text;
- 5 audio hours/month Speech Translation;
- 0.5 million Text-to-Speech characters/month.

Azure's current language documentation lists:

- Urdu as a text target for real-time speech translation;
- Urdu speech-to-text support at least for `ur-IN` in the current speech-to-text locale table;
- Pakistani Urdu TTS voices `ur-PK-UzmaNeural` and `ur-PK-AsadNeural`.

Official sources:

- https://azure.microsoft.com/pricing/details/speech/
- https://learn.microsoft.com/azure/ai-services/speech-service/language-support

Decision:

- useful challenger for future spoken-output / speech-translation quality work;
- not required for first Voice Translator architecture;
- browser recognition + text translation is simpler and preserves the current live-voice privacy boundary better.

## Dictionary / synonym data research

### Microsoft Dictionary

Strengths:

- official supported Urdu bilingual dictionary;
- alternative translations;
- POS;
- back-translations;
- contextual examples;
- no large local dataset to maintain.

Limit:

- it is a bilingual dictionary service, not a guarantee of same-language Urdu synonyms.

### Wiktionary / Kaikki

Kaikki provides machine-readable data extracted from Wiktionary. Current Urdu entries can contain:

- English glosses;
- parts of speech;
- IPA;
- romanization;
- synonyms where Wiktionary contributors supplied them.

Kaikki states its data is made available under the same licenses as Wiktionary. Current Wiktionary text is distributed under CC BY-SA 4.0 and GFDL; attribution and ShareAlike obligations apply to reused/adapted text.

Sources:

- https://kaikki.org/dictionary/
- https://en.wiktionary.org/wiki/Wiktionary:Copyrights
- https://foundation.wikimedia.org/wiki/Legal:Wikimedia_Developer_App_Guidelines

Decision:

- valid benchmark/research source;
- do not simply bundle the dataset into Write Urdu without an explicit data-license design;
- if selected, generate a provenance-preserving lexical subset as a separately licensed data artifact, with attribution/source links and update policy;
- exclude third-party media/examples unless their individual licenses are also understood.

### Urdu WordNet / other lexical resources

The CLE Urdu WordNet is not a zero-cost source: its current page lists a processing fee.

Open multilingual resources may contain Urdu, but provenance/license varies per underlying wordnet. Do not adopt a merged multilingual database merely because the aggregator code is open-source.

Decision:

- Microsoft + carefully licensed Wiktionary-derived data is the current lowest-friction benchmark path;
- no LLM-generated synonym database.

## Competitor/product pattern evidence

Current products validate these jobs:

- JotMe exposes Urdu→English and English→Urdu live Voice translation with source transcript + translated text;
- TurboScribe and Notevibes expose uploaded Urdu audio transcription/translation;
- Cambridge, Rekhta and Shabdkosh show that dictionary users expect meanings, examples, pronunciation and related words.

Product implication:

Write Urdu should not win by cloning their breadth.

The differentiated combination is:

```text
Speak / upload / type / look up
            ↓
Urdu + English understanding
            ↓
copy / continue into Write Urdu workflows
```

while retaining accountless/lightweight behavior where practical.

## Slice 0 product ranking

| Rank | Product | Existing WU capability? | Free-first feasibility | Strategic value | Slice 0 decision |
| --- | --- | --- | --- | --- | --- |
| 1 | Urdu↔English Voice Translator | no | very high | very high | benchmark + architecture P0 |
| 2 | Audio/Voice Note→Text + Translate | no | high | very high | benchmark P0 |
| 3 | Bidirectional Text Translation service | only partial English→Urdu doc path | very high | foundational | benchmark P0 |
| 4 | Word Meaning/Dictionary/Synonyms | no real product | very high | medium-high | benchmark P1 |
| 5 | Spoken translated output | partial device capability only | high | medium | later enhancement |

## Recommended architecture to validate

### Live Voice Translator

```text
browser microphone
  → existing browser recognition approach
  → source transcript
  → first-party translation adapter
  → translated text
```

No remote microphone audio upload in the default live path.

### Uploaded Audio

```text
file
  → bounded validation/chunking
  → Whisper transcription
  → source transcript
  → optional translation adapter
  → target text
```

### Dictionary

```text
term
  → Microsoft bilingual dictionary
  → optional licensed same-language lexical layer
  → merged presentation with provenance
```

Never merge conflicting senses into a single fabricated “best meaning”.

## Slice 0 conclusion

The current editor is not the experimentation surface.

The best new capability family is **Urdu↔English understanding around Voice and audio**, with text translation as shared infrastructure and a reference-backed dictionary as a cheap adjacent utility.

Next technical child after benchmark acceptance should therefore be a provider-neutral **bidirectional translation service**, followed by the standalone Voice Translator.
