'use strict';

const fs = require('node:fs');
const path = require('node:path');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
}

function percent(value) {
  return value == null ? 'n/a' : (value * 100).toFixed(1) + '%';
}

function main() {
  const [baselinePath, candidatePath, outPath] = process.argv.slice(2);
  if (!baselinePath || !candidatePath || !outPath) {
    throw new Error('Usage: node compare.js baseline.json candidate.json out.md');
  }

  const baseline = readJson(baselinePath);
  const candidate = readJson(candidatePath);
  const baselineById = new Map(baseline.results.map(item => [item.fixture.id, item]));
  const candidateById = new Map(candidate.results.map(item => [item.fixture.id, item]));
  const wins = [];
  const regressions = [];
  const changed = [];

  for (const [id, current] of baselineById) {
    const next = candidateById.get(id);
    if (!next) continue;
    if (current.score.status === next.score.status && current.provider.primary === next.provider.primary) continue;
    const row = {
      id,
      category: current.fixture.category,
      before_status: current.score.status,
      after_status: next.score.status,
      before: current.provider.primary || '',
      after: next.provider.primary || '',
      protected: next.provider.protected || {}
    };
    changed.push(row);
    if (current.score.status === 'fail' && next.score.status === 'pass') wins.push(row);
    if (current.score.status === 'pass' && next.score.status === 'fail') regressions.push(row);
  }

  const categories = new Set([
    ...Object.keys(baseline.summary.by_category || {}),
    ...Object.keys(candidate.summary.by_category || {})
  ]);

  const lines = [];
  lines.push('# WU-JOURNEY-001B B3 — protected-token candidate delta');
  lines.push('');
  lines.push(`Baseline: ${percent(baseline.summary.pass_rate)} (${baseline.summary.pass}/${baseline.summary.scored} scored)`);
  lines.push(`Candidate: ${percent(candidate.summary.pass_rate)} (${candidate.summary.pass}/${candidate.summary.scored} scored)`);
  lines.push(`Net pass-rate delta: ${((candidate.summary.pass_rate - baseline.summary.pass_rate) * 100).toFixed(1)} percentage points`);
  lines.push(`Fail → pass wins: ${wins.length}`);
  lines.push(`Pass → fail regressions: ${regressions.length}`);
  lines.push('');
  lines.push('| Category | Baseline pass | Candidate pass | Delta |');
  lines.push('| --- | ---: | ---: | ---: |');
  for (const category of categories) {
    const before = baseline.summary.by_category[category] || { pass: 0, fail: 0 };
    const after = candidate.summary.by_category[category] || { pass: 0, fail: 0 };
    lines.push(`| ${category} | ${before.pass} | ${after.pass} | ${after.pass - before.pass >= 0 ? '+' : ''}${after.pass - before.pass} |`);
  }

  lines.push('');
  lines.push('## Wins');
  lines.push('');
  if (!wins.length) lines.push('- None.');
  for (const row of wins) {
    lines.push(`- **${row.id}** (${row.category}) — \`${row.before.replace(/\n/g, ' ↵ ')}\` → \`${row.after.replace(/\n/g, ' ↵ ')}\``);
  }

  lines.push('');
  lines.push('## Regressions');
  lines.push('');
  if (!regressions.length) lines.push('- None.');
  for (const row of regressions) {
    lines.push(`- **${row.id}** (${row.category}) — \`${row.before.replace(/\n/g, ' ↵ ')}\` → \`${row.after.replace(/\n/g, ' ↵ ')}\``);
  }

  lines.push('');
  lines.push('## All changed outputs');
  lines.push('');
  for (const row of changed) {
    lines.push(`- **${row.id}** ${row.before_status} → ${row.after_status}; protected=${JSON.stringify(row.protected)}; \`${row.before.replace(/\n/g, ' ↵ ')}\` → \`${row.after.replace(/\n/g, ' ↵ ')}\``);
  }

  lines.push('');
  lines.push('This is a benchmark experiment only. It does not imply that the candidate is approved for production.');

  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  fs.writeFileSync(path.resolve(outPath), lines.join('\n') + '\n', 'utf8');
  console.log(lines.join('\n'));
}

main();
