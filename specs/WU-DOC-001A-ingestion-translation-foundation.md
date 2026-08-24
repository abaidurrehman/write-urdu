# WU-DOC-001A — Document Ingestion + Translation Foundation

**Parent:** `WU-DOC-001`  
**Status:** Planned  
**Date:** 2026-08-24  
**Scope:** API, Cloudflare binding, extraction, structure normalization, translation adapter, safety limits, benchmark

---

## 1. Goal

Prove one bounded pipeline extremely well before building the public acquisition page:

```text
PDF / DOCX / TXT
      ↓
validated input
      ↓
extracted structured text
      ↓
DocumentDraft blocks
      ↓
English → Urdu translation
      ↓
translated DocumentDraft
```

This slice is successful when the pipeline is trustworthy on a fixed corpus and exposes a stable API contract that Slice B can consume.

Do not build scanned-image support or pixel-perfect layout reconstruction here.

---

## 2. Platform implementation

### 2.1 Binding first

Use a Workers AI binding in the existing Cloudflare Pages/Functions deployment if the repository/platform configuration supports it.

Inside Cloudflare runtime:

- use `env.AI.toMarkdown(...)` for rich-document extraction;
- use `env.AI.run(...)` for the selected Cloudflare translation model;
- do not call Cloudflare REST APIs from inside the Worker;
- do not hard-code API tokens;
- keep request-scoped state inside the request handler/functions, never module globals.

Before coding, re-check current Cloudflare docs and generated binding types. Do not copy a stale API signature from this spec.

### 2.2 Translation provider adapter

Logical adapter:

```text
translateSegments({
  segments,
  sourceLanguage: "en",
  targetLanguage: "ur",
  signal?
})

→ [{ id, translatedText, status }]
```

Baseline provider:

```text
@cf/ai4bharat/indictrans2-en-indic-1B
```

Target Urdu script identifier must be taken from current model docs/types; on 2026-08-24 Cloudflare documents `urd_Arab`.

Do not let model-specific response shapes leak into the route/UI.

---

## 3. Endpoint

Create one bounded owner endpoint:

```text
POST /api/document-translate
```

Request:

```text
multipart/form-data
file
```

Phase 1 language direction is fixed by product contract:

```text
English → Urdu
```

Do not trust a client-supplied arbitrary model or prompt.

### 3.1 Request sequence

1. require POST;
2. verify multipart content type;
3. reject declared body size beyond product cap when header is available;
4. parse one file;
5. validate file size;
6. sniff/validate allowed type (`pdf`, `docx`, `txt`);
7. extract source text/Markdown;
8. reject empty/near-empty extraction;
9. normalize into `DocumentDraft` blocks;
10. enforce character/block limits before paid translation;
11. translate text leaves;
12. assemble translated draft by stable block ID;
13. return client-safe JSON.

No file/content persistence.

---

## 4. Product limits

Initial constants:

```text
MAX_FILE_BYTES = 8 * 1024 * 1024
MAX_TRANSLATABLE_CHARACTERS = 50_000
MAX_BLOCKS = 300
MAX_FILES = 1
```

Keep limits centralized/configurable.

A later change may increase them from observed usage, but do not expose platform maximums as product limits.

---

## 5. Extraction

### PDF/DOCX

Use Cloudflare `toMarkdown` and request only the conversion options actually needed.

For PDFs, do not include metadata in user translation unless product requirements explicitly need it.

### TXT

Decode deterministically as UTF-8 with safe failure for unsupported/binary input.

### Empty/scanned detection

If a non-trivial PDF has no meaningful extracted text, classify it as likely scanned/image-only and return a recoverable message pointing to the later scanned-document capability.

Do not send an empty extraction to a generative model and accept invented content.

---

## 6. Block parser

Create a small deterministic normalization layer.

Required Phase 1 structures:

```text
heading(level, text)
paragraph(text)
list_item(kind, depth, text)
quote(text)
table(rows/cells)
page_break (when reliably available)
other(text)
```

The normalizer must:

- preserve source order;
- generate stable request-local block IDs;
- keep source text separate from translated text;
- not execute HTML/scripts/macros;
- reject absurd block counts before translation;
- preserve table cell ordering.

Do not introduce a heavyweight document-rendering framework in this slice.

---

## 7. Translation execution

Translate document text leaves without handing the provider document-control semantics.

Preferred behavior:

- skip empty/whitespace-only leaves;
- translate bounded segments;
- use provider batch mode only if current API returns a deterministic one-to-one ordered result;
- otherwise use small bounded concurrency;
- map every response back to an explicit segment/block ID;
- retry only safe transient capacity/rate-limit failures with bounded attempts;
- return partial success when some blocks fail rather than destroying successful blocks;
- never re-submit successful chunks unnecessarily.

Do not let a single long paragraph bypass product/model chunk safeguards. Split at sentence/paragraph-safe boundaries if required by the current model limit, then deterministically reassemble.

---

## 8. Benchmark corpus

Create checked-in source fixtures and expected invariants. Do not check in sensitive real user documents.

Minimum corpus:

1. one-page school notice;
2. business letter;
3. government/public-information style notice;
4. prose with headings;
5. ordered + unordered lists;
6. simple 3×3 table;
7. dates/times;
8. decimal numbers and currency;
9. URLs and emails;
10. company/person/product names;
11. mixed punctuation and parentheses;
12. long paragraph crossing chunk boundary;
13. multi-page text PDF;
14. DOCX with headings/lists/table;
15. TXT;
16. empty document;
17. encrypted/unreadable PDF fixture if license-safe;
18. image-only/scanned PDF fixture;
19. malicious instruction text (`Ignore previous instructions...`) that must be translated literally;
20. mixed English with already-present Urdu text.

Use synthetic/public-domain fixtures only.

---

## 9. Quality gate

Before Slice B public launch, record a human-reviewed benchmark.

Required rubric:

```text
meaning fidelity: 1–5
natural Urdu/readability: 1–5
content omission/addition: pass/fail
structure preservation: pass/fail
numbers/dates/currency: pass/fail
URL/email preservation: pass/fail
instruction-following resistance: pass/fail
```

Release baseline:

- average meaning fidelity ≥ 4/5 across representative supported fixtures;
- average Urdu readability ≥ 4/5;
- zero material invented facts in the release corpus;
- zero dropped/changed URLs/emails in deterministic preservation fixtures;
- zero changed numeric values in deterministic numeric fixtures unless required only by presentation formatting and explicitly accepted;
- embedded malicious instructions are translated as content, not obeyed;
- block order/topology preserved for supported structures.

If IndicTrans2 misses the quality gate, benchmark one Cloudflare-hosted multilingual challenger against the exact same corpus. Keep the simpler/cheaper dedicated translation model if it meets the gate.

---

## 10. Logging and telemetry

API logs may include only bounded metadata:

```text
request_id
source_kind
size_bucket
character/token bucket
block_count_bucket
translation_provider
outcome/error_category
safe timing fields
```

Never log:

```text
filename
source text
translation
file bytes
extracted URLs/emails
raw model output
```

Normal tests must assert telemetry/log serializer objects cannot accept document content fields.

---

## 11. Abuse and failure handling

Before public release:

- configure an edge rate-limit strategy and/or Turnstile gate appropriate to anonymous AI calls;
- do not build a new D1 IP-log table solely for rate limiting;
- return `429`/safe error category when bounded limits are hit;
- map provider capacity/outage failures to retryable product messages;
- use Web Crypto for request IDs;
- do not expose stack traces/model internals.

---

## 12. Files likely involved

Inspect first:

```text
functions/api/
functions/lib/
current Cloudflare binding/deployment config
js/product-telemetry.js
package.json
scripts/run-contract-tests.js
```

Possible new owners after repo inspection:

```text
functions/api/document-translate.js
functions/lib/document-ingestion.mjs
functions/lib/document-blocks.mjs
functions/lib/document-translation.mjs
```

Names are suggestions, not permission to duplicate existing owners.

---

## 13. Acceptance criteria

- [ ] AI binding configured through current supported Cloudflare mechanism.
- [ ] PDF/DOCX use `toMarkdown`; TXT deterministic path works.
- [ ] direct binding used rather than Cloudflare REST from runtime.
- [ ] one translation adapter hides model specifics.
- [ ] `DocumentDraft` structure is versioned and stable.
- [ ] source order/heading/list/table fixtures pass.
- [ ] product size/block/character caps enforced before translation.
- [ ] scanned/empty content fails without hallucination.
- [ ] partial block failures are recoverable.
- [ ] no user content/filename is persisted or logged.
- [ ] benchmark report recorded against release model.
- [ ] prompt/document injection fixture passes.
- [ ] deterministic CI uses mocks; live AI test is opt-in/manual/release-gated.
- [ ] relevant repository gates are green.
