const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const endpointSource = read('functions', 'api', 'ai-writing.js');
const providerSource = read('functions', 'lib', 'ai-writing', 'providers', 'mistral.mjs');
const migration = read('migrations', '0011_ai_writing_usage.sql');

assert.match(migration, /CREATE TABLE IF NOT EXISTS ai_writing_monthly_usage/, 'Budget migration must add its usage table');
assert.doesNotMatch(migration, /\b(?:ALTER|DROP)\s+TABLE\b/i, 'AI writing migration must remain additive');
const createdTables = [...migration.matchAll(/CREATE TABLE IF NOT EXISTS\s+(\w+)/gi)].map((match) => match[1]);
assert.deepStrictEqual(createdTables, ['ai_writing_monthly_usage'], 'Migration must create only its own table');

assert.match(endpointSource, /env\.AI_WRITING_ENABLED !== 'true'/, 'AI writing must stay independently kill-switched');
assert.match(endpointSource, /env\.METRICS_DB/, 'AI writing must reuse the existing D1 binding, not a new one');
assert.doesNotMatch(endpointSource, /ACCOUNT_DB|WRITE_URDU_DB|AI_WRITING_DB/, 'AI writing must not create or depend on another D1 binding');
assert.match(endpointSource, /'cache-control': 'no-store'/, 'Every AI writing response must be no-store');
assert.doesNotMatch(endpointSource, /console\.(?:log|info|warn|error)/, 'AI writing endpoint must not log request/response text');

assert.match(providerSource, /cf-aig-collect-log-payload.*'false'/, 'Gateway payload logging must stay disabled (release blocker)');
assert.match(providerSource, /cf-aig-skip-cache.*'true'/, 'Gateway response caching must stay skipped for user text');
assert.doesNotMatch(providerSource, /console\.(?:log|info|warn|error)/, 'Provider adapter must not log request/response text');

const turnstileSource = read('functions', 'lib', 'ai-writing', 'turnstile.mjs');
assert.match(turnstileSource, /env\.TURNSTILE_SECRET_KEY/, 'AI writing must reuse the existing Turnstile secret, not a new one');
assert.doesNotMatch(turnstileSource, /env\.TURNSTILE_SITE_KEY/, 'Server-side verification must never need the public site key');
assert.match(endpointSource, /cf-turnstile-response/, 'Endpoint must read the standard Turnstile widget field');
assert.match(endpointSource, /requestIsSameOrigin/, 'Endpoint must reject cross-origin submissions like functions/api/messages.js does');

