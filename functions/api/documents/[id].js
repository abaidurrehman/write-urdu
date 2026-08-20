import { getSession } from '../../lib/auth.mjs';
import { handleDocumentItem } from '../../lib/documents.mjs';

export function onRequest({ request, env, params }) {
  return handleDocumentItem(request, env, params?.id, { getSession });
}
