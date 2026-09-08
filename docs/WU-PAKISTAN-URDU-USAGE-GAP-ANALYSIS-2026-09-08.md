# Write Urdu — Pakistan Urdu Usage, Product Gap & Opportunity Analysis

**Date:** 2026-09-08  
**Status:** Strategy input / evidence synthesis  
**Purpose:** Compare observed Pakistani Urdu-writing behaviour with the shipped WriteUrdu product, identify real capability gaps vs discovery/journey gaps, and define a sequenced opportunity map without violating the active `WU-PLAT-002H` scope gate.

---

## 1. Executive conclusion

The research changes the product framing more than it changes the feature inventory.

WriteUrdu already contains most of the capabilities the Pakistani Urdu-writing market needs:

- English-letter / Roman Urdu → Urdu typing;
- direct Urdu typing;
- voice → editable Urdu;
- rich document formatting;
- Word/PDF/PNG/print output;
- Card Studio and social-specific image makers;
- ready-to-edit writing templates;
- Urdu typing practice / speed testing;
- Unicode / InPage bridge;
- text cleaning, OCR, public sharing and community publishing.

The primary gap is therefore **not another generic Urdu tool**.

The stronger product model is:

> **Input however the user is comfortable → produce usable Urdu → help them complete the destination job.**

The biggest opportunity is to connect current capabilities around user intent and destination rather than presenting them as a catalogue.

---

## 2. Behaviour model from Pakistan research

Public research does not provide a trustworthy national percentage split such as “X% social / Y% school / Z% print.” The product must not fabricate one.

The evidence does support three recurring Urdu-writing worlds:

### 2.1 Conversational Urdu

Typical input:

- Roman Urdu / English letters;
- voice;
- mixed Urdu + English;
- direct Urdu when a keyboard is already configured.

Typical outcome:

- WhatsApp messages/status;
- Facebook posts/comments;
- other social captions/messages;
- copy/paste into another app.

Core user need:

> “I know what I want to say. Help me get it into usable Urdu quickly.”

### 2.2 Presentational Urdu

Typical input:

- Roman Urdu → Urdu;
- voice → Urdu;
- pasted Urdu;
- direct Urdu.

Typical outcome:

- poetry/quote image;
- greeting;
- announcement;
- status/story;
- Instagram/Facebook image;
- shareable visual.

Core user need:

> “Make this Urdu look good enough to share.”

### 2.3 Document / formal Urdu

Typical input:

- Roman Urdu / phonetic typing;
- direct Urdu;
- voice;
- template starting point;
- imported/legacy text.

Typical outcome:

- school assignment;
- application/letter;
- notice;
- office document;
- Word/PDF;
- print;
- legacy InPage/publishing workflow.

Core user need:

> “Help me produce something formal, durable, printable or submit-ready.”

---

## 3. User segments worth designing around

These are **product opportunity segments, not measured national shares**.

| Segment | Typical job | Product importance hypothesis |
| --- | --- | --- |
| Casual communicators | Write proper Urdu for messaging/comments | Very high |
| Social posters | Statuses, captions, Facebook/Instagram posts | Very high |
| Poetry/quote creators | Urdu → attractive shareable image | High |
| Students | Essays, applications, assignments, notes | High |
| Teachers/parents | Worksheets, notices, educational material | High |
| Writers/poets | Long-form writing, poetry, stories | Medium-high |
| Office/admin users | Applications, letters, formal documents | Medium |
| Printers/designers | Unicode ↔ Word/PDF/InPage/print | Medium, high-value |
| Typing-job candidates | Urdu WPM / exam/job preparation | Medium acquisition/retention opportunity |
| Journalists/publishers | Long-form + publishing/legacy workflows | Smaller but specialist/high-value |

---

## 4. Current WriteUrdu product map

### 4.1 Basic Writer `/`

**Already strong:**

- English-letter → Urdu is the canonical first job;
- direct Urdu mode exists;
- Voice is discoverable as an input path;
- Copy and export exist;
- contextual continuation exists;
- substantial-writing escalation into Rich Editor exists;
- current P0 work already protects the writer-first mobile viewport.

**Research fit:** excellent.

**Primary gap:** the product still mostly infers next steps from text length/workspace state, not from the user’s real destination/job.

### 4.2 Voice Typing `/tools/urdu-voice-typing`

**Already strong:**

- one-tap voice start;
- editable result;
- Copy;
- `Send to WhatsApp`;
- clean text;
- keep writing.

**Research fit:** excellent. Voice is correctly treated as an input method rather than a separate content universe.

