// WU-AI-001B — AI writing transform endpoint (spec §13/§14).
// Off by default: set AI_WRITING_ENABLED=true only once Gate A/B evidence (terms matrix + human
// benchmark review, spec §20) is closed out. Fails closed before touching env/database.
// Requires a `cf-turnstile-response` field in the JSON body (same widget/secret as
// functions/api/messages.js), verified with action "ai-writing".

import { isValidAction, MAX_OUTPUT_TOKENS } from '../lib/ai-writing/actions.mjs';
import { PROMPTS } from '../lib/ai-writing/prompts.mjs';
import { validateRequest, MAX_BODY_BYTES } from '../lib/ai-writing/validate.mjs';
import { checkBudget, recordUsage } from '../lib/ai-writing/policy.mjs';
import { mistralProvider } from '../lib/ai-writing/providers/mistral.mjs';
import { turnstileConfigured, verifyTurnstile } from '../lib/ai-writing/turnstile.mjs';

const REQUEST_TIMEOUT_MS = 20000;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    }
  });
}

function fail(code, message) {
  const status = { 'invalid-input': 400, 'too-large': 413, 'rate-limited': 429, 'provider-unavailable': 503, timeout: 504, refused: 502, 'invalid-output': 502, 'budget-exhausted': 429 }[code] || 500;
  return json(status, { ok: false, code, message });
}

function requestIsSameOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (env.AI_WRITING_ENABLED !== 'true') {
    return json(404, { ok: false, code: 'invalid-input', message: 'Not found.' });
  }
  if (!requestIsSameOrigin(request)) {
    return fail('refused', 'This request could not be accepted.');
  }

  const contentType = String(request.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return fail('invalid-input', 'JSON body required.');
  }
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return fail('too-large', 'Request body too large.');
  }

  const raw = await request.text().catch(() => '');
  if (!raw || raw.length > MAX_BODY_BYTES) {
    return fail(raw ? 'too-large' : 'invalid-input', raw ? 'Request body too large.' : 'Request body required.');
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail('invalid-input', 'Invalid JSON.');
  }

  const validated = validateRequest(body);
  if (!validated.ok) {
    return fail(validated.code, validated.message);
  }
  const { action, text } = validated.value;

  if (!turnstileConfigured(env)) {
    return fail('provider-unavailable', 'Spam protection is not configured.');
  }
  const turnstileToken = typeof body['cf-turnstile-response'] === 'string' ? body['cf-turnstile-response'] : '';
  const verified = await verifyTurnstile({ token: turnstileToken, request, env }).catch(() => false);
  if (!verified) {
    return fail('refused', 'Complete verification and try again.');
  }

  const maxOutputTokens = MAX_OUTPUT_TOKENS[action];
  const budget = await checkBudget(env.METRICS_DB, { text, maxOutputTokens, env });
  if (!budget.allowed) {
    return fail(budget.code, budget.message);
  }

  const prompt = PROMPTS[action];
  const requestId = crypto.randomUUID();
  const result = await mistralProvider.transform(
    {
      messages: [
        { role: 'system', content: prompt.systemPrompt },
        { role: 'user', content: text }
      ],
      maxOutputTokens,
      timeoutMs: REQUEST_TIMEOUT_MS,
      requestId
    },
    env
  );

  if (!result.ok) {
    return fail(result.code, 'We could not process that request right now.');
  }

  await recordUsage(env.METRICS_DB, budget.month, budget.estimate);

  return json(200, {
    ok: true,
    version: 1,
    action,
    result: result.outputText,
    meta: {
      requestId,
      providerAlias: mistralProvider.id,
      modelAlias: mistralProvider.modelAlias,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      durationMs: result.durationMs
    }
  });
}
