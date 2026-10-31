import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';

// The supplied archive has no TypeScript sources. Exercise the shipped classes
// without booting Phaser; only the engine boundary (physics group) is replaced.
const html = await readFile('dist/index.html', 'utf8');
const entry = html.match(/<script type="module"[^>]+src="\.\/([^"?]+)/)[1];
const bundle = await readFile(`dist/${entry}`, 'utf8');
const configSource = bundle.match(/ct=(\{width:1024[\s\S]+?);function ae/)[1];
const config = runInNewContext(`(${configSource})`);
const managerSource = bundle.slice(bundle.indexOf('class he{'), bundle.indexOf('class le{'));
let randomValue = 0;
const controlledMath = Object.create(Math);
controlledMath.random = () => randomValue;
const TrainManager = runInNewContext(`${managerSource}; he`, {
  ct: config,
  Math: controlledMath,
  console,
  ot: (object, key, value) => { object[key] = value; },
});

function createManager(withLayout = true) {
  const manager = new TrainManager({ physics: { add: { group: () => ({}) } } });
  if (withLayout) {
    manager.setGeneratedLayout({
      connections: [{ source: 'track2', target: 'track3', x: 180 }],
      stops: { durlach: { track: 'track2', x: 850, duration: 1700 } },
    });
  }
  return manager;
}

test('a later train cannot randomly spawn faster than its predecessor', () => {
  const manager = createManager();
  randomValue = 0;
  const first = manager.findSafeSpawnForTrack('track2');
  manager.trains = [{ x: 900, getCurrentTrack: () => 'track2', getSpeed: () => first.speed }];
  randomValue = 0.999;
  const following = manager.findSafeSpawnForTrack('track2');
  assert.ok(following, 'there is enough distance for another train');
  assert.ok(following.speed <= first.speed, `${following.speed} must not exceed ${first.speed}`);
});

test('trains for different tracks have the same base speed before they merge', () => {
  const manager = createManager(false);
  randomValue = 0;
  const first = manager.findSafeSpawnForTrack('track2');
  randomValue = 0.999;
  const second = manager.findSafeSpawnForTrack('track3');
  assert.equal(second.speed, first.speed);
  assert.equal(first.speed, config.physics.trainSpeed);
});

test('a nearby train still prevents a new spawn', () => {
  const manager = createManager();
  manager.trains = [{ x: 30, getCurrentTrack: () => 'track2', getSpeed: () => 100 }];
  assert.equal(manager.findSafeSpawnForTrack('track2'), null);
});

test('the browser icon contains the official KVV mark', async () => {
  const icon = await readFile('dist/icon.svg', 'utf8');
  const logo = await readFile('dist/assets/kvv-logo.svg', 'utf8');
  const officialPath = logo.match(/<path[\s\S]*?\/>/)[0];
  assert.ok(
    icon.replace(/\s+/g, ' ').includes(officialPath.replace(/\s+/g, ' ')),
    'favicon must use the real mark, not an approximation',
  );
});
