# WU-PLAT-004A production hotfix — Basic Writer Share

Date: 2026-08-18

## Production observation

After WU-PLAT-004 reached production, the new first-class green **Share** command still delegated to the legacy native text-only share path. That made the most prominent completion action semantically inconsistent with the existing Write-Urdu public-share loop.

The live toolbar also exposed duplicated labels such as `Copy Copy text`, `PDF PDF document`, `Word Word document` and `PNG PNG image`. This came from legacy locale markers remaining attached to source buttons after the command toolbar took visual ownership.

## Hotfix

- Primary Basic Writer **Share** now opens an explicit public-share confirmation.
- Publication reuses the existing `/api/shares` infrastructure and generates an opaque `write-urdu.com/s/{id}` link.
- Basic Writer generates a controlled 1200×630 social-preview PNG while the public page retains bounded selectable plain text.
- Native device sharing occurs only after publication and shares the Write-Urdu short URL, not the raw document as the primary payload.
- The existing local management-token model supports later deletion.
- An unchanged locally managed Basic Writer snapshot can reuse its existing short URL.
- Toolbar ownership clears inherited legacy i18n markers so compact labels remain singular.
- PWA cache advances to `write-urdu-shell-v23`.

## Guardrails

- No silent publication from the first toolbar click.
- No user text in URLs or anonymous telemetry.
- No route/canonical/title changes.
- No transliteration or export-engine changes.
- No AdSense changes.
- Public share pages remain unlisted, noindex and ad-free.

See `specs/WU-PLAT-004A-basic-writer-public-share-short-link.md` for the normative contract.
