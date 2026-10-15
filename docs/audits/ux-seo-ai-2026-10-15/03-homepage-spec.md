# 03 — Homepage first-screen specification (GATED)

**Status:** Not approved for implementation. `specs/BACKLOG.md` freezes homepage layout churn until the P0.1G post-change review, or until the founder records a dated exception in `BACKLOG` P0.1. This spec exists so the work is ready when the gate opens. It does **not** replace `WU-PLAT-004` / `WU-PLAT-002H`. It proposes the next iteration inside those contracts.

**Precondition:** finish the AdSense in-page fix first (01, risk 1), then re-measure. Without it, any layout change is measured against ad noise.

## Principles (unchanged contracts)

- Title, `searchTitle`, H1, description: **frozen** (`WU-SEO-CTR-001A`).
- `#transliterateTextarea`, Google transliteration init (`google_jsapi.js` untouched), copy/clear/save/share/export behaviour: **protected**.
- At most three visible continuation actions; no autofocus on load; no new toolbar layered on old ones.

## Proposed changes, each one measurable

| ID | Change | Hypothesis | Metric | Guardrail |
| --- | --- | --- | --- | --- |
| H-1 | **Desktop:** move the "Speak Urdu" promo card out of the hero. Voice stays reachable as the existing **Speak Urdu** mode chip. Fold the "Two ways to write Urdu" box into the existing example strip (one line). | Editor top goes from 534 px to ≤ 380 px at 1366×768 with no loss of voice starts. | `writer_visible` → `writer_first_input` rate on desktop | Voice starts from `/` must not drop more than noise. Basic voice adoption is already ~0.2%. |
| H-2 | **After first text:** show **Copy** (primary) + **one** contextual action (Create Card or Format as document) + **More**. Move Preview/PDF/Word/PNG/Download/Share/Print into More, or into the existing post-value continuation panel. | Fewer pre-editor controls cut the editor shift on mobile and raise copy completion. | copy/export completion per session with text; editor-shift px at 390×844 (browser test) | PDF+Word share of exports must not fall. They stay one tap away in More. |
| H-3 | **Name hint at the point of error:** when the user presses Backspace into a just-converted word, show a one-time inline hint "Choose another spelling ↓" next to the suggestion list. | Users like Persona A find علی without reading the lede. | suggestion-pick rate per session | No hint while typing forward; shown once per device. |
| H-4 | **Mobile hero:** keep the H1 plus a one-line lede. Collapse the 3-line lede to one line, with "how it works" as a details link. | Editor top ≤ 400 px at 375×667 *with* the AdSense fix in place. | Gate B2 floors (≥160 px / ≥220 px) | No content removed from raw HTML: SEO text moves below the tool, not out of the page. |

## Visual direction (applies to H-1…H-4 only)

Reuse the `css/v3-design-system.css` tokens. Do not start a new palette. The existing green brand, Nastaliq editor face and card radii already read as one product. The gain comes from removing competing surfaces, not from restyling them.

## Acceptance (when unfrozen)

- Playwright: `tests/mobile-editor-activation.spec.js` floors still pass, plus a new assertion that ≤ 3 action buttons render above the editor after the first word at 360/390/412 widths.
- Before/after screenshots at 375×667, 390×844, 1366×768 committed under `evidence/`.
- A PR body with hypothesis, governed state, removed/demoted UI, primary metric, guardrails, release marker and rollback (BACKLOG grooming rule).
