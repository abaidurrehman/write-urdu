# 06 — Design Simplification Review (Principal UX Director)

**Hypothesis under evaluation:** *Choose design → Add your words → Personalise → Share*.

**Verdict.** The evidence supports this order for the **ready-made / gallery** entry. `/urdu-cards` personaliser and `/urdu-card-gallery` already work this way, and they gave the fastest, least confusing runs (P4, P8, J04). For the **blank Card Studio** entry, *Add your words → Choose design → Share* fits better, because the Gallery shows that people's own text on many designs is the most persuasive "choose" moment. Both orders converge on the same three-stage shell. **No capability needs to be removed**; most of the complexity is *placement and duplication*, not feature count.

Measured baseline (Card Studio, Quick mode): **87 visible interactive controls** in `main` on phones (83 on desktop); **9 top-level actions**; **4 steps + 2 modes + format switcher**; text box **2–4 screens down** on phones.

## 1. Control-by-control review

Legend: **Keep** prominent · **Group** with related · **Advanced** (hide until asked) · **Default** (a better default removes the decision) · **Move** · **Merge/Remove duplicate**.

| Control (current location) | Essential to core job? | Beginner-understandable? | Recommendation |
|---|---|---|---|
| Card text field (Content) | Yes | Yes | **Keep, move first** on every device; directly under the (sticky) preview |
| Input mode toggle "English letters → Urdu / Type Urdu directly" + Speak Urdu | Yes (P3) | Mostly | **Keep**, compact as one segmented control under the field |
| "Two ways to write Urdu" explainer panel | No (duplicates input-mode note) | Wordy | **Merge** into the input-mode hint; show the passage-convert prompt **below** the field only when needed |
| Legacy transliteration status line | No (duplicates alert) | Contradictory | **Remove** when the input-mode alert is active (CARD-UX-022) |
| Use sample text / Clear text | Sample: yes, if it is real | Yes | **Default**: sample = the occasion's top ready-made line; make Clear an ✕ inside the field |
| Author or source + Show checkbox | Yes for poetry | "source" is unclear for greetings | **Keep**; auto-enable when filled; label "Poet / author (optional)" for poetry use case and "From (optional)" for greetings |
| Character count | No | Neutral | **Advanced** (or show only near limits) |
| Use cases (Quote/Poetry, Social, Status/Story, Greeting/Announcement, Facebook) | Yes — best single decision | Yes | **Keep** as the Format step's only first-level choice; split Greeting vs Notice (CARD-UX-026) |
| Output preset select | Covered by use cases | Technical ("preset") | **Advanced**; rename "Exact size" |
| Template grid (9 text styles) | Partly | "Template" vs "background" vs "design" is unclear | **Group** under Style as "Text style"; do not let it replace user photos (CARD-UX-019) |
| Designer background collection (44 tiles, 10 chips) | Yes — the main source of beauty | Yes | **Move** from Content to Style/Format; tiles at 4:5 not 1:3.3 (currently 132×435 px); keep 3 suggestions under the text box |
| Font select (6 families) | Yes for poetry | Names are technical | **Keep**, show 2–3 live Urdu samples ("نستعلیق", "نسخ") instead of family names; others under Advanced |
| Auto-fit checkbox + Font size slider | Size: occasionally | "Auto-fit" is fine | **Default** auto-fit on; show size as A− / A+ buttons; slider in Advanced |
| Alignment, Vertical | Occasionally | Yes | **Keep Alignment** (canvas toolbar already has ← ↔ →; **remove the panel duplicate** from Quick); Vertical → Advanced |
| Line height, Text colour, Shadow | Rarely | Partly | **Advanced** (already); replace colour picker in Quick with an automatic "readable on this background" (CARD-UX-020) |
| Layout X/Y %, width, centre buttons, reset layout | No for beginners | No | **Advanced** (already). Keep on-canvas drag as the primary method |
| Background type select (solid/gradient/uploaded) | Upload: yes | "type" is technical | **Replace** with three tiles: Designs · Colours · My photo |
| Image fit, overlay colour/strength, position | Overlay strength: yes when uploading | Partly | Quick: one "Text readability" slider; rest **Advanced** |
| Watermark toggle + position | No | Yes | **Group** into the Export step ("Show Write-Urdu.com credit"); position in Advanced |
| Undo / Redo | Yes | Yes | **Move** next to the preview; make them cover all edits (CARD-UX-018) |
| Reset | Rarely | Dangerous beside Share | **Move** to ⋯ More, with Undo-able reset |
| Browse templates (→ /urdu-templates) | No | Ambiguous (vs in-page templates) | **Move** to ⋯ More, or remove from the studio |
| Back to editor (→ /) | No | Misleading | **Remove** (format switcher has "Back to Urdu Cards") (CARD-UX-038) |
| Download PNG (×2: toolbar + Export) | Yes | Yes | **Keep** one sticky instance on mobile |
| Share image only (×2) | Yes on Android | Mechanism-named | **Merge** into one "Send" sheet (Picture / Link) |
| Publish & Share (×2) + note + "How public sharing works" + "Manage published links" | Yes | Mostly | **Keep** one primary; collapse the three helper links into the Send sheet footer |
| Submit to Urdu Writers | No for card makers | Unclear here | **Move** to post-publish/post-download suggestion |
| Format switcher (Card Studio / WhatsApp Status / Instagram Post) | Useful | Yes | **Move** into the Format step or a "Change size" chip under the preview |
| Step bar (desktop + mobile) + "New to Card Studio?" Quick/Advanced | Steps: useful if they navigate | "New to Card Studio?" is odd beside a mode switch | Steps must scroll to their panel; rename to **"Show more options"** (one toggle) instead of two modes |

