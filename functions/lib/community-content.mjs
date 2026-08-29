const MAX_TITLE_CHARS = 180;
const MAX_PUBLIC_AUTHOR_CHARS = 80;
const MIN_PLAIN_TEXT_CHARS = 80;
const MAX_PLAIN_TEXT_UTF8_BYTES = 500 * 1024;
const ALLOWED_CONTENT_FORMATS = Object.freeze(['plain']);
const NULL_BYTE_PATTERN = new RegExp(String.fromCharCode(0), 'g');

const encoder = new TextEncoder();

export const COMMUNITY_CONTENT_LIMITS = Object.freeze({
  maxTitleChars: MAX_TITLE_CHARS,
  maxPublicAuthorChars: MAX_PUBLIC_AUTHOR_CHARS,
  minPlainTextChars: MIN_PLAIN_TEXT_CHARS,
  maxPlainTextUtf8Bytes: MAX_PLAIN_TEXT_UTF8_BYTES,
  allowedContentFormats: ALLOWED_CONTENT_FORMATS
});

function byteLength(value) {
  return encoder.encode(typeof value === 'string' ? value : '').byteLength;
}

function charLength(value) {
  return Array.from(typeof value === 'string' ? value : '').length;
}

function normalizePlainText(value) {
  return typeof value === 'string'
    ? value.replace(NULL_BYTE_PATTERN, '').replace(/\r\n?/g, '\n').trim()
    : '';
}

export function validateContentFormat(value) {
  return typeof value === 'string' && ALLOWED_CONTENT_FORMATS.includes(value)
    ? { value }
    : { error: 'community_content_format_invalid' };
}

export function validateTitle(value) {
  if (typeof value !== 'string') return { error: 'community_title_invalid' };
  const title = value.trim();
  if (!title) return { error: 'community_title_invalid' };
  if (charLength(title) > MAX_TITLE_CHARS) return { error: 'community_title_too_long' };
  return { value: title };
}

export function validatePublicAuthorName(value) {
  if (typeof value !== 'string') return { error: 'community_public_author_name_invalid' };
  const name = value.trim();
  if (!name) return { error: 'community_public_author_name_invalid' };
  if (charLength(name) > MAX_PUBLIC_AUTHOR_CHARS) return { error: 'community_public_author_name_too_long' };
  return { value: name };
}

export function validatePlainText(value) {
  const text = normalizePlainText(value);
  if (charLength(text) < MIN_PLAIN_TEXT_CHARS) return { error: 'community_plain_text_too_short' };
  if (byteLength(text) > MAX_PLAIN_TEXT_UTF8_BYTES) return { error: 'community_plain_text_too_large' };
  return { value: text };
}

export async function contentSignature({ title, publicAuthorName, plainText, primaryCategory, tags }) {
  const canonical = JSON.stringify({
    title,
    publicAuthorName,
    plainText,
    primaryCategory,
    tags: Array.isArray(tags) ? [...tags].sort() : []
  });
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(canonical));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export const COMMUNITY_CONTENT_INTERNALS = Object.freeze({ byteLength, charLength });
