# WU-INPUT-001F — Live Quality & Activation Gate

**Parent:** `WU-INPUT-001`
**Depends on:** `WU-INPUT-001A` through `WU-INPUT-001E`
**Status:** Acceptance foundation complete; live provider and device evidence pending
**Date:** 2026-09-11
**Scope:** quality, cost, privacy and activation evidence for existing preview capabilities

## 1. Decision

Do not add another major input feature and do not enable any current feature gate yet.

This slice turns the existing translation, Voice Translator, audio transcription and dictionary previews into independently reviewable release candidates. Automated contracts prove safety boundaries; live provider and device evidence determines whether each capability is useful enough to enable.

Activation is per capability and direction. A passing code suite is necessary but does not prove language quality, browser speech quality, account headroom or provider readiness.

## 2. Protected product boundaries

This slice must not change:

- homepage Roman Urdu → Urdu behavior;
- Google Input Tools/transliteration behavior;
- Basic Writer or Rich Editor controls;
- existing Urdu Voice Typing behavior;
- global navigation or sitemap ownership;
- preview routes from `noindex,follow`;
- server-owned provider selection;
- 5-minute/6 MiB audio preview bounds;
- back-translations into synonyms.

No provider key, user recording, private transcript, private lookup or private translation belongs in source control, logs or analytics.

## 3. Evidence states

Every activation row uses one of four evidence states:

- `pass`: required evidence exists and meets its threshold;
- `fail`: evidence exists and misses its threshold;
- `unavailable`: required external credential, account view, browser/platform or consented sample is absent;
- `not-run`: runnable work has not been performed.

`unavailable` and `not-run` never count as pass. Unknown evidence fails closed.

Machine-readable plan and current status live under `benchmarks/wu-input-001f/`. Run:

```bash
npm run benchmark:input-activation:check
```

## 4. Translation acceptance

Reuse `benchmarks/wu-input-001a/translation-fixtures.json`; do not create a competing corpus.

Review both `ur-en` and `en-ur` for meaning preservation, naturalness, grammar, proper names, unwanted additions and script correctness. Coverage must include everyday and formal Urdu, messages, names, Pakistani places, dates, amounts, code-switching, punctuation, multiple sentences and ambiguity.

Each provider run records provider/model, UTC time, fixture ID, success/failure and latency. Human review records a 1–5 score for each dimension plus `pass`, `fail` or `manual-review`. Exact-string equality is not an acceptance metric.

Minimum activation evidence per direction:

- all committed starter fixtures for that direction run against the selected production route;
- no provider/request failures in the accepted run;
- every output reviewed by a fluent Urdu reviewer;
- no critical meaning reversal, invented fact, lost amount/date or corrupted proper name;
- at least 90% marked `pass` and no more than 10% `manual-review`;
- current account headroom and provider privacy review recorded.

These are release floors, not claims that the starter corpus is comprehensive. Expand toward the parent target before indexed promotion.

## 5. Voice Translator acceptance

Test `ur-PK` and `en-US` in real supported browsers/platforms. Use realistic spoken samples covering Pakistani conversational Urdu, Pakistani names, Lahore/Karachi/Islamabad, dates, amounts, English nouns inside Urdu, short commands, a longer sentence and pause behavior.

Also prove:

- permission denial is understandable and preserves typed text;
- unsupported browsers show a usable fallback;
- changing direction rebuilds recognition with the correct locale;
- source transcript remains editable;
- no translation request occurs before explicit Translate;
- transcript review remains possible before semantic translation.

Browser/platform speech recognition may use remote platform services. Do not claim microphone processing is wholly on-device without platform-specific proof.

Activation requires a completed device/browser matrix and a passing translation row for the same direction.

## 6. Audio transcription acceptance

Use only owned, consented or appropriately licensed benchmark audio with gold transcripts. Never use production recordings.

Required matrix: clean Urdu, clean English, Pakistani Urdu, Urdu/English code-switching, names/numbers, quiet room, mild noise, phone microphone, compressed voice-note audio, far microphone, short message and longer voice note.

Record word error rate, proper-name and number correctness, missing phrases, unwanted/hallucinated text, request latency, audio minutes and estimated neurons. Silence/low-speech clips require explicit hallucination review.

Activation floor:

