# WU-VOICE-PLAT-001 — Unified Urdu Input Platform

**Product:** Write Urdu  
**Initiative ID:** `WU-VOICE-PLAT-001`  
**Status:** Planned — founder-approved platform initiative  
**Priority:** P0/P1 platform growth  
**Date:** 2026-08-22  
**Area:** Shared input architecture / voice / Roman-English-to-Urdu / direct Urdu / creation workflows  
**Primary behavior dependency:** `WU-TOOLS-EXPANSION-004`  
**Growth dependency:** `WU-GROWTH-003`  
**Journey dependency:** `WU-PLAT-002`  
**Core workspace dependency:** `WU-PLAT-003` / `WU-PLAT-004`  
**Creation dependencies:** `WU-SM-001`, `WU-SUA-001`, `WU-CS-UX-001`  
**Locale dependency:** `WU-I18N-001`

---

## 1. Executive decision

Voice Typing must stop behaving as a destination-only utility and become a reusable Urdu input capability across Write Urdu.

The product model is:

```text
Write Urdu your way

English letters → Urdu
Type Urdu directly
Speak Urdu
        ↓
one editable Urdu text state
        ↓
edit / correct / format / create / copy / share / export
```

The key product decision is **not** to create separate Roman input, direct Urdu input and voice transcript silos. All supported input methods operate on the same user-owned editable text state.

A user must be able to:

1. speak a sentence in Urdu;
2. see recognized Urdu inserted into the active field/document;
3. place the caret anywhere in that text;
4. correct a word by typing Urdu directly or by typing the Urdu word with English letters;
5. switch back to voice and continue speaking;
6. preserve every manual correction and existing character while switching methods; and
7. continue into the owning product workflow without copying text between Write Urdu tools.

This platform initiative owns that shared input contract.

It does **not** replace:

- `WU-TOOLS-EXPANSION-004`, which remains authoritative for speech recognition, permissions, lifecycle, accessibility, mobile behavior and privacy;
- `WU-GROWTH-003`, which remains authoritative for the dedicated voice route's acquisition/SEO growth;
- the existing Roman-English-to-Urdu engine;
- the direct Urdu input behavior;
- Card Studio, social maker, Stylish Urdu, Name Art or Rich Editor rendering/business logic.

---

## 2. Product thesis

Write Urdu's differentiator should become:

> **Do not make the user solve Urdu input before they can solve their actual task.**

Users may be able to speak Urdu comfortably but type it slowly. They may be able to type a difficult correction more reliably with English letters. They may prefer direct Urdu for a name, number, punctuation mark or unusual word.

Those are not separate products. They are input methods for the same writing task.

The platform therefore treats input method switching as normal editing behavior, not a destructive mode transition.

### 2.1 Why this is strategically valuable

Voice alone usually produces text. Write Urdu already owns useful destinations for that text:

- Basic Writer;
- Rich Editor;
- Urdu Keyboard;
- Card Studio;
- Instagram Post Maker;
- WhatsApp Status Maker;
- Stylish Urdu Text;
- Urdu Name Art;
- templates and downstream share/export flows.

This enables a differentiated loop:

```text
Speak Urdu → Urdu appears → correct it → create the finished thing
```

Examples:

```text
Speak → correct → WhatsApp message/share
Speak → correct → WhatsApp Status image
Speak → correct → Instagram post image + caption
Speak → correct → Urdu card
Speak → correct → styled Urdu text
Speak a name/phrase → correct → Name Art
Speak → refine/format → Word/PDF document
```

The value is the continuation, not merely speech-to-text.

---

## 3. Non-negotiable invariants

### 3.1 One editable text state

Embedded voice input must insert into the same state the owning workspace already edits.

Do not introduce a second visible `voice transcript` field that the user must copy into the real product field.

The standalone `/tools/urdu-voice-typing` route may keep its transcript-style workspace because transcript editing is its actual owner job. When voice is embedded elsewhere, the destination field/document is the transcript.

### 3.2 Switching input methods never destroys text

Changing between:

