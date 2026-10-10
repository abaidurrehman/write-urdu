# WU-FONT-001 — Acceptance Matrix

**Parent:** `WU-FONT-001-urdu-typography-font-discovery-platform.md`  
**Architecture:** `WU-FONT-001-ARCHITECTURE-CONTRACT.md`

This matrix is the quality bar for the Urdu Typography & Font Discovery Platform. A font name appearing in a selector is not acceptance. The named face must be legally distributable where bundled, actually rendered where promised, and usable with real Urdu.

## A. Registry and governance

| ID | Scenario | Pass condition |
| --- | --- | --- |
| A1 | Registry IDs | Every record has unique stable ID and family |
| A2 | License state | Every record has explicit license state |
| A3 | Self-hosted asset | Asset exists only for `approved-web` record with source/license evidence |
| A4 | Capabilities | Unsupported surfaces are not offered the font |
| A5 | Legacy mapping | Existing Card Studio family strings resolve to stable IDs |
| A6 | Unknown ID | Unknown/stale ID degrades safely without crash |

## B. Licensing truth

| ID | Scenario | Pass condition |
| --- | --- | --- |
| B1 | Third-party mirror | Mirror availability alone never qualifies a font for bundling |
| B2 | Original source | Shipped binary has documented authoritative source |
| B3 | Web embedding | License evidence explicitly supports intended delivery or legal review approves it |
| B4 | Redistribution | Repository/public asset redistribution is allowed |
| B5 | Modification | WOFF2 conversion/subsetting obligations are documented |
| B6 | Attribution | Required credits are preserved |
| B7 | Ambiguous candidate | Remains system/reference-only or license-review |

## C. Urdu shaping

Canonical fixtures must include prose, poetry, ligatures, marks, mixed bidi and explicit line breaks.

| ID | Scenario | Pass condition |
| --- | --- | --- |
| C1 | Joining | Urdu letters join correctly |
| C2 | Nastaliq ligatures | No obvious broken ligatures for approved Nastaliq fonts |
| C3 | Aeraab/marks | Marks remain positioned/readable |
| C4 | Poetry | Multi-line poetry does not collide or clip |
| C5 | Digits | Urdu and Western digits remain readable |
| C6 | Mixed Latin | English names/URLs/codes remain correct LTR islands |
| C7 | Punctuation | Urdu/Latin punctuation does not produce destructive bidi reversal |
| C8 | Zoom | 200% browser zoom does not clip primary preview text |

## D. Font loading

| ID | Scenario | Pass condition |
| --- | --- | --- |
| D1 | Default web font | `document.fonts` confirms actual family availability |
| D2 | Lazy font | Offscreen font is not fetched before required unless browser preload policy intentionally does so |
| D3 | Deduplication | Multiple cards requesting same face do not create redundant loader work |
| D4 | Load failure | UI exposes failure/fallback honestly |
| D5 | System available | Installed local font is labelled available |
| D6 | System absent | Unavailable local font is not visually impersonated by fallback |
| D7 | Unknown detection | Browser uncertainty is represented as uncertainty |

## E. Card Studio

| ID | Scenario | Pass condition |
| --- | --- | --- |
| E1 | Existing default | Current default behavior remains stable |
| E2 | Selector | Options come from registry capability |
| E3 | Old project | Existing stored project opens with same intended family |
| E4 | New project | New font persists via stable ID/compatible state |
| E5 | Measurement | Selected font loads before authoritative fit/measurement |
| E6 | Export | PNG uses selected supported font |
| E7 | Export failure | Failed font load does not silently export fallback as requested face |
| E8 | Backgrounds/templates | No unrelated regression |

## F. Name Art

| ID | Scenario | Pass condition |
| --- | --- | --- |
| F1 | Selector | Uses registry-backed eligible fonts |
| F2 | Rendering | Selected family appears in preview |
| F3 | Export | Selected supported family survives exported image |
| F4 | Mobile | Name glyphs/marks do not clip at common phone widths |

## G. Rich Editor

