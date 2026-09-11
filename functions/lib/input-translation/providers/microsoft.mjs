// WU-INPUT-001B — Microsoft Translator adapter. Server-side credentials only.

const DEFAULT_ENDPOINT = 'https://api.cognitive.microsofttranslator.com';
const DEFAULT_TIMEOUT_MS = 8000;

function classifyStatus(status) {
  if (status === 401 || status === 403) return 'refused';
  if (status === 429) return 'rate-limited';
  if (status >= 500) return 'provider-unavailable';
  return 'provider-unavailable';
}

function failure(code = 'provider-unavailable') {
  return { ok: false, code };
}

export async function translateWithMicrosoft(request, env, options = {}) {
  const key = env?.AZURE_TRANSLATOR_KEY;
  if (!key) return failure('provider-unavailable');

  const endpoint = String(env.AZURE_TRANSLATOR_ENDPOINT || DEFAULT_ENDPOINT).replace(/\/+$/, '');
  const fetchFn = options.fetchFn || fetch;
  const timeoutMs = Number(options.timeoutMs || DEFAULT_TIMEOUT_MS);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();

  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'Ocp-Apim-Subscription-Key': key
  };
  if (env.AZURE_TRANSLATOR_REGION) {
    headers['Ocp-Apim-Subscription-Region'] = env.AZURE_TRANSLATOR_REGION;
  }

  const url = `${endpoint}/translate?api-version=3.0&from=${encodeURIComponent(request.from)}&to=${encodeURIComponent(request.to)}`;

  let response;
  try {
    response = await fetchFn(url, {
      method: 'POST',
      signal: controller.signal,
      headers,
      body: JSON.stringify([{ Text: request.text }])
    });
  } catch (error) {
    clearTimeout(timer);
    if (error?.name === 'AbortError') return failure('timeout');
    return failure('provider-unavailable');
  }
  clearTimeout(timer);

  if (!response?.ok) {
    return failure(classifyStatus(Number(response?.status || 0)));
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    return failure('invalid-output');
  }

  const translation = payload?.[0]?.translations?.[0]?.text;
  if (typeof translation !== 'string' || !translation.trim()) {
    return failure('invalid-output');
  }

  return {
    ok: true,
    translation: translation.trim(),
    providerAlias: 'microsoft-translator',
    modelAlias: 'translator-v3',
    durationMs: Date.now() - started
  };
}
