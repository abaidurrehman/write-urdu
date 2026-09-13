# WU-CARD-RETENTION-001 — Codex Handoff

Repository:

`https://github.com/abaidurrehman/write-urdu/`

Branch to start from:

`main`

Feature:

`WU-CARD-RETENTION-001 — Card Retention & Sharing Engine`

First implementation target:

`WU-CARD-RETENTION-001A — Homepage Contextual Featured Card`

---

## Read first, in order

1. `AGENTS.md` if present.
2. `specs/BACKLOG.md`
3. `specs/README.md`
4. `specs/WU-CARD-RETENTION-001-card-retention-sharing-engine.md`
5. `specs/WU-CARD-RETENTION-001A-homepage-contextual-featured-card.md`
6. `specs/WU-CARD-RETENTION-001-IMPLEMENTATION-CHECKLIST.md`
7. `specs/WU-CARD-RETENTION-001-ACCEPTANCE-MATRIX.md`
8. `specs/WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md`
9. `specs/WU-CARD-CONTENT-001-ARCHITECTURE-CONTRACT.md`
10. `specs/WU-CARD-CONTENT-001-ACCEPTANCE-MATRIX.md`
11. `specs/WU-CARD-GALLERY-001-live-urdu-card-gallery.md`
12. current implementation files/tests listed below.

Canonical execution skill:

`skills/wu-card-retention-001/SKILL.md`

---

## Founder decision that must not be diluted

The homepage gets **one contextual card only**.

The visible first release is intentionally narrow:

```text
context label
one beautiful card
Share
Open in Card Studio
```

Do not add:

- multiple cards;
- carousel;
- category chips;
- relationship chips;
- mood chips;
- favorites;
- shuffle;
- editing controls;
- a large “browse more” section;
- account prompts.

The writer remains the homepage's primary job. The card is a post-value discovery/retention hook.

---

## Current implementation facts to verify before coding

At the time this handoff was written:

- `/urdu-cards` is live and uses `js/urdu-cards-data.js` as its curated-card data source.
- `js/urdu-cards.js` can build a card image, publish it to `/api/shares`, receive a real public share URL, invoke native Web Share, and fall back to copying a link.
- `/urdu-cards` transfers text + background to Card Studio using `WriteUrduWorkspaceHandoff` with `kind: 'visual-project-seed'`.
- `js/card-studio-handoff-adapter.js` explicitly accepts visual seed sources `card-gallery` and `urdu-cards`.
- `js/card-background-registry.js` is the shared background owner.
- the homepage writer is in `index.html`, while `/urdu/` is generated/managed through locale tooling.

These facts are **starting evidence, not permission to skip repository inspection**. Search current main before editing.

---

## Implementation objective

Ship one compact homepage module after the primary writer experience that:

1. selects one approved ready-made card using browser-local day/time;
2. uses Friday as a Jumma override;
3. keeps the chosen card stable for the date/context;
4. renders the card using the existing background/safe-area metadata;
5. shares through the same trusted publish/share path as `/urdu-cards`;
6. opens the exact same text/background in Card Studio through the existing workspace handoff;
7. fails closed without affecting the writer.

---

## Expected code direction

Do not treat these filenames as mandatory if current architecture has moved, but prefer this separation:

```text
js/home-featured-card-selector.js   # pure date/context/candidate selection
js/home-featured-card.js            # homepage mount/render/actions
js/curated-card-share.js            # optional extracted shared helper used by urdu-cards + homepage
css/home-featured-card.css          # isolated module presentation
```

Likely existing files to update:

```text
index.html
js/urdu-cards-data.js
js/urdu-cards.js
js/card-studio-handoff-adapter.js
locale source/config files as required
product telemetry allowlist only if needed
```

Likely tests:

```text
tests/home-featured-card-selector-contract.test.js
tests/home-featured-card.spec.js
existing urdu-cards share tests
existing Card Studio handoff tests
existing mobile editor activation tests
```

---

## Strict architecture rules

### 1. One canonical content registry

Do not create:

`js/home-featured-card-data.js`

