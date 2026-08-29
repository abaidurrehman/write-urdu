import { handleModerationDetail } from '../../../../lib/community-moderation.mjs';

export function onRequest({ request, env, params }) {
  return handleModerationDetail(request, env, params?.id);
}
