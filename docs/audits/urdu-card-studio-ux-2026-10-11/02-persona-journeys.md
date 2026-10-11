# 02 — Persona Journeys

Eight synthetic personas, each run in a **fresh, isolated Chromium browser context** (no shared storage) against a local build of `main` at `7a14bde`. Publishing used the repository's **real** Cloudflare Pages Functions (`functions/api/shares*.js`, `functions/s/[id].js`, `functions/share-media/[id].js`) run in Node with a SQLite-backed D1 shim and an in-memory R2 shim (`evidence/harness/harness-server.mjs`). Production `write-urdu.com` and Google Input Tools were **not reachable** from the test environment (see `07-test-coverage.md`).

**How to read this document**

- **Observed trace** = what the scripted browser actually did and measured (`evidence/logs/<persona>.json`).
- **Predicted behaviour** = expert prediction of how a real person with this profile would react. These are marked *(prediction)* and must be validated with real users.
- No quotations are attributed to participants. These are not research participants.
- Scripts used the visible UI. They were not given hidden routes, except where noted (`scrollIntoView` stands in for human scrolling, and the distance scrolled is recorded).
- Elapsed times are **automation times**, not human task times, and are not reported as human measurements.

Outcome states: Completed · Completed with friction · Blocked by product · Blocked by test environment · Abandoned in simulation · Not tested.

---

## Persona 1 — Everyday WhatsApp user (45–55, Android)

**Goal:** a beautiful "صبح بخیر" greeting with a floral background, sent to relatives on WhatsApp.
**Start:** `/urdu-card-studio`, Android 393×852, no instructions.
**Reasonable expectation:** see a card, tap on it or a text box to write, pick a pretty background, press a green "Send/WhatsApp" button.

| # | Step (observed trace) | Screen / state | Evidence |
|---|---|---|---|
| 1 | Page loads (3.4 s locally). First screen: format switcher (Card Studio / WhatsApp Status / Instagram Post), H1, a 3-column toolbar with truncated labels. No text box or preview in view. | first viewport | `first-impression-card-studio-android.jpg` |
| 2 | Taps **"1 Content"** in the bottom bar, expecting to reach the text. The page does not move (scrollY 0); the text box is still 2,208 px below. | no visible change | `P1-after-tap-content-stepbar.jpg` |
| 3 | Scrolls 1,812 px, past the preview and a 44-tile "Urdu background collection", to the text box. It already contains `یہاں اپنا اردو متن لکھیں۔` as real text, not a placeholder. | Content panel | `P1-text-field-reached.jpg` |
| 4 | Looking for ready-made words, taps **Use sample text**. The text box keeps the same placeholder sentence. | — | `logs/p1.json` |
| 5 | Taps **Download PNG**. **Nothing downloads.** The status line says "Saved on this device" (the refusal message was overwritten by autosave). | silent failure | `P1-download-sample-text-feedback.jpg`, CARD-UX-004 |
| 6 | Types Roman `subah bakhair` (her habit). The provider is unreachable here, so the alert says "Urdu conversion is not responding… Type Urdu directly", while the status line under the field says "Roman Urdu input is ready". | contradictory status | `P1-roman-typing-provider-unreachable.jpg`, CARD-UX-022 |
| 7 | Switches to **Type Urdu directly** and types `صبح بخیر` / `اللہ آپ کا دن خوشیوں سے بھر دے` (keyboard input simulated). | — | — |
| 8 | Looks for "flowers". The chips are All, Classic, Pakistan, Truck Art, Poetry, Nature, Modern, Wedding, Luxury, Love; no "Floral". Finds **Vintage Floral** under All/Nature (tiles are 132×435 px). Taps it. The preview is **completely off-screen above** (viewport top −367, bottom −24). | no visible feedback | `P1-after-floral-tap-viewport.jpg`, CARD-UX-005 |
| 9 | Scrolls up and sees the card: Nastaliq, centred, floral frame. A template rectangle and orange bar are drawn over the floral art's own frame. | preview | `P1-floral-preview.jpg`, CARD-UX-007 |
| 10 | **Download PNG** → `Untitled card-2026-10-11.png`, 1080×1080, 214 KB. The confirmation ("PNG downloaded. Want a link to share too?") appears in the side panel, outside the viewport. | file saved | `P1-downloaded-card.jpg` |
| 11 | **Share image only** → Web Share API unavailable in this Chromium → PNG downloaded again with "Sharing is not supported here." | — | `logs/p1.json` |

