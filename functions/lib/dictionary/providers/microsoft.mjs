import {
  DICTIONARY_MAX_BACK_TRANSLATIONS,
  DICTIONARY_MAX_ENTRIES
} from '../contract.mjs';

const DEFAULT_ENDPOINT = 'https://api.cognitive.microsofttranslator.com';
const DEFAULT_TIMEOUT_MS = 7000;

function failure(code) {
  return { ok: false, code };
}

function classifyStatus(status) {
  if (status === 401 || status === 403) return 'dictionary_not_configured';
  if (status === 429) return 'dictionary_rate_limited';
  if (status >= 500) return 'dictionary_unavailable';
  return 'dictionary_unavailable';
}

function nonNegativeInt(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.floor(number);
}

function confidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1) return null;
  return number;
}

function normalizeBackTranslations(items) {
  if (!Array.isArray(items)) return [];
  return items
    .slice(0, DICTIONARY_MAX_BACK_TRANSLATIONS)
    .map(item => {
      const term = String(item?.displayText || item?.normalizedText || '').trim();
      if (!term) return null;
      return {
        term,
        examplesAvailable: nonNegativeInt(item?.numExamples),
        frequency: nonNegativeInt(item?.frequencyCount)
      };
    })
    .filter(Boolean);
}

function normalizeEntries(items) {
  if (!Array.isArray(items)) return [];
  return items
    .slice(0, DICTIONARY_MAX_ENTRIES)
    .map(item => {
      const term = String(item?.displayTarget || item?.normalizedTarget || '').trim();
      if (!term) return null;
      const part = String(item?.posTag || '').trim();
      return {
        term,
        partOfSpeech: part || null,
        confidence: confidence(item?.confidence),
        backTranslations: normalizeBackTranslations(item?.backTranslations)
      };
    })
    .filter(Boolean);
}

export async function lookupWithMicrosoft(request, env, options = {}) {
  const key = env?.AZURE_TRANSLATOR_KEY;
  if (!key) return failure('dictionary_not_configured');

  const endpoint = String(env.AZURE_TRANSLATOR_ENDPOINT || DEFAULT_ENDPOINT).replace(/\/+$/, '');
  const fetchFn = options.fetchFn || fetch;
  const timeoutMs = Number(options.timeoutMs || DEFAULT_TIMEOUT_MS);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'Ocp-Apim-Subscription-Key': key
  };
  if (env.AZURE_TRANSLATOR_REGION) headers['Ocp-Apim-Subscription-Region'] = env.AZURE_TRANSLATOR_REGION;

  const url = `${endpoint}/dictionary/lookup?api-version=3.0&from=${encodeURIComponent(request.from)}&to=${encodeURIComponent(request.to)}`;

  let response;
  try {
    response = await fetchFn(url, {
      method: 'POST',
      signal: controller.signal,
      headers,
      body: JSON.stringify([{ Text: request.term }])
    });
  } catch (error) {
    clearTimeout(timer);
    if (error?.name === 'AbortError') return failure('dictionary_timeout');
    return failure('dictionary_unavailable');
  }
  clearTimeout(timer);

  if (!response?.ok) return failure(classifyStatus(Number(response?.status || 0)));

  let payload;
  try {
    payload = await response.json();
  } catch {
    return failure('dictionary_invalid_response');
  }

  if (!Array.isArray(payload) || !payload[0] || !Array.isArray(payload[0].translations)) {
    return failure('dictionary_invalid_response');
  }

  const source = String(payload[0].displaySource || payload[0].normalizedSource || request.term).trim() || request.term;
  return {
    ok: true,
    source,
    entries: normalizeEntries(payload[0].translations)
  };
}
