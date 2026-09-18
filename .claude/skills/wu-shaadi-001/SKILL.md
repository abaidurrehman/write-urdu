# WU-SHAADI-001 — Pakistan Wedding Invitation Platform

Use this skill for WU-SHAADI-001 work.

The canonical execution skill is:

skills/wu-shaadi-001/SKILL.md

Read that file in full before coding, then follow its mandatory read order and slice discipline.

## Epic sources

specs/WU-SHAADI-001-pakistan-wedding-invitation-platform.md  
specs/WU-SHAADI-001-ARCHITECTURE-CONTRACT.md  
specs/WU-SHAADI-001-IMPLEMENTATION-CHECKLIST.md  
specs/WU-SHAADI-001-ACCEPTANCE-MATRIX.md  
docs/WU-SHAADI-001-EVIDENCE-2026-09-18.md  
docs/WU-SHAADI-001-CODEX-HANDOFF.md

## Non-negotiable rules

- WeddingProject is the source of truth, not Card Studio canvas state.
- Model guest households and invited event IDs, not just a {{name}} placeholder.
- Keep project/guest data browser-local until explicit publication.
- Never put guest/couple names in URLs or telemetry.
- Reuse current Urdu input, Card Studio, background registry and share-security patterns.
- Do not mutate verified Quranic/Arabic religious text with AI.
- Public guest links are opaque, revocable, noindex and event-scoped.
- If roadmap permission is unclear, execute Slice 0 only.
