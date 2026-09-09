const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corePages = ['index.html', 'urdu/index.html', 'urdu-editor.html', 'urdu/urdu-editor.html'];
const runtime = read('js/site-runtime.js');
const invoice = read('urdu-invoice-generator.html');

for (const file of corePages) {
  const source = read(file);
  assert.doesNotMatch(source, /<script[^>]+jspdf(?:@|\/)[^>]+><\/script>/i, `${file} must not eagerly load jsPDF`);
  assert.doesNotMatch(source, /<script[^>]+html2canvas[^>]+><\/script>/i, `${file} must not eagerly load html2canvas`);
}

assert.match(runtime, /function ensurePdfDependency\(\)/, 'Shared runtime must lazily load jsPDF for PDF export');
assert.match(runtime, /function ensureCanvasDependency\(\)/, 'Shared runtime must lazily load html2canvas for image/PDF export');
assert.match(runtime, /jspdf@2\.5\.2\/dist\/jspdf\.umd\.min\.js/, 'Shared runtime must retain the primary jsPDF source');
assert.match(runtime, /html2canvas\/1\.4\.1\/html2canvas\.min\.js/, 'Shared runtime must retain an html2canvas source');
assert.match(runtime, /async function renderCanvas[\s\S]*await ensureCanvasDependency\(\)/, 'Canvas rendering must await the lazy html2canvas dependency');

// The invoice generator owns a separate export implementation. Keep it out of
// this low-risk writer-page optimization until its export path is migrated and
// tested independently.
assert.match(invoice, /jspdf@2\.5\.2/, 'Invoice generator jsPDF loading changed outside this slice');
assert.match(invoice, /html2canvas\/1\.4\.1/, 'Invoice generator html2canvas loading changed outside this slice');

console.log('Lazy export dependency contract passed.');
