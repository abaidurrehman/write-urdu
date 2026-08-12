# Write Urdu feature specifications

Feature work is tracked with stable IDs so implementation, tests and future product feedback can refer to the same contract.

**Priority and build order live in [`specs/BACKLOG.md`](BACKLOG.md).** This file is the feature-spec registry; it is not the roadmap.

| ID | Feature | Route | Status |
| --- | --- | --- | --- |
| `WU-GROWTH-001` | Search Console + AdSense Growth System | Sitewide | Active — mature-domain authority/growth control plane |
| `WU-PLAT-001` | Unified product journey and acquisition-first homepage | `/` and related tools | Implemented — foundation complete |
| `WU-CS-UX-001` | Urdu Card Studio guided workflow | `/urdu-card-studio` | Implemented core — v2 migration pending |
| `WU-CS-UX-002` | Urdu Card Studio empty-state guidance | `/urdu-card-studio` | Implemented core — v2 migration pending |
| `WU-SM-001` | WhatsApp Status and Instagram Makers | `/urdu-whatsapp-status-maker`, `/urdu-instagram-post-maker` | Implemented core — v2 migration pending |
| `WU-SUA-001` | Stylish Urdu Text and Name Art Studio | `/stylish-urdu-text-generator`, `/urdu-name-art-maker` | Implemented — acceptance closed; v2 shell migration later |
| `WU-IG-001` | Urdu / English Invoice Generator | `/urdu-invoice-generator` | Implemented — strategy review before v2 migration |
| `WU-IG-002` | Invoice visual polish and adaptive layout | `/urdu-invoice-generator` | Implemented — follows invoice strategy decision |
| `WU-IG-003` | Invoice refinement v1.2 | `/urdu-invoice-generator` | Implemented — follows invoice strategy decision |
| `WU-SEO-001` | New-tool marketing and SEO launch | Sitewide | Superseded — absorbed by `WU-PLAT-001`, SEO-A1 and `WU-GROWTH-001` |

## Status vocabulary

Use only these states for feature governance:

- **Active** — an ongoing control plane or currently executed feature.
- **Implemented** — feature contract is complete; later visual migration does not reopen the feature.
- **Implemented core — acceptance pending** — substantial implementation exists but the spec checklist has not been fully closed.
- **Planned** — approved work with a real roadmap slot.
- **Hold** — valid idea requiring evidence or a dependency before scheduling.
- **Superseded** — requirements were absorbed by a later implementation/spec and should not compete for roadmap priority.

New specifications should use the `WU-<AREA>-<NUMBER>` format and include route, scope, state/data contract, acceptance criteria, implementation map and verification commands. A new spec is not automatically a priority: it enters `specs/BACKLOG.md` only after its user value, route ownership, commercial rationale and dependencies are clear.
