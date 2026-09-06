# Core Activation Conversion Repair — Implementation Skill

Use this skill when implementing `WU-PLAT-002H-CONVERSION-REPAIR.md`.

This skill is written so either Claude Code or Codex can execute the programme without turning it into a broad redesign.

---

## Read first

Before changing code, read these in this order:

```text
docs/WU-CORE-ACTIVATION-EVIDENCE-2026-09-06.md
specs/WU-PLAT-002H-CONVERSION-REPAIR.md
specs/WU-PLAT-002H-CONVERSION-ACCEPTANCE.md
specs/WU-PLAT-002H-core-activation-feature-discovery.md
specs/WU-PLAT-002H-METRICS-CONTRACT.md
specs/WU-PLAT-002H-IMPLEMENTATION-CHECKLIST.md
specs/WU-PLAT-002H-UX-STATE-MATRIX.md
specs/WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md
specs/WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md
specs/WU-PLAT-004-basic-writer-command-toolbar.md
specs/WU-GROWTH-002-account-save-share-entry-points.md
specs/WU-SHARE-001R-recipient-start-continuity.md
```

Also inspect the current runtime and tests before assuming any spec filename or implementation note still matches the code exactly. Runtime + regression tests are authoritative for shipped behavior.

---

## Mission

Improve this product loop without adding another feature layer:

```text
get Urdu
→ complete immediate task
→ see one relevant continuation
→ continue without losing work
→ optionally keep/share/publish
```

The current programme is not a visual refresh. It is a **measurement → transport → arbitration → experiment** sequence.

The most important implementation rule is:

> Do not optimize a CTA before you know which funnel stage is actually failing.

---

## Mandatory slice order

Implement in this order unless a production blocker requires a smaller preparatory fix:

```text
Slice 0 — telemetry denominator normalization
Slice 1 — continuation path consolidation/diagnostic
Slice 2 — shared growth-request arbiter
Slice 3 — voice-success → Keep/account experiment
Slice 4 — long-form continuation/retention
Slice 5 — proven-output prioritization
Slice 6 — share continuity only
Slice 7 — post-change review
```

One slice per PR by default.

Do not jump directly to Slice 3 because the voice/account signal looks exciting. Slice 0/1 must make the measurement path trustworthy first.

---

# Slice 0 execution instructions

## Goal

Make Product Pulse conversion metrics mathematically and semantically valid.

## Inspect first

Search for the real current owners of:

```text
product telemetry event emission
aggregate/hourly rollups
Product Pulse API aggregation
Product Pulse dashboard metric definitions
first-value events
voice counters
continuation/handoff counters
Card Studio counters
```

Likely relevant files include:

```text
js/product-telemetry.js
main.js
js/workspace-next-step.js
js/workspace-handoff.js
js/text-handoff.js
functions/**/product-pulse*
functions/**/telemetry*
functions/**/analytics*
tests/product-telemetry-contract.test.js
```

Do not assume these are exact; use repository search.

## Classify every metric

For every touched metric, write down before coding:

```text
metric name
entity being counted
unique state or repeatable event?
eligible denominator
can one session emit it more than once?
can the value exceed the denominator legitimately?
```

Then enforce:

- success/conversion/rate = compatible unique denominator;
- repeatable event = count or events-per-start;
- optional branch step = N/A when not applicable, not automatic failure.

## Do not destroy useful repeated counters

For example, repeated speech final results are useful. Keep them, but label them as frequency rather than success conversion.

## Release boundary

If historical aggregates cannot be recomputed safely, do not invent a migration. Add/retain a bounded release/version marker and compare clean post-release windows.

## Tests required

At minimum add tests proving:

- repeatable numerator cannot feed a metric named success/conversion;
- Product Pulse output cannot render >100% for those metric classes;
- event-per-start can exceed 1× and is explicitly labelled;
- no telemetry payload gained user text/transcript/identity.

Stop after Slice 0 in the first PR.

---

# Slice 1 execution instructions

## Goal

Determine whether continuation failure is recommendation relevance, transport, restore, or destination activation.

## Inspect first

Likely files:

```text
js/workspace-next-step.js
js/workspace-journey-registry.js
js/workspace-handoff.js
js/text-handoff.js
js/product-telemetry.js
```

Also inspect all legacy continuation code paths discovered by search.

## Required path identity

Every tracked recommendation needs bounded identifiers for:

```text
recommendation_id
source_workspace
destination_workspace
path_version
release_marker
```

Never derive IDs from user text.

## Correct state semantics

