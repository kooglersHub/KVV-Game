import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { after, before, test } from 'node:test';

const origin = 'http://127.0.0.1:49337';
let server;

before(async () => {
  server = spawn(process.execPath, ['scripts/serve.mjs'], {
    env: { ...process.env, PORT: '49337' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server did not start')), 5000);
    server.once('error', reject);
    server.stdout.once('data', () => {
      clearTimeout(timeout);
      resolve();
    });
    server.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Server exited: ${code}`));
    });
  });
});

after(() => server?.kill());

test('page and manifest assets work beneath a GitHub Pages project path', async () => {
  const response = await fetch(origin);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  const html = await response.text();
  const references = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map((match) => match[1]);
  const manifest = JSON.parse(await readFile('dist/manifest.webmanifest', 'utf8'));
  references.push(...manifest.icons.map((icon) => icon.src));
  for (const reference of references) {
    const nested = new URL(reference, 'https://example.com/KVV-Game/');
    assert.equal(nested.origin, 'https://example.com', reference);
    assert.ok(nested.pathname.startsWith('/KVV-Game/'), reference);
    const asset = await fetch(`${origin}/${nested.pathname.slice('/KVV-Game/'.length)}`);
    assert.equal(asset.status, 200, reference);
    assert.ok((await asset.arrayBuffer()).byteLength > 0, reference);
  }
});

test('visitors can zoom the page on smaller displays', async () => {
  const html = await (await fetch(origin)).text();
  assert.doesNotMatch(html, /maximum-scale|user-scalable=no/);
});

test('the browser module graph loads as JavaScript at its relative URLs', async () => {
  const html = await (await fetch(origin)).text();
  const entry = html.match(/<script type="module"[^>]+src="([^"]+)"/)[1];
  const pending = [new URL(entry, origin).href];
  const checked = new Set();
  while (pending.length) {
    const url = pending.pop();
    if (checked.has(url)) continue;
    checked.add(url);
    const response = await fetch(url);
    assert.equal(response.status, 200, url);
    assert.match(response.headers.get('content-type'), /javascript/, url);
    const source = await response.text();
    for (const [, reference] of source.matchAll(/\bfrom\s+['"](\.[^'"]+)['"]/g)) {
      pending.push(new URL(reference, url).href);
    }
  }
  assert.ok(checked.size >= 4, 'game, network, dispatch policy, and train manager loaded');
});

test('missing assets return 404 instead of HTML', async () => {
  assert.equal((await fetch(`${origin}/missing.webp`)).status, 404);
});

test('requests cannot read files outside the website directory', async () => {
  assert.equal((await fetch(`${origin}/%2e%2e%2fREADME.md`)).status, 403);
});
