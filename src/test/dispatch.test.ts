import { describe, expect, it } from 'vitest';
import { DispatchRules, trafficAt } from '../systems/DispatchRules';

describe('Dispatch scoring', () => {
  it('rewards correct arrivals with capped streak bonuses', () => {
    const rules = new DispatchRules();
    const rewards = Array.from({ length: 10 }, () =>
      rules.arrive('track2', 'track2'),
    );
    expect(rewards).toEqual([10, 10, 10, 20, 20, 20, 30, 30, 30, 30]);
    expect(rules.delivered).toBe(10);
    expect(rules.score).toBe(210);
  });
  it('counts wrong destinations once per arrival and resets the bonus', () => {
    const rules = new DispatchRules();
    for (let i = 0; i < 4; i++) rules.arrive('track2', 'track2');
    expect(rules.arrive('track3', 'track2')).toBe(0);
    expect(rules.mistakes).toBe(1);
    expect(rules.streak).toBe(0);
    expect(rules.arrive('track4', 'track4')).toBe(10);
  });
  it('increases traffic independently of the score', () => {
    expect(trafficAt(0).interval).toBe(6500);
    expect(trafficAt(24).interval).toBe(6500);
    expect(trafficAt(25).interval).toBe(4200);
    expect(trafficAt(54).interval).toBe(4200);
    expect(trafficAt(55).interval).toBe(3000);
    expect(trafficAt(90).speed).toBe(0.95);
  });
});
