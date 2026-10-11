# 01 — Executive Summary · Write-Urdu Card Studio UX Field Study

**Date:** 2026-10-11 · **Build:** local `main` @ `7a14bde` · **Method:** 8 synthetic personas, 12 journeys, 5 viewports, scripted real-browser interaction (Chromium) with screenshots and JSON traces, plus source confirmation of root causes. Publishing used the repo's real share functions in a local harness.
**Important limits:** production `write-urdu.com` and Google Input Tools were **blocked by the test environment's network policy**, there was only one browser engine (Chromium), and there was no native share sheet or social app. Personas are simulations, not research participants. See `07-test-coverage.md`.

Documents: [02 journeys](02-persona-journeys.md) · [03 findings](03-ux-findings.md) ([CSV](ux-findings.csv)) · [04 backlog](04-prioritized-backlog.md) · [05 sharing & growth](05-sharing-and-growth.md) · [06 simplification](06-design-simplification.md) · [07 coverage](07-test-coverage.md) · [evidence/](evidence/)

## Overall product experience

Write-Urdu can produce **genuinely attractive Urdu cards**: the 44 designer backgrounds, Nastaliq rendering, poetry defaults and the recipient page are strong. **Ready-made and gallery entry points** (`/urdu-cards` → Make it mine, `/urdu-card-gallery` → type once, see 44 designs) are the simplest, most successful routes.

The **blank Card Studio** is where ordinary users struggle. On phones the text box is 2–4 screens down, behind 87 visible controls. Several actions **fail silently**, the output can be **wrong** (reversed phone numbers) or **weak** (unreadable poet names, double frames), and opening a ready-made card **silently destroys the previous saved card**. Publishing is well designed and honest in Card Studio but **inconsistent elsewhere**.

**Central question:** *Can an ordinary person in Pakistan create and share a beautiful Urdu card without help?*
**Yes, via `/urdu-cards` or the Gallery, with friction. Not reliably via a blank Card Studio on a phone.**

## Most important strengths (keep these)

1. Designer background collection and poetry defaults (auto-Nastaliq, 1.8 line height, couplets kept on two lines).
2. Recipient page `/s/<id>`: fast, image first, readable text, Share/Download/Copy Urdu, one respectful "Make your own" CTA, report, `noindex`.
3. Publish confirmation: explicit "public to anyone with the link", lists what is uploaded, immutable snapshot, delete works (410/404 verified).
4. `/urdu-cards` personaliser and Gallery hand-offs carry text and design into Card Studio.
5. Local-first autosave with automatic restore on direct return; reload restores uploaded photos.
6. On-canvas direct editing (select, drag, handles, double-click edit, context toolbar), with undo for canvas moves.
7. Clear Roman-Urdu outage alert with a "Type Urdu directly" escape.

## Five biggest problems

| # | Problem | Evidence |
|---|---|---|
| 1 | **Mobile: text box 1,800–3,350 px down; step bar doesn't navigate; preview off-screen when choosing designs** | CARD-UX-001/005/009 · `first-impression-card-studio-android-small.jpg`, `P1-after-floral-tap-viewport.jpg` |
| 2 | **Silent failures**: "Use sample text" inserts the placeholder, so Download does nothing; error messages are overwritten by "Saved on this device" | CARD-UX-004 · `logs/p1.json`, `logs/p6.json` |
| 3 | **Saved card silently overwritten** when opening any ready-made card/template in Card Studio; only one project is ever reachable | CARD-UX-002 · `logs/p7.json` |
| 4 | **Wrong output**: `0300-1234567` exports as `1234567-0300`; English punctuation flips | CARD-UX-003 · `P5-phone-number-reversed-crop.jpg` |
| 5 | **Weak results from defaults**: poet/author name illegible on designer art; template frame layered over designer frames; dark text on uploaded photos | CARD-UX-006/007/020 · `P2-attribution-crop.jpg`, `P1-downloaded-card.jpg` |

## Biggest task-completion blockers

- J02 (sample text → result): **blocked by product**.
- P5 announcement: **blocked by product**. The image is produced, but the phone number is wrong.
- P7 return after another entry point: **blocked by product**. The previous design is unrecoverable.
- WhatsApp/Facebook/Instagram app hand-off and native share sheet: **blocked by test environment**. Needs a real device.

## Mobile experience

Usable but discouraging. **87 visible controls** (Quick mode); toolbar labels truncated at 360 px ("Brows…", "Downl…"); ~30 px horizontal overflow at 360 px; no sticky preview; ready-made tiles have **9.4 px** button labels and 8 actions. The **personaliser** and **Gallery** work well on phones. Slow-3G emulation: about 22 s before the editor is usable (local, relative).

## Sharing / publishing

