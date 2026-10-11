# Card Studio audit harness (2026-10-11)

These are the Playwright journeys used for the Card Studio UX audit. Use them to re-measure the findings before and after each `WU-UXR-002` slice. They are **not** part of `npm test` or `playwright.config.js`.

## Setup (once)

```bash
cd docs/audits/urdu-card-studio-ux-2026-10-11/evidence/harness
npm install            # installs playwright 1.56 locally (git-ignored)
npx playwright install chromium   # skip if you set PW_CHROMIUM to an existing Chromium/Chrome binary
```

## Run against your local working tree (default)

```bash
npm run server &                 # serves the repo on :8790 and runs the REAL share functions
                                 # (functions/api/shares*, functions/s/[id], functions/share-media/[id])
                                 # with a node:sqlite D1 shim + in-memory R2. Nothing leaves your machine.
npm run first-impression         # text-box position, controls, overflow on 5 viewports
node p1.mjs                      # one persona; or: npm run personas
npm run journeys                 # Gallery (J04) + WhatsApp Status (J07)
npm run server:share-down &      # :8791 with no storage bindings, needed by resilience.mjs
npm run resilience
node recipient.mjs <shareId>     # recipient view of a link created by p3/p7
```

Output (screenshots and `*.json` traces) goes to `out/` (git-ignored). The committed evidence in `../` is the 2026-10-11 baseline. Compare your `out/*.json` against `../logs/*.json`.

Environment variables:

| Variable | Default | Use |
|---|---|---|
| `WU_BASE` | `http://127.0.0.1:8790` | Target origin |
| `WU_AUDIT_OUT` | `./out` | Output folder |
| `PW_CHROMIUM` | Playwright's bundled Chromium | Path to a Chromium/Chrome binary |
| `PORT`, `FAIL_SHARES` | `8790`, unset | Harness server options |

## Production runs — read first

`WU_BASE=https://write-urdu.com` works for **read-only** journeys: `01-first-impression`, `p2` (download only), `p5`, `p6`, `j04j07`, and `recipient` with an existing id.

Production can show Google's ad-consent dialog and a sticky anchor ad. `newSession()` in `lib.mjs` declines the consent dialog and logs that it did ("Ad-consent dialog dismissed" in the trace). `j04j07` centres the Gallery button before tapping it and records any element covering it (`g_chooseCoveredBy`).

**Do not** run `p3`, `p7`, `p8` or `del` against production unchanged. They publish public pages:

- `p8` taps a stock card's "Shareable link", which (before slice F) **cannot be deleted**.
- `p3` and `p7` publish `[TEST]` cards. If you run them, delete those links afterwards from **Manage published links** in the same browser profile.

## Keeping the scripts current

The scripts drive the visible UI through `data-*` selectors (`#cardText`, `[data-card-action="publish"]`, `[data-card-step]`, `[data-card-built-in-background]`, `[data-urdu-cards-edit]`, …). If a slice renames or moves a control, update the selector here in the same PR. Do not weaken the assertion.

Fixtures are synthetic (generated, no real photos). `p6.mjs` also uses `fixtures/synthetic-large.jpg` if you add one (any JPG larger than about 5000 px).
