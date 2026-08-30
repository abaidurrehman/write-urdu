import {
  communityPublicFeatureState,
  createPublicationRepository,
  publicOrigin,
  validPrimaryCategory,
  renderCategoryPage,
  renderUnavailablePage,
  HUB_PAGE_LIMIT,
  CATEGORY_INDEX_THRESHOLD
} from '../../../lib/community-publications.mjs';

export async function onRequestGet({ request, env, params }) {
  const state = communityPublicFeatureState(env);
  if (state === 'disabled') return renderUnavailablePage(404, 'disabled', 'noindex,nofollow', 'ur');
  if (state === 'unavailable') return renderUnavailablePage(503, 'unavailable', 'noindex,nofollow', 'ur');

  const category = String((params && params.category) || '').trim().toLowerCase();
  if (!validPrimaryCategory(category)) {
    return renderUnavailablePage(404, 'category_not_found', 'noindex,nofollow', 'ur');
  }

  const url = new URL(request.url);
  let cursor = null;
  const cursorParam = String(url.searchParams.get('cursor') || '').trim();
  if (cursorParam) {
    const [publishedAt, id] = cursorParam.split('|');
    if (publishedAt && id) cursor = { publishedAt, id };
  }

  const repository = createPublicationRepository(env.METRICS_DB);
  const items = await repository.listPublishedByCategory(category, cursor);
  const nextCursor = items.length === HUB_PAGE_LIMIT ? `${items[items.length - 1].publishedAt}|${items[items.length - 1].id}` : null;

  const total = await repository.countPublishedByCategory(category);
  const robots = total >= CATEGORY_INDEX_THRESHOLD ? 'index,follow' : 'noindex,follow';
  return renderCategoryPage({ origin: publicOrigin(request, env), category, items, nextCursor, robots, locale: 'ur' });
}

export function onRequest(context) {
  if (context.request.method === 'GET' || context.request.method === 'HEAD') return onRequestGet(context);
  return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
}