Use this conceptual sequence:

```text
eligible
shown
selected
handoff_created      # only when applicable
destination_ready
payload_restored     # only when applicable
meaningful_start
destination_outcome  # only when already measurable
```

`destination_ready` means the destination task can actually accept/use the state.

`meaningful_start` means the user began the destination task. Page load is insufficient.

## Preserve data safety

Never:

- put text in URL;
- overwrite an existing Rich draft silently;
- delete source state before destination import is confirmed;
- invent a new sessionStorage key when existing handoff infrastructure already owns the journey.

## UI rule

Do not change CTA styling/placement until normalized data identifies the failing stage.

If selection is low, then evaluate relevance/copy/placement.

If readiness is low, fix navigation/runtime.

If restore is low, fix handoff/import.

If meaningful start is low after successful restore, fix destination acknowledgement/focus/context.

---

# Slice 2 execution instructions

## Goal

Create one logical owner for Keep / Share / Community Publish promotion.

## Inspect first

```text
js/account-growth-entry.mjs
js/workspace-next-step.js
main.js
community publish entry-point code
public share UI code
current auth/signed-in state helpers
```

Search before creating a new module. Reuse an existing growth-entry owner if one already exists and can cleanly become the arbiter.

## Arbiter input

Use bounded state only, for example:

```text
workspace
writer state E0-E5
signed-in boolean
saved/unsaved state
length/depth bucket
meaningful outcome state
community eligibility
active request / recent dismissal
```

Do not pass the writing text into the arbiter.

## Arbiter output

Exactly one of:

```text
none
keep
share
community_publish
```

Never an array of simultaneous promos.

## Priority

```text
protect unsaved value (Keep)
→ normal task completion commands remain independent
→ Share after completion
→ Community Publish when eligible and not competing
```

## Signed-in rule

Signed-in users never receive account-acquisition wording.

## Telemetry

Track:

```text
eligible
shown
opened
completed
dismissed
suppressed_due_to_arbitration
suppression_reason
```

Bounded enums only.

---

# Slice 3 execution instructions

## Goal

Test Voice-success as a natural moment to protect/save work.

## Existing implementation to inspect

```text
js/account-growth-entry.mjs
js/writer-voice-input.js
js/input-mode.js
shared voice core / adapters
```

`js/account-growth-entry.mjs` currently contains the voice draft preservation path. Reuse it unless code inspection proves another owner has superseded it.

## Trigger

Eligible only after final speech has been successfully committed to the real user-owned text state and the capture UI is idle/editable again.

Never trigger:

- on mic exposure;
- before permission;
- while listening;
- on interim recognition;
- on failed/no-speech capture.

## Do not build a voice-specific signup system

The Voice experiment must call the shared growth arbiter. If Keep does not win, do not show a second voice banner.

## Auth continuity

If the user chooses Keep/account:

```text
preserve draft
→ navigate/authenticate
→ return
→ restore/save writing
```

Success is restored/saved writing, not navigation to sign-in.

## Privacy

No audio/transcript/text in telemetry.

---

# Slice 4 execution instructions

## Goal

Make long-form writing naturally continue into formatting/retention/publishing.

The evidence supports a meaningful 1,000+ cohort. Treat character depth as eligibility state, not a popup timer.

## Rules

- crossing 500/1000 changes state only;
- never fire a modal exactly at the threshold;
- surface eligible requests at an idle/completion/continuation point;
- Keep normally wins for signed-out substantial unsaved work;
- Rich Editor / PDF / Word are normal task actions, not growth promos;
- Community Publish cannot stack with Keep;
- semantic content is irrelevant to eligibility.

## Basic → Rich

Protect:

- safe text transfer;
- conflict detection;
- source recoverability;
- destination acknowledgement;
- destination meaningful-start telemetry.

---

# Slice 5 execution instructions

## Goal

Reflect observed output usage without deleting capability.

Current evidence favors:

```text
PDF
Word
PNG
```

with very low current usage for JPEG/TXT/SVG.

## Rules

- promote PDF/Word for substantial text where the owner UI supports it;
- keep PNG visible where the job is visual;
- move lower-frequency outputs behind existing progressive UI only when appropriate;
- do not remove export implementations;
- do not add a new menu framework unnecessarily;
- copy/export remains account-free;
- do not recreate a pre-value command wall.

---

# Slice 6 execution instructions

## Goal

Verify share transport/referral continuity. Do not redesign from zero-view data.

Read:

```text
specs/WU-SHARE-001R-recipient-start-continuity.md
```

