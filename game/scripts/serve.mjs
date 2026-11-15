import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import { dirname, extname, resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '../..'));
const port = Number(process.env.PORT ?? 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'], ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'], ['.avif', 'image/avif'], ['.ico', 'image/x-icon'],
  ['.woff2', 'font/woff2'], ['.woff', 'font/woff'], ['.ttf', 'font/ttf'],
  ['.pdf', 'application/pdf'], ['.mp3', 'audio/mpeg'], ['.ogg', 'audio/ogg'],
  ['.wav', 'audio/wav'], ['.xml', 'application/xml; charset=utf-8'],
]);

function isWithinRoot(path) {
  const child = relative(root, path);
  return child !== '..' && !child.startsWith(`..${sep}`) && !isAbsolute(child);
}

function sendError(response, status, text) {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(text);
}

const server = createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    sendError(response, 405, 'Method not allowed');
    return;
  }

  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    if (/[\u0000-\u001f\u007f]/u.test(pathname) || pathname.includes('\\') || pathname.includes(':') || pathname.split('/').some(part => part.startsWith('.'))) {
      sendError(response, 403, 'Forbidden');
      return;
    }

    let filePath = resolve(root, `.${pathname}`);
    if (!isWithinRoot(filePath)) {
      sendError(response, 403, 'Forbidden');
      return;
    }

    let fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      if (!pathname.endsWith('/')) {
        const canonicalPath = encodeURI(pathname.replace(/^\/+/, '/'));
        response.writeHead(301, { Location: `${canonicalPath}/${new URL(request.url ?? '/', 'http://localhost').search}` });
        response.end();
        return;
      }
      filePath = resolve(filePath, 'index.html');
      fileStat = await stat(filePath);
    }
    filePath = await realpath(filePath);
    if (!isWithinRoot(filePath) || !fileStat.isFile()) {
      sendError(response, 403, 'Forbidden');
      return;
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes.get(extname(filePath).toLowerCase()) ?? 'application/octet-stream',
      'Content-Length': fileStat.size,
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    const stream = createReadStream(filePath);
    stream.on('error', () => response.destroy());
    response.on('close', () => stream.destroy());
    stream.pipe(response);
  } catch (error) {
    if (error instanceof URIError || error instanceof TypeError) {
      sendError(response, 400, 'Bad request');
    } else if (error && typeof error === 'object' && 'code' in error && (error.code === 'ENOENT' || error.code === 'ENOTDIR')) {
      sendError(response, 404, 'File not found');
    } else {
      sendError(response, 500, 'Unable to read file');
    }
  }
});

server.on('error', (error) => {
  process.stderr.write(`Preview server could not start: ${error.message}\n`);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Portfolio preview: http://127.0.0.1:${port}/index.html\nCareer Drive preview: http://127.0.0.1:${port}/game/index.html?lang=pl\n`);
});
