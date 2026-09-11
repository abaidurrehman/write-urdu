#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const load = name => JSON.parse(fs.readFileSync(path.join(here, name), 'utf8'));
const plan = load('acceptance-plan.json');
const status = load('activation-status.json');

assert.equal(plan.schema_version, 1);
assert.equal(status.schema_version, 1);
assert.equal(plan.rows.length, 7, 'activation plan must cover seven capability rows');
assert.equal(status.rows.length, plan.rows.length, 'status must cover every plan row');
assert.match(plan.lexical_rule, /not verified synonyms/i);

const allowed = new Set(plan.allowed_states);
const planById = new Map(plan.rows.map(row => [row.id, row]));
const statusById = new Map(status.rows.map(row => [row.id, row]));
assert.equal(planById.size, plan.rows.length, 'plan row IDs must be unique');
assert.equal(statusById.size, status.rows.length, 'status row IDs must be unique');

for (const [id, row] of statusById) {
  assert(planById.has(id), `unknown status row ${id}`);
  for (const field of ['quality', 'cost', 'privacy']) {
    assert(allowed.has(row[field]), `${id}: invalid ${field} state`);
  }
  assert.equal(typeof row.ready, 'boolean', `${id}: ready must be boolean`);
  assert(Array.isArray(row.evidence), `${id}: evidence must be an array`);
  if (row.ready) {
    assert.equal(row.quality, 'pass', `${id}: ready requires passing quality`);
    assert.equal(row.cost, 'pass', `${id}: ready requires passing cost`);
    assert.equal(row.privacy, 'pass', `${id}: ready requires passing privacy`);
    assert(row.evidence.length > 0, `${id}: ready requires evidence references`);
    for (const prerequisite of planById.get(id).prerequisites || []) {
      assert.equal(statusById.get(prerequisite)?.ready, true, `${id}: prerequisite ${prerequisite} is not ready`);
    }
  }
}

for (const row of plan.rows) {
  assert(['INPUT_TRANSLATION_ENABLED', 'AUDIO_TRANSCRIBE_ENABLED', 'DICTIONARY_LOOKUP_ENABLED'].includes(row.gate));
  assert(Array.isArray(row.requires) && row.requires.length > 0, `${row.id}: evidence requirements missing`);
  assert(fs.existsSync(path.join(root, plan.fixture_sources[row.id.startsWith('text') ? 'translation' : row.id.startsWith('audio') ? 'audio' : row.id === 'dictionary' ? 'dictionary' : 'translation'])), `${row.id}: fixture source missing`);
}

const ready = status.rows.filter(row => row.ready).length;
console.log(`WU-INPUT-001F activation status valid: ${ready}/${status.rows.length} rows ready; recommendation ${status.overall_recommendation}.`);
