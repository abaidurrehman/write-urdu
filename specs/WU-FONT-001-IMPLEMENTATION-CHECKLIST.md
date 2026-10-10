# WU-FONT-001 — Implementation Checklist

**Parent:** `WU-FONT-001-urdu-typography-font-discovery-platform.md`  
**Architecture:** `WU-FONT-001-ARCHITECTURE-CONTRACT.md`  
**Acceptance:** `WU-FONT-001-ACCEPTANCE-MATRIX.md`

## Roadmap rule

This package authorizes planning and isolated foundation work. A new indexed `/urdu-fonts` route remains gated until acceptance and explicit roadmap/indexing approval. Do not interpret the existence of this checklist as permission to bypass active product priorities.

## Slice 0 — audit + licensing + benchmark

- [ ] Search repository for every Urdu/Arabic `font-family`, Google Fonts import, TinyMCE `font_formats`, `@font-face`, canvas font assignment and documentation list.
- [ ] Produce current runtime inventory by surface: Basic Writer, Rich Editor, Keyboard, Card Studio, Name Art, Cards/Gallery, share previews and relevant tools.
- [ ] Reconcile `Qadreeregular` documentation/runtime inconsistency.
- [ ] Record existing Google/service font URLs and weights.
- [ ] Record current Card Studio font-load/export behavior and regression tests.
- [ ] Capture canonical Urdu shaping fixtures.
- [ ] Build license evidence table from original/authoritative font sources.
- [ ] Mark each candidate `approved-web`, `approved-system-reference`, `license-review`, or `rejected`.
- [ ] Do not add any new font binary during audit unless license evidence is complete.
- [ ] Benchmark page bytes and font requests for current Card Studio, Name Art and Rich Editor.
- [ ] Define first-load comparison-page font budget from evidence.
- [ ] Add source tests for candidate registry schema/fixtures.

**Exit:** font inventory + license evidence + baseline numbers + registry schema are reviewable; no unsupported licensing assumptions remain hidden.

## Slice 1 — shared registry foundation

- [ ] Add shared `js/urdu-font-registry.js` or repository-conventional equivalent.
- [ ] Give every current web font a stable ID.
- [ ] Preserve existing family names.
- [ ] Add legacy family → ID normalization.
- [ ] Add bounded metadata enums and validation.
- [ ] Add capability filters for Card Studio, Name Art, Rich Editor and preview.
- [ ] Add deduplicated font loader.
- [ ] Add explicit load-success/failure result.
- [ ] Ensure self-hosted asset URL is impossible for `license-review` records.
- [ ] Add unit tests for registry and loader.

**Exit:** one source of truth exists without visible product regression.

## Slice 1B — existing creation-tool convergence

- [ ] Populate Card Studio font options from registry.
- [ ] Preserve old saved Card Studio projects.
- [ ] Strict-load selected font before text measurement/export.
- [ ] Populate Name Art options from registry.
- [ ] Create TinyMCE adapter for governed Urdu families.
- [ ] Preserve existing general Latin/system editor fonts.
- [ ] Ensure editor iframe loads selected approved web font.
- [ ] Remove/repair stale font documentation only after runtime is reconciled.
- [ ] Keep templates/background/export behavior unchanged.

**Exit:** Card Studio, Name Art and Rich Editor no longer carry divergent handwritten Urdu font lists.

## Slice 1C — first approved Pakistani font expansion

Candidate priority after evidence:

1. Mehr Nastaliq Web
2. Nafees Nastaleeq and/or Awami Nastaliq where authoritative licensing/shaping evidence is stronger
3. other candidates only after the same gate

For each approved font:

- [ ] preserve authoritative source/license evidence;
- [ ] convert/package as WOFF2 only if license allows;
- [ ] preserve shaping tables;
- [ ] add real Urdu visual fixtures;
- [ ] test browser DOM rendering;
- [ ] test Card Studio/Name Art canvas where capability is enabled;
- [ ] test exported PNG;
- [ ] test line-height/overflow on mobile;
- [ ] record font byte cost;
- [ ] add attribution where required.

Do **not** add Jameel Noori/AA Sameer/AlQalam/Gandhara binaries while they remain in license review.

## Slice 2 — `/urdu-fonts` preview MVP

