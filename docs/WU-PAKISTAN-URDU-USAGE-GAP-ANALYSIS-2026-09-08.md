# Write Urdu — Pakistan Urdu Usage, Product Gap & Opportunity Analysis

**Date:** 2026-09-08  
**Status:** Strategy input / evidence synthesis — feedback reconciled  
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
- Unicode / legacy InPage text bridge;
- text cleaning, OCR, public sharing and community publishing.

The primary gap is therefore **not another generic Urdu tool**.

The stronger product model is:

> **Input however the user is comfortable → produce usable Urdu → help them complete the destination job.**

The biggest opportunity is to connect current capabilities around user intent and destination rather than presenting them as a catalogue.

A second important conclusion from the feedback review is:

> **Do not confuse a valuable market observation with a missing product feature.**

Several ideas in the external feedback were already implemented in WriteUrdu and therefore need positioning, quality or journey work rather than a duplicate build.

---

## 2. Behaviour model from Pakistan research

Public research does not provide a trustworthy national percentage split such as “X% social / Y% school / Z% print.” The product must not fabricate one.

Roman Urdu is strongly evidenced as a common digital communication style, especially for informal messaging, and spelling variation is real. However, statements such as “no one types Urdu directly” are too absolute. Direct Urdu keyboard input and phonetic Urdu keyboard layouts are real, established workflows, especially among users who already type Urdu professionally or have an Urdu keyboard configured.

The evidence supports three recurring Urdu-writing worlds:

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
| Overseas/family communicators | Proper-script messages, greetings, invitations | Plausible medium opportunity; validate with WriteUrdu evidence rather than treating as measured segment |

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

**Primary gaps:**

- the product still mostly infers next steps from text length/workspace state, not from the user’s real destination/job;
- there is no benchmark proving how well the current transliteration/suggestion flow tolerates high-frequency chat spelling variants, code-switching, names, numbers and long-paste formatting;
- users who can speak/type Roman Urdu but are less confident reading Urdu script have no optional Roman-source companion after conversion.

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
- voice → image/social-card handoff is not yet a first-class measured journey.

### 4.3 Rich Editor `/urdu-editor`

**Already strong:**

- Roman/direct input;
- document formatting;
- Word/PDF/PNG/Print;
- letters/reports/articles/social messaging use cases;
- strong observed engagement.

**Research fit:** excellent for formal/document Urdu.

**Primary gaps:**

- no task starter layer for broader common document jobs such as essay/speech/story/notice from inside the document journey;
- no explicit `screen readability` vs `beautiful Nastaliq/print` presentation mode;
- professional print/InPage continuation is not yet a coherent end-to-end journey;
- current PDF output is created by rendering the document to a browser canvas and embedding image slices into jsPDF, so visual fidelity can be good while selectable/searchable Unicode text in the PDF is not guaranteed. This deserves a dedicated print-quality audit before any “InPage replacement” claim.

### 4.4 Writing Templates `/urdu-writing-templates`

**Already strong:**

- 12 real ready-to-edit templates;
- school, office, applications, business and personal categories;
- current business coverage already includes payment reminder and meeting notice;
- direct handoff to Basic Writer or Rich Editor;
- clear safety wording that templates are starting points, not official forms.

**Research fit:** very strong.

**Primary gaps:**

- current catalogue under-represents broader school writing jobs: essays, speeches, stories, summaries and assignment starters;
- evidence-led expansion should include education and everyday formal jobs, but not duplicate existing leave/job/complaint/business-notice templates;
- no destination-aware contextual entry after a user identifies school/formal intent.

### 4.5 Card Studio `/urdu-card-studio`

**Already strong:**

- quote/poetry, social post, story/status, greeting/announcement roles;
- Quick/Advanced modes;
- Roman/direct Urdu support;
- image upload;
- social output dimensions;
- PNG/share/caption completion;
- Nastaliq/Naskh-aware design;
- Noto Nastaliq Urdu is already part of the current design/template font stack.

**Research fit:** extremely strong.

**Known product problem:** Product Pulse shows editing activity but weak export completion. This is already owned by `WU-PLAT-002H` P0.1F.

**Gap classification:** completion/discovery gap, **not missing-feature gap**.

Poetry-specific framing/layout may still be valuable, but should extend Card Studio/Rich Editor rather than create a third image/export engine.

### 4.6 Social makers

