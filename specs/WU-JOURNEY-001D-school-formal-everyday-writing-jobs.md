# WU-JOURNEY-001D — School, Formal & Everyday Writing Jobs

**Status:** Planned / evidence-gated  
**Priority:** P1 after activation review  
**Parent:** `WU-JOURNEY-001`  
**Builds on:** implemented `WU-TPL-001` writing templates, Basic Writer, Rich Editor, workspace handoffs  
**Primary routes:** `/urdu-writing-templates`, `/`, `/urdu-editor`

---

## 1. Objective

Expand WriteUrdu from “blank editor + a small useful template set” into a structured starting point for recurring Urdu writing jobs in Pakistan—without turning the site into a low-quality mass-template directory.

The core user question is:

> **What are you trying to write?**

The answer should route into an existing writer/editor with useful starting structure.

---

## 2. Existing baseline

The current writing-template library already contains 12 ready-to-edit templates across:

- School;
- Office;
- Applications;
- Business;
- Personal.

It already supports:

- search/filter;
- editable placeholders;
- `Use in WriteUrdu`;
- `Format in Rich Editor`;
- Copy;
- safety wording explaining that templates are starting points rather than official forms.

This is a strong foundation. Do not rebuild it.

---

## 3. Opportunity categories

Candidate expansions must be validated against GSC/external demand and observed destination intent.

### 3.1 School / college

Potential jobs:

- leave/application variants;
- essay structure;
- speech structure;
- story/narrative starter;
- summary/précis structure;
- school notice/announcement;
- letter-writing formats;
- assignment/document starter.

### 3.2 Formal / office

Potential jobs:

- general application;
- complaint;
- request letter;
- resignation;
- job application/cover note;
- meeting notice;
- memo/announcement;
- payment reminder;
- simple formal letter structures.

### 3.3 Personal/community

Potential jobs:

- invitation;
- condolence / thank-you structure;
- community announcement;
- event notice;
- personal letter.

### 3.4 Creative writing

Potential jobs:

- poetry/ghazal/nazm writing workspace starter;
- story starter structure;
- speech/quotation formatting;
- handoff to Publish/Community only under existing CTA arbitration.

---

## 4. Academic integrity / content rule

The product should provide **formats, starters and structures**, not automatically write a student’s graded answer and present it as their own work.

Examples of safe educational support:

- essay outline headings;
- application structure;
- speech opening/body/closing prompts;
- story structure placeholders;
- formatting guidance.

Avoid creating hundreds of “complete answer” pages solely to capture homework queries.

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
8. human-readable static content for crawlability where a dedicated indexed route is approved.

---

## 6. Product architecture

### Main library remains the hub

`/urdu-writing-templates` remains the primary catalogue/hub.

Do not split every template into a dedicated SEO URL by default.

### Dedicated pages require evidence

A dedicated page is justified only when:

- query demand is meaningful;
- intent is distinct;
- the page can provide materially more useful guidance than the catalogue card;
- it will not cannibalize an established owner.

### Contextual entry

After destination intent or an explicit user action identifies `school` / `formal_work`, the product may recommend:

- Browse writing templates;
- Continue in Rich Editor;
- a specific template category.

Do not show all templates inside the Basic Writer.

---

## 7. “Writing mode” handoff

The handoff payload should remain content-safe/local using existing infrastructure.

Examples:

- template → Basic Writer for quick editing;
- template → Rich Editor for formal formatting/export;
- Basic Writer + school intent → template hub or Rich Editor;
- creative writing → Rich Editor or Community/Publish only after growth CTA arbitration.

No user text in URL parameters.

---

## 8. Typography/readability opportunity

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

---

## 9. Measurement

Track only bounded product events, never template-edited text.

Useful measures:

- template hub visits;
- category selected;
- template selected;
- template → Basic handoff;
- template → Rich handoff;
- destination ready;
- first meaningful edit/input;
- Word/PDF/Print outcome;
- repeat template use where privacy-safe;
- search impressions/clicks by approved query owner.

Do not send search-box text from the template library to telemetry.

---

## 10. Implementation slices

### D0 — Demand map

- join GSC with current template categories/pages;
- use destination-intent data when available;
- identify 3–5 high-confidence missing writing jobs;
- document rejected low-value/duplicate candidates.

### D1 — Catalogue expansion

- add only the selected high-confidence templates;
- extend existing catalogue/runtime rather than creating a second template engine;
- add English + Urdu locale parity where the current template architecture supports it.

### D2 — Rich document handoff

- validate preserved content/placeholder editing;
- add contextual continuation for school/formal intent after P0 gate allows it;
- measure destination ready + first edit.

### D3 — Presentation presets evaluation

- assess a readable-writing vs final-Nastaliq/print preset using current font/formatting capabilities;
- no TinyMCE replacement.

### D4 — SEO owner pages

- approve only evidence-backed dedicated pages;
- static helpful content;
- internal links hub ↔ relevant editor/template;
- no thin programmatic doorway expansion.

---

## 11. Acceptance

1. Existing 12 templates continue to work.
2. New templates are selected from evidence, not volume targets.
3. No fabricated school/employer requirements are presented as universal rules.
4. Template content remains editable before handoff.
5. Handoff preserves text without URL exposure.
6. No student-facing “complete answer farm” is created.
7. Rich Editor remains the formal-document engine.
8. Word/PDF/Print continue to work.
9. Any typography preset is optional/reversible.
10. GSC cannibalization is checked before adding dedicated indexed routes.
11. Mobile first-value writer UX is not displaced by template promotion.
12. Community Publish remains governed by single-growth-request arbitration.