import { Auth } from '@auth/core';
import Google from '@auth/core/providers/google';
import { D1Adapter } from '@auth/d1-adapter';
import { incrementVoiceAccountMetrics } from './voice-account-metrics.mjs';

export const AUTH_CONFIGURATION_STATE = Object.freeze({
  DISABLED: 'disabled',
  MISCONFIGURED: 'misconfigured',
  READY: 'ready'
});

const AUTH_BASE_PATH = '/api/auth';
const IDENTITY_SCOPE = 'openid email profile';
const VOICE_TRY_COOKIE = 'wu_voice_tried';

function stringValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function hasD1Binding(database) {
  return Boolean(database && typeof database.prepare === 'function');
}

function hasVoiceTryMarker(request) {
  const cookie = String(request && request.headers && request.headers.get('cookie') || '');
  return cookie.split(';').some((part) => part.trim() === `${VOICE_TRY_COOKIE}=1`);
}

export function getIdentityProviderReadiness(env = {}) {
  const googleClientId = stringValue(env.GOOGLE_CLIENT_ID);
  const googleClientSecret = stringValue(env.GOOGLE_CLIENT_SECRET);
  const googleConfigured = Boolean(googleClientId && googleClientSecret);
  const googlePartial = Boolean(googleClientId || googleClientSecret) && !googleConfigured;

  return Object.freeze([
    Object.freeze({
      id: 'google',
      ready: googleConfigured,
      partial: googlePartial
    })
  ]);
}

export function getAuthReadiness(env = {}) {
  if (env.AUTH_ENABLED !== 'true') {
    return Object.freeze({ state: AUTH_CONFIGURATION_STATE.DISABLED, ready: false, providers: Object.freeze([]) });
  }

  const missing = [];
  if (!stringValue(env.AUTH_SECRET)) missing.push('AUTH_SECRET');
  if (!hasD1Binding(env.METRICS_DB)) missing.push('METRICS_DB');

  const providerStates = getIdentityProviderReadiness(env);
  const readyProviders = providerStates.filter((provider) => provider.ready).map((provider) => provider.id);
  const partialProviders = providerStates.filter((provider) => provider.partial).map((provider) => provider.id);

  if (readyProviders.length === 0) missing.push('IDENTITY_PROVIDER');

  if (missing.length > 0) {
    return Object.freeze({
      state: AUTH_CONFIGURATION_STATE.MISCONFIGURED,
      ready: false,
      missing: Object.freeze(missing),
      providers: Object.freeze(readyProviders),
      partialProviders: Object.freeze(partialProviders)
    });
  }

  return Object.freeze({
    state: AUTH_CONFIGURATION_STATE.READY,
    ready: true,
    providers: Object.freeze(readyProviders),
    partialProviders: Object.freeze(partialProviders)
  });
}

export function authEnabled(env = {}) {
  return getAuthReadiness(env).ready;
}

export function buildIdentityProviders(env = {}) {
  const clientId = stringValue(env.GOOGLE_CLIENT_ID);
  const clientSecret = stringValue(env.GOOGLE_CLIENT_SECRET);
  if (!clientId || !clientSecret) return Object.freeze([]);

  return Object.freeze([
    Google({
      clientId,
      clientSecret,
      allowDangerousEmailAccountLinking: false,
      authorization: {
        params: {
          scope: IDENTITY_SCOPE
        }
      }
    })
  ]);
}

export function resolveAuthRedirect(url, baseUrl) {
  let base;
  try {
    base = new URL(baseUrl);
  } catch {
    throw new TypeError('Auth redirect base URL must be an absolute URL.');
  }

  const fallback = new URL('/', base.origin).href;
  try {
    const target = new URL(url, base.origin);
    return target.origin === base.origin ? target.href : fallback;
  } catch {
    return fallback;
  }
}

function sanitizedLogger() {
  return Object.freeze({
    error(error) {
      console.error('auth-runtime-error', {
        type: stringValue(error?.type) || stringValue(error?.name) || 'unknown'
      });
    },
    warn(code) {
      console.warn('auth-runtime-warning', { code: stringValue(code) || 'unknown' });
    },
    debug() {}
  });
}

export function createAuthConfig(env = {}, options = {}) {
  if (!authEnabled(env)) {
    throw new TypeError('Authentication configuration is not ready.');
  }

  return {
    adapter: D1Adapter(env.METRICS_DB),
    providers: buildIdentityProviders(env),
    secret: stringValue(env.AUTH_SECRET),
    basePath: AUTH_BASE_PATH,
    trustHost: true,
    pages: {
      signIn: '/sign-in',
      error: '/sign-in'
    },
    session: { strategy: 'database' },
    logger: sanitizedLogger(),
    events: {
      async createUser() {
        try {
          await incrementVoiceAccountMetrics(env.METRICS_DB, {
            accountSignups: 1,
            voiceAssistedSignups: options.voiceAssisted === true ? 1 : 0
          });
        } catch {
          // Product analytics must never block account creation.
          console.warn('auth-analytics-warning', { metric: 'account-signup' });
        }
      }
    },
    callbacks: {
      async redirect({ url, baseUrl }) {
        return resolveAuthRedirect(url, baseUrl);
      },
      async session({ session, user }) {
        const userId = stringValue(user?.id);
        if (!userId || !session?.user) return session;
        session.user = { ...session.user, id: userId };
        return session;
      }
    }
  };
}

function jsonResponse(body, status) {
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

function withAccountResponseHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'no-referrer');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export async function handleAuthRequest(request, env = {}, { auth = Auth } = {}) {
  const readiness = getAuthReadiness(env);
  if (readiness.state === AUTH_CONFIGURATION_STATE.DISABLED) {
    return jsonResponse({ error: { code: 'auth_not_enabled' } }, 404);
  }
  if (!readiness.ready) {
    return jsonResponse({ error: { code: 'auth_unavailable' } }, 503);
  }

  try {
    const options = { voiceAssisted: hasVoiceTryMarker(request) };
    return withAccountResponseHeaders(await auth(request, createAuthConfig(env, options)));
  } catch {
    return jsonResponse({ error: { code: 'auth_unavailable' } }, 503);
  }
}

export async function getSession(request, env = {}, { auth = Auth } = {}) {
  if (!authEnabled(env)) return null;

  const origin = new URL(request.url).origin;
  const sessionRequest = new Request(new URL(`${AUTH_BASE_PATH}/session`, origin), {
    method: 'GET',
    headers: {
      cookie: request.headers.get('cookie') || ''
    }
  });

  let response;
  try {
    response = await auth(sessionRequest, createAuthConfig(env));
  } catch {
    throw new Error('auth_session_unavailable');
  }
  if (!response.ok) throw new Error('auth_session_unavailable');

  const session = await response.json().catch(() => null);
  if (!session || typeof session !== 'object' || !session.user) return null;
  if (!stringValue(session.user.id)) return null;
  return session;
}
