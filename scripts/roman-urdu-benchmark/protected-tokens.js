'use strict';

// B3 experiment only. These rules are intentionally narrow and structural.
// They do not attempt to identify every English word because Roman Urdu itself
// is written with Latin letters.

const TOKEN_RE = /(https?:\/\/[^\s<>"']+)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|(@[A-Za-z0-9_]+)|(\b[A-Z]{2,6}\b)|(\b(?:[a-z][A-Za-z]*[A-Z][A-Za-z]*|[A-Z][A-Za-z]*[A-Z][A-Za-z]*)\b)|(\b\d+(?:[-\/:.]\d+)*\b)/g;

function tokenType(match) {
  if (match[1]) return 'url';
  if (match[2]) return 'email';
  if (match[3]) return 'handle';
  if (match[4]) return 'acronym';
  if (match[5]) return 'mixed_case';
  if (match[6]) return 'numeric_shape';
  return 'unknown';
}

function splitProtectedTokens(value) {
  const input = String(value == null ? '' : value);
  const parts = [];
  let cursor = 0;
  TOKEN_RE.lastIndex = 0;
  let match;

  while ((match = TOKEN_RE.exec(input))) {
    if (match.index > cursor) parts.push({ protected: false, value: input.slice(cursor, match.index) });
    parts.push({ protected: true, type: tokenType(match), value: match[0] });
    cursor = match.index + match[0].length;
  }

  if (cursor < input.length) parts.push({ protected: false, value: input.slice(cursor) });
  if (!parts.length) parts.push({ protected: false, value: input });
  return parts;
}

function hasProtectedToken(value) {
  return splitProtectedTokens(value).some(part => part.protected);
}

function summarizeProtected(parts) {
  const summary = {};
  for (const part of parts) {
    if (!part.protected) continue;
    summary[part.type] = (summary[part.type] || 0) + 1;
  }
  return summary;
}

function edgeWhitespace(value) {
  const input = String(value == null ? '' : value);
  const leading = (input.match(/^\s+/) || [''])[0];
  const trailing = (input.match(/\s+$/) || [''])[0];
  const end = trailing ? input.length - trailing.length : input.length;
  return { leading, trailing, core: input.slice(leading.length, end) };
}

module.exports = { splitProtectedTokens, hasProtectedToken, summarizeProtected, edgeWhitespace };
