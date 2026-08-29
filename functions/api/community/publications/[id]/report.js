import {
  communityPublicFeatureState,
  createPublicationRepository,
  cleanPublicationId,
  cleanReportReason,
  allowReport,
  originAllowed
} from '../../../../lib/community-publications.mjs';

function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      ...extraHeaders
    }
  });
}

export async function onRequestPost({ request, env, params }) {
  const state = communityPublicFeatureState(env);
  if (state === 'disabled') return json(404, { error: { code: 'community_public_not_enabled' } });
  if (state === 'unavailable') return json(503, { error: { code: 'community_public_unavailable' } });

  if (!originAllowed(request)) return json(403, { error: { code: 'origin_not_allowed' } });
  if (!allowReport(request)) return json(429, { error: { code: 'community_report_rate_limited' } }, { 'retry-after': '600' });

  const id = cleanPublicationId(params && params.id);
  if (!id) return json(404, { error: { code: 'community_publication_not_found' } });

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: { code: 'invalid_json' } });
  }
  const reason = cleanReportReason(payload && payload.reason);
  if (!reason) return json(400, { error: { code: 'community_report_reason_invalid' } });

  try {
    const repository = createPublicationRepository(env.METRICS_DB);
    const created = await repository.createReport(id, reason, new Date().toISOString(), crypto.randomUUID());
    if (!created) return json(404, { error: { code: 'community_publication_not_found' } });
    return json(202, { accepted: true, reason });
  } catch {
    return json(503, { error: { code: 'community_public_unavailable' } });
  }
}

export function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return json(405, { error: { code: 'method_not_allowed' } }, { allow: 'POST' });
}
