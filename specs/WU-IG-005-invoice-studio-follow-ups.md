# WU-IG-005 — Invoice Studio follow-ups

**Route:** `/urdu-invoice-generator` (unchanged)
**Status:** Implemented on branch `feat/invoice-studio-next` (2026-10-16). This continues the founder-directed exception in `specs/BACKLOG.md` P0.14.
**Builds on:** [`WU-IG-004`](WU-IG-004-invoice-studio-redesign.md)

This spec covers the five improvements listed at the end of WU-IG-004. Screenshots are in [`docs/audits/invoice-followups-2026-10-16/`](../docs/audits/invoice-followups-2026-10-16/).

## 1. Item units and per-item tax

- Each item has an optional free-text **unit**, capped at 20 characters. It is shown after the quantity ("4 kg", "2 دن").
  - Suggestions come from `core.UNITS` and follow the invoice language. People can still type any unit.
- Tax can be set to **Rate for each item** (`tax.mode = 'per-item'`). Each item then has a Tax % field.
  - Each line is taxed on its share of the discounted subtotal, so an invoice discount lowers tax the same way it would on a single line.
  - Rates must be between 0 and 100%. An item without a rate is not taxed.
  - A Tax column appears on the invoice only when at least one rate is used.
- Older drafts load with empty `unit` and `taxRate`. `schemaVersion` stays at 2.

## 2. Backup, restore and spreadsheet export

My invoices has three new actions.

- **Download backup:** a JSON file in the format `write-urdu-invoices`, version 1. It contains the saved invoices and the remembered business. Samples are never included.
- **Restore from backup:**
  - Every invoice goes through the normaliser.
  - Invoices merge by id, and a copy already on the device is replaced only when the backup copy is newer.
  - A remembered business is restored only if none is saved yet.
  - Logo data URLs must be complete base64 PNG, JPEG or WebP.
  - Files over 8 MB, or in any other format, are rejected with a clear message.
- **Export spreadsheet (CSV):** one row per invoice with totals, paid amount and balance.
  - The file starts with a UTF-8 byte-order mark so Excel shows Urdu names correctly.
  - Cells that look like formulas are prefixed with `'`.

Up to 25 invoices are kept, up from 12. If browser storage runs out, older copies drop their logo before any invoice is left out.

## 3. Selectable text in PDFs

PDF pages are still images, so Nastaliq looks exactly like the preview. `js/invoice-pdf-text.js` adds an invisible text layer over each page image:

- It contains the Latin text: invoice numbers, dates, amounts, IBANs, emails and English words. This text can be selected, copied and searched.
- Each run is placed and stretched to match its position on the image.
- Urdu words are left out because the built-in PDF fonts cannot encode them. The page tells people that Print → Save as PDF gives fully selectable Urdu.
- The browser test inflates the PDF content streams and checks that the text layer is present and invisible.

## 4. On-device English-letter Urdu

`js/roman-urdu-local.js` converts Roman Urdu without contacting any server.

- **Method:** about 1,100 common, business, place and name words, plus phonetic rules for any other word. Doubled consonants are written once, common endings (-on, -ein, -yan, -eh) are handled, initial kh and gh are read as خ and گھ, and a final -y is read as ے.
- **Kept as typed:** numbers, emails, links, @handles, abbreviations (PKR, IBAN), brand capitals (WhatsApp) and short chat words and units (ok, kg).
- **Typing:**
  - Space or punctuation converts the last word.
  - Backspace straight after a conversion restores the English letters and leaves that word alone.
  - Enter in a single-line field, or leaving the field, converts a final word.
- **Google Input Tools** is no longer loaded by default. A checkbox, "Use Google Input Tools for more word suggestions — sends each word you type to Google", turns it on and is remembered.
  - With Google on, the loader is called with a callback, because it refuses a plain `google.load` after page load. `google_jsapi.js` is untouched.
  - The preview now re-reads a field shortly after Google replaces a word, because Google fires no event when it does.

### Benchmark

Scored with the repo's 106 Roman Urdu fixtures (`benchmarks/roman-urdu/fixtures.js`), using the same scorer as the Google baseline (`2026-09-09-google-input-tools-baseline.md`, 59.2%).

| Run | Pass rate |
| --- | ---: |
| First version, written before looking at the failures | 71.8% |
| After adding words and rules prompted by those failures | 91.3% |

**The second figure is tuned on the same fixtures and overstates real-world accuracy.** The two runs are not like-for-like with the Google baseline: it ran Google's batch path, while this converter returns one answer per word with no suggestion list.

Known weak spots:
- Retroflex letters in words that are not in the list (thanda → تھندا, not ٹھنڈا).
- Arabic letters such as ص ح ع ط in unlisted words.
- English words spelled out phonetically.

## 5. Urdu labels for the editor

`js/invoice-ui-urdu.js` holds Urdu wording for every editor string: exact strings plus patterns for messages that carry numbers or invoice numbers.

**Switching:**
- The switch in the intro reads "اردو میں دیکھیں" or "View in English".
- The editor follows the invoice language (Urdu invoice → Urdu editor) until the person uses the switch. The choice is then remembered.

**Applying the wording:**
- A walker and a `MutationObserver` translate text nodes and the `placeholder`, `aria-label` and `title` attributes inside the editor. Status messages, banners and confirm dialogs are translated before they are written.
- The invoice pages, template thumbnails and the about section are not changed.
- English text that already has an Urdu twin beside it ("Edit ترمیم") is hidden rather than translated.
- In Urdu, the workspace is `dir="rtl"` and the about section stays `dir="ltr"`.

**Telemetry:** export tracking now also recognises "PDF ڈاؤن لوڈ ہو گئی۔" and "PNG تصویر ڈاؤن لوڈ ہو گئی۔".

## Tests

- `tests/invoice-generator-core.test.js`: units, per-item tax, backup parse/merge, hostile logo data, CSV formula guard.
- `tests/invoice-pdf-text.test.js` (new): text cleanup, Urdu skipping, run grouping, invisible rendering and scaling.
- `tests/roman-urdu-local.test.js` (new): word list, rules, protected tokens, no network calls, Google opt-in only.
- `tests/invoice-ui-urdu.test.js` (new): every entry is Urdu, patterns, every core validation and status message has Urdu, telemetry recognises the Urdu success messages.
- `tests/invoice-generator.spec.js`: on-device typing with no provider requests, Urdu editor with no untranslated visible text and switching back, and the PDF text layer.
