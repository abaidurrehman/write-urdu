# WU-AI-001 — Provider Terms & Retention Matrix

**Dated:** 2026-08-26
**Status:** Draft — sourced from public provider docs/terms via live fetch on this date. Not a legal sign-off. Re-verify immediately before flipping `AI_WRITING_ENABLED=true` (terms/pricing/limits change without notice — see spec §11.5, "No provider is 'approved forever'").

This satisfies the dated provider manifest required by `specs/WU-AI-001-urdu-ai-writing-assistant-platform.md` §11.5 before any provider is production-enabled.

---

## Mistral (`mistral-small-2603`) — primary benchmark candidate

| Field | Value | Source |
| --- | --- | --- |
| Terms checked | 2026-08-26 | [Privacy and data controls](https://docs.mistral.ai/admin/monitor-comply/privacy-data-controls), [Zero data retention](https://docs.mistral.ai/admin/monitor-comply/zero-data-retention), [Help: opt-out of training](https://help.mistral.ai/en/articles/455207-can-i-opt-out-of-my-input-or-output-data-being-used-for-training) |
| Training behavior | API data **not** used for model training, stated plan-independent: "data sent through the API isn't used for model training." Free **Vibe** chat product is separate and opt-out (not the API path this feature uses). | Mistral docs |
| Retention behavior | Not explicitly stated for stateless API on the page checked — prior spec text (§10) says PAYG customers are opted out of training by default and inputs are held ~30 rolling days for abuse monitoring unless ZDR is active. Could not re-confirm the exact 30-day figure from the fetched page; treat as **unconfirmed, re-verify**. | Mistral docs (partial) |
| ZDR / data controls | ZDR exists but is **not automatic** — requires (a) an active **paid plan**, and (b) an approved request reviewed case-by-case by Mistral via the Admin Panel. Applies to supported stateless endpoints (chat completions included), **excludes Labs models**. | Mistral docs |
| Data region | Not stated on pages checked. **TO VERIFY.** | — |
| Age/minor restrictions | None found specific to the API. | — |
| Commercial-use status | Permitted (PAYG/paid plan). | — |
| Current pricing | Spec's planning figure: $0.15/M input, $0.60/M output for Small. **Could not re-fetch live pricing page (JS-rendered, no figures returned) — re-verify at `mistral.ai/pricing` before launch**, same action as manual checklist item 3 (token budget). | Spec §10 (unverified today) |
| Current rate limits | Checked live 2026-08-26 at `admin.mistral.ai/plateforme/limits`: `mistral-small-2603` at 0.38 req/s (generous, not the real constraint). | Mistral admin console |
| **Account plan (checked live, 2026-08-26)** | **Free plan**, not a paid plan — confirmed via `Subscription` page: "$10/month" included API/Studio usage allowance, $0.01 used at check time, resets in ~5 days. This is a real hard cap distinct from our own `AI_WRITING_MONTHLY_TOKEN_BUDGET` guardrail: our 20M-token default (~$5-6/mo) fits under $10, but if usage exceeds the account's $10 allowance mid-cycle, Mistral calls will start failing at the account level (likely a `402`-style block, same failure pattern observed with Cerebras' unpaid quota) — not the graceful internal budget-exhausted response our own policy.mjs gives. **Also means ZDR is currently unavailable** — §11.5/ZDR docs require an active paid plan, which this account is not on. | Mistral admin console, live |
| **Decision (2026-08-26)** | **Stay on Free plan for launch.** Accepted: no ZDR available (relies on the ~30-day abuse-monitoring retention window + no-training-on-API-data terms instead); the $10/month hard cap is shared across all API/Studio usage on this account, not exclusive to this feature. Our `AI_WRITING_MONTHLY_TOKEN_BUDGET` default (20M tokens, ~$5-6/mo) leaves some headroom under the $10 wall, but isn't account-aware — if other usage on this Mistral account draws from the same $10 in a given month, this feature's own budget check can pass while the account still hits the wall and Mistral calls start failing. Worth monitoring actual spend after launch rather than assuming the internal budget alone prevents an outage. Revisit upgrading to a paid plan if usage grows or ZDR becomes a hard requirement later. | |

