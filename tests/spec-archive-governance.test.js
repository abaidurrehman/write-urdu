const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const specs = path.join(root, 'specs');
const archive = path.join(specs, 'archive');
const implemented = path.join(archive, 'implemented');
const superseded = path.join(archive, 'superseded');
const snapshots = path.join(archive, 'snapshots');

const read = file => fs.readFileSync(file, 'utf8');
const markdownFiles = dir => fs.readdirSync(dir).filter(file => file.endsWith('.md'));

assert.ok(fs.statSync(archive).isDirectory(), 'Specs archive must exist');
assert.ok(fs.statSync(implemented).isDirectory(), 'Implemented-spec archive must exist');
assert.ok(fs.statSync(superseded).isDirectory(), 'Superseded-spec archive must exist');
assert.ok(fs.statSync(snapshots).isDirectory(), 'Specs snapshot archive must exist');

const implementedFiles = markdownFiles(implemented);
const supersededFiles = markdownFiles(superseded);
assert.ok(implementedFiles.length >= 40, 'Implemented archive should retain the reconciled historical contracts');
assert.ok(supersededFiles.includes('WU-SEO-001-new-tool-marketing-and-seo.md'), 'Superseded SEO contract must stay archived');

for (const file of [...implementedFiles, ...supersededFiles]) {
  assert.strictEqual(
    fs.existsSync(path.join(specs, file)),
    false,
    `Archived contract must not also remain in active specs root: ${file}`
  );
}

for (const file of [
  'BACKLOG-2026-08-30-pre-reconciliation.md',
  'WU-COMMUNITY-001-2026-08-30-pre-reconciliation.md',
  'WU-VOICE-PLAT-001-2026-08-30-pre-reconciliation.md',
  'WU-TOOLS-EXPANSION-001-2026-08-30-pre-reconciliation.md'
]) {
  assert.ok(fs.existsSync(path.join(snapshots, file)), `Historical reconciliation snapshot missing: ${file}`);
}

const registry = read(path.join(specs, 'README.md'));
const backlog = read(path.join(specs, 'BACKLOG.md'));
const archiveReadme = read(path.join(archive, 'README.md'));
const community = read(path.join(specs, 'WU-COMMUNITY-001-moderated-urdu-writing-publishing.md'));
const voice = read(path.join(specs, 'WU-VOICE-PLAT-001-unified-urdu-input-platform.md'));
const tools = read(path.join(specs, 'WU-TOOLS-EXPANSION-001-browser-first-urdu-tools-program.md'));

assert.match(registry, /runtime code and regression tests are the source of truth/i, 'Registry must state shipped-behaviour source of truth');
assert.match(registry, /Historical implementation contracts live in \[`archive\//i, 'Registry must point completed work to the archive');
assert.match(backlog, /work that is still genuinely open/i, 'Backlog must identify itself as active-only');
assert.match(backlog, /pre-reconciliation/i, 'Backlog must preserve a pointer to its historical snapshot');
assert.match(archiveReadme, /archived spec is not deleted/i, 'Archive policy must preserve historical intent');

assert.match(community, /Implemented core \/ acceptance pending/i, 'Community parent must not regress to Planned after A-F shipped');
assert.doesNotMatch(community, /\*\*Status:\*\* Planned/i, 'Community parent status is stale');
assert.match(voice, /Implemented core \/ acceptance pending/i, 'Voice platform parent must reflect shipped slices');
assert.doesNotMatch(voice, /\*\*Status:\*\* Planned/i, 'Voice platform parent status is stale');
assert.match(tools, /Active umbrella/i, 'Tools program must reflect implemented children plus held R&D');

console.log('Specs archive governance contract passed.');
