# WU-DOC-001 — Cloudflare feasibility note

**Date checked:** 2026-08-24  
**Purpose:** record the current platform evidence behind `WU-DOC-001`; implementation must revalidate volatile details before release.

---

## Decision summary

A first-party English → Urdu document translator is technically feasible on the existing Cloudflare stack without first adopting a third-party document parser or translation vendor.

Recommended Phase 1 pipeline:

```text
Pages/Worker Function
  ↓
Workers AI toMarkdown (PDF/DOCX)
  ↓
DocumentDraft normalization
  ↓
Workers AI IndicTrans2 English → Urdu
  ↓
transient JSON result
  ↓
Write Urdu editable workspace / Rich Editor handoff
```

TXT can bypass rich-document conversion.

---

## 1. Document conversion

Cloudflare Workers AI exposes a Markdown conversion service through the AI binding and REST API.

Official docs checked:

- https://developers.cloudflare.com/workers-ai/features/markdown-conversion/
- https://developers.cloudflare.com/workers-ai/features/markdown-conversion/supported-formats/
- https://developers.cloudflare.com/workers-ai/features/markdown-conversion/how-it-works/
- https://developers.cloudflare.com/workers-ai/features/markdown-conversion/usage/binding/

As of this check, supported formats include:

- PDF;
- DOCX;
- images including JPEG/PNG/WebP;
- multiple spreadsheet/open-document formats;
- HTML/XML/CSV and others.

For PDFs, Cloudflare documents that it attempts to use the PDF semantic `StructTree` when available and otherwise extracts page text.

This strongly supports using Cloudflare conversion rather than maintaining our own PDF/DOCX parser for Phase 1.

### Important limitation

Image support does not equal guaranteed OCR fidelity. Cloudflare describes image conversion as a model-assisted process and some options are best-effort. Scanned/photo support therefore remains benchmark-gated in `WU-DOC-001D`.

---

## 2. English → Urdu translation

Official model page checked:

- https://developers.cloudflare.com/workers-ai/models/indictrans2-en-indic-1B/

Model:

```text
@cf/ai4bharat/indictrans2-en-indic-1B
```

Cloudflare describes IndicTrans2 as a multilingual translation model for Indic languages. The current target-language enum includes:

```text
urd_Arab
```

which makes it a direct baseline candidate for English → Urdu script translation.

Implementation still needs a human quality benchmark; model availability is not proof of acceptable product Urdu.

---

## 3. Cost signal

Official pricing checked:

- https://developers.cloudflare.com/workers-ai/platform/pricing/

On 2026-08-24, Cloudflare documents:

- 10,000 Workers AI neurons/day free allocation;
- paid usage above the allocation on eligible paid plans;
- IndicTrans2 at approximately `$0.342 / M input tokens` and `$0.342 / M output tokens` (equivalently priced through the current neuron accounting shown by Cloudflare).

These values can change. They are not product copy and must be rechecked before commercial/capacity decisions.

The Phase 1 product limits in `WU-DOC-001` intentionally bound anonymous spend independently of Cloudflare's platform maximums.

---

## 4. Binding over REST

Cloudflare's current Workers best-practices guidance says to prefer in-process bindings for Cloudflare services over calling Cloudflare REST APIs from inside Workers.

Official guidance checked:

- https://developers.cloudflare.com/workers/best-practices/workers-best-practices/

Implementation implication:

```text
env.AI.toMarkdown(...)
env.AI.run(...)
```

is preferred inside the runtime over fetching `api.cloudflare.com` with an API token.

This reduces network/auth complexity and avoids storing a Cloudflare API token solely for this feature.

---

## 5. Worker safety notes

The same current best-practices guide reinforces requirements included in the feature specs:

- enforce a maximum size before consuming file uploads;
- do not buffer unbounded request/response bodies;
- do not store request-scoped mutable state globally;
- await required promises;
- use Web Crypto for security-sensitive random values;
- use structured observability;
- do not put secrets in source.

Phase 1's 8 MiB file cap is a Write Urdu product limit, not a statement of Cloudflare's maximum body size.

---

## 6. Why not promise layout preservation yet

Cloudflare's conversion utility solves semantic extraction, not the product problem of replacing every LTR English text box with shaped RTL Urdu while retaining exact pagination, fonts, tables and geometry.

Therefore:

```text
Phase 1 = clean editable Urdu document
```

and:

```text
later R&D = source-layout preservation
```

This keeps the first product slice bounded while leaving a path to a stronger document translator later.

---

## 7. Release-time revalidation checklist

Before shipping live AI integration, re-check official Cloudflare docs for:

- [ ] `AI` binding configuration for the repo's current Pages/Workers deployment model;
- [ ] `toMarkdown` supported PDF/DOCX formats;
- [ ] `toMarkdown` current input/return types;
- [ ] IndicTrans2 model availability;
- [ ] exact Urdu target identifier/input schema;
- [ ] model context/request limits;
- [ ] Workers AI pricing/free allocation;
- [ ] any new dedicated OCR/document-extraction models;
- [ ] current Workers runtime/best-practice changes.
