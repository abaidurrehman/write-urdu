# WU-JOURNEY-001D — School, Formal & Everyday Writing Jobs

**Status:** Planned / evidence-gated  
**Priority:** P1 after activation review  
**Parent:** `WU-JOURNEY-001`  
**Builds on:** implemented `WU-TPL-001` writing templates, Basic Writer, Rich Editor, workspace handoffs  
**Primary routes:** `/urdu-writing-templates`, `/`, `/urdu-editor`

---

## 1. Objective

Expand WriteUrdu from “blank editor + a useful request/letter template set” into a structured starting point for recurring Urdu writing jobs in Pakistan—without turning the site into a low-quality mass-template or homework-answer directory.

The core user question is:

> **What are you trying to write?**

The answer should route into an existing writer/editor with useful structure and an appropriate completion path.

---

## 2. Existing baseline — do not duplicate

The current writing-template library already contains **12 ready-to-edit templates** across:

### School

- sick leave;
- urgent-work leave;
- fee concession request;
- certificate request.

### Office

- office leave;
- job application;
- resignation.

### Applications

- complaint;
- general request.

### Business

- payment reminder;
- meeting notice.

### Personal

- invitation letter.

It already supports:

- search/filter;
- editable placeholders;
- `Use in WriteUrdu`;
- `Format in Rich Editor`;
- Copy;
- safety wording explaining that templates are starting points rather than official forms;
- an evidence-gated SEO observation plan rather than one indexable page per template.

This is a strong foundation. Do not rebuild it and do not create a second template engine.

---

## 3. Opportunity categories

Candidate expansions must be validated against GSC/external demand and observed destination intent.

### 3.1 School / college writing

Highest-value missing job families to evaluate:

- `mazmoon` / essay **structure**;
- speech structure;
- story/narrative starter;
- summary/précis structure;
- assignment/document starter;
- school notice/announcement;
- letter-writing format guidance;
- assignment cover-sheet starter.

Important distinction:

A “150-word essay template” should mean a useful structure/outline/placeholders, **not a pre-written answer presented for submission**.

### 3.2 Education document presentation

Low-risk candidate presets to evaluate in the existing Rich Editor/export flow:

- A4 school-document margins;
- optional assignment heading block;
- optional name/class/roll-number fields;
- page numbering;
- readable screen mode vs final Nastaliq presentation.

Do not invent one “official Pakistani assignment format.” Schools/boards differ.

### 3.3 Handwriting / ruled practice sheet

A printable ruled/lined Urdu writing-practice sheet is a plausible parent/child/education acquisition job, but it is **not automatically part of the document-template expansion**.

Gate separately with demand evidence because its primary outcome is handwriting practice, not digital Urdu writing.

If approved, reuse existing print/export infrastructure rather than adding it inside the Basic Writer.

### 3.4 Formal / office

Existing leave/job/resignation/complaint/general-request/meeting/payment templates already cover much of this area.

Potential missing jobs to evaluate:

- character/certificate request variants where distinct from the existing certificate template;
- memo/announcement;
- community/shop notice;
- event notice;
- simple formal letter structures.

Do not create synonym variants of existing templates merely for SEO.

### 3.5 Shop / SMB communication

Candidate job family:

- short shop announcement;
- temporary closure/holiday notice;
- event/promotion announcement;
- customer information notice.

Outcome may be:

- text Copy;
- Rich Editor/PDF/Print;
- Card Studio image.

QR integration should be contextual only where the notice actually benefits from a URL/contact/payment QR. Do not make QR mandatory.

### 3.6 Personal/community

Potential jobs:

- invitation;
- condolence / thank-you structure;
- community announcement;
- event notice;
- personal letter.

### 3.7 Creative writing / poetry

Potential jobs:

- poetry/ghazal/nazm writing workspace starter;
- sher/couplet presentation preset;
- story starter structure;
- speech/quotation formatting;
- handoff to Card Studio for image output;
- handoff to Publish/Community only under existing CTA arbitration.

Card Studio already owns poetry/quote images. Do not build a second poetry image renderer here.

---

## 4. Academic integrity / content rule

The product should provide **formats, starters, outlines and structures**, not automatically write a student’s graded answer and present it as their own work.

Examples of safe educational support:

- essay outline headings;
- application structure;
- speech opening/body/closing prompts;
- story structure placeholders;
- summary-writing guidance;
- formatting guidance;
- editable assignment heading/cover block.

Avoid creating hundreds of “complete answer” pages solely to capture homework queries.

A later AI feature, if enabled under its own policy/provider gates, must not silently turn these deterministic templates into ghostwritten school submissions.

---

## 5. Template quality contract

Every published writing template must include:

1. a clear job/title in Urdu and understandable English support text where appropriate;
2. editable placeholders;
3. no fabricated recipient/contact facts;
4. neutral wording;
5. a reminder to check institution/employer-specific requirements where relevant;
6. a direct handoff to the correct workspace;
7. one canonical query owner rather than duplicate near-identical pages;
8. human-readable static content for crawlability where a dedicated indexed route is approved;
9. no “official” badge unless the template is actually issued/endorsed by the relevant body;
10. no hidden/unreplaced placeholder in a final exported document where the product can reasonably warn the user.

