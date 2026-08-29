import { communityPublicFeatureState, createPublicationRepository, HUB_PAGE_LIMIT } from '../../../lib/community-publications.mjs';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer'
    }
  });
}

export async function onRequestGet({ request, env }) {
  const state = communityPublicFeatureState(env);
  if (state === 'disabled') return json(404, { error: { code: 'community_public_not_enabled' } });
  if (state === 'unavailable') return json(503, { error: { code: 'community_public_unavailable' } });

  const url = new URL(request.url);
  let cursor = null;
  const cursorParam = String(url.searchParams.get('cursor') || '').trim();
  if (cursorParam) {
    const [publishedAt, id] = cursorParam.split('|');
    if (publishedAt && id) cursor = { publishedAt, id };
  }

  try {
    const repository = createPublicationRepository(env.METRICS_DB);
    const items = await repository.listPublished(cursor);
    const nextCursor = items.length === HUB_PAGE_LIMIT ? `${items[items.length - 1].publishedAt}|${items[items.length - 1].id}` : null;
    return json(200, { items, nextCursor });
  } catch {
    return json(503, { error: { code: 'community_public_unavailable' } });
  }
}

export function onRequest(context) {
  if (context.request.method === 'GET' || context.request.method === 'HEAD') return onRequestGet(context);
  return json(405, { error: { code: 'method_not_allowed' } });
}
