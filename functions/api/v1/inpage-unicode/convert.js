import { handleInPageUnicodeConvert, handleInPageUnicodeOptions } from '../../../lib/inpage-unicode-api.mjs';

export function onRequestPost({ request, env }) {
  return handleInPageUnicodeConvert(request, env);
}

export function onRequestOptions() {
  return handleInPageUnicodeOptions();
}
