const SHARE_ID_PATTERN = /^[A-Za-z0-9]{8,12}$/;
const SOURCE_TOOLS = new Set(['card_studio', 'basic_editor', 'rich_editor', 'urdu_keyboard']);
const REPORT_REASONS = new Set(['spam', 'abuse', 'privacy', 'copyright', 'other']);
const MAX_TEXT_LENGTH = 8000;
const MAX_ATTRIBUTION_LENGTH = 240;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_IMAGE_SIDE = 4096;
const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const publishWindows = new Map();
const reportWindows = new Map();
let schemaReady = null;

const SHARE_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS share_artifacts (
      id TEXT PRIMARY KEY,
      source_tool TEXT NOT NULL,
      public_text TEXT NOT NULL,
      attribution TEXT,
      image_key TEXT NOT NULL,
      image_mime TEXT NOT NULL,
      image_width INTEGER NOT NULL,
      image_height INTEGER NOT NULL,
      preset TEXT,
      remix_payload_json TEXT,
      remix_mode TEXT NOT NULL DEFAULT 'text_only',
      origin_share_id TEXT,
      manage_token_hash TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      report_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      deleted_at TEXT,
      FOREIGN KEY (origin_share_id) REFERENCES share_artifacts(id)
  )`,
  'CREATE INDEX IF NOT EXISTS idx_share_artifacts_created_at ON share_artifacts(created_at)',
  'CREATE INDEX IF NOT EXISTS idx_share_artifacts_origin_share_id ON share_artifacts(origin_share_id)',
  'CREATE INDEX IF NOT EXISTS idx_share_artifacts_status ON share_artifacts(status)'
];

export function jsonResponse(status, payload, extraHeaders) {
  const headers = new Headers(extraHeaders || {});
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  headers.set('x-content-type-options', 'nosniff');
  return new Response(JSON.stringify(payload), { status, headers });
}

export function originAllowed(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === 'write-urdu.com' || host === 'www.write-urdu.com' || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.pages.dev');
  } catch (error) {
    return false;
  }
}

export function publicOrigin(request, env) {
  const configured = String(env.PUBLIC_SITE_ORIGIN || '').trim().replace(/\/$/, '');
  if (/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(configured)) return configured;
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.pages.dev')) return url.origin;
  return 'https://write-urdu.com';
}

export async function ensureShareSchema(db) {
  if (!schemaReady) {
    schemaReady = db.batch(SHARE_SCHEMA.map((sql) => db.prepare(sql))).catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

export function cleanShareId(value) {
  const id = String(value || '').trim();
  return SHARE_ID_PATTERN.test(id) ? id : null;
}

export function cleanSourceTool(value) {
  const source = String(value || '').trim();
  return SOURCE_TOOLS.has(source) ? source : null;
}

export function cleanReportReason(value) {
  const reason = String(value || '').trim();
  return REPORT_REASONS.has(reason) ? reason : null;
}

export function cleanPlainText(value, maxLength, required) {
  const text = String(value == null ? '' : value).replace(/\u0000/g, '').replace(/\r\n?/g, '\n').trim();
  const limit = Math.max(1, Number(maxLength) || MAX_TEXT_LENGTH);
  if ((required && !text) || text.length > limit) return null;
  return text;
}

export function cleanAttribution(value) {
  return cleanPlainText(value, MAX_ATTRIBUTION_LENGTH, false);
}

export function cleanPreset(value) {
  const preset = String(value || '').trim();
  if (!preset) return null;
  return /^[a-z0-9_-]{1,48}$/i.test(preset) ? preset : null;
}

function randomBase62(length) {
  const result = [];
  const bytes = new Uint8Array(length * 2);
  while (result.length < length) {
    crypto.getRandomValues(bytes);
    for (let index = 0; index < bytes.length && result.length < length; index += 1) {
      const value = bytes[index];
      if (value >= 248) continue;
      result.push(BASE62[value % BASE62.length]);
    }
  }
  return result.join('');
}

export async function createUniqueShareId(db) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const id = randomBase62(8);
    const exists = await db.prepare('SELECT 1 AS found FROM share_artifacts WHERE id = ?1').bind(id).first();
    if (!exists) return id;
  }
  throw new Error('share_id_generation_failed');
}

export function createManageToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let binary = '';
  bytes.forEach((value) => { binary += String.fromCharCode(value); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export async function hashManageToken(token) {
  const input = new TextEncoder().encode(String(token || ''));
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', input));
  return Array.from(digest).map((value) => value.toString(16).padStart(2, '0')).join('');
}

export async function tokenMatches(token, expectedHash) {
  if (!token || !expectedHash) return false;
  const actual = await hashManageToken(token);
  if (actual.length !== expectedHash.length) return false;
  let mismatch = 0;
  for (let index = 0; index < actual.length; index += 1) mismatch |= actual.charCodeAt(index) ^ expectedHash.charCodeAt(index);
  return mismatch === 0;
}

export function imageLimits() {
  return { maxBytes: MAX_IMAGE_BYTES, maxSide: MAX_IMAGE_SIDE };
}

export async function validatePng(file) {
  if (!file || typeof file.arrayBuffer !== 'function') return { ok: false, error: 'image_required' };
  if (String(file.type || '').toLowerCase() !== 'image/png') return { ok: false, error: 'image_type_not_allowed' };
  if (!Number(file.size) || Number(file.size) > MAX_IMAGE_BYTES) return { ok: false, error: 'image_too_large' };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length < 24) return { ok: false, error: 'invalid_png' };
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (signature.some((value, index) => bytes[index] !== value)) return { ok: false, error: 'invalid_png' };
  if (String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]) !== 'IHDR') return { ok: false, error: 'invalid_png' };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16, false);
  const height = view.getUint32(20, false);
  if (!width || !height || width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE) return { ok: false, error: 'invalid_image_dimensions' };
  return { ok: true, bytes, width, height, mime: 'image/png' };
}

export function objectKeyForShare(id, date) {
  const now = date || new Date();
  return `shares/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${id}.png`;
}

export async function getShare(db, id, includePrivate) {
  const shareId = cleanShareId(id);
  if (!shareId) return null;
  const row = await db.prepare(`SELECT id, source_tool, public_text, attribution, image_key, image_mime,
      image_width, image_height, preset, remix_payload_json, remix_mode, origin_share_id,
      manage_token_hash, status, report_count, created_at, deleted_at
      FROM share_artifacts WHERE id = ?1`).bind(shareId).first();
  if (!row) return null;
  if (includePrivate) return row;
  return {
    id: row.id,
    source_tool: row.source_tool,
    public_text: row.public_text,
    attribution: row.attribution || null,
    image_mime: row.image_mime,
    image_width: Number(row.image_width),
    image_height: Number(row.image_height),
    preset: row.preset || null,
    remix_mode: row.remix_mode || 'text_only',
    status: row.status,
    created_at: row.created_at
  };
}

export function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function excerpt(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  const limit = Math.max(40, Number(maxLength) || 180);
  if (text.length <= limit) return text;
  return text.slice(0, limit - 1).trimEnd() + '…';
}

function clientKey(request) {
  return String(request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
}

function allowInMemory(request, store, limit, windowMs) {
  const now = Date.now();
  const key = clientKey(request);
  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  if (store.size > 5000) {
    for (const [entryKey, value] of store.entries()) if (value.resetAt <= now) store.delete(entryKey);
  }
  return true;
}

export function allowPublish(request) {
  return allowInMemory(request, publishWindows, 10, 10 * 60 * 1000);
}

export function allowReport(request) {
  return allowInMemory(request, reportWindows, 30, 10 * 60 * 1000);
}

export function hasRequiredBindings(env) {
  return Boolean(env && env.METRICS_DB && env.CONTENT_STORE);
}