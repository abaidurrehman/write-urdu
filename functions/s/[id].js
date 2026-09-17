import {
  cleanShareId,
  ensureShareSchema,
  escapeHtml,
  excerpt,
  getShare,
  publicOrigin
} from '../_lib/share-artifacts.js';

function pageResponse(html, status) {
  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'x-robots-tag': 'noindex, follow',
      'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
      'permissions-policy': 'camera=(), microphone=(), geolocation=()'
    }
  });
}

function unavailable(status, title, message) {
  return pageResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)} | Write Urdu</title><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/css/share-page.css"></head><body><main class="share-shell"><header class="share-topbar"><a class="share-brand" href="/"><span class="share-brand-mark">WU</span><span>Write Urdu</span></a></header><section class="share-panel" style="position:static;max-width:680px;margin:10vh auto"><p class="share-kicker">Shared Urdu writing</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><div class="share-actions"><a class="share-button primary" href="/urdu-cards">Make your own Urdu card</a><a class="share-button" href="/">Write Urdu</a></div></section></main></body></html>`, status);
}

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!env.METRICS_DB) return unavailable(503, 'Shared page temporarily unavailable', 'Write Urdu could not load this shared item right now. Please try again later.');
  const id = cleanShareId(context.params && context.params.id);
  if (!id) return unavailable(404, 'Shared page not found', 'This Write Urdu share link is not available.');

  await ensureShareSchema(env.METRICS_DB);
  const share = await getShare(env.METRICS_DB, id, false);
  if (!share) return unavailable(404, 'Shared page not found', 'This Write Urdu share link is not available.');
  if (share.status !== 'active') return unavailable(410, 'This shared page is no longer available', 'The publisher removed this Write Urdu share or it is no longer available.');

  const origin = publicOrigin(request, env);
  const url = `${origin}/s/${id}`;
  const imageUrl = `${origin}/share-media/${id}`;
  const downloadUrl = `${origin}/share-media/${id}?download=1`;
  const description = excerpt(share.public_text, 170) || 'Urdu writing shared with Write Urdu.';
  const titleExcerpt = excerpt(share.public_text, 72);
  const title = titleExcerpt ? `${titleExcerpt} | Write Urdu` : 'Urdu writing shared on Write Urdu';
  const publicText = escapeHtml(share.public_text);
  const attribution = share.attribution ? `<p class="share-attribution" lang="ur" dir="auto">— ${escapeHtml(share.attribution)}</p>` : '';
  const created = share.created_at ? escapeHtml(share.created_at) : '';

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,follow,max-image-preview:large">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="color-scheme" content="light">
  <meta name="theme-color" content="#f4f7f5">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(url)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Write Urdu">
  <meta property="og:locale" content="ur_PK">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(url)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:width" content="${Number(share.image_width)}">
  <meta property="og:image:height" content="${Number(share.image_height)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:alt" content="Urdu writing shared from Write Urdu">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
  <meta name="twitter:image:alt" content="Urdu writing shared from Write Urdu">
  <link rel="icon" href="/favicon.ico">
  <link rel="stylesheet" href="/css/share-page.css">
</head>
<body>
  <main class="share-shell">
    <header class="share-topbar">
      <a class="share-brand" href="/" aria-label="Write Urdu home"><span class="share-brand-mark" aria-hidden="true">WU</span><span>Write Urdu</span></a>
      <a class="share-guide-link" href="/how-to-share-urdu-writing-online">How sharing works</a>
    </header>

    <div class="share-layout">
      <article class="share-card" aria-labelledby="shared-writing-heading">
        <img class="share-visual" src="${escapeHtml(imageUrl)}" width="${Number(share.image_width)}" height="${Number(share.image_height)}" alt="Urdu writing shared from Write Urdu">
        <div class="share-media-actions" aria-label="Share or save this card">
          <button class="share-button share-media-action" type="button" data-share-native><svg class="share-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"></path></svg><span>Share</span></button>
          <a class="share-button share-media-action" href="${escapeHtml(downloadUrl)}" download="write-urdu-${id}.png" data-share-download><svg class="share-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14"></path></svg><span>Download PNG</span></a>
          <button class="share-button share-media-action" type="button" data-share-copy-text><svg class="share-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Copy Urdu</span></button>
        </div>
        <div class="share-content">
          <p class="share-kicker">Shared Urdu writing</p>
          <h2 id="shared-writing-heading" class="share-urdu" data-share-public-text lang="ur" dir="rtl">${publicText}</h2>
          ${attribution}
        </div>
      </article>

      <aside class="share-panel" aria-label="Continue with this Urdu writing">
        <p class="share-kicker">Make it your own</p>
        <h1>Like this card?</h1>
        <p>Start fresh with your own words, or intentionally reuse the public words from this card.</p>

        <a class="share-hero-cta" href="/urdu-cards" data-share-create aria-label="Make your own Urdu card">
          <span class="share-hero-urdu" lang="ur" dir="rtl">اپنا خوبصورت اردو کارڈ بنائیں</span>
          <span class="share-hero-sub">Make your own Urdu card — free, no account</span>
        </a>

        <div class="share-actions">
          <button class="share-button secondary" type="button" data-share-use-text>Use these words</button>
          <a class="share-button quiet" href="/urdu-card-studio" data-share-edit>Edit these words in Card Studio</a>
          <div class="share-row share-row-utilities">
            <button class="share-button quiet" type="button" data-share-copy>Copy link</button>
            <a class="share-button quiet" href="/">Write Urdu</a>
          </div>
        </div>

        <p class="share-mini-note">The published card stays unchanged. Any version you create starts as your own local project.</p>
        <div class="share-note"><strong>A public snapshot</strong>This link contains only this published snapshot. The creator's other local drafts and projects are not included.</div>
        <details class="share-report">
          <summary>Report this shared page</summary>
          <div class="share-report-form">
            <select data-share-report-reason aria-label="Reason for report"><option value="">Choose reason</option><option value="spam">Spam</option><option value="abuse">Abuse</option><option value="privacy">Privacy</option><option value="copyright">Copyright</option><option value="other">Other</option></select>
            <button type="button" data-share-report>Report</button>
          </div>
        </details>
        <p class="share-status" data-share-status aria-live="polite"></p>
      </aside>
    </div>

    <footer class="share-footer"><span>Published ${created ? `<time datetime="${created}">${created.slice(0, 10)}</time>` : 'with Write Urdu'}</span><span><a href="/write-urdu-privacy">Privacy</a> · <a href="/contact">Contact</a></span></footer>
  </main>
  <script src="/js/workspace-journey-registry.js"></script>
  <script src="/js/create-publish-boundaries-registry.js"></script>
  <script src="/js/workspace-handoff.js"></script>
  <script src="/js/share-loop-telemetry.js"></script>
  <script src="/js/share-page.js"></script>
</body>
</html>`;
  return pageResponse(html, 200);
}

export function onRequest(context) {
  if (context.request.method === 'GET' || context.request.method === 'HEAD') return onRequestGet(context);
  return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
}
