# WU-VOICE-PLAT-001D — Growth, Measurement & Voice-to-Outcome Expansion

**Parent:** `WU-VOICE-PLAT-001`  
**Depends on:** `WU-VOICE-PLAT-001A`; rollout evidence from B/C  
**Status:** Planned — Slice D  
**Area:** product-led growth / SEO / telemetry / demonstration / outcome loops

---

## 1. Goal

Turn the unified Urdu input platform into measurable acquisition and product growth without creating a voice-keyword content farm.

The growth proposition is:

```text
Speak Urdu
→ edit/correct naturally
→ finish the actual job
```

The measurement proposition is:

```text
Which workspaces benefit from Voice?
Does Voice produce useful text?
Do users correct it successfully?
What useful outcome follows?
```

No content-level analytics are required to answer these questions.

---

## 2. Relationship to WU-GROWTH-003

`WU-GROWTH-003` remains owner for the dedicated Voice Typing route's search acquisition and support-content strategy.

This slice owns **cross-product voice adoption and voice-to-outcome measurement**.

Do not create a second voice SEO strategy.

Search ownership remains:

- `/tools/urdu-voice-typing` — generic Urdu voice typing / speech-to-text intent;
- `/` — broad English-letter-to-Urdu writing;
- individual creation pages — their own outcome intent.

Cross-product voice capability may strengthen those pages but does not create new canonical owners automatically.

---

## 3. Product copy after capability ships

Only market Voice on a workspace after the actual shared capability is live and tested there.

Good task language:

```text
Speak your Urdu post instead of typing it.
Tap the mic and speak your Urdu Status.
Type, paste or speak Urdu for your card.
Speak a phrase, correct it, then choose a style.
Dictate Urdu, correct it and format your document.
```

Avoid implementation language:

```text
Web Speech API enabled
SpeechRecognition powered
browser speech engine mode
```

Avoid unsupported claims:

```text
100% accurate
works in every browser
fully offline
all speech stays on device
```

---

## 4. Voice-to-WhatsApp message outcome

### 4.1 User job

A useful distinct product outcome exists even without a dedicated SEO route:

```text
Speak an Urdu message
→ edit/correct it
→ Copy or Share to WhatsApp
```

This is different from:

```text
Speak an Urdu Status
→ design an image
→ download/share the image
```

### 4.2 Initial implementation

Use existing compatible text/share surfaces.

Candidate places:

- dedicated Voice Typing successful-result actions;
- Basic Writer share flow;
- a contextual `Send to WhatsApp` / `Copy message` action when supported by existing approved sharing utilities;
- a `Make WhatsApp Status` transformation into the Status Maker.

Do not create a new backend.

Do not put user text in a GET URL merely to hand it between Write Urdu pages.

If external WhatsApp share itself requires a platform URL/share intent, follow the existing approved share implementation and privacy contract.

### 4.3 New route gate

Do **not** create `/urdu-whatsapp-message-maker` or similar until evidence shows a distinct acquisition/product job that cannot be served cleanly by existing writing + share surfaces.

Required evidence before a new route:

- Search Console demand and ranking-page evidence; or
- strong product usage showing a repeatable message-specific workflow; and
- a materially distinct interaction/content contract from Status Maker and Basic Writer.

---

## 5. SEO strategy

### 5.1 No combination-page explosion

Reject automatic pages for combinations such as:

```text
voice to instagram urdu
voice to whatsapp urdu
urdu voice status
urdu voice card
voice to stylish urdu
voice name art
```

Input method alone is not enough to justify a new page.

### 5.2 Strengthen existing owner pages

Once implemented, existing owner pages may add concise copy demonstrating the new method.

Examples:

- Instagram page: visible `Speak Urdu` method and one short explanation below/around workspace;
- WhatsApp Status page: voice method visible in the real design text control;
- Card Studio: `Type, paste or speak` in task guidance;
- Rich Editor: `Dictate Urdu` in writing guidance;
- Stylish/Name Art: optional `Speak Urdu` wording in input help.

Do not churn established title/canonical/H1 solely to include `voice`.

### 5.3 Evidence-gated guides

Potential support jobs remain governed by `WU-GROWTH-003`, especially:

- Urdu voice typing for WhatsApp;
- mobile setup;
- microphone troubleshooting;
- punctuation/numbers.

If a WhatsApp guide is eventually justified, it should teach both useful outcomes:

1. voice → editable text message;
2. voice → Status design;

and point to the correct owner products.

---

## 6. Measurement model

### 6.1 Core dimensions

Use bounded identifiers only:

```text
workspace_id
input_method
previous_input_method
voice_support_category
voice_error_category
completion_kind
format/preset ID where already allowed
locale
```

Never include content.

### 6.2 Shared funnel

For every eligible workspace where available:

```text
workspace viewed
    ↓
voice selected / mic exposed
    ↓
voice started
    ↓
final speech committed
    ↓
manual continuation / method switch
    ↓
useful completion
```

Not every workspace needs every event if existing shared taxonomy already captures equivalent signals.

Normalize rather than duplicate.

### 6.3 Correction proxy

A useful privacy-safe signal is:

```text
voice final
→ switch to roman/direct
→ continue editing/completion
```

This may indicate correction/continuation but must never be described as proof that speech was wrong.

Do not inspect text differences to calculate correction rate.

### 6.4 Workspace outcomes

Examples of already-bounded outcomes:

```text
Basic Writer: copy / share / export / handoff
Rich Editor: export / save / handoff
Keyboard: copy / save / handoff
Card Studio: image export / share
Instagram: image export / caption copy
WhatsApp Status: image export / share
Stylish: styles generated / result copy / share / Name Art handoff
Name Art: PNG export / share
```

Compare Voice-led sessions at aggregate level only.

---

## 7. Product Pulse / reporting

Extend existing reporting rather than creating a voice dashboard silo if current Product Pulse can support a bounded section.

Useful questions:

1. How many eligible workspace sessions expose/support Voice?
2. How many users start Voice by workspace?
3. What percentage receive at least one final result?
4. Which workspaces have the highest Voice adoption?
5. Which workspaces see useful completion after Voice?
6. How often do users switch Voice → Roman/direct before completion?
7. Which bounded failure categories suppress activation?
8. Is mobile usage materially different from desktop?

Do not join Search Console query data to user-level product sessions.

---

## 8. Experiment discipline

Voice rollout creates many opportunities to change copy/placement at once. Avoid that.

For each major workspace:

1. record pre-rollout product baseline where available;
2. ship the functional mic/input method;
3. measure activation/completion;
4. only then experiment with discovery copy/placement;
5. change one major variable at a time.

Examples:

- mic icon vs labelled `Speak Urdu`;
- chooser position;
- inline helper wording;
- post-result WhatsApp action.

Do not simultaneously redesign the whole workspace and conclude that Voice drove the change.

---

## 9. Short-form demonstration strategy

Voice-to-creation is unusually demonstrable.

Strong product demos:

### Instagram

```text
User taps mic
says: زندگی خوبصورت ہے
Urdu appears
user corrects one word with English letters
post preview updates
download
```

### WhatsApp Status

```text
Speak Urdu greeting
→ text appears
→ choose Status template
→ export image
```

### Card Studio

```text
Speak Urdu poetry line
→ canvas updates
→ switch font/background
→ share/download
```

### Rich Editor

```text
Dictate a paragraph
→ correct one term with English letters
→ add heading/bold
→ export Word/PDF
```

The demonstration should show the correction step deliberately. This communicates a credible workflow rather than pretending recognition never makes mistakes.

Do not claim unsupported accuracy/privacy/browser guarantees in video captions or landing copy.

---

## 10. Internal discovery

Once functional rollout is stable, strengthen discovery through existing journey registry/components.

Examples:

- `Speak Urdu` in Write input chooser;
- `Start with voice` from My Documents creation shortcuts;
- voice method inside Card/social text inputs;
- Voice Typing owner route links to `Create a card`, `Make WhatsApp Status`, `Create Instagram post` after transcript success;
- relevant Learn content points to the generic Voice owner.

Keep `Continue with…` capped according to `WU-PLAT-002`.

Do not add a separate Voice navigation category.

---

## 11. AdSense and conversion boundaries

Voice is an active authoring/capture control.

Therefore:

- no ad between method chooser/mic and editable target;
- no ad overlaying listening/interim/status controls;
- no signup interstitial before mic;
- account prompts only after useful content exists and through existing growth contract;
- existing page-type post-workspace monetization stays authoritative.

---

## 12. Privacy wording

Avoid repeating long privacy architecture on every embedded mic.

Inline UI should stay product-first.

Use compact help when needed:

> Voice recognition is provided by your browser/platform. You can always edit the result before using it.

Full details can link to the dedicated Voice/privacy guidance.

Do not say speech is guaranteed local/on-device.

---

## 13. Acceptance checklist

- [ ] Voice adoption is measurable by eligible workspace without text content.
- [ ] final-speech success is measurable through bounded events.
- [ ] method-switch correction/continuation proxy is available where useful.
- [ ] useful completion remains measured through existing outcome taxonomy.
- [ ] Product Pulse/reporting answers cross-workspace Voice questions.
- [ ] no new analytics database/sink is introduced solely for Voice.
- [ ] existing owner pages use truthful voice capability copy only after feature ships.
- [ ] no bulk voice+outcome keyword pages are created.
- [ ] WhatsApp message outcome can be completed without creating a new SEO route.
- [ ] Status vs message outcomes remain distinct.
- [ ] short-form demo guidance shows real editing/correction, not perfection claims.
- [ ] active authoring ad/account boundaries remain protected.

---

## 14. Verification

Run repository gates for any runtime/content/reporting change:

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

For analytics/reporting changes also run the current telemetry/Product Pulse contract tests.

For SEO copy verify canonical/title/H1 ownership is unchanged unless an explicit evidence-backed experiment says otherwise.

---

## 15. Completion standard

Slice D is successful when Write Urdu can answer, with privacy-safe evidence:

> Where is Voice genuinely useful, do users get usable editable Urdu, can they correct it naturally, and does it help them finish a real task?

It is not successful merely because many pages mention `voice` or because more microphone icons exist.
