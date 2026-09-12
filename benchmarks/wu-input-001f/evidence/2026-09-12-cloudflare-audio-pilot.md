# Cloudflare Urdu audio pilot evidence — 2026-09-12

## Scope

This record captures one intentional Urdu transcription benchmark against Cloudflare Workers AI. It is pilot evidence only. No audio bytes, API credentials or production user content are committed.

## Live result

- provider: Cloudflare Workers AI;
- model: `@cf/openai/whisper-large-v3-turbo`;
- language hint: `ur`;
- task: `transcribe`;
- source size: 1,074,715 bytes;
- recognized duration: 30.9 seconds;
- returned words: 94;
- provider latency: 5,547 ms;
- total runner latency: 5,559 ms;
- request result: `ok: true`.

Sanitized result JSON SHA-256:

`676241E09D46ACFDBF84A5CF1EE90D5F25453ACA495B490ADE00DD8885631C7D`

The raw result remains outside source control.

## Human review

The founder confirmed these five recognition-error groups:

| Recognized | Intended |
| --- | --- |
| `سرین` | `ذہین` |
| `موشی بہران` | `معاشی بحران` |
| `موشی بیچینی` | `معاشی بے چینی` |
| `پہلی` | `پہیلی` |
| `پھڑ جاتا` | `پھٹ جاتا` |

For a reproducible pilot score, punctuation was removed, text was split on whitespace and Levenshtein word edits were measured against the founder-confirmed correction. The reference contains 95 words, the hypothesis contains 94 words and the five error groups require eight word edits. Pilot WER is therefore 8.42%.

No critical invented sentence was observed. Overall meaning remained understandable, but the repeated failure on `معاشی` and the incorrect key phrase `معاشی بحران` are material lexical errors. The founder judged the pilot result acceptable enough to continue benchmarking; this does not convert the Urdu audio activation row to pass.

## Cost and privacy boundary

At 30.9 seconds, this request represents approximately 0.515 audio minutes. Using the rate already recorded in the activation specification, it is approximately 24.0 neurons. Current account-level neuron use and headroom have not yet been captured, so cost remains partial.

The benchmark was explicitly invoked against a local operator-selected file. The permanent evidence set still needs an explicit ownership, consent or licensing record for every accepted clip. Privacy therefore remains partial.

## Decision

`audio-ur` advances from unavailable to partial quality evidence. `AUDIO_TRANSCRIBE_ENABLED` remains off.

Before activation, complete the required matrix for clean Urdu, clean English, Pakistani Urdu, code-switching, names and numbers, mild noise, phone-compressed audio, far microphone, longer voice note and silence or low speech. Each clip needs a gold transcript and provenance record. Capture current Workers AI account headroom separately.
