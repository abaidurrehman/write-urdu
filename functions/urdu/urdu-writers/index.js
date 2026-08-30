import {
  communityPublicFeatureState,
  createPublicationRepository,
  publicOrigin,
  renderHubPage,
  renderUnavailablePage,
  HUB_PAGE_LIMIT
} from '../../lib/community-publications.mjs';

export async function onRequestGet({ request, env }) {
  const state = communityPublicFeatureState(env);
  if (state === 'disabled') return renderUnavailablePage(404, 'disabled', 'noindex,nofollow', 'ur');
  if (state === 'unavailable') return renderUnavailablePage(503, 'unavailable', 'noindex,nofollow', 'ur');

  const url = new URL(request.url);
  let cursor = null;
  const cursorParam = String(url.searchParams.get('cursor') || '').trim();
  if (cursorParam) {
    const [publishedAt, id] = cursorParam.split('|');
    if (publishedAt && id) cursor = { publishedAt, id };
  }

  const repository = createPublicationRepository(env.METRICS_DB);
  const items = await repository.listPublished(cursor);
  const nextCursor = items.length === HUB_PAGE_LIMIT ? `${items[items.length - 1].publishedAt}|${items[items.length - 1].id}` : null;

  return renderHubPage({ origin: publicOrigin(request, env), items, nextCursor, robots: 'index,follow', locale: 'ur' });
}

export function onRequest(context) {
  if (context.request.method === 'GET' || context.request.method === 'HEAD') return onRequestGet(context);
  return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
}
