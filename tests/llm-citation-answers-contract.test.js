// LLM citation audit 2026-10-12, Slice 3 (A-5, A-6, A-7): quotable answers that
// already-shipped tools can back up, visible in raw HTML and mirrored exactly in
// FAQPage JSON-LD, plus contextual links into the phrases page.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const config = require(path.join(root, 'seo.config.js'));
const urdu = require(path.join(root, 'locale', 'ur.js'));
const urduStrings = urdu.routes;

function plain(html) {
  return String(html).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

function visibleFaq(html) {
  return (html.match(/<details\b[\s\S]*?<\/details>/gi) || []).map((detail) => ({
    q: plain(detail.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)[1]),
    a: plain(detail.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)[1])
  }));
}

function schemaFaq(html) {
  const blocks = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of blocks) {
    const json = JSON.parse(block.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, ''));
    const graph = json['@graph'] || [json];
    const faq = graph.find((node) => node['@type'] === 'FAQPage');
    if (faq) return faq.mainEntity.map((item) => ({ q: item.name, a: item.acceptedAnswer.text }));
  }
  return [];
}

function hasL10n(key) {
  const flat = JSON.stringify(urduStrings);
  return flat.includes(JSON.stringify(key) + ':');
}

// A-5 — Voice typing: where it works, and three visible questions.
const voice = read('tools/urdu-voice-typing.html');
const voicePage = config.pages.find((page) => page.id === 'urdu-voice-typing');
assert.ok(voicePage.schema.includes('FAQPage'), 'voice page should emit FAQPage for its visible questions');
assert.match(voice, /<h2[^>]*>Where voice typing works<\/h2>/, 'voice compatibility heading is missing');
const voiceFaq = visibleFaq(voice);
const voiceQuestions = voiceFaq.map((item) => item.q);
['The microphone is blocked. How do I allow it again?', 'Does voice typing start listening on its own?', 'Should I use voice typing or English-letter typing?']
  .forEach((question) => assert.ok(voiceQuestions.includes(question), 'voice FAQ missing: ' + question));
assert.deepEqual(schemaFaq(voice), voiceFaq, 'voice FAQPage JSON-LD must match the visible questions exactly');
assert.doesNotMatch(voice, /\b(Chrome|Safari|Firefox|Edge|Samsung Internet)\b/, 'name browsers only after a PASS record in docs/VOICE-MOBILE-DEVICE-CHECKLIST.md');
const compat = voice.match(/<section class="urdu-voice-compat"[\s\S]*?<\/section>/);
assert.ok(compat, 'voice compatibility section is missing');
assert.ok(plain(compat[0]).split(' ').length <= 220, 'voice compatibility block should stay short');

// A-7 — FAQ: Urdu in WhatsApp and other phone apps.
const faq = read('urdu-faq.html');
const whatsapp = visibleFaq(faq).find((item) => item.q === 'How do I write Urdu in WhatsApp or other phone apps?');
assert.ok(whatsapp, 'WhatsApp/phone answer is missing from the FAQ');
assert.ok(whatsapp.a.split(' ').length <= 90, 'WhatsApp answer should stay under 90 words');
assert.deepEqual(schemaFaq(faq), visibleFaq(faq), 'FAQ JSON-LD must match the visible FAQ exactly');
['urdu-faq.q9', 'urdu-faq.a9', 'urdu-faq.navPhrases',
  'tools.urdu-voice-typing.compatTitle', 'tools.urdu-voice-typing.compatCopy',
  'tools.urdu-voice-typing.faqTitle',
  'tools.urdu-voice-typing.faqMicQ', 'tools.urdu-voice-typing.faqMicA',
  'tools.urdu-voice-typing.faqStartQ', 'tools.urdu-voice-typing.faqStartA',
  'tools.urdu-voice-typing.faqModeQ', 'tools.urdu-voice-typing.faqModeA']
  .forEach((key) => assert.ok(hasL10n(key), 'Urdu translation missing for ' + key));

// A-6 — contextual links into the phrases page from four relevant sources.
[
  ['index.html', 'Copy common Urdu phrases like السلام علیکم'],
  ['urdu-card-studio.html', 'Urdu and Arabic phrases to put on a card'],
  ['urdu-faq.html', 'Urdu &amp; Arabic phrases'],
  ['how-to-write-urdu-on-photo.html', 'Ready-to-copy Urdu greetings and duas']
].forEach(([file, anchor]) => {
  const pattern = new RegExp('<a [^>]*href="/urdu-phrases-copy-paste"[^>]*>' + anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '</a>');
  assert.match(read(file), pattern, file + ' should link to the phrases page with a descriptive anchor');
});

console.log('LLM citation answers contract passed.');
