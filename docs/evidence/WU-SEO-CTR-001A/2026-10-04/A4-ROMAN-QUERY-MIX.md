# A4 Roman page query mix

**Source:** Google Search Console Performance export supplied 2026-10-04

**Filter:** Page exactly `https://write-urdu.com/roman-urdu-transliteration`; Web; last three months
**Source archive SHA-256:** `cd69ec199942347d30a7fe09a33f845b2efd440b00d33025c3299a9daf7bf160`

## Page total

| Clicks | Impressions | CTR | Position |
| ---: | ---: | ---: | ---: |
| 120 | 45,493 | 0.26% | 6.73 |

The export contains 241 visible query rows covering 61 clicks (50.8% of page clicks) and 40,591 impressions (89.2% of page impressions). Search Console withholds some low-volume queries, so category totals below describe visible rows rather than the full page total.

## Visible query mix

| Category | Queries | Clicks | Impressions | CTR |
| --- | ---: | ---: | ---: | ---: |
| Broad English/Urdu without `Roman` or `transliteration` | 44 | 22 | 37,264 | 0.06% |
| Explicit Roman/transliteration | 124 | 37 | 3,018 | 1.23% |
| Other Urdu query | 63 | 2 | 292 | 0.68% |
| Other | 10 | 0 | 17 | 0.00% |

The single query `english to urdu typing` accounts for 36,892 impressions and 21 clicks on this page. Explicit Roman/transliteration demand is smaller but better aligned and has materially higher CTR.

## Decision

The page's query mix is confirmed as predominantly broad English-to-Urdu impressions caused by overlapping metadata. A4 should:

- make `/roman-urdu-transliteration` a working Roman Urdu-to-Urdu task;
- use Roman-specific title and H1 language;
- leave broad English-to-Urdu typing ownership on `/`;
- measure Roman-query clicks and task activation separately;
- expect broad, low-CTR impressions to leave this page rather than treating that decline as failure.