- `roman` / English letters → Urdu;
- `direct` / direct Urdu and English input;
- `voice` / speak Urdu;

must never clear, replace, reset or re-import the current user text.

Existing text remains the source of truth.

### 3.3 Corrections are a first-class workflow

Recognition will sometimes be imperfect. The platform must make correction easy rather than imply perfect speech recognition.

A user can speak, stop, edit manually, switch input method, correct one word, reposition the caret and speak again.

The product must not automatically overwrite a manual correction with an earlier speech hypothesis.

### 3.4 Voice commits at the active insertion point

Where the owning workspace supports a caret/selection, final recognized speech should insert at the active logical insertion point.

Preferred behavior:

- replace a non-empty selection with the final recognized segment;
- otherwise insert at caret;
- preserve surrounding text;
- place caret after inserted segment;
- emit the same input/change/update signals as normal user editing;
- participate in the workspace's normal undo model where technically feasible.

If a specialized canvas/model cannot expose a native caret, its adapter must define a deterministic target, normally the selected text layer's editable source field.

### 3.5 Interim speech is not committed document content

Interim recognition may be shown near the voice control as transient feedback.

Do not repeatedly rewrite the owning editor with interim hypotheses. Only final recognition becomes committed user text.

This avoids:

- cursor jumps;
- lost manual edits;
- noisy undo history;
- duplicate recognition fragments;
- model/canvas render churn.

### 3.6 Permission only after explicit user action

Selecting or remembering Voice does not request microphone permission.

The browser permission prompt may occur only after an explicit user gesture such as `Start voice typing` / tapping the microphone.

No microphone starts automatically on route load, locale change, restored preference or handoff.

### 3.7 Progressive enhancement

When speech recognition is unavailable or fails:

- Roman-English-to-Urdu remains usable;
- direct input remains usable;
- existing text remains editable;
- the voice control degrades clearly rather than leaving a broken button.

Do not claim universal browser support, offline operation or guaranteed on-device recognition.

### 3.8 Reuse the existing speech behavior contract

The platform must reuse/extract the existing `SpeechRecognition` / `webkitSpeechRecognition` behavior instead of creating a second voice engine.

`WU-TOOLS-EXPANSION-004` remains authoritative for:

- `ur-PK` language configuration;
- start/stop/abort lifecycle;
- interim vs final handling;
- permission denial;
- no-speech/audio/network errors;
- page visibility/background behavior;
- accessibility state;
- physical-device release validation;
- privacy wording.

### 3.9 No user content in telemetry or URLs

Never send/log:

- audio;
- transcript text;
- recognized words;
- user edits;
- names;
- captions/messages;
- filenames;
- raw browser recognition error objects.

The platform may record bounded method/workspace/outcome categories only.

### 3.10 No new backend or paid speech API

This initiative is browser-first and reuses current infrastructure.

Do not add:

- a new database;
- audio upload/storage;
- a paid speech provider;
- server-side transcript storage;
- a voice-specific account requirement;
- a second Card Studio/rendering engine.

---

## 4. User-visible input model

### 4.1 Standard input chooser

Where space and job context allow, use simple user language:

```text
How do you want to write?

[ English letters → Urdu ] [ Type Urdu directly ] [ 🎤 Speak Urdu ]
```

Urdu locale example:

```text
لکھنے کا طریقہ

[ انگریزی حروف → اردو ] [ براہِ راست اردو لکھیں ] [ 🎤 بول کر اردو لکھیں ]
```

Do not expose implementation terms such as `transliteration`, `SpeechRecognition`, `Web Speech API` or `phonetic mode` in the primary control.

### 4.2 Voice is both a method and an explicit action

Voice may appear as the third method in the shared input chooser, but microphone capture remains action-gated.

Selecting Voice should reveal/focus the microphone affordance and voice state. It must not immediately start listening.

A compact workspace may instead show the microphone as a third affordance beside Roman/direct controls. The underlying contract is the same.

### 4.3 Method switching while editing

Expected flow:

```text
1. User chooses Speak Urdu.
2. User taps microphone.
3. Says: آج کا دن بہت خوبصورت ہے
4. Final Urdu is inserted into the real text field.
5. User sees a recognition mistake.
6. User chooses English letters → Urdu.
7. Moves caret/selects word and types the correction with English letters.
8. User chooses Speak Urdu again.
9. Taps microphone and continues the sentence.
10. Prior correction remains untouched.
```

Direct Urdu input follows the same rule.

### 4.4 Preserve useful method preference without auto-listening

Existing Roman/direct per-workspace preference storage may continue.

If Voice becomes a remembered preferred method:

- UI may restore Voice as selected/last-used;
- microphone stays idle;
- permission is not requested;
- the user must tap the microphone to start.

A later implementation may decide to remember only Roman/direct and treat Voice as transient if this proves clearer; either behavior must preserve the explicit-action rule.

---

## 5. Platform architecture

### 5.1 Shared components

The target architecture separates recognition behavior from workspace DOM/business logic.

Recommended modules:

```text
js/voice-input-core.js
    recognition lifecycle + state + final/interim callbacks

js/unified-urdu-input.js
    input-method orchestration + target adapters + shared UI contract

js/input-mode.js
    compatibility layer / Roman-direct behavior, migrated carefully rather than duplicated
```

Exact filenames may change if the repository already has a better shared owner. Do not create parallel abstractions with overlapping responsibility.

### 5.2 `VoiceInputCore` responsibility

The reusable voice core should own only speech concerns:

```text
support detection
create/configure recognition instance
ur-PK configuration
start / stop / abort
listening state
interim callback
final-result callback
bounded error category
visibility/unload cleanup
state transitions
```

It must not know about:

- Card Studio;
- Instagram;
- WhatsApp;
- Rich Editor;
- specific textarea IDs;
- route navigation;
- copying;
- exporting;
- analytics sinks beyond optional bounded callbacks/events.

### 5.3 `UnifiedUrduInput` responsibility

The unified layer coordinates:

```text
roman | direct | voice method UI
workspace target adapter
method preference
voice start/stop UI
insertion of final speech into the target
focus/caret restoration
shared locale labels
shared accessibility state
bounded input-method events
```

It delegates Roman/direct behavior to the existing input-mode/transliteration implementation rather than reimplementing transliteration.

### 5.4 Target adapter contract

Every embedded workspace integrates through an adapter rather than voice code reaching into arbitrary DOM.

Logical adapter shape:

```text
id
kind
focus()
getValue()
insertText(text, options)
getSelection?()
setSelection?()
dispatchInput?()
isEditable()
destroy?()
```

`insertText` is the critical contract.

Options should be sufficient to express:

```text
source: voice | roman | direct
replaceSelection: true
preserveSurroundingText: true
normalizeWhitespace: minimal
```

Do not pass actual content to telemetry callbacks.

### 5.5 Required adapter families

At minimum:

1. **Textarea/input adapter** — Basic Writer, social/Card source fields, Stylish source, short Name Art fields.
2. **Rich/contenteditable adapter** — Rich Editor/iframe/editor selection model.
3. **Card Studio/model adapter** — selected text-layer/model synchronization and preview refresh where the visible source field alone is insufficient.

Prefer generic adapters first and route-specific wrappers only where the owning model genuinely differs.

### 5.6 Insertion normalization

Speech insertion may normalize only trivial join whitespace.

Do not:

- semantically rewrite speech;
- translate English to Urdu;
- run the speech result through Roman transliteration;
- guess names;
- silently change punctuation/content beyond the recognizer output.

English words/numbers recognized by the browser remain as returned unless the user edits them.

---

## 6. Workspace eligibility and rollout matrix

### 6.1 Tier 1 — highest-value creation outcomes

| Workspace | Route | Voice target | Why |
| --- | --- | --- | --- |
| Urdu Card Studio | `/urdu-card-studio` | active/main text layer | speak → card is highly demonstrable |
| Instagram Post Maker | `/urdu-instagram-post-maker` | post text; caption when clearly scoped | speak → correct → design/download |
| WhatsApp Status Maker | `/urdu-whatsapp-status-maker` | status text | speak → correct → status image |
| Stylish Urdu Text | `/stylish-urdu-text-generator` | source phrase | speak → correct → generate styles |
| Urdu Name Art | `/urdu-name-art-maker` | short name/phrase | optional accelerator for short text |

