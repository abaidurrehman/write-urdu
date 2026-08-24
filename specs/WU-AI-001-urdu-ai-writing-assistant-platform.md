# WU-AI-001 — Urdu AI Writing Assistant Platform

**Product:** Write Urdu  
**Feature ID:** `WU-AI-001`  
**Status:** Planned — founder-approved, benchmark-gated  
**Priority:** P1 candidate; Slice 0 may proceed without displacing active P0 work  
**Date:** 2026-08-24  
**Area:** Write / AI-assisted Urdu correction, rewriting and comprehension  
**Primary integration routes:** `/`, `/urdu-editor`, `/urdu-keyboard`  
**Dedicated SEO route:** none in Phase 1; evidence-gated later  
**Research:** `docs/WU-AI-001-URDU-AI-DEMAND-RESEARCH-2026-08-24.md`  
**Journey dependency:** `WU-PLAT-002`  
**Core workspace dependency:** `WU-PLAT-003` / `WU-PLAT-004`  
**Input dependency:** `WU-VOICE-PLAT-001` for later voice continuation only  
**Document dependency:** `WU-DOC-001` for later document continuation only  
**Template dependency:** `WU-TPL-001` for later template refinement only  
**Locale dependency:** `WU-I18N-001`  
**Telemetry dependency:** `WU-ANALYTICS-001`

---

## 1. Executive decision

Build a provider-neutral **Urdu writing-assistant layer inside the existing Write Urdu writing state**.

Do not build a generic chatbot.

Do not replace the proven English-letter → Urdu typing engine with an LLM.

The product contract is:

```text
Type / paste / capture Urdu
          ↓
keep one owning editor state
          ↓
explicitly choose an AI writing action
          ↓
preview a proposed result
          ↓
replace / insert / copy / keep original
          ↓
continue writing / format / export / share
```

The first user-visible actions are bounded transformations:

- **Fix Urdu**;
- **Improve**;
- **Make simpler**;
- **Formal**;
- **Friendly**;
- **Shorten**;
- **Expand**;
- **Summarize**.

Contextual later actions:

- **Polish this Urdu** after English-letter/Roman Urdu conversion;
- **Translate to Urdu** for bounded selected English text.

AI remains optional. Core typing, direct Urdu input, voice input, deterministic templates, editing and local writing must still work when every AI provider is unavailable.

---

## 2. Product thesis

Write Urdu already has the high-value upstream behavior: people arrive to type/write Urdu, often using English letters.

`WU-SEO-ETU-001` records the 19 August 2026 Search Console hierarchy:

- `english to urdu typing` — 26,997 impressions;
- `urdu typing` — 10,279 impressions;
- `urdu writing` — 5,267 impressions;
- `urdu typing online` — 3,498 impressions;
- `roman urdu to urdu` — 3,064 impressions.

The AI opportunity is therefore not to acquire an unrelated “AI” audience. It is to solve the next job after typing:

> **I have Urdu text. Help me make it correct, clear and appropriate for what I need to do.**

The durable loop is:

```text
English letters → Urdu → fix / simplify / improve → use the result
```

This is differentiated by Write Urdu's existing writing journey, not by access to a particular model.

---

## 3. Research decision summary

The companion research found three particularly strong signals.

### 3.1 Hindi products validate the integrated workflow

Current Hindi/Hinglish products increasingly combine:

- Latin-letter typing → native script;
- grammar and spelling;
- mixed-language handling;
- tone/formality;
- rewrite;
- export;

inside one editor.

Write Urdu should adopt that workflow pattern rather than creating eight separate AI tool pages.

### 3.2 Urdu simplification is relatively under-tapped

Urdu text simplification remains a low-resource research problem. It is both practically useful and more distinctive than another generic paraphraser.

`Make simpler` is therefore a first-class action, not a hidden mode.

### 3.3 Urdu AI exists, but the market is fragmented

Current Urdu products expose grammar, spell check, summarization, paraphrase and Roman Urdu conversion. The opening is not absence of competition; it is the lack of a clearly dominant, mature Urdu-first workflow that begins with everyday typing and keeps correction/rewrite inside the same writing state.

See the research doc for source ledger and provider/competitor details.

---

## 4. User jobs

Primary adult user jobs:

1. `I typed Urdu using English letters. Make the result read naturally.`
2. `Fix the Urdu I wrote without changing what I mean.`
3. `Tell me what needs correcting before I send this.`
4. `Make this difficult Urdu easier to understand.`
5. `Make this message more formal/respectful.`
6. `Make this text friendly and natural.`
7. `Shorten this without losing the main point.`
8. `Expand this so it is clearer, but don't invent facts.`
9. `Summarize this Urdu paragraph into a short version or key points.`
10. `Translate this selected English text into natural Urdu, then let me edit it.`

Later continuations:

11. `Clean up the Urdu I just dictated.`
12. `Simplify or summarize text extracted from a document.`
13. `Refine a deterministic Urdu template for my specific situation.`

---

## 5. Scope boundary

### 5.1 In scope

- explicit user-invoked text transformations;
- selected-text and bounded document/paragraph scope;
- Urdu and mixed Urdu/English input;
- contextual Roman Urdu/English-letter cleanup after deterministic conversion;
- preview before destructive replacement;
- replace, insert below, copy, keep original and undo;
- a shared provider-neutral server service;
- dedicated Cloudflare AI Gateway for Write Urdu;
- provider benchmark and fallback architecture;
- 18+ AI feature boundary;
- privacy-safe usage/cost telemetry;
- later integration with existing voice/document/template products.

### 5.2 Out of scope for Phase 1

- generic chatbot;
- autonomous document authoring;
- web research/search answers;
- school homework/essay-answer generation;
- AI detector;
- “humanizer” for bypassing AI detection;
- plagiarism claims without a real indexed/licensed corpus;
- image generation;
- speech recognition replacement;
- OCR implementation;
- full file/document translation (owned by `WU-DOC-001`);
- provider/model picker for end users;
- new account/database requirement;
- persistent prompt/completion history;
- a separate AI editor that duplicates the existing workspace.

---

## 6. Route ownership and SEO boundary

### 6.1 Phase 1 has no new SEO owner route

The assistant ships first as a capability inside existing writing owners:

```text
/
/urdu-editor
/urdu-keyboard
```

Do not create:

```text
/ai-urdu-writer
/urdu-ai-writer
/urdu-paraphraser
/urdu-text-rewriter
/urdu-tone-changer
```

as thin pages merely because toolbar actions exist.

### 6.2 Preserve existing search ownership

`/` remains the owner for:

- English to Urdu typing;
- Urdu typing;
- Urdu writing;
- typing Urdu with English letters.

The AI toolbar must not replace the first-screen typing task, slow its initialization or rewrite acquisition copy around “AI.”

### 6.3 Evidence-gated future routes

A dedicated owner may be justified later if both product usage and search evidence show a distinct job. Strong research candidates are:

- Urdu grammar checker;
- make Urdu simpler / simple Urdu;
- Roman Urdu grammar/correction.

A future route must provide a real task-specific workspace/experience and internal continuity, not clone the same generic AI textarea for keyword variants.

---

## 7. User-visible language

Use simple action language.

Preferred:

- Fix Urdu
- Improve
- Make simpler
- Formal
- Friendly
- Shorten
- Expand
- Summarize
- Polish this Urdu
- Translate to Urdu

Do not expose as primary product language:

- LLM;
- inference;
- prompt;
- tokens;
- model routing;
- Mistral/Groq/Cerebras/Gemini;
- semantic transformation;
- NLP;
- transliteration.

Provider disclosure belongs in privacy/legal documentation where required, not in the primary authoring UI.

---

## 8. AI age boundary

### 8.1 Product decision

The normal Write Urdu product remains available without an AI age gate.

Before the first external AI request, show a compact, explicit first-use gate:

> **AI writing tools**  
> This feature is for users aged 18 and over. Your text is sent securely to an AI service to create the result. Please don't include sensitive personal information.

Require an explicit action such as:

> **I'm 18+ — continue**

Do not collect date of birth.

Store only the minimum local/session acknowledgement needed to avoid repeating the gate unnecessarily. Do not treat the acknowledgement as identity verification.

After acceptance, a small label may remain near AI controls:

> `AI-powered · 18+`

### 8.2 Important provider-terms rule

The Write Urdu 18+ gate is not a legal workaround for a provider's independent API-client restrictions.

In particular, as of 2026-08-24 Google's Gemini API terms prohibit use as part of an API Client directed toward or likely to be accessed by under-18 users. Write Urdu is a general public writing site, so Gemini remains **benchmark-only / not production-approved** until a later legal/provider review explicitly clears the exact deployment.