---

## Groq (`openai/gpt-oss-120b`) — primary/fallback benchmark candidate

| Field | Value | Source |
| --- | --- | --- |
| Terms checked | 2026-08-26 | [Your Data in GroqCloud](https://console.groq.com/docs/your-data), [Services Agreement](https://console.groq.com/docs/legal/services-agreement) |
| Training behavior | Does not train on customer API data by default. | Groq docs |
| Retention behavior | Inference requests retained up to 30 days (system reliability / abuse monitoring only); batch processing 30 days unless deleted earlier; fine-tuning data retained until customer deletion (not applicable to this feature). | Groq docs |
| ZDR / data controls | **Self-serve, available to all customers** — no sales negotiation required (this is newer than what spec §10 assumed). Enable via Data Controls in the Groq Console (`console.groq.com/settings/data-controls`), globally or per feature. Org admins can toggle it. | Groq docs |
| Data region | Customer data stored in GCP buckets in the United States; SCCs used for international transfers. | Groq docs |
| Age/minor restrictions | Not surfaced in the pages checked. **TO VERIFY** against the Services Agreement / AUP directly if Groq becomes primary. | — |
| Commercial-use status | Permitted. | — |
| Current pricing | Spec's planning figure: $0.15/M input, $0.60/M output. **Not re-fetched (pricing page returned no token figures) — re-verify at `groq.com/pricing`.** | Spec §10 (unverified today) |
| Current rate limits | Not re-verified. Check Groq Console before launch. | — |
| **Action needed before launch** | **Enable ZDR in Data Controls** — this is now the easy path since it's self-serve, unlike Mistral's approval-gated flow. Recommend this as the deciding factor if Groq is chosen as primary over Mistral. | |

---

## Cerebras (`gpt-oss-120b`) — latency/capacity challenger

| Field | Value | Source |
| --- | --- | --- |
| Terms checked | 2026-08-26 | [Does Cerebras retain my data?](https://support.cerebras.net/articles/1811589793-does-cerebras-retain-my-data), [Website Terms of Use](https://www.cerebras.ai/terms-of-service) |
| Training behavior | Not directly addressed in the support article checked — only retention is addressed. **TO VERIFY** via Terms of Service / DPA directly. | — |
| Retention behavior | States it does **not retain**: prompt content, API requests/responses, chat/transaction logs, user input or model output. Only operational data retained: org name, user emails, usage metrics (throughput, load, billing). Reads as a strong no-retention-by-default posture, but no stated exception window (unlike Mistral/Groq's 30-day abuse-monitoring carve-out) — worth confirming there isn't an undocumented one. | Cerebras support |
| ZDR / data controls | Effectively the default behavior per the retention statement above, rather than an opt-in toggle. **Confirm this is contractually guaranteed (DPA), not just a support-article claim**, before relying on it for a privacy commitment. | — |
| Data region | Not stated on the page checked. **TO VERIFY.** | — |
| Age/minor restrictions | Not found. **TO VERIFY.** | — |
| Commercial-use status | Fee-based service exists (Developer tier pricing referenced); permitted. | — |
| Current pricing | Spec flagged "revalidate direct terms/pricing" — still true. Developer tier has self-serve payment starting at $10, exact per-token gpt-oss-120b pricing not retrieved (page is JS-rendered). **Re-verify at `cerebras.ai/pricing`.** | Spec §10 (unverified today) |
| Current rate limits | Not re-verified. | — |
| **Action needed before launch** | Get the no-retention claim confirmed in the actual DPA/Terms of Service (not just the support-center article), since it's the strongest privacy posture of the three if true as stated. | |

---

## Gemini Flash family — benchmark-only, NOT production-approved

| Field | Value | Source |
| --- | --- | --- |
| Terms checked | 2026-08-26 (terms page itself last updated 2026-04-28, effective 2026-03-23) | [Gemini API Additional Terms of Service](https://ai.google.dev/gemini-api/terms) |
| Age/minor restrictions | Confirmed still in force, verbatim: *"You must be 18 years of age or older to use the APIs. You also will not use the Services as part of a website, application, or other service ... that is directed towards or is likely to be accessed by individuals under the age of 18."* Write Urdu is a general-public writing site with no age gate on the product itself (only a first-use 18+ acknowledgement on the AI feature specifically) — this clause blocks production use regardless of the in-app age gate, per spec §8.2. | Gemini API terms, verbatim |
| Training/retention (paid tier, for reference only) | Paid usage: prompts/responses **not** used to improve products; logged briefly only for Prohibited-Use-Policy detection; transient caching across Google facilities. Unpaid/free tier: content **can** be used to improve products and may be human-reviewed — must not be used at all for this feature under either tier given the age restriction above. | Gemini API terms |
| **Conclusion** | **No change from spec: Gemini stays benchmark/quality-control only.** Do not wire into any production path. Re-review only if Write Urdu ships an authenticated 18+-only surface that could isolate this feature from the general public site — not in scope now. | |

---

## Primary/fallback recommendation

Not finalized here — this document supplies the terms/retention inputs; the primary/fallback decision itself still depends on the **human-reviewed Urdu-quality benchmark scores** (manual checklist item 1, not yet done). Once those scores exist, combine with this matrix:

- **Groq deprioritized (2026-08-26 decision): no free tier** — confirmed by user account check, contradicts this doc's earlier "operationally simplest" framing which only weighed privacy terms, not cost. Groq stays documented above for reference but is dropped from the primary/fallback benchmark run and from the account-setup checklist unless a future free/trial tier reappears.
- **Mistral's** ZDR requires a paid plan plus a manually-approved request — budget lead time if Mistral wins on quality.
- **Cerebras deprioritized (2026-08-26): account not billing-activated.** The advertised "$5 free credits, no card" tier turned out to still require a verified payment method to unlock any quota — confirmed by hitting Cerebras's API directly (bypassing the AI Gateway): both models visible to this account (`gpt-oss-120b`, `gemma-4-31b`) return `402 payment_required_error / quota` regardless of model choice, so this is account billing state, not a model or gateway config issue. Cerebras stays documented above for reference (strong stated retention posture, still worth pursuing later) but is out of the benchmark run until a payment method is added and confirmed working.
- **Gemini** is excluded from the primary/fallback decision entirely (benchmark-only).

Revised candidate set for now: **Mistral only** (102/104 benchmark cases ran clean, 2026-08-26). Neither Groq nor Cerebras contribute benchmark rows to item 1 at this time. Per spec's own allowance, an explicit "not ready" conclusion on a second candidate is acceptable rather than blocking on it — Mistral can proceed through scoring/decision alone, with Cerebras revisited once billing is fixed.

## Open re-verification items (do immediately before enabling)

1. Mistral: confirm the ~30-day abuse-monitoring retention window still applies to the actual account/plan in use; confirm training opt-out for the specific plan tier purchased.
2. Mistral: re-fetch live pricing page (JS-rendered, blocked automated fetch today) and current rate limits — feeds directly into manual checklist item 3 (token budget tuning).
3. Mistral: confirm data region if it matters for any compliance requirement Write Urdu has.
4. ~~Groq ZDR toggle~~ — moot, Groq dropped from candidate set (no free tier).
5. Cerebras: add a verified payment method at `cloud.cerebras.ai` billing tab, confirm quota unlocks, then rerun `node scripts/ai-writing-benchmark/run.js --providers=cerebras` before reconsidering it as a candidate. Its no-retention claim (support article, not DPA) still needs confirming in contract text once/if it's back in play.
