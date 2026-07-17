/* Small dependency-free static server for local Write Urdu development. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT) || 8787;
const host = process.env.HOST || '127.0.0.1';
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function withinRoot(file) {
  const relative = path.relative(root, file);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

function resolveFile(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, `http://${host}`).pathname);
  const requested = path.resolve(root, `.${pathname}`);
  if (!withinRoot(requested)) return null;
  if (fs.existsSync(requested) && fs.statSync(requested).isFile()) return requested;
  if (!path.extname(requested)) {
    const htmlFile = `${requested}.html`;
    if (fs.existsSync(htmlFile) && fs.statSync(htmlFile).isFile()) return htmlFile;
  }
  if (fs.existsSync(requested) && fs.statSync(requested).isDirectory()) {
    const indexFile = path.join(requested, 'index.html');
    if (fs.existsSync(indexFile)) return indexFile;
  }
  return null;
}

const server = http.createServer((req, res) => {
  const file = resolveFile(req.url || '/');
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  const contentType = types[path.extname(file).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  fs.createReadStream(file).on('error', () => {
    if (!res.headersSent) res.writeHead(500);
    res.end('Unable to read file');
  }).pipe(res);
});

server.listen(port, host, () => {
  console.log(`Write Urdu local server: http://${host}:${port}`);
  console.log('Extensionless routes resolve to their .html files. Press Ctrl+C to stop.');
});
