import {
  allowPublish,
  cleanAttribution,
  cleanPlainText,
  cleanPreset,
  cleanShareId,
  cleanSourceTool,
  createManageToken,
  createUniqueShareId,
  ensureShareSchema,
  hasRequiredBindings,
  hashManageToken,
  jsonResponse,
  objectKeyForShare,
  originAllowed,
  publicOrigin,
  validatePng
} from '../_lib/share-artifacts.js';

const MAX_REQUEST_BYTES = 13 * 1024 * 1024;

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!originAllowed(request)) return jsonResponse(403, { ok: false, error: 'origin_not_allowed' });
  if (!hasRequiredBindings(env)) return jsonResponse(503, { ok: false, error: 'share_storage_unavailable' });
  if (!allowPublish(request)) return jsonResponse(429, { ok: false, error: 'publish_rate_limited' }, { 'retry-after': '600' });

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_REQUEST_BYTES) return jsonResponse(413, { ok: false, error: 'payload_too_large' });

  let form;
  try {
    form = await request.formData();
  } catch (error) {
    return jsonResponse(400, { ok: false, error: 'invalid_form_data' });
  }

  const sourceTool = cleanSourceTool(form.get('source_tool'));
  const publicText = cleanPlainText(form.get('public_text'), 8000, true);
  const attribution = cleanAttribution(form.get('attribution'));
  const preset = cleanPreset(form.get('preset'));
  const originShareId = form.get('origin_share_id') ? cleanShareId(form.get('origin_share_id')) : null;
  const image = form.get('image');

  if (!sourceTool) return jsonResponse(400, { ok: false, error: 'invalid_source_tool' });
  if (publicText === null) return jsonResponse(400, { ok: false, error: 'invalid_public_text' });
  if (form.get('attribution') && attribution === null) return jsonResponse(400, { ok: false, error: 'invalid_attribution' });
  if (form.get('preset') && !preset) return jsonResponse(400, { ok: false, error: 'invalid_preset' });
  if (form.get('origin_share_id') && !originShareId) return jsonResponse(400, { ok: false, error: 'invalid_origin_share' });

  const checkedImage = await validatePng(image);
  if (!checkedImage.ok) return jsonResponse(400, { ok: false, error: checkedImage.error });

  const db = env.METRICS_DB;
  await ensureShareSchema(db);

  if (originShareId) {
    const parent = await db.prepare("SELECT id FROM share_artifacts WHERE id = ?1 AND status = 'active'").bind(originShareId).first();
    if (!parent) return jsonResponse(400, { ok: false, error: 'origin_share_unavailable' });
  }

  let id;
  let imageKey;
  try {
    id = await createUniqueShareId(db);
    imageKey = objectKeyForShare(id);
    const manageToken = createManageToken();
    const manageTokenHash = await hashManageToken(manageToken);
    const createdAt = new Date().toISOString();

    await env.CONTENT_STORE.put(imageKey, checkedImage.bytes, {
      httpMetadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=300'
      },
      customMetadata: { shareId: id, namespace: 'shares' }
    });

    try {
      await db.prepare(`INSERT INTO share_artifacts (
          id, source_tool, public_text, attribution, image_key, image_mime,
          image_width, image_height, preset, remix_payload_json, remix_mode,
          origin_share_id, manage_token_hash, status, report_count, created_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, 'image/png', ?6, ?7, ?8, NULL, 'text_only', ?9, ?10, 'active', 0, ?11)`)
        .bind(id, sourceTool, publicText, attribution || null, imageKey, checkedImage.width, checkedImage.height, preset || null, originShareId || null, manageTokenHash, createdAt)
        .run();
    } catch (error) {
      await env.CONTENT_STORE.delete(imageKey).catch(() => {});
      throw error;
    }

    const origin = publicOrigin(request, env);
    return jsonResponse(201, {
      ok: true,
      id,
      url: `${origin}/s/${id}`,
      manageToken
    });
  } catch (error) {
    console.error('share publish failed', error);
    if (imageKey) await env.CONTENT_STORE.delete(imageKey).catch(() => {});
    return jsonResponse(503, { ok: false, error: 'publish_failed' });
  }
}

export function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return jsonResponse(405, { ok: false, error: 'method_not_allowed' }, { allow: 'POST' });
}
