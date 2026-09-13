# WU-CARD-RETENTION-001 — Implementation Checklist

**Canonical parent:** `WU-CARD-RETENTION-001-card-retention-sharing-engine.md`  
**First child:** `WU-CARD-RETENTION-001A-homepage-contextual-featured-card.md`

Use this as the ordered execution contract. Do not skip to later retention experiments before Slice A is accepted.

---

## Gate 0 — Read/reconcile current code

- [ ] Read `AGENTS.md` if present and obey repo instructions.
- [ ] Read `specs/BACKLOG.md` and `specs/README.md`.
- [ ] Read `WU-CARD-RETENTION-001` parent and `001A` child in full.
- [ ] Read `WU-CARD-CONTENT-001` parent + architecture + acceptance matrix.
- [ ] Read `WU-CARD-GALLERY-001` architecture/skill where shared registry/preview behavior is relevant.
- [ ] Inspect current `index.html` rather than relying on stale placement assumptions.
- [ ] Inspect locale generation ownership for `/urdu/` homepage.
- [ ] Inspect current `/urdu-cards` share behavior.
- [ ] Inspect Card Studio visual-seed source allowlist.
- [ ] Inspect telemetry allowlists/contracts before adding event names/properties.

**Stop condition:** if current code has materially moved, update the implementation map before coding instead of forcing old filenames.

---

## Gate 1 — Protect homepage core task

- [ ] Record current homepage writer placement/activation behavior.
- [ ] Identify insertion point after writer/actions and before broad discovery/education sections.
- [ ] Confirm module will not precede core editor on mobile.
- [ ] Confirm no existing P0 mobile-editor acceptance rule is weakened.
- [ ] Add a test assertion for one module only.
- [ ] Add a test assertion that no card carousel/category controls ship in Slice A.

---

## Gate 2 — Canonical card metadata

- [ ] Reuse `WriteUrduCardsData`; no homepage-only card corpus.
- [ ] Reconcile metadata names with `WU-CARD-CONTENT-001` architecture.
- [ ] Mark a small, high-quality set `featuredEligible` (or canonical equivalent).
- [ ] Add bounded contexts for eligible cards.
- [ ] Verify every candidate resolves a background.
- [ ] Verify every candidate passes editorial/source/rights rules.
- [ ] Ensure at least two viable candidates per recurring context where practical.

---

## Gate 3 — Deterministic selector

- [ ] Implement context classification as a pure function.
- [ ] Friday local-day override.
- [ ] Morning boundary tests.
- [ ] Daytime boundary tests.
- [ ] Evening boundary tests.
- [ ] Night boundary tests.
- [ ] Same local date/context returns stable card.
- [ ] No `Math.random()` in production selection.
- [ ] Missing candidate/background returns null/fails closed.
- [ ] No geolocation/profile/account lookup.

---

## Gate 4 — Share-path reuse

- [ ] Identify working share renderer/publisher in `/urdu-cards`.
- [ ] Extract a shared helper only if needed for safe reuse.
- [ ] Do not duplicate the canvas renderer/publish request.
- [ ] `/urdu-cards` Share still returns real `/s/...` links after refactor.
- [ ] Native Web Share remains supported.
- [ ] Clipboard fallback remains supported.
- [ ] Publish failure falls back safely to canonical ready-made-card link.
- [ ] No high-resolution canvas work occurs until Share is clicked.

---

## Gate 5 — Homepage UI

- [ ] Add one semantic featured-card section.
- [ ] Add one contextual label.
- [ ] Add one card preview.
- [ ] Add exactly two primary actions: Share and Open in Card Studio.
- [ ] Add concise status/live region.
- [ ] Render Urdu as real DOM text with `lang="ur"` and `dir="rtl"`.
- [ ] Reuse safe-area/background metadata.
- [ ] No category/mood/relationship chips.
- [ ] No carousel/shuffle/favorites.
- [ ] No text/background editing controls.
- [ ] Module hides cleanly when data/assets are invalid.

---

## Gate 6 — Card Studio continuation

