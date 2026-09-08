# WU-JOURNEY-001 — Pakistan Urdu Intent & Destination Journey Programme

**Status:** Planned / evidence-gated  
**Priority:** P1 after `WU-PLAT-002H` activation review  
**Owner:** Product / UX / Growth  
**Evidence:** `docs/WU-PAKISTAN-URDU-USAGE-GAP-ANALYSIS-2026-09-08.md`  
**Depends on:** `WU-PLAT-002H`, `WU-PLAT-002`, `WU-PLAT-003`, `WU-ANALYTICS-003`  
**Related:** `WU-GROWTH-003`, `WU-TPL-001` (implemented/archive), `WU-COMMUNITY-001`, `WU-SHARE-001`, `WU-API-001`

---

## 1. Product decision

WriteUrdu should evolve from a catalogue of capable Urdu tools into a coherent **input → usable Urdu → destination outcome** system.

The programme does **not** replace the existing `Write / Create / Work / Learn` information architecture. It adds a journey layer that understands the user’s job after first value and guides them toward the most relevant existing capability.

Core model:

`comfortable input → first usable Urdu → intended destination → successful completion → optional keep/share/publish/return`

The product must continue to support fast one-shot jobs. A user who only wants to convert three Roman Urdu words and copy them should not be forced through an intent wizard.

---

## 2. Problem

Current WriteUrdu is broad but tool-centric.

A Pakistani user commonly begins with an intention such as:

- “I need this for WhatsApp”;
- “I need a school application”;
- “I want to make a poetry image”;
- “I need a formal Urdu document to print”;
- “I am preparing for an Urdu typing test.”

The current product can already complete most of these jobs, but it often requires the user to understand which WriteUrdu product route corresponds to the outcome.

This creates three strategic problems:

1. **Unknown demand:** telemetry knows activation/output events but not the destination/job behind them.
2. **Fragmented continuation:** recommendations rely primarily on current workspace/text state rather than explicit user intent.
3. **Roadmap blindness:** without destination evidence, feature expansion risks being driven by intuition instead of observed jobs.

---

## 3. Non-goals

This programme must not:

- add a blocking questionnaire before typing;
- create another all-tools grid on the homepage;
- replace existing mature URLs;
- create doorway pages for every tiny intent synonym;
- send typed text, transcripts or document content to analytics;
- make account creation a prerequisite for instant Urdu writing;
- replace the current transliteration provider merely because Roman Urdu variation exists;
- broaden Card Studio acquisition before `WU-PLAT-002H` P0.1F completion evidence;
- destabilize current mobile editor acceptance;
- treat inferred destination as fact when the user has not selected it.

---

## 4. Strategic principles

### 4.1 First value before destination choice

The user must be able to start writing immediately. Destination guidance may appear only after:

- first useful text;
- a completed voice result;
- an opened template;
- another clear value-producing action.

### 4.2 Ask rarely, learn a lot

A single non-blocking question such as `Where will you use this Urdu?` can be more valuable than many speculative UI changes.

### 4.3 Reuse before build

When the destination is known, prefer routing to an existing capability:

- messaging → Copy / WhatsApp;
- social image → Card Studio/social maker;
- school/formal → writing template / Rich Editor;
- document/print → Rich Editor → Word/PDF/Print;
- legacy publishing → InPage/Unicode bridge;
- career practice → Typing Practice.

### 4.4 One next-step recommendation, not a portal

Follow the existing continuation rule: one primary and at most two secondary next actions.

### 4.5 Privacy-safe intent

Intent categories are allowed; content is not.

Allowed example:

`destination_intent = school`

Forbidden example:

`destination_text = "write leave application for principal..."`

---

## 5. Destination taxonomy v1

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
- `social.status`
- `formal_work.letter`

Do not create second-level taxonomy simply because it can be imagined.

---

## 6. Programme slices

### Slice A — Destination intent measurement

**Spec:** `WU-JOURNEY-001A`

Goal:

- learn why people need Urdu without collecting their text;
- join intent with existing first-value/outcome aggregate evidence;
- produce a Product Pulse destination report.

