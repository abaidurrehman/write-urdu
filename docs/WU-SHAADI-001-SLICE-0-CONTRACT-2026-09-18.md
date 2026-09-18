# WU-SHAADI-001 Slice 0 — Domain Contract, Fixtures & Implementation Report

**Date:** 2026-09-18
**Parent:** `specs/WU-SHAADI-001-pakistan-wedding-invitation-platform.md`
**Slice:** 0
**Status:** Implementation branch — no production route/UI
**Branch:** `claude/pr-227-swe551`

## Decision summary

Slice 0 establishes the WeddingProject domain contract, controlled enums, deterministic wording-template shape, a representative Pakistani-wedding fixture corpus, and a pure Card Studio renderer-adapter proof (Architecture Contract §16), without publishing `/urdu-wedding-invitation-maker` or changing any existing user-facing surface.

WU-SHAADI-001 remains **P1.10, planned behind the current activation evidence review** per `specs/BACKLOG.md`. This report does not claim, and does not require, an implementation-release exception. Per the epic's own governance ("If implementation permission is unclear, Slice 0 only"), only pure domain/schema/fixture/test work is included here.

Existing Card Studio, Card Gallery, Ready-Made Cards and `/s/:id` public-share behavior are unaffected.

---

## 1. Changed

New files only — nothing existing was modified:

```text
js/wedding-project-core.js
js/wedding-wording-registry.js
js/wedding-invitation-render-adapter.js
tests/wedding-project-core.test.js
tests/wedding-invitation-render-adapter.test.js
tests/fixtures/wu-shaadi-001/wedding-projects.v1.json
scripts/run-contract-tests.js   (two lines added: registers the new test files)
```

No route, HTML page, CSS, telemetry event, or D1/R2 schema was added. No `functions/api/*` endpoint exists for this epic yet — that is explicitly Slice 4 work. `js/card-studio-core.js` and every other existing Card Studio file were read for reconnaissance but not modified.

---

## 2. Domain schema (`js/wedding-project-core.js`)

Follows the architecture contract's `WeddingProject` shape and the same UMD-module / pure-function style as `js/bill-generator-core.js` (works identically in Node and the browser, no DOM dependency).

Controlled enums implemented exactly as specified in `specs/WU-SHAADI-001-ARCHITECTURE-CONTRACT.md`:

- `EVENT_TYPES` — nikah, mehndi, mayun, dholki, baraat, rukhsati, walima, engagement, custom
- `HOST_MODES` — bride_side, groom_side, both, grandparents, custom
- `PROGRAMME_LABELS` — gathering, nikah, baraat_arrival, dinner, rukhsati, reception, custom
- `INVITATION_LANGUAGES` — urdu, english, bilingual
- `COUPLE_DISPLAY_MODES` — both_names, lineage, family_led, custom
- `GUEST_SCOPES` — individual, couple, family, custom
- `SUFFIX_STYLES` — sahib, sahiba, with_family, none, custom (default is always `none`; never inferred)
- `RELIGIOUS_OPENING_MODES` — none, verified_library, custom_user_text

Functions: `createDefaultWeddingProject`, `normalizeWeddingProject` (with per-section normalizers for couple, families, events, programme, venues, guests, religious opening), `validateWeddingProject`, `buildInvitationViewModel`, `firstStrongDirection`.

### Invariants enforced and tested

- **Wedding data is the source of truth.** `buildInvitationViewModel(project, guestId)` derives a filtered view; nothing here treats canvas/card state as canonical (no such state exists yet — that is Slice 2).
- **Empty `invitedEventIds` means incomplete, never "all events."** A guest with `invitedEventIds: []` renders zero events in their view model — verified directly in the test suite.
- **Guest-specific filtering happens before serialization**, not via UI hiding: `buildInvitationViewModel` filters `events` server-side-equivalent, at the data layer.
- **Household A / Household B event-scoped example from the epic doc (§8)** is reproduced as the `household-event-scoped-filtering` fixture and asserted directly.
- **Honorifics/suffixes are never inferred from a name.** A guest with no explicit `suffixStyle` normalizes to `'none'`, tested explicitly.
- **Unresolved references are rejected.** A guest's `invitedEventIds` and an event's `venueId` must resolve to real records in the same project, or validation fails with a specific error code.
- **Duplicate guest display names remain separate records** unless a later slice adds an explicit merge action (matches Acceptance Matrix §5).
- **Direction detection** (`firstStrongDirection`) correctly classifies Urdu text as `rtl` and Latin text as `ltr`, reusing the same character-range approach already used in `js/bill-generator-core.js`'s `directionForValue`.

