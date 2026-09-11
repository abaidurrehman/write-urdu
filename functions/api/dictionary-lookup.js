import { handleDictionaryLookup } from '../lib/dictionary/handler.mjs';

export async function onRequestPost(context) {
  return handleDictionaryLookup(context.request, context.env);
}
