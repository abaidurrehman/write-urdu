# Urdu Voice Typing — Real Mobile Device Sign-off

Use this short record when verifying `/tools/urdu-voice-typing` on physical phones. The normative acceptance criteria live in `specs/WU-TOOLS-EXPANSION-004-urdu-voice-typing.md` §8.2.

## Required launch matrix

### iPhone Safari

- Device model:
- iOS version:
- Safari version:
- Test date:
- Tester:
- Result: PASS / FAIL
- Notes:

### Android Chrome

- Device model:
- Android version:
- Chrome version:
- Test date:
- Tester:
- Result: PASS / FAIL
- Notes:

## Minimum sign-off

Both required launch paths must verify:

- no microphone request on page load;
- permission request only after tapping Start voice typing;
- useful `ur-PK` Urdu-script recognition from real speech;
- interim/final text does not duplicate committed text;
- Stop preserves the transcript;
- a second listening session preserves earlier edits and appends new speech;
- Copy works;
- WriteUrdu continuation/share handoff preserves Urdu text without placing it in the URL;
- backgrounding/navigation stops listening safely while preserving committed text;
- denied microphone permission produces bounded guidance and leaves manual typing usable;
- portrait/landscape layout stays usable.

Do not mark mobile voice typing as physically verified from Playwright/browser emulation alone. CI validates our integration and state handling; the device sign-off validates the OS/browser speech service, microphone permission UI and practical Urdu recognition quality.