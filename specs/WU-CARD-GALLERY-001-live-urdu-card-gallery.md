# WU-CARD-GALLERY-001 — Live Urdu Card Gallery / Background-First Rich Studio

**Status:** Planned — founder-approved for specification on 2026-09-12  
**Area:** Card creation / social sharing / visual discovery  
**Proposed route:** `/urdu-card-gallery`  
**Related:** `/urdu-card-studio`, `WU-PLAT-002H`, `WU-JOURNEY-001C`, `WU-SHARE-001`  
**Primary invariant:** this is a new background-first chooser, not a replacement or redesign of the existing Card Studio.

## 1. Product goal

Create a separate, extremely simple visual creation surface where a user writes Urdu once and immediately sees that same text rendered across the full background collection.

The core loop is:

`write once → preview everywhere → choose the card that feels right → continue to Card Studio / export`

This deliberately reverses the current Card Studio mental model. Card Studio remains editor-first and refinement-oriented. The Gallery is choice-first and visual.

The user should not need to understand templates, overlays, canvas positioning or advanced styling before seeing an attractive result.

## 2. Why this deserves a separate route

The existing `/urdu-card-studio` is an editor/workspace. It is correct for users who want to control format, typography, background and export details.

The proposed Gallery solves a different job:

> “I have some Urdu text. Show me how it looks on all the beautiful designs so I can pick the one I like.”

Combining both jobs into one surface would make Card Studio heavier and make the Gallery less magical. The Gallery therefore stays intentionally narrow:

- one text entry area;
- compact intent/category controls;
- many immediate live previews;
- one clear selection action;
- seamless handoff to Card Studio for refinement.

## 3. Receiver-first product principle

The final shared image is the real product output.

A design is not successful merely because it looks attractive in the editor. It must remain beautiful when received on a phone, viewed in a feed, compressed by a messaging platform or screenshotted.

Every background available in the Gallery inherits the Card Studio quality gates:

1. a clear text-safe center area;
2. strong Urdu text contrast;
3. good behavior for short, medium and long Urdu text;
4. high perceived quality for the receiver, not only the creator.

The Gallery makes these quality rules visible because the same real text appears across many backgrounds side by side.

## 4. Initial experience

### 4.1 First screen

The first useful viewport should contain:

- a clear Urdu text input;
- concise instruction: `Write once. See it on every design.`;
- optional input helpers only if they reuse existing proven engines cleanly;
- the beginning of the live preview gallery without a large explanatory wall.

Suggested Urdu product copy:

> **اپنا متن لکھیں — ہر ڈیزائن میں فوراً دیکھیں**

Do not place a wizard, account request, promotional carousel or command wall before the live previews.

### 4.2 Live gallery

As the user types, every currently visible card preview updates with the text.

The user can filter by categories such as:

- All
- Classic
- Pakistan
- Truck Art
- Poetry
- Nature
- Modern
- Wedding
- Luxury

The exact categories must come from the shared background registry rather than being duplicated in page code.

### 4.3 Selection

Each preview has one dominant action:

`Use this design`

Selecting it transfers the current text and selected background to `/urdu-card-studio` using the existing handoff/state architecture.

The Card Studio opens already prepared with:

- the same text;
- the chosen background;
- its recommended text colour/overlay defaults;
- an appropriate preset/aspect ratio where known;
- editable text and normal Card Studio controls.

No private text is placed in the URL.

### 4.4 Direct download

Direct one-tap download from the Gallery is a later slice, not an MVP requirement. First prove that background discovery → selection → Card Studio completion is useful and reliable.

## 5. Background-driven ranking

The MVP may start with stable ordering plus category filters.

A later deterministic ranking layer may use metadata only, not AI or private semantic inspection.

Examples:

- long text → rank backgrounds with large text-safe zones and `textCapacity: long` higher;
- 1–2 lines → expressive backgrounds may rise;
- `Poetry` intent chip → rank Poetry/Nature/Luxury designs higher;
- `Wedding` intent chip → rank Wedding designs higher.

Do not send the user's text to a server merely to rank backgrounds.

## 6. Shared background registry

The current Card Studio background definitions must become a reusable product registry before the Gallery duplicates them.

A background record should support at least:

```js
{
  id,
  name,
  nameUr,
  category,
  src,
  thumbnailSrc,
  textColor,
  overlayColor,
  overlayOpacity,
  safeArea,
  textCapacity,
  preferredAlign,
  goodFor
}
```

Fields should remain optional where the existing asset does not need them. Do not over-engineer a generic design-system schema.

### Required semantics

`safeArea`
: normalized or percentage bounds describing the calm text zone, for example `{ top, right, bottom, left }`.

`textCapacity`
: bounded enum such as `short`, `medium`, `long` or an equivalent deterministic model.

`goodFor`
: bounded tags such as `poetry`, `dua`, `quote`, `greeting`, `wedding`, `social` used for filtering/ranking only.

`thumbnailSrc`
: optional lightweight preview asset. It becomes important as rich WebP backgrounds are added.

