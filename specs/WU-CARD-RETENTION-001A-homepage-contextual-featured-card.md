# WU-CARD-RETENTION-001A — Homepage Contextual Featured Card

**Parent:** `WU-CARD-RETENTION-001-card-retention-sharing-engine.md`  
**Status:** Implementation-ready / founder-approved first slice  
**Priority:** P0 within the card-retention programme  
**Primary route:** `/` with generated/localized `/urdu/` parity  
**Primary outcome:** one relevant ready-made card → Share OR Open in Card Studio

---

## 1. Scope

Add one compact, contextual ready-made Urdu card to the homepage **after the core writing experience**.

The module has exactly two primary actions:

1. `Share · شیئر کریں`
2. `Open in Card Studio · کارڈ اسٹوڈیو میں کھولیں`

No other discovery controls belong in this first child.

---

## 2. Placement contract

The core homepage writer remains visually and functionally primary.

### Required placement

Insert the featured-card module:

- after the primary writer/editor and its immediate action area;
- before later homepage educational/tool-discovery sections such as the broad “More ways to write and create in Urdu” / “How it works” / tool-directory content;
- never above the H1/editor;
- never between the H1 and first usable writing control;
- never as an overlay/sticky promo over the writer.

Codex must inspect current `index.html` and generated locale conventions before editing. Do not rely on a stale line number.

### Mobile guardrail

At 320–430 CSS px, the module must not affect the current mobile editor visibility/keyboard behavior governed by `WU-PLAT-002H`.

---

## 3. Minimal UI contract

Suggested semantic structure:

```html
<section class="home-featured-card" data-home-featured-card aria-labelledby="home-featured-card-title">
  <p class="home-featured-card-context" data-home-featured-card-context></p>
  <h2 id="home-featured-card-title" class="sr-only">Featured Urdu card</h2>

  <article class="home-featured-card-preview" data-home-featured-card-preview>
    <!-- one background + overlay + real DOM Urdu text -->
  </article>

  <div class="home-featured-card-actions">
    <button data-home-featured-card-share>Share · شیئر کریں</button>
    <button data-home-featured-card-edit>Open in Card Studio · کارڈ اسٹوڈیو میں کھولیں</button>
  </div>

  <p class="home-featured-card-status" data-home-featured-card-status aria-live="polite"></p>
</section>
```

Exact markup/classes may adapt to repo conventions, but preserve the behavioral contract.

### Do not add

- category chips;
- relationship chips;
- mood chips;
- second/third cards;
- carousel arrows;
- shuffle;
- favorites;
- text editing;
- background editing;
- a “see 12 more” content wall;
- account CTA.

A small tertiary text link to `/urdu-cards` is **not part of Slice A** unless product evidence or founder direction explicitly adds it later.

---

## 4. Context labels

Use a small, human-facing Urdu label based on selected context.

Recommended initial labels:

```text
morning  → صبح بخیر
daytime  → آج کی خوبصورت بات
evening  → آج کی خوبصورت بات
night    → شب بخیر
friday   → جمعہ مبارک
```

The label is not the card text itself.

The English-locale homepage can still show the Urdu label because the asset is explicitly an Urdu social card. Supporting accessibility text may be localized through the existing locale system.

---

## 5. Selection logic

### Pure module

Prefer a standalone pure module, e.g.:

`js/home-featured-card-selector.js`

Expected API shape:

```js
contextForDate(date)
featuredCandidates(cards, context)
selectFeaturedCard(cards, date)
```

### Context rules

Default implementation:

```text
Friday local day: friday override
05:00–11:59: morning
12:00–17:59: daytime
18:00–21:59: evening
22:00–04:59: night
```

Use browser-local time.

Do not use geolocation, IP, account timezone or server profile.

### Stable selection

For the same local calendar date + context + candidate registry, return the same card.

One acceptable deterministic approach:

```text
seed = YYYYMMDD + context
index = stableHash(seed) % candidates.length
```

A simpler deterministic date ordinal modulo candidate count is also acceptable.

Do not use `Math.random()` for the production choice.

### Failure behavior

If there is no valid candidate/background:

- hide the module cleanly;
- do not throw an uncaught error;
- do not render placeholder engineering text;
- core homepage writer must continue normally.

---

## 6. Card-registry contract

Do not create a homepage-only content array.

Reuse `WriteUrduCardsData` / the canonical `WU-CARD-CONTENT-001` registry.

Slice A may add only metadata necessary to identify valid featured candidates, for example:

```js
featuredEligible: true,
contexts: ['morning', 'daytime'],
schedulePriority: 10
```

If `WU-CARD-CONTENT-001-ARCHITECTURE-CONTRACT.md` already defines equivalent fields, follow it instead of inventing parallel names.

### Candidate requirements

Candidate must:

- resolve by ID;
- resolve a valid `backgroundId` through `WriteUrduCardBackgroundRegistry`;
- contain non-empty Urdu text;
- be approved for public display;
- be safe for the requested context;
- satisfy source/rights rules where relevant.

