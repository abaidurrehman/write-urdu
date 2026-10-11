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
| B | Typing resilience | Visible failure state; provider risk | `WU-JOURNEY-001B`, `WU-INPUT-001` | B1 done; B2 recorded, provider change → `WU-JOURNEY-001B` §B5 | S |
| C | Basic Writer mobile post-value | Ad inside workspace, duplicate status fixed; restore partly; rest re-scoped | `WU-PLAT-002H` / `WU-PLAT-004B` / `WU-PLAT-004C` | C5/C7 done; C2/C3 dropped; C1/C4/C6 need decision or evidence | S |
| D | Card completion quality | Poetry line fit, Nastaliq, accent artifact, safe area; mobile order deferred | `WU-PLAT-002H` P0.1F, Card Studio | D1–D4 done; D5–D6 need funnel evidence | M |
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

**State:** Implemented 2026-10-10 on `claude/wu-uxr-001-persona-ux-plan`.

| # | Finding | Change | Files | State |
| --- | --- | --- | --- | --- |
| A1 | F1 — pages without a `pageCopy` entry got the homepage `<h1>`: sign-in, audio-to-text, document translator, dictionary, voice translator, text-to-speech, and the Urdu-locale `/urdu/urdu-writing-templates` | `applyPageCopy` returns early when the path has no entry instead of falling back to `/index.html` copy. Shell cache bumped to `write-urdu-shell-v55` (with contract-test pins) so returning visitors get the fix | `js/site-header-core.js`, `sw.js` | [x] |
| A2 | F4 — InPage converter's FAQ shortcut "Open the Urdu editor" pointed to `/` | Link now points to `/urdu-editor`. The review's "text does not carry over" note was a review miss: after conversion the governed next-step panel already offers `inpage-to-rich` / `inpage-to-basic` / `inpage-to-cleaner` handoffs (covered by `tests/capture-continuity.spec.js`); no handoff change needed | `tools/inpage-unicode-converter.html` | [x] |
| A3 | F5 — `new Clipboard('.btn')` threw on every load (clipboard.js never loaded) | Dead inline script removed; Urdu locale copy regenerated | `urdu-keyboard.html`, `urdu/urdu-keyboard.html` | [x] |
| A4 | F5 — `insertBefore` NotFoundError on Stylish Text | `placeFeaturedMethod` inserts into the anchor's own parent (the direct-mode option is nested on Stylish Text); appends when no anchor | `js/writer-voice-input.js` | [x] |
| A5 | F32 — card buttons announced internal IDs ("Share dua-1 as an image") | Labels use the visible card name (`{name}`) in English and Urdu copy | `js/urdu-cards.js` | [x] |
| A6 | F31 — "unlabelled" buttons | **Dropped — review false positive.** Every flagged control sits inside a closed `<details>` menu and has a text name (Preview, Print, Find & replace, …); the sweep read `innerText` of non-rendered content | — | n/a |

Tests:

- [x] `tests/page-integrity.spec.js`: every registered page keeps its source `<h1>` unless `pageCopy` owns it; no Clipboard/insertBefore page errors on `/urdu-keyboard` and `/stylish-urdu-text-generator`; card action labels use the visible name; converter shortcut targets `/urdu-editor`. Verified to fail on the pre-fix code (4 failures) and pass after.
- [x] `tests/page-integrity-contract.test.js` (static guards for the same fixes), registered in `scripts/run-contract-tests.js`; spec registered in `playwright.config.js` and `.github/workflows/quality.yml`.
- [x] `npm test`, `shell:check`, `seo:graph:check`, `collections:check`, `locale:check`, `seo:check`, `governance:check` green; affected browser specs (cards, capture continuity, voice input, keyboard, navigation, locale, sitemap, account/editors) green.

### Slice B — Typing resilience

**State:** B1 implemented 2026-10-10 on `claude/wu-uxr-001b-typing-resilience` (stacked on Slice A). B2 recorded as a dependency finding; no provider change.

#### B1 — Visible conversion failure (F6)

Root cause, measured with Google requests blocked in a browser:

