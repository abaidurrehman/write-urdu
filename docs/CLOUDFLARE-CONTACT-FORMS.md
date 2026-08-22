# Cloudflare setup — Write Urdu contact and feedback forms

The public pages and Pages Functions are deployed with the site. The protected form remains disabled until these Cloudflare settings exist. The pages always keep `admin@write-urdu.com` as a fallback.

## 1. Create a Turnstile widget

Create one Cloudflare Turnstile widget for Write Urdu and allow:

- `write-urdu.com`
- `www.write-urdu.com`
- preview hostnames only when preview form submission is intentionally enabled

Record the site key and secret key. Do not commit either secret value.

## 2. Configure the Pages project

Add to the Write Urdu Cloudflare Pages project:

- `TURNSTILE_SITE_KEY` — environment variable
- `TURNSTILE_SECRET_KEY` — encrypted secret
- `FORM_MAILER` — Service binding to the private `writeurdu-form-mailer` Worker

Production and Preview settings are separate. Configure Preview only if form delivery from preview deployments is desired.

`METRICS_DB` is unrelated to contact forms; no D1 database is required for this feature.

## 3. Deploy the private mailer Worker

The Worker source is in:

`workers/form-mailer/src/index.js`

Use `workers/form-mailer/wrangler.example.jsonc` as the starting configuration. Copy it to a local Wrangler config, choose a sender on the Write Urdu Email Routing domain, and replace the destination placeholder with a destination address that has already been verified in Cloudflare Email Routing.

Recommended worker name:

`writeurdu-form-mailer`

The worker deliberately has:

- `workers_dev: false`
- `preview_urls: false`
- no public route
- a destination-restricted `send_email` binding

### Workers Free plan

Write Urdu does not require arbitrary-recipient Email Sending. The form only needs to notify one fixed owner inbox. Cloudflare allows Workers on the Free plan to send to verified Email Routing destination addresses.

Accordingly, the mailer uses the legacy `EmailMessage` API over the destination-restricted `send_email` binding. Do not purchase Workers Paid solely for this contact-form workflow and do not depend on the Email Sending Beta onboarding screen.

Requirements for the free-plan path:

- Email Routing is enabled for `write-urdu.com`.
- the destination inbox is present and verified under Email Routing destination addresses.
- `FORM_EMAIL.destination_address` is exactly that verified destination.
- `FORM_TO_EMAIL` is exactly the same verified destination.
- `FORM_FROM_EMAIL` remains on the Write Urdu routing domain, currently `forms@write-urdu.com`.

Set the Worker secret:

`FORM_TO_EMAIL`

The secret must match the destination configured by the `FORM_EMAIL` binding. The sender defined by `FORM_FROM_EMAIL` must also match an allowed sender address in that binding.

## 4. Bind Pages to the Worker

In the Write Urdu Pages project add a Service binding:

- variable name: `FORM_MAILER`
- service: `writeurdu-form-mailer`

The Pages Function sends only an internal JSON notification to `https://form-mailer.internal/send`. The visitor cannot choose the email destination or control the email subject prefix.

## 5. Verify production behaviour

After deployment:

1. Open `/api/form-config` on `www.write-urdu.com`.
2. Confirm the JSON reports `configured: true` and exposes only the Turnstile site key.
3. Open `/contact`, complete Turnstile, send a short test message, and confirm it reaches the verified inbox.
4. Repeat from `/feedback` without providing a name/email to confirm anonymous feedback works.
5. Verify an invalid topic, missing Turnstile token, cross-origin POST and oversized body are rejected.
6. Confirm the email subject begins with `[Write Urdu Contact]` or `[Write Urdu Feedback]` and that a visitor email is used only as Reply-To.

## Data boundary

The form endpoint does not read editor storage, D1 product telemetry, Card Studio assets, QR projects or invoice drafts. It receives only the fields explicitly submitted by the form plus normal request information handled by Cloudflare/Turnstile during request delivery and spam verification.
