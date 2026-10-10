# WU-UXR-001 — Persona UX Review Remediation (2026-10-10)

**Status:** Active — remediation plan; slices execute one at a time in the order below
**Priority:** Slice 0–A are P0 maintenance (not frozen); B–E run inside existing `WU-PLAT-002H` gates; F–I follow their owner specs' gates
**Date:** 2026-10-10
**Owner of this document:** sequencing only. Each slice's behaviour is owned by the spec named in that slice; this document must not become a parallel contract.
**Governance:** [`BACKLOG.md`](BACKLOG.md) rule 7 and [`WU-PLAT-002H-SCOPE-FREEZE.md`](WU-PLAT-002H-SCOPE-FREEZE.md) apply. Regressions, broken links, runtime errors and accessibility defects are "maintenance needed to keep current core routes healthy" and are not frozen.

---

## 1. Source evidence

A browser-driven review ran five persona jobs against a local build of `main` at `2e776ec` (Chromium; Pixel 7 and 1366px desktop) plus a 48-page mobile sweep.

| Persona | Job | Outcome |
| --- | --- | --- |
| Student, mobile | Roman Urdu message → WhatsApp | Partly: Share only publishes a public link; draft looks lost after reload |
| Shopkeeper, desktop + mobile | 3-item bill → PDF | Completed: no Urdu input in fields, bill lost on reload, Urdu header glyphs broken in PDF |
| Diaspora parent, desktop | Learn letters, practise, send Eid card | Partly: static alphabet, lesson 1 marks error on 2nd key, cannot personalise card in Roman Urdu |
| Content creator, mobile | Ghalib couplet → Instagram post | Completed: couplet wrapped into 5 lines, Naskh default, stray white bar, download precedes design choice |
| Journalist, desktop | InPage → Unicode → formatted article → Word/PDF | Partly: no file upload, wrong editor link, PDF glyphs garbled, `.doc` is HTML |

**Review limits (sandbox):** production host and Google Input Tools were blocked. Transliteration responses were mocked to test surrounding UI; account flows had no backend; PDF font loading may differ from production. Items marked **verify** must be reproduced on production in Slice 0 before code changes.

Finding IDs `F1`–`F34` below refer to the review report.

---

## 2. Execution order

| Order | Slice | Theme | Owner spec | Freeze status | Size |
| --- | --- | --- | --- | --- | --- |
| 0 | Production verification | Confirm the sandbox-uncertain findings | this doc | Not frozen | S |
| A | Regression hotfixes | Wrong headings, wrong link, runtime errors, a11y names | maintenance | Not frozen | S |
| B | Typing resilience | Visible failure state; provider risk | `WU-JOURNEY-001B`, `WU-INPUT-001` | B1 not frozen; B2 benchmark | S + research |
| C | Basic Writer mobile post-value | Restore, layout jump, duplicate guidance, voice, ad placement | `WU-PLAT-002H` / `WU-PLAT-004B` | Inside P0.1 | M |
| D | Card completion quality | Poetry line fit, Nastaliq default, artifact, mobile order | `WU-PLAT-002H` P0.1F, Card Studio | Inside P0.1F | M |
| E | Export fidelity | PDF shaping, bill PDF, `.docx` | `WU-JOURNEY-001F` | E1–E2 audit allowed early; E4 gated | M–L |
| F | Unified input in fields | Roman Urdu in card dialog, Card Studio, bill fields | `WU-VOICE-PLAT-001` / unified-input skill | Rollout gate | M |
| G | Bill completeness | Persistence, totals hierarchy, Urdu mode, mobile sticky bar | `WU-BILL-001` | P0.8 exception guardrail | M |
| H | Learning fixes | Lesson 1 spacing, next-key highlight; interactive alphabet | `WU-JOURNEY-001E` | H1 not frozen; H2 gated | S / M |
| I | Discovery | Desktop nav, search, card search/paging, meanings | `WU-SEO-CTR-001`, cards specs | Frozen until backlog re-review | — |

Decisions that need the founder before the related slice can finish are in §4.

---

## 3. Slices

### Slice 0 — Production verification

Goal: turn every **verify** item into confirmed or dropped before code changes.

