# WU-VOICE-PLAT-001C — Create & Social Voice Rollout

**Parent:** `WU-VOICE-PLAT-001`  
**Depends on:** `WU-VOICE-PLAT-001A`  
**Status:** Planned — implementation Slice C  
**Priority:** High-value creation rollout  
**Primary routes:** `/urdu-card-studio`, `/urdu-instagram-post-maker`, `/urdu-whatsapp-status-maker`, `/stylish-urdu-text-generator`, `/urdu-name-art-maker`

---

## 1. Goal

Turn the shared Urdu input platform into an outcome engine for creation surfaces:

```text
Speak Urdu
   ↓
recognized Urdu appears in the real creation text field
   ↓
correct with English letters → Urdu or direct Urdu
   ↓
preview updates
   ↓
finish / copy / download / share
```

This is the highest-value demonstration of the platform because Write Urdu can go beyond speech-to-text and complete the user's real task on the same page.

---

## 2. Governing rule

Do not create separate voice transcript/import flows in creation tools.

Voice must feed the same model/source field already used by the creation workspace.

If a canvas/editor has a selected text layer, that selected layer remains the owner. Voice is an input method for it.

---

## 3. Rollout order

Recommended order:

1. **Card Studio** — establish the shared canvas/model adapter.
2. **WhatsApp Status Maker + Instagram Post Maker** — reuse Card Studio architecture and prove social outcomes.
3. **Stylish Urdu Text** — simple source-field integration.
4. **Name Art** — optional short-text voice input with conservative messaging.

This order maximizes reuse and avoids writing separate social voice implementations.

---

## 4. Urdu Card Studio

### 4.1 Target

Voice inserts into the active/main editable text layer/source controlled by Card Studio.

The adapter must use the normal Card Studio state/update pipeline rather than manipulating only visual DOM text.

### 4.2 Required flow

```text
User opens Card Studio
→ chooses Speak Urdu
→ taps mic
→ speaks a phrase
→ final Urdu appears in active text
→ canvas updates
→ user selects one wrong word
→ chooses English letters → Urdu
→ corrects it
→ canvas updates
→ user speaks another phrase
→ new phrase inserts at current caret
→ download/share uses final corrected design
```

### 4.3 State safety

Voice must not:

- create a new text layer unless explicitly requested by the existing Card flow;
- reset template/background/font/layout;
- overwrite unrelated layers;
- break undo/redo;
- repeatedly rerender interim hypotheses as committed canvas text.

Only final speech enters the model.

### 4.4 Existing contracts remain authoritative

`WU-CS-UX-001`, Card Studio core/interaction contracts and existing renderer/export behavior remain source of truth.

---

## 5. WhatsApp Status Maker

### 5.1 Primary job

The product message becomes truthfully capable of:

> **Speak your Urdu Status, correct it, then choose the design.**

Voice targets the Status design text owned by the embedded/shared Card Studio model.

### 5.2 Status image vs WhatsApp message

Keep these outcomes distinct:

```text
WhatsApp Status
Speak → edit → design → image download/share
```

and:

```text
WhatsApp message
Speak → edit → copy/share text to WhatsApp
```

The Status route remains an image-maker owner.

Do not mutate it into a generic WhatsApp message page.

### 5.3 Text-message action

Where the product already supports safe text sharing, add or expose a natural outcome after useful text exists:

- `Copy message`;
- `Share to WhatsApp` where current approved share plumbing supports it;
- `Make WhatsApp Status` as the visual transformation.

Do not create a new indexable `/urdu-whatsapp-message-maker` route in this slice.

---

## 6. Instagram Post Maker

### 6.1 Primary design text

The main design text supports:

```text
English letters → Urdu
Type Urdu directly
Speak Urdu
```

Voice inserts into the same source/model used by the Instagram post preview.

### 6.2 Caption

Instagram has a distinct caption-copy helper.

If caption input is separate from design text, voice may be added to caption only if the target is unambiguous.

Allowed patterns:

- a small mic inside/next to the caption field labelled `Speak caption`;
- one active-target voice control that clearly says which field is receiving speech.

Reject:

- one microphone with no visible target label when both post text and caption are editable;
- a voice session that writes simultaneously to design text and caption;
- automatic copying of design text into caption without user action if that changes existing behavior.

### 6.3 Product promise

Useful copy after implementation may say:

> Speak your Urdu post instead of typing it. Correct the wording, choose the design and download it for Instagram.

Do not claim Write Urdu posts directly to Instagram; `WU-SM-001` manual-posting boundary stays intact.

---

## 7. Stylish Urdu Text

### 7.1 Target

Voice inserts into the existing source phrase field.

The field remains editable using Roman/direct input.

### 7.2 Generation behavior

After final voice insertion:

- use the same generation trigger/debounce behavior as normal input;
- do not create a voice-specific style generator;
- preserve all style catalogue/category/favourite behavior;
- never send the phrase to telemetry.

### 7.3 Correction flow

Voice-produced text can be corrected before/after style generation. Regeneration should follow the normal input-change contract.

---

## 8. Urdu Name Art

### 8.1 Voice is secondary

Proper names and short unusual phrases are more vulnerable to recognition errors.

Therefore:

- Voice is optional, not the dominant control;
- public copy should say users can speak a name/short phrase and then correct the spelling;
- never claim reliable recognition of names;
- Roman/direct correction stays visually easy.

### 8.2 Target

Use the real main Name Art text source/model.

Existing templates, fonts, selected style and renderer state remain unchanged when Voice is used.

---

## 9. Shared creation UI pattern

Creation tools should reuse one compact pattern rather than inventing different mic UI per route.

