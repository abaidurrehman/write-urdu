# WU-UXR-002 — Card Studio UX Remediation (from the 2026-10-11 field study)

**Status:** Planned — implementation-ready. Execute one slice per branch/PR, in the order below.
**Date:** 2026-10-11
**Source evidence:** [`docs/audits/urdu-card-studio-ux-2026-10-11/`](../docs/audits/urdu-card-studio-ux-2026-10-11/01-executive-summary.md) — findings `CARD-UX-001`…`039` in [`03-ux-findings.md`](../docs/audits/urdu-card-studio-ux-2026-10-11/03-ux-findings.md) / [`ux-findings.csv`](../docs/audits/urdu-card-studio-ux-2026-10-11/ux-findings.csv); backlog `BL-01`…`BL-25` in [`04-prioritized-backlog.md`](../docs/audits/urdu-card-studio-ux-2026-10-11/04-prioritized-backlog.md).
**Relationship to `WU-UXR-001`:** `WU-UXR-002` continues `WU-UXR-001` Slice D (card completion quality) and keeps its decisions (D-1…D-5). It does not reopen dropped items. `WU-UXR-001` D5/D6 (mobile maker order, background tile size) are absorbed into Slice O here, with the same evidence gate.
**Execution skill:** [`skills/wu-uxr-002-card-studio/SKILL.md`](../skills/wu-uxr-002-card-studio/SKILL.md). Checklist with ready-to-paste prompts: [`WU-UXR-002-IMPLEMENTATION-CHECKLIST.md`](WU-UXR-002-IMPLEMENTATION-CHECKLIST.md).

---

## 1. Problem statement

A browser-driven audit of `main` @ `7a14bde` (8 synthetic personas, 12 journeys, 5 viewports) found that ready-made cards and the Gallery let ordinary users make attractive Urdu cards. A **blank Card Studio on a phone** does not do so reliably. In order of harm:

1. **Wrong output.** Phone numbers are reversed after Urdu text (`0300-1234567` → `1234567-0300`).
2. **Lost work.** Any hand-off into Card Studio silently overwrites the only saved card.
3. **Silent failures.** "Use sample text" inserts the placeholder, so Download refuses, and the refusal is overwritten by "Saved on this device".
4. **Weak defaults.** The poet/author name is illegible on designer art, the template frame is drawn over designer frames, and dark text stays dark on dark photos.
5. **Reachability.** On phones the text box is 1,800–3,350 px down, the step bar does not navigate, 360 px overflows, and the preview is off-screen while designing.
6. **Inconsistent publishing.** Ready-made "Shareable link" publishes silently and cannot be deleted. The makers and the personaliser cannot create links. There are no WhatsApp/Facebook routes without the share sheet.

## 2. Outcomes

| Outcome | Measure (harness or test) | Baseline (2026-10-11) | Target |
|---|---|---|---|
| Exported text is exactly what was typed | Bidi fixture test | 3/4 fixtures wrong | 4/4 correct |
| No silent refusals | P1 sample → Download | No file, message lost | File downloaded; any refusal visible ≥ 6 s in viewport |
| No silent loss of local work | P7 hand-off run | Week-0 card lost | Both cards in Recent cards |
| Legible credit line | 44 backgrounds × 3 sizes contrast check | Fails on dark art | ≥ 4.5:1, inside safe area |
| Text box reachable on phones | `01-first-impression` @360 | 3,354 px; step tap no-op | Reached with one tap; first control of the Content panel |
| No horizontal overflow | scrollWidth @360/375/393 | 390 @360 | = innerWidth |
| Every public link is consented and deletable | P8 stock link | Silent, undeletable | Ack shown once; listed in Manage; delete → 410 |

Production follow-up (Product Pulse, content-free events): `card_export_completed`, `share_publish_completed`, `card_export_refused{reason}`, `card_project_forked{source}`, and referred-creation starts (existing `share-loop-telemetry`).

## 3. Governance

- `WU-PLAT-002H-SCOPE-FREEZE.md`: slices **A–F, G, J, K** are defect, data-loss, privacy, correctness or accessibility work → **not frozen**. Slices **H, I, L, M, N** change defaults, sharing surfaces or content, so record a one-line backlog decision before starting. Slice **O** changes mobile hierarchy on a creation surface → **gated**: it needs post-release production funnel evidence (`WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR` §15, `WU-UXR-001` D5) **and** founder decision `D-UX2-1`.
- No new acquisition pages, export formats, accounts or third-party services. No social auto-posting. No larger watermarks. No pop-ups on the recipient page.
- Privacy contract `WU-SHARE-001` stays authoritative. User-uploaded images must never enter a remix payload or be published without the publish dialog.
- Homepage hierarchy (`/`) is out of scope except Slice P's post-writing hand-off copy.
- All new telemetry is content-free and follows `WU-PLAT-002H-METRICS-CONTRACT.md`.

## 4. Engineering conventions every slice must follow