- every required matrix category represented;
- every clip has consent/ownership and a gold transcript;
- no critical hallucination in accepted samples;
- names/numbers reviewed separately from aggregate word error rate;
- current account neuron headroom measured;
- 5-minute/6 MiB client and 8 MiB absolute server limits remain unchanged.

Current official Cloudflare pricing evidence checked 2026-09-11: Workers AI includes 10,000 neurons/day at no charge; `@cf/openai/whisper-large-v3-turbo` is listed at 46.63 neurons per audio minute. Dashboard headroom remains account-specific and must be measured before activation.

## 7. Dictionary acceptance

Reuse `benchmarks/wu-input-001a/dictionary-fixtures.json`. Review common nouns, verbs, adjectives, polysemy, short idioms, not-found inputs and both language directions.

Verify alternative meanings, part of speech, ranking, back-translations, malformed responses and empty results. A fluent reviewer must judge whether results fit Pakistani usage.

Microsoft back-translations remain context clues, never verified synonyms. `synonyms` remains empty until a separately approved same-language lexical source has a completed licensing, attribution and provenance design.

Activation requires a live Microsoft Dictionary run, human review, quota/cost confirmation and zero critical fabricated/mislabeled entries.

## 8. Cost and privacy evidence

Provider facts drift. Recheck official sources on every activation review.

Current evidence checked 2026-09-11:

- Cloudflare Workers AI: 10,000 free neurons/day; overage on Workers Paid is currently listed at $0.011/1,000 neurons.
- Cloudflare IndicTrans2 and M2M100: 31,050 neurons per million input tokens and the same per million output tokens.
- Cloudflare Whisper Large V3 Turbo: 46.63 neurons per audio minute in the pricing table.
- Microsoft Translator F0: 2 million characters/month across supported standard translation features.
- Microsoft states Text Translation processes requests without storing customer text.

Official sources:

- `https://developers.cloudflare.com/workers-ai/platform/pricing/`
- `https://developers.cloudflare.com/workers-ai/models/whisper-large-v3-turbo/`
- `https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/translator/data-privacy-security`
- `https://learn.microsoft.com/en-us/azure/ai-services/translator/service-limits`

Account plan, current usage, regional resource configuration and any paid-overage behavior are not inferable from repository code. Record them from provider consoles without committing secrets. Never enable paid/provider usage silently.

## 9. Initial activation matrix

No live credentials, provider-console evidence, consented audio corpus or completed browser/device matrix was available in this repository inspection.

| Capability | Quality | Cost | Privacy | Ready? | Gate |
| --- | --- | --- | --- | --- | --- |
| Text `ur-en` | unavailable | unavailable | partial | no | `INPUT_TRANSLATION_ENABLED` |
| Text `en-ur` | unavailable | unavailable | partial | no | `INPUT_TRANSLATION_ENABLED` |
| Voice `ur-en` | not-run | depends on translation | partial | no | `INPUT_TRANSLATION_ENABLED` |
| Voice `en-ur` | not-run | depends on translation | partial | no | `INPUT_TRANSLATION_ENABLED` |
| Audio Urdu | unavailable | unavailable | partial | no | `AUDIO_TRANSCRIBE_ENABLED` |
| Audio English | unavailable | unavailable | partial | no | `AUDIO_TRANSCRIBE_ENABLED` |
| Dictionary | unavailable | unavailable | partial | no | `DICTIONARY_LOOKUP_ENABLED` |

Recommendation: keep all three gates disabled. This is evidence-based caution, not a negative quality finding.

## 10. Activation procedure

1. Validate offline corpus and contracts.
2. Capture account plan/headroom and provider privacy evidence.
3. Run bounded live provider benchmarks with explicit credentials.
4. Complete fluent human review without changing raw provider output.
5. Complete Voice device/browser and owned-audio matrices.
6. Update `activation-status.json` with evidence paths and decisions.
7. Run the full repository Quality workflow.
8. Enable only rows whose required evidence passes, using server configuration.
9. Keep routes `noindex` until a separate search-ownership decision.

If a shared gate covers two directions, do not enable it when only one direction is acceptable unless a later implementation adds a server-owned direction-specific kill switch.

## 11. Exit criteria

`WU-INPUT-001F` is complete only when each activation row has a recorded decision supported by live evidence, or the founder explicitly defers that row. Until then, offline acceptance infrastructure may merge, but feature gates remain off and OCR expansion does not begin.
