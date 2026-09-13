# WU-CARD-RETENTION-001 — Card Retention & Sharing Engine

Use this skill whenever implementing, reviewing or continuing `WU-CARD-RETENTION-001` or its first child `WU-CARD-RETENTION-001A`.

This skill is intentionally strict because the work touches the highest-value homepage, an already-working share flow, Card Studio handoff, mobile activation and public editorial content.

---

## Mission

Implement the smallest credible retention hook:

> after the user reaches the core homepage writing experience, show one timely ready-made Urdu card with exactly two primary actions: Share and Open in Card Studio.

Do not turn this into a homepage redesign or card-gallery expansion.

---

## Mandatory read order

Read these files in full before coding:

```text
AGENTS.md                         # if present
specs/BACKLOG.md
specs/README.md
specs/WU-CARD-RETENTION-001-card-retention-sharing-engine.md
specs/WU-CARD-RETENTION-001A-homepage-contextual-featured-card.md
specs/WU-CARD-RETENTION-001-IMPLEMENTATION-CHECKLIST.md
specs/WU-CARD-RETENTION-001-ACCEPTANCE-MATRIX.md
docs/WU-CARD-RETENTION-001-CODEX-HANDOFF.md
specs/WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md
specs/WU-CARD-CONTENT-001-ARCHITECTURE-CONTRACT.md
specs/WU-CARD-CONTENT-001-ACCEPTANCE-MATRIX.md
specs/WU-CARD-GALLERY-001-live-urdu-card-gallery.md
```

Then search current repository code for the actual implementation owners. Do not trust a filename solely because it appears in the handoff.

---

## Non-negotiable founder constraints

### Homepage

The homepage first release contains:

```text
one contextual label
one featured card
Share
Open in Card Studio
```

Nothing more.

Do not add:

- a carousel;
- multiple cards;
- category/mood/relationship chips;
- favorites;
- shuffle;
- background controls;
- text controls;
- account CTA;
- a new card feed;
- an above-editor promo.

The writer remains the primary homepage job.

### Placement

Place the card after the primary writing experience/actions and before broad education/tool discovery.

Never make a mobile user scroll past the featured card to reach the writer.

---

## Architecture invariants

### Reuse canonical card data

Use the existing ready-made card registry owned by `WU-CARD-CONTENT-001`.

Never create a second homepage-only Urdu message registry.

### Reuse background registry

Every featured background must resolve through the existing shared card background registry.

Never copy background records into homepage JS.

### Reuse share path

The working `/urdu-cards` share flow is the source of truth.

If homepage needs the same behavior, extract one shared helper and migrate both callers to it.

Never maintain two independent implementations of:

- curated card share-image rendering;
- `/api/shares` publishing;
- native share invocation;
- clipboard fallback.

### Reuse workspace handoff

Use `WriteUrduWorkspaceHandoff` with a `visual-project-seed`.

Source workspace must be explicitly accepted by Card Studio. Add only the intended source (`home-featured-card`) to the allowlist.

Never weaken source validation globally.

### No text in URLs

Do not place the Urdu card text in query strings or hashes as the Card Studio transport mechanism.

### Fail closed

If featured-card code fails, the homepage writer must continue normally.

---

## Context-selection rules

Use browser-local date/time only.

Default buckets:

```text
Friday local day → friday override
05:00–11:59 → morning
12:00–17:59 → daytime
18:00–21:59 → evening
22:00–04:59 → night
```

Selection must be stable for the same local date/context.

Do not use:

- `Math.random()` for production selection;
- geolocation;
- IP lookup;
- account profile;
- AI inference;
- user editor contents.

Inject/provide `Date` to pure selector code so time boundaries are easy to test.

---

## Editorial safety

Featured content must be broader/safer than the full card gallery.

Good default candidates:

- morning wishes;
- night wishes;
- general dua;
- Jumma;
- gratitude;
- hope;
- kindness;
- gentle family/friendship lines.

Do not feature by default:

- heartbreak;
- confrontational attitude text;
- intense grief;
- political content;
- highly intimate romance;
- unverified religious claims;
- unattributed “famous” quotes;
- modern copyrighted poetry without rights.

Inherit all `WU-CARD-CONTENT-001` source/rights rules.

---

## Test-first requirements

Before UI work, add or identify tests for:

```text
Friday override
04:59 / 05:00
11:59 / 12:00
17:59 / 18:00
21:59 / 22:00
same-day deterministic result
featured/context eligibility
invalid background failure
```

Before changing Card Studio handoff, add/assert explicit source validation.

Before extracting share code, identify existing `/urdu-cards` tests and preserve them.

---

## Implementation discipline

Work in this order:

1. reconnaissance;
2. selector + canonical metadata;
3. share-path reuse/extraction;
4. homepage module;
5. Card Studio handoff;
6. locale/a11y/telemetry;
7. browser/mobile/performance regressions;
8. full test/PR report.

Do not implement later retention ideas merely because they are attractive.

---

## Likely current implementation map

Search first, but expect to inspect:

```text
index.html
css/modern-home.css
js/urdu-cards-data.js
js/urdu-cards.js
js/card-background-registry.js
js/card-gallery-core.js
js/card-studio-handoff-adapter.js
js/product-telemetry.js
workspace handoff owner
locale.config.js
scripts/generate-urdu-locale.js
package.json
existing card/home/mobile tests
```

Potential new isolated modules:

```text
js/home-featured-card-selector.js
js/home-featured-card.js
js/curated-card-share.js       # only if a shared helper does not already exist
css/home-featured-card.css
```

Avoid a giant inline homepage implementation.

---

## Performance rules

Homepage performance is a release gate.

- load one featured visual only;
- do not eagerly load all ready-made cards/backgrounds;
- do not instantiate canvas at mount;
- do not boot Card Studio to render preview;
- no third-party social SDK;
- no runtime AI/generation call;
- keep writer init independent;
- use existing thumbnail/safe-area metadata.

---

## Privacy/telemetry rules

Never log:

- homepage editor contents;
- private user text;
- clipboard content;
- recipient identity;
- share target app/person;
- arbitrary strings.

Allowed dimensions are controlled identifiers/categories such as:

```text
featured card ID
context
source = homepage-featured-card
action = share/open_studio
bounded share result
continuation stage
```

Use existing telemetry normalization/allowlists. Do not bypass them.

---

## Locale rules

Respect generated locale ownership.

Run:

```bash
npm run locale:check
```

If locale generation owns `/urdu/index.html`, change the source/config and regenerate rather than manually drifting generated output.

Card editorial text belongs to the canonical card registry, not locale strings.

---

## Required acceptance commands

Run focused tests throughout. Before completion, run at least:

```bash
npm test
npm run shell:check
npm run locale:check
npm run seo:graph:check
npm run collections:check
```

Run focused Playwright for:

```text
homepage featured card
/urdu-cards share regression
Card Studio visual-project-seed restoration
mobile editor activation
```

Run `npm run test:all` before merge when feasible.

Never delete/weaken a regression test just to make the slice green. If main is already failing, reproduce the same failure from clean main and report it.

---

## Completion report

When handing work back, provide:

### Changed

Exact files and behavior.

### Preserved

Confirm explicitly:

- core writer still primary;
- only one homepage card;
- exactly two primary card actions;
- `/urdu-cards` still works;
- Card Studio still works;
- no private text telemetry.

### Verification

Exact test commands/results plus desktop/mobile/Friday/share/manual QA.

### Risk

Any known edge case or dependency.

### Rollback

How to remove/disable homepage featured-card behavior without touching core writer or existing card routes.

---

## Definition of success

The implementation is not successful because a pretty card appears.

It is successful when the current writer remains stable, one appropriate card is easy to notice after first value, Share uses the real existing public-share architecture, Open in Card Studio restores the exact card, Friday/time selection is deterministic, mobile remains clean, and no extra homepage complexity slips into the slice.