- [ ] On `https://write-urdu.com`, mobile and desktop: type `mujhe kal school jana hai` word-by-word and via passage conversion; record result and latency (F6/F7 baseline).
- [ ] Rich Editor: heading `آج کی خبر` + one paragraph → PDF; zoom to check joining and word spacing (F2).
- [ ] Bill generator in Urdu mode → PDF; check `تفصیل` / `نرخ` / `تعداد` headers (F2).
- [ ] Rich Editor toolbar: is the `⚡️Upgrade` promotion visible with the Tiny Cloud key? (F30)
- [ ] Sign-in page on production: does the `<h1>` read "Keep your Urdu writing connected to you"? (F1)

**Exit:** each finding is marked confirmed or not-reproducible in §5.

### Slice A — Regression hotfixes (one PR)

| # | Finding | Change | Files |
| --- | --- | --- | --- |
| A1 | F1 — 6 pages get the homepage `<h1>`/title (sign-in, audio-to-text, document translator, dictionary, voice translator, text-to-speech) | Remove the `|| pageCopy['/index.html']` fallback: when the path has no entry, leave the page's own `<h1>`, subtitle and `document.title` untouched. Bump the service-worker shell cache (`sw.js`) so returning visitors get the fix | `js/site-header-core.js:477` (loaded by `site-header.js:338`), `sw.js` |
| A2 | F4 — InPage converter "Open the Urdu editor" goes to `/` and drops the text | Point to `/urdu-editor`; add a "Continue in editor" action next to *Copy result* that sends the result through the existing `WriteUrduWorkspaceHandoff` `rich-editor` destination (new `inpage-converter>rich-editor` pair alongside `basic-writer>rich-editor`). `WriteUrduTextHandoff` is not suitable: it only feeds Basic Writer and Cleaner | `tools/inpage-unicode-converter.html:144`, converter script, `js/workspace-handoff.js` (~line 238), `js/workspace-journey-registry.js` |
| A3 | F5 — `new Clipboard('.btn')` throws on every load (clipboard.js never loaded) | Delete the dead inline script | `urdu-keyboard.html:311-321` |
| A4 | F5 — `insertBefore` NotFoundError on Stylish Text | Guard the reference node in `placeFeaturedMethod` (fall back to `appendChild` when the anchor is not a child) | `js/writer-voice-input.js:138` |
| A5 | F32 — card buttons announce internal IDs ("Share dua-1 as an image") | Use the card's display title in `imageLabel` and sibling labels | `js/urdu-cards.js:21` |
| A6 | F31 — unlabelled icon buttons (9 Rich Editor, 6 keyboard, 1 name art, 1 stylish) | Add `aria-label`s (Preview, Print, …) via existing i18n dictionary keys | `urdu-editor.html`, `urdu-keyboard.html`, related JS |

Tests:

- [ ] New contract test: for every page in `docs/WU-PUBLIC-PAGE-REGISTRY.csv`, the rendered `<h1>` equals the source `<h1>` unless `pageCopy` has an explicit entry (extend `tests/outcome-navigation-contract.test.js` or add `tests/page-heading-integrity.spec.js`).
- [ ] Browser test: zero `pageerror` events on `/urdu-keyboard` and `/stylish-urdu-text-generator`.
- [ ] Browser test: InPage example → Continue in editor → Rich Editor contains the converted text.
- [ ] `npm run test:all` green; `npm run shell:check` green.

**Exit:** the 48-page sweep shows no unexpected heading changes, no JS errors and no unlabelled visible buttons.

### Slice B — Typing resilience

- **B1 (F6), not frozen:** when either transliteration path fails or has not loaded within a few seconds, show an inline status near the writer: "Urdu conversion is unavailable right now — Retry · Type Urdu directly". Clear the endless "Loading Urdu typing..." label. Owners: `index.html` (control init around line 334), `js/batch-transliteration.js` (`error` copy already exists; surface it), `js/input-mode.js`.
  - [ ] Browser test with `inputtools.google.com` and the jsapi host routed to fail: status visible within 5 s, Retry works once the route recovers, direct mode remains usable.
