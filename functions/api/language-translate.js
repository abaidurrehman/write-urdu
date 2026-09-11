// WU-INPUT-001B — shared semantic Urdu↔English translation endpoint.

import { handleLanguageTranslate } from '../lib/input-translation/handler.mjs';

export async function onRequestPost(context) {
  return handleLanguageTranslate(context.request, context.env);
}
