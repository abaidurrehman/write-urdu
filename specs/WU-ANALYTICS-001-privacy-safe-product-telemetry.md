# WU-ANALYTICS-001 — Privacy-Safe Product Telemetry & Product Pulse

**Status:** Implementation in progress  
**Priority:** P0  
**Area:** Product intelligence / retention / monetization support  
**Storage:** Existing Cloudflare D1 database `writeurdu-db` through the `METRICS_DB` binding

## 1. Problem

WriteUrdu has strong search and AdSense evidence but almost no reliable product-behaviour evidence. We cannot currently answer basic questions such as:

- how many visitors actually start writing;
- how long an engaged writing session lasts;
- whether people mainly write names/messages or longer documents;
- how often users copy text;
- how many PDF, PNG, Word or text exports complete each day;
- which input mode is used;
- whether batch transliteration is used;
- whether users continue from the basic editor into Rich Editor, Card Studio, QR or other tools.

This creates roadmap risk: search demand is measured much better than actual product use.

## 2. Product decision

Introduce first-party, privacy-safe aggregate telemetry using a small browser client, Cloudflare Pages Function and the existing D1 database.

The system must measure **interaction facts, never writing content**.

## 3. Privacy contract

The telemetry implementation MUST NOT transmit or store:

- Roman Urdu or Urdu text entered by a user;
- document/card/invoice/QR contents;
- filenames;
- clipboard contents;
- email addresses or account identifiers;
- IP addresses in the product-events table;
- user-agent strings;
- referrer URLs;
- URL query strings;
- persistent cross-session device/user identifiers.

Allowed data is deliberately coarse:

- event name;
- current route and product/tool family;
- export format;
- text-length bucket only;
- active-time bucket only;
- input-mode enum;
- success boolean;
- coarse device class;
- internal target route for product handoffs;
- ephemeral random session id stored only in `sessionStorage`.

The session id exists only to connect events within one browser tab/session. It is not intended as a stable user identity.

## 4. Initial events

### Session / engagement

- `page_session_started`
- `editor_engaged` — first meaningful interaction with the writing surface
- `session_summary` — final text-length bucket, active-time bucket and input mode

### Outcomes

- `copy_completed`
- `export_completed` with `txt`, `png`, `pdf` or `doc`
- `print_started`
- `share_clicked`

### Product behaviour

- `input_mode_changed`
- `batch_transliteration`
- `tool_handoff`

## 5. Bucketing

### Text length

`0`, `1-20`, `21-50`, `51-100`, `101-250`, `251-500`, `501-1000`, `1001-2500`, `2500+`

No exact character count is sent to the server.

### Active time

`0-10s`, `11-30s`, `31-60s`, `61-180s`, `181-600s`, `600s+`

Active time counts only while the page is visible, the user has engaged with the editor, and recent activity occurred. It is not simple wall-clock time-on-page.

## 6. Phase 1 scope

Primary behavioural instrumentation:

- `/` — basic Roman Urdu editor;
- `/urdu-editor` — Rich Text Editor;
- `/urdu-keyboard` — direct Urdu keyboard.

Shared outcomes are instrumented centrally where possible so existing export code remains the source of truth. Copy completion is recorded only after the existing UI reports clipboard success; clicking Copy alone is not counted as success.

The telemetry client can identify other product routes from day one, but deep per-tool events for Card Studio, Invoice, Name Art, social makers and QR remain a follow-on slice after the core writing funnel is verified.

## 7. Architecture

`Browser -> /api/events -> Cloudflare Pages Function -> METRICS_DB -> product_events`

### Browser client

`js/product-telemetry.js`

- generates an ephemeral session id in `sessionStorage`;
- buffers small batches;
- uses `fetch(... keepalive)` during normal operation;
- uses `sendBeacon` on page exit where available;
- sends only the approved fields;
- never sends editor content.

### API

`functions/api/events.js`

