import { communityPublicFeatureState, createPublicationRepository, publicOrigin, escapeHtml } from './lib/community-publications.mjs';

function xmlResponse(xml) {
  return new Response(xml, {
    status: 200,
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    }
  });
}

function urlEntry(loc, lastmod) {
  return `  <url>
    <loc>${escapeHtml(loc)}</loc>
    <lastmod>${escapeHtml(lastmod)}</lastmod>
  </url>`;
}

export async function onRequestGet({ request, env }) {
  const state = communityPublicFeatureState(env);
  const origin = publicOrigin(request, env);

  if (state !== 'ready') {
    return xmlResponse('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n');
  }

  const repository = createPublicationRepository(env.METRICS_DB);
  const rows = await repository.listPublishedForSitemap();
  const entries = rows
    .map((row) => urlEntry(`${origin}/urdu-writers/${encodeURIComponent(row.slug)}`, (row.updatedAt || '').slice(0, 10) || new Date().toISOString().slice(0, 10)))
    .join('\n');

  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`);
}

export function onRequest(context) {
  if (context.request.method === 'GET' || context.request.method === 'HEAD') return onRequestGet(context);
  return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
}