| ID | Scenario | Pass condition |
| --- | --- | --- |
| G1 | Urdu choices | Governed Urdu subset comes from registry adapter |
| G2 | Existing Latin fonts | Existing general editor fonts remain usable |
| G3 | Iframe | Selected approved web font is available inside TinyMCE content document |
| G4 | Edit/reopen | Font selection remains stable through normal editor operations |
| G5 | Output | Print/export behavior is documented/tested for supported fonts |
| G6 | Qadreeregular | Documentation/runtime mismatch is resolved explicitly |

## H. `/urdu-fonts` preview MVP

| ID | Scenario | Pass condition |
| --- | --- | --- |
| H1 | First viewport | Input + first real previews are obvious without scrolling through an article |
| H2 | Real text | User's text updates previews locally |
| H3 | Example | One click loads useful Urdu sample |
| H4 | Category | Nastaliq/Naskh/decorative filters are accurate |
| H5 | Size | Size adjustment does not destroy layout |
| H6 | Long text | Long fixture is not silently truncated into a misleading sample |
| H7 | System font | Availability label matches rendered reality |
| H8 | Accessibility | Preview remains selectable/readable real text |
| H9 | Mobile | Grid/input usable at 320/360/390/430 CSS px representative widths |
| H10 | Noindex gate | Route remains noindex/unpromoted until explicit release approval |

## I. Handoffs

| ID | Scenario | Pass condition |
| --- | --- | --- |
| I1 | Card Studio | text + supported font arrive intact |
| I2 | Name Art | text + supported font arrive intact |
| I3 | Rich Editor | text + supported font arrive intact where adapter supports it |
| I4 | URL privacy | User text/font payload not serialized into query/hash |
| I5 | Telemetry privacy | No content value in event payload |
| I6 | Unsupported font | Destination rejects or explains capability mismatch |
| I7 | Refresh/stale state | Old payload does not corrupt destination |

## J. Performance

Slice 0 records numeric baselines; later slices compare against them.

| ID | Scenario | Pass condition |
| --- | --- | --- |
| J1 | Basic Writer | No full font-library requests added |
| J2 | Global shell | No decorative catalog loaded globally |
| J3 | Preview startup | Page interactive before full catalog is downloaded |
| J4 | Preview renderer | DOM text, not per-card canvas loop |
| J5 | Font cache | Repeated previews reuse browser/loader cache |
| J6 | Route bytes | Added font bytes are measured and recorded |
| J7 | Typing responsiveness | Updating input does not cause visible multi-card jank on target mobile device |

## K. SEO and intent ownership

| ID | Scenario | Pass condition |
| --- | --- | --- |
| K1 | Tool intent | `/urdu-fonts` copy/title center interactive preview/compare |
| K2 | Guide intent | `/urdu-fonts-nastaliq-vs-naskh` remains educational |
| K3 | Stylish text | `/stylish-urdu-text-generator` continues to explain Unicode decorations are not embedded fonts |
| K4 | Name Art | Exact image typography remains owned by Name Art/Card tools |
| K5 | Thin pages | No mass-generated font pages in MVP |
| K6 | Index release | sitemap/nav/public registry updated only after acceptance |

## L. Privacy and security

| ID | Scenario | Pass condition |
| --- | --- | --- |
| L1 | Preview content | Text stays in browser |
| L2 | Arbitrary URLs | User cannot inject remote font URL/style into registry loader |
| L3 | Analytics | Only controlled IDs/actions, never content |
| L4 | Handoff | Controlled destination + controlled registry ID |
| L5 | External font host | Privacy copy reflects actual font-host requests where relevant |

## M. Browser/manual matrix

At minimum exercise:

```text
Desktop Chrome/Edge
Desktop Firefox where available
Safari/macOS where available
iPhone Safari representative current version
Android Chrome representative current version
```

For each browser/device, validate:

```text
Noto Nastaliq Urdu
Noto Naskh Arabic
first newly approved Pakistani Nastaliq web font
one absent system-only candidate
short + poetry + mixed-bidi fixture
preview + one creation handoff
```

## N. Release decision

Public indexing is blocked if any of these remain unresolved:

```text
license ambiguity for a bundled binary
font preview masquerades fallback as named face
Card/Name Art export mismatch for advertised supported font
mobile Urdu clipping on primary fonts
full font catalog leaks onto general site routes
query intent collision with existing font guide
private user text enters URL or telemetry
```
