# WU-INPUT-001E — Dictionary / Verified Synonyms execution skill

Use this skill when implementing, reviewing or extending `WU-INPUT-001E`.

## Read first

1. `specs/WU-INPUT-001E-urdu-english-dictionary-verified-synonyms.md`
2. `specs/WU-INPUT-001A-standalone-language-voice-capability-benchmark.md`
3. `functions/lib/input-translation/providers/microsoft.mjs`
4. `tests/dictionary-foundation.test.mjs`

## Non-negotiable product boundary

This is a standalone dictionary preview. Do not modify the homepage writer, Roman Urdu transliteration, Basic/Rich editors, current Voice Typing, Voice Translator, Audio-to-Text, global nav, sitemap or acquisition ownership as part of this slice.

The preview remains `noindex,follow` until quality/usage evidence authorizes promotion.

## Vocabulary discipline

These terms are not interchangeable:

- **target translation / meaning alternative:** Microsoft `displayTarget` / `normalizedTarget`;
- **part of speech:** Microsoft `posTag`;
- **back-translation:** a reverse translation that helps disambiguate context;
- **synonym:** a same-language lexical relationship from an explicitly approved synonym source.

Never label Microsoft back-translations as synonyms.

Never generate synonyms with an LLM.

Do not scrape dictionary websites.

Do not import Wiktionary/Kaikki/CLE/other lexical datasets until licensing, attribution, provenance and derived-data handling are explicitly approved.

## Server contract

Endpoint: `POST /api/dictionary-lookup`

Browser request shape only:

```json
{ "version": 1, "from": "en", "to": "ur", "term": "work" }
```

or reverse `ur` → `en`.

Do not add provider/model/source names to the browser request.

Feature gate:

```text
DICTIONARY_LOOKUP_ENABLED=1
```

Default must remain disabled.

Reuse the existing Translator credentials only on the server:

- `AZURE_TRANSLATOR_KEY`
- `AZURE_TRANSLATOR_REGION` optional
- `AZURE_TRANSLATOR_ENDPOINT` optional

## Provider rules

Initial provider is Microsoft Translator v3 Dictionary Lookup.

One lookup action = at most one provider request in `001E`.

Do not automatically call Dictionary Examples. That is a separately gated follow-up because it adds an additional provider request and latency.

No silent fallback to a second provider.

No retries in the first slice.

## Input limits

- JSON only;
- max request body 4 KiB;
- one term/short idiom;
- max 100 characters;
- only `en↔ur`;
- no auto-detect;
- unknown keys fail closed.

## Response rules

Normalize provider data. Never proxy raw Microsoft JSON to the browser.

Maximums:

- 8 target entries;
- 6 back-translations per entry.

Public response contains:

- `source`
- `from`
- `to`
- normalized `entries`
- `synonyms`
- `synonymStatus`

Do not expose provider alias, upstream URLs, credentials or raw errors.

`entries: []` is a valid successful not-found result.

## Browser rules

- lookup only after explicit form submit;
- direction change clears stale results;
- input/result labels and directionality update with language;
- disable input/direction/clear while request is in flight;
- provider/user text rendered with DOM `textContent`, not `innerHTML`;
- no content logging or content telemetry;
- do not add editor handoff/account/export/batch transliteration in this slice.

## Synonym behavior

If `synonyms` is empty, show a neutral note explaining that verified same-language synonyms are not available yet.

If future work populates synonyms, it must include an approved provenance contract before changing UI language.

## Validation

Before merge:

```bash
node tests/dictionary-foundation.test.mjs
npm test
```

Then require the normal repository Quality workflow, including:

- static shell/SEO validation;
- route/product governance;
- InPage acceptance;
- focused product browser acceptance;
- current mobile/editor/Voice regressions;
- production visual-quality audit.

## Merge gate

Do not merge on a red workflow.

After merge, do not enable production dictionary lookup until a live quality pass has reviewed common English/Urdu words, polysemy, verbs/nouns, formal terms and short idioms.

Enabling lookup is separate from indexing/promoting the page.
