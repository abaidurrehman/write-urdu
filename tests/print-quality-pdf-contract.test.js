const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const runtime = read('js/site-runtime.js');
assert.match(runtime, /function printDocument\(source, options\)/, 'The shared runtime must provide a real-text print route');
assert.match(runtime, /printDocument: printDocument,/, 'printDocument must be exported on WriteUrduExport');
assert.match(runtime, /<div class="wu-print-body">' \+ body/, 'The print route must lay out text, not an image of it');
assert.match(runtime, /"Noto Nastaliq Urdu","Noto Naskh Arabic"/, 'The print route must use the Urdu document fonts');
assert.match(runtime, /frameDoc\.fonts && frameDoc\.fonts\.ready/, 'The print route must wait for fonts before opening the dialog');

for (const page of ['index.html', 'urdu/index.html', 'urdu-editor.html', 'urdu/urdu-editor.html']) {
  const html = read(page);
  assert.match(html, /id="exportPdf" onclick="DownloadAsPdf\(\)"/, page + ' must keep the direct PDF download');
  assert.match(html, /id="exportPdfPrint" onclick="DownloadAsPrintPdf\(\)"/, page + ' must offer the print-quality PDF');
  assert.match(html, /WriteUrduExport\.printDocument\(/, page + ' must use the shared print route');
}

const toolbar = read('js/basic-writer-command-toolbar.js');
assert.match(toolbar, /\[pdf, pdfPrint, word, png, svg\]/, 'The Basic Writer download menu must list the print-quality PDF');

assert.match(read('urdu-bill-generator.html'), /data-bill-pdf-print/, 'The bill generator must offer a print-quality PDF');
assert.match(read('js/bill-generator.js'), /pdfPrintButton\.addEventListener\('click'[\s\S]*?window\.print\(\);/, 'The bill print-quality PDF must use the browser print engine');

console.log('Print-quality PDF contract passed.');
