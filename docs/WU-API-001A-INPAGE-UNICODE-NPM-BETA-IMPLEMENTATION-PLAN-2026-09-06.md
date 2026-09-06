# WU-API-001A — InPage↔Unicode npm Package + Beta API (Implementation Design)

**Status:** approved for implementation
**Date:** 2026-09-06
**Depends on:** `WU-TOOLS-EXPANSION-005` (implemented, archived)
**Spec:** `specs/WU-API-001-inpage-unicode-developer-api.md`

## 1. Purpose

`WU-TOOLS-EXPANSION-005` proved the InPage↔Unicode engine works, browser-side, for a human pasting text. This slice makes the same engine reachable by developers, in the two lowest-cost forms available: an npm package (no server at all) and a single-secret beta HTTP API (mirrors InvoiceCraftly's own Feature 102.3 sequencing — shared secret before real keys).

## 2. Survey grounding this design

- **The engine has no compute cost worth discussing.** `js/inpage-unicode-core.js`'s `decodeLegacyText`/`encodeUnicodeText` are a single `for` loop over the input with constant-time object-key lookups — no regex backtracking, no external calls, no model load. O(n) in character count; a full document converts in low single-digit milliseconds of CPU time. There is no Durable Object, no D1 write, and no WASM binary anywhere in this path.
- **The module is already UMD**, meaning it already supports both `require()` (`module.exports`) and a browser global (`window.WriteUrduInPageCore`). Packaging for npm should require **no logic changes** — only `package.json` + `README.md`. This must be verified, not assumed (Step 3a below).
- **No existing write-urdu route needs CORS.** Every route under `functions/api/` (`document-translate.js`, `documents.js`, etc.) is same-origin only, called from write-urdu's own pages. This is the first route meant for third-party callers, so it is also the first route that needs explicit CORS handling — do not copy this onto any existing route.
- **No `/api/v1/` namespace exists yet.** Every existing route is a flat `functions/api/<name>.js`. This slice introduces the first versioned namespace; that precedent is deliberate (mirrors InvoiceCraftly's `/api/v1/documents/...`) so a future breaking change has somewhere to go without disturbing this route.
- **No shared-secret compare helper exists in this repo.** InvoiceCraftly's `functions/lib/bearer-secret.js` is the pattern to imitate (constant-time compare, never logged), not a file to import across repos — write two dozen lines of the same technique locally.
- **House error-response convention** is `{ ok: false, error: '<snake_case_code>' }` (see `document-translate.js`), not InvoiceCraftly's `PublicErrorEnvelopeV1` enum shape. Keep this slice consistent with write-urdu's own codebase, not the sibling repo's vocabulary.

## 3. Scope decisions

### 3a. npm package

- **First, verify the module boundary.** Confirm Cloudflare Pages Functions' esbuild-based bundler can `import` the UMD file's `module.exports` via CJS interop from the new route (Step 3b). If it cannot cleanly:
  - add a thin `functions/lib/inpage-unicode.mjs` that `require()`s or re-exports the same functions;
  - it must call into the existing module — never redefine or copy the mapping tables into a second location.
- Package name: `write-urdu-inpage-unicode` (confirm npm org/scope availability with the founder before publishing).
- `package.json`: `main` (and `module`, if a `.mjs` wrapper is added) point at the existing core file; zero new runtime dependencies.
- License: confirm with the founder before publishing (do not assume MIT).
- README: usage examples for both directions, `converted`/`unsupported`/`warnings` fields explained, links to the live browser tool and the beta API reference doc.
- Publish via `npm publish --access public` — manual, founder-controlled (npm account/2FA).

### 3b. Beta API route

- New route: `functions/api/v1/inpage-unicode/convert.js`.
- **Kill switch:** `env.INPAGE_API_ENABLED !== 'true'` → 503 `{ ok: false, error: 'conversion_service_not_configured' }`, matching the `DOCUMENTS_ENABLED`/`AUTH_ENABLED` convention already used across this codebase.
- **Auth:** single shared bearer secret `env.INPAGE_API_BETA_SECRET`, compared in constant time (small local helper, not borrowed from another repo). Missing/mismatched → 401 `authentication_failed`.
- **CORS:** explicit `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: POST, OPTIONS`, `Access-Control-Allow-Headers: content-type, authorization`, plus an `onRequestOptions` preflight handler. This is the first CORS-enabled route in the repo — do not let it leak onto any existing same-origin route.
- **Request:** `{ direction: 'legacy-to-unicode' | 'unicode-to-legacy', text: string }`. Invalid/missing `direction` → 400 `invalid_direction`; missing/empty `text` → 400 `invalid_request`.
- **Size caps**, enforced before parsing (mirror `document-translate.js`'s declared-`Content-Length` check first, then body-length check): a body cap (e.g. 200,000 bytes) and a text-length cap (e.g. 100,000 characters) — larger than `document-translate.js`'s translation caps since this is a cheap synchronous transform, not a paid inference call. Oversized → 413 `payload_too_large`.
- **Response:** pass through `decodeLegacyText`/`encodeUnicodeText`'s existing return shape unchanged — `{ ok: true, text, converted, unsupported, warnings, profile }`. No adapter layer; the engine's native output is already the API's output.
- **Rate limiting:** Cloudflare Rate Limiting binding, 10 req/min keyed on the bearer secret — binding/dashboard wiring is a manual, founder-only step (cannot be verified by `node:test`, same class of gap InvoiceCraftly flagged for its own 102.1/102.3 bindings).
- **No logging:** request/response text is never written to `console.*` anywhere in this route, matching the rule already enforced on `functions/lib/documents.mjs`.

## 4. Architecture

```text
POST /api/v1/inpage-unicode/convert          (functions/api/v1/inpage-unicode/convert.js — new)
  OPTIONS preflight → CORS headers, 204
  env.INPAGE_API_ENABLED !== 'true'          → 503 conversion_service_not_configured
  Authorization: Bearer <shared beta secret> → constant-time compare → 401 authentication_failed
  Content-Length / body-size guard           → 413 payload_too_large
  Content-Type must be application/json      → 415 json_required
  body: { direction, text }                  → 400 invalid_direction / invalid_request on failure
  → require('../../../js/inpage-unicode-core.js')  (or functions/lib/inpage-unicode.mjs re-export)
       decodeLegacyText(text) | encodeUnicodeText(text)
  → 200 { ok: true, text, converted, unsupported, warnings, profile }
```

No Worker, no service binding, no D1, no Durable Object — the entire handler runs inside the Pages Function.

## 5. Testing

- `tests/inpage-unicode-core.test.js` — unchanged, stays the engine's source of truth.
- New `tests/inpage-unicode-api-contract.test.js`:
  - static assertions: kill switch present; bearer check present; CORS headers present; route delegates to the shared engine module rather than a duplicated mapping table; no `console.*` calls.
  - runtime handler test with a fake `Request`/`env` (pattern from `tests/documents-contract.test.js`): missing/wrong secret → 401; oversized body → 413; malformed JSON → 400; both directions on valid input → 200 with the expected fields.
- Add the new test file to `scripts/run-contract-tests.js`'s list.
- Full `npm test` must stay green — zero regression on `WU-TOOLS-EXPANSION-005`'s existing browser-tool contract test.
- **Not covered by automated tests (manual, post-deploy):** the live Cloudflare Rate Limiting binding's actual 429 behavior — cannot be simulated in `node:test`, same flagged gap InvoiceCraftly reported for its own Rate Limiting bindings.

## 6. Explicit non-goals for this slice

- No real API-key table, no per-developer identity (future phase, spec §11).
- No durable monthly quota — Rate Limiting binding is burst-only, same as InvoiceCraftly's 102.3.
- No developer portal beyond one reference doc.
- No billing.
- No `.inp` binary file support.
- No change to `/tools/inpage-unicode-converter/`'s existing behavior beyond adding one outbound link.

## 7. Manual steps only the founder can perform

1. Confirm npm org/scope for `write-urdu-inpage-unicode` and the package license.
2. Set `INPAGE_API_ENABLED=true` and `INPAGE_API_BETA_SECRET=<value>` on the live Cloudflare Pages project.
3. Wire the Cloudflare Rate Limiting binding (10 req/min) for the new route.
4. Hand the beta secret to the first 2–3 external testers by hand (mirrors InvoiceCraftly's 102.3 distribution — no self-serve signup in this slice).
