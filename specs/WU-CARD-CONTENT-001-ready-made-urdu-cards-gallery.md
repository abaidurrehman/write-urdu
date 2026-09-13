# WU-CARD-CONTENT-001 — Ready-made Urdu Cards Gallery

**Status:** Planned / founder-approved 2026-09-13  
**Area:** Social creation / shareable Urdu content / Card Studio ecosystem  
**Primary proposed route:** `/urdu-cards`  
**Related:** `WU-CARD-GALLERY-001`, `/urdu-card-studio`, `WU-SHARE-001`, `WU-JOURNEY-001C`, `WU-PLAT-002H`  
**Core promise:** Beautiful, meaningful Urdu cards that are ready to share immediately and still fully editable.

---

## 1. Product goal

Build a rich, curated gallery of **ready-made Urdu cards** that combine:

- high-quality Write Urdu backgrounds;
- meaningful pre-written Urdu content;
- intentional background/content pairing;
- local download/share capability;
- one-tap editing in Card Studio;
- trustworthy attribution and source handling.

The user should not have to begin with a blank canvas.

The primary journey is:

> browse → feel → choose → share

with optional personalization:

> browse → choose → edit → share

This is intentionally different from the two neighbouring creation surfaces:

| Surface | Primary job |
| --- | --- |
| `/urdu-card-studio` | Build/refine a card from scratch or with advanced controls |
| `/urdu-card-gallery` | Write your own text once and compare it across many backgrounds |
| `/urdu-cards` | Browse finished, meaningful, ready-made Urdu cards and share/edit the one you like |

The new gallery is **content-first**, not editor-first and not background-comparison-first.

---

## 2. Product hypothesis

Many social users do not arrive wanting to design. They arrive wanting to **find something beautiful and meaningful to share quickly**.

The gallery should therefore optimize for:

1. immediate visual/emotional value;
2. minimal effort before the first useful result;
3. easy mobile browsing;
4. receiver-facing beauty after sharing;
5. trustworthy text and attribution;
6. personalization without forcing a complex editor.

Success is not measured by how many card controls are exposed. Success is measured by whether a user can quickly find a card worth sending to another person.

---

## 3. Experience principles

### 3.1 The card is the product

Every gallery tile should look like a finished social asset, not a template placeholder.

Each item combines:

- a background;
- an Urdu text payload;
- typography defaults;
- layout/safe-area guidance;
- optional source/attribution treatment;
- category and mood metadata.

The visual pairing must be curated. Do not randomly combine every text with every background.

### 3.2 Receiver-first quality

The gallery must be judged from the perspective of the **person receiving the image** on WhatsApp, Facebook, Instagram or another app.

Ask for every card:

> Would this still look beautiful, legible and intentional when it arrives on somebody else's phone?

### 3.3 Browse before configure

The gallery should not open with a long form or formatting panel.

The first useful viewport should contain:

- concise gallery identity;
- compact category/filter controls;
- beautiful ready-made cards.

Editing is secondary.

### 3.4 Editing must remain available

Every share-ready card should also be a starting point.

A user can:

- edit the Urdu text;
- change background/style in Card Studio;
- reuse the design with different text;
- download/share the current version.

### 3.5 No fake abundance

Do not ship hundreds of mediocre cards to make the gallery look large.

A smaller set of strongly curated cards is better than repetitive visual/content filler.

---

## 4. Launch collection structure

The first public collection should feel rich enough to browse but remain editorially controlled.

Recommended first launch target: **36–48 cards**, subject to source/rights/visual QA.

The initial content families should be:

### 4.1 Faith, Dua & Reflection

Examples of appropriate content types:

- verified Hadith excerpts;
- authentic duas;
- Quranic reminders where text/translation rights and wording are verified;
- sabr, shukr, tawakkul and kindness reminders;
- Jumma / Ramadan / Eid messages where appropriate.

Preferred visual families:

- Islamic/classic backgrounds;
- restrained lantern/crescent compositions;
- elegant dark or ivory designs;
- peaceful nature.

### 4.2 Pakistan, Folk & Cultural Pride

Examples:

- patriotic lines;
- culturally resonant short sayings;
- Urdu-language pride;
- watan / homeland themes;
- folk-style original copy;
- public-domain literary lines where rights and attribution are verified.

Preferred visual families:

- Ajrak;
- truck art;
- Pakistani heritage;
- green/white or folk palettes.

### 4.3 Poetry & Literature

Examples:

- public-domain classical poetry;
- licensed literary text;
- original Write Urdu poetry/lines;
- ghazal / nazm excerpts only where rights permit;
- reflective one- or two-sher cards.

Preferred visual families:

- moonlit;
- ink wash;
- old Lahore / literary paper;
- nature;
- maroon / refined floral where appropriate.

