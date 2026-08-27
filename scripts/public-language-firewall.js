#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const write = process.argv.includes('--write');

const replacements = [
  // Shared navigation and footer: user jobs, not implementation vocabulary.
  ['Fix spacing, RTL and Unicode issues', 'Fix broken or messy Urdu text'],
  ['فاصلہ، RTL اور یونیکوڈ مسائل درست کریں', 'خراب یا بکھرا ہوا اردو متن درست کریں'],
  ['Convert legacy InPage text', 'Convert older InPage Urdu'],
  ['Your writing stays in this browser unless you choose to export or share it.', 'Your writing is yours. See Privacy for details.'],
  ['آپ کی تحریر اسی براؤزر میں رہتی ہے جب تک آپ اسے ایکسپورٹ یا شیئر نہ کریں۔', 'آپ کی تحریر آپ کی ہے۔ تفصیل کے لیے رازداری کا صفحہ دیکھیں۔'],

  // Homepage: value first, privacy details linked rather than repeated.
  ['Everything runs in your browser, so you can start immediately without signing up.', 'Start immediately and turn your Urdu writing into messages, documents and designs.'],
  ['Your writing stays in this browser unless you choose to export or share it.', 'Your writing is yours. See Privacy for details.'],
  ['Local PDF or PNG export', 'Download as PDF or PNG'],
  ['local PDF or PNG export', 'PDF or PNG download'],
  ['stay on this device', 'stay available while you work'],
  ['stays on this device', 'stays available while you work'],

  // About: remove product-management rationale, defensive limits and test/process language.
  ['About Write Urdu – Purpose, Privacy and How It Works', 'About Write Urdu – Urdu Writing Made Simple'],
  ['Learn why Write Urdu was created, who it helps, how your writing stays private and how to report a correction.', 'Learn why Write Urdu exists, who it helps and the different ways you can write, format and create in Urdu.'],
  ['Learn the purpose, limits and privacy model of Write Urdu.', 'Learn what Write Urdu helps you do and find the right tool for your Urdu writing.'],
  ['Local drafts and creative projects stay in your browser where supported', 'Write, format and create without unnecessary setup'],
  ['Roman Urdu transliteration may use Google’s transliteration service', 'Type Urdu with English letters or use direct Urdu input'],
  ['Questions, corrections and accessibility reports have public contact routes', 'Help and feedback are easy to find when you need them'],
  ['The editor and Urdu output are the product, not a signup funnel.', 'Start writing quickly and move from a first draft to finished Urdu work.'],
  ['Drafts, formatting and most creative work stay on your device.', 'Write, format and create with simple tools that stay out of your way.'],
  ['Third-party services and known limitations are documented instead of hidden.', 'Clear guidance helps you choose the right tool and review important results.'],
  ['Guides are reviewed against the current interface and tested in a modern browser before substantial updates. Reported errors are reproduced where possible, corrected in the source and rechecked with the site’s static and browser tests.', 'Guides are reviewed as Write Urdu changes. If you spot an error or unclear instruction, send feedback and we will review it.'],
  ['KNOWN LIMITATIONS', 'GOOD TO KNOW'],
  ['What Write Urdu does not promise', 'A few things worth checking'],
  ['Transliteration is not translation.', 'Review important Urdu wording.'],
  ['Roman Urdu spellings can be ambiguous, so suggestions may produce more than one reasonable Urdu word. Review important text before publishing it.', 'English-letter spellings can sometimes produce more than one reasonable Urdu word, so check names, formal writing and anything important before sharing.'],
  ['Exports depend on the browser and device.', 'Check important files after download.'],
  ['Word, PDF, PNG, printing and native sharing can behave differently across browsers and operating systems.', 'After downloading or printing, give the final document or image a quick review before you send it.'],
  ['Third-party services have their own policies.', 'Privacy details are available in one place.'],

  // InPage converter: keep InPage/Unicode where it is genuine user/search intent; remove implementation/spec wording.
  ['free in your browser. No account or paid API.', 'free with no account required.'],
  ['Move Urdu text between a supported legacy InPage clipboard representation and modern Unicode, entirely in your browser.', 'Convert pasted Urdu text between older InPage formats and modern Unicode.'],
  ['Convert supported InPage Urdu text and Unicode Urdu in either direction in your browser.', 'Convert supported InPage Urdu text and Unicode Urdu in either direction.'],
  ['Yes. The conversion runs on this device and does not require a paid conversion service or an account.', 'Yes. The converter is free and does not require an account.'],
  ['No. This converter does not send the source or converted result to a conversion service. Product usage measurement does not include the text itself.', 'Your pasted text is used for the conversion. See Privacy for details about how Write Urdu handles data.'],
  ['Not in this version. The tool focuses on pasted text. Full .inp document conversion would be a separate feature.', 'Not currently. This tool converts text you paste from InPage; it does not open complete .inp documents.'],
  ['Move pasted Urdu text between a supported legacy InPage clipboard representation and modern Unicode. Convert in either direction without uploading the text.', 'Paste older InPage Urdu text and convert it to modern Unicode, or convert supported Unicode Urdu back for older InPage workflows.'],
  ['Your text stays on this device during conversion. This version converts pasted text; it does not open or generate complete <code>.inp</code> document files.', 'Paste text copied from InPage to convert it. Complete <code>.inp</code> document files are not supported.'],
  ['This version handles pasted text only. It does not preserve page layout or open complete <code>.inp</code> files.', 'This tool handles pasted text only, so page layout and complete <code>.inp</code> documents are not included.'],
  ['Conversion runs locally in JavaScript.', 'Paste your text, choose a direction and convert it.'],
  ['Generic product telemetry must not contain the text itself.', 'See Privacy for details about usage measurement.'],
  ['The first release focuses on pasted text so the encoding behavior can remain transparent and reversible. Full <code>.inp</code> file parsing is a separate future feature.', 'The converter works with pasted text. It does not open full <code>.inp</code> files.'],
  ['The first release focuses on pasted text so the encoding behavior can remain transparent and reversible. Full .inp file parsing is a separate future feature.', 'The converter works with pasted text. It does not open full .inp files.'],

  // OCR: keep the task and a useful accuracy note, move architecture/privacy details out of the sales copy.
  ['Your image stays on this device while text is extracted.', 'Choose a clear image for the best result.'],
  ['Images are processed in your browser and are not uploaded to WriteUrdu.', 'For best results, use a clear image with readable Urdu text.'],
  ['The first time you use the tool, your browser may download the files it needs to read Urdu text.', 'The first use may take a little longer while the text reader gets ready.'],
  ['PDF files are not supported in this version.', 'Use a PNG, JPG or other supported image.'],

  // Text Cleaner: explain the outcome, not analytics/network architecture.
  ['does not send them to analytics or a text-cleaning service', 'does not include your writing in usage measurement'],
  ['Your text stays on this device while you clean it.', 'Paste your text, clean it and review the result.'],

  // Invoice and creative tools: stop leading with processing architecture or repeated negatives.
  ['Everything is processed in this browser. No account or upload is required.', 'Create, preview and download your invoice without creating an account.'],
  ['There is no second WriteUrdu tool embedded inside Name Art', 'Name Art opens the same focused design workspace'],
  ['WriteUrdu does not connect to Instagram or post on your behalf.', 'Download your finished image, then post it to Instagram.'],
  ['Nothing is sent to Instagram.', 'Post the downloaded image when you are ready.'],
  ['WriteUrdu does not connect to WhatsApp or post a status for you.', 'Download your finished image, then add it to your WhatsApp Status.'],

  // Documentation and forms: remove server/vendor/API vocabulary from ordinary help copy.
  ['Bring in a plain-text UTF-8 file without sending it to a server.', 'Open an existing .txt file and continue editing.'],
  ['Use your device\'s share sheet when available, with copy as a fallback.', 'Share your writing using the apps available on your phone or computer.'],
  ['Submitting sends only these form fields through Cloudflare for spam verification and delivery.', 'We only receive the information you enter here. See Privacy for details.'],
  ['Cloudflare for spam verification and delivery', 'the Write Urdu form service'],

  // Public copy must not narrate internal release/versioning intent.
  ['first release', 'current tool'],
  ['separate future feature', 'not currently supported']
];

