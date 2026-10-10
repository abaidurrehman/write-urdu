# WU-FONT-001 — Architecture Contract

**Parent:** `WU-FONT-001-urdu-typography-font-discovery-platform.md`  
**Status:** Planned / implementation-ready after Slice 0 evidence capture  
**Scope:** registry, loading, rendering truth, cross-tool integration, performance, licensing boundaries

## 1. Runtime ownership

Introduce one shared, product-neutral Urdu font registry. Proposed location:

```text
js/urdu-font-registry.js
```

The registry owns capabilities and metadata. It does not own UI.

Expected consumers:

```text
Card Studio
Name Art
Rich Editor adapter
/urdu-fonts previewer
future card/font recommendation surfaces
```

Do not create separate font arrays per consumer after this registry exists.

## 2. Registry API

Prefer a small explicit API, for example:

```js
listFonts()
getFont(id)
listFontsFor(capability)
resolveFamily(id)
isWebRenderable(id)
isSystemAvailable(id)
ensureFontLoaded(id, size, weight)
```

Exact names may differ, but the module must make capability filtering easy and deterministic.

A frozen/copy-safe return value is preferable so page code cannot mutate canonical metadata.

## 3. Stable IDs

Font IDs are internal stable identifiers, not display names.

Examples:

```text
noto-nastaliq-urdu
noto-naskh-arabic
amiri
lateef
scheherazade-new
tajawal
mehr-nastaliq-web
jameel-noori-nastaleeq
```

Once used in saved Card Studio projects or handoff payloads, IDs become compatibility contracts.

Do not use raw family strings as persistence keys.

## 4. Capability model

A font may support different surfaces differently.

Minimum capability flags:

```text
webPreview
cardCanvas
nameArtCanvas
richEditor
systemReference
```

Do not infer canvas/export capability from the mere existence of a CSS font-family name.

## 5. Delivery model

Supported delivery states:

```text
google
self-hosted
system
```

### Google/service fonts

Existing approved families may continue to use Google-hosted delivery initially. Avoid duplicate stylesheet declarations across sibling pages as the registry matures.

### Self-hosted

Only after license approval. Prefer same-origin WOFF2. Preserve original license/credits in repository documentation and any required attribution surface.

### System

No binary is shipped. Availability is checked locally. If unavailable, the UI states that truthfully.

## 6. Font loader

Build/reuse one loader with these guarantees:

```text
same font request is deduplicated
requested weight/size is awaitable
Font Loading API readiness is honored
failure is observable
canvas/export can require strict success
DOM preview may degrade gracefully where product copy remains truthful
```

Suggested behavior:

```js
await ensureFontLoaded(fontId, { size: 64, weight: 400, strict: true })
```

Do not let Card Studio silently export a fallback while preserving a different selected `fontId`.

## 7. CSS and asset contract

For approved self-hosted fonts:

```text
fonts/<font-id>/...
```

or another existing project convention may be used, but each family must keep:

```text
LICENSE / license reference
SOURCE.md or registry source URL
WOFF2 asset(s)
optional original format only if redistribution allows and there is a product reason
```

Do not commit TTF/OTF merely as archival duplicates when WOFF2 is sufficient for the web product.

## 8. OpenType preservation

Nastaliq relies heavily on shaping tables.

Any conversion/subsetting pipeline must preserve the OpenType features required for Urdu shaping. Before adopting subsetting, compare rendered fixtures against the unmodified source across Chrome/Edge/Safari/Firefox where practical.

No size optimization is accepted if it introduces broken joining, misplaced marks, ligature loss or vertical clipping.

## 9. Preview rendering

The `/urdu-fonts` grid uses DOM text, not canvas-per-card.

Each preview card contains:

```text
real text node
lang="ur"
dir="rtl" (or safe auto handling for mixed text)
font-specific family
font-specific line-height metadata
stable preview box
```

Use `IntersectionObserver` or equivalent only where measured useful. Do not prematurely virtualize a small collection.

## 10. System-font detection

A system font must not be labelled visually available merely because CSS accepts the family name.

Use a bounded detection strategy such as Font Loading API plus measured fallback comparison where necessary. The product state must be one of:

```text
available on this device
not available on this device
unknown / browser cannot verify reliably
```

If detection is uncertain, prefer explicit uncertainty over false confidence.

## 11. Card Studio integration

