# Codex / Claude Implementation Prompt — WU-PLAT-002H Voice, Mobile Writing & Completion UX

Use this prompt to start or continue implementation of:

`WU-PLAT-002H-VOICE-MOBILE-COMPLETION-UX`

---

## Agent instruction

You are implementing an existing P0 WriteUrdu product-convergence programme. This work is **not a new UX epic** and must not become a broad redesign.

The central product decision is:

> **The editor is the product. Voice is an input mode. Copy/Share/Download are outcomes. Card/Rich/Keep/Publish are contextual continuations.**

Your job is to make the existing product feel simpler while preserving current engines, search ownership, privacy, accessibility and mobile first-value acceptance.

---

## Read first

Read these files in order before editing:

```text
skills/voice-mobile-completion-ux/SKILL.md
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

Then inspect current `main`, recent Sep 9 commits and open PRs for overlapping work.

Search for current source owners rather than assuming old filenames are still authoritative.

---

## Evidence that triggered the programme

Use the 2026-09-09 Product Pulse evidence as directional input, not public marketing claims:

```text
~1,130 product activity
~890 engaged
78.8% engagement
~657 Voice usage counter
5 Voice errors
~0.6% Voice error rate
~68.1% reported cross-workspace Voice success/adoption metric
~655 desktop / 397 mobile / 46 tablet
~125 → 85 export funnel (~68%)
Card Studio ~25 visits with ~64.7% completion once reached
Share Loop effectively zero in the current window
Urdu-language usage overwhelmingly dominates English-language usage
```

The product opportunity is therefore not another unrelated tool. It is:

```text
voice discovery
+ mobile writing comfort
+ post-writing task completion
+ contextual continuation
```

---

## Non-negotiable architecture

Do not rebuild:

```text
transliteration engine
Voice provider/recognition engine
editor engine
copy engine
export engines
workspace handoff
public share system
community moderation
analytics backend
```

Coordinate their presentation and continuity instead.

Never place user writing or speech transcript in URLs or Product Pulse telemetry.

---

## Mandatory implementation plan

Execute one slice per PR unless a smaller preparatory fix is required by a reproduced blocker.

### Slice 0 — Current-state + telemetry reconciliation

Inspect and document the existing owners/behavior for:

```text
Type/Speak input choices
mobile first-screen writer
Voice listening/final state
Copy
Share
Download
More
Card Studio handoff
Rich Editor continuation
Keep/Publish arbitration
export stages
Product Pulse metrics
```

Classify every relevant telemetry value as:

```text
unique state transition
repeatable event
attempt
completion
error
```

Add only missing bounded telemetry/tests needed for later decisions.

**Do not make a broad visible UX change in Slice 0.**

Stop and open the PR after this slice.

### Slice 1 — Type/Speak convergence

Make Voice visibly understandable as a sibling input method in the primary writer while preserving:

```text
English-letter default
Direct Urdu
shared Voice core
mobile editor visibility
permission only after explicit action
```

No large Voice promo card above the editor.

### Slice 2 — Voice active/return polish

Make the Voice state unmistakable:

```text
Listening
bounded activity/status
Stop/Done
Pause only if genuinely supported
final Urdu committed into owned writer
continue speaking / continue typing
clear error recovery
```

Do not gate Voice with account creation.

### Slice 3 — Focused mobile writing + completion dock

On mobile, allow non-essential chrome to compact during writing while preserving navigation/accessibility.

After useful text exists, expose a compact completion surface:

```text
Copy | Share | Download | More
```

Respect safe areas and software keyboard. Do not cover text or create horizontal toolbar scrolling.

Retire/suppress any superseded visible action surface rather than stacking a second generation.

### Slice 4 — Copy/share completion surface

After Copy/Share success, create a compact non-blocking completion state.

Prefer native Web Share API where appropriate, with usable fallback.

Distinguish clearly between:

```text
native/app text share
public share link
Publish to Urdu Writers
```

One growth request at a time.

### Slice 5 — Contextual Card Studio + long-form continuation

Offer Card Studio only after value/context, not before first writing.

Use safe handoff and preserve source text.

For E3/E4 continue to follow existing priority:

```text
Rich Editor
PDF/Word
Keep when eligible
Share after completion
Community Publish only when eligible and non-competing
```

Do not create semantic content classifiers.

### Slice 6 — Export funnel repair

Diagnose the current approximately `125 → 85` funnel using stage-level measurement:

```text
selected
format selected/eligible
started
completed
error
```

Fix the stage that is actually failing.

Do not blindly redesign all export UI.

### Slice 7 — Post-release decision

Hold a clean release-marked observation window and record:

```text
Keep
Iterate
Rollback
Insufficient evidence
```

Review mobile/desktop, Type/Voice, completion, export, Card, continuation, accessibility, CWV, SEO and privacy guardrails.

---

## Mobile acceptance

Any visible change on `/` or `/urdu-editor` must preserve the existing B2 viewport contract.

At minimum test:

```text
360x800
375x667
390x844
412x915
```

The editor must remain visible before scroll.

When keyboard is open:

```text
caret/current line visible
no sticky chrome covering writer
no action dock covering writer
no forced-scroll loop
no broken restore after keyboard closes
```

Manual Android Chrome / iOS Safari acceptance should be recorded where available.

---

## UX rules

1. **Remove/demote before adding.** Every new visible control must replace or consolidate something.
2. **No icon forest.** Primary mobile actions need understandable labels.
3. **No pre-value growth promos.** No account/share/card/community banners before useful text.
4. **Stable layout.** Threshold/state changes must not move the caret unpredictably.
5. **CSS first.** Add viewport/focus JS only when reproduced browser behavior requires it.
6. **No broad rebrand.** Keep this programme task-focused.
7. **No semantic inspection.** Recommendations use bounded state, not what the user wrote.

---

## Privacy invariants

Product Pulse must never receive:

```text
typed text
speech transcript
audio
selected text
filename
document/share/community IDs
email/account ID
raw uncontrolled referrer/query content
```

Use only bounded enums, booleans, depth buckets, workspace/device/input-mode and release markers.

---

## Accessibility requirements

For every changed control verify:

```text
semantic button/link behavior
accessible name
visible focus
practical touch target
Voice not icon-only
mode state exposed correctly
disclosure aria-expanded/controls
Escape/back close and focus return
no editor focus theft
no Voice live-region spam
```

---

## Validation

Inspect `package.json` first and run the applicable repository checks, normally including where available:

```bash
npm test
npm run governance:check
npm run seo:check
npm run locale:check
npm run test:browser
```

Add focused tests for the slice.

Do not mark acceptance complete just because code exists.

---

## Required PR summary

Every PR must report:

```text
Slice:
Evidence/problem:
Current owners inspected:
Implementation:
Visible UI replaced/demoted:
Mobile behavior:
Measurement numerator/denominator:
Unique vs repeatable event semantics:
Release marker:
Privacy review:
Text/draft/handoff continuity:
Accessibility:
Automated tests:
Manual/device checks:
Explicitly deferred next slices:
```

---

# Exact first-run prompt

Copy this into Codex or Claude Code for the first execution:

> Work in the WriteUrdu repository. Read `skills/voice-mobile-completion-ux/SKILL.md` and every file listed in its **Read first** section. Inspect current `main`, recent Sep 9 mobile/share/export commits, open PR overlap, actual runtime owners and existing tests before editing. Implement **Slice 0 only** from `specs/WU-PLAT-002H-VOICE-MOBILE-COMPLETION-UX.md`. Reconcile the shipped Type/Voice/mobile/completion/export/Card experience and Product Pulse event semantics; identify one owner for each visible/action path; add only missing bounded measurement and focused regression tests required for later UX decisions; do not materially redesign the UI unless a blocking production defect is reproduced. Preserve the current mobile first-viewport contract, Voice/transliteration/export engines, handoff/draft safety, SEO ownership, account-free core tasks, accessibility and privacy. Run the applicable checks, update status only for acceptance that truly passes, open one bounded PR, and stop before Slice 1. In the PR body include the owner map, current-vs-missing behavior, metric numerator/denominator semantics, unique/repeatable classification, privacy review, manual mobile checks still required and deliberately deferred slices.

---

# Continuation prompt after Slice 0 is reviewed

> Read the canonical skill/spec again and inspect the merged Slice 0 evidence. Implement only the **next incomplete approved slice**. Do not skip ahead. Reuse existing source owners, remove/demote superseded UI rather than stacking controls, preserve mobile/editor/Voice/privacy/SEO guardrails, add focused tests and Product Pulse measurement for the slice, run applicable checks, open one bounded PR, report what is deliberately deferred, and stop.
