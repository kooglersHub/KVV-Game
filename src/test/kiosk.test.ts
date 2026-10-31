import { describe, expect, it } from 'vitest';
import { createKioskLayout, ROUND_SECONDS } from '../config/kiosk.config';
import { GAME_CONFIG } from '../config/game.config';

describe('Touch kiosk layout', () => {
  it('provides an escape switch on every active track before the stations', () => {
    const layout = createKioskLayout();
    for (const track of ['track2', 'track3', 'track4']) {
      const exits = layout.connections.filter(
        (connection) => connection.source === track,
      );
      expect(exits.length).toBeGreaterThan(0);
      expect(exits.some((connection) => connection.x + 80 < 820)).toBe(true);
    }
    for (const connection of layout.connections) {
      expect(connection.x).toBeGreaterThan(36);
      expect(connection.x + 80).toBeLessThan(GAME_CONFIG.width - 36);
    }
  });

  it('keeps 72 pixel touch targets apart and inside the board', () => {
    const points = createKioskLayout().connections;
    points.forEach((point, index) => {
      const y = GAME_CONFIG.physics.tracks[point.source];
      expect(y - 36).toBeGreaterThan(0);
      expect(y + 36).toBeLessThan(GAME_CONFIG.height);
      points.slice(index + 1).forEach((other) => {
        expect(
          Math.hypot(
            point.x - other.x,
            y - GAME_CONFIG.physics.tracks[other.source],
          ),
        ).toBeGreaterThanOrEqual(72);
      });
    });
  });

  it('uses a short round and stations beyond the last diversion', () => {
    expect(ROUND_SECONDS).toBe(90);
    for (const station of Object.values(createKioskLayout().stops)) {
      expect(station.x).toBeGreaterThan(760);
      expect(station.x).toBeLessThan(GAME_CONFIG.width - 90);
      expect(station.duration).toBeLessThanOrEqual(2500);
    }
  });
});