Existing dedicated routes cover WhatsApp Status, Instagram post, Facebook Card Studio role and other shareable outcomes.

**Research fit:** strong.

**Primary gap:** messaging text and social image are different jobs. WriteUrdu has a strong WhatsApp Status image product and a Voice→WhatsApp text action, but the general Basic Writer does not yet present “message” vs “status/image” as a clear destination distinction.

A new WhatsApp-message SEO route is **not automatically justified**. Existing `WU-VOICE-PLAT-001D` already requires product/search evidence before creating a dedicated message route.

### 4.7 Urdu Typing Practice `/urdu-typing-practice`

**Already strong and shipped:**

- 12 guided lessons;
- 1/2/5 minute tests;
- WPM and accuracy;
- English-key phonetic and native-keyboard modes;
- local progress/history/streaks/personal bests;
- paste prevention for valid testing.

**Research fit:** much stronger than older backlog assumptions suggested.

**Primary gap:** positioning and acquisition. The opportunity is career/job-test framing and repeat-use measurement, not building another `/urdu-typing-test` engine by default.

### 4.8 InPage ↔ Unicode

**Already strong and shipped:**

- both-direction text conversion;
- safe unsupported-character reporting;
- continuity to cleaner / WriteUrdu;
- explicit distinction between text conversion and `.inp` document conversion;
- a planned npm/API wrapper reuses the same engine.

**Research fit:** strong for the professional/printing layer.

**Primary gap:** the user journey stops at conversion. The product does not yet explain/measure common professional destinations such as Word/PDF/print/legacy handoff as a coherent flow.

The useful opportunity is therefore **print companion / proof / handoff quality**, not “add InPage output from zero.”

---

## 5. Feedback reconciliation — what to accept, modify or reject

### 5.1 Accept strongly

#### A — Print-grade Nastaliq fidelity audit

This is one of the best additions in the feedback.

WriteUrdu already uses Nastaliq fonts and browser rendering, but the current Rich/Basic PDF path rasterizes the rendered document through `html2canvas` and embeds image slices into jsPDF. Before positioning WriteUrdu as suitable for professional/simple print jobs, benchmark:

- Nastaliq ligature/shaping fidelity;
- line wrapping;
- RTL alignment;
- punctuation/numbers/mixed Latin text;
- multi-page slicing;
- print DPI/legibility;
- font-loading failure behaviour;
- PDF text selectability/accessibility;
- visual consistency across Chrome/Edge/Safari where supported.

Do **not** assume a HarfBuzz/WASM rewrite is required before auditing the browser’s existing complex-script shaping. Browser DOM shaping may already be sufficient for many jobs; the current bottleneck may instead be raster export, page slicing, font loading or layout presets.

#### B — “Message” vs “Status image” distinction

Strong product insight. A WhatsApp message is a copy/share-text job; a WhatsApp Status is an image-design job. Treat these as separate outcomes under `WU-JOURNEY-001C`.

#### C — Dual-script confidence companion

Useful hypothesis for users who can type/speak Roman Urdu but are less confident verifying the Urdu script. This should be a bounded, optional, local-only experiment—not a default second line on every editor.

#### D — Mixed RTL / names / numbers reliability

Strongly add to the Roman Urdu benchmark and messaging/document QA corpus.

#### E — Trust as a competitive differentiator

Yes, but the correct differentiator is **transparent, feature-specific processing**, not a blanket “nothing leaves your browser” claim.

### 5.2 Accept with correction

#### F — InPage / print opportunity

Correct opportunity, incorrect current-state diagnosis.

WriteUrdu already ships both-direction legacy InPage-text ↔ Unicode conversion. The next opportunity is:

- coherent converter → Cleaner → Rich Editor → Word/PDF/Print journey;
- optional print-proof output;
- a “keep Unicode as your master” workflow;
- quality comparison against professional Nastaliq expectations;
- possibly a bounded `print pack` if usage proves demand.

Do not call the first phase an InPage replacement.

#### G — Education templates

Correct opportunity, but the product already has 12 writing templates including school, office, business and personal jobs. Expansion should focus on missing categories such as essay/speech/story/summary/assignment structure and only create dedicated SEO pages when GSC proves distinct demand.

#### H — Business notices

Partially present already: payment reminder and meeting notice exist. Candidate additions such as shop/community announcements or event notices should be demand-driven, not a separate duplicate template system.

#### I — Poetry formatting