(async () => {
  const actions = await import(pathToFileURL(path.join(root, 'functions', 'lib', 'ai-writing', 'actions.mjs')).href);
  const validate = await import(pathToFileURL(path.join(root, 'functions', 'lib', 'ai-writing', 'validate.mjs')).href);
  const policy = await import(pathToFileURL(path.join(root, 'functions', 'lib', 'ai-writing', 'policy.mjs')).href);
  const prompts = await import(pathToFileURL(path.join(root, 'functions', 'lib', 'ai-writing', 'prompts.mjs')).href);

  assert.deepStrictEqual(actions.ACTIONS, ['fix', 'improve', 'simplify', 'formal', 'friendly', 'shorten', 'expand', 'summarize']);
  for (const action of actions.ACTIONS) {
    assert.ok(prompts.PROMPTS[action], `${action} must have a versioned prompt`);
    assert.ok(prompts.PROMPTS[action].invariants.length > 0, `${action} prompt must record invariants`);
    assert.ok(actions.MAX_OUTPUT_TOKENS[action] > 0, `${action} must have a bounded output token cap`);
  }

  assert.deepStrictEqual(validate.validateRequest({ version: 1, action: 'nope', text: 'hi' }), {
    ok: false,
    code: 'invalid-input',
    message: 'Unknown or unsupported action.'
  });
  assert.strictEqual(validate.validateRequest({ version: 1, action: 'fix', text: '   ' }).ok, false);
  assert.strictEqual(validate.validateRequest({ version: 1, action: 'fix', text: 'x'.repeat(validate.MAX_TEXT_CHARS + 1) }).code, 'too-large');
  const validated = validate.validateRequest({ version: 1, action: 'fix', text: '  علی کل آیا  ' });
  assert.strictEqual(validated.ok, true);
  assert.strictEqual(validated.value.text, 'علی کل آیا', 'Validated text must be trimmed but not otherwise mutated');

  // In-memory D1 stand-in for the monthly usage table.
  const rows = new Map();
  const fakeDb = {
    prepare(sql) {
      return {
        bind(...args) {
          this.args = args;
          return this;
        },
        async run() {
          if (/CREATE TABLE/.test(sql)) return;
          const [month, tokens, updatedAt] = this.args;
          const row = rows.get(month) || { requests_count: 0, estimated_tokens: 0 };
          row.requests_count += 1;
          row.estimated_tokens += tokens;
          row.updated_at = updatedAt;
          rows.set(month, row);
        },
        async first() {
          const month = this.args[0];
          return rows.has(month) ? { estimated_tokens: rows.get(month).estimated_tokens } : null;
        }
      };
    }
  };

  const now = new Date('2026-08-05T00:00:00.000Z'); // day 5 of a 31-day month
  const env = { AI_WRITING_MONTHLY_TOKEN_BUDGET: '3100', AI_WRITING_PACING_MULTIPLIER: '1' };
  // paced allowance at day 5/31 with multiplier 1 => 3100 * (5/31) ≈ 500 tokens
  const first = await policy.checkBudget(fakeDb, { text: 'x'.repeat(100), maxOutputTokens: 100, env, now });
  assert.strictEqual(first.allowed, true, 'Request within the day-5 paced allowance must be allowed');
  await policy.recordUsage(fakeDb, first.month, first.estimate, now);

  const second = await policy.checkBudget(fakeDb, { text: 'x'.repeat(2000), maxOutputTokens: 500, env, now });
  assert.strictEqual(second.allowed, false, 'A request that would blow past the day-5 paced allowance must be denied');
  assert.strictEqual(second.code, 'budget-exhausted');

  const noDb = await policy.checkBudget(null, { text: 'hi', maxOutputTokens: 10, env, now });
  assert.strictEqual(noDb.allowed, false, 'Missing D1 binding must fail closed, not silently allow');

  const { onRequestPost } = await import(pathToFileURL(path.join(root, 'functions', 'api', 'ai-writing.js')).href);
  const endpointEnv = {
    AI_WRITING_ENABLED: 'true',
    TURNSTILE_SECRET_KEY: 'test-secret',
    METRICS_DB: fakeDb,
    CF_ACCOUNT_ID: 'acct',
    CF_AIG_GATEWAY: 'gw',
    MISTRAL_API_KEY: 'test-key'
  };
  const postRequest = (body, headers = {}) => new Request('https://write-urdu.com/api/ai-writing', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://write-urdu.com', ...headers },
    body: JSON.stringify(body)
  });

  const originalFetch = global.fetch;
  let providerCalled = false;
  let turnstileCallCount = 0;
  global.fetch = async (url, init) => {
    if (String(url).includes('challenges.cloudflare.com')) {
      turnstileCallCount += 1;
      const params = new URLSearchParams(init.body);
      const ok = params.get('response') === 'good-token';
      return new Response(JSON.stringify({ success: ok, action: 'ai-writing', hostname: 'write-urdu.com' }), { status: 200 });
    }
    providerCalled = true;
    return new Response(JSON.stringify({ choices: [{ message: { content: 'ok' } }] }), { status: 200 });
  };

  try {
    let response = await onRequestPost({ request: postRequest({ version: 1, action: 'fix', text: 'hi' }, { origin: 'https://evil.example' }), env: endpointEnv });
    assert.strictEqual(response.status, 502, 'Cross-origin requests must be rejected before Turnstile/provider work');
    assert.strictEqual(turnstileCallCount, 0);

    providerCalled = false;
    response = await onRequestPost({ request: postRequest({ version: 1, action: 'fix', text: 'hi', 'cf-turnstile-response': 'bad-token' }), env: endpointEnv });
    const failBody = await response.json();
    assert.strictEqual(failBody.code, 'refused', 'A failed Turnstile check must block the request');
    assert.strictEqual(providerCalled, false, 'Provider must never be called when Turnstile verification fails');

    response = await onRequestPost({ request: postRequest({ version: 1, action: 'fix', text: 'hi', 'cf-turnstile-response': 'good-token' }), env: endpointEnv });
    assert.strictEqual(response.status, 200, 'A verified request must reach the provider and succeed');
    assert.strictEqual(providerCalled, true);
  } finally {
    global.fetch = originalFetch;
  }

  console.log('AI writing WU-AI-001B contracts passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
