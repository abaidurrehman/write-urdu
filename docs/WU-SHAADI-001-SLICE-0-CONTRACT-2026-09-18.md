# WU-SHAADI-001 Slice 0 — Domain Contract, Fixtures & Implementation Report

**Date:** 2026-09-18
**Parent:** `specs/WU-SHAADI-001-pakistan-wedding-invitation-platform.md`
**Slice:** 0
**Status:** Implementation branch — no production route/UI
**Branch:** `claude/pr-227-swe551`

## Decision summary

Slice 0 establishes the WeddingProject domain contract, controlled enums, deterministic wording-template shape and a representative Pakistani-wedding fixture corpus, without publishing `/urdu-wedding-invitation-maker` or changing any existing user-facing surface.

WU-SHAADI-001 remains **P1.10, planned behind the current activation evidence review** per `specs/BACKLOG.md`. This report does not claim, and does not require, an implementation-release exception. Per the epic's own governance ("If implementation permission is unclear, Slice 0 only"), only pure domain/schema/fixture/test work is included here.

Existing Card Studio, Card Gallery, Ready-Made Cards and `/s/:id` public-share behavior are unaffected.

---

## 1. Changed

New files only — nothing existing was modified:

```text
js/wedding-project-core.js
js/wedding-wording-registry.js
tests/wedding-project-core.test.js
tests/fixtures/wu-shaadi-001/wedding-projects.v1.json
scripts/run-contract-tests.js   (one line added: registers the new test file)
```

No route, HTML page, CSS, telemetry event, or D1/R2 schema was added. No `functions/api/*` endpoint exists for this epic yet — that is explicitly Slice 4 work.

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
- No Card Studio file was touched. The Card Studio/shared-renderer adapter proof and the mobile performance benchmark that Slice 0's checklist also calls for are **not yet done** — see Remaining work below.

---

## 7. Existing product preserved

- `js/card-studio*.js`, `js/card-gallery*.js`, `js/urdu-cards*.js`, `js/curated-card-share.js`, `js/share-page.js` — untouched.
- `specs/BACKLOG.md` P1.10 entry, route table, sitemap and redirect rules — unchanged by this slice (already correct from PR #227).
- `npm test` — **all 125 contract test files pass**, including the new `tests/wedding-project-core.test.js` (24/24 fixtures).
- `node scripts/check-product-governance.js` — passes; no new public page/route/sitemap entry was registered, confirming no public route shipped.

---

## 8. Privacy

No telemetry, network call, or server endpoint exists in this slice. All code is pure/local. The fixture corpus and tests intentionally never include a real phone number, and no guest name is passed to any logging path (there is no logging path yet).

---

## 9. Verification

```text
node tests/wedding-project-core.test.js
  → Wedding project core tests passed (24 fixtures).

npm test
  → All 125 contract test files passed.

node scripts/check-product-governance.js
  → Product governance checks passed for 45 registered public pages, 49 sitemap routes, and 102 redirect rules.
```

Mobile/manual QA: not applicable — no UI exists in this slice.

---

## 10. Risk / remaining unknowns

- **Card Studio / shared-renderer adapter proof is not yet built.** Mapping one `InvitationViewModel` into the current Card Studio rendering path without copying wedding rules into Card Studio, and benchmarking mobile preview cost, remain open Slice 0 checklist items for the next iteration.
- **Route/indexability decision is not yet recorded** — deferred until closer to Slice 1, per checklist.
- **Religious-content review is a real open task**, not a technical one: the basmala entry needs an actual human/editorial sign-off before `verified_library` mode can ever be used; the code enforces this rather than assuming it.
- The wording registry's five templates are a proof set; the full 8–12 launch-quality visual/wording library is Slice 2 scope, not Slice 0.

---

## 11. Rollback

Every file in this slice is additive and unreferenced by any existing page, route, or build step other than the one new line in `scripts/run-contract-tests.js`. Reverting the commit(s) removes the feature with zero impact on any shipped product surface.

---

## 12. Slice 0 exit gate

| Checklist item | Status |
|---|---|
| Schema stable enough for version 1 | Done |
| No duplicate ownership with Card Studio/share infrastructure | Done (nothing touched) |
| Wording fixtures render deterministically | Done |
| Route/indexability decision recorded | **Open** |
| Performance/privacy constraints testable | Privacy: done. Performance: **open** (no renderer proof yet) |
| Renderer/handoff proof against Card Studio | **Open** |

Slice 0 is **partially complete**: the domain/schema/fixture/test foundation is done and green; the renderer-integration and performance-benchmark items remain for a follow-up iteration before Slice 1 may begin. A green partial Slice 0 does not by itself authorize Slice 1 or any public route — that remains behind the current activation roadmap gate.
