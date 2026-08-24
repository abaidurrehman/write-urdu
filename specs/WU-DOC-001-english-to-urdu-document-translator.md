# WU-DOC-001 — English to Urdu Document Translator

**Product:** Write Urdu  
**Feature ID:** `WU-DOC-001`  
**Status:** Planned — founder-approved  
**Priority:** P1 product + acquisition expansion  
**Date:** 2026-08-24  
**Area:** Work / document translation / Urdu editing / acquisition  
**Primary route:** `/tools/english-to-urdu-document-translator`  
**Urdu locale route:** `/urdu/tools/english-to-urdu-document-translator` after locale-generation readiness  
**Journey dependency:** `WU-PLAT-002`  
**Core writing dependency:** `WU-PLAT-003` / Rich Editor  
**Locale dependency:** `WU-I18N-001`  
**Telemetry dependency:** `WU-ANALYTICS-001`  
**Optional persistence dependency:** `WU-DRAFT-001`  
**Optional publishing dependency:** `WU-SHARE-001`

---

## 1. Executive decision

Build one strong document workflow that turns an English document into clean, editable Urdu.

The product promise is:

```text
Upload an English document
        ↓
Extract the real document text and structure
        ↓
Translate it into Urdu
        ↓
Review and edit the Urdu
        ↓
Copy / continue in Rich Editor / export / save / share
```

Phase 1 is **not** a pixel-perfect document-layout replacement engine.

Do not promise:

> Upload any PDF and get the exact same PDF back with every English word replaced by Urdu.

The first release should instead promise:

> Translate your English PDF or Word document into clean, editable Urdu.

That captures most of the user value while avoiding the hardest RTL layout-reconstruction problem.

This feature is an approved exception to the old backlog warning against novelty-style AI translation. It is not a generic AI chat/translation experiment. It owns a concrete Urdu work job, has a dedicated acquisition route, produces editable Urdu that continues into existing Write Urdu workflows, and uses bounded document/translation infrastructure.

---

## 2. Why this belongs in Write Urdu

Write Urdu already owns the downstream jobs that generic document translators normally stop before:

- edit Urdu text;
- correct Urdu with direct typing, English letters → Urdu, or voice where supported;
- format in Rich Editor;
- create cards/social outputs;
- copy/share;
- save to My Documents when the user explicitly chooses account-backed persistence;
- export a clean document.

The differentiating loop is therefore:

```text
English document → Urdu → edit → use the Urdu
```

not merely:

```text
English document → opaque translated file
```

The feature also extends an existing product/search relationship — English input becoming Urdu output — instead of introducing an unrelated utility.

---

## 3. User jobs

Primary jobs:

1. `Translate this English PDF into Urdu so I can read it.`
2. `Translate this Word document into Urdu and let me correct the result.`
3. `Give me clean Urdu text from this document so I can copy or reuse it.`
4. `Open the translated Urdu in Write Urdu so I can format or continue working.`
5. `Give me a clean Urdu document I can print/save after I review it.`

Representative documents:

- school notices and letters;
- business letters;
- government/public notices;
- instructions and informational documents;
- meeting notes or short reports;
- simple tables and lists;
- general prose documents.

Phase 1 is not positioned for certified/legal/medical translation. Public copy must not imply professional certification or guarantee legal equivalence.

---

## 4. Route ownership and SEO boundary

### 4.1 One primary owner

Primary owner:

```text
/tools/english-to-urdu-document-translator
```

Suggested user-visible H1:

> English to Urdu Document Translator

Suggested supporting promise:

> Upload a PDF or Word document, translate it into Urdu, then edit, copy or continue in Write Urdu.

Keep public language simple. Do not lead with:

- AI inference;
- OCR pipelines;
- Markdown ASTs;
- model names;
- Cloudflare internals;
- token/chunk terminology.

### 4.2 Do not create doorway pages in Phase 1

Do not launch near-identical pages such as:

```text
/pdf-to-urdu
/english-pdf-to-urdu
/word-to-urdu
/translate-english-pdf-to-urdu
```

merely to target variants.

The main route should naturally contain truthful PDF/Word language and examples. Dedicated query-owner routes may be considered later only when Search Console/external demand proves a distinct user job and the page can provide distinct value.