### 4.4 Love & Romance

Examples:

- original romantic lines;
- public-domain poetry with verified attribution;
- wedding/nikkah-adjacent affection where context fits;
- emotionally warm short Urdu copy.

Preferred visual families:

- maroon;
- rose/floral;
- moonlit;
- luxury dark;
- modern soft gradients.

### 4.5 Deep Thoughts & Motivation

Examples:

- hope;
- patience;
- self-respect;
- kindness;
- healing;
- solitude;
- courage;
- gratitude;
- life reflection.

Preferred visual families:

- modern;
- minimal;
- nature;
- black/gold;
- paper/ink.

### 4.6 Greetings & Celebrations

Examples:

- congratulations;
- birthday;
- new baby;
- wedding wishes;
- engagement;
- good morning / good night;
- Friday greetings;
- condolences with appropriate tone;
- seasonal greetings.

Preferred visual families vary by occasion.

### 4.7 Family & Friendship

Examples:

- parents;
- siblings;
- friendship;
- gratitude to loved ones;
- warm family messages.

---

## 5. Content integrity contract

This product creates a new editorial responsibility because the site is presenting text as ready to share.

### 5.1 Religious content

Religious content requires the highest verification bar.

For Hadith:

- store a source reference;
- store collection/book/number where available and verified;
- store the language/translation provenance;
- do not publish a card merely because wording is common on social media;
- do not fabricate grading or attribution;
- keep uncertain text out of the public collection.

For Quranic content:

- verify Arabic wording if displayed;
- verify Urdu translation rights/provenance before publishing a translation;
- do not silently paraphrase a verse and label it Quran;
- preserve verse reference when the text is exact and verified.

For duas:

- distinguish sourced prophetic duas from general prayers written by the product/editorial team;
- do not label an original prayer as Hadith/Quran.

### 5.2 Poetry and literature

Do not assume “famous” means free to reuse.

Every literary card must have a rights status such as:

- `original`;
- `public-domain-verified`;
- `licensed`;
- `permission-granted`;
- `hold-rights-unclear`.

`hold-rights-unclear` content must never render in the public gallery.

Modern copyrighted poetry, song lyrics and recent ghazal/nazm text must not ship without permission/licensing.

### 5.3 Quotes and attributions

- verify named attribution before publishing;
- if attribution cannot be verified, either exclude it or label it as a general saying without falsely naming a person;
- do not generate fictional attributions;
- do not assign anonymous internet copy to a famous poet/personality.

### 5.4 Original content

Original Write Urdu editorial lines are encouraged for:

- motivation;
- romance;
- family;
- greetings;
- folk-inspired content;
- social status lines.

Original copy avoids rights uncertainty and can become a distinctive product asset.

---

## 6. Editable-source integrity

Cards are editable, but editing sourced text creates an attribution problem.

The product must never imply that an edited sentence remains an exact Hadith, Quran translation, poem or attributed quote.

Required behaviour:

1. pristine curated card shows its verified source/attribution where relevant;
2. when the user edits sourced text, the UI marks the card as edited;
3. source metadata remains available to the user as the source of the **original** card;
4. the exported edited card must not falsely attach the exact-source attribution to materially changed text;
5. the UI should explain concisely: `You changed the original wording. The source applies to the original text.`

For unsourced/original greeting or motivational cards, this distinction is not required.

---

## 7. Proposed information architecture

### Primary route

`/urdu-cards`

Purpose:

- one strong browseable gallery;
- category filters;
- ready-made card previews;
- edit/share actions;
- useful explanatory copy without burying the gallery.

### Initial category model

Recommended filters:

- All
- Faith
- Pakistan
- Poetry
- Love
- Deep
- Greetings
- Family

Seasonal filters can appear temporarily, for example:

- Ramadan
- Eid
- Independence Day
- Wedding

Do not create a new indexable route for every small tag in the first release.

### Future collection routes

Only after product/search evidence supports them, consider strong collection pages such as:

- `/urdu-cards/islamic`
- `/urdu-cards/poetry`
- `/urdu-cards/pakistan`
- `/urdu-cards/romantic`

They must contain enough unique editorial value and card inventory to avoid thin doorway pages.

---

## 8. Core gallery actions

Every eligible card should expose a small, consistent action set.

### Share

Preferred local-first behavior:

1. render the card locally to an image/file;
2. use Web Share with files where supported;
3. the user can select WhatsApp, Messages, Facebook or another installed target from the OS share sheet;
4. fall back to local download where file sharing is unavailable.

Do not claim a direct official WhatsApp integration unless one exists.

### Download

Generate a high-quality local image using the existing Card Studio rendering/export path or a shared renderer extracted from it.

### Edit

