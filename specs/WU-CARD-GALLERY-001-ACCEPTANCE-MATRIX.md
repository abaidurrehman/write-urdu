# WU-CARD-GALLERY-001 — Acceptance Matrix

**Parent:** `WU-CARD-GALLERY-001-live-urdu-card-gallery.md`  
**Architecture:** `WU-CARD-GALLERY-001-ARCHITECTURE-CONTRACT.md`

This matrix is the quality bar for the background-first Urdu Card Gallery. Passing source tests alone is insufficient; the product must feel fast, visually trustworthy and receiver-quality.

## A. Shared background registry

| ID | Scenario | Pass condition |
| --- | --- | --- |
| A1 | Existing background IDs | Every background ID present before registry extraction remains present after the refactor. |
| A2 | Unique IDs | Registry rejects/flags duplicate IDs in tests. |
| A3 | Lookup | `getBackgroundById` returns the correct controlled record or a safe null/missing result. |
| A4 | Categories | Every background category maps to a declared category; `All` includes every item. |
| A5 | Urdu labels | Every visible design has a non-empty Urdu label where the product promises bilingual UI. |
| A6 | Defaults | `textColor`, overlay metadata and source path remain equivalent for existing backgrounds unless a separately reviewed quality fix changes them. |
| A7 | Safe area | Every Gallery-enabled background has valid normalized safe-area bounds. |
| A8 | Capacity | Every Gallery-enabled background has a bounded text-capacity classification. |

## B. Gallery first-value experience

| ID | Scenario | Pass condition |
| --- | --- | --- |
| B1 | Fresh visit | Text input purpose is obvious and live previews begin close to the first useful viewport. |
| B2 | Empty state | Page does not show a command wall or require template/background setup before preview discovery. |
| B3 | First character | Typing the first meaningful character updates visible cards without a perceptible page rebuild. |
| B4 | Paste | Pasting multi-line Urdu updates all visible previews safely. |
| B5 | Replace text | Replacing the full text does not reload images or recreate the gallery. |
| B6 | Clear text | Clearing input returns to a useful empty/example state without stale user text remaining in previews. |

## C. Short / medium / long Urdu

Use stable fixtures committed with the implementation.

Recommended semantic fixtures:

```text
SHORT: 1–2 lines / short dua or phrase
MEDIUM: 3–4 lines / quote or poetry stanza
LONG: 6–8 lines / substantial social/greeting text
MIXED: Urdu + Latin name/code + numbers
```

| ID | Scenario | Pass condition |
| --- | --- | --- |
| C1 | Short text | No awkward tiny typography; expressive designs still look balanced. |
| C2 | Medium text | Text stays inside metadata safe area with readable line-height. |
| C3 | Long text on long-capacity design | No clipping/ellipsis; text remains readable. |
| C4 | Long text on short-capacity design | Design is demoted/marked as poorer fit or otherwise truthfully represented; content is not silently clipped. |
| C5 | Explicit newlines | User line breaks remain meaningful and do not cause overflow. |
| C6 | Mixed script | Urdu direction remains correct while Latin/numbers are not visually reversed. |
| C7 | Whitespace | Leading/trailing whitespace does not create broken sizing buckets. |
| C8 | Extreme input | Input limit/handling remains bounded and never produces browser lockup, NaN or broken layout. |

## D. Background safety and contrast

| ID | Scenario | Pass condition |
| --- | --- | --- |
| D1 | Dark art | Recommended light/ivory text is immediately readable on mobile. |
| D2 | Light art | Recommended dark text is immediately readable on mobile. |
| D3 | Busy edges | Main Urdu text remains inside calm central safe area. |
| D4 | Bright focal area | Overlay/defaults prevent the focal art from destroying legibility. |
| D5 | Crop | Gallery preview does not materially misrepresent the Card Studio selected result. |
| D6 | Receiver test | Exported selected card still looks intentional after realistic phone viewing/compression. |

A background fails the Gallery quality gate if it only looks good with one short demo phrase.

## E. Filtering and ranking

| ID | Scenario | Pass condition |
| --- | --- | --- |
| E1 | All | Shows all registry backgrounds enabled for Gallery. |
| E2 | Category | Shows only matching backgrounds without duplicate/missing cards. |
| E3 | Keyboard filter | Filter is reachable/operable by keyboard with visible focus. |
| E4 | Selected filter | State is programmatically conveyed, e.g. `aria-pressed`. |
| E5 | Mobile chips | Local horizontal scrolling does not cause page-level overflow. |
| E6 | Refilter | User text remains intact and previews retain correct content. |
| E7 | Intent ranking (later slice) | Ranking is deterministic from controlled metadata and text-length bucket; no server semantic analysis. |

## F. Selection and Card Studio handoff

