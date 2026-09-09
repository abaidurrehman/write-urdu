# Voice + Mobile Writing + Completion UX — Implementation Skill

Use this skill when implementing:

`specs/WU-PLAT-002H-VOICE-MOBILE-COMPLETION-UX.md`

This is a child execution programme of the existing `WU-PLAT-002H` epic. Do not create a second competing UX architecture.

---

## Read first

Read these before changing code, in this order:

```text
specs/WU-PLAT-002H-VOICE-MOBILE-COMPLETION-UX.md
specs/WU-PLAT-002H-core-activation-feature-discovery.md
specs/WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md
specs/WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md
specs/WU-PLAT-002H-CONVERSION-REPAIR.md
specs/WU-PLAT-002H-METRICS-CONTRACT.md
specs/WU-PLAT-002H-UX-STATE-MATRIX.md
specs/WU-PLAT-004-basic-writer-command-toolbar.md
skills/core-activation-conversion/SKILL.md
skills/unified-urdu-input/SKILL.md
specs/WU-SHARE-001R-recipient-start-continuity.md
```

Also search for current Card Studio, Community publishing, account-growth and workspace-handoff owners before editing.

Runtime + tests are authoritative for shipped behavior when old implementation notes have drifted.

---

## Mission

Make the existing product feel like one coherent Urdu-writing workspace:

```text
Type | Speak
  ↓
Write comfortably
  ↓
Copy | Share | Download
  ↓
one relevant continuation
```

The editor is the product.

Voice is an input mode.

Copy/Share/Download are outcomes.

Card/Rich/Keep/Publish are contextual continuations.

---

## Hard boundaries

Do not:

- add a new Voice engine/provider;
- replace the existing transliteration engine;
- create a new editor;
- introduce another toolbar over existing toolbar owners;
- create another analytics backend;
- send text/transcript/audio to Product Pulse;
- put text in URL/query/hash;
- change canonical/title/H1 merely for this UX work;
- add generic feature grids before the writer;
- add account/publish prompts before first value;
- stack Keep + Share + Publish promotions;
- restart a broad mobile redesign already governed by B2;
- add semantic classification of user writing;
- delete existing outputs because one window is low volume;
- combine multiple visual slices into one large PR without a concrete code-level reason.

---

## Source-ownership rule

Before adding anything, identify the current owner of each behavior.

Search for:

```text
Basic Writer semantic controls
input-mode state
Voice button / Voice adapter / shared voice core
copy runtime
share adapter / public share path
export functions
More/output disclosure
workspace-next-step / continuation controller
workspace handoff / text handoff
account-growth arbiter
Card Studio import/handoff
Product Pulse event emission
Product Pulse rollups/API/dashboard
```

Likely files may include:

```text
index.html
main.js
js/input-mode.js
js/writer-voice-input.js
js/product-telemetry.js
js/workspace-next-step.js
js/workspace-handoff.js
js/text-handoff.js
js/account-growth-entry.mjs
js/core-workspace-convergence.js
js/editor-tools.js
js/card-studio*.js
functions/**/product-pulse*
functions/**/telemetry*
```

Do not assume these filenames are complete or current. Search first.

Every visible control should have one owner.

---

## Mandatory execution order

Implement in this order unless a production defect requires a smaller preparatory repair:

```text
Slice 0 — current-state + telemetry reconciliation
Slice 1 — Type/Speak input-choice convergence
Slice 2 — Voice active/return-state polish
Slice 3 — focused mobile writing + completion dock
Slice 4 — Copy/share completion surface
Slice 5 — Card + long-form contextual continuation
Slice 6 — export funnel repair
Slice 7 — post-release review
```

One slice per PR by default.

Do not start with the visually attractive dock or Share sheet before Slice 0 proves the current owners and telemetry.

---

# Slice 0 — Current state + telemetry reconciliation

## Goal

Establish exactly what is already shipped after the Sep 9 mobile/laptop fixes and what is still missing.

## Inspect

1. Current mobile DOM order for `/` and `/urdu-editor`.
2. Actual first-screen visible editor height at:
   - 360x800
   - 375x667
   - 390x844
   - 412x915
3. Existing input-mode controls and Voice integration.
4. Existing post-value Basic Writer action surface.
5. Current mobile action placement under software keyboard.
6. Existing native share/Web Share behavior.
7. Card Studio source handoff.
8. Export stages and telemetry.
9. Product Pulse Voice/Share/Card/Export event definitions.

## Required output before coding later slices

Write a small implementation note in the PR describing:

```text
owner
current behavior
missing behavior
existing telemetry
UI to replace/demote
risk
```

for:

```text
Type/Speak
Copy
Share
Download
More
Card continuation
Rich continuation
Keep/Publish arbitration
```

## Telemetry semantics

For each touched metric classify it as:

```text
unique state transition
repeatable event
attempt
completion
error
```

Do not call a repeatable event `success rate`.

## Slice 0 rule

Prefer no visible UX change unless instrumentation/current-state inspection finds a production defect that blocks the later experiment.

---

# Slice 1 — Type / Speak convergence

## Goal

Make Voice understandable as a sibling input method inside the writing journey.

