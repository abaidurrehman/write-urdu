# WU-CARD-CONTENT-001 — Codex Handoff

Repository:

`https://github.com/abaidurrehman/write-urdu/`

Feature:

**Ready-made Urdu Cards Gallery**

Proposed route:

`/urdu-cards`

Read these files first, in order:

1. `specs/BACKLOG.md`
2. `specs/README.md`
3. `specs/WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md`
4. `specs/WU-CARD-CONTENT-001-ARCHITECTURE-CONTRACT.md`
5. `specs/WU-CARD-CONTENT-001-ACCEPTANCE-MATRIX.md`
6. `specs/WU-CARD-GALLERY-001-live-urdu-card-gallery.md`
7. `specs/WU-CARD-GALLERY-001-ARCHITECTURE-CONTRACT.md`
8. current Card Studio background/library/render/handoff files
9. current tests around Card Studio, sharing, SEO, telemetry and PWA caching
10. `package.json`

Do not trust stale filenames over current runtime code. Search the repository before implementation.

---

# Mission

Build the foundation and, when roadmap permission is present, the public product for a **rich ready-made Urdu card gallery**.

This is a content-first experience:

> browse beautiful meaningful cards → pick one → share/download immediately → optionally edit it

It is distinct from:

- `/urdu-card-studio` — advanced/custom editing;
- `/urdu-card-gallery` — user writes text once and compares it across backgrounds;
- `/urdu-cards` — prewritten curated Urdu content already paired with beautiful backgrounds.

The new surface should feel like a beautiful Urdu social-content destination, not a settings-heavy template directory.

---

# Core product promise

Every public gallery item must be:

- beautiful;
- meaningful;
- readable on a phone;
- editable;
- downloadable;
- shareable through the native share sheet where supported;
- trustworthy in source and attribution;
- safe to hand off to Card Studio;
- high-quality for the **recipient**, not only the creator.

---

# Roadmap discipline

The parent epic is founder-approved as a specification/product direction.

However, current repo governance may still gate a new public Card acquisition route behind `WU-PLAT-002H` Card completion evidence.

Therefore:

1. inspect the canonical backlog before coding;
2. if `/urdu-cards` public implementation is explicitly permitted, continue through the public-route slices;
3. if public rollout is still gated, execute only the isolated foundation work that the epic permits:
   - schema;
   - shared registry reconciliation;
   - source/rights validation;
   - content corpus fixtures;
   - pure adapters;
   - tests;
   - implementation map;
4. do not silently treat this prompt as a backlog exception.

Do not redesign Basic Writer, Rich Editor, homepage first-value UI or unrelated tools.

---

# First task: audit current architecture

Before changing files, report:

- latest `main` SHA;
- current background registry/location;
- whether `WU-CARD-GALLERY-001` has already extracted a shared background registry;
- current Card Studio renderer/export path;
- current Card Studio handoff path;
- current native share/public share architecture;
- current PWA/service-worker caching constraints;
- existing Card Studio completion/telemetry events;
- any open PR that overlaps this work.

Then create a feature branch from current `main`.

Suggested branch:

`feat/ready-made-urdu-cards-gallery`

Do not implement on a stale branch.

---

# Architecture requirements

## 1. One authoritative background registry

Do not duplicate the Card Studio background array.

If a shared background registry already exists, consume it.

If not, perform the smallest safe extraction coordinated with `WU-CARD-GALLERY-001`.

Every ready-made card references a `backgroundId`.

## 2. One curated-card registry

Create a reviewable/versioned registry for ready-made card definitions.

Suggested conceptual shape:

```js
{
  schemaVersion: 1,
  id: 'deep-hope-001',
  status: 'approved',
  textUr: '...',
  category: 'deep',
  subcategory: 'hope',
  backgroundId: '...',
  tags: ['hope'],
  mood: ['calm'],
  textLength: 'short',
  featured: false,
  source: {
    type: 'original',
    attribution: null,
    reference: null,
    originalLanguage: 'ur',
    translationProvenance: 'Write Urdu editorial',
    verified: true,
    verificationNote: 'original editorial copy'
  },
  rights: {
    status: 'original',
    note: 'Write Urdu original'
  },
  layout: {
    alignment: 'center',
    safeAreaOverride: null,
    fontScale: 1,
    lineHeight: 1.7,
    sourcePlacement: 'bottom'
  }
}
```

Use repository conventions if a different module format is more appropriate.

## 3. Lightweight gallery previews

