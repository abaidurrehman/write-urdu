# WU-CARD-RETENTION-001 — Acceptance Matrix

**Parent:** `WU-CARD-RETENTION-001-card-retention-sharing-engine.md`  
**First child:** `WU-CARD-RETENTION-001A-homepage-contextual-featured-card.md`

Slice A is accepted only when every P0 row below is green or has an explicit founder-approved waiver recorded in the PR/spec decision log.

| Area | Acceptance | Priority | Evidence |
| --- | --- | --- | --- |
| Homepage hierarchy | Core Urdu writer remains primary; featured card is after the writing experience | P0 | DOM/order test + mobile screenshot/manual QA |
| Homepage scope | Exactly one featured card; no carousel, chips, gallery or secondary card feed | P0 | contract/browser test |
| Actions | Exactly two primary card actions: Share + Open in Card Studio | P0 | DOM/browser test |
| Context | Morning/daytime/evening/night boundaries are deterministic | P0 | pure unit tests |
| Friday | Local Friday overrides normal time bucket | P0 | unit + browser clock fixture |
| Stability | Same date/context yields same card; no reload randomness | P0 | unit test |
| Canonical data | Homepage selects from canonical ready-made card registry | P0 | source contract |
| Editorial safety | Featured candidates pass public/source/rights gates | P0 | registry validation/manual review |
| Visual resolution | Selected card background exists and safe-area metadata is usable | P0 | registry test |
| Preview accessibility | Urdu message is real DOM text with Urdu language + RTL semantics | P0 | DOM/accessibility test |
| Preview performance | No canvas on mount; only one visual asset is needed | P0 | source/perf inspection |
| Share reuse | Homepage does not contain a cloned copy of ready-made-card share publisher | P0 | source contract/review |
| Share success | Existing `/urdu-cards` real `/s/...` share publishing remains green after reuse/refactor | P0 | browser/API-mocked test |
| Share fallback | No Web Share or publish failure produces a safe fallback, not a dead button | P0 | browser tests |
| Handoff privacy | Card text is not placed in URL | P0 | browser/source test |
| Handoff source | `home-featured-card` is explicitly allowlisted; validation is not weakened globally | P0 | source contract |
| Handoff fidelity | Card Studio restores exact selected text + background | P0 | end-to-end browser test |
| Writer independence | Missing/broken card data does not prevent typing/copy/export | P0 | failure-path browser test |
| Mobile | No page-level horizontal overflow at 320/360/390/430 widths | P0 | browser tests |
| Mobile activation | Existing mobile editor visibility/keyboard acceptance remains green | P0 | focused regression suite |
| Locale | English and Urdu homepage outputs follow locale-generation ownership | P0 | `npm run locale:check` |
| Telemetry privacy | No user/editor text or recipient/share-target identity is logged | P0 | source/allowlist test |
| Telemetry boundedness | Card ID/context/action use controlled values only | P0 | telemetry contract test |
| SEO | No new route/canonical/keyword-page expansion in Slice A | P0 | diff/SEO checks |
| Rollback | Homepage module can be removed/disabled without affecting `/urdu-cards` or writer | P1 | architecture review |
| Content depth | More than one approved candidate exists for recurring contexts where practical | P1 | registry audit |
| Return measurement | Context/action funnel is observable without private content | P1 | Product Pulse/telemetry validation |

---

## Required boundary fixtures

Use fixed local dates/times in tests so results are independent of CI timezone.

```text
Thursday 2026-09-17 04:59 → night
Thursday 2026-09-17 05:00 → morning
Thursday 2026-09-17 11:59 → morning
Thursday 2026-09-17 12:00 → daytime
Thursday 2026-09-17 17:59 → daytime
Thursday 2026-09-17 18:00 → evening
Thursday 2026-09-17 21:59 → evening
Thursday 2026-09-17 22:00 → night
Thursday 2026-09-17 23:59 → night
Friday   2026-09-18 00:00 → friday
Friday   2026-09-18 08:00 → friday
Friday   2026-09-18 20:00 → friday
Saturday 2026-09-19 00:00 → night
```

The implementation may inject/provide `Date` to the selector for testability. Do not monkey-patch unrelated global date behavior if a pure API can avoid it.

---

## Manual visual acceptance questions

A reviewer should be able to answer **yes** to all of these:

1. Can I still understand within a second that the homepage is primarily for writing Urdu?
2. After using/seeing the writer, is the featured card easy to notice without feeling like an ad?
3. Can I read the Urdu card comfortably on a normal phone?
4. Are Share and Card Studio the only obvious next actions?
5. Does Friday content feel deliberate rather than randomly promotional?
6. Does the module visually belong to Write Urdu/Card Studio?
7. If I ignore the card entirely, is the rest of the homepage unchanged and usable?
8. When I open Card Studio, do I get exactly what I saw?
9. When I share, do I get a real recipient-safe link/image path rather than a technical fragment?
10. Would removing this module be a small isolated rollback rather than a homepage rewrite?

---

## Release blockers

Do not merge Slice A if any of these are true:

- card appears before the core editor on mobile;
- more than one card is visible by default;
- a carousel/category browser was added;
- share code was duplicated rather than safely reused;
- Card Studio seed accepts arbitrary unknown source workspaces;
- text/background restoration is flaky;
- Friday selection depends on server/geolocation data;
- unverified religious quotation is featured;
- homepage card failure breaks writer initialization;
- mobile editor activation regression returns;
- telemetry contains user/editor content;
- `npm test`, locale check, or focused card/homepage tests are red without a documented unrelated-main failure.