'use strict';

// WU-AI-001A benchmark runner.
// Calls each configured provider (through the write-urdu-ai Cloudflare AI Gateway) against the
// safe synthetic corpus, records raw machine metrics, and emits a human-scoring worksheet.
//
// Usage:
//   node scripts/ai-writing-benchmark/run.js [--providers=mistral,groq] [--actions=fix,improve]
//                                             [--limit=N] [--delay=300]
//
// Requires a local .env (see .env.example) with CF_ACCOUNT_ID, CF_AIG_GATEWAY, CF_AIG_TOKEN,
// and per-provider API keys. Providers with a missing key are skipped, not failed.

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
loadDotEnv(path.join(root, '.env'));

const { PROVIDERS } = require('./providers');
const { PROMPT_VERSION } = require('./prompts');
const corpus = require('./corpus.json');

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const args = { providers: null, actions: null, limit: null, delay: 300 };
  for (const raw of argv) {
    const [key, value] = raw.replace(/^--/, '').split('=');
    if (key === 'providers') args.providers = value.split(',').map((s) => s.trim());
    else if (key === 'actions') args.actions = value.split(',').map((s) => s.trim());
    else if (key === 'limit') args.limit = Number(value);
    else if (key === 'delay') args.delay = Number(value);
  }
  return args;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function csvEscape(value) {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  let cases = corpus.cases;
  if (args.actions) cases = cases.filter((c) => args.actions.includes(c.action));
  if (args.limit) cases = cases.slice(0, args.limit);

  let providers = PROVIDERS;
  if (args.providers) providers = providers.filter((p) => args.providers.includes(p.id));

  const env = process.env;
  const results = [];

  for (const provider of providers) {
    console.log(`\n=== ${provider.label} (${provider.model}) ===`);
    let ran = 0;
    let skippedNoKey = false;
    for (const testCase of cases) {
      const result = await provider.transform(testCase.input, testCase.action, env);
      if (!result.ok && result.category === 'invalid-input' && /Missing .*API_KEY/.test(result.error || '')) {
        console.log(`  skipped (no API key configured)`);
        skippedNoKey = true;
        break;
      }
      ran += 1;
      results.push({
        caseId: testCase.id,
        action: testCase.action,
        categories: testCase.categories,
        preserve: testCase.preserve || [],
        input: testCase.input,
        providerId: provider.id,
        model: provider.model,
        promptVersion: PROMPT_VERSION,
        ...result,
      });
      const status = result.ok ? `ok (${result.durationMs}ms)` : `FAIL ${result.category}: ${result.error}`;
      console.log(`  ${testCase.id} [${testCase.action}] -> ${status}`);
      if (args.delay) await sleep(args.delay);
    }
    if (!skippedNoKey) console.log(`  ${ran}/${cases.length} cases run`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(__dirname, 'results');
  fs.mkdirSync(outDir, { recursive: true });

  const rawPath = path.join(outDir, `raw-${timestamp}.json`);
  fs.writeFileSync(rawPath, JSON.stringify({ generatedAt: new Date().toISOString(), promptVersion: PROMPT_VERSION, results }, null, 2), 'utf8');

  const scoreColumns = [
    'meaning_preservation_1_5',
    'grammar_1_5',
    'natural_pakistani_urdu_1_5',
    'script_spelling_1_5',
    'code_switch_handling_1_5',
    'name_number_fidelity_1_5',
    'task_adherence_1_5',
    'hallucination_risk_1_5',
    'scorer_notes',
  ];
  const header = ['case_id', 'action', 'categories', 'provider', 'model', 'input', 'output', 'error', 'duration_ms', 'total_tokens', ...scoreColumns];
  const csvRows = [header.join(',')];
  for (const r of results) {
    const row = [
      r.caseId,
      r.action,
      (r.categories || []).join('|'),
      r.providerId,
      r.model,
      r.input,
      r.ok ? r.outputText : '',
      r.ok ? '' : `${r.category}: ${r.error}`,
      r.durationMs ?? '',
      r.usage?.totalTokens ?? '',
      ...scoreColumns.map(() => ''),
    ];
    csvRows.push(row.map(csvEscape).join(','));
  }
  const csvPath = path.join(outDir, `scoring-worksheet-${timestamp}.csv`);
  fs.writeFileSync(csvPath, '﻿' + csvRows.join('\n'), 'utf8');

  console.log('\n=== Summary ===');
  const byProvider = {};
  for (const r of results) {
    byProvider[r.providerId] = byProvider[r.providerId] || { total: 0, ok: 0, errors: {}, durations: [] };
    const bucket = byProvider[r.providerId];
    bucket.total += 1;
    if (r.ok) {
      bucket.ok += 1;
      bucket.durations.push(r.durationMs);
    } else {
      bucket.errors[r.category] = (bucket.errors[r.category] || 0) + 1;
    }
  }
  for (const [id, bucket] of Object.entries(byProvider)) {
    const avg = bucket.durations.length ? Math.round(bucket.durations.reduce((a, b) => a + b, 0) / bucket.durations.length) : null;
    console.log(`${id}: ${bucket.ok}/${bucket.total} ok, avg ${avg}ms, errors: ${JSON.stringify(bucket.errors)}`);
  }

  console.log(`\nRaw results: ${rawPath}`);
  console.log(`Scoring worksheet: ${csvPath}`);
  console.log('Next: open the worksheet, fill the 1-5 score columns per row by hand, then summarize per provider.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
