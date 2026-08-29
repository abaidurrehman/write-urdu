const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My Publications — Write Urdu</title>
  <meta name="description" content="Track what happened to writing you submitted to Urdu Writers, submit a revision or withdraw a published piece.">
  <meta name="robots" content="noindex,follow,noarchive">
  <meta name="googlebot" content="noindex,follow">
  <link rel="canonical" href="https://write-urdu.com/my-publications">
  <meta property="og:title" content="My Publications — Write Urdu">
  <meta property="og:description" content="Track what happened to writing you submitted to Urdu Writers.">
  <meta property="og:url" content="https://write-urdu.com/my-publications">
  <meta property="og:image" content="https://write-urdu.com/assets/social/write-urdu-home.svg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#0a2a1b">
  <link rel="stylesheet" href="/layout-styles.css">
  <link rel="stylesheet" href="/css/account.css">
  <link rel="stylesheet" href="/css/my-publications.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/earlyaccess/notonastaliqurdu.css?display=swap">
</head>
<body class="my-publications-page">
  <div><nav class="navbar" aria-label="Write Urdu navigation"></nav></div>
  <main class="my-publications-main" id="main-content">
    <header class="my-publications-hero">
      <div>
        <span class="account-kicker">Your account</span>
        <h1>My Publications</h1>
        <p>See what happened to writing you submitted to <strong>Urdu Writers</strong> — in review, published, revised or withdrawn.</p>
      </div>
      <div class="my-publications-hero-actions">
        <a class="my-publications-primary" href="/urdu-writers">Read Urdu Writers</a>
        <a class="my-publications-secondary" href="/">Write something new</a>
      </div>
    </header>
    <div class="my-publications-message" role="status" aria-live="polite" data-publications-message>Loading your publications…</div>
    <section class="my-publications-state" data-publications-signed-out hidden>
      <h2>Sign in to see your submissions</h2>
      <p>Submitted writing is tied to your account.</p>
      <a class="my-publications-primary" href="/sign-in?returnTo=%2Fmy-publications">Sign in</a>
    </section>
    <section class="my-publications-state" data-publications-unavailable hidden>
      <h2>My Publications is unavailable right now</h2>
      <p>You can continue writing normally. Nothing you submitted was affected.</p>
      <a class="my-publications-secondary" href="/">Continue writing</a>
    </section>
    <section class="my-publications-state" data-publications-empty hidden>
      <h2>Nothing submitted yet</h2>
      <p>Write something meaningful and choose to submit it to Urdu Writers when the option appears.</p>
      <a class="my-publications-primary" href="/">Start writing</a>
    </section>
    <section class="my-publications-list" data-publications-list hidden aria-label="Your submissions"></section>
  </main>
  <dialog class="my-publications-dialog" data-publications-confirm-dialog aria-labelledby="publications-confirm-title">
    <form method="dialog" class="my-publications-dialog-card">
      <button class="my-publications-dialog-close" value="cancel" aria-label="Close">×</button>
      <h2 id="publications-confirm-title" data-confirm-title>Confirm</h2>
      <p data-confirm-copy></p>
      <div class="my-publications-dialog-actions">
        <button value="cancel" class="my-publications-secondary">Cancel</button>
        <button value="confirm" class="my-publications-primary" data-confirm-button>Confirm</button>
      </div>
    </form>
  </dialog>
  <dialog class="my-publications-dialog my-publications-revision-dialog" data-publications-revision-dialog aria-labelledby="publications-revision-title">
    <form method="dialog" class="my-publications-dialog-card">
      <button class="my-publications-dialog-close" value="cancel" aria-label="Close">×</button>
      <h2 id="publications-revision-title">Submit a revision</h2>
      <p>This starts from the writing currently published. Editing here does not change what is public until a moderator approves it.</p>
      <label>Title
        <input type="text" maxlength="180" data-revision-title>
      </label>
      <label>Public name / pen name
        <input type="text" maxlength="80" data-revision-author-name>
      </label>
      <label>Writing
        <textarea rows="12" lang="ur" dir="rtl" data-revision-body></textarea>
      </label>
      <p class="my-publications-dialog-error" data-revision-error hidden></p>
      <div class="my-publications-dialog-actions">
        <button value="cancel" class="my-publications-secondary">Cancel</button>
        <button value="confirm" class="my-publications-primary" data-revision-submit>Submit revision</button>
      </div>
    </form>
  </dialog>
  <footer></footer>
  <script src="/site-header.js" defer></script>
  <script type="module" src="/js/my-publications.mjs"></script>
</body>
</html>`;

export function onRequest({ request }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  return new Response(request.method === 'HEAD' ? null : PAGE, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Robots-Tag': 'noindex, follow, noarchive',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  });
}
