# WU-VOICE-PLAT-001A — Shared Voice + Unified Input Engine

**Parent:** `WU-VOICE-PLAT-001`  
**Status:** Planned — implementation Slice A  
**Priority:** P0 foundation  
**Scope:** shared speech core, unified target adapters, compatibility migration, dedicated Voice Typing parity  
**Do not include:** broad workspace rollout, SEO page creation, social-specific UI

---

## 1. Goal

Create one reusable input foundation that can safely power Voice inside existing Write Urdu workspaces while preserving the current Roman-English-to-Urdu and direct Urdu behavior.

Slice A must prove:

```text
existing voice route
        ↓
shared voice core
        ↓
shared target adapter
        ↓
editable text state
```

without changing the user-facing behavior of `/tools/urdu-voice-typing` except where a clearly beneficial parity bug is found.

The slice is intentionally infrastructure-first. Do not add microphone buttons across Instagram, Card Studio, Rich Editor and other pages in the same PR.

---

## 2. Read before implementation

Mandatory contracts:

```text
specs/WU-VOICE-PLAT-001-unified-urdu-input-platform.md
specs/WU-TOOLS-EXPANSION-004-urdu-voice-typing.md
specs/WU-GROWTH-003-urdu-voice-typing-growth-seo.md
specs/WU-PLAT-002-v2-product-journey-workspace-handoffs.md
specs/WU-I18N-001-crawlable-urdu-locale.md
```

Inspect current implementation before deciding filenames/API:

```text
js/urdu-voice-typing.js
js/input-mode.js
main.js
js/product-telemetry.js
js/text-handoff.js
locale/ur.js
tools/urdu-voice-typing.html
urdu/tools/urdu-voice-typing.html
```

---

## 3. Existing behavior that must survive

The current Voice Typing contract already has valuable behavior. Preserve it:

- `SpeechRecognition` and `webkitSpeechRecognition` feature detection;
- `ur-PK` recognition language;
- explicit user action before permission;
- interim vs final results;
- no duplicate committed fragments;
- Start / Stop / Clear;
- permission-denied recovery;
- no-speech/audio/network/language/aborted error handling;
- editable result;
- copy / cleaner / editor handoffs;
- visibility/unload stop behavior;
- English and Urdu UI state;
- privacy-safe telemetry;
- unsupported-browser fallback;
- no audio/transcript storage by Write Urdu.

Refactoring does not justify changing these semantics casually.

---

## 4. Target architecture

### 4.1 Speech core

Prefer a small reusable module such as:

```text
js/voice-input-core.js
```

Suggested public API shape:

```js
var controller = WriteUrduVoiceInput.create({
  lang: 'ur-PK',
  interimResults: true,
  continuous: true,
  onState: function (state) {},
  onInterim: function (text) {},
  onFinal: function (text) {},
  onError: function (category) {}
});

controller.isSupported();
controller.start();
controller.stop();
controller.abort();
controller.destroy();
```

The exact API may differ after code inspection. Keep it small and browser-native.

The core must not know route-specific DOM selectors, workspace IDs, Card Studio, copying, exporting or navigation.

### 4.2 Generic target adapter

Create/establish a target contract capable of inserting final speech into an existing editable owner state.

For a textarea/input, insertion must:

1. read `selectionStart` / `selectionEnd` where available;
2. replace selected text or insert at caret;
3. preserve prefix/suffix;
4. add minimal joining whitespace only where needed;
5. update selection after the inserted segment;
6. dispatch the normal `input` event;
7. focus the target where appropriate.

Do not implement semantic punctuation rewriting.

Suggested testable pure helper:

```js
insertTextAtSelection(value, start, end, insertion)
```

returning:

```text
value
selectionStart
selectionEnd
```

This helper should be unit tested independently of browser SpeechRecognition.

### 4.3 Unified input orchestration

Establish the contract that later slices can mount:

```text
roman
 direct
 voice
```

Do not rewrite the current transliteration engine.

`js/input-mode.js` currently owns Roman/direct UI and per-workspace preference. Decide after inspection whether to:

- extend it carefully; or
- add `js/unified-urdu-input.js` that composes it.

Preferred separation:

```text
input-mode.js
    Roman/direct compatibility and transliteration enabling/disabling

voice-input-core.js
    speech lifecycle

unified-urdu-input.js
    method chooser + target adapter + voice insertion
```

Reject a design where `input-mode.js` grows into a large speech + Card Studio + analytics controller.

---

## 5. Voice method state model

Voice is an input method but capture is still an explicit action.

Logical states:

```text
unsupported
idle
ready
requesting/starting
listening
hearing/interim
stopped/text-ready
permission-blocked
error
```

Selecting Voice does not equal `start()`.

The shared UI layer may remember that Voice was last selected but must remain idle after reload.

---

## 6. Final result insertion behavior

### 6.1 Current target, not route-specific transcript

The reusable core emits final text. The adapter inserts it.

For the standalone Voice Typing page, adapt `#voiceTranscript` through the generic textarea adapter so the route proves the shared mechanism.

### 6.2 Minimal joining

Speech engines may omit surrounding whitespace. Use a deterministic helper.

Expected examples:

```text
existing: ""
spoken:   "السلام علیکم"
result:   "السلام علیکم"

existing: "آج موسم"
caret: end
spoken: "بہت اچھا ہے"
result: "آج موسم بہت اچھا ہے"

existing: "آج موسم اچھا ہے"
selection: "اچھا"
spoken: "بہت اچھا"
result: "آج موسم بہت اچھا ہے"
```

Do not double-space intentionally user-authored text elsewhere.

### 6.3 Manual edits win

A user may edit while not listening or between recognition events.

Final insertion must use the target's current value/selection at commit time, not a stale copy captured when recognition started.

No final result may reset the target to a session-start snapshot.

### 6.4 Interim text

Interim text remains outside committed target content.

A small `Listening…` / transient phrase area is acceptable. Clear it after final/end.

---

## 7. Events and telemetry integration

The core itself should prefer callbacks/custom events over direct network telemetry.

Allowed shared events may include:

```text
write-urdu:voice-support
write-urdu:voice-state
write-urdu:voice-final
write-urdu:input-method-change
```

Do not put recognized text in a globally observed analytics event.

If an internal DOM event needs final text for the owning adapter, ensure the analytics layer never serializes that event detail. Prefer direct callback wiring where possible.

The route/workspace layer may emit bounded existing telemetry such as method/workspace/success.

---

## 8. Dedicated Voice Typing route migration

Refactor `/tools/urdu-voice-typing` to use the shared core without changing its product role.

Keep:

- its editable text result;
- standalone start/stop controls;
- copy/clean/editor actions;
- voice-specific help/SEO content;
- current route/canonical;
- Urdu counterpart;
- existing voice analytics semantics.

Do not turn the dedicated route into the new three-mode UI if that harms its focused search job. The route is the Voice destination; its transcript remains the correct primary surface there.

The purpose of migrating it in Slice A is to prove the shared core before embedding elsewhere.

---

## 9. Backward compatibility

Slice A must not require all existing pages to adopt new markup immediately.

Requirements:

- existing `[data-input-mode-control]` Roman/direct controls continue working;
- existing stored `roman` / `direct` preferences remain readable;
- existing Ctrl/Cmd+G behavior remains unless intentionally superseded in a later UI decision;
- pages without voice integration do not load/request microphone unnecessarily;
- unsupported browsers do not receive runtime errors merely because the shared module exists.

---

## 10. Accessibility

The shared voice core/UI contract must support:

- accessible Start/Stop labels;
- text-based state;
- polite status announcements for state/errors, not every interim token;
- keyboard activation;
- focus preservation/return;
- no color-only listening indicator.

Route adapters may choose presentation but must preserve semantics.

---

## 11. Lifecycle and cleanup

Shared core must stop/abort safely on:

- explicit Stop;
- page hide/background behavior required by `WU-TOOLS-EXPANSION-004`;
- navigation/unload;
- controller destroy/unmount;
- target becoming invalid where practical.

Do not leave recognition running after a workspace is replaced/navigated.

---

## 12. Tests

### 12.1 Pure/unit

Add coverage for:

- selection replacement;
- caret insertion;
- beginning/middle/end insertion;
- empty target;
- minimal whitespace joining;
- Urdu + English mixed text preserved;
- manual target edits are used at final commit;
- no semantic rewriting.

### 12.2 Recognition controller

Mock `SpeechRecognition` / `webkitSpeechRecognition` and verify:

- feature detection;
- no construction/start side effect requiring permission on import/load;
- `lang = ur-PK`;
- interim callback separate from final callback;
- final result emitted exactly once;
- stop/abort lifecycle;
- bounded errors;
- destroy cleanup.

### 12.3 Voice route parity

Existing contract/browser coverage must still pass.

Add explicit regression proving the dedicated route now uses shared core/adapter without changing its visible behavior.

### 12.4 Privacy

Static/contract test should fail if shared telemetry sends:

- transcript;
- `event.results` content;
- recognized word strings;
- audio blobs.

---

## 13. Acceptance checklist

- [ ] Shared voice core exists and is route-agnostic.
- [ ] Generic textarea/input insertion adapter/helper exists.
- [ ] Existing dedicated voice route uses the shared core.
- [ ] Existing voice states/errors/handoffs remain behaviorally compatible.
- [ ] Roman/direct input remains unchanged on non-migrated routes.
- [ ] No microphone permission is requested on load.
- [ ] Interim recognition is not committed to target content.
- [ ] Final recognition inserts at current caret/selection.
- [ ] Manual edits survive subsequent speech commits.
- [ ] No transcript/audio enters telemetry.
- [ ] English + Urdu locale state remains correct on dedicated voice routes.
- [ ] Unsupported browser fallback remains usable.
- [ ] No new database/backend/API provider is introduced.
- [ ] Tests and repository quality gates pass.

---

## 14. Verification

Run at minimum:

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

Also run focused voice tests and the physical-device checklist when recognition lifecycle/control behavior changed materially.

If full browser suite has an unrelated pre-existing failure, isolate and document it rather than hiding it; all Slice A focused coverage must still be green.

---

## 15. PR boundary

One PR should implement Slice A only.

The PR must explain:

1. what code was extracted;
2. how duplicate voice logic was avoided;
3. the shared target/insertion API;
4. how the dedicated route was migrated;
5. backward compatibility for Roman/direct pages;
6. test results;
7. any real-device validation performed;
8. which later workspaces are intentionally not yet wired.

Do not add Instagram/Card/Rich/Name Art microphone UI in this PR.
