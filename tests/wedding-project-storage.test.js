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