**Primary gaps:**

- destination telemetry is too weak to tell whether voice users primarily copy, WhatsApp, continue to documents, or abandon after transcription;
- voice → image/social-card handoff is not a first-class measured journey.

### 4.3 Rich Editor `/urdu-editor`

**Already strong:**

- Roman/direct input;
- document formatting;
- Word/PDF/PNG/Print;
- letters/reports/articles/social messaging use cases;
- strong observed engagement.

**Research fit:** excellent for formal/document Urdu.

**Primary gaps:**

- no task starter layer for common document jobs such as essay/application/letter/notice from inside the document journey;
- no explicit `screen readability` vs `beautiful Nastaliq/print` presentation mode;
- professional print/InPage continuation is not yet a coherent end-to-end journey.

### 4.4 Writing Templates `/urdu-writing-templates`

**Already strong:**

- 12 real ready-to-edit templates;
- school, office, applications, business and personal categories;
- direct handoff to Basic Writer or Rich Editor;
- clear safety wording that templates are starting points, not official forms.

**Research fit:** very strong.

**Primary gaps:**

- current catalogue under-represents broader school writing jobs: essays, speeches, stories, summaries, notices/classroom material;
- no evidence-led template expansion system tied to search/product usage;
- templates are not yet exposed contextually after the product detects/learns a user’s intended job.

### 4.5 Card Studio `/urdu-card-studio`

**Already strong:**

- quote/poetry, social post, story/status, greeting/announcement roles;
- Quick/Advanced modes;
- Roman/direct Urdu support;
- image upload;
- social output dimensions;
- PNG/share/caption completion;
- Nastaliq/Naskh-aware design.

**Research fit:** extremely strong.

**Known product problem:** Product Pulse shows editing activity but weak export completion. This is already owned by `WU-PLAT-002H` P0.1F.

**Gap classification:** completion/discovery gap, **not missing-feature gap**.

### 4.6 Social makers

Existing dedicated routes cover WhatsApp Status, Instagram post, Facebook role and other shareable outcomes.

**Research fit:** strong.

**Primary gap:** social outcomes are spread across routes/products; users are not yet guided from “I have Urdu text” to the best social output based on their intended destination.

### 4.7 Urdu Typing Practice `/urdu-typing-practice`

**Already strong:**

- 12 guided lessons;
- 1/2/5 minute tests;
- WPM and accuracy;
- English-key phonetic and native-keyboard modes;
- local progress/history/streaks/personal bests;
- paste prevention for valid testing.

**Research fit:** much stronger than the current backlog description suggests.

**Primary gap:** positioning and acquisition. The product is generic practice rather than explicitly serving real Pakistani typing-test/job preparation intent.

### 4.8 InPage ↔ Unicode

**Already strong:**

- both-direction text conversion;
- safe unsupported-character reporting;
- continuity to cleaner / WriteUrdu;
- explicit distinction between text conversion and `.inp` document conversion.

**Research fit:** strong for the professional/printing layer.

**Primary gap:** the user journey stops at conversion. The product does not yet explain/measure common professional destinations such as Word/PDF/print/legacy handoff as a coherent flow.

---

## 5. Gap classification

### 5.1 Critical gaps — product intelligence / orchestration

#### G1 — Destination intent is unknown

We can measure writer activation and some outcomes, but we do not know **why** the user needed Urdu.

Missing dimensions include:

- WhatsApp / messaging;
- social post;
- school/college;
- work/formal document;
- poetry/writing;
- printing/design;
- typing practice/job test.

This is the highest-value knowledge gap because it affects every future roadmap decision.

#### G2 — Journey recommendations use state more than intent

Current adaptive logic is primarily driven by workspace/text length/state. That is appropriate for activation, but two 100-character texts can have completely different destinations:

- a WhatsApp status;
- a school application;
- a poetry quote;
- a formal notice.

We need an optional, non-blocking destination/job signal after first value.

### 5.2 High-value capability gaps

#### G3 — Messy Roman Urdu / code-switching resilience is not a product contract

Pakistani Roman Urdu has spelling variation and frequent English code-switching. The current transliteration path is mature and protected, but we do not have a benchmark/contract for:

- spelling variants;
- shorthand;
- mixed English terms;
- names;
- punctuation/numbers;
- multi-word paste conversion quality.

This must begin as **benchmark/R&D**, not a risky provider rewrite.

#### G4 — School/document job coverage is shallow relative to the opportunity

Applications/letters are present, but the broader school writing ecosystem is not yet represented systematically.

