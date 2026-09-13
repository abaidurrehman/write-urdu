# WU-CARD-CONTENT-001A — Recurring Social Content Library

Use this skill for recurring prepared-text/card-corpus expansion under `WU-CARD-CONTENT-001A`.

The canonical execution skill is:

`skills/wu-card-content-001a/SKILL.md`

Read that file in full before coding, then follow its mandatory read order and batch discipline.

## Epic sources

```text
specs/WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md
specs/WU-CARD-CONTENT-001-ARCHITECTURE-CONTRACT.md
specs/WU-CARD-CONTENT-001-ACCEPTANCE-MATRIX.md
specs/WU-CARD-CONTENT-001A-recurring-social-content-library.md
specs/WU-CARD-CONTENT-001A-IMPLEMENTATION-CHECKLIST.md
specs/WU-CARD-CONTENT-001A-ACCEPTANCE-MATRIX.md
docs/WU-CARD-CONTENT-001A-CODEX-HANDOFF.md
```

## Related consumer

```text
WU-CARD-RETENTION-001 / 001A
```

The homepage consumes only a narrow `featuredEligible` subset. It does not own or duplicate the content corpus.

## Non-negotiable rules

- Keep one canonical ready-made card/content registry.
- Preserve current public card IDs and existing `/urdu-cards` consumers unless a migration is explicitly designed/tested.
- Prefer original Write Urdu copy for general social messages.
- Never copy Pinterest/Instagram/Reddit captions into the production corpus.
- Never invent religious/literary attribution.
- Quran/Hadith content requires verified source/provenance.
- General original dua must not be labeled Quran/Hadith.
- Modern copyrighted poetry/song/ghazal text requires permission/license.
- Do not ship 120–160 items in one PR; work in reviewable 20–40 item batches.
- Every public message must pass Urdu, source/rights, background pairing, mobile and share-output review.
- Only a broad, manually approved subset may be homepage-featured.
- Do not normalize the whole data model until actual corpus scale justifies it.
- Raw content count is not the success metric; trust, visual quality and repeat usefulness are.