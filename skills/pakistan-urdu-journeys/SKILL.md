# Skill — Execute WU-JOURNEY-001 Pakistan Urdu Journey Programme

Use this skill only for work owned by `WU-JOURNEY-001` or one of its child specs.

## Required reading

Before coding, read from current branch/main:

1. `docs/WU-PAKISTAN-URDU-USAGE-GAP-ANALYSIS-2026-09-08.md`
2. `specs/WU-JOURNEY-001-pakistan-urdu-intent-destination-programme.md`
3. the relevant child spec `WU-JOURNEY-001A`–`001G`
4. `specs/WU-PLAT-002H-core-activation-feature-discovery.md`
5. `specs/WU-PLAT-002H-SCOPE-FREEZE.md`
6. `specs/WU-PLAT-002H-METRICS-CONTRACT.md` for telemetry work
7. `specs/WU-PLAT-002-v2-product-journey-workspace-handoffs.md` for handoffs
8. `specs/WU-PLAT-003-core-workspace-convergence.md` for core workspace UI
9. `write-urdu-privacy.html` before adding public privacy/trust claims
10. `specs/WU-VOICE-PLAT-001D-growth-measurement.md` for WhatsApp-message route decisions
11. `specs/archive/implemented/WU-TPL-001-urdu-writing-templates.md` before template expansion
12. `specs/WU-API-001-inpage-unicode-developer-api.md` before InPage work

Runtime code + regression tests are authoritative for shipped behaviour.

---

## Global rule

Do **not** treat this programme as permission to add more homepage/core-writer UI while `WU-PLAT-002H` remains the P0 gate.

The programme is primarily about connecting and validating **existing capabilities** around real user jobs.

If the requested slice would:

- push the editor lower;
- add another toolbar/banner/grid;
- modify production transliteration without benchmark evidence;
- replace the current PDF/font architecture before the print-fidelity baseline;
- broaden Card Studio acquisition before P0.1F evidence;
- put user text/Roman source/suggestion words in analytics or internal URLs;
- create thin SEO doorway pages;
- create a second typing-test/template/InPage/social-image engine;
- claim `nothing leaves your browser` globally;
- claim WriteUrdu replaces InPage without evidence;

stop and return to the owning spec.

---

## Corrected current-state facts

Do not implement from stale feedback assumptions.

The current product already has:

- direct Urdu keyboard input;
- English-letter → Urdu transliteration;
- Voice typing;
- 12 writing templates including school/office/business jobs;
- a full `/urdu-typing-practice` page with lessons, WPM and accuracy tests;
- both-direction legacy InPage-text ↔ Unicode conversion;
- Word/PDF/PNG/Print export;
- WhatsApp Status image maker;
- Voice→WhatsApp text action;
- optional account/cloud documents, public shares and community publishing.

Check runtime before declaring a capability missing.

---

## Execution order

### 1. Evidence foundations first

Preferred early work:

- `001A` schema/event audit and privacy-safe measurement support;
- `001B` Roman Urdu fixture corpus + current baseline harness;
- `001F` print/Nastaliq reference fixtures + current PDF/PNG/print audit;
- GSC/query analysis for message, school, print and typing-practice intents;
- public trust-copy audit against actual processing.

These may be implemented before visible journey UI only when isolated from P0-owned surfaces.

### 2. Wait for P0 review before core UI experimentation

Destination prompts, new completion bars, dual-script companion or destination-aware continuation in Basic/Rich must wait until the active `WU-PLAT-002H` review permits them.

### 3. Reuse existing products

Before implementing a new component, inspect current implementations for:

- Basic Writer Copy/Continue;
- Voice `Send to WhatsApp`;
- existing WhatsApp Status maker;
- Card Studio Quick/Advanced paths;
- writing-template catalogue/handoff;
- Rich Editor exports;
- shared `site-runtime.js` export path;
- typing-practice engine;
- InPage converter and Text Cleaner;
- current privacy disclosures.

Prefer extending the existing registry/controller/runtime over introducing a parallel system.

---

## Child-specific gates

### WU-JOURNEY-001A

- bounded enums only;
- server allowlist validation;
- no typed/transcript/template/search text;
- prompt only after first value;
- must arbitrate with growth prompts;
- denominator tests required.

### WU-JOURNEY-001B

- benchmark before production changes;
- no production user content in fixtures;
- include spelling variants, names, numbers, URLs, mixed English, multi-line paste and suggestion/Backspace recovery;
- document current Backspace/suggestion behaviour before changing it;
- do not log accepted/rejected words;
- record current baseline by category;
- current transliteration remains default unless a candidate clearly improves targeted cases without canonical regressions.

