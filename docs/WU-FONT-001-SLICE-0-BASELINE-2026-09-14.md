# WU-FONT-001 — Slice 0 Runtime / License / Shaping Baseline

**Captured:** 2026-09-14  
**Runtime base:** current `main` at Slice 0 start  
**Scope:** audit/evidence only; no new font binary, no public `/urdu-fonts` route, no existing font behavior change.

## 1. Exit decision

Slice 0 establishes a reviewable baseline before any shared registry migration or Pakistani-font expansion.

The current product already has a technically sound browser-font/export foundation, but font ownership is fragmented across surfaces. The next implementation slice should centralize metadata/loading without changing visible defaults.

## 2. Current runtime inventory

| Surface | Current Urdu/Arabic font behavior | Delivery | Notes |
| --- | --- | --- | --- |
| Global design token / many tools | `Noto Nastaliq Urdu`, then `Noto Naskh Arabic`, then serif | page/runtime Google font loading where present; fallback otherwise | `css/design-tokens.css` is the shared CSS default |
| Basic Writer | Primarily Noto Nastaliq through existing page/font loading and shared Urdu token | Google-hosted font CSS / fallback | Do not expand catalog globally |
| Urdu Keyboard | Noto Nastaliq/Naskh-oriented page styling | Google Early Access CSS currently present | Legacy delivery path should be reconciled later, not changed in Slice 0 |
| Rich Editor | Active TinyMCE list: `Noto Nastaliq Urdu; Noto Naskh Arabic; Amiri; Harmattan; Katibeh; Lateef; Scheherazade; Tajawal` plus Latin/system choices | Google Early Access + Google Fonts CSS inside editor iframe | Current active runtime does **not** include `Qadreeregular` |
| Editor Features documentation | Documents `Qadreeregular` among available Urdu-friendly fonts | Documentation only | Confirmed stale documentation/runtime mismatch; owned by Slice 1B reconciliation |
| Card Studio | `Noto Nastaliq Urdu`, `Noto Naskh Arabic`, `Amiri`, `Lateef`, `Scheherazade New`, `Tajawal` | one Google Fonts CSS2 request scoped to creation surface | Explicit `document.fonts.load()` path exists before render/export |
| Name Art | Same six choices as Card Studio | Google Fonts CSS2 | Shares Card Studio-style creation behavior but still has handwritten font options |
| WhatsApp/Instagram social makers | Same six-family Google Fonts bundle through social/Card Studio family | Google Fonts CSS2 | Separate page declarations currently repeat the bundle |
| Urdu Cards / Gallery | Primarily `Noto Nastaliq Urdu` / Naskh fallback for lightweight previews/rendering | inherited/page font availability | Gallery is background-first; do not turn it into a font catalog |
| Share/document previews | Canvas stack explicitly starts with `Noto Nastaliq Urdu`, then `Noto Naskh Arabic`, serif | depends on document/page font readiness | `js/document-share.mjs` assigns the stack directly |

## 3. Current creation font sets

### Card Studio + Name Art

```text
Noto Nastaliq Urdu
Noto Naskh Arabic
Amiri
Lateef
Scheherazade New
Tajawal
```

### Rich Editor Urdu/Arabic portion

```text
Noto Nastaliq Urdu
Noto Naskh Arabic
Amiri
Harmattan
Katibeh
Lateef
Scheherazade
Tajawal
```

### Confirmed inconsistency

`Qadreeregular` appears in documentation and an old commented TinyMCE configuration, but not in the active TinyMCE `font_formats` list. Slice 0 records the mismatch; Slice 1B should either restore it from a verified source or remove the stale documentation. Do not silently claim runtime support today.

## 4. Existing font sources / requests

### Card Studio / social maker bundle

Current CSS2 family request includes:

```text
Amiri 400,700
Lateef 400,700
Noto Naskh Arabic 400,500,600,700
Noto Nastaliq Urdu 400,500,600,700
Scheherazade New 400,700
Tajawal 400,500,700
```

The bundle is intentionally scoped to visual creation pages rather than loaded across the whole site.

### Rich Editor

Current active editor still uses Google Early Access endpoints for Noto Nastaliq Urdu / Noto Naskh Arabic plus a Google Fonts CSS2 request for Amiri, Harmattan, Katibeh, Lateef, Scheherazade and Tajawal.

This is a migration concern for Slice 1/1B, not a Slice 0 runtime change.

## 5. Card Studio load/export behavior

Current Card Studio has the correct high-level invariant:

```text
selected family
→ document.fonts.load(size + family)
→ document.fonts.ready
→ draw/measure
→ export canvas
```

