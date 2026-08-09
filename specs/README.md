# Write Urdu feature specifications

Feature work is tracked with stable IDs so implementation, tests, and future
product feedback can refer to the same contract.

**Priority and build order live in [`specs/BACKLOG.md`](BACKLOG.md).** This file
is the feature-spec registry; it should not be used as the roadmap.

| ID | Feature | Route | Status |
| --- | --- | --- | --- |
| `WU-GROWTH-001` | Search Console + AdSense Growth System | Sitewide | Ready for evidence baseline; commercial prioritization P0 |
| `WU-CS-UX-001` | Urdu Card Studio guided workflow | `/urdu-card-studio` | Implemented; v2 migration queued |
| `WU-SM-001` | WhatsApp Status and Instagram Makers | `/urdu-whatsapp-status-maker`, `/urdu-instagram-post-maker` | Implemented; v2 migration queued |
| `WU-SUA-001` | Stylish Urdu Text and Name Art Studio | `/stylish-urdu-text-generator`, `/urdu-name-art-maker` | Implementing; acceptance closure P0 |
| `WU-CS-UX-002` | Urdu Card Studio empty-state guidance | `/urdu-card-studio` | Implemented; v2 migration queued |
| `WU-IG-001` | Urdu / English Invoice Generator | `/urdu-invoice-generator` | Implemented; v2 migration queued |
| `WU-IG-002` | Invoice visual polish and adaptive layout | `/urdu-invoice-generator` | Implemented; v2 migration queued |
| `WU-IG-003` | Invoice refinement v1.2 | `/urdu-invoice-generator` | Implemented; v2 migration queued |
| `WU-PLAT-001` | Unified product journey and acquisition-first homepage | `/` and related tools | Implemented — P0 foundation |

New specifications should use the `WU-<AREA>-<NUMBER>` format and include the
route, scope, state/data contract, acceptance criteria, implementation map, and
verification commands. A new spec is not automatically a priority: it enters
`specs/BACKLOG.md` only after its user value, route ownership, commercial
rationale and dependencies are clear.