### 8.3 Marketing guardrail

Do not market the AI feature as:

- school essay writer;
- homework solver;
- exam answer generator;
- student assignment writer.

Under-18 users retain the deterministic typing/editor/template features.

---

## 9. Provider architecture

### 9.1 Decision

Do not make the new Write Urdu AI product depend on InvoiceCraftly's shared Workers AI free-neuron pool.

Create a dedicated AI Gateway logical boundary:

```text
browser
  ↓
Write Urdu Pages Function / Worker
  ↓
shared AI transformation service
  ↓
Cloudflare AI Gateway: write-urdu-ai
  ↓
provider adapter
  ├── Mistral
  ├── Groq
  ├── Cerebras
  └── approved fallback(s)
```

Workers AI may remain a benchmark/fallback candidate but is not the architectural default for this epic.

### 9.2 Why AI Gateway

Current Cloudflare AI Gateway supports the shortlisted external providers and provides a stable control plane for:

- provider switching;
- retries/fallbacks;
- rate limiting;
- cost/token analytics;
- metadata logging;
- future routing experiments.

The product must not depend on one provider's client SDK in UI code.

### 9.3 Server-only credentials

Provider API keys and Cloudflare AI Gateway credentials must never reach the browser.

Only the Write Urdu server boundary can call providers.

---

## 10. Provider shortlist and release status

Provider/model facts are planning inputs and must be revalidated immediately before implementation/release.

| Candidate | Role | Current planning economics | Production status for epic |
| --- | --- | --- | --- |
| Mistral Small 4 (`mistral-small-2603`) | primary benchmark | $0.15/M input, $0.60/M output | **Candidate** |
| Groq `openai/gpt-oss-120b` | primary/fallback benchmark | $0.15/M input, $0.60/M output | **Candidate** |
| Cerebras `gpt-oss-120b` | latency/capacity challenger | revalidate direct terms/pricing | **Candidate** |
| Gemini Flash family | quality control | cheap, project-dependent limits | **Benchmark-only; not production-approved** |
| DeepSeek | optional later research | inexpensive | **Not prioritized** |

### Mistral release requirement

If Mistral wins, use a production/PAYG configuration with data-training behavior verified for the account. Current Mistral documentation says PAYG API customers are opted out of training by default.

### Groq release requirement

If Groq wins, enable Zero Data Retention where supported and verify the project model permissions/data controls.

### Model churn requirement

Do not put an exact model ID in product UI or business logic outside the provider/model configuration layer. Models can be deprecated independently of the feature.

---

## 11. Privacy and data-handling contract

### 11.1 AI request data

The user explicitly invokes an AI action. Only then may the selected/bounded text be transmitted to the server/provider.

Never transmit AI text:

- on page load;
- on every keystroke;
- merely because a selection changed;
- as part of autocomplete unless a future spec explicitly approves it.

### 11.2 Cloudflare AI Gateway payload logging — release blocker

Every AI request must use:

```http
cf-aig-collect-log-payload: false
```

or a verified gateway-level equivalent plus contract coverage.

This preserves metadata while preventing prompt/response body persistence in AI Gateway logs.

If implementation cannot prove this behavior, do not release.

### 11.3 AI response caching

Default:

```text
no shared response cache for user writing
```

If AI Gateway caching is enabled globally, Write Urdu AI requests must explicitly skip it unless a future privacy review approves a safe cache design.

### 11.4 Product telemetry

Never store:

- input text;
- generated output;
- prompt body;
- user-provided instructions;
- extracted names/content.

Allowed telemetry appears in §21.

### 11.5 Provider retention/training

Before a provider is production-enabled, record in a dated provider manifest:

- applicable terms URL/version/date;
- training behavior;
- retention behavior;
- ZDR/data controls;
- data region if relevant;
- age/minor restrictions;
- commercial-use status;
- current pricing;
- current rate limits.

No provider is “approved forever.”

---

## 12. Canonical task contract

Use stable action IDs independent of button labels/provider prompts.

```text
AiWritingAction =
  | "fix"
  | "improve"
  | "simplify"
  | "formal"
  | "friendly"
  | "shorten"
  | "expand"
  | "summarize"
  | "polish_roman_urdu"
  | "translate_to_urdu";
```

Phase 1 exposes the first eight.

Contextual actions are feature-flagged until their specific benchmark/acceptance gates pass.

---

## 13. Request contract

