#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = __dirname;

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertUniqueIds(items, label) {
  const seen = new Set();
  for (const item of items) {
    assert(item && typeof item.id === 'string' && item.id.trim(), `${label}: missing id`);
    assert(!seen.has(item.id), `${label}: duplicate id ${item.id}`);
    seen.add(item.id);
  }
}

const translation = load('translation-fixtures.json');
assert(translation.schema_version === 1, 'translation: unsupported schema');
assert(Array.isArray(translation.fixtures) && translation.fixtures.length >= 20, 'translation: starter corpus must have >=20 fixtures');
assertUniqueIds(translation.fixtures, 'translation');
for (const item of translation.fixtures) {
  assert(['ur-en', 'en-ur'].includes(item.direction), `translation ${item.id}: invalid direction`);
  assert(typeof item.source === 'string' && item.source.trim(), `translation ${item.id}: source required`);
  assert(Array.isArray(item.tags) && item.tags.length, `translation ${item.id}: tags required`);
}
assert(translation.fixtures.some((x) => x.direction === 'ur-en'), 'translation: Urdu→English coverage required');
assert(translation.fixtures.some((x) => x.direction === 'en-ur'), 'translation: English→Urdu coverage required');

const dictionary = load('dictionary-fixtures.json');
assert(dictionary.schema_version === 1, 'dictionary: unsupported schema');
assert(Array.isArray(dictionary.fixtures) && dictionary.fixtures.length >= 10, 'dictionary: starter corpus must have >=10 fixtures');
assertUniqueIds(dictionary.fixtures, 'dictionary');
for (const item of dictionary.fixtures) {
  assert(['ur', 'en'].includes(item.from), `dictionary ${item.id}: invalid from`);
  assert(['ur', 'en'].includes(item.to) && item.to !== item.from, `dictionary ${item.id}: invalid to`);
  assert(typeof item.query === 'string' && item.query.trim(), `dictionary ${item.id}: query required`);
  assert(Array.isArray(item.required_behaviors) && item.required_behaviors.length, `dictionary ${item.id}: required_behaviors required`);
}
assert(dictionary.fixtures.some((x) => x.tags && x.tags.includes('not-found')), 'dictionary: not-found coverage required');
assert(dictionary.fixtures.some((x) => x.tags && x.tags.includes('polysemy')), 'dictionary: polysemy coverage required');

const audio = load('audio-fixture-plan.json');
assert(audio.schema_version === 1, 'audio: unsupported schema');
assert(audio.target_total_clips >= 100, 'audio: target must be >=100 clips');
assert(Array.isArray(audio.starter_cases) && audio.starter_cases.length >= 8, 'audio: starter plan must have >=8 cases');
assertUniqueIds(audio.starter_cases, 'audio');
for (const item of audio.starter_cases) {
  assert(['ur', 'en', 'mixed'].includes(item.language), `audio ${item.id}: invalid language`);
  assert(item.gold_transcript_required === true, `audio ${item.id}: gold transcript must be required`);
}

console.log(`WU-INPUT-001A fixtures valid: ${translation.fixtures.length} translation, ${dictionary.fixtures.length} dictionary, ${audio.starter_cases.length} audio-plan cases.`);
