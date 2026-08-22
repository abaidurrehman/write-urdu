# Unified Urdu Input Platform Implementation Skill

Use this skill when implementing `WU-VOICE-PLAT-001 — Unified Urdu Input Platform` or any of its slices.

## Read first

Always read the relevant slice plus these governing contracts before changing code:

```text
specs/WU-VOICE-PLAT-001-unified-urdu-input-platform.md
specs/WU-TOOLS-EXPANSION-004-urdu-voice-typing.md
specs/WU-GROWTH-003-urdu-voice-typing-growth-seo.md
specs/WU-PLAT-002-v2-product-journey-workspace-handoffs.md
specs/WU-I18N-001-crawlable-urdu-locale.md
```

Then read the owner spec for every workspace you touch, especially:

```text
specs/WU-SM-001-social-status-and-instagram-makers.md
specs/WU-SUA-001-stylish-urdu-text-name-art.md
specs/WU-CS-UX-001-urdu-card-studio-guided-workflow.md (or current Card Studio owner)
specs/WU-PLAT-003-core-workspace-convergence.md
specs/WU-PLAT-004-basic-writer-command-toolbar.md
```

Search for the current owner if a filename changed. Do not assume an old implementation map is exact.

## Product invariant

The whole initiative is built around one rule:

> Voice, English letters → Urdu and direct Urdu edit the same user-owned text state.

Never implement embedded Voice as a second transcript box that must be copied/imported into the real field.

A user must be able to:

```text
Speak
→ edit/correct with English letters → Urdu
→ edit directly in Urdu
→ speak again
```

without losing existing text or manual corrections.

## Architecture invariant

Do not copy `js/urdu-voice-typing.js` into another route.

Extract/reuse one shared speech core and integrate workspaces through adapters.

Expected responsibility split:

```text
voice core
  - SpeechRecognition lifecycle
  - support detection
  - ur-PK
  - interim/final callbacks
  - bounded errors
  - cleanup

unified input layer
  - roman/direct/voice chooser
  - target adapter
  - voice insertion
  - method preference
  - state UI

workspace adapter
  - real field/model/caret
  - normal input/update events
  - owning product behavior
```

Exact filenames are implementation decisions after repo inspection.

## Never do these

- do not add a paid speech API;
- do not create a new database;
- do not upload/store audio;
- do not send transcript/user text to telemetry;
- do not place user text in URLs;
- do not request microphone permission on load;
- do not auto-start voice because Voice was last selected;
- do not run recognized Urdu through Roman transliteration;
- do not commit interim speech into the document repeatedly;
- do not reset the full editor/canvas to insert one phrase;
- do not create voice-specific clones of existing product routes;
- do not rewrite established canonical/title/H1 ownership merely to mention voice.

## Input-method behavior

### Roman / English letters → Urdu

Reuse the existing transliteration/input-mode behavior.

Do not rename internal engine identifiers merely to modernize terminology.

Public copy should stay simple: `English letters → Urdu`.

### Direct Urdu

Conversion is off for new typing/paste. Existing document text remains unchanged.

### Voice

Voice is selected as a method/affordance, but capture starts only after explicit mic action.

Final recognition inserts into the target's current state.

Interim recognition remains transient UI.

## Insertion rules

Where a caret/selection exists:

1. obtain current value/selection at final commit time;
2. replace current selection or insert at caret;
3. preserve surrounding text;
4. normalize only minimal joining whitespace;
5. place caret after insertion;
6. dispatch the owning editor's normal input/change update;
7. preserve manual edits from earlier in the session.

Never apply a stale session-start value over newer user edits.

## Multiple targets

If a workspace has multiple editable fields/layers, target ownership must be visible and deterministic.

Prefer:

- focused/selected text field or layer;
- capture target when Start is tapped;
- stop/restart if target changes during listening.

Do not write to the first matching selector.

## Slice discipline

### Slice A

Read:

```text
specs/WU-VOICE-PLAT-001A-shared-input-engine.md
```

Implement shared core + generic insertion + standalone Voice route parity only.

Do not roll out microphones across products.

### Slice B

Read:

```text
specs/WU-VOICE-PLAT-001B-core-writing-rollout.md
```

Integrate Basic Writer, Rich Editor and Urdu Keyboard in controlled PRs.

Protect their existing search ownership and mobile task-first layout.

### Slice C

Read:

```text
specs/WU-VOICE-PLAT-001C-create-social-rollout.md
```

Use Card Studio as the shared creation-model pilot, then reuse for Instagram/WhatsApp Status, then Stylish/Name Art.

Do not build a separate social speech engine.

### Slice D

Read:

```text
specs/WU-VOICE-PLAT-001D-growth-measurement.md
```

Measure voice-to-outcome, add truthful copy and WhatsApp-message continuation through existing product/share flows. Do not manufacture keyword pages.

## Files to inspect early

```text
js/urdu-voice-typing.js
js/input-mode.js
main.js
js/product-telemetry.js
js/text-handoff.js
js/workspace-handoff.js
js/workspace-journey-registry.js

js/card-studio.js
js/card-studio-core.js
js/social-maker-core.js
js/social-direct-workspace.js
js/social-direct-instagram.js
js/stylish-urdu-text.js
js/name-art.js

locale/ur.js
scripts/generate-urdu-locale.js
```

Also inspect the actual HTML/source fields and current tests for every touched route.

## Privacy and telemetry

Allowed bounded metadata may include:

```text
workspace_id
input_method
previous_input_method
voice support category
voice error category
completion/outcome kind
locale
```

Forbidden:

```text
audio
transcript
recognized words
user-edited text
names/messages/captions
raw SpeechRecognition results/errors
```

Use existing telemetry/Product Pulse paths. Do not create a voice-only network sink.

## SEO discipline

Keep owner routes stable.

Generic Urdu voice typing belongs to `/tools/urdu-voice-typing`.

Embedded Voice strengthens existing products but does not justify routes such as:

```text
/urdu-instagram-voice-typing
/voice-whatsapp-urdu
/voice-name-art
```

A new route requires a distinct user job and evidence under the existing SEO/growth contracts.

## Accessibility

Every mic integration needs:

- accessible Start/Stop label;
- listening/error text state;
- keyboard operation;
- sensible focus return;
- mobile touch target;
- no interim-token announcement spam;
- unsupported-browser fallback.

## Locale

All shared controls need English + Urdu copy.

URL owns language. Keep deterministic Urdu generation current for Phase 1 routes.

Never create a second Urdu-only implementation.

## Monetization/account boundaries

The mic + input chooser + target are active authoring UI.

No ads inside them.

No sign-in gate before Voice.

Save/account prompts may appear after useful writing through existing growth contracts.

## Testing

At minimum run:

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

Add focused tests for:

- permission not requested on load;
- support detection;
- `ur-PK`;
- interim vs final separation;
- caret insertion;
- selection replacement;
- Voice → Roman correction → Voice;
- Voice → Direct correction → Voice;
- manual edits survive later speech;
- unsupported fallback;
- locale labels;
- no transcript telemetry;
- owning workspace update/render after final speech.

When mic behavior/placement/lifecycle changes, execute the physical-device checklist from `WU-TOOLS-EXPANSION-004` on iPhone Safari and Android Chrome before broad compatibility claims.

## PR completion report

Every implementation PR should state:

1. slice implemented;
2. workspaces touched;
3. shared modules/adapters reused/added;
4. exact target state receiving final speech;
5. correction flow tested;
6. privacy/telemetry behavior;
7. locale impact;
8. automated checks;
9. physical-device validation if applicable;
10. later slices intentionally left out.

Do not claim the whole platform complete after one microphone pilot.
