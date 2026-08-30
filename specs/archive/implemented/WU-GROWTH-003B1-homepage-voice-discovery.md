# WU-GROWTH-003B1 — Homepage Voice Discovery

**Parent:** `WU-GROWTH-003A` / `WU-GROWTH-003`  
**Status:** Ready for quality gate  
**Branch:** `feature/voice-discovery-homepage`  
**Date:** 2026-08-24

## Decision

The English and Urdu homepages must expose Urdu Voice Typing in initial HTML without changing their primary search ownership.

The homepage continues to own English-to-Urdu typing intent. Voice is presented as a strong alternate input method, not as a replacement homepage category.

## Product contract

On first view, before users reach the writing field, show a large microphone entry that communicates:

- English: `Speak Urdu` / `Talk. Get Urdu text.`
- Urdu: `آواز سے اردو لکھیں` / `بولیں، اردو متن حاصل کریں۔`

The entry links to the locale-correct Voice owner:

- `/tools/urdu-voice-typing`
- `/urdu/tools/urdu-voice-typing`

The existing JavaScript discovery runtime recognizes the static `data-wu-voice-entry="home"` marker and therefore must not render a duplicate banner.

## Search contract

The homepage source must contain:

- a descriptive Voice owner link;
- natural `Urdu Voice Typing` language on the English page;
- natural `اردو وائس ٹائپنگ` / `آواز سے اردو لکھیں` language on the Urdu page;
- a Voice tool entry in the crawlable `Choose the right Urdu tool` grid.

Do **not** change:

- English homepage title `English to Urdu Typing Online | WriteUrdu`;
- English homepage H1 `English to Urdu Typing Online`;
- Urdu homepage H1 `انگریزی حروف سے اردو ٹائپ کریں`;
- homepage canonicals;
- Voice owner canonicals.

This avoids turning the homepage into a mixed-keyword category page while still passing authority and discovery to the dedicated Voice owner.

## Basic Writer method prominence

Because the Basic Writer already embeds Voice, the homepage Voice stylesheet also promotes its `Speak Urdu` method:

- microphone receives a clear circular visual affordance;
- desktop target is stronger than the default input pill;
- mobile target is at least 48px and may own a full row;
- English-letter typing and direct Urdu remain available;
- selecting the method still only opens the bounded panel;
- microphone permission still requires the explicit Start action.

## Implementation

### `index.html`

- loads `/css/voice-discovery.css` statically;
- contains the source-visible English Voice entry directly after hero actions;
- adds `Urdu Voice Typing` to the crawlable tool grid.

### `urdu/index.html`

- loads `/css/voice-discovery.css` statically;
- contains the source-visible Urdu Voice entry directly after hero actions;
- links to the Urdu Voice owner;
- adds `اردو وائس ٹائپنگ` to the crawlable tool grid.

### `css/voice-discovery.css`

- supports the static homepage entry without waiting for JavaScript;
- improves RTL details;
- promotes the embedded Basic Writer Voice method;
- keeps a 48px mobile Voice target.

### `tests/voice-discovery-launch-contract.test.js`

Adds regression checks for static source visibility, locale-correct owner links, preserved homepage ownership, and Basic Writer mobile prominence.

## Acceptance criteria

- [x] English homepage source contains a visible Voice entry.
- [x] Urdu homepage source contains a visible Urdu Voice entry.
- [x] Voice discovery styling is linked in initial HTML.
- [x] English homepage links to `/tools/urdu-voice-typing`.
- [x] Urdu homepage links to `/urdu/tools/urdu-voice-typing`.
- [x] Both homepages expose Voice in the crawlable tool grid.
- [x] English homepage title/H1 remain unchanged.
- [x] Urdu homepage H1 remains unchanged.
- [x] Existing runtime will not duplicate the static entry because the same `data-wu-voice-entry` marker is present.
- [x] Basic Writer Speak Urdu receives a stronger desktop/mobile treatment.
- [x] No automatic microphone permission is introduced.

## Next slice

`WU-GROWTH-003B2` should add source-visible, task-useful Voice wording to the remaining high-value authoring pages where Voice is already embedded: Card Studio, Rich Editor and Urdu Keyboard, including their Urdu locale counterparts. Keep each page's existing category title/H1/canonical stable.
