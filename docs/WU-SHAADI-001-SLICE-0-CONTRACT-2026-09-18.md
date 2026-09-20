# WU-SHAADI-001 Slice 0 — Domain Contract, Fixtures & Implementation Report

**Date:** 2026-09-18
**Parent:** `specs/WU-SHAADI-001-pakistan-wedding-invitation-platform.md`
**Slice:** 0
**Status:** Implementation branch — no production route/UI
**Branch:** `claude/pr-227-swe551`

## Decision summary

Slice 0 establishes the WeddingProject domain contract, controlled enums, deterministic wording-template shape, a representative Pakistani-wedding fixture corpus, a pure Card Studio renderer-adapter proof (Architecture Contract §16, both Node-level and real-browser), and the route/indexability decision the exit gate requires (§11), without publishing `/urdu-wedding-invitation-maker` or changing any existing user-facing surface.

WU-SHAADI-001 remains **P1.10, planned behind the current activation evidence review** per `specs/BACKLOG.md`. This report does not claim, and does not require, an implementation-release exception. Per the epic's own governance ("If implementation permission is unclear, Slice 0 only"), only pure domain/schema/fixture/test work is included here.

Existing Card Studio, Card Gallery, Ready-Made Cards and `/s/:id` public-share behavior are unaffected.

---

## 1. Changed

