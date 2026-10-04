# WU-SEO-CTR-001A research inputs — 2026-10-04

This folder preserves the validated input data used for `WU-SEO-CTR-001A — Pakistan Search Capture`.

## Pakistan Keyword Planner input

`Keyword Stats 2026-10-04 at 11_49_18.csv.xz`

- Lossless xz-compressed copy of the supplied Google Keyword Planner CSV.
- This is the export validated as **Pakistan-targeted**.
- Original uncompressed CSV SHA-256: `e9602d2b52f4ec4a460b45bef4d0722ad05a1f49b23552fcd3cce9a2f2047b4c`.
- Compressed file SHA-256: `23fba9f17adabae1bbd19f6979e756b927cbfd821e08245014efab95492e23d5`.

To inspect locally:

```bash
xz -dc "docs/evidence/WU-SEO-CTR-001A/Keyword Stats 2026-10-04 at 11_49_18.csv.xz" > /tmp/write-urdu-pakistan-keywords.csv
```

## Search Console input

The supplied `write-urdu.com-Performance-on-Search-2026-10-04.zip` was extracted into `gsc/` so repository agents can inspect the CSV evidence directly.

Original supplied ZIP SHA-256: `4059d8c21e5823b49fc997643675f2f20cf503a09200c1f2125bfe160d69524a`.

Included files:

- `gsc/Chart.csv`
- `gsc/Countries.csv`
- `gsc/Devices.csv`
- `gsc/Pages.csv`
- `gsc/Search appearance.csv`
- `gsc/Filters.csv`
- `gsc/Queries-part-01.csv`
- `gsc/Queries-part-02.csv`

The original `Queries.csv` contained 1,000 data rows and was split into two 500-row files to keep the repository evidence easy to inspect. Each part repeats the same CSV header.

To reconstruct the original query export exactly at the row/content level (apart from UTF-8 BOM handling in the generated split files):

```bash
{
  cat docs/evidence/WU-SEO-CTR-001A/gsc/Queries-part-01.csv
  tail -n +2 docs/evidence/WU-SEO-CTR-001A/gsc/Queries-part-02.csv
} > /tmp/Queries.csv
```

Original supplied `Queries.csv` SHA-256: `bc071176045b0fb6fae21250515f68da2882c046973637b07546db5bd3f048de`.

## Scope note

Earlier keyword exports reviewed during the investigation are intentionally not included here because they were targeted to the **United States** despite showing PKR as the Google Ads account currency. The `11_49_18` file above is the validated Pakistan demand input used by the implementation spec.

## Usage

Use these files as evidence for:

- query and page opportunity sizing;
- Pakistan share of clicks/impressions;
- device CTR comparison;
- Unicode/InPage direction prioritization;
- Roman Urdu/transliteration opportunity;
- existing typing-practice ownership;
- Keyword Planner relative-demand validation.

Do not treat Keyword Planner bucket values as exact obtainable traffic forecasts. Search Console remains the primary evidence for existing Write Urdu visibility and CTR.