# WU-FONT-001 — Urdu Typography & Font Discovery Platform

**Status:** Planned — founder-approved for specification on 2026-09-13  
**Area:** Urdu typography / creation / SEO / retention  
**Proposed public route:** `/urdu-fonts`  
**Existing informational route:** `/urdu-fonts-nastaliq-vs-naskh`  
**Related:** `/urdu-card-studio`, `/urdu-name-art-maker`, `/urdu-editor`, `/stylish-urdu-text-generator`, `WU-CARD-GALLERY-001`, `WU-JOURNEY-001F`, `WU-PLAT-002H`, `WU-SEO-CTR-001`  
**Primary invariant:** build one governed Urdu font system that powers existing creation tools first; do not create another generic font-download directory.

## 1. Product thesis

Write-Urdu already owns the beginning and end of the user journey:

```text
Roman/direct/voice Urdu input
→ editable Urdu text
→ document/card/name-art/social output
```

Typography is currently fragmented between those surfaces. Card Studio and Name Art expose a six-font set, Rich Editor exposes a different set, and the site-wide Urdu stack defaults to Noto Nastaliq Urdu / Noto Naskh Arabic.

The opportunity is to turn font choice into a coherent product capability:

```text
type once
→ see the same real Urdu text across trusted fonts
→ understand which style fits the job
→ choose one
→ continue directly into Card Studio / Name Art / Rich Editor
```

This creates both a platform capability and a public discovery surface without duplicating the site's existing writing engines.

## 2. Why this deserves an epic

This is not a dropdown expansion.

Adding Urdu fonts safely touches:

- font licensing and redistribution rights;
- web delivery and performance;
- Urdu shaping, OpenType layout and line-height behavior;
- browser/canvas rendering and image export;
- Rich Editor iframe/font loading;
- Card Studio and Name Art visual parity;
- mobile rendering;
- SEO intent ownership between a font preview tool and the existing Nastaliq-vs-Naskh guide;
- accessibility and truthful fallback messaging;
- future font additions without each product maintaining its own list.

The epic therefore owns a shared font registry, license evidence, loading strategy, comparison experience, cross-tool handoffs and acceptance tests.

## 3. Market evidence and differentiation

Current Urdu sites validate demand for font-specific discovery:

- Urdu Nigaar exposes a dedicated Urdu Font Preview tool and a broader font-directory experience.
- UrduKhaber exposes a browser-local Urdu Font Previewer for comparing Nastaliq/Naskh choices.
- AlphaFonts has an Urdu font-generator/directory surface and distinguishes web-renderable previews from desktop/download-required fonts.
- generic Urdu font sites focus heavily on downloads and individual font pages.

These competitors prove the user job exists, but Write-Urdu should not compete on raw file count.

Our differentiation is the connected workflow:

```text
preview my own words
→ choose by real use case
→ create something immediately
```

The strongest actions are therefore not `Download font` but:

- `Use in Card Studio`
- `Create Name Art`
- `Continue in Rich Editor`
- later: `Compare on backgrounds`

Font downloads, if ever offered, must be secondary, source-linked and license-governed.

## 4. User jobs

### Job A — “Which Urdu font looks best for my words?”

The user pastes or types a real phrase, name, poem or announcement and sees it rendered across trustworthy Urdu fonts.

### Job B — “I want classic Pakistani Nastaliq.”

The product should distinguish classic Nastaliq, web-optimized Nastaliq, Naskh/readability and decorative/calligraphic styles instead of presenting an alphabetical dropdown.

### Job C — “Will this look the same when I export/share?”

A font marked as web-supported must actually be loaded for preview and export. A local/system-only face must never silently fall back while pretending to be that font.

### Job D — “Take this style into my design/document.”

Chosen text + font should hand off to existing creation tools without retyping and without putting private text in the URL.

### Job E — “I am deciding what Urdu font to use on the web.”

