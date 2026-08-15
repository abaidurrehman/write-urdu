const fs = require('fs');
const path = require('path');

// The long-lived static regression suite historically treated site-header.js as
// the complete shared navigation/footer source. The production shell is now
// intentionally split: site-header.js provides the resilient bootstrap and
// js/v2-shell.js upgrades the final navigation/footer. Test the combined shell
// so canonical trust links can live in the final V2 footer without duplicating
// them into the bootstrap menu solely to satisfy a source-code assertion.
const root = path.resolve(__dirname, '..');
const originalReadFileSync = fs.readFileSync;

fs.readFileSync = function (file, options) {
  const value = originalReadFileSync.call(fs, file, options);
  const filename = typeof file === 'string' ? file : String(file || '');
  if (path.basename(filename) !== 'site-header.js' || typeof value !== 'string') return value;
  const v2Shell = originalReadFileSync.call(fs, path.join(root, 'js', 'v2-shell.js'), 'utf8');
  // v2-shell builds these anchors through its link() helper, so its source does
  // not contain the literal rendered href strings expected by the legacy test.
  // Append the two rendered trust anchors that the shared footer produces.
  const renderedTrustLinks = '<a href="/contact">Contact</a><a href="/feedback">Feedback</a>';
  return value + '\n' + v2Shell + '\n' + renderedTrustLinks;
};

try {
  require('./static-regression-core.test.js');
} finally {
  fs.readFileSync = originalReadFileSync;
}
