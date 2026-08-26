const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};

export function createFormConfiguration(env = {}) {
  const hasTurnstile = ['TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY']
    .every((key) => Boolean(String(env[key] || '').trim()));
  const hasMailer = typeof env.FORM_MAILER?.fetch === 'function';

  return {
    configured: hasTurnstile && hasMailer,
    turnstileSiteKey: String(env.TURNSTILE_SITE_KEY || '').trim(),
    aiWritingEnabled: env.AI_WRITING_ENABLED === 'true'
  };
}

export function onRequestGet({ env }) {
  return new Response(JSON.stringify(createFormConfiguration(env)), {
    status: 200,
    headers: JSON_HEADERS
  });
}
