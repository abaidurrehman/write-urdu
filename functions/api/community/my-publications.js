import { getSession } from '../../lib/auth.mjs';
import { handleMyPublicationsList } from '../../lib/community-my-publications.mjs';

export function onRequest({ request, env }) {
  return handleMyPublicationsList(request, env, { getSession });
}