Logical request shape:

```ts
type AiWritingRequest = {
  version: 1;
  action: AiWritingAction;
  text: string;
  context?: {
    sourceSurface?: "basic" | "rich" | "keyboard";
    sourceLanguageHint?: "ur" | "en" | "roman-ur" | "mixed";
    outputFormat?: "text" | "bullets";
  };
};
```

Do not send:

- account profile data;
- document title unless needed and explicitly approved;
- email address;
- analytics identifiers;
- full page state;
- unrelated document text when selection is sufficient.

### Server validation

Before inference:

- require allowed action ID;
- trim and reject empty input;
- enforce request byte/character/token budget;
- reject unsupported content type;
- require AI age acknowledgement contract where applicable;
- rate limit;
- normalize line endings only where safe;
- never mutate the user's saved/local source state.

---

## 14. Response contract

Logical response:

```ts
type AiWritingResponse = {
  ok: true;
  version: 1;
  action: AiWritingAction;
  result: string;
  meta: {
    requestId: string;
    providerAlias: string;
    modelAlias: string;
    inputTokens?: number;
    outputTokens?: number;
    durationMs?: number;
  };
} | {
  ok: false;
  code:
    | "invalid-input"
    | "too-large"
    | "rate-limited"
    | "provider-unavailable"
    | "timeout"
    | "refused"
    | "invalid-output"
    | "budget-exhausted";
  message: string;
};
```

`providerAlias`/`modelAlias` are for internal telemetry/debugging and need not be displayed to the user.

Never return raw upstream error bodies or secrets.

---

## 15. Transformation invariants

Every task prompt and output validator must preserve these invariants where applicable.

### 15.1 Universal

- output Urdu script for Urdu-target tasks;
- preserve original meaning unless the action explicitly changes length/register;
- do not invent new facts;
- preserve names, dates, numbers, currency and URLs;
- preserve necessary English/proper nouns rather than forcibly translating everything;
- do not add commentary when plain transformed text is requested;
- avoid markdown unless the requested output format is bullets;
- avoid unsolicited headings;
- avoid “As an AI…” style prose.

### 15.2 Fix

- correct errors, not voice/personality;
- make the smallest useful change;
- preserve tone and meaning.

### 15.3 Improve

- improve clarity/naturalness;
- preserve intent and key wording where reasonable;
- do not make casual text bureaucratic.

### 15.4 Simplify

- use easier everyday Urdu;
- preserve facts and relationships;
- retain respectful forms where context requires them;
- prefer clarity over literary vocabulary.

### 15.5 Formal

- make register appropriately respectful/professional;
- do not add ceremonial fluff;
- do not change substantive requests/commitments.

### 15.6 Friendly

- make language natural/conversational;
- do not become disrespectful or overly slang-heavy.

### 15.7 Shorten

- remove repetition and low-value wording;
- retain main message, facts, names, dates and required conditions.

### 15.8 Expand

- clarify what is already present;
- do not fabricate examples, facts, commitments or reasons.

### 15.9 Summarize

- preserve the main point(s);
- output Urdu;
- support `text` or `bullets` only in first release.

---

## 16. UX contract

### 16.1 Entry point

AI is a secondary command surface after the real writing area is visible and usable.

The primary editor must not move below a large AI marketing panel.

Potential affordance:

```text
[ Fix Urdu ] [ Improve ▾ ]
```

or a compact `Improve writing` menu with the approved commands.

Do not expose eight equally prominent large buttons on mobile.

### 16.2 Selection-first behavior

If the user selected text:

> transform the selection

Otherwise:

> transform the bounded current text/paragraph according to surface rules

The UI must make scope understandable before a destructive replace.

### 16.3 Result review

Show:

- proposed Urdu result;
- clear action context (`Suggested fix`, `Simpler version`, etc.);
- **Replace**;
- **Insert below** where supported;
- **Copy**;
- **Keep original**.

A later diff/highlight view may be added for `fix` if it can handle RTL text reliably.

### 16.4 Undo

Replacing source text must integrate with the owning editor's undo/history model or an explicit one-step recovery contract.

### 16.5 Failures

Provider failure must leave source text untouched.

Use product language such as:

> “We couldn't improve this text right now. Your writing is unchanged.”

Do not show raw model/provider names in normal error copy.

---

## 17. Prompt architecture

Prompts are versioned application assets, not inline ad-hoc strings scattered across Functions.

