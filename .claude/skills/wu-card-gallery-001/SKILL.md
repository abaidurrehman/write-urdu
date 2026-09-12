# WU-CARD-GALLERY-001 — Live Urdu Card Gallery

Use this skill for `WU-CARD-GALLERY-001` work.

The canonical execution skill is:

`skills/wu-card-gallery-001/SKILL.md`

Read that file in full before coding, then follow its mandatory read order and slice discipline.

## Epic sources

```text
specs/WU-CARD-GALLERY-001-live-urdu-card-gallery.md
specs/WU-CARD-GALLERY-001-ARCHITECTURE-CONTRACT.md
specs/WU-CARD-GALLERY-001-IMPLEMENTATION-CHECKLIST.md
specs/WU-CARD-GALLERY-001-ACCEPTANCE-MATRIX.md
docs/WU-CARD-GALLERY-001-CODEX-HANDOFF.md
```

## Non-negotiable rules

- Do not replace or redesign `/urdu-card-studio`.
- Do not duplicate the background registry; extract/reuse one shared registry.
- Preserve all existing live background IDs.
- Do not render one canvas per gallery preview on each keystroke.
- Preview with lightweight DOM text + art + overlay inside metadata safe areas.
- Test short, medium and long Urdu text.
- Never put user text in URLs or telemetry.
- Reuse current Card Studio handoff and export architecture.
- Keep public/indexable route launch behind the current Card Studio/P0 gate unless the canonical backlog records an explicit exception.
- If roadmap permission is unclear, execute Slice 0 only and report the gate.
