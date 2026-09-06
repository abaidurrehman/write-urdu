# WU-PLAT-002H — Metrics Contract

This document defines the minimum measurement contract for the core activation programme. It is not an event naming mandate; implementation should reuse existing analytics names where semantically equivalent.

## Principles

- No writing, speech transcript, selected text, filename, document ID or share ID in product telemetry.
- Count users only through the privacy-safe aggregate/session mechanisms already approved by WriteUrdu.
- Measure state transitions, not semantic content.
- A click is an intermediate event, not the final success event when a downstream task exists.
- Rates must have clear denominators and must not exceed 100% unless explicitly named as an event-per-start ratio rather than a success rate.
- **A metric must declare whether its numerator is a unique session/attempt state or a repeatable event.** Repeatable events must never be divided by a unique-session denominator and labelled as conversion/success.
- **Optional branch steps must be modelled as N/A when they do not apply.** A Quick path that legitimately bypasses a step must not make the later event look like an impossible >100% funnel conversion.
- **Release/path markers are required when old and new instrumentation semantics coexist.** Do not blend incompatible code paths into one apparent funnel.

## Funnel 1 — Basic Writer first value

Denominator ladder:

1. `writer_eligible` or equivalent route/workspace visit where the writer can be used;
2. `writer_visible` when reliably observable;
3. `writer_focused`;
4. `writer_first_input`;
5. `writer_first_urdu_success` for English-letter/voice modes where Urdu production is expected;
6. depth checkpoints 20 / 100 / 500 / 1000;
7. `writer_first_outcome`.

Required outcome categories:

- copy;
- export_pdf;
- export_word;
- export_png;
- print/preview only if retained as completion metrics;
- save;
- public_share;
- community_submit;
- contextual_handoff.

Minimum dimensions:

- workspace;
- device class;
- locale;
- input mode;
- acquisition bucket;
- experiment/release marker.

### First-value denominator rule

`writer_first_*` metrics used in conversion ladders are **unique session-state transitions**. If runtime code can emit the raw underlying event more than once, the rollup/dashboard must deduplicate/materialize the first state before using it as a conversion numerator.

A current-period count may still be shown as a raw event total, but it must be explicitly named as an event count and must not be presented as `first input rate`, `first outcome conversion`, or equivalent.

## Funnel 2 — Voice

1. voice eligible/exposed;
2. voice clicked/tried;
3. permission requested;
4. permission granted/denied;
5. listening started;
6. speech heard;
7. final text event occurred;
8. Urdu inserted/produced;
9. voice session success;
10. bounded failure reason.

Failure reasons should be a small reviewed enum such as permission denied, unsupported, no speech, network/vendor, initialization, aborted/user stop, unknown. Do not log browser/vendor error strings verbatim if they can contain uncontrolled data.

### Voice frequency vs success

Recognition may produce multiple final results for one voice start. Therefore:

- `voice session success` / `produced Urdu ÷ voice tries` uses unique attempts/sessions;
- repeated final recognition commits may be shown as `final results per start` or equivalent;
- repeated final results must not be labelled a success rate.

## Funnel 3 — Contextual continuation

1. recommendation eligible;
2. recommendation shown;
3. recommendation selected;
4. handoff stored/created when applicable;
5. destination loaded/ready;
6. payload accepted/restored where applicable;
7. destination meaningful start;
8. destination outcome where already measurable.

Recommendation ID must be a stable enum; never derive it from user text.

Minimum dimensions while legacy/v2 or other independent paths coexist:

- recommendation ID;
- source workspace;
- destination workspace;
- path/version;
- release marker.

### Continuation step semantics

- `destination_ready` means the destination workspace is actually initialized/able to accept the handoff, not merely that navigation started.
- `payload restored` is applicable only to journeys that carry payload; a no-payload journey is N/A, not failure.
- `meaningful start` means destination-task interaction beyond page load.
- A click alone must never be called handoff success.
- If two implementation paths emit the same conceptual state, they must be safely deduplicated or separated by path/version before aggregate conversion is calculated.

