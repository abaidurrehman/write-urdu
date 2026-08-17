import { cleanShareId, ensureShareSchema, getShare } from '../_lib/share-artifacts.js';

function notFound() {
  return new Response('Not Found', {
    status: 404,
    headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
  });
}

async function serve(context, headOnly) {
  const { env } = context;
  if (!env.METRICS_DB || !env.CONTENT_STORE) return new Response('Share storage unavailable', { status: 503, headers: { 'cache-control': 'no-store' } });
  const id = cleanShareId(context.params && context.params.id);
  if (!id) return notFound();
  await ensureShareSchema(env.METRICS_DB);
  const share = await getShare(env.METRICS_DB, id, true);
  if (!share || share.status !== 'active' || !String(share.image_key || '').startsWith('shares/')) return notFound();

  const object = headOnly ? await env.CONTENT_STORE.head(share.image_key) : await env.CONTENT_STORE.get(share.image_key);
  if (!object) return notFound();
  const headers = new Headers();
  headers.set('content-type', share.image_mime || 'image/png');
  headers.set('cache-control', 'public, max-age=300, stale-while-revalidate=60');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('content-disposition', `inline; filename="write-urdu-${id}.png"`);
  headers.set('cross-origin-resource-policy', 'same-site');
  if (object.size) headers.set('content-length', String(object.size));
  if (object.httpEtag) headers.set('etag', object.httpEtag);
  return new Response(headOnly ? null : object.body, { status: 200, headers });
}

export function onRequestGet(context) {
  return serve(context, false);
}

export function onRequestHead(context) {
  return serve(context, true);
}

export function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  if (context.request.method === 'HEAD') return onRequestHead(context);
  return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
}