- [ ] Add route initially `noindex` and unpromoted unless roadmap exception already recorded.
- [ ] One obvious Urdu text input above fold.
- [ ] Load useful Urdu example.
- [ ] Reuse existing Roman Urdu input only if low-clutter and shared implementation.
- [ ] Render preview cards as DOM text.
- [ ] Show font name and category.
- [ ] Show Web Font vs This Device availability.
- [ ] Never fake unavailable system fonts with fallback samples labelled as the requested font.
- [ ] Add font-size control.
- [ ] Add short/medium/long example controls.
- [ ] Add category filters: Nastaliq, Naskh, Decorative (only if enough valid records exist).
- [ ] Lazy-load lower preview groups.
- [ ] Keep user's text local.
- [ ] Add accessible selected/unavailable states.
- [ ] Add mobile layout acceptance.

**Exit:** user can truthfully compare their own text without needing a creation tool first.

## Slice 3 — handoffs

- [ ] Define versioned `urdu-fonts` local handoff payload.
- [ ] `Use in Card Studio` preserves text + font.
- [ ] `Create Name Art` preserves text + font.
- [ ] `Continue in Rich Editor` preserves text + font when the destination supports it.
- [ ] Destination validates registry ID/capability.
- [ ] No private text in URL/hash.
- [ ] No private text in telemetry.
- [ ] Add content-free funnel events only through telemetry allowlist.
- [ ] Test stale/unknown font ID.
- [ ] Test system-only unsupported handoff.

**Exit:** font discovery becomes creation continuity, not a dead-end utility.

## Slice 4 — focused comparison + guidance

- [ ] Allow 2–4 selected fonts side by side.
- [ ] Add bounded `recommendedFor` tags.
- [ ] Add deterministic guidance for poetry, reading, cards, headings and documents.
- [ ] Explain web-safe vs system-only succinctly.
- [ ] Link to existing Nastaliq-vs-Naskh guide for deeper education.
- [ ] Do not introduce AI recommendation.
- [ ] Do not create font × background combinatorial gallery yet.

## Slice 5 — SEO/public release

- [ ] Re-check query ownership against `/urdu-fonts-nastaliq-vs-naskh` and `/stylish-urdu-text-generator`.
- [ ] Give `/urdu-fonts` a distinct interactive-intent title/description.
- [ ] Add WebApplication/schema consistent with real behavior.
- [ ] Add canonical/hreflang as repository locale policy requires.
- [ ] Add public page registry entry.
- [ ] Add sitemap only when index approval is recorded.
- [ ] Add contextual links from font guide, Card Studio, Name Art and Editor features.
- [ ] Add navigation only if IA review says it deserves persistent placement.
- [ ] Run crawlability/source tests.
- [ ] Verify no thin individual font pages were generated.

## Slice 6 — evidence-gated expansion

- [ ] Review top search/query behavior after release.
- [ ] Add fonts only where licensing + user demand + visual differentiation justify cost.
- [ ] Consider individual font guides only with unique evidence and official source links.
- [ ] Consider `chosen font → card backgrounds` experiment only after handoff usage proves demand.
- [ ] Consider official-source download links only as secondary actions.

## Regression checklist for every slice

- [ ] Basic Writer first value unaffected.
- [ ] Global site does not download full font library.
- [ ] Card Studio saved projects still open.
- [ ] Card Studio default font unchanged unless separately approved.
- [ ] Name Art default behavior unchanged unless separately approved.
- [ ] Rich Editor loads and edits normally.
- [ ] Roman/direct/Voice input engines are not forked.
- [ ] Urdu locale generation/shell sync contracts remain valid.
- [ ] sitemap/public registry stay consistent with index state.
- [ ] privacy copy matches actual font host/data behavior.
- [ ] no content values enter analytics.

## Release blocker checklist

Do not index/promote if any answer is `no`:

- [ ] Are visible font previews truthful?
- [ ] Are all shipped binaries license-approved from authoritative evidence?
- [ ] Does export use the selected font where promised?
- [ ] Does the page remain usable on mobile?
- [ ] Does the route own distinct intent from the existing guide?
- [ ] Does the first interaction avoid loading the entire font catalog?
- [ ] Are system-only fonts labelled accurately?
- [ ] Are handoffs private and validated?
