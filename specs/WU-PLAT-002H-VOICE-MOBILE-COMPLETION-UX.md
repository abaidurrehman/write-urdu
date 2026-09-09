# WU-PLAT-002H — Voice, Mobile Writing & Completion UX Convergence

**Status:** Active — P0 execution child of `WU-PLAT-002H`  
**Priority:** P0  
**Parent epic:** `WU-PLAT-002H — Core Activation & Feature Discovery Acceptance`  
**Amends/coordinates with:** `WU-PLAT-004`, `WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR`, `WU-PLAT-002H-CONVERSION-REPAIR`, `WU-GROWTH-003`, `WU-VOICE-PLAT-001`, `WU-SHARE-001R`, `WU-COMMUNITY-001`, Card Studio contracts  
**Decision date:** 2026-09-09  
**Evidence source:** 2026-09-09 Product Pulse review + founder/user mobile-editor feedback

---

## 1. Executive decision

This is **not a new standalone epic**. The UX findings belong inside the existing `WU-PLAT-002H` activation/conversion programme.

The product should stop presenting typing, Voice, Copy, Share, Download, Card Studio and Publish as unrelated tools. The user owns one central object: **their Urdu writing**.

The governed journey is:

```text
CREATE
Type | Speak
  ↓
COMPOSE
One dominant writing surface
  ↓
USE
Copy | Share | Download
  ↓
CONTINUE
Card | Rich Editor | Keep | Publish when relevant
```

The UX principle is:

> **The editor is the product. Voice is an input mode. Copy/Share/Download are outcomes. Card/format/save/publish are contextual continuations.**

The implementation must simplify the perceived product while preserving existing capability and ownership.

---

## 2. Why this is P0 now

The 2026-09-09 Product Pulse snapshot shows a strong-enough product core to justify convergence rather than feature expansion.

Directional current-window evidence includes:

- product activity around **1,130** with **890** engaged and **78.8%** engagement;
- Voice usage counter around **657**, only **5** recorded Voice errors, about **0.6%** error rate, and a reported cross-workspace Voice success/adoption metric around **68.1%**;
- device mix around **655 desktop / 397 mobile / 46 tablet**, making non-desktop roughly **40%** of measured device volume;
- export funnel around **125 → 85**, approximately **68%** completion from expressed export intent;
- Card Studio only about **25 visits**, but approximately **64.7%** completion once users reach it;
- current Share Loop surface shows effectively **zero** published/share-loop outcomes in the observed window;
- Urdu-language product usage dominates English-language product usage.

Interpretation:

1. Voice is no longer merely an experimental utility; it is a proven input path.
2. Mobile usability is commercially material, not an edge case.
3. Export friction is a completion problem worth measuring precisely.
4. Card Studio looks more like a discovery/timing problem than an obvious core-product failure.
5. The Share Loop needs trustworthy post-writing flow and telemetry before more promotion.
6. The homepage/Basic Writer must carry primary feature discovery because product entry is highly concentrated.

These figures are dated evidence, not permanent product claims. Do not hard-code them into public marketing copy.

---

## 3. UX architecture

### 3.1 One central object

The writer's text remains the primary object across input, editing and completion.

Do not make the user mentally switch between product taxonomies such as:

```text
Typing Tool
Voice Tool
Card Tool
Export Tool
Community Tool
```

The experience should instead communicate:

```text
How do you want to create Urdu?
What do you want to do with it now?
```

### 3.2 Four governed experience states

#### A — Arrive

Goal: reach first input as quickly as possible.

Dominant UI:

```text
intent/title
compact Type | Speak input choice
real writer visible immediately
```

#### B — Compose

Goal: uninterrupted writing.

Dominant UI:

```text
writer
compact input-mode status
minimal authoring chrome
```

#### C — Complete

Goal: finish the immediate real-world job.

Primary actions:

```text
Copy | Share | Download | More
```

#### D — Continue

Goal: present one relevant next step without creating a tool directory.

Possible continuations:

```text
Card Studio
Rich Editor
Keep this writing
Publish to Urdu Writers
```

Eligibility remains governed by existing state/arbitration contracts.

---

## 4. Mobile first-screen contract

The mobile homepage/Basic Writer must pass a five-second comprehension test:

> A first-time visitor can identify where to type or speak within five seconds without scrolling or interpreting a tool catalogue.

### 4.1 Initial hierarchy

On common mobile viewports the sequence is:

```text
compact product header
intent-matched title / one short example
Type | Speak
writer
```

Do not place before the writer:

- large Voice promo cards;
- generic feature grids;
- account CTAs;
- Community promotion;
- Card Studio promotion;
- large ads;
- long SEO copy;
- export command walls;
- redundant Start buttons that merely reveal the real writer.

