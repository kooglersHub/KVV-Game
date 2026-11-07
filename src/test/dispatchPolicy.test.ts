import assert from 'node:assert/strict';
import { test } from 'vitest';
import { GAME_CONFIG } from '../config/game.config';
import type { TrafficSnapshot } from '../systems/DispatchPolicy';
const SPEEDS = GAME_CONFIG.physics.trainSpeedVariants;
import { chooseSpawn } from '../systems/DispatchPolicy';
import { DESTINATIONS } from '../config/network.config';

const train = (
  destination: number,
  speed: number,
  overrides: Partial<TrafficSnapshot> = {},
): TrafficSnapshot => ({
  destination,
  speed,
  track: 'track4',
  x: 500,
  active: true,
  ...overrides,
});

test('a new train never exceeds the slowest visible train for its destination', () => {
  const trains = [train(3, 120), train(3, 80, { active: false })];
  const result = chooseSpawn(trains, 'track1', () => 0.999);
  assert.equal(result.destination, 3);
  assert.equal(result.speed, 120);
  trains[1].active = true;
  // Two visible trains also fill this destination's quota.
  assert.notEqual(chooseSpawn(trains, 'track1', () => 0.999).destination, 3);
});

test('a single slow train caps only its own destination', () => {
  const result = chooseSpawn([train(3, 80)], 'track1', () => 0.999);
  assert.equal(result.destination, 3);
  assert.equal(result.speed, 80);
  const independent = chooseSpawn([train(0, 80)], 'track1', () => 0.999);
  assert.equal(independent.destination, 3);
  assert.equal(independent.speed, 140);
});

test('no more than two visible trains can share a destination, including arrived trains', () => {
  const trains = DESTINATIONS.flatMap((_, index) => [
    train(index, 100),
    train(index, 100, { delivered: true }),
  ]);
  assert.equal(chooseSpawn(trains, 'track1'), null);
  trains[7].active = false;
  assert.equal(chooseSpawn(trains, 'track1', () => 0).destination, 3);
});

test('leaving the map releases the destination quota and its old speed limit', () => {
  const trains = [train(3, 80, { x: 1200 }), train(3, 120, { x: 1200 })];
  assert.equal(chooseSpawn(trains, 'track1', () => 0.999).speed, 140);
});

test('a train near the entry blocks spawning on that track', () => {
  assert.equal(
    chooseSpawn([train(2, 100, { track: 'track1', x: 20 })], 'track1'),
    null,
  );
});

test('a faster train cannot be sent behind a slower one on the same entry track', () => {
  const result = chooseSpawn(
    [train(2, 80, { track: 'track1', x: 700 })],
    'track1',
    () => 0.999,
  );
  assert.equal(result.destination, 3);
  assert.equal(result.speed, 80);
});

test('all four speed variants remain available on an empty map', () => {
  const observed = new Set();
  for (let step = 0; step < 100; step++) {
    observed.add(chooseSpawn([], 'track1', () => step / 100).speed);
  }
  assert.deepEqual(
    [...observed].sort((a, b) => a - b),
    [...SPEEDS],
  );
});

test('every possible choice respects destination capacity and speed limits', () => {
  const trains = [train(1, 80), train(2, 120), train(2, 100), train(3, 100)];
  for (let step = 0; step < 100; step++) {
    const result = chooseSpawn(trains, 'track1', () => step / 100);
    const matching = trains.filter(
      (entry) => entry.destination === result.destination,
    );
    assert.ok(matching.length < 2);
    assert.ok(matching.every((entry) => result.speed <= entry.speed));
  }
});

test('the entry buffer reserves two seconds of braking at the current maximum phase speed', () => {
  // At 80 base speed, 138 body/margin + 128 brake distance needs x >= 166.
  const blocked = [train(2, 80, { track: 'track1', x: 165 })];
  assert.equal(chooseSpawn(blocked, 'track1'), null);
  const clear = [train(2, 80, { track: 'track1', x: 166 })];
  assert.equal(chooseSpawn(clear, 'track1', () => 0)?.speed, 80);
});
