# WU-JOURNEY-001F — Professional Print, Word, PDF & InPage Journey

**Status:** Planned / evidence-gated; print-fidelity audit may start earlier if isolated  
**Priority:** P1  
**Parent:** `WU-JOURNEY-001`  
**Builds on:** Rich Editor, current raster PDF/PNG/Print exports, InPage↔Unicode converter, Text Cleaner, existing Nastaliq font stack  
**Related:** `WU-API-001` InPage↔Unicode developer API

---

## 1. Objective

Turn WriteUrdu's existing professional/document capabilities into a coherent end-to-end workflow for users who need Urdu beyond social media: formal documents, print, design handoff, Word/PDF and legacy InPage workflows.

The product already has most of the pieces. The gap is continuity, **print-quality evidence**, framing and measurement.

The first professional-print question is not “how do we replace InPage?” It is:

> **How good is WriteUrdu’s current Nastaliq/RTL output for realistic simple print jobs, and where does it fail?**

---

## 2. Existing capability map

### 2.1 Rich Editor / shared export runtime

Already supports:

- Roman/direct Urdu input;
- headings/fonts/colour/alignment;
- Word export;
- PDF export;
- PNG export;
- Print Preview.

Important current implementation detail:

- the shared PDF path renders the browser document to a canvas with `html2canvas`;
- the resulting raster canvas is sliced and embedded as JPEG images into an A4 jsPDF document;
- therefore the visual result inherits browser font shaping/layout, but the PDF body is image content rather than guaranteed selectable/searchable Unicode text.

This is not automatically bad for a print proof, but it matters for quality, accessibility, file size and professional positioning.

### 2.2 Nastaliq font baseline

WriteUrdu already uses `Noto Nastaliq Urdu` across multiple creation/presentation surfaces and also supports Naskh/other Urdu fonts.

Do not start by assuming we need a new proprietary Noori Nastaliq-equivalent font or a HarfBuzz/WASM renderer.

First benchmark the current browser/OpenType shaping and export pipeline.

### 2.3 InPage ↔ Unicode converter

Already supports:

- pasted legacy InPage-oriented text → Unicode;
- Unicode → supported legacy text;
- unsupported-character reporting;
- safe preservation of unknown characters;
- handoff to Text Cleaner / WriteUrdu.

`WU-API-001` also plans npm/API exposure of the existing conversion engine.

### 2.4 Text Cleaner

Already supports repair of common spacing/Unicode/RTL issues.

These must be connected rather than duplicated.

---

## 3. User jobs

### 3.1 Legacy text → modern document

`InPage copied text → Unicode → clean/review → Rich Editor → Word/PDF/Print`

### 3.2 Modern writing → legacy handoff

`Write in Unicode → format/review → optional Unicode→legacy InPage text conversion → print/publisher workflow`

### 3.3 Formal document

`Roman/direct/voice/template input → Rich Editor → readable editing → final typography → Word/PDF/Print`

### 3.4 Printer/designer handoff

`source text → clean Unicode master → legacy payload if required → visual proof → external print/design software`

### 3.5 Simple browser-native print job

Potential bounded jobs:

- A4 notice;
- A5 flyer/notice;
- simple invitation/proof;
- one/few-page formal Urdu document.

WriteUrdu should be explicit about where its responsibility ends.

---

## 4. Product positioning rule

Do **not** position WriteUrdu as “an InPage replacement” in v1.

A stronger, truthful position is:

> **Write and keep a clean Unicode master. Export a proof or document. Convert to legacy InPage text only when a shop/publisher still needs it.**

This supports modern workflows while respecting institutional lock-in rather than pretending it has disappeared.

---

## 5. Non-goals

This spec does not approve:

- full `.inp` document parsing;
- preserving arbitrary InPage page layout;
- claiming byte-perfect compatibility with every InPage version;
- claiming visual equivalence to every Noori Nastaliq/InPage setup before benchmark evidence;
- replacing Word/InPage/CorelDRAW desktop publishing software;
- a new desktop publishing engine;
- uploading private documents to a server merely to improve formatting;
- a HarfBuzz/WASM integration before the current browser shaping pipeline is benchmarked;
- a proprietary-font licensing commitment before current open font options are evaluated;
- new export formats without demand evidence.

The current converter correctly states that pasted text conversion is not full document conversion. Preserve that truth.

---

## 6. F0 — Print-grade Nastaliq fidelity research spike

This is the first new technical addition from the external feedback and should happen before print marketing promises.

### 6.1 Reference fixture set

Create a small, versioned set of **original/public-safe** Urdu print fixtures covering:

- short Nastaliq paragraph;
- long paragraph wrapping;
- multi-page text;
- headings + body;
- poetry/couplet;
- Urdu + English name;
- Urdu + phone-number-shaped string;
- Urdu + PKR/amount;
- Urdu + URL/email-shaped string;
- punctuation/parentheses;
- numerals;
- common ligature-heavy words/phrases;
- line breaks and indents.

