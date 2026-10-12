const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const config = require(path.join(root, 'seo.config.js'));
const origin = config.SITE_ORIGIN;

// 1. llms.txt lists every indexable route (WU LLM-citation audit 2026-10-12, T-2).
const llms = read('llms.txt');
const LLMS_EXEMPT = new Set(['/community-guidelines', '/write-urdu-features', '/urdu-editor-features']);
config.pages
    .filter(page => page.indexable && !LLMS_EXEMPT.has(page.path))
    .forEach(page => {
        const url = origin + (page.path === '/' ? '/' : page.path);
        assert.ok(llms.includes('(' + url + ')') || llms.includes('(' + url + '#'),
            'llms.txt must list indexable route ' + page.path);
    });

// Urdu locale URLs from the sitemap must be listed too.
const sitemap = read('sitemap.xml');
(sitemap.match(/<loc>[^<]+<\/loc>/g) || [])
    .map(loc => loc.replace(/<\/?loc>/g, ''))
    .filter(url => url.startsWith(origin + '/urdu/'))
    .forEach(url => assert.ok(llms.includes('(' + url + ')'), 'llms.txt must list Urdu-locale page ' + url));

// 2. llms.txt keeps the capability limits that stop wrong recommendations.
assert.match(llms, /Not supported:[^\n]*translating the meaning of an English sentence/i, 'llms.txt must state that meaning translation is not supported');
assert.match(llms, /\.inp files/i, 'llms.txt must state the InPage .inp limitation');
assert.match(llms, /July 2016/, 'llms.txt must carry the founding date');
assert.match(llms, /Last reviewed:\s*\d{4}-\d{2}-\d{2}/, 'llms.txt must carry a review date');

// 3. Anchor ownership: link text and destination must agree (WU-SEO-CTR-001A section 13).
function htmlFiles(dir, out) {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
        const rel = dir ? dir + '/' + entry.name : entry.name;
        if (entry.isDirectory()) {
            if (!['node_modules', 'docs', 'specs', 'tests', 'skills', 'tinymce', 'os', 'fixtures', 'visual-audit', 'benchmarks', 'packages', 'functions', 'workers', 'scripts', 'marketing', 'assets', 'image', 'css', 'js', 'locale', 'migrations'].includes(entry.name) && !entry.name.startsWith('.')) htmlFiles(rel, out);
        } else if (entry.name.endsWith('.html')) out.push(rel);
    }
    return out;
}
const anchorRe = /<a\b[^>]*href="([^"#?]*)[^"]*"[^>]*>([^<]*)<\/a>/gi;
const typingOwners = new Set(['/', '/english-urdu-typing-tutorial']);
htmlFiles('', []).forEach(file => {
    if (file === '404.html') return;
    const html = read(file);
    let match;
    while ((match = anchorRe.exec(html))) {
        const href = match[1].replace(/^https?:\/\/(www\.)?write-urdu\.com/, '');
        const text = match[2].replace(/\s+/g, ' ').trim();
        if (/\bEnglish[- ]to[- ]Urdu typing\b/i.test(text)) {
            assert.ok(typingOwners.has(href), file + ': "' + text + '" must link to / or the tutorial, found ' + href);
        }
        if (/\bRoman Urdu\b/i.test(text) && !/^\/urdu\//.test(href)) {
            assert.strictEqual(href, '/roman-urdu-transliteration', file + ': "' + text + '" must link to the Roman Urdu converter, found ' + href);
        }
    }
});

console.log('llm-citation-discovery contract passed');
