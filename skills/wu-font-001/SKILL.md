# WU-FONT-001 — Urdu Typography & Font Discovery Skill

Use this skill when planning, implementing, reviewing or testing `WU-FONT-001`.

This epic creates one governed Urdu font system plus an eventual interactive font-comparison route. It is **not** permission to download popular fonts from mirrors, ship a generic font directory, rewrite TinyMCE, or load a large font catalog globally.

---

## Mandatory read order

1. `specs/BACKLOG.md`
2. `specs/WU-FONT-001-urdu-typography-font-discovery-platform.md`
3. `specs/WU-FONT-001-ARCHITECTURE-CONTRACT.md`
4. `specs/WU-FONT-001-IMPLEMENTATION-CHECKLIST.md`
5. `specs/WU-FONT-001-ACCEPTANCE-MATRIX.md`
6. `docs/WU-FONT-001-MARKET-LICENSE-EVIDENCE-2026-09-13.md`
7. `specs/WU-CARD-GALLERY-001-live-urdu-card-gallery.md`
8. `specs/WU-PLAT-002H-core-activation-feature-discovery.md`
9. `specs/WU-PLAT-002H-SCOPE-FREEZE.md`
10. current `css/design-tokens.css`
11. current Card Studio HTML/JS/core + tests
12. current Name Art HTML/JS + tests
13. current `urdu-editor.html` / TinyMCE configuration + editor tests
14. current `/urdu-fonts-nastaliq-vs-naskh` and `/stylish-urdu-text-generator`
15. current SEO/public-route/service-worker/locale governance
16. `package.json`

Search the current repository before coding. Runtime code and tests are authoritative for shipped behavior.

---

## Core product job

```text
type once
→ see the same real Urdu text in trustworthy fonts
→ understand the style/use case
→ choose a font
→ continue to Card Studio / Name Art / Rich Editor
```

The value is **font choice connected to creation**, not download volume.

---

## Slice order

```text
Slice 0   current-state audit + license evidence + perf/shaping baseline
Slice 1   shared Urdu font registry + loader
Slice 1B  Card Studio / Name Art / Rich Editor convergence
Slice 1C  first newly approved Pakistani web-font candidate
Slice 2   /urdu-fonts browser-local comparison MVP (initially gated/noindex)
Slice 3   cross-tool handoffs + bounded telemetry
Slice 4   focused 2–4 font comparison + deterministic use-case guidance
Slice 5   SEO/public discovery release after acceptance
Slice 6   evidence-gated catalog/guide expansion
```

Do not start with a public page before the registry/evidence foundation.

---

## Licensing hard gate

**Never add a font binary because a download site says it is free.**

Before any new binary enters the repository, record:

```text
canonical font name
original author/foundry
original/authoritative source URL
license source/text
commercial-use status
web-embedding status
redistribution status
modification/WOFF2/subsetting status
attribution requirement
share-alike requirement
review date
```

If evidence is ambiguous:

```text
licenseStatus = license-review
```

and the font remains system/reference-only.

Treat these as license-sensitive until proven otherwise:

```text
Jameel Noori Nastaleeq
Jameel Noori Kasheeda
AlQalam Taj Nastaleeq
AA Sameer Sagar
Gandhara Suls
```

Mehr Nastaliq Web is high priority, but its official license statement still needs exact evidence preserved and redistribution/derivative obligations reviewed before bundling.

---

## Preview truth rule

A named font preview must use that font.

Never do this:

```text
label: Jameel Noori Nastaleeq
actual render: Noto Nastaliq fallback
```

For local/system faces expose:

```text
Installed on this device
Not installed on this device
Cannot verify in this browser
```

A truthful unavailable card is better than a fake preview.

---

## Shared registry discipline

Proposed canonical module:

```text
js/urdu-font-registry.js
```

Stable record shape should remain bounded and capability-driven:

```text
id
family
displayName
displayNameUr
style
delivery
licenseStatus
sourceUrl
licenseUrl
weights
defaultWeight
lineHeight
fallback
recommendedFor
exportSupport
capabilities
priority
assetUrl (approved only)
attribution (optional)
```

Do not place page copy or SEO metadata in registry records.

Do not duplicate arrays in Card Studio, Name Art and Rich Editor after migration.

---

## Stable ID discipline

Persist registry IDs, not display strings.

Example:

```text
noto-nastaliq-urdu
mehr-nastaliq-web
```

Old Card Studio projects may contain family strings; provide compatibility mapping.

Never break existing local projects to achieve a clean migration.

---

## Font loading discipline

Global site:

```text
keep current light Urdu stack
```

