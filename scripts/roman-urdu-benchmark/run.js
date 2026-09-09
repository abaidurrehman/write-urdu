'use strict';

const fs = require('node:fs');
const path = require('node:path');
const fixtures = require('../../benchmarks/roman-urdu/fixtures');
const core = require('./core');
const protectedTokens = require('./protected-tokens');

const ENDPOINT = 'https://inputtools.google.com/request';
const VALID_CANDIDATES = new Set(['protected-tokens']);

function args(argv) {
  const parsed = { category: null, limit: null, out: null, delay: 150, candidate: null };
  for (let i = 2; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--category') parsed.category = argv[++i];
    else if (value === '--limit') parsed.limit = Number(argv[++i]);
    else if (value === '--out') parsed.out = argv[++i];
    else if (value === '--delay') parsed.delay = Number(argv[++i]);
    else if (value === '--candidate') parsed.candidate = argv[++i];
    else if (value === '--help') parsed.help = true;
    else throw new Error('Unknown argument: ' + value);
  }
  return parsed;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function hasRomanText(value) { return /[A-Za-z]{3,}/.test(String(value || '')); }

function splitParagraph(value, limit) {
  let remaining = String(value || '');
  const chunks = [];
  while (remaining.length > limit) {
    let cut = remaining.lastIndexOf(' ', limit);
    if (cut < Math.floor(limit * 0.45)) cut = limit;
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut).replace(/^\s+/, '');
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function requestGoogle(input) {
  const query = ENDPOINT + '?text=' + encodeURIComponent(input) + '&itc=ur-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8';
  const response = await fetch(query, { headers: { 'user-agent': 'WriteUrdu-RomanBenchmark/1.0' } });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  return core.parseGoogleResponse(await response.json());
}

async function requestProductionLikeBatch(input, delay) {
  const lines = String(input || '').replace(/\r\n?/g, '\n').split('\n');
  const output = [];
  for (const line of lines) {
    if (!hasRomanText(line)) {
      output.push(line);
      continue;
    }
    const chunks = splitParagraph(line, 900);
    const converted = [];
    for (const chunk of chunks) {
      const result = await requestGoogle(chunk);
      converted.push(result.primary || chunk);
      if (delay > 0) await sleep(delay);
    }
    output.push(converted.join(' '));
  }
  const primary = output.join('\n');
  return { primary, suggestions: [primary] };
}

function mergeCounts(target, source) {
  for (const [key, value] of Object.entries(source || {})) target[key] = (target[key] || 0) + value;
}

async function requestProtectedChunk(chunk, delay) {
  const parts = protectedTokens.splitProtectedTokens(chunk);
  const protectedSummary = protectedTokens.summarizeProtected(parts);
  if (!parts.some(part => part.protected)) {
    const result = await requestGoogle(chunk);
    if (delay > 0) await sleep(delay);
    return { value: result.primary || chunk, protectedSummary };
  }

  let value = '';
  for (const part of parts) {
    if (part.protected) {
      value += part.value;
      continue;
    }
    if (!hasRomanText(part.value)) {
      value += part.value;
      continue;
    }
    const edge = protectedTokens.edgeWhitespace(part.value);
    if (!edge.core) {
      value += part.value;
      continue;
    }
    const result = await requestGoogle(edge.core);
    value += edge.leading + (result.primary || edge.core) + edge.trailing;
    if (delay > 0) await sleep(delay);
  }
  return { value, protectedSummary };
}

async function requestProtectedBatch(input, delay) {
  const lines = String(input || '').replace(/\r\n?/g, '\n').split('\n');
  const output = [];
  const protectedSummary = {};

  for (const line of lines) {
    if (!hasRomanText(line) && !protectedTokens.hasProtectedToken(line)) {
      output.push(line);
      continue;
    }
    const chunks = splitParagraph(line, 900);
    const converted = [];
    for (const chunk of chunks) {
      const result = await requestProtectedChunk(chunk, delay);
      converted.push(result.value);
      mergeCounts(protectedSummary, result.protectedSummary);
    }
    output.push(converted.join(' '));
  }

  const primary = output.join('\n');
  return { primary, suggestions: [primary], protected: protectedSummary };
}

function localDirectResult(input) {
  return { primary: core.normalize(input), suggestions: [core.normalize(input)] };
}

function markdown(report) {
  const lines = [];
  lines.push('# Roman Urdu benchmark result');
  lines.push('');
  lines.push('Generated: ' + report.generated_at);
  lines.push('Provider: ' + report.provider);
  lines.push('Candidate: ' + (report.candidate || 'baseline'));
  lines.push('Fixture count: ' + report.summary.total);
  lines.push('Scored pass rate: ' + (report.summary.pass_rate == null ? 'n/a' : (report.summary.pass_rate * 100).toFixed(1) + '%'));
  lines.push('');
  lines.push('| Category | Total | Pass | Fail | Manual | Error |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: |');
  for (const [category, row] of Object.entries(report.summary.by_category)) {
    lines.push(`| ${category} | ${row.total} | ${row.pass} | ${row.fail} | ${row.manual} | ${row.error} |`);
  }
  lines.push('');
  lines.push('## Failures / review');
  lines.push('');
  for (const item of report.results.filter(item => item.score.status !== 'pass')) {
    lines.push(`- **${item.fixture.id}** (${item.fixture.category}, ${item.score.status}) — input: \`${item.fixture.input.replace(/\n/g, ' ↵ ')}\`; primary: \`${(item.provider.primary || '').replace(/\n/g, ' ↵ ')}\`; ${item.score.reasons.join('; ')}`);
  }
  lines.push('');
  lines.push('This report contains only the authored benchmark fixtures and provider results for those fixtures. It contains no production user writing.');
  return lines.join('\n') + '\n';
}

async function main() {
  const options = args(process.argv);
  if (options.help) {
    console.log('Usage: node scripts/roman-urdu-benchmark/run.js [--category name] [--limit n] [--out path] [--delay ms] [--candidate protected-tokens]');
    return;
  }
  if (options.category && !core.VALID_CATEGORIES.has(options.category)) throw new Error('Unknown category: ' + options.category);
  if (options.candidate && !VALID_CANDIDATES.has(options.candidate)) throw new Error('Unknown candidate: ' + options.candidate);

  let selected = fixtures.slice();
  if (options.category) selected = selected.filter(f => f.category === options.category);
  if (Number.isFinite(options.limit) && options.limit > 0) selected = selected.slice(0, options.limit);

  const invalid = selected.flatMap(fixture => core.validateFixture(fixture).map(error => `${fixture.id}: ${error}`));
  if (invalid.length) throw new Error('Invalid fixture corpus:\n' + invalid.join('\n'));

  const results = [];
  for (let index = 0; index < selected.length; index += 1) {
    const fixture = selected[index];
    let provider;
    let score;
    try {
      if (fixture.category === 'direct_urdu_protection') {
        provider = localDirectResult(fixture.input);
      } else if (options.candidate === 'protected-tokens' && protectedTokens.hasProtectedToken(fixture.input)) {
        provider = await requestProtectedBatch(fixture.input, options.delay);
      } else if (fixture.category === 'long_paste') {
        provider = await requestProductionLikeBatch(fixture.input, options.delay);
      } else {
        provider = await requestGoogle(fixture.input);
        if (options.delay > 0) await sleep(options.delay);
      }
      score = core.scoreFixture(fixture, provider);
    } catch (error) {
      provider = { primary: '', suggestions: [], error: error.message };
      score = { status: 'error', pass: false, reasons: [error.message] };
    }
    results.push({ fixture, provider, score });
    process.stdout.write(`[${index + 1}/${selected.length}] ${fixture.id}: ${score.status}\n`);
  }

  const report = {
    generated_at: new Date().toISOString(),
    provider: 'Google Input Tools ur-t-i0-und + production-like line/chunk handling + local direct-mode protection',
    candidate: options.candidate,
    endpoint: ENDPOINT,
    fixture_version: 'wu-journey-001b-v1',
    summary: core.summarize(results),
    results
  };

  const json = JSON.stringify(report, null, 2) + '\n';
  if (options.out) {
    const outPath = path.resolve(options.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, outPath.endsWith('.md') ? markdown(report) : json, 'utf8');
    console.log('Wrote ' + outPath);
  } else {
    console.log(json);
  }

  if (report.summary.invalid || report.summary.error) process.exitCode = 2;
}

main().catch(error => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
