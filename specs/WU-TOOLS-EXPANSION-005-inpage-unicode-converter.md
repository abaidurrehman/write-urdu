# WU-TOOLS-EXPANSION-005 — InPage ↔ Unicode Urdu Converter

Status: Approved / P1
Parent: WU-TOOLS-EXPANSION-001
Date: 2026-08-17

## 1. Problem

A large body of Urdu text still exists in legacy InPage-oriented encodings/workflows. Users often need to move text between legacy publishing systems and modern Unicode applications.

The common job is text conversion, not necessarily parsing complete `.inp` document files.

## 2. Product promise

Convert pasted legacy InPage-compatible Urdu text to Unicode, and convert Unicode Urdu back to a supported legacy InPage text representation — entirely in the browser.

The page must be precise about which legacy encoding/mapping is supported. “InPage” is not one magic universal encoding and the tool must not imply arbitrary `.inp` binary document compatibility.

## 3. Route and title

Suggested route: `/tools/inpage-unicode-converter/`

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

Input: pasted/copyable legacy encoded text from a documented supported source/encoding.

Output: normalized Unicode Urdu suitable for modern browsers, Word, messaging and WriteUrdu.

### B. Unicode Urdu → InPage/legacy text

Input: Unicode Urdu.

Output: text represented using the documented supported legacy mapping for workflows that still require it.

V1 does not parse, preserve layout from, or generate arbitrary `.inp` binary files.

## 5. Research gate before implementation

Before shipping the mapping, document:
- the exact legacy character encoding(s) used by target InPage versions/workflows;
- representative source samples legally available for testing;
- character mapping table provenance/licensing;
- ambiguous mappings and unsupported glyphs;
- whether contextual glyph codes rather than logical characters are present in the source representation;
- compatibility expectations when pasting the reverse-converted result back into commonly used InPage versions.

Do not copy a third-party mapping table without verifying its license/provenance.

## 6. Conversion engine

The engine should be a deterministic browser module with:
- versioned mapping tables;
- forward and reverse mapping functions;
- Unicode normalization where safe;
- explicit unsupported-character reporting;
- deterministic round-trip tests for the subset that is losslessly reversible.

Conversion must never depend on a paid API.

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
9. swap-direction action that intentionally moves current result to source.

Never overwrite source automatically.

## 8. Transparency

Show:
- mapping/version supported;
- conversion direction;
- unsupported-character count bucket;
- note that font selection alone does not convert text encoding;
- note that document formatting/layout is not preserved.

## 9. Cleaner integration

InPage → Unicode output may optionally flow through the Urdu Text Cleaner, but conversion and cleaning must remain separate explicit actions so users can inspect the raw converted result.

## 10. Privacy

- all conversion runs locally;
- no pasted text or result is sent to WriteUrdu servers;
- no source/result persisted beyond explicit session handoff;
- analytics receive only bounded action/error/length buckets.

## 11. Testing corpus

Minimum fixture coverage:
- core Urdu alphabet;
- aspirated forms/digraph-relevant characters where represented;
- punctuation;
- Western and Urdu digits;
- Arabic/Urdu yeh/kaf variants;
- common ligature/glyph representations if present;
- mixed English text;
- line breaks;
- symbols unsupported by the legacy mapping;
- forward conversion fixtures from real legacy samples;
- round-trip fixtures for reversible characters.

## 12. Failure handling

The tool should never return apparently clean but silently corrupted text.

When unsupported input exists:
- preserve it where possible;
- flag it;
- show a bounded count and review warning;
- never substitute guessed Urdu letters without a documented mapping rule.

## 13. SEO/content

Explain:
- Unicode vs legacy Urdu encoding;
- why old InPage text may paste as incorrect characters;
- difference between text conversion and `.inp` file conversion;
- how to move converted text into Word/browser/WriteUrdu;
- both-direction support and its limitations.

## 14. Telemetry

Allowed:
- mode;
- conversion start/success/failure;
- input length bucket;
- unsupported-character count bucket;
- copy/clean/editor handoff.

Forbidden:
- source/result text;
- unsupported character values;
- document/file names.

## 15. Acceptance criteria

- mapping provenance is documented before release;
- forward fixtures convert correctly;
- reversible subset passes round-trip tests;
- unsupported characters are surfaced rather than guessed;
- both directions work without server calls;
- source remains unchanged;
- result is copyable;
- Unicode result hands off to Cleaner/editor;
- no claim of arbitrary `.inp` file support appears in page copy;
- core site regression tests remain green.

## 16. Future phases

Only after V1 usage validates demand:
- support additional known legacy mappings;
- investigate `.inp` file import through documented/reverse-engineered file parsing where legally and technically appropriate;
- batch file conversion;
- formatting-aware migration helpers.