---

## 3. Religious-text safety gate

The architecture contract requires verified religious text to come from "a curated, verified source library," with review status as a required field, and forbids an LLM from mutating or approving Quranic/Arabic text.

Slice 0 ships exactly **one** library entry — the standard printed Quranic *basmala* (بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ), the fixed opening formula that is identical across every reputable printed Quran and is not being generated, paraphrased or altered here. Its `reviewStatus` is set to `'pending_human_review'`.

`validateReligiousOpening` enforces that `verified_library` mode is only ever valid when the referenced entry's `reviewStatus === 'approved'`. Since nothing in this codebase can set that status, the mechanism is currently a closed gate by construction — proven by the `bismillah-opening-pending-review` fixture, which is asserted **invalid** with error `religiousOpening:unapproved_library_entry`.

**This is a deliberate, testable safety boundary, not an oversight.** A human/editorial religious-content review is a real product decision this report does not make on Write Urdu's behalf. `custom_user_text` mode (explicit user-provided text, clearly not verified by Write Urdu) is fully supported and tested as the practical path until that review happens.

---

## 4. Wording registry (`js/wedding-wording-registry.js`)

Five deterministic templates proving the wording-engine contract from `specs/WU-SHAADI-001-pakistan-wedding-invitation-platform.md` §6 and the Architecture Contract §11:

- `formal-nikah-ur` (Urdu, formal)
- `warm-mehndi-ur` (Urdu, informal)
- `traditional-baraat-bilingual` (bilingual)
- `groom-family-walima-en` (English)
- `concise-whatsapp` (any event type/language — short form)

Each template's `render(project, event)`:

- is a pure function — same input always produces the same output (asserted directly: rendering the same normalized project/event twice is checked byte-identical);
- has no network dependency;
- never invents a missing date or venue — a missing required field returns `{ complete: false, missingFields: [...] }` instead of fabricated content;
- leaves all output as plain editable text.

This is intentionally a small proof set, not the full Slice 1 template library (8–12 launch designs are explicitly Slice 2 work).

---

## 5. Fixture corpus (`tests/fixtures/wu-shaadi-001/wedding-projects.v1.json`)

24 cases, `schemaVersion: 1`, covering every item in the Implementation Checklist's "Cultural fixtures" list plus the invalid/missing-field and view-model coverage the checklist separately requires:

Cultural coverage: formal Nikah, bride-side Baraat, groom-side Walima, Mehndi, multi-event wedding, bilingual/Urdu-only/English-only invitation language, both-names/lineage/family-led couple display modes, one/two/three-timing programmes, a custom event type, and both religious-opening states (none and library-pending).

Invalid/edge coverage: missing event date + empty guest `invitedEventIds`, an unresolved guest→event reference, an unresolved event→venue reference, a missing custom-religious-text field, and duplicate guest names that must remain separate records.

---

## 6. Reuse and non-duplication

- No new storage layer was added; Slice 1 is expected to reuse the repository's existing browser-local draft conventions rather than this module inventing one (per Architecture Contract §17).
- No wording strings or enums were duplicated from `js/bill-generator-core.js`'s pattern beyond the shared *shape* of the UMD wrapper and `firstStrongDirection`-style direction detection — the two domains (billing vs. wedding) have no overlapping business data.
- No Card Studio file was touched. `js/wedding-invitation-render-adapter.js` (Architecture Contract §16) maps a normalized `InvitationViewModel` plus already-rendered wording text into the existing `js/card-studio-core.js#normalizeCardProject` project shape, referencing an existing Card Studio template id (`classic-nastaliq`) and preset id (`portrait`) rather than inventing new ones.

