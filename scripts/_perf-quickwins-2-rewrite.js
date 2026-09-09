const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, source) => fs.writeFileSync(path.join(root, file), source);

function replaceOnce(source, before, after, label) {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  return source.replace(before, after);
}

const corePages = ['index.html', 'urdu/index.html', 'urdu-editor.html', 'urdu/urdu-editor.html'];
const eagerPdf = '<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js" defer></script>\n';
const eagerCanvas = '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" defer></script>\n';

for (const file of corePages) {
  let source = read(file);
  source = replaceOnce(source, eagerPdf, '', `${file} jsPDF tag`);
  source = replaceOnce(source, eagerCanvas, '', `${file} html2canvas tag`);
  write(file, source);
}

let runtime = read('js/site-runtime.js');
runtime = replaceOnce(
  runtime,
  "    var pdfDependencyPromise = null;\n\n    function hasPdfDependency() {",
  "    var pdfDependencyPromise = null;\n    var canvasDependencyPromise = null;\n\n    function hasCanvasDependency() {\n        return typeof window.html2canvas === 'function';\n    }\n\n    function loadCanvasScript(url) {\n        return new Promise(function (resolve, reject) {\n            var script = document.createElement('script');\n            script.src = url;\n            script.async = true;\n            script.onload = function () {\n                if (hasCanvasDependency()) resolve(window.html2canvas);\n                else reject(new Error('The image export library loaded without its html2canvas API.'));\n            };\n            script.onerror = function () { reject(new Error('The image export library could not be loaded.')); };\n            document.head.appendChild(script);\n        });\n    }\n\n    function ensureCanvasDependency() {\n        if (hasCanvasDependency()) return Promise.resolve(window.html2canvas);\n        if (canvasDependencyPromise) return canvasDependencyPromise;\n\n        var sources = [\n            'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',\n            'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'\n        ];\n        function trySource(index) {\n            if (index >= sources.length) return Promise.reject(new Error('Image export dependency is unavailable.'));\n            return loadCanvasScript(sources[index]).catch(function () { return trySource(index + 1); });\n        }\n        canvasDependencyPromise = trySource(0).catch(function (error) {\n            canvasDependencyPromise = null;\n            throw error;\n        });\n        return canvasDependencyPromise;\n    }\n\n    function hasPdfDependency() {",
  'site-runtime canvas lazy-loader insertion'
);
runtime = replaceOnce(
  runtime,
  "        // The page includes the primary URL for normal loads. These lazy\n        // fallbacks handle blocked, offline or failed CDN requests when the\n        // user actually chooses PDF export.\n",
  "        // Load the PDF renderer only when the user actually chooses PDF\n        // export. A second CDN remains a fallback for blocked or failed loads.\n",
  'site-runtime PDF loader comment'
);
runtime = replaceOnce(
  runtime,
  "        if (typeof window.html2canvas !== 'function') throw new Error('Image export dependency is unavailable.');\n        var surface = createExportSurface(source, options || {});",
  "        await ensureCanvasDependency();\n        var surface = createExportSurface(source, options || {});",
  'site-runtime renderCanvas dependency gate'
);
write('js/site-runtime.js', runtime);

console.log('Applied quick-win lazy export dependency rewrite.');
