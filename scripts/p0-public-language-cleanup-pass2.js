#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const replacements = [
  // Homepage: remove browser/local architecture and privacy pitch from the product story.
  ['<li>No Urdu keyboard software is required; everything runs in your browser.</li>', '<li>No Urdu keyboard software is required; start typing directly on the page.</li>'],
  ['Type Urdu directly in the browser with an on-screen keyboard and share-ready text.', 'Type Urdu directly with an on-screen keyboard and get text ready to copy or share.'],
  ['<h3><a href="/qr-code-generator" data-wu-l10n="home.grid6Title">Static QR Code Generator</a></h3><p data-wu-l10n="home.grid6Copy">Encode Urdu text, links, Wi-Fi, WhatsApp and contacts locally as PNG or SVG.</p>', '<h3><a href="/qr-code-generator" data-wu-l10n="home.grid6Title">QR Code Generator</a></h3><p data-wu-l10n="home.grid6Copy">Create QR codes for Urdu text, links, Wi-Fi, WhatsApp and contacts, then download PNG or SVG.</p>'],
  ['<h3 data-wu-l10n="home.handlesTitle">How Write Urdu handles your work</h3>\n                <p data-wu-l10n="home.handlesCopy">Drafts, card backgrounds and QR details stay available while you work. English-to-Urdu word suggestions may use the typing service described in the <a href="/write-urdu-privacy">privacy policy</a>. Review suggestions before sharing important writing.</p>', '<h3 data-wu-l10n="home.handlesTitle">Take your Urdu to the next step</h3>\n                <p data-wu-l10n="home.handlesCopy">Review your writing, then copy it, download it, format a document, create a card or continue into another Write Urdu tool.</p>'],

  // Feedback: form UI should explain the task, not the delivery infrastructure.
  ['Loading privacy-friendly spam protection…', 'Loading spam protection…'],
  ['Submitting sends only these form fields through Cloudflare for spam verification and product improvement. It does not send editor drafts, local images or locally stored projects. Read <a href="/write-urdu-privacy#contact-feedback-data">how feedback data is handled</a>.', 'We only receive the information you enter in this form. Read <a href="/write-urdu-privacy#contact-feedback-data">Privacy</a> for details.'],
  ['Use the contact page for technical questions, privacy requests, accessibility problems or anything that needs a direct response.', 'Use the contact page for product questions, privacy requests, accessibility problems or anything that needs a direct response.'],

  // Sharing guide: explain publishing as a user action, not storage architecture.
  ['<p>Publishing is separate from downloading. Nothing is uploaded merely because you design a card or save a PNG.</p>', '<p>Downloading gives you an image file. Publishing creates a public Write Urdu link for the version you choose.</p>'],
  ['The published version is separate from your editable project on this device.', 'The published version is separate from the card you continue editing.'],
  ['Use Copy link or the device Share action.', 'Use Copy link or Share.'],
  ['<h3>Stays on your device by default</h3><p>Your other Card Studio projects, draft history and original locally selected image remain on this device. Downloading or image-only sharing does not create a public page.</p>', '<h3>Not included in the public link</h3><p>Your other Card Studio projects, draft history and original source image are not part of the published link. Downloading or sharing an image file does not create a public page.</p>'],
  ['<h2 id="privacy-title">What stays local and what becomes public?</h2>', '<h2 id="privacy-title">What becomes public when you publish?</h2>'],
  ['Your normal Card Studio work stays available while you work. Only the version you explicitly choose to publish is uploaded and made available through the public link.', 'Only the version you explicitly choose with <strong>Publish &amp; Share</strong> becomes available through the public link.'],
  ['<h3>Does Write Urdu upload everything I type?</h3><p>No. Normal writing and Card Studio work stay local. Uploading happens only when you explicitly publish the selected version.</p>', '<h3>What becomes public when I publish?</h3><p>The selected card image, public Urdu text and any attribution you enabled become part of that public share.</p>'],
  ['<h3>Type Roman Urdu</h3><p>Start in the main editor when you need to turn Roman Urdu into Urdu script before designing.</p>', '<h3>Type Urdu with English letters</h3><p>Start in the main editor when you want to type Urdu words with English letters before designing.</p>'],
  ['Your normal project stays local until you choose to publish the finished version.', 'Choose <strong>Publish &amp; Share</strong> only when the finished version is ready to become public.'],

  // Card Studio: turn privacy/status notes into direct design and publishing guidance.
  ['Your text and background stay available while you work while you design.', 'Choose a background image, then adjust its fit, position and overlay.'],
  ['Your text and images stay available while you work until you choose Publish &amp; Share.', 'Download the finished image, or choose Publish &amp; Share when you want a public link.'],
  ['Write Urdu does not post to WhatsApp or Instagram. Download the image and upload it manually from your device.', 'Download the image, then upload it to WhatsApp or Instagram when you are ready.'],

  // FAQ: answer user questions without privacy/implementation jargon.
  ['Clear answers about typing Urdu with English letters, privacy, downloads and Urdu script.', 'Clear answers about typing Urdu with English letters, downloads, Write Urdu tools and Urdu script.'],
  ['>Roman Urdu guide<', '>English to Urdu typing guide<'],
  ['Start with Roman Urdu in the basic editor, or choose the on-screen keyboard for direct character input.', 'Type Urdu with English letters in the basic editor, or choose the on-screen keyboard for direct character input.'],
  ['<h2 id="faq-product-title" data-wu-l10n="urdu-faq.productTitle">Tools, privacy and exports</h2>', '<h2 id="faq-product-title" data-wu-l10n="urdu-faq.productTitle">Tools, drafts and exports</h2>'],
  ['Short answers about writing, saving, downloading, creating and privacy.', 'Short answers about writing, saving, downloading and creating.'],
  ['Yes. The public tools are free to use and no account is required. Local drafts are optional and stay in this browser.', 'Yes. The public tools are free to use and no account is required. You can also save a working draft when you want to continue later.'],
  ['Is Roman Urdu transliteration the same as translation?', 'Does typing Urdu with English letters translate my sentence?'],
  ['No. Transliteration changes Roman Urdu input into Urdu script. It does not translate the meaning from one language to another, so review suggestions before sharing.', 'No. You enter the Urdu words you want using English letters, and Write Urdu writes those words in Urdu script. It does not translate an English sentence into Urdu.'],
  ['<summary data-wu-l10n="urdu-faq.q4">Does Write Urdu track QR scans?</summary>\n                    <p data-wu-l10n="urdu-faq.a4">No. The QR code opens your content directly. WriteUrdu does not add a redirect or track scans.</p>', '<summary data-wu-l10n="urdu-faq.q4">What can I put in a QR code?</summary>\n                    <p data-wu-l10n="urdu-faq.a4">You can create a QR code for Urdu text, a website link, Wi-Fi details, WhatsApp, email, phone, contact details or a location.</p>'],
  ['Yes. The keyboard, editors, Card Studio and QR Generator adapt to mobile browsers. Some export and sharing options depend on browser support.', 'Yes. The keyboard, editors, Card Studio and QR Generator are designed for phones as well as larger screens. Available sharing options can vary by device.'],
  ['Type naturally in Roman Urdu and let the editor convert each word as you go.', 'Type Urdu words with English letters and let the editor write each word in Urdu script as you go.'],

  // Name Art: remove handoff expiry/storage details and technical input terminology.
  ['local backgrounds and PNG or transparent PNG export', 'custom backgrounds and PNG or transparent PNG download'],
  ['Local backgrounds and PNG or transparent PNG export', 'Custom backgrounds and PNG or transparent PNG download'],
  ['"name":"Does this use the Stylish Urdu Text result?","acceptedAnswer":{"@type":"Answer","text":"Yes. When you open Name Art from Stylish Urdu Text, your selected wording follows in this browser. It is never placed in the page address, expires after 30 minutes and is removed after it opens."}', '"name":"Can I bring text from Stylish Urdu Text?","acceptedAnswer":{"@type":"Answer","text":"Yes. Open Name Art from Stylish Urdu Text and your selected wording appears ready to design."}'],
  ['"name":"Are uploaded images private?","acceptedAnswer":{"@type":"Answer","text":"Yes. Background images stay available while you work while you design and are not sent to Write Urdu or an image service. See the privacy policy for details about the separate English-to-Urdu typing service."}', '"name":"Can I use my own background image?","acceptedAnswer":{"@type":"Answer","text":"Yes. Choose a JPG, PNG or WebP background, then adjust the fit, position and overlay before downloading your design."}'],
  ['download the finished PNG from your browser.', 'download the finished PNG.'],
  ['Use Urdu directly, or type Roman Urdu and convert the sounds into Urdu script before you design.', 'Type Urdu directly, or type the name with English letters and convert it to Urdu script before you design.'],
  ['>Convert Roman Urdu<', '>Convert to Urdu<'],
  ['Transliteration changes sounds into Urdu script; it does not translate English meaning.', 'This writes the Urdu name in Urdu script; it does not translate English meaning.'],
  ['<p class="name-art-local-note"><strong>Private by default.</strong> Templates, text, local backgrounds and exported images stay in this browser unless you choose to share them.</p>', '<p class="name-art-local-note"><strong>Ready when you are.</strong> Download the finished design as a PNG or transparent PNG.</p>'],

  // Features: describe capabilities, not encoding/storage/server/browser implementation.
  ['Turn a Roman Urdu draft into useful Urdu text, keep local copies while you work, and choose the right export or sharing option when the writing is ready.', 'Type Urdu with English letters, save working drafts, and choose the right download or sharing option when the writing is ready.'],
  ['<li>Local drafts and recent history</li>', '<li>Saved drafts and recent history</li>'],
  ['<li>Copy, print and device sharing</li>', '<li>Copy, print and sharing</li>'],
  ['Use <strong>Copy text</strong> for the fastest handoff, save a UTF-8 text file for portability, or export a polished document from the rich editor. Draft recovery and import tools stay in your browser, so you can continue working without creating an account.', 'Use <strong>Copy text</strong> for the fastest handoff, save a text file for portability, or export a polished document from the rich editor. Draft recovery and import tools help you continue without starting over.'],
  ['A UTF-8 text file is small, reliable and easy to open in Notepad, TextEdit or another editor.', 'A text file is small, reliable and easy to open in Notepad, TextEdit or another editor.'],
  ['<p class="reference-section-label">LOCAL WORKFLOW</p>', '<p class="reference-section-label">DRAFT TOOLS</p>'],
  ['<h3>Recover local drafts</h3>', '<h3>Recover saved drafts</h3>'],
  ['The editors can keep recent working copies in this browser. No account or server-side document library is required.', 'Use Recent drafts to return to a working copy, restore an earlier version, rename it or clear it when you no longer need it.'],
  ['clear the local history', 'clear the draft history'],
  ['Use <strong>Import text</strong> to bring a UTF-8 plain-text file into the editor. The file is read locally and can then be converted, formatted, copied or exported normally.', 'Use <strong>Import text</strong> to bring a plain-text file into the editor, then continue writing, formatting, copying or downloading it.'],
  ['<h3>Share from your device</h3>', '<h3>Share your writing</h3>'],
  ['The Share action uses the browser or device sharing flow when available. Review the text and choose the destination yourself; Write Urdu does not post on your behalf.', 'Choose <strong>Share</strong> to send your writing through the apps available on your phone or computer. Review the text, then choose where you want to send it.'],

  // Sitemap: directory labels should match user vocabulary.
  ['Type Roman Urdu, enter Urdu directly, speak, bring text in from a screenshot or photo, convert older InPage text, or format a longer document.', 'Type Urdu with English letters, enter Urdu directly, speak, bring text in from a screenshot or photo, convert older InPage text, or format a longer document.'],
  ['<span class="sitemap-directory-card-kicker">Roman Urdu typing</span>', '<span class="sitemap-directory-card-kicker">English letters → Urdu</span>'],
  ['Type familiar English letters and convert completed Roman Urdu words into Urdu script.', 'Type familiar English letters and turn each completed Urdu word into Urdu script.'],
  ['Convert supported pasted Urdu text between older InPage text and modern Unicode without uploading your writing.', 'Convert supported pasted Urdu text between older InPage text and modern Unicode.'],
  ['Follow the Write Urdu workflow from Roman Urdu input through suggestions, editing and export.', 'Follow the Write Urdu workflow from English-letter input through suggestions, editing and download.'],
  ['Review Urdu letters and their forms in a clear browser reference designed for learners and writers.', 'Review Urdu letters and their forms in a clear reference designed for learners and writers.'],

  // Documentation: remove one remaining specialist term from a user shortcut label.
  ['Commit the current transliterated word', 'Write the current word in Urdu script'],

  // Privacy: disclose material handling without publishing internal telemetry/storage mechanics.
  ['Write Urdu Privacy Policy – Local Storage, Public Shares and Services', 'Write Urdu Privacy Policy – Writing, Accounts and Public Shares'],
  ['Understand how Write Urdu handles local drafts, Urdu voice typing, optional public share links, English-to-Urdu typing suggestions, basic usage analytics, ads and feedback.', 'Understand how Write Urdu handles saved drafts, voice typing, public share links, English-to-Urdu typing suggestions, accounts, analytics, ads and feedback.'],
  ['Understand how Write Urdu handles local drafts, voice typing, optional public share links, English-to-Urdu typing suggestions, basic usage analytics, ads and feedback.', 'Understand how Write Urdu handles saved drafts, voice typing, public share links, English-to-Urdu typing suggestions, accounts, analytics, ads and feedback.'],
  ['Write Urdu is a free collection of Urdu writing tools. Most creative work stays on your device; this page also explains the explicit public-publishing feature and the services that may receive information.', 'This policy explains what happens to writing, saved drafts, voice input, public shares, accounts, analytics, ads and messages you send to Write Urdu.'],
  ['<strong>Most creative work stays in your browser.</strong>', '<strong>Your data use depends on the feature you choose.</strong>'],
  ['<li>Local drafts and supported creative projects use browser storage.</li>', '<li>Saved drafts and supported creative projects can be kept so you can return to them later.</li>'],
  ['<li>Roman Urdu transliteration may send submitted text to Google’s transliteration service.</li>', '<li>English-to-Urdu typing suggestions may send the words or passages you submit to Google’s typing service.</li>'],
  ['<li>Basic usage analytics record actions such as which tool was used and broad arrival sources, never the Urdu or English-letter text you write or the ID of a public share.</li>', '<li>Basic usage analytics help us understand which tools and actions are used. The writing itself is not included in those analytics.</li>'],
  ['Write Urdu may process the action type, page or tool, broad text-length and active-time ranges, input method, export format, device type and a temporary identifier for the current browser tab. Usage analytics group individual public-share pages together and do not send the share ID. Written text, filenames, clipboard contents, email, full referring URLs, campaign values and full browser-identification strings are not included. The recorded arrival source does not add an identifier that follows you across visits.', 'Usage analytics may include the page or tool used, the action taken, broad usage ranges, input method, download format, device type and a short-lived session identifier. The Urdu or English-letter writing itself, filenames, clipboard contents, email addresses and individual public-share IDs are not included.'],
  ['The rendered PNG, public Urdu text, optional enabled attribution, tool and size information, a random share identifier, information needed to verify deletion access and limited moderation/operations data are stored using Write Urdu\'s Cloudflare services. If a local photo appears in the rendered card, it is naturally visible inside the uploaded published PNG; the original local source file and unrelated drafts are not uploaded as separate assets. A parent-share relationship may be stored when a recipient creates and publishes a new share so aggregate reuse can be counted without linking that relationship to a visitor profile.', 'The published card image, public Urdu text, optional attribution and information needed to operate and moderate the share are stored so the public link can work. If your chosen photo appears in the published card, it is visible in that published image. Unrelated drafts are not part of the share.'],
  ['The browser that publishes a share keeps a private deletion key. The key is not placed in the public URL, and Write Urdu stores only a protected verification value rather than the key itself. While the key remains in that browser, the publisher can delete the public link from Card Studio. Clearing browser/site storage may remove this self-service deletion access and does not, by itself, delete an already-published public share.', 'Card Studio keeps the access needed to manage a link you publish. If you clear site data or move to another device, self-service deletion may no longer be available. Clearing site data does not itself delete an already-published public share.']
];

let changed = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'specs', 'docs', 'skills', '.claude', 'tests', 'os'].includes(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(absolute);
      continue;
    }
    if (!/\.html$/i.test(entry.name)) continue;
    const source = fs.readFileSync(absolute, 'utf8');
    let next = source;
    for (const [from, to] of replacements) next = next.split(from).join(to);
    if (next !== source) {
      fs.writeFileSync(absolute, next, 'utf8');
      changed += 1;
      console.log('Refined public copy in ' + path.relative(root, absolute));
    }
  }
}
walk(root);
console.log(`Final P0 language pass updated ${changed} public file(s).`);
