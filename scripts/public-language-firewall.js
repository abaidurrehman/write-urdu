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
  ['Local PDF or PNG export', 'Download as PDF or PNG'],
  ['local PDF or PNG export', 'PDF or PNG download'],

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
  ['Roman Urdu transliteration, web fonts and other explicitly documented services may involve external providers. The <a href="/write-urdu-privacy">privacy page</a> explains those boundaries.', 'Read the <a href="/write-urdu-privacy">Privacy page</a> for details about how Write Urdu handles data and external services.'],
  ['Start with Roman Urdu or direct Urdu input.', 'Type with English letters or enter Urdu directly.'],
  ['<strong>Roman Urdu typing</strong>', '<strong>English to Urdu typing</strong>'],

  // English-letter typing guide: use the language users actually search and understand.
  ['Roman Urdu to Urdu Typing Online | WriteUrdu', 'English to Urdu Typing with English Letters | WriteUrdu'],
  ['Type Roman Urdu using English letters and turn it into Urdu script. See examples, spelling tips and how to review Urdu word suggestions.', 'Type Urdu using English letters and turn each word into Urdu script. See examples, spelling tips and how to review Urdu word suggestions.'],
  ['Type Roman Urdu with English letters and turn it into Urdu script, with examples and spelling tips.', 'Type Urdu with English letters and turn it into Urdu script, with examples and spelling tips.'],
  ['Roman Urdu to Urdu typing guide', 'English to Urdu typing guide'],
  ['Roman Urdu to Urdu Typing', 'English to Urdu Typing with English Letters'],
  ['Roman Urdu typing guide', 'English to Urdu typing guide'],
  ['"Roman Urdu typing"', '"Urdu typing with English letters"'],

  // InPage converter: keep InPage/Unicode where it is genuine user/search intent; remove implementation/spec wording.
  ['free in your browser. No account or paid API.', 'free with no account required.'],
  ['Move Urdu text between a supported legacy InPage clipboard representation and modern Unicode, entirely in your browser.', 'Convert pasted Urdu text between older InPage formats and modern Unicode.'],
  ['Convert supported InPage Urdu text and Unicode Urdu in either direction in your browser.', 'Convert supported InPage Urdu text and Unicode Urdu in either direction.'],
  ['Yes. The conversion runs on this device and does not require a paid conversion service or an account.', 'Yes. The converter is free and does not require an account.'],
  ['No. This converter does not send the source or converted result to a conversion service. Product usage measurement does not include the text itself.', 'Your pasted text is used for the conversion. See Privacy for details about how Write Urdu handles data.'],
  ['Not in this version. The tool focuses on pasted text. Full .inp document conversion would be a separate feature.', 'Not currently. This tool converts text you paste from InPage; it does not open complete .inp documents.'],
  ['Move pasted Urdu text between a supported legacy InPage clipboard representation and modern Unicode. Convert in either direction without uploading the text.', 'Paste older InPage Urdu text and convert it to modern Unicode, or convert supported Unicode Urdu back for older InPage workflows.'],
  ['Your text stays on this device during conversion. This version converts pasted text; it does not open or generate complete <code>.inp</code> document files.', 'Paste text copied from InPage to convert it. Complete <code>.inp</code> document files are not supported.'],
  ['Your text stays available while you work during conversion. This version converts pasted text; it does not open or generate complete <code>.inp</code> document files.', 'Paste the text you want to convert. Complete <code>.inp</code> document files are not supported.'],
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
  ['Correct common character, spacing and text-direction problems without uploading your writing.', 'Correct common character, spacing and text-direction problems, then copy the cleaned result.'],
  ['Fix broken Urdu text copied from PDFs, Word or websites without uploading your writing.', 'Fix broken Urdu text copied from PDFs, Word or websites, then copy the cleaned result.'],
  ['does not send them to analytics or a text-cleaning service', 'keeps the focus on fixing the text you pasted'],
  ['Your text stays on this device while you clean it.', 'Paste your text, clean it and review the result.'],
  ['<aside class="urdu-tool-trust" aria-label="Privacy note">\n                <strong>Free and private</strong><br>\n                Your original and cleaned text stay available while you work. WriteUrdu does not include your writing in usage measurement.\n            </aside>', '<aside class="urdu-tool-trust" aria-label="Quick tip">\n                <strong>Review the cleaned result</strong><br>\n                Keep the original beside it and check important names, numbers and punctuation before copying.\n            </aside>'],
  ['"name":"Does WriteUrdu upload my text?","acceptedAnswer":{"@type":"Answer","text":"No. Cleaning happens on this device. If you continue in another WriteUrdu editor, the text is passed only within this browser and removed from the transfer after it opens."}', '"name":"What kind of Urdu text can I clean?","acceptedAnswer":{"@type":"Answer","text":"Paste Urdu copied from PDFs, Word files, websites or messages. The cleaner focuses on character, spacing and text-direction problems."}'],

  // QR: explain what the result does rather than defending the implementation.
  ['The QR code contains the text or link you enter. WriteUrdu does not add a redirect or track who scans it.', 'The QR code opens the text or link you entered, so people can reach it with a scan.'],
  ['<article><h3>Your details stay private</h3><p>Your QR content and logo stay available while you work. If you type Urdu with English letters, the <a href="/write-urdu-privacy">privacy policy</a> explains the separate word-suggestion service.</p></article>', '<article><h3>Ready to download</h3><p>Preview your QR code, then download PNG or SVG for print, messages or documents.</p></article>'],
  ['See how your QR details stay private', 'Privacy and data handling'],

  // Invoice and creative tools: stop leading with processing architecture or repeated negatives.
  ['Everything is processed in this browser. No account or upload is required.', 'Create, preview and download your invoice without creating an account.'],
  ['There is no second WriteUrdu tool embedded inside Name Art', 'Name Art opens the same focused design workspace'],
  ['WriteUrdu does not connect to Instagram or post on your behalf.', 'Download your finished image, then post it to Instagram.'],
  ['Nothing is sent to Instagram.', 'Post the downloaded image when you are ready.'],
  ['WriteUrdu does not connect to WhatsApp or post a status for you.', 'Download your finished image, then add it to your WhatsApp Status.'],

  // Documentation: explain tasks and outcomes, not storage, browser APIs or service architecture.
  ['Write Roman Urdu with familiar English letters. Press Space to commit a word and let transliteration turn it into Urdu as you go.', 'Type Urdu words with familiar English letters. Press Space after each word to get Urdu script as you go.'],
  ['Enter Roman Urdu, Urdu characters or paste text into the editor.', 'Enter Urdu with English letters, type Urdu characters directly, or paste existing text into the editor.'],
  ['Use Space to commit transliterated words, or switch to direct keyboard input.', 'Press Space after each English-letter word, or switch to direct Urdu keyboard input.'],
  ['<strong>Local drafts</strong><span>Save a working draft in this browser and recover it after a refresh.</span>', '<strong>Working drafts</strong><span>Save a working draft and pick it up again after a refresh.</span>'],
  ['<strong>Native sharing</strong><span>Use your device’s share sheet when it is available, with copy as a fallback.</span>', '<strong>Share writing</strong><span>Share your writing using available apps, or copy it when that is easier.</span>'],
  ['<td>Copy selected text using the browser</td>', '<td>Copy selected text</td>'],
  ['<h2 id="privacy-title">Privacy by design</h2>\n                <p>Your writing should stay yours. The editors are designed to do useful work locally whenever possible.</p>\n                <ul>\n                    <li>Local drafts and recent history are stored in your browser.</li>\n                    <li>No sign-in is needed to type, format or export.</li>\n                    <li>Roman Urdu transliteration may require an internet connection for Google’s service.</li>\n                    <li>Clear your saved draft or history from the editor whenever you choose.</li>\n                </ul>', '<h2 id="privacy-title">Keep your writing moving</h2>\n                <p>Use the simplest writing path for the job, then move into richer tools only when you need them.</p>\n                <ul>\n                    <li>Save a working draft and return to it later.</li>\n                    <li>Type Urdu with English letters or enter Urdu directly.</li>\n                    <li>Move to the rich editor when formatting matters.</li>\n                    <li>Copy, download, print or share when the writing is ready.</li>\n                </ul>'],
  ['A lightweight UTF-8 download that preserves Urdu characters and opens almost anywhere.', 'A lightweight text download that keeps Urdu characters and opens almost anywhere.'],
  ['Print directly from the browser or send text through your device’s native sharing options.', 'Print your finished text or share it through the apps available to you.'],
  ['Transliteration depends on context and the conversion service. Try another spelling, use the suggestion list, or switch to direct Urdu keyboard input for precise characters.', 'English-letter spellings can have more than one Urdu result. Try another spelling, use the suggestion list, or switch to direct Urdu keyboard input for precise characters.'],
  ['Choose the <a href="/">basic editor</a> if you think in Roman Urdu.', 'Choose the <a href="/">basic editor</a> if you prefer typing Urdu with English letters.'],
  ['<summary>Does it work without an internet connection?</summary>\n                    <p>Direct Urdu input, rich editing, local drafts and exports are designed to work in the browser. Roman Urdu transliteration may need an internet connection when Google’s service is unavailable locally.</p>', '<summary>Can I come back to a draft later?</summary>\n                    <p>Yes. Use the draft controls to save a working copy and reopen it when you are ready to continue.</p>'],

  // Forms: one short reassurance plus a Privacy link; vendor details stay in Privacy.
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

const defensiveOutsidePrivacy = [
  /everything runs in (?:this|your) browser/i,
  /stays? (?:on|in) (?:this|your) (?:device|browser)/i,
  /without uploading(?: your writing| the text)?/i,
  /processed in (?:this|your) browser/i,
  /product usage measurement/i,
  /privacy by design/i,
  /native sharing/i,
  /plain-text UTF-8/i,
  /paid API/i,
  /Cloudflare for spam verification/i
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
  const source = fs.readFileSync(filename, 'utf8');
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
  if (relative !== 'write-urdu-privacy.html') {
    for (const rule of defensiveOutsidePrivacy) {
      if (rule.test(source)) {
        console.error(`Defensive/implementation copy belongs in Privacy, found in ${relative}: ${rule}`);
        failed = true;
      }
    }
  }
}

if (failed) process.exit(1);
console.log(`Public product language firewall passed across ${new Set(publicFiles).size} public files.`);