Logical ownership:

```text
functions/lib/ai-writing/
  actions.mjs
  prompts/
    fix.mjs
    improve.mjs
    simplify.mjs
    formal.mjs
    friendly.mjs
    shorten.mjs
    expand.mjs
    summarize.mjs
  providers/
  validate.mjs
  policy.mjs
```

Final paths may adapt to current source organization after inspection.

Each prompt version records:

- stable action ID;
- version number;
- expected output type;
- invariants;
- benchmark version that approved it.

Changing a prompt materially requires rerunning the relevant benchmark subset.

Do not allow arbitrary system-prompt override from the browser.

---

## 18. Provider adapter contract

Logical interface:

```ts
type AiProvider = {
  id: string;
  transform(input: {
    messages: Array<{ role: "system" | "user"; content: string }>;
    maxOutputTokens: number;
    timeoutMs: number;
    requestId: string;
  }): Promise<ProviderResult>;
};
```

The rest of the application must not know whether the request is fulfilled by Mistral, Groq or Cerebras.

Configuration chooses:

- primary provider/model;
- fallback provider/model;
- disabled providers;
- per-environment settings.

Fallback should occur only for technical failure/availability conditions defined in policy. Do not silently retry a provider refusal against another provider to circumvent safety controls.

---

## 19. Cost and abuse controls

Required before public release:

- per-IP and, where available, per-account request limits;
- bounded request size;
- bounded max output tokens;
- total request timeout;
- max retry count;
- hard daily cost/request ceiling;
- provider project-level spending cap where available;
- kill switch/feature flag;
- separate preview/test and production credentials if practical;
- no client-side API key;
- Turnstile only if abuse evidence justifies friction; do not add it preemptively to every normal request.

### Graceful budget exhaustion

When the daily AI budget is exhausted:

- deterministic writing still works;
- show a recoverable AI-unavailable state;
- do not block editor/export/share functionality.

---

## 20. Benchmark contract — Slice 0

No model/provider is selected by reputation alone.

### 20.1 Corpus size

Start with **100–200 human-reviewed cases**.

Version it in the repo without real user/private text.

Use synthetic/public-safe examples only.

### 20.2 Corpus dimensions

Include:

- native Urdu grammar errors;
- spelling/punctuation errors;
- awkward but understandable Urdu;
- difficult/formal Urdu for simplification;
- English-letter/Roman Urdu variants;
- Roman Urdu shorthand;
- Urdu-English code-switching;
- Pakistani names and organizations;
- dates, numbers, money, phone-like numeric strings;
- professional messages;
- casual messages;
- long paragraphs;
- selected English passages for later translation benchmark.

### 20.3 Models

Initial challengers:

1. Mistral Small 4;
2. Groq GPT-OSS 120B;
3. Cerebras GPT-OSS 120B;
4. Gemini Flash family as quality control only, subject to current terms.

A current Workers AI model may be included as a control if it does not create implementation coupling or consume production assumptions.

### 20.4 Human score

For each relevant case, 1–5:

- meaning preservation;
- grammatical correctness;
- natural Pakistani Urdu;
- spelling/script quality;
- code-switch handling;
- names/numbers fidelity;
- task adherence;
- hallucination/addition risk.

Operational measures:

- p50/p95 latency;
- input/output token use;
- cost per request;
- invalid output;
- timeout/error/refusal rate.

### 20.5 Pass/fail gate

Before Slice A/B production work, the chosen primary must:

- have no systematic name/number corruption;
- have no material meaning-change pattern on `fix`/`simplify`;
- achieve agreed human-score thresholds documented with benchmark results;
- have acceptable p95 latency for interactive editing;
- have acceptable projected cost under conservative usage;
- pass current provider terms/data review;
- have at least one viable fallback or an explicit no-fallback decision.

Do not invent a numeric threshold in advance merely to make the test pass. Record distributions first, then set the release bar from the actual corpus with founder/product review.

---

## 21. Telemetry contract

Use `WU-ANALYTICS-001` principles.

Allowed event properties:

```text
action_id
surface_id
provider_alias
model_alias
prompt_version
input_length_bucket
output_length_bucket
input_tokens
output_tokens
duration_ms
cost_estimate
result = success | error | timeout | refused | budget_exhausted
outcome = replace | insert | copy | keep_original | none
```

Age gate telemetry may record:

```text
ai_age_gate_shown
ai_age_gate_accepted
```

