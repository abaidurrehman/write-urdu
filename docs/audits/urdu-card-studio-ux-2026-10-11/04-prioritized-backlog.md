# 04 — Prioritised Implementation Backlog

For a solo developer. Overlapping findings are consolidated into backlog items (`BL-xx`). Each item lists the findings it closes, the files to change, steps, acceptance criteria and effort (S ≤ ½ day · M ≤ 2 days · L ≤ 1 week · XL > 1 week).

**Governance reminders before starting**
- `specs/WU-PLAT-002H-SCOPE-FREEZE.md`: regressions, broken behaviour, accessibility and privacy fixes are **not frozen**. Layout and hierarchy changes to creation surfaces need production funnel evidence (`WU-UXR-001` D5/D6, `WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR` §15). This audit is **sandbox evidence**. Items marked 🔒 need either that production evidence or an explicit founder decision.
- New acquisition pages and new export formats are frozen; none are proposed.
- Each item should update `specs/WU-UXR-001-…md` (or an owner spec) rather than creating a parallel contract.

## Scoring

Impact (H/M/L) × journey frequency (H/M/L) ÷ risk. "Reuse" = existing code that already does most of the work.

---

## First implementation slice — 5 items

Chosen because each one (1) fixes a **measured** failure on a core journey, (2) is low-risk, with no layout rewrite and no new storage or service, (3) is not frozen (defect, data loss, output correctness, privacy copy, or accessibility), and (4) can be verified with an automated test. Together they remove the three worst trust breakers (wrong output, silent failure, lost work) and the biggest legibility defect, and they unblock mobile discovery without a redesign.

### BL-01 · Bidi-safe numbers and Latin runs in canvas text — closes CARD-UX-003 (+ part of 028)
- **Why first:** wrong phone numbers in exported announcements are invisible to authors and harmful to recipients (P5 blocked).
- **Files:** `js/card-studio-core.js` (`wrapRtlText`, line ~232: measure with the isolated string), `js/card-studio.js` (draw loop line ~391 and attribution draw ~line 373), new helper `isolateBidiRuns(text)` in `card-studio-core.js` (exported for the wedding renderer).
- **Steps:**
  1. Add `isolateBidiRuns(line)`: wrap `/[0-9][0-9\-\/.:+ ]*[0-9]/g` and Latin-letter runs (including trailing `!?.,:`) with `⁦` … `⁩`.
  2. Apply it to each line **only for measurement and drawing**. Never change `state.text.value`, `public_text` or the remix payload.
  3. Add `tests/card-bidi-render.spec.js`: render fixtures and compare against an LTR-drawn reference crop of the number (pixel-diff tolerance), or assert `measureText` widths are identical between the isolated and plain strings (no layout change).
- **Acceptance:** `رابطہ: 0300-1234567` exports as `0300-1234567`. `Happy Friday!` keeps `!` on the right. Existing `card-text-fit-contract.test.js` and `card-poetry-quality.spec.js` still pass.
- **Effort:** S · **Risk:** low (render-only) · **Reuse:** existing layout pipeline.

### BL-02 · Truthful feedback: real sample text, persistent errors, separate save indicator, label fixes — closes CARD-UX-004, 021, 015, 031, part of 022
- **Files:** `js/card-studio-ui.js` (`contentAction`, line 115), `js/card-studio.js` (`setStatus` line 79, `saveProject` line 200, copy tables lines 39–40: `removeImage`, `privacy`, `exportPrivacy`), `js/card-studio-publish.js` (error mapping in `publishCurrent`), `urdu-card-studio.html` (+ regenerate `/urdu/` with `npm run locale:generate`).
- **Steps:**
  1. Sample text: use a real greeting (e.g. `صبح بخیر! اللہ آپ کا دن خوشیوں سے بھر دے۔`) distinct from `core.DEFAULT_TEXT`.
  2. Add a `[data-card-save-indicator]` span. Have `saveProject` write there, so `[data-card-status]` is used only for user-action results. Errors stay until the next user action. Mirror refusals as a toast near the pressed button.
  3. `copy.en.removeImage = 'Remove image'`.
  4. Privacy copy: "Saved only on this device. Nothing is uploaded unless you choose Publish & Share." Export copy: "Download saves a picture for WhatsApp Status or Instagram. Publish & Share makes a public link — best for WhatsApp chats and Facebook." (plus Urdu equivalents).
  5. Publish error: "Links can't be created right now. Your card is safe here — download the picture and send it instead." with a Download button.
  6. Hide `[data-card-transliteration-status]` while the input-mode `unavailable` alert is visible.