Open `/urdu-card-studio` with:

- selected text;
- selected background;
- typography/style defaults;
- attribution state where applicable.

No private/user-edited content in the URL.

### Copy text

Optional secondary action for users who only want the Urdu wording.

---

## 9. Shared system relationship

`WU-CARD-CONTENT-001` must reuse, not fork, the Card Studio ecosystem.

The intended model is:

```text
Shared background registry
        ↓
+----------------------+----------------------+----------------------+
| Card Studio          | Card Gallery         | Ready-made Cards     |
| advanced editing     | user text compare    | curated content      |
+----------------------+----------------------+----------------------+
                ↓ shared rendering/handoff ↓
              download / native share / edit
```

The content gallery adds a **curated card-definition registry**, not a second independent card renderer.

---

## 10. Curated card data model

A card definition should support, at minimum:

```js
{
  id,
  textUr,
  category,
  subcategory,
  backgroundId,
  tags,
  mood,
  textLength,
  featured,
  source: {
    type,
    attribution,
    reference,
    originalLanguage,
    translationProvenance,
    verified,
    verificationNote
  },
  rights: {
    status,
    note
  },
  layout: {
    alignment,
    safeAreaOverride,
    fontScale,
    lineHeight
  }
}
```

The exact schema belongs to the architecture contract.

---

## 11. Visual-quality requirements

Every card must pass the same four principles already established for the background collection, now applied to **background + actual text** together.

### 11.1 Clear text-safe center/region

The final text must stay in a calm region and never collide with important art.

### 11.2 Strong Urdu contrast

Text must be quickly readable on a normal mobile screen.

### 11.3 Short and long text support

The collection should include different content lengths, but every card definition must fit its assigned background/layout without clipping or visual congestion.

### 11.4 Receiver-facing quality

The exported/shared card must remain attractive after realistic messaging/social compression.

Additional card-level checks:

- Urdu shaping is correct;
- Nastaliq/Naskh choice fits the card;
- source line, if shown, never overwhelms the main text;
- attribution remains legible but secondary;
- no generated visual text embedded into background artwork;
- no accidental English engineering labels in the final card.

---

## 12. Mobile interaction model

Mobile is the primary design target.

Recommended structure:

1. concise title/subtitle;
2. horizontally scrollable or wrapping filter chips;
3. two-column card grid where width permits;
4. one-column fallback for very narrow/high-text cards;
5. tap card to inspect larger preview;
6. clear primary `Share` and `Edit` actions;
7. no hover-only controls.

At 320–390px widths:

- no page-level horizontal overflow;
- touch targets should be comfortable;
- card text remains readable enough to judge the design;
- expanded preview should not trap the user in a complex modal workflow.

---

## 13. Performance model

A rich gallery can become expensive if every item loads a large background and full renderer immediately.

Requirements:

- reuse optimized background thumbnails/previews where available;
- lazy-load offscreen images;
- do not instantiate a canvas for every visible gallery tile;
- render gallery text as DOM over background previews;
- invoke high-resolution rendering only for download/share/edit/export actions;
- cache only according to current PWA/service-worker conventions;
- do not pre-cache an unbounded future gallery corpus.

The first meaningful gallery viewport must remain fast on mobile networks.

---

## 14. Privacy and telemetry

The ready-made card corpus itself is public content.

User edits are not.

Never send user-edited text to Product Pulse/analytics.

Allowed categorical events may include:

- gallery visit;
- category selected;
- curated card ID selected;
- share attempt / share capability / share success where observable;
- download;
- edit handoff;
- Card Studio destination ready.

A curated public card ID is acceptable telemetry because it identifies public site content, not private text.

Do not log:

- edited text;
- copied text;
- user-entered replacement text;
- rendered card contents.

---

## 15. SEO strategy

The initial SEO owner is the strong gallery route `/urdu-cards`.

Requirements:

- unique title/H1/description;
- clear distinction from `/urdu-card-studio` and `/urdu-card-gallery`;
- useful intro copy centered on ready-made shareable Urdu cards;
- crawlable category labels and a representative static content baseline where practical;
- no thousands of auto-generated card pages in the initial release;
- no thin near-duplicate routes for every mood/phrase;
- canonical extensionless URL;
- sitemap inclusion only when the public route is actually launched.

Individual public card pages should be a later evidence-based decision, preferably tied to the existing public-share architecture rather than SEO page multiplication.

---

## 16. Content curation workflow

The content registry should behave like editorial content, not arbitrary constants scattered through runtime files.

Required workflow:

```text
candidate text
→ source/rights review
→ background pairing
→ Urdu typography/layout review
→ mobile preview
→ export/share review
→ approval
→ public registry
```

A card should be excluded if any of the following is unresolved:

- source authenticity;
- literary rights;
- translation rights/provenance;
- attribution uncertainty;
- visual readability;
- export quality.

---

## 17. Launch corpus guidance

Do not let one category dominate.

Suggested first 40-card balance, adjustable after QA:

| Family | Target |
| --- | ---: |
| Faith / Dua / Reflection | 8 |
| Pakistan / Folk | 7 |
| Poetry / Literature | 7 |
| Love / Romance | 5 |
| Deep / Motivation | 6 |
| Greetings / Celebrations | 5 |
| Family / Friendship | 2 |

The numerical target is not a shipping requirement. A card that fails source/rights/visual QA should be removed rather than replaced with filler.

---

## 18. Slices

### Slice 0 — Content contract + corpus foundation

**May proceed as isolated planning/foundation work. No public route required.**

Deliver:

- versioned curated-card schema;
- source/rights states;
- edit-attribution rules;
- initial verified/original content candidate corpus;
- background pairing matrix;
- source and copyright review notes;
- fixtures for source integrity and edited-state behavior;
- implementation map against current Card Studio/Card Gallery code.

### Slice 1 — Gallery foundation

Deliver when roadmap permission is recorded:

- `/urdu-cards`;
- responsive gallery UI;
- category filters;
- DOM card previews;
- lazy loading;
- accessible card/action controls;
- no public sharing backend required.

### Slice 2 — Local download + native share

Deliver:

- high-quality local card render;
- file download;
- Web Share file support when available;
- fallback behavior;
- receiver-quality validation.

### Slice 3 — Edit in Card Studio

Deliver:

- safe handoff;
- text/background/style transfer;
- attribution integrity after edits;
- destination-ready measurement.

### Slice 4 — Public release + SEO

Deliver:

- canonical metadata;
- sitemap/llms/human sitemap where appropriate;
- internal links from relevant creation surfaces;
- changelog;
- Product Pulse bounded telemetry;
- production/mobile smoke tests.

### Slice 5 — Seasonal/editorial operations

Deliver only after core usage exists:

- featured/trending editorial slots based on aggregate public-card usage;
- Ramadan/Eid/Independence Day/wedding packs;
- editorial review cadence;
- corpus expansion process;
- stale/low-quality card retirement without breaking shared IDs unnecessarily.

### Slice 6 — Evidence-gated category pages

Only after search/product evidence:

- strong collection routes for categories with real demand;
- unique editorial copy;
- sufficient card inventory;
- canonical ownership review to avoid cannibalization.

---

## 19. Relationship to current roadmap gate

This epic is founder-approved as a product/specification direction on 2026-09-13.

It does **not** silently erase the existing `WU-PLAT-002H` rule that major Card Studio acquisition expansion waits for Card completion diagnosis.

Therefore:

- planning, content corpus work, schema work and isolated registry/fixture work may proceed;
- launching `/urdu-cards` publicly requires either the Card completion gate to permit it or an explicit founder-directed roadmap exception recorded in the canonical backlog;
- do not use this spec alone to redesign Basic/Rich Editor or homepage first-value UI.

---

## 20. Acceptance gates

The epic is complete only when:

- [ ] A curated-card registry exists with stable IDs and validated schema.
- [ ] Public cards use only approved source/rights states.
- [ ] Religious cards have verified source metadata where relevant.
- [ ] Copyright-unclear literary content cannot leak into the public corpus.
- [ ] Editing sourced content cannot preserve a misleading exact-source attribution.
- [ ] Every card passes mobile readability and receiver-quality review.
- [ ] Gallery previews do not create a canvas-per-card performance problem.
- [ ] Local download works from the ready-made card definition.
- [ ] Native file share works where supported with graceful fallback.
- [ ] Card Studio handoff preserves design and user edits without putting text in URLs.
- [ ] User-edited text never enters analytics.
- [ ] `/urdu-cards` has clear canonical/SEO ownership when launched.
- [ ] Existing Card Studio and Card Gallery behavior remains green.
- [ ] Public release is recorded in backlog governance before launch.

---

## 21. Non-goals

- a social network/feed with likes/comments/follows;
- AI-generated religious quotations;
- scraping viral quote sites for unverified copy;
- using famous modern poetry without rights review;
- generating thousands of thin SEO pages;
- forcing login before download/share/edit;
- uploading private user edits merely to make native sharing work;
- replacing Card Studio;
- building a second independent renderer;
- direct unofficial WhatsApp automation.

---

## 22. Definition of a good release

A strong release feels like a **beautiful Urdu content destination**, not a template directory.

A user should be able to open the page, see something meaningful within seconds, choose a card that emotionally fits the moment, and share it with confidence.

The recipient should see a polished piece of Urdu visual content—not evidence that the sender used a design tool.