Card Studio currently waits for fonts before canvas draw/export. Preserve and harden this path.

Migration sequence:

1. map current family strings to stable registry IDs without breaking saved projects;
2. populate font selector from registry capability `cardCanvas`;
3. resolve ID → family only at rendering boundary;
4. strict-load selected font before text measurement/export;
5. on failure, stop or require an explicit safe fallback rather than silently misrepresenting output;
6. keep existing background/template behavior untouched.

Backward compatibility must accept old projects that stored only a family string.

## 12. Name Art integration

Name Art should consume the same `cardCanvas`/`nameArtCanvas` subset where appropriate.

Do not create a separate decorative font taxonomy for Name Art. Use shared metadata and page-specific filtering.

## 13. Rich Editor adapter

TinyMCE may require a serialized `font_formats` string and iframe `content_css`/font-face access.

Create an adapter around the registry rather than pushing TinyMCE-specific fields into every registry record.

The adapter should:

```text
preserve existing Latin/system editor fonts
inject governed Urdu families
load selected approved web fonts inside editor content iframe
avoid duplicate font downloads where browser caching already handles them
```

No TinyMCE version migration is part of this epic.

## 14. Handoff format

Versioned local handoff payload:

```js
{
  version: 1,
  source: 'urdu-fonts',
  destination: 'card-studio' | 'name-art' | 'rich-editor',
  text: '...',
  fontId: 'noto-nastaliq-urdu'
}
```

Store using existing bounded local/session handoff patterns where possible.

Never put text into the URL.

Destination validates:

```text
known source
known destination
known fontId
capability supported
text length within existing bound
```

Unknown/stale font IDs fall back safely with a visible explanation where material.

## 15. Persistence compatibility

If Card Studio currently persists `fontFamily`, migration may temporarily persist both:

```text
fontId
fontFamily (legacy compatibility)
```

New code should prefer `fontId` while old saved projects continue to resolve by normalized family string.

Do not invalidate existing local projects solely to introduce registry IDs.

## 16. Performance architecture

Global pages:

```text
load normal site fonts only
no decorative font catalog
```

Font preview page:

```text
load default/first visible group
lazy-load other groups
cache loaded promises
avoid reflow storms while fonts settle
```

Creation tools:

```text
load only selector/default + selected family as needed
strict-load before canvas export
```

Do not inject every @font-face into every page if a narrower route-scoped stylesheet/module is sufficient.

## 17. Failure modes

Explicitly test:

```text
font CDN unavailable
self-hosted WOFF2 missing/404
font load times out/rejects
system-only font absent
saved project references removed/renamed font
handoff references unsupported font
canvas render requested before load
Rich Editor iframe font unavailable
```

The product must remain usable and truthful.

## 18. Security/privacy

Font metadata is static allowlisted data.

Do not allow arbitrary user-provided font URLs, CSS URLs, remote stylesheets or font-family injection into controlled render paths.

Font handoff resolves only registered IDs.

No user's preview text is sent with font-loading requests beyond normal browser URL/referrer behavior of the font host. Prefer same-origin hosting for approved self-hosted assets where practical.

## 19. Testing layers

### Source tests

- registry schema and unique IDs;
- allowed enum values;
- license status required;
- approved self-hosted font must have source/license metadata;
- capabilities consistent with delivery state;
- no unapproved asset URL.

### Unit tests

- family resolution;
- legacy family → ID normalization;
- capability filtering;
- loader promise deduplication;
- handoff validation.

### Browser tests

- selected web font becomes available via `document.fonts`;
- system-unavailable state is truthful;
- preview grid does not clip canonical Urdu fixtures;
- Card Studio export waits for selected font;
- selected font survives handoff.

### Visual/manual acceptance

- Nastaliq ligatures;
- marks/diacritics;
- poetry line spacing;
- mixed Urdu/Latin/digits;
- mobile Safari and Android Chrome;
- PNG export parity.

## 20. Hard stop conditions

Stop implementation and report rather than proceeding if:

- a font's redistribution/web-embedding rights cannot be established;
- a proposed optimization breaks shaping tables;
- the new registry would invalidate saved Card Studio projects;
- public preview cards claim a system font is rendered when it is not;
- implementation requires loading the full font catalog on Basic Writer;
- a new public route duplicates the existing Nastaliq-vs-Naskh guide instead of owning interactive intent.