### WU-JOURNEY-001C

- distinguish WhatsApp **message text** from WhatsApp **Status image**;
- existing Voice→WhatsApp action is the first reusable message path;
- a new WhatsApp-message route requires the `WU-VOICE-PLAT-001D` evidence gate;
- verify P0.1F Card completion evidence before increasing image-maker promotion;
- fix handoff/measurement before increasing promotion;
- clicks are not completion;
- preserve fast Copy path.

### WU-JOURNEY-001D

- extend existing `WU-TPL-001` writing-template engine;
- subtract already-shipped school/office/business jobs before proposing new templates;
- prioritize evidence-backed missing structures such as essay/speech/story/summary/assignment, not leave-letter synonyms;
- no bulk template pages;
- no fabricated institutional rules;
- safe academic structure, not answer-farm content;
- placeholder export warning must be local/bypassable.

### WU-JOURNEY-001E

- existing `/urdu-typing-practice` engine is the product owner;
- do not create a second WPM implementation or `/urdu-typing-test` route unless distinct search/product evidence justifies it;
- no official exam affiliation claims;
- user-set goals are personal, not pass thresholds;
- keep progress local-first.

### WU-JOURNEY-001F

- **F0 print-fidelity baseline comes before export-architecture changes or print-grade marketing claims**;
- inspect the current `html2canvas → raster → jsPDF` path rather than assuming selectable text/HarfBuzz behaviour;
- existing Noto Nastaliq/OpenType/browser shaping is the baseline;
- do not introduce a shaping WASM/font replacement without a demonstrated gap;
- preserve truthful text-only InPage conversion boundary;
- do not rebuild the existing converter;
- no `.inp` full-document support unless separately approved;
- handoff via existing safe state transfer;
- Word/PDF/Print remain Rich Editor responsibilities;
- any “Print Pack” is Unicode master + optional legacy payload + proof/checklist, not a fake universal archive format;
- typography changes must be optional/reversible.

### WU-JOURNEY-001G

- evidence-gated and off by default;
- show only the actual Roman source typed in the current session;
- never reverse-transliterate the Urdu result and present it as original input;
- label stale/original source honestly after direct Urdu edits;
- default Copy remains Urdu only;
- Roman source must not enter analytics or URLs.

---

## Trust / privacy wording rule

Do not use `nothing leaves your browser` or equivalent as a blanket WriteUrdu product claim.

The current privacy contract distinguishes:

- browser-local drafting/design/QR actions;
- Google-assisted English-letter transliteration;
- browser/platform speech recognition that may use remote provider processing;
- optional account-saved documents;
- explicit public shares/community publishing;
- analytics/ads/fonts.

Public copy should explain the selected feature’s behaviour in plain language without leaking internal architecture jargon.

---

## Testing expectations

For every implementation slice:

1. run the narrowest relevant unit/contract tests;
2. run affected workspace/handoff tests;
3. run privacy/telemetry allowlist tests when events change;
4. run mobile browser acceptance when core/mobile surfaces change;
5. run SEO/static contract tests when indexed content/routes change;
6. for `001B`, rerun the full Roman Urdu benchmark and report category deltas;
7. for `001F`, rerun print-reference fixtures and document visual/selectability changes;
8. state what was intentionally not changed.

Do not claim a product improvement from code/tests alone when the spec requires post-release Product Pulse/GSC evidence.

---

## PR description checklist

Every PR should state:

- owning child spec;
- hypothesis / user job;
- existing capability being reused;
- files/surfaces changed;
- what was removed/demoted if core UI changed;
- measurement path;
- privacy/processing guardrail;
- test/benchmark results;
- release marker/flag if applicable;
- rollback path;
- whether P0.1 evidence review was required and satisfied;
- any public claim that was deliberately **not** made because evidence is incomplete.

---

## Completion rule

A child slice is not complete because a link/button exists.

Where applicable, completion requires:

`eligible/recommended → selected → destination ready → meaningful start → useful outcome`

Examples:

- message → Copy/explicit platform action;
- social image → export complete;
- school template → editor ready + edit/outcome;
- print intent → Word/PDF/Print/legacy/proof outcome;
- typing practice → test/lesson completion and repeat evidence;
- destination prompt → defensible Product Pulse mix/outcome report;
- dual-script companion → evidence of useful confidence/completion rather than extra UI usage alone.

Use observed evidence to decide the next slice.