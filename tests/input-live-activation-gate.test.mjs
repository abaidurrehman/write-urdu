import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const plan = JSON.parse(read('benchmarks/wu-input-001f/acceptance-plan.json'));
const status = JSON.parse(read('benchmarks/wu-input-001f/activation-status.json'));

const result = spawnSync(process.execPath, ['benchmarks/wu-input-001f/validate.mjs'], { cwd: root, encoding: 'utf8' });
assert.equal(result.status, 0, result.stderr || result.stdout);
assert.match(result.stdout, /0\/7 rows ready/);

assert.deepEqual(plan.rows.map(row => row.id), [
  'text-ur-en', 'text-en-ur', 'voice-ur-en', 'voice-en-ur', 'audio-ur', 'audio-en', 'dictionary'
]);
assert(status.rows.every(row => row.ready === false), 'No capability may start ready without live acceptance evidence');
assert.equal(status.overall_recommendation, 'keep-disabled');

const spec = read('specs/WU-INPUT-001F-live-quality-activation-gate.md');
assert.match(spec, /keep all three gates disabled/i);
assert.match(spec, /Back-translations remain context clues, never verified synonyms/i);
assert.match(spec, /noindex/i);
assert.match(spec, /owned, consented or appropriately licensed benchmark audio/i);
assert.doesNotMatch(spec, /enable everything together/i);

for (const page of [
  'tools/urdu-english-voice-translator.html',
  'tools/audio-to-text-translator.html',
  'tools/urdu-english-dictionary.html'
]) {
  assert.match(read(page), /<meta name="robots" content="noindex,follow">/, `${page} must remain noindex`);
}

console.log('WU-INPUT-001F live quality and activation gate tests passed.');
