# 06 — Connected product journeys (existing mechanisms; no duplication)

The tools already connect through shared handoff code. The job is to keep those links reliable and visible at the right moment, not to build new ones.

| Journey | From → to | Mechanism (exists) | State today | Next step |
| --- | --- | --- | --- | --- |
| Text → card | `/` **Create Card** → `/urdu-card-gallery` → Card Studio | `js/card-studio-handoff-adapter.js`, `js/workspace-handoff.js` | **O:** couplet arrived intact in the gallery field (02 §3) | Card Studio completion (P0.1F, WU-UXR-002) |
| Text → document | `/` "Format this as a document" → `/urdu-editor` | `js/workspace-next-step.js` (max 3 visible), `workspace-handoff.js` | **O:** continuation appears below the editor after text | Keep. Measure click → ready → meaningful start (P0.1C metric). |
| Voice / OCR / InPage / Cleaner → writer | tool **Keep writing / Continue** → `/` or `/urdu-editor` | `js/text-handoff.js` (`Handoff.store(text, target)`, session-only) | Code present in voice, OCR, InPage and Cleaner; not re-walked today | — |
| Text → social | `/` → WhatsApp Status / Instagram makers | `js/social-format-handoff-adapter.js` | Adapter exists; not re-walked today | Maker parity is WU-UXR-002 Slice M (decision line needed) |
| Text → QR | `/` → `/qr-code-generator` | `js/qr-handoff-adapter.js` | Adapter exists; not re-walked today | — |
| Template → finished card | `/urdu-templates`, `/urdu-cards` → Card Studio | template links + Card Studio new-card rule (never overwrite, UXR-002 C) | Shipped | Slice J "Edit this design" remix |
| Returning | any writer / Card Studio | local autosave + history; "Recent cards on this device"; optional My Documents | Shipped | Founder decision D-5 (returning-draft visibility on `/`) before any new "resume" UI |
| Phrases → card | `/urdu-phrases-copy-paste` ↔ Card Studio | links only | Phrases → Card Studio existed; **Card Studio → phrases added on branch (Slice 3)** | — |

**Privacy boundary (unchanged):** handoffs are session-only or local. Publishing and share links stay explicit user actions (WU-UXR-002 Slice F covers consent and management for ready-made "Shareable link").

**Anti-patterns to keep out:** pop-ups during typing, forced sign-in, more than three continuation actions at once, and a second recommendation layer on top of `workspace-next-step.js`.
