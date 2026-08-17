import {
  allowReport,
  cleanReportReason,
  cleanShareId,
  ensureShareSchema,
  jsonResponse,
  originAllowed
} from '../../../_lib/share-artifacts.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!originAllowed(request)) return jsonResponse(403, { ok: false, error: 'origin_not_allowed' });
  if (!env.METRICS_DB) return jsonResponse(503, { ok: false, error: 'metrics_db_unavailable' });
  if (!allowReport(request)) return jsonResponse(429, { ok: false, error: 'report_rate_limited' }, { 'retry-after': '600' });

  const id = cleanShareId(context.params && context.params.id);
  if (!id) return jsonResponse(404, { ok: false, error: 'share_not_found' });

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return jsonResponse(400, { ok: false, error: 'invalid_json' });
  }
  const reason = cleanReportReason(body && body.reason);
  if (!reason) return jsonResponse(400, { ok: false, error: 'invalid_report_reason' });

  const db = env.METRICS_DB;
  await ensureShareSchema(db);
  const active = await db.prepare("SELECT id FROM share_artifacts WHERE id = ?1 AND status = 'active'").bind(id).first();
  if (!active) return jsonResponse(404, { ok: false, error: 'share_not_found' });

  await db.prepare('UPDATE share_artifacts SET report_count = MIN(report_count + 1, 1000) WHERE id = ?1').bind(id).run();
  return jsonResponse(202, { ok: true, accepted: true, reason });
}

export function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return jsonResponse(405, { ok: false, error: 'method_not_allowed' }, { allow: 'POST' });
}
