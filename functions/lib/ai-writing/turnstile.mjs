// WU-AI-001B — Turnstile bot-check, reusing the same TURNSTILE_SITE_KEY/TURNSTILE_SECRET_KEY
// Pages secrets already used by functions/api/messages.js. Product override of spec §19's
// "only if abuse evidence justifies it" default — added on explicit request, not evidence-led.

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
export const TURNSTILE_ACTION = 'ai-writing';

export function turnstileConfigured(env) {
  return Boolean(String(env?.TURNSTILE_SECRET_KEY || '').trim());
}

export async function verifyTurnstile({ token, request, env, fetchImpl = fetch }) {
  if (!token || typeof token !== 'string' || token.length > 2048) return false;

  const remoteIp = request.headers.get('CF-Connecting-IP') || '';
  const body = new URLSearchParams({
    secret: String(env.TURNSTILE_SECRET_KEY).trim(),
    response: token,
    remoteip: remoteIp,
    idempotency_key: crypto.randomUUID()
  });

  let response;
  try {
    response = await fetchImpl(VERIFY_URL, { method: 'POST', body });
  } catch {
    return false;
  }
  if (!response.ok) return false;

  const result = await response.json();
  const expectedHostname = new URL(request.url).hostname;
  return result.success === true
    && result.action === TURNSTILE_ACTION
    && (!result.hostname || result.hostname === expectedHostname);
}
