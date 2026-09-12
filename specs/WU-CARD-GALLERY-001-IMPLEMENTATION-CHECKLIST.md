# WU-CARD-GALLERY-001 — Implementation Checklist

**Parent:** `WU-CARD-GALLERY-001-live-urdu-card-gallery.md`  
**Architecture:** `WU-CARD-GALLERY-001-ARCHITECTURE-CONTRACT.md`  
**Acceptance:** `WU-CARD-GALLERY-001-ACCEPTANCE-MATRIX.md`

## Roadmap rule

Planning and isolated foundation work may proceed. Public production rollout must still respect the active `WU-PLAT-002H` Card Studio completion gate unless the canonical backlog records an explicit exception.

Do not interpret this checklist as permission to bypass that gate.

---

## Slice 0 — Current-state audit + shared registry foundation

### Audit

- [ ] Pull/rebase latest `main`.
- [ ] Inventory all currently live Card Studio background IDs, labels, categories, assets and defaults.
- [ ] Inspect `js/card-studio-background-library.js`.
- [ ] Inspect `js/card-studio-handoff-adapter.js` and `js/card-studio-entry.js`.
- [ ] Inspect Card Studio route guards/shared social maker relationships.
- [ ] Inspect Card Studio export/rendering/storage tests.
- [ ] Inspect current telemetry allowlists/event conventions.
- [ ] Inspect current SEO/source-of-truth registration for new routes.
- [ ] Inspect service-worker cache-generation contracts before touching PWA files.

### Registry contract

- [ ] Define one shared background registry module.
- [ ] Preserve every currently shipped background ID.
- [ ] Move existing background data without changing behavior.
- [ ] Add metadata fields only where useful: `thumbnailSrc`, `safeArea`, `textCapacity`, `preferredAlign`, `goodFor`.
- [ ] Define controlled enums/tags.
- [ ] Add pure lookup/filter helpers.
- [ ] Add tests proving IDs are unique and old IDs remain present.
- [ ] Add tests proving categories/background lookup are deterministic.

### Fixture set

Create test fixtures for:

- [ ] short Urdu phrase (1–2 lines);
- [ ] medium Urdu text (3–4 lines);
- [ ] long Urdu text (6–8 lines);
- [ ] mixed Urdu + Latin + numbers;
- [ ] explicit newlines;
- [ ] empty/whitespace-only input;
- [ ] long unbroken token/URL-like content resilience.

### Performance baseline

- [ ] Record current background asset count/weight.
- [ ] Define preview update target on desktop and mid-range mobile.
- [ ] Define acceptable initial asset loading behavior.
- [ ] Confirm no canvas-per-preview design is necessary.

### Slice 0 exit gate

Do not continue until:

- current Card Studio tests are green;
- shared registry behavior is equivalent;
- no existing background disappeared;
- no social/Name Art route accidentally loads Gallery UI;
- handoff architecture is understood;
- public route status is explicitly recorded as gated/noindex until approved.

---

## Slice 1 — Gallery MVP route

**Requires roadmap permission for production route exposure.**

### Files

Reconcile names with current repository conventions, likely:

```text
urdu-card-gallery.html
css/card-gallery.css
js/card-gallery-core.js
js/card-gallery.js
```

### Page structure

- [ ] Add one clear page title/H1.
- [ ] Add concise bilingual instruction.
- [ ] Add large, mobile-friendly Urdu text input.
- [ ] Reuse existing input-mode components only if they stay visually subordinate.
- [ ] Render gallery previews immediately from shared registry.
- [ ] Add category chips from registry data.
- [ ] Use lightweight DOM previews, not export canvases.
- [ ] Lazy-load images.
- [ ] Use real DOM Urdu text with `lang="ur" dir="rtl"`.

### Live updates

- [ ] Render each preview shell once.
- [ ] Keep one shared text state.
- [ ] Batch input refresh using `requestAnimationFrame` or measured equivalent.
- [ ] Update text nodes/classes without rebuilding the gallery.
- [ ] Never refetch background assets per keystroke.
- [ ] Apply safe-area insets from registry.
- [ ] Apply background defaults for overlay/text colour.
- [ ] Classify empty/short/medium/long using pure logic.

### Empty state

- [ ] Show representative placeholder copy only if it is clearly a preview example.
- [ ] Do not make placeholder text look like user content.
- [ ] First typing action replaces example content immediately.

### Suitability

- [ ] Poor-fit long-text backgrounds do not clip silently.
- [ ] Optionally demote/rank poor-fit cards.
- [ ] If using a warning, keep wording concise (`Better for shorter text`).

---

## Slice 2 — Card Studio handoff

- [ ] Add `Use this design` button to each card.
- [ ] Reuse current handoff/storage conventions.
- [ ] Never put user text in URL/query/hash.
- [ ] Transfer text + background ID + optional preset/source only.
- [ ] Resolve background from shared registry on Card Studio side.
- [ ] Apply background defaults through existing Card Studio path.
- [ ] Preserve editable text.
- [ ] Preserve normal Card Studio undo/history/export behavior.
- [ ] Add graceful fallback if background ID is missing/invalid.
- [ ] Add return/back continuity only if it does not complicate state or privacy.