- The Google `elements` transliteration library is served from this origin (`google_jsapi.js`), so `writeUrduTransliterationReady` becomes true and the control is created even when Google is unreachable. The existing 6.5 s `showDependencyError()` in `js/site-runtime.js` therefore never fires for this case; it still covers a genuine library load failure.
- Each typed word is a JSONP `<script>` appended to `<head>` for `www.google.com/inputtools/request`. When it fails, the word silently stays in English letters.
- The control's `SERVER_UNREACHABLE` / `SERVER_REACHABLE` events never fire for these failures (waited 25 s).
- After a failure the library backs off briefly (under 5 s) and then retries on the next word; it does not stay broken. The review's "endless Loading Urdu typing…" was screen-reader-only text, not a visible spinner.

Change:

- [x] `js/input-mode.js` watches `<head>` (direct children only) for word-request scripts and listens on each script's own `load`/`error` (the library removes them in its callback, so window-level capture misses `load`). A failure shows the existing input-mode alert in an `unavailable` state — "Urdu conversion is not responding, so words are staying in English letters. Your next word will try again." with a **Type Urdu directly** action (English + Urdu copy). The next successful request hides it.
- [x] `js/batch-transliteration.js` reports passage-conversion success/failure through `write-urdu:transliteration-status`, so both paths share one provider state; its own inline error copy is unchanged.
- [x] The alert sits above the editor, so every alert size change runs inside `keepFocusedTargetInPlace`: measure the focused editor, apply the change, correct with an `instant` scroll (the homepage sets `scroll-behavior: smooth`), and correct again on the next frame for browser scroll anchoring. Measured editor movement on show and hide: 0 px on mobile and desktop.
- [x] Shell cache bumped to `write-urdu-shell-v56`.
- Out of scope: the invoice generator uses the Google control without an input-mode control, so it has no alert slot; cover it if/when it adopts the shared input-mode control.

Tests:

- [x] `tests/transliteration-availability.spec.js`: failed word → visible `unavailable` alert, value unchanged, editor moves ≤ 1 px; recovery → alert hidden, word converted, editor ≤ 1 px; action switches to direct mode; passage-conversion status events drive the same alert. All three fail on the pre-change code.
- [x] `tests/transliteration-availability-contract.test.js` static guards; both registered in the contract runner, Playwright config and Quality workflow.

#### B2 — Provider dependency record (F7)

- Interactive typing depends on Google's legacy `google.elements.transliteration` control (bundled locally) calling `www.google.com/inputtools/request` per word; passage conversion calls `inputtools.google.com/request` with `fetch`. Both are the same undocumented Input Tools service, so one outage affects both paths — B1 makes that visible but cannot work around it.
- Quality is already benchmarked and closed under `WU-JOURNEY-001B` (Google baseline 59.2% on 103 scored fixtures, 71.8% after the passage protected-token transform). The open risk is **availability/longevity**, not quality.
- Any provider change — moving per-word typing onto the `fetch` path, a local rule-based fallback, or another provider — belongs to `WU-JOURNEY-001B` §B5 (provider evaluation), which already requires a migration decision, latency/privacy and search-risk review. Decision **D-4** stays open until that evaluation is scheduled.
- Suggested evidence before D-4: count `unavailable` alerts per session (would need a content-free telemetry event under the `WU-PLAT-002H` metrics contract; not added in this slice).

### Slice C — Basic Writer mobile post-value (inside `WU-PLAT-002H`)

**State:** Re-scoped and partly implemented 2026-10-10 on `claude/wu-uxr-001c-basic-writer-mobile` (stacked on Slice B).

Governance applied: `WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md` §15 requires any post-2026-09-04 hierarchy change to `/` to be justified with **post-release production evidence**, and forbids anything masking the usable writing area (§5.3) and churn from pre-release data. This review was a sandbox persona walkthrough, not that evidence, so every item was re-measured on current code and split into *defects* (fixed) and *hierarchy/flow changes* (left for decision).

