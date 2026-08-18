# WriteUrdu V2 — Handoff Runtime Migration

**Status:** Slice A/B implementation note  
**Date:** 2026-08-18  
**Owner:** `WU-PLAT-002`

## Goal

Move cross-workspace transfer to one shared producer/consumer API without breaking the journeys that already work.

The migration is deliberately incremental. Existing destinations keep their current keys while the v2 runtime mirrors/reads those formats. Later slices can migrate each producer and consumer independently.

## Shared v2 modules

- `js/workspace-journey-registry.js` — one descriptor source for current, planned and research workspaces.
- `js/workspace-handoff.js` — v2 envelope validation, 30-minute `sessionStorage`, bounded payloads, compatibility mirrors and privacy-safe event metadata.

New P0 journey code must use these modules rather than inventing another direct `sessionStorage` key.

## Existing compatibility keys

| Current behavior | Legacy key | v2 workspace |
| --- | --- | --- |
| Basic/Keyboard/Rich → Rich | `writeUrdu.richEditor.incoming.v1` | `rich-editor` |
| Editor → Card Studio | `writeUrdu.cardStudio.incoming` | `card-studio` |
| Editor → Stylish Urdu | `writeUrdu.stylishText.incoming.v1` | `stylish-text` |
| Editor/Stylish → Name Art | `writeUrdu.nameArt.handoff.v1` | `name-art` |
| Generic text → Basic/Cleaner | `write-urdu:text-handoff:v1` | `basic-writer` / `text-cleaner` |

## Compatibility behavior

### New producer → old consumer

When v2 stores a compatible `plain-text` handoff for one of the current destinations, it also writes the legacy mirror expected by the current consumer.

This allows a new v2 producer to ship before the destination page is migrated.

### Old producer → new consumer

When v2 consumes a target and there is no valid v2 envelope, it checks the known legacy key, validates age/target/content and normalizes it into a v2 envelope.

This allows a destination to migrate before all of its producers.

### One-time behavior

A successful v2 consume removes both the v2 envelope and its matching legacy mirror. A wrong target must not destroy a valid generic legacy handoff intended for another route.

## Migration order

1. **Slice A/B:** ship registry/runtime + compatibility tests. Existing page behavior stays untouched.
2. **Slice C:** migrate core Basic/Keyboard/Rich/Cleaner producers/consumers to the v2 API.
3. **Slice F:** migrate Image to Urdu Text, Voice Typing and InPage continuation.
4. **Slice G:** migrate Templates/Card/QR/public-share compatible seeds.
5. Remove a legacy key only after no active producer or consumer depends on it and regression tests prove the replacement path.

There is no flag-day removal of `js/card-studio-entry.js` or `js/text-handoff.js`.

## Privacy invariants

- 30-minute session-only handoff lifetime;
- no user text in URL/query/hash;
- no user text in journey telemetry;
- no durable `localStorage` use for ephemeral handoffs;
- source state stays owned by the source workspace;
- target conflict/recovery rules stay owned by the target workspace.

## Release gate

A new P0 destination is not allowed to create its own handoff key/API. It must first be registered and accept a supported payload kind through the shared runtime.