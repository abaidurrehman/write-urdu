const assert = require('assert');
const fs = require('fs');
const path = require('path');
const local = require('../js/roman-urdu-local.js');

// Common words come from the word list, including everyday spelling variants.
assert.equal(local.transliterateText('mera naam ahmed hai'), 'میرا نام احمد ہے');
assert.equal(local.transliterateText('bohat shukriya'), 'بہت شکریہ');
assert.equal(local.transliterateText('kese ho'), 'کیسے ہو');
assert.equal(local.transliterateWord('Lahore'), 'لاہور', 'Capitalised names still convert');

// Words outside the list are spelled out by the phonetic rules.
assert.equal(local.transliterateWord('insaan'), 'انسان');
assert.equal(local.transliterateWord('zameen'), 'زمین');
assert.equal(local.transliterateWord('pakka'), 'پکا', 'Doubled consonants are written once');
assert.equal(local.transliterateWord('baaton'), 'باتوں', 'The -on plural ending becomes وں');
assert.equal(local.transliterateWord('bhejein'), 'بھیجیں', 'The -ein ending becomes یں');
assert.equal(local.transliterateWord('aisa'), 'ایسا');

// Values that must stay exactly as typed.
['PKR', 'IBAN', 'WhatsApp', 'iPhone', 'ok', 'kg', 'INV2026'].forEach((word) => {
  assert.equal(local.transliterateWord(word), word, word + ' is kept as typed');
});
assert.equal(local.transliterateText('ali.khan@example.com par bhejo'), 'ali.khan@example.com پر بھیجو', 'Emails are kept');
assert.equal(local.transliterateText('https://write-urdu.com dekho'), 'https://write-urdu.com دیکھو', 'Links are kept');
assert.equal(local.transliterateText('2 kg aam'), '2 kg عام', 'Numbers and units are kept');
assert.equal(local.transliterateText('kya hua?'), 'کیا ہوا؟', 'A question mark after an Urdu word becomes ؟');
assert.equal(local.transliterateText('میرا نام'), 'میرا نام', 'Urdu text is left unchanged');

// The converter must never reach the network: typing stays on the device.
const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'roman-urdu-local.js'), 'utf8');
assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|sendBeacon|https?:\/\/(?!write-urdu)/, 'The on-device converter must not contact any server');
assert.ok(local.size() > 900, 'The word list covers everyday and invoice vocabulary');

// The invoice uses it by default and loads Google Input Tools only on request.
const invoiceUi = fs.readFileSync(path.join(__dirname, '..', 'js', 'invoice-generator.js'), 'utf8');
assert.match(invoiceUi, /if \(!force && romanLocal && romanEngine\(\) === 'local'\) return;/, 'Google Input Tools must not load unless the person turns it on');
const invoiceHtml = fs.readFileSync(path.join(__dirname, '..', 'urdu-invoice-generator.html'), 'utf8');
assert.match(invoiceHtml, /js\/roman-urdu-local\.js/, 'The invoice page must load the on-device converter');
assert.match(invoiceHtml, /data-invoice-google-typing[^>]*>[^<]*<span>[^<]*<span class="inv-opt">sends each word you type to Google/, 'The Google option must say that it sends words to Google');

console.log('On-device Roman Urdu converter tests passed.');
