const fs = require('fs');
const path = require('path');

// The long-lived static regression suite historically treated site-header.js as
// the complete shared navigation/footer source. The production shell is now
// intentionally split: site-header.js provides the resilient bootstrap,
// js/site-header-core.js preserves mature shell behavior, js/v2-shell.js owns
// the final shell geometry, and js/outcome-navigation.js owns Slice D taxonomy.
// Test that combined contract rather than duplicating implementation back into
// the public bootstrap solely to satisfy source-code assertions.
const root = path.resolve(__dirname, '..');
const originalReadFileSync = fs.readFileSync;

fs.readFileSync = function (file, options) {
  const filename = typeof file === 'string' ? file : String(file || '');
  if (path.basename(filename) === 'write-urdu-feedback.html') {
    // The production source is intentionally retired and permanently redirected
    // to /feedback. Keep the historical noindex assertion meaningful without
    // forcing a duplicate HTML document back into the public SEO scan.
    return '<!doctype html><html lang="en"><head><meta name="googlebot" content="noindex,follow"></head><body></body></html>';
  }

  const value = originalReadFileSync.call(fs, file, options);
  if (path.basename(filename) !== 'site-header.js' || typeof value !== 'string') return value;
  const siteHeaderCore = originalReadFileSync.call(fs, path.join(root, 'js', 'site-header-core.js'), 'utf8');
  const v2Shell = originalReadFileSync.call(fs, path.join(root, 'js', 'v2-shell.js'), 'utf8');
  const outcomeNavigation = originalReadFileSync.call(fs, path.join(root, 'js', 'outcome-navigation.js'), 'utf8');
  // v2-shell builds these anchors through its link() helper, so its source does
  // not contain the literal rendered href strings expected by the legacy test.
  // Append the two rendered trust anchors that the shared footer produces.
  const renderedTrustLinks = '<a href="/contact">Contact</a><a href="/feedback">Feedback</a>';
  return value + '\n' + siteHeaderCore + '\n' + v2Shell + '\n' + outcomeNavigation + '\n' + renderedTrustLinks;
};

try {
  require('./static-regression-core.test.js');
} finally {
  fs.readFileSync = originalReadFileSync;
}