Existing `WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR` viewport floors remain authoritative.

### 4.2 The writer must look interactive

The writer needs:

- visible boundary/background contrast;
- useful height;
- obvious empty state;
- visible focus state;
- readable Urdu/English at default mobile zoom;
- no stronger competing card above it.

Do not solve editor discovery with another banner.

---

## 5. Type / Speak as the primary input choice

### 5.1 Product decision

Voice should be presented as an **input mode of the writing experience**, not mainly as a destination link to another tool.

Preferred first-screen structure:

```text
[ Type ]   [ Speak ]
```

The actual labels may include Urdu/localized wording, but primary actions must be understandable without relying on icon interpretation.

### 5.2 Reuse existing Voice platform

Do not build another speech-recognition engine.

Reuse the current shared Voice core / `WU-VOICE-PLAT-001` architecture and existing final-speech insertion path.

### 5.3 Permission timing

Microphone permission must be requested only after an explicit user action to start Voice.

Never request permission on page load or simply because Voice is visible.

### 5.4 Voice active state

While listening, show an unmistakable state with:

- `Listening` / equivalent status;
- elapsed time where already supported;
- visible audio activity or bounded listening indicator;
- live/final Urdu result behavior through the existing engine;
- Pause/Stop/Done where technically supported;
- clear recovery for permission/no-speech/error states.

The user must never have to guess whether the microphone is active.

### 5.5 Voice completion state

After final speech is committed to the owned writing surface:

- return to a normal editable state;
- keep the text visible;
- allow another Voice segment without losing prior writing;
- do not immediately force signup/publish/modal behavior;
- let existing growth arbitration decide whether a later Keep request is eligible.

---

## 6. Focused mobile writing mode

Once the user is actively writing on a small screen, non-essential chrome may compact so the writing surface owns more of the viewport.

This is a **state transition**, not a new page.

### Allowed behavior

- compress header height;
- collapse explanatory help already understood;
- keep the active writer/caret visible;
- keep essential input-state access reachable;
- reveal completion actions only after value exists.

### Forbidden behavior

- removing navigation/accessibility entirely;
- trapping the user in a pseudo-fullscreen mode;
- hiding the active caret under sticky chrome;
- aggressive forced scrolling;
- moving controls around on every keystroke;
- creating layout jumps at length thresholds.

---

## 7. Mobile software-keyboard contract

Any changed mobile writing surface must preserve:

- caret/current line inside the effective visual viewport;
- no sticky header over the active line;
- no action dock over the text;
- no horizontal overflow;
- stable behavior when the keyboard opens/closes;
- no repeated `scrollIntoView()` loop;
- no accidental page zoom from undersized inputs;
- predictable restoration after keyboard dismissal.

Use CSS/layout first. Use `visualViewport` only when current browser behavior requires it.

---

## 8. Post-writing action dock

### 8.1 Product decision

After meaningful text exists, mobile should expose a compact, thumb-reachable completion surface:

```text
Copy | Share | Download | More
```

The exact implementation may be sticky/fixed only if it does not mask text, ads, browser UI or accessibility targets.

### 8.2 Safe-area behavior

On supported mobile devices the dock must respect safe-area insets and software-keyboard state.

Do not pin a dock over the active editor while the keyboard reduces the visual viewport unless there is enough guaranteed usable space.

### 8.3 Action hierarchy

**Copy**
- strongest general short-task outcome;
- visible after useful text;
- existing copy runtime remains owner.

**Share**
- opens an outcome-oriented share surface;
- prefer native Web Share API when available;
- approved fallback paths must remain usable without native share support.

**Download**
- routes to the existing output surface;
- preserve proven PDF/Word/PNG behavior according to workspace/device rules;
- do not duplicate export engines.

**More**
- progressive access to lower-frequency outputs/settings/continuations;
- not an all-tools directory.

---

## 9. Copy success should become a useful completion moment

A bare `Copied` toast is not the only acceptable outcome.

After successful Copy, a compact non-blocking completion surface may offer one relevant continuation such as:

```text
Copied
Share this Urdu
```

or, where evidence/eligibility supports it:

```text
Copied
Make a shareable Urdu card
```

Rules:

- no modal interruption while the user is still actively editing;
- no simultaneous Keep + Share + Publish prompts;
- dismissible and suppression-aware;
- one continuation request at a time;
- do not repeatedly nag after every Copy.

---

## 10. Share UX

### 10.1 Share bottom sheet / disclosure

The Share action should answer the user's real question: **where can I use this writing?**

A compact mobile share surface may include:

```text
Native Share / More apps
WhatsApp when supported by approved adapter
Copy text
Make a shareable Urdu card
```

Do not create a giant social-network control wall.

### 10.2 Public Share vs native/social share

Keep distinctions explicit:

- **Share text/app share** = use current writing in another app/device share flow;
- **Public share link** = publish a public snapshot under `WU-SHARE-001R`;
- **Publish to Urdu Writers** = moderated community publishing under `WU-COMMUNITY-001`.

These are not synonyms and must not share misleading CTA labels.

### 10.3 Telemetry discipline

No writing text, share ID, transcript or uncontrolled destination string enters Product Pulse.

Use bounded action/channel enums only.

---

## 11. Card Studio discovery

The current evidence suggests Card Studio should be tested as a **contextual continuation**, not promoted broadly above the writer.

### Eligible moments

Examples:

- after successful Copy/Share completion;
- from `More` when useful text exists;
- after an explicit image/share intent;
- after another approved completion state.

Do not infer sensitive semantics from the writing.

Do not create a poetry/content classifier in this slice.

### Handoff

If the user chooses Card Studio:

- use existing safe handoff infrastructure;
- do not put text in URL/query/hash;
- preserve source writing;
- do not overwrite conflicting destination state silently;
- measure shown → selected → destination ready → restored → meaningful start → export/outcome.

---

## 12. Long-form continuation

The existing E3/E4 state model remains authoritative.

For substantial/long writing:

- Rich Editor remains the preferred formatting escalation;
- PDF/Word become more relevant task completions;
- Keep may win for signed-out unsaved writing;
- Community Publish becomes eligible only when rollout/state allow and it does not compete with higher-priority Keep;
- Share may become eligible after meaningful completion.

Do not trigger modal behavior exactly at 500/1000-character thresholds.

Length changes eligibility, not interruption.

---

## 13. Continuity invariant

The writing must survive movement between:

```text
Type ↔ Voice
Basic → Rich Editor
Basic/other writer → Card Studio
writer → account Keep flow
public share → recipient creation flow
```

Reuse current owner handoff/draft systems.

Never:

- put writing text in URLs;
- destroy source state before destination acknowledgement;
- silently replace an existing destination draft;
- create a second ad-hoc storage key when a current first-party handoff owner already exists.

---

## 14. Information architecture / navigation rule

Do not solve feature discovery by making the global header larger.

During active writing, the local task hierarchy wins.

Global navigation may remain richer on content/SEO pages, but authoring routes should not expose every product destination as equal-weight navigation during composition.

---

## 15. Accessibility requirements

Every changed control must preserve:

- semantic button/link behavior;
- visible focus;
- meaningful text label for primary actions;
- no icon-only Voice control;
- practical mobile touch targets (~44px where possible);
- `aria-pressed` for mode choices when appropriate;
- `aria-expanded` / `aria-controls` for disclosures;
- Escape/focus return for sheets/menus;
- no focus theft from the editor after Voice or Copy completion;
- no repeated live-region announcements on every recognition/interim update.

---

## 16. Privacy / content boundaries

This programme may use bounded state such as:

```text
workspace
device class
input mode
signed-in state
saved/unsaved state
length/depth bucket
outcome category
release/experiment marker
```

Do not send or persist in Product Pulse:

```text
typed text
speech transcript
audio
selected text
filenames
share IDs
document IDs
community item IDs
email/account identifiers
raw uncontrolled referrer/query content
```

Do not introduce semantic inspection of the user's Urdu writing for recommendations in this slice.

---

## 17. Measurement contract

Reuse existing telemetry owners and `WU-PLAT-002H-METRICS-CONTRACT.md`.

### 17.1 First value

```text
writer eligible
→ writer visible
→ focused
→ first input
→ first Urdu success
→ first outcome
```

Split at minimum by device/workspace/input mode.

### 17.2 Voice

```text
voice exposed
→ voice selected
→ permission/start attempt
→ started
→ final committed
→ successful Urdu result
→ next writing/outcome
```

Keep repeatable final-result counts separate from unique success conversion.

### 17.3 Completion dock

Measure bounded states such as:

```text
completion actions eligible
completion dock shown
action selected: copy/share/download/more
outcome completed
```

### 17.4 Export

Make the current `125 → 85`-style funnel diagnosable by stage instead of treating the entire difference as generic abandonment.

At minimum distinguish:

```text
export action selected
format selected / eligible
export started
export success/completed
export error
```

Where a stage does not apply to a route, mark it N/A rather than failure.

### 17.5 Card Studio

```text
card continuation eligible
shown
selected
destination ready
text/state restored
meaningful edit/start
export attempted
export completed
```

### 17.6 Share

Use existing `WU-SHARE-001R` semantics. Do not create a second share funnel vocabulary.

---

## 18. Acceptance scenarios

### Scenario 1 — first-time mobile typing

At 375x667-class viewport:

