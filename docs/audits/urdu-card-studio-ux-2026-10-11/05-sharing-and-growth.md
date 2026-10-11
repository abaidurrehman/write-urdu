# 05 — Sharing, Publishing & Growth

Scope: downloading an image (A), publishing a hosted card (B), and sharing to a platform (C), plus the recipient experience. These are tested and reported **separately**. A downloaded PNG is never treated as proof that publishing or social sharing works.

Environment caveat: production and all social platforms were unreachable, and no real accounts were used (by rule). Publishing was exercised against the repository's **real** share functions in a local harness. Platform previews (WhatsApp/Facebook) are **not verified** and are listed as hypotheses.

## 1. What exists today (verified)

| Capability | Where | Verified result |
|---|---|---|
| A. Download PNG | Card Studio toolbar + Export step; makers; `/urdu-cards` "Share image" fallback | Works on every device tested. 1080×1080 / 1080×1350 / 1080×1920 / 1280×720 at exact preset size. Sizes 74 KB – 2.2 MB. |
| A′. "Share image only" (Web Share files) | Card Studio, makers | Falls back to **download** when `navigator.share` is missing (all emulated contexts here). Native sheet needs **real-device** confirmation. |
| B. Publish & Share | Card Studio only (not the Instagram/WhatsApp makers, not the `/urdu-cards` personaliser) | One-time confirmation dialog; publish in ~0.25 s locally; short `/s/<id>` URL; Copy link; Open public page; Share link; Delete. |
| B′. Curated "Shareable link" | Each `/urdu-cards` tile | **Publishes immediately on every tap, no consent dialog, management token discarded** (CARD-UX-012). |
| B″. Delete | Success dialog and "Manage published links" | Works: `/s/<id>` → **410**, `/share-media/<id>` → **404**. |
| C. Social | No direct WhatsApp/Facebook intents in any card flow | Native share sheet or Copy link only (CARD-UX-014). |
| Recipient page `/s/<id>` | Server-rendered, strict CSP, `noindex, follow` | Image first, Share / Download PNG / Copy Urdu, readable Urdu text, "Like this card? → Make your own Urdu card — free, no account", "Use these words", "Edit this design" (gradient/solid designs only), Report, Privacy, Contact. |

## 2. Publishing — evaluation

| Question | Answer | Evidence |
|---|---|---|
| Can users find Publish & Share? | Desktop yes (green "Publish & Share · LINK" in the toolbar). Mobile: it is in the 3rd column of a truncated toolbar near the top, then again in the Export step. | first-impression shots |
| Is it distinct from downloading? | Visually yes. Conceptually only partly: "Share image only" and "Share link" both say *Share*. | P3 shots |
| Does the user know the content becomes public? | **Yes in Card Studio**: the dialog states "Public to anyone with the link", what is uploaded, unlisted + noindex, and "Do not publish confidential or private writing". **No on `/urdu-cards`** "Shareable link". | `P3-publish-confirmation.jpg`, CARD-UX-012 |
| Contradictory privacy copy? | **Yes**: "Your text and images stay in this browser and are not uploaded" is shown as the default status and next to the upload control. | CARD-UX-015 |
| Link generated reliably? | Yes in 4/4 harness publishes. Rate limit 10 per 10 min per IP (in-memory per isolate). | harness log |
| Copy / reopen? | Copy link works; Open public page works; Manage list shows URL + time. | `P7-manage-published-links.jpg` |
| What happens after publishing? | A success dialog. Then nothing guides the next step (e.g. "Send on WhatsApp", "Make another"). | `P3-publish-success.jpg` |
| Edit an already published card? | No (immutable by design). The success dialog says "immutable snapshot", which is technical. "Edit this design" exists only for solid/gradient designs. | CARD-UX-016, 039 |
| Mobile rendering of the hosted card | Good: 1.3 s local load; image at the top; actions in the first viewport; CTA visible at 684 px on 852. | `J10-recipient-android.jpg` |
| Privacy implementation | Manage token is hashed server-side (SHA-256) and kept only in localStorage; public payload is limited to text, attribution and image; the remix sanitiser rejects uploaded-photo backgrounds; strict CSP; `x-robots-tag: noindex`. | `functions/_lib/share-*.js` |

## 3. WhatsApp

| Path | Status | Notes |
|---|---|---|
| Send the **image** in chat or Status | Works via download plus manual attach. Native share sheet: **real-device check needed**. | Filename `Untitled card-….png` is hard to find in Downloads (CARD-UX-030). |
| Send a **hosted link** in chat | Link creation works. A direct WhatsApp button is missing when there is no share sheet (desktop). | CARD-UX-014 |
| Link preview | **Not verified.** og:image is a full-size PNG (120 KB – 1.5 MB in tests). WhatsApp is widely reported to drop images above roughly 300–600 KB, which would leave a text-only preview. | CARD-UX-032 (hypothesis) |
| Status format | 1080×1920 export works. The default text triggers the maker's own safe-area warning. | `J07-whatsapp-status.jpg` |

