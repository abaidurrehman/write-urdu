# WU-PLAT-002H — Metrics Contract

This document defines the minimum measurement contract for the core activation programme. It is not an event naming mandate; implementation should reuse existing analytics names where semantically equivalent.

## Principles

- No writing, speech transcript, selected text, filename, document ID or share ID in product telemetry.
- Count users only through the privacy-safe aggregate/session mechanisms already approved by WriteUrdu.
- Measure state transitions, not semantic content.
- A click is an intermediate event, not the final success event when a downstream task exists.
- Rates must have clear denominators and must not exceed 100% unless explicitly named as an event-per-start ratio rather than a success rate.

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

## Funnel 3 — Contextual continuation

1. recommendation shown;
2. recommendation selected;
3. handoff stored/created;
4. destination loaded/ready;
5. payload accepted/restored where applicable;
6. destination meaningful start;
7. destination outcome where already measurable.

Recommendation ID must be a stable enum; never derive it from user text.

## Funnel 4 — Growth requests

For each request family (`keep`, `share`, `community_publish`):

- eligible;
- shown;
- clicked/opened;
- completed;
- dismissed/cancelled when useful;
- suppressed_due_to_arbitration.

This allows us to determine whether arbitration is reducing clutter without making high-value actions undiscoverable.

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

## Product Pulse views required

### Activation

Show count + conversion for each first-value step, with desktop/mobile split.

### Serious writing

Show 0 / 1–20 / 21–50 / 51–100 / 101–250 / 251–500 / 501–1000 / 1001–2500 / 2500+ or a compatible stable grouping. Preserve comparison with the 2026-08-30 baseline.

### Continuation

Show recommendation impressions, clicks, destination starts and destination outcomes. Do not call raw click rate `handoff success`.

### Growth

Show Keep / Share / Community prompt eligibility, impressions and completions plus arbitration suppressions.

### Voice

Show exposed -> try -> permission -> listening -> Urdu success and failure mix.

### Share loop

Show publish -> view -> CTA -> destination ready -> referred start -> meaningful start -> republish.

### Card Studio

Show visit -> content -> edit -> export attempt -> export complete, split Quick/Advanced when relevant.

## Data-quality checks

- Counts should obey funnel ordering where steps are single-occurrence session states; document exceptions where repeated events are allowed.
- A metric called `success rate` must use unique eligible attempts/sessions so it cannot exceed 100%.
- Repeated recognition-final events should be named `final results per start` or similar, not `final-speech rate`.
- Dashboard footnotes must state when counts are anonymous aggregate/browser-session signals and not people/accounts.
- Missing eligibility denominators must block confident conversion claims.