Do NOT create one canvas per gallery card.

Browse previews should be DOM composition:

- background thumbnail/image;
- overlay;
- real Urdu DOM text;
- optional source line;
- actions.

High-resolution rendering is user-triggered only.

## 4. Reuse authoritative render/export behavior

Download/share should use the existing Card Studio renderer or the smallest shared rendering core extracted from it.

Do not implement a visually divergent second renderer.

## 5. Safe local handoff

`Edit` should open Card Studio with:

- text;
- background;
- layout/style defaults;
- source-edit state.

Do not put user text in query strings or URL hashes.

---

# Content families

The launch corpus should be curated across several distinct families.

Do not let one category dominate.

Recommended families:

1. Faith / Dua / Reflection
2. Pakistan / Folk / Cultural Pride
3. Poetry / Literature
4. Love / Romance
5. Deep Thoughts / Motivation
6. Greetings / Celebrations
7. Family / Friendship

Initial public launch target can be approximately **36–48 approved cards**, but quality outranks count.

If only 24 cards clear all source/rights/visual gates, ship 24 rather than adding filler.

---

# Content sourcing rules — mandatory

This is not just a UI implementation. The corpus is editorial content and must be treated as such.

## Religious content

### Hadith

Do not use wording just because it is common on social media.

For every Hadith card:

- verify the source;
- store a useful reference;
- record Urdu translation provenance;
- do not fabricate authenticity grading;
- hold the item if verification is incomplete.

### Quran

If Quranic content is used:

- verify verse reference;
- verify Arabic text if displayed;
- verify Urdu translation provenance and rights;
- do not label a paraphrase as Quranic translation.

### Dua

Distinguish:

- sourced prophetic dua;
- original/general prayer.

Do not label editorial prayer text as Hadith/Quran.

## Poetry / ghazal / nazm

Do not assume famous text is free to republish.

Every literary card needs a rights state:

- `original`;
- `public-domain-verified`;
- `licensed`;
- `permission-granted`;
- `hold-rights-unclear`.

Anything `hold-rights-unclear` must be excluded from public output.

Do not use modern copyrighted poetry or song lyrics merely because they are well known.

Prefer:

- public-domain text after verification;
- licensed/permissioned text;
- original Write Urdu lines.

## Quotes

Verify attribution.

Never invent an attribution to a famous poet, scholar or public figure.

If wording is useful but attribution is uncertain, either:

- exclude it; or
- treat it as an unattributed/general saying if rights/context permit.

---

# Content evidence ledger

Create a dated evidence file for the initial corpus if implementation reaches corpus-building stage.

Suggested:

`docs/WU-CARD-CONTENT-001-CORPUS-EVIDENCE-2026-09-13.md`

For each sourced card, record:

- card ID;
- category;
- text source/reference;
- rights basis;
- translation provenance;
- verification date;
- review note;
- any caveat.

Do not reproduce large copyrighted passages in the evidence ledger.

---

# Editable-source integrity — mandatory

A source attribution must never authenticate wording the user changed.

Implement explicit pristine/edited state.

Conceptual state:

```js
{
  curatedCardId,
  originalTextUr,
  currentTextUr,
  isEdited,
  sourceAppliesToOriginalOnly
}
```

For a sourced pristine card:

- source may render normally.

When user materially edits it:

- mark edited;
- explain that the source applies to original wording;
- do not export the edited wording with misleading exact-source attribution.

Suggested user copy:

`You changed the original wording. The source applies to the original text.`

Urdu translation should be natural and reviewed.

If the user restores the exact original text, pristine source state may return.

Original greeting/motivational cards do not need unnecessary warnings.

---

# Visual pairing requirements

Ready-made cards are curated compositions.

Do NOT automatically generate:

`all texts × all backgrounds`

Choose intentional pairings.

Examples of direction:

- Islamic/classic/nature → faith/reflection;
- Ajrak/truck art/heritage → Pakistan/folk/patriotic;
- ink wash/moonlit/old Lahore → poetry/literature;
- maroon/floral/moonlit → love/romance;
- modern/minimal/nature/black-gold → deep thoughts/motivation;
- wedding/floral/pastel → celebrations.

These are guides, not hard mappings.

A pairing must be rejected if it harms readability or feels emotionally inappropriate.

---

# Four hard visual acceptance rules

Every card must pass all four.

## 1. Clear text-safe region

The text must sit in a calm region of the artwork.

