import { getSession } from '../../../lib/auth.mjs';
import { handleSubmissionItem } from '../../../lib/community-submissions.mjs';

export function onRequest({ request, env, params }) {
  return handleSubmissionItem(request, env, params?.id, { getSession });
}
