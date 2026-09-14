# WU-FONT-001 — Slice 1 Registry & Loader Foundation

**Captured:** 2026-09-14  
**Branch:** `feat/wu-font-001-slice1`  
**Parent:** Slice 0 branch / PR #204  
**Public UI change:** none

## Implemented

Slice 1 adds the first runtime source of truth for Urdu typography without migrating existing product surfaces yet.

### Shared registry

`js/urdu-font-registry.js` provides:

- stable IDs for the eight Urdu/Arabic web families already shipped across Write Urdu;
- canonical legacy-name normalization, including `Scheherazade` → `scheherazade-new`;
- bounded style, delivery, license and capability enums;
- per-surface capability filters for Card Studio, Name Art, Rich Editor and preview use;
- immutable records with family, weights, line-height, fallback, recommendation and authoritative-source metadata;
- governed candidate records for Mehr, Awami, Nafees, Jameel Noori variants, AlQalam Taj, AA Sameer Sagar and Gandhara Suls;
- fail-closed validation that forbids `assetUrl` or `stylesheetUrl` on `license-review` records.

The registry does **not** make a candidate supported merely by naming it.

## Loader behavior

`createLoader()` is intentionally explicit and narrow:

1. resolve stable ID / legacy family name;
2. reject unknown or non-`approved-web` fonts;
3. reuse an existing Font Loading API face when the page already loaded it;
4. otherwise inject only the requested approved font stylesheet;
5. retry the Font Loading API after stylesheet readiness;
6. verify readiness when `document.fonts.check` is available;
7. cache concurrent identical requests;
8. return structured success/failure rather than silently accepting fallback rendering.

This keeps the existing global font cost unchanged. The full catalog is not loaded by merely importing the registry.

## Current governed web families

| Stable ID | Family | Current governed surfaces |
| --- | --- | --- |
| `noto-nastaliq-urdu` | Noto Nastaliq Urdu | editor, Card Studio, Name Art, preview, canvas |
| `noto-naskh-arabic` | Noto Naskh Arabic | editor, Card Studio, Name Art, preview, canvas |
| `amiri` | Amiri | editor, Card Studio, Name Art, preview, canvas |
| `lateef` | Lateef | editor, Card Studio, Name Art, preview, canvas |
| `scheherazade-new` | Scheherazade New | Card Studio, Name Art, preview, canvas; legacy Rich Editor uses `Scheherazade` and is reconciled in Slice 1B |
| `tajawal` | Tajawal | editor, Card Studio, Name Art, preview, canvas |
| `harmattan` | Harmattan | Rich Editor + preview |
| `katibeh` | Katibeh | Rich Editor + preview |

## Explicit non-goals

Slice 1 does not:

- change any visible font selector;
- change the default Urdu font;
- change Card Studio export behavior;
- modify TinyMCE configuration;
- remove the Qadreeregular documentation mismatch;
- add a new font binary;
- enable Mehr/Jameel/other license-review candidates;
- create or index `/urdu-fonts`.

Those belong to later slices.

## Tests

`tests/urdu-font-registry.test.js` covers:

- stable current-family IDs;
- immutable records;
- capability filtering;
- legacy-name normalization;
- duplicate/schema validation;
- license-review asset prohibition;
- already-loaded font reuse;
- scoped stylesheet injection;
- concurrent promise de-duplication;
- explicit failure for candidates, unknown fonts and browsers without Font Loading API.

The Slice 0 test has also been registered with the repository contract runner, fixing the CI governance failure discovered on PR #204.

## Slice 1 exit decision

The foundation is ready for Slice 1B only after CI is green. Slice 1B should migrate the existing selectors/adapters to this registry without adding new font families first. That separation protects saved Card Studio projects and makes regressions attributable.