No important decoration, faces, birds, lanterns, flowers, architecture or high-contrast lines directly behind critical Urdu strokes.

## 2. Strong Urdu contrast

Text must be quickly readable on a normal phone.

Use:

- light/ivory text on dark art;
- dark ink/navy/maroon on light art;
- bounded overlay when necessary.

Reject weak contrast.

## 3. Good layout for its actual text length

The corpus should include micro/short/medium/long designs.

Do not force long text onto a small safe area by shrinking it to unreadable type.

## 4. Receiver-facing quality

Review the actual exported/shared image.

Ask:

`Would somebody receiving this card think it is beautiful enough to save or reshare?`

If not, refine/reject it.

---

# Gallery UX

The page should feel rich and visual, closer to a curated social gallery than a form.

Initial page structure:

1. concise title/subtitle;
2. compact filter chips;
3. featured/strong cards quickly visible;
4. responsive card grid;
5. card inspection/preview;
6. clear actions.

Suggested filters:

- All
- Faith
- Pakistan
- Poetry
- Love
- Deep
- Greetings
- Family

Seasonal filters can be added later.

Primary actions should remain restrained:

- Share
- Edit
- Download (or make Download secondary)
- Copy text can be secondary/detail-only

Do not add a full formatting toolbar to this page.

That belongs to Card Studio.

---

# Mobile requirements

Design mobile-first.

At minimum test:

- 320px width;
- 360×800;
- 375×667;
- 390×844;
- 412×915.

Requirements:

- no page horizontal overflow;
- filter chips usable;
- grid cards large enough to judge;
- Urdu preview readable;
- tap actions comfortable;
- no hover-only functionality;
- inspect/preview flow easy to exit;
- share/download action available without navigating through an editor.

---

# Local download

Preferred flow:

```text
curated card
→ normalize to Card Studio-compatible state
→ authoritative renderer
→ image Blob/File
→ local download
```

Downloaded output must preserve:

- text;
- background;
- layout;
- source policy;
- current user edit.

Do not require a server upload.

---

# Native share / WhatsApp usability

The product should be easy to share into WhatsApp, but implement this honestly.

Preferred flow:

```text
local render
→ File
→ navigator.canShare / navigator.share when supported
→ OS share sheet
→ user chooses WhatsApp or another app
```

Fallback:

- Download.

Do not claim direct official WhatsApp integration.

Do not upload private edits merely to make sharing work.

---

# Privacy

The curated corpus is public.

User edits are private unless the user explicitly publishes them through another flow.

Never emit to analytics:

- edited text;
- copied text;
- card state payload;
- generated image bytes.

Allowed bounded public-content telemetry can include:

- curated card ID;
- category ID;
- background ID;
- action (`view`, `share_attempt`, `download`, `edit_handoff`);
- route/device bucket according to existing telemetry rules.

Use current telemetry infrastructure.

Do not create another analytics service.

---

# SEO

Initial canonical owner:

`/urdu-cards`

Do not create hundreds/thousands of individual SEO pages.

Do not create indexable tag pages automatically.

Public route copy should clearly distinguish:

- Ready-made Urdu Cards — browse finished cards;
- Card Gallery — type your own text and compare designs;
- Card Studio — edit/build advanced cards.

When public rollout is approved, update current required registries such as:

- `seo.config.js`;
- sitemap;
- public page registry;
- human sitemap;
- llms.txt;
- shared shell/internal links;
- changelog;

but only according to current repository governance.

---

# Accessibility

Requirements:

- meaningful Urdu remains DOM text in browse view;
- `lang="ur" dir="rtl"` where needed;
- semantic buttons/links;
- visible focus;
- keyboard-operable filters/actions;
- source details accessible;
- no color-only state;
- backgrounds treated as decorative when text is already exposed separately.

---

# Security

Render registry/user text through `textContent` or equivalent safe APIs.

Never use card text as `innerHTML`.

Test with literal markup-like content:

`<svg onload=alert(1)>اردو</svg>`

It must display as text and never execute.

---

# Performance

Hard rules:

- no canvas per gallery tile;
- lazy load offscreen art;
- high-res rendering is on demand;
- do not pre-cache an unbounded rich-media corpus;
- keep filtering local and fast for initial corpus;
- avoid backend/CMS for first source-controlled corpus.

If 36–48 tiles are too heavy on mobile, render in bounded batches or otherwise reduce initial image cost while preserving usability/accessibility.

---

# Testing

Add focused tests before public rollout.

At minimum cover:

