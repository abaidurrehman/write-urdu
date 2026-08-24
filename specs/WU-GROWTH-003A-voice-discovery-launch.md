# WU-GROWTH-003A — Voice Discovery Launch

**Parent:** `WU-GROWTH-003` / `WU-VOICE-PLAT-001D`  
**Status:** In implementation  
**Branch:** `feature/voice-discovery-launch`  
**Primary owner route:** `/tools/urdu-voice-typing`  
**Date:** 2026-08-24

## 1. Decision

Urdu Voice Typing is now a first-class Write Urdu input method, not a secondary utility hidden behind small controls.

The product contract becomes:

```text
Type Urdu with English letters
OR
Speak Urdu
OR
Type Urdu directly
```

Voice must be highly discoverable wherever the shared voice capability is already implemented, while the dedicated owner route continues to own generic Urdu Voice Typing / Urdu Speech to Text search intent.

This slice does not rebuild speech recognition and does not create synonym landing pages.

## 2. Evidence baseline

Latest available Write Urdu Search Console export reviewed on 2026-08-24, covering the previous three months:

- `/tools/urdu-voice-typing`: 11 impressions, 0 clicks;
- average position on those impressions: approximately 5.36, too little volume to treat as a stable ranking baseline;
- no meaningful voice/speech/speak/mic query family visible in the exported top-query set;
- exact `urdu typing`: 13,820 impressions;
- exact `english to urdu typing`: 41,340 impressions;
- queries containing `urdu typing`: approximately 69,571 impressions;
- approximately 62% of Search impressions were mobile.

Interpretation:

1. Write Urdu already has substantial adjacent Urdu-typing demand.
2. Voice is not yet strongly associated with that demand.
3. The dedicated Voice page is technically discoverable but has almost no query footprint.
4. Mobile first-view discoverability matters disproportionately.

## 3. Search language

The canonical owner page should naturally cover one intent family:

```text
Urdu Voice Typing
Urdu Speech to Text
Urdu Voice to Text
Speak Urdu to Text
Type Urdu by Voice
Urdu Voice Typing Online
```

Urdu-language variants include:

```text
اردو وائس ٹائپنگ
آواز سے اردو لکھیں
بول کر اردو لکھیں
اردو میں بول کر لکھیں
```

These are query variants, not separate page requirements.

## 4. Non-negotiable ownership

Keep the current owner stable:

```text
/tools/urdu-voice-typing
```

Do not create separate pages such as:

```text
/urdu-speech-to-text
/urdu-voice-to-text
/speak-urdu-to-text
/free-urdu-voice-typing
```

Do not change the existing Voice owner title, H1 or canonical during this discovery rollout unless later Search Console evidence justifies a controlled snippet experiment.

## 5. First-view UX contract

### 5.1 Eligible writing workspaces

Where Voice is already functionally supported, users must see the input-method choice before they begin typing whenever DOM structure safely permits it.

Preferred presentation:

```text
Type, paste or speak Urdu.

[ English letters → Urdu ]
[ 🎙 Speak Urdu ]
[ Type Urdu directly ]
```

Voice is visually stronger than the older compact pill but does not make the other methods look unavailable.

### 5.2 Mobile

On viewports at or below 767px:

- `Speak Urdu` may own a full row;
- minimum target height is 48px;
- microphone icon and text label remain visible;
- typing methods remain immediately available below it;
- no modal, onboarding interruption or automatic permission request is allowed.

### 5.3 Explicit microphone permission

Selecting `Speak Urdu` reveals the bounded Voice panel.

Recognition starts only after the explicit Start action. Page load, scrolling, incoming handoff parameters or feature exposure must never call microphone permission automatically.

### 5.4 Creation workspaces

For textarea-based creation workspaces using the shared `data-input-mode-control` contract, move the existing input-method chooser immediately before the writing field when both share the same parent.

This is a DOM reorder of the existing control, not a duplicate Voice implementation.

### 5.5 Rich Editor and Keyboard

Keep their established adapters. Promote discovery without replacing TinyMCE or keyboard-specific integration paths.

## 6. Crawlable discovery contract

Voice must not exist only as a JavaScript capability that search engines have to infer.

For eligible public acquisition pages:

- initial HTML should use natural wording such as `type, paste or speak Urdu` where the capability is actually live;
- at least one descriptive crawlable link should point to `/tools/urdu-voice-typing` where it fits the page naturally;
- anchor text should be `Urdu Voice Typing`, `Speak Urdu`, or another descriptive variant, not `Learn more`;
- the page's existing primary intent remains dominant.