| # | Finding | Re-measured result | Outcome |
| --- | --- | --- | --- |
| C1 | Draft Restore below the fold (F9) | Fresh visit, 412×839: Restore at 1,177 px → **1,016 px** after the C7 fix (desktop 1,305 → 1,088). After a reload it is inside the first viewport (672 px). Still below the fold on a fresh visit. | **Partly fixed** by C7. Making it fully visible needs auto-restore, a prompt above the editor, or an in-editor overlay — each conflicts with privacy on shared devices or with the mobile repair's no-masking (§5.3) / editor-first rules. → decision **D-5** |
| C2 | Editor jumps ~200 px at first keystroke (F10) | Viewport top of the editor is unchanged (437 → 437 px); `captureEditorAnchor()` in `js/basic-writer-command-toolbar.js` already compensates. The review compared document positions. | **Dropped — not reproducible** |
| C3 | Collapse PDF/Word/PNG into `Download ▾` on mobile | `WU-PLAT-004C` (2026-09-13) deliberately keeps PDF/Word/PNG first-level on compact screens because they are ~98.6% of measured exports. | **Dropped — superseded by `WU-PLAT-004C` evidence** |
| C4 | Duplicate guidance above the editor (F11) | Still present (hero line, "Two ways…" panel, example strip). | **Not changed** — hierarchy change; needs post-release evidence per §15 |
| C5 | "Convert passage" stays visible; success shown twice (F12) | Confirmed: prompt and status both said "The passage was converted…", button stayed visible. | **Fixed** — success confirms once in the live `role="status"` line; prompt and button retire until new English-letter text needs them; "text changed" keeps the question for retry and explains once |
| C6 | Two taps to start voice (F13) | Still two taps. Voice discovery/adoption is a measured `WU-PLAT-002H` decision ("Voice is an input choice"). | **Not changed** — flow change; needs Voice activation evidence |
| C7 | Ad directly under the editor on mobile (F14) | Confirmed on `/` only: the ad sat between `#demo` and the editor's own `.editor-productivity` panel (status, punctuation, draft recovery), because `editor-tools.js` and `write-monetization.js` both insert "after `#demo`" and the ad script runs later. `/urdu-editor` and `/urdu-keyboard` already place the ad after their tools. | **Fixed** — the post-workspace ad boundary now includes the tools panel (set from either script, so load order cannot reintroduce it). One ad, still after the workspace, per `WU-ADSENSE-OPERATING-CONTRACT` |

Tests:

- [x] `tests/basic-writer-workspace-integrity.spec.js`: on `/` the tools panel carries the post-workspace boundary and precedes the ad; `/urdu-editor` keeps its ad after the tools; passage conversion confirms once, hides its button, and re-offers it for new English-letter text. The `/` and passage tests fail on the pre-change code.
- [x] `tests/basic-writer-workspace-integrity-contract.test.js`; both registered in the contract runner, Playwright config and Quality workflow. Shell cache bumped to `write-urdu-shell-v57`.

### Slice D — Card completion quality (inside P0.1F)

**State:** D1–D4 implemented 2026-10-10 on `claude/wu-uxr-001d-card-quality` (stacked on Slice C). D5–D6 deferred. This is output-quality work on the Card Studio renderer under the P0.1F completion gate; it is not the indexing/cross-linking scope of the P0.9 exception and does not touch acquisition.