with a duplicate list of Urdu messages.

Add the minimum featured/context metadata to the canonical ready-made card registry, following `WU-CARD-CONTENT-001` schema rules.

### 2. Reuse share infrastructure

Do not copy `buildCardShareImage` / `/api/shares` / Web Share / clipboard logic into homepage code.

Extract a small shared helper if necessary and migrate `/urdu-cards` to it in the same PR so there remains one share implementation.

### 3. Explicit handoff source

Add `home-featured-card` to the Card Studio visual-seed allowlist.

Do not replace the allowlist with “accept any source”.

### 4. Browser-local deterministic selection

No geolocation. No server clock. No account profile. No AI.

Friday local day overrides ordinary buckets.

No `Math.random()` for the visible production choice.

### 5. Writer independence

The card module must not be a dependency of transliteration/editor initialization.

If card data, art or share helper fails, the writer still works.

---

## Suggested execution sequence

### Step 1 — reconnaissance

- inspect current `main`;
- map current writer end → discovery-content start;
- map locale generation;
- map `/urdu-cards` share tests;
- map Card Studio visual-seed flow;
- map telemetry allowlist.

Write down any divergence from this handoff before coding.

### Step 2 — selector tests first

Create pure failing tests for:

```text
Friday override
05:00/12:00/18:00/22:00 boundaries
same-day deterministic selection
featured-context filtering
invalid candidate handling
```

Implement only enough selector/data metadata to make them pass.

### Step 3 — share helper extraction

If reuse requires extraction:

- move current working curated-card image/publish/share primitives to one shared module;
- update `/urdu-cards` to call it;
- run its focused tests before touching homepage UI.

If a current shared helper already exists on main, use it and do not create another.

### Step 4 — homepage module

Add one module after writer/actions.

Render:

```text
context label
one DOM card preview
Share
Open in Card Studio
status region
```

Nothing else.

### Step 5 — Card Studio handoff

- explicit `home-featured-card` source;
- visual-project-seed;
- text/background ID;
- destination restoration test.

### Step 6 — locale/a11y/privacy

- locale generator parity;
- Urdu RTL/lang semantics;
- button focus;
- bounded status messages;
- no user content telemetry.

### Step 7 — regression acceptance

Run focused tests, then the repository checks required by the skill/checklist.

---

## Example handoff payload

Use the current workspace-handoff API, but the semantic contract should remain equivalent to:

```js
WriteUrduWorkspaceHandoff.transfer({
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
});
```

Do not put `textUr` in the URL.

---

## Product copy guidance

Keep the module copy sparse.

Context labels:

```text
صبح بخیر
آج کی خوبصورت بات
شب بخیر
جمعہ مبارک
```

Actions:

```text
Share · شیئر کریں
Open in Card Studio · کارڈ اسٹوڈیو میں کھولیں
```

Avoid a long paragraph explaining Card Studio or retention intent.

---

## Tests/commands

Use targeted tests during development. Before handoff, run at least:

```bash
npm test
npm run shell:check
npm run locale:check
npm run seo:graph:check
npm run collections:check
```

Run focused Playwright for:

- homepage featured card;
- `/urdu-cards` Share regression;
- Card Studio visual-seed handoff;
- mobile editor activation.

Before merge, run:

```bash
npm run test:all
```

when environment/runtime budget permits. If an unrelated main-branch failure exists, reproduce it on clean main and document it rather than weakening tests.

---

## PR report format

Return:

1. **What changed** — concise file/behavior summary.
2. **What deliberately did not change** — no homepage gallery/carousel/etc.
3. **Share reuse** — explain how duplication was avoided.
4. **Handoff** — show source → destination contract.
5. **Tests** — exact commands/results.
6. **Manual QA** — desktop/mobile/Friday/share/Card Studio.
7. **Telemetry/privacy** — confirm no private text.
8. **Risks/rollback** — how homepage module can be removed independently.

Do not mark done because the module merely renders. Done means Share works, Card Studio restores the exact card, writer regressions are absent, and the homepage remains restrained.