**Outcome:** Image creation **Completed with friction**. Sending to WhatsApp: **Blocked by test environment** (Android share sheet not available in emulation; needs real-device confirmation).
**Errors / confusion:** 1 silent failure, 1 contradictory status, 2 "nothing happened" moments (step bar, background tap), 1 accidental duplicate download.
**Unnecessary decisions before typing:** format switcher, use case, Quick/Advanced, 44 backgrounds.
**Link vs image (prediction):** She will not understand that "Share image only" sends a file while "Publish & Share" sends a link. The labels describe the mechanism, not the result she wants ("Send picture on WhatsApp").
**Would make it significantly easier:** text box first with a real sample greeting (CARD-UX-001/004), sticky preview (CARD-UX-005), one "Send" action with "Picture" / "Link" explained in one line (05-sharing).

---

## Persona 2 — Poetry enthusiast (22, phone)

**Goal:** an elegant Nastaliq card with Faiz's couplet and the poet's name for Facebook/Instagram.
**Start:** `/urdu-instagram-post-maker` (the page she would find by searching), iPhone 390×844.

| # | Step (observed trace) | Evidence |
|---|---|---|
| 1 | Instagram maker opens: default text `اپنی بات خوب صورت انداز میں شیئر کریں۔`, **Naskh**, square. Text box at 1,360 px, preview at 2,329 px. | `P2-instagram-maker-first-viewport.jpg` |
| 2 | Types the couplet on two lines. Looks for a poet-name field: **none visible** (`#cardAttribution` is in a hidden engine block). No Publish & Share on this page. | `logs/p2.json`, CARD-UX-017 |
| 3 | Downloads: right-aligned Naskh on white with an accent bar, 1080×1080, 74 KB. Plain. | `P2-instagram-maker-download.jpg` |
| 4 | Follows the page's own link "Open the full Urdu Card Studio". **The couplet is not carried over**; the studio shows its placeholder. | `logs/p2.json` |
| 5 | Re-types the couplet and the poet name `فیض احمد فیض`. The name does **not** appear until she finds and ticks "Show author or source". | CARD-UX-006 |
| 6 | Font control is not on the Content step. Tapping **Style** scrolls to it (font list: Noto Nastaliq Urdu, Noto Naskh Arabic, Amiri, Lateef, Scheherazade New, Tajawal). | `P2-style-step.jpg` |
| 7 | Filters **Poetry** (5 backgrounds), picks *Ink Wash Poetry*. Font switches to Nastaliq automatically, line height 1.8, the two misras stay as two lines. | `P2-poetry-preview.jpg` |
| 8 | Format → Portrait (1080×1350). Export → **2.2 MB PNG**. | `P2-instagram-poetry.jpg` |
| 9 | Inspects the result: the couplet is well set, but the **poet name is ~27 px grey-blue Naskh on a dark brushstroke and practically invisible**; a template frame and bar overlap the watercolour. | `P2-attribution-crop.jpg`, CARD-UX-006/007 |

**Outcome:** **Completed with friction**. The result is shareable but has a visible quality defect, the credit line. Instagram upload: **Not tested** (no external accounts, by rule).
**RTL/line breaks:** preserved (two written lines kept; WU-UXR-001 D1 fix confirmed). The misras are not equal-width (a classical convention), which is acceptable for social posts.
**Would make it significantly easier:** author field everywhere with auto-enable and legible colour (CARD-UX-006), designer background without template overlays (CARD-UX-007), text carried across maker links (CARD-UX-017).

---

## Persona 3 — Roman Urdu beginner (young, small Android)

**Goal:** type "Aap sab ko Jumma Mubarak. Allah aap ko hamesha khush rakhe." in Roman, convert, pick a design, publish a link.
**Start:** `/urdu-card-studio`, 360×780.

**Run A — real environment (the provider is unreachable, which is exactly what users see in an outage):**