Do not use copyrighted newspaper/book pages as committed golden fixtures without permission.

### 6.2 Outputs to compare

For every fixture capture:

1. browser Rich Editor/preview;
2. current PDF export;
3. current PNG export;
4. Print Preview/browser print;
5. Word export where meaningful;
6. a manually prepared professional/InPage reference sample where legally available for visual comparison.

### 6.3 Quality dimensions

Score/document:

- glyph joining/shaping;
- Nastaliq baseline/diagonal flow;
- ligatures;
- dot/mark placement;
- word/line spacing;
- line wrapping;
- RTL alignment;
- mixed LTR/RTL ordering;
- page-break/slicing artefacts;
- clipping;
- resolution at typical print size;
- font fallback when webfont is unavailable;
- consistency between preview and download;
- PDF text selectability/searchability;
- PDF file size;
- accessibility implications.

### 6.4 Browser/device matrix

At minimum where available:

- desktop Chromium;
- Edge/Chromium;
- Safari/macOS/iOS for supported workflows;
- Android Chrome for preview/export initiation.

Professional print validation can be desktop-led, but mobile must not produce a misleading preview.

### 6.5 Decision outcomes

The spike may conclude:

- **Keep current raster PDF** for simple proof jobs;
- improve resolution/page slicing only;
- self-host/bundle an open Nastaliq font for export reliability;
- add print presets;
- build a true text-based PDF path for selectable Unicode;
- investigate a shaping library only for a demonstrated browser/library gap;
- or reject “print-grade replacement” positioning while still improving the handoff journey.

Do not decide the rendering architecture before measuring the current one.

---

## 7. Font sourcing / licensing gate

Current use of Noto Nastaliq Urdu provides an immediate open-font baseline.

Before adding another font:

- verify its license permits web embedding and generated document/image use;
- record license/source in the repository;
- test Urdu coverage, digits, punctuation and mixed-script behaviour;
- measure font file/critical-path impact;
- prefer route-scoped loading for heavy presentation fonts;
- avoid shipping font files to end users outside the product bundle/license terms.

A “Noori Nastaliq-equivalent” aesthetic target is not itself permission to copy or redistribute proprietary font assets.

---

## 8. Journey architecture

### 8.1 InPage → Unicode completion

After successful conversion, the most useful next actions should be contextual:

Primary candidates:

- Copy Unicode result;
- Clean text;
- Format / prepare document.

For `print_design` intent, `Format / prepare document` may route to Rich Editor with safe state handoff.

### 8.2 Rich Editor completion

For substantial/formal writing, prioritize proven outputs:

- Word;
- PDF;
- Print Preview.

Legacy/InPage continuation should remain a secondary specialist action, not clutter the primary document toolbar for every user.

### 8.3 Unicode → legacy InPage text

Expose when the user explicitly chooses legacy/InPage intent or enters through the converter.

Do not imply that formatted Word/PDF layout survives text conversion.

---

## 9. Candidate “Print Pack” — evidence-gated

The feedback suggests a useful print-shop companion concept. Treat it as a v1 candidate after F0, not an automatic build.

A bounded Print Pack could contain **actions/outputs**, not a new archive format:

1. **Unicode master**
   - Copy Unicode;
   - optional `.txt` if the existing download path supports it cleanly.

2. **Legacy InPage payload**
   - Copy converted legacy text;
   - retain unsupported-character warnings.

3. **Visual proof**
   - PDF or high-resolution PNG using an approved print preset.

4. **Checklist**
   - keep Unicode as the master;
   - test a short sample in the target InPage setup;
   - review names/numbers/punctuation;
   - understand that text conversion does not preserve page layout.

Do not promise that a print shop can ingest one universal “pack” file.

---

## 10. Print presets — after fidelity spike

Candidate presets:

- A4 document/notice;
- A5 notice/flyer;
- 4×6 invitation/proof.

Potential properties:

- page size;
- safe margins;
- optional heading area;
- typography preset;
- export resolution.

**Bleed** should not be exposed as a generic setting unless the output pipeline truly supports edge-to-edge design and a specific printer workflow requires it. A document editor is not automatically a prepress application.

---

## 11. Typography model

Professional/document Urdu has two competing needs:

1. **editing readability** on screens, especially mobile;
2. **presentation authenticity/beauty**, often Nastaliq, in the final output.

Evaluate a reversible document presentation preset using existing fonts:

- `Readable while editing`;
- `Traditional Nastaliq` / print-oriented preset.

Requirements:

- no TinyMCE replacement;
- no forced font override when the user has already chosen formatting;
- export preview must reflect final selection;
- mobile line-height/readability must remain acceptable;
- print preset must not silently alter copied Unicode.

---