## Preserve

- English-letter typing as current default where required;
- direct Urdu input;
- shared Voice core;
- existing Voice permission/error handling unless a reproduced defect requires repair;
- current mobile editor visibility floors.

## Desired interaction

The user should understand:

```text
Type
Speak
```

without a large promotional Voice card pushing the writer down.

Do not make all three input methods large cards.

## Permission

Microphone permission only after explicit user Voice activation.

## Unsupported Voice

Typing/direct input must remain fully usable.

Do not block with an unavailable modal.

## Tests

Cover:

- Voice control is not icon-only;
- no permission attempt before explicit activation;
- unsupported browser still has typing path;
- Type/Speak state does not duplicate the Voice engine;
- mobile writer remains in first viewport.

---

# Slice 2 — Voice active/return-state polish

## Goal

Make it unmistakable whether Voice is active, successful, paused/stopped or failed.

## Active state

Reuse current engine state and show only states the runtime can truthfully support.

Possible visible pieces:

```text
Listening status
bounded activity indicator
elapsed time if already reliable
Stop/Done
Pause only if the current engine actually supports it safely
interim/final behavior through current engine
```

Do not fake waveform accuracy or unsupported controls.

## Return state

After final text is committed:

- keep resulting Urdu visible;
- return to editable writer;
- allow continue speaking;
- allow normal typing immediately;
- no forced account dialog;
- existing growth arbiter remains owner of Keep eligibility.

## Focus

Voice success must not steal focus unpredictably or move the writer off-screen.

## Tests

Cover:

- listening status accuracy;
- final commit appears in owned writer;
- continue speaking appends safely;
- typing after Voice still works;
- no text/transcript telemetry;
- error returns to usable typing state.

---

# Slice 3 — Focused mobile writing + completion dock

## Goal

Give the writer most of the mobile viewport during composition, then make the immediate outcomes thumb-reachable after value exists.

## Focused writing state

May compact:

```text
header height
help/explanation already understood
non-essential local chrome
```

Must preserve:

```text
navigation escape
input-mode access
writer/caret
accessibility
```

## Completion dock

After meaningful text exists, expose:

```text
Copy | Share | Download | More
```

Do not show this as a permanent empty-state command wall.

## Implementation constraints

- use existing action engines;
- do not clone control IDs;
- remove/retire superseded visible action nodes if a new source-owned surface replaces them;
- reserve/stabilize layout to prevent jump;
- respect safe-area inset;
- do not cover text under software keyboard;
- avoid horizontal toolbar scrolling;
- if fixed/sticky behavior cannot remain safe under keyboard, use a stable non-fixed alternative.

## Required mobile tests

- 375x667 before keyboard;
- 390x844 before keyboard;
- keyboard-open simulation/browser test where available;
- Android Chrome manual where available;
- iOS Safari manual where available;
- rotate/reflow sanity;
- 200% zoom / text-size sanity where practical.

---

# Slice 4 — Copy/share completion surface

## Goal

Turn successful Copy/Share into a clear task completion moment without creating another marketing layer.

## Copy

After Copy succeeds:

- show concise confirmation;
- optionally expose one continuation;
- do not repeatedly prompt on every Copy;
- do not block continued editing.

## Share

Prefer native Web Share API when available and appropriate.

Fallback must remain usable.

Distinguish:

```text
share text / native app share
public share link
Publish to Urdu Writers
```

Do not label all three simply `Share` if that creates ambiguity.

## One-request rule

A Copy success continuation cannot stack with Keep/Share/Publish growth prompts from another controller.

Normal task Share may remain available; promotional growth request arbitration remains separate.

## Telemetry

Use bounded channel/action enums only.

Never send destination text or user content.

---

# Slice 5 — Card + long-form contextual continuation

## Card Studio

Treat Card as a continuation after value, not pre-value homepage promotion.

Eligible trigger families can include:

```text
explicit Card action
More after text exists
post-Copy/post-Share continuation experiment
approved image/share-intent continuation
```

No semantic reading classifier.

Use safe handoff and measure:

```text
shown
selected
destination ready
restored
meaningful start
export completed
```

## Long-form

Preserve E3/E4 contracts:

```text
Rich Editor
PDF/Word
Keep when eligible
Share after completion
Community Publish only when eligible and not competing
```

Do not fire modal at character thresholds.

---

# Slice 6 — Export funnel repair

## Goal

Explain and improve the current approximately 125 → 85 export funnel using stage-level evidence.

## Required stages

Use current owner terminology where possible, but distinguish:

```text
export action selected
format eligible/selected
export started
export completed
export error
```

If a stage does not apply to a workspace, mark it N/A.

## Diagnose before UI change

If loss is:

- before format selection → discovery/choice issue;
- start → error → implementation/browser issue;
- start → no completion with no error → telemetry/download lifecycle issue;
- specific format only → format implementation issue;
- mobile only → responsive/browser issue.

Fix the identified stage only.

Do not redesign all outputs blindly.

## Preserve

- account-free export;
- PDF/Word/PNG owners;
- lower-frequency outputs reachable;
- privacy/no-content telemetry.

---