Comparison route:

```text
load first useful fonts
lazy-load later preview groups
cache loader promises
```

Creation/export:

```text
strict-load selected family
await Font Loading API readiness
measure/layout only after load
export only after real family is ready
```

No full font catalog on Basic Writer.

---

## Nastaliq shaping discipline

Nastaliq quality depends on OpenType shaping.

Do not perform naive font subsetting.

Any WOFF2 conversion or subset optimization must preserve required layout tables and pass real Urdu visual fixtures.

Canonical fixtures need:

```text
short Urdu phrase
ligature-heavy prose
multi-line poetry
aeraab/marks
Urdu digits
Western digits
Urdu + English name/code/URL
explicit line breaks
Kashida/tatweel where font supports it
```

No Latin lorem ipsum acceptance.

---

## Card Studio discipline

Card Studio already has a font-readiness path before canvas rendering/export.

Preserve it and make it registry-aware.

Migration rules:

1. keep current default stable;
2. preserve all currently shipped font families;
3. map legacy family strings to IDs;
4. selector is registry-backed;
5. selected font is strict-loaded before fit/measurement;
6. export uses actual selected family;
7. failure never silently masquerades as success;
8. do not alter backgrounds/templates as part of font migration.

---

## Name Art discipline

Name Art consumes the same governed registry.

Use page-level capability filtering for more decorative choices if needed.

Do not create a second font taxonomy.

---

## Rich Editor discipline

TinyMCE-specific requirements belong in an adapter, not in the base registry.

Preserve:

```text
current Latin/system fonts
current editing behavior
current export/print paths
```

Inject governed Urdu families into `font_formats` and iframe content font loading.

Do not migrate TinyMCE in this epic.

Explicitly reconcile current `Qadreeregular` documentation/runtime inconsistency.

---

## `/urdu-fonts` UX discipline

First useful viewport:

```text
clear title
one obvious Urdu text input
example action
first font previews
```

No article wall first.

Preview card:

```text
user's real text
font name
Nastaliq/Naskh/Decorative badge
Web font/This device badge
bounded best-for tags
single clear select/use action
```

Preview cards are DOM text, not one canvas each.

Keep color/background/layout controls in Card Studio, not here.

---

## SEO ownership discipline

Keep intent boundaries explicit:

```text
/urdu-fonts
interactive preview / compare / choose

/urdu-fonts-nastaliq-vs-naskh
education / explanation

/stylish-urdu-text-generator
Unicode decorative copy/paste; not actual embedded font

/urdu-name-art-maker
exact image output for names
```

Do not generate dozens of thin individual font pages.

Public route starts noindex/unpromoted unless backlog records an explicit exception/release decision.

---

## Handoff discipline

Use bounded local/session state and existing patterns.

Payload:

```text
version
source = urdu-fonts
destination
text
fontId
```

Never put user text into query/hash/telemetry.

Destination validates font capability.

---

## Telemetry discipline

Only content-free controlled events after allowlist review, for example:

```text
font_compare_started
font_selected { font_id }
font_destination_chosen { destination }
font_handoff_ready { destination }
font_handoff_completed { destination }
```

Never capture:

```text
preview text
poetry
names
captions
system font list
```

---

## Performance discipline

Before/after each meaningful slice record:

```text
font request count
font transfer bytes
page transfer bytes
startup/interactivity observation
typing responsiveness on representative mobile
```

Do not optimize by breaking shaping.

Do not preload all optional fonts.

---

## Testing discipline

Every slice adds focused source/unit tests.

Browser acceptance must prove actual font readiness, not merely CSS string assignment.

For approved web fonts use `document.fonts.check/load` where practical.

For canvas export verify selected family was loaded before draw and visually/manual-test representative output.

At minimum exercise current Chrome/Edge, Firefox where available, iPhone Safari and Android Chrome for the final public release.

---

## Stop conditions

Stop and report if:

- authoritative font rights cannot be established;
- WOFF2/subsetting breaks Urdu shaping;
- saved Card Studio projects would be invalidated;
- system font detection would produce deceptive labels;
- implementation loads the catalog site-wide;
- `/urdu-fonts` duplicates existing guide intent;
- selected font cannot survive a promised export/handoff;
- user content would need to enter URL or analytics.

---

## Completion report format

At the end of each slice report:

```text
Slice completed
Files changed
Fonts added/changed (with license state)
Behavior preserved
Tests run + results
Performance evidence
Manual/browser evidence
Known gaps
Roadmap/index state
Recommended next slice
```

Do not claim a font is supported merely because its name appears in the registry.
