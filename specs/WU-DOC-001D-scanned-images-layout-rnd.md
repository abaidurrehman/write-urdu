# WU-DOC-001D — Scanned Documents, Images + Layout R&D

**Parent:** `WU-DOC-001`  
**Depends on:** stable Phase 1 text-document translator  
**Status:** Planned — gated expansion  
**Date:** 2026-08-24  
**Scope:** image/scanned input, OCR/vision benchmark, image-only PDF handling, layout-preservation research

---

## 1. Goal

Extend the proven document translator to photo/screenshot/scanned-document inputs without contaminating the reliable text-document path.

Potential user flow:

```text
Take/upload a photo or scanned PDF
        ↓
extract visible text accurately
        ↓
English → Urdu translation
        ↓
review/edit in the same DocumentDraft workspace
```

This slice is gated because image conversion and layout reconstruction are materially different quality problems from text PDF/DOCX extraction.

---

## 2. Inputs to benchmark

```text
JPG
JPEG
PNG
WEBP
image-only/scanned PDF
rotated phone photo
low-contrast scan
perspective/skewed photo
multi-column notice
simple table
```

Do not advertise a format until its extraction quality passes the benchmark.

---

## 3. Cloudflare starting point

Cloudflare `toMarkdown` currently supports image conversion as well as PDF conversion. Cloudflare documentation notes that image conversion uses vision/object-detection models and describes content on a best-effort basis.

That does **not** automatically establish production OCR fidelity.

Benchmark at least:

1. `env.AI.toMarkdown` image conversion;
2. a current Cloudflare vision model only if a dedicated extraction prompt/schema produces materially better text fidelity;
3. any later dedicated OCR capability available on the platform at implementation time.

Prefer the simplest Cloudflare-native path that meets the text-extraction gate.

Do not add an external OCR vendor before proving Cloudflare-native options insufficient.

---

## 4. Extraction benchmark corpus

Create synthetic/public-domain fixtures including:

- clean screenshot with English paragraphs;
- phone photo of a printed notice;
- 90° rotated photo;
- perspective-skewed page;
- low contrast/uneven lighting;
- small text;
- English headings + bullets;
- numbers/dates/currency;
- URL/email;
- simple table;
- decorative image plus text;
- malicious instruction printed in the image;
- no-text image.

Measure extraction separately from translation. A good Urdu translation of wrongly extracted English is still a failed document result.

---

## 5. OCR/extraction quality gate

Record:

```text
character/word fidelity
line/paragraph order
number/date fidelity
URL/email fidelity
heading/list/table recognition
rotation robustness
hallucinated text
```

Release requires:

- no meaningful hallucinated paragraphs in the benchmark corpus;
- high fidelity on clean screenshots/phone photos;
- exact numeric/date/URL/email preservation on deterministic fixtures;
- safe `could_not_read_document` result rather than invented text when confidence is inadequate.

If the platform does not expose reliable confidence, use deterministic heuristics and human benchmark evidence. Do not manufacture a fake confidence percentage.

---

## 6. Reuse the same translation pipeline

Once English text is extracted, normalize it into the same `DocumentDraft` blocks and use the same translation adapter as Slice A.

Do not build:

```text
/image-translate API with its own Urdu translation logic
```

when the only difference is extraction.

The owning state remains:

```text
DocumentDraft
```

---

## 7. Layout preservation research

Exact source-layout preservation is a separate decision from OCR.

Research questions:

- can source blocks/bounding boxes be reliably recovered?
- how should LTR boxes map to longer/shorter RTL Urdu text?
- table column direction?
- fonts and shaping?
- images/backgrounds?
- line wrapping/page overflow?
- headers/footers?
- selectable text vs raster overlay?

Do not block scanned-text launch on layout preservation if clean newly-typeset Urdu already solves the user job.

Possible later tiers:

```text
Tier 1: clean Urdu document (already Phase 1)
Tier 2: preserve semantic structure + images
Tier 3: approximate source layout
Tier 4: high-fidelity layout replacement
```

Each tier requires its own benchmark and truthful product promise.

---

## 8. Reverse translation and more Office formats

This slice may collect evidence but must not automatically add:

- Urdu → English;
- PPTX;
- XLSX;
- arbitrary language pairs.

Those are separate product/SEO decisions even if the infrastructure could support them.

---

## 9. Acceptance criteria for scanned-image launch

- [ ] text-document Phase 1 remains unchanged/green.
- [ ] image/scanned extraction benchmark recorded separately from translation.
- [ ] no-text/low-quality images fail safely without hallucinated document text.
- [ ] rotated/perspective/common phone-photo fixtures evaluated.
- [ ] extracted numbers/dates/URLs/emails preservation gate passes.
- [ ] malicious printed instruction remains content, not control.
- [ ] extracted result normalizes into existing `DocumentDraft`.
- [ ] same translation adapter used.
- [ ] supported images have product size/dimension limits.
- [ ] no source image/file/content persisted by default.
- [ ] public copy distinguishes clean translation from exact-layout preservation.
- [ ] layout-preservation work remains separately gated until benchmarked.
