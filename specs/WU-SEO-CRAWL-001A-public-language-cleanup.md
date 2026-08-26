# WU-SEO-CRAWL-001A — Public Language Cleanup

**Parent:** `WU-SEO-CRAWL-001`  
**Status:** Planned  
**Priority:** P0 — first implementation slice

## Goal

Remove implementation, SEO-strategy, prompt and engineering language that leaked into public/indexable WriteUrdu copy, while preserving truthful user-facing technical terms and established query ownership.

## Scope

Primary routes:

- `/how-to-write-urdu-on-photo`
- `/urdu-name-art-maker`
- `/how-to-share-urdu-writing-online`
- `/tools/inpage-unicode-converter`
- `/urdu-ocr`
- `/write-urdu-sitemap`
- `/english-urdu-typing-tutorial`
- `/urdu-instagram-post-maker`
- `/write-urdu-privacy` (careful pass only)

Secondary QA:

- `/changelog`
- `/why-write-urdu`
- `/write-urdu-features`
- `/urdu-text-cleaner`
- `/roman-urdu-transliteration`
- `/urdu-fonts-nastaliq-vs-naskh`

## Language rule

A public sentence is acceptable when it helps the user answer one of these questions:

1. What can I do here?
2. What do I need to provide?
3. What will I get?
4. What should I check before using/sharing the result?
5. What leaves my device or becomes public?
6. What limitation materially affects my task?

A sentence should be removed or rewritten when it primarily explains:

- internal architecture;
- route consolidation strategy;
- search keyword strategy;
- rendering method;
- data-model field names;
- internal version/mapping/config identifiers;
- telemetry implementation;
- deployment/vendor/runtime detail not needed for informed user choice.

## Required rewrites

### Photo guide

Remove wording about avoiding a different tool for every phrase people search. Replace with direct use-case language.

### Name Art

Replace architecture phrases such as `one direct workspace`, `second tool embedded`, `direct canvas`, `live canvas and controls` with task language.

### Sharing guide

Translate these concepts into user language:

| Internal concept | Public explanation |
| --- | --- |
| server-rendered social metadata | supported apps can show a preview when the link is shared |
| provenance | the public page clearly shows it was created/shared through WriteUrdu |
| immutable snapshot | a shared link keeps the version published at that time |
| management token | the browser that created the link can receive a private delete/manage capability; do not expose token mechanics |
| discovery feeds | whether public content appears in search/listing surfaces |
| operational metadata | only describe the minimal information actually collected and why |

Do not weaken warnings that publication makes content public.

### InPage converter

Keep `InPage` and `Unicode`. Remove byte/mapping implementation descriptions and internal version identifiers unless a version name is a real user-supported compatibility label.

### OCR

Replace CDN/runtime implementation with first-use and quality expectations. Keep clear printed Urdu/Naskh guidance if accurate.

### Human sitemap

Every tool description should be an outcome sentence. Avoid `browser-local`, `safe-area`, telemetry, implementation/runtime and engineering framing unless required to identify the user job.

### Tutorial

Remove any migration/URL-retention/continuity note intended for maintainers or SEO operations.

### Privacy

Preserve disclosures, but prefer:

- `we collect a count of...` over internal event/field language;
- `used to prevent abuse` over infrastructure implementation;
- `stored in your browser` over storage-engine naming unless the storage mechanism materially matters;
- third-party processor names when disclosure is meaningful/required.

## Guardrails

Do not:

- change canonical URLs;
- change the homepage title/H1/search description;
- remove `Unicode` from the InPage converter;
- remove `Nastaliq`/`Naskh` from font-specific guidance;
- replace all `Roman Urdu`/`transliteration` occurrences mechanically; those terms remain valid on the dedicated specialist guide and where explaining the difference from translation;
- remove privacy disclosures simply because they sound technical;
- rewrite user-facing dimensions such as `1080 × 1920` when they help users choose an output.

## Acceptance criteria

- [ ] No public/indexable page explains the site's SEO page strategy.
- [ ] No public page exposes internal-looking config/version/mapping identifiers.
- [ ] Name Art copy describes the user task, not embedding/workspace architecture.
- [ ] Sharing guide explains publish/version/delete/privacy behavior without implementation jargon.
- [ ] InPage copy keeps necessary compatibility terminology but removes byte-level/internal mapping detail.
- [ ] OCR copy contains no unnecessary CDN/runtime wording.
- [ ] Human sitemap descriptions are task/outcome-led.
- [ ] Tutorial contains no maintainer-only URL migration note.
- [ ] Privacy remains factually equivalent after simplification.
- [ ] Search title/H1/canonical/hreflang ownership is unchanged.

## Tests

Add a focused static contract that scans public HTML for banned phrases/identifiers found in this audit. The banned list must be narrow and evidence-based, not a generic ban on words such as `Unicode` or `JavaScript`.

At minimum protect against recurrence of phrases/concepts equivalent to:

- `without creating a different tool for every phrase people search`;
- `There is no second WriteUrdu tool embedded`;
- `Existing tutorial URL retained for continuity`;
- known internal InPage mapping/version identifier(s).

Also assert required user-language replacements exist on the affected routes.

## Verification

```bash
npm test
node scripts/check-seo.js
```

Then source-view representative affected pages and confirm no metadata/canonical changes were introduced.