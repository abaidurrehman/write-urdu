# WU-AI-001 — Urdu AI Writing Demand, Market Gap & Provider Research

**Date:** 2026-08-24  
**Status:** Decision research for founder-approved epic  
**Product:** Write Urdu  
**Related epic:** `specs/WU-AI-001-urdu-ai-writing-assistant-platform.md`

---

## 1. Executive conclusion

Write Urdu should not ship a generic chatbot or a directory of disconnected AI tools.

The strongest opportunity is to make the existing Urdu writing journey materially better:

```text
English letters / Urdu / voice / pasted text
                 ↓
             one editor
                 ↓
     Fix · Improve · Simplify · Tone
                 ↓
      review the proposed change
                 ↓
  keep writing · format · export · share
```

The market evidence points to a **writing-assistant layer for Urdu**, not an “AI generator” product.

The highest-value first jobs are:

1. **Roman/English-letter Urdu → polished Urdu** — retain Write Urdu's deterministic typing experience, then offer optional AI cleanup after conversion.
2. **Fix Urdu** — grammar, spelling, punctuation, agreement, spacing and awkward sentence structure, with reviewable suggestions.
3. **Make Urdu simpler** — preserve meaning while replacing unnecessarily difficult language with clear everyday Urdu.
4. **Improve Urdu** — improve clarity and naturalness without changing the author's intent.
5. **Tone/register changes** — formal, professional, friendly/conversational and concise.
6. **Summarize** — short paragraph, key points or bullets.
7. **English → natural Urdu for selected text** — a bounded editor action, distinct from `WU-DOC-001`'s file/document workflow.

The differentiator is the workflow:

> **Type the way you already type → get proper Urdu → make it better without leaving the editor.**

That pattern is already emerging strongly in Hindi, while Arabic-first products show the value of language-specific tone/register, bilingual workflows and proofreading. Urdu has individual tools for grammar, paraphrasing, summarization and Roman Urdu conversion, but the current market remains fragmented across generic multilingual wrappers and broad tool directories.

This is a relative market-gap finding, not a claim that no competitor exists. Search Console and shipped-product usage must remain the final prioritization evidence.

---

## 2. Why this is adjacent to proven Write Urdu demand

Write Urdu already owns the upstream job.

The repo's `WU-SEO-ETU-001` records the 19 August 2026 Search Console hierarchy:

| Query | Impressions |
| --- | ---: |
| `english to urdu typing` | 26,997 |
| `urdu typing` | 10,279 |
| `urdu writing` | 5,267 |
| `urdu typing online` | 3,498 |
| `roman urdu to urdu` | 3,064 |
| `urdu transliteration` | 73 |

This is strategically important: Write Urdu does not need AI to invent a new acquisition market. It can attach higher-value outcomes to an already-proven writing session.

The user can arrive for:

> “type Urdu using English letters”

and discover a natural second job:

> “now make this Urdu correct / clearer / more formal / shorter.”

That is a much stronger product loop than sending users to a separate generic AI page.

### Product-language guardrail

Public product copy must continue to use the words users use: **English to Urdu typing**, **Urdu typing**, **Urdu writing**, **fix Urdu**, **make Urdu simpler**, **make formal**, etc.

Do not lead with model names, “LLM,” “NLP,” “transliteration,” token language or provider architecture.

---

## 3. Research method

This research triangulates four evidence classes:

1. **First-party demand** — Write Urdu Search Console evidence already governed by `WU-SEO-ETU-001`.
2. **Current Urdu competitors** — what jobs are already being exposed to users and how mature/integrated those experiences appear.
3. **Adjacent-language product patterns** — Hindi/Hinglish and Arabic/Arabizi are especially useful analogues because they share script-switching, mixed-language and register problems.
4. **Urdu NLP research** — where academic work explicitly identifies low-resource or underexplored language problems.

The research does **not** treat competitor SEO copy as proof of quality or demand. A feature earns roadmap priority only when it also fits Write Urdu's existing product journey and can be measured after release.

---

# Part A — Jobs in demand and relative Urdu gaps

## 4. Opportunity map

Scoring below is directional. `5` means strongest fit/opportunity.

