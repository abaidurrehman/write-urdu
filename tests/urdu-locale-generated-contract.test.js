const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const config = require('../locale.config.js');
const ur = require('../locale/ur.js');

const root = path.resolve(__dirname, '..');
const driftCheck = spawnSync(process.execPath, ['scripts/generate-urdu-locale.js', '--check'], { cwd: root, encoding: 'utf8' });
assert.strictEqual(driftCheck.status, 0, `generated Urdu locale output is stale:\n${driftCheck.stderr || driftCheck.stdout || ''}`);

const outputs = {
  '/': 'urdu/index.html',
  '/urdu-keyboard': 'urdu/urdu-keyboard.html',
  '/urdu-editor': 'urdu/urdu-editor.html',
  '/tools/urdu-voice-typing': 'urdu/tools/urdu-voice-typing.html',
  '/urdu-alphabet': 'urdu/urdu-alphabet.html',
  '/urdu-faq': 'urdu/urdu-faq.html',
  '/urdu-card-studio': 'urdu/urdu-card-studio.html',
  '/how-to-write-urdu-on-photo': 'urdu/how-to-write-urdu-on-photo.html'
};

assert.deepStrictEqual(Object.keys(outputs), config.phase1Routes);
for (const route of config.phase1Routes) {
  const file = path.join(root, outputs[route]);
  assert.ok(fs.existsSync(file), `generated Urdu file missing for ${route}`);
  const html = fs.readFileSync(file, 'utf8');
  assert.match(html, /<html\s+lang="ur"\s+dir="rtl"/i, `${route} initial HTML must be Urdu RTL`);
  assert.doesNotMatch(html, /noindex/i, `${route} launched Urdu page must be indexable after Slice B`);
  assert.match(html, /hreflang="ur"/i, `${route} must expose Urdu hreflang in initial HTML`);
  assert.match(html, /data-wu-urdu-schema/, `${route} must expose locale-correct structured data in initial HTML`);
  assert.ok(html.includes(ur.routes[route].h1), `${route} must contain reviewed Urdu H1`);
  assert.ok(html.includes(ur.routes[route].lede), `${route} must contain reviewed Urdu lede`);
  assert.doesNotMatch(html, /["']\/urdu\/(?:js|css|image)\//i, `${route} must not resolve shared assets inside /urdu`);
  assert.doesNotMatch(html, /["']\/urdu\/(?:sw\.js|manifest\.webmanifest)/i, `${route} must use root PWA assets`);
  assert.match(html, /src="\/js\/locale-route\.js"/, `${route} must load shared locale route helper`);
}

assert.match(fs.readFileSync(path.join(root, 'urdu/index.html'), 'utf8'), /id="transliterateTextarea"/, 'Basic writer ID must survive generation');
assert.match(fs.readFileSync(path.join(root, 'urdu/urdu-keyboard.html'), 'utf8'), /id="write"/, 'Keyboard textarea ID must survive generation');
assert.match(fs.readFileSync(path.join(root, 'urdu/urdu-editor.html'), 'utf8'), /id="basic-example"/, 'Rich editor textarea ID must survive generation');
assert.match(fs.readFileSync(path.join(root, 'urdu/tools/urdu-voice-typing.html'), 'utf8'), /id="voiceTranscript"/, 'Voice transcript ID must survive generation');

const redirects = fs.readFileSync(path.join(root, '_redirects'), 'utf8');
assert.match(redirects, /^\/urdu \/urdu\/ 301$/m);
assert.match(redirects, /^\/urdu\/urdu-editor\.html \/urdu\/urdu-editor 301$/m);
assert.match(redirects, /^\/urdu\/tools\/urdu-voice-typing\/ \/urdu\/tools\/urdu-voice-typing 301$/m);

const core = fs.readFileSync(path.join(root, 'js/site-header-core.js'), 'utf8');
assert.match(core, /register\('\/sw\.js', \{ scope: '\/' \}\)/, 'PWA worker must be root-scoped');
assert.match(core, /manifest\.href = '\/manifest\.webmanifest'/, 'Manifest must be root absolute');
assert.match(core, /LOCALE_TRANSFER_KEY/, 'Locale navigation must preserve active writer text');
assert.match(core, /counterpartHref/, 'Language control must target real counterpart URLs');

console.log('Generated Urdu locale contract passed.');
