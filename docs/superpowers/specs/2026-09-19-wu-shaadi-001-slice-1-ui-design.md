# WU-SHAADI-001 Slice 1 — UI/Route Design (composer wizard release)

**Date:** 2026-09-19
**Epic:** WU-SHAADI-001 (Pakistan Wedding Invitation Platform)
**Parent spec:** specs/WU-SHAADI-001-pakistan-wedding-invitation-platform.md
**Architecture:** specs/WU-SHAADI-001-ARCHITECTURE-CONTRACT.md
**Checklist:** specs/WU-SHAADI-001-IMPLEMENTATION-CHECKLIST.md (Slice 1 section)
**Logic spec (prerequisite, already implemented):** docs/superpowers/specs/2026-09-18-wu-shaadi-001-slice-1-logic-design.md
**Backlog gate:** specs/BACKLOG.md P1.10 — route required explicit roadmap/release permission. **Permission granted 2026-09-19** by the project owner in conversation, superseding the checklist's cautious default ("keep noindex during limited validation unless SEO ownership is explicitly approved" — the owner explicitly chose indexable-at-launch, which counts as that approval).

## Why this slice exists

The Slice 1 logic layer (`js/wedding-project-core.js`, `js/wedding-template-selector.js`, `js/wedding-project-storage.js`, plus the Slice 0 `js/wedding-invitation-render-adapter.js`) is fully built and tested but has zero UI/route surface — deliberately, per the prior slice's scoping. This slice builds the actual `/urdu-wedding-invitation-maker` page that wires those modules together into a working composer, and closes the one open schema question the logic slice parked (wording-override persistence mapping).

Riwaayat's SVG art pack (PR #231, `assets/wedding-invitations/riwaayat/manifest.json`) is already wired into the logic layer via `suggestBackgroundCategory`; this slice is the first UI consumer of that suggestion.

## Scope

Net-new work in this slice:

1. `urdu-wedding-invitation-maker.html` — the page shell, route, and step markup.
2. `css/urdu-wedding-invitation-maker.css` — page-specific styles, layered on `css/product-shell.css`/`css/design-tokens.css`.
3. `js/urdu-wedding-invitation-maker.js` — DOM wiring only (no new domain logic): reads `window.WriteUrduWeddingCore`, `window.WriteUrduWeddingTemplateSelector`, `window.WriteUrduWeddingProjectStorage`, `window.WriteUrduWeddingInvitationRenderAdapter` (Slice 0's render adapter global), renders the current step, handles Back/Next, calls `saveDraft`/`loadDraft`, and triggers image export.
4. Two schema additions to `js/wedding-project-core.js`'s `normalizeEvent`: `selectedBackgroundId` (nullable) and `wordingOverride` (nullable) — see §2 below.
5. Route registration through the four canonical mechanisms (registry CSV, `seo.config.js`, `sitemap.xml`, `_redirects`).
6. A Playwright spec proving the real-browser composer flow (first for this epic's UI layer).

Explicitly excluded from this slice (unchanged from the epic's own sequencing): guest list/households, publication, RSVP, PDF export, any per-guest link. These remain Slice 2/3+.

## 1. Route & file structure

Follows the `urdu-bill-generator` precedent exactly (flat HTML at repo root, page-scoped CSS, `-core`/DOM-wiring split), not a new pattern:

- Route: `/urdu-wedding-invitation-maker`, source file `urdu-wedding-invitation-maker.html`.
- `<body class="wedding-maker-page">`.
- `<link rel="stylesheet" href="/css/site-header.css">` + `<link rel="stylesheet" href="/css/urdu-wedding-invitation-maker.css">`.
- Scripts, all `defer`, load order: `/seo.config.js`, `/js/seo.js`, `/site-header.js`, then the domain modules in dependency order — `/js/wedding-wording-registry.js`, `/js/card-background-registry.js` (still needed by Slice 0's render adapter, unrelated to the Riwaayat-only `suggestBackgroundCategory` change), `/js/wedding-project-core.js`, `/js/wedding-template-selector.js`, `/js/wedding-project-storage.js`, `/js/wedding-invitation-render-adapter.js`, then html2canvas (CDN, matching Card Studio/invoice-generator's existing loading pattern) — finally `/js/urdu-wedding-invitation-maker.js`, which guards `if (!core || !templateSelector || !storage || !renderAdapter) return;` before wiring anything, matching `bill-generator.js`'s existing guard convention.
- JSON-LD schema graph inline in `<head>` (`WebSite`, `Organization`, `WebPage`, `BreadcrumbList`, `WebApplication`) — same set `urdu-bill-generator.html` uses.
- Nav updated in the shared static nav markup, under an appropriate existing group (e.g. "Tools" or a new "Wedding" group if none fits — implementation plan decides based on current nav content at build time).
- No account requirement (per checklist).

### Registration (governance counts)

- `docs/WU-PUBLIC-PAGE-REGISTRY.csv`: +1 row (`urdu-wedding-invitation-maker.html,/urdu-wedding-invitation-maker,...,index,yes,keep,...`). Registered pages: 45 → 46.
- `seo.config.js` `config.pages`: +1 entry (id, path, indexable: true, title/description/h1/section/priority/changefreq/lastmod/schema).
- `sitemap.xml`: +1 `<loc>` entry (indexable per owner's decision). Sitemap routes: 49 → 50.
- `_redirects`: +1 mandatory trailing-slash rule `/urdu-wedding-invitation-maker/ /urdu-wedding-invitation-maker 301`. No legacy-path redirects (this is a new route, no prior URL to redirect from). Redirect rules: 102 → 103.
- `write-urdu-sitemap.html`: add the human-readable link (governance script checks for it).
- `node scripts/check-product-governance.js` must report exactly 46/50/103 after this slice — the implementation plan's tests assert these exact numbers, not "unchanged," since this is the first slice that's expected to move them.

## 2. Schema additions (`js/wedding-project-core.js`)

Two new fields on `normalizeEvent`'s return object, both nullable, both defaulting to `null` (never inferred, matching every other field in this module):

```
selectedBackgroundId: string | null   // null = "no explicit choice yet"
wordingOverride: { text, isOverridden, generatedFrom } | null   // null = "never overridden"
```

- `selectedBackgroundId` — set only when the user explicitly picks a Riwaayat variant (or any future background) in step 5. Resolution order the UI uses to decide what to actually render: explicit `selectedBackgroundId` → first match from `suggestBackgroundCategory(project, event)` → the fixed default (`classic-nastaliq`/`portrait`) `evaluateComposerSteps` already reports. This resolution logic is a new small pure function, `resolveEventBackground(project, event)`, added to `wedding-template-selector.js` (it already owns "suggest, never auto-decide" concerns) — it never mutates the project, purely resolves what step 5/6 should display.
- `wordingOverride` — exactly the shape Slice 1's logic spec already defined and tested (`wrapWordingResult`/`applyWordingOverride`/`isWordingStale`), now given a home on the event instead of only existing transiently in memory. This resolves the parked backlog question: the override lives next to `wordingTemplateId`/`wordingTone` on the event, not as a separate top-level collection, because it is fundamentally per-event state and the existing helpers already operate at that granularity.
- `wedding-project-storage.js` requires **no code change** — both fields flow through `normalizeWeddingProject`/`JSON.stringify`/`JSON.parse` like every other field. `schemaVersion` stays 1 (additive, backward-compatible: a draft saved before this slice simply lacks these keys, and `normalizeEvent` fills them in as `null` on next load, same as any other optional field).

## 3. Wizard UI

One step visible at a time (not an accordion) — chosen because `evaluateComposerSteps` already models exactly this shape (`complete`/`current`/`blocked` per step, first incomplete = current, everything after = blocked), so the step rail is a direct render of that array, not new gating logic:

- **Step rail**: 6 labeled steps across the top (events, hosts, schedule/venue, language/wording, design, preview/export), each showing complete/current/blocked visually. Clicking a non-blocked step jumps directly to it (complete steps stay editable).
- **Steps 1–4**: forms for event selection, host/family details, date/programme/venue, language + wording mode (tone + template preview via `selectTemplate`). Each field write re-runs `evaluateComposerSteps` to update the rail live.
- **Step 5 (design)**: for each event, shows `suggestBackgroundCategory(project, event)`'s matches as clickable thumbnails (the Riwaayat SVG for that event type), plus the fixed default (`classic-nastaliq`) always available as a fallback option. Clicking one sets `event.selectedBackgroundId`. If suggestions are empty (rukhsati/engagement/custom — not yet covered by Riwaayat), only the fixed default is shown, never a fabricated suggestion.
- **Step 6 (preview/export)**: for each event, renders the resolved background + rendered wording (via `renderWording`) + event details through the existing `wedding-invitation-render-adapter.js` into an on-screen preview element, then offers a "Download image" button per event using html2canvas against that rendered element — producing one PNG per event. No PDF, no bundling, no guest links, no publish/share action.
- **Wording override affordance**: on step 4 (and visible again in the step 6 preview), an "Edit wording" control lets the user hand-edit the rendered text; saving it calls `applyWordingOverride` and stores the result in `event.wordingOverride`. If `isWordingStale` later reports drift (e.g. the user goes back and changes the venue), the UI shows a "wording may be outdated — regenerate?" notice next to the override; regenerating always produces a fresh non-overridden result per the existing helper's contract, never silently discarding the override text until the user explicitly accepts the regeneration.

## 4. Persistence

- On every step transition (Next/Back/jump) and on every field blur, the page calls `wedding-project-storage.js`'s `saveDraft(project)`.
- On page load, `loadDraft()` restores the in-progress project; if `null` (first visit, corrupt data, or storage unavailable), the wizard starts from `createDefaultWeddingProject()`.
- No network call anywhere on this page — unchanged from the logic slice's constraint.

## 5. SEO / indexing

- Indexable at launch (owner's explicit decision, see header). Registered as `index,follow` in the registry/`seo.config.js`.
- Per the architecture contract's SEO section: only this route itself is a candidate for indexing. This slice generates no per-guest or per-project pages at all (guest links are Slice 3+), so there is nothing else to accidentally index.
- No name/couple/guest data ever appears in the URL, telemetry, or generated markup — the route is a static tool page; project data lives only in `localStorage`.

## Testing plan

- `tests/wedding-project-core.test.js` (extended): fixtures for `selectedBackgroundId` and `wordingOverride` defaulting to `null`, surviving a save/load round-trip unchanged, and never being inferred.
- `tests/wedding-template-selector.test.js` (extended): `resolveEventBackground` fixtures covering all three resolution-order cases (explicit selection wins; falls back to first suggestion; falls back to fixed default when suggestions are empty).
- New Playwright spec `tests/urdu-wedding-invitation-maker.spec.js` (first browser spec for this epic's UI layer, alongside the existing `wedding-invitation-render-adapter.spec.js`): drives the real page in a browser and covers —
  - Full 6-step happy path from empty project to a rendered step-6 preview.
  - Step gating: clicking a blocked step does nothing; completing a step unblocks the next.
  - Wording override: edit text in step 4, regenerate-staleness notice appears after changing a source field, override text is not lost until the user accepts regeneration.
  - Image export: clicking "Download image" produces a file (asserted via the browser download event, matching how existing export specs in this repo already assert file downloads).
  - Reload persistence: mid-wizard reload restores the same step/data via `loadDraft()`.
- `node scripts/check-product-governance.js` must report exactly 46 registered pages, 50 sitemap routes, 103 redirect rules.
- `npm test` (all existing + extended Node contract tests) must stay green.

## Rollback

New route + 3 new files + 2 additive schema fields (backward-compatible, default `null`). Reverting the commit(s) removes the page and its registration entries cleanly; existing localStorage drafts from before this slice still load correctly after a revert (the new fields simply never existed for them).

## Explicitly not decided here

- Riwaayat's "next design round" (second art suite, Rukhsati/Engagement coverage, non-floral suite, real-content preview fixtures) — separate, later-sequenced initiative, not part of this slice.
- Guest list/households, publication, RSVP, PDF export, guest-facing links — all remain Slice 2/3+ per the epic's own sequencing, unchanged by this slice.
- Which existing nav group the new route joins — left to the implementation plan, decided against the nav markup as it exists at build time.