## Funnel 4 — Growth requests

For each request family (`keep`, `share`, `community_publish`):

- eligible;
- shown;
- clicked/opened;
- completed;
- dismissed/cancelled when useful;
- suppressed_due_to_arbitration.

This allows us to determine whether arbitration is reducing clutter without making high-value actions undiscoverable.

Minimum bounded dimensions:

- request family;
- workspace;
- writer state/depth bucket;
- signed-in state as an anonymous bounded boolean/state;
- suppression winner/reason when applicable;
- release/experiment marker.

Do not send account identifiers or writing content in product-event payloads.

## Funnel 5 — Share referral

1. public reader view;
2. recipient CTA impression;
3. recipient CTA click;
4. destination ready;
5. referral context recognized;
6. referred first input/start;
7. referred meaningful start;
8. referred publish/share completion if produced.

Do not expose public share IDs in the product dashboard. Aggregate by source type (share page/community publication) and destination workspace.

## Funnel 6 — Card Studio

1. studio visit;
2. role/preset choice if applicable;
3. text entered/imported;
4. first canvas change;
5. export controls reached/visible if reliably observable;
6. export attempted;
7. export completed;
8. quick/advanced mode.

### Card branch semantics

Quick and Advanced paths may legitimately bypass different UI steps. Before calculating a sequential conversion, define whether each step is:

- common prerequisite;
- Quick-only;
- Advanced-only;
- optional.

Do not divide a downstream all-path event count by a branch-only step and call the result a conversion rate.

## Product Pulse views required

### Activation

Show count + conversion for each first-value step, with desktop/mobile split.

### Serious writing

Show 0 / 1–20 / 21–50 / 51–100 / 101–250 / 251–500 / 501–1000 / 1001–2500 / 2500+ or a compatible stable grouping. Preserve comparison with the 2026-08-30 baseline.

### Continuation

Show recommendation impressions, clicks, destination starts and destination outcomes. Do not call raw click rate `handoff success`.

When multiple handoff implementations coexist, expose path/version or report only a safely consolidated unique-state funnel.

### Growth

Show Keep / Share / Community prompt eligibility, impressions and completions plus arbitration suppressions.

### Voice

Show exposed -> try -> permission -> listening -> Urdu success and failure mix.

Keep repeated final-recognition frequency in a separately named event-per-start metric.

### Share loop

Show publish -> view -> CTA -> destination ready -> referred start -> meaningful start -> republish.

### Card Studio

Show visit -> content -> edit -> export attempt -> export complete, split Quick/Advanced when relevant.

Do not imply `export controls reached` is a universal prerequisite unless code inspection proves it is common to both paths.

## Data-quality checks

- Counts should obey funnel ordering where steps are single-occurrence session states; document exceptions where repeated events are allowed.
- A metric called `success rate` must use unique eligible attempts/sessions so it cannot exceed 100%.
- A metric called `conversion` must use compatible eligible/converted populations from the same path semantics.
- Repeated recognition-final events should be named `final results per start` or similar, not `final-speech rate`.
- Dashboard footnotes must state when counts are anonymous aggregate/browser-session signals and not people/accounts.
- Missing eligibility denominators must block confident conversion claims.
- Optional branch steps must not be used as denominators for all-path downstream events.
- Legacy/v2 path mixing must be explicitly separated or deduplicated before aggregate funnel rates are trusted.
- Every materially changed funnel requires a bounded release marker so the first clean post-change window is identifiable.

## 2026-09-06 repair trigger

The 2026-09-06 Product Pulse snapshot showed concrete violations of the intended semantics, including first-input/outcome ratios above 100%, a Card Studio downstream count divided by a narrower branch step, and continuation restore counts exceeding destination-ready counts across independent handoff paths.

These observations activate **Slice 0** of `WU-PLAT-002H-CONVERSION-REPAIR.md`. The fix is measurement normalization first, not a cosmetic dashboard clamp. Do not merely cap percentages at 100%; correct the numerator/denominator/path semantics.