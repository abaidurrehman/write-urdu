import { getSession } from '../../../../lib/auth.mjs';
import { handleSubmissionRevise } from '../../../../lib/community-my-publications.mjs';

export function onRequest({ request, env, params }) {
  return handleSubmissionRevise(request, env, params?.id, { getSession });
}
