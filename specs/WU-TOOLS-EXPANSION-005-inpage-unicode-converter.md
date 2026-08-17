# WU-TOOLS-EXPANSION-005 — InPage ↔ Unicode Urdu Converter

Status: Implemented / P1
Parent: WU-TOOLS-EXPANSION-001
Date: 2026-08-17

## 1. Problem

A large body of Urdu text still exists in legacy InPage-oriented encodings/workflows. Users often need to move text between legacy publishing systems and modern Unicode applications.

The common job is text conversion, not necessarily parsing complete `.inp` document files.

## 2. Product promise

Convert pasted legacy InPage-compatible Urdu text to Unicode, and convert Unicode Urdu back to a supported legacy InPage text representation — entirely in the browser.

The page must be precise about which legacy encoding/mapping is supported. “InPage” is not one magic universal encoding and the tool must not imply arbitrary `.inp` binary document compatibility.

## 3. Route and title

Implemented route: `/tools/inpage-unicode-converter/`

Working title: `InPage to Unicode Urdu Converter — Both Directions`

Query families:
- InPage to Unicode
- Unicode to InPage
- Urdu InPage converter
- InPage Urdu text converter
- old Urdu text to Unicode

## 4. V1 scope

Two explicit modes:

### A. InPage/legacy text → Unicode Urdu

Input: pasted/copyable legacy encoded text using the documented `inpage-v1v2-clipboard-2026-08-17` profile.

Output: Unicode Urdu suitable for modern browsers, Word, messaging and WriteUrdu.

### B. Unicode Urdu → InPage/legacy text

Input: Unicode Urdu.

Output: text represented using the documented supported legacy mapping for workflows that still require it.

V1 does not parse, preserve layout from, or generate arbitrary `.inp` binary files.

## 5. Research gate — completed

Research and provenance are documented in `docs/WU-INPAGE-MAPPING-RESEARCH-2026-08-17.md`.

Findings:
- the targeted legacy text representation uses the InPage v1/v2-style `0x04` prefix plus an 8-bit character index;
- Windows-1252-range byte values can surface as punctuation-like Unicode characters when legacy text is pasted;
- common Urdu letters, numerals, diacritics, punctuation and four composite sequences have corroborated mappings;
- some observed bytes remain undocumented/uncertain and must not be guessed;
- Arabic-mode overrides exist and are out of the Urdu V1 scope;
- full browser-side `.inp` parsing appears technically feasible as a later phase, but is not required for V1;
- no paid API is required.

Implementation is independently written. GPL converter code is research-only and is not incorporated. Relevant MIT/open interoperability references are documented rather than shipped as runtime dependencies.

## 6. Conversion engine

The implemented browser module provides:
- a versioned mapping profile;
- forward and reverse mapping functions;
- composite-sequence handling before single-byte mapping;
- stable preferred reverse mappings for the reversible subset;
- explicit unsupported-character reporting;
- preservation of unsupported input rather than guessed substitution;
- deterministic round-trip tests for the supported reversible subset.

Conversion does not depend on a paid API or server request.

## 7. UX

Workspace:
1. direction selector: `InPage → Unicode` / `Unicode → InPage`;
2. source textarea;
3. `Convert` action;
4. conversion summary;
5. result textarea;
6. warning list for unsupported/ambiguous characters;
7. `Copy result`;
8. for Unicode output: `Clean text` and `Open in WriteUrdu`;
9. swap-direction action that intentionally moves current result to source;
10. local example for validating each direction.

Source is never overwritten automatically.

## 8. Transparency

Show:
- mapping/version supported;
- conversion direction;
- unsupported-character/review count;
- note that font selection alone does not convert text encoding;
- note that document formatting/layout is not preserved;
- warning when forward input contains no supported InPage prefix markers.

## 9. Cleaner integration

InPage → Unicode output can flow to the Urdu Text Cleaner, but conversion and cleaning remain separate explicit actions so users can inspect the raw converted result.

## 10. Privacy

- all conversion runs locally;
- no pasted text or result is sent to WriteUrdu servers by converter code;
- no source/result is persisted beyond explicit session handoff;
- generic telemetry may record bounded page/tool actions but never source/result contents.

## 11. Testing corpus

Implemented fixture coverage includes:
- core Urdu letters;
- Urdu digits;
- punctuation;
- composite sequences;
- mixed Latin + Urdu;
- reversible Urdu phrase round trip;
- unknown legacy values preserved unchanged;
- unsupported Unicode preserved unchanged;
- browser test for both conversion directions.

Research backlog retains additional real legacy fixtures from legally available sources for future compatibility expansion.

## 12. Failure handling

The tool never returns apparently clean but silently guessed text.

When unsupported input exists:
- preserve it where possible;
- flag it;
- show a review count and warning;
- never substitute guessed Urdu letters without a documented mapping rule.

## 13. SEO/content

The public page explains:
- Unicode vs legacy Urdu encoding;
- why old InPage text may paste as incorrect characters;
- difference between text conversion and `.inp` file conversion;
- how to move converted text into Cleaner/WriteUrdu;
- both-direction support and limitations.

## 14. Telemetry

Allowed:
- page/tool engagement;
- mode in bounded future telemetry;
- conversion success/failure in bounded future telemetry;
- input length bucket in bounded future telemetry;
- unsupported-character count bucket in bounded future telemetry;
- copy/clean/editor handoff.

Forbidden:
- source/result text;
- unsupported character values in telemetry;
- document/file names.

## 15. Acceptance criteria

- [x] Mapping provenance documented before release.
- [x] Forward fixtures convert correctly.
- [x] Reversible subset passes round-trip tests.
- [x] Unsupported characters are surfaced rather than guessed.
- [x] Both directions work without server calls.
- [x] Source remains unchanged.
- [x] Result is copyable.
- [x] Unicode result hands off to Cleaner/editor.
- [x] No claim of arbitrary `.inp` file support appears in page copy.
- [x] Active workspace is protected from ad placement; monetization begins after the workspace boundary.
- [x] Browser acceptance covers both directions on desktop/mobile projects.
- [x] Core site regression suite remains part of the release gate.

## 16. Future phases

Only after V1 usage validates demand:
- support additional known legacy mappings;
- investigate `.inp` file import using a separately reviewed browser parser and fixtures;
- support InPage v3/document-mode distinctions where evidence justifies it;
- batch file conversion;
- formatting-aware migration helpers.
