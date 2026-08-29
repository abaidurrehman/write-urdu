import {
  communityPublicFeatureState,
  createPublicationRepository,
  publicOrigin,
  validPrimaryCategory,
  renderCategoryPage,
  renderUnavailablePage,
  HUB_PAGE_LIMIT
} from '../../lib/community-publications.mjs';

export async function onRequestGet({ request, env, params }) {
  const state = communityPublicFeatureState(env);
  if (state === 'disabled') return renderUnavailablePage(404, 'Urdu Writers is not available', 'This page is not available right now.', 'noindex,nofollow');
  if (state === 'unavailable') return renderUnavailablePage(503, 'Urdu Writers temporarily unavailable', 'Please try again later.', 'noindex,nofollow');

  const category = String((params && params.category) || '').trim().toLowerCase();
  if (!validPrimaryCategory(category)) {
    return renderUnavailablePage(404, 'Category not found', 'This Urdu Writers category is not available.', 'noindex,nofollow');
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

  // Category indexing threshold is finalized in Slice F; serve a conservatively
  // noindexed functional page until that corpus-size decision is made.
  return renderCategoryPage({ origin: publicOrigin(request, env), category, items, nextCursor, robots: 'noindex,follow' });
}

export function onRequest(context) {
  if (context.request.method === 'GET' || context.request.method === 'HEAD') return onRequestGet(context);
  return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
}