- **Acceptance:** Sample → Download produces a file. A refused download shows its reason in the viewport for ≥ 6 s at 360×780. A broken upload keeps its error. No unconditional "not uploaded" claim (run `npm run language:check`). Exactly one Roman-Urdu status is visible during an outage.
- **Effort:** S · **Risk:** low · **Reuse:** existing copy tables and toast.

### BL-03 · Never overwrite a user's card on hand-off; add "Recent cards on this device" — closes CARD-UX-002, 034, part of 039
- **Files:** `js/card-studio-handoff-adapter.js` (apply, lines 83–103), `js/card-studio.js` (`initialise` line 490: template/incoming branch; `dbGetLatest`; new `dbListRecent(5)`), small UI block in the Content step (`urdu-card-studio.html`).
- **Steps:**
  1. Before applying a hand-off, `?template=` or incoming text: if the loaded project has user changes (`updatedAt` > `createdAt`, or text ≠ DEFAULT_TEXT), create a **new** project (`core.createDefaultCardProject` → new id) and apply to that.
  2. Add "Recent cards on this device" (max 5): thumbnail from a stored 160 px data URL saved with the project, first 30 characters, and an Open button. Footnote: "Saved only in this browser on this device."
  3. Cap stored projects at 20 and delete orphaned `assets`.
- **Acceptance:** P7 script: after the hand-off, both cards exist and both open from Recent cards. Two-tab test: both appear. No network calls added.
- **Effort:** M · **Risk:** medium (initialisation order with `card-studio-entry.js`; run `card-studio-background-collection.spec.js`, `urdu-cards-own-words.spec.js`, `core-workspace-convergence.spec.js`).

### BL-04 · Legible attribution and clean designer backgrounds — closes CARD-UX-006, 007
- **Files:** `js/card-studio-background-library.js` (apply flow, line ~135), `js/card-studio.js` (`objectTransform` attribution branch; template decoration draw — `drawCleanFrame` and the accent bar), `js/social-direct-workspace.js` (expose the author field on the makers).
- **Steps:**
  1. On designer background apply: `attribution.color = background.textColor`; attribution font = main font when Nastaliq; `fontSizeRatio` min 0.5.
  2. Place untouched attribution inside `safeArea`, under the text block (mirror the text safe-area logic).
  3. Skip the template frame/accent drawing when `background.type === 'image' && background.safeArea`.
  4. Auto-tick "Show author" on first non-empty input.
  5. Show the author input on the Instagram/WhatsApp makers.
- **Acceptance:** an automated loop over 44 backgrounds × 3 presets checks that the attribution rect is inside the safe area and luminance contrast ≥ 4.5:1 for sampled pixels; no frame/accent pixels with designer backgrounds; typing the author shows it immediately.
- **Effort:** S–M · **Risk:** low–medium (visual snapshots in `v3-visual-quality.spec.js` may need updating).

### BL-05 · Mobile reachability without a redesign — closes CARD-UX-009, 024, 025, 038 and the non-frozen part of 001
- **Files:** `js/card-studio-ui.js` (`setStep` line 73; expose `refresh()`), `js/card-studio-background-library.js` (call `WriteUrduCardStudioUi.refresh()` after mount), `css/card-studio.css` (artboard width at ≤ 400 px; truncated toolbar labels), `urdu-card-studio.html` (skip link; remove or relabel "Back to editor").
- **Steps:**
  1. Re-sync step panels after the library mounts, so it is hidden on Content (it already declares `data-card-step="format"`).
  2. `setStep()` scrolls the first control of the active panel into view (respecting `prefers-reduced-motion`) and focuses it.
  3. Fix horizontal overflow (`max-width:100%`, symmetric padding) at ≤ 400 px.
  4. Allow toolbar buttons to wrap (no ellipsis) on ≤ 400 px. Hide "Back to editor" unless the hand-off source is the writer.
  5. Add a "Skip to card text" link.
