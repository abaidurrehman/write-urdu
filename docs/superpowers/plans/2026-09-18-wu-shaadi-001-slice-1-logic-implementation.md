# WU-SHAADI-001 Slice 1 Logic-Only Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the pure-logic subset of WU-SHAADI-001 Slice 1 — local draft persistence, deterministic wording-template/design-palette selection, composer step-completeness reporting, and wording-override tracking — with zero DOM, zero route, and zero new public surface.

**Architecture:** Three modules follow the repo's existing UMD (Node-and-browser) factory pattern used by `js/wedding-project-core.js` and `js/card-studio-background-library.js`. `js/wedding-project-core.js` gains new pure functions (no new dependencies). `js/wedding-template-selector.js` is a new file that depends one-way on `js/wedding-wording-registry.js` and `js/card-background-registry.js` (both pure data modules, dependency direction matches the existing `card-studio-background-library.js` → `card-background-registry.js` precedent). `js/wedding-project-storage.js` is a new file that depends one-way on `js/wedding-project-core.js` for normalization, following the fail-closed pattern already used by `js/invoice-generator.js`'s `loadDraft`/`saveDraft`.

**Tech Stack:** Plain ES5-style UMD JavaScript (matches existing `js/*.js` files exactly — no ES6 classes, no build step), Node `assert/strict` for tests (matches `tests/wedding-project-core.test.js`'s plain-script style, not a test framework), tests run via `node scripts/run-contract-tests.js` (aliased to `npm test`).

**Spec:** `docs/superpowers/specs/2026-09-18-wu-shaadi-001-slice-1-logic-design.md`

## Global Constraints

- No new public route, no HTML/CSS, no `/urdu-wedding-invitation-maker` work — this plan is logic/tests only (spec "Why this slice is scoped the way it is").
- `WeddingProject` (via `js/wedding-project-core.js`) stays the single source of truth; no new module may duplicate or bypass its validation/normalization (skill rule #1).
- `suffixStyle` must always default to `'none'`; empty `invitedEventIds` must always mean incomplete, never "all events" — both already enforced by existing `js/wedding-project-core.js` code and must not be weakened by any change in this plan.
- No AI/LLM call may touch `RELIGIOUS_LIBRARY` or `religiousOpening` — this plan does not touch that code path at all.
- `js/wedding-template-selector.js`'s design-palette suggestion is a **suggestion only** — it must never auto-apply a background or mutate a `WeddingProject` (Card Studio boundary rule, spec §5).
- No new SVG/art assets or new wording copy are created in this plan — tracked separately in `specs/BACKLOG.md` P1.10 (spec §5 "Follow-up production tasks").
- Every new test file must be registered in `scripts/run-contract-tests.js`'s test list or it will silently not run under `npm test`.
- After every task: `npm test` must report all tests passing with no reduction in count, and `node scripts/check-product-governance.js` must report unchanged counts (45 pages / 49 sitemap routes / 102 redirect rules).
- Never weaken or delete an existing assertion to make a task's tests pass.

---

### Task 1: Core domain additions — wordingTone, composer steps, wording-override tracking

**Files:**
- Modify: `js/wedding-project-core.js`
- Test: `tests/wedding-project-core.test.js` (append; already registered in `scripts/run-contract-tests.js`)

**Interfaces:**
- Consumes: existing `normalizeWeddingProject(raw)`, `normalizeEvent(value, index)`, `hasMeaningfulText(value)`, `text(value)`, `enumOrFallback(value, allowed, fallback)`, `INVITATION_LANGUAGES` (all already defined in this file).
- Produces (new exports later tasks rely on):
  - `WORDING_TONES` — `['formal', 'informal', 'concise']`
  - `event.wordingTone` — new field on every normalized event object, one of `WORDING_TONES`, default `'formal'`
  - `evaluateComposerSteps(rawProject)` → `Array<{ step: string, status: 'complete'|'current'|'blocked'|'available', missingFields: string[], designDefault?: { templateId: string, presetId: string } }>`
  - `snapshotWordingSourceFields(project, event)` → `{ personA: string, personB: string, eventDate: string, venueName: string }`
  - `wrapWordingResult(renderResult, templateId, project, event)` → `{ text: string, isOverridden: false, generatedFrom: { templateId: string, sourceFieldsSnapshot: object } } | null`
  - `applyWordingOverride(wordingResult, newText)` → `{ text: string, isOverridden: true, generatedFrom: object }`
  - `isWordingStale(wordingResult, project, event)` → `boolean`

- [ ] **Step 1: Write the failing tests**

Append to the end of `tests/wedding-project-core.test.js`:

```js
// --- Slice 1: wordingTone field, never inferred, defaults to 'formal' ---
const wordingToneProject = core.normalizeWeddingProject({
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  events: [{ id: 'evt-nikah', type: 'nikah', date: '2026-12-05' }]
});
assert.equal(wordingToneProject.events[0].wordingTone, 'formal', 'wordingTone must default to formal, never be inferred');
assert.deepEqual(core.WORDING_TONES, ['formal', 'informal', 'concise']);

const explicitToneProject = core.normalizeWeddingProject({
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  events: [{ id: 'evt-mehndi', type: 'mehndi', date: '2026-12-01', wordingTone: 'informal' }]
});
assert.equal(explicitToneProject.events[0].wordingTone, 'informal');

const invalidToneProject = core.normalizeWeddingProject({
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  events: [{ id: 'evt-mehndi', type: 'mehndi', date: '2026-12-01', wordingTone: 'shouty' }]
});
assert.equal(invalidToneProject.events[0].wordingTone, 'formal', 'unknown wordingTone must fall back to the default, never throw');

// --- Slice 1: evaluateComposerSteps ---
const emptyProject = core.createDefaultWeddingProject(new Date('2026-09-18T00:00:00Z'));
const emptySteps = core.evaluateComposerSteps(emptyProject);
assert.deepEqual(emptySteps.map((step) => step.step), ['events', 'hosts', 'schedule_venue', 'language_wording', 'design', 'preview_export']);
assert.equal(emptySteps[0].status, 'current', 'The first incomplete step on an empty project must be "current"');
assert.deepEqual(emptySteps[0].missingFields, ['events']);
assert.equal(emptySteps[1].status, 'blocked', 'Steps after the current incomplete step must be blocked');
assert.equal(emptySteps[4].status, 'blocked', 'Design step must be blocked until steps 1-4 are complete');
assert.equal(emptySteps[5].status, 'blocked', 'Preview/export must be blocked until steps 1-5 are complete');

const completeProject = core.normalizeWeddingProject({
  invitationLanguage: 'urdu',
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  families: [{ id: 'fam-1', role: 'both', displayName: 'The Khan Family' }],
  events: [{ id: 'evt-nikah', type: 'nikah', date: '2026-12-05' }]
});
const completeSteps = core.evaluateComposerSteps(completeProject);
assert.ok(completeSteps.slice(0, 4).every((step) => step.status === 'complete'), 'All four content steps must report complete once satisfied');
assert.equal(completeSteps[4].step, 'design');
assert.equal(completeSteps[4].status, 'complete', 'Design step 5 is a fixed-default stub: complete once steps 1-4 are done');
assert.deepEqual(completeSteps[4].designDefault, { templateId: 'classic-nastaliq', presetId: 'portrait' }, 'Design default must match the render adapter default');
assert.equal(completeSteps[5].step, 'preview_export');
assert.equal(completeSteps[5].status, 'available', 'Preview/export becomes available once steps 1-5 are complete');

// --- Slice 1: wording-override tracking ---
const overrideProject = core.normalizeWeddingProject({
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  venues: [{ id: 'venue-1', name: 'Pearl Continental' }],
  events: [{ id: 'evt-nikah', type: 'nikah', date: '2026-12-05', venueId: 'venue-1' }]
});
const overrideEvent = overrideProject.events[0];
const overrideRender = wording.renderWording('formal-nikah-ur', overrideProject, overrideEvent);
assert.equal(overrideRender.complete, true);

const wrapped = core.wrapWordingResult(overrideRender, 'formal-nikah-ur', overrideProject, overrideEvent);
assert.equal(wrapped.isOverridden, false);
assert.equal(wrapped.text, overrideRender.text);
assert.deepEqual(wrapped.generatedFrom, {
  templateId: 'formal-nikah-ur',
  sourceFieldsSnapshot: { personA: 'Ali', personB: 'Sara', eventDate: '2026-12-05', venueName: 'Pearl Continental' }
});

assert.equal(core.isWordingStale(wrapped, overrideProject, overrideEvent), false, 'Freshly wrapped wording must not be stale');

const overridden = core.applyWordingOverride(wrapped, 'My own hand-edited wording');
assert.equal(overridden.isOverridden, true);
assert.equal(overridden.text, 'My own hand-edited wording');
assert.deepEqual(overridden.generatedFrom, wrapped.generatedFrom, 'An override must keep the original generatedFrom snapshot, not discard it');

const changedVenueProject = core.normalizeWeddingProject({
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  venues: [{ id: 'venue-1', name: 'A New Venue' }],
  events: [{ id: 'evt-nikah', type: 'nikah', date: '2026-12-05', venueId: 'venue-1' }]
});
assert.equal(
  core.isWordingStale(overridden, changedVenueProject, changedVenueProject.events[0]),
  true,
  'Changing the venue after an override must be detected as stale'
);

const regenerated = core.wrapWordingResult(
  wording.renderWording('formal-nikah-ur', changedVenueProject, changedVenueProject.events[0]),
  'formal-nikah-ur',
  changedVenueProject,
  changedVenueProject.events[0]
);
assert.equal(regenerated.isOverridden, false, 'Regeneration must always produce a fresh, non-overridden result');
assert.notEqual(regenerated.text, overridden.text, 'Regeneration must reflect the new venue, not repeat the frozen override text');
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node tests/wedding-project-core.test.js`
Expected: a `TypeError` such as `core.evaluateComposerSteps is not a function` (the new functions don't exist yet).

- [ ] **Step 3: Implement the minimal code**

In `js/wedding-project-core.js`:

1. Add near the other enum constants (after `var RELIGIOUS_OPENING_MODES = ...;`):

```js
    var WORDING_TONES = ['formal', 'informal', 'concise'];
```

2. In `normalizeEvent`, add `wordingTone` to the returned object (after the `wordingTemplateId` line):

```js
            wordingTemplateId: trimmed(source.wordingTemplateId, 80),
            wordingTone: enumOrFallback(source.wordingTone, WORDING_TONES, 'formal'),
```

3. Add these new functions after `firstStrongDirection` (before the final `return { ... }`):

```js
    function stepCheck(project) {
        var hasDate = project.events.some(function (event) { return hasMeaningfulText(event.date); });
        return [
            { step: 'events', missingFields: project.events.length ? [] : ['events'] },
            { step: 'hosts', missingFields: project.families.length ? [] : ['families'] },
            { step: 'schedule_venue', missingFields: hasDate ? [] : ['events[].date'] },
            { step: 'language_wording', missingFields: INVITATION_LANGUAGES.indexOf(project.invitationLanguage) >= 0 ? [] : ['invitationLanguage'] }
        ];
    }

    function evaluateComposerSteps(rawProject) {
        var project = normalizeWeddingProject(rawProject);
        var blocked = false;
        var steps = stepCheck(project).map(function (check) {
            var status;
            if (blocked) {
                status = 'blocked';
            } else if (check.missingFields.length) {
                status = 'current';
                blocked = true;
            } else {
                status = 'complete';
            }
            return { step: check.step, status: status, missingFields: check.missingFields };
        });

        var priorComplete = !blocked;
        // Step 5 (design) is a fixed-default stub for this slice: no picker exists yet,
        // it always resolves to the same default the render adapter already uses.
        steps.push({
            step: 'design',
            status: priorComplete ? 'complete' : 'blocked',
            missingFields: [],
            designDefault: { templateId: 'classic-nastaliq', presetId: 'portrait' }
        });
        steps.push({
            step: 'preview_export',
            status: priorComplete ? 'available' : 'blocked',
            missingFields: []
        });

        return steps;
    }

    function findVenueById(project, venueId) {
        for (var i = 0; i < project.venues.length; i += 1) {
            if (project.venues[i].id === venueId) return project.venues[i];
        }
        return null;
    }

    function snapshotWordingSourceFields(project, event) {
        var normalizedProject = normalizeWeddingProject(project);
        var normalizedEvent = normalizeEvent(event, 0);
        var venue = normalizedEvent.venueId ? findVenueById(normalizedProject, normalizedEvent.venueId) : null;
        return {
            personA: normalizedProject.couple.personA.displayName,
            personB: normalizedProject.couple.personB.displayName,
            eventDate: normalizedEvent.date,
            venueName: venue ? venue.name : ''
        };
    }

    function wrapWordingResult(renderResult, templateId, project, event) {
        if (!renderResult || !renderResult.complete) return null;
        return {
            text: renderResult.text,
            isOverridden: false,
            generatedFrom: {
                templateId: templateId,
                sourceFieldsSnapshot: snapshotWordingSourceFields(project, event)
            }
        };
    }

    function applyWordingOverride(wordingResult, newText) {
        if (!wordingResult) throw new Error('Cannot override a wording result that does not exist yet');
        return {
            text: text(newText),
            isOverridden: true,
            generatedFrom: wordingResult.generatedFrom
        };
    }

    function isWordingStale(wordingResult, project, event) {
        if (!wordingResult || !wordingResult.generatedFrom) return false;
        var current = snapshotWordingSourceFields(project, event);
        var previous = wordingResult.generatedFrom.sourceFieldsSnapshot;
        return Object.keys(current).some(function (key) { return current[key] !== previous[key]; });
    }
```

4. Add the new names to the final `return { ... }` block:

```js
        WORDING_TONES: WORDING_TONES,
        evaluateComposerSteps: evaluateComposerSteps,
        snapshotWordingSourceFields: snapshotWordingSourceFields,
        wrapWordingResult: wrapWordingResult,
        applyWordingOverride: applyWordingOverride,
        isWordingStale: isWordingStale,
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node tests/wedding-project-core.test.js`
Expected: exits with no output and status code 0 (this file has no test-runner summary line — silence and exit 0 means every `assert` passed).

- [ ] **Step 5: Run the full suite and governance check**

Run: `npm test`
Expected: reports the same total pass count as before plus no failures (check the printed summary line for the current total before this task, e.g. via `git stash` + rerun, if you need a baseline).

Run: `node scripts/check-product-governance.js`
Expected: unchanged 45 pages / 49 sitemap routes / 102 redirect rules.

- [ ] **Step 6: Commit**

```bash
git add js/wedding-project-core.js tests/wedding-project-core.test.js
git commit -m "WU-SHAADI-001 Slice 1: composer step-completeness, wordingTone, wording-override tracking

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: `js/wedding-template-selector.js` — deterministic wording-template and design-palette selection

**Files:**
- Create: `js/wedding-template-selector.js`
- Test: Create `tests/wedding-template-selector.test.js`
- Modify: `scripts/run-contract-tests.js` (register the new test file)

**Interfaces:**
- Consumes:
  - `js/wedding-wording-registry.js`'s `TEMPLATES` (array of `{ id, eventTypes: string[], languages: string[], formality: 'formal'|'informal'|'concise', ... }`) — already defined, see `js/wedding-wording-registry.js:48-166`.
  - `js/card-background-registry.js`'s `getAllBackgrounds()` → array of `{ id, category, goodFor: string[], ... }` — already defined, see `js/card-background-registry.js:97-104`.
  - `event.type` (`js/wedding-project-core.js` `EVENT_TYPES`) and `event.wordingTone` (Task 1's `WORDING_TONES`), `project.invitationLanguage` (`INVITATION_LANGUAGES`).
- Produces:
  - `selectTemplate(project, event)` → template id string (always one of `wording.TEMPLATES[i].id`)
  - `EVENT_DESIGN_PALETTES` → frozen object keyed by event type
  - `getDesignPalette(eventType)` → palette object or `null`
  - `suggestBackgroundCategory(project, event)` → `string[]` of background ids (may be empty)

- [ ] **Step 1: Write the failing test**

Create `tests/wedding-template-selector.test.js`:

```js
const assert = require('node:assert/strict');
const selector = require('../js/wedding-template-selector.js');

function project(language) {
  return { invitationLanguage: language };
}

// One fixture per existing template id, proving deterministic (eventType, language, tone) selection.
assert.equal(selector.selectTemplate(project('urdu'), { type: 'nikah', wordingTone: 'formal' }), 'formal-nikah-ur');
assert.equal(selector.selectTemplate(project('urdu'), { type: 'mehndi', wordingTone: 'informal' }), 'warm-mehndi-ur');
assert.equal(selector.selectTemplate(project('bilingual'), { type: 'baraat', wordingTone: 'formal' }), 'traditional-baraat-bilingual');
assert.equal(selector.selectTemplate(project('english'), { type: 'walima', wordingTone: 'formal' }), 'groom-family-walima-en');

// Ambiguous/unmatched combination must fall back to the single documented default, never guess.
assert.equal(
  selector.selectTemplate(project('english'), { type: 'nikah', wordingTone: 'formal' }),
  'concise-whatsapp',
  'No formal english nikah template exists; must fall back to concise-whatsapp'
);
assert.equal(selector.FALLBACK_TEMPLATE_ID, 'concise-whatsapp');

// Determinism: same input twice must give the same result.
const first = selector.selectTemplate(project('urdu'), { type: 'nikah', wordingTone: 'formal' });
const second = selector.selectTemplate(project('urdu'), { type: 'nikah', wordingTone: 'formal' });
assert.equal(first, second);

// Default tone is 'formal' when wordingTone is missing/invalid, matching wedding-project-core's default.
assert.equal(selector.selectTemplate(project('urdu'), { type: 'nikah' }), 'formal-nikah-ur');
assert.equal(selector.DEFAULT_WORDING_TONE, 'formal');

// --- Design-palette suggestion (data mapping, not new art) ---
assert.deepEqual(Object.keys(selector.EVENT_DESIGN_PALETTES).sort(), ['baraat', 'mehndi', 'nikah', 'walima']);
assert.equal(selector.getDesignPalette('custom'), null, 'Custom events get no default palette, never a guessed one');

const nikahSuggestions = selector.suggestBackgroundCategory(project('urdu'), { type: 'nikah' });
assert.ok(Array.isArray(nikahSuggestions));
assert.deepEqual(nikahSuggestions, ['blush-rose-lanterns', 'maroon-wedding', 'rose-garden-frame'], 'Must cross-reference the existing wedding-tagged backgrounds, sorted for determinism');

const customSuggestions = selector.suggestBackgroundCategory(project('urdu'), { type: 'custom' });
assert.deepEqual(customSuggestions, [], 'An event type with no palette entry must return an empty suggestion, never a guessed one');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/wedding-template-selector.test.js`
Expected: `Error: Cannot find module '../js/wedding-template-selector.js'`

- [ ] **Step 3: Write the implementation**

Create `js/wedding-template-selector.js`:

```js
(function (rootWindow, factory) {
    'use strict';
    var wording = rootWindow && rootWindow.WriteUrduWeddingWording;
    if (!wording && typeof require === 'function') wording = require('./wedding-wording-registry.js');
    var backgroundRegistry = rootWindow && rootWindow.WriteUrduCardBackgroundRegistry;
    if (!backgroundRegistry && typeof require === 'function') backgroundRegistry = require('./card-background-registry.js');
    var api = factory(wording, backgroundRegistry);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (rootWindow) rootWindow.WriteUrduWeddingTemplateSelector = api;
}(typeof window !== 'undefined' ? window : null, function (wording, backgroundRegistry) {
    'use strict';
    if (!wording) throw new Error('Wedding wording registry unavailable');
    if (!backgroundRegistry) throw new Error('Card background registry unavailable');

    var WORDING_TONES = ['formal', 'informal', 'concise'];
    var DEFAULT_WORDING_TONE = 'formal';
    // The one documented fallback for an ambiguous or unmatched (eventType, language, tone)
    // combination. concise-whatsapp matches every event type and language by design
    // (see js/wedding-wording-registry.js), so it always exists as a safe default.
    var FALLBACK_TEMPLATE_ID = 'concise-whatsapp';

    function selectTemplate(project, event) {
        var language = project && project.invitationLanguage;
        var eventType = event && event.type;
        var tone = (event && WORDING_TONES.indexOf(event.wordingTone) >= 0) ? event.wordingTone : DEFAULT_WORDING_TONE;

        var matches = wording.TEMPLATES.filter(function (template) {
            return template.eventTypes.indexOf(eventType) >= 0 &&
                template.languages.indexOf(language) >= 0 &&
                template.formality === tone;
        });

        return matches.length ? matches[0].id : FALLBACK_TEMPLATE_ID;
    }

    // Palette/motif conventions from published Pakistani wedding invitation design guides
    // (see spec doc §5 for sources) — a bounded configurable model, not an invented standard.
    // Custom events intentionally have no entry: a design palette is never guessed.
    var EVENT_DESIGN_PALETTES = Object.freeze({
        nikah: Object.freeze({ paletteTone: 'reverent', paletteColors: Object.freeze(['deep-green', 'gold', 'ivory']), motifs: Object.freeze(['islamic-geometric', 'crescent', 'nastaliq-calligraphy']) }),
        mehndi: Object.freeze({ paletteTone: 'festive', paletteColors: Object.freeze(['yellow', 'orange', 'marigold']), motifs: Object.freeze(['floral-rose', 'floral-jasmine']) }),
        baraat: Object.freeze({ paletteTone: 'opulent', paletteColors: Object.freeze(['maroon', 'royal-red', 'gold']), motifs: Object.freeze(['paisley', 'mughal-arabesque', 'zari-foil']) }),
        walima: Object.freeze({ paletteTone: 'elegant', paletteColors: Object.freeze(['emerald', 'royal-blue', 'gold', 'silver']), motifs: Object.freeze(['mughal-architectural']) })
    });

    function getDesignPalette(eventType) {
        return EVENT_DESIGN_PALETTES[eventType] || null;
    }

    function suggestBackgroundCategory(project, event) {
        var eventType = event && event.type;
        if (!getDesignPalette(eventType)) return [];
        // The registry has no per-event-type tags yet (only a single generic "wedding"
        // category — see spec §5), so every known wedding event type gets the same
        // cross-referenced suggestion until finer-grained assets are produced
        // (tracked in specs/BACKLOG.md P1.10). This is honest about the current data,
        // not a fabricated per-event ranking.
        var matches = backgroundRegistry.getAllBackgrounds().filter(function (background) {
            return background.category === 'wedding' && background.goodFor.indexOf('wedding') >= 0;
        });
        return matches.map(function (background) { return background.id; }).sort();
    }

    return {
        WORDING_TONES: WORDING_TONES,
        DEFAULT_WORDING_TONE: DEFAULT_WORDING_TONE,
        FALLBACK_TEMPLATE_ID: FALLBACK_TEMPLATE_ID,
        EVENT_DESIGN_PALETTES: EVENT_DESIGN_PALETTES,
        selectTemplate: selectTemplate,
        getDesignPalette: getDesignPalette,
        suggestBackgroundCategory: suggestBackgroundCategory
    };
}));
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node tests/wedding-template-selector.test.js`
Expected: silent exit, status code 0.

- [ ] **Step 5: Register the test file**

In `scripts/run-contract-tests.js`, add a new line immediately after `'tests/wedding-invitation-render-adapter.test.js',` (currently line 71):

```js
  'tests/wedding-invitation-render-adapter.test.js',
  'tests/wedding-template-selector.test.js',
```

- [ ] **Step 6: Run the full suite and governance check**

Run: `npm test`
Expected: total pass count increases by exactly the new assertions in this file; no existing test's output changes.

Run: `node scripts/check-product-governance.js`
Expected: unchanged 45 pages / 49 sitemap routes / 102 redirect rules.

- [ ] **Step 7: Commit**

```bash
git add js/wedding-template-selector.js tests/wedding-template-selector.test.js scripts/run-contract-tests.js
git commit -m "WU-SHAADI-001 Slice 1: deterministic wording-template and design-palette selector

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: `js/wedding-project-storage.js` — fail-closed local draft persistence

**Files:**
- Create: `js/wedding-project-storage.js`
- Test: Create `tests/wedding-project-storage.test.js`
- Modify: `scripts/run-contract-tests.js` (register the new test file)

**Interfaces:**
- Consumes: `js/wedding-project-core.js`'s `normalizeWeddingProject(raw)` and `SCHEMA_VERSION` (already defined).
- Produces:
  - `STORAGE_KEY` → `'writeUrdu.weddingProject.draft.v1'`
  - `saveDraft(project)` → `{ ok: true } | { ok: false, errorCode: string }` (never throws)
  - `loadDraft()` → normalized `WeddingProject` object, or `null` (never throws, never returns a partial object)
  - `resetDraft()` → `undefined` (never throws)

- [ ] **Step 1: Write the failing test**

Create `tests/wedding-project-storage.test.js`:

```js
const assert = require('node:assert/strict');

// A minimal in-memory localStorage shim, matching the Web Storage API surface
// this module relies on (getItem/setItem/removeItem).
function makeFakeStorage() {
  var store = {};
  return {
    getItem: function (key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem: function (key, value) { store[key] = String(value); },
    removeItem: function (key) { delete store[key]; },
    _dump: function () { return store; }
  };
}

global.localStorage = makeFakeStorage();
const storage = require('../js/wedding-project-storage.js');
const core = require('../js/wedding-project-core.js');

// Empty/never-saved state.
assert.equal(storage.loadDraft(), null, 'loadDraft must return null when nothing has been saved');

// Round-trip.
const project = core.createDefaultWeddingProject(new Date('2026-09-18T00:00:00Z'));
project.couple.personA.displayName = 'Ali';
const saveResult = storage.saveDraft(project);
assert.deepEqual(saveResult, { ok: true });
const loaded = storage.loadDraft();
assert.equal(loaded.couple.personA.displayName, 'Ali');
assert.equal(loaded.schemaVersion, core.SCHEMA_VERSION);

// Corrupt JSON fails closed to null, never throws.
global.localStorage.setItem(storage.STORAGE_KEY, '{not valid json');
assert.equal(storage.loadDraft(), null, 'Corrupt JSON must fail closed to null');

// Missing/unknown schemaVersion fails closed to null, never guesses a migration.
global.localStorage.setItem(storage.STORAGE_KEY, JSON.stringify({ schemaVersion: 999, id: 'x' }));
assert.equal(storage.loadDraft(), null, 'An unknown schemaVersion must fail closed to null');

global.localStorage.setItem(storage.STORAGE_KEY, JSON.stringify({ id: 'x' }));
assert.equal(storage.loadDraft(), null, 'A missing schemaVersion must fail closed to null');

// Simulated quota-exceeded error never throws to the caller.
global.localStorage.setItem = function () { throw new Error('QuotaExceededError'); };
const failedSave = storage.saveDraft(project);
assert.equal(failedSave.ok, false);
assert.equal(typeof failedSave.errorCode, 'string');
global.localStorage = makeFakeStorage();

// resetDraft is idempotent and never throws, even when nothing is stored.
storage.saveDraft(project);
storage.resetDraft();
assert.equal(storage.loadDraft(), null);
storage.resetDraft();
storage.resetDraft();
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/wedding-project-storage.test.js`
Expected: `Error: Cannot find module '../js/wedding-project-storage.js'`

- [ ] **Step 3: Write the implementation**

Create `js/wedding-project-storage.js`:

```js
(function (rootWindow, factory) {
    'use strict';
    var core = rootWindow && rootWindow.WriteUrduWeddingCore;
    if (!core && typeof require === 'function') core = require('./wedding-project-core.js');
    var api = factory(core);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (rootWindow) rootWindow.WriteUrduWeddingProjectStorage = api;
}(typeof window !== 'undefined' ? window : null, function (core) {
    'use strict';
    if (!core) throw new Error('Wedding project core unavailable');

    var STORAGE_KEY = 'writeUrdu.weddingProject.draft.v1';

    // Migration seam: keyed by the schemaVersion a saved draft was written with.
    // Today it's an identity function; a real future migration is additive here,
    // never a breaking rewrite. An unknown/missing version fails closed to null.
    var MIGRATIONS = {
        1: function (raw) { return raw; }
    };

    function getStorage() {
        try {
            return typeof localStorage !== 'undefined' ? localStorage : null;
        } catch (error) {
            return null;
        }
    }

    function saveDraft(project) {
        var storage = getStorage();
        if (!storage) return { ok: false, errorCode: 'storage_unavailable' };
        try {
            var normalized = core.normalizeWeddingProject(project);
            storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
            return { ok: true };
        } catch (error) {
            return { ok: false, errorCode: 'write_failed' };
        }
    }

    function loadDraft() {
        var storage = getStorage();
        if (!storage) return null;
        try {
            var raw = storage.getItem(STORAGE_KEY);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return null;
            var migrate = MIGRATIONS[parsed.schemaVersion];
            if (typeof migrate !== 'function') return null;
            return core.normalizeWeddingProject(migrate(parsed));
        } catch (error) {
            return null;
        }
    }

    function resetDraft() {
        var storage = getStorage();
        if (!storage) return;
        try { storage.removeItem(STORAGE_KEY); } catch (error) {}
    }

    return {
        STORAGE_KEY: STORAGE_KEY,
        saveDraft: saveDraft,
        loadDraft: loadDraft,
        resetDraft: resetDraft
    };
}));
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node tests/wedding-project-storage.test.js`
Expected: silent exit, status code 0.

- [ ] **Step 5: Register the test file**

In `scripts/run-contract-tests.js`, add a new line immediately after `'tests/wedding-template-selector.test.js',` (added in Task 2):

```js
  'tests/wedding-template-selector.test.js',
  'tests/wedding-project-storage.test.js',
```

- [ ] **Step 6: Run the full suite and governance check**

Run: `npm test`
Expected: total pass count increases by exactly this file's assertions; no existing test's output changes.

Run: `node scripts/check-product-governance.js`
Expected: unchanged 45 pages / 49 sitemap routes / 102 redirect rules.

- [ ] **Step 7: Commit**

```bash
git add js/wedding-project-storage.js tests/wedding-project-storage.test.js scripts/run-contract-tests.js
git commit -m "WU-SHAADI-001 Slice 1: fail-closed local draft persistence

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Final verification and completion report

**Files:** none changed — verification only.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: reports all contract test files passing, including the three touched/created in this plan, with no reduction anywhere else.

- [ ] **Step 2: Run product governance check**

Run: `node scripts/check-product-governance.js`
Expected: 45 registered pages / 49 sitemap routes / 102 redirect rules — unchanged from before this plan, proving no route was added.

- [ ] **Step 3: Confirm no unrelated files changed**

Run: `git status`
Expected: only the files touched by Tasks 1-3 (`js/wedding-project-core.js`, `js/wedding-template-selector.js`, `js/wedding-project-storage.js`, `tests/wedding-project-core.test.js`, `tests/wedding-template-selector.test.js`, `tests/wedding-project-storage.test.js`, `scripts/run-contract-tests.js`) plus the already-committed spec/backlog files from this session.

- [ ] **Step 4: Write the completion report**

Using the format from `skills/wu-shaadi-001/SKILL.md` ("Completion report" section), report:
- **Changed:** the exact files above, and that this adds logic/tests only, no UI/route.
- **Domain preserved:** `WeddingProject` is still the sole source of truth; `evaluateComposerSteps`, `selectTemplate`, `suggestBackgroundCategory` all read from it and never mutate it; `wordingTone` defaults to `'formal'` and is never inferred; `suffixStyle`/`invitedEventIds` behavior from Slice 0 is untouched; `RELIGIOUS_LIBRARY`/`religiousOpening` code was not touched.
- **Existing product preserved:** no changes to Card Studio, Card Gallery, Ready-Made Cards, the `/s` share flow, or core Urdu typing — confirmed by the unchanged governance counts and the fact no existing test assertion was modified or removed.
- **Privacy:** no telemetry code was touched or added; `wedding-project-storage.js` only ever touches `localStorage`, never a network call.
- **Verification:** exact `npm test` and `node scripts/check-product-governance.js` output/counts from Steps 1-2.
- **Risk:** `suggestBackgroundCategory` currently returns the same 3 backgrounds for every known wedding event type because the registry has no finer-grained tags yet (tracked as the Slice 2 asset backlog line in `specs/BACKLOG.md` P1.10); the on-device mobile benchmark and human/editorial religious-content review remain open from Slice 0 and are untouched by this plan.
- **Rollback:** every file is additive and unreferenced by any shipped page or route; reverting the three commits from this plan removes the feature with zero impact on any shipped product surface.
