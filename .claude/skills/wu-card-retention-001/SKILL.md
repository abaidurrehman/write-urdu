# WU-CARD-RETENTION-001 — Card Retention & Sharing Engine

Use this skill for `WU-CARD-RETENTION-001` and `WU-CARD-RETENTION-001A` work.

The canonical execution skill is:

`skills/wu-card-retention-001/SKILL.md`

Read that file in full before coding, then follow its mandatory read order and execution discipline.

## Epic sources

```text
specs/WU-CARD-RETENTION-001-card-retention-sharing-engine.md
specs/WU-CARD-RETENTION-001A-homepage-contextual-featured-card.md
specs/WU-CARD-RETENTION-001-IMPLEMENTATION-CHECKLIST.md
specs/WU-CARD-RETENTION-001-ACCEPTANCE-MATRIX.md
docs/WU-CARD-RETENTION-001-CODEX-HANDOFF.md
```

## Existing owners that must be reconciled, not forked

```text
WU-CARD-CONTENT-001   # curated texts/card definitions/source & rights
WU-CARD-GALLERY-001   # shared background/preview architecture
WU-SHARE-001          # public share infrastructure
/urdu-card-studio     # editing/export destination
```

## Non-negotiable rules

- Homepage writer stays primary.
- Show exactly one contextual homepage card.
- Expose exactly two primary actions: Share and Open in Card Studio.
- No carousel, category/mood/relationship chips, favorites, shuffle or homepage mini-gallery in Slice A.
- Reuse the canonical ready-made card registry; do not create a homepage-only Urdu text array.
- Reuse/extract the existing `/urdu-cards` public-share implementation; do not clone it.
- Use browser-local deterministic morning/daytime/evening/night selection with local Friday override.
- Do not use geolocation, profile inference, AI or user editor contents for selection.
- Add `home-featured-card` to Card Studio visual-seed validation explicitly; do not weaken the allowlist.
- Never put Urdu card text in the URL as handoff transport.
- Never send private/user editor text to telemetry.
- If the card module fails, the core writer must continue normally.
- Preserve mobile editor visibility/keyboard acceptance.
- Execute `WU-CARD-RETENTION-001A` before later retention experiments.
