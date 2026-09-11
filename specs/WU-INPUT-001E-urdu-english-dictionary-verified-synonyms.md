# WU-INPUT-001E — Urdu ↔ English Word Meaning, Dictionary & Verified Synonyms

**Status:** Active implementation preview  
**Parent:** WU-INPUT-001 — Multimodal Urdu Input & Conversion Platform  
**Depends on:** WU-INPUT-001A evidence/benchmark discipline  
**Date:** 2026-09-11

## Decision

Build a standalone, bounded Urdu ↔ English dictionary preview without modifying the current homepage writer, Roman Urdu transliteration, Basic/Rich editors, Voice Typing, Voice Translator, or Audio-to-Text preview.

The first implementation provides:

- English → Urdu word/short-idiom lookup;
- Urdu → English word/short-idiom lookup;
- alternative target translations;
- part-of-speech when the provider returns it;
- confidence when the provider returns it;
- back-translations/context clues;
- explicit empty/not-found behavior;
- a reserved `synonyms` field that is populated only by an approved source with a clear same-language synonym guarantee.

It must **not** label Microsoft back-translations as synonyms.

## Why this slice

WriteUrdu already helps users produce Urdu. A dictionary companion closes a common post-writing loop: understand a word, compare meanings, and choose a better equivalent without leaving the product.

Current first-party search evidence does not yet prove dictionary/synonym acquisition demand, so this remains a `noindex` product preview until usage/quality evidence justifies promotion.

## Provider evidence

Microsoft Translator v3 Dictionary Lookup is the initial provider because it supports alternative translations for words/small idiomatic phrases, part-of-speech and back-translations. Microsoft currently lists Urdu (`ur`) with Dictionary support and the operation works to/from English.

Dictionary Examples is a separate API call. It is deliberately excluded from the first implementation so one user lookup maps to one bounded provider request.

### Synonym boundary

The initial Microsoft response is not a reliable same-language thesaurus. Therefore:

- `backTranslations` are contextual reverse translations, not synonyms;
- `synonyms` remains empty unless a separately approved lexical source explicitly provides same-language synonym relationships;
- do not generate synonyms with an LLM;
- do not scrape dictionary websites;
- do not incorporate Wiktionary/Kaikki-derived synonym data until attribution/share-alike and derived-dataset handling are explicitly approved.

## Protected surfaces

This slice must not modify:

- `/` Roman Urdu writer;
- Google Input Tools/transliteration behavior;
- `/urdu-editor`;
- Basic Writer input modes;
- `/tools/urdu-voice-typing`;
- `/tools/urdu-english-voice-translator`;
- `/tools/audio-to-text-translator`;
- `/api/language-translate` behavior;
- `/api/audio-transcribe` behavior;
- global nav/homepage acquisition ownership;
- sitemap/indexability before release acceptance.

## Preview route

`/tools/urdu-english-dictionary`

Initial page requirements:

1. `noindex,follow`.
2. Direction selector:
   - English → Urdu
   - Urdu → English
3. One term/short phrase input, maximum 100 characters.
4. Explicit **Look up word** action.
5. Results list with:
   - target term;
   - part of speech when present;
   - confidence when present;
   - back-translations/context clues;
   - number of provider examples available where present.
6. A clear distinction between:
   - `Meanings & alternatives`;
   - `Verified synonyms`.
7. If no approved synonym source returns synonyms, show a neutral note rather than fabricated content.
8. No account prompt, editor handoff, export, batch transliteration or AI writing integration in this slice.

## API contract

### Endpoint

`POST /api/dictionary-lookup`

### Request

```json
{
  "version": 1,
  "from": "en",
  "to": "ur",
  "term": "work"
}
```

Allowed language pairs only:

- `en` → `ur`
- `ur` → `en`

No auto-detect in v1.

### Limits

- JSON only;
- maximum request body: 4 KiB;
- one lookup term only;
- term maximum: 100 characters;
- reject unknown request keys;
- trim NUL/outer whitespace;
- no user-selectable provider/model/source.

