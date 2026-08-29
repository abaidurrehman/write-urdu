import { handleModerationQueue } from '../../../../lib/community-moderation.mjs';

export function onRequest({ request, env }) {
  return handleModerationQueue(request, env);
}