### 6.2 Tier 2 — core writing

| Workspace | Route | Voice target |
| --- | --- | --- |
| Basic Writer | `/` | main writing textarea |
| Rich Editor | `/urdu-editor` | current editor selection/caret |
| Urdu Keyboard | `/urdu-keyboard` | direct-input writing target; voice remains secondary to keyboard intent |
| My Documents creation | `/my-documents` where supported | `Start with voice` routes/starts an owning writer; My Documents itself is not a new editor |

### 6.3 Text-message outcome

A user wanting a WhatsApp **message** is different from a WhatsApp **Status image**.

Phase 1 should not create a new indexable WhatsApp-message generator route merely because the phrase sounds marketable.

Instead enable a natural product outcome from compatible text workspaces:

```text
Speak → edit/correct → Copy / Share to WhatsApp
```

and separately:

```text
Speak → edit/correct → Make WhatsApp Status
```

A dedicated page may be considered later only from product/Search Console evidence and must have a distinct job from the Status Maker.

### 6.4 Deferred / low-priority surfaces

Voice should not be added everywhere just because a text input exists.

Examples requiring separate justification:

- Invoice monetary/tax/structured fields — recognition error cost is higher and field ambiguity is unacceptable;
- QR input — possible later, but weak differentiation versus speaking into a writer first;
- Text Cleaner — voice input does not naturally solve the cleaner's primary job;
- OCR — its primary input is an image, not text entry;
- account/profile fields — not an Urdu creation job.

---

## 7. Creation workspace contracts

### 7.1 Card Studio

- Voice inserts into the currently active/main editable text target.
- Final speech updates the same model used by typing.
- Canvas preview refreshes through the normal update pipeline.
- Manual canvas/source-field edits remain authoritative.
- Switching Roman/direct/voice does not create a new layer or project.
- Undo/redo must not be corrupted by interim speech.

### 7.2 Instagram Post Maker

Primary promise:

> Speak your Urdu post, correct anything you want, then design it.

- Main post text supports all three input methods.
- If caption has its own editable field, voice may be exposed as a clearly scoped caption mic without stealing focus from the design text.
- Never make one microphone ambiguously write to two fields.
- Download/caption-copy/manual posting boundaries from `WU-SM-001` remain unchanged.

### 7.3 WhatsApp Status Maker

Primary promise:

> Tap the mic, speak your status in Urdu, correct it, then choose the design.

- Voice targets status text.
- Status image dimensions/safe areas/export remain owned by `WU-SM-001`.
- A text-message share outcome must not be confused with image Status export.

### 7.4 Stylish Urdu Text

- Voice fills the same source phrase used by direct/Roman input.
- User can correct before generation.
- Existing style catalogue behavior stays deterministic.
- Voice input does not send the phrase to analytics or a backend.

### 7.5 Name Art

- Voice is optional and secondary because names/proper nouns may be recognized less reliably.
- Recognized text remains editable before rendering/export.
- Do not imply reliable spelling of names.
- Existing Card Studio-based renderer remains source of truth.

---

## 8. Core writing contracts

### 8.1 Basic Writer

- Add a compact Voice entry into the existing input-method area without pushing the writing canvas below the mobile fold.
- Final speech inserts into the same `transliterateTextarea`/owning text state.
- User may stop voice, choose English letters → Urdu and correct text in place.
- Existing Copy/Share/Export/Create handoffs remain unchanged.
- Homepage SEO ownership remains `English to Urdu Typing Online`; this platform feature does not rewrite title/H1 merely to mention voice.

### 8.2 Urdu Keyboard

- `/urdu-keyboard` continues to own direct Urdu keyboard search intent.
- Voice is a useful alternate input method, not the primary SEO promise.
- On-screen/physical keyboard controls remain visually dominant for users who landed for a keyboard.
- Switching to Voice must preserve text and keyboard state where practical.

