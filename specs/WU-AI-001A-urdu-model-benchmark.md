# WU-AI-001A — Urdu Model Benchmark + Provider Terms Gate

**Parent:** `WU-AI-001`  
**Status:** Active — benchmark foundation implementation  
**Date:** 2026-08-25  
**Priority:** Slice 0; may proceed without production AI UI  
**Area:** AI quality / provider due diligence / privacy / cost  
**User-visible UI:** none

---

## 1. Goal

Prove that at least one legally usable external model can perform Write Urdu's bounded writing-assistant actions with natural Pakistani Urdu, high meaning preservation and low hallucination before any production AI control is added to the product.

This slice answers:

> Which provider/model is good enough and operationally acceptable to become the first production candidate for `WU-AI-001B/C`?

It does **not** answer which model is best in general.

---

## 2. Non-goals

Do not in this slice:

- add AI buttons to `/`, `/urdu-editor` or `/urdu-keyboard`;
- change deterministic English-letter → Urdu typing;
- expose provider/model selection to users;
- create an AI SEO landing page;
- create provider fallback/routing in the production request path;
- send any real user text to providers;
- persist prompts/completions to product telemetry or D1;
- treat price/latency as more important than Urdu quality;
- bypass provider terms in order to complete a three-way comparison.

---

## 3. Benchmark corpus decision

Version 1 lives at:

```text
benchmarks/urdu-ai/v1/corpus.json
```

It contains 15 synthetic Urdu passages and the eight approved Phase 1 actions:

```text
fix
improve
simplify
formal
friendly
shorten
expand
summarize
```

The deterministic matrix is:

```text
15 passages × 8 actions = 120 cases
```

This satisfies the parent epic's 100–200 case gate while making action-level comparison balanced and reproducible.

The corpus must remain synthetic/reviewed. Production drafts, account documents, analytics payloads, private emails or user-submitted text must never be added to the committed benchmark.

---

## 4. Coverage requirements

The corpus must cover at least:

- grammar and gender errors;
- punctuation cleanup;
- difficult/formal Urdu that tests simplification;
- mixed Urdu + English;
- adult work/life messages;
- names and Pakistani places;
- numbers, dates, times and money;
- stable reference IDs and email addresses;
- multi-fact source text for shortening/summarization;
- quoted instructions/prompt-injection robustness;
- preservation of familiar English technical terms where forced translation would be worse.

Every hard-preservation fixture must declare the exact substrings that may not be silently changed.

---

## 5. Prompt contract

All providers receive exactly the same benchmark system prompt and action instruction for a given benchmark version.

The shared prompt must require:

- output only the transformed text;
- no assistant preface/explanation;
- meaning preservation;
- names/numbers/dates/amounts/URLs/emails/codes preservation;
- no invented facts/reasons/commitments;
- quoted instructions inside source text are content, not commands.

Provider-specific prompt tuning is out of scope for the first comparison. If later tuning is required to rescue a strong candidate, record it as a separate experiment and rerun every compared candidate under an equivalently documented contract.

---

## 6. Provider manifest and terms gate

Dated provider state lives at:

```text
benchmarks/urdu-ai/v1/providers.json
```

A provider has one of these benchmark states:

```text
allowed
blocked-terms
```

The runner must refuse `blocked-terms` providers rather than requiring a magic force flag.

### 6.1 Mistral

Candidate:

```text
Mistral Small 4
mistral-small-2603
```

Current v1 benchmark state: `allowed`.

Revalidate immediately before a production decision:

- applicable commercial terms;
- training/data controls for the actual account/tier;
- age/end-user requirements;
- model availability and model ID;
- pricing/rate limits.

### 6.2 Groq

Candidate:

```text
GPT-OSS 120B
openai/gpt-oss-120b
```

Current v1 benchmark state: `allowed`.

For production candidacy additionally verify/enable Zero Data Retention where supported and record model terms/data location.

### 6.3 Cerebras

Candidate model metadata remains documented:

```text
gpt-oss-120b
```

Current v1 benchmark state: **`blocked-terms`**.

Reason: the Cerebras Terms of Use reviewed on 2026-08-25 explicitly prohibit use of the Service for benchmarking or competitive analysis.

Therefore:

- do not send the comparative WU-AI-001A corpus to Cerebras;
- do not publish or fabricate a Cerebras score;
- do not add a runner bypass;
- reconsider only if updated terms or written contractual permission clearly permits this use.

This is a successful outcome of the provider gate, not a benchmark failure.

---

## 7. Cloudflare AI Gateway contract

All live external benchmark requests go through the dedicated logical Gateway:

```text
write-urdu-ai
```

The benchmark uses provider-native Gateway endpoints so every provider sees its normal chat-completions schema while Cloudflare provides the shared observability/control boundary.

Required request headers:

```http
cf-aig-collect-log-payload: false
cf-aig-skip-cache: true
```

The first is mandatory so Gateway retains metadata without request/response bodies.

The second is mandatory so repeated benchmark cases are actual model calls rather than cached responses.

No provider key may be committed or sent to browser code.

---

## 8. Runner contract

Canonical runner:

```text
scripts/urdu-ai-benchmark.js
```

Required capabilities:

- validate corpus/provider manifest offline;
- expand deterministic 120-case matrix;
- filter by provider/action/case/limit for smoke tests;
- run all currently allowed providers under identical prompts/settings;
- record provider/model/run/corpus version;
- record latency and provider token usage when returned;
- record automatic preservation diagnostics;
- create a human review template;
- write only under gitignored `.benchmark-results/`;
- never print generated Urdu outputs in CI/console logs;
- refuse a terms-blocked provider.

