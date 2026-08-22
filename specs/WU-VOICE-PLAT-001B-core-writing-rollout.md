# WU-VOICE-PLAT-001B — Core Writing Rollout

**Parent:** `WU-VOICE-PLAT-001`  
**Depends on:** `WU-VOICE-PLAT-001A`  
**Status:** Planned — implementation Slice B  
**Priority:** P1 after shared engine foundation  
**Primary routes:** `/`, `/urdu-editor`, `/urdu-keyboard`  
**Continuity surface:** `/my-documents` where creation shortcuts exist

---

## 1. Goal

Make the shared three-way Urdu input model available in the core writing experience:

```text
English letters → Urdu
Type Urdu directly
Speak Urdu
```

All three methods operate on the same editable document/text state.

The core writing rollout exists to prove that Voice is a genuine input method rather than a separate tool handoff.

---

## 2. Preconditions

Do not start Slice B until Slice A has:

- one shared recognition core;
- stable generic target insertion;
- dedicated voice route parity;
- no-permission-on-load contract;
- green focused tests.

If Slice A APIs need a small correction while integrating the first real workspace, keep the correction generic and add regression tests. Do not fork a Basic-Writer-specific voice engine.

---

## 3. Product rules

### 3.1 One real document state

Each workspace keeps its existing document owner.

Voice final results insert into that owner state directly.

No intermediate transcript field may be introduced for the user to copy/import.

### 3.2 Correction flow is mandatory

Every migrated core writer must pass:

```text
Speak → final Urdu → stop → switch to English letters → correct word → speak again
```

and:

```text
Speak → final Urdu → stop → direct Urdu correction → speak again
```

without losing earlier text/corrections.

### 3.3 Voice must not dominate existing search intent

This is a product capability rollout, not a metadata rewrite.

- `/` remains `English to Urdu Typing Online` owner.
- `/urdu-keyboard` remains direct keyboard owner.
- `/urdu-editor` remains rich document/editor owner.

Do not alter canonical URLs or create voice variants of these routes.

---

## 4. Basic Writer — `/`

### 4.1 UX placement

Integrate Voice into the existing input-method area in a compact form.

Preferred user-visible model:

```text
Input method
[ English letters → Urdu ] [ Type Urdu directly ] [ 🎤 Speak Urdu ]
```

On narrow mobile widths, a compact segmented/overflow-safe treatment is acceptable.

Hard rule: do not push the actual writing canvas below the existing mobile task-first threshold merely to display a large microphone card.

The existing dedicated Voice discovery entry can remain where useful, but avoid duplicate voice CTAs in the same viewport.

### 4.2 Target

Voice targets the same main Basic Writer textarea/document state used by normal writing.

Final speech:

- inserts at current caret/selection;
- dispatches the same normal input event path;
- updates Copy/Share/Export readiness naturally;
- preserves current text and scroll position where possible.

### 4.3 Roman correction

When the user chooses English letters → Urdu after speaking:

- existing voice-produced Urdu remains untouched;
- existing transliteration behavior activates for new Roman input;
- user can select/replace a mistaken word naturally;
- later voice input inserts into the newly corrected state.

Do not run already recognized Urdu through transliteration.

### 4.4 Direct correction

Direct mode continues to allow Urdu/English paste/type with conversion off.

Switching Voice → Direct must not clear or change direction/language incorrectly.

### 4.5 Voice status

Use a compact state near the mic/input chooser:

- Ready;
- Listening…;
- Text added / stopped;
- Permission blocked;
- Voice unavailable.

Do not turn the homepage into the full standalone voice interface.

---

## 5. Rich Editor — `/urdu-editor`

### 5.1 Target ownership

Voice must insert into the actual Rich Editor document at the current selection/caret.

Do not create a plain voice transcript below/above the rich editor and then import it.

### 5.2 Adapter

Implement/reuse a Rich/contenteditable adapter capable of:

- reading current selection/range;
- replacing selected text;
- inserting a text node/string at caret;
- preserving surrounding formatting where the editor normally would;
- placing caret after insertion;
- triggering the editor's dirty/autosave/document change flow;
- preserving current manual edits.

If the editor is iframe-based, selection access and same-origin lifecycle must be handled explicitly.

### 5.3 Formatting and undo

The voice insertion should behave as closely as practical to ordinary typed text.

Requirements:

- do not reset document HTML;
- do not replace the full editor body merely to insert a final phrase;
- do not strip formatting from unrelated content;
- avoid interim updates in the editor body;
- preserve undo/redo semantics where the current editor makes this feasible.

### 5.4 Method UI

Rich Editor may reuse the same shared chooser but should respect its existing command hierarchy.

Voice belongs near input/writing controls, not export/layout controls.

---

## 6. Urdu Keyboard — `/urdu-keyboard`

### 6.1 Search/product ownership

Direct keyboard remains the dominant page purpose.

Voice must be visibly available but secondary to:

- on-screen Urdu keys;
- physical keyboard guidance/input;
- direct character entry.

Do not change H1/title to make voice the page's primary promise.

### 6.2 Shared text state

Voice inserts into the same writing target used by direct keyboard input.

After speaking, a user can immediately:

- tap an Urdu key;
- type on physical keyboard;
- switch to English letters → Urdu if the page supports the shared mode;
- move caret and correct text.

### 6.3 Keyboard state

Voice start/stop must not unexpectedly:

- clear keyboard modifier state;
- delete text;
- reset selection;
- scroll the keyboard offscreen on mobile without need.

---

## 7. My Documents — `Start with voice`

My Documents remains a continuity surface, not a fourth editor.

If My Documents exposes creation shortcuts, add a bounded action such as:

```text
Start with voice
```

that opens/creates through the appropriate owning writing workspace.

Rules:

- no microphone permission on My Documents page load;
- do not create a second document editor inside the list solely for voice;
- route/draft creation follows current account/document contract;
- unsaved/anonymous behavior remains supported where the owning writer supports it.

This can be deferred if the current My Documents creation architecture is not ready; do not block the core writer rollout.

---

## 8. Shared UI rules

### 8.1 Labels

English:

```text
English letters → Urdu
Type Urdu directly
Speak Urdu
Start voice typing
Stop voice typing
Listening…
```

Urdu:

```text
انگریزی حروف → اردو
براہِ راست اردو لکھیں
بول کر اردو لکھیں
آواز سے لکھنا شروع کریں
آواز سے لکھنا روکیں
سن رہا ہے…
```

### 8.2 Unsupported browser

If Voice is unavailable:

- keep Roman/direct controls active;
- disable/hide mic in an accessible way;
- provide a concise explanation only when useful;
- do not show a broken persistent error banner across every writer.

### 8.3 Multiple writers on one page

If a page ever contains more than one editable target, Voice must be explicitly bound to the active/labelled target. Never write to whichever element happens to match the first selector.

---

## 9. Mobile acceptance

Core writers are high-frequency mobile surfaces.

Required checks on common phone layout and at least the existing Pixel 5 automated target:

- writer/canvas remains immediately discoverable;
- mic target is comfortably tappable;
- segmented input chooser does not overflow;
- permission prompt only follows tap;
- software keyboard opening/closing does not hide Stop state irrecoverably;
- listening state does not cause layout jump;
- long text remains scrollable/editable;
- rotate/background/return preserves committed text;
- unsupported browser retains manual input.

Physical-device voice sign-off follows `WU-TOOLS-EXPANSION-004` for iPhone Safari and Android Chrome whenever this rollout changes real mic interaction.

---

## 10. Telemetry

Use existing product analytics, bounded to method/workspace/outcome.

Potential dimensions/events:

```text
workspace: basic_writer | rich_editor | urdu_keyboard
input_method_selected: roman | direct | voice
voice_started
voice_final_received
input_method_switched
```

Useful sequence measurement:

```text
voice_final_received
  → voice_to_roman_switch
  → copy/export/share
```

The switch is a correction/continuation proxy only. Never send the corrected word or document content.

Do not create a new telemetry endpoint/database.

---

## 11. Locale/generation impact

The Basic Writer, Keyboard and Rich Editor are part of the Urdu locale Phase 1 corpus.

If their source markup/shared controls change:

- update `locale/ur.js`/shared localized strings;
- regenerate deterministic Urdu artifacts;
- update literal replacement rules if necessary;
- run `locale:check`;
- verify `/urdu/`, `/urdu/urdu-keyboard`, `/urdu/urdu-editor` initial/runtime UI.

Do not create a separate Urdu-only voice implementation.

---

## 12. Ads and account prompts

- No ad inside the input-mode/mic/writing surface.
- Preserve current post-workspace monetization boundaries.
- Voice never requires sign-in.
- Account save prompts remain after useful work, not before mic permission.

---

## 13. Acceptance tests

### Basic Writer

- [ ] Voice option available on supported browser.
- [ ] No permission on page load.
- [ ] Final speech inserts at caret.
- [ ] selection replacement works.
- [ ] Voice → Roman correction → Voice preserves text.
- [ ] Voice → Direct correction → Voice preserves text.
- [ ] Copy/Share/Export sees the final edited state.
- [ ] mobile task-first layout remains within existing quality gate.

### Rich Editor

- [ ] Final speech inserts at rich selection/caret.
- [ ] unrelated formatting remains intact.
- [ ] selected text can be replaced.
- [ ] manual edit survives later voice segment.
- [ ] document dirty/save state updates through normal path.

### Urdu Keyboard

- [ ] direct keyboard remains primary.
- [ ] voice writes into same target.
- [ ] on-screen/physical key correction works after voice.
- [ ] unsupported voice does not impair keyboard.

### Shared

- [ ] no transcript/audio telemetry.
- [ ] locale labels work.
- [ ] no canonical/title/H1 ownership regressions.
- [ ] no extra database/backend.

---

## 14. Verification

Run:

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

Add focused Playwright coverage for desktop + mobile for each migrated writer.

Also record physical-device voice results when required by the parent voice behavior contract.

---

## 15. PR strategy

Prefer at least two implementation PRs if the Rich Editor adapter is materially different:

1. Basic Writer pilot + shared UI hardening;
2. Rich Editor + Urdu Keyboard rollout.

Do not mix social/Card/Name Art rollout into this slice.
