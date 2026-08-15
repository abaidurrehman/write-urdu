const MAX_BODY_BYTES = 12_000;

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });
}

function validEmail(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateMailRequest(payload) {
  const formType = typeof payload?.formType === 'string' ? payload.formType.trim() : '';
  const subject = typeof payload?.subject === 'string' ? payload.subject.trim() : '';
  const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
  const replyTo = typeof payload?.replyTo === 'string' ? payload.replyTo.trim().toLowerCase() : '';
  const subjectPrefix = formType === 'feedback'
    ? '[Write Urdu Feedback] '
    : formType === 'contact'
      ? '[Write Urdu Contact] '
      : '';

  const ok = Boolean(subjectPrefix)
    && subject.startsWith(subjectPrefix)
    && subject.length <= 180
    && !/[\r\n]/.test(subject)
    && text.length >= 20
    && text.length <= 6_000
    && !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)
    && (!replyTo || validEmail(replyTo));

  return { ok, value: { formType, subject, text, replyTo } };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/send') {
      return jsonResponse({ ok: false, message: 'Not found.' }, 404);
    }
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
      return jsonResponse({ ok: false, message: 'Invalid request.' }, 415);
    }

    const declaredLength = Number(request.headers.get('Content-Length') || 0);
    if (declaredLength > MAX_BODY_BYTES) return jsonResponse({ ok: false, message: 'Request is too large.' }, 413);

    let payload;
    try {
      const rawBody = await request.text();
      if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
        return jsonResponse({ ok: false, message: 'Request is too large.' }, 413);
      }
      payload = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ ok: false, message: 'Invalid request.' }, 400);
    }

    const validation = validateMailRequest(payload);
    const from = String(env?.FORM_FROM_EMAIL || '').trim().toLowerCase();
    const to = String(env?.FORM_TO_EMAIL || '').trim().toLowerCase();
    if (!validation.ok) return jsonResponse({ ok: false, message: 'Invalid notification.' }, 400);
    if (!validEmail(from) || !validEmail(to) || typeof env?.FORM_EMAIL?.send !== 'function') {
      return jsonResponse({ ok: false, message: 'Mailer is not configured.' }, 503);
    }

    const { formType, subject, text, replyTo } = validation.value;
    try {
      const result = await env.FORM_EMAIL.send({
        to,
        from,
        subject,
        text,
        ...(replyTo ? { replyTo } : {}),
        headers: {
          'X-WriteUrdu-Form': formType,
          'Auto-Submitted': 'auto-generated'
        }
      });
      return jsonResponse({ ok: true, messageId: result.messageId });
    } catch (error) {
      console.error('Write Urdu form notification delivery failed.', error?.code || error?.message || 'unknown error');
      return jsonResponse({ ok: false, message: 'Delivery failed.' }, 502);
    }
  }
};