1. curated card IDs unique;
2. only approved cards public;
3. background references valid;
4. category values valid;
5. `hold-rights-unclear` cannot be public;
6. Hadith/Quran requirements enforced;
7. source-required content has metadata;
8. edited sourced text invalidates exact-source export attribution;
9. restore-original behavior;
10. safe text rendering;
11. local filter behavior;
12. Card Studio handoff preserves text/background/edit-state;
13. user text absent from URL;
14. user sentinel text absent from analytics/network telemetry;
15. native-share fallback;
16. service-worker contracts if touched;
17. existing Card Studio/Card Gallery tests remain green.

Use the acceptance matrix as the source of detailed cases.

Run current equivalents of:

```bash
npm test
npm run seo:check
npm run governance:check
npm run shell:check
npm run seo:graph:check
npm run test:browser
```

Prefer the repo full test command when practical.

Do not weaken unrelated assertions.

---

# Manual launch QA

Create a per-card QA matrix before public release:

```text
Card ID
Category
Background
Source type
Rights state
Source verified?
Text length class
Mobile preview
Export
Share
Receiver quality
Notes
```

Failed cards should be held individually.

Do not delay an otherwise good gallery merely to meet an arbitrary card count, but do not ship unverified content to fill visual gaps.

---

# Implementation sequence

## Slice 0 — Foundation

Implement first even if public route remains gated.

Deliver:

- current architecture audit;
- shared background registry reconciliation;
- curated card schema;
- validation core;
- source/rights enums;
- initial fixture/candidate corpus;
- evidence ledger;
- Card Studio state adapter design/tests;
- attribution-edit tests;
- no public route if backlog does not permit it.

## Slice 1 — Gallery

When allowed:

- `/urdu-cards`;
- responsive gallery;
- filters;
- DOM previews;
- detail/inspection UX;
- lazy loading;
- accessibility.

## Slice 2 — Download/share

- high-res local render;
- download;
- Web Share file support;
- graceful fallback;
- receiver-quality QA.

## Slice 3 — Edit handoff

- Card Studio handoff;
- current text/background preserved;
- source/edit provenance preserved;
- no user text in URL.

## Slice 4 — Public launch

- SEO/public registries;
- internal linking;
- telemetry;
- changelog;
- production smoke tests;
- backlog state update.

## Slice 5 — Editorial expansion

Only after usage exists:

- seasonal packs;
- more cards;
- featured ordering;
- retirement process;
- evidence-based category routes.

---

# PR discipline

Use bounded PRs.

Recommended split:

### PR A — foundation

- shared registry reconciliation;
- curated schema/validator;
- fixtures/corpus evidence;
- pure adapters/tests;
- no public route if gated.

### PR B — gallery route

- route/UI/filtering/previews;
- accessibility/performance;
- only if backlog permits.

### PR C — share/download/edit/public release

Can be further split if risk grows.

Do not merge automatically unless explicitly instructed.

---

# PR report format

For every implementation PR report:

1. Slice executed.
2. Roadmap state/permission.
3. User job enabled.
4. Files changed.
5. Existing background IDs removed? Expected: `No`.
6. Existing Card Studio behavior changed? Explain precisely.
7. Corpus count by category.
8. Source/rights status summary.
9. Religious/literary content held or excluded and why.
10. Performance behavior.
11. Privacy/telemetry behavior.
12. Mobile QA.
13. Download/share QA.
14. Receiver-quality QA.
15. Tests/commands/results.
16. Remaining manual/legal/editorial gates.
17. Rollback path.

---

# Stop conditions

Stop and report instead of improvising if:

- the work requires copying the background registry into a second authoritative list;
- current Card Studio rendering cannot be reused without risky broad refactor;
- public rollout is still blocked by canonical backlog governance;
- a Hadith/Quran source cannot be verified;
- a poem/ghazal/nazm has unclear rights;
- edit behavior would misattribute changed religious/literary wording;
- native sharing would require uploading private edits;
- user text would enter a URL or telemetry payload;
- service-worker changes break current cache contracts;
- mobile gallery becomes materially heavy/unresponsive;
- existing Card Studio/Card Gallery tests regress.

---

# Definition of success

Do not optimize for “number of cards shipped.”

Optimize for this experience:

> A user opens Write Urdu, immediately sees beautiful Urdu cards worth sharing, finds one that fits the moment, sends it through their preferred app in a few taps, and the recipient receives something polished enough to appreciate, save or reshare.

That is the product.