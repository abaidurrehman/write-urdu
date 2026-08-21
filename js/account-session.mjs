export const ACCOUNT_STATE = Object.freeze({
  DISABLED: 'disabled',
  SIGNED_OUT: 'signed-out',
  SIGNED_IN: 'signed-in'
});

const DEFAULT_RETURN_TARGET = '/';
const BLOCKED_RETURN_PREFIXES = Object.freeze([
  '/api/',
  '/share-media/',
  '/sign-in'
]);

function stringValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function resolveAccountReturnTarget(value, fallback = DEFAULT_RETURN_TARGET) {
  const candidate = stringValue(value);
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return fallback;

  let url;
  try {
    url = new URL(candidate, 'https://write-urdu.invalid');
  } catch {
    return fallback;
  }

  if (url.origin !== 'https://write-urdu.invalid') return fallback;
  if (BLOCKED_RETURN_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return fallback;

  return `${url.pathname}${url.search}${url.hash}`;
}

export function projectAccountState(payload) {
  if (!payload || payload.available !== true) {
    return Object.freeze({ state: ACCOUNT_STATE.DISABLED, user: null });
  }

  if (payload.authenticated !== true || !stringValue(payload.user?.id)) {
    return Object.freeze({ state: ACCOUNT_STATE.SIGNED_OUT, user: null });
  }

  return Object.freeze({
    state: ACCOUNT_STATE.SIGNED_IN,
    user: Object.freeze({
      id: stringValue(payload.user.id),
      name: stringValue(payload.user.name),
      email: stringValue(payload.user.email),
      image: stringValue(payload.user.image)
    })
  });
}

export function accountErrorMessage(code) {
  const normalized = stringValue(code).toLowerCase();
  if (normalized === 'accessdenied' || normalized === 'oauthcallback') {
    return 'Sign-in was not completed. Your writing on this device was not changed.';
  }
  if (normalized === 'oauthaccountnotlinked') {
    return 'This email is already associated with another sign-in method. Try the sign-in method you used before, or continue without an account.';
  }
  if (normalized) {
    return 'Sign-in could not be completed. Your writing is still available on this device.';
  }
  return '';
}

export async function fetchAccountState(fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') throw new TypeError('Account status requires fetch.');
  const response = await fetchImpl('/api/me', {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { accept: 'application/json' }
  });
  if (!response.ok) throw new Error('account_status_unavailable');
  return projectAccountState(await response.json());
}

export async function fetchAuthCsrfToken(fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') throw new TypeError('Auth CSRF token requires fetch.');
  const response = await fetchImpl('/api/auth/csrf', {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { accept: 'application/json' }
  });
  if (!response.ok) throw new Error('auth_csrf_unavailable');
  const payload = await response.json();
  const token = stringValue(payload?.csrfToken);
  if (!token) throw new Error('auth_csrf_unavailable');
  return token;
}

export async function fetchReadyProviderIds(fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') throw new TypeError('Auth providers require fetch.');
  const response = await fetchImpl('/api/auth/providers', {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { accept: 'application/json' }
  });
  if (!response.ok) throw new Error('auth_providers_unavailable');
  const payload = await response.json();
  if (!payload || typeof payload !== 'object') return [];
  return Object.keys(payload);
}

export function flushLocalWriting(root = globalThis) {
  try {
    const saveDraft = root?.WriteUrduTools?.saveDraft;
    if (typeof saveDraft === 'function') saveDraft();
    return true;
  } catch {
    return false;
  }
}

export const ACCOUNT_SESSION_CONTRACT = Object.freeze({
  defaultReturnTarget: DEFAULT_RETURN_TARGET,
  blockedReturnPrefixes: BLOCKED_RETURN_PREFIXES,
  touchesWritingStorage: false,
  identityScopes: Object.freeze(['openid', 'email', 'profile'])
});
