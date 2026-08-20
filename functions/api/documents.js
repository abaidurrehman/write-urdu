import { getSession } from '../lib/auth.mjs';
import { handleDocumentsCollection } from '../lib/documents.mjs';

export function onRequest({ request, env }) {
  return handleDocumentsCollection(request, env, { getSession });
}
