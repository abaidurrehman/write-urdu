import {
  AUTH_CONFIGURATION_STATE,
  getAuthReadiness,
  getSession
} from '../lib/auth.mjs';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer'
    }
  });
}

function profileValue(value) {
  return typeof value === 'string' ? value : '';
}

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') {
    return json(405, { error: { code: 'method_not_allowed' } });
  }

  const readiness = getAuthReadiness(env);
  if (readiness.state === AUTH_CONFIGURATION_STATE.DISABLED) {
    return json(200, { authenticated: false, available: false });
  }
  if (!readiness.ready) {
    return json(503, { error: { code: 'auth_unavailable' } });
  }

  let session;
  try {
    session = await getSession(request, env);
  } catch {
    return json(503, { error: { code: 'auth_unavailable' } });
  }

  if (!session?.user?.id) {
    return json(200, { authenticated: false, available: true });
  }

  return json(200, {
    authenticated: true,
    available: true,
    user: {
      id: String(session.user.id),
      name: profileValue(session.user.name),
      email: profileValue(session.user.email),
      image: profileValue(session.user.image)
    }
  });
}
