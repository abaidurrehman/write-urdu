# WU-FONT-001 — Market & License Evidence

**Captured:** 2026-09-13  
**Purpose:** product-shape evidence for `WU-FONT-001`, plus release-gate notes for candidate fonts.  
**Important:** this document records product research, not legal advice. Before bundling any new binary, preserve the exact authoritative license text/source and review the intended redistribution/web-embedding use.

## 1. Market signal

### Urdu Nigaar — Urdu Font Preview

Source: https://www.urdu-nigaar.com/tools/urdu-font-preview/

Observed product pattern:

- dedicated font-preview route;
- user can compare their Urdu across multiple stacks;
- current FAQ names eight stacks including Jameel Noori Nastaleeq, Noto Nastaliq Urdu, Mehr Nastaliq Web, Noto Naskh Arabic and Scheherazade New;
- it acknowledges that some named fonts may fall back depending on availability.

Implication for Write-Urdu:

The comparison job is real. Our opportunity is to be stricter about truthful font availability and connect the selected result into creation workflows.

### Urdu Nigaar — Urdu Fonts directory

Source: https://www.urdu-nigaar.com/urdu-fonts/

Observed product pattern:

- font discovery is a central product surface;
- popular font cards/guides;
- preview-first flow;
- original-source/download orientation;
- strong coverage of classic Pakistani font names.

Implication:

Do not compete on raw directory count. Connect typography choice to Card Studio, Name Art and Rich Editor.

### UrduKhaber — Urdu Font Previewer

Source: https://urdukhaber.com/tools/typography-and-fonts/urdu-font-previewer/

Observed product pattern:

- browser-local text preview;
- font size/weight controls;
- explicit explanation of web fonts vs system fonts;
- own-text comparison is the core job.

Implication:

Confirms the value of `type once → compare`. Write-Urdu should add destination continuity rather than more generic controls.

### AlphaFonts Urdu

Source: https://alphafonts.com/languages/urdu

Observed product pattern:

- Urdu font catalog/generator presentation;
- distinguishes some desktop/download-required faces from web previews;
- explicitly notes that a named desktop font can be represented by a different web preview when embedding is unavailable.

Implication:

This is a useful warning: Write-Urdu must not visually impersonate unavailable fonts. If Jameel Noori is not installed/shippable, say so rather than render Noto and label it Jameel.

## 2. Academic/quality signal

### DARYAFT — technical comparison of selected Urdu fonts

Source: https://daryaft.numl.edu.pk/index.php/daryaft/article/view/404

The published abstract compares Pak Nastaliq, Jameel Noori Nastaliq, Faiz Lahori, AlQalam Taj Nastaliq and Mehr Nastaliq Web against traditional Nastaliq calligraphic standards and reports Mehr Nastaliq Web as the strongest among the compared set.

Product implication:

Mehr is a high-priority web candidate not merely because it is available, but because there is published technical comparison supporting its calligraphic quality.

## 3. Candidate license/source notes

### Noto Nastaliq Urdu / Noto Naskh Arabic

Current state: already used in product through Google Fonts.

Action:

- preserve existing source/license metadata in new registry/evidence model;
- do not change default behavior in this epic without separate approval.

### Amiri / Lateef / Scheherazade New / Tajawal / Harmattan / Katibeh

Current state: already used in Card Studio/Name Art and/or Rich Editor through Google-hosted CSS.

Action:

- record official/Google source metadata;
- map current family strings to stable IDs;
- benchmark which should be shared across all creation surfaces.

### Mehr Nastaliq Web

Official product/source page: https://mehrtype.com/product/mehr-nastaliq-web/

Observed authoritative claims:

- developed for web publishing and mobile applications;
- OpenType, character-based Lahori Nastaliq;
- aeraab/marks support;
- limited Kashida support;
- reduced line height;
- project associated with Mehr Type and CSaLT at Information Technology University, Lahore;
- source page publishes a Creative Commons-style commercial-use statement requiring credit and identical/share-alike licensing for derived work.

