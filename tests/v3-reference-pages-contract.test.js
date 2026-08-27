const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const features = fs.readFileSync(path.join(root, 'write-urdu-features.html'), 'utf8');
const editorFeatures = fs.readFileSync(path.join(root, 'urdu-editor-features.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'v3-reference.css'), 'utf8');
const registry = fs.readFileSync(path.join(root, 'docs', 'WU-PUBLIC-PAGE-REGISTRY.csv'), 'utf8');

function assertModernReferencePage(source, expectedH1) {
    assert.match(source, /css\/v3-reference\.css/, 'Reference pages must load the shared V3 reference stylesheet');
    assert.match(source, /css\/v2-content\.css/, 'Reference pages must retain the shared content foundation');
    assert.match(source, /site-header\.js/, 'Reference pages must use the shared site shell');
    assert.match(source, /js\/seo\.js/, 'Reference pages must use shared SEO metadata and schema');
    assert.match(source, new RegExp('<h1[^>]*>' + expectedH1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '<\\/h1>'), 'Reference page H1 must match the SEO registry');
    assert.match(source, /data-wu-ad-boundary="after-answer"/, 'Learn pages need an explicit safe single-ad boundary after the quick answer');
    assert.doesNotMatch(source, /adsbygoogle|data-ad-slot=/, 'Reference HTML must not hard-code AdSense slots; the central policy runtime owns placement');
    assert.doesNotMatch(source, /bootstrap(?:\.min)?\.(?:css|js)|maxcdn\.bootstrapcdn|cdn\.jsdelivr\.net\/npm\/bootstrap/i, 'Legacy Bootstrap dependencies must stay removed');
    assert.doesNotMatch(source, /jquery(?:\.min)?\.js|ajax\.googleapis\.com\/ajax\/libs\/jquery/i, 'Legacy jQuery dependency must stay removed');
    assert.doesNotMatch(source, /fb-customerchat|connect\.facebook\.net\/.*sdk|twitter-wjs|twitter-follow-button/i, 'Legacy social SDK widgets must stay removed');
    assert.doesNotMatch(source, /google\.load\(|TransliterationControl|function\s+DownloadAsPdf|function\s+DownloadAsImage/, 'Dead editor/export runtime must not return to static reference guides');
}

assertModernReferencePage(features, 'Write Urdu features and export options');
assertModernReferencePage(editorFeatures, 'Urdu Rich Text Editor formatting guide');

assert.match(features, /Saved drafts and recent history|Recover saved drafts/, 'Operational guide must keep saved-draft and recovery guidance');
assert.match(features, /Import a text file/, 'Operational guide must keep import guidance');
assert.match(features, /TXT, Word, PDF and PNG export/, 'Operational guide must describe the current export family');
assert.doesNotMatch(features, /Local drafts and recent history/, 'Reference copy should describe the user capability rather than local-storage architecture');
assert.match(editorFeatures, /editor-current-desktop\.png/, 'Formatting guide must show the current desktop editor');
assert.match(editorFeatures, /editor-current-mobile\.png/, 'Formatting guide must retain a mobile editor example');
assert.match(editorFeatures, /Noto Nastaliq Urdu/, 'Formatting guide must retain Urdu font guidance');

assert.match(css, /\.v3-reference-page \.reference-hero/, 'Shared reference hero styling is missing');
assert.match(css, /data-wu-ad-placement="guide_after_answer"/, 'Reference CSS must preserve spacing around the canonical Learn ad');
assert.match(css, /@media \(max-width: 700px\)/, 'Reference pages need a dedicated mobile treatment');

assert.match(registry, /write-urdu-features\.html,\/write-urdu-features,[^\n]*,migrated,P2,/, 'Write Urdu features registry status must be migrated');
assert.match(registry, /urdu-editor-features\.html,\/urdu-editor-features,[^\n]*,migrated,P2,/, 'Editor formatting guide registry status must be migrated');

console.log('V3 reference-page migration contract passed.');