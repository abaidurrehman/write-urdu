# WU-API-001 — InPage ↔ Unicode Developer API & npm Package

Status: **Planned — founder-directed exception to the `BACKLOG.md` P0.1 feature-breadth freeze** (approved 2026-09-06)
Reuses: `WU-TOOLS-EXPANSION-005` (InPage ↔ Unicode Urdu Converter — implemented, archived)
Date: 2026-09-06

## 1. Problem

A large body of Urdu text still exists in legacy InPage-oriented encodings. `WU-TOOLS-EXPANSION-005` solved this for a human pasting text into a browser page. It does not solve it for a developer who needs to convert this text programmatically — inside a CMS import job, an archive-digitization pipeline, or their own app — without shipping their own reverse-engineered mapping table.

## 2. Product promise

Expose the exact same conversion engine WriteUrdu already ships, in two additional forms:

- an installable, dependency-free **npm package** usable in any Node or browser project;
- a **hosted beta HTTP API** for callers who cannot or do not want to embed the package.

Both directions (`legacy → Unicode`, `Unicode → legacy`) are supported identically to the browser tool. No new conversion behavior is introduced.

## 3. Why this is exempted from the P0.1 freeze

`BACKLOG.md` rule 7 freezes "another major unrelated feature" behind `WU-PLAT-002H`. This is recorded as an explicit, founder-approved exception rather than a silent bypass, because:

- the engine is a pure O(n) lookup-table transform — no model, no vendor dependency, negligible compute cost (see analysis in the implementation design doc, §2);
- it ships as an isolated new surface (`/api/v1/inpage-unicode/*`, a standalone npm package) that does not read, write, or share code with any file currently under `WU-PLAT-002H` review;
- it draws no attention from the Basic/Rich Editor, mobile activation, or referral-continuity work the freeze protects;
- it is additive-only against an already-shipped, already-tested engine (`js/inpage-unicode-core.js`, `tests/inpage-unicode-core.test.js`) — no new research or product-discovery gate is required.

If this assumption breaks — if building it starts drawing on P0.1-owned files or attention — stop and re-file under the normal backlog review.

## 4. Reused foundation (do not re-derive)

- Engine: `js/inpage-unicode-core.js` — UMD module, dependency-free, already round-trip tested, already versioned via `PROFILE = 'inpage-v1v2-clipboard-2026-08-17'`.
- Mapping provenance: `docs/WU-INPAGE-MAPPING-RESEARCH-2026-08-17.md`.
- Product/UX precedent: `specs/archive/implemented/WU-TOOLS-EXPANSION-005-inpage-unicode-converter.md`.

This spec does not modify the mapping tables, the browser tool, or its route (`/tools/inpage-unicode-converter/`).

## 5. Scope — two independently shippable phases

### Phase A — npm package (ship first)

- Package the existing engine as `write-urdu-inpage-unicode`, no server, no ongoing cost.
- No logic changes — the UMD module already supports both `require()` and browser global use.

### Phase B — hosted beta API (ship second)

- Single shared bearer secret, same interim-auth posture InvoiceCraftly used for its own first public API slice (Feature 102.3) before building real per-developer keys.
- One route, both directions, text in/text out.

Full design for both phases: `docs/WU-API-001A-INPAGE-UNICODE-NPM-BETA-IMPLEMENTATION-PLAN-2026-09-06.md`.

## 6. Non-goals for both phases

- No real per-developer API keys or durable quota (Durable Object) — only after Phase B shows real usage.
- No billing.
- No developer portal or docs site beyond one reference page linked from the existing tool.
- No `.inp` binary file parsing — text-only, same boundary `WU-TOOLS-EXPANSION-005` already drew.
- No change to the existing browser tool's behavior, UI, or route.

## 7. Security

- No request or response text is ever logged or persisted, matching the privacy posture `WU-TOOLS-EXPANSION-005` already committed to.
- Beta secret compared in constant time, never logged, never echoed in any response.
- Input size capped before any parsing (closes the one real abuse vector — a huge payload — for a stateless, unauthenticated-by-key beta endpoint).

## 8. Distribution / marketing surface

- Cross-sell link ("Use this via API →") from the existing `/tools/inpage-unicode-converter/` page — this is the only new UI surface, and it lives on a tools page, not an activation-governed route.
- npm README + one short reference doc are the only "developer portal" for this slice.
- Direct outreach (not paid marketing) to Urdu digitization/archive projects is the intended first-adopter channel; broad promotion is out of scope until Phase A/B usage validates demand.

## 9. Testing

- `tests/inpage-unicode-core.test.js` stays the engine's unchanged source of truth.
- New contract test for the API route (static + runtime assertions) — see implementation design doc §5.
- Full `npm test` must stay green; zero regression on the existing browser tool.

## 10. Acceptance criteria

- [ ] npm package published, `main` entry point unchanged in behavior from `js/inpage-unicode-core.js`.
- [ ] Beta API route live behind `INPAGE_API_ENABLED` kill switch and bearer secret.
- [ ] Both conversion directions verified end-to-end through the hosted route.
- [ ] No request/response content logged anywhere in the new code paths.
- [ ] Existing browser tool and its tests show zero regression.
- [ ] Cross-sell link added to the existing tool page only.

## 11. Future phases (Hold — evidence-gated, not part of this slice)

- Real per-developer API keys + durable monthly quota (mirrors InvoiceCraftly's Feature 102.4 — reuse that Durable Object pattern if/when write-urdu needs it).
- Batch/file conversion endpoint.
- Full developer portal with OpenAPI docs.
- `.inp` binary file support (already deferred by `WU-TOOLS-EXPANSION-005`).

These stay unbuilt until Phase A/B show real external demand — same discipline `WU-TOOLS-EXPANSION-006` already models for an idea correctly left on Hold.
