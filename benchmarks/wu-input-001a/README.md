# WU-INPUT-001A benchmark fixtures

This directory is non-production evidence for `WU-INPUT-001A`.

It exists to benchmark **net-new** capabilities without modifying the current Write Urdu editor.

## Files

- `translation-fixtures.json` — starter Urdu↔English semantic-translation cases.
- `dictionary-fixtures.json` — lookup behavior cases; intentionally does not copy a third-party dictionary dataset.
- `audio-fixture-plan.json` — metadata plan for consented benchmark recordings; no real user audio belongs here.
- `validate.js` — zero-dependency structural validator.

## Important boundaries

1. These fixtures are not training data.
2. Do not collect production user text/audio for the benchmark.
3. Do not score translation only by exact string equality.
4. Do not invent dictionary synonyms to make a fixture pass.
5. Do not change the current Roman Urdu/editor implementation from this benchmark.
6. Provider credentials and live provider runners must be separate from committed fixtures.

## Run

```bash
node benchmarks/wu-input-001a/validate.js
```

## Expansion targets

Before provider release selection:

- translation: >=200 human-reviewed fixtures;
- dictionary: >=100 word/sense cases;
- audio: >=100 consented/gold-transcript clips.

The committed starter corpus only proves the benchmark contract and category coverage.
