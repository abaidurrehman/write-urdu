# WU-INPUT-001A benchmark fixtures

This directory is non-production evidence for `WU-INPUT-001A`.

It exists to benchmark **net-new** capabilities without modifying the current Write Urdu editor.

## Files

- `translation-fixtures.json` — starter Urdu↔English semantic-translation cases.
- `dictionary-fixtures.json` — lookup behavior cases; intentionally does not copy a third-party dictionary dataset.
- `audio-fixture-plan.json` — metadata plan for consented benchmark recordings; no real user audio belongs here.
- `validate.js` — zero-dependency structural validator.
- `run-live.js` — explicit opt-in live runner for Microsoft translation/dictionary and Cloudflare translation candidates.

## Important boundaries

1. These fixtures are not training data.
2. Do not collect production user text/audio for the benchmark.
3. Do not score translation only by exact string equality.
4. Do not invent dictionary synonyms to make a fixture pass.
5. Do not change the current Roman Urdu/editor implementation from this benchmark.
6. Provider credentials must stay in environment variables; never commit them.
7. `run-live.js` sends only committed benchmark fixtures and runs only when a developer explicitly invokes it.

## Validate the local corpus

```bash
node benchmarks/wu-input-001a/validate.js
```

## Optional live translation benchmark

### Microsoft Translator

Environment:

```text
AZURE_TRANSLATOR_KEY
AZURE_TRANSLATOR_REGION        # optional for a global single-service resource
AZURE_TRANSLATOR_ENDPOINT      # optional; defaults to api.cognitive.microsofttranslator.com
```

Run:

```bash
node benchmarks/wu-input-001a/run-live.js --mode=translation --provider=microsoft
```

### Cloudflare M2M100

Environment:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

Run:

```bash
node benchmarks/wu-input-001a/run-live.js --mode=translation --provider=cloudflare-m2m100
```

### Cloudflare IndicTrans2 — English→Urdu only

```bash
node benchmarks/wu-input-001a/run-live.js --mode=translation --provider=cloudflare-indictrans2
```

## Optional live dictionary benchmark

```bash
node benchmarks/wu-input-001a/run-live.js --mode=dictionary --provider=microsoft
```

The runner emits JSONL to stdout. Use `--output=path/to/result.jsonl` to also write a local result file, and `--limit=N` for a bounded smoke run.

Live outputs are evidence, not automatic acceptance. Translation and lexical quality still require human Urdu review.

## Expansion targets

Before provider release selection:

- translation: >=200 human-reviewed fixtures;
- dictionary: >=100 word/sense cases;
- audio: >=100 consented/gold-transcript clips.

The committed starter corpus only proves the benchmark contract and category coverage.
