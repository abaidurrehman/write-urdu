import { handleAuthRequest } from '../../lib/auth.mjs';

export async function onRequest({ request, env }) {
  return handleAuthRequest(request, env);
}
