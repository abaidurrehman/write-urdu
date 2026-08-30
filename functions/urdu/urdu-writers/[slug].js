import {
  communityPublicFeatureState,
  createPublicationRepository,
  publicOrigin,
  cleanSlug,
  renderDetailPage,
  renderUnavailablePage
} from '../../lib/community-publications.mjs';

export async function onRequestGet({ request, env, params }) {
  const state = communityPublicFeatureState(env);
  if (state === 'disabled') return renderUnavailablePage(404, 'disabled', 'noindex,nofollow', 'ur');
  if (state === 'unavailable') return renderUnavailablePage(503, 'unavailable', 'noindex,nofollow', 'ur');

  const slug = cleanSlug(params && params.slug);
  if (!slug) return renderUnavailablePage(404, 'writing_not_found', 'noindex,nofollow', 'ur');

  const repository = createPublicationRepository(env.METRICS_DB);
  const publication = await repository.getPublishedBySlug(slug);
  if (!publication) {
    const status = await repository.slugStatus(slug);
    if (status === 'unpublished') {
      return renderUnavailablePage(410, 'writing_removed', 'noindex,nofollow', 'ur');
    }
    return renderUnavailablePage(404, 'writing_not_found', 'noindex,nofollow', 'ur');
  }

  const moreWriting = await repository.moreWriting(publication.primaryCategory, publication.id);
  return renderDetailPage({ origin: publicOrigin(request, env), publication, moreWriting, robots: 'index,follow', locale: 'ur' });
}

export function onRequest(context) {
  if (context.request.method === 'GET' || context.request.method === 'HEAD') return onRequestGet(context);
  return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
}
