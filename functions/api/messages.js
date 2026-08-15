const MAX_BODY_BYTES = 16_384;
const MIN_COMPLETION_MS = 1_500;

export const TOPIC_LABELS = Object.freeze({
  contact: Object.freeze({
    general: 'General question',
    technical: 'Technical issue',
    transliteration: 'Transliteration or correction',
    privacy: 'Privacy or data request',
    accessibility: 'Accessibility issue',
    partnership: 'Educational use or partnership',
    other: 'Other enquiry'
  }),
  feedback: Object.freeze({
    typing: 'Roman Urdu typing',
    transliteration: 'Transliteration accuracy',
    editor: 'Rich Text Editor',
    keyboard: 'Urdu Keyboard',
    export: 'Copy or export',
    'card-studio': 'Card Studio and social makers',
    'stylish-name-art': 'Stylish Text or Name Art',
    'invoice-qr': 'Invoice or QR tools',
    mobile: 'Mobile experience',
    accessibility: 'Accessibility',
    feature: 'Feature idea',
    bug: 'Bug report',
    other: 'Other feedback'
  })
});

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer'
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });
}

function stringValue(value) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
    : '';
}

function validEmail(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateSubmission(payload, { now = Date.now() } = {}) {
  const type = stringValue(payload?.formType).toLowerCase();
  const name = stringValue(payload?.name);
  const email = stringValue(payload?.email).toLowerCase();
  const topic = stringValue(payload?.topic).toLowerCase();
  const subject = stringValue(payload?.subject);
  const message = stringValue(payload?.message);
  const rating = stringValue(payload?.rating);
  const token = stringValue(payload?.['cf-turnstile-response']);
  const website = stringValue(payload?.website);
  const startedAt = Number(payload?.startedAt);

  const spam = Boolean(website)
    || !Number.isFinite(startedAt)
    || startedAt > now + 60_000
    || now - startedAt < MIN_COMPLETION_MS;

  const errors = [];
  if (!Object.hasOwn(TOPIC_LABELS, type)) errors.push('Choose a valid form type.');
  if (!Object.hasOwn(TOPIC_LABELS[type] || {}, topic)) errors.push('Choose a valid topic.');
  if (type === 'contact' && (name.length < 2 || name.length > 80)) errors.push('Enter your name.');
  if (type === 'feedback' && name.length > 80) errors.push('Name is too long.');
  if (type === 'contact' && !validEmail(email)) errors.push('Enter a valid reply email.');
  if (type === 'feedback' && email && !validEmail(email)) errors.push('Enter a valid reply email or leave it blank.');
  if (type === 'contact' && (subject.length < 3 || subject.length > 120)) errors.push('Enter a subject between 3 and 120 characters.');
  if (message.length < 20 || message.length > 4_000) errors.push('Enter a message between 20 and 4,000 characters.');
  if (rating && !/^[1-5]$/.test(rating)) errors.push('Choose a rating from 1 to 5.');
  if (!token || token.length > 2_048) errors.push('Complete the spam check.');

  return {
    ok: errors.length === 0,
    spam,
    errors,
    value: { type, name, email, topic, subject, message, rating, token }
  };
}

export function buildEmailPayload(submission, submittedAt = new Date()) {
  const topicLabel = TOPIC_LABELS[submission.type][submission.topic];
  const formLabel = submission.type === 'feedback' ? 'Feedback' : 'Contact';
  const lines = [
    `Write Urdu ${formLabel.toLowerCase()} submission`,
    '',
    `Topic: ${topicLabel}`,
    `Name: ${submission.name || 'Not provided'}`,
    `Reply email: ${submission.email || 'Not provided'}`,
    `Rating: ${submission.rating ? `${submission.rating}/5` : 'Not provided'}`,
    `Submitted: ${submittedAt.toISOString()}`,
    '',
    submission.type === 'contact' ? `Subject: ${submission.subject}` : 'Feedback:',
    submission.message
  ];

  const emailPayload = {
    formType: submission.type,
    subject: `[Write Urdu ${formLabel}] ${topicLabel}`,
    text: lines.join('\n')
  };
  if (submission.email) emailPayload.replyTo = submission.email;
  return emailPayload;
}

async function verifyTurnstile({ token, action, request, secret, fetchImpl = fetch }) {
  const remoteIp = request.headers.get('CF-Connecting-IP') || '';
  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: remoteIp,
    idempotency_key: crypto.randomUUID()
  });
  const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body
  });
  if (!response.ok) return false;

  const result = await response.json();
  const expectedHostname = new URL(request.url).hostname;
  return result.success === true
    && result.action === action
    && (!result.hostname || result.hostname === expectedHostname);
}

async function sendEmail({ submission, env }) {
  const payload = buildEmailPayload(submission);
  const response = await env.FORM_MAILER.fetch('https://form-mailer.internal/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    console.error('The bound Write Urdu form mailer rejected a notification.', response.status);
    return false;
  }
  try {
    const result = await response.json();
    return result.ok === true;
  } catch {
    return false;
  }
}

function deliveryConfigured(env) {
  return Boolean(String(env?.TURNSTILE_SECRET_KEY || '').trim())
    && typeof env?.FORM_MAILER?.fetch === 'function';
}

function requestIsSameOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function onRequestPost({ request, env, fetchImpl = fetch }) {
  if (!requestIsSameOrigin(request)) return jsonResponse({ ok: false, message: 'This request could not be accepted.' }, 403);
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
    return jsonResponse({ ok: false, message: 'This request could not be accepted.' }, 415);
  }

  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (declaredLength > MAX_BODY_BYTES) return jsonResponse({ ok: false, message: 'The message is too large.' }, 413);

  let payload;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonResponse({ ok: false, message: 'The message is too large.' }, 413);
    }
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ ok: false, message: 'The submitted form was not valid.' }, 400);
  }

  const validation = validateSubmission(payload);
  if (validation.spam) return jsonResponse({ ok: true, message: 'Thank you—your message was received.' });
  if (!validation.ok) return jsonResponse({ ok: false, message: validation.errors[0] }, 400);
  if (!deliveryConfigured(env)) {
    return jsonResponse({ ok: false, message: 'The message service is being configured. Please use the email option for now.' }, 503);
  }

  let verified = false;
  try {
    verified = await verifyTurnstile({
      token: validation.value.token,
      action: validation.value.type,
      request,
      secret: String(env.TURNSTILE_SECRET_KEY).trim(),
      fetchImpl
    });
  } catch {
    return jsonResponse({ ok: false, message: 'Spam protection is temporarily unavailable. Please try again or use email.' }, 502);
  }
  if (!verified) return jsonResponse({ ok: false, message: 'Complete the spam check and try again.' }, 400);

  try {
    const sent = await sendEmail({ submission: validation.value, env });
    if (!sent) throw new Error('Email delivery failed.');
  } catch {
    return jsonResponse({ ok: false, message: 'Your message could not be delivered. Please try again later or use email.' }, 502);
  }

  return jsonResponse({
    ok: true,
    message: validation.value.type === 'feedback'
      ? 'Thank you—your feedback was sent.'
      : 'Thank you—your message was sent.'
  });
}

export function onRequest() {
  return jsonResponse({ ok: false, message: 'Method not allowed.' }, 405);
}
