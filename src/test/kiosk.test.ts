import { describe, expect, it } from 'vitest';
import {
  ARRIVAL_X,
  createKioskLayout,
  KIOSK_DISPLAY,
  ROUND_SECONDS,
  SWITCH_COLUMNS,
} from '../config/kiosk.config';
import { ACTIVE_TRACKS, DESTINATIONS } from '../config/network.config';
import { GAME_CONFIG } from '../config/game.config';

describe('Touch kiosk layout', () => {
  it('includes four destinations and twelve switches', () => {
    expect(DESTINATIONS).toHaveLength(4);
    expect(createKioskLayout().connections).toHaveLength(12);
  });

  it('lets every entry track reach every destination', () => {
    const layout = createKioskLayout();
    for (const entry of ACTIVE_TRACKS) {
      let reachable = new Set<string>([entry]);
      for (const column of SWITCH_COLUMNS) {
        const next = new Set(reachable);
        for (const connection of layout.connections.filter(
          (item) => item.x === column,
        )) {
          if (reachable.has(connection.source)) next.add(connection.target);
        }
        reachable = next;
      }
      expect([...reachable].sort()).toEqual([...ACTIVE_TRACKS]);
    }
  });
  it('provides an escape switch on every active track before the stations', () => {
    const layout = createKioskLayout();
    for (const track of ACTIVE_TRACKS) {
      const exits = layout.connections.filter(
        (connection) => connection.source === track,
      );
      expect(exits.length).toBeGreaterThan(0);
      expect(exits.some((connection) => connection.x + 80 < ARRIVAL_X)).toBe(
        true,
      );
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
      expect(station.x).toBeGreaterThan(SWITCH_COLUMNS[3] + 80);
      expect(station.x).toBeLessThan(GAME_CONFIG.width - 36);
      expect(station.duration).toBeLessThanOrEqual(2500);
    }
  });

  it('fills a portrait kiosk with room for the header and touch controls', () => {
    expect(KIOSK_DISPLAY.width / KIOSK_DISPLAY.height).toBe(3 / 4);
    expect(GAME_CONFIG.width).toBe(KIOSK_DISPLAY.width);
    expect(88 + GAME_CONFIG.height + 232).toBe(KIOSK_DISPLAY.height);
  });
});
