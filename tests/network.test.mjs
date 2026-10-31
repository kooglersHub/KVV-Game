import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLayout, DESTINATIONS, TRACKS, TRACK_Y } from '../dist/game/network.js';

test('four tracks have distinct destinations and twelve valid switches', () => {
  assert.equal(TRACKS.length, 4);
  assert.equal(new Set(DESTINATIONS.map((stop) => stop.track)).size, 4);
  const layout = createLayout();
  assert.equal(layout.connections.length, 12);
  assert.equal(Object.keys(layout.stops).length, 4);
  for (const connection of layout.connections) {
    assert.ok(TRACKS.includes(connection.source));
    assert.ok(TRACKS.includes(connection.target));
    assert.notEqual(connection.source, connection.target);
    assert.ok(connection.x + 80 < 820, 'switch completes before arrival');
  }
});

test('every destination is reachable from every entry before the arrival point', () => {
  const { connections } = createLayout();
  const columns = [...new Set(connections.map((connection) => connection.x))].sort((a, b) => a - b);
  for (const entry of TRACKS) {
    let reachable = new Set([entry]);
    for (const x of columns) {
      const previous = new Set(reachable);
      for (const connection of connections.filter((candidate) => candidate.x === x)) {
        if (previous.has(connection.source)) reachable.add(connection.target);
      }
    }
    for (const destination of DESTINATIONS) {
      assert.ok(reachable.has(destination.track), `${entry} cannot reach ${destination.name}`);
    }
  }
});

test('72 pixel switch touch areas do not overlap', () => {
  const { connections } = createLayout();
  for (let left = 0; left < connections.length; left++) {
    for (let right = left + 1; right < connections.length; right++) {
      const a = connections[left];
      const b = connections[right];
      assert.ok(Math.abs(a.x - b.x) >= 72 || Math.abs(TRACK_Y[a.source] - TRACK_Y[b.source]) >= 72);
    }
  }
});