- [ ] Use `WriteUrduWorkspaceHandoff` visual-project-seed.
- [ ] Source workspace is stable/bounded (`home-featured-card`).
- [ ] Add explicit source to Card Studio allowlist; do not weaken validation.
- [ ] Pass text + background ID without URL text.
- [ ] Exact card text restored.
- [ ] Exact background restored.
- [ ] Destination remains editable/exportable.
- [ ] Continuation path emits approved stages only.

---

## Gate 7 — Locale/accessibility

- [ ] Follow locale generator ownership; do not edit generated pages incorrectly.
- [ ] English homepage UI copy is coherent.
- [ ] Urdu locale UI copy is coherent.
- [ ] Editorial Urdu card text is not duplicated into locale files.
- [ ] Keyboard focus visible.
- [ ] Buttons have accessible names.
- [ ] Decorative art does not duplicate screen-reader text.
- [ ] Status updates are concise and non-spammy.

---

## Gate 8 — Telemetry/privacy

- [ ] No editor/user text read for card selection.
- [ ] No card text sent in telemetry.
- [ ] No recipient/share target identity recorded.
- [ ] Use controlled card ID/context/action values only.
- [ ] Reuse continuation path where appropriate.
- [ ] Proposed custom events/properties pass telemetry allowlist tests.
- [ ] Do not bypass telemetry normalization.

---

## Gate 9 — Performance

- [ ] Homepage loads only one featured background/thumbnail.
- [ ] No full card corpus images eagerly loaded by the module.
- [ ] No Card Studio application boot for preview.
- [ ] No canvas on mount.
- [ ] No third-party social SDK.
- [ ] Writer initialization is independent of module initialization.
- [ ] Broken card image/data does not block typing.
- [ ] Mobile scroll/viewport behavior remains stable.

---

## Gate 10 — Tests

### Source/contract

- [ ] selector boundary tests;
- [ ] Friday override;
- [ ] deterministic selection;
- [ ] featured eligibility filtering;
- [ ] explicit Card Studio source allowlist;
- [ ] shared share-helper contract;
- [ ] no duplicate homepage card registry.

### Browser

- [ ] desktop ordinary day;
- [ ] mobile 360×800;
- [ ] at least one 320/390/430 regression viewport;
- [ ] Friday fixture;
- [ ] Share with Web Share unavailable;
- [ ] Open in Card Studio end-to-end handoff;
- [ ] dependency-failure fail-closed behavior;
- [ ] core writer smoke.

### Commands

Run focused suites first, then:

```bash
npm test
npm run shell:check
npm run locale:check
npm run seo:graph:check
npm run collections:check
```

Before merge, run `npm run test:all` when CI/runtime budget permits.

---

## Gate 11 — Manual QA

- [ ] Desktop Chrome/Edge current.
- [ ] Mobile emulation and at least one real-device check when available.
- [ ] Card is noticeable but writer still feels primary.
- [ ] Urdu text is readable on the actual chosen background.
- [ ] Share flow feels understandable.
- [ ] Card Studio opens with the expected exact card.
- [ ] Friday wording is respectful and source-safe.
- [ ] No engineering/debug copy leaks into public UI.

---

## Gate 12 — PR discipline

- [ ] Prefer one reviewable PR for Slice A.
- [ ] Do not bundle favorites/shuffle/category-route work.
- [ ] Include changed-file summary.
- [ ] Include exact test commands/results.
- [ ] Call out any deliberate share-helper extraction.
- [ ] Call out any telemetry schema/allowlist update.
- [ ] Call out locale-generated changes.
- [ ] Include rollback path.

---

## Later slices — do not pull forward silently

- [ ] Slice B prepared-content expansion only after A stable.
- [ ] Slice C favorites/shuffle/same-text-new-design only after evidence.
- [ ] Slice D public-share recipient continuation coordinated with share owner.
- [ ] Slice E collection SEO only after inventory/search evidence.

A successful Slice A is intentionally small: **one timely card, Share, Open in Card Studio**.