| # | Step | Evidence |
|---|---|---|
| 1 | Default input mode is already **English letters → Urdu** (good). Types `Aap sab ko ` word by word → stays Latin. The alert appears correctly with **Type Urdu directly**, but the status under the field still says "ready". | `P3-outage-word-by-word.jpg` |
| 2 | Pastes the full sentence. The "Long Urdu text written with English letters detected. Convert this passage?" prompt appears, but **above the field, off-screen** (button at viewport −114 px). | CARD-UX-022 |
| 3 | After scrolling up, taps Convert → "The passage could not be converted. Check your connection and try again." Text unchanged. | `P3-outage-passage-convert.jpg` |

Outcome A: **Blocked by test environment** for conversion. The failure UX itself was observed for real.

**Run B — clearly labelled STUB.** A Playwright route returned a fixed word map for `inputtools.google.com`. This tests only the UI around conversion, **not** transliteration quality:

| # | Step | Evidence |
|---|---|---|
| 4 | `[STUB]` Convert passage + "Happy Friday!" → `آپ سب کو جمعہ مبارک۔ اللہ آپ کو ہمیشہ خوش رکھے۔ Happy Friday!`. No way to tap a single word and pick an alternative. | `P3-stub-converted-preview.jpg` |
| 5 | Format → **Greeting / Announcement** → becomes **1280×720 landscape**, Botanical Frame. On 360 px the artboard is cut off on the right; the in-card text shows **"! Happy Friday"** (bidi). | `P3-announcement-usecase-preview.jpg`, CARD-UX-024/026/003 |
| 6 | **Publish & Share** → confirmation dialog ("Publish this card as a public link?… Public to anyone with the link… Do not publish confidential or private writing…") → **Publish & get link** → link in 255 ms (local). | `P3-publish-confirmation.jpg`, `P3-publish-success.jpg` |
| 7 | **Share link** → no Web Share → "Public link copied." Clipboard holds the `/s/` URL. | `logs/p3.json` |

**Outcome:** Publishing **Completed** (harness). Conversion success path **Blocked by test environment**; stub run **Completed with friction**.
**Would make it significantly easier:** one truthful status and the convert button under the field (CARD-UX-022), a square/portrait greeting default (CARD-UX-026), bidi isolation (CARD-UX-003), WhatsApp/Facebook buttons when no share sheet exists (CARD-UX-014).

---

## Persona 4 — Ready-made design user (office worker, ≤ 2 minutes)

**Goal:** a birthday/congratulations card with the recipient's name, shared quickly.
**Start:** `/urdu-cards`, Android 393×852.

| # | Step | Evidence |
|---|---|---|
| 1 | First screen: "How do you want to start?" with **Find a ready-made message** / **Use my own words**. This is a clear fork. | `P4-urdu-cards-first-viewport.jpg` |
| 2 | Scans 17 filter chips for Birthday. **None exists** (157 cards, none for birthdays). | CARD-UX-011 |
| 3 | Picks **Congratulations** (4 cards). Each tile shows **8 actions**: ♡, Share image, Make it mine, Card, WhatsApp Status, Instagram Post, WhatsApp Status (again), Shareable link. Labels wrap; "WhatsAp" is truncated. | `P4-card-actions.jpg`, CARD-UX-010 |
| 4 | **Make it mine** → dialog "Make this card yours" with the text prefilled, an input-mode toggle and a live preview. | `P4-personalizer.jpg` |
| 5 | Prepends `احمد بھائی، `. The preview updates. | `P4-personalized-with-name.jpg` |
| 6 | Actions offered: **Share this image** / **More editing in Card Studio**. No link option. **Share this image** → PNG downloaded (no Web Share). | CARD-UX-013 |
| 7 | **More editing in Card Studio** → Card Studio opens with the personalised text **and** the background (hand-off works). | `P4-opened-in-card-studio.jpg` |

**Outcome:** **Completed with friction** (wrong occasion; image only, no link from the fast path). Advanced mode was **not** needed. Choices before sharing: category (1) + card (1) + action among 8 (1) + edit + share = 5 decisions.
**Would make it significantly easier:** Birthday category, a single "Send" sheet per card, and "Get link" in the personaliser.

---

## Persona 5 — Shop owner / community organiser (desktop)

**Goal:** a polished announcement with heading, body, date, place and phone number.
**Start:** `/urdu-card-studio`, desktop 1440×900.

