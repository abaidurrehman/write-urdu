# WU Unified Urdu Input — Workspace Rollout Skill

Use this skill for `WU-VOICE-PLAT-001B` and `WU-VOICE-PLAT-001C` after Slice A is merged and green.

## Mission

Mount the shared Urdu input system into existing owner workspaces without creating route-specific speech engines or separate transcript/import flows.

The user must be able to:

```text
Speak → edit/correct with English letters → Urdu → edit directly → speak again
```

on the same owning text/document state.

## Mandatory reading

```text
specs/WU-VOICE-PLAT-001-unified-urdu-input-platform.md
specs/WU-VOICE-PLAT-001A-shared-input-engine.md
specs/WU-VOICE-PLAT-001B-core-writing-rollout.md
specs/WU-VOICE-PLAT-001C-create-social-rollout.md
specs/WU-TOOLS-EXPANSION-004-urdu-voice-typing.md
specs/WU-PLAT-002-v2-product-journey-workspace-handoffs.md
```

Then read every touched workspace's owner spec.

## Preconditions

Confirm current main already has:

- shared voice core;
- generic target insertion;
- dedicated Voice Typing route migrated to shared core;
- focused Slice A tests green.

If not, implement/fix Slice A first. Do not bypass it with local route code.

## Rollout approach

### Core writers

Preferred sequence:

1. Basic Writer pilot.
2. Rich Editor adapter.
3. Urdu Keyboard.
4. My Documents `Start with voice` only if current creation flow supports it naturally.

Protect existing SEO ownership and mobile task-first layout.

### Creation/social

Preferred sequence:

1. Card Studio selected/main text adapter.
2. Instagram + WhatsApp Status reuse of Card Studio architecture.
3. Stylish Urdu source field.
4. Name Art short-text field.

Do not write a second social speech controller.

## Target ownership

For each workspace, document before coding:

```text
workspace id
real editable owner state
caret/selection model
normal input/update signal
persistence owner
preview/render update path
voice target when multiple fields/layers exist
```

If target ownership is ambiguous, fix that design before adding Voice.

## Multiple fields/layers

Prefer target captured when Start is tapped.

If target changes during listening, stop/restart rather than unpredictably moving one session between fields.

Examples:

- Card Studio: selected text layer / documented main text.
- Instagram: post text and caption must have separately labelled voice targets.
- Rich Editor: current selection/caret.

## UI rules

Use compact simple labels:

```text
English letters → Urdu
Type Urdu directly
Speak Urdu
```

Voice selection does not start mic automatically.

Mic state must be visible and accessible.

Do not add large redundant voice cards inside dense workspaces if a compact method control is enough.

## Correction acceptance

Every migrated workspace must demonstrate at least one automated flow equivalent to:

```text
voice final text
→ select/move caret
→ switch to Roman
→ correct a word
→ switch back to Voice
→ append more speech
→ prior correction remains
```

and direct Urdu correction where the workspace supports direct input.

## Existing owner behavior wins

Voice is only an input source.

Do not change:

- Card Studio renderer/model ownership;
- social safe areas/export/manual-post boundaries;
- Stylish catalogue logic;
- Name Art templates/rendering;
- Basic Writer SEO owner;
- Keyboard direct-input owner;
- Rich Editor export/formatting owner;
- persistence model.

## Privacy/analytics

Only bounded method/workspace/outcome metadata.

Never send content.

Reuse existing Product Pulse/telemetry paths.

No new DB/sink.

## Locale

Update shared English/Urdu labels and deterministic generated Urdu artifacts for affected Phase 1 routes.

Run `locale:check`.

## SEO

Do not create voice variants of existing product routes.

Do not change canonical/title/H1 merely because Voice is added.

Truthful below/near-workspace copy may mention Voice after implementation is live.

## Mobile/real-device

Run desktop + mobile Playwright for each migrated route.

Because real speech/permissions cannot be proven by emulation, execute the physical-device checklist from `WU-TOOLS-EXPANSION-004` on the first embedded rollout and after material shared mic changes.

## Required checks

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

Also run focused owner tests for Card/social/Stylish/Name Art/core writers.

## PR boundaries

Keep PRs diagnosable.

Recommended:

```text
PR 1: Basic Writer pilot
PR 2: Rich + Keyboard
PR 3: Card Studio pilot
PR 4: Instagram + WhatsApp Status
PR 5: Stylish + Name Art
```

Consolidate only when actual code reuse makes a grouping genuinely low risk.

Each PR lists:

- target state;
- shared adapter reused/added;
- correction flow evidence;
- locale/SEO impact;
- telemetry/privacy impact;
- automated tests;
- physical device evidence if applicable.