### Initial corpus

At minimum provide enough reviewed candidates that:

- morning is not always the same card across all days;
- daytime/evening have multiple broad, non-divisive options;
- night has multiple calm options;
- Friday has multiple Jumma-safe options.

Do not block Slice A on a 150-card corpus. Start with a small excellent reviewed set and expand in Slice B.

---

## 7. Preview rendering

Reuse the visual semantics from the existing lightweight card gallery/ready-made cards.

The homepage preview should use:

- background thumbnail/asset;
- overlay metadata;
- safe-area metadata;
- real DOM Urdu text;
- existing short/medium/long preview class/tier logic where reusable.

Do **not** render a canvas merely to display the homepage card.

Canvas/high-resolution work starts only on Share.

### Text semantics

The rendered message must use:

```html
lang="ur"
dir="rtl"
```

and Nastaliq-friendly line height.

---

## 8. Shared share implementation

Current `/urdu-cards` owns working behavior for:

- building a high-resolution ready-made card image;
- publishing to `/api/shares`;
- receiving a real public link;
- invoking `navigator.share` when available;
- copying a link otherwise.

Slice A must not paste a second copy of those functions into homepage code.

### Preferred refactor

Extract a shared helper such as:

`js/curated-card-share.js`

Possible API:

```js
renderShareImage(card, background)
publishShare(card, background)
shareCard(card, background, options)
copyLink(url)
```

Both `js/urdu-cards.js` and the homepage module consume it.

### Regression rule

The existing `/urdu-cards` Share button must continue creating real `/s/...` links after extraction.

### Fallback

If `/api/shares` fails:

- preserve the existing safe fallback semantics;
- prefer a canonical `/urdu-cards#card-<id>` link rather than an unusable state;
- show concise status copy.

---

## 9. Card Studio handoff

Use `WriteUrduWorkspaceHandoff.transfer`.

Required payload:

```js
{
  sourceWorkspace: 'home-featured-card',
  sourceRoute: '/',
  targetWorkspace: 'card-studio',
  targetRoute: '/urdu-card-studio',
  actionId: 'home-featured-card-to-studio',
  kind: 'visual-project-seed',
  payload: {
    text: card.textUr,
    backgroundId: card.backgroundId
  },
  context: {
    recommendationId: 'home-featured-card-to-studio',
    pathVersion: 'home-featured-card-v1',
    releaseMarker: 'wu-card-retention-001a',
    featuredCardId: card.id,
    featuredContext: context,
    handoffRequired: true,
    restoreRequired: true
  }
}
```

Use only bounded public IDs/context values in telemetry metadata.

### Adapter change

`js/card-studio-handoff-adapter.js` currently validates visual-seed sources.

Add:

```text
home-featured-card
```

as an explicit accepted source. Do not weaken validation to accept arbitrary workspaces.

### Destination acceptance

After click:

- Card Studio opens;
- exact curated text appears;
- exact background is applied;
- user can edit/export normally;
- no text appears in URL;
- telemetry can observe destination ready/payload restored through current continuation path.

---

## 10. Homepage runtime module

Prefer an isolated runtime such as:

`js/home-featured-card.js`

Responsibilities:

- mount only on product path `/`;
- read selector + card/background registries;
- render one card;
- wire Share;
- wire Card Studio handoff;
- set bounded telemetry attributes/events;
- fail closed without affecting core writer.

Do not place business logic inside a large inline script in `index.html` if an isolated testable module fits repo conventions.

---

## 11. CSS isolation

Prefer a focused stylesheet, e.g.:

`css/home-featured-card.css`

or a clearly isolated section in `modern-home.css` if repo conventions strongly prefer that.

### Design requirements

- looks like finished social content, not a generic Bootstrap card;
- visually related to Card Studio assets;
- one readable preview;
- actions are obvious but not louder than the core writer;
- responsive down to 320px;
- no fixed heights that clip real Urdu;
- no page-level horizontal overflow;
- no sticky/floating behavior;
- no autoplay motion.

---

## 12. Locale behavior

The homepage has English and generated Urdu locale surfaces.

Codex must inspect current locale generation before editing.

Rules:

- do not hand-edit generated output if `npm run locale:generate` owns it;
- add locale keys only where the generator expects them;
- preserve the Urdu card text itself as editorial content from the card registry, not duplicated locale copy;
- localize interface/status/accessibility copy as needed;
- run `npm run locale:check`.

---

## 13. Telemetry

Use the current content-free telemetry boundary.

Prefer continuation-path tracking for the Card Studio action and bounded product events only where already supported.

Candidate bounded values:

```text
featured_card_id
featured_context
source = homepage-featured-card
action = share | open_studio
share_result = native_invoked | link_copied | fallback | failed
```

Never include:

- editor contents;
- arbitrary card text payload as telemetry;
- user-written content;
- clipboard contents;
- share target app/person.

