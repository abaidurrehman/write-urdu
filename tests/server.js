const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png'
};

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  let requested = pathname === '/' ? '/index.html' : pathname;
  const extensionlessFile = path.resolve(root, '.' + requested + '.html');
  if (requested !== '/' && !path.extname(requested) && fs.existsSync(extensionlessFile)) {
    requested += '.html';
  }
  const filename = path.resolve(root, '.' + requested);
  if (!filename.startsWith(root + path.sep)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  fs.readFile(filename, (error, data) => {
    if (error) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.setHeader('Content-Type', types[path.extname(filename)] || 'application/octet-stream');
    response.setHeader('Content-Length', data.length);
    response.setHeader('Cache-Control', 'no-store');
    response.end(data);
  });
}).listen(Number(process.env.PORT || 8765), '127.0.0.1');