The public page can explain web-safe vs system-only fonts and link to official sources/license notes. This is a secondary developer/publisher job, not the dominant UI.

## 5. Current-state baseline

### Site-wide Urdu default

The current design token is effectively:

```css
--wu-font-urdu: "Noto Nastaliq Urdu", "Noto Naskh Arabic", serif;
```

### Card Studio / Name Art

Current shared visible set:

```text
Noto Nastaliq Urdu
Noto Naskh Arabic
Amiri
Lateef
Scheherazade New
Tajawal
```

Card Studio already waits for `document.fonts` before authoritative canvas rendering/export. Preserve that behavior.

### Rich Editor

Current active TinyMCE list includes:

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

The feature/reference page also mentions `Qadreeregular`, creating a current documentation/runtime inconsistency that Slice 0 must reconcile rather than perpetuate.

## 6. Candidate font policy

No binary font asset may enter the repository solely because it can be downloaded from a third-party font site.

Every candidate receives one of these states:

```text
approved-web
approved-system-reference
license-review
rejected
```

### Initial candidate inventory

| Font | Intended role | Initial state |
| --- | --- | --- |
| Noto Nastaliq Urdu | dependable web Nastaliq / default | approved-web |
| Noto Naskh Arabic | compact/readable Naskh | approved-web |
| Amiri | classical Naskh/calligraphic | approved-web |
| Lateef | traditional Arabic/Urdu display | approved-web |
| Scheherazade New | classical text / headings | approved-web |
| Tajawal | modern Arabic-script UI/display | approved-web |
| Harmattan | readable Arabic-script alternative | existing editor; audit for shared use |
| Katibeh | decorative display | existing editor; audit for shared use |
| Mehr Nastaliq Web | web-optimized Pakistani Nastaliq | **license-review before bundling** |
| Nafees Nastaleeq | Pakistani Nastaliq candidate | **license-review / original-source verification** |
| Awami Nastaliq | open-source Nastaliq candidate | **license-review / original-source verification** |
| Jameel Noori Nastaleeq | classic Pakistani publishing | **system/reference only until original license verified** |
| Jameel Noori Kasheeda | extended decorative Nastaliq | **system/reference only until original license verified** |
| AlQalam Taj Nastaleeq | decorative/title Nastaliq | **license-review** |
| AA Sameer Sagar | social/thumbnail display | **license-review** |
| Gandhara Suls / Sulus | heading/calligraphic | **license-review** |

`license-review` means exactly that: do not ship the font binary, do not advertise universal rendering, and do not infer rights from a mirror/download site.

## 7. Licensing evidence gate

For each self-hosted candidate, record:

```text
canonical font name
foundry/author
original source URL
license name
license text/source URL
commercial-use status
web-embedding status
redistribution status
modification/subsetting status
attribution requirement
share-alike requirement if any
review date
reviewer/source notes
repository asset path only after approval
```

If the source/license is ambiguous, the font stays system/reference-only.

For Mehr Nastaliq Web specifically, the official Mehr Type source describes the font as intended for web/mobile and publishes a Creative Commons-style commercial-use statement. Before bundling, preserve the exact license evidence and explicitly review attribution/share-alike implications for distribution of the font software and any modified/subset derivative.

Do not turn this product spec into legal advice; it is a release gate requiring documented evidence.

## 8. Shared font registry

Introduce one neutral registry, proposed:

```text
js/urdu-font-registry.js
```

The exact module format should follow current repository conventions.

A record should support the following bounded metadata:

```js
{
  id,
  family,
  displayName,
  displayNameUr,
  style,               // nastaliq | naskh | decorative | ui
  delivery,            // google | self-hosted | system
  licenseStatus,       // approved-web | approved-system-reference | license-review | rejected
  sourceUrl,
  licenseUrl,
  weights,
  defaultWeight,
  lineHeight,
  fallback,
  recommendedFor,      // bounded tags
  exportSupport,       // canvas | dom-only | system-dependent
  priority,
  assetUrl,            // only for approved self-hosted web fonts
  attribution          // optional display/credits metadata
}
```

