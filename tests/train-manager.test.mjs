import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createTrainManager } from '../dist/game/train-manager.js';
import { DESTINATIONS } from '../dist/game/network.js';

// Phaser owns movement and bodies. These small engine stand-ins keep the real
// scheduling, quota reservation, and dispatch policy under test.
class TrainBody {
  constructor(scene, x, track, speed) {
    Object.assign(this, { x, track, speed, active: true, data: new Map() });
  }
  setData(key, value) { this.data.set(key, value); }
  getData(key) { return this.data.get(key); }
  getCurrentTrack() { return this.track; }
  getSpeed() { return this.speed; }
  isOffScreen() { return this.x > 1114; }
  updateSpeedMultiplier(multiplier) { this.actualSpeed = this.speed * multiplier; }
  update() {}
  pause() { this.paused = true; }
  resume() { this.paused = false; }
  destroy() { this.active = false; }
}

function createManager() {
  const timers = [];
  const group = new Set();
  const scene = {
    physics: { add: { group: () => ({
      add: (train) => group.add(train), remove: (train) => group.delete(train),
      clear: () => group.clear(),
    }) } },
    time: { addEvent: (settings) => {
      const timer = { ...settings, destroyed: false, destroy() { this.destroyed = true; } };
      timers.push(timer);
      return timer;
    } },
  };
  const TrainManager = createTrainManager(TrainBody);
  return { manager: new TrainManager(scene), timers, group };
}

test('destination reservations and speed limits hold across consecutive spawn attempts', () => {
  const { manager } = createManager();
  for (let step = 0; step < 400; step++) {
    const previous = [...manager.getTrains()];
    manager.spawnTrain();
    for (const train of manager.getTrains().filter((candidate) => !previous.includes(candidate))) {
      const target = train.getData('destination');
      assert.ok(Number.isInteger(target) && DESTINATIONS[target], 'destination reserved immediately');
      const matching = previous.filter((candidate) => candidate.getData('destination') === target);
      assert.ok(matching.length < 2);
      assert.ok(matching.every((candidate) => train.speed <= candidate.speed));
      assert.notEqual(DESTINATIONS[target].track, train.track, 'a route change is required');
    }
    for (const train of manager.getTrains()) train.x += 50;
    manager.update();
  }
});

test('visible arrived trains retain their quota until they leave the map', () => {
  const { manager, group } = createManager();
  for (const [destination, stop] of DESTINATIONS.entries()) {
    for (let index = 0; index < 2; index++) {
      const train = new TrainBody(null, 900, stop.track, 100);
      train.setData('destination', destination);
      train.setData('scored', true);
      manager.trains.push(train);
      group.add(train);
    }
  }
  manager.spawnTrain();
  assert.equal(manager.getTrains().length, 8);
  manager.trains[0].x = 1200;
  manager.update();
  assert.equal(group.size, 7);
  manager.spawnTrain();
  assert.equal(manager.getTrains().length, 8);
  assert.equal(manager.getTrains().at(-1).getData('destination'), 0);
});

test('phase changes use original speeds and replace rather than duplicate spawn timers', () => {
  const { manager, timers } = createManager();
  manager.startSpawning(4400);
  assert.equal(manager.getTrains().length, 1);
  const train = manager.getTrains()[0];
  manager.updateSpeedMultiplier(0.8);
  assert.equal(train.actualSpeed, train.speed * 0.8);
  manager.updateSpeedMultiplier(1.15);
  assert.equal(train.actualSpeed, train.speed * 1.15);
  manager.updateSpawnInterval(2200);
  manager.updateSpawnInterval(2200);
  assert.equal(timers.length, 2);
  assert.ok(timers[0].destroyed);
  manager.clear();
  assert.ok(timers[1].destroyed);
  assert.equal(manager.getTrains().length, 0);
});
