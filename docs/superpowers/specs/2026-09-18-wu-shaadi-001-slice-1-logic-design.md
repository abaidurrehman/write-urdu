# WU-SHAADI-001 Slice 1 — Logic-Only Design (pre-route)

**Date:** 2026-09-18
**Epic:** WU-SHAADI-001 (Pakistan Wedding Invitation Platform)
**Parent spec:** specs/WU-SHAADI-001-pakistan-wedding-invitation-platform.md
**Architecture:** specs/WU-SHAADI-001-ARCHITECTURE-CONTRACT.md
**Checklist:** specs/WU-SHAADI-001-IMPLEMENTATION-CHECKLIST.md (Slice 1 section)
**Backlog gate:** specs/BACKLOG.md P1.10 — "planned behind the activation evidence review"; the `/urdu-wedding-invitation-maker` route requires explicit roadmap/release permission not yet granted.

## Why this slice is scoped the way it is

Slice 1's checklist ("Local structured invitation composer") bundles route/shell, setup-flow UI, wording, local persistence and preview into one slice. The route step is explicitly blocked ("Add /urdu-wedding-invitation-maker only after roadmap/release permission"). Rather than wait idle, this design carves out the parts of Slice 1 that are pure logic/state — provable with Node/fixture tests, zero DOM, zero route — mirroring how Slice 0 proved the Card Studio render adapter without shipping a page. UI/route work is deferred to a follow-up slice once permission lands.

## Scope reconciliation against the Architecture Contract's module list (§3)

Slice 0 already merged what the contract listed as separate modules (`wedding-event-registry.js`, `wedding-invitation-view-model.js`) into `js/wedding-project-core.js`. This design continues that reconciliation rather than resurrecting file names the contract itself said were provisional ("Exact filenames must be reconciled against current repository code").

Net-new work in this slice:

1. `js/wedding-project-storage.js` — local draft persistence.
2. `js/wedding-template-selector.js` — deterministic wording-template auto-selection (new file, not merged into the registry, so the registry stays a pure data/render module with no selection policy).
3. Composer step-completeness logic, added to `js/wedding-project-core.js` — a pure function reporting which of the 6 setup steps are complete/current/blocked for a given `WeddingProject`.
4. Wording-override tracking, added to `js/wedding-project-core.js`'s wording-related shape — `{ text, isOverridden, generatedFrom }` so hand-edited wording survives regeneration without silently going stale or silently being overwritten.
5. Event design-palette suggestion mapping (`EVENT_DESIGN_PALETTES` + `suggestBackgroundCategory`), added to `js/wedding-template-selector.js` — data/suggestion only, no new art assets (see §5).

Explicitly excluded from this slice: guest list/households, publication, RSVP, the wizard HTML/CSS, the route itself, and production of any new SVG/art background assets or new wording copy (tracked separately, see §5 Follow-up production tasks). These remain Slice 1-UI (gated on roadmap permission), Slice 2 (design system + asset production), Slice 3+ (guests/bulk/publish).

## 1. `js/wedding-project-storage.js`

Pure(-ish) persistence wrapper, same UMD/Node-and-browser style as `wedding-project-core.js`. Follows the existing repo convention seen in `js/invoice-generator.js` (try/catch localStorage, normalize-on-load, fail-closed).

- `saveDraft(project)` — `normalizeWeddingProject` then `JSON.stringify` then `localStorage.setItem`. Any thrown error (quota, private-mode) is caught and returned as `{ ok: false, errorCode }`, never thrown to the caller.
- `loadDraft()` — `localStorage.getItem` → `JSON.parse` → `normalizeWeddingProject`. Any failure at any step (missing key, invalid JSON, schema mismatch after migration) returns `null`. Never returns a partially-parsed or partially-normalized object.
- `resetDraft()` — removes the stored key; catches and ignores localStorage errors (reset should never throw).
- `schemaVersion` migration: a version-keyed function table (`{ 1: (raw) => raw }` today). The seam exists now so a real future migration is additive, not a breaking rewrite. `loadDraft` runs the raw parsed object through the migration table keyed by its own `schemaVersion` field before normalizing; an unknown/missing version fails closed to `null` rather than guessing.
- No network call anywhere in this module. No guest data (there is none yet in this slice) ever leaves `localStorage`.