Do not put marketing copy or page-specific SEO text into this registry.

Consumers must filter by capability rather than copy their own arrays.

## 9. Font-loading architecture

### 9.1 Do not load the whole library site-wide

The global Urdu reading stack remains small.

A user opening the Basic Writer must not download every decorative font merely because the font platform exists.

### 9.2 Lazy delivery

For the comparison surface:

- load the default/above-the-fold fonts first;
- lazy-load additional web fonts as preview groups approach the viewport;
- preload a selected font before export/handoff where required;
- use WOFF2 for approved self-hosted web assets;
- preserve complete OpenType shaping tables;
- do not naïvely subset Nastaliq fonts in a way that breaks GSUB/GPOS shaping;
- benchmark before introducing Unicode-range or custom subsetting.

### 9.3 Truthful fallbacks

For a system-only font:

- detect availability with the Font Loading API where reliable;
- label the state `Installed on this device` / `Not installed`;
- do not render a fallback and label it as Jameel Noori (or another unavailable family);
- optionally show a neutral sample/fallback card explaining that local installation is required.

This is a major trust differentiator over preview sites that list desktop fonts but visually fall back to another web face.

## 10. Public font discovery experience

### Proposed route

`/urdu-fonts`

Intent ownership:

- `/urdu-fonts` = **interactive preview/compare/choose** intent;
- `/urdu-fonts-nastaliq-vs-naskh` = **educational difference/explanation** intent.

Do not merge the guide into the tool and do not create duplicated SEO copy between them.

### First useful viewport

The user should see:

- H1: `Urdu Fonts — Preview Your Text in Nastaliq & Naskh`
- one obvious Urdu text input;
- an example button;
- Roman Urdu → Urdu only if the existing reusable input mode fits without clutter;
- the first font previews immediately below the input.

Suggested Urdu instruction:

> **اپنا متن لکھیں — مختلف اردو فونٹس میں فوراً دیکھیں**

No account request, ad wall, download wall or long article should appear before the first previews.

### Preview grid

Each font card should show:

- user's real text;
- visual font name;
- type badge: Nastaliq / Naskh / Decorative;
- delivery badge: Web font / This device;
- concise best-for tags: Poetry, Reading, Card, Heading, Document;
- a clear selection/action affordance;
- unavailable/system-only state when appropriate.

Useful controls may include:

- font size;
- short/medium/long sample presets;
- category filter;
- `Compare selected` mode for 2–4 fonts.

Do not start with weight/color/letter-spacing/design controls that belong in Card Studio.

## 11. Cross-tool continuation

The font page should become a chooser, not a dead end.

Primary continuations:

```text
Use in Card Studio
Create Name Art
Continue in Rich Editor
```

Transfer state should be bounded:

```text
source = urdu-fonts
text
fontId
optional destination
```

No user text in query strings, hashes, analytics or logs.

Destinations resolve `fontId` through the shared registry and reject unsupported/system-only choices where exact rendering cannot be guaranteed.

## 12. Integration with Card Studio and Card Gallery

This epic complements `WU-CARD-GALLERY-001`.

The two discovery loops are distinct:

```text
WU-CARD-GALLERY-001:
write once → compare backgrounds → choose design

WU-FONT-001:
write once → compare Urdu typefaces → choose typography
```

A later combined experiment may allow:

```text
text + chosen font → compare across backgrounds
```

Do not create a Cartesian-product wall of 12 fonts × 20 backgrounds in the MVP.

Card Studio remains authoritative for final typography + background refinement and image export.

## 13. Rich Editor integration

After the registry is stable, Rich Editor's font menu should be generated or reconciled from it rather than maintaining a separate handwritten list.

Requirements:

- keep general Latin/system fonts available where TinyMCE requires them;
- Urdu-specific group comes from governed registry metadata;
- iframe content loads selected approved web font;
- saved/exported document behavior is tested separately from browser preview;
- reconcile the existing `Qadreeregular` reference/runtime mismatch.

Do not undertake a TinyMCE migration as part of this epic.

## 14. Canvas/export correctness

For Card Studio, Name Art and any preview-image output:

1. selected font must resolve from registry;
2. approved web font must be loaded before measurement;
3. `document.fonts.load(...)` / readiness must be awaited before authoritative draw/export;
4. canvas measurement/fitting must run using the actual family;
5. exported PNG must visually match the final preview within expected canvas-vs-DOM differences;
6. if the font fails to load, export must not silently claim the requested family was used.

Font-load failure needs a recoverable status and safe fallback decision.

## 15. Urdu shaping and bidi quality bar

Canonical fixtures must cover:

- Urdu alphabet joining behavior;
- short prose;
- multi-line poetry;
- ligature-heavy Nastaliq;
- diacritics / aeraab;
- Urdu digits and Western digits;
- English names/URLs/product codes inside Urdu;
- punctuation;
- long lines and explicit line breaks;
- Kashida/tatweel where supported;
- common Pakistan-facing phrases/names.

Never use Latin lorem ipsum as the primary font acceptance fixture.

## 16. Performance budget

The exact numeric budget should be benchmarked in Slice 0, but the architecture must enforce these principles:

- no all-font download on general site routes;
- no blocking font library on Basic Writer first value;
- comparison route should become interactive before the complete font catalog is loaded;
- preview cards render as DOM text, not one canvas per font;
- canvas is reserved for authoritative export or focused test comparison;
- avoid duplicate font requests between cards;
- prefer same-origin self-hosting for approved assets when it improves reliability and licensing permits it.

## 17. Privacy

The core comparison experience is browser-local.

Never send to telemetry:

- user text;
- font preview content;
- names/poetry/captions;
- local-font inventory beyond a bounded product event if ever justified.

Permitted content-free events, after telemetry governance review, may include:

```text
font_compare_started
font_selected { font_id }
font_destination_chosen { destination }
font_handoff_ready { destination }
font_handoff_completed { destination }
```

Only IDs from the controlled registry are allowed.

## 18. SEO contract

The public tool must earn its route by being a real interactive experience.

### Query/intent ownership

`/urdu-fonts`
: interactive user-text preview and selection.

`/urdu-fonts-nastaliq-vs-naskh`
: education about script/typeface categories, readability and use cases.

`/stylish-urdu-text-generator`
: copyable Unicode decoration, not real font rendering.

`/urdu-name-art-maker`
: image composition/output for names.

Do not let titles/descriptions imply that Unicode copy/paste preserves a font in destination apps.

### Individual font pages

Do not generate dozens of thin `/urdu-fonts/<name>` pages in the first release.

A dedicated font guide becomes eligible only when it has unique value such as:

- verified history/source/licensing;
- genuine preview;
- installation/use guidance;
- comparison with related fonts;
- official source link;
- integration actions.

## 19. Accessibility

- preview text remains real text, not image-only;
- font name/badges are readable without depending on font appearance;
- controls have accessible labels;
- selected/unavailable states are announced semantically;
- high zoom must not clip Urdu glyphs;
- vertical metrics need extra care for Nastaliq ascenders/descenders;
- keyboard navigation across compare cards must remain practical.

## 20. Slices

### Slice 0 — inventory, evidence, benchmark and registry contract

- inventory every current Urdu font declaration/list across the repository;
- reconcile actual runtime vs documentation;
- capture current Card Studio/Name Art/Editor behavior;
- create license evidence table from original/authoritative sources;
- establish `urdu-font-registry` schema and fixtures;
- benchmark representative font sizes/network cost/render time;
- no new public route required.

### Slice 1 — shared font registry + existing-tool convergence

