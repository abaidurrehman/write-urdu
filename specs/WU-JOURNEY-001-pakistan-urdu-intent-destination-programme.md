# WU-JOURNEY-001 — Pakistan Urdu Intent & Destination Journey Programme

**Status:** Planned / evidence-gated  
**Priority:** P1 after `WU-PLAT-002H` activation review; isolated evidence work may start earlier  
**Owner:** Product / UX / Growth  
**Evidence:** `docs/WU-PAKISTAN-URDU-USAGE-GAP-ANALYSIS-2026-09-08.md`  
**Depends on:** `WU-PLAT-002H`, `WU-PLAT-002`, `WU-PLAT-003`, `WU-ANALYTICS-003`  
**Related:** `WU-GROWTH-003`, `WU-TPL-001` (implemented/archive), `WU-COMMUNITY-001`, `WU-SHARE-001`, `WU-API-001`, current privacy/public-copy governance

---

## 1. Product decision

WriteUrdu should evolve from a catalogue of capable Urdu tools into a coherent **input → usable Urdu → destination outcome** system.

The programme does **not** replace the existing `Write / Create / Work / Learn` information architecture. It adds a journey layer that understands the user’s job after first value and guides them toward the most relevant existing capability.

Core model:

`comfortable input → first usable Urdu → intended destination → successful completion → optional keep/share/publish/return`

The product must continue to support fast one-shot jobs. A user who only wants to convert three Roman Urdu words and copy them should not be forced through an intent wizard.

---

## 2. Reconciled current-state decision

The external feedback added useful opportunities but also contained several stale/incorrect product assumptions. This programme uses the **live repository/runtime as source of truth**.

Already shipped and therefore **not greenfield work**:

- direct Urdu keyboard input;
- both-direction legacy InPage-text ↔ Unicode conversion;
- a substantial Urdu typing-practice/WPM product;
- 12 school/office/business/personal writing templates;
- WhatsApp Status image creation;
- Voice→WhatsApp text action;
- Nastaliq fonts and Card/visual export;
- optional account/cloud/public-share/community server features.

Therefore this programme focuses on:

- quality benchmarking;
- destination intent;
- journey continuity;
- print fidelity;
- positioning/retention;
- bounded missing job support.

It does not rebuild existing engines under new names.

---

## 3. Problem

Current WriteUrdu is broad but still tool-centric.

A Pakistani user commonly begins with an intention such as:

- “I need this for WhatsApp”;
- “I need a school application/assignment”;
- “I want to make a poetry image”;
- “I need a formal Urdu document to print”;
- “The shop/publisher still needs InPage-compatible text”;
- “I am preparing for an Urdu typing requirement.”

The current product can already complete most of these jobs, but it often requires the user to understand which WriteUrdu product route corresponds to the outcome.

This creates four strategic problems:

1. **Unknown demand:** telemetry knows activation/output events but not the destination/job behind them.
2. **Fragmented continuation:** recommendations rely primarily on current workspace/text state rather than explicit user intent.
3. **Unbenchmarked quality edges:** Roman Urdu variation and professional Nastaliq/print fidelity are plausible moats but not yet measured well enough for risky production changes or marketing claims.
4. **Roadmap blindness:** without destination evidence, feature expansion risks being driven by intuition instead of observed jobs.

---

## 4. Non-goals

This programme must not:

- add a blocking questionnaire before typing;
- create another all-tools grid on the homepage;
- replace existing mature URLs;
- create doorway pages for every tiny intent synonym;
- send typed text, transcripts, Roman source or document content to analytics;
- make account creation a prerequisite for instant Urdu writing;
- replace the current transliteration provider merely because Roman Urdu variation exists;
- broaden Card Studio acquisition before `WU-PLAT-002H` P0.1F completion evidence;
- destabilize current mobile editor acceptance;
- treat inferred destination as fact when the user has not selected it;
- claim that nobody types Urdu directly;
- claim InPage conversion or typing practice are missing;
- create a second typing-test, template, social-image or InPage-conversion engine;
- position WriteUrdu as a complete InPage replacement before print-fidelity/product evidence;
- use a blanket “nothing leaves your browser” trust slogan across features with different processing models.

---

## 5. Strategic principles

### 5.1 First value before destination choice

The user must be able to start writing immediately. Destination guidance may appear only after:

- first useful text;
- a completed voice result;
- an opened template;
- another clear value-producing action.

