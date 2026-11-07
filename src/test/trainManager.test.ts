import { beforeEach, describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
import { TrainManager } from '../systems/TrainManager';
import { Train } from '../entities/Train';
import { INTRO_TRAIN, DESTINATIONS } from '../config/network.config';
import { createKioskLayout } from '../config/kiosk.config';

function createManager() {
  const timers: {
    delay: number;
    paused: boolean;
    destroy: ReturnType<typeof vi.fn>;
  }[] = [];
  const group = { add: vi.fn(), remove: vi.fn(), clear: vi.fn() };
  const scene = {
    add: { existing: vi.fn() },
    physics: {
      add: {
        group: () => group,
        existing: (train: Train) => {
          train.body = {
            setVelocityX: vi.fn(),
          } as unknown as Phaser.Physics.Arcade.Body;
        },
      },
    },
    time: {
      delayedCall: vi.fn(),
      addEvent: (settings: { delay: number }) => {
        const timer = { ...settings, paused: false, destroy: vi.fn() };
        timers.push(timer);
        return timer;
      },
    },
  };
  return {
    manager: new TrainManager(scene as unknown as Phaser.Scene),
    timers,
    group,
  };
}

beforeEach(() => Train.setGeneratedStops({}));

describe('Combined destination-aware traffic', () => {
  it('reserves a visible slow introduction before rendering', () => {
    const { manager } = createManager();
    manager.updateSpeedMultiplier(0.65);
    manager.startSpawning(6500, INTRO_TRAIN);
    const [train] = manager.getTrains();
    expect(train.x).toBe(INTRO_TRAIN.x);
    expect(train.getCurrentTrack()).toBe(INTRO_TRAIN.track);
    expect(train.getData('destination')).toBe(1);
    const point = createKioskLayout().connections.find(
      (item) => item.source === INTRO_TRAIN.track,
    )!;
    expect((point.x - train.x) / (train.getSpeed() * 0.65)).toBeGreaterThan(
      3.5,
    );
  });

  it('keeps introduction spawning paused when traffic phases change', () => {
    const { manager, timers } = createManager();
    manager.startSpawning(6500, INTRO_TRAIN);
    manager.pauseSpawning();
    manager.updateSpawnInterval(4200);
    expect(timers[0].destroy).toHaveBeenCalledOnce();
    expect(timers[1].paused).toBe(true);
    manager.resumeSpawning();
    expect(timers[1].paused).toBe(false);
    manager.updateSpawnInterval(4200);
    expect(timers).toHaveLength(2);
  });

  it('preserves destination quotas and speed caps over consecutive spawns', () => {
    const { manager } = createManager();
    for (let step = 0; step < 400; step++) {
      const previous = [...manager.getTrains()];
      manager.startSpawning(6500);
      for (const train of manager
        .getTrains()
        .filter((candidate) => !previous.includes(candidate))) {
        const target = train.getData('destination') as number;
        expect(Number.isInteger(target)).toBe(true);
        expect(DESTINATIONS[target].track).not.toBe(train.getCurrentTrack());
        const matching = previous.filter(
          (candidate) => candidate.getData('destination') === target,
        );
        expect(matching.length).toBeLessThan(2);
        expect(
          matching.every(
            (candidate) => train.getSpeed() <= candidate.getSpeed(),
          ),
        ).toBe(true);
      }
      manager.getTrains().forEach((train) => {
        train.x += 50;
      });
      manager.update();
    }
  });

  it('retains arrived trams until they leave the map and then frees capacity', () => {
    const { manager, group } = createManager();
    for (const [destination, stop] of DESTINATIONS.entries()) {
      for (let index = 0; index < 2; index++)
        manager.startSpawning(6500, {
          x: 760,
          track: stop.track,
          speed: 100,
          destination,
        });
    }
    manager.startSpawning(6500);
    expect(manager.getTrains()).toHaveLength(8);
    manager.getTrains()[0].x = 1000;
    manager.update();
    expect(group.remove).toHaveBeenCalledOnce();
    manager.startSpawning(6500);
    expect(manager.getTrains()).toHaveLength(8);
    expect(manager.getTrains().at(-1)?.getData('destination')).toBe(0);
  });

  it('stops and clears the timer and all trams', () => {
    const { manager, timers, group } = createManager();
    manager.startSpawning(6500);
    manager.clear();
    expect(timers[0].destroy).toHaveBeenCalledOnce();
    expect(group.clear).toHaveBeenCalledWith(false, false);
    expect(manager.getTrains()).toHaveLength(0);
    manager.updateSpawnInterval(3000);
    expect(timers).toHaveLength(1);
  });
});