1. **One slice = one branch = one PR.** Branch name `claude/wu-uxr-002<letter>-<slug>` (for example `claude/wu-uxr-002a-bidi`). Stack on the previous slice's branch only if it depends on unmerged code.
2. **Copy in both languages.** Card Studio strings live in the `copy.en` / `copy.ur` tables in `js/card-studio.js` (lines ~39–40 plus the overrides below them). Labels set in `js/card-studio-ui.js` / `js/card-studio-publish.js` must also have Urdu text. After changing `urdu-card-studio.html`, `urdu-cards.html` or a maker page, run `npm run locale:generate` and commit the regenerated `urdu/*.html`.
3. **Service-worker cache.** If you change any file listed in `sw.js` `APP_SHELL` (most `js/card-*`, `css/card-studio*.css`, the card HTML pages), bump `CACHE_NAME` in `sw.js` (currently `write-urdu-shell-v64` after Slice C; `main` is at v61 after #256). Then update every pinned test: `grep -rl "write-urdu-shell-v64" tests | xargs sed -i 's/write-urdu-shell-v64/write-urdu-shell-v65/g'` (use the next free number).
4. **Tests.** Every slice adds:
   - a **contract test** `tests/<name>-contract.test.js`, registered in `scripts/run-contract-tests.js`;
   - a **browser spec** `tests/<name>.spec.js`, registered in `playwright.config.js` `testMatch` **and** in `.github/workflows/quality.yml` (the `npx playwright test` list under the step **Run focused product browser acceptance**).

   The new tests must fail on the pre-change code (say so in the PR). Mock `/api/shares` in browser specs as the existing specs do (`tests/core-workspace-convergence.spec.js` lines ~56–70).
5. **Standard validation** (run all, paste the summary in the PR):
   ```bash
   npm ci
   npm test
   npx playwright test <new and touched specs> --project=desktop-chromium --project=mobile-chromium
   npm run shell:check && npm run seo:graph:check && npm run collections:check
   npm run locale:check && npm run seo:check && npm run governance:check
   ```
   `playwright.config.js` uses `channel: 'chrome'`, so Google Chrome must be installed, or run `npx playwright install chrome`.
6. **Re-measure** with the audit harness (`docs/audits/urdu-card-studio-ux-2026-10-11/evidence/harness/README.md`) and attach the relevant `out/*.json` deltas to the PR. If a slice moves a control, update the harness selector in the same PR.
7. **Shared renderer.** `js/card-studio.js` and `js/card-studio-core.js` also power `/urdu-whatsapp-status-maker`, `/urdu-instagram-post-maker`, name art (`?nameArt=1`), Facebook role (`?role=facebook`) and the Gallery/Cards previews. Run `card-poetry-quality.spec.js`, `card-gallery.spec.js`, `urdu-cards*.spec.js`, `whatsapp-status-discovery.spec.js`, `urdu-wedding-invitation-maker.spec.js` and `wedding-invitation-render-adapter.spec.js` whenever the renderer changes.
8. **Update the records.** Tick the slice in `WU-UXR-002-IMPLEMENTATION-CHECKLIST.md`, record the state under P0.12 in `specs/BACKLOG.md`, and mark the closed `CARD-UX-…` IDs in the PR description.

---

## 5. Execution order

| Order | Slice | Theme | Closes | Size | Freeze |
|---|---|---|---|---|---|
| 0 | Baseline | Production verification + harness baseline | — | S | Not frozen |
| A | **Output correctness** | Bidi-safe numbers/Latin in canvas text | 003, 028 (part) | S | Not frozen |
| B | **Truthful feedback** | Sample text, persistent errors, save indicator, labels, privacy copy, filename | 004, 015 (copy), 021, 022 (status/placement), 030, 031 | S | Not frozen |
| C | **Protect local work** | No overwrite on hand-off; Recent cards on this device | 002, 034 | M | Not frozen |
| D | **Legible credit, clean designs** | Attribution colour/font/safe area; no template frame on designer backgrounds | 006, 007 | S–M | Not frozen |
| E | **Reachability fixes** | Step panels sync + scroll; overflow; skip link; Back-to-editor | 009, 024, 025, 038, 001 (step bar) | S | Not frozen |
| — | *Slice-1 gate* | Re-run all personas; production check after deploy | — | — | — |
| F | Consistent publishing | Curated "Shareable link" consent/manage/dedupe; personaliser "Get link" | 012, 013 | S–M | Not frozen (privacy) |
| G | Safe editing | Undo for all edits and Reset; photo-aware text; template keeps photo | 018, 019, 020 | S | Not frozen |
| H | Send sheet | Picture vs Link; WhatsApp/Facebook links without share sheet | 014, 015 (rest) | S–M | Decision line |
| I | Link previews | Lightweight og:image | 032 | M | Decision `D-UX2-2` + device check |
| J | Re-editable links | Remix designer backgrounds; "Your published cards" | 016, 039 | S–M | Not frozen |
| K | Urdu UI + a11y polish | Urdu labels; focus ring; storage guard; long tokens | 023, 033, 035, 028 | S | Not frozen |
| L | Better defaults | Greeting vs Notice use cases; emphasised first line | 026, 027 | M | Decision line |
| M | Maker parity | Designer defaults, author, publish, text carry-over on makers | 017 | M | Decision line |
| N | Ready-made cards | Tile simplification; Birthday + occasion depth | 010, 011 | M | Content owner gates |
| O 🔒 | Mobile hierarchy | Sticky preview, sticky finish row, ⋯ More | 001, 005, 008 | M | **Gated** (`D-UX2-1`) |
| P | Later | Performance; recipient font/CTA; word correction; homepage hand-off | 029, 036, 022 (rest), 037 | M–L | Per owner |

Each slice's acceptance is independent, so the order can change if production evidence (Slice 0) changes priorities.

---

## 6. Slices

### Slice 0 — Baseline and production verification

**Goal:** confirm the sandbox findings on production before changing code, and freeze a numeric baseline.

Steps:
1. Install and run the harness against the local tree (`npm run server`, `npm run first-impression`, `npm run personas`, `npm run journeys`, `npm run resilience`). Save `out/` as the pre-change baseline (do not commit it).
2. Production, **read-only** (`WU_BASE=https://write-urdu.com`): `01-first-impression`, `p5` (bidi), `p6`, `j04j07`. Do **not** run p3/p7/p8 there (see the harness README).
3. Manually on a real Android phone with WhatsApp:
   1. Publish one `[TEST]` card with a designer background and one with a gradient.
   2. Paste both links in a WhatsApp chat to yourself and screenshot the previews.
   3. Delete both links via Manage published links.
   4. Repeat once on iPhone/Safari.

   This decides `D-UX2-2`.
4. Record results in §9 (verification log).

**Exit:** each P1 finding is marked *confirmed on production* or *not reproducible*. Any finding not reproducible on production is dropped from its slice with a note.

---

### Slice A — Output correctness: bidi-safe canvas text

**Closes:** CARD-UX-003 (+ the punctuation part of 028). **Owner:** Card Studio renderer (`WU-UXR-001` Slice D lineage).

**Root cause:** Unicode bidi rule W2. European digits that follow Arabic-script letters become Arabic numbers, so `-` between them resolves RTL. Every line is drawn with `ctx.direction = 'rtl'` and no isolation.

**Files**
- `js/card-studio-core.js`: add `isolateBidiRuns(text)` near `normalizeLines` (~line 228) and export it on `window.WriteUrduCardStudio`. Use it inside `wrapRtlText` (~line 232) for every `measureText` call on a candidate line.
- `js/card-studio.js`: `drawTextObject` (~line 380–392). Draw `core.isolateBidiRuns(line.text)` instead of `line.text`.
- `js/wedding-invitation-render-adapter.js` / `js/urdu-wedding-invitation-maker.js`: check whether they draw via the same core. If they draw their own lines, apply the helper there too (separate commit).

**Implementation**
```js
// U+2066 LEFT-TO-RIGHT ISOLATE … U+2069 POP DIRECTIONAL ISOLATE.
// Render-only: never write the result back into project state, public_text or remix payloads.
var LRI = '⁦', PDI = '⁩';
var NUMBER_RUN = /[0-9۰-۹][0-9۰-۹\-\/.:+, ]*[0-9۰-۹]|[0-9۰-۹]/g;
var LATIN_RUN = /[A-Za-z][A-Za-z0-9 .,'’@#&_\-\/:]*[A-Za-z0-9][!?.,:;)]*|[A-Za-z][!?.,:;)]*/g;
function isolateBidiRuns(text) {
    var value = String(text == null ? '' : text);
    if (!/[A-Za-z0-9۰-۹]/.test(value) || !/[؀-ۿ]/.test(value)) return value; // pure LTR or pure Urdu: untouched
    return value.replace(LATIN_RUN, function (run) { return LRI + run + PDI; })
                .replace(NUMBER_RUN, function (run, offset, whole) {
                    return isInsideIsolate(whole, offset) ? run : LRI + run.trim() + PDI + (/\s$/.test(run) ? ' ' : '');
                });
}
```
- Implement `isInsideIsolate` (count LRI/PDI before `offset`), or do one pass with a combined regex. Keep it simple and unit-tested.
- Trailing spaces must stay outside the isolate so word wrapping is unchanged.
- Pure-Urdu text and pure-English text must return the identical string. This protects existing visual snapshots.

**Tests**
- `tests/card-bidi-render-contract.test.js` (Node, loads `card-studio-core.js` in a VM like `tests/card-text-fit-contract.test.js` does). Assert:
  - `isolateBidiRuns('رابطہ: 0300-1234567')` contains `⁦0300-1234567⁩`;
  - Pure-Urdu and pure-Latin inputs are unchanged;
  - `Happy Friday!` → isolate includes `!`;
  - Urdu digits `۰۳۰۰-۱۲۳۴۵۶۷` are isolated;
  - the function is idempotent.
- `tests/card-bidi-render.spec.js` (browser):
  1. Open `/urdu-card-studio`, choose direct input, set text `رابطہ: 0300-1234567`, wait for `write-urdu:card-rendered`.
  2. Read back the order by drawing the isolated line on an offscreen LTR canvas and comparing the bounding x of the glyph run for `0300` vs `1234567` (`0300` must be left of `1234567`). Or assert via `currentLayouts` plus a pixel probe of the leftmost dark column against a reference render of `1234567` alone.

  Keep it deterministic and avoid OCR.
- Re-run `card-text-fit-contract.test.js`, `card-poetry-quality.spec.js`, `v3-visual-quality.spec.js`.

**Acceptance**
- The four fixtures from `RES-mixed-urdu-english.jpg` / `P5-phone-number-reversed-crop.jpg` render in typed order.
- `state.text.value`, `public_text` and remix payload are byte-identical before and after.
- Couplet and auto-fit tests unchanged.

**Out of scope:** changing HTML rendering on `/s/` pages. The browser HTML bidi gives the same result there, but the text is selectable and copied as typed. Track separately if Slice 0 shows the HTML block also reads wrongly to users.

---

### Slice B — Truthful feedback and copy

**Closes:** CARD-UX-004, 021, 015 (copy part), 022 (status + prompt placement), 030, 031.

**Files:** `js/card-studio-ui.js` (`contentAction` ~line 115), `js/card-studio.js` (`setStatus` ~line 79, `saveProject` ~line 200, `exportPng`/`shareCard` ~line 426–427, `filename()` ~line 423, copy tables ~lines 39–60, `bindControls` upload handler), `js/card-studio-publish.js` (`publishCurrent` error mapping, `errorDialog`), `urdu-card-studio.html` (+ `urdu/urdu-card-studio.html` via `locale:generate`), `css/card-studio.css`, `js/social-direct-workspace.js` (makers share the status element; keep parity).

**Steps**
1. **Real sample text.** Add `core.SAMPLE_TEXTS = { default: 'صبح بخیر!\nاللہ آپ کا دن خوشیوں سے بھر دے۔', quote: …, story: …, announcement: … }`. `contentAction('sample')` uses `SAMPLE_TEXTS[state.useCase] || SAMPLE_TEXTS.default`. It must never equal `core.DEFAULT_TEXT`.
2. **Separate save indicator.** Add `<span class="card-studio-save-indicator" data-card-save-indicator aria-live="off"></span>` next to the History group. `scheduleSave`/`saveProject` write `saving`/`saved`/`storageUnavailable` there and **never** touch `[data-card-status]`. Storage-unavailable stays an error in `[data-card-status]` once.
3. **Sticky errors.** `setStatus(message, 'error')` sets `data-sticky="true"`. Non-error messages do not replace a sticky error until the next user input/click (`root` capture listener clears it). Also show refusals as a toast near the pressed button: reuse the `.wu-share-toast` pattern from `card-studio-publish.js`, positioned fixed bottom on ≤ 900 px. On `emptyText`, focus `#cardText` and scroll it into view.
4. **Labels.**
   - `copy.en.removeImage = 'Remove image'`; keep `imageRemoved` for the status.
   - `copy.en.privacy = 'Saved only on this device. Nothing is uploaded unless you choose Publish & Share.'`; Urdu: `'صرف اسی آلے پر محفوظ ہے۔ جب تک آپ شائع اور شیئر نہ کریں، کچھ اپ لوڈ نہیں ہوتا۔'`.
   - `copy.en.exportPrivacy = 'Download saves a picture for WhatsApp Status or Instagram. Publish & Share makes a public link — best for WhatsApp chats and Facebook.'` (+ Urdu).
   - Update the matching static text in `urdu-card-studio.html` (`data-wu-l10n="urdu-card-studio.exportPrivacy"`) and its locale source so `locale:generate` produces the Urdu.
5. **Publish error copy** (`card-studio-publish.js`): map `share_storage_unavailable` and generic failures to "Links can't be created right now. Your card is safe here — download the picture and send it instead." Add a **Download picture** button in `errorDialog` that clicks the first `[data-card-action="download"]`.
6. **One Roman-Urdu status.** In `card-studio.js`, listen for the input-mode alert state (`write-urdu:transliteration-status` from `js/input-mode.js` / `js/batch-transliteration.js`, WU-UXR-001 B1). Hide `[data-card-transliteration-status]` while the `unavailable` alert is visible and restore it on recovery.
7. **Convert prompt placement.** Move the batch prompt and button (`[data-batch-prompt]`, `[data-batch-action]`, `[data-batch-status]`) to directly **after** `#cardText`. Leave the explanatory text above. Do this in `urdu-card-studio.html`, and in `social-direct-workspace.js` for the makers. Keep the `data-batch-*` contract `js/batch-transliteration.js` expects (it finds them inside `[data-batch-transliteration]`). If needed, move the whole panel below the field and keep only the one-line guide above.
8. **Filename.** `filename()`: when `state.name` is empty or `'Untitled card'`, use `'urdu-' + (state.useCase || 'card') + '-' + date + '.png'`, with no spaces.

**Tests**
- `tests/card-studio-feedback-contract.test.js`: sample text ≠ DEFAULT_TEXT; `removeImage` en label; no `not uploaded` absolute claim; no `straight to … Instagram` claim; filename pattern.
- `tests/card-studio-feedback.spec.js` (desktop + mobile):
  - Sample → Download produces a download event.
  - Clear text → Download → refusal text visible in the viewport after 2 s (beyond the 700 ms autosave).
  - Broken image upload (a 13-byte `.png` buffer via `setInputFiles`) keeps the error.
  - With `/api/shares` → 503, the error dialog has a Download picture button.
  - With the transliteration `unavailable` event dispatched, only one status is visible.
  - At 360×780, the convert button's top is within 200 px below `#cardText`.

**Acceptance:** as in tests, plus `npm run language:check` passes, plus harness `p1.mjs` shows the downloaded sample and `p6.mjs` shows the upload error retained.

---

### Slice C — Protect local work (no overwrite + Recent cards)

**Closes:** CARD-UX-002, 034. Prepares 039.

**Current behaviour:**
- `card-studio-handoff-adapter.js` `apply()` (~lines 77–109) writes the hand-off into the loaded project (`replaceState` / `updateObjectText`).
- `card-studio.js` `initialise()` (~line 490) builds a project from `?template=` or incoming text. It only ever restores `dbGetLatest()`.
- IndexedDB `writeUrduCardStudio` has stores `projects` (keyPath `id`, index `updatedAt`) and `assets` (index `projectId`).

**Files:** `js/card-studio.js`, `js/card-studio-handoff-adapter.js`, `js/card-studio-core.js` (id helper), `urdu-card-studio.html` (Recent cards container in the Content section), `css/card-studio.css`, `js/urdu-cards-returning-state.js` (optional entry: "Continue your last card").

**Steps**
1. **"Has user work" predicate** in `card-studio.js`: `hasUserWork(state)` is true if `text.value.trim()` is non-empty and ≠ `DEFAULT_TEXT` and ≠ any `SAMPLE_TEXTS` value, **or** `background.imageAssetId`, **or** `updatedAt` > `createdAt` + 2 s. Expose `app.hasUserWork()` and `app.forkProject()`.
2. **Fork before applying.** `app.forkProject()`:
   - flush any pending save (`saveProject` immediately);
   - create `core.createDefaultCardProject('')` with a new id and set it as `state`;
   - keep `scope`;
   - clear `currentAsset` unless the hand-off supplies one.

   Call it:
   - (a) in `handoff-adapter.apply()` before `replaceState`/`updateObjectText` when `app.hasUserWork()`;
   - (b) in `initialise()` when `incoming` or `selectedTemplate` is present. That path already builds a fresh project with a new id (`'card_' + Date.now().toString(36)`, `card-studio-core.js` ~line 136); confirm the previous record is kept, and make sure the later `dbGetLatest()` callback cannot replace the fresh project (it is guarded by `userChanged` today; add `incoming || selectedTemplate` to that guard);
   - (c) in `card-studio-ui.js selectUseCase` — **no fork** (same card, new layout).
3. **Persist thumbnails.** In `saveProject()`, add `thumbnail`: a 160 px-wide JPEG data URL from the canvas, `quality .6`, ≤ 12 KB. Skip it if `canvas.toDataURL` throws (tainted) or the canvas is empty.
4. **List + open.**
   - `dbListRecent(limit)` iterates the `updatedAt` index in `prev` order, filtered by scope, returning `{id, name, text excerpt, thumbnail, updatedAt}`.
   - `openProject(id)` loads the record, normalises it, calls `replaceState(..., {save:false})`, then `restoreAsset()` and `syncControls()`.
5. **UI.**
   - In the Content section under the text actions, add `<section class="card-studio-recent" data-card-recent hidden aria-labelledby="cardRecentTitle"><h3 id="cardRecentTitle">Recent cards on this device</h3><ul data-card-recent-list></ul><p class="card-studio-help">Saved only in this browser. Other phones and cleared browsers won't have them.</p></section>`.
   - Show it when there are ≥ 2 projects. Each item is a button with the thumbnail and excerpt, plus the label "Open" (Urdu: "کھولیں"). Highlight the current card.
6. **Notice on fork.** After a fork caused by a hand-off, call `setStatus('Started a new card. Your previous card is in Recent cards.')` (non-error, Urdu copy too).
7. **Retention.** Cap at 20 projects per scope; delete the oldest and their `assets` rows.
8. **Telemetry (optional, content-free).** `card_project_forked{source:'handoff'|'template'|'incoming'}`, via the existing product telemetry helper if one is already loaded on the page. Do not add a new transport.

**Tests**
- `tests/card-studio-recent-contract.test.js`: static guards: the fork call precedes `replaceState` in the adapter; the cap constant exists; the copy exists in en/ur.
- `tests/card-studio-recent.spec.js`:
  1. Create card A (direct text) and wait for the save.
  2. Go to `/urdu-cards` → Make it mine → More editing in Card Studio.
  3. Edit to card B and reload `/urdu-card-studio`.
  4. Assert IndexedDB has 2 projects, Recent shows 2, and opening A restores A's text.
  5. Two-tab case: both projects are listed.
  6. `?template=` on top of user work also forks.
- Re-run `card-studio-background-collection.spec.js`, `urdu-cards-own-words.spec.js`, `core-workspace-convergence.spec.js`, `create-publish-boundaries.spec.js`, `home-featured-card.spec.js`.

**Acceptance:** harness `p7.mjs` shows both projects in IndexedDB and in the UI, with no network requests added. Direct return still auto-restores the latest card.

**Risks:** the init race between `dbGetLatest()` and the hand-off adapter. The adapter may run after `dbGetLatest` resolves. Guard with `userChanged` and make the fork idempotent per hand-off envelope id.

---

### Slice D — Legible credit line and clean designer backgrounds

**Closes:** CARD-UX-006, 007.

**Files:** `js/card-studio-background-library.js` (apply flow ~lines 125–160), `js/card-studio.js` (`objectTransform` ~line 150; `drawCard` decoration block ~lines 404–405; `drawTextObject` attribution font), `js/card-studio-core.js` (`normalizeCardProject` attribution defaults if needed), `js/social-direct-workspace.js` (expose the author field on makers), `urdu-card-studio.html` (author input behaviour).

**Steps**
1. **Attribution follows the design.** When a designer background is applied:
   - `dispatchField('attribution.color', background.attributionColor || background.textColor)`.
   - If the main font is `Noto Nastaliq Urdu`, set `attribution.fontFamily` to the same; otherwise keep Naskh.
   - Raise `attribution.fontSizeRatio` to ≥ `0.5` (do not lower a user-chosen value).
2. **Attribution inside the safe area.** In `objectTransform('attribution')`, when the background has a valid `safeArea` and the attribution transform is not customised, place it at `x = safe.left`, `width = 1 − safe.left − safe.right`. Set `y` = bottom of the safe area minus the attribution height (64 / preset.height), clamped to stay below the text box. Mirror the existing `text` safe-area logic.
3. **No template decorations on designer backgrounds.** In `drawCard`, compute `var designer = state.background.type === 'image' && safeAreaInsets(state.background.safeArea);`. When `designer` is truthy, skip `drawMotif`, the template border `strokeRect`, and the accent line/rect. Solid, gradient and user-photo cards are unchanged.
4. **Auto-enable author.** On the first `input` into `#cardAttribution` with non-empty text while `attribution.enabled === false` and the user has never unticked it, set `attribution.enabled = true` and tick the checkbox. Track "user unticked" in memory and on the project (`attribution.autoEnabled`).
5. **Makers.** In `social-direct-workspace.js`, move `#cardAttribution` and the `attribution.enabled` checkbox out of `.social-maker-engine-support` into the visible content block, labelled "Poet / author (optional)" (Urdu "شاعر / مصنف (اختیاری)").
6. **Colour contrast.** If a background record lacks a usable colour, compute the attribution colour as the text colour at 85% alpha.

**Tests**
- `tests/card-attribution-quality.spec.js`: for every background in `WriteUrduCardBackgroundRegistry` (or a sample of 12 plus all `poetry` ones if the run is too slow) × `square`/`portrait`/`story`:
  1. Apply the background, enable the attribution `فیض احمد فیض`, and render.
  2. Assert the attribution rect is inside the safe area.
  3. Sample the canvas under the attribution rect (excluding glyph pixels by comparing renders with and without the attribution) and compute luminance contrast against `attribution.color` ≥ 4.5.
  4. With a designer background, pixels at the template accent location equal the background render without decorations.
- Contract test `tests/card-attribution-quality-contract.test.js`: static guards for the dispatches and the decoration skip.
- Update `card-poetry-quality.spec.js` expectations if they assert the accent pixel on poetry backgrounds. That spec checks the accent colour with **non-designer** templates; keep that case.

**Acceptance:** P2 rerun (`p2.mjs`) shows a legible Nastaliq credit inside the art-free area. P1 floral export has no rectangle/accent over the floral frame.

---

### Slice E — Reachability fixes (no hierarchy redesign)

**Closes:** CARD-UX-009, 024, 025, 038; the step-bar part of 001.

**Files:** `js/card-studio-ui.js` (`setStep` ~line 73, `syncSteps`, public API), `js/card-studio-background-library.js` (after mount, ~line 222), `css/card-studio.css`, `urdu-card-studio.html` (skip link, Back-to-editor), `js/card-studio.js` (`data-card-action="back"` handler).

**Steps**
1. **Re-sync after late mounts.**
   - Expose `WriteUrduCardStudioUi.refresh = syncSteps`.
   - After inserting the library, call `window.WriteUrduCardStudioUi && WriteUrduCardStudioUi.refresh()`. Since `card-studio-ui.js` may load later, also dispatch `write-urdu:card-studio-panel-mounted` and have `card-studio-ui.js` listen for it.
   - Result: the library (which declares `data-card-step="format"`) is hidden on Content.
2. **Content shows the text box first.** Verify that after step 1, `#cardText` is the first form control in the visible Content panel. If the batch-transliteration panel precedes it, Slice B step 7 already moved the actionable parts below.
3. **Step taps navigate.** In `setStep(step)`, after `syncSteps()`:
   - find the first visible `[data-card-step-panel][data-card-step="<step>"]`;
   - `scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })`, offset by the sticky header height (use `scroll-margin-top` in CSS);
   - focus its first focusable control without scrolling again (`preventScroll: true`).

   Applies to both `.card-studio-stepper` and `[data-card-mobile-stepbar]`.
4. **Overflow at ≤ 400 px.** In `css/card-studio.css`, make `.card-studio-artboard-wrap` and `.card-studio-preview` use `max-width: 100%; box-sizing: border-box; margin-inline: auto;` with symmetric padding. Remove any fixed `left` offset. Make `.card-studio-stepper` `overflow-x: auto` with no clipping, or a 4-column grid with `min-width: 0`. Toolbar buttons may wrap: `white-space: normal; text-overflow: clip`.
5. **Skip link.** First child of `main.card-studio-shell`: `<a class="card-studio-skip" href="#cardText">Skip to card text</a>` (visually hidden until focused). Urdu label via the copy tables.
6. **Back to editor.**
   - Hide `[data-card-action="back"]` unless the hand-off source was the writer (`sessionStorage writeUrdu.cardStudio.incoming` existed at init, or envelope `source.workspace` in `['basic', 'rich']`).
   - When shown, label it "Back to your writing".
7. **Desktop canvas fit.** In CSS, cap `.card-studio-canvas` height at `calc(100vh - <header+toolbar> )` with `width: auto` so the whole card is visible at 1440×900 and 1366×768.

**Tests**
- `tests/card-studio-reachability.spec.js` (desktop + mobile, plus a 360×780 project via `test.use({ viewport })`):
  - On load, every `[data-card-step-panel]` with step ≠ active is hidden.
  - Tapping mobile "Content" makes `#cardText` intersect the viewport.
  - `scrollWidth === innerWidth` at 360/375/393.
  - ≤ 15 Tab presses from `body` to `#cardText` on desktop.
  - No `.card-studio-top-actions` button has `scrollWidth > clientWidth`.
  - Canvas bottom ≤ viewport bottom at 1440×900.
- Contract guard for `refresh` and the scroll call.

**Acceptance:** harness `01-first-impression.mjs`: text box reached with one tap (record `scrollY` and the field's viewport top after the tap), no overflow, and the Tab count recorded in `resilience.mjs`.

**Note:** this slice deliberately does **not** reorder the page (format switcher, toolbar position, sticky preview). That is Slice O, which is gated.

---

### Slice-1 gate (after A–E are merged and deployed)

- Re-run the full harness locally and the read-only production subset. Update the verification log (§9).
- Real device: P1 (Android, floral greeting → Download → WhatsApp) and P5 (announcement with a phone number) end to end.
- Compare Product Pulse for 7 days: export completion per Card Studio session, `card_export_refused`, publish completion. Decide whether to unlock Slice O (`D-UX2-1`).

---

### Slice F — Consistent publishing for ready-made cards; "Get link" in the personaliser

**Closes:** CARD-UX-012, 013. **Owner specs:** `WU-SHARE-001` (privacy), `WU-CARD-CONTENT-001`.

**Homepage impact:** `js/curated-card-share.js` is also the share path for the homepage featured card (`js/home-featured-card.js`, `WU-CARD-RETENTION-001A`). The one-time consent dialog and dedupe therefore also apply to homepage **Share**. This is a homepage flow change: record founder acceptance under `D-UX2-3`, keep the homepage to its two actions, and update `tests/home-featured-card.spec.js` (it mocks an immediate POST around line 106) in the same PR. If the founder declines consent on the homepage, use the dedupe + manage-token parts only for homepage callers and pass `{ consent: false }` explicitly.

**Files:** `js/curated-card-share.js` (`publishCardShare`, `shareCard`), `js/urdu-cards.js` (~line 293 tile share; `openPersonalizer` ~line 381 actions), `js/card-studio-publish.js` (extract a reusable module), new `js/share-publish-core.js`, `sw.js`.

**Steps**
1. **Extract** from `card-studio-publish.js` into `js/share-publish-core.js` (UMD like `curated-card-share.js`):
   - storage keys `ACK_KEY`, `MANAGEMENT_KEY` (same names, so existing tokens remain valid);
   - `hasAcknowledged()`, `acknowledge()`, `rememberShare(result)`, `managementState()`;
   - `confirmationDialog(options) → Promise<boolean>` (same copy);
   - `publish(formData) → result`.

   Card Studio keeps its UI but calls the core. No behaviour change in Card Studio (its existing tests must pass unchanged).
2. **Curated share:**
   - Before the first publish, show the same acknowledgement dialog (once per browser, shared ack key).
   - `rememberShare(payload)` so it appears in Manage published links and can be deleted.
   - **Dedupe:** cache `{cardId + sha1(textUr)} → url` in `localStorage` (`writeUrdu.curatedShareLinks.v1`, max 100) and reuse it if the stored link still returns 200 (HEAD `/s/<id>` lazily; on 404/410 republish).
   - **Remove the fake attribution:** do not send `attribution` (or send the real author when the card record has one, e.g. a poet).
3. **Personaliser "Get link":**
   - In `openPersonalizer`, add a third action `Get link · لنک بنائیں` (`data-urdu-cards-personalizer-link`).
   - It renders the personalised card (reuse `curated-card-share.buildCardShareImage(card-with-edited-text, background)`), then runs the same consent → publish → copy/share flow.
   - The status line shows the URL with Copy, plus WhatsApp/Facebook links (reuse Slice H helpers if merged; otherwise Copy only).
4. Service-worker cache bump (new JS file in shell if listed).

**Tests**
- `tests/curated-share-consent.spec.js`:
  - First "Shareable link" tap shows the dialog; Cancel results in no POST.
  - Accept → 1 POST; a second tap → 0 POST (dedupe).
  - The link appears in `writeUrdu.shareManagement.v1`.
  - The public page HTML has no "Write Urdu Card" attribution.
  - The personaliser "Get link" POST contains the edited text.
- Update `urdu-cards.spec.js` (line ~320 mock expects an immediate POST) and `home-featured-card.spec.js` (line ~106) to accept the dialog first (or to set the ack key in `addInitScript`).
- `tests/share-publish-core-contract.test.js`.

**Acceptance:** harness `p8.mjs` (local) shows the dialog, one publish, the link in Manage, and delete → 410.

---

### Slice G — Safe editing: undo everything, photo-aware defaults, template keeps photo

**Closes:** CARD-UX-018, 019, 020.

**Files:** `js/card-studio-interaction.js` (`pushHistory`, `recordHistory` exposed as `WriteUrduCardStudioInteractionApi`), `js/card-studio.js` (`bindControls` field listeners; reset handler; upload `image.onload`), `js/card-studio-core.js` (`applyTemplate`), `js/card-studio-ui.js` (template clicks if handled there).

**Steps**
1. **History for panel fields.**
   - In `bindControls`, snapshot `before` on `focusin`/`pointerdown` of a `[data-card-field]` control and `pushHistory(before)` on `change`.
   - For `#cardText` and `#cardAttribution`, push on `blur` or after 1 s idle (debounced), not on every keystroke.
   - Background-library applies and template/preset changes push one entry per user action. Use a `historyBatch(fn)` helper so the many `dispatchField` calls in a background apply become one entry.
2. **Undoable Reset.** Replace `window.confirm` with: snapshot → reset → `pushHistory(before)` → status "Card reset." with an **Undo** button for 8 s. Keep the asset blob in IndexedDB until the next save, so undo can restore the photo (`restoreAsset`).
3. **Template keeps the user's photo.**
   - In `applyTemplate` (or its caller), when `state.background.type === 'image'` and `state.background.imageAssetId` is a user upload (no `safeArea`), keep `background.*` and apply only the text styles.
   - Show the status "Text style applied. Your photo was kept." with an action **Use template background** that applies the full template.
4. **Readable text on upload.**
   - After `image.onload`, draw the image scaled to 64×64 on an offscreen canvas.
   - Compute the mean relative luminance of the region under the text box (from `objectRect('text')`, mapped to the image placement).
   - If L < 0.45: `text.color = '#ffffff'`, `overlayColor = '#000000'`, `overlayOpacity = max(current, .28)`.
   - Otherwise: `text.color = '#1f2937'`, `overlayColor = '#ffffff'`, `overlayOpacity = max(current, .18)`.
   - Only when the user has not chosen a text colour this session.
   - Expose a single **Text readability** slider (overlay strength) in Quick mode under Background when type = image. Move `#cardOverlay` out of `data-card-advanced` and leave colour/fit/position in Advanced.

**Tests:** `tests/card-studio-history.spec.js`:
- Undo is enabled after a text edit, a font change, a background apply and Reset, and each Undo restores the previous value.
- Template change after upload keeps `imageAssetId`.
- Dark and bright synthetic images (generate in-test via an OffscreenCanvas → Blob → `setInputFiles` with a buffer) produce contrast ≥ 4.5 between `text.color` and the sampled region after overlay.

**Acceptance:** harness `p6.mjs` reports Undo enabled after typing, the template change keeps the photo, and the P7 Reset is undoable.

---

### Slice H — Send sheet: Picture vs Link, with WhatsApp/Facebook routes

**Closes:** CARD-UX-014, rest of 015. **Decision line needed** (sharing surface change). D-1 (raw-text share) is **not** required: everything here shares a URL or an image file.

**Files:** `js/card-studio-publish.js` (`successDialog`, `sharePublicLink`), `js/card-studio.js` (`shareCard` fallback copy), `js/share-page.js` (recipient Share fallback), new helper in `js/share-publish-core.js` (`socialLinks(url, text)`), CSS in `css/card-studio-publish.css`.

**Steps**
1. `socialLinks(url)` returns `{ whatsapp: 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) }`, where `text` is "Urdu card for you" (Urdu: "آپ کے لیے اردو کارڈ").
2. Success dialog:
   - When `navigator.share` exists, keep **Share link** primary.
   - Always add a row: **WhatsApp** · **Facebook** · **Copy link** (anchors `target="_blank" rel="noopener"`).
   - Rename the dialog intro to plain language: "Your link is ready. Send it on WhatsApp or Facebook. People who open it see your card and can make their own."
   - Replace "immutable snapshot…" with "This link always shows this version. To change it, publish a new version."
3. Rename the toolbar and Export buttons:
   - "Share image only" → **Send picture** (title: "Send the picture file — no link is created").
   - On fallback: "Picture saved to your device — attach it in WhatsApp or Instagram."
4. Add a one-line chooser above the Export actions: *Picture — best for family groups, Status and Instagram · Link — opens a page where they can make their own.*
5. Recipient page (`share-page.js`): when `navigator.share` is missing, the **Share** button opens a small inline menu (WhatsApp, Facebook, Copy link) instead of only copying.

**Tests:** `tests/card-share-sheet.spec.js`:
- With `navigator.share` undefined, the success dialog contains `wa.me` and the `facebook.com/sharer` hrefs with the encoded `/s/` URL.
- With `navigator.share` stubbed, the share call receives the URL.
- The recipient page fallback menu appears.

Update `create-publish-boundaries.spec.js` and `core-workspace-convergence.spec.js` if they assert old labels. Keep `data-*` hooks stable.

**Acceptance:** desktop P3 run shows WhatsApp/Facebook links. Real Android: native sheet still used.

---

### Slice I — Lightweight link-preview image (og:image)

**Closes:** CARD-UX-032. **Decision `D-UX2-2`** (from the Slice 0 device check): proceed only if large PNG previews fail or degrade on WhatsApp.

**Files:** `js/card-studio-publish.js` (`buildPublishedImage`), `js/curated-card-share.js`, `functions/api/shares.js`, `functions/_lib/share-artifacts.js` (`validateJpeg`, object key helper), `functions/share-media/[id].js` (`?v=preview`), `functions/s/[id].js` (og/twitter image tags), new migration only if a column is needed (prefer deriving the key: `shares/YYYY/MM/<id>.preview.jpg`; no schema change).

**Steps**
1. Client: in addition to the PNG, produce `preview`: draw onto a canvas scaled to max 1200 px wide, `toBlob('image/jpeg', .8)`. Step quality down to .6 while the blob is > 250 KB. Append it as `preview`.
2. Server:
   - Accept an optional `preview` (`image/jpeg`, ≤ 400 KB, JPEG SOI marker check, dimensions ≤ 1200).
   - Store it at `<imageKey>.preview.jpg`.
   - On failure, ignore the preview and still publish (backward compatible).
   - Delete it alongside the PNG in `DELETE`.
3. `/share-media/<id>?v=preview` serves the JPEG if present, else the PNG.
4. `/s/<id>` sets `og:image` / `twitter:image` to `?v=preview` with JPEG type and scaled width/height **when the preview exists** (HEAD the R2 key in `onRequestGet`, or store a flag in `remix_mode`-like column only if a HEAD is too slow; measure).

**Tests:**
- Extend the function tests: there is no Node test for functions yet, so add `tests/share-preview-functions.test.mjs` using a minimal in-memory D1/R2 shim. Copy the approach from `docs/audits/…/evidence/harness/harness-server.mjs` and register it in `run-contract-tests.js`.
- Publish with a preview; `/s/` og:image ends with `?v=preview`; media ≤ 300 KB; delete removes both objects.
- Publish without a preview: unchanged.

**Acceptance:** og:image ≤ 300 KB for designer-background cards. Real WhatsApp preview shows the image for 5 sample links (Android + iOS).

---

### Slice J — Re-editable published designs; "Your published cards"

**Closes:** CARD-UX-016, 039.

**Files:** `functions/_lib/share-remix.js` (`sanitizeProject` line ~52), `js/card-studio-publish.js` (`buildRemixCandidate`, `rememberShare`, `manageDialog`), `js/card-studio-handoff-adapter.js` (`publicShareProject` → apply library background), `js/card-studio-background-library.js` (`applyById`), `js/card-background-registry.js` (id list for the server: export a plain array module or duplicate a generated list — prefer generating `functions/_lib/card-background-ids.js` from the registry via a small script plus a contract test that they match).

**Steps**
1. Client `buildRemixCandidate`: if the background came from the library, send `background: { type: 'library', id: <registryId>, positionX, positionY, overlayColor, overlayOpacity }` (track the applied id in `state.background.libraryId` when `applyById` runs; clear it on user upload).
2. Server `sanitizeProject`: allow `type === 'library'` when `id` ∈ `CARD_BACKGROUND_IDS`. Keep rejecting any other `image`.
3. Hand-off: in `apply()` for `publicShareProject`, if `background.type === 'library'`:
   - set the project background placeholder;
   - call `WriteUrduCardStudioBackgroundLibrary.applyById(id)` after mount;
   - restore text and attribution transforms afterwards.
4. Manage list → **Your published cards**:
   - Store `excerpt` (first 40 characters) and `thumbnail` (≤ 8 KB JPEG data URL) in `rememberShare`.
   - Rows show the thumbnail, excerpt and date, with actions Open · **Make a new version** (opens `/s/<id>`'s edit hand-off, or the local project if one is found by matching the `shareId` stored on the project) · Delete.

**Tests:**
- `tests/share-remix-library-contract.test.js` (sanitizer accepts known ids and rejects unknown ids and `image`).
- `tests/share-edit-design.spec.js`: publish (mocked API) a library-background card; the public page (mock HTML from `functions/s/[id].js` via the harness approach, or the existing `create-publish-boundaries` pattern) shows "Edit this design"; the hand-off restores the same background id.
- Manage dialog shows thumbnails.

**Acceptance:** harness `p7.mjs`: "Edit this design" present for the Emerald Mughal card, and the reopened design matches.

---

### Slice K — Urdu interface completeness and accessibility polish

**Closes:** CARD-UX-023, 033, 035, 028.

**Steps**
1. **Urdu labels.**
   - Route all labels set in `card-studio-ui.js` (steps, modes, "New to Card Studio?", announcements) and `card-studio-publish.js` (Publish & Share, Submit to Urdu Writers, notes, dialogs) through a `t(key)` that reads `copy.ur` when `WriteUrduLocale.get() === 'ur'`.
   - Undo/Redo → واپس / دوبارہ. Steps → متن / سائز / انداز / مکمل. Quick/Advanced → آسان / مزید اختیارات. Publish & Share → شائع کریں اور شیئر کریں.
   - Re-apply on `write-urdu:locale-change`.
   - Remove `ownImageShareLabels()` stripping of `data-card-i18n`.
2. **Focus ring.** In `css/card-studio.css` (and the shared button styles if they are the source): `:focus-visible { outline: 3px solid #0b6fc2; outline-offset: 2px; }`. Guidance/notes ≥ 14 px on ≤ 900 px (`.wu-share-publish-note`, `.card-studio-help`).
3. **Storage guard.** Find the uncaught `SecurityError` (run the harness `resilience.mjs` storage case with `page.on('pageerror')` stack). Wrap that access in try/catch.
4. **Long tokens.** In `wrapRtlText`, when a single word is wider than `maxWidth` **even at min font size**, break it at `/ . - _ ?` before falling back to per-character chunks.
5. **Fit warning.** Make it state-aware: when auto-fit is on, say "This text is too long for this size even at the smallest readable size. Shorten it or choose a taller format."

**Tests:**
- `tests/card-studio-urdu-ui.spec.js`: on `/urdu/urdu-card-studio`, no visible Latin-script control label in `main` except an allowlist (PNG, JPEG, WhatsApp, Instagram, Facebook, Write-Urdu.com).
- `tests/card-studio-a11y.spec.js`: focused button outline alpha = 1; no page errors with storage blocked (`addInitScript` from the harness); a 60-char URL draws no glyph outside the canvas (pixel probe of the outer 2 px columns stays background).

---

### Slice L — Better use-case defaults; emphasised first line

**Closes:** CARD-UX-026, 027. **Decision line** (defaults change on a creation surface; evidence = this audit plus the Slice-1 gate data).

**Steps**
1. **Use cases** (`js/card-studio-ui.js` `useCases`):
   - Split `announcement` into `greeting` (`square`, designer background `emerald-mughal` or the occasion's background via `applyById`, Nastaliq, `emphasis: 'first-line'`) and `notice` (`portrait` 1080×1350, `minimal-white`, Naskh, `emphasis: 'first-line'`).
   - Update the buttons in `urdu-card-studio.html` (+ locale).
   - Keep the id `announcement` as an alias of `notice` for saved projects.
2. **Emphasised first line.**
   - Add `text.emphasis: 'none' | 'first-line'` (normalised in `normalizeCardProject`, default `'none'`; preserved in `buildRemixCandidate` and allowed in `share-remix.js`).
   - In `layoutCardText`, when `first-line` and there are ≥ 2 written lines, lay out paragraph 0 at `1.4 ×` size and the rest at the base size.
   - `findBestFontSize` must account for the combined height.
   - Draw paragraph 0 with its own size.
   - Add a Quick-mode checkbox in Style "Make the first line a heading" (Urdu: "پہلی سطر کو سرخی بنائیں").
3. Do not add multi-object editing.

**Tests:**
- `tests/card-emphasis-contract.test.js` (layout heights).
- `tests/card-emphasis.spec.js`: line-1 glyph height ≥ 1.35 × line-2 (measure via `currentLayouts`). Greeting → 1080×1080; Notice → 1080×1350; both pass the safe-area check.

---

### Slice M — Maker parity (WhatsApp Status, Instagram)

**Closes:** CARD-UX-017. **Decision line.**

**Files:** `js/social-direct-workspace.js`, `js/social-direct-instagram.js`, `js/social-maker-core.js` (`applyDefaults`), `urdu-whatsapp-status-maker.html`, `urdu-instagram-post-maker.html`.

**Steps**
1. **Defaults.**
   - Status → designer background suited to story (e.g. `moonlit-lanterns`) with Nastaliq.
   - Instagram → a `poetry` background in portrait.
   - The default text must pass `social.evaluateSafeArea` (add a contract test over the defaults).
2. Author field visible (if not already done in D).
3. **Publish.** Load the publish layer on makers (the same lazy loader block at the end of `js/card-studio-ui.js`, or include `card-studio-ui.js`'s loader in `social-direct-workspace.js`). Add **Get link** beside Download.
4. **Carry-over.** The page's "Open the full Urdu Card Studio" link (`.social-maker-related`) uses the existing format-switch hand-off (`js/social-format-handoff-adapter.js`) so text and design carry over.

**Tests:** `tests/social-maker-parity.spec.js`: no safe-area warning on untouched defaults; author visible; Get link POSTs (mocked); following the related link keeps the text.

---

### Slice N — Ready-made cards: tile simplification and occasion depth

**Closes:** CARD-UX-010, 011. **Owner specs:** `WU-CARD-CONTENT-001` / `001A` (content rules, rights metadata), `WU-CARD-GALLERY-001A` (backgrounds). Content additions follow their validation scripts (`npm run templates:check`, `js/urdu-cards-data.js` validator).

**Steps**
1. **Tile:**
   - artwork; ♡; **Make it mine** (primary); **Send** (opens a bottom sheet: Send picture · Get link · WhatsApp Status size · Instagram size).
   - Remove the duplicate WhatsApp Status button.
   - One language per label (page locale); `aria-label` keeps the card name (WU-UXR-001 A5).
   - ≥ 14 px font, ≥ 44×44 px targets at 360 px.
2. **Content:**
   - Add category `birthday` (Birthday · سالگرہ مبارک) with ≥ 8 cards (family, friend, child, colleague, dua-style), original text, reusing existing backgrounds.
   - Raise `eid-greeting` (Eid ul Fitr + Eid ul Adha variants) and `congratulations` (result, new baby, new job, nikah) to ≥ 8 each.
   - Order chips: All, Birthday, Eid, Jumma, Morning, Dua, Congratulations, Wedding, …

**Tests:** update `urdu-cards.spec.js`, `urdu-cards-social-formats.spec.js`, and `urdu-cards-slice*-contract.test.js` counts. Add a tile-size assertion at 360×780.

---

### Slice O 🔒 — Mobile hierarchy (gated)

**Closes:** CARD-UX-001 (full), 005, 008. **Requires:** `D-UX2-1` approval plus Slice-1 gate evidence (production funnel shows Card Studio first-text/export drop on mobile after A–E).

**Scope (≤ 900 px only):**
1. Compact **sticky preview** at the top (≈ 38 vh, scaled canvas). Panels scroll beneath it, with ≥ 200 px of controls visible on 360×780.
2. **Format switcher** moved into the Format step (or a "Change size" chip under the preview).
3. **Finish row** sticky at the bottom above the step bar: **Download** · **Publish & Share** · ⋯ **More** (Undo, Redo, Reset, Browse templates, Send picture, Submit to Urdu Writers, Manage published links).
4. Desktop keeps its layout. Desktop toolbar reduced to two finish actions plus ⋯ More (CARD-UX-008) only if `D-UX2-1` covers desktop.
5. Ship behind a 50/50 local flag only if `WU-PLAT-002H` metrics allow it. Otherwise release and compare 7-day before/after.

**Tests:** `tests/card-studio-mobile-hierarchy.spec.js`:
- At 360×780, ≥ 60% of the canvas is visible after any background/font/template tap.
- Download/Publish are visible without scrolling.
- No overlap of the sticky elements with the on-screen keyboard. This needs a real-device check, so note it in the PR.

---

### Slice P — Later improvements (each needs its own decision line)

| Item | Closes | Notes |
|---|---|---|
| P1 Performance | 029 | Defer `voice-input-core.js`, `unified-urdu-input.js`, `writer-voice-input.js`, community UI and batch transliteration until first use; lazy-load background thumbnails (`loading="lazy"`, `decoding="async"`); measure with `npm run lighthouse:seo` and production Lighthouse mobile. Target −30% TTI, ≤ 20 scripts before interaction. |
| P2 Recipient page | 036 | Self-host a subsetted Noto Nastaliq Urdu WOFF2 under `/fonts/` (CSP `font-src 'self'` must be added to `functions/s/[id].js` headers) and reference it from `css/share-page.css`. Test "Make your own" → `/urdu-card-gallery` with the text pre-filled (WU-SHARE-001R owns the CTA, so coordinate). |
| P3 Word-level Roman correction | 022 | Tap a converted word → top 3 alternatives (`num=3` on the passage endpoint). Provider strategy belongs to `WU-JOURNEY-001B` §B5 / D-4. |
| P4 Homepage | 037 | No hierarchy change. Strengthen the post-writing "Create Urdu card" hand-off copy and the occasion featured card (WU-CARD-RETENTION-001A). |

---

## 7. Decisions required

| ID | Question | Recommendation | Blocks |
|---|---|---|---|
| D-UX2-1 | Approve the mobile hierarchy change (sticky preview, finish row, ⋯ More) after the Slice-1 gate? | Yes, if the 7-day production data after A–E still shows mobile Card Studio export completion below desktop by > 30% relative | Slice O |
| D-UX2-2 | Store a JPEG preview next to each published PNG for link previews? | Yes, if Slice 0 shows missing or degraded WhatsApp previews for designer-background cards | Slice I |
| D-UX2-3 | Ready-made stock cards (incl. the homepage featured card): keep publishing a `/s/` page per share, with a one-time consent dialog, or link to a static card URL? | Keep `/s/` (gives the recipient page and remix) with consent once per browser + dedupe (Slice F); the same rule on the homepage featured card; revisit only if R2 growth matters | Slice F |
| D-UX2-4 | Should "Recent cards" also appear on `/urdu-cards` ("Continue your last card")? | Yes, one line in the existing returning-state block; no new section | Slice C (optional step) |

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Renderer changes alter existing exports (snapshots) | Slice A returns identical strings for pure-Urdu/pure-Latin; Slice D only affects designer backgrounds; run all card/wedding specs |
| IndexedDB growth (Slice C thumbnails) | ≤ 12 KB thumbnails, cap 20 projects/scope, delete orphan assets |
| Publish module extraction breaks Card Studio publishing | Slice F keeps Card Studio behaviour identical; existing publish specs must pass unchanged before curated changes |
| Locale drift | Always run `npm run locale:generate` + `locale:check`; Urdu strings in every PR |
| SW cache serving stale JS after deploy | Bump `CACHE_NAME` + test pins in every slice that touches shell assets |
| Harness selectors drift | Update selectors in the same PR; harness is documentation tooling, not CI |

## 9. Verification log

**Slice 0 run (2026-10-11).** Harness against the local tree (branch `claude/write-urdu-card-studio-audit-tefvyq` @ `acb088c`) and read-only against `https://write-urdu.com` (`01-first-impression`, `p5`, `p6`, `j04j07`; Chrome 141 via `PW_CHROMIUM`). The Card Studio scripts served by production (`card-studio.js`, `card-studio-core.js`, `card-studio-ui.js`, `card-studio-handoff-adapter.js`, `card-studio-publish.js`, `curated-card-share.js`) are byte-identical to the repo, ignoring line endings. So findings that need `p3`/`p7`/`p8` (which publish) were reproduced locally against code identical to production, and are marked *confirmed (code parity)*. Production `sw.js` is already at `write-urdu-shell-v61` (`main` #256), so the next slice that touches `APP_SHELL` bumps to **v62** (§4.3 updated).

| Finding | Slice 0 production result | Fixed in | Verified (harness / device) |
|---|---|---|---|
| CARD-UX-001 | **Confirmed on production.** `#cardText` top is 3,252 px @360, 3,229 @393, 3,226 @390 and 3,129 @768; the canvas is at 1,222 px @360. Baseline: 3,354 / 3,248 / 3,265 / 3,129. | E (partial), O | — |
| CARD-UX-002 | **Confirmed (code parity).** Local `p7`: after the `/urdu-cards` hand-off, IndexedDB holds one project (`[TEST] نیا کارڈ`) under the week-0 id, and the week-0 card is gone. Not run on production because it publishes. | C | **Fixed (harness, 2026-10-11).** Local `p7`: after the same hand-off and edit, IndexedDB holds two projects, the week-0 card (`[TEST] پچھلے ہفتے کا کارڈ…`, own id) and `[TEST] نیا کارڈ` (new id). Direct return still restores the latest card. `card-studio-recent.spec.js` opens the old card from Recent cards. No new network requests. |
| CARD-UX-034 | Not a production metric. | C | **Fixed (browser spec).** Two tabs editing at once keep two cards, and both are listed in Recent cards. Project ids now carry a random suffix so two tabs cannot share an id. |
| CARD-UX-003 | **Confirmed on production.** The `p5` export shows `رابطہ: 0300-1234567` as `1234567-0300`. | A | **Fixed (harness, 2026-10-11).** Local `p5` landscape and square exports draw `رابطہ: 0300-1234567` in typed order; the date line `19 اکتوبر 2026` and `شام 5 بجے` are unchanged. `card-bidi-render.spec.js` checks the digit order on the canvas. Device check after deploy: pending. |
| CARD-UX-028 (punctuation part) | Not run on production (no harness metric). | A | **Fixed (contract).** Trailing `!?.,:;)` after a Latin phrase stays inside its isolate (`Happy Friday!`), checked in `card-bidi-render-contract.test.js`. The long-token part stays in Slice K. |
| CARD-UX-004 | **Confirmed.** Production `p6`: a broken upload leaves the status at "Saved on this device". Local `p1`: sample text then Download gives no file, and the status says "Saved on this device". | B | **Fixed (harness, 2026-10-11).** Local `p1`: sample text then Download now downloads (`urdu-card-2026-10-11.png`). Local `p6`: the broken upload keeps "This image could not be opened…". `card-studio-feedback.spec.js` checks the refusal toast is on screen after 2 s at 360×780. |
| CARD-UX-015 (copy) | Not a production metric. | B | **Fixed (contract).** No unconditional "not uploaded", "keeps your writing safe" or "straight to … Instagram" copy in Card Studio (en/ur). The send-sheet part stays in Slice H. |
| CARD-UX-021 | Not a production metric. | B | **Fixed (browser spec).** The button reads "Remove image" (ur: تصویر ہٹائیں). |
| CARD-UX-022 (status + placement) | Outage half not reproduced locally in Slice 0. | B | **Fixed (browser spec).** During an outage only the input-mode alert shows; the convert button is 0–200 px below `#cardText` at 360×780 on Card Studio, and the panel follows the field on both makers. Word alternatives stay in Slice P. |
| CARD-UX-030 | Not a production metric. | B | **Fixed (harness).** `p1` download name `Untitled card-2026-10-11.png` → `urdu-card-2026-10-11.png`. |
| CARD-UX-031 | Not a production metric. | B | **Fixed (browser spec).** A 503 publish shows "Links can't be created right now…" with a Download picture button. |
| CARD-UX-005 | **Confirmed on production.** WhatsApp Status maker @360: text box at 3,191 px, preview at 4,005 px (baseline 3,214 / 4,024). Local `p1`: the canvas is at −368…−25 when Vintage Floral is tapped. | O | — |
| CARD-UX-006 | **Confirmed.** Production `p5` export: the credit line is small grey text over the leaf art. Local `p2`: the Instagram maker's attribution field is hidden. Code is identical to production. | D | — |
| CARD-UX-008 | **Confirmed on production.** Phones show 87 visible controls in main and 16–17 buttons in the first viewport, unchanged from the baseline. | E (labels), O | — |
| CARD-UX-012 | **Confirmed (code parity).** `curated-card-share.js` on production has no `manageToken` and no confirmation step; it POSTs `/api/shares` directly. Local `p8`: tapping "Shareable link" shows no dialog. Not run on production because the link cannot be deleted. | F | — |
| CARD-UX-032 | **Pending:** owner's Android and iPhone WhatsApp check (Slice 0 step 3). | I | — |

Other Slice 0 observations (no action in this plan):

- **Production only:** Google's ad-consent dialog (`.fc-consent-root`) covers Card Studio and the Gallery on first visit from this test region and blocks every tap until it is answered. On the mobile Gallery, the sticky anchor ad (`ins.adsbygoogle[data-anchor-shown]`) covered "Use this design" when that button was scrolled to the bottom edge. Ads are out of scope (§3), so this goes to the ads owner. The harness now declines the consent dialog and centres the tap target, and records both.
- **Local environment:** Roman Urdu conversion was reachable, so the outage half of CARD-UX-022 was not reproduced. Re-test it with the provider blocked (Slice B). Desktop Chrome exposes the Web Share API, so the `p1`/`p4`/`p8` "Share this image" steps went to `navigator.share` instead of downloading. Those deltas are environmental.
- **CARD-UX-029:** local `resilience` measured 2,208 KB and 43 scripts, against 1,500 KB and 41 in the baseline. The local tree loads real ad and provider requests that the sandbox blocked, so re-measure on production before Slice P1.

(Add rows for every closed finding as slices land; the CSV in the audit folder lists all 39.)

## 10. Done means

- Slices A–F, G, J, K are merged with their tests green in CI (`quality.yml`), and their findings are verified by the harness and one real-device pass.
- H, I, L, M, N are either merged or explicitly deferred with a backlog decision.
- O is either approved and merged with before/after funnel evidence, or recorded as rejected with the reason.
- The audit personas P1–P8 re-run on production: P1, P3, P4, P5, P7 and P8 reach their outcome **without** the friction listed in `02-persona-journeys.md`.
