# 07 — Test Coverage, Environment & Limitations

## 1. Environment

| Item | Value |
|---|---|
| Date | 2026-10-11 |
| Code | `main` at `7a14bde` (branch `claude/write-urdu-card-studio-audit-tefvyq`; no application files changed) |
| Browser | Chromium (Playwright 1.56.0 driver, `/opt/pw-browsers/chromium`), headless |
| Alternative engine | **Not available**: only Chromium is installed in this container. Firefox/WebKit (Safari) runs are **not tested**. The "iPhone" profile is Chromium with an iOS UA and viewport, **not WebKit**. |
| Static server | `evidence/harness/harness-server.mjs`: serves the repo and runs the **real** `functions/api/shares.js`, `functions/api/shares/[id].js`, `functions/s/[id].js`, `functions/share-media/[id].js` with a `node:sqlite` D1 shim and an in-memory R2 shim. Other `/api/*` (telemetry) return 204. |
| Production `www.write-urdu.com` | **Unreachable**: egress policy returned 403 for CONNECT. **No live-site observation was possible.** All findings come from the local build of the latest `main`. |
| Google Input Tools (`www.google.com`, `inputtools.google.com`) | **Unreachable**, so Roman Urdu conversion success could not be tested. The failure path was observed for real. One clearly labelled **stub** run tested only the surrounding UI. |
| Google Fonts | Reachable, so Nastaliq/Naskh rendered as in production. |
| cdnjs (Font Awesome), AdSense | Unreachable: icons missing in screenshots (cosmetic, environment-only); ad slots empty. |
| Web Share API | Not exposed in headless Chromium, so every native-share path fell back (copy/download). Real-device checks are required. |

To restore live-site testing, allow `www.write-urdu.com`, `write-urdu.com`, `www.google.com` and `inputtools.google.com` in the environment's network settings and re-run the harness scripts against the production URL (change `BASE` in `lib.mjs`).

## 2. Device matrix

| Profile | Viewport | DPR | Touch | Runs |
|---|---|---|---|---|
| Small Android | 360×780 | 2 | ✓ | First impression, P3, P8, J07, slow-3G |
| Typical Android | 393×852 | 2.75 | ✓ | First impression, P1, P4, P7, J04, recipient, Urdu UI, share-down |
| iPhone (Chromium, iOS UA) | 390×844 | 3 | ✓ | First impression, P2 |
| Tablet | 768×1024 | 2 | ✓ | First impression only (`first-impression-card-studio-tablet.jpg`; text box at 3,129 px) |
| Desktop | 1440×900 | 1 | — | First impression, P5, P6, recipient, storage-blocked, long/mixed text, two tabs, keyboard |

Interface languages: English (all runs) and Urdu (`/urdu/urdu-card-studio`, Android).

## 3. Journeys

| Journey | Status | Notes |
|---|---|---|
| J01 Empty Card Studio | Executed (4 personas) | |
| J02 Sample text | Executed | Blocked by product (CARD-UX-004) |
| J03 Ready-made design | Executed (P4, P8, P7) | |
| J04 Gallery compare | Executed | Completed |
| J05 Roman Urdu | Executed (real failure + stub UI) | Success with the real provider **not tested** |
| J06 Upload background | Executed | Includes broken file, 6000×4500 JPG and reload restore |
| J07 WhatsApp Status image | Executed | |
| J08 Instagram image | Executed | Instagram upload not tested (no accounts, by rule) |
| J09 Publish link | Executed (harness, real functions) | 4 test publishes, all fictional `[TEST]` / sample text. In-memory, so **no production content was created**. One was deleted through the UI to test deletion (410/404). |
| J10 Recipient | Executed (Android + desktop) | |
| J11 Social sharing | Partly | Copy-link fallback executed; WhatsApp/Facebook/Instagram apps, native share sheet and link previews **not tested** |
| J12 Return/reuse | Executed (persistent profile) | Cross-device not applicable (local-only by design) |

## 4. Resilience cases

| Case | Status | Result |
|---|---|---|
| Slow network (400 kbps / 400 ms, CDP) | Executed | DCL 21.9 s, Nastaliq 34.6 s (local server; relative only) |
| Transliteration failure | Executed (real) | Alert shown; status line contradicts it |
| Background upload failure | Executed | Error overwritten by autosave (CARD-UX-004) |
| Storage unavailable | Executed (localStorage/sessionStorage throw, IndexedDB undefined) | Works; message shown; 1 uncaught SecurityError |
| Page refresh | Executed | Project + uploaded photo restored |
| Long Urdu passage (746 chars) | Executed | Fits at 37 px; contradictory warning |
| Mixed Urdu/English + numbers | Executed | Bidi reversal (CARD-UX-003); URL overflow |
| Small / large images | Executed (83 KB, 1.1 MB 6000×4500) | Both fine |
| Share API unavailable | Executed (inherent) | Fallbacks observed |
| Share backend unavailable | Executed (second harness with no bindings) | Jargon error (CARD-UX-031) |
| Multiple tabs | Executed | Last write wins (CARD-UX-034) |
| Template change midway | Executed | Photo replaced (CARD-UX-019) |
| On-screen keyboard overlap | **Not tested** | Requires a real device |
| Screen reader output | **Not tested** with a real screen reader | Semantics inspected: canvas `aria-hidden`, figcaption mirrors text, status `aria-live=polite` |
| Contrast audit (axe) | **Not run** (no axe in the environment) | Spot checks only |

## 5. Existing automated tests (read, not modified)

Relevant specs already in `playwright.config.js`: `card-studio-background-collection.spec.js`, `card-gallery.spec.js`, `urdu-cards*.spec.js`, `card-poetry-quality.spec.js`, `create-publish-boundaries.spec.js`, `core-workspace-convergence.spec.js`, `home-featured-card.spec.js`, `whatsapp-status-discovery.spec.js`, `transliteration-availability.spec.js`. They mock `/api/shares` and do **not** cover: hand-off overwriting a saved project, bidi in canvas output, status overwrite by autosave, sample-text export, attribution legibility, curated publish consent, or mobile reachability of the text box. These gaps match the findings.

The repository test suite was **not run** for this audit, since no code changed.

## 6. Unverified assumptions / hypotheses

1. WhatsApp link previews may drop og:images above roughly 300–600 KB (CARD-UX-032).
2. On real Android the recipient page's Urdu text falls back to a Naskh-style system font (CARD-UX-036). iOS ships Noto Nastaliq Urdu.
3. Native share sheets (Android Chrome, iOS Safari) behave as the code expects for files and URLs.
4. Production (Cloudflare, compressed, cached) load times are better than the local slow-3G figures.
5. All "predicted behaviour" statements about personas are expert predictions and need validation with 5–8 real users per segment (WhatsApp-first women 45+, students, 60+).
6. Live production could differ from `main` (deployment lag). This could not be checked.

## 7. Reproducing

See [`evidence/harness/README.md`](evidence/harness/README.md). The scripts are portable: the target, output folder and browser come from `WU_BASE`, `WU_AUDIT_OUT` and `PW_CHROMIUM`. New runs write to the git-ignored `evidence/harness/out/`, so the committed baseline is never overwritten.

```bash
cd docs/audits/urdu-card-studio-ux-2026-10-11/evidence/harness
npm install && npm run server &
npm run first-impression && npm run personas && npm run journeys
```