Do not record:

```text
birth_date
input_text
output_text
prompt_body
freeform_user_instruction
names/entities from text
```

### Success metrics

- eligible sessions that start an AI action;
- result success rate;
- replace/insert/copy acceptance rate;
- keep-original rate by action;
- repeat use over future eligible sessions;
- continuation to existing editing/export/create/share journeys;
- median cost per successful accepted transformation;
- failure/refusal/timeout rate;
- usage of `simplify` and `fix` relative to generic `improve`.

High usage with low acceptance is a quality failure, not success.

---

## 22. Accessibility / RTL requirements

- AI controls are normal semantic buttons/menu items;
- result regions announce completion via appropriate `aria-live` without rereading the full document unexpectedly;
- keyboard operation covers open menu → choose action → review → accept/cancel;
- focus returns predictably after result action;
- RTL result text uses correct `dir="rtl"`/language semantics;
- mixed English/Urdu content must not visually collapse because of bidi handling;
- mobile target sizes follow existing design-system minimums;
- loading state is textual, not spinner-only;
- no color-only diff meaning;
- if inline diff cannot be made robust for RTL, ship a simpler original/result comparison first.

---

## 23. AdSense boundary

The AI command and result review are part of the active authoring task.

Do not place ads:

- between selected text and AI command;
- inside the AI menu;
- between AI result and Replace/Keep actions;
- in a way that shifts the result controls during generation.

Continue to follow the route-type/ad-boundary contracts from `WU-GROWTH-001` and current `js/ads.js` ownership.

AI usage must not justify denser ads inside active writing.

---

## 24. Locale contract

`WU-I18N-001` remains the owner of crawlable Urdu locale generation.

For shared runtime controls:

- labels must be represented through the existing locale system where applicable;
- Urdu-language labels/copy are deterministic product strings, not generated at runtime;
- do not create a client-translated Urdu locale using an AI API;
- AI-generated user results are user content, not locale source content.

---

## 25. Security requirements

- server-side secrets only;
- allowlist action IDs;
- no arbitrary upstream model name from browser;
- no arbitrary upstream URL/provider from browser;
- request-size limits before provider call;
- response-size limits;
- strict JSON/content parsing;
- sanitize/escape output in HTML contexts; prefer text insertion;
- timeout and abort upstream work;
- rate limits before expensive inference;
- do not log secrets/raw upstream auth headers;
- do not return raw provider stack traces/errors;
- user text is untrusted content and must not become application instructions outside the bounded transformation template.

Prompt-injection inside user writing is handled by designing the model task as a transformation, not an agent with tools. The AI writing service must not have web, database or arbitrary tool access.

---

## 26. Implementation slices

### WU-AI-001A — Slice 0: benchmark + provider/terms gate

**Goal:** prove model quality and terms before production UI integration.

Deliverables:

- versioned safe Urdu benchmark corpus;
- benchmark runner;
- adapters for shortlisted providers;
- human scoring template/results;
- cost/latency report;
- dated provider approval matrix;
- selected primary/fallback or explicit “not ready” decision.

This slice may proceed while the epic is P1 because it is research/enablement, not a production UI commitment.

### WU-AI-001B — shared transformation service

**Goal:** one server contract independent of editor/provider.

Deliverables:

- authenticated server endpoint;
- action registry;
- versioned prompts;
- provider adapter/routing;
- input/output validation;
- payload-log suppression;
- no-cache contract;
- rate/budget controls;
- telemetry metadata;
- feature kill switch.

### WU-AI-001C — core editor actions

**Goal:** prove `Fix`, `Improve`, `Simplify`, tone and length actions in existing writing state.

Deliverables:

- compact AI command entry;
- first-use 18+ gate;
- selection/current-text scope;
- result preview;
- Replace/Insert/Copy/Keep original;
- undo/recovery;
- desktop/mobile/keyboard acceptance.

### WU-AI-001D — English-letter/Roman Urdu polish

**Goal:** turn proven typing demand into a higher-value second action without changing core conversion.

Deliverables:

- optional post-conversion `Polish this Urdu`;
- proper-name/code-switch preservation tests;
- comparison/recovery;
- no AI dependency in typing path.

### WU-AI-001E — adult work/life continuations

**Goal:** refine existing text/templates for practical communication.

Candidates:

- professional message;
- formal request/application;
- community/business notice;
- concise WhatsApp-ready version;
- template refinement.

