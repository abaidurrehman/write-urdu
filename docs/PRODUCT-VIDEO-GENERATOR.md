# Write Urdu Product Video Generator

This is the Write Urdu port of InvoiceCraftly's deterministic, captions-first product-video foundation. It uses the real local Write Urdu UI, the repository's existing Playwright dependency, browser Canvas composition, and browser-native MediaRecorder. It does not require a paid renderer, stock footage, a cloud video API, or a proprietary editor.

## First story

`voice-typing` tells one truthful product story:

`typing friction → open Voice Typing → editable Urdu demo text → copy / continue / share`

The capture script does not pretend that a headless browser actually spoke into a microphone. For post-speech frames it inserts clearly synthetic Urdu demo text into the real product UI, and the composition labels the footage `REAL PRODUCT UI · DEMO TEXT`.

## Commands

Install Playwright's Chromium once if it is not already available:

```bash
npx playwright install chromium
```

Capture the real product frames:

```bash
npm run video:capture -- voice-typing
```

Render a landscape website/social master:

```bash
npm run video:render -- voice-typing website-16x9
```

Render the other responsive variants from the same story and captures:

```bash
npm run video:render -- voice-typing social-4x5
npm run video:render -- voice-typing vertical-9x16
```

Render a poster:

```bash
npm run video:poster
```

Run the structural contract checks:

```bash
npm run video:check
```

Generated captures and media are intentionally ignored by Git. Story definitions, composition logic, scripts, and tests remain reviewable source.

## Add another product story

Create `marketing/video/stories/<story-id>.json`. A story owns its route, caption, timing, optional selector highlight, optional deterministic field values, and optional scroll target. Then run the same capture and render commands with the new story ID. No renderer fork should be needed for Urdu typing, editor, Card Studio, QR, templates, community publishing, or future product stories unless the visual grammar itself genuinely changes.

## Responsive formats

The shared renderer supports:

- `website-16x9` — 1920×1080
- `social-4x5` — 1080×1350
- `vertical-9x16` — 1080×1920

The same story, captions, claims, and captured product state are reused across formats.

## Safety and publishing gate

Use only fictional/demo content in public captures. Do not capture account data, community drafts belonging to users, private documents, contact submissions, authentication state, or analytics identifiers. Review representative frames before publishing. The product action shown by the caption must be visible in the real UI; do not use generated scenes to imply functionality that Write Urdu does not provide.

The baseline output is silent and captions-first. Audio, narration, MP4 delivery encoding, automatic manifests/checksums, and website-player integration should be added as later slices only where they improve distribution or product understanding.