| # | Step | Evidence |
|---|---|---|
| 1 | Format → **Greeting / Announcement** (landscape, Botanical Frame). | — |
| 2 | Content: only **one text box** plus **Author or source**. Types 5 lines: `اعلانِ عام` / meeting / `بروز اتوار، 19 اکتوبر 2026، شام 5 بجے` / venue / `رابطہ: 0300-1234567`. Uses the author field for `منجانب: محلہ کمیٹی` (a workaround: the field is semantically "author"). | `logs/p5.json` |
| 3 | Preview: heading the same size as the body; the text block touches the top accent bar and flower; the "author" line overlaps the leaf art. | `P5-announcement-preview.jpg` |
| 4 | Export: **phone number printed as `1234567-0300`**. | `P5-phone-number-reversed-crop.jpg`, CARD-UX-003 |
| 5 | Switches to Square for WhatsApp → re-exported; same reversal. | `P5-announcement-square.jpg` |

**Outcome:** **Blocked by product.** An image was produced, but it contains a wrong contact number that the organiser may not notice. A real organiser would publish a misleading notice.
**Trustworthiness (prediction):** flat hierarchy and crowded edges make it look home-made. The editor does not support structured fields (date/contact) and does not need many; an "emphasise first line" option plus bidi-safe numbers would cover most needs.

---

## Persona 6 — Advanced creative user (Canva user, desktop)

**Goal:** a branded square post with a personal photo, specific typography and precise placement.
**Start:** `/urdu-card-studio`, desktop 1440×900.

| # | Step | Evidence |
|---|---|---|
| 1 | Left panel is an internal scroller (2,105 px content in a 772 px box). The background collection is first, and the text box is at 2,155 px. | `logs/p6.json`, CARD-UX-025 |
| 2 | Types the headline → **Undo stays disabled**. | CARD-UX-018 |
| 3 | Style (Quick): Font, Auto-fit, Font size, Alignment, Vertical, Background type/colour, Watermark. Chooses **Uploaded image**. The button under the upload reads **"Background image removed."** | `P6-text-dragged.jpg`, CARD-UX-021 |
| 4 | Uploads a broken `.png` → the error is replaced by "Saved on this device". Uploads a real JPG → works. Dark text on the dark photo; overlay only in Advanced. | CARD-UX-004/020 |
| 5 | **Advanced mode** reveals 5 blocks (line height, colour/shadow, Layout X/Y/width, image fit/overlay/position, watermark position). Overlay set to 45%. | — |
| 6 | Clicks the text on canvas → selection box, handles and a context toolbar (Edit, ←, ↔, →, ⌖). Drags up 150 px → moves (y 0.089 → 0, partly outside the card). **Undo** → back; **Redo** → forward. | `P6-text-selected.jpg`, `P6-text-dragged.jpg` |
| 7 | Double-click → on-canvas text editor opens. | `P6-canvas-edit-mode.jpg` |
| 8 | Changes template to *Midnight* → **photo replaced by a gradient, font switched to Naskh**. Undo restores. | `P6-after-template-change.jpg`, CARD-UX-019 |
| 9 | Uploads a 6000×4500 JPG → fine. Export 1080×1080 PNG 502 KB. Reload → project and photo restored from IndexedDB. | `P6-photo-export.jpg`, `P6-after-reload.jpg` |

**Outcome:** **Completed with friction.**
**Missing vs. expectations (expert, not a mandate):** multiple text objects / heading, logo placement, brand colour presets, snapping guides beyond centre, export at 2×. Of these, only "emphasise first line" (CARD-UX-027) is justified by the core personas. Canva parity is **not** recommended.

---

## Persona 7 — Returning user (a week later)

**Goal:** find last week's card, change the text, share a new version.
**Setup:** persistent Chromium profile, Android 393×852.

| # | Step | Evidence |
|---|---|---|
| 1 | Week 0: makes `[TEST] پچھلے ہفتے کا کارڈ…` on *Emerald Mughal* and publishes (link created). | `logs/p7.json` |
| 2 | Week 1, opens Card Studio directly: **the card is restored automatically**. "Manage published links" is visible and lists the link (URL + timestamp only). | `P7-return-first-viewport.jpg`, `P7-manage-published-links.jpg` |
| 3 | /urdu-cards shows **no "continue" or "recent" cue**. | — |
| 4 | Opens a different ready-made card → More editing in Card Studio → edits. | — |
| 5 | Reopens Card Studio: **the week-0 card is gone** (same id overwritten). IndexedDB holds a single project. | CARD-UX-002 |
| 6 | Opens their own published link: **no "Edit this design"** (designer backgrounds are excluded from remix). Only "Use these words". | `P7-own-published-page.jpg`, CARD-UX-016 |
| 7 | **Reset** → browser `confirm()` → accepted → card cleared. **Undo disabled.** | CARD-UX-018 |
| 8 | Deletes the published link from Manage → page returns **410**, media **404**. | `logs/` (del run) |

