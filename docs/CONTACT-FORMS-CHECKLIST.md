# Contact / feedback launch checklist

Before the protected forms are considered live in production:

- [ ] Turnstile widget exists for `write-urdu.com` and `www.write-urdu.com`.
- [ ] Pages has `TURNSTILE_SITE_KEY` and secret `TURNSTILE_SECRET_KEY`.
- [ ] Private `writeurdu-form-mailer` Worker is deployed with no public route.
- [ ] Mailer has destination-restricted `FORM_EMAIL`, `FORM_FROM_EMAIL` and secret `FORM_TO_EMAIL`.
- [ ] Pages `FORM_MAILER` Service binding points to the private mailer.
- [ ] `/api/form-config` reports `configured: true` in production.
- [ ] Contact test reaches the verified mailbox and Reply-To uses the visitor address.
- [ ] Anonymous Feedback test works without name/email.
- [ ] Invalid/cross-origin/oversized/no-Turnstile requests are rejected.
- [ ] `/contact` is indexable; `/feedback` remains noindex and both remain ad-free.

Until these bindings are configured, both pages visibly provide `admin@write-urdu.com` as the fallback contact route.