Valid emotionally sticky opportunity, but Card Studio already owns poetry/quote image output. Add poetry-specific presets/layout only by extending Card Studio/Rich Editor after Card completion health is understood.

### 5.3 Reject as stated

#### J — “No one types Urdu directly”

Too absolute and contradicted by both the product and the wider Urdu keyboard ecosystem. Roman Urdu is highly important; direct Urdu remains a legitimate input path.

#### K — “InPage-compatible output is not covered”

Incorrect. Text conversion exists in both directions today; `.inp` binary document conversion does not.

#### L — “Typing practice is missing”

Incorrect. The shipped practice product is already substantial. Build positioning/retention, not another timer/WPM engine.

#### M — “Phase 1 means no backend/API/accounts/server/database”

Not a valid current platform constraint. The **core instant writing task** remains no-account/local-first, but WriteUrdu now also has optional account documents, community/public-share/server functions, telemetry, planned APIs and provider-dependent features. Future specs should preserve the core no-account path without pretending the entire product is static-only.

#### N — Global “nothing leaves your browser” marketing

Incorrect and unsafe. The current privacy contract correctly explains that:

- Roman Urdu transliteration suggestions/whole-text conversion may send submitted words/passages to Google’s typing service;
- browser/platform speech recognition may use provider-operated remote recognition;
- public share/community/account features intentionally send/store data after explicit user action;
- browser-local tools such as Card Studio/QR have different processing behaviour.

Trust messaging must be route/capability-specific.

#### O — Treat Unicode and InPage as two mutually exclusive modern output formats

Over-simplified. Legacy InPage encodings remain a compatibility problem, but newer InPage versions can work with Unicode/OpenType too. WriteUrdu should describe **modern Unicode master + legacy compatibility/handoff** rather than claiming all print workflows require a separate “glyph format.”

---

## 6. Gap classification

### 6.1 Critical gaps — product intelligence / orchestration

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

- a WhatsApp message;
- a school application;
- a poetry quote;
- a formal notice.

We need an optional, non-blocking destination/job signal after first value.

### 6.2 High-value quality gaps

#### G3 — Messy Roman Urdu / code-switching resilience is not benchmarked

The current transliteration path is mature and protected, but there is no explicit regression suite representing:

- spelling variants;
- shorthand;
- mixed English terms;
- names;
- punctuation/numbers;
- URLs/handles;
- multi-line passage conversion;
- suggestion recovery/undo behaviour.

This must begin as **benchmark/R&D**, not a risky provider rewrite.

#### G4 — Print/PDF typography quality is unbenchmarked

WriteUrdu can already render Nastaliq and export PDF/PNG/print, but there is no reference suite proving professional/simple-print fidelity against realistic Urdu documents. Current PDF is rasterized image content, which has implications for text selection/search/accessibility.

#### G5 — Dual-script verification is missing

Some users may want to keep the Roman source visible while checking unfamiliar Urdu script. This is a plausible confidence feature, but needs measured validation before broad rollout.

### 6.3 High-value capability/journey gaps

#### G6 — School/document job coverage is shallow relative to the opportunity

Applications/letters are present; broader essay/speech/story/summary/assignment structure is not represented systematically.

#### G7 — Professional print workflow is fragmented

Rich Editor + Word/PDF/Print + InPage converter + Cleaner exist, but the product does not connect them into one clear specialist workflow.

#### G8 — Message vs social-image completion is fragmented

Copy, WhatsApp, cards and social-specific makers exist, but the correct outcome is not always surfaced contextually.

### 6.4 Existing product needing positioning/completion rather than rebuild

#### G9 — Card Studio completion is weak

Already owned by P0.1F. Do not solve this with more promotion before completion diagnosis.

#### G10 — Typing practice lacks career/test positioning

The tool exists. Acquisition/retention is the gap.

### 6.5 Cross-cutting trust gap

#### G11 — Processing truth is complex and not a one-line privacy slogan

WriteUrdu can compete on trust by explaining what each feature does with user data in plain language. Do not falsely collapse local, Google-assisted, browser-provider, public-share and account workflows into one claim.

---

## 7. Opportunity map

