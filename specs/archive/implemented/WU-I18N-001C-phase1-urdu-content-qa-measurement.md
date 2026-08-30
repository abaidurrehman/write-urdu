# WU-I18N-001C — Phase 1 Urdu Content, Product QA & Measurement

**Parent:** `WU-I18N-001`  
**Depends on:** `WU-I18N-001A`, `WU-I18N-001B`  
**Status:** Planned — Slice C  
**Launch corpus:** 8 crawlable Urdu pages

## 1. Goal

Ship the first user-credible Urdu locale as a real product experience, not merely translated metadata.

The Phase 1 pages must be natural enough for Urdu-speaking users to understand the task, complete it, navigate to the next useful action and return to the English counterpart when desired.

This slice also establishes the measurement needed to decide whether `/urdu/` should expand across the remaining indexable corpus and how much it contributes to the broader `$5/day` AdSense objective.

## 2. Phase 1 page ownership

### 2.1 `/urdu/`

**Job:** type Urdu using English letters and receive Urdu script.  
**Primary search intent:** Urdu typing / write Urdu online / English letters to Urdu.

Required Urdu coverage:

- title;
- H1;
- hero/answer summary;
- Start typing / Explore tools / Learn how controls;
- input mode explanation;
- copy/export/share labels;
- typing instructions;
- dependency/retry state;
- voice discovery entry;
- account/save entry point if present;
- contextual next steps;
- footer/navigation.

Do not change the Roman/English-letter input default because the page copy is Urdu.

### 2.2 `/urdu/urdu-keyboard`

**Job:** direct Urdu character input.

Required coverage:

- page title/lede;
- keyboard/editor labels;
- clear/copy/save actions;
- direct-input guidance;
- error/empty states;
- relevant next steps.

Do not translate physical key bindings or Unicode values.

### 2.3 `/urdu/urdu-editor`

**Job:** format and export Urdu writing.

Required coverage:

- page heading/lede;
- toolbar-adjacent product labels owned by WriteUrdu;
- save/export/share/help states;
- local/cloud draft entry point if present;
- formatting guidance;
- next-step handoffs.

Do not rewrite TinyMCE internals merely for locale parity unless the editor API already supports the required localization safely. WriteUrdu-owned chrome is the release requirement; editor-vendor menu localization may be a later enhancement if risky.

### 2.4 `/urdu/tools/urdu-voice-typing`

**Job:** speak Urdu and receive editable Urdu text.

Prefer plain language such as:

```text
بولیں اور اردو میں لکھیں
```

Required coverage:

- browser support/status;
- microphone action;
- listening/stopped/error states;
- copy/edit/continue actions;
- privacy/vendor-processing disclosure appropriate to the existing feature contract;
- browser unsupported fallback.

Do not imply speech recognition is browser-local if the browser/vendor processes audio externally.

### 2.5 `/urdu/urdu-alphabet`

**Job:** learn/reference Urdu letters.

This is a Learn surface and a likely monetizable acquisition page.

Required coverage:

- Urdu explanatory introduction;
- headings/captions;
- letter names and table headings;
- writing-direction explanation;
- useful links to Keyboard/Home/Editor.

Preserve actual Urdu glyphs and names; do not transliterate the whole table into English.

### 2.6 `/urdu/urdu-faq`

**Job:** answer product and Urdu-writing questions.

Required coverage:

- all visible questions and answers included in emitted FAQ schema;
- concise natural Urdu;
- correct product limitations;
- direct links to relevant tools.

Do not add speculative language/culture claims solely to increase text length.

### 2.7 `/urdu/urdu-card-studio`

**Job:** create Urdu cards/images.

Required coverage:

- creation goal;
- text/background/template controls owned by WriteUrdu;
- preview/download/share states;
- empty state;
- next actions.

Do not localize user template text or alter rendering contracts.

### 2.8 `/urdu/how-to-write-urdu-on-photo`

**Job:** explain how to put Urdu text/poetry on an image and hand off to Card Studio.

Required coverage:

- full useful Urdu guide, not an English article with an Urdu heading;
- step-by-step path into Card Studio;
- accurate description of local background handling/export;
- links to related creation resources.

## 3. Language quality rules

The target is understandable modern Urdu for normal web users, not academic terminology.

### Prefer task language

Examples:

```text
انگریزی حروف میں اردو لکھیں
اردو متن کاپی کریں
فائل محفوظ کریں
بولیں اور اردو میں لکھیں
تصویر پر اردو لکھیں
```

### Avoid unnecessary jargon

Do not lead with terms equivalent to:

- transliteration;
- rendering pipeline;
- Unicode normalization;
- browser persistence;
- speech-recognition engine.

Technical terms may appear where the user needs them, but the primary action should remain simple.

### Preserve common borrowed product words when they are clearer

Natural Urdu web copy can retain familiar terms such as PDF, Word, QR, WhatsApp and browser when forcing a rare translation would reduce comprehension.

## 4. Translation review workflow

For every Phase 1 route:

1. inventory visible source strings and dynamic states;
2. map each user-facing string to a stable localization key or reviewed content block;
3. reuse existing Urdu translation where natural/current;
4. rewrite awkward legacy translations rather than preserving them for compatibility;
5. render desktop and mobile;
6. verify RTL ordering and mixed English/Urdu content;
7. verify action labels still match actual behavior;
8. record review completion in the locale registry/spec checklist.

Do not approve a route based only on title/H1 translation.

## 5. RTL visual QA

Test at minimum:

- desktop Chromium;
- Pixel 5/mobile viewport used by the existing suite.

Review:

- header/navigation ordering;
- dropdown/menu alignment;
- hero actions;
- editor/action toolbar order;
- icon/text spacing;
- form labels and inputs;
- mixed Latin/Urdu strings;
- numbers and dimensions;
- tables;
- cards/grid order;
- ad boundaries;
- footer groups;
- modal/toast placement;
- focus rings and keyboard navigation.

Use logical CSS properties (`margin-inline`, `padding-inline`, `inset-inline`, `text-align: start/end`) for new fixes where practical rather than accumulating locale-specific left/right overrides.

## 6. Accessibility contract

Urdu locale must preserve existing accessibility behavior.

Required:

- `lang="ur"` on the document;
- English fragments marked when needed;
- accessible locale switch label;
- Urdu aria labels for WriteUrdu-owned interactive controls;
- focus order follows DOM/task order, not merely visual RTL order;
- keyboard shortcuts remain documented accurately;
- live status/error regions still announce state;
- icon-only controls retain meaningful names.

Do not translate shortcut key names into characters the user cannot press.

## 7. Product continuity

Changing or navigating within locale must not fragment the product journey.

Examples:

```text
/urdu/ -> /urdu/urdu-editor
/urdu/ -> /urdu/urdu-card-studio
/urdu/urdu-alphabet -> /urdu/urdu-keyboard
/urdu/how-to-write-urdu-on-photo -> /urdu/urdu-card-studio
```

Existing handoff payloads continue to use the normalized product route and existing session/privacy rules.

No document text goes into query parameters simply to preserve locale.

## 8. AdSense and page-type inheritance

Locale pages inherit the monetization contract from the English product route.

### Write pages

`/urdu/`, Keyboard, Editor and Voice keep active writing/listening workspaces protected. Use only existing approved post-workspace or page-type placements.

### Learn pages

Alphabet, FAQ and Photo Guide can use the existing Learn/content placement rules after the answer/lede and at natural content boundaries.

### Create pages

Card Studio inherits the existing Create protected-area rules.

No new locale-specific ad slot is required for launch.

## 9. Revenue measurement

The Urdu locale is one input into the existing `WU-GROWTH-001` commercial model.

Measure aggregates where available:

```text
Urdu organic clicks/day
Urdu organic impressions/day
Urdu monetizable pageviews/day
Urdu page RPM / closest available page-group RPM
Urdu estimated revenue/day
Urdu useful pages per organic visit / journey depth proxy
```

Directional revenue equation:

```text
Urdu contribution ≈ Urdu monetizable pageviews × Urdu/proxy page RPM / 1000
```

Do not promise that the locale alone reaches `$5/day`.

## 10. Privacy-safe locale telemetry

If existing product telemetry supports dimensions, add `locale` only as a bounded enum:

```text
en
ur
```

Allowed aggregate/event context:

- locale;
- normalized product route;
- page type;
- journey source/destination;
- boolean text-presence where already approved.

Forbidden:

- user text;
- speech transcript;
- filenames;
- draft contents;
- typed search phrases inside the application;
- identity added solely for locale analytics.

