# WU Unified Urdu Input — Orchestrator Skill

Use this skill to plan or execute `WU-VOICE-PLAT-001` across its slices.

## Read in this order

1. `specs/WU-VOICE-PLAT-001-unified-urdu-input-platform.md`
2. the current slice (`001A`, `001B`, `001C` or `001D`)
3. `specs/WU-TOOLS-EXPANSION-004-urdu-voice-typing.md`
4. `specs/WU-PLAT-002-v2-product-journey-workspace-handoffs.md`
5. the owning workspace spec(s)
6. `specs/WU-I18N-001-crawlable-urdu-locale.md`

## Core rule

Voice, English letters → Urdu and direct Urdu must edit **one owning text/document state**.

Do not create a separate embedded voice transcript that requires copying into the real field.

## Slice routing

### `WU-VOICE-PLAT-001A`
Use `.claude/skills/wu-unified-urdu-input-build/SKILL.md`.

Purpose: extract/reuse shared speech core, generic insertion adapter and dedicated Voice route parity.

### `WU-VOICE-PLAT-001B`
Use `.claude/skills/wu-unified-urdu-input-rollout/SKILL.md`.

Purpose: Basic Writer, Rich Editor, Urdu Keyboard, optional My Documents creation entry.

### `WU-VOICE-PLAT-001C`
Use `.claude/skills/wu-unified-urdu-input-rollout/SKILL.md`.

Purpose: Card Studio pilot, Instagram, WhatsApp Status, Stylish Urdu, Name Art.

### `WU-VOICE-PLAT-001D`
Use repository `skills/unified-urdu-input/SKILL.md` plus growth/analytics contracts.

Purpose: cross-product measurement, truthful product copy, WhatsApp message outcome, evidence-gated SEO growth.

## Non-negotiables

- one shared speech core;
- no paid speech API/new DB;
- no microphone permission on page load;
- interim speech is transient;
- final speech inserts at current caret/selection/model target;
- manual edits win;
- switching input method never clears text;
- recognized Urdu is not automatically transliterated/re-written;
- no audio/transcript/user text in telemetry/URLs;
- established route/canonical/search ownership remains intact;
- active authoring AdSense boundaries remain intact;
- Urdu locale controls/artifacts remain deterministic.

## Before coding

Inspect current source and tests. Search for shared owners rather than trusting old filenames blindly.

At minimum inspect:

```text
js/urdu-voice-typing.js
js/input-mode.js
js/product-telemetry.js
js/text-handoff.js
js/workspace-handoff.js
locale/ur.js
scripts/generate-urdu-locale.js
```

For creation rollout also inspect Card Studio/social/Stylish/Name Art modules.

## PR discipline

Do one slice or bounded sub-slice per PR.

Do not combine shared-core extraction with every workspace rollout.

Each PR reports:

- what shared abstraction changed;
- which real editable target receives speech;
- Voice → Roman/direct correction evidence;
- tests/real-device validation;
- privacy/locale/SEO impact;
- later slices intentionally left out.

## Required checks

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

Voice-touching UI/lifecycle work also follows the physical-device checklist in `WU-TOOLS-EXPANSION-004`.
