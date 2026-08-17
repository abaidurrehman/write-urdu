import {
  cleanShareId,
  ensureShareSchema,
  getShare,
  hasRequiredBindings,
  jsonResponse,
  originAllowed,
  publicOrigin,
  tokenMatches
} from '../../_lib/share-artifacts.js';

function routeId(context) {
  return cleanShareId(context.params && context.params.id);
}

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!env.METRICS_DB) return jsonResponse(503, { ok: false, error: 'share_storage_unavailable' });
  const id = routeId(context);
  if (!id) return jsonResponse(404, { ok: false, error: 'share_not_found' });
  await ensureShareSchema(env.METRICS_DB);
  const share = await getShare(env.METRICS_DB, id, false);
  if (!share || share.status !== 'active') return jsonResponse(404, { ok: false, error: 'share_not_found' });
  const origin = publicOrigin(request, env);
  delete share.status;
  return jsonResponse(200, {
    ok: true,
    share: Object.assign({}, share, {
      url: `${origin}/s/${id}`,
      image_url: `${origin}/share-media/${id}`
    })
  });
}

export async function onRequestDelete(context) {
  const { env, request } = context;
  if (!originAllowed(request)) return jsonResponse(403, { ok: false, error: 'origin_not_allowed' });
  if (!hasRequiredBindings(env)) return jsonResponse(503, { ok: false, error: 'share_storage_unavailable' });
  const id = routeId(context);
  if (!id) return jsonResponse(404, { ok: false, error: 'share_not_found' });
  const token = String(request.headers.get('x-writeurdu-manage-token') || '').trim();
  if (!token || token.length > 128) return jsonResponse(401, { ok: false, error: 'management_token_required' });

  const db = env.METRICS_DB;
  await ensureShareSchema(db);
  const share = await getShare(db, id, true);
  if (!share || share.status !== 'active') return jsonResponse(404, { ok: false, error: 'share_not_found' });
  if (!(await tokenMatches(token, share.manage_token_hash))) return jsonResponse(403, { ok: false, error: 'management_token_invalid' });

  await db.prepare("UPDATE share_artifacts SET status = 'deleted', deleted_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?1 AND status = 'active'")
    .bind(id).run();
  try {
    await env.CONTENT_STORE.delete(share.image_key);
  } catch (error) {
    console.error('share media cleanup failed', error);
  }
  return jsonResponse(200, { ok: true, deleted: true });
}

export function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  if (context.request.method === 'DELETE') return onRequestDelete(context);
  return jsonResponse(405, { ok: false, error: 'method_not_allowed' }, { allow: 'GET, DELETE' });
}