- implement registry;
- move Card Studio and Name Art to registry-backed options;
- preserve all currently shipped choices and project compatibility;
- reconcile Rich Editor Urdu choices without unrelated editor refactor;
- add font-loading utilities/tests;
- add only font binaries that have passed the evidence gate.

### Slice 2 — interactive `/urdu-fonts` preview MVP

- browser-local one-input/many-font DOM preview;
- type/category/delivery labels;
- size control + short/medium/long examples;
- truthful system-font availability states;
- initially `noindex`/unpromoted until acceptance + route ownership review.

### Slice 3 — creation handoffs

- font chooser → Card Studio;
- font chooser → Name Art;
- font chooser → Rich Editor where technically reliable;
- bounded telemetry;
- no user text in URLs/events.

### Slice 4 — visual compare and recommendation layer

- select 2–4 fonts for side-by-side comparison;
- deterministic use-case recommendations from registry metadata;
- optional `Best for poetry / reading / cards / headings` guidance;
- no AI required.

### Slice 5 — public SEO/discovery release

Only after acceptance:

- finalize canonical/title/description/schema;
- verify non-cannibalization with existing font guide and stylish-text route;
- add sitemap/navigation/contextual links;
- index route;
- cross-link from Card Studio, Name Art, Editor features and existing font guide where contextually useful.

### Slice 6 — evidence-gated font expansion

- add further Pakistani fonts only after license + shaping + performance checks;
- consider high-value individual font guides only where unique content can be sustained;
- evaluate combined font + background comparison only if usage evidence justifies complexity.

## 21. Success metrics

Primary product metrics:

```text
preview start → font selection rate
font selection → destination action rate
handoff ready → destination meaningful action
Card/Name Art completion after font handoff
return visits to /urdu-fonts
```

Quality metrics:

```text
font load failure rate
fallback/mismatch incidents
export parity failures
mobile clipping/overflow failures
median added font bytes by route
```

SEO metrics after index release:

```text
impressions/clicks for Urdu-font comparison intent
CTR for /urdu-fonts
new queries not cannibalized from /urdu-fonts-nastaliq-vs-naskh
continuation from organic font traffic into creation tools
```

Do not define success as raw font download count.

## 22. Non-goals

This epic does **not** authorize:

- downloading arbitrary font files from mirrors and committing them;
- a 1000-font archive;
- a new general-purpose graphic editor;
- replacing TinyMCE;
- changing the global site font to a decorative face;
- programmatic creation of thin SEO pages;
- an AI font recommender;
- server-side storage of user preview text;
- a second Card Studio/export renderer;
- claiming an unavailable local font is being previewed when fallback is actually rendered.

## 23. Key decisions

1. **Platform before catalog.** One font registry comes before adding many families.
2. **Creation workflow over downloads.** Our strategic advantage is continuity into existing Write-Urdu tools.
3. **License truth over popularity.** Famous fonts remain system/reference-only until rights are verified.
4. **Preview truth over cosmetic breadth.** Never masquerade a fallback as a named font.
5. **Lazy-load by route/use.** Typography richness must not tax the Basic Writer.
6. **Separate SEO intent.** Interactive `/urdu-fonts` and educational `/urdu-fonts-nastaliq-vs-naskh` remain distinct.
7. **Existing renderers remain authoritative.** Card Studio/Name Art export paths are reused, not forked.

## 24. Definition of done for the epic

The epic is complete only when:

- all Urdu-capable creation tools consume one governed registry or an explicitly documented adapter;
- every web-delivered font has preserved license/source evidence;
- system-only fonts are represented truthfully;
- `/urdu-fonts` lets a user compare their real text and continue to creation tools;
- selected fonts survive handoff and authoritative export where supported;
- mobile + Urdu shaping + mixed bidi fixtures pass;
- no major route pays the full font-library cost unnecessarily;
- SEO ownership is documented and non-cannibalizing;
- acceptance matrix and post-launch evidence closeout are complete.
