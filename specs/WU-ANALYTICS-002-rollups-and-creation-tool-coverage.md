# WU-ANALYTICS-002 — Telemetry Rollups & Creation-Tool Coverage

**Status:** Implementation in progress  
**Priority:** P0  
**Depends on:** WU-ANALYTICS-001  
**Storage:** Existing `writeurdu-db` through `METRICS_DB`

## Problem

The first telemetry slice intentionally proved that WriteUrdu can collect privacy-safe product behaviour, but its raw-event storage model is not the right permanent shape for a high-traffic public utility. A page visit can produce several browser events, and the original `product_events` table also carried several secondary indexes. Database writes and dashboard reads would therefore scale with individual user activity.

At the same time, telemetry coverage was concentrated on the Basic Editor, Rich Editor and Urdu Keyboard. Product decisions also need evidence from Card Studio/canvas, Stylish Urdu Text, Name Art, WhatsApp/Instagram makers, Invoice and QR.

## Decision

Move normal telemetry ingestion from raw event rows to **hour + tool rollups** while broadening the same privacy contract across creation tools.

Target data flow:

`browser event batch -> validate -> aggregate in Worker -> 1 hour/tool UPSERT + 1 global UPSERT -> Product Pulse`

The number of D1 reporting rows is therefore bounded primarily by active tools and hours, not by users, typed characters or individual interactions.

## Storage model

### `product_hourly_metrics`

One row per UTC hour and tool, plus one `tool = all` row. It stores additive counters for:

- visits and engaged visits;
- copies, exports, prints, shares and handoffs;
- export format counts;
- batch transliteration;
- first canvas interaction;
- template selections;
- local image usage;
- engaged-session text-length buckets;
- active-time buckets;
- input-mode summaries;
- device-class visit counts.

### `product_hourly_handoffs`

One row per UTC hour + source tool + internal target route, plus a global row, so Product Pulse can retain destination distribution without free-form metadata.

### Legacy `product_events`

The table remains temporarily for migration/diagnostic continuity but **normal ingestion no longer appends raw event rows**.

- historical rows before the current UTC hour are backfilled once into rollups;
- raw rows older than seven days are deleted opportunistically;
- secondary raw indexes for event name, tool, route and session are dropped;
- only the timestamp index remains for cleanup.

## Measurement semantics

The dashboard uses **product visits**, not a cross-page unique-user concept. `page_session_started` is emitted once per product page lifecycle. An engaged visit is emitted at most once per lifecycle when a user actually interacts with that editor/tool.

This avoids persistent identity and avoids a separate D1 write solely to deduplicate users.

`session_summary` is emitted only for engaged visits, which prevents passive page views from filling writing-length and active-time charts with meaningless zero values.

Input-mode changes remain local state and are summarized once at session exit rather than creating a database-bound event for every toggle.

## Creation-tool breadth

The shared shell loads telemetry only on deliberate product surfaces:

- `/urdu-card-studio`
- `/stylish-urdu-text-generator`
- `/urdu-name-art-maker`
- `/urdu-whatsapp-status-maker`
- `/urdu-instagram-post-maker`
- `/urdu-invoice-generator`
- `/qr-code-generator`

The existing core-route loader continues to cover `/`, `/urdu-editor` and `/urdu-keyboard`.

### Added product evidence

- generic tool engagement from meaningful input/change/action;
- Card Studio and social-canvas PNG/JPEG completions;
- first real canvas interaction;
- template selection;
- local image/logo use;
- Name Art normal and transparent PNG completion;
- Invoice PDF/PNG completion and print start;
- QR PNG/SVG completion, QR image copy and share completion;
- Stylish Text successful copies/shares and Name Art handoff.

Outcome telemetry is connected to existing success/status paths where possible rather than counting an export merely because a button was clicked.

## Privacy contract

WU-ANALYTICS-001 remains authoritative. This slice must not add:

- written text or generated document content;
- exact text lengths;
- filenames;
- QR payloads;
- invoice data;
- uploaded image bytes/names;
- clipboard contents;
- IP addresses, referrers or user-agent strings;
- account/email identifiers;
- persistent cross-session IDs.

Canvas telemetry records only that an interaction occurred, not coordinates, text, styles or image contents.

## Product Pulse

Product Pulse should continue to support 24h / 7d / 30d windows, but all standard reporting must read `product_hourly_metrics` rather than scan `product_events`.

The dashboard terminology changes from sessions/writers to visits/engaged visits and expands to show:

- JPEG and SVG alongside PDF/PNG/Word/TXT;
- canvas interaction;
- template use;
- local image use;
- all instrumented product tools in the tool table.

## Acceptance criteria

- [x] Hour/tool rollup schema exists.
- [x] Normal ingestion no longer inserts a raw row per event.
- [x] Browser batches are consolidated before D1 writes.
- [x] Legacy raw data is backfilled without mixing current-hour live rollups.
- [x] Raw telemetry retention is reduced to seven days.
- [x] Unnecessary raw indexes are dropped.
- [x] Unengaged page views no longer emit session summaries.
- [x] Input-mode toggles no longer emit individual telemetry events.
- [x] Card Studio, Stylish Text, Name Art, WhatsApp, Instagram, Invoice and QR load telemetry.
- [x] Canvas/template/local-image signals are supported.
- [x] PNG/JPEG/PDF/Word/TXT/SVG/transparent-PNG outcomes are representable.
- [x] Product Pulse reads hourly rollups rather than raw events.
- [x] Product Pulse exposes broader creation-tool evidence.
- [ ] CI passes.
- [ ] Production rollup initialization/backfill is verified.
- [ ] Product Pulse is verified after deployment with live creation-tool activity.

## Follow-on

If multi-year historical analytics becomes important, compact old hourly rows into a daily history table. This is intentionally deferred: hourly cardinality is already independent of traffic volume and the current dashboard only queries up to 30 days.
