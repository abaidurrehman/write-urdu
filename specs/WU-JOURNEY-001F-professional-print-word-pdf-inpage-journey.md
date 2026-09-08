# WU-JOURNEY-001F — Professional Print, Word, PDF & InPage Journey

**Status:** Planned / evidence-gated  
**Priority:** P1  
**Parent:** `WU-JOURNEY-001`  
**Builds on:** Rich Editor, Word/PDF/Print exports, InPage↔Unicode converter, Text Cleaner  
**Related:** `WU-API-001` InPage↔Unicode developer API

---

## 1. Objective

Turn WriteUrdu's existing professional/document capabilities into a coherent end-to-end workflow for users who need Urdu beyond social media: formal documents, print, design handoff, Word/PDF and legacy InPage workflows.

The product already has most of the pieces. The gap is continuity, framing and measurement.

---

## 2. Existing capability map

### Rich Editor

Already supports:

- Roman/direct Urdu input;
- headings/fonts/colour/alignment;
- Word export;
- PDF export;
- PNG export;
- Print Preview.

### InPage ↔ Unicode converter

Already supports:

- pasted InPage/legacy text → Unicode;
- Unicode → supported legacy text;
- unsupported-character reporting;
- safe preservation of unknown characters;
- handoff to Text Cleaner / WriteUrdu.

### Text Cleaner

Already supports repair of common spacing/Unicode/RTL issues.

These must be connected rather than duplicated.

---

## 3. User jobs

### Legacy text → modern document

`InPage copied text → Unicode → clean/review → Rich Editor → Word/PDF/Print`

### Modern writing → legacy handoff

`Write in Unicode → format/review → optional Unicode→InPage text conversion → legacy workflow`

### Formal document

`Roman/direct/voice/template input → Rich Editor → readable editing → final typography → Word/PDF/Print`

### Printer/designer handoff

`source text → clean Unicode → final text/document/image → external print/design software`

WriteUrdu should be explicit about where its responsibility ends.

---

## 4. Non-goals

This spec does not approve:

- full `.inp` document parsing;
- preserving arbitrary InPage page layout;
- claiming byte-perfect compatibility with every InPage version;
- replacing Word/InPage desktop publishing software;
- uploading private documents to a server merely to improve formatting;
- a new desktop publishing engine;
- new export formats without demand evidence.

The current converter correctly states that pasted text conversion is not full document conversion. Preserve that truth.

---

## 5. Journey architecture

### 5.1 InPage → Unicode completion

After successful conversion, the most useful next actions should be contextual:

Primary candidates:

- Copy Unicode result;
- Clean text;
- Format / prepare document.

For `print_design` intent, `Format / prepare document` may route to Rich Editor with safe state handoff.

### 5.2 Rich Editor completion

For substantial/formal writing, prioritize proven outputs:

- Word;
- PDF;
- Print Preview.

Legacy/InPage continuation should remain a secondary specialist action, not clutter the primary document toolbar for every user.

### 5.3 Unicode → InPage

Expose only when the user explicitly chooses legacy/InPage intent or enters through the converter.

Do not imply that formatted Word/PDF layout survives text conversion.

---

## 6. Typography model

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
- mobile line-height/readability must remain acceptable.

---

## 7. Professional guidance content

Provide concise task guidance around:

- Unicode vs legacy InPage text;
- why copied legacy text can look broken;
- when Text Cleaner helps;
- when to use Word vs PDF vs Print Preview;
- limitations of Unicode→InPage text conversion;
- reviewing names/numbers/punctuation before professional use.

Lead with the job. Technical vocabulary should explain, not dominate the first screen.

---

## 8. Measurement

For `print_design` intent or professional workflow entry, measure:

- converter direction selected;
- conversion success/warning count bucket only, not characters/content;
- Cleaner continuation;
- Rich Editor handoff;
- destination ready;
- first meaningful edit;
- Word/PDF/Print outcome;
- Unicode→InPage continuation;
- handoff failure.

Do not log:

- source/result text;
- filenames;
- unsupported characters themselves if they could expose content; use bounded count/category only where safe.

---

## 9. Search / acquisition opportunity

Treat professional/legacy Urdu as a specialist cluster.

Potential useful intent themes:

- InPage to Unicode;
- Unicode to InPage;
- Urdu text for Word;
- Urdu document PDF;
- Urdu print formatting.

Do not create near-identical conversion doorway pages. Existing converter and Rich Editor should remain the primary product owners unless GSC demonstrates a distinct intent requiring a support guide.

---

## 10. Implementation slices

### F0 — Journey audit

- verify current Rich/Converter/Cleaner handoffs;
- identify broken/missing state transfer;
- map current outputs and telemetry.

### F1 — Converter → document continuation

- add/validate `Format / prepare document` continuation after safe Unicode conversion;
- preserve text through existing handoff store;
- instrument destination ready + first edit.

### F2 — Rich Editor professional completion hierarchy

After P0/core convergence permits:

- validate Word/PDF/Print prominence for substantial/formal jobs;
- keep legacy InPage secondary/specialist;
- no new export engine.

### F3 — Typography preset experiment

- implement only if existing font infrastructure supports it cleanly;
- reversible;
- verify Word/PDF/print fidelity;
- test mobile readability.

### F4 — Professional support content

- one coherent guide or integrated help section;
- explain legacy/Unicode boundaries truthfully;
- internal links to Converter/Cleaner/Rich Editor.

### F5 — Evidence review

- measure how many users actually traverse converter → document/export;
- decide whether deeper InPage/document R&D is justified;
- full `.inp` document conversion remains separately gated.

---

## 11. Acceptance

1. Existing converter still handles pasted text only and states that clearly.
2. Unsupported/ambiguous characters remain visible/reviewable rather than silently guessed.
3. User text is never placed in URLs or analytics.
4. InPage→Unicode can hand off safely to Cleaner/Rich Editor.
5. Rich Editor Word/PDF/Print remain functional.
6. Legacy/InPage actions do not clutter the mainstream writer journey.
7. Any typography preset is reversible and does not overwrite explicit user formatting.
8. Mobile readability remains acceptable.
9. Professional support content does not overclaim compatibility.
10. Deeper `.inp`/layout work requires new evidence and a separate contract.