## 7. Preview architecture

### Do not render a full Card Studio canvas per card

This is a hard requirement.

Rendering 20–60 canvases on every keystroke would waste CPU/memory and make mobile typing feel slow.

The gallery preview should use lightweight DOM composition:

- image/background layer;
- optional overlay layer;
- positioned text layer;
- CSS sizing derived from text-length bucket + background metadata.

The real Card Studio renderer remains authoritative for export.

### Update strategy

- update previews locally in the browser;
- use one shared text state;
- batch rapid input updates with `requestAnimationFrame` or a very small debounce;
- never recreate the whole gallery DOM on every keystroke;
- update only visible text nodes/styles;
- lazy-load image assets;
- consider viewport-driven activation only if the collection becomes large enough to require it.

For the current 12-background collection and a near-term 20–40 item collection, simple lazy-loaded DOM previews should be preferred over premature virtualization.

## 8. Text fitting model

The preview renderer must work for real Urdu, not only demo one-liners.

Test three canonical buckets:

- **short:** 1–2 lines / phrase / short dua;
- **medium:** roughly 3–4 lines;
- **long:** roughly 6–8 lines.

The preview may use deterministic length/line heuristics to select font-size classes. It does not need pixel-perfect parity with export, but it must not materially mislead the user about whether a background fits their text.

Requirements:

- `lang="ur"` and correct RTL direction;
- Nastaliq-friendly line-height;
- no clipping in the defined safe area;
- high contrast using registry defaults;
- graceful handling of mixed Urdu/Latin/numbers;
- a bounded maximum text length for responsive preview performance;
- no hidden truncation that makes a long card look falsely valid.

If long text cannot fit a design safely, the preview should communicate that design is a poorer fit or rank it lower rather than silently clipping content.

## 9. Input modes

The page's first release should prioritize one clear editable Urdu text state.

Existing engines may be reused where they fit without creating UI clutter:

- direct Urdu input;
- Roman Urdu → Urdu transliteration;
- Voice input if the unified Voice engine can be embedded without creating a second implementation.

Do not rebuild transliteration or Voice inside this epic.

Do not make input mode selection visually stronger than the resulting cards.

## 10. Handoff contract

Reuse the existing Card Studio handoff/state mechanism wherever possible.

The Gallery owns selection; Card Studio owns advanced editing and export.

Required transfer state:

```text
text
backgroundId
optional intent/category
optional preset/aspect ratio
source = card-gallery
```

The selected background must resolve from the shared registry on the destination. Do not serialize image blobs or duplicate full background metadata in handoff storage.

Required behavior:

`Gallery selection → Card Studio opens → handoff recognized → text/background ready → user can immediately edit/export`

Add a content-free funnel around those states only after reconciling with the current telemetry allowlist.

## 11. Privacy

The Gallery should remain browser-local.

Never send to analytics or telemetry:

- Urdu text;
- Roman source text;
- voice transcript;
- rendered card content;
- screenshots/canvas data;
- arbitrary user-entered strings.

Permitted telemetry may include bounded categorical fields such as:

- route;
- device class;
- category filter;
- background ID from the controlled registry;
- text-length bucket (`empty/short/medium/long`);
- design selected yes/no;
- handoff started/ready;
- export completion only if observed on Card Studio through existing events.

Telemetry names and properties must be reconciled with current product contracts before production work.

## 12. SEO and route ownership

This route is a product surface, not a thin keyword page.

Proposed canonical route:

`/urdu-card-gallery`

Do not create near-duplicate variants such as:

```text
/urdu-background-gallery
/urdu-poetry-card-gallery
/urdu-card-backgrounds
/urdu-rich-card-studio
```

for acquisition.

### Initial release gate

Because `/urdu-card-studio` already owns closely related creation/search intent, the Gallery should remain `noindex` during private/limited validation unless the SEO owner explicitly confirms distinct query intent and canonical positioning.

Before indexable release:

- verify no cannibalization with `/urdu-card-studio`;
- define unique title/H1/description;
- decide which page owns `Urdu card maker` style queries;
- add only purposeful internal links;
- include in sitemap only when public/indexable policy is approved.

## 13. Relationship to Card Studio completion gate

The current canonical backlog says Card Studio has measured activation but weak export completion and that major acquisition expansion is blocked until `WU-PLAT-002H` P0.1F is understood.

This epic therefore distinguishes **planning/foundation** from **public product expansion**:

- Slice 0 architecture, registry extraction, fixtures and prototype-only work may proceed because it can be isolated;
- production route launch/promotion must respect the Card Studio completion gate unless the founder records a new explicit exception in the canonical backlog.

Do not interpret this spec as silently overriding `WU-PLAT-002H`.

## 14. Slices

### Slice 0 — Contract, registry extraction plan and preview benchmark

No public new route required.

Deliver:

- current background inventory + metadata gap audit;
- proposed shared registry API;
- safe-area/text-capacity schema;
- short/medium/long Urdu fixtures;
- preview performance benchmark target;
- exact Card Studio handoff mapping;
- SEO ownership decision: initially `noindex` unless separately approved;
- source-level tests for registry invariants.

### Slice 1 — Live Gallery MVP

Subject to roadmap permission.

Deliver:

- `/urdu-card-gallery` page;
- one clear text area;
- real-time DOM previews for all current backgrounds;
- category filters;
- short/medium/long fitting behavior;
- responsive mobile gallery;
- no direct export yet;
- no account requirement.

### Slice 2 — Card Studio handoff

Deliver:

- `Use this design` action;
- safe state transfer without text in URL;
- selected background resolves from shared registry;
- Card Studio opens ready to edit;
- back/return continuity where practical;
- funnel telemetry using bounded, content-free properties.

### Slice 3 — Intent ranking and quality assistance

Deliver only after MVP interaction evidence:

- intent chips such as Poetry / Dua / Greeting / Wedding;
- deterministic ranking using registry metadata;
- long-text suitability ordering;
- optional `Best for your text length` marker;
- no server-side semantic analysis.

### Slice 4 — Direct export experiment

Only after selection/handoff completion is stable.

Potential deliverables:

- one-click local export for selected designs;
- renderer parity tests against Card Studio;
- native share/file share where supported;
- download fallback;
- no duplicated rendering logic if Card Studio renderer can be safely reused.

### Slice 5 — Public discovery / SEO release

Evidence-gated.

Deliver:

- indexability decision;
- internal links/navigation only if justified;
- sitemap/LLMs/public registry registration;
- unique SEO ownership;
- launch copy/changelog;
- post-launch completion and referral review.

## 15. Mobile UX requirements

The primary audience must be assumed mobile-first.

At 360–430 CSS px:

- input is immediately obvious;
- no horizontal page overflow;
- filter chips may horizontally scroll locally;
- previews should normally use one or two columns depending on readable preview width;
- cards remain tappable without tiny action targets;
- typing should remain smooth while previews update;
- the software keyboard must not trigger forced-scroll loops;
- preview text must be large enough to judge the design without opening every item.

Do not require hover to discover selection actions.

## 16. Accessibility

- semantic label for the writing input;
- native buttons for filters and selection;
- `aria-pressed` or equivalent state for filters/selection;
- visible keyboard focus;
- meaningful background names in English/Urdu UI;
- decorative background images should not create noisy alt text;
- preview text remains actual DOM text, not baked into inaccessible preview images;
- reduced motion has no loss of information.

## 17. Performance budgets

Exact thresholds should be benchmarked in Slice 0, but the implementation must protect these principles:

- no canvas-per-preview on input;
- no eager download of every full-resolution rich raster asset;
- typing updates should not produce visible input lag on a mid-range mobile device;
- thumbnails/lazy loading should be used when raster assets become large;
- no third-party runtime image service;
- no background asset fetch repeated per keystroke.

## 18. Measurement

The important funnel is:

`gallery visit → first input → previews visible → background selected → Card Studio handoff → destination ready → export attempt → export complete`

Primary product questions:

- do users reach a design choice faster than in editor-first flow?;
- what share of users select a design after typing?;
- which categories/backgrounds are selected?;
- does Gallery-originated traffic complete Card Studio exports at a healthier rate?;
- do long-text users select different backgrounds from short-text users?;

Do not measure user content.

## 19. Acceptance gates

The epic is successful only when:

- [ ] Every background shown in the Gallery comes from one shared registry.
- [ ] Existing Card Studio background IDs and behavior remain intact.
- [ ] Typing updates visible previews smoothly on mobile.
- [ ] Short, medium and long Urdu fixtures do not clip silently.
- [ ] Registry text colours/overlays produce strong readable contrast.
- [ ] Background safe areas are respected.
- [ ] Category filters work in English and Urdu UI.
- [ ] Selection transfers text + background to Card Studio without text in URL.
- [ ] Card Studio export remains authoritative and regression-free.
- [ ] No private text appears in telemetry/network payloads.
- [ ] The route is not made indexable until canonical/query ownership is approved.
- [ ] Existing Card Studio, social makers, Name Art and writing tools remain regression-free.
- [ ] Real mobile/browser QA confirms the experience is pleasant, not merely technically functional.

## 20. Non-goals

- replacing Card Studio;
- building another general-purpose design editor;
- server-side rendering;
- AI-generated backgrounds at runtime;
- semantic analysis of private text;
- social profiles/comments/likes;
- account requirement;
- dozens of SEO doorway routes;
- duplicating Voice or transliteration engines;
- rendering every preview through an export canvas;
- hiding poor-fit long text with ellipsis and calling it valid.

## 21. Product definition of done

A user can arrive with real Urdu text, type/paste/speak it once, immediately understand how it looks across the collection, choose a visually compelling card in seconds, continue to Card Studio without re-entering anything, and produce a receiver-quality shared image without the Gallery making the rest of Write Urdu slower or more confusing.