### 5.2 Ask rarely, learn a lot

A single non-blocking question such as `Where will you use this Urdu?` can be more valuable than many speculative UI changes.

### 5.3 Reuse before build

When the destination is known, prefer routing to an existing capability:

- messaging → Copy / existing WhatsApp action;
- social image → Card Studio/social maker;
- school/formal → writing template / Rich Editor;
- document/print → Rich Editor → Word/PDF/Print;
- legacy publishing → existing InPage/Unicode bridge;
- career practice → existing Typing Practice.

### 5.4 Message text ≠ Status image

Treat messaging and social-image outcomes separately. A WhatsApp message should not default users into the Status image maker.

### 5.5 One next-step recommendation, not a portal

Follow the existing continuation rule: one primary and at most two secondary next actions.

### 5.6 Benchmark before quality rewrites

Two areas require evidence before architecture changes:

- Roman Urdu spelling/code-switching/recovery quality;
- professional Nastaliq/PDF/print fidelity.

### 5.7 Privacy-safe intent, truthful processing

Intent categories are allowed; content is not.

Allowed example:

`destination_intent = school`

Forbidden example:

`destination_text = "write leave application for principal..."`

Trust copy must reflect actual processing per capability. Core/local-first behaviour is valuable, but transliteration, voice, accounts, public sharing and other features have different provider/server boundaries documented by the current privacy page.

---

## 6. Destination taxonomy v1

Use a deliberately small taxonomy. Do not start with dozens of categories.

### Primary destination categories

1. `message` — WhatsApp / messaging / copy to another app
2. `social` — social post/status/caption/image
3. `school` — school/college assignment/application/learning
4. `formal_work` — office/application/letter/notice/business document
5. `creative` — poetry/story/quote/personal writing
6. `print_design` — Word/PDF/printing/InPage/design workflow
7. `practice` — typing practice/test/job preparation
8. `other` — bounded escape hatch

### Optional second-level job tags

Only add after the primary taxonomy proves useful. Examples:

- `school.application`
- `school.essay`
- `school.speech`
- `creative.poetry`
- `message.whatsapp`
- `social.status`
- `formal_work.letter`

Do not create second-level taxonomy simply because it can be imagined.

---

## 7. Programme slices

### Slice A — Destination intent measurement

**Spec:** `WU-JOURNEY-001A`

Goal:

- learn why people need Urdu without collecting their text;
- join intent with existing first-value/outcome aggregate evidence;
- produce a Product Pulse destination report.

### Slice B — Roman Urdu resilience benchmark

**Spec:** `WU-JOURNEY-001B`

Goal:

- build a reproducible quality benchmark for Pakistani Roman Urdu variation, names/numbers, formatting and mixed-language input;
- document suggestion/Backspace recovery before redesigning it;
- do not change production transliteration until benchmark evidence identifies a real fix with regression safety.

### Slice C — Messaging/social/copy/card outcome continuity

**Spec:** `WU-JOURNEY-001C`

Goal:

- distinguish text-message vs Status/image jobs;
- route short/social intent toward Copy, WhatsApp, status or Card Studio appropriately;
- use existing Voice→WhatsApp capability first;
- create a dedicated WhatsApp-message route only if product/search evidence justifies it;
- depend on Card Studio completion acceptance before acquisition expansion.

### Slice D — School, formal & everyday writing jobs

**Spec:** `WU-JOURNEY-001D`

Goal:

- extend the existing 12-template/document journey around missing real jobs rather than generic editor features;
- focus likely expansion on essay/speech/story/summary/assignment structures rather than duplicate request letters;
- preserve safe template wording and one query owner per strong intent.

### Slice E — Typing practice career/test pathway

**Spec:** `WU-JOURNEY-001E`

Goal:

- reposition the **already-shipped** typing practice product for users with Urdu WPM/job-test intent;
- measure repeat practice and acquisition before expanding into exam-specific content;
- do not create a second `/urdu-typing-test` engine by default.

### Slice F — Professional print / Word / PDF / InPage journey

**Spec:** `WU-JOURNEY-001F`

Goal:

- benchmark the current Nastaliq/browser/raster PDF path before promising print-grade replacement;
- connect existing Rich Editor/export/Cleaner/InPage capabilities into a professional end-to-end workflow;
- evaluate a bounded Unicode-master + legacy-payload + proof “print pack” only after evidence;
- make the distinction between Unicode text conversion and full InPage document conversion explicit.

