# WU-SM-001 — WhatsApp Status and Instagram Makers

**Product:** Write-Urdu.com  
**Feature ID:** `WU-SM-001`  
**Status:** Implemented  
**Route:** `/urdu-whatsapp-status-maker`, `/urdu-instagram-post-maker`  
**Architecture:** Existing Urdu Card Studio Design Engine

## Purpose

Provide focused image-making entry points for WhatsApp Status and Instagram
without creating a second rendering or editing engine. Both makers reuse the
Card Studio canvas, Urdu input, templates, direct editing, local background
processing, autosave, and export pipeline.

## Platform configuration

| Maker | Default | Additional sizes | Safe-area intent |
| --- | --- | --- | --- |
| WhatsApp Status | 1080 × 1920 Story | — | Keep text clear of top/bottom status UI |
| Instagram Post | 1080 × 1080 Square | 1080 × 1350 Portrait, 1080 × 1920 Story | Keep feed/story overlays clear |

The configuration lives in `js/social-maker-core.js`. It is deliberately
serializable and contains no account, posting, analytics, or remote-image
behavior.

## User experience

- Each public route explains that the tool creates an image and does not post
  directly to WhatsApp or Instagram.
- The embedded Studio keeps the preview, templates, Urdu/Roman Urdu input,
  direct text editing, background crop controls, and mobile workflow.
- A safe-area guide is shown in social mode and can be toggled off. It is a DOM
  overlay only and is never drawn into PNG/JPEG output.
- Instagram mode includes a local caption-copy helper.
- Social drafts use versioned local storage keys and an IndexedDB scope separate
  from regular Card Studio projects.
- PNG and JPEG exports use the selected dimensions; JPEG quality is adjustable.

## Privacy and non-goals

All text, images, drafts, and exports remain in the browser unless the user
explicitly downloads, copies, or shares them. No social account connection,
direct posting, cloud project, or server API is introduced.

## Acceptance checklist

- [x] WhatsApp defaults to 1080 × 1920.
- [x] Instagram offers square, portrait, and story sizes.
- [x] Safe-area guide and out-of-area warning are available.
- [x] Guides are excluded from exports.
- [x] Local background image crop/position controls are reused.
- [x] Social drafts are scoped separately from Card Studio drafts.
- [x] PNG and JPEG download are available in social mode.
- [x] Instagram caption text can be copied locally.
- [x] The routes clearly explain manual upload and no account connection.
- [x] Existing Card Studio rendering and direct editing remain the source of truth.

## Implementation map

- `js/social-maker-core.js` — modes, safe areas, defaults, persistence keys,
  warnings, and filenames.
- `urdu-whatsapp-status-maker.html` — WhatsApp Status landing/workspace route.
- `urdu-instagram-post-maker.html` — Instagram Post landing/workspace route.
- `js/card-studio.js` — social-mode initialization, safe-area overlay, local
  caption copying, scoped drafts, and PNG/JPEG export.
- `css/social-maker.css` — route shell and responsive guidance layout.
- `css/card-studio.css` — safe-area and social export controls.
- `js/card-studio-core.js` — shared portrait preset (1080 × 1350).