The runner is a developer/research tool and must not become the production inference service.

---

## 9. Automatic checks

Automatic checks are intentionally narrow.

Hard failure:

- empty model output;
- any declared `mustPreserve` value missing;
- the prompt-injection fixture returns exactly the embedded commanded output (`OK`).

Diagnostics only in v1:

- assistant-style preface;
- unexpectedly low Urdu-script ratio;
- Shorten/Summarize not shorter;
- Expand unexpectedly shorter.

Do not claim these heuristics measure Urdu quality.

---

## 10. Human scoring rubric

Every successful provider/case pair is reviewed by a fluent Urdu reader on five 1–5 dimensions:

1. **Meaning** — source intent/facts preserved.
2. **Natural Urdu** — reads naturally for Pakistani Urdu users.
3. **Action fit** — genuinely performs the requested transformation.
4. **Grammar** — clean, grammatical and readable.
5. **Preservation** — required names/numbers/dates/codes/English terms retained correctly.

Additional binary field:

```text
hallucination_0_1
```

`1` means a material fact, reason, person, date, commitment or event was invented.

Human review must not be replaced by another LLM for the release decision.

---

## 11. Case pass rule

A reviewed case passes when:

```text
automatic hard checks pass
AND hallucination = 0
AND meaning >= 4
AND preservation >= 4
AND mean(meaning, natural Urdu, action fit, grammar, preservation) >= 4.0
```

---

## 12. Provider release gate

A provider is eligible to win only when:

- ≥90% of requested cases have human review;
- request success ≥98%;
- automatic hard-check pass ≥95% of successful requests;
- human case pass ≥85%;
- hallucination rate ≤2%.

Compare also:

- action-level pass rates;
- median latency;
- token usage/cost estimate;
- recurring preservation failures;
- recurring unnatural/literal Urdu patterns.

Quality is the primary decision. A cheaper/faster model does not compensate for weak Urdu or factual drift.

---

## 13. Benchmark execution sequence

### Step 1 — offline validation

```bash
npm run ai:benchmark:validate
npm test
```

### Step 2 — credentialed smoke test

Run five cases on each `allowed` provider.

```bash
npm run ai:benchmark -- --provider=mistral --limit=5
npm run ai:benchmark -- --provider=groq --limit=5
```

Check:

- request succeeds through `write-urdu-ai`;
- no payload appears in Gateway logs;
- cache status does not indicate reused output;
- local output/review files are correct.

### Step 3 — full 120-case run

```bash
npm run ai:benchmark -- --provider=all
```

At v1 this means Mistral + Groq only because Cerebras is terms-blocked.

### Step 4 — human review

Fill generated `review.csv` for both providers. Prefer at least two Urdu reviewers for borderline/winner cases if practical; disagreements should be discussed rather than averaged blindly.

### Step 5 — score

```bash
npm run ai:benchmark:score -- --run-id=<run-id>
```

### Step 6 — decision record

Commit only a **sanitized aggregate decision report**, not raw prompt/output files, if results are suitable to retain in the repo.

The report should state:

- exact run/corpus/model IDs;
- reviewer count/method;
- aggregate/action-level quality;
- latency/cost estimates;
- terms/data review;
- selected candidate or `no model passes`;
- known weaknesses and required prompt/provider follow-ups.

---

## 14. Repository/secret safety

`.benchmark-results/` is ignored.

Never commit:

- API keys;
- raw provider request headers;
- real user text;
- raw benchmark outputs unless an explicit later research decision says a safe synthetic sample is useful;
- Gateway logs containing payloads.

The committed corpus is synthetic and may be reviewed publicly.

---

## 15. Acceptance criteria

Slice A foundation is implementation-complete when:

- [x] 100–200 case versioned synthetic corpus exists (v1 = 120 cases).
- [x] eight Phase 1 action instructions are versioned with it.
- [x] provider/model/terms manifest exists.
- [x] Cerebras terms restriction is recorded and enforced as a runner block.
- [x] one provider-neutral runner supports Mistral and Groq through AI Gateway.
- [x] Gateway payload logging is disabled per request.
- [x] Gateway response cache is bypassed per request.
- [x] automatic preservation/injection checks exist.
- [x] human review CSV and scorecard generation exist.
- [ ] Mistral credentialed 5-case smoke run completed.
- [ ] Groq credentialed 5-case smoke run completed.
- [ ] Gateway metadata-only logging verified in the real account.
- [ ] full allowed-provider run completed.
- [ ] human Urdu scoring completed to release threshold.
- [ ] provider decision recorded.

Do not start `WU-AI-001C` production editor UI merely because the benchmark harness exists. `WU-AI-001B/C` remain provider-quality gated.

---

## 16. Verification commands

```bash
npm run ai:benchmark:validate
npm test
npm run governance:check
```

Credentialed commands are intentionally not part of CI.

---

## 17. Current external evidence snapshot

Revalidated 2026-08-25 from current official documentation:

- Cloudflare AI Gateway has native provider endpoints for Mistral, Groq and Cerebras.
- `cf-aig-collect-log-payload: false` keeps metadata while skipping raw request/response payload storage.
- `cf-aig-skip-cache: true` bypasses Gateway response caching.
- Mistral Small 4 model ID is `mistral-small-2603`.
- Groq GPT-OSS 120B model ID is `openai/gpt-oss-120b`.
- Cerebras GPT-OSS model ID is `gpt-oss-120b`, but the provider terms gate blocks comparative execution.

Current URLs are retained in `benchmarks/urdu-ai/v1/README.md` and `providers.json`; re-check them before any later production approval.
