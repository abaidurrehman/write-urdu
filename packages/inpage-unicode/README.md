# @write-urdu/inpage-unicode

Convert Urdu text between legacy InPage-style encoding and Unicode — in both
directions. This is the exact engine behind
[write-urdu.com's InPage ↔ Unicode Converter](https://write-urdu.com/tools/inpage-unicode-converter),
published as a standalone package.

**Status: beta.** The mapping profile (`inpage-v1v2-clipboard-2026-08-17`) covers
core Urdu letters, numerals, punctuation and four composite sequences. Unsupported
input is preserved and flagged rather than silently guessed — see `warnings` below.

This package does not parse `.inp` binary document files; it converts plain text only.

## Install

```bash
npm install @write-urdu/inpage-unicode
```

## Usage

```js
const { decodeLegacyText, encodeUnicodeText, PROFILE } = require('@write-urdu/inpage-unicode');

// Legacy InPage-style text -> Unicode
const decoded = decodeLegacyText(legacyText);
decoded.text;         // converted Unicode string
decoded.converted;    // count of characters successfully converted
decoded.unsupported;  // count of characters that could not be converted
decoded.warnings;     // [{ kind, index, value }, ...] for anything unsupported
decoded.profile;      // mapping profile version, e.g. "inpage-v1v2-clipboard-2026-08-17"

// Unicode Urdu -> legacy InPage-style text
const encoded = encodeUnicodeText(unicodeUrduText);
encoded.text;
encoded.converted;
encoded.unsupported;
encoded.warnings;

PROFILE; // the mapping profile version this package implements
```

Unsupported characters are always preserved in `text` rather than replaced with a
guess — check `unsupported`/`warnings` before trusting a conversion is complete.

## Hosted API

A beta HTTP API using this same engine is also available for callers who don't want
to embed the package directly. It is not self-serve yet — [contact Write Urdu](https://write-urdu.com/contact)
for beta access.

## License

TBD — this package is not yet published to the public registry.