- POST only;
- same-site / Pages-preview origin allowlist;
- 32 KB request cap;
- maximum 10 events per request;
- strict event/tool/format/bucket enums;
- deduplication by client event id;
- no free-form metadata payload;
- self-initializes the additive schema with `CREATE ... IF NOT EXISTS` so the collector can start safely even if the migration has not been applied manually.

### D1

Canonical migration: `migrations/0001_product_telemetry.sql`.

The table is intentionally separate from any future authentication/draft tables. Anonymous telemetry must not be joined to authenticated user records.

## 8. Core product questions

After a representative data period, Product Pulse should answer:

1. How many sessions actually engage with a writing surface?
2. What proportion ends with Copy, Export, Print, Share or a tool handoff?
3. What is the distribution of final writing-length buckets?
4. What is the distribution of active writing time?
5. Which export formats are used daily/weekly?
6. How often do people use Roman vs direct input mode?
7. How often is batch transliteration used?
8. Which product handoffs occur from the basic editor?
9. How do these metrics differ between desktop/tablet/mobile?
10. Which product features deserve more or less roadmap investment based on demonstrated use?

## 9. Initial D1 queries

Daily exports:

```sql
SELECT substr(received_at, 1, 10) AS day,
       format,
       COUNT(*) AS exports
FROM product_events
WHERE event_name = 'export_completed'
GROUP BY day, format
ORDER BY day DESC, exports DESC;
```

Daily engaged writing sessions:

```sql
SELECT substr(received_at, 1, 10) AS day,
       tool,
       COUNT(DISTINCT session_id) AS engaged_sessions
FROM product_events
WHERE event_name = 'editor_engaged'
GROUP BY day, tool
ORDER BY day DESC, engaged_sessions DESC;
```

Length distribution:

```sql
SELECT tool, length_bucket, COUNT(*) AS sessions
FROM product_events
WHERE event_name = 'session_summary'
GROUP BY tool, length_bucket
ORDER BY tool, sessions DESC;
```

Outcome funnel:

```sql
SELECT event_name, tool, COUNT(*) AS events,
       COUNT(DISTINCT session_id) AS sessions
FROM product_events
WHERE event_name IN ('editor_engaged','copy_completed','export_completed','share_clicked','tool_handoff')
GROUP BY event_name, tool
ORDER BY tool, events DESC;
```

## 10. Retention

Initial operating target:

- raw `product_events`: approximately 90 days;
- longer-term reporting should use aggregated daily metrics when the Product Pulse dashboard is implemented.

Retention automation is a follow-on operational task; the initial collector must not claim automatic deletion until that job exists.

## 11. Acceptance criteria

- [x] Existing `writeurdu-db` / `METRICS_DB` architecture is used; no second analytics database is introduced.
- [x] Additive product-events schema exists.
- [x] POST `/api/events` performs strict schema validation and writes to D1.
- [x] Collector has a self-initializing schema safety path.
- [x] Browser telemetry never includes written content or exact character count.
- [x] Session identity is ephemeral and stored only in `sessionStorage`.
- [x] Basic Editor, Rich Editor and Urdu Keyboard can emit engagement/session summaries.
- [x] Copy/export success paths are connected to telemetry for the Phase 1 core controls.
- [x] Homepage/keyboard text export is connected to telemetry.
- [x] Core Write runtime loads the telemetry client.
- [x] Privacy page documents first-party aggregate product telemetry.
- [x] Static regression tests protect privacy and event contracts.
- [ ] CI passes.
- [ ] Production is verified to return HTTP 202 from `/api/events` and D1 receives first events.

## 12. Follow-on slices

1. Card Studio / Name Art / social maker completion events.
2. Invoice PDF/PNG completion events.
3. QR creation/download completion events.
4. Product Pulse view inside the existing WriteUrdu OS.
5. Daily aggregation + raw-event retention cleanup.
6. Search Console + product-use joins at route/day level, never user/session level.