- editor is visible without scrolling;
- Type/Speak choice is understandable;
- user can tap writer directly;
- software keyboard does not hide the active line;
- no account/share/card promo blocks first value.

### Scenario 2 — first-time Voice

- Voice is visible as an input choice;
- no permission request until explicit Voice action;
- listening state is obvious;
- final Urdu is committed into the same writing object;
- user can continue typing or speaking;
- no signup requirement.

### Scenario 3 — short writing completion

- Copy is obvious after useful text;
- successful Copy does not interrupt editing;
- one bounded continuation may be offered;
- Share/Download remain reachable;
- no permanent seven-icon toolbar appears.

### Scenario 4 — native share

- Share opens a clear outcome surface;
- native Web Share is used when supported;
- fallback remains usable when unsupported;
- no user text is emitted to Product Pulse.

### Scenario 5 — Card Studio continuation

- source writing is preserved;
- Card Studio receives state through approved handoff;
- no text enters URL;
- conflicting destination state is handled safely;
- destination meaningful start is measurable.

### Scenario 6 — long-form mobile writing

- writing surface remains dominant;
- threshold transitions do not jump caret/layout;
- Rich/PDF/Word are accessible according to existing owner rules;
- Keep/Share/Publish arbitration presents at most one growth request.

---

## 19. Ordered implementation slices

One slice per PR by default.

### Slice 0 — Reconcile current shipped state + telemetry

Before visible UX changes:

- inspect current Basic/Rich mobile layout after the Sep 9 mobile/laptop repairs;
- inspect existing Type/Direct/Voice controls and shared Voice engine ownership;
- inspect Copy/Share/Download/More source owners;
- inspect Product Pulse event semantics for Voice, completion, export, Card and Share;
- identify existing UI that would be replaced/demoted by later slices;
- add only missing measurement needed to judge the later UX.

**Exit:** no duplicate owner is being designed and all later funnel stages are measurable.

### Slice 1 — Input-choice convergence

- make Type/Speak relationship clear within the primary writer experience;
- reuse Voice platform;
- keep English-letter typing default where current acquisition contract requires it;
- preserve direct Urdu route/mode;
- no new promo card above editor;
- preserve mobile viewport acceptance.

### Slice 2 — Voice active/return state polish

- obvious listening state;
- bounded progress/status;
- safe Stop/Pause/Done behavior where existing engine supports it;
- final text returns to owned writer;
- smooth Continue speaking / continue editing state;
- error/permission recovery without blocking other input modes.

### Slice 3 — Mobile focused-writing mode + completion dock

- compact non-essential chrome while focused;
- keep writer/caret stable under keyboard;
- introduce Copy/Share/Download/More only after useful text;
- safe-area/keyboard-aware dock behavior;
- no duplicate legacy action row.

### Slice 4 — Copy/share completion surface

- improve Copy success from bare notification to bounded completion moment;
- implement/reconcile native share path where appropriate;
- preserve public-share/community distinctions;
- one continuation request at a time.

### Slice 5 — Contextual Card Studio + long-form continuation

- Card as contextual continuation rather than pre-value promotion;
- safe handoff + destination ready/meaningful-start telemetry;
- preserve Rich/PDF/Word/Keep/Publish priority logic for E3/E4.

### Slice 6 — Export funnel repair

- diagnose exact `selected → started → completed/error` stage;
- fix the identified failure only;
- do not redesign formats blindly;
- preserve current export engines and account-free completion.

### Slice 7 — Post-release decision

Hold a clean release-marked window and record:

```text
Keep
Iterate
Rollback
Insufficient evidence
```

Review by device/input mode and ensure no mobile first-value, Voice-success, export-completion, accessibility, CWV, SEO or privacy regression.

---

## 20. Non-scope

Do not use this programme to:

- redesign the entire visual identity;
- add a new speech provider;
- add AI writing classification;
- build a new editor engine;
- create new SEO landing pages;
- change canonical/title/H1 ownership;
- build a generic feature carousel;
- gate typing/Voice/Copy/export behind account creation;
- delete lower-frequency exports;
- rebuild Community moderation;
- create a new analytics backend;
- put ads inside active authoring/completion controls.

---

## 21. Definition of done

The programme is complete only when a new or returning user can naturally understand and use this loop:

```text
I can TYPE or SPEAK Urdu here.
I can keep writing comfortably on my phone.
When I am done, I can COPY, SHARE or DOWNLOAD it.
If useful, I can continue into a CARD, richer formatting, SAVE or PUBLISH without losing my text.
```

And Product Pulse can measure that loop end-to-end without collecting the writing itself.

The execution skill is:

`skills/voice-mobile-completion-ux/SKILL.md`

The Codex/Claude handoff prompt is:

`specs/WU-PLAT-002H-VOICE-MOBILE-COMPLETION-PROMPT.md`
