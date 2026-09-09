# WU-JOURNEY-001B — Roman Urdu Benchmark Foundation

**Date:** 2026-09-09  
**State:** B0/B1 implementation complete on feature branch; B2 live provider baseline pending execution/review  
**Production behavior changed:** No

## What this slice adds

The first implementation slice establishes reproducible quality infrastructure before any transliteration change:

- 106 curated, authored fixtures;
- eight required benchmark families;
- explicit support for exact, accepted-set, suggestion-containing, preserve-token and manual-review assertions;
- Google Input Tools response parsing;
- a production-like multiline/chunk runner for the current bulk path;
- local direct-mode protection checks that do not call a provider;
- category-level scoring instead of one opaque global number;
- a contract test wired into `npm test`;
- a CLI command for generating JSON or Markdown baseline reports.

No production writer, Google loader, Space conversion, suggestion UI, Backspace behavior, input-mode code, telemetry or user-facing copy is changed.

## Corpus composition

The seed corpus contains 106 public-safe authored examples across:

1. `canonical_phonetic`
2. `spelling_variant`
3. `texting_shorthand`
4. `code_switching`
5. `names_entities`
6. `long_paste`
7. `suggestion_recovery`
8. `direct_urdu_protection`

It includes cases covering common Roman variation, religious/common phrases, English product terms, names/cities, URLs, handles, email-shaped strings, PKR/prices, phone-number shapes, dates/times, units, emoji, multiline message-style content and direct Urdu protection.

This is intentionally a high-quality seed rather than pretending B0 already meets the final 250–500 release-gate target. Expand the corpus after the first baseline reveals where more coverage is valuable.

## How to run

Full live benchmark:

```bash
npm run benchmark:roman-urdu -- --out docs/WU-JOURNEY-001B-ROMAN-URDU-BASELINE-2026-09-09.md
```

Single category:

```bash
npm run benchmark:roman-urdu -- --category spelling_variant --out /tmp/roman-variants.md
```

Small smoke sample:

```bash
npm run benchmark:roman-urdu -- --limit 10
```

The live run calls the same Google Input Tools endpoint family used by WriteUrdu's current bulk transliteration path. It should therefore be run intentionally, not as a normal CI test. Contract tests validate corpus/schema/scoring behavior without sending authored fixtures to the provider.

## B2 baseline review questions

The first live report must answer:

- Which common spelling variants fail to surface a reasonable candidate?
- Are failures mostly first-candidate ranking or complete suggestion absence?
- Which Latin/code-switched token classes are damaged by provider conversion?
- Does the production-like multiline runner preserve message structure?
- Are names/cities materially weaker than ordinary vocabulary?
- Are religious/common phrases genuinely ambiguous rather than product defects?
- Which failures can be solved by UX/suggestion recovery instead of provider/preprocessing changes?

## Decision rule after baseline

Do not implement a fuzzy matcher or provider change from anecdotal examples.

Rank every meaningful failure as one of:

- `no_change` — acceptable ambiguity/current behavior;
- `ux_recovery` — candidate exists but recovery/discovery is weak;
- `bounded_transform` — deterministic pre/post-processing candidate;
- `rendering_fix` — mixed-direction issue rather than transliteration;
- `provider_investigation` — provider-level gap not safely addressable elsewhere.

Only one targeted candidate should be tested in B3 at a time against the full benchmark.