| # | Finding | Root cause | Outcome |
| --- | --- | --- | --- |
| D1 | A two-line couplet exported as 5 wrapped lines (F3) | `findBestFontSize` maximised size against box **height** only, so short verse grew until each line wrapped | **Fixed** (`js/card-studio-core.js`): when text has ≥ 2 written lines, prefer the largest size at which every written line stays whole, if that size is still readable (≥ 5% of the text-box width); otherwise keep the height-based fit. Single-line text and long paragraphs are unchanged |
| D2 | Poetry design defaulted to Naskh (F26) | Font comes only from the post-style template; backgrounds never set it | **Fixed** (`js/card-studio-background-library.js`): a `poetry`-category background switches to Noto Nastaliq Urdu and raises line height to ≥ 1.8 (the built-in Nastaliq styles' value), unless the writer chose a font themselves (trusted `change` on the font select). Line height is set through `WriteUrduCardStudioApp.updateTextStyle` because some maker pages' range input has no `step` |
| D3 | Stray white bar at top-right of the export (F3) | The non-centred accent was drawn with `fillRect` after setting only `strokeStyle` (inherited white), and for right alignment it started at the margin and extended **off** the canvas | **Fixed** (`js/card-studio.js`): accent uses the template accent colour and ends at the right margin |
| D4 | Text over the artwork (F3) | Each background's `safeArea` was used only by the Gallery/Cards DOM previews; the canvas export ignored it. The default text box exceeded the safe area in **132 of 132** background × (square, portrait, story) pairs, by up to ~20% of the height | **Fixed**: the background library hands its safe area to Card Studio with the image; untouched text (not moved/resized) is laid out inside it in every canvas size; uploading your own image clears it. Alignment is intentionally not taken from the background (every record defaults to `center`, which would override the chosen post style) |
| D5 | Mobile maker order (download before design/preview) | — | **Deferred** — layout change on a creation surface; `WU-PLAT-002H` decision log: do not assume complexity causes the Card Studio completion drop until the funnel identifies it |
| D6 | Tall horizontal background tiles on mobile | — | **Deferred** — same reason as D5 |

Tests:

- [x] `tests/card-text-fit-contract.test.js`: couplet stays on its written lines at a readable size; single-line and long-paragraph text keep the height-only size; static guards for the accent, safe-area and poetry-font rules. Fails on the pre-change code.
- [x] `tests/card-poetry-quality.spec.js` (Instagram maker): poetry background → Nastaliq, line height ≥ 1.8, two lines, text box inside the safe area; a writer-chosen font is kept; uploading an image clears the safe area; right-aligned accent pixel is accent-coloured inside the margin and absent beyond it. Three of four fail on the pre-change code (the font-kept test is a regression guard).
- [x] Existing `tests/wedding-invitation-render-adapter.test.js` (renderer fit for wedding wording) still passes. Shell cache bumped to `write-urdu-shell-v58`.

### Slice E — Export fidelity (`WU-JOURNEY-001F`)

Founder decision D-6: **do both** — keep the direct PDF download and add a print-quality PDF route.

- [x] **E1** Benchmark (Chromium, Nastaliq heading + paragraph, Naskh, mixed Urdu/English/numbers, a bill table). Current `html2canvas` → JPEG → jsPDF breaks Arabic shaping and does not draw Nastaliq. `foreignObjectRendering` fixes shaping but not the Nastaliq font, even with ~1.9 MB of embedded data-URI fonts. The browser print engine (Print → Save as PDF) gives correct Nastaliq, embedded and selectable fonts and an intact bill table.
- [x] **E2 (F2)** `WriteUrduExport.printDocument(source, { richText, title, skipCredit })` in `js/site-runtime.js` lays out real text in a hidden frame (same Google Fonts links as the page, A4 `@page`, waits for fonts) and opens the print dialog. Basic Writer, Rich Editor and their `/urdu/` mirrors get a **PDF (print quality)** action beside the unchanged direct **PDF** download (`#exportPdfPrint`; Basic Writer download menu action `pdf-print`; the first-level direct exports stay PDF, Word, PNG).
- [x] **E3** Bill generator: **PDF (print quality)** button (`data-bill-pdf-print`) uses the existing bill print stylesheet through `window.print()`; the direct **Download PDF** is unchanged. Invoice generator is not changed in this slice.
- [ ] **E4 (F29)** Real `.docx` instead of HTML renamed `.doc`. Gated: the freeze lists "new export formats". Treat as a format *correction* only with founder approval.

Tests: `tests/print-quality-pdf-contract.test.js`, `tests/print-quality-pdf.spec.js` (frame holds real RTL Urdu text, Nastaliq font, no images, rich formatting kept). Shell cache bumped to `write-urdu-shell-v59`.

### Slice F — Unified Urdu input in fields

Use `skills/unified-urdu-input` (rollout skill). Card Studio is the designated pilot, then social makers.

- [x] **F1 (F23)** "Make this card yours" dialog on `/urdu-cards`: add English letters → Urdu / Type Urdu directly toggle (`js/urdu-cards.js`).
- [x] **F2 (F23)** (verified: dedicated pages already have the toggle; no change needed) Card Studio / WhatsApp / Instagram text box: confirm the toggle works on the dedicated pages (seen present) and reuse it in the dialog.
- [x] **F3 (F17)** Bill shop name and item description fields: Roman Urdu assist (`WU-BILL-001` checklist line 275). Only through the shared engine; no new transliteration code inside bill files. Done via `js/bill-generator-urdu-input.js` (registers shop name, customer name and item descriptions with the shared control; item rows re-registered on re-render).

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
| D-5 | How should a returning visitor see their unsaved draft on a fresh visit? Options: auto-restore with Undo; a compact Restore line above the editor only when a draft exists; keep the current below-editor Restore (now ~160–220 px higher). | Auto-restore exposes drafts on shared devices; anything above or over the editor conflicts with `WU-PLAT-002H` mobile §5.3/§15 unless post-release evidence justifies it. | C1 |

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