| ID | Scenario | Pass condition |
| --- | --- | --- |
| F1 | Select card | `Use this design` transfers current text and selected background ID. |
| F2 | URL privacy | User text never appears in path/query/hash. |
| F3 | Destination | Card Studio recognizes Gallery handoff and becomes ready. |
| F4 | Background resolution | Selected ID resolves from shared registry and applies via existing Card Studio behavior. |
| F5 | Text editability | User can immediately edit the transferred text. |
| F6 | Export | Existing PNG/export path works after Gallery handoff. |
| F7 | Invalid ID | Text is preserved and Card Studio opens safely without false success. |
| F8 | Reload/expiry | Handoff expiry/reload follows current local handoff conventions without leaking content. |

## G. Privacy and telemetry

Use a unique sentinel string in QA.

| ID | Scenario | Pass condition |
| --- | --- | --- |
| G1 | Analytics request | Sentinel text is absent from every analytics/telemetry payload. |
| G2 | Navigation | Sentinel is absent from URL/referrer-visible transport. |
| G3 | Background telemetry | Only controlled `background_id` is sent, if approved. |
| G4 | Text size | Only a bounded length bucket may be sent. |
| G5 | Voice/Roman helpers | Source text/transcript is never added to Product Pulse events. |
| G6 | Images | Rendered card/screenshot bytes are never uploaded for normal Gallery operation. |

## H. Performance

Measure on at least one desktop and one mid-range mobile profile/device.

| ID | Scenario | Pass condition |
| --- | --- | --- |
| H1 | Initial load | Full-resolution rich raster collection is not eagerly downloaded. |
| H2 | Typing | Continuous typing does not visibly lag due to per-card canvas or repeated asset work. |
| H3 | CPU model | No canvas is created per preview on each input update. |
| H4 | Network | Background files are not re-requested per keystroke. |
| H5 | Scroll | Lazy images load without severe layout shift. |
| H6 | 20–40 designs | Gallery remains comfortably scrollable/interactive before considering virtualization. |
| H7 | Hidden/offscreen cards | Implementation avoids avoidable expensive layout/measurement loops. |

Slice 0 must record concrete measured baselines/targets rather than declaring `fast` without evidence.

## I. Mobile viewport matrix

Test at minimum:

| Viewport | Required result |
| --- | --- |
| 360×800 | Input obvious; previews readable; no horizontal page overflow. |
| 375×667 | Compact first-value hierarchy; keyboard does not trap/force scroll. |
| 390×844 | Comfortable one/two-column layout; tap targets remain usable. |
| 412×915 | Gallery uses space well without oversized cards. |
| 768×1024 | Grid scales naturally; text remains judgeable. |

Additional checks:

- touch is sufficient; hover never reveals the only action;
- input font avoids iOS zoom behavior where applicable;
- chip row may scroll locally;
- selection action approximately meets 44px touch target expectation;
- sticky UI, if any, must not cover input or cards.

## J. Accessibility

| ID | Scenario | Pass condition |
| --- | --- | --- |
| J1 | Input | Has visible label/instruction and native editable semantics. |
| J2 | Preview text | Real DOM text with Urdu language/direction, not baked into thumbnail. |
| J3 | Decorative art | Does not create repetitive screen-reader noise. |
| J4 | Filters | Native buttons/controls with selected state. |
| J5 | Choose action | Keyboard/touch operable with meaningful design name. |
| J6 | Focus | Visible focus meets current site standards. |
| J7 | Reduced motion | No functionality depends on animation. |
| J8 | Urdu UI | Urdu labels read in correct order/direction. |

## K. SEO / release governance

| ID | Scenario | Pass condition |
| --- | --- | --- |
| K1 | Validation route | Remains noindex/not publicly promoted until release gate approves otherwise. |
| K2 | Canonical overlap | SEO review explicitly compares intent with `/urdu-card-studio`. |
| K3 | No doorway variants | Only one Gallery product route exists. |
| K4 | Public release | Sitemap/llms/nav/registry changes happen only after index/public decision. |
| K5 | Card completion gate | Production/promotion state is consistent with canonical backlog or an explicit founder exception. |

## L. Regression matrix

All relevant existing tests stay green for:

- `/urdu-card-studio`;
- existing background apply/filter behavior;
- Card Studio history/storage/export;
- Name Art;
- WhatsApp Status Maker;
- Instagram Post Maker;
- Basic/Rich Writer;
- Voice/transliteration if reused;
- shared shell/SEO graph;
- service worker/PWA contracts.

Do not weaken a regression assertion merely because the new shared registry changed file ownership.

## M. Manual receiver-quality review

For at least one selected card from each major visual category:

1. create with short Urdu;
2. create with medium Urdu;
3. create with long Urdu where capacity allows;
4. export through Card Studio;
5. view at common phone display size;
6. inspect after ordinary image compression if available;
7. confirm text remains the visual focus and the art still feels premium.

Review question:

> Would a recipient consider this beautiful enough to pause on, save, forward or reshare?

A technically correct but visually cheap result does not pass.