### Funnel telemetry

After validating current governance:

- [ ] gallery visit;
- [ ] first input;
- [ ] previews visible;
- [ ] category used;
- [ ] design selected;
- [ ] handoff started;
- [ ] Card Studio destination ready;
- [ ] existing Card Studio export attempt/complete used for downstream outcome.

Only bounded categorical properties; no content.

---

## Slice 3 — Intent chips + deterministic ranking

Do not add until Slice 1/2 behavior is stable.

Potential intent chips:

```text
Poetry
Dua
Quote
Greeting
Wedding
Social
```

- [ ] Chips change ordering/filtering only; they do not rewrite text.
- [ ] Use registry `goodFor` metadata.
- [ ] Long text ranks `textCapacity: long` backgrounds higher.
- [ ] Short text may rank more expressive designs higher.
- [ ] Keep `All` available.
- [ ] No server/AI semantic analysis required.
- [ ] Track only bounded intent IDs if telemetry is approved.

---

## Slice 4 — Direct export experiment

Evidence-gated.

- [ ] First confirm Gallery → Card Studio export completion is healthy.
- [ ] Decide whether direct download materially removes friction.
- [ ] Reuse authoritative Card Studio renderer if technically safe.
- [ ] Do not create a divergent renderer with different text fitting.
- [ ] Test PNG quality and social receiver appearance.
- [ ] Add native file share only through capability detection.
- [ ] Keep download fallback.
- [ ] Never upload card content to make sharing work.

---

## Slice 5 — Public discovery / SEO release

- [ ] Review query ownership versus `/urdu-card-studio`.
- [ ] Decide index/noindex from actual product/search evidence.
- [ ] Create unique title/H1/description if indexable.
- [ ] Add canonical extensionless route.
- [ ] Update SEO config/shared graph as required.
- [ ] Add sitemap only when indexable/public policy is approved.
- [ ] Add human sitemap/llms/public registry only when appropriate.
- [ ] Add navigation/internal links conservatively.
- [ ] Update changelog.
- [ ] Capture release marker and post-launch funnel.

---

## UX acceptance before merge

At minimum validate:

```text
360x800
375x667
390x844
412x915
768x1024
desktop wide
```

For each mobile viewport:

- [ ] input is unmistakable;
- [ ] first previews are visible without excessive preamble;
- [ ] no page-level horizontal overflow;
- [ ] filter chips work by touch;
- [ ] card selection target is large enough;
- [ ] software keyboard does not cause forced-scroll loops;
- [ ] typing remains responsive;
- [ ] Urdu preview is readable at gallery size.

---

## Visual quality QA

For every background currently exposed in Gallery:

- [ ] short fixture looks intentional;
- [ ] medium fixture fits safe zone;
- [ ] long fixture either fits or is clearly marked/ranked as unsuitable;
- [ ] text contrast is strong;
- [ ] background focal objects do not collide with main text;
- [ ] preview crop matches expected Card Studio crop closely enough;
- [ ] selected/exported result remains receiver-quality.

Do not accept a background merely because the code can render it.

---

## Accessibility QA

- [ ] semantic form label;
- [ ] keyboard-reachable filters/buttons;
- [ ] visible focus;
- [ ] selected filter conveyed programmatically;
- [ ] background art decorative where appropriate;
- [ ] user text stays actual text in preview;
- [ ] English and Urdu labels are correct;
- [ ] no hover-only required action;
- [ ] reduced motion preserves behavior.

---

## Privacy QA

Use a sentinel Urdu string and inspect network/analytics payloads.

- [ ] sentinel never leaves through analytics;
- [ ] sentinel not placed in URL;
- [ ] handoff remains local/session based;
- [ ] no screenshot/card bytes leave browser;
- [ ] background selection telemetry uses controlled ID only;
- [ ] text length uses bucket only.

---

## Regression QA

Must remain green:

- [ ] Card Studio apply/background behavior;
- [ ] Card Studio export;
- [ ] Card Studio persistence/history;
- [ ] social makers;
- [ ] Name Art;
- [ ] Basic/Rich Writer core flows;
- [ ] Voice/transliteration engines if reused;
- [ ] static SEO/governance tests;
- [ ] PWA/service-worker contracts.

Do not weaken established tests to permit the new feature.

---

## Expected repository commands

Inspect `package.json` first. At minimum prefer the repository equivalents of:

```bash
npm test
npm run seo:check
npm run governance:check
npm run shell:check
npm run seo:graph:check
npm run test:browser
```

Prefer `npm run test:all` when available and practical.

---

## Agent completion report

Every implementation PR should report:

1. Slice executed.
2. Roadmap permission/gate state.
3. User job now possible.
4. Exact files changed.
5. Existing background IDs preserved.
6. Preview architecture (confirm no canvas-per-card).
7. Mobile/performance evidence.
8. Short/medium/long Urdu results.
9. Privacy/telemetry evidence.
10. Card Studio handoff evidence.
11. SEO/indexability state.
12. Tests and results.
13. Remaining manual/release gates.
14. Rollback path.
