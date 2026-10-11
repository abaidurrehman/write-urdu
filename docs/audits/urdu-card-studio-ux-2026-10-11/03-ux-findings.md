# 03 — UX Findings Register

Audit: Write-Urdu Card Studio · 2026-10-11 · local build of `main` at `7a14bde` · machine-readable copy: [`ux-findings.csv`](ux-findings.csv)

**Evidence basis codes:** **M** = measured in a scripted browser run (numbers in `evidence/logs/*.json`) · **O** = observed in a captured screenshot · **S** = root cause confirmed in source · **E** = expert judgement · **H** = hypothesis that needs real-device or real-user validation. Findings are synthetic-persona observations, not research-participant data.

**Severity:** P0 = core task impossible / major data loss / serious privacy problem · P1 = significant friction on important journeys · P2 = repeated confusion, weak feedback, noticeable design defects · P3 = polish.

No P0 was recorded: every core task could be completed by some route. CARD-UX-002 (silent overwrite of local work) and CARD-UX-003 (reversed phone numbers) were the closest; both are rated P1 because a workaround exists and the loss is limited to one local draft or one visible line of output. Reconsider them as P0 if production telemetry shows frequent hand-offs after editing.

## Summary table

| ID | Sev | Category | Title | Basis | Effort |
|---|---|---|---|---|---|
| [CARD-UX-001](#card-ux-001) | P1 | Mobile usability | On phones the text box sits 1,800–3,350 px below the top of Card Studio, and the bottom step bar does not take people there | M, O, S | M |
| [CARD-UX-002](#card-ux-002) | P1 | Return usage | Opening a ready-made card, gallery design or template in Card Studio silently overwrites the saved card | M, S | M |
| [CARD-UX-003](#card-ux-003) | P1 | Urdu input | Phone numbers and other numbers next to Urdu are exported in reversed order | M, O, S | S |
| [CARD-UX-004](#card-ux-004) | P1 | Editing | Actions fail silently: autosave overwrites error messages, and 'Use sample text' inserts a placeholder that blocks export | M, S | S |
| [CARD-UX-005](#card-ux-005) | P1 | Mobile usability | On phones the preview is off-screen while people choose backgrounds and styles | M, O | M |
| [CARD-UX-006](#card-ux-006) | P1 | Visual design | Poet/author name is nearly unreadable on designer backgrounds and missing from the Instagram and WhatsApp makers | O, S | S |
| [CARD-UX-008](#card-ux-008) | P1 | First-time onboarding | Nine top-level actions compete with the editor; on phones the labels are truncated | M, O, E | S–M |
| [CARD-UX-012](#card-ux-012) | P1 | Publishing | A ready-made card's 'Shareable link' publishes a new public page on every tap, without confirmation or a way to delete it | M, S | S |
| [CARD-UX-007](#card-ux-007) | P2 | Visual design | Template frame and accent bar are drawn on top of designer backgrounds, giving double frames and collisions | O | S |
| [CARD-UX-009](#card-ux-009) | P2 | Template selection | The background collection appears on the Content step, and the steps do not match what is on screen | M, S | S |
| [CARD-UX-010](#card-ux-010) | P2 | Mobile usability | Ready-made card tiles carry eight actions each, with 9.4 px labels on small phones | M, O | M |
| [CARD-UX-011](#card-ux-011) | P2 | Template selection | No Birthday occasion, and thin coverage of core occasions (4 Eid, 4 Congratulations of 157 cards) | M, S | S–M (content + art reuse) |
| [CARD-UX-013](#card-ux-013) | P2 | Sharing | A personalised ready-made card cannot be shared as a link without going into Card Studio | M | S–M |
| [CARD-UX-014](#card-ux-014) | P2 | Sharing | Without the Web Share API, 'Share' only copies or downloads; there is no WhatsApp or Facebook route | M, S, H | S |
| [CARD-UX-015](#card-ux-015) | P2 | Privacy | Privacy wording contradicts publishing, and overstates what 'Publish & Share' does | O, S | S |
| [CARD-UX-016](#card-ux-016) | P2 | Return usage | 'Edit this design' is unavailable for any card made with the 44 designer backgrounds | M, S | S–M |
| [CARD-UX-017](#card-ux-017) | P2 | Sharing | The Instagram and WhatsApp makers have weaker defaults and fewer finish options than Card Studio | M, O | M |
| [CARD-UX-018](#card-ux-018) | P2 | Editing | Undo misses typing, font, colour and background changes, and Reset cannot be undone | M, S | S |
| [CARD-UX-019](#card-ux-019) | P2 | Editing | Changing template after uploading a photo replaces the photo and font | M | S |
| [CARD-UX-020](#card-ux-020) | P2 | Visual design | Text colour does not adapt to an uploaded photo, so the default dark text is unreadable on dark images | O | S |
| [CARD-UX-021](#card-ux-021) | P2 | Editing | The 'Remove image' button is labelled 'Background image removed.' | O, S | S |
| [CARD-UX-022](#card-ux-022) | P2 | Urdu input | Roman Urdu status is contradictory during an outage; the passage prompt appears off-screen; no way to correct a single word | M, O | S (status/placement); M (word alternatives) |
| [CARD-UX-023](#card-ux-023) | P2 | Accessibility | The Urdu interface is only partly translated in Card Studio | M, O | S |
| [CARD-UX-024](#card-ux-024) | P2 | Mobile usability | At 360 px the card preview and step bar overflow the screen horizontally | M, O | S |
| [CARD-UX-025](#card-ux-025) | P2 | Accessibility | On desktop the text box is buried inside a scrolling side panel; 84 Tab presses to reach it | M | S |
| [CARD-UX-026](#card-ux-026) | P2 | Template selection | 'Greeting / Announcement' picks a 1280×720 landscape layout, which is poor for phone sharing | O, E | S |
| [CARD-UX-027](#card-ux-027) | P2 | Visual design | There is no heading hierarchy: titles, body, dates and contacts all render at one size | O, E | M |
| [CARD-UX-029](#card-ux-029) | P2 | Performance | Card Studio needs about 1.5 MB and 41 scripts; on slow 3G it takes about 22 s to become usable and 35 s for Nastaliq | M | M |
| [CARD-UX-032](#card-ux-032) | P2 | Sharing | Published images can be 0.4–2.2 MB PNGs, which risks missing link previews in WhatsApp | M, H | M |
| [CARD-UX-036](#card-ux-036) | P2 | Recipient experience | Recipient page: Urdu text uses a fallback font, and 'Make your own' goes to a catalogue rather than an editor | M, H | S–M |
| [CARD-UX-028](#card-ux-028) | P3 | Visual design | Long unbreakable text (URLs) overflows the card, and the auto-fit warning appears while auto-fit is on | M, O | S |
| [CARD-UX-030](#card-ux-030) | P3 | Return usage | Downloaded files are named 'Untitled card-YYYY-MM-DD.png' | M | S |
| [CARD-UX-031](#card-ux-031) | P3 | Publishing | Publishing error copy uses internal jargon | M | S |
| [CARD-UX-033](#card-ux-033) | P3 | Accessibility | The focus indicator is faint and helper text is small and grey | M | S |
| [CARD-UX-034](#card-ux-034) | P3 | Reliability | Two open tabs overwrite each other silently | M | S (after 002) |
| [CARD-UX-035](#card-ux-035) | P3 | Reliability | Blocked storage throws an uncaught error (the card is still usable) | M | S |
| [CARD-UX-037](#card-ux-037) | P3 | Discovery | The homepage's first card entry is about 5,700 px down on mobile | M | S |
| [CARD-UX-038](#card-ux-038) | P3 | Navigation | 'Back to editor' in Card Studio always goes to the homepage writer | S, O | S |
| [CARD-UX-039](#card-ux-039) | P3 | Return usage | 'Manage published links' lists raw URLs only, and editing always requires a new link that the UI does not mention up front | M | S |

## CARD-UX-001

### On phones the text box sits 1,800–3,350 px below the top of Card Studio, and the bottom step bar does not take people there

| Field | Value |
|---|---|
| Category | Mobile usability |
| Affected personas | P1, P3, P8 (all mobile) |
| Journey | J01, J02 |
| Device | 360×780, 393×852, 390×844, 768×1024 |
| Severity | P1 |
| Evidence basis | M, O, S |
| Implementation effort | M |
| Confidence | High |

**Evidence.** logs/01.json (textarea top: 3,354 px @360; 3,248 @393; 3,265 @390; 3,129 @768); first-impression-card-studio-android-small.jpg; full-card-studio-android-small.jpg; P1-after-tap-content-stepbar.jpg (after tapping '1 Content', scrollY = 0 and the field is still 2,208 px below)

**Steps to reproduce.** 1. Open /urdu-card-studio at 360×780. 2. Look at the first screen. 3. Tap '1 Content' in the fixed bottom bar.

**Expected outcome.** The first screen shows the card preview and a place to type. Tapping a step shows that step's controls.

**Actual outcome.** The first screen holds the 'Same design · different format' switcher (3 full-width buttons), the H1 and a 3-column toolbar whose labels are cut off ('Brows…', 'Back t…', 'Share …', 'Downl…'). The preview starts at 1,287 px, then the 44-tile background collection (1,049 px tall) appears, and only then the text box. The step bar changes which panel is visible but does not scroll, so tapping it looks like nothing happened.

**User impact.** The first action a beginner needs ('type your words') is about four screens down. P1 and P8 have to scroll past choices they do not understand yet. This is the largest first-time friction on the main device class in Pakistan.

**Suspected root cause.** card-studio-ui.js setStep() only toggles [hidden] and does not scroll; the format switcher and the top action groups render above the workspace at every width; on mobile the background library is placed before the Content section (see CARD-UX-009).

**Recommended change.** On ≤900 px: (a) move the format switcher into the Format step (or into one 'Change size' chip under the preview); (b) collapse the top action groups into one sticky bottom row with two actions (Download, Publish & Share) plus a '⋯ More' menu (Undo/Redo/Reset/Templates/Share image only/Submit); (c) make the step bar scroll the active panel into view, landing just under a compact preview; (d) put #cardText first in the Content step.

**Acceptance criteria (how to verify).** At 360×780 and 393×852 on a first visit, #cardText's top is ≤ 1 viewport height (≤ 780 px) from the page top OR is reached with one tap on 'Content'. No toolbar label is truncated. The step bar scrolls to its panel (scroll delta > 0) and announces the step. Re-run evidence/harness/01-first-impression.mjs and compare.

**Dependencies and regression risks.** Touches the mobile hierarchy governed by WU-PLAT-002H §15 / WU-UXR-001 D5 (production funnel evidence). Ship behind a measured before/after with card_export/publish completion events. Regression risk: social maker pages reuse the same CSS.

---

## CARD-UX-002

### Opening a ready-made card, gallery design or template in Card Studio silently overwrites the saved card

| Field | Value |
|---|---|
| Category | Return usage |
| Affected personas | P7, P4 |
| Journey | J12, J03 |
| Device | 393×852 (persistent profile) |
| Severity | P1 |
| Evidence basis | M, S |
| Implementation effort | M |
| Confidence | High |

**Evidence.** logs/p7.json: week-0 card (id card_mv3o4ngu, text '[TEST] پچھلے ہفتے کا کارڈ…') was replaced by the /urdu-cards hand-off and then by new text under the same id. IndexedDB afterwards held exactly one project: '[TEST] نیا کارڈ'. No warning was shown.

**Steps to reproduce.** 1. Make a card in /urdu-card-studio (it autosaves). 2. Go to /urdu-cards → 'Make it mine' → 'More editing in Card Studio'. 3. Edit. 4. Open /urdu-card-studio again.

**Expected outcome.** The previous card is still available (as a recent card) or the user is asked before it is replaced.

**Actual outcome.** The previous card has been overwritten without a prompt. Its published snapshot still exists, but the editable design is gone.

**User impact.** Silent loss of the user's own work. This defeats the 'return a week later and reuse' journey and undermines trust in local saving.

**Suspected root cause.** card-studio-handoff-adapter.js apply() calls app.replaceState()/updateObjectText() on the project that is already loaded. saveProject() writes by state.id, and the UI only ever loads the most recent project (dbGetLatest), so nothing older can be reached.

**Recommended change.** When a hand-off, ?template= or gallery selection arrives and the current project has user changes, start a new project id (keep the old record). Add a small 'Recent cards on this device' strip (last 5 projects from the existing IndexedDB 'projects' store, with a thumbnail and 'Open') in the Content step and on /urdu-cards' returning state.

**Acceptance criteria (how to verify).** After steps 1–4 both projects exist in IndexedDB and both can be opened from 'Recent cards'. A Playwright test covers the hand-off-after-edit path. No new storage technology or account is required.

**Dependencies and regression risks.** Reuses the IndexedDB projects store and the WU-CARD-RETENTION-001 returning-state work. Risk: storage growth; cap at 20 projects and delete orphaned assets.

---

## CARD-UX-003

### Phone numbers and other numbers next to Urdu are exported in reversed order

| Field | Value |
|---|---|
| Category | Urdu input |
| Affected personas | P5, P3 |
| Journey | J01 |
| Device | All (canvas renderer) |
| Severity | P1 |
| Evidence basis | M, O, S |
| Implementation effort | S |
| Confidence | High (observed); root-cause explanation medium-high |

**Evidence.** P5-phone-number-reversed-crop.jpg: input 'رابطہ: 0300-1234567' exports as '1234567-0300'. P3-announcement-usecase-preview.jpg: 'Happy Friday!' renders as '! Happy Friday'. RES-mixed-urdu-english.jpg: ':Zoom link'.

**Steps to reproduce.** 1. Type an Urdu line followed by a phone number with a hyphen (e.g. رابطہ: 0300-1234567). 2. Download PNG.

**Expected outcome.** The number reads 0300-1234567, exactly as typed.

**Actual outcome.** The two halves swap: 1234567-0300. Trailing punctuation on English runs jumps to the wrong side.

**User impact.** A community notice or shop announcement goes out with a wrong contact number, and it looks correct to the author at a glance. This is a trust-breaking output error for P5's whole use case.

**Suspected root cause.** Unicode bidi rule W2: digits that follow Arabic-script letters are treated as Arabic numbers, and the hyphen between them then resolves right-to-left. The canvas draws each line with ctx.direction='rtl' (card-studio.js line ~389) and no isolation.

**Recommended change.** At draw time only (do not change the stored text), wrap runs matching /[0-9][0-9\-\/.:+ ]*[0-9]/ and Latin-letter runs (with trailing punctuation) in U+2066 LRI … U+2069 PDI before fillText and measureText. Apply the same transform in share-page text rendering if the HTML shows the same reversal.

**Acceptance criteria (how to verify).** Fixture tests render 'رابطہ: 0300-1234567', 'تاریخ 19-10-2026', 'Meeting کل 10:30 AM' and 'Happy Friday!' and pixel-compare or OCR-check the order. Stored text and public_text are unchanged.

**Dependencies and regression risks.** card-studio-core.js layout measurement must use the same transformed string, or wrapping widths will drift. The wedding renderer shares the approach, so check it too.

---

## CARD-UX-004

### Actions fail silently: autosave overwrites error messages, and 'Use sample text' inserts a placeholder that blocks export

| Field | Value |
|---|---|
| Category | Editing |
| Affected personas | P1, P6 |
| Journey | J02, J06 |
| Device | All |
| Severity | P1 |
| Evidence basis | M, S |
| Implementation effort | S |
| Confidence | High |

**Evidence.** logs/p1.json: after 'Use sample text' → Download, no file downloaded and the status line read 'Saved on this device'. logs/p6.json: uploading a broken image left the status at 'Saved on this device'. The sample text equals core.DEFAULT_TEXT ('یہاں اپنا اردو متن لکھیں۔'), which exportPng() and publishCurrent() reject.

**Steps to reproduce.** 1. Fresh visit. 2. Tap 'Use sample text'. 3. Tap 'Download PNG'.

**Expected outcome.** 'Use sample text' gives a real greeting that can be downloaded. If an action is refused, the reason stays visible next to the button.

**Actual outcome.** Nothing downloads. The refusal message is replaced about 700 ms later by the autosave confirmation. The same happens to image-upload errors.

**User impact.** The user thinks the Download button is broken. This is a dead end on the main conversion button for anyone who tries the product with sample text first.

**Suspected root cause.** card-studio.js uses one [data-card-status] element for both autosave (scheduleSave → 'Saved on this device') and errors. card-studio-ui.js contentAction('sample') inserts core.DEFAULT_TEXT, which is also the 'empty' sentinel.

**Recommended change.** (a) Make 'Use sample text' insert a real, exportable sample, e.g. the occasion's top ready-made text (صبح بخیر! اللہ آپ کا دن خوشیوں سے بھر دے۔). (b) Show autosave in its own quiet indicator ('Saved ✓') so it never replaces errors. (c) Show export/publish errors as a toast next to the button that was pressed, and focus #cardText.

**Acceptance criteria (how to verify).** Sample → Download produces a PNG. A refused action shows a message that stays for at least 6 s or until the next user action, in the viewport near the pressed button (verified at 360×780). A broken upload shows 'This image could not be opened…' and keeps it.

**Dependencies and regression risks.** None. Update copy in both en and ur.

---

## CARD-UX-005

### On phones the preview is off-screen while people choose backgrounds and styles

| Field | Value |
|---|---|
| Category | Mobile usability |
| Affected personas | P1, P8, P2 |
| Journey | J01, J07, J08 |
| Device | 360–393 px |
| Severity | P1 |
| Evidence basis | M, O |
| Implementation effort | M |
| Confidence | High |

**Evidence.** logs/p1.json: when 'Vintage Floral' was tapped, the canvas was at viewport top -367 / bottom -24 (completely out of view). P1-after-floral-tap-viewport.jpg. WhatsApp maker @360: text box at 3,214 px, preview at 4,024 px (logs/j04j07.json). Instagram maker @390: text box 1,360 px, preview 2,329 px.

**Steps to reproduce.** 1. On a phone, scroll to the background collection. 2. Tap a background.

**Expected outcome.** The user sees the card change.

**Actual outcome.** The tap only changes the button state. The preview is above the fold, so feedback is invisible unless the user scrolls back up.

**User impact.** 'Did anything happen?' This leads to repeated taps and abandonment, and makes it hard for P1/P8 to compare designs.

**Suspected root cause.** Single-column layout: preview, then a long controls column; no sticky or mini preview.

**Recommended change.** On ≤900 px make the preview sticky at the top at about 38% of viewport height (scaled) while the Content/Format/Style panels scroll below it. Alternatively, show a floating thumbnail of the card that pulses on change. Keep at least 200 px of controls visible on 360×780.

**Acceptance criteria (how to verify).** At 360×780, after any background/font/template tap, ≥ 60% of the canvas is inside the viewport. Measured with the P1 script.

**Dependencies and regression risks.** Same layout governance as CARD-UX-001. Watch on-screen keyboard overlap with the sticky preview (needs real-device check).

---

## CARD-UX-006

### Poet/author name is nearly unreadable on designer backgrounds and missing from the Instagram and WhatsApp makers

| Field | Value |
|---|---|
| Category | Visual design |
| Affected personas | P2, P5 |
| Journey | J08, J01 |
| Device | All |
| Severity | P1 |
| Evidence basis | O, S |
| Implementation effort | S |
| Confidence | High |

**Evidence.** P2-attribution-crop.jpg: 'فیض احمد فیض' drawn at about 27 px in #64748b over a dark brushstroke on a 1080×1350 export. P5-announcement-export.jpg: 'منجانب: محلہ کمیٹی' overlaps the leaf art. logs/p2.json: the Instagram maker's #cardAttribution is hidden (engine-support block); typing an author name does not show it until a separate checkbox is ticked.

**Steps to reproduce.** 1. Choose a Poetry background. 2. Add an author name and tick 'Show author or source'. 3. Download.

**Expected outcome.** The poet's name is legible, in a matching typeface and colour, inside the clear area of the design.

**Actual outcome.** Small grey-blue Naskh at a fixed position near the bottom edge, often on top of the artwork. Background selection updates text.color but never attribution.color, and the attribution is not placed inside the background's safeArea.

**User impact.** Poetry is a primary use case (P2). The tool turns a well-composed couplet into a card with an illegible credit, which undermines the 'professional' feel that users would share on Facebook/Instagram.

**Suspected root cause.** card-studio-background-library.js dispatches text.color only. objectTransform() applies safeArea to 'text' only. The attribution font defaults to Naskh with fontSizeRatio .44.

**Recommended change.** When a background is applied, set attribution.color to the background textColor at 80% opacity, place the attribution inside the safe area under the text block, and use the same family as the main text when it is Nastaliq. Auto-enable 'Show author' when the author field is non-empty (keep the checkbox as an off switch). Expose the author field on the Instagram and WhatsApp makers.

**Acceptance criteria (how to verify).** For all 44 backgrounds × square/portrait/story, the attribution rect is inside the safe area and has a contrast ratio ≥ 4.5:1 against the average background luminance under it (automated canvas sample). Typing an author shows it immediately.

**Dependencies and regression risks.** Builds on the WU-UXR-001 D4 safe-area work. Update the remix sanitizer only if new fields are added.

---

## CARD-UX-007

### Template frame and accent bar are drawn on top of designer backgrounds, giving double frames and collisions

| Field | Value |
|---|---|
| Category | Visual design |
| Affected personas | P1, P2, P5 |
| Journey | J01, J08 |
| Device | All |
| Severity | P2 |
| Evidence basis | O |
| Implementation effort | S |
| Confidence | High |

**Evidence.** P1-downloaded-card.jpg (rectangular template frame and orange bar over the floral art's own frame); P2-instagram-poetry.jpg (frame plus bar over watercolour); P5-announcement-export.jpg (the text block touches the accent bar and the flower).

**Steps to reproduce.** 1. Keep the default template. 2. Pick any designer background. 3. Export.

**Expected outcome.** A designer background looks like the finished design shown in its tile.

**Actual outcome.** The template's border and accent bar are layered on top, competing with the artwork.

**User impact.** The result looks amateurish and 'technically complete but weak' — the gap between the gallery tile and the exported card.

**Suspected root cause.** Template decorations are drawn independently of background.type === 'image' with a designer safe area.

**Recommended change.** Suppress template frame and accent bar when a designer background (one with a safeArea) is active. Keep them for solid, gradient and user-photo backgrounds.

**Acceptance criteria (how to verify).** Exports with any designer background contain no template frame or accent pixels (pixel test at the known frame coordinates). Visual review of 6 popular backgrounds.

**Dependencies and regression risks.** None.

---

## CARD-UX-008

### Nine top-level actions compete with the editor; on phones the labels are truncated

| Field | Value |
|---|---|
| Category | First-time onboarding |
| Affected personas | P1, P8, P4 |
| Journey | J01 |
| Device | All; worst at 360 px |
| Severity | P1 |
| Evidence basis | M, O, E |
| Implementation effort | S–M |
| Confidence | High (counts); impact on completion is a hypothesis to validate with funnel data |

**Evidence.** first-impression-card-studio-android-small.jpg; first-impression-card-studio-desktop.jpg. logs/01.json: 87 visible interactive controls in main on phones. Top bar: Undo, Redo, Browse templates, Back to editor, Reset, Share image only, Download PNG, Publish & Share, Submit to Urdu Writers, plus 'How public sharing works', 'Manage published links', the format switcher (3) and the step bar (4) with a mode switch (2).

**Steps to reproduce.** Open Card Studio on any device and look at the first screen.

**Expected outcome.** One obvious primary path (write → design → share) and one clear finish action.

**Actual outcome.** Three primary-coloured buttons (Download PNG, Publish & Share, Submit to Urdu Writers) appear before the user has written anything. 'Reset' sits next to 'Share'. 'Back to editor' goes to the homepage writer.

**User impact.** Choice overload for P1/P8 and a risk of accidental Reset. It also dilutes Publish & Share, which is the growth action.

**Suspected root cause.** Actions were added layer by layer (UI, publish layer, community layer) to the same toolbar group.

**Recommended change.** Keep two finish actions visible (Download, Publish & Share). Move Undo/Redo next to the preview. Move Reset, Browse templates, Back to editor, Share image only and Submit to Urdu Writers into a '⋯ More' menu. Show 'Submit to Urdu Writers' after a successful publish or download rather than up front.

**Acceptance criteria (how to verify).** First viewport at 1440×900 has ≤ 2 primary buttons and no Reset beside Share. Mobile shows no truncated labels. Tap count to download is unchanged.

**Dependencies and regression risks.** Community publishing (WU-COMMUNITY-001) owns the 'Submit' entry. Coordinate placement.

---

## CARD-UX-009

### The background collection appears on the Content step, and the steps do not match what is on screen

| Field | Value |
|---|---|
| Category | Template selection |
| Affected personas | P1, P2, P8 |
| Journey | J01 |
| Device | All |
| Severity | P2 |
| Evidence basis | M, S |
| Implementation effort | S |
| Confidence | High |

**Evidence.** logs/p1.json: the built-in library has data-card-step='format' and hidden=false while the active step is 'content'. full-card-studio-desktop.jpg shows 'Urdu background collection' under step 1 'Content'.

**Steps to reproduce.** Open Card Studio (active step is Content).

**Expected outcome.** Content step = write your words. Backgrounds appear under Format or Style.

**Actual outcome.** The 44-tile collection sits between the preview and the text box during the Content step.

**User impact.** Contradicts the stepper. It is the main reason the text box is pushed down (CARD-UX-001) and makes 'what do I do first?' unclear.

**Suspected root cause.** card-studio-background-library.js inserts the library after card-studio-ui.js has run syncSteps(); visibility is only re-synced on step change.

**Recommended change.** Call syncSteps() (or expose WriteUrduCardStudioUi.refresh()) after the library mounts. Place the library under Style → Background (or Format), and keep a compact 3-tile 'Suggested backgrounds' row under the text box in Content.

**Acceptance criteria (how to verify).** On load, every [data-card-step-panel] whose step ≠ active is hidden. Content step shows the text box as the first control.

**Dependencies and regression risks.** Tests in tests/card-studio-background-collection.spec.js may assume the current position.

---

## CARD-UX-010

### Ready-made card tiles carry eight actions each, with 9.4 px labels on small phones

| Field | Value |
|---|---|
| Category | Mobile usability |
| Affected personas | P4, P8 |
| Journey | J03 |
| Device | 360×780, 393×852 |
| Severity | P2 |
| Evidence basis | M, O |
| Implementation effort | M |
| Confidence | High |

**Evidence.** P4-card-actions.jpg. logs/p8.json: format buttons use a 9.44 px font at 360 px, 38×38 targets, and 'WhatsApp Status' appears twice per card. Actions: ♡, Share image, Make it mine, Card, WhatsApp Status, Instagram Post, WhatsApp Status, Shareable link.

**Steps to reproduce.** Open /urdu-cards on a phone and pick any category.

**Expected outcome.** Tap a card → see it large → one primary 'Use this card' and one 'Send'.

**Actual outcome.** Each 165 px tile has three button rows with bilingual labels wrapped onto 3–4 lines. 'WhatsAp' is truncated. Button text dominates the artwork.

**User impact.** Older users (P8) struggle to read and hit targets. Busy users (P4) cannot tell browsing from editing from sharing.

**Suspected root cause.** All destination formats and share modes are exposed per tile.

**Recommended change.** Per tile: artwork + ♡ + one 'Send' (opens a bottom sheet: Send image · Get link · WhatsApp Status · Instagram) + 'Make it mine'. Use one language per button, following the page locale (resolves WU-UXR-001 D-2). Minimum 14 px labels and 44 px targets.

**Acceptance criteria (how to verify).** At 360×780 every tile action is ≥ 44×44 px with font ≥ 14 px. ≤ 3 visible actions per tile. No duplicated destination.

**Dependencies and regression risks.** urdu-cards.spec.js and urdu-cards-social-formats.spec.js selectors.

---

## CARD-UX-011

### No Birthday occasion, and thin coverage of core occasions (4 Eid, 4 Congratulations of 157 cards)

| Field | Value |
|---|---|
| Category | Template selection |
| Affected personas | P4, P8 |
| Journey | J03 |
| Device | All |
| Severity | P2 |
| Evidence basis | M, S |
| Implementation effort | S–M (content + art reuse) |
| Confidence | High |

**Evidence.** logs/p4.json: 17 filters, none for Birthday/سالگرہ. js/urdu-cards-data.js: 157 records; only one mentions سالگرہ (a wedding anniversary). Eid filter = 4 cards; Congratulations = 4.

**Steps to reproduce.** Open /urdu-cards and look for a birthday card.

**Expected outcome.** 'Birthday · سالگرہ مبارک' is one of the first filters, with several designs.

**Actual outcome.** No birthday card exists. P4 had to settle for a generic 'Congratulations'.

**User impact.** Birthday is among the most frequent personal greetings. Missing it sends users elsewhere.

**Suspected root cause.** Content library scope (WU-CARD-CONTENT-001/001A).

**Recommended change.** Add a Birthday category with ≥ 8 cards (family, friend, child, colleague, dua-style) and expand Eid (Eid ul Fitr / Eid ul Adha) and Congratulations (exam result, new baby, new job, nikah) to ≥ 8 each. Order filters by seasonal/occasion demand.

**Acceptance criteria (how to verify).** Birthday filter visible in the first two chip rows at 393 px. Each core occasion has ≥ 8 cards. validate-template-library / content checks pass.

**Dependencies and regression risks.** Content spec WU-CARD-CONTENT-001A. Reuse existing backgrounds.

---

## CARD-UX-012

### A ready-made card's 'Shareable link' publishes a new public page on every tap, without confirmation or a way to delete it

| Field | Value |
|---|---|
| Category | Publishing |
| Affected personas | P8, P4 |
| Journey | J09, J11 |
| Device | All |
| Severity | P1 |
| Evidence basis | M, S |
| Implementation effort | S |
| Confidence | High |

**Evidence.** Harness log: each tap → POST /api/shares 201 (logs/p8.json; image 1,545,304 bytes). js/curated-card-share.js publishCardShare() never stores payload.manageToken and has no confirmation step. Its attribution is set to '<background name> · Write Urdu Card', so the recipient page shows '— Eid Emerald · Write Urdu Card' as if it were the author.

**Steps to reproduce.** 1. /urdu-cards → any card → 'Shareable link'. 2. Tap again.

**Expected outcome.** The same behaviour as Card Studio's Publish & Share: a one-time explanation, the link is remembered (and reused for the same card), and it can be deleted.

**Actual outcome.** An immediate silent publish and copy. Two taps make two public pages. Nothing appears in 'Manage published links'. The design name shows as the author.

**User impact.** Inconsistent consent model across the product, unmanageable public artifacts, a misleading credit line, and wasted R2/D1 writes and rate-limit budget (10 per 10 min) on duplicates.

**Suspected root cause.** The curated share path was built separately from card-studio-publish.js.

**Recommended change.** Reuse card-studio-publish's acknowledgement and management store. Cache one URL per (cardId, text hash) in localStorage and reuse it. Send no attribution (or the card's real author when present). For unedited stock cards, consider linking to a static /urdu-cards/<card> URL instead of publishing.

**Acceptance criteria (how to verify).** Tapping 'Shareable link' twice on the same unedited card makes ≤ 1 POST. The link appears in 'Manage published links' and can be deleted. The recipient page shows no fake author.

**Dependencies and regression risks.** WU-SHARE-001 privacy contract. Telemetry events in share-loop-telemetry.

---

## CARD-UX-013

### A personalised ready-made card cannot be shared as a link without going into Card Studio

| Field | Value |
|---|---|
| Category | Sharing |
| Affected personas | P4 |
| Journey | J03, J09 |
| Device | All |
| Severity | P2 |
| Evidence basis | M |
| Implementation effort | S–M |
| Confidence | High |

**Evidence.** logs/p4.json: personalizer actions are only 'Share this image' and 'More editing in Card Studio'. The tile's 'Shareable link' shares the stock text, not 'احمد بھائی، …'.

**Steps to reproduce.** /urdu-cards → Make it mine → add a name → look for a link option.

**Expected outcome.** 'Get a link' alongside 'Send image' in the personalizer.

**Actual outcome.** Image only. To get a link the user must open Card Studio and find Publish & Share.

**User impact.** P4's under-two-minute goal is met for an image but not for a link; the most viral share type (link with preview) is hidden in the quickest flow.

**Suspected root cause.** The personalizer was scoped to image share (WU-CARD-RETENTION/001).

**Recommended change.** Add 'Get link' to the personalizer using the same publish layer and consent copy as Card Studio (one-time acknowledgement).

**Acceptance criteria (how to verify).** From /urdu-cards a personalised card can be published as a link in ≤ 4 taps from the card tile; the public page shows the personalised text.

**Dependencies and regression risks.** CARD-UX-012 (shared publish module).

---

## CARD-UX-014

### Without the Web Share API, 'Share' only copies or downloads; there is no WhatsApp or Facebook route

| Field | Value |
|---|---|
| Category | Sharing |
| Affected personas | P1, P3, P5 |
| Journey | J11 |
| Device | Desktop Chromium; Android Chrome confirmation pending |
| Severity | P2 |
| Evidence basis | M, S, H |
| Implementation effort | S |
| Confidence | High (desktop); Android behaviour needs real-device validation |

**Evidence.** logs/p3.json: 'Share link' → 'Public link copied.' (navigator.share undefined). logs/p1.json: 'Share image only' → 'Sharing is not supported here. The PNG was downloaded instead.' grep finds no wa.me/whatsapp:// or facebook sharer in any card/share file.

**Steps to reproduce.** Desktop browser without Web Share → publish → 'Share link'.

**Expected outcome.** Clear buttons: WhatsApp · Facebook · Copy link.

**Actual outcome.** Only 'Copy link'. The user must open WhatsApp Web themselves and paste.

**User impact.** Desktop office users (P4/P5) and many Windows users do not get a direct route. 'Share' feels broken when it silently downloads.

**Suspected root cause.** Single reliance on navigator.share.

**Recommended change.** On the publish success dialog and the public page, show explicit 'WhatsApp' (https://wa.me/?text=<encoded url>) and 'Facebook' (facebook.com/sharer/sharer.php?u=) links next to Copy link when navigator.share is missing. Rename 'Share image only' to 'Send image file' and on fallback say 'Saved to your device — attach it in WhatsApp'.

**Acceptance criteria (how to verify).** With navigator.share undefined, the success dialog shows WhatsApp and Facebook links with correct encoded URLs. On Android Chrome the native sheet is still preferred (real-device check).

**Dependencies and regression risks.** Founder decision D-1 in WU-UXR-001 (send as text) is related but separate: these are link shares, not raw-text shares.

---

## CARD-UX-015

### Privacy wording contradicts publishing, and overstates what 'Publish & Share' does

| Field | Value |
|---|---|
| Category | Privacy |
| Affected personas | P1, P6, P3 |
| Journey | J01, J09 |
| Device | All |
| Severity | P2 |
| Evidence basis | O, S |
| Implementation effort | S |
| Confidence | High |

**Evidence.** logs/01.json status on load: 'Your text and images stay in this browser and are not uploaded.' P6-text-dragged.jpg: the same line next to the upload control, with Publish & Share (which uploads) in the toolbar. Export step: 'Publish & Share keeps your writing safe on a free Write-Urdu.com link you can post straight to WhatsApp, Instagram or Facebook.'

**Steps to reproduce.** Read the status and export copy, then publish.

**Expected outcome.** Accurate copy: work stays on this device until you choose Publish, which makes a public link. Instagram needs a downloaded image.

**Actual outcome.** An absolute 'not uploaded' claim, plus 'safe' and 'post straight to Instagram' claims.

**User impact.** Misleading for privacy-sensitive users. Instagram does not use link previews in posts, so promising 'post straight to Instagram' sets a wrong expectation (P2).

**Suspected root cause.** Copy predates the publish layer (copy.en.privacy, copy.en.exportPrivacy).

**Recommended change.** privacy → 'Saved only on this device. Nothing is uploaded unless you choose Publish & Share.' exportPrivacy → 'Download saves an image for WhatsApp Status or Instagram. Publish & Share makes a public link anyone can open — best for WhatsApp chats and Facebook.' (and the Urdu equivalents).

**Acceptance criteria (how to verify).** No string claims 'not uploaded' unconditionally; no string claims direct Instagram posting. Language firewall check passes.

**Dependencies and regression risks.** scripts/public-language-firewall.js copy rules; Urdu locale strings.

---

## CARD-UX-016

### 'Edit this design' is unavailable for any card made with the 44 designer backgrounds

| Field | Value |
|---|---|
| Category | Return usage |
| Affected personas | P7, recipients |
| Journey | J10, J12 |
| Device | All |
| Severity | P2 |
| Evidence basis | M, S |
| Implementation effort | S–M |
| Confidence | High |

**Evidence.** logs/p7.json: own published card with 'Emerald Mughal' → [data-share-edit] count 0. A gradient-template card (Bo6Kjoxr) → count 1. functions/_lib/share-remix.js line 52 rejects background.type other than solid/gradient.

**Steps to reproduce.** Publish a card that uses a designer background → open the link → look for 'Edit this design'.

**Expected outcome.** The creator (and remixing recipients) can reopen the same design.

**Actual outcome.** Only 'Use these words' is offered. The design is lost unless the local project survives (see CARD-UX-002).

**User impact.** The most attractive path (designer backgrounds) is the least reusable. Returning users cannot iterate on a published card.

**Suspected root cause.** Remix payload only allows solid/gradient backgrounds, because user photos must never be republished. Designer backgrounds are public static assets.

**Recommended change.** Allow background {type:'library', id:<registry id>} in the remix sanitizer (validated against card-background-registry). Keep user-uploaded photos excluded.

**Acceptance criteria (how to verify).** A card published with any registry background shows 'Edit this design', and reopening reproduces the same background/text/position. Uploaded-photo cards still fall back to text-only.

**Dependencies and regression risks.** Server sanitizer plus client hand-off. Privacy review: no user media in the payload.

---

## CARD-UX-017

### The Instagram and WhatsApp makers have weaker defaults and fewer finish options than Card Studio

| Field | Value |
|---|---|
| Category | Sharing |
| Affected personas | P2, P1 |
| Journey | J07, J08 |
| Device | All |
| Severity | P2 |
| Evidence basis | M, O |
| Implementation effort | M |
| Confidence | High |

**Evidence.** P2-instagram-maker-download.jpg (default: right-aligned Naskh on white, accent bar at the top right). J07-whatsapp-status.jpg (small Naskh, mostly empty 1080×1920). logs/j04j07.json: safe-area warning shown for the maker's own default layout; no Publish & Share on either maker (count 0). logs/p2.json: 'Open the full Urdu Card Studio' link did not carry the couplet.

**Steps to reproduce.** Open /urdu-instagram-post-maker or /urdu-whatsapp-status-maker and type text.

**Expected outcome.** An attractive default for the platform, with author, link and download available.

**Actual outcome.** Plain defaults, a safe-area warning on untouched defaults, no link publishing, no author, and text is lost when following the related link to Card Studio.

**User impact.** The SEO entry pages for the two biggest platforms give the weakest result and the fewest ways to share.

**Suspected root cause.** social-direct-workspace.js mounts a reduced control set. The default social template is minimal-white/midnight Naskh.

**Recommended change.** Default these makers to a designer background suited to the format (poetry → Nastaliq, status → story-safe), show the author field, and add Publish & Share. Make the 'Open the full Card Studio' link use the existing format-switch hand-off so text and design carry over.

**Acceptance criteria (how to verify).** The default layout produces no safe-area warning. Text carries to Card Studio via the related link. Publish is available from both makers.

**Dependencies and regression risks.** WU-CARD-GALLERY-001A, social-maker-core.js; SEO pages unchanged in copy.

---

## CARD-UX-018

### Undo misses typing, font, colour and background changes, and Reset cannot be undone

| Field | Value |
|---|---|
| Category | Editing |
| Affected personas | P6, P7 |
| Journey | J06, J12 |
| Device | All |
| Severity | P2 |
| Evidence basis | M, S |
| Implementation effort | S |
| Confidence | High |

**Evidence.** logs/p6.json: after typing in #cardText, Undo stayed disabled. logs/p7.json: after Reset, undoAvailable=false and the old text and background were gone. card-studio-interaction.js pushHistory() is only called for canvas gestures, layout fields and on-canvas edits.

**Steps to reproduce.** Type in the text box → press Undo. Or choose Reset → OK.

**Expected outcome.** Undo reverts the last change of any kind, including Reset.

**Actual outcome.** Undo is disabled. Reset is final.

**User impact.** Users cannot experiment safely, and an accidental Reset next to Share loses the card.

**Suspected root cause.** Panel inputs in card-studio.js bindControls() bypass the interaction history.

**Recommended change.** Record a history snapshot on 'change' (not each keystroke) for panel fields and on text-box blur or a 1 s idle; record Reset as a history step and show 'Card reset · Undo' for 8 s.

**Acceptance criteria (how to verify).** Undo is enabled after a text-box edit, font change, background change and Reset, and each Undo restores the previous state (Playwright).

**Dependencies and regression risks.** Keep history capped at 50.

---

## CARD-UX-019

### Changing template after uploading a photo replaces the photo and font

| Field | Value |
|---|---|
| Category | Editing |
| Affected personas | P6 |
| Journey | J06 |
| Device | Desktop |
| Severity | P2 |
| Evidence basis | M |
| Implementation effort | S |
| Confidence | High |

**Evidence.** logs/p6.json: background 'image' → after choosing 'Midnight' it became 'gradient' with Noto Naskh Arabic. P6-after-template-change.jpg. Undo restored it.

**Steps to reproduce.** Upload a photo → Format → choose another template.

**Expected outcome.** Templates restyle the text; the user's photo stays unless they choose otherwise.

**Actual outcome.** The photo is replaced by the template background.

**User impact.** Surprise and lost work for creators. 'Template' vs 'background' is unclear.

**Suspected root cause.** core.applyTemplate overwrites background unconditionally.

**Recommended change.** When background.type === 'image' from an upload, keep the background and apply only the text styles, with a toast offering 'Use template background instead'.

**Acceptance criteria (how to verify).** After upload + template change, background.imageAssetId is unchanged; the toast offers the alternative.

**Dependencies and regression risks.** Template-library tests.

---

## CARD-UX-020

### Text colour does not adapt to an uploaded photo, so the default dark text is unreadable on dark images

| Field | Value |
|---|---|
| Category | Visual design |
| Affected personas | P6 |
| Journey | J06 |
| Device | All |
| Severity | P2 |
| Evidence basis | O |
| Implementation effort | S |
| Confidence | High |

**Evidence.** P6-text-dragged.jpg: dark #1f2937 Nastaliq on a dark blue photo. The overlay control is hidden in Quick mode and defaults to 0.

**Steps to reproduce.** Upload a darker photo in Quick mode.

**Expected outcome.** Readable text by default.

**Actual outcome.** Very low contrast. The only fix (overlay or text colour) is in Advanced mode.

**User impact.** Beginners produce unreadable cards and do not know why.

**Suspected root cause.** The upload path keeps the template text colour and overlay 0.

**Recommended change.** On upload, sample the image's average luminance in the text box area and pick light or dark text plus a 25–35% matching overlay. Expose one 'Text readability' slider in Quick mode.

**Acceptance criteria (how to verify).** For the bright and dark synthetic fixtures, the auto-chosen text has a contrast ratio ≥ 4.5:1 against the sampled region.

**Dependencies and regression risks.** None.

---

## CARD-UX-021

### The 'Remove image' button is labelled 'Background image removed.'

| Field | Value |
|---|---|
| Category | Editing |
| Affected personas | P6 |
| Journey | J06 |
| Device | All |
| Severity | P2 |
| Evidence basis | O, S |
| Implementation effort | S |
| Confidence | High |

**Evidence.** P6-text-dragged.jpg. In card-studio.js copy.en.removeImage = 'Background image removed.' (the status message) and the button uses data-card-i18n='removeImage'.

**Steps to reproduce.** Choose Background type → Uploaded image.

**Expected outcome.** A button that says 'Remove image'.

**Actual outcome.** The button reads 'Background image removed.' before anything has been removed.

**User impact.** Confusing, and screen readers announce the wrong action.

**Suspected root cause.** Wrong i18n key value (Urdu says 'تصویر ہٹائیں', which is correct).

**Recommended change.** Set copy.en.removeImage = 'Remove image' (the status already uses imageRemoved).

**Acceptance criteria (how to verify).** Button text and accessible name are 'Remove image'.

**Dependencies and regression risks.** None.

---

## CARD-UX-022

### Roman Urdu status is contradictory during an outage; the passage prompt appears off-screen; no way to correct a single word

| Field | Value |
|---|---|
| Category | Urdu input |
| Affected personas | P3 |
| Journey | J05 |
| Device | 360×780 |
| Severity | P2 |
| Evidence basis | M, O |
| Implementation effort | S (status/placement); M (word alternatives) |
| Confidence | High |

**Evidence.** logs/p3.json: the alert says 'Urdu conversion is not responding…' while [data-card-transliteration-status] still says 'Roman Urdu input is ready.' The 'Convert passage' button was at viewport top -114 (above the text box, off-screen) when the field was in view. After conversion, no per-word alternatives UI exists. P3-outage-word-by-word.jpg, P3-outage-passage-convert.jpg.

**Steps to reproduce.** On a phone, with the provider unreachable, type Roman words; then paste a sentence.

**Expected outcome.** One status line telling the truth; the 'Convert' action next to the field; tap a word to fix it.

**Actual outcome.** Two conflicting messages; the prompt above the field and out of view; to fix a word, retype it.

**User impact.** P3 cannot tell whether to wait, retry or switch modes. With the provider up, a single wrong word means editing Urdu script they cannot type.

**Suspected root cause.** The legacy status (card-studio.js setTransliterationStatus) is independent of the input-mode alert (WU-UXR-001 B1). The batch panel is rendered above the label and field.

**Recommended change.** Hide the legacy status when the input-mode alert is visible (single source of truth). Move the batch prompt and button directly below #cardText. Later: tap a converted word to see the provider's top 3 alternatives.

**Acceptance criteria (how to verify).** During an outage exactly one status is visible. The convert button is within 200 px below the field at 360×780.

**Dependencies and regression risks.** Provider dependency D-4 (WU-JOURNEY-001B). The success path could not be tested with the real provider in this environment.

---

## CARD-UX-023

### The Urdu interface is only partly translated in Card Studio

| Field | Value |
|---|---|
| Category | Accessibility |
| Affected personas | P8, P1 |
| Journey | J01 |
| Device | 393×852 |
| Severity | P2 |
| Evidence basis | M, O |
| Implementation effort | S |
| Confidence | High |

**Evidence.** logs/resilience.json urduUi.buttons: 'Undo', 'Redo', 'Share image only', 'Publish & Share', 'Submit to Urdu Writers', '1 Content'…'4 Export', 'Quick mode', 'Advanced mode' remain English on /urdu/urdu-card-studio. RES-urdu-interface.jpg.

**Steps to reproduce.** Switch to اردو in the header and open Card Studio.

**Expected outcome.** All workflow labels in Urdu.

**Actual outcome.** A mix: the core workflow (steps, modes, publish) stays English.

**User impact.** Urdu-first users (P8, many P1) hit English exactly at the decision points.

**Suspected root cause.** card-studio-ui.js and card-studio-publish.js set English text directly and ownImageShareLabels() strips data-card-i18n.

**Recommended change.** Route these labels through the existing copy tables (copy.ur) and re-apply on write-urdu:locale-change.

**Acceptance criteria (how to verify).** On /urdu/urdu-card-studio no visible control label in main is Latin-script, except brand/format names (PNG, WhatsApp).

**Dependencies and regression risks.** WU-I18N-001 locale generation.

---

## CARD-UX-024

### At 360 px the card preview and step bar overflow the screen horizontally

| Field | Value |
|---|---|
| Category | Mobile usability |
| Affected personas | P3, P1 |
| Journey | J01 |
| Device | 360×780 |
| Severity | P2 |
| Evidence basis | M, O |
| Implementation effort | S |
| Confidence | High |

**Evidence.** full-card-studio-android-small.jpg rendered 390 px wide at 360 (page scrollWidth > viewport). P3-announcement-usecase-preview.jpg: artboard cut at the right edge and '4 Export' clipped in the in-page stepper. logs/01.json canvas left 65 + width 310 = 375 > 360.

**Steps to reproduce.** Open Card Studio at 360×780.

**Expected outcome.** No horizontal scroll; the full card is visible.

**Actual outcome.** About 30 px of overflow. The right edge of the card is hidden.

**User impact.** Small Android phones are common in Pakistan. Users cannot see the full card they are about to send.

**Suspected root cause.** Artboard wrapper padding/offset (left 65 px) plus a fixed width calculation.

**Recommended change.** Constrain .card-studio-artboard-wrap to max-width: 100% with box-sizing and symmetric padding at ≤ 400 px.

**Acceptance criteria (how to verify).** documentElement.scrollWidth === innerWidth at 360, 375 and 393 px; the canvas is fully inside the viewport horizontally.

**Dependencies and regression risks.** css/card-studio.css shared by makers.

---

## CARD-UX-025

### On desktop the text box is buried inside a scrolling side panel; 84 Tab presses to reach it

| Field | Value |
|---|---|
| Category | Accessibility |
| Affected personas | P5, P6 |
| Journey | J01 |
| Device | 1440×900 |
| Severity | P2 |
| Evidence basis | M |
| Implementation effort | S |
| Confidence | High |

**Evidence.** logs/01.json desktop textarea top 2,155 px (inside .card-studio-panel, overflow-y auto, scrollHeight 2,105 vs clientHeight 772). logs/resilience.json keyboard.tabsToTextField = 84. The canvas (670 px square at y=557) is taller than the remaining viewport, so the bottom of the card is below the fold while editing (P6-text-dragged.jpg).

**Steps to reproduce.** Desktop: open Card Studio and press Tab from the top until the text box has focus.

**Expected outcome.** The text box is visible on load and reachable in a few Tabs. The whole card is visible.

**Actual outcome.** The first visible panel content is the background collection. Keyboard users pass through 44 background tiles first.

**User impact.** Keyboard and screen-reader users are effectively blocked from starting. Desktop users see a gallery, not an editor.

**Suspected root cause.** Library placement (CARD-UX-009) and no skip link.

**Recommended change.** Fix CARD-UX-009. Add a 'Skip to card text' link. Scale the canvas to fit min(viewport height − header, column width).

**Acceptance criteria (how to verify).** ≤ 15 Tabs from page top to #cardText. The whole canvas is visible at 1440×900 and 1366×768.

**Dependencies and regression risks.** CARD-UX-009.

---

## CARD-UX-026

### 'Greeting / Announcement' picks a 1280×720 landscape layout, which is poor for phone sharing

| Field | Value |
|---|---|
| Category | Template selection |
| Affected personas | P3, P5, P1 |
| Journey | J01 |
| Device | All |
| Severity | P2 |
| Evidence basis | O, E |
| Implementation effort | S |
| Confidence | Medium-high |

**Evidence.** logs/p3.json: use case 'announcement' → preset landscape + botanical-frame. P3-announcement-usecase-preview.jpg shows text crowding the frame edges.

**Steps to reproduce.** Format → 'Greeting / Announcement'.

**Expected outcome.** A layout suited to WhatsApp chat (square or 4:5 portrait), the main greeting channel.

**Actual outcome.** Landscape 16:9, which appears small in WhatsApp chats and Status.

**User impact.** Greetings, the most common job, start from the least suitable shape.

**Suspected root cause.** useCases map in card-studio-ui.js.

**Recommended change.** Split it into 'Greeting' (square, designer background, Nastaliq, larger first line) and 'Notice / Announcement' (portrait 4:5, Naskh, clear hierarchy).

**Acceptance criteria (how to verify).** The Greeting use case produces 1080×1080; the Announcement use case produces 1080×1350; both pass the safe-area check with sample text.

**Dependencies and regression risks.** WU-UXR-001 D5 (format order) — evidence here supports a defaults change, not a layout change.

---

## CARD-UX-027

### There is no heading hierarchy: titles, body, dates and contacts all render at one size

| Field | Value |
|---|---|
| Category | Visual design |
| Affected personas | P5, P1 |
| Journey | J01 |
| Device | All |
| Severity | P2 |
| Evidence basis | O, E |
| Implementation effort | M |
| Confidence | Medium |

**Evidence.** P5-announcement-export.jpg: 'اعلانِ عام' (heading) renders no larger than the body; P1-downloaded-card.jpg: 'صبح بخیر' the same size as the dua line.

**Steps to reproduce.** Type a heading line followed by body lines.

**Expected outcome.** The first line can stand out as a title.

**Actual outcome.** One text object with one size. The only second object is the small attribution.

**User impact.** Announcements look flat and less trustworthy. Greetings lose emphasis.

**Suspected root cause.** Single-text-object model.

**Recommended change.** Add an 'Emphasise first line' toggle (default on for Greeting and Announcement use cases) that renders line 1 at 1.4× with extra spacing. Avoid a multi-object editor.

**Acceptance criteria (how to verify).** With the toggle on, the measured glyph height of line 1 is ≥ 1.35× that of line 2. Auto-fit accounts for it.

**Dependencies and regression risks.** card-studio-core.js layout and the remix payload (new boolean).

---

## CARD-UX-028

### Long unbreakable text (URLs) overflows the card, and the auto-fit warning appears while auto-fit is on

| Field | Value |
|---|---|
| Category | Visual design |
| Affected personas | P5 |
| Journey | J01 |
| Device | Desktop |
| Severity | P3 |
| Evidence basis | M, O |
| Implementation effort | S |
| Confidence | High |

**Evidence.** RES-mixed-urdu-english.jpg ('…eet.example.com/a' clipped at both edges). logs/resilience.json long.warning: 'This text is larger than the available card area. Reduce the text or switch on auto-fit.' while auto-fit was checked.

**Steps to reproduce.** Type a URL, or a 746-character passage.

**Expected outcome.** The URL is shrunk or broken to fit; the warning is accurate.

**Actual outcome.** Clipped URL; a contradictory instruction.

**User impact.** Broken-looking exports for organisers and confusing advice.

**Suspected root cause.** The wrap splits on whitespace only; the warning text is not state-aware.

**Recommended change.** Allow breaking long tokens at / . - when a token exceeds the box width. Change the warning to 'Text is too long for this size even at the smallest readable size — shorten it or choose a taller format.'

**Acceptance criteria (how to verify).** No glyph is drawn outside the canvas for a 60-character URL. The warning never suggests enabling auto-fit when it is already enabled.

**Dependencies and regression risks.** Fit algorithm (WU-UXR-001 D1).

---

## CARD-UX-029

### Card Studio needs about 1.5 MB and 41 scripts; on slow 3G it takes about 22 s to become usable and 35 s for Nastaliq

| Field | Value |
|---|---|
| Category | Performance |
| Affected personas | P1, P8 |
| Journey | J01 |
| Device | 360×780, 400 kbps / 400 ms emulated |
| Severity | P2 |
| Evidence basis | M |
| Implementation effort | M |
| Confidence | Medium (local server, not production CDN) |

**Evidence.** logs/resilience.json: weight 1,500 KB (script 909 KB, 41 scripts); slow profile DCL 21.9 s, app ready 21.9 s, Nastaliq ready 34.6 s, load 34.6 s. Local harness: absolute numbers will differ on Cloudflare (compression/CDN), so treat them as relative.

**Steps to reproduce.** Emulate 400 kbps/400 ms and open /urdu-card-studio.

**Expected outcome.** The editor is usable in under 8 s on slow mobile.

**Actual outcome.** About 22 s before anything is interactive.

**User impact.** Users on prepaid/slow data abandon before they start.

**Suspected root cause.** All maker, voice, transliteration, AI-adjacent and publish scripts load up front; the Nastaliq font is large.

**Recommended change.** Defer voice, community and batch-transliteration scripts until first use. Lazy-load the background library thumbnails. Preload only the Nastaliq subset needed for the default text.

**Acceptance criteria (how to verify).** On production, Lighthouse mobile TTI/INP for /urdu-card-studio improves ≥ 30%. Script count before first interaction ≤ 20.

**Dependencies and regression risks.** Production measurement needed (07-test-coverage).

---

## CARD-UX-030

### Downloaded files are named 'Untitled card-YYYY-MM-DD.png'

| Field | Value |
|---|---|
| Category | Return usage |
| Affected personas | P1, P7 |
| Journey | J01 |
| Device | All |
| Severity | P3 |
| Evidence basis | M |
| Implementation effort | S |
| Confidence | High |

**Evidence.** logs/p1.json download.name = 'Untitled card-2026-10-11.png'.

**Steps to reproduce.** Download from Card Studio.

**Expected outcome.** A recognisable name, e.g. 'subah-bakhair-write-urdu.png' or an occasion-based name.

**Actual outcome.** 'Untitled card', with a space.

**User impact.** Hard to find in a phone's Downloads when attaching in WhatsApp.

**Suspected root cause.** state.name defaults to 'Untitled card'.

**Recommended change.** Name the file from the use case/occasion plus date (e.g. 'urdu-greeting-2026-10-11.png'); allow an Urdu-safe slug.

**Acceptance criteria (how to verify).** No downloaded filename contains 'Untitled' or spaces.

**Dependencies and regression risks.** None.

---

## CARD-UX-031

### Publishing error copy uses internal jargon

| Field | Value |
|---|---|
| Category | Publishing |
| Affected personas | P3 |
| Journey | J09 |
| Device | All |
| Severity | P3 |
| Evidence basis | M |
| Implementation effort | S |
| Confidence | High |

**Evidence.** RES-publish-backend-unavailable.jpg: 'Public sharing storage is not connected to this deployment yet.'

**Steps to reproduce.** Publish while the share backend is unavailable.

**Expected outcome.** Plain-language message plus an alternative ('Download the image instead').

**Actual outcome.** Developer wording; only 'Try again'.

**User impact.** Users do not know what to do next.

**Suspected root cause.** card-studio-publish.js error mapping.

**Recommended change.** 'Links can't be created right now. Your card is safe here — download the image and send it instead.' with a Download button in the dialog.

**Acceptance criteria (how to verify).** The error dialog contains no 'deployment'/'storage' words and offers Download.

**Dependencies and regression risks.** None.

---

## CARD-UX-032

### Published images can be 0.4–2.2 MB PNGs, which risks missing link previews in WhatsApp

| Field | Value |
|---|---|
| Category | Sharing |
| Affected personas | P1, P3, P8 |
| Journey | J09, J11 |
| Device | Real-device validation needed |
| Severity | P2 |
| Evidence basis | M, H |
| Implementation effort | M |
| Confidence | Medium (hypothesis on platform limit) |

**Evidence.** Harness R2 objects: 120 KB (gradient), 437 KB (designer background), 1,545 KB (stock Eid card); P2 portrait export 2,218 KB. og:image always image/png.

**Steps to reproduce.** Publish a card with a designer background → paste the link in WhatsApp.

**Expected outcome.** A rich preview with the card image.

**Actual outcome.** Not verifiable here (production and WhatsApp unreachable). Commonly reported WhatsApp preview limits are about 300–600 KB, so large PNGs may show a text-only preview.

**User impact.** Without the image preview, links look like spam and click-through drops.

**Suspected root cause.** Publish uploads the full-resolution PNG; there is no derived preview asset.

**Recommended change.** Keep the PNG for download, but also store a ≤ 1200 px JPEG preview (≤ 250 KB) and point og:image at it. Confirm on real WhatsApp (Android and iOS) and Facebook Sharing Debugger.

**Acceptance criteria (how to verify).** og:image response ≤ 300 KB for all fixtures. A WhatsApp preview shows the image for 5 sample links on a real device.

**Dependencies and regression risks.** functions/api/shares.js accepts PNG only, so it needs an additional optional field; R2 storage cost.

---

## CARD-UX-033

### The focus indicator is faint and helper text is small and grey

| Field | Value |
|---|---|
| Category | Accessibility |
| Affected personas | P8 |
| Journey | J01 |
| Device | Desktop |
| Severity | P3 |
| Evidence basis | M |
| Implementation effort | S |
| Confidence | High |

**Evidence.** logs/resilience.json focusStyle outline 'solid 3px rgba(11,111,194,0.28)'; .wu-share-publish-note 12 px #64776e; .card-studio-help 12.3 px.

**Steps to reproduce.** Tab through the controls.

**Expected outcome.** A clearly visible focus ring (≥ 3:1) and body text ≥ 14 px on key guidance.

**Actual outcome.** A 28%-opacity outline and 12 px notes.

**User impact.** Low-vision and older users lose their place. Key privacy notes are hard to read.

**Suspected root cause.** Design tokens.

**Recommended change.** Use a solid 2–3 px #0b6fc2 (or brand-green) outline with offset; 14 px minimum for help/notes.

**Acceptance criteria (how to verify).** Focus ring contrast ≥ 3:1 against adjacent colours; no guidance text < 14 px on mobile.

**Dependencies and regression risks.** Shared site CSS.

---

## CARD-UX-034

### Two open tabs overwrite each other silently

| Field | Value |
|---|---|
| Category | Reliability |
| Affected personas | P7 |
| Journey | J12 |
| Device | Desktop |
| Severity | P3 |
| Evidence basis | M |
| Implementation effort | S (after 002) |
| Confidence | High |

**Evidence.** logs/resilience.json twoTabs: reopening showed tab 1's last edit; tab 2's work is stored under another id but can never be reopened.

**Steps to reproduce.** Open Card Studio in two tabs and edit both.

**Expected outcome.** Both cards are available (see Recent cards) or a 'this card is open in another tab' notice is shown.

**Actual outcome.** Last write wins; the other card is unreachable.

**User impact.** Low frequency, but invisible loss.

**Suspected root cause.** Only the latest project is loaded.

**Recommended change.** Solved by 'Recent cards' (CARD-UX-002). Optionally a BroadcastChannel notice.

**Acceptance criteria (how to verify).** Both tab projects appear in Recent cards.

**Dependencies and regression risks.** CARD-UX-002.

---

## CARD-UX-035

### Blocked storage throws an uncaught error (the card is still usable)

| Field | Value |
|---|---|
| Category | Reliability |
| Affected personas | P1 |
| Journey | J01 |
| Device | Desktop (private-mode simulation) |
| Severity | P3 |
| Evidence basis | M |
| Implementation effort | S |
| Confidence | Medium (which script not isolated) |

**Evidence.** logs/resilience.json storage.pageErrors ['SecurityError: blocked']; status correctly says the card cannot be saved; download worked.

**Steps to reproduce.** Open with localStorage/sessionStorage throwing (strict privacy settings).

**Expected outcome.** No uncaught errors.

**Actual outcome.** One uncaught SecurityError; the app degrades correctly otherwise.

**User impact.** Low. It could break later-loaded layers in other browsers.

**Suspected root cause.** An unguarded storage access in one of the deferred scripts.

**Recommended change.** Wrap the remaining storage access in try/catch (search for localStorage. without try).

**Acceptance criteria (how to verify).** Zero page errors with storage blocked.

**Dependencies and regression risks.** None.

---

## CARD-UX-036

### Recipient page: Urdu text uses a fallback font, and 'Make your own' goes to a catalogue rather than an editor

| Field | Value |
|---|---|
| Category | Recipient experience |
| Affected personas | Recipients of P1/P3/P8 |
| Journey | J10 |
| Device | 393×852, 1440×900 |
| Severity | P2 |
| Evidence basis | M, H |
| Implementation effort | S–M |
| Confidence | Medium (font fallback on real Android to be confirmed) |

**Evidence.** logs/recipient-Bo6Kjoxr.json: document.fonts loaded = [] (CSP style-src 'self' blocks Google Fonts; no self-hosted Urdu font). J10-recipient-android.jpg shows Naskh-style fallback. 'Make your own' and 'Use these words' both land on /urdu-cards.

**Steps to reproduce.** Open a /s/ link in a fresh browser.

**Expected outcome.** The text block renders in Nastaliq like the card. 'Make your own' opens the editor with a starting design.

**Actual outcome.** System fallback font (on Android likely Naskh). An extra catalogue step before creating.

**User impact.** A slightly less polished first impression, and one more step in the recipient→creator loop.

**Suspected root cause.** The strict CSP on functions/s/[id].js and the choice of /urdu-cards as the CTA target.

**Recommended change.** Self-host a subsetted Noto Nastaliq Urdu WOFF2 under /fonts and reference it from share-page.css (CSP-safe). Test sending 'Make your own' straight to the Gallery with the shared text pre-filled ('see your words on 44 designs').

**Acceptance criteria (how to verify).** On the recipient page document.fonts includes Noto Nastaliq Urdu. A/B or before/after comparison of share_referred_creation_started.

**Dependencies and regression risks.** WU-SHARE-001R/V own the CTA; this is a recommendation for their next iteration.

---

## CARD-UX-037

### The homepage's first card entry is about 5,700 px down on mobile

| Field | Value |
|---|---|
| Category | Discovery |
| Affected personas | P8, P1 |
| Journey | J01 |
| Device | 360×780 |
| Severity | P3 |
| Evidence basis | M |
| Implementation effort | S |
| Confidence | Medium |

**Evidence.** logs/p8.json homeCardEntry: first link to /urdu-card-studio at 5,736 px; /urdu-cards only in the footer (8,510 px). Menu entries exist in the header 'Create' menu.

**Steps to reproduce.** Open / on a phone and look for cards.

**Expected outcome.** One visible 'Make a greeting card' entry within the first two screens.

**Actual outcome.** Reachable only via the menu or far down the page.

**User impact.** Writers who would happily make a card do not discover it. This is limited by the homepage's writing-first contract.

**Suspected root cause.** WU-PLAT-002H homepage hierarchy (editor-first).

**Recommended change.** Not a layout change: make the existing post-writing 'Create Urdu Card' handoff (shown after text exists) more prominent, and add an occasion card (e.g. 'Jumma Mubarak card') to the homepage featured-card slot (WU-CARD-RETENTION-001A).

**Acceptance criteria (how to verify).** Measured: card_studio entries from home per writing session (Product Pulse).

**Dependencies and regression risks.** WU-PLAT-002H §15 governs the homepage.

---

## CARD-UX-038

### 'Back to editor' in Card Studio always goes to the homepage writer

| Field | Value |
|---|---|
| Category | Navigation |
| Affected personas | P4, P8 |
| Journey | J03 |
| Device | All |
| Severity | P3 |
| Evidence basis | S, O |
| Implementation effort | S |
| Confidence | High |

**Evidence.** card-studio.js: [data-card-action='back'] → window.location.href = '/'. On mobile the label is truncated to 'Back t…'.

**Steps to reproduce.** Arrive from /urdu-cards and press 'Back to editor'.

**Expected outcome.** Return to where I came from (the cards catalogue), or no such button.

**Actual outcome.** Goes to the homepage writer and loses context.

**User impact.** Backtracking confusion for users who came from cards.

**Suspected root cause.** Hard-coded destination.

**Recommended change.** Remove it from the toolbar (the format switcher already has 'Back to Urdu Cards') or use the hand-off source route.

**Acceptance criteria (how to verify).** No 'Back to editor' when the entry source is not the writer.

**Dependencies and regression risks.** Hand-off envelope carries the source.

---

## CARD-UX-039

### 'Manage published links' lists raw URLs only, and editing always requires a new link that the UI does not mention up front

| Field | Value |
|---|---|
| Category | Return usage |
| Affected personas | P7, P3 |
| Journey | J12 |
| Device | 393×852 |
| Severity | P3 |
| Evidence basis | M |
| Implementation effort | S |
| Confidence | High |

**Evidence.** P7-manage-published-links.jpg: rows show 'http://…/s/Juxc5hOj · Published 10/11/2026, 10:16:35 AM · Open · Delete'. The success dialog says 'immutable snapshot'.

**Steps to reproduce.** Publish → later open Manage published links.

**Expected outcome.** A thumbnail and the first words of each card; 'Edit a copy' to make a new version.

**Actual outcome.** URLs and timestamps only. 'Immutable snapshot' is technical wording.

**User impact.** Hard to tell which link is which, and users do not know how to update a card they already sent.

**Suspected root cause.** The management store keeps url/token/createdAt only.

**Recommended change.** Store the first 40 characters of text and a small data-URL thumbnail locally. Rename to 'Your published cards'. Add 'Make a new version' (opens the design if CARD-UX-016 is fixed). Replace 'immutable snapshot' with 'This link always shows this version. To change it, publish a new version.'

**Acceptance criteria (how to verify).** Each row shows a thumbnail and text excerpt; deletion still works (verified: page 410, media 404).

**Dependencies and regression risks.** localStorage size: keep thumbnails ≤ 8 KB each, max 40 items.

---
