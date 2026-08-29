import { handleModerationApprove } from '../../../../../lib/community-moderation.mjs';

export function onRequest({ request, env, params }) {
  return handleModerationApprove(request, env, params?.id);
}
