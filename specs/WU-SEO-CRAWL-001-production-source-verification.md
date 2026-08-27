# WU-SEO-CRAWL-001 — Production Source Verification

**Status:** Running  
**Date:** 2026-08-26  
**Parent epic:** `WU-SEO-CRAWL-001-public-copy-static-crawlability.md`

## Purpose

Record the final live-source verification for the static crawlability epic after Slices A–D and the repository closeout were merged to `main`.

The check must fetch the deployed production HTML directly. It must not rely on repository files, rendered browser DOM, or a search-engine cache.

## Representative routes

| Area | Route | Live source assertions |
| --- | --- | --- |
| Write | `/` | 2xx HTML; self-canonical; expected H1; source-visible static nav/footer; governed JSON-LD |
| Create | `/urdu-templates` | same common source assertions; static template-grid markers; source ItemList; all catalogue cards present in raw HTML |
| Learn | `/write-urdu-documentation` | same common source assertions; source HowTo JSON-LD |
| Trust | `/write-urdu-privacy` | same common source assertions; simplified analytics/share/form disclosures; no residual implementation wording from the cleanup |

## Commands

```bash
npm run seo:live
npm run seo:production
npm run seo:source-live
```

The GitHub Actions runner is used for this live check because the interactive execution runtime currently cannot resolve `write-urdu.com`, while GitHub-hosted runners have outbound DNS/network access.

## Result

Pending the one-time live verification workflow. Record the exact run ID, branch head and result here before marking the parent epic complete.
