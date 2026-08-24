# Urdu AI Writing Assistant Implementation Skill

Use this skill when planning or implementing `WU-AI-001` or any `WU-AI-001A..G` slice.

## Read first

Always read, in this order:

```text
specs/WU-AI-001-urdu-ai-writing-assistant-platform.md
docs/WU-AI-001-URDU-AI-DEMAND-RESEARCH-2026-08-24.md
specs/WU-SEO-ETU-001-english-to-urdu-typing-acquisition.md
specs/WU-PLAT-002-v2-product-journey-workspace-handoffs.md
specs/WU-PLAT-003-core-workspace-convergence.md
specs/WU-ANALYTICS-001-privacy-safe-product-telemetry.md
specs/WU-I18N-001-crawlable-urdu-locale.md
```

When touching later continuations also read:

```text
specs/WU-VOICE-PLAT-001-unified-urdu-input-platform.md
specs/WU-DOC-001-english-to-urdu-document-translator.md
specs/WU-TPL-001-urdu-writing-templates.md
```

Search the current repository before coding. Do not trust an implementation-map filename merely because it existed when the epic was written.

---

## Product invariant

The feature is:

> **An optional writing-assistant layer inside the user's existing Urdu writing state.**

It is not:

> a generic Urdu chatbot.

It is not:

> a replacement for English-letter → Urdu typing.

Core typing/editing must work if the AI endpoint, AI Gateway and every provider are down.

---

## First actions

Stable action IDs:

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

Contextual later IDs:

```text
polish_roman_urdu
translate_to_urdu
```

Do not create arbitrary browser-supplied prompts or actions.

---

## Slice routing

### `WU-AI-001A` — benchmark + provider/terms gate

Do this **before production UI/provider coupling**.

Build:

```text
safe synthetic/public Urdu corpus
provider adapters for benchmark only
repeatable runner
raw machine metrics
human-scoring worksheet/report
provider/legal/data/pricing matrix
primary/fallback decision
```

Initial challengers:

```text
Mistral Small 4
Groq GPT-OSS 120B
Cerebras GPT-OSS 120B
Gemini Flash family — quality control only unless terms are separately cleared
```

Do not choose a winner from English leaderboards, model size or price alone.

Human Urdu review is mandatory.

### `WU-AI-001B` — shared transformation service

Build only the shared server platform:

```text
server endpoint
action registry
versioned prompts
validation
provider-neutral adapter
AI Gateway integration
rate limits
budget caps
timeout/fallback
metadata telemetry
kill switch
```

Do not build a second editor.

### `WU-AI-001C` — core editor assistant

Integrate with real owning writing state on the approved surfaces.

Need:

```text
compact action entry
18+ first-use gate
selection/current-text scope
preview
Replace
Insert below where valid
Copy
Keep original
Undo/recovery
mobile/keyboard/RTL acceptance
```

Do not move the primary editor down to make room for AI marketing.

### `WU-AI-001D` — English-letter/Roman Urdu polish

Preserve the deterministic conversion engine.

Expected flow:

```text
English-letter input
→ current deterministic Urdu conversion
→ optional explicit AI polish
→ compare/review
```

Never make AI required for conversion.

### `WU-AI-001E` — adult work/life continuations

Only after usage/acceptance evidence from C/D.

Reuse existing text/templates; do not invent a new document state.

### `WU-AI-001F` — voice/OCR/document continuations

Reuse existing platform outputs.

Do not implement new speech recognition, OCR or document ingestion inside this epic.

### `WU-AI-001G` — evidence-led SEO

Only after usage and Search Console evidence.

Do not create one route per AI command.

---

## Provider/platform rules

Write Urdu AI uses a **dedicated AI Gateway logical boundary**, not a hidden dependency on InvoiceCraftly's Workers AI free-neuron allocation.

Expected architecture:

```text
browser
  → Write Urdu Worker/Function
  → shared AI transform service
  → write-urdu-ai AI Gateway
  → configured external provider
```

### Current planning shortlist

As of the epic research date:

- Mistral Small 4 — primary candidate;
- Groq GPT-OSS 120B — strong candidate/fallback;
- Cerebras GPT-OSS 120B — challenger;
- Gemini — benchmark-only because current API-client age terms conflict with a public site likely to be used by under-18s;
- DeepSeek — not prioritized.

These are **not permanent facts**. At implementation/release, retrieve current official documentation for:

```text
model availability
pricing
rate limits
commercial use
retention
training use
ZDR/data controls
age/minor restrictions
Cloudflare AI Gateway support/API shape
```

Prefer official provider/Cloudflare docs over this dated skill when they conflict.

---

## Privacy release blocker

Cloudflare AI Gateway logging can retain request/response payloads.

Every user-writing AI request must prove:

```http
cf-aig-collect-log-payload: false
```

or an equivalent verified gateway-level configuration.

Metadata can remain:

```text
provider
model
tokens
cost
status
duration
```

Never retain in Gateway/product telemetry:

```text
user text
generated result
prompt body
freeform instruction
entities/names extracted from text
```

Default to **no response caching for user writing**. If Gateway caching is on globally, explicitly skip it for these requests unless a later privacy review changes the contract.

---

## Age boundary

Normal Write Urdu remains available to everyone under the existing product rules.

Before the first AI request, require the spec's simple 18+ acknowledgement.

Do not collect DOB.

Do not market AI as school/homework/essay-answer functionality.

**Critical:** an 18+ checkbox does not automatically make a provider compliant. Provider terms still govern. Gemini remains non-approved for production until its exact deployment boundary is explicitly cleared against current terms.

---

## Transformation rules

AI is an editor, not an autonomous author.

Universal:

```text
preserve meaning
preserve names/dates/numbers/money/URLs
preserve useful English code-switching
do not invent facts
return only requested transformed text
```

### Fix

Smallest useful correction. Preserve tone and intent.

### Improve

Clearer/natural Urdu without changing substantive meaning.

### Simplify

Easier everyday Urdu. Preserve facts, relationships and required respect/honorifics.

### Formal

Appropriately professional/respectful. Do not add promises, reasons or ceremonial filler.

### Friendly

Natural/conversational without becoming disrespectful/slang-heavy.

### Shorten

Remove repetition while preserving main point and conditions.

### Expand

Clarify what is already present. Never invent supporting facts.

### Summarize

Keep main points; first version supports text or bullets only.

---

## Prompt discipline

Prompts are versioned application assets.

Never scatter long prompts through route handlers/UI code.

Each task prompt has:

```text
stable action id
version
expected output shape
invariants
benchmark approval reference
```

A material prompt change reruns the relevant benchmark subset.

The browser cannot override system prompts or provider model IDs.

The AI-writing service gets **no web/search/database/tool access**. User text can contain instructions, but it is content to transform, not authority to reconfigure the application.

---

## Benchmark discipline

The corpus must contain only synthetic/public-safe fixtures, never copied private production writing.

Cover:

```text
native Urdu errors
awkward Urdu
difficult Urdu
Roman Urdu
chat shorthand
mixed Urdu/English
Pakistani names/organizations
numbers/dates/money
formal messages
casual messages
long paragraphs
```

Score 1–5:

```text
meaning preservation
grammar
natural Pakistani Urdu
script/spelling
code-switch handling
name/number fidelity
task adherence
hallucination/addition risk
```

Also record latency, tokens, cost and errors.

Do not tune the corpus to one model's known strengths.

---

## UX discipline

- AI runs only from explicit user action.
- Selection wins when a selection exists.
- Result is previewed before destructive replacement.
- Source text remains recoverable.
- Provider failure leaves source untouched.
- Manual edits always win.
- Use product action labels, not provider/model terminology.
- Keep AI secondary to the writing canvas.
- RTL and bidi handling are acceptance requirements, not polish.
- If rich inline diff is fragile in RTL, ship clear original/result review first.

---

## SEO discipline

The homepage remains the owner of English-to-Urdu typing.

Do not retitle/reframe the homepage as an “AI Urdu writer.”

Do not create thin keyword routes for:

```text
AI writer
paraphraser
tone changer
shortener
expander
summarizer
```

A future grammar/simplifier/Roman-Urdu correction route requires usage + search evidence and must own a distinct task experience.

---

## Telemetry discipline

Allowed:

```text
action id
surface id
provider/model alias
prompt version
input/output length bucket
token counts
latency
cost estimate
success/error category
replace/insert/copy/keep outcome
```

Forbidden:

```text
source text
output text
prompt body
freeform instruction
DOB
```

High request volume with low acceptance is a quality problem.

---

## Failure model

Normalize failures into safe product categories:

```text
invalid-input
too-large
rate-limited
provider-unavailable
timeout
refused
invalid-output
budget-exhausted
```

Never expose raw provider stack traces, account IDs, tokens or secret-bearing upstream messages.

Do not retry a refusal against another provider merely to circumvent safety controls.

---

## Before coding

Inspect current ownership for:

```text
editor state
selection handling
undo/history
shared toolbar/commands
Pages Functions routing
telemetry
locale strings
ad boundaries
workspace registry/handoffs
feature flags
```

Likely relevant files begin with:

```text
js/input-mode.js
js/product-telemetry.js
js/workspace-handoff.js
js/workspace-journey-registry.js
js/workspace-next-step.js
js/core-continuity.js
js/ads.js
locale/ur.js
functions/
```

Search; do not assume.

---

## PR discipline

One bounded slice per PR.

Every implementation PR reports:

- slice ID;
- user-visible behavior;
- provider/model configuration touched;
- benchmark evidence where relevant;
- privacy/logging evidence;
- rate/budget behavior;
- tests run;
- mobile/RTL evidence for UI slices;
- what is intentionally deferred.

Do not combine benchmark, platform backend, all editor surfaces and SEO pages into one PR.

---

## Required checks

At minimum use current equivalents of:

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

AI-specific contract checks must include:

```text
no provider secret in client bundle
no source/output text in telemetry
AI Gateway payload logging disabled
AI cache skipped for user text
action/model allowlist enforced
core typing green when AI endpoint fails
provider failure preserves editor state
```

If a current repository script conflicts with this skill, follow the repo and update the skill/spec in the same PR when appropriate.
