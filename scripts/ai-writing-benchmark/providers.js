'use strict';

// Benchmark-only provider adapters for WU-AI-001A.
// All calls go through the write-urdu-ai Cloudflare AI Gateway, never direct to the provider,
// and always disable Gateway payload logging + caching for the benchmark run.
// This is NOT the production adapter contract (WU-AI-001B) — just enough to score candidates.

const { buildSystemPrompt } = require('./prompts');

const REQUEST_TIMEOUT_MS = 30000;

function classifyError(status, err) {
  if (err && err.name === 'AbortError') return 'timeout';
  if (!status) return 'provider-unavailable';
  if (status === 400) return 'invalid-input';
  if (status === 413) return 'too-large';
  if (status === 429) return 'rate-limited';
  if (status >= 500) return 'provider-unavailable';
  if (status === 401 || status === 403) return 'refused';
  return 'provider-unavailable';
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function gatewayBaseUrl(env, providerSlug) {
  const { CF_ACCOUNT_ID, CF_AIG_GATEWAY } = env;
  if (!CF_ACCOUNT_ID || !CF_AIG_GATEWAY) {
    throw new Error('Missing CF_ACCOUNT_ID or CF_AIG_GATEWAY in environment');
  }
  return `https://gateway.ai.cloudflare.com/v1/${CF_ACCOUNT_ID}/${CF_AIG_GATEWAY}/${providerSlug}`;
}

function gatewayHeaders(env, extra) {
  const headers = {
    'content-type': 'application/json',
    'cf-aig-collect-log-payload': 'false',
    'cf-aig-skip-cache': 'true',
    ...extra,
  };
  if (env.CF_AIG_TOKEN) headers['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}`;
  return headers;
}

function makeOpenAiCompatibleProvider({ id, label, providerSlug, chatPath, apiKeyEnv, model }) {
  return {
    id,
    label,
    model,
    async transform(text, action, env) {
      const apiKey = env[apiKeyEnv];
      if (!apiKey) {
        return { ok: false, category: 'invalid-input', error: `Missing ${apiKeyEnv} in environment` };
      }
      const url = `${gatewayBaseUrl(env, providerSlug)}/${chatPath}`;
      const started = Date.now();
      let response;
      try {
        response = await fetchWithTimeout(url, {
          method: 'POST',
          headers: gatewayHeaders(env, { authorization: `Bearer ${apiKey}` }),
          body: JSON.stringify({
            model,
            temperature: 0.2,
            messages: [
              { role: 'system', content: buildSystemPrompt(action) },
              { role: 'user', content: text },
            ],
          }),
        });
      } catch (err) {
        return { ok: false, category: classifyError(null, err), error: String(err), durationMs: Date.now() - started };
      }
      const durationMs = Date.now() - started;
      let json;
      try {
        json = await response.json();
      } catch (err) {
        return { ok: false, category: 'invalid-output', error: 'Non-JSON response', durationMs, status: response.status };
      }
      if (!response.ok) {
        const message = (json && (json.error?.message || json.message)) || `HTTP ${response.status}`;
        return { ok: false, category: classifyError(response.status, null), error: message, durationMs, status: response.status };
      }
      const outputText = json.choices?.[0]?.message?.content?.trim();
      if (!outputText) {
        return { ok: false, category: 'invalid-output', error: 'Empty completion', durationMs, status: response.status, raw: json };
      }
      return {
        ok: true,
        outputText,
        durationMs,
        status: response.status,
        usage: {
          promptTokens: json.usage?.prompt_tokens ?? null,
          completionTokens: json.usage?.completion_tokens ?? null,
          totalTokens: json.usage?.total_tokens ?? null,
        },
      };
    },
  };
}

const geminiProvider = {
  id: 'gemini',
  label: 'Gemini Flash (quality control only — not production approved)',
  model: 'gemini-3.6-flash',
  async transform(text, action, env) {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return { ok: false, category: 'invalid-input', error: 'Missing GEMINI_API_KEY in environment' };
    }
    const url = `${gatewayBaseUrl(env, 'google-ai-studio')}/v1/models/${geminiProvider.model}:generateContent`;
    const started = Date.now();
    let response;
    try {
      response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: gatewayHeaders(env, { 'x-goog-api-key': apiKey }),
        body: JSON.stringify({
          systemInstruction: { role: 'system', parts: [{ text: buildSystemPrompt(action) }] },
          contents: [{ role: 'user', parts: [{ text }] }],
          generationConfig: { temperature: 0.2 },
        }),
      });
    } catch (err) {
      return { ok: false, category: classifyError(null, err), error: String(err), durationMs: Date.now() - started };
    }
    const durationMs = Date.now() - started;
    let json;
    try {
      json = await response.json();
    } catch (err) {
      return { ok: false, category: 'invalid-output', error: 'Non-JSON response', durationMs, status: response.status };
    }
    if (!response.ok) {
      const message = (json && json.error?.message) || `HTTP ${response.status}`;
      return { ok: false, category: classifyError(response.status, null), error: message, durationMs, status: response.status };
    }
    const candidate = json.candidates?.[0];
    const blockReason = json.promptFeedback?.blockReason || candidate?.finishReason === 'SAFETY';
    if (blockReason) {
      return { ok: false, category: 'refused', error: `Blocked: ${json.promptFeedback?.blockReason || 'SAFETY'}`, durationMs, status: response.status };
    }
    const outputText = candidate?.content?.parts?.map((p) => p.text).join('').trim();
    if (!outputText) {
      return { ok: false, category: 'invalid-output', error: 'Empty candidate', durationMs, status: response.status, raw: json };
    }
    return {
      ok: true,
      outputText,
      durationMs,
      status: response.status,
      usage: {
        promptTokens: json.usageMetadata?.promptTokenCount ?? null,
        completionTokens: json.usageMetadata?.candidatesTokenCount ?? null,
        totalTokens: json.usageMetadata?.totalTokenCount ?? null,
      },
    };
  },
};

const PROVIDERS = [
  makeOpenAiCompatibleProvider({
    id: 'mistral',
    label: 'Mistral Small 4',
    providerSlug: 'mistral',
    chatPath: 'v1/chat/completions',
    apiKeyEnv: 'MISTRAL_API_KEY',
    model: 'mistral-small-latest',
  }),
  makeOpenAiCompatibleProvider({
    id: 'groq',
    label: 'Groq GPT-OSS 120B',
    providerSlug: 'groq',
    chatPath: 'chat/completions',
    apiKeyEnv: 'GROQ_API_KEY',
    model: 'openai/gpt-oss-120b',
  }),
  makeOpenAiCompatibleProvider({
    id: 'cerebras',
    label: 'Cerebras GPT-OSS 120B',
    providerSlug: 'cerebras',
    chatPath: 'chat/completions',
    apiKeyEnv: 'CEREBRAS_API_KEY',
    model: 'gpt-oss-120b',
  }),
  geminiProvider,
];

module.exports = { PROVIDERS };