---

## 6. Placeholder completion guard

The feedback correctly identifies a useful completion safeguard: users can forget `[placeholder]` values before printing/exporting.

Evaluate a non-blocking warning before document export when the source still contains the template’s known placeholder syntax.

Rules:

- warning, not hard block;
- do not scan arbitrary private text server-side;
- operate locally on the current template/document;
- only detect the product’s explicit placeholder markers, not attempt semantic personal-data detection;
- user may continue intentionally.

---

## 7. Product architecture

### Main library remains the hub

`/urdu-writing-templates` remains the primary catalogue/hub.

Do not split every template into a dedicated SEO URL by default.

### Dedicated pages require evidence

A dedicated page is justified only when:

- query demand is meaningful;
- intent is distinct;
- the page can provide materially more useful guidance than the catalogue card;
- it will not cannibalize an established owner;
- the page is not merely a wrapper around the same template text.

### Contextual entry

After destination intent or an explicit user action identifies `school` / `formal_work`, the product may recommend:

- Browse writing templates;
- Continue in Rich Editor;
- a specific template category;
- an approved document preset.

Do not show all templates inside the Basic Writer.

---

## 8. “Writing mode” handoff

The handoff payload should remain content-safe using existing infrastructure.

Examples:

- template → Basic Writer for quick editing;
- template → Rich Editor for formal formatting/export;
- Basic Writer + school intent → template hub or Rich Editor;
- creative writing → Rich Editor or Card Studio;
- Community/Publish only after growth CTA arbitration.

No user text in WriteUrdu internal URL parameters.

---

## 9. Typography/readability opportunity

Document writing and printed Urdu do not need the same presentation defaults.

Evaluate a bounded distinction inside the existing Rich Editor formatting model:

- **Readable writing view** — comfortable screen font/line height for editing;
- **Nastaliq/print presentation** — beautiful Urdu typography for final document/export.

This is a presentation preset, not a new editor engine.

Any font/preset change must preserve:

- user-selected formatting;
- export fidelity;
- mobile readability;
- existing font-choice functionality.

Print-fidelity benchmarking itself is owned by `WU-JOURNEY-001F` so school presets do not independently reinvent PDF/font infrastructure.

---

## 10. Measurement

Track only bounded product events, never template-edited text.

Useful measures:

- template hub visits;
- category selected;
- template selected;
- template → Basic handoff;
- template → Rich handoff;
- destination ready;
- first meaningful edit/input;
- placeholder-warning shown / continued (bounded only);
- Word/PDF/Print outcome;
- repeat template use where privacy-safe;
- search impressions/clicks by approved query owner.

Do not send:

- template search-box text;
- user edits;
- names/roll numbers/classes;
- document content.

---

## 11. Implementation slices

### D0 — Demand map

- join GSC with current template categories/pages;
- use destination-intent data when available;
- explicitly subtract jobs already covered by the 12 shipped templates;
- identify 3–5 high-confidence missing writing jobs;
- document rejected low-value/duplicate candidates.

### D1 — Catalogue expansion

- add only the selected high-confidence templates;
- likely first candidates from research: essay structure, speech structure, story/summary/assignment starter—not more leave-letter synonyms;
- extend existing catalogue/runtime rather than creating a second engine;
- add English + Urdu locale parity where the current template architecture supports it.

### D2 — Rich document handoff

- validate preserved content/placeholder editing;
- add contextual continuation for school/formal intent after P0 gate allows it;
- measure destination ready + first edit.

### D3 — Placeholder export warning

- detect known template placeholder markers locally;
- warn before final document export;
- allow explicit continue.

### D4 — School/document presentation preset evaluation

- assess A4 margins/heading/page-number support using current Rich Editor/export capabilities;
- coordinate Nastaliq/PDF quality with `001F`;
- no TinyMCE replacement.

### D5 — Poetry/couplet extension decision

- inspect Card Studio/Rich Editor current poetry capabilities and Product Pulse;
- if useful, add a sher/couplet formatting preset to the correct existing owner;
- do not create a new export engine.

### D6 — SEO owner pages

- approve only evidence-backed dedicated pages;
- static helpful content;
- internal links hub ↔ relevant editor/template;
- no thin programmatic doorway expansion;
- normally follow the existing `WU-TPL-001` observation discipline rather than publishing a page for every new template at launch.

---

## 12. Acceptance

1. Existing 12 templates continue to work.
2. New templates are selected from evidence, not volume targets.
3. Existing school/business/office jobs are not duplicated under new names.
4. No fabricated school/employer requirements are presented as universal rules.
5. Template content remains editable before handoff.
6. Handoff preserves text without internal URL exposure.
7. No student-facing “complete answer farm” is created.
8. Rich Editor remains the formal-document engine.
9. Word/PDF/Print continue to work.
10. Placeholder warning is local, bounded and bypassable.
11. Any typography preset is optional/reversible.
12. GSC cannibalization is checked before adding dedicated indexed routes.
13. Mobile first-value writer UX is not displaced by template promotion.
14. Poetry image output reuses Card Studio rather than a new renderer.
15. Community Publish remains governed by single-growth-request arbitration.