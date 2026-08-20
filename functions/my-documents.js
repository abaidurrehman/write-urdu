const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My Documents — Write Urdu</title>
  <meta name="description" content="Open, rename, copy, delete or share Urdu writing you explicitly saved to your Write Urdu account.">
  <meta name="robots" content="noindex,follow,noarchive">
  <meta name="googlebot" content="noindex,follow">
  <link rel="canonical" href="https://write-urdu.com/my-documents">
  <meta property="og:title" content="My Documents — Write Urdu">
  <meta property="og:description" content="Open and manage Urdu writing saved to your Write Urdu account.">
  <meta property="og:url" content="https://write-urdu.com/my-documents">
  <meta property="og:image" content="https://write-urdu.com/assets/social/write-urdu-home.svg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#0a2a1b">
  <link rel="stylesheet" href="/layout-styles.css">
  <link rel="stylesheet" href="/css/account.css">
  <link rel="stylesheet" href="/css/my-documents.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/earlyaccess/notonastaliqurdu.css?display=swap">
</head>
<body class="my-documents-page">
  <div><nav class="navbar" aria-label="Write Urdu navigation"></nav></div>
  <main class="my-documents-main" id="main-content">
    <header class="my-documents-hero">
      <div>
        <span class="account-kicker">Your account</span>
        <h1>My Documents</h1>
        <p>Writing appears here only after you choose <strong>Save to my account</strong>. Local drafts in your browser stay separate.</p>
      </div>
      <a class="my-documents-primary" href="/">Write something new</a>
    </header>
    <div class="my-documents-message" role="status" aria-live="polite" data-documents-message>Loading your documents…</div>
    <section class="my-documents-state" data-documents-signed-out hidden>
      <h2>Sign in to see your saved writing</h2>
      <p>Your browser-local drafts are still available without an account.</p>
      <a class="my-documents-primary" href="/sign-in?returnTo=%2Fmy-documents">Sign in</a>
    </section>
    <section class="my-documents-state" data-documents-unavailable hidden>
      <h2>My Documents is unavailable right now</h2>
      <p>You can continue writing normally. Local saving is not affected.</p>
      <a class="my-documents-secondary" href="/">Continue writing</a>
    </section>
    <section class="my-documents-state" data-documents-empty hidden>
      <h2>No account-saved documents yet</h2>
      <p>Write in the Basic Writer and choose <strong>Save to my account</strong>. Nothing is uploaded automatically.</p>
      <a class="my-documents-primary" href="/">Start writing</a>
    </section>
    <section class="my-documents-list" data-documents-list hidden aria-label="Saved documents"></section>
  </main>
  <dialog class="my-documents-dialog" data-documents-dialog aria-labelledby="documents-dialog-title">
    <form method="dialog" class="my-documents-dialog-card">
      <button class="my-documents-dialog-close" value="cancel" aria-label="Close">×</button>
      <h2 id="documents-dialog-title" data-dialog-title>Confirm action</h2>
      <p data-dialog-copy></p>
      <label data-dialog-input-wrap hidden>Document name
        <input type="text" maxlength="160" data-dialog-input>
      </label>
      <div class="my-documents-dialog-actions">
        <button value="cancel" class="my-documents-secondary">Cancel</button>
        <button value="confirm" class="my-documents-primary" data-dialog-confirm>Confirm</button>
      </div>
    </form>
  </dialog>
  <footer></footer>
  <script src="/site-header.js" defer></script>
  <script type="module" src="/js/my-documents.mjs"></script>
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