New files, plus three registration-only edits to shared config (no existing check's behavior changed, they only add the new spec to the set each already runs):

```text
js/wedding-project-core.js
js/wedding-wording-registry.js
js/wedding-invitation-render-adapter.js
tests/wedding-project-core.test.js
tests/wedding-invitation-render-adapter.test.js
tests/wedding-invitation-render-adapter.spec.js
tests/fixtures/wu-shaadi-001/wedding-projects.v1.json
scripts/run-contract-tests.js       (two lines added: registers the new .test.js files)
playwright.config.js                (one line added: registers the new .spec.js in testMatch)
.github/workflows/quality.yml       (one line added: runs the new .spec.js on every PR)
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

Because a browser `CanvasRenderingContext2D` does not exist in Node, the test supplies a minimal `measureText` stand-in (character-count × font-size approximation) so the exact same `wrapRtlText`/`layoutCardText`/`findBestFontSize` code Card Studio ships can run unmodified. This proves structural/integration correctness (wrap logic, fit logic, overflow handling, character preservation) but is not a substitute for a real-browser visual check of Nastaliq shaping — that follow-up is now done, see §6b.

---

## 6b. Real-browser visual proof (`tests/wedding-invitation-render-adapter.spec.js`)

A Playwright spec closes the gap §6a is explicit about: it drives the actual `/urdu-card-studio.html` page in a real Chromium instance, so real font shaping and real canvas painting are exercised, not a mocked `measureText`.

For each of the same three cultural fixtures (Urdu-only Nikah, bilingual mixed-script Baraat, English-only Walima):

- opens the current, unmodified Card Studio page and seeds it via `window.WriteUrduCardStudioApp.replaceState(seed)`, exactly the same public app API `js/card-studio-handoff-adapter.js` already uses for every other cross-tool handoff — no new integration surface was invented;
- asserts the accessible DOM mirror of the canvas text (`[data-accessible-card-text]`) equals the wording text byte-for-byte;
- asserts `text.fontMode` stayed `auto`, i.e. Card Studio's own existing font-fit logic — not this adapter — is what avoids overflow;
- asserts the page itself does not overflow (`scrollWidth`/`clientWidth`) after being seeded with wedding content;
- reads back real canvas pixel data and asserts a meaningful fraction of the frame is painted (not a blank/placeholder canvas) — proof that Nastaliq/Naskh glyphs actually rendered, which no Node-side mock can demonstrate;
- asserts text alignment followed the detected direction, matching §6a's Node-level assertion.

A fourth test exercises the actual PNG export button (`[data-card-action="download"]`) against the `portrait` preset and asserts the downloaded file is a real, non-trivial PNG (>5KB, not a blank placeholder) — closing the one honest gap §6a flagged in the "print-size export path" item: real rasterization, not just the data/layout path.

All four tests pass against the repository's pinned Chromium build. Verification:

```text
npx playwright test tests/wedding-invitation-render-adapter.spec.js
  → 4 passed
```

(Run locally in this session against the sandbox's pre-installed Chromium via a temporary, unshipped `launchOptions.executablePath` override — `playwright.config.js` itself is unchanged and still uses the repository's normal `channel: 'chrome'`, matching every other spec. The new spec file is registered in `playwright.config.js`'s `testMatch` and in `.github/workflows/quality.yml`'s "Run focused product browser acceptance" step, same as every existing Card Studio spec, so it runs on every PR going forward.)

What this still does not prove: real mobile-device performance (§6a's timing proxy remains a Node CPU measurement, not an on-device one) and a human's subjective judgment of whether the Nastaliq shaping "looks right" for a wedding invitation — the pixel-painted check here is a structural presence check, not a typographic quality review.

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

```text
npx playwright test tests/wedding-invitation-render-adapter.spec.js
  → 4 passed (real Chromium: Urdu, bilingual and English wording painted correctly on the
     live, unmodified Card Studio canvas; a real portrait-preset PNG export produced a
     non-trivial file)
```

Mobile/manual QA: not applicable — no new UI exists in this slice (the spec above seeds the *existing* Card Studio page, it does not add a page). A real on-device mobile performance profile remains open (see below).

---

## 10. Risk / remaining unknowns

- **Real-browser visual QA is now done (§6b)**, closing what was previously the top open item: `tests/wedding-invitation-render-adapter.spec.js` proves Urdu/bilingual/English wording actually paints on a real Chromium canvas through the unmodified Card Studio page, and that a real portrait-preset PNG export is non-trivial. What it does not give is a *human's* typographic judgment of the Nastaliq shaping quality — that is a design review, not a test assertion, and is naturally Slice 2 (visual template) scope.
- **The mobile preview-cost benchmark is still a Node CPU proxy, not a device measurement.** 0.095ms/call on CI hardware is reassuring (no quadratic blow-up, no synchronous network call in the hot path) but is not evidence about actual phone-class JS performance or canvas rasterization cost, which only a real device/browser profile can give. The Playwright proof in §6b confirms the pipeline works end-to-end in a real browser, but it was not run as a timed benchmark and should not be read as one.
- **Route/indexability decision is not yet recorded** — deferred until closer to Slice 1, per checklist.
- **Religious-content review is a real open task**, not a technical one: the basmala entry needs an actual human/editorial sign-off before `verified_library` mode can ever be used; the code enforces this rather than assuming it.
- The wording registry's five templates are a proof set; the full 8–12 launch-quality visual/wording library is Slice 2 scope, not Slice 0.
- The render adapter defaults every seed to the `classic-nastaliq` template and `portrait` preset because `InvitationViewModel.design` is still always `null` (design selection is Slice 2 scope); this is a deliberate, documented default, not a hidden assumption.

---

## 11. Route/indexability decision (Slice 0 exit-gate requirement)

The Implementation Checklist's Slice 0 exit gate requires this decision to be *recorded*, not acted on. Nothing below changes `check-product-governance.js`'s registered counts (still 45 pages / 49 sitemap routes / 102 redirect rules) — no route is created by this document.

- **Canonical route (Slice 1+, not yet published):** `/urdu-wedding-invitation-maker`, per the Implementation Checklist's Slice 1 "Route and shell" section and `specs/BACKLOG.md`'s P1.10 guardrail ("Preserve one product route; do not pre-create Nikah/Baraat/Walima SEO doorway makers"). There is exactly one composer route, never per-event-type doorway pages — this is a decision already made at the epic level, recorded here for the exit gate rather than re-litigated.
- **Initial indexability posture:** `noindex` during limited validation, matching the Implementation Checklist's explicit Slice 1 instruction ("Keep noindex during limited validation unless SEO ownership is explicitly approved") and the same pattern already used elsewhere in this repo for a new, unvalidated product surface. It becomes indexable only through a later, separate, explicit SEO-ownership decision — not automatically once Slice 1 ships.
- **No sitemap/public directory entry** until that same later indexability decision is made. This mirrors the architecturally-fixed rule already recorded in the Acceptance Matrix and checklist for the *recipient* link page (`noindex,follow`, no sitemap, no public directory) — that page-level rule is permanent by design (opaque per-household links must never be crawlable or listed), separate from the composer route's temporary launch-time `noindex`, which is expected to be revisited once there is real usage/query evidence.
- **Registration mechanism when the time comes:** the repository's existing canonical SEO/public-page pipeline (`npm run seo:sync-heads`, `npm run seo:graph:sync`, `npm run seo:generate`, `scripts/static-shell-registry.js`) — the same mechanism WU-BILL-001 recorded for `/urdu-bill-generator` and every other product route in this repo. Slice 0/1 does not hand-edit `sitemap.xml`, `robots.txt`, or any shell registry file to pre-stage this; those all stay exactly as `check-product-governance.js` reports them today.
- **What is explicitly not decided here:** *when* Slice 1 may ship the route at all — that remains gated by the activation roadmap review referenced in `specs/BACKLOG.md`'s P1.10 `State` line, independent of this document.

---

## 12. Rollback

Every file in this slice is additive and unreferenced by any existing page, route, or build step other than: one new line in `scripts/run-contract-tests.js`, one new entry in `playwright.config.js`'s `testMatch`, and one new line in `.github/workflows/quality.yml`'s browser-acceptance step (both purely to register the new spec file, not to change any existing check). Reverting the commit(s) removes the feature with zero impact on any shipped product surface.

---

## 13. Slice 0 exit gate

| Checklist item | Status |
|---|---|
| Schema stable enough for version 1 | Done |
| No duplicate ownership with Card Studio/share infrastructure | Done (Card Studio files unmodified; adapter references existing template/preset ids) |
| Wording fixtures render deterministically | Done |
| Route/indexability decision recorded | Done (§11) |
| Performance/privacy constraints testable | Privacy: done. Performance: Node structural proxy done (0.095ms/call) and confirmed working end-to-end in a real browser (§6b); **timed real-device measurement still open** |
| Renderer/handoff proof against Card Studio | Done — both a Node-level structural proof (§6a) and a real-browser visual/pixel/export proof (§6b) |

Slice 0 is **complete against this checklist**: the domain/schema/fixture/test foundation, the Card Studio renderer-adapter proof (Node-level and real-browser), and the route/indexability decision are all done and recorded. What remains before Slice 1 can begin is a real on-device performance measurement (nice-to-have, not gating per the checklist's own wording) and the still-outstanding human/editorial religious-content review (a real product decision, not a Slice 0 code gap). A green Slice 0 does not by itself authorize Slice 1 or any public route — that remains behind the current activation roadmap gate recorded in `specs/BACKLOG.md`.
