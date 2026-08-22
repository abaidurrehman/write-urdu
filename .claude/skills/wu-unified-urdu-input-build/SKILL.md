# WU Unified Urdu Input — Shared Engine Build Skill

Use this skill for `WU-VOICE-PLAT-001A` only.

## Mission

Extract one reusable browser speech core and one generic text insertion/target contract, then migrate the existing dedicated Urdu Voice Typing route to prove parity.

Do **not** roll Voice into Card Studio, social makers, Rich Editor, Keyboard, Stylish Urdu or Name Art in this slice.

## Mandatory reading

```text
specs/WU-VOICE-PLAT-001-unified-urdu-input-platform.md
specs/WU-VOICE-PLAT-001A-shared-input-engine.md
specs/WU-TOOLS-EXPANSION-004-urdu-voice-typing.md
specs/WU-GROWTH-003-urdu-voice-typing-growth-seo.md
```

## Inspect before editing

```text
js/urdu-voice-typing.js
js/input-mode.js
tools/urdu-voice-typing.html
urdu/tools/urdu-voice-typing.html
js/product-telemetry.js
js/text-handoff.js
locale/ur.js
scripts/generate-urdu-locale.js
```

## Build rules

### Speech core

The shared core owns:

- `SpeechRecognition` / `webkitSpeechRecognition` detection;
- `ur-PK` configuration;
- Start/Stop/Abort/Destroy;
- listening/interim/final state callbacks;
- bounded error categories;
- page lifecycle cleanup.

It does not own route DOM, copy/export/handoffs or Card Studio.

### Target insertion

Implement a testable adapter/helper that inserts final speech into **current** target value and selection.

Requirements:

- replace selection or insert at caret;
- preserve prefix/suffix;
- minimal whitespace joining only;
- caret after inserted phrase;
- normal `input` event/update;
- no stale session-start snapshot;
- manual edits survive later speech.

### Interim

Keep interim speech transient. Do not write it repeatedly into committed target content.

### Permission

No microphone request on module import, DOMContentLoaded, mode restore or page load. Only explicit Start tap.

### Compatibility

Existing Roman/direct controls keep working unchanged on pages not migrated.

Do not invalidate old `roman`/`direct` localStorage preferences.

## Dedicated route parity

Refactor `/tools/urdu-voice-typing` and its Urdu counterpart to use the shared core/adapter.

Preserve:

- current focused Voice product role;
- editable transcript/result;
- status/errors;
- copy/clean/editor actions;
- telemetry semantics;
- canonical/SEO ownership;
- Urdu localization.

The standalone Voice route does not need to become a three-mode writer in Slice A.

## Tests

Add focused coverage for:

```text
support detection
ur-PK
no start on load
interim != committed text
final emitted once
caret insertion
selection replacement
manual edit preserved
stop/abort/destroy
permission/no-speech/network errors
no transcript telemetry
standalone route parity
```

Run:

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

If the full browser suite has an unrelated pre-existing timeout, document it precisely; focused Slice A tests must be green.

## Finish

Open one PR for Slice A.

PR summary must clearly state that later workspace microphone rollout is intentionally out of scope.