Verify:

```text
publish
→ human public view
→ CTA click
→ destination ready
→ referral recognized
→ first input
→ meaningful start
```

For `Use this text`, restore through approved handoff. Never URL-encode the writing.

Do not make CTA larger simply because current referred starts are zero.

Wait for meaningful reader volume before a product-level share UX experiment.

---

# Mobile discipline

The current mobile editor repair has already shipped and is awaiting evidence closeout.

Do not use this conversion programme to restart mobile layout work.

If a slice changes visible writer controls:

- preserve initial editor visibility;
- preserve the existing minimum editor-height acceptance floors;
- do not autofocus on load;
- do not create forced-scroll loops when the software keyboard opens;
- test iPhone Safari and Android Chrome where available;
- keep input choices compact.

Read the existing B2 mobile spec/matrix before any CSS/DOM change on `/` or `/urdu-editor`.

---

# SEO discipline

Do not modify canonical/title/H1 ownership merely to mention account, voice, save, share or publish.

Protect established intent language around English-to-Urdu typing and the current owner routes.

No new keyword pages belong in this programme.

Run SEO checks after shared template/header/component changes.

---

# Accessibility

Every changed CTA/control must preserve:

- keyboard operation;
- visible focus;
- correct button/link semantics;
- accessible name;
- mobile touch target;
- no focus theft after background state changes;
- no repeated announcement spam from telemetry/status updates.

A prompt appearing after Voice success must not steal focus from the editor unexpectedly.

---

# Privacy checklist

Before opening a PR, inspect telemetry payloads and confirm none contain:

```text
typed text
speech transcript
audio
selected text
filename
document ID
share ID
community item ID
email
account ID
raw uncontrolled referrer/query content
```

The growth arbiter should operate on bounded booleans/enums/numeric depth buckets only.

---

# Testing

Run the applicable repository checks. At minimum attempt the existing commands where present:

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

Do not blindly add new scripts if the repo uses different current names; inspect `package.json` first.

Focused tests across the programme should cover:

```text
metric denominator semantics
repeatable event labels
recommendation path identity
no text in telemetry
handoff destination-ready semantics
handoff meaningful-start semantics
source recovery on destination failure
one growth request at a time
signed-in suppression of account acquisition
Voice prompt only after successful final commit
Voice remains usable without signup
account flow restores/saves writing
long-form state does not force threshold modal
lower-frequency export remains reachable
mobile first-value hierarchy preserved
share text never enters URL
```

---

# Repository hygiene

Before editing:

1. inspect `specs/BACKLOG.md` and `specs/README.md`;
2. search for owner modules/tests;
3. identify existing implementation rather than creating duplicates;
4. keep changes bounded to the slice;
5. update the owning spec/checklist/status only when the implementation actually satisfies it.

Do not mark checkboxes complete merely because code was added. Acceptance must pass.

---

# PR format

Every PR body should contain:

```text
## Slice
Slice N — <name>

## Evidence/problem
<exact funnel/data problem addressed>

## Implementation
<modules and behavior changed>

## Removed/demoted/consolidated UI
<state what was simplified; say none for telemetry-only Slice 0>

## Measurement contract
Numerator:
Denominator:
Unique/repeatable semantics:
Release/path marker:

## Privacy
<confirm no text/transcript/identity telemetry>

## Data continuity
<handoff/draft safety if relevant>

## Validation
<tests/commands + manual/device checks>

## Explicitly not included
<later slices left out>
```

---

# Completion rule

A slice is complete only when:

- implementation exists;
- focused automated tests pass;
- relevant regression checks pass;
- Product Pulse semantics are correct for the new path;
- privacy invariants are preserved;
- manual/mobile acceptance is performed when required;
- backlog/spec status accurately reflects what is truly complete.

Do not declare the overall `WU-PLAT-002H` programme complete after one successful PR.

---

# Start command for Claude/Codex

Use this exact working instruction when beginning implementation:

> Read `skills/core-activation-conversion/SKILL.md` and every file in its **Read first** section. Inspect current runtime/tests before editing. Implement **Slice 0 only** from `specs/WU-PLAT-002H-CONVERSION-REPAIR.md`: normalize Product Pulse funnel denominator semantics and path/version labeling without materially changing user-visible CTA/layout behavior. Add focused regression tests, run the applicable repository checks, update specs/status only for acceptance that actually passes, and stop before Slice 1. In the PR summary, report numerator/denominator semantics, privacy impact, release marker and intentionally deferred slices.