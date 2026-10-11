// Audit harness: serves the repo statically and runs the REAL Cloudflare Pages
// share functions (functions/api/shares*, functions/s/[id], functions/share-media/[id])
// against a node:sqlite D1 shim and an in-memory R2 shim. No app code is modified.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { pathToFileURL, fileURLToPath } from 'node:url';

// Repository root: docs/audits/<audit>/evidence/harness -> five levels up.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');
const port = Number(process.env.PORT || 8790);
const failShares = process.env.FAIL_SHARES === '1';
const sqlite = new DatabaseSync(':memory:');
const log = [];

function stmt(sql) {
  const s = { sql, args: [] };
  s.bind = (...args) => { s.args = args; return s; };
  const conv = (sql) => sql.replace(/\?(\d+)/g, '?');
  s.first = async () => sqlite.prepare(conv(sql)).get(...s.args) || null;
  s.all = async () => ({ results: sqlite.prepare(conv(sql)).all(...s.args) });
  s.run = async () => { const r = sqlite.prepare(conv(sql)).run(...s.args); return { success: true, meta: r }; };
  return s;
}
const D1 = { prepare: stmt, batch: async (list) => { const out = []; for (const s of list) out.push(await s.run()); return out; } };
const r2 = new Map();
const R2 = {
  put: async (k, bytes, opts) => { r2.set(k, { bytes: Buffer.from(bytes), opts }); },
  get: async (k) => { const v = r2.get(k); return v ? { body: v.bytes, size: v.bytes.length, httpEtag: '"x"' } : null; },
  head: async (k) => { const v = r2.get(k); return v ? { size: v.bytes.length, httpEtag: '"x"' } : null; },
  delete: async (k) => { r2.delete(k); }
};
const env = failShares ? {} : { METRICS_DB: D1, CONTENT_STORE: R2 };

const routes = [
  [/^\/api\/shares$/, 'functions/api/shares.js', () => ({})],
  [/^\/api\/shares\/([A-Za-z0-9]+)$/, 'functions/api/shares/[id].js', (m) => ({ id: m[1] })],
  [/^\/s\/([A-Za-z0-9]+)$/, 'functions/s/[id].js', (m) => ({ id: m[1] })],
  [/^\/share-media\/([A-Za-z0-9]+)$/, 'functions/share-media/[id].js', (m) => ({ id: m[1] })]
];
const mods = {};
async function mod(file) { if (!mods[file]) mods[file] = await import(pathToFileURL(path.join(root, file)).href); return mods[file]; }

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webm': 'video/webm', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };

function resolveStatic(pathname) {
  let p = pathname === '/' ? '/index.html' : pathname;
  let f = path.join(root, p);
  if (!f.startsWith(root)) return null;
  if (fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  if (!path.extname(f) && fs.existsSync(f + '.html')) return f + '.html';
  if (fs.existsSync(f) && fs.statSync(f).isDirectory() && fs.existsSync(path.join(f, 'index.html'))) return path.join(f, 'index.html');
  return null;
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  for (const [re, file, params] of routes) {
    const m = url.pathname.match(re);
    if (!m) continue;
    const chunks = []; for await (const c of req) chunks.push(c);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const request = new Request(url.href, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body, duplex: 'half' });
    try {
      const m2 = await mod(file);
      const response = await m2.onRequest({ request, env, params: params(m) });
      log.push({ t: new Date().toISOString(), method: req.method, path: url.pathname, status: response.status });
      const headers = {}; response.headers.forEach((v, k) => { headers[k] = v; });
      res.writeHead(response.status, headers);
      const buf = Buffer.from(await response.arrayBuffer());
      res.end(req.method === 'HEAD' ? undefined : buf);
    } catch (e) { console.error(e); res.writeHead(500); res.end(String(e)); }
    return;
  }
  if (url.pathname === '/__harness/log') { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ log, r2: [...r2.keys()].map(k => ({ k, bytes: r2.get(k).bytes.length })) })); return; }
  if (url.pathname.startsWith('/api/')) { res.writeHead(204); res.end(); return; } // telemetry sinks: accept, discard
  const f = resolveStatic(decodeURIComponent(url.pathname));
  if (!f) { res.writeHead(404, { 'content-type': 'text/plain' }); res.end('Not found'); return; }
  res.writeHead(200, { 'content-type': types[path.extname(f).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(f).pipe(res);
}).listen(port, '127.0.0.1', () => console.log('harness on', port, failShares ? '(share storage disabled)' : ''));