- **Acceptance:** At 360×780 the text box is the first control in the Content panel and is reached with one tap on "Content". `scrollWidth === innerWidth` at 360/375/393. ≤ 15 Tabs to `#cardText` on desktop. No truncated toolbar label.
- **Effort:** S · **Risk:** low. This corrects broken step behaviour and overflow; it does **not** reorder the page hierarchy (the full CARD-UX-001/005 reorder stays 🔒 in BL-07).

---

## Next — high-value medium changes

| ID | Item | Closes | Effort | Notes |
|---|---|---|---|---|
| BL-06 | **Consistent publishing for curated cards**: consent ack, store manage token, dedupe per card+text, no fake attribution; **"Get link" in the `/urdu-cards` personaliser** | 012, 013 | S–M | Reuse `card-studio-publish.js` (extract `publishSnapshot()` module). Privacy-adjacent, so not frozen. |
| BL-07 🔒 | **Mobile hierarchy**: sticky compact preview; format switcher into Format step; finish actions in a sticky bottom row; ⋯ More menu | 001, 005, 008 | M | Needs production funnel evidence (D5/D6). Ship with before/after `card_export_completed` and publish rates. |
| BL-08 | **Send sheet**: Picture vs Link with one-line explanation; WhatsApp/Facebook links when `navigator.share` is missing; rename "Share image only" | 014, part of 015 | S–M | Related to D-1 but link-only, so no raw-text share. |
| BL-09 | **Lightweight og:image** (≤ 250 KB JPEG preview stored alongside PNG) | 032 | M | Server change in `functions/api/shares.js` + `/share-media/<id>?preview`. Validate on real WhatsApp first. |
| BL-10 | **Remix designer backgrounds** (`background.type:'library'`) → "Edit this design" | 016 | S–M | Sanitizer allow-list from the registry; no user media. |
| BL-11 | **Undo covers everything**, Reset is undoable | 018 | S | Snapshot on `change`/blur. |
| BL-12 | **Photo-aware defaults**: auto text colour + overlay; template change keeps the user photo | 019, 020 | S | |
| BL-13 | **Urdu UI completeness** for steps, modes, publish, undo | 023 | S | Through copy tables. |
| BL-14 | **Ready-made card tile simplification** (≤ 3 actions, ≥ 14 px, one language per label) | 010 | M | Resolves D-2 in practice; update urdu-cards specs. |
| BL-15 | **Occasion content**: Birthday ≥ 8; Eid, Congratulations ≥ 8 each | 011 | S–M | Content work under WU-CARD-CONTENT-001A. |
| BL-16 | **Use-case defaults**: Greeting = square + designer bg + Nastaliq + emphasised first line; Notice = 4:5 | 026, 027 | M | "Emphasise first line" adds one boolean to the project and remix schema. |
| BL-17 | **Maker parity**: makers default to designer backgrounds, have author + Publish; related link carries text | 017 | M | |

## Later — larger improvements

| ID | Item | Closes | Effort |
|---|---|---|---|
| BL-18 | Performance: defer voice/community/batch scripts; lazy thumbnails; font subsetting | 029 | M–L |
| BL-19 | Recipient page: self-hosted Nastaliq; test "Make your own" → Gallery with text | 036 | S–M |
| BL-20 | Word-level Roman Urdu correction (tap a word → alternatives) | 022 | L |
| BL-21 | "Your published cards" with thumbnails and "Make a new version" | 039 | S (after BL-10) |
| BL-22 | Long-token wrapping and state-aware fit warning | 028 | S |
| BL-23 | Accessibility polish: focus ring, 14 px minimum notes, storage try/catch | 033, 035 | S |
| BL-24 | Download filename from occasion | 030 | S |
| BL-25 | Homepage: stronger post-writing "Create card" hand-off and occasion featured card (no hierarchy change) | 037 | S |

## Dependency graph (short)

BL-03 → BL-21 and also closes CARD-UX-034 (two tabs). BL-06 → BL-08 (shared publish module). BL-10 → BL-21. BL-05 → BL-07. BL-04 → BL-17.

## Verification for the whole slice

1. Re-run `evidence/harness/*.mjs` (they use the visible UI and record JSON) and compare with `evidence/logs/`.
2. `npm test`, `npm run test:browser` (desktop + mobile projects) and the `shell:check / seo:check / governance:check / locale:check` suite.
3. On production after deploy: repeat P1, P3, P5 and P7 on a real Android phone (WhatsApp installed) and an iPhone. Record WhatsApp/Facebook link previews (BL-09 decision input).
