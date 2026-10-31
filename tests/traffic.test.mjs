import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('the browser icon contains the official KVV mark', async () => {
  const icon = await readFile('dist/icon.svg', 'utf8');
  const logo = await readFile('dist/assets/kvv-logo.svg', 'utf8');
  const officialPath = logo.match(/<path[\s\S]*?\/>/)[0];
  assert.ok(
    icon.replace(/\s+/g, ' ').includes(officialPath.replace(/\s+/g, ' ')),
    'favicon must use the real mark, not an approximation',
  );
});
