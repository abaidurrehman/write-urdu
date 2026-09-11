# WU-INPUT-001A — Standalone Language & Voice Benchmark Skill

Use this skill when implementing or evaluating Slice 0 of `WU-INPUT-001`.

## Mandatory read order

1. `specs/WU-INPUT-001-multimodal-urdu-input-conversion-platform.md`
2. `specs/WU-INPUT-001A-standalone-language-voice-capability-benchmark.md`
3. `docs/WU-INPUT-001A-CAPABILITY-RESEARCH-2026-09-11.md`
4. `specs/WU-PLAT-002H-SCOPE-FREEZE.md`
5. current `WU-VOICE-PLAT-001` owner/implementation
6. `functions/api/document-translate.js`
7. `js/voice-input-core.js`
8. `benchmarks/wu-input-001a/README.md`
9. benchmark fixture JSON files
10. `benchmarks/wu-input-001a/validate.js`

Search the current repository before coding; runtime and tests are authoritative.

## Hard boundary

**Do not change the current editor in Slice 0.**

Do not alter:

- homepage typing/transliteration behavior;
- Roman Urdu candidate behavior;
- Basic/Rich editor UI;
- existing editor Voice controls;
- existing query ownership;
- production routes merely to demo a benchmark.

If a proposed benchmark needs a production UI change, stop and keep it in a non-production harness.

## Priority order

1. Urdu↔English Voice Translator architecture/benchmark
2. Audio/Voice Note→Text + Translate benchmark
3. shared bidirectional semantic translation benchmark
4. Dictionary/Meaning/Synonyms benchmark
5. spoken translation output later

## Translation rule

Never confuse:

- Roman Urdu transliteration; and
- semantic Urdu↔English translation.

`english to urdu typing` remains protected search/product intent.

## Provider discipline

No provider wins from documentation claims.

Benchmark:

- Microsoft Translator;
- Cloudflare M2M100;
- IndicTrans2 for English→Urdu;
- Whisper for audio.

Do not commit credentials.

Do not call providers from normal tests.

Live provider runners, if later added, must be opt-in and fail clearly when credentials/bindings are absent.

## Dictionary discipline

Prefer reference-backed lexical data.

- Microsoft Dictionary may supply bilingual alternatives/POS/examples.
- Same-language synonyms require a verified lexical source.
- Do not generate unverified synonyms with an LLM.
- Wiktionary/Kaikki is research-only until licensing/attribution design is approved.
- Keep provenance attached to every merged sense.

## Audio discipline

Never use production user audio as benchmark material.

Use:

- explicit-consent recordings;
- owned test recordings;
- or appropriately licensed synthetic/test audio.

Maintain gold transcripts.

Measure WER plus human intelligibility; do not rely on a single automatic metric.

## Privacy

No content in Product Pulse.

Benchmark result reports may contain the committed synthetic/manual fixture text, but never private production text/audio.

## Before implementation

Run:

```bash
node benchmarks/wu-input-001a/validate.js
```

Then record:

- provider/model/date;
- official terms/pricing date;
- corpus version;
- success/failure;
- latency;
- cost/quota units;
- human review scores.

## Slice 0 exit

Slice 0 is complete only when:

- fixture validator passes;
- provider evidence is current;
- benchmarks are runnable without production UI;
- current editor files are untouched;
- an explicit go/no-go is recorded separately for Voice Translator, Audio-to-Text and Dictionary.
