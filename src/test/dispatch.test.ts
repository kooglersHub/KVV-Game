import { describe, expect, it } from 'vitest';
import { DispatchRules, trafficAt } from '../systems/DispatchRules';

describe('Dispatch scoring', () => {
  it('rewards correct arrivals with capped streak bonuses', () => {
    const rules = new DispatchRules();
    const rewards = Array.from({ length: 10 }, () =>
      rules.arrive('track2', 'track2'),
    );
    expect(rewards).toEqual([10, 20, 30, 40, 50, 50, 50, 50, 50, 50]);
    expect(rules.delivered).toBe(10);
    expect(rules.score).toBe(400);
  });
  it('counts wrong destinations once per arrival and resets the bonus', () => {
    const rules = new DispatchRules();
    for (let i = 0; i < 4; i++) rules.arrive('track2', 'track2');
    expect(rules.arrive('track3', 'track2')).toBe(0);
    expect(rules.mistakes).toBe(1);
    expect(rules.streak).toBe(0);
    expect(rules.arrive('track4', 'track4')).toBe(10);
  });
  it('keeps the first half quiet and accelerates smoothly afterwards', () => {
    expect(trafficAt(0).interval).toBe(6500);
    expect(trafficAt(44).interval).toBe(6500);
    expect(trafficAt(45).interval).toBe(5500);
    expect(trafficAt(74).interval).toBe(5500);
    expect(trafficAt(75).interval).toBe(4800);
    expect(trafficAt(0).speed).toBe(0.65);
    expect(trafficAt(44).speed).toBe(0.65);
    expect(trafficAt(90).speed).toBe(0.8);
    for (let second = 1; second <= 100; second++) {
      const increase = trafficAt(second).speed - trafficAt(second - 1).speed;
      expect(increase).toBeGreaterThanOrEqual(0);
      expect(increase).toBeLessThan(0.004);
    }
  });
});