Three outcomes exist and were tested separately:
- **Download:** always works.
- **Publish:** works and is privacy-sound in Card Studio. Only in Card Studio, though: there is no link from the makers or the personaliser.
- **Social share:** the native sheet, or else copy only; there are **no WhatsApp/Facebook buttons**.

Problems:
- The curated **"Shareable link" publishes silently on every tap**, with no consent, no delete, and a design name shown as the author (CARD-UX-012).
- The privacy copy says "not uploaded" next to Publish (CARD-UX-015).
- og:images up to **1.5 MB** may lose WhatsApp previews (hypothesis, CARD-UX-032).

## Highest-value improvement opportunities (first slice, details in 04)

1. **BL-01** bidi-safe numbers/Latin in canvas text (S).
2. **BL-02** truthful feedback: real sample text, persistent errors, separate save indicator, fixed labels/privacy copy (S).
3. **BL-03** never overwrite a saved card + "Recent cards on this device" (M).
4. **BL-04** legible attribution and clean designer backgrounds (S–M).
5. **BL-05** mobile reachability fixes without a redesign: step bar scrolls, library out of the Content step, no overflow, skip link (S).

---

## Final evaluation

| # | Question | Evidence-backed answer |
|---|---|---|
| 1 | Can a complete beginner create their first attractive Urdu card? | **Yes from `/urdu-cards` or the Gallery** (P4, P8, J04 completed). **From blank Card Studio, with friction and sometimes a weak result**: a sample-text dead end (J02), double frames, an unreadable credit. |
| 2 | Is the current editor too complicated? | **Its presentation is**: 87 visible controls, 9 top actions, 5 overlapping vocabularies. The underlying feature set is reasonable. Simplify placement and defaults; do not cut capabilities (06). |
| 3 | Is Quick mode genuinely simple? | **No.** It hides only 5 fine-tuning blocks; the toolbar, switcher, 44-tile library and explainers remain. It also hides the one control beginners need after uploading (text readability). |
| 4 | Are templates and backgrounds easy to discover? | **Backgrounds are very discoverable (too much so)**: they appear before the text box. "Template" vs "background" vs "design" is confusing, and a template change wipes a photo. Birthday is missing; Eid has 4 cards. |
| 5 | Does mobile editing work well? | **Functionally yes, ergonomically no**: the preview is off-screen while editing, the step bar doesn't navigate, 360 px overflows, labels are truncated. On-canvas editing works with touch. Keyboard overlap is untested (needs a real device). |
| 6 | Does Urdu typing feel reliable and intuitive? | **Direct Urdu: yes. Roman Urdu: depends on Google**, which was unreachable here. The outage alert is good, but the status line contradicts it, the convert prompt is off-screen, and individual words cannot be corrected. |
| 7 | Is sharing obvious? | **Partly.** Download is obvious. "Share image only" vs "Publish & Share" vs "Share link" describes mechanisms, not outcomes, and there are no WhatsApp/Facebook buttons when the share sheet is absent. |
| 8 | Is publishing a link understandable and safe? | **In Card Studio: yes** (clear consent, snapshot, delete, hashed token, noindex, no photos in the remix payload). **On `/urdu-cards`: no** (silent publish, no delete, misleading credit). Privacy copy contradicts publishing. |
| 9 | Can users share correctly to WhatsApp, Facebook and Instagram? | **Image → all three: yes, manually.** **Link → WhatsApp/Facebook: link creation works; previews unverified** and large og:images are a risk. Instagram correctly requires manual upload, but the copy wrongly promises "post straight to Instagram". |
| 10 | Does the public card page encourage organic discovery? | **Yes, respectfully**: one Urdu-led CTA, "Use these words", provenance mark, no pop-ups. It could convert better by opening the Gallery with the text pre-filled, offering "Edit this design" for designer cards, and self-hosting Nastaliq. |
| 11 | Can returning users reuse their previous work? | **Only if they come straight back to Card Studio and nothing else intervened.** Any hand-off overwrites the card. There is no list of recent cards, and there is no "Edit this design" for designer-background cards. Local-only storage is stated ("Saved on this device") but not explained (other phones/cleared browser). |
| 12 | What should we improve before adding more features? | The first slice above: correctness (bidi), truthfulness (feedback/copy), safety of local work (no overwrite + recent cards), default quality (attribution/frames), and mobile reachability. Then consistent publishing on `/urdu-cards`, a Send sheet, and a lighter og:image. **No new tools, formats or acquisition pages are needed.** |

**What should remain unchanged:** see `06-design-simplification.md` §6 — recipient page, publish consent dialog, local-first autosave, personaliser and Gallery concepts, on-canvas editing, poetry defaults, background art quality, outage alert copy.