## 12. Professional guidance content

Provide concise task guidance around:

- Unicode as the modern master text;
- legacy InPage text compatibility when required;
- why copied legacy text can look broken;
- when Text Cleaner helps;
- when to use Word vs PDF vs Print Preview;
- current PDF selectability/visual-proof limitations if still applicable after F0;
- limitations of Unicode→legacy text conversion;
- reviewing names/numbers/punctuation before professional use.

Lead with the job. Technical vocabulary should explain, not dominate the first screen.

---

## 13. Trust / processing wording

Do not market the entire professional flow as “nothing leaves your browser” without checking the actual action.

Many relevant pieces are local/browser-side, but the broader platform includes provider-assisted transliteration, optional account/public-share features and planned hosted API surfaces.

Use capability-specific wording consistent with the current privacy page.

---

## 14. Measurement

For `print_design` intent or professional workflow entry, measure:

- converter direction selected;
- conversion success/warning **count bucket** only, not characters/content;
- Cleaner continuation;
- Rich Editor handoff;
- destination ready;
- first meaningful edit;
- Word/PDF/Print outcome;
- proof export;
- Unicode→legacy continuation;
- handoff failure.

Do not log:

- source/result text;
- filenames;
- unsupported characters themselves if they could expose content;
- print-shop names/contact details.

---

## 15. Search / acquisition opportunity

Treat professional/legacy Urdu as a specialist cluster.

Potential useful intent themes:

- InPage to Unicode;
- Unicode to InPage;
- Urdu text for Word;
- Urdu document PDF;
- Urdu print formatting;
- online Urdu/InPage workflow guidance.

Do not create near-identical conversion doorway pages. Existing converter and Rich Editor should remain the primary product owners unless GSC demonstrates a distinct intent requiring a support guide.

Avoid unsupported comparison claims such as “better than InPage” or “replace InPage online” before F0 evidence and product scope support them.

---

## 16. Implementation slices

### F0 — Print/Nastaliq fidelity benchmark

- create reference fixture set;
- capture current preview/PDF/PNG/print/Word behaviour;
- document shaping/layout/raster/selectability issues;
- compare against legal professional reference outputs where available;
- recommend rendering/export path before coding a replacement.

### F1 — Journey audit

- verify current Rich/Converter/Cleaner handoffs;
- identify broken/missing state transfer;
- map current outputs and telemetry.

### F2 — Converter → document continuation

- add/validate `Format / prepare document` continuation after safe Unicode conversion;
- preserve text through existing handoff store;
- instrument destination ready + first edit.

### F3 — Rich Editor professional completion hierarchy

After P0/core convergence permits:

- validate Word/PDF/Print prominence for substantial/formal jobs;
- keep legacy InPage secondary/specialist;
- only modify export engine if F0 identifies a specific deficiency.

### F4 — Print preset prototype

If F0 supports the approach:

- implement one or two bounded sizes first;
- verify preview/download consistency;
- no generic prepress feature explosion.

### F5 — Print Pack prototype

Only if converter + print intent shows demand:

- Unicode master actions;
- legacy payload action;
- proof export;
- explicit checklist/limitations;
- no `.inp` claim.

### F6 — Typography/readability preset experiment

- implement only if current font infrastructure supports it cleanly;
- reversible;
- verify Word/PDF/print fidelity;
- test mobile readability.

### F7 — Professional support content

- one coherent guide or integrated help section;
- explain legacy/Unicode boundaries truthfully;
- internal links to Converter/Cleaner/Rich Editor;
- reflect actual privacy/processing behaviour.

### F8 — Evidence review

- measure how many users actually traverse converter → document/export;
- measure proof/print-pack usage if shipped;
- decide whether deeper InPage/document R&D is justified;
- full `.inp` document conversion remains separately gated.

---

## 17. Acceptance

1. Existing converter still handles pasted text only and states that clearly.
2. Feedback claim that “InPage output is missing” is not encoded into the implementation plan; existing conversion is reused.
3. Current PDF/rendering baseline is documented before a new shaping/export architecture is chosen.
4. Unsupported/ambiguous conversion characters remain visible/reviewable rather than silently guessed.
5. User text is never placed in internal URLs or analytics.
6. InPage→Unicode can hand off safely to Cleaner/Rich Editor.
7. Rich Editor Word/PDF/Print remain functional.
8. Legacy/InPage actions do not clutter the mainstream writer journey.
9. Any print/typography preset is reversible and does not overwrite explicit user formatting.
10. Preview/download fidelity is validated on representative Urdu fixtures.
11. Mixed Urdu/English/numbers/URLs are in the print QA set.
12. Font licenses are recorded before bundling new font assets.
13. Mobile readability remains acceptable.
14. Professional support content does not overclaim compatibility, privacy or InPage replacement.
15. Deeper `.inp`/layout work requires new evidence and a separate contract.