# WU Urdu AI — Orchestrator Skill

Use this skill for `WU-AI-001` planning or implementation.

## Canonical skill

Read first:

```text
skills/urdu-ai-writing/SKILL.md
```

Then follow its read order and slice discipline.

## Epic sources

```text
specs/WU-AI-001-urdu-ai-writing-assistant-platform.md
docs/WU-AI-001-URDU-AI-DEMAND-RESEARCH-2026-08-24.md
```

## Core rule

AI is an **optional transformation layer on the real Write Urdu editor state**.

Never:

- replace the existing English-letter → Urdu engine with an LLM;
- create a generic chatbot as the feature;
- persist user writing in telemetry/Gateway payload logs;
- put provider keys in browser code;
- let an AI outage break normal writing;
- add thin AI SEO routes during the core implementation slices.

## Slice order

```text
WU-AI-001A  benchmark + provider/terms gate
WU-AI-001B  shared transformation service
WU-AI-001C  core editor actions
WU-AI-001D  Roman/English-letter Urdu polish
WU-AI-001E  adult work/life continuations
WU-AI-001F  voice/OCR/document integrations
WU-AI-001G  evidence-led acquisition
```

Do not skip `001A` and choose a production model from reputation alone.

## Current planning shortlist

As of 2026-08-24 research:

```text
Mistral Small 4         primary benchmark candidate
Groq GPT-OSS 120B       strong candidate/fallback
Cerebras GPT-OSS 120B   challenger
Gemini Flash            quality-control only; current age terms block production approval
```

Re-check official provider and Cloudflare docs before implementation. These facts are deliberately not permanent contracts.

## Privacy release blocker

Every user-writing request through Cloudflare AI Gateway must prove payload logging is disabled, currently via:

```http
cf-aig-collect-log-payload: false
```

Keep metadata; do not persist prompt/response bodies.

Default to no cache for user writing.

## Age boundary

Normal Write Urdu remains available normally.

AI requires the parent spec's first-use 18+ acknowledgement.

Do not treat that acknowledgement as a universal provider-terms workaround.

## Required checks

Use the canonical skill plus current repo commands. At minimum:

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```
