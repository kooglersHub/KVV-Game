import type { TrackPosition } from '../types';

export { DESTINATIONS } from '../config/network.config';

export class DispatchRules {
  score = 0;
  streak = 0;
  delivered = 0;
  mistakes = 0;

  arrive(actual: TrackPosition, target: TrackPosition): number {
    if (actual !== target) {
      this.streak = 0;
      this.mistakes++;
      return 0;
    }
    this.streak++;
    this.delivered++;
    const points = 10 * Math.min(3, 1 + Math.floor((this.streak - 1) / 3));
    this.score += points;
    return points;
  }
}

export function trafficAt(elapsed: number): {
  interval: number;
  speed: number;
  name: string;
} {
  if (elapsed < 25) return { interval: 6500, speed: 0.65, name: 'Einfahren' };
  if (elapsed < 55) return { interval: 4200, speed: 0.8, name: 'Stadtverkehr' };
  return { interval: 3000, speed: 0.95, name: 'Feierabendverkehr' };
}
