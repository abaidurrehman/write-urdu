# WU-CARD-RETENTION-001 — Card Retention & Sharing Engine

**Status:** Planned / founder-approved 2026-09-13  
**Area:** Retention / social sharing / Card ecosystem / homepage discovery  
**Primary surfaces:** `/`, `/urdu-cards`, `/urdu-card-studio`, public share pages  
**Related:** `WU-CARD-CONTENT-001`, `WU-CARD-GALLERY-001`, `WU-SHARE-001`, `WU-JOURNEY-001C`, `WU-PLAT-002H`  
**First implementation child:** `WU-CARD-RETENTION-001A` — Homepage Contextual Featured Card

---

## 1. Product goal

Turn the already-shipped Urdu card ecosystem into a **repeatable sharing habit** without turning the homepage into a gallery or another design workspace.

The retention thesis is simple:

> Give the visitor one beautiful, contextually relevant Urdu card at the right moment, let them share it immediately, and let them open the exact same card in Card Studio if they want to personalize it.

The card ecosystem already provides the important building blocks:

- `/urdu-cards` — ready-made curated Urdu cards;
- `/urdu-card-gallery` — compare user text across many backgrounds;
- `/urdu-card-studio` — advanced editing/export;
- `/api/shares` + `/s/...` — public share-link publishing;
- shared background registry;
- workspace handoff architecture.

This epic must **connect and compound those assets** rather than inventing a fourth card editor or duplicating content/rendering systems.

---

## 2. Founder product decision: homepage restraint

The homepage remains first and foremost the English-to-Urdu writing product.

### Hard homepage rule

The homepage may show **one contextual featured card only**.

It must not become:

- a card gallery;
- a carousel;
- a category browser;
- a relationship picker;
- a mood questionnaire;
- a multi-card feed;
- a second Card Studio;
- a wall of social CTAs.

The first featured-card release exposes exactly two primary actions:

1. **Share** / `شیئر کریں`
2. **Open in Card Studio** / `کارڈ اسٹوڈیو میں کھولیں`

Everything deeper belongs on `/urdu-cards` or `/urdu-card-studio`.

### Placement rule

Do **not** place the featured card before or above the core writer/editor.

The module belongs after the primary writing experience/actions and before the later educational/tool-discovery content, so it is noticeable after first value without making mobile users scroll past promotional content to begin writing.

The implementation child owns the exact DOM placement after reconciling current `index.html` structure and generated Urdu-locale behavior.

---

## 3. Product loops

This epic coordinates four potential retention loops. Only the first is immediately implementation-approved.

### Loop A — Contextual homepage card — **P0 / first implementation**

`visit homepage → see one relevant card → share OR open exact card in Card Studio`

Examples:

- morning → `صبح بخیر` / morning prayer / gentle positive line;
- daytime → beautiful thought / hope / gratitude;
- evening → reflection / kindness / family;
- night → `شب بخیر` / peaceful prayer;
- Friday → `جمعہ مبارک` overrides ordinary time-of-day content.

### Loop B — Daily/weekly prepared-content rotation — **content expansion**

`return on another day/week → see different approved card → share`

This is a content/selection concern, not a new UI surface.

### Loop C — Ready-made card browsing — **existing owner**

`homepage/share recipient → /urdu-cards → browse → share/edit`

Owned by `WU-CARD-CONTENT-001`. This epic must not fork its registry or gallery.

### Loop D — deeper retention experiments — **evidence-gated**

Potential later work:

- favorites stored locally;
- recently used cards;
- “same words, another design”;
- “another message” shuffle;
- stronger category routes where SEO/product evidence supports them;
- Roman Urdu or English meaning as optional presentation aids;
- recipient continuation from public share pages into related ready-made cards.

These are **not** homepage Slice A requirements.

---

## 4. Ownership boundaries

### `WU-CARD-CONTENT-001` owns