**Distinction problem (expert):** Pakistani WhatsApp habits favour forwarding **images**. A link is better for "see more / make your own" but worse for forwarding chains and offline viewing. The product should say this in one line at the decision point, for example: *"Picture — best for family groups and Status · Link — opens a page where they can make their own"*.

## 4. Facebook

- A public link with `og:title` = the Urdu text excerpt, `og:description`, a `summary_large_image` twitter card, `og:image` with width/height and `og:locale ur_PK`. The metadata structure is correct (`logs/recipient-*.json`).
- **Not verified:** Facebook Sharing Debugger rendering and image size acceptance (Facebook accepts up to 8 MB, so this is lower risk than WhatsApp).
- No direct "Share to Facebook" button; Copy link only on desktop (CARD-UX-014).
- `?role=facebook` 1200×630 mode exists and correctly says "Write Urdu does not post to Facebook. Download the image and upload it manually".

## 5. Instagram

- No direct posting (correct; no integration should be added). The Instagram maker clearly says "Design here, post from your account… WriteUrdu does not connect to Instagram".
- **But** the Card Studio export copy says Publish & Share is a link "you can post straight to WhatsApp, Instagram or Facebook". Instagram posts do not show link previews, so this is misleading (CARD-UX-015).
- Sizes: square 1080×1080, portrait 1080×1350 and story 1080×1920 exist; a safe-area guide exists on the makers. **Copy caption text** exists on the makers only.
- Missing on the Instagram maker: author field and Publish (CARD-UX-017).

## 6. Recipient experience (J10)

**Works well; keep it:** light, fast page; image first; readable Urdu text block; three clear media actions; an honest "public snapshot" note; a non-intrusive single "Make your own" CTA with Urdu headline; report flow; no forced sign-up; `noindex`.

Gaps:
1. The Urdu text block uses a **fallback font** because the CSP blocks Google Fonts and there is no self-hosted Nastaliq (CARD-UX-036; real-Android confirmation needed).
2. "Make your own" and "Use these words" go to `/urdu-cards` (catalogue). This adds a decision before creating. Test the Gallery with the text pre-filled instead.
3. On curated shares the attribution line shows a **design name** ("— Eid Emerald · Write Urdu Card") as if it were the author (CARD-UX-012).
4. "Edit this design" is missing for designer-background cards, which are the most attractive ones (CARD-UX-016).
5. Provenance is subtle and appropriate: a small Write-Urdu.com mark plus the header brand. **Do not** add a larger watermark.

## 7. Growth opportunities (each tied to a need and evidence)

| # | Opportunity | User need / evidence | Guardrail |
|---|---|---|---|
| G1 | **One "Send" sheet** after Download/Publish: *Picture (WhatsApp/Status/Instagram)* · *Link (WhatsApp/Facebook/Copy)* with a one-line explanation | P1/P8 confusion between "Share image only" and "Share link"; desktop has no share sheet | No auto-posting, no account linking |
| G2 | **Lightweight og:image** (≤ 250 KB JPEG) | Link previews are the main reason to publish; large PNGs risk no preview | Keep the full PNG for Download |
| G3 | **Recent cards on this device** | Returning users lose work (CARD-UX-002); no return cue on `/urdu-cards` | Local-only; explain "only on this device" |
| G4 | **"Edit this design" for designer backgrounds** | Creator iteration and recipient remix (CARD-UX-016) | Never include user photos |
| G5 | **Occasion-first discovery**: Birthday, Eid (two Eids), Jumma, Ramzan, results, nikah; seasonal ordering of chips | P4 had no birthday option; only 4 Eid cards | Content quality > quantity |
| G6 | **Recipient → Gallery with text pre-filled** ("See these words on 44 designs") | Fewer decisions than the catalogue | Keep a single CTA; no pop-ups |
| G7 | **Consistent consent for every public link** (curated cards included) | CARD-UX-012 | Same dialog/ack key as Card Studio |
| G8 | **Daily greeting** surfacing via the existing home featured-card slot (Jumma on Fridays, صبح بخیر in the morning) | P1/P8 daily habits; WU-CARD-RETENTION-001A already exists | No notifications or push |

**Not recommended:** mandatory sign-up to share, larger or forced watermarks, pop-up interstitials on the recipient page, "share to unlock", automatic posting to social accounts, public galleries of users' cards (out of scope of WU-SHARE-001 v1).

## 8. Measurement to add before and after changes

Already instrumented (share-loop-telemetry): `share_publish_started/completed/failed`, `share_clicked`, `share_completed`, `share_referred_creation_started`, `share_referred_meaningful_start`, `share_republish_completed`. Suggested additions (content-free, per the WU-PLAT-002H metrics contract): `card_export_refused{reason}` (for CARD-UX-004), `card_handoff_overwrote_project` (CARD-UX-002), `share_send_target{picture|link, channel}` (G1), `og_image_bytes` bucket at publish (CARD-UX-032).
