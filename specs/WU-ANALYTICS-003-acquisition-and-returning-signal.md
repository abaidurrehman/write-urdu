# WU-ANALYTICS-003 — Acquisition & Returning-Use Signals

**Status:** Phase A implemented; Phase B consent-gated  
**Priority:** P0  
**Area:** Product intelligence / retention / monetization  
**Storage:** Existing `METRICS_DB` D1 binding

## 1. Why this exists

Search Console measures Google Search discovery, not the whole WriteUrdu audience. A mature utility can also receive meaningful direct traffic from bookmarks, typed URLs, browser history/autocomplete, referrals and other search engines. Product decisions and AdSense decisions therefore need an independent first-party view of how visits begin.

## 2. Phase A — coarse acquisition, no identity

The public runtime classifies the current page entry in the browser and sends only one enum:

- `google_search`
- `other_search`
- `direct_unknown`
- `referral`
- `campaign`
- `internal`

The browser may inspect `document.referrer` and known campaign-parameter names locally to make that classification, but it MUST NOT send the referrer URL, search query, campaign value or URL query string to WriteUrdu.

`direct_unknown` is deliberately labelled **Direct / saved / unknown** in Product Pulse. It can include a bookmark, a typed URL, browser history/autocomplete, a privacy-stripped referral or another visit for which the browser provides no external referrer. It is a useful proxy for deliberate return/direct use, but it is not bookmark detection.

The collector writes bounded hourly aggregate rows only. It does not create a raw acquisition-event table.

## 3. Product Pulse output

Product Pulse adds two views:

1. **How product visits begin** — coarse entry source for Write/Create pages.
2. **Top site entry pages** — landing routes across the public site.

These signals complement, rather than replace, Search Console and AdSense reporting.

## 4. Phase B — first-time vs returning browser

A reliable returning-browser signal requires state to survive across browser sessions. WriteUrdu MUST NOT silently add a persistent analytics identifier or analytics-only browser-storage marker just to obtain this metric.

Phase B remains gated until the site has a consent-compatible persistence mechanism appropriate for the jurisdictions it serves. If implemented later, the preferred shape is still categorical rather than identifying: `first`, `returning`, plus coarse recency buckets. No random cross-session user/device ID is required.

Until then, Product Pulse must not label `direct_unknown` as “returning” or “bookmarked”.

## 5. Privacy contract

The acquisition telemetry MUST NOT transmit or store:

- full referrer URLs;
- search terms;
- UTM/campaign values;
- URL query strings;
- IP addresses in telemetry tables;
- user-agent strings;
- writing/editor content;
- filenames or clipboard contents;
- persistent user/device identifiers.

Allowed fields are route, monetization page type, coarse acquisition enum, hour bucket and aggregate counts.

## 6. Acceptance criteria

- [x] Acquisition is classified in-browser to a strict enum.
- [x] Full referrer and campaign values never enter the network payload.
- [x] D1 stores hourly aggregates rather than one raw row per page entry.
- [x] Product Pulse shows coarse product-entry sources and top entry routes.
- [x] Direct/unknown is explicitly described as a proxy, not bookmark detection.
- [x] No new `localStorage`, cookie or persistent analytics identifier is introduced.
- [x] Privacy copy discloses the coarse arrival classification.
- [ ] Returning-browser persistence is implemented only after an explicit consent-compatible design is approved.