### 8.3 Rich Editor

- Voice inserts at the current Rich Editor caret/selection.
- Formatting around the insertion point should behave like ordinary inserted text where the editor supports it.
- Existing selection/manual edits survive voice sessions.
- Roman/direct correction remains available.
- Do not create a plain textarea transcript outside the rich document and require an import.

---

## 9. Accessibility and interaction

Every embedded voice control must:

- have an accessible name such as `Start Urdu voice typing`;
- expose listening/stopped/error state using text/ARIA, not only color/icon;
- provide a large enough mobile target;
- not repeatedly announce interim text through an ARIA live region;
- return focus predictably after stop/error;
- preserve keyboard operation of the owning editor;
- stop safely on navigation/page hide as required by the voice contract.

Do not make manual input inaccessible while Voice is merely selected but idle.

---

## 10. Locale contract

All new shared controls need English and Urdu UI copy.

URL owns language under `WU-I18N-001`.

Do not use browser language to change canonical route content.

Urdu route/control examples:

```text
انگریزی حروف → اردو
براہِ راست اردو لکھیں
بول کر اردو لکھیں
آواز سے لکھنا شروع کریں
سن رہا ہے…
آواز سے لکھنا روکیں
```

Generated Urdu artifacts must remain deterministic where Phase 1 locale generation owns the route.

---

## 11. Privacy and security

Preserve the current accurate voice privacy position:

- recognition is provided by the browser/platform;
- browser/vendor services may process speech;
- Write Urdu does not intentionally upload/persist audio or recognized text on its own server as part of voice input;
- account save/share happens only through the user's explicit owning-product action.

Do not market browser speech as guaranteed private/on-device/offline.

A microphone permission request must never be triggered by:

- page load;
- hover;
- focus;
- restoring input-mode preference;
- opening an editor;
- switching locale;
- importing a handoff.

---

## 12. Telemetry contract

Use the existing product telemetry pipeline and normalize to existing event taxonomy where possible.

Useful bounded dimensions/events include:

```text
workspace_id
input_method = roman | direct | voice
method_selected
voice_started
voice_stopped
voice_final_received
input_method_switched
completion/outcome event already owned by workspace
```

Useful aggregated questions:

- what percentage of eligible users try voice by workspace?
- how often does voice produce a final segment?
- after a voice segment, how often do users switch to Roman/direct before completing the task?
- which outcomes follow voice: copy, share, card export, Instagram download, Status export, style generation, Name Art export, document export?
- are unsupported/permission failures concentrated on particular coarse browser/platform categories already allowed by telemetry policy?

A method switch such as `voice → roman` may be measured as a bounded event but must never include the corrected word/text.

---

## 13. SEO and marketing contract

### 13.1 Product first

Do not create keyword-clone routes merely to say:

- voice to Instagram Urdu;
- voice to WhatsApp Urdu;
- Urdu voice status;
- Urdu voice name art;
- Urdu voice card maker.

First ship the capability on the existing owning product pages and use truthful copy such as:

- `Speak your Urdu post instead of typing it.`
- `Tap the mic, speak your status in Urdu, then edit or design it.`
- `Type, paste or speak your Urdu text.`

### 13.2 Existing search owners remain stable

- `/tools/urdu-voice-typing` remains the voice typing owner.
- `/` remains broad English-to-Urdu typing owner.
- `/urdu-keyboard` remains keyboard owner.
- `/urdu-instagram-post-maker` remains Instagram post owner.
- `/urdu-whatsapp-status-maker` remains WhatsApp Status owner.
- `/urdu-card-studio`, Stylish and Name Art keep their current owner roles.

Do not change canonicals/URLs to reflect input method.

### 13.3 Evidence-gated support content

If Search Console/product evidence later shows distinct demand such as `Urdu voice typing for WhatsApp`, use `WU-GROWTH-003` publication gates and define a genuinely useful support job.

A support page must not duplicate the owner tool.

---

## 14. Rollout sequence

Implementation is deliberately split:

### Slice A — `WU-VOICE-PLAT-001A`