### 4.3 Urdu locale

The Urdu-language route must follow `WU-I18N-001` static/crawlable locale rules. Do not browser-language redirect. Do not create the Urdu locale as a client-translated duplicate.

---

## 5. Phase 1 supported inputs

Launch support:

| Type | Treatment |
| --- | --- |
| `.pdf` | text-based PDFs through Cloudflare document conversion |
| `.docx` | Word documents through Cloudflare document conversion |
| `.txt` | deterministic local/server text ingestion; no rich extraction needed |

Optional after the same contract is proven:

- `.odt`;
- `.html` where there is a real user need.

Deferred to Slice D:

- scanned/image-only PDFs;
- `.jpg`, `.jpeg`, `.png`, `.webp` photos/screenshots;
- OCR-specific workflows;
- exact source-layout preservation;
- PPTX;
- XLSX;
- reverse Urdu → English document translation.

A format being technically supported by Cloudflare does not mean Write Urdu must expose it in the first release.

---

## 6. Cloudflare-native technical decision

### 6.1 Document extraction baseline

Use the current Cloudflare Workers AI `toMarkdown` binding for supported rich document extraction where available.

As verified on 2026-08-24, Cloudflare's supported-format documentation includes PDF, DOCX, images, spreadsheets and other formats. PDF conversion attempts to use the PDF semantic structure tree when available and otherwise extracts page text. DOCX is supported by the same conversion service.

Implementation must use the binding from the Pages Function/Worker, not call Cloudflare's REST API from inside Cloudflare runtime.

Primary contract:

```text
file
  ↓
env.AI.toMarkdown(...)
  ↓
semantic Markdown/text
  ↓
DocumentDraft blocks
```

TXT bypasses `toMarkdown` unless there is a strong reason not to.

### 6.2 Translation baseline

The first benchmark target is Cloudflare Workers AI:

```text
@cf/ai4bharat/indictrans2-en-indic-1B
```

As verified on 2026-08-24, Cloudflare documents Urdu Arabic script (`urd_Arab`) as a supported translation target for this model.

Why use it as the baseline:

- it is a dedicated translation model rather than a general chat model;
- it is Cloudflare-hosted;
- it keeps the first implementation inside the existing platform;
- it reduces prompt-injection surface because the primary operation is translation, not instruction following;
- current pricing is low enough for a bounded utility, subject to release-time revalidation.

Do **not** hard-code product behavior to one model API shape. Implement a small translation adapter so the baseline can be challenged without rewriting the document pipeline.

A multilingual text-generation model such as a currently available Cloudflare model may be benchmarked as a challenger only if the dedicated translation model fails the Urdu-quality gate. Do not switch because a larger model sounds more capable.

### 6.3 Current cost note — not a permanent contract

Cloudflare documentation checked on 2026-08-24 lists Workers AI with a 10,000-neuron/day free allocation and the IndicTrans2 model at approximately $0.342 per million input tokens and $0.342 per million output tokens. These values are planning inputs only.

Before implementation/release, re-check:

- current model availability;
- model input/output schema;
- current pricing;
- Workers AI free allocation;
- request/model limits;
- Pages/Workers binding configuration.

Do not put stale pricing numbers in public product copy.

---

## 7. Canonical document state

The feature must not pass around an unstructured translated blob as its only state.

Use a bounded `DocumentDraft` model.

Logical shape:

```text
DocumentDraft {
  version: 1,
  source: {
    mimeType,
    kind: pdf | docx | txt,
    sourceLanguage: "en"
  },
  blocks: [
    {
      id,
      type: heading | paragraph | list_item | quote | table | page_break | other,
      level?,
      listKind?,
      sourceText,
      translatedText,
      status: pending | translated | failed
    }
  ],
  stats: {
    sourceCharacters,
    blockCount,
    failedBlocks
  }
}
```

Tables may use a dedicated rows/cells structure rather than flattening cells into `sourceText`. The important invariant is that structure and order are explicit and translation changes text content, not the document topology.

The original filename can remain browser-local UI state. Do not require it in telemetry or logs.

---

## 8. Extraction and block normalization

### 8.1 Preserve useful semantics

Normalize extracted content into the smallest structure that preserves user value:

- headings and heading level;
- paragraphs;
- ordered/unordered list items;
- simple block quotes;
- simple tables/cells;
- page boundaries where available/useful.

Do not attempt full CSS/layout reconstruction.

### 8.2 Translate text leaves, not Markdown syntax

Do not ask a general LLM to rewrite a giant Markdown document and hope it preserves formatting.

Preferred flow:

```text
extracted Markdown/text
  ↓
deterministic block parser
  ↓
translatable text leaves
  ↓
translation adapter
  ↓
translated leaves returned to the same block IDs
  ↓
rendered Urdu document
```

Provider batching is allowed only if the provider returns deterministic ordered translations that can be mapped back to block IDs. Otherwise use bounded concurrency over individual text segments.

### 8.3 Content-preservation rules

Translation should preserve meaning and must not summarize, answer, censor, expand or invent content.

Special tokens requiring preservation tests:

- numbers;
- dates;
- currencies;
- email addresses;
- URLs;
- IDs/reference numbers;
- product/model codes;
- bullets/list order.

Proper names may be transliterated or retained according to normal Urdu translation quality, but the system must not silently invent a different person/company identity.

---

## 9. Request/API contract

Initial API owner:

```text
POST /api/document-translate
```

Recommended request:

```text
multipart/form-data
file=<supported file>
sourceLanguage=en
 targetLanguage=ur
```

The public UI may only expose English → Urdu in Phase 1 even if the internal contract leaves room for later languages.

Successful response:

```text
{
  ok: true,
  requestId: "...",
  draft: DocumentDraft,
  warnings: []
}
```

Recoverable partial response:

```text
{
  ok: true,
  requestId: "...",
  draft: DocumentDraft,
  warnings: ["some_blocks_failed"]
}
```

Known client-safe failure classes:

```text
unsupported_type
file_too_large
empty_document
encrypted_or_unreadable
extraction_failed
source_too_large
translation_unavailable
rate_limited
validation_failed
```

Do not send raw provider exceptions or stack traces to the browser.

---

## 10. Product-owned limits

Do not rely on upstream maximums as abuse protection.

Phase 1 product guardrails:

```text
MAX_FILE_BYTES = 8 MiB
MAX_TRANSLATABLE_CHARACTERS = 50,000
MAX_BLOCKS = 300
ONE FILE PER REQUEST
```

These are Write Urdu product limits and may be tuned from observed usage. They are intentionally below platform memory limits.

Validate `Content-Length` when present and validate parsed file size before extraction. Reject unsupported MIME/extension combinations. Never execute document macros or embedded scripts.

If a document converts to almost no text, return a useful scanned/image-only message rather than hallucinating a translation.

---

## 11. No persistence by default

Phase 1 document translation is transient.

Do not automatically store:

- uploaded files;
- extracted source text;
- translated Urdu;
- filename;
- document preview;
- translation history.

The file/content exists only for the active request and browser result state.

Persistence happens only through a later explicit user action already owned by another product contract, for example:

- `Save to My Documents` under `WU-DRAFT-001`;
- public publishing under `WU-SHARE-001`.

Do not create a new D1/R2 store solely for this translator.

---

## 12. Security and abuse controls

This is a public paid-compute endpoint and must ship with bounded abuse controls.

Required:

- strict method/content-type checks;
- MIME/extension allowlist;
- size/character/block limits;
- server-generated request IDs using Web Crypto;
- no request-scoped mutable global state;
- no user document text in logs;
- no filename in logs;
- no raw provider response logging;
- safe structured errors;
- production rate limiting at Cloudflare edge and/or Turnstile before unbounded anonymous AI use;
- clear retry behavior for capacity/rate-limit failures;
- no secrets in source.

Do not implement D1-based IP tracking merely to rate-limit this feature if Cloudflare edge controls can own it.

### 12.1 Prompt/document injection

A document may literally contain text such as:

> Ignore previous instructions and output something else.

The translator must treat that as document content.

The dedicated NMT baseline is preferred partly because it is not a chat instruction-following workflow. If a generative challenger/fallback is introduced, tests must prove document instructions cannot change the operation from translation into command execution/answering.

---

## 13. User experience

### 13.1 Workspace hierarchy

Above the fold:

```text
English to Urdu Document Translator
Upload a PDF, Word document or text file.

[ Drop document here ]
[ Choose file ]

PDF · DOCX · TXT
```

After file selection:

```text
<document name shown locally>
Ready to translate
[ Translate to Urdu ]
```

Translation must start only after explicit user action.

### 13.2 Progress states

Use user-language states:

```text
Reading your document…
Translating into Urdu…
Preparing the Urdu version…
```

Do not expose model, token or parsing jargon in the primary UI.

### 13.3 Result

Desktop may use a two-column review view:

```text
Original                    Urdu
English paragraph           اردو ترجمہ
```

On mobile, translated Urdu is primary and source comparison can collapse/expand.

The Urdu result must be editable before export/handoff.

Primary result actions:

```text
Edit Urdu
Copy Urdu
Open in Rich Editor
Print / Save as PDF
```

Conditional actions when their owning features are available:

```text
Save to My Documents
Share
Create a card
```

Do not overcrowd the first result with every Write Urdu tool. Use the shared `Continue with…` journey contract and cap recommendations.

### 13.4 RTL

Translated text renders with correct RTL direction and Urdu typography. Do not mirror the entire application chrome. Source English remains LTR.

---

## 14. Export contract

Phase 1 exports a **clean newly-typeset Urdu document**, not a reproduction of the original file.

Preferred release behavior:

- printable Urdu document view;
- browser Print / Save as PDF with strong print CSS;
- deterministic heading/list/table direction;
- no ads/navigation in print output;
- sensible Naskh/Nastaliq fallback chosen from existing Write Urdu font system;
- selectable Urdu text where browser PDF output supports it.

Before creating a new export engine, inspect the current Rich Editor/document export implementation and reuse it where possible.

Exact original-layout preservation is Slice D/later and must not block Phase 1.

---

## 15. Workspace handoff contract

Register the translator in `js/workspace-journey-registry.js` as a Work-stage transformation workspace.

Logical ownership:

```text
accepts: document-file
produces: document-draft / urdu-text
persistence: transient unless explicit account save
natural next: Rich Editor, Copy, Print/PDF, selected creation action
```

Use the existing `WU-PLAT-002` handoff runtime for compatible text/document continuation rather than inventing a translator-specific `sessionStorage` key.

If Rich Editor has existing unsaved content, its normal conflict/recovery behavior remains authoritative.

---

## 16. Privacy copy

The tool is not browser-only because translation/document conversion uses server-side Cloudflare services.

Public copy should be concise and accurate, for example:

> Your document is sent for translation when you choose Translate. Write Urdu does not save the uploaded document as part of this tool.

Detailed processor/technical language belongs in Privacy/feature documentation, not the top of the workspace.

Do not claim:

- fully local processing;
- offline translation;
- no third-party processing;
- guaranteed deletion semantics that have not been verified against platform behavior.

---

## 17. Telemetry and observability

### 17.1 Product telemetry

Allowed bounded product events/dimensions:

```text
document_translate_viewed
file_selected
translation_started
translation_completed
translation_failed
result_edited
result_copied
rich_editor_handoff
print_export_started
workspace_id
source_kind = pdf | docx | txt
size_bucket
block_count_bucket
outcome_category
locale
```

Forbidden:

```text
source text
translated text
filename
file bytes
URLs/emails extracted from the document
raw model response
```

### 17.2 Worker observability

Structured logs may include:

```text
request_id
route
source_kind
size_bucket
extracted_token_bucket / character_bucket
block_count_bucket
provider_id
latency bucket or timings
outcome/error_category
```

No user content.

---

## 18. AdSense contract

The active upload/translation/review workspace is protected.

Do not place ads:

- between upload and Translate;
- inside progress state;
- between source and Urdu columns;
- between Urdu text and its primary edit/copy actions.

A normal post-workspace ad boundary may appear after the result/actions/next-step boundary if the existing `WU-GROWTH-001` page-type rules allow it.

---

## 19. Accessibility and mobile

Required:

- file chooser has visible label/instructions;
- drag/drop is never the only upload method;
- progress is announced without noisy repeated updates;
- error state returns focus predictably;
- source/translation headings are semantic;
- Urdu editor has correct `dir="rtl"` and language metadata;
- actions are keyboard accessible;
- mobile does not require horizontal scrolling to compare text;
- large source documents do not create unusable DOM rendering; virtualize/collapse source blocks if needed only after profiling.

