import { getSession } from '../../lib/auth.mjs';
import { handleSubmissionsCollection } from '../../lib/community-submissions.mjs';

export function onRequest({ request, env }) {
  return handleSubmissionsCollection(request, env, { getSession });
}