Extract/reuse the shared recognition core and establish adapter/unified-input contracts. Prove parity on the existing standalone voice page. No broad workspace rollout.

### Slice B — `WU-VOICE-PLAT-001B`

Integrate the shared input system into the core writing surfaces: Basic Writer first, then Rich Editor and Urdu Keyboard; add My Documents `Start with voice` only through its normal creation ownership.

### Slice C — `WU-VOICE-PLAT-001C`

Roll into Card Studio, Instagram, WhatsApp Status, Stylish Urdu and Name Art with product-specific adapters and correction flows.

The first high-value creation pilot may be Card Studio/social because Instagram and WhatsApp already reuse the same Card Studio architecture.

### Slice D — `WU-VOICE-PLAT-001D`

Growth/measurement, truthful product copy, WhatsApp message outcome, short-form demonstration hooks, and evidence-gated SEO expansion.

Do not combine all slices into one implementation PR.

---

## 15. Acceptance criteria

Platform-wide completion requires:

- [ ] one shared voice-recognition core; no route-specific duplicate engines;
- [ ] existing dedicated Voice Typing route behavior remains intact;
- [ ] Roman/direct behavior remains intact;
- [ ] embedded voice writes to the owning workspace's real editable state;
- [ ] final speech inserts at caret/selection where supported;
- [ ] interim speech never destroys committed/manual text;
- [ ] users can correct voice text with English letters → Urdu;
- [ ] users can correct voice text with direct Urdu input;
- [ ] switching methods never clears text;
- [ ] no microphone permission on load/mode restore;
- [ ] unsupported browsers retain manual input;
- [ ] core writing rollout passes desktop/mobile acceptance;
- [ ] Card/social/Stylish/Name Art rollout passes focused browser acceptance;
- [ ] physical iPhone Safari + Android Chrome voice validation is recorded for changed embedded mic behavior;
- [ ] no audio/transcript/user text enters telemetry;
- [ ] no new database/backend/paid speech provider is introduced;
- [ ] existing canonicals/search owners remain intact;
- [ ] active writing/creation AdSense boundaries remain protected;
- [ ] Urdu locale controls and generated artifacts remain valid;
- [ ] outcome telemetry can distinguish voice adoption and useful completion without content.

---

## 16. Verification baseline

Every implementation slice runs relevant repository gates, at minimum:

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

Voice-touching slices also run the real-device checklist from `WU-TOOLS-EXPANSION-004` when mic placement, permissions, recognition lifecycle or target insertion changes.

Focused tests must cover:

- no permission on load;
- support detection;
- final/interim separation;
- insertion at caret/selection;
- switching Voice → Roman → Voice without losing text;
- switching Voice → Direct → Voice without losing text;
- manual correction survives later final speech;
- unsupported browser fallback;
- locale labels;
- no transcript in telemetry;
- route-specific rendering/update after voice commit.

---

## 17. Implementation map to inspect first

```text
js/urdu-voice-typing.js
js/input-mode.js
main.js
js/product-telemetry.js
js/text-handoff.js
js/workspace-handoff.js
js/workspace-journey-registry.js

index.html
urdu-keyboard.html
urdu-editor.html

js/card-studio.js
js/card-studio-core.js
js/social-maker-core.js
js/social-direct-workspace.js
js/social-direct-instagram.js
urdu-card-studio.html
urdu-instagram-post-maker.html
urdu-whatsapp-status-maker.html

js/stylish-urdu-text.js
js/name-art.js
stylish-urdu-text-generator.html
urdu-name-art-maker.html

locale/ur.js
scripts/generate-urdu-locale.js
```

Search the current implementation before adding modules. Exact ownership may have evolved.

---

## 18. Completion standard

`WU-VOICE-PLAT-001` is not complete because microphone icons exist on several pages.

It is complete when Voice, English-letter Urdu and direct Urdu behave as interoperable input methods over the same user text; corrections are natural; creation products consume voice without separate transcript/import steps; privacy/accessibility/mobile behavior remain correct; and the resulting voice → creation journeys are measurable without collecting content.