## 2. `js/wedding-template-selector.js`

- `selectTemplate(project, event)` — pure function, no side effects, no randomness. Given the event's type and the project's `invitationLanguage`, and a documented formal/informal signal (e.g. explicit `wordingTone` field on the event/project — never inferred from a name or free text), returns one of the 5 existing template IDs from `wedding-wording-registry.js`.
- When signals are ambiguous or a matching template doesn't exist for that combination, falls back to a single documented default template ID — never silently picks based on invented heuristics, and the fallback is asserted directly in tests.
- Imports templates from `wedding-wording-registry.js` for the ID list only; does not duplicate template content or rendering logic. The registry itself is unchanged.

## 3. Composer step-completeness logic

Added to `js/wedding-project-core.js` as `evaluateComposerSteps(project)`, returning a per-step status array covering the 6 setup steps (event selection, host/family details, date/programme/venue, language/wording mode, design, preview/export):

- Steps 1–4 are "complete" purely based on `validateWeddingProject`-equivalent per-section checks already in the core module (event exists, host mode set, at least one event has a date, language set, etc.) — no new validation rules invented, just re-surfaced per-step.
- Step 5 (design) is a **fixed-default stub for this slice**: always reports "complete" once steps 1–4 are done, and always resolves to `classic-nastaliq` / `portrait` — the same default `wedding-invitation-render-adapter.js` already uses. No design-picker data field is added. This is a deliberate, documented default per the epic's "bounded configurable model, not an invented feature" rule, not a hidden assumption.
- Step 6 (preview/export) is "available" once steps 1–5 report complete; it does not gate on anything not yet built in this slice (no export UI exists yet).
- Output shape: `[{ step: 'events', status: 'complete' | 'current' | 'blocked', missingFields: [...] }, ...]` — a future wizard UI consumes this directly without re-deriving completeness logic itself.

## 4. Wording-override tracking

Added to the wording-related shape already produced when rendering a template (currently just plain text from `wedding-wording-registry.js` render functions) — Slice 1 wraps that result as:

```
{ text: string, isOverridden: boolean, generatedFrom: { templateId, sourceFieldsSnapshot } }
```

- Default render: `isOverridden: false`, `generatedFrom` records exactly which project/event fields fed the template (a shallow snapshot of the fields the template actually reads, not the whole project).
- A user hand-edit sets `isOverridden: true` and freezes `text`; the underlying project fields remain fully editable and regenerable.
- A new pure helper `isWordingStale(wordingResult, project, event)` compares `generatedFrom.sourceFieldsSnapshot` against the current project/event fields and returns `true` if they've diverged — the caller (future UI) surfaces "wording may be outdated," but the module itself never overwrites an override and never silently discards the staleness signal.
- Regenerating wording (calling render again) never mutates an `isOverridden: true` result in place; regeneration always produces a fresh, non-overridden result that the caller must explicitly choose to accept over the override.

## 5. Event design-palette suggestion (data mapping, not new art)

Recon confirmed a gap: `js/card-background-registry.js` has 54 backgrounds total but only 3 tagged `category: 'wedding'` (`blush-rose-lanterns`, `rose-garden-frame`, `maroon-wedding`), and none are event-specific. Web research on current Pakistani wedding invitation conventions (sources logged in the completion report) surfaces a consistent, non-invented pattern:

| Event | Tone | Typical palette | Typical motifs |
|---|---|---|---|
| Nikah | reverent, intimate | deep green/gold, ivory/gold | Islamic geometric, crescent, Nasta'liq calligraphy |
| Mehndi | joyous, festive | yellow/orange/marigold | floral (rose/jasmine) |
| Baraat | grandest, opulent | deep maroon/royal red, heavy gold | paisley, Mughal arabesque, zari/foil texture |
| Walima | elegant, formal | emerald/royal blue/gold, silver accents | Mughal architectural motifs |

