import { handleModerationReject } from '../../../../../lib/community-moderation.mjs';

export function onRequest({ request, env, params }) {
  return handleModerationReject(request, env, params?.id);
}
