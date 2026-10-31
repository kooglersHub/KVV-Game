import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve('dist');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
};
const port = Number(process.env.PORT || 3000);
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, 'http://localhost').pathname,
    );
    const file = resolve(
      root,
      '.' + (pathname === '/' ? '/index.html' : pathname),
    );
    if (!file.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    const body = await readFile(file);
    response.writeHead(200, {
      'Content-Type': types[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    response.end(body);
  } catch (error) {
    response
      .writeHead(error.code === 'ENOENT' ? 404 : 500)
      .end('Datei nicht verfügbar');
  }
}).listen(port, '127.0.0.1', () =>
  console.log(`KVV Weichenheld: http://localhost:${port}`),
);
