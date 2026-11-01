import { describe, expect, it } from 'vitest';
import { RoundClock } from '../systems/RoundClock';

describe('Preparation and shift timing', () => {
  it('gives five full seconds of preparation without consuming the round', () => {
    const clock = new RoundClock();
    for (let second = 5; second > 0; second--) {
      expect(clock.preparing).toBe(true);
      expect(clock.preparation).toBe(second);
      clock.tick();
      expect(clock.remaining).toBe(90);
      expect(clock.elapsed).toBe(0);
    }
    expect(clock.preparing).toBe(false);
    clock.tick();
    expect(clock.remaining).toBe(89);
    expect(clock.elapsed).toBe(1);
  });

  it('ends the shift at zero and never produces negative time', () => {
    const clock = new RoundClock();
    for (let second = 0; second < 120; second++) clock.tick();
    expect(clock.remaining).toBe(0);
    expect(clock.elapsed).toBe(90);
    expect(clock.preparation).toBe(0);
  });
});