This slice adds only a **data mapping and a suggestion function** — no new SVG/art assets are created here (that is a separate production task, see Backlog below).

- A static `EVENT_DESIGN_PALETTES` table (in `js/wedding-template-selector.js`, alongside wording-template selection, since both are "suggest, never auto-decide" concerns) encodes the table above as controlled enum tags (`paletteTone`, `paletteColors[]`, `motifs[]`) per known event type. Custom events get no default palette (empty suggestion, never guessed).
- `suggestBackgroundCategory(project, event)` — pure function, no side effects. Cross-references the event's palette tags against `js/card-background-registry.js`'s existing `category`/`goodFor` tags and returns a ranked list of already-existing background IDs that best match (may be empty if no good match exists — an empty result is valid and expected given only 3 wedding-tagged backgrounds exist today).
- This is a **suggestion only**: it never auto-applies a background, never mutates the WeddingProject, and Card Studio remains the sole owner of actual rendering/background selection (per the Card Studio boundary rule — this function must not become disguised design-selection logic that bypasses that boundary).
- Composer step 5 (§3) stays a fixed-default stub this slice; `suggestBackgroundCategory`'s output is exposed for a future UI to show as suggestions, but step 5's completeness/default logic is unchanged by this addition.
- Test coverage: `tests/wedding-template-selector.test.js` gains fixtures asserting the palette table's suggestions are deterministic and that an unmatched/custom event returns an empty (not guessed) suggestion.

### Follow-up production tasks (tracked, not in this slice)

Tracked in `specs/BACKLOG.md` P1.10 (Slice 2 asset/wording backlog line), added alongside this spec:

1. Commission event-specific SVG backgrounds (Nikah/Mehndi/Baraat/Walima) matching the palette/motif table above, to close the gap `suggestBackgroundCategory` will otherwise keep surfacing as empty.
2. Expand `js/wedding-wording-registry.js` content with event-tone-aware wording variants (the tone signal `wedding-template-selector.js` already selects on in §2 has more to select from once written).

Both are art/copy production work, not engineering, and are explicitly not required before this slice's logic/tests ship.

## Testing plan

- `tests/wedding-project-storage.test.js` (new, Node): fake `localStorage` shim (matches existing repo pattern for browser-API-free Node tests). Covers save/load round-trip, corrupt JSON, missing/unknown `schemaVersion`, simulated quota-exceeded error, empty/never-saved state, `resetDraft` idempotency.
- `tests/wedding-template-selector.test.js` (new, Node): one fixture per template ID proving deterministic selection for its intended (eventType, language, tone) combination, plus an ambiguous-input case proving the documented fallback, plus a same-input-twice determinism check, plus §5's `suggestBackgroundCategory` fixtures (deterministic per known event type, empty for custom/unmatched).
- `tests/wedding-project-core.test.js` (extended): new fixtures/assertions for `evaluateComposerSteps` (each step status transition, the step-5 fixed-default stub, step-6 gating) and for wording-override tracking (`isOverridden` survives a project edit, `isWordingStale` detects drift, regeneration never mutates an override).
- No Playwright/browser spec in this slice — there is no DOM/route to drive yet. The existing `wedding-invitation-render-adapter.spec.js` continues to prove real-browser rendering for the fixtures that already exist; it is not modified by this slice.
- `npm test` and `node scripts/check-product-governance.js` must both stay green with no change to registered page/route/sitemap counts (governance check should report the same 45/49/102 as Slice 0, proving no route was added).

## Rollback

Every file here is additive and unreferenced by any existing page or route. Reverting the commit(s) removes the feature with zero impact on any shipped product surface — same rollback story as Slice 0.

## Explicitly not decided here

- When roadmap/release permission for `/urdu-wedding-invitation-maker` will be granted — unchanged, still gated by `specs/BACKLOG.md` P1.10.
- The actual wizard UI/CSS, guest-list handling, publication, and RSVP — all remain later slices per the epic's own sequencing.
- When the new event-specific SVG backgrounds and wording copy tracked in §5 get produced — tracked as a `specs/BACKLOG.md` P1.10 Slice 2 line item, timing not decided here.