Release gate:

- preserve exact license text/source;
- review whether direct redistribution of the unmodified font and any WOFF2 conversion are compatible with our intended delivery;
- record attribution/share-alike obligations;
- only then move from `license-review` to `approved-web`.

### Nafees Nastaleeq

Candidate source family is associated with CRULP/FAST-NU.

Secondary evidence indicates a permissive reproduction/distribution license, but the epic requires the original/authoritative license source before bundling.

Release gate:

- locate original project/license;
- verify web embedding/redistribution and modification rights;
- test modern browser shaping and line metrics;
- only then approve.

### Awami Nastaliq

Known as an open-source Nastaliq family from SIL.

Release gate:

- use official SIL/GitHub source;
- preserve OFL/license evidence;
- benchmark size, shaping quality and web performance before adding.

### Jameel Noori Nastaleeq / Jameel Noori Kasheeda

Market importance: very high; users recognize these names strongly.

Risk: downloadable copies are widespread, but mirror availability is not sufficient proof of web redistribution rights.

Policy:

- `approved-system-reference` / `license-review` only until authoritative rights are established;
- preview as the actual font only when installed locally or after a future approved web-delivery decision;
- never bundle from a random archive;
- never render Noto fallback while labelling it as Jameel.

### AlQalam Taj Nastaleeq

Market/design relevance: high for decorative/title use and included in published technical font comparison.

Policy:

- locate original AlQalam source/license rather than rely on download mirrors;
- verify web embedding/redistribution;
- evaluate as decorative/heading capability, not global reading default.

### AA Sameer Sagar

Market/design relevance: decorative social graphics, thumbnails and title treatment.

Policy:

- license-review;
- no binary until original creator/source evidence is found;
- if approved, likely Card Studio/Name Art capability only rather than Rich Editor/body reading.

### Gandhara Suls / Sulus Unicode

Market/design relevance: calligraphic heading/title treatment.

Policy:

- license-review;
- no binary until authoritative source/license is established;
- likely decorative capability only.

## 4. Strategic gap

Competitors largely optimize one of these loops:

```text
find font → preview → download
```

or

```text
type text → preview font → stop
```

Write-Urdu can own:

```text
type/speak/transliterate
→ preview actual Urdu typography
→ choose
→ create/share/export
```

That is the reason this epic should be product-integrated rather than a standalone SEO directory.

## 5. SEO/query ownership hypothesis

Proposed route map:

```text
/urdu-fonts
interactive Urdu font preview / compare / choose

/urdu-fonts-nastaliq-vs-naskh
informational comparison of the two broad typographic traditions

/stylish-urdu-text-generator
copyable Unicode decorations; destination app controls actual font

/urdu-name-art-maker
exact image output for names

/urdu-card-studio
exact image output for general Urdu text/cards
```

Do not launch individual font pages until query evidence and unique content justify them.

## 6. Recommended initial font tiers

### Tier A — dependable existing web set

```text
Noto Nastaliq Urdu
Noto Naskh Arabic
Amiri
Lateef
Scheherazade New
Tajawal
```

### Tier B — verify and prioritize

```text
Mehr Nastaliq Web
Awami Nastaliq
Nafees Nastaleeq
```

### Tier C — market-recognizable but rights-sensitive

```text
Jameel Noori Nastaleeq
Jameel Noori Kasheeda
AlQalam Taj Nastaleeq
AA Sameer Sagar
Gandhara Suls
```

Tier C names can still create SEO/user-recognition value through truthful system/reference cards while licensing is unresolved.

## 7. Product recommendation

Build in this order:

```text
registry + evidence
→ converge existing creation tools
→ first newly approved Pakistani web font
→ /urdu-fonts compare MVP
→ handoffs
→ public indexing
→ evidence-gated catalog expansion
```

This order produces product value even if some famous fonts never pass the redistribution gate.