---

## 6a. Card Studio renderer proof (Architecture Contract §16)

`tests/wedding-invitation-render-adapter.test.js` proves the four Slice 0 "Renderer proof" checklist items against the **current, unmodified** Card Studio core:

- **Map one InvitationViewModel into the current Card Studio renderer without copying wedding rules into Card Studio.** The adapter is a pure function `buildCardStudioSeed(viewModel, wordingText, options)`. It refuses to run without a pre-rendered `wordingText` (`assert.throws(...'wordingText is required'...)`), proving it does not, and structurally cannot, generate wording itself. It carries `language`/`direction` and a `safeAreaMarginRatio` default under a `wedding` key that Card Studio's own schema has no field for, and otherwise emits only fields `normalizeCardProject` already understands (`text`, `background`, `templateId`, `presetId`). Calling it twice with identical input produces a deep-equal seed (pure function, no hidden state).
- **Validate Urdu line-height and mixed-script output.** Three fixtures are run through the real renderer path (`wrapRtlText` → `layoutCardText` → `findBestFontSize`, unmodified from `js/card-studio-core.js`): `formal-nikah` (Urdu-only, `formal-nikah-ur`), `bride-side-baraat` (Urdu+Latin mixed script in one string, `traditional-baraat-bilingual`), `groom-side-walima` (English-only, `groom-family-walima-en`). Each is asserted to fit the preset without overflow, and a character-preservation check (`reconstructFromLines`) proves the existing wrap logic does not drop or reorder characters across a mixed-script paragraph boundary. Direction is asserted per case: Urdu-first text → `rtl`/right-aligned, English-first text → `ltr`/left-aligned (`firstStrongDirection`, not an assumption baked into the adapter).
- **Validate at least one print-size export path.** All three cases are laid out against the `portrait` preset (1080×1350, the tallest/most invitation-card-like aspect ratio Card Studio currently ships) via `cardStudio.normalizeCardProject` → `cardStudio.validateCardProject` → `cardStudio.findBestFontSize`, proving the seed survives the full existing data/layout pipeline for that preset. This is the honest limit of what Slice 0 can prove: a real browser `<canvas>` (for `toDataURL`/PNG rasterization) is not available in this Node contract-test run, so pixel-level PNG/print rasterization is not exercised here — only the data and layout path a print export would consume. A literal PDF/print output path remains Slice 2/Slice 6 scope per the Implementation Checklist and is not claimed here.
- **Benchmark mobile preview cost.** The test times 200 iterations of the full realistic pipeline (`buildInvitationViewModel` → `renderWording` → `buildCardStudioSeed` → `normalizeCardProject` → `findBestFontSize`) across the three-event `multi-event-wedding` fixture (600 calls total) and logs the result: **0.095ms/call** on this CI machine, asserted to stay under a generous 25ms/call ceiling. This is a structural proxy, not a real on-device measurement — Node CPU timing on the test runner's hardware is not a mobile browser profile — but it does prove the pipeline has no hidden quadratic blow-up, synchronous network call, or per-render allocation storm that would make a mobile preview infeasible. A real device/browser measurement remains outstanding and is listed below.

Because a browser `CanvasRenderingContext2D` does not exist in Node, the test supplies a minimal `measureText` stand-in (character-count × font-size approximation) so the exact same `wrapRtlText`/`layoutCardText`/`findBestFontSize` code Card Studio ships can run unmodified. This proves structural/integration correctness (wrap logic, fit logic, overflow handling, character preservation) but is not a substitute for a real-browser/Playwright visual check of Nastaliq shaping, which remains open — see below.

---

## 7. Existing product preserved