#### G5 — Professional print workflow is fragmented

Rich Editor + Word/PDF/Print + InPage converter exist, but the product does not connect them into a clear professional workflow.

### 5.3 High-value discovery/completion gaps

#### G6 — Social completion is fragmented

Copy, WhatsApp, cards and social-specific makers exist, but the correct outcome is not always surfaced contextually.

#### G7 — Card Studio completion is weak

Already owned by P0.1F. Do not solve this with more templates/promotional links before completion diagnosis.

#### G8 — Typing practice exists but lacks career/exam positioning

This is now a marketing/content/product-fit opportunity, not a greenfield feature.

### 5.4 Cross-cutting UX gap

#### G9 — Urdu typography is treated mainly as formatting, not reading context

Research shows Nastaliq has strong cultural/aesthetic value while small-screen readability can vary. We should test a clear distinction between:

- writing/readability view;
- beautiful Nastaliq/print presentation.

Do not impose one font ideology everywhere.

---

## 6. Opportunity map

| Opportunity | Reuse level | New capability needed? | Risk | Recommended sequence |
| --- | ---: | ---: | ---: | ---: |
| Destination intent measurement | High | Small | Low | First |
| Destination-aware continuation | High | Small/medium | Medium UX | After P0.1 review |
| Roman Urdu quality benchmark | High | Benchmark first | Low | Early research |
| Roman/mixed-language improvement | Medium | Possibly | High regression risk | Only after benchmark |
| Social copy → card/status flow | High | Mostly orchestration | Medium | After Card P0.1F |
| School writing-job expansion | High | Content/catalogue | Low | P1 |
| Professional print/InPage journey | High | Orchestration/content | Low-medium | P1 |
| Typing career/exam pathway | Very high | Mostly positioning/content | Low | P1 evidence experiment |
| New generic Urdu mini-tools | Low | Yes | Medium | Hold |

---

## 7. Product principle to adopt

The future product architecture should optimize for:

`comfortable input → first usable Urdu → intended destination → successful completion → optional keep/share/publish/return`

The input layer may include:

- English letters / Roman Urdu;
- direct Urdu;
- voice;
- pasted/imported text;
- OCR/legacy conversion.

The destination layer may include:

- Copy / messaging;
- social/image;
- school/document;
- work/formal;
- Word/PDF/print;
- publishing/community;
- typing practice/career.

This layer should **not** become a mandatory wizard before writing. First value remains primary.

---

## 8. Sequencing against the active P0 gate

`WU-PLAT-002H` remains authoritative. This research does not justify violating the current activation freeze.

### Allowed now

- document the strategy;
- add privacy-safe destination measurement design;
- build benchmark datasets/tests that do not modify production transliteration;
- analyse existing Product Pulse/GSC data;
- prepare content/SEO experiments that do not displace the core writer.

### Wait for P0.1 evidence review

- new homepage/core-writer destination prompts;
- new contextual recommendation controller behaviour;
- broader social/card promotion;
- production transliteration changes;
- major Rich Editor structure changes.

---

## 9. Research references

Primary evidence classes used in the preceding research round:

- Pakistan Bureau of Statistics — 2023 census language distribution;
- HEC/FBISE — Urdu curriculum/education context;
- DataReportal — Pakistan internet/social reach;
- academic Roman Urdu / code-switching NLP literature;
- Google Play listings/reviews for high-volume Urdu keyboard, voice and Urdu-on-image products;
- Pakistan government/recruitment documents referring to Urdu typing/InPage skill requirements;
- current Urdu typing / practice competitors;
- current WriteUrdu production routes and repository/product telemetry.

Repository/runtime evidence remains authoritative for what WriteUrdu currently ships.

---

## 10. Recommended programme

Create one coordinated programme rather than unrelated new tools:

- `WU-JOURNEY-001` — Pakistan Urdu Intent & Destination Journey Programme;
- `WU-JOURNEY-001A` — Destination Intent Measurement;
- `WU-JOURNEY-001B` — Roman Urdu Resilience & Code-Switching Benchmark;
- `WU-JOURNEY-001C` — Social/Copy/Card Outcome Continuity;
- `WU-JOURNEY-001D` — School, Formal & Everyday Writing Jobs;
- `WU-JOURNEY-001E` — Typing Practice Career / Test Positioning;
- `WU-JOURNEY-001F` — Professional Print / Word / PDF / InPage Journey.

These children must reuse existing workspace/handoff architecture and respect the `WU-PLAT-002H` release gates.