# WU-TOOLS-EXPANSION-004 — Urdu Voice Typing

Status: Approved / P1
Parent: WU-TOOLS-EXPANSION-001
Date: 2026-08-17
Last updated: 2026-08-21

## 1. Problem

Many users can speak Urdu more easily or quickly than they can type it, especially on mobile. Browser speech-recognition capabilities make a zero-API-cost voice typing experience possible on supported browsers.

## 2. Product promise

Speak Urdu and insert recognized text into an editable WriteUrdu-compatible result.

This is progressive enhancement. The tool must not pretend support is universal or imply that recognition is necessarily performed locally on the device.

## 3. Route and title

Suggested route: `/tools/urdu-voice-typing/`

Working title: `Urdu Voice Typing — Speak to Type Urdu`

Query families:
- Urdu voice typing
- speech to Urdu text
- Urdu speech to text
- type Urdu by voice
- Urdu microphone typing

## 4. Technical approach

Use browser `SpeechRecognition` / vendor-prefixed equivalent where available.

Feature detection:
- `window.SpeechRecognition`;
- `window.webkitSpeechRecognition` as compatibility fallback.

Configure recognition for Urdu where supported, initially `ur-PK` with a documented fallback strategy.

No paid speech API is required for V1.

## 5. Privacy wording

The page must state:
- recognition is provided by the user's browser/platform;
- processing location depends on the browser/platform and may involve a browser vendor service;
- WriteUrdu does not intentionally upload or persist the transcript on its own server;
- unsupported browsers can still use normal Roman Urdu/direct typing.

Do not market this feature as guaranteed on-device/private speech recognition.

## 6. UX

Primary states:
- supported / idle;
- listening;
- processing/interim;
- stopped;
- permission denied;
- no speech;
- recognition error;
- unsupported browser.

Workspace:
1. compatibility/privacy note;
2. microphone button: `Start voice typing`;
3. visible listening indicator;
4. editable transcript area;
5. interim text visually distinct from committed text;
6. actions: Stop, Clear, Copy, Clean text, Open in WriteUrdu.

A microphone permission request must only occur after an explicit user action.

## 7. Transcript behavior

- committed results append at the caret/end without duplicating prior recognized segments;
- preserve user edits between recognition sessions;
- interim hypotheses must not become permanent until a final result is received;
- normalize only trivial whitespace introduced by recognition;
- do not automatically run semantic rewriting or transliteration over recognized Urdu;
- English words/numbers returned by the recognizer should be preserved rather than guessed.

## 8. Mobile behavior

- large touch target for microphone;
- clear listening state even when software keyboard changes viewport;
- avoid controls jumping when interim text grows;
- handle page visibility/background interruptions safely;
- stop recognition on navigation/unload;
- do not rely on `continuous = true` meaning an indefinitely open session: mobile browsers may end recognition after pauses or platform limits;
- after the browser ends a session, leave already committed text intact and return to a clear `Start voice typing` state;
- unsupported mobile browsers must keep the transcript/editor fallback usable and must never show a broken microphone control.

### 8.1 Supported mobile launch targets

V1 release confidence is owned explicitly for these two real-device paths:

| Platform | Browser | Release expectation |
| --- | --- | --- |
| iPhone / iOS | Safari, current stable | Supported when the browser exposes SpeechRecognition; must pass the real-device checklist below |
| Android | Chrome, current stable | Supported when the browser exposes SpeechRecognition; must pass the real-device checklist below |

Other mobile browsers remain progressive-enhancement targets. They may work through the same feature detection, but WriteUrdu should not claim them as verified until a physical-device pass is recorded.

### 8.2 Real-device acceptance checklist

Run this checklist on at least one current iPhone in Safari and one current Android phone in Chrome before describing mobile voice typing as verified in release notes or marketing.