**Result if applied:** about 20–25 visible controls in Quick mode on a phone (from 87). Every capability is still reachable through Style, Advanced or ⋯ More.

## 2. Quick vs Advanced mode

- **Does Quick remove complexity?** Only partly. Quick hides 5 blocks (line height, colour/shadow, layout numbers, image fine-tuning, watermark position), but everything above the panel stays: toolbar, format switcher, 44-tile library, explainer panels, step bar. Measured visible controls: 87 (Quick).
- **Accidental Advanced?** Not observed. The risk is the reverse: Quick users need overlay strength after uploading a photo and cannot find it (CARD-UX-020).
- **Is switching safe?** Yes. State was preserved across Quick→Advanced→Quick (`logs/p6.json`, s8).
- **Recommendation:** replace the two-mode switch with a single "Show more options" disclosure inside Style. Promote the one Advanced control beginners need (text readability) into Quick.

## 3. Templates vs designs vs backgrounds

Current vocabulary in the product: *template* (9 text styles in Card Studio), *template* (`/urdu-templates` page), *design* (44 designer backgrounds in the Gallery), *background* (same 44 in Card Studio), *ready-made card* (157 text+design pairs), *use case*, *preset*. A beginner cannot tell these apart.

Proposal, using user language:
- **Design** = picture background (the 44) — the main visual choice.
- **Text style** = font/colour/frame combination (the 9 templates), applied on top of a design without replacing it.
- **Size** = use case/preset.
- **Ready-made card** = design + words, on `/urdu-cards`.

## 4. Better defaults (instead of more controls)

1. Sample text = a real greeting for the chosen use case (CARD-UX-004).
2. Designer backgrounds suppress the template frame/accent (CARD-UX-007).
3. Attribution inherits background text colour, font family and safe area (CARD-UX-006).
4. Uploading a photo picks readable text colour plus a 25–35% overlay (CARD-UX-020).
5. Greeting use case = square + designer background + Nastaliq + emphasised first line; Notice = portrait 4:5 + Naskh (CARD-UX-026/027).
6. Numbers and Latin runs are bidi-isolated at render (CARD-UX-003).
7. Instagram/WhatsApp makers open on a format-appropriate designer background, not white/midnight Naskh (CARD-UX-017).
8. Download filename from occasion + date (CARD-UX-030).

## 5. Workflow consolidation

There are currently **five creation surfaces**: `/urdu-card-studio`, `/urdu-cards` (personaliser), `/urdu-card-gallery`, `/urdu-whatsapp-status-maker`, `/urdu-instagram-post-maker` (plus `/urdu-templates`, name art and the wedding maker). They share one engine, but each exposes a different subset (no author on makers, no publish on makers or the personaliser, no link in the personaliser). Recommendation, **without** removing SEO pages:

- Keep all entry URLs (SEO owners unchanged).
- Make every surface finish in the **same Send sheet** (Download / Picture share / Publish link) and expose the **same text fields** (text + author).
- Make every "open in Card Studio" link carry text and design (the format-switch hand-off already does; the related-links footer does not).
- Treat the Gallery ("type once, compare 44 designs") as the recommended starting point from Card Studio's empty state and from the recipient page.

## 6. What should remain unchanged

- The **recipient page** design and its privacy posture.
- The **publish confirmation** dialog content (it is clear and honest) and the immutable-snapshot model.
- **Local-first autosave** and auto-restore on direct return.
- The **`/urdu-cards` personaliser** concept (fast and simple) and the **Gallery** "type once, see all designs".
- **On-canvas direct manipulation** (select, drag, handles, double-click to edit, context toolbar) and keyboard nudging.
- **Poetry background → Nastaliq + 1.8 line height** and two-line couplet preservation (WU-UXR-001 D1/D2).
- The **designer background collection quality** (the strongest visual asset).
- The **outage alert** copy for Roman Urdu ("words are staying in English letters… Type Urdu directly").