| Opportunity | Reuse level | New capability needed? | Risk | Recommended sequence |
| --- | ---: | ---: | ---: | ---: |
| Destination intent measurement | High | Small | Low | First evidence layer |
| Roman Urdu quality benchmark | High | Benchmark first | Low | Early research |
| Print/Nastaliq export fidelity benchmark | Very high | Audit first | Low/medium | Early research |
| Trust/processing copy audit | Very high | Mostly content | Low | Early, under existing privacy/SEO governance |
| Destination-aware continuation | High | Small/medium | Medium UX | After P0.1 review |
| Message vs Status/image continuation | High | Mostly orchestration | Medium | After P0.1 / Card gates |
| Dual-script confidence companion | Medium | Small/medium | Medium core-input risk | Evidence-gated experiment |
| Roman/mixed-language production improvement | Medium | Possibly | High regression risk | Only after benchmark |
| School writing-job expansion | High | Content/catalogue | Low | P1 |
| Professional print/InPage journey | High | Orchestration/content + possible export work | Medium | P1 after fidelity spike |
| Typing career/exam pathway | Very high | Mostly positioning/content | Low | P1 evidence experiment |
| New generic Urdu mini-tools | Low | Yes | Medium | Hold |

---

## 8. Revised product principle

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

The trust layer should explain processing truthfully for the capability the user chose.

---

## 9. Sequencing against the active P0 gate

`WU-PLAT-002H` remains authoritative. This research does not justify violating the current activation freeze.

### Allowed now

- document the strategy;
- add privacy-safe destination measurement support if isolated from visible core UI;
- build Roman Urdu benchmark datasets/tests that do not modify production transliteration;
- build a print/Nastaliq visual/reference audit harness or fixtures without changing core UI;
- audit current privacy/trust copy against actual processing;
- analyse existing Product Pulse/GSC data;
- prepare content/SEO experiments that do not displace the core writer.

### Wait for P0.1 evidence review

- new homepage/core-writer destination prompts;
- new contextual recommendation controller behaviour;
- a persistent Roman companion inside Basic/Rich;
- broader social/card promotion;
- production transliteration changes;
- major Rich Editor structure/export changes.

---

## 10. Research and repository references

External evidence classes reviewed:

- Pakistan Bureau of Statistics — 2023 census language distribution;
- HEC/FBISE — Urdu curriculum/education context;
- DataReportal — Pakistan internet/social reach;
- Roman Urdu texting/corpus studies showing widespread informal use and spelling variation;
- 2026 small-sample studies on Roman Urdu digital habits — directional only, not national prevalence estimates;
- Urdu keyboard/phonetic-layout documentation demonstrating direct Urdu input remains a legitimate workflow;
- InPage/Urdu publishing references documenting its historic and continuing professional importance while modern Unicode/OpenType workflows also exist;
- current government/recruitment examples referring to Urdu typing/InPage skill requirements;
- current Urdu keyboard, voice, image and typing-practice products.

Repository/runtime evidence used to correct the feedback:

- `/urdu-typing-practice` already implements lessons + WPM/accuracy tests;
- `/tools/inpage-unicode-converter` already implements both text-conversion directions;
- `WU-API-001` plans npm/API exposure of the existing InPage conversion engine;
- `WU-TPL-001` already shipped school/office/business/personal writing templates;
- current PDF export uses browser rendering → `html2canvas` → raster image slices in jsPDF;
- current privacy page explicitly distinguishes local processing, Google transliteration, browser/platform speech recognition, public sharing, accounts and analytics.

Runtime code + regression tests remain authoritative for shipped behaviour.

---

## 11. Recommended programme

Keep one coordinated programme rather than unrelated new tools:

- `WU-JOURNEY-001` — Pakistan Urdu Intent & Destination Journey Programme;
- `WU-JOURNEY-001A` — Destination Intent Measurement;
- `WU-JOURNEY-001B` — Roman Urdu Resilience & Code-Switching Benchmark;
- `WU-JOURNEY-001C` — Messaging / Social / Copy / Card Outcome Continuity;
- `WU-JOURNEY-001D` — School, Formal & Everyday Writing Jobs;
- `WU-JOURNEY-001E` — Typing Practice Career / Test Positioning;
- `WU-JOURNEY-001F` — Professional Print / Word / PDF / InPage Journey + print-fidelity spike;
- `WU-JOURNEY-001G` — Dual-Script Confidence Companion (evidence-gated).

Trust/processing positioning remains a cross-cutting requirement owned by the existing privacy/public-copy/SEO governance rather than a duplicate product epic.

These children must reuse existing workspace/handoff architecture and respect the `WU-PLAT-002H` release gates.