1. Open `/tools/urdu-voice-typing` in a fresh/private-enough browser state where microphone permission has not already been decided.
2. Confirm no microphone prompt appears on page load.
3. Tap `Start voice typing` and confirm the permission prompt is triggered only by that tap.
4. Allow microphone access; speak the Urdu phrase `السلام علیکم، آج موسم بہت اچھا ہے` naturally.
5. Confirm Urdu text appears in the transcript area and remains editable. Exact recognition wording may vary; the gate is useful Urdu-script recognition rather than character-perfect transcription.
6. Speak a second phrase after a short pause and confirm committed text is not duplicated or erased.
7. Tap Stop and confirm the page returns to a non-listening state while preserving the transcript.
8. Start again and confirm the new session appends to the existing edited transcript rather than replacing it.
9. Edit several words manually and confirm subsequent recognition does not discard those edits.
10. Use Copy and confirm the transcript can be pasted into another app.
11. Use a WriteUrdu continuation/share action and confirm Urdu text survives the handoff without being placed in the URL.
12. While listening, background the browser or switch tabs/apps, then return. Confirm recognition is stopped safely and committed text remains.
13. Deny microphone access and confirm the page shows the bounded permission guidance without retry loops or navigation failure.
14. Reload after permission denial and confirm normal Urdu typing/editing remains usable.
15. Rotate the device once (where rotation is enabled) and confirm the microphone controls and transcript remain within the viewport.

Record the device model, OS version, browser version, date and pass/fail notes in the release/PR validation evidence. A desktop emulator or Playwright mobile viewport does not replace this physical-device sign-off.

## 9. Accessibility

- microphone state exposed with text and ARIA, not icon/color alone;
- keyboard start/stop available where browser permissions allow;
- live region announces listening/stop/errors without repeating every transcript update;
- transcript remains an ordinary editable control.

## 10. Error handling

Map browser errors to bounded friendly messages:
- not-allowed / permission denied;
- service-not-allowed;
- no-speech;
- audio-capture;
- network/service error;
- aborted;
- unsupported language/browser.

Do not send raw browser error objects to analytics.

## 11. Integration

- transcript can be sent to Text Cleaner;
- transcript can be opened in the core editor using session-only/clipboard handoff;
- result can be copied immediately.

## 12. Telemetry

Allowed bounded signals:
- speech support available/unavailable;
- permission outcome category;
- recognition started/stopped/completed/error;
- duration bucket;
- transcript length bucket;
- copy/clean/editor handoff.

Forbidden:
- audio;
- transcript text;
- recognized words;
- raw browser error details.

## 13. SEO/content

Explain:
- how to allow microphone access;
- supported-browser caveat;
- that browser/vendor processing may be involved;
- difference between voice typing and Roman Urdu transliteration;
- link to normal editor as fallback.

## 14. Acceptance criteria

Automated gates:
- no microphone permission is requested on page load;
- feature detection works for both `SpeechRecognition` and `webkitSpeechRecognition`;
- supported browser can start/stop Urdu recognition;
- recognizer is configured with `ur-PK`;
- interim/final results do not duplicate text;
- transcript remains editable;
- transcript can be copied and handed to editor;
- no transcript is sent in telemetry;
- permission denial is recoverable/explained;
- navigating away or hiding the page stops recognition;
- existing editor/transliteration workflow remains unaffected;
- mobile-emulated browser acceptance covers start, interim result, final Urdu result, stop and permission-denied states.

Physical-device release gates:
- iPhone Safari passes §8.2;
- Android Chrome passes §8.2;
- any platform-specific failure is documented before broadening public compatibility claims;
- physical-device sign-off is required because CI/browser emulation cannot validate the platform speech service, real microphone permission UI or Urdu recognition quality.

## 15. Out of scope

- custom acoustic/language model;
- paid speech API fallback;
- guaranteed offline recognition;
- audio recording/history;
- speaker identification;
- punctuation/grammar rewriting beyond recognizer output.