### Slice G — Dual-script confidence companion

**Spec:** `WU-JOURNEY-001G`

Goal:

- test whether an optional `Show what I typed` Roman-source companion helps less-confident Urdu-script readers in short-message/learning contexts;
- show actual source entered in the current session, never reverse-transliteration guesswork;
- keep off by default and behind evidence.

### Cross-cutting — Trust/processing positioning

No new duplicate epic.

Use the existing privacy/public-copy/SEO governance to:

- foreground truthful feature-specific processing where useful;
- distinguish browser-local tools from Google/provider-assisted/server-backed actions;
- preserve ad-light authoring as a trust advantage;
- avoid blanket claims that contradict the current privacy policy.

---

## 8. Sequence

### Phase 0 — documentation / no product behaviour change

- land this programme and child specs;
- preserve `WU-PLAT-002H` as current P0 gate;
- do not modify core writer UI.

### Phase 1 — evidence foundations

May run before major UI work if isolated:

- `001A` schema/event support and Product Pulse design;
- `001B` fixture corpus + baseline harness;
- `001F` print/Nastaliq fidelity fixture/audit spike;
- GSC/query mapping for school, messaging, print and typing-practice intents;
- trust-copy audit against the current privacy contract.

### Phase 2 — first destination experiment

After P0.1 post-change review:

- test one non-blocking destination prompt after first value on one bounded workspace/cohort;
- validate response rate and downstream outcome lift;
- do not roll site-wide by default.

### Phase 3 — reuse existing products based on observed intent

- contextual message/social continuation;
- template/document continuation;
- print/InPage continuation;
- typing-practice career positioning;
- optional dual-script confidence experiment if evidence supports it.

### Phase 4 — capability expansion only where evidence remains unsatisfied

Examples:

- transliteration/recovery quality improvement after benchmark;
- new writing templates after demand proof;
- export/rendering architecture change after print-fidelity benchmark;
- additional professional conversion capability only after real usage.

---

## 9. Metrics

Programme-level measures:

- destination response rate when prompt is eligible;
- destination mix by route/device/input mode;
- destination → successful outcome rate;
- first outcome latency where measurable without invasive instrumentation;
- continuation click → destination ready → meaningful start;
- Copy outcome health after destination UI;
- repeat visit/practice rate for relevant cohorts;
- template open → handoff → outcome;
- message action vs Status/image action;
- social/card handoff → export complete;
- print intent → Word/PDF/Print/InPage/proof outcome;
- print-fidelity reference results before/after any export change;
- no degradation in `writer_first_input / writer_eligible`;
- no material CWV regression.

No success claim may be made from prompt clicks alone.

---

## 10. Privacy contract

Never collect in product telemetry:

- writer text;
- Roman Urdu strings/source;
- speech transcripts;
- selected text;
- template-edited content;
- filenames;
- share IDs;
- document IDs in product-event payloads;
- uncontrolled URLs/referrers;
- contacts/phone numbers;
- actual accepted/rejected suggestion words.

Intent and outcome must be bounded enums only.

This telemetry rule is separate from provider processing required by a user-selected capability; public copy must continue to explain those boundaries truthfully.

---

## 11. Acceptance for the programme definition

The programme is correctly implemented only when:

1. existing capabilities remain independently usable without selecting an intent;
2. the destination taxonomy is bounded and privacy-safe;
3. no new core-writer UI ships before the owning P0 gate permits it;
4. each child either reuses an existing product or proves why a new capability is necessary;
5. destination recommendations preserve state through existing handoff infrastructure;
6. Card Studio promotion remains gated by completion evidence;
7. Roman Urdu production changes require benchmark evidence and regression tests;
8. print-grade positioning/export changes require the `001F` fidelity baseline;
9. no duplicate typing-test or InPage-converter engine is introduced;
10. message and Status-image outcomes remain distinct;
11. public trust copy remains consistent with actual provider/server/local processing;
12. Product Pulse can eventually answer both `what input did users use?` and `what were they trying to accomplish?` without reading their content.

---

## 12. Rollback principle

Every destination-aware UI experiment must be controlled so it can be disabled without affecting:

- transliteration;
- direct typing;
- voice input;
- copying;
- export;
- existing route ownership;
- saved/local drafts.

If destination UI, dual-script assistance or a new completion lane reduces first-value activation, remove it and keep the measurement/research learning.

If a quality/export candidate fails its benchmark, keep the current production behaviour.