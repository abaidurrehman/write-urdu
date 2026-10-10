# WU-FONT-001 — Urdu Typography & Font Discovery

Use this skill for `WU-FONT-001` work.

The canonical execution skill is:

`skills/wu-font-001/SKILL.md`

Read that file in full before coding, then follow its mandatory read order and slice discipline.

## Epic sources

```text
specs/WU-FONT-001-urdu-typography-font-discovery-platform.md
specs/WU-FONT-001-ARCHITECTURE-CONTRACT.md
specs/WU-FONT-001-IMPLEMENTATION-CHECKLIST.md
specs/WU-FONT-001-ACCEPTANCE-MATRIX.md
docs/WU-FONT-001-MARKET-LICENSE-EVIDENCE-2026-09-13.md
```

## Non-negotiable rules

- Do not add font binaries from download mirrors.
- Do not claim fallback rendering is a named system font.
- Do not load the full font library globally.
- Do not break current Card Studio/Name Art/Rich Editor behavior or saved projects.
- Do not create a new public indexed `/urdu-fonts` route before its roadmap/indexing gate is satisfied.
- Do not send user preview text into URLs or telemetry.
- Preserve Urdu OpenType shaping when converting or optimizing fonts.

If implementation permission is unclear, execute only the current approved/gated foundation slice and report what blocks the next slice.