Initial implementation in this slice adds crawlable Voice wording and owner links to:

- `/urdu-instagram-post-maker`;
- `/urdu-whatsapp-status-maker`.

Do not stuff `voice`, `speech`, `mic` or synonyms into every heading.

## 7. Measurement

Use existing privacy-safe product telemetry only.

Required shared Voice discovery events/actions:

```text
voice-exposed
voice-selected
voice-started
voice-final
```

Dimensions remain bounded, for example:

```text
workspace
input_mode=voice
action
```

Never transmit:

- transcript text;
- recognized words;
- audio;
- edited content.

### 7.1 Questions the rollout must answer

1. Which eligible workspaces expose Voice?
2. How often is Voice selected after exposure?
3. How often does selection become an explicit Voice start?
4. How often does a start produce final text?
5. Do mobile users select Voice more often after the prominence change?
6. Do Search Console impressions begin appearing for Voice-related query families?

## 8. Current implementation slice

### Runtime

`js/writer-voice-input.js`

- marks eligible controls with `data-wu-voice-promoted`;
- adds concise `Type, paste or speak Urdu` discovery copy;
- positions `Speak Urdu` beside the established input choices;
- moves shared textarea input-mode controls before the writing target when safe;
- records `voice-exposed` and `voice-selected` through existing telemetry;
- keeps `voice-started` / `voice-final` behavior;
- preserves explicit Start before microphone access.

### Visual system

`css/writer-voice-input.css`

- promotes the microphone with a clearly labelled visual treatment;
- uses stronger desktop affordance;
- gives Voice a full-width 48px mobile treatment;
- keeps typing options available;
- keeps listening/status UI bounded inside the authoring workspace.

### Crawlable public pages

`urdu-instagram-post-maker.html` and `urdu-whatsapp-status-maker.html`

- include source-visible `type, paste or speak Urdu` language;
- mention `Speak Urdu` in task guidance;
- link descriptively to `/tools/urdu-voice-typing`;
- keep their existing H1/canonical page ownership.

## 9. Acceptance criteria

- [ ] Voice is visible without scrolling past the writing field on supported textarea creation workspaces where the shared DOM contract permits reordering.
- [ ] `Speak Urdu` includes both microphone icon and readable label.
- [ ] Mobile Voice target is at least 48px high and can own a full row.
- [ ] Selecting Voice does not start microphone permission automatically.
- [ ] Existing English-letter and direct-Urdu modes remain available.
- [ ] Instagram page initial HTML mentions `speak Urdu` and links to the Voice owner.
- [ ] WhatsApp Status page initial HTML mentions `speak Urdu` and links to the Voice owner.
- [ ] Dedicated Voice owner title/H1/canonical remain unchanged.
- [ ] `voice-exposed` and `voice-selected` are emitted without content.
- [ ] Existing Voice functional contracts remain green.
- [ ] No synonym landing pages are added.

## 10. Verification

Run:

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

At minimum, the contract suite must include `tests/voice-discovery-launch-contract.test.js`.

Manual checks:

1. Instagram desktop and mobile;
2. WhatsApp Status desktop and mobile;
3. Card Studio desktop and mobile;
4. Rich Editor desktop and mobile;
5. Urdu Keyboard mobile;
6. unsupported-browser Voice state;
7. permission-denied state;
8. keyboard focus and screen-reader labels;
9. no ad placement between input chooser, microphone and writing field.

## 11. Deferred follow-up slices

### 003B — Static discovery expansion

Evaluate crawlable first-view Voice wording on:

- homepage / Basic Writer while preserving English-to-Urdu typing ownership;
- Card Studio;
- Rich Editor;
- Urdu Keyboard;
- relevant Urdu locale acquisition pages.

Avoid changing large established pages only to insert keywords; use evidence-backed, task-useful copy.

### 003C — Navigation and internal linking

Promote `Urdu Voice Typing` in the governed Write/tools navigation and footer where taxonomy allows it, and verify descriptive internal anchors.

### 003D — Search evidence review

After Google recrawls the changes, compare:

- Voice owner impressions/clicks;
- Voice query families;
- mobile vs desktop;
- ranking URL;
- Voice exposure → selection → start → final funnel.

Only then decide whether support guides such as mobile setup, microphone troubleshooting or WhatsApp Voice usage are justified.

## 12. Completion standard

This launch is successful when users can notice `Speak Urdu` before they start typing, search engines can associate key creation pages with a real Voice capability, and Write Urdu can measure whether that discovery results in useful Voice usage without collecting what people say or write.
