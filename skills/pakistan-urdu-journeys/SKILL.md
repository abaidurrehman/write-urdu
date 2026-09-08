# Skill — Execute WU-JOURNEY-001 Pakistan Urdu Journey Programme

Use this skill only for work owned by `WU-JOURNEY-001` or one of its child specs.

## Required reading

Before coding, read from current branch/main:

1. `docs/WU-PAKISTAN-URDU-USAGE-GAP-ANALYSIS-2026-09-08.md`
2. `specs/WU-JOURNEY-001-pakistan-urdu-intent-destination-programme.md`
3. the relevant child spec `WU-JOURNEY-001A`–`001F`
4. `specs/WU-PLAT-002H-core-activation-feature-discovery.md`
5. `specs/WU-PLAT-002H-SCOPE-FREEZE.md`
6. `specs/WU-PLAT-002H-METRICS-CONTRACT.md` for telemetry work
7. `specs/WU-PLAT-002-v2-product-journey-workspace-handoffs.md` for handoffs
8. `specs/WU-PLAT-003-core-workspace-convergence.md` for core workspace UI

Runtime code + regression tests are authoritative for shipped behaviour.

---

## Global rule

Do **not** treat this programme as permission to add more homepage/core-writer UI while `WU-PLAT-002H` remains the P0 gate.

The programme is primarily about connecting existing capabilities around real user jobs.

If the requested slice would:

- push the editor lower;
- add another toolbar/banner/grid;
- modify production transliteration without benchmark evidence;
- broaden Card Studio acquisition before P0.1F evidence;
- put user text in analytics or URLs;
- create thin SEO doorway pages;

stop and return to the owning spec.

---

## Execution order

### 1. Evidence foundations first

Preferred early work:

- `001A` schema/event audit and privacy-safe measurement design;
- `001B` fixture corpus + baseline harness;
- GSC/query analysis for `001D`, `001E`, `001F`.

These may be implemented before visible journey UI only when isolated from P0-owned surfaces.

### 2. Wait for P0 review before core UI experimentation

Destination prompts or destination-aware continuation in Basic/Rich must wait until the active `WU-PLAT-002H` review permits them.

### 3. Reuse existing products

Before implementing a new component, inspect current implementations for:

- Basic Writer Copy/Continue;
- Voice `Send to WhatsApp`;
- Card Studio Quick/Advanced paths;
- writing-template catalogue/handoff;
- Rich Editor exports;
- typing-practice engine;
- InPage converter and Text Cleaner.

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
- record current baseline;
- report by challenge category;
- current transliteration remains default unless candidate clearly improves targeted cases without canonical regressions.

### WU-JOURNEY-001C

- verify P0.1F Card completion evidence first;
- fix handoff/measurement before increasing promotion;
- clicks are not completion;
- preserve fast Copy path.

### WU-JOURNEY-001D

- extend existing writing-template engine;
- select only evidence-backed jobs;
- no bulk template pages;
- no fabricated institutional rules;
- safe academic structure, not answer-farm content.

### WU-JOURNEY-001E

- existing typing-practice engine is the product owner;
- do not create a second WPM implementation;
- no official exam affiliation claims;
- user-set goals are personal, not pass thresholds;
- keep progress local-first.

### WU-JOURNEY-001F

- preserve truthful text-only InPage conversion boundary;
- no `.inp` full-document support unless separately approved;
- handoff via existing safe state transfer;
- Word/PDF/Print remain Rich Editor responsibilities;
- typography changes must be optional/reversible.

---

## Testing expectations

For every implementation slice:

1. run the narrowest relevant unit/contract tests;
2. run affected workspace/handoff tests;
3. run privacy/telemetry allowlist tests when events change;
4. run mobile browser acceptance when core/mobile surfaces change;
5. run SEO/static contract tests when indexed content/routes change;
6. state what was intentionally not changed.

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
- privacy guardrail;
- test results;
- release marker/flag if applicable;
- rollback path;
- whether P0.1 evidence review was required and satisfied.

---

## Completion rule

A child slice is not complete because a link/button exists.

Where applicable, completion requires:

`eligible/recommended → selected → destination ready → meaningful start → useful outcome`

Examples:

- social image → export complete;
- school template → editor ready + edit/outcome;
- print intent → Word/PDF/Print/InPage outcome;
- typing practice → test/lesson completion and repeat evidence;
- destination prompt → defensible Product Pulse mix/outcome report.

Use observed evidence to decide the next slice.