Preferred:

```text
Write your Urdu
[ English letters → Urdu ] [ Type Urdu directly ] [ 🎤 Speak Urdu ]

[ editable text field / selected text source ]

voice state: Ready / Listening… / Text added / permission error
```

On very dense creation surfaces, the mic may be an icon button within the text-input toolbar if:

- it has an accessible label;
- state is visible;
- it is clear which field/layer receives speech;
- Roman/direct correction remains one tap away.

---

## 10. Multiple targets / selected layers

Creation workspaces may have multiple editable text objects.

The adapter must define deterministic ownership.

Preferred behavior:

- selected text layer receives speech;
- if no text layer is selected, use the workspace's documented primary text field;
- if this would be ambiguous or destructive, require the user to select/focus a target before Start becomes available.

Do not infer target from DOM order.

If selection changes while actively listening, choose and document one safe behavior:

1. keep the target captured at session start; or
2. stop voice when target changes and require restart.

Do not unpredictably send one recognition session across multiple layers.

Recommended initial behavior: **capture target at Start and stop/restart when target changes**.

---

## 11. Live preview behavior

Final voice commit should trigger the owning creation tool's normal update pipeline.

It must not bypass:

- auto-fit;
- RTL shaping;
- font waiting/rendering;
- safe-area checks;
- persistence/autosave;
- undo/redo;
- export state.

Interim speech should not trigger expensive canvas updates unless a later measured UX experiment justifies it.

---

## 12. Persistence

Voice is an input source, not a persistence owner.

Existing draft/project rules remain unchanged:

- Card Studio keeps its existing local/account persistence behavior;
- social makers keep scoped drafts;
- Stylish/Name Art preserve their existing local state;
- user must not lose a draft when voice permission fails.

No voice-specific local database/storage schema is needed.

---

## 13. Sharing and completion

Voice-derived text is ordinary user text after commit.

It may flow through existing explicit actions:

- Copy;
- Share;
- Download PNG/JPEG;
- public share artifact where approved;
- Open in another Write Urdu workspace.

No special voice publishing backend is needed.

---

## 14. SEO/content boundaries

Do not launch new pages solely around combinations such as:

- Urdu Instagram voice typing;
- voice Urdu WhatsApp Status;
- Urdu voice Card Studio;
- voice Name Art.

After the capability ships, existing owner pages may naturally mention it.

Examples:

```text
Instagram: Speak your Urdu post, correct it, then design it.
WhatsApp Status: Tap the mic and speak your Urdu Status.
Card Studio: Type, paste or speak your Urdu text.
Stylish Urdu: Type or speak a phrase, then choose a style.
Name Art: Type or speak a short name/phrase, then correct the spelling before creating art.
```

Keep titles/canonicals stable unless separate SEO evidence justifies change.

---

## 15. Telemetry

Measure bounded voice adoption and completion by workspace.

Examples:

```text
workspace_id = card_studio | instagram | whatsapp_status | stylish | name_art
input_method = voice
voice_started
voice_final_received
input_method_switched
existing completion outcome
```

Useful aggregate funnels:

```text
Instagram:
voice_final → manual correction/method switch → image download or caption copy

WhatsApp Status:
voice_final → design/export

Card Studio:
voice_final → download/share

Stylish:
voice_final → styles generated → copy/share/name-art handoff

Name Art:
voice_final → correction → PNG export
```

No user content is logged.

---

## 16. Accessibility/mobile

Creation pages are often mobile-heavy.

Required:

- mic target >= current mobile touch standard;
- listening state visible while canvas scrolls;
- Stop remains reachable;
- canvas does not jump as interim state changes;
- voice does not cover essential design controls;
- software keyboard + mic transitions preserve the selected field/layer;
- unsupported browser keeps normal creation usable;
- state/error labels accessible.

Run physical iPhone Safari + Android Chrome checks because emulation cannot validate real speech service/permissions.

---

## 17. Acceptance checklist

### Shared

- [ ] All creation routes reuse shared voice/unified-input foundation.
- [ ] No duplicate route-specific speech engines.
- [ ] Same editable model is used by Voice/Roman/direct.
- [ ] method switching preserves text/project state.
- [ ] final speech triggers normal preview update.
- [ ] interim text does not corrupt model/undo history.
- [ ] target is deterministic when multiple fields/layers exist.
- [ ] no permission on load.
- [ ] unsupported browser leaves creation tools usable.
- [ ] no user content telemetry.

### Card Studio

- [ ] voice edits active/main text safely.
- [ ] templates/background/font/layers remain intact.
- [ ] download/share uses corrected voice result.

### Instagram

- [ ] post text voice target is clear.
- [ ] caption mic, if shipped, has independent target semantics.
- [ ] manual posting boundary preserved.

### WhatsApp

- [ ] Status image job remains clear.
- [ ] text-message Share/Copy outcome does not require a new route.

### Stylish/Name Art

- [ ] source text remains editable/correctable.
- [ ] existing generation/rendering remains source of truth.
- [ ] Name Art does not overpromise proper-name accuracy.

---

## 18. Verification

Run:

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

Add focused desktop/mobile browser coverage for each migrated creation role.

Add real-device voice validation for the first Card/social pilot and re-run when later changes touch the shared mic behavior.

---

## 19. PR strategy

Recommended PRs:

1. Card Studio shared adapter + voice pilot.
2. Instagram + WhatsApp Status reuse.
3. Stylish + Name Art rollout.

Do not implement all creation routes in one high-risk PR unless the first adapter proves they are genuinely trivial wrappers and all focused tests remain easy to diagnose.
