# WriteUrdu InPage ↔ Unicode Mapping Research

Date: 2026-08-17  
Feature: WU-TOOLS-EXPANSION-005  
Decision: proceed with a conservative browser-local pasted-text converter; keep full `.inp` document parsing out of V1.

## 1. Why this work is justified

The InPage → Unicode conversion problem is established, not hypothetical. C-DAC GIST documents TARSEEL specifically as an InPage-to-Unicode converter and describes bulk conversion plus cleanup for Urdu text, including Big Yeh and bracket problems. That confirms a long-lived migration need around legacy InPage content.

Modern WriteUrdu output should remain Unicode Urdu. Unicode CLDR's Urdu repertoire includes the Urdu letters used by this converter, including Urdu Kaf, Gaf, Noon Ghunna, Heh Doachashmee, Yeh and Bari Yeh, with additional Arabic/Urdu marks represented as Unicode characters.

## 2. What “InPage text” means for this V1

Research across multiple implementations shows a common InPage v1/v2 text representation based on a `0x04` prefix followed by an 8-bit character index. When this data is exposed as pasted text, bytes in the Windows-1252 range may appear as characters such as `‚`, `ƒ`, `„`, `…`, `Š`, `Œ`, `Ž`, `‘`, `’`, `“`, `”`, `•`, `–`, `—`, `˜`, `™`, `š`, `›`, `œ`, `ž` and `Ÿ` after the `U+0004` prefix.

This is why legacy InPage text can look like arbitrary punctuation when pasted into a normal Unicode editor even though the underlying byte values represent Urdu letters.

The implementation profile is named:

`inpage-v1v2-clipboard-2026-08-17`

It is intentionally narrower than the phrase “all InPage formats.”

## 3. Sources cross-checked

### C-DAC GIST TARSEEL

Source: `https://cdac.in/index.aspx?id=print_page&print=mlc_gist_tarseel`

Use: establishes the real InPage → Unicode migration job and known cleanup problems. We do not use C-DAC program code or data.

### Unicode CLDR Urdu repertoire

Source: `https://unicode.org/cldr/charts/49/summary/ur.html`

Use: validates modern Urdu code points and common auxiliary Arabic/Urdu characters. This is the target representation after conversion.

### inpage-format

Repository: `iamahsanmehmood/inpage-format`  
License declared by repository: MIT  
Relevant documentation: `specs/05-character-maps.md`, `lib/javascript/src/char-maps.ts`

The project documents InPage v1/v2 as a `0x04` prefix plus character-index byte and provides a larger reverse-engineered byte→Unicode table, composites, Arabic-mode overrides and known unknown bytes. It also demonstrates that browser-side `.inp` decoding is technically possible for a later phase.

Important provenance caveat: its character-map source comments say the table was cross-referenced against earlier open-source converters including GPL code as well as reverse engineering. WriteUrdu therefore does **not** vendor or copy that implementation. We use the published interoperability facts only as one cross-check and independently express our own conservative mapping module.

### zanysoft/unicode-inpage-converter

Repository: `zanysoft/unicode-inpage-converter`  
License declared by repository: MIT

This implementation is useful for cross-checking how raw InPage byte indexes surface through a Windows-1252-like pasted-text representation. Its README states that it was inspired by the older `umer0586/unicode-inpage-converter`, whose successor repository is GPL-3.0. For that reason WriteUrdu does not copy its implementation either.

### UmerCodez/unicode-inpage-converter

Repository: `UmerCodez/unicode-inpage-converter`  
License: GPL-3.0

Research reference only. No source code is incorporated into WriteUrdu.

## 4. Legal/provenance implementation decision

The V1 converter is independently written JavaScript. It does not import, bundle or depend on any third-party converter at runtime.

The mapping is treated as an interoperability fact set and is deliberately conservative. A mapping is included only where the same byte/character relationship is corroborated across the researched material or is a standard Urdu Unicode target. No GPL implementation code is copied.

Because the upstream MIT projects helped validate the factual map, their names and licences remain documented here for provenance even though no package is shipped.

## 5. V1 mapping behavior

### Forward: legacy InPage text → Unicode

- Detect `U+0004` prefix markers.
- Convert the following pasted character back to its 8-bit byte value.
- Match known 4-byte composite sequences before single-character mappings.
- Convert known Urdu letters, numerals, common diacritics, punctuation and symbols.
- Preserve unknown legacy pairs exactly and surface a review warning.
- Preserve ordinary Latin text and line breaks.

### Reverse: Unicode → InPage-compatible text

- Use one stable preferred legacy byte for each supported Unicode character.
- Use composite sequences for confirmed cases such as Alef with Hamza/Madda and Wao with Hamza.
- Encode supported spaces and punctuation using the legacy pair representation where documented.
- Preserve unsupported Unicode visibly and report it instead of substituting another character.
- Do not claim lossless conversion for every Urdu/Arabic code point.

## 6. Known uncertainty

Reverse-engineering documentation reports observed but not yet confirmed byte values including `0xE3`, `0xE5`, `0xF0`, `0xF4`, `0xB2`, `0xB6` and `0xB7`. V1 intentionally leaves these unsupported.

Arabic-mode overrides also exist in some InPage documents. V1 targets the Urdu clipboard mapping and does not silently switch mapping mode.

Characters such as standalone Urdu Yeh with Hamza can be context-dependent in legacy material. If a reversible mapping is not confirmed, V1 preserves the Unicode form and reports it.

## 7. Testing gate

The converter must cover:

- core Urdu alphabet bytes;
- Urdu numerals;
- punctuation and brackets;
- composite sequences;
- mixed Latin + Urdu;
- a reversible Urdu phrase round trip;
- unknown legacy bytes preserved unchanged;
- unsupported Unicode preserved unchanged;
- no network upload path in core or UI code.

## 8. `.inp` file follow-up

The new `inpage-format` project demonstrates a pure JavaScript/TypeScript browser-capable decoder for InPage v1/v2/v3 compound document streams. This changes the technical outlook for a future full-file importer: it appears feasible without a paid cloud API.

It does **not** change V1 scope. File parsing adds compound-file handling, document/version detection, paragraph filtering, layout/format questions, larger fixture requirements and additional licence/provenance review. It should be a separately approved phase after we observe usage of pasted-text conversion.
