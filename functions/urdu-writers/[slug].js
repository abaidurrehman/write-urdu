import {
  communityPublicFeatureState,
  createPublicationRepository,
  publicOrigin,
  cleanSlug,
  renderDetailPage,
  renderUnavailablePage
} from '../lib/community-publications.mjs';

export async function onRequestGet({ request, env, params }) {
  const state = communityPublicFeatureState(env);
  if (state === 'disabled') return renderUnavailablePage(404, 'Urdu Writers is not available', 'This page is not available right now.', 'noindex,nofollow');
  if (state === 'unavailable') return renderUnavailablePage(503, 'Urdu Writers temporarily unavailable', 'Please try again later.', 'noindex,nofollow');

  const slug = cleanSlug(params && params.slug);
  if (!slug) return renderUnavailablePage(404, 'Writing not found', 'This Urdu Writers page is not available.', 'noindex,nofollow');

  const repository = createPublicationRepository(env.METRICS_DB);
  const publication = await repository.getPublishedBySlug(slug);
  if (!publication) {
    const status = await repository.slugStatus(slug);
    if (status === 'unpublished') {
      return renderUnavailablePage(410, 'This writing is no longer available', 'The writer or a moderator removed this publication.', 'noindex,nofollow');
    }
    return renderUnavailablePage(404, 'Writing not found', 'This Urdu Writers page is not available.', 'noindex,nofollow');
  }

  const moreWriting = await repository.moreWriting(publication.primaryCategory, publication.id);
  return renderDetailPage({ origin: publicOrigin(request, env), publication, moreWriting, robots: 'index,follow' });
}

export function onRequest(context) {
  if (context.request.method === 'GET' || context.request.method === 'HEAD') return onRequestGet(context);
  return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
}