- **B2 (F7), benchmark only:** document the dependency on the deprecated `google.elements.transliteration` control. Evaluate (a) moving word-by-word to the same `inputtools` request path as passage conversion, (b) a local rule-based fallback. Run under `WU-JOURNEY-001B`'s fixture corpus; no production switch without benchmark parity.

### Slice C — Basic Writer mobile post-value (inside `WU-PLAT-002H`)

Must respect `WU-PLAT-004B` (Copy → Preview → Download ▾ → Share → Print → More) and `WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md`.

- [ ] **C1 (F9)** Draft restore: when a saved draft exists and the editor is empty, show Restore/Discard *above* the editor in the first viewport, or auto-restore with an Undo. Owner: `js/editor-tools.js:636`.
- [ ] **C2 (F10)** No layout jump: the post-value action bar must not push the textarea down after the first keystroke on mobile (measured shift ≈200px). Render the bar below the editor or reserve its height. Owners: `js/basic-writer-command-toolbar.js`, `js/basic-writer-export-priority.js`.
- [ ] **C3 (F10)** Mobile: collapse PDF/Word/PNG tiles into the single `Download ▾` that `WU-PLAT-004B` already prescribes for desktop.
- [ ] **C4 (F11)** Merge the hero line, the "Two ways to write Urdu" panel and the example strip into one instruction on mobile.
- [ ] **C5 (F12)** Hide "Convert passage" after success; show the success status once.
- [ ] **C6 (F13)** One tap on "Speak Urdu" starts listening (permission prompt included); keep the panel for status.
- [ ] **C7 (F14)** Mobile ad slot moves below the post-value action area, never directly under the editor (`WU-ADSENSE-OPERATING-CONTRACT`).

Tests: extend `tests/mobile-editor-activation.spec.js` and `tests/workspace-next-step.spec.js` with layout-shift (editor top before/after first input ≤ 8px), restore-visible-in-first-viewport and one-tap voice cases.

### Slice D — Card completion quality (inside P0.1F)

These fix output quality, not acquisition, so they serve the Card completion diagnosis. The `P0.9` guardrail forbids renderer changes for *indexing* work; this slice is renderer quality work under P0.1F and needs that noted in the PR.

- [ ] **D1 (F3)** Poetry line fit: when text has explicit line breaks and the role/background is poetry, keep each line whole and shrink the font to the widest line (with a minimum size, then wrap as last resort). Owner: `wrapRtlText` / `layoutCardText` in `js/card-studio-core.js:232-271`.
- [ ] **D2 (F26)** Backgrounds tagged `goodFor: ['poetry', …]` default to Noto Nastaliq Urdu.
- [ ] **D3 (F3)** Find and remove the stray white bar at the top-right of the Ink Wash Poetry export (background asset or overlay); add a pixel-check fixture.
- [ ] **D4 (F3)** Respect background safe areas so text doesn't overlap the artwork.
- [ ] **D5 (F24)** Mobile maker order: write → design → preview → download; preview stays in view (sticky mini preview) while choosing backgrounds. Owners: `js/social-direct-workspace.js`, `js/social-direct-instagram.js`.
- [ ] **D6 (F25)** Mobile background picker: compact 3-column thumbnail grid instead of tall horizontal tiles.

Tests: golden-image fixtures for a two-line couplet at 1080×1080, 1080×1350 and 1080×1920 (each line on one row, no clipping); extend `tests/v3-visual-quality.spec.js` and `tests/card-studio-background-collection.spec.js`.

### Slice E — Export fidelity (`WU-JOURNEY-001F`)

- [ ] **E1** Build the print-fidelity benchmark 001F already calls for: Nastaliq heading + paragraph, Naskh paragraph, mixed Urdu/English/numbers, a bill table. Compare current `html2canvas` → JPEG → jsPDF output against browser Print-to-PDF.
- [ ] **E2 (F2)** Fix shaping in the shared PDF runtime. Options in order of preference: (a) offer the browser's Print → Save as PDF route with a print stylesheet as the default "PDF" for documents; (b) render text blocks as whole runs rather than per-glyph; (c) embed the font in jsPDF with a shaping step. Choose by benchmark.
- [ ] **E3** Apply the same fix to the bill/invoice PDF path (`js/bill-generator.js`).
- [ ] **E4 (F29)** Real `.docx` instead of HTML renamed `.doc`. Gated: the freeze lists "new export formats". Treat as a format *correction* only with founder approval.

