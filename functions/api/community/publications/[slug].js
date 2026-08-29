import { communityPublicFeatureState, createPublicationRepository, cleanSlug } from '../../../lib/community-publications.mjs';

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

export async function onRequestGet({ env, params }) {
  const state = communityPublicFeatureState(env);
  if (state === 'disabled') return json(404, { error: { code: 'community_public_not_enabled' } });
  if (state === 'unavailable') return json(503, { error: { code: 'community_public_unavailable' } });

  const slug = cleanSlug(params && params.slug);
  if (!slug) return json(404, { error: { code: 'community_publication_not_found' } });

  try {
    const repository = createPublicationRepository(env.METRICS_DB);
    const publication = await repository.getPublishedBySlug(slug);
    if (!publication) return json(404, { error: { code: 'community_publication_not_found' } });
    return json(200, { publication });
  } catch {
    return json(503, { error: { code: 'community_public_unavailable' } });
  }
}

export function onRequest(context) {
  if (context.request.method === 'GET' || context.request.method === 'HEAD') return onRequestGet(context);
  return json(405, { error: { code: 'method_not_allowed' } });
}
