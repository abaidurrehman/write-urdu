import { handlePublicationUnpublish } from '../../../../../lib/community-moderation.mjs';

export function onRequest({ request, env, params }) {
  return handlePublicationUnpublish(request, env, params?.id);
}