# Slice 7 — Post-release review

Hold a clean release-marked window.

Review:

```text
mobile writer visible → first input
Type vs Voice activation
Voice selected → successful final Urdu
first value → Copy/Share/Download
export selected → completed/error
Card shown → selected → meaningful start → export
Basic → Rich continuation
Keep/Share/Publish arbitration
mobile/desktop guardrails
```

Record for every slice:

```text
Keep
Iterate
Rollback
Insufficient evidence
```

Do not claim programme completion from visual inspection alone.

---

# UX implementation rules

## 1. Remove/demote before adding

Every new visible control must identify what it replaces, consolidates or demotes.

## 2. No icon forest

Primary mobile actions require understandable labels.

Avoid a row such as:

```text
mic copy share download card AI save more...
```

## 3. Stable layout

State changes should not cause the caret to jump.

Prefer reserved regions and state classes over runtime DOM injection after arbitrary thresholds.

## 4. CSS first

Use layout/CSS before adding viewport/focus JavaScript.

## 5. No broad rebrand

Do not change global visual identity/colors/typography just to improve command hierarchy.

---

# Accessibility checklist

Before PR:

- [ ] all primary actions have accessible names;
- [ ] Voice not icon-only;
- [ ] mode selection state exposed correctly;
- [ ] visible keyboard focus;
- [ ] touch targets practical on mobile;
- [ ] disclosure/sheet has correct expanded/modal semantics;
- [ ] Escape/back closes disclosure and restores focus;
- [ ] no editor focus theft after Copy/Voice completion;
- [ ] no screen-reader spam from interim Voice status;
- [ ] completion dock does not obscure focused content.

---

# Privacy checklist

Confirm no Product Pulse payload contains:

```text
typed text
speech transcript
audio
selected text
filename
document ID
share ID
community item ID
email/account ID
raw referrer/query content
```

Use bounded enums/booleans/depth buckets/release markers only.

---

# SEO / monetization guardrails

Do not modify title/meta/canonical/H1 ownership as part of these UX slices unless a separately owned SEO spec explicitly requires it.

Keep SEO support content source-visible below the task.

Do not place ads:

- between Type/Speak and writer;
- inside writer;
- inside completion dock;
- inside Share/Download menus;
- deceptively adjacent to completion actions.

---

# Testing discipline

Inspect `package.json` before assuming exact commands.

Run applicable checks, normally including where present:

```bash
npm test
npm run governance:check
npm run seo:check
npm run locale:check
npm run test:browser
```

Add focused tests for the slice rather than depending only on the full suite.

Minimum programme regression set:

```text
first mobile viewport writer visibility
keyboard/caret stability
Type remains functional
Voice remains functional and ungated
Voice permission timing
Voice final text continuity
Copy success
Share fallback/native path
export engine unchanged unless Slice 6 owns fix
one completion surface / no duplicated controls
Card handoff no text in URL
Basic → Rich no text loss
one growth request at a time
no content telemetry
```

---

# Repository hygiene

Before editing:

1. inspect current `main` and recent commits;
2. check open PRs for overlapping files;
3. search for existing owner before creating a module;
4. keep one slice per PR;
5. do not mark spec acceptance complete before tests/manual evidence pass;
6. update cache/service-worker versions only when current repo rules require it;
7. avoid formatting unrelated files.

---

# PR body template

```text
## Slice
Slice N — <name>

## Existing owner inspected
<files/modules and current behavior>

## Evidence/problem
<exact UX/funnel problem>

## Implementation
<what changed>

## Replaced/demoted UI
<what was consolidated instead of stacked>

## Mobile behavior
<viewports + keyboard behavior>

## Measurement
Numerator:
Denominator:
Unique/repeatable semantics:
Release marker:

## Privacy
<confirm no content/transcript/audio/identity telemetry>

## Continuity
<text/draft/handoff safety>

## Accessibility
<focus/labels/sheet behavior>

## Validation
<focused tests + suite + manual checks>

## Explicitly deferred
<next slices not included>
```

---

# Completion rule

A slice is complete only when:

- source ownership is clear;
- implementation is bounded;
- duplicate/superseded UI is not left competing;
- focused tests pass;
- relevant full regression checks pass;
- privacy invariants pass;
- mobile/device validation is recorded when applicable;
- Product Pulse can judge the outcome;
- spec/status reflects only what actually passed.

---

# Start command for Claude/Codex

Use this exact instruction for the first implementation pass:

> Read `skills/voice-mobile-completion-ux/SKILL.md` and every file in its **Read first** section. Inspect current `main`, recent Sep 9 mobile/share/export commits, open PR overlap, runtime owners and tests before editing. Implement **Slice 0 only** from `specs/WU-PLAT-002H-VOICE-MOBILE-COMPLETION-UX.md`: reconcile the shipped Type/Voice/mobile/completion/export/Card surfaces and their Product Pulse event semantics, add only missing bounded telemetry/tests needed for later UX decisions, and avoid material user-visible redesign unless you find a blocking production defect. Report owner modules, current-vs-missing behavior, metric semantics, privacy impact, manual mobile checks still required, and stop before Slice 1.