### Slice F — Unified Urdu input in fields

Use `skills/unified-urdu-input` (rollout skill). Card Studio is the designated pilot, then social makers.

- [ ] **F1 (F23)** "Make this card yours" dialog on `/urdu-cards`: add English letters → Urdu / Type Urdu directly toggle (`js/urdu-cards.js`).
- [ ] **F2 (F23)** Card Studio / WhatsApp / Instagram text box: confirm the toggle works on the dedicated pages (seen present) and reuse it in the dialog.
- [ ] **F3 (F17)** Bill shop name and item description fields: Roman Urdu assist (`WU-BILL-001` checklist line 275). Only through the shared engine; no new transliteration code inside bill files.

### Slice G — Bill completeness (`WU-BILL-001` open items)

- [ ] **G1 (F18)** Save business profile (name, phone) and last bill on this device; versioned state with New bill reset (checklist line 249). Auto-increment bill number.
- [ ] **G2 (F19)** Total visually dominant over Subtotal (checklist line 181). Primary button uses the brand green.
- [ ] **G3 (F17)** Urdu mode: currency label `روپے` option; payment method labels in Urdu only.
- [ ] **G4 (F20)** Mobile: sticky footer with live Total + Download; preview reachable without long scroll.

Guardrail from P0.8 applies: no Basic/Rich/invoice-protected file may change.

### Slice H — Learning

- [ ] **H1 (F21), not frozen:** Lesson 1–4 drill text without spaces between letters, or say clearly that Space is expected; highlight the next expected key on the on-screen keyboard. Owners: `js/typing-practice-core.js`, typing-practice page script.
- [ ] **H2 (F22)** One line on the practice page explaining phonetic key layout vs. word-level English letters → Urdu, linking each to its tool.
- [ ] **H3 (opportunity)** Interactive alphabet (audio, positional forms, mapped key, printable sheet): new feature, so it is gated behind `WU-JOURNEY-001E` / backlog re-review.

### Slice I — Discovery (frozen until backlog re-review)

Recorded so it isn't lost. Do not start before the freeze ends.

- Desktop visible top-nav for the 4–5 primary jobs; remove duplicate menu entries (F15).
- Header search using existing `/write-urdu-search` (F16).
- `/urdu-cards`: search, chip overflow cue, paging on mobile (F27).
- English meaning under ready-made cards for diaspora senders.
- Local "My work" hub across drafts/bills/cards.

---

## 4. Decisions required

| ID | Question | Conflict / context | Blocks |
| --- | --- | --- | --- |
| D-1 | Should the Basic Writer offer **Send as text** (native share sheet / WhatsApp intent with the Urdu text) alongside Publish & get short link? | `WU-PLAT-004A` §42 deliberately excludes raw text from native share; `WU-JOURNEY-001C` §5 gates a WhatsApp-message outcome. Review evidence: student persona's job is a text message, and Share forced a public page. | F8 |
| D-2 | Show button labels in one language based on the active locale instead of `English · اردو` pairs? | Affects screen readers and button width across cards/makers. | F33 |
| D-3 | Approve `.docx` export as a format correction under the freeze? | Scope freeze lists new export formats. | E4 |
| D-4 | Accept a transliteration provider fallback strategy after B2 benchmark? | Core-feature dependency on a deprecated Google API. | B2 follow-up |

---

## 5. Verification log

| Finding | Slice 0 result | Date |
| --- | --- | --- |
| F1 headings on production | — | — |
| F2 PDF shaping on production | — | — |
| F6/F7 transliteration behaviour on production | — | — |
| F30 TinyMCE Upgrade on production | — | — |

## 6. Done means

- Every slice's checkboxes are ticked or explicitly moved to an owner spec with a reason.
- The five persona jobs are re-run on production and each reaches its outcome without the listed friction.
- `BACKLOG.md` and `specs/README.md` reflect remaining state.