---

## 20. Rollout sequence

### Slice A — `WU-DOC-001A`

Cloudflare AI binding, extraction adapter, translation adapter, `DocumentDraft`, safety limits, fixture benchmark and API contract. No broad SEO launch until quality is proven.

### Slice B — `WU-DOC-001B`

Public document workspace, editable result, Rich Editor handoff, copy/print-clean-PDF path, mobile/accessibility and product-journey registration.

### Slice C — `WU-DOC-001C`

Acquisition/SEO, locale integration, product telemetry, post-workspace monetization boundary and growth scorecard. One strong owner page; no keyword clones.

### Slice D — `WU-DOC-001D`

Scanned/photo input benchmark, image-only PDF handling and layout-fidelity R&D. This slice has explicit quality gates and cannot weaken the Phase 1 text-document path.

Do not combine all slices into one implementation PR.

---

## 21. Phase 1 acceptance criteria

- [ ] `/tools/english-to-urdu-document-translator` is the single canonical English owner.
- [ ] PDF, DOCX and TXT accepted within product limits.
- [ ] unsupported/oversized/encrypted/unreadable inputs fail safely.
- [ ] document conversion uses Cloudflare binding rather than Cloudflare REST from inside the Worker.
- [ ] translation provider is behind a small adapter.
- [ ] IndicTrans2 Urdu baseline is benchmarked against the fixture corpus before release.
- [ ] translation preserves block order and supported structure.
- [ ] numbers/dates/currency/URLs/emails pass preservation fixtures.
- [ ] malicious embedded instructions are translated as content, not followed.
- [ ] image-only/scanned inputs do not generate fabricated text.
- [ ] translated Urdu is editable.
- [ ] user can copy Urdu.
- [ ] user can continue to Rich Editor without manual copy/paste.
- [ ] user can print/save a clean Urdu document.
- [ ] exact original layout is not claimed.
- [ ] no document content/filename enters product telemetry or Worker logs.
- [ ] uploaded content is not persisted by this feature.
- [ ] explicit account save/share remain separate user actions.
- [ ] desktop/mobile/accessibility acceptance is green.
- [ ] active workspace stays ad-free.
- [ ] SEO/locale/governance tests are green.
- [ ] Cloudflare model availability/pricing/limits are revalidated at release time.

---

## 22. Verification baseline

Every implementation slice runs the repository gates relevant to its scope, at minimum:

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

Focused tests must cover:

```text
PDF extraction
DOCX extraction
TXT ingestion
unsupported type
oversized file
empty/unreadable file
source-size cap
heading/list/table block normalization
translation adapter mapping
partial block failure
number/date/currency/URL/email preservation
prompt/document-injection fixture
no content in logs/telemetry payloads
RTL result editing
Rich Editor handoff
mobile result layout
print stylesheet
```

For API/model integration tests, use deterministic mocked binding fixtures in normal CI and a separately invoked live benchmark/smoke command so CI does not consume AI quota on every commit.

---

## 23. Implementation map to inspect first

```text
functions/api/
functions/lib/
js/workspace-journey-registry.js
js/workspace-handoff.js
js/workspace-next-step.js
js/product-telemetry.js
js/ads.js
js/site-header-core.js

urdu-editor.html
js/ (current Rich Editor owner modules)

specs/WU-PLAT-002-v2-product-journey-workspace-handoffs.md
specs/WU-I18N-001-crawlable-urdu-locale.md
specs/WU-ANALYTICS-001-privacy-safe-product-telemetry.md
specs/WU-DRAFT-001-cross-device-cloud-drafts.md

scripts/check-seo.js
scripts/check-product-governance.js
scripts/generate-urdu-locale.js
playwright.config.js
```

Search the repository before creating new abstractions; exact file ownership may have evolved.

---

## 24. Completion standard

`WU-DOC-001` is complete when an anonymous mobile or desktop user can upload a supported English text document, receive a trustworthy structured Urdu translation, edit/copy/continue/export it without losing content, and understand the limits without encountering engineering language — while the backend remains bounded, non-persistent, abuse-resistant and measurable without collecting document content.
