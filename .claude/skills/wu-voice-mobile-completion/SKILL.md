# WU Voice + Mobile Completion

Use this skill for any implementation request that references:

- `WU-PLAT-002H-VOICE-MOBILE-COMPLETION-UX`
- mobile writing-mode convergence
- Type/Speak convergence in Basic Writer
- post-writing Copy/Share/Download dock
- contextual Card Studio continuation under the P0 activation programme
- export-funnel repair owned by this child contract

## Canonical implementation skill

Read and follow:

`skills/voice-mobile-completion-ux/SKILL.md`

Do not implement from this wrapper alone.

## Required parent context

The work is a child of the existing `WU-PLAT-002H` epic, not a new independent UX redesign.

The canonical child contract is:

`specs/WU-PLAT-002H-VOICE-MOBILE-COMPLETION-UX.md`

Also obey the existing mobile, metrics, adaptive-command, Voice, share and handoff contracts referenced by the canonical skill.

## Default execution rule

When the user says “start”, “implement”, “continue” or gives this skill without naming a slice:

1. inspect current `main` and open PR overlap;
2. read the canonical skill and all **Read first** files;
3. determine the first incomplete slice from the actual runtime/spec state;
4. if no later slice has been explicitly approved, start with **Slice 0 only**;
5. keep the PR bounded to that slice;
6. run focused + applicable repository checks;
7. report what remains deliberately deferred.

## Non-negotiable UX rule

> The editor is the product. Voice is an input mode. Copy/Share/Download are outcomes. Card/Rich/Keep/Publish are contextual continuations.

Do not add a new toolbar/promo layer on top of existing owners.

## Non-negotiable privacy rule

No typed text, speech transcript, audio, selected text, filename, document/share/community IDs or account identity belongs in Product Pulse telemetry.

## First-pass command

> Read `skills/voice-mobile-completion-ux/SKILL.md`, then implement Slice 0 only from `specs/WU-PLAT-002H-VOICE-MOBILE-COMPLETION-UX.md`. Reconcile the current shipped mobile/Voice/completion/export/Card state and event semantics, add only missing bounded measurement/tests, avoid material visual redesign unless a blocking production defect is reproduced, and stop before Slice 1.
