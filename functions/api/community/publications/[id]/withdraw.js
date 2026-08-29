import { getSession } from '../../../../lib/auth.mjs';
import { handlePublicationWithdraw } from '../../../../lib/community-my-publications.mjs';

export function onRequest({ request, env, params }) {
  return handlePublicationWithdraw(request, env, params?.id, { getSession });
}
