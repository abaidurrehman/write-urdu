# WU-INPUT-001F acceptance evidence

This directory tracks activation decisions for existing preview capabilities. It does not enable runtime gates.

- `acceptance-plan.json` defines required rows, prerequisites and evidence.
- `activation-status.json` records current evidence state and recommendation.
- `evidence/` contains sanitized, dated evidence records without credentials or private user content.
- `validate.mjs` checks structure and fails if a ready decision lacks passing evidence.

Run:

```bash
npm run benchmark:input-activation:check
```

Live text/dictionary runs reuse `../wu-input-001a/run-live.js`. Live audio runs reuse `../wu-input-001a/run-audio-live.js`. See `../wu-input-001a/README.md` for explicit environment variables and commands.

Do not commit secrets, production user content, private recordings or unsanitized provider-console exports. Missing external evidence must remain `unavailable` or `not-run`.