Requires usage evidence from C/D.

### WU-AI-001F — capture/document integrations

**Goal:** reuse AI transformation service behind existing inputs.

Candidates:

- voice transcript → fix/improve;
- OCR output → fix/improve;
- document text → simplify/summarize.

No duplicate capture pipelines.

### WU-AI-001G — evidence-led acquisition

**Goal:** create dedicated search owners only where real evidence supports them.

Potential later route classes:

- Urdu grammar checker;
- simple Urdu / Urdu simplifier;
- Roman Urdu grammar checker.

Requires Search Console/usage evidence and unique page/task value.

---

## 27. Implementation map — inspect before coding

Paths are directional. The implementing agent must inspect current ownership before adding files.

At minimum inspect:

```text
js/input-mode.js
js/product-telemetry.js
js/workspace-handoff.js
js/workspace-journey-registry.js
js/workspace-next-step.js
js/core-continuity.js
js/ads.js
locale/ur.js
scripts/generate-urdu-locale.js
functions/
specs/WU-ANALYTICS-001-privacy-safe-product-telemetry.md
specs/WU-PLAT-002-v2-product-journey-workspace-handoffs.md
specs/WU-PLAT-003-core-workspace-convergence.md
specs/WU-VOICE-PLAT-001-unified-urdu-input-platform.md
specs/WU-DOC-001-english-to-urdu-document-translator.md
```

Search for actual editor owners and current Pages Functions routing rather than trusting historical filenames blindly.

Likely new ownership after source inspection:

```text
functions/api/ai-writing.*
functions/lib/ai-writing/*
js/ai-writing-assistant.js
js/ai-writing-age-gate.js
```

Do not create parallel state engines if a shared editor/command abstraction already exists.

---

## 28. Environment/config contract

Exact names may align with current Wrangler/Pages conventions after inspection.

Logical secrets/config:

```text
AI_GATEWAY_ID=write-urdu-ai
AI_GATEWAY_TOKEN=<secret>
AI_PRIMARY_PROVIDER=mistral|groq|cerebras
AI_PRIMARY_MODEL=<server config>
AI_FALLBACK_PROVIDER=<server config>
AI_FALLBACK_MODEL=<server config>
MISTRAL_API_KEY=<secret when enabled>
GROQ_API_KEY=<secret when enabled>
CEREBRAS_API_KEY=<secret when enabled>
AI_DAILY_BUDGET_USD=<config>
AI_MAX_INPUT_CHARS=<config>
AI_MAX_OUTPUT_TOKENS=<config>
AI_FEATURE_ENABLED=true|false
```

Never commit live credentials.

Provider aliases in code should not reveal secrets or make public copy dependent on current vendor selection.

---

## 29. Test strategy

### 29.1 Static/unit contract tests

Cover:

- allowed action registry;
- request validation;
- response validation;
- prompt action invariants;
- provider configuration allowlist;
- payload logging suppression header;
- cache skip behavior;
- telemetry redaction/no-text contract;
- age-gate state contract;
- rate/budget failure mapping;
- error redaction;
- locale string presence;
- AdSense protected-boundary preservation.

### 29.2 Provider adapter tests

Mock upstream responses for:

- success;
- timeout;
- 429;
- 5xx;
- malformed JSON;
- empty output;
- oversized output;
- refusal/safety output;
- primary technical failure → approved fallback;
- refusal does not fallback to bypass safety.

### 29.3 Browser acceptance

Desktop + mobile:

1. type normally with AI disabled/unavailable;
2. select text;
3. invoke action;
4. age gate first time;
5. review result;
6. keep original;
7. retry and replace;
8. undo;
9. copy result;
10. provider failure leaves source untouched;
11. mobile menu is reachable and does not obscure editor;
12. keyboard/focus flow works;
13. RTL/mixed-language result is readable;
14. no ad appears inside AI review task.

### 29.4 Benchmark regression

Prompt/model changes run the relevant safe benchmark subset before release.

Do not put private production user text into CI fixtures.

---

## 30. Verification commands

Use the repo's current package scripts. At minimum:

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

If the repo has changed script names by implementation time, use the current equivalents and update this spec/skill rather than silently skipping a gate.

AI-specific checks to add during Slice A/B should verify:

```text
- no provider secret in client bundle
- no user text in telemetry fixtures
- cf-aig-collect-log-payload=false contract
- AI calls are explicit user actions only
- core typing works with AI endpoint hard-failed
```

