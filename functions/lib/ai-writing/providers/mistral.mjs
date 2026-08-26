// WU-AI-001B — Mistral provider adapter (spec §18). The application must not know whether the
// request is fulfilled by Mistral, Groq or Cerebras beyond this module's shape.
// Calls through the write-urdu-ai Cloudflare AI Gateway with payload logging and caching
// disabled for user text (spec §11.2/§11.3 — release blocker).

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

export const mistralProvider = {
  id: 'mistral',
  modelAlias: 'mistral-small-latest',
  async transform({ messages, maxOutputTokens, timeoutMs, requestId }, env) {
    const apiKey = env.MISTRAL_API_KEY;
    if (!apiKey || !env.CF_ACCOUNT_ID || !env.CF_AIG_GATEWAY) {
      return { ok: false, code: 'provider-unavailable', message: 'Provider is not configured.' };
    }

    const url = `https://gateway.ai.cloudflare.com/v1/${env.CF_ACCOUNT_ID}/${env.CF_AIG_GATEWAY}/mistral/v1/chat/completions`;
    const headers = {
      'content-type': 'application/json',
      'cf-aig-collect-log-payload': 'false',
      'cf-aig-skip-cache': 'true',
      authorization: `Bearer ${apiKey}`
    };
    if (env.CF_AIG_TOKEN) headers['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const started = Date.now();
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers,
        body: JSON.stringify({
          model: mistralProvider.modelAlias,
          temperature: 0.2,
          max_tokens: maxOutputTokens,
          messages
        })
      });
    } catch (err) {
      return { ok: false, code: classifyError(null, err), message: 'Provider request failed.', durationMs: Date.now() - started, requestId };
    } finally {
      clearTimeout(timer);
    }

    const durationMs = Date.now() - started;
    let json;
    try {
      json = await response.json();
    } catch {
      return { ok: false, code: 'invalid-output', message: 'Provider returned a malformed response.', durationMs, requestId };
    }
    if (!response.ok) {
      return { ok: false, code: classifyError(response.status, null), message: 'Provider request failed.', durationMs, requestId };
    }

    const outputText = json.choices?.[0]?.message?.content?.trim();
    if (!outputText) {
      return { ok: false, code: 'invalid-output', message: 'Provider returned an empty result.', durationMs, requestId };
    }

    return {
      ok: true,
      outputText,
      durationMs,
      requestId,
      inputTokens: json.usage?.prompt_tokens,
      outputTokens: json.usage?.completion_tokens
    };
  }
};
