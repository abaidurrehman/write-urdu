const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../js/wedding-project-core.js');
const wording = require('../js/wedding-wording-registry.js');

const fixturePath = path.join(__dirname, 'fixtures', 'wu-shaadi-001', 'wedding-projects.v1.json');
const fixtureSet = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(core.SCHEMA_VERSION, 1, 'Wedding schema must start at version 1');
assert.deepEqual(core.EVENT_TYPES, ['nikah', 'mehndi', 'mayun', 'dholki', 'baraat', 'rukhsati', 'walima', 'engagement', 'custom']);
assert.deepEqual(core.HOST_MODES, ['bride_side', 'groom_side', 'both', 'grandparents', 'custom']);
assert.deepEqual(core.INVITATION_LANGUAGES, ['urdu', 'english', 'bilingual']);
assert.deepEqual(core.GUEST_SCOPES, ['individual', 'couple', 'family', 'custom']);
assert.deepEqual(core.RELIGIOUS_OPENING_MODES, ['none', 'verified_library', 'custom_user_text']);

// The religious-text safety gate: no seeded library entry may be pre-approved by this module.
core.RELIGIOUS_LIBRARY.forEach((entry) => {
  assert.notEqual(entry.reviewStatus, 'approved', `Library entry ${entry.id} must not ship pre-approved by Slice 0 code`);
});

const defaultProject = core.createDefaultWeddingProject(new Date('2026-09-18T00:00:00Z'));
assert.equal(defaultProject.schemaVersion, 1);
assert.equal(defaultProject.invitationLanguage, 'urdu');
assert.deepEqual(defaultProject.events, []);
assert.deepEqual(defaultProject.guests, []);
assert.equal(defaultProject.religiousOpening.mode, 'none');

assert.equal(fixtureSet.version, 1, 'Fixture schema version changed unexpectedly');
assert.ok(Array.isArray(fixtureSet.cases) && fixtureSet.cases.length >= 20, 'Slice 0 requires the complete fixture corpus');

for (const fixture of fixtureSet.cases) {
  const validation = core.validateWeddingProject(fixture.document);
  assert.equal(
    validation.valid,
    fixture.expected.valid,
    `${fixture.id}: validation result changed (errors: ${validation.errors.join(', ')})`
  );

  if (fixture.expected.errors) {
    for (const expectedError of fixture.expected.errors) {
      assert.ok(
        validation.errors.includes(expectedError),
        `${fixture.id}: expected error "${expectedError}" not present (got: ${validation.errors.join(', ')})`
      );
    }
  }

  const normalized = core.normalizeWeddingProject(fixture.document);

  if (fixture.guestRecordCount !== undefined) {
    assert.equal(normalized.guests.length, fixture.guestRecordCount, `${fixture.id}: guest records must remain separate unless explicitly merged`);
  }

  for (const wordingCheck of fixture.wording || []) {
    const event = normalized.events.find((candidate) => candidate.id === wordingCheck.eventId);
    assert.ok(event, `${fixture.id}: wording fixture references unknown event ${wordingCheck.eventId}`);
    const rendered = wording.renderWording(wordingCheck.templateId, normalized, event);
    assert.equal(
      rendered.complete,
      wordingCheck.expectComplete,
      `${fixture.id}: wording completeness for ${wordingCheck.templateId} changed`
    );
    if (wordingCheck.missingFields) {
      assert.deepEqual(rendered.missingFields, wordingCheck.missingFields, `${fixture.id}: missing-field report changed`);
    }
    if (wordingCheck.exactText) {
      assert.equal(rendered.text, wordingCheck.exactText, `${fixture.id}: rendered wording text changed`);
    }
    if (rendered.complete) {
      assert.ok(rendered.text.length > 0, `${fixture.id}: complete wording must not render empty text`);
    }
  }

  for (const viewModelCheck of fixture.viewModel || []) {
    const viewModel = core.buildInvitationViewModel(normalized, viewModelCheck.guestId);
    const actualEventIds = viewModel.events.map((event) => event.id);
    assert.deepEqual(
      actualEventIds,
      viewModelCheck.expectedEventIds,
      `${fixture.id}: guest ${viewModelCheck.guestId} view model exposed the wrong event set`
    );
  }
}

// Rendering the same normalized project/event twice must be byte-identical (no hidden randomness).
const nikahFixture = fixtureSet.cases.find((fixture) => fixture.id === 'formal-nikah');
const nikahProject = core.normalizeWeddingProject(nikahFixture.document);
const nikahEvent = nikahProject.events[0];
const firstRender = wording.renderWording('formal-nikah-ur', nikahProject, nikahEvent);
const secondRender = wording.renderWording('formal-nikah-ur', nikahProject, nikahEvent);
assert.deepEqual(firstRender, secondRender, 'Wording rendering must be deterministic for unchanged input');

// Empty invitedEventIds must never be silently treated as "all events".
const allEventsProject = core.normalizeWeddingProject({
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  events: [{ id: 'evt-nikah', type: 'nikah', date: '2026-12-05' }, { id: 'evt-walima', type: 'walima', date: '2026-12-08' }],
  guests: [{ id: 'guest-1', sourceName: 'Someone', invitedEventIds: [] }]
});
const emptyScopeViewModel = core.buildInvitationViewModel(allEventsProject, 'guest-1');
assert.deepEqual(emptyScopeViewModel.events, [], 'A guest with no invitedEventIds must see zero events, never every event');

// Honorifics/suffixes must never be inferred; the default is explicitly "none".
const unspecifiedSuffixGuest = core.normalizeWeddingProject({
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  events: [{ id: 'evt-nikah', type: 'nikah', date: '2026-12-05' }],
  guests: [{ id: 'guest-1', sourceName: 'Muhammad Usman', invitedEventIds: ['evt-nikah'] }]
}).guests[0];
assert.equal(unspecifiedSuffixGuest.suffixStyle, 'none', 'Suffix/honorific must never be inferred from a name');

// Direction detection: Urdu text is RTL, Latin text is LTR.
assert.equal(core.firstStrongDirection('محمد علی'), 'rtl');
assert.equal(core.firstStrongDirection('Muhammad Ali'), 'ltr');

console.log(`Wedding project core tests passed (${fixtureSet.cases.length} fixtures).`);