---

## 31. Acceptance criteria

### Epic planning / Slice 0

- [ ] Research doc is the source ledger for the decision.
- [ ] Safe Urdu benchmark corpus exists and is versioned.
- [ ] Mistral, Groq and Cerebras challengers are benchmarked on identical cases.
- [ ] Gemini is quality-control only unless current terms are independently cleared.
- [ ] Human Urdu scoring is completed, not replaced by generic benchmark scores.
- [ ] Provider terms/data/pricing/rate-limit matrix is dated.
- [ ] Primary/fallback decision is documented or the benchmark explicitly concludes “not ready.”

### Shared platform

- [ ] Dedicated `write-urdu-ai` AI Gateway boundary exists.
- [ ] Provider credentials are server-only.
- [ ] App code uses provider-neutral adapter.
- [ ] AI Gateway payload logging is disabled for user text while safe metadata remains observable.
- [ ] User-writing response caching is disabled by default.
- [ ] Rate limits, input/output bounds and hard spend/budget control exist.
- [ ] Provider/model can be disabled without taking down core writing.
- [ ] Raw provider errors/secrets never reach users.

### Core UX

- [ ] Normal editor renders and works before AI.
- [ ] AI runs only on explicit invocation.
- [ ] First request requires 18+ acknowledgement and the minimal disclosure.
- [ ] `Fix`, `Improve`, `Make simpler`, `Formal`, `Friendly`, `Shorten`, `Expand`, `Summarize` are benchmark-approved before exposure.
- [ ] Selected text is transformed when selection exists.
- [ ] Result is reviewable before destructive replacement.
- [ ] Replace / Copy / Keep original work; Insert below where surface supports it.
- [ ] Undo/recovery works.
- [ ] Failure never destroys source text.
- [ ] RTL/mixed-language UI is accessible on desktop/mobile.

### Privacy/measurement

- [ ] No input/output/prompt body is written to product telemetry.
- [ ] No input/output payload is retained in AI Gateway logs by Write Urdu configuration.
- [ ] Action/model/token/cost/latency/success metadata can be measured.
- [ ] Acceptance/rejection outcome can be measured without text.
- [ ] Privacy documentation identifies the current processor/provider arrangement truthfully.

### SEO/product integrity

- [ ] Homepage remains English-to-Urdu typing owner.
- [ ] AI does not delay/block core input initialization.
- [ ] No thin AI keyword pages ship in Phase 1.
- [ ] No public copy markets AI to under-18 students.
- [ ] No provider/model names leak into primary product marketing.
- [ ] Active authoring AdSense boundaries remain protected.

---

## 32. Release gates

### Gate A — research

Do not start production provider/UI coupling until the Urdu benchmark and terms matrix exist.

### Gate B — provider

Do not production-enable a provider unless current terms, data handling and spend/rate controls are approved.

### Gate C — privacy

Do not release if user prompt/response payloads are persisted in AI Gateway observability by default.

### Gate D — product quality

Do not release a transformation action whose human Urdu benchmark shows material meaning corruption, name/number corruption or unnatural output.

### Gate E — resilience

Do not release if an AI outage can break normal typing/editing.

---

## 33. Rollout plan

Recommended:

1. internal/preview benchmark only;
2. hidden production endpoint smoke test with synthetic text;
3. small feature-flagged editor rollout;
4. measure quality acceptance + cost;
5. enable broader eligible traffic;
6. only then evaluate dedicated acquisition pages.

A model with cheap tokens but low result acceptance is not economical.

---

## 34. Commercial rationale

Write Urdu's business model remains organic-search + AdSense-led. The AI feature is commercially useful if it:

- makes an existing writing session more useful;
- increases repeat/direct usage;
- creates legitimate second actions/page journeys;
- creates new high-intent acquisition owners only after evidence;
- stays cheap enough that incremental engagement/revenue can cover inference.

The first goal is not direct AI subscription monetization.

Cost discipline matters because a free writing product can generate a large number of low-value inference requests. That is why explicit invocation, small transformations, rate limits and hard budgets are product requirements rather than infrastructure polish.

---

## 35. Final product rule

The epic succeeds if users think:

> **Write Urdu helped me write this better.**

It fails if the product merely makes users notice:

> **Write Urdu added an AI model.**

The model is replaceable infrastructure. The Urdu writing workflow is the durable product.