- curated prepared Urdu texts;
- card definitions;
- content categories/tags;
- source/rights/attribution integrity;
- card/background pairing;
- `/urdu-cards` browsing experience;
- public-content editorial QA.

### `WU-CARD-GALLERY-001` owns

- user-text-across-backgrounds comparison;
- shared background-registry rules;
- lightweight DOM previews for many designs.

### `/urdu-card-studio` owns

- advanced editing;
- authoritative rendering/export;
- background/style changes;
- final personalized output.

### `WU-SHARE-001` owns

- public share storage/API/privacy;
- `/s/...` recipient pages;
- share infrastructure.

### `WU-CARD-RETENTION-001` owns

- deterministic contextual card selection;
- homepage featured-card discovery surface;
- cross-surface card continuation;
- bounded retention/return experiments;
- funnel measurement around those transitions.

Do not move existing responsibilities into this epic merely because they are adjacent.

---

## 5. Context-selection model

Selection must be **deterministic, browser-local and content-registry based**.

No AI, external API, profile inference or private user-text inspection is needed.

### 5.1 MVP contexts

Use a bounded enum:

```text
morning
daytime
evening
night
friday
```

Suggested local-device buckets for the first implementation:

```text
morning: 05:00–11:59
daytime: 12:00–17:59
evening: 18:00–21:59
night: 22:00–04:59
friday: local Friday override
```

Exact hours may be adjusted in implementation if current homepage usage evidence supports a better split, but they must remain explicit and tested.

### 5.2 Friday override

When the browser-local calendar day is Friday, choose from approved Friday/Jumma candidates instead of the ordinary time-of-day pool.

The first release should avoid complex sunset/Islamic-date calculations. A simple local Friday rule is understandable, testable and privacy-preserving.

### 5.3 Stable daily choice

Do not pick a random card on every reload.

For a given local calendar date + context, choose a stable item from the approved candidate list. A deterministic date/context index is preferred over local tracking.

Benefits:

- no visual jitter during reloads;
- easy QA;
- predictable screenshots/tests;
- no user identifier required;
- a real sense that “today’s card” is intentional.

### 5.4 Special occasions

Ramadan, Eid, Pakistan Independence Day and other event overrides are a later evidence/editorial slice.

They require:

- an explicit, reviewed calendar source;
- locale/audience policy;
- start/end boundaries;
- content QA;
- deterministic fallback.

Do not hard-code uncertain religious-calendar dates into the first implementation.

---

## 6. Prepared-content strategy

The current ready-made card corpus is a valid seed, not the final retention library.

Social/discovery research supports prioritizing recurring content families such as:

- dua / gentle Islamic reflection;
- Jumma messages;
- morning greetings;
- night greetings;
- short poetry / emotionally resonant lines;
- hope, patience, gratitude and self-respect;
- family and friendship;
- love/affection where appropriate.

However, **homepage default content must remain broad and low-risk**.

Preferred homepage content:

- warm prayer;
- kindness;
- gratitude;
- hope;
- morning/night wishes;
- Jumma;
- gentle family/friendship lines.

Avoid as default homepage selections:

- heartbreak;
- highly personal romance;
- intense grief;
- confrontation/“attitude” lines;
- political or divisive content;
- unattributed religious claims;
- modern copyrighted poetry without rights.

The richer emotional/mood corpus belongs primarily on `/urdu-cards`.

---

## 7. Content integrity

This epic inherits `WU-CARD-CONTENT-001` content-integrity rules.

### Religious content

- sourced Quran/Hadith must use verified source metadata;
- an original/general prayer must not be labeled Quran or Hadith;
- common social-media wording is not evidence of authenticity;
- no invented scholar/poet attribution;
- uncertain source = exclude from the featured pool.

### Poetry/literature

- use original Write Urdu copy, verified public-domain text, licensed text or permission-granted text;
- do not scrape/copy Pinterest, Instagram or Reddit wording into production;
- modern poem/song/ghazal text requires rights review.

### Homepage candidate gate

A card can be featured only if:

```text
public == true
featuredEligible == true
rights/source status passes
background resolves
mobile preview passes
share rendering passes
Card Studio handoff passes
```

---

## 8. Data-model extension

Do not create a second homepage-only card array.

Extend/reuse the existing curated card registry owned by `WU-CARD-CONTENT-001`.

The current runtime registry may evolve toward fields such as:

```js
{
  id,
  textUr,
  category,
  backgroundId,
  tags,
  mood,
  featuredEligible,
  contexts: ['morning', 'daytime'],
  schedulePriority,
  source,
  rights,
  layout
}
```

The exact schema must remain compatible with the existing architecture contract. Do not casually duplicate source/rights schema already defined by `WU-CARD-CONTENT-001`.

### Selection API

Prefer a small pure selection API, for example:

```js
getFeaturedCard({ date, hour, weekday })
getFeaturedCandidates(context)
contextForLocalDate(date)
```

The selector should be testable in Node without a browser DOM.

---

## 9. Sharing architecture

The current `/urdu-cards` implementation already renders/publishes a card and obtains a real `/s/...` share link.

The homepage must **reuse/extract this capability**, not clone its canvas/share implementation into another file.

Preferred direction:

```text
shared curated-card share helper
        ↑                   ↑
   /urdu-cards          homepage featured card
        ↓
  /api/shares → /s/<id>
```

The shared helper may own:

- high-resolution image building for a curated card;
- `/api/shares` request;
- `navigator.share` handoff;
- clipboard fallback;
- failure fallback.

The exact refactor should minimize regression risk to the already-working `/urdu-cards` share path.

### Share UX

On the homepage:

- primary button label: `Share · شیئر کریں` or localized equivalent;
- show a bounded busy state while publishing;
- use native share sheet when available;
- copy the real public link when native sharing is unavailable;
- do not expose raw technical errors;
- if publishing fails, provide a safe fallback route to the same curated card rather than losing the action.

---

## 10. Card Studio handoff

The homepage `Open in Card Studio` action must transfer the selected curated card without putting its text in the URL.

Reuse `WriteUrduWorkspaceHandoff` with a visual project seed.

Proposed contract:

```text
sourceWorkspace = home-featured-card
sourceRoute = /
targetWorkspace = card-studio
targetRoute = /urdu-card-studio
actionId = home-featured-card-to-studio
kind = visual-project-seed
payload.text = selected public card text
payload.backgroundId = selected background ID
```

The existing Card Studio handoff adapter currently validates visual-seed source workspaces. Add `home-featured-card` only as a deliberate, tested allowlist entry.

Destination requirements:

- exact Urdu text restored;
- exact background restored;
- no text query parameter;
- Card Studio remains fully editable;
- back navigation does not create a broken/stale handoff loop;
- source identity is visible only to bounded telemetry, not the user.

---

## 11. Homepage UX contract

### Required structure

The first slice should feel approximately like:

```text
[small contextual label]
[one finished card preview]
[Share] [Open in Card Studio]
[small status region when needed]
```

Examples of labels:

```text
صبح بخیر
آج کی خوبصورت بات
جمعہ مبارک
شب بخیر
```

The card itself provides the emotional value. Do not surround it with a long explanation.

### Desktop

- noticeable but subordinate to the writer;
- card preview large enough to read comfortably;
- two actions close to the card;
- avoid a giant full-bleed promotional band.

### Mobile

- one readable card;
- two obvious touch targets directly beneath it;
- no horizontal page overflow;
- no extra category/mood controls;
- module must not push first-value writing below the fold because it appears after the writer.

### Explicit non-goals for homepage

- multiple cards;
- “who is this for?” chips;
- mood chips;
- shuffle button;
- favorite button;
- category tabs;
- background picker;
- text editor;
- pagination;
- auto-advancing carousel;
- autoplay animation/video.

---

## 12. Performance

The homepage is the highest-risk place to add card visuals because it is the primary acquisition route.

Requirements:

- only one card image/thumbnail loaded for the featured module;
- no full `/urdu-cards` corpus download/render on homepage;
- no canvas work until Share is explicitly activated;
- Card Studio resources must not be loaded merely to display the preview;
- use the shared background registry/optimized thumbnail where practical;
- lazy-load only if the module is sufficiently below the initial viewport; otherwise ensure the single asset is lightweight;
- no third-party social SDK;
- no runtime generative image/content call.

A performance regression on homepage is a release blocker.

---

## 13. Accessibility

- module has a semantic heading or labelled region;
- Urdu text carries `lang="ur"` and `dir="rtl"`;
- card preview text remains actual DOM text where practical, not inaccessible text baked into a thumbnail;
- decorative background image uses empty alt text while the visible Urdu message remains readable by assistive tech;
- two actions are native buttons/links with clear accessible names;
- status messages use an appropriate live region without noisy repeated announcements;
- visible keyboard focus;
- no hover-only affordance;
- motion is not required to understand the card.

---

## 14. Privacy

The homepage featured card uses public editorial content, not private user content.

No profile, account, inferred relationship or user-written text is needed for selection.

Do not log:

- user editor contents;
- copied user text;
- private drafts;
- arbitrary strings;
- recipient identity;
- OS share target.

Allowed bounded dimensions may include:

```text
card_id
context (morning/daytime/evening/night/friday)
action (share/open_studio)
source = homepage-featured-card
share capability/result bucket
handoff stage
```

Telemetry must use the repo's approved allowlist/contracts.

---

## 15. Measurement

Primary funnel:

```text
homepage eligible
→ featured card shown
→ share selected OR Card Studio selected
→ share link created / handoff created
→ native share invoked or link copied / Card Studio destination ready
→ downstream share recipient or export outcome where already measurable
```

Primary questions:

1. Does one contextual card create meaningful engagement without hurting core writing activation?
2. Which contexts create the strongest share/open-studio rates?
3. Is Friday materially stronger than ordinary daily contexts?
4. Do homepage-card users continue into `/urdu-cards` or Card Studio successfully?
5. Does homepage Core Web Vitals / typing activation remain stable?
6. Does the card create repeat visits over 7/30 days once data is trustworthy?

### Guardrail metrics

Do not call the feature successful if card clicks rise while:

- editor first-value rate falls;
- mobile editor visibility regresses;
- homepage performance degrades materially;
- share publishing fails frequently;
- Card Studio handoff completion drops.

---

## 16. Execution slices

### Slice 0 — Registry + selector + shared share-path foundation

Deliver:

- audit existing `js/urdu-cards-data.js` against `WU-CARD-CONTENT-001` architecture;
- add/normalize only the metadata required for featured selection;
- pure context selector with deterministic date/context choice;
- approved homepage candidate fixture set;
- extract/reuse `/urdu-cards` curated-card share path if needed;
- source-level tests;
- no visible homepage UI required until foundations are regression-safe.

### Slice A — Homepage Contextual Featured Card — **implement first**

Canonical child: `WU-CARD-RETENTION-001A-homepage-contextual-featured-card.md`.

Deliver:

- one featured card after the primary writing experience;
- time/day label;
- Friday override;
- Share;
- Open in Card Studio;
- mobile/desktop responsive presentation;
- English and Urdu locale behavior;
- bounded telemetry;
- performance and regression tests.

### Slice B — Prepared content expansion

Owned jointly with `WU-CARD-CONTENT-001`; do not fork the corpus.

Deliver only after first card module is stable:

- stronger recurring-content pool;
- balanced morning/day/night/Jumma candidates;
- original Write Urdu lines and verified/source-safe content;
- editorial QA matrix;
- stable daily rotation without random reload behavior.

### Slice C — `/urdu-cards` retention improvements

Evidence-gated examples:

- “another message”;
- “same message, another design”;
- local favorites/recent cards;
- better recurring categories;
- optional Roman Urdu/meaning presentation.

