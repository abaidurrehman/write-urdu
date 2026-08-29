import { handleCommunityPulse } from '../../../lib/community-moderation.mjs';

export function onRequest({ request, env }) {
  return handleCommunityPulse(request, env);
}