const forbidden = [
  /not a signup funnel/i,
  /static and browser tests/i,
  /mapping profile:\s*inpage-/i,
  /preferred legacy byte/i,
  /generic product telemetry/i,
  /runs locally in JavaScript/i,
  /same-origin Write Urdu Pages Function/i,
  /private service-bound mailer/i,
  /product-telemetry database/i,
  /server-rendered social metadata/i,
  /ephemeral tab-session identifier/i,
  /hash of the private management token/i,
  /source-tool\/preset information/i,
  /limited operational\/moderation fields/i,
  /configured CDN/i,
  /browser-first workflow/i,
  /search-content program/i,
  /first release focuses/i
];

const skipDirs = new Set(['.git', '.github', 'node_modules', 'specs', 'docs', 'skills', '.claude', 'tests', 'os']);

function collectPublicFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.') continue;
    const absolute = path.join(dir, entry.name);
    const relative = path.relative(root, absolute).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) collectPublicFiles(absolute, out);
      continue;
    }
    if (/\.html$/i.test(entry.name)) out.push(relative);
  }
}

const publicFiles = [];
collectPublicFiles(root, publicFiles);
for (const extra of ['llms.txt', 'js/outcome-navigation.js']) {
  if (fs.existsSync(path.join(root, extra))) publicFiles.push(extra);
}

let changed = 0;
for (const relative of [...new Set(publicFiles)].sort()) {
  const filename = path.join(root, relative);
  let source = fs.readFileSync(filename, 'utf8');
  let next = source;
  for (const [from, to] of replacements) next = next.split(from).join(to);
  if (write && next !== source) {
    fs.writeFileSync(filename, next, 'utf8');
    changed += 1;
    console.log('Reworded public copy in ' + relative);
  }
}

if (write) {
  const sync = spawnSync(process.execPath, [path.join(root, 'scripts', 'sync-static-shell.js'), '--write'], {
    cwd: root,
    stdio: 'inherit'
  });
  if (sync.status !== 0) process.exit(sync.status || 1);
  console.log(`Public product language normalization updated ${changed} source file(s).`);
  process.exit(0);
}

let failed = false;
for (const relative of [...new Set(publicFiles)].sort()) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  for (const rule of forbidden) {
    if (rule.test(source)) {
      console.error(`Public product language leak in ${relative}: ${rule}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log(`Public product language firewall passed across ${new Set(publicFiles).size} public files.`);
