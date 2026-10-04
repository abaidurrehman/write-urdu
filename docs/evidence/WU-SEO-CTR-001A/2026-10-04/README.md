# WU-SEO-CTR-001A — 2026-10-04 raw search evidence

This directory preserves the exact source uploads used to create `specs/WU-SEO-CTR-001A-pakistan-search-capture.md`.

Because the GitHub connector available during capture only writes UTF-8 text files, the exact binary evidence bundle is stored as three Base64 parts. Reconstructing the bundle returns the original uploaded bytes unchanged.

## Original inputs in the bundle

| Original file | Role | Targeting / note | SHA-256 |
| --- | --- | --- | --- |
| `Keyword Stats 2026-10-04 at 11_41_08.csv` | Google Keyword Planner keyword stats | **United States** segmentation; retained as comparison/background only | `bb9b17353fcb91103196807c6d13987b48b05f542fae412c9f814c6e52c129f5` |
| `Keyword Stats 2026-10-04 at 11_49_18.csv` | Google Keyword Planner keyword stats | **Pakistan** segmentation; primary demand evidence for this spec | `e9602d2b52f4ec4a460b45bef4d0722ad05a1f49b23552fcd3cce9a2f2047b4c` |
| `Keyword Forecasts 2026-10-04 at 11_46_02.csv` | Google Ads forecast export | **United States**, Location ID `2840`; PKR is account currency, not Pakistan targeting | `a399afc1115d8b16ffe40ad91818250b1ab1744642f7fb20ff85218fe08f0697` |
| `write-urdu.com-Performance-on-Search-2026-10-04.zip` | Google Search Console export | Primary observed query/page/country/device/search-appearance evidence | `4059d8c21e5823b49fc997643675f2f20cf503a09200c1f2125bfe160d69524a` |

## Evidence bundle

Reconstructed bundle filename:

`WU-SEO-CTR-001A-inputs-2026-10-04.zip`

Bundle SHA-256:

`f9d6b2838055363bddb91ae5aec474ec0e2c77c7f5271f375728163b29ec7bf0`

The bundle contains the four original files above with their original filenames and bytes.

## Restore on Linux / Codex / Claude Code

From this directory:

```bash
cat WU-SEO-CTR-001A-inputs-2026-10-04.zip.b64.part01 \
    WU-SEO-CTR-001A-inputs-2026-10-04.zip.b64.part02 \
    WU-SEO-CTR-001A-inputs-2026-10-04.zip.b64.part03 \
  | base64 --decode > WU-SEO-CTR-001A-inputs-2026-10-04.zip

sha256sum WU-SEO-CTR-001A-inputs-2026-10-04.zip
unzip -l WU-SEO-CTR-001A-inputs-2026-10-04.zip
unzip WU-SEO-CTR-001A-inputs-2026-10-04.zip
```

The `sha256sum` result must equal:

```text
f9d6b2838055363bddb91ae5aec474ec0e2c77c7f5271f375728163b29ec7bf0
```

After extraction, verify the four individual checksums in the table above before using them as evidence.

## GSC ZIP contents

The Search Console ZIP contains the standard exported dimensions used in the analysis, including:

- `Queries.csv`
- `Pages.csv`
- `Countries.csv`
- `Devices.csv`
- `Chart.csv`
- `Filters.csv`
- `Search appearance.csv`

## Evidence-use rules

1. Treat the **Pakistan** Keyword Stats export (`11_49_18`) as the primary demand file.
2. Do not interpret PKR currency in the forecast export as Pakistan targeting; that forecast is United States-targeted.
3. Use Keyword Planner volumes as relative demand evidence where Google buckets volumes coarsely; do not treat them as guaranteed obtainable traffic.
4. Prefer GSC for observed Write-Urdu impressions, clicks, CTR, position, landing-page exposure, country mix and device mix.
5. Do not modify these raw inputs. Derived analysis should live in separate dated files.