If the telemetry allowlist does not permit a proposed event/property, update the contract/tests deliberately or omit it. Do not bypass the allowlist.

---

## 14. SEO

This is a homepage product module, not a new SEO route.

- do not change homepage canonical ownership;
- do not stuff the module with keyword copy;
- do not add hidden card text lists;
- do not create per-day/per-card SEO pages in this slice;
- no new sitemap entries;
- structured-data changes are unnecessary unless existing graph generation explicitly requires a product-surface update.

The visible featured text may change by day/time; core homepage title/H1/description remain stable.

---

## 15. Performance budget

Hard requirements:

- one featured visual only;
- no loading every card background;
- no loading Card Studio application bundle merely to preview;
- no canvas until Share click;
- no third-party runtime dependency;
- no additional network request to choose the card;
- no synchronous heavy work in the typing path;
- homepage writer initializes independently if card assets fail.

Measure/regression-check the homepage rather than assuming one image is harmless.

---

## 16. Source-level tests

Add focused Node/contract tests, e.g.:

`tests/home-featured-card-selector-contract.test.js`

Required assertions:

- Friday overrides hour bucket;
- Thursday 23:59 is not Friday;
- Friday 00:00 is Friday;
- 04:59 night;
- 05:00 morning;
- 11:59 morning;
- 12:00 daytime;
- 17:59 daytime;
- 18:00 evening;
- 21:59 evening;
- 22:00 night;
- same date/context gives same card;
- selector excludes non-featured/incompatible candidates;
- invalid background/card fails safely;
- homepage source identity is bounded;
- Card Studio source allowlist remains explicit.

---

## 17. Browser tests

Add focused Playwright coverage, e.g.:

`tests/home-featured-card.spec.js`

Required scenarios:

1. **Desktop ordinary day**
   - one module;
   - one card;
   - two primary actions;
   - card after writer;
   - no carousel/chips.

2. **Mobile 360×800**
   - writer remains primary/usable;
   - module does not precede writer;
   - no horizontal overflow;
   - buttons are comfortably tappable.

3. **Friday fixture**
   - Jumma context selected;
   - Friday-eligible card selected.

4. **Share without Web Share**
   - publish attempted;
   - successful public link copied or safe fallback exposed;
   - no uncaught error.

5. **Open in Card Studio**
   - handoff created;
   - navigation occurs;
   - destination applies text + background.

6. **Module dependency failure**
   - simulate missing candidate/background where practical;
   - module hides/fails closed;
   - writer still works.

7. **Core writer regression smoke**
   - type/transliterate flow still activates;
   - Copy/primary writer actions remain available.

---

## 18. Implementation touchpoints to inspect

Codex should inspect these before changing code:

```text
index.html
urdu/index.html (generated/derived ownership only)
css/modern-home.css
js/urdu-cards-data.js
js/urdu-cards.js
js/card-background-registry.js
js/card-gallery-core.js
js/workspace-handoff.js or current handoff owner
js/card-studio-handoff-adapter.js
js/product-telemetry.js
locale.config.js and locale generation scripts
package.json
tests/urdu-cards*.js
tests/card-gallery*.js
mobile editor activation tests
```

Do not assume filenames if the repository has changed; search current code first.

---

## 19. Ordered implementation plan

### A0 — Reconcile

- read parent + `WU-CARD-CONTENT-001` + Card Gallery architecture;
- verify current share code and handoff source allowlist;
- confirm homepage insertion point and locale ownership;
- identify existing reusable preview utilities.

### A1 — Pure selector + metadata

- add minimal featured metadata to canonical card data;
- implement deterministic selector;
- add boundary tests.

### A2 — Shared share helper

- extract only the code required to reuse the working `/urdu-cards` publish/share path;
- migrate `/urdu-cards` to the helper;
- prove existing share behavior remains green.

### A3 — Homepage module

- add one semantic module after writer;
- render one lightweight card;
- add Share + Open in Card Studio only;
- fail closed.

### A4 — Handoff

- add explicit `home-featured-card` source;
- create visual seed;
- verify destination restoration.

### A5 — Locale/accessibility/telemetry

- localized UI/status strings;
- RTL/lang semantics;
- bounded telemetry;
- keyboard focus/live status.

### A6 — Browser/performance/regression acceptance

- mobile + desktop;
- Friday fixture;
- share fallbacks;
- writer regression;
- full relevant test suite.

Do not start Slice B content expansion inside the same PR unless Slice A remains small and all acceptance is already green. Prefer one reviewable PR for A.

---

## 20. Definition of done

A normal homepage visitor can finish or use the main Urdu writer exactly as before. Immediately after that core experience, they notice one beautiful Urdu card appropriate to the current day/time. They can share it through the already-trusted share infrastructure or open that exact text/background in Card Studio. There is no carousel, no gallery, no questionnaire and no new homepage clutter.