- `js/card-studio*.js`, `js/card-gallery*.js`, `js/urdu-cards*.js`, `js/curated-card-share.js`, `js/share-page.js` — untouched (the render adapter is read-only reconnaissance plus one new, separate file).
- `specs/BACKLOG.md` P1.10 entry, route table, sitemap and redirect rules — unchanged by this slice (already correct from PR #227).
- `npm test` — **all 126 contract test files pass**, including `tests/wedding-project-core.test.js` (24/24 fixtures) and `tests/wedding-invitation-render-adapter.test.js` (renderer proof).
- `node scripts/check-product-governance.js` — passes; no new public page/route/sitemap entry was registered, confirming no public route shipped.

---

## 8. Privacy

No telemetry, network call, or server endpoint exists in this slice. All code is pure/local. The fixture corpus and tests intentionally never include a real phone number, and no guest name is passed to any logging path (there is no logging path yet).

---

## 9. Verification

```text
node tests/wedding-project-core.test.js
  → Wedding project core tests passed (24 fixtures).

node tests/wedding-invitation-render-adapter.test.js
  → WU-SHAADI-001 render-adapter preview-cost proxy: 600 calls in 56.8ms (0.095ms/call)
  → Wedding invitation render-adapter proof passed (Urdu, bilingual and English wording through the current Card Studio renderer).

npm test
  → All 126 contract test files passed.

node scripts/check-product-governance.js
  → Product governance checks passed for 45 registered public pages, 49 sitemap routes, and 102 redirect rules.
```

Mobile/manual QA: not applicable — no UI exists in this slice. The renderer proof above runs against Card Studio's core layout functions directly in Node; it is not a substitute for an on-device or Playwright-driven visual check, which remains open (see below).

---

## 10. Risk / remaining unknowns

- **No real-browser/visual QA of the renderer proof yet.** The Node-based proof in §6a exercises Card Studio's actual wrap/fit/layout functions and proves structural correctness (no dropped characters, no overflow, no hidden perf cliff), but nobody has yet looked at an actual rendered Nastaliq PNG of wedding wording in a browser. A Playwright-based visual check against `/urdu-card-studio` (not a new public wedding route — just confirming the existing studio renders a manually-seeded wedding-shaped project correctly) is the natural next step before Slice 2 design work begins.
- **The mobile preview-cost benchmark is a Node CPU proxy, not a device measurement.** 0.095ms/call on CI hardware is reassuring (no quadratic blow-up, no synchronous network call in the hot path) but is not evidence about actual phone-class JS performance or canvas rasterization cost, which only a real device/browser profile can give.
- **Route/indexability decision is not yet recorded** — deferred until closer to Slice 1, per checklist.
- **Religious-content review is a real open task**, not a technical one: the basmala entry needs an actual human/editorial sign-off before `verified_library` mode can ever be used; the code enforces this rather than assuming it.
- The wording registry's five templates are a proof set; the full 8–12 launch-quality visual/wording library is Slice 2 scope, not Slice 0.
- The render adapter defaults every seed to the `classic-nastaliq` template and `portrait` preset because `InvitationViewModel.design` is still always `null` (design selection is Slice 2 scope); this is a deliberate, documented default, not a hidden assumption.

---

## 11. Rollback

Every file in this slice is additive and unreferenced by any existing page, route, or build step other than the one new line in `scripts/run-contract-tests.js`. Reverting the commit(s) removes the feature with zero impact on any shipped product surface.

---

## 12. Slice 0 exit gate

| Checklist item | Status |
|---|---|
| Schema stable enough for version 1 | Done |
| No duplicate ownership with Card Studio/share infrastructure | Done (Card Studio files unmodified; adapter references existing template/preset ids) |
| Wording fixtures render deterministically | Done |
| Route/indexability decision recorded | **Open** |
| Performance/privacy constraints testable | Privacy: done. Performance: done as a Node structural proxy (0.095ms/call); **real-device/browser measurement open** |
| Renderer/handoff proof against Card Studio | Done as a Node-level structural proof (§6a); **real-browser/visual QA open** |

Slice 0 is **substantially complete**: the domain/schema/fixture/test foundation and the Card Studio renderer-adapter proof are both done and green, covering all four "Renderer proof" checklist items at the structural/contract-test level. What remains before Slice 1 can begin is a real-browser visual check of the renderer proof, an actual device performance measurement, the route/indexability decision, and the still-outstanding human/editorial religious-content review. A green Slice 0 does not by itself authorize Slice 1 or any public route — that remains behind the current activation roadmap gate.