### Success response

```json
{
  "ok": true,
  "from": "en",
  "to": "ur",
  "source": "work",
  "entries": [
    {
      "term": "کام",
      "partOfSpeech": "NOUN",
      "confidence": 0.91,
      "backTranslations": [
        {
          "term": "work",
          "examplesAvailable": 10,
          "frequency": 123
        }
      ]
    }
  ],
  "synonyms": [],
  "synonymStatus": "verified-source-not-configured"
}
```

Provider/model/source aliases are server-internal and must not be sent to browser clients.

### Not found

A valid lookup with no entries is a successful response:

```json
{
  "ok": true,
  "from": "en",
  "to": "ur",
  "source": "...",
  "entries": [],
  "synonyms": [],
  "synonymStatus": "verified-source-not-configured"
}
```

The UI should explain that the word was not found and suggest checking spelling or trying a simpler base word.

## Provider implementation

Initial provider: Microsoft Translator v3 Dictionary Lookup.

Reuse existing server-side environment names:

- `AZURE_TRANSLATOR_KEY`
- `AZURE_TRANSLATOR_REGION` (optional depending on resource type)
- `AZURE_TRANSLATOR_ENDPOINT` (optional override)

New feature gate:

- `DICTIONARY_LOOKUP_ENABLED=1`

Default state is disabled.

### Microsoft request

`POST {endpoint}/dictionary/lookup?api-version=3.0&from={from}&to={to}`

Body:

```json
[{ "Text": "<term>" }]
```

One provider call per user lookup. No retries or silent provider fallback in this slice.

## Response normalization

Bound the provider response before returning it:

- maximum 8 target entries;
- maximum 6 back-translations per target entry;
- strings trimmed;
- confidence clamped/validated as `0..1` or `null`;
- example counts/frequency normalized to non-negative integers;
- ignore malformed provider items rather than leaking raw structures;
- fail closed if the top-level provider shape is malformed.

## Privacy

- do not log lookup terms;
- `cache-control: no-store`;
- no search-content telemetry;
- no dictionary history/account storage in this slice;
- browser sends the term only after explicit lookup action.

## Error taxonomy

Stable public errors:

- `dictionary_not_enabled`
- `dictionary_not_configured`
- `invalid_request`
- `invalid_term`
- `unsupported_language_pair`
- `payload_too_large`
- `dictionary_rate_limited`
- `dictionary_timeout`
- `dictionary_unavailable`
- `dictionary_invalid_response`

Do not expose upstream provider payloads or credentials.

## Tests

Contract tests must prove:

1. feature is disabled by default;
2. only `en↔ur` is accepted;
3. term and request-body limits are enforced;
4. unknown request keys fail closed;
5. Microsoft credentials remain server-side;
6. mocked provider request uses `/dictionary/lookup`, one item and correct `from/to`;
7. provider alternatives/POS/back-translations are normalized and bounded;
8. empty provider results return successful not-found shape;
9. browser only looks up after explicit user action;
10. browser payload has no provider/model selector;
11. Microsoft back-translations are never labelled synonyms;
12. current editor/Voice/transliteration surfaces remain unchanged.

## Release gate

Merging this preview does not mean public launch.

Before enabling/indexing/promoting:

- run representative English→Urdu and Urdu→English terms against the live provider;
- manually review common Pakistani usage, polysemy, verbs/nouns, formal terms, names and idioms;
- verify Azure quota/cost behavior;
- enable `DICTIONARY_LOOKUP_ENABLED=1` only after acceptance;
- keep synonyms unavailable until a verified same-language source and license plan are approved.

## Follow-up

Potential `WU-INPUT-001E2` after evidence:

- Dictionary Examples on demand for a selected result (not every lookup);
- approved same-language synonym dataset/provider;
- click-a-word lookup from other WriteUrdu tools only after standalone usage proves value;
- indexable SEO page only after query/engagement evidence supports it.