Do not surface these controls on homepage by default.

### Slice D — Recipient continuation

Coordinate with `WU-SHARE-001R` / public share pages.

Potential flow:

`recipient opens /s/... → sees related ready-made cards / create own → becomes creator`

Must not crowd the recipient's primary shared content.

### Slice E — SEO/category expansion

Only after inventory and search evidence support it.

Potential strong collection pages may include Jumma, morning greetings, dua or poetry, but avoid thin doorway pages and near-duplicate keyword routes.

---

## 17. Test strategy

### Pure/unit/contract

- context classification at all boundary hours;
- Friday override;
- deterministic same-day selection;
- next-day variation where candidate count permits;
- only `featuredEligible` cards returned;
- missing/invalid background safely rejected;
- source/rights gate respected;
- no private/user text dependency;
- visual-seed source allowlist includes only intended sources.

### Browser

At minimum:

- homepage desktop card visible after writing area;
- homepage mobile card visible without covering/preceding writer;
- only one featured card rendered;
- exactly two primary card actions;
- Share creates/uses a real link with fallback behavior;
- Open in Card Studio restores text/background;
- Friday fixture chooses Jumma card;
- time fixtures choose expected context;
- keyboard navigation/focus works;
- no page-level horizontal overflow at 320/360/390/430 widths;
- no console error when Web Share is unavailable;
- homepage writer typing/copy/export still work.

### Regression

Run at least:

```bash
npm test
npm run shell:check
npm run locale:check
npm run seo:graph:check
npm run collections:check
```

Run focused Playwright coverage for homepage, Urdu Cards, Card Studio handoff/share and mobile editor activation. Before merge, run `npm run test:all` when CI/runtime budget permits.

---

## 18. Rollout and rollback

The feature must be removable without destabilizing the core writer.

Implementation should isolate:

- featured-card selector;
- featured-card module JS;
- featured-card CSS;
- shared curated-card share helper changes;
- handoff allowlist change.

Rollback can therefore disable/remove the homepage module while leaving `/urdu-cards`, `/urdu-card-gallery`, `/urdu-card-studio` and public share pages intact.

Do not couple homepage writer initialization to card-module success.

---

## 19. Acceptance gates

The epic's first production milestone is accepted only when:

- [ ] Homepage core writer remains the first primary task.
- [ ] Exactly one contextual card is shown; no carousel/gallery/category clutter exists on homepage.
- [ ] The card is chosen from the canonical curated-card registry.
- [ ] Friday correctly overrides ordinary time-of-day selection.
- [ ] Same local date/context yields a stable card.
- [ ] Share uses the existing/shared public-share path rather than duplicated publishing logic.
- [ ] Open in Card Studio restores the exact selected text/background without text in URL.
- [ ] Card Studio handoff source validation is explicit and tested.
- [ ] Homepage mobile editor visibility/keyboard behavior is regression-free.
- [ ] No private editor text is read for selection or sent through telemetry.
- [ ] Religious/attributed content passes existing content-integrity rules.
- [ ] Homepage performance remains within current product budgets.
- [ ] English and Urdu locale output is valid.
- [ ] The module can be rolled back independently.

---

## 20. Non-goals

- redesigning the homepage writer;
- moving the card above the writer;
- showing many cards on homepage;
- user profiling or relationship inference;
- AI-generated quote selection at runtime;
- account requirement;
- social feed/comments/likes;
- third-party social SDK integration;
- copying social-media text into production;
- replacing Card Studio;
- replacing `/urdu-cards`;
- duplicating the share renderer;
- creating dozens of SEO category routes before evidence.

---

## 21. Product definition of done

A person comes to Write Urdu primarily to write. After receiving first value, they also encounter one beautiful, timely Urdu card that feels immediately relevant to the day or time. They can share it with one action or open that exact card in Card Studio with another. The experience is noticeable but restrained, works especially well on mobile, uses the existing trusted card/share architecture, creates a natural reason to return, and never turns the homepage into another gallery.