### Slice B — Roman Urdu resilience benchmark

**Spec:** `WU-JOURNEY-001B`

Goal:

- build a reproducible quality benchmark for Pakistani Roman Urdu variation and mixed-language input;
- do not change production transliteration until benchmark evidence identifies a real fix with regression safety.

### Slice C — Social/copy/card outcome continuity

**Spec:** `WU-JOURNEY-001C`

Goal:

- route short/social intent toward Copy, WhatsApp, status or Card Studio appropriately;
- depend on Card Studio completion acceptance before acquisition expansion.

### Slice D — School, formal & everyday writing jobs

**Spec:** `WU-JOURNEY-001D`

Goal:

- extend the existing writing-template/document journey around real jobs rather than generic editor features;
- preserve safe template wording and one query owner per strong intent.

### Slice E — Typing practice career/test pathway

**Spec:** `WU-JOURNEY-001E`

Goal:

- reposition the already-shipped typing practice product for users with Urdu WPM/job-test intent;
- measure repeat practice and acquisition before expanding into exam-specific content.

### Slice F — Professional print / Word / PDF / InPage journey

**Spec:** `WU-JOURNEY-001F`

Goal:

- connect existing Rich Editor/export/InPage capabilities into a professional end-to-end workflow;
- make the distinction between Unicode text conversion and full InPage document conversion explicit.

---

## 7. Sequence

### Phase 0 — documentation / no product behaviour change

- land this programme and child specs;
- preserve `WU-PLAT-002H` as current P0 gate;
- do not modify core writer UI.

### Phase 1 — evidence foundations

May run before major UI work if isolated:

- `001A` telemetry/data design;
- `001B` offline/fixture benchmark;
- GSC/query mapping for school, print and typing-practice intents.

### Phase 2 — first destination experiment

After P0.1 post-change review:

- test one non-blocking destination prompt after first value on one bounded workspace/cohort;
- validate response rate and downstream outcome lift;
- do not roll site-wide by default.

### Phase 3 — reuse existing products based on observed intent

- contextual social continuation;
- template/document continuation;
- print/InPage continuation;
- typing practice positioning.

### Phase 4 — capability expansion only where evidence remains unsatisfied

Examples:

- transliteration quality improvement after benchmark;
- new writing templates after demand proof;
- additional professional conversion capability only after real usage.

---

## 8. Metrics

Programme-level measures:

- destination response rate when prompt is eligible;
- destination mix by route/device/input mode;
- destination → successful outcome rate;
- first outcome latency where measurable without invasive instrumentation;
- continuation click → destination ready → meaningful start;
- repeat visit/practice rate for relevant cohorts;
- template open → handoff → outcome;
- social/card handoff → export complete;
- print intent → Word/PDF/Print/InPage outcome;
- no degradation in `writer_first_input / writer_eligible`;
- no material CWV regression.

No success claim may be made from prompt clicks alone.

---

## 9. Privacy contract

Never collect:

- writer text;
- Roman Urdu strings;
- speech transcripts;
- selected text;
- template-edited content;
- filenames;
- share IDs;
- document IDs in product-event payloads;
- uncontrolled URLs/referrers.

Intent and outcome must be bounded enums only.

---

## 10. Acceptance for the programme definition

The programme is correctly implemented only when:

1. existing capabilities remain independently usable without selecting an intent;
2. the destination taxonomy is bounded and privacy-safe;
3. no new core-writer UI ships before the owning P0 gate permits it;
4. each child either reuses an existing product or proves why a new capability is necessary;
5. destination recommendations preserve state through existing handoff infrastructure;
6. Card Studio promotion remains gated by completion evidence;
7. Roman Urdu production changes require benchmark evidence and regression tests;
8. Product Pulse can eventually answer both `what input did users use?` and `what were they trying to accomplish?` without reading their content.

---

## 11. Rollback principle

Every destination-aware UI experiment must be controlled so it can be disabled without affecting:

- transliteration;
- direct typing;
- voice input;
- copying;
- export;
- existing route ownership;
- saved/local drafts.

If destination UI reduces first-value activation, remove it and keep the measurement/research learning.