**Outcome:** Direct return **Completed**. Return after any other entry point: **Blocked by product** (previous design irrecoverable). Cross-device: **not supported by design** (local-only). The UI says "Saved on this device", but nothing explains that another phone or a cleared browser will not have it.

---

## Persona 8 — Older, less technical user (~60)

**Goal:** a simple Eid greeting from an existing design.
**Start:** homepage `/`, then `/urdu-cards`, 360×780.

| # | Step | Evidence |
|---|---|---|
| 1 | Homepage: first card link 5,736 px down; /urdu-cards only in the footer (8,510 px). *(prediction: without the menu she would not find cards from here.)* | `P8-home-first-viewport.jpg`, CARD-UX-037 |
| 2 | /urdu-cards → **Eid Greeting** (4 cards). Tiles 165 px wide; format buttons with **9.4 px** labels, 38×38 targets. | `P8-eid-card.jpg`, CARD-UX-010 |
| 3 | **Make it mine** → dialog fills the screen; **Share** button is below the fold (top 853 px on a 780 px screen). | `P8-eid-personalizer.jpg` |
| 4 | Adds `آپ کا بھائی، سلیم` → **Share this image** → `write-urdu-eid-1.png`, 777 KB. | `P8-eid-personalized.jpg` |
| 5 | Tries **Shareable link** on the tile → link copied instantly, **no explanation that a public page was created**, and the page credits "— Eid Emerald · Write Urdu Card". | `P8-stock-shareable-link.jpg`, CARD-UX-012 |

**Outcome:** **Completed with friction.** The simple path exists (/urdu-cards → Make it mine → Share image) and avoids Card Studio's complexity entirely. *(prediction: tiny bilingual labels and below-fold share are the likely abandonment points.)*

---

## Journey coverage matrix (J01–J12)

| Journey | Persona(s) | Device | Outcome | Main evidence |
|---|---|---|---|---|
| J01 Create from empty Card Studio | P1, P3, P5, P6 | 393, 360, 1440 | Completed with friction | `logs/p1.json`, `p5.json`, `p6.json` |
| J02 Sample text → attractive result | P1 | 393 | **Blocked by product** (sample text is the empty placeholder) | CARD-UX-004 |
| J03 Start from a ready-made design | P4, P8, P7 | 393, 360 | Completed with friction | `logs/p4.json`, `p8.json` |
| J04 Compare designs in the Gallery | (P1 profile) | 393 | **Completed** — typed once, 44 designs showed the text, "Use this design" carried text + background into Card Studio | `J04-gallery-with-text.jpg`, `logs/j04j07.json` |
| J05 Roman Urdu → Urdu | P3 | 360 | Blocked by test environment (provider unreachable); stub UI run completed with friction | `logs/p3.json` |
| J06 Upload background + refine | P6 | 1440 | Completed with friction | `logs/p6.json` |
| J07 WhatsApp Status image | P1 profile | 360 | Completed with friction (1080×1920, 1.56 MB; default triggers its own safe-area warning; preview 800 px below the field) | `J07-whatsapp-status.jpg` |
| J08 Instagram post image | P2 | 390 | Completed with friction | `logs/p2.json` |
| J09 Publish a link | P3, P7, P8 | 360, 393 | Completed (harness); curated-card path publishes without consent | `logs/p3.json`, `p8.json` |
| J10 Open link as recipient | Fresh context | 393, 1440 | **Completed** (1.3 s local; image, text, Share/Download/Copy Urdu, "Make your own", Report) | `J10-recipient-android.jpg` |
| J11 Share to social | P1, P3 | 393, 360 | Blocked by test environment for the native share sheet / WhatsApp / Facebook; copy-link fallback completed | `logs/p3.json` |
| J12 Return and reuse | P7 | 393 | Completed (direct); **Blocked by product** after another entry | `logs/p7.json` |
