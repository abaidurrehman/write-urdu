# WU-AI-001A — Urdu model benchmark v1

This directory is the versioned quality gate for the first Write Urdu AI writing actions.

It is deliberately **not** a generic leaderboard. It asks a narrower product question:

> Which provider/model can safely and naturally perform Write Urdu's bounded adult writing actions while preserving meaning and concrete facts?

## Corpus

`corpus.json` contains:

- 15 safe synthetic Urdu passages;
- 8 Phase 1 actions;
- a deterministic 15 × 8 matrix = **120 cases**.

The passages cover:

- grammar/gender errors;
- missing punctuation;
- dense formal Urdu and simplification;
- mixed Urdu/English workplace language;
- dates, times, amounts, email addresses and reference IDs;
- Pakistani names and cities;
- customer support, work, invitation and leave messages;
- multi-fact summarization;
- a quoted-instruction/prompt-injection robustness fixture.

No real user content is included. Do not replace the corpus with production/user text.

## Providers

`providers.json` is a dated provider/model/terms manifest.

As reviewed on 2026-08-25:

- **Mistral Small 4** (`mistral-small-2603`) — runnable benchmark candidate;
- **Groq GPT-OSS 120B** (`openai/gpt-oss-120b`) — runnable benchmark candidate;
- **Cerebras GPT-OSS 120B** — **terms-blocked for this comparison** because the current Cerebras Terms of Use prohibit using the Service for benchmarking or competitive analysis.

Do not remove a `blocked-terms` state merely to make the runner execute. Change it only after a dated terms/contract review clearly resolves the restriction.

## Privacy contract

Every live benchmark request goes through the dedicated Cloudflare AI Gateway and sends:

```http
cf-aig-collect-log-payload: false
cf-aig-skip-cache: true
```

The first keeps Gateway metadata such as provider/model/token/latency information without storing request/response payloads. The second prevents benchmark outputs from being served from or written to the AI Gateway response cache.

Benchmark outputs are written only to local `.benchmark-results/`, which is gitignored.

## Environment

Do not commit keys.

Required:

```text
CLOUDFLARE_ACCOUNT_ID=<Cloudflare account id>
CLOUDFLARE_AI_GATEWAY_ID=write-urdu-ai   # optional; manifest default is used otherwise
MISTRAL_API_KEY=<provider key>
GROQ_API_KEY=<provider key>
```

`CEREBRAS_API_KEY` is intentionally not part of the runnable benchmark while its terms status is blocked.

Provider keys remain provider-side BYOK keys passed through AI Gateway. They never belong in browser code.

## Commands

Validate the corpus/provider contract without any network calls:

```bash
npm run ai:benchmark:validate
```

Small smoke run against one provider:

```bash
npm run ai:benchmark -- --provider=mistral --limit=5
npm run ai:benchmark -- --provider=groq --limit=5
```

Run the full currently permitted comparison:

```bash
npm run ai:benchmark -- --provider=all
```

Results are created under:

```text
.benchmark-results/urdu-ai/<run-id>/
  manifest.json
  outputs.jsonl
  review.csv
```

The console intentionally prints case IDs/status/latency but not generated Urdu text.

## Human review

The runner creates `review.csv`. A fluent Urdu reviewer scores every successful output from 1–5 on:

1. `meaning_1_5` — intended meaning preserved;
2. `natural_urdu_1_5` — natural Pakistani Urdu rather than literal/awkward phrasing;
3. `action_fit_1_5` — actually performs Fix/Improve/Simplify/etc.;
4. `grammar_1_5` — grammatical, readable Urdu;
5. `preservation_1_5` — names, dates, numbers, amounts, codes and required English terms preserved.

Also set:

```text
hallucination_0_1
```

where `1` means the output invented a material fact, reason, person, date, commitment or event.

Reviewer notes are free text. Do not put real personal/user information into notes.

## Automatic checks

Before human scoring the runner flags:

- empty output;
- missing hard-preservation tokens;
- following the quoted `OK` injection fixture;
- assistant-style prefaces;
- weak Urdu-script ratio;
- obvious length-direction failures for Shorten/Summarize/Expand.

Only the first three are hard automatic failures in v1. The other checks are diagnostics because Urdu quality and action fidelity require human judgment.

## Scorecard

After filling `review.csv`:

```bash
npm run ai:benchmark:score -- --run-id=<run-id>
```

This writes:

```text
scores.json
scorecard.md
```

A provider is not eligible to win until:

- human review completion ≥ 90%;
- request success ≥ 98%;
- automatic preservation pass ≥ 95%;
- human case pass ≥ 85%;
- hallucination rate ≤ 2%.

A case passes human quality when:

- the automatic hard checks pass;
- hallucination = 0;
- meaning ≥ 4;
- preservation ≥ 4;
- average of the five human dimensions ≥ 4.0.

Latency and token usage are reported but **quality is the primary gate**. A faster/cheaper model does not win by compensating for bad Urdu.

## Reproducibility

The run manifest records:

- corpus version;
- exact provider/model IDs;
- case count;
- privacy headers;
- a SHA-256 hash of the shared system prompt + action definitions.

Do not silently change the corpus, prompts or model aliases between candidates in the same comparison. If those inputs change materially, create a new benchmark version or a new run with all candidates rerun.

## Sources revalidated for v1

Cloudflare AI Gateway:

- https://developers.cloudflare.com/ai-gateway/usage/providers/mistral/
- https://developers.cloudflare.com/ai-gateway/usage/providers/groq/
- https://developers.cloudflare.com/ai-gateway/usage/providers/cerebras/
- https://developers.cloudflare.com/ai-gateway/observability/logging/
- https://developers.cloudflare.com/ai-gateway/features/caching/

Models/terms:

- https://docs.mistral.ai/models/mistral-small-4-0-26-03
- https://legal.mistral.ai/terms/commercial-terms-of-service
- https://console.groq.com/docs/model/openai/gpt-oss-120b
- https://console.groq.com/docs/legal/services-agreement
- https://console.groq.com/docs/your-data
- https://inference-docs.cerebras.ai/models/overview
- https://www.cerebras.ai/terms-of-service