Do not create a new analytics backend for this initiative.

## 11. Phase 1 SEO measurement window

After launch, monitor `/urdu/` separately in Search Console.

Weekly review should capture:

- discovered/indexed URLs;
- impressions;
- clicks;
- CTR;
- average position;
- new Urdu-script queries;
- query → Urdu landing route;
- cannibalization with English pages;
- country/device mix;
- crawl/canonical errors.

Record meaningful evidence in the existing growth documentation/control plane rather than repeatedly rewriting page copy in reaction to a few days of noise.

## 12. Expansion decision

Phase 2 expansion is approved when the technical/product gates are green. Search evidence informs **priority/order**, not whether users deserve functional locale consistency.

Prioritize remaining routes using:

1. existing organic authority/demand;
2. natural Urdu-script query relevance;
3. usefulness as a destination;
4. ability to create a useful second action;
5. translation completeness/effort;
6. AdSense/page-type value without harming UX.

High-probability Phase 2 candidates include Documentation, Fonts, Text Cleaner, OCR, InPage converter, Templates and other creation/reference pages, but the current registry at implementation time is authoritative.

## 13. Regression tests

### Content/static assertions

For each Phase 1 route verify:

- expected Urdu H1;
- meaningful Urdu lede/body text;
- no accidental English-only primary CTA set;
- locale-aware internal links;
- language switch counterpart;
- expected page-type/ad boundary classification.

### Browser tests

Cover representative flows:

#### Flow A — Urdu typing

```text
open /urdu/
confirm Urdu shell
focus editor
enter text / verify editor remains functional
open locale-aware next step
```

#### Flow B — direct keyboard

```text
open /urdu/urdu-keyboard
use a keyboard action
copy/clear remains functional
switch to English counterpart
```

#### Flow C — Voice

```text
open /urdu/tools/urdu-voice-typing
verify Urdu unsupported/permission/status copy
no local asset failures
```

#### Flow D — Learn → Write

```text
open /urdu/urdu-alphabet
follow Urdu Keyboard action
land on /urdu/urdu-keyboard
```

#### Flow E — Learn → Create

```text
open /urdu/how-to-write-urdu-on-photo
follow Card Studio action
land on /urdu/urdu-card-studio
```

## 14. Production smoke checklist

For all eight URLs:

- HTTP 200;
- expected Urdu initial source;
- correct canonical;
- correct hreflang;
- no redirect loop;
- no local asset 404;
- key interaction works;
- desktop/mobile readable;
- ads respect page-type boundaries;
- language switch reaches exact counterpart.

Also verify English counterparts remain healthy.

## 15. Phase 1 success indicators

### Technical success

- all 8 URLs crawlable and self-canonical;
- no locale-prefix asset or feature regressions;
- no material performance regression.

### Product success

- Urdu interface is usable without mixed-language critical actions;
- core tasks complete on mobile/desktop;
- locale navigation preserves product continuity.

### Search success

Early indicators:

- Google discovers/indexes the locale corpus;
- `/urdu/` begins receiving Urdu-script query impressions;
- no systematic canonical selection back to English;
- no material loss on established English owners attributable to the launch.

### Commercial success

Measure contribution, not vanity page count:

- incremental monetizable Urdu entrances/pageviews;
- RPM by page group where available;
- useful second-page journeys;
- estimated Urdu revenue contribution.

## 16. Acceptance criteria

- [ ] All eight Phase 1 pages have reviewed natural Urdu copy beyond metadata.
- [ ] WriteUrdu-owned critical controls/errors/empty states are localized.
- [ ] RTL desktop and Pixel 5 QA passes.
- [ ] Phase 1 internal links keep users in Urdu where counterparts exist.
- [ ] English counterparts remain functional and retain search ownership.
- [ ] Existing AdSense protected-area rules apply to Urdu pages.
- [ ] Locale can be measured without collecting content or adding a backend.
- [ ] Production smoke is documented.
- [ ] Search Console `/urdu/` monitoring is started.
- [ ] Phase 2 remains gated by the parent rollout decision rather than bulk-generated automatically.

## 17. Verification

```text
npm run locale:generate
npm run locale:check
npm run seo:generate
npm run seo:check
npm run governance:check
npm test
npm run test:browser
```

A route is not complete if its Urdu source is crawlable but the primary product action is broken, misleading or still critically English-only.