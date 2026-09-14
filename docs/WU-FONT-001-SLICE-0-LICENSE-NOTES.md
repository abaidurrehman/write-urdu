# WU-FONT-001 Slice 0 — Authoritative License Notes

Captured 2026-09-14.

This file records only decisions needed to keep implementation safe. It is not legal advice.

## Current Google Fonts families

Current shipped Google Fonts families used by Write-Urdu are treated as existing `approved-web` dependencies in the Slice 0 fixture. Slice 0 does not copy or vendor their binaries.

## Mehr Nastaliq Web

Official product page: https://mehrtype.com/product/mehr-nastaliq-web/

Official general/webfont EULA: https://mehrtype.com/eula/

Decision: `license-review`.

Reason: the product page contains a Creative-Commons-style commercial-use statement, while the current Mehr Type EULA separately requires a webfont licence for web embedding and defines webfont-specific limits/conditions. Do not ship or self-host until the applicable terms for this exact free font/product are clarified and preserved.

## Awami Nastaliq

Official product/download: https://software.sil.org/awami/

Decision: rights evidence supports use/modification/redistribution under the SIL Open Font License, but Write-Urdu product delivery remains a later technical acceptance decision. Slice 0 therefore records it as an approved system/reference candidate rather than promising web/export parity.

## Jameel Noori, Nafees, AlQalam Taj, AA Sameer Sagar, Gandhara Suls

Decision: `license-review`.

Do not use third-party font download mirrors as redistribution/web-embedding authority. Keep reference/system-only until original author/foundry evidence is captured.
