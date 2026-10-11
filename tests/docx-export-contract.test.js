const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const root = path.resolve(__dirname, '..');
const docx = require('../js/docx-export.js');

assert.equal(docx.crc32(Buffer.from('123456789')), 0xcbf43926, 'CRC-32 must match the standard check value');
assert.equal(docx.MIME, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

const buffer = Buffer.concat(docx.buildParts('سلام دنیا\nsecond & <line>').map((part) => Buffer.from(part)));
assert.equal(buffer.readUInt32LE(0), 0x04034b50, 'package must start with a ZIP local header');
const endOffset = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
assert.ok(endOffset > 0, 'package must end with a ZIP end-of-central-directory record');
const entries = buffer.readUInt16LE(endOffset + 10);
assert.equal(entries, 5, 'package must hold the five OOXML parts');

let cursor = buffer.readUInt32LE(endOffset + 16);
const names = {};
for (let i = 0; i < entries; i += 1) {
    assert.equal(buffer.readUInt32LE(cursor), 0x02014b50);
    const crc = buffer.readUInt32LE(cursor + 16);
    const size = buffer.readUInt32LE(cursor + 24);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const local = buffer.readUInt32LE(cursor + 42);
    const name = buffer.slice(cursor + 46, cursor + 46 + nameLength).toString('utf8');
    const dataStart = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
    const data = buffer.slice(dataStart, dataStart + size);
    assert.equal(zlib.crc32 ? zlib.crc32(data) : crc, crc, `${name} CRC must match its data`);
    names[name] = data.toString('utf8');
    cursor += 46 + nameLength;
}

['[Content_Types].xml', '_rels/.rels', 'word/document.xml', 'word/_rels/document.xml.rels', 'word/styles.xml'].forEach((name) => {
    assert.ok(names[name], `${name} must be present`);
});
const body = names['word/document.xml'];
assert.match(body, /<w:bidi\/>/, 'paragraphs must be right-to-left');
assert.match(body, /<w:rtl\/>/, 'runs must be flagged right-to-left');
assert.match(body, /Noto Nastaliq Urdu/, 'Urdu font must be set');
assert.match(body, /سلام دنیا/, 'Urdu text must be kept as real text');
assert.match(body, /second &amp; &lt;line&gt;/, 'text must be XML escaped');
assert.match(body, /Generated with Write Urdu/, 'footer credit must be kept');

const runtime = fs.readFileSync(path.join(root, 'js/site-runtime.js'), 'utf8');
assert.match(runtime, /\.docx'/, 'Word export must download a .docx file');
assert.match(runtime, /WriteUrduDocx/, 'Word export must use the .docx builder');
assert.match(runtime, /\.doc'\);/, 'legacy .doc fallback must remain if the builder is unavailable');

['index.html', 'urdu-editor.html', 'urdu/index.html', 'urdu/urdu-editor.html'].forEach((page) => {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.match(html, /js\/docx-export\.js/, `${page} must load the .docx builder`);
});
assert.match(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), /docx-export\.js/, 'service worker must precache the builder');

console.log('docx export contract passed');
