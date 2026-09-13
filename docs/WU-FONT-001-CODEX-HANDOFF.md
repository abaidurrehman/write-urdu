# WU-FONT-001 — Codex Implementation Handoff

Paste the prompt below into Codex from the Write-Urdu repository when implementation is authorized.

---

Product: Write-Urdu.com  
Epic: `WU-FONT-001`  
Goal: build one governed Urdu typography/font platform, then an interactive font-comparison journey that continues into existing creation tools.

## Start here

Read in this exact order:

1. `specs/BACKLOG.md`
2. `skills/wu-font-001/SKILL.md`
3. `specs/WU-FONT-001-urdu-typography-font-discovery-platform.md`
4. `specs/WU-FONT-001-ARCHITECTURE-CONTRACT.md`
5. `specs/WU-FONT-001-IMPLEMENTATION-CHECKLIST.md`
6. `specs/WU-FONT-001-ACCEPTANCE-MATRIX.md`
7. `docs/WU-FONT-001-MARKET-LICENSE-EVIDENCE-2026-09-13.md`
8. current Card Studio, Name Art and Rich Editor font implementations/tests
9. current `/urdu-fonts-nastaliq-vs-naskh` and `/stylish-urdu-text-generator`
10. current SEO/public-route/locale/service-worker governance

Search the current repository before changing code. Do not trust filenames or assumptions from the spec if runtime has moved since the spec was written.

## Execute only the currently authorized slice

If no later slice is explicitly authorized, perform **Slice 0 only**:

```text
current font inventory
license evidence table
shaping fixtures
font request/byte baseline
shared registry contract/fixtures/tests
```

Do not create/index/promote `/urdu-fonts` merely because it is specified.

## Critical invariants

1. Never add a new font binary from a third-party download mirror.
2. A named preview must actually render that font.
3. Jameel Noori/other rights-sensitive fonts remain system/reference-only until authoritative rights are verified.
4. Preserve existing Card Studio saved projects and default rendering.
5. Preserve current Name Art and Rich Editor behavior.
6. No full font catalog on Basic Writer/global shell.
7. Preserve Urdu GSUB/GPOS shaping through any WOFF2 conversion/subsetting.
8. User preview text stays local and never enters URLs/telemetry.
9. Use one shared registry; do not create separate new font arrays.
10. Do not fork Card Studio/export/render engines.

## Desired architecture

Create a neutral shared registry, likely `js/urdu-font-registry.js`, following current repo module conventions.

Use stable IDs such as:

```text
noto-nastaliq-urdu
noto-naskh-arabic
amiri
lateef
scheherazade-new
tajawal
mehr-nastaliq-web
```

Registry fields should cover family, style, delivery, license state, capabilities, line-height, source/license references, recommendation tags and approved asset URLs.

Build/reuse a deduplicated font loader that can strict-load a family before canvas measurement/export.

## Current product facts to verify, not blindly assume

- global Urdu token currently prefers Noto Nastaliq Urdu then Noto Naskh Arabic;
- Card Studio/Name Art currently expose six web families;
- Rich Editor currently exposes a different Urdu/Arabic set;
- documentation mentions `Qadreeregular` while active runtime may not;
- Card Studio already waits for font readiness before canvas export.

## Slice 0 output

Create/update a dated implementation evidence file recording:

```text
surface → current font declarations
actual active font choices
font source/delivery
license state
canvas/export path
network baseline
shaping fixture result
known inconsistencies
recommended first approved candidate
```

Add tests for the registry schema/evidence rules if implementing the registry skeleton is allowed by the current backlog.

## Validation

Run the focused tests you add plus all existing font/Card Studio/Name Art/Rich Editor tests touched by the work. Then run the repository's normal validation commands required for spec/JS changes.

Do not weaken tests to make the slice pass.

## Completion report

Return:

```text
Slice completed
Files changed
Current font inventory summary
License decisions / still-pending fonts
Tests run + results
Performance baseline
Browser/manual evidence
Roadmap/index state
Any blockers
Recommended next slice
```

If a font's rights or actual rendering cannot be proven, mark it pending instead of guessing.