| Job | Evidence | Current Urdu saturation | Write Urdu fit | Distinctive upside | Recommended stage |
| --- | --- | ---: | ---: | ---: | --- |
| Roman Urdu / English letters → polished Urdu | first-party typing demand + Roman Urdu research + competitor activity | 3 | **5** | **5** | **P0 inside epic** |
| Urdu grammar + spelling + punctuation | multiple current tools + Hindi specialist pattern | 3 | **5** | 4 | **P0 inside epic** |
| Simplify difficult Urdu | academic under-resource signal + 2026 Pakistani product adoption | **2** | **5** | **5** | **P0 inside epic** |
| Improve clarity/naturalness | common writing-assistant job | 3 | **5** | 4 | **P0 inside epic** |
| Formal / professional / friendly tone | strong Hindi + Arabic pattern | 2–3 | **5** | 4 | **P0 inside epic** |
| Make concise / expand | current multilingual tools | 3 | 5 | 3 | P0/P1 |
| Urdu summarization | active tools + current Urdu research | 3–4 | 4 | 3 | P1 |
| English → natural Urdu selected text | core product adjacency + translation demand | 4 | 5 | 3 | P1; keep separate from document translation |
| Explain why a correction is suggested | strong Hindi specialist pattern | **2** | 4 | **5** | P1 |
| Work messages / letters / applications | practical adult writing + existing template library | 3 | 4 | 3 | P1 after transformations |
| Voice transcript → polished Urdu | voice demand + existing Write Urdu voice platform | 2 | 5 | 4 | P1 integration, not new capture stack |
| OCR/document text → polished Urdu | existing roadmap adjacency | 2–3 | 4 | 4 | P2 integration |
| Urdu diacritics assistance | niche Arabic analogue + Urdu tooling | 2 | 3 | 4 | P2/P3 |
| Poetry/story/essay generation | existing competition, novelty/education-heavy | 4 | 2 | 2 | Do not prioritize |
| AI detector / “humanizer” | crowded generic category; weak trust | 4 | 1 | 1 | Reject as core feature |
| Full plagiarism checker | requires reliable corpus/licensing | 3 | 1 | 1 | Reject without data source |

---

## 5. Opportunity #1 — English-letter/Roman Urdu → polished Urdu

### Evidence

Roman Urdu is not a solved input format. A 2025 paper describes Urdu/Roman-Urdu transliteration as **underexplored despite widespread use**, and shows that purpose-built transformer approaches can outperform general-purpose GPT models on transliteration. The paper's strongest reported Char-BLEU scores were 96.37 Urdu→Roman Urdu and 97.44 Roman Urdu→Urdu.

Research source:
- https://arxiv.org/abs/2503.21530

This supports a crucial architecture decision:

**Do not replace Write Urdu's deterministic typing engine with an LLM.**

Instead:

```text
English-letter typing
       ↓
existing deterministic Urdu conversion
       ↓
optional AI polish
       ↓
review changes
```

This preserves the fast, established typing behavior while using AI only for the genuinely semantic problems:

- chat shorthand;
- ambiguous context;
- grammar after conversion;
- unnatural wording;
- mixed Urdu/English;
- formality/register;
- punctuation and sentence-level cleanup.

### Competitive analogue: Hindi

Hindi Check now markets exactly this integrated workflow: Hinglish → Devanagari in the editor, then grammar, spelling, mixed-language support, style suggestions and export without leaving the writing surface.

Source:
- https://www.hindicheck.in/hinglish-to-hindi-converter

Sariya similarly combines Hindi grammar, spelling, paraphrasing, tone change, translation, voice and Hinglish input in one assistant.

Source:
- https://www.sariya.app/hi

### Write Urdu opportunity

The product promise can be simpler than the technology:

> **Type Urdu in English letters. Then fix or improve it in one click.**

This is likely the highest-leverage AI addition because it starts from Write Urdu's proven acquisition intent rather than requiring a new behavior.

---

## 6. Opportunity #2 — Urdu grammar, spelling and punctuation with reviewable fixes

Current Urdu SERPs already expose grammar-checking demand, but much of the supply is generic multilingual tooling.

Examples:
- Rephrasely markets Urdu grammar, spelling, punctuation, style, Roman Urdu and formality controls: https://rephrasely.com/blog/free-urdu-grammar-checker-check-correct-online
- UrduTexts lists separate Urdu grammar and spell checkers inside a 40+ tool directory: https://urdutexts.com/
- Zetawala exposes grammar, paraphrase, Roman Urdu conversion and Roman Urdu grammar/spelling among a broader multi-language tool suite: https://www.zetawala.com/writing

The opportunity is therefore **not simply “have a grammar checker.”**

The better product is:

- works directly on the user's current Write Urdu text;
- highlights or previews changes;
- does not silently replace the whole document;
- lets the user accept/replace/copy/undo;
- preserves names, numbers and mixed English where possible;
- optionally explains a correction;
- understands honorific/formality consistency.

Hindi specialist products demonstrate that users can receive individual correction explanations rather than an opaque full rewrite. Sariya explicitly positions “learn as you write” and correction explanations as part of the product.

Source:
- https://www.sariya.app/hi

### Urdu-specific benchmark dimensions

The benchmark must intentionally include:

- gender/number agreement;
- postpositions;
- compound verbs;
- honorific consistency;
- punctuation (`؟`, `،`, sentence boundaries);
- spacing and joining artifacts;
- Urdu/English code-switching;
- common Pakistan-specific names and institutions;
- words with multiple acceptable spellings/registers.

---

## 7. Opportunity #3 — “Make Urdu simpler” is unusually promising

This is the clearest **under-tapped** opportunity found in the research.

The 2020 LREC paper `SimplifyUR` describes itself as the **first attempt at Automatic Text Simplification for Urdu** and notes that Urdu's low-resource status, morphology, inflection and honorifics require special handling.

Source:
- https://aclanthology.org/2020.lrec-1.428/

There is also a current Pakistan-market signal. In April 2026 JournalismPakistan introduced a reader feature offering multiple representations of the same article, including:

- summaries;
- simple language;
- key points;
- Urdu explanations;
- background/context;
- practical implications.

Source:
- https://www.journalismpakistan.com/read-it-your-way-how-journalismpakistan-com-s-ai-feature-works/

The product need is broader than summarization. Users often have text that is already Urdu but is too difficult, bureaucratic, literary or indirect.

Possible action label:

> **Make simpler**

Contract:

- preserve facts and intent;
- use easier everyday Urdu;
- do not add new claims;
- retain names/numbers/dates;
- preserve necessary respectful language;
- return a reviewable replacement, not an authoritative correction.

This feature is more differentiated than another generic paraphraser and can serve adults reading or preparing work, government, community and business text.

---

## 8. Opportunity #4 — tone and register, not “AI creativity”

Both Hindi and Arabic specialist products treat tone/register as a core writing control.

Hindi examples:
- Sariya shows casual, friendly, professional and formal versions of the same message: https://www.sariya.app/hi
- Hindi Check describes formality, clarity and tone suggestions inside the writing flow: https://www.hindicheck.in/

Arabic example:
- ARWriter exposes tone/dialect controls, bilingual workflows, proofreading and diacritics: https://app.arwriterai.com/en/arabic-ai-writer

Urdu has an analogous problem even without exposing a large dialect picker:

- `آپ` vs overly casual address;
- professional office wording;
- bureaucratic/formal letter style;
- friendly WhatsApp phrasing;
- natural Pakistani Urdu rather than literal translation language.

Recommended first controls:

- **Formal**
- **Professional**
- **Friendly**
- **Simpler**
- **Shorter**

Do not start with 20 novelty tones.

A “natural Pakistani Urdu” benchmark criterion should exist even if it never appears as a visible mode.

---

## 9. Opportunity #5 — summarization is useful, but less differentiated

Urdu summarization is clearly active.

Current product examples:
- UrduTexts offers paragraph, bullet-point and key-point summaries with adjustable length: https://urdutexts.com/urdu-summarizer
- TransWord exposes multiple Urdu summary formats: https://transword.ai/summarize/urdu

Current research also still describes Urdu as low-resource in summarization. A February 2026 PLOS One paper reports a new extractive summarization framework and improvements over prior Urdu methods.

Source:
- https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0341596

That means summarization belongs in the assistant, but it should not be the headline differentiator.

Recommended modes:

- **Short summary**
- **Key points**

Avoid turning the first release into a complex report-generation interface.

---

## 10. Opportunity #6 — correction explanations

Specialist Hindi tools increasingly show the rule/reason behind corrections. This is meaningful because generic LLM rewrites often make users ask:

> “What did it change, and why?”

Write Urdu can make AI feel more trustworthy by keeping the original visible and offering an optional **Why?** affordance for a suggested correction.

This should not imply linguistic infallibility. The UI should use suggestion language:

- “Suggested change”
- “Why this may read better”
- “Keep original”

Because the planned AI surface is 18+, this is positioned as writing confidence and transparency for adults, not as a school/homework product.

---

# Part B — What other languages teach us

## 11. Hindi/Hinglish: the closest product analogue

Hindi is the strongest analogue because the product problem is almost identical:

```text
Latin-letter everyday typing
        ↓
native script
        ↓
spelling/grammar
        ↓
formal/clear output
```

Hindi Check's current integrated workflow includes:

- Hinglish → Hindi conversion;
- grammar checking;
- spelling checking;
- mixed Hindi/English/Hinglish;
- formality/clarity/tone suggestions;
- Word/PDF/TXT export.

Source:
- https://www.hindicheck.in/hinglish-to-hindi-converter

Sariya packages grammar, spell check, rewrite, translation, tone change and Hinglish input as a single Hindi writing assistant rather than a navigation maze of unrelated tools.

Source:
- https://www.sariya.app/hi

### Product lesson

**The assistant belongs inside the writing state.**

A user should not have to:

1. copy Urdu;
2. open a grammar tool;
3. copy back;
4. open a paraphraser;
5. copy back again.

Write Urdu already has the workspace/handoff architecture to avoid this fragmentation.

---

## 12. Arabic/Arabizi: register and native-language specialization

ARWriter's current product emphasizes:

- native Arabic writing;
- tone and dialect controls;
- bilingual workflows;
- rewriting/proofreading;
- diacritics;
- content adaptation for different channels.

Sources:
- https://app.arwriterai.com/en/arabic-ai-writer
- https://arwriterai.com/en/arabic-ai-writer/

Romanized Arabic research also continues to show that Latin-script informal writing is not merely a temporary technical workaround. A 2026 human-centered study documents systematic variation in Arabizi across dialects and usage contexts.

Source:
- https://arxiv.org/abs/2608.02555

### Product lesson

Do not treat Roman Urdu as “bad input” that must disappear. It is a real writing behavior. The useful transformation is:

> informal Roman Urdu → correctly scripted / appropriately registered Urdu

while respecting code-switching and user intent.

---

## 13. English/general writing assistants: borrow the jobs, not the bloat

The durable job categories from broad writing assistants are:

- grammar;
- rewrite;
- shorten/expand;
- tone;
- summarize;
- translate;
- selected-text transformations.

Write Urdu should borrow that interaction model while avoiding categories that create weak trust or poor product fit:

- generic chatbot as homepage centerpiece;
- AI detector;
- “humanizer” positioned around bypassing detection;
- plagiarism checker without a licensed/indexed corpus;
- uncontrolled essay/homework generation;
- hundreds of thin “AI generator” SEO routes.

The opportunity is to be **Urdu-first and workflow-first**, not to reproduce every English AI utility.

---

# Part C — Current Urdu competitive landscape

## 14. What exists today

### UrduTexts

`https://urdutexts.com/` currently presents a broad 40+ tool suite including:

- translation;
- Roman Urdu conversion;
- grammar/spelling;
- paraphrasing;
- summarization;
- voice;
- OCR;
- dictionary;
- story/essay/application generation;
- document and image utilities.

This proves breadth of feature supply, but also illustrates the fragmentation Write Urdu should avoid.

### Rephrasely

`https://rephrasely.com/rephrase-modes/urdu-grammar-checker` and related pages expose Urdu inside a 100+ language system, including grammar, paraphrasing and content generation.

This is useful validation of generic demand, but does not have Write Urdu's mature Urdu typing journey.

### Zetawala

`https://www.zetawala.com/writing` combines multi-language writing tools with dedicated Roman Urdu conversion and Roman Urdu grammar/spell checking.

Again, it validates the job but is broader than an Urdu-first authoring experience.

### Market interpretation

There **is** competition. The opportunity is not “nobody has built Urdu AI.”

The opportunity is:

> **No clearly dominant product combines mature English-letter Urdu typing, direct Urdu editing, voice/capture continuity, reviewable Urdu correction and practical rewriting as one coherent Urdu-first workspace.**

This claim should be periodically revalidated because the category is moving quickly.

---

# Part D — Provider and legal/privacy research

## 15. Architecture decision: AI Gateway, not shared Workers AI capacity

InvoiceCraftly already consumes Cloudflare Workers AI capacity. Write Urdu should therefore treat Workers AI as an optional benchmark/fallback, not its primary new inference pool.

Use a dedicated Cloudflare AI Gateway:

```text
Write Urdu browser
       ↓
Write Urdu Worker / API
       ↓
write-urdu-ai Gateway
       ↓
provider adapter / routing
   ├── Mistral
   ├── Groq
   ├── Cerebras
   └── benchmark-only providers
```

Cloudflare currently lists Mistral AI, Groq, Cerebras, Google AI Studio and Google Vertex among supported AI Gateway providers, and its OpenAI-compatible endpoint supports Mistral, Groq, Google AI Studio and Cerebras.

Sources:
- https://developers.cloudflare.com/ai-gateway/usage/providers/
- https://developers.cloudflare.com/ai-gateway/usage/chat-completion/

Core AI Gateway features such as analytics, caching and rate limiting are currently free, but current pricing/limits must be revalidated at implementation time.

Source:
- https://developers.cloudflare.com/ai-gateway/reference/pricing/

---

## 16. Privacy non-negotiable: metadata-only Gateway logs

Cloudflare AI Gateway logging currently stores prompt and model response payloads by default when logs are enabled.

Cloudflare supports:

```http
cf-aig-collect-log-payload: false
```

which suppresses raw request/response bodies while retaining metadata such as:

- token counts;
- model/provider;
- status code;
- cost;
- duration.

Source:
- https://developers.cloudflare.com/ai-gateway/observability/logging/

For Write Urdu AI text, this header is a **release-blocking privacy requirement**.

The product does not need to retain what the user wrote in AI observability.

Also default to skipping response caching for user text unless a future privacy review proves a specific safe use case.

---

## 17. Provider shortlist

### 17.1 Mistral Small 4 — primary benchmark candidate

As checked on 2026-08-24, Mistral Small 4 (`mistral-small-2603`) is a GA Apache-2.0 model with 119B total / 6.5B active parameters and a 256K context window.

Current API pricing:

- input: **$0.15 / 1M tokens**;
- output: **$0.60 / 1M tokens**.

Sources:
- https://docs.mistral.ai/models/mistral-small-4-0-26-03
- https://docs.mistral.ai/inference/pricing

Mistral's commercial terms effective 5 August 2026 prohibit including personal information of children below the applicable digital-consent age or allowing minors without legally adequate parent/guardian consent.

Source:
- https://legal.mistral.ai/terms/commercial-terms-of-service

Mistral also states that pay-as-you-go Studio/API customers are opted out of model training by default; Free mode has different data-training behavior unless opted out.

Sources:
- https://help.mistral.ai/en/articles/455207-can-i-opt-out-of-my-input-or-output-data-being-used-for-training
- https://help.mistral.ai/en/articles/347617-do-you-use-my-user-data-to-train-your-artificial-intelligence-models

**Recommendation:** benchmark Mistral Small 4 first; if selected for production, use PAYG rather than relying on Free-mode data handling.

### 17.2 Groq GPT-OSS 120B — strong primary/fallback candidate

Current production model facts checked on 2026-08-24:

- model: `openai/gpt-oss-120b`;
- ~500 tokens/sec advertised speed;
- input: **$0.15 / 1M tokens**;
- output: **$0.60 / 1M tokens**;
- 131,072-token context.

Source:
- https://console.groq.com/docs/model/openai/gpt-oss-120b

Current free-plan limit listed for GPT-OSS 120B:

- 30 RPM;
- 1,000 RPD;
- 8K TPM;
- 200K tokens/day.

Source:
- https://console.groq.com/docs/rate-limits

Groq's June 2026 Services Agreement explicitly permits customers to integrate APIs into a Customer Application and make the services available to End Users. Its agreement treats the business customer account holder separately from end users; where a customer application is directed to/likely accessed by minors, the customer is responsible for applicable compliance rather than Groq imposing Google's blanket API-client ban.

Source:
- https://console.groq.com/docs/legal/services-agreement

Groq states that inference customer data is not retained by default except limited reliability/abuse cases or persistence-requiring features; all customers can enable Zero Data Retention. It also states inputs/outputs are not used for training/fine-tuning unless the customer explicitly grants permission/instruction.

Sources:
- https://console.groq.com/docs/your-data
- https://console.groq.com/docs/legal/services-agreement

**Recommendation:** benchmark alongside Mistral; enable ZDR if selected for production.

### 17.3 Cerebras GPT-OSS 120B — capacity/latency challenger

Cloudflare's current Cerebras provider integration explicitly demonstrates `gpt-oss-120b` and supports the OpenAI-compatible AI Gateway endpoint.

Source:
- https://developers.cloudflare.com/ai-gateway/usage/providers/cerebras/

**Recommendation:** include in the benchmark. Do not encode free quota assumptions in the product contract; revalidate direct Cerebras limits, pricing and data terms immediately before implementation.

### 17.4 Gemini — quality control, not current production default

Cloudflare supports Google AI Studio through AI Gateway.

Source:
- https://developers.cloudflare.com/ai-gateway/usage/providers/google-ai-studio/

However, Google's Gemini API Additional Terms effective 23 March 2026 say the API must not be used as part of an API Client directed toward or likely to be accessed by individuals under 18. They also require Paid Services when API Clients are made available to users in the EEA, Switzerland or UK.

Source:
- https://ai.google.dev/gemini-api/terms

Because Write Urdu is a general public Urdu-writing site that can reasonably be used by students, an “18+” notice alone must **not** be assumed to cure this provider condition.

**Recommendation:** Gemini may be used as an offline/controlled quality benchmark, but is not production-approved by this epic unless a later legal/provider review explicitly clears the exact deployment boundary.

### 17.5 DeepSeek — do not prioritize

Its low price does not justify first-wave privacy/legal complexity for a writing product. Keep it outside the initial shortlist unless later evidence creates a clear reason to reconsider.

---

## 18. Age boundary decision

Keep all non-AI Write Urdu functions available normally.

Only the AI transformation surface should be gated.

Suggested first-use disclosure:

> **AI writing tools**  
> This feature is for users aged 18 and over. Your text is sent securely to an AI service to create the result. Please don't include sensitive personal information.

Then require an explicit continue/18+ acknowledgement before the first AI request.

After acceptance, keep a small persistent label such as:

> `AI-powered · 18+`

### Important legal guardrail

This is a **Write Urdu product policy**, not a universal legal workaround.

Provider terms are independently binding. A provider marked “not approved” cannot become approved merely because the UI contains an age checkbox.

Do not market the AI feature as:

- homework solver;
- school essay generator;
- exam answer writer;
- student assignment generator.

The existing deterministic typing, templates and editor remain available without the AI age gate.

---

# Part E — Product recommendation

## 19. Recommended first command set

Keep the first command surface small:

| Visible action | User promise |
| --- | --- |
| **Fix Urdu** | Correct grammar, spelling and punctuation while preserving meaning |
| **Improve** | Make awkward Urdu clearer and more natural |
| **Make simpler** | Use easier everyday Urdu without changing the facts |
| **Formal** | Make the writing appropriately formal/respectful |
| **Friendly** | Make it natural and conversational |
| **Shorten** | Keep the main meaning with fewer words |
| **Expand** | Add clarity/detail without inventing facts |
| **Summarize** | Return a concise summary or key points |

Contextual action when English-letter/Roman Urdu is detected:

> **Polish this Urdu**

Contextual action for English selected text:

> **Translate to Urdu**

Do not expose provider/model selection to normal users.

---

## 20. Interaction contract

AI must behave like an editor, not an autonomous author.

```text
user text
  ↓
select action
  ↓
preview proposed result
  ↓
[Replace] [Insert below] [Copy] [Keep original]
  ↓
Undo remains available
```

Rules:

- never run AI on page load;
- never send text merely because it was typed;
- user explicitly invokes each transformation;
- selected text is the default scope when selection exists;
- otherwise use the bounded current paragraph/document scope;
- show the original and proposed result before destructive replacement;
- manual edits always win;
- no user text in URL, telemetry or AI Gateway payload logs;
- a provider failure must never lose the user's original writing.

---

## 21. Benchmark before provider selection

Create a versioned corpus of 100–200 representative cases across:

### Input families

- clean native Urdu;
- broken/awkward Urdu;
- English-letter/Roman Urdu;
- shorthand Roman Urdu;
- Urdu + English code-switching;
- English → Urdu selected passages;
- formal letters/messages;
- casual messages;
- difficult/bureaucratic Urdu;
- long paragraphs;
- names, addresses, dates, money and organizations.

### Task families

- fix;
- improve;
- simplify;
- formalize;
- make friendly;
- shorten;
- expand;
- summarize;
- translate selected text;
- polish converted Roman Urdu.

### Human scoring dimensions

Score 1–5 for:

1. meaning preservation;
2. grammatical correctness;
3. natural Pakistani Urdu;
4. spelling/script quality;
5. code-switch preservation;
6. proper-name/number fidelity;
7. instruction following;
8. hallucination/addition risk.

Record separately:

- latency;
- input/output tokens;
- estimated cost;
- refusal/error rate;
- provider/model/version.

### Release gate

No provider wins because of an English benchmark leaderboard or token price alone.

The selected model must pass a **human Urdu quality gate** on the actual Write Urdu task corpus.

---

## 22. Suggested implementation slices

### Slice 0 — Benchmark + provider/legal gate

- build versioned Urdu test corpus;
- implement small offline benchmark harness/adapters;
- test Mistral Small 4, Groq GPT-OSS 120B, Cerebras GPT-OSS 120B;
- use Gemini only as quality control unless terms change/are cleared;
- document human scores, latency and cost;
- choose primary + fallback only after the gate.

### Slice A — Shared AI transformation service

- dedicated `write-urdu-ai` AI Gateway;
- server-side provider credentials only;
- provider-neutral request/response adapter;
- versioned task prompts;
- input/output length caps;
- per-user/IP rate limiting;
- hard daily spend budget;
- timeouts/retries/fallback policy;
- `cf-aig-collect-log-payload: false` on every AI request;
- no cache for user writing by default;
- privacy-safe metadata telemetry.

### Slice B — Core editor assistant

Ship in the existing writing owners first:

- `/`;
- `/urdu-editor`;
- `/urdu-keyboard` where the shared writing state supports it cleanly.

Actions:

- Fix Urdu;
- Improve;
- Make simpler;
- Formal;
- Friendly;
- Shorten;
- Expand;
- Summarize.

Include preview/replace/copy/undo and the 18+ first-use gate.

### Slice C — English-letter/Roman Urdu → polished Urdu

- preserve existing deterministic conversion;
- add optional post-conversion semantic polish;
- keep ambiguous proper nouns/English terms stable;
- compare original converted text vs AI-polished result;
- never make AI a dependency for core typing.

### Slice D — Adult work/life writing continuations

Only after transformation usage is proven:

- professional message;
- formal request/application;
- business/community notice;
- concise WhatsApp message;
- refine an existing template.

Reuse `WU-TPL-001`; do not replace deterministic templates.

### Slice E — Capture/document integrations

Later, reuse existing product platforms:

- voice output → optional AI cleanup (`WU-VOICE-PLAT-001`);
- extracted document text → simplify/summarize (`WU-DOC-001`);
- OCR output → fix/polish when the OCR pipeline exists.

Do not create duplicate voice/OCR/document stacks inside this epic.

### Slice F — Evidence-led SEO/growth

- measure AI action usage first;
- only create dedicated acquisition routes for genuinely distinct, proven jobs;
- strongest candidates to test later: `Urdu grammar checker`, `make Urdu simpler`, `Roman Urdu grammar`;
- avoid a page for every toolbar command;
- preserve `/` as English-to-Urdu typing owner.

---

## 23. Measurement contract

Allowed event fields:

- action ID (`fix`, `simplify`, etc.);
- surface/workspace;
- provider/model alias;
- model version where available;
- input length bucket, not text;
- output length bucket, not text;
- input/output token count;
- latency bucket/value;
- cost estimate;
- success/error/timeout/refusal;
- accepted/replaced/copied/kept-original outcome;
- age-gate accepted state without birth date.

Never collect in product telemetry:

- source text;
- generated text;
- names extracted from text;
- prompt bodies;
- arbitrary user instructions.

Success metrics:

1. AI action starts per eligible writing session;
2. successful result rate;
3. result acceptance/replace rate;
4. keep-original/rejection rate by action;
5. repeat AI use in later sessions;
6. editor continuation after AI result;
7. cost per successful accepted transformation;
8. failure/refusal/timeout rate;
9. organic entries only after/if dedicated owner routes launch.

---

## 24. What not to build first

### Generic Urdu chatbot

It weakens product positioning and has no advantage over general assistants.

### Essay/homework generator

Conflicts with the intended 18+ AI boundary and creates academic-integrity/positioning problems.

### AI detector / bypass “humanizer”

Weak trust, generic competition and little connection to Write Urdu's core job.

### Plagiarism checker

Do not imply comprehensive originality checking without a real comparison corpus/index and clear methodology.

### Poetry generator

Potentially fun but not the strongest commercial or writing-workflow extension. Reconsider only from demand evidence.

### AI replacing core typing

Core English-letter → Urdu typing must remain deterministic, fast and available even if every AI provider is down.

---

## 25. Product positioning

Do not market:

> “Write Urdu now has AI.”

Market outcomes:

> **Write Urdu, then make it clear and correct.**

> **Type Urdu in English letters, then polish it without leaving the editor.**

> **Fix Urdu grammar and spelling while keeping your meaning.**

> **Turn difficult Urdu into simple, everyday Urdu.**

AI is the implementation. Better Urdu writing is the product.

---

## 26. Source ledger

### Write Urdu first-party evidence

- `specs/WU-SEO-ETU-001-english-to-urdu-typing-acquisition.md`

### Cloudflare AI Gateway

- https://developers.cloudflare.com/ai-gateway/
- https://developers.cloudflare.com/ai-gateway/usage/providers/
- https://developers.cloudflare.com/ai-gateway/usage/chat-completion/
- https://developers.cloudflare.com/ai-gateway/observability/logging/
- https://developers.cloudflare.com/ai-gateway/reference/pricing/
- https://developers.cloudflare.com/ai-gateway/usage/providers/mistral/
- https://developers.cloudflare.com/ai-gateway/usage/providers/cerebras/
- https://developers.cloudflare.com/ai-gateway/usage/providers/google-ai-studio/

### Provider terms/pricing/data

- https://docs.mistral.ai/models/mistral-small-4-0-26-03
- https://docs.mistral.ai/inference/pricing
- https://legal.mistral.ai/terms/commercial-terms-of-service
- https://help.mistral.ai/en/articles/455207-can-i-opt-out-of-my-input-or-output-data-being-used-for-training
- https://help.mistral.ai/en/articles/347617-do-you-use-my-user-data-to-train-your-artificial-intelligence-models
- https://console.groq.com/docs/model/openai/gpt-oss-120b
- https://console.groq.com/docs/rate-limits
- https://console.groq.com/docs/legal/services-agreement
- https://console.groq.com/docs/your-data
- https://ai.google.dev/gemini-api/terms

### Urdu research / market

- https://arxiv.org/abs/2503.21530
- https://aclanthology.org/2020.lrec-1.428/
- https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0341596
- https://www.journalismpakistan.com/read-it-your-way-how-journalismpakistan-com-s-ai-feature-works/
- https://urdutexts.com/
- https://urdutexts.com/urdu-summarizer
- https://rephrasely.com/blog/free-urdu-grammar-checker-check-correct-online
- https://www.zetawala.com/writing

### Adjacent-language products/research

- https://www.hindicheck.in/hinglish-to-hindi-converter
- https://www.hindicheck.in/
- https://www.sariya.app/hi
- https://app.arwriterai.com/en/arabic-ai-writer
- https://arwriterai.com/en/arabic-ai-writer/
- https://arxiv.org/abs/2608.02555

---

## 27. Research decision

Proceed with `WU-AI-001` as a **benchmark-gated Urdu writing-assistant epic**.

The first implementation should not begin by wiring a production model into the UI. It begins with **Slice 0: the Urdu task corpus, provider benchmark and provider/legal/privacy gate**.

If the benchmark passes, ship the smallest high-value editor actions first and measure whether users accept them.

The long-term strategic goal is not a collection of AI tools. It is one continuous Urdu writing system:

```text
Capture / type
    ↓
correct script
    ↓
clear, correct Urdu
    ↓
format / create / share / save
```