`exportPng()` calls `ensureProjectFonts()` before the export draw. `card-studio-core.js` assigns the selected `text.fontFamily` to the canvas context. This behavior must survive registry migration.

## 6. License/evidence decisions

The machine-readable candidate ledger is `fixtures/urdu-fonts/slice0-font-candidates.json`.

### Approved existing web families

The current Google Fonts families are recorded as `approved-web` in the Slice 0 fixture because their official Google Fonts distribution is under the SIL Open Font License. No binaries are copied into this Slice.

### Mehr Nastaliq Web — `license-review`

Authoritative product page: `https://mehrtype.com/product/mehr-nastaliq-web/`

Important finding: the product page contains a Creative-Commons-style statement permitting commercial remix with credit/share-alike language, **but Mehr Type's current EULA separately states that webfont use requires its webfont licence and sets webfont-specific conditions**. Those two pieces of official material must be reconciled for Write-Urdu's exact embedding/distribution model before we ship the font.

Therefore Mehr remains `license-review` in Slice 0 despite being the highest-priority visual candidate.

### Awami Nastaliq — `approved-system-reference`, web candidate pending technical acceptance

Authoritative SIL source: `https://software.sil.org/awami/`

SIL explicitly states that Awami Nastaliq is free to use, modify and redistribute under the SIL Open Font License. This clears the rights side strongly enough for a governed candidate, but it is **not yet `approved-web` for Write-Urdu product use** because browser shaping/rendering/performance still needs acceptance. Awami relies heavily on smart-font behavior and must be tested carefully across browsers before promising identical output.

### Nafees Nastaleeq — `license-review`

Do not bundle until the original CRULP/owner licence source is captured directly and current redistribution/web-embedding rights are verified.

### Jameel Noori Nastaleeq / Kasheeda — `license-review`

High user recognition does not substitute for authoritative redistribution rights. No mirror download is accepted as licensing evidence. If future preview support is system-only, the UI must detect availability honestly and never render a Noto fallback labelled as Jameel.

### AlQalam Taj Nastaleeq / AA Sameer Sagar / Gandhara Suls — `license-review`

All remain reference/system candidates until original author/foundry licence evidence is preserved. No binary may enter the repository from a font-download mirror.

## 7. Canonical Urdu shaping corpus

`fixtures/urdu-fonts/shaping-fixtures.json` now covers:

- short Urdu phrase;
- ligature-heavy prose;
- multiline poetry;
- aeraab/marks;
- Urdu digits;
- Western digits embedded in Urdu;
- mixed Urdu + Latin/code/URL;
- explicit line breaks;
- tatweel/Kashida probe.

These fixtures become the minimum corpus for any WOFF2 conversion, loader migration, line-height tuning or new font acceptance. Latin lorem ipsum is not valid acceptance evidence.

## 8. Baseline measurement contract

`tests/urdu-font-slice0-contract.test.js` records, on every contract-test run:

```text
Card Studio HTML source bytes
Card Studio Google-font stylesheet reference count
Name Art HTML source bytes
Name Art Google-font stylesheet reference count
Rich Editor HTML source bytes
Rich Editor Google-font reference count
```

This is a reproducible **source/request baseline**, not a claim about compressed transfer bytes from every CDN/browser cache state.

For Slice 1 and the future comparison route, preserve the stricter performance rule:

- no full font catalog on Basic Writer/global shell;
- no eager loading of license-review/system-only candidates;
- first comparison viewport should target at most **2 newly initiated font stylesheet/font-family groups beyond the existing page shell** before lazy loading additional previews;
- selected creation/export font may strict-load on demand;
- any self-hosted font candidate must record actual WOFF2 bytes before release.

## 9. Source contract added

`tests/urdu-font-slice0-contract.test.js` fails if:

- candidate IDs/status metadata become malformed;
- an `approved-web` record lacks authoritative source/licence family;
- a `license-review` record is marked as a bundled webfont;
- the real Urdu shaping corpus is weakened;
- the global Noto fallback stack changes unexpectedly;
- current Card Studio/Name Art six-family inventories drift without review;
- the Rich Editor active Urdu-family list drifts;
- the known Qadreeregular mismatch disappears accidentally rather than being deliberately reconciled;
- Card Studio stops explicitly loading fonts before export;
- document share preview changes its Urdu stack without review.

## 10. Slice 0 conclusion

**Ready for review:** yes.

**New font binaries added:** none.

**Public route added/indexed:** none.

**Current defaults changed:** none.

**Recommended next slice:** `WU-FONT-001 Slice 1 — shared registry + deduplicated loader`, after Slice 0 CI passes. Slice 1 should centralize existing approved families first; it should not add Mehr/Jameel